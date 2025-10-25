# First Test Carry Automation Prompt

## Overview
This prompt automates the complete handoff process from task completion to testing phase initialization. Execute all three steps in sequence, ensuring each step completes before proceeding to the next.

## STEP 1: Create Testing Context Carryover

**Objective**: Generate comprehensive context documentation for the testing agent.

**Instructions**: 
Read the following files to understand the completed task and testing framework:
- `pmc/core/active-task.md`
- `pmc/core/active-task-unit-tests-2.md`
- `pmc/core/previous-task.md`


Create a detailed context carryover file at: `pmc/system/plans/context-carries/first-test-carry-context.md`

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

**Completion Check**: Verify that `pmc/system/plans/context-carries/first-test-carry-context.md` exists and contains all required sections before proceeding to Step 2.

---

## STEP 2: Enhance Test Plan Specifications

**Objective**: Adapt the generic test plan to be specific and directive for the completed task.

**Prerequisites**: Step 1 must be completed successfully.

**Instructions**:
Read the following files:
- `pmc/core/active-task-unit-tests-2.md` (base test plan)
- `pmc/system/plans/context-carries/first-test-carry-context.md` (context from Step 1)
- `pmc/core/active-task.md` (completed task details)

Create an enhanced test plan at: `pmc/core/active-task-unit-tests-2-enhanced.md`

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

**Completion Check**: Verify that `pmc/core/active-task-unit-tests-2-enhanced.md` exists, is task-specific, and uses directive language throughout before proceeding to Step 3.

---

## STEP 3: Create Customized Conductor Prompt

**Objective**: Generate testing agent conductor prompt that integrates context and enhanced test plan.

**Prerequisites**: Steps 1 and 2 must be completed successfully.

**Instructions**:
Read the following files:
- `pmc/system/coding-prompts/03-test-conductor-prompt-v5.md` (base conductor prompt)
- `pmc/system/plans/context-carries/first-test-carry-context.md` (from Step 1)
- `pmc/core/active-task-unit-tests-2-enhanced.md` (from Step 2)

Create customized conductor prompt at: `pmc/system/coding-prompts/03-test-conductor-prompt-v5-with-context.md`

**Customization Process**:

1. **Base Prompt Integration**: Start with the full text of `03-test-conductor-prompt-v5.md`

2. **Context Integration**: Add specific instructions for the testing agent to:
   - Read and understand `first-test-carry-context.md` first
   - Use context information to inform all testing decisions
   - Reference specific implementation details from context

3. **Enhanced Test Plan Integration**: Add instructions to:
   - Execute `active-task-unit-tests-2-enhanced.md` as the primary test specification
   - Follow all directive instructions exactly as written
   - Report results according to enhanced test plan requirements

4. **Complementary Usage**: Ensure the prompt clearly states:
   - Both files are required and complementary
   - Context provides background and specific requirements
   - Enhanced test plan provides step-by-step execution instructions
   - Any conflicts should be resolved by prioritizing the enhanced test plan

5. **Optimization Review**: Include this section in your prompt:
   ```
   "Here is what I plan to tell the next testing agent:
   [Full customized prompt text]
   
   This prompt guides the testing agent to understand both:
   - pmc/system/plans/context-carries/first-test-carry-context.md
   - pmc/core/active-task-unit-tests-2-enhanced.md
   
   These files are complementary and should not conflict or confuse the testing agent."
   ```

**Quality Assurance**:
- Verify no conflicting instructions between context and test plan
- Ensure testing agent has clear priority hierarchy for instruction conflicts
- Confirm all file references are correct and accessible
- Validate that the prompt provides sufficient guidance for autonomous testing execution

**Completion Check**: Verify that `pmc/system/coding-prompts/03-test-conductor-prompt-v5-with-context.md` exists, integrates all components, and provides clear guidance for testing agent execution.

---

## EXECUTION PROTOCOL

**Sequential Execution**: Execute steps 1, 2, and 3 in exact order. Do not proceed to next step until current step's completion check passes.

**File Verification**: After each step, verify the target file exists and contains required content before proceeding.

**Error Handling**: If any step fails, stop execution and report the specific failure before attempting to continue.

**Final Validation**: Upon completion of all three steps, verify all three output files exist and are properly cross-referenced.

**Success Criteria**: All three files created successfully with no conflicting instructions and clear guidance for autonomous testing agent execution.
