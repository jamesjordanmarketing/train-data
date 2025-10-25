# Development Context & Operational Priorities
**Date:** 2025-10-07 13:53 PST
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

**TASK: QA Testing & Debugging - Dimension Validation Spreadsheet UI Module**

**What Has Been Built:**
We have successfully completed the implementation of the Dimension Validation Spreadsheet UI (PROMPT 3.1), which is the final UI component for the Chunks Alpha module's dimension validation system. This builds upon the data layer (PROMPT 2.1) completed earlier.

**What Was Implemented:**

1. **Data Layer (PROMPT 2.1 - COMPLETED):**
   - `src/lib/dimension-metadata.ts` - Metadata constants for all 60 chunk dimensions
   - `src/lib/dimension-classifier.ts` - Classification and confidence logic
   - `src/lib/dimension-service.ts` - Service layer to fetch and join dimension data

2. **UI Layer (PROMPT 3.1 - COMPLETED, NEEDS TESTING):**
   - `src/components/chunks/DimensionValidationSheet.tsx` - Main spreadsheet component (345 lines)
   - `src/app/chunks/[documentId]/dimensions/[chunkId]/page.tsx` - Validation page (160 lines)
   - `src/app/chunks/[documentId]/page.tsx` - Updated to add "View All Dimensions" button

**Why This Needs QA Testing:**
This is a complex UI module with multiple interactive features (filtering, sorting, CSV export, run switching) that has NOT been tested yet. The code compiles without TypeScript or linter errors, but we need to verify:
- All 60 dimensions display correctly in production
- Filtering and sorting work as expected
- CSV export generates valid files
- Run selector switches data correctly
- UI is responsive on mobile/tablet/desktop
- Error handling works for edge cases
- Performance is acceptable with real data

**Current State:**
- ✅ All code implemented and committed
- ✅ TypeScript compiles without errors (0 errors)
- ✅ No linter errors
- ✅ Documentation complete (3 comprehensive docs)
- ❌ NO testing has been performed yet
- ❌ NOT deployed to Vercel yet
- ❌ NOT tested with real data
- ❌ No user acceptance testing

**Critical Context for QA Engineer:**

The Dimension Validation Spreadsheet displays all 60 chunk dimensions as ROWS (not columns) with 8 metadata columns. Each dimension has:
- A generation type (Prior/Mechanical/AI Generated)
- Confidence scores (precision and accuracy, 0-10 scale)
- Metadata (description, data type, allowed format)

**Key Business Rules:**
1. Prior Generated and Mechanically Generated dimensions ALWAYS have 10.0 confidence (perfect)
2. AI Generated dimensions use stored confidence values from database
3. Average confidence calculations include ONLY AI Generated dimensions (35 out of 60)
4. Some dimensions are stored in `chunks` table (9 fields), others in `chunk_dimensions` table (51 fields)

**Next Phase: QA Testing & Debugging**
The next engineer will deploy to Vercel, test all features systematically, identify bugs, and work with the human to polish the module until it's production-ready.

Do not deviate from this focus without explicit instruction.
All other information in this document is reference material only.

### Next Steps 

1. **Deploy to Vercel**
   - Push current code to main branch (if not already pushed)
   - Trigger Vercel deployment
   - Verify build succeeds
   - Expected outcome: Live URL for testing

2. **Systematic Feature Testing**
   - Test navigation: Chunk Dashboard → "View All Dimensions" button → Validation page
   - Test run selector: Switch between runs, verify data updates
   - Test filtering: Text search, type filter, confidence filter
   - Test sorting: All 4 sortable columns (Dimension, Type, Precision, Accuracy)
   - Test column width presets: Small, Medium, Large
   - Test CSV export: Generate file, verify format and content
   - Test responsive design: Mobile, tablet, desktop viewports
   - Expected outcome: Complete test report with pass/fail for each feature

3. **Data Validation Testing**
   - Verify all 60 dimensions appear in correct order (displayOrder 1-60)
   - Verify confidence scores are correct (10.0 for Prior/Mechanical, stored values for AI)
   - Verify statistics calculations (populated %, avg precision, avg accuracy)
   - Verify type distribution badges (counts match reality)
   - Expected outcome: Data integrity confirmed

4. **Error Handling & Edge Cases**
   - Test with chunk that has no runs
   - Test with empty dimension values
   - Test with very long text values
   - Test with malformed data
   - Test network errors (offline mode)
   - Expected outcome: Graceful error handling, user-friendly messages

5. **Bug Fixes & Polish**
   - Document all bugs found during testing
   - Prioritize by severity (blocker, major, minor, cosmetic)
   - Fix bugs systematically
   - Retest after each fix
   - Expected outcome: All critical and major bugs resolved

### Important Files

**Implementation Files (Created/Modified):**
1. `src/components/chunks/DimensionValidationSheet.tsx`
   - Purpose: Main spreadsheet component displaying 60 dimensions as rows
   - State: NEW - Created, not tested
   - Key features: Filtering, sorting, CSV export, column width presets

2. `src/app/chunks/[documentId]/dimensions/[chunkId]/page.tsx`
   - Purpose: Dimension validation page with statistics and spreadsheet
   - State: NEW - Created, not tested
   - Key features: Run selector, statistics card, integration with data layer

3. `src/app/chunks/[documentId]/page.tsx`
   - Purpose: Chunk dashboard (updated to add navigation button)
   - State: MODIFIED - Added "View All Dimensions" button
   - Change: Minimal update, button placed after "Detail View" button

**Data Layer Files (Previously Created, Working):**
4. `src/lib/dimension-metadata.ts`
   - Purpose: Metadata constants for all 60 dimensions
   - State: COMPLETED - Tested and validated in PROMPT 2.1

5. `src/lib/dimension-classifier.ts`
   - Purpose: Classification and confidence logic
   - State: COMPLETED - Tested and validated in PROMPT 2.1

6. `src/lib/dimension-service.ts`
   - Purpose: Service layer to fetch and join dimension data
   - State: COMPLETED - Tested and validated in PROMPT 2.1

**Type Definitions:**
7. `src/types/chunks.ts`
   - Purpose: TypeScript interfaces for Chunk, ChunkDimensions, ChunkRun
   - State: EXISTING - Used by both data layer and UI layer

### Important Scripts, Markdown Files, and Specifications

**Documentation (Reference for Testing):**
1. `PROMPT-3.1-COMPLETION-SUMMARY.md`
   - Purpose: Complete implementation details for UI layer
   - Key sections: Feature descriptions, success criteria, technical implementation
   - Use for: Understanding what was built and what should work

2. `PROMPT-3.1-QUICKSTART.md`
   - Purpose: Quick reference guide for using the UI
   - Key sections: Common tasks, filtering examples, CSV export format
   - Use for: Test scenarios and expected behavior

3. `PROMPT-3.1-VISUAL-GUIDE.md`
   - Purpose: Visual reference for UI structure and layouts
   - Key sections: Component hierarchy, color system, responsive breakpoints
   - Use for: Visual regression testing, responsive testing

4. `PROMPT-2.1-COMPLETION-SUMMARY.md`
   - Purpose: Data layer implementation details
   - Key sections: Dimension organization, confidence scoring, field mapping
   - Use for: Understanding data structure and business rules

5. `PROMPT-2.1-QUICKSTART.md`
   - Purpose: Quick reference for data layer services
   - Key sections: Service usage, data types, helper functions
   - Use for: Debugging data issues

**Specification Files:**
6. `pmc/context-ai/pmct/c-alpha-build-spec_v3.3-dimensions-sheet-spec_v2.md`
   - Purpose: Original specification for dimension validation spreadsheet
   - Key sections: Requirements, UI mockups, business rules
   - Use for: Verifying implementation matches requirements

### Recent Development Context

- **Last Milestone**: Completed Dimension Validation Spreadsheet UI implementation (PROMPT 3.1)

- **Key Outcomes**: 
  - All 60 dimensions properly organized and displayable as rows
  - Complete filtering system (text, type, confidence)
  - Sortable columns with toggle direction
  - CSV export with proper formatting
  - Run selector for switching between AI generation runs
  - Statistics card with 4 key metrics
  - Responsive design for mobile/tablet/desktop
  - Zero TypeScript/linter errors

- **Relevant Learnings**:
  - Dimension data comes from multiple tables (chunks + chunk_dimensions), service layer handles this complexity
  - Confidence scoring has different rules for different generation types (Prior/Mechanical = 10.0, AI = stored values)
  - useMemo crucial for performance with filtering/sorting on 60+ rows
  - CSV export requires proper escaping for quotes and commas
  - Run selector needs to fetch runs filtered to specific chunk (not all runs for document)

- **Technical Context**:
  - Next.js 13 app router with nested dynamic routes: `/chunks/[documentId]/dimensions/[chunkId]`
  - Uses shadcn/ui components (Table, Card, Button, Badge, Input, Select, Skeleton)
  - Uses sonner for toast notifications
  - Uses lucide-react for icons
  - State management with React useState and useEffect
  - Data fetching with async/await using dimensionService
  - No new dependencies added (all existing packages)

**QA ENGINEER: START HERE**

Your mission is to:
1. Deploy the current code to Vercel
2. Test all features systematically (use PROMPT-3.1-QUICKSTART.md for test scenarios)
3. Document any bugs or issues found
4. Work with the human to fix bugs and polish the UI
5. Verify all success criteria from PROMPT-3.1-COMPLETION-SUMMARY.md

**Testing Checklist (21 Success Criteria):**
- [ ] All 60 dimensions display correctly as rows
- [ ] Sorting works on all 4 sortable columns
- [ ] Text search filters across field name, description, value
- [ ] Type filter works (All, AI, Mechanical, Prior)
- [ ] Confidence filter works (All, High ≥8.0, Low <8.0)
- [ ] Column width presets work (Small, Medium, Large)
- [ ] Run selector switches data without page reload
- [ ] CSV export generates valid file with 9 columns
- [ ] Confidence scores color-coded correctly (green/yellow/orange)
- [ ] Generation type badges color-coded correctly (purple/blue/gray)
- [ ] Values format correctly (arrays, booleans, objects, nulls)
- [ ] Navigation button works on chunk dashboard
- [ ] Page header shows correct title format
- [ ] Statistics card shows accurate metrics
- [ ] Loading states work smoothly
- [ ] Error handling shows user-friendly messages
- [ ] No TypeScript errors in browser console
- [ ] No runtime errors in browser console
- [ ] Responsive design works on mobile
- [ ] Responsive design works on tablet
- [ ] Responsive design works on desktop

**Known Potential Issues to Watch For:**
1. Database might not have dimension_metadata table yet - check if data layer works
2. Some chunks might not have dimension data - verify error handling
3. Large text values might overflow table cells - check truncation
4. CSV export with special characters might break - test with quotes/commas
5. Run selector might show runs without data - verify filtering logic

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
