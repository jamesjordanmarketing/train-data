# Unit Tests for {{TASK_ID}}: {{TASK_TITLE}}

## Table of Contents
1. [Overview](#overview)
2. [Test Environment Setup](#test-environment-setup)
3. [Test Planning Workpad](#test-planning-workpad)
4. [Element Tests](#element-tests)
   {{TEST_ELEMENT_TOC}}
5. [Coverage Reporting](#coverage-reporting)
6. [Test Result Summary](#test-result-summary)

## Overview
This file contains testing instructions for task {{TASK_ID}}. 
Do NOT begin testing until you have completed all implementation steps in `C:\Users\james\Master\BrightHub\BRun\brun3a\pmc\core\active-task.md`.

- Implementation Location: {{IMPLEMENTATION_LOCATION}}
- Test Location: {{TEST_LOCATIONS}}
- Testing Tools: {{TESTING_TOOLS}}
- Coverage Requirements: {{TEST_COVERAGE}}

{{ACCEPTANCE_CRITERIA_SECTION}}

## Test Environment Setup
Before creating or running tests, ensure your environment is ready:

1. Verify Jest and TypeScript testing tools are installed:
 
   If any are missing, install them:

2. Verify the test directory structure exists for this task

3. Check for a Jest configuration file (`jest.config.js`) in the project root
   
4. Ensure your tests will meet the required coverage target of {{TEST_COVERAGE}}

5. Verify that all task dependencies are completed

6. Test Failure Strategy:
   - Document all test failures with error messages and stack traces
   - For each failure, implement fixes in the corresponding implementation file
   - Rerun failed tests until they pass
   - If a test cannot be fixed after 3 attempts, document the issue and proceed only if it doesn't affect critical functionality

## Test Planning Workpad

As you develop and execute tests for this task, you may use the dedicated test workpad file at:
`C:\Users\james\Master\BrightHub\BRun\brun3a\pmc\core\task-work-pad-test.md`

This workpad is your testing sandbox where you can:
- Design complex test cases before formal implementation
- Develop test fixtures and mock data
- Track test failures and debugging steps
- Plan test coverage strategies
- Document edge cases that need testing
- Work through test assertions and expected outcomes
- Track test-specific TODOs as you discover them

Using this workpad is optional but recommended for complex testing scenarios. Nothing written there will be considered final test code - it's purely to assist your testing process.

When using the workpad, consider organizing your entries by element and test case to maintain clarity as you work through the testing requirements.

## Element Tests
{{TEST_ELEMENTS_CONTENT}}

## Coverage Reporting
After running all tests with coverage, document the results here in the {{TEST_LOCATIONS}}
in a file named: test-{{TASK_ID}}-coverage.md

- Overall coverage percentage: (fill in after running tests)
- Coverage by element:
  {{COVERAGE_ELEMENT_LIST}}
- Areas needing additional coverage: (identify any areas below target)

If coverage requirements are not met:
1. Identify areas lacking coverage
2. Implement additional tests targeting those areas
3. Rerun tests and verify improved coverage

## Test Result Summary
- [ ] All tests have been executed
- [ ] All tests have passed
- [ ] Coverage requirements have been met
- [ ] Test failures have been documented and addressed
- [ ] Test fixtures have been properly managed

When all tests are complete, notify the human operater that all tests are complete and provide a link to the test coverage document. 