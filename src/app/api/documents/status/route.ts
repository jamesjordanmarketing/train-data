import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 10; // Quick status check

/**
 * Document status response
 */
interface DocumentStatusResponse {
  id: string;
  status: 'uploaded' | 'processing' | 'completed' | 'error' | 'pending' | 'categorizing';
  progress: number;
  error: string | null;
  processingStartedAt: string | null;
  processingCompletedAt: string | null;
  estimatedSecondsRemaining: number | null;
  title: string;
  fileName: string;
  fileSize: number;
  sourceType: string;
}

/**
 * GET /api/documents/status
 * Retrieve current processing status for documents
 * 
 * Query Parameters:
 *   - id: string (single document ID)
 *   - ids: string (comma-separated document IDs, max 100)
 * 
 * Response:
 *   - 200: { success: true, documents: DocumentStatusResponse[] }
 *   - 400: { success: false, error: string }
 *   - 401: { success: false, error: string }
 *   - 500: { success: false, error: string }
 */
export async function GET(request: NextRequest) {
  console.log('[StatusAPI] Received status request');
  
  try {
    // ================================================
    // STEP 1: Authentication
    // ================================================
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required',
          errorCode: 'AUTH_REQUIRED'
        },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('[StatusAPI] Authentication error:', userError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid authentication',
          errorCode: 'AUTH_INVALID'
        },
        { status: 401 }
      );
    }

    // ================================================
    // STEP 2: Parse Query Parameters
    // ================================================
    const { searchParams } = new URL(request.url);
    const singleId = searchParams.get('id');
    const multipleIds = searchParams.get('ids');

    let documentIds: string[] = [];

    if (singleId) {
      documentIds = [singleId];
    } else if (multipleIds) {
      documentIds = multipleIds.split(',').map(id => id.trim()).filter(Boolean);
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Either "id" or "ids" query parameter is required',
          errorCode: 'INVALID_REQUEST'
        },
        { status: 400 }
      );
    }

    // Validate batch size
    if (documentIds.length > 100) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Maximum 100 documents per request. Use pagination for larger batches.',
          errorCode: 'BATCH_TOO_LARGE'
        },
        { status: 400 }
      );
    }

    console.log(`[StatusAPI] Fetching status for ${documentIds.length} document(s)`);

    // ================================================
    // STEP 3: Query Database
    // ================================================
    const { data: documents, error: queryError } = await supabase
      .from('documents')
      .select(`
        id,
        title,
        status,
        processing_progress,
        processing_error,
        processing_started_at,
        processing_completed_at,
        file_path,
        file_size,
        source_type,
        metadata,
        author_id
      `)
      .in('id', documentIds)
      .eq('author_id', user.id); // Security: Only return user's own documents

    if (queryError) {
      console.error('[StatusAPI] Database query error:', queryError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch document status',
          errorCode: 'DB_ERROR'
        },
        { status: 500 }
      );
    }

    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { 
          success: true, 
          documents: [] 
        },
        { status: 200 }
      );
    }

    // ================================================
    // STEP 4: Format Response
    // ================================================
    const statusResponses: DocumentStatusResponse[] = documents.map(doc => {
      // Calculate estimated time remaining (rough estimate)
      let estimatedSecondsRemaining: number | null = null;
      
      if (doc.status === 'processing' && doc.processing_started_at) {
        const startedAt = new Date(doc.processing_started_at).getTime();
        const now = Date.now();
        const elapsedMs = now - startedAt;
        const progress = doc.processing_progress || 0;
        
        if (progress > 0 && progress < 100) {
          // Estimate total time based on current progress
          const estimatedTotalMs = (elapsedMs / progress) * 100;
          const remainingMs = estimatedTotalMs - elapsedMs;
          estimatedSecondsRemaining = Math.max(0, Math.round(remainingMs / 1000));
        }
      }

      // Extract original filename from metadata or file_path
      const metadata = doc.metadata as { original_filename?: string } || {};
      const fileName = metadata.original_filename || doc.file_path?.split('/').pop() || 'Unknown';

      return {
        id: doc.id,
        status: doc.status,
        progress: doc.processing_progress || 0,
        error: doc.processing_error,
        processingStartedAt: doc.processing_started_at,
        processingCompletedAt: doc.processing_completed_at,
        estimatedSecondsRemaining,
        title: doc.title,
        fileName,
        fileSize: doc.file_size || 0,
        sourceType: doc.source_type || 'unknown'
      };
    });

    // ================================================
    // STEP 5: Return Response
    // ================================================
    return NextResponse.json({
      success: true,
      documents: statusResponses
    }, { status: 200 });

  } catch (error) {
    console.error('[StatusAPI] Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred',
        errorCode: 'SERVER_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

