/**
 * API Route: Batch Job Control
 * 
 * PATCH /api/conversations/batch/:id
 * Control batch job (pause, resume, cancel)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getBatchGenerationService } from '@/lib/services';

// Validation schema
const BatchControlSchema = z.object({
  action: z.enum(['pause', 'resume', 'cancel']),
});

/**
 * PATCH /api/conversations/batch/:id
 * Control batch job
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job ID is required',
        },
        { status: 400 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validated = BatchControlSchema.parse(body);
    
    // Get batch generation service
    const batchService = getBatchGenerationService();
    
    // Execute action
    let status;
    switch (validated.action) {
      case 'pause':
        status = await batchService.pauseJob(id);
        break;
      case 'resume':
        status = await batchService.resumeJob(id);
        break;
      case 'cancel':
        status = await batchService.cancelJob(id);
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
          },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      jobId: status.jobId,
      status: status.status,
      message: `Job ${validated.action}d successfully`,
    });
    
  } catch (error) {
    console.error('Error controlling batch job:', error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request', 
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
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
    
    // Handle invalid state errors
    if (error instanceof Error && error.message.includes('not paused')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid job state',
          message: error.message,
        },
        { status: 400 }
      );
    }
    
    // Generic error handler
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to control job',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

