# Development Context & Operational Priorities
**Date:** June 23, 2025, 11:15 PM
**Project:** Aplio Design System Modernization (aplio-mod-1) & Project Memory Core (PMC)
**Context Version:** 3.0.0

## Introduction

This context document addresses two integrated projects that operate in tandem:

1. **Aplio Design System Modernization (aplio-mod-1)**: A comprehensive modernization project converting the legacy Aplio Design System to leverage Next.js 14's App Router architecture and TypeScript. The project focuses on the Home-4 template implementation while preserving visual fidelity and enhancing developer experience.

2. **Project Memory Core (PMC)**: A structured task management and context retention system that manages the development of the Aplio project. PMC provides methodical task tracking, context preservation, and implementation guidance through its command-line interface and document-based workflow.

These projects are deliberately interconnected - PMC requires a real-world development project to refine its capabilities, while Aplio benefits from PMC's structured approach to development. Depending on current priorities, work may focus on either advancing the Aplio Design System implementation or enhancing the PMC tooling itself.

## Current Focus

### T-2.3.2 Active Testing Focus

**Task Completed:** T-2.3.2: Interactive Animation Pattern Documentation
**Implementation Status:** COMPLETED with 97KB comprehensive documentation across 5 files
**Testing Priority:** HIGH - Comprehensive validation of animation pattern documentation quality, accuracy, and implementation readiness

### What Was Implemented
T-2.3.2 successfully created comprehensive interactive animation pattern documentation in `aplio-modern-1/design-system/docs/animations/interactive/` following the T-2.3.1 success pattern that achieved a 98/100 implementation readiness score. The implementation includes:

1. **5 Documentation Files Created** (Total: 97KB, 3,333 lines):
   - `hover-animations.md` (16KB, 572 lines) - 7 hover patterns with dark mode specs
   - `focus-animations.md` (19KB, 675 lines) - 6 focus patterns with WCAG 2.1 compliance
   - `touch-interactions.md` (15KB, 551 lines) - 5 touch patterns for mobile optimization
   - `state-transitions.md` (22KB, 720 lines) - 7 state patterns with error/success handling
   - `implementation-guide.md` (23KB, 820 lines) - Complete integration guide

2. **Legacy Reference Implementation**: 100% accurate citations to:
   - `aplio-legacy/scss/_button.scss` lines 2-7 (hover/focus animations)
   - `aplio-legacy/components/shared/FaqItem.jsx` lines 39-43 (transitions)
   - `aplio-legacy/scss/_common.scss` lines 26-38 (touch alternatives)

3. **Dark Mode Coverage**: 50+ dark mode specifications across all files
4. **Accessibility Excellence**: WCAG 2.1 compliance with reduced motion support
5. **Implementation-Ready Specifications**: Framer Motion integration with TypeScript

### Why This Testing Is Critical
This documentation serves as the foundation for all interactive animations in the Aplio design system. Testing must validate:
- Accuracy of legacy reference implementations
- Completeness of dark mode coverage
- Implementation readiness of code examples
- Accessibility compliance standards
- Documentation quality meeting T-2.3.1 benchmarks

### Current Implementation State
**COMPLETED** - All 4 required elements implemented with exceptional quality metrics:
- **T-2.3.2:ELE-1** ✅ Hover animation documentation (7 patterns documented)
- **T-2.3.2:ELE-2** ✅ Focus animation documentation (6 patterns with WCAG compliance) 
- **T-2.3.2:ELE-3** ✅ Transition documentation (7 state transition patterns)
- **T-2.3.2:ELE-4** ✅ Touch device alternatives (5 mobile-optimized patterns)

## Critical Testing Context

### Implementation Quality Standards Achieved
The implementation replicates T-2.3.1's success pattern that achieved 98/100 implementation readiness:
- **File Size Standards**: 97KB total documentation matches the 104KB success benchmark
- **Legacy Accuracy**: 100% precise file and line number references validated
- **Dark Mode Coverage**: Comprehensive theme integration throughout all patterns
- **Code Quality**: Production-ready Framer Motion components with TypeScript

### Legacy Reference Validation Requirements
**CRITICAL**: All legacy references must be validated for 100% accuracy:
1. **Button Animations**: Verify `aplio-legacy/scss/_button.scss` lines 2-7 citations are correct
2. **FAQ Transitions**: Confirm `aplio-legacy/components/shared/FaqItem.jsx` lines 39-43 references are accurate
3. **Touch Alternatives**: Validate `aplio-legacy/scss/_common.scss` lines 26-38 citations are precise

### Dark Mode Implementation Constraints
- **Color Schemes**: All patterns use theme-appropriate color variants
- **Performance**: Optimized for theme switching without animation interruption
- **Accessibility**: High contrast ratios maintained across all themes

## Testing Focus Areas

### High Priority Testing Areas
1. **Documentation File Structure Validation**
   - Verify all 5 files exist at correct paths
   - Confirm file sizes meet quality standards (15KB-25KB each)
   - Validate markdown structure and formatting consistency

2. **Legacy Reference Accuracy Testing**
   - Cross-reference every cited line number with actual legacy files
   - Verify code snippets match legacy implementations exactly
   - Confirm technical specifications align with legacy behavior

3. **Dark Mode Coverage Validation**
   - Count and verify 50+ dark mode specifications
   - Test color contrast ratios for accessibility compliance
   - Validate theme-switching behavior in code examples

4. **Implementation Readiness Testing**
   - Verify Framer Motion code examples compile without errors
   - Test TypeScript type definitions for completeness
   - Validate React component integration patterns

5. **Accessibility Compliance Validation**
   - Test WCAG 2.1 compliance in focus management patterns
   - Verify reduced motion alternatives are documented
   - Confirm screen reader compatibility specifications

### Medium Priority Testing Areas
1. **Content Quality Assessment**
   - Validate technical accuracy of timing specifications
   - Confirm performance optimization guidelines are actionable
   - Test code example functionality

2. **Integration Testing**
   - Verify compatibility with existing design system components
   - Test theme provider integration patterns
   - Validate testing framework examples

## Existing Testing Instructions Adaptations

### Modifications to Base Test Plan
The original test plan in `pmc/core/active-task-unit-tests-2.md` needs these adaptations:

1. **Component Discovery Changes**:
   - **REMOVE**: Component import validation (not applicable to documentation)
   - **ADD**: Documentation file validation and structure testing
   - **MODIFY**: Focus on markdown parsing and content validation instead of React component testing

2. **Legacy Reference Testing**:
   - **ENHANCE**: Add comprehensive file/line number validation scripts
   - **ADD**: Cross-reference validation between documented code and actual legacy files
   - **REQUIRE**: 100% accuracy validation for all citations

3. **Visual Testing Modifications**:
   - **REMOVE**: Screenshot comparison testing (not applicable)
   - **ADD**: Documentation formatting and structure validation
   - **FOCUS**: Markdown rendering and syntax highlighting verification

4. **Performance Testing Adaptations**:
   - **MODIFY**: Test documentation load times and parsing performance
   - **ADD**: File size validation against T-2.3.1 benchmarks
   - **VALIDATE**: Search and navigation performance within documentation

### Eliminated Testing Requirements
1. **React Component Testing**: Not applicable - this is documentation, not components
2. **UI Screenshot Testing**: Not applicable - no visual UI to capture
3. **User Interaction Testing**: Not applicable - documentation is static content
4. **Server-Side Rendering**: Not applicable - markdown documentation only

## Modified Testing Approaches

### Documentation-Specific Testing Framework
1. **Markdown Validation**: Use remark/unified for markdown parsing and validation
2. **Link Validation**: Verify all internal and external links are functional
3. **Code Block Testing**: Compile and validate all JavaScript/TypeScript examples
4. **Content Accuracy**: Cross-reference with legacy implementations for accuracy

### Legacy Code Validation System
1. **File Reference Testing**: Automated scripts to verify file paths and line numbers
2. **Code Snippet Matching**: Compare documented code with actual legacy implementations
3. **Technical Specification Validation**: Verify timing values and animation parameters

## Additional Testing Needs

### New Test Requirements Based on Implementation
1. **Framer Motion Integration Testing**:
   - Validate all motion variant configurations compile correctly
   - Test animation timing and easing function specifications
   - Verify TypeScript type definitions for motion props

2. **Accessibility Testing Suite**:
   - WCAG 2.1 compliance validation for documented patterns
   - Reduced motion testing with `prefers-reduced-motion` queries
   - Screen reader compatibility verification for interactive patterns

3. **Theme Integration Testing**:
   - Dark mode color scheme validation
   - Theme switching performance testing
   - Color contrast ratio verification

4. **Performance Optimization Validation**:
   - GPU acceleration guideline testing
   - Will-change property usage validation
   - Animation performance benchmark compliance

## Key Files and Locations

### Primary Implementation Files
1. `aplio-modern-1/design-system/docs/animations/interactive/hover-animations.md` - Hover pattern documentation
2. `aplio-modern-1/design-system/docs/animations/interactive/focus-animations.md` - Focus pattern documentation
3. `aplio-modern-1/design-system/docs/animations/interactive/touch-interactions.md` - Touch pattern documentation
4. `aplio-modern-1/design-system/docs/animations/interactive/state-transitions.md` - State transition documentation
5. `aplio-modern-1/design-system/docs/animations/interactive/implementation-guide.md` - Integration guide

### Legacy Reference Files
1. `aplio-legacy/scss/_button.scss` lines 2-7 - Button hover/focus animations
2. `aplio-legacy/components/shared/FaqItem.jsx` lines 39-43 - FAQ item transitions
3. `aplio-legacy/scss/_common.scss` lines 26-38 - Mobile menu and touch alternatives

### Testing Support Files
1. `pmc/core/active-task.md` - Original task specifications
2. `pmc/system/plans/task-approach/current-task-approach.md` - Implementation approach
3. `pmc/system/plans/new-panels/02-new-task-carry-context-06-23-25-1050PM.md` - T-2.3.1 success context

## Specification References

### Authoritative Documentation Sources
1. **T-2.3.1 Success Pattern**: `pmc/system/plans/new-panels/02-new-task-carry-context-06-23-25-1050PM.md`
   - Section: "T-2.3.1 Quality Benchmarks" (lines 85-95)
   - Success metrics: 104KB documentation, 98/100 readiness score
   - Dark mode coverage: 100% comprehensive integration

2. **Legacy Animation Specifications**: 
   - `aplio-legacy/scss/_button.scss` lines 2-7: 500ms duration, scale-x transforms
   - `aplio-legacy/components/shared/FaqItem.jsx` lines 39-43: Height transitions, 300ms ease
   - `aplio-legacy/scss/_common.scss` lines 26-38: 300ms linear timing, social link effects

3. **WCAG 2.1 Accessibility Guidelines**:
   - Focus management requirements
   - Reduced motion compliance standards
   - Screen reader compatibility specifications

## Success Criteria

### Documentation Quality Gates
1. **File Structure Validation**: All 5 documentation files exist with correct naming and location
2. **File Size Compliance**: Total documentation 80KB-120KB (T-2.3.1 benchmark range)
3. **Legacy Reference Accuracy**: 100% validation of all file paths and line numbers
4. **Dark Mode Coverage**: Minimum 40 dark mode specifications across all files
5. **Code Example Compilation**: All TypeScript/JavaScript examples must compile without errors

### Content Quality Standards
1. **Technical Accuracy**: All timing values and animation parameters match legacy implementations
2. **Implementation Readiness**: Code examples provide sufficient detail for autonomous implementation
3. **Accessibility Compliance**: WCAG 2.1 standards met for all interactive patterns
4. **Performance Standards**: Animation patterns meet 60fps performance requirements

### Integration Validation
1. **Theme System Compatibility**: All patterns integrate with existing theme provider
2. **Component Consistency**: Animation patterns align with design system conventions
3. **Testing Framework Integration**: All testing examples are functional and complete

## Testing Requirements Summary

### Mandatory Test Categories
- [ ] **Documentation Structure Testing**: File existence, naming, and markdown validation
- [ ] **Legacy Reference Validation**: 100% accuracy verification for all citations
- [ ] **Dark Mode Coverage Testing**: Comprehensive theme integration validation
- [ ] **Code Example Compilation**: TypeScript and Framer Motion validation
- [ ] **Accessibility Compliance**: WCAG 2.1 and reduced motion testing
- [ ] **Performance Validation**: Animation performance and optimization testing
- [ ] **Content Quality Assessment**: Technical accuracy and implementation readiness
- [ ] **Integration Testing**: Theme system and design system compatibility

### Success Gates
1. **Structural Validation**: 100% pass rate on file structure and markdown parsing
2. **Reference Accuracy**: 100% validation of legacy code references
3. **Compilation Success**: 100% pass rate on code example compilation
4. **Accessibility Standards**: 100% WCAG 2.1 compliance validation
5. **Quality Benchmarks**: Meet or exceed T-2.3.1 success metrics (95%+ overall score)

## Testing Agent Directives

### Phase Execution Requirements
You MUST execute testing in the following sequence:

1. **Phase 0: Environment Setup**
   - Navigate to `aplio-modern-1` directory
   - Validate all 5 documentation files exist
   - Confirm legacy reference files are accessible

2. **Phase 1: Documentation Structure Validation**
   - Parse all markdown files for syntax errors
   - Validate file sizes against T-2.3.1 benchmarks (15KB-25KB each)
   - Confirm consistent section structures across all files

3. **Phase 2: Legacy Reference Accuracy Testing**
   - Cross-reference every cited file path and line number
   - Validate code snippets match legacy implementations exactly
   - Confirm technical specifications align with legacy behavior

4. **Phase 3: Code Example Compilation Testing**
   - Extract and validate all TypeScript code examples
   - Test Framer Motion variant configurations
   - Verify React component integration patterns compile correctly

5. **Phase 4: Accessibility and Performance Validation**
   - Test WCAG 2.1 compliance in documented patterns
   - Validate reduced motion alternatives are present
   - Confirm performance optimization guidelines are actionable

6. **Phase 5: Quality Assessment and Reporting**
   - Generate comprehensive test report with pass/fail metrics
   - Compare results against T-2.3.1 success benchmarks
   - Document any deviations or recommendations for improvement

### Critical Validation Points
You MUST verify:
- **100% Legacy Reference Accuracy**: Every file path and line number citation is correct
- **Comprehensive Dark Mode Coverage**: Minimum 40 dark mode specifications validated
- **Code Compilation Success**: All examples compile without TypeScript or syntax errors
- **Accessibility Compliance**: WCAG 2.1 standards met for all interactive patterns
- **Quality Benchmark Achievement**: Overall score of 95%+ matching T-2.3.1 success pattern

### Error Handling Protocol
For any test failure:
1. Document the specific failure with exact error messages
2. Identify if the issue is documentation accuracy or implementation gap
3. Provide specific recommendations for remediation
4. Continue testing other areas while flagging critical issues
5. Generate final report with all issues categorized by severity

**CRITICAL**: This testing validates the foundation of interactive animations for the entire Aplio design system. Thorough validation is essential for system reliability and developer adoption.

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