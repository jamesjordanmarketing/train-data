/**
 * Priority-Based Request Queue
 * 
 * Implements a priority queue for managing AI generation requests.
 * Higher priority items are processed first. Supports tracking metrics
 * for monitoring and capacity planning.
 * 
 * @module request-queue
 */

import type { QueueItem, QueuePriority, QueueInfo, QueueStats } from './types';

/**
 * Priority queue implementation for managing request processing order
 */
export class RequestQueue<T = any> {
  private queue: QueueItem<T>[] = [];
  private totalEnqueued = 0;
  private totalProcessed = 0;
  private totalFailed = 0;
  private isProcessing = false;
  private processingTimes: number[] = [];
  private peakSize = 0;

  /**
   * Adds an item to the queue with specified priority
   * @param payload - The request payload
   * @param priority - Priority level (default: 'normal')
   * @param options - Optional callbacks and metadata
   * @returns The queue item ID
   */
  enqueue(
    payload: T,
    priority: QueuePriority = 'normal',
    options?: {
      onComplete?: (result: any) => void;
      onError?: (error: Error) => void;
      id?: string;
    }
  ): string {
    const id = options?.id || `queue_${++this.totalEnqueued}_${Date.now()}`;
    
    const item: QueueItem<T> = {
      id,
      priority,
      payload,
      enqueuedAt: Date.now(),
      retryCount: 0,
      onComplete: options?.onComplete,
      onError: options?.onError
    };
    
    // Insert item based on priority
    // Priority order: high > normal > low
    // Within same priority, maintain FIFO order
    const insertIndex = this.findInsertPosition(priority);
    this.queue.splice(insertIndex, 0, item);
    
    // Update peak size
    if (this.queue.length > this.peakSize) {
      this.peakSize = this.queue.length;
    }
    
    return id;
  }

  /**
   * Removes and returns the highest priority item from the queue
   * @returns The next queue item, or undefined if queue is empty
   */
  dequeue(): QueueItem<T> | undefined {
    const item = this.queue.shift();
    
    if (item) {
      const waitTime = Date.now() - item.enqueuedAt;
      this.processingTimes.push(waitTime);
      
      // Keep only last 100 processing times for average calculation
      if (this.processingTimes.length > 100) {
        this.processingTimes = this.processingTimes.slice(-100);
      }
    }
    
    return item;
  }

  /**
   * Peeks at the next item without removing it
   * @returns The next queue item, or undefined if queue is empty
   */
  peek(): QueueItem<T> | undefined {
    return this.queue[0];
  }

  /**
   * Checks if the queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Gets the current queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Marks an item as successfully processed
   * @param itemId - The queue item ID
   */
  markCompleted(itemId: string): void {
    this.totalProcessed++;
  }

  /**
   * Marks an item as failed
   * @param itemId - The queue item ID
   * @param shouldRequeue - Whether to requeue the item
   */
  markFailed(itemId: string, shouldRequeue: boolean = false): void {
    this.totalFailed++;
    
    if (shouldRequeue) {
      // Find the item in failed items and requeue (implementation depends on tracking)
      // For now, we'll rely on the caller to requeue manually
    }
  }

  /**
   * Removes a specific item from the queue by ID
   * @param itemId - The queue item ID
   * @returns true if item was found and removed
   */
  remove(itemId: string): boolean {
    const index = this.queue.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Clears all items from the queue
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Gets information about the current queue state
   */
  getInfo(): QueueInfo {
    const averageProcessingTime = this.processingTimes.length > 0
      ? this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length
      : 20000; // Default 20s estimate
    
    return {
      size: this.queue.length,
      totalEnqueued: this.totalEnqueued,
      totalProcessed: this.totalProcessed,
      totalFailed: this.totalFailed,
      isProcessing: this.isProcessing,
      averageProcessingTime
    };
  }

  /**
   * Gets detailed statistics about the queue
   */
  getStats(): QueueStats {
    const info = this.getInfo();
    const itemsByPriority = {
      high: this.queue.filter(item => item.priority === 'high').length,
      normal: this.queue.filter(item => item.priority === 'normal').length,
      low: this.queue.filter(item => item.priority === 'low').length
    };
    
    return {
      currentSize: info.size,
      peakSize: this.peakSize,
      averageWaitTime: info.averageProcessingTime,
      itemsByPriority
    };
  }

  /**
   * Sets the processing state
   * @param isProcessing - Whether queue is currently being processed
   */
  setProcessing(isProcessing: boolean): void {
    this.isProcessing = isProcessing;
  }

  /**
   * Gets all items in the queue (for debugging)
   * @returns Array of queue items
   */
  getAll(): QueueItem<T>[] {
    return [...this.queue];
  }

  /**
   * Finds items matching a predicate
   * @param predicate - Function to test each item
   * @returns Array of matching items
   */
  find(predicate: (item: QueueItem<T>) => boolean): QueueItem<T>[] {
    return this.queue.filter(predicate);
  }

  /**
   * Gets items by priority
   * @param priority - The priority level to filter by
   */
  getByPriority(priority: QueuePriority): QueueItem<T>[] {
    return this.queue.filter(item => item.priority === priority);
  }

  /**
   * Requeues an item with updated metadata
   * @param item - The item to requeue
   * @param incrementRetry - Whether to increment retry count
   */
  requeue(item: QueueItem<T>, incrementRetry: boolean = true): void {
    const updatedItem = {
      ...item,
      retryCount: incrementRetry ? item.retryCount + 1 : item.retryCount,
      enqueuedAt: Date.now() // Reset enqueue time
    };
    
    const insertIndex = this.findInsertPosition(item.priority);
    this.queue.splice(insertIndex, 0, updatedItem);
  }

  /**
   * Resets all metrics (useful for testing)
   */
  reset(): void {
    this.queue = [];
    this.totalEnqueued = 0;
    this.totalProcessed = 0;
    this.totalFailed = 0;
    this.isProcessing = false;
    this.processingTimes = [];
    this.peakSize = 0;
  }

  /**
   * Finds the correct insertion position for a given priority
   * Maintains priority order while preserving FIFO within same priority
   * @private
   */
  private findInsertPosition(priority: QueuePriority): number {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    const priorityValue = priorityOrder[priority];
    
    // Find the first item with lower priority
    for (let i = 0; i < this.queue.length; i++) {
      const itemPriority = priorityOrder[this.queue[i].priority];
      if (itemPriority > priorityValue) {
        return i;
      }
    }
    
    // If no lower priority found, insert at end
    return this.queue.length;
  }
}

// Export singleton instance
let requestQueueInstance: RequestQueue | null = null;

/**
 * Gets or creates the singleton request queue instance
 */
export function getRequestQueue<T = any>(): RequestQueue<T> {
  if (!requestQueueInstance) {
    requestQueueInstance = new RequestQueue<T>();
  }
  return requestQueueInstance as RequestQueue<T>;
}

/**
 * Resets the singleton instance (useful for testing)
 */
export function resetRequestQueue(): void {
  requestQueueInstance = null;
}

export default RequestQueue;

