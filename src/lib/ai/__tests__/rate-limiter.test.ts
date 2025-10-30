/**
 * Unit Tests for Rate Limiter
 * 
 * Tests the sliding window rate limiting algorithm including:
 * - Request tracking within window
 * - Expired request cleanup
 * - Utilization calculation
 * - Rate limit threshold enforcement
 * - Edge cases and boundary conditions
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { RateLimiter, resetRateLimiter } from '../rate-limiter';
import type { RateLimitConfig } from '../types';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;
  let config: RateLimitConfig;

  beforeEach(() => {
    // Reset singleton before each test
    resetRateLimiter();
    
    // Create test configuration
    config = {
      requestLimit: 10,
      windowSeconds: 60,
      threshold: 0.9,
      pauseMs: 5000,
      maxConcurrentRequests: 3
    };
    
    rateLimiter = new RateLimiter(config);
  });

  describe('Request Tracking', () => {
    test('should track requests within window', () => {
      rateLimiter.addRequest('req1');
      rateLimiter.addRequest('req2');
      rateLimiter.addRequest('req3');
      
      expect(rateLimiter.getCurrentCount()).toBe(3);
    });

    test('should return unique request IDs when not provided', () => {
      const id1 = rateLimiter.addRequest();
      const id2 = rateLimiter.addRequest();
      
      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    test('should use provided request IDs', () => {
      const customId = 'custom_request_123';
      const returnedId = rateLimiter.addRequest(customId);
      
      expect(returnedId).toBe(customId);
    });
  });

  describe('Expired Request Cleanup', () => {
    test('should remove requests outside the window', async () => {
      // Use a short window for testing
      const shortWindowConfig = { ...config, windowSeconds: 1 };
      rateLimiter = new RateLimiter(shortWindowConfig);
      
      rateLimiter.addRequest('req1');
      expect(rateLimiter.getCurrentCount()).toBe(1);
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      expect(rateLimiter.getCurrentCount()).toBe(0);
    });

    test('should keep requests within the window', async () => {
      const shortWindowConfig = { ...config, windowSeconds: 2 };
      rateLimiter = new RateLimiter(shortWindowConfig);
      
      rateLimiter.addRequest('req1');
      
      // Wait but not long enough to expire
      await new Promise(resolve => setTimeout(resolve, 500));
      
      expect(rateLimiter.getCurrentCount()).toBe(1);
    });

    test('should handle multiple requests expiring at different times', async () => {
      const shortWindowConfig = { ...config, windowSeconds: 1 };
      rateLimiter = new RateLimiter(shortWindowConfig);
      
      rateLimiter.addRequest('req1');
      await new Promise(resolve => setTimeout(resolve, 600));
      rateLimiter.addRequest('req2');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // req1 should be expired, req2 should still be valid
      expect(rateLimiter.getCurrentCount()).toBe(1);
    });
  });

  describe('Utilization Calculation', () => {
    test('should correctly calculate 0% utilization', () => {
      const status = rateLimiter.getStatus();
      
      expect(status.utilization).toBe(0);
      expect(status.status).toBe('healthy');
    });

    test('should correctly calculate 50% utilization', () => {
      for (let i = 0; i < 5; i++) {
        rateLimiter.addRequest(`req${i}`);
      }
      
      const status = rateLimiter.getStatus();
      
      expect(status.utilization).toBe(50);
      expect(status.status).toBe('healthy');
    });

    test('should correctly calculate 75% utilization', () => {
      for (let i = 0; i < 7; i++) {
        rateLimiter.addRequest(`req${i}`);
      }
      
      const status = rateLimiter.getStatus();
      
      expect(status.utilization).toBeCloseTo(70, 0);
      expect(status.status).toBe('approaching');
    });

    test('should correctly calculate 90% utilization', () => {
      for (let i = 0; i < 9; i++) {
        rateLimiter.addRequest(`req${i}`);
      }
      
      const status = rateLimiter.getStatus();
      
      expect(status.utilization).toBe(90);
      expect(status.status).toBe('throttled');
    });

    test('should cap utilization at 100%', () => {
      // Add more requests than the limit
      for (let i = 0; i < 15; i++) {
        rateLimiter.addRequest(`req${i}`);
      }
      
      const status = rateLimiter.getStatus();
      
      expect(status.utilization).toBe(100);
    });
  });

  describe('Rate Limit Threshold', () => {
    test('should allow requests below threshold', () => {
      // Add 8 requests (80% of 10 limit, below 90% threshold)
      for (let i = 0; i < 8; i++) {
        rateLimiter.addRequest(`req${i}`);
      }
      
      expect(rateLimiter.canMakeRequest()).toBe(true);
    });

    test('should block requests at threshold', () => {
      // Add 9 requests (90% of 10 limit, at threshold)
      for (let i = 0; i < 9; i++) {
        rateLimiter.addRequest(`req${i}`);
      }
      
      expect(rateLimiter.canMakeRequest()).toBe(false);
    });

    test('should block requests above threshold', () => {
      // Add all 10 requests (100%)
      for (let i = 0; i < 10; i++) {
        rateLimiter.addRequest(`req${i}`);
      }
      
      expect(rateLimiter.canMakeRequest()).toBe(false);
    });
  });

  describe('Wait for Capacity', () => {
    test('should resolve immediately if capacity available', async () => {
      const startTime = Date.now();
      await rateLimiter.waitForCapacity();
      const elapsed = Date.now() - startTime;
      
      // Should be nearly instant
      expect(elapsed).toBeLessThan(100);
    });

    test('should wait until capacity available', async () => {
      const shortWindowConfig = { ...config, windowSeconds: 1 };
      rateLimiter = new RateLimiter(shortWindowConfig);
      
      // Fill to threshold
      for (let i = 0; i < 9; i++) {
        rateLimiter.addRequest(`req${i}`);
      }
      
      expect(rateLimiter.canMakeRequest()).toBe(false);
      
      // Wait should resolve after window expires
      const startTime = Date.now();
      await rateLimiter.waitForCapacity(2000);
      const elapsed = Date.now() - startTime;
      
      expect(elapsed).toBeGreaterThan(900);
      expect(rateLimiter.canMakeRequest()).toBe(true);
    });

    test('should timeout if capacity not available', async () => {
      // Fill to threshold
      for (let i = 0; i < 9; i++) {
        rateLimiter.addRequest(`req${i}`);
      }
      
      // Short timeout should fail
      await expect(rateLimiter.waitForCapacity(100)).rejects.toThrow('Timeout');
    });
  });

  describe('Status Information', () => {
    test('should provide complete status', () => {
      rateLimiter.addRequest('req1');
      rateLimiter.addRequest('req2');
      
      const status = rateLimiter.getStatus();
      
      expect(status).toHaveProperty('currentCount', 2);
      expect(status).toHaveProperty('limit', 10);
      expect(status).toHaveProperty('utilization', 20);
      expect(status).toHaveProperty('canMakeRequest', true);
      expect(status).toHaveProperty('estimatedWaitMs');
      expect(status).toHaveProperty('status', 'healthy');
    });

    test('should calculate estimated wait time correctly', () => {
      // Fill to threshold
      for (let i = 0; i < 9; i++) {
        rateLimiter.addRequest(`req${i}`);
      }
      
      const status = rateLimiter.getStatus();
      
      expect(status.estimatedWaitMs).toBeGreaterThan(0);
      expect(status.estimatedWaitMs).toBeLessThanOrEqual(config.windowSeconds * 1000);
    });
  });

  describe('Configuration Management', () => {
    test('should allow configuration updates', () => {
      rateLimiter.updateConfig({ requestLimit: 20 });
      
      const newConfig = rateLimiter.getConfig();
      expect(newConfig.requestLimit).toBe(20);
    });

    test('should preserve other config when updating', () => {
      rateLimiter.updateConfig({ requestLimit: 20 });
      
      const newConfig = rateLimiter.getConfig();
      expect(newConfig.windowSeconds).toBe(config.windowSeconds);
      expect(newConfig.threshold).toBe(config.threshold);
    });
  });

  describe('Metrics and Events', () => {
    test('should track events', () => {
      // Fill to approaching threshold (70%)
      for (let i = 0; i < 7; i++) {
        rateLimiter.addRequest(`req${i}`);
      }
      
      // Get metrics
      const metrics = rateLimiter.getMetrics();
      
      expect(metrics).toHaveProperty('currentRequests');
      expect(metrics).toHaveProperty('utilization');
      expect(metrics).toHaveProperty('status');
    });

    test('should return recent events', () => {
      // Trigger some events by hitting thresholds
      for (let i = 0; i < 9; i++) {
        rateLimiter.addRequest(`req${i}`);
      }
      
      const events = rateLimiter.getRecentEvents(5);
      expect(Array.isArray(events)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero requests', () => {
      expect(rateLimiter.getCurrentCount()).toBe(0);
      expect(rateLimiter.canMakeRequest()).toBe(true);
    });

    test('should handle rapid successive requests', () => {
      const ids: string[] = [];
      for (let i = 0; i < 100; i++) {
        ids.push(rateLimiter.addRequest());
      }
      
      // All IDs should be unique
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(100);
    });

    test('should handle reset correctly', () => {
      for (let i = 0; i < 5; i++) {
        rateLimiter.addRequest(`req${i}`);
      }
      
      rateLimiter.reset();
      
      expect(rateLimiter.getCurrentCount()).toBe(0);
      expect(rateLimiter.getRecentEvents().length).toBe(0);
    });
  });

  describe('Async Operations', () => {
    test('should handle concurrent checkRateLimit calls', async () => {
      const checks = Array(10).fill(null).map(() => 
        rateLimiter.checkRateLimit('test')
      );
      
      const results = await Promise.all(checks);
      
      // All should succeed since we're below threshold
      expect(results.every(r => r === true)).toBe(true);
    });
  });

  describe('Boundary Conditions', () => {
    test('should handle exactly at threshold', () => {
      // Add exactly 9 requests (90% of 10)
      for (let i = 0; i < 9; i++) {
        rateLimiter.addRequest(`req${i}`);
      }
      
      // Should be exactly at threshold
      const status = rateLimiter.getStatus();
      expect(status.utilization).toBe(90);
      expect(status.canMakeRequest).toBe(false);
    });

    test('should handle one below threshold', () => {
      // Add 8 requests (89.9% when considering floating point)
      for (let i = 0; i < 8; i++) {
        rateLimiter.addRequest(`req${i}`);
      }
      
      const status = rateLimiter.getStatus();
      expect(status.canMakeRequest).toBe(true);
    });

    test('should handle window edge (time wraparound)', async () => {
      const shortWindowConfig = { ...config, windowSeconds: 1 };
      rateLimiter = new RateLimiter(shortWindowConfig);
      
      rateLimiter.addRequest('req1');
      
      // Wait almost to expiry
      await new Promise(resolve => setTimeout(resolve, 900));
      rateLimiter.addRequest('req2');
      
      // Both should still be tracked
      expect(rateLimiter.getCurrentCount()).toBe(2);
      
      // Wait for first to expire
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Only second should remain
      expect(rateLimiter.getCurrentCount()).toBe(1);
    });
  });
});

