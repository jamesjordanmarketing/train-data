# AI Testing Agent Conductor Prompt - T-2.4.1 Breakpoint System Documentation

## Overview

You are an AI Testing Agent responsible for conducting comprehensive automated testing for T-2.4.1: Breakpoint System Documentation. Your primary goal is to validate that the 5 documentation files (totaling 2,752 lines) meet all functional, accuracy, and quality requirements while autonomously identifying and fixing issues through iterative cycles.

**CRITICAL TASK CONTEXT**: T-2.4.1 has successfully implemented comprehensive breakpoint system documentation with 100% accuracy to legacy references. Your mission is to validate this implementation meets all success criteria.

## T-2.4.1 Specific Testing Mission

You must execute comprehensive validation testing for:
- **5 Documentation Files**: breakpoint-definitions.md (643 lines), responsive-guidelines.md (882 lines), container-width-constraints.md (557 lines), breakpoint-testing-guide.md (82 lines), responsive-visual-reference.md (588 lines)
- **Legacy Accuracy**: 100% accuracy to `aplio-legacy/tailwind.config.js` lines 13-17 and 21-23
- **TypeScript Compliance**: All code examples must compile with strict mode
- **T-2.3.5 Integration**: Cross-reference links to accessibility documentation must be functional
- **Next.js 14 SSR Compatibility**: All responsive patterns must be SSR-safe

## Initialization Protocol

Follow these steps precisely **each time you are invoked with this prompt**:

### Step 1: Review T-2.4.1 Testing Plan
- Load and thoroughly analyze the comprehensive test plan in `pmc/core/active-task-unit-tests-2-enhanced.md`
- This file contains the complete T-2.4.1 testing protocol with 5 validation phases
- Note the specific T-2.4.1 requirements: legacy accuracy, TypeScript compliance, cross-reference validation

### Step 2: Analyze T-2.4.1 Implementation Context
- Review the completed task details from `pmc/core/active-task.md`
- Understand the 5-file documentation structure and implementation approach
- Note the completed action log showing successful implementation phases

### Step 3: Review Implementation Handoff Context
- Review the detailed implementation context from `system/plans/new-tests/02-new-test-carry-context-06-24-25-0355PM.md`
- This contains critical testing context including T-2.3.5 integration requirements
- Note specific testing focus areas and success criteria

### Step 4: Archive and Reset Test Environment
- Run the test approach and discovery automation script:
  ```bash
  node system/management/test-approach-and-discovery.js
  ```
- This script will prepare clean test environment for T-2.4.1 validation

### Step 5: Generate T-2.4.1 Testing Approach
- Read the file `pmc\system\coding-prompts\03-test-approach-prompt-v3-enhanced.md`
- Execute the instructions to generate testing approach for T-2.4.1 documentation validation
- Populate `pmc/system/plans/task-approach/current-test-approach.md` with T-2.4.1 specific approach
- Run `node bin/aplio-agent-cli.js test-approach` from pmc to integrate approach
- **Wait for human operator instructions before proceeding to Step 6**

### Step 6: Execute T-2.4.1 Testing Protocol
- Turn your full attention to `pmc/core/active-task-unit-tests-2-enhanced.md`
- This file contains the complete T-2.4.1 testing protocol with 5 phases:
  - **Phase 0**: Environment setup and file verification
  - **Phase 1**: Legacy accuracy validation against tailwind.config.js
  - **Phase 2**: TypeScript compilation validation with strict mode
  - **Phase 3**: Cross-reference integration testing with T-2.3.5
  - **Phase 4**: Next.js 14 SSR compatibility validation
  - **Phase 5**: Comprehensive quality validation
- Execute each phase sequentially, ensuring all validation criteria are met
- Document all findings in the T-2.4.1 testing report

## T-2.4.1 Success Criteria 

You shall consider testing successful when ALL criteria are met:
1. ✅ **Legacy Accuracy**: 100% accuracy verified against `aplio-legacy/tailwind.config.js` lines 13-17 and 21-23
2. ✅ **TypeScript Compliance**: All code examples compile successfully with strict mode enabled
3. ✅ **Cross-Reference Integration**: All T-2.3.5 accessibility links functional and accessible
4. ✅ **SSR Compatibility**: All responsive patterns demonstrated as Next.js 14 SSR-safe
5. ✅ **Mobile-First Consistency**: Mobile-first methodology applied consistently across all 5 files
6. ✅ **Documentation Quality**: Professional documentation standards met across 2,752 total lines
7. ✅ **Structure Compliance**: 5-file pattern matches proven T-2.3.5 implementation exactly
8. ✅ **Testing Coverage**: All validation phases completed without critical failures

## File Relationship Understanding

**CRITICAL**: These two files work together and do NOT conflict:
- `pmc/core/active-task-unit-tests-2-enhanced.md` - Contains your complete testing protocol with detailed validation phases
- `pmc/core/active-task.md` - Contains the implementation details of what you're testing

You must execute the testing protocol in `pmc/core/active-task-unit-tests-2-enhanced.md` to validate the implementation documented in `pmc/core/active-task.md`.

## Post-Testing Report Requirements

After completing all T-2.4.1 testing phases, notify the human operator with:

1. **Overall Testing Status**: PASS/CONDITIONAL PASS/FAIL with specific criteria results
2. **Legacy Accuracy Results**: Detailed validation against tailwind.config.js lines 13-17 and 21-23
3. **TypeScript Compilation Results**: All code examples compilation status with strict mode
4. **Cross-Reference Validation**: T-2.3.5 integration link verification results
5. **SSR Compatibility Assessment**: Next.js 14 pattern validation outcomes
6. **Documentation Quality Assessment**: Professional standards compliance across 2,752 lines
7. **Testing Report Location**: Path to `test/reports/T-2.4.1/T-2.4.1-testing-report.md`
8. **Recommendations**: Any findings requiring attention or future improvement

## Important Notes

- **No Component Scaffolds Required**: T-2.4.1 is documentation testing, not component testing
- **No Visual Regression Testing**: Focus on content accuracy and TypeScript compilation
- **Legacy Reference Critical**: 100% accuracy to legacy tailwind.config.js is mandatory
- **5-File Pattern Validation**: Must confirm structure matches proven T-2.3.5 pattern
- **Directory Context**: Testing commands run from aplio-modern-1 directory, not pmc

**EXECUTION DIRECTIVE**: Do not deviate from the instructions in `pmc/core/active-task-unit-tests-2-enhanced.md`. Your role is to execute the comprehensive T-2.4.1 validation protocol exactly as specified.

This prompt provides the complete initialization procedure for T-2.4.1 Breakpoint System Documentation testing within the PMC system.
