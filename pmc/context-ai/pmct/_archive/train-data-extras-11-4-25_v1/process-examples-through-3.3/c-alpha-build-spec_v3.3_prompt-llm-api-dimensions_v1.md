# LLM API Prompt System for Dimension Generation
**Version:** 1.0  
**Date:** October 7, 2025  
**Purpose:** Non-technical explanation of how AI prompts generate dimensions  
**Audience:** Product owners, managers, non-technical stakeholders

---

## Executive Summary

Bright Run uses AI (specifically Claude) to automatically analyze chunk text and generate 35 different dimensions. This document explains **how that system works operationally**, what's **currently missing or incomplete**, and what needs to be **improved** to get all dimensions working.

**Key Finding:** The AI prompt system is partially complete. Some prompts are working, some mappings are missing, and we need to verify that all prompt templates exist in the database.

---

## How the AI Dimension System Works

### The Big Picture

Think of the AI dimension generation like this:

**Input:** Raw text from a chunk (like a paragraph from your business playbook)

**Process:** Send that text through 5-6 specialized AI prompts, each one extracting different information

**Output:** 35 AI-generated dimensions that describe the content, style, structure, and training value

### The 6 AI Prompt Templates

Each prompt template is like a specialized questionnaire that Claude fills out by reading the chunk:

#### 1. **Content Analysis Prompt**
**What it extracts:**
- Chunk summary (one sentence)
- Key terms and concepts
- Intended audience
- Author's intent (educate, instruct, persuade, etc.)
- Tone and voice characteristics
- Brand persona traits
- Domain topics

**Think of it like:** "Read this text and tell me what it's about, who it's for, and how it sounds."

**Status:** ✅ **Working** - Prompt exists, mapping complete

---

#### 2. **Task Extraction Prompt** (Conditional)
**What it extracts:**
- Task name (what procedure is being taught)
- Prerequisites (what you need before starting)
- Required inputs
- Step-by-step instructions (as structured JSON)
- Expected outcomes
- Common pitfalls and warnings

**Think of it like:** "If this text teaches someone to do something, break down the procedure into clear steps."

**Activation Rule:** Only runs if chunk is type "Instructional_Unit"

**Status:** ✅ **Working** - Prompt exists, mapping complete, conditional logic working

---

#### 3. **CER Analysis Prompt** (Conditional)
**What it extracts:**
- Main claim being made
- Evidence supporting the claim
- Reasoning/logic connecting evidence to claim
- Citations and sources
- Confidence score for factual accuracy

**Think of it like:** "If this text makes an argument, identify the claim, supporting evidence, and logical reasoning."

**Activation Rule:** Only runs if chunk is type "CER" (Claim-Evidence-Reasoning)

**Status:** ✅ **Working** - Prompt exists, mapping complete, conditional logic working

---

#### 4. **Scenario Extraction Prompt** (Conditional)
**What it extracts:**
- Type of example (case study, dialogue, Q&A, etc.)
- Problem context
- Solution or action taken
- Outcome metrics
- Style notes for mimicking the narrative

**Think of it like:** "If this text tells a story or example, extract the situation, solution, and results."

**Activation Rule:** Only runs if chunk is type "Example_Scenario"

**Status:** ✅ **Working** - Prompt exists, mapping complete, conditional logic working

---

#### 5. **Training Pair Generation Prompt**
**What it extracts:**
- Potential user question (what someone might ask to get this info)
- Ideal answer (how to respond in brand voice)
- Style directives (formatting and voice guidelines)

**Think of it like:** "Turn this content into a question-answer training pair for the AI model."

**Activation Rule:** Should run for ALL chunk types

**Status:** ❌ **BROKEN** - Prompt may exist in docs, but mapping is **MISSING** from code

---

#### 6. **Risk Assessment Prompt**
**What it extracts:**
- Safety tags (sensitive topics to flag)
- Coverage tag (how core this content is)
- Novelty tag (common knowledge vs unique IP)
- IP sensitivity level
- PII flag (personal data present?)
- Compliance flags (legal/regulatory concerns)

**Think of it like:** "Flag any sensitive, confidential, or legally important aspects of this content."

**Activation Rule:** Should run for ALL chunk types

**Status:** ⚠️ **PARTIALLY WORKING** - Prompt exists and most fields map correctly, but need to verify `safety_tags` and `compliance_flags` are being populated

---

## The Two-Part Problem

### Part 1: Prompt Templates May Not Be in Database

**What We Know:**
- The prompt template text exists in a specification document: `pmc/product/_prompt_engineering/dimensions-prompts_v1.md`
- The code expects to find 6 prompt templates in the `prompt_templates` table
- We don't know if those templates have actually been **seeded** (loaded) into the database

**Code Location:** `src/lib/dimension-generation/generator.ts`, line 182
```typescript
// Code tries to fetch templates from database
let templates = await promptTemplateService.getActiveTemplates(chunk.chunk_type);
```

**What Happens If Templates Are Missing:**
- `getActiveTemplates()` returns an empty array `[]`
- The prompt execution loop never runs
- **Zero AI dimensions get generated**
- All 35 AI fields stay null/empty

**How to Verify:**
1. Open Supabase dashboard
2. Look at the `prompt_templates` table
3. Count how many rows exist
4. Expected: 6 active templates
5. If table is empty or has fewer than 6, we need to seed it

**How to Fix:**
1. Take prompt text from `pmc/product/_prompt_engineering/dimensions-prompts_v1.md`
2. Create SQL INSERT statements
3. Load all 6 templates into the database
4. Set `is_active = true` for each
5. Set `chunk_type_filter` correctly (NULL for all types, or specific array for conditionals)

---

### Part 2: Response Mapping is Incomplete

Even if all prompts exist in the database, the code needs to know how to **map** Claude's JSON response back to dimension fields.

**Code Location:** `src/lib/dimension-generation/generator.ts`, lines 283-327

**How It Works:**
1. Claude responds with JSON (e.g., `{"claim": "...", "evidence_snippets": [...]}`)
2. Code looks up which template was used (e.g., "cer_analysis")
3. Code uses a mapping table to assign JSON fields to dimension fields
4. Dimensions get populated

**What's Working:**
✅ Content Analysis mapping exists  
✅ Task Extraction mapping exists  
✅ CER Analysis mapping exists  
✅ Scenario Extraction mapping exists  
✅ Risk Assessment mapping exists  

**What's Missing:**
❌ **Training Pair Generation mapping does NOT exist**

**Impact:**
Even if the Training Pair Generation prompt runs and Claude responds correctly, the code doesn't know what to do with the response. The 3 dimensions (`prompt_candidate`, `target_answer`, `style_directives`) never get saved.

**Code Fix Needed:**
Around line 324, add this mapping:
```typescript
'training_pair_generation': {
  prompt_candidate: response.prompt_candidate,
  target_answer: response.target_answer,
  style_directives: response.style_directives,
},
```

---

## Why Are 24 Dimensions Missing?

Let's break down the 24 missing AI-generated dimensions:

### Scenario A: Test Chunk is "Chapter_Sequential" Type
If your test chunk is a general narrative/chapter (not instructional, not CER, not scenario), then:

**Expected Missing (Correct Behavior):**
- ✅ 6 Task dimensions (only for Instructional_Unit chunks)
- ✅ 5 CER dimensions (only for CER chunks)
- ✅ 5 Scenario dimensions (only for Example_Scenario chunks)

**Total expected missing:** 16 dimensions

**Unexpected Missing (Bugs):**
- ❌ 3 Training Pair dimensions (should work for all types)
- ❌ 2 Risk dimensions: `safety_tags`, `compliance_flags` (need verification)

**Total unexpected missing:** 5 dimensions

---

### Scenario B: Templates Not Seeded in Database
If the `prompt_templates` table is empty or incomplete:

**What Happens:**
- ALL AI prompts fail to run
- ALL 35 AI dimensions stay null
- You see basically nothing populated except mechanical fields

**Fix:**
Seed the database with all 6 prompt templates.

---

### Scenario C: Prompts Run But Fields Don't Map
If prompts run successfully but some dimension fields stay empty:

**Possible Causes:**
1. Claude's JSON response doesn't match expected field names
2. Response mapping is incomplete (like Training Pair Generation)
3. Prompt template doesn't actually ask for certain fields

**Fix:**
- Check prompt template text to ensure it asks for all required fields
- Verify response schema matches dimension field names
- Add missing mappings in code

---

## Operational Flow: How a Chunk Gets Dimensions

Let's walk through what happens when dimension generation runs:

### Step 1: Document Upload
User uploads a document → Document record created in database

### Step 2: Chunk Extraction  
Document is split into chunks → Chunk records created in `chunks` table  
Each chunk gets a `chunk_type` assigned (Chapter_Sequential, Instructional_Unit, CER, or Example_Scenario)

### Step 3: Dimension Generation Starts
System creates a "run" to track the generation process  
For each chunk, the dimension generator is called

### Step 4: Fetch Applicable Prompts
**Code:** `src/lib/dimension-generation/generator.ts`, line 182

The system asks: "Which prompt templates apply to this chunk type?"

**Example:** If chunk_type = "Instructional_Unit"
- ✅ Content Analysis (applies to all)
- ✅ Task Extraction (only for Instructional_Unit)
- ❌ CER Analysis (only for CER chunks)
- ❌ Scenario Extraction (only for Example_Scenario chunks)
- ✅ Training Pair Generation (applies to all)
- ✅ Risk Assessment (applies to all)

**Result:** 4 templates fetched

### Step 5: Execute Each Prompt
**Code:** `src/lib/dimension-generation/generator.ts`, lines 224-278

For each template:
1. Take the prompt text (e.g., "Analyze this chunk for content structure...")
2. Replace placeholders with actual data:
   - `{chunk_text}` → actual chunk text
   - `{doc_title}` → document title
   - `{chunk_type}` → chunk type
3. Send to Claude API
4. Wait for JSON response
5. Parse JSON response

**Example Response from Content Analysis:**
```json
{
  "chunk_summary_1s": "Explains how to set up email sequences for new customers",
  "key_terms": ["email marketing", "drip campaign", "customer onboarding"],
  "audience": "Small business owners",
  "intent": "instruct",
  "tone_voice_tags": ["practical", "clear", "actionable"],
  "brand_persona_tags": ["helpful", "expert"],
  "domain_tags": ["marketing", "automation"]
}
```

### Step 6: Map Response to Dimensions
**Code:** `src/lib/dimension-generation/generator.ts`, lines 283-327

The system looks up the template type (e.g., "content_analysis") and uses the mapping table:

```typescript
'content_analysis': {
  chunk_summary_1s: response.chunk_summary_1s,    // ✅ Maps
  key_terms: response.key_terms,                  // ✅ Maps
  audience: response.audience,                    // ✅ Maps
  intent: response.intent,                        // ✅ Maps
  tone_voice_tags: response.tone_voice_tags,      // ✅ Maps
  brand_persona_tags: response.brand_persona_tags, // ✅ Maps
  domain_tags: response.domain_tags,              // ✅ Maps
}
```

Each field from Claude's response gets assigned to the corresponding dimension.

### Step 7: Repeat for All Prompts
Repeat steps 5-6 for:
- Task Extraction (if applicable)
- CER Analysis (if applicable)
- Scenario Extraction (if applicable)
- Training Pair Generation ← **MISSING MAPPING**
- Risk Assessment

### Step 8: Save to Database
All collected dimensions are saved to the `chunk_dimensions` table as a single record.

### Step 9: View in Spreadsheet
The Dimension Validation Spreadsheet UI fetches the dimensions and displays them in a grid.

---

## What Needs to Be Fixed

### Fix #1: Verify Prompt Templates Exist
**Priority:** HIGH  
**Effort:** 30 minutes (just checking) or 2 hours (if seeding needed)

**Action Items:**
1. Check Supabase `prompt_templates` table
2. Verify 6 templates exist with correct `template_type` values:
   - `content_analysis`
   - `task_extraction`
   - `cer_analysis`
   - `scenario_extraction`
   - `training_pair_generation`
   - `risk_assessment`
3. If missing, create SQL seed script from `pmc/product/_prompt_engineering/dimensions-prompts_v1.md`
4. Ensure `chunk_type_filter` is set correctly for conditionals
5. Ensure `is_active = true` for all

**Reference Document:**  
`pmc/product/_prompt_engineering/dimensions-prompts_v1.md` (902 lines, contains all prompt text)

---

### Fix #2: Add Training Pair Generation Mapping
**Priority:** HIGH  
**Effort:** 5 minutes

**Action Items:**
1. Open `src/lib/dimension-generation/generator.ts`
2. Find the `mapResponseToDimensions()` function (line ~283)
3. Add this mapping around line 324:
```typescript
'training_pair_generation': {
  prompt_candidate: response.prompt_candidate,
  target_answer: response.target_answer,
  style_directives: response.style_directives,
},
```
4. Test with a chunk to verify dimensions populate

**Impact:** Fixes 3 missing dimensions (`prompt_candidate`, `target_answer`, `style_directives`)

---

### Fix #3: Verify Risk Assessment Fields
**Priority:** MEDIUM  
**Effort:** 30 minutes

**Action Items:**
1. Check if `safety_tags` and `compliance_flags` are in the Risk Assessment prompt template
2. Verify the template's JSON schema includes these fields
3. Check if Claude's response actually includes them
4. If missing from prompt, update prompt template text
5. Test with chunks that should trigger safety/compliance flags

**Impact:** Fixes 2 potentially missing dimensions

---

### Fix #4: Verify Chunk Type Classification
**Priority:** MEDIUM  
**Effort:** 15 minutes

**Action Items:**
1. Check the test chunk's `chunk_type` value in database
2. If it's "Chapter_Sequential", verify that:
   - Task dimensions are NULL (expected)
   - CER dimensions are NULL (expected)
   - Scenario dimensions are NULL (expected)
3. If dimensions are missing that SHOULD be populated for that chunk type, investigate why

**Impact:** Clarifies whether missing dimensions are bugs or expected behavior

---

## Summary of AI Dimension Status

| Prompt Template | Status | Dimensions Generated | Code Location | Issues |
|----------------|--------|---------------------|---------------|--------|
| Content Analysis | ✅ Working | 7 fields | `generator.ts:285-292` | None |
| Task Extraction | ✅ Working | 6 fields (conditional) | `generator.ts:294-300` | None |
| CER Analysis | ✅ Working | 5 fields (conditional) | `generator.ts:302-308` | None |
| Scenario Extraction | ✅ Working | 5 fields (conditional) | `generator.ts:309-315` | None |
| Training Pair Generation | ❌ Broken | 3 fields (should be all) | **MISSING MAPPING** | No mapping exists |
| Risk Assessment | ⚠️ Partial | 6 fields | `generator.ts:316-322` | Verify safety_tags, compliance_flags |

---

## How to Test the Fixes

### Test 1: Verify Templates Exist
```sql
-- Run in Supabase SQL editor
SELECT 
  template_name, 
  template_type, 
  is_active,
  chunk_type_filter
FROM prompt_templates
ORDER BY template_name;
```

**Expected Results:** 6 rows, all `is_active = true`

---

### Test 2: Check Test Chunk Type
```sql
-- Run in Supabase SQL editor
SELECT 
  chunk_id,
  chunk_type,
  LEFT(chunk_text, 100) as preview
FROM chunks
WHERE id = '<your-test-chunk-id>';
```

**Compare Result:** Does chunk_type match the missing dimensions?

---

### Test 3: Regenerate Dimensions
After fixes:
1. Navigate to Dimension Validation Spreadsheet
2. Select the test chunk
3. Click "Regenerate Dimensions" (if button exists)
4. Wait for completion
5. Check if new dimensions are populated
6. Compare before/after counts

---

## Related Documents

- **Prompt Template Source:** `pmc/product/_prompt_engineering/dimensions-prompts_v1.md` (902 lines)
  - Contains all 6 prompt texts with full JSON schemas
  - Use this to seed database if templates missing

- **Code Implementation:** `src/lib/dimension-generation/generator.ts` (461 lines)
  - Line 182: Template fetching
  - Lines 224-278: Prompt execution
  - Lines 283-327: Response mapping (needs Training Pair addition)

- **Original Analysis:** `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_missing-dimensions_v1.md`
  - Section 3: "AI Not Filled - LLM Prompts Need Updates"

- **Driver Document:** `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_dimensions-driver_v1.md`
  - Overall roadmap and fix order

---

## Questions & Answers

**Q: Why don't we just run all 6 prompts for every chunk?**  
A: Cost and efficiency. Task, CER, and Scenario prompts only make sense for specific chunk types. Running them on irrelevant chunks wastes API calls and returns empty/nonsense data.

**Q: Can we combine prompts to reduce API calls?**  
A: Possible future optimization. Currently keeping them separate for clarity and flexibility. Could combine Content Analysis + Risk Assessment for all chunks.

**Q: What if Claude returns incorrect JSON?**  
A: Code has error handling that logs the issue and continues. That dimension just stays null. In production, we'd need better error reporting.

**Q: How long does dimension generation take?**  
A: ~2-5 seconds per chunk (depends on number of prompts). Large documents with 100 chunks might take 5-10 minutes total.

**Q: Can we speed it up?**  
A: Yes, code currently processes chunks in batches of 3 in parallel. Could increase batch size or use Claude's batch API.

---

**End of LLM API Prompt System Documentation**

