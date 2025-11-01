/**
 * Templates API Route
 * GET /api/templates - List all templates
 * POST /api/templates - Create new template
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TemplateService } from '@/lib/services/template-service';
import { createTemplateSchema } from '@/lib/validation/templates';
import { parseNumericParam, parseIntParam, validateSortOrder, sanitizeSearchQuery } from '@/lib/utils/validation';
import { ZodError } from 'zod';

/**
 * GET /api/templates
 * List all templates with optional filtering, sorting, and pagination
 */
export async function GET(request: NextRequest) {
  try {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const minRating = parseNumericParam(searchParams.get('minRating'));
    const search = searchParams.get('q');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = validateSortOrder(searchParams.get('order'));
    const page = parseIntParam(searchParams.get('page'), 1);
    const limit = parseIntParam(searchParams.get('limit'), 25);

    // Build filters
    const filters: any = {};
    
    if (category) {
      filters.category = category;
    }
    
    if (minRating !== undefined) {
      filters.minRating = minRating;
    }
    
    if (search) {
      filters.search = sanitizeSearchQuery(search);
    }

    // Get templates
    const templates = await templateService.getAll(filters);

    // Apply sorting (if service doesn't handle it)
    const sortedTemplates = templates.sort((a: any, b: any) => {
      let aVal = a[sortBy as keyof typeof a];
      let bVal = b[sortBy as keyof typeof b];
      
      // Handle null/undefined values
      if (aVal === null || aVal === undefined) return order === 'asc' ? 1 : -1;
      if (bVal === null || bVal === undefined) return order === 'asc' ? -1 : 1;
      
      // String comparison
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return order === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      
      // Numeric comparison
      return order === 'asc' ? (aVal > bVal ? 1 : -1) : (bVal > aVal ? 1 : -1);
    });

    // Apply pagination
    const startIndex = ((page || 1) - 1) * (limit || 25);
    const endIndex = startIndex + (limit || 25);
    const paginatedTemplates = sortedTemplates.slice(startIndex, endIndex);

    return NextResponse.json(
      {
        data: paginatedTemplates,
        pagination: {
          page: page || 1,
          limit: limit || 25,
          total: templates.length,
          totalPages: Math.ceil(templates.length / (limit || 25)),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/templates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates
 * Create a new template
 */
export async function POST(request: NextRequest) {
  try {
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createTemplateSchema.parse(body);

    // Create template
    const template = await templateService.create(validatedData);

    return NextResponse.json(
      { data: template, message: 'Template created successfully' },
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

    console.error('POST /api/templates error:', error);
    return NextResponse.json(
      { error: 'Failed to create template', details: error.message },
      { status: 500 }
    );
  }
}
