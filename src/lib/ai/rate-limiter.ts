/**
 * Sliding Window Rate Limiter
 * 
 * Implements a sliding window algorithm to track and enforce API rate limits
 * for the Claude API. Prevents 429 (Too Many Requests) errors by proactively
 * throttling requests when approaching configured limits.
 * 
 * @module rate-limiter
 */

import type { 
  RateLimitConfig, 
  RequestTimestamp, 
  RateLimitStatus,
  RateLimitEvent 
} from './types';

/**
 * Core rate limiter class implementing sliding window algorithm
 */
export class RateLimiter {
  private requests: RequestTimestamp[] = [];
  private config: RateLimitConfig;
  private eventLog: RateLimitEvent[] = [];
  private requestIdCounter = 0;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Adds a request to the tracking window
   * @param requestId - Optional custom request ID
   * @returns The request ID that was added
   */
  addRequest(requestId?: string): string {
    const id = requestId || `req_${++this.requestIdCounter}_${Date.now()}`;
    const timestamp = Date.now();
    
    this.requests.push({ timestamp, requestId: id });
    this.removeExpiredRequests();
    
    // Log events if crossing thresholds
    const status = this.getStatus();
    if (status.utilization >= 90 && status.utilization < 100) {
      this.logEvent({
        type: 'approaching',
        timestamp,
        utilization: status.utilization,
        message: 'Approaching rate limit threshold'
      });
    } else if (status.utilization >= 100) {
      this.logEvent({
        type: 'throttled',
        timestamp,
        utilization: status.utilization,
        message: 'Rate limit threshold exceeded'
      });
    }
    
    return id;
  }

  /**
   * Removes timestamps that fall outside the sliding window
   */
  removeExpiredRequests(): void {
    const now = Date.now();
    const windowMs = this.config.windowSeconds * 1000;
    const cutoffTime = now - windowMs;
    
    // Filter out requests older than the window
    this.requests = this.requests.filter(req => req.timestamp > cutoffTime);
  }

  /**
   * Returns the current number of requests in the window
   */
  getCurrentCount(): number {
    this.removeExpiredRequests();
    return this.requests.length;
  }

  /**
   * Checks if a new request can be made without exceeding limits
   * @returns true if request can be made, false if should queue
   */
  canMakeRequest(): boolean {
    const currentCount = this.getCurrentCount();
    const threshold = this.config.requestLimit * this.config.threshold;
    return currentCount < threshold;
  }

  /**
   * Gets the current rate limit status
   */
  getStatus(): RateLimitStatus {
    const currentCount = this.getCurrentCount();
    const utilization = (currentCount / this.config.requestLimit) * 100;
    const canMakeRequest = this.canMakeRequest();
    
    // Calculate estimated wait time
    let estimatedWaitMs = 0;
    if (!canMakeRequest && this.requests.length > 0) {
      // Find the oldest request that will expire soonest
      const oldestRequest = this.requests[0];
      const windowMs = this.config.windowSeconds * 1000;
      const expiresAt = oldestRequest.timestamp + windowMs;
      estimatedWaitMs = Math.max(0, expiresAt - Date.now());
    }
    
    // Determine status
    let status: 'healthy' | 'approaching' | 'throttled';
    if (utilization < 70) {
      status = 'healthy';
    } else if (utilization < 90) {
      status = 'approaching';
    } else {
      status = 'throttled';
    }
    
    return {
      currentCount,
      limit: this.config.requestLimit,
      utilization: Math.min(100, utilization),
      canMakeRequest,
      estimatedWaitMs,
      status
    };
  }

  /**
   * Checks the rate limit and logs the check
   * @param apiTier - The API tier being used (for logging)
   * @returns Promise<boolean> - true if can make request
   */
  async checkRateLimit(apiTier: string = 'default'): Promise<boolean> {
    const status = this.getStatus();
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[RateLimiter] Check for ${apiTier}:`, {
        count: status.currentCount,
        limit: status.limit,
        utilization: status.utilization.toFixed(1) + '%',
        canMakeRequest: status.canMakeRequest
      });
    }
    
    return status.canMakeRequest;
  }

  /**
   * Waits until a request can be made
   * @param timeoutMs - Maximum time to wait (default: 60000ms)
   * @returns Promise that resolves when request can be made
   */
  async waitForCapacity(timeoutMs: number = 60000): Promise<void> {
    const startTime = Date.now();
    
    while (!this.canMakeRequest()) {
      if (Date.now() - startTime > timeoutMs) {
        throw new Error('Timeout waiting for rate limit capacity');
      }
      
      const status = this.getStatus();
      const waitTime = Math.min(status.estimatedWaitMs, 1000);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  /**
   * Resets the rate limiter (useful for testing)
   */
  reset(): void {
    this.requests = [];
    this.eventLog = [];
    this.requestIdCounter = 0;
  }

  /**
   * Gets recent events for monitoring
   * @param limit - Maximum number of events to return
   */
  getRecentEvents(limit: number = 10): RateLimitEvent[] {
    return this.eventLog.slice(-limit);
  }

  /**
   * Updates the rate limit configuration
   * @param config - New configuration (partial update supported)
   */
  updateConfig(config: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Gets the current configuration
   */
  getConfig(): RateLimitConfig {
    return { ...this.config };
  }

  /**
   * Logs a rate limit event
   * @private
   */
  private logEvent(event: RateLimitEvent): void {
    this.eventLog.push(event);
    
    // Keep only last 100 events to prevent memory growth
    if (this.eventLog.length > 100) {
      this.eventLog = this.eventLog.slice(-100);
    }
  }

  /**
   * Gets metrics for monitoring and debugging
   */
  getMetrics() {
    const status = this.getStatus();
    return {
      currentRequests: status.currentCount,
      limit: status.limit,
      utilization: status.utilization,
      status: status.status,
      requestsInWindow: this.requests.length,
      windowSeconds: this.config.windowSeconds,
      threshold: this.config.threshold,
      recentEvents: this.getRecentEvents(5)
    };
  }
}

// Export singleton instance (will be initialized in ai-config.ts)
let rateLimiterInstance: RateLimiter | null = null;

/**
 * Gets or creates the singleton rate limiter instance
 * @param config - Configuration (only used on first call)
 */
export function getRateLimiter(config?: RateLimitConfig): RateLimiter {
  if (!rateLimiterInstance) {
    if (!config) {
      throw new Error('RateLimiter not initialized. Provide config on first call.');
    }
    rateLimiterInstance = new RateLimiter(config);
  }
  return rateLimiterInstance;
}

/**
 * Resets the singleton instance (useful for testing)
 */
export function resetRateLimiter(): void {
  rateLimiterInstance = null;
}

export default RateLimiter;

