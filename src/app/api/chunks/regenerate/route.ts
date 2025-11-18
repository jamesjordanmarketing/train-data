import { NextRequest, NextResponse } from 'next/server';
import { DimensionGenerator } from '../../../../lib/dimension-generation/generator';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';

/**
 * POST /api/chunks/regenerate
 * 
 * Regenerates dimensions for specified chunks
 * Creates a new run_id and preserves all historical runs
 * 
 * Body:
 * - documentId: string (required)
 * - chunkIds: string[] (optional - if not provided, regenerates all chunks)
 * - templateIds: string[] (optional - if not provided, uses all applicable templates)
 * - aiParams: { temperature?: number; model?: string } (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const { documentId, chunkIds, templateIds, aiParams } = await request.json();
    
    // Validate inputs
    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      );
    }

    // Check for required environment variables
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ ANTHROPIC_API_KEY not configured in environment variables');
      return NextResponse.json(
        { 
          error: 'AI service not configured. Please set ANTHROPIC_API_KEY in Vercel environment variables.',
          details: 'Missing ANTHROPIC_API_KEY'
        },
        { status: 500 }
      );
    }
    
    // Get server-side Supabase client
    const supabase = await createServerSupabaseClient();
    
    // Get current user (optional - will use null if not authenticated)
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;
    
    // Log regeneration request
    console.log('Starting dimension regeneration:', {
      documentId,
      chunkCount: chunkIds?.length || 'all',
      templateCount: templateIds?.length || 'all',
      aiParams,
      userId,
    });
    
    // Generate dimensions for specified chunks
    const generator = new DimensionGenerator();
    const runId = await generator.generateDimensionsForDocument({
      documentId,
      userId,
      chunkIds,  // Optional: specific chunks only
      templateIds,  // Optional: specific templates only
      aiParams,  // Optional: AI parameters override
    });
    
    return NextResponse.json({
      success: true,
      runId,
      message: 'Regeneration complete',
    });
    
  } catch (error: any) {
    console.error('Regeneration error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Regeneration failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

