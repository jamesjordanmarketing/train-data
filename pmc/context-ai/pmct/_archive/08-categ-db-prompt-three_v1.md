# PROMPT 3: Display Layer Integration for Normalized Database

**Context:** Prompts 1 and 2 have been successfully completed. The database service layer exists and the API successfully writes to normalized tables (`document_categories`, `document_tags`, `custom_tags`). Now we need to implement the **display/read layer** to fetch and display data from these normalized tables.

**Goal:** Enable the application to retrieve workflow data from normalized database tables and display it on the webpage, completing the full read-write cycle.

---

## Current State After Prompt 2

✅ **Database Layer (Prompt 1):**
- `documentCategoryService` - Category operations
- `documentTagService` - Tag operations  
- `customTagService` - Custom tag operations
- `workflowService.completeWorkflow()` - Writes to normalized tables
- `workflowService.getWorkflowWithRelations()` - **Exists but not being used**

✅ **API Write Layer (Prompt 2):**
- `/api/workflow` POST with `action: 'submit'` writes to normalized tables
- Feature flag `NEXT_PUBLIC_USE_NORMALIZED_TAGS` controls normalized vs JSONB writes
- Transformation function `transformTagsToNormalized()` converts frontend → database format
- Store helper methods `getTagsForSubmission()` and `loadTagsFromNormalized()` added

❌ **Display Layer (Missing - THIS PROMPT):**
- Workflow completion page uses **in-memory Zustand store** data
- Server components use **mock data**, not database queries
- No retrieval from normalized tables
- No transformation from database → display format

---

## What This Prompt Will Accomplish

After this prompt, the system will:
1. ✅ Write form inputs to normalized tables (already working)
2. ✅ Read workflow data from normalized tables (NEW)
3. ✅ Display saved workflow data on completion page (NEW)
4. ✅ Support page refresh showing real database data (NEW)
5. ✅ Enable viewing historical workflows from database (NEW)

---

## Files to Modify

### File 1: `src/app/api/workflow/session/route.ts`
**Purpose:** Add support for fetching workflow with normalized data

**Current:** Only fetches by `documentId`, returns workflow_sessions row with JSONB data

**Changes Needed:**
1. Add support for `workflowId` query parameter
2. When `workflowId` provided AND normalized flag is true, fetch from normalized tables
3. Transform normalized data back to frontend format
4. Return enriched workflow data with category and tag details

### File 2: `src/components/server/WorkflowCompleteServer.tsx`  
**Purpose:** Fetch real workflow data from database instead of mock data

**Current:** Uses mock documents and generates fake workflow summary

**Changes Needed:**
1. Accept `workflowId` prop from page component
2. Call database to fetch real document data
3. Call API to fetch workflow data from normalized tables
4. Transform normalized tags to display format
5. Pass real data to client component

### File 3: `src/components/client/WorkflowCompleteClient.tsx`
**Purpose:** Display database data when provided, fall back to store when not

**Current:** Always reads from Zustand store

**Changes Needed:**
1. Accept optional `workflowData` prop with database data
2. If `workflowData` provided, use it; otherwise use Zustand store
3. Handle both data sources seamlessly
4. Update interfaces to support database format

### File 4: `src/app/(workflow)/workflow/[documentId]/complete/page.tsx`
**Purpose:** Pass workflow ID to server component

**Current:** Only passes `documentId`

**Changes Needed:**
1. Accept `searchParams` for `workflowId`
2. Pass `workflowId` to WorkflowCompleteServer

---

## Detailed Implementation Instructions

### STEP 1: Update API Route for Normalized Data Retrieval

**File:** `src/app/api/workflow/session/route.ts`

Add after existing imports:
```typescript
import { workflowService } from '../../../../lib/database'
import { createClient } from '@supabase/supabase-js'

/**
 * Reverse dimension mapping: UUID → frontend key
 */
const dimensionIdToKey: Record<string, string> = {
  '550e8400-e29b-41d4-a716-446655440003': 'authorship',
  '550e8400-e29b-41d4-a716-446655440004': 'format',
  '550e8400-e29b-41d4-a716-446655440005': 'disclosure-risk',
  '550e8400-e29b-41d4-a716-446655440006': 'intended-use',
  '550e8400-e29b-41d4-a716-446655440021': 'evidence-type',
  '550e8400-e29b-41d4-a716-446655440022': 'audience-level',
  '550e8400-e29b-41d4-a716-446655440023': 'gating-level'
};

/**
 * Transform normalized tags to frontend display format
 * Converts: [{ tag_id: 'uuid', dimension_id: 'uuid' }] → { 'dimension-key': ['tag-uuid'] }
 */
function transformNormalizedToDisplay(normalizedTags: any[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  
  normalizedTags.forEach(tagAssignment => {
    const dimensionKey = dimensionIdToKey[tagAssignment.dimension_id];
    if (!dimensionKey) {
      console.warn(`Unknown dimension ID: ${tagAssignment.dimension_id}`);
      return;
    }
    
    if (!grouped[dimensionKey]) {
      grouped[dimensionKey] = [];
    }
    grouped[dimensionKey].push(tagAssignment.tag_id);
  });
  
  return grouped;
}
```

Replace the entire GET function:
```typescript
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required', success: false },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Create authenticated Supabase client
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error', success: false },
        { status: 500 }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication', success: false },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')
    const workflowId = searchParams.get('workflowId')
    const useNormalized = process.env.NEXT_PUBLIC_USE_NORMALIZED_TAGS === 'true'

    // Case 1: Fetch specific workflow by ID with normalized data
    if (workflowId && useNormalized) {
      try {
        console.log('Fetching workflow with normalized data:', workflowId)
        
        // Use workflowService to get complete workflow with relations
        const workflowData = await workflowService.getWorkflowWithRelations(workflowId)
        
        // Transform normalized tags to frontend format
        const displayTags = transformNormalizedToDisplay(workflowData.tags.raw)
        
        // Build enriched response
        const enrichedWorkflow = {
          ...workflowData.session,
          category: workflowData.category?.categories || null,
          selectedTags: displayTags,
          normalizedTags: workflowData.tags.raw,
          normalizedCategory: workflowData.category
        }
        
        return NextResponse.json({
          session: enrichedWorkflow,
          success: true,
          source: 'normalized'
        })
      } catch (error) {
        console.error('Error fetching normalized workflow:', error)
        return NextResponse.json(
          { error: 'Failed to fetch workflow', success: false },
          { status: 500 }
        )
      }
    }

    // Case 2: Fetch by documentId (existing behavior)
    if (documentId) {
      const { data: session, error } = await supabase
        .from('workflow_sessions')
        .select('*')
        .eq('document_id', documentId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Session fetch error:', error)
        return NextResponse.json(
          { error: 'Failed to fetch session', success: false },
          { status: 500 }
        )
      }

      return NextResponse.json({
        session: session || null,
        success: true,
        source: 'jsonb'
      })
    }

    return NextResponse.json(
      { error: 'Either documentId or workflowId is required', success: false },
      { status: 400 }
    )
  } catch (error) {
    console.error('Workflow Session API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session', success: false },
      { status: 500 }
    )
  }
}
```

---

### STEP 2: Update Server Component to Fetch Real Data

**File:** `src/components/server/WorkflowCompleteServer.tsx`

Replace entire file content:
```typescript
import { WorkflowCompleteClient } from '../client/WorkflowCompleteClient'
import { tagDimensions } from '../../data/mock-data'
import { documentService } from '../../lib/database'

interface Props {
  documentId: string
  workflowId?: string
}

/**
 * Fetch document from database
 */
async function getDocument(documentId: string) {
  try {
    const document = await documentService.getById(documentId)
    return document
  } catch (error) {
    console.error('Error fetching document:', error)
    throw new Error('Document not found')
  }
}

/**
 * Fetch workflow data from API
 * If workflowId is provided, fetches from normalized tables
 */
async function getWorkflowData(workflowId?: string) {
  if (!workflowId) {
    return null
  }

  try {
    // Note: In server component, we need to make internal API call or use service directly
    // For now, we'll use the service layer directly since we're on the server
    const { workflowService } = await import('../../lib/database')
    
    const workflowData = await workflowService.getWorkflowWithRelations(workflowId)
    
    return workflowData
  } catch (error) {
    console.error('Error fetching workflow data:', error)
    return null
  }
}

export async function WorkflowCompleteServer({ documentId, workflowId }: Props) {
  const document = await getDocument(documentId)
  const workflowData = await getWorkflowData(workflowId)

  // Build workflow summary
  const workflowSummary = {
    workflowId: workflowId || `workflow_${documentId}_${Date.now()}`,
    submittedAt: workflowData?.session?.completed_at || new Date().toISOString(),
    processingEstimate: '5-10 minutes',
    status: workflowData?.session?.is_draft === false ? 'completed' : 'draft'
  }

  return (
    <WorkflowCompleteClient 
      document={document} 
      tagDimensions={tagDimensions}
      workflowSummary={workflowSummary}
      workflowData={workflowData}
    />
  )
}
```

---

### STEP 3: Update Client Component to Accept Database Data

**File:** `src/components/client/WorkflowCompleteClient.tsx`

Update the Props interface (around line 23):
```typescript
interface Props {
  document: WorkflowDocument
  tagDimensions: TagDimension[]
  workflowSummary: {
    workflowId: string
    submittedAt: string
    processingEstimate: string
    status: string
  }
  workflowData?: {  // NEW: Optional database workflow data
    session: any
    category: any
    tags: {
      raw: any[]
      byDimension: Record<string, any[]>
    }
  } | null
}
```

Update the component function (around line 34):
```typescript
export function WorkflowCompleteClient({ document, tagDimensions, workflowSummary, workflowData }: Props) {
  const router = useRouter()
  const workflowStore = useWorkflowStore()

  // Use database data if available, otherwise fall back to store
  const belongingRating = workflowData?.category?.belonging_rating ?? workflowStore.belongingRating
  const selectedCategory = workflowData?.category?.categories ?? workflowStore.selectedCategory
  
  // Transform normalized tags to display format if from database
  const selectedTags = React.useMemo(() => {
    if (workflowData?.tags?.raw && workflowData.tags.raw.length > 0) {
      // Transform normalized tags to frontend format
      const dimensionIdToKey: Record<string, string> = {
        '550e8400-e29b-41d4-a716-446655440003': 'authorship',
        '550e8400-e29b-41d4-a716-446655440004': 'format',
        '550e8400-e29b-41d4-a716-446655440005': 'disclosure-risk',
        '550e8400-e29b-41d4-a716-446655440006': 'intended-use',
        '550e8400-e29b-41d4-a716-446655440021': 'evidence-type',
        '550e8400-e29b-41d4-a716-446655440022': 'audience-level',
        '550e8400-e29b-41d4-a716-446655440023': 'gating-level'
      }

      const grouped: Record<string, string[]> = {}
      
      workflowData.tags.raw.forEach((tagAssignment: any) => {
        const dimensionKey = dimensionIdToKey[tagAssignment.dimension_id]
        if (!dimensionKey) return
        
        if (!grouped[dimensionKey]) {
          grouped[dimensionKey] = []
        }
        grouped[dimensionKey].push(tagAssignment.tag_id)
      })
      
      return grouped
    }
    
    return workflowStore.selectedTags
  }, [workflowData, workflowStore.selectedTags])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showProcessingDetails, setShowProcessingDetails] = useState(false)
```

Add import for React.useMemo at the top:
```typescript
import { useState, useMemo } from "react"
```

---

### STEP 4: Update Complete Page to Pass Workflow ID

**File:** `src/app/(workflow)/workflow/[documentId]/complete/page.tsx`

Replace entire file content:
```typescript
import { Suspense } from 'react'
import { WorkflowCompleteServer } from '../../../../../components/server/WorkflowCompleteServer'

interface Props {
  params: {
    documentId: string
  }
  searchParams: {
    workflowId?: string
  }
}

export default function CompletePage({ params, searchParams }: Props) {
  return (
    <div className="container mx-auto px-6 py-8">
      <Suspense fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-20 bg-muted rounded-full w-20 mx-auto"></div>
          <div className="h-8 bg-muted rounded w-1/2 mx-auto"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      }>
        <WorkflowCompleteServer 
          documentId={params.documentId}
          workflowId={searchParams.workflowId}
        />
      </Suspense>
    </div>
  )
}
```

---

### STEP 5: Update Submit Handler to Include Workflow ID in Redirect

**File:** `src/stores/workflow-store.ts`

Update the `submitWorkflow` function (around line 267):

Find this section:
```typescript
if (data.success) {
  // Mark as complete
  set({ 
    currentStep: 'complete',
    isDraft: false,
    completedSteps: ['A', 'B', 'C'],
    lastSaved: new Date().toISOString()
  });
}
```

Replace with:
```typescript
if (data.success) {
  // Mark as complete and store workflow ID for retrieval
  set({ 
    currentStep: 'complete',
    isDraft: false,
    completedSteps: ['A', 'B', 'C'],
    lastSaved: new Date().toISOString()
  });
  
  // Return workflow ID so it can be used in redirect
  return data.workflowId;
}
```

And update the function signature:
```typescript
submitWorkflow: async (): Promise<string | void> => {
```

---

### STEP 6: Update Workflow Complete Client Submit Handler

**File:** `src/components/client/WorkflowCompleteClient.tsx`

Update the `handleSubmit` function (around line 47):

Replace:
```typescript
const handleSubmit = async () => {
  setIsSubmitting(true)
  await submitWorkflow()
  setIsSubmitting(false)
  router.push('/dashboard')
}
```

With:
```typescript
const handleSubmit = async () => {
  setIsSubmitting(true)
  try {
    const workflowId = await workflowStore.submitWorkflow()
    setIsSubmitting(false)
    
    // If workflow was already submitted (workflowData exists), go to dashboard
    // Otherwise, refresh page with workflowId to show database data
    if (workflowData) {
      router.push('/dashboard')
    } else if (workflowId) {
      router.push(`/workflow/${document.id}/complete?workflowId=${workflowId}`)
    } else {
      router.push('/dashboard')
    }
  } catch (error) {
    console.error('Submit error:', error)
    setIsSubmitting(false)
  }
}
```

Update the import:
```typescript
const workflowStore = useWorkflowStore()
const { resetWorkflow } = workflowStore
```

---

## Testing Checklist

After implementing all changes:

### Test 1: Submit New Workflow
1. ✅ Complete workflow steps A, B, C
2. ✅ Submit workflow
3. ✅ Verify data appears in normalized tables:
   - Check `document_categories` for category and belonging rating
   - Check `document_tags` for all selected tags
   - Check `custom_tags` if custom tags were created
4. ✅ Verify completion page shows correct data
5. ✅ Refresh page - data should persist from database

### Test 2: Feature Flag Toggle
1. ✅ Set `NEXT_PUBLIC_USE_NORMALIZED_TAGS=false`
2. ✅ Submit workflow - should use JSONB (old method)
3. ✅ Set `NEXT_PUBLIC_USE_NORMALIZED_TAGS=true`
4. ✅ Submit workflow - should use normalized tables

### Test 3: Data Consistency
1. ✅ Submit workflow with complex tag selections
2. ✅ Verify all tags display correctly
3. ✅ Check database directly to confirm data matches display
4. ✅ Compare JSONB data vs normalized data (should be equivalent)

### Test 4: Error Handling
1. ✅ Test with invalid workflow ID
2. ✅ Test without authentication
3. ✅ Test with missing required fields
4. ✅ Verify appropriate error messages

---

## Success Criteria

After this prompt is complete:

1. ✅ Workflow submission writes to normalized tables (already working)
2. ✅ Completion page fetches data from normalized tables
3. ✅ Display shows correct category, tags, and belonging rating from database
4. ✅ Page refresh maintains data (no loss of information)
5. ✅ Historical workflows can be viewed by navigating to completion URL with workflowId
6. ✅ Feature flag controls normalized vs JSONB for both read and write
7. ✅ No TypeScript compilation errors
8. ✅ All existing functionality continues to work

---

## Environment Variables Required

Ensure these are set in `.env.local`:

```bash
# Enable normalized database structure
NEXT_PUBLIC_USE_NORMALIZED_TAGS=true

# Supabase configuration (should already exist)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

---

## Rollback Plan

If issues arise:

1. Set `NEXT_PUBLIC_USE_NORMALIZED_TAGS=false`
2. System reverts to JSONB storage and display
3. Debug normalized implementation
4. Re-enable when fixed

---

## Expected Outcome

After successful implementation:

**User Flow:**
1. User completes workflow Steps A → B → C
2. User clicks "Submit for Processing"
3. Data is written to normalized tables
4. Page redirects to completion page with `?workflowId={id}` parameter
5. Server component fetches workflow from normalized tables
6. Display shows all submitted data from database
7. User refreshes page → data persists (from database)
8. User can bookmark URL → always shows same workflow data

**Data Flow:**
```
[Form Input] 
  → [Zustand Store] 
  → [API POST /api/workflow] 
  → [workflowService.completeWorkflow()]
  → [Normalized Tables: document_categories, document_tags, custom_tags]
  → [GET /api/workflow/session?workflowId=X]
  → [workflowService.getWorkflowWithRelations()]
  → [Transform to Display Format]
  → [WorkflowCompleteClient]
  → [Display on Page]
```

---

## Final Notes

- This prompt completes the full normalized database implementation
- All form inputs are now written AND displayed from normalized tables
- The system maintains backward compatibility via feature flag
- Historical data migration (from spec Step 1.4) can now be run safely
- After validation, old JSONB columns can be deprecated

---

**Implementation Time Estimate:** 2-3 hours

**Risk Level:** Low (read-only operations, no destructive changes)

**Breaking Changes:** None (all changes are additive and backward compatible)

---

END OF PROMPT 3

