# Development Context & Operational Priorities
**Date:** 2025-10-07 16:04 PST
**Project:** Bright Run LoRA Training Data Platform (bmo) & Project Memory Core (PMC)
**Context Version:** 3.0.0

## Introduction

This context document addresses two integrated projects that operate in tandem:

1. **Bright Run LoRA Training Data Platform**: Bright Run is a revolutionary LoRA fine-tuning training data platform that transforms unstructured business knowledge into high-quality training datasets through an intuitive 6-stage workflow. We are creating the first user-friendly solution that enables non-technical domain experts to convert their proprietary knowledge—transcripts, documents, and expertise—into thousands of semantically diverse training pairs suitable for LoRA model fine-tuning.

### What Problem Does This Product Solve?

Small business owners and domain experts possess invaluable proprietary knowledge—from marketing philosophies to operational processes—but face insurmountable barriers in transforming this knowledge into LoRA ready training data.

2. **Project Memory Core (PMC)**: A structured task management and context retention system that manages the development of the Aplio project. PMC provides methodical task tracking, context preservation, and implementation guidance through its command-line interface and document-based workflow.

These projects are deliberately interconnected - PMC requires a real-world development project to refine its capabilities, while Aplio benefits from PMC's structured approach to development. Depending on current priorities, work may focus on either advancing the Aplio Design System implementation or enhancing the PMC tooling itself.

## Current Focus

### Active Development Focus

**TASK: Address Missing Dimensions - Root Cause Analysis & Implementation Planning**

**What Has Happened:**
The Dimension Validation Spreadsheet UI (completed in previous session) successfully deployed to Vercel and works without bugs. However, testing revealed that **36 out of 60 chunk dimensions are not being populated**. A comprehensive root cause analysis was conducted to identify why these dimensions are missing.

**Analysis Completed:**
A detailed analysis document has been created at `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_missing-dimensions_v1.md` (95+ KB, ~900 lines) that categorizes all missing dimensions into 5 distinct reason groupings:

1. **Prior Not Filled (5 dimensions)** - Document metadata not captured during upload (doc_version, source_type, source_url, author, doc_date)
2. **Mechanical Not Filled (7 dimensions)** - Features not implemented (embedding system, labeling metadata, training split assignment)
3. **AI Not Filled - Prompts Need Updates (21 dimensions)** - Prompt template mapping incomplete or templates not seeded in database
4. **AI Not Filled - Not Applicable (16 dimensions)** - Chunk-type-specific dimensions (task/CER/scenario fields only apply to certain chunk types)
5. **Additional Categories** - Misclassifications, defaults, dependency chains, schema mismatches

**Critical Discovery:**
The AI dimension generation system is **chunk-type-aware**. Different chunk types (Chapter_Sequential, Instructional_Unit, CER, Example_Scenario) should generate different dimensions. Missing task/CER/scenario dimensions may be **EXPECTED BEHAVIOR** if the test chunk is type `Chapter_Sequential`.

**Current State:**
- ✅ Dimension Validation Spreadsheet UI fully functional
- ✅ All 60 dimensions display in spreadsheet (with null values for missing)
- ✅ Root cause analysis complete with detailed remediation roadmap
- ✅ Missing dimensions categorized by fix complexity (Easy/Medium/Hard)
- ❌ No dimensions have been fixed yet
- ❌ Remediation implementation not started

**What Needs to Happen Next:**
The next AI engineer must:
1. **READ THE CODEBASE** thoroughly to understand dimension generation flow
2. **READ THE ANALYSIS DOCUMENT** in full (`pmc/context-ai/pmct/c-alpha-build-spec_v3.3_missing-dimensions_v1.md`)
3. **Verify root causes** by examining database state, prompt templates, and test data
4. **Create implementation plan** for addressing missing dimensions
5. **Answer questions** from the human about priorities and approach
6. **Begin remediation** starting with Quick Wins (labeling metadata, training split, template mapping)

Do not deviate from this focus without explicit instruction.
All other information in this document is reference material only.

### Next Steps

**Priority 1: Context Loading & Verification (2-3 hours)**
- Task: Read and understand the missing dimensions analysis
- File: `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_missing-dimensions_v1.md`
- Expected outcome: Full understanding of all 5 categories of missing dimensions and their root causes

**Priority 2: Database State Audit (1-2 hours)**
- Task: Verify actual database state matches analysis assumptions
- Check: Confirm which columns exist in `documents` table
- Check: Verify `prompt_templates` table is populated (or empty)
- Check: Examine test chunk's `chunk_type` value to determine if missing dimensions are expected
- Expected outcome: Validation or correction of analysis assumptions

**Priority 3: Quick Win Implementation - Labeling Metadata (30 minutes)**
- Task: Add 4 missing labeling metadata fields to dimension generation
- File: `src/lib/dimension-generation/generator.ts` (lines 154-179)
- Code: Add `label_source_auto_manual_mixed: 'auto'`, `label_model: AI_CONFIG.model`, `labeled_by: 'system'`, `label_timestamp_iso: new Date().toISOString()`
- Expected outcome: 4 dimensions now populated (label_source_auto_manual_mixed, label_model, labeled_by, label_timestamp_iso)

**Priority 4: Quick Win Implementation - Training Split Assignment (30 minutes)**
- Task: Add training split logic to dimension generation
- File: `src/lib/dimension-generation/generator.ts` (lines 154-179)
- Code: Add deterministic split logic based on chunk_id hash
- Expected outcome: 1 dimension now populated (data_split_train_dev_test)

**Priority 5: Prompt Template Verification & Seeding (2-4 hours)**
- Task: Audit `prompt_templates` table and seed if empty
- Check: Does table have 6 templates (content_analysis, task_extraction, cer_analysis, scenario_extraction, training_pair_generation, risk_assessment)?
- Action: Create seed script using prompt text from `pmc/product/_prompt_engineering/dimensions-prompts_v1.md`
- File to update: `src/lib/dimension-generation/generator.ts` (add training_pair_generation mapping at line ~324)
- Expected outcome: All AI dimension templates active and properly mapped

### Important Files

**Analysis & Documentation:**
1. **`pmc/context-ai/pmct/c-alpha-build-spec_v3.3_missing-dimensions_v1.md`**
   - Purpose: **MUST READ** - Comprehensive root cause analysis of 36 missing dimensions
   - State: Completed analysis (900+ lines)
   - Key sections: All 5 categories, remediation roadmap, fix complexity estimates
   - Critical: Contains code locations, expected vs actual behavior, SQL needed

2. **`PROMPT-3.1-COMPLETION-SUMMARY.md`**
   - Purpose: Reference for Dimension Validation UI implementation
   - State: Previous session's completion document
   - Use for: Understanding UI structure and data flow

3. **`PROMPT-2.1-COMPLETION-SUMMARY.md`**
   - Purpose: Reference for dimension data layer implementation
   - State: Data layer completion document
   - Use for: Understanding dimension metadata, classification, and service layer

**Core Implementation Files:**
4. **`src/lib/dimension-generation/generator.ts`**
   - Purpose: Main AI dimension generation logic - WHERE MOST FIXES ARE NEEDED
   - State: Working but incomplete (missing labeling metadata, training split, template mapping)
   - Lines to modify: 154-179 (add defaults), 324 (add training_pair_generation mapping)
   - Critical: Lines 182 (template fetching), 283-327 (response mapping)

5. **`src/lib/dimension-metadata.ts`**
   - Purpose: Metadata constants for all 60 dimensions
   - State: Complete (925 lines)
   - Use for: Reference for dimension definitions, types, categories

6. **`src/lib/dimension-service.ts`**
   - Purpose: Service layer to fetch and join dimension data
   - State: Complete (375 lines)
   - Use for: Understanding how dimensions are retrieved and displayed

7. **`src/lib/database.ts`**
   - Purpose: Database service layer including document upload
   - State: Incomplete (missing document metadata capture)
   - Lines to modify: fileService.uploadDocument() around line 395
   - Critical: Need to add doc_version, source_type, source_url, doc_date capture

**Database Schema:**
8. **`pmc/context-ai/pmct/c-alpha-build-spec_v3.3-SQL-fix.md`**
   - Purpose: Database schema reference
   - State: Specification document
   - Use for: Verifying table structures, understanding what columns should exist

### Important Scripts, Markdown Files, and Specifications

**Prompt Engineering Reference:**
1. **`pmc/product/_prompt_engineering/dimensions-prompts_v1.md`**
   - Purpose: Original prompt templates for AI dimension generation
   - Key sections: All 6 prompts (Content Analysis, Task Extraction, CER Analysis, Scenario Analysis, Training Pair Generation, Risk Assessment)
   - Use for: Seeding `prompt_templates` table with actual prompt text
   - Critical: Contains JSON schemas, activation conditions, dimension mappings

**Dimension Organization:**
2. **`system/chunks-alpha-data/metadata-dictionary-categorization-analysis_v1.md`**
   - Purpose: Original categorization analysis of 60 dimensions
   - Key sections: Prior/Mechanical/AI breakdown, dimension groupings
   - Use for: Understanding dimension organization philosophy

**Specification Documents:**
3. **`pmc/context-ai/pmct/c-alpha-build-spec_v3.3-dimensions-sheet-spec_v2.md`**
   - Purpose: Dimension spreadsheet specification
   - Key sections: Dimension breakdown by category, prompt template mapping
   - Use for: Understanding expected behavior and dimension assignment

**CSV Data Files:**
4. **`system/chunks-alpha-data/document-metadata-dictionary-previously-generated_v1.csv`**
5. **`system/chunks-alpha-data/document-metadata-dictionary-mechanically-generated_v1.csv`**
6. **`system/chunks-alpha-data/document-metadata-dictionary-gen-AI-processing-required_v1.csv`**
   - Purpose: Original dimension definitions from CSV files
   - Use for: Cross-referencing dimension metadata and requirements

### Recent Development Context

- **Last Milestone**: Completed missing dimensions root cause analysis

- **Key Outcomes**: 
  - Identified all 36 missing dimensions and categorized into 5 distinct reason groupings
  - Discovered chunk-type-aware dimension generation (task/CER/scenario dims are conditional)
  - Created comprehensive remediation roadmap with fix complexity estimates
  - Confirmed Dimension Validation Spreadsheet UI works perfectly (deployed to Vercel, no bugs)
  - Determined quick wins can fix 6 dimensions in ~2 hours of work

- **Relevant Learnings**:
  - Document upload form doesn't capture critical metadata (doc_version, source_type, source_url, doc_date)
  - Labeling metadata fields are simply not being set in code (easy 4-line fix)
  - Training split assignment logic doesn't exist (easy 5-line fix)
  - Embedding pipeline doesn't exist (hard, requires new subsystem)
  - Prompt templates may not be seeded in database (needs verification)
  - Some "missing" dimensions are actually expected behavior based on chunk type

- **Technical Context**:
  - Dimension generation happens in `DimensionGenerator` class
  - Templates fetched per chunk type using `promptTemplateService.getActiveTemplates(chunk.chunk_type)`
  - Response mapping uses template_type to determine which dimensions to extract
  - Prior dimensions inherited from document metadata (passed to generator)
  - Mechanical dimensions set as defaults or calculated during chunk extraction
  - AI dimensions populated from LLM responses via template execution loop

**CRITICAL INSTRUCTION FOR NEXT ENGINEER:**
Before making ANY changes, you MUST:
1. Read the entire analysis document (`pmc/context-ai/pmct/c-alpha-build-spec_v3.3_missing-dimensions_v1.md`)
2. Understand the codebase flow from document upload → chunk extraction → dimension generation
3. Verify database state (which tables/columns exist, which data is present)
4. Confirm test chunk's chunk_type to determine if missing dims are expected
5. Discuss priorities and approach with the human before beginning implementation

## Project Reference Guide
REFERENCE MATERIALS
Everything below this line is supporting information only. Do NOT select the current task focus from this section.

### Bright Run LoRA Training Data Platform

## Introduction

This context document addresses two integrated projects that operate in tandem:

1. **Bright Run LoRA Training Data Platform**: Bright Run is a revolutionary LoRA fine-tuning training data platform that transforms unstructured business knowledge into high-quality training datasets through an intuitive 6-stage workflow. We are creating the first user-friendly solution that enables non-technical domain experts to convert their proprietary knowledge—transcripts, documents, and expertise—into thousands of semantically diverse training pairs suitable for LoRA model fine-tuning.

### What Problem Does This Product Solve?

Small business owners and domain experts possess invaluable proprietary knowledge—from marketing philosophies to operational processes—but face insurmountable barriers in transforming this knowledge into LoRA ready training data.

2. **Project Memory Core (PMC)**: A structured task management and context retention system that manages the development of the Aplio project. PMC provides methodical task tracking, context preservation, and implementation guidance through its command-line interface and document-based workflow.

These projects are deliberately interconnected - PMC requires a real-world development project to refine its capabilities, while Aplio benefits from PMC's structured approach to development. Depending on current priorities, work may focus on either advancing the Aplio Design System implementation or enhancing the PMC tooling itself.

#### Key Documents
1. Seed Story: `pmc/product/00-bmo-seed-story.md`
2. Project Overview: `pmc\product\01-bmo-overview.md`

1. **Context Locality**: Instructions and context are kept directly alongside their relevant tasks
2. **Structured Checkpoints**: Regular token-based checks prevent context drift
3. **Directive Approach**: Clear commands and instructions with explicit timing requirements
4. **Task-Centric Documentation**: Single source of truth for task implementation
