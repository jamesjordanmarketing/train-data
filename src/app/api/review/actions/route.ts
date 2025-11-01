/**
 * Review Actions API Endpoint
 * POST /api/review/actions
 * 
 * Submit a review action for a conversation (approve, reject, request changes)
 * Performs atomic updates to conversation status and review history
 * 
 * Request Body:
 * {
 *   conversationId: string,
 *   action: 'approved' | 'rejected' | 'revision_requested',
 *   comment?: string,
 *   reasons?: string[]
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   conversation: ConversationRecord,
 *   message: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClientWithAuth } from '@/lib/supabase-server';
import { submitReviewAction } from '@/lib/services/review-queue-service';
import { isValidReviewAction } from '@/lib/types/review.types';
import type { SubmitReviewActionParams } from '@/lib/types/review.types';

/**
 * POST handler for submitting review actions
 */
export async function POST(request: NextRequest) {
  try {
    // Step 1: Authenticate user
    const supabase = await createServerSupabaseClientWithAuth();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Authentication required' },
        { status: 401 }
      );
    }

    // Step 2: Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid request', details: 'Request body must be valid JSON' },
        { status: 400 }
      );
    }

    const { conversationId, action, comment, reasons } = body;

    // Validate required fields
    if (!conversationId || typeof conversationId !== 'string') {
      return NextResponse.json(
        { error: 'Validation error', details: 'conversationId is required and must be a string' },
        { status: 400 }
      );
    }

    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        { error: 'Validation error', details: 'action is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate action type
    if (!isValidReviewAction(action)) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: `Invalid action. Must be one of: approved, rejected, revision_requested`,
        },
        { status: 400 }
      );
    }

    // Validate optional fields
    if (comment && typeof comment !== 'string') {
      return NextResponse.json(
        { error: 'Validation error', details: 'comment must be a string' },
        { status: 400 }
      );
    }

    if (reasons && !Array.isArray(reasons)) {
      return NextResponse.json(
        { error: 'Validation error', details: 'reasons must be an array' },
        { status: 400 }
      );
    }

    // Step 3: Build service parameters
    const params: SubmitReviewActionParams = {
      conversationId,
      action,
      userId: user.id,
      comment: comment || undefined,
      reasons: reasons || undefined,
    };

    // Step 4: Submit review action
    const conversation = await submitReviewAction(params);

    // Step 5: Return success response
    const actionMessages = {
      approved: 'Conversation approved successfully',
      rejected: 'Conversation rejected',
      revision_requested: 'Changes requested for conversation',
    };

    return NextResponse.json(
      {
        success: true,
        conversation,
        message: actionMessages[action],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/review/actions:', error);

    // Handle specific error cases
    if (error instanceof Error) {
      // Handle validation errors
      if (error.message.includes('not found')) {
        return NextResponse.json(
          {
            error: 'Conversation not found',
            details: error.message,
          },
          { status: 404 }
        );
      }

      if (error.message.includes('not eligible')) {
        return NextResponse.json(
          {
            error: 'Invalid conversation state',
            details: error.message,
          },
          { status: 409 }
        );
      }

      if (error.message.includes('Validation failed')) {
        return NextResponse.json(
          {
            error: 'Validation error',
            details: error.message,
          },
          { status: 400 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        error: 'Failed to submit review action',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

