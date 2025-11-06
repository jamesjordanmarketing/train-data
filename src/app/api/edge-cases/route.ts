/**
 * Edge Cases API Route
 * GET /api/edge-cases - List all edge cases
 * POST /api/edge-cases - Create new edge case
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EdgeCaseService } from '@/lib/services/edge-case-service';
import { createEdgeCaseSchema } from '@/lib/validation/edge-cases';
import { parseIntParam, validateSortOrder, sanitizeSearchQuery, isValidUUID } from '@/lib/utils/validation';
import { ZodError } from 'zod';

/**
 * GET /api/edge-cases
 * List all edge cases with optional filtering, sorting, and pagination
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

    const edgeCaseService = new EdgeCaseService(supabase);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const scenarioId = searchParams.get('scenarioId') || undefined;
    const testStatus = searchParams.get('testStatus') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const search = searchParams.get('q');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = validateSortOrder(searchParams.get('order'));
    const page = parseIntParam(searchParams.get('page'), 1);
    const limit = parseIntParam(searchParams.get('limit'), 25);

    // Validate scenarioId if provided
    if (scenarioId && !isValidUUID(scenarioId)) {
      return NextResponse.json(
        { error: 'Invalid scenario ID format' },
        { status: 400 }
      );
    }

    // Build filters
    const filters: any = {};
    
    if (scenarioId) {
      filters.scenarioId = scenarioId;
    }
    
    if (testStatus) {
      filters.testStatus = testStatus;
    }
    
    if (severity) {
      filters.severity = severity;
    }
    
    if (search) {
      filters.search = sanitizeSearchQuery(search);
    }

    // Get edge cases
    const edgeCases = await edgeCaseService.getAll(filters);

    // Apply sorting
    const sortedEdgeCases = edgeCases.sort((a: any, b: any) => {
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
    const paginatedEdgeCases = sortedEdgeCases.slice(startIndex, endIndex);

    return NextResponse.json(
      {
        data: paginatedEdgeCases,
        pagination: {
          page: page || 1,
          limit: limit || 25,
          total: edgeCases.length,
          totalPages: Math.ceil(edgeCases.length / (limit || 25)),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/edge-cases error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch edge cases', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/edge-cases
 * Create a new edge case
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

    const edgeCaseService = new EdgeCaseService(supabase);

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createEdgeCaseSchema.parse(body);

    // Create edge case
    // TODO(E03): Fix validation schema to match service input type
    // Validation uses: scenarioId, name, triggerCondition
    // Service expects: parentScenarioId, title, edgeCaseType
    const edgeCase = await edgeCaseService.create(validatedData as any);

    return NextResponse.json(
      { data: edgeCase, message: 'Edge case created successfully' },
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

    // Handle foreign key constraint errors (invalid scenario_id)
    if (error.message?.includes('foreign key') || error.message?.includes('scenario_id')) {
      return NextResponse.json(
        { error: 'Invalid scenario ID', details: 'The specified scenario does not exist' },
        { status: 400 }
      );
    }

    console.error('POST /api/edge-cases error:', error);
    return NextResponse.json(
      { error: 'Failed to create edge case', details: error.message },
      { status: 500 }
    );
  }
}

