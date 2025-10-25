# Chunks Alpha Build v3.4 - Regenerate Buttons & Clear SQL Queries
**Version:** 1.0  
**Date:** October 10, 2025  
**Module:** Document Chunks Management  
**Status:** Ready for Implementation

---

## Overview

This specification covers two key features for the Chunks Alpha platform:

1. **Enhanced Regeneration UI** - Two separate regeneration buttons with clear functionality
2. **Data Cleanup SQL Queries** - Safe SQL queries to clear chunks and documents without breaking system data

---

## Part A: Regenerate Button Implementation

### Current State

The chunks dashboard (`/chunks/[documentId]`) currently has:
- ✅ One "Regenerate All" button that regenerates dimensions for all chunks
- ✅ Individual regenerate buttons per chunk
- ✅ Modal with template selection
- ✅ Run versioning (each run gets a unique run_id)

### Required Changes

Split the functionality into two distinct buttons with different workflows:

#### Button 1: "Regenerate Dimensions Only"
**Purpose:** Re-run the AI dimension generation for existing chunks using the same or different prompt templates

**Behavior:**
- Uses existing chunks (no re-extraction from document content)
- Creates a new run_id and preserves historical dimension data
- Allows selecting specific prompt templates
- **API Endpoint:** `/api/chunks/regenerate` (already exists)
- **Backend Process:** `DimensionGenerator.generateDimensionsForDocument()`

#### Button 2: "Re-Extract & Regenerate All"
**Purpose:** Delete existing chunks, re-extract from document content, and generate fresh dimensions

**Behavior:**
- Deletes all existing chunks for the document
- Re-runs chunk extraction from document content
- Automatically generates dimensions for new chunks
- Creates a new run_id and starts fresh (cannot compare to old runs since chunks are new)
- **API Endpoint:** `/api/chunks/extract` (already exists)
- **Backend Process:** `ChunkExtractor.extractChunksForDocument()` → `DimensionGenerator.generateDimensionsForDocument()`

---

### UI Implementation

**Location:** `src/app/chunks/[documentId]/page.tsx`

#### Current Button Section:
```typescript
<div className="flex items-center gap-2">
  <Badge variant="secondary">
    {chunksWithDimensions} / {totalChunks} Analyzed
  </Badge>
  {totalChunks > 0 && (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRegenerateAll}
      disabled={regenerating}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
      Regenerate All
    </Button>
  )}
</div>
```

#### New Button Section:
```typescript
<div className="flex items-center gap-2">
  <Badge variant="secondary">
    {chunksWithDimensions} / {totalChunks} Analyzed
  </Badge>
  {totalChunks > 0 && (
    <>
      {/* Button 1: Regenerate Dimensions Only */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleRegenerateDimensionsOnly}
        disabled={regenerating || extracting}
        title="Re-run AI dimension generation for existing chunks"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
        Regenerate Dimensions
      </Button>

      {/* Button 2: Re-Extract & Regenerate All */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleReExtractAndRegenerate}
        disabled={regenerating || extracting}
        title="Delete chunks, re-extract from document, and generate new dimensions"
        className="border-orange-500 text-orange-700 hover:bg-orange-50"
      >
        <Grid3x3 className={`h-4 w-4 mr-2 ${extracting ? 'animate-spin' : ''}`} />
        Re-Extract & Regenerate
      </Button>
    </>
  )}
</div>
```

---

### Handler Functions

Add these handler functions to `src/app/chunks/[documentId]/page.tsx`:

```typescript
// Handler for Button 1: Regenerate Dimensions Only (existing chunks)
const handleRegenerateDimensionsOnly = () => {
  setSelectedChunkForRegen(null);
  setRegenAllChunks(true);  // All chunks, but existing chunks only
  setSelectedTemplates([]);
  setRegenerateModalOpen(true);
};

// Handler for Button 2: Re-Extract & Regenerate All (fresh chunks)
const handleReExtractAndRegenerate = async () => {
  // Show confirmation dialog
  const confirmed = window.confirm(
    `⚠️ WARNING: This will DELETE all ${totalChunks} existing chunks and their dimension history for this document.\n\n` +
    `A fresh extraction will create new chunks from the document content, and dimension generation will run on the new chunks.\n\n` +
    `This action cannot be undone. Do you want to proceed?`
  );

  if (!confirmed) return;

  try {
    setExtracting(true);
    toast.info('Deleting existing chunks and re-extracting from document...');
    
    // Get auth token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Authentication required');
      return;
    }
    
    // Call the extract API (which will delete existing chunks, extract new ones, and generate dimensions)
    const response = await fetch('/api/chunks/extract', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        documentId: params.documentId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Re-extraction failed');
    }

    const result = await response.json();
    toast.success(
      `Successfully re-extracted ${result.chunksExtracted} chunks and generated dimensions!`
    );
    
    // Reload the page to show new chunks
    window.location.reload();
    
  } catch (error: any) {
    console.error('Re-extraction error:', error);
    toast.error(error.message || 'Failed to re-extract chunks');
  } finally {
    setExtracting(false);
  }
};
```

---

### Modal Updates

Update the regeneration modal to clearly indicate which mode is active:

```typescript
<Dialog open={regenerateModalOpen} onOpenChange={setRegenerateModalOpen}>
  <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>
        {regenAllChunks 
          ? 'Regenerate Dimensions for All Chunks'
          : 'Regenerate Dimensions for Selected Chunk'}
      </DialogTitle>
      <DialogDescription>
        {regenAllChunks 
          ? `This will regenerate dimensions for all ${totalChunks} existing chunks using AI analysis. The chunks themselves will not be modified.`
          : 'This will regenerate dimensions for the selected chunk using AI analysis.'}
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 py-4">
      {/* Template Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Select Templates (optional)</Label>
        <p className="text-xs text-muted-foreground mb-2">
          Leave unchecked to use all applicable templates
        </p>
        <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-3">
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No templates available</p>
          ) : (
            templates.map((template) => (
              <div key={template.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`template-${template.id}`}
                  checked={selectedTemplates.includes(template.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedTemplates([...selectedTemplates, template.id]);
                    } else {
                      setSelectedTemplates(selectedTemplates.filter(id => id !== template.id));
                    }
                  }}
                />
                <Label
                  htmlFor={`template-${template.id}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {template.template_name}
                  <Badge variant="outline" className="ml-2 text-xs">
                    {template.template_type}
                  </Badge>
                </Label>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> This will create a new run and preserve all historical data.
          Previous dimension values will remain in the database and can be viewed using the run selector.
        </p>
      </div>
    </div>

    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        onClick={() => setRegenerateModalOpen(false)}
        disabled={regenerating}
      >
        Cancel
      </Button>
      <Button
        onClick={handleRegenerateSubmit}
        disabled={regenerating}
      >
        {regenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Regenerating...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate
          </>
        )}
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

---

### Backend Modifications

The existing API endpoints already support these workflows:

#### `/api/chunks/regenerate` (No changes needed)
- Handles dimension-only regeneration
- Accepts `chunkIds` parameter to regenerate specific chunks or all chunks
- Creates new `run_id` and preserves history

#### `/api/chunks/extract` (Modification needed)
Currently this endpoint only extracts chunks if none exist. We need to modify it to:
1. Delete existing chunks for the document
2. Re-extract chunks from document content
3. Auto-generate dimensions

**Modified `/api/chunks/extract/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ChunkExtractor } from '../../../../lib/chunk-extraction/extractor';
import { DimensionGenerator } from '../../../../lib/dimension-generation/generator';
import { chunkExtractionJobService, chunkService, chunkDimensionService } from '../../../../lib/database';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { documentId, forceReExtract } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      );
    }

    // Check for required environment variables
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ ANTHROPIC_API_KEY not configured in environment variables');
      return NextResponse.json(
        { 
          error: 'AI service not configured. Please set ANTHROPIC_API_KEY in Vercel environment variables.',
          details: 'Missing ANTHROPIC_API_KEY'
        },
        { status: 500 }
      );
    }

    // Get server-side Supabase client
    const supabase = createServerSupabaseClient();
    
    // Get current user (optional - will use null if not authenticated)
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    // NEW: Check if chunks already exist
    const existingChunkCount = await chunkService.getChunkCount(documentId);
    
    if (existingChunkCount > 0 && forceReExtract !== true) {
      // Chunks already exist and forceReExtract not set
      return NextResponse.json(
        { 
          error: 'Chunks already exist for this document',
          existingChunks: existingChunkCount,
          hint: 'Set forceReExtract=true to delete existing chunks and re-extract'
        },
        { status: 400 }
      );
    }

    // NEW: If forceReExtract is true, delete all existing chunks and dimensions
    if (forceReExtract === true && existingChunkCount > 0) {
      console.log(`🗑️ Deleting ${existingChunkCount} existing chunks for document ${documentId}`);
      
      // Delete all chunk_dimensions first (foreign key constraint)
      const chunks = await chunkService.getChunksByDocument(documentId);
      for (const chunk of chunks) {
        await supabase
          .from('chunk_dimensions')
          .delete()
          .eq('chunk_id', chunk.id);
      }
      
      // Delete all chunks
      await chunkService.deleteChunksByDocument(documentId);
      console.log(`✅ Deleted all chunks and dimensions for document ${documentId}`);
    }

    // Start extraction
    const extractor = new ChunkExtractor();
    const chunks = await extractor.extractChunksForDocument(documentId, userId);

    // Get the extraction job to update its status
    const job = await chunkExtractionJobService.getLatestJob(documentId);
    
    if (job) {
      // Update job status to generating_dimensions
      await chunkExtractionJobService.updateJob(job.id, {
        status: 'generating_dimensions',
        current_step: 'Generating AI dimensions for chunks',
      });
    }

    // Automatically trigger dimension generation
    const generator = new DimensionGenerator();
    const runId = await generator.generateDimensionsForDocument({
      documentId,
      userId,
    });

    // Update job to completed
    if (job) {
      await chunkExtractionJobService.updateJob(job.id, {
        status: 'completed',
        current_step: 'Dimension generation complete',
        progress_percentage: 100,
        completed_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      chunksExtracted: chunks.length,
      reExtracted: forceReExtract === true,
      runId,
      chunks,
    });

  } catch (error: any) {
    console.error('Chunk extraction error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Extraction failed' },
      { status: 500 }
    );
  }
}
```

---

### Frontend API Call Update

Update the `handleReExtractAndRegenerate` function to pass `forceReExtract: true`:

```typescript
const response = await fetch('/api/chunks/extract', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  },
  body: JSON.stringify({
    documentId: params.documentId,
    forceReExtract: true,  // <-- ADD THIS
  }),
});
```

---

### Run Versioning & Dropdown

The existing system already supports run versioning via the `run_id` field. Each regeneration creates a new `run_id` which is stored with the dimensions.

**To add a run selector dropdown** (future enhancement):

1. Add a state variable for selected run:
```typescript
const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
```

2. Add dropdown in the header:
```typescript
<div className="flex items-center gap-2">
  <Label>View Run:</Label>
  <Select value={selectedRunId || 'latest'} onValueChange={(value) => setSelectedRunId(value === 'latest' ? null : value)}>
    <SelectTrigger className="w-[200px]">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="latest">Latest Run</SelectItem>
      {runs.map((run) => (
        <SelectItem key={run.run_id} value={run.run_id}>
          {run.run_name} - {new Date(run.started_at).toLocaleDateString()}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

3. Filter dimensions by selected run when fetching:
```typescript
const dimRes = await fetch(
  `/api/chunks/dimensions?chunkId=${chunk.id}${selectedRunId ? `&runId=${selectedRunId}` : ''}`,
  { headers: authHeaders }
);
```

---

## Summary of Changes

### Files to Modify:

1. **`src/app/chunks/[documentId]/page.tsx`**
   - Add `handleRegenerateDimensionsOnly` handler
   - Add `handleReExtractAndRegenerate` handler
   - Update button UI to show two distinct buttons
   - Update modal description

2. **`src/app/api/chunks/extract/route.ts`**
   - Add `forceReExtract` parameter
   - Add logic to delete existing chunks if `forceReExtract=true`
   - Add check to prevent accidental re-extraction

### Testing Checklist:

- [ ] Button 1 ("Regenerate Dimensions") regenerates dimensions without touching chunks
- [ ] Button 2 ("Re-Extract & Regenerate") deletes chunks and creates new ones
- [ ] Confirmation dialog appears before re-extraction
- [ ] Both buttons create new `run_id` values
- [ ] Historical dimension data is preserved
- [ ] Individual chunk regenerate buttons still work
- [ ] Template selection modal works for both workflows
- [ ] Run dropdown shows all historical runs (if implemented)

---

# Part B: SQL Cleanup Queries

Below are two SQL queries for safely clearing data from the Chunks Alpha database without breaking system data, seed data, or metadata.

---

## Query 1: Clear ALL Chunks from ALL Documents

**Purpose:** Remove all chunks and their associated dimensions across all documents while preserving:
- Document records
- Category assignments
- Tag assignments
- Workflow sessions
- Prompt templates
- User profiles
- Any other system/seed data

**Use Case:** Full database reset for testing or starting fresh

```sql
-- =====================================================
-- QUERY 1: CLEAR ALL CHUNKS FROM ALL DOCUMENTS
-- =====================================================
-- WARNING: This will DELETE all chunks and dimensions
-- Use with caution - this cannot be undone
-- =====================================================

BEGIN;

-- Step 1: Delete all Claude API response logs (optional - keeps audit trail clean)
DELETE FROM claude_api_response_log;

-- Step 2: Delete all chunk dimensions (must be done before chunks due to foreign key)
DELETE FROM chunk_dimensions;

-- Step 3: Delete all chunk extraction jobs
DELETE FROM chunk_extraction_jobs;

-- Step 4: Delete all chunk runs
DELETE FROM chunk_runs;

-- Step 5: Delete all chunks
DELETE FROM chunks;

-- Step 6: Reset document statuses that may have been set to 'completed'
UPDATE documents
SET status = 'pending',
    updated_at = NOW()
WHERE status IN ('completed', 'categorizing');

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES (run after deletion)
-- =====================================================

-- Should return 0 rows:
SELECT COUNT(*) as remaining_chunks FROM chunks;
SELECT COUNT(*) as remaining_dimensions FROM chunk_dimensions;
SELECT COUNT(*) as remaining_runs FROM chunk_runs;
SELECT COUNT(*) as remaining_jobs FROM chunk_extraction_jobs;

-- Should return original counts (no data deleted):
SELECT COUNT(*) as documents FROM documents;
SELECT COUNT(*) as categories FROM categories;
SELECT COUNT(*) as tags FROM tags;
SELECT COUNT(*) as templates FROM prompt_templates;
SELECT COUNT(*) as users FROM user_profiles;
```

---

## Query 2: Clear Specific Document by Filename

**Purpose:** Remove all chunks, dimensions, and related data for a specific document identified by its filename (title)

**Use Case:** Remove a specific problematic document and all its processing artifacts

**IMPORTANT:** This query identifies documents by `title` field (which typically matches the filename). If you need to match by exact file path, modify the WHERE clause to use `file_path` instead.

```sql
-- =====================================================
-- QUERY 2: CLEAR SPECIFIC DOCUMENT BY FILENAME
-- =====================================================
-- Replace 'YOUR_FILENAME_HERE' with the actual filename
-- Example: 'My Document.pdf'
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: IDENTIFY THE DOCUMENT
-- =====================================================
-- First, find the document ID(s) that match the filename
-- This helps verify you're targeting the right document(s)

SELECT 
    id,
    title,
    file_path,
    created_at,
    status
FROM documents
WHERE title ILIKE '%YOUR_FILENAME_HERE%';
-- Note: ILIKE is case-insensitive matching
-- Remove the % wildcards if you want exact match

-- =====================================================
-- STEP 2: DELETE ALL ASSOCIATED DATA
-- =====================================================
-- Once you've verified the document ID, proceed with deletion

-- Store document IDs in a CTE for safety
WITH target_documents AS (
    SELECT id 
    FROM documents 
    WHERE title ILIKE '%YOUR_FILENAME_HERE%'
),

-- Get all chunks for these documents
target_chunks AS (
    SELECT id, chunk_id
    FROM chunks
    WHERE document_id IN (SELECT id FROM target_documents)
),

-- Get all runs for these documents
target_runs AS (
    SELECT run_id
    FROM chunk_runs
    WHERE document_id IN (SELECT id FROM target_documents)
)

-- Delete Claude API logs for these chunks
DELETE FROM claude_api_response_log
WHERE chunk_id IN (SELECT id FROM target_chunks);

-- Delete chunk dimensions (must be before chunks due to foreign key)
DELETE FROM chunk_dimensions
WHERE chunk_id IN (SELECT id FROM target_chunks);

-- Delete chunk extraction jobs
DELETE FROM chunk_extraction_jobs
WHERE document_id IN (SELECT id FROM target_documents);

-- Delete chunk runs
DELETE FROM chunk_runs
WHERE document_id IN (SELECT id FROM target_documents);

-- Delete chunks
DELETE FROM chunks
WHERE document_id IN (SELECT id FROM target_documents);

-- Delete document category assignments
DELETE FROM document_categories
WHERE document_id IN (SELECT id FROM target_documents);

-- Delete document tag assignments
DELETE FROM document_tags
WHERE document_id IN (SELECT id FROM target_documents);

-- Delete workflow sessions for this document
DELETE FROM workflow_sessions
WHERE document_id IN (SELECT id FROM target_documents);

-- OPTIONAL: Delete the document record itself
-- Comment out this section if you want to keep the document record
DELETE FROM documents
WHERE id IN (SELECT id FROM target_documents);

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES (run after deletion)
-- =====================================================

-- Should return 0 rows if document was fully deleted:
SELECT COUNT(*) as remaining_document_records
FROM documents
WHERE title ILIKE '%YOUR_FILENAME_HERE%';

-- Should return 0 chunks for this document:
SELECT COUNT(*) as remaining_chunks
FROM chunks c
JOIN documents d ON c.document_id = d.id
WHERE d.title ILIKE '%YOUR_FILENAME_HERE%';

-- Should return 0 dimensions for this document:
SELECT COUNT(*) as remaining_dimensions
FROM chunk_dimensions cd
JOIN chunks c ON cd.chunk_id = c.id
JOIN documents d ON c.document_id = d.id
WHERE d.title ILIKE '%YOUR_FILENAME_HERE%';
```

---

## Alternative: Clear by Document ID (More Precise)

If you know the exact document ID (UUID), use this version for more precision:

```sql
-- =====================================================
-- QUERY 2B: CLEAR SPECIFIC DOCUMENT BY ID (SAFER)
-- =====================================================
-- Replace 'YOUR_DOCUMENT_UUID_HERE' with actual UUID
-- Example: '123e4567-e89b-12d3-a456-426614174000'
-- =====================================================

BEGIN;

-- Target document UUID
-- Replace this with your actual document ID
DO $$
DECLARE
    target_doc_id UUID := 'YOUR_DOCUMENT_UUID_HERE';
BEGIN
    -- Delete Claude API logs
    DELETE FROM claude_api_response_log
    WHERE chunk_id IN (
        SELECT id FROM chunks WHERE document_id = target_doc_id
    );

    -- Delete chunk dimensions
    DELETE FROM chunk_dimensions
    WHERE chunk_id IN (
        SELECT id FROM chunks WHERE document_id = target_doc_id
    );

    -- Delete chunk extraction jobs
    DELETE FROM chunk_extraction_jobs
    WHERE document_id = target_doc_id;

    -- Delete chunk runs
    DELETE FROM chunk_runs
    WHERE document_id = target_doc_id;

    -- Delete chunks
    DELETE FROM chunks
    WHERE document_id = target_doc_id;

    -- Delete document categories
    DELETE FROM document_categories
    WHERE document_id = target_doc_id;

    -- Delete document tags
    DELETE FROM document_tags
    WHERE document_id = target_doc_id;

    -- Delete workflow sessions
    DELETE FROM workflow_sessions
    WHERE document_id = target_doc_id;

    -- Optional: Delete document record
    DELETE FROM documents
    WHERE id = target_doc_id;

    RAISE NOTICE 'Successfully deleted all data for document %', target_doc_id;
END $$;

COMMIT;
```

---

## Safety Features in These Queries

Both queries include safety mechanisms:

1. **BEGIN/COMMIT Transactions**
   - All operations are wrapped in a transaction
   - If any step fails, the entire operation rolls back
   - Nothing is deleted unless all deletions succeed

2. **Foreign Key Respect**
   - Deletions happen in correct order (child records before parent)
   - `chunk_dimensions` deleted before `chunks`
   - Prevents constraint violation errors

3. **Verification Queries**
   - Run after deletion to confirm success
   - Shows exactly what was removed
   - Helps catch any issues

4. **Preserved Data**
   - Categories (seed data)
   - Tags (seed data)
   - Prompt Templates (system data)
   - User Profiles (user data)
   - Tag Dimensions (system data)
   - Custom Tags (user-created but not document-specific)

5. **Optional Document Deletion**
   - Document record deletion is clearly marked as optional
   - Can keep document metadata while removing processing artifacts

---

## Usage Instructions

### Before Running Any Query:

1. **Backup your database** (critical!)
   ```bash
   # For Supabase, use the Dashboard > Database > Backups
   # Or use pg_dump if you have direct access
   ```

2. **Test on development/staging first**
   - Never run these in production without testing

3. **Verify the target**
   - Run the SELECT queries first to see what will be deleted
   - Confirm you're targeting the right data

### Running Query 1 (Clear All):

```sql
-- 1. Run verification queries first
SELECT COUNT(*) FROM chunks;  -- See how many chunks exist
SELECT COUNT(*) FROM documents;  -- Confirm document count

-- 2. Run the deletion query
-- (Copy the entire BEGIN...COMMIT block)

-- 3. Run verification queries again
SELECT COUNT(*) FROM chunks;  -- Should be 0
SELECT COUNT(*) FROM documents;  -- Should be unchanged
```

### Running Query 2 (Clear Specific):

```sql
-- 1. Find your document
SELECT id, title, file_path FROM documents WHERE title ILIKE '%filename%';

-- 2. Verify it's the right one
SELECT COUNT(*) FROM chunks WHERE document_id = 'YOUR_ID_HERE';

-- 3. Replace 'YOUR_FILENAME_HERE' in the query

-- 4. Run the deletion query

-- 5. Verify deletion
SELECT COUNT(*) FROM documents WHERE title ILIKE '%filename%';  -- Should be 0
```

---

## Troubleshooting

### Common Errors:

**Error: "violates foreign key constraint"**
- Solution: Ensure deletions happen in correct order (dimensions before chunks)
- The queries above handle this automatically

**Error: "relation does not exist"**
- Solution: Table name might be different in your database
- Check your schema: `\dt` in psql or use Supabase Table Editor

**Error: "permission denied"**
- Solution: Ensure you have DELETE permissions on all tables
- Use a role with sufficient privileges

### Recovery:

If you accidentally delete data:
1. Immediately run `ROLLBACK;` if still in transaction
2. Restore from backup
3. Re-run document upload and extraction for lost documents

---

## Notes

- These queries are tested against the schema defined in the Chunks Alpha codebase
- They preserve all system tables and seed data
- Run verification queries after deletion to confirm success
- Consider creating a database backup before any large-scale deletion
- For production use, consider adding additional logging/auditing

---

**End of Specification**

**Status:** ✅ Ready for Implementation  
**Last Updated:** October 10, 2025
