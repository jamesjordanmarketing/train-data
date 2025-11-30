/**
 * API Route: Batch Job Status
 * 
 * GET /api/conversations/batch/:id/status
 * Get current status and progress of a batch generation job
 * 
 * IMPORTANT: This route uses batchJobService directly (not through BatchGenerationService singleton)
 * to ensure fresh database queries on every request in serverless environments.
 */

import { NextRequest, NextResponse } from 'next/server';
import { batchJobService } from '@/lib/services/batch-job-service';

// Force dynamic rendering - never cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/conversations/batch/:id/status
 * Get job status and progress
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log(`[StatusAPI] Fetching status for job ${id}`);
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job ID is required',
        },
        { status: 400 }
      );
    }
    
    // Query database directly using batchJobService (creates fresh Supabase client per request)
    const job = await batchJobService.getJobById(id);
    
    // Calculate percentage
    const percentage = job.totalItems > 0 
      ? Math.round((job.completedItems / job.totalItems) * 100 * 10) / 10
      : 0;
    
    const status = {
      jobId: job.id,
      status: job.status,
      progress: {
        total: job.totalItems,
        completed: job.completedItems,
        successful: job.successfulItems,
        failed: job.failedItems,
        percentage,
      },
      estimatedTimeRemaining: job.estimatedTimeRemaining,
      startedAt: job.startedAt || undefined,
      completedAt: job.completedAt || undefined,
    };
    
    console.log(`[StatusAPI] Returning status:`, {
      jobId: status.jobId,
      status: status.status,
      completed: status.progress.completed,
      total: status.progress.total
    });
    
    // Return with cache control headers to prevent any caching
    return NextResponse.json(
      {
        success: true,
        ...status,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
    
  } catch (error) {
    console.error('Error getting batch status:', error);
    
    // Handle not found errors
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job not found',
          message: `Batch job ${params.id} does not exist`,
        },
        { status: 404 }
      );
    }
    
    // Generic error handler
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get job status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}