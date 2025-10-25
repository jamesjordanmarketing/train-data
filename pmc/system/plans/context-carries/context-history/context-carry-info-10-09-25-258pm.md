# Development Context & Operational Priorities
**Date:** 2025-10-09 14:58 PST
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

**TASK: Writing Specification for Document Upload & Processing Module**

**What We're Doing:**
We are preparing to write a comprehensive specification for a new document upload and processing module. The application has been successfully deployed to Vercel with the current codebase in `src/` working well. However, we've discovered the need for a robust document uploading module to complete the workflow.

**Why We're Doing This:**
The current system has backend upload services but lacks a complete frontend upload UI and integrated document processing workflow. We need to:
1. Create a user-friendly document upload interface
2. Capture document metadata during upload
3. Provide upload status tracking (Processing, Completed, Errors)
4. Integrate with existing dimension generation system

**Current State:**
- ✅ Application deployed to Vercel and operational
- ✅ Backend upload service exists in `src/lib/database.ts` (fileService.uploadDocument)
- ✅ Database columns for document metadata added (doc_version, source_type, source_url, doc_date)
- ✅ Initial requirements documented
- ✅ Wireframe UI design completed in separate Vite application (`doc-module/src`)
- ⏸️ **Next:** Answer architectural questions before writing full specification

**Critical Context:**
- We have TWO codebases to reference:
  1. **Main Application:** `src/` - Next.js 14 app, currently deployed
  2. **Wireframe Design:** `doc-module/src/` - Vite app with UI design to replicate
- The wireframe is ONLY for studying UI design - implementation must be in Next.js 14
- Specification must be written in the same directive style as `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_quick-wins-log-api_v3.md`

Do not deviate from this focus without explicit instruction.
All other information in this document is reference material only.

### Next Steps 

**Priority 1: Answer Question A - File Processing State Reporting (30 minutes)**
- **Action:** Analyze whether JavaScript polling is sufficient for status updates
- **Question:** Does real-time status reporting require WebSockets, or can simple polling work?
- **Context:** Need to show Processing/Completed/Errors states without page refresh
- **Decision Required:** If polling adds too much complexity, defer real-time updates
- **Dependencies:** Must review both `src/` and `doc-module/src/` codebases
- **Expected Outcome:** Clear recommendation on polling vs. sockets vs. no real-time updates

**Priority 2: Answer Question B - Architectural Decision (45 minutes)**
- **Action:** Determine whether to build within `chunks-alpha/src` or as standalone module
- **Question:** Should upload module be integrated into main app or developed separately?
- **Analysis Required:**
  - Evaluate current chunks-alpha size and complexity
  - Assess dependency between upload module and existing features
  - Consider future integration challenges
  - Review component sharing opportunities
- **Dependencies:** Must review both codebases thoroughly
- **Expected Outcome:** Clear architectural decision with rationale

**Priority 3: Write Complete Specification (2-3 hours)**
- **Action:** Create comprehensive specification document
- **Format:** Follow pattern from `c-alpha-build-spec_v3.3_quick-wins-log-api_v3.md`
- **Requirements:**
  - Directive style ("you shall" not "you could")
  - Clear SQL blocks and prompts with === and +++ markers
  - Self-contained prompts with full context
  - Step-by-step implementation guide
- **Dependencies:** Requires completion of Priority 1 and 2
- **Expected Outcome:** Production-ready specification for document upload module

**Priority 4: Review and Validate Specification (30 minutes)**
- **Action:** Review spec for completeness and clarity
- **Validation:** Ensure all prompts are self-contained and testable
- **Expected Outcome:** Approved specification ready for implementation

### Important Files

**Current Application Codebase:**
1. **`src/lib/database.ts`**
   - Purpose: Contains fileService.uploadDocument() - backend upload service
   - Current State: Exists but needs metadata parameter updates (partially complete)
   - Key Location: Line 395 - uploadDocument function

2. **`src/lib/dimension-generation/generator.ts`**
   - Purpose: Dimension generator that expects document metadata
   - Current State: Modified - already expects doc metadata fields (lines 130-137)
   - Key Context: Has TODO for author name resolution (line 132)

3. **`src/app/(workflow)/*` or `src/components/workflow/*`**
   - Purpose: Workflow components (upload UI may or may not exist here)
   - Current State: Unknown - needs investigation
   - Action Required: Determine if upload UI exists

**Wireframe Design Codebase:**
4. **`doc-module/src/*`**
   - Purpose: Vite application containing UI design wireframes
   - Current State: Complete, reference only
   - Usage: Study UI design patterns and replicate in Next.js 14
   - Critical: Do NOT use this code directly - it's Vite, we need Next.js

### Important Scripts, Markdown Files, and Specifications

**Requirements and Analysis:**
1. **`pmc/context-ai/pmct/c-alpha-build-spec_v3.3_document_module_v2.md`**
   - Purpose: Current functionality and requirements discovery
   - Key Sections: 
     - Database schema requirements
     - Backend service updates needed
     - Dimension generator modifications
   - Status: Complete, but missing frontend UI specification
   - Issue Discovered: Backend updates are specified, but no UI exists

2. **`pmc/context-ai/pmct/c-alpha-build-spec_v3.3_document_module_analysis_v1.md`**
   - Purpose: Further requirements discovery and analysis
   - Status: Needs to be reviewed by coding agent
   - Use For: Answering architectural questions

3. **`pmc/context-ai/pmct/c-alpha-build-spec_v3.3_quick-wins-log-api_v3.md`**
   - Purpose: Template for specification format
   - Key Features: 
     - Directive style
     - Clear copy-paste blocks with markers
     - Self-contained prompts
   - Use As: Model for new document upload specification

**Database State:**
4. **Database columns already added:**
   - `documents.doc_version` (TEXT)
   - `documents.source_type` (TEXT)
   - `documents.source_url` (TEXT)
   - `documents.doc_date` (TIMESTAMPTZ)
   - Index: `idx_documents_source_type`
   - Status: ✅ Already migrated

### Recent Development Context

**Last Milestone:** Created specification framework for dimension fixes and API logging

**Key Outcomes:**
1. Established directive specification format with clear copy-paste boundaries
2. Successfully deployed Claude API logging to database (Vercel-compatible)
3. Database schema updated with document metadata columns
4. Backend upload service partially updated (accepts metadata parameters)

**Relevant Learnings:**
1. **Specification Format:** Directive style with === and +++ markers works extremely well
   - Eliminates confusion about what to copy
   - Self-contained prompts prevent context dependency issues
   - Clear separation between human actions and AI implementation
2. **Vercel Constraints:** File system is ephemeral - must use database for persistence
   - Cannot write files at runtime on Vercel
   - Database logging works, file logging does not
3. **UI/Backend Gap:** Backend services exist but frontend UI may not
   - Always verify both sides exist before writing specifications
   - Missing UI is a bigger gap than missing backend logic

**Technical Context:**
1. **Application Stack:**
   - Next.js 14 (App Router)
   - Supabase (Database + Storage + Auth)
   - Deployed on Vercel (serverless constraints)
   - TypeScript throughout

2. **Current Architecture:**
   - Backend: `src/lib/` contains all services
   - Frontend: `src/app/` (pages) and `src/components/` (UI components)
   - Database: PostgreSQL via Supabase
   - Storage: Supabase Storage for file uploads

3. **Wireframe Architecture:**
   - Vite + React (separate codebase)
   - Located in `doc-module/src/`
   - Reference only - do NOT use directly
   - Must translate UI patterns to Next.js 14

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
