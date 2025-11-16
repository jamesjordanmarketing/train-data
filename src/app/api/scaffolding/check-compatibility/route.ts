/**
 * POST /api/scaffolding/check-compatibility
 * 
 * Check compatibility between persona, emotional arc, and training topic
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { ScaffoldingDataService } from '@/lib/services/scaffolding-data-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { persona_id, emotional_arc_id, training_topic_id } = body;

    if (!persona_id || !emotional_arc_id || !training_topic_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: persona_id, emotional_arc_id, and training_topic_id are required'
        },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const service = new ScaffoldingDataService(supabase);

    const result = await service.checkCompatibility({
      persona_id,
      arc_id: emotional_arc_id,
      topic_id: training_topic_id
    });

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Compatibility check failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

