/**
 * Queue Processor
 * 
 * Background processor that continuously processes items from the request queue
 * while respecting rate limits and concurrency constraints.
 * 
 * @module queue-processor
 */

import { getRateLimiter } from './rate-limiter';
import { getRequestQueue } from './request-queue';
import type { QueueItem } from './types';

/**
 * Queue processor configuration
 */
export interface QueueProcessorConfig {
  /** Maximum number of concurrent requests */
  maxConcurrent: number;
  
  /** Interval in milliseconds to check for new items */
  pollInterval: number;
  
  /** Whether to automatically start processing */
  autoStart: boolean;
  
  /** Pause duration when rate limited (ms) */
  rateLimitPauseMs: number;
}

/**
 * Queue processor class that manages background processing
 */
export class QueueProcessor {
  private config: QueueProcessorConfig;
  private isRunning = false;
  private activeRequests = 0;
  private processTimer: NodeJS.Timeout | null = null;
  private isPaused = false;
  private pauseUntil = 0;

  constructor(config: Partial<QueueProcessorConfig> = {}) {
    this.config = {
      maxConcurrent: config.maxConcurrent || 3,
      pollInterval: config.pollInterval || 1000,
      autoStart: config.autoStart || false,
      rateLimitPauseMs: config.rateLimitPauseMs || 5000
    };

    if (this.config.autoStart) {
      this.start();
    }
  }

  /**
   * Starts the queue processor
   */
  start(): void {
    if (this.isRunning) {
      console.warn('[QueueProcessor] Already running');
      return;
    }

    console.log('[QueueProcessor] Starting...');
    this.isRunning = true;
    const queue = getRequestQueue();
    queue.setProcessing(true);
    
    this.processLoop();
  }

  /**
   * Stops the queue processor
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('[QueueProcessor] Stopping...');
    this.isRunning = false;
    const queue = getRequestQueue();
    queue.setProcessing(false);
    
    if (this.processTimer) {
      clearTimeout(this.processTimer);
      this.processTimer = null;
    }
  }

  /**
   * Pauses processing for a specified duration
   * @param durationMs - How long to pause (default: from config)
   */
  pause(durationMs?: number): void {
    const pauseDuration = durationMs || this.config.rateLimitPauseMs;
    this.pauseUntil = Date.now() + pauseDuration;
    this.isPaused = true;
    
    console.log(`[QueueProcessor] Paused for ${pauseDuration}ms`);
  }

  /**
   * Resumes processing if paused
   */
  resume(): void {
    if (this.isPaused) {
      this.isPaused = false;
      this.pauseUntil = 0;
      console.log('[QueueProcessor] Resumed');
    }
  }

  /**
   * Gets the current processor status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      activeRequests: this.activeRequests,
      maxConcurrent: this.config.maxConcurrent,
      pauseUntil: this.isPaused ? this.pauseUntil : null
    };
  }

  /**
   * Main processing loop
   * @private
   */
  private async processLoop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      // Check if we're paused
      if (this.isPaused) {
        if (Date.now() >= this.pauseUntil) {
          this.resume();
        } else {
          // Still paused, check again later
          this.scheduleNextCheck();
          return;
        }
      }

      // Check if we can process more requests
      const canProcess = this.activeRequests < this.config.maxConcurrent;
      
      if (!canProcess) {
        // At capacity, check again later
        this.scheduleNextCheck();
        return;
      }

      // Check rate limiter
      const rateLimiter = getRateLimiter();
      const canMakeRequest = await rateLimiter.checkRateLimit();
      
      if (!canMakeRequest) {
        // Rate limited, pause processing
        console.log('[QueueProcessor] Rate limit threshold reached, pausing...');
        this.pause();
        this.scheduleNextCheck();
        return;
      }

      // Try to get next item from queue
      const queue = getRequestQueue();
      const item = queue.dequeue();
      
      if (!item) {
        // Queue empty, check again later
        this.scheduleNextCheck();
        return;
      }

      // Process the item
      this.processItem(item);
      
      // Continue processing if there might be more items
      this.scheduleNextCheck(100); // Check again sooner if we just processed something
      
    } catch (error) {
      console.error('[QueueProcessor] Error in process loop:', error);
      this.scheduleNextCheck();
    }
  }

  /**
   * Processes a single queue item
   * @private
   */
  private async processItem(item: QueueItem): Promise<void> {
    this.activeRequests++;
    
    try {
      console.log(`[QueueProcessor] Processing item ${item.id} (priority: ${item.priority})`);
      
      // Add request to rate limiter tracking
      const rateLimiter = getRateLimiter();
      rateLimiter.addRequest(item.id);
      
      // Execute the item's callback if it exists
      // Note: The actual API call logic should be in the callback
      // This processor just manages the queue and rate limiting
      if (item.onComplete) {
        // In a real implementation, you'd execute the actual request here
        // For now, we'll just call the completion callback
        // The actual request logic should be injected via the payload
        await Promise.resolve(item.onComplete(item.payload));
      }
      
      // Mark as completed
      const queue = getRequestQueue();
      queue.markCompleted(item.id);
      
      console.log(`[QueueProcessor] Completed item ${item.id}`);
      
    } catch (error) {
      console.error(`[QueueProcessor] Error processing item ${item.id}:`, error);
      
      // Handle rate limit errors (429)
      if (error instanceof Error && error.message.includes('429')) {
        console.log('[QueueProcessor] Received 429 error, pausing...');
        this.pause(30000); // Pause for 30 seconds on 429
        
        // Requeue the item
        const queue = getRequestQueue();
        queue.requeue(item);
      } else {
        // Other errors - call error callback
        if (item.onError) {
          item.onError(error as Error);
        }
        
        // Mark as failed
        const queue = getRequestQueue();
        queue.markFailed(item.id);
      }
      
    } finally {
      this.activeRequests--;
    }
  }

  /**
   * Schedules the next check of the processing loop
   * @private
   */
  private scheduleNextCheck(delayMs?: number): void {
    if (this.processTimer) {
      clearTimeout(this.processTimer);
    }
    
    const delay = delayMs || this.config.pollInterval;
    this.processTimer = setTimeout(() => {
      this.processLoop();
    }, delay);
  }

  /**
   * Updates the processor configuration
   */
  updateConfig(config: Partial<QueueProcessorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Gets the current configuration
   */
  getConfig(): QueueProcessorConfig {
    return { ...this.config };
  }
}

// Export singleton instance
let queueProcessorInstance: QueueProcessor | null = null;

/**
 * Gets or creates the singleton queue processor instance
 * @param config - Configuration (only used on first call)
 */
export function getQueueProcessor(config?: Partial<QueueProcessorConfig>): QueueProcessor {
  if (!queueProcessorInstance) {
    queueProcessorInstance = new QueueProcessor(config);
  }
  return queueProcessorInstance;
}

/**
 * Resets the singleton instance (useful for testing)
 */
export function resetQueueProcessor(): void {
  if (queueProcessorInstance) {
    queueProcessorInstance.stop();
  }
  queueProcessorInstance = null;
}

export default QueueProcessor;

