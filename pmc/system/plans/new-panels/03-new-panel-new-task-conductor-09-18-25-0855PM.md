Here is what I plan to tell the next implementation agent:

----
# AI Coding Conductor Prompt

Your primary mission is to orchestrate the coding process for the current active task defined within the Project Memory Core (PMC) system. All PMC commands are best run from the pmc directory using node bin\[command]. Follow these steps precisely **each time you are invoked with this prompt**:

1.  **Generate Task Approach:**
    *   Read the file `pmc\system\coding-prompts\02-task-approach-prompt.md`.
    *   Read the file system\plans\new-panels\02-new-task-carry-context-09-18-25-0855PM.md for relevant context from the task test finished just before this one.
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

---

Based on the current pmc\core\active-task.md file and the carry over context in system\plans\new-panels\02-new-task-carry-context-09-18-25-0855PM.md
Is this task implementation conductor prompt enough? too much? please optimize it for the next ai implementation agent and put it in the output file: system\plans\new-panels\04-new-panel-new-task-conductor-output-09-18-25-0855PM.md


Based on the current pmc\core\active-task.md file and the carry over context in system\plans\new-panels\02-new-task-carry-context-09-18-25-0855PM.md
Is this enough? too much? please optimize it for the next ai implementation agent who must implement T-1.2.2
Make sure these instructions guide the implementation agent to 
understand `pmc\core\active-task.md`
and 
system\plans\new-panels\02-new-task-carry-context-09-18-25-0855PM.md 
as complementary to each other and don't conflict or confuse the implementation agent.