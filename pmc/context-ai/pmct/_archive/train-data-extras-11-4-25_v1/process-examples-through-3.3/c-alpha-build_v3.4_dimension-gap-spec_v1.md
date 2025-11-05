# Dimension Gap Fix Implementation Specification
**Version:** 1.0
**Date:** 2025-01-10
**Purpose:** Comprehensive analysis and fix specification for missing AI-generated dimensions
**Status:** Implementation Ready
**Related Documents:**
- Test Results: `c-alpha-build_v3.4_dimension-testing-v1.md`
- Prompt Templates: `pmc/product/_prompt_engineering/dimensions-prompts_v1.md`
- Dimension Driver: `c-alpha-build-spec_v3.3_dimensions-driver_v1.md`

---

## Executive Summary

**Problem:** 13 out of 60 dimensions are missing (21.7% gap), all AI-generated dimensions
**Root Cause:** Two-part system issue:
1. **Prompt Template Database Missing**: No templates exist in `prompt_templates` table
2. **Incomplete Response Mapping**: `mapResponseToDimensions` function missing fields

**Impact:** 78.3% dimension completion rate instead of expected 93-97% (excluding backlog items)
**Solution:** Seed database with correct prompt templates and fix response mapping
**Estimated Effort:** 3-4 hours (database seeding + code fixes + testing)

---

## Part 1: Deep Code Analysis

### 1.1 Current System Architecture

The dimension generation system follows this flow:

```typescript
// From generator.ts:261-269
async generateDimensionsForChunk() {
  // Step 1: Get templates from database
  let templates = await promptTemplateService.getActiveTemplates(chunk.chunk_type);

  // Step 2: Execute each template
  for (const template of templates) {
    const result = await this.executePromptTemplate({...});
    Object.assign(dimensions, result.dimensions);
  }
}
```

**Key Finding:** The system queries `prompt_templates` table, but **the table is likely empty or incomplete**.

### 1.2 Missing Dimensions Analysis

From the test results file (`c-alpha-build_v3.4_dimension-testing-v1.md`):

**Content Analysis Dimensions (7 missing):**
1. `chunk_summary_1s` - One-sentence summary
2. `key_terms` - Important terms/concepts
3. `audience` - Target audience
4. `intent` - Author's intent
5. `tone_voice_tags` - Style/voice descriptors
6. `brand_persona_tags` - Brand identity traits
7. `domain_tags` - Subject domain tags

**Task Extraction Dimensions (6 missing):**
8. `task_name` - Task/procedure name
9. `preconditions` - Prerequisites
10. `inputs` - Required inputs
11. `steps_json` - Step-by-step JSON
12. `expected_output` - Expected results
13. `warnings_failure_modes` - Known pitfalls

### 1.3 Response Mapping Code Analysis

Current mapping in `generator.ts:391-440`:

```typescript
private mapResponseToDimensions(response: any, templateType: string) {
  const mapping: Record<string, Partial<ChunkDimensions>> = {
    'content_analysis': {
      chunk_summary_1s: response.chunk_summary_1s,
      key_terms: response.key_terms,
      audience: response.audience,
      intent: response.intent,
      tone_voice_tags: response.tone_voice_tags,  // ✅ PRESENT
      brand_persona_tags: response.brand_persona_tags,  // ✅ PRESENT
      domain_tags: response.domain_tags,  // ✅ PRESENT
    },
    'task_extraction': {
      task_name: response.task_name,
      preconditions: response.preconditions,
      inputs: response.inputs,
      steps_json: response.steps_json,
      expected_output: response.expected_output,
      warnings_failure_modes: response.warnings_failure_modes,
    },
    // ... other mappings
  };
}
```

**CRITICAL FINDING:** The mapping code **IS CORRECT** and includes all missing dimensions!

### 1.4 Prompt Template Analysis

From `dimensions-prompts_v1.md` (902 lines):

**Prompt 1: Content Analysis** (Lines 9-116)
- Generates: `chunk_type`, `chunk_summary_1s`, `key_terms`, `audience`, `intent`, `domain_tags`
- Missing from prompt: `tone_voice_tags`, `brand_persona_tags` (these are in Prompt 2)

**Prompt 2: Style & Voice Analysis** (Lines 118-190)
- Generates: `tone_voice_tags`, `brand_persona_tags`, `style_notes`
- **This is a separate prompt!**

**Prompt 3: Instructional Analysis** (Lines 193-284)
- Generates all 6 task dimensions
- Condition: Only runs if `chunk_type == "Instructional_Unit"`

---

## Part 2: Root Cause Determination

### 2.1 Primary Root Cause: Database Empty

**Evidence:**
1. Test file shows 13 dimensions missing
2. All missing dimensions are AI-generated
3. Response mapping code is correct
4. Conclusion: **Templates are not in the database**

**Verification Command:**
```sql
SELECT COUNT(*) FROM prompt_templates WHERE is_active = true;
-- Expected: 6-8 templates
-- Actual: Likely 0-2 templates
```

### 2.2 Secondary Issue: Prompt Structure Mismatch

The `dimensions-prompts_v1.md` file defines **8 separate prompts**, but the current code assumes they're structured differently:

**Document Structure:**
- Prompt 1: Content Analysis (partial)
- Prompt 2: Style & Voice Analysis (separate!)
- Prompt 3: Instructional Analysis
- Prompt 4: CER Analysis
- Prompt 5: Scenario Analysis
- Prompt 6: Training Pair Generation
- Prompt 7: Risk & Compliance
- Prompt 8: Training Decisions

**Current Code Assumes:**
- `content_analysis` template generates 7 dimensions
- But the document splits this into Prompt 1 (5 dims) + Prompt 2 (3 dims)

---

## Part 3: Required Fixes

### Fix 1: Seed Prompt Templates Database

**Priority:** CRITICAL
**Estimated Time:** 2 hours
**Risk:** Low (pure database seeding)

#### 3.1.1 Database Schema Verification

First, verify the `prompt_templates` table structure:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'prompt_templates'
ORDER BY ordinal_position;
```

**Expected Columns:**
- `id` (uuid, primary key)
- `template_name` (text)
- `template_type` (text) - Maps to response mapping keys
- `prompt_text` (text) - The actual prompt
- `applicable_chunk_types` (text[] or jsonb) - Array of chunk types
- `is_active` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### 3.1.2 Template Seeding Strategy

**Option A: Merge Prompts 1 & 2 (RECOMMENDED)**

Since the code expects `content_analysis` to return all 7 content dimensions, we should merge Prompt 1 and Prompt 2 into a single template.

**New Merged Prompt:**
```json
{
  "template_name": "content_analysis_comprehensive",
  "template_type": "content_analysis",
  "applicable_chunk_types": null,  // Applies to all
  "is_active": true,
  "prompt_text": "Analyze the following chunk of text and extract comprehensive content dimensions.\n\n**Document Context:**\n- Title: {doc_title}\n- Category: {primary_category}\n- Chunk Type: {chunk_type}\n\n**Chunk Text:**\n{chunk_text}\n\n**Required Analysis:**\n\nProvide a JSON response with the following structure:\n\n```json\n{\n  \"chunk_summary_1s\": \"One-sentence summary (max 30 words)\",\n  \"key_terms\": [\"term1\", \"term2\", \"term3\"],\n  \"audience\": \"Target audience description\",\n  \"intent\": \"educate|instruct|persuade|inform|narrate|summarize|compare|evaluate\",\n  \"tone_voice_tags\": [\"authoritative\", \"conversational\"],\n  \"brand_persona_tags\": [\"trusted advisor\", \"data-driven\"],\n  \"domain_tags\": [\"B2B Marketing\", \"AI Ops\"]\n}\n```\n\n**Instructions:**\n1. **chunk_summary_1s**: Summarize the main point in one sentence, maximum 240 characters\n2. **key_terms**: Extract 3-10 salient terms and concepts\n3. **audience**: Identify the intended reader/user persona\n4. **intent**: Choose the primary author intent from the enum\n5. **tone_voice_tags**: Identify 2-6 style/voice descriptors (e.g., technical, conversational, authoritative, pragmatic)\n6. **brand_persona_tags**: Identify 2-5 brand identity traits (e.g., trusted advisor, innovative, data-driven)\n7. **domain_tags**: Assign 1-5 topic/domain taxonomy labels\n\nRespond with valid JSON only, no additional text."
}
```

**Option B: Keep Separate, Add New Template**

If we want to preserve the original 8-prompt structure, we need to:
1. Rename `content_analysis` → `content_classification`
2. Create new `style_voice_analysis` template
3. Update response mapping to handle both

**RECOMMENDATION:** Use Option A (merge) for simplicity and consistency with existing code.

#### 3.1.3 Complete Template Set (6 Templates)

**Template 1: Content Analysis (Merged Prompts 1 + 2)**
```sql
INSERT INTO prompt_templates (
  id,
  template_name,
  template_type,
  applicable_chunk_types,
  is_active,
  prompt_text
) VALUES (
  gen_random_uuid(),
  'content_analysis_comprehensive',
  'content_analysis',
  NULL,  -- Applies to all chunk types
  true,
  'Analyze the following chunk of text and extract comprehensive content dimensions.

**Document Context:**
- Title: {doc_title}
- Category: {primary_category}
- Chunk Type: {chunk_type}

**Chunk Text:**
{chunk_text}

**Required Analysis:**

Provide a JSON response with the following structure:

```json
{
  "chunk_summary_1s": "One-sentence summary (max 30 words)",
  "key_terms": ["term1", "term2", "term3"],
  "audience": "Target audience description",
  "intent": "educate|instruct|persuade|inform|narrate|summarize|compare|evaluate",
  "tone_voice_tags": ["authoritative", "conversational"],
  "brand_persona_tags": ["trusted advisor", "data-driven"],
  "domain_tags": ["B2B Marketing", "AI Ops"]
}
```

**Instructions:**
1. **chunk_summary_1s**: Summarize the main point in one sentence, maximum 240 characters
2. **key_terms**: Extract 3-10 salient terms and concepts from the chunk
3. **audience**: Identify the intended reader/user persona (e.g., "SMB Owners; Ops Managers")
4. **intent**: Choose the primary author intent from: educate, instruct, persuade, inform, narrate, summarize, compare, evaluate
5. **tone_voice_tags**: Identify 2-6 style/voice descriptors (e.g., technical, conversational, authoritative, pragmatic, clear)
6. **brand_persona_tags**: Identify 2-5 brand identity traits relevant to voice (e.g., trusted advisor, innovative, data-driven, empowering)
7. **domain_tags**: Assign 1-5 topic/domain taxonomy labels (e.g., "B2B Marketing", "AI Operations", "SaaS Business")

**Important:** Respond with valid JSON only, no additional text or markdown code blocks.'
);
```

**Template 2: Task Extraction**
```sql
INSERT INTO prompt_templates (
  id,
  template_name,
  template_type,
  applicable_chunk_types,
  is_active,
  prompt_text
) VALUES (
  gen_random_uuid(),
  'task_extraction',
  'task_extraction',
  ARRAY['Instructional_Unit']::text[],  -- Only for instructional chunks
  true,
  'Extract the instructional components from this chunk.

**Document Context:**
- Title: {doc_title}
- Category: {primary_category}
- Section: {section_heading}

**Chunk Text:**
{chunk_text}

**Required Analysis:**

Provide a JSON response with the following structure:

```json
{
  "task_name": "Primary task/procedure name",
  "preconditions": "Requirements before executing the task",
  "inputs": "Inputs/resources needed",
  "steps_json": [
    {"step": "Step 1", "details": "Detailed instructions"},
    {"step": "Step 2", "details": "Detailed instructions"}
  ],
  "expected_output": "What success looks like",
  "warnings_failure_modes": "Known pitfalls and failure conditions"
}
```

**Instructions:**
1. **task_name**: Identify the primary task or procedure described
2. **preconditions**: List requirements that must be met before starting
3. **inputs**: Describe what resources, data, or access is needed
4. **steps_json**: Break down the task into sequential steps with details
5. **expected_output**: Describe what success/completion looks like
6. **warnings_failure_modes**: Identify common mistakes or failure points

**Important:** Respond with valid JSON only, no additional text or markdown code blocks.'
);
```

**Template 3: CER Analysis**
```sql
INSERT INTO prompt_templates (
  id,
  template_name,
  template_type,
  applicable_chunk_types,
  is_active,
  prompt_text
) VALUES (
  gen_random_uuid(),
  'cer_analysis',
  'cer_analysis',
  ARRAY['CER']::text[],
  true,
  'Extract the claim-evidence-reasoning structure from this chunk.

**Document Context:**
- Title: {doc_title}
- Author: {author}

**Chunk Text:**
{chunk_text}

**Required Analysis:**

Provide a JSON response with the following structure:

```json
{
  "claim": "Main assertion stated in this chunk",
  "evidence_snippets": ["Evidence 1", "Evidence 2"],
  "reasoning_sketch": "High-level rationale connecting evidence to claim",
  "citations": ["https://example.com/source1"],
  "factual_confidence_0_1": 0.85
}
```

**Instructions:**
1. **claim**: Identify the main assertion or thesis
2. **evidence_snippets**: Extract quoted or paraphrased evidence supporting the claim
3. **reasoning_sketch**: Provide concise rationale (max 300 chars) connecting evidence to claim
4. **citations**: List any sources, links, or references mentioned
5. **factual_confidence_0_1**: Rate confidence in factuality from 0.0 to 1.0

**Important:** Respond with valid JSON only, no additional text or markdown code blocks.'
);
```

**Template 4: Scenario Extraction**
```sql
INSERT INTO prompt_templates (
  id,
  template_name,
  template_type,
  applicable_chunk_types,
  is_active,
  prompt_text
) VALUES (
  gen_random_uuid(),
  'scenario_extraction',
  'scenario_extraction',
  ARRAY['Example_Scenario']::text[],
  true,
  'Extract the scenario structure from this example chunk.

**Document Context:**
- Title: {doc_title}
- Category: {primary_category}

**Chunk Text:**
{chunk_text}

**Required Analysis:**

Provide a JSON response with the following structure:

```json
{
  "scenario_type": "case_study|dialogue|Q&A|walkthrough|anecdote",
  "problem_context": "Real-world context of the example",
  "solution_action": "Action taken in the example",
  "outcome_metrics": "Measured results or KPIs",
  "style_notes": "Narrative/style attributes to mimic"
}
```

**Instructions:**
1. **scenario_type**: Categorize the type of example
2. **problem_context**: Describe the situation or challenge
3. **solution_action**: Explain what was done to address it
4. **outcome_metrics**: Quantify results if available
5. **style_notes**: Note stylistic elements (e.g., "Conversational, concrete, with numbers")

**Important:** Respond with valid JSON only, no additional text or markdown code blocks.'
);
```

**Template 5: Training Pair Generation**
```sql
INSERT INTO prompt_templates (
  id,
  template_name,
  template_type,
  applicable_chunk_types,
  is_active,
  prompt_text
) VALUES (
  gen_random_uuid(),
  'training_pair_generation',
  'training_pair_generation',
  NULL,  -- Applies to all chunk types
  true,
  'Generate a training pair from this chunk for LoRA fine-tuning.

**Document Context:**
- Title: {doc_title}
- Category: {primary_category}
- Chunk Type: {chunk_type}

**Chunk Text:**
{chunk_text}

**Required Analysis:**

Provide a JSON response with the following structure:

```json
{
  "prompt_candidate": "Natural user prompt that would elicit this knowledge",
  "target_answer": "Ideal answer capturing the chunk wisdom",
  "style_directives": "Formatting/voice directives for answers"
}
```

**Instructions:**
1. **prompt_candidate**: Formulate a question/request a user might ask
2. **target_answer**: Provide the ideal response based on chunk content
3. **style_directives**: Specify formatting (e.g., "Use numbered steps; avoid jargon; 150-250 words")

**Important:** Respond with valid JSON only, no additional text or markdown code blocks.'
);
```

**Template 6: Risk Assessment**
```sql
INSERT INTO prompt_templates (
  id,
  template_name,
  template_type,
  applicable_chunk_types,
  is_active,
  prompt_text
) VALUES (
  gen_random_uuid(),
  'risk_assessment',
  'risk_assessment',
  NULL,  -- Applies to all chunk types
  true,
  'Assess the risk and compliance factors for this chunk.

**Document Context:**
- Title: {doc_title}
- Category: {primary_category}
- Chunk Type: {chunk_type}

**Chunk Text:**
{chunk_text}

**Required Analysis:**

Provide a JSON response with the following structure:

```json
{
  "safety_tags": ["medical_advice", "legal_disclaimer"],
  "coverage_tag": "core|supporting|edge",
  "novelty_tag": "novel|common|disputed",
  "ip_sensitivity": "Public|Internal|Confidential|Trade_Secret",
  "pii_flag": false,
  "compliance_flags": ["copyright_third_party", "trademark"]
}
```

**Instructions:**
1. **safety_tags**: Flag sensitive topics for filtering/guardrails (empty array if none)
2. **coverage_tag**: Assess how central this content is to the domain
3. **novelty_tag**: Determine if content is unique IP, common knowledge, or disputed
4. **ip_sensitivity**: Rate confidentiality level
5. **pii_flag**: Boolean - does this contain personal data?
6. **compliance_flags**: List regulatory concerns (empty array if none)

**Important:** Respond with valid JSON only, no additional text or markdown code blocks.'
);
```

#### 3.1.4 Seeding SQL Script

**Complete Seeding Script:**

Create file: `pmc/context-ai/pmct/seed-prompt-templates_v1.sql`

```sql
-- Seed Prompt Templates for Dimension Generation
-- Version: 1.0
-- Date: 2025-01-10
-- Purpose: Populate prompt_templates table with 6 core templates

-- Verify table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'prompt_templates') THEN
    RAISE EXCEPTION 'Table prompt_templates does not exist!';
  END IF;
END $$;

-- Clear existing templates (optional - comment out if you want to preserve)
-- DELETE FROM prompt_templates WHERE template_type IN (
--   'content_analysis', 'task_extraction', 'cer_analysis',
--   'scenario_extraction', 'training_pair_generation', 'risk_assessment'
-- );

-- Template 1: Content Analysis (Comprehensive - Merged Prompts 1 & 2)
INSERT INTO prompt_templates (
  id, template_name, template_type, applicable_chunk_types, is_active, prompt_text
) VALUES (
  gen_random_uuid(),
  'content_analysis_comprehensive',
  'content_analysis',
  NULL,
  true,
  'Analyze the following chunk of text and extract comprehensive content dimensions.

**Document Context:**
- Title: {doc_title}
- Category: {primary_category}
- Chunk Type: {chunk_type}

**Chunk Text:**
{chunk_text}

**Required Analysis:**

Provide a JSON response with the following structure:

```json
{
  "chunk_summary_1s": "One-sentence summary (max 30 words)",
  "key_terms": ["term1", "term2", "term3"],
  "audience": "Target audience description",
  "intent": "educate",
  "tone_voice_tags": ["authoritative", "conversational"],
  "brand_persona_tags": ["trusted advisor", "data-driven"],
  "domain_tags": ["B2B Marketing", "AI Ops"]
}
```

**Instructions:**
1. **chunk_summary_1s**: Summarize the main point in one sentence, maximum 240 characters
2. **key_terms**: Extract 3-10 salient terms and concepts from the chunk
3. **audience**: Identify the intended reader/user persona (e.g., "SMB Owners; Ops Managers")
4. **intent**: Choose the primary author intent from: educate, instruct, persuade, inform, narrate, summarize, compare, evaluate
5. **tone_voice_tags**: Identify 2-6 style/voice descriptors (e.g., technical, conversational, authoritative, pragmatic, clear)
6. **brand_persona_tags**: Identify 2-5 brand identity traits relevant to voice (e.g., trusted advisor, innovative, data-driven, empowering)
7. **domain_tags**: Assign 1-5 topic/domain taxonomy labels (e.g., "B2B Marketing", "AI Operations", "SaaS Business")

**Important:** Respond with valid JSON only, no additional text or markdown code blocks.'
)
ON CONFLICT DO NOTHING;

-- Template 2: Task Extraction
INSERT INTO prompt_templates (
  id, template_name, template_type, applicable_chunk_types, is_active, prompt_text
) VALUES (
  gen_random_uuid(),
  'task_extraction',
  'task_extraction',
  ARRAY['Instructional_Unit']::text[],
  true,
  'Extract the instructional components from this chunk.

**Document Context:**
- Title: {doc_title}
- Category: {primary_category}

**Chunk Text:**
{chunk_text}

**Required Analysis:**

Provide a JSON response with the following structure:

```json
{
  "task_name": "Primary task/procedure name",
  "preconditions": "Requirements before executing the task",
  "inputs": "Inputs/resources needed",
  "steps_json": [
    {"step": "Step 1", "details": "Detailed instructions"},
    {"step": "Step 2", "details": "Detailed instructions"}
  ],
  "expected_output": "What success looks like",
  "warnings_failure_modes": "Known pitfalls and failure conditions"
}
```

**Instructions:**
1. **task_name**: Identify the primary task or procedure described
2. **preconditions**: List requirements that must be met before starting
3. **inputs**: Describe what resources, data, or access is needed
4. **steps_json**: Break down the task into sequential steps with details
5. **expected_output**: Describe what success/completion looks like
6. **warnings_failure_modes**: Identify common mistakes or failure points

**Important:** Respond with valid JSON only, no additional text or markdown code blocks.'
)
ON CONFLICT DO NOTHING;

-- Template 3: CER Analysis
INSERT INTO prompt_templates (
  id, template_name, template_type, applicable_chunk_types, is_active, prompt_text
) VALUES (
  gen_random_uuid(),
  'cer_analysis',
  'cer_analysis',
  ARRAY['CER']::text[],
  true,
  'Extract the claim-evidence-reasoning structure from this chunk.

**Document Context:**
- Title: {doc_title}

**Chunk Text:**
{chunk_text}

**Required Analysis:**

Provide a JSON response with the following structure:

```json
{
  "claim": "Main assertion stated in this chunk",
  "evidence_snippets": ["Evidence 1", "Evidence 2"],
  "reasoning_sketch": "High-level rationale connecting evidence to claim",
  "citations": ["https://example.com/source1"],
  "factual_confidence_0_1": 0.85
}
```

**Instructions:**
1. **claim**: Identify the main assertion or thesis
2. **evidence_snippets**: Extract quoted or paraphrased evidence supporting the claim
3. **reasoning_sketch**: Provide concise rationale (max 300 chars) connecting evidence to claim
4. **citations**: List any sources, links, or references mentioned
5. **factual_confidence_0_1**: Rate confidence in factuality from 0.0 to 1.0

**Important:** Respond with valid JSON only, no additional text or markdown code blocks.'
)
ON CONFLICT DO NOTHING;

-- Template 4: Scenario Extraction
INSERT INTO prompt_templates (
  id, template_name, template_type, applicable_chunk_types, is_active, prompt_text
) VALUES (
  gen_random_uuid(),
  'scenario_extraction',
  'scenario_extraction',
  ARRAY['Example_Scenario']::text[],
  true,
  'Extract the scenario structure from this example chunk.

**Document Context:**
- Title: {doc_title}
- Category: {primary_category}

**Chunk Text:**
{chunk_text}

**Required Analysis:**

Provide a JSON response with the following structure:

```json
{
  "scenario_type": "case_study",
  "problem_context": "Real-world context of the example",
  "solution_action": "Action taken in the example",
  "outcome_metrics": "Measured results or KPIs",
  "style_notes": "Narrative/style attributes to mimic"
}
```

**Instructions:**
1. **scenario_type**: Categorize as case_study, dialogue, Q&A, walkthrough, or anecdote
2. **problem_context**: Describe the situation or challenge
3. **solution_action**: Explain what was done to address it
4. **outcome_metrics**: Quantify results if available
5. **style_notes**: Note stylistic elements (e.g., "Conversational, concrete, with numbers")

**Important:** Respond with valid JSON only, no additional text or markdown code blocks.'
)
ON CONFLICT DO NOTHING;

-- Template 5: Training Pair Generation
INSERT INTO prompt_templates (
  id, template_name, template_type, applicable_chunk_types, is_active, prompt_text
) VALUES (
  gen_random_uuid(),
  'training_pair_generation',
  'training_pair_generation',
  NULL,
  true,
  'Generate a training pair from this chunk for LoRA fine-tuning.

**Document Context:**
- Title: {doc_title}
- Category: {primary_category}
- Chunk Type: {chunk_type}

**Chunk Text:**
{chunk_text}

**Required Analysis:**

Provide a JSON response with the following structure:

```json
{
  "prompt_candidate": "Natural user prompt that would elicit this knowledge",
  "target_answer": "Ideal answer capturing the chunk wisdom",
  "style_directives": "Formatting/voice directives for answers"
}
```

**Instructions:**
1. **prompt_candidate**: Formulate a question/request a user might ask
2. **target_answer**: Provide the ideal response based on chunk content
3. **style_directives**: Specify formatting (e.g., "Use numbered steps; avoid jargon; 150-250 words")

**Important:** Respond with valid JSON only, no additional text or markdown code blocks.'
)
ON CONFLICT DO NOTHING;

-- Template 6: Risk Assessment
INSERT INTO prompt_templates (
  id, template_name, template_type, applicable_chunk_types, is_active, prompt_text
) VALUES (
  gen_random_uuid(),
  'risk_assessment',
  'risk_assessment',
  NULL,
  true,
  'Assess the risk and compliance factors for this chunk.

**Document Context:**
- Title: {doc_title}
- Category: {primary_category}
- Chunk Type: {chunk_type}

**Chunk Text:**
{chunk_text}

**Required Analysis:**

Provide a JSON response with the following structure:

```json
{
  "safety_tags": [],
  "coverage_tag": "core",
  "novelty_tag": "novel",
  "ip_sensitivity": "Internal",
  "pii_flag": false,
  "compliance_flags": []
}
```

**Instructions:**
1. **safety_tags**: Flag sensitive topics for filtering/guardrails (empty array if none)
2. **coverage_tag**: Assess how central this content is to the domain (core, supporting, or edge)
3. **novelty_tag**: Determine if content is novel, common, or disputed
4. **ip_sensitivity**: Rate as Public, Internal, Confidential, or Trade_Secret
5. **pii_flag**: Boolean - does this contain personal data?
6. **compliance_flags**: List regulatory concerns (empty array if none)

**Important:** Respond with valid JSON only, no additional text or markdown code blocks.'
)
ON CONFLICT DO NOTHING;

-- Verify insertion
SELECT
  template_name,
  template_type,
  applicable_chunk_types,
  is_active,
  LENGTH(prompt_text) as prompt_length
FROM prompt_templates
WHERE template_type IN (
  'content_analysis', 'task_extraction', 'cer_analysis',
  'scenario_extraction', 'training_pair_generation', 'risk_assessment'
)
ORDER BY template_type;

-- Expected output: 6 rows
```

### Fix 2: Verify Response Mapping (Already Correct)

**Priority:** LOW (already complete)
**Status:** ✅ No changes needed

The response mapping in `generator.ts:391-440` is already correct and includes all missing dimensions. No code changes required.

### Fix 3: Add Array-to-String Conversion

**Priority:** MEDIUM
**Estimated Time:** 30 minutes
**File:** `src/lib/dimension-generation/generator.ts`

Some dimensions are returned as arrays but should be stored as delimited strings:

```typescript
// CURRENT (Line 393-401):
'content_analysis': {
  chunk_summary_1s: response.chunk_summary_1s,
  key_terms: response.key_terms,  // ❌ Array needs conversion
  audience: response.audience,
  intent: response.intent,
  tone_voice_tags: response.tone_voice_tags,  // ❌ Array needs conversion
  brand_persona_tags: response.brand_persona_tags,  // ❌ Array needs conversion
  domain_tags: response.domain_tags,  // ❌ Array needs conversion
},

// FIXED:
'content_analysis': {
  chunk_summary_1s: response.chunk_summary_1s,
  key_terms: Array.isArray(response.key_terms)
    ? response.key_terms.join('|')
    : response.key_terms,
  audience: response.audience,
  intent: response.intent,
  tone_voice_tags: Array.isArray(response.tone_voice_tags)
    ? response.tone_voice_tags.join(', ')
    : response.tone_voice_tags,
  brand_persona_tags: Array.isArray(response.brand_persona_tags)
    ? response.brand_persona_tags.join(', ')
    : response.brand_persona_tags,
  domain_tags: Array.isArray(response.domain_tags)
    ? response.domain_tags.join(', ')
    : response.domain_tags,
},
```

**Complete Fix for All Array Fields:**

```typescript
// Location: generator.ts:389-440
private mapResponseToDimensions(response: any, templateType: string): Partial<ChunkDimensions> {
  // Helper function to handle array-to-string conversion
  const arrayToString = (value: any, delimiter: string = ', '): string | undefined => {
    if (value === null || value === undefined) return undefined;
    if (Array.isArray(value)) return value.join(delimiter);
    return value;
  };

  const mapping: Record<string, Partial<ChunkDimensions>> = {
    'content_analysis': {
      chunk_summary_1s: response.chunk_summary_1s,
      key_terms: arrayToString(response.key_terms, '|'),
      audience: response.audience,
      intent: response.intent,
      tone_voice_tags: arrayToString(response.tone_voice_tags),
      brand_persona_tags: arrayToString(response.brand_persona_tags),
      domain_tags: arrayToString(response.domain_tags),
    },
    'task_extraction': {
      task_name: response.task_name,
      preconditions: response.preconditions,
      inputs: response.inputs,
      steps_json: response.steps_json,  // Keep as JSON
      expected_output: response.expected_output,
      warnings_failure_modes: response.warnings_failure_modes,
    },
    'cer_analysis': {
      claim: response.claim,
      evidence_snippets: arrayToString(response.evidence_snippets, '|'),
      reasoning_sketch: response.reasoning_sketch,
      citations: arrayToString(response.citations),
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
      safety_tags: arrayToString(response.safety_tags),
      coverage_tag: response.coverage_tag,
      novelty_tag: response.novelty_tag,
      ip_sensitivity: response.ip_sensitivity,
      pii_flag: response.pii_flag,
      compliance_flags: arrayToString(response.compliance_flags),
    },
  };

  return mapping[templateType] || {};
}
```

---

## Part 4: Testing Plan

### 4.1 Database Verification Test

**Step 1:** Run seeding script
```bash
# Via Supabase SQL Editor
# Copy entire seed-prompt-templates_v1.sql and execute
```

**Step 2:** Verify templates exist
```sql
SELECT
  template_name,
  template_type,
  applicable_chunk_types,
  is_active,
  LENGTH(prompt_text) as prompt_length,
  created_at
FROM prompt_templates
WHERE is_active = true
ORDER BY template_type;
```

**Expected Result:** 6 rows returned

### 4.2 Dimension Generation Test

**Test Chunk:** Use existing test document "The World of SaaS"

**Step 1:** Regenerate dimensions for test document
```typescript
// Via API or test script
const generator = new DimensionGenerator();
await generator.generateDimensionsForDocument({
  documentId: 'test-doc-id',
  userId: 'test-user-id',
});
```

**Step 2:** Export dimensions to CSV
```bash
# Run dimension export
# Check output CSV
```

**Step 3:** Verify dimension population
```sql
SELECT
  COUNT(*) as total_chunks,
  COUNT(chunk_summary_1s) as summary_populated,
  COUNT(key_terms) as key_terms_populated,
  COUNT(audience) as audience_populated,
  COUNT(intent) as intent_populated,
  COUNT(tone_voice_tags) as tone_populated,
  COUNT(brand_persona_tags) as brand_populated,
  COUNT(domain_tags) as domain_populated
FROM chunk_dimensions
WHERE run_id = 'latest-run-id';
```

**Expected Result:** All counts equal to total_chunks

### 4.3 End-to-End Validation

**Acceptance Criteria:**
- ✅ All 6 templates in database with `is_active = true`
- ✅ Content analysis template generates 7 dimensions
- ✅ Task extraction template generates 6 dimensions (for Instructional_Unit chunks)
- ✅ Arrays properly converted to delimited strings
- ✅ No JSON parsing errors in API logs
- ✅ Dimension completion rate: 93-97% (excluding backlog items)

**Test Document Requirements:**
1. Must have at least one `Instructional_Unit` chunk (to test task extraction)
2. Must have at least one `CER` chunk (to test CER analysis)
3. Must have at least one `Example_Scenario` chunk (to test scenario extraction)
4. Must have several `Chapter_Sequential` chunks (to test content analysis only)

---

## Part 5: Implementation Steps

### Step 1: Database Seeding (2 hours)

1. **Review and verify** `prompt_templates` table schema
2. **Copy seeding script** from Section 3.1.4 to `seed-prompt-templates_v1.sql`
3. **Execute script** in Supabase SQL Editor
4. **Verify** 6 templates inserted with verification query
5. **Document** template IDs for reference

### Step 2: Code Fix - Array Conversion (30 min)

1. **Open** `src/lib/dimension-generation/generator.ts`
2. **Locate** `mapResponseToDimensions` method (line 389)
3. **Add** `arrayToString` helper function
4. **Update** all array field mappings
5. **Test** TypeScript compilation: `npm run build`

### Step 3: Integration Testing (1 hour)

1. **Upload test document** with diverse chunk types
2. **Extract chunks** via chunks API
3. **Generate dimensions** for all chunks
4. **Export to CSV** and verify dimensions populated
5. **Check API logs** for any parsing errors

### Step 4: Validation & Cleanup (30 min)

1. **Run SQL verification** queries
2. **Calculate dimension completion** rate
3. **Compare** before/after test results
4. **Document** any remaining gaps
5. **Update** documentation

**Total Estimated Time:** 4 hours

---

## Part 6: Expected Results

### Before Fix (Current State)
- Dimensions populated: 47/60 (78.3%)
- Missing: 13 AI-generated dimensions
- Completion by type:
  - Prior Generated: 8/8 (100%)
  - Mechanically Generated: 17/17 (100%)
  - AI Generated: 22/35 (62.9%)

### After Fix (Expected State)
- Dimensions populated: 58/60 (96.7%)
- Missing: 2 dimensions (embedding_id, vector_checksum - backlog)
- Completion by type:
  - Prior Generated: 8/8 (100%)
  - Mechanically Generated: 17/17 (100%)
  - AI Generated: 33/35 (94.3%)

**Note:** Some conditional dimensions (Task, CER, Scenario) will only appear for appropriate chunk types. A `Chapter_Sequential` chunk should have ~52/60 dimensions (87%), which is expected.

### Per-Chunk-Type Expected Completion

**Chapter_Sequential:**
- Content Analysis: 7 dimensions ✅
- Risk Assessment: 6 dimensions ✅
- Training Pair: 3 dimensions ✅
- Base metadata: 25 dimensions ✅
- **Total:** 41-45/60 dimensions (68-75%)

**Instructional_Unit:**
- Content Analysis: 7 dimensions ✅
- Task Extraction: 6 dimensions ✅
- Risk Assessment: 6 dimensions ✅
- Training Pair: 3 dimensions ✅
- Base metadata: 25 dimensions ✅
- **Total:** 47-52/60 dimensions (78-87%)

**CER:**
- Content Analysis: 7 dimensions ✅
- CER Analysis: 5 dimensions ✅
- Risk Assessment: 6 dimensions ✅
- Training Pair: 3 dimensions ✅
- Base metadata: 25 dimensions ✅
- **Total:** 46-51/60 dimensions (77-85%)

**Example_Scenario:**
- Content Analysis: 7 dimensions ✅
- Scenario Extraction: 5 dimensions ✅
- Risk Assessment: 6 dimensions ✅
- Training Pair: 3 dimensions ✅
- Base metadata: 25 dimensions ✅
- **Total:** 46-51/60 dimensions (77-85%)

---

## Part 7: Rollback Plan

If issues arise during implementation:

### Rollback Step 1: Disable New Templates
```sql
UPDATE prompt_templates
SET is_active = false
WHERE template_type IN (
  'content_analysis', 'task_extraction', 'cer_analysis',
  'scenario_extraction', 'training_pair_generation', 'risk_assessment'
);
```

### Rollback Step 2: Revert Code Changes
```bash
git checkout src/lib/dimension-generation/generator.ts
npm run build
```

### Rollback Step 3: Delete Generated Dimensions
```sql
DELETE FROM chunk_dimensions
WHERE run_id = 'problematic-run-id';
```

**Risk Assessment:** LOW - Changes are additive and non-destructive

---

## Part 8: Future Enhancements

### Enhancement 1: Dynamic Template Management UI
- Admin interface to create/edit/test prompts
- Version control for prompt templates
- A/B testing different prompt formulations

### Enhancement 2: Prompt Template Optimization
- Analyze API logs to identify common parsing errors
- Refine prompts for better dimension extraction
- Add few-shot examples to prompts

### Enhancement 3: Conditional Logic Expansion
- More granular chunk type detection
- Dynamic template selection based on content analysis
- Multi-stage dimension generation pipeline

### Enhancement 4: Quality Scoring
- Automated dimension quality assessment
- Human-in-the-loop validation workflow
- Confidence score calibration

---

## Appendix A: Troubleshooting Guide

### Issue 1: Templates Not Found
**Symptom:** Dimension generation runs but produces no AI dimensions
**Diagnosis:**
```sql
SELECT COUNT(*) FROM prompt_templates WHERE is_active = true;
-- If result is 0, templates not seeded
```
**Solution:** Re-run seeding script

### Issue 2: JSON Parsing Errors
**Symptom:** API logs show "Failed to parse response for template X"
**Diagnosis:** Check `api_response_logs` table
```sql
SELECT
  template_type,
  claude_response,
  extraction_error
FROM api_response_logs
WHERE parsed_successfully = false
ORDER BY created_at DESC
LIMIT 10;
```
**Solution:**
- Claude may be wrapping JSON in markdown - code already handles this (line 342)
- Check if prompt needs refinement
- Verify Claude API is returning structured output

### Issue 3: Array Fields Not Converting
**Symptom:** Dimensions show "[object Object]" or JSON serialization
**Diagnosis:** Check database field values
```sql
SELECT key_terms, tone_voice_tags
FROM chunk_dimensions
WHERE run_id = 'test-run-id'
LIMIT 5;
```
**Solution:** Verify `arrayToString` helper is implemented correctly

### Issue 4: Conditional Templates Not Running
**Symptom:** Task dimensions missing for Instructional_Unit chunks
**Diagnosis:**
```sql
SELECT chunk_type, COUNT(*)
FROM chunks
WHERE document_id = 'test-doc-id'
GROUP BY chunk_type;
```
**Solution:**
- Verify `applicable_chunk_types` array in template
- Check `getActiveTemplates` filtering logic (chunk-service.ts:164-168)

---

## Appendix B: Reference Materials

### B.1 File Locations
- **Prompt Template Source:** `pmc/product/_prompt_engineering/dimensions-prompts_v1.md` (902 lines)
- **Dimension Metadata:** `src/lib/dimension-metadata.ts` (900 lines)
- **Generator Code:** `src/lib/dimension-generation/generator.ts` (574 lines)
- **Database Service:** `src/lib/chunk-service.ts` (lines 156-212)
- **Test Results:** `pmc/context-ai/pmct/c-alpha-build_v3.4_dimension-testing-v1.md`

### B.2 Database Tables
- `prompt_templates` - Template storage
- `chunks` - Chunk records
- `chunk_dimensions` - Dimension storage
- `chunk_runs` - Run tracking
- `api_response_logs` - API debugging

### B.3 Key Type Definitions
From `src/types/chunks.ts`:
- `ChunkType` - 4 types: Chapter_Sequential, Instructional_Unit, CER, Example_Scenario
- `ChunkDimensions` - 60+ dimension fields
- `PromptTemplate` - Template structure

---

## Summary

**Primary Issue:** Missing prompt templates in database
**Secondary Issue:** Array-to-string conversion needed
**Fix Complexity:** Medium (database seeding + minor code update)
**Risk Level:** Low (additive changes, no breaking modifications)
**Expected Outcome:** 78.3% → 96.7% dimension completion

**Next Steps:**
1. Review and approve this specification
2. Execute database seeding script
3. Apply code fixes to generator.ts
4. Run integration tests
5. Validate dimension completion rate
6. Document results and close gap analysis

---

**Document Version:** 1.0
**Last Updated:** 2025-01-10
**Status:** Ready for Implementation
**Approval Required:** Product Owner / Tech Lead
