/**
 * Review Queue API Endpoint
 * GET /api/review/queue
 * 
 * Returns paginated list of conversations with status='pending_review'
 * Supports filtering by quality score and custom sorting
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 25, max: 100)
 * - sortBy: Sort field - 'quality_score' | 'created_at' (default: 'quality_score')
 * - sortOrder: Sort direction - 'asc' | 'desc' (default: 'asc')
 * - minQuality: Minimum quality score filter (0-10)
 * 
 * Response:
 * {
 *   data: Conversation[],
 *   pagination: { page, limit, total, pages },
 *   statistics: { totalPending, averageQuality, oldestPendingDate }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClientWithAuth } from '@/lib/supabase-server';
import { fetchReviewQueue } from '@/lib/services/review-queue-service';
import type { FetchReviewQueueParams } from '@/lib/types/review.types';

/**
 * GET handler for review queue
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
    
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '25', 10),
      100 // Max limit to prevent abuse
    );
    const sortBy = searchParams.get('sortBy') === 'created_at' 
      ? 'created_at' 
      : 'quality_score';
    const sortOrder = searchParams.get('sortOrder') === 'desc' 
      ? 'desc' 
      : 'asc';
    const minQualityParam = searchParams.get('minQuality');
    const minQuality = minQualityParam 
      ? parseFloat(minQualityParam) 
      : undefined;

    // Step 3: Validate parameters
    if (page < 1) {
      return NextResponse.json(
        { error: 'Invalid parameter', details: 'Page must be >= 1' },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid parameter', details: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    if (minQuality !== undefined && (minQuality < 0 || minQuality > 10)) {
      return NextResponse.json(
        { error: 'Invalid parameter', details: 'minQuality must be between 0 and 10' },
        { status: 400 }
      );
    }

    // Step 4: Build query parameters
    const params: FetchReviewQueueParams = {
      page,
      limit,
      sortBy,
      sortOrder,
      minQuality,
      userId: user.id,
    };

    // Step 5: Fetch review queue
    const result = await fetchReviewQueue(params);

    // Step 6: Return response
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/review/queue:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch review queue',
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

