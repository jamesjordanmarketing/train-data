# Development Context & Operational Priorities
**Date:** 2025-10-06 17:50 PST
**Project:** Bright Run LoRA Training Data Platform (bmo) - Chunks Alpha Module
**Context Version:** 3.1.0

## Introduction

### Project Overview

**Bright Run LoRA Training Data Platform** is a revolutionary LoRA fine-tuning training data platform that transforms unstructured business knowledge into high-quality training datasets through an intuitive 6-stage workflow. The platform enables non-technical domain experts to convert their proprietary knowledge—transcripts, documents, and expertise—into thousands of semantically diverse training pairs suitable for LoRA model fine-tuning.

### What Problem Does This Product Solve?

Small business owners and domain experts possess invaluable proprietary knowledge—from marketing philosophies to operational processes—but face insurmountable barriers in transforming this knowledge into LoRA ready training data. This platform democratizes the creation of custom training datasets.

### Chunks Alpha Module

The Chunks Alpha Module is the second major component in the training data pipeline (following the Document Categorization Module). It performs two critical functions:

1. **Chunk Extraction**: AI-powered identification and extraction of 4 chunk types from categorized documents
2. **Dimension Generation**: Claude Sonnet 4.5 generates 60+ metadata dimensions for each chunk to create rich, analyzable training data

The module is built with Next.js 14 (App Router), TypeScript, Supabase PostgreSQL, and Anthropic Claude API.

---

## Current Focus

### Active Development Focus

**Task:** Expand the Dimensions Spreadsheet to display ALL 61 dimensions in a comprehensive, metadata-rich format per the new specification

**Current State:** 
The Chunks Alpha Module has successfully completed its initial implementation and testing:
- ✅ Chunk extraction is working (extracting 7-15 chunks from test documents)
- ✅ Dimension generation is working (generating 60+ dimensions per chunk via Claude API)
- ✅ Basic spreadsheet view exists at `src/components/chunks/ChunkSpreadsheet.tsx`
- ✅ Test results show dimensions are being generated (see `pmc/context-ai/pmct/c-alpha-build-results_v1.md`)

**Why This Matters:**
The current spreadsheet implementation only displays a SUBSET of dimensions in preset views. The user needs to see ALL 61 dimensions in a comprehensive, metadata-enriched format to:
1. Validate that all dimensions are being generated correctly
2. Understand dimension metadata (type, generation method, confidence levels, descriptions)
3. Analyze dimension quality across multiple runs
4. Compare dimension values between different generation runs
5. Make informed decisions about prompt engineering improvements

**Implementation Location:** 
- Primary file: `src/components/chunks/ChunkSpreadsheet.tsx`
- Page: `src/app/chunks/[documentId]/spreadsheet/[chunkId]/page.tsx`
- Supporting types: `src/types/chunks.ts`

**What Needs to Change:**
The spreadsheet must be transformed from a "run-based rows with dimension columns" layout to a "dimension-based rows with metadata columns" layout. Each dimension should be a row with these columns:
1. **Dimension Name** - The field name (e.g., "chunk_summary_1s", "key_terms", etc.)
2. **Generated Value** - The actual value for this dimension from the selected run
3. **What Generated** - Type indicator (AI Generated, Mechanically Generated, Prior Generated)
4. **Precision Confidence** - Confidence level for precision (1-10)
5. **Accuracy Confidence** - Confidence level for accuracy (1-10)
6. **Description** - Human-readable description of what this dimension represents
7. **Type** - Data type (string, array, number, boolean, etc.)
8. **Allowed Values/Format** - Validation rules or format specification

Do not deviate from this focus without explicit instruction.
All other information in this document is reference material only.

---

### Next Steps

**Priority 1: Read and Understand the Complete Specification**
- **File:** `pmc/context-ai/pmct/chunks-details-sheet_v1.md`
- **Action:** Read this specification VERY carefully - it contains the complete requirements for the new spreadsheet layout
- **Expected Outcome:** Full understanding of the dimension metadata structure and display requirements
- **Dependencies:** This is the source of truth for all requirements

**Priority 2: Analyze Current Implementation**
- **Files:** 
  - `src/components/chunks/ChunkSpreadsheet.tsx` (current implementation)
  - `src/types/chunks.ts` (type definitions)
  - `src/app/chunks/[documentId]/spreadsheet/[chunkId]/page.tsx` (page wrapper)
- **Action:** Understand current data structures, API calls, and rendering logic
- **Expected Outcome:** Clear understanding of what needs to be preserved vs. changed

**Priority 3: Design Dimension Metadata Schema**
- **Action:** Create or verify database schema for dimension metadata (descriptions, types, allowed values, generation methods)
- **Consideration:** The spec mentions "We can create a 'display' database table that can join all of the data" - evaluate if this is needed
- **Expected Outcome:** Decision on whether to add dimension_metadata table or use client-side metadata definitions

**Priority 4: Implement New Spreadsheet Layout**
- **Action:** Transform spreadsheet from "dimension-as-columns" to "dimension-as-rows" with metadata columns
- **Key Requirements:**
  - ALL 61 dimensions must be displayed as rows
  - Each dimension row must show: Name, Value, Generation Type, Precision/Accuracy Confidence, Description, Type, Format
  - Must support horizontal column resizing
  - Must support sorting by any column
  - Must support filtering by any column value
  - Must maintain run comparison functionality (show historical runs for the same chunk)
- **Expected Outcome:** Comprehensive dimension spreadsheet matching the specification

**Priority 5: Verify All 61 Dimensions Are Listed**
- **Action:** Cross-reference with database schema and ensure complete dimension coverage
- **Files:** Check `pmc/context-ai/pmct/c-alpha-build-spec_v3.3-build-update_v1.md` lines 207-446 for full dimension list
- **Expected Outcome:** Confirmation that all dimensions from the specification are displayed

---

### Important Files

**1. `pmc/context-ai/pmct/chunks-details-sheet_v1.md`**
- **Role:** CRITICAL - Complete specification for the new spreadsheet layout
- **Purpose:** Source of truth for all requirements including column headers, layout, functionality
- **Key Requirements:**
  - Dimension names in first fixed column
  - All 61 dimensions must be listed as rows
  - Column headers: Dimension Name, Generated Value, What Generated TYPE, Precision Confidence, Accuracy Confidence, Description, Type, Allowed_Values_Format
  - Must support horizontal column width resizing
  - Must be sortable and filterable by column values
  - Run comparison at per-chunk level

**2. `src/components/chunks/ChunkSpreadsheet.tsx`**
- **Role:** Current spreadsheet component implementation
- **State:** NEEDS MAJOR REFACTORING - Currently displays dimensions as columns, needs to display as rows
- **Current Features:** Preset views, sorting, filtering, export functionality
- **Lines 35-64:** Dimension field definitions (incomplete - only shows ~20 dimensions)
- **Lines 245-289:** Current table rendering logic (will need complete restructuring)

**3. `src/types/chunks.ts`**
- **Role:** TypeScript type definitions for Chunk and ChunkDimensions
- **State:** May need updates to support dimension metadata structure
- **Expected Changes:** Add DimensionMetadata type if using client-side metadata

**4. `src/app/chunks/[documentId]/spreadsheet/[chunkId]/page.tsx`**
- **Role:** Page wrapper for spreadsheet component
- **State:** STABLE - Should only need minor updates for new props/state
- **Lines 45-49:** Fetches dimensions for chunk via API
- **Lines 51-55:** Fetches runs for run comparison

**5. `pmc/context-ai/pmct/c-alpha-build-spec_v3.3-build-update_v1.md`**
- **Role:** Complete technical specification for Chunks Alpha Module
- **Purpose:** Reference for understanding full system architecture, database schema, and dimension definitions
- **Lines 54-98:** Chunk types and extraction limits
- **Lines 207-446:** Complete database schema with all 5 tables and dimension field definitions
- **Lines 834-1051:** API endpoints documentation

**6. `src/lib/database/chunk-dimension-service.ts`**
- **Role:** Database service for dimension CRUD operations
- **State:** Should be stable - verify it returns all dimension fields
- **Purpose:** Ensure API returns complete dimension data

**7. `src/app/api/chunks/dimensions/route.ts`**
- **Role:** API endpoint for fetching chunk dimensions
- **State:** Should be stable - verify it returns complete data
- **Purpose:** Ensure complete dimension data is available to frontend

---

### Important Scripts, Markdown Files, and Specifications

**1. `pmc/product/01-bmo-overview-chunk-alpha_v1.md`**
- **Purpose:** Original high-level requirements document for Chunks Alpha Module
- **Key Sections:**
  - Lines 19-46: Dimension ontology and meta-dimensions rationale
  - Lines 64-94: Chunk type definitions and extraction rules
  - Lines 114-124: Spreadsheet requirements (original requirements that led to current spec)
- **Note:** This led to the more detailed spec in `chunks-details-sheet_v1.md`

**2. `pmc/context-ai/pmct/c-alpha-build-results_v1.md`**
- **Purpose:** Test results from recent successful chunk extraction and dimension generation
- **Content:** CSV output showing sample dimensions that were generated
- **Key Finding:** Dimensions ARE being generated successfully (precision: 10, accuracy: 10, cost: $0.0054, duration: 7547ms)
- **Validation:** Confirms the backend is working and generating dimension data

**3. `pmc/product/01-bmo-overview.md`**
- **Purpose:** Complete pipeline overview for entire Bright Run platform
- **Relevance:** Shows how Chunks Alpha Module fits into larger 6-stage workflow
- **Context:** Chunks Alpha is Stage 2 (after Document Categorization, before Pairing Generation)

---

### Recent Development Context

**Last Milestone:** Successfully debugged and deployed working chunk extraction and dimension generation pipeline

**Key Outcomes:**
1. Fixed chunk extraction bugs:
   - Improved AI prompt to explicitly request multiple chunks (12-35 per document)
   - Implemented automatic page number calculation based on character positions
   - Fixed JSON parsing to strip markdown code blocks from Claude responses
2. Seeded proper test documents with sufficient content (800-1000 characters)
3. Deployed fixes to Vercel production
4. Verified chunk extraction working (test generated chunks successfully)
5. Verified dimension generation working (60+ dimensions generated per chunk)

**Relevant Learnings:**
1. Claude requires VERY explicit instructions about returning multiple results in arrays
2. Claude often wraps JSON responses in markdown code blocks (` ```json ... ``` `) - must strip before parsing
3. Document content length is critical - need 800+ characters for meaningful chunk extraction
4. Page numbers calculated as: `floor(charPosition / 2500) + 1`
5. All code changes MUST be committed and pushed to Git to trigger Vercel deployment

**Technical Context:**
- Model: `claude-sonnet-4-5-20250929` (Anthropic API)
- Temperature: 0.3 for extraction, 0.5 for dimension generation
- Batch size: 3 chunks processed in parallel for efficiency
- Extraction limits: 15/5/10/5 for Chapter/Instructional/CER/Example chunk types
- Cost per document: ~$0.05-0.12 for full extraction + dimension generation
- Production URL: https://chunks-alpha.vercel.app
- Database: Supabase PostgreSQL with 5 normalized tables

**Current Production State:**
- Chunk extraction API: `POST /api/chunks/extract` - Working ✅
- Dimension generation: Automatic after extraction - Working ✅
- Dashboard display: `GET /chunks/[documentId]` - Working ✅
- Spreadsheet view: `GET /chunks/[documentId]/spreadsheet/[chunkId]` - Needs expansion 🔄

---

## Project Reference Guide
REFERENCE MATERIALS
Everything below this line is supporting information only. Do NOT select the current task focus from this section.

### Database Schema Summary

**5 Core Tables:**
1. **chunks** - Extracted chunk records with mechanical metadata (chunk_id, document_id, chunk_type, page ranges, char ranges, token counts)
2. **chunk_dimensions** - AI-generated dimension values (60+ fields across 5 categories: content, task, CER, scenario, risk)
3. **chunk_runs** - Run metadata for dimension generation (run_id, cost, duration, status)
4. **chunk_extraction_jobs** - Job tracking for extraction workflow (status, progress, errors)
5. **prompt_templates** - Reusable AI prompt templates by chunk type

### API Endpoints Summary

**Extraction:**
- `POST /api/chunks/extract` - Extract chunks and generate dimensions (automatic)
- `GET /api/chunks/status?jobId=X` - Check extraction job status

**Data Retrieval:**
- `GET /api/chunks?documentId=X` - Get all chunks for document
- `GET /api/chunks/dimensions?chunkId=X` - Get dimensions for specific chunk
- `GET /api/chunks/runs?documentId=X` - Get all runs for document

**Regeneration:**
- `POST /api/chunks/regenerate` - Regenerate dimensions for specific chunks/templates
- `GET /api/chunks/templates` - Get available prompt templates

### Key Documents for Reference

1. **Product Overview:** `pmc/product/01-bmo-overview.md`
2. **Module Specification:** `pmc/context-ai/pmct/c-alpha-build-spec_v3.3-build-update_v1.md`
3. **Spreadsheet Spec:** `pmc/context-ai/pmct/chunks-details-sheet_v1.md` (CRITICAL for current task)
4. **Test Results:** `pmc/context-ai/pmct/c-alpha-build-results_v1.md`

### Development Guidelines

**Build Philosophy:**
1. Make as few prompts as possible to complete features
2. Each prompt should "finish" a complete feature/module/page
3. Keep changes modular to avoid fragmentation
4. Always commit and push changes to trigger deployment
5. Validate with real data before marking complete

**Testing Requirements:**
1. Test with real documents (800+ characters)
2. Verify all 61 dimensions are displayed
3. Confirm sorting and filtering work on all columns
4. Validate run comparison functionality
5. Test horizontal column resizing
6. Verify export functionality still works

**Critical Success Criteria for This Task:**
1. ✅ ALL 61 dimensions displayed as rows (not columns)
2. ✅ Each dimension shows: Name, Value, Generation Type, Precision, Accuracy, Description, Type, Format
3. ✅ Horizontal column width is resizable
4. ✅ Sortable by any column
5. ✅ Filterable by any column value
6. ✅ Run comparison works (historical runs for same chunk)
7. ✅ Maintains current export functionality
