/**
 * API Route: /api/templates/[id]
 * 
 * Handles get, update, and delete for a single template
 */

import { NextRequest, NextResponse } from 'next/server';
import { templateService } from '@/lib/template-service';
import { UpdateTemplateSchema } from '@/lib/types/templates';
import { AppError, TemplateNotFoundError } from '@/lib/types/errors';

/**
 * GET /api/templates/[id]
 * Get a single template by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const template = await templateService.getById(id);

    if (!template) {
      throw new TemplateNotFoundError(id);
    }

    return NextResponse.json(template, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/templates/[id]:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/templates/[id]
 * Update a template
 * 
 * Body: Partial template updates
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // TODO: Get user ID from auth session
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000000';
    
    const updateData = {
      ...body,
      lastModifiedBy: userId,
    };

    // Validate input
    const validatedData = UpdateTemplateSchema.parse(updateData);

    // Update template
    const template = await templateService.update(id, validatedData);

    return NextResponse.json(template, { status: 200 });
  } catch (error) {
    console.error('Error in PATCH /api/templates/[id]:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    // Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid input data', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to update template' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/templates/[id]
 * Delete a template
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await templateService.delete(id);

    return NextResponse.json(
      { message: 'Template deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/templates/[id]:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to delete template' },
      { status: 500 }
    );
  }
}

