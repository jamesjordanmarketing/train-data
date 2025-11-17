/**
 * Claude API Client
 * 
 * Core integration with the Claude API for conversation generation.
 * Integrates with existing rate limiting and retry infrastructure.
 * 
 * Features:
 * - Direct Claude API integration
 * - Rate limiting via existing RateLimiter
 * - Retry logic via existing RetryExecutor
 * - Token usage and cost tracking
 * - Comprehensive error handling
 * 
 * @module claude-api-client
 */

import { AI_CONFIG, calculateCost } from '../ai-config';
import { getRateLimiter } from '../ai/rate-limiter';
import { RetryExecutor } from '../ai/retry-executor';
import { createRetryStrategy } from '../ai/retry-strategy';
import { generationLogService } from './generation-log-service';
import { CONVERSATION_JSON_SCHEMA } from './conversation-schema';

/**
 * Configuration for a generation request
 */
export interface GenerationConfig {
  conversationId?: string;
  templateId?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
  userId?: string;
  runId?: string;
  useStructuredOutputs?: boolean; // Enable structured outputs (default: true)
}

/**
 * Response from Claude API
 */
export interface ClaudeAPIResponse {
  id: string;
  content: string;
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  cost: number;
  durationMs: number;
}

/**
 * Error thrown by Claude API
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public retryable: boolean,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Claude API Client
 * 
 * Handles direct communication with Claude API including:
 * - HTTP request management
 * - Response parsing
 * - Error handling and classification
 * - Cost calculation
 * - Generation logging
 */
export class ClaudeAPIClient {
  private requestCounter = 0;
  private rateLimiter = getRateLimiter();
  private retryExecutor: RetryExecutor;

  constructor() {
    // Initialize retry executor with exponential backoff strategy
    const strategy = createRetryStrategy({
      strategy: AI_CONFIG.retryConfig.defaultStrategy,
      maxAttempts: AI_CONFIG.retryConfig.exponential.maxAttempts,
      baseDelayMs: AI_CONFIG.retryConfig.exponential.baseDelayMs,
      maxDelayMs: AI_CONFIG.retryConfig.exponential.maxDelayMs,
      jitterFactor: AI_CONFIG.retryConfig.exponential.jitterFactor,
    });

    this.retryExecutor = new RetryExecutor(strategy);
  }

  /**
   * Generate a conversation using Claude API
   * 
   * @param prompt - The prompt to send to Claude
   * @param config - Generation configuration
   * @returns Claude API response with parsed content
   * 
   * @example
   * ```typescript
   * const client = new ClaudeAPIClient();
   * const response = await client.generateConversation(prompt, {
   *   conversationId: 'conv-123',
   *   templateId: 'template-456',
   *   userId: 'user-789'
   * });
   * ```
   */
  async generateConversation(
    prompt: string,
    config: GenerationConfig = {}
  ): Promise<ClaudeAPIResponse> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    console.log(`[${requestId}] Starting Claude API generation`);

    // Validate API key
    if (!AI_CONFIG.apiKey) {
      throw new APIError(
        'ANTHROPIC_API_KEY not configured',
        500,
        'missing_api_key',
        false
      );
    }

    try {
      // Execute with retry logic
      const response = await this.retryExecutor.execute(
        async () => {
          // Check rate limit before making request
          await this.checkRateLimit(requestId);

          // Call Claude API
          return await this.callAPI(requestId, prompt, config);
        },
        {
          requestId,
          conversationId: config.conversationId,
          templateId: config.templateId,
        }
      );

      const durationMs = Date.now() - startTime;

      // Log successful generation (non-blocking)
      try {
        await generationLogService.logGeneration({
          conversationId: config.conversationId,
          runId: config.runId,
          templateId: config.templateId,
          requestPayload: {
            prompt,
            model: config.model || AI_CONFIG.model,
            temperature: config.temperature || AI_CONFIG.temperature,
            maxTokens: config.maxTokens || AI_CONFIG.maxTokens,
          },
          responsePayload: {
            id: response.id,
            content: response.content,
          },
          modelUsed: response.model,
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          costUsd: response.cost,
          durationMs,
          status: 'success',
          retryAttempt: 0,
          createdBy: config.userId || 'system',
        });
      } catch (logError) {
        // Log error but don't fail the generation
        console.error('Error logging generation:', logError);
      }

      console.log(`[${requestId}] ✓ Generation successful (${durationMs}ms, $${response.cost.toFixed(4)})`);

      return {
        ...response,
        durationMs,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const apiError = error as APIError;

      // Log failed generation (non-blocking)
      try {
        await generationLogService.logGeneration({
          conversationId: config.conversationId,
          runId: config.runId,
          templateId: config.templateId,
          requestPayload: {
            prompt,
            model: config.model || AI_CONFIG.model,
            temperature: config.temperature || AI_CONFIG.temperature,
            maxTokens: config.maxTokens || AI_CONFIG.maxTokens,
          },
          modelUsed: config.model || AI_CONFIG.model,
          inputTokens: 0,
          outputTokens: 0,
          durationMs,
          status: 'failed',
          errorMessage: apiError.message,
          errorCode: apiError.code,
          retryAttempt: 0,
          createdBy: config.userId || 'system',
        });
      } catch (logError) {
        // Log error but don't fail the generation
        console.error('Error logging generation:', logError);
      }

      console.error(`[${requestId}] ✗ Generation failed:`, apiError.message);
      throw error;
    }
  }

  /**
   * Call Claude API (internal method)
   * @private
   */
  private async callAPI(
    requestId: string,
    prompt: string,
    config: GenerationConfig
  ): Promise<ClaudeAPIResponse> {
    const model = config.model || AI_CONFIG.model;
    const temperature = config.temperature ?? AI_CONFIG.temperature;
    const maxTokens = config.maxTokens || AI_CONFIG.maxTokens;
    const useStructuredOutputs = config.useStructuredOutputs !== false; // Default true

    console.log(`[${requestId}] Calling Claude API: ${model}`);
    if (useStructuredOutputs) {
      console.log(`[${requestId}] ✅ Using structured outputs for guaranteed valid JSON`);
    }

    // Track request in rate limiter
    this.rateLimiter.addRequest(requestId);

    const requestBody: any = {
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    };

    // TIER 1: Add structured outputs configuration
    if (useStructuredOutputs) {
      requestBody.output_format = {
        type: "json_schema",
        schema: CONVERSATION_JSON_SCHEMA
      };
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': AI_CONFIG.apiKey,
      'anthropic-version': '2023-06-01',
    };

    // Add beta header for structured outputs
    if (useStructuredOutputs) {
      headers['anthropic-beta'] = 'structured-outputs-2025-11-13';
    }

    try {
      const response = await fetch(`${AI_CONFIG.baseUrl}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(AI_CONFIG.timeout),
      });

      // Handle non-2xx responses
      if (!response.ok) {
        await this.handleAPIError(response, requestId);
      }

      // Parse response
      const data = await response.json();

      // Extract content (Claude returns array of content blocks)
      const content = data.content
        .map((block: any) => block.text)
        .join('\n');

      // Calculate cost
      const tier = this.getModelTier(model);
      const cost = calculateCost(
        tier,
        data.usage.input_tokens,
        data.usage.output_tokens
      );

      return {
        id: data.id,
        content,
        model: data.model,
        usage: {
          input_tokens: data.usage.input_tokens,
          output_tokens: data.usage.output_tokens,
        },
        cost,
        durationMs: 0, // Will be set by caller
      };
    } catch (error: any) {
      // Network errors
      if (error.name === 'AbortError') {
        throw new APIError(
          'Request timeout',
          408,
          'timeout',
          true
        );
      }

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new APIError(
          'Network error - unable to reach Claude API',
          0,
          'network_error',
          true
        );
      }

      // Re-throw if already APIError
      if (error instanceof APIError) {
        throw error;
      }

      // Unknown error
      throw new APIError(
        error.message || 'Unknown error',
        500,
        'unknown_error',
        false,
        error
      );
    }
  }

  /**
   * Handle API error responses
   * @private
   */
  private async handleAPIError(response: Response, requestId: string): Promise<never> {
    let errorData: any = {};
    
    try {
      errorData = await response.json();
    } catch {
      // If JSON parsing fails, use response text
      errorData = { message: await response.text() };
    }

    const message = errorData.error?.message || errorData.message || response.statusText;
    const code = errorData.error?.type || 'api_error';

    console.error(`[${requestId}] API Error ${response.status}:`, message);

    // Categorize error
    const retryable = this.isRetryableStatus(response.status);

    throw new APIError(
      message,
      response.status,
      code,
      retryable,
      errorData
    );
  }

  /**
   * Check if HTTP status is retryable
   * @private
   */
  private isRetryableStatus(status: number): boolean {
    const retryableStatuses = [
      408, // Request Timeout
      429, // Too Many Requests
      500, // Internal Server Error
      502, // Bad Gateway
      503, // Service Unavailable
      504, // Gateway Timeout
    ];

    return retryableStatuses.includes(status);
  }

  /**
   * Check rate limit and wait if necessary
   * @private
   */
  private async checkRateLimit(requestId: string): Promise<void> {
    const status = this.rateLimiter.getStatus();

    if (!status.canMakeRequest) {
      console.log(
        `[${requestId}] Rate limit approaching (${status.utilization.toFixed(1)}%). ` +
        `Waiting ${status.estimatedWaitMs}ms...`
      );

      await this.rateLimiter.waitForCapacity(AI_CONFIG.timeout);
    }
  }

  /**
   * Get model tier from model name
   * @private
   */
  private getModelTier(model: string): 'opus' | 'sonnet' | 'haiku' {
    if (model.includes('opus')) return 'opus';
    if (model.includes('haiku')) return 'haiku';
    return 'sonnet';
  }

  /**
   * Generate unique request ID
   * @private
   */
  private generateRequestId(): string {
    return `req_${++this.requestCounter}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus() {
    return this.rateLimiter.getStatus();
  }

  /**
   * Get rate limiter metrics
   */
  getRateLimiterMetrics() {
    return this.rateLimiter.getMetrics();
  }

  /**
   * Estimate tokens in text (rough approximation)
   * Claude uses ~4 characters per token on average
   */
  static estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}

/**
 * Singleton instance for convenience
 */
let clientInstance: ClaudeAPIClient | null = null;

/**
 * Get or create singleton Claude API client instance
 */
export function getClaudeAPIClient(): ClaudeAPIClient {
  if (!clientInstance) {
    clientInstance = new ClaudeAPIClient();
  }
  return clientInstance;
}

/**
 * Reset singleton instance (useful for testing)
 */
export function resetClaudeAPIClient(): void {
  clientInstance = null;
}

