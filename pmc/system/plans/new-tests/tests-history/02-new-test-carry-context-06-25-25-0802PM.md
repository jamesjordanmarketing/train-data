# Development Context & Operational Priorities
**Date:** 06/25/2025
**Project:** Aplio Design System Modernization (aplio-mod-1) & Project Memory Core (PMC)
**Context Version:** 3.0.0
**Task:** T-2.4.3: Component-Specific Responsive Behavior Documentation

## Introduction

This context document addresses two integrated projects that operate in tandem:

1. **Aplio Design System Modernization (aplio-mod-1)**: A comprehensive modernization project converting the legacy Aplio Design System to leverage Next.js 14's App Router architecture and TypeScript. The project focuses on the Home-4 template implementation while preserving visual fidelity and enhancing developer experience.

2. **Project Memory Core (PMC)**: A structured task management and context retention system that manages the development of the Aplio project. PMC provides methodical task tracking, context preservation, and implementation guidance through its command-line interface and document-based workflow.

These projects are deliberately interconnected - PMC requires a real-world development project to refine its capabilities, while Aplio benefits from PMC's structured approach to development. Depending on current priorities, work may focus on either advancing the Aplio Design System implementation or enhancing the PMC tooling itself.

## Current Focus

### T-2.4.3 Active Testing Focus

**Task Summary**: T-2.4.3: Component-Specific Responsive Behavior Documentation has been successfully completed following the proven 5-file documentation pattern established by T-2.4.2. This task created comprehensive documentation for component-specific responsive behaviors, building upon T-2.4.1's breakpoint system and T-2.4.2's layout documentation. The implementation analyzed 4 legacy components (Hero, Feature, Card, and Slider) and created detailed responsive behavior documentation using mobile-first methodology and TypeScript compliance.

**Critical Implementation Context**: The task was implemented with 100% accuracy to legacy component behaviors by analyzing specific legacy code references:
- Hero component (`aplio-legacy/components/home-4/Hero.jsx` lines 6-7): Responsive padding classes documented
- Feature component (`aplio-legacy/components/home-4/Feature.jsx` line 38): Grid responsive patterns documented  
- Card component (`aplio-legacy/components/home-4/Feature.jsx` lines 42-44): Responsive padding behavior documented
- Slider component (`aplio-legacy/components/shared/SwiperSlider.jsx` lines 19-30): Breakpoint configuration documented

**Testing Focus Areas**: The testing must validate comprehensive documentation accuracy across 5 documentation files:
- `component-definitions.md` (11KB, 414 lines): Core component responsive patterns with TypeScript interfaces
- `component-implementation-guidelines.md` (22KB, 871 lines): Implementation patterns and code examples
- `component-constraints-specifications.md` (17KB, 831 lines): Technical constraints and requirements
- `component-testing-guide.md` (27KB, 961 lines): Testing strategies and validation approaches
- `component-visual-reference.md` (28KB, 801 lines): Visual demonstrations and component anatomy

### Next Steps 
1. **Documentation Validation Testing**: Verify all 5 documentation files exist and contain required content sections
2. **Legacy Accuracy Validation**: Test that documented responsive behaviors match legacy implementations exactly
3. **Cross-Reference Integration Testing**: Validate links to T-2.4.1 breakpoints and T-2.4.2 layouts function correctly
4. **TypeScript Compliance Testing**: Ensure all code examples compile with strict mode
5. **Responsive Behavior Testing**: Validate component responsive patterns across all documented breakpoints

### Important Files
**Documentation Files Created** (all at `aplio-modern-1/design-system/docs/responsive/components/`):
1. `component-definitions.md` - Core component responsive patterns and TypeScript interfaces
2. `component-implementation-guidelines.md` - Comprehensive implementation patterns and code examples  
3. `component-constraints-specifications.md` - Technical constraints covering performance and accessibility
4. `component-testing-guide.md` - Testing strategies including unit, visual, and accessibility tests
5. `component-visual-reference.md` - Visual demonstrations with component anatomy diagrams

**Legacy Reference Files Analyzed**:
1. `aplio-legacy/components/home-4/Hero.jsx` lines 6-7 - Hero responsive behavior
2. `aplio-legacy/components/home-4/Feature.jsx` line 38 - Feature responsive behavior  
3. `aplio-legacy/components/home-4/Feature.jsx` lines 42-44 - Card responsive behavior
4. `aplio-legacy/components/shared/SwiperSlider.jsx` lines 19-30 - Slider responsive behavior

**Cross-Reference Dependencies**:
1. `aplio-modern-1/design-system/docs/responsive/breakpoints/` - T-2.4.1 breakpoint documentation
2. `aplio-modern-1/design-system/docs/responsive/layouts/` - T-2.4.2 layout documentation

### Important Scripts, Markdown Files, and Specifications
1. **Task Specification**: `pmc/core/active-task.md` - Contains T-2.4.3 requirements and acceptance criteria
2. **Carryover Context**: `pmc/system/plans/new-panels/02-new-task-carry-context-06-25-25-1250PM.md` - Contains proven success patterns from T-2.4.2
3. **Phase Management**: PMC CLI commands for updating phase completion status
4. **Legacy Component Files**: Hero.jsx, Feature.jsx, SwiperSlider.jsx with specific line references

### T-2.4.3 Recent Development Context

- **Last Milestone**: All three implementation phases (PREP, IMP, VAL) completed successfully with phase status updates via PMC CLI
- **Key Outcomes**: Created ~105KB of comprehensive responsive behavior documentation across 5 files following T-2.4.2's proven success pattern
- **Relevant Learnings**: T-2.4.2 achieved production certification using exactly 5 files totaling 86.7KB - T-2.4.3 replicated this pattern successfully
- **Technical Context**: Mobile-first approach implementation, TypeScript strict mode compliance, WCAG 2.1 AA accessibility standards, cross-reference integration maintained

## Testing Requirements Summary

### Existing Testing Instructions Adaptations
The baseline unit-test file `pmc/core/active-task-unit-tests-2.md` must be adapted with these specific requirements:

**Documentation File Validation**: Test that all 5 documentation files exist at correct paths and contain required content sections
**Legacy Accuracy Testing**: Validate documented responsive behaviors against actual legacy component implementations at specified line numbers
**Cross-Reference Testing**: Verify functional links to T-2.4.1 and T-2.4.2 documentation systems
**TypeScript Compilation Testing**: Ensure all code examples compile successfully with strict mode enabled
**Content Quality Testing**: Validate documentation completeness, accuracy, and professional presentation standards

### Modified Testing Approaches
1. **File-Based Testing Focus**: Unlike component testing, this requires documentation file validation and content accuracy testing
2. **Legacy Integration Testing**: Must validate against specific legacy code lines rather than new implementations
3. **Cross-System Reference Testing**: Requires validation of links between different task deliverables
4. **Content Compliance Testing**: Documentation quality and completeness validation beyond code functionality

### Additional Testing Needs
1. **Mobile-First Methodology Validation**: Test that all documented patterns follow mobile-first responsive approach
2. **Dark Mode Documentation Testing**: Verify dark mode considerations are included throughout documentation
3. **Accessibility Compliance Testing**: Validate WCAG 2.1 AA compliance in documented patterns
4. **Performance Optimization Testing**: Verify performance considerations are documented for responsive implementations

### Success Criteria
Testing passes when:
- All 5 documentation files exist and contain complete required sections
- Documented responsive behaviors match legacy implementations with 100% accuracy
- Cross-references to T-2.4.1 and T-2.4.2 are functional and accurate
- All code examples compile successfully with TypeScript strict mode
- Documentation meets professional quality standards for production use
- Mobile-first methodology is consistently applied throughout documentation
- WCAG 2.1 AA accessibility standards are met in all documented patterns

### Testing Agent Directives
You shall execute testing in this specific order:
1. **Validate Documentation Structure**: Confirm all 5 files exist with correct file sizes and line counts
2. **Test Legacy Accuracy**: Compare documented behaviors against legacy implementations at specified lines
3. **Validate Cross-References**: Test that all links to T-2.4.1 and T-2.4.2 function correctly
4. **Compile Code Examples**: Verify all TypeScript code examples compile with strict mode
5. **Content Quality Assessment**: Evaluate documentation completeness and professional presentation
6. **Responsive Pattern Validation**: Test documented responsive behaviors across breakpoint system
7. **Accessibility Compliance Check**: Verify WCAG 2.1 AA compliance in documented approaches

You must document any testing failures with exact error messages and file paths. For documentation content issues, provide specific section references and recommended corrections. All testing must validate the implementation's readiness for production certification following the T-2.4.2 success pattern.

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