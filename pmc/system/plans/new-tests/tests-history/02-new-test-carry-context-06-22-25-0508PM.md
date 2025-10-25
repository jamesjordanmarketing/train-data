# Development Context & Operational Priorities
**Date:** 06/22/2025
**Project:** Aplio Design System Modernization (aplio-mod-1) & Project Memory Core (PMC)
**Context Version:** 3.0.0

## Introduction

This context document addresses the testing requirements for the recently completed T-2.2.5: Accordion and FAQ Component Visual Documentation task within the Aplio Design System Modernization project.

## T-2.2.5 Active Testing Focus

### Task Summary
The T-2.2.5 task focused on creating comprehensive visual documentation for accordion and FAQ components by analyzing legacy FaqItem.jsx (49 lines) and CustomFAQ.jsx (36 lines) components to document their design patterns, interaction states, animations, and accessibility requirements. This documentation task ensures all interactive element specifications are captured for the Next.js 14 modernization effort.

### Critical Testing Context
The implementation created documentation files in the `design-system/docs/components/interactive/accordion/` directory, analyzing complex useRef-based height animation systems, state management patterns using activeIndex toggle system, and dark mode variants. The documentation captured animation timing, visual state transitions, and accessibility requirements without creating actual functional components.

### Testing Focus Areas
- **Visual Documentation Accuracy**: Verify all documented design patterns match the legacy implementations
- **Animation Specifications**: Confirm expand/collapse animations, timing, and transitions are accurately documented
- **Accessibility Documentation**: Validate keyboard navigation patterns and ARIA attribute requirements are complete
- **Dark Mode Coverage**: Ensure all visual states include corresponding dark theme variants
- **Container Layout Architecture**: Verify complex CSS selector spacing documentation accuracy

### Existing Testing Instructions Adaptations
The baseline unit-test file needs significant adaptation because:
- **Documentation Focus**: Unlike typical component testing, this task created documentation files rather than functional components
- **Legacy Analysis Validation**: Tests must validate documentation accuracy against legacy component implementations
- **Visual Specification Testing**: Tests need to verify documented specifications can be implemented as actual components
- **File Structure Validation**: Tests must confirm all required documentation files exist in correct locations

### Modified Testing Approaches
- **Documentation Validation**: Instead of testing functional behavior, tests validate documentation completeness and accuracy
- **Legacy Comparison**: Tests must compare documented specifications against actual legacy component implementations
- **Specification Compliance**: Tests verify that documented patterns follow design system standards
- **Implementation Readiness**: Tests ensure documentation provides sufficient detail for future component implementation

### Eliminated Requirements
- **Functional Component Testing**: No functional components were created, eliminating standard React component testing
- **User Interaction Testing**: Documentation task eliminates interactive behavior testing
- **Runtime Performance Testing**: No runtime components to test for performance

### Additional Testing Needs
- **Documentation File Existence**: Verify all required documentation files exist in correct directory structure
- **Content Completeness**: Validate documentation covers all required elements (ELE-1 through ELE-4)
- **Legacy Reference Accuracy**: Confirm documented patterns match legacy implementations
- **Specification Format Validation**: Ensure documentation follows established design system documentation standards
- **Implementation Guidance Quality**: Verify documentation provides sufficient detail for component implementation

### Key Files and Locations
- **Documentation Output**: `design-system/docs/components/interactive/accordion/` directory
- **Legacy References**: 
  - `aplio-legacy/components/shared/FaqItem.jsx` (lines 4-48 for accordion implementation)
  - `aplio-legacy/components/home-4/CustomFAQ.jsx` (lines 6-36 for FAQ section layout)
- **Task Specification**: `pmc/core/active-task.md`
- **Test Configuration**: `test/unit-tests/task-2-2.5/T-2.2.5/` directory

### Specification References
- **Pattern Reference**: P008-COMPONENT-VARIANTS for component variant documentation
- **Legacy Code References**: 
  - FaqItem.jsx:4-48 (accordion implementation)
  - CustomFAQ.jsx:6-36 (FAQ section layout)
  - FaqItem.jsx:39-43 (interactions)
  - FaqItem.jsx:7-10 (accessibility)
- **Implementation Location**: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-modern-1\design-system\docs\components\interactive\accordion\`

### Success Criteria
- All documentation files exist in the correct directory structure
- Documentation accurately reflects legacy component implementations
- All four elements (ELE-1 through ELE-4) are comprehensively documented
- Documentation provides sufficient detail for component modernization
- Accessibility requirements are thoroughly documented
- Animation specifications include timing and transition details
- Dark mode variants are documented for all visual states

### Testing Requirements Summary
**Mandatory Tests:**
- [ ] Verify documentation file existence and structure
- [ ] Validate documentation content against legacy implementations
- [ ] Confirm all four elements are documented (ELE-1 through ELE-4)
- [ ] Verify animation specifications are complete and accurate
- [ ] Validate accessibility documentation completeness
- [ ] Confirm dark mode variants are documented

**Success Gates:**
- All documentation files exist in correct locations
- Documentation content matches legacy implementation patterns
- All acceptance criteria fulfilled
- Documentation provides implementation-ready specifications

**File Targets:**
- Documentation files in `design-system/docs/components/interactive/accordion/`
- Legacy reference files validation
- Test files in `test/unit-tests/task-2-2.5/T-2.2.5/`

### Testing Agent Directives
1. **You shall** verify all documentation files exist in the specified directory structure
2. **You must** validate documentation content against legacy component implementations
3. **You shall** confirm all four elements (ELE-1 through ELE-4) are comprehensively documented
4. **You must** verify animation specifications include timing and transition details
5. **You shall** validate accessibility documentation covers keyboard navigation and ARIA requirements
6. **You must** confirm dark mode variants are documented for all visual states
7. **You shall** ensure documentation provides sufficient detail for component implementation
8. **You must** execute the complete testing protocol from environment setup through visual validation
9. **You shall** document any discrepancies between documentation and legacy implementations
10. **You must** generate comprehensive test reports with clear pass/fail criteria

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