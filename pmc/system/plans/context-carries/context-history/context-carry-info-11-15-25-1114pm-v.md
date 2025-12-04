# Context Carryover Document - 11/30/25 Session (Part V)

## For Next Agent: Critical Context and Instructions

**READ THIS ENTIRE DOCUMENT BEFORE STARTING ANY WORK.**

---

## 🚨 CURRENT STATE: What Was Accomplished This Session (11/30/25)

### Session Focus: Batch Job UI Bug Investigation - DOCUMENTED ✅

This session investigated a bug where the batch job status page (`/batch-jobs/[id]`) does not correctly update when all items finish processing.

### ✅ Bug Investigation Complete - Issue Documented

**Bug Specification Created**: `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\iteration-2-json-refresh-possible-issues_v1.md`

**Summary of Bug**: 
- UI shows real-time progress for items 1 through N-1 correctly (shows "1 of 3", "2 of 3")
- When processing hits the **last item**, the UI reverts to showing 0 completions with spinning progress
- Page **never auto-refreshes** when batch completes - requires manual page refresh
- After manual refresh, correct status (completed) and "Enrich" button are shown correctly

**Root Cause Identified** (3 interconnected issues):

1. **API Returns Wrong Status for Last Item**: When the last item is processed, API returns `{ status: 'processed', remainingItems: 0 }` instead of `{ status: 'job_completed' }`. The `job_completed` status is only returned when called with zero queued items at the START.

2. **Client Doesn't Handle `remainingItems: 0` Correctly**: The client status mapping only looks at `data.status` values, not `remainingItems`. When it sees `status: 'processed'`, it stays in `processing` state.

3. **Race Condition with Final Status Fetch**: The `fetchStatus()` call at the end of the processing loop fires before the database has finished updating.

**Fixes Documented** (NOT IMPLEMENTED - deferred):
- Fix 1 (API): Return `job_completed` when `remainingItems === 0` after successful processing
- Fix 2 (Client): Treat `status: 'processed' && remainingItems === 0` as `completed`
- Fix 3 (Fallback): Add delay before final `fetchStatus()` call

**Files Involved**:
- `C:\Users\james\Master\BrightHub\BRun\train-data\src\app\(dashboard)\batch-jobs\[id]\page.tsx` - Frontend batch job detail page
- `C:\Users\james\Master\BrightHub\BRun\train-data\src\app\api\batch-jobs\[id]\process-next\route.ts` - Backend processing endpoint

⚠️ **NOTE**: Fixes are NOT implemented yet. User wants to run more batches to verify pattern holds before implementing fixes.

---

## 🎯 NEXT AGENT PRIMARY TASK

### Upgrade JSON Schema Specification

**Objective**: Create a robust, production-ready JSON schema specification for LoRA training files.

**Input Documents to Read**:
1. `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\iteration-2-full-production-json-file-schema-spec_v.01.txt` - Current draft schema spec (needs upgrade)
2. `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\iteration-2-full-production-json-files-generation-spec_v.01.txt` - Generation spec (defines new page functionality)

**Reference Documents** (existing format examples):
3. `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4_emotional-dataset-JSON-format_v3.json` - Current v3 schema
4. `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\_archive\david-chen-confusion-clarity-mortgage-enriched-scaffolds.json` - Example enriched JSON
5. `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\_archive\jennifer-confusion-clarity-mortgage-enriched-scaffolds.json` - Another example

**Output File**: 
`C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4_emotional-dataset-JSON-format_v4.json`

### What the Next Agent Must Do

1. **Read and Understand Current State**:
   - Read the two input spec documents listed above
   - Read sample enriched JSON files in `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\_archive\` to understand actual data structure
   - Query the database to understand current schema state

2. **Investigate Relevant Codebase**:
   - `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\conversation-enrichment-service.ts` - How enriched JSON is built
   - `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\enrichment-pipeline-orchestrator.ts` - Pipeline orchestration
   - `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\conversation-storage-service.ts` - How JSON is stored

3. **Create Upgraded Schema Specification**:
   - Write compliant markdown documentation
   - Include JSON Schema definitions
   - Document all required and optional fields
   - Include examples from actual production data
   - Write the updated spec to: `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\iteration-2-full-production-json-file-schema-spec_v1.md`
   - Then stop working and wait for instructions from the human operator.

4. **Schema Files to Create**:
   - `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4_emotional-dataset-individual-JSON-format_v4.json` - Individual conversation schema
   - `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4_emotional-dataset-full-JSON-format_v4.json` - Full training file schema (multiple conversations)
   - `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4_emotional-dataset-full-JSON-format_v4.jsonl` - JSONL format schema
   - `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4_emotional-dataset-JSON-example_v4.json` - Example full file with multiple conversations

### Key Context from Generation Spec

The generation spec (`C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\iteration-2-full-production-json-files-generation-spec_v.01.txt`) defines:

1. **New Page**: "LoRA Training JSON Files" page (starts empty)
2. **Conversations Page Enhancement**: 
   - New "Batch ID" column for sorting/filtering
   - "Create Training Files" button
   - Dropdown to select target full JSON file
3. **File Processing**:
   - Selected conversations get added to production full JSON file
   - JSONL file generated alongside JSON file automatically
   - Support for bulk processing (up to 80 files at a time)
4. **Download**: 
   - Can download either JSON or JSONL from the new page

---

## 📋 Project Context

### System Overview

This is a **LoRA training data generation pipeline** for financial advisor conversation simulations:

1. **Scaffolding**: Personas, Emotional Arcs, Training Topics stored in Supabase
2. **Templates**: Prompt templates with `{{placeholder}}` syntax
3. **Batch Jobs**: Process multiple conversations via polling (Vercel serverless limit workaround)
4. **Generation**: Claude API generates structured conversation JSON
5. **Storage**: Supabase Storage for JSON files, PostgreSQL for metadata
6. **Enrichment**: Transform raw JSON into training pairs with metadata
7. **Export**: Training data export for LoRA fine-tuning

### Current Database Schema (Verified)

**conversations table** (relevant columns):
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `file_path` | text | Path to parsed JSON (HAS `input_parameters`) ✅ |
| `enriched_file_path` | text | Path to enriched JSON |
| `enrichment_status` | text | `not_started`, `enrichment_in_progress`, `completed` |
| `persona_id` | uuid | FK to personas table |
| `emotional_arc_id` | uuid | FK to emotional_arcs table |
| `training_topic_id` | uuid | FK to training_topics table |

**batch_jobs table** (relevant columns):
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `status` | text | `queued`, `processing`, `paused`, `completed`, `failed`, `cancelled` |
| `total_items` | integer | Total conversations to generate |
| `completed_items` | integer | Number completed |
| `successful_items` | integer | Number successful |
| `failed_items` | integer | Number failed |
| `tier` | text | `template`, `scenario`, `edge_case` |

### Current Enriched JSON Structure (Verified from Production)

```json
{
  "dataset_metadata": {
    "dataset_name": "fp_conversation_<uuid>",
    "version": "1.0.0",
    "created_date": "2025-11-30",
    "vertical": "financial_planning_consultant",
    "consultant_persona": "Elena Morales, CFP - Pathways Financial Planning",
    "target_use": "LoRA fine-tuning for emotionally intelligent chatbot",
    "conversation_source": "synthetic_platform_generated",
    "quality_tier": "experimental",
    "total_conversations": 1,
    "total_turns": 7,
    "notes": "Generated via template: Template - ..."
  },
  "consultant_profile": {
    "name": "Elena Morales, CFP",
    "business": "Pathways Financial Planning",
    "expertise": "...",
    "years_experience": 15,
    "core_philosophy": { "principle_1": "...", ... "principle_5": "..." },
    "communication_style": {
      "tone": "warm, professional, never condescending",
      "techniques": ["array of techniques"],
      "avoid": ["array of things to avoid"]
    }
  },
  "training_pairs": [
    {
      "id": "educational_turn1",
      "conversation_id": "educational",
      "turn_number": 1,
      "conversation_metadata": {
        "client_persona": "David Chen - The Pragmatic Optimist",
        "client_background": "Age 35, male, Urban/Suburban, ...",
        "session_context": "...",
        "conversation_phase": "initial_opportunity_exploration",
        "expected_outcome": "...",
        "persona_archetype": "pragmatic_optimist",
        "emotional_arc": "Confusion → Clarity",
        "emotional_arc_key": "confusion_to_clarity",
        "training_topic": "Accelerated Mortgage Payoff",
        "training_topic_key": "mortgage_payoff_strategy"
      },
      "system_prompt": "You are an emotionally intelligent financial planning chatbot...",
      "conversation_history": [],
      "current_user_input": "...",
      "emotional_context": {
        "detected_emotions": {
          "primary": "confusion",
          "primary_confidence": 0.8,
          "secondary": "frustration",
          "secondary_confidence": 0.7,
          "intensity": 0.72,
          "valence": "mixed"
        }
      },
      "target_response": null,
      "training_metadata": {
        "difficulty_level": "intermediate_conversation_turn_1",
        "key_learning_objective": "...",
        "demonstrates_skills": ["overwhelmed_avoider", "anxious_planner", "pragmatic_optimist"],
        "conversation_turn": 1,
        "emotional_progression_target": "confusion(0.8) → clarity(0.8)",
        "quality_score": 3,
        "quality_criteria": {
          "empathy_score": 2.8,
          "clarity_score": 2.8,
          "appropriateness_score": 2.8,
          "brand_voice_alignment": 3
        },
        "human_reviewed": false,
        "reviewer_notes": null,
        "use_as_seed_example": false,
        "generate_variations_count": 0
      }
    }
  ]
}
```

### Key Scaffolding Fields (Added in Recent Bug Fixes)

All training pairs now include these scaffolding metadata fields:
- `persona_archetype`: e.g., "overwhelmed_avoider", "anxious_planner", "pragmatic_optimist"
- `emotional_arc`: e.g., "Shame → Acceptance", "Confusion → Clarity"
- `emotional_arc_key`: e.g., "shame_to_acceptance", "confusion_to_clarity"
- `training_topic`: e.g., "Accelerated Mortgage Payoff"
- `training_topic_key`: e.g., "mortgage_payoff_strategy"

---

## 🔍 Supabase Agent Ops Library (SAOL) Quick Reference

**CRITICAL: You MUST use the Supabase Agent Ops Library (SAOL) for ALL database operations.**

**Library Path**: `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`
**Quick Start**: `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\QUICK_START.md`

### ✅ CORRECT SAOL Usage Pattern

```javascript
// ✅ CORRECT IMPORT (in scripts/ folder)
require('../load-env.js'); 
const saol = require('../supa-agent-ops/dist/index.js');

// ✅ Query data
const result = await saol.agentQuery({
  table: 'conversations',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  select: ['id', 'file_path', 'enriched_file_path'],
  limit: 5,
  transport: 'supabase'  // CRITICAL: Use 'supabase' transport
});
```

### Quick Database Query Commands

```bash
# Query conversations with enriched files
node -e "require('./load-env.js'); const { createClient } = require('@supabase/supabase-js'); const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); (async () => { const { data } = await supabase.from('conversations').select('id, file_path, enriched_file_path, enrichment_status').not('enriched_file_path', 'is', null).limit(5); console.log(JSON.stringify(data, null, 2)); })();"

# Query batch_jobs
node -e "require('./load-env.js'); const saol = require('./supa-agent-ops/dist/index.js'); (async () => { const r = await saol.agentQuery({ table: 'batch_jobs', supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY, limit: 3, transport: 'supabase' }); console.log(JSON.stringify(r, null, 2)); })();"
```

**⚠️ WARNING for Introspection**: `agentIntrospectSchema` requires `transport: 'pg'` and `DATABASE_URL`. Use "Probe Queries" with `agentQuery` instead.

---

## 📁 Important Files Reference

### Schema/Spec Files

| File | Purpose |
|------|---------|
| `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\iteration-2-full-production-json-file-schema-spec_v.01.txt` | Draft schema spec (needs upgrade) |
| `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\iteration-2-full-production-json-files-generation-spec_v.01.txt` | Generation page spec |
| `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4_emotional-dataset-JSON-format_v3.json` | Current v3 schema |
| `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\iteration-2-json-refresh-possible-issues_v1.md` | Batch UI bug documentation |

### Sample Enriched JSON Files

| File | Persona | Arc |
|------|---------|-----|
| `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\_archive\david-chen-confusion-clarity-mortgage-enriched-scaffolds.json` | David Chen (Pragmatic Optimist) | Confusion → Clarity |
| `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\_archive\jennifer-confusion-clarity-mortgage-enriched-scaffolds.json` | Jennifer (Anxious Planner) | Confusion → Clarity |
| `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\_archive\jennifer-overwhelm-to-empowerment-estate-plannin-scaffolds.json` | Jennifer | Overwhelm → Empowerment |
| `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\_archive\marcus-chen-overwhelm-to-empowerment-estate-plannin-scaffolds.json` | Marcus Chen (Overwhelmed Avoider) | Overwhelm → Empowerment |

### Service Files (Code to Review)

| File | Purpose |
|------|---------|
| `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\conversation-enrichment-service.ts` | Builds enriched JSON structure |
| `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\enrichment-pipeline-orchestrator.ts` | Orchestrates enrichment pipeline |
| `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\conversation-storage-service.ts` | Stores JSON to Supabase |

---

## 🔄 Previous Session Accomplishments (Reference Only)

The enrichment pipeline bug fixes from the previous session are **COMPLETE and VERIFIED**:

✅ **Bug #1**: Fixed - Enrichment pipeline now reads from `file_path` (has `input_parameters`)
✅ **Bug #2**: Auto-fixed - Scaffolding metadata now included in training pairs  
✅ **Bug #3**: Fixed - Demographics properly serialized (no more `[object Object]`)

---

## 📋 Summary for Next Agent

### Your Primary Task

**Upgrade the JSON schema specification** by:

1. Reading the draft spec: `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\iteration-2-full-production-json-file-schema-spec_v.01.txt`
2. Reading the generation spec: `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\iteration-2-full-production-json-files-generation-spec_v.01.txt`
3. Investigating actual codebase and database state
4. Creating upgraded schema file: `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4_emotional-dataset-JSON-format_v4.json`

### What NOT to Do

- ❌ Do NOT implement the batch UI bug fixes (documented but deferred)
- ❌ Do NOT modify the enrichment pipeline code
- ❌ Do NOT implement the new "LoRA Training JSON Files" page yet

### Expected Output

A production-ready JSON schema specification that:
1. Reflects actual current data structure from enriched JSON files
2. Is compliant markdown with proper JSON Schema definitions
3. Defines both individual conversation and full training file formats
4. Includes JSONL format specification
5. Contains example files demonstrating the schema

---

## Quick Start Commands

```bash
# Navigate to project
cd "C:\Users\james\Master\BrightHub\BRun\train-data"

# Query enriched conversations
node -e "require('./load-env.js'); const { createClient } = require('@supabase/supabase-js'); const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); (async () => { const { data } = await supabase.from('conversations').select('id, file_path, enriched_file_path').not('enriched_file_path', 'is', null).limit(3); console.log(JSON.stringify(data, null, 2)); })();"

# Start dev server
cd src && npm run dev
```

---

*Document created: 11/30/25 - Batch UI bug investigated and documented, JSON schema upgrade task prepared*
*Previous carryover: context-carry-info-11-15-25-1114pm.md*
*Bug documentation: pmc/context-ai/pmct/iteration-2-json-refresh-possible-issues_v1.md*
