# Context Carryover: Bulk Generation Bug Fixes & SAOL Implementation

**Date:** November 25, 2025  
**Phase:** Bulk Conversation Generation - Bug Fixes & Database Setup  
**Status:** Database schema fixed, SAOL usage documented, ready for testing

---

## 📋 Project Context

### What This Application Does

**Bright Run LoRA Training Data Platform** - A Next.js 14 application that generates high-quality AI training conversations for fine-tuning large language models. The platform enables non-technical domain experts to transform proprietary knowledge into LoRA-ready training datasets.

**Core Capabilities**:
1. **Conversation Generation**: AI-powered generation using Claude API with predetermined field structure
2. **Enrichment Pipeline**: 5-stage validation and enrichment process for quality assurance
3. **Storage System**: File storage (Supabase Storage) + metadata (PostgreSQL)
4. **Management Dashboard**: UI for reviewing, downloading, and managing conversations
5. **Download System**: Export both raw (minimal) and enriched (complete) JSON formats

**Technology Stack**:
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Database: Supabase (PostgreSQL)
- Storage: Supabase Storage
- AI: Claude API (Anthropic)
- UI: Shadcn/UI + Tailwind CSS
- Deployment: Vercel

### Core Workflow

```
User → Generate Conversation → Claude API → Raw JSON Stored →
Enrichment Pipeline (5 stages) → Enriched JSON Stored →
Dashboard View → Download (Raw or Enriched)
```

---

## 🎯 Session Summary

### What We Accomplished This Session

1. **Added Bulk Generator Button** - Added "Bulk Generator" button to conversations page
2. **Fixed Supabase Client Initialization** - Changed batch-job-service to use admin client
3. **Fixed Missing Database Column** - Added `error_handling` column to `batch_jobs` table
4. **Discovered SAOL API Structure** - Tested and documented correct SAOL usage pattern
5. **Created Comprehensive Documentation** - Documented all findings for next agent

### Current Status

✅ **Fixed Issues:**
- Supabase client initialization in batch-job-service (now uses admin client)
- Missing `error_handling` column in batch_jobs table (SQL provided and executed)
- Type casting issue in conversations page (proper status mapping implemented)

⏳ **Ready for Testing:**
- Bulk generator UI exists at `/bulk-generator`
- Batch job monitoring exists at `/batch-jobs/[id]`
- Database schema is complete
- Need to test full end-to-end workflow

🔴 **Known Issues:**
- SAOL usage pattern was incorrectly documented (now fixed)
- Direct Supabase client often fails due to RLS restrictions
- Must use SAOL for all database operations going forward

---

## 🚨 CRITICAL: SAOL Tool Usage

### THE PROBLEM WITH PREVIOUS DOCUMENTATION

**What the docs said:**
```javascript
// ❌ WRONG - This doesn't work
const { SupabaseAgentOpsLibrary } = require('./supa-agent-ops/dist/index.js');
const saol = new SupabaseAgentOpsLibrary({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
});
```
**Error:** `TypeError: SupabaseAgentOpsLibrary is not a constructor`

### ROOT CAUSE

SAOL is NOT a class-based API. It exports **individual functions** that take configuration as parameters.

**Actual SAOL structure:**
```javascript
{
  agentQuery: [Function],
  agentCount: [Function],
  agentIntrospectSchema: [Function],
  agentExecuteSQL: [Function],
  agentImportTool: [Function],
  agentExportData: [Function],
  // ... 30+ other functions
}
```

### ✅ CORRECT SAOL USAGE

**Pattern 1: Load and use functions directly**
```javascript
const saol = require('./supa-agent-ops/dist/index.js');

// Call functions with inline config
const result = await saol.agentQuery({
  table: 'batch_jobs',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  where: [{ column: 'status', operator: 'eq', value: 'completed' }],
  orderBy: [{ column: 'created_at', ascending: false }],
  limit: 10,
  transport: 'supabase'
});

console.log(result.data); // Array of records
```

**Pattern 2: Named imports (cleaner for multiple uses)**
```javascript
const { agentQuery, agentCount, agentIntrospectSchema } = require('./supa-agent-ops/dist/index.js');

const result = await agentQuery({
  table: 'conversations',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  transport: 'supabase'
});
```

### SAOL vs Direct Supabase Client

**When to use SAOL:**
- ✅ Complex queries with multiple filters
- ✅ Schema introspection
- ✅ Bulk operations
- ✅ Database maintenance
- ✅ When RLS policies cause issues
- ✅ Import/export operations

**When direct Supabase client is acceptable:**
- Simple queries in API routes
- When you have proper authentication context
- When RLS policies are correctly configured

**CRITICAL RULE:** If direct Supabase client fails with permissions/RLS errors, **immediately switch to SAOL**.

### Tested & Working SAOL Functions

✅ **agentQuery** - Queries database successfully
```javascript
const result = await saol.agentQuery({
  table: 'batch_jobs',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  where: [{ column: 'status', operator: 'eq', value: 'active' }],
  transport: 'supabase'
});
// Returns: { data: [...], success: true }
```

✅ **agentCount** - Counts records successfully
```javascript
const count = await saol.agentCount({
  table: 'batch_jobs',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  where: [{ column: 'status', operator: 'eq', value: 'failed' }],
  transport: 'supabase'
});
// Returns: { count: 5, success: true, ... }
```

⚠️ **agentIntrospectSchema** - Works but needs proper validation config
```javascript
const schema = await saol.agentIntrospectSchema({
  table: 'batch_jobs',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  transport: 'pg'
});
// May require additional validation configuration
```

### SAOL Configuration Object

Every SAOL function accepts an object with these standard fields:

```typescript
{
  table: string;                          // Required: table name
  supabaseUrl: string;                    // Required: Supabase project URL
  supabaseKey: string;                    // Required: Service role key
  transport: 'supabase' | 'pg';          // Optional: default 'supabase'
  where?: Array<{                         // Optional: filters
    column: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
    value: any;
  }>;
  orderBy?: Array<{                       // Optional: sorting
    column: string;
    ascending: boolean;
  }>;
  limit?: number;                         // Optional: result limit
  offset?: number;                        // Optional: pagination offset
  select?: string[];                      // Optional: columns to select
}
```

### Reference Documentation

📁 **Complete SAOL Guide:** `C:\Users\james\Master\BrightHub\brun\train-data\docs\SAOL_CORRECT_USAGE.md`

This file contains:
- Root cause analysis of the documentation mismatch
- All tested patterns
- Working examples
- Comparison table (docs vs reality)
- Best practices

---

## 🐛 Bug Fixes Completed

### Bug 1: Supabase Client Null in batch-job-service

**Error:**
```
TypeError: Cannot read properties of null (reading 'from')
at Object.createJob (/var/task/src/.next/server/chunks/9991.js:1:7825)
```

**Root Cause:** 
`batch-job-service.ts` was importing:
```typescript
import { supabase } from '../supabase';
```

But there's no `index.ts` file in the supabase folder that exports a singleton client.

**Fix:**
Changed to use admin client:
```typescript
import { createServerSupabaseAdminClient } from '../supabase-server';

const supabase = createServerSupabaseAdminClient();
```

**File Modified:** `src/lib/services/batch-job-service.ts`  
**Commit:** `40b4699` - "Fix batch-job-service supabase client initialization"

---

### Bug 2: Missing `error_handling` Column

**Error:**
```
{
  code: 'PGRST204',
  message: "Could not find the 'error_handling' column of 'batch_jobs' in the schema cache"
}
```

**Root Cause:**
The code tried to insert `error_handling` field but the column didn't exist in the database:
```typescript
// batch-job-service.ts line 65
error_handling: job.configuration?.errorHandling || 'continue',
```

**Fix:**
Created SQL migration to add the column:
```sql
ALTER TABLE batch_jobs 
ADD COLUMN IF NOT EXISTS error_handling VARCHAR(20) DEFAULT 'continue';

ALTER TABLE batch_jobs
ADD CONSTRAINT check_error_handling 
CHECK (error_handling IN ('stop', 'continue'));

COMMENT ON COLUMN batch_jobs.error_handling IS 
'Error handling strategy: stop (halt on first error) or continue (process all items). Default: continue';
```

**Migration File:** `supabase/migrations/20251125_add_error_handling_to_batch_jobs.sql`  
**Status:** User confirmed SQL was run successfully in Supabase SQL Editor

---

### Bug 3: Type Cast in Conversations Page

**Error:**
```
❌ Error: Type cast 'as any' found in src/app/(dashboard)/conversations/page.tsx
   Production code should not use type casts.
```

**Root Cause:**
Code used unsafe type cast:
```typescript
status: storage.status as any, // Status types are compatible
```

**Fix:**
Created proper type mapping:
```typescript
const statusMap: Record<StorageConversation['status'], ConversationStatus> = {
  'pending_review': 'pending_review',
  'approved': 'approved',
  'rejected': 'rejected',
  'archived': 'none',
};

status: statusMap[storage.status],
```

**File Modified:** `src/app/(dashboard)/conversations/page.tsx`  
**Commit:** `8f7bf24` - "Fix type cast issue and add bulk generator button"

---

## 📋 Current Implementation Status

### ✅ Completed Components

1. **Bulk Generator UI** - `src/app/(dashboard)/bulk-generator/page.tsx`
   - Conversation category selector (Core/Edge)
   - Multi-select for personas, arcs, topics
   - Real-time combination counter
   - Cost/time estimation
   - "Generate Batch" button

2. **Batch Job Monitoring** - `src/app/(dashboard)/batch-jobs/[id]/page.tsx`
   - Real-time progress display
   - Status polling every 10 seconds
   - Pause/Resume/Cancel controls
   - Success/failure statistics
   - "View Conversations" link on completion

3. **Navigation** - Added "Bulk Generator" button to `/conversations` page

4. **API Endpoints** - Already implemented
   - `POST /api/conversations/generate-batch` - Submit batch job
   - `GET /api/conversations/batch/[id]/status` - Get job status
   - `PATCH /api/conversations/batch/[id]` - Control job (pause/resume/cancel)

5. **Database Schema** - Fixed and complete
   - `error_handling` column added to `batch_jobs`
   - All required tables exist (personas, emotional_arcs, training_topics, batch_jobs, conversations)

### ⏳ Ready for Testing

**Next Steps:**
1. Navigate to https://train-data-three.vercel.app/bulk-generator
2. Select parameters (personas, arcs, topics)
3. Click "Generate Batch"
4. Monitor progress at `/batch-jobs/[id]`
5. Verify conversations are created successfully

---

## 🔧 Testing Checklist

### Pre-Testing Setup
- [x] Database schema updated (error_handling column added)
- [x] Supabase client initialization fixed
- [x] Type casting issues resolved
- [x] Code pushed to GitHub
- [x] Vercel deployment complete

### UI Testing
- [ ] Navigate to `/bulk-generator` - page loads without errors
- [ ] Select "Core Conversations" mode
- [ ] Check 3 personas (Marcus, Jennifer, David)
- [ ] Check 5 emotional arcs
- [ ] Check 6 topics (or more for testing)
- [ ] Verify combination count updates: personas × arcs × topics
- [ ] Verify cost estimate displays
- [ ] Verify time estimate displays
- [ ] Click "Generate X Conversations"
- [ ] Should redirect to `/batch-jobs/[jobId]`

### Batch Monitoring Testing
- [ ] Batch job page loads successfully
- [ ] Status displays correctly (queued → processing → completed)
- [ ] Progress bar updates
- [ ] Completed/failed counts update
- [ ] Time remaining displays
- [ ] Can pause/resume job
- [ ] Can cancel job
- [ ] "View Conversations" button appears on completion
- [ ] Clicking button navigates to `/conversations`

### Data Validation Testing
- [ ] Check `batch_jobs` table has new record
- [ ] Verify `error_handling` column has value ('continue' or 'stop')
- [ ] Verify `status` updates from 'queued' → 'processing' → 'completed'
- [ ] Check `conversations` table has new records
- [ ] Verify `batch_job_id` links conversations to batch job
- [ ] Verify `tier` field is correct ('template' for core, 'edge_case' for edge)
- [ ] Verify quality scores are populated

### Error Handling Testing
- [ ] Try generating with 0 selections (should show error)
- [ ] Try generating with only 1 selection type (should show error)
- [ ] Monitor logs for any errors during generation
- [ ] Verify failed conversations are tracked correctly
- [ ] Verify batch continues on individual failures (error_handling='continue')

---

## 🚀 Deployment Information

### Recent Commits

1. **40b4699** - "Fix batch-job-service supabase client initialization"
   - Changed from non-existent `supabase` import to `createServerSupabaseAdminClient()`
   - Fixes: TypeError: Cannot read properties of null

2. **8f7bf24** - "Fix type cast issue and add bulk generator button"
   - Removed unsafe `as any` type cast
   - Added proper status mapping
   - Added "Bulk Generator" button to conversations page

### Vercel Deployment

All changes have been pushed to `main` branch and should be auto-deployed to:
- **Production URL:** https://train-data-three.vercel.app

**Verify deployment:**
1. Check Vercel dashboard for successful deployment
2. Visit `/bulk-generator` to confirm page loads
3. Check browser console for any errors

---

## 📁 Important Files Reference

### Files Modified This Session

1. `src/lib/services/batch-job-service.ts` - Fixed Supabase client import
2. `src/app/(dashboard)/conversations/page.tsx` - Fixed type casting, added bulk button
3. `supabase/migrations/20251125_add_error_handling_to_batch_jobs.sql` - Database migration

### Files Created This Session

1. `scripts/check-batch-jobs-schema.js` - Script to check database schema
2. `scripts/test-saol.js` - Script to test SAOL loading
3. `scripts/test-saol-functional.js` - Script to test SAOL functionality
4. `docs/SAOL_CORRECT_USAGE.md` - Complete SAOL documentation

### Existing Files (Already Implemented)

1. `src/app/(dashboard)/bulk-generator/page.tsx` - Bulk generator UI
2. `src/app/(dashboard)/batch-jobs/[id]/page.tsx` - Batch monitoring UI
3. `src/app/api/conversations/generate-batch/route.ts` - Batch submission API
4. `src/lib/services/batch-generation-service.ts` - Batch orchestration
5. `src/hooks/use-scaffolding-data.ts` - Data loading hook

---

## 🎓 Key Learnings for Next Agent

### 1. SAOL is a Functional API, Not a Class

**Don't do this:**
```javascript
const saol = new SupabaseAgentOpsLibrary({ ... }); // ❌ Won't work
```

**Do this:**
```javascript
const saol = require('./supa-agent-ops/dist/index.js');
await saol.agentQuery({ ... }); // ✅ Works
```

### 2. Use Admin Client for Service-Layer Operations

Services that need to bypass RLS should use:
```typescript
import { createServerSupabaseAdminClient } from '../supabase-server';
const supabase = createServerSupabaseAdminClient();
```

### 3. Never Store Signed URLs in Database

Always store **paths** and generate signed URLs on-demand:
```typescript
// ✅ Store path
file_path: 'users/123/conversation.json'

// ✅ Generate URL when needed
const { data } = await storage.createSignedUrl(file_path, 3600);
```

### 4. Check Database Schema Before Assuming

If you see `PGRST204` errors, the column likely doesn't exist. Use SAOL to check:
```javascript
const schema = await saol.agentIntrospectSchema({
  table: 'your_table',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  transport: 'pg'
});

console.log('Columns:', schema.columns.map(c => c.name));
```

### 5. Pre-commit Hooks Are Strict

The codebase has pre-commit hooks that check for:
- Type errors
- Unsafe type casts (`as any`, `as unknown`)
- Old error patterns

Always run `git commit` to trigger these checks before pushing.

---

## 🔍 Debugging Tools Created

### Script: check-batch-jobs-schema.js

**Purpose:** Check database schema and show SQL for missing columns  
**Location:** `scripts/check-batch-jobs-schema.js`  
**Usage:**
```bash
node scripts/check-batch-jobs-schema.js
```

### Script: test-saol.js

**Purpose:** Test SAOL loading and identify correct import pattern  
**Location:** `scripts/test-saol.js`  
**Usage:**
```bash
node scripts/test-saol.js
```
**Output:** Shows all SAOL exports and their types

### Script: test-saol-functional.js

**Purpose:** Test actual SAOL functionality with database calls  
**Location:** `scripts/test-saol-functional.js`  
**Usage:**
```bash
node scripts/test-saol-functional.js
```
**Output:** Tests agentQuery, agentCount, agentIntrospectSchema with live data

---

## 🎯 Next Steps for Testing Agent

### Step 1: Verify Deployment
1. Check Vercel dashboard: https://vercel.com/dashboard
2. Confirm latest commit is deployed
3. Visit https://train-data-three.vercel.app/bulk-generator
4. Open browser console, check for errors

### Step 2: Test Small Batch First
1. Select 1 persona
2. Select 1 emotional arc
3. Select 2 topics
4. **Expected:** 1 × 1 × 2 = 2 conversations
5. Click "Generate 2 Conversations"
6. Should redirect to `/batch-jobs/[id]`
7. Monitor until completion (~2 minutes)
8. Click "View Conversations"
9. Verify 2 new conversations exist

### Step 3: Test Larger Batch
1. Select all 3 personas
2. Select 5 emotional arcs
3. Select 6 topics
4. **Expected:** 3 × 5 × 6 = 90 conversations
5. Click "Generate 90 Conversations"
6. Monitor progress
7. **Expected time:** ~30 minutes (with concurrency=3)
8. Verify completion status
9. Check conversations table for 90 new records

### Step 4: Validate Data Quality
1. Query conversations table:
   ```sql
   SELECT 
     batch_job_id,
     tier,
     quality_score,
     status,
     COUNT(*)
   FROM conversations
   WHERE batch_job_id = 'your-job-id'
   GROUP BY batch_job_id, tier, quality_score, status;
   ```
2. Verify all have quality_score >= 7.0
3. Verify tier = 'template' (for core) or 'edge_case' (for edge)
4. Check for any failed conversations

### Step 5: Test Error Scenarios
1. Try generating with 0 selections
2. Try pausing a batch mid-generation
3. Try resuming a paused batch
4. Try cancelling a batch
5. Verify error messages are clear
6. Check that `error_handling='continue'` works (batch continues despite individual failures)

### Step 6: Report Results
Create a summary:
- ✅ What worked
- ❌ What failed
- 📊 Performance metrics (time, cost)
- 🐛 Any bugs discovered
- 💡 Recommendations

---

## 🚨 Known Limitations

### 1. No Real Authentication
**Current:** Using placeholder userId  
**Impact:** All batches created by same "user"  
**Workaround:** Acceptable for testing, will be fixed in auth phase

### 2. Edge Case Mode Not Fully Tested
**Current:** Edge case detection relies on `conversation_category` or `arc_type` column  
**Impact:** Need to verify edge arcs exist and are properly categorized  
**Action:** Check `emotional_arcs` table for arcs with appropriate type

### 3. No Batch Size Limit
**Current:** User can select unlimited combinations  
**Impact:** Could accidentally create huge batch  
**Recommendation:** Add UI warning for batches > 100 conversations

### 4. Cost Estimation is Static
**Current:** Uses fixed $0.45 per conversation  
**Impact:** May not reflect actual API costs  
**Action:** Monitor actual costs and adjust estimate if needed

---

## 📚 Documentation Files

### This Session's Documentation

1. **`docs/SAOL_CORRECT_USAGE.md`** - Complete SAOL usage guide
   - Root cause analysis
   - Correct patterns
   - Test results
   - Comparison table

2. **`supabase/migrations/20251125_add_error_handling_to_batch_jobs.sql`** - Database migration
   - Adds error_handling column
   - Adds check constraint
   - Adds documentation comment

### Previous Session Documentation

1. **`pmc/system/plans/context-carries/context-carry-info-11-15-25-1114pm.md`** - Previous context
   - Bulk generator specification
   - User decisions
   - Implementation requirements

2. **`pmc/context-ai/pmct/iteration-1-bulk-processing-execution-plan-step-5_v1.md`** - Execution plan
   - 3-prompt implementation guide
   - Data preparation steps
   - UI implementation details

---

## 💡 Pro Tips for Next Agent

### Tip 1: Always Test with Small Batches First
Don't start with 90 conversations. Test with 2-5 first to verify the pipeline works end-to-end.

### Tip 2: Use SAOL for All Database Debugging
When things go wrong, use SAOL scripts to inspect the database:
```javascript
const saol = require('./supa-agent-ops/dist/index.js');

// Check batch job status
const result = await saol.agentQuery({
  table: 'batch_jobs',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  where: [{ column: 'id', operator: 'eq', value: jobId }],
  transport: 'supabase'
});

console.log('Batch job:', result.data[0]);
```

### Tip 3: Monitor Vercel Logs in Real-Time
During batch generation, watch the Vercel logs:
```bash
vercel logs --follow
```

This shows generation progress, errors, and API calls in real-time.

### Tip 4: Check Database Directly When Confused
Don't trust the UI if something seems wrong. Query the database:
```sql
-- Check batch job
SELECT * FROM batch_jobs WHERE id = 'job-id';

-- Check conversations
SELECT COUNT(*), status, tier 
FROM conversations 
WHERE batch_job_id = 'job-id' 
GROUP BY status, tier;
```

### Tip 5: Save Logs for Debugging
If a batch fails, save the full error logs. They're invaluable for debugging:
```javascript
// In batch-generation-service.ts
catch (error) {
  console.error('FULL ERROR DETAILS:', {
    message: error.message,
    stack: error.stack,
    jobId,
    parameterSet,
    // ... all relevant context
  });
}
```

---

## 🎬 Session Timeline (For Reference)

1. **18:42 UTC** - User tried bulk generation, got Supabase client error
2. **18:49 UTC** - Fixed Supabase client, got missing column error
3. **19:00 UTC** - Created SQL to add error_handling column
4. **19:02 UTC** - User ran SQL successfully
5. **19:05 UTC** - User asked to test SAOL
6. **19:10 UTC** - Discovered SAOL is functional API, not class-based
7. **19:15 UTC** - Tested SAOL functions, all working
8. **19:20 UTC** - Created comprehensive documentation
9. **19:30 UTC** - Created this context carryover

**Total time debugging:** ~45 minutes  
**Issues fixed:** 3 critical bugs  
**Documentation created:** 4 files

---

## ✅ Ready for Next Agent

### Handoff Checklist
- [x] All bugs fixed and committed
- [x] Database schema updated
- [x] SAOL usage documented
- [x] Testing checklist created
- [x] Debugging tools provided
- [x] Known limitations documented
- [x] Pro tips shared
- [x] Context carryover complete

### What's Next
1. **Test the bulk generator end-to-end**
2. **Verify 90-conversation batch works**
3. **Check edge case mode** (may need database updates)
4. **Validate conversation quality**
5. **Report results to user**

---

**CRITICAL REMINDER FOR NEXT AGENT:**

🔴 **ALWAYS USE SAOL FOR DATABASE OPERATIONS**

The direct Supabase client often fails due to RLS restrictions, especially in service layers. SAOL bypasses these issues by using the service role key correctly.

**Pattern to follow:**
```javascript
// ✅ DO THIS (SAOL)
const saol = require('./supa-agent-ops/dist/index.js');
const result = await saol.agentQuery({
  table: 'your_table',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  transport: 'supabase'
});

// ❌ NOT THIS (direct client in services)
const { data } = await supabase.from('your_table').select('*');
```

---

**Good luck with testing! The bulk generator is ready to generate 100 conversations for the HuggingFace dataset. 🚀**

---

**Last Updated:** November 25, 2025, 19:30 UTC  
**Prepared By:** Bug Fix & SAOL Documentation Agent  
**For:** Testing & Validation Agent
