import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { documentProcessor } from '../../../../lib/file-processing/document-processor';
import { ProcessDocumentRequest, ProcessDocumentResponse } from '../../../../lib/types/upload';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max (for large files)

/**
 * POST /api/documents/process
 * Triggers text extraction for an uploaded document
 * 
 * Request Body:
 *   - documentId: string (UUID of document to process)
 * 
 * Response:
 *   - 200: { success: true, message: string }
 *   - 400: { success: false, error: string }
 *   - 401: { success: false, error: string }
 *   - 500: { success: false, error: string }
 */
export async function POST(request: NextRequest) {
  console.log('[ProcessAPI] Received processing request');
  
  try {
    // ================================================
    // STEP 1: Authentication
    // ================================================
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('[ProcessAPI] Authentication error:', userError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid authentication' 
        },
        { status: 401 }
      );
    }

    // ================================================
    // STEP 2: Parse Request Body
    // ================================================
    const body: ProcessDocumentRequest = await request.json();
    const { documentId } = body;

    if (!documentId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'documentId is required' 
        },
        { status: 400 }
      );
    }

    console.log(`[ProcessAPI] Processing document: ${documentId} for user: ${user.id}`);

    // ================================================
    // STEP 3: Verify Document Ownership
    // ================================================
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('id, author_id, status')
      .eq('id', documentId)
      .single();

    if (fetchError || !document) {
      console.error('[ProcessAPI] Document not found:', fetchError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Document not found' 
        },
        { status: 404 }
      );
    }

    // Verify user owns this document
    if (document.author_id !== user.id) {
      console.error(`[ProcessAPI] Unauthorized access attempt by ${user.id} to document ${documentId}`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized access to document' 
        },
        { status: 403 }
      );
    }

    // ================================================
    // STEP 4: Process Document
    // ================================================
    console.log(`[ProcessAPI] Starting text extraction for ${documentId}...`);
    
    const result = await documentProcessor.processDocument(documentId);

    if (result.success) {
      console.log(`[ProcessAPI] Processing successful. Extracted ${result.textLength} characters`);
      
      const response: ProcessDocumentResponse = {
        success: true,
        message: `Text extraction completed. Extracted ${result.textLength} characters.`
      };
      
      return NextResponse.json(response, { status: 200 });
    } else {
      console.error(`[ProcessAPI] Processing failed:`, result.error);
      
      const response: ProcessDocumentResponse = {
        success: false,
        message: 'Text extraction failed',
        error: result.error
      };
      
      return NextResponse.json(response, { status: 500 });
    }

  } catch (error) {
    console.error('[ProcessAPI] Unexpected error:', error);
    
    const response: ProcessDocumentResponse = {
      success: false,
      message: 'An unexpected error occurred during processing',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * PUT /api/documents/process (for retry)
 * Retry text extraction for a document in error state
 */
export async function PUT(request: NextRequest) {
  console.log('[ProcessAPI] Received retry request');
  
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Parse request
    const body: ProcessDocumentRequest = await request.json();
    const { documentId } = body;

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: 'documentId is required' },
        { status: 400 }
      );
    }

    console.log(`[ProcessAPI] Retrying processing for document: ${documentId}`);

    // Verify ownership
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('id, author_id, status')
      .eq('id', documentId)
      .single();

    if (fetchError || !document || document.author_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Document not found or unauthorized' },
        { status: 404 }
      );
    }

    // Retry processing
    const result = await documentProcessor.retryProcessing(documentId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Retry successful. Extracted ${result.textLength} characters.`
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Retry failed',
        error: result.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('[ProcessAPI] Unexpected retry error:', error);
    return NextResponse.json({
      success: false,
      message: 'An unexpected error occurred during retry',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

