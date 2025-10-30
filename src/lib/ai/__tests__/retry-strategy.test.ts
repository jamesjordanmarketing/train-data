/**
 * Unit tests for retry strategies
 * 
 * Tests exponential, linear, and fixed delay retry strategies
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  ExponentialBackoffStrategy,
  LinearBackoffStrategy,
  FixedDelayStrategy,
  createRetryStrategy,
} from '../retry-strategy';
import { ErrorClassifier } from '../error-classifier';

describe('ExponentialBackoffStrategy', () => {
  test('calculates exponential delays correctly', () => {
    const strategy = new ExponentialBackoffStrategy(1000, 3, 300000, 0);
    
    // With 0 jitter for predictable results
    expect(strategy.calculateDelay(0)).toBe(1000);  // 1000 * 2^0 = 1000
    expect(strategy.calculateDelay(1)).toBe(2000);  // 1000 * 2^1 = 2000
    expect(strategy.calculateDelay(2)).toBe(4000);  // 1000 * 2^2 = 4000
    expect(strategy.calculateDelay(3)).toBe(8000);  // 1000 * 2^3 = 8000
  });

  test('adds random jitter to delays', () => {
    const strategy = new ExponentialBackoffStrategy(1000, 3, 300000, 0.1);
    
    const delays = [
      strategy.calculateDelay(1),
      strategy.calculateDelay(1),
      strategy.calculateDelay(1),
    ];
    
    // All delays should be within the expected range (2000 + 0-200 jitter)
    delays.forEach(delay => {
      expect(delay).toBeGreaterThanOrEqual(2000);
      expect(delay).toBeLessThanOrEqual(2200);
    });
    
    // At least some delays should be different due to jitter
    const uniqueDelays = new Set(delays);
    expect(uniqueDelays.size).toBeGreaterThan(1);
  });

  test('respects max delay cap', () => {
    const strategy = new ExponentialBackoffStrategy(1000, 10, 10000, 0);
    
    // Large attempt number should hit the cap
    expect(strategy.calculateDelay(10)).toBe(10000);  // Would be 1024000 without cap
    expect(strategy.calculateDelay(20)).toBe(10000);  // Would be much larger without cap
  });

  test('enforces max attempts limit', () => {
    const strategy = new ExponentialBackoffStrategy(1000, 3);
    const retryableError = new Error('500 Server Error');
    
    expect(strategy.shouldRetry(retryableError, 0)).toBe(true);
    expect(strategy.shouldRetry(retryableError, 1)).toBe(true);
    expect(strategy.shouldRetry(retryableError, 2)).toBe(true);
    expect(strategy.shouldRetry(retryableError, 3)).toBe(false); // Max reached
  });

  test('respects error retryability', () => {
    const strategy = new ExponentialBackoffStrategy(1000, 3);
    const retryableError = new Error('500 Server Error');
    const nonRetryableError = new Error('400 Bad Request');
    
    expect(strategy.shouldRetry(retryableError, 0)).toBe(true);
    expect(strategy.shouldRetry(nonRetryableError, 0)).toBe(false);
  });

  test('validates constructor parameters', () => {
    expect(() => new ExponentialBackoffStrategy(0, 3)).toThrow();
    expect(() => new ExponentialBackoffStrategy(-1000, 3)).toThrow();
    expect(() => new ExponentialBackoffStrategy(1000, -1)).toThrow();
    expect(() => new ExponentialBackoffStrategy(1000, 3, 500, 0.1)).toThrow(); // maxDelay < baseDelay
    expect(() => new ExponentialBackoffStrategy(1000, 3, 300000, 1.5)).toThrow(); // jitter > 1
  });
});

describe('LinearBackoffStrategy', () => {
  test('calculates linear delays correctly', () => {
    const strategy = new LinearBackoffStrategy(2000, 3);
    
    expect(strategy.calculateDelay(0)).toBe(2000);   // 2000 * 1
    expect(strategy.calculateDelay(1)).toBe(4000);   // 2000 * 2
    expect(strategy.calculateDelay(2)).toBe(6000);   // 2000 * 3
    expect(strategy.calculateDelay(3)).toBe(8000);   // 2000 * 4
  });

  test('respects max delay cap', () => {
    const strategy = new LinearBackoffStrategy(2000, 10, 10000);
    
    expect(strategy.calculateDelay(0)).toBe(2000);
    expect(strategy.calculateDelay(4)).toBe(10000);  // Would be 10000
    expect(strategy.calculateDelay(10)).toBe(10000); // Would be 22000 without cap
  });

  test('enforces max attempts limit', () => {
    const strategy = new LinearBackoffStrategy(2000, 3);
    const retryableError = new Error('503 Service Unavailable');
    
    expect(strategy.shouldRetry(retryableError, 0)).toBe(true);
    expect(strategy.shouldRetry(retryableError, 1)).toBe(true);
    expect(strategy.shouldRetry(retryableError, 2)).toBe(true);
    expect(strategy.shouldRetry(retryableError, 3)).toBe(false);
  });

  test('validates constructor parameters', () => {
    expect(() => new LinearBackoffStrategy(0, 3)).toThrow();
    expect(() => new LinearBackoffStrategy(-2000, 3)).toThrow();
    expect(() => new LinearBackoffStrategy(2000, -1)).toThrow();
    expect(() => new LinearBackoffStrategy(2000, 3, 1000)).toThrow(); // maxDelay < increment
  });
});

describe('FixedDelayStrategy', () => {
  test('returns constant delay', () => {
    const strategy = new FixedDelayStrategy(5000, 3);
    
    expect(strategy.calculateDelay(0)).toBe(5000);
    expect(strategy.calculateDelay(1)).toBe(5000);
    expect(strategy.calculateDelay(2)).toBe(5000);
    expect(strategy.calculateDelay(10)).toBe(5000);
  });

  test('enforces max attempts limit', () => {
    const strategy = new FixedDelayStrategy(5000, 3);
    const retryableError = new Error('429 Rate Limit');
    
    expect(strategy.shouldRetry(retryableError, 0)).toBe(true);
    expect(strategy.shouldRetry(retryableError, 1)).toBe(true);
    expect(strategy.shouldRetry(retryableError, 2)).toBe(true);
    expect(strategy.shouldRetry(retryableError, 3)).toBe(false);
  });

  test('validates constructor parameters', () => {
    expect(() => new FixedDelayStrategy(0, 3)).toThrow();
    expect(() => new FixedDelayStrategy(-5000, 3)).toThrow();
    expect(() => new FixedDelayStrategy(5000, -1)).toThrow();
  });
});

describe('createRetryStrategy', () => {
  test('creates exponential strategy', () => {
    const strategy = createRetryStrategy({
      strategy: 'exponential',
      maxAttempts: 3,
      baseDelayMs: 1000,
      maxDelayMs: 300000,
      jitterFactor: 0.1,
    });
    
    expect(strategy).toBeInstanceOf(ExponentialBackoffStrategy);
    expect(strategy.maxAttempts).toBe(3);
  });

  test('creates linear strategy', () => {
    const strategy = createRetryStrategy({
      strategy: 'linear',
      maxAttempts: 3,
      incrementMs: 2000,
      maxDelayMs: 300000,
    });
    
    expect(strategy).toBeInstanceOf(LinearBackoffStrategy);
    expect(strategy.maxAttempts).toBe(3);
  });

  test('creates fixed strategy', () => {
    const strategy = createRetryStrategy({
      strategy: 'fixed',
      maxAttempts: 3,
      fixedDelayMs: 5000,
    });
    
    expect(strategy).toBeInstanceOf(FixedDelayStrategy);
    expect(strategy.maxAttempts).toBe(3);
  });

  test('uses default values when not provided', () => {
    const exponential = createRetryStrategy({
      strategy: 'exponential',
      maxAttempts: 3,
    });
    expect(exponential.calculateDelay(0)).toBe(1000); // Default base delay
    
    const linear = createRetryStrategy({
      strategy: 'linear',
      maxAttempts: 3,
    });
    expect(linear.calculateDelay(0)).toBe(2000); // Default increment
    
    const fixed = createRetryStrategy({
      strategy: 'fixed',
      maxAttempts: 3,
    });
    expect(fixed.calculateDelay(0)).toBe(5000); // Default fixed delay
  });

  test('throws error for unknown strategy', () => {
    expect(() => createRetryStrategy({
      strategy: 'unknown' as any,
      maxAttempts: 3,
    })).toThrow('Unknown retry strategy');
  });
});

describe('Strategy Comparison', () => {
  test('exponential grows faster than linear', () => {
    const exponential = new ExponentialBackoffStrategy(1000, 10, 300000, 0);
    const linear = new LinearBackoffStrategy(1000, 10, 300000);
    
    // At attempt 5, exponential should be much larger
    const expDelay = exponential.calculateDelay(5);  // 1000 * 2^5 = 32000
    const linDelay = linear.calculateDelay(5);       // 1000 * 6 = 6000
    
    expect(expDelay).toBeGreaterThan(linDelay);
  });

  test('fixed remains constant while others grow', () => {
    const exponential = new ExponentialBackoffStrategy(1000, 10, 300000, 0);
    const linear = new LinearBackoffStrategy(1000, 10, 300000);
    const fixed = new FixedDelayStrategy(5000, 10);
    
    const exp0 = exponential.calculateDelay(0);
    const exp5 = exponential.calculateDelay(5);
    expect(exp5).toBeGreaterThan(exp0);
    
    const lin0 = linear.calculateDelay(0);
    const lin5 = linear.calculateDelay(5);
    expect(lin5).toBeGreaterThan(lin0);
    
    const fix0 = fixed.calculateDelay(0);
    const fix5 = fixed.calculateDelay(5);
    expect(fix5).toBe(fix0);
  });
});

