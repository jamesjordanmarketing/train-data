# Development Context & Operational Priorities
**Date:** 2025-10-11 15:17 PST
**Project:** Chunks Alpha - Document Categorization & Chunk Dimension Testing Platform
**Context Version:** 4.0.0

## Introduction

This context document addresses the Chunks Alpha project, a document categorization and chunk dimension testing platform built with Next.js 14, TypeScript, and Supabase. The platform consists of three main modules:

1. **Document Categorization Workflow** - A 3-step guided workflow for categorizing business documents
2. **Document Upload & Processing Module** - Handles file uploads and text extraction from multiple formats
3. **Chunk Dimension Testing System** - Extracts document chunks and generates 60+ AI metadata dimensions

The current session has successfully deployed upload error handling improvements to Vercel. However, two critical issues have emerged that require immediate attention before proceeding with UI redesign work.

## Current Focus

### Active Development Focus

**Primary Objective**: Fix critical bugs blocking document management and dimension generation functionality

**Current State**:
- Codebase deployed to Vercel (deployment ID: `dpl_6z4QNL9QjxQq2GT5mRdZuQpHgcXH`)
- Upload error handling improvements committed (commits `37616f4` and `7f9a0a1`)
- Application is functional but has two blocking issues

**What is Being Worked On**:

1. **Chunk Dimensions Not Populating** (CRITICAL)
   - **Issue**: Dimensions are not being generated or displayed on the chunks screen
   - **Root Cause Analysis**: AI response parser in `src/lib/chunk-extraction/ai-chunker.ts` is failing to parse markdown-wrapped JSON responses from Claude
   - **Attempted Fixes**:
     - Fix #1: Added markdown code fence detection (lines 169-174 in ai-chunker.ts) - COMMITTED but NOT DEPLOYED
     - Fix #2: Improved error logging - COMMITTED but NOT DEPLOYED
   - **Current Blocker**: Latest code with fixes is committed to git but Vercel has not picked up the deployment. Deployment ID `dpl_6z4QNL9QjxQq2GT5mRdZuQpHgcXH` is running old code
   - **Evidence**: System logs show `"No JSON array found in AI response"` error, but local code has the fix

2. **Cannot Delete Documents from Upload Page** (CRITICAL)
   - **Issue**: Delete operation fails with foreign key constraint violation
   - **Error Message**: `update or delete on table "documents" violates foreign key "workflow_sessions_document_id_fkey" on table "workflow_sessions"`
   - **Root Cause**: Database foreign key constraint prevents deletion when workflow sessions reference the document
   - **Impact**: Users cannot remove unwanted or test documents
   - **Fix Needed**: Implement cascade delete or orphan workflow sessions before document deletion

**Why This is Being Worked On**:
- These bugs are blocking core functionality (dimension testing and document management)
- Must be fixed before proceeding with UI redesign work
- Dimension generation is the primary value proposition of the platform

**Critical Context for Continuation**:
- Upload error handling improvements (retry mechanism, stuck document detection) are working correctly
- Chunk extraction markdown parsing fix exists in code but needs fresh Vercel deployment
- Database schema has foreign key constraints that need careful handling for deletes
- UI redesign must wait until these functional issues are resolved

### Bugs & Challenges in the Current Task

#### Bug #1: Chunk Dimensions Not Populating
- **Description**: AI-generated dimension data is not being extracted or displayed
- **Status**: Fix implemented in code but not deployed to Vercel
- **Attempted Solutions**:
  1. Added markdown JSON parser to handle ` ```json [...] ``` ` wrapped responses (commit `37616f4`)
  2. Enhanced error logging to track parsing failures
- **Blocking Factors**:
  - Vercel deployment has not picked up latest commits
  - Need to trigger new deployment or verify auto-deploy is working
- **Log Evidence**:
  - `logs_result_9.json` shows: `"Failed to parse extraction response: Error: No JSON array found in response"`
  - `logs_result-10.json` shows same error on deployment `dpl_6z4QNL9QjxQq2GT5mRdZuQpHgcXH`
- **Files Involved**:
  - `src/lib/chunk-extraction/ai-chunker.ts` (lines 164-184)

#### Bug #2: Document Deletion Foreign Key Violation
- **Description**: Cannot delete documents due to foreign key constraint with workflow_sessions table
- **Status**: Not yet addressed, needs investigation and fix
- **Error**: `update or delete on table "documents" violates foreign key "workflow_sessions_document_id_fkey" on table "workflow_sessions"`
- **Impact**: Users stuck with test/unwanted documents they cannot remove
- **Potential Solutions**:
  1. Add cascade delete to foreign key constraint in Supabase
  2. Implement pre-delete check to remove/orphan workflow sessions first
  3. Add soft delete (status flag) instead of hard delete
- **Files to Check**:
  - Database schema/migrations
  - `src/components/upload/upload-queue.tsx` (handleDelete function, line 264)
  - `src/lib/database.ts` (document service methods)

### Next Steps

1. **Verify and Trigger Vercel Deployment**
   - Check if commits `37616f4` (chunk fix) and `7f9a0a1` (upload fix) are deployed
   - If not deployed, trigger manual deployment in Vercel dashboard
   - Verify deployment includes the markdown JSON parser fix
   - Test dimension generation on deployed environment
   - **Expected Outcome**: Dimensions populate correctly on chunks screen
       - **Test Result**: This is now working. Dimensions are being populated.

2. **Fix Document Deletion Foreign Key Issue**
   - Investigate database schema for `workflow_sessions` table foreign key
   - Determine best approach: cascade delete, pre-delete cleanup, or soft delete
   - Implement solution in both database schema and application code
   - Test delete functionality on documents with and without workflow sessions
   - **Expected Outcome**: Documents can be deleted without constraint violations
    - **Test Result**: This is now working. Documents can be deleted correctly.

3. **Validate Both Fixes in Production**
   - Upload test document and verify text extraction works
   - Generate chunks and verify dimensions populate
   - Test document deletion for various document states
   - Check error handling and user feedback
   - **Expected Outcome**: All core document management features working

4. **Write Detailed Specification for UI Redesign**
   - Study wireframe design in `chunks-alpha-dashboard/` (Vite application)
   - Document UI patterns, components, and interactions
   - Map wireframe components to Next.js 14 equivalents
   - Create implementation plan for UI migration
   - **Expected Outcome**: Clear spec for next coding session

5. **Begin UI Redesign Implementation**
   - Only proceed after bugs #1 and #2 are resolved
   - Replicate wireframe design patterns in Next.js 14
   - Maintain existing functionality while updating UI
   - Focus on document upload/management components first
   - **Expected Outcome**: Modern UI matching wireframe design

### Important Files

#### Active Bug Fix Files
1. **src/lib/chunk-extraction/ai-chunker.ts**
   - Purpose: AI-powered chunk extraction and JSON parsing
   - Current State: Contains markdown JSON parser fix (lines 169-174)
   - Relevance: Bug #1 fix is here, needs deployment verification

2. **src/components/upload/upload-queue.tsx**
   - Purpose: Document list display and management actions
   - Current State: Delete handler exists (line 264) but fails on FK constraint
   - Relevance: Bug #2 - needs updated delete logic

3. **src/lib/database.ts**
   - Purpose: Database service layer for all CRUD operations
   - Current State: Contains documentService and workflowService
   - Relevance: Bug #2 - may need updates to handle workflow session cleanup

#### System Log Files
4. **system/chunks-alpha-data/logs_result_9.json**
   - Purpose: Production error logs from first dimension generation attempt
   - Relevance: Shows original parsing failure before fix

5. **system/chunks-alpha-data/logs_result-10.json**
   - Purpose: Production error logs after code commit but before deployment
   - Relevance: Confirms fix not yet deployed (same error persists)

#### Reference Codebase for UI Redesign
6. **chunks-alpha-dashboard/** (entire directory)
   - Purpose: Vite-based wireframe/reference implementation
   - Relevance: UI design patterns to replicate in Next.js 14
   - Note: Do NOT run or modify - study only for design patterns

### Important Scripts, Markdown Files, and Specifications

1. **pmc/context-ai/pmct/c-alpha-build-spec_v3.3_document_module-full-spec_v1-COMPLETE.md**
   - Purpose: Complete specification for document upload module
   - Key Sections: Database schema, API endpoints, error handling
   - Relevance: Reference for understanding document/workflow relationships

2. **CLAUDE.md**
   - Purpose: Project overview and development guidelines
   - Key Sections: Database schema, service architecture, error handling patterns
   - Relevance: Reference for codebase conventions and patterns

3. **src/README.md**
   - Purpose: Main application feature documentation
   - Relevance: Understanding current feature set before UI changes

### Recent Development Context

- **Last Milestone**: Implemented comprehensive upload error handling with retry mechanism
  - Added `triggerProcessingWithRetry()` function with exponential backoff
  - Implemented stuck document detection (>2 minutes in "uploaded" status)
  - Enhanced error classification and user-facing error messages
  - Updated upload queue UI to show warnings for stuck documents

- **Key Outcomes**:
  - Upload reliability significantly improved with 3-attempt retry logic
  - Users now see actionable error messages instead of silent failures
  - Stuck documents are visually flagged and can be manually retried
  - All upload changes committed (commit `7f9a0a1`) and pushed

- **Relevant Learnings**:
  - Claude AI responses often come wrapped in markdown code fences (` ```json ``` `) despite prompt instructions
  - Parser needs to handle both bare JSON and markdown-wrapped JSON
  - Foreign key constraints in Supabase require careful cascade handling
  - Vercel deployments don't always auto-trigger on git push

- **Technical Context**:
  - Database has RLS (Row Level Security) enabled for multi-tenant isolation
  - Chunk extraction uses Claude API (Anthropic SDK)
  - Text extraction supports: PDF, DOCX, HTML, TXT, MD, RTF
  - Status polling happens every 2 seconds on client side

## Project Reference Guide
REFERENCE MATERIALS
Everything below this line is supporting information only. Do NOT select the current task focus from this section.

### Chunks Alpha Platform Architecture

#### Core Technologies
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL with RLS)
- **Storage**: Supabase Storage for document files
- **State Management**: Zustand with persistence
- **UI Components**: Radix UI (shadcn/ui) + Tailwind CSS
- **AI Provider**: Anthropic Claude (via @anthropic-ai/sdk)

#### Database Schema Overview
- **documents**: Document storage with metadata and extracted content
- **workflow_sessions**: User workflow progress with draft capability
- **chunks**: Document chunks with position/token info
- **chunk_dimensions**: AI-generated 60+ dimension metadata per chunk
- **chunk_runs**: Batch processing runs with cost/performance tracking
- **categories**: 11 primary business categories
- **tags**: Multi-dimensional secondary tagging system
- **custom_tags**: User-created custom tags

#### Key Service Patterns
All database operations use consistent service layer in `src/lib/database.ts`:
- `documentService` - Document CRUD operations
- `workflowService` - Workflow session management
- `chunkService` - Chunk CRUD and document operations
- `chunkDimensionService` - AI dimension storage/retrieval
- `categoryService` - Category queries
- `tagService` - Tag and dimension queries

#### Development Commands
```bash
# Main application (from src/ directory)
npm run dev    # Development server on http://localhost:3000
npm run build  # Production build
npm run lint   # Next.js linter
```

#### Key Documentation
1. Seed Story: `pmc/product/00-bmo-seed-story.md`
2. Project Overview: `pmc/product/01-bmo-overview.md`
3. Phase 1 Overview: `PHASE-1-README.md`
4. Implementation Spec: `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_document_module-full-spec_v1-COMPLETE.md`
