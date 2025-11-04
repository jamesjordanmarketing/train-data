/**
 * HTTP Client Wrapper with Rate Limiting
 * 
 * This module provides:
 * - APIClient class wrapping Anthropic SDK
 * - Automatic rate limiting (requests per minute)
 * - Concurrent request limiting
 * - Timeout handling with AbortSignal
 * - Comprehensive error handling
 * - Request tracking and status monitoring
 * 
 * @module api/client
 */

import Anthropic from '@anthropic-ai/sdk';
import { APIError, NetworkError, ErrorCode } from '../errors';
import { errorLogger } from '../errors/error-logger';

/**
 * Rate limiter configuration.
 */
interface RateLimiterConfig {
  /** Maximum requests per minute */
  requestsPerMinute: number;
  /** Maximum concurrent requests */
  maxConcurrent: number;
}

/**
 * Request metadata for tracking.
 */
interface RequestMetadata {
  id: string;
  timestamp: number;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  retryCount: number;
}

/**
 * Rate limiter class.
 * Manages request throttling using sliding window algorithm.
 */
class RateLimiter {
  private requests: RequestMetadata[] = [];
  private config: RateLimiterConfig;
  private activeRequests = 0;

  constructor(config: RateLimiterConfig) {
    this.config = config;
  }

  /**
   * Acquire a slot for a new request.
   * Waits if rate limit or concurrent limit is reached.
   */
  async acquire(): Promise<void> {
    // Wait if too many concurrent requests
    while (this.activeRequests >= this.config.maxConcurrent) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Clean old requests (older than 1 minute)
    const oneMinuteAgo = Date.now() - 60000;
    this.requests = this.requests.filter(r => r.timestamp > oneMinuteAgo);

    // Wait if rate limit reached
    while (this.requests.length >= this.config.requestsPerMinute) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const oneMinuteAgo = Date.now() - 60000;
      this.requests = this.requests.filter(r => r.timestamp > oneMinuteAgo);
    }

    // Acquire slot
    this.activeRequests++;
    this.requests.push({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      status: 'in-progress',
      retryCount: 0,
    });
  }

  /**
   * Release a request slot.
   * Call this when a request completes (success or failure).
   */
  release(): void {
    this.activeRequests--;
  }

  /**
   * Get current rate limit status.
   */
  getStatus() {
    return {
      activeRequests: this.activeRequests,
      requestsLastMinute: this.requests.length,
      remainingCapacity: this.config.requestsPerMinute - this.requests.length,
    };
  }
}

/**
 * API client configuration.
 */
interface APIClientConfig {
  apiKey: string;
  model: string;
  rateLimiter: RateLimiterConfig;
  timeout?: number;
}

/**
 * API client class.
 * Wraps Anthropic SDK with rate limiting and error handling.
 */
export class APIClient {
  private anthropic: Anthropic;
  private rateLimiter: RateLimiter;
  private timeout: number;

  constructor(config: APIClientConfig) {
    this.anthropic = new Anthropic({
      apiKey: config.apiKey,
    });
    this.rateLimiter = new RateLimiter(config.rateLimiter);
    this.timeout = config.timeout || 60000; // 60 seconds default
  }

  /**
   * Generate a conversation using Claude API.
   * Automatically applies rate limiting and timeout handling.
   * 
   * @param prompt - The prompt to send to Claude
   * @param options - Generation options
   * @returns Anthropic Message response
   * 
   * @throws {APIError} For API-related errors (rate limit, validation, server)
   * @throws {NetworkError} For network/timeout errors
   * 
   * @example
   * ```typescript
   * const response = await apiClient.generateConversation(
   *   'Generate a conversation...',
   *   { conversationId: '123', maxTokens: 4096 }
   * );
   * ```
   */
  async generateConversation(
    prompt: string,
    options: {
      conversationId?: string;
      maxTokens?: number;
      temperature?: number;
      signal?: AbortSignal;
    } = {}
  ): Promise<Anthropic.Message> {
    // Acquire rate limit slot
    await this.rateLimiter.acquire();

    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new NetworkError(
            'Request timed out',
            ErrorCode.ERR_API_TIMEOUT,
            {
              context: {
                component: 'APIClient',
                metadata: { conversationId: options.conversationId },
              },
            }
          ));
        }, this.timeout);
      });

      // Create API call promise
      const apiPromise = this.anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.7,
        messages: [{ role: 'user', content: prompt }],
      }, {
        signal: options.signal,
      });

      // Race timeout vs API call
      const response = await Promise.race([apiPromise, timeoutPromise]);

      errorLogger.info('API call successful', {
        conversationId: options.conversationId,
        inputTokens: response.usage?.input_tokens,
        outputTokens: response.usage?.output_tokens,
      });

      return response;
    } catch (error) {
      this.handleAPIError(error, options.conversationId);
      throw error; // Re-throw for retry logic
    } finally {
      this.rateLimiter.release();
    }
  }

  /**
   * Handle API errors and convert to standardized error types.
   * 
   * @private
   */
  private handleAPIError(error: unknown, conversationId?: string): void {
    if (error instanceof Anthropic.APIError) {
      const apiError = new APIError(
        error.message,
        error.status || 500,
        this.mapAnthropicErrorCode(error),
        {
          responseData: error.error,
          context: {
            component: 'APIClient',
            metadata: { conversationId },
          },
        }
      );

      errorLogger.error('API call failed', apiError, {
        conversationId,
        statusCode: error.status,
      });

      throw apiError;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      const abortError = new NetworkError(
        'Request was aborted',
        ErrorCode.ERR_NET_ABORT,
        {
          context: {
            component: 'APIClient',
            metadata: { conversationId },
          },
        }
      );

      errorLogger.warn('Request aborted', abortError);
      throw abortError;
    }

    // Unknown error
    const unknownError = new NetworkError(
      'Unknown network error',
      ErrorCode.ERR_NET_UNKNOWN,
      {
        cause: error instanceof Error ? error : undefined,
        context: {
          component: 'APIClient',
          metadata: { conversationId },
        },
      }
    );

    errorLogger.error('Unknown API error', unknownError);
    throw unknownError;
  }

  /**
   * Map Anthropic API error status codes to our error codes.
   * 
   * @private
   */
  private mapAnthropicErrorCode(error: Anthropic.APIError): ErrorCode {
    switch (error.status) {
      case 401:
        return ErrorCode.ERR_API_UNAUTHORIZED;
      case 403:
        return ErrorCode.ERR_API_FORBIDDEN;
      case 404:
        return ErrorCode.ERR_API_NOT_FOUND;
      case 429:
        return ErrorCode.ERR_API_RATE_LIMIT;
      case 400:
        return ErrorCode.ERR_API_VALIDATION;
      default:
        return ErrorCode.ERR_API_SERVER;
    }
  }

  /**
   * Get current rate limit status.
   * Useful for displaying rate limit information in UI.
   * 
   * @returns Rate limit status object
   */
  getRateLimitStatus() {
    return this.rateLimiter.getStatus();
  }
}

/**
 * Export singleton instance.
 * 
 * Configuration is loaded from environment variables:
 * - ANTHROPIC_API_KEY: API key for authentication
 * - ANTHROPIC_RATE_LIMIT: Requests per minute (default: 50)
 * - ANTHROPIC_MAX_CONCURRENT: Max concurrent requests (default: 3)
 * - ANTHROPIC_TIMEOUT: Request timeout in ms (default: 60000)
 * 
 * @example
 * ```typescript
 * import apiClient from '@/lib/api/client';
 * 
 * const response = await apiClient.generateConversation(prompt);
 * const status = apiClient.getRateLimitStatus();
 * ```
 */
const apiClient = new APIClient({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  model: 'claude-sonnet-4-5-20250929',
  rateLimiter: {
    requestsPerMinute: parseInt(process.env.ANTHROPIC_RATE_LIMIT || '50'),
    maxConcurrent: parseInt(process.env.ANTHROPIC_MAX_CONCURRENT || '3'),
  },
  timeout: parseInt(process.env.ANTHROPIC_TIMEOUT || '60000'),
});

export default apiClient;

