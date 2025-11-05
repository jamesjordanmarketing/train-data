/**
 * Retry Logic with Exponential Backoff
 *
 * This module provides:
 * - Automatic retry with exponential backoff
 * - Configurable retry strategies
 * - Jitter to prevent thundering herd
 * - Retry decorator for class methods
 * - Error classification for retry decisions
 *
 * @module api/retry
 */

import { APIError, NetworkError, isRetryable } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';

/**
 * Retry configuration options.
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Initial delay in milliseconds */
  initialDelay: number;
  /** Maximum delay in milliseconds (cap for exponential backoff) */
  maxDelay: number;
  /** Backoff multiplier (e.g., 2 for doubling each time) */
  backoffFactor: number;
  /** Error codes that should trigger retry */
  retryableErrors: string[];
}

/**
 * Default retry configuration.
 * - Max 3 attempts
 * - Exponential backoff: 1s, 2s, 4s, 8s, 16s
 * - Jitter: ±25%
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 16000, // 16 seconds
  backoffFactor: 2,
  retryableErrors: [
    'ERR_API_RATE_LIMIT',
    'ERR_API_SERVER',
    'ERR_API_TIMEOUT',
    'ERR_NET_TIMEOUT',
    'ERR_NET_UNKNOWN',
  ],
};

/**
 * Calculate backoff delay with jitter.
 * Uses exponential backoff with ±25% jitter to prevent thundering herd.
 *
 * @param attempt - Current attempt number (0-based)
 * @param config - Retry configuration
 * @returns Delay in milliseconds
 *
 * @example
 * ```typescript
 * // Attempt 0: ~1000ms (750-1250ms)
 * // Attempt 1: ~2000ms (1500-2500ms)
 * // Attempt 2: ~4000ms (3000-5000ms)
 * const delay = calculateBackoff(attempt, config);
 * ```
 */
function calculateBackoff(attempt: number, config: RetryConfig): number {
  const delay = Math.min(
    config.initialDelay * Math.pow(config.backoffFactor, attempt),
    config.maxDelay
  );

  // Add jitter (±25%)
  const jitter = delay * 0.25 * (Math.random() * 2 - 1);
  return Math.floor(delay + jitter);
}

/**
 * Check if error should trigger retry.
 *
 * @param error - Error to check
 * @param config - Retry configuration
 * @returns True if error should be retried
 *
 * @example
 * ```typescript
 * if (shouldRetry(error, config)) {
 *   // Retry the operation
 * }
 * ```
 */
function shouldRetry(error: unknown, config: RetryConfig): boolean {
  if (!isRetryable(error)) {
    return false;
  }

  if (error instanceof APIError || error instanceof NetworkError) {
    return config.retryableErrors.includes(error.code);
  }

  return false;
}

/**
 * Retry wrapper function with exponential backoff.
 * Automatically retries failed operations according to retry policy.
 *
 * @param fn - Async function to retry
 * @param config - Partial retry configuration (merged with defaults)
 * @param context - Context for logging (conversationId, component)
 * @returns Result from successful execution
 *
 * @throws Last error if all retry attempts fail
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   () => apiClient.generateConversation(prompt),
 *   { maxAttempts: 3 },
 *   { conversationId: '123', component: 'GenerationService' }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  context?: { conversationId?: string; component?: string }
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: unknown;

  for (let attempt = 0; attempt < retryConfig.maxAttempts; attempt++) {
    try {
      if (attempt > 0) {
        const delay = calculateBackoff(attempt - 1, retryConfig);
        errorLogger.info(`Retrying after ${delay}ms (attempt ${attempt + 1}/${retryConfig.maxAttempts})`, {
          ...context,
          attempt,
          delay,
        });
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const result = await fn();

      if (attempt > 0) {
        errorLogger.info(`Retry succeeded on attempt ${attempt + 1}`, context);
      }

      return result;
    } catch (error) {
      lastError = error;

      if (attempt === retryConfig.maxAttempts - 1 || !shouldRetry(error, retryConfig)) {
        errorLogger.error(
          `Request failed after ${attempt + 1} attempts`,
          error instanceof Error ? error : undefined,
          {
            ...context,
            attempts: attempt + 1,
            finalError: true,
          }
        );
        throw error;
      }

      errorLogger.warn(
        `Request failed, will retry (attempt ${attempt + 1}/${retryConfig.maxAttempts})`,
        error instanceof Error ? error : undefined,
        {
          ...context,
          attempt: attempt + 1,
        }
      );
    }
  }

  throw lastError;
}

/**
 * Retry decorator for class methods.
 * Apply to methods that should automatically retry on failure.
 *
 * @param config - Partial retry configuration
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * class GenerationService {
 *   @Retry({ maxAttempts: 3 })
 *   async generateConversation(prompt: string) {
 *     // Implementation
 *   }
 * }
 * ```
 */
export function Retry(config: Partial<RetryConfig> = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return withRetry(
        () => originalMethod.apply(this, args),
        config,
        { component: target.constructor.name }
      );
    };

    return descriptor;
  };
}

/**
 * Retry a function with custom backoff strategy.
 * Useful for special cases that need different retry behavior.
 *
 * @param fn - Function to retry
 * @param shouldRetryFn - Custom retry decision function
 * @param delays - Array of delays in ms for each retry
 * @returns Result from successful execution
 *
 * @example
 * ```typescript
 * const result = await retryWithCustomBackoff(
 *   () => apiCall(),
 *   (error) => error.statusCode === 503,
 *   [1000, 2000, 5000, 10000] // Custom delays
 * );
 * ```
 */
export async function retryWithCustomBackoff<T>(
  fn: () => Promise<T>,
  shouldRetryFn: (error: unknown) => boolean,
  delays: number[]
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      if (attempt > 0) {
        const delay = delays[attempt - 1];
        errorLogger.info(`Custom retry after ${delay}ms (attempt ${attempt + 1})`, {
          attempt,
          delay,
        });
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === delays.length || !shouldRetryFn(error)) {
        throw error;
      }

      errorLogger.warn(
        `Custom retry attempt ${attempt + 1} failed`,
        error instanceof Error ? error : undefined,
        { attempt: attempt + 1 }
      );
    }
  }

  throw lastError;
}

/**
 * Retry with timeout.
 * Combines retry logic with an overall timeout for the operation.
 *
 * @param fn - Function to retry
 * @param config - Retry configuration
 * @param timeoutMs - Overall timeout in milliseconds
 * @returns Result from successful execution
 *
 * @throws TimeoutError if overall timeout is exceeded
 *
 * @example
 * ```typescript
 * // Retry up to 3 times but fail if total time exceeds 30 seconds
 * const result = await retryWithTimeout(
 *   () => slowApiCall(),
 *   { maxAttempts: 3 },
 *   30000
 * );
 * ```
 */
export async function retryWithTimeout<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig>,
  timeoutMs: number
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new NetworkError(
        `Operation timed out after ${timeoutMs}ms`,
        'ERR_NET_TIMEOUT' as any
      ));
    }, timeoutMs);
  });

  return Promise.race([
    withRetry(fn, config),
    timeoutPromise,
  ]);
}

