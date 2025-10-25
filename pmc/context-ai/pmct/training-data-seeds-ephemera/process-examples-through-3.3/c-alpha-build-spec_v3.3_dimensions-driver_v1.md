# Dimensions Fix Implementation Driver
**Version:** 1.0  
**Date:** October 7, 2025  
**Purpose:** Master planning document and roadmap for resolving all 36 missing dimensions  
**Status:** Active Planning Document

---

## Executive Summary

This document serves as the **central planning and coordination hub** for fixing all 36 missing chunk dimensions in Bright Run. It provides:

1. **Paths to all modular specification documents**
2. **Recommended implementation order**
3. **Time estimates and priorities**
4. **Dependency mapping**
5. **Success criteria and testing strategy**

### The Big Picture

**Problem:** 36 out of 60 chunk dimensions are not being populated  
**Root Causes:** 4 distinct system issues (Document, Embedding, Prompts, Quick Fixes)  
**Solution:** Modular specifications for each area with clear implementation paths  
**Timeline:** 12-16 hours of work (excluding backlog items)

---

## Document Map: Where Everything Lives

### 1. Document Upload Module
**Path:** `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_document_module_v1.md`

**What It Covers:**
- Document metadata capture during upload (5 dimensions)
- Database schema additions
- Upload form UI enhancements
- Author name resolution

**Dimensions Fixed:** 5
- `doc_version`
- `source_type`
- `source_url`
- `author` (human-readable name)
- `doc_date`

**Estimated Effort:** 6-8 hours

---

### 2. Embedding System (Backlog)
**Path:** `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_embedding-system_v1.md`

**What It Covers:**
- Vector embedding generation pipeline
- Benefits for LoRA training platform
- Storage and search architecture
- Future feature roadmap

**Dimensions Fixed:** 2 (when implemented)
- `embedding_id`
- `vector_checksum`

**Estimated Effort:** 16-40 hours  
**Status:** ⏸️ **BACKLOG** - Not immediate priority

---

### 3. Prompt/LLM API System
**Path:** `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_prompt-llm-api-dimensions_v1.md`

**What It Covers:**
- How AI prompts generate dimensions (non-technical explanation)
- 6 prompt template system
- Database template seeding requirements
- Response mapping fixes

**Dimensions Fixed:** Up to 21 (depends on verification results)
- Training Pair dimensions (3): `prompt_candidate`, `target_answer`, `style_directives`
- Risk dimensions (2): `safety_tags`, `compliance_flags`
- Conditional dimensions (16): Task, CER, Scenario fields

**Estimated Effort:** 2-4 hours

---

### 4. Everything Else (Quick Fixes)
**Path:** `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_every-thing-else-dimensions_v1.md`

**What It Covers:**
- Labeling metadata (4 dimensions)
- Training split assignment (1 dimension)
- Data mapping issues (1 dimension)
- False positives (2 dimensions)

**Dimensions Fixed:** 8
- `label_source_auto_manual_mixed`
- `label_model`
- `labeled_by`
- `label_timestamp_iso`
- `data_split_train_dev_test`
- `chunk_type` (mapping fix)
- `include_in_training_yn` (verification)
- `augmentation_notes` (documentation)

**Estimated Effort:** 1-2 hours

---

### 5. Original Analysis (Reference)
**Path:** `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_missing-dimensions_v1.md`

**What It Is:**
- Comprehensive 900-line root cause analysis
- All 36 missing dimensions categorized
- Detailed code locations and evidence
- Original research document

**Use For:** Reference, deep technical details, code locations

---

## Recommended Implementation Order

### Phase 1: Quick Wins (Day 1 - 2 hours)
**Priority:** CRITICAL  
**Goal:** Get immediate wins with minimal effort

#### Task 1.1: Labeling Metadata (30 min)
**Spec:** Everything Else, Category 1  
**File:** `src/lib/dimension-generation/generator.ts`  
**Lines:** ~172  
**Action:** Add 4 lines of code for labeling defaults

**Code to Add:**
```typescript
label_source_auto_manual_mixed: 'auto',
label_model: AI_CONFIG.model,
labeled_by: 'system',
label_timestamp_iso: new Date().toISOString(),
```

**Test:** Regenerate dimensions, verify 4 fields populated

**Impact:** ✅ 4 dimensions fixed

---

#### Task 1.2: Training Split Assignment (30 min)
**Spec:** Everything Else, Category 2  
**File:** `src/lib/dimension-generation/generator.ts`  
**Lines:** ~172  
**Action:** Add deterministic split logic

**Code to Add:**
```typescript
// Hash function + split calculation (see spec for full code)
data_split_train_dev_test: split,
```

**Test:** Verify 80/10/10 distribution, check determinism

**Impact:** ✅ 1 dimension fixed

---

#### Task 1.3: Training Pair Mapping (30 min)
**Spec:** Prompt/LLM API, Fix #2  
**File:** `src/lib/dimension-generation/generator.ts`  
**Lines:** ~324  
**Action:** Add training_pair_generation response mapping

**Code to Add:**
```typescript
'training_pair_generation': {
  prompt_candidate: response.prompt_candidate,
  target_answer: response.target_answer,
  style_directives: response.style_directives,
},
```

**Test:** Verify prompt runs and 3 fields populate

**Impact:** ✅ 3 dimensions fixed (if template exists in DB)

---

#### Task 1.4: chunk_type Mapping (30 min)
**Spec:** Everything Else, Category 3  
**File:** `src/lib/dimension-service.ts`  
**Lines:** ~178  
**Action:** Add chunk_type to switch statement

**Test:** Check Dimension Validation Spreadsheet shows chunk_type

**Impact:** ✅ 1 dimension fixed

---

**Phase 1 Total:** ~2 hours, **9 dimensions fixed**

---

### Phase 2: Verification & Database Audit (Day 1-2 - 2-3 hours)
**Priority:** CRITICAL  
**Goal:** Verify assumptions about database state

#### Task 2.1: Check Prompt Templates (30 min)
**Spec:** Prompt/LLM API, Fix #1  
**Action:** Query `prompt_templates` table in Supabase

**SQL to Run:**
```sql
SELECT 
  template_name, 
  template_type, 
  is_active,
  chunk_type_filter,
  LENGTH(prompt_text) as prompt_length
FROM prompt_templates
ORDER BY template_name;
```

**Expected Result:** 6 rows, all `is_active = true`

**Possible Outcomes:**
- ✅ **6 templates exist:** Continue to Phase 3
- ❌ **0 templates exist:** Must seed database (Task 2.2)
- ⚠️ **Partial templates:** Identify missing ones, seed only those

---

#### Task 2.2: Seed Prompt Templates (2-3 hours if needed)
**Spec:** Prompt/LLM API, Fix #1  
**Source:** `pmc/product/_prompt_engineering/dimensions-prompts_v1.md`  
**Action:** Create SQL seed script

**Process:**
1. Extract prompt text from source document (902 lines)
2. Create INSERT statements for each template
3. Include: template_name, template_type, prompt_text, chunk_type_filter, is_active
4. Run in Supabase SQL editor
5. Verify all 6 templates inserted

**Templates to Seed:**
1. Content Analysis (`content_analysis`, NULL filter)
2. Task Extraction (`task_extraction`, filter: `['Instructional_Unit']`)
3. CER Analysis (`cer_analysis`, filter: `['CER']`)
4. Scenario Extraction (`scenario_extraction`, filter: `['Example_Scenario']`)
5. Training Pair Generation (`training_pair_generation`, NULL filter)
6. Risk Assessment (`risk_assessment`, NULL filter)

**Impact:** Enables ALL AI dimension generation

---

#### Task 2.3: Verify Chunk Type (15 min)
**Spec:** Prompt/LLM API, Fix #4  
**Action:** Check test chunk's chunk_type

**SQL to Run:**
```sql
SELECT 
  id as chunk_id,
  chunk_type,
  LEFT(chunk_text, 200) as preview
FROM chunks
WHERE id = '<test-chunk-id>';
```

**Purpose:** Determine if missing Task/CER/Scenario dimensions are expected

**Decision Tree:**
- If `chunk_type = 'Chapter_Sequential'` → Missing Task/CER/Scenario dimensions are EXPECTED
- If `chunk_type = 'Instructional_Unit'` → Missing Task dimensions are BUGS
- If `chunk_type = 'CER'` → Missing CER dimensions are BUGS
- If `chunk_type = 'Example_Scenario'` → Missing Scenario dimensions are BUGS

---

#### Task 2.4: Check Risk Assessment Fields (30 min)
**Spec:** Prompt/LLM API, Fix #3  
**Action:** Verify `safety_tags` and `compliance_flags` in prompt template

**Steps:**
1. Look at Risk Assessment template in database (from Task 2.1)
2. Verify JSON schema includes `safety_tags` and `compliance_flags`
3. Test with a chunk that should trigger these flags
4. Check if Claude's response includes these fields
5. Verify response mapping includes them

**Impact:** Confirms if 2 dimensions are actually missing or just not triggered

---

**Phase 2 Total:** 2-3 hours (if templates need seeding), **verification complete**

---

### Phase 3: Document Module Implementation (Week 1 - 6-8 hours)
**Priority:** HIGH  
**Goal:** Capture complete document metadata during upload

#### Task 3.1: Database Migration (30 min)
**Spec:** Document Module, Component 1  
**Action:** Add 4 columns to documents table

**SQL to Run:**
```sql
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS doc_version TEXT,
  ADD COLUMN IF NOT EXISTS source_type TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS doc_date TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_documents_source_type ON documents(source_type);
```

**Test:** Verify columns exist via Supabase schema browser

---

#### Task 3.2: Update Upload Service (1 hour)
**Spec:** Document Module, Component 2  
**File:** `src/lib/database.ts`  
**Lines:** ~395  
**Action:** Modify `uploadDocument()` function

**Changes:**
1. Add source type auto-detection logic
2. Update function signature to accept metadata parameter
3. Update INSERT statement to include new fields
4. Update TypeScript types

**Test:** Upload a file programmatically, verify database record

---

#### Task 3.3: Build Upload Form UI (3-4 hours)
**Spec:** Document Module, Component 3  
**File:** Locate current upload form component  
**Action:** Add 3 optional input fields + 2 display fields

**UI Components to Add:**
1. Document Version (text input, optional)
2. Source URL (URL input, optional)
3. Document Date (date picker, optional)
4. File Type (display, auto-detected)
5. Author (display, current user name)

**Design:** Follow existing UI patterns, use shadcn/ui components

**Test:** Upload via UI, verify form submission works

---

#### Task 3.4: Author Name Resolution (1-2 hours)
**Spec:** Document Module, Component 4  
**File:** `src/lib/dimension-generation/generator.ts`  
**Lines:** ~76  
**Action:** Query user_profiles to get human-readable author name

**Changes:**
1. Add query to fetch author profile
2. Use full_name or email as fallback
3. Update documentMetadata object

**Test:** Generate dimensions, verify author shows name not UUID

---

**Phase 3 Total:** 6-8 hours, **5 dimensions fixed**

---

### Phase 4: Integration Testing (Day 3-4 - 2-3 hours)
**Priority:** CRITICAL  
**Goal:** Verify all fixes work together

#### Test Suite 1: Quick Wins Verification (30 min)
**Action:** Regenerate dimensions for test chunk

**Verify:**
- ✅ Labeling metadata (4 fields) populated
- ✅ Training split assigned
- ✅ chunk_type visible in spreadsheet
- ✅ Training Pair dimensions populated (if template exists)

---

#### Test Suite 2: Prompt System Verification (1 hour)
**Action:** Test dimension generation with different chunk types

**Test Cases:**
1. Chapter_Sequential chunk → Content + Risk only
2. Instructional_Unit chunk → Content + Task + Risk
3. CER chunk → Content + CER + Risk
4. Example_Scenario chunk → Content + Scenario + Risk

**Verify:** Conditional prompts fire correctly

---

#### Test Suite 3: Document Module Verification (1 hour)
**Action:** Upload new document with full metadata

**Steps:**
1. Upload document via UI with all optional fields filled
2. Verify document record in database has all fields
3. Extract chunks from document
4. Generate dimensions
5. Check that 5 "Prior" dimensions are populated in all chunks

---

#### Test Suite 4: End-to-End Validation (30 min)
**Action:** Complete workflow test

**Steps:**
1. Upload new document with metadata
2. Wait for chunk extraction
3. Generate dimensions
4. View in Dimension Validation Spreadsheet
5. Count populated dimensions

**Expected Result:** 
- Before fixes: 24/60 dimensions populated (40%)
- After fixes: 55-58/60 dimensions populated (92-97%)
  - Excluding embedding (2) and conditional dimensions for wrong chunk types

---

**Phase 4 Total:** 2-3 hours, **validation complete**

---

### Phase 5: Backlog - Embedding System (Future)
**Priority:** LOW  
**Goal:** Implement when needed  
**Timeline:** 2-4 weeks (when prioritized)

**Spec:** See Embedding System document

**Decision Criteria:**
- [ ] All core dimensions working
- [ ] User feedback indicates need
- [ ] Clear use case prioritized
- [ ] Available development time (2-4 weeks)

**Impact:** 2 dimensions fixed (embedding_id, vector_checksum)

---

## Dependency Map

```
Phase 1: Quick Wins
  ↓ (No dependencies)
  ✅ Can start immediately

Phase 2: Verification
  ↓ (Informs Phase 3 & 4)
  ⚠️ Must complete before knowing if templates need seeding

Phase 3: Document Module
  ↓ (Independent, can run parallel to Phase 2)
  ✅ No dependencies on other phases

Phase 4: Integration Testing
  ↓ (Requires Phase 1, 2, 3 complete)
  ⚠️ Must wait for all fixes

Phase 5: Embedding System
  ↓ (Can run anytime)
  ✅ Independent, backlog feature
```

**Parallel Work Possible:**
- Phase 1 (Quick Wins) + Phase 3 (Document Module) can be done simultaneously by different developers
- Phase 2 (Verification) should be done early to inform priorities

---

## Time Estimates Summary

| Phase | Tasks | Time | Dimensions Fixed | Priority |
|-------|-------|------|-----------------|----------|
| **Phase 1: Quick Wins** | 4 | 2 hours | 9 | CRITICAL |
| **Phase 2: Verification** | 4 | 2-3 hours | 0 (validation only) | CRITICAL |
| **Phase 3: Document Module** | 4 | 6-8 hours | 5 | HIGH |
| **Phase 4: Integration Testing** | 4 | 2-3 hours | 0 (testing only) | CRITICAL |
| **Phase 5: Embedding (Backlog)** | 10 | 16-40 hours | 2 | LOW |

**Total Active Work:** 12-16 hours  
**Total Dimensions Fixed:** 14-30 (depending on verification results)  
**Backlog Work:** 16-40 hours (when prioritized)

---

## Success Criteria

### Minimum Viable Success (MVP)
- ✅ Quick wins implemented (9 dimensions)
- ✅ Prompt templates verified/seeded
- ✅ Document module implemented (5 dimensions)
- ✅ Integration tests passing
- **Result:** 50-55/60 dimensions populated (83-92%)

### Full Success (Excluding Backlog)
- ✅ All active phases complete
- ✅ Conditional dimensions working correctly
- ✅ All non-embedding dimensions populated
- **Result:** 56-58/60 dimensions populated (93-97%)
  - 2 embedding dimensions in backlog

### Complete Success (Including Backlog)
- ✅ Embedding system implemented
- ✅ All 60 dimensions populated
- **Result:** 60/60 dimensions populated (100%)

---

## Testing Strategy

### Unit Tests
**Location:** Add to existing test suite

```typescript
describe('Dimension Generation', () => {
  test('Labeling metadata is set', () => {
    // Test label_source, label_model, labeled_by, label_timestamp
  });

  test('Training split is deterministic', () => {
    // Test data_split_train_dev_test
  });

  test('Training pair mapping works', () => {
    // Test prompt_candidate, target_answer, style_directives
  });

  test('chunk_type is mapped from chunks table', () => {
    // Test chunk_type visibility
  });
});
```

### Integration Tests
```typescript
describe('Document Upload with Metadata', () => {
  test('Metadata flows through to dimensions', () => {
    // Upload → Extract → Generate → Verify 5 prior dimensions
  });
});

describe('Conditional Prompts', () => {
  test('Task prompt only runs for Instructional_Unit', () => {
    // Test chunk_type filtering
  });
});
```

### Manual Testing Checklist
- [ ] Upload document with full metadata
- [ ] Verify document record has all fields
- [ ] Extract chunks
- [ ] Generate dimensions
- [ ] View Dimension Validation Spreadsheet
- [ ] Count populated dimensions (should be 55-58/60)
- [ ] Verify chunk_type shows correctly
- [ ] Verify labeling metadata populated
- [ ] Verify training split assigned
- [ ] Verify document metadata inherited by chunks
- [ ] Test with different chunk types (Chapter, Task, CER, Scenario)

---

## Risk Assessment

### High Risk
1. **Prompt templates missing from database**
   - **Impact:** Zero AI dimensions generated
   - **Mitigation:** Phase 2 verification catches this early
   - **Solution:** Seed database (2-3 hours)

2. **Database schema missing columns**
   - **Impact:** Document metadata can't be stored
   - **Mitigation:** Migration in Phase 3 adds columns
   - **Solution:** Run ALTER TABLE statements

### Medium Risk
1. **Conditional dimensions confusion**
   - **Impact:** Users expect dimensions that shouldn't exist for chunk type
   - **Mitigation:** Clear documentation, UI tooltips
   - **Solution:** Explain chunk-type-aware system

2. **Author name resolution fails**
   - **Impact:** Author shows as UUID instead of name
   - **Mitigation:** Fallback chain (name → email → UUID)
   - **Solution:** Always have fallback value

### Low Risk
1. **Quick wins introduce bugs**
   - **Impact:** New code breaks existing functionality
   - **Mitigation:** Unit tests, code review
   - **Solution:** Thorough testing before deploy

2. **Integration test failures**
   - **Impact:** Fixes don't work together
   - **Mitigation:** Phase 4 catches this
   - **Solution:** Debug and fix integration issues

---

## Rollback Plan

If something breaks:

### Rollback Phase 1 (Quick Wins)
1. Revert `generator.ts` changes (git revert)
2. Redeploy previous version
3. Dimensions will be missing but system still works

### Rollback Phase 3 (Document Module)
1. Document upload still works (just doesn't capture metadata)
2. Can revert database migration if needed
3. Existing documents unaffected

### Emergency Recovery
- System always works with missing dimensions (just shows NULL)
- No breaking changes to core functionality
- Can fix incrementally without full rollback

---

## Communication Plan

### Status Updates
**After Phase 1:** "9 dimensions fixed via quick code updates (2 hours work)"  
**After Phase 2:** "Database audit complete, [X templates needed seeding]"  
**After Phase 3:** "Document upload enhanced, 5 more dimensions now captured"  
**After Phase 4:** "Integration testing complete, [X/60] dimensions now populated"

### Stakeholder Report
```
Dimension Fix Progress Report
Date: [Date]

Status: [X/36] missing dimensions resolved

Completed:
- ✅ Quick wins (9 dimensions) - 2 hours
- ✅ Database verification - 3 hours
- ✅ Document module (5 dimensions) - 7 hours
- ✅ Integration testing - 3 hours

Remaining:
- ⏸️ Embedding system (2 dimensions) - Backlog

Current State: [X/60] dimensions populated ([X]%)

Next Steps: [...]
```

---

## Reference Links

### Specifications
- Document Module: `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_document_module_v1.md`
- Embedding System: `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_embedding-system_v1.md`
- Prompt/LLM API: `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_prompt-llm-api-dimensions_v1.md`
- Everything Else: `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_every-thing-else-dimensions_v1.md`
- Original Analysis: `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_missing-dimensions_v1.md`

### Code Locations
- Dimension Generator: `src/lib/dimension-generation/generator.ts` (461 lines)
- Dimension Metadata: `src/lib/dimension-metadata.ts` (900 lines)
- Dimension Service: `src/lib/dimension-service.ts` (375 lines)
- Database Service: `src/lib/database.ts` (upload function ~line 395)
- Prompt Templates Source: `pmc/product/_prompt_engineering/dimensions-prompts_v1.md` (902 lines)

### Database Tables
- `documents` - Document records with metadata
- `chunks` - Chunk records with mechanical metadata
- `chunk_dimensions` - AI-generated and other dimensions
- `chunk_runs` - Dimension generation run tracking
- `prompt_templates` - AI prompt template storage
- `user_profiles` - User information (for author name resolution)

---

## Next Actions for Product Owner

### Immediate (This Week)
1. **Review all 5 specification documents**
2. **Approve Phase 1 (Quick Wins) for immediate implementation**
3. **Assign Phase 2 (Verification) to verify database state**
4. **Prioritize Phase 3 (Document Module) for Week 1**

### Short Term (Next 2 Weeks)
1. **Monitor Phase 4 (Integration Testing) results**
2. **Decide on acceptable dimension population rate** (100%? 95%? 90%?)
3. **Gather user feedback on missing dimensions** (are any critical?)

### Long Term (Month 1-2)
1. **Evaluate if Embedding System should be prioritized**
2. **Determine if chunk-type-aware dimensions are clear to users**
3. **Plan for accuracy score improvements** (replace MVP version)

---

## Appendix: Quick Reference

### Fast Lookup: Where Is Dimension X?

| Dimension | Spec Document | Fix Effort | Priority |
|-----------|--------------|------------|----------|
| doc_version | Document Module | 6-8 hrs | HIGH |
| source_type | Document Module | 6-8 hrs | HIGH |
| source_url | Document Module | 6-8 hrs | HIGH |
| author | Document Module | 6-8 hrs | HIGH |
| doc_date | Document Module | 6-8 hrs | HIGH |
| embedding_id | Embedding System | 16-40 hrs | LOW (Backlog) |
| vector_checksum | Embedding System | 16-40 hrs | LOW (Backlog) |
| label_source_auto_manual_mixed | Everything Else | 5 min | CRITICAL |
| label_model | Everything Else | 5 min | CRITICAL |
| labeled_by | Everything Else | 5 min | CRITICAL |
| label_timestamp_iso | Everything Else | 5 min | CRITICAL |
| data_split_train_dev_test | Everything Else | 10 min | CRITICAL |
| chunk_type | Everything Else | 5 min | MEDIUM |
| prompt_candidate | Prompt/LLM API | 5 min | CRITICAL |
| target_answer | Prompt/LLM API | 5 min | CRITICAL |
| style_directives | Prompt/LLM API | 5 min | CRITICAL |
| safety_tags | Prompt/LLM API | 30 min | MEDIUM |
| compliance_flags | Prompt/LLM API | 30 min | MEDIUM |
| task_* (6 fields) | Prompt/LLM API | Verify | MEDIUM |
| claim, evidence_* (5 fields) | Prompt/LLM API | Verify | MEDIUM |
| scenario_* (5 fields) | Prompt/LLM API | Verify | MEDIUM |
| include_in_training_yn | Everything Else | 0 min | LOW (Verify) |
| augmentation_notes | Everything Else | 0 min | LOW (Doc) |

---

**End of Dimensions Fix Implementation Driver**

This document should be your starting point for all dimension fix work. Refer to the specific spec documents for detailed implementation guidance.

