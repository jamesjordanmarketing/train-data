# Context Carryover: Batch Job Processing - Post Step 9 Implementation

**Last Updated**: 2025-11-28
**Status**: Step 9 Bug Fixes Implemented - Testing Phase

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

### Current State: Post Step 9 Implementation - Testing Phase

**Step 9 Implementation Status**: ✅ COMPLETE

The following bugs were fixed in Step 9:

#### Bug #1: Foreign Key Constraint Violation - ✅ FIXED

**Problem**: When batch items completed, the system tried to update `batch_items.conversation_id` with the **business key** (`conversations.conversation_id`) instead of the **primary key** (`conversations.id`). This caused FK constraint violations.

**Root Cause**: The `conversations` table has TWO UUID columns:
- `id` - Primary Key (auto-generated)
- `conversation_id` - Business Key (passed from generation service)

The FK constraint is: `batch_items.conversation_id REFERENCES conversations(id)`

**Fix Applied** in `src/app/api/batch-jobs/[id]/process-next/route.ts` (line ~277):
```typescript
// BEFORE (Bug):
const convId = result.conversation.conversation_id || result.conversation.id;

// AFTER (Fixed):
// Use the PRIMARY KEY (id), not the business key (conversation_id)
// The FK constraint on batch_items.conversation_id references conversations.id (PK)
const convId = result.conversation.id;
```

#### Bug #2: UI Log Rendering Issue - ✅ FIXED

**Problem**: The batch job detail page had a `processLogs` state that caused constant re-renders, making the UI feel like it was "rewriting the page."

**Fix Applied**: 
1. Removed `processLogs` state from `src/app/(dashboard)/batch-jobs/[id]/page.tsx`
2. Removed the Processing Log Card from the UI
3. Added `appendBatchLog()` function in `process-next/route.ts` that writes logs to Supabase Storage instead

**Logging Now Goes To**: Supabase Storage bucket `batch-logs/{jobId}/log.txt`

---

## 📁 Key Files Modified in Step 9

| File | Change |
|------|--------|
| `src/app/api/batch-jobs/[id]/process-next/route.ts` | Fixed FK issue (use `result.conversation.id` PK instead of business key); Added `appendBatchLog()` function for storage-based logging |
| `src/app/(dashboard)/batch-jobs/[id]/page.tsx` | Removed `processLogs` state and UI logging component |

---

## 🔄 Batch Processing Architecture (Current State)

### Polling-Based Processing Flow

The batch processing uses a **polling-based architecture** to work around Vercel serverless function execution limits:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CLIENT (batch-jobs/[id]/page.tsx)                        │
│    - Auto-starts processing when job status is 'queued'     │
│    - Calls POST /api/batch-jobs/[id]/process-next           │
│    - Loops until remainingItems = 0 or job cancelled        │
└──────────────────────┬──────────────────────────────────────┘
                       │ POST /process-next
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. API ENDPOINT (process-next/route.ts)                     │
│    - Gets next queued item                                  │
│    - Auto-selects template if NIL_UUID                      │
│    - Calls generationService.generateSingleConversation()   │
│    - Uses result.conversation.id (PK) for FK update         │
│    - Writes log to Supabase Storage                         │
│    - Returns progress + remainingItems                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. GENERATION SERVICE                                       │
│    - Resolves template with parameters                      │
│    - Calls Claude API                                       │
│    - Stores raw response to Supabase Storage               │
│    - Parses and stores final conversation                   │
│    - Returns conversation with both id and conversation_id  │
└─────────────────────────────────────────────────────────────┘
```

### Key API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/batch-jobs/[id]/process-next` | POST | Process single batch item, returns progress |
| `/api/batch-jobs/[id]/cancel` | POST | Cancel a batch job |
| `/api/conversations/batch/[id]/status` | GET | Get batch job status |

---

## 🗄️ Database Schema Notes

### `conversations` Table - Two UUID Columns

| Column | Type | Purpose | Usage |
|--------|------|---------|-------|
| `id` | UUID | **Primary Key** | Used for FK references (batch_items.conversation_id) |
| `conversation_id` | UUID | **Business Key** | Passed from generation service, used for storage paths |

**CRITICAL**: When updating `batch_items.conversation_id`, always use `conversations.id` (PK), NOT `conversations.conversation_id` (business key).

### `batch_items` FK Constraint

```sql
batch_items.conversation_id REFERENCES conversations(id) ON DELETE CASCADE
```

---

## 📝 Testing Checklist for Step 9 Verification

### Pre-Testing Verification
- [ ] Confirm `batch-logs` storage bucket exists in Supabase
- [ ] Verify no `processLogs` state in batch-jobs/[id]/page.tsx

### Post-Fix Testing
- [ ] Create a new batch job with 2-3 items via /bulk-generator
- [ ] Verify all items complete successfully (no FK constraint errors)
- [ ] Query `batch_items` - verify `conversation_id` contains valid PKs
- [ ] Query `conversations` - verify `id` column matches `batch_items.conversation_id`
- [ ] Verify logs appear in Supabase Storage: `batch-logs/{jobId}/log.txt`
- [ ] Verify UI doesn't have logging panel anymore
- [ ] Verify progress bar still shows correctly

### Expected Behavior After Fix
1. Batch job starts with status `queued`
2. Client auto-starts processing loop
3. Each item processes successfully
4. `batch_items.conversation_id` gets populated with `conversations.id` (PK)
5. Logs are written to Supabase Storage (not UI)
6. Job completes with status `completed`

---

## ⚠️ Known Issues & Limitations

### Current Limitations

1. **Authentication**: Uses placeholder `x-user-id` header instead of real authentication
2. **Export Functionality**: "Export Selected" button is placeholder
3. **Bulk Enrichment**: Must be triggered manually after batch completes

### Supabase Storage Bucket Requirements

The following storage buckets must exist:
- `conversation-files` - For conversation JSON files
- `batch-logs` - For batch job log files (created in Step 9)

---

## 🔑 Important Files Reference

### Batch Processing Files
- `src/app/api/batch-jobs/[id]/process-next/route.ts` - Main processing endpoint (392 lines)
- `src/app/api/batch-jobs/[id]/cancel/route.ts` - Cancel endpoint
- `src/lib/services/batch-job-service.ts` - Batch job CRUD operations (588 lines)
- `src/lib/services/batch-generation-service.ts` - Batch orchestration

### UI Files
- `src/app/(dashboard)/batch-jobs/[id]/page.tsx` - Batch job detail page (627 lines)
- `src/app/(dashboard)/batch-jobs/page.tsx` - Batch jobs list page
- `src/app/(dashboard)/bulk-generator/page.tsx` - Batch creation UI

### Generation Pipeline
- `src/lib/services/conversation-generation-service.ts` - Orchestrates generation
- `src/lib/services/conversation-storage-service.ts` - Handles storage
- `src/lib/services/template-resolver.ts` - Template resolution

---

## 🎯 Next Steps

1. **Test the Step 9 fixes** - Run a batch job and verify:
   - No FK constraint errors
   - All items complete successfully
   - Logs appear in Supabase Storage bucket
   - UI no longer has logging component

2. **If tests pass** - Consider:
   - Adding bulk enrichment auto-trigger after batch completion
   - Implementing the export functionality
   - Adding authentication

3. **If tests fail** - Check:
   - Supabase Storage bucket `batch-logs` exists
   - `conversations` table has both `id` and `conversation_id` columns
   - FK constraint is correctly defined

---

## 📊 Recent Development History

| Step | Description | Status |
|------|-------------|--------|
| Step 8 | Batch job stuck bug - Fire-and-forget pattern fix | ✅ Complete |
| Step 9 | FK constraint violation + UI logging removal | ✅ Complete (Testing) |

---

## 💡 Tips for Next Agent

1. **Always use `result.conversation.id`** (PK) when updating FK references, never `result.conversation.conversation_id` (business key)

2. **Logs go to Supabase Storage**, not the UI - check `batch-logs/{jobId}/log.txt`

3. **Use SAOL for database queries** - the regular Supabase client may have RLS issues

4. **Batch processing is polling-based** - the client drives the processing loop, not the server

5. **Check the batch-logs bucket exists** before running batch jobs
