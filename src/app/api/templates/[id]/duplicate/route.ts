/**
 * Template Duplicate API Route
 * POST /api/templates/[id]/duplicate - Duplicate a template
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TemplateService } from '@/lib/services/template-service';
import { duplicateTemplateSchema } from '@/lib/validation/templates';
import { isValidUUID } from '@/lib/utils/validation';
import { ZodError } from 'zod';

/**
 * POST /api/templates/[id]/duplicate
 * Duplicate a template with optional new name
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Invalid template ID format' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Authentication required' },
        { status: 401 }
      );
    }

    const templateService = new TemplateService(supabase);

    // Check if template exists
    const existingTemplate = await templateService.getById(id);
    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json().catch(() => ({}));
    const validatedData = duplicateTemplateSchema.parse(body);

    // Duplicate template
    const duplicatedTemplate = await templateService.duplicate(
      id,
      validatedData.newName,
      validatedData.includeScenarios
    );

    return NextResponse.json(
      {
        data: duplicatedTemplate,
        message: 'Template duplicated successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error(`POST /api/templates/${params.id}/duplicate error:`, error);
    return NextResponse.json(
      { error: 'Failed to duplicate template', details: error.message },
      { status: 500 }
    );
  }
}

