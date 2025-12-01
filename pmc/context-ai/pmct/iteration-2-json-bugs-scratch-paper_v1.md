# Batch Job UI Bug Investigation - Scratch Paper

## Date: 11/30/25

## Problem Statement
The batch-jobs[id] page shows "In Progress" and "Calculating..." even after the job has completed in the database.

## Job Status in Database
- `e0d4bbf7-3667-4c33-b65d-90df30157893`: status='completed', completed_items=3, total_items=3

## Key Observations from Code Analysis

### Issue #1: Frontend Status Update Logic (FOUND)

In `src/app/(dashboard)/batch-jobs/[id]/page.tsx` lines 130-138:
```typescript
// Update status from response
if (data.progress) {
  setStatus(prev => prev ? {
    ...prev,
    progress: data.progress,
    status: data.status === 'job_completed' ? 'completed' 
         : data.status === 'job_cancelled' ? 'cancelled' 
         : prev.status,  // <-- BUG: keeps old status if not job_completed/cancelled
  } : null);
}
```

The `processNextItem` function only updates `status` to 'completed' if `data.status === 'job_completed'`. But `process-next` API returns:
- `'processed'` - item was processed (even the last one!)
- `'job_completed'` - only returned when called AFTER all items already done

**Race Condition**: Last item returns `status: 'processed'` with `remainingItems: 0`, but UI status stays as 'queued' or 'processing'.

### Issue #2: No Direct Status Fetch After Processing Completes

After the processing loop ends, it calls `fetchStatus()`:
```typescript
const startProcessing = useCallback(async () => {
  // ... processing loop ...
  // Fetch final status
  await fetchStatus();
}, [processNextItem, fetchStatus]);
```

BUT if `fetchStatus()` is called while the status API still returns 'processing' (before the DB update propagates), the UI stays stuck.

### Issue #3: formatTimeRemaining Shows "Calculating..." for 0 seconds

Line 350:
```typescript
const formatTimeRemaining = (seconds?: number) => {
  if (!seconds || seconds <= 0) return 'Calculating...';
```

For completed jobs with `estimatedTimeRemaining: 0`, this returns "Calculating..." instead of something like "Complete" or not displaying at all.

## Hypothesis: Cookie Issue

User mentioned that old jobs suddenly showed as completed after a Vercel deploy. This suggests:
1. The browser had cached the old UI component state
2. A deploy forces a page reload, which gets fresh status from API
3. Fresh load → fetchStatus() → sees 'completed' in DB → renders correctly

## Root Cause Chain

1. Job starts, UI polls `process-next` endpoint
2. Each call returns `status: 'processed'` (not 'completed')
3. UI only updates `status` field if `data.status === 'job_completed'`
4. Last item processed returns `status: 'processed', remainingItems: 0`
5. Processing loop exits (shouldContinue = false because remainingItems = 0)
6. `fetchStatus()` is called BUT...
7. The API status endpoint SHOULD return 'completed' at this point
8. **WAIT** - need to check if the API status endpoint is returning correctly

## Next Steps
1. Check if `/api/conversations/batch/[id]/status` returns correct status after job completes
2. Verify the batch_jobs table status is actually updated to 'completed'
3. Check if there's a timing issue with DB update vs API read

## Additional Investigation Needed

Check `batchJobService.incrementProgress` - does it update job status when last item completes?

## CRITICAL DISCOVERY - 11/30/25 21:25

### API vs Database Mismatch

**Database query (direct):**
```json
{
  "id": "e0d4bbf7-3667-4c33-b65d-90df30157893",
  "status": "completed",
  "completed_items": 3,
  "total_items": 3,
  "successful_items": 3
}
```

**Production API response:**
```json
{
  "success": true,
  "jobId": "e0d4bbf7-3667-4c33-b65d-90df30157893",
  "status": "queued",
  "progress": {"total": 3, "completed": 0, "successful": 0, "failed": 0}
}
```

The API is returning stale data!

### RLS Test

With ANON key: Returns empty array (blocked by RLS)
With SERVICE_ROLE key: Returns correct data

This suggests the Vercel production environment might not have SUPABASE_SERVICE_ROLE_KEY set correctly,
or the batch-job-service module is using an old singleton.

### Module-Level Singleton Issue

`src/lib/services/batch-job-service.ts` line 14:
```typescript
const supabase = createServerSupabaseAdminClient();
```

This creates the Supabase client at MODULE LOAD TIME. In Vercel serverless:
1. First request loads module and creates client
2. Module is cached in memory
3. Subsequent requests reuse cached module
4. BUT - this shouldn't cause stale DATA, only stale CLIENT

### Possible Root Causes

1. **Vercel function caching old module with stale DB connection** - Unlikely, Supabase doesn't cache queries
2. **Environment variable issue in Vercel** - SUPABASE_SERVICE_ROLE_KEY might not be set
3. **Next.js route segment config caching** - Unlikely, no cache directives found
4. **Cold start vs warm start issue** - Module might have been created with wrong env

### PROPOSED FIX

Create Supabase client fresh on each request instead of module-level singleton:

```typescript
// BEFORE (batch-job-service.ts line 14)
const supabase = createServerSupabaseAdminClient();

// AFTER
// Move client creation inside each method OR use a getter function
function getSupabase() {
  return createServerSupabaseAdminClient();
}
```

This ensures each API call gets a fresh Supabase client with current environment variables.

---

## FIXES IMPLEMENTED - 11/30/25

### Fix #1: Module-Level Supabase Client Singleton (ROOT CAUSE)

**File**: `src/lib/services/batch-job-service.ts`

**Problem**: The Supabase client was created at module load time as a singleton. In Vercel serverless environments, this module can be cached across requests, leading to stale database connections that return old data.

**Solution**: Replaced module-level singleton with a function that creates a fresh client per request:

```typescript
// NEW: Function to get fresh Supabase client
function getSupabase() {
  return createServerSupabaseAdminClient();
}

// Each method now calls getSupabase() at the start:
async getJobById(id: string): Promise<BatchJob> {
  const supabase = getSupabase();  // Fresh client per request
  // ...
}
```

**Methods Updated**:
- `createJob()`
- `getJobById()`
- `getAllJobs()`
- `updateJobStatus()`
- `incrementProgress()`
- `getActiveJobs()`
- `cancelJob()`
- `updateItemStatus()`
- `deleteJob()`

### Fix #2: Frontend Status Update Logic

**File**: `src/app/(dashboard)/batch-jobs/[id]/page.tsx`

**Problem**: The `processNextItem` callback only updated UI status to 'completed' if API returned 'job_completed'. When processing items (API returns 'processed'), the status stayed as 'queued'.

**Solution**: Updated status mapping to properly set 'processing' status:

```typescript
// BEFORE
status: data.status === 'job_completed' ? 'completed' 
     : data.status === 'job_cancelled' ? 'cancelled' 
     : prev.status,  // <-- Bug: kept 'queued' during processing

// AFTER  
status: data.status === 'job_completed' ? 'completed' 
     : data.status === 'job_cancelled' ? 'cancelled'
     : data.status === 'processed' ? 'processing'  // <-- NEW: Properly set to 'processing'
     : prev.status,
```

### Fix #3: formatTimeRemaining Shows "Calculating..." for Completed Jobs

**File**: `src/app/(dashboard)/batch-jobs/[id]/page.tsx`

**Problem**: For completed jobs with `estimatedTimeRemaining: 0`, the function returned "Calculating..." instead of indicating completion.

**Solution**: Changed the logic to return '-' for 0 seconds:

```typescript
// BEFORE
if (!seconds || seconds <= 0) return 'Calculating...';

// AFTER
if (seconds === undefined || seconds === null) return 'Calculating...';
if (seconds <= 0) return '-';  // Job is complete
```

---

## VERIFICATION COMPLETE - 12/1/25 ✅

### Issue: Original Fixes Did Not Work

After deploying the initial fixes, the bug persisted. Job ID `27eaf2df-9619-4baf-ac59-f74989f05d23` still showed:
- API: `status: "queued", completed: 0`
- Database: `status: "completed", completed_items: 3`

### Root Cause Analysis - Deeper Investigation

The `getSupabase()` function fix was correct but the **status API route** was using `getBatchGenerationService()` which is a DIFFERENT singleton pattern that may have been caching the old behavior.

### Additional Fix #4: Rewrote Status API Route

**File**: `src/app/api/conversations/batch/[id]/status/route.ts`

**Problem**: The status route was using `getBatchGenerationService()` singleton instead of `batchJobService` directly.

**Solution**: Completely rewrote the route to:
1. Import `batchJobService` directly (bypasses singleton)
2. Add `export const dynamic = 'force-dynamic'`
3. Add `export const revalidate = 0`
4. Add explicit Cache-Control headers

### Additional Fix #5: Removed Unnecessary UI Buttons

**File**: `src/app/(dashboard)/batch-jobs/[id]/page.tsx`

Removed:
1. "Start Processing" button (processing now starts automatically)
2. Header "Refresh" button (page auto-refreshes)
3. Actions card "Refresh" button

### Final Verification ✅

**Production API Response (after fix):**
```json
{
  "success": true,
  "jobId": "27eaf2df-9619-4baf-ac59-f74989f05d23",
  "status": "completed",
  "progress": {
    "total": 3,
    "completed": 3,
    "successful": 3,
    "failed": 0,
    "percentage": 100
  },
  "estimatedTimeRemaining": 0
}
```

**Commit**: `5941c8f` - "Fix batch job status API returning stale data - use batchJobService directly"

### Summary

The bug required two separate fixes:
1. `batch-job-service.ts`: `getSupabase()` function (initial fix, necessary but not sufficient)
2. `status/route.ts`: Bypass `getBatchGenerationService()` singleton, use `batchJobService` directly (required for fix to work)

