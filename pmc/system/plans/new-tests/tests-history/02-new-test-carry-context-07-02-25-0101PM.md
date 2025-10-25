# Development Context & Operational Priorities
**Date:** 07-02-25-0101PM
**Project:** Aplio Design System Modernization (aplio-mod-1) & Project Memory Core (PMC)
**Context Version:** 3.0.0

## Introduction

This context document addresses two integrated projects that operate in tandem:

1. **Aplio Design System Modernization (aplio-mod-1)**: A comprehensive modernization project converting the legacy Aplio Design System to leverage Next.js 14's App Router architecture and TypeScript. The project focuses on the Home-4 template implementation while preserving visual fidelity and enhancing developer experience.

2. **Project Memory Core (PMC)**: A structured task management and context retention system that manages the development of the Aplio project. PMC provides methodical task tracking, context preservation, and implementation guidance through its command-line interface and document-based workflow.

These projects are deliberately interconnected - PMC requires a real-world development project to refine its capabilities, while Aplio benefits from PMC's structured approach to development. Depending on current priorities, work may focus on either advancing the Aplio Design System implementation or enhancing the PMC tooling itself.

## Current Focus

### T-3.1.1 Active Testing Focus

T-3.1.1 has been **SUCCESSFULLY COMPLETED** and requires comprehensive unit testing validation. This task implemented the atomic Button component that serves as the foundational reference pattern for all future atomic components in the Aplio Design System. The implementation integrates seamlessly with the T-2.5.6 styled component foundation while introducing advanced features including size variants (small/medium/large), icon placement options (left/right/none), comprehensive TypeScript type definitions, and full DSAP compliance.

**What is being tested**: The atomic Button component system including type definitions, size variants, icon placement, state management, accessibility features, and integration with T-2.5.6 CSS custom properties.

**Why it is being tested**: T-3.1.1 establishes the reference implementation pattern for all future atomic components. Complete validation ensures the component meets all DSAP specifications, maintains perfect TypeScript safety, integrates properly with existing systems, and provides the foundation for the broader design system modernization.

**Current state of implementation**: FULLY IMPLEMENTED and DSAP COMPLIANT (10/10 score). All acceptance criteria met including atomic design structure, comprehensive type definitions, variant system integration, export conventions, and accessibility compliance.

**Critical context needed for continuation**: The implementation leverages T-2.5.6 CSS custom properties exclusively (no JavaScript theme props), uses discriminated union types for variant safety, implements atomic design principles at `components/design-system/atoms/Button/`, and maintains exact DSAP specifications (30px padding, 30px border-radius, Inter font, 500ms transitions).

Do not deviate from this focus without explicit instruction.
All other information in this document is reference material only.

### Bugs & Challenges in the T-3.1.1
[CONDITIONAL: Include ONLY if there are active bugs or challenges. For each issue include:
1. Issue description
2. Current status
3. Attempted solutions
4. Blocking factors
Remove section if no active issues.]

The Bugs & Challenges in the Current Task are a subset of the Active Development Focus section.

### Next Steps 

1. **Unit Testing Execution**: Execute comprehensive testing protocol to validate all component functionality including type safety, variant rendering, icon placement, accessibility compliance, and DSAP adherence
2. **Integration Testing**: Verify seamless integration with T-2.5.6 foundation and CSS custom property theming system
3. **Visual Validation**: Confirm component renders correctly across all variants, sizes, and theme states
4. **Performance Testing**: Validate component performance and bundle optimization
5. **Documentation Validation**: Verify DSAP adherence report accuracy and completeness

### Important Dependencies
[CONDITIONAL: Include ONLY if there are critical dependencies for the next steps. Each dependency must specify:
1. Dependency identifier
2. Current status
3. Impact on next steps
Remove section if no critical dependencies.]
The Important Dependencies section is a subset of the Active Development Focus section.

### Important Files

1. **aplio-modern-1/components/design-system/atoms/Button/index.tsx** - Main atomic Button component with comprehensive implementation (11.4KB)
2. **aplio-modern-1/components/design-system/atoms/Button/Button.types.ts** - Complete TypeScript type definitions and configurations (8.1KB)  
3. **aplio-modern-1/components/design-system/index.ts** - Updated with Button component exports and type exports
4. **aplio-modern-1/test/unit-tests/task-3-1/T-3.1.1/design-system-adherence-report.md** - Comprehensive DSAP compliance report (10/10 score)
5. **aplio-modern-1/components/design-system/system/styled.tsx** - T-2.5.6 foundation system that Button extends
6. **aplio-modern-1/styles/globals/variables.css** - CSS custom properties referenced by Button component
7. **aplio-modern-1/design-system/docs/components/core/buttons.md** - DSAP button specifications and requirements

### Important Scripts, Markdown Files, and Specifications

1. **pmc/core/active-task.md** - Complete T-3.1.1 implementation specifications and acceptance criteria
2. **pmc/system/plans/new-panels/02-new-task-carry-context-07-01-25-0845PM.md** - T-2.5.6 foundation context and integration requirements
3. **aplio-modern-1/design-system/docs/components/core/buttons.md** - DSAP compliance specifications (30px padding, 30px border-radius, 500ms transitions)
4. **aplio-legacy/scss/_button.scss** - Legacy button implementation patterns used for reference
5. **aplio-legacy/components/home-4/Hero.jsx** - Legacy button usage patterns examined during implementation

### T-3.1.1 Recent Development Context

- **Last Milestone**: T-3.1.1 COMPLETED with perfect DSAP compliance and full integration with T-2.5.6 foundation
- **Key Outcomes**: Atomic Button component with comprehensive type definitions, size variants, icon placement, accessibility features, and CSS-only theming
- **Relevant Learnings**: Successful integration of discriminated union types with CSS custom properties enables type-safe theming without JavaScript re-renders
- **Technical Context**: Component uses T-2.5.6 styled component patterns, references `--aplio-button-*` CSS variables exclusively, and maintains atomic design structure

## Critical Testing Context

### Implementation Details Affecting Test Design

**CSS-Only Theming System**: The Button component uses CSS custom properties (`--aplio-button-*`) exclusively for theming. Tests must verify that theme switching works without JavaScript props and that no component re-renders occur during theme changes.

**Discriminated Union Type System**: Button variants use discriminated unions that ensure type safety. Tests must validate that invalid variant combinations are caught by TypeScript and that variant props map correctly to CSS classes.

**Atomic Design Structure**: Component is located at `components/design-system/atoms/Button/` following atomic design principles. Tests must verify proper file organization and export structure.

**DSAP Compliance Requirements**: Component must maintain exact specifications: 30px padding (medium), 30px border-radius, Inter font family, 500ms transitions. Tests must measure these exact values.

**T-2.5.6 Foundation Integration**: Component extends existing styled component system. Tests must verify that integration works correctly and no conflicts exist with the foundation system.

### Testing Focus Areas

• **Type Safety Validation**: Comprehensive TypeScript type checking for ButtonProps, ExtendedButtonVariant, ButtonSize, IconPlacement interfaces
• **Size Variant Rendering**: Accurate rendering of small (24px/8px), medium (30px/13px), and large (40px/16px) padding configurations  
• **Icon Placement Functionality**: Proper positioning and spacing of left/right icons with different button sizes
• **CSS Variable Integration**: Correct referencing of `--aplio-button-*` custom properties for all styling
• **Accessibility Compliance**: ARIA attributes, keyboard navigation, focus management, and screen reader compatibility
• **Loading and Disabled States**: State management functionality and visual feedback
• **Export Structure Validation**: Proper component and type exports consumable by other parts of the system
• **DSAP Adherence Verification**: Exact measurement of padding, border-radius, typography, and transition specifications

### Existing Testing Instructions Adaptations

The baseline unit-test file `pmc/core/active-task-unit-tests-2.md` requires these adaptations:

**Component Discovery Updates**: 
- Focus on 3 specific T-3.1.1 elements: Button component structure (ELE-1), Button types (ELE-2), Export structure (ELE-3)
- Implementation location: `aplio-modern-1/components/design-system/atoms/Button/`
- No legacy references available for this atomic component

**Testing Approach Modifications**:
- Add size variant testing (small/medium/large) not covered in generic protocol
- Include icon placement validation (left/right/none positioning)
- Verify CSS custom property integration with T-2.5.6 foundation
- Test discriminated union type safety and variant mapping

**Validation Criteria Enhancements**:
- DSAP compliance measurement with exact pixel values
- CSS variable reference verification across light/dark themes
- TypeScript compilation success with strict type checking
- Component consumability from design system exports

### Modified Testing Approaches

**CSS-in-JS Validation**: Instead of traditional CSS testing, validate that component uses CSS custom properties correctly and no inline styles override the CSS cascade system.

**Type System Testing**: Use TypeScript compiler API to validate type definitions and catch type errors during testing rather than runtime validation.

**Theme Integration Testing**: Test theme switching by modifying CSS custom property values rather than passing JavaScript theme objects.

**DSAP Measurement Testing**: Use automated measurement tools to verify exact padding, border-radius, and typography specifications rather than visual inspection.

**Component Integration Testing**: Test component consumption through the design system exports rather than direct file imports.

### Additional Testing Needs

**Icon Library Integration Testing**: Validate that component works with both React component icons and React element icons with proper sizing and positioning.

**Performance Testing**: Verify that component memoization prevents unnecessary re-renders and that bundle size is optimized for tree-shaking.

**Cross-Browser Compatibility**: Test CSS custom property support and component rendering across different browsers.

**Responsive Behavior Testing**: Validate component behavior across different screen sizes and breakpoints.

**State Transition Testing**: Test loading state animations and disabled state interactions.

**Edge Case Handling**: Test component behavior with empty children, invalid props, and edge case configurations.

### Eliminated Requirements

**JavaScript Theme Testing**: No longer needed as component uses CSS-only theming
**Legacy Pattern Validation**: No legacy references available for atomic components  
**Server-Side Rendering Testing**: Component is client-side only with proper SSR safety
**CSS-in-JS Performance Testing**: Not applicable as component uses CSS custom properties
**Theme Provider Testing**: Not needed as theming is handled by CSS cascade

### Success Criteria

**Type Safety**: All TypeScript interfaces compile without errors and provide proper IntelliSense
**DSAP Compliance**: Component measures exactly 30px padding (medium), 30px border-radius, Inter font, 500ms transitions
**Variant Rendering**: All 5 variants (primary, secondary, tertiary, outline, navbar) render with correct CSS classes
**Size Scaling**: All 3 sizes render with proportionally correct padding and typography
**Icon Functionality**: Left and right icon placement works with proper spacing across all sizes
**Accessibility**: Component meets WCAG guidelines with proper ARIA attributes and keyboard navigation
**Integration**: Component exports successfully from design system and integrates with T-2.5.6 foundation
**Performance**: Component renders without unnecessary re-renders and supports tree-shaking
**Theme Support**: Component switches themes automatically via CSS custom properties

### Testing Requirements Summary

**Mandatory Tests**:
- [ ] TypeScript compilation and type validation  
- [ ] Component rendering across all variants and sizes
- [ ] DSAP compliance measurement (padding, border-radius, typography, transitions)
- [ ] Icon placement functionality (left/right positioning)
- [ ] CSS custom property integration validation
- [ ] Accessibility compliance (ARIA, keyboard navigation, focus management)
- [ ] Loading and disabled state behavior
- [ ] Export structure validation
- [ ] Theme switching functionality
- [ ] Performance and optimization verification

**Success Gates**:
- [ ] All TypeScript types compile without errors
- [ ] Component renders correctly in all 15 variant/size combinations  
- [ ] DSAP measurements match specifications within 1px tolerance
- [ ] Accessibility tests pass with 100% compliance
- [ ] Integration tests pass with T-2.5.6 foundation
- [ ] Performance tests show no unnecessary re-renders
- [ ] Bundle size optimization confirmed

**File Targets**:
- [ ] `aplio-modern-1/components/design-system/atoms/Button/index.tsx`
- [ ] `aplio-modern-1/components/design-system/atoms/Button/Button.types.ts`
- [ ] `aplio-modern-1/components/design-system/index.ts`
- [ ] CSS custom properties in `aplio-modern-1/styles/globals/variables.css`

### Testing Agent Directives

You shall execute testing in the following order:

1. **Environment Setup**: You must navigate to `aplio-modern-1` directory and start the test infrastructure
2. **Component Discovery**: You shall analyze the 3 T-3.1.1 elements and log findings to `current-test-discovery.md`  
3. **Type Validation**: You must validate all TypeScript interfaces and type definitions compile successfully
4. **Rendering Tests**: You shall test all 15 variant/size combinations render correctly
5. **DSAP Compliance**: You must measure component specifications and verify exact DSAP adherence
6. **Integration Testing**: You shall validate integration with T-2.5.6 foundation and CSS custom properties
7. **Accessibility Testing**: You must verify complete ARIA compliance and keyboard navigation
8. **Performance Validation**: You shall confirm optimization and tree-shaking support
9. **Documentation**: You must generate comprehensive test reports and validate DSAP adherence report accuracy

You must not proceed to the next testing phase until the current phase passes all validation criteria.

You shall report any test failures immediately and attempt fixes following the Fix/Test/Analyze cycle pattern before continuing.

You must maintain focus exclusively on T-3.1.1 Button component testing and not deviate to other components or tasks.

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
```

#### Project Structure
```
project-root/aplio-legacy/ (legacy system)
project-root/aplio-modern-1/ (new system)
project-root/pmc/ (PMC system)
```