/**
 * Template API Routes - Single Template Operations
 * 
 * GET /api/templates/[id] - Get template by ID
 * PATCH /api/templates/[id] - Update template
 * DELETE /api/templates/[id] - Delete template
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';
import { TemplateService, UpdateTemplateRequest } from '../../../../lib/template-service';

/**
 * GET /api/templates/[id]
 * Fetch a single template by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client and template service
    const supabase = createServerSupabaseClient();
    const templateService = new TemplateService(supabase);

    // Fetch template
    const template = await templateService.getTemplateById(id);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/templates/[id]
 * Update an existing template
 * 
 * Request body: UpdateTemplateRequest (partial)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const body: UpdateTemplateRequest = await request.json();

    // Validate tier if provided
    if (body.tier) {
      const validTiers = ['template', 'scenario', 'edge_case'];
      if (!validTiers.includes(body.tier)) {
        return NextResponse.json(
          { error: `Invalid tier. Must be one of: ${validTiers.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Validate variables if provided
    if (body.variables !== undefined && !Array.isArray(body.variables)) {
      return NextResponse.json(
        { error: 'Variables must be an array' },
        { status: 400 }
      );
    }

    // Validate quality threshold if provided
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

    // Check if template exists
    const existingTemplate = await templateService.getTemplateById(id);
    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Build update object
    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.structure !== undefined) updates.structure = body.structure;
    if (body.tier !== undefined) {
      updates.tier = body.tier;
      updates.category = body.tier; // Keep category in sync
    }
    if (body.variables !== undefined) updates.variables = body.variables;
    if (body.qualityThreshold !== undefined) updates.qualityThreshold = body.qualityThreshold;
    if (body.isActive !== undefined) updates.isActive = body.isActive;
    if (body.styleNotes !== undefined) {
      updates.styleNotes = body.styleNotes;
      updates.tone = body.styleNotes; // Keep tone in sync
    }
    if (body.exampleConversation !== undefined) updates.exampleConversation = body.exampleConversation;
    if (body.requiredElements !== undefined) updates.requiredElements = body.requiredElements;
    if (body.applicablePersonas !== undefined) updates.applicablePersonas = body.applicablePersonas;
    if (body.applicableEmotions !== undefined) updates.applicableEmotions = body.applicableEmotions;

    // Update template
    const template = await templateService.updateTemplate(id, updates);

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update template' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/templates/[id]
 * Delete a template (with dependency checking)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client and template service
    const supabase = createServerSupabaseClient();
    const templateService = new TemplateService(supabase);

    // Check if template exists
    const existingTemplate = await templateService.getTemplateById(id);
    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Attempt to delete template
    await templateService.deleteTemplate(id);

    return NextResponse.json({ 
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    
    // Check if error is about dependencies
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete template';
    if (errorMessage.includes('conversation') && errorMessage.includes('depend')) {
      return NextResponse.json(
        { 
          error: errorMessage,
          canArchive: true,
          suggestion: 'Archive this template instead of deleting it'
        },
        { status: 409 } // Conflict
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
