/**
 * Rate Limit Handling Utilities
 * 
 * This module provides:
 * - Rate limit header parsing
 * - Retry delay calculation
 * - User-friendly rate limit messages
 * - Rate limit status tracking
 * 
 * @module api/rate-limit
 */

import { APIError, ErrorCode } from '../errors';

/**
 * Parsed rate limit information from API headers.
 */
export interface RateLimitInfo {
  /** Total request limit per time window */
  limit: number | null;
  /** Remaining requests in current window */
  remaining: number | null;
  /** Timestamp when rate limit resets */
  reset: Date | null;
  /** Seconds to wait before retrying (from Retry-After header) */
  retryAfter: number | null;
}

/**
 * Parse rate limit headers from API response.
 * Extracts rate limit information from standard HTTP headers.
 * 
 * @param headers - Response headers object
 * @returns Parsed rate limit information
 * 
 * @example
 * ```typescript
 * const response = await fetch(url);
 * const rateLimit = parseRateLimitHeaders(response.headers);
 * 
 * if (rateLimit.remaining === 0) {
 *   console.log('Rate limit exhausted, resets at:', rateLimit.reset);
 * }
 * ```
 */
export function parseRateLimitHeaders(headers: Headers): RateLimitInfo {
  return {
    limit: parseInt(headers.get('x-ratelimit-limit') || '') || null,
    remaining: parseInt(headers.get('x-ratelimit-remaining') || '') || null,
    reset: headers.get('x-ratelimit-reset')
      ? new Date(parseInt(headers.get('x-ratelimit-reset')!) * 1000)
      : null,
    retryAfter: parseInt(headers.get('retry-after') || '') || null,
  };
}

/**
 * Calculate delay before retry based on rate limit information.
 * Extracts retry delay from API error response.
 * 
 * @param error - API error from rate limit response
 * @returns Delay in milliseconds
 * 
 * @example
 * ```typescript
 * try {
 *   await apiCall();
 * } catch (error) {
 *   if (error.code === ErrorCode.ERR_API_RATE_LIMIT) {
 *     const delay = calculateRetryDelay(error);
 *     await new Promise(resolve => setTimeout(resolve, delay));
 *     // Retry...
 *   }
 * }
 * ```
 */
export function calculateRetryDelay(error: APIError): number {
  if (error.statusCode === 429 && error.responseData) {
    const data = error.responseData as any;
    
    // Check for retry-after in seconds
    if (data.retry_after) {
      return data.retry_after * 1000;
    }

    // Check for retry-after in error message
    if (data.error?.message) {
      const match = data.error.message.match(/retry after (\d+) seconds?/i);
      if (match) {
        return parseInt(match[1]) * 1000;
      }
    }
  }

  // Default to 30 seconds for rate limits
  return 30000;
}

/**
 * Get user-friendly rate limit message.
 * Formats retry delay into readable message for UI.
 * 
 * @param retryAfterSeconds - Seconds to wait before retry
 * @returns User-friendly message
 * 
 * @example
 * ```typescript
 * const message = getRateLimitMessage(45);
 * // Returns: "Rate limited. Retrying in 45 seconds..."
 * 
 * const message2 = getRateLimitMessage(120);
 * // Returns: "Rate limited. Retrying in 2 minutes..."
 * ```
 */
export function getRateLimitMessage(retryAfterSeconds: number): string {
  if (retryAfterSeconds < 60) {
    return `Rate limited. Retrying in ${retryAfterSeconds} seconds...`;
  }
  const minutes = Math.ceil(retryAfterSeconds / 60);
  return `Rate limited. Retrying in ${minutes} minute${minutes > 1 ? 's' : ''}...`;
}

/**
 * Calculate time until rate limit reset.
 * 
 * @param resetTimestamp - Unix timestamp when rate limit resets
 * @returns Milliseconds until reset
 * 
 * @example
 * ```typescript
 * const msUntilReset = calculateTimeUntilReset(1677721600);
 * console.log(`Rate limit resets in ${msUntilReset / 1000} seconds`);
 * ```
 */
export function calculateTimeUntilReset(resetTimestamp: number): number {
  const now = Date.now();
  const resetMs = resetTimestamp * 1000;
  return Math.max(0, resetMs - now);
}

/**
 * Format rate limit status for display.
 * Creates human-readable status message from rate limit info.
 * 
 * @param info - Rate limit information
 * @returns Formatted status message
 * 
 * @example
 * ```typescript
 * const info = parseRateLimitHeaders(response.headers);
 * const status = formatRateLimitStatus(info);
 * // "50 requests remaining (resets in 45 seconds)"
 * ```
 */
export function formatRateLimitStatus(info: RateLimitInfo): string {
  if (info.remaining === null) {
    return 'Rate limit status unavailable';
  }

  const parts: string[] = [];

  // Remaining requests
  parts.push(`${info.remaining} request${info.remaining !== 1 ? 's' : ''} remaining`);

  // Time until reset
  if (info.reset) {
    const now = new Date();
    const diff = info.reset.getTime() - now.getTime();
    if (diff > 0) {
      const seconds = Math.ceil(diff / 1000);
      if (seconds < 60) {
        parts.push(`resets in ${seconds} second${seconds !== 1 ? 's' : ''}`);
      } else {
        const minutes = Math.ceil(seconds / 60);
        parts.push(`resets in ${minutes} minute${minutes !== 1 ? 's' : ''}`);
      }
    }
  }

  return parts.join(' (') + (parts.length > 1 ? ')' : '');
}

/**
 * Check if we're approaching rate limit.
 * Useful for proactive throttling.
 * 
 * @param info - Rate limit information
 * @param threshold - Threshold percentage (0-1) to trigger warning
 * @returns True if approaching rate limit
 * 
 * @example
 * ```typescript
 * const info = parseRateLimitHeaders(response.headers);
 * if (isApproachingRateLimit(info, 0.9)) {
 *   console.warn('Approaching rate limit, slow down!');
 * }
 * ```
 */
export function isApproachingRateLimit(
  info: RateLimitInfo,
  threshold: number = 0.9
): boolean {
  if (info.limit === null || info.remaining === null) {
    return false;
  }

  const used = info.limit - info.remaining;
  const usageRatio = used / info.limit;
  return usageRatio >= threshold;
}

/**
 * Create a rate limit error with retry information.
 * Convenience function for throwing rate limit errors.
 * 
 * @param info - Rate limit information
 * @returns APIError configured for rate limit
 * 
 * @example
 * ```typescript
 * const info = parseRateLimitHeaders(response.headers);
 * if (info.remaining === 0) {
 *   throw createRateLimitError(info);
 * }
 * ```
 */
export function createRateLimitError(info: RateLimitInfo): APIError {
  let message = 'Rate limit exceeded';
  
  if (info.retryAfter) {
    message += `. Retry after ${info.retryAfter} seconds`;
  } else if (info.reset) {
    const now = new Date();
    const seconds = Math.ceil((info.reset.getTime() - now.getTime()) / 1000);
    message += `. Resets in ${seconds} seconds`;
  }

  return new APIError(
    message,
    429,
    ErrorCode.ERR_API_RATE_LIMIT,
    {
      responseData: {
        retry_after: info.retryAfter,
        limit: info.limit,
        remaining: info.remaining,
        reset: info.reset,
      },
      context: {
        component: 'RateLimiter',
        metadata: { rateLimitInfo: info },
      },
    }
  );
}

/**
 * Rate limit tracker for client-side throttling.
 * Prevents hitting rate limits by tracking local request counts.
 */
export class RateLimitTracker {
  private requests: number[] = [];
  private limit: number;
  private windowMs: number;

  constructor(limit: number, windowMs: number = 60000) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  /**
   * Record a request timestamp.
   */
  recordRequest(): void {
    this.requests.push(Date.now());
    this.cleanup();
  }

  /**
   * Check if we can make another request.
   */
  canMakeRequest(): boolean {
    this.cleanup();
    return this.requests.length < this.limit;
  }

  /**
   * Get number of requests remaining in current window.
   */
  getRemainingRequests(): number {
    this.cleanup();
    return Math.max(0, this.limit - this.requests.length);
  }

  /**
   * Get time until next request slot is available.
   * Returns 0 if a slot is currently available.
   */
  getTimeUntilNextSlot(): number {
    this.cleanup();
    
    if (this.requests.length < this.limit) {
      return 0;
    }

    const oldestRequest = this.requests[0];
    const nextSlot = oldestRequest + this.windowMs;
    return Math.max(0, nextSlot - Date.now());
  }

  /**
   * Remove requests outside the current window.
   */
  private cleanup(): void {
    const cutoff = Date.now() - this.windowMs;
    this.requests = this.requests.filter(timestamp => timestamp > cutoff);
  }

  /**
   * Reset all tracked requests.
   */
  reset(): void {
    this.requests = [];
  }
}

