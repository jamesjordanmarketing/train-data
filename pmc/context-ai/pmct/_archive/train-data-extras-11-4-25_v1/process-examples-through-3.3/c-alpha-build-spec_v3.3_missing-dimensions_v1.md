# Missing Dimensions Analysis Report
**Date:** October 7, 2025  
**Version:** 1.0  
**Purpose:** Root cause analysis of missing dimension values in Chunks Alpha module

---

## Executive Summary

Of the 60 total chunk dimensions, **36 dimensions** are not being populated in the current implementation. This report categorizes these missing dimensions by root cause and identifies specific remediation needs.

**Missing Breakdown:**
- **24 AI-Generated dimensions** not filled
- **5 Prior-Generated dimensions** not filled
- **7 Mechanically-Generated dimensions** not filled

---

## 1. Prior Not Filled - Data Not Captured During Document Upload

### Missing Fields (5)
1. `doc_version`
2. `source_type`
3. `source_url`
4. `author` (partially - only authorId captured)
5. `doc_date`

### Root Cause Analysis

**Location of Issue:** Document upload and creation process

**Code Evidence:**
```typescript
// From src/lib/database.ts - fileService.uploadDocument()
const { data: documentData, error: documentError } = await supabase
  .from('documents')
  .insert({
    title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
    file_path: uploadData.path,
    file_size: file.size,
    author_id: userId,  // ❌ Only capturing UUID, not human-readable name
    status: 'pending'
    // ❌ Missing: doc_version, source_type, source_url, doc_date
  })
```

**Why These Fields Are Missing:**

1. **doc_version** - No version field in document upload form or database insert
   - Should be: Captured during upload or set as default (e.g., "v1.0.0")
   - Expected location: Document upload form, documents table

2. **source_type** - File type not being extracted from upload
   - Should be: Derived from file extension (pdf, docx, html, markdown, etc.)
   - Expected location: File upload handler, can detect from `file.type` or extension
   - Code shows: `file.name.replace(/\.[^/.]+$/, '')` extracts filename but doesn't save extension

3. **source_url** - No URL capture in upload flow
   - Should be: Optional field in upload form for documents from external sources
   - Expected location: Document upload form (optional text input)
   - Use case: When ingesting from web, APIs, or cloud storage

4. **author** - Only UUID captured, not human-readable name
   - Should be: Map `author_id` UUID to user's display name
   - Expected location: Join with user_profiles table or store redundantly
   - Code shows: `author: document?.authorId` in generator (still UUID)
   - Dimension generator code at line 76: `author: document?.authorId || null` (still a UUID, not a human name)

5. **doc_date** - Document creation/publication date not captured
   - Should be: Optional date field in upload form
   - Expected location: Document upload form, documents table
   - Use case: Original document date (not upload date)
   - Fallback: Could use `created_at` but that's upload date, not document date

**Where to Find These Values:**

- **Form Level:** `src/app/` routes handling document upload (needs UI enhancement)
- **Database Level:** `documents` table schema needs additional columns
- **Service Level:** `src/lib/database.ts` fileService needs to capture these fields

**Schema Gap:**
The `documents` table likely only has: `id`, `title`, `content`, `summary`, `file_path`, `file_size`, `author_id`, `status`, `created_at`, `updated_at`

**Missing columns needed:**
- `doc_version TEXT`
- `source_type TEXT` (pdf | docx | html | markdown | etc.)
- `source_url TEXT`
- `doc_date TIMESTAMPTZ`

---

## 2. Mechanical Not Filled - Feature Not Implemented

### Missing Fields (7)
1. `embedding_id`
2. `vector_checksum`
3. `label_source_auto_manual_mixed`
4. `label_model`
5. `labeled_by`
6. `label_timestamp_iso`
7. `data_split_train_dev_test`

### Root Cause Analysis

**Category 2A: Vector Embedding System Not Built**

**Missing Fields:** `embedding_id`, `vector_checksum`

**Why Missing:**
- No embedding generation pipeline exists in the codebase
- These fields require:
  1. Vector embedding API call (OpenAI, Voyage, etc.)
  2. Vector storage system (Supabase pgvector, Pinecone, etc.)
  3. Embedding ID assignment and checksum calculation

**Code Evidence:**
```typescript
// From src/lib/dimension-generation/generator.ts
const dimensions: Partial<ChunkDimensions> = {
  // ... other dimensions
  // ❌ embedding_id: NOT SET ANYWHERE
  // ❌ vector_checksum: NOT SET ANYWHERE
};
```

**Expected Implementation Location:**
- New service: `src/lib/embedding-service.ts` (doesn't exist)
- Called after chunk extraction, before or after AI dimension generation
- Should generate embeddings for `chunk_text` field
- Store embeddings in Supabase vector table or external service

**Technical Requirements:**
- Embedding API (e.g., OpenAI text-embedding-3-small, Voyage AI)
- Vector dimension size (e.g., 1536 for OpenAI)
- Storage solution (pgvector extension in Supabase)
- Checksum algorithm (SHA-256 or similar)

---

**Category 2B: Labeling Metadata Not Being Set**

**Missing Fields:** `label_source_auto_manual_mixed`, `label_model`, `labeled_by`, `label_timestamp_iso`

**Why Missing:**
The dimension generator initializes some defaults but skips these labeling fields entirely.

**Code Evidence:**
```typescript
// From src/lib/dimension-generation/generator.ts - Lines 155-179
const dimensions: Partial<ChunkDimensions> = {
  chunk_id: chunk.id,
  run_id: runId,
  
  // ... document metadata populated ...
  
  // Initialize defaults
  pii_flag: false,
  review_status: 'unreviewed',
  include_in_training_yn: true,
  
  // ❌ Missing labeling metadata:
  // label_source_auto_manual_mixed: Should be 'auto' for AI generation
  // label_model: Should be AI_CONFIG.model (claude-3-7-sonnet-20250219)
  // labeled_by: Should be 'system' or AI model name
  // label_timestamp_iso: Should be new Date().toISOString()
  
  // Meta-dimensions - will be calculated after dimension generation
  generation_confidence_precision: null,
  generation_confidence_accuracy: null,
  generation_cost_usd: null,
  generation_duration_ms: null,
};
```

**Fix Required:**
Add these initializations in `generateDimensionsForChunk()` at line ~169:
```typescript
label_source_auto_manual_mixed: 'auto',
label_model: AI_CONFIG.model,
labeled_by: 'system',
label_timestamp_iso: new Date().toISOString(),
```

**Why It Matters:**
- Provenance tracking: Know which dimensions were AI-generated vs manually reviewed
- Model versioning: Track which AI model version generated dimensions
- Audit trail: Timestamp for generation events
- Training pipeline: Differentiate auto-labeled from human-labeled data

---

**Category 2C: Training Split Assignment Not Implemented**

**Missing Field:** `data_split_train_dev_test`

**Why Missing:**
No logic exists to assign chunks to training/dev/test splits.

**Code Evidence:**
```typescript
// From src/lib/dimension-generation/generator.ts
const dimensions: Partial<ChunkDimensions> = {
  // ...
  include_in_training_yn: true,  // ✅ Set to true
  // ❌ data_split_train_dev_test: NOT SET (should be 'train', 'dev', or 'test')
};
```

**Expected Implementation:**
Should implement stratified random split:
- 80% → 'train'
- 10% → 'dev' 
- 10% → 'test'

**Implementation Options:**

**Option A: Random split per chunk**
```typescript
const splits = ['train', 'train', 'train', 'train', 'train', 'train', 'train', 'train', 'dev', 'test'];
data_split_train_dev_test: splits[Math.floor(Math.random() * splits.length)]
```

**Option B: Deterministic split based on chunk_id**
```typescript
const hash = simpleHash(chunk.chunk_id);
data_split_train_dev_test: hash % 10 === 9 ? 'test' : hash % 10 === 8 ? 'dev' : 'train'
```

**Option C: Stratified by document**
- Ensure entire documents stay in same split (avoid data leakage)
- Split at document level, then assign all chunks from that document

**Recommended:** Option C for proper ML hygiene (avoid train/test contamination)

---

## 3. AI Not Filled - LLM Prompts Need Updates

### Missing Fields (21 - True AI Dimensions)
**Content Analysis (2 missing):**
1. `chunk_type` ❌ MISCLASSIFIED - This is mechanical, not AI (see Section 5)

**Task Extraction (6 missing):**
2. `task_name`
3. `preconditions`
4. `inputs`
5. `steps_json`
6. `expected_output`
7. `warnings_failure_modes`

**CER Analysis (5 missing):**
8. `claim`
9. `evidence_snippets`
10. `reasoning_sketch`
11. `citations`
12. `factual_confidence_0_1`

**Scenario Extraction (5 missing):**
13. `scenario_type`
14. `problem_context`
15. `solution_action`
16. `outcome_metrics`
17. `style_notes`

**Training Pair Generation (3 missing):**
18. `prompt_candidate`
19. `target_answer`
20. `style_directives`

**Risk Assessment (2 missing):**
21. `safety_tags`
22. `compliance_flags`

### Root Cause Analysis

**Category 3A: Prompt Template Mapping Incomplete**

**Code Evidence:**
```typescript
// From src/lib/dimension-generation/generator.ts - Lines 283-327
private mapResponseToDimensions(response: any, templateType: string): Partial<ChunkDimensions> {
  const mapping: Record<string, Partial<ChunkDimensions>> = {
    'content_analysis': {
      chunk_summary_1s: response.chunk_summary_1s,
      key_terms: response.key_terms,
      audience: response.audience,
      intent: response.intent,
      tone_voice_tags: response.tone_voice_tags,
      brand_persona_tags: response.brand_persona_tags,
      domain_tags: response.domain_tags,
      // ❌ Missing: chunk_type (though it's actually mechanical, not AI)
    },
    'task_extraction': {
      task_name: response.task_name,
      preconditions: response.preconditions,
      inputs: response.inputs,
      steps_json: response.steps_json,
      expected_output: response.expected_output,
      warnings_failure_modes: response.warnings_failure_modes,
    },
    'cer_analysis': {
      claim: response.claim,
      evidence_snippets: response.evidence_snippets,
      reasoning_sketch: response.reasoning_sketch,
      citations: response.citations,
      factual_confidence_0_1: response.factual_confidence_0_1,
    },
    'scenario_extraction': {
      scenario_type: response.scenario_type,
      problem_context: response.problem_context,
      solution_action: response.solution_action,
      outcome_metrics: response.outcome_metrics,
      style_notes: response.style_notes,
    },
    'risk_assessment': {
      safety_tags: response.safety_tags,
      coverage_tag: response.coverage_tag,
      novelty_tag: response.novelty_tag,
      ip_sensitivity: response.ip_sensitivity,
      pii_flag: response.pii_flag,
      compliance_flags: response.compliance_flags,
    },
    // ❌ Missing: 'training_pair_generation' template mapping
  };

  return mapping[templateType] || {};
}
```

**Analysis:**
- Mapping EXISTS for: content_analysis, task_extraction, cer_analysis, scenario_extraction, risk_assessment
- Mapping MISSING for: training_pair_generation
- BUT: Are these prompt templates actually in the database?

**Critical Question:** Do prompt templates exist in the `prompt_templates` table?

**Expected Prompt Templates (from spec):**
1. ✅ `content_analysis` - Mapped in code
2. ✅ `task_extraction` - Mapped in code  
3. ✅ `cer_analysis` - Mapped in code
4. ✅ `scenario_extraction` - Mapped in code
5. ❌ `training_pair_generation` - **NOT MAPPED IN CODE**
6. ✅ `risk_assessment` - Mapped in code

**Why Training Pair Dimensions Missing:**
The `mapResponseToDimensions` function has NO CASE for `training_pair_generation` template type.

**Fix Required:**
Add to mapping at line ~324:
```typescript
'training_pair_generation': {
  prompt_candidate: response.prompt_candidate,
  target_answer: response.target_answer,
  style_directives: response.style_directives,
},
```

---

**Category 3B: Prompt Templates May Not Exist in Database**

**Critical Unknown:** We don't see code that seeds the `prompt_templates` table.

**Expected Database State:**
The `prompt_templates` table should contain ~5-6 active templates with:
- `template_name`: 'Content Analysis', 'Task Extraction', 'CER Analysis', 'Scenario Extraction', 'Training Pair Generation', 'Risk Assessment'
- `template_type`: 'content_analysis', 'task_extraction', etc.
- `prompt_text`: Full LLM prompt with {placeholder} variables
- `chunk_type_filter`: Which chunk types this template applies to
- `is_active`: true
- `output_schema`: JSON schema for expected response

**Code that fetches templates:**
```typescript
// From src/lib/dimension-generation/generator.ts - Line 182
let templates = await promptTemplateService.getActiveTemplates(chunk.chunk_type);
```

**If templates don't exist:**
- `getActiveTemplates()` returns empty array `[]`
- Loop at line 190 never executes
- No AI dimensions get generated
- All AI fields remain null

**Remediation Required:**
1. Check if `prompt_templates` table is populated
2. Seed prompt templates with actual prompt text from `pmc/product/_prompt_engineering/dimensions-prompts_v1.md`
3. Ensure `chunk_type_filter` logic correctly maps templates to chunk types

---

## 4. AI Not Filled - Not Applicable For This Chunk Type

### Chunk Type Conditional Logic

The AI dimension generation system is **CHUNK TYPE AWARE**. Different chunk types should generate different dimensions:

**Chunk Types:**
1. `Chapter_Sequential` - General content, no task/CER/scenario dimensions
2. `Instructional_Unit` - Includes task dimensions
3. `CER` - Includes claim-evidence-reasoning dimensions
4. `Example_Scenario` - Includes scenario dimensions

**Dimension Applicability Matrix:**

| Dimension Group | Chapter_Sequential | Instructional_Unit | CER | Example_Scenario |
|-----------------|-------------------|-------------------|-----|------------------|
| **Content (7)** | ✅ All | ✅ All | ✅ All | ✅ All |
| **Task (6)** | ❌ N/A | ✅ All | ❌ N/A | ❌ N/A |
| **CER (5)** | ❌ N/A | ❌ N/A | ✅ All | ❌ N/A |
| **Scenario (5)** | ❌ N/A | ❌ N/A | ❌ N/A | ✅ All |
| **Training (3)** | ✅ All | ✅ All | ✅ All | ✅ All |
| **Risk (6)** | ✅ All | ✅ All | ✅ All | ✅ All |

**Root Cause Analysis:**

**If your test chunk is type `Chapter_Sequential`:**

**Expected Missing (Correct Behavior):**
- ✅ `task_name`, `preconditions`, `inputs`, `steps_json`, `expected_output`, `warnings_failure_modes` (Task dimensions)
- ✅ `claim`, `evidence_snippets`, `reasoning_sketch`, `citations`, `factual_confidence_0_1` (CER dimensions)
- ✅ `scenario_type`, `problem_context`, `solution_action`, `outcome_metrics`, `style_notes` (Scenario dimensions)

**Unexpected Missing (Bugs):**
- ❌ `prompt_candidate`, `target_answer`, `style_directives` (Should be generated for ALL types)
- ❌ `safety_tags`, `compliance_flags` (Should be generated for ALL types)

**Template Activation Logic:**
```typescript
// From spec: pmc/product/_prompt_engineering/dimensions-prompts_v1.md
PROMPT 2: TASK EXTRACTION
- Activation Condition: Only run if Chunk_Type == "Instructional_Unit"

PROMPT 3: CER ANALYSIS  
- Activation Condition: Only run if Chunk_Type == "CER"

PROMPT 4: SCENARIO ANALYSIS
- Activation Condition: Only run if Chunk_Type == "Example_Scenario"
```

**How to Verify:**
1. Check the test chunk's `chunk_type` field in the `chunks` table
2. Compare missing dimensions against the matrix above
3. If chunk is `Chapter_Sequential`, missing task/CER/scenario fields are EXPECTED
4. If chunk is `Instructional_Unit`, missing task fields are UNEXPECTED (bug)

**Prompt Template Database Schema:**
```sql
-- From spec
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY,
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL,  -- 'content_analysis', 'task_extraction', etc.
  prompt_text TEXT NOT NULL,
  chunk_type_filter TEXT[],  -- ['Instructional_Unit'] or ['CER'] or NULL (all types)
  is_active BOOLEAN DEFAULT true,
  -- ...
);
```

**Expected Rows:**
```sql
INSERT INTO prompt_templates (template_name, template_type, chunk_type_filter, is_active) VALUES
('Content Analysis', 'content_analysis', NULL, true),  -- All chunk types
('Task Extraction', 'task_extraction', ARRAY['Instructional_Unit'], true),  -- Only Instructional_Unit
('CER Analysis', 'cer_analysis', ARRAY['CER'], true),  -- Only CER
('Scenario Extraction', 'scenario_extraction', ARRAY['Example_Scenario'], true),  -- Only Example_Scenario
('Training Pair Generation', 'training_pair_generation', NULL, true),  -- All types
('Risk Assessment', 'risk_assessment', NULL, true);  -- All types
```

---

## 5. Additional Reason Groupings

### Category 5A: Metadata Misclassification

**Field:** `chunk_type`

**Issue:** Listed as "AI NOT GENERATED" but `chunk_type` is actually **MECHANICALLY GENERATED** during chunk extraction, not AI generation.

**Code Evidence:**
```typescript
// From database schema
CREATE TABLE chunks (
  -- ...
  chunk_type TEXT NOT NULL CHECK (chunk_type IN ('Chapter_Sequential', 'Instructional_Unit', 'CER', 'Example_Scenario')),
  -- ...
);
```

**Where It's Actually Set:**
- Chunk extraction algorithm (semantic analyzer)
- Set BEFORE AI dimension generation
- Stored in `chunks` table, not `chunk_dimensions` table
- Used as INPUT to dimension generation (`getActiveTemplates(chunk.chunk_type)`)

**Why It Appears Missing:**
- The dimension validation system looks for it in `chunk_dimensions` table
- But it's actually in the `chunks` table
- Service layer should map it from chunks → dimensions view

**Fix:**
This is a **DATA MAPPING** issue, not a generation issue. The `dimension-service.ts` correctly maps it:
```typescript
// From src/lib/dimension-service.ts - Lines 151-158
switch (meta.fieldName) {
  case 'chunk_id':
    value = chunk.chunk_id;
    break;
  // ... other cases ...
}
```

But wait - `chunk_type` is NOT in the switch statement! Let me check the metadata:

```typescript
// From src/lib/dimension-metadata.ts
// ❌ chunk_type is NOT in DIMENSION_METADATA at all!
```

**Root Cause:** `chunk_type` is in the dimension spec CSV but:
1. NOT included in `dimension-metadata.ts` DIMENSION_METADATA constant
2. NOT mapped in `dimension-service.ts` switch statement  
3. NOT stored in `chunk_dimensions` table (it's in `chunks` table)

**Classification Error:** This dimension is tracked in the wrong place.

**Resolution Options:**
1. Add `chunk_type` to dimension metadata and map it in service layer
2. OR: Remove `chunk_type` from the 60-dimension list (it's already in chunks table)
3. OR: Copy `chunk_type` value into `chunk_dimensions` table for convenience

---

### Category 5B: Default Values Set But Not Visible

**Fields:** `include_in_training_yn`, `augmentation_notes`

**Issue:** 
- `include_in_training_yn` IS set to `true` by default (line 172)
- `augmentation_notes` is set to `null` implicitly

**Why They Appear Missing:**
```typescript
// From src/lib/dimension-generation/generator.ts - Lines 169-172
// Initialize defaults
pii_flag: false,
review_status: 'unreviewed',
include_in_training_yn: true,  // ✅ THIS IS SET
// augmentation_notes: null,  // ❌ Not explicitly set, defaults to null
```

**Testing Considerations:**
1. Check if `include_in_training_yn` has value `true` in database (it should)
2. `augmentation_notes` is null because it's optional and meant for manual input later
3. These may appear in the CSV export as populated (`true`) or empty (`null`)

**Classification:** 
- `include_in_training_yn` - FALSE POSITIVE (actually populated with `true`)
- `augmentation_notes` - TRUE MISSING (null by design, awaiting manual input)

---

### Category 5C: Feature Dependency Chain

Some dimensions depend on OTHER features being implemented first:

**Dependency Chain Example:**

```
embedding_id & vector_checksum
    ↓ (requires)
Embedding Generation Service
    ↓ (requires)
Vector Storage (pgvector)
    ↓ (requires)
Embedding API Integration (OpenAI/Voyage)
```

**data_split_train_dev_test**
    ↓ (requires)
Training Pipeline Strategy Decision
    ↓ (requires)
ML Model Training Roadmap

**prompt_candidate, target_answer, style_directives**
    ↓ (requires)
Training Pair Generation Prompt Template
    ↓ (requires)
Prompt Engineering for LoRA Training Pairs
    ↓ (requires)
Product Strategy: What makes a good training pair?

**Missing Because:** Dependent features not prioritized/implemented yet

---

### Category 5D: Database Schema Mismatch

**Potential Issue:** Documents table may not have all required columns

**Expected Schema (Full):**
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  file_path TEXT,
  file_size INTEGER,
  author_id UUID,
  
  -- ❓ These may not exist:
  doc_version TEXT,
  source_type TEXT,
  source_url TEXT,
  doc_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending'
);
```

**Actual Schema:** Likely missing `doc_version`, `source_type`, `source_url`, `doc_date`

**Fix Required:**
1. Run database migration to add missing columns
2. Update document upload forms/APIs to capture these fields
3. Provide UI for editing document metadata post-upload

---

## Summary of Root Causes

### By Fix Complexity (Easiest → Hardest)

**🟢 EASY FIXES (1-2 hours):**
1. **Labeling Metadata** - Add 4 lines of code to set defaults
   - `label_source_auto_manual_mixed: 'auto'`
   - `label_model: AI_CONFIG.model`
   - `labeled_by: 'system'`
   - `label_timestamp_iso: new Date().toISOString()`

2. **Training Split Assignment** - Add 5 lines for random split logic

3. **Training Pair Mapping** - Add 3 lines to `mapResponseToDimensions()`

**🟡 MEDIUM FIXES (4-8 hours):**
4. **Document Metadata Capture** - Database migration + UI updates
   - Add 4 columns to documents table
   - Update document upload form
   - Derive `source_type` from file extension
   - Map `author` to human-readable name

5. **Prompt Template Database Seeding** - Create/verify prompt templates
   - Write SQL seed script for 6 templates
   - Copy prompt text from `dimensions-prompts_v1.md`
   - Verify `chunk_type_filter` logic

6. **chunk_type Dimension Mapping** - Add to metadata and service layer
   - OR: Remove from 60-dimension tracking (already in chunks table)

**🔴 HARD FIXES (16-40 hours):**
7. **Embedding Generation Pipeline** - Build entire new subsystem
   - Integrate embedding API (OpenAI/Voyage)
   - Implement vector storage (pgvector)
   - Generate embedding_id and vector_checksum
   - Store and retrieve embeddings

8. **Training Pair Generation Prompts** - Prompt engineering + implementation
   - Design prompts for LoRA training pair generation
   - Implement `prompt_candidate`, `target_answer`, `style_directives` logic
   - Requires product strategy for what makes effective training pairs

---

## Recommended Remediation Order

### Phase 1: Quick Wins (Day 1)
1. ✅ Fix labeling metadata (4 fields)
2. ✅ Add training split assignment (1 field)
3. ✅ Add training_pair_generation mapping (code structure)
4. ✅ Verify/fix `include_in_training_yn` visibility

**Impact:** 6 dimensions fixed, ~2 hours work

### Phase 2: Database & Capture (Week 1)
5. ✅ Add document metadata columns to schema
6. ✅ Update document upload UI/API
7. ✅ Implement author name mapping
8. ✅ Derive source_type from file extension

**Impact:** 5 dimensions fixed, ~8 hours work

### Phase 3: Prompt Templates (Week 2)
9. ✅ Audit prompt_templates table
10. ✅ Seed missing templates with actual prompt text
11. ✅ Verify chunk_type_filter logic
12. ✅ Test that conditional templates fire correctly

**Impact:** Enables proper generation of 21 AI dimensions, ~8 hours work

### Phase 4: Advanced Features (Month 1-2)
13. 🔄 Design and implement embedding pipeline
14. 🔄 Design training pair generation prompts
15. 🔄 Implement training pair generation
16. 🔄 Build vector storage and retrieval

**Impact:** Final 9 dimensions, significant feature development

---

## Appendix: Complete Missing Dimensions Reference

### Prior Generated (5 missing)
1. doc_version - No capture in upload
2. source_type - Not derived from file
3. source_url - No form field
4. author - UUID not mapped to name
5. doc_date - No form field

### Mechanically Generated (7 missing)
1. embedding_id - No embedding pipeline
2. vector_checksum - No embedding pipeline
3. label_source_auto_manual_mixed - Not set in code
4. label_model - Not set in code
5. labeled_by - Not set in code
6. label_timestamp_iso - Not set in code
7. data_split_train_dev_test - No split logic

### AI Generated (24 missing)
**Content (1 - misclassified):**
1. chunk_type - Actually mechanical, in chunks table

**Task (6 - conditional):**
2. task_name
3. preconditions
4. inputs
5. steps_json
6. expected_output
7. warnings_failure_modes

**CER (5 - conditional):**
8. claim
9. evidence_snippets
10. reasoning_sketch
11. citations
12. factual_confidence_0_1

**Scenario (5 - conditional):**
13. scenario_type
14. problem_context
15. solution_action
16. outcome_metrics
17. style_notes

**Training (3 - not implemented):**
18. prompt_candidate
19. target_answer
20. style_directives

**Risk (2 - check template mapping):**
21. safety_tags
22. compliance_flags

**Training Metadata (2 - defaults/false positives):**
23. include_in_training_yn - Actually set to `true`
24. augmentation_notes - Null by design (manual input)

---

**End of Report**

