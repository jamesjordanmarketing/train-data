# AI Coding Conductor Prompt

Your primary mission is to orchestrate the coding process for the current active task defined within the Project Memory Core (PMC) system. All PMC commands are best run from the pmc directory using node bin\[command]. Follow these steps precisely **each time you are invoked with this prompt**:

1.  **Generate Task Approach:**
    *   Read the file `pmc\system\coding-prompts\02-task-approach-prompt.md`.
    *   Read the file `pmc\system\plans\context-carries\context-carry-info-06-14-25-318pm.md' for additional context from the task finished just before this one.
    *   Execute the instructions contained within `pmc\system\coding-prompts\02-task-approach-prompt.md` *immediately*. This will involve reading `pmc\core\active-task.md` and generating the implementation approach in `pmc\system\plans\task-approach\current-task-approach.md`.

2.  **Integrate Task Approach:**
    *  Once you have completed the instructions from the task approach prompt, then:
    1. Check if you are in the directory 'pmc'
    2. If you are then execute the command in step 4. directly below.
    3. If you are NOT in pmc navigate to that directory manually first (not as part of compound '&&' commands)
    4. execute the following terminal command **exactly**:
        ```bash
        node bin\aplio-agent-cli.js task-approach
        ```
    *   Await confirmation that the command has completed successfully before proceeding.
    *   Check the ** Task Approach section of pmc\core\active-task.md if it does NOT have a "Added:" notation. Then it did not run and you must stop and ask the human operator for assistance.

3.  **Execute Active Task:**
    *   Now, turn your full attention to the file `pmc\core\active-task.md`.
    *   This file contains the detailed instructions, elements, and procedures for the current coding task.
    *   Execute the task described in `pmc\core\active-task.md` diligently, following all specified commands, phase updates, and element status changes outlined within that document until you reach the task completion instructions within that file.

4.  **Unit Testing:**
    *   The `pmc\core\active-task-unit-tests-2.md` file itself contains the instructions for unit testing the task.
    *   Once you have completed all phases by completing the last VAL task and running the VAL update-phase-stage "complete" command, you MUST stop and await instructions from the human operator to begin unit testing.

# Unit Testing Overview
Unit testing for this task is managed in a separate file to reduce cognitive load and ensure comprehensive test implementation.

**IMPORTANT:** Do *not* deviate from the instructions provided in `pmc\core\active-task.md` once you begin step 3. Your role is to execute that specific task. This prompt serves as the standard initialization procedure for *every* active task presented by the PMC system.
