# Development Context & Operational Priorities
**Date:** 2025-05-05 09:09 PST
**Project:** Aplio Design System Modernization (aplio-mod-1) & Project Memory Core (PMC)
**Context Version:** 3.0.0

## Active Focus
Okay, you are going to read the unstructured requirements below for my new testing system. Your job is to read this carefully twice. Read it slowly so you really understand it. Then you are going to produce a detailed specification that the senior ai test engineer and programmer can implement to produce the testing system we need.

You can model the specification format here pmc\context-ai\chat-contexts-log\pmct\active-task-init-v2.md for the format of the new spec.
Use the file here: pmc\context-ai\chat-contexts-log\pmct\testing-system-spec-v1.md to write this spec to (the file is already created).


## Introduction

This context document addresses two integrated projects that operate in tandem:

1. **Aplio Design System Modernization (aplio-mod-1)**: A comprehensive modernization project converting the legacy Aplio Design System to leverage Next.js 14's App Router architecture and TypeScript. The project focuses on the Home-4 template implementation while preserving visual fidelity and enhancing developer experience.

2. **Project Memory Core (PMC)**: A structured task management and context retention system that manages the development of the Aplio project. PMC provides methodical task tracking, context preservation, and implementation guidance through its command-line interface and document-based workflow.

These projects are deliberately interconnected - PMC requires a real-world development project to refine its capabilities, while Aplio benefits from PMC's structured approach to development. Depending on current priorities, work may focus on either advancing the Aplio Design System implementation or enhancing the PMC tooling itself.

Perhaps just an install/customization/configuration specification and script is even better.

The testing tools must:
facilitate the erection of the scaffolds that are usable by both the ai testing agent and the human operator
facilitate the automation of the ai testing agent testing evaluation and validation
facilitate the presentation of the ai testing agent successfully validate task/elements/components to the human

I am a newbie to these testing tools so it needs to be as easy to use as possible. Perhaps at the level of a freshman in a computer science major in college.

Big picture: I want the AI agent to iterate the code to a viewable success. I want the human to view the successful results. Taking the machine's word for it isn't good enough.

Ultimately, I am thinking of a cycle like this:

1. Want the testing process broken up into distinct steps that I can understand.
2. Currently, my idea of the steps are:

## UNIT TESTING

a. Unit testing takes place at the Task (T-X.Y.Z) level. Each Task (i.e., collection of elements) that was just coded is unit tested as follows:
   i. Unit testing starts with a first review of the code for all elements of the task.
   ii. The AI agent erects a scaffold that will allow for validation of all integrated elements of the task. By validation, I mean the task is viewable and functional for both the agent and the human.
      a. Ideally, the scaffold used for task autonomous testing will be the same as the scaffold used for human validation. But if two different scaffolds are needed, both are erected at this step.
   iii. The AI testing agent cycles through: testing the task elements on the scaffold, autonomously fixing code, and repeating the tests on the scaffold. It executes this cycle until the task elements are validated on the scaffold by the agent.
   iv. The AI testing agent confirms the task elements are validated on the scaffold and presents the human with the validated task elements on the scaffold.
   v. The human testing agent cycles through testing the task elements. The human sends any failures back to the AI coding/testing agent, who autonomously fixes code and presents the human with the valid version of task elements on the scaffold. It executes this cycle until the integration point of the task elements is validated on the scaffold by the human.
   vi. The task is confirmed successful and the task is marked as complete.

## COMPONENT TESTING

a. Once a Task (T-X.Y.Z) is completed, that also completes a component. Each component (i.e., collection of elements that form a component) that was just coded is component tested as follows:
   i. Component testing starts with a first review of the code for all elements of the component.
   ii. The AI agent erects a scaffold that will allow for validation of all integrated elements of the component. By validation, I mean the component is viewable and functional for both the agent and the human.
      a. Ideally, the scaffold used for component autonomous testing will be the same as the scaffold used for human validation. But if two different scaffolds are needed, both are erected at this step.
   iii. The AI testing agent cycles through: testing the component on the scaffold, autonomously fixing code, and repeating the tests on the scaffold. It executes this cycle until the code is validated on the scaffold by the agent.
   iv. The AI testing agent confirms the component and its integrated elements are valid on the scaffold and presents the human with the validated component and integrated elements on the scaffold.
   v. The human testing agent cycles through testing the component and each integrated element. The human sends any failures back to the AI coding/testing agent, who autonomously fixes code and presents the human with the valid version of the component and integrated elements on the scaffold. It executes this cycle until the component and integrated elements are validated on the scaffold by the human.
   vi. The component is confirmed successful and the component is marked as complete.

## INTEGRATION TESTING

a. I envision this will take place when ALL Task elements & Components are completed. But am open to a better way; if the professional AI testing engineer has a better suggestion, please let me know. The process will be as follows:

   i. Integration testing starts with a review of all the successful states of all tasks, elements, and components. If one or more is not confirmed with a successful test, then it must be fixed first.
   ii. The AI testing agent will make a list of all integration points that have successfully tested tasks, elements, and components.
   iii. For each integration point, the AI agent erects a scaffold that will allow for validation of the integration of all tasks, elements, & components associated with that integration point. By validation, I mean the integrated tasks, elements, & components are viewable and functional for both the agent and the human.
      a. Ideally, the scaffold used for integration point autonomous testing will be the same as the scaffold used for human validation. But if two different scaffolds are needed, both are erected at this step.
   iv. For each integration point, the AI testing agent cycles through: testing the integration of the tasks, elements, & components for that integration point on the scaffold, autonomously fixing code, and repeating the tests using the scaffold. It executes this cycle until the integration point of the tasks, elements, & components is validated on the scaffold by the AI testing agent.
   v. For each integration point, the AI testing agent confirms the integration point is validated on the scaffold and presents the human with the valid version of the scaffold and its validated tasks, elements, & components integration.
   vi. For each integration point, the human testing agent cycles through testing the integration of the tasks, elements, & components for that integration point on the scaffold. The human sends any failures back to the AI coding/testing agent, who autonomously fixes code and presents the human with the valid version of the scaffold and its valid tasks, elements, & components integration. It executes this cycle until the integration point of the tasks, elements, & components is validated on the scaffold by the human.
   vii. The integration point is confirmed successful and the integration point is marked as complete.

## QA TESTING

a. I envision this will take place when ALL Tasks, Elements, Components, and integration points are completed. But am open to a better way; if the professional AI testing engineer has a better suggestion, please let me know. The process will be as follows:

   i. QA testing starts with a review of all the successful states of all tasks, elements, components, and integration points. If one or more is not confirmed with a successful test, then it must be fixed first.
   ii. A native environment for the product must be erected. Piecemeal scaffolds are not applicable to QA testing, as QA denotes final testing of the product.
      a. The native environment must be tested for its compliance with a native environment. Any native environment building blocks, configurations, or platforms needed must be confirmed working by both the AI testing agent and the human.
   iii. For each task element, component, and integration point, the AI testing agent cycles through: testing each and every task element, component, and integration point on the native environment, autonomously fixing any code or environment requirements, and repeating the tests on the native environment. It executes this cycle until all task elements, components, and integration points are validated on the native environment by the AI testing agent.
   iv. For each task element, component, and integration point, the AI testing agent confirms the task element, component, or integration point is validated on the native environment and presents the human with the validated task, element, & component integration on the native environment.
   v. For each task element, component, and integration point, the human testing agent cycles through testing the task element, component, or integration point on the native environment. The human sends any failures back to the AI coding/testing agent, who autonomously fixes code and presents the human with the valid task element, component, or integration point on the native environment. It executes this cycle until the element, component, or integration point is marked as complete on the native environment by a human.
   vi. Each task element, component, and integration point is confirmed successful on the native environment.



## Current Focus - Revised Testing Infrastructure Plan

I am looking for a more streamlined, beginner-friendly testing system that integrates well with our AI-driven development workflow. Let me outline a simplified approach that meets your requirements.

We will be able to do the following:
Following your example tasks (such as T-4.2.2: ELE-3 or T-4.1.0: Header Component Implementation), we will be able to organize code and tests like so:

1. Directory Structure Example
   /src  
     └── tasks  
         ├── T-4.1.0-HeaderComponent  
         │    ├── HeaderComponent.tsx  
         │    └── index.ts  
         └── T-4.2.2-SemanticStructure  
              ├── SemanticStructure.tsx  
              └── index.ts  
   /test  
     ├── unit  
     │    ├── T-4.1.0-HeaderComponent.unit.test.ts  
     │    └── T-4.2.2-SemanticStructure.unit.test.ts  
     ├── component  
     ├── integration  
     └── qa  

2. Scaffold Files (For AI & Human Testing)
   • For each Task or Component, you may have a dedicated scaffold. For instance, a minimal React page that imports the Task or Component to be tested.  
   • Example: /scaffolds/T-4.1.0-HeaderComponent/Scaffold.tsx that renders <HeaderComponent />.  
   • The AI agent can spin up this scaffold to run tests and validate the user experience. The human operator can then open that scaffold in a local dev server or an environment to see results visually.

--------------------------------------------------------------------------------
C. EXECUTING THE TEST CYCLES
--------------------------------------------------------------------------------

Below is how each of your four stages (Unit, Component, Integration, QA) can be executed in practice. You can fine-tune this flow to match the final environment or your personal preference.

1. UNIT TESTING (Task-Level)
   a) Developer (or AI) finishes implementing T-X.Y.Z code.  
   b) Developer (or AI) runs:  
      npm run test:unit  
   c) The test:unit script looks for *.unit.test.ts files. For example, T-4.1.0-HeaderComponent.unit.test.ts.  
   d) If tests fail, AI or developer applies fixes and re-runs until tests pass.  
   e) Once the AI agent’s tests pass, the human operator checks the scaffold (e.g., view with a local dev server or a preview).  
   f) If the human finds issues, the cycle continues until the Task is validated and marked complete.

2. COMPONENT TESTING
   a) After a Task is done, the “Component” (often the same code, but sometimes bigger scope) is tested in a similar manner:  
      npm run test:component  
   b) The “component” tests may incorporate the same or extended scaffolds as the Task but focus on the full user-facing functionality.  
   c) AI fixes any test failures; re-runs until passing; human verifies visually.  
   d) Mark the Component as complete.

3. INTEGRATION TESTING
   a) When multiple tasks/components must be tested together, the AI or developer runs:  
      npm run test:integration  
   b) Each integration test suite sets up a combined scaffold or environment.  
   c) AI cycles through mistakes/fixes; once stable, human does the final pass.  
   d) Mark each integration point as complete.

4. QA TESTING
   a) Use a “native environment.” This might be a local dev server, a Docker environment, or a staging deployment.  
   b) The AI runs:  
      npm run test:qa  
   c) If you have end-to-end tests with Playwright (or similar), you can run:  
      npm run test:e2e  
   d) The AI or developer addresses final issues.  
   e) The human does a final pass in the actual environment, ensuring tasks, components, integrations are all validated.  
   f) Mark final QA as complete.

--------------------------------------------------------------------------------
D. REPORTING AND DOCUMENTATION
--------------------------------------------------------------------------------

1. Coverage & Reports  
   • Jest will place coverage data in /coverage by default.  
   • You can configure HTML, JSON, or XML. The coverage/index.html can be opened in the browser so humans can view coverage results.

2. Logs for AI & Human Collaboration  
   • Store test logs in a standardized folder, e.g., /logs, so the AI agent can parse them.  
   • Provide an easily accessible location for human testers (e.g., a summary file or a pinned CI artifact).

3. Mapping to Your “Tasks & Elements Sample” Docs  
   • For each item in your “4. Layout Components - Tasks & Elements Sample,” create a test file that references the relevant functional and accessibility requirements.  
   • Example: For T-4.2.2: ELE-3 (Semantic Structure), you might have a test suite in /test/unit/T-4.2.2-SemanticStructure.unit.test.ts verifying correct headings, ARIA roles, etc.

--------------------------------------------------------------------------------
E. FUTURE EXPANSION & MAINTENANCE
--------------------------------------------------------------------------------

1. Updating the Tool Versions
   • Periodically update or upgrade your standard packages. For instance:  
     npm update jest typescript @testing-library/react fs-extra msw playwright  
   • If needed, revise your scaffolds or config files. Keep them in a single folder so updates are easy.

2. Adding New Tools
   • If you require additional UI or back-end test frameworks, add them to this same approach.  
   • Extend your config and scripts to incorporate the new tools with minimal friction.

3. Integrating With CI
   • Create separate jobs in your CI pipeline for each major test step (unit, component, integration, QA) or combine them based on time constraints.  
   • Save or publish coverage & test results as artifacts.


This plan gives you a practical, standardized approach to testing that covers:
• Tool installation and configuration  
• A structured workflow for Unit → Component → Integration → QA  
• A management model that accommodates AI-driven automation and human validation  
• Repeatable scaffolds so both the AI and humans validate the same code in the same environment  

Once you answer (or refine) the questions at the top, you can finalize the approach, set up the environment in your repo, and begin implementing your tasks/testing cycle. If anything needs to be clarified or if you have new requirements, let me know and we can tweak the setup accordingly!

## Overall Testing Architecture

### 1. Testing Location Structure

Your preference for a centralized testing directory makes sense. I recommend:

```
aplio-modern-1/
├── test/                    (All testing code)
│   ├── utils/               (Testing utilities)
│   │   ├── scaffold-templates/  (Reusable testing page templates)
│   │   ├── helpers/             (Helper functions for tests)
│   │   └── reporting/           (Test result report generators)
│   ├── unit-tests/          (Unit test files organized by task)
│   │   └── task-4-1/            (Tests for task section 4.1)
│   │       └── T-4.1.4/         (Tests for specific task)
│   ├── component-tests/     (Component tests)
│   ├── integration-tests/   (Integration tests)
│   ├── qa-tests/            (QA tests)
│   └── .reports/            (Test reports output)
└── node_modules/            (Dependencies including testing tools)
```

### 2. Testing Tools Selection

Based on your requirements, I recommend this simplified toolset:

1. **Jest** - Core testing framework for unit and component tests
2. **React Testing Library** - For testing React components
3. **Playwright** - For visual testing, E2E tests, and as a replacement for Storybook
4. **MSW (Mock Service Worker)** - For mocking API calls in tests
5. **fs-extra** - For file operations in test utilities

### 3. Scaffolding Approach

Since you want to avoid Storybook but still need visual testing:

1. Create simple HTML/React templates in `test/utils/scaffold-templates/`
2. Use Playwright to load these templates with your components
3. Generate screenshots for visual verification
4. Allow both the AI and human to view the same rendered components

## Implementation Plan

### Step 1: Create Basic Testing Configuration

First, let's set up a simple npm script and configuration file:

```bash
mkdir -p aplio-modern-1/test/utils/scaffold-templates
mkdir -p aplio-modern-1/test/utils/helpers
mkdir -p aplio-modern-1/test/utils/reporting
mkdir -p aplio-modern-1/test/.reports
```

### Step 2: Create package.json Scripts

Add these to your package.json:

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:ui": "playwright test",
  "test:report": "node test/utils/reporting/generate-report.js",
  "test:all": "npm run test && npm run test:ui && npm run test:report"
}
```

### Step 3: Create Test Configuration Files

**`aplio-modern-1/jest.config.js`**:
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/utils/helpers/jest-setup.js'],
  moduleNameMapper: {
    // Handle CSS imports
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    // Handle image imports
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/test/utils/helpers/fileMock.js"
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }]
  },
  testMatch: [
    "<rootDir>/test/**/*.test.{js,jsx,ts,tsx}"
  ],
  collectCoverage: true,
  coverageDirectory: "<rootDir>/test/.reports/coverage",
  coverageReporters: ["json", "lcov", "text", "clover", "html"],
  reporters: [
    "default",
    ["<rootDir>/test/utils/reporting/custom-reporter.js", {}]
  ]
};
```

**`aplio-modern-1/playwright.config.ts`**:
```typescript
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './test',
  testMatch: '**/*.visual.{js,ts}',
  outputDir: './test/.reports/playwright-results',
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: 'on',
  },
  reporter: [
    ['html', { outputFolder: './test/.reports/playwright-report' }],
    ['json', { outputFile: './test/.reports/playwright-report/results.json' }]
  ],
};

export default config;
```

### Step 4: Create Helper Files

**`aplio-modern-1/test/utils/helpers/jest-setup.js`**:
```javascript
import '@testing-library/jest-dom';

// Mock fetch for all tests
global.fetch = jest.fn();

// Global cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Add custom matchers if needed
expect.extend({
  // Custom matchers here
});
```

**`aplio-modern-1/test/utils/helpers/fileMock.js`**:
```javascript
module.exports = 'test-file-stub';
```

### Step 5: Create Test Scaffold Templates

**`aplio-modern-1/test/utils/scaffold-templates/component-scaffold.js`**:
```javascript
const fs = require('fs-extra');
const path = require('path');

/**
 * Creates a test scaffold for a component
 * @param {Object} options - Configuration options
 * @param {string} options.taskId - Task ID (e.g., "T-4.1.4")
 * @param {string} options.componentName - Name of component to test
 * @param {string} options.componentPath - Path to component file
 * @param {Object} options.props - Props to pass to component
 * @returns {Object} - Information about created scaffold
 */
function createComponentScaffold(options) {
  const { taskId, componentName, componentPath, props = {} } = options;
  
  // Extract task components for path creation
  const [_, section, subsection, task] = taskId.match(/T-(\d+)\.(\d+)\.(\d+)/);
  
  // Create test directory path
  const testDir = path.join(
    process.cwd(),
    'test',
    'component-tests',
    `task-${section}-${subsection}`,
    taskId
  );
  
  // Ensure test directory exists
  fs.ensureDirSync(testDir);
  
  // Create component test file
  const testFilePath = path.join(testDir, `${componentName}.test.tsx`);
  const testContent = `
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ${componentName} from '${componentPath}';

describe('${componentName} (${taskId})', () => {
  test('renders correctly', () => {
    render(<${componentName} ${Object.entries(props).map(([key, value]) => 
      `${key}={${JSON.stringify(value)}}`
    ).join(' ')} />);
    
    // Add specific assertions based on component requirements
    expect(screen.getByTestId('${componentName.toLowerCase()}')).toBeInTheDocument();
  });
  
  // Add more tests based on requirements
});
`;
  
  fs.writeFileSync(testFilePath, testContent);
  
  // Create visual test file for Playwright
  const visualTestPath = path.join(testDir, `${componentName}.visual.tsx`);
  const visualTestContent = `
import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs-extra';

test('${componentName} visual test (${taskId})', async ({ page }) => {
  // Load the component scaffold page
  await page.goto('http://localhost:3000/test-scaffold/${taskId}/${componentName}');
  
  // Take screenshot of the component
  const screenshot = await page.screenshot({
    path: path.join('test', '.reports', 'screenshots', '${taskId}', '${componentName}.png'),
    fullPage: false
  });
  
  // Compare with baseline if it exists
  const baselinePath = path.join('test', '.reports', 'screenshots', '${taskId}', '${componentName}-baseline.png');
  if (fs.existsSync(baselinePath)) {
    // You can implement visual comparison here
    // For now, just log that we would compare
    console.log('Would compare with baseline image');
  } else {
    // Save current as baseline
    fs.copyFileSync(
      path.join('test', '.reports', 'screenshots', '${taskId}', '${componentName}.png'),
      baselinePath
    );
  }
  
  // Basic test to ensure page loaded
  await expect(page.locator('[data-testid="${componentName.toLowerCase()}"]')).toBeVisible();
});
`;
  
  fs.writeFileSync(visualTestPath, visualTestContent);
  
  // Create scaffold page in Next.js app
  const scaffoldDir = path.join(
    process.cwd(),
    'app',
    'test-scaffold',
    taskId
  );
  
  fs.ensureDirSync(scaffoldDir);
  
  const scaffoldPagePath = path.join(scaffoldDir, `${componentName}.tsx`);
  const scaffoldPageContent = `
import React from 'react';
import ${componentName} from '${componentPath}';

export default function ${componentName}ScaffoldPage() {
  return (
    <div className="test-scaffold">
      <h1>${componentName} Test Scaffold (${taskId})</h1>
      <div className="component-container">
        <${componentName} ${Object.entries(props).map(([key, value]) => 
          `${key}={${JSON.stringify(value)}}`
        ).join(' ')} />
      </div>
    </div>
  );
}
`;
  
  fs.writeFileSync(scaffoldPagePath, scaffoldPageContent);
  
  return {
    testFilePath,
    visualTestPath,
    scaffoldPagePath,
    taskId,
    componentName
  };
}

module.exports = createComponentScaffold;
```

### Step 6: Create Custom Reporter for Markdown Bug Reports

**`aplio-modern-1/test/utils/reporting/custom-reporter.js`**:
```javascript
const fs = require('fs-extra');
const path = require('path');

class CustomReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
    this.reportsPath = path.join(process.cwd(), 'test', '.reports', 'bug-reports');
    fs.ensureDirSync(this.reportsPath);
  }

  onRunComplete(contexts, results) {
    // Only generate reports for failures
    if (results.numFailedTests > 0) {
      this._createBugReport(results);
    }
  }

  _createBugReport(results) {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const reportPath = path.join(this.reportsPath, `bug-report-${timestamp}.md`);
    
    let reportContent = `# Test Bug Report ${timestamp}\n\n`;
    reportContent += `## Summary\n\n`;
    reportContent += `- Total Tests: ${results.numTotalTests}\n`;
    reportContent += `- Passed Tests: ${results.numPassedTests}\n`;
    reportContent += `- Failed Tests: ${results.numFailedTests}\n`;
    reportContent += `- Run Time: ${results.startTime ? (Date.now() - results.startTime) / 1000 : 'Unknown'} seconds\n\n`;
    
    if (results.numFailedTests > 0) {
      reportContent += `## Failed Tests\n\n`;
      
      results.testResults.forEach(testFile => {
        const failedTests = testFile.testResults.filter(test => test.status === 'failed');
        
        if (failedTests.length > 0) {
          reportContent += `### ${path.relative(process.cwd(), testFile.testFilePath)}\n\n`;
          
          failedTests.forEach(test => {
            // Extract task ID and element ID if available
            const taskMatch = test.fullName.match(/T-\d+\.\d+\.\d+/);
            const elementMatch = test.fullName.match(/ELE-\d+/);
            const taskId = taskMatch ? taskMatch[0] : 'Unknown Task';
            const elementId = elementMatch ? elementMatch[0] : 'Unknown Element';
            
            reportContent += `#### ${test.title} (${taskId}:${elementId})\n\n`;
            reportContent += `**Error Message:**\n\`\`\`\n${test.failureMessages.join('\n')}\n\`\`\`\n\n`;
            
            // Add potential fix suggestions
            reportContent += `**Potential Issues:**\n\n`;
            
            // Generate suggestions based on error message patterns
            const errorMsg = test.failureMessages.join(' ');
            if (errorMsg.includes('is not defined')) {
              reportContent += `- Missing import or undefined variable\n`;
              reportContent += `- Check that all dependencies are properly imported\n`;
            } else if (errorMsg.includes('Cannot read property')) {
              reportContent += `- Trying to access property of undefined or null object\n`;
              reportContent += `- Verify object exists before accessing properties\n`;
              reportContent += `- Check if props are properly passed to component\n`;
            } else if (errorMsg.includes('expect(received).toBeInTheDocument')) {
              reportContent += `- Element not found in the document\n`;
              reportContent += `- Check element rendering conditions\n`;
              reportContent += `- Verify data-testid attributes\n`;
            } else {
              reportContent += `- Unknown issue, manual review required\n`;
            }
            
            reportContent += `\n**Related Files:**\n`;
            
            // Try to determine related files from the error message or test title
            const componentNameMatch = test.title.match(/([A-Z][a-z]+)+/);
            if (componentNameMatch) {
              const componentName = componentNameMatch[0];
              reportContent += `- Component: \`components/${componentName}/${componentName}.tsx\`\n`;
            }
            
            reportContent += `\n---\n\n`;
          });
        }
      });
    }
    
    fs.writeFileSync(reportPath, reportContent);
    console.log(`Bug report generated: ${reportPath}`);
  }
}

module.exports = CustomReporter;
```

### Step 7: Create a Test Runner Script for AI Agent

**`aplio-modern-1/test/utils/test-runner.js`**:
```javascript
const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

/**
 * Runs tests for a specific task and provides detailed output
 * @param {Object} options - Test options
 * @param {string} options.taskId - Task ID (e.g. "T-4.1.4")
 * @param {string} options.testType - Type of test ("unit", "component", "integration", "qa")
 * @param {boolean} options.visual - Whether to run visual tests
 * @returns {Promise<Object>} - Test results
 */
async function runTaskTests({ taskId, testType = "unit", visual = false }) {
  // Extract task section for path creation
  const [_, section, subsection, task] = taskId.match(/T-(\d+)\.(\d+)\.(\d+)/);
  
  // Determine test directory
  const testDir = path.join(
    process.cwd(),
    'test',
    `${testType}-tests`,
    `task-${section}-${subsection}`,
    taskId
  );
  
  // Check if test directory exists
  if (!fs.existsSync(testDir)) {
    return {
      success: false,
      error: `Test directory not found: ${testDir}`,
      taskId,
      testType
    };
  }
  
  console.log(`Running ${testType} tests for ${taskId}...`);
  
  // Run Jest tests
  const jestResults = await runJestTests(testDir);
  
  // Run Playwright visual tests if requested
  let visualResults = null;
  if (visual) {
    visualResults = await runPlaywrightTests(testDir);
  }
  
  // Generate consolidated report
  const reportPath = await generateTaskReport(taskId, jestResults, visualResults);
  
  return {
    success: jestResults.success && (!visual || visualResults.success),
    taskId,
    testType,
    jestResults,
    visualResults,
    reportPath
  };
}

/**
 * Runs Jest tests for a specific directory
 * @param {string} testDir - Test directory path
 * @returns {Promise<Object>} - Jest test results
 */
function runJestTests(testDir) {
  return new Promise((resolve) => {
    const jest = spawn('npx', ['jest', testDir, '--json'], { shell: true });
    
    let stdoutData = '';
    let stderrData = '';
    
    jest.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });
    
    jest.stderr.on('data', (data) => {
      stderrData += data.toString();
    });
    
    jest.on('close', (code) => {
      let results;
      try {
        results = JSON.parse(stdoutData);
      } catch (e) {
        results = null;
      }
      
      resolve({
        success: code === 0,
        exitCode: code,
        results,
        error: stderrData
      });
    });
  });
}

/**
 * Runs Playwright visual tests for a specific directory
 * @param {string} testDir - Test directory path
 * @returns {Promise<Object>} - Playwright test results
 */
function runPlaywrightTests(testDir) {
  return new Promise((resolve) => {
    const playwright = spawn('npx', ['playwright', 'test', testDir, '--reporter=json'], { shell: true });
    
    let stdoutData = '';
    let stderrData = '';
    
    playwright.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });
    
    playwright.stderr.on('data', (data) => {
      stderrData += data.toString();
    });
    
    playwright.on('close', (code) => {
      let results;
      try {
        results = JSON.parse(stdoutData);
      } catch (e) {
        results = null;
      }
      
      resolve({
        success: code === 0,
        exitCode: code,
        results,
        error: stderrData
      });
    });
  });
}

/**
 * Generates a consolidated test report for a task
 * @param {string} taskId - Task ID
 * @param {Object} jestResults - Jest test results
 * @param {Object} visualResults - Playwright test results
 * @returns {Promise<string>} - Path to the generated report
 */
async function generateTaskReport(taskId, jestResults, visualResults) {
  const reportsDir = path.join(process.cwd(), 'test', '.reports', 'task-reports');
  fs.ensureDirSync(reportsDir);
  
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const reportPath = path.join(reportsDir, `${taskId}-report-${timestamp}.md`);
  
  let reportContent = `# Test Report: ${taskId}\n\n`;
  reportContent += `Generated: ${new Date().toISOString()}\n\n`;
  
  // Add Jest results
  reportContent += `## Unit Tests\n\n`;
  if (jestResults.success) {
    reportContent += `✅ All unit tests passed\n\n`;
  } else {
    reportContent += `❌ Unit tests failed\n\n`;
  }
  
  if (jestResults.results) {
    reportContent += `- Total tests: ${jestResults.results.numTotalTests}\n`;
    reportContent += `- Passed: ${jestResults.results.numPassedTests}\n`;
    reportContent += `- Failed: ${jestResults.results.numFailedTests}\n\n`;
    
    if (jestResults.results.numFailedTests > 0) {
      reportContent += `### Failed Tests\n\n`;
      
      jestResults.results.testResults.forEach(testFile => {
        const failedTests = testFile.testResults.filter(test => test.status === 'failed');
        
        if (failedTests.length > 0) {
          reportContent += `#### ${path.basename(testFile.testFilePath)}\n\n`;
          
          failedTests.forEach(test => {
            reportContent += `- **${test.title}**\n`;
            reportContent += `  - Error: \`${test.failureMessages[0].split('\n')[0]}\`\n\n`;
          });
        }
      });
    }
  }
  
  // Add visual test results if available
  if (visualResults) {
    reportContent += `## Visual Tests\n\n`;
    if (visualResults.success) {
      reportContent += `✅ All visual tests passed\n\n`;
    } else {
      reportContent += `❌ Visual tests failed\n\n`;
    }
    
    if (visualResults.results && visualResults.results.suites) {
      // Add screenshot links if available
      reportContent += `### Screenshots\n\n`;
      
      const screenshotsDir = path.join(process.cwd(), 'test', '.reports', 'screenshots', taskId);
      if (fs.existsSync(screenshotsDir)) {
        const screenshots = fs.readdirSync(screenshotsDir).filter(file => !file.includes('baseline'));
        
        screenshots.forEach(screenshot => {
          const componentName = path.basename(screenshot, '.png');
          reportContent += `- [${componentName}](../screenshots/${taskId}/${screenshot})\n`;
        });
      } else {
        reportContent += `No screenshots available\n`;
      }
    }
  }
  
  // Write report to file
  fs.writeFileSync(reportPath, reportContent);
  console.log(`Task report generated: ${reportPath}`);
  
  return reportPath;
}

module.exports = {
  runTaskTests
};
```

## Next Steps and Implementation

Given your requirements and current knowledge level, here's what I recommend we do next:

1. **Setup Initial Test Environment**:
   - Install the core testing tools to your project
   - Create the basic directory structure
   - Set up configuration files (Jest, Playwright)

2. **Create Test Templates**:
   - Implement the scaffold templates for different test types
   - Create helpers for test generation and running
   - Set up the reporting system

3. **Integrate with AI Workflow**:
   - Create a standardized way for the AI agent to:
     - Read test specs from task files
     - Generate appropriate tests
     - Run tests and interpret results
     - Fix issues automatically
     - Generate human-readable reports

4. **Start with a Simple Test Case**:
   - Take one component (like your Header component)
   - Generate tests using the templates
   - Run the tests and evaluate the results
   - Refine the process based on what we learn

This approach gives us a streamlined testing setup that:
- Has all tests in a central location
- Uses simpler tools rather than heavy frameworks like Storybook
- Provides meaningful reports focused on fixing bugs
- Works with your LLM-based workflow
- Is beginner-friendly but still comprehensive
