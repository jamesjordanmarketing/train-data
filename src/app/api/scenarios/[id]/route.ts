/**
 * Scenario Detail API Route
 * GET /api/scenarios/[id] - Get single scenario
 * PATCH /api/scenarios/[id] - Update scenario
 * DELETE /api/scenarios/[id] - Delete scenario
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ScenarioService } from '@/lib/services/scenario-service';
import { updateScenarioSchema } from '@/lib/validation/scenarios';
import { isValidUUID } from '@/lib/utils/validation';
import { ZodError } from 'zod';

/**
 * GET /api/scenarios/[id]
 * Get a single scenario by ID
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
        { error: 'Invalid scenario ID format' },
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

    const scenarioService = new ScenarioService(supabase);
    const scenario = await scenarioService.getById(id);

    if (!scenario) {
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: scenario }, { status: 200 });
  } catch (error: any) {
    console.error(`GET /api/scenarios/${params.id} error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch scenario', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/scenarios/[id]
 * Update a scenario
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
        { error: 'Invalid scenario ID format' },
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

    const scenarioService = new ScenarioService(supabase);

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateScenarioSchema.parse(body);

    // Check if scenario exists
    const existingScenario = await scenarioService.getById(id);
    if (!existingScenario) {
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      );
    }

    // Update scenario
    const scenario = await scenarioService.update(id, validatedData);

    return NextResponse.json(
      { data: scenario, message: 'Scenario updated successfully' },
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

    console.error(`PATCH /api/scenarios/${params.id} error:`, error);
    return NextResponse.json(
      { error: 'Failed to update scenario', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/scenarios/[id]
 * Delete a scenario
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
        { error: 'Invalid scenario ID format' },
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

    const scenarioService = new ScenarioService(supabase);

    // Check if scenario exists
    const existingScenario = await scenarioService.getById(id);
    if (!existingScenario) {
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      );
    }

    // Delete scenario
    const result = await scenarioService.delete(id);

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
    console.error(`DELETE /api/scenarios/${params.id} error:`, error);
    return NextResponse.json(
      { error: 'Failed to delete scenario', details: error.message },
      { status: 500 }
    );
  }
}

