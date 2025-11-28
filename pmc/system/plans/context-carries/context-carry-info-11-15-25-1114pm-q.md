# Context Carryover: Batch Job Processing - Post Step 10 Implementation

**Last Updated**: 2025-11-28
**Status**: Step 10 Complete - Claude API "Body Already Read" Bug Requires Fix

---

## 🔍 Supabase Agent Ops Library (SAOL) Quick Reference

**The Supabase Client is unreliable for administrative tasks due to RLS (Row Level Security).**
**You MUST use the Supabase Agent Ops Library (SAOL) for all database operations.**

### ✅ CORRECT SAOL USAGE PATTERN

SAOL is a **Functional API**, not a class.

**1. Import Pattern (in scripts):**
```javascript
// ✅ CORRECT IMPORT (in scripts/ folder)
require('../load-env.js'); 
const saol = require('../supa-agent-ops/dist/index.js');
```

**2. Querying Data (agentQuery):**
```javascript
const result = await saol.agentQuery({
  table: 'batch_jobs',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  where: [{ column: 'status', operator: 'eq', value: 'failed' }],
  limit: 5,
  transport: 'supabase' // CRITICAL: Use 'supabase' transport
});

if (result.success) {
  console.log(result.data);
}
```

**3. Introspection:**
⚠️ **WARNING**: `agentIntrospectSchema` often requires `transport: 'pg'` and a direct `DATABASE_URL` connection string.
**Better Approach**: Use "Probe Queries" with `agentQuery` to check if columns exist.

---

## 📋 Project Context

### What This Application Does

**Bright Run LoRA Training Data Platform** - A Next.js 14 application that generates AI training conversations for fine-tuning large language models (LLMs).

### Core Workflow

```
User Selects Parameters → Template Resolution → Claude API Generation → 
Quality Validation → Storage (JSON file + metadata) → Dashboard Review → 
Approve/Reject → Export for Training
```

### Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI**: Claude API (Anthropic)
- **Deployment**: Vercel

---

## 🚀 Active Development Focus

### Current State: Step 10 Complete - Bug Fix Required

**Step 10 Implementation Status**: ✅ COMPLETE (with one outstanding bug to fix)

### What Was Accomplished in Step 10

| Task | Status | Description |
|------|--------|-------------|
| Kill infinite loop job | ✅ | Stopped job `ea1fc6e7-7dc3-476b-a8ff-7d12e0c918fe` |
| Fix infinite processing loop | ✅ | Fixed client-side infinite loop in batch-jobs page |
| Create batch-logs bucket | ✅ | Created `batch-logs` Supabase Storage bucket |
| Verify Enrich button works | ✅ | Enrich button now appears and functions correctly |
| Document "Body Already Read" bug | ✅ | Identified root cause, fix spec written below |

### Test Results from Step 10

- **Batch Job**: 8 items queued
- **Successful**: 7 items (87.5%)
- **Failed**: 1 item (12.5%)
- **Enrich**: Successfully enriched all 7 successful conversations
- **UI**: No more flashing/constant re-rendering

**Log File Location**: Supabase Storage > `batch-logs/{jobId}/log.txt`
Example: `batch-logs/7b34038c-252c-457e-a0b6-215d021efd20/log.txt`

---

## 🐛 Bug #3: Claude API "Body Already Read" Error (REQUIRES FIX)

### Summary

**Error Rate**: ~12.5% (1 in 8 items failed)
**Error Message**: `Body is unusable: Body has already been read`
**Impact**: Sporadic batch item failures during conversation generation

### Root Cause Analysis

**File**: `src/lib/services/claude-api-client.ts`
**Method**: `handleAPIError()` (lines 357-382)

The bug occurs in the error handling code:

```typescript
private async handleAPIError(response: Response, requestId: string): Promise<never> {
  let errorData: any = {};
  
  try {
    errorData = await response.json();  // ← FIRST READ ATTEMPT
  } catch {
    // If JSON parsing fails, body is in inconsistent state
    errorData = { message: await response.text() };  // ← SECOND READ FAILS!
  }
  // ...
}
```

**Why This Fails**:
1. `fetch()` Response body is a `ReadableStream` - can only be consumed ONCE
2. If `response.json()` throws an error (malformed JSON, network issue), the stream is left in an inconsistent state
3. The catch block then tries `response.text()`, which fails because the body was already (partially) consumed
4. This throws: `Body is unusable: Body has already been read`

### Evidence from Logs

From `pmc/_archive/batch-runtime-17.csv`:

```
[req_7_1764364684851_j5sxgr] ✗ Attempt 1 failed: Body is unusable: Body has already been read (category: unknown, retryable: false)
[ee164c70-8efe-475b-b5da-2853d97479c9] ❌ Generation failed: Body is unusable: Body has already been read
[ProcessNext] Item a0c9f9b2-8bf8-49c5-bf19-cad437999cb7 failed in 81955ms: Body is unusable: Body has already been read
```

---

## 🔧 Bug #3 Fix Specification

### Solution Options

#### Option A: Clone Response Before Reading

**Approach**: Clone the response object before attempting to read the body.

```typescript
private async handleAPIError(response: Response, requestId: string): Promise<never> {
  let errorData: any = {};
  
  // Clone the response BEFORE reading
  const clonedResponse = response.clone();
  
  try {
    errorData = await response.json();
  } catch {
    // Use the clone for the fallback read
    errorData = { message: await clonedResponse.text() };
  }
  // ...
}
```

**Pros**:
- Simple change (3 lines)
- Maintains existing error handling structure
- No change to success path

**Cons**:
- Memory overhead (cloning creates copy of response)
- Clone must happen BEFORE any read attempt
- If the original response is very large, memory usage doubles temporarily

#### Option B: Read as Text First, Then Parse (RECOMMENDED)

**Approach**: Read the body as text once, then parse as JSON. This is more resilient.

```typescript
private async handleAPIError(response: Response, requestId: string): Promise<never> {
  let errorData: any = {};
  let rawText: string = '';
  
  try {
    // Read body ONCE as text
    rawText = await response.text();
    
    // Then attempt to parse as JSON
    errorData = JSON.parse(rawText);
  } catch {
    // If parsing fails, we still have the raw text
    errorData = { message: rawText || response.statusText };
  }
  // ...
}
```

**Pros**:
- ✅ Body is only read ONCE - no possibility of "already read" error
- ✅ More memory efficient (no cloning)
- ✅ We always have the raw response for debugging
- ✅ Works even if response is malformed JSON
- ✅ Simpler mental model

**Cons**:
- Slightly more code
- Two-step process (read then parse)

### RECOMMENDED SOLUTION: Option B

Option B is more resilient for this use case because:
1. Claude API responses can be large (conversation JSON)
2. Network issues may corrupt the response mid-stream
3. We want to capture whatever we can for debugging
4. No memory overhead from cloning

---

## 📋 Step-by-Step Implementation Specification for Option B

### File to Modify

`src/lib/services/claude-api-client.ts`

### Step 1: Locate the handleAPIError Method

Find the method starting at approximately line 357:

```typescript
private async handleAPIError(response: Response, requestId: string): Promise<never> {
```

### Step 2: Replace the Method Implementation

Replace the ENTIRE `handleAPIError` method with:

```typescript
/**
 * Handle API error responses
 * 
 * IMPORTANT: Reads body as text FIRST, then parses as JSON.
 * This prevents "Body is unusable: Body has already been read" errors.
 * 
 * @private
 */
private async handleAPIError(response: Response, requestId: string): Promise<never> {
  let errorData: any = {};
  let rawText: string = '';
  
  try {
    // Read body ONCE as text - this is the only read operation
    rawText = await response.text();
    
    // Attempt to parse as JSON
    try {
      errorData = JSON.parse(rawText);
    } catch (parseError) {
      // JSON parsing failed - use raw text as message
      errorData = { 
        message: rawText || response.statusText,
        parseError: 'Response was not valid JSON'
      };
    }
  } catch (readError) {
    // Network/stream error reading body
    errorData = { 
      message: response.statusText || 'Failed to read error response',
      readError: readError instanceof Error ? readError.message : 'Unknown read error'
    };
  }

  const message = errorData.error?.message || errorData.message || response.statusText;
  const code = errorData.error?.type || 'api_error';

  console.error(`[${requestId}] API Error ${response.status}:`, message);
  
  // Log raw text for debugging if available
  if (rawText && rawText !== message) {
    console.error(`[${requestId}] Raw error response (first 500 chars):`, rawText.substring(0, 500));
  }

  // Categorize error
  const retryable = this.isRetryableStatus(response.status);

  throw new APIError(
    message,
    response.status,
    code,
    retryable,
    errorData
  );
}
```

### Step 3: Also Fix the callAPI Method for Resilience

In the `callAPI` method (around line 285-291), update the success path to also use text-first parsing:

Find this code:
```typescript
// Handle non-2xx responses
if (!response.ok) {
  await this.handleAPIError(response, requestId);
}

// Parse response
const data = await response.json();
```

Replace with:
```typescript
// Handle non-2xx responses
if (!response.ok) {
  await this.handleAPIError(response, requestId);
}

// Parse response - read as text first for resilience
let data: any;
try {
  const responseText = await response.text();
  data = JSON.parse(responseText);
} catch (parseError) {
  throw new APIError(
    'Failed to parse Claude API response as JSON',
    500,
    'parse_error',
    false,
    { parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error' }
  );
}
```

### Step 4: Test the Fix

1. Run a batch job with 8+ items
2. Monitor Vercel logs for any "Body" errors
3. Verify all items complete successfully
4. Check that error responses are properly captured

### Success Criteria

- [ ] No "Body is unusable: Body has already been read" errors
- [ ] Error responses are properly captured and logged
- [ ] Batch job completion rate improves to 100% (excluding legitimate API errors)
- [ ] Error messages are informative for debugging

---

## ✅ Bug #4: Infinite Processing Loop (FIXED in Step 10)

### Summary

The batch job detail page (`/batch-jobs/[id]`) was stuck in an infinite loop, making thousands of API calls per minute.

### Root Cause

The `startProcessing` callback was recreated on every render due to its dependencies. This caused the auto-start `useEffect` to re-trigger repeatedly, starting multiple parallel processing loops.

### Files Modified

| File | Change |
|------|--------|
| `src/app/(dashboard)/batch-jobs/[id]/page.tsx` | Added `autoStartedRef`, removed `startProcessing` from useEffect deps, added safety limits |

### Key Changes

1. **Added `autoStartedRef`** - Prevents multiple auto-starts per page load
2. **Removed `startProcessing` from useEffect dependencies** - Stops infinite re-triggers
3. **Added safety limit** - Max 1000 iterations to prevent infinite loops
4. **Improved completion detection** - Explicitly handles `job_completed`, `job_cancelled`, `no_items`
5. **Added logging** - Console logs for debugging processing flow

### Verification

- ✅ Tested with 8 item batch job
- ✅ No infinite loop
- ✅ 7/8 items completed successfully
- ✅ Enrich button appeared and worked
- ✅ UI no longer flashing/re-rendering constantly

---

## 🛠️ Helper Scripts Created in Step 10

| Script | Purpose | Usage |
|--------|---------|-------|
| `scripts/kill-batch-job.js` | Force-complete a stuck batch job | `node scripts/kill-batch-job.js <job_id>` |
| `scripts/check-batch-logs.js` | Check if log files exist for a job | `node scripts/check-batch-logs.js <job_id>` |
| `scripts/create-batch-logs-bucket.js` | Create the batch-logs storage bucket | `node scripts/create-batch-logs-bucket.js` |

---

## 📁 Key Files Reference

### Files Modified in Step 10

| File | Lines | Change |
|------|-------|--------|
| `src/app/(dashboard)/batch-jobs/[id]/page.tsx` | ~660 | Fixed infinite loop bug |

### Files to Modify in Step 11 (Bug #3 Fix)

| File | Lines | Change Needed |
|------|-------|---------------|
| `src/lib/services/claude-api-client.ts` | 357-382 | Fix handleAPIError method |
| `src/lib/services/claude-api-client.ts` | 285-291 | Fix callAPI response parsing |

### Batch Processing Files

- `src/app/api/batch-jobs/[id]/process-next/route.ts` - Main processing endpoint
- `src/app/api/batch-jobs/[id]/cancel/route.ts` - Cancel endpoint
- `src/lib/services/batch-job-service.ts` - Batch job CRUD operations
- `src/lib/services/batch-generation-service.ts` - Batch orchestration

### Generation Pipeline Files

- `src/lib/services/conversation-generation-service.ts` - Orchestrates generation
- `src/lib/services/claude-api-client.ts` - Claude API integration ⚠️ **FIX NEEDED**
- `src/lib/services/conversation-storage-service.ts` - Handles storage
- `src/lib/services/template-resolver.ts` - Template resolution

---

## 🗄️ Supabase Storage Buckets

| Bucket | Purpose | Created |
|--------|---------|---------|
| `conversation-files` | Raw and enriched conversation JSON files | Previously |
| `batch-logs` | Batch job log files (`{jobId}/log.txt`) | Step 10 ✅ |

---

## 🎯 Next Steps

### Immediate Priority: Fix Bug #3

1. **Implement the fix** per the specification above
2. **Deploy to Vercel** 
3. **Test** with a new batch job (8+ items)
4. **Verify** 100% success rate (excluding legitimate API errors)

### After Bug #3 is Fixed

1. Consider auto-triggering enrichment after batch completion
2. Implement export functionality
3. Add proper authentication

---

## 📊 Development History

| Step | Description | Status |
|------|-------------|--------|
| Step 8 | Batch job stuck bug - Fire-and-forget pattern fix | ✅ Complete |
| Step 9 | FK constraint violation + UI logging removal | ✅ Complete |
| Step 10 | Infinite loop fix + batch-logs bucket creation | ✅ Complete |
| Step 11 | Fix "Body Already Read" bug in Claude API client | ⏳ **NEXT** |

---

## 💡 Tips for Next Agent

1. **Bug #3 is the priority** - Follow the implementation spec above exactly

2. **Test with 8+ items** to have statistical significance on error rate

3. **Check Vercel logs** for "Body" errors after deploying fix

4. **The fix is straightforward** - Read body as text ONCE, then parse as JSON

5. **Don't forget both methods** - Fix `handleAPIError` AND the success path in `callAPI`

6. **Logs are in Supabase Storage** - Check `batch-logs/{jobId}/log.txt`

7. **Use the helper scripts** for debugging:
   - `node scripts/check-batch-logs.js <job_id>` - See if logs exist
   - `node scripts/kill-batch-job.js <job_id>` - Force-complete stuck job

---

## 🔗 Related Documentation

- Bug #3 Evidence: `pmc/_archive/batch-runtime-17.csv`
- Batch Log Example: `batch-logs/7b34038c-252c-457e-a0b6-215d021efd20/log.txt`
- Previous Context: `pmc/system/plans/context-carries/context-carry-info-11-15-25-1114pm.md`

