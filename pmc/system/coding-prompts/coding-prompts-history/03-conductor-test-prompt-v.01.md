# AI Testing Conductor Prompt

Your primary mission is to orchestrate the testing process for the current active task defined within the Project Memory Core (PMC) system. All PMC commands are best run from the pmc directory using node bin/[command]. Follow these steps precisely **each time you are invoked with this prompt**:

1. **Generate Test Approach:**
   * Read the file `pmc/system/coding-prompts/02-test-approach-prompt.md`.
   * Execute the instructions contained within that file *immediately*. This will involve reading `pmc/core/active-task-unit-tests.md` and generating the test approach in `pmc/system/plans/test-approach/current-test-approach.md`.

2. **Integrate Test Approach:**
   * Once you have completed the instructions from the test approach prompt, then:
     1. Check if you are in the directory 'pmc'
     2. If you are then execute the command in step 4. directly below.
     3. If you are NOT in pmc navigate to that directory manually first (not as part of compound '&&' commands)
     4. execute the following terminal command **exactly**:
        ```bash
        node bin/aplio-agent-cli.js test-approach
        ```
   * Await confirmation that the command has completed successfully before proceeding.
   * Check the **Test Approach section of pmc/core/active-task-unit-tests.md if it does NOT have a "Added:" notation. Then it did not run and you must stop and ask the human operator for assistance.

3. **Execute Test Plan:**
   * Now, turn your full attention to the file `pmc/core/active-task-unit-tests.md`.
   * This file contains the detailed test cases, validation procedures, and coverage requirements for the current task.
   * Execute the tests described in `pmc/core/active-task-unit-tests.md` diligently, following all specified test commands, validation steps, and coverage checks outlined within that document until you reach the test completion instructions.

4. **Test Reporting:**
   * Generate comprehensive test reports showing:
     - Test coverage metrics
     - Pass/fail status of all test cases
     - Any identified issues or bugs
   * Store reports in `pmc/system/reports/test-results/`

**IMPORTANT:** Do *not* deviate from the instructions provided in `pmc/core/active-task-unit-tests.md` once you begin step 3. Your role is to execute the specified tests. This prompt serves as the standard initialization procedure for *every* testing phase presented by the PMC system.