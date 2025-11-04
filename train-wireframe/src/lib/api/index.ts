/**
 * API Module Exports
 * 
 * Central exports for API error handling, retry logic, and rate limiting.
 * 
 * @module api
 */

// Export API client
export { APIClient, default as apiClient } from './client';

// Export retry utilities
export {
  withRetry,
  Retry,
  retryWithCustomBackoff,
  retryWithTimeout,
  type RetryConfig,
} from './retry';

// Export rate limit utilities
export {
  parseRateLimitHeaders,
  calculateRetryDelay,
  getRateLimitMessage,
  calculateTimeUntilReset,
  formatRateLimitStatus,
  isApproachingRateLimit,
  createRateLimitError,
  RateLimitTracker,
  type RateLimitInfo,
} from './rate-limit';

