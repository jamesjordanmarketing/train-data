/**
 * Scenario Edge Cases API Route
 * GET /api/scenarios/[id]/edge-cases - Get all edge cases for a scenario
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EdgeCaseService } from '@/lib/services/edge-case-service';
import { isValidUUID } from '@/lib/utils/validation';

/**
 * GET /api/scenarios/[id]/edge-cases
 * Get all edge cases for a specific scenario
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

    const edgeCaseService = new EdgeCaseService(supabase);

    // Get edge cases for the scenario
    const edgeCases = await edgeCaseService.getByScenarioId(id);

    return NextResponse.json(
      {
        data: edgeCases,
        count: edgeCases.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`GET /api/scenarios/${params.id}/edge-cases error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch edge cases', details: error.message },
      { status: 500 }
    );
  }
}

