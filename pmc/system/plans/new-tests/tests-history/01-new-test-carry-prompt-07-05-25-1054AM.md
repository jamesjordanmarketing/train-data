# First Test Carry Over Prompt

## Overview
This prompt automates the complete handoff process from task completion to testing phase initialization. Execute all three steps in sequence, ensuring each step completes before proceeding to the next.

## STEP 1: Create Testing Context Carryover

**Objective**: Generate comprehensive context documentation for the testing agent.

This carryover is going to be focused ONLY on the work you did by executing the Task T-3.1.4 in pmc\core\active-task.md

We need to update the test carryover file to prepare the next agent to execute the tests for this task as documented in pmc\core\active-task-unit-tests-2.md  

You will add all of the appropriate information to the carry over file:
system\plans\new-tests\02-new-test-carry-context-07-05-25-1054AM.md

Read the testing carryover template here: pmc\system\templates\new-test-carry-context-template.md to understand how to use it correctly.

Then read:
- `pmc/core/active-task.md` (this is the task we are currently preparing a test plan for which will be executed by the next ai testing agent)

- `pmc/core/active-task-unit-tests-2.md` (this is the first draft of the test plan for the task we just finished implementing)

- Next you must also read the task implementation details in this chat panel. You have been the primary implementer of the current task. Apply your knowledge of any changes, new acceptance criteria, task implementation, new tests requirements or removed test requirements that will affect the specifications for the testing of this task.

Create a detailed context carryover file at: `system\plans\new-tests\02-new-test-carry-context-07-05-25-1054AM.md`

**Content Requirements**:
- **Task Summary**: Concise, one-paragraph overview of the development task just completed, written so the testing agent immediately understands what was built and why it matters.
- **Critical Testing Context**: Describe only the implementation details or constraints from the current session that could affect test design or expected outcomes
- **Testing Focus Areas**: Bullet the components, functions, or behaviours that need the most scrutiny because they are new, complex, or high-risk
- **Existing Testing Instructions Adaptations**: Explain any changes or additions the tester must make to the baseline unit-test file pmc/core/active-task-unit-tests-2.md—for example, new test cases, altered assertions, or removed stubs.
- **Modified Testing Approaches**: Document what testing approaches need modification based on the actual implementation
- **Eliminated Requirements**: Document and instruct the testing agent on any testing steps that are now obsolete because the feature covers them or the requirement was dropped.
- **Additional Testing Needs**: Identify fresh test scenarios that became necessary due to the way the feature was implemented but are not yet documented in `pmc/core/active-task-unit-tests-2.md`
- **Key Files and Locations**: Document all files created, modified, or critical to testing
- **Specification References**: Cite and reference the authoritative docs, specs, or templates that define expected behavior. Include the full relative path. Include exact section names, line numbers or headings for quick lookup
- **Success Criteria**: Adapt the existing acceptance criteria to define measurable conditions that constitute a "pass" for this testing cycle (e.g., "All validation scripts return exit code 0" or "Coverage ≥ 90 % on modified modules").
- **Testing Requirements Summary**: One-page checklist that combines all mandatory tests, success gates, and file targets—so the tester can verify completeness at a glance
- **Testing Agent Directives**: Provide explicit, directive step instructions the testing agent should follow in order

**Format Requirements**:
- Use clear section headers
- Be succinct but comprehensive
- Focus only on information critical for testing
- Remove any unused or irrelevant sections
- Use directive language ("You shall", "You must", etc.)

Do NOT attempt to fix or add any more code, tests or content to this task. We will hand it over to the ai unit test engineer agent.  

One more reminder. Your job is ONLY to update system\plans\new-tests\02-new-test-carry-context-07-05-25-1054AM.md with an in depth context build of all of the information it will need to fully create a customized test plan. Remove any sections not used.

**Completion Check**: Verify that `system\plans\new-tests\02-new-test-carry-context-07-05-25-1054AM.md` has been updated with and contains all required sections before proceeding to Step 2.

---

## STEP 2: Enhance Test Plan Specifications - Two-Part Structure

**Objective**: Create two specialized test plan files that separate discovery/unit testing from visual/integration testing phases.

**Prerequisites**: 
- Step 1 must be completed successfully
- Read and understand the template structure from `pmc\system\templates\active-task-test-template-2.md`

**Instructions**:
Read the following files:
- `pmc/core/active-task-unit-tests-2.md` (base test plan)
- `system\plans\new-tests\02-new-test-carry-context-07-05-25-1054AM.md` (context from Step 1)
- `pmc/core/active-task.md` (implemented task details)
- `pmc\system\templates\active-task-test-template-2.md` (strict template to follow)

### Part A: Create Phases 1 & 2 Test Plan
Create the first enhanced test plan at: `system\plans\new-tests\03-new-test-active-test-2-enhanced-07-05-25-1054AM.md-1-and-2`

**Content Requirements for Phases 1 & 2**:
- **Phase 0**: Pre-Testing Environment Setup (from template)
  - Exact shell commands for environment preparation
  - Dependency verification steps
  - Directory structure creation
  - Service startup procedures
  
- **Phase 1**: Component Discovery & Classification
  - Detailed discovery methodology specific to the task
  - Component identification procedures
  - Classification criteria with exact file paths
  - Discovery validation steps
  - Include proper test-approach instructions that were often missing
  
- **Phase 2**: Unit Testing
  - Specific unit test creation steps
  - Test file generation with exact content
  - Test execution commands
  - Coverage requirements and verification
  - Edge case testing procedures
  
- **Completion Report Section**: Add a structured completion report section that includes:
  - Summary of discovered components
  - Unit test results summary
  - Coverage metrics achieved
  - List of validated files
  - Handoff information for Phases 3-5

**Phase 1 & 2 Specific Enhancements**:
- Include comprehensive test-approach instructions for each discovered component
- Provide exact commands for test file creation and execution
- Document expected output formats and validation criteria
- Specify exact coverage thresholds and how to measure them

### Part B: Create Phases 3-5 Test Plan
Create the second enhanced test plan at: `system\plans\new-tests\03-new-test-active-test-2-enhanced-07-05-25-1054AM.md-3-thru-5`

**Content Requirements for Phases 3-5**:
- **Handoff Section**: Begin with a section that references the completion report from Phases 1 & 2
  - How to verify Phase 1 & 2 completion
  - Required artifacts from previous phases
  - Continuation context setup
  
- **Phase 3**: Visual Testing (if applicable)
  - Detailed LLM Vision action steps with exact prompts
  - Screenshot capture procedures with specific commands
  - Visual comparison methodology
  - Expected visual validation criteria
  - Full detail on executing LLM Vision analysis including:
    - Exact prompt templates
    - Image preparation steps
    - Analysis interpretation guidelines
    - Success/failure determination criteria
  
- **Phase 4**: Integration Testing
  - System integration test procedures
  - API testing methodologies
  - End-to-end test scenarios
  - Performance validation steps
  
- **Phase 5**: Final Validation & Reporting
  - Comprehensive validation checklist
  - Final report generation with templates
  - Success criteria verification
  - Documentation of all test results from Phases 1-5
  - Integration of Phase 1 & 2 results into final report

**Phase 3-5 Specific Enhancements**:
- Provide complete LLM Vision execution instructions including:
  - Image capture commands and parameters
  - Vision API prompt engineering templates
  - Expected response formats and parsing instructions
  - Visual defect identification criteria
- Include integration test scenarios that build on unit test results
- Define clear pass/fail criteria for each visual element
- Specify exact report formats and content requirements

### General Enhancement Requirements for Both Files:
- **Task-Specific Instructions**: Adapt all generic instructions to be specific to the completed task
- **Directive Language**: Use commanding language ("You shall", "You must", "Execute exactly") 
- **Tool Specifications**: Include exact tool versions, commands, and parameters
- **Validation Steps**: Provide verification commands after each major step
- **Error Handling**: Include specific error recovery procedures
- **File References**: Use absolute paths and include line numbers where applicable
- **Measurable Criteria**: Define quantifiable success metrics for each phase

**Quality Standards**:
- Every instruction must be actionable and specific
- Remove any ambiguous or generic language
- Ensure compatibility between both test plan files
- Include clear transition points between files
- Focus on verification of actual implementation

**Completion Checks**: 
1. Verify that `system\plans\new-tests\03-new-test-active-test-2-enhanced-07-05-25-1054AM.md-1-and-2` exists and contains:
   - Complete Phase 0, 1, and 2 instructions
   - Proper test-approach methodology
   - Completion report section for handoff
   
2. Verify that `system\plans\new-tests\03-new-test-active-test-2-enhanced-07-05-25-1054AM.md-3-thru-5` exists and contains:
   - Handoff section referencing Phase 1 & 2 results
   - Detailed LLM Vision execution steps
   - Complete Phase 3, 4, and 5 instructions
   - Final comprehensive report structure

Once both files are confirmed:
1. Copy `system\plans\new-tests\03-new-test-active-test-2-enhanced-07-05-25-1054AM.md-1-and-2` into `pmc\core\active-task-unit-tests-2-enhanced-phases-1-2.md` replacing everything already there
2. Copy `system\plans\new-tests\03-new-test-active-test-2-enhanced-07-05-25-1054AM.md-3-thru-5` into `pmc\core\active-task-unit-tests-2-enhanced-phases-3-5.md` replacing everything already there

---

## EXECUTION PROTOCOL

**Sequential Execution**: Execute steps 1 and 2 in exact order. Do not proceed to next step until current step's completion check passes.

**File Verification**: After each step, verify the target files exist and contain required content before proceeding.

**Two-File Structure**: Step 2 now creates two separate files that must work together as a complete testing suite.

**Error Handling**: If any step fails, stop execution and report the specific failure before attempting to continue.

**Final Validation**: Upon completion of both steps, verify:
- Context carryover file exists and is complete
- Both test plan files exist and are properly structured
- Handoff mechanism between files is clearly defined
- All phases follow the strict template structure

**Success Criteria**: 
- Context carryover file created successfully
- Two test plan files created with proper separation of phases
- Clear handoff mechanism between Phase 1-2 and Phase 3-5 files
- Comprehensive testing instructions following template structure
- No conflicting instructions between files

**Default Bash Shell Directory**: New bash shells ALWAYS open in pmc by default. Keep that in mind and navigate correctly when you start a new shell.