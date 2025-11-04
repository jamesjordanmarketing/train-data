import { NextRequest, NextResponse } from 'next/server';
import { conversationService } from '@/lib/database';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await conversationService.unlinkConversationFromChunk(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unlink chunk error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

