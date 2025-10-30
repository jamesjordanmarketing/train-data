/**
 * Retry Execution Engine
 * 
 * Executes functions with automatic retry logic based on configurable strategies.
 * Logs all retry attempts, tracks metrics, and provides detailed error information.
 * 
 * @module retry-executor
 */

import { RetryStrategy } from './retry-strategy';
import { ErrorClassifier, ErrorDetails } from './error-classifier';

/**
 * Retry metrics captured during execution
 */
export interface RetryMetrics {
  requestId: string;
  totalAttempts: number;
  successfulAttempt: number | null; // null if all attempts failed
  totalDurationMs: number;
  delays: number[]; // Delay before each retry
  errors: ErrorDetails[]; // Error details for each attempt
  finalStatus: 'success' | 'failure';
}

/**
 * Context for retry execution
 */
export interface RetryContext {
  requestId: string;
  conversationId?: string;
  templateId?: string;
  metadata?: Record<string, any>;
}

/**
 * Retry Executor
 * 
 * Executes functions with automatic retry logic, exponential backoff,
 * and comprehensive logging of all attempts and outcomes.
 */
export class RetryExecutor {
  /**
   * @param strategy - Retry strategy to use for delay calculation and retry decisions
   */
  constructor(private strategy: RetryStrategy) {
    if (!strategy) {
      throw new Error('Retry strategy is required');
    }
  }
  
  /**
   * Execute a function with retry logic
   * 
   * @param fn - Async function to execute
   * @param context - Execution context for logging
   * @returns Promise resolving to function result
   * @throws Last error if all retry attempts fail
   */
  async execute<T>(
    fn: () => Promise<T>,
    context: RetryContext
  ): Promise<T> {
    const startTime = Date.now();
    const metrics: RetryMetrics = {
      requestId: context.requestId,
      totalAttempts: 0,
      successfulAttempt: null,
      totalDurationMs: 0,
      delays: [],
      errors: [],
      finalStatus: 'failure',
    };
    
    let lastError: Error | null = null;
    
    // Attempt execution with retries
    for (let attempt = 0; attempt <= this.strategy.maxAttempts; attempt++) {
      metrics.totalAttempts = attempt + 1;
      
      try {
        // Log attempt start
        if (attempt === 0) {
          console.log(`[${context.requestId}] Starting execution (attempt 1/${this.strategy.maxAttempts + 1})`);
        } else {
          console.log(`[${context.requestId}] Retry attempt ${attempt + 1}/${this.strategy.maxAttempts + 1}`);
        }
        
        // Execute the function
        const attemptStartTime = Date.now();
        const result = await fn();
        const attemptDuration = Date.now() - attemptStartTime;
        
        // Success!
        metrics.successfulAttempt = attempt + 1;
        metrics.finalStatus = 'success';
        metrics.totalDurationMs = Date.now() - startTime;
        
        // Log success
        if (attempt > 0) {
          console.log(
            `[${context.requestId}] ✓ Succeeded after ${attempt + 1} attempts ` +
            `(${attemptDuration}ms, total: ${metrics.totalDurationMs}ms)`
          );
          await this.logRetrySuccess(context, metrics);
        } else {
          console.log(
            `[${context.requestId}] ✓ Succeeded on first attempt (${attemptDuration}ms)`
          );
        }
        
        return result;
        
      } catch (error) {
        lastError = error as Error;
        const attemptDuration = Date.now() - startTime;
        
        // Get error details
        const errorDetails = ErrorClassifier.getErrorDetails(lastError);
        metrics.errors.push(errorDetails);
        
        // Log error
        console.error(
          `[${context.requestId}] ✗ Attempt ${attempt + 1} failed: ${lastError.message} ` +
          `(category: ${errorDetails.category}, retryable: ${errorDetails.isRetryable})`
        );
        
        // Check if we should retry
        const shouldRetry = this.strategy.shouldRetry(lastError, attempt);
        const hasMoreAttempts = attempt < this.strategy.maxAttempts;
        
        if (!shouldRetry) {
          if (!errorDetails.isRetryable) {
            console.log(
              `[${context.requestId}] Non-retryable error (${errorDetails.category}). ` +
              `Recommended action: ${ErrorClassifier.getRecommendedAction(lastError)}`
            );
          } else {
            console.log(`[${context.requestId}] Max retry attempts (${this.strategy.maxAttempts}) reached`);
          }
          
          // Log final failure
          metrics.totalDurationMs = Date.now() - startTime;
          await this.logRetryFailure(context, metrics, lastError);
          
          throw lastError;
        }
        
        if (!hasMoreAttempts) {
          console.log(`[${context.requestId}] Max retry attempts (${this.strategy.maxAttempts}) reached`);
          metrics.totalDurationMs = Date.now() - startTime;
          await this.logRetryFailure(context, metrics, lastError);
          throw lastError;
        }
        
        // Calculate delay for next attempt
        const delay = this.strategy.calculateDelay(attempt);
        metrics.delays.push(delay);
        
        console.log(
          `[${context.requestId}] Retrying in ${this.formatDelay(delay)}... ` +
          `(${this.strategy.maxAttempts - attempt} attempts remaining)`
        );
        
        // Wait before retrying
        await this.sleep(delay);
      }
    }
    
    // All retries exhausted (shouldn't reach here due to throw in loop, but TypeScript needs it)
    metrics.totalDurationMs = Date.now() - startTime;
    await this.logRetryFailure(context, metrics, lastError!);
    throw lastError!;
  }
  
  /**
   * Sleep for specified duration
   * @param ms - Duration in milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Format delay duration in human-readable format
   * @param ms - Duration in milliseconds
   * @returns Formatted string
   */
  private formatDelay(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`;
    } else {
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    }
  }
  
  /**
   * Log successful retry to database/console
   * @param context - Retry context
   * @param metrics - Retry metrics
   */
  private async logRetrySuccess(
    context: RetryContext,
    metrics: RetryMetrics
  ): Promise<void> {
    try {
      // Log to console
      console.log(`[${context.requestId}] Retry metrics:`, {
        attempts: metrics.totalAttempts,
        successfulAttempt: metrics.successfulAttempt,
        totalDuration: `${metrics.totalDurationMs}ms`,
        delays: metrics.delays.map(d => `${d}ms`),
        errorCategories: metrics.errors.map(e => e.category),
      });
      
      // TODO: Log to database when database schema is available
      // await supabase.from('retry_logs').insert({
      //   request_id: context.requestId,
      //   conversation_id: context.conversationId,
      //   total_attempts: metrics.totalAttempts,
      //   successful_attempt: metrics.successfulAttempt,
      //   total_duration_ms: metrics.totalDurationMs,
      //   delays: metrics.delays,
      //   errors: metrics.errors,
      //   status: 'success',
      //   created_at: new Date().toISOString(),
      // });
      
    } catch (error) {
      console.error(`[${context.requestId}] Failed to log retry success:`, error);
      // Don't throw - logging failures shouldn't break execution
    }
  }
  
  /**
   * Log failed retry to database/console
   * @param context - Retry context
   * @param metrics - Retry metrics
   * @param finalError - Final error that caused failure
   */
  private async logRetryFailure(
    context: RetryContext,
    metrics: RetryMetrics,
    finalError: Error
  ): Promise<void> {
    try {
      const errorDetails = ErrorClassifier.getErrorDetails(finalError);
      
      // Log to console
      console.error(`[${context.requestId}] All retry attempts failed:`, {
        attempts: metrics.totalAttempts,
        totalDuration: `${metrics.totalDurationMs}ms`,
        delays: metrics.delays.map(d => `${d}ms`),
        finalError: {
          message: finalError.message,
          category: errorDetails.category,
          statusCode: errorDetails.statusCode,
        },
        allErrors: metrics.errors.map(e => ({
          category: e.category,
          message: e.originalMessage,
          timestamp: e.timestamp,
        })),
        userMessage: ErrorClassifier.getUserFriendlyMessage(finalError),
        recommendedAction: ErrorClassifier.getRecommendedAction(finalError),
      });
      
      // TODO: Log to database when database schema is available
      // await supabase.from('retry_logs').insert({
      //   request_id: context.requestId,
      //   conversation_id: context.conversationId,
      //   total_attempts: metrics.totalAttempts,
      //   successful_attempt: null,
      //   total_duration_ms: metrics.totalDurationMs,
      //   delays: metrics.delays,
      //   errors: metrics.errors,
      //   final_error: {
      //     message: finalError.message,
      //     category: errorDetails.category,
      //     statusCode: errorDetails.statusCode,
      //   },
      //   status: 'failure',
      //   created_at: new Date().toISOString(),
      // });
      
    } catch (error) {
      console.error(`[${context.requestId}] Failed to log retry failure:`, error);
      // Don't throw - logging failures shouldn't break execution
    }
  }
  
  /**
   * Get the current retry strategy
   * @returns Current retry strategy
   */
  getStrategy(): RetryStrategy {
    return this.strategy;
  }
  
  /**
   * Update the retry strategy
   * @param strategy - New retry strategy
   */
  setStrategy(strategy: RetryStrategy): void {
    if (!strategy) {
      throw new Error('Retry strategy is required');
    }
    this.strategy = strategy;
  }
}

