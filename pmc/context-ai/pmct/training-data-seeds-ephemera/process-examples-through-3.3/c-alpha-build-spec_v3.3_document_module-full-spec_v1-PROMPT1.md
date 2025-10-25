# PROMPT 1: Database Setup + Core Infrastructure
**Module:** Document Upload & Processing  
**Phase:** Infrastructure Setup  
**Estimated Time:** 2-3 hours  
**Prerequisites:** Supabase project configured, Next.js app running

---

## CONTEXT FOR CODING AGENT

You are implementing Phase 1 of a document upload module for "Bright Run," a Next.js 14 application that helps users create LoRA fine-tuning training data from business documents.

### Existing Architecture
- **Framework:** Next.js 14 with App Router (TypeScript)
- **Database:** Supabase PostgreSQL with Row Level Security
- **Storage:** Supabase Storage
- **Auth:** Supabase Auth (already implemented, `src/lib/supabase.ts` exists)
- **UI:** Radix UI components (48 components in `src/components/ui/`)
- **State:** Zustand for state management
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

### Existing Database Schema
The `documents` table exists with:
- `id` (UUID, primary key)
- `title` (TEXT)
- `content` (TEXT, nullable)
- `summary` (TEXT, nullable)
- `created_at`, `updated_at` (TIMESTAMPTZ)
- `author_id` (UUID, references user_profiles)
- `status` (TEXT, check constraint: 'pending', 'categorizing', 'completed')
- `file_path` (TEXT, nullable)
- `file_size` (INTEGER, nullable)
- `metadata` (JSONB, nullable)

### Your Task in Prompt 1
1. ✅ Add 8 new columns to documents table for processing tracking
2. ✅ Configure Supabase Storage bucket with security policies
3. ✅ Install 3 NPM packages for text extraction
4. ✅ Create TypeScript type definitions for upload module
5. ✅ Create file upload API endpoint

### Success Criteria
- Database schema updated with processing columns
- Storage bucket "documents" configured with RLS policies
- NPM dependencies installed
- Type definitions file created
- Upload API endpoint functional and tested

---



====================



## STEP 1: Execute Database Migration

**DIRECTIVE:** You shall execute the following SQL migration in your Supabase SQL Editor to add processing-related columns to the documents table.

**Instructions:**
1. Open Supabase Dashboard
2. Navigate to SQL Editor
3. Click "New Query"
4. Copy and paste the SQL below
5. Click "Run" to execute
6. Verify results with the verification query at the end

**SQL to Execute:**

```sql
-- ================================================
-- Document Processing Module - Database Migration
-- Version: 1.0
-- Date: 2025-10-10
-- Purpose: Add columns for document upload and text extraction tracking
-- ================================================

-- Step 1: Add new columns to documents table
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS doc_version TEXT,
  ADD COLUMN IF NOT EXISTS source_type TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS doc_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS processing_progress INTEGER DEFAULT 0 CHECK (processing_progress >= 0 AND processing_progress <= 100),
  ADD COLUMN IF NOT EXISTS processing_error TEXT,
  ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS processing_completed_at TIMESTAMPTZ;

-- Step 2: Create indexes for query performance
CREATE INDEX IF NOT EXISTS idx_documents_status_updated 
  ON documents(status, updated_at) 
  WHERE status IN ('uploaded', 'processing');

CREATE INDEX IF NOT EXISTS idx_documents_source_type 
  ON documents(source_type) 
  WHERE source_type IS NOT NULL;

-- Step 3: Update status constraint to include new values
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_status_check;
ALTER TABLE documents 
  ADD CONSTRAINT documents_status_check 
  CHECK (status IN ('pending', 'categorizing', 'completed', 'uploaded', 'processing', 'error'));

-- Step 4: Add column comments for documentation
COMMENT ON COLUMN documents.doc_version IS 'User-provided document version (e.g., v1.0, 2024-Q3, Draft)';
COMMENT ON COLUMN documents.source_type IS 'Auto-detected file type: pdf, docx, txt, markdown, html, rtf';
COMMENT ON COLUMN documents.source_url IS 'Optional source URL or file path for provenance tracking';
COMMENT ON COLUMN documents.doc_date IS 'Original document creation/publication date (user-provided, not upload date)';
COMMENT ON COLUMN documents.processing_progress IS 'Text extraction progress percentage (0-100)';
COMMENT ON COLUMN documents.processing_error IS 'Error message if text extraction fails';
COMMENT ON COLUMN documents.processing_started_at IS 'Timestamp when text extraction started';
COMMENT ON COLUMN documents.processing_completed_at IS 'Timestamp when text extraction completed';

-- Step 5: Verification query
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'documents' 
  AND column_name IN (
    'doc_version', 'source_type', 'source_url', 'doc_date',
    'processing_progress', 'processing_error',
    'processing_started_at', 'processing_completed_at'
  )
ORDER BY ordinal_position;
```

**Expected Verification Output:**

```
column_name              | data_type                   | is_nullable | column_default
------------------------|-----------------------------|-----------|--------------
doc_version             | text                        | YES       | NULL
source_type             | text                        | YES       | NULL
source_url              | text                        | YES       | NULL
doc_date                | timestamp with time zone    | YES       | NULL
processing_progress     | integer                     | YES       | 0
processing_error        | text                        | YES       | NULL
processing_started_at   | timestamp with time zone    | YES       | NULL
processing_completed_at | timestamp with time zone    | YES       | NULL
```

**Verification Steps:**
1. Verify 8 rows returned from verification query
2. Check that status constraint now includes: 'uploaded', 'processing', 'error'
3. Run: `SELECT * FROM pg_indexes WHERE tablename = 'documents' AND indexname LIKE 'idx_documents_%';` to verify 2 new indexes created

**If Errors Occur:**
- If constraint error: The table might have existing data with invalid status values. Check existing data first.
- If column exists error: Safe to ignore (IF NOT EXISTS clause handles this)
- If permission error: Ensure you're connected as the project owner or have ALTER TABLE permissions



++++++++++++++++++++++++DONEDONEDONEDONEDONEDONE



## STEP 2: Configure Supabase Storage

**DIRECTIVE:** You shall create a Supabase Storage bucket for document uploads with Row Level Security policies.

### Step 2A: Create Storage Bucket

**Instructions:**
1. Open Supabase Dashboard
2. Navigate to: Storage → Buckets
3. Click "New Bucket"
4. Configure exactly as specified below
5. Click "Create"

**Bucket Configuration:**

```
Name: documents
Public bucket: ☐ No (UNCHECKED - this is a private bucket)
File size limit: 104857600
Allowed MIME types: (Add each one separately)
  - application/pdf
  - application/vnd.openxmlformats-officedocument.wordprocessingml.document
  - application/msword
  - text/plain
  - text/markdown
  - text/html
  - application/rtf
```

**Verification:**
- Bucket "documents" appears in buckets list
- Status shows as "Private"
- File size limit shows as "100 MB"


----------------DONEDONEDONEDONEDONE
### Step 2B: Configure Storage Policies

**DIRECTIVE:** You shall create Row Level Security policies that allow authenticated users to manage only their own documents.

**Instructions:**
1. Open Supabase Dashboard
2. Navigate to SQL Editor
3. Click "New Query"
4. Execute the SQL below

**SQL to Execute:**

```sql
-- ================================================
-- Document Storage Policies
-- Purpose: Configure RLS policies for documents bucket
-- Security: Users can only access files in their own user ID folder
-- ================================================

-- Policy 1: Users can upload documents to their own folder
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- Policy 2: Users can read their own documents
CREATE POLICY "Users can read own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- Policy 3: Users can update their own documents
CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- Policy 4: Users can delete their own documents
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- Verification: Check policies were created
SELECT 
  policyname, 
  cmd,
  CASE WHEN qual IS NOT NULL THEN 'Has USING clause' ELSE 'No USING clause' END as using_clause,
  CASE WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause' ELSE 'No WITH CHECK clause' END as with_check_clause
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname LIKE '%own documents%'
ORDER BY policyname;
```

**Expected Verification Output:**

```
policyname                      | cmd    | using_clause      | with_check_clause
-------------------------------|--------|-------------------|------------------
Users can delete own documents | DELETE | Has USING clause  | No WITH CHECK clause
Users can read own documents   | SELECT | Has USING clause  | No WITH CHECK clause
Users can update own documents | UPDATE | Has USING clause  | No WITH CHECK clause
Users can upload own documents | INSERT | No USING clause   | Has WITH CHECK clause
```

**File Path Structure:**
Files will be stored with this pattern: `{userId}/{timestamp}-{sanitizedFilename}`

Examples:
- `550e8400-e29b-41d4-a716-446655440001/1696886400000-report.pdf`
- `550e8400-e29b-41d4-a716-446655440001/1696886401234-meeting_notes.docx`

This structure ensures:
- Each user has their own folder (first-level folder is user ID)
- Files are uniquely named with timestamp prefix
- Storage policies can check folder ownership via `storage.foldername(name)[1]`



+++++++++++DONEDONEDONEDONE+++++++++++++



## STEP 3: Install NPM Dependencies

**DIRECTIVE:** You shall install three NPM packages required for server-side text extraction from PDF, DOCX, and HTML files.

**Instructions:**
1. Open terminal
2. Navigate to project root (where `src/package.json` is located)
3. Run the install command below
4. Verify installation

**Command to Execute:**

```bash
npm install pdf-parse@1.1.1 mammoth@1.6.0 html-to-text@9.0.5
```

**Verification Command:**

```bash
npm list pdf-parse mammoth html-to-text
```

**Expected Output:**

```
cat-module@0.1.0 /path/to/project/src
├── html-to-text@9.0.5
├── mammoth@1.6.0
└── pdf-parse@1.1.1
```

**Package Details:**

| Package | Version | Purpose | Size | License |
|---------|---------|---------|------|---------|
| pdf-parse | 1.1.1 | Extract text from PDF files | ~1.2MB | MIT |
| mammoth | 1.6.0 | Extract text from DOCX files, preserves structure | ~500KB | MIT |
| html-to-text | 9.0.5 | Convert HTML to plain text, strips tags/scripts | ~300KB | MIT |

**Important Notes:**
- These packages are server-side only (use Node.js APIs)
- They will NOT increase client bundle size
- All are MIT licensed (no licensing issues)
- Total size impact: ~2MB in node_modules

**Verification:**
1. Check `src/package.json` - all three packages should be listed in dependencies
2. Check `src/package-lock.json` - lock file should be updated
3. Run `npm run build` - should complete with no errors
4. Check `node_modules/` - three package folders should exist



++++++++++++++++++++++++



## STEP 4: Create Upload Type Definitions

**DIRECTIVE:** You shall create comprehensive TypeScript type definitions for the upload module to ensure type safety across all components and API endpoints.

**Instructions:**
1. Create directory: `src/lib/types/` (if it doesn't already exist)
2. Create file: `src/lib/types/upload.ts`
3. Copy the complete code below into the file
4. Save and verify no TypeScript errors

**File:** `src/lib/types/upload.ts`

```typescript
// ================================================
// Document Upload Module - Type Definitions
// ================================================
// Purpose: Centralized type definitions for upload functionality
// Version: 1.0
// Date: 2025-10-10

/**
 * Supported file types for document upload
 */
export type SupportedFileType = 
  | 'pdf' 
  | 'docx' 
  | 'doc' 
  | 'txt' 
  | 'md' 
  | 'markdown' 
  | 'html' 
  | 'htm' 
  | 'rtf';

/**
 * Document processing status
 * - uploaded: File uploaded to storage, pending text extraction
 * - processing: Text extraction in progress
 * - completed: Text extraction successful, document ready for categorization
 * - error: Text extraction failed
 * - paused: Processing manually paused by user (future feature)
 */
export type DocumentStatus = 
  | 'uploaded' 
  | 'processing' 
  | 'completed' 
  | 'error' 
  | 'paused';

/**
 * Document upload priority (for future queue management)
 */
export type DocumentPriority = 'high' | 'medium' | 'low';

/**
 * File validation result
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
  errorCode?: 'FILE_TOO_LARGE' | 'UNSUPPORTED_TYPE' | 'INVALID_NAME' | 'CAPACITY_EXCEEDED';
}

/**
 * Document metadata captured during upload
 */
export interface DocumentMetadata {
  title: string;
  doc_version?: string | null;
  source_url?: string | null;
  doc_date?: string | null; // ISO 8601 date string
  source_type: SupportedFileType;
  file_size: number;
  file_path: string;
}

/**
 * Upload API response payload
 */
export interface UploadDocumentResponse {
  success: boolean;
  document?: {
    id: string;
    title: string;
    status: DocumentStatus;
    file_path: string;
    created_at: string;
  };
  error?: string;
  errorCode?: string;
}

/**
 * Processing API request payload
 */
export interface ProcessDocumentRequest {
  documentId: string;
}

/**
 * Processing API response payload
 */
export interface ProcessDocumentResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_BATCH_SIZE: 100, // Maximum files per upload session
} as const;

/**
 * Supported MIME types mapping for validation
 */
export const MIME_TYPE_MAP: Record<SupportedFileType, string[]> = {
  pdf: ['application/pdf'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  doc: ['application/msword'],
  txt: ['text/plain'],
  md: ['text/markdown', 'text/x-markdown'],
  markdown: ['text/markdown', 'text/x-markdown'],
  html: ['text/html'],
  htm: ['text/html'],
  rtf: ['application/rtf', 'text/rtf'],
};

/**
 * Detect file type from filename extension
 * @param filename - Name of the file including extension
 * @returns Detected file type or null if unsupported
 */
export function detectFileType(filename: string): SupportedFileType | null {
  const extension = filename.split('.').pop()?.toLowerCase();
  if (!extension) return null;
  
  const supportedTypes: SupportedFileType[] = [
    'pdf', 'docx', 'doc', 'txt', 'md', 'markdown', 'html', 'htm', 'rtf'
  ];
  
  if (supportedTypes.includes(extension as SupportedFileType)) {
    return extension as SupportedFileType;
  }
  
  return null;
}

/**
 * Validate file for upload eligibility
 * @param file - File object to validate
 * @param currentFileCount - Number of files already in upload queue
 * @returns Validation result with error details if invalid
 */
export function validateFile(file: File, currentFileCount: number): FileValidationResult {
  // Check capacity limit
  if (currentFileCount >= FILE_SIZE_LIMITS.MAX_BATCH_SIZE) {
    return {
      valid: false,
      error: `Maximum file limit reached (${FILE_SIZE_LIMITS.MAX_BATCH_SIZE} files). Please process or remove some files.`,
      errorCode: 'CAPACITY_EXCEEDED',
    };
  }

  // Check file size limit
  if (file.size > FILE_SIZE_LIMITS.MAX_FILE_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    return {
      valid: false,
      error: `File size exceeds maximum limit of 100MB. File size: ${sizeMB}MB`,
      errorCode: 'FILE_TOO_LARGE',
    };
  }

  // Check file type
  const fileType = detectFileType(file.name);
  if (!fileType) {
    return {
      valid: false,
      error: `Unsupported file type. Supported formats: PDF, DOCX, DOC, TXT, MD, HTML, RTF`,
      errorCode: 'UNSUPPORTED_TYPE',
    };
  }

  // Validate filename characters (prevent path traversal and invalid chars)
  const invalidChars = /[<>:"|?*\x00-\x1F]/;
  if (invalidChars.test(file.name)) {
    return {
      valid: false,
      error: 'Filename contains invalid characters. Please rename the file.',
      errorCode: 'INVALID_NAME',
    };
  }

  // Check for path traversal attempts
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return {
      valid: false,
      error: 'Filename cannot contain path separators.',
      errorCode: 'INVALID_NAME',
    };
  }

  return { valid: true };
}

/**
 * Format file size for human-readable display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format timestamp as relative time ago
 * @param timestamp - ISO 8601 timestamp string
 * @returns Formatted string (e.g., "5m ago", "2h ago")
 */
export function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

/**
 * Sanitize filename for storage
 * Replaces problematic characters with underscores
 * @param filename - Original filename
 * @returns Sanitized filename safe for storage
 */
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
}
```

**Verification Steps:**
1. Run `npm run build` or start TypeScript compiler
2. Verify no TypeScript errors
3. Import the types in another file to test: `import { detectFileType } from '@/lib/types/upload';`
4. Check that VS Code/IDE provides intellisense for the exported types



++++++++DONEDONEDONEDONEDONEDONE++++++++++++++++

## STEP 5: Create Upload API Endpoint

**DIRECTIVE:** You shall create the API endpoint that handles file uploads to Supabase Storage and creates database records with metadata.

**Instructions:**
1. Create directory: `src/app/api/documents/upload/`
2. Create file: `src/app/api/documents/upload/route.ts`
3. Copy the complete code below
4. Save and verify no TypeScript errors

**File:** `src/app/api/documents/upload/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { 
  detectFileType, 
  validateFile, 
  sanitizeFilename 
} from '../../../../lib/types/upload';

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

    const { data: uploadData, error: uploadError } = await supabase.storage
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
    // STEP 6: Trigger Background Text Extraction
    // ================================================
    // Note: This is a non-blocking call that triggers the processing endpoint
    // We don't await it to keep upload response fast
    const processUrl = `${request.nextUrl.origin}/api/documents/process`;
    
    fetch(processUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({ documentId: document.id })
    }).catch(err => {
      // Log error but don't fail the upload
      console.error('Failed to trigger text extraction:', err);
    });

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
```

**Verification Steps:**
1. Run `npm run build` - should complete with no TypeScript errors
2. Check file exists at: `src/app/api/documents/upload/route.ts`
3. Verify imports resolve correctly (supabase, upload types)
4. The endpoint will be available at: `POST /api/documents/upload`

**Testing the Endpoint (Manual):**

Use this curl command to test (replace TOKEN with actual auth token):

```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/test.pdf" \
  -F "title=Test Document"
```

Expected response:
```json
{
  "success": true,
  "document": {
    "id": "uuid-here",
    "title": "Test Document",
    "status": "uploaded",
    "file_path": "user-id/timestamp-test.pdf",
    "created_at": "2025-10-10T12:00:00Z"
  }
}
```



+++++DONEDONEDONEDONEDONEDONE+++++++++++++++++++



## PROMPT 1 COMPLETION CHECKLIST

Before proceeding to Prompt 2, verify all items below:

### Database & Storage
- [ ] Ran database migration SQL successfully
- [ ] 8 new columns added to documents table
- [ ] 2 indexes created (idx_documents_status_updated, idx_documents_source_type)
- [ ] Status constraint updated to include: 'uploaded', 'processing', 'error'
- [ ] Supabase Storage bucket "documents" created
- [ ] Bucket configured as Private (not public)
- [ ] 4 RLS policies active on storage.objects table

### Dependencies & Code
- [ ] 3 NPM packages installed (pdf-parse, mammoth, html-to-text)
- [ ] Packages appear in package.json dependencies
- [ ] Type definitions file created: `src/lib/types/upload.ts`
- [ ] Upload API endpoint created: `src/app/api/documents/upload/route.ts`
- [ ] No TypeScript build errors (`npm run build` succeeds)

### Testing
- [ ] Can run `npm run dev` and server starts successfully
- [ ] Upload API endpoint accessible at `/api/documents/upload`
- [ ] Test upload with curl or Postman returns 201 success
- [ ] Uploaded file appears in Supabase Storage under user's folder
- [ ] Database record created in documents table with status 'uploaded'
- [ ] All metadata fields populated correctly

### Manual Test Scenario

1. **Sign in** to the application (get auth token)
2. **Test upload API** with curl or Postman:
   ```bash
   curl -X POST http://localhost:3000/api/documents/upload \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@test.pdf" \
     -F "title=Test Document"
   ```
3. **Verify in Supabase Dashboard:**
   - Storage → documents bucket → your user ID folder → file exists
   - Table Editor → documents table → new row with status 'uploaded'
4. **Check columns:**
   - `title` = "Test Document"
   - `status` = "uploaded"
   - `source_type` = "pdf"
   - `file_path` = "userid/timestamp-test.pdf"
   - `processing_progress` = 0
   - `content` = NULL (will be filled by text extraction in Prompt 2)

**If all items checked:** ✅ Prompt 1 complete! Proceed to Prompt 2.

**If any items fail:** Review the error messages and re-execute the failing step.

---

## What's Next

**Prompt 2** will build:
- Upload Dropzone React component (drag-drop UI)
- Upload Page component (full upload interface)
- Loading states and error handling
- Integration with existing dashboard navigation

**Prompt 3** will build:
- Text extraction service (PDF, DOCX, HTML, TXT)
- Document processor orchestrator
- Processing API endpoint
- Background job handling

---

**END OF PROMPT 1**

