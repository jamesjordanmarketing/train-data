/**
 * Unit Tests for Request Queue
 * 
 * Tests the priority queue implementation including:
 * - Priority ordering (high > normal > low)
 * - FIFO within same priority
 * - Queue operations (enqueue, dequeue, peek)
 * - Metrics tracking
 * - Edge cases
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { RequestQueue, resetRequestQueue } from '../request-queue';
import type { QueueItem } from '../types';

describe('RequestQueue', () => {
  let queue: RequestQueue;

  beforeEach(() => {
    resetRequestQueue();
    queue = new RequestQueue();
  });

  describe('Basic Operations', () => {
    test('should enqueue items', () => {
      const id = queue.enqueue({ data: 'test' }, 'normal');
      
      expect(id).toBeTruthy();
      expect(queue.size()).toBe(1);
    });

    test('should dequeue items', () => {
      queue.enqueue({ data: 'test' }, 'normal');
      const item = queue.dequeue();
      
      expect(item).toBeTruthy();
      expect(item?.payload.data).toBe('test');
      expect(queue.size()).toBe(0);
    });

    test('should peek without removing', () => {
      queue.enqueue({ data: 'test' }, 'normal');
      const item = queue.peek();
      
      expect(item).toBeTruthy();
      expect(queue.size()).toBe(1); // Still in queue
    });

    test('should return undefined when dequeuing empty queue', () => {
      const item = queue.dequeue();
      expect(item).toBeUndefined();
    });

    test('should check if queue is empty', () => {
      expect(queue.isEmpty()).toBe(true);
      
      queue.enqueue({ data: 'test' }, 'normal');
      expect(queue.isEmpty()).toBe(false);
    });
  });

  describe('Priority Ordering', () => {
    test('should process high priority before normal', () => {
      queue.enqueue({ data: 'normal' }, 'normal');
      queue.enqueue({ data: 'high' }, 'high');
      
      const first = queue.dequeue();
      expect(first?.payload.data).toBe('high');
      
      const second = queue.dequeue();
      expect(second?.payload.data).toBe('normal');
    });

    test('should process high priority before low', () => {
      queue.enqueue({ data: 'low' }, 'low');
      queue.enqueue({ data: 'high' }, 'high');
      
      const first = queue.dequeue();
      expect(first?.payload.data).toBe('high');
    });

    test('should process normal priority before low', () => {
      queue.enqueue({ data: 'low' }, 'low');
      queue.enqueue({ data: 'normal' }, 'normal');
      
      const first = queue.dequeue();
      expect(first?.payload.data).toBe('normal');
    });

    test('should maintain correct order with mixed priorities', () => {
      queue.enqueue({ data: 'normal1' }, 'normal');
      queue.enqueue({ data: 'low1' }, 'low');
      queue.enqueue({ data: 'high1' }, 'high');
      queue.enqueue({ data: 'normal2' }, 'normal');
      queue.enqueue({ data: 'high2' }, 'high');
      
      // Expected order: high1, high2, normal1, normal2, low1
      expect(queue.dequeue()?.payload.data).toBe('high1');
      expect(queue.dequeue()?.payload.data).toBe('high2');
      expect(queue.dequeue()?.payload.data).toBe('normal1');
      expect(queue.dequeue()?.payload.data).toBe('normal2');
      expect(queue.dequeue()?.payload.data).toBe('low1');
    });
  });

  describe('FIFO within Priority', () => {
    test('should maintain FIFO order for same priority', () => {
      queue.enqueue({ data: 'first' }, 'normal');
      queue.enqueue({ data: 'second' }, 'normal');
      queue.enqueue({ data: 'third' }, 'normal');
      
      expect(queue.dequeue()?.payload.data).toBe('first');
      expect(queue.dequeue()?.payload.data).toBe('second');
      expect(queue.dequeue()?.payload.data).toBe('third');
    });

    test('should maintain FIFO for high priority items', () => {
      queue.enqueue({ data: 'high1' }, 'high');
      queue.enqueue({ data: 'high2' }, 'high');
      queue.enqueue({ data: 'high3' }, 'high');
      
      expect(queue.dequeue()?.payload.data).toBe('high1');
      expect(queue.dequeue()?.payload.data).toBe('high2');
      expect(queue.dequeue()?.payload.data).toBe('high3');
    });
  });

  describe('Item Management', () => {
    test('should remove specific item by ID', () => {
      const id1 = queue.enqueue({ data: 'test1' }, 'normal');
      const id2 = queue.enqueue({ data: 'test2' }, 'normal');
      
      const removed = queue.remove(id1);
      
      expect(removed).toBe(true);
      expect(queue.size()).toBe(1);
      expect(queue.dequeue()?.id).toBe(id2);
    });

    test('should return false when removing non-existent item', () => {
      queue.enqueue({ data: 'test' }, 'normal');
      
      const removed = queue.remove('nonexistent_id');
      expect(removed).toBe(false);
      expect(queue.size()).toBe(1);
    });

    test('should clear all items', () => {
      queue.enqueue({ data: 'test1' }, 'normal');
      queue.enqueue({ data: 'test2' }, 'high');
      queue.enqueue({ data: 'test3' }, 'low');
      
      queue.clear();
      
      expect(queue.isEmpty()).toBe(true);
      expect(queue.size()).toBe(0);
    });
  });

  describe('Callbacks', () => {
    test('should store onComplete callback', () => {
      const mockCallback = jest.fn();
      
      queue.enqueue({ data: 'test' }, 'normal', {
        onComplete: mockCallback
      });
      
      const item = queue.dequeue();
      expect(item?.onComplete).toBe(mockCallback);
    });

    test('should store onError callback', () => {
      const mockCallback = jest.fn();
      
      queue.enqueue({ data: 'test' }, 'normal', {
        onError: mockCallback
      });
      
      const item = queue.dequeue();
      expect(item?.onError).toBe(mockCallback);
    });

    test('should allow custom IDs', () => {
      const customId = 'custom_123';
      
      const id = queue.enqueue({ data: 'test' }, 'normal', {
        id: customId
      });
      
      expect(id).toBe(customId);
    });
  });

  describe('Metrics and Statistics', () => {
    test('should track queue info', () => {
      queue.enqueue({ data: 'test1' }, 'normal');
      queue.enqueue({ data: 'test2' }, 'high');
      
      const info = queue.getInfo();
      
      expect(info.size).toBe(2);
      expect(info.totalEnqueued).toBe(2);
      expect(info.totalProcessed).toBe(0);
      expect(info.totalFailed).toBe(0);
    });

    test('should track processed items', () => {
      const id = queue.enqueue({ data: 'test' }, 'normal');
      queue.dequeue();
      queue.markCompleted(id);
      
      const info = queue.getInfo();
      expect(info.totalProcessed).toBe(1);
    });

    test('should track failed items', () => {
      const id = queue.enqueue({ data: 'test' }, 'normal');
      queue.dequeue();
      queue.markFailed(id);
      
      const info = queue.getInfo();
      expect(info.totalFailed).toBe(1);
    });

    test('should calculate average processing time', () => {
      queue.enqueue({ data: 'test1' }, 'normal');
      queue.dequeue(); // This records processing time
      
      const info = queue.getInfo();
      expect(info.averageProcessingTime).toBeGreaterThan(0);
    });

    test('should provide detailed statistics', () => {
      queue.enqueue({ data: 'test1' }, 'high');
      queue.enqueue({ data: 'test2' }, 'normal');
      queue.enqueue({ data: 'test3' }, 'normal');
      queue.enqueue({ data: 'test4' }, 'low');
      
      const stats = queue.getStats();
      
      expect(stats.currentSize).toBe(4);
      expect(stats.itemsByPriority.high).toBe(1);
      expect(stats.itemsByPriority.normal).toBe(2);
      expect(stats.itemsByPriority.low).toBe(1);
    });

    test('should track peak queue size', () => {
      queue.enqueue({ data: 'test1' }, 'normal');
      queue.enqueue({ data: 'test2' }, 'normal');
      queue.enqueue({ data: 'test3' }, 'normal');
      
      queue.dequeue();
      queue.dequeue();
      
      const stats = queue.getStats();
      expect(stats.peakSize).toBe(3); // Peak was 3, even though current is 1
    });
  });

  describe('Query Operations', () => {
    test('should get all items', () => {
      queue.enqueue({ data: 'test1' }, 'normal');
      queue.enqueue({ data: 'test2' }, 'high');
      
      const all = queue.getAll();
      expect(all.length).toBe(2);
    });

    test('should find items by predicate', () => {
      queue.enqueue({ data: 'apple' }, 'normal');
      queue.enqueue({ data: 'banana' }, 'normal');
      queue.enqueue({ data: 'apricot' }, 'normal');
      
      const aFruits = queue.find(item => 
        item.payload.data.startsWith('a')
      );
      
      expect(aFruits.length).toBe(2);
    });

    test('should get items by priority', () => {
      queue.enqueue({ data: 'high1' }, 'high');
      queue.enqueue({ data: 'normal1' }, 'normal');
      queue.enqueue({ data: 'high2' }, 'high');
      
      const highItems = queue.getByPriority('high');
      expect(highItems.length).toBe(2);
    });
  });

  describe('Requeue Operations', () => {
    test('should requeue item', () => {
      queue.enqueue({ data: 'test' }, 'normal');
      const item = queue.dequeue()!;
      
      queue.requeue(item);
      
      expect(queue.size()).toBe(1);
    });

    test('should increment retry count when requeuing', () => {
      queue.enqueue({ data: 'test' }, 'normal');
      const item = queue.dequeue()!;
      
      expect(item.retryCount).toBe(0);
      
      queue.requeue(item);
      const requeuedItem = queue.dequeue()!;
      
      expect(requeuedItem.retryCount).toBe(1);
    });

    test('should not increment retry count when specified', () => {
      queue.enqueue({ data: 'test' }, 'normal');
      const item = queue.dequeue()!;
      
      queue.requeue(item, false);
      const requeuedItem = queue.dequeue()!;
      
      expect(requeuedItem.retryCount).toBe(0);
    });

    test('should maintain priority when requeuing', () => {
      queue.enqueue({ data: 'normal' }, 'normal');
      queue.enqueue({ data: 'high' }, 'high');
      
      const highItem = queue.dequeue()!; // Gets high priority item
      queue.requeue(highItem);
      
      // Requeued high priority should still be first
      const next = queue.dequeue();
      expect(next?.payload.data).toBe('high');
    });
  });

  describe('Processing State', () => {
    test('should track processing state', () => {
      queue.setProcessing(true);
      expect(queue.getInfo().isProcessing).toBe(true);
      
      queue.setProcessing(false);
      expect(queue.getInfo().isProcessing).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty queue operations', () => {
      expect(queue.dequeue()).toBeUndefined();
      expect(queue.peek()).toBeUndefined();
      expect(queue.isEmpty()).toBe(true);
      expect(queue.size()).toBe(0);
    });

    test('should handle large number of items', () => {
      const itemCount = 1000;
      
      for (let i = 0; i < itemCount; i++) {
        queue.enqueue({ data: `item${i}` }, 'normal');
      }
      
      expect(queue.size()).toBe(itemCount);
      
      // Dequeue all
      let count = 0;
      while (!queue.isEmpty()) {
        queue.dequeue();
        count++;
      }
      
      expect(count).toBe(itemCount);
    });

    test('should handle rapid enqueue/dequeue', () => {
      for (let i = 0; i < 100; i++) {
        queue.enqueue({ data: `item${i}` }, 'normal');
        if (i % 2 === 0) {
          queue.dequeue();
        }
      }
      
      expect(queue.size()).toBe(50); // Half were dequeued
    });

    test('should reset all state', () => {
      queue.enqueue({ data: 'test1' }, 'high');
      queue.enqueue({ data: 'test2' }, 'normal');
      queue.dequeue();
      queue.markCompleted('test1');
      
      queue.reset();
      
      expect(queue.size()).toBe(0);
      expect(queue.getInfo().totalEnqueued).toBe(0);
      expect(queue.getInfo().totalProcessed).toBe(0);
    });
  });

  describe('Item Metadata', () => {
    test('should store enqueue timestamp', () => {
      const beforeEnqueue = Date.now();
      queue.enqueue({ data: 'test' }, 'normal');
      const item = queue.peek()!;
      const afterEnqueue = Date.now();
      
      expect(item.enqueuedAt).toBeGreaterThanOrEqual(beforeEnqueue);
      expect(item.enqueuedAt).toBeLessThanOrEqual(afterEnqueue);
    });

    test('should initialize retry count to 0', () => {
      queue.enqueue({ data: 'test' }, 'normal');
      const item = queue.peek()!;
      
      expect(item.retryCount).toBe(0);
    });

    test('should store complete item structure', () => {
      const payload = { data: 'test', extra: 'info' };
      queue.enqueue(payload, 'high');
      
      const item = queue.peek()!;
      
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('priority', 'high');
      expect(item).toHaveProperty('payload', payload);
      expect(item).toHaveProperty('enqueuedAt');
      expect(item).toHaveProperty('retryCount', 0);
    });
  });

  describe('Concurrent Operations', () => {
    test('should handle multiple operations safely', () => {
      // Simulate concurrent operations
      const operations = [
        () => queue.enqueue({ data: 'op1' }, 'high'),
        () => queue.enqueue({ data: 'op2' }, 'normal'),
        () => queue.enqueue({ data: 'op3' }, 'low'),
        () => queue.dequeue(),
        () => queue.size(),
        () => queue.peek(),
      ];
      
      // Execute all operations
      operations.forEach(op => op());
      
      // Queue should be in a valid state
      expect(queue.size()).toBeGreaterThanOrEqual(0);
      const info = queue.getInfo();
      expect(info.size).toBe(queue.size());
    });
  });
});

