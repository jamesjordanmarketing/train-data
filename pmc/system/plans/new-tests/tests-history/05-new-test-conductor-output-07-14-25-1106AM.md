# AI Testing Agent Conductor Prompt - T-3.3.3 Mobile Navigation Testing

## Overview

You are an AI Testing Agent responsible for conducting comprehensive automated testing for the T-3.3.3 Mobile Navigation implementation. Your primary goal is to validate that all mobile navigation components meet functional, visual, and performance requirements while autonomously identifying and fixing issues through iterative testing cycles.

## Critical Testing Protocol Understanding

### Two-Phase Testing Structure
The T-3.3.3 testing protocol is designed as a **two-phase system** with complementary test plans:

1. **Phase 1-2 Testing**: `pmc\core\active-task-unit-tests-2-enhanced-phases-1-2.md`
   - Component Discovery & Classification
   - Unit Testing (45 comprehensive tests)
   - Coverage validation (90% requirement)
   - Accessibility compliance (WCAG 2.1 AA)
   - Performance validation

2. **Phase 3-5 Testing**: `pmc\core\active-task-unit-tests-2-enhanced-phases-3-5.md`
   - Visual Testing with LLM Vision analysis
   - Integration Testing
   - Final Validation & Reporting
   - Production readiness verification

### Testing Execution Protocol

**MANDATORY SEQUENTIAL EXECUTION**: You must complete Phase 1-2 testing entirely before proceeding to Phase 3-5 testing. Each phase builds upon the previous phase's validated artifacts.

## Step-by-Step Testing Execution

### Step 1: Context Analysis
1. **Read Implementation Context**: 
   - Review `pmc\system\plans\new-tests\02-new-test-carry-context-07-14-25-1106AM.md`
   - Understand T-3.3.3 implementation details, testing focus areas, and critical testing context

2. **Analyze Active Task**: 
   - Review `pmc\core\active-task.md` for task specifications
   - Identify component requirements and acceptance criteria

### Step 2: Execute Phase 1-2 Testing
1. **Load Phase 1-2 Test Plan**:
   - Open and thoroughly analyze `pmc\core\active-task-unit-tests-2-enhanced-phases-1-2.md`
   - This file contains Pre-Testing Setup (Phase 0), Component Discovery (Phase 1), and Unit Testing (Phase 2)

2. **Execute Sequential Testing**:
   - **Phase 0**: Complete pre-testing environment setup
   - **Phase 1**: Execute component discovery and classification
   - **Phase 2**: Execute all 45 unit tests with coverage validation

3. **Generate Phase 1-2 Completion Report**:
   - Follow the completion report requirements in the test plan
   - Generate handoff documentation for Phase 3-5 execution

### Step 3: Execute Phase 3-5 Testing
1. **Load Phase 3-5 Test Plan**:
   - Open and thoroughly analyze `pmc\core\active-task-unit-tests-2-enhanced-phases-3-5.md`
   - This file contains Visual Testing (Phase 3), Integration Testing (Phase 4), and Final Validation (Phase 5)

2. **Verify Phase 1-2 Completion**:
   - Execute the handoff verification steps as outlined in the Phase 3-5 test plan
   - Confirm all Phase 1-2 artifacts are available

3. **Execute Sequential Testing**:
   - **Phase 3**: Execute visual testing with LLM Vision analysis
   - **Phase 4**: Execute integration testing
   - **Phase 5**: Execute final validation and reporting

### Step 4: Final Reporting
1. **Generate Comprehensive Report**:
   - Combine results from all 5 phases
   - Include executive summary with key findings
   - Provide production readiness assessment

2. **Notify Human Operator**:
   - Overall testing status across all phases
   - Links to generated test reports and artifacts
   - Summary of unit test, visual, and integration results
   - Production readiness confirmation
   - Any recommendations for manual review

## Important Testing Guidelines

### File Structure Understanding
- **Phase 1-2 Plan**: Contains setup, discovery, and unit testing (Phases 0, 1, 2)
- **Phase 3-5 Plan**: Contains visual, integration, and final validation (Phases 3, 4, 5)
- **Context File**: Contains implementation details and testing adaptations
- **Active Task**: Contains original task specifications and requirements

### Testing Approach Requirements
1. **You must** complete Phase 1-2 entirely before starting Phase 3-5
2. **You shall** generate completion reports after Phase 1-2 for handoff
3. **You must** verify Phase 1-2 completion before executing Phase 3-5
4. **You shall** follow the Fix/Test/Analyze cycle for any failures
5. **You must** achieve 90% code coverage in unit testing
6. **You shall** complete all accessibility and performance validations

### Success Criteria
- All 45 unit tests pass with 90% coverage
- WCAG 2.1 AA accessibility compliance verified
- Visual testing confirms legacy accuracy
- Integration testing validates T-3.3.1 foundation architecture
- Production readiness confirmed through final validation

### Directory Navigation
- All test commands are best run from the `aplio-modern-1` directory
- Navigate using `cd ..` then `cd aplio-modern-1` from pmc
- Test artifacts are generated in `aplio-modern-1/test/` subdirectories

## Error Handling Protocol
If any phase fails:
1. Document failure details in test reports
2. Apply automated corrections if possible
3. Re-run failed tests up to 3 attempts
4. Update artifacts and regenerate reports
5. Continue with Fix/Test/Analyze cycle until success

## Final Notes
- The two test plan files are **complementary**, not conflicting
- Each phase builds upon previous phase results
- Complete both test plans for full T-3.3.3 validation
- All testing must be completed before production deployment

**Begin with Phase 1-2 testing and proceed sequentially through all phases.**
