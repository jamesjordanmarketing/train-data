/**
 * API Route: /api/generation-logs
 * 
 * Handles listing and creating generation logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { generationLogService } from '@/lib/generation-log-service';
import { CreateGenerationLogSchema } from '@/lib/types/generation-logs';
import { AppError } from '@/lib/types/errors';

/**
 * GET /api/generation-logs
 * List generation logs with optional filters
 * 
 * Query Parameters:
 * - conversationId: string (UUID)
 * - runId: string (UUID)
 * - templateId: string (UUID)
 * - status: 'success' | 'failed' | 'rate_limited' | 'timeout'
 * - modelUsed: string
 * - dateFrom: string (ISO date)
 * - dateTo: string (ISO date)
 * - limit: number (default: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters: any = {};
    
    const conversationId = searchParams.get('conversationId');
    if (conversationId) filters.conversationId = conversationId;
    
    const runId = searchParams.get('runId');
    if (runId) filters.runId = runId;
    
    const templateId = searchParams.get('templateId');
    if (templateId) filters.templateId = templateId;
    
    const status = searchParams.get('status');
    if (status) filters.status = status;
    
    const modelUsed = searchParams.get('modelUsed');
    if (modelUsed) filters.modelUsed = modelUsed;
    
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    if (dateFrom || dateTo) {
      filters.dateRange = {
        from: dateFrom || new Date(0).toISOString(),
        to: dateTo || new Date().toISOString(),
      };
    }

    const limit = parseInt(searchParams.get('limit') || '100');

    const logs = await generationLogService.list(filters, limit);

    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/generation-logs:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch generation logs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/generation-logs
 * Create a new generation log entry
 * 
 * Body:
 * - conversationId: string (UUID, optional)
 * - runId: string (UUID, optional)
 * - templateId: string (UUID, optional)
 * - requestPayload: object (required)
 * - responsePayload: object (optional)
 * - modelUsed: string (optional)
 * - parameters: object (optional)
 * - temperature: number (optional)
 * - maxTokens: number (optional)
 * - inputTokens: number (optional)
 * - outputTokens: number (optional)
 * - costUsd: number (optional)
 * - durationMs: number (optional)
 * - status: 'success' | 'failed' | 'rate_limited' | 'timeout' (required)
 * - errorMessage: string (optional)
 * - errorCode: string (optional)
 * - retryAttempt: number (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Get user ID from auth session
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000000';
    
    const logData = {
      ...body,
      createdBy: userId,
    };

    // Validate input
    const validatedData = CreateGenerationLogSchema.parse(logData);

    // Create log
    const log = await generationLogService.create(validatedData);

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/generation-logs:', error);
    
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
      { error: 'Internal Server Error', message: 'Failed to create generation log' },
      { status: 500 }
    );
  }
}

