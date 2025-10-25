# Document Upload Module Implementation Specification
**Version:** 1.0  
**Date:** October 7, 2025  
**Purpose:** Detailed specification for implementing comprehensive document metadata capture during upload

---

## Executive Summary

The document upload process currently captures minimal metadata (title, file path, file size, author ID, status). This specification details how to enhance the upload module to capture 5 additional metadata fields that are essential for dimension generation downstream.

**Impact:** Fixes 5 missing "Prior Generated" dimensions that should be inherited by all chunks created from the document.

---

## Problem Statement

### Current State
The document upload code in `src/lib/database.ts` only captures:
- ✅ `title` - Derived from filename
- ✅ `file_path` - Storage path
- ✅ `file_size` - File size in bytes
- ✅ `author_id` - UUID of uploader
- ✅ `status` - Processing status

### Missing Metadata (5 fields)
1. **doc_version** - Document version tag (e.g., "v1.3.0")
2. **source_type** - File format (pdf, docx, html, markdown, etc.)
3. **source_url** - Original URL or file path for provenance
4. **author** - Human-readable author name (currently only storing UUID)
5. **doc_date** - Document creation/publication date (not upload date)

### Why These Fields Matter
- **Dimension Inheritance**: These 5 fields become dimensions for every chunk extracted from the document
- **Provenance Tracking**: Critical for knowing where content came from
- **Training Data Quality**: ML models benefit from knowing document version, type, and date
- **User Experience**: Authors need to see human-readable names, not UUIDs

---

## Database Schema Requirements

### Current `documents` Table Schema
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  file_path TEXT,
  file_size INTEGER,
  author_id UUID REFERENCES user_profiles(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Required Schema Additions
```sql
-- Add missing metadata columns to documents table
ALTER TABLE documents 
  ADD COLUMN doc_version TEXT,
  ADD COLUMN source_type TEXT,
  ADD COLUMN source_url TEXT,
  ADD COLUMN doc_date TIMESTAMPTZ;
```

### Column Specifications
| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `doc_version` | TEXT | No | NULL | Document version (semver or tag) |
| `source_type` | TEXT | Yes | Derived | File format: pdf, docx, html, markdown, email, transcript, notion, spreadsheet, image+OCR |
| `source_url` | TEXT | No | NULL | Original URL or canonical path |
| `doc_date` | TIMESTAMPTZ | No | NULL | Original document date (not upload date) |

**Note:** For `author`, no schema change needed - we'll map `author_id` to human-readable name at read time.

---

## Implementation Components

### Component 1: Database Migration

**File:** `src/migrations/add_document_metadata_columns.sql` (new file)

**Purpose:** Add the 4 missing columns to documents table

**Migration Script:**
```sql
-- Migration: Add document metadata columns
-- Date: 2025-10-07
-- Purpose: Support comprehensive document metadata capture

ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS doc_version TEXT,
  ADD COLUMN IF NOT EXISTS source_type TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS doc_date TIMESTAMPTZ;

-- Add index on source_type for filtering
CREATE INDEX IF NOT EXISTS idx_documents_source_type ON documents(source_type);

-- Add comment for documentation
COMMENT ON COLUMN documents.doc_version IS 'Document version tag or semver (e.g., v1.3.0)';
COMMENT ON COLUMN documents.source_type IS 'File format: pdf, docx, html, markdown, email, transcript, notion, spreadsheet, image+OCR';
COMMENT ON COLUMN documents.source_url IS 'Original URL or canonical file path for provenance';
COMMENT ON COLUMN documents.doc_date IS 'Original document creation/publication date (not upload date)';
```

**Execution:** Run this migration in Supabase SQL editor or via migration tool.

---

### Component 2: Document Upload Service Update

**File:** `src/lib/database.ts`

**Current Location:** Line ~395 in `fileService.uploadDocument()`

**Current Code:**
```typescript
const { data: documentData, error: documentError } = await supabase
  .from('documents')
  .insert({
    title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
    file_path: uploadData.path,
    file_size: file.size,
    author_id: userId,
    status: 'pending'
    // ❌ Missing: doc_version, source_type, source_url, doc_date
  })
```

**Updated Code:**
```typescript
// Extract file extension for source_type
const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'unknown';
const sourceTypeMap: Record<string, string> = {
  'pdf': 'pdf',
  'docx': 'docx',
  'doc': 'docx',
  'html': 'html',
  'htm': 'html',
  'md': 'markdown',
  'txt': 'markdown',
  'json': 'json',
  'csv': 'spreadsheet',
  'xlsx': 'spreadsheet',
  'xls': 'spreadsheet',
};
const sourceType = sourceTypeMap[fileExtension] || 'other';

const { data: documentData, error: documentError } = await supabase
  .from('documents')
  .insert({
    title: file.name.replace(/\.[^/.]+$/, ''),
    file_path: uploadData.path,
    file_size: file.size,
    author_id: userId,
    status: 'pending',
    
    // ✅ NEW: Add metadata fields
    source_type: sourceType,
    doc_version: metadata?.version || null,  // From UI form
    source_url: metadata?.sourceUrl || null,  // From UI form
    doc_date: metadata?.docDate || null,      // From UI form
  })
```

**Parameters Required:**
The `uploadDocument()` function signature needs to accept optional metadata:

```typescript
async uploadDocument(
  file: File,
  userId: string,
  metadata?: {
    version?: string;
    sourceUrl?: string;
    docDate?: string;  // ISO format
  }
): Promise<...>
```

---

### Component 3: Upload Form UI Enhancement

**Files to Modify:**
- `src/app/(workflow)/upload/page.tsx` OR
- `src/components/workflow/DocumentUpload.tsx` (wherever upload form exists)

**Current State:**
Upload form likely only has file picker and submit button.

**Required Enhancements:**

#### UI Wireframe
```
┌─────────────────────────────────────────────┐
│ Upload Document                             │
├─────────────────────────────────────────────┤
│                                             │
│ [Drop files here or click to browse]       │
│                                             │
├─────────────────────────────────────────────┤
│ Document Metadata (Optional)                │
│                                             │
│ Document Version:                           │
│ [_________________________________]         │
│ (e.g., v1.0.0, 2024-Q3)                    │
│                                             │
│ Source URL:                                 │
│ [_________________________________]         │
│ (Original link if from web/cloud)          │
│                                             │
│ Document Date:                              │
│ [__________] 📅                             │
│ (Original publish date, not today)         │
│                                             │
├─────────────────────────────────────────────┤
│               [Cancel] [Upload]             │
└─────────────────────────────────────────────┘

Auto-detected: PDF (from file extension)
Uploaded by: [Current User Name]
```

#### Form Fields Specification

**1. Document Version (Optional)**
- **Type:** Text input
- **Label:** "Document Version"
- **Placeholder:** "e.g., v1.0.0, 2024-Q3, Draft"
- **Help Text:** "Version tag or identifier for this document"
- **Validation:** None (free text)
- **Default:** Empty

**2. Source URL (Optional)**
- **Type:** URL input
- **Label:** "Source URL"
- **Placeholder:** "https://example.com/document.pdf"
- **Help Text:** "Original location if imported from web or cloud storage"
- **Validation:** Must be valid URL format if provided
- **Default:** Empty

**3. Document Date (Optional)**
- **Type:** Date picker
- **Label:** "Document Date"
- **Help Text:** "Original creation/publication date (not upload date)"
- **Validation:** Cannot be future date
- **Default:** Empty (do NOT default to today)

**4. File Type (Auto-detected, Read-only)**
- **Display:** Show detected file type below form
- **Format:** "Auto-detected: PDF" or "Detected as: Microsoft Word"
- **Logic:** Extract from file extension, use `sourceTypeMap`

**5. Author (Auto-filled, Read-only)**
- **Display:** Show current user's name
- **Format:** "Uploaded by: John Smith"
- **Logic:** Fetch from user_profiles using current session's user ID

---

### Component 4: Author Name Resolution

**Problem:** Currently storing `author_id` (UUID) but need human-readable `author` name for dimensions.

**Solution:** Map at read time in dimension generation.

**File:** `src/lib/dimension-generation/generator.ts`

**Current Code (Line ~76):**
```typescript
const documentMetadata = {
  title: document?.title || 'Untitled Document',
  author: document?.authorId || null,  // ❌ This is a UUID
  // ...
};
```

**Updated Code:**
```typescript
// Fetch author name from user_profiles
let authorName = null;
if (document?.authorId) {
  const { data: authorProfile } = await supabase
    .from('user_profiles')
    .select('full_name, email')
    .eq('id', document.authorId)
    .single();
  
  authorName = authorProfile?.full_name || authorProfile?.email || document.authorId;
}

const documentMetadata = {
  title: document?.title || 'Untitled Document',
  author: authorName,  // ✅ Now human-readable
  sourceType: document?.source_type || null,
  sourceUrl: document?.source_url || null,
  docDate: document?.doc_date || document?.createdAt || null,
  docVersion: document?.doc_version || null,
};
```

**Note:** This requires `user_profiles` table to have a `full_name` or similar field.

---

## User Experience Flow

### Upload Workflow

**Step 1: User Selects File**
1. User clicks "Upload Document" in workflow
2. File picker opens
3. User selects file(s)
4. File type auto-detected from extension
5. Form displays with optional metadata fields

**Step 2: User Fills Metadata (Optional)**
1. User can fill version, source URL, document date
2. All fields are optional
3. User sees auto-detected file type
4. User sees their name as author (read-only)

**Step 3: Upload Submission**
1. User clicks "Upload"
2. File uploaded to storage
3. Document record created with all metadata
4. User redirected to document processing view

**Step 4: Dimension Generation**
1. When chunks are created, they inherit document metadata
2. All 5 "Prior Generated" dimensions now populated
3. Dimension validation spreadsheet shows complete metadata

---

## Data Flow Diagram

```
┌─────────────┐
│   User      │
│  Uploads    │
│   File      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Upload Form UI                     │
│  - File picker                      │
│  - Metadata inputs (optional)       │
│  - Auto-detect file type            │
│  - Show current user as author      │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  fileService.uploadDocument()       │
│  - Upload file to storage           │
│  - Extract source_type from ext     │
│  - Create document record with:     │
│    • title (from filename)          │
│    • source_type (from extension)   │
│    • doc_version (from form)        │
│    • source_url (from form)         │
│    • doc_date (from form)           │
│    • author_id (current user UUID)  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  documents table                    │
│  Record saved with all metadata     │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Chunk Extraction                   │
│  (happens later)                    │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Dimension Generation               │
│  - Fetch document metadata          │
│  - Map author_id to full name       │
│  - Pass metadata to generator       │
│  - 5 "Prior" dimensions populated   │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  chunk_dimensions table             │
│  All prior dimensions saved:        │
│  • doc_id, doc_title ✅             │
│  • doc_version ✅                   │
│  • source_type ✅                   │
│  • source_url ✅                    │
│  • author (name) ✅                 │
│  • doc_date ✅                      │
└─────────────────────────────────────┘
```

---

## Implementation Checklist

### Phase 1: Database Setup
- [ ] Run migration to add 4 new columns to `documents` table
- [ ] Verify columns exist with correct types
- [ ] Add index on `source_type` for performance
- [ ] Test with sample data

### Phase 2: Backend Service Update
- [ ] Locate `fileService.uploadDocument()` in `src/lib/database.ts`
- [ ] Add source type auto-detection logic
- [ ] Update function signature to accept optional metadata
- [ ] Update INSERT statement to include new fields
- [ ] Update TypeScript types for Document model
- [ ] Test service layer changes

### Phase 3: Dimension Generator Update
- [ ] Locate dimension generator in `src/lib/dimension-generation/generator.ts`
- [ ] Update author name resolution (line ~76)
- [ ] Add query to fetch user profile for author name
- [ ] Update documentMetadata object to include all fields
- [ ] Test that dimensions inherit document metadata

### Phase 4: Upload Form UI
- [ ] Locate upload form component
- [ ] Add 3 optional input fields (version, URL, date)
- [ ] Add auto-detection display for file type
- [ ] Add read-only author name display
- [ ] Add form validation for URL and date
- [ ] Style form consistently with existing UI
- [ ] Test form submission with and without optional fields

### Phase 5: Integration Testing
- [ ] Upload document with all metadata filled
- [ ] Upload document with no optional metadata (should work)
- [ ] Verify document record in database has all fields
- [ ] Run dimension generation
- [ ] Check dimension validation spreadsheet
- [ ] Verify 5 "Prior Generated" dimensions now populated
- [ ] Test author name resolution works correctly

---

## Expected Outcomes

### Before Implementation
- ❌ 5 dimensions missing: `doc_version`, `source_type`, `source_url`, `author`, `doc_date`
- ❌ Only filename captured, no provenance
- ❌ Author shown as UUID (not user-friendly)
- ❌ No way to track document versions

### After Implementation
- ✅ All 5 "Prior Generated" dimensions populated
- ✅ Complete document provenance tracking
- ✅ Human-readable author names in dimensions
- ✅ Professional upload form with optional metadata
- ✅ File type auto-detection working
- ✅ Document versioning support

---

## Technical Notes

### Source Type Mapping
The system supports these file types:
- **pdf** - PDF documents
- **docx** - Microsoft Word (doc, docx)
- **html** - Web pages (html, htm)
- **markdown** - Markdown files (md, txt)
- **json** - JSON data
- **spreadsheet** - Excel/CSV (csv, xlsx, xls)
- **other** - Any unrecognized type

### Optional Fields Strategy
All 3 new form fields (version, URL, date) are **optional** because:
1. Not all documents have versions
2. Not all documents come from URLs
3. Document date may not be known

The system should work perfectly fine with these fields empty (NULL in database).

### Author Name Fallback
Author name resolution has this fallback chain:
1. Try `user_profiles.full_name`
2. Try `user_profiles.email`
3. Fall back to `author_id` UUID

This ensures dimensions always have some author value.

---

## Future Enhancements

### Post-MVP Improvements
1. **Bulk Metadata Edit**: Allow editing document metadata after upload
2. **Metadata Templates**: Save metadata templates for repeated use
3. **Auto-extract from File**: Parse PDF metadata to pre-fill fields
4. **Version History**: Track document version changes over time
5. **URL Validation**: Verify source URLs are accessible
6. **Import from URL**: Directly import documents from URLs

---

## Related Documents
- Original analysis: `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_missing-dimensions_v1.md` (Section 1)
- Driver document: `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_dimensions-driver_v1.md`
- Database schema: `pmc/context-ai/pmct/c-alpha-build-spec_v3.3-SQL-fix.md`

---

**End of Document Upload Module Specification**

