import { NextRequest, NextResponse } from 'next/server';
import { getConversationStorageService } from '@/lib/services/conversation-storage-service';

/**
 * GET /api/conversations - List conversations with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract filters
    const status = searchParams.get('status') as any;
    const tier = searchParams.get('tier') as any;
    const persona_id = searchParams.get('persona_id') || undefined;
    const emotional_arc_id = searchParams.get('emotional_arc_id') || undefined;
    const training_topic_id = searchParams.get('training_topic_id') || undefined;
    const quality_min = searchParams.get('quality_min')
      ? parseFloat(searchParams.get('quality_min')!)
      : undefined;
    const quality_max = searchParams.get('quality_max')
      ? parseFloat(searchParams.get('quality_max')!)
      : undefined;

    // Extract pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortDirection = (searchParams.get('sortDirection') || 'desc') as 'asc' | 'desc';

    // Get user ID from auth (placeholder - implement with actual auth)
    const userId = request.headers.get('x-user-id') || undefined;

    const service = getConversationStorageService();
    const result = await service.listConversations(
      { 
        status, 
        tier, 
        persona_id, 
        emotional_arc_id,
        training_topic_id,
        quality_min,
        quality_max,
        created_by: userId 
      },
      { page, limit, sortBy: sortBy as any, sortDirection }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error listing conversations:', error);
    return NextResponse.json(
      { error: 'Failed to list conversations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations - Create a new conversation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get user ID from auth
    const userId = request.headers.get('x-user-id') || 'test-user';

    const service = getConversationStorageService();
    const conversation = await service.createConversation({
      ...body,
      created_by: userId
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
