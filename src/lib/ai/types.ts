/**
 * Type definitions for AI Integration & Rate Limiting System
 * 
 * This module defines the core interfaces and types for the rate limiting
 * and request queue management system used throughout the AI generation engine.
 */

/**
 * Configuration for rate limiting behavior
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  requestLimit: number;
  
  /** Time window in seconds for rate limiting */
  windowSeconds: number;
  
  /** Threshold (0-1) at which to start queuing requests (e.g., 0.9 = 90%) */
  threshold: number;
  
  /** Duration in milliseconds to pause when rate limited */
  pauseMs: number;
  
  /** Maximum number of concurrent requests */
  maxConcurrentRequests: number;
}

/**
 * Request timestamp tracking for sliding window algorithm
 */
export interface RequestTimestamp {
  /** Unix timestamp in milliseconds */
  timestamp: number;
  
  /** Unique identifier for the request */
  requestId: string;
}

/**
 * Priority levels for request queue
 */
export type QueuePriority = 'low' | 'normal' | 'high';

/**
 * Item stored in the request queue
 */
export interface QueueItem<T = any> {
  /** Unique identifier for the queue item */
  id: string;
  
  /** Priority level determining processing order */
  priority: QueuePriority;
  
  /** The actual request payload */
  payload: T;
  
  /** Unix timestamp when item was enqueued */
  enqueuedAt: number;
  
  /** Number of times this request has been retried */
  retryCount: number;
  
  /** Optional callback to execute when request completes */
  onComplete?: (result: any) => void;
  
  /** Optional callback to execute when request fails */
  onError?: (error: Error) => void;
}

/**
 * Current status of the rate limiter
 */
export interface RateLimitStatus {
  /** Current number of requests in the sliding window */
  currentCount: number;
  
  /** Maximum allowed requests */
  limit: number;
  
  /** Current utilization as a percentage (0-100) */
  utilization: number;
  
  /** Whether a new request can be made immediately */
  canMakeRequest: boolean;
  
  /** Estimated wait time in milliseconds before next request can be made */
  estimatedWaitMs: number;
  
  /** Current rate limit state */
  status: 'healthy' | 'approaching' | 'throttled';
}

/**
 * Information about the current queue state
 */
export interface QueueInfo {
  /** Current number of items in queue */
  size: number;
  
  /** Total number of items enqueued since start */
  totalEnqueued: number;
  
  /** Total number of items processed since start */
  totalProcessed: number;
  
  /** Total number of items that failed */
  totalFailed: number;
  
  /** Whether the queue processor is currently running */
  isProcessing: boolean;
  
  /** Estimated wait time per item in milliseconds */
  averageProcessingTime: number;
}

/**
 * Model configuration for different Claude API tiers
 */
export interface ModelConfig {
  /** Claude model identifier */
  name: string;
  
  /** Rate limit for this model (requests per minute) */
  rateLimit: number;
  
  /** Rate limit window in seconds */
  rateLimitWindow: number;
  
  /** Cost per million input tokens (USD) */
  costPerMillionInputTokens: number;
  
  /** Cost per million output tokens (USD) */
  costPerMillionOutputTokens: number;
  
  /** Maximum tokens per request */
  maxTokens?: number;
}

/**
 * Complete AI configuration
 */
export interface AIConfig {
  /** Available models and their configurations */
  models: {
    opus: ModelConfig;
    sonnet: ModelConfig;
    haiku: ModelConfig;
  };
  
  /** Default model to use */
  defaultModel: 'opus' | 'sonnet' | 'haiku';
  
  /** Rate limiting configuration */
  rateLimitThreshold: number;
  rateLimitPauseMs: number;
  
  /** Request timeout in milliseconds */
  timeout: number;
  
  /** Maximum concurrent requests */
  maxConcurrentRequests: number;
}

/**
 * Queue statistics for monitoring and debugging
 */
export interface QueueStats {
  /** Current queue size */
  currentSize: number;
  
  /** Peak queue size since start */
  peakSize: number;
  
  /** Average wait time in milliseconds */
  averageWaitTime: number;
  
  /** Number of items by priority */
  itemsByPriority: {
    high: number;
    normal: number;
    low: number;
  };
}

/**
 * Rate limit event for logging and monitoring
 */
export interface RateLimitEvent {
  /** Event type */
  type: 'approaching' | 'throttled' | 'resumed' | 'error';
  
  /** Unix timestamp of the event */
  timestamp: number;
  
  /** Current utilization percentage at time of event */
  utilization: number;
  
  /** Optional message */
  message?: string;
}

