# Context Carryover: Turn-Level Truncation Detection Fix

## 📌 Active Development Focus

**Primary Task**: Fix the turn-level truncation detection system so it catches truncated content INSIDE individual conversation turns.

**Current Status**:
- ✅ `stop_reason` capture implemented in `claude-api-client.ts`
- ✅ `detectTruncatedContent()` utility exists in `truncation-detection.ts`
- ✅ `detectTruncatedTurns()` utility exists (but NEVER CALLED)
- ✅ `failed_generations` database table exists (0 records)
- ✅ `/conversations/failed` UI page exists and is fully implemented
- ✅ `FailedGenerationService` exists with full storage capability
- ❌ **CRITICAL BUG**: Truncation detection checks the WRONG LEVEL of data
- ⏳ **NEXT**: Fix validation to check individual turn content, not entire JSON response

---

## 🚨 Critical Discovery: 4 Bugs Preventing System From Working

### Investigation Report Location
**Full Report**: `pmc/context-ai/pmct/iteration-2-bug-fixing-step-2-truncation-bugs_v1.md`

### Bug Summary

| Bug | Severity | Issue | Fix Required |
|-----|----------|-------|--------------|
| **Bug 1** | CRITICAL | `detectTruncatedContent()` runs on entire JSON response | Call `detectTruncatedTurns()` on parsed turns array |
| **Bug 2** | CRITICAL | `detectTruncatedTurns()` utility exists but is NEVER called in pipeline | Add call after JSON parsing |
| **Bug 3** | MEDIUM | Validation runs BEFORE JSON parsing, so can't check turn content | Add second validation pass AFTER parsing |
| **Bug 4** | LOW | No truncation flag on conversations table | Add `truncation_detected` boolean |

### Root Cause Explained

When Claude uses Structured Outputs (`anthropic-beta: structured-outputs-2025-11-13`), it is **guaranteed** to return valid JSON. This means:

1. Claude returns `stop_reason: end_turn` ✅
2. Claude returns valid JSON structure (all brackets closed) ✅
3. **But Claude may truncate content INSIDE string fields to fit the structure** ❌

**Current Code** (BROKEN):
```typescript
// In conversation-generation-service.ts validateAPIResponse()
const truncationCheck = detectTruncatedContent(apiResponse.content);
//                                             ^^^^^^^^^^^^^^^^^^
//                                             THIS IS THE ENTIRE JSON STRING
```

The function sees:
```json
{"title": "...", "turns": [{"role": "assistant", "content": "truncated\\"}]}
```

It checks if this ends with `}` → Yes, it does → **Pattern `PROPER_ENDINGS` matches `}`** → `isTruncated: false`

**The truncation inside `"content": "truncated\\"` is NEVER detected.**

---

## 🎯 What Needs to Be Fixed

### The Fix is Straightforward

**Current Code** (line ~395 in `conversation-generation-service.ts`):
```typescript
// VALIDATION 2: Check content for truncation patterns
const truncationCheck = detectTruncatedContent(apiResponse.content);  // ❌ WRONG

if (truncationCheck.isTruncated) {
  throw new TruncatedResponseError(...);
}
```

**Required Fix**:
```typescript
// VALIDATION 2: Check content for truncation patterns (on raw JSON)
const truncationCheck = detectTruncatedContent(apiResponse.content);

if (truncationCheck.isTruncated) {
  throw new TruncatedResponseError(...);
}

// VALIDATION 3: Check individual turn content (NEW - CRITICAL)
try {
  const parsed = JSON.parse(apiResponse.content);
  
  if (parsed.turns && Array.isArray(parsed.turns)) {
    const truncatedTurns = detectTruncatedTurns(parsed.turns);
    
    if (truncatedTurns.length > 0) {
      const details = truncatedTurns
        .map(t => `Turn ${t.turnIndex}: ${t.result.pattern}`)
        .join(', ');
      
      console.warn(`[${generationId}] ⚠️ Truncated turns detected: ${details}`);
      
      throw new TruncatedResponseError(
        `Content truncated in ${truncatedTurns.length} turns: ${details}`,
        apiResponse.stop_reason,
        truncatedTurns[0].result.pattern
      );
    }
  }
} catch (parseError) {
  // If JSON parsing fails, we'll catch it later in the pipeline
  // Don't throw here - let the normal parse error handling deal with it
  if (!(parseError instanceof TruncatedResponseError)) {
    console.warn(`[${generationId}] Could not parse content for turn-level validation`);
  } else {
    throw parseError;  // Re-throw TruncatedResponseError
  }
}
```

### Files to Modify

**Primary File**: `src/lib/services/conversation-generation-service.ts`
- Location: `validateAPIResponse()` method (around line 378-407)
- Change: Add turn-level validation after existing validation
- Import: Add `detectTruncatedTurns` from `truncation-detection.ts`

**Current Import** (line ~20):
```typescript
import { detectTruncatedContent } from '@/lib/utils/truncation-detection';
```

**Required Import**:
```typescript
import { detectTruncatedContent, detectTruncatedTurns } from '@/lib/utils/truncation-detection';
```

---

## 📋 Implementation Checklist

### Phase 1: Add Turn-Level Validation (CRITICAL)

- [ ] Open `src/lib/services/conversation-generation-service.ts`
- [ ] Find `validateAPIResponse()` method (around line 378)
- [ ] Add import for `detectTruncatedTurns`
- [ ] Add turn-level validation code after existing `detectTruncatedContent` check
- [ ] Test with a known truncated file

### Phase 2: Test the Fix

- [ ] Generate a new conversation through the API
- [ ] Verify truncated turns are now caught
- [ ] Check that `/conversations/failed` page shows the failure
- [ ] Verify `failed_generations` table has a record

### Phase 3: Retroactive Scan (Optional)

- [ ] Create script to scan existing conversations for truncated turns
- [ ] Mark affected conversations for review
- [ ] Consider adding `truncation_detected` flag to schema

---

## 🔍 What Already Works (DO NOT MODIFY)

### 1. stop_reason Capture ✅
**File**: `src/lib/services/claude-api-client.ts` (lines 284-298)

```typescript
// Already implemented correctly:
const stopReason = data.stop_reason;
console.log(`[${requestId}] stop_reason: ${stopReason}`);
// Returns in response object
return {
  // ...
  stop_reason: stopReason,
  // ...
};
```

### 2. Truncation Detection Utility ✅
**File**: `src/lib/utils/truncation-detection.ts`

Both functions exist and work correctly:
- `detectTruncatedContent(content: string)` - Checks single string
- `detectTruncatedTurns(turns: Array<...>)` - Checks all assistant turns ← **THIS IS NOT BEING CALLED**

### 3. Failed Generation Service ✅
**File**: `src/lib/services/failed-generation-service.ts`

Fully implemented with:
- `storeFailedGeneration()` - Creates DB record + uploads error file
- `getFailedGeneration()` - Retrieve single failure
- `listFailedGenerations()` - List with pagination
- `getFailureStatistics()` - Aggregate stats

### 4. Failed Generations Database Table ✅
```sql
-- Table exists and is empty (0 records)
SELECT COUNT(*) FROM failed_generations;  -- Returns 0
```

### 5. Failed Generations UI ✅
**File**: `src/app/(dashboard)/conversations/failed/page.tsx`

Fully implemented with:
- Table view of failures
- Filters by failure type, stop reason, date
- Error report modal
- Download button

---

## 🔍 Supabase Agent Ops Library (SAOL) Quick Reference

### Setup & Usage

**Installation**: Already available in project
```bash
# SAOL is installed and configured
# Located in supa-agent-ops/ directory
```

**Basic Query Pattern**:
```bash
cd supa-agent-ops && node -e "require('dotenv').config({path:'../.env.local'});const saol=require('.');(async()=>{const res=await saol.agentQuery({table:'failed_generations',limit:10});console.log(JSON.stringify(res,null,2))})();"
```

### Common Queries for This Implementation

**1. Check failed_generations count**:
```bash
cd supa-agent-ops && node -e "require('dotenv').config({path:'../.env.local'});const saol=require('.');(async()=>{const res=await saol.agentQuery({table:'failed_generations',count:true});console.log(JSON.stringify(res,null,2))})();"
```

**2. View recent failed generations**:
```bash
cd supa-agent-ops && node -e "require('dotenv').config({path:'../.env.local'});const saol=require('.');(async()=>{const res=await saol.agentQuery({table:'failed_generations',orderBy:'created_at',ascending:false,limit:10});console.log(JSON.stringify(res,null,2))})();"
```

**3. Check if table exists**:
```bash
cd supa-agent-ops && node -e "require('dotenv').config({path:'../.env.local'});const saol=require('.');saol.agentIntrospectSchema({table:'failed_generations',transport:'pg'}).then(console.log)"
```

### SAOL Tips
- Always use `.env.local` for local development
- Use admin credentials (service_role_key) to bypass RLS
- Run from `supa-agent-ops` directory

---

## 📋 Project Context

### What This Application Does

**BrightHub BRun LoRA Training Data Platform** - A Next.js 14 application that generates emotionally-intelligent financial planning training conversations for LoRA fine-tuning.

### Current Architecture State

**Generation Pipeline**:
```
Scaffolding Selection → Template Resolution → Claude API →
[VALIDATION 1: stop_reason check] ✅ WORKS →
[VALIDATION 2: raw JSON truncation check] ❌ WRONG SCOPE →
[VALIDATION 3: turn-level truncation check] ❌ MISSING →
Quality Validation → Individual JSON Storage →
Enrichment → Full File Aggregation → JSONL Export
```

### Key Services

| Service | File | Status |
|---------|------|--------|
| ClaudeAPIClient | `src/lib/services/claude-api-client.ts` | ✅ Captures stop_reason correctly |
| ConversationGenerationService | `src/lib/services/conversation-generation-service.ts` | ⚠️ Needs turn-level validation |
| Truncation Detection | `src/lib/utils/truncation-detection.ts` | ✅ Functions exist, underutilized |
| FailedGenerationService | `src/lib/services/failed-generation-service.ts` | ✅ Ready, never triggered |
| Failed Generations UI | `src/app/(dashboard)/conversations/failed/page.tsx` | ✅ Ready, shows empty table |

### Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI**: Claude API (Anthropic) - `claude-sonnet-4-5-20250929`
- **Structured Outputs**: `anthropic-beta: structured-outputs-2025-11-13`

---

## 📁 Important Files & Locations

### Files to Modify (Priority Order)

1. **`src/lib/services/conversation-generation-service.ts`** - Add turn-level validation
   - Method: `validateAPIResponse()` (line ~378)
   - Import: Add `detectTruncatedTurns`

### Reference Files (DO NOT MODIFY)

| File | Purpose |
|------|---------|
| `src/lib/utils/truncation-detection.ts` | Contains `detectTruncatedTurns()` function |
| `src/lib/services/claude-api-client.ts` | Already captures `stop_reason` correctly |
| `src/lib/services/failed-generation-service.ts` | Already fully implemented |
| `src/app/(dashboard)/conversations/failed/page.tsx` | UI already fully implemented |

### Investigation Report

| Document | Location |
|----------|----------|
| Bug Investigation Report | `pmc/context-ai/pmct/iteration-2-bug-fixing-step-2-truncation-bugs_v1.md` |
| Original Truncation Investigation | `pmc/context-ai/pmct/iteration-2-bug-fixing-step-2-truncation_v4.md` |

### Example Truncated File (For Testing)

| File | Purpose |
|------|---------|
| `pmc/_archive/single-convo-file-3-RAW.json` | Known truncated file for testing detection |

---

## 🎯 Success Criteria

### After Fix is Applied

- [ ] `detectTruncatedTurns()` is called on parsed conversation turns
- [ ] Truncated assistant turns throw `TruncatedResponseError`
- [ ] Failed generations are stored in `failed_generations` table
- [ ] `/conversations/failed` page shows the failures
- [ ] Production pipeline does NOT accept truncated conversations

### Verification Steps

1. Generate a new conversation via API
2. If truncated, verify it appears in `/conversations/failed`
3. Query `failed_generations` table via SAOL to confirm record exists
4. Check that `conversation_storage` table does NOT have the truncated conversation

---

## 🚀 Ready to Begin?

**Next agent should**:

1. **READ**: This context carryover document completely
2. **READ**: Bug investigation report at `pmc/context-ai/pmct/iteration-2-bug-fixing-step-2-truncation-bugs_v1.md`
3. **MODIFY**: `src/lib/services/conversation-generation-service.ts`
   - Add import for `detectTruncatedTurns`
   - Add turn-level validation in `validateAPIResponse()` method
4. **TEST**: Generate a conversation and verify truncation detection works
5. **VERIFY**: Check `/conversations/failed` page and `failed_generations` table

**The fix is small but critical**:
- Add 1 import
- Add ~20 lines of validation code
- The infrastructure (storage, UI, database) is already built

**Expected Outcome**:
- Truncated content INSIDE turns is now detected
- Failed generations are properly stored and visible
- Production pipeline is protected from truncated training data

---

**Last Updated**: 2025-12-02 (Turn-Level Truncation Bug Investigation Complete)
**Next Session Focus**: Implement Turn-Level Truncation Validation Fix
**Document Version**: bb (post-bug-investigation)
