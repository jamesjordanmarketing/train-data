/**
 * API Route: /api/generation-logs/stats
 * 
 * Provides cost and performance analytics for generation logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { generationLogService } from '@/lib/generation-log-service';
import { AppError } from '@/lib/types/errors';

/**
 * GET /api/generation-logs/stats
 * Get generation log statistics
 * 
 * Query Parameters:
 * - type: 'cost' | 'performance' (default: 'cost')
 * - startDate: string (ISO date, required for cost)
 * - endDate: string (ISO date, required for cost)
 * - templateId: string (UUID, optional for performance)
 * 
 * Cost Summary Response:
 * ```json
 * {
 *   "totalCost": 135.50,
 *   "totalRequests": 1500,
 *   "successfulRequests": 1450,
 *   "failedRequests": 50,
 *   "totalInputTokens": 750000,
 *   "totalOutputTokens": 1200000,
 *   "avgCostPerRequest": 0.0903,
 *   "avgDurationMs": 2500,
 *   "byModel": {
 *     "claude-sonnet-4": {
 *       "count": 1500,
 *       "cost": 135.50,
 *       "inputTokens": 750000,
 *       "outputTokens": 1200000
 *     }
 *   },
 *   "byStatus": {
 *     "success": 1450,
 *     "failed": 40,
 *     "rate_limited": 8,
 *     "timeout": 2
 *   }
 * }
 * ```
 * 
 * Performance Metrics Response:
 * ```json
 * {
 *   "avgDurationMs": 2500,
 *   "p50DurationMs": 2200,
 *   "p95DurationMs": 4500,
 *   "p99DurationMs": 6000,
 *   "successRate": 0.967,
 *   "errorRate": 0.033,
 *   "avgInputTokens": 500,
 *   "avgOutputTokens": 800,
 *   "totalRequests": 1500,
 *   "requestsPerDay": [45, 52, 48, 50, ...]
 * }
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'cost';

    if (type === 'cost') {
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      if (!startDate || !endDate) {
        return NextResponse.json(
          {
            error: 'Validation Error',
            message: 'startDate and endDate are required for cost summary',
          },
          { status: 400 }
        );
      }

      const costSummary = await generationLogService.getCostSummary(
        new Date(startDate),
        new Date(endDate)
      );

      return NextResponse.json(costSummary, { status: 200 });
    } else if (type === 'performance') {
      const templateId = searchParams.get('templateId') || undefined;

      const performanceMetrics = await generationLogService.getPerformanceMetrics(templateId);

      return NextResponse.json(performanceMetrics, { status: 200 });
    } else {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid type. Must be "cost" or "performance"',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in GET /api/generation-logs/stats:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch generation log stats' },
      { status: 500 }
    );
  }
}

