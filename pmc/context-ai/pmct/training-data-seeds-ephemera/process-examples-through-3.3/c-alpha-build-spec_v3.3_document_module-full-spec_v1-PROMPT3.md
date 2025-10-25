# PROMPT 3: Text Extraction & Processing
**Module:** Document Upload & Processing  
**Phase:** Text Extraction Engine  
**Estimated Time:** 4-5 hours  
**Prerequisites:** Prompt 1 & 2 completed (Upload UI functional)

---

## CONTEXT FOR CODING AGENT

You are implementing Phase 3 of the document upload module for "Bright Run." In Prompts 1 & 2, you created the database schema, upload API, and upload UI. Now you will build the text extraction service that automatically extracts text from uploaded PDF, DOCX, HTML, TXT, MD, and RTF files.

### What Was Built in Previous Prompts
✅ **Prompt 1:** Database schema, Storage configuration, NPM packages, Upload API  
✅ **Prompt 2:** Upload Dropzone UI, Upload Page, Dashboard integration

### Current State
- Users can upload files via `/upload` page
- Files are stored in Supabase Storage
- Database records created with status 'uploaded'
- Upload API triggers `/api/documents/process` endpoint (doesn't exist yet)

### Your Task in Prompt 3
1. ✅ Create Text Extractor Service (PDF, DOCX, HTML, TXT, MD, RTF)
2. ✅ Create Document Processor (orchestrates extraction + DB updates)
3. ✅ Create Processing API Endpoint (handles text extraction requests)
4. ✅ Add error handling and retry logic

### Success Criteria
- Text extracted from uploaded PDF files
- Text extracted from DOCX files
- Text extracted from HTML files
- Text extracted from TXT/MD/RTF files
- Database content field populated with extracted text
- Status updated to 'completed' or 'error'
- Error messages stored in processing_error field
- Processing timestamps recorded

---

## STEP 1: Create Text Extractor Service

**DIRECTIVE:** You shall create a service that extracts plain text from various file formats using the NPM packages installed in Prompt 1.

**Instructions:**
1. Create directory: `src/lib/file-processing/`
2. Create file: `src/lib/file-processing/text-extractor.ts`
3. Copy the complete code below
4. Save and verify no TypeScript errors

**File:** `src/lib/file-processing/text-extractor.ts`

```typescript
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { convert as htmlToText } from 'html-to-text';
import { SupportedFileType } from '../types/upload';

/**
 * Text extraction error types
 */
export type ExtractionErrorType = 
  | 'CORRUPT_FILE'
  | 'UNSUPPORTED_CONTENT'
  | 'TIMEOUT'
  | 'SERVER_ERROR';

/**
 * Custom error class for text extraction failures
 */
export class ExtractionError extends Error {
  constructor(
    message: string,
    public type: ExtractionErrorType,
    public documentId: string,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'ExtractionError';
  }
}

/**
 * Text Extractor Service
 * 
 * Handles text extraction from various file formats:
 * - PDF (via pdf-parse)
 * - DOCX (via mammoth)
 * - HTML (via html-to-text)
 * - TXT, MD, RTF (direct read)
 */
export class TextExtractor {
  /**
   * Extract text from a file buffer based on source type
   * @param buffer - File buffer (from Supabase Storage)
   * @param sourceType - Detected file type
   * @param documentId - Document ID for error tracking
   * @returns Extracted plain text
   */
  async extractText(
    buffer: Buffer, 
    sourceType: SupportedFileType,
    documentId: string
  ): Promise<string> {
    try {
      switch (sourceType) {
        case 'pdf':
          return await this.extractFromPDF(buffer, documentId);
        
        case 'docx':
        case 'doc':
          return await this.extractFromDOCX(buffer, documentId);
        
        case 'html':
        case 'htm':
          return await this.extractFromHTML(buffer, documentId);
        
        case 'txt':
        case 'md':
        case 'markdown':
        case 'rtf':
          return await this.extractFromPlainText(buffer, documentId);
        
        default:
          throw new ExtractionError(
            `Unsupported file type: ${sourceType}`,
            'UNSUPPORTED_CONTENT',
            documentId,
            false
          );
      }
    } catch (error) {
      // Re-throw ExtractionError as-is
      if (error instanceof ExtractionError) {
        throw error;
      }
      
      // Wrap other errors
      throw new ExtractionError(
        `Text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SERVER_ERROR',
        documentId,
        true
      );
    }
  }

  /**
   * Extract text from PDF file
   * Uses pdf-parse library
   */
  private async extractFromPDF(buffer: Buffer, documentId: string): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      
      if (!data.text || data.text.trim().length === 0) {
        throw new ExtractionError(
          'PDF contains no extractable text. It may be a scanned image or empty.',
          'UNSUPPORTED_CONTENT',
          documentId,
          false
        );
      }

      // Clean up text
      const cleanedText = this.cleanText(data.text);
      
      // Validate minimum length
      if (cleanedText.length < 10) {
        throw new ExtractionError(
          'Extracted text is too short. File may be corrupt or contain only images.',
          'UNSUPPORTED_CONTENT',
          documentId,
          false
        );
      }

      return cleanedText;
    } catch (error) {
      if (error instanceof ExtractionError) throw error;
      
      throw new ExtractionError(
        `PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CORRUPT_FILE',
        documentId,
        true
      );
    }
  }

  /**
   * Extract text from DOCX file
   * Uses mammoth library
   */
  private async extractFromDOCX(buffer: Buffer, documentId: string): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      
      if (!result.value || result.value.trim().length === 0) {
        throw new ExtractionError(
          'DOCX file contains no extractable text or is empty.',
          'UNSUPPORTED_CONTENT',
          documentId,
          false
        );
      }

      // Check for warnings (mammoth may have issues with document structure)
      if (result.messages && result.messages.length > 0) {
        console.warn(`DOCX extraction warnings for ${documentId}:`, result.messages);
      }

      // Clean up text
      const cleanedText = this.cleanText(result.value);
      
      // Validate minimum length
      if (cleanedText.length < 10) {
        throw new ExtractionError(
          'Extracted text is too short. File may be corrupt.',
          'CORRUPT_FILE',
          documentId,
          true
        );
      }

      return cleanedText;
    } catch (error) {
      if (error instanceof ExtractionError) throw error;
      
      throw new ExtractionError(
        `DOCX parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CORRUPT_FILE',
        documentId,
        true
      );
    }
  }

  /**
   * Extract text from HTML file
   * Uses html-to-text library
   */
  private async extractFromHTML(buffer: Buffer, documentId: string): Promise<string> {
    try {
      const htmlContent = buffer.toString('utf8');
      
      // Convert HTML to plain text with formatting options
      const text = htmlToText(htmlContent, {
        wordwrap: false,
        preserveNewlines: true,
        selectors: [
          { selector: 'a', options: { ignoreHref: true } },
          { selector: 'img', format: 'skip' },
          { selector: 'script', format: 'skip' },
          { selector: 'style', format: 'skip' },
        ]
      });
      
      if (!text || text.trim().length === 0) {
        throw new ExtractionError(
          'HTML file contains no extractable text content.',
          'UNSUPPORTED_CONTENT',
          documentId,
          false
        );
      }

      // Clean up text
      const cleanedText = this.cleanText(text);
      
      // Validate minimum length
      if (cleanedText.length < 10) {
        throw new ExtractionError(
          'Extracted text is too short. HTML file may be empty or contain only markup.',
          'UNSUPPORTED_CONTENT',
          documentId,
          false
        );
      }

      return cleanedText;
    } catch (error) {
      if (error instanceof ExtractionError) throw error;
      
      throw new ExtractionError(
        `HTML parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CORRUPT_FILE',
        documentId,
        true
      );
    }
  }

  /**
   * Extract text from plain text files (TXT, MD, RTF)
   * Direct buffer read with encoding detection
   */
  private async extractFromPlainText(buffer: Buffer, documentId: string): Promise<string> {
    try {
      // Try UTF-8 encoding first
      let text = buffer.toString('utf8');
      
      // If UTF-8 decode failed (contains replacement characters), try other encodings
      if (text.includes('\uFFFD')) {
        console.log(`UTF-8 decode failed for ${documentId}, trying latin1...`);
        text = buffer.toString('latin1');
      }
      
      if (!text || text.trim().length === 0) {
        throw new ExtractionError(
          'Text file is empty or contains no readable content.',
          'UNSUPPORTED_CONTENT',
          documentId,
          false
        );
      }

      // Clean up text
      const cleanedText = this.cleanText(text);
      
      // Validate minimum length
      if (cleanedText.length < 5) {
        throw new ExtractionError(
          'File is too short or contains no readable text.',
          'UNSUPPORTED_CONTENT',
          documentId,
          false
        );
      }

      return cleanedText;
    } catch (error) {
      if (error instanceof ExtractionError) throw error;
      
      throw new ExtractionError(
        `Text file reading failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CORRUPT_FILE',
        documentId,
        true
      );
    }
  }

  /**
   * Clean and normalize extracted text
   * - Remove excessive whitespace
   * - Normalize line endings
   * - Remove null bytes
   * - Trim whitespace
   */
  private cleanText(text: string): string {
    return text
      // Remove null bytes
      .replace(/\0/g, '')
      // Normalize line endings to \n
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove excessive blank lines (more than 2 consecutive)
      .replace(/\n{3,}/g, '\n\n')
      // Remove excessive spaces (more than 2 consecutive)
      .replace(/ {3,}/g, '  ')
      // Trim leading/trailing whitespace
      .trim();
  }

  /**
   * Validate extracted text meets quality standards
   * @param text - Extracted text
   * @param documentId - Document ID for error tracking
   * @throws ExtractionError if validation fails
   */
  validateExtractedText(text: string, documentId: string): void {
    // Minimum length check
    if (text.length < 100) {
      throw new ExtractionError(
        `Extracted text is too short (${text.length} characters). Minimum 100 characters required.`,
        'UNSUPPORTED_CONTENT',
        documentId,
        false
      );
    }

    // Maximum length check (10MB)
    const maxLength = 10 * 1024 * 1024;
    if (text.length > maxLength) {
      throw new ExtractionError(
        `Extracted text is too large (${text.length} characters). Maximum ${maxLength} characters allowed.`,
        'UNSUPPORTED_CONTENT',
        documentId,
        false
      );
    }

    // Check for mostly binary/garbled content
    const printableChars = text.replace(/[^\x20-\x7E\n\r\t]/g, '').length;
    const printableRatio = printableChars / text.length;
    
    if (printableRatio < 0.7) {
      throw new ExtractionError(
        'Extracted text contains mostly non-printable characters. File may be binary or corrupted.',
        'CORRUPT_FILE',
        documentId,
        false
      );
    }
  }
}

// Export singleton instance
export const textExtractor = new TextExtractor();
```

**Explanation:**
- **Multi-Format Support:** Handles PDF, DOCX, HTML, TXT, MD, RTF
- **Error Classification:** Different error types for different failure modes
- **Text Cleaning:** Normalizes line endings, removes excessive whitespace
- **Validation:** Checks minimum/maximum length, content quality
- **Encoding Handling:** Tries multiple encodings for plain text files

**Verification:**
1. File compiles with no TypeScript errors
2. All imports resolve correctly (pdf-parse, mammoth, html-to-text)


## STEP 2: Create Document Processor

**DIRECTIVE:** You shall create an orchestrator service that manages the complete document processing workflow: fetching from storage, extracting text, updating database.

**Instructions:**
1. Create file: `src/lib/file-processing/document-processor.ts`
2. Copy the complete code below
3. Save and verify no TypeScript errors

**File:** `src/lib/file-processing/document-processor.ts`

```typescript
import { supabase } from '../supabase';
import { textExtractor, ExtractionError } from './text-extractor';
import { SupportedFileType } from '../types/upload';

/**
 * Document Processor
 * 
 * Orchestrates the complete document processing workflow:
 * 1. Fetch document record from database
 * 2. Download file from Supabase Storage
 * 3. Extract text using TextExtractor
 * 4. Update database with extracted content
 * 5. Handle errors and update status
 */
export class DocumentProcessor {
  /**
   * Process a document: extract text and update database
   * @param documentId - UUID of document to process
   * @returns Success status and extracted text length
   */
  async processDocument(documentId: string): Promise<{ 
    success: boolean; 
    textLength?: number;
    error?: string;
  }> {
    console.log(`[DocumentProcessor] Starting processing for document: ${documentId}`);
    
    try {
      // ================================================
      // STEP 1: Fetch Document Record
      // ================================================
      console.log(`[DocumentProcessor] Fetching document record...`);
      
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (fetchError || !document) {
        throw new Error(`Failed to fetch document: ${fetchError?.message || 'Not found'}`);
      }

      // Check if already processed
      if (document.status === 'completed') {
        console.log(`[DocumentProcessor] Document already processed, skipping`);
        return { success: true, textLength: document.content?.length || 0 };
      }

      // Validate required fields
      if (!document.file_path) {
        throw new Error('Document has no file_path');
      }

      if (!document.source_type) {
        throw new Error('Document has no source_type');
      }

      // ================================================
      // STEP 2: Update Status to Processing
      // ================================================
      console.log(`[DocumentProcessor] Updating status to 'processing'...`);
      
      await supabase
        .from('documents')
        .update({
          status: 'processing',
          processing_progress: 10,
          processing_started_at: new Date().toISOString(),
          processing_error: null
        })
        .eq('id', documentId);

      // ================================================
      // STEP 3: Download File from Storage
      // ================================================
      console.log(`[DocumentProcessor] Downloading file from storage: ${document.file_path}`);
      
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (downloadError || !fileData) {
        throw new Error(`Failed to download file: ${downloadError?.message || 'File not found'}`);
      }

      // Convert Blob to Buffer
      const arrayBuffer = await fileData.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      console.log(`[DocumentProcessor] File downloaded: ${buffer.length} bytes`);

      // Update progress
      await this.updateProgress(documentId, 30);

      // ================================================
      // STEP 4: Extract Text
      // ================================================
      console.log(`[DocumentProcessor] Extracting text from ${document.source_type} file...`);
      
      const extractedText = await textExtractor.extractText(
        buffer,
        document.source_type as SupportedFileType,
        documentId
      );

      console.log(`[DocumentProcessor] Text extracted: ${extractedText.length} characters`);

      // Update progress
      await this.updateProgress(documentId, 70);

      // ================================================
      // STEP 5: Validate Extracted Text
      // ================================================
      textExtractor.validateExtractedText(extractedText, documentId);

      // Update progress
      await this.updateProgress(documentId, 85);

      // ================================================
      // STEP 6: Update Database with Extracted Content
      // ================================================
      console.log(`[DocumentProcessor] Updating database with extracted content...`);
      
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          content: extractedText,
          status: 'completed',
          processing_progress: 100,
          processing_completed_at: new Date().toISOString(),
          processing_error: null
        })
        .eq('id', documentId);

      if (updateError) {
        throw new Error(`Failed to update document: ${updateError.message}`);
      }

      console.log(`[DocumentProcessor] Processing completed successfully for ${documentId}`);
      
      return { 
        success: true, 
        textLength: extractedText.length 
      };

    } catch (error) {
      // ================================================
      // ERROR HANDLING
      // ================================================
      console.error(`[DocumentProcessor] Processing failed for ${documentId}:`, error);
      
      let errorMessage: string;
      let recoverable = true;

      if (error instanceof ExtractionError) {
        errorMessage = error.message;
        recoverable = error.recoverable;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Unknown error during processing';
      }

      // Update database with error status
      await supabase
        .from('documents')
        .update({
          status: 'error',
          processing_progress: 0,
          processing_error: errorMessage,
          processing_completed_at: new Date().toISOString()
        })
        .eq('id', documentId);

      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }

  /**
   * Update processing progress in database
   * @param documentId - Document UUID
   * @param progress - Progress percentage (0-100)
   */
  private async updateProgress(documentId: string, progress: number): Promise<void> {
    await supabase
      .from('documents')
      .update({ processing_progress: progress })
      .eq('id', documentId);
  }

  /**
   * Retry processing for a document in error state
   * @param documentId - Document UUID
   * @returns Processing result
   */
  async retryProcessing(documentId: string): Promise<{ 
    success: boolean; 
    textLength?: number;
    error?: string;
  }> {
    console.log(`[DocumentProcessor] Retrying processing for document: ${documentId}`);
    
    // Reset status to uploaded
    await supabase
      .from('documents')
      .update({
        status: 'uploaded',
        processing_progress: 0,
        processing_error: null,
        processing_started_at: null,
        processing_completed_at: null
      })
      .eq('id', documentId);

    // Process again
    return this.processDocument(documentId);
  }
}

// Export singleton instance
export const documentProcessor = new DocumentProcessor();
```

**Explanation:**
- **Workflow Orchestration:** Manages entire processing pipeline
- **Progress Tracking:** Updates database with progress percentage
- **Error Recovery:** Stores error messages, supports retry
- **Logging:** Console logs for debugging and monitoring
- **Database Updates:** Tracks processing_started_at, processing_completed_at timestamps

**Verification:**
1. File compiles with no TypeScript errors
2. Imports resolve correctly



## STEP 3: Create Processing API Endpoint

**DIRECTIVE:** You shall create the API endpoint that triggers document processing. This endpoint is called by the upload API after a file is uploaded.

**Instructions:**
1. Create directory: `src/app/api/documents/process/`
2. Create file: `src/app/api/documents/process/route.ts`
3. Copy the complete code below
4. Save and verify no TypeScript errors

**File:** `src/app/api/documents/process/route.ts`

```typescript
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
```

**Explanation:**
- **POST Method:** Triggers new processing
- **PUT Method:** Retries failed processing
- **Authentication:** Verifies user owns the document
- **Logging:** Detailed console logs for debugging
- **Error Handling:** Proper HTTP status codes and error messages
- **Long Timeout:** 5-minute maxDuration for large files

**Verification:**
1. File compiles with no TypeScript errors
2. Endpoint will be available at: `POST /api/documents/process`


## STEP 4: Test Text Extraction

**DIRECTIVE:** You shall test the complete text extraction workflow to verify all components work together.

**Manual Testing Steps:**

### Test 1: Upload and Process PDF

1. **Upload a PDF file:**
   ```bash
   # Get auth token first (sign in via UI and grab token from browser DevTools)
   curl -X POST http://localhost:3000/api/documents/upload \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@test.pdf" \
     -F "title=Test PDF"
   ```

2. **Check database:**
   - Open Supabase Dashboard → Table Editor → documents
   - Find the newly created document
   - Verify `status` changed from 'uploaded' → 'processing' → 'completed'
   - Verify `content` field is populated with extracted text
   - Verify `processing_progress` = 100
   - Verify `processing_completed_at` has timestamp

3. **Check console logs:**
   - Look for `[DocumentProcessor]` logs
   - Verify processing steps completed without errors

### Test 2: Upload and Process DOCX

1. **Upload a DOCX file:**
   ```bash
   curl -X POST http://localhost:3000/api/documents/upload \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@test.docx" \
     -F "title=Test DOCX"
   ```

2. **Verify extraction:**
   - Check database `content` field has extracted text
   - Verify `status` = 'completed'

### Test 3: Upload and Process HTML

1. **Upload an HTML file:**
   ```bash
   curl -X POST http://localhost:3000/api/documents/upload \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@test.html" \
     -F "title=Test HTML"
   ```

2. **Verify extraction:**
   - Check `content` field has plain text (HTML tags removed)
   - Verify scripts and styles were stripped

### Test 4: Upload and Process TXT

1. **Upload a TXT file:**
   ```bash
   curl -X POST http://localhost:3000/api/documents/upload \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@test.txt" \
     -F "title=Test TXT"
   ```

2. **Verify extraction:**
   - Check `content` field matches original text
   - Verify line endings normalized

### Test 5: Error Handling - Empty File

1. **Create empty file:**
   ```bash
   touch empty.txt
   curl -X POST http://localhost:3000/api/documents/upload \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@empty.txt" \
     -F "title=Empty File"
   ```

2. **Verify error handling:**
   - Check database `status` = 'error'
   - Check `processing_error` contains meaningful message
   - Verify no crash or unhandled exception

### Test 6: Manual Retry

1. **Find a document in error state** (from Test 5)

2. **Trigger retry:**
   ```bash
   curl -X PUT http://localhost:3000/api/documents/process \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"documentId":"uuid-from-database"}'
   ```

3. **Verify retry attempted:**
   - Check console logs for retry messages
   - If file still empty, should error again (expected)




## PROMPT 3 COMPLETION CHECKLIST

Before considering the upload module complete, verify all items below:

### Components Created
- [ ] Text Extractor Service: `src/lib/file-processing/text-extractor.ts`
- [ ] Document Processor: `src/lib/file-processing/document-processor.ts`
- [ ] Processing API Endpoint: `src/app/api/documents/process/route.ts`

### Build Verification
- [ ] Run `npm run build` - no TypeScript errors
- [ ] All imports resolve correctly
- [ ] No console errors when starting dev server

### Functional Testing
- [ ] Upload a PDF file via UI
- [ ] Wait 5-10 seconds and refresh Supabase documents table
- [ ] Verify `content` field populated with extracted text
- [ ] Verify `status` = 'completed'
- [ ] Verify `processing_progress` = 100
- [ ] Verify `processing_completed_at` has timestamp

- [ ] Upload a DOCX file
- [ ] Verify text extracted successfully

- [ ] Upload an HTML file
- [ ] Verify text extracted (HTML tags removed)

- [ ] Upload a TXT file
- [ ] Verify content matches original

- [ ] Upload a Markdown (.md) file
- [ ] Verify text extracted

- [ ] Upload an empty TXT file
- [ ] Verify `status` = 'error'
- [ ] Verify `processing_error` contains meaningful message

### Error Handling
- [ ] Processing errors logged to console
- [ ] Error messages user-friendly (not technical stack traces)
- [ ] Documents in error state can be identified in database
- [ ] Retry functionality works (PUT /api/documents/process)

### Integration Testing
- [ ] Upload → Extract → View workflow works end-to-end
- [ ] Multiple file uploads process sequentially without issues
- [ ] Large files (50MB+) process without timeout
- [ ] Mixed file types in batch all process correctly

### Performance
- [ ] PDF extraction completes in < 10 seconds (for 10-page PDF)
- [ ] DOCX extraction completes in < 5 seconds
- [ ] TXT extraction completes in < 2 seconds
- [ ] No memory leaks during bulk processing
- [ ] Server handles 5+ concurrent processing requests

**If all items checked:** ✅ Prompt 3 complete! Upload module is functional!

---

## What's Next

The core document upload and text extraction module is now complete. Users can:
✅ Upload files via drag-drop or file selection  
✅ Files stored securely in Supabase Storage  
✅ Text automatically extracted from PDF, DOCX, HTML, TXT, MD, RTF  
✅ Status tracking and error handling  
✅ Integration with existing dashboard

### Remaining Features (Not in Prompts 1-3)

The following features are defined in the requirements spec but not yet implemented:

1. **Status Polling UI**
   - Real-time status updates via JavaScript polling (2-second interval)
   - Status polling API endpoint
   - React hook for polling
   - Progress indicators in UI

2. **Upload Queue Management**
   - Queue table with filters and search
   - Batch operations (pause, resume, delete)
   - Priority management
   - Statistics dashboard

3. **Content Preview**
   - Preview extracted text
   - Metadata display
   - Validation results

4. **Workflow Integration**
   - Transition to categorization workflow
   - "Start Workflow" button on completed uploads
   - Workflow selector includes uploaded documents

5. **Advanced Features**
   - Metadata editing after upload
   - Bulk metadata updates
   - Document preview
   - Download original file

These features are documented in the **Turnover Document** for future implementation.

---

**END OF PROMPT 3**

