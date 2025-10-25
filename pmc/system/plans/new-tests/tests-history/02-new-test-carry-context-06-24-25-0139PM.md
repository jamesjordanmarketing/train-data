# Development Context & Operational Priorities
**Date:** December 25, 2025
**Project:** Aplio Design System Modernization (aplio-mod-1) & Project Memory Core (PMC)
**Context Version:** 3.0.0

## Introduction

This context document addresses the completed implementation of **T-2.3.5: Accessibility and Reduced Motion Documentation** and its transition to comprehensive testing validation. The task has been successfully implemented with 5 comprehensive documentation files created in the accessibility directory, following the proven 5-file structure pattern established by T-2.3.4.

## T-2.3.5 Active Testing Focus

### Task Implementation Summary
**Task T-2.3.5** successfully implemented comprehensive accessibility documentation for design system animations using WCAG 2.1 Level AA standards. The implementation created reduced motion alternatives, motion preference detection guides, and accessibility impact assessments that build upon T-2.3.4's timing specifications while addressing critical gaps in motion sensitivity considerations. **All 5 required documentation files have been created** in `aplio-modern-1/design-system/docs/animations/accessibility/` following the successful documentation pattern from T-2.3.4.

### Critical Testing Context
1. **Legacy Reference Accuracy**: All documentation maintains 100% accuracy to animation patterns from `aplio-legacy/data/animation.js` (lines 1-94), specifically `fadeUpAnimation`, `fadeFromLeftAnimation`, and `fadeFromRightAnimation`
2. **WCAG 2.1 Level AA Compliance**: Every implementation meets accessibility standards for vestibular disorders, ADHD, photosensitive epilepsy, and motion sensitivity
3. **5-File Documentation Structure**: Implementation follows proven pattern from T-2.3.4 with consistent cross-referencing and integration
4. **Dark Mode Integration**: All accessibility patterns include dark mode considerations as core requirement, not afterthought
5. **TypeScript Strict Mode**: All code examples compile successfully with strict mode enabled
6. **Production-Ready Implementation**: All patterns are SSR-safe for Next.js applications with proper browser compatibility

### Testing Focus Areas
- **Documentation Quality Validation**: Verify all 5 files meet content completeness and WCAG 2.1 Level AA standards
- **Code Example Compilation**: Test all TypeScript code examples for strict mode compliance and browser compatibility
- **Cross-Reference Accuracy**: Validate all legacy animation.js references are 100% accurate to source code
- **Motion Preference Detection**: Test CSS media queries and JavaScript detection utilities across browsers
- **Accessibility Compliance**: Verify vestibular safety, ADHD considerations, and photosensitive protection implementations
- **Integration Testing**: Confirm seamless integration with T-2.3.4 timing specifications and design token compatibility

### Existing Testing Instructions Adaptations
**CRITICAL MODIFICATIONS to pmc/core/active-task-unit-tests-2.md:**

1. **Remove Component Discovery Steps**: T-2.3.5 creates documentation files, not React components. Testing agent must **skip all React component discovery and validation steps**.

2. **Replace with Documentation Validation**: Focus testing on:
   - Markdown file completeness and structure validation
   - Code example compilation testing 
   - Legacy reference accuracy verification
   - WCAG 2.1 Level AA compliance assessment
   - Cross-file integration verification

3. **Update File Paths**: All tests target `aplio-modern-1/design-system/docs/animations/accessibility/` directory, not component directories.

4. **Modify Success Criteria**: Success is measured by documentation quality, code example functionality, and accessibility compliance - not component render testing.

### Additional Testing Needs
**NEW TEST SCENARIOS required beyond baseline unit-test file:**

1. **Legacy Reference Validation**: Create automated verification that all `animation.js` references in documentation match source code exactly
2. **Code Example Compilation Suite**: Test all TypeScript code examples compile with strict mode across multiple TypeScript versions
3. **Motion Preference Detection Testing**: Verify CSS media queries and JavaScript utilities work across Chrome, Firefox, Safari, Edge
4. **WCAG 2.1 Compliance Automation**: Implement accessibility compliance checking for all documented patterns
5. **Cross-Reference Integrity**: Validate all internal documentation links and T-2.3.4 integration points function correctly
6. **Dark Mode Compatibility**: Test all dark mode accessibility patterns render correctly and maintain contrast ratios

### Key Files and Locations

**Implementation Directory**: `aplio-modern-1/design-system/docs/animations/accessibility/`

**Created Files (ALL 5 FILES COMPLETED):**
1. `reduced-motion-alternatives.md` (14KB, 541 lines) - Complete alternatives for all animation types
2. `animation-accessibility-guidelines.md` (7.6KB, 261 lines) - WCAG 2.1 Level AA compliance framework  
3. `motion-preference-detection.md` (22KB, 765 lines) - Comprehensive detection techniques
4. `accessibility-impact-assessment.md` (23KB, 695 lines) - Detailed assessment framework
5. `visual-reference-documentation.md` (27KB, 816 lines) - Visual reference patterns and examples

**Legacy Reference Source**: `aplio-legacy/data/animation.js` (lines 1-94)

**Integration Points**: `aplio-modern-1/design-system/docs/animations/timing/` (T-2.3.4 files)

### Specification References
- **WCAG 2.1 Level AA Standards**: All implementations reference Success Criterion 2.3.3 (Animation from Interactions) and 1.4.12 (Text Spacing)
- **Legacy Animation Patterns**: `aplio-legacy/data/animation.js` lines 1-10 (fadeUpAnimation), 18-27 (fadeFromLeftAnimation), 50-59 (fadeFromRightAnimation)
- **T-2.3.4 Integration**: `aplio-modern-1/design-system/docs/animations/timing/animation-durations.md` section "Standard Duration Patterns"
- **CSS Media Query Spec**: `prefers-reduced-motion: reduce` W3C Media Queries Level 5 specification
- **TypeScript Strict Mode**: All code examples target TypeScript 5.0+ strict mode compilation

### Success Criteria
**Testing cycle passes when ALL conditions are met:**

1. **Documentation Completeness**: All 5 files contain required sections and meet minimum content thresholds (no empty sections, comprehensive examples)
2. **Code Compilation Success**: 100% of TypeScript code examples compile successfully with strict mode enabled (`tsc --strict --noEmit`)
3. **Legacy Reference Accuracy**: 100% accuracy verified between documentation references and `aplio-legacy/data/animation.js` source code
4. **WCAG 2.1 Compliance**: All documented patterns pass automated accessibility compliance checking
5. **Cross-Reference Integrity**: All internal links and T-2.3.4 integrations resolve correctly
6. **Browser Compatibility**: Motion preference detection utilities work across Chrome, Firefox, Safari, Edge (latest versions)
7. **Dark Mode Validation**: All dark mode accessibility patterns maintain WCAG AA contrast ratios in both light and dark themes

### Testing Requirements Summary
**MANDATORY TEST CHECKLIST:**

- [ ] **File Existence**: All 5 accessibility documentation files exist and are non-empty
- [ ] **Content Structure**: Each file contains all required sections per T-2.3.4 pattern
- [ ] **Code Compilation**: All TypeScript examples compile with `tsc --strict --noEmit`
- [ ] **Legacy Accuracy**: All `animation.js` references match source code exactly
- [ ] **WCAG Compliance**: All patterns meet Level AA standards via automated checking
- [ ] **Cross-References**: All internal links and T-2.3.4 integrations resolve correctly
- [ ] **Motion Detection**: CSS media queries and JavaScript utilities function across browsers
- [ ] **Dark Mode**: All dark mode patterns maintain proper contrast ratios
- [ ] **Integration**: Seamless connection with T-2.3.4 timing specifications confirmed
- [ ] **Production Readiness**: All examples are SSR-safe for Next.js applications

### Testing Agent Directives

**YOU SHALL execute testing in this exact sequence:**

1. **Phase 0**: Verify all 5 accessibility documentation files exist and are properly structured
2. **Phase 1**: Validate TypeScript code example compilation with strict mode across all files  
3. **Phase 2**: Verify 100% accuracy of all legacy `animation.js` references using automated comparison
4. **Phase 3**: Execute WCAG 2.1 Level AA compliance validation for all documented accessibility patterns
5. **Phase 4**: Test motion preference detection utilities (CSS and JavaScript) across target browsers
6. **Phase 5**: Validate cross-reference integrity and T-2.3.4 integration points
7. **Phase 6**: Confirm dark mode accessibility patterns maintain proper contrast ratios
8. **Phase 7**: Generate comprehensive testing report with pass/fail status for each validation criterion

**YOU MUST NOT:**
- Skip any validation phase without documenting the reason
- Proceed to next phase if current phase has failing tests
- Modify any implementation files (testing only, no fixes)
- Test React component functionality (T-2.3.5 creates documentation, not components)

**YOU MUST:**
- Document all test results with specific file paths and line numbers
- Generate automated reports for WCAG compliance and legacy reference accuracy  
- Test all code examples independently for compilation success
- Verify browser compatibility for motion preference detection across all target browsers
- Confirm all accessibility patterns work in both light and dark modes

### Eliminated Requirements
**REMOVE these testing approaches from baseline unit-test file:**
- React component render testing (T-2.3.5 creates documentation files, not React components)
- Interactive component state testing (no interactive components created)
- User event simulation (documentation focus, not interactive functionality)
- Component lifecycle testing (documentation files have no component lifecycle)
- Props validation testing (documentation files don't accept props)

### Modified Testing Approaches
**ADAPT these testing approaches:**
- **File Structure Validation**: Instead of component structure, validate markdown file structure and required sections
- **Content Validation**: Instead of component render output, validate documentation content completeness and accuracy
- **Integration Testing**: Instead of component integration, test cross-reference links and T-2.3.4 integration points
- **Accessibility Testing**: Focus on documented accessibility patterns compliance, not component accessibility features
- **Performance Testing**: Focus on documentation load times and code example compilation speed, not component rendering performance

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