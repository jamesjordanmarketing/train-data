# Development Context & Operational Priorities
**Date:** 2025-10-02 21:40 PST
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

**Task:** Fix Vercel Production Build Compilation Error

**What is being worked on:**
Resolving a module resolution error preventing the Next.js application from building in Vercel production environment. The build fails with: `Module not found: Can't resolve '@/lib/database'` in `./src/app/api/workflow/route.ts`.

**Why it is being worked on:**
The normalized database implementation (Prompts 1, 2, and 3) has been completed, validated through code review, and committed to Git. However, when deployed to Vercel, the production build fails due to a webpack module resolution issue. This is blocking production deployment of the normalized database feature.

**Current state of implementation:**
- ✅ Normalized database implementation is complete and validated
- ✅ All 7 test scenarios passed code review
- ✅ Custom tag deduplication and usage tracking implemented
- ✅ Code committed to Git repository
- ❌ Vercel production build failing with module resolution error
- ❌ Production deployment blocked

**Critical context needed for continuation:**
1. The error specifically occurs in the API route: `src/app/api/workflow/route.ts`
2. The import statement `import { workflowService } from '@/lib/database'` is not resolving
3. This is a webpack/Next.js configuration issue, NOT a code logic issue
4. The local development environment builds successfully
5. The feature flag `NEXT_PUBLIC_USE_NORMALIZED_TAGS=true` must be set for normalized mode to work
6. All implementation code has been validated and is production-ready pending build fix

Do not deviate from this focus without explicit instruction.
All other information in this document is reference material only.

### Bugs & Challenges in the Current Task

**Issue 1: Webpack Module Resolution Error in Vercel Build**
- **Description:** Production build fails with error `Module not found: Can't resolve '@/lib/database'` in `src/app/api/workflow/route.ts`
- **Current Status:** Blocking production deployment
- **Attempted Solutions:** None yet - new issue discovered after Git push to Vercel
- **Blocking Factors:** 
  - Need to investigate Next.js path alias configuration (`@/` prefix)
  - May need to check `tsconfig.json` paths configuration
  - May need to check `next.config.js` webpack settings
  - Verify file exists at correct path: `src/lib/database.ts`
- **Error Context:** 
  - Error occurs during `npm run build` in Vercel
  - Command: `npm run build`
  - Exit code: 1
  - Webpack compilation phase
  - Full error: `Failed to compile. ./src/app/api/workflow/route.ts Module not found: Can't resolve '@/lib/database'`

The Current Open Task section and Bugs & Challenges in the Current Task are a subset of the Active Development Focus section.

### Next Steps 

1. **Verify file structure and paths**
   - Action: Confirm `src/lib/database.ts` exists and is properly committed to Git
   - Dependencies: None
   - Expected outcome: File exists at correct location in repository

2. **Check TypeScript configuration**
   - Action: Review `tsconfig.json` to verify path alias `@/*` maps to correct directory
   - File: `tsconfig.json` at workspace root
   - Expected outcome: Path mapping configured correctly: `"@/*": ["./src/*"]` or similar

3. **Verify Next.js configuration**
   - Action: Check `next.config.js` for any webpack configuration that might affect module resolution
   - File: `next.config.js` at workspace root
   - Expected outcome: No conflicting webpack configurations

4. **Test import statements**
   - Action: Review all import statements in `src/app/api/workflow/route.ts` to ensure consistent path usage
   - File: `src/app/api/workflow/route.ts`
   - Expected outcome: All imports use proper path aliases or relative paths

5. **Deploy fix to Vercel**
   - Action: Once module resolution is fixed, trigger new Vercel build
   - Dependencies: Previous steps completed successfully
   - Expected outcome: Build succeeds, application deploys successfully

The Next Steps section is a subset of the Active Development Focus section.

### Important Files

1. **`src/app/api/workflow/route.ts`**
   - Purpose: API route that imports the database service causing compilation error
   - Current state: Contains `import { workflowService } from '@/lib/database'` on line 3
   - Issue: This import is failing in Vercel production build

2. **`src/lib/database.ts`**
   - Purpose: Database service layer with all normalized table operations
   - Current state: Recently updated with `findOrCreateCustomTag()` function (lines 666-708)
   - Status: Complete and validated, should be exported correctly

3. **`tsconfig.json`**
   - Purpose: TypeScript configuration including path alias mappings
   - Current state: Need to verify path mappings for `@/*` alias
   - Critical: Must map `@/*` to `./src/*` for imports to resolve

4. **`next.config.js`**
   - Purpose: Next.js configuration including webpack settings
   - Current state: Need to review for any webpack config affecting module resolution
   - May contain: Custom webpack configurations that could conflict

5. **`package.json`**
   - Purpose: Build scripts and dependencies
   - Current state: Contains `"build": "next build"` script
   - Context: This is the script failing in Vercel

The Important Files section is a subset of the Active Development Focus section.

### Important Scripts, Markdown Files, and Specifications

1. **`pmc/context-ai/pmct/08-categ-db-validation-test-results_v1.md`**
   - Purpose: Complete validation test results for normalized database implementation
   - Status: All 7 tests passed, all issues resolved
   - Key sections: 
     - Summary: 7/7 tests passed
     - Test 5: Custom tag deduplication implementation details
     - Implementation Updates: Recent fix applied
     - Sign-off: Approved for production deployment

2. **`pmc/context-ai/pmct/08-categ-db-specification_v1.md`**
   - Purpose: Full specification for normalized database structure
   - Key sections:
     - Database schema definitions
     - Table relationships and foreign keys
     - Feature flag implementation details

3. **`pmc/context-ai/pmct/08-categ-db-prompt-three_v2.md`**
   - Purpose: Implementation prompt for reading/displaying normalized data
   - Key sections:
     - Display component implementation
     - Service layer functions for data fetching
     - Feature flag configuration

The Important Scripts, Markdown Files, and Specifications section is a subset of the Active Development Focus section.

### Recent Development Context

- **Last Milestone**: Completed and validated normalized database implementation (Prompts 1, 2, and 3)
  
- **Key Outcomes**: 
  - All workflow form inputs now write to normalized tables (`document_categories`, `document_tags`, `custom_tags`)
  - Display components fetch and show data from normalized database
  - Feature flag (`NEXT_PUBLIC_USE_NORMALIZED_TAGS`) enables safe rollback to JSONB storage
  - Custom tag deduplication prevents database pollution
  - Usage count tracking enables popularity sorting and analytics
  - Comprehensive code review validated all 7 test scenarios

- **Relevant Learnings**: 
  - Custom tag usage count was initially missing but fixed with `findOrCreateCustomTag()` function
  - Deduplication is critical to prevent duplicate tags in database
  - Case-insensitive matching (`ilike`) necessary for tag name comparison
  - Sequential database operations (not true transactions) require careful error handling

- **Technical Context**: 
  - Feature flag: `NEXT_PUBLIC_USE_NORMALIZED_TAGS=true` (must be set in Vercel environment)
  - Database services: `workflowService`, `documentCategoryService`, `documentTagService`, `customTagService`
  - Key function: `workflowService.completeWorkflow()` orchestrates all normalized writes
  - Key function: `workflowService.getWorkflowWithRelations()` fetches complete workflow data
  - Import pattern: `import { workflowService } from '@/lib/database'` (currently failing in Vercel)
  - Code is production-ready pending build fix

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
