# Create New Task Context Carryover

## Overview
This prompt automates the complete handoff process from test completion of {{PREVIOUS_TASK_ID}} to the next task implementation of {{CURRENT_TASK_ID}}.

**Objective**: Generate comprehensive context documentation for the implementation agent.

We need to update the carryover file to prepare the next agent to implement {{CURRENT_TASK_ID}} which is described in pmc\core\active-task.md

You will add all of the appropriate information to this carry over file:
{{NEW_TASK_CARRY_CONTEXT_PATH}}

Read the carry over file first {{NEW_TASK_CARRY_CONTEXT_PATH}} first, to understand how to use it correctly.

Then read:
- `pmc\core\active-task.md` (this is task {{CURRENT_TASK_ID}} which we are currently preparing to implement and which will be executed by the next ai implementation agent)

- `pmc\core\previous-task.md` (this is task {{PREVIOUS_TASK_ID}} which we just finished implementing)

- `pmc\core\previous-task-unit-tests-2-enhanced.md` (this is test plan for {{PREVIOUS_TASK_ID}} which we just finished implementing)

- Next you must also review the test implementation details for {{PREVIOUS_TASK_ID}} by reading the details in this chat panel. You have been the primary implementer of the current test plan. Apply your knowledge of any changes, new acceptance criteria, task implementation, new tests requirements or removed test requirements that will affect the specifications for implementing the next task: {{CURRENT_TASK_ID}}

You shall update the detailed context carryover file at: `{{NEW_TASK_CARRY_CONTEXT_PATH}}` with the following information:

**Content Requirements**:
- **Task Summary**: Concise, one-paragraph overview of the task just completed, written so the ai implementation agent immediately understands what was built and why it matters.

**The Active Development Focus** for the next agent are the details we need to implement the next task: {{CURRENT_TASK_ID}}

- **Critical Implementation Context**: Describe only the implementation details, tests or constraints from the current session that could affect the implementation of the next task: {{CURRENT_TASK_ID}}

- **Existing Implementation Instructions Adaptations**: Explain any changes, additions, or subtractions the implementation agent must make as a result of the previous task {{PREVIOUS_TASK_ID}}. For example, new acceptance criteria, altered assertions,.

- **Modified Implementation Approaches**: Document what implementation approaches need modification based on the actual implementation or testing of the previous task: {{PREVIOUS_TASK_ID}}

- **Eliminated Requirements**: Document and instruct the implementation agent on any implementation steps that are now obsolete because of the work done on {{PREVIOUS_TASK_ID}}.

- **Additional Testing Needs**: Identify fresh implementation scenarios that became necessary due to the way {{PREVIOUS_TASK_ID}} was implemented but are not yet documented in `pmc\core\active-task.md`

- **Key Files and Locations**: Document all files created, modified, or critical to implementation
- **Specification References**: Cite and reference the authoritative docs, specs, or templates that define expected behavior. Include the full relative path. Include exact section names, line numbers or headings for quick lookup

- **Acceptance Criteria**: Identify fresh acceptance criteria that became necessary due to the way {{PREVIOUS_TASK_ID}} was implemented but are not yet documented in `pmc\core\active-task.md`

**Format Requirements**:
- Use clear section headers
- Be succinct but comprehensive
- Focus only on information critical for implementing the next task: {{CURRENT_TASK_ID}}
- Remove any unused or irrelevant sections
- Use directive language ("You shall", "You must", etc.)

Do NOT attempt to fix or add any more code, tests or content to this task. We will hand it over to the ai implementation engineer agent.  

One more reminder. Your job is ONLY to update {{NEW_TASK_CARRY_CONTEXT_PATH}} with an in depth context build of all of the information it will need to implement {{CURRENT_TASK_ID}}. Remove any sections not used.

**Completion Check**: Verify that `{{NEW_TASK_CARRY_CONTEXT_PATH}}` has been updated with and contains all required sections before proceeding to Step 2.