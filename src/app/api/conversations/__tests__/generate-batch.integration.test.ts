/**
 * Batch Generation API Integration Tests
 * 
 * Tests for POST /api/conversations/generate-batch endpoint
 */

import { POST, GET } from '../generate-batch/route';
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

describe('POST /api/conversations/generate-batch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Request Validation', () => {
    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/conversations/generate-batch', {
        method: 'POST',
        body: JSON.stringify({
          // Missing name and parameterSets
          userId: 'user-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 400 for empty parameterSets', async () => {
      const request = new NextRequest('http://localhost:3000/api/conversations/generate-batch', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Batch',
          parameterSets: [],
          userId: 'user-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('parameter');
    });

    it('should accept valid batch request', async () => {
      const mockJobId = 'job-123';

      jest.spyOn(supabase, 'from').mockImplementation(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: mockJobId,
            name: 'Test Batch',
            status: 'queued',
            progress: {
              total: 2,
              completed: 0,
            },
          },
          error: null,
        }),
      } as any));

      const request = new NextRequest('http://localhost:3000/api/conversations/generate-batch', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Batch',
          parameterSets: [
            {
              templateId: '123e4567-e89b-12d3-a456-426614174000',
              parameters: { persona: 'Test 1' },
              tier: 'template',
            },
            {
              templateId: '123e4567-e89b-12d3-a456-426614174001',
              parameters: { persona: 'Test 2' },
              tier: 'scenario',
            },
          ],
          userId: 'user-123',
          concurrentProcessing: 2,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.jobId).toBe(mockJobId);
    });
  });

  describe('Configuration Options', () => {
    it('should accept concurrency settings', async () => {
      jest.spyOn(supabase, 'from').mockImplementation(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'job-123', status: 'queued' },
          error: null,
        }),
      } as any));

      const request = new NextRequest('http://localhost:3000/api/conversations/generate-batch', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Batch',
          parameterSets: [
            {
              templateId: '123e4567-e89b-12d3-a456-426614174000',
              parameters: {},
              tier: 'template',
            },
          ],
          userId: 'user-123',
          concurrentProcessing: 5,
          errorHandling: 'continue',
          priority: 'high',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.configuration).toBeDefined();
    });

    it('should accept shared parameters', async () => {
      jest.spyOn(supabase, 'from').mockImplementation(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'job-123', status: 'queued' },
          error: null,
        }),
      } as any));

      const request = new NextRequest('http://localhost:3000/api/conversations/generate-batch', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Batch',
          parameterSets: [
            {
              templateId: '123e4567-e89b-12d3-a456-426614174000',
              parameters: { persona: 'Test' },
              tier: 'template',
            },
          ],
          sharedParameters: {
            emotion: 'Neutral',
            context: 'Testing',
          },
          userId: 'user-123',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
    });
  });

  describe('Cost Estimation', () => {
    it('should return cost estimate for batch', async () => {
      jest.spyOn(supabase, 'from').mockImplementation(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'job-123', status: 'queued' },
          error: null,
        }),
      } as any));

      const request = new NextRequest('http://localhost:3000/api/conversations/generate-batch', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Batch',
          parameterSets: [
            {
              templateId: '123e4567-e89b-12d3-a456-426614174000',
              parameters: {},
              tier: 'template',
            },
            {
              templateId: '123e4567-e89b-12d3-a456-426614174001',
              parameters: {},
              tier: 'edge_case',
            },
          ],
          userId: 'user-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.estimatedCost).toBeDefined();
      expect(data.estimatedCost).toBeGreaterThan(0);
      expect(data.estimatedTime).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      jest.spyOn(supabase, 'from').mockImplementation(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      } as any));

      const request = new NextRequest('http://localhost:3000/api/conversations/generate-batch', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Batch',
          parameterSets: [
            {
              templateId: '123e4567-e89b-12d3-a456-426614174000',
              parameters: {},
              tier: 'template',
            },
          ],
          userId: 'user-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });
});

describe('GET /api/conversations/generate-batch', () => {
  it('should return API information', async () => {
    const request = new NextRequest('http://localhost:3000/api/conversations/generate-batch', {
      method: 'GET',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.info).toBeDefined();
  });
});

