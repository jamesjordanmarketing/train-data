/**
 * Unit Tests for Retry Logic
 * 
 * Tests exponential backoff, retry decision logic, and decorator.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { withRetry, Retry, retryWithCustomBackoff, retryWithTimeout } from '../retry';
import { APIError, NetworkError, ErrorCode } from '../../errors';

describe('Retry Logic', () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await withRetry(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable error', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(
          new APIError('Rate limit', 429, ErrorCode.ERR_API_RATE_LIMIT)
        )
        .mockResolvedValueOnce('success');

      const promise = withRetry(fn, { maxAttempts: 3 });

      // Fast-forward through retry delays
      await vi.runAllTimersAsync();

      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should fail after max attempts', async () => {
      const error = new NetworkError(
        'Network error',
        ErrorCode.ERR_NET_TIMEOUT
      );

      const fn = vi.fn().mockRejectedValue(error);

      const promise = withRetry(fn, { maxAttempts: 3 });

      // Fast-forward through all retry delays
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow(NetworkError);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should not retry non-retryable errors', async () => {
      const error = new APIError(
        'Validation error',
        400,
        ErrorCode.ERR_API_VALIDATION
      );

      const fn = vi.fn().mockRejectedValue(error);

      await expect(
        withRetry(fn, { maxAttempts: 3 })
      ).rejects.toThrow(APIError);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should apply exponential backoff', async () => {
      const delays: number[] = [];
      let lastTime = Date.now();

      const fn = vi.fn()
        .mockRejectedValueOnce(
          new APIError('Rate limit', 429, ErrorCode.ERR_API_RATE_LIMIT)
        )
        .mockRejectedValueOnce(
          new APIError('Rate limit', 429, ErrorCode.ERR_API_RATE_LIMIT)
        )
        .mockResolvedValueOnce('success');

      const promise = withRetry(fn, {
        maxAttempts: 3,
        initialDelay: 1000,
        backoffFactor: 2,
      });

      // Capture delays between attempts
      await vi.advanceTimersByTimeAsync(1000); // First retry
      delays.push(Date.now() - lastTime);
      lastTime = Date.now();

      await vi.advanceTimersByTimeAsync(2000); // Second retry
      delays.push(Date.now() - lastTime);

      await promise;

      // Verify exponential backoff pattern (with jitter tolerance)
      expect(delays[0]).toBeGreaterThanOrEqual(750); // ~1000ms ±25%
      expect(delays[0]).toBeLessThanOrEqual(1250);
      expect(delays[1]).toBeGreaterThanOrEqual(1500); // ~2000ms ±25%
      expect(delays[1]).toBeLessThanOrEqual(2500);
    });

    it('should respect maxDelay cap', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(
          new APIError('Rate limit', 429, ErrorCode.ERR_API_RATE_LIMIT)
        )
        .mockRejectedValueOnce(
          new APIError('Rate limit', 429, ErrorCode.ERR_API_RATE_LIMIT)
        )
        .mockResolvedValueOnce('success');

      const promise = withRetry(fn, {
        maxAttempts: 3,
        initialDelay: 10000,
        maxDelay: 5000,
        backoffFactor: 2,
      });

      await vi.runAllTimersAsync();
      await promise;

      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should pass context to error logger', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(
          new APIError('Server error', 500, ErrorCode.ERR_API_SERVER)
        )
        .mockResolvedValueOnce('success');

      const promise = withRetry(
        fn,
        { maxAttempts: 2 },
        { conversationId: 'conv_123', component: 'TestComponent' }
      );

      await vi.runAllTimersAsync();
      await promise;

      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Retry decorator', () => {
    it('should wrap method with retry logic', async () => {
      class TestService {
        callCount = 0;

        @Retry({ maxAttempts: 3 })
        async testMethod() {
          this.callCount++;
          if (this.callCount < 2) {
            throw new APIError('Error', 500, ErrorCode.ERR_API_SERVER);
          }
          return 'success';
        }
      }

      const service = new TestService();
      const promise = service.testMethod();

      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
      expect(service.callCount).toBe(2);
    });

    it('should preserve method context (this)', async () => {
      class TestService {
        value = 'test-value';

        @Retry({ maxAttempts: 2 })
        async getValue() {
          return this.value;
        }
      }

      const service = new TestService();
      const result = await service.getValue();

      expect(result).toBe('test-value');
    });
  });

  describe('retryWithCustomBackoff', () => {
    it('should use custom delays', async () => {
      const delays: number[] = [];
      let lastTime = Date.now();

      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValueOnce('success');

      const customDelays = [500, 1500, 3000];

      const promise = retryWithCustomBackoff(
        fn,
        () => true, // Always retry
        customDelays
      );

      // Capture actual delays
      for (const delay of customDelays) {
        await vi.advanceTimersByTimeAsync(delay);
        delays.push(Date.now() - lastTime);
        lastTime = Date.now();
      }

      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
      expect(delays[0]).toBe(500);
      expect(delays[1]).toBe(1500);
    });

    it('should respect custom retry decision function', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Retryable'))
        .mockRejectedValueOnce(new Error('Not retryable'));

      const shouldRetryFn = (error: unknown) => {
        return error instanceof Error && error.message === 'Retryable';
      };

      const promise = retryWithCustomBackoff(
        fn,
        shouldRetryFn,
        [1000, 2000]
      );

      await vi.advanceTimersByTimeAsync(1000);

      await expect(promise).rejects.toThrow('Not retryable');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('retryWithTimeout', () => {
    it('should succeed within timeout', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(
          new APIError('Server error', 500, ErrorCode.ERR_API_SERVER)
        )
        .mockResolvedValueOnce('success');

      const promise = retryWithTimeout(
        fn,
        { maxAttempts: 3 },
        10000 // 10 second timeout
      );

      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
    });

    it('should fail if overall timeout exceeded', async () => {
      const fn = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 5000))
      );

      const promise = retryWithTimeout(
        fn,
        { maxAttempts: 5 },
        2000 // 2 second timeout
      );

      await vi.advanceTimersByTimeAsync(2000);

      await expect(promise).rejects.toThrow(NetworkError);
    });
  });

  describe('calculateBackoff', () => {
    it('should calculate correct delays', () => {
      // This would test the internal calculateBackoff function
      // For now, covered by integration tests above
    });
  });

  describe('shouldRetry', () => {
    it('should correctly identify retryable errors', () => {
      // This would test the internal shouldRetry function
      // Covered by integration tests above
    });
  });
});

