# Development Context & Operational Priorities
**Date:** 07/05/2025
**Project:** Aplio Design System Modernization (aplio-mod-1) & Project Memory Core (PMC)
**Context Version:** 3.0.0

## Introduction

This context document addresses two integrated projects that operate in tandem:

1. **Aplio Design System Modernization (aplio-mod-1)**: A comprehensive modernization project converting the legacy Aplio Design System to leverage Next.js 14's App Router architecture and TypeScript. The project focuses on the Home-4 template implementation while preserving visual fidelity and enhancing developer experience.

2. **Project Memory Core (PMC)**: A structured task management and context retention system that manages the development of the Aplio project. PMC provides methodical task tracking, context preservation, and implementation guidance through its command-line interface and document-based workflow.

These projects are deliberately interconnected - PMC requires a real-world development project to refine its capabilities, while Aplio benefits from PMC's structured approach to development. Depending on current priorities, work may focus on either advancing the Aplio Design System implementation or enhancing the PMC tooling itself.

## Current Focus

### T-3.2.1 Active Testing Focus

**Task Summary**: T-3.2.1 completed the foundational implementation of the Accordion component structure and comprehensive TypeScript type definitions for the Aplio Design System. This task established the complete component architecture with optimized server/client boundaries, supporting both single and multiple open accordion variants with comprehensive state management and accessibility features.

**What is being tested**: The Accordion component structure implementation including:
- Main Accordion container component (Server Component)
- AccordionItem interactive components (Client Components)
- AccordionProvider state management system
- Comprehensive TypeScript type definitions
- Server/client boundary optimization
- Component composition patterns

**Why it is being tested**: This is the foundational component structure that will enable T-3.2.2 (styling) and T-3.2.3 (integration) tasks. The architecture must be validated for type safety, component composition, proper server/client boundaries, and adherence to design system patterns before proceeding with visual implementation.

**Current state of implementation**: All T-3.2.1 files successfully created and accepted by user. Implementation includes complete directory structure, comprehensive TypeScript types, optimized component architecture, and DSAP-compliant structure.

**Critical context needed for continuation**: The implementation uses Next.js 14 App Router patterns with careful server/client boundary separation. The AccordionProvider uses React Context for state management, and the component supports both single and multiple open variants through comprehensive type definitions.

Do not deviate from this focus without explicit instruction.
All other information in this document is reference material only.

### Bugs & Challenges in the T-3.2.1
[CONDITIONAL: Include ONLY if there are active bugs or challenges. For each issue include:
1. Issue description
2. Current status
3. Attempted solutions
4. Blocking factors
Remove section if no active issues.]

The Bugs & Challenges in the Current Task are a subset of the Active Development Focus section.

### Next Steps 
1. **Phase 1 Discovery**: Execute comprehensive component discovery and classification of all T-3.2.1 elements
2. **Phase 2 Unit Testing**: Create comprehensive unit tests for all Accordion components and type definitions
3. **Phase 3 Visual Testing**: Validate component structure through visual regression testing
4. **Phase 4 Integration Testing**: Test component composition and interaction patterns
5. **Phase 5 Final Validation**: Generate comprehensive test reports and validation documentation

### Important Dependencies
[CONDITIONAL: Include ONLY if there are critical dependencies for the next steps. Each dependency must specify:
1. Dependency identifier
2. Current status
3. Impact on next steps
Remove section if no critical dependencies.]
The Important Dependencies section is a subset of the Active Development Focus section.

### Important Files
1. `aplio-modern-1/components/design-system/molecules/Accordion/index.tsx` - Main Accordion container (Server Component)
2. `aplio-modern-1/components/design-system/molecules/Accordion/AccordionItem.tsx` - Interactive accordion items (Client Component)
3. `aplio-modern-1/components/design-system/molecules/Accordion/AccordionProvider.tsx` - State management provider (Client Component)
4. `aplio-modern-1/components/design-system/molecules/Accordion/Accordion.types.ts` - Comprehensive TypeScript type definitions
5. `aplio-modern-1/components/design-system/molecules/Accordion/AccordionIcon.tsx` - Icon component with SVG implementations
6. `aplio-modern-1/components/design-system/molecules/Accordion/hooks/useAccordionAnimation.ts` - Animation state management hook
7. `aplio-modern-1/components/design-system/molecules/Accordion/Accordion.module.css` - CSS module structure
8. `aplio-modern-1/test/unit-tests/task-3-2.1/T-3.2.1/design-system-adherence-report.md` - DSAP compliance report

### Important Scripts, Markdown Files, and Specifications
1. `pmc/core/active-task.md` - Task T-3.2.1 implementation specifications and requirements
2. `pmc/core/active-task-unit-tests-2.md` - Base test plan requiring adaptation for T-3.2.1
3. `aplio-modern-1/design-system/docs/components/interactive/accordion/` - DSAP accordion-specific documentation
4. `aplio-legacy/components/home-4/CustomFAQ.jsx` - Legacy reference for single-open accordion behavior
5. `aplio-legacy/components/shared/FaqItem.jsx` - Legacy reference for individual accordion item animations

### T-3.2.1 Recent Development Context

- **Last Milestone**: Successfully completed all T-3.2.1 implementation phases (PREP, IMP, VAL) with comprehensive component structure and type definitions
- **Key Outcomes**: 
  - Complete directory structure established at `aplio-modern-1/components/design-system/molecules/Accordion/`
  - Comprehensive TypeScript types supporting both single and multiple open variants
  - Optimized server/client boundary architecture for Next.js 14
  - 100% DSAP compliance validated across all accordion-specific documentation
- **Relevant Learnings**: 
  - Legacy accordion implementation uses single-open pattern with height-based animations
  - Design system requires comprehensive accessibility support and animation state management
  - Server/client boundary optimization critical for Next.js 14 performance
- **Technical Context**: 
  - Uses React Context for state management in AccordionProvider
  - Client Components handle all interactive behavior (click handlers, animations)
  - Server Components handle static structure and initial rendering
  - CSS modules provide component-scoped styling foundation

## Critical Testing Context

**Implementation Architecture**: The Accordion component follows a composite pattern with clear server/client boundaries. The main Accordion container is a Server Component that handles initial rendering and static structure, while AccordionItem components are Client Components managing interactive behavior and state changes.

**Type System Complexity**: The TypeScript implementation includes comprehensive interfaces for AccordionState, AccordionVisualConfig, and AccordionAccessibilityConfig, supporting both single and multiple open variants through union types and conditional interfaces.

**State Management Pattern**: Uses React Context through AccordionProvider for state management, with useAccordionAnimation hook providing animation state control. This pattern requires testing for proper context propagation and state synchronization.

**Server/Client Boundary Optimization**: Critical testing area - the implementation deliberately separates static rendering (server) from interactive behavior (client) to optimize Next.js 14 performance. Testing must validate that server components render correctly and client components hydrate properly.

## Testing Focus Areas

- **High Priority**: 
  - AccordionProvider state management and context propagation
  - AccordionItem interactive behavior and event handling
  - TypeScript type safety across all component variants
  - Server/client boundary hydration and rendering

- **Medium Priority**: 
  - AccordionIcon component rendering and state transitions
  - useAccordionAnimation hook functionality
  - Component composition patterns and prop drilling
  - CSS module integration and styling structure

- **Low Priority**: 
  - Static type checking for interface compliance
  - Default prop handling and fallback behaviors
  - Import/export structure validation

## Modified Testing Approaches

**Enhanced Component Discovery**: The baseline test plan's generic component discovery must be enhanced to specifically identify and classify the T-3.2.1 composite component structure, including server/client boundary classification and state management pattern recognition.

**TypeScript Integration Testing**: Standard unit testing must be extended to include comprehensive TypeScript type checking, interface compliance validation, and conditional type behavior testing for single vs. multiple open variants.

**Next.js 14 Server/Client Testing**: Testing approach must include server-side rendering validation, client-side hydration testing, and boundary optimization verification specific to Next.js 14 App Router architecture.

## Additional Testing Needs

**Context Provider Testing**: The AccordionProvider requires specific testing for React Context functionality, including provider/consumer relationships, state propagation, and context value updates.

**Animation State Testing**: The useAccordionAnimation hook needs dedicated testing for animation state management, transition handling, and performance optimization.

**Composite Component Testing**: The accordion's composite structure requires testing for proper component composition, prop passing, and child component interaction patterns.

**DSAP Compliance Validation**: Testing must validate adherence to all discovered DSAP documentation, including component structure, accessibility requirements, and animation standards.

## Success Criteria

**Component Structure Validation**: All components must successfully import, compile, and render without TypeScript errors. Server components must render on server-side, client components must hydrate properly.

**Type System Compliance**: All TypeScript interfaces must pass strict type checking. Both single and multiple open variants must be properly typed and validated.

**State Management Functionality**: AccordionProvider must properly manage state, useAccordionAnimation must handle animation states, and all components must respond to state changes correctly.

**DSAP Adherence**: 100% compliance with all discovered DSAP documentation must be maintained, as validated in the existing adherence report.

**Test Coverage**: Minimum 90% code coverage across all T-3.2.1 component files, with comprehensive edge case testing and error handling validation.

## Testing Requirements Summary

### Mandatory Test Categories
- [ ] **Component Import/Export Testing**: All components import correctly and export proper interfaces
- [ ] **TypeScript Type Validation**: All interfaces compile and provide proper type safety
- [ ] **Server/Client Boundary Testing**: Server components render server-side, client components hydrate properly
- [ ] **State Management Testing**: AccordionProvider and useAccordionAnimation function correctly
- [ ] **Component Composition Testing**: Accordion container properly composes AccordionItem children
- [ ] **DSAP Compliance Testing**: All design system standards are met and validated
- [ ] **Animation State Testing**: useAccordionAnimation hook manages state transitions properly
- [ ] **Context Propagation Testing**: React Context properly propagates state throughout component tree

### Success Gates
- All components compile without TypeScript errors
- Server/client rendering works correctly in Next.js 14 environment
- State management functions properly across all component variants
- 90% minimum test coverage achieved
- All DSAP compliance criteria met

### Testing Agent Directives

**You must execute all testing phases in sequence**: Begin with Phase 1 component discovery, proceed through Phase 2 unit testing, continue with Phase 3 visual testing, Phase 4 integration testing, and complete with Phase 5 final validation.

**You must adapt the baseline test plan**: The existing `pmc/core/active-task-unit-tests-2.md` must be customized specifically for T-3.2.1's accordion component structure and requirements.

**You must validate server/client boundaries**: Critical requirement - test that server components render correctly and client components hydrate properly in Next.js 14 environment.

**You must test both accordion variants**: The implementation supports both single and multiple open variants - both must be tested comprehensively.

**You must verify DSAP compliance**: All design system adherence requirements must be validated against the existing compliance report.

**You must achieve 90% test coverage**: Minimum coverage requirement across all T-3.2.1 component files with comprehensive edge case testing.

**You must generate comprehensive reports**: Document all test results, coverage metrics, and validation outcomes for handoff to next development phase.

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