# Dimension Gap Fix - Build Directive
**Version:** 1.0
**Date:** 2025-01-10
**Purpose:** Step-by-step implementation directive to fix 13 missing AI-generated dimensions
**Estimated Time:** 3-4 hours
**Related Analysis:** `c-alpha-build_v3.4_dimension-gap-spec_v1.md`

---

## Quick Summary

**Problem:** 13 out of 60 dimensions missing (21.7% gap)
**Root Cause:** Empty `prompt_templates` table in database
**Solution:** Seed database with 6 prompt templates + minor code fix
**Expected Outcome:** 78.3% → 96.7% dimension completion

**What You'll Do:**
1. Run SQL script in Supabase (HUMAN ACTION)
2. Update TypeScript code via Cursor AI (AI PROMPT)
3. Test and verify fixes (HUMAN ACTION + AI PROMPT)

---

## STEP 1: Seed Database with Prompt Templates

### Overview
The `prompt_templates` table is empty or incomplete. We need to insert 6 production-ready templates that the dimension generator will use to call Claude API.

**What templates do:**
- Template 1: Content Analysis (generates 7 content dimensions)
- Template 2: Task Extraction (generates 6 task dimensions for Instructional_Unit chunks)
- Template 3: CER Analysis (generates 5 claim-evidence-reasoning dimensions for CER chunks)
- Template 4: Scenario Extraction (generates 5 scenario dimensions for Example_Scenario chunks)
- Template 5: Training Pair Generation (generates 3 training dimensions)
- Template 6: Risk Assessment (generates 6 risk/compliance dimensions)

### Instructions


=========================
**HUMAN ACTION REQUIRED**
**Task:** Execute SQL Script in Supabase
**Estimated Time:** 5 minutes
=========================

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Click on **SQL Editor** in left sidebar
4. Click **New Query**
5. Copy the ENTIRE SQL script below
6. Paste into SQL Editor
7. Click **Run** or press Ctrl+Enter
8. Verify you see: "6 rows returned" at the bottom

**SQL Script to Copy:**

```sql
-- Seed Prompt Templates for Dimension Generation
-- Version: 1.0
-- Date: 2025-01-10

-- Verify table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'prompt_templates') THEN
    RAISE EXCEPTION 'Table prompt_templates does not exist!';
  END IF;
END $$;

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
```

**Expected Output:**
You should see a table with 6 rows showing:
- cer_analysis
- content_analysis
- risk_assessment
- scenario_extraction
- task_extraction
- training_pair_generation

All should have `is_active = true` and `prompt_length` between 1000-2000 characters.

**If you see an error:** Check that the `prompt_templates` table exists in your database.

+++++++++++++++++++++++++++
**END OF HUMAN ACTION**
+++++++++++++++++++++++++++

---

## STEP 2: Fix Array-to-String Conversion in Code

### Overview
The AI responses return arrays (e.g., `["term1", "term2"]`) but the database expects delimited strings (e.g., `"term1|term2"`). We need to add a helper function to convert arrays to strings.

### Instructions


=========================
**AI PROMPT FOR CURSOR**
**Task:** Update mapResponseToDimensions method
**File:** src/lib/dimension-generation/generator.ts
**Estimated Time:** 2 minutes
=========================

Copy and paste this into Cursor AI chat:

```
Update the mapResponseToDimensions method in src/lib/dimension-generation/generator.ts (around line 389-440) to add array-to-string conversion.

Add this helper function at the beginning of the mapResponseToDimensions method:

```typescript
const arrayToString = (value: any, delimiter: string = ', '): string | undefined => {
  if (value === null || value === undefined) return undefined;
  if (Array.isArray(value)) return value.join(delimiter);
  return value;
};
```

Then update all array fields in the mapping object to use this helper:

For 'content_analysis':
- key_terms: use arrayToString(response.key_terms, '|')
- tone_voice_tags: use arrayToString(response.tone_voice_tags)
- brand_persona_tags: use arrayToString(response.brand_persona_tags)
- domain_tags: use arrayToString(response.domain_tags)

For 'cer_analysis':
- evidence_snippets: use arrayToString(response.evidence_snippets, '|')
- citations: use arrayToString(response.citations)

For 'risk_assessment':
- safety_tags: use arrayToString(response.safety_tags)
- compliance_flags: use arrayToString(response.compliance_flags)

Keep steps_json as-is (it should remain as JSON, not converted to string).

After making the changes, run: npm run build

Show me the complete updated mapResponseToDimensions method.
```

+++++++++++++++++++++++++++
**END OF AI PROMPT**
+++++++++++++++++++++++++++

---

## STEP 3: Verify Database Templates

### Instructions


=========================
**HUMAN ACTION REQUIRED**
**Task:** Verify templates are active in database
**Estimated Time:** 1 minute
=========================

1. Open Supabase SQL Editor
2. Run this query:

```sql
SELECT COUNT(*) as active_templates
FROM prompt_templates
WHERE is_active = true;
```

**Expected Result:** `active_templates = 6`

If you see fewer than 6, re-run the seeding script from Step 1.

+++++++++++++++++++++++++++
**END OF HUMAN ACTION**
+++++++++++++++++++++++++++

---

## STEP 4: Test TypeScript Compilation

### Instructions


=========================
**HUMAN ACTION REQUIRED**
**Task:** Build TypeScript to verify no errors
**Estimated Time:** 1 minute
=========================

1. Open terminal in project root
2. Run:

```bash
npm run build
```

**Expected Result:** Build completes with no errors

If you see TypeScript errors, review the changes from Step 2.

+++++++++++++++++++++++++++
**END OF HUMAN ACTION**
+++++++++++++++++++++++++++

---

## STEP 5: Test Dimension Generation (Optional but Recommended)

### Overview
This step verifies that the fixes work end-to-end by regenerating dimensions for your test document.

### Instructions


=========================
**AI PROMPT FOR CURSOR**
**Task:** Create test script to regenerate dimensions
**Estimated Time:** 3 minutes
=========================

Copy and paste this into Cursor AI chat:

```
Create a simple Node.js test script to regenerate dimensions for a document.

Create file: test-dimension-generation.ts

The script should:
1. Import DimensionGenerator from src/lib/dimension-generation/generator
2. Get a document ID from command line args (process.argv[2])
3. Call generateDimensionsForDocument with that document ID
4. Print the run_id when complete
5. Print any errors

Example usage: npx tsx test-dimension-generation.ts <document-id>

Make sure to handle the async/await properly and exit with appropriate codes.
```

+++++++++++++++++++++++++++
**END OF AI PROMPT**
+++++++++++++++++++++++++++



=========================
**HUMAN ACTION REQUIRED**
**Task:** Run dimension generation test
**Estimated Time:** 3-5 minutes (depending on document size)
=========================

1. Find a test document ID from your Supabase dashboard:
   - Go to Supabase → Table Editor → documents table
   - Copy an `id` value

2. Run the test script:

```bash
npx tsx test-dimension-generation.ts <paste-document-id-here>
```

**Expected Output:**
```
Generating dimensions for document: <doc-id>
Run ID: <run-id>
Generation complete!
```

If you see errors, check the Supabase logs and API response logs table.

+++++++++++++++++++++++++++
**END OF HUMAN ACTION**
+++++++++++++++++++++++++++

---

## STEP 6: Verify Dimension Population

### Instructions


=========================
**HUMAN ACTION REQUIRED**
**Task:** Check dimension completion rate
**Estimated Time:** 2 minutes
=========================

1. Open Supabase SQL Editor
2. Run this query (replace `<run-id>` with the run ID from Step 5):

```sql
SELECT
  COUNT(*) as total_chunks,
  COUNT(chunk_summary_1s) as summary_populated,
  COUNT(key_terms) as key_terms_populated,
  COUNT(audience) as audience_populated,
  COUNT(intent) as intent_populated,
  COUNT(tone_voice_tags) as tone_populated,
  COUNT(brand_persona_tags) as brand_populated,
  COUNT(domain_tags) as domain_populated,
  COUNT(task_name) as task_populated,
  COUNT(prompt_candidate) as training_pair_populated,
  COUNT(safety_tags) as risk_populated
FROM chunk_dimensions
WHERE run_id = '<run-id>';
```

**Expected Result:** Most counts should equal total_chunks (except conditional fields like task_name which only apply to Instructional_Unit chunks)

**Good result:**
- summary_populated = total_chunks ✅
- key_terms_populated = total_chunks ✅
- tone_populated = total_chunks ✅
- task_populated = number of Instructional_Unit chunks ✅

+++++++++++++++++++++++++++
**END OF HUMAN ACTION**
+++++++++++++++++++++++++++

---

## STEP 7: Export and Analyze Results

### Instructions


=========================
**AI PROMPT FOR CURSOR**
**Task:** Create CSV export script
**Estimated Time:** 2 minutes
=========================

Copy and paste this into Cursor AI chat:

```
Create a script to export chunk dimensions to CSV.

Create file: export-dimensions.ts

The script should:
1. Accept a run_id as command line argument
2. Query chunk_dimensions table for that run_id
3. Join with chunks table to get chunk_text preview
4. Export all 60 dimensions to CSV file
5. Save as: dimensions-export-<run-id>-<timestamp>.csv

Include all dimension fields from the ChunkDimensions type.

Example usage: npx tsx export-dimensions.ts <run-id>
```

+++++++++++++++++++++++++++
**END OF AI PROMPT**
+++++++++++++++++++++++++++



=========================
**HUMAN ACTION REQUIRED**
**Task:** Export and review dimensions CSV
**Estimated Time:** 3 minutes
=========================

1. Run the export script:

```bash
npx tsx export-dimensions.ts <run-id-from-step-5>
```

2. Open the generated CSV file in Excel or Google Sheets

3. Verify that the following columns are populated (not all NULL):
   - chunk_summary_1s ✅
   - key_terms ✅
   - audience ✅
   - intent ✅
   - tone_voice_tags ✅
   - brand_persona_tags ✅
   - domain_tags ✅

4. Check that arrays are converted to strings:
   - key_terms should show: "term1|term2|term3" (not JSON array)
   - tone_voice_tags should show: "authoritative, conversational" (not JSON array)

+++++++++++++++++++++++++++
**END OF HUMAN ACTION**
+++++++++++++++++++++++++++

---

## STEP 8: Calculate Completion Rate

### Instructions


=========================
**HUMAN ACTION REQUIRED**
**Task:** Calculate final dimension completion percentage
**Estimated Time:** 2 minutes
=========================

1. Open the CSV from Step 7 in a spreadsheet
2. Count total columns (should be ~60)
3. For each row (chunk), count non-empty columns
4. Calculate average completion rate

**OR** run this SQL query:

```sql
WITH dimension_counts AS (
  SELECT
    chunk_id,
    60 as total_dimensions,
    -- Count non-null dimension fields
    CASE WHEN chunk_summary_1s IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN key_terms IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN audience IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN intent IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN tone_voice_tags IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN brand_persona_tags IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN domain_tags IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN task_name IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN prompt_candidate IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN safety_tags IS NOT NULL THEN 1 ELSE 0 END +
    -- Add more fields as needed...
    0 as populated_count
  FROM chunk_dimensions
  WHERE run_id = '<run-id>'
)
SELECT
  AVG(populated_count) as avg_populated,
  AVG(populated_count * 100.0 / total_dimensions) as completion_percentage
FROM dimension_counts;
```

**Expected Result:**
- **Before fix:** ~47/60 dimensions (78.3%)
- **After fix:** ~56-58/60 dimensions (93-97%)

**Note:** 2 dimensions (embedding_id, vector_checksum) are backlog items and won't be populated yet.

+++++++++++++++++++++++++++
**END OF HUMAN ACTION**
+++++++++++++++++++++++++++

---

## Troubleshooting

### Problem: SQL script fails with "Table does not exist"

**Solution:** The `prompt_templates` table hasn't been created yet. Check your database migration status.


### Problem: Dimension generation runs but no new dimensions appear

**Solution:**
1. Check that templates are active: `SELECT COUNT(*) FROM prompt_templates WHERE is_active = true;`
2. Check API response logs: `SELECT * FROM api_response_logs ORDER BY created_at DESC LIMIT 10;`
3. Verify Claude API key is set in environment variables


### Problem: Arrays showing as "[object Object]" in CSV

**Solution:** The array-to-string conversion wasn't applied correctly. Re-run Step 2 and verify the code changes.


### Problem: Task dimensions missing for all chunks

**Solution:** This is expected if your test document has no `Instructional_Unit` chunks. Task extraction only runs for that chunk type.

---

## Success Criteria

You've successfully completed the fix when:

✅ 6 templates exist in database with `is_active = true`
✅ TypeScript builds without errors
✅ Dimension generation completes without errors
✅ Content analysis dimensions (7 fields) are populated for all chunks
✅ Arrays are converted to delimited strings (not JSON)
✅ Dimension completion rate is 93-97% (excluding 2 backlog items)
✅ CSV export shows populated dimensions in readable format

---

## What's Next

After completing this fix:

1. **Test with production documents** - Run dimension generation on real documents
2. **Monitor API costs** - Check `chunk_runs` table for cost tracking
3. **Review dimension quality** - Manually review a sample of generated dimensions
4. **Optimize prompts** - If dimensions are low quality, refine prompt templates
5. **Implement backlog items** - Add embedding generation when needed (see: `c-alpha-build-spec_v3.3_embedding-system_v1.md`)

---

## Summary

**Total Time:** 3-4 hours (including testing)
**Human Actions:** 6 manual steps (database, testing, verification)
**AI Prompts:** 3 Cursor AI prompts (code updates, test scripts, export)
**Risk Level:** LOW (additive changes, easy rollback)
**Expected Impact:** 78.3% → 96.7% dimension completion

**Files Modified:**
- Database: `prompt_templates` table (6 new rows)
- Code: `src/lib/dimension-generation/generator.ts` (array conversion helper)
- Optional: Test scripts (dimension generation, CSV export)

**Rollback:** Simply disable templates with `UPDATE prompt_templates SET is_active = false`

---

**Document Version:** 1.0
**Last Updated:** 2025-01-10
**Status:** Ready for Implementation
