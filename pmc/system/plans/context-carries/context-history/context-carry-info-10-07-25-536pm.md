# Development Context & Operational Priorities
**Date:** 2025-10-07 17:36 PST
**Project:** Bright Run LoRA Training Data Platform (bmo) & Project Memory Core (PMC)
**Context Version:** 3.1.0

## Introduction

This context document addresses two integrated projects that operate in tandem:

1. **Bright Run LoRA Training Data Platform**: Bright Run is a revolutionary LoRA fine-tuning training data platform that transforms unstructured business knowledge into high-quality training datasets through an intuitive 6-stage workflow. We are creating the first user-friendly solution that enables non-technical domain experts to convert their proprietary knowledge—transcripts, documents, and expertise—into thousands of semantically diverse training pairs suitable for LoRA model fine-tuning.

### What Problem Does This Product Solve?

Small business owners and domain experts possess invaluable proprietary knowledge—from marketing philosophies to operational processes—but face insurmountable barriers in transforming this knowledge into LoRA ready training data.

2. **Project Memory Core (PMC)**: A structured task management and context retention system that manages the development of the Aplio project. PMC provides methodical task tracking, context preservation, and implementation guidance through its command-line interface and document-based workflow.

These projects are deliberately interconnected - PMC requires a real-world development project to refine its capabilities, while Aplio benefits from PMC's structured approach to development. Depending on current priorities, work may focus on either advancing the Aplio Design System implementation or enhancing the PMC tooling itself.

## Current Focus

### Active Development Focus

**TASK: Implementing Phase 1 & 2 Quick Wins - Fixing Missing Dimensions**

**Implementation Spec:** `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_quick-wins-addon_v1.md`

**What We're Doing:**
We are executing a targeted implementation to fix 9 missing chunk dimensions through quick code changes (Phase 1) and database template seeding (Phase 2). This work follows the comprehensive modular specification breakdown created in the previous session.

**Why We're Doing This:**
The Dimension Validation Spreadsheet UI (deployed to Vercel) successfully shows all 60 dimensions but revealed that 36 out of 60 are not being populated. A detailed root cause analysis identified the issues and solutions were broken into modular specifications. Phase 1 & 2 represent the "quick wins" that can fix 9 dimensions in ~2-3 hours.

**Critical Discovery - Database State:**
Through database queries in this session, we discovered:
1. ✅ **5 out of 6 prompt templates already exist** in the database (better than expected!)
   - Existing: `content_analysis_v1`, `task_extraction_v1`, `cer_analysis_v1`, `scenario_extraction_v1`, `risk_assessment_v1`
   - Missing: `training_pair_generation` template
2. ✅ **Database schema differs from specification:**
   - Uses `applicable_chunk_types` column (not `chunk_type_filter`)
   - Uses `response_schema` column (not `output_schema`)
   - Includes additional columns: `version`, `updated_at`, `created_by`, `notes`
   - Templates use versioned naming convention (e.g., `template_name_v1`)
3. ✅ **Test chunk identified:**
   - Chunk ID: `975284d7-924b-41c0-8c8a-9cc92d2f1502`
   - Type: `CER` (Claim-Evidence-Reasoning)
   - Document ID: `550e8400-e29b-41d4-a716-446655440025`

**What This Means for Expected Results:**
Since test chunk is type `CER`:
- **Expected Missing (11 dimensions):** Task dimensions (6) + Scenario dimensions (5) - these are conditional and only apply to other chunk types
- **Unexpected Missing (up to 25 dimensions):** CER (5), Training Pair (3), some Risk (2), labeling metadata (4), training split (1), plus document metadata (5) and embedding (2)
- **Target After Phase 1:** Should have ~51/60 dimensions populated (85%) for this CER chunk

**Current State:**
- ✅ Phase 2 Task 2.1: Completed - Discovered 5/6 templates exist
- ✅ Phase 2 Task 2.2: Completed - Added missing Training Pair Generation template to database
- ✅ Phase 2 Task 2.3: Completed - Verified test chunk is type CER
- ⏸️ Phase 2 Task 2.4: Pending - Need to verify Risk Assessment template fields
- ⏸️ Phase 1 Tasks 1.1-1.4: Pending - Code changes not yet executed

**Critical Context for Next Engineer:**
1. The implementation spec has been **updated for actual database schema** (column names, constraints)
2. All SQL queries have been tested and corrected for your specific schema
3. The spec contains copy-paste ready prompts for Claude-4.5-sonnet in Cursor
4. Each Phase 1 task (1.1-1.4) should be executed in a **separate Cursor conversation** (fresh 200k context window)
5. The prompts are self-contained and do not require external context beyond what's in each prompt

Do not deviate from this focus without explicit instruction.
All other information in this document is reference material only.

### Current Active Action

**Phase 2, Task 2.3: Verify Chunk Type - COMPLETED**

**Status:** ✅ Successfully completed
- Verified test chunk ID: `975284d7-924b-41c0-8c8a-9cc92d2f1502`
- Confirmed chunk_type: `CER`
- Confirmed expected vs unexpected missing dimensions
- Ready to proceed to Task 2.4

**Last Recorded Action:** 
Executed SQL query to verify test chunk properties. Result confirmed CER chunk type, which means 11 conditional dimensions are correctly NULL (Task/Scenario fields), and remaining missing dimensions are legitimate bugs to fix.

### Next Steps

**Priority 1: Complete Phase 2 Database Verification (15 minutes)**
- **Task 2.4:** Verify Risk Assessment Template Fields
- **File:** `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_quick-wins-addon_v1.md` (lines 301-343)
- **Action:** Run SQL query to check if `safety_tags` and `compliance_flags` are in risk_assessment template
- **Expected Outcome:** Confirm these 2 fields are in the prompt template and schema
- **Blocker:** None
- **Success Criteria:** Both fields show `true` in query results

**Priority 2: Execute Phase 1 Task 1.1 - Labeling Metadata (30 minutes)**
- **Task 1.1:** Add Labeling Metadata to Dimension Generation
- **File to Modify:** `src/lib/dimension-generation/generator.ts` (lines ~169-172)
- **Action:** Copy prompt from spec (lines 357-486) into NEW Cursor conversation with Claude-4.5-sonnet Thinking
- **Expected Outcome:** 4 lines of code added to set labeling metadata defaults
- **Blocker:** None
- **Success Criteria:** Code compiles, 4 fields added: `label_source_auto_manual_mixed`, `label_model`, `labeled_by`, `label_timestamp_iso`

**Priority 3: Execute Phase 1 Task 1.2 - Training Split (30 minutes)**
- **Task 1.2:** Add Training Split Assignment Logic
- **File to Modify:** `src/lib/dimension-generation/generator.ts` (lines ~150, ~172)
- **Action:** Copy prompt from spec (lines 497-628) into NEW Cursor conversation
- **Expected Outcome:** Hash function added + split calculation + `data_split_train_dev_test` field set
- **Blocker:** None
- **Success Criteria:** Code compiles, deterministic 80/10/10 split logic working

**Priority 4: Execute Phase 1 Task 1.3 - Training Pair Mapping (30 minutes)**
- **Task 1.3:** Add Training Pair Generation Response Mapping
- **File to Modify:** `src/lib/dimension-generation/generator.ts` (lines ~283-327)
- **Action:** Copy prompt from spec (lines 639-770) into NEW Cursor conversation
- **Expected Outcome:** Mapping added for `training_pair_generation` template type
- **Blocker:** None
- **Success Criteria:** Code compiles, 3 fields mapped: `prompt_candidate`, `target_answer`, `style_directives`

**Priority 5: Execute Phase 1 Task 1.4 - chunk_type Mapping (30 minutes)**
- **Task 1.4:** Add chunk_type Mapping in Dimension Service
- **File to Modify:** `src/lib/dimension-service.ts` (lines ~151-178)
- **Action:** Copy prompt from spec (lines 781-901) into NEW Cursor conversation
- **Expected Outcome:** Case added to switch statement for chunk_type
- **Blocker:** None
- **Success Criteria:** Code compiles, chunk_type displays in Dimension Validation Spreadsheet

### Important Files

**Implementation Specification (PRIMARY):**
1. **`pmc/context-ai/pmct/c-alpha-build-spec_v3.3_quick-wins-addon_v1.md`**
   - **Purpose:** Complete implementation guide for Phase 1 & 2 quick wins
   - **Status:** Updated for actual database schema (v1.1)
   - **Key Sections:**
     - Lines 60-106: Phase 2 Task 2.1 (Check Templates) - ✅ Completed
     - Lines 109-214: Phase 2 Task 2.2 (Seed Template) - ✅ Completed
     - Lines 217-298: Phase 2 Task 2.3 (Verify Chunk Type) - ✅ Completed
     - Lines 301-343: Phase 2 Task 2.4 (Check Risk Fields) - ⏸️ Next Task
     - Lines 357-486: Phase 1 Task 1.1 Prompt (Labeling Metadata)
     - Lines 497-628: Phase 1 Task 1.2 Prompt (Training Split)
     - Lines 639-770: Phase 1 Task 1.3 Prompt (Training Pair Mapping)
     - Lines 781-901: Phase 1 Task 1.4 Prompt (chunk_type Mapping)
   - **Critical:** All SQL updated for `applicable_chunk_types` and `response_schema` columns

**Code Files to Modify:**
2. **`src/lib/dimension-generation/generator.ts`** (461 lines)
   - **Purpose:** Main dimension generation logic - WHERE MOST FIXES HAPPEN
   - **Modifications Needed:**
     - Task 1.1: Lines ~169-172 (add labeling metadata)
     - Task 1.2: Lines ~150 (add hash function), ~172 (add split assignment)
     - Task 1.3: Lines ~324 (add training_pair_generation mapping)
   - **Current State:** Unmodified, ready for changes

3. **`src/lib/dimension-service.ts`** (375 lines)
   - **Purpose:** Service layer for fetching dimension data
   - **Modifications Needed:**
     - Task 1.4: Lines ~178 (add chunk_type case to switch statement)
   - **Current State:** Unmodified, ready for changes

### Important Scripts, Markdown Files, and Specifications

**Master Planning Documents:**
1. **`pmc/context-ai/pmct/c-alpha-build-spec_v3.3_dimensions-driver_v1.md`**
   - **Purpose:** Master roadmap for all dimension fixes (Phases 1-5)
   - **Key Sections:**
     - Lines 1-40: Executive summary and document map
     - Lines 42-214: Phase 1 & 2 detailed task breakdown
     - Lines 344-426: Success criteria and testing strategy
   - **Use For:** Understanding big picture, what comes after Phase 1 & 2

**Modular Specification Documents:**
2. **`pmc/context-ai/pmct/c-alpha-build-spec_v3.3_document_module_v1.md`**
   - **Purpose:** Spec for Phase 3 - Document upload metadata capture (5 dimensions)
   - **Status:** Reference for future work
   - **Use For:** After Phase 1 & 2 complete

3. **`pmc/context-ai/pmct/c-alpha-build-spec_v3.3_prompt-llm-api-dimensions_v1.md`**
   - **Purpose:** Non-technical explanation of AI prompt system
   - **Key Info:** How the 6 prompt templates work, what they generate
   - **Use For:** Understanding why prompt templates matter

4. **`pmc/context-ai/pmct/c-alpha-build-spec_v3.3_every-thing-else-dimensions_v1.md`**
   - **Purpose:** Covers all other quick fixes beyond Phase 1 & 2
   - **Use For:** Additional context on labeling metadata, split assignment logic

5. **`pmc/context-ai/pmct/c-alpha-build-spec_v3.3_embedding-system_v1.md`**
   - **Purpose:** Spec for embedding system (backlog, not immediate)
   - **Status:** Reference only, not current priority
   - **Use For:** Understanding what embedding_id and vector_checksum are for

**Original Analysis Document:**
6. **`pmc/context-ai/pmct/c-alpha-build-spec_v3.3_missing-dimensions_v1.md`** (776 lines)
   - **Purpose:** Comprehensive root cause analysis of all 36 missing dimensions
   - **Status:** Reference for deep technical details
   - **Use For:** Understanding why each dimension is missing, code locations, fix complexity

### Recent Development Context

**Last Milestone:** Created modular specification breakdown for dimension fixes

**Key Outcomes:**
1. Broke down 900-line analysis into 5 focused, modular specifications:
   - Document Module (upload metadata capture)
   - Embedding System (backlog)
   - Prompt/LLM API System (template management)
   - Everything Else (quick fixes)
   - Master Driver Document (roadmap)
2. Created Phase 1 & 2 implementation spec with copy-paste ready SQL and AI prompts
3. Discovered actual database state is better than expected (5/6 templates exist)
4. Updated all SQL queries for actual schema (`applicable_chunk_types`, `response_schema`)
5. Verified test chunk is type CER, which clarifies expected vs unexpected missing dimensions

**Relevant Learnings:**
1. **Database Schema Discovery:** Real schema differs from specifications
   - Adaptation required: Updated all SQL queries with correct column names
   - No unique constraint on `template_type` - had to change INSERT strategy
2. **Prompt Template State:** Most templates already seeded (5/6 exist)
   - Only need to add 1 missing template (Training Pair Generation)
   - Significantly reduces Phase 2 implementation time
3. **Chunk Type Awareness:** CER chunks have different expected dimension sets
   - 11 dimensions correctly NULL for CER chunks (Task + Scenario fields)
   - Remaining missing dimensions are legitimate bugs
4. **Modular Prompt Strategy:** Each Phase 1 task gets separate Cursor conversation
   - Prompts are self-contained (no external dependencies)
   - Can be executed in any order (though recommended sequence exists)
   - Each prompt includes full context, code locations, and success criteria

**Technical Context:**
1. **Database Table:** `prompt_templates`
   - Schema includes: `id`, `template_name`, `template_type`, `prompt_text`, `response_schema`, `applicable_chunk_types`, `version`, `is_active`, `created_at`, `updated_at`, `created_by`, `notes`
   - No unique constraint on `template_type` (requires DELETE before INSERT)
   - 5 existing templates all active and properly configured
2. **Test Chunk Context:**
   - ID: `975284d7-924b-41c0-8c8a-9cc92d2f1502`
   - Type: `CER` (Claim-Evidence-Reasoning)
   - Expected population: ~51/60 dimensions (85%) after fixes
   - Can be used to validate all Phase 1 fixes
3. **Code Modification Points:**
   - `generator.ts` lines ~150, ~169-172, ~324 (3 separate modifications)
   - `dimension-service.ts` lines ~178 (1 modification)
   - All changes are additive (no deletions, minimal risk)
4. **Implementation Strategy:**
   - Phase 2 tasks use SQL in Supabase editor (no code deployment needed)
   - Phase 1 tasks use AI prompts in Cursor (requires code compilation + deployment)
   - Testing happens after all Phase 1 tasks complete (not incrementally)

**Critical Instructions for Next Engineer:**
1. **Start Here:** `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_quick-wins-addon_v1.md`
2. **Current Position:** Completed through Task 2.3, starting Task 2.4
3. **Execution Model:** 
   - Phase 2 tasks = SQL queries in Supabase
   - Phase 1 tasks = AI prompts in separate Cursor conversations
4. **Copy-Paste Boundaries:**
   - SQL: Between `========` and `+++++++` markers
   - Prompts: Between `========` and `+++++++` markers
5. **Verification Steps:**
   - After Phase 2: Confirm 6 templates exist, test chunk type verified
   - After Phase 1: Code compiles without errors, ready for dimension regeneration
   - After testing: Check chunk `975284d7-924b-41c0-8c8a-9cc92d2f1502` has ~51/60 dimensions populated

## Project Reference Guide
REFERENCE MATERIALS
Everything below this line is supporting information only. Do NOT select the current task focus from this section.

### Bright Run LoRA Training Data Platform

**Product Overview:**
Bright Run is a revolutionary LoRA fine-tuning training data platform that transforms unstructured business knowledge into high-quality training datasets through an intuitive 6-stage workflow.

**Core Value Proposition:**
First user-friendly solution that enables non-technical domain experts to convert their proprietary knowledge—transcripts, documents, and expertise—into thousands of semantically diverse training pairs suitable for LoRA model fine-tuning.

**Target Problem:**
Small business owners and domain experts possess invaluable proprietary knowledge—from marketing philosophies to operational processes—but face insurmountable barriers in transforming this knowledge into LoRA ready training data.

#### Key Documents
1. Seed Story: `pmc/product/00-bmo-seed-story.md`
2. Project Overview: `pmc/product/01-bmo-overview.md`

### Project Memory Core (PMC)

**Purpose:** Structured task management and context retention system

**Key Principles:**
1. **Context Locality**: Instructions and context kept directly alongside relevant tasks
2. **Structured Checkpoints**: Regular token-based checks prevent context drift
3. **Directive Approach**: Clear commands and instructions with explicit timing requirements
4. **Task-Centric Documentation**: Single source of truth for task implementation
