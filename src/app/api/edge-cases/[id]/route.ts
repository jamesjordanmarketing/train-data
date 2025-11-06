/**
 * Edge Case Detail API Route
 * GET /api/edge-cases/[id] - Get single edge case
 * PATCH /api/edge-cases/[id] - Update edge case
 * DELETE /api/edge-cases/[id] - Delete edge case
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EdgeCaseService, UpdateEdgeCaseInput } from '@/lib/services/edge-case-service';
import { updateEdgeCaseSchema } from '@/lib/validation/edge-cases';
import { isValidUUID } from '@/lib/utils/validation';
import { ZodError } from 'zod';
import { z } from 'zod';

/**
 * Transform validation schema output to service update input type
 * Maps Zod validation fields to EdgeCaseService.update() expected fields
 */
function transformToEdgeCaseUpdateInput(
  validated: z.infer<typeof updateEdgeCaseSchema>
): UpdateEdgeCaseInput {
  const updates: UpdateEdgeCaseInput = {};
  
  if (validated.name !== undefined) {
    updates.title = validated.name;
  }
  if (validated.description !== undefined) {
    updates.description = validated.description;
  }
  if (validated.triggerCondition !== undefined) {
    // Store triggerCondition as part of description or a custom field
    // For now, we'll keep existing behavior
  }
  
  return updates;
}

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

    // Transform validated data to service update input type
    const edgeCaseUpdates = transformToEdgeCaseUpdateInput(validatedData);

    // Update edge case
    const edgeCase = await edgeCaseService.update(id, edgeCaseUpdates);

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
          details: error.issues.map((e) => ({
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
    await edgeCaseService.delete(id);

    return NextResponse.json(
      { message: 'Edge case deleted successfully' },
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

