# Chunks Alpha Build v3.4 - Regenerate Buttons Implementation
**Version:** 2.0 (Human Build Spec)  
**Date:** October 10, 2025  
**Module:** Document Chunks Management  
**Status:** Ready for Implementation

---

## Overview

This specification provides step-by-step instructions for implementing enhanced regeneration functionality in the Chunks Alpha platform. The implementation adds two distinct regeneration buttons with clear, separate workflows.

---

## Implementation Steps

### Step 1: Review Current State

Before starting implementation, review the current chunks dashboard at `\chunks\[documentId]` to understand:
- Existing "Regenerate All" button functionality
- Modal with template selection
- Run versioning system

**Current Files:**
- `C:\Users\james\Master\BrightHub\BRun\chunks-alpha\src\app\chunks\[documentId]\page.tsx` - Main dashboard component
- `C:\Users\james\Master\BrightHub\BRun\chunks-alpha\src\app\api\chunks\extract\route.ts` - Chunk extraction API
- `C:\Users\james\Master\BrightHub\BRun\chunks-alpha\src\app\api\chunks\regenerate\route.ts` - Dimension regeneration API (no changes needed)

### Step 2: Execute Implementation Prompt

Copy and paste the prompt below into a new Claude-4.5-sonnet Thinking context window in Cursor. This will implement all required changes.

---

## PROMPT FOR CLAUDE-4.5-SONNET IN CURSOR

Copy everything between the ==== and ++++ markers below:

====================



I need you to implement enhanced regeneration functionality for the Chunks Alpha document processing platform. You will modify two files to add two distinct regeneration buttons with different workflows.

## CONTEXT

The Chunks Alpha platform processes documents by:
1. Extracting text from documents
2. Breaking text into semantic chunks
3. Generating AI dimensions for each chunk using Claude API
4. Versioning each generation run with a unique run_id

Currently, there is one "Regenerate All" button that regenerates dimensions for existing chunks. We need to add a second workflow that re-extracts chunks from scratch.

## CURRENT FILE LOCATIONS

1. **Chunks Dashboard Page:** `C:\Users\james\Master\BrightHub\BRun\chunks-alpha\src\app\chunks\[documentId]\page.tsx`
2. **Extract API Route:** `C:\Users\james\Master\BrightHub\BRun\chunks-alpha\src\app\api\chunks\extract\route.ts`

## REQUIRED CHANGES

### Change 1: Add Two Distinct Buttons to Dashboard

**Location:** `C:\Users\james\Master\BrightHub\BRun\chunks-alpha\src\app\chunks\[documentId]\page.tsx`

**Current Button Section (around line 130-145):**
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

**Replace with:**
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

### Change 2: Add New Handler Functions

**Location:** `C:\Users\james\Master\BrightHub\BRun\chunks-alpha\src\app\chunks\[documentId]\page.tsx`

Find the existing `handleRegenerateAll` function (around line 200-210) and **replace it** with these three handler functions:

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
    const response = await fetch('\api\chunks\extract', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        documentId: params.documentId,
        forceReExtract: true,  // NEW: Forces deletion and re-extraction
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

// Keep this for backwards compatibility with individual chunk regeneration
const handleRegenerateAll = () => {
  handleRegenerateDimensionsOnly();
};
```

### Change 3: Update Modal Description

**Location:** `C:\Users\james\Master\BrightHub\BRun\chunks-alpha\src\app\chunks\[documentId]\page.tsx`

Find the `DialogDescription` in the regeneration modal (around line 350-355) and replace it with:

```typescript
<DialogDescription>
  {regenAllChunks 
    ? `This will regenerate dimensions for all ${totalChunks} existing chunks using AI analysis. The chunks themselves will not be modified.`
    : 'This will regenerate dimensions for the selected chunk using AI analysis.'}
</DialogDescription>
```

### Change 4: Modify Extract API to Support Force Re-Extraction

**Location:** `C:\Users\james\Master\BrightHub\BRun\chunks-alpha\src\app\api\chunks\extract\route.ts`

Replace the entire POST function with this updated version:

```typescript
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

## IMPLEMENTATION INSTRUCTIONS

Execute these changes in the following order:

1. **Update `C:\Users\james\Master\BrightHub\BRun\chunks-alpha\src\app\chunks\[documentId]\page.tsx`:**
   - Replace the button section as shown in Change 1
   - Replace/add the handler functions as shown in Change 2
   - Update the modal description as shown in Change 3

2. **Update `C:\Users\james\Master\BrightHub\BRun\chunks-alpha\src\app\api\chunks\extract\route.ts`:**
   - Replace the entire POST function as shown in Change 4

3. **Verify imports are present:**
   - Ensure `Grid3x3` is imported from 'lucide-react' in page.tsx
   - Ensure `chunkService` is imported in route.ts

## TESTING CHECKLIST

After implementation, verify:

1. **"Regenerate Dimensions" button:**
   - [ ] Opens modal with template selection
   - [ ] Regenerates dimensions for existing chunks
   - [ ] Creates new run_id
   - [ ] Does NOT delete chunks
   - [ ] Shows success toast
   - [ ] Refreshes data

2. **"Re-Extract & Regenerate" button:**
   - [ ] Shows confirmation dialog with warning
   - [ ] Deletes existing chunks when confirmed
   - [ ] Re-extracts chunks from document
   - [ ] Generates dimensions for new chunks
   - [ ] Shows progress toast
   - [ ] Refreshes page with new chunks
   - [ ] New chunks have different IDs than old chunks

3. **Individual chunk regenerate buttons:**
   - [ ] Still work as before
   - [ ] Open same modal
   - [ ] Regenerate single chunk

4. **Edge cases:**
   - [ ] Both buttons disabled while processing
   - [ ] Error handling works
   - [ ] Cancel button in modal works
   - [ ] Confirmation dialog "Cancel" works

## ERROR HANDLING

If you encounter errors:

1. **TypeScript errors about Grid3x3:**
   - Add to imports: `import { Grid3x3 } from 'lucide-react';`

2. **chunkService not found:**
   - Add to imports: `import { chunkService } from '../../../../lib/database';`

3. **forceReExtract parameter not recognized:**
   - Verify the extract API route was updated correctly
   - Check the JSON body includes `forceReExtract: true`

4. **Chunks not deleting:**
   - Check Supabase RLS policies allow deletion
   - Verify foreign key constraints are handled (dimensions deleted first)

## SUCCESS CRITERIA

Implementation is complete when:
- ✅ Two distinct buttons appear in the dashboard
- ✅ "Regenerate Dimensions" regenerates without touching chunks
- ✅ "Re-Extract & Regenerate" deletes chunks and creates new ones
- ✅ Confirmation dialog prevents accidental re-extraction
- ✅ Both workflows create new run_id values
- ✅ No TypeScript errors
- ✅ No runtime errors in browser console
- ✅ All test cases pass

Please execute all changes as specified above. Make sure to preserve all existing functionality while adding the new features.


+++++++++++++++++++++



---

## Verification Steps

After running the implementation prompt:

1. **Check for TypeScript errors:**
   ```bash
   npm run build
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Navigate to a document with chunks:**
   - Go to `http://localhost:3000/chunks\[any-document-id]`
   - Verify both buttons appear
   - Test both workflows

4. **Verify in Supabase:**
   - Check `chunks` table - verify chunks deleted/recreated
   - Check `chunk_dimensions` table - verify new run_id created
   - Check `chunk_runs` table - verify new run records

---

## Rollback Instructions

If you need to revert changes:

1. **Git reset (if using version control):**
   ```bash
   git checkout C:\Users\james\Master\BrightHub\BRun\chunks-alpha\src\app\chunks\[documentId]\page.tsx
   git checkout C:\Users\james\Master\BrightHub\BRun\chunks-alpha\src\app\api\chunks\extract\route.ts
   ```

2. **Manual rollback:**
   - Restore original "Regenerate All" button
   - Remove the `forceReExtract` logic from extract API
   - Remove new handler functions

---

## Success Metrics

✅ **Implementation Complete When:**
- Two distinct regeneration buttons visible
- Both workflows function correctly
- Run versioning preserved
- No breaking changes to existing features
- All tests pass
- No console errors

**Estimated Implementation Time:** 15-20 minutes

**Status:** Ready for Implementation  
**Last Updated:** October 10, 2025
