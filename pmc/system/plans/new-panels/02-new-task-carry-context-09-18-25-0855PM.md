# Development Context & Operational Priorities
**Date:** 09-18-25-0855PM
**Project:** Aplio Design System Modernization (aplio-mod-1) & Project Memory Core (PMC)
**Context Version:** 3.0.0

## Introduction

This context document addresses two integrated projects that operate in tandem:

1. **Bright Run is a revolutionary LoRA fine-tuning training data platform (bmo)**: Bright Run is a revolutionary LoRA fine-tuning training data platform that transforms unstructured business knowledge into high-quality training datasets through an intuitive 6-stage workflow. We are creating the first user-friendly solution that enables non-technical domain experts to convert their proprietary knowledge—transcripts, documents, and expertise—into thousands of semantically diverse training pairs suitable for LoRA model fine-tuning.

This document defines the functional requirements for the **Document Categorization Module** - a standalone 3-step workflow system that enables users to categorize individual documents through Statement of Belonging assessment, primary category selection, and comprehensive metadata tagging. This module is designed as a focused component that can operate independently and serves as a foundation for future AI training data optimization.

**Key Constraint:** This specification covers ONLY the categorization workflow as implemented in the wireframes. Features such as document upload, content processing, AI analysis, collaborative review, and synthetic generation are explicitly excluded from this implementation.

2. **Project Memory Core (PMC)**: A structured task management and context retention system that manages the development of the Aplio project. PMC provides methodical task tracking, context preservation, and implementation guidance through its command-line interface and document-based workflow.

These projects are deliberately interconnected - PMC requires a real-world development project to refine its capabilities, while Aplio benefits from PMC's structured approach to development. Depending on current priorities, work may focus on either advancing the Aplio Design System implementation or enhancing the PMC tooling itself.

## Current Focus

### Active Development Focus

**Task T-1.2.2: Primary Category Selection Enhancement - Ready to Begin**

**What is being worked on:** Transitioning from completed T-1.2.1 (Statement of Belonging Implementation Enhancement) to implementation of T-1.2.2 (Primary Category Selection Enhancement). The task involves enhancing the existing StepB category selection interface with improved business value indicators, enhanced category presentation, expanded detailed descriptions, usage analytics displays, and sophisticated visual emphasis for high-value categories.

**Why it is being worked on:** T-1.2.2 serves as the second stage enhancement of the document categorization workflow, building upon the enhanced T-1.2.1 Statement of Belonging assessment to provide users with a more informative and visually sophisticated category selection experience. This enhancement focuses on helping users understand business value implications and make more informed category selections through enhanced analytics and value indicators.

**Current state of implementation:** T-1.2.1 (Statement of Belonging Implementation Enhancement) is fully complete with comprehensive enhanced rating interface, sophisticated impact messaging system, real-time feedback, and enhanced validation. The existing StepB component has functional category selection interface with basic business value indicators, usage analytics display, and category preview panel, but T-1.2.2 requires significant enhancements including improved category card design, expanded descriptions, enhanced business value badges, and upgraded analytics displays.

**Critical context needed for continuation:** The implementation agent must focus on enhancing existing StepB functionality rather than creating from scratch. The T-1.2.1 enhanced design patterns and sophisticated messaging approach should be leveraged and adapted for the category selection context. All T-1.2.1 persistence integration and validation infrastructure remains available and should be preserved.

Do not deviate from this focus without explicit instruction.
All other information in this document is reference material only.

### Next Steps 

1. **[PREP-1]**: Review current category selection interface at `4-categories-wf/src/components/client/StepBClient.tsx` - No dependencies - Analyze existing category presentation, business value indicators, and analytics displays to identify enhancement opportunities for T-1.2.2:ELE-1 requirements

2. **[PREP-2]**: Enhance category metadata with business value and analytics data for T-1.2.2:ELE-2 - Requires PREP-1 completion - Improve category data structure and create enhanced business value classification system for sophisticated analytics displays

3. **[IMP-1]**: Improve category card design with value indicators - Requires PREP completion - Implement enhanced visual design for category cards using T-1.2.1 design patterns as reference

4. **[IMP-2]**: Add expandable descriptions and detailed category information - Requires PREP completion - Create progressive disclosure system for detailed category information

5. **[IMP-3]**: Implement business value badges and visual emphasis - Requires IMP-1/IMP-2 completion - Enhance business value indicators with sophisticated visual design

### Important Files

1. **4-categories-wf/src/components/client/StepBClient.tsx** - Main implementation target for T-1.2.2 enhancements - CURRENT STATE: Functional category selection interface with basic business value indicators, usage analytics, and detailed preview panel ready for enhancement
2. **4-categories-wf/src/components/server/StepBServer.tsx** - Server component providing category data with analytics - CURRENT STATE: Provides enhanced analytics data including usage statistics and value distribution
3. **4-categories-wf/src/components/workflow/steps/StepB.tsx** - Step component entry point - CURRENT STATE: Empty file that may need implementation or removal
4. **4-categories-wf/src/components/client/StepAClient.tsx** - Enhanced T-1.2.1 reference implementation - CURRENT STATE: Fully enhanced with sophisticated design patterns, color coding, impact messaging, and real-time feedback that can serve as design reference
5. **4-categories-wf/src/stores/workflow-store.ts** - Workflow state management with CategorySelection interface - CURRENT STATE: Contains comprehensive CategorySelection interface with business value fields, analytics properties, and value distribution data
6. **4-categories-wf/src/data/mock-data.ts** - Category data source - CURRENT STATE: Contains mockCategories array with 11 categories including business value classifications

### Important Scripts, Markdown Files, and Specifications

1. **pmc/core/active-task.md** - Current task specifications for T-1.2.2 - Contains detailed requirements for category presentation enhancement and business value indicators
2. **4-categories-wf/src/validation/t-1-2-1-validation.ts** - T-1.2.1 validation infrastructure - Can serve as reference for creating T-1.2.2 validation suite
3. **4-categories-wf/src/components/T121ValidationRunner.tsx** - T-1.2.1 test runner reference - Pattern for creating T-1.2.2 validation interface
4. **pmc/product/_mapping/test-maps/07-bmo-test-mapping-output-E01-custom_v1.md** - Contains T-1.2.1 implementation context that may inform T-1.2.2 approach

### Recent Development Context

- **Last Milestone**: Completed comprehensive T-1.2.1 Statement of Belonging Implementation Enhancement including sophisticated rating interface with color coding, dynamic impact messaging system, real-time feedback, enhanced validation, and comprehensive validation infrastructure

- **Key Outcomes**: 
  - Established enhanced UI design patterns with color-coded interfaces, star indicators, and progressive disclosure
  - Implemented sophisticated impact messaging system with individual rating messages, tooltips, and popovers
  - Created real-time feedback patterns with loading states, success messages, and smooth animations
  - Validated seamless integration with T-1.1.3 persistence infrastructure
  - Developed comprehensive validation testing methodology with dedicated test runners

- **Relevant Learnings**: 
  - Progressive enhancement approach proven effective for preserving existing functionality while adding sophistication
  - Color-coded visual hierarchy (red→green gradient) highly effective for value communication
  - Real-time feedback and micro-interactions significantly enhance user experience without breaking persistence
  - Comprehensive impact messaging with progressive disclosure provides valuable user guidance
  - T-1.1.3 persistence infrastructure robust and ready to support enhanced T-1.2.2 functionality

- **Technical Context**: 
  - All T-1.2.1 enhanced design patterns and components available as reference for T-1.2.2 implementation
  - StepB component has existing functional foundation with business value indicators and analytics ready for enhancement
  - T-1.1.3 persistence validation infrastructure remains available for T-1.2.2 testing and validation
  - Enhanced validation testing methodology established and ready for adaptation to T-1.2.2 requirements

### Critical Implementation Context

**T-1.2.1 Enhanced Design Patterns Available**: T-1.2.1 successfully implemented sophisticated design patterns including color-coded interfaces, progressive disclosure with tooltips/popovers, real-time feedback systems, and comprehensive impact messaging that can serve as reference and foundation for T-1.2.2 category selection enhancements.

**Existing StepB Component Analysis**: The `4-categories-wf/src/components/client/StepBClient.tsx` contains a functional category selection interface with basic business value badges, usage analytics display, detailed category preview panel, and category selection logic. T-1.2.2 enhancements must build upon this existing foundation using T-1.2.1 design patterns as reference.

**CategorySelection Interface Ready**: The workflow store's CategorySelection interface includes comprehensive business value properties (`businessValueClassification`, `usageAnalytics`, `valueDistribution`, `isHighValue`) that provide the data foundation for T-1.2.2 enhanced business value indicators and analytics displays.

**Validation Testing Infrastructure Available**: T-1.2.1 created comprehensive validation methodology including dedicated validation suite, interactive test runner, and testing infrastructure that can be adapted for T-1.2.2 validation requirements.

### Existing Implementation Instructions Adaptations

**Enhanced Category Card Design Requirements**: T-1.2.2:ELE-1 requires "Display all 11 categories with clear business value classification" building upon existing category cards. The current basic cards must be enhanced with T-1.2.1-inspired sophisticated visual design including improved color coding, enhanced typography, better spacing, and visual hierarchy while preserving existing selection functionality.

**Business Value Indicators Enhancement**: T-1.2.2:ELE-2 requires "Highlight high-value categories with usage analytics" requiring transformation of current basic "High Value" badges into sophisticated visual indicators using enhanced color schemes, improved typography, and detailed analytics displays that leverage T-1.2.1 design patterns.

**Progressive Disclosure Integration**: Following T-1.2.1 patterns, T-1.2.2 should implement expandable descriptions and detailed category information using tooltip and popover components for enhanced user guidance without overwhelming the interface complexity.

**Real-time Feedback Enhancement**: T-1.2.2 category selection should incorporate T-1.2.1 real-time feedback patterns including selection animations, hover states, and visual confirmation feedback to create responsive, engaging user interaction experience.

### Modified Implementation Approaches

**Component Enhancement Approach**: Unlike T-1.2.1 which transformed a basic radio group, T-1.2.2 requires enhancing an already sophisticated category selection interface. The implementation agent must use careful enhancement approach that builds upon existing comprehensive functionality while adding T-1.2.1-inspired sophistication.

**Design Pattern Consistency Strategy**: Since T-1.2.1 established sophisticated design patterns with color coding, progressive disclosure, and impact messaging, T-1.2.2 should adapt these patterns to category selection context ensuring visual consistency across the workflow stages.

**Analytics Enhancement Focus**: T-1.2.2 has access to comprehensive usage analytics and value distribution data that T-1.2.1 did not. The implementation agent should leverage this data to create sophisticated analytics displays that provide valuable business insights to users.

### Eliminated Requirements

**Basic Category Selection Implementation**: Do not implement category selection from scratch - comprehensive implementation exists at `4-categories-wf/src/components/client/StepBClient.tsx` with working selection logic, validation, navigation, and detailed preview panel that should be enhanced rather than replaced.

**Basic Business Value Indicators**: Do not implement basic value badges - existing implementation already includes `isHighValue` badges and usage analytics display. T-1.2.2 requires enhancement of existing indicators with sophisticated visual design and expanded analytics.

**Category Data Structure Modification**: Do not modify CategorySelection interface structure - comprehensive interface exists with all necessary business value properties. T-1.2.2 focuses on visual enhancement and better utilization of existing data properties.

### Additional Testing Needs

**Enhanced Category Visual Testing**: T-1.2.2 visual enhancements require validation that improved category cards, business value indicators, and analytics displays work correctly across different viewport sizes and provide clear visual hierarchy.

**Business Value Indicator Effectiveness Testing**: The enhanced business value visualization must be tested to ensure high-value categories are clearly distinguished and analytics provide valuable user guidance for selection decisions.

**Enhanced Category Selection Integration Testing**: All T-1.2.2 enhancements must be tested with existing workflow progression to ensure enhanced category selection integrates seamlessly with T-1.2.1 enhanced rating assessment and continues to Stage 3.

### Acceptance Criteria

**Enhanced Category Presentation**: Users must experience significantly improved category cards with clear business value classification, enhanced visual hierarchy, and intuitive navigation that makes the 11 categories easy to understand and compare.

**Sophisticated Business Value Indicators**: High-value categories must be clearly highlighted with enhanced visual design, comprehensive analytics displays, and detailed business value information that helps users understand selection implications.

**Progressive Disclosure Excellence**: Enhanced category interface must provide expandable descriptions and detailed information using sophisticated progressive disclosure that enhances rather than complicates the selection experience.

**Analytics Integration Excellence**: Usage analytics and value distribution must be presented in visually compelling, informative displays that provide users with valuable insights for making informed category selections.

## Project Reference Guide
REFERENCE MATERIALS
Everything below this line is supporting information only. Do NOT select the current task focus from this section.

### Aplio Design System Modernization Project

#### Project Overview
This project aims to transform the existing JavaScript-based Aplio theme into a modern TypeScript-powered Next.js 14 platform. The project specifically focuses on migrating the Home 4 template (https://js-aplio-6.vercel.app/home-4) as the flagship demonstration while preserving Aplio's premium design aesthetics from the existing design system in `/aplio-legacy/`.

#### Key Documents
1. Seed Story: `pmc/product/00-aplio-mod-1-seed-story.md`
2. Project Overview: `pmc/product/00-aplio-mod-1-seed-narrative.md`
3. Raw Data: `pmc/product/_seeds/00-narrative-raw_data-ts-14-v3.md`

#### Project Objectives

##### Primary Goals
1. Migrate Home 4 template to Next.js 14 App Router architecture
2. Preserve exact design elements from `/aplio-legacy/`
3. Implement TypeScript with full type safety
4. Maintain premium design quality and animations

##### Technical Requirements
1. Next.js 14 App Router implementation
2. Complete TypeScript migration
3. Modern component architecture
4. Performance optimization

##### Design Requirements
1. Exact preservation of design elements from `/aplio-legacy/`
2. Maintenance of animation quality
3. Responsive behavior preservation
4. Professional template implementation

### Project Memory Core (PMC) System

#### Core Functionality
Everything in this section is supporting information only. Do NOT select the current task focus from this section.
PMC is a structured modern software development task management and context retention system built around the the main active task file as its central operational component. PMC is product agnostic. In this instance we are using it to code the Aplio Design System Modernization (aplio-mod-1) system described above. The system provides:

1. **Context Locality**: Instructions and context are kept directly alongside their relevant tasks
2. **Structured Checkpoints**: Regular token-based checks prevent context drift
3. **Directive Approach**: Clear commands and instructions with explicit timing requirements
4. **Task-Centric Documentation**: Single source of truth for task implementation

#### Commands

The driver for most PMC commands are in:
`pmc/bin/aplio-agent-cli.js`

The code for most PMC commands are contained within:
- The original context manager script: `pmc/system/management/context-manager.js`
- The second context manager script: `pmc/system/management/context-manager-v2.js` (created when the original got too large)
- The third context manager script: `pmc/system/management/context-manager-v3.js` (created when the second got too large)

Here are some important PMC commands:

##### Add Structured Task Approaches
```bash
node pmc/bin/aplio-agent-cli.js task-approach
```

##### Add Structured Test Approaches
```bash
node pmc/bin/aplio-agent-cli.js test-approach

#### Project Structure
```
project-root/aplio-legacy/ (legacy system)
project-root/aplio-modern-1/ (new system)
project-root/pmc/ (PMC system)

```