/**
 * GET /api/scaffolding/training-topics
 * 
 * Fetch all training topics with optional filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { ScaffoldingDataService } from '@/lib/services/scaffolding-data-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const service = new ScaffoldingDataService(supabase);

    const { searchParams } = new URL(request.url);
    const is_active = searchParams.get('is_active') !== 'false';
    const complexity_level = searchParams.get('complexity_level') || undefined;
    const category = searchParams.get('category') || undefined;

    const training_topics = await service.getAllTrainingTopics({
      is_active,
      complexity_level,
      category
    });

    return NextResponse.json({
      success: true,
      training_topics,
      count: training_topics.length
    });
  } catch (error) {
    console.error('Failed to fetch training topics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

