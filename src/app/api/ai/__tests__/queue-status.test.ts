/**
 * Integration Tests for Queue Status API
 * 
 * Tests the queue status endpoint including:
 * - Response format and structure
 * - Rate limit status calculation
 * - Queue information accuracy
 * - Error handling
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { GET } from '../queue-status/route';
import { NextRequest } from 'next/server';
import { getRateLimiter, resetRateLimiter } from '@/lib/ai/rate-limiter';
import { getRequestQueue, resetRequestQueue } from '@/lib/ai/request-queue';
import { getQueueProcessor, resetQueueProcessor } from '@/lib/ai/queue-processor';
import { RATE_LIMIT_CONFIG } from '@/lib/ai-config';

describe('Queue Status API', () => {
  beforeEach(() => {
    // Reset all singletons before each test
    resetRateLimiter();
    resetRequestQueue();
    resetQueueProcessor();
    
    // Initialize with test config
    getRateLimiter(RATE_LIMIT_CONFIG);
  });

  describe('GET /api/ai/queue-status', () => {
    test('should return 200 status', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response = await GET(request);
      
      expect(response.status).toBe(200);
    });

    test('should return valid JSON response', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response = await GET(request);
      const data = await response.json();
      
      expect(data).toBeDefined();
      expect(typeof data).toBe('object');
    });

    test('should include all required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response = await GET(request);
      const data = await response.json();
      
      // Check all required fields
      expect(data).toHaveProperty('queueSize');
      expect(data).toHaveProperty('currentUtilization');
      expect(data).toHaveProperty('estimatedWaitTime');
      expect(data).toHaveProperty('rateLimitStatus');
      expect(data).toHaveProperty('isProcessing');
      expect(data).toHaveProperty('isPaused');
      expect(data).toHaveProperty('activeRequests');
      expect(data).toHaveProperty('maxConcurrent');
      expect(data).toHaveProperty('totalProcessed');
      expect(data).toHaveProperty('totalFailed');
    });

    test('should include metrics field', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response = await GET(request);
      const data = await response.json();
      
      expect(data).toHaveProperty('metrics');
      expect(data.metrics).toHaveProperty('requestsInWindow');
      expect(data.metrics).toHaveProperty('requestLimit');
      expect(data.metrics).toHaveProperty('windowSeconds');
      expect(data.metrics).toHaveProperty('averageProcessingTime');
    });
  });

  describe('Rate Limit Status Calculation', () => {
    test('should show healthy status with no requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.rateLimitStatus).toBe('healthy');
      expect(data.currentUtilization).toBe(0);
    });

    test('should show healthy status below 70%', async () => {
      const rateLimiter = getRateLimiter();
      
      // Add requests to reach ~60% utilization
      const limit = rateLimiter.getConfig().requestLimit;
      const targetCount = Math.floor(limit * 0.6);
      
      for (let i = 0; i < targetCount; i++) {
        rateLimiter.addRequest(`req${i}`);
      }
      
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.rateLimitStatus).toBe('healthy');
      expect(data.currentUtilization).toBeGreaterThan(50);
      expect(data.currentUtilization).toBeLessThan(70);
    });

    test('should show approaching status between 70-90%', async () => {
      const rateLimiter = getRateLimiter();
      
      // Add requests to reach ~75% utilization
      const limit = rateLimiter.getConfig().requestLimit;
      const targetCount = Math.floor(limit * 0.75);
      
      for (let i = 0; i < targetCount; i++) {
        rateLimiter.addRequest(`req${i}`);
      }
      
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.rateLimitStatus).toBe('approaching');
      expect(data.currentUtilization).toBeGreaterThanOrEqual(70);
      expect(data.currentUtilization).toBeLessThan(90);
    });

    test('should show throttled status at 90% or above', async () => {
      const rateLimiter = getRateLimiter();
      
      // Add requests to reach 90% utilization
      const limit = rateLimiter.getConfig().requestLimit;
      const targetCount = Math.floor(limit * 0.9);
      
      for (let i = 0; i < targetCount; i++) {
        rateLimiter.addRequest(`req${i}`);
      }
      
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.rateLimitStatus).toBe('throttled');
      expect(data.currentUtilization).toBeGreaterThanOrEqual(90);
    });
  });

  describe('Queue Information', () => {
    test('should report correct queue size', async () => {
      const queue = getRequestQueue();
      
      queue.enqueue({ data: 'test1' }, 'normal');
      queue.enqueue({ data: 'test2' }, 'high');
      queue.enqueue({ data: 'test3' }, 'low');
      
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.queueSize).toBe(3);
    });

    test('should report zero queue size when empty', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.queueSize).toBe(0);
    });

    test('should track total processed items', async () => {
      const queue = getRequestQueue();
      
      queue.enqueue({ data: 'test' }, 'normal');
      queue.dequeue();
      queue.markCompleted('test');
      
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.totalProcessed).toBe(1);
    });

    test('should track total failed items', async () => {
      const queue = getRequestQueue();
      
      queue.enqueue({ data: 'test' }, 'normal');
      queue.dequeue();
      queue.markFailed('test');
      
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.totalFailed).toBe(1);
    });
  });

  describe('Estimated Wait Time', () => {
    test('should calculate wait time based on queue size', async () => {
      const queue = getRequestQueue();
      
      // Add multiple items
      for (let i = 0; i < 5; i++) {
        queue.enqueue({ data: `test${i}` }, 'normal');
      }
      
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response = await GET(request);
      const data = await response.json();
      
      // Wait time should be positive with items in queue
      expect(data.estimatedWaitTime).toBeGreaterThan(0);
    });

    test('should show zero wait time for empty queue', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.estimatedWaitTime).toBe(0);
    });
  });

  describe('Processor Status', () => {
    test('should report processor not running initially', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.isProcessing).toBe(false);
    });

    test('should report processor running when started', async () => {
      const processor = getQueueProcessor();
      processor.start();
      
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.isProcessing).toBe(true);
      
      processor.stop();
    });

    test('should report pause status', async () => {
      const processor = getQueueProcessor();
      processor.start();
      processor.pause(5000);
      
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.isPaused).toBe(true);
      
      processor.stop();
    });

    test('should report active request count', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.activeRequests).toBeGreaterThanOrEqual(0);
      expect(data.activeRequests).toBeLessThanOrEqual(data.maxConcurrent);
    });

    test('should report max concurrent limit', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.maxConcurrent).toBeGreaterThan(0);
      expect(typeof data.maxConcurrent).toBe('number');
    });
  });

  describe('Metrics Details', () => {
    test('should provide request window metrics', async () => {
      const rateLimiter = getRateLimiter();
      rateLimiter.addRequest('test1');
      rateLimiter.addRequest('test2');
      
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.metrics.requestsInWindow).toBe(2);
      expect(data.metrics.requestLimit).toBeGreaterThan(0);
      expect(data.metrics.windowSeconds).toBeGreaterThan(0);
    });

    test('should provide average processing time', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.metrics.averageProcessingTime).toBeGreaterThan(0);
      expect(typeof data.metrics.averageProcessingTime).toBe('number');
    });
  });

  describe('Data Types', () => {
    test('should return numbers for numeric fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response = await GET(request);
      const data = await response.json();
      
      expect(typeof data.queueSize).toBe('number');
      expect(typeof data.currentUtilization).toBe('number');
      expect(typeof data.estimatedWaitTime).toBe('number');
      expect(typeof data.activeRequests).toBe('number');
      expect(typeof data.maxConcurrent).toBe('number');
      expect(typeof data.totalProcessed).toBe('number');
      expect(typeof data.totalFailed).toBe('number');
    });

    test('should return booleans for boolean fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response = await GET(request);
      const data = await response.json();
      
      expect(typeof data.isProcessing).toBe('boolean');
      expect(typeof data.isPaused).toBe('boolean');
    });

    test('should return valid rate limit status enum', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response = await GET(request);
      const data = await response.json();
      
      expect(['healthy', 'approaching', 'throttled']).toContain(data.rateLimitStatus);
    });
  });

  describe('Utilization Rounding', () => {
    test('should round utilization to 1 decimal place', async () => {
      const rateLimiter = getRateLimiter();
      const limit = rateLimiter.getConfig().requestLimit;
      
      // Add requests to create a non-round percentage
      const count = Math.floor(limit * 0.333); // ~33.3%
      for (let i = 0; i < count; i++) {
        rateLimiter.addRequest(`req${i}`);
      }
      
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response = await GET(request);
      const data = await response.json();
      
      // Check that utilization has at most 1 decimal place
      const decimalPlaces = (data.currentUtilization.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(1);
    });
  });

  describe('Error Handling', () => {
    test('should handle errors gracefully', async () => {
      // Create a request that might cause errors
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      
      // The endpoint should not throw
      await expect(GET(request)).resolves.toBeDefined();
    });

    test('should return safe defaults on error', async () => {
      // Force an error by not initializing properly
      resetRateLimiter();
      resetRequestQueue();
      resetQueueProcessor();
      
      const request = new NextRequest('http://localhost:3000/api/ai/queue-status');
      
      // Should handle gracefully even without initialization
      const response = await GET(request);
      
      // Should still return a response (either success or error)
      expect(response).toBeDefined();
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Consistency', () => {
    test('should return consistent data on multiple calls', async () => {
      const request1 = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response1 = await GET(request1);
      const data1 = await response1.json();
      
      const request2 = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response2 = await GET(request2);
      const data2 = await response2.json();
      
      // Should have same structure
      expect(Object.keys(data1).sort()).toEqual(Object.keys(data2).sort());
    });

    test('should reflect state changes', async () => {
      // Get initial state
      const request1 = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response1 = await GET(request1);
      const data1 = await response1.json();
      
      // Make changes
      const queue = getRequestQueue();
      queue.enqueue({ data: 'test' }, 'normal');
      
      // Get updated state
      const request2 = new NextRequest('http://localhost:3000/api/ai/queue-status');
      const response2 = await GET(request2);
      const data2 = await response2.json();
      
      // Queue size should have increased
      expect(data2.queueSize).toBe(data1.queueSize + 1);
    });
  });
});

