import { NextRequest, NextResponse } from 'next/server';
import { DimensionGenerator } from '../../../../lib/dimension-generation/generator';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();

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
    const supabase = createServerSupabaseClient();
    
    // Get current user (optional - will use null if not authenticated)
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    // Generate dimensions
    const generator = new DimensionGenerator();
    const runId = await generator.generateDimensionsForDocument({
      documentId,
      userId,
    });

    return NextResponse.json({
      success: true,
      runId,
    });

  } catch (error: any) {
    console.error('Dimension generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    );
  }
}

