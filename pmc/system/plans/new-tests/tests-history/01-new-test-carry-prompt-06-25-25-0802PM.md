# First Test Carry Over Prompt

## Overview
This prompt automates the complete handoff process from task completion to testing phase initialization. Execute all three steps in sequence, ensuring each step completes before proceeding to the next.

## STEP 1: Create Testing Context Carryover

**Objective**: Generate comprehensive context documentation for the testing agent.

This carryover is going to be focused ONLY on the work you did by executing the Task T-2.4.3 in pmc\core\active-task.md

We need to update the test carryover file to prepare the next agent to execute the tests for this task as documented in pmc\core\active-task-unit-tests-2.md  

You will add all of the appropriate information to the carry over file:
system\plans\new-tests\02-new-test-carry-context-06-25-25-0802PM.md

Read the testing carryover template here: pmc\system\templates\new-test-carry-context-template.md to understand how to use it correctly.

Then read:
- `pmc/core/active-task.md` (this is the task we are currently preparing a test plan for which will be executed by the next ai testing agent)

- `pmc/core/active-task-unit-tests-2.md` (this is the first draft of the test plan for the task we just finished implementing)

- Next you must also read the task implementation details in this chat panel. You have been the primary implementer of the current task. Apply your knowledge of any changes, new acceptance criteria, task implementation, new tests requirements or removed test requirements that will affect the specifications for the testing of this task.

Create a detailed context carryover file at: `system\plans\new-tests\02-new-test-carry-context-06-25-25-0802PM.md`

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
- **Success Criteria**: Adapt the existing acceptance criteria to define measurable conditions that constitute a “pass” for this testing cycle (e.g., “All validation scripts return exit code 0” or “Coverage ≥ 90 % on modified modules”).
- **Testing Requirements Summary**: One-page checklist that combines all mandatory tests, success gates, and file targets—so the tester can verify completeness at a glance
- **Testing Agent Directives**: Provide explicit, directive step instructions the testing agent should follow in order

**Format Requirements**:
- Use clear section headers
- Be succinct but comprehensive
- Focus only on information critical for testing
- Remove any unused or irrelevant sections
- Use directive language ("You shall", "You must", etc.)

Do NOT attempt to fix or add any more code, tests or content to this task. We will hand it over to the ai unit test engineer agent.  

One more reminder. Your job is ONLY to update system\plans\new-tests\02-new-test-carry-context-06-25-25-0802PM.md with an in depth context build of all of the information it will need to fully create a customized test plan. Remove any sections not used.

**Completion Check**: Verify that `system\plans\new-tests\02-new-test-carry-context-06-25-25-0802PM.md` has been updated with and contains all required sections before proceeding to Step 2.

---

## STEP 2: Enhance Test Plan Specifications

**Objective**: Adapt the generic test plan to be specific and directive for the completed task.

**Prerequisites**: Step 1 must be completed successfully.

**Instructions**:
Read the following files:
- `pmc/core/active-task-unit-tests-2.md` (base test plan)
- `system\plans\new-tests\02-new-test-carry-context-06-25-25-0802PM.md` (context from Step 1)
- `pmc/core/active-task.md` (implemented task details)

Create an enhanced test plan at: `system\plans\new-tests\03-new-test-active-test-2-enhanced-06-25-25-0802PM.md`

**Enhancement Requirements**:
- **Task-Specific Instructions**: Adapt all generic instructions to be specific to the completed task
- **Directive Language**: Use commanding language ("You shall", "You must", "Execute exactly") 
- **Detailed Test Steps**: Provide step-by-step testing procedures specific to what was implemented
- **Validation Criteria**: Define exact success/failure criteria for each test component
- **Tool Usage**: Specify exact tools and commands to be used for testing
- **File Verification**: List specific files, line numbers, and content to be verified
- **Performance Metrics**: Define measurable success criteria where applicable
- **Edge Cases**: Document specific edge cases to test based on implementation
- **Integration Points**: Identify integration testing requirements specific to this task
- **Documentation Validation**: Specify how to validate documentation quality and accuracy

**Quality Standards**:
- Every instruction must be actionable and specific
- Remove any ambiguous or generic language
- Ensure compatibility with context carryover file
- Eliminate conflicting instructions
- Focus on verification of actual implementation

**Completion Check**: Verify that `system\plans\new-tests\03-new-test-active-test-2-enhanced-06-25-25-0802PM.md` exists, is task-specific, and uses directive language throughout before proceeding to Step 3.

Once confirmed copy `system\plans\new-tests\03-new-test-active-test-2-enhanced-06-25-25-0802PM.md` into pmc\core\active-task-unit-tests-2-enhanced.md replacing everything already there.

---

## EXECUTION PROTOCOL

**Sequential Execution**: Execute steps 1 and 2 in exact order. Do not proceed to next step until current step's completion check passes.

**File Verification**: After each step, verify the target file exists and contains required content before proceeding.

**Error Handling**: If any step fails, stop execution and report the specific failure before attempting to continue.

**Final Validation**: Upon completion of both steps, verify both output files exist and are properly cross-referenced.

**Success Criteria**: Both files created successfully with no conflicting instructions and clear guidance for autonomous testing agent execution.

**Default Bash Shell Directory** New bash shells ALWAYS open in pmc by default. Keep that in mind and navigate correctly when you start a new shell.
