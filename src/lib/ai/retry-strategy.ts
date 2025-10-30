/**
 * Retry Strategy System
 * 
 * Provides configurable retry strategies with exponential backoff, linear backoff,
 * and fixed delay approaches for handling transient failures in AI API calls.
 * 
 * @module retry-strategy
 */

import { ErrorClassifier } from './error-classifier';

/**
 * Interface for retry strategies
 * Defines how delays are calculated and when retries should occur
 */
export interface RetryStrategy {
  /**
   * Calculate the delay before the next retry attempt
   * @param attemptNumber - Zero-based attempt number (0 = first retry)
   * @returns Delay in milliseconds
   */
  calculateDelay(attemptNumber: number): number;
  
  /**
   * Determine if a retry should be attempted for the given error
   * @param error - The error that occurred
   * @param attemptNumber - Zero-based attempt number
   * @returns true if retry should be attempted, false otherwise
   */
  shouldRetry(error: Error, attemptNumber: number): boolean;
  
  /**
   * Maximum number of retry attempts allowed
   */
  maxAttempts: number;
}

/**
 * Exponential Backoff Strategy
 * 
 * Delay formula: delay = baseDelay * (2 ^ attemptNumber) + randomJitter
 * Example: 1s, 2s, 4s, 8s, 16s...
 * 
 * @implements {RetryStrategy}
 */
export class ExponentialBackoffStrategy implements RetryStrategy {
  /**
   * @param baseDelayMs - Initial delay in milliseconds (default: 1000ms)
   * @param maxAttempts - Maximum retry attempts (default: 3)
   * @param maxDelayMs - Maximum delay cap in milliseconds (default: 300000ms = 5 minutes)
   * @param jitterFactor - Random jitter factor 0-1 (default: 0.1 = 10%)
   */
  constructor(
    private baseDelayMs: number = 1000,
    public maxAttempts: number = 3,
    private maxDelayMs: number = 300000, // 5 minutes
    private jitterFactor: number = 0.1
  ) {
    if (baseDelayMs <= 0) {
      throw new Error('Base delay must be positive');
    }
    if (maxAttempts < 0) {
      throw new Error('Max attempts must be non-negative');
    }
    if (maxDelayMs < baseDelayMs) {
      throw new Error('Max delay must be greater than or equal to base delay');
    }
    if (jitterFactor < 0 || jitterFactor > 1) {
      throw new Error('Jitter factor must be between 0 and 1');
    }
  }
  
  /**
   * Calculate exponential delay with random jitter
   * @param attemptNumber - Zero-based attempt number
   * @returns Delay in milliseconds
   */
  calculateDelay(attemptNumber: number): number {
    // Calculate exponential delay: baseDelay * 2^attempt
    const exponentialDelay = this.baseDelayMs * Math.pow(2, attemptNumber);
    
    // Add random jitter to prevent thundering herd problem
    // Jitter range: 0 to (delay * jitterFactor)
    const jitter = exponentialDelay * this.jitterFactor * Math.random();
    
    // Total delay with jitter
    const totalDelay = exponentialDelay + jitter;
    
    // Cap at maximum delay
    return Math.min(totalDelay, this.maxDelayMs);
  }
  
  /**
   * Determine if retry should be attempted
   * @param error - The error that occurred
   * @param attemptNumber - Zero-based attempt number
   * @returns true if retry should be attempted
   */
  shouldRetry(error: Error, attemptNumber: number): boolean {
    // Check if max attempts exceeded
    if (attemptNumber >= this.maxAttempts) {
      return false;
    }
    
    // Check if error is retryable
    return ErrorClassifier.isRetryable(error);
  }
}

/**
 * Linear Backoff Strategy
 * 
 * Delay formula: delay = increment * attemptNumber
 * Example with 2s increment: 0s, 2s, 4s, 6s, 8s...
 * 
 * @implements {RetryStrategy}
 */
export class LinearBackoffStrategy implements RetryStrategy {
  /**
   * @param incrementMs - Delay increment in milliseconds (default: 2000ms)
   * @param maxAttempts - Maximum retry attempts (default: 3)
   * @param maxDelayMs - Maximum delay cap in milliseconds (default: 300000ms = 5 minutes)
   */
  constructor(
    private incrementMs: number = 2000,
    public maxAttempts: number = 3,
    private maxDelayMs: number = 300000
  ) {
    if (incrementMs <= 0) {
      throw new Error('Increment must be positive');
    }
    if (maxAttempts < 0) {
      throw new Error('Max attempts must be non-negative');
    }
    if (maxDelayMs < incrementMs) {
      throw new Error('Max delay must be greater than or equal to increment');
    }
  }
  
  /**
   * Calculate linear delay
   * @param attemptNumber - Zero-based attempt number
   * @returns Delay in milliseconds
   */
  calculateDelay(attemptNumber: number): number {
    // Linear increase: increment * attempt number
    const delay = this.incrementMs * (attemptNumber + 1);
    
    // Cap at maximum delay
    return Math.min(delay, this.maxDelayMs);
  }
  
  /**
   * Determine if retry should be attempted
   * @param error - The error that occurred
   * @param attemptNumber - Zero-based attempt number
   * @returns true if retry should be attempted
   */
  shouldRetry(error: Error, attemptNumber: number): boolean {
    // Check if max attempts exceeded
    if (attemptNumber >= this.maxAttempts) {
      return false;
    }
    
    // Check if error is retryable
    return ErrorClassifier.isRetryable(error);
  }
}

/**
 * Fixed Delay Strategy
 * 
 * Uses constant delay between all retry attempts
 * Example with 5s delay: 5s, 5s, 5s, 5s...
 * 
 * @implements {RetryStrategy}
 */
export class FixedDelayStrategy implements RetryStrategy {
  /**
   * @param delayMs - Fixed delay in milliseconds (default: 5000ms)
   * @param maxAttempts - Maximum retry attempts (default: 3)
   */
  constructor(
    private delayMs: number = 5000,
    public maxAttempts: number = 3
  ) {
    if (delayMs <= 0) {
      throw new Error('Delay must be positive');
    }
    if (maxAttempts < 0) {
      throw new Error('Max attempts must be non-negative');
    }
  }
  
  /**
   * Calculate fixed delay
   * @param attemptNumber - Zero-based attempt number (unused)
   * @returns Delay in milliseconds
   */
  calculateDelay(attemptNumber: number): number {
    // Always return the same fixed delay
    return this.delayMs;
  }
  
  /**
   * Determine if retry should be attempted
   * @param error - The error that occurred
   * @param attemptNumber - Zero-based attempt number
   * @returns true if retry should be attempted
   */
  shouldRetry(error: Error, attemptNumber: number): boolean {
    // Check if max attempts exceeded
    if (attemptNumber >= this.maxAttempts) {
      return false;
    }
    
    // Check if error is retryable
    return ErrorClassifier.isRetryable(error);
  }
}

/**
 * Factory function to create retry strategies from configuration
 * @param config - Retry configuration object
 * @returns Configured retry strategy
 */
export function createRetryStrategy(config: {
  strategy: 'exponential' | 'linear' | 'fixed';
  maxAttempts: number;
  baseDelayMs?: number;
  incrementMs?: number;
  fixedDelayMs?: number;
  maxDelayMs?: number;
  jitterFactor?: number;
}): RetryStrategy {
  switch (config.strategy) {
    case 'exponential':
      return new ExponentialBackoffStrategy(
        config.baseDelayMs ?? 1000,
        config.maxAttempts,
        config.maxDelayMs ?? 300000,
        config.jitterFactor ?? 0.1
      );
      
    case 'linear':
      return new LinearBackoffStrategy(
        config.incrementMs ?? 2000,
        config.maxAttempts,
        config.maxDelayMs ?? 300000
      );
      
    case 'fixed':
      return new FixedDelayStrategy(
        config.fixedDelayMs ?? 5000,
        config.maxAttempts
      );
      
    default:
      throw new Error(`Unknown retry strategy: ${config.strategy}`);
  }
}

