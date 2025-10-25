import { NextRequest, NextResponse } from 'next/server';
import { chunkExtractionJobService } from '../../../../lib/database';

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

    // Get the latest extraction job for this document
    const job = await chunkExtractionJobService.getLatestJob(documentId);

    return NextResponse.json({
      job: job || null,
    });

  } catch (error: any) {
    console.error('Error getting chunk extraction status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get status' },
      { status: 500 }
    );
  }
}

