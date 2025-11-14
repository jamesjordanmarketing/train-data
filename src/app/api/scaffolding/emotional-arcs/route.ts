/**
 * GET /api/scaffolding/emotional-arcs
 * 
 * Fetch all emotional arcs with optional filtering
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
    const category = searchParams.get('category') || undefined;

    const emotional_arcs = await service.getAllEmotionalArcs({
      domain,
      is_active,
      category
    });

    return NextResponse.json({
      success: true,
      emotional_arcs,
      count: emotional_arcs.length
    });
  } catch (error) {
    console.error('Failed to fetch emotional arcs:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

