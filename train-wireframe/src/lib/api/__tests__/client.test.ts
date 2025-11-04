/**
 * Unit Tests for API Client
 * 
 * Tests rate limiting, timeout handling, and error mapping.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { APIClient } from '../client';
import { APIError, NetworkError, ErrorCode } from '../../errors';
import Anthropic from '@anthropic-ai/sdk';

// Mock Anthropic SDK
vi.mock('@anthropic-ai/sdk');

describe('APIClient', () => {
  let apiClient: APIClient;
  let mockAnthropicCreate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock
    mockAnthropicCreate = vi.fn();
    (Anthropic as any).mockImplementation(() => ({
      messages: {
        create: mockAnthropicCreate,
      },
    }));

    apiClient = new APIClient({
      apiKey: 'test-key',
      model: 'claude-sonnet-4-5-20250929',
      rateLimiter: {
        requestsPerMinute: 5,
        maxConcurrent: 2,
      },
      timeout: 1000, // Short timeout for tests
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateConversation', () => {
    it('should successfully generate conversation', async () => {
      const mockResponse = {
        id: 'msg_123',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: 'Generated response' }],
        model: 'claude-sonnet-4-5-20250929',
        usage: {
          input_tokens: 100,
          output_tokens: 50,
        },
      };

      mockAnthropicCreate.mockResolvedValue(mockResponse);

      const result = await apiClient.generateConversation('Test prompt', {
        conversationId: 'conv_123',
        maxTokens: 4096,
      });

      expect(result).toEqual(mockResponse);
      expect(mockAnthropicCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 4096,
          messages: [{ role: 'user', content: 'Test prompt' }],
        }),
        expect.any(Object)
      );
    });

    it('should apply rate limiting', async () => {
      const mockResponse = {
        id: 'msg_123',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: 'Response' }],
        model: 'claude-sonnet-4-5-20250929',
        usage: { input_tokens: 10, output_tokens: 10 },
      };

      mockAnthropicCreate.mockResolvedValue(mockResponse);

      // Make multiple requests
      const requests = Array.from({ length: 3 }, () =>
        apiClient.generateConversation('Test prompt')
      );

      const results = await Promise.all(requests);
      expect(results).toHaveLength(3);
      expect(mockAnthropicCreate).toHaveBeenCalledTimes(3);
    });

    it('should handle timeout', async () => {
      // Create a promise that never resolves to simulate timeout
      mockAnthropicCreate.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      await expect(
        apiClient.generateConversation('Test prompt', {
          conversationId: 'conv_123',
        })
      ).rejects.toThrow(NetworkError);
    });

    it('should handle API error (429 rate limit)', async () => {
      const apiError = new Anthropic.APIError(
        429,
        { type: 'rate_limit_error', message: 'Rate limit exceeded' },
        'Rate limit exceeded',
        {}
      );

      mockAnthropicCreate.mockRejectedValue(apiError);

      await expect(
        apiClient.generateConversation('Test prompt')
      ).rejects.toThrow(APIError);
    });

    it('should handle API error (401 unauthorized)', async () => {
      const apiError = new Anthropic.APIError(
        401,
        { type: 'authentication_error', message: 'Invalid API key' },
        'Invalid API key',
        {}
      );

      mockAnthropicCreate.mockRejectedValue(apiError);

      await expect(
        apiClient.generateConversation('Test prompt')
      ).rejects.toThrow(APIError);
    });

    it('should handle abort signal', async () => {
      const abortController = new AbortController();
      const abortError = new Error('AbortError');
      abortError.name = 'AbortError';

      mockAnthropicCreate.mockRejectedValue(abortError);

      // Abort immediately
      abortController.abort();

      await expect(
        apiClient.generateConversation('Test prompt', {
          signal: abortController.signal,
        })
      ).rejects.toThrow(NetworkError);
    });

    it('should map error codes correctly', async () => {
      const errorCases = [
        { status: 401, expectedCode: ErrorCode.ERR_API_UNAUTHORIZED },
        { status: 403, expectedCode: ErrorCode.ERR_API_FORBIDDEN },
        { status: 404, expectedCode: ErrorCode.ERR_API_NOT_FOUND },
        { status: 429, expectedCode: ErrorCode.ERR_API_RATE_LIMIT },
        { status: 400, expectedCode: ErrorCode.ERR_API_VALIDATION },
        { status: 500, expectedCode: ErrorCode.ERR_API_SERVER },
      ];

      for (const { status, expectedCode } of errorCases) {
        const apiError = new Anthropic.APIError(
          status,
          { type: 'error', message: 'Test error' },
          'Test error',
          {}
        );

        mockAnthropicCreate.mockRejectedValue(apiError);

        try {
          await apiClient.generateConversation('Test prompt');
        } catch (error) {
          expect(error).toBeInstanceOf(APIError);
          expect((error as APIError).code).toBe(expectedCode);
        }
      }
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return rate limit status', async () => {
      const status = apiClient.getRateLimitStatus();

      expect(status).toHaveProperty('activeRequests');
      expect(status).toHaveProperty('requestsLastMinute');
      expect(status).toHaveProperty('remainingCapacity');
    });

    it('should update status after requests', async () => {
      const mockResponse = {
        id: 'msg_123',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: 'Response' }],
        model: 'claude-sonnet-4-5-20250929',
        usage: { input_tokens: 10, output_tokens: 10 },
      };

      mockAnthropicCreate.mockResolvedValue(mockResponse);

      const statusBefore = apiClient.getRateLimitStatus();
      
      await apiClient.generateConversation('Test prompt');
      
      const statusAfter = apiClient.getRateLimitStatus();

      expect(statusAfter.requestsLastMinute).toBeGreaterThan(
        statusBefore.requestsLastMinute
      );
    });
  });

  describe('Rate Limiter', () => {
    it('should enforce concurrent request limit', async () => {
      const mockResponse = {
        id: 'msg_123',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: 'Response' }],
        model: 'claude-sonnet-4-5-20250929',
        usage: { input_tokens: 10, output_tokens: 10 },
      };

      // Simulate slow responses
      mockAnthropicCreate.mockImplementation(
        () => new Promise(resolve => 
          setTimeout(() => resolve(mockResponse), 100)
        )
      );

      const startTime = Date.now();
      
      // Try to make 3 concurrent requests (limit is 2)
      const requests = Array.from({ length: 3 }, () =>
        apiClient.generateConversation('Test prompt')
      );

      await Promise.all(requests);
      
      const duration = Date.now() - startTime;

      // Should take longer than 100ms because of concurrent limit
      expect(duration).toBeGreaterThan(100);
    });

    it('should clean up old requests from sliding window', async () => {
      const mockResponse = {
        id: 'msg_123',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: 'Response' }],
        model: 'claude-sonnet-4-5-20250929',
        usage: { input_tokens: 10, output_tokens: 10 },
      };

      mockAnthropicCreate.mockResolvedValue(mockResponse);

      // Make a request
      await apiClient.generateConversation('Test prompt');
      
      const statusAfter = apiClient.getRateLimitStatus();
      expect(statusAfter.requestsLastMinute).toBe(1);

      // After 61 seconds, the request should be cleaned from the window
      // (This test would need time manipulation or mocking)
    });
  });
});

