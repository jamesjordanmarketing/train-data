import { NextRequest, NextResponse } from 'next/server';
import { conversationService } from '@/lib/database';
import { chunksService } from '@/lib/generation/chunks-integration';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { chunkId } = body;

    if (!chunkId) {
      return NextResponse.json({ error: 'Chunk ID is required' }, { status: 400 });
    }

    // Validate chunk exists
    const chunk = await chunksService.getChunkById(chunkId);
    if (!chunk) {
      return NextResponse.json({ error: 'Chunk not found' }, { status: 404 });
    }

    // Get dimensions if available
    const dimensions = await chunksService.getDimensionsForChunk(chunkId);

    // Link conversation to chunk
    await conversationService.linkConversationToChunk(
      params.id,
      chunkId,
      chunk.content?.slice(0, 5000),
      dimensions ? {
        chunkId,
        dimensions: {},
        confidence: dimensions.confidence || 0.7,
        extractedAt: new Date().toISOString(),
        semanticDimensions: dimensions.semanticDimensions
      } : undefined
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Link chunk error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

