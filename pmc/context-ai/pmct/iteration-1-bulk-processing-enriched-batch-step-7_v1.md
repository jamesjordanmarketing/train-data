# Bulk Enrichment API Specification

**Date:** November 26, 2025  
**Iteration:** 1 - Bulk Processing Enrichment  
**Status:** Implementation Spec  
**Author:** AI Agent

---

## 1. Problem Statement

### Current State

When conversations are generated through the **individual generation page** (`/conversations/generate`):
1. The React component triggers generation via `POST /api/conversations/generate`
2. After generation succeeds, the component makes a **separate API call** to `POST /api/conversations/[id]/enrich`
3. The enrichment pipeline runs, producing the final "Enriched JSON"

When conversations are generated through the **bulk generator** (`/bulk-generator`):
1. The batch job generates multiple conversations
2. **NO enrichment is triggered** - the code explicitly says:
   ```
   "[conversation_id] ℹ️ Enrichment will be triggered by client after generation completes"
   ```
3. Conversations are stored with RAW JSON only, status `not_started` for enrichment

### Result

All batch-generated conversations show:
- ✅ "RAW JSON" available
- ❌ "Enriched JSON" - `(Status not_started)`

---

## 2. Solution: Bulk Enrich API Endpoint

### Architecture Decision

**Option 3: Bulk Enrich API** (selected)

Create a new API endpoint that accepts an array of conversation IDs and triggers enrichment for each one. This approach:
- ✅ Runs enrichment in its own serverless invocation (avoids timeout issues)
- ✅ Can be triggered by the batch job page when a job completes
- ✅ Can also be triggered manually from the conversations list page
- ✅ Processes enrichment sequentially to avoid overwhelming the database

---

## 3. Implementation Specification

### 3.1 New API Endpoint

**Path:** `POST /api/conversations/bulk-enrich`

**Request Body:**
```typescript
{
  conversationIds: string[];    // Array of conversation UUIDs to enrich
  userId?: string;              // Optional user ID (for auth)
  sequential?: boolean;         // Default true - process one at a time
}
```

**Response:**
```typescript
{
  success: boolean;
  summary: {
    total: number;
    successful: number;
    failed: number;
    skipped: number;           // Already enriched
  };
  results: Array<{
    conversationId: string;
    status: 'enriched' | 'failed' | 'skipped';
    error?: string;
    enrichmentStatus?: string;  // Final enrichment_status value
  }>;
}
```

**Error Codes:**
- `400` - Invalid request (no conversation IDs provided)
- `404` - One or more conversations not found
- `500` - Server error during enrichment

### 3.2 File Changes Required

#### A. New API Route File

**Create:** `src/app/api/conversations/bulk-enrich/route.ts`

```typescript
/**
 * API Route: Bulk Conversation Enrichment
 * 
 * POST /api/conversations/bulk-enrich
 * Triggers enrichment pipeline for multiple conversations
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createPipelineOrchestrator } from '@/lib/services/enrichment-pipeline-orchestrator';

// Validation schema
const BulkEnrichRequestSchema = z.object({
  conversationIds: z.array(z.string().uuid()).min(1).max(100),
  userId: z.string().optional(),
  sequential: z.boolean().optional().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = BulkEnrichRequestSchema.parse(body);
    
    const supabase = await createClient();
    const orchestrator = createPipelineOrchestrator(supabase);
    
    const results: Array<{
      conversationId: string;
      status: 'enriched' | 'failed' | 'skipped';
      error?: string;
      enrichmentStatus?: string;
    }> = [];
    
    // Process each conversation
    for (const conversationId of validated.conversationIds) {
      try {
        // Check if already enriched
        const { data: conv } = await supabase
          .from('conversations')
          .select('enrichment_status')
          .eq('id', conversationId)
          .single();
        
        if (conv?.enrichment_status === 'completed') {
          results.push({
            conversationId,
            status: 'skipped',
            enrichmentStatus: 'completed',
          });
          continue;
        }
        
        // Run enrichment pipeline
        const result = await orchestrator.runPipeline(conversationId);
        
        results.push({
          conversationId,
          status: result.success ? 'enriched' : 'failed',
          error: result.error,
          enrichmentStatus: result.finalStatus,
        });
        
      } catch (error) {
        results.push({
          conversationId,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    // Calculate summary
    const summary = {
      total: validated.conversationIds.length,
      successful: results.filter(r => r.status === 'enriched').length,
      failed: results.filter(r => r.status === 'failed').length,
      skipped: results.filter(r => r.status === 'skipped').length,
    };
    
    return NextResponse.json({
      success: summary.failed === 0,
      summary,
      results,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('[BulkEnrich] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process bulk enrichment' },
      { status: 500 }
    );
  }
}
```

#### B. Batch Job Page Integration

**Modify:** `src/app/(dashboard)/batch-jobs/[id]/page.tsx`

Add a "Enrich All" button that appears when a batch job completes. This button:
1. Fetches all successful conversation IDs from the batch job
2. Calls `POST /api/conversations/bulk-enrich` with those IDs
3. Shows progress/results to the user

**Changes needed:**

1. Add state for enrichment:
```typescript
const [enriching, setEnriching] = useState(false);
const [enrichResult, setEnrichResult] = useState<{
  successful: number;
  failed: number;
  skipped: number;
} | null>(null);
```

2. Add enrichment handler:
```typescript
const handleEnrichAll = async () => {
  if (!status || status.status !== 'completed') return;
  
  try {
    setEnriching(true);
    
    // Get all successful conversation IDs from batch items
    const response = await fetch(`/api/conversations/batch/${jobId}/items?status=completed`);
    const items = await response.json();
    
    const conversationIds = items.data
      .map((item: any) => item.conversation_id)
      .filter(Boolean);
    
    if (conversationIds.length === 0) {
      setEnrichResult({ successful: 0, failed: 0, skipped: 0 });
      return;
    }
    
    // Trigger bulk enrichment
    const enrichResponse = await fetch('/api/conversations/bulk-enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationIds }),
    });
    
    const enrichData = await enrichResponse.json();
    setEnrichResult(enrichData.summary);
    
  } catch (error) {
    console.error('Enrichment failed:', error);
  } finally {
    setEnriching(false);
  }
};
```

3. Add UI button (in the completed job section):
```tsx
{status?.status === 'completed' && (
  <div className="mt-4 space-y-2">
    <Button 
      onClick={handleEnrichAll}
      disabled={enriching}
      className="w-full"
    >
      {enriching ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Enriching Conversations...
        </>
      ) : (
        'Enrich All Conversations'
      )}
    </Button>
    
    {enrichResult && (
      <div className="text-sm text-muted-foreground">
        Enriched: {enrichResult.successful}, 
        Failed: {enrichResult.failed}, 
        Skipped: {enrichResult.skipped}
      </div>
    )}
  </div>
)}
```

#### C. Batch Items API (if needed)

**Create:** `src/app/api/conversations/batch/[id]/items/route.ts`

If this endpoint doesn't exist, create it to return batch items with their conversation IDs:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    
    let query = supabase
      .from('batch_items')
      .select('id, conversation_id, status, topic')
      .eq('batch_job_id', params.id);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
    
  } catch (error) {
    console.error('[BatchItems] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch batch items' },
      { status: 500 }
    );
  }
}
```

---

## 4. Database Operations

### 4.1 SAOL Usage

The enrichment pipeline already uses Supabase client internally. For any direct database operations during implementation, use SAOL:

```javascript
// Verify conversation exists before enrichment
const saol = require('supa-agent-ops');
const result = await saol.agentQuery({
  table: 'conversations',
  where: [{ column: 'id', operator: 'eq', value: conversationId }],
  select: ['id', 'enrichment_status', 'raw_storage_path']
});
```

### 4.2 Enrichment Status Updates

The `EnrichmentPipelineOrchestrator` already handles status updates:
- `not_started` → `validating` → `validated` → `enrichment_in_progress` → `normalizing` → `completed`

No additional database changes needed.

---

## 5. Testing Plan

### 5.1 Unit Tests

1. **Bulk Enrich API**
   - Test with valid conversation IDs
   - Test with invalid UUIDs (expect 400)
   - Test with non-existent conversations
   - Test with already-enriched conversations (expect skip)
   - Test max limit (100 conversations)

### 5.2 Integration Tests

1. Generate batch job with 5 conversations
2. Verify all show RAW JSON but no Enriched JSON
3. Trigger bulk enrichment
4. Verify all now show Enriched JSON
5. Verify re-running bulk enrichment skips already-enriched

### 5.3 Manual Testing

```bash
# Test bulk enrich API directly
curl -X POST https://train-data-three.vercel.app/api/conversations/bulk-enrich \
  -H "Content-Type: application/json" \
  -d '{"conversationIds": ["uuid-1", "uuid-2", "uuid-3"]}'
```

---

## 6. Deployment Steps

1. **Code Changes**
   - Create `src/app/api/conversations/bulk-enrich/route.ts`
   - Modify `src/app/(dashboard)/batch-jobs/[id]/page.tsx`
   - Create `src/app/api/conversations/batch/[id]/items/route.ts` (if needed)

2. **Deploy**
   ```bash
   git add -A
   git commit -m "feat: add bulk enrichment API endpoint

   - POST /api/conversations/bulk-enrich accepts array of conversation IDs
   - Triggers enrichment pipeline for each conversation sequentially
   - Returns summary of successful/failed/skipped enrichments
   - Integrated with batch job page - 'Enrich All' button after completion"
   
   git push origin main
   ```

3. **Verify**
   - Generate a small batch (3 conversations)
   - Wait for completion
   - Click "Enrich All" button
   - Verify conversations now show Enriched JSON

---

## 7. Future Enhancements

1. **Automatic Enrichment Trigger**
   - Option to auto-trigger enrichment when batch job completes
   - Background processing with Vercel Cron or edge function

2. **Enrichment Queue**
   - Queue system for large batches
   - Progress tracking in UI

3. **Retry Failed Enrichments**
   - UI to retry failed enrichments
   - Error categorization for better debugging

---

## 8. Success Criteria

- [ ] Bulk enrich API endpoint returns expected response format
- [ ] Batch job page shows "Enrich All" button when job completes
- [ ] Clicking button triggers enrichment for all successful conversations
- [ ] Previously enriched conversations are skipped
- [ ] Enrichment status updates correctly in database
- [ ] UI shows enrichment results summary

---

## Appendix: Related Files

### Existing Enrichment Pipeline
- `src/lib/services/enrichment-pipeline-orchestrator.ts` - Main orchestrator
- `src/lib/services/conversation-enrichment-service.ts` - Enrichment logic
- `src/app/api/conversations/[id]/enrich/route.ts` - Single conversation enrich API

### Related Components
- `src/app/(dashboard)/batch-jobs/[id]/page.tsx` - Batch job detail page
- `src/app/(dashboard)/conversations/page.tsx` - Conversations list

### Database Tables
- `conversations` - Has `enrichment_status` column
- `batch_items` - Has `conversation_id` for completed items
