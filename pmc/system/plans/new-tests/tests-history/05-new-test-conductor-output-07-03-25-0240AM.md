# AI Testing Agent Conductor Prompt - T-3.1.2 Button Base Implementation and Styling

## Overview

You are an AI Testing Agent responsible for conducting comprehensive automated testing for **T-3.1.2: Button Base Implementation and Styling** - a completed Next.js Button component implementation using CSS modules. Your primary goal is to validate that the Button component meets both functional and visual requirements with exact legacy design fidelity and DSAP compliance.

## Critical Context Understanding

**T-3.1.2 Button Implementation Summary:**
- **COMPLETED** CSS modules implementation with all variants, sizes, and states
- **COMPLETED** T-2.5.6 CSS variable integration for theme switching
- **COMPLETED** DSAP compliance with 30px padding, 30px border-radius, Inter font
- **COMPLETED** TypeScript integration with bracket notation CSS module access
- **READY** for comprehensive testing validation

## Mission Statement

Your primary mission is to orchestrate the testing process for **T-3.1.2 Button Base Implementation and Styling** defined within the Project Memory Core (PMC) system. You must validate CSS modules, visual fidelity, DSAP compliance, and production readiness. Follow these steps precisely **each time you are invoked with this prompt**:

## Step-by-Step Testing Protocol

### Step 1: Review Testing Directions Document
- **Load and thoroughly analyze** the optimized test plan directions found in `pmc\core\active-task-unit-tests-2-enhanced.md`
- **Identify** T-3.1.2 Button testing requirements: CSS modules, visual fidelity, DSAP compliance
- **Note** required test types: unit testing (CSS modules), visual testing (15 variants), DSAP compliance validation

### Step 2: Analyze Current Task Context
- **Review** the active task details from `pmc\core\active-task.md`
- **Understand** T-3.1.2 Button component specifications: 5 variants, 3 sizes, 4 states
- **Note** CSS modules implementation approach and T-2.5.6 variable integration

### Step 3: Review Implementation Context from Previous Agent
- **Review** the implementation notes directly from `system\plans\new-tests\02-new-test-carry-context-07-03-25-0240AM.md`
- **Focus** on CSS module implementation details and testing adaptations
- **Note** specific changes from inline styles to CSS modules approach
- **Understand** eliminated requirements and additional testing needs

### Step 4: Archive and Reset Test Files
- **Run** the test approach and discovery automation script to archive existing test files and create blank slate files for the new testing cycle:
```bash
node system\management\test-approach-and-discovery.js
```
- **This script will** archive current-test-approach.md and current-test-discovery.md to the approach-history directory and create blank versions for the new test cycle

### Step 5: Generate Testing Approach
- **Read** the file `pmc\system\coding-prompts\03-test-approach-prompt-v3-enhanced.md`
- **Execute** the instructions contained within that file *immediately*
- **This will involve** reading `pmc\core\active-task-unit-tests-2-enhanced.md` and generating the testing approach in `pmc\system\plans\task-approach\current-test-approach.md`
- **Once** current-test-approach is populated, run `node bin\aplio-agent-cli.js test-approach` from pmc to automatically populate the test approach into `pmc\core\active-task-unit-tests-2-enhanced.md`
- **Once you have completed** the instructions from the test approach prompt, then wait for the human operator instructions before you begin step 6

### Step 6: Execute Active Test Plan
- **Turn your full attention** to the file `pmc\core\active-task-unit-tests-2-enhanced.md`
- **This file contains** the detailed instructions, elements, and procedures for T-3.1.2 Button testing
- **Execute** the testing described in `pmc\core\active-task-unit-tests-2-enhanced.md` diligently, following all specified commands, tests, and instructions outlined within that document until testing is completed

## T-3.1.2 Specific Testing Requirements

### Critical Success Criteria for T-3.1.2 Button:
1. **CSS Module Compilation**: Verify Button.module.css compiles correctly in Next.js build
2. **CSS Class Application**: Validate all variant, size, and state classes apply correctly
3. **CSS Variable Integration**: Test T-2.5.6 variables consumed correctly without creating new ones
4. **Visual Fidelity**: Compare against legacy `aplio-legacy/scss/_button.scss` lines 2-13
5. **DSAP Compliance**: Verify 30px padding, 30px border-radius, Inter font, 500ms animations
6. **Theme Switching**: Test automatic dark/light mode transitions via CSS cascade
7. **TypeScript Integration**: Verify bracket notation access for CSS module classes
8. **Production Readiness**: Validate build optimization and deployment functionality

### T-3.1.2 Button Elements to Test:
- **ELE-1**: Base button implementation (CSS modules foundation)
- **ELE-2**: Button variants (primary, secondary, tertiary, outline, navbar)
- **ELE-3**: Size variants (small, medium, large)
- **ELE-4**: State styling (hover, focus, active, disabled)

### Expected Test Coverage:
- **15 Visual Combinations**: 5 variants × 3 sizes = 15 button combinations
- **CSS Module Classes**: All variant, size, and state classes validated
- **Animation Testing**: 500ms pseudo-element transitions validated
- **Accessibility Testing**: Focus rings, reduced motion, touch targets validated

## Complementary File Relationship

**IMPORTANT**: The following files work together as a comprehensive testing system:

1. **`pmc\core\active-task-unit-tests-2-enhanced.md`** (PRIMARY)
   - **Contains**: Detailed step-by-step testing procedures for T-3.1.2 Button
   - **Purpose**: Your primary execution guide with specific commands and validation criteria
   - **Usage**: Execute all phases from environment setup through final validation

2. **`system\plans\new-tests\02-new-test-carry-context-07-03-25-0240AM.md`** (CONTEXT)
   - **Contains**: Implementation context from the previous agent who completed T-3.1.2
   - **Purpose**: Background information about CSS modules approach and testing adaptations
   - **Usage**: Reference for understanding implementation choices and testing modifications

**These files are complementary and do NOT conflict**. The carry-context file provides the "why" behind testing adaptations, while the enhanced test plan provides the "how" for execution.

## Execution Guidelines

**IMPORTANT:** Do *not* deviate from the instructions provided in `pmc\core\active-task-unit-tests-2-enhanced.md` once you begin. Your role is to execute that specific task tests for T-3.1.2 Button Base Implementation and Styling. This prompt serves as the standard initialization procedure for T-3.1.2 testing presented by the PMC system.

### Directory Navigation:
- **Start**: pmc directory (default shell location)
- **Testing**: Navigate to aplio-modern-1 directory for test execution
- **Commands**: Run PMC commands from pmc directory

### Error Handling:
- **Apply** fix/test/analyze cycle for any failures
- **Maximum** 3 retry attempts per failed test
- **Document** all issues and resolutions in test reports

## Final Reporting Requirements

After completing all T-3.1.2 Button tests, notify the human operator with:

1. **Overall Testing Status**: Pass/Fail for all 5 testing phases
2. **Visual Test Results**: Links to Button screenshot artifacts and analysis
3. **Component Scaffolds**: Links to working T-3.1.2 Button visual testing scaffold
4. **Visual Regression Results**: Comparison against legacy design fidelity
5. **DSAP Compliance Results**: Confirmation of 100% compliance or issues found
6. **CSS Module Validation**: Confirmation of successful compilation and class application
7. **Production Readiness**: Build and deployment validation results
8. **Recommendations**: Any manual review needed or issues requiring attention

## Success Indicators

Consider T-3.1.2 Button testing **COMPLETE** and **SUCCESSFUL** when:
- ✅ All 5 testing phases completed successfully
- ✅ All 15 Button variant/size combinations validated
- ✅ CSS modules compile and apply correctly
- ✅ DSAP compliance confirmed (30px padding, 30px border-radius)
- ✅ Visual fidelity matches legacy design exactly
- ✅ TypeScript compilation successful with bracket notation
- ✅ Production build successful and functional
- ✅ All test artifacts generated and documented

---

**Ready to begin T-3.1.2 Button Base Implementation and Styling testing validation.**
