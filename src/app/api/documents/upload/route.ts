import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  detectFileType, 
  validateFile, 
  sanitizeFilename 
} from '@/lib/types/upload';

// Create Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://placeholder',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Configure route for Node.js runtime (required for file processing)
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 second timeout

/**
 * POST /api/documents/upload
 * Handles document file uploads with metadata
 * 
 * Request Body (FormData):
 *   - file: File (required)
 *   - title: string (optional, defaults to filename without extension)
 *   - doc_version: string (optional)
 *   - source_url: string (optional)
 *   - doc_date: string (optional, ISO 8601 date)
 * 
 * Response:
 *   - 201: { success: true, document: {...} }
 *   - 400: { success: false, error: string, errorCode: string }
 *   - 401: { success: false, error: string, errorCode: string }
 *   - 500: { success: false, error: string, errorCode: string }
 */
export async function POST(request: NextRequest) {
  try {
    // ================================================
    // STEP 1: Authentication
    // ================================================
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required. Please sign in to upload documents.', 
          errorCode: 'AUTH_REQUIRED' 
        },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Authentication error:', userError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid authentication token. Please sign in again.', 
          errorCode: 'AUTH_INVALID' 
        },
        { status: 401 }
      );
    }

    // ================================================
    // STEP 2: Parse and Validate Form Data
    // ================================================
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string | null;
    const doc_version = formData.get('doc_version') as string | null;
    const source_url = formData.get('source_url') as string | null;
    const doc_date = formData.get('doc_date') as string | null;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No file provided in request.', 
          errorCode: 'NO_FILE' 
        },
        { status: 400 }
      );
    }

    // Validate file type and size
    const validation = validateFile(file, 0); // Pass 0 for currentFileCount (checked client-side)
    if (!validation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: validation.error, 
          errorCode: validation.errorCode 
        },
        { status: 400 }
      );
    }

    // ================================================
    // STEP 3: Detect File Type
    // ================================================
    const source_type = detectFileType(file.name);
    if (!source_type) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unable to determine file type from filename extension.', 
          errorCode: 'INVALID_TYPE' 
        },
        { status: 400 }
      );
    }

    // ================================================
    // STEP 4: Prepare File Path and Upload to Storage
    // ================================================
    const timestamp = Date.now();
    const sanitizedFilename = sanitizeFilename(file.name);
    const file_path = `${user.id}/${timestamp}-${sanitizedFilename}`;

    // Convert File to Buffer for Supabase upload
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    console.log(`Uploading file: ${file.name} (${file.size} bytes) to ${file_path}`);

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(file_path, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false // Don't overwrite existing files
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to upload file to storage. Please try again.', 
          errorCode: 'STORAGE_ERROR',
          details: uploadError.message
        },
        { status: 500 }
      );
    }

    // ================================================
    // STEP 5: Create Database Record
    // ================================================
    const document_title = title || file.name.replace(/\.[^/.]+$/, ''); // Remove extension if no title provided

    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        title: document_title,
        author_id: user.id,
        status: 'uploaded', // Initial status
        file_path: file_path,
        file_size: file.size,
        source_type: source_type,
        doc_version: doc_version || null,
        source_url: source_url || null,
        doc_date: doc_date ? new Date(doc_date).toISOString() : null,
        processing_progress: 0,
        content: null, // Will be populated by text extraction
        summary: null, // Will be populated later
        metadata: {
          original_filename: file.name,
          uploaded_at: new Date().toISOString(),
          mime_type: file.type
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      
      // Cleanup: Delete uploaded file if database insert fails
      console.log('Cleaning up uploaded file due to database error...');
      await supabase.storage.from('documents').remove([file_path]);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create document record in database.', 
          errorCode: 'DB_ERROR',
          details: dbError.message
        },
        { status: 500 }
      );
    }

    // ================================================
    // STEP 6: Note on Processing Trigger
    // ================================================
    // Processing is now triggered from the client side after upload succeeds
    // This ensures more reliable processing initiation and better error visibility
    // The client-side trigger has better retry logic and user feedback
    // Server-side background trigger removed due to Vercel serverless limitations
    
    console.log(`[Upload] Document ${document.id} created successfully. Client will trigger processing.`);

    // ================================================
    // STEP 7: Return Success Response
    // ================================================
    console.log(`Successfully uploaded document: ${document.id}`);
    
    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        status: document.status,
        file_path: document.file_path,
        created_at: document.created_at
      }
    }, { status: 201 });

  } catch (error) {
    // Catch-all error handler
    console.error('Upload API unexpected error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred during upload.', 
        errorCode: 'SERVER_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}