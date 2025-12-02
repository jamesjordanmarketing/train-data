/**
 * Failed Generation Detail API Route
 * 
 * GET /api/failed-generations/[id]
 * Returns the full failed generation record
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFailedGenerationService } from '@/lib/services/failed-generation-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing failure ID' },
        { status: 400 }
      );
    }
    
    const service = getFailedGenerationService();
    const failure = await service.getFailedGeneration(id);
    
    if (!failure) {
      return NextResponse.json(
        { error: 'Failed generation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(failure);
  } catch (error) {
    console.error('[API] Error fetching failed generation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch failed generation' },
      { status: 500 }
    );
  }
}

