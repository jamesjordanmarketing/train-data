# Batch Job Bug Fix - Execution Specification (Step 8)

**Generated**: 2025-01-21  
**Updated**: 2025-11-26  
**Job ID**: `f60bab91-402c-4632-840d-3246ecaf0ed4`  
**Issue**: Batch job stuck indefinitely with no progress  
**Priority**: Critical - Production blocking  
**Status**: ✅ COMPLETED

---

## Implementation Summary

### Completed Tasks

1. **✅ Stopped the stuck job** - Cancelled job `f60bab91-402c-4632-840d-3246ecaf0ed4` and marked all 6 items as failed
2. **✅ Created cancel API endpoint** - `POST /api/batch-jobs/[id]/cancel`
3. **✅ Created process-next API endpoint** - `POST /api/batch-jobs/[id]/process-next` for polling-based processing
4. **✅ Fixed batch-job-service.ts** - Fixed `cancelJob()` to use `error_message` column (not `error`)
5. **✅ Updated BatchJob type** - Added `createdBy` field
6. **✅ Updated batch-generation-service.ts** - Removed fire-and-forget pattern, jobs now start as `queued`
7. **✅ Updated batch job detail page** - Added:
   - Auto-start processing for queued jobs
   - Stop/Resume buttons
   - Processing log viewer
   - Cancel job integration

### Files Modified

| File | Change |
|------|--------|
| `src/app/api/batch-jobs/[id]/cancel/route.ts` | **Created** - Cancel endpoint |
| `src/app/api/batch-jobs/[id]/process-next/route.ts` | **Created** - Process single item endpoint |
| `src/lib/services/batch-generation-service.ts` | Removed fire-and-forget, jobs start as `queued` |
| `src/lib/services/batch-job-service.ts` | Fixed `cancelJob()`, added `createdBy` to return |
| `src/lib/types/index.ts` | Added `createdBy` to BatchJob type |
| `src/app/(dashboard)/batch-jobs/page.tsx` | Added cancel state (partial) |
| `src/app/(dashboard)/batch-jobs/[id]/page.tsx` | Added processing loop, logs, stop/resume |

---

## Executive Summary

A batch job submitted for 6 conversations has been stuck for 20+ minutes with no actual progress. The job shows:
- **Status**: `paused` (was `processing`)
- **Completed**: 1 item
- **Failed**: 1 item  
- **Successful**: 0 items
- **Stuck in "processing"**: 3 items
- **Error**: "Unknown error" on failed items

### Root Cause Analysis (Validated)

The primary issue is the **Vercel serverless execution model** combined with the **fire-and-forget background processing pattern** used in `batch-generation-service.ts`.

**Key Finding**: In Vercel serverless functions:
1. The HTTP response is returned after `startBatchGeneration()` creates the job and starts `processJobInBackground()` 
2. The `processJobInBackground()` call is NOT awaited - it's fire-and-forget
3. Vercel kills serverless function execution after the HTTP response is sent
4. Background processing dies mid-execution, leaving items stuck in "processing" status
5. The `activeJobs` Map is instance-local and lost between function invocations

**Evidence**:
- `batch-runtime-13.csv` shows continuous status polling with no progress
- 3 items stuck in `status: "processing"` indefinitely
- Items never progress because the background worker was killed by Vercel

### Secondary Issues Identified

1. **Generic Error Handling**: Line 640 catches all errors with `'Unknown error'` fallback
2. **In-memory State**: `activeJobs` Map (line 62) is instance-scoped, not persisted
3. **Promise Cleanup Bug**: Lines 492-494 have faulty promise cleanup logic
4. **No Timeout Detection**: Items stuck in "processing" are never cleaned up

---

## Database Schema Audit

### `batch_jobs` Table (31 columns)

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | Primary key |
| status | text | Job status: queued, processing, completed, failed, cancelled, paused |
| total_items | integer | Total conversations requested |
| completed_items | integer | Items finished (success + fail) |
| successful_items | integer | Items that generated successfully |
| failed_items | integer | Items that failed |
| created_at | timestamptz | Job creation timestamp |
| started_at | timestamptz | When processing began |
| completed_at | timestamptz | When job finished |
| user_id | uuid | Owner |
| name | text | Job name |
| estimated_cost | numeric | Estimated API cost |
| actual_cost | numeric | Actual API cost |

**Key Observation**: No `last_activity_at` or `heartbeat` field to detect stale jobs.

### `batch_items` Table (14 columns)

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | Primary key |
| batch_job_id | uuid | FK to batch_jobs |
| status | text | Item status: queued, processing, completed, failed |
| topic | text | Training topic |
| tier | text | Quality tier |
| parameters | jsonb | Generation parameters |
| conversation_id | uuid | Generated conversation ID |
| error_message | text | Error details on failure |
| started_at | timestamptz | When item processing began |
| completed_at | timestamptz | When item finished |

**Key Observation**: `started_at` populated but `completed_at` NULL indicates stuck items.

---

## Code Audit Results

### `src/lib/services/batch-generation-service.ts`

**Line 235-250**: Job creation - creates job with status `queued`, items with status `queued`
```typescript
// This is the problem - fire and forget in serverless!
this.processJobInBackground(job.id, concurrency, errorHandling, userId);
return job;
```

**Line 455-530**: `processJobInBackground()` - processes items with concurrency control
- Uses `activeJobs` Map (line 462) - instance-scoped, not persistent
- Promise cleanup logic is faulty (line 492-494)

**Line 540-640**: `processItem()` - handles single item generation
- Auto-template selection at line 560 - works correctly
- Error handling at line 640 uses generic "Unknown error"

### `src/app/api/conversations/generate-batch/route.ts`

**Critical Section**:
```typescript
const result = await batchService.startBatchGeneration(/* ... */);
// Response is sent here
return NextResponse.json({ jobId: result.id }, { status: 202 });
// Vercel kills execution after this point
// processJobInBackground() is orphaned and dies
```

---

## Fix Strategy

### Immediate Fix: Stop the Stuck Job

1. Cancel job `f60bab91-402c-4632-840d-3246ecaf0ed4`
2. Mark all stuck items as `failed` with error message

### Architecture Fix: Queue-Based Processing

Replace fire-and-forget with proper queue-based architecture:

**Option A: Vercel Background Functions** (Recommended)
- Use Vercel's `waitUntil()` API for background work
- Requires `maxDuration` config increase

**Option B: External Queue**
- Use Supabase Edge Functions for processing
- Or implement with pg_cron + Supabase functions

**Option C: Polling-Based Processing**
- Client polls and triggers processing in chunks
- Each API call processes 1-3 items then returns
- Simple but requires client-side orchestration

### UI Fix: Add Stop Button

Add cancellation UI to `/batch-jobs/` page:
1. Stop button on active jobs
2. Granular logging panel
3. Item-level status visibility

---

## Execution Steps

### Step 1: Stop the Stuck Job (Immediate)

Use SAOL to execute:
```javascript
// Cancel the job
await supabase
  .from('batch_jobs')
  .update({ 
    status: 'cancelled',
    completed_at: new Date().toISOString()
  })
  .eq('id', 'f60bab91-402c-4632-840d-3246ecaf0ed4');

// Mark stuck items as failed
await supabase
  .from('batch_items')
  .update({ 
    status: 'failed',
    error_message: 'Job cancelled - background processing terminated',
    completed_at: new Date().toISOString()
  })
  .eq('batch_job_id', 'f60bab91-402c-4632-840d-3246ecaf0ed4')
  .in('status', ['queued', 'processing']);
```

### Step 2: Add Stop Button to UI

Create `src/app/api/batch-jobs/[id]/cancel/route.ts`:
```typescript
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  
  // Update job status
  await batchJobService.cancelJob(id);
  
  return NextResponse.json({ success: true });
}
```

Add button to batch jobs page with confirmation dialog.

### Step 3: Fix Background Processing Architecture

Implement polling-based processing:
1. Create `/api/batch-jobs/[id]/process-next/route.ts`
2. Each call processes 1 item and returns
3. Client polls until all items complete
4. Add timeout detection to mark stale items as failed

### Step 4: Add Granular Logging

1. Create `batch_job_logs` table for detailed event tracking
2. Log all state transitions with timestamps
3. Surface logs in UI for debugging

---

## Validation Checklist

- [ ] Job `f60bab91-402c-4632-840d-3246ecaf0ed4` cancelled
- [ ] All stuck items marked as failed
- [ ] Stop button visible on batch jobs page
- [ ] Stop button successfully cancels active jobs
- [ ] New batch jobs complete successfully
- [ ] Logging provides visibility into processing state

---

## Files to Modify

| File | Change |
|------|--------|
| `src/app/api/batch-jobs/[id]/cancel/route.ts` | Create - Cancel endpoint |
| `src/app/api/batch-jobs/[id]/process-next/route.ts` | Create - Process single item |
| `src/lib/services/batch-generation-service.ts` | Refactor background processing |
| `src/lib/services/batch-job-service.ts` | Add timeout detection |
| `src/app/batch-jobs/page.tsx` | Add Stop button and logging UI |
| `supabase/migrations/XXX_batch_job_logs.sql` | Create logging table |

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Stopping job loses progress | Already have 0 successful items - no data loss |
| New architecture requires testing | Test with small batch first |
| Client-side polling overhead | Implement exponential backoff |
| Concurrent request issues | Use database transactions |

---

## Appendix: Stuck Job Data

**Job State**:
```json
{
  "id": "f60bab91-402c-4632-840d-3246ecaf0ed4",
  "status": "paused",
  "total_items": 6,
  "completed_items": 1,
  "failed_items": 1,
  "successful_items": 0
}
```

**Items State**:
| Item | Status | Error |
|------|--------|-------|
| 1 | failed | Unknown error |
| 2 | failed | Unknown error |
| 3 | processing | (stuck) |
| 4 | processing | (stuck) |
| 5 | processing | (stuck) |
| 6 | failed | Unknown error |

**All items have**:
- `templateId: "00000000-0000-0000-0000-000000000000"` (NIL_UUID for auto-select)
- `emotional_arc_id: "53583301-5758-4781-99df-57b9c5fc1949"`

**Template exists**:
- ID: `b5038036-929a-4a86-b40a-e6bb34ce226e`
- Type: `confusion_to_clarity`
- Auto-selection should work
