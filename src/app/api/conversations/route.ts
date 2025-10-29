/**
 * API Route: /api/conversations
 * 
 * Handles listing and creating conversations
 */

import { NextRequest, NextResponse } from 'next/server';
import { conversationService } from '@/lib/conversation-service';
import {
  CreateConversationSchema,
  FilterConfigSchema,
  PaginationConfigSchema,
} from '@/lib/types/conversations';
import { AppError } from '@/lib/types/errors';

/**
 * GET /api/conversations
 * List conversations with filters and pagination
 * 
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 25)
 * - tierTypes: string[] (e.g., tierTypes=template&tierTypes=scenario)
 * - statuses: string[]
 * - qualityMin: number
 * - qualityMax: number
 * - dateFrom: string (ISO date)
 * - dateTo: string (ISO date)
 * - categories: string[]
 * - personas: string[]
 * - emotions: string[]
 * - searchQuery: string
 * - sortBy: string (default: created_at)
 * - sortDirection: 'asc' | 'desc' (default: desc)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filters
    const filters: any = {};
    
    const tierTypes = searchParams.getAll('tierTypes');
    if (tierTypes.length > 0) filters.tierTypes = tierTypes;
    
    const statuses = searchParams.getAll('statuses');
    if (statuses.length > 0) filters.statuses = statuses;
    
    const qualityMin = searchParams.get('qualityMin');
    const qualityMax = searchParams.get('qualityMax');
    if (qualityMin || qualityMax) {
      filters.qualityRange = {
        min: qualityMin ? parseFloat(qualityMin) : 0,
        max: qualityMax ? parseFloat(qualityMax) : 10,
      };
    }
    
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    if (dateFrom || dateTo) {
      filters.dateRange = {
        from: dateFrom || new Date(0).toISOString(),
        to: dateTo || new Date().toISOString(),
      };
    }
    
    const categories = searchParams.getAll('categories');
    if (categories.length > 0) filters.categories = categories;
    
    const personas = searchParams.getAll('personas');
    if (personas.length > 0) filters.personas = personas;
    
    const emotions = searchParams.getAll('emotions');
    if (emotions.length > 0) filters.emotions = emotions;
    
    const searchQuery = searchParams.get('searchQuery');
    if (searchQuery) filters.searchQuery = searchQuery;
    
    const parentId = searchParams.get('parentId');
    if (parentId) filters.parentId = parentId;

    // Parse pagination
    const pagination = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '25'),
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortDirection: (searchParams.get('sortDirection') || 'desc') as 'asc' | 'desc',
    };

    // Validate inputs
    const validatedFilters = FilterConfigSchema.partial().parse(filters);
    const validatedPagination = PaginationConfigSchema.parse(pagination);

    // Fetch conversations
    const result = await conversationService.list(validatedFilters, validatedPagination);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/conversations:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations
 * Create a new conversation
 * 
 * Body:
 * - persona: string (required)
 * - emotion: string (required)
 * - tier: 'template' | 'scenario' | 'edge_case' (required)
 * - status: ConversationStatus (optional, default: 'draft')
 * - ... other conversation fields
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Get user ID from auth session
    // For now, use a placeholder
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000000';
    
    const conversationData = {
      ...body,
      createdBy: userId,
    };

    // Validate input
    const validatedData = CreateConversationSchema.parse(conversationData);

    // Create conversation
    const conversation = await conversationService.create(validatedData);

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/conversations:', error);
    
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
      { error: 'Internal Server Error', message: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}

