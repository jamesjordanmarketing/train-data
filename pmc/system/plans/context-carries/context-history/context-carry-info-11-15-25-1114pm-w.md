# Context Carryover Document - 11/30/25 Session (Part W)

## For Next Agent: Critical Context and Instructions

**READ THIS ENTIRE DOCUMENT BEFORE STARTING ANY WORK.**

---

## 🚨 CURRENT STATE: What Was Accomplished This Session (11/30/25)

### Session Focus: JSON Schema Specification & Generation Page Spec Preparation

This session focused on creating foundational specifications for the LoRA Training JSON Files feature, and gathering requirements for the generation page specification.

### ✅ Tasks Completed

1. **Created JSON Schema Specification v4** 
   - File: `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\iteration-2-full-production-json-file-schema-spec_v1.md`
   - 938 lines defining Individual JSON, Full Training JSON, and JSONL formats
   - Includes scaffolding metadata integration (persona_archetype, emotional_arc_key, training_topic_key)

2. **Created Example Full Training JSON**
   - File: `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4_emotional-dataset-JSON-example_v4.json`
   - ⚠️ **ISSUE IDENTIFIED**: Only 458 lines with abbreviated 2-turn examples per conversation
   - Should be expanded to include **complete** conversations (6-7 turns each) from production enriched files

3. **Documented Batch UI Bug** (from prior in session)
   - File: `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\iteration-2-json-refresh-possible-issues_v1.md`
   - Root causes identified, fixes documented but **NOT IMPLEMENTED** (deferred)

4. **Gathered Requirements for Generation Page Spec**
   - Original skeleton: `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\iteration-2-full-production-json-files-generation-spec_v.01.txt`
   - Q&A session completed with user to clarify all ambiguous requirements

---

## 🎯 NEXT AGENT PRIMARY TASK

### Write Comprehensive Generation Page Specification

**Objective**: Transform the skeleton spec into a full, Execution Plan for the "LoRA Training JSON Files" page feature.

**Input File** (skeleton to upgrade):
```
C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\iteration-2-full-production-json-files-generation-spec_v.02.md
```

**Output File** (write upgraded spec here):
```
C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\iteration-2-full-production-json-files-generation-execution_v1.md
```

### User-Confirmed Requirements

The following requirements were confirmed by the user in Q&A:

#### 1. Batch ID Column Location
- **Decision**: Agent to architect optimal location (could be join table, direct column, or new table)
- **Constraint**: Must be resilient and fault-tolerant
- **Current State**: `batch_items` table has `batch_job_id` and `conversation_id` - conversations linked through join table

#### 2. Training Files Table
- **Decision**: YES - create new `training_files` table
- **Include**: Full database migration specs in the specification

#### 3. Storage Location
- **Decision**: Agent to architect optimal storage strategy
- **Current Buckets**: `conversation-files`, `batch-logs`, `documents`, etc.
- **Enriched files stored at**: `<user_id>/<conversation_id>/enriched.json` in `conversation-files` bucket

#### 4. Create Training Files Button
- **Decision**: Dropdown includes BOTH existing files AND "Create New Training File" option
- **New file creation**: Must include name input

#### 5. Conversation Selection Requirements
- **REQUIRED for selection**:
  - `enrichment_status = 'completed'`
  - `enriched_file_path IS NOT NULL`
- **NOT required**: quality_score threshold
- **Behavior**: Block non-qualified files BEFORE job submission (don't silently omit)

#### 6. Duplicate Prevention
- **Decision**: Block operation with error message (Option C)
- **Don't**: Skip silently or allow re-adding

#### 7. JSONL Generation Timing
- **Decision**: Agent to architect optimal timing
- **Constraint**: Must always generate alongside JSON

#### 8. Service Architecture
- **Decision**: Agent to architect optimal service structure
- **Existing**: `ExportService` at `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-service.ts`
- **Options**: Extend ExportService, new TrainingFileService, or hybrid

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
7. **Export**: Training data export for LoRA fine-tuning ← **THIS IS THE NEXT FEATURE**

### Current Database Schema (Verified)

**conversations table** (key columns):
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `conversation_id` | uuid | Unique conversation identifier |
| `file_path` | text | Path to parsed JSON |
| `enriched_file_path` | text | Path to enriched JSON |
| `enrichment_status` | text | `not_started`, `enrichment_in_progress`, `completed` |
| `persona_id` | uuid | FK to personas table |
| `emotional_arc_id` | uuid | FK to emotional_arcs table |
| `training_topic_id` | uuid | FK to training_topics table |

**batch_jobs table** (key columns):
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `status` | text | `queued`, `processing`, `completed`, `failed`, `cancelled` |
| `total_items` | integer | Total conversations to generate |
| `tier` | text | `template`, `scenario`, `edge_case` |

**batch_items table** (linking table):
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `batch_job_id` | uuid | FK to batch_jobs |
| `conversation_id` | uuid | FK to conversations (nullable until completed) |
| `status` | text | Item status |

**training_files table** - **DOES NOT EXIST** - Must be created

### Current Storage Buckets (Verified)
- `conversation-files` - Main bucket for conversation JSON files
- `batch-logs` - Batch processing logs
- `documents` - General documents

### Key Service Files

| File | Purpose |
|------|---------|
| `src/lib/services/conversation-storage-service.ts` | File + metadata storage for conversations |
| `src/lib/services/batch-job-service.ts` | Batch job orchestration |
| `src/lib/export-service.ts` | Export logging and format handling |
| `src/lib/services/conversation-enrichment-service.ts` | Builds enriched JSON |

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

# Check existing storage buckets
node -e "require('./load-env.js'); const { createClient } = require('@supabase/supabase-js'); const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); (async () => { const { data } = await supabase.storage.listBuckets(); console.log('Buckets:', data.map(b => b.name)); })();"
```

**⚠️ WARNING for Introspection**: `agentIntrospectSchema` requires `transport: 'pg'` and `DATABASE_URL`. Use "Probe Queries" with `agentQuery` instead.

---

## 📁 Important Reference Files

### Specifications to Read

| File | Purpose | Status |
|------|---------|--------|
| `pmc/context-ai/pmct/iteration-2-full-production-json-files-generation-spec_v.01.txt` | Skeleton spec (INPUT) | Needs upgrade |
| `pmc/context-ai/pmct/iteration-2-full-production-json-file-schema-spec_v1.md` | JSON schema spec v4 | ✅ Complete |
| `pmc/context-ai/pmct/iteration-2-json-refresh-possible-issues_v1.md` | Batch UI bug docs | ✅ Documented (not fixed) |

### Sample Enriched JSON Files (Full Conversations)

| File | Persona | Arc | Turns |
|------|---------|-----|-------|
| `pmc/_archive/david-chen-confusion-clarity-mortgage-enriched-scaffolds.json` | David Chen | Confusion → Clarity | 7 |
| `pmc/_archive/jennifer-confusion-clarity-mortgage-enriched-scaffolds.json` | Jennifer | Confusion → Clarity | 6 |
| `pmc/_archive/jennifer-overwhelm-to-empowerment-estate-plannin-scaffolds.json` | Jennifer | Overwhelm → Empowerment | - |
| `pmc/_archive/marcus-chen-overwhelm-to-empowerment-estate-plannin-scaffolds.json` | Marcus Chen | Overwhelm → Empowerment | - |

### Service Files to Review

| File | Purpose |
|------|---------|
| `src/lib/export-service.ts` | Existing export service (506 lines) |
| `src/lib/services/conversation-storage-service.ts` | Storage service (1493 lines) |
| `src/lib/services/batch-job-service.ts` | Batch job service (606 lines) |
| `src/app/(dashboard)/conversations/page.tsx` | Conversations page (192 lines) |

---

## 🔧 Current Enriched JSON Structure

From production enriched files:

```json
{
  "dataset_metadata": {
    "dataset_name": "fp_conversation_<uuid>",
    "version": "1.0.0",
    "created_date": "2025-11-30",
    "vertical": "financial_planning_consultant",
    "total_conversations": 1,
    "total_turns": 7
  },
  "consultant_profile": { /* Static consultant persona */ },
  "training_pairs": [
    {
      "id": "educational_turn1",
      "conversation_id": "educational",
      "turn_number": 1,
      "conversation_metadata": {
        "client_persona": "David Chen - The Pragmatic Optimist",
        "persona_archetype": "pragmatic_optimist",
        "client_background": "...",
        "emotional_arc": "Confusion → Clarity",
        "emotional_arc_key": "confusion_to_clarity",
        "training_topic": "Accelerated Mortgage Payoff",
        "training_topic_key": "mortgage_payoff_strategy"
      },
      "system_prompt": "...",
      "conversation_history": [],
      "current_user_input": "...",
      "emotional_context": { /* Emotion detection */ },
      "target_response": "..." | null,
      "training_metadata": { /* Quality scores */ }
    }
  ]
}
```

---

## 📋 Specification Writing Guidelines

When writing `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\iteration-2-full-production-json-files-generation-execution_v1.md`, use the following format:`C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E05.md`


### Use Full File Paths

Always reference files with complete paths:
```
C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\...
```

### Include Code Examples

Show actual code patterns from the codebase when specifying how to implement.

---

## ⚠️ Known Issues (Do NOT Fix in Next Session)

1. **Batch UI Bug** - Documented in `iteration-2-json-refresh-possible-issues_v1.md` - DEFERRED
2. **Example JSON File** - `c-alpha-build_v3.4_emotional-dataset-JSON-example_v4.json` has abbreviated examples - DEFERRED

---

## 📋 Summary for Next Agent

### Your Primary Task

**Write a comprehensive, executable specification** for the LoRA Training JSON Files feature.

**Read these files first**:
1. `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\iteration-2-full-production-json-files-generation-spec_v.02.md` (skeleton)
2. `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\iteration-2-full-production-json-file-schema-spec_v1.md` (JSON format spec)
3. `src/lib/export-service.ts` (existing export handling)
4. `src/lib/services/batch-job-service.ts` (batch job patterns)

**Output location**:
```
C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\iteration-2-full-production-json-files-generation-execution_v1.md
```

### Architectural Decisions You Must Make

1. **Batch ID storage** - Where should it live for optimal queries?
2. **Training files storage** - New bucket or path within existing?
3. **JSONL generation timing** - On add, on download, or both?
4. **Service architecture** - Extend ExportService, new service, or hybrid?

### Key Constraints

- Must handle up to 80 conversations at once
- Must block (not skip) ineligible conversations
- Must block duplicate conversation additions
- Must generate JSONL alongside JSON
- Must validate `enrichment_status = 'completed'` AND `enriched_file_path IS NOT NULL`

---

## Quick Start Commands

```bash
# Navigate to project
cd "C:\Users\james\Master\BrightHub\BRun\train-data"

# Check enriched conversations count
node -e "require('./load-env.js'); const { createClient } = require('@supabase/supabase-js'); const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); (async () => { const { count } = await supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('enrichment_status', 'completed').not('enriched_file_path', 'is', null); console.log('Enriched conversations ready for export:', count); })();"

# Start dev server
cd src && npm run dev
```

---

*Document created: 11/30/25 - JSON schema v4 complete, generation spec requirements gathered*
*Previous carryover: context-carry-info-11-15-25-1114pm-v.md*
*Skeleton spec: pmc/context-ai/pmct/iteration-2-full-production-json-files-generation-spec_v.01.txt*
