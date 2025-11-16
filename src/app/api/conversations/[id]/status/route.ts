import { NextRequest, NextResponse } from 'next/server';
import { getConversationStorageService } from '@/lib/services/conversation-storage-service';

/**
 * PATCH /api/conversations/[id]/status - Update conversation status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, review_notes } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending_review', 'approved', 'rejected', 'archived'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const userId = request.headers.get('x-user-id') || 'test-user';

    const service = getConversationStorageService();
    const conversation = await service.updateConversationStatus(
      params.id,
      status,
      userId,
      review_notes
    );

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error updating conversation status:', error);
    return NextResponse.json(
      { error: 'Failed to update conversation status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/conversations/[id]/status - Get conversation status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = getConversationStorageService();
    const conversation = await service.getConversation(params.id);

    return NextResponse.json({
      conversation_id: conversation.conversation_id,
      status: conversation.status,
      reviewed_by: conversation.reviewed_by,
      reviewed_at: conversation.reviewed_at,
      review_notes: conversation.review_notes,
    });
  } catch (error) {
    console.error('Error fetching conversation status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

