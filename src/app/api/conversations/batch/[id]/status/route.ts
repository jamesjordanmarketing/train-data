/**
 * API Route: Batch Job Status
 * 
 * GET /api/conversations/batch/:id/status
 * Get current status and progress of a batch generation job
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBatchGenerationService } from '@/lib/services';

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
    
    // Get batch generation service
    const batchService = getBatchGenerationService();
    
    // Get job status
    const status = await batchService.getJobStatus(id);
    
    console.log(`[StatusAPI] Returning status:`, {
      jobId: status.jobId,
      status: status.status,
      completed: status.progress.completed,
      total: status.progress.total
    });
    
    return NextResponse.json({
      success: true,
      ...status,
    });
    
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

