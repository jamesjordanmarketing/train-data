import { NextRequest, NextResponse } from 'next/server';
import { promptTemplateService } from '../../../../lib/database';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/chunks/templates
 * 
 * Fetches all active prompt templates
 * Optional query parameter: chunkType to filter templates
 * 
 * Query Params:
 * - chunkType: string (optional) - Filter to templates for specific chunk type
 * 
 * Response:
 * {
 *   templates: PromptTemplate[]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chunkType = searchParams.get('chunkType');
    
    let templates;
    
    if (chunkType) {
      // Fetch templates for specific chunk type
      templates = await promptTemplateService.getActiveTemplates(chunkType as any);
    } else {
      // Fetch all active templates
      templates = await promptTemplateService.getAllActiveTemplates();
    }
    
    return NextResponse.json({
      templates,
      count: templates.length,
    });
    
  } catch (error: any) {
    console.error('Failed to fetch templates:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch templates',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

