# Development Context & Operational Priorities
**Date:** 07-01-25
**Project:** Aplio Design System Modernization (aplio-mod-1) & Project Memory Core (PMC)
**Context Version:** 3.0.0

## Introduction

This context document addresses two integrated projects that operate in tandem:

1. **Aplio Design System Modernization (aplio-mod-1)**: A comprehensive modernization project converting the legacy Aplio Design System to leverage Next.js 14's App Router architecture and TypeScript. The project focuses on the Home-4 template implementation while preserving visual fidelity and enhancing developer experience.

2. **Project Memory Core (PMC)**: A structured task management and context retention system that manages the development of the Aplio project. PMC provides methodical task tracking, context preservation, and implementation guidance through its command-line interface and document-based workflow.

These projects are deliberately interconnected - PMC requires a real-world development project to refine its capabilities, while Aplio benefits from PMC's structured approach to development. Depending on current priorities, work may focus on either advancing the Aplio Design System implementation or enhancing the PMC tooling itself.

## Current Focus

### T-2.5.6 Active Testing Focus

### Task Summary
T-2.5.6: Styling System Integration with Components has been successfully completed, implementing a comprehensive type-safe styled component system that integrates with the existing T-2.5.5 CSS foundation. The implementation creates TypeScript-safe component variants that leverage existing `--aplio-*` CSS variables (25 button, 9 card, 15 input variables) for automatic theme switching without JavaScript re-renders. The system includes discriminated union variant types, style composition utilities, design token usage patterns, and a fully functional Button component example demonstrating all integration patterns with mandatory DSAP compliance (30px padding, 30px border-radius, Inter font, 500ms transitions).

### Critical Testing Context
- **CSS Variable Integration**: All styling uses existing `--aplio-*` CSS variables from T-2.5.5 foundation, NOT JavaScript theme objects
- **No Theme Props**: Theme switching occurs through CSS cascade only - components must not re-render on theme changes
- **TypeScript Safety**: Full type safety implemented while maintaining CSS custom property integration
- **DSAP Compliance Mandatory**: All components must adhere to Design System Adherence Protocol with exact specifications (30px padding, 30px border-radius for buttons)
- **Responsive Integration**: Must work with established 7 breakpoints (xs:475px through 2xl:1536px)
- **CSS-Based Architecture**: No inline styles - all styling through CSS classes and custom properties

### Testing Focus Areas
- **Type-Safe Styled Component Foundation (ELE-1)**: CSS custom property integration with TypeScript interfaces
- **Discriminated Union Variant System (ELE-2)**: Component variant types using discriminated unions for button, card, input categories
- **Style Composition Utilities (ELE-3)**: Reusable composition patterns enhancing T-2.5.4 composition.ts system  
- **Design Token Usage Patterns (ELE-4)**: Patterns for referencing CSS custom properties as authoritative design token source
- **Working Button Component Example**: Complete implementation demonstrating all 4 elements with DSAP compliance
- **Theme Switching Validation**: CSS-based theme switching without component re-renders
- **TypeScript Compilation**: All components must compile without TypeScript errors
- **Responsive Behavior**: Component behavior across all 7 defined breakpoints

### Existing Testing Instructions Adaptations
The base test plan in `pmc/core/active-task-unit-tests-2.md` requires these critical adaptations:
- **Component Discovery (Phase 1)**: Focus on 5 main implementation files rather than generic components
- **Type Safety Validation**: Add TypeScript compilation checks for all styled component interfaces
- **CSS Variable Testing**: Validate CSS custom property integration rather than JavaScript theme objects
- **Theme Switching Tests**: Test CSS-based theme switching without component re-renders
- **DSAP Compliance Validation**: Verify exact button specifications (30px padding, 30px radius, Inter font, 500ms transitions)
- **Integration Testing**: Validate integration with existing T-2.5.4 composition system at `aplio-modern-1/styles/system/composition.ts`

### Modified Testing Approaches
- **Visual Testing**: Must validate DSAP compliance visually with exact measurements (30px padding, 30px radius)
- **Theme Testing**: Test theme switching through CSS variable changes, not JavaScript prop changes
- **TypeScript Testing**: Validate discriminated union types work correctly with variant resolution
- **Composition Testing**: Test integration with existing T-2.5.4 composition utilities
- **Token Testing**: Validate CSS custom property availability and correct mapping

### Additional Testing Needs
The following test scenarios became necessary due to implementation specifics:
- **AplioStyleComposer Class Testing**: Validate style composition patterns work correctly
- **AplioTokens Class Testing**: Test design token usage utilities function properly
- **useAplioToken Hook Testing**: Validate reactive token access in React components
- **ButtonVariantResolver Testing**: Test discriminated union handling for button variants
- **CSS Variable Mapping Testing**: Ensure all TypeScript interfaces correctly map to CSS variables
- **Cross-Theme Consistency Testing**: Validate components render consistently across light/dark themes
- **Responsive Token Testing**: Test CSS custom properties work across all 7 breakpoints

### Key Files and Locations
**Primary Implementation Files:**
- `aplio-modern-1/components/design-system/system/styled.tsx` - Core styled component system (main implementation)
- `aplio-modern-1/components/design-system/system/Button.tsx` - Example Button component demonstrating all patterns
- `aplio-modern-1/components/design-system/system/index.ts` - System exports and centralized access
- `aplio-modern-1/components/design-system/system/test-integration.tsx` - Integration validation tests

**Supporting Files:**
- `aplio-modern-1/styles/globals/variables.css` - 256 lines of CSS custom properties (existing)
- `aplio-modern-1/styles/system/composition.ts` - T-2.5.4 composition system (835 lines, existing)
- `aplio-modern-1/test/unit-tests/task-2-5/T-2.5.6/design-system-adherence-report.md` - DSAP compliance documentation

### Specification References
**DSAP Documentation (Critical for Testing):**
- `aplio-modern-1/design-system/docs/components/core/buttons.md` - Button specifications (30px padding, 30px radius, Inter font, 500ms transitions)
- `aplio-modern-1/design-system/docs/responsive/breakpoints/breakpoint-definitions.md` - 7 breakpoints system definitions
- `aplio-modern-1/design-system/docs/architecture/component-hierarchy.md` - Component relationship specifications
- `aplio-modern-1/design-system/docs/components/core/cards.md` - Card shadow system, 20px radius specifications
- `aplio-modern-1/design-system/docs/components/core/inputs.md` - Input specifications (48px radius for pill-shaped inputs)

**Implementation References:**
- `pmc/core/active-task.md` lines 1-408 - Complete task specifications and implementation approach
- `aplio-modern-1/styles/design-tokens/colors.ts` lines 67-141 - Legacy type integration patterns for reference
- `pmc/system/plans/new-panels/02-new-task-carry-context-07-01-25-0252PM.md` - T-2.5.5 completion context

### Success Criteria
You must achieve ALL of the following measurable conditions for a "pass":
- **TypeScript Compilation**: All styled component files compile without TypeScript errors
- **CSS Variable Integration**: All components correctly reference `--aplio-*` CSS variables
- **Theme Switching**: Theme changes occur without component re-renders (validate with React DevTools)
- **DSAP Compliance**: Button component has exact 30px padding, 30px border-radius, Inter font, 500ms transitions
- **Variant System**: All discriminated union types resolve correctly to appropriate CSS classes
- **Responsive Behavior**: Components function correctly across all 7 breakpoints (xs:475px through 2xl:1536px)
- **Composition Integration**: Style composition utilities work with existing T-2.5.4 system
- **Design Token Access**: All CSS custom properties accessible through TypeScript interfaces
- **Visual Consistency**: Components render identically across light/dark themes
- **Test Coverage**: All 4 implementation elements validated through automated tests

### Testing Requirements Summary
**Mandatory Tests Checklist:**
- [ ] TypeScript compilation validation for all 5 implementation files
- [ ] CSS custom property integration testing for all component categories (button, card, input, text, bg, border, shadow, spacing, radius)
- [ ] Discriminated union variant system testing for ButtonVariant, CardVariant, InputVariant types
- [ ] Style composition utilities testing with T-2.5.4 integration
- [ ] Design token usage patterns validation
- [ ] DSAP compliance measurement (exact 30px padding, 30px radius for buttons)
- [ ] Theme switching validation without component re-renders
- [ ] Responsive behavior testing across 7 breakpoints
- [ ] Integration testing with existing composition.ts system (835 lines)
- [ ] AplioStyleComposer class functionality validation
- [ ] AplioTokens class functionality validation
- [ ] useAplioToken hook functionality validation
- [ ] ButtonVariantResolver discriminated union handling validation
- [ ] Visual consistency validation across themes
- [ ] Performance validation (no JavaScript re-renders on theme changes)

**Success Gates:**
- All TypeScript interfaces compile successfully
- All CSS variables accessible and correctly typed
- Theme switching demonstrates no component re-renders
- Button component meets exact DSAP specifications
- Integration with T-2.5.4 composition system verified
- All 4 implementation elements demonstrate full functionality

**File Targets:**
- Primary: 4 implementation files in `aplio-modern-1/components/design-system/system/`
- Integration: `aplio-modern-1/styles/system/composition.ts` compatibility
- Documentation: `aplio-modern-1/test/unit-tests/task-2-5/T-2.5.6/design-system-adherence-report.md`

### Testing Agent Directives
You shall execute testing in this exact sequence:

**PHASE 0: Environment Setup**
You must navigate to aplio-modern-1 directory and establish test infrastructure before any validation.

**PHASE 1: Component Discovery**  
You shall document all 5 implementation files in `pmc/system/plans/task-approach/current-test-discovery.md` with their specific testing requirements.

**PHASE 2: TypeScript Validation**
You must compile all TypeScript files and validate all interface definitions resolve correctly to CSS custom properties.

**PHASE 3: CSS Integration Testing**
You shall validate all `--aplio-*` CSS variable references work correctly through TypeScript interfaces.

**PHASE 4: Variant System Testing**
You must test all discriminated union types (ButtonVariant, CardVariant, InputVariant) resolve to correct CSS classes.

**PHASE 5: Composition System Integration**
You shall validate integration with existing T-2.5.4 composition.ts system (835 lines) functions correctly.

**PHASE 6: DSAP Compliance Validation**
You must measure exact specifications: 30px padding, 30px border-radius, Inter font, 500ms transitions for button components.

**PHASE 7: Theme Switching Validation**
You shall validate theme changes occur through CSS only without component re-renders using React DevTools.

**PHASE 8: Responsive Testing**
You must test component behavior across all 7 breakpoints (xs:475px through 2xl:1536px).

**PHASE 9: Visual Validation**
You shall capture screenshots and validate visual consistency across light/dark themes.

**PHASE 10: Integration Testing**
You must run comprehensive integration tests validating all 4 elements work together correctly.

**Error Handling Protocol:**
For any test failure, you must:
1. Document the specific failure with error messages
2. Attempt automated correction if possible
3. Re-run the failed test
4. Continue until success or maximum 3 attempts
5. Report any unresolved failures with detailed context

**Completion Requirements:**
All phases must pass completely before declaring testing successful. No partial success accepted.

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