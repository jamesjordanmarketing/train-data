/**
 * Edge Case Detail API Route
 * GET /api/edge-cases/[id] - Get single edge case
 * PATCH /api/edge-cases/[id] - Update edge case
 * DELETE /api/edge-cases/[id] - Delete edge case
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EdgeCaseService } from '@/lib/services/edge-case-service';
import { updateEdgeCaseSchema } from '@/lib/validation/edge-cases';
import { isValidUUID } from '@/lib/utils/validation';
import { ZodError } from 'zod';

/**
 * GET /api/edge-cases/[id]
 * Get a single edge case by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Invalid edge case ID format' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Authentication required' },
        { status: 401 }
      );
    }

    const edgeCaseService = new EdgeCaseService(supabase);
    const edgeCase = await edgeCaseService.getById(id);

    if (!edgeCase) {
      return NextResponse.json(
        { error: 'Edge case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: edgeCase }, { status: 200 });
  } catch (error: any) {
    console.error(`GET /api/edge-cases/${params.id} error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch edge case', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/edge-cases/[id]
 * Update an edge case
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Invalid edge case ID format' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Authentication required' },
        { status: 401 }
      );
    }

    const edgeCaseService = new EdgeCaseService(supabase);

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateEdgeCaseSchema.parse(body);

    // Check if edge case exists
    const existingEdgeCase = await edgeCaseService.getById(id);
    if (!existingEdgeCase) {
      return NextResponse.json(
        { error: 'Edge case not found' },
        { status: 404 }
      );
    }

    // Update edge case
    const edgeCase = await edgeCaseService.update(id, validatedData);

    return NextResponse.json(
      { data: edgeCase, message: 'Edge case updated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error(`PATCH /api/edge-cases/${params.id} error:`, error);
    return NextResponse.json(
      { error: 'Failed to update edge case', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/edge-cases/[id]
 * Delete an edge case
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Invalid edge case ID format' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Authentication required' },
        { status: 401 }
      );
    }

    const edgeCaseService = new EdgeCaseService(supabase);

    // Check if edge case exists
    const existingEdgeCase = await edgeCaseService.getById(id);
    if (!existingEdgeCase) {
      return NextResponse.json(
        { error: 'Edge case not found' },
        { status: 404 }
      );
    }

    // Delete edge case
    const result = await edgeCaseService.delete(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: result.message },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`DELETE /api/edge-cases/${params.id} error:`, error);
    return NextResponse.json(
      { error: 'Failed to delete edge case', details: error.message },
      { status: 500 }
    );
  }
}

