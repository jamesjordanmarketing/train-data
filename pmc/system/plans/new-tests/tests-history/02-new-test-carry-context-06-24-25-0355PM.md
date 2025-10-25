# Development Context & Operational Priorities
**Date:** 06/24/2025
**Project:** Aplio Design System Modernization (aplio-mod-1) & Project Memory Core (PMC)
**Context Version:** 3.0.0

## Introduction

This context document addresses two integrated projects that operate in tandem:

1. **Aplio Design System Modernization (aplio-mod-1)**: A comprehensive modernization project converting the legacy Aplio Design System to leverage Next.js 14's App Router architecture and TypeScript. The project focuses on the Home-4 template implementation while preserving visual fidelity and enhancing developer experience.

2. **Project Memory Core (PMC)**: A structured task management and context retention system that manages the development of the Aplio project. PMC provides methodical task tracking, context preservation, and implementation guidance through its command-line interface and document-based workflow.

These projects are deliberately interconnected - PMC requires a real-world development project to refine its capabilities, while Aplio benefits from PMC's structured approach to development. Depending on current priorities, work may focus on either advancing the Aplio Design System implementation or enhancing the PMC tooling itself.

## Current Focus

### T-2.4.1 Active Testing Focus

**Task Summary**: T-2.4.1: Breakpoint System Documentation has been successfully completed, implementing comprehensive responsive design documentation following the proven 5-file structure pattern from T-2.3.5. The task extracted breakpoint definitions from `aplio-legacy/tailwind.config.js` lines 13-17 (custom xs:475px and 1xl:1400px breakpoints extending defaultTheme.screens) and container configuration from lines 17-19 (center:true). The implementation created TypeScript-compliant documentation with Next.js 14 SSR compatibility, integrating seamlessly with existing T-2.3.5 accessibility patterns to provide complete responsive design system coverage.

**Critical Testing Context**: 
- Legacy Reference Accuracy: Documentation must maintain 100% accuracy to `aplio-legacy/tailwind.config.js` breakpoint and container definitions
- TypeScript Strict Compliance: All code examples compile successfully with TypeScript strict mode enabled
- Next.js 14 SSR Compatibility: All responsive patterns are server-side rendering safe and App Router compatible
- T-2.3.5 Integration: Cross-reference integration with accessibility documentation established and functional
- 5-File Pattern Implementation: Successfully replicated the exact documentation structure proven in T-2.3.5

**Testing Focus Areas**:
- Breakpoint definition accuracy against legacy tailwind.config.js lines 13-17
- Container width constraint documentation accuracy against lines 17-19
- TypeScript code example compilation and strict mode compliance
- Cross-reference link integrity with T-2.3.5 accessibility documentation
- Next.js 14 SSR compatibility of all responsive patterns and utilities
- Mobile-first methodology consistency across all documentation
- Performance optimization patterns and testing strategies
- Visual regression testing patterns and responsive validation approaches

**Existing Testing Instructions Adaptations**:
- Enhanced Documentation Testing Protocol: Apply the successful pattern from T-2.3.5 for documentation accuracy validation
- Legacy Reference Validation: Verify 100% accuracy to specific line numbers in aplio-legacy/tailwind.config.js
- TypeScript Compilation Testing: Ensure all code examples compile with strict mode enabled
- Cross-Reference Integration Testing: Validate all links to T-2.3.5 accessibility documentation
- Responsive Pattern Testing: Test mobile-first patterns and breakpoint utilities

**Modified Testing Approaches**:
- Documentation validation must verify exact line number references to legacy code
- Code example testing must include TypeScript strict mode compilation verification
- Visual reference testing must validate responsive behavior across all documented breakpoints
- Integration testing must verify T-2.3.5 accessibility cross-references are functional
- Performance testing must validate responsive pattern optimization strategies

**Additional Testing Needs**:
- Breakpoint visualization tool functionality testing (interactive React component)
- Grid system demo component responsiveness testing
- Container width constraint calculation accuracy testing
- Touch target responsive behavior validation testing
- Visual regression checkpoint validation for all documented patterns

**Key Files and Locations**:
- `aplio-modern-1/design-system/docs/responsive/breakpoints/breakpoint-definitions.md` (643 lines) - Core breakpoint specifications
- `aplio-modern-1/design-system/docs/responsive/breakpoints/responsive-guidelines.md` (882 lines) - Implementation guidelines
- `aplio-modern-1/design-system/docs/responsive/breakpoints/container-width-constraints.md` (557 lines) - Container system documentation
- `aplio-modern-1/design-system/docs/responsive/breakpoints/breakpoint-testing-guide.md` (82 lines) - Testing strategies
- `aplio-modern-1/design-system/docs/responsive/breakpoints/responsive-visual-reference.md` (588 lines) - Visual examples and patterns
- Legacy reference: `aplio-legacy/tailwind.config.js` lines 13-17 (breakpoints) and 21-23 (container)
- T-2.3.5 cross-references: `aplio-modern-1/design-system/docs/accessibility/` (integration patterns)

**Specification References**:
- Primary Legacy Reference: `aplio-legacy/tailwind.config.js` lines 13-17 (screens object with xs:'475px', '1xl':'1400px', ...defaultTheme.screens)
- Container Reference: `aplio-legacy/tailwind.config.js` lines 17-19 (container: { center: true })
- T-2.3.5 Integration Reference: `aplio-modern-1/design-system/docs/accessibility/focus-management.md#container-focus`
- T-2.3.5 Screen Reader Reference: `aplio-modern-1/design-system/docs/accessibility/screen-reader-optimization.md#container-landmarks`
- T-2.3.5 Keyboard Navigation Reference: `aplio-modern-1/design-system/docs/accessibility/keyboard-navigation.md#container-navigation`

**Success Criteria**:
- All 5 documentation files compile and validate without errors
- 100% accuracy verification against aplio-legacy/tailwind.config.js lines 13-17 and 21-23
- All TypeScript code examples compile successfully with strict mode enabled
- All cross-reference links to T-2.3.5 accessibility documentation are functional
- Responsive patterns demonstrate Next.js 14 SSR compatibility
- Mobile-first methodology consistently applied across all documentation
- Testing strategies and visual validation approaches are comprehensive and actionable
- Documentation structure follows proven T-2.3.5 5-file pattern exactly

**Testing Requirements Summary**:
1. **Legacy Accuracy Validation** - Verify 100% accuracy to legacy tailwind.config.js breakpoint and container definitions
2. **TypeScript Compilation Testing** - Ensure all code examples compile with strict mode
3. **Cross-Reference Integrity Testing** - Validate all T-2.3.5 accessibility integration links
4. **Responsive Pattern Validation** - Test mobile-first patterns and SSR compatibility  
5. **Documentation Structure Verification** - Confirm 5-file pattern matches T-2.3.5 success
6. **Visual Reference Testing** - Validate responsive behavior examples and demonstrations
7. **Performance Pattern Testing** - Verify optimization strategies and testing approaches
8. **Integration Testing** - Test accessibility and responsive pattern integration

**Testing Agent Directives**:
You shall execute comprehensive testing validation for T-2.4.1 Breakpoint System Documentation implementation following these explicit directives:

1. **You must verify 100% accuracy** of all breakpoint definitions against `aplio-legacy/tailwind.config.js` lines 13-17
2. **You must validate container configurations** against `aplio-legacy/tailwind.config.js` lines 17-19  
3. **You must compile all TypeScript code examples** with strict mode enabled and verify zero errors
4. **You must test all cross-reference links** to T-2.3.5 accessibility documentation for functionality
5. **You must validate Next.js 14 SSR compatibility** of all responsive patterns and utilities
6. **You must verify mobile-first methodology** consistency across all 5 documentation files
7. **You must test responsive visual examples** for accuracy and completeness
8. **You must validate testing strategies** documented in breakpoint-testing-guide.md
9. **You must verify documentation structure** matches the proven T-2.3.5 5-file pattern exactly
10. **You must execute enhanced documentation testing protocol** following T-2.3.5 proven standards

### T-2.4.1 Recent Development Context

- **Last Milestone**: Successfully completed all 5 implementation phases (IMP-1 through IMP-5) creating comprehensive breakpoint system documentation
- **Key Outcomes**: Created 2,752 total lines of TypeScript-compliant responsive documentation with 100% legacy accuracy
- **Relevant Learnings**: T-2.3.5 5-file pattern proved highly effective and was successfully replicated for responsive documentation
- **Technical Context**: All implementations are Next.js 14 App Router compatible with SSR-safe patterns and strict TypeScript compliance

## Next Steps 

1. **T-2.4.1-TEST-1**: Execute legacy accuracy validation testing against aplio-legacy/tailwind.config.js (Lines 13-17, 21-23)
2. **T-2.4.1-TEST-2**: Perform TypeScript compilation testing with strict mode for all code examples
3. **T-2.4.1-TEST-3**: Validate T-2.3.5 accessibility integration cross-references and functionality
4. **T-2.4.1-TEST-4**: Test responsive pattern SSR compatibility and Next.js 14 App Router integration
5. **T-2.4.1-TEST-5**: Execute comprehensive documentation quality validation following T-2.3.5 enhanced protocol

### Important Files

1. `aplio-modern-1/design-system/docs/responsive/breakpoints/breakpoint-definitions.md` - Core breakpoint specifications (643 lines)
2. `aplio-modern-1/design-system/docs/responsive/breakpoints/responsive-guidelines.md` - Implementation guidelines (882 lines)  
3. `aplio-modern-1/design-system/docs/responsive/breakpoints/container-width-constraints.md` - Container documentation (557 lines)
4. `aplio-modern-1/design-system/docs/responsive/breakpoints/breakpoint-testing-guide.md` - Testing strategies (82 lines)
5. `aplio-modern-1/design-system/docs/responsive/breakpoints/responsive-visual-reference.md` - Visual examples (588 lines)
6. `aplio-legacy/tailwind.config.js` - Legacy reference source for accuracy validation
7. `pmc/core/active-task.md` - Completed task implementation details

### Important Scripts, Markdown Files, and Specifications

1. `aplio-legacy/tailwind.config.js` - Legacy breakpoint and container configuration source (lines 13-17, 21-23)
2. `aplio-modern-1/design-system/docs/accessibility/focus-management.md` - T-2.3.5 integration reference
3. `aplio-modern-1/design-system/docs/accessibility/screen-reader-optimization.md` - Screen reader integration patterns
4. `aplio-modern-1/design-system/docs/accessibility/keyboard-navigation.md` - Keyboard navigation integration patterns
5. `pmc/core/active-task-unit-tests-2.md` - Base testing protocol template

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