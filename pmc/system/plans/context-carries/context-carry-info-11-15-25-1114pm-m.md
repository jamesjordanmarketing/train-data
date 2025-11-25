# Context Carryover: Bulk Generation Pipeline - Template Auto-Selection Fix

**Date Updated:** November 26, 2025  
**Previous Session Focus:** Bulk Conversation Generation Pipeline Fixes  
**Current Status:** Code fix implemented, deployment required

---

## 🚨 CRITICAL: What Was Fixed This Session

### Issue 1: batch_jobs Status CHECK Constraint (FIXED - SQL Applied)

**Error Encountered:**
```
message: 'new row for relation "batch_jobs" violates check constraint "batch_jobs_status_check"'
```

**Root Cause:** Database CHECK constraint did not allow `'queued'` and `'processing'` values.

**Fix Applied:** SQL migration executed in Supabase:
```sql
ALTER TABLE batch_jobs DROP CONSTRAINT IF EXISTS batch_jobs_status_check;
ALTER TABLE batch_jobs ADD CONSTRAINT batch_jobs_status_check 
  CHECK (status IN ('queued', 'processing', 'paused', 'completed', 'failed', 'cancelled'));
```

**Status:** ✅ FIXED - User applied SQL in Supabase console.

---

### Issue 2: Template Resolution Failed - NIL UUID (FIXED - Code Change)

**Error Encountered:**
```
Template resolution failed: Template not found
templateId: '00000000-0000-0000-0000-000000000000'
Error fetching template: { code: 'PGRST116', details: 'The result contains 0 rows' }
```

**Root Cause:** 
- `src/app/(dashboard)/bulk-generator/page.tsx` line 21 hardcoded:
  ```typescript
  const DEFAULT_TEMPLATE_ID = '00000000-0000-0000-0000-000000000000';
  ```
- This NIL UUID was passed to batch generation, which passed it directly to the generation service
- The generation service tried to fetch a template with that ID, which doesn't exist

**Fix Implemented in:** `src/lib/services/batch-generation-service.ts`

**Changes Made:**
1. Added `NIL_UUID` constant at top of file
2. Added `createClient` import from Supabase
3. Added new `autoSelectTemplate()` method (lines ~330-410):
   - Takes `emotionalArcId` and `tier` parameters
   - Queries `emotional_arcs` table to get `arc_type`
   - Queries `prompt_templates` table for active template matching arc type and tier
   - Falls back to any active template for tier if arc-specific not found
4. Modified `processItem()` method (lines ~540-600):
   - Checks if templateId is missing or equals NIL_UUID
   - Calls `autoSelectTemplate()` to get a valid template
   - Uses auto-selected template for generation

**Status:** ✅ CODE FIXED - Needs deployment to Vercel

---

## 📋 Project Context

### What This Application Does

**Bright Run LoRA Training Data Platform** - A Next.js 14 application that generates AI training conversations for fine-tuning large language models (LLMs). The platform provides:

1. **Scaffolding System**: Pre-configured personas, emotional arcs, and training topics
2. **Bulk Generation Pipeline**: Batch generation of multiple conversations with concurrent processing
3. **Conversation Generation**: AI-powered conversation generation using Claude API
4. **Conversation Storage**: File storage (Supabase Storage) + metadata (PostgreSQL)
5. **Quality Validation**: Automated quality scoring and validation
6. **Export System**: Export conversations for LoRA fine-tuning

### Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI**: Claude API (Anthropic)
- **Deployment**: Vercel (https://train-data-three.vercel.app)

---

## 🎯 Active Development Focus

### Primary Task: Deploy Template Auto-Selection Fix

**Status**: Code fix complete, needs deployment and testing.

**Deployment Steps:**
```bash
cd C:\Users\james\Master\BrightHub\BRun\train-data

git add -A
git commit -m "fix: auto-select template when NIL UUID provided in batch generation

- Added autoSelectTemplate() method to batch-generation-service.ts
- Method queries emotional_arcs to get arc_type, then finds matching template
- Falls back to any active template for tier if arc-specific not found
- Modified processItem() to detect NIL_UUID and auto-select template

Fixes: Template resolution failed errors in bulk generation"

git push origin main
```

**Post-Deployment Verification:**
1. Go to https://train-data-three.vercel.app/bulk-generator
2. Select personas, arcs, and topics
3. Start bulk generation
4. Monitor batch job status - items should now succeed

---

## 📁 Important Files Modified This Session

### Primary Fix File
| File | Purpose | Lines Changed |
|------|---------|---------------|
| `src/lib/services/batch-generation-service.ts` | Batch orchestration with auto-template selection | +90 lines (new method + modifications) |

### Documentation Updated
| File | Purpose |
|------|---------|
| `pmc/context-ai/pmct/iteration-1-bulk-processing-table-match-fixes-step-6_v1.md` | Full audit report with both fixes documented |

### Runtime Log Analyzed
| File | Purpose |
|------|---------|
| `pmc/_archive/batch-runtime-7.csv` | Vercel runtime log showing template resolution failures |

---

## 🗄️ Database State

### Tables Verified (via SAOL Queries)

| Table | Status | Notes |
|-------|--------|-------|
| `batch_jobs` | ✅ All columns exist | Status CHECK constraint fixed |
| `batch_items` | ✅ All columns exist | No issues |
| `batch_checkpoints` | ℹ️ Not used | Exists but no codebase references |
| `prompt_templates` | ✅ 7 templates exist | Templates available for auto-selection |
| `emotional_arcs` | ✅ Populated | Used for arc_type lookup |

### Status CHECK Constraint (FIXED)
```sql
-- Current valid values for batch_jobs.status:
'queued', 'processing', 'paused', 'completed', 'failed', 'cancelled'
```

---

## 🔍 Supabase Agent Ops Library (SAOL) Quick Reference

### Import Pattern
```javascript
// Scripts must use load-env.js for environment variables
require('../load-env.js');
const saol = require('@supabase/supabase-agent-ops-lib');
```

### Query Pattern
```javascript
const result = await saol.agentQuery({
  table: 'table_name',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  select: ['column1', 'column2'],
  where: [{ column: 'col', operator: 'eq', value: 'val' }],
  limit: 10,
  transport: 'supabase'
});
```

### CRITICAL SAOL Rules
1. **Always use functional API** - NOT class-based
2. **Always require load-env.js first** - For environment variables
3. **Use supabase transport** - For serverless compatibility
4. **Check result.data and result.error** - Both may be present

---

## 🔄 Bulk Generation Flow (Updated)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. BULK GENERATOR UI (/bulk-generator)                      │
│    - User selects personas, arcs, topics                    │
│    - UI sends NIL_UUID as templateId (placeholder)          │
│    - Calls POST /api/conversations/generate-batch           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. BATCH GENERATION SERVICE                                 │
│    - Creates batch_jobs record with 'queued' status        │
│    - Creates batch_items for each parameter combination    │
│    - Starts background processing                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. PROCESS ITEM (per batch item) - FIXED!                  │
│    - Detects NIL_UUID templateId                           │
│    - Auto-selects template using emotional_arc_id          │
│    - Queries emotional_arcs → get arc_type                 │
│    - Queries prompt_templates → get matching template      │
│    - Uses valid templateId for generation                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. CONVERSATION GENERATION SERVICE                          │
│    - Resolves template with parameters                      │
│    - Calls Claude API                                       │
│    - Stores result in conversation_storage                  │
│    - Updates batch_items status                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Known Remaining Items

### Not Blockers for Bulk Generation

1. **Authentication**: Uses placeholder `x-user-id` header
   - Priority: Later phase
   
2. **Export Functionality**: "Export Selected" button is placeholder
   - Priority: Future feature
   
3. **Bulk Generator UI**: Still sends NIL_UUID (now handled by backend)
   - Priority: Optional improvement

### Potential Future Improvements

1. **Template Selector in UI**: Let users choose template explicitly
2. **Better Error Messages**: Surface template selection info to user
3. **Template Caching**: Cache template lookups for performance

---

## 📊 Test Job Reference

**Last Test Job (FAILED - before fix):**
- Job ID: `79a646b1-c417-4440-99a9-13ebd01784be`
- Total Items: 15
- Failed: 9 (Template not found)
- Remaining: 6 (never processed)
- Success: 0

**After deploying the fix, expect:**
- Job creates successfully
- Items auto-select templates based on emotional_arc_id
- Generation proceeds with valid templates
- Success rate should be high (API/quota permitting)

---

## 🚀 Next Agent Instructions

### Immediate Task
1. **Deploy the code fix** using the git commands above
2. **Test bulk generation** at https://train-data-three.vercel.app/bulk-generator
3. **Verify success** - batch items should complete instead of failing

### If Issues Persist
1. Check Vercel runtime logs for new errors
2. Verify `prompt_templates` table has active templates
3. Verify `emotional_arcs` table has correct `arc_type` values
4. Run SAOL queries to debug (see Quick Reference above)

### Documentation
- Full audit report: `pmc/context-ai/pmct/iteration-1-bulk-processing-table-match-fixes-step-6_v1.md`
- SAOL usage guide: `docs/SAOL_CORRECT_USAGE.md`

---

## Success Criteria

### Deployment Success
- ✅ Git push completes without errors
- ✅ Vercel build succeeds
- ✅ Vercel deployment completes

### Functional Success
- ✅ Bulk generator creates batch job
- ✅ Batch items process without "Template not found" error
- ✅ Conversations are generated and stored
- ✅ Batch job completes with successful items

---

**Document Version:** 1.0  
**Session Date:** November 25-26, 2025  
**Author:** AI Agent (Claude)  
**Classification:** Internal Development Use
