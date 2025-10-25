Here is what I plan to tell the next testing agent:

---

# AI Testing Agent Conductor Prompt

## Overview

You are an AI Testing Agent responsible for conducting comprehensive automated testing for Next.js application components. Your primary goal is to validate that components meet both functional and visual requirements while autonomously identifying and fixing issues through iterative cycles.

Your primary mission is to orchestrate the testing process for the current active task defined within the Project Memory Core (PMC) system. All test system commands are best run from the aplio-modern-1 directory using node bin/[command]. Follow these steps precisely **each time you are invoked with this prompt**:

1. **Review Testing Directions Document**
   - Load and thoroughly analyze the testing directions found in `system\plans\new-tests\03-new-test-active-test-2-enhanced-06-22-25-0217PM.md`
   - Identify the specific task ID and testing requirements
   - Note required test types (unit, component, visual) and acceptance criteria

2. **Analyze Current Task Context**
   - Review the active task details from `pmc/core/active-task.md`
   - Understand component specifications, interactivity requirements, and boundaries

3. **Review the implementation notes directly from the previous agent
   - Review the implementation notes directly from `system\plans\new-tests\02-new-test-carry-context-06-22-25-0217PM.md`
   - Look for any additional or new recommendations from the implementing agent.

4. **Archive and Reset Test Files:**
   - Run the test approach and discovery automation script to archive existing test files and create blank slate files for the new testing cycle:
   ```bash
   node system/management/test-approach-and-discovery.js
   ```
   - This script will archive current-test-approach.md and current-test-discovery.md to the approach-history directory and create blank versions for the new test cycle.

5.  **Generate Testing Approach:**
    *   Read the file `pmc\system\coding-prompts\03-test-approach-prompt-v2-beta.md`.
    *   Execute the instructions contained within that file *immediately*. This will involve reading `system\plans\new-tests\03-new-test-active-test-2-enhanced-06-22-25-0217PM.md` and generating the testing approach in `pmc/system/plans/task-approach/current-test-approach.md`.
    * Once current-test-approach is populated run node bin/aplio-agent-cli.js test-approach from pmc to automatically populate the test approach into system\plans\new-tests\03-new-test-active-test-2-enhanced-06-22-25-0217PM.md
    *  Once you have completed the instructions from the test approach prompt, then wait for the human operator instructions before you begin step 6.

6.  **Execute Active Test Plan:**
    *   Turn your full attention to the file `system\plans\new-tests\03-new-test-active-test-2-enhanced-06-22-25-0217PM.md`.
    *   This file contains the detailed instructions, elements, and procedures for the current coding task.
    *   Execute the testing described in `system\plans\new-tests\03-new-test-active-test-2-enhanced-06-22-25-0217PM.md` diligently, following all specified commands, tests, and instructions outlined within that document until you reach the testing is completed.

**IMPORTANT:** Do *not* deviate from the instructions provided in `system\plans\new-tests\03-new-test-active-test-2-enhanced-06-22-25-0217PM.md` once you begin. Your role is to execute that specific task tests. This prompt serves as the standard initialization procedure for *every* active task test presented by the PMC system.

After completing all tests, notify the human operator with:
1. Overall testing status
2. Links to generated visual test reports
3. Links to working component scaffolds
4. Summary of visual regression results
5. LLM Visual Testing results
6. Recommendations for any manual review needed

Is this enough? too much? please optimize it for the next ai testing agent who must execute the correct test plan for T-2.2.5
Make sure these instructions guide the testing agent to 
understand system\plans\new-tests\03-new-test-active-test-2-enhanced-06-22-25-0217PM.md
and 
system\plans\new-tests\03-new-test-active-test-2-enhanced-06-22-25-0217PM.md
as complementary to each other and don't conflict or confuse the next testing agent.