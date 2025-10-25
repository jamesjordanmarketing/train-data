# AI Testing Conductor Prompt

Your primary mission is to orchestrate the testing process for the current active task defined within the Project Memory Core (PMC) system. All PMC commands are best run from the pmc directory using node bin/[command]. Follow these steps precisely **each time you are invoked with this prompt**:

1. **Test Planning Review:**
   * Read the file `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\core\active-task-unit-tests.md` thoroughly.
   * Understand the testing requirements, coverage expectations, and acceptance criteria.
   * Review the test environment setup section and ensure all prerequisites are met.

2. **Environment Setup Execution:**
   * Execute the environment setup instructions from `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\core\active-task-unit-tests.md`.
   * Verify that all testing tools and dependencies are available.
   * Check for and create the required test directory structure.
   * Verify the existence of testing configuration files (e.g., jest.config.js).

3. **Test Implementation Execution:**
   * Implement tests for each element specified in the Element Tests section of `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\core\active-task-unit-tests.md`.
   * Follow the testing requirements for each element precisely.
   * Ensure tests are structured according to project conventions.
   * Implement tests in order of dependency, starting with core functionality.

4. **Test Execution and Validation:**
   * Run the implemented tests to verify functionality.
   * Document any failures and implement fixes as needed.
   * Re-run tests after fixes until all tests pass.
   * Follow the Test Failure Strategy outlined in the test file.

5. **Coverage Analysis:**
   * Run tests with coverage reporting enabled.
   * Document the coverage results in the Coverage Reporting section.
   * If coverage requirements are not met, implement additional tests as needed.
   * Re-run coverage analysis until requirements are satisfied.

6. **Test Summary Completion:**
   * Complete the Test Result Summary section in `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\core\active-task-unit-tests.md`.
   * Document any findings, challenges, or recommendations.
   * Mark all completed items in the summary checklist.

7. **Task Completion:**
   * Once testing is complete, return to `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\core\pmc/core/active-task.md` for final task completion steps.
   * Update the task status as directed in the active task file.
   * Do not mark the task as complete until instructed by the human operator.

# Test Implementation Strategy
Testing should be thorough, efficient, and aligned with project standards. As you implement tests, prioritize:

1. **Coverage of Critical Functionality:** Ensure all core functions are fully tested.
2. **Edge Case Testing:** Identify and test boundary conditions and error scenarios.
3. **Isolation:** Tests should be independent and not rely on the state of other tests.
4. **Readability:** Write clear, well-documented tests that serve as documentation.
5. **Maintainability:** Structure tests to be easily maintainable as the codebase evolves.

**IMPORTANT:** Do *not* deviate from the instructions provided in `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\core\active-task-unit-tests.md`. Your role is to execute the testing process as specified. This prompt serves as the standard procedure for test implementation within the PMC system.