/**
 * Template API Routes - List and Create
 * 
 * GET /api/templates - List all templates with filtering and sorting
 * POST /api/templates - Create a new template
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase-server';
import { TemplateService, CreateTemplateRequest } from '../../../lib/template-service';

/**
 * GET /api/templates
 * Fetch all templates with optional filtering and sorting
 * 
 * Query parameters:
 * - tier: Filter by tier (template|scenario|edge_case)
 * - isActive: Filter by active status (true|false)
 * - sortBy: Sort column (name|usageCount|rating|lastModified)
 * - sortOrder: Sort direction (asc|desc)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const tier = searchParams.get('tier') || undefined;
    const isActiveParam = searchParams.get('isActive');
    const isActive = isActiveParam === 'true' ? true : isActiveParam === 'false' ? false : undefined;
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Validate sortBy
    const validSortColumns = ['name', 'usageCount', 'rating', 'lastModified'];
    if (!validSortColumns.includes(sortBy)) {
      return NextResponse.json(
        { error: `Invalid sortBy parameter. Must be one of: ${validSortColumns.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate sortOrder
    if (sortOrder !== 'asc' && sortOrder !== 'desc') {
      return NextResponse.json(
        { error: 'Invalid sortOrder parameter. Must be "asc" or "desc"' },
        { status: 400 }
      );
    }

    // Create Supabase client and template service
    const supabase = createServerSupabaseClient();
    const templateService = new TemplateService(supabase);

    // Fetch templates
    const templates = await templateService.getAllTemplates({
      tier,
      isActive,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
    });

    return NextResponse.json({
      templates,
      total: templates.length,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch templates',
        templates: [],
        total: 0
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates
 * Create a new template
 * 
 * Request body: CreateTemplateRequest
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateTemplateRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.structure) {
      return NextResponse.json(
        { error: 'Missing required fields: name and structure are required' },
        { status: 400 }
      );
    }

    // Validate tier
    const validTiers = ['template', 'scenario', 'edge_case'];
    if (!body.tier || !validTiers.includes(body.tier)) {
      return NextResponse.json(
        { error: `Invalid tier. Must be one of: ${validTiers.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate variables array
    if (!Array.isArray(body.variables)) {
      return NextResponse.json(
        { error: 'Variables must be an array' },
        { status: 400 }
      );
    }

    // Validate quality threshold
    if (body.qualityThreshold !== undefined) {
      const threshold = Number(body.qualityThreshold);
      if (isNaN(threshold) || threshold < 0 || threshold > 1) {
        return NextResponse.json(
          { error: 'Quality threshold must be a number between 0 and 1' },
          { status: 400 }
        );
      }
    }

    // Create Supabase client and template service
    const supabase = createServerSupabaseClient();
    const templateService = new TemplateService(supabase);

    // Create template
    const template = await templateService.createTemplate({
      name: body.name,
      description: body.description || '',
      category: body.tier, // Using tier as category
      structure: body.structure,
      variables: body.variables || [],
      tone: body.styleNotes || '',
      complexityBaseline: 5, // Default value
      styleNotes: body.styleNotes,
      exampleConversation: body.exampleConversation,
      qualityThreshold: body.qualityThreshold || 0.7,
      requiredElements: body.requiredElements || [],
      rating: 0,
      createdBy: '', // TODO: Get from auth context
      // Additional fields
      tier: body.tier,
      isActive: body.isActive !== undefined ? body.isActive : true,
      applicablePersonas: body.applicablePersonas || [],
      applicableEmotions: body.applicableEmotions || [],
    } as any);

    return NextResponse.json(
      { template },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create template' },
      { status: 500 }
    );
  }
}
