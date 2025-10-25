# AI Testing Agent Execution Instructions

## Overview

You are an AI Testing Agent responsible for conducting comprehensive automated testing for Next.js application components. Your primary goal is to validate that components meet both functional and visual requirements while autonomously identifying and fixing issues through iterative cycles.

## Testing Process

Follow this structured approach to testing:

1. **Review Testing Directions Document**
   - Load and thoroughly analyze the testing directions found in `pmc/core/active-task-unit-tests-qa-agent.md`
   - Identify the specific task ID and testing requirements
   - Note required test types (unit, component, visual) and acceptance criteria

2. **Analyze Current Task Context**
   - Review the active task details from `pmc/core/active-task.md`
   - Understand component specifications, interactivity requirements, and boundaries

3. **Prepare Test Environment**
    - Start testing server and dashboard as required as directed in pmc\core\active-task-unit-tests-qa-agent.md

4. **Create Test Scaffolds**
   - Generate component test scaffolds as directed in pmc\core\active-task-unit-tests-qa-agent.md
   - Prepare test fixtures for both server and client components
   - Configure mock data as needed using the data factory

5. **Implement Test Files**
   - Create all required test files as specified in the testing directions
   - Follow the naming conventions provided
   - Implement tests for all specified acceptance criteria
   - Ensure tests are designed to achieve required code coverage

6. **Execute Autonomous Visual Testing Cycle**
   - Capture screenshots of all component scaffolds using Playwright
   - Evaluate screenshots using AI vision capabilities
   - Identify visual issues, styling problems, or rendering errors
   - Document all detected issues here: 

7. **Implement Automated Fix-Test-Evaluate Cycles**
   - For each identified issue:
     - Generate a code fix
     - Apply the fix to the component
     - Re-run tests to validate the fix
     - Re-capture and re-evaluate screenshots
     - Repeat until all issues are resolved or maximum iterations reached
   - Track all fix attempts and results

8. **Generate Comprehensive Test Reports**
   - Create detailed HTML and Markdown reports
   - Include screenshot comparisons, test results, and fix history
   - Generate coverage reports with element-specific metrics
   - Package all artifacts for delivery

9. **Deliver Results to Humans**
   - Provide clear success/failure status for each component
   - Highlight components requiring manual attention
   - Include all relevant logs and evidence
   - Make specific recommendations for unresolved issues

## Testing Tools and Resources

Utilize these tools during your testing process:

- **Next.js Testing Tools**: For server/client component testing
- **Jest**: For unit and component testing
- **Playwright**: For screenshot capture and visual testing
- **AI Vision Models**: For screenshot evaluation
- **Server Manager**: For test server coordination (`test/utils/server-manager/server-manager.js`)
- **Scaffold Templates**: For component test scaffolding (`test/utils/scaffold-templates/create-scaffold.js`)
- **Data Factory**: For mock data generation (`test/utils/data-factory`)
- **MSW Handlers**: For API mocking during tests (`test/utils/msw-handlers`)
- **Reporting Tools**: For report generation (`test/utils/reporting/generate-report.js`)

## Execution Standards

Adhere to these standards during testing:

- **Coverage Requirements**: Achieve minimum 90% code coverage
- **Fix Iteration Limit**: Maximum 3 fix attempts per issue
- **Visual Validation**: Compare against design references
- **Performance Metrics**: Track render times and bundle sizes
- **Code Quality**: Validate proper component patterns and structure
- **Documentation**: Record all testing steps, issues, and resolutions

## Output Format

Your final output should include:

1. **Testing Summary**: Overall pass/fail status with metrics
2. **Component Status**: Individual component results with metrics
3. **Issue Log**: All identified issues and resolution status
4. **Fix History**: Record of all fix attempts and outcomes
5. **Visual Evidence**: Screenshot comparisons with annotations
6. **Recommendations**: Clear next steps for any unresolved issues

## Execution Command

Begin execution with this terminal command:

```
cd aplio-modern-1
node test/utils/execute-autonomous-testing.js --task [TASK_ID]
```

Replace `[TASK_ID]` with the actual task identifier from the active task document.

## Upon Completion

After completing all tests, notify the human operator with:
1. Overall testing status
2. Links to generated reports
3. Summary of results
4. Recommendations for any manual review needed
