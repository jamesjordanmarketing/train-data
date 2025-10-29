/**
 * API Route: /api/templates
 * 
 * Handles listing and creating templates
 */

import { NextRequest, NextResponse } from 'next/server';
import { templateService } from '@/lib/template-service';
import { CreateTemplateSchema } from '@/lib/types/templates';
import { AppError } from '@/lib/types/errors';

/**
 * GET /api/templates
 * List templates with optional filters
 * 
 * Query Parameters:
 * - tier: 'template' | 'scenario' | 'edge_case'
 * - category: string
 * - isActive: boolean
 * - minRating: number
 * - minUsageCount: number
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters: any = {};
    
    const tier = searchParams.get('tier');
    if (tier) filters.tier = tier;
    
    const category = searchParams.get('category');
    if (category) filters.category = category;
    
    const isActive = searchParams.get('isActive');
    if (isActive !== null) filters.isActive = isActive === 'true';
    
    const minRating = searchParams.get('minRating');
    if (minRating) filters.minRating = parseFloat(minRating);
    
    const minUsageCount = searchParams.get('minUsageCount');
    if (minUsageCount) filters.minUsageCount = parseInt(minUsageCount);

    const templates = await templateService.list(filters);

    return NextResponse.json(templates, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/templates:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates
 * Create a new template
 * 
 * Body:
 * - templateName: string (required)
 * - description: string
 * - category: string
 * - tier: TierType
 * - templateText: string (required)
 * - structure: string
 * - variables: TemplateVariable[]
 * - ... other template fields
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Get user ID from auth session
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000000';
    
    const templateData = {
      ...body,
      createdBy: userId,
    };

    // Validate input
    const validatedData = CreateTemplateSchema.parse(templateData);

    // Create template
    const template = await templateService.create(validatedData);

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/templates:', error);
    
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
      { error: 'Internal Server Error', message: 'Failed to create template' },
      { status: 500 }
    );
  }
}

