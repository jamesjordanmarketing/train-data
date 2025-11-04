import { NextRequest, NextResponse } from 'next/server';
import { conversationService } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { chunkId: string } }
) {
  try {
    const conversations = await conversationService.getConversationsByChunk(params.chunkId);
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Get conversations by chunk error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

