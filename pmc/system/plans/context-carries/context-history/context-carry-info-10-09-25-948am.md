# Development Context & Operational Priorities
**Date:** 2025-10-09 09:48 PST
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

**Task:** Implement Document Upload Feature with Metadata Capture  
**Phase:** Planning & Analysis Complete → Ready for Frontend Implementation  
**Current State:** Backend services exist but Frontend UI is missing

#### What We're Working On

We are implementing the Document Upload Module to capture 5 missing "Prior Generated" dimensions that need to be collected during document upload (not auto-generated later):
- `doc_version` - Document version number
- `source_type` - File type (PDF, DOCX, TXT, etc.)
- `source_url` - Original URL if sourced from web
- `doc_date` - Document creation/publication date
- `author` - Author name (human-readable)

#### Why This Matters

These 5 dimensions are "Prior Generated" - they must be captured at upload time because:
1. **Cannot be inferred later** - File metadata is lost after text extraction
2. **Required for training data quality** - Helps with data provenance and filtering
3. **Currently missing** - All existing documents have NULL for these fields
4. **Blocks data completeness** - 55 AI-generated dimensions work, but these 5 are prerequisites

#### Critical Discovery: Frontend UI Is Missing

**Investigation Results:**
```
✅ Backend Service EXISTS:
   - src/lib/database.ts has fileService.uploadDocument() at line 395
   - Can upload files to Supabase storage
   - Creates document records in database
   - Currently only captures: title, file_path, file_size, author_id, status

❌ Frontend Upload UI MISSING:
   - No upload page found in src/app/
   - No document upload form component found
   - No UI for users to input metadata fields
   - Backend service exists but has no way to be called with metadata
```

**The Gap:**
The specification at `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_document_module_v2.md` updates the backend service but does NOT create the frontend UI. This means:
- Backend can accept metadata parameters (after STEP 2 implementation)
- But there's no form for users to provide those parameters
- The feature is incomplete without a frontend component

#### What We Need to Build

**Complete Upload Feature Requires 3 Components:**

1. **Backend Service Update** (STEP 2 from spec)
   - ✅ Service exists at `src/lib/database.ts:395`
   - ❌ Needs updating to accept optional metadata parameters
   - ❌ Needs auto-detection of source_type from file extension
   - Status: Ready to implement (straightforward backend update)

2. **Frontend Upload UI** (NOT in current spec - needs new implementation)
   - ❌ Create upload page or component
   - ❌ File input/drag-drop interface
   - ❌ Form fields for metadata (version, URL, date)
   - ❌ Call to fileService.uploadDocument() with metadata
   - Status: Needs new implementation plan

3. **Dimension Generator Update** (STEP 3 from spec)
   - Update src/lib/dimension-generation/generator.ts
   - Resolve author_id to human-readable author name
   - Status: Straightforward, waits on backend update

#### Current Implementation State

**Just Completed:**
- ✅ Quick Wins implementation (9 dimensions fixed)
- ✅ Fixed Training Pair Generation template retrieval bug
- ✅ API logging system implemented
- ✅ All fixes tested and deployed to Vercel

**Analysis Complete:**
- ✅ Reviewed specification: `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_document_module_v2.md`
- ✅ Investigated codebase for existing upload functionality
- ✅ Identified backend service location and capabilities
- ✅ Confirmed frontend UI is missing
- ✅ Documented the gap between spec and reality

**Ready to Execute:**
- Backend service update (clear requirements)
- Dimension generator update (clear requirements)

**Blocked Until Designed:**
- Frontend upload UI (needs specification)

Do not deviate from this focus without explicit instruction.
All other information in this document is reference material only.

### Next Steps 

1. **Create Frontend Upload UI Specification**
   - File: Create new spec document (suggested: `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_document_upload_ui_v1.md`)
   - Action: Design the complete frontend upload interface specification including:
     * Page location (new route? modal? existing page enhancement?)
     * Form field specifications (version, URL, date inputs)
     * File upload mechanism (drag-drop vs file picker)
     * Validation rules for metadata fields
     * Integration with existing fileService.uploadDocument()
   - Dependencies: None (can start immediately)
   - Expected Outcome: Complete specification ready for AI engineer to implement

2. **Implement Backend Service Updates (STEP 2)**
   - File: `src/lib/database.ts` (fileService.uploadDocument at line 395)
   - Action: Follow specification in `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_document_module_v2.md` STEP 2
   - Updates needed:
     * Add optional parameters: doc_version, source_url, doc_date
     * Add auto-detection of source_type from file extension
     * Update document creation to include new metadata fields
   - Dependencies: None (can implement immediately)
   - Expected Outcome: Backend service ready to accept and store document metadata

3. **Implement Dimension Generator Updates (STEP 3)**
   - File: `src/lib/dimension-generation/generator.ts`
   - Action: Follow specification in `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_document_module_v2.md` STEP 3
   - Updates needed:
     * Add author name resolution (lookup author_id → human name)
     * Map author name to dimensions during generation
   - Dependencies: Requires STEP 2 completion
   - Expected Outcome: Author names properly populated in dimensions table

4. **Implement Frontend Upload UI (NEW)**
   - File: TBD based on new specification
   - Action: Build the complete frontend upload interface per new spec from Step 1
   - Dependencies: Requires Step 1 (specification) and Step 2 (backend update)
   - Expected Outcome: Users can upload documents with metadata through UI

5. **End-to-End Testing**
   - Action: Test complete upload workflow
   - Test cases:
     * Upload document with all metadata fields
     * Upload document with partial metadata
     * Verify metadata saves to database
     * Generate dimensions and verify all 5 fields populate
   - Dependencies: Requires Steps 2, 3, and 4 completion
   - Expected Outcome: Complete upload-to-dimensions pipeline working

### Important Files

**Backend Service (Currently Exists):**
- `src/lib/database.ts`
  - Lines 395+ contain fileService.uploadDocument()
  - Current state: Basic upload, needs metadata parameter expansion
  - Role: Core upload service that needs enhancement

**Dimension Generator (Needs Update):**
- `src/lib/dimension-generation/generator.ts`
  - Function: generateDimensionsForChunk() around line 131
  - Current state: Working for AI dimensions, needs author name resolution
  - Role: Populates dimension records during chunk processing

**Chunk Service (Recently Fixed):**
- `src/lib/chunk-service.ts`
  - Lines 158-175: promptTemplateService.getActiveTemplates()
  - Current state: Just fixed NULL handling bug for training_pair_generation
  - Role: Template retrieval for dimension generation

### Important Scripts, Markdown Files, and Specifications

**Primary Specification (Backend Focus):**
- `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_document_module_v2.md`
  - Purpose: Backend service and dimension generator updates
  - Key sections: STEP 2 (backend), STEP 3 (dimension generator)
  - Current state: Ready to execute for backend, but incomplete (missing frontend spec)
  - Critical gap: Does NOT include frontend UI implementation

**Completed Specification (Reference):**
- `pmc/context-ai/pmct/_archive/c-alpha-build-spec_v3.3_quick-wins-log-api_v3.md`
  - Purpose: Just completed - fixed 9 dimensions + API logging
  - Status: ✅ Fully implemented and deployed
  - Relevance: Provides context on recent dimension system changes

**Dimension Metadata Reference:**
- `src/lib/dimension-metadata.ts`
  - Purpose: Complete dimension field definitions and metadata
  - Key info: Shows all 60 dimensions including the 5 "Prior Generated" ones
  - Use: Reference for understanding dimension types and requirements

### Recent Development Context

- **Last Milestone**: Quick Wins Implementation (9 Dimensions Fixed)
  - Fixed Training Pair Generation template retrieval bug (NULL handling in .or() query)
  - Added labeling metadata (4 fields)
  - Added training split assignment (1 field)
  - Implemented API logging system for Claude responses
  - All changes tested and deployed to Vercel

- **Key Outcomes**: 
  - Template filtering now correctly handles NULL applicable_chunk_types
  - Training pair dimensions (prompt_candidate, target_answer, style_directives) now populate
  - API responses logged to `system/api-logs/` for debugging
  - 54 of 60 dimensions now working (6 remaining: 5 document metadata + 1 chunk_type display)

- **Relevant Learnings**:
  - Supabase PostgREST .contains() operator doesn't match NULL values
  - Need .or() with .is.null for "applies to all" semantics
  - Template retrieval logic is critical - if template not fetched, fields stay NULL
  - Dimension generation has 3 types: Prior Generated (upload time), Mechanical (system), AI Generated (Claude)

- **Technical Context**:
  - Backend service pattern established in `src/lib/database.ts`
  - Dimension generation orchestrated in `src/lib/dimension-generation/generator.ts`
  - Template filtering centralized in `src/lib/chunk-service.ts`
  - API logging writes JSON files to `system/api-logs/[timestamp]_[template_type].json`
  - App deployed and running on Vercel with latest fixes

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
