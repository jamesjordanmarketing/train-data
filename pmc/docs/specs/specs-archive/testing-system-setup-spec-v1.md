# Testing System Development & Setup Specification

## Overview

This document provides detailed implementation instructions for the AI-driven testing system. It specifies exactly what files and scripts are needed, where they should be located, what each component does, and which agent (AI coding agent, AI testing agent, or human) is responsible for each task.

## Directory Structure Creation

**Responsible Agent: AI Coding Agent**

Create the following directory structure:

```
aplio-modern-1/
├── test/
│   ├── utils/
│   │   ├── scaffold-templates/
│   │   ├── helpers/
│   │   └── reporting/
│   ├── unit-tests/
│   ├── component-tests/
│   ├── integration-tests/
│   ├── qa-tests/
│   └── .reports/
│       ├── screenshots/
│       ├── coverage/
│       └── bug-reports/
└── app/
    └── test-scaffold/
        └── _layout.tsx
```

Command to create this structure:

```bash
mkdir -p test/utils/scaffold-templates
mkdir -p test/utils/helpers
mkdir -p test/utils/reporting
mkdir -p test/unit-tests
mkdir -p test/component-tests
mkdir -p test/integration-tests
mkdir -p test/qa-tests
mkdir -p test/.reports/screenshots
mkdir -p test/.reports/coverage
mkdir -p test/.reports/bug-reports
mkdir -p app/test-scaffold
```

## Package Dependencies

**Responsible Agent: AI Coding Agent**

Add the following dependencies to your project:

```bash
npm install --save-dev jest@29.7.0 \
  @testing-library/react@14.1.2 \
  @testing-library/jest-dom@6.1.5 \
  @types/jest@29.5.10 \
  jest-environment-jsdom@29.7.0 \
  identity-obj-proxy \
  @playwright/test@1.40.0 \
  fs-extra@11.2.0 \
  msw@2.0.10
```

## Core Configuration Files

### 1. Jest Configuration

**Responsible Agent: AI Coding Agent**

File: `jest.config.js` (root directory)

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

### 2. Playwright Configuration

**Responsible Agent: AI Coding Agent**

File: `playwright.config.ts` (root directory)

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

### 3. Package.json Scripts

**Responsible Agent: AI Coding Agent**

Add these scripts to your `package.json`:

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:unit": "jest --testPathPattern=unit-tests",
  "test:component": "jest --testPathPattern=component-tests",
  "test:integration": "jest --testPathPattern=integration-tests",
  "test:qa": "jest --testPathPattern=qa-tests",
  "test:visual": "playwright test",
  "test:e2e": "playwright test --testPathPattern=qa-tests",
  "test:report": "node test/utils/reporting/generate-report.js",
  "test:all": "npm run test && npm run test:visual && npm run test:report",
  "scaffold:create": "node test/utils/scaffold-templates/create-scaffold.js"
}
```

## Utility Files

### 1. Jest Setup File

**Responsible Agent: AI Coding Agent**

File: `test/utils/helpers/jest-setup.js`

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

### 2. File Mock for Images

**Responsible Agent: AI Coding Agent**

File: `test/utils/helpers/fileMock.js`

```javascript
module.exports = 'test-file-stub';
```

### 3. Scaffold Generator

**Responsible Agent: AI Coding Agent**

File: `test/utils/scaffold-templates/create-scaffold.js`

```javascript
#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { program } = require('commander');
const componentScaffold = require('./component-scaffold');

// Set up command line arguments
program
  .option('-t, --taskId <taskId>', 'Task ID (e.g., T-4.1.4)')
  .option('-c, --component <component>', 'Component name')
  .option('-p, --componentPath <path>', 'Path to component file', 'src/components')
  .option('--componentId <componentId>', 'Component ID for component tests (e.g., C-4.1)')
  .option('--integrationType <integrationType>', 'Integration type (e.g., I-4)')
  .option('--integration <integration>', 'Integration name')
  .option('--props <props>', 'JSON string of props to pass to component', '{}');

program.parse(process.argv);

const options = program.opts();

async function main() {
  if (options.taskId && options.component) {
    // Create a unit test scaffold
    console.log(`Creating scaffold for ${options.component} (${options.taskId})...`);
    
    const props = JSON.parse(options.props);
    const componentPath = `${options.componentPath}/${options.component}/${options.component}`;
    
    const result = componentScaffold({
      taskId: options.taskId,
      componentName: options.component,
      componentPath,
      props
    });
    
    console.log(`Created test file: ${result.testFilePath}`);
    console.log(`Created scaffold page: ${result.scaffoldPagePath}`);
  } else if (options.componentId && options.component) {
    // Create a component test scaffold
    console.log(`Creating component scaffold for ${options.component} (${options.componentId})...`);
    
    // Similar implementation for component level tests
    // ...
  } else if (options.integrationType && options.integration) {
    // Create an integration test scaffold
    console.log(`Creating integration scaffold for ${options.integration} (${options.integrationType})...`);
    
    // Similar implementation for integration level tests
    // ...
  } else {
    console.error('Missing required arguments. Use --help for usage information.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Error creating scaffold:', err);
  process.exit(1);
});
```

### 4. Component Scaffold Generator

**Responsible Agent: AI Coding Agent**

File: `test/utils/scaffold-templates/component-scaffold.js`

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
    'unit-tests',
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

test('${componentName} visual test (${taskId})', async ({ page }) => {
  // Load the component scaffold page
  await page.goto('http://localhost:3000/test-scaffold/${taskId}/${componentName}');
  
  // Take screenshot of the component
  await page.screenshot({
    path: path.join(process.cwd(), 'test', '.reports', 'screenshots', '${taskId}', '${componentName}.png'),
    fullPage: false
  });
  
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

### 5. Test Runner

**Responsible Agent: AI Coding Agent**

File: `test/utils/test-runner.js`

```javascript
const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

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
  
  // Add Jest results section
  // Add visual test results section if available
  
  // Write report to file
  fs.writeFileSync(reportPath, reportContent);
  console.log(`Task report generated: ${reportPath}`);
  
  return reportPath;
}

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

module.exports = {
  runTaskTests,
  runJestTests,
  runPlaywrightTests
};
```

### 6. Custom Reporter

**Responsible Agent: AI Coding Agent**

File: `test/utils/reporting/custom-reporter.js`

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

### 7. Report Generator

**Responsible Agent: AI Coding Agent**

File: `test/utils/reporting/generate-report.js`

```javascript
#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

/**
 * Generates a consolidated test report
 */
async function generateReport() {
  const reportsDir = path.join(process.cwd(), 'test', '.reports');
  const outputDir = path.join(reportsDir, 'consolidated');
  fs.ensureDirSync(outputDir);
  
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const reportPath = path.join(outputDir, `test-report-${timestamp}.md`);
  
  // Collect information from various test results
  const coverageData = getCoverageData();
  const bugReports = getBugReports();
  const screenshots = getScreenshots();
  
  // Generate the report content
  let reportContent = `# Consolidated Test Report\n\n`;
  reportContent += `Generated: ${new Date().toISOString()}\n\n`;
  
  // Add sections for each type of data
  // ...
  
  fs.writeFileSync(reportPath, reportContent);
  console.log(`Consolidated report generated: ${reportPath}`);
  
  return reportPath;
}

// Helper functions for collecting data
function getCoverageData() {
  // Implementation to read coverage data
  return {};
}

function getBugReports() {
  // Implementation to get bug reports
  return [];
}

function getScreenshots() {
  // Implementation to get screenshots
  return [];
}

// Run the report generator if this script is executed directly
if (require.main === module) {
  generateReport().catch(err => {
    console.error('Error generating report:', err);
    process.exit(1);
  });
}

module.exports = {
  generateReport
};
```

### 8. Test Scaffold Layout

**Responsible Agent: AI Coding Agent**

File: `app/test-scaffold/_layout.tsx`

```tsx
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TestScaffoldLayout({ children }) {
  const pathname = usePathname();
  
  return (
    <div className="test-scaffold-layout">
      <header className="test-scaffold-header">
        <h1>Test Scaffold</h1>
        <nav className="test-scaffold-nav">
          <Link href="/">Back to App</Link>
          {pathname !== '/test-scaffold' && (
            <Link href="/test-scaffold">All Scaffolds</Link>
          )}
        </nav>
      </header>
      
      <main className="test-scaffold-content">
        {children}
      </main>
      
      <footer className="test-scaffold-footer">
        <p>Aplio Testing System</p>
      </footer>
      
      <style jsx global>{`
        .test-scaffold-layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
            Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        .test-scaffold-header {
          background: #f0f0f0;
          padding: 1rem 2rem;
          border-bottom: 1px solid #ddd;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .test-scaffold-nav {
          display: flex;
          gap: 1rem;
        }
        
        .test-scaffold-content {
          flex: 1;
          padding: 2rem;
        }
        
        .test-scaffold-footer {
          background: #f0f0f0;
          padding: 1rem 2rem;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 0.8rem;
        }
        
        .component-container {
          margin-top: 2rem;
          padding: 2rem;
          border: 1px dashed #ccc;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
```

### 9. Index Page for Scaffolds

**Responsible Agent: AI Coding Agent**

File: `app/test-scaffold/page.tsx`

```tsx
import React from 'react';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

// This function runs on the server
export function getServerSideProps() {
  const scaffoldDir = path.join(process.cwd(), 'app', 'test-scaffold');
  
  // Read all task directories
  const taskDirs = fs.readdirSync(scaffoldDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name.match(/T-\d+\.\d+\.\d+/))
    .map(dirent => dirent.name);
  
  // Collect scaffolds by task
  const scaffoldsByTask = {};
  
  taskDirs.forEach(taskDir => {
    const taskPath = path.join(scaffoldDir, taskDir);
    const scaffolds = fs.readdirSync(taskPath)
      .filter(file => file.endsWith('.tsx') && file !== 'page.tsx')
      .map(file => ({
        name: file.replace('.tsx', ''),
        path: `/test-scaffold/${taskDir}/${file.replace('.tsx', '')}`
      }));
    
    scaffoldsByTask[taskDir] = scaffolds;
  });
  
  return {
    props: {
      scaffoldsByTask
    }
  };
}

export default function TestScaffoldIndex({ scaffoldsByTask }) {
  return (
    <div className="test-scaffold-index">
      <h1>Test Scaffolds</h1>
      
      {Object.keys(scaffoldsByTask).length === 0 ? (
        <p>No scaffolds available yet. Create a component scaffold to get started.</p>
      ) : (
        Object.entries(scaffoldsByTask).map(([taskId, scaffolds]) => (
          <div key={taskId} className="task-scaffolds">
            <h2>{taskId}</h2>
            <ul>
              {scaffolds.map(scaffold => (
                <li key={scaffold.path}>
                  <Link href={scaffold.path}>{scaffold.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
```

## Implementation Plan

### Phase 1: Initial Setup

**Responsible Agent: AI Coding Agent**

1. Create directory structure
2. Install required dependencies
3. Create configuration files:
   - jest.config.js
   - playwright.config.ts
   - Update package.json with test scripts

### Phase 2: Core Utilities Development

**Responsible Agent: AI Coding Agent**

1. Create helper files:
   - jest-setup.js
   - fileMock.js
2. Implement scaffold generator:
   - component-scaffold.js
   - create-scaffold.js
3. Implement test runner and reporting:
   - test-runner.js
   - custom-reporter.js
   - generate-report.js
4. Create test scaffold layout:
   - app/test-scaffold/_layout.tsx
   - app/test-scaffold/page.tsx

### Phase 3: Example Tests

**Responsible Agent: AI Testing Agent**

1. Create an example component (e.g., HeaderComponent)
2. Use the scaffold generator to create test files:
   ```bash
   npm run scaffold:create -- --taskId=T-4.1.4 --component=HeaderComponent
   ```
3. Implement the test cases in the generated files
4. Run the tests:
   ```bash
   npm run test:unit -- --testPathPattern=T-4.1.4
   ```

### Phase 4: Verification

**Responsible Agent: Human Agent**

1. Review the implemented testing infrastructure
2. Verify the example tests work correctly:
   ```bash
   npm run dev
   # Navigate to http://localhost:3000/test-scaffold/T-4.1.4/HeaderComponent
   ```
3. Provide feedback for any necessary adjustments

## Role Responsibilities

### AI Coding Agent Responsibilities

1. Create directory structure and install dependencies
2. Implement all utility scripts and configuration files
3. Create the test scaffold infrastructure
4. Fix any implementation issues identified during testing

### AI Testing Agent Responsibilities

1. Create test cases for components based on their requirements
2. Run tests and validate test results
3. Debug failing tests and propose fixes
4. Generate test reports for human review
5. Create and maintain test scaffolds for components

### Human Agent Responsibilities

1. Review test implementations and scaffolds
2. Verify components through the test scaffolds
3. Provide feedback on test quality and coverage
4. Approve completed tasks when tests pass and visual validation is satisfactory

## Conclusion

This setup specification provides the complete blueprint for implementing the AI-driven testing system. By following these instructions, the AI coding agent can create the necessary infrastructure, the AI testing agent can implement and run tests, and the human agent can validate the results through the provided scaffolds.
