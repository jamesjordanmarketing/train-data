# Development Context & Operational Priorities
**Date:** {{CURRENT_DATE}}
**Project:** Aplio Design System Modernization (aplio-mod-1) & Project Memory Core (PMC)
**Context Version:** 3.0.0

## Introduction

This context document addresses two integrated projects that operate in tandem:

1. **Aplio Design System Modernization (aplio-mod-1)**: A comprehensive modernization project converting the legacy Aplio Design System to leverage Next.js 14's App Router architecture and TypeScript. The project focuses on the Home-4 template implementation while preserving visual fidelity and enhancing developer experience.

2. **Project Memory Core (PMC)**: A structured task management and context retention system that manages the development of the Aplio project. PMC provides methodical task tracking, context preservation, and implementation guidance through its command-line interface and document-based workflow.

These projects are deliberately interconnected - PMC requires a real-world development project to refine its capabilities, while Aplio benefits from PMC's structured approach to development. Depending on current priorities, work may focus on either advancing the Aplio Design System implementation or enhancing the PMC tooling itself.

## Current Focus

### T-2.2.6 Active Testing Focus
You shall test the **Component Relationship Documentation** implementation completed in T-2.2.6. This task created comprehensive architecture-level documentation mapping component relationships across the design system by analyzing composition patterns, cross-component styling, typography consistency, and variant relationships. The implementation focused on system-wide patterns rather than individual components, building on T-2.2.5's individual component documentation foundation.

**What is being tested:** 5 comprehensive architecture documentation files created in `aplio-modern-1/design-system/docs/architecture/` totaling ~61KB of documentation with 10 Mermaid.js diagrams.

**Why it is being tested:** These documentation files serve as the architectural blueprint for Next.js 14 migration and will be directly used by AI agents to build actual components. The documentation must be implementation-ready with precise specifications.

**Current state of implementation:** All phases (PREP, IMP, VAL) are complete. 5 files successfully created with architecture-level documentation covering component hierarchy, cross-component styling, design system consistency, variant relationships, and visual component relationships.

**Critical context needed for continuation:** This is architecture documentation testing, not component implementation testing. The focus is on validating documentation quality, accuracy, and implementation-readiness rather than testing functional components.

Do not deviate from this focus without explicit instruction.

### Bugs & Challenges in the T-2.2.6
[CONDITIONAL: Include ONLY if there are active bugs or challenges. For each issue include:
1. Issue description
2. Current status
3. Attempted solutions
4. Blocking factors
Remove section if no active issues.]

The Bugs & Challenges in the Current Task are a subset of the Active Development Focus section.

### Next Steps 
[REQUIRED: List the next actions in order of priority. Each item must include:
1. Action identifier (task ID, file path, etc.)
2. Brief description
3. Dependencies or blockers
4. Expected outcome
Maximum 5 items, minimum 2 items.]
The Next Steps section is a subset of the Active Development Focus section.

### Important Dependencies
[CONDITIONAL: Include ONLY if there are critical dependencies for the next steps. Each dependency must specify:
1. Dependency identifier
2. Current status
3. Impact on next steps
Remove section if no critical dependencies.]
The Important Dependencies section is a subset of the Active Development Focus section.

### Important Files
[REQUIRED: List all files that are essential for the current context. Format as:
1. File path from workspace root
2. Purpose/role in current task
3. Current state (if modified)
Only include files directly relevant to current work.]
The Important Files section is a subset of the Active Development Focus section.

### Important Scripts, Markdown Files, and Specifications
[CONDITIONAL: Include ONLY if there are specific scripts, documentation, or specs needed for the next steps. Format as:
1. File path from workspace root
2. Purpose/role in current context
3. Key sections to review
Remove section if not directly relevant.]
The Important Scripts, Markdown Files, and Specifications section is a subset of the Active Development Focus section.

### T-2.2.6 Recent Development Context

- **Last Milestone**: Completed all 5 architecture documentation files with comprehensive dark mode coverage addressing T-2.2.5 gap
- **Key Outcomes**: 
  - Component hierarchy documentation (9.9KB, 273 lines) with composition patterns and Next.js 14 guidelines
  - Cross-component styling documentation (12KB, 438 lines) with CSS cascade patterns and global dependencies
  - Design system consistency documentation (11KB, 425 lines) with typography hierarchy and spacing systems
  - Component variant relationships documentation (15KB, 570 lines) with color token architecture and state variations
  - Visual component relationships documentation (13KB, 530 lines) with 10 Mermaid.js diagrams
- **Relevant Learnings**: Architecture-level documentation requires different validation approach than component testing - focus on specification accuracy and implementation-readiness
- **Technical Context**: Files created in `aplio-modern-1/design-system/docs/architecture/` with proper markdown structure and Mermaid.js integration

## Testing Focus Areas

You must scrutinize these components, functions, and behaviors that are new, complex, or high-risk:

- **Architecture Documentation Accuracy**: Validate that documented patterns match actual legacy implementations in `aplio-legacy/app/home-4/page.jsx`, `aplio-legacy/scss/_common.scss`, and `aplio-legacy/scss/_typography.scss`
- **Implementation-Ready Specifications**: Verify that documentation provides sufficient detail for AI agents to build actual components without ambiguity
- **Dark Mode Coverage Completeness**: Ensure all documented patterns include comprehensive dark mode variants (addressing T-2.2.5 gap)
- **Mermaid.js Diagram Accuracy**: Validate that all 10 visual diagrams accurately represent component relationships and hierarchies
- **Cross-Reference Consistency**: Verify that architecture documentation properly references T-2.2.5 individual component specifications without duplication

## Modified Testing Approaches

You must adapt the baseline unit-test file `pmc/core/active-task-unit-tests-2.md` with these changes:

**Documentation Validation Focus**: Replace component functionality testing with documentation quality validation including:
- Markdown structure validation
- Content accuracy verification against legacy code
- Implementation-readiness assessment
- Mermaid.js diagram rendering validation

**Architecture-Level Testing**: Adapt tests to focus on system-wide patterns rather than individual component behaviors:
- Component hierarchy mapping accuracy
- Cross-component styling pattern completeness
- Design system consistency verification
- Variant relationship mapping validation

**Visual Documentation Testing**: Include specific validation for the 10 Mermaid.js diagrams:
- Diagram syntax validation
- Visual accuracy against actual component relationships
- Proper technical specification formatting

## Eliminated Requirements

You must instruct the testing agent that these testing steps are now obsolete:

- **Component Functionality Testing**: No interactive components were implemented - only documentation files
- **User Interaction Testing**: No user-facing features to test - this is architectural documentation
- **Performance Testing**: Documentation files don't require performance optimization testing
- **Legacy Component Testing**: This task focused on documenting relationships, not testing legacy components
- **Type Safety Testing**: No TypeScript interfaces or components were created in this task

## Additional Testing Needs

You must identify these fresh test scenarios that became necessary due to implementation:

**Documentation Structure Validation**: 
- Verify all 5 files follow consistent markdown structure
- Validate proper section hierarchy and cross-referencing
- Ensure implementation-ready code examples are syntactically correct

**Legacy Code Accuracy Verification**:
- Cross-reference documented patterns against actual legacy implementations
- Verify line number references are accurate for legacy code citations
- Validate that documented component hierarchies match `home-4/page.jsx` structure

**Mermaid.js Integration Testing**:
- Validate all 10 diagrams render correctly in markdown viewers
- Verify diagram syntax follows Mermaid.js specifications
- Test visual accuracy of component relationship representations

**Implementation-Readiness Assessment**:
- Verify documentation provides sufficient implementation guidance
- Validate code examples and specifications are complete
- Ensure AI agents can use documentation to build actual components

## Key Files and Locations

You must test these files created, modified, or critical to testing:

**Primary Documentation Files** (all in `aplio-modern-1/design-system/docs/architecture/`):
- `component-hierarchy.md` (9.9KB, 273 lines) - Component composition patterns and hierarchies
- `cross-component-styling.md` (12KB, 438 lines) - CSS cascade patterns and global styling dependencies
- `design-system-consistency.md` (11KB, 425 lines) - Typography hierarchy and spacing systems
- `component-variant-relationships.md` (15KB, 570 lines) - Color token architecture and state variations
- `visual-component-relationships.md` (13KB, 530 lines) - 10 Mermaid.js diagrams

**Legacy Reference Files** (used for validation):
- `aplio-legacy/app/home-4/page.jsx` - Component composition source (lines 1-15)
- `aplio-legacy/scss/_common.scss` - Cross-component styling source (lines 26-317)
- `aplio-legacy/scss/_typography.scss` - Typography consistency source (lines 1-48)
- `aplio-modern-1/styles/design-tokens/colors.ts` - Color variant mapping source

**PMC System Files**:
- `pmc/core/active-task.md` - Task implementation details
- `pmc/core/active-task-unit-tests-2.md` - Base test plan

## Specification References

You shall cite and reference these authoritative docs, specs, and templates:

**Task Specifications**:
- Task Definition: `pmc/core/active-task.md` lines 47-65 (Task Information section)
- Acceptance Criteria: `pmc/core/active-task.md` lines 67-73
- Component Elements: `pmc/core/active-task.md` lines 103-115

**Implementation References**:
- Legacy Code Reference 1: `aplio-legacy/app/home-4/page.jsx` lines 1-15 (component composition)
- Legacy Code Reference 2: `aplio-legacy/scss/_common.scss` lines 26-317 (shared styles)  
- Legacy Code Reference 3: `aplio-legacy/scss/_typography.scss` lines 1-48 (typography consistency)
- Legacy Code Reference 4: `aplio-modern-1/design-system/tokens/colors.json` lines 163-220 (variant mapping)

**Documentation Standards**:
- T-2.2.5 Foundation: Referenced for individual component specifications to avoid duplication
- Mermaid.js Documentation: For diagram syntax and rendering validation
- Next.js 14 App Router Documentation: For implementation guidelines referenced in architecture docs

## Success Criteria

You must verify these measurable conditions constitute a "pass" for this testing cycle:

**Documentation Quality Gates**:
- All 5 architecture files have proper markdown structure with consistent formatting
- All legacy code references cite correct file paths and line numbers
- All 10 Mermaid.js diagrams render correctly in markdown viewers
- Documentation provides implementation-ready specifications without ambiguity

**Content Accuracy Validation**:
- Component hierarchy documentation matches actual `home-4/page.jsx` structure
- Cross-component styling patterns accurately reflect `_common.scss` implementations
- Typography consistency documentation aligns with `_typography.scss` specifications
- Color variant relationships match `colors.ts` token definitions

**Implementation-Readiness Assessment**:
- AI agents can use documentation to understand component relationships
- Specifications are detailed enough for component implementation
- Code examples are syntactically correct and executable
- Dark mode coverage is comprehensive for all documented patterns

**Architecture Documentation Standards**:
- Documentation focuses on system-wide patterns rather than individual components
- Proper cross-referencing to T-2.2.5 individual component documentation
- No content duplication between architecture and component-specific documentation
- Clear implementation roadmap for Next.js 14 migration

## Testing Requirements Summary

You shall verify this one-page checklist that combines all mandatory tests:

**File Structure Validation**:
- [ ] All 5 files exist in `aplio-modern-1/design-system/docs/architecture/`
- [ ] File sizes match expected ranges (9.9KB-15KB per file)
- [ ] Directory structure follows design system organization standards

**Content Quality Verification**:
- [ ] Markdown structure validation passes for all 5 files
- [ ] All legacy code references are accurate and accessible
- [ ] Implementation-ready specifications are complete and unambiguous
- [ ] Dark mode coverage is comprehensive across all documented patterns

**Visual Documentation Testing**:
- [ ] All 10 Mermaid.js diagrams render correctly in markdown viewers
- [ ] Diagram syntax follows Mermaid.js specifications
- [ ] Visual representations accurately reflect component relationships
- [ ] Technical specifications in diagrams are precise and implementation-ready

**Architecture Documentation Standards**:
- [ ] Focus on system-wide patterns rather than individual components
- [ ] Proper integration with T-2.2.5 individual component documentation
- [ ] No content duplication between architecture and component specifications
- [ ] Clear Next.js 14 migration implementation guidance

**Legacy Implementation Accuracy**:
- [ ] Component hierarchy matches `home-4/page.jsx` actual structure
- [ ] Styling patterns reflect `_common.scss` and `_typography.scss` implementations
- [ ] Color variant relationships align with `colors.ts` definitions
- [ ] All documented patterns can be traced to legacy implementations

## Testing Agent Directives

You shall follow these explicit, directive step instructions in order:

**Phase 1: Environment Setup**
1. You must navigate to `aplio-modern-1/design-system/docs/architecture/` directory
2. You must verify all 5 documentation files exist with expected file sizes
3. You must validate markdown structure for each file using appropriate tools
4. You must ensure Mermaid.js rendering capability is available for diagram testing

**Phase 2: Content Accuracy Validation**
1. You must cross-reference each legacy code citation against actual file contents
2. You must verify line number accuracy for all legacy code references
3. You must validate that documented patterns match actual legacy implementations
4. You must confirm implementation-ready specifications are complete and unambiguous

**Phase 3: Visual Documentation Testing**
1. You must test all 10 Mermaid.js diagrams for correct syntax and rendering
2. You must verify visual accuracy of component relationship representations
3. You must validate technical specifications within diagrams are precise
4. You must ensure diagrams provide clear implementation guidance

**Phase 4: Architecture Integration Validation**
1. You must verify proper integration with T-2.2.5 individual component documentation
2. You must confirm no content duplication exists between architecture and component docs
3. You must validate system-wide pattern focus rather than individual component details
4. You must ensure clear Next.js 14 migration implementation roadmap

**Phase 5: Implementation-Readiness Assessment**
1. You must evaluate whether AI agents can use documentation to build components
2. You must verify all code examples are syntactically correct and executable
3. You must confirm dark mode coverage is comprehensive for all patterns
4. You must validate documentation serves as effective architectural blueprint

**Failure Handling Protocol**:
- Document all validation failures with specific file paths and line numbers
- For each failure, identify root cause and recommended correction
- Prioritize failures based on impact on implementation-readiness
- Report critical failures that prevent AI agents from using documentation effectively

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