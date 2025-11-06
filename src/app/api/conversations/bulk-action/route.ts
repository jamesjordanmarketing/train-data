/**
 * API Route: /api/conversations/bulk-action
 * 
 * Handles bulk operations on conversations
 */

import { NextRequest, NextResponse } from 'next/server';
import { conversationService } from '@/lib/conversation-service';
import { AppError } from '@/lib/types/errors';
import { z } from 'zod';

const BulkActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'delete', 'update']),
  conversationIds: z.array(z.string().uuid()).min(1, 'At least one conversation ID is required'),
  reviewerId: z.string().uuid().optional(),
  reason: z.string().optional(),
  updates: z.record(z.string(), z.any()).optional(),
});

/**
 * POST /api/conversations/bulk-action
 * Perform bulk actions on multiple conversations
 * 
 * Body:
 * - action: 'approve' | 'reject' | 'delete' | 'update'
 * - conversationIds: string[] (UUIDs)
 * - reviewerId: string (required for approve/reject)
 * - reason: string (required for reject)
 * - updates: object (required for update)
 * 
 * Examples:
 * 
 * Approve:
 * ```json
 * {
 *   "action": "approve",
 *   "conversationIds": ["uuid1", "uuid2"],
 *   "reviewerId": "user-uuid"
 * }
 * ```
 * 
 * Reject:
 * ```json
 * {
 *   "action": "reject",
 *   "conversationIds": ["uuid1", "uuid2"],
 *   "reviewerId": "user-uuid",
 *   "reason": "Quality score too low"
 * }
 * ```
 * 
 * Delete:
 * ```json
 * {
 *   "action": "delete",
 *   "conversationIds": ["uuid1", "uuid2"]
 * }
 * ```
 * 
 * Update:
 * ```json
 * {
 *   "action": "update",
 *   "conversationIds": ["uuid1", "uuid2"],
 *   "updates": {
 *     "category": ["Financial Planning"],
 *     "qualityScore": 8.5
 *   }
 * }
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = BulkActionSchema.parse(body);
    const { action, conversationIds, reviewerId, reason, updates } = validatedData;

    let result;

    switch (action) {
      case 'approve':
        if (!reviewerId) {
          return NextResponse.json(
            { error: 'Validation Error', message: 'reviewerId is required for approve action' },
            { status: 400 }
          );
        }
        result = await conversationService.bulkApprove(conversationIds, reviewerId);
        return NextResponse.json(
          {
            message: `Successfully approved ${result} conversations`,
            count: result,
          },
          { status: 200 }
        );

      case 'reject':
        if (!reviewerId) {
          return NextResponse.json(
            { error: 'Validation Error', message: 'reviewerId is required for reject action' },
            { status: 400 }
          );
        }
        if (!reason) {
          return NextResponse.json(
            { error: 'Validation Error', message: 'reason is required for reject action' },
            { status: 400 }
          );
        }
        result = await conversationService.bulkReject(conversationIds, reviewerId, reason);
        return NextResponse.json(
          {
            message: `Successfully rejected ${result} conversations`,
            count: result,
          },
          { status: 200 }
        );

      case 'delete':
        result = await conversationService.bulkDelete(conversationIds);
        return NextResponse.json(
          {
            message: `Successfully deleted ${result} conversations`,
            count: result,
          },
          { status: 200 }
        );

      case 'update':
        if (!updates || Object.keys(updates).length === 0) {
          return NextResponse.json(
            { error: 'Validation Error', message: 'updates object is required for update action' },
            { status: 400 }
          );
        }
        result = await conversationService.bulkUpdate(conversationIds, updates);
        return NextResponse.json(
          {
            message: `Successfully updated ${result} conversations`,
            count: result,
          },
          { status: 200 }
        );

      default:
        return NextResponse.json(
          { error: 'Validation Error', message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in POST /api/conversations/bulk-action:', error);
    
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
      { error: 'Internal Server Error', message: 'Failed to perform bulk action' },
      { status: 500 }
    );
  }
}

