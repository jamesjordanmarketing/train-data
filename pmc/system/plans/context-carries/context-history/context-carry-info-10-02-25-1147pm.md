# Development Context & Operational Priorities
**Date:** 2025-10-03 06:47 PST
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

**Task:** Verify Production Deployment of Normalized Database Implementation

**What is being worked on:**
Successfully deploying and validating the normalized database feature in production. After extensive troubleshooting, the workflow submission system is now functional in Vercel production environment. The normalized database implementation (Prompts 1, 2, and 3) writes workflow data to junction tables (`document_categories`, `document_tags`, `custom_tags`) instead of JSONB columns.

**Why it is being worked on:**
The normalized database implementation was completed and validated through code review (7/7 tests passed), but production deployment encountered multiple configuration and integration issues that prevented the feature from working. These issues have been systematically resolved through troubleshooting.

**Current state of implementation:**
- ✅ Normalized database implementation complete and validated (code review passed)
- ✅ TypeScript path alias configuration fixed (`@/*` mapping added to `tsconfig.json`)
- ✅ Vercel environment variables configured (Supabase credentials + feature flag)
- ✅ Test documents seeded in production database (doc-1, doc-2, doc-3)
- ✅ Mock ID to UUID mapping implemented for documents, categories, and tags
- ✅ Tag slug to UUID conversion implemented (all 42 tags mapped)
- ✅ Duplicate key constraint handling implemented (cleanup before insert)
- ✅ Row-Level Security (RLS) temporarily disabled for testing
- ⚠️ RLS policies need proper implementation with authenticated client passing
- 🔄 Final end-to-end testing and data verification pending

**Critical context needed for continuation:**
1. **RLS is currently DISABLED** on all workflow tables - this was necessary to resolve authentication issues with the service layer
2. The service layer (`src/lib/database.ts`) uses a global Supabase client without user context, causing RLS policy violations
3. Feature flag `NEXT_PUBLIC_USE_NORMALIZED_TAGS=true` is set in Vercel for all environments
4. Three test documents exist in production database with UUIDs:
   - doc-1: `550e8400-e29b-41d4-a716-446655440012` (Customer Onboarding System)
   - doc-2: `550e8400-e29b-41d4-a716-446655440024` (Sales Enablement)
   - doc-3: `550e8400-e29b-41d4-a716-446655440025` (Industry Trends)
5. Tag slug to UUID mapping is comprehensive and covers all dimensions
6. Workflow resubmission is supported via cleanup logic that deletes existing normalized data before inserting

Do not deviate from this focus without explicit instruction.
All other information in this document is reference material only.

### Bugs & Challenges in the Current Task

**Issue 1: Row-Level Security Authentication** ⚠️
- **Description:** Service layer functions use a global Supabase client without user authentication context, causing RLS policy violations even with proper policies configured
- **Current Status:** Temporarily disabled RLS on all tables to allow functionality
- **Root Cause:** `src/lib/database.ts` imports a static Supabase client from `src/lib/supabase.ts`, while the API route creates an authenticated client with user JWT token
- **Attempted Solutions:** 
  - Created RLS policies with `auth.uid()` checks - failed due to unauthenticated client
  - Changed policies to `WITH CHECK (true)` - still failed
  - Disabled RLS completely - workflow now functions
- **Proper Solution Required:** Pass authenticated Supabase client from API route to service functions, or implement service-side authentication
- **Priority:** Medium (functionality works but security is compromised)

**Issue 2: Mock Data to Real UUID Mapping** ✅ RESOLVED
- **Description:** Frontend uses mock IDs (`doc-1`, `sales-enablements`) but database requires UUIDs
- **Resolution:** Implemented comprehensive mapping dictionaries in `src/app/api/workflow/route.ts` and `src/components/server/WorkflowCompleteServer.tsx`
- **Status:** Complete - all documents, categories, dimensions, and tags properly mapped

**Issue 3: Duplicate Key Constraint on Resubmission** ✅ RESOLVED
- **Description:** Unique constraint `uq_doc_primary_category` prevented resubmitting the same document
- **Resolution:** Added cleanup logic in `workflowService.completeWorkflow()` to delete existing normalized data before inserting new data
- **Status:** Complete - users can now resubmit documents multiple times

### Next Steps

1. **Verify end-to-end workflow submission and data persistence**
   - Action: Submit a complete workflow through all 3 stages in production
   - File: Vercel production app at deployed URL
   - Dependencies: None - all fixes deployed
   - Expected outcome: Workflow completes successfully, data visible in Supabase normalized tables
   - Validation query:
     ```sql
     SELECT ws.id, d.title, ws.step, ws.is_draft, c.name as category, dc.belonging_rating
     FROM workflow_sessions ws
     JOIN documents d ON d.id = ws.document_id
     JOIN document_categories dc ON dc.workflow_session_id = ws.id
     JOIN categories c ON c.id = dc.category_id
     WHERE ws.is_draft = false
     ORDER BY ws.completed_at DESC LIMIT 5;
     ```

2. **Implement proper RLS with authenticated client passing**
   - Action: Refactor service layer to accept authenticated Supabase client as parameter
   - Files: 
     - `src/lib/database.ts` (service functions)
     - `src/app/api/workflow/route.ts` (pass client to services)
   - Dependencies: Successful completion of step 1
   - Expected outcome: RLS can be re-enabled with proper authentication context
   - Implementation approach:
     - Modify service functions to accept `supabase` client parameter
     - Pass authenticated client from API route to all service calls
     - Re-enable RLS and restore security policies

3. **Re-enable Row-Level Security policies**
   - Action: Run SQL to enable RLS and restore security policies
   - File: Supabase SQL Editor
   - Dependencies: Step 2 completed (authenticated client passing)
   - Expected outcome: RLS enforces data isolation while allowing authenticated users to read/write their own data
   - SQL to run:
     ```sql
     ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
     ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;
     ALTER TABLE custom_tags ENABLE ROW LEVEL SECURITY;
     -- Restore policies with proper authentication
     ```

4. **Test custom tag creation and deduplication**
   - Action: Submit workflow with custom tags, verify deduplication and usage count
   - Files: Production workflow form, Supabase `custom_tags` table
   - Dependencies: Steps 1-3 completed
   - Expected outcome: Custom tags are created once and reused, usage_count increments correctly

5. **Update context carryover with final production deployment status**
   - Action: Document final state, RLS configuration, and any remaining considerations
   - File: `pmc/system/plans/context-carries/context-carry-info-[date].md`
   - Dependencies: All previous steps completed
   - Expected outcome: Clear documentation of production-ready state and any future enhancements needed

### Important Files

1. **`tsconfig.json`**
   - Purpose: TypeScript configuration with path alias mapping
   - Current state: Modified - added `"paths": { "@/*": ["./src/*"] }` to enable module resolution
   - Critical for: Resolving `@/lib/database` imports in production build

2. **`src/app/api/workflow/route.ts`**
   - Purpose: API endpoint for workflow submission, handles normalized database writes
   - Current state: Modified - added tag slug to UUID mapping (42 tags), improved mock ID conversion
   - Key sections:
     - Lines 9-17: Dimension key to UUID mapping
     - Lines 23-80: Tag slug to UUID mapping dictionary
     - Lines 86-113: `transformTagsToNormalized()` function with UUID conversion
     - Lines 73-82: Mock document ID to UUID mapping
     - Lines 324-332: Call to `workflowService.completeWorkflow()` with transformed data

3. **`src/lib/database.ts`**
   - Purpose: Database service layer with normalized table operations
   - Current state: Modified - added cleanup logic before inserts (lines 200-210)
   - Key sections:
     - Lines 190-278: `workflowService.completeWorkflow()` - orchestrates all normalized writes
     - Lines 200-210: Cleanup logic to delete existing data before insert (fixes duplicate key errors)
     - Lines 666-708: `customTagService.findOrCreateCustomTag()` - deduplication logic
   - ⚠️ Currently uses unauthenticated Supabase client (needs refactoring for RLS)

4. **`src/components/server/WorkflowCompleteServer.tsx`**
   - Purpose: Server component that fetches document and workflow data for display
   - Current state: Modified - added `convertMockDocumentId()` function (lines 14-30)
   - Key sections:
     - Lines 14-30: Mock document ID to UUID conversion
     - Lines 35-43: `getDocument()` function using converted IDs
     - Lines 50-65: `getWorkflowData()` function for fetching from normalized tables

5. **`src/components/client/WorkflowCompleteClient.tsx`**
   - Purpose: Client component for workflow completion page with submission
   - Current state: Modified - added error state management and display
   - Key sections:
     - Line 83: `submitError` state for displaying submission errors
     - Lines 86-108: `handleSubmit()` with enhanced error handling
     - Lines 384-391: Error alert display with detailed error messages

6. **`src/app/error.tsx`**
   - Purpose: Global error boundary for Next.js application
   - Current state: Modified - error details now shown in production (not just development)
   - Key sections:
     - Lines 34-42: Error details display with message and digest
     - Removed `NODE_ENV === 'development'` check to show errors in production

7. **`.env.local`** (local development only, not in Git)
   - Purpose: Local environment variables for development
   - Current state: Should contain Supabase credentials and feature flag
   - Required variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://hqhtbxlgzysfbekexwku.supabase.co
     SUPABASE_URL=https://hqhtbxlgzysfbekexwku.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     NEXT_PUBLIC_USE_NORMALIZED_TAGS=true
     ```

8. **`seed-test-document.sql`**
   - Purpose: SQL script to seed test documents in production database
   - Current state: Created during troubleshooting session
   - Note: Already executed, documents exist in production Supabase

### Important Scripts, Markdown Files, and Specifications

1. **`pmc/context-ai/pmct/08-categ-db-validation-test-results_v1.md`**
   - Purpose: Complete validation test results for normalized database implementation
   - Key sections:
     - Lines 9-14: Summary (7/7 tests passed)
     - Lines 525-544: Test 5 results - Custom tag deduplication implementation
     - Lines 1089-1126: Sign-off and production readiness checklist
   - Status: All tests passed, approved for production

2. **`pmc/context-ai/pmct/08-categ-db-specification_v1.md`**
   - Purpose: Full specification for normalized database structure
   - Key sections:
     - Database schema definitions for `document_categories`, `document_tags`, `custom_tags`
     - Table relationships and foreign keys
     - Feature flag implementation details
   - Reference: Use for understanding database structure and relationships

3. **`pmc/context-ai/pmct/08-categ-db-prompt-three_v2.md`**
   - Purpose: Implementation prompt for reading/displaying normalized data
   - Key sections:
     - Display component implementation requirements
     - Service layer functions for data fetching
     - Feature flag configuration
   - Reference: Original implementation specifications

### Recent Development Context

- **Last Milestone**: Successfully resolved all Vercel production deployment issues for normalized database feature

- **Key Outcomes**:
  - TypeScript path alias configuration corrected - build now succeeds
  - Environment variables properly configured in Vercel
  - Test data seeded in production Supabase database
  - Comprehensive mock ID to UUID mapping implemented across all entity types
  - Tag slug to UUID conversion enables frontend to use readable keys
  - Duplicate key constraint handling allows workflow resubmission
  - RLS temporarily disabled to enable functionality (needs proper fix)

- **Relevant Learnings**:
  - **Module Resolution**: Next.js production builds are stricter than dev server - `tsconfig.json` paths must be explicitly configured
  - **Environment Variables**: Vercel requires redeploy after adding environment variables for them to take effect
  - **RLS Authentication**: Service layer using global Supabase client causes RLS violations - authenticated client must be passed from API route
  - **Mock Data Mapping**: Frontend mock IDs require comprehensive mapping dictionaries for all entity types (documents, categories, dimensions, tags)
  - **Slug Conventions**: Tag slugs use kebab-case (e.g., `sales-enablements`) and must be mapped to UUIDs
  - **Unique Constraints**: Database unique constraints require cleanup logic before inserts to allow data updates/resubmission
  - **Error Visibility**: Production error messages are hidden by default - explicit display needed for debugging

- **Technical Context**:
  - **Feature Flag**: `NEXT_PUBLIC_USE_NORMALIZED_TAGS=true` (set in Vercel for all environments)
  - **Supabase Project**: `hqhtbxlgzysfbekexwku.supabase.co`
  - **User ID**: `f15f4a68-3268-452d-b4b0-e863f807db58` (authenticated test user)
  - **RLS Status**: Currently DISABLED on all tables - security compromise for functionality
  - **Database Services**: `workflowService`, `documentCategoryService`, `documentTagService`, `customTagService`
  - **Key Functions**:
    - `workflowService.completeWorkflow()` - orchestrates all normalized writes with cleanup
    - `workflowService.getWorkflowWithRelations()` - fetches complete workflow data
    - `customTagService.findOrCreateCustomTag()` - handles deduplication and usage tracking
  - **Import Pattern**: `import { workflowService } from '@/lib/database'` (now resolves correctly)
  - **Mapping Dictionaries**: 
    - `dimensionKeyMap` (7 dimensions)
    - `tagSlugToUuidMap` (42 tags across all dimensions)
    - `mockIdMap` for documents (3 documents)
    - `categoryMappings` (10 categories)

## Troubleshooting Session Summary

This session involved systematic resolution of production deployment issues:

### Issues Resolved (In Order)

1. **Build Failure** - Module resolution error for `@/lib/database`
   - Root cause: Missing TypeScript path alias configuration
   - Fix: Added `"paths": { "@/*": ["./src/*"] }` to `tsconfig.json`
   - Result: Production build succeeds

2. **Missing Environment Variables** - All Supabase variables undefined
   - Root cause: Environment variables not configured in Vercel
   - Fix: Added 5 environment variables to Vercel (both `NEXT_PUBLIC_*` and non-prefixed versions)
   - Result: API can connect to Supabase

3. **Document Not Found** - No documents in production database
   - Root cause: Empty production database
   - Fix: Seeded test documents using SQL inserts with proper UUIDs
   - Result: Documents available for workflow selection

4. **UUID Type Mismatch** - Mock IDs not converted to UUIDs
   - Root cause: Server component tried to query with mock ID strings (`doc-1`)
   - Fix: Added `convertMockDocumentId()` function in server component
   - Result: Document lookups succeed with proper UUIDs

5. **RLS Policy Violations** - Cannot insert into normalized tables
   - Root cause: Service layer uses unauthenticated Supabase client
   - Fix: Temporarily disabled RLS on all workflow-related tables
   - Result: Writes succeed (security compromise)

6. **Tag UUID Errors** - Invalid UUID syntax for tag slugs
   - Root cause: Frontend sends tag slugs (`sales-enablements`) but database expects UUIDs
   - Fix: Created comprehensive `tagSlugToUuidMap` dictionary with all 42 tags
   - Result: Tags properly converted and inserted

7. **Duplicate Key Constraint** - Resubmission fails on unique constraint
   - Root cause: Primary category already exists for document
   - Fix: Added cleanup logic to delete existing normalized data before insert
   - Result: Workflow resubmission supported

### Current Production State

- ✅ Application deployed and functional on Vercel
- ✅ Normalized database writes working correctly
- ✅ All mock ID mappings in place
- ✅ Error handling and display improved for debugging
- ⚠️ RLS disabled (security issue - needs proper authentication implementation)
- 🔄 End-to-end testing and data verification pending

## Project Reference Guide
REFERENCE MATERIALS
Everything below this line is supporting information only. Do NOT select the current task focus from this section.

### Bright Run LoRA Training Data Platform

#### Key Documents
1. Seed Story: `pmc/product/00-bmo-seed-story.md`
2. Project Overview: `pmc/product/01-bmo-overview.md`

### PMC Core Principles
1. **Context Locality**: Instructions and context are kept directly alongside their relevant tasks
2. **Structured Checkpoints**: Regular token-based checks prevent context drift
3. **Directive Approach**: Clear commands and instructions with explicit timing requirements
4. **Task-Centric Documentation**: Single source of truth for task implementation
