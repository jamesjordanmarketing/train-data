import { NextRequest, NextResponse } from 'next/server';
import { conversationChunkService } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { chunkId: string } }
) {
  try {
    const conversations = await conversationChunkService.getConversationsByChunk(params.chunkId);
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Get conversations by chunk error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

