/**
 * Failed Generations API Route
 * 
 * Handles listing and querying failed generation records.
 * 
 * GET /api/failed-generations
 * Query params:
 *   - page: number (default 1)
 *   - limit: number (default 25)
 *   - failure_type: 'truncation' | 'parse_error' | 'api_error' | 'validation_error'
 *   - stop_reason: string
 *   - truncation_pattern: string
 *   - run_id: string
 *   - date_from: ISO date string
 *   - date_to: ISO date string
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFailedGenerationService } from '@/lib/services/failed-generation-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    
    // Parse filters
    const filters: {
      failure_type?: 'truncation' | 'parse_error' | 'api_error' | 'validation_error';
      stop_reason?: string;
      truncation_pattern?: string;
      run_id?: string;
      date_from?: string;
      date_to?: string;
    } = {};
    
    const failureType = searchParams.get('failure_type');
    if (failureType && ['truncation', 'parse_error', 'api_error', 'validation_error'].includes(failureType)) {
      filters.failure_type = failureType as 'truncation' | 'parse_error' | 'api_error' | 'validation_error';
    }
    
    const stopReason = searchParams.get('stop_reason');
    if (stopReason) {
      filters.stop_reason = stopReason;
    }
    
    const truncationPattern = searchParams.get('truncation_pattern');
    if (truncationPattern) {
      filters.truncation_pattern = truncationPattern;
    }
    
    const runId = searchParams.get('run_id');
    if (runId) {
      filters.run_id = runId;
    }
    
    const dateFrom = searchParams.get('date_from');
    if (dateFrom) {
      filters.date_from = dateFrom;
    }
    
    const dateTo = searchParams.get('date_to');
    if (dateTo) {
      filters.date_to = dateTo;
    }
    
    const service = getFailedGenerationService();
    const result = await service.listFailedGenerations(filters, { page, limit });
    
    return NextResponse.json({
      failures: result.failures,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    });
  } catch (error) {
    console.error('[API] Error fetching failed generations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch failed generations' },
      { status: 500 }
    );
  }
}

