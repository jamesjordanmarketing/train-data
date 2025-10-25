# Development Context & Operational Priorities
**Date:** 2025-10-06 14:56 PST
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

**Task:** Debugging and fixing Chunks Alpha Module chunk extraction and dimension generation bugs in production

**Module Context:**
The Chunks Alpha Module is a critical component of the Bright Run LoRA Training Data Platform that transforms documents into structured training data. It consists of two main phases:
1. **Chunk Extraction**: AI-powered identification and extraction of 4 chunk types (Chapter_Sequential, Instructional_Unit, CER, Example_Scenario) with limits (15/5/10/5 per type)
2. **Dimension Generation**: Claude Sonnet 4.5 analyzes each chunk to generate 60+ metadata dimensions across 5 categories (content analysis, task extraction, CER analysis, scenario extraction, risk assessment)

**Current State:**
The module was deployed to production but is experiencing critical bugs:
- Only extracting 1 tiny chunk (59 characters) instead of 12-35 chunks
- Missing page numbers (showing as null)
- JSON parsing errors in dimension generation
- Document content may not be properly seeded in test database

**Why This Matters:**
This module is the core value proposition - without proper chunk extraction and dimension generation, users cannot create training datasets. The bugs block all downstream functionality and make the product unusable.

**Implementation Location:** `src/lib/chunk-extraction/` and `src/lib/dimension-generation/`

Do not deviate from this focus without explicit instruction.
All other information in this document is reference material only.

### Bugs & Challenges in the Current Task

**Bug #1: Only 1 Tiny Chunk Extracted** ✅ FIXED
- **Issue**: Claude API returning only 1 chunk with 59 characters instead of 12-35 chunks
- **Root Cause**: Prompt was not explicit enough about returning multiple chunks
- **Solution**: Rewrote extraction prompt with explicit instructions:
  - "You MUST return MULTIPLE chunks (typically 12-35 chunks total)"
  - "Return at least 10-20 chunks for a typical document"
  - "Each distinct section should be its own chunk"
  - Added validation checklist
- **Status**: Code updated, awaiting production testing
- **Files Modified**: `src/lib/chunk-extraction/ai-chunker.ts` (lines 105-161)

**Bug #2: Missing Page Numbers** ✅ FIXED
- **Issue**: All chunks showing `page_start: null, page_end: null`
- **Root Cause**: Page calculation was hardcoded with TODO comment
- **Solution**: Implemented automatic page calculation: `pageNumber = floor(charPosition / 2500) + 1`
- **Status**: Code updated, awaiting production testing
- **Files Modified**: `src/lib/chunk-extraction/extractor.ts` (lines 83-118)

**Bug #3: JSON Parsing Errors** ✅ FIXED
- **Issue**: `Unexpected token '`', "```json\n{\n"... is not valid JSON`
- **Root Cause**: Claude wrapping JSON responses in markdown code blocks (` ```json ... ``` `)
- **Solution**: Strip markdown before parsing: `responseText.replace(/^```json\s*\n?/i, '').replace(/\n?```\s*$/,'').trim()`
- **Status**: Code updated, awaiting production testing  
- **Files Modified**: `src/lib/dimension-generation/generator.ts` (lines 254-270)

**Bug #4: Document Content Not Seeded** 🔴 ACTIVE ISSUE
- **Issue**: Test document may not be properly seeded in production database
- **Root Cause**: Unknown - needs verification
- **Impact**: If document content is empty or missing, chunk extraction will fail regardless of code fixes
- **Required Action**: Verify document ID `550e8400-e29b-41d4-a716-446655440025` exists in production database with full content
- **Status**: REQUIRES IMMEDIATE VERIFICATION

### Next Steps

1. **Verify Test Document in Database** (PRIORITY 1)
   - **Action**: Query production Supabase database for document ID `550e8400-e29b-41d4-a716-446655440025`
   - **Validation**: Confirm document exists with:
     - Non-empty `content` field (should be ~800-1000 characters about 7-step onboarding)
     - `title`: "Complete Customer Onboarding System Blueprint" (or similar)
     - `status`: "completed" or "pending"
   - **If Missing**: Run seed script `seed-test-document.sql` in Supabase SQL Editor
   - **Expected Outcome**: Document exists with full content, ready for chunk extraction testing

2. **Test Chunk Extraction After Fixes** (PRIORITY 2)
   - **Action**: Click "Start Chunking" on document 1 in production dashboard
   - **Validation**: Check that extraction now produces:
     - Multiple chunks (expected: 7-15 chunks for the test document)
     - Proper page numbers (not null)
     - Character ranges that cover the document
     - No JSON parsing errors in logs
   - **Dependencies**: Requires #1 completed and Vercel deployment of latest code
   - **Expected Outcome**: 7-15 chunks extracted with proper metadata

3. **Review Vercel Logs for Debug Output** (PRIORITY 3)
   - **Action**: Check Vercel function logs for console.log output from chunk extraction
   - **Look For**:
     - "Starting chunk extraction for document: [title]"
     - "Document length: [X] characters"
     - "Detected [Y] sections, [Z] tokens"
     - "Parsed [M] chunk candidates from AI response"
   - **Expected Outcome**: Logs reveal whether Claude is returning multiple chunks or if there's still an issue

4. **Validate Dimension Generation** (PRIORITY 4)
   - **Action**: After successful chunk extraction, verify dimensions are generated without errors
   - **Validation**: Check that all chunks have:
     - Document metadata populated (doc_title, author, doc_date, primary_category)
     - AI dimensions generated (chunk_summary, key_terms, etc.)
     - No JSON parsing errors
     - Confidence scores calculated
   - **Expected Outcome**: All 60+ dimensions populated for each chunk

5. **Test Full E2E Workflow** (PRIORITY 5)
   - **Action**: Complete full workflow from document upload through dimension export
   - **Validation**: Execute test workflow from `test-workflow.md` (58 checkpoints)
   - **Expected Outcome**: All phases work without errors, producing exportable training data

### Important Files

1. **`src/lib/chunk-extraction/ai-chunker.ts`**
   - Role: Core chunk extraction logic using Claude API
   - Status: MODIFIED - Improved prompt with explicit multi-chunk instructions and added debug logging
   - Key Changes: Lines 28-62 (debug logs), 105-161 (new prompt)

2. **`src/lib/chunk-extraction/extractor.ts`**
   - Role: Orchestrates chunk extraction workflow, creates chunk records
   - Status: MODIFIED - Added page number calculation and overlap token tracking
   - Key Changes: Lines 83-118 (page calculation logic)

3. **`src/lib/dimension-generation/generator.ts`**
   - Role: Generates 60+ AI dimensions using Claude, manages batch processing
   - Status: MODIFIED - Fixed JSON parsing to strip markdown code blocks, added document metadata retrieval
   - Key Changes: Lines 69-180 (metadata integration), 254-270 (JSON parsing fix)

4. **`src/lib/chunk-service.ts`**
   - Role: Database operations for chunks, dimensions, runs
   - Status: MODIFIED - Added `getDocumentById()` method
   - Key Changes: Lines 63-72 (new method for document metadata retrieval)

5. **`seed-test-document.sql`**
   - Role: SQL script to seed test document in production database
   - Status: UNMODIFIED - Ready to run if document verification fails
   - Key Content: Inserts document with ID `doc-1` or `550e8400-e29b-41d4-a716-446655440025`

6. **`test-workflow.md`**
   - Role: Comprehensive E2E test script with 58 checkpoints
   - Status: UNMODIFIED - Reference for post-fix validation
   - Key Sections: Phases 1-10 covering extraction, generation, dashboard, spreadsheet, run comparison

### Important Scripts, Markdown Files, and Specifications

1. **`pmc/context-ai/pmct/c-alpha-build-spec_v3.3-build-update_v1.md`**
   - Role: Complete technical specification for Chunks Alpha Module
   - Key Sections:
     - Lines 54-98: Chunk types and extraction limits
     - Lines 207-446: Database schema (5 tables)
     - Lines 449-486: Technology stack and AI configuration
     - Lines 834-1051: API endpoints documentation
   - Purpose: Reference for understanding module architecture and expected behavior

2. **`pmc/context-ai/pmct/c-alpha-build-errors_v1.md`**
   - Role: Production error logs from failed chunk extraction
   - Key Findings:
     - "Chunk 1 too small (59 chars)" - Only 1 chunk extracted
     - JSON parsing errors - Claude wrapping responses in markdown
     - Document ID: `550e8400-e29b-41d4-a716-446655440025`
   - Purpose: Source of truth for bugs being fixed

3. **`seed-test-document.sql`**
   - Role: Database seeding script for test document
   - Key Content:
     - Document ID: `doc-1`
     - Title: "Complete Customer Onboarding System Blueprint"
     - Content: 7-step onboarding methodology (~800 chars)
   - Purpose: Run this if document verification (#1 in Next Steps) fails

### Recent Development Context

- **Last Milestone**: Deployed Chunks Alpha Module to production (Phases 1-5 complete)
- **Key Outcomes**: 
  - All database tables created and functional
  - Chunk extraction and dimension generation code deployed
  - Dashboard and spreadsheet UI working
  - Run management and comparison features implemented
- **Relevant Learnings**:
  - Claude requires very explicit instructions about returning multiple results
  - Claude often wraps JSON in markdown code blocks - must strip before parsing
  - Page numbers need calculation from character positions (~2500 chars/page)
  - Document metadata must be pulled from database for "previously generated dimensions"
- **Technical Context**:
  - Model: `claude-sonnet-4-5-20250929` (recently corrected from incorrect name)
  - Batch size: 3 chunks processed in parallel
  - Extraction limits: 15/5/10/5 for Chapter/Instructional/CER/Example chunks
  - Cost: ~$0.05-0.12 per document
  - All changes pushed to Git, awaiting Vercel deployment

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
