/**
 * Scenarios Bulk API Route
 * POST /api/scenarios/bulk - Bulk create scenarios
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ScenarioService } from '@/lib/services/scenario-service';
import { bulkCreateScenariosSchema } from '@/lib/validation/scenarios';
import { ZodError } from 'zod';

/**
 * POST /api/scenarios/bulk
 * Bulk create multiple scenarios at once
 */
export async function POST(request: NextRequest) {
  try {
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
    const validatedData = bulkCreateScenariosSchema.parse(body);

    // Create scenarios in bulk
    const scenarios = await scenarioService.bulkCreate(validatedData.scenarios);

    return NextResponse.json(
      {
        data: scenarios,
        message: `Successfully created ${scenarios.length} scenario(s)`,
        count: scenarios.length,
      },
      { status: 201 }
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

    // Handle foreign key constraint errors (invalid template_id)
    if (error.message?.includes('foreign key') || error.message?.includes('template_id')) {
      return NextResponse.json(
        { error: 'Invalid template ID', details: 'One or more specified templates do not exist' },
        { status: 400 }
      );
    }

    console.error('POST /api/scenarios/bulk error:', error);
    return NextResponse.json(
      { error: 'Failed to create scenarios', details: error.message },
      { status: 500 }
    );
  }
}

