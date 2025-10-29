/**
 * API Route: /api/conversations/[id]/turns
 * 
 * Handles conversation turns
 */

import { NextRequest, NextResponse } from 'next/server';
import { conversationService } from '@/lib/conversation-service';
import { CreateTurnSchema } from '@/lib/types/conversations';
import { AppError } from '@/lib/types/errors';
import { z } from 'zod';

/**
 * GET /api/conversations/[id]/turns
 * Get all turns for a conversation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const turns = await conversationService.getTurns(id);

    return NextResponse.json(turns, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/conversations/[id]/turns:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch turns' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations/[id]/turns
 * Create one or more turns for a conversation
 * 
 * Body can be:
 * - Single turn object
 * - Array of turn objects
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Check if bulk create
    if (Array.isArray(body)) {
      // Validate all turns
      const validatedTurns = body.map((turn) => CreateTurnSchema.parse(turn));

      // Bulk create
      const turns = await conversationService.bulkCreateTurns(id, validatedTurns);

      return NextResponse.json(turns, { status: 201 });
    } else {
      // Validate single turn
      const validatedTurn = CreateTurnSchema.parse(body);

      // Create single turn
      const turn = await conversationService.createTurn(id, validatedTurn);

      return NextResponse.json(turn, { status: 201 });
    }
  } catch (error) {
    console.error('Error in POST /api/conversations/[id]/turns:', error);
    
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
      { error: 'Internal Server Error', message: 'Failed to create turns' },
      { status: 500 }
    );
  }
}

