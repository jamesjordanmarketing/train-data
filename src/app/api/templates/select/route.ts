/**
 * API Route: Template Selection by Emotional Arc
 * 
 * GET /api/templates/select?emotional_arc_type={arc}&tier={tier}&persona_type={persona}&topic_key={topic}
 * 
 * Returns templates matching the criteria with arc-first selection strategy.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TemplateSelectionService } from '@/lib/services/template-selection-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get query parameters
    const emotional_arc_type = searchParams.get('emotional_arc_type');
    const tier = searchParams.get('tier') as 'template' | 'scenario' | 'edge_case' | null;
    const persona_type = searchParams.get('persona_type');
    const topic_key = searchParams.get('topic_key');

    // Validate required parameters
    if (!emotional_arc_type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: emotional_arc_type',
        },
        { status: 400 }
      );
    }

    // Initialize service
    const supabase = createClient();
    const templateSelectionService = new TemplateSelectionService(supabase);

    // Build criteria
    const criteria: any = {
      emotional_arc_type,
    };

    if (tier) criteria.tier = tier;
    if (persona_type) criteria.persona_type = persona_type;
    if (topic_key) criteria.topic_key = topic_key;

    // Select templates
    const templates = await templateSelectionService.selectTemplates(criteria);

    return NextResponse.json({
      success: true,
      templates,
      count: templates.length,
      criteria,
    });
  } catch (error) {
    console.error('Error selecting templates:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates/select
 * 
 * Validate template compatibility with persona and topic
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, personaKey, topicKey } = body;

    // Validate required fields
    if (!templateId || !personaKey || !topicKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: templateId, personaKey, topicKey',
        },
        { status: 400 }
      );
    }

    // Initialize service
    const supabase = createClient();
    const templateSelectionService = new TemplateSelectionService(supabase);

    // Validate compatibility
    const result = await templateSelectionService.validateCompatibility(
      templateId,
      personaKey,
      topicKey
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error validating compatibility:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

