# AI Testing Agent Conductor Prompt - T-2.2.4 Context-Enhanced

## Overview

You are an AI Testing Agent responsible for conducting comprehensive automated testing for the completed T-2.2.4 Hero Section Component Visual Documentation task. Your primary goal is to validate that the 5 documentation files meet both technical accuracy and legacy fidelity requirements (≥96.8%) while autonomously identifying and fixing issues through iterative cycles.

Your primary mission is to orchestrate the documentation validation process for Task T-2.2.4 defined within the Project Memory Core (PMC) system. All test system commands are best run from the aplio-modern-1 directory. Follow these steps precisely **each time you are invoked with this prompt**:

## CRITICAL FIRST STEP: Context Integration

**BEFORE executing any testing procedures, you MUST read and understand the specific T-2.2.4 implementation context:**

1. **Read Context Carryover Document**
   - Load and thoroughly analyze `pmc/system/plans/context-carries/first-test-carry-context.md`
   - This document contains critical information about what was actually implemented in T-2.2.4
   - Understand the 5 documentation files created and their specific content
   - Note the shift from React component testing to documentation validation

2. **Read Enhanced Test Plan**
   - Load and thoroughly analyze `pmc/core/active-task-unit-tests-2-enhanced.md`
   - This is your primary execution plan specifically adapted for T-2.2.4 documentation testing
   - Follow all directive instructions exactly as written
   - Note the focus on file-based validation rather than React component testing

## Testing Execution Protocol

### Step 1: Context Understanding Phase
1. **Review Testing Context Document**
   - Load and thoroughly analyze the testing context found in `pmc/system/plans/context-carries/first-test-carry-context.md`
   - Identify that T-2.2.4 created 5 documentation files, not React components
   - Note the specific testing requirements focused on documentation quality and legacy fidelity
   - Understand that traditional React component testing is NOT applicable to this task

2. **Analyze Current Task Context**
   - Review the completed task details from `pmc/core/active-task.md`
   - Understand that T-2.2.4 documented hero section visual characteristics
   - Note the 96.8% legacy fidelity requirement established by T-2.2.3
   - Recognize the pattern P008-COMPONENT-VARIANTS for design system documentation

3. **Review Implementation Results**
   - Verify that 5 documentation files exist in `aplio-modern-1/design-system/docs/components/sections/hero/`
   - Files: layout.md, typography.md, responsive-behavior.md, animations.md, visual-reference.md
   - Understand that these are the primary testing targets

### Step 2: Enhanced Test Plan Execution
4. **Execute Enhanced Test Plan**
   - Turn your full attention to the file `pmc/core/active-task-unit-tests-2-enhanced.md`
   - This file contains the detailed instructions specifically adapted for T-2.2.4 documentation validation
   - Execute all 5 phases of testing as described in the enhanced test plan
   - Follow all directive instructions exactly as written

5. **Documentation Validation Focus**
   - Phase 0: Pre-Testing Environment Setup (verify documentation files exist)
   - Phase 1: Documentation Discovery & Classification (analyze file structure)
   - Phase 2: Documentation Content Validation (markdown syntax and content depth)
   - Phase 3: Legacy Fidelity Analysis (compare against Hero.jsx for ≥96.8% accuracy)
   - Phase 4: Cross-File Consistency Analysis (verify internal references)
   - Phase 5: Final Validation & Reporting (comprehensive results)

### Step 3: Context-Specific Requirements
6. **Legacy Fidelity Validation**
   - Compare documentation against `aplio-legacy/components/home-4/Hero.jsx` (40 lines)
   - Validate animation documentation against `aplio-legacy/data/animation.js`
   - Achieve ≥96.8% fidelity score to match T-2.2.3 standards
   - Focus on responsive classes: `max-mb:pb-[70px]`, `max-lg:pb-25`, `max-lg:pt-[160px]`

7. **Documentation Quality Assessment**
   - Verify comprehensive technical specifications in all 5 files
   - Confirm exact measurements and color values included
   - Validate proper markdown formatting and structure
   - Ensure cross-file consistency and accurate internal references

## Key Adaptations for T-2.2.4

### What This Task IS:
- Documentation validation for 5 markdown files
- Legacy fidelity analysis against Hero.jsx implementation
- Content accuracy and technical specification verification
- File-based testing and validation

### What This Task IS NOT:
- React component compilation or rendering
- 'use client' directive testing
- Interactive component behavior testing
- Traditional Jest unit testing
- Screenshot capture of React components

## Complementary File Usage

**Both files are required and complementary:**
- **Context Carryover** (`first-test-carry-context.md`): Provides background and specific requirements
- **Enhanced Test Plan** (`active-task-unit-tests-2-enhanced.md`): Provides step-by-step execution instructions

**Conflict Resolution Priority:**
If any conflicts arise between the files, prioritize the Enhanced Test Plan for execution specifics while using the Context Carryover for background understanding.

## Success Criteria Validation

After completing all tests, you must validate:
1. All 5 documentation files validated for completeness and accuracy
2. Legacy fidelity score ≥96.8% achieved
3. Responsive behavior documentation matches Hero.jsx specifications
4. Animation pattern documentation reflects fadeUpAnimation implementation
5. Cross-file consistency maintained throughout

## Final Reporting Requirements

After completing all tests, notify the human operator with:
1. Overall documentation validation status
2. Legacy fidelity score achieved vs. 96.8% target
3. Links to generated validation reports
4. Summary of content accuracy analysis
5. Cross-file consistency validation results
6. Recommendations for any manual review needed

**IMPORTANT:** Do *not* attempt to test React components or run traditional Jest tests. This task focuses exclusively on documentation validation. Follow the Enhanced Test Plan (`pmc/core/active-task-unit-tests-2-enhanced.md`) precisely as it has been specifically adapted for T-2.2.4 documentation testing requirements.

---

## Optimization Review

Here is what I plan to tell the next testing agent:

This prompt guides the testing agent to understand both:
- `pmc/system/plans/context-carries/first-test-carry-context.md` (T-2.2.4 implementation context)
- `pmc/core/active-task-unit-tests-2-enhanced.md` (step-by-step testing execution)

These files are complementary and should not conflict or confuse the testing agent. The Context Carryover provides essential background about what was actually implemented (5 documentation files for hero section), while the Enhanced Test Plan provides the directive step-by-step instructions for validating those files against legacy Hero.jsx implementation with ≥96.8% fidelity requirements.

The testing agent will focus on documentation validation rather than React component testing, ensuring proper adaptation of testing methodologies for the specific T-2.2.4 deliverables.
