import { NextRequest, NextResponse } from 'next/server';
import { chunkService } from '../../../lib/database';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      );
    }

    // Get all chunks for this document
    const chunks = await chunkService.getChunksByDocument(documentId);

    return NextResponse.json({
      chunks,
      total: chunks.length,
    });

  } catch (error: any) {
    console.error('Error getting chunks:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get chunks' },
      { status: 500 }
    );
  }
}

