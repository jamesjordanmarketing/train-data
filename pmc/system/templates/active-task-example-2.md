# Current Active Task Coding Instructions

## Table of Contents
1. [Task Information](#task-information)
2. [Current Implementation Focus](#current-implementation-focus)
3. [Task Approach](#task-approach)
4. [Components/Elements](#componentselements)
5. [Implementation Process Phases](#implementation-process-phases)
   - [5.1 Preparation Phase](#preparation-phase)
   - [5.2 Implementation Phase](#implementation-phase)
   - [5.3 Validation Phase](#validation-phase)
6. [Testing Overview](#testing-overview)
7. [Current Element](#current-element)
8. [Recent Actions](#recent-actions)
9. [Notes](#notes)
10. [Errors Encountered](#errors-encountered)
11. [Next Steps](#next-steps)
12. [Addendums](#addendums)
    - [12.1 Full Project Context](#full-project-context)
    - [12.2 Prior Task and its Current Status](#prior-task-and-its-current-status)
    - [12.3 Next Task in Sequence](#next-task-in-sequence)


Now your job is to code this task.
1. Read it once completely. Then think about how you are going to approach it.
2. Read it again. Make any needed adjustments to your planned approach.
3. Update the Task Approach section with a detailed description of how you will complete this task.
4. Fill in the Expected Implementation Files section with files you plan to create or modify.
5. Remember all PMC commands are best run from the pmc directory using node bin/[command]

## Current Implementation Focus
Currently: Reading task requirements
Phase: Not started
Step: Initial review
Current Element: None - reviewing task requirements

## Task Information
Task ID: T-8.1.1
Task Title: T-8.1.1: Visual Regression Testing Setup

- FR Reference: FR-8.1.0
- Implementation Location: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-23-roo\aplio-modern-1\tests\visual-regression`
- Patterns: P026-COMPONENT-TESTING, P029-VISUAL-TESTING
- Dependencies: T-2.1.0, T-2.2.0, T-2.3.0
- Estimated Hours: 3-4
- Description: Set up visual regression testing infrastructure to automatically compare the modern implementation with legacy reference screenshots.
- Test Locations: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-23-roo\pmc\system\test\unit-tests\task-8-1\T-8.1.1\`
- Testing Tools: Jest, TypeScript, Playwright, Percy, Storybook
- Test Coverage Requirements: 90% code coverage
- Completes Component?: Not specified
- Confidence: 
- Last Updated: 05/03/2025, 07:42:40 PM

## Task Approach
<!-- After reading the task requirements, describe your implementation approach here -->
(To be filled in by the coding agent)

When you discover or add an implementation file, you MUST call:
```
node bin/aplio-agent-cli.js add-implementation-file "<file_path>" <is_primary>
```
Then paste the command output here.

## Components/Elements
### [T-8.1.1:ELE-1] Testing infrastructure: Set up visual regression testing framework with screenshot comparison capabilities

### [T-8.1.1:ELE-2] Reference screenshots: Create reference screenshots from legacy implementation for comparison

### [T-8.1.1:ELE-3] CI integration: Configure visual testing in CI/CD pipeline for automated testing

## Implementation Process Phases
### Preparation Phase
1. [PREP-1] Research and select appropriate visual testing framework (implements ELE-1)
2. [PREP-2] Capture legacy implementation screenshots at multiple breakpoints (implements ELE-2)
3. [PREP-3] Create project configuration for visual testing tools (implements ELE-1)

When the Preparation phase steps are complete you MUST call: 
node bin/aplio-agent-cli.js update-phase-stage T-8.1.1 "PREP" "complete"
from the directory pmc

### Implementation Phase
1. [IMP-1] Install and configure Playwright or Cypress with visual testing plugins (implements ELE-1)
2. [IMP-2] Create baseline screenshot capture utility for reference images (implements ELE-2)
3. [IMP-3] Set up test runner configuration for visual comparison tests (implements ELE-1)
4. [IMP-4] Create GitHub Actions workflow for automated visual testing (implements ELE-3)

When the Implementation phase steps are complete you MUST call: 
node bin/aplio-agent-cli.js update-phase-stage T-8.1.1 "IMP" "complete"
from the directory pmc


### Validation Phase
1. [VAL-1] Run a sample test to verify screenshot capture functionality (validates ELE-1)
2. [VAL-2] Verify reference screenshot quality and coverage (validates ELE-2)
3. [VAL-3] Test CI pipeline integration with sample component comparison (validates ELE-3)

Validation Test Failure Strategy:
- Document all validation test failures with error messages and stack traces
- For each validation failure, implement fixes in the corresponding implementation file
- Rerun failed validation tests until they pass
- If a validation test cannot be fixed after 5 attempts, document the issue and proceed only if it doesn't affect critical functionality
- Log all validation test failures using the error command:
  ```
  node pmc/bin/aplio-agent-cli.js error "<error description>" <severity 1-10>
  ```
  Example error logs:
  ```
  node pmc/bin/aplio-agent-cli.js error "Type error in button component" 7
  node pmc/bin/aplio-agent-cli.js error "Critical performance issue" 9
  ```
When the Validation phase steps are complete you MUST call: 
node bin/aplio-agent-cli.js update-phase-stage T-8.1.1 "VAL" "complete"
from the directory pmc


After completing the Validation Phase and submitting the update-phase-stage command, you MUST stop and await instructions from the human operator.

## Testing Overview
Testing for this task is managed in a separate file to reduce cognitive load and ensure comprehensive test implementation.
See test mapping file: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-23-roo\pmc\system\test\unit-tests\task-8-1\T-8.1.1\`


## Current Element
- Element ID: None selected
- Description: Not started
- Status: Not started
- Updated: 05/03/2025, 07:42:40 PM

## Recent Actions
Every 500 output tokens you MUST call:
```
node bin/aplio-agent-cli.js log-action "<current task description>" <confidence 1-10>
```
Then paste the command output here.

You can also call this command at other times if it will help record context that may be useful while coding this task.

## Notes
You may add implementation notes at any time by calling:
```
node bin/aplio-agent-cli.js update-notes "<your implementation notes>"
```
Then paste the command output here.

Task initialized on 05/03/2025, 07:42:40 PM
Implementation Status: Not Started

## Errors Encountered
If you encounter any errors, you MUST report them by calling:
```
node bin/aplio-agent-cli.js error "<error description>" <severity 1-10>
```
Then paste the command output here.

If you have tried to fix an error 5 times and have not made any progress, you MUST call the error command, alert the human operator, and stop coding.

None yet

## Next Steps
1. Review task details and requirements (Priority: High)
2. Examine legacy code references (Priority: High)
3. Begin with first Preperation Phase Steps (PREP-1) steps and continue through all Validation Phase Steps (VAL-#) (Priority: High)


## Addendums

### Full Project Context
You can refresh your knowledge of the project and this task in context by reading these files:
- pmc/product/06-aplio-mod-1-tasks.md (for detailed task specifications)
- pmc/core/progress.md (for overall project progress)

### Prior Task and its Current Status
Prior Task: T-8.1.0
Task Title: Visual Validation
Task Details: pmc\product\06-aplio-mod-1-tasks.md starts on line 395237
Is this task depended on by the current task? No

### Next Task in Sequence
Next Task: T-8.1.2
Task Title: Component Visual Comparison Tests
Task Details: pmc\product\06-aplio-mod-1-tasks.md starts on line 399303
Is this task dependent on the current task? Yes

### New Dependencies
When implementing this task, if you identify a dependency requirement that meets BOTH criteria:
1. Not documented in the Task Information section
2. Not already implemented in the codebase

You MUST document this dependency by executing:
```
node bin/aplio-agent-cli.js log-dependency "[task-id]" "[detailed dependency specification]"
```
Your dependency specification should include:
- What the dependency is (library, component, service, etc.)
- Why it's necessary for the current task
- How it impacts the implementation approach

After logging the dependency, paste the command output here and await human operator guidance before proceeding with implementation that relies on this dependency.

### Improvement Suggestions
During implementation, if you identify potential improvements that would enhance:
- Code quality or maintainability
- System flexibility or extensibility
- Feature capabilities or user experience
- Performance or security characteristics

You MUST document these insights by executing:
```
node bin/aplio-agent-cli.js log-improvement "[task-id]" "[improvement specification]"
```
Your improvement specification should:
- Clearly articulate the proposed enhancement
- Provide a technical rationale for the suggestion
- Indicate the scope of impact (localized or system-wide)
- Note whether the improvement is critical or could be implemented later

After logging the improvement, paste the command output here, notify the human operator, and continue with your current task implementation.

---

IMPORTANT OPERATIONAL INSTRUCTIONS:

As you code this task if you ever become unsure that you are following the explicit path set for you in this file:
1. Read the active-task.md file to refresh context
2. Return back to what you were doing if it is contributing to the current task
3. If you are working on code that does not contribute to the current task, send a high priority alert to the human operator

As you code this task if you ever become unsure that your current approach to the task is valid you MUST read the Task Approach section of the current active-task.md:
1. If the approach is still valid, continue coding
2. If the approach has new context or details, add an **Addendum** to the Task Approach
3. If the approach has proven to be erroneous, add a **Major Approach Update** with detailed explanation