/**
 * Rate Limiter Tests
 * 
 * Tests for sliding window rate limiter
 */

import { RateLimiter } from '../rate-limiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      windowMs: 1000, // 1 second for testing
      maxRequests: 5,
      enableQueue: true,
      pauseThreshold: 0.8,
    });
  });

  test('should allow requests under limit', async () => {
    // Should complete without delay
    const start = Date.now();
    await rateLimiter.acquire('test');
    await rateLimiter.acquire('test');
    await rateLimiter.acquire('test');
    const elapsed = Date.now() - start;
    
    expect(elapsed).toBeLessThan(100);
  });

  test('should track usage correctly', async () => {
    await rateLimiter.acquire('test');
    await rateLimiter.acquire('test');
    
    const status = rateLimiter.getStatus('test');
    expect(status.used).toBe(2);
    expect(status.remaining).toBe(3);
  });

  test('should pause when threshold reached', async () => {
    // Fill up to threshold (80% of 5 = 4)
    await rateLimiter.acquire('test');
    await rateLimiter.acquire('test');
    await rateLimiter.acquire('test');
    await rateLimiter.acquire('test');
    
    const status = rateLimiter.getStatus('test');
    expect(status.isPaused).toBe(true);
  });

  test('should queue requests when at limit', async () => {
    // Fill up to limit
    for (let i = 0; i < 5; i++) {
      await rateLimiter.acquire('test');
    }
    
    // Queue additional request
    const queuePromise = rateLimiter.acquire('test');
    
    const status = rateLimiter.getStatus('test');
    expect(status.used).toBe(5);
    expect(status.remaining).toBe(0);
    
    // Wait for queue to process
    await queuePromise;
  }, 10000);

  test('should reset window after time passes', async () => {
    await rateLimiter.acquire('test');
    await rateLimiter.acquire('test');
    
    // Wait for window to reset
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    const status = rateLimiter.getStatus('test');
    expect(status.used).toBe(0);
    expect(status.remaining).toBe(5);
  }, 10000);

  test('should support multiple keys', async () => {
    await rateLimiter.acquire('key1');
    await rateLimiter.acquire('key2');
    
    const status1 = rateLimiter.getStatus('key1');
    const status2 = rateLimiter.getStatus('key2');
    
    expect(status1.used).toBe(1);
    expect(status2.used).toBe(1);
  });

  test('should clear all keys', async () => {
    await rateLimiter.acquire('key1');
    await rateLimiter.acquire('key2');
    
    rateLimiter.clearAll();
    
    const status1 = rateLimiter.getStatus('key1');
    const status2 = rateLimiter.getStatus('key2');
    
    expect(status1.used).toBe(0);
    expect(status2.used).toBe(0);
  });
});

