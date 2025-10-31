/**
 * Conversation Generation API Integration Tests
 * 
 * Tests for POST /api/conversations/generate endpoint
 * with actual database and API interactions
 */

import { POST, GET } from '../generate/route';
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

// Mock environment
process.env.ANTHROPIC_API_KEY = 'test-api-key';

describe('POST /api/conversations/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Request Validation', () => {
    it('should return 400 for missing templateId', async () => {
      const request = new NextRequest('http://localhost:3000/api/conversations/generate', {
        method: 'POST',
        body: JSON.stringify({
          parameters: { persona: 'Test' },
          tier: 'template',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid request');
    });

    it('should return 400 for invalid tier', async () => {
      const request = new NextRequest('http://localhost:3000/api/conversations/generate', {
        method: 'POST',
        body: JSON.stringify({
          templateId: '123e4567-e89b-12d3-a456-426614174000',
          parameters: {},
          tier: 'invalid_tier',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request');
    });

    it('should return 400 for invalid UUID format', async () => {
      const request = new NextRequest('http://localhost:3000/api/conversations/generate', {
        method: 'POST',
        body: JSON.stringify({
          templateId: 'not-a-uuid',
          parameters: {},
          tier: 'template',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.details).toBeDefined();
    });

    it('should accept valid request with all fields', async () => {
      // Mock successful generation
      const mockConversation = {
        id: 'conv-123',
        actualCostUsd: 0.05,
        qualityScore: 85,
        totalTurns: 4,
        totalTokens: 500,
        generationDurationMs: 2000,
      };

      // Mock Supabase responses
      jest.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'templates') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { id: 'template-123', content: 'Test', system_prompt: 'Test' },
              error: null,
            }),
          } as any;
        }
        return {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockConversation,
            error: null,
          }),
        } as any;
      });

      const request = new NextRequest('http://localhost:3000/api/conversations/generate', {
        method: 'POST',
        body: JSON.stringify({
          templateId: '123e4567-e89b-12d3-a456-426614174000',
          parameters: { persona: 'Test', emotion: 'Happy' },
          tier: 'template',
          userId: 'user-123',
          temperature: 0.7,
          maxTokens: 2000,
          category: ['finance', 'advice'],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.conversation).toBeDefined();
    });
  });

  describe('Generation Flow', () => {
    it('should generate conversation and return quality metrics', async () => {
      const mockConversation = {
        id: 'conv-123',
        actualCostUsd: 0.05,
        qualityScore: 85,
        totalTurns: 4,
        totalTokens: 500,
        generationDurationMs: 2000,
      };

      jest.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'templates') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { id: 'template-123', content: 'Test', system_prompt: 'Test' },
              error: null,
            }),
          } as any;
        }
        return {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockConversation,
            error: null,
          }),
        } as any;
      });

      const request = new NextRequest('http://localhost:3000/api/conversations/generate', {
        method: 'POST',
        body: JSON.stringify({
          templateId: '123e4567-e89b-12d3-a456-426614174000',
          parameters: { persona: 'Anxious Investor' },
          tier: 'template',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.conversation.id).toBe('conv-123');
      expect(data.cost).toBe(0.05);
      expect(data.qualityMetrics).toEqual({
        qualityScore: 85,
        turnCount: 4,
        tokenCount: 500,
        durationMs: 2000,
      });
    });

    it('should return 500 if generation fails', async () => {
      // Mock template found but generation fails
      jest.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'templates') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Template not found' },
            }),
          } as any;
        }
        return {} as any;
      });

      const request = new NextRequest('http://localhost:3000/api/conversations/generate', {
        method: 'POST',
        body: JSON.stringify({
          templateId: '123e4567-e89b-12d3-a456-426614174000',
          parameters: {},
          tier: 'template',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should return 500 if ANTHROPIC_API_KEY is missing', async () => {
      const originalApiKey = process.env.ANTHROPIC_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;

      const request = new NextRequest('http://localhost:3000/api/conversations/generate', {
        method: 'POST',
        body: JSON.stringify({
          templateId: '123e4567-e89b-12d3-a456-426614174000',
          parameters: {},
          tier: 'template',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('AI service not configured');
      expect(data.details).toContain('ANTHROPIC_API_KEY');

      process.env.ANTHROPIC_API_KEY = originalApiKey;
    });
  });

  describe('Optional Parameters', () => {
    it('should use default userId if not provided', async () => {
      const mockConversation = { id: 'conv-123', actualCostUsd: 0.05 };

      jest.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'templates') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { id: 'template-123', content: 'Test', system_prompt: 'Test' },
              error: null,
            }),
          } as any;
        }
        return {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockConversation,
            error: null,
          }),
        } as any;
      });

      const request = new NextRequest('http://localhost:3000/api/conversations/generate', {
        method: 'POST',
        body: JSON.stringify({
          templateId: '123e4567-e89b-12d3-a456-426614174000',
          parameters: {},
          tier: 'template',
          // userId not provided
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('should apply custom temperature and maxTokens', async () => {
      const mockConversation = { id: 'conv-123', actualCostUsd: 0.05 };

      jest.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'templates') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { id: 'template-123', content: 'Test', system_prompt: 'Test' },
              error: null,
            }),
          } as any;
        }
        return {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockConversation,
            error: null,
          }),
        } as any;
      });

      const request = new NextRequest('http://localhost:3000/api/conversations/generate', {
        method: 'POST',
        body: JSON.stringify({
          templateId: '123e4567-e89b-12d3-a456-426614174000',
          parameters: {},
          tier: 'template',
          temperature: 0.9,
          maxTokens: 4000,
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
    });
  });
});

describe('GET /api/conversations/generate', () => {
  it('should return API information', async () => {
    const request = new NextRequest('http://localhost:3000/api/conversations/generate', {
      method: 'GET',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.info).toBeDefined();
    expect(data.info.endpoint).toBe('POST /api/conversations/generate');
    expect(data.info.requiredFields).toContain('templateId');
  });
});

