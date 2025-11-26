/**
 * API Route: Cancel Batch Job
 * 
 * POST /api/batch-jobs/[id]/cancel
 * Cancel an active batch job
 */

import { NextRequest, NextResponse } from 'next/server';
import { batchJobService } from '@/lib/services/batch-job-service';

/**
 * POST /api/batch-jobs/[id]/cancel
 * Cancel a batch job by ID
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    console.log(`[CancelJob] Cancelling job ${id}`);

    // Get current job status
    const job = await batchJobService.getJobById(id);

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if job can be cancelled
    if (job.status === 'completed' || job.status === 'cancelled') {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot cancel job with status '${job.status}'` 
        },
        { status: 400 }
      );
    }

    // Cancel the job
    await batchJobService.cancelJob(id);

    console.log(`[CancelJob] Job ${id} cancelled successfully`);

    // Fetch updated job
    const updatedJob = await batchJobService.getJobById(id);

    return NextResponse.json({
      success: true,
      message: 'Job cancelled successfully',
      job: {
        id: updatedJob.id,
        name: updatedJob.name,
        status: updatedJob.status,
        totalItems: updatedJob.totalItems,
        completedItems: updatedJob.completedItems,
        successfulItems: updatedJob.successfulItems,
        failedItems: updatedJob.failedItems,
      },
    });

  } catch (error) {
    console.error('[CancelJob] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cancel batch job',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
