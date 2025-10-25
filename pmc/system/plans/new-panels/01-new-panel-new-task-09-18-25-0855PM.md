# Create New Task Context Carryover

## Overview
This prompt automates the complete handoff process from test completion of T-1.2.1 to the next task implementation of T-1.2.2.

**Objective**: Generate comprehensive context documentation for the implementation agent.

We need to update the carryover file to prepare the next agent to implement T-1.2.2 which is described in pmc\core\active-task.md

You will add all of the appropriate information to this carry over file:
system\plans\new-panels\02-new-task-carry-context-09-18-25-0855PM.md

Read the carry over file first system\plans\new-panels\02-new-task-carry-context-09-18-25-0855PM.md first, to understand how to use it correctly.

Then read:
- `pmc\core\active-task.md` (this is task T-1.2.2 which we are currently preparing to implement and which will be executed by the next ai implementation agent)

- `pmc\core\previous-task.md` (this is task T-1.2.1 which we just finished implementing)

- `pmc\core\previous-task-unit-tests-2-enhanced.md` (this is test plan for T-1.2.1 which we just finished implementing)

- Next you must also review the test implementation details for T-1.2.1 by reading the details in this chat panel. You have been the primary implementer of the current test plan. Apply your knowledge of any changes, new acceptance criteria, task implementation, new tests requirements or removed test requirements that will affect the specifications for implementing the next task: T-1.2.2

You shall update the detailed context carryover file at: `system\plans\new-panels\02-new-task-carry-context-09-18-25-0855PM.md` with the following information:

**Content Requirements**:
- **Task Summary**: Concise, one-paragraph overview of the task just completed, written so the ai implementation agent immediately understands what was built and why it matters.

**The Active Development Focus** for the next agent are the details we need to implement the next task: T-1.2.2

- **Critical Implementation Context**: Describe only the implementation details, tests or constraints from the current session that could affect the implementation of the next task: T-1.2.2

- **Existing Implementation Instructions Adaptations**: Explain any changes, additions, or subtractions the implementation agent must make as a result of the previous task T-1.2.1. For example, new acceptance criteria, altered assertions,.

- **Modified Implementation Approaches**: Document what implementation approaches need modification based on the actual implementation or testing of the previous task: T-1.2.1

- **Eliminated Requirements**: Document and instruct the implementation agent on any implementation steps that are now obsolete because of the work done on T-1.2.1.

- **Additional Testing Needs**: Identify fresh implementation scenarios that became necessary due to the way T-1.2.1 was implemented but are not yet documented in `pmc\core\active-task.md`

- **Key Files and Locations**: Document all files created, modified, or critical to implementation
- **Specification References**: Cite and reference the authoritative docs, specs, or templates that define expected behavior. Include the full relative path. Include exact section names, line numbers or headings for quick lookup

- **Acceptance Criteria**: Identify fresh acceptance criteria that became necessary due to the way T-1.2.1 was implemented but are not yet documented in `pmc\core\active-task.md`

**Format Requirements**:
- Use clear section headers
- Be succinct but comprehensive
- Focus only on information critical for implementing the next task: T-1.2.2
- Remove any unused or irrelevant sections
- Use directive language ("You shall", "You must", etc.)

Do NOT attempt to fix or add any more code, tests or content to this task. We will hand it over to the ai implementation engineer agent.  

One more reminder. Your job is ONLY to update system\plans\new-panels\02-new-task-carry-context-09-18-25-0855PM.md with an in depth context build of all of the information it will need to implement T-1.2.2. Remove any sections not used.

**Completion Check**: Verify that `system\plans\new-panels\02-new-task-carry-context-09-18-25-0855PM.md` has been updated with and contains all required sections before proceeding to Step 2.