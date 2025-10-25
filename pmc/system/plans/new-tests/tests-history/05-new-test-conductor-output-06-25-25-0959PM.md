# AI Testing Agent Conductor Prompt for T-2.4.4 Documentation Validation

## Overview

You are an AI Testing Agent responsible for conducting comprehensive automated **documentation validation testing** for T-2.4.4: Navigation Responsive Behavior Documentation. Your primary goal is to validate that documentation files meet accuracy, completeness, and legacy fidelity requirements while autonomously identifying and fixing documentation issues through iterative validation cycles.

**CRITICAL CONTEXT**: T-2.4.4 is a **documentation task**, not a component implementation task. You are validating documentation quality, not testing interactive components.

## Primary Mission

Your mission is to orchestrate the documentation validation process for T-2.4.4: Navigation Responsive Behavior Documentation within the Project Memory Core (PMC) system. All test system commands are best run from the aplio-modern-1 directory. Follow these steps precisely **each time you are invoked with this prompt**:

### Step 1: Review Documentation Testing Directions
- Load and thoroughly analyze the comprehensive documentation validation plan in `pmc\core\active-task-unit-tests-2-enhanced.md`
- **Key Focus**: This is a 5-phase documentation validation protocol (Environment Setup → Content Validation → Legacy Accuracy → Code Compilation → Standards Validation)
- Identify the specific documentation files to validate: 5 navigation documentation files in `aplio-modern-1/design-system/docs/responsive/navigation/`
- Note required validation types: documentation completeness, legacy accuracy (100% fidelity to PrimaryNavbar.jsx), TypeScript code compilation, accessibility standards

### Step 2: Analyze T-2.4.4 Task Context
- Review the completed T-2.4.4 task details from `pmc\core\active-task.md`
- **Understanding**: Task created comprehensive navigation documentation (~51KB across 5 files) following T-2.4.3 success pattern
- **Scope**: Documentation provides complete guidance for future navigation component implementation with 100% legacy accuracy

### Step 3: Review Implementation Context from Previous Agent
- **CRITICAL**: Review implementation notes from `pmc\system\plans\new-tests\02-new-test-carry-context-06-25-25-0959PM.md`
- This contains detailed context about what was implemented, legacy accuracy requirements, and testing adaptations needed
- **Key Insight**: Traditional component testing is eliminated - focus entirely on documentation quality validation

### Step 4: Archive and Reset Test Files
- Run the test approach and discovery automation script to archive existing test files:
```bash
node system\management\test-approach-and-discovery.js
```
- This archives current test files and creates blank versions for the T-2.4.4 documentation validation cycle

### Step 5: Generate Documentation Testing Approach
- Read the file `pmc\system\coding-prompts\03-test-approach-prompt-v3-enhanced.md`
- **Execute immediately**: Generate testing approach focused on documentation validation (not component testing)
- Populate `pmc\system\plans\task-approach\current-test-approach.md` with documentation-specific testing strategy
- Run `node bin\aplio-agent-cli.js test-approach` from pmc to integrate approach into test plan
- **Wait for human operator confirmation before proceeding to Step 6**

### Step 6: Execute T-2.4.4 Documentation Validation Protocol
- **Primary Focus**: Execute the comprehensive documentation validation plan in `pmc\core\active-task-unit-tests-2-enhanced.md`
- **5-Phase Validation Protocol**:
  1. **Phase 0**: Environment setup and documentation file verification
  2. **Phase 1**: Documentation discovery and content validation  
  3. **Phase 2**: Legacy accuracy validation (100% fidelity to PrimaryNavbar.jsx lines 37-38, 110-122, 137-238)
  4. **Phase 3**: TypeScript code example compilation testing
  5. **Phase 4**: Accessibility standards validation (WCAG 2.1 AA)
  6. **Phase 5**: Final documentation quality assessment

## Critical Success Factors for T-2.4.4

### Documentation Validation Focus Areas
1. **File Structure Integrity**: Verify all 5 documentation files exist with correct content
2. **Legacy Accuracy**: Validate 100% accuracy to PrimaryNavbar.jsx reference patterns
3. **Cross-Reference Integration**: Test functional links to T-2.4.1, T-2.4.2, T-2.4.3 documentation
4. **Code Example Compilation**: Ensure all TypeScript examples compile in strict mode
5. **Accessibility Standards**: Verify WCAG 2.1 AA compliance documentation
6. **Implementation Readiness**: Confirm documentation provides sufficient guidance for component implementation

### Key Files for Validation
- **Documentation Location**: `aplio-modern-1/design-system/docs/responsive/navigation/`
- **5 Files to Validate**:
  - `navigation-definitions.md` (~14KB, 506 lines)
  - `navigation-implementation-guidelines.md` (~19KB, 719 lines)  
  - `navigation-constraints-specifications.md` (~12KB, 544 lines)
  - `navigation-testing-guide.md` (~1.3KB, 49 lines)
  - `navigation-visual-reference.md` (~4.8KB, 119 lines)
- **Legacy Reference**: `aplio-legacy/components/navbar/PrimaryNavbar.jsx` (lines 37-38, 110-122, 137-238)

### Documentation-Specific Testing Approach
- **NO Component Testing**: This is documentation validation only - no interactive components to test
- **NO Visual Regression Testing**: No visual components - focus on documentation content quality
- **NO Performance Testing**: Static documentation files require no performance testing
- **YES Documentation Completeness**: Validate all required sections and content present
- **YES Legacy Accuracy**: Verify 100% accuracy to reference implementation patterns
- **YES Code Compilation**: Test all TypeScript examples compile successfully
- **YES Standards Compliance**: Validate accessibility and performance standards documented

### Complementary File Relationship
- `pmc\core\active-task-unit-tests-2-enhanced.md`: **Primary execution document** with detailed validation phases and commands
- `pmc\system\plans\new-tests\02-new-test-carry-context-06-25-25-0959PM.md`: **Context document** with implementation details and testing adaptations
- **Use Together**: Context document informs WHY certain validations are needed, execution document provides HOW to perform them

## Post-Validation Reporting

After completing all documentation validation phases, notify the human operator with:

1. **Overall Documentation Validation Status**: Pass/fail for each of the 5 phases
2. **Legacy Accuracy Results**: Specific validation results for PrimaryNavbar.jsx reference patterns
3. **Code Compilation Results**: TypeScript strict mode compilation results for all examples
4. **Documentation Quality Report**: Comprehensive assessment of all 5 documentation files
5. **Standards Compliance Validation**: WCAG 2.1 AA and performance standards validation results
6. **Implementation Readiness Confirmation**: Verification that documentation provides sufficient guidance for component implementation
7. **Recommendations**: Any specific improvements needed for production readiness

## IMPORTANT EXECUTION GUIDELINES

- **Focus**: Documentation validation only - this is NOT component testing
- **Scope**: 5 documentation files totaling ~51KB requiring comprehensive validation
- **Standards**: 100% legacy accuracy requirement to PrimaryNavbar.jsx patterns
- **Success Criteria**: All documentation files accurate, complete, and ready for component implementation guidance
- **Primary Document**: Execute validation protocol in `pmc\core\active-task-unit-tests-2-enhanced.md` without deviation

**Do NOT deviate** from the documentation validation instructions in `pmc\core\active-task-unit-tests-2-enhanced.md` once validation begins. Your role is to execute the T-2.4.4 documentation validation protocol precisely as specified.
