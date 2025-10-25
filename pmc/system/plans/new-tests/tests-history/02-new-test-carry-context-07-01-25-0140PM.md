# Development Context & Operational Priorities
**Date:** 07-01-25-0140PM
**Project:** Aplio Design System Modernization (aplio-mod-1) & Project Memory Core (PMC)
**Context Version:** 3.0.0

## Introduction

This context document addresses two integrated projects that operate in tandem:

1. **Aplio Design System Modernization (aplio-mod-1)**: A comprehensive modernization project converting the legacy Aplio Design System to leverage Next.js 14's App Router architecture and TypeScript. The project focuses on the Home-4 template implementation while preserving visual fidelity and enhancing developer experience.

2. **Project Memory Core (PMC)**: A structured task management and context retention system that manages the development of the Aplio project. PMC provides methodical task tracking, context preservation, and implementation guidance through its command-line interface and document-based workflow.

These projects are deliberately interconnected - PMC requires a real-world development project to refine its capabilities, while Aplio benefits from PMC's structured approach to development. Depending on current priorities, work may focus on either advancing the Aplio Design System implementation or enhancing the PMC tooling itself.

## Current Focus

### T-2.5.5 Active Testing Focus

**Task Summary**: T-2.5.5: CSS Implementation Strategy has been successfully implemented. This task created a comprehensive CSS architecture that provides the foundational layer for the T-2.5.4 Style Composition System. The implementation includes four core elements: modern CSS reset, CSS custom properties generation, global base styles, and responsive media query system. All elements integrate seamlessly with the existing theme switching functionality and composition utilities.

**Implementation State**: 
- All four elements (ELE-1 through ELE-4) have been fully implemented
- CSS files are located at `aplio-modern-1/styles/globals/`
- Integration with Next.js 14 build system completed via `app/globals.css`
- Full DSAP compliance achieved with detailed adherence report

**Critical Testing Context**:
- CSS variables must use exact `--aplio-*` naming convention for T-2.5.4 compatibility
- Theme switching must work automatically without component re-renders
- Responsive breakpoints must match legacy Tailwind config (xs:475px, sm:640px, md:768px, lg:1024px, xl:1280px, 1xl:1400px, 2xl:1536px)
- All CSS must be compatible with existing Tailwind CSS setup

### Testing Focus Areas

- **CSS Reset (ELE-1)**: Modern reset principles, accessibility features, legacy compatibility
- **CSS Variables (ELE-2)**: Complete token coverage, theme reactivity, composition system integration
- **Global Styles (ELE-3)**: Typography foundation, form styling, utility classes
- **Media Queries (ELE-4)**: Breakpoint system, responsive utilities, touch optimizations

### Existing Testing Instructions Adaptations

The testing approach must be adapted from the generic unit test template to focus on CSS-specific validation:

1. **Component Discovery Phase**: Instead of React components, discover CSS files and their features
2. **Unit Testing Phase**: Focus on CSS compilation, variable availability, and cascade behavior
3. **Visual Testing Phase**: Validate that styles render correctly with theme switching
4. **LLM Vision Analysis**: Verify visual consistency and responsive behavior

### Modified Testing Approaches

- **CSS Validation**: Use CSS linting and validation tools instead of Jest component tests
- **Variable Testing**: Verify CSS custom properties are available in computed styles
- **Theme Testing**: Test automatic theme switching without JavaScript intervention
- **Responsive Testing**: Validate breakpoint behavior at each defined screen size

### Key Files and Locations

**Created Files**:
- `aplio-modern-1/styles/globals/reset.css` (3.8KB) - Modern CSS reset with accessibility
- `aplio-modern-1/styles/globals/variables.css` (8.2KB) - CSS custom properties for themes
- `aplio-modern-1/styles/globals/base.css` (10.1KB) - Global typography and form styles
- `aplio-modern-1/styles/globals/breakpoints.css` (10.8KB) - Responsive media query system

**Modified Files**:
- `aplio-modern-1/app/globals.css` - Added imports for all four CSS files

**Critical Integration Files**:
- `aplio-modern-1/styles/system/composition.ts` - T-2.5.4 system that depends on CSS variables
- `aplio-modern-1/styles/themes/` - Theme token definitions
- `aplio-modern-1/design-system/docs/components/core/buttons.md` - DSAP specifications

### Specification References

1. **Legacy CSS Reset Reference**: `aplio-legacy/scss/_common.scss` lines 1-25
2. **Legacy Global Styles Reference**: `aplio-legacy/scss/_common.scss` lines 26-317
3. **Legacy Breakpoints Reference**: `aplio-legacy/tailwind.config.js` lines 13-17
4. **DSAP Button Specifications**: `aplio-modern-1/design-system/docs/components/core/buttons.md` (full file)
5. **T-2.5.4 Integration Requirements**: `aplio-modern-1/styles/system/composition.ts` lines 600-700

### Success Criteria

1. **CSS Compilation**: All four CSS files must compile without errors in Next.js build
2. **Variable Availability**: All `--aplio-*` variables must be available in computed styles
3. **Theme Switching**: CSS variables must update automatically when theme changes
4. **Responsive Behavior**: Styles must adapt correctly at all seven breakpoints
5. **Legacy Compatibility**: FontAwesome icons and animations must work correctly
6. **DSAP Compliance**: Button styling must match exact specifications (30px padding, 30px radius)

### Testing Requirements Summary

**Mandatory Tests**:
- [ ] CSS files compile successfully with Next.js build system
- [ ] All CSS custom properties are available in browser computed styles
- [ ] Theme switching updates CSS variables without JavaScript
- [ ] Responsive breakpoints trigger at correct screen sizes
- [ ] Focus styles meet accessibility requirements
- [ ] Legacy animations (bounce-open, floating) function correctly
- [ ] Typography scales use CSS custom properties
- [ ] Form elements have proper theme-reactive styling

**Success Gates**:
- Build process completes with exit code 0
- No CSS compilation warnings or errors
- All CSS variables resolve to expected values
- Theme switching is instantaneous (<100ms)

**File Targets**:
- `test/unit-tests/task-2-5/T-2.5.5/css-compilation.test.js`
- `test/unit-tests/task-2-5/T-2.5.5/css-variables.test.js`
- `test/unit-tests/task-2-5/T-2.5.5/theme-switching.test.js`
- `test/unit-tests/task-2-5/T-2.5.5/responsive-behavior.test.js`

### Testing Agent Directives

1. **You shall** begin by navigating to `aplio-modern-1` directory from the default `pmc` location
2. **You must** create the test directory structure at `test/unit-tests/task-2-5/T-2.5.5/`
3. **You shall** verify CSS compilation by running `npm run build` and checking for errors
4. **You must** create test files that validate CSS variable availability using `getComputedStyle()`
5. **You shall** test theme switching by toggling the `dark` class on the root element
6. **You must** validate responsive behavior using Playwright at each breakpoint
7. **You shall** generate visual regression tests for typography and form styling
8. **You must** complete the DSAP compliance validation checklist
9. **You shall** document any CSS-specific testing adaptations in your test approach

**Do not** attempt to test CSS files as React components. CSS requires different testing strategies focused on compilation, cascade, and visual output.



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