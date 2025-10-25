import { NextRequest, NextResponse } from 'next/server';
import { chunkDimensionService } from '../../../../lib/database';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chunkId = searchParams.get('chunkId');
    const runId = searchParams.get('runId');

    if (!chunkId) {
      return NextResponse.json(
        { error: 'chunkId is required' },
        { status: 400 }
      );
    }

    let dimensions;
    
    if (runId) {
      // Get dimensions for specific chunk and run
      const dimension = await chunkDimensionService.getDimensionsByChunkAndRun(chunkId, runId);
      dimensions = dimension ? [dimension] : [];
    } else {
      // Get all dimensions for this chunk (across all runs)
      const { supabase } = await import('../../../../lib/supabase');
      const { data, error } = await supabase
        .from('chunk_dimensions')
        .select('*')
        .eq('chunk_id', chunkId)
        .order('generated_at', { ascending: false });
      
      if (error) throw error;
      dimensions = data || [];
    }

    return NextResponse.json({
      dimensions,
      total: dimensions.length,
    });

  } catch (error: any) {
    console.error('Error getting chunk dimensions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get dimensions' },
      { status: 500 }
    );
  }
}

