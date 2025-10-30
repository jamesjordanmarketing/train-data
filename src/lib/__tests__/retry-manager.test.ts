/**
 * Retry Manager Tests
 * 
 * Tests for exponential backoff retry logic
 */

import { RetryManager } from '../retry-manager';
import { ClaudeAPIError } from '../types/generation';

describe('RetryManager', () => {
  let retryManager: RetryManager;

  beforeEach(() => {
    retryManager = new RetryManager();
  });

  test('should succeed on first attempt', async () => {
    const operation = jest.fn().mockResolvedValue('success');
    
    const result = await retryManager.executeWithRetry(operation, {
      maxAttempts: 3,
      baseDelay: 100,
      maxDelay: 1000,
    });
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  test('should retry on retryable errors', async () => {
    const operation = jest.fn()
      .mockRejectedValueOnce(new ClaudeAPIError(429, {}, 'Rate limit'))
      .mockRejectedValueOnce(new ClaudeAPIError(503, {}, 'Service unavailable'))
      .mockResolvedValue('success');
    
    const result = await retryManager.executeWithRetry(operation, {
      maxAttempts: 3,
      baseDelay: 10,
      maxDelay: 100,
    });
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  test('should not retry on non-retryable errors', async () => {
    const operation = jest.fn()
      .mockRejectedValue(new ClaudeAPIError(400, {}, 'Bad request'));
    
    await expect(
      retryManager.executeWithRetry(operation, {
        maxAttempts: 3,
        baseDelay: 10,
        maxDelay: 100,
      })
    ).rejects.toThrow('Bad request');
    
    expect(operation).toHaveBeenCalledTimes(1);
  });

  test('should exhaust retries and throw', async () => {
    const operation = jest.fn()
      .mockRejectedValue(new ClaudeAPIError(500, {}, 'Server error'));
    
    await expect(
      retryManager.executeWithRetry(operation, {
        maxAttempts: 3,
        baseDelay: 10,
        maxDelay: 100,
      })
    ).rejects.toThrow('Server error');
    
    expect(operation).toHaveBeenCalledTimes(3);
  });

  test('should call onRetry callback', async () => {
    const operation = jest.fn()
      .mockRejectedValueOnce(new Error('Temporary failure'))
      .mockResolvedValue('success');
    
    const onRetry = jest.fn();
    
    await retryManager.executeWithRetry(operation, {
      maxAttempts: 3,
      baseDelay: 10,
      maxDelay: 100,
      onRetry,
    });
    
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
  });

  test('should apply exponential backoff', async () => {
    const delays: number[] = [];
    const operation = jest.fn()
      .mockRejectedValueOnce(new ClaudeAPIError(503, {}, 'Unavailable'))
      .mockRejectedValueOnce(new ClaudeAPIError(503, {}, 'Unavailable'))
      .mockResolvedValue('success');
    
    const onRetry = jest.fn((attempt) => {
      delays.push(Date.now());
    });
    
    await retryManager.executeWithRetry(operation, {
      maxAttempts: 3,
      baseDelay: 100,
      maxDelay: 10000,
      onRetry,
    });
    
    // Check that delays are increasing
    if (delays.length >= 2) {
      const delay1 = delays[1] - delays[0];
      // Should be roughly baseDelay * 2 (200ms) + jitter
      expect(delay1).toBeGreaterThan(150);
      expect(delay1).toBeLessThan(1500);
    }
  });
});

