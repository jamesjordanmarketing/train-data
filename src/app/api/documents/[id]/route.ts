import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const runtime = 'nodejs';
export const maxDuration = 10;

/**
 * Allowed metadata fields that can be updated by users
 */
const ALLOWED_UPDATE_FIELDS = [
  'title',
  'doc_version',
  'source_url',
  'doc_date'
] as const;

/**
 * PATCH /api/documents/:id
 * Update document metadata
 * 
 * Request Body:
 *   - title?: string
 *   - doc_version?: string | null
 *   - source_url?: string | null
 *   - doc_date?: string | null (ISO 8601 date)
 * 
 * Response:
 *   - 200: { success: true, document: {...} }
 *   - 400: { success: false, error: string }
 *   - 401: { success: false, error: string }
 *   - 403: { success: false, error: string }
 *   - 404: { success: false, error: string }
 *   - 500: { success: false, error: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[MetadataAPI] PATCH request for document:', params.id);
  
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
      console.error('[MetadataAPI] Authentication error:', userError);
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
    // STEP 2: Parse and Validate Request Body
    // ================================================
    const body = await request.json();
    
    // Extract only allowed fields
    const updates: Record<string, any> = {};
    
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    // Check if any valid fields provided
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No valid fields to update',
          errorCode: 'INVALID_REQUEST'
        },
        { status: 400 }
      );
    }

    // Validate title (if provided)
    if ('title' in updates) {
      if (typeof updates.title !== 'string' || updates.title.trim().length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Title cannot be empty',
            errorCode: 'INVALID_TITLE'
          },
          { status: 400 }
        );
      }
      
      if (updates.title.length > 500) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Title cannot exceed 500 characters',
            errorCode: 'TITLE_TOO_LONG'
          },
          { status: 400 }
        );
      }
      
      updates.title = updates.title.trim();
    }

    // Validate source_url (if provided)
    if ('source_url' in updates && updates.source_url !== null) {
      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(updates.source_url)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Source URL must be a valid HTTP or HTTPS URL',
            errorCode: 'INVALID_URL'
          },
          { status: 400 }
        );
      }
    }

    // Validate doc_date (if provided)
    if ('doc_date' in updates && updates.doc_date !== null) {
      const date = new Date(updates.doc_date);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Document date must be a valid date',
            errorCode: 'INVALID_DATE'
          },
          { status: 400 }
        );
      }
      
      // Convert to ISO string
      updates.doc_date = date.toISOString();
    }

    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();

    console.log('[MetadataAPI] Validated updates:', Object.keys(updates));

    // ================================================
    // STEP 3: Verify Document Exists and User Owns It
    // ================================================
    const { data: existingDoc, error: fetchError } = await supabase
      .from('documents')
      .select('id, author_id, title, status')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingDoc) {
      console.error('[MetadataAPI] Document not found:', fetchError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Document not found',
          errorCode: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Verify ownership
    if (existingDoc.author_id !== user.id) {
      console.error(`[MetadataAPI] Unauthorized access attempt by ${user.id}`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'You do not have permission to update this document',
          errorCode: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    // ================================================
    // STEP 4: Update Database
    // ================================================
    const { data: updatedDoc, error: updateError } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', params.id)
      .select(`
        id,
        title,
        doc_version,
        source_url,
        doc_date,
        source_type,
        file_size,
        status,
        created_at,
        updated_at
      `)
      .single();

    if (updateError) {
      console.error('[MetadataAPI] Update error:', updateError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update document metadata',
          errorCode: 'DB_ERROR',
          details: updateError.message
        },
        { status: 500 }
      );
    }

    console.log('[MetadataAPI] Successfully updated document:', params.id);

    // ================================================
    // STEP 5: Return Success Response
    // ================================================
    return NextResponse.json({
      success: true,
      document: updatedDoc
    }, { status: 200 });

  } catch (error) {
    console.error('[MetadataAPI] Unexpected error:', error);
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

/**
 * GET /api/documents/:id
 * Retrieve document details including full content
 * 
 * Response:
 *   - 200: { success: true, document: {...} }
 *   - 401: { success: false, error: string }
 *   - 403: { success: false, error: string }
 *   - 404: { success: false, error: string }
 *   - 500: { success: false, error: string }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[MetadataAPI] GET request for document:', params.id);
  
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', errorCode: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication', errorCode: 'AUTH_INVALID' },
        { status: 401 }
      );
    }

    // Fetch document
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { success: false, error: 'Document not found', errorCode: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (document.author_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access', errorCode: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      document
    }, { status: 200 });

  } catch (error) {
    console.error('[MetadataAPI] GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred',
        errorCode: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/:id
 * Delete document and associated file from storage
 * 
 * Response:
 *   - 200: { success: true }
 *   - 401: { success: false, error: string }
 *   - 403: { success: false, error: string }
 *   - 404: { success: false, error: string }
 *   - 500: { success: false, error: string }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[MetadataAPI] DELETE request for document:', params.id);
  
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', errorCode: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication', errorCode: 'AUTH_INVALID' },
        { status: 401 }
      );
    }

    // Fetch document to get file_path
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('id, author_id, file_path')
      .eq('id', params.id)
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { success: false, error: 'Document not found', errorCode: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (document.author_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access', errorCode: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Delete from storage
    if (document.file_path) {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) {
        console.error('[MetadataAPI] Storage delete error:', storageError);
        // Continue anyway - database delete is more important
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', params.id)
      .eq('author_id', user.id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    console.log('[MetadataAPI] Successfully deleted document:', params.id);

    return NextResponse.json({
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error('[MetadataAPI] DELETE error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete document',
        errorCode: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
