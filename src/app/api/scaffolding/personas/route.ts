/**
 * GET /api/scaffolding/personas
 * 
 * Fetch all personas with optional filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ScaffoldingDataService } from '@/lib/services/scaffolding-data-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const service = new ScaffoldingDataService(supabase);

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain') || 'financial_planning';
    const is_active = searchParams.get('is_active') !== 'false';
    const emotional_baseline = searchParams.get('emotional_baseline') || undefined;

    const personas = await service.getAllPersonas({
      domain,
      is_active,
      emotional_baseline
    });

    return NextResponse.json({
      success: true,
      personas,
      count: personas.length
    });
  } catch (error) {
    console.error('Failed to fetch personas:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

