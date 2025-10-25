# Document Upload & Processing Module - Requirements Specification
**Version:** 3.0  
**Date:** October 9, 2025  
**Type:** Requirements Specification  
**Status:** Final - Ready for Implementation Spec  
**Estimated Implementation Time:** 2 weeks (10 working days)

---

## Document Control

| Attribute | Value |
|-----------|-------|
| **Project** | Bright Run LoRA Training Data Platform |
| **Module** | Document Upload & Processing Module |
| **Specification Type** | Requirements Specification (What/Why) |
| **Next Phase** | Implementation Specification (How) |
| **Primary Stakeholder** | Product Engineering |
| **Technical Owner** | Senior Software Engineer |

---

## Overall Product Summary & Value Proposition

Bright Run is a revolutionary LoRA fine-tuning training data platform that transforms unstructured business knowledge into high-quality training datasets through an intuitive 6-stage workflow. We are creating the first user-friendly solution that enables non-technical domain experts to convert their proprietary knowledge—transcripts, documents, and expertise—into thousands of semantically diverse training pairs suitable for LoRA model fine-tuning.

## Current Module Operations and Functionality Overview
The Bright Run Document "Chunks Alpha" Module categorizes individual documents and builds full dimensions to convert meaningful unstructured business knowledge into high-quality LoRA training data through an intuitive workflow designed for non-technical users, enabling small businesses to create custom AI models that think with their unique expertise and speak with their distinctive voice.

## Document Upload and Extraction Functionality Executive Summary

### Purpose

This requirements specification defines the complete functional and technical requirements for a Document Upload & Processing Module to be integrated into the Bright Run LoRA Training Data Platform. This module will enable users to upload documents (PDF, DOCX, TXT, MD, HTML) with metadata, automatically extract text content, track processing status, and seamlessly transition uploaded documents into the existing categorization workflow.

### Business Value

**Current Problem:**  
Users cannot upload their own documents into the system. The application only works with pre-existing documents manually seeded into the database. This creates a critical gap in the user workflow and prevents adoption.

**Solution Impact:**
- **User Empowerment:** Users can upload 1-100 documents at once with full batch processing
- **Workflow Completion:** Closes the gap in the document processing pipeline (Upload → Categorize → Chunk → Dimension → Export)
- **Metadata Capture:** Fixes 5 missing dimensions by capturing document version, source type, URL, date, and author
- **Production Ready:** Server-side text extraction with background job processing

**Success Metrics:**
- Upload success rate: > 98%
- Processing completion: 95% within 30 seconds
- User confusion rate: < 5%
- Time from upload to categorization: < 60 seconds

### Scope

**In Scope:**
1. Document upload interface (drag-drop, file selection, batch upload)
2. Document metadata capture (version, source type, URL, date)
3. Server-side text extraction (PDF, DOCX, HTML, MD, TXT)
4. Processing status tracking with JavaScript polling
5. Upload queue management (pause, resume, retry, delete)
6. Integration with existing workflow (dashboard → upload → categorize)
7. Error handling and retry mechanisms
8. All UI features demonstrated in wireframe prototype (`doc-module/`)

**Out of Scope:**
- OCR for scanned PDFs (future enhancement)
- Document preview/editing capabilities
- Version control system for documents
- Collaborative document management
- Third-party cloud storage integration (Google Drive, Dropbox)
- Mobile-specific upload UI (responsive web only)

### Key Decisions Finalized

**Decision #1: Status Reporting Mechanism**
- **Choice:** JavaScript Polling (2-second interval)
- **Rationale:** Vercel-compatible, simple implementation, sufficient for 2-30 second processing times
- **Alternative Rejected:** WebSockets (incompatible with Vercel serverless)

**Decision #2: Architectural Approach**
- **Choice:** Integrated Module (build within `src/` Next.js app)
- **Rationale:** Reuses 48 existing UI components, unified authentication, single deployment, seamless UX
- **Alternative Rejected:** Standalone Application (would require duplicate components, complex auth, separate deployment)

**Decision #3: Text Extraction Strategy**
- **Choice:** Server-side with Background Jobs
- **Rationale:** Production-ready, secure, handles all file types, centralized error handling
- **Alternative Rejected:** Client-side processing (limited browser APIs, security concerns)

**Decision #4: Scope Completeness**
- **Choice:** Include both metadata capture AND text extraction in single specification
- **Rationale:** Both are required for functional upload module, implemented together in 2 weeks

**Decision #5: Wireframe Functionality**
- **Choice:** All UI features from `doc-module/` wireframe must be functional
- **Rationale:** Wireframe represents validated UX design that solves user needs

---

## Business Requirements

### BR-1: User Problem Statement

**Current State:**
- Users have valuable documents (PDFs, Word docs, transcripts, notes) containing business knowledge
- No way to get these documents into the system
- Must rely on administrator to manually seed documents into database
- Creates bottleneck and prevents self-service workflow

**Desired State:**
- Users can independently upload their own documents
- System automatically processes documents and makes them ready for categorization
- Users see progress and know when documents are ready
- Seamless integration with existing workflow

### BR-2: Business Objectives

1. **Enable Self-Service Document Management**
   - Users upload documents without administrator intervention
   - Support for common business document formats
   - Batch upload capability for efficiency

2. **Complete the Workflow Pipeline**
   - Close the gap: Dashboard → **Upload** → Categorize → Chunk → Dimension → Export
   - Natural workflow progression without context switching
   - Unified user experience across all stages

3. **Improve Data Quality**
   - Capture document metadata at upload time (version, date, source)
   - Fix 5 missing dimensions currently showing as NULL
   - Enable better provenance tracking

4. **Production-Ready Processing**
   - Reliable text extraction from multiple file formats
   - Error handling and retry capabilities
   - Status tracking for transparency

### BR-3: User Personas

**Primary User: Domain Expert / Small Business Owner**
- Age: 30-60
- Technical Skill: Low to medium
- Goal: Convert proprietary knowledge documents into training data
- Pain Points: 
  - Not technical enough for command-line tools
  - Has valuable PDFs/Word docs with no way to process them
  - Needs simple, guided workflow
- Success Criteria: Can upload document and see it appear in categorization workflow within 1 minute

**Secondary User: Training Data Curator**
- Age: 25-45
- Technical Skill: Medium to high
- Goal: Batch process multiple documents efficiently
- Pain Points:
  - Manual document seeding is time-consuming
  - No visibility into processing status
  - Cannot retry failed uploads without database access
- Success Criteria: Can upload 50+ documents, monitor progress, handle errors independently

### BR-4: Business Rules

1. **Authentication Required**
   - Only authenticated users can upload documents
   - Documents are associated with uploader's user ID
   - Users can only see/manage their own documents

2. **File Size Limits**
   - Maximum file size: 100MB per file
   - Maximum batch size: 100 files per upload session
   - Prevents abuse and ensures reasonable processing times

3. **Supported File Types**
   - PDF (.pdf)
   - Microsoft Word (.docx, .doc)
   - Plain Text (.txt)
   - Markdown (.md)
   - Rich Text (.rtf)
   - HTML (.html, .htm)
   - Unsupported files are rejected with clear error message

4. **Processing Time Limits**
   - Maximum processing time per document: 5 minutes
   - Timeout triggers error state with option to retry
   - Prevents hung processes from blocking queue

5. **Metadata Requirements**
   - Document title: Required (auto-filled from filename, user can edit)
   - Source type: Required (auto-detected from file extension)
   - Version, URL, Date: Optional (user can provide)
   - Author: Automatic (captured from authenticated user)

---

## Functional Requirements

### FR-1: Document Upload Interface

#### FR-1.1: Upload Page Access
- **Requirement:** Users must be able to navigate to dedicated upload page from dashboard
- **UI Element:** "Upload Documents" button prominently displayed in dashboard header
- **Navigation:** Button links to `/upload` route within main application
- **State:** Button disabled if user not authenticated or already at capacity (100 documents)

#### FR-1.2: Drag-and-Drop Upload Zone
- **Requirement:** Users must be able to drag files from file system and drop them into upload zone
- **Visual Feedback:** 
  - Drag-over state: Upload zone highlights with blue border and background tint
  - Drop state: Files immediately show in upload queue
  - Error state: Red highlight if files rejected (wrong type, too large)
- **Behavior:**
  - Accept multiple files in single drag-drop action
  - Validate file types and sizes on drop
  - Show immediate feedback (success/error) for each file
- **Accessibility:** Keyboard navigation support, screen reader compatible

#### FR-1.3: File Selection Button
- **Requirement:** Users must be able to click "Select Files" button to open system file picker
- **Behavior:**
  - Opens native OS file dialog
  - Multiple file selection enabled
  - File type filter applied (shows only supported types)
  - Same validation as drag-drop after selection
- **Button States:** Normal, Hover, Active, Disabled (when at capacity)

#### FR-1.4: Upload Capacity Indicators
- **Requirement:** Users must see current capacity status
- **Display Elements:**
  - Total files in queue: "X files" (0-100)
  - Capacity warning: Shows when approaching limit (>75 files)
  - Capacity error: Shows when at limit (100 files) with clear message
- **Visual Design:** Progress indicator or badge showing count

#### FR-1.5: Supported Formats Display
- **Requirement:** Users must see which file formats are supported
- **Display:** 
  - Badge list of supported formats (PDF, DOCX, TXT, MD, RTF)
  - Maximum file size clearly stated (100MB per file)
  - Maximum batch size clearly stated (100 files per batch)
- **Placement:** Below upload zone, always visible

### FR-2: Metadata Capture

#### FR-2.1: Document Title
- **Requirement:** Each uploaded document must have a title
- **Default Value:** Filename without extension (e.g., "report.pdf" → "report")
- **User Action:** Can edit title inline in upload queue
- **Validation:** 
  - Required field (cannot be empty)
  - Maximum 255 characters
  - No special characters that break file systems

#### FR-2.2: Document Version
- **Requirement:** Users can optionally specify document version
- **Format:** Free text field accepting semver, dates, or custom labels
- **Examples:** "v1.3.0", "2024-Q3", "Draft", "Final"
- **Default:** NULL (no version specified)
- **Usage:** Displayed in document metadata, used for dimension generation

#### FR-2.3: Source URL
- **Requirement:** Users can optionally specify original source URL or path
- **Purpose:** Provenance tracking, link back to original document
- **Validation:** 
  - Must be valid URL format if provided
  - Can be file path (e.g., "C:\Documents\report.pdf")
  - Maximum 500 characters
- **Default:** NULL

#### FR-2.4: Document Date
- **Requirement:** Users can optionally specify original document creation/publication date
- **UI Element:** Date picker component
- **Format:** ISO 8601 date (YYYY-MM-DD)
- **Validation:** Cannot be future date
- **Default:** NULL (not upload date, which is automatically captured)

#### FR-2.5: Source Type (Auto-Detected)
- **Requirement:** System must automatically detect and assign source type from file extension
- **Mapping:**
  - .pdf → "pdf"
  - .docx, .doc → "docx"
  - .txt → "txt"
  - .md → "markdown"
  - .rtf → "rtf"
  - .html, .htm → "html"
  - Unknown → "other"
- **User Visibility:** Displayed as badge in upload queue
- **Editability:** Not user-editable (system-assigned)

#### FR-2.6: Author (Auto-Captured)
- **Requirement:** System must automatically capture author information from authenticated user
- **Data Source:** 
  - Primary: user_profiles.full_name
  - Fallback: user_profiles.email
  - Last resort: user.id (UUID)
- **User Visibility:** Displayed in document list, not editable during upload
- **Usage:** Resolves to human-readable name for dimension generation

### FR-3: Upload Queue Management

#### FR-3.1: Queue Display
- **Requirement:** All uploaded files must be displayed in organized queue view
- **Information Per File:**
  - Filename with icon (based on file type)
  - File size (formatted: KB, MB)
  - Status badge (Queued, Processing, Completed, Error, Paused)
  - Progress indicator (0-100%)
  - Upload timestamp ("Xm ago", "Xh ago")
  - Action buttons (contextual based on status)
- **View Options:**
  - Table view (default): Rows with columns
  - Card view (optional): Grid of cards
- **Sorting:** By upload time (newest first), status, name, size

#### FR-3.2: Queue Statistics Dashboard
- **Requirement:** Users must see aggregate statistics for upload batch
- **Metrics Displayed:**
  - **Total Files:** Count of all files in queue
  - **Queued:** Files waiting to process
  - **Processing:** Files currently being processed
  - **Completed:** Successfully processed files
  - **Errors:** Failed files needing attention
- **Visual Design:** Card-based dashboard with color-coded metrics
- **Update Frequency:** Real-time as statuses change

#### FR-3.3: File Status Management
- **Requirement:** Users must be able to control individual file processing
- **Actions by Status:**
  - **Queued Files:**
    - Pause: Prevent from starting
    - Delete: Remove from queue
    - Change Priority: Move up/down in queue
  - **Processing Files:**
    - Pause: Stop current processing
    - Cannot delete while processing
  - **Paused Files:**
    - Resume: Continue processing
    - Delete: Remove from queue
  - **Completed Files:**
    - View: Navigate to document
    - Delete: Remove from queue (keeps in database)
  - **Error Files:**
    - Retry: Attempt processing again
    - Delete: Remove from queue
    - View Error: See error details

#### FR-3.4: Batch Operations
- **Requirement:** Users must be able to perform actions on multiple files simultaneously
- **Selection Mechanism:**
  - Checkbox for each file
  - "Select All" checkbox in header
  - Multi-select with Shift+click
- **Batch Actions:**
  - Set Priority (High, Medium, Low) for selected files
  - Pause selected files
  - Resume selected paused files
  - Retry selected failed files
  - Delete selected files
- **Confirmation:** Destructive actions (delete) require confirmation dialog

#### FR-3.5: Queue Filtering and Search
- **Requirement:** Users must be able to find specific files in large queues
- **Filters:**
  - Status filter: All, Queued, Processing, Completed, Error, Paused
  - File type filter: All, PDF, DOCX, TXT, etc.
  - Date range filter: Today, Last 7 days, Last 30 days, Custom
- **Search:** Real-time search on filename
- **UI:** Dropdown filters and search box above queue table

### FR-4: Document Processing

#### FR-4.1: Text Extraction Service
- **Requirement:** System must automatically extract text content from uploaded files
- **Supported Formats:**
  - **PDF:** Extract text from text-based PDFs (not scanned images)
  - **DOCX:** Extract text, preserve paragraph structure
  - **TXT:** Direct read, handle various encodings (UTF-8, ASCII)
  - **Markdown:** Parse markdown, preserve structure
  - **HTML:** Extract text, remove tags and scripts
  - **RTF:** Extract plain text content
- **Processing Location:** Server-side (not client browser)
- **Technology:** 
  - PDF: pdf-parse library
  - DOCX: mammoth library
  - HTML: html-to-text library
  - TXT/MD: Direct file read with encoding detection
- **Output:** Plain text string stored in documents.content field

#### FR-4.2: Processing Pipeline
- **Requirement:** System must process uploaded documents through defined stages
- **Pipeline Stages:**
  1. **Upload:** File uploaded to Supabase Storage
  2. **Validation:** File type and size checked
  3. **Queued:** Added to processing queue (status: 'uploaded')
  4. **Processing:** Text extraction in progress (status: 'processing')
  5. **Completed:** Text extracted successfully (status: 'completed')
  6. **Error:** Processing failed (status: 'error')
- **State Transitions:**
  ```
  uploaded → processing → completed
     ↓            ↓
   error ← ← ← ← ← ← (can happen at any stage)
  ```
- **Automatic Progression:** User does not manually trigger transitions

#### FR-4.3: Background Job Processing
- **Requirement:** Text extraction must run as background job (non-blocking)
- **Implementation:**
  - Upload completes immediately (returns document ID)
  - Processing triggered asynchronously
  - User can navigate away, processing continues
  - Status updates via polling (no WebSockets required)
- **Concurrency:** Support multiple simultaneous extractions
- **Queue Management:** Process files in order of upload (FIFO) within same user

#### FR-4.4: Progress Tracking
- **Requirement:** Users must see progress of text extraction
- **Progress Indicators:**
  - Percentage complete (0-100%)
  - Estimated time remaining (when calculable)
  - Current stage description ("Extracting text...", "Validating...", "Complete")
- **Update Mechanism:** JavaScript polling every 2 seconds
- **Stop Conditions:** Polling stops when status reaches 'completed' or 'error'

#### FR-4.5: Error Handling
- **Requirement:** System must gracefully handle extraction failures
- **Error Categories:**
  - **Corrupt File:** File cannot be opened or parsed
  - **Unsupported Content:** File type unsupported or contains only images
  - **Timeout:** Processing exceeds 5-minute limit
  - **Server Error:** Internal processing error
- **User Experience:**
  - Error status displayed in queue
  - Error message shown (user-friendly, not technical stack traces)
  - Retry button offered
  - Option to delete failed file
- **Logging:** All errors logged to database for debugging

#### FR-4.6: Content Validation
- **Requirement:** Extracted text must meet minimum quality standards
- **Validation Rules:**
  - Minimum length: 100 characters (configurable)
  - Maximum length: 10MB of text (prevent abuse)
  - Content exists: Non-empty after extraction
- **Failure Handling:** If validation fails, treat as extraction error

### FR-5: Status Reporting and Monitoring

#### FR-5.1: Real-Time Status Updates
- **Requirement:** UI must reflect current processing status without page refresh
- **Update Mechanism:** 
  - JavaScript polling to `/api/documents/status` endpoint
  - Poll interval: 2 seconds for active processes
  - Batch polling: Single request for multiple documents
- **Status Fields Updated:**
  - status: Current state (uploaded, processing, completed, error)
  - processing_progress: Percentage (0-100)
  - error_message: If status is error
  - processing_started_at: Timestamp when processing began
  - processing_completed_at: Timestamp when processing finished

#### FR-5.2: Status Endpoint Requirements
- **Requirement:** API endpoint must provide current status for documents
- **Endpoint:** GET /api/documents/status
- **Query Parameters:**
  - `id` (string): Single document ID
  - `ids` (string): Comma-separated document IDs (for batch query)
- **Response Format:**
  ```json
  {
    "documents": [
      {
        "id": "uuid",
        "status": "processing",
        "progress": 45,
        "error": null,
        "processingStartedAt": "ISO timestamp",
        "estimatedSecondsRemaining": 12
      }
    ]
  }
  ```
- **Performance:** Response time < 200ms for up to 100 documents

#### FR-5.3: Polling Optimization
- **Requirement:** Status polling must be efficient and battery-friendly
- **Optimizations:**
  - Batch requests: Poll multiple documents in single API call
  - Stop conditions: Stop polling when completed or error
  - Tab visibility: Pause polling when browser tab inactive
  - Backoff: Increase interval after consecutive errors
- **Battery Impact:** < 2% battery drain per hour on mobile devices

#### FR-5.4: Status Persistence
- **Requirement:** Processing status must survive page refresh
- **Mechanism:**
  - Status stored in database (not just in-memory)
  - On page load, check database for any documents in processing state
  - Resume polling for in-progress documents
- **User Experience:** User can close browser and return later to see completed status

### FR-6: Integration with Existing Workflow

#### FR-6.1: Dashboard Integration
- **Requirement:** Upload functionality must be accessible from main dashboard
- **Integration Points:**
  - "Upload Documents" button in dashboard header (primary CTA)
  - Recently uploaded documents appear in document list immediately
  - Upload count shown in dashboard statistics
- **Navigation:** Single click from dashboard to upload page, single click back

#### FR-6.2: Workflow Transition
- **Requirement:** Completed uploads must seamlessly flow into categorization workflow
- **Transition Mechanism:**
  - When document processing completes, "Start Categorization" button appears
  - Button navigates to `/workflow/{documentId}/stage1`
  - Document automatically loaded in workflow context
- **Bulk Transition:** From upload queue, user can select completed documents and bulk-start workflow

#### FR-6.3: Document List Integration
- **Requirement:** Uploaded documents must appear in main document selector
- **Display:**
  - All user's documents listed (uploaded and pre-existing)
  - Upload timestamp and status shown
  - Filter by upload date available
- **Status Indication:** Documents in processing state clearly marked, cannot be selected for workflow

#### FR-6.4: State Management
- **Requirement:** Upload state must integrate with existing Zustand workflow store
- **Implementation:**
  - Extend useWorkflowStore with upload-related state
  - Share authentication context
  - Share document selection state
- **Persistence:** Upload queue persists in local storage (browser refresh safe)

### FR-7: User Experience Requirements

#### FR-7.1: Responsive Design
- **Requirement:** Upload interface must work on desktop, tablet, and mobile
- **Breakpoints:**
  - Mobile: < 768px (stack layout, single column queue)
  - Tablet: 768-1024px (2-column layout where appropriate)
  - Desktop: > 1024px (full feature set, multi-column)
- **Touch Support:** All interactions work with touch (no hover-only UI)

#### FR-7.2: Loading States
- **Requirement:** All async operations must show loading indicators
- **Contexts:**
  - File upload in progress: Upload progress bar
  - Text extraction: Processing spinner with percentage
  - Status check: Small loading indicator in status badge
- **No Blank States:** Never show empty screen while loading

#### FR-7.3: Empty States
- **Requirement:** Empty queue must show helpful guidance
- **Display:**
  - Large upload icon/illustration
  - "No documents uploaded yet" message
  - "Click to upload or drag files here" instruction
  - Link to help documentation
- **Design:** Friendly, encouraging tone

#### FR-7.4: Error States
- **Requirement:** Errors must be user-friendly and actionable
- **Error Display:**
  - Clear error message (avoid technical jargon)
  - Specific action to resolve (retry, contact support, etc.)
  - Error code (for support reference)
- **Examples:**
  - "File too large" → "This file exceeds 100MB. Please compress or split the file."
  - "Extraction failed" → "Unable to extract text. The file may be corrupt. Try uploading again."

#### FR-7.5: Success Feedback
- **Requirement:** Successful operations must provide positive feedback
- **Mechanisms:**
  - Toast notifications for upload success
  - Green checkmark on completed processing
  - Success summary: "10 documents processed successfully"
- **Timing:** Feedback within 300ms of action completion

#### FR-7.6: Keyboard Navigation
- **Requirement:** All functionality must be accessible via keyboard
- **Keyboard Shortcuts:**
  - Tab: Navigate between elements
  - Enter: Activate buttons
  - Space: Select checkboxes
  - Escape: Close dialogs
  - Arrow keys: Navigate queue list
- **Focus Indicators:** Clear visual focus state for all interactive elements

### FR-8: Data Management

#### FR-8.1: Document Storage
- **Requirement:** Original files must be stored securely and retrievably
- **Storage Location:** Supabase Storage bucket ('documents')
- **Path Structure:** `{userId}/{timestamp}-{filename}`
- **Retention:** Files retained indefinitely (user can delete)
- **Access Control:** Only document owner can download original file

#### FR-8.2: Content Storage
- **Requirement:** Extracted text content must be stored in database
- **Table:** documents.content (TEXT field, unlimited length)
- **Encoding:** UTF-8
- **Preprocessing:** 
  - Normalize line endings (CRLF → LF)
  - Remove excessive whitespace (preserve paragraph structure)
  - No HTML stripping (already done during extraction)

#### FR-8.3: Metadata Storage
- **Requirement:** All document metadata must be captured in database
- **Database Columns:**
  - `doc_version` (TEXT): User-provided version
  - `source_type` (TEXT): Auto-detected file type
  - `source_url` (TEXT): User-provided source URL
  - `doc_date` (TIMESTAMPTZ): User-provided document date
  - `processing_progress` (INTEGER): 0-100 percentage
  - `processing_error` (TEXT): Error message if failed
  - `processing_started_at` (TIMESTAMPTZ): When processing began
  - `processing_completed_at` (TIMESTAMPTZ): When processing finished

#### FR-8.4: Data Validation
- **Requirement:** All stored data must be validated before insertion
- **Validation Rules:**
  - Title: 1-255 characters, no null bytes
  - Version: 0-50 characters if provided
  - Source URL: Valid URL format if provided, max 500 characters
  - Document date: Valid date, not in future
  - File path: Valid storage path format

---

## Technical Requirements

### TR-1: Technology Stack

#### TR-1.1: Frontend Framework
- **Requirement:** Upload module must use Next.js 14 App Router
- **Rationale:** Consistency with existing application
- **Components:** React Server Components and Client Components as appropriate
- **Routing:** App Router file-based routing

#### TR-1.2: UI Component Library
- **Requirement:** Must use existing Radix UI components
- **Available Components:** 48 pre-built components in `src/components/ui/`
- **Consistency:** Match existing application styling and behavior
- **No Duplication:** Do not create duplicate components

#### TR-1.3: State Management
- **Requirement:** Use Zustand for client-side state
- **Integration:** Extend existing useWorkflowStore
- **State Scope:** 
  - Upload queue (in-memory)
  - Processing status (synced with database)
  - User preferences (local storage)

#### TR-1.4: Styling
- **Requirement:** Use Tailwind CSS classes
- **Theme:** Follow existing design tokens
- **Responsive:** Mobile-first approach
- **Dark Mode:** Support existing dark mode toggle

#### TR-1.5: Backend Runtime
- **Requirement:** API routes must be Vercel Edge Functions compatible
- **Constraints:**
  - Stateless (no in-memory session storage)
  - Fast cold starts (< 500ms)
  - Environment variables for secrets
- **Database:** Supabase PostgreSQL with Supabase client library

### TR-2: Text Extraction Technology

#### TR-2.1: NPM Dependencies
- **Requirement:** Add three new npm packages for text extraction
- **Packages:**
  1. **pdf-parse** (^1.1.1): PDF text extraction
  2. **mammoth** (^1.6.0): DOCX text extraction
  3. **html-to-text** (^9.0.5): HTML text extraction
- **Bundle Impact:** ~2MB total (acceptable for server-side)
- **License:** All MIT licensed (no license conflicts)

#### TR-2.2: Text Extractor Service
- **Requirement:** Create reusable text extraction service
- **Location:** `src/lib/file-processing/text-extractor.ts`
- **Interface:**
  ```typescript
  interface TextExtractor {
    extractText(filePath: string, sourceType: string): Promise<string>
    extractFromPDF(blob: Blob): Promise<string>
    extractFromDOCX(blob: Blob): Promise<string>
    extractFromHTML(blob: Blob): Promise<string>
    extractFromPlainText(blob: Blob): Promise<string>
  }
  ```
- **Error Handling:** Throw specific error types for different failure modes

#### TR-2.3: Document Processor
- **Requirement:** Orchestrate end-to-end document processing
- **Location:** `src/lib/file-processing/document-processor.ts`
- **Responsibilities:**
  - Fetch file from Supabase Storage
  - Call TextExtractor with appropriate method
  - Update database with extracted content
  - Handle errors and update status
  - Generate document summary (optional enhancement)

### TR-3: API Endpoints

#### TR-3.1: Upload Endpoint
- **Route:** POST /api/documents/upload
- **Purpose:** Accept file uploads and initiate processing
- **Request:**
  - Method: POST
  - Body: FormData with file and metadata
  - Headers: Authentication token
- **Response:**
  ```json
  {
    "success": true,
    "document": {
      "id": "uuid",
      "title": "filename",
      "status": "uploaded"
    }
  }
  ```
- **Security:** Validate file type, size, and user authorization

#### TR-3.2: Processing Endpoint
- **Route:** POST /api/documents/process
- **Purpose:** Trigger text extraction for uploaded document
- **Request:**
  ```json
  {
    "documentId": "uuid"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Processing started"
  }
  ```
- **Implementation:** Trigger background job, return immediately

#### TR-3.3: Status Endpoint
- **Route:** GET /api/documents/status
- **Purpose:** Check processing status for one or more documents
- **Query Parameters:**
  - `id`: Single document ID
  - `ids`: Comma-separated document IDs (batch query)
- **Response:** See FR-5.2
- **Caching:** No caching for in-progress documents
- **Rate Limiting:** 100 requests per minute per user

#### TR-3.4: Metadata Update Endpoint
- **Route:** PATCH /api/documents/:id
- **Purpose:** Update document metadata after upload
- **Request:**
  ```json
  {
    "title": "Updated title",
    "doc_version": "v2.0",
    "doc_date": "2024-01-15"
  }
  ```
- **Validation:** Only allow updates to specific fields, not file_path or content

### TR-4: Database Requirements

#### TR-4.1: Schema Updates
- **Requirement:** Add processing-related columns to documents table
- **New Columns:**
  ```sql
  ALTER TABLE documents 
    ADD COLUMN processing_progress INTEGER DEFAULT 0,
    ADD COLUMN processing_error TEXT,
    ADD COLUMN processing_started_at TIMESTAMPTZ,
    ADD COLUMN processing_completed_at TIMESTAMPTZ;
  ```
- **Indexes:**
  ```sql
  CREATE INDEX idx_documents_status_updated 
    ON documents(status, updated_at) 
    WHERE status IN ('uploaded', 'processing');
  ```

#### TR-4.2: Existing Columns
- **Requirement:** Use existing metadata columns added in previous spec
- **Columns:**
  - `doc_version` TEXT
  - `source_type` TEXT
  - `source_url` TEXT
  - `doc_date` TIMESTAMPTZ
- **Index:** `idx_documents_source_type` (already exists)

#### TR-4.3: Row Level Security
- **Requirement:** Ensure users can only access their own documents
- **Policy:**
  ```sql
  CREATE POLICY "Users can only access own documents"
    ON documents
    FOR ALL
    USING (author_id = auth.uid());
  ```
- **Verification:** Test cross-user access is blocked

### TR-5: Performance Requirements

#### TR-5.1: Upload Performance
- **Requirement:** File upload must be fast and reliable
- **Targets:**
  - Small files (< 1MB): Upload in < 2 seconds
  - Large files (50MB): Upload in < 30 seconds
  - Success rate: > 98%
- **Mechanism:** Direct upload to Supabase Storage (not through API)

#### TR-5.2: Text Extraction Performance
- **Requirement:** Text extraction must complete within reasonable time
- **Targets:**
  - PDF (10 pages): < 5 seconds
  - DOCX (20 pages): < 3 seconds
  - TXT (1MB): < 1 second
  - Timeout: 5 minutes maximum
- **Optimization:** Process files in parallel (multiple simultaneous extractions)

#### TR-5.3: UI Responsiveness
- **Requirement:** UI must remain responsive during operations
- **Targets:**
  - Page load: < 1 second
  - Button click response: < 300ms
  - Status update reflection: < 3 seconds
- **Mechanism:** Background processing, optimistic UI updates

#### TR-5.4: Polling Efficiency
- **Requirement:** Status polling must not overload server
- **Targets:**
  - Batch poll 100 documents: < 200ms response
  - Single poll: < 50ms response
  - Maximum polls per document: 150 (5 minutes at 2-second interval)
- **Optimization:** Batch queries, stop polling when done

### TR-6: Security Requirements

#### TR-6.1: Authentication
- **Requirement:** All upload operations require authentication
- **Mechanism:** Supabase Auth with JWT tokens
- **Validation:** Check token on every API request
- **Session:** Honor existing session, no separate login

#### TR-6.2: Authorization
- **Requirement:** Users can only upload and access their own documents
- **Enforcement:**
  - API layer: Check user ID matches document author
  - Database layer: Row Level Security policies
  - Storage layer: Supabase Storage policies
- **Audit:** Log all access attempts (success and failure)

#### TR-6.3: File Upload Security
- **Requirement:** Prevent malicious file uploads
- **Validations:**
  - File type whitelist (only allowed extensions)
  - File size limits (max 100MB)
  - MIME type validation (not just extension)
  - Virus scanning (future enhancement)
- **Storage:** Store files with UUID names (prevent path traversal)

#### TR-6.4: Rate Limiting
- **Requirement:** Prevent abuse through rate limiting
- **Limits:**
  - Upload: 100 files per hour per user
  - Status polling: 100 requests per minute per user
  - Processing: 10 concurrent extractions per user
- **Enforcement:** Database tracking with exponential backoff

#### TR-6.5: Data Privacy
- **Requirement:** Protect user document content
- **Measures:**
  - HTTPS only (no HTTP)
  - Encrypted at rest (Supabase default)
  - Encrypted in transit (TLS)
  - No logging of document content (only metadata)
  - GDPR-compliant deletion (cascade deletes)

### TR-7: Error Handling Requirements

#### TR-7.1: Error Categories
- **Requirement:** Define and handle specific error types
- **Categories:**
  1. **Validation Errors:** Invalid file type, size, metadata
  2. **Storage Errors:** Cannot upload to Supabase Storage
  3. **Extraction Errors:** Cannot parse file, corrupt file
  4. **Timeout Errors:** Processing exceeds time limit
  5. **Server Errors:** Unexpected internal errors
- **Handling:** Each category has specific user message and recovery action

#### TR-7.2: Error Logging
- **Requirement:** Log all errors for debugging
- **Destination:** Database table (similar to api_response_logs)
- **Information Logged:**
  - Error type and message
  - Document ID and user ID
  - File name and type
  - Stack trace (truncated)
  - Timestamp
- **Retention:** 90 days

#### TR-7.3: User Error Messages
- **Requirement:** Show user-friendly error messages
- **Principles:**
  - Non-technical language
  - Explain what went wrong
  - Suggest how to fix
  - Provide retry/cancel options
- **Example:** Instead of "ETIMEDOUT", show "Processing took too long. The file may be very large or complex. Try again or upload a simpler file."

#### TR-7.4: Retry Mechanism
- **Requirement:** Allow users to retry failed operations
- **Retryable Errors:** Timeout, server error, network error
- **Non-Retryable Errors:** Invalid file type, file too large, corrupt file
- **Retry Limit:** 3 attempts per document
- **Backoff:** 5 seconds between retries (exponential)

### TR-8: Monitoring and Observability

#### TR-8.1: Metrics
- **Requirement:** Track key metrics for monitoring
- **Metrics to Track:**
  - Upload success rate (%)
  - Average upload time (seconds)
  - Extraction success rate (%)
  - Average extraction time (seconds)
  - Error rate by type (%)
  - Queue depth (count)
- **Storage:** Database aggregation queries
- **Visualization:** Dashboard (future enhancement)

#### TR-8.2: Logging
- **Requirement:** Log important events for debugging
- **Events to Log:**
  - Document uploaded
  - Processing started
  - Processing completed
  - Processing failed (with error)
  - User actions (pause, resume, retry, delete)
- **Format:** Structured JSON logs
- **Level:** INFO for normal operations, ERROR for failures

#### TR-8.3: Alerting
- **Requirement:** Alert on critical failures (future enhancement)
- **Alert Conditions:**
  - Error rate > 10% over 10 minutes
  - Processing queue depth > 1000
  - Average processing time > 2 minutes
- **Mechanism:** Email or Slack notification
- **Scope:** Phase 2 (not MVP)

---

## Integration Requirements

### IR-1: Dashboard Integration

#### IR-1.1: Navigation
- **Requirement:** Add "Upload Documents" button to dashboard
- **Location:** Dashboard header, next to user profile
- **Design:** Primary button style (blue, prominent)
- **Icon:** Upload icon from Lucide React
- **Behavior:** Navigates to `/upload` route

#### IR-1.2: Recent Uploads Widget
- **Requirement:** Show recently uploaded documents in dashboard
- **Display:** Card or list showing last 5 uploads
- **Information:** Title, upload time, status badge
- **Action:** Click to view document or start workflow

### IR-2: Workflow Integration

#### IR-2.1: Document Selection
- **Requirement:** Uploaded documents appear in document selector
- **Filter:** Option to show only uploaded documents (vs. seed documents)
- **Status Indicator:** Show if document still processing (cannot select)
- **Sort:** Default sort by upload time (newest first)

#### IR-2.2: Workflow Initiation
- **Requirement:** User can start categorization workflow from upload page
- **Trigger:** "Start Workflow" button on completed uploads
- **Behavior:** Navigate to `/workflow/{documentId}/stage1`
- **Context:** Document automatically loaded in workflow

#### IR-2.3: Batch Workflow Start
- **Requirement:** User can start workflow for multiple documents
- **Selection:** Checkboxes to select completed documents
- **Action:** "Start Workflow for Selected" button
- **Behavior:** Queue documents for sequential workflow processing

### IR-3: Component Reuse

#### IR-3.1: UI Components
- **Requirement:** Reuse all existing UI components
- **Components to Use:**
  - Button, Card, Badge, Progress, Alert
  - Dialog, Sheet, Popover, Dropdown
  - Input, Select, Checkbox, Radio
  - Table, Tabs, Accordion
  - (Total: 48 components available)
- **No Duplication:** Do not create new button or card components

#### IR-3.2: Layout Components
- **Requirement:** Use existing page layout structure
- **Layout:** Dashboard layout with header and content area
- **Authentication:** Wrap in existing auth guard
- **Theme:** Support existing light/dark theme

### IR-4: State Management Integration

#### IR-4.1: Workflow Store Extension
- **Requirement:** Extend useWorkflowStore with upload state
- **New State:**
  ```typescript
  interface WorkflowStore {
    // Existing state...
    
    // Upload state
    uploadQueue: DocumentFile[]
    uploadProgress: Record<string, number>
    addToUploadQueue: (files: File[]) => void
    removeFromUploadQueue: (fileId: string) => void
    updateUploadProgress: (fileId: string, progress: number) => void
  }
  ```

#### IR-4.2: Auth Context Usage
- **Requirement:** Use existing useAuth hook
- **Access:** user, profile, isAuthenticated, signOut
- **No Duplication:** Do not create separate auth logic

---

## Wireframe Functionality Requirements

### WF-1: Upload Interface Features (from doc-module)

#### WF-1.1: Visual Design
- **Requirement:** Match wireframe visual design and UX
- **Elements:**
  - Large drag-drop zone with dashed border
  - Upload icon centered in drop zone
  - "Drag and drop files here" instructional text
  - "Select Files" button below instruction
  - Supported formats badges prominently displayed
- **Spacing:** Generous padding, clear visual hierarchy

#### WF-1.2: Drag-Over State
- **Requirement:** Implement drag-over visual feedback
- **Behavior:** 
  - Drop zone background changes to blue tint
  - Border changes to solid blue
  - Upload icon animates or changes color
  - "Drop files here" text appears
- **Exit:** Returns to normal state when drag leaves

#### WF-1.3: Upload Progress
- **Requirement:** Show upload progress bar
- **Display:**
  - Progress bar below drop zone
  - Percentage text (e.g., "75%")
  - "Uploading files..." status text
- **Completion:** Smooth transition to queue view when done

### WF-2: Queue Management Features (from doc-module)

#### WF-2.1: Statistics Cards
- **Requirement:** Display aggregate statistics in card grid
- **Cards:**
  1. Total Files (primary color)
  2. Queued (blue)
  3. Processing (yellow with spinner)
  4. Completed (green with checkmark)
  5. Errors (red with alert icon)
- **Layout:** 5-column grid on desktop, 2-column on mobile
- **Updates:** Real-time as statuses change

#### WF-2.2: Queue Table
- **Requirement:** Display all files in organized table
- **Columns:**
  - Checkbox (for selection)
  - File name with icon
  - Status badge with icon
  - Priority badge
  - Progress bar
  - File size
  - Upload time ("Xm ago")
  - Actions menu (three-dot icon)
- **Hover:** Row highlights on hover
- **Selection:** Checkbox state visible and interactive

#### WF-2.3: Filters and Search
- **Requirement:** Implement filtering and search UI
- **Elements:**
  - Search input with search icon
  - Status dropdown filter
  - Priority dropdown filter
  - Clear filters button
- **Layout:** Horizontal row above table
- **Behavior:** Real-time filtering (no submit button)

#### WF-2.4: Batch Operations Bar
- **Requirement:** Show batch operations when items selected
- **Display:**
  - Appears as sticky bar above table
  - Shows count: "X files selected"
  - Action buttons: Set Priority, Pause, Resume, Retry, Delete
  - "Clear Selection" button
- **Visibility:** Only visible when >0 items selected

#### WF-2.5: Actions Menu
- **Requirement:** Per-file actions in dropdown menu
- **Trigger:** Three-dot icon button in row
- **Menu Items (contextual based on status):**
  - Preview
  - Pause / Resume
  - Retry (if error)
  - Change Priority
  - Delete
- **Design:** Dropdown menu with icons and labels

### WF-3: Content Preview Features (from doc-module)

#### WF-3.1: Preview Panel
- **Requirement:** Show document content preview
- **Trigger:** Click file name or "Preview" action
- **Display:**
  - Side panel slides in from right (or modal on mobile)
  - Document title at top
  - Metadata section (size, type, upload time, status)
  - Content preview (first 1000 characters)
  - "View Full Document" button
- **Close:** X button or click outside panel

#### WF-3.2: Validation Results
- **Requirement:** Display validation status
- **Elements:**
  - Format validation (checkmark or X)
  - Integrity validation (checkmark or X)
  - Size validation (checkmark or X)
  - Content validation (checkmark or X)
  - Security validation (checkmark or X)
- **Visual:** List with green checkmarks or red X icons

#### WF-3.3: Extracted Content Preview
- **Requirement:** Show preview of extracted text
- **Display:**
  - Scrollable text area
  - Word count and character count
  - Page count (for PDFs)
  - Language detected
  - Structure preview (headings, paragraphs, lists)
- **Formatting:** Preserve basic structure (paragraphs, line breaks)

### WF-4: Processing Status Features (from doc-module)

#### WF-4.1: Status Badges
- **Requirement:** Visual status indicators matching wireframe
- **Badges:**
  - **Queued:** Gray badge, clock icon
  - **Validating:** Blue badge, spinning icon
  - **Processing:** Blue badge, spinning icon, percentage
  - **Completed:** Green badge, checkmark icon
  - **Error:** Red badge, alert icon
  - **Paused:** Yellow badge, pause icon
- **Behavior:** Badges update in real-time via polling

#### WF-4.2: Progress Indicators
- **Requirement:** Show processing progress
- **Elements:**
  - Linear progress bar (0-100%)
  - Percentage text
  - Estimated time remaining
  - Current stage description
- **Updates:** Every 2 seconds while processing

#### WF-4.3: Error Details
- **Requirement:** Show detailed error information
- **Display:**
  - Error message in alert box (red background)
  - Error code for support reference
  - Suggested action ("Retry" button)
  - Option to view full error details
- **Expandable:** Click to show full error details and stack trace

### WF-5: Navigation Features (from doc-module)

#### WF-5.1: View Tabs
- **Requirement:** Switch between upload, queue, and preview views
- **Tabs:**
  - Upload (home icon)
  - Queue (list icon)
  - Preview (eye icon)
- **State:** Active tab highlighted
- **Behavior:** Click to switch views without page reload

#### WF-5.2: Breadcrumb Navigation
- **Requirement:** Show current location in application
- **Format:** Dashboard > Upload > Queue
- **Links:** Each segment clickable to navigate
- **Mobile:** Collapsed to current view only

#### WF-5.3: Quick Actions
- **Requirement:** Fast access to common actions
- **Elements:**
  - "Upload More" button (always visible in queue view)
  - "View All Documents" link to dashboard
  - "Start Workflow" button for completed files
- **Placement:** Top-right of content area

---

## Non-Functional Requirements

### NFR-1: Scalability

#### NFR-1.1: Concurrent Users
- **Requirement:** Support multiple users uploading simultaneously
- **Target:** 100 concurrent users without degradation
- **Mechanism:** Vercel auto-scaling, Supabase connection pooling

#### NFR-1.2: File Volume
- **Requirement:** Handle large numbers of files
- **Target:** 10,000 documents per user account
- **Database:** Efficient queries with proper indexing

#### NFR-1.3: Storage Capacity
- **Requirement:** Plan for storage growth
- **Estimate:** Average 5MB per document × 10,000 = 50GB per user
- **Supabase:** Ensure storage plan supports anticipated usage

### NFR-2: Reliability

#### NFR-2.1: Uptime
- **Requirement:** Upload service must be highly available
- **Target:** 99.9% uptime (< 45 minutes downtime per month)
- **Mechanism:** Leverage Vercel and Supabase SLAs

#### NFR-2.2: Data Durability
- **Requirement:** Uploaded files must not be lost
- **Target:** 99.999999999% durability (Supabase Storage)
- **Backup:** Automatic backups through Supabase

#### NFR-2.3: Fault Tolerance
- **Requirement:** Graceful degradation if services unavailable
- **Behavior:**
  - If extraction fails, document still stored (can retry later)
  - If polling fails, show cached status
  - If upload fails, allow retry without re-selecting file

### NFR-3: Maintainability

#### NFR-3.1: Code Organization
- **Requirement:** Code must be well-organized and documented
- **Structure:**
  - Upload components in `/components/upload/`
  - File processing in `/lib/file-processing/`
  - API routes in `/app/api/documents/`
  - Tests in `/__tests__/upload/`

#### NFR-3.2: Documentation
- **Requirement:** Comprehensive code documentation
- **Elements:**
  - JSDoc comments for all public functions
  - README in upload module directory
  - API endpoint documentation
  - Database schema documentation

#### NFR-3.3: Testing
- **Requirement:** Adequate test coverage
- **Targets:**
  - Unit tests: 80% coverage for services
  - Integration tests: All API endpoints
  - E2E tests: Happy path and error scenarios
- **Framework:** Jest for unit/integration, Playwright for E2E

### NFR-4: Accessibility

#### NFR-4.1: WCAG Compliance
- **Requirement:** Meet WCAG 2.1 Level AA standards
- **Audits:** Run accessibility audits (Lighthouse, axe)
- **Fixes:** Address all critical and serious issues

#### NFR-4.2: Screen Reader Support
- **Requirement:** All functionality accessible via screen reader
- **Mechanisms:**
  - ARIA labels for all interactive elements
  - Semantic HTML (header, main, nav, button)
  - Focus management for modals and dialogs
  - Status announcements for async operations

#### NFR-4.3: Keyboard Navigation
- **Requirement:** All functionality accessible via keyboard
- **Interactions:**
  - Tab order logical and complete
  - Enter/Space activate buttons
  - Escape closes dialogs
  - Arrow keys navigate lists

### NFR-5: Internationalization (Future)

#### NFR-5.1: Text Externalization
- **Requirement:** Prepare for future internationalization
- **Implementation:**
  - All user-facing text in constants file
  - No hardcoded strings in components
  - Use i18n library (next-i18next)
- **Scope:** English only for MVP, structure for expansion

#### NFR-5.2: Date/Time Formatting
- **Requirement:** Use locale-aware date/time formatting
- **Implementation:** Intl.DateTimeFormat API
- **Default:** User's browser locale

---

## Constraints and Assumptions

### Constraints

1. **Deployment Platform:** Must deploy to Vercel (serverless constraints apply)
2. **Database:** Must use existing Supabase instance (no new database)
3. **Authentication:** Must use existing Supabase Auth (no new auth system)
4. **Budget:** No additional infrastructure costs beyond current plan
5. **Timeline:** Must complete in 2 weeks (10 working days)
6. **Team Size:** Single senior engineer implementation

### Assumptions

1. **User Base:** Assume < 1,000 active users for MVP
2. **Upload Volume:** Assume < 100 uploads per user per day
3. **File Sizes:** Assume most files < 10MB (large files rare)
4. **Network:** Assume users have reliable internet (not optimizing for offline)
5. **Browser Support:** Assume modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
6. **Mobile Usage:** Assume primarily desktop users (responsive design but not mobile-first)

### Dependencies

1. **External Services:**
   - Supabase (database, auth, storage)
   - Vercel (hosting, edge functions)
   - NPM registry (package dependencies)

2. **Internal Services:**
   - Existing authentication system
   - Existing workflow system
   - Existing chunk extraction system
   - Existing dimension generation system

3. **Libraries:**
   - pdf-parse (PDF extraction)
   - mammoth (DOCX extraction)
   - html-to-text (HTML extraction)
   - All existing Next.js/React dependencies

### Risks and Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Text extraction fails for complex PDFs | High | Medium | Implement retry logic, provide manual content entry fallback |
| Large files timeout processing | Medium | Medium | Set 5-minute timeout, queue for retry, notify user |
| Vercel function timeout (30s) | High | Low | Use background job pattern, not synchronous processing |
| Storage costs exceed budget | Medium | Low | Implement file size limits, monitor usage, alert at 80% capacity |
| Concurrent uploads overwhelm system | High | Low | Implement rate limiting, queue management, user limits |
| Browser compatibility issues | Low | Medium | Test on all major browsers, use polyfills where needed |

---

## Success Criteria

### MVP Success Criteria

The MVP will be considered successful when:

1. **Core Functionality:**
   - ✅ Users can upload documents via drag-drop or file selection
   - ✅ System extracts text from PDF, DOCX, TXT, MD, HTML files
   - ✅ Users see processing status in real-time
   - ✅ Completed documents flow into categorization workflow
   - ✅ All wireframe UI features are functional

2. **Quality Metrics:**
   - ✅ Upload success rate > 98%
   - ✅ Text extraction success rate > 95%
   - ✅ Processing time < 30 seconds for 90% of documents
   - ✅ Zero critical bugs in production
   - ✅ Accessibility audit score > 90

3. **User Experience:**
   - ✅ Users successfully upload documents without training
   - ✅ < 5% user confusion rate (based on support tickets)
   - ✅ Positive user feedback on usability
   - ✅ No workflow disruption or context switching

4. **Technical Quality:**
   - ✅ Code passes all unit and integration tests
   - ✅ No security vulnerabilities (npm audit clean)
   - ✅ API response times within targets
   - ✅ Proper error handling for all failure modes

5. **Integration:**
   - ✅ Seamlessly integrates with existing dashboard
   - ✅ Documents appear in workflow selector immediately
   - ✅ No breaking changes to existing features
   - ✅ Uses existing components (no duplication)

### Post-MVP Enhancements

Future enhancements (not in scope for MVP):

1. **Advanced Features:**
   - OCR for scanned PDFs
   - Document preview with syntax highlighting
   - Bulk metadata editing
   - Import from cloud storage (Google Drive, Dropbox)
   - Document versioning

2. **Performance Optimizations:**
   - WebSocket status updates (replace polling)
   - Chunked file upload for large files
   - Client-side compression before upload
   - Progressive text extraction (partial results)

3. **User Experience:**
   - Document templates for metadata
   - Saved metadata presets
   - Collaborative document management
   - Email notifications for long-running processes

4. **Enterprise Features:**
   - Admin dashboard for usage monitoring
   - Team/organization document sharing
   - Role-based access control
   - Audit logs and compliance reporting

---

## Implementation Phases

### Phase 1: Core Upload (Days 1-3)

**Goal:** Basic file upload and storage working

**Deliverables:**
- Upload page at `/upload` route
- Drag-drop upload zone
- File selection button
- Upload to Supabase Storage
- Database record creation
- Basic status display

**Success:** User can upload file, see it in database

### Phase 2: Text Extraction (Days 4-6)

**Goal:** Automatic text extraction from uploaded files

**Deliverables:**
- Text extractor service (PDF, DOCX, HTML, TXT)
- Document processor orchestrator
- Processing API endpoint
- Background job implementation
- Error handling and retry logic

**Success:** Uploaded document has extracted text in content field

### Phase 3: Status Tracking (Days 7-8)

**Goal:** Real-time status updates in UI

**Deliverables:**
- Status polling hook
- Status API endpoint
- Progress indicators in UI
- Processing stats dashboard
- Error display

**Success:** User sees processing progress in real-time

### Phase 4: Queue Management & Integration (Days 9-10)

**Goal:** Complete feature set and workflow integration

**Deliverables:**
- Queue table with all wireframe features
- Batch operations (pause, resume, retry, delete)
- Filters and search
- Dashboard integration
- Workflow transition
- Metadata capture UI
- Testing and bug fixes

**Success:** All wireframe features functional, seamless workflow

---

## Appendices

### Appendix A: Related Documents

1. **Prior Specifications:**
   - `c-alpha-build-spec_v3.3_document_module_v2.md` - Metadata capture spec
   - `c-alpha-build-spec_v3.3_document_module_analysis_v1.md` - Gap analysis
   - `c-alpha-build-spec_v3.3_quick-wins-log-api_v3.md` - Implementation spec template

2. **Decision Records:**
   - `c-alpha-build-spec_v3.3_document_module_decisions_v1.md` - Architectural decisions

3. **Wireframe Reference:**
   - `doc-module/` - UI wireframe application (Vite)

### Appendix B: File Structure

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx                 # Updated: Add upload button
│   │   └── upload/                      # NEW: Upload module
│   │       ├── page.tsx                 # Main upload page
│   │       └── loading.tsx              # Loading state
│   └── api/
│       └── documents/
│           ├── upload/
│           │   └── route.ts             # NEW: Upload endpoint
│           ├── process/
│           │   └── route.ts             # NEW: Processing endpoint
│           └── status/
│               └── route.ts             # NEW: Status endpoint
├── components/
│   └── upload/                          # NEW: Upload components
│       ├── upload-dropzone.tsx          # Drag-drop zone
│       ├── upload-queue.tsx             # Queue table
│       ├── upload-stats.tsx             # Statistics cards
│       ├── upload-filters.tsx           # Filters and search
│       ├── upload-actions.tsx           # Batch actions
│       ├── document-status.tsx          # Status badges
│       ├── metadata-form.tsx            # Metadata input
│       └── content-preview.tsx          # Preview panel
├── lib/
│   └── file-processing/                 # NEW: Text extraction
│       ├── text-extractor.ts            # Text extraction service
│       └── document-processor.ts        # Processing orchestrator
├── hooks/
│   └── use-document-status.ts           # NEW: Status polling hook
└── types/
    └── upload.ts                        # NEW: Upload type definitions
```

### Appendix C: Database Schema Changes

```sql
-- New columns for processing tracking
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS processing_progress INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS processing_error TEXT,
  ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS processing_completed_at TIMESTAMPTZ;

-- Index for efficient status queries
CREATE INDEX IF NOT EXISTS idx_documents_status_updated 
  ON documents(status, updated_at) 
  WHERE status IN ('uploaded', 'processing');

-- Existing columns (from previous spec, should already exist)
-- doc_version TEXT
-- source_type TEXT
-- source_url TEXT
-- doc_date TIMESTAMPTZ
-- idx_documents_source_type INDEX
```

### Appendix D: NPM Dependencies

```json
{
  "dependencies": {
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.6.0",
    "html-to-text": "^9.0.5"
  }
}
```

### Appendix E: API Contract

**POST /api/documents/upload**
```typescript
Request: FormData {
  file: File
  title?: string
  doc_version?: string
  source_url?: string
  doc_date?: string (ISO 8601)
}

Response: {
  success: boolean
  document: {
    id: string
    title: string
    status: 'uploaded'
    created_at: string
  }
  error?: string
}
```

**POST /api/documents/process**
```typescript
Request: {
  documentId: string
}

Response: {
  success: boolean
  message: string
}
```

**GET /api/documents/status**
```typescript
Query: ?id=uuid OR ?ids=uuid1,uuid2,uuid3

Response: {
  documents: Array<{
    id: string
    status: 'uploaded' | 'processing' | 'completed' | 'error'
    progress: number (0-100)
    error: string | null
    processingStartedAt: string | null
    estimatedSecondsRemaining: number | null
  }>
}
```

---

## Sign-Off

This requirements specification is complete and ready for implementation specification development.

**Next Steps:**
1. Review and approve requirements specification
2. Create implementation specification (`v4.md`)
3. Implementation specification should contain:
   - Step-by-step coding instructions
   - Copy-paste code blocks with === and +++ markers
   - Directive style ("You shall")
   - Self-contained prompts
   - Testing instructions

**Prepared By:** AI Requirements Analyst  
**Date:** October 9, 2025  
**Version:** 3.0 Final

---

**END OF REQUIREMENTS SPECIFICATION**

