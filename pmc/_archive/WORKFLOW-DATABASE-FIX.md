# Workflow Database Integration Fix

## Issue
When clicking "Start Workflow" on an uploaded document, the system showed:
```
Error: Document not found
```

## Root Cause
The workflow page (`StepAServer` component) was only looking for documents in **mock data**, not in the **actual Supabase database** where uploaded documents are stored.

## Fix Applied

### File: `src/components/server/StepAServer.tsx`

**Before:**
```typescript
import { mockDocuments } from '../../data/mock-data'

async function getDocument(documentId: string) {
  const document = mockDocuments.find(doc => doc.id === documentId)
  if (!document) {
    throw new Error('Document not found')
  }
  return document
}
```

**After:**
```typescript
import { mockDocuments } from '../../data/mock-data'
import { createServerSupabaseClientWithAuth } from '../../lib/supabase-server'

async function getDocument(documentId: string) {
  // First, try to fetch from Supabase
  const supabase = await createServerSupabaseClientWithAuth()
  
  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single()
  
  if (error) {
    console.error('[StepAServer] Database error:', error)
    // Fallback to mock data for seed documents
    const mockDoc = mockDocuments.find(doc => doc.id === documentId)
    if (mockDoc) {
      return mockDoc
    }
    throw new Error('Document not found')
  }
  
  if (!document) {
    throw new Error('Document not found')
  }
  
  // Transform database document to match expected format
  let workflowStatus: 'pending' | 'categorizing' | 'completed' = 'pending';
  if (document.status === 'categorizing') {
    workflowStatus = 'categorizing';
  } else if (document.status === 'completed' && document.workflow_status === 'completed') {
    workflowStatus = 'completed';
  }
  
  return {
    id: document.id,
    title: document.title,
    content: document.extracted_text || document.content || '',
    summary: document.summary || '',
    createdAt: document.created_at,
    authorId: document.author_id,
    status: workflowStatus,
  }
}
```

## What Changed

### 1. Database Integration
- ✅ Now fetches documents from Supabase database
- ✅ Uses `createServerSupabaseClientWithAuth()` to respect user authentication
- ✅ Falls back to mock data for seed documents (doc-1, doc-2, doc-3)

### 2. Field Mapping
Database fields → Workflow fields:
- `extracted_text` → `content`
- `created_at` → `createdAt`
- `author_id` → `authorId`
- `status` → mapped to workflow status ('pending', 'categorizing', 'completed')

### 3. Status Mapping
Upload Status → Workflow Status:
- `completed` → `pending` (ready to start workflow)
- `categorizing` → `categorizing` (already in workflow)
- `completed` + `workflow_status='completed'` → `completed` (workflow done)

## Testing

### Test Case 1: Upload New Document
1. ✅ Upload a document
2. ✅ Wait for processing to complete (status: "completed")
3. ✅ Click "Start Workflow"
4. ✅ Document loads in workflow page
5. ✅ Content is displayed correctly

### Test Case 2: Seed Documents Still Work
1. ✅ Navigate to `/workflow/doc-1/stage1`
2. ✅ Mock seed document loads
3. ✅ Fallback works correctly

## Deployment

Push to Vercel:
```bash
git add src/components/server/StepAServer.tsx
git commit -m "Fix: Integrate workflow with Supabase database"
git push
```

## Impact

**Before:** Only seed documents (doc-1, doc-2, doc-3) worked in workflow
**After:** All uploaded documents can be processed through the workflow

This completes the integration between:
- ✅ Upload Module (stores in Supabase)
- ✅ Workflow Module (reads from Supabase)

---

**Status:** ✅ FIXED
**Ready:** Deploy to Vercel

