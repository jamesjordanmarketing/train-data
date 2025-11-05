# Document Upload Module - Part 2 Turnover
**Date:** October 10, 2025  
**Status:** Prompts 1-3 Complete, Part 2 Remaining  
**Prepared For:** Next Implementation Agent

---

## Executive Summary

Prompts 1-3 have successfully implemented the **core document upload and text extraction functionality**. Users can now upload files, and text is automatically extracted from PDF, DOCX, HTML, TXT, MD, and RTF formats. This turnover document outlines the remaining features needed to complete the full module as specified in the requirements document.

---

## What's Been Completed (Prompts 1-3)

### ✅ Prompt 1: Database & Infrastructure
- Database schema updated with 8 processing columns
- Supabase Storage bucket configured with RLS policies
- NPM packages installed (pdf-parse, mammoth, html-to-text)
- TypeScript type definitions created
- Upload API endpoint (`/api/documents/upload`)

### ✅ Prompt 2: Upload UI Components  
- Upload Dropzone component (drag-drop + file selection)
- Upload Page with progress tracking
- Dashboard integration ("Upload Documents" button)
- Loading states and error handling

### ✅ Prompt 3: Text Extraction Engine
- Text Extractor Service (multi-format support)
- Document Processor orchestrator
- Processing API endpoint (`/api/documents/process`)
- Error handling and retry logic

---

## What Remains (Part 2)

The following features are specified in `c-alpha-build-spec_v3.3_document_module_v3.md` but not yet implemented. They should be organized into 2-3 additional prompts.

---

## REMAINING FEATURE SET 1: Status Polling & Real-Time Updates

### Priority: HIGH
**Estimated Time:** 3-4 hours  
**Complexity:** Medium

### Components Needed:

#### 1. Status Polling API Endpoint
**File:** `src/app/api/documents/status/route.ts`

**Purpose:** Provide current processing status for one or more documents

**Functionality:**
- GET endpoint accepting `?id=uuid` or `?ids=uuid1,uuid2,uuid3`
- Query documents table for status, progress, error messages
- Return JSON with current state
- Support batch queries (up to 100 documents)
- Response time < 200ms

**Response Format:**
```typescript
{
  documents: [
    {
      id: string,
      status: 'uploaded' | 'processing' | 'completed' | 'error',
      progress: number (0-100),
      error: string | null,
      processingStartedAt: string | null,
      processingCompletedAt: string | null,
      estimatedSecondsRemaining: number | null
    }
  ]
}
```

#### 2. Status Polling React Hook
**File:** `src/hooks/use-document-status.ts`

**Purpose:** Custom React hook that polls status endpoint every 2 seconds

**Functionality:**
- Accept document ID or array of IDs
- Poll `/api/documents/status` every 2 seconds
- Stop polling when status reaches 'completed' or 'error'
- Pause polling when browser tab inactive (performance optimization)
- Return current status, progress, loading state

**Usage Pattern:**
```typescript
const { status, progress, error, isPolling } = useDocumentStatus(documentId);
```

#### 3. Update Upload Page with Polling
**File:** `src/app/(dashboard)/upload/page.tsx` (modify)

**Changes:**
- Import and use `useDocumentStatus` hook
- Display real-time progress for each uploading document
- Show live status updates without page refresh
- Update "Recently Uploaded Documents" list dynamically

#### 4. Status Badge Component
**File:** `src/components/upload/document-status.tsx`

**Purpose:** Visual status indicator with icon and color

**Variants:**
- **Queued:** Gray badge, clock icon
- **Processing:** Blue badge, spinner icon, progress percentage
- **Completed:** Green badge, checkmark icon
- **Error:** Red badge, alert icon
- **Paused:** Yellow badge, pause icon

---

## REMAINING FEATURE SET 2: Upload Queue Management

### Priority: HIGH
**Estimated Time:** 4-5 hours  
**Complexity:** High

### Components Needed:

#### 1. Upload Queue Component
**File:** `src/components/upload/upload-queue.tsx`

**Purpose:** Full-featured table showing all user's uploads with management controls

**Features:**
- Table display with columns:
  - Checkbox (for selection)
  - File name with icon
  - Status badge
  - Priority badge
  - Progress bar
  - File size
  - Upload time ("Xm ago")
  - Actions menu (three-dot)
- Sorting: by upload time, status, name, size
- Pagination: 20 items per page
- Row hover effects
- Empty state: "No documents uploaded yet"

#### 2. Upload Statistics Component
**File:** `src/components/upload/upload-stats.tsx`

**Purpose:** Dashboard cards showing aggregate statistics

**Metrics:**
- Total Files (all-time count)
- Queued (status='uploaded')
- Processing (status='processing')
- Completed (status='completed')
- Errors (status='error')

**Design:** 5 cards in grid layout, color-coded

#### 3. Upload Filters Component
**File:** `src/components/upload/upload-filters.tsx`

**Purpose:** Filter and search controls

**Filters:**
- Status dropdown (All, Queued, Processing, Completed, Error)
- File type dropdown (All, PDF, DOCX, TXT, etc.)
- Date range picker (Today, Last 7 days, Last 30 days, Custom)
- Search input (filter by filename)

**Behavior:** Real-time filtering (no submit button)

#### 4. Upload Actions Component
**File:** `src/components/upload/upload-actions.tsx`

**Purpose:** Batch operations toolbar

**Actions:**
- Select All checkbox
- Set Priority (High, Medium, Low) for selected
- Pause selected (future: pause processing)
- Resume selected (future: resume paused)
- Retry selected (re-trigger processing for errors)
- Delete selected (with confirmation dialog)

**Visibility:** Only shows when items are selected

#### 5. Actions Menu (Per-File)
**File:** `src/components/upload/document-actions-menu.tsx`

**Purpose:** Dropdown menu for individual file actions

**Menu Items (contextual):**
- View (navigate to document)
- Preview (show content preview)
- Edit Metadata (future)
- Retry (if error)
- Download Original (future)
- Delete

---

## REMAINING FEATURE SET 3: Metadata & Preview

### Priority: MEDIUM
**Estimated Time:** 3-4 hours  
**Complexity:** Medium

### Components Needed:

#### 1. Metadata Form Component
**File:** `src/components/upload/metadata-form.tsx`

**Purpose:** Edit document metadata after upload

**Fields:**
- Title (text input)
- Document Version (text input, optional)
- Source URL (text input, optional, validate URL format)
- Document Date (date picker, optional)
- Source Type (display only, auto-detected)

**Functionality:**
- Inline editing in upload queue
- Or dialog/sheet for bulk editing
- PATCH `/api/documents/{id}` to save changes
- Validation and error display

#### 2. Content Preview Component
**File:** `src/components/upload/content-preview.tsx`

**Purpose:** Preview extracted text content

**Features:**
- Side sheet or modal
- Show first 1000 characters of extracted text
- "View Full Document" button
- Document metadata display:
  - File size
  - File type
  - Upload timestamp
  - Processing time
  - Word count
  - Character count
- Extraction validation status:
  - Format ✓
  - Content length ✓
  - Encoding ✓
  - Quality score

#### 3. Update API for Metadata Editing
**File:** `src/app/api/documents/[id]/route.ts`

**New Endpoint:** PATCH `/api/documents/:id`

**Purpose:** Update document metadata

**Allowed Fields:**
- title
- doc_version
- source_url
- doc_date

**Not Allowed:**
- content (read-only after extraction)
- file_path (immutable)
- status (managed by system)
- author_id (immutable)

---

## REMAINING FEATURE SET 4: Workflow Integration

### Priority: HIGH
**Estimated Time:** 2-3 hours  
**Complexity:** Low-Medium

### Components Needed:

#### 1. Update Document Selector
**File:** `src/components/DocumentSelector.tsx` (modify)

**Changes:**
- Include documents with status 'completed' in selector
- Filter out documents still in 'uploaded' or 'processing' state
- Add source indicator badge: "Uploaded" vs "Seed Data"
- Show upload date in document list
- Sort by upload date (newest first) by default

#### 2. "Start Workflow" Button in Upload Page
**File:** `src/app/(dashboard)/upload/page.tsx` (modify)

**Changes:**
- Add "Start Workflow" button for completed documents
- Navigate to `/workflow/{documentId}/stage1`
- Bulk action: "Start Workflow for Selected" (queue multiple)

#### 3. Workflow Bulk Processing
**File:** `src/app/(workflow)/workflow/[documentId]/stage1/page.tsx` (investigate)

**Enhancement:**
- Support query param: `?batch=true&ids=uuid1,uuid2`
- Show batch progress: "Document 3 of 10"
- "Next Document" button after completing workflow
- Save and move to next document in batch

---

## REMAINING FEATURE SET 5: Enhanced Error Handling & Retry

### Priority: MEDIUM
**Estimated Time:** 2-3 hours  
**Complexity:** Medium

### Components Needed:

#### 1. Error Details Dialog
**File:** `src/components/upload/error-details-dialog.tsx`

**Purpose:** Show detailed error information for failed uploads

**Display:**
- Error type (CORRUPT_FILE, UNSUPPORTED_CONTENT, etc.)
- Full error message
- Suggested action
- Retry button
- "Contact Support" button with error code
- Option to download original file for inspection

#### 2. Retry Logic Enhancement
**File:** `src/lib/file-processing/document-processor.ts` (modify)

**Enhancements:**
- Track retry attempts (max 3)
- Exponential backoff (5s, 15s, 45s delays)
- Store retry history in database
- Different strategies for different error types:
  - CORRUPT_FILE: No retry (user must re-upload)
  - TIMEOUT: Retry with longer timeout
  - SERVER_ERROR: Retry immediately
  - UNSUPPORTED_CONTENT: No retry

#### 3. Error Logging Table
**New Database Table:** `document_processing_errors`

**Schema:**
```sql
CREATE TABLE document_processing_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  retry_attempt INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Audit trail of all processing errors for debugging

---

## REMAINING FEATURE SET 6: Advanced Features (Lower Priority)

### Priority: LOW
**Estimated Time:** 5-6 hours (can be deferred)
**Complexity:** Medium-High

### Features:

#### 1. Document Preview Before Upload
- Show file details before committing upload
- Edit metadata before upload starts
- Preview first page (for PDF) or content snippet

#### 2. Bulk Metadata Templates
- Save metadata presets
- Apply template to multiple documents
- Organization-level templates (future: multi-tenant)

#### 3. Download Original File
- Download button for each uploaded document
- Signed URL from Supabase Storage
- Expire after 1 hour

#### 4. Document Versioning
- Track multiple versions of same document
- Compare extracted text between versions
- Version history timeline

#### 5. OCR for Scanned PDFs
- Detect scanned PDFs (image-only)
- Integrate Tesseract.js or cloud OCR service
- Extract text from images
- Much higher complexity & cost

---

## Implementation Strategy for Part 2

### Recommended Prompt Structure:

**PROMPT 4: Status Polling & Queue Management**
- Status polling API endpoint
- Status polling React hook
- Upload Queue component
- Upload Statistics component
- Upload Filters component
- Upload Actions component
- Integration with upload page

**PROMPT 5: Metadata & Preview Features**
- Metadata form component
- Content preview component
- Metadata update API endpoint
- Error details dialog
- Enhanced error handling

**PROMPT 6: Workflow Integration & Testing**
- Document Selector updates
- Workflow integration
- Bulk workflow processing
- End-to-end testing
- Documentation

---

## Database Schema Additions Needed

### For Enhanced Error Logging:

```sql
-- Create error logging table
CREATE TABLE IF NOT EXISTS document_processing_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  error_type TEXT NOT NULL CHECK (error_type IN ('CORRUPT_FILE', 'UNSUPPORTED_CONTENT', 'TIMEOUT', 'SERVER_ERROR', 'STORAGE_ERROR')),
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  retry_attempt INTEGER DEFAULT 0 CHECK (retry_attempt >= 0 AND retry_attempt <= 3),
  recoverable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for querying errors by document
CREATE INDEX idx_processing_errors_document 
  ON document_processing_errors(document_id, created_at DESC);

-- Add retry tracking to documents table
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0 CHECK (retry_count >= 0 AND retry_count <= 3);
```

### For Metadata History (Optional):

```sql
-- Track metadata changes
CREATE TABLE IF NOT EXISTS document_metadata_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by UUID REFERENCES user_profiles(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints to Create

| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| `/api/documents/status` | GET | Poll processing status | HIGH |
| `/api/documents/[id]` | PATCH | Update metadata | MEDIUM |
| `/api/documents/[id]` | DELETE | Delete document | MEDIUM |
| `/api/documents/[id]/retry` | POST | Retry processing | HIGH |
| `/api/documents/[id]/content` | GET | Get full extracted content | MEDIUM |
| `/api/documents/[id]/download` | GET | Download original file | LOW |
| `/api/documents/batch` | POST | Batch operations | MEDIUM |

---

## Testing Requirements

### Unit Tests Needed:
- Text extractor service (each file type)
- File validation functions
- Metadata validation
- Status polling hook

### Integration Tests Needed:
- Upload → Extract → Complete workflow
- Upload → Error → Retry workflow
- Batch upload (10+ files)
- Large file handling (50MB+)
- Mixed file types in single batch

### E2E Tests Needed:
- Full user workflow: Dashboard → Upload → Extract → Categorize
- Error handling: Invalid files, corrupt files, network errors
- Concurrent uploads from multiple users
- Browser compatibility (Chrome, Firefox, Safari, Edge)

---

## Performance Optimization Opportunities

1. **Parallel Processing**
   - Currently: Sequential upload
   - Future: Parallel upload of multiple files
   - Benefit: 3-5x faster for batches

2. **Client-Side Compression**
   - Compress large files before upload
   - Reduce upload time and bandwidth

3. **Chunked Upload**
   - Upload large files in chunks
   - Resume failed uploads
   - Show real upload progress

4. **WebSocket Status Updates**
   - Replace polling with WebSockets
   - Instant status updates
   - Reduced server load

5. **Progressive Text Extraction**
   - Stream extracted text as it's processed
   - Show partial results immediately
   - Better perceived performance

---

## Known Issues & Limitations

### Current Limitations:
1. No OCR support (scanned PDFs won't extract text)
2. Sequential upload only (one at a time)
3. No file preview before upload
4. No download original file feature
5. No document versioning
6. No collaborative features
7. 100MB file size limit (could increase)
8. 100 files per batch limit

### Future Enhancements:
- Multi-tenant organization support
- Role-based access control
- Document sharing and permissions
- Advanced search and filtering
- Analytics and insights
- Export to various formats
- Integration with external systems

---

## Documentation Needed

### User Documentation:
- [ ] Upload page user guide (how to use)
- [ ] Supported file formats and limitations
- [ ] Troubleshooting guide (common errors)
- [ ] FAQ

### Developer Documentation:
- [ ] API reference (all endpoints)
- [ ] Component API docs (props, usage)
- [ ] Database schema documentation
- [ ] Architecture overview
- [ ] Deployment guide

### Testing Documentation:
- [ ] Test plan
- [ ] Test cases and scenarios
- [ ] Performance benchmarks
- [ ] Security audit checklist

---

## Dependencies for Part 2

### New NPM Packages Needed:
- None (all required packages installed in Prompt 1)

### Optional Packages for Future Enhancements:
- `tesseract.js` - OCR for scanned PDFs
- `pdfjs-dist` - PDF preview generation
- `socket.io` - WebSocket status updates
- `react-dropzone` - Enhanced drag-drop (if needed)

---

## Estimated Total Time for Part 2

| Feature Set | Time | Complexity |
|-------------|------|------------|
| Status Polling & Real-Time | 3-4 hours | Medium |
| Upload Queue Management | 4-5 hours | High |
| Metadata & Preview | 3-4 hours | Medium |
| Workflow Integration | 2-3 hours | Low-Medium |
| Enhanced Error Handling | 2-3 hours | Medium |
| **TOTAL** | **14-19 hours** | **~2 weeks** |

Advanced features (lower priority): Additional 5-6 hours

---

## Success Criteria for Completion

The document upload module will be considered **fully complete** when:

1. ✅ All UI features from `doc-module/` wireframe are functional
2. ✅ Users can upload, view, filter, search, and manage documents
3. ✅ Real-time status updates work via polling
4. ✅ Metadata can be edited after upload
5. ✅ Content preview is available
6. ✅ Workflow integration is seamless
7. ✅ Error handling is comprehensive with retry logic
8. ✅ All test scenarios pass
9. ✅ Documentation is complete
10. ✅ Performance meets targets (<30s upload, <60s processing for 90% of files)

---

## Next Steps for Implementation Agent

1. **Review this turnover document** thoroughly
2. **Review Prompts 1-3** to understand what's already built
3. **Review requirements spec** (`c-alpha-build-spec_v3.3_document_module_v3.md`)
4. **Prioritize Feature Sets** based on business value
5. **Create Prompt 4** covering Status Polling & Queue Management
6. **Create Prompt 5** covering Metadata & Preview Features
7. **Create Prompt 6** covering Workflow Integration & Testing
8. **Execute prompts** sequentially with full testing between each
9. **Document any deviations** or architectural decisions
10. **Update this turnover doc** as features are completed

---

## Questions for Next Agent

1. Should we implement WebSockets instead of polling for status updates?
   - Polling is simpler and works with Vercel serverless
   - WebSockets would be real-time but more complex

2. Should bulk workflow processing be in scope?
   - Allows users to categorize many documents efficiently
   - Would require workflow system modifications

3. What's the priority of OCR support for scanned PDFs?
   - High user value but significant complexity
   - Could be separate feature/module

4. Should we implement document versioning?
   - Valuable for tracking changes over time
   - Requires additional database tables

5. Mobile app support?
   - Currently responsive web only
   - Native mobile app would require separate implementation

---

**END OF TURNOVER DOCUMENT**

This document provides complete context for the next implementation agent to continue building the document upload module. All components from Prompts 1-3 are functional and tested. The remaining features are clearly organized and prioritized.

**Status:** Ready for Part 2 Implementation
**Last Updated:** October 10, 2025

