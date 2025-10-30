/**
 * Rate Limiter Implementation
 * 
 * Sliding window rate limiter for Claude API requests
 */

import { RateLimiterConfig, RateLimitStatus } from './types/generation';

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly enableQueue: boolean;
  private readonly pauseThreshold: number;
  private queue: Array<{ key: string; resolve: () => void }> = [];
  private processingQueue: boolean = false;

  constructor(config: RateLimiterConfig) {
    this.windowMs = config.windowMs;
    this.maxRequests = config.maxRequests;
    this.enableQueue = config.enableQueue;
    this.pauseThreshold = config.pauseThreshold || 0.9;

    // Cleanup old timestamps every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Acquire a rate limit slot
   * 
   * @param key - Rate limit key (default 'default')
   * @returns Promise that resolves when slot is available
   */
  async acquire(key: string = 'default'): Promise<void> {
    // Check if we can acquire immediately
    if (this.canAcquire(key)) {
      this.recordRequest(key);
      return;
    }

    // If queue is enabled, queue the request
    if (this.enableQueue) {
      return new Promise<void>((resolve) => {
        this.queue.push({ key, resolve });
        this.processQueue();
      });
    }

    // Otherwise, wait for capacity
    await this.waitForCapacity(key);
    this.recordRequest(key);
  }

  /**
   * Check if we can acquire a slot without waiting
   * 
   * @param key - Rate limit key
   * @returns True if slot available
   */
  private canAcquire(key: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    
    // Remove old timestamps outside the window
    const validTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < this.windowMs
    );
    
    // Check if under limit
    return validTimestamps.length < this.maxRequests;
  }

  /**
   * Record a request timestamp
   * 
   * @param key - Rate limit key
   */
  private recordRequest(key: string): void {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    
    // Remove old timestamps
    const validTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < this.windowMs
    );
    
    // Add new timestamp
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
  }

  /**
   * Get current rate limit status
   * 
   * @param key - Rate limit key
   * @returns Current status
   */
  getStatus(key: string = 'default'): RateLimitStatus {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    
    // Remove old timestamps
    const validTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < this.windowMs
    );
    
    const used = validTimestamps.length;
    const remaining = Math.max(0, this.maxRequests - used);
    
    // Calculate reset time (oldest timestamp + window)
    const oldestTimestamp = validTimestamps[0] || now;
    const resetAt = new Date(oldestTimestamp + this.windowMs);
    
    // Check if paused (at threshold)
    const isPaused = used >= this.maxRequests * this.pauseThreshold;
    
    return {
      used,
      remaining,
      resetAt,
      queueLength: this.queue.length,
      isPaused,
    };
  }

  /**
   * Wait for capacity to become available
   * 
   * @param key - Rate limit key
   * @returns Promise that resolves with wait time in ms
   */
  async waitForCapacity(key: string = 'default'): Promise<number> {
    const status = this.getStatus(key);
    
    if (status.remaining > 0) {
      return 0;
    }

    // Calculate time until next slot available
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    const oldestTimestamp = timestamps[0];
    
    if (!oldestTimestamp) {
      return 0;
    }

    const timeUntilReset = Math.max(0, (oldestTimestamp + this.windowMs) - now);
    const waitTime = Math.ceil(timeUntilReset + 100); // Add 100ms buffer

    // Wait for the calculated time
    await new Promise((resolve) => setTimeout(resolve, waitTime));
    
    return waitTime;
  }

  /**
   * Process queued requests
   */
  private async processQueue(): Promise<void> {
    if (this.processingQueue || this.queue.length === 0) {
      return;
    }

    this.processingQueue = true;

    while (this.queue.length > 0) {
      const item = this.queue[0];
      
      // Check if we can process this request
      if (this.canAcquire(item.key)) {
        this.recordRequest(item.key);
        this.queue.shift();
        item.resolve();
      } else {
        // Wait for capacity
        await this.waitForCapacity(item.key);
      }
    }

    this.processingQueue = false;
  }

  /**
   * Cleanup old timestamps from all keys
   */
  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(
        (timestamp) => now - timestamp < this.windowMs
      );
      
      if (validTimestamps.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validTimestamps);
      }
    }
  }

  /**
   * Reset rate limiter for a specific key
   * 
   * @param key - Rate limit key
   */
  reset(key: string = 'default'): void {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limit data
   */
  clearAll(): void {
    this.requests.clear();
    this.queue = [];
  }
}

