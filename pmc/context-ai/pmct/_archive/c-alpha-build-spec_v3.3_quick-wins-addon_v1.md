# Phase 1 & 2 Implementation Specification - Quick Wins
**Version:** 1.1 (Updated)  
**Date:** October 7, 2025  
**Purpose:** Detailed implementation guide for Quick Wins (Phase 1) and Database Verification (Phase 2)  
**Estimated Time:** 4-5 hours total

---

## ⚡ IMPORTANT UPDATE - YOUR DATABASE STATUS

**Good News:** Your database analysis shows:
- ✅ You already have **5 out of 6** prompt templates installed
- ❌ **Missing:** Training Pair Generation template only
- ✅ Your schema uses `applicable_chunk_types` (not `chunk_type_filter`)

**What This Means:**
- Task 2.2 has been simplified to only add the ONE missing template
- All SQL queries have been updated for your actual schema
- You're in better shape than expected!

---

## Overview

This specification provides **copy-paste ready** SQL scripts and AI prompts to implement Phase 1 (Quick Wins) and Phase 2 (Database Verification) of the dimension fix roadmap.

### What You'll Accomplish
- **Phase 2:** Verify database state and add 1 missing template (30 min)
- **Phase 1:** Fix 9 dimensions via code changes (2 hours)

### Prerequisites
- Access to Supabase SQL Editor
- Cursor IDE with Claude-4.5-sonnet Thinking enabled
- Project workspace loaded: `chunks-alpha`

---

## How to Use This Document

### For SQL Commands
Look for sections marked:
```
========================

[SQL code here - copy everything between the lines]

++++++++++++++++++++++
```

Copy everything between `========` and `+++++++` into Supabase SQL Editor and run.

### For AI Prompts
Look for sections marked:
```
========================

[Prompt text here - copy everything between the lines]

++++++++++++++++++++++
```

Copy everything between `========` and `+++++++` into a new Cursor conversation with Claude-4.5-sonnet Thinking.

---

# PHASE 2: DATABASE VERIFICATION

**⚠️ IMPORTANT: Do Phase 2 FIRST before Phase 1!**

Why? We need to know the database state before making code changes. If prompt templates are missing, we need to seed them first.

---

## TASK 2.1: Check Prompt Templates

### Objective
Verify if the `prompt_templates` table has the 6 required templates for AI dimension generation.

### Step 1: Run SQL Query

**Action:** Copy the SQL below and paste it into Supabase SQL Editor, then click "Run".

========================



-- TASK 2.1: Check Prompt Templates
-- Purpose: Verify which prompt templates exist in the database
-- Expected Result: Should see 6 rows with all is_active = true

SELECT 
  id,
  template_name, 
  template_type, 
  is_active,
  applicable_chunk_types,
  LENGTH(prompt_text) as prompt_text_length,
  created_at
FROM prompt_templates
ORDER BY template_name;



++++++++++++++++++++++

### Step 2: Analyze Results

**YOUR ACTUAL RESULTS:**
You have **5 out of 6 templates** already seeded:
1. ✅ Content Analysis (`content_analysis`)
2. ✅ Task Extraction (`task_extraction`)
3. ✅ CER Analysis (`cer_analysis`)
4. ✅ Scenario Extraction (`scenario_extraction`)
5. ❌ Training Pair Generation (`training_pair_generation`) - **MISSING**
6. ✅ Risk Assessment (`risk_assessment`)

**DECISION: You need to seed ONLY the missing Training Pair Generation template.**

**Action:** Proceed to Task 2.2 to add the missing template.

---

## TASK 2.2: Seed Missing Training Pair Generation Template

### Objective
Add the missing Training Pair Generation template to the database.

### Status
Based on Task 2.1 results:
- ✅ You already have 5/6 templates
- ❌ Missing: Training Pair Generation
- **Action: Only seed the one missing template**

### Prerequisites
- You completed Task 2.1 and confirmed Training Pair Generation is missing
- You have access to Supabase SQL Editor

### Step 1: Add Training Pair Generation Template

**Action:** Copy the SQL below and paste it into Supabase SQL Editor, then click "Run".

========================



-- =============================================================================
-- TASK 2.2: Add Training Pair Generation Template
-- Purpose: Add the one missing prompt template to the database
-- Source: pmc/product/_prompt_engineering/dimensions-prompts_v1.md
-- Date: 2025-10-07
-- Note: Your database already has 5/6 templates. This adds the missing one.
-- =============================================================================

-- Add Training Pair Generation Template (Runs for ALL chunk types)
-- First, check if it already exists and delete it if so (to avoid duplicates)
DELETE FROM prompt_templates WHERE template_type = 'training_pair_generation';

-- Now insert the template
INSERT INTO prompt_templates (
  template_name,
  template_type,
  prompt_text,
  response_schema,
  applicable_chunk_types,
  version,
  is_active,
  created_at,
  updated_at
) VALUES (
  'training_pair_generation_v1',
  'training_pair_generation',
  'You are an expert at creating instruction-tuning training pairs for LoRA fine-tuning. You understand how to distill content into effective prompt-response pairs that teach AI models to respond in a specific brand voice.

Create a training pair from this chunk.

Chunk text:
{chunk_text}

Document context:
- Document Title: {doc_title}
- Primary Category: {primary_category}
- Chunk Type: {chunk_type}

Generate a potential user prompt that this content could answer, the ideal target answer, and style directives. Return ONLY valid JSON, no other text.

Required output format (JSON):
{
  "prompt_candidate": "A question or instruction a user might ask that this content addresses",
  "target_answer": "The ideal response in brand voice (concise, 150-250 words)",
  "style_directives": "Formatting and voice guidelines for the answer"
}',
  '{"type":"object","required":["prompt_candidate","target_answer","style_directives"],"properties":{"prompt_candidate":{"type":"string"},"target_answer":{"type":"string"},"style_directives":{"type":"string"}}}'::jsonb,
  NULL,  -- Applies to ALL chunk types (NULL means no filter)
  1,     -- version number
  true,  -- is_active
  NOW(),
  NOW()
);

-- Verify the template was inserted successfully
SELECT 
  template_name,
  template_type,
  is_active,
  applicable_chunk_types,
  LENGTH(prompt_text) as prompt_length,
  version
FROM prompt_templates
WHERE template_type = 'training_pair_generation';



++++++++++++++++++++++

### Step 2: Verify Results

After running the SQL, you should see output showing:
- 1 row for `training_pair_generation`
- `is_active = true`
- `prompt_length` should be around 600-700 characters
- `version = 1`
- `applicable_chunk_types = NULL` (applies to all chunk types)

**✅ Success:** The Training Pair Generation template is now added. You have all 6 templates ready to use.

---

## TASK 2.3: Verify Chunk Type

### Objective
Check what `chunk_type` your test chunk has to determine if missing dimensions are expected or bugs.

### Step 1: Get Your Test Chunk ID

You need to know which chunk you're testing. If you already know the chunk_id, skip to Step 2.

**To find a chunk ID:** Copy this SQL and run in Supabase:

========================



-- Find recent chunks to test with
SELECT 
  id as chunk_id,
  chunk_type,
  LEFT(chunk_text, 100) as preview
FROM chunks
ORDER BY created_at DESC
LIMIT 10;



++++++++++++++++++++++

Pick a `chunk_id` from the results.

### Step 2: Check Chunk Type

**Action:** Replace `<your-chunk-id-here>` with your actual chunk ID, then run in Supabase:

========================



-- TASK 2.3: Verify Chunk Type
-- Purpose: Determine if missing dimensions are expected based on chunk type
-- Replace <your-chunk-id-here> with your actual chunk UUID

SELECT 
  id as chunk_id,
  chunk_type,
  document_id,
  LEFT(chunk_text, 200) as chunk_preview,
  created_at
FROM chunks
WHERE id = '1da028a7-f957-4c21-a631-c18c72a7e00b'



++++++++++++++++++++++

### Step 3: Interpret Results

Based on the `chunk_type` value, different dimensions are expected:

**If chunk_type = 'Chapter_Sequential':**
- ✅ EXPECTED missing: 16 dimensions (Task, CER, Scenario fields)
- ❌ UNEXPECTED missing: Training Pair (3), Risk partial (2)
- **Action:** Only worry about Training Pair and Risk fields

**If chunk_type = 'Instructional_Unit':**
- ✅ Should have: Task dimensions (6 fields)
- ❌ UNEXPECTED missing: Any Task fields that are NULL
- ❌ EXPECTED missing: CER (5), Scenario (5) fields
- **Action:** Verify Task dimensions populate after fixes

**If chunk_type = 'CER':**
- ✅ Should have: CER dimensions (5 fields)
- ❌ UNEXPECTED missing: Any CER fields that are NULL
- ❌ EXPECTED missing: Task (6), Scenario (5) fields
- **Action:** Verify CER dimensions populate after fixes

**If chunk_type = 'Example_Scenario':**
- ✅ Should have: Scenario dimensions (5 fields)
- ❌ UNEXPECTED missing: Any Scenario fields that are NULL
- ❌ EXPECTED missing: Task (6), CER (5) fields
- **Action:** Verify Scenario dimensions populate after fixes

---

## TASK 2.4: Check Risk Assessment Fields

### Objective
Verify that the Risk Assessment template includes `safety_tags` and `compliance_flags` fields.

### Step 1: Check Template Content

**Action:** Copy and run in Supabase:

========================



-- TASK 2.4: Check Risk Assessment Template
-- Purpose: Verify safety_tags and compliance_flags are in the prompt template

SELECT 
  template_name,
  template_type,
  prompt_text LIKE '%safety_tags%' as has_safety_tags,
  prompt_text LIKE '%compliance_flags%' as has_compliance_flags,
  response_schema::json->'properties'->'safety_tags' as safety_tags_schema,
  response_schema::json->'properties'->'compliance_flags' as compliance_flags_schema
FROM prompt_templates
WHERE template_type = 'risk_assessment';



++++++++++++++++++++++

### Step 2: Interpret Results

**Expected Results:**
- `has_safety_tags = true`
- `has_compliance_flags = true`
- Both schema fields should show JSON definitions

**✅ If both are true:** Risk Assessment template is correctly configured

**❌ If either is false:** Template was seeded incorrectly (shouldn't happen if you used Task 2.2)

---

# PHASE 1: QUICK WINS

Now that Phase 2 is complete (database verified, templates seeded if needed), we can make code changes.

---

## TASK 1.1: Add Labeling Metadata

### Objective
Add 4 labeling metadata fields to dimension generation: `label_source_auto_manual_mixed`, `label_model`, `labeled_by`, `label_timestamp_iso`

### Implementation Prompt

**Action:** Copy the ENTIRE prompt below into a NEW conversation in Cursor with Claude-4.5-sonnet Thinking.

========================



# TASK 1.1: Add Labeling Metadata to Dimension Generation

## Context
You are working on the Bright Run LoRA Training Data Platform. The dimension generation system creates 60 metadata dimensions for each chunk of text. Currently, 4 labeling metadata fields are not being set during generation.

## Problem
In the file `src/lib/dimension-generation/generator.ts`, the dimension generation initializes some defaults around line 169-172 but skips these 4 labeling fields:
- `label_source_auto_manual_mixed`
- `label_model`
- `labeled_by`
- `label_timestamp_iso`

These fields track WHO/WHAT/WHEN generated the dimensions (provenance tracking).

## Your Task
Modify `src/lib/dimension-generation/generator.ts` to add these 4 labeling metadata fields as defaults during dimension initialization.

## Detailed Instructions

### Step 1: Locate the Code
Open `src/lib/dimension-generation/generator.ts` and find the `generateDimensionsForChunk` function around line 131.

Look for the section that initializes the dimensions object (around lines 155-179). It currently looks like this:

```typescript
// Initialize dimension record with mechanical data
const dimensions: Partial<ChunkDimensions> = {
  chunk_id: chunk.id,
  run_id: runId,
  
  // Previously generated dimensions (inherited from document)
  doc_id: chunk.document_id,
  doc_title: documentMetadata.title,
  doc_version: documentMetadata.docVersion,
  source_type: documentMetadata.sourceType,
  source_url: documentMetadata.sourceUrl,
  author: documentMetadata.author,
  doc_date: documentMetadata.docDate,
  primary_category: documentCategory,
  
  // Initialize defaults
  pii_flag: false,
  review_status: 'unreviewed',
  include_in_training_yn: true,
  
  // Meta-dimensions - will be calculated after dimension generation
  generation_confidence_precision: null,
  generation_confidence_accuracy: null,
  generation_cost_usd: null,
  generation_duration_ms: null,
};
```

### Step 2: Add the 4 Labeling Fields
Immediately after the line `include_in_training_yn: true,` (around line 172), add these 4 new lines:

```typescript
  // Labeling metadata for provenance tracking
  label_source_auto_manual_mixed: 'auto',
  label_model: AI_CONFIG.model,
  labeled_by: 'system',
  label_timestamp_iso: new Date().toISOString(),
```

### Step 3: Verify AI_CONFIG Import
At the top of the file (around line 2), verify that `AI_CONFIG` is imported:

```typescript
import { AI_CONFIG } from '../ai-config';
```

If it's not there, add it.

### Expected Result
After your changes, the dimensions object should look like this:

```typescript
const dimensions: Partial<ChunkDimensions> = {
  chunk_id: chunk.id,
  run_id: runId,
  
  // Previously generated dimensions (inherited from document)
  doc_id: chunk.document_id,
  doc_title: documentMetadata.title,
  doc_version: documentMetadata.docVersion,
  source_type: documentMetadata.sourceType,
  source_url: documentMetadata.sourceUrl,
  author: documentMetadata.author,
  doc_date: documentMetadata.docDate,
  primary_category: documentCategory,
  
  // Initialize defaults
  pii_flag: false,
  review_status: 'unreviewed',
  include_in_training_yn: true,
  
  // Labeling metadata for provenance tracking
  label_source_auto_manual_mixed: 'auto',
  label_model: AI_CONFIG.model,
  labeled_by: 'system',
  label_timestamp_iso: new Date().toISOString(),
  
  // Meta-dimensions - will be calculated after dimension generation
  generation_confidence_precision: null,
  generation_confidence_accuracy: null,
  generation_cost_usd: null,
  generation_duration_ms: null,
};
```

## What Each Field Means
- **label_source_auto_manual_mixed**: Set to `'auto'` because dimensions are automatically generated by AI (not manually created by humans)
- **label_model**: The AI model name from config (e.g., `'claude-3-7-sonnet-20250219'`) so we know which version generated these dimensions
- **labeled_by**: Set to `'system'` to indicate automatic generation (not a specific user ID)
- **label_timestamp_iso**: Current timestamp in ISO format to record exactly when dimensions were generated

## Testing
After making the changes:
1. Save the file
2. The code should compile without errors
3. Later when dimensions are regenerated, these 4 fields will be populated in the `chunk_dimensions` table

## TypeScript Type Safety
If TypeScript shows any errors about these fields not existing on `ChunkDimensions` type:
1. Check `src/types/chunks.ts` or wherever `ChunkDimensions` interface is defined
2. Verify these fields are included in the interface definition
3. They should already be there from the original schema

## Summary
You're adding 4 lines of code that set default values for labeling metadata during dimension initialization. This fixes 4 missing dimensions and provides crucial provenance tracking for training data quality.



++++++++++++++++++++++

**After the AI completes this task, verify:**
1. The file compiles without errors
2. All 4 fields are added in the correct location
3. The code follows existing formatting patterns

---

## TASK 1.2: Add Training Split Assignment

### Objective
Add deterministic training split assignment logic so each chunk gets assigned to 'train', 'dev', or 'test' split.

### Implementation Prompt

**Action:** Copy the ENTIRE prompt below into a NEW conversation in Cursor with Claude-4.5-sonnet Thinking.

========================



# TASK 1.2: Add Training Split Assignment Logic

## Context
You are working on the Bright Run LoRA Training Data Platform. Each chunk needs to be assigned to a training split (train/dev/test) for ML training purposes. Currently, the `data_split_train_dev_test` dimension is not being set.

## Problem
In `src/lib/dimension-generation/generator.ts`, the code sets `include_in_training_yn: true` but never assigns which split the chunk should be in.

## Your Task
Add deterministic split assignment logic so chunks are consistently assigned to:
- 80% → 'train'
- 10% → 'dev'
- 10% → 'test'

The split must be DETERMINISTIC (same chunk always gets same split) based on the chunk ID.

## Detailed Instructions

### Step 1: Add Hash Function
At the beginning of the `generateDimensionsForChunk` function (around line 150, BEFORE the dimensions object is created), add this hash function:

```typescript
// Deterministic hash function for consistent split assignment
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};
```

### Step 2: Calculate Split Assignment
Immediately after the hash function, add this split calculation logic:

```typescript
// Calculate deterministic split based on chunk ID
const hash = hashCode(chunk.id);
const splitValue = hash % 10; // Get value 0-9
const split = splitValue === 9 ? 'test' : splitValue === 8 ? 'dev' : 'train';
// Result: 0-7 = train (80%), 8 = dev (10%), 9 = test (10%)
```

### Step 3: Add Split to Dimensions Object
In the dimensions initialization object (where you added labeling metadata in Task 1.1), find the line `include_in_training_yn: true,` and add the split assignment right after it:

```typescript
  include_in_training_yn: true,
  data_split_train_dev_test: split,
```

### Complete Code Section
After all changes, the beginning of `generateDimensionsForChunk` should look like this:

```typescript
private async generateDimensionsForChunk(params: {
  chunk: Chunk;
  runId: string;
  documentCategory: string;
  documentMetadata: { /* ... */ };
  templateIds?: string[];
  aiParams?: { /* ... */ };
}): Promise<number> {
  const { chunk, runId, documentCategory, documentMetadata, templateIds, aiParams } = params;

  const startTime = Date.now();
  let totalCost = 0;

  // Deterministic hash function for consistent split assignment
  const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  // Calculate deterministic split based on chunk ID
  const hash = hashCode(chunk.id);
  const splitValue = hash % 10; // Get value 0-9
  const split = splitValue === 9 ? 'test' : splitValue === 8 ? 'dev' : 'train';
  // Result: 0-7 = train (80%), 8 = dev (10%), 9 = test (10%)

  // Initialize dimension record with mechanical data
  const dimensions: Partial<ChunkDimensions> = {
    chunk_id: chunk.id,
    run_id: runId,
    
    // ... other fields ...
    
    // Initialize defaults
    pii_flag: false,
    review_status: 'unreviewed',
    include_in_training_yn: true,
    data_split_train_dev_test: split,
    
    // Labeling metadata (from Task 1.1)
    label_source_auto_manual_mixed: 'auto',
    label_model: AI_CONFIG.model,
    labeled_by: 'system',
    label_timestamp_iso: new Date().toISOString(),
    
    // Meta-dimensions
    generation_confidence_precision: null,
    generation_confidence_accuracy: null,
    generation_cost_usd: null,
    generation_duration_ms: null,
  };

  // ... rest of function ...
}
```

## Why Deterministic?
Using a hash of the chunk ID ensures:
1. **Reproducibility**: Same chunk always gets same split (important for experiments)
2. **No data leakage**: If dimensions are regenerated, chunk stays in same split
3. **Fair distribution**: Hash function ensures even distribution across splits

## Testing
After making the changes:
1. Code should compile without errors
2. Later when dimensions are generated, verify distribution is roughly 80/10/10
3. Verify same chunk gets same split when regenerated

## Summary
You're adding a deterministic hash function and split assignment logic to ensure all chunks are properly assigned to training/dev/test splits. This fixes 1 missing dimension (`data_split_train_dev_test`).



++++++++++++++++++++++

**After the AI completes this task, verify:**
1. Hash function is added before dimensions object
2. Split calculation is correct (80/10/10 distribution)
3. `data_split_train_dev_test` is added to dimensions object

---

## TASK 1.3: Add Training Pair Generation Mapping

### Objective
Add response mapping for the Training Pair Generation prompt template so that 3 dimensions (`prompt_candidate`, `target_answer`, `style_directives`) get populated.

### Implementation Prompt

**Action:** Copy the ENTIRE prompt below into a NEW conversation in Cursor with Claude-4.5-sonnet Thinking.

========================



# TASK 1.3: Add Training Pair Generation Response Mapping

## Context
You are working on the Bright Run LoRA Training Data Platform. When AI prompts execute, Claude returns JSON responses that need to be mapped to dimension fields. The Training Pair Generation prompt is missing from the response mapping, so its dimensions never get saved.

## Problem
In `src/lib/dimension-generation/generator.ts`, there's a function called `mapResponseToDimensions` (around line 283) that maps AI responses to dimension fields. It has mappings for 5 template types:
- `content_analysis` ✅
- `task_extraction` ✅
- `cer_analysis` ✅
- `scenario_extraction` ✅
- `risk_assessment` ✅
- `training_pair_generation` ❌ MISSING

## Your Task
Add the missing mapping for `training_pair_generation` so the 3 Training Pair dimensions get populated.

## Detailed Instructions

### Step 1: Locate the Mapping Function
Open `src/lib/dimension-generation/generator.ts` and find the `mapResponseToDimensions` function around line 283.

It currently looks like this:

```typescript
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
  };

  return mapping[templateType] || {};
}
```

### Step 2: Add Training Pair Generation Mapping
Add the new mapping BEFORE the `risk_assessment` entry. Insert this code:

```typescript
    'training_pair_generation': {
      prompt_candidate: response.prompt_candidate,
      target_answer: response.target_answer,
      style_directives: response.style_directives,
    },
```

### Expected Result
After your changes, the mapping object should include all 6 template types:

```typescript
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
    'training_pair_generation': {
      prompt_candidate: response.prompt_candidate,
      target_answer: response.target_answer,
      style_directives: response.style_directives,
    },
    'risk_assessment': {
      safety_tags: response.safety_tags,
      coverage_tag: response.coverage_tag,
      novelty_tag: response.novelty_tag,
      ip_sensitivity: response.ip_sensitivity,
      pii_flag: response.pii_flag,
      compliance_flags: response.compliance_flags,
    },
  };

  return mapping[templateType] || {};
}
```

## What This Does
When the Training Pair Generation prompt executes:
1. Claude returns JSON like: `{"prompt_candidate": "...", "target_answer": "...", "style_directives": "..."}`
2. The code calls `mapResponseToDimensions(response, 'training_pair_generation')`
3. Now it finds the mapping and extracts the 3 fields
4. The 3 dimensions get saved to the database

Without this mapping, the prompt runs but the response is ignored.

## Testing
After making the changes:
1. Code should compile without errors
2. Later when dimensions are generated for any chunk type, the Training Pair prompt should run and populate 3 fields

## Summary
You're adding a 4-line mapping entry so that Training Pair Generation responses get properly extracted and saved. This fixes 3 missing dimensions (`prompt_candidate`, `target_answer`, `style_directives`).



++++++++++++++++++++++

**After the AI completes this task, verify:**
1. The new mapping is added in the correct location
2. Commas are correct (between mapping entries)
3. The code compiles without errors

---

## TASK 1.4: Add chunk_type Mapping in Dimension Service

### Objective
Fix the `chunk_type` dimension so it displays correctly in the Dimension Validation Spreadsheet. It's stored in the `chunks` table but needs to be mapped in the service layer.

### Implementation Prompt

**Action:** Copy the ENTIRE prompt below into a NEW conversation in Cursor with Claude-4.5-sonnet Thinking.

========================



# TASK 1.4: Add chunk_type Mapping in Dimension Service

## Context
You are working on the Bright Run LoRA Training Data Platform. The `chunk_type` dimension appears missing in the Dimension Validation Spreadsheet, but it's actually stored in the `chunks` table (not the `chunk_dimensions` table). The service layer needs to map it correctly.

## Problem
In `src/lib/dimension-service.ts`, there's a function called `getDimensionValidationData` that fetches and joins dimension data. It has a switch statement (around lines 151-178) that handles fields stored in the `chunks` table rather than the `chunk_dimensions` table.

The switch statement maps these chunk-table fields:
- `chunk_id` ✅
- `section_heading` ✅
- `page_start` ✅
- `page_end` ✅
- `char_start` ✅
- `char_end` ✅
- `token_count` ✅
- `overlap_tokens` ✅
- `chunk_handle` ✅
- `chunk_type` ❌ MISSING

## Your Task
Add `chunk_type` to the switch statement so it gets properly mapped from the chunks table.

## Detailed Instructions

### Step 1: Locate the Service File
Open `src/lib/dimension-service.ts` and find the `getDimensionValidationData` function around line 71.

### Step 2: Find the Switch Statement
Look for the switch statement around line 151 that maps chunk-table fields:

```typescript
switch (meta.fieldName) {
  case 'chunk_id':
    value = chunk.chunk_id;
    break;
  case 'section_heading':
    value = chunk.section_heading;
    break;
  case 'page_start':
    value = chunk.page_start;
    break;
  case 'page_end':
    value = chunk.page_end;
    break;
  case 'char_start':
    value = chunk.char_start;
    break;
  case 'char_end':
    value = chunk.char_end;
    break;
  case 'token_count':
    value = chunk.token_count;
    break;
  case 'overlap_tokens':
    value = chunk.overlap_tokens;
    break;
  case 'chunk_handle':
    value = chunk.chunk_handle;
    break;
  default:
    // All other dimensions come from chunk_dimensions table
    value = (dimensions as any)[meta.fieldName];
}
```

### Step 3: Add chunk_type Case
Add a new case for `chunk_type` BEFORE the `default` case:

```typescript
  case 'chunk_handle':
    value = chunk.chunk_handle;
    break;
  case 'chunk_type':
    value = chunk.chunk_type;
    break;
  default:
    // All other dimensions come from chunk_dimensions table
    value = (dimensions as any)[meta.fieldName];
```

### Expected Result
After your changes, the switch statement should include all 10 chunk-table fields:

```typescript
switch (meta.fieldName) {
  case 'chunk_id':
    value = chunk.chunk_id;
    break;
  case 'section_heading':
    value = chunk.section_heading;
    break;
  case 'page_start':
    value = chunk.page_start;
    break;
  case 'page_end':
    value = chunk.page_end;
    break;
  case 'char_start':
    value = chunk.char_start;
    break;
  case 'char_end':
    value = chunk.char_end;
    break;
  case 'token_count':
    value = chunk.token_count;
    break;
  case 'overlap_tokens':
    value = chunk.overlap_tokens;
    break;
  case 'chunk_handle':
    value = chunk.chunk_handle;
    break;
  case 'chunk_type':
    value = chunk.chunk_type;
    break;
  default:
    // All other dimensions come from chunk_dimensions table
    value = (dimensions as any)[meta.fieldName];
}
```

## Why This Mapping Is Needed
The `chunk_type` field is set during chunk extraction (BEFORE dimension generation) and stored in the `chunks` table. The Dimension Validation Spreadsheet expects to find ALL 60 dimensions, including chunk_type. This switch statement tells the service layer to fetch `chunk_type` from the `chunks` table instead of looking for it in `chunk_dimensions`.

## Testing
After making the changes:
1. Code should compile without errors
2. Later when viewing the Dimension Validation Spreadsheet, `chunk_type` should show a value like "Chapter_Sequential" or "Instructional_Unit"

## Summary
You're adding a single case statement to map `chunk_type` from the chunks table. This fixes 1 dimension display issue in the UI.



++++++++++++++++++++++

**After the AI completes this task, verify:**
1. The new case is added in the correct location
2. The code compiles without errors
3. The switch statement formatting is consistent

---

## Completion Checklist

### Phase 2: Database Verification
- [ ] Task 2.1: Ran SQL to check prompt templates
- [ ] Task 2.2: Seeded prompt templates (if needed)
- [ ] Task 2.3: Verified test chunk type
- [ ] Task 2.4: Verified Risk Assessment fields

### Phase 1: Quick Wins
- [ ] Task 1.1: Added labeling metadata (4 fields)
- [ ] Task 1.2: Added training split assignment (1 field)
- [ ] Task 1.3: Added Training Pair mapping (3 fields)
- [ ] Task 1.4: Added chunk_type mapping (1 field)

### Verification
- [ ] All code compiles without errors
- [ ] No TypeScript type errors
- [ ] Ready to test dimension regeneration

---

## Next Steps

After completing Phase 1 and Phase 2:

1. **Test Your Changes**
   - Navigate to the Dimension Validation Spreadsheet in your app
   - Select a test chunk
   - Regenerate dimensions (if your app has this feature)
   - Verify the following:
     - ✅ 4 labeling fields populated
     - ✅ data_split_train_dev_test assigned
     - ✅ chunk_type displays
     - ✅ Training Pair dimensions populated (if template exists)

2. **Check Database Directly** (Optional)
   Run this SQL in Supabase to verify:
   
   ```sql
   SELECT 
     chunk_id,
     label_source_auto_manual_mixed,
     label_model,
     labeled_by,
     label_timestamp_iso,
     data_split_train_dev_test,
     prompt_candidate,
     target_answer,
     style_directives
   FROM chunk_dimensions
   WHERE chunk_id = 'b96530dd-7620-41f7-9d64-1c8c738375ce
   ORDER BY generated_at DESC
   LIMIT 1;
   ```

3. **Proceed to Phase 3** (Document Module)
   See: `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_document_module_v1.md`

---

## Troubleshooting

### Issue: AI_CONFIG is undefined
**Solution:** Verify import at top of generator.ts:
```typescript
import { AI_CONFIG } from '../ai-config';
```

### Issue: ChunkDimensions type errors
**Solution:** Check `src/types/chunks.ts` has all field definitions

### Issue: Prompt templates still not working
**Solution:** Re-run Task 2.1 SQL to verify templates exist and are `is_active = true`

### Issue: Training Pair dimensions still NULL
**Solution:** 
1. Verify template exists (Task 2.1)
2. Verify mapping was added (Task 1.3)
3. Check for Claude API errors in console logs

### Issue: chunk_type still not displaying
**Solution:** Verify case was added to switch statement in dimension-service.ts (Task 1.4)

---

## Summary

**Phase 2 accomplished:**
- ✅ Discovered 5/6 templates already exist (better than expected!)
- ✅ Added the 1 missing Training Pair Generation template
- ✅ Confirmed chunk type for testing
- ✅ Validated Risk Assessment template

**Phase 1 accomplished:**
- ✅ Fixed 9 dimensions via code changes
- ✅ Added labeling metadata (4 fields)
- ✅ Added training split (1 field)
- ✅ Added Training Pair mapping (3 fields)
- ✅ Fixed chunk_type display (1 field)

**Database Discovery:**
- Your schema uses `applicable_chunk_types` (not `chunk_type_filter`)
- Your schema has `response_schema` (not `output_schema`)
- Templates use versioned naming (e.g., `content_analysis_v1`)
- All existing templates are `is_active = true` ✅

**Total Effort:** 2.5-3 hours (less than expected due to existing templates!)  
**Dimensions Fixed:** 9  
**Next Phase:** Document Module (5 more dimensions)

---

**End of Quick Wins Implementation Specification**

## Follow Up Validation & Testing Notes

### Analysis: Training Pair Generation Fields Returning NULL
**Date:** October 8, 2025  
**Analyst:** Claude (AI Assistant)  
**Issue:** `prompt_candidate`, `target_answer`, and `style_directives` are NULL in database despite mapping being added

#### Investigation Summary

**Test Query Results:**
```sql
SELECT chunk_id, label_source_auto_manual_mixed, label_model, labeled_by, 
       label_timestamp_iso, data_split_train_dev_test, 
       prompt_candidate, target_answer, style_directives
FROM chunk_dimensions
WHERE chunk_id = 'b96530dd-7620-41f7-9d64-1c8c738375ce'
ORDER BY generated_at DESC LIMIT 1;
```

Results show:
- ✅ Labeling fields populated correctly (auto, claude-sonnet-4-5-20250929, system)
- ✅ Data split assigned correctly (test)
- ❌ Training Pair fields are NULL (prompt_candidate, target_answer, style_directives)

#### Root Cause Identified

**BUG LOCATION:** `src/lib/chunk-service.ts`, lines 158-172  
**Function:** `promptTemplateService.getActiveTemplates()`

**The Problem:**

The `getActiveTemplates` function filters templates based on chunk type:

```typescript
async getActiveTemplates(chunkType?: ChunkType): Promise<PromptTemplate[]> {
  let query = supabase
    .from('prompt_templates')
    .select('*')
    .eq('is_active', true);
  
  if (chunkType) {
    query = query.contains('applicable_chunk_types', [chunkType]);
  }
  
  const { data, error } = await query.order('template_type');
  
  if (error) throw error;
  return data || [];
}
```

**Line 165 is the culprit:**
```typescript
query = query.contains('applicable_chunk_types', [chunkType]);
```

**The Issue:**
- The Training Pair Generation template has `applicable_chunk_types = NULL` (per spec line 193)
- NULL means "applies to ALL chunk types"
- The `.contains()` operator only matches array values, NOT NULL
- Therefore, the template is **never retrieved** for any chunk

**Call Chain:**
1. `generateDimensionsForChunk()` calls `getActiveTemplates(chunk.chunk_type)` (generator.ts:205)
2. `getActiveTemplates()` filters with `.contains('applicable_chunk_types', [chunkType])` 
3. NULL values don't match `.contains()` query
4. Training Pair template is excluded from results
5. Template never executes → fields never populate → NULL in database

#### Why the Mapping Addition Didn't Fix It

The mapping added in Task 1.3 (lines 339-343 in generator.ts) is **correct**:

```typescript
'training_pair_generation': {
  prompt_candidate: response.prompt_candidate,
  target_answer: response.target_answer,
  style_directives: response.style_directives,
},
```

**BUT:** The mapping never runs because the template is never fetched in the first place. It's like adding a translation dictionary for a language the system never speaks to.

#### The Correct Fix

The `getActiveTemplates()` function needs to handle NULL `applicable_chunk_types` as "match all":

```typescript
async getActiveTemplates(chunkType?: ChunkType): Promise<PromptTemplate[]> {
  let query = supabase
    .from('prompt_templates')
    .select('*')
    .eq('is_active', true);
  
  if (chunkType) {
    // Match templates that either:
    // 1. Have NULL applicable_chunk_types (applies to all), OR
    // 2. Contain this specific chunk type in their array
    query = query.or(`applicable_chunk_types.is.null,applicable_chunk_types.cs.{${chunkType}}`);
  }
  
  const { data, error } = await query.order('template_type');
  
  if (error) throw error;
  return data || [];
}
```

**Key Change:**
- Old: `.contains('applicable_chunk_types', [chunkType])` - only matches arrays containing chunk type
- New: `.or('applicable_chunk_types.is.null,applicable_chunk_types.cs.{chunkType}')` - matches NULL OR arrays containing chunk type

#### Secondary Issue: Limited Logging

**Current Logging:**
- ✅ Error logging exists (lines 291-292 in generator.ts) for JSON parse failures
- ❌ No logging of successful API responses
- ❌ No logging of which templates were retrieved/executed
- ❌ No logging of raw Claude API responses

**Suggested Improvements (for future debugging):**
1. Log templates retrieved: `console.log('Retrieved templates:', templates.map(t => t.template_type))`
2. Log API responses: `console.log('Claude response for', template.template_type, responseText.substring(0, 200))`
3. Optional: Write responses to flat files in `system/api-logs/` directory with timestamps

**P.S. on Logging:** Currently there is NO system for logging API responses to disk. All logging is console-only and ephemeral. Consider adding:
```typescript
// In executePromptTemplate, after receiving response:
const fs = require('fs');
const logPath = `./system/api-logs/${new Date().toISOString()}_${template.template_type}.json`;
fs.writeFileSync(logPath, JSON.stringify({ prompt, response: responseText, template }, null, 2));
```

#### Impact Assessment

**Affected Prompts:**
- Only `training_pair_generation` template (it's the only one with NULL `applicable_chunk_types`)
- Other templates have explicit chunk type arrays and work correctly

**Affected Fields:**
- `prompt_candidate` (never populated)
- `target_answer` (never populated)  
- `style_directives` (never populated)

**Data Integrity:**
- ALL existing dimension records have NULL for these 3 fields
- Will need full regeneration after fix to populate historical data

#### Verification Steps (After Fix)

1. **Verify template retrieval:**
   ```typescript
   const templates = await promptTemplateService.getActiveTemplates('Chapter_Sequential');
   console.log(templates.map(t => t.template_type));
   // Should include 'training_pair_generation'
   ```

2. **Test dimension generation:**
   - Pick any chunk
   - Regenerate dimensions
   - Query database for training pair fields
   - Should see populated values

3. **Check SQL directly:**
   ```sql
   SELECT template_type, applicable_chunk_types
   FROM prompt_templates
   WHERE template_type = 'training_pair_generation';
   -- Verify NULL value is intentional
   ```

#### Summary

**Status:** ❌ Bug identified, NOT fixed (per user request - analysis only)

**Issue:** Template filtering logic doesn't handle NULL `applicable_chunk_types` correctly

**Solution:** Update `.contains()` query to `.or()` query that matches NULL OR specific chunk type

**Next Step:** Implement fix in Task 1.3.1 (new task to add to Phase 1)

**Estimated Fix Time:** 5 minutes (change 1 line of code, test)

**Testing Required After Fix:** 
- Unit test template retrieval with NULL applicable_chunk_types
- Integration test full dimension generation
- Verify all 6 templates execute for test chunk

---

