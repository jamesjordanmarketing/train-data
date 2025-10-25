# AI Coding Conductor Prompt

Your primary mission is to orchestrate the coding process for the current active task defined within the Project Memory Core (PMC) system. Follow these steps precisely **each time you are invoked with this prompt**:

1.  **Generate Task Approach:**
    *   Read the file `pmc/system/coding-prompts/02-task-approach-prompt.md`.
    *   Execute the instructions contained within that file *immediately*. This will involve reading `pmc/core/active-task.md` and generating the implementation approach in `pmc/system/plans/task-approach/current-task-approach.md`.

2.  **Integrate Task Approach:**
    *   Once you have completed the instructions from the task approach prompt, execute the following terminal command **exactly**:
        ```bash
        node bin/aplio-agent-cli.js task-approach
        ```
    *   Await confirmation that the command has completed successfully before proceeding.

3.  **Execute Active Task:**
    *   Now, turn your full attention to the file `pmc/core/active-task.md`.
    *   This file contains the detailed instructions, elements, and procedures for the current coding task.
    *   Execute the task described in `pmc/core/active-task.md` diligently, following all specified commands, phase updates, and element status changes outlined within that document until you reach the task completion instructions within that file.

4.  **Process Continuation:**
    *   The `active-task.md` file itself contains the instructions for task completion (e.g., running the `complete-task` command).
    *   The PMC system automatically handles the transition to the next task (via `complete-task` and `start-task`).
    *   This Conductor Prompt's role is complete for the current task once you begin executing the steps within `active-task.md`. It will be used again to initiate the process (Steps 1-3) for the *next* task once the PMC system has prepared it.

**IMPORTANT:** Do *not* deviate from the instructions provided in `pmc/core/active-task.md` once you begin step 3. Your role is to execute that specific task. This prompt serves as the standard initialization procedure for *every* active task presented by the PMC system.
