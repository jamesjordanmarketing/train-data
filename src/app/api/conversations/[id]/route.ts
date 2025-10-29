/**
 * API Route: /api/conversations/[id]
 * 
 * Handles get, update, and delete for a single conversation
 */

import { NextRequest, NextResponse } from 'next/server';
import { conversationService } from '@/lib/conversation-service';
import { UpdateConversationSchema } from '@/lib/types/conversations';
import { AppError, ConversationNotFoundError } from '@/lib/types/errors';

/**
 * GET /api/conversations/[id]
 * Get a single conversation by ID
 * 
 * Query Parameters:
 * - includeTurns: boolean (default: false)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const searchParams = request.nextUrl.searchParams;
    const includeTurns = searchParams.get('includeTurns') === 'true';

    const conversation = await conversationService.getById(id, includeTurns);

    if (!conversation) {
      throw new ConversationNotFoundError(id);
    }

    return NextResponse.json(conversation, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/conversations/[id]:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/conversations/[id]
 * Update a conversation
 * 
 * Body: Partial conversation updates
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate input
    const validatedData = UpdateConversationSchema.parse(body);

    // Update conversation
    const conversation = await conversationService.update(id, validatedData);

    return NextResponse.json(conversation, { status: 200 });
  } catch (error) {
    console.error('Error in PATCH /api/conversations/[id]:', error);
    
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
      { error: 'Internal Server Error', message: 'Failed to update conversation' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/conversations/[id]
 * Delete a conversation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await conversationService.delete(id);

    return NextResponse.json(
      { message: 'Conversation deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/conversations/[id]:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}

