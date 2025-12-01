# Batch Job Status Auto-Refresh Bug - Iteration 2 Analysis

## Document Information
- **Created**: November 30, 2025
- **Version**: 1.0
- **Status**: Investigation Complete
- **Related Log File**: `pmc/_archive/batch-runtime-22.csv`
- **Batch Job ID**: `b15bf3fd-abde-4611-8981-3c6c0e61f13e`

---

## Executive Summary

The batch job status page (`/batch-jobs/[id]`) has a bug where:
1. It shows real-time progress for the first N-1 files successfully
2. When processing hits the **last item**, the UI reverts to showing 0 completions and spinning progress
3. The page **never auto-refreshes** when the batch completes - requiring manual page refresh
4. After manual refresh, correct status (completed) and "Enrich" button are shown

---

## What's Working

✅ Real-time progress updates for files 1 through N-1 (shows "1 of 3", "2 of 3")  
✅ Status API correctly returns `completed` status when all items are done  
✅ Manual page refresh shows correct final status  
✅ Database is correctly updated with completion status  
✅ No flashing/flickering during processing (previous bug fixed)

---

## Bug Symptoms

### Symptom 1: UI Reverts on Last Item
- Processing 3 items: files 1 and 2 show correctly
- When file 3 starts processing, UI suddenly shows "0 of 3 completed"
- Progress bar resets to 0%
- Spinner continues indefinitely

### Symptom 2: No Auto-Refresh on Completion
- Batch job completes successfully on server (logs confirm `[ProcessNext] Item ... completed`)
- UI remains stuck on processing state
- Only manual browser refresh shows the correct completed state

---

## Root Cause Analysis

### Issue #1: Processing Loop Race Condition

**Location**: `src/app/(dashboard)/batch-jobs/[id]/page.tsx` lines 100-145

```tsx
// processNextItem function
const processNextItem = useCallback(async (): Promise<boolean> => {
  try {
    const response = await fetch(`/api/batch-jobs/${jobId}/process-next`, {
      method: 'POST',
    });
    const data = await response.json();

    // Update status from response
    if (data.progress) {
      setStatus(prev => prev ? {
        ...prev,
        progress: data.progress,
        status: data.status === 'job_completed' ? 'completed' 
             : data.status === 'job_cancelled' ? 'cancelled'
             : data.status === 'processed' ? 'processing'
             : prev.status,
      } : null);
    }

    // Check if job is complete
    if (data.status === 'job_completed' || data.status === 'job_cancelled' || data.status === 'no_items') {
      return false; // Stop processing
    }

    // Only continue if there are remaining items
    const shouldContinue = data.status === 'processed' && data.remainingItems > 0;
    return shouldContinue;
  } catch (err) {
    return false;
  }
}, [jobId]);
```

**Problem**: When the **last item** is processed:
1. API returns `{ status: 'processed', remainingItems: 0 }`
2. `shouldContinue = 'processed' && 0 > 0` evaluates to `false`
3. Loop exits, BUT...
4. The status never gets updated to `'completed'` because `data.status` is `'processed'`, not `'job_completed'`

The API returns `job_completed` **only when there are no more queued items at the START of a call** (line 206-224 of process-next/route.ts). But after processing the last item, it returns `'processed'` with `remainingItems: 0`.

### Issue #2: Missing Final Status Fetch

**Location**: `src/app/(dashboard)/batch-jobs/[id]/page.tsx` lines 173-205

```tsx
const startProcessing = useCallback(async () => {
  // ... loop processing ...
  
  while (hasMore && processingRef.current && iterations < maxIterations) {
    iterations++;
    hasMore = await processNextItem();
    // ...
  }

  console.log(`[BatchJob] Processing loop ended after ${iterations} iterations`);
  processingRef.current = false;
  setProcessingActive(false);
  
  // Fetch final status
  await fetchStatus();  // <-- This IS called, but there's a race condition
}, [processNextItem, fetchStatus]);
```

**Problem**: The `fetchStatus()` call at the end of the loop IS present, BUT:

1. The loop exits when `shouldContinue` is `false` (last item returns `remainingItems: 0`)
2. At this exact moment, the database is being updated by `batchJobService.incrementProgress()`
3. The job status hasn't yet been updated to `'completed'` (that happens when `process-next` is called with 0 queued items)
4. So `fetchStatus()` gets the old status (`'processing'`) not the new status (`'completed'`)

### Issue #3: API Returns 'processed' Instead of 'job_completed' for Last Item

**Location**: `src/app/api/batch-jobs/[id]/process-next/route.ts` lines 373-388

```typescript
// After successfully processing an item:
return NextResponse.json({
  success: true,
  itemId: item.id,
  conversationId: convId,
  status: 'processed',  // <-- Always 'processed', never 'job_completed'
  remainingItems,
  progress: { ... },
});
```

**Problem**: When the last item is processed successfully:
- It returns `status: 'processed'` (because it processed something)
- It should return `status: 'job_completed'` when `remainingItems === 0`

---

## Timeline Reconstruction from Logs

| Time (UTC) | Event | Status |
|------------|-------|--------|
| 23:28:53 | Batch job created | `queued` |
| 23:28:54 | Status API returns `queued`, 0/3 completed | - |
| 23:29:00 | Item 1 (286447e6) completed | - |
| 23:29:55 | Item 2 (0773d411) started processing | - |
| 23:30:00 | Item 2 completed | - |
| 23:30:50 | Item 3 (f2a44465) started processing | - |
| 23:31:50 | Status API polled: `processing`, 2/3 | **UI shows 2 of 3** |
| 23:32:01 | Item 3 completed | - |
| (no poll) | Status never updated on client | **UI stuck** |
| 23:38:07 | Manual page refresh | - |
| 23:38:28 | Status API returns `completed`, 3/3 | **UI correct after refresh** |

**Key Finding**: Between 23:32:01 (last item done) and 23:38:07 (manual refresh), the client never polled for status again. The processing loop ended but didn't trigger a proper status refresh.

---

## Proposed Fixes

### Fix 1: Update API to Return 'job_completed' When Last Item Finishes (RECOMMENDED)

**File**: `src/app/api/batch-jobs/[id]/process-next/route.ts`

After processing the last item successfully, check if it was the final item and return `job_completed`:

```typescript
// After successfully processing an item (around line 373):
const remainingItems = updatedJob.items?.filter(i => i.status === 'queued').length || 0;

// If this was the last item, mark job as complete and return job_completed
if (remainingItems === 0) {
  await batchJobService.updateJobStatus(jobId, 'completed');
  
  return NextResponse.json({
    success: true,
    itemId: item.id,
    conversationId: convId,
    status: 'job_completed',  // <-- Change from 'processed'
    remainingItems: 0,
    progress: {
      total: updatedJob.totalItems,
      completed: updatedJob.completedItems,
      successful: updatedJob.successfulItems,
      failed: updatedJob.failedItems,
      percentage: 100,
    },
  });
}

// Otherwise return normal 'processed' status
return NextResponse.json({
  success: true,
  itemId: item.id,
  conversationId: convId,
  status: 'processed',
  remainingItems,
  progress: { ... },
});
```

### Fix 2: Add Delay Before Final Status Fetch (BELT-AND-SUSPENDERS)

**File**: `src/app/(dashboard)/batch-jobs/[id]/page.tsx`

Add a small delay after the processing loop ends to ensure database is updated:

```tsx
const startProcessing = useCallback(async () => {
  // ... loop processing ...

  console.log(`[BatchJob] Processing loop ended after ${iterations} iterations`);
  processingRef.current = false;
  setProcessingActive(false);
  
  // Wait briefly for database to update job status
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Fetch final status
  await fetchStatus();
}, [processNextItem, fetchStatus]);
```

### Fix 3: Update Client Status Handling (RECOMMENDED)

**File**: `src/app/(dashboard)/batch-jobs/[id]/page.tsx`

Update `processNextItem` to handle the case where all items are done:

```tsx
const processNextItem = useCallback(async (): Promise<boolean> => {
  try {
    const response = await fetch(`/api/batch-jobs/${jobId}/process-next`, { method: 'POST' });
    const data = await response.json();

    if (data.progress) {
      // Determine correct status based on API response
      let newStatus = status?.status || 'processing';
      
      if (data.status === 'job_completed') {
        newStatus = 'completed';
      } else if (data.status === 'job_cancelled') {
        newStatus = 'cancelled';
      } else if (data.status === 'processed' && data.remainingItems === 0) {
        // Last item was processed - mark as completed
        newStatus = 'completed';
      } else if (data.status === 'processed') {
        newStatus = 'processing';
      }

      setStatus(prev => prev ? {
        ...prev,
        progress: data.progress,
        status: newStatus,
      } : null);
    }

    // Stop if complete or no more items
    if (data.status === 'job_completed' || 
        data.status === 'job_cancelled' || 
        data.status === 'no_items' ||
        data.remainingItems === 0) {
      return false;
    }

    return data.status === 'processed' && data.remainingItems > 0;
  } catch (err) {
    return false;
  }
}, [jobId, status?.status]);
```

---

## Implementation Priority

1. **Fix 1** (API change) - Most reliable, ensures server-side correctness
2. **Fix 3** (Client status handling) - Makes client more robust to edge cases
3. **Fix 2** (Delay) - Simple fallback if other fixes don't work

---

## Testing Checklist

After implementing fixes:

- [ ] Create a 1-item batch job - should show completed immediately
- [ ] Create a 3-item batch job - should show progress for all 3 and auto-complete
- [ ] Create a 10-item batch job - stress test the loop
- [ ] Cancel a batch job mid-processing - should show cancelled status
- [ ] Check that "Enrich All" button appears automatically when complete
- [ ] Verify no manual refresh is needed after completion

---

## Files to Modify

1. `src/app/api/batch-jobs/[id]/process-next/route.ts` - API response for last item
2. `src/app/(dashboard)/batch-jobs/[id]/page.tsx` - Client-side status handling

---

## Related Previous Fixes

- **Iteration 1**: Fixed caching issues with status API (added `force-dynamic`, no-cache headers)
- **Previous**: Removed duplicate refresh buttons that caused flashing

---

## Appendix: Key Log Entries

```
23:32:01 [ProcessNext] Item d3543754-a527-42e3-beb6-b02f907a4c3d completed in 70696ms: 2554df32-e55e-4afb-a028-e234decdfe2f

// No status poll between here and manual refresh...

23:38:28 [StatusAPI] Returning status: { jobId: 'b15bf3fd-abde-4611-8981-3c6c0e61f13e', status: 'completed', completed: 3, total: 3 }
```

The 6+ minute gap between last item completion and status poll confirms the client stopped polling prematurely.
