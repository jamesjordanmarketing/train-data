/**
 * Scenarios API Route
 * GET /api/scenarios - List all scenarios
 * POST /api/scenarios - Create new scenario
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ScenarioService } from '@/lib/services/scenario-service';
import { createScenarioSchema } from '@/lib/validation/scenarios';
import { parseNumericParam, parseIntParam, validateSortOrder, sanitizeSearchQuery, isValidUUID } from '@/lib/utils/validation';
import { ZodError } from 'zod';

/**
 * GET /api/scenarios
 * List all scenarios with optional filtering, sorting, and pagination
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

    const scenarioService = new ScenarioService(supabase);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId') || undefined;
    const generationStatus = searchParams.get('generationStatus') || undefined;
    const minQualityScore = parseNumericParam(searchParams.get('minQualityScore'));
    const search = searchParams.get('q');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = validateSortOrder(searchParams.get('order'));
    const page = parseIntParam(searchParams.get('page'), 1);
    const limit = parseIntParam(searchParams.get('limit'), 25);

    // Validate templateId if provided
    if (templateId && !isValidUUID(templateId)) {
      return NextResponse.json(
        { error: 'Invalid template ID format' },
        { status: 400 }
      );
    }

    // Build filters
    const filters: any = {};
    
    if (templateId) {
      filters.templateId = templateId;
    }
    
    if (generationStatus) {
      filters.generationStatus = generationStatus;
    }
    
    if (minQualityScore !== undefined) {
      filters.minQualityScore = minQualityScore;
    }
    
    if (search) {
      filters.search = sanitizeSearchQuery(search);
    }

    // Get scenarios
    const scenarios = await scenarioService.getAll(filters);

    // Apply sorting
    const sortedScenarios = scenarios.sort((a: any, b: any) => {
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
    const paginatedScenarios = sortedScenarios.slice(startIndex, endIndex);

    return NextResponse.json(
      {
        data: paginatedScenarios,
        pagination: {
          page: page || 1,
          limit: limit || 25,
          total: scenarios.length,
          totalPages: Math.ceil(scenarios.length / (limit || 25)),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/scenarios error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scenarios', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/scenarios
 * Create a new scenario
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

    const scenarioService = new ScenarioService(supabase);

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createScenarioSchema.parse(body);

    // Create scenario
    const scenario = await scenarioService.create(validatedData);

    return NextResponse.json(
      { data: scenario, message: 'Scenario created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle foreign key constraint errors (invalid template_id)
    if (error.message?.includes('foreign key') || error.message?.includes('template_id')) {
      return NextResponse.json(
        { error: 'Invalid template ID', details: 'The specified template does not exist' },
        { status: 400 }
      );
    }

    console.error('POST /api/scenarios error:', error);
    return NextResponse.json(
      { error: 'Failed to create scenario', details: error.message },
      { status: 500 }
    );
  }
}

