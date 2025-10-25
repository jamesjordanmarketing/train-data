# Development Context & Operational Priorities
**Date:** 12-19-24
**Project:** Aplio Design System Modernization (aplio-mod-1) & Project Memory Core (PMC)
**Context Version:** 3.0.0

## Introduction

This context document addresses two integrated projects that operate in tandem:

1. **Aplio Design System Modernization (aplio-mod-1)**: A comprehensive modernization project converting the legacy Aplio Design System to leverage Next.js 14's App Router architecture and TypeScript. The project focuses on the Home-4 template implementation while preserving visual fidelity and enhancing developer experience.

2. **Project Memory Core (PMC)**: A structured task management and context retention system that manages the development of the Aplio project. PMC provides methodical task tracking, context preservation, and implementation guidance through its command-line interface and document-based workflow.

These projects are deliberately interconnected - PMC requires a real-world development project to refine its capabilities, while Aplio benefits from PMC's structured approach to development. Depending on current priorities, work may focus on either advancing the Aplio Design System implementation or enhancing the PMC tooling itself.

## Current Focus

### T-3.2.2 Active Testing Focus

**COMPLETED IMPLEMENTATION READY FOR TESTING**: T-3.2.2 AccordionItem component has been successfully implemented with complete visual fidelity to legacy FaqItem, enhanced accessibility features, and smooth animations. The implementation includes four key components (AccordionItem.tsx, AccordionItem.module.css, AccordionIcon.tsx, useAccordionAnimation.ts) that require comprehensive validation through automated testing, visual regression testing, and accessibility compliance verification.

**Why Testing is Critical**: This component is a foundational piece of the accordion system that directly impacts user interaction and accessibility compliance. The testing must validate: (1) Visual appearance matches legacy implementation pixel-perfectly, (2) Expand/collapse animations function smoothly with 0.3s timing, (3) Icon transitions synchronize properly with state changes, (4) ARIA accordion pattern is fully compliant, (5) Keyboard navigation works correctly with Enter/Space keys, and (6) Variable height content is handled robustly.

**Current Implementation State**: All code implementation is complete and all three phases (PREP, IMP, VAL) have been executed through PMC. The components are integrated with T-3.2.1 AccordionProvider foundation, implement full DSAP compliance (98% score), and include comprehensive unit tests. A 25-test comprehensive test suite has been created covering all acceptance criteria.

**Critical Testing Context**: The testing agent must validate the actual implementation against the 6 acceptance criteria with focus on animation timing precision, visual fidelity to legacy FaqItem, and accessibility compliance. The testing infrastructure from T-3.2.1 provides foundation with enhanced LLM vision analysis proven at 95% confidence.

### Next Steps

1. **[HIGH PRIORITY]** Execute comprehensive test suite validation for all 25 test cases covering visual appearance, animations, icon transitions, ARIA compliance, keyboard interactions, and variable height content
2. **[HIGH PRIORITY]** Perform visual regression testing using enhanced LLM vision analysis to validate pixel-perfect legacy fidelity  
3. **[HIGH PRIORITY]** Validate accessibility compliance through automated testing and screen reader compatibility
4. **[MEDIUM PRIORITY]** Execute animation timing validation and performance testing for variable height content scenarios
5. **[MEDIUM PRIORITY]** Generate comprehensive test reports and validate DSAP adherence documentation completeness

### Important Files

1. `aplio-modern-1/components/design-system/molecules/Accordion/AccordionItem.tsx` - Main AccordionItem component implementation with state management, animations, and accessibility
2. `aplio-modern-1/components/design-system/molecules/Accordion/AccordionItem.module.css` - Complete CSS styling matching legacy FaqItem design with dark mode support
3. `aplio-modern-1/components/design-system/molecules/Accordion/AccordionIcon.tsx` - Enhanced icon component with proper CSS integration and state switching
4. `aplio-modern-1/components/design-system/molecules/Accordion/hooks/useAccordionAnimation.ts` - Enhanced animation hook with optimized height transitions and timing
5. `aplio-modern-1/test/unit-tests/task-3-2/T-3.2.2/T-3.2.2-AccordionItem.test.tsx` - Comprehensive 25-test suite covering all acceptance criteria
6. `aplio-modern-1/test/unit-tests/task-3-2/T-3.2.2/design-system-adherence-report.md` - Complete DSAP compliance report with 98% score

### Important Scripts, Markdown Files, and Specifications

1. `aplio-legacy/components/shared/FaqItem.jsx` - Legacy reference implementation for visual and behavioral fidelity validation
2. `aplio-modern-1/design-system/docs/animations/interactive/state-transitions.md` - Animation standards and timing specifications for accordion patterns  
3. `test/enhanced-llm-vision-analyzer.js` - Enhanced vision analysis tool with 95% confidence proven effectiveness from T-3.2.1
4. `test/run-visual-tests.js` - Visual testing framework for screenshot capture and analysis proven in T-3.2.1
5. `pmc/core/active-task.md` - Complete T-3.2.2 task specifications and acceptance criteria reference

### T-3.2.2 Recent Development Context

**Last Milestone**: T-3.2.2 AccordionItem implementation completed successfully with all phases (PREP, IMP, VAL) executed and marked complete in PMC. Implementation achieved 98% DSAP compliance with comprehensive documentation.

**Key Outcomes**: 
- Complete AccordionItem component with visual fidelity matching legacy FaqItem including exact styling, padding, borders, and typography
- Enhanced animation system using height-based transitions with 0.3s ease-in-out timing and proper variable height content handling
- Full ARIA accordion pattern compliance with comprehensive keyboard navigation and screen reader support  
- Icon transition system matching legacy behavior with plus/minus switching (no rotation animation)
- Comprehensive 25-test suite covering all 6 acceptance criteria with integration testing for AccordionProvider coordination

**Relevant Learnings**: 
- Enhanced LLM vision analysis provides reliable component validation with 95% confidence scores proven in T-3.2.1
- Visual testing scaffolds enable comprehensive component state capture across multiple viewports and themes
- Animation implementation requires precise timing optimization (320ms timeout vs 300ms CSS transition) for smooth completion
- DSAP compliance requires comprehensive documentation discovery and implementation validation with specific gap identification

**Technical Context**: 
- Testing environment uses Jest, React Testing Library, enhanced-llm-vision-analyzer, and Puppeteer proven effective in T-3.2.1
- Visual testing captures desktop, tablet, mobile viewports plus dark mode, high contrast, and interactive states
- Component validation includes accessibility compliance through automated testing, visual accuracy through LLM vision analysis, and functional correctness through unit testing
- Component integrates seamlessly with T-3.2.1 AccordionProvider Context system for coordinated state management

## Testing Focus Areas

### Critical Implementation Details Requiring Testing Scrutiny

**Animation System Implementation**:
- Height-based transitions using `contentRef.current.scrollHeight` matching legacy exactly
- Enhanced timing with 320ms completion timeout vs 300ms CSS transition for smooth animation completion  
- Variable height content handling with proper measurement and transition management
- Reduced motion preference support with proper fallback behavior

**Visual Fidelity Implementation**:
- Pixel-perfect CSS matching legacy FaqItem including `rounded-medium`, `p-2.5`, `px-5 py-3` padding
- Dashed border styling (`border-dashed border-gray-100`) on header buttons
- Typography matching (`text-xl`, `font-semibold`) and color scheme compliance
- Dark mode support with proper token usage (`dark:bg-dark-200`, `dark:text-[#A1A49D]`)

**Accessibility Implementation**:
- Complete ARIA accordion pattern with proper button/region relationships and ID management
- Dynamic `aria-expanded` updates synchronized with state changes
- Keyboard navigation supporting Enter/Space keys with proper `preventDefault` handling
- Focus management for disabled states with `tabIndex: -1` implementation

**Icon Integration Implementation**:
- Plus/minus icon switching matching legacy behavior (no rotation animation)
- Proper CSS class integration with module styles (`accordion-icon-open/closed`)
- SVG structure with accessibility attributes (`aria-hidden`, `role="presentation"`)
- CSS transition integration for smooth state changes

### Existing Testing Instructions Adaptations

**ENHANCED from baseline unit-test file**: The comprehensive 25-test suite created during implementation exceeds the baseline testing requirements and includes:

**Visual Appearance Validation (6 tests)**:
- Container structure matching legacy FaqItem with proper CSS classes
- Size and visual variant class application testing  
- Question and answer text formatting with correct styling
- Icon container and positioning validation

**Animation Behavior Testing (3 tests)**:
- Animation style application during expand/collapse with proper timing
- Variable height content handling for different content sizes
- Reduced motion preference support with transition disabling

**Icon Transition Verification (3 tests)**:
- Correct icon state display for closed/open states with proper SVG paths
- Icon transition synchronization with content expand/collapse state
- CSS class application for icon state management

**ARIA Compliance Validation (3 tests)**:
- Complete ARIA attribute implementation with proper relationships
- Dynamic aria-expanded updates on state changes
- Disabled state handling with proper accessibility attributes

**Keyboard Interaction Testing (5 tests)**:
- Enter and Space key activation with proper event handling
- preventDefault behavior for Space key to avoid page scrolling
- Other key ignoring behavior for proper focus management
- Disabled item non-responsiveness to keyboard events

**Variable Height Content Testing (3 tests)**:
- Short content handling with proper overflow management
- Long content handling with complex text scenarios
- Complex HTML content handling with nested elements

**Integration Testing (2 tests)**:
- Single accordion mode state coordination between multiple items
- Multiple accordion mode allowing simultaneous open items

### Modified Testing Approaches

**ENHANCED LLM Vision Analysis**: Utilize proven T-3.2.1 enhanced LLM vision analysis tool with 95% confidence for visual validation rather than basic screenshot comparison. This approach provides detailed analysis of visual fidelity to legacy components.

**ANIMATION TIMING PRECISION**: Test animation timing with precision validation including 320ms completion timeout vs 300ms CSS transition timing. This differs from basic animation testing by validating the enhanced timing optimization implemented.

**DSAP INTEGRATION TESTING**: Validate against the comprehensive DSAP adherence report created during implementation rather than basic design system compliance checking. This includes validation of the 98% compliance score and gap identification.

**ACCESSIBILITY BEYOND BASIC**: Test comprehensive ARIA accordion pattern implementation rather than basic accessibility compliance, including dynamic relationship management and keyboard interaction precision.

### Additional Testing Needs

**Animation Performance Testing**: Validate animation performance with very large content scenarios (>1000px height) to ensure smooth transitions with the enhanced timing system.

**Theme Integration Testing**: Test dark mode token integration beyond basic dark mode support, validating proper color token usage and theme switching behavior.

**Responsive Behavior Validation**: Test mobile-specific gap handling (`max-md:gap-x-2.5`) and responsive padding adjustments implemented in CSS.

**Provider Integration Edge Cases**: Test edge cases of AccordionProvider integration including rapid state changes and provider remount scenarios.

**Legacy Fidelity Validation**: Comprehensive pixel-perfect comparison with legacy FaqItem including border styles, spacing, and typography precision.

### Success Criteria

**Comprehensive Test Suite Validation**: All 25 test cases must pass with 100% success rate covering visual appearance, animations, icon transitions, ARIA compliance, keyboard interactions, and variable height content.

**Visual Fidelity Verification**: Enhanced LLM vision analysis must confirm ≥95% visual similarity to legacy FaqItem component across all viewport sizes and theme modes.

**Accessibility Compliance Validation**: Automated accessibility testing must confirm 100% ARIA accordion pattern compliance with no critical accessibility violations.

**Animation Precision Validation**: Animation timing tests must confirm 300ms ±10ms transition duration with proper height measurement and smooth completion.

**DSAP Adherence Confirmation**: Validation must confirm 98% DSAP compliance score maintenance with all documented gaps properly addressed.

**Integration Functionality Verification**: AccordionProvider integration tests must pass with 100% success rate for both single and multiple accordion modes.

### Testing Requirements Summary

**MANDATORY TESTS CHECKLIST**:
- [ ] Execute all 25 comprehensive test cases with 100% pass rate
- [ ] Perform visual regression testing with enhanced LLM vision analysis achieving ≥95% confidence
- [ ] Validate accessibility compliance with automated testing achieving 100% ARIA pattern compliance  
- [ ] Execute animation timing validation with precision testing for 300ms transitions
- [ ] Validate DSAP adherence report completeness and 98% compliance score
- [ ] Test keyboard navigation precision with Enter/Space key handling and preventDefault behavior
- [ ] Validate variable height content handling across multiple content scenarios
- [ ] Test AccordionProvider integration for both single and multiple modes
- [ ] Validate icon transition synchronization with content state changes
- [ ] Confirm dark mode support with proper color token usage

**SUCCESS GATES**:
- All unit tests return exit code 0 with 100% pass rate
- Visual analysis confidence ≥95% for legacy fidelity
- Zero critical accessibility violations detected
- Animation timing within 300ms ±10ms tolerance
- DSAP compliance score maintains ≥98%

**FILE TARGETS**:
- `T-3.2.2-AccordionItem.test.tsx` - Execute comprehensive test suite
- `AccordionItem.tsx` - Validate implementation functionality
- `AccordionItem.module.css` - Validate visual styling accuracy
- `useAccordionAnimation.ts` - Validate animation behavior and timing
- `AccordionIcon.tsx` - Validate icon transition behavior

### Testing Agent Directives

**YOU MUST execute testing in the following sequence**:

1. **Pre-Testing Setup**: YOU SHALL navigate to aplio-modern-1 directory and establish testing environment with enhanced infrastructure from T-3.2.1
2. **Comprehensive Test Execution**: YOU MUST execute the complete 25-test suite in `T-3.2.2-AccordionItem.test.tsx` and achieve 100% pass rate
3. **Visual Regression Validation**: YOU SHALL perform enhanced LLM vision analysis to validate visual fidelity to legacy FaqItem achieving ≥95% confidence
4. **Accessibility Compliance Testing**: YOU MUST execute automated accessibility testing to validate complete ARIA accordion pattern compliance
5. **Animation Precision Testing**: YOU SHALL validate animation timing precision within 300ms ±10ms tolerance for height transitions
6. **Integration Testing**: YOU MUST validate AccordionProvider integration for both single and multiple accordion modes
7. **DSAP Validation**: YOU SHALL confirm DSAP adherence report completeness and maintain ≥98% compliance score
8. **Report Generation**: YOU MUST generate comprehensive testing reports documenting all validation results and compliance confirmations

**FAILURE HANDLING PROTOCOL**: IF any test fails, YOU MUST document the failure details, attempt automated correction if possible, re-run the failed test, and evaluate results before proceeding. Maximum 3 retry attempts per test failure.

**COMPLETION CRITERIA**: YOU SHALL NOT mark testing complete until ALL success gates are achieved and comprehensive test reports are generated confirming T-3.2.2 implementation readiness for production use.

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