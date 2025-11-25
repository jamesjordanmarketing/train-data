/**
 * API Route: Batch Jobs List
 * 
 * GET /api/batch-jobs
 * List all batch generation jobs
 */

import { NextRequest, NextResponse } from 'next/server';
import { batchJobService } from '@/lib/services/batch-job-service';

/**
 * GET /api/batch-jobs
 * List all batch jobs with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'queued' | 'processing' | 'paused' | 'completed' | 'failed' | 'cancelled' | null;
    const createdBy = searchParams.get('createdBy');

    // Build filters
    const filters: { status?: typeof status; createdBy?: string } = {};
    if (status) filters.status = status;
    if (createdBy) filters.createdBy = createdBy;

    // Fetch jobs
    const jobs = await batchJobService.getAllJobs(Object.keys(filters).length > 0 ? filters : undefined);

    // Transform to simpler response format
    const simplifiedJobs = jobs.map(job => ({
      id: job.id,
      name: job.name,
      status: job.status,
      totalItems: job.totalItems,
      completedItems: job.completedItems,
      successfulItems: job.successfulItems,
      failedItems: job.failedItems,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      priority: job.priority,
    }));

    return NextResponse.json({
      success: true,
      jobs: simplifiedJobs,
      count: simplifiedJobs.length,
    });

  } catch (error) {
    console.error('Error fetching batch jobs:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch batch jobs',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

