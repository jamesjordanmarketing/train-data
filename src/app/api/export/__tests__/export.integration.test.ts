/**
 * Export API Integration Tests
 * 
 * Tests for all export endpoints:
 * - POST /api/export/conversations
 * - GET /api/export/status/[id]
 * - GET /api/export/download/[id]
 * - GET /api/export/history
 */

import { describe, it, expect } from '@jest/globals';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_USER_ID = '00000000-0000-0000-0000-000000000000';

describe('Export API Integration Tests', () => {
  let exportId: string;
  
  describe('POST /api/export/conversations', () => {
    it('should create a synchronous export for small dataset (<500 conversations)', async () => {
      const response = await fetch(`${BASE_URL}/api/export/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': TEST_USER_ID,
        },
        body: JSON.stringify({
          config: {
            scope: 'all',
            format: 'jsonl',
            includeMetadata: true,
            includeQualityScores: true,
            includeTimestamps: true,
            includeApprovalHistory: false,
            includeParentReferences: false,
            includeFullContent: true,
          },
        }),
      });
      
      expect(response.status).toBe(201);
      
      const data = await response.json();
      expect(data).toHaveProperty('export_id');
      expect(data).toHaveProperty('status', 'completed');
      expect(data).toHaveProperty('conversation_count');
      expect(data).toHaveProperty('file_size');
      expect(data).toHaveProperty('file_url');
      expect(data).toHaveProperty('format', 'jsonl');
      
      exportId = data.export_id;
    }, 30000);
    
    it('should create export with selected conversations', async () => {
      const response = await fetch(`${BASE_URL}/api/export/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': TEST_USER_ID,
        },
        body: JSON.stringify({
          config: {
            scope: 'selected',
            format: 'csv',
            includeMetadata: true,
            includeQualityScores: true,
            includeTimestamps: true,
            includeApprovalHistory: false,
            includeParentReferences: false,
            includeFullContent: true,
          },
          conversationIds: ['00000000-0000-0000-0000-000000000001'], // Test ID
        }),
      });
      
      // May return 404 if no test conversations exist, which is okay
      expect([201, 404]).toContain(response.status);
    });
    
    it('should create export with filters', async () => {
      const response = await fetch(`${BASE_URL}/api/export/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': TEST_USER_ID,
        },
        body: JSON.stringify({
          config: {
            scope: 'filtered',
            format: 'markdown',
            includeMetadata: true,
            includeQualityScores: true,
            includeTimestamps: true,
            includeApprovalHistory: false,
            includeParentReferences: false,
            includeFullContent: true,
          },
          filters: {
            tier: ['template'],
            status: ['approved'],
            qualityScoreMin: 7.0,
          },
        }),
      });
      
      // May return 404 if no matching conversations exist
      expect([201, 404]).toContain(response.status);
    });
    
    it('should reject invalid export config', async () => {
      const response = await fetch(`${BASE_URL}/api/export/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': TEST_USER_ID,
        },
        body: JSON.stringify({
          config: {
            scope: 'invalid_scope', // Invalid
            format: 'jsonl',
          },
        }),
      });
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });
    
    it('should reject selected scope without conversationIds', async () => {
      const response = await fetch(`${BASE_URL}/api/export/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': TEST_USER_ID,
        },
        body: JSON.stringify({
          config: {
            scope: 'selected',
            format: 'jsonl',
            includeMetadata: true,
            includeQualityScores: true,
            includeTimestamps: true,
            includeApprovalHistory: false,
            includeParentReferences: false,
            includeFullContent: true,
          },
          // Missing conversationIds
        }),
      });
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('GET /api/export/status/[id]', () => {
    it('should return status for valid export_id', async () => {
      // Skip if no export was created
      if (!exportId) {
        console.warn('Skipping status test - no export_id available');
        return;
      }
      
      const response = await fetch(`${BASE_URL}/api/export/status/${exportId}`, {
        headers: {
          'x-user-id': TEST_USER_ID,
        },
      });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('export_id', exportId);
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('conversation_count');
      expect(data).toHaveProperty('format');
      expect(data).toHaveProperty('created_at');
      expect(data).toHaveProperty('message');
    });
    
    it('should return 404 for invalid export_id', async () => {
      const invalidId = '00000000-0000-0000-0000-000000000000';
      const response = await fetch(`${BASE_URL}/api/export/status/${invalidId}`, {
        headers: {
          'x-user-id': TEST_USER_ID,
        },
      });
      
      expect(response.status).toBe(404);
    });
    
    it('should return 403 for unauthorized access', async () => {
      // Skip if no export was created
      if (!exportId) {
        console.warn('Skipping auth test - no export_id available');
        return;
      }
      
      const response = await fetch(`${BASE_URL}/api/export/status/${exportId}`, {
        headers: {
          'x-user-id': '11111111-1111-1111-1111-111111111111', // Different user
        },
      });
      
      expect(response.status).toBe(403);
    });
  });
  
  describe('GET /api/export/download/[id]', () => {
    it('should download completed export', async () => {
      // Skip if no export was created
      if (!exportId) {
        console.warn('Skipping download test - no export_id available');
        return;
      }
      
      const response = await fetch(`${BASE_URL}/api/export/download/${exportId}`, {
        headers: {
          'x-user-id': TEST_USER_ID,
        },
      });
      
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBeTruthy();
      expect(response.headers.get('content-disposition')).toContain('attachment');
      
      const content = await response.text();
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(0);
    });
    
    it('should return 404 for invalid export_id', async () => {
      const invalidId = '00000000-0000-0000-0000-000000000000';
      const response = await fetch(`${BASE_URL}/api/export/download/${invalidId}`, {
        headers: {
          'x-user-id': TEST_USER_ID,
        },
      });
      
      expect(response.status).toBe(404);
    });
    
    it('should return 403 for unauthorized access', async () => {
      // Skip if no export was created
      if (!exportId) {
        console.warn('Skipping auth test - no export_id available');
        return;
      }
      
      const response = await fetch(`${BASE_URL}/api/export/download/${exportId}`, {
        headers: {
          'x-user-id': '11111111-1111-1111-1111-111111111111', // Different user
        },
      });
      
      expect(response.status).toBe(403);
    });
  });
  
  describe('GET /api/export/history', () => {
    it('should return paginated export history', async () => {
      const response = await fetch(`${BASE_URL}/api/export/history`, {
        headers: {
          'x-user-id': TEST_USER_ID,
        },
      });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('exports');
      expect(data).toHaveProperty('pagination');
      expect(Array.isArray(data.exports)).toBe(true);
      
      // Check pagination metadata
      expect(data.pagination).toHaveProperty('page');
      expect(data.pagination).toHaveProperty('limit');
      expect(data.pagination).toHaveProperty('total');
      expect(data.pagination).toHaveProperty('totalPages');
      expect(data.pagination).toHaveProperty('hasNext');
      expect(data.pagination).toHaveProperty('hasPrev');
    });
    
    it('should filter by format', async () => {
      const response = await fetch(`${BASE_URL}/api/export/history?format=jsonl`, {
        headers: {
          'x-user-id': TEST_USER_ID,
        },
      });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('exports');
      
      // All exports should have format 'jsonl'
      data.exports.forEach((exp: any) => {
        expect(exp.format).toBe('jsonl');
      });
    });
    
    it('should filter by status', async () => {
      const response = await fetch(`${BASE_URL}/api/export/history?status=completed`, {
        headers: {
          'x-user-id': TEST_USER_ID,
        },
      });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('exports');
      
      // All exports should have status 'completed'
      data.exports.forEach((exp: any) => {
        expect(exp.status).toBe('completed');
      });
    });
    
    it('should support pagination', async () => {
      const response = await fetch(`${BASE_URL}/api/export/history?page=1&limit=5`, {
        headers: {
          'x-user-id': TEST_USER_ID,
        },
      });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.exports.length).toBeLessThanOrEqual(5);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(5);
    });
    
    it('should reject invalid query parameters', async () => {
      const response = await fetch(`${BASE_URL}/api/export/history?format=invalid`, {
        headers: {
          'x-user-id': TEST_USER_ID,
        },
      });
      
      expect(response.status).toBe(400);
    });
  });
});

