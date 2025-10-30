/**
 * AI Generation Client
 * 
 * Orchestrates AI conversation generation with integrated rate limiting,
 * retry logic, and error handling. Provides a high-level interface for
 * generating conversations using the Claude API.
 * 
 * @module generation-client
 */

import { RateLimiter, getRateLimiter } from './rate-limiter';
import { RetryExecutor } from './retry-executor';
import { createRetryStrategy } from './retry-strategy';
import { ErrorClassifier } from './error-classifier';
import type { AIConfig, RateLimitConfig } from './types';

/**
 * Retry configuration for generation requests
 */
export interface RetryConfig {
  strategy: 'exponential' | 'linear' | 'fixed';
  maxAttempts: number;
  baseDelayMs?: number;
  incrementMs?: number;
  fixedDelayMs?: number;
  maxDelayMs?: number;
  jitterFactor?: number;
  continueOnError: boolean;
}

/**
 * Configuration for the generation client
 */
export interface GenerationClientConfig {
  rateLimitConfig: RateLimitConfig;
  retryConfig: RetryConfig;
  timeout?: number;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

/**
 * Generated conversation structure
 */
export interface Conversation {
  id: string;
  templateId: string;
  userMessage: string;
  assistantMessage: string;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  model: string;
  generatedAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Generation request parameters
 */
export interface GenerationParams {
  templateId: string;
  userMessage: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, any>;
}

/**
 * Generation Client
 * 
 * Main client for generating AI conversations with built-in:
 * - Rate limiting to prevent 429 errors
 * - Automatic retry with exponential backoff
 * - Comprehensive error handling and classification
 * - Metrics tracking and logging
 */
export class GenerationClient {
  private rateLimiter: RateLimiter;
  private retryExecutor: RetryExecutor;
  private config: GenerationClientConfig;
  private requestCounter = 0;

  /**
   * @param config - Client configuration
   */
  constructor(config: GenerationClientConfig) {
    this.config = config;
    
    // Initialize or get existing rate limiter
    this.rateLimiter = getRateLimiter(config.rateLimitConfig);
    
    // Create retry executor with configured strategy
    const strategy = createRetryStrategy({
      strategy: config.retryConfig.strategy,
      maxAttempts: config.retryConfig.maxAttempts,
      baseDelayMs: config.retryConfig.baseDelayMs,
      incrementMs: config.retryConfig.incrementMs,
      fixedDelayMs: config.retryConfig.fixedDelayMs,
      maxDelayMs: config.retryConfig.maxDelayMs,
      jitterFactor: config.retryConfig.jitterFactor,
    });
    
    this.retryExecutor = new RetryExecutor(strategy);
  }

  /**
   * Generate a conversation using the Claude API
   * 
   * @param params - Generation parameters
   * @returns Generated conversation
   * @throws Error if generation fails after all retries
   */
  async generateConversation(params: GenerationParams): Promise<Conversation> {
    const requestId = this.generateRequestId();
    
    console.log(`[${requestId}] Starting conversation generation for template: ${params.templateId}`);
    
    // Check rate limit before proceeding
    await this.checkRateLimit(requestId);
    
    // Execute with retry logic
    try {
      const result = await this.retryExecutor.execute(
        async () => {
          // Track request in rate limiter
          this.rateLimiter.addRequest(requestId);
          
          // Call Claude API
          return await this.callClaudeAPI(requestId, params);
        },
        {
          requestId,
          templateId: params.templateId,
          metadata: params.metadata,
        }
      );
      
      console.log(`[${requestId}] ✓ Conversation generated successfully`);
      return result;
      
    } catch (error) {
      const err = error as Error;
      const errorDetails = ErrorClassifier.getErrorDetails(err);
      
      console.error(`[${requestId}] ✗ Generation failed:`, {
        error: err.message,
        category: errorDetails.category,
        retryable: errorDetails.isRetryable,
        userMessage: ErrorClassifier.getUserFriendlyMessage(err),
      });
      
      throw err;
    }
  }

  /**
   * Generate multiple conversations in batch
   * 
   * @param paramsList - Array of generation parameters
   * @param options - Batch options
   * @returns Array of results (successful conversations or errors)
   */
  async generateBatch(
    paramsList: GenerationParams[],
    options: {
      continueOnError?: boolean;
      maxConcurrent?: number;
    } = {}
  ): Promise<Array<{ success: boolean; data?: Conversation; error?: Error }>> {
    const continueOnError = options.continueOnError ?? this.config.retryConfig.continueOnError;
    const maxConcurrent = options.maxConcurrent ?? this.config.rateLimitConfig.maxConcurrentRequests;
    
    console.log(`[Batch] Starting batch generation: ${paramsList.length} conversations`);
    console.log(`[Batch] Settings: continueOnError=${continueOnError}, maxConcurrent=${maxConcurrent}`);
    
    const results: Array<{ success: boolean; data?: Conversation; error?: Error }> = [];
    
    // Process in chunks to respect concurrent limit
    for (let i = 0; i < paramsList.length; i += maxConcurrent) {
      const chunk = paramsList.slice(i, i + maxConcurrent);
      
      console.log(`[Batch] Processing chunk ${Math.floor(i / maxConcurrent) + 1}: items ${i + 1}-${Math.min(i + maxConcurrent, paramsList.length)}`);
      
      const chunkPromises = chunk.map(async (params) => {
        try {
          const conversation = await this.generateConversation(params);
          return { success: true, data: conversation };
        } catch (error) {
          const err = error as Error;
          
          if (!continueOnError) {
            throw err;
          }
          
          return { success: false, error: err };
        }
      });
      
      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
      
      // Log chunk summary
      const chunkSuccesses = chunkResults.filter(r => r.success).length;
      const chunkFailures = chunkResults.filter(r => !r.success).length;
      console.log(`[Batch] Chunk complete: ${chunkSuccesses} succeeded, ${chunkFailures} failed`);
    }
    
    // Log final summary
    const totalSuccesses = results.filter(r => r.success).length;
    const totalFailures = results.filter(r => !r.success).length;
    console.log(`[Batch] Batch complete: ${totalSuccesses}/${paramsList.length} succeeded, ${totalFailures} failed`);
    
    return results;
  }

  /**
   * Check rate limit and wait if necessary
   * @private
   */
  private async checkRateLimit(requestId: string): Promise<void> {
    const status = this.rateLimiter.getStatus();
    
    if (!status.canMakeRequest) {
      console.log(
        `[${requestId}] Rate limit reached (${status.utilization.toFixed(1)}%). ` +
        `Waiting ${status.estimatedWaitMs}ms...`
      );
      
      await this.rateLimiter.waitForCapacity(this.config.timeout);
    }
  }

  /**
   * Call the Claude API to generate a conversation
   * @private
   */
  private async callClaudeAPI(
    requestId: string,
    params: GenerationParams
  ): Promise<Conversation> {
    // TODO: Replace this stub with actual Claude API integration in next prompt
    // This is a placeholder that simulates API behavior for testing
    
    console.log(`[${requestId}] Calling Claude API (stub)...`);
    
    // Simulate API delay
    await this.sleep(100 + Math.random() * 200);
    
    // Simulate occasional failures for testing retry logic
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
      const errorTypes = [
        new Error('500 Internal Server Error'),
        new Error('429 Rate limit exceeded'),
        new Error('Network request failed'),
        new Error('ETIMEDOUT: request timeout'),
      ];
      throw errorTypes[Math.floor(Math.random() * errorTypes.length)];
    }
    
    // Return mock conversation
    const conversation: Conversation = {
      id: this.generateConversationId(),
      templateId: params.templateId,
      userMessage: params.userMessage,
      assistantMessage: `This is a mock response for: ${params.userMessage.substring(0, 50)}...`,
      tokensUsed: {
        input: 150,
        output: 200,
        total: 350,
      },
      cost: 0.00105, // Mock cost calculation
      model: this.config.model || 'claude-3-5-sonnet-20241022',
      generatedAt: new Date(),
      metadata: params.metadata,
    };
    
    return conversation;
  }

  /**
   * Generate a unique request ID
   * @private
   */
  private generateRequestId(): string {
    return `gen_${++this.requestCounter}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Generate a unique conversation ID
   * @private
   */
  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Sleep utility
   * @private
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current rate limit status
   * @returns Current rate limit status
   */
  getRateLimitStatus() {
    return this.rateLimiter.getStatus();
  }

  /**
   * Get rate limiter metrics
   * @returns Rate limiter metrics
   */
  getRateLimiterMetrics() {
    return this.rateLimiter.getMetrics();
  }

  /**
   * Get current retry strategy
   * @returns Current retry strategy
   */
  getRetryStrategy() {
    return this.retryExecutor.getStrategy();
  }

  /**
   * Update retry configuration
   * @param config - New retry configuration
   */
  updateRetryConfig(config: Partial<RetryConfig>): void {
    this.config.retryConfig = { ...this.config.retryConfig, ...config };
    
    // Create new retry strategy
    const strategy = createRetryStrategy({
      strategy: this.config.retryConfig.strategy,
      maxAttempts: this.config.retryConfig.maxAttempts,
      baseDelayMs: this.config.retryConfig.baseDelayMs,
      incrementMs: this.config.retryConfig.incrementMs,
      fixedDelayMs: this.config.retryConfig.fixedDelayMs,
      maxDelayMs: this.config.retryConfig.maxDelayMs,
      jitterFactor: this.config.retryConfig.jitterFactor,
    });
    
    this.retryExecutor.setStrategy(strategy);
  }

  /**
   * Update rate limit configuration
   * @param config - New rate limit configuration
   */
  updateRateLimitConfig(config: Partial<RateLimitConfig>): void {
    this.config.rateLimitConfig = { ...this.config.rateLimitConfig, ...config };
    this.rateLimiter.updateConfig(config);
  }
}

/**
 * Create a generation client with default configuration
 * @param config - Client configuration
 * @returns Configured generation client
 */
export function createGenerationClient(config: GenerationClientConfig): GenerationClient {
  return new GenerationClient(config);
}

