/**
 * Retry Manager Implementation
 * 
 * Smart retry with exponential backoff and jitter
 */

import { RetryConfig, ClaudeAPIError } from './types/generation';

export class RetryManager {
  /**
   * Execute an operation with retry logic
   * 
   * @param operation - Async operation to execute
   * @param config - Retry configuration
   * @returns Promise with operation result
   * @throws Error if all retries exhausted
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
      try {
        // Execute the operation
        const result = await operation();
        
        // Success - return result
        if (attempt > 0) {
          console.log(`✅ Operation succeeded on attempt ${attempt + 1}`);
        }
        return result;
        
      } catch (error) {
        lastError = error as Error;
        
        // Check if this is the last attempt
        if (attempt === config.maxAttempts - 1) {
          console.error(`❌ All ${config.maxAttempts} retry attempts exhausted`);
          throw error;
        }
        
        // Check if error is retryable
        if (!this.isRetryableError(error as Error)) {
          console.error(`❌ Non-retryable error encountered:`, error);
          throw error;
        }
        
        // Calculate backoff delay
        const delay = this.calculateBackoff(attempt, config.baseDelay, config.maxDelay);
        
        console.warn(
          `⚠️  Retry attempt ${attempt + 1}/${config.maxAttempts} after ${delay}ms. Error: ${(error as Error).message}`
        );
        
        // Call retry callback if provided
        if (config.onRetry) {
          config.onRetry(attempt + 1, error as Error);
        }
        
        // Wait before retrying
        await this.sleep(delay);
      }
    }
    
    // This should never be reached due to throw in loop
    throw lastError || new Error('All retry attempts failed');
  }

  /**
   * Check if error is retryable
   * 
   * @param error - Error to check
   * @returns True if error is retryable
   */
  private isRetryableError(error: Error): boolean {
    // Claude API errors have a specific check
    if (error instanceof ClaudeAPIError) {
      return error.isRetryable;
    }
    
    // Check error message for common retryable patterns
    const message = error.message.toLowerCase();
    
    // Network errors
    if (message.includes('network') || 
        message.includes('timeout') ||
        message.includes('econnreset') ||
        message.includes('econnrefused') ||
        message.includes('socket hang up')) {
      return true;
    }
    
    // Rate limit errors
    if (message.includes('rate limit') || 
        message.includes('429') ||
        message.includes('too many requests')) {
      return true;
    }
    
    // Server errors (5xx)
    if (message.includes('500') ||
        message.includes('502') ||
        message.includes('503') ||
        message.includes('504') ||
        message.includes('internal server error') ||
        message.includes('bad gateway') ||
        message.includes('service unavailable') ||
        message.includes('gateway timeout')) {
      return true;
    }
    
    // Temporary failures
    if (message.includes('temporarily unavailable') ||
        message.includes('try again')) {
      return true;
    }
    
    // Default to non-retryable for unknown errors
    // Client errors (4xx validation) are not retryable
    return false;
  }

  /**
   * Calculate exponential backoff with jitter
   * 
   * @param attempt - Current attempt number (0-based)
   * @param baseDelay - Base delay in milliseconds
   * @param maxDelay - Maximum delay cap
   * @returns Delay in milliseconds
   */
  private calculateBackoff(
    attempt: number,
    baseDelay: number,
    maxDelay: number
  ): number {
    // Exponential backoff: delay = baseDelay * (2 ^ attempt)
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    
    // Add random jitter (0-1000ms) to prevent thundering herd
    const jitter = Math.random() * 1000;
    
    // Apply cap and return
    return Math.min(exponentialDelay + jitter, maxDelay);
  }

  /**
   * Sleep for specified milliseconds
   * 
   * @param ms - Milliseconds to sleep
   * @returns Promise that resolves after delay
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const retryManager = new RetryManager();

