# Document Metadata Capture Implementation
**Version:** 2.0  
**Date:** October 8, 2025  
**Purpose:** Add document metadata fields to fix 5 missing "Prior Generated" dimensions  
**Estimated Time:** 90 minutes  
**Risk Level:** 🟡 MEDIUM (database + UI changes)

---

## Overview

The dimension generator expects document metadata fields (`doc_version`, `source_type`, `source_url`, `author`, `doc_date`) that are not currently captured during upload. This implementation adds database columns, updates the upload service, enhances the upload UI, and resolves author names for human-readable display.

**Impact:** Fixes 5 missing dimensions that should be inherited by all chunks from their document.

---

## Human Actions Required

Complete these 3 steps in order:

### STEP 1: Verify Database Columns (Required)

**Note:** If you already ran the ALTER TABLE migration from the driver spec, the columns and index already exist. Run this verification query to confirm, then optionally add documentation comments.

**Option A: If you already ran the migration** (most likely)

Run this to verify columns exist:



========================================================================================

-- Verify columns exist
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'documents'
  AND column_name IN ('doc_version', 'source_type', 'source_url', 'doc_date')
ORDER BY column_name;


++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



**Expected Result:** 4 rows showing the columns exist

If columns exist, optionally add documentation comments:



========================================================================================

-- Add documentation comments (optional but recommended)
COMMENT ON COLUMN documents.doc_version IS 'Document version tag or semver (e.g., v1.3.0, 2024-Q3, Draft)';
COMMENT ON COLUMN documents.source_type IS 'File format: pdf, docx, html, markdown, json, spreadsheet, other';
COMMENT ON COLUMN documents.source_url IS 'Original URL or canonical file path for provenance tracking';
COMMENT ON COLUMN documents.doc_date IS 'Original document creation/publication date (not upload date)';


++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



---

**Option B: If columns don't exist** (run full migration)



========================================================================================

-- =============================================================================
-- Add Document Metadata Columns
-- Purpose: Support comprehensive document metadata capture for dimension generation
-- Date: 2025-10-08
-- =============================================================================

ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS doc_version TEXT,
  ADD COLUMN IF NOT EXISTS source_type TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS doc_date TIMESTAMPTZ;

-- Add index on source_type for filtering
CREATE INDEX IF NOT EXISTS idx_documents_source_type ON documents(source_type);

-- Add comments for documentation
COMMENT ON COLUMN documents.doc_version IS 'Document version tag or semver (e.g., v1.3.0, 2024-Q3, Draft)';
COMMENT ON COLUMN documents.source_type IS 'File format: pdf, docx, html, markdown, json, spreadsheet, other';
COMMENT ON COLUMN documents.source_url IS 'Original URL or canonical file path for provenance tracking';
COMMENT ON COLUMN documents.doc_date IS 'Original document creation/publication date (not upload date)';


++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

---

### STEP 2: Update Upload Service (Required)

Copy this prompt into a NEW Cursor conversation with Claude-4.5-sonnet Thinking.



========================================================================================

# TASK: Update Document Upload Service to Capture Metadata

## Context
You are working on the Bright Run LoRA Training Data Platform. The dimension generator expects document metadata fields that are not currently captured during document upload. The database columns have been added, now we need to update the upload service to populate them.

**Background:**
- The dimension generator (already updated) expects these document fields:
  - `doc_version` - Document version tag
  - `source_type` - File format (pdf, docx, html, etc.)
  - `source_url` - Original URL/path
  - `doc_date` - Original document date
  - `author` - Human-readable author name (not just UUID)
- Database columns have been added via migration
- Upload UI will be updated separately to collect this data
- For now, we'll auto-detect `source_type` and leave others as NULL (to be added by UI later)

## Your Task
Update the document upload service to:
1. Auto-detect and save `source_type` from file extension
2. Accept optional metadata parameters (version, sourceUrl, docDate)
3. Update the function signature to accept metadata
4. Update all INSERT statements that create documents

---

## File 1: Update Upload Service

### File: `src/lib/database.ts`

**Find the `fileService` object (around line 394).**

**Current code:**
```typescript
export const fileService = {
  async uploadDocument(file: File, userId: string) {
    const fileName = `${userId}/${Date.now()}-${file.name}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;

    // Create document record
    const { data: documentData, error: documentError } = await supabase
      .from('documents')
      .insert({
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
        file_path: uploadData.path,
        file_size: file.size,
        author_id: userId,
        status: 'pending'
      })
      .select()
      .single();
    
    if (documentError) throw documentError;
    return documentData;
  },
  // ... other methods
};
```

**Replace with:**
```typescript
export const fileService = {
  async uploadDocument(
    file: File, 
    userId: string,
    metadata?: {
      version?: string;
      sourceUrl?: string;
      docDate?: string;  // ISO format date string
    }
  ) {
    const fileName = `${userId}/${Date.now()}-${file.name}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;

    // Auto-detect file type from extension
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

    // Create document record with metadata
    const { data: documentData, error: documentError } = await supabase
      .from('documents')
      .insert({
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
        file_path: uploadData.path,
        file_size: file.size,
        author_id: userId,
        status: 'pending',
        
        // NEW: Document metadata fields
        source_type: sourceType,
        doc_version: metadata?.version || null,
        source_url: metadata?.sourceUrl || null,
        doc_date: metadata?.docDate || null,
      })
      .select()
      .single();
    
    if (documentError) throw documentError;
    return documentData;
  },
  
  // Keep other methods unchanged
  async downloadDocument(path: string) {
    const { data, error } = await supabase.storage
      .from('documents')
      .download(path);
    
    if (error) throw error;
    return data;
  }
};
```

**Key Changes:**
1. Added `metadata` parameter (optional) with 3 fields
2. Added source type auto-detection logic
3. Added source type mapping for common file extensions
4. Updated INSERT to include all 4 new fields
5. `source_type` is always set (auto-detected)
6. Other 3 fields are NULL if not provided via metadata

---

## File 2: Update API Route (If Exists)

**Check if this file exists: `src/app/api/documents/route.ts`**

If it exists and has a POST handler that creates documents, update it similarly:

**Find the POST handler (around line 60):**

Look for any `supabase.from('documents').insert()` calls.

**Update the insert to include:**
```typescript
const { data: newDocument, error: insertError } = await supabase
  .from('documents')
  .insert({
    title,
    content,
    summary,
    author_id: user.id,
    status: 'pending',
    
    // NEW: Add metadata fields (will be NULL for API-created documents)
    source_type: 'api',  // Mark as API-created
    doc_version: body.doc_version || null,
    source_url: body.source_url || null,
    doc_date: body.doc_date || null,
  })
  .select()
  .single()
```

**Note:** API-created documents get `source_type: 'api'` since there's no file to detect from.

---

## Testing Instructions

### Test 1: Verify Code Compiles
```bash
npm run build
```
**Expected:** No TypeScript errors

### Test 2: Upload a Document
1. Go to upload page in your app
2. Upload a PDF file
3. Check browser console for success

### Test 3: Verify Database Record
In Supabase SQL Editor:
```sql
SELECT 
  id,
  title,
  source_type,
  doc_version,
  source_url,
  doc_date,
  created_at
FROM documents
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:** 
- New document has `source_type = 'pdf'` (auto-detected)
- Other metadata fields are NULL (until UI is updated)

### Test 4: Test Different File Types
Upload files with these extensions:
- `.pdf` → should set `source_type = 'pdf'`
- `.docx` → should set `source_type = 'docx'`
- `.md` → should set `source_type = 'markdown'`
- `.xlsx` → should set `source_type = 'spreadsheet'`
- `.xyz` → should set `source_type = 'other'`

---

## Success Criteria

- ✅ Code compiles without TypeScript errors
- ✅ Function signature updated to accept metadata parameter
- ✅ Source type auto-detection works correctly
- ✅ Documents can be uploaded without providing metadata (backward compatible)
- ✅ Database records show correct `source_type` values
- ✅ No breaking changes to existing functionality

---

## Troubleshooting

**Issue:** TypeScript error on metadata parameter  
**Solution:** Make sure the parameter is marked optional with `?`

**Issue:** "Column does not exist"  
**Solution:** Verify STEP 1 SQL migration was run successfully

**Issue:** File uploads fail  
**Solution:** Check that INSERT statement includes all required fields (title, author_id, status)

**Issue:** Source type shows 'other' for known file types  
**Solution:** Check that file extension is being extracted correctly (case-insensitive)


++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



---

### STEP 3: Update Dimension Generator for Author Names (Required)

Copy this prompt into a NEW Cursor conversation with Claude-4.5-sonnet Thinking.



========================================================================================

# TASK: Add Author Name Resolution to Dimension Generator

## Context
You are working on the Bright Run LoRA Training Data Platform. The dimension generator currently stores author as a UUID (`authorId`), but dimensions should show human-readable author names. The database already stores `author_id` as a UUID that references `user_profiles.id`, but we need to resolve this to a full name when generating dimensions.

**Background:**
- Documents have `author_id` column (UUID reference to user_profiles)
- Dimensions need `author` field with human-readable name
- Current code has a TODO comment about this (line 132)
- Generator already expects `author` in documentMetadata object
- We need to fetch the author's name from `user_profiles` table

**Important Context:**
The dimension generator uses a `documentMetadata` object (around line 130) that looks like this:
```typescript
const documentMetadata = {
  title: document?.title || 'Untitled Document',
  author: document?.authorId || null,  // TODO: Map authorId to human-readable name
  sourceType: document?.source_type || null,
  sourceUrl: document?.source_url || null,
  docDate: document?.doc_date || document?.createdAt || null,
  docVersion: document?.doc_version || null,
};
```

This metadata is passed to chunks and becomes part of their dimensions.

## Your Task
Update the dimension generator to:
1. Query the `user_profiles` table to get author's full name
2. Replace the UUID with a human-readable name
3. Have fallback logic if name is not available

---

## File: `src/lib/dimension-generation/generator.ts`

### Find the Section (around line 125-137)

**Current code:**
```typescript
// Get document metadata for inheritance
const docCategory = await documentCategoryService.getDocumentCategory(documentId);

// Get full document details for previously generated dimensions
const document = await chunkService.getDocumentById(documentId);
const documentMetadata = {
  title: document?.title || 'Untitled Document',
  author: document?.authorId || null,  // TODO: Map authorId to human-readable name
  sourceType: document?.source_type || null,
  sourceUrl: document?.source_url || null,
  docDate: document?.doc_date || document?.createdAt || null,
  docVersion: document?.doc_version || null,
};
```

**Replace with:**
```typescript
// Get document metadata for inheritance
const docCategory = await documentCategoryService.getDocumentCategory(documentId);

// Get full document details for previously generated dimensions
const document = await chunkService.getDocumentById(documentId);

// Resolve author name from user_profiles
let authorName: string | null = null;
if (document?.author_id) {
  try {
    const { data: supabase } = await import('../supabase');
    const { data: authorProfile, error } = await supabase
      .from('user_profiles')
      .select('full_name, email')
      .eq('id', document.author_id)
      .single();
    
    if (!error && authorProfile) {
      // Use full_name if available, otherwise email, otherwise UUID
      authorName = authorProfile.full_name || authorProfile.email || document.author_id;
    } else {
      // Fallback to UUID if query fails
      authorName = document.author_id;
    }
  } catch (error) {
    console.error('Failed to resolve author name:', error);
    // Fallback to UUID on error
    authorName = document.author_id;
  }
}

const documentMetadata = {
  title: document?.title || 'Untitled Document',
  author: authorName,  // Now human-readable
  sourceType: document?.source_type || null,
  sourceUrl: document?.source_url || null,
  docDate: document?.doc_date || document?.createdAt || null,
  docVersion: document?.doc_version || null,
};
```

**Key Changes:**
1. Added author name resolution before creating documentMetadata
2. Query `user_profiles` table using `author_id` from document
3. Try to use `full_name` first, then `email`, then fall back to UUID
4. Wrapped in try-catch to prevent failures if user_profiles query fails
5. Updated `author` field to use resolved name instead of UUID

**Fallback Logic:**
```
1. Try full_name from user_profiles
2. If no full_name, try email from user_profiles  
3. If query fails, use author_id (UUID)
4. If no author_id, use null
```

---

## Alternative: If user_profiles doesn't have full_name

If your `user_profiles` table uses different column names, adjust accordingly:

**Common column name variations:**
- `full_name`, `fullName`, `name`
- `display_name`, `displayName`
- `first_name` + `last_name`
- `username`

**Example for first_name + last_name:**
```typescript
const { data: authorProfile, error } = await supabase
  .from('user_profiles')
  .select('first_name, last_name, email')
  .eq('id', document.author_id)
  .single();

if (!error && authorProfile) {
  const fullName = [authorProfile.first_name, authorProfile.last_name]
    .filter(Boolean)
    .join(' ');
  authorName = fullName || authorProfile.email || document.author_id;
}
```

---

## Testing Instructions

### Test 1: Verify Code Compiles
```bash
npm run build
```
**Expected:** No TypeScript errors

### Test 2: Check Import Structure
Make sure supabase client can be imported. The code uses dynamic import:
```typescript
const { data: supabase } = await import('../supabase');
```

If this doesn't work, use the existing import at the top of the file instead.

### Test 3: Generate Dimensions
1. Upload a document (or use existing one)
2. Generate dimensions for that document
3. Check console output for any author resolution errors

### Test 4: Verify Dimension Data
In Supabase SQL Editor:
```sql
SELECT 
  chunk_id,
  doc_title,
  author,
  source_type,
  doc_version,
  source_url,
  doc_date
FROM chunk_dimensions
ORDER BY generated_at DESC
LIMIT 5;
```

**Expected:** 
- `author` field shows a name or email (not a UUID)
- Other document metadata fields are populated

---

## Success Criteria

- ✅ Code compiles without errors
- ✅ Author name resolution query executes successfully
- ✅ Dimensions show human-readable author names (not UUIDs)
- ✅ Fallback logic works if user_profiles query fails
- ✅ No breaking changes to dimension generation process

---

## Troubleshooting

**Issue:** "Cannot find module '../supabase'"  
**Solution:** Check the import path. Look at the top of generator.ts for how supabase is imported and use the same approach.

**Issue:** "Column full_name does not exist"  
**Solution:** Check your user_profiles table schema and adjust the SELECT query to use correct column names.

**Issue:** Author still shows UUID  
**Solution:** 
1. Check that user_profiles has a record for the author_id
2. Verify the query is executing (add console.log)
3. Check that full_name or email has a value in user_profiles

**Issue:** Dimension generation fails completely  
**Solution:** Make sure the try-catch is in place so author resolution failures don't break dimension generation.


++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



---

## Verification Queries

After completing all 3 steps, use these queries to verify everything works:

### Check Document Metadata


========================================================================================

SELECT 
  id,
  title,
  source_type,
  doc_version,
  source_url,
  doc_date,
  author_id,
  created_at
FROM documents
ORDER BY created_at DESC
LIMIT 10;


++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



### Check Dimension Population


========================================================================================

SELECT 
  chunk_id,
  doc_title,
  author,
  source_type,
  doc_version,
  source_url,
  doc_date,
  generated_at
FROM chunk_dimensions
WHERE doc_id IS NOT NULL
ORDER BY generated_at DESC
LIMIT 10;


++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



### Count Populated Metadata Fields


========================================================================================

SELECT 
  COUNT(*) as total_dimensions,
  COUNT(source_type) as has_source_type,
  COUNT(doc_version) as has_doc_version,
  COUNT(source_url) as has_source_url,
  COUNT(doc_date) as has_doc_date,
  COUNT(author) as has_author
FROM chunk_dimensions;


++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



---

## Summary

**What This Implementation Adds:**
- Database columns for document metadata (4 fields)
- Auto-detection of file type from extension
- Service layer support for optional metadata
- Author name resolution (UUID → human-readable)
- Foundation for UI metadata collection (next phase)

**Dimensions Fixed:** 5 out of 60
- `source_type` - Always populated (auto-detected)
- `doc_version` - NULL until UI added
- `source_url` - NULL until UI added
- `doc_date` - NULL until UI added
- `author` - Populated with human-readable name

**Risk Level:** 🟡 MEDIUM
- Database schema change (reversible)
- Service layer changes (backward compatible)
- Author resolution adds DB query (fallback on failure)

**Time Investment:** ~90 minutes
- 5 min: Run database migration
- 30 min: Update upload service
- 40 min: Update dimension generator
- 15 min: Test and verify

**Next Phase:** Add UI form fields to collect version, URL, and date from users during upload.

---

**End of Specification**

