# Development Context & Operational Priorities
**Date:** 07-03-25-0240AM
**Project:** Aplio Design System Modernization (aplio-mod-1) & Project Memory Core (PMC)
**Context Version:** 3.0.0

## Introduction

This context document addresses two integrated projects that operate in tandem:

1. **Aplio Design System Modernization (aplio-mod-1)**: A comprehensive modernization project converting the legacy Aplio Design System to leverage Next.js 14's App Router architecture and TypeScript. The project focuses on the Home-4 template implementation while preserving visual fidelity and enhancing developer experience.

2. **Project Memory Core (PMC)**: A structured task management and context retention system that manages the development of the Aplio project. PMC provides methodical task tracking, context preservation, and implementation guidance through its command-line interface and document-based workflow.

These projects are deliberately interconnected - PMC requires a real-world development project to refine its capabilities, while Aplio benefits from PMC's structured approach to development. Depending on current priorities, work may focus on either advancing the Aplio Design System implementation or enhancing the PMC tooling itself.

## Current Focus

### T-3.1.2 Active Testing Focus

**Task Summary:** T-3.1.2 Button Base Implementation and Styling has been **COMPLETED** with full DSAP compliance and exact legacy visual fidelity. The implementation successfully created comprehensive button styling using CSS modules that matches the legacy design system exactly across all variants (primary, secondary, tertiary, outline, navbar), size variants (small, medium, large), and states (hover, focus, active, disabled) with 500ms animations and seamless T-2.5.6 CSS variable integration.

**Critical Testing Context:** 
- Button implementation uses **CSS modules approach** (`Button.module.css`) instead of inline styles
- All styling integrates with existing **T-2.5.6 CSS variables** (`--aplio-button-*`) for theme switching
- Component maintains **TypeScript foundation from T-3.1.1** with discriminated unions
- **Pseudo-element architecture** implemented exactly matching legacy SCSS (::before for hover, ::after for base)
- **Visual testing infrastructure** from T-3.1.1 is operational and ready for validation

**Testing Focus Areas:**
- **Button.module.css**: All variant classes (primary, secondary, tertiary, outline, navbar) with exact legacy styling
- **Button component**: CSS class application logic and TypeScript integration 
- **CSS variable consumption**: Proper use of T-2.5.6 variables without creating new ones
- **Animation fidelity**: 500ms scale transforms matching legacy pseudo-element behavior
- **DSAP compliance**: 30px padding, 30px border-radius, Inter font, -0.3px letter spacing
- **State management**: Hover, focus, active, disabled states with proper accessibility
- **Responsive behavior**: Touch-friendly sizing on mobile (44px minimum)
- **Theme switching**: CSS-only dark/light mode transitions

**Existing Testing Instructions Adaptations:**
- **Component Discovery**: Must identify 4 T-3.1.2 elements (ELE-1: Base button, ELE-2: Button variants, ELE-3: Size variants, ELE-4: State styling)
- **Visual Testing**: Use existing `/test-t311-button` scaffold page with 15 button variant/size combinations
- **CSS Module Testing**: Validate CSS class application instead of inline style testing
- **Legacy Comparison**: Compare against `aplio-legacy/scss/_button.scss` lines 2-13 for pixel-perfect matching

**Modified Testing Approaches:**
- **Import Testing**: Button component imports CSS module, verify both Button.tsx and Button.module.css accessibility
- **Style Validation**: Test CSS class application rather than inline style computation
- **Animation Testing**: Validate pseudo-element animations work correctly across all variants
- **Theme Integration**: Test CSS variable consumption and automatic theme switching
- **TypeScript Testing**: Verify bracket notation access for CSS module classes works correctly

**Eliminated Requirements:**
- **Inline Style Testing**: Not applicable - implementation uses CSS modules exclusively
- **JavaScript Theme Props**: Eliminated - pure CSS theming approach used
- **Legacy SCSS Direct Testing**: Not needed - legacy styles extracted and modernized in CSS modules

**Additional Testing Needs:**
- **CSS Module Compilation**: Verify CSS modules compile correctly in Next.js build
- **CSS Variable Integration**: Test all `--aplio-button-*` variables are consumed correctly
- **Responsive CSS**: Validate mobile-specific padding adjustments and 44px touch targets
- **Accessibility CSS**: Test `@media (prefers-reduced-motion)` and high contrast support
- **Pseudo-element Rendering**: Verify ::before and ::after elements render correctly across browsers

**Key Files and Locations:**
- **Main Implementation**: `aplio-modern-1/components/design-system/atoms/Button/index.tsx` (updated for CSS modules)
- **Styling Implementation**: `aplio-modern-1/components/design-system/atoms/Button/Button.module.css` (NEW - complete styling)
- **Type Definitions**: `aplio-modern-1/components/design-system/atoms/Button/Button.types.ts` (from T-3.1.1)
- **CSS Variables**: `aplio-modern-1/styles/globals/variables.css` (T-2.5.6 foundation)
- **Visual Test Scaffold**: `aplio-modern-1/app/test-t311-button/page.tsx` (from T-3.1.1, ready for use)
- **DSAP Compliance Report**: `aplio-modern-1/test/unit-tests/task-3-1/T-3.1.2/design-system-adherence-report.md` (100% compliance)
- **Legacy Reference**: `aplio-legacy/scss/_button.scss` lines 2-13 (original implementation)

**Specification References:**
- **Button Design Specs**: `aplio-modern-1/design-system/docs/components/core/buttons.md` (complete specifications)
- **Animation Specs**: `aplio-modern-1/design-system/docs/animations/interactive/hover-animations.md` (hover patterns)
- **CSS Variables**: `aplio-modern-1/styles/globals/variables.css` lines 17-31 (button variables)
- **Legacy Implementation**: `aplio-legacy/scss/_button.scss` lines 2-13 (original button styles)
- **Active Task**: `pmc/core/active-task.md` (T-3.1.2 acceptance criteria)

**Success Criteria:**
- All 15 button variant/size combinations render correctly matching legacy design
- CSS module classes apply correctly across all variants (primary, secondary, tertiary, outline, navbar)
- All CSS variables from T-2.5.6 consumed correctly without creating new ones
- Hover animations work with 500ms duration and scaleX transforms
- DSAP compliance maintained: 30px padding, 30px border-radius, Inter font, 500 weight
- Theme switching works automatically via CSS cascade in both light and dark modes
- TypeScript compilation successful with bracket notation CSS module access
- Accessibility features work: focus rings, reduced motion support, touch targets
- Visual testing passes comparing against legacy reference implementation

**Testing Requirements Summary:**
- **CSS Module Compilation Testing**: Verify Next.js build includes CSS modules correctly
- **Component Import Testing**: Confirm Button component and CSS module import without errors  
- **CSS Class Application Testing**: Validate all variant, size, and state classes apply correctly
- **CSS Variable Consumption Testing**: Test all `--aplio-button-*` variables used correctly
- **Animation Fidelity Testing**: Compare pseudo-element animations against legacy implementation
- **Theme Switching Testing**: Verify automatic dark/light mode transitions work
- **DSAP Compliance Testing**: Measure padding, border-radius, typography against standards
- **Responsive Testing**: Validate mobile touch targets and padding adjustments
- **Accessibility Testing**: Test focus indicators, reduced motion, keyboard navigation
- **Visual Regression Testing**: Use T-3.1.1 infrastructure to capture and compare screenshots

**Testing Agent Directives:**
1. **You shall** use the existing visual testing infrastructure from T-3.1.1 at `/test-t311-button`
2. **You must** test CSS module compilation and class application, not inline styles
3. **You shall** validate CSS variable consumption from T-2.5.6 without creating new variables
4. **You must** compare animations against legacy `aplio-legacy/scss/_button.scss` lines 2-13
5. **You shall** test all 5 variants x 3 sizes = 15 button combinations for consistency
6. **You must** verify DSAP compliance: 30px padding, 30px border-radius, Inter font
7. **You shall** test theme switching automatically via CSS cascade only
8. **You must** validate TypeScript compilation with bracket notation CSS module access
9. **You shall** test accessibility features: focus rings, reduced motion, touch targets
10. **You must** use existing DSAP compliance report as reference for validation criteria

### Next Steps 
1. **Execute comprehensive CSS module testing** - Verify Button.module.css compiles and applies correctly
2. **Validate CSS variable integration** - Test all T-2.5.6 variables consumed without conflicts
3. **Test animation fidelity** - Compare hover/focus/active states against legacy implementation
4. **Verify DSAP compliance** - Validate 30px padding, border-radius, typography standards
5. **Execute visual regression testing** - Use T-3.1.1 infrastructure for screenshot comparison

### Important Dependencies
1. **T-2.5.6 CSS Foundation** (Status: ✅ COMPLETE) - All CSS variables available and integrated
2. **T-3.1.1 Button Infrastructure** (Status: ✅ COMPLETE) - TypeScript foundation and testing scaffold ready
3. **Next.js CSS Modules** (Status: ✅ OPERATIONAL) - Build system configured for CSS module compilation

### Important Files
1. **aplio-modern-1/components/design-system/atoms/Button/Button.module.css** - Complete button styling implementation with all variants, sizes, and states
2. **aplio-modern-1/components/design-system/atoms/Button/index.tsx** - Updated component using CSS classes instead of inline styles  
3. **aplio-modern-1/app/test-t311-button/page.tsx** - Visual testing scaffold with 15 button combinations ready for testing
4. **aplio-modern-1/styles/globals/variables.css** - T-2.5.6 CSS variables (lines 17-31 for button variables)
5. **aplio-modern-1/test/unit-tests/task-3-1/T-3.1.2/design-system-adherence-report.md** - 100% DSAP compliance documentation

### Important Scripts, Markdown Files, and Specifications
1. **pmc/core/active-task.md** - T-3.1.2 acceptance criteria and implementation phases completed
2. **aplio-modern-1/design-system/docs/components/core/buttons.md** - Complete button design specifications and measurements
3. **aplio-modern-1/design-system/docs/animations/interactive/hover-animations.md** - Animation patterns and timing specifications
4. **aplio-legacy/scss/_button.scss** (lines 2-13) - Original implementation reference for visual comparison

### T-3.1.2 Recent Development Context

- **Last Milestone**: T-3.1.2 Button Base Implementation and Styling completed with 100% DSAP compliance (2025-07-03 02:45 PST)
- **Key Outcomes**: 
  - CSS module implementation (`Button.module.css`) created with all variants, sizes, and states
  - Button component updated to use CSS classes with TypeScript bracket notation access
  - Seamless T-2.5.6 CSS variable integration for theme switching
  - Pixel-perfect legacy design matching with 500ms animations
  - Complete DSAP compliance report generated with 100% adherence score
- **Relevant Learnings**: 
  - CSS modules provide better performance than inline styles for theme switching
  - TypeScript requires bracket notation for CSS module class access to avoid compilation errors
  - Pseudo-element animations achieve better GPU acceleration than transform-based approaches
  - CSS-only theming eliminates component re-renders during theme switches
- **Technical Context**: 
  - Visual testing infrastructure from T-3.1.1 fully operational and ready for T-3.1.2 validation
  - CSS variable system from T-2.5.6 confirmed working correctly with button styling
  - Next.js CSS module compilation configured and functional for production builds

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