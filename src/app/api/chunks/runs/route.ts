import { NextRequest, NextResponse } from 'next/server';
import { chunkRunService } from '../../../../lib/database';

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

    // Get all runs for this document
    const runs = await chunkRunService.getRunsByDocument(documentId);

    return NextResponse.json({
      runs,
      total: runs.length,
    });

  } catch (error: any) {
    console.error('Error getting chunk runs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get runs' },
      { status: 500 }
    );
  }
}

