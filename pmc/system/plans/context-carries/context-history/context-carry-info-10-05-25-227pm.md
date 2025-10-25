# Development Context & Operational Priorities
**Date:** 2025-10-05 14:27 PST
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

**Task:** Audit and validate the Chunks Alpha Module Build Specification (v3.2) for completeness and coding agent readiness.

**What Was Accomplished in Previous Session:**
- Created specification version 3.2 (`pmc\context-ai\pmct\c-alpha-build-spec_v3.2.md`)
- Added `DASHBOARD WIREFRAME DESIGN REFERENCE` section with:
  - Visual screenshot reference from existing Vite dashboard
  - Detailed UI/UX patterns from `chunks-alpha-dashboard\src`
  - Component structure and design guidelines
  - Three-section card layout specifications
  - Color coding system and design principles
- Enhanced Build Prompt #4 with visual target reference
- Confirmed the spec treats the Vite dashboard as design inspiration only (not code reuse)

**Critical Issue Identified:**
The `DASHBOARD WIREFRAME DESIGN REFERENCE` section (lines 59-346) contains extensive critical information about UI design patterns, component structure, color schemes, and visual hierarchy. However, this content exists OUTSIDE the 5 build prompts that will be given to the coding agent. The coding agent will only see:
- Build Prompt #1: Database Schema & Infrastructure (lines 783-1196)
- Build Prompt #2: Chunk Extraction Engine (lines 1199-1759)
- Build Prompt #3: AI Dimension Generation (lines 1762-2097)
- Build Prompt #4: Chunk Dashboard & Spreadsheet Interface (lines 2100-2523)
- Build Prompt #5: Run Management & Polish (lines 2527-2562)

**Why This Matters:**
Build Prompt #4 references the Dashboard Wireframe Design Reference section, but if the coding agent only receives the prompts without the full specification context, it will lack critical design details needed to implement the UI correctly.

**Current State:**
Specification v3.2 is complete and ready for audit. The document structure places reference material before the implementation prompts, following a logical documentation pattern but potentially creating a disconnect for coding agents.

Do not deviate from this focus without explicit instruction.
All other information in this document is reference material only.

### Next Steps 

1. **AUDIT TASK: Analyze Specification Completeness**
   - File: `pmc\context-ai\pmct\c-alpha-build-spec_v3.2.md`
   - Action: Conduct a thorough audit to identify ALL critical knowledge that exists outside the 5 build prompts
   - Focus Areas:
     - Lines 59-346: Dashboard Wireframe Design Reference
     - Lines 28-56: Executive Summary / Key Architectural Decisions
     - Lines 348-780: Prerequisites & Human Setup
     - Lines 2535-2607: Appendices
   - Expected Outcome: Comprehensive list of critical information not included in prompts

2. **DECISION POINT: Determine Best Integration Strategy**
   - Evaluate these options:
     - **Option A**: Give coding agent the entire spec file and have it prompt when ready for each build phase
     - **Option B**: Rewrite prompts to include critical reference material inline
     - **Option C**: Create a "Context Primer" that precedes each build prompt
     - **Option D**: Hybrid approach with essential info in prompts + full spec as reference
   - Dependencies: Completion of audit task
   - Expected Outcome: Clear recommendation with rationale for chosen approach

3. **VALIDATE: Ensure Each Build Prompt is Complete**
   - Review each of the 5 build prompts for:
     - Self-sufficiency (can it be executed standalone?)
     - Reference completeness (are all dependencies explicit?)
     - Design specification precision (is UI guidance clear?)
     - Success criteria clarity (can completion be verified?)
   - Expected Outcome: List of gaps or improvements needed per prompt

4. **DOCUMENT: Create Specification Amendment Plan**
   - Based on audit findings and chosen strategy, create specific action items
   - Include line numbers for insertions/modifications
   - Specify what content moves where
   - Expected Outcome: Ready-to-execute specification update plan

5. **OPTIONAL: Update Summary Document**
   - File: `pmc\context-ai\pmct\c-alpha-build-spec_v3.1-SUMMARY.md`
   - If spec structure changes significantly, update summary to reflect new organization
   - Expected Outcome: Aligned summary documentation

The Next Steps section is a subset of the Active Development Focus section.

### Important Files

1. **`pmc\context-ai\pmct\c-alpha-build-spec_v3.2.md`**
   - Primary specification document requiring audit
   - Current state: Complete, includes screenshot reference
   - 2,610 lines total
   - Key sections needing review: lines 59-346 (Design Reference), lines 783-2562 (Build Prompts)

2. **`pmc\context-ai\pmct\c-alpha-build-spec_v3.1.md`**
   - Previous version (updated in place, then copied to v3.2)
   - Reference for understanding changes made
   - Currently identical to v3.2

3. **`pmc\context-ai\pmct\c-alpha-build-spec_v3.1-SUMMARY.md`**
   - Summary document for specification
   - May need updating if spec structure changes
   - 214 lines

4. **`chunks-alpha-dashboard\src\`**
   - Vite React dashboard used as design reference
   - Contains UI components referenced in specification
   - Purpose: Design inspiration only, not code reuse

The Important Files section is a subset of the Active Development Focus section.

### Important Scripts, Markdown Files, and Specifications

1. **`pmc\context-ai\pmct\c-alpha-build-spec_v3.2.md`**
   - **Lines 59-346**: Dashboard Wireframe Design Reference - CRITICAL UI patterns
   - **Lines 70-87**: Visual Reference section with screenshot and key elements
   - **Lines 89-301**: Key Design Patterns from DocumentChunksOverview.tsx
   - **Lines 2100-2523**: Build Prompt #4 - Chunk Dashboard & Spreadsheet Interface
   - **Lines 2106-2111**: VISUAL TARGET reference pointing back to lines 70-87
   
2. **Key Questions to Answer During Audit:**
   - What critical knowledge exists outside the build prompts?
   - Should the coding agent receive the full spec or just the prompts?
   - Would inline prompt content be better than external references?
   - Are the prompts sufficiently self-contained?
   - Is the visual reference properly integrated into Build Prompt #4?

The Important Scripts, Markdown Files, and Specifications section is a subset of the Active Development Focus section.

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
