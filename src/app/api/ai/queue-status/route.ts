/**
 * Queue Status API Endpoint
 * 
 * Provides real-time information about the AI request queue and rate limiter status.
 * Used by the UI to display rate limit indicators and estimated wait times.
 * 
 * GET /api/ai/queue-status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRateLimiter } from '@/lib/ai/rate-limiter';
import { getRequestQueue } from '@/lib/ai/request-queue';
import { getQueueProcessor } from '@/lib/ai/queue-processor';

/**
 * Response type for queue status endpoint
 */
interface QueueStatusResponse {
  /** Current number of items in queue */
  queueSize: number;
  
  /** Current rate limit utilization (0-100%) */
  currentUtilization: number;
  
  /** Estimated wait time in milliseconds for items in queue */
  estimatedWaitTime: number;
  
  /** Current rate limit status */
  rateLimitStatus: 'healthy' | 'approaching' | 'throttled';
  
  /** Whether the queue processor is currently running */
  isProcessing: boolean;
  
  /** Whether the processor is paused due to rate limiting */
  isPaused: boolean;
  
  /** Number of active/concurrent requests */
  activeRequests: number;
  
  /** Maximum concurrent requests allowed */
  maxConcurrent: number;
  
  /** Total items processed since start */
  totalProcessed: number;
  
  /** Total items failed */
  totalFailed: number;
  
  /** Additional metrics for debugging */
  metrics?: {
    requestsInWindow: number;
    requestLimit: number;
    windowSeconds: number;
    averageProcessingTime: number;
  };
}

/**
 * GET handler - Returns current queue and rate limit status
 */
export async function GET(_request: NextRequest): Promise<NextResponse<QueueStatusResponse>> {
  try {
    // Get rate limiter status
    const rateLimiter = getRateLimiter();
    const rateLimitStatus = rateLimiter.getStatus();
    
    // Get queue information
    const queue = getRequestQueue();
    const queueInfo = queue.getInfo();
    
    // Get processor status
    const processor = getQueueProcessor();
    const processorStatus = processor.getStatus();
    
    // Calculate estimated wait time
    // Formula: queue size * average processing time + any rate limit delays
    const baseWaitTime = queueInfo.size * queueInfo.averageProcessingTime;
    const rateLimitDelay = rateLimitStatus.estimatedWaitMs;
    const estimatedWaitTime = baseWaitTime + rateLimitDelay;
    
    // Determine rate limit status string
    const status: 'healthy' | 'approaching' | 'throttled' = 
      rateLimitStatus.utilization < 70 ? 'healthy' :
      rateLimitStatus.utilization < 90 ? 'approaching' :
      'throttled';
    
    // Build response
    const response: QueueStatusResponse = {
      queueSize: queueInfo.size,
      currentUtilization: Math.round(rateLimitStatus.utilization * 10) / 10, // Round to 1 decimal
      estimatedWaitTime,
      rateLimitStatus: status,
      isProcessing: queueInfo.isProcessing,
      isPaused: processorStatus.isPaused,
      activeRequests: processorStatus.activeRequests,
      maxConcurrent: processorStatus.maxConcurrent,
      totalProcessed: queueInfo.totalProcessed,
      totalFailed: queueInfo.totalFailed,
      metrics: {
        requestsInWindow: rateLimitStatus.currentCount,
        requestLimit: rateLimitStatus.limit,
        windowSeconds: rateLimiter.getConfig().windowSeconds,
        averageProcessingTime: queueInfo.averageProcessingTime
      }
    };
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[QueueStatus] Status check:', {
        queue: queueInfo.size,
        utilization: `${rateLimitStatus.utilization.toFixed(1)}%`,
        status,
        activeRequests: processorStatus.activeRequests
      });
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('[QueueStatus] Error fetching status:', error);
    
    // Return error response with safe defaults
    return NextResponse.json(
      {
        queueSize: 0,
        currentUtilization: 0,
        estimatedWaitTime: 0,
        rateLimitStatus: 'healthy' as const,
        isProcessing: false,
        isPaused: false,
        activeRequests: 0,
        maxConcurrent: 3,
        totalProcessed: 0,
        totalFailed: 0,
        error: 'Failed to fetch queue status'
      } as QueueStatusResponse & { error: string },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

