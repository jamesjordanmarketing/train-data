import { NextRequest, NextResponse } from 'next/server';
import { conversationChunkService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const orphaned = await conversationChunkService.getOrphanedConversations();
    return NextResponse.json(orphaned);
  } catch (error) {
    console.error('Get orphaned conversations error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

