/**
 * Quality Feedback API Endpoint
 * GET /api/review/feedback
 * 
 * Returns aggregated template performance metrics including approval rates,
 * quality scores, and identification of low-performing templates
 * 
 * Query Parameters:
 * - timeWindow: Time period for aggregation - '7d' | '30d' | 'all' (default: '30d')
 * - minUsageCount: Minimum number of conversations required (default: 5)
 * 
 * Response:
 * {
 *   templates: Array<{
 *     template_id: string,
 *     template_name: string,
 *     tier: string,
 *     usage_count: number,
 *     avg_quality: number,
 *     approval_rate: number,
 *     performance: 'high' | 'medium' | 'low'
 *   }>,
 *   overall_stats: {
 *     total_templates: number,
 *     low_performing_count: number,
 *     avg_approval_rate: number
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClientWithAuth } from '@/lib/supabase-server';
import { aggregateFeedbackByTemplate } from '@/lib/services/quality-feedback-service';
import { isValidTimeWindow } from '@/lib/types/review.types';
import type { TimeWindow, AggregateFeedbackParams } from '@/lib/types/review.types';

/**
 * GET handler for quality feedback aggregation
 */
export async function GET(request: NextRequest) {
  try {
    // Step 1: Authenticate user
    const supabase = await createServerSupabaseClientWithAuth();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Authentication required' },
        { status: 401 }
      );
    }

    // Step 2: Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    
    const timeWindowParam = searchParams.get('timeWindow') || '30d';
    const minUsageCountParam = searchParams.get('minUsageCount');
    
    // Validate time window
    if (!isValidTimeWindow(timeWindowParam)) {
      return NextResponse.json(
        {
          error: 'Invalid parameter',
          details: 'timeWindow must be one of: 7d, 30d, all',
        },
        { status: 400 }
      );
    }

    const timeWindow = timeWindowParam as TimeWindow;

    // Parse and validate minUsageCount
    const minUsageCount = minUsageCountParam
      ? parseInt(minUsageCountParam, 10)
      : 5;

    if (isNaN(minUsageCount) || minUsageCount < 0) {
      return NextResponse.json(
        {
          error: 'Invalid parameter',
          details: 'minUsageCount must be a non-negative integer',
        },
        { status: 400 }
      );
    }

    // Step 3: Build service parameters
    const params: AggregateFeedbackParams = {
      timeWindow,
      minUsageCount,
    };

    // Step 4: Aggregate feedback
    const result = await aggregateFeedbackByTemplate(params);

    // Step 5: Add metadata to response
    const response = {
      ...result,
      metadata: {
        timeWindow,
        minUsageCount,
        generatedAt: new Date().toISOString(),
      },
    };

    // Step 6: Return response
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/review/feedback:', error);

    return NextResponse.json(
      {
        error: 'Failed to aggregate feedback',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

