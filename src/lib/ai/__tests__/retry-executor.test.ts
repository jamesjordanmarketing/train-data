/**
 * Unit tests for retry executor
 * 
 * Tests retry execution logic, metrics tracking, and error handling
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { RetryExecutor } from '../retry-executor';
import { ExponentialBackoffStrategy, FixedDelayStrategy } from '../retry-strategy';

describe('RetryExecutor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Execution', () => {
    test('succeeds on first attempt without retries', async () => {
      const strategy = new FixedDelayStrategy(100, 3);
      const executor = new RetryExecutor(strategy);
      
      let attempts = 0;
      const fn = async () => {
        attempts++;
        return 'success';
      };
      
      const result = await executor.execute(fn, { requestId: 'test-1' });
      
      expect(result).toBe('success');
      expect(attempts).toBe(1);
    });

    test('succeeds after retries', async () => {
      const strategy = new FixedDelayStrategy(50, 5);
      const executor = new RetryExecutor(strategy);
      
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('500 Server Error');
        }
        return 'success';
      };
      
      const result = await executor.execute(fn, { requestId: 'test-2' });
      
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });
  });

  describe('Failed Execution', () => {
    test('fails after max attempts with retryable error', async () => {
      const strategy = new FixedDelayStrategy(50, 3);
      const executor = new RetryExecutor(strategy);
      
      let attempts = 0;
      const fn = async () => {
        attempts++;
        throw new Error('500 Server Error');
      };
      
      await expect(
        executor.execute(fn, { requestId: 'test-3' })
      ).rejects.toThrow('500 Server Error');
      
      expect(attempts).toBe(4); // Initial + 3 retries
    });

    test('fails immediately with non-retryable error', async () => {
      const strategy = new FixedDelayStrategy(50, 3);
      const executor = new RetryExecutor(strategy);
      
      let attempts = 0;
      const fn = async () => {
        attempts++;
        throw new Error('400 Bad Request');
      };
      
      await expect(
        executor.execute(fn, { requestId: 'test-4' })
      ).rejects.toThrow('400 Bad Request');
      
      expect(attempts).toBe(1); // No retries for client errors
    });

    test('fails immediately with validation error', async () => {
      const strategy = new FixedDelayStrategy(50, 3);
      const executor = new RetryExecutor(strategy);
      
      let attempts = 0;
      const fn = async () => {
        attempts++;
        throw new Error('Validation failed');
      };
      
      await expect(
        executor.execute(fn, { requestId: 'test-5' })
      ).rejects.toThrow('Validation failed');
      
      expect(attempts).toBe(1); // No retries for validation errors
    });
  });

  describe('Retry Delays', () => {
    test('waits between retry attempts', async () => {
      const strategy = new FixedDelayStrategy(100, 3);
      const executor = new RetryExecutor(strategy);
      
      const timestamps: number[] = [];
      let attempts = 0;
      
      const fn = async () => {
        timestamps.push(Date.now());
        attempts++;
        if (attempts < 3) {
          throw new Error('500 Server Error');
        }
        return 'success';
      };
      
      await executor.execute(fn, { requestId: 'test-6' });
      
      expect(attempts).toBe(3);
      expect(timestamps.length).toBe(3);
      
      // Check delays between attempts (should be ~100ms)
      const delay1 = timestamps[1] - timestamps[0];
      const delay2 = timestamps[2] - timestamps[1];
      
      expect(delay1).toBeGreaterThanOrEqual(95); // Allow some variance
      expect(delay1).toBeLessThanOrEqual(150);
      expect(delay2).toBeGreaterThanOrEqual(95);
      expect(delay2).toBeLessThanOrEqual(150);
    });

    test('uses exponential backoff delays', async () => {
      const strategy = new ExponentialBackoffStrategy(50, 3, 10000, 0);
      const executor = new RetryExecutor(strategy);
      
      const timestamps: number[] = [];
      let attempts = 0;
      
      const fn = async () => {
        timestamps.push(Date.now());
        attempts++;
        if (attempts < 4) {
          throw new Error('500 Server Error');
        }
        return 'success';
      };
      
      await executor.execute(fn, { requestId: 'test-7' });
      
      expect(attempts).toBe(4);
      
      // Check exponential growth in delays
      const delay1 = timestamps[1] - timestamps[0]; // ~50ms
      const delay2 = timestamps[2] - timestamps[1]; // ~100ms
      const delay3 = timestamps[3] - timestamps[2]; // ~200ms
      
      expect(delay2).toBeGreaterThan(delay1);
      expect(delay3).toBeGreaterThan(delay2);
    });
  });

  describe('Error Context', () => {
    test('includes request context in execution', async () => {
      const strategy = new FixedDelayStrategy(50, 3);
      const executor = new RetryExecutor(strategy);
      
      const fn = async () => 'success';
      
      const context = {
        requestId: 'test-8',
        conversationId: 'conv-123',
        templateId: 'template-456',
        metadata: { key: 'value' },
      };
      
      const result = await executor.execute(fn, context);
      expect(result).toBe('success');
    });
  });

  describe('Strategy Management', () => {
    test('gets current strategy', () => {
      const strategy = new FixedDelayStrategy(100, 3);
      const executor = new RetryExecutor(strategy);
      
      const currentStrategy = executor.getStrategy();
      expect(currentStrategy).toBe(strategy);
      expect(currentStrategy.maxAttempts).toBe(3);
    });

    test('updates strategy', async () => {
      const strategy1 = new FixedDelayStrategy(100, 2);
      const executor = new RetryExecutor(strategy1);
      
      let attempts = 0;
      const fn1 = async () => {
        attempts++;
        throw new Error('500 Server Error');
      };
      
      // Should fail after 3 attempts (1 initial + 2 retries)
      await expect(
        executor.execute(fn1, { requestId: 'test-9' })
      ).rejects.toThrow();
      expect(attempts).toBe(3);
      
      // Update strategy to allow more retries
      const strategy2 = new FixedDelayStrategy(100, 5);
      executor.setStrategy(strategy2);
      
      attempts = 0;
      const fn2 = async () => {
        attempts++;
        if (attempts < 5) {
          throw new Error('500 Server Error');
        }
        return 'success';
      };
      
      // Should succeed after 5 attempts
      const result = await executor.execute(fn2, { requestId: 'test-10' });
      expect(result).toBe('success');
      expect(attempts).toBe(5);
    });
  });

  describe('Constructor Validation', () => {
    test('throws error if strategy is null', () => {
      expect(() => new RetryExecutor(null as any)).toThrow('Retry strategy is required');
    });

    test('throws error if strategy is undefined', () => {
      expect(() => new RetryExecutor(undefined as any)).toThrow('Retry strategy is required');
    });
  });

  describe('Mixed Error Scenarios', () => {
    test('handles mix of retryable and non-retryable errors', async () => {
      const strategy = new FixedDelayStrategy(50, 5);
      const executor = new RetryExecutor(strategy);
      
      let attempts = 0;
      const fn = async () => {
        attempts++;
        
        // First two attempts: retryable errors
        if (attempts <= 2) {
          throw new Error('500 Server Error');
        }
        
        // Third attempt: non-retryable error
        throw new Error('400 Bad Request');
      };
      
      await expect(
        executor.execute(fn, { requestId: 'test-11' })
      ).rejects.toThrow('400 Bad Request');
      
      // Should stop at third attempt due to non-retryable error
      expect(attempts).toBe(3);
    });

    test('handles transient network issues', async () => {
      const strategy = new FixedDelayStrategy(50, 5);
      const executor = new RetryExecutor(strategy);
      
      let attempts = 0;
      const fn = async () => {
        attempts++;
        
        // Simulate transient network issues
        if (attempts === 1) throw new Error('ECONNREFUSED');
        if (attempts === 2) throw new Error('ETIMEDOUT');
        if (attempts === 3) throw new Error('Network request failed');
        
        return 'success';
      };
      
      const result = await executor.execute(fn, { requestId: 'test-12' });
      
      expect(result).toBe('success');
      expect(attempts).toBe(4);
    });
  });

  describe('Concurrent Executions', () => {
    test('handles multiple concurrent executions', async () => {
      const strategy = new FixedDelayStrategy(50, 3);
      const executor = new RetryExecutor(strategy);
      
      const executions = Array.from({ length: 5 }, (_, i) => {
        let attempts = 0;
        return executor.execute(
          async () => {
            attempts++;
            if (attempts < 2) {
              throw new Error('500 Server Error');
            }
            return `success-${i}`;
          },
          { requestId: `test-13-${i}` }
        );
      });
      
      const results = await Promise.all(executions);
      
      expect(results).toHaveLength(5);
      results.forEach((result, i) => {
        expect(result).toBe(`success-${i}`);
      });
    });
  });

  describe('Performance', () => {
    test('completes fast execution without significant overhead', async () => {
      const strategy = new FixedDelayStrategy(10, 3);
      const executor = new RetryExecutor(strategy);
      
      const startTime = Date.now();
      
      await executor.execute(
        async () => 'success',
        { requestId: 'test-14' }
      );
      
      const duration = Date.now() - startTime;
      
      // Should complete in under 50ms for successful first attempt
      expect(duration).toBeLessThan(50);
    });
  });
});

