/**
 * Template Scenarios API Route
 * GET /api/templates/[id]/scenarios - Get all scenarios for a template
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ScenarioService } from '@/lib/services/scenario-service';
import { isValidUUID } from '@/lib/utils/validation';

/**
 * GET /api/templates/[id]/scenarios
 * Get all scenarios for a specific template
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
        { error: 'Invalid template ID format' },
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

    // Get scenarios for the template
    const scenarios = await scenarioService.getByTemplateId(id);

    return NextResponse.json(
      {
        data: scenarios,
        count: scenarios.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`GET /api/templates/${params.id}/scenarios error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch scenarios', details: error.message },
      { status: 500 }
    );
  }
}

