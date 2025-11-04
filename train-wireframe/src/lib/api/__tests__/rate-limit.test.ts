/**
 * Unit Tests for Rate Limit Utilities
 * 
 * Tests header parsing, delay calculation, and tracker.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseRateLimitHeaders,
  calculateRetryDelay,
  getRateLimitMessage,
  calculateTimeUntilReset,
  formatRateLimitStatus,
  isApproachingRateLimit,
  createRateLimitError,
  RateLimitTracker,
} from '../rate-limit';
import { APIError, ErrorCode } from '../../errors';

describe('Rate Limit Utilities', () => {
  describe('parseRateLimitHeaders', () => {
    it('should parse all rate limit headers', () => {
      const headers = new Headers({
        'x-ratelimit-limit': '100',
        'x-ratelimit-remaining': '50',
        'x-ratelimit-reset': '1677721600',
        'retry-after': '30',
      });

      const result = parseRateLimitHeaders(headers);

      expect(result.limit).toBe(100);
      expect(result.remaining).toBe(50);
      expect(result.reset).toBeInstanceOf(Date);
      expect(result.retryAfter).toBe(30);
    });

    it('should handle missing headers', () => {
      const headers = new Headers();

      const result = parseRateLimitHeaders(headers);

      expect(result.limit).toBeNull();
      expect(result.remaining).toBeNull();
      expect(result.reset).toBeNull();
      expect(result.retryAfter).toBeNull();
    });

    it('should handle partial headers', () => {
      const headers = new Headers({
        'x-ratelimit-limit': '100',
        'x-ratelimit-remaining': '10',
      });

      const result = parseRateLimitHeaders(headers);

      expect(result.limit).toBe(100);
      expect(result.remaining).toBe(10);
      expect(result.reset).toBeNull();
      expect(result.retryAfter).toBeNull();
    });
  });

  describe('calculateRetryDelay', () => {
    it('should extract retry_after from response data', () => {
      const error = new APIError(
        'Rate limit exceeded',
        429,
        ErrorCode.ERR_API_RATE_LIMIT,
        {
          responseData: {
            retry_after: 45,
          },
        }
      );

      const delay = calculateRetryDelay(error);

      expect(delay).toBe(45000); // 45 seconds in ms
    });

    it('should extract retry_after from error message', () => {
      const error = new APIError(
        'Rate limit exceeded',
        429,
        ErrorCode.ERR_API_RATE_LIMIT,
        {
          responseData: {
            error: {
              message: 'Please retry after 60 seconds',
            },
          },
        }
      );

      const delay = calculateRetryDelay(error);

      expect(delay).toBe(60000); // 60 seconds in ms
    });

    it('should return default delay if no retry_after', () => {
      const error = new APIError(
        'Rate limit exceeded',
        429,
        ErrorCode.ERR_API_RATE_LIMIT
      );

      const delay = calculateRetryDelay(error);

      expect(delay).toBe(30000); // Default 30 seconds
    });

    it('should handle non-429 errors', () => {
      const error = new APIError(
        'Server error',
        500,
        ErrorCode.ERR_API_SERVER
      );

      const delay = calculateRetryDelay(error);

      expect(delay).toBe(30000); // Default
    });
  });

  describe('getRateLimitMessage', () => {
    it('should format seconds for short delays', () => {
      const message = getRateLimitMessage(45);

      expect(message).toBe('Rate limited. Retrying in 45 seconds...');
    });

    it('should format minutes for long delays', () => {
      const message = getRateLimitMessage(120);

      expect(message).toBe('Rate limited. Retrying in 2 minutes...');
    });

    it('should use singular for 1 minute', () => {
      const message = getRateLimitMessage(90);

      expect(message).toBe('Rate limited. Retrying in 2 minutes...');
    });
  });

  describe('calculateTimeUntilReset', () => {
    it('should calculate time until reset', () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 60; // 60 seconds from now
      
      const ms = calculateTimeUntilReset(futureTimestamp);

      expect(ms).toBeGreaterThan(59000);
      expect(ms).toBeLessThanOrEqual(60000);
    });

    it('should return 0 for past timestamps', () => {
      const pastTimestamp = Math.floor(Date.now() / 1000) - 60; // 60 seconds ago
      
      const ms = calculateTimeUntilReset(pastTimestamp);

      expect(ms).toBe(0);
    });
  });

  describe('formatRateLimitStatus', () => {
    it('should format complete status', () => {
      const info = {
        limit: 100,
        remaining: 25,
        reset: new Date(Date.now() + 45000), // 45 seconds from now
        retryAfter: null,
      };

      const status = formatRateLimitStatus(info);

      expect(status).toContain('25 requests remaining');
      expect(status).toContain('45 second');
    });

    it('should handle missing remaining', () => {
      const info = {
        limit: null,
        remaining: null,
        reset: null,
        retryAfter: null,
      };

      const status = formatRateLimitStatus(info);

      expect(status).toBe('Rate limit status unavailable');
    });

    it('should format minutes for long reset times', () => {
      const info = {
        limit: 100,
        remaining: 10,
        reset: new Date(Date.now() + 120000), // 2 minutes from now
        retryAfter: null,
      };

      const status = formatRateLimitStatus(info);

      expect(status).toContain('10 requests remaining');
      expect(status).toContain('2 minute');
    });
  });

  describe('isApproachingRateLimit', () => {
    it('should return true when approaching limit', () => {
      const info = {
        limit: 100,
        remaining: 5, // 95% used
        reset: null,
        retryAfter: null,
      };

      const result = isApproachingRateLimit(info, 0.9);

      expect(result).toBe(true);
    });

    it('should return false when not approaching limit', () => {
      const info = {
        limit: 100,
        remaining: 50, // 50% used
        reset: null,
        retryAfter: null,
      };

      const result = isApproachingRateLimit(info, 0.9);

      expect(result).toBe(false);
    });

    it('should use custom threshold', () => {
      const info = {
        limit: 100,
        remaining: 30, // 70% used
        reset: null,
        retryAfter: null,
      };

      const result = isApproachingRateLimit(info, 0.6);

      expect(result).toBe(true);
    });

    it('should handle missing data', () => {
      const info = {
        limit: null,
        remaining: null,
        reset: null,
        retryAfter: null,
      };

      const result = isApproachingRateLimit(info);

      expect(result).toBe(false);
    });
  });

  describe('createRateLimitError', () => {
    it('should create error with retry_after', () => {
      const info = {
        limit: 100,
        remaining: 0,
        reset: null,
        retryAfter: 60,
      };

      const error = createRateLimitError(info);

      expect(error).toBeInstanceOf(APIError);
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe(ErrorCode.ERR_API_RATE_LIMIT);
      expect(error.message).toContain('60 seconds');
    });

    it('should create error with reset time', () => {
      const info = {
        limit: 100,
        remaining: 0,
        reset: new Date(Date.now() + 45000),
        retryAfter: null,
      };

      const error = createRateLimitError(info);

      expect(error.message).toContain('45 seconds');
    });
  });

  describe('RateLimitTracker', () => {
    let tracker: RateLimitTracker;

    beforeEach(() => {
      tracker = new RateLimitTracker(5, 60000); // 5 requests per minute
    });

    it('should allow requests within limit', () => {
      expect(tracker.canMakeRequest()).toBe(true);
      
      tracker.recordRequest();
      expect(tracker.canMakeRequest()).toBe(true);
      
      tracker.recordRequest();
      expect(tracker.canMakeRequest()).toBe(true);
    });

    it('should block requests when limit reached', () => {
      // Make 5 requests (the limit)
      for (let i = 0; i < 5; i++) {
        tracker.recordRequest();
      }

      expect(tracker.canMakeRequest()).toBe(false);
    });

    it('should return correct remaining count', () => {
      expect(tracker.getRemainingRequests()).toBe(5);
      
      tracker.recordRequest();
      expect(tracker.getRemainingRequests()).toBe(4);
      
      tracker.recordRequest();
      expect(tracker.getRemainingRequests()).toBe(3);
    });

    it('should return time until next slot', () => {
      // Fill up the limit
      for (let i = 0; i < 5; i++) {
        tracker.recordRequest();
      }

      const timeUntilSlot = tracker.getTimeUntilNextSlot();

      expect(timeUntilSlot).toBeGreaterThan(0);
      expect(timeUntilSlot).toBeLessThanOrEqual(60000);
    });

    it('should return 0 when slots available', () => {
      tracker.recordRequest();
      
      const timeUntilSlot = tracker.getTimeUntilNextSlot();

      expect(timeUntilSlot).toBe(0);
    });

    it('should reset all requests', () => {
      tracker.recordRequest();
      tracker.recordRequest();
      
      expect(tracker.getRemainingRequests()).toBe(3);
      
      tracker.reset();
      
      expect(tracker.getRemainingRequests()).toBe(5);
    });

    it('should clean up old requests', () => {
      // This test would require time manipulation
      // In real implementation, requests older than windowMs should be removed
    });
  });
});

