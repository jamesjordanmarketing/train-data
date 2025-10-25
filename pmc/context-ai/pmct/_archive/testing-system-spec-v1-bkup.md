# Functional Specification: AI-Driven Testing System

## Document Overview

This specification details the comprehensive testing system for the Aplio Design System Modernization project. The testing system is designed to support a hybrid model where an AI testing agent drives the testing process with human validation. The testing framework covers Unit Testing, Component Testing, Integration Testing, and QA Testing phases, providing structured validation at each level of the application.

## Testing Methodology Overview

The testing system follows a progressive validation approach:

1. **Unit Testing**: Validates individual task elements at a granular level
2. **Component Testing**: Validates fully assembled components comprised of multiple task elements
3. **Integration Testing**: Validates multiple components working together at integration points
4. **QA Testing**: Validates the entire system in a production-like environment

Each testing phase includes both AI-driven automated testing and human validation, creating a robust verification system that combines computational thoroughness with human judgment.

## System Architecture

### 1. Directory Structure

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

### 2. Core Technologies

The testing system utilizes the following technologies:

1. **Jest**: Core testing framework for unit and component tests
2. **React Testing Library**: For testing React components
3. **Playwright**: For visual testing, E2E tests, and as a replacement for Storybook
4. **MSW (Mock Service Worker)**: For mocking API calls in tests
5. **fs-extra**: For file operations in test utilities

This simplified toolset provides a beginner-friendly approach while maintaining robust testing capabilities.

## Detailed Testing Phases

### 1. Unit Testing (Task Level)

Unit testing validates individual task elements at the most granular level.

#### Process Flow:

1. AI or human developer completes implementation of a task (T-X.Y.Z)
2. AI testing agent reviews the code for all elements in the task
3. AI testing agent creates/updates unit tests for the task elements
4. AI testing agent erects a testing scaffold for the task elements
5. AI testing agent runs unit tests against the task elements
6. AI testing agent fixes any failing tests and code issues
7. AI testing agent presents the validated task elements to the human via the scaffold
8. Human testing agent verifies the task elements via the scaffold
9. Human approves the task or identifies issues for the AI to fix
10. Cycle repeats until task is validated and marked complete

#### Implementation Details:

```javascript
/**
 * Unit Test Example for T-4.1.4 (Header Component Implementation)
 * File: /test/unit-tests/task-4-1/T-4.1.4/HeaderComponent.unit.test.tsx
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeaderComponent from '../../../../src/components/Header/HeaderComponent';

describe('HeaderComponent (T-4.1.4)', () => {
  test('renders logo correctly', () => {
    render(<HeaderComponent />);
    const logoElement = screen.getByTestId('header-logo');
    expect(logoElement).toBeInTheDocument();
  });

  test('renders navigation items', () => {
    render(<HeaderComponent />);
    const navElement = screen.getByRole('navigation');
    expect(navElement).toBeInTheDocument();
    // Add more specific navigation tests
  });

  test('meets accessibility requirements', () => {
    render(<HeaderComponent />);
    // Test for proper heading hierarchy, ARIA attributes, etc.
    const headerElement = screen.getByRole('banner');
    expect(headerElement).toBeInTheDocument();
  });
});
```

#### Scaffold Example:

```tsx
// Scaffold for T-4.1.4 (Header Component Implementation)
// File: /app/test-scaffold/T-4.1.4/HeaderComponent.tsx
import React from 'react';
import HeaderComponent from '../../../src/components/Header/HeaderComponent';

export default function HeaderComponentScaffold() {
  return (
    <div className="test-scaffold">
      <h1>Header Component Test Scaffold (T-4.1.4)</h1>
      <div className="component-container">
        <HeaderComponent />
      </div>
    </div>
  );
}
```

### 2. Component Testing

Component testing validates fully assembled components comprised of multiple task elements.

#### Process Flow:

1. A component is completed (all related tasks are validated)
2. AI testing agent reviews the code for the entire component
3. AI testing agent creates/updates component tests
4. AI testing agent erects a testing scaffold for the component
5. AI testing agent runs component tests
6. AI testing agent fixes any failing tests and code issues
7. AI testing agent presents the validated component to the human via the scaffold
8. Human testing agent verifies the component via the scaffold
9. Human approves the component or identifies issues for the AI to fix
10. Cycle repeats until component is validated and marked complete

#### Implementation Details:

```javascript
/**
 * Component Test Example for C-4.1 (Header Component)
 * File: /test/component-tests/component-4-1/HeaderComponent.component.test.tsx
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeaderComponent from '../../../src/components/Header/HeaderComponent';

describe('HeaderComponent (C-4.1)', () => {
  test('navigation menu opens on click', () => {
    render(<HeaderComponent />);
    const menuButton = screen.getByRole('button', { name: /menu/i });
    
    // Initial state - menu closed
    expect(screen.queryByTestId('navigation-menu')).not.toBeVisible();
    
    // Click to open menu
    fireEvent.click(menuButton);
    
    // Menu should now be visible
    expect(screen.getByTestId('navigation-menu')).toBeVisible();
  });

  test('component is responsive at different viewport sizes', async () => {
    // Test component at different viewport sizes
    // This would be combined with visual testing using Playwright
  });
});
```

### 3. Integration Testing

Integration testing validates multiple components working together at integration points.

#### Process Flow:

1. Multiple components that form an integration point are completed
2. AI testing agent creates/updates integration tests
3. AI testing agent erects a testing scaffold for the integration point
4. AI testing agent runs integration tests
5. AI testing agent fixes any failing tests and code issues
6. AI testing agent presents the validated integration to the human via the scaffold
7. Human testing agent verifies the integration via the scaffold
8. Human approves the integration or identifies issues for the AI to fix
9. Cycle repeats until integration is validated and marked complete

#### Implementation Details:

```javascript
/**
 * Integration Test Example for I-4 (Header and Hero Section)
 * File: /test/integration-tests/integration-4/HeaderHeroIntegration.integration.test.tsx
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../../../src/pages/HomePage';

describe('Header and Hero Integration (I-4)', () => {
  test('header navigation links correctly scroll to page sections', () => {
    render(<HomePage />);
    
    // Find navigation link to "Features" section
    const featuresLink = screen.getByRole('link', { name: /features/i });
    
    // Mock scrollIntoView
    const mockScrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = mockScrollIntoView;
    
    // Click the link
    fireEvent.click(featuresLink);
    
    // Verify scroll was attempted and URL includes correct hash
    expect(mockScrollIntoView).toHaveBeenCalled();
    expect(window.location.hash).toBe('#features');
  });

  test('header theme toggle affects hero section styling', () => {
    render(<HomePage />);
    
    // Find theme toggle button
    const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
    
    // Get initial hero background
    const heroSection = screen.getByTestId('hero-section');
    const initialBackground = window.getComputedStyle(heroSection).backgroundColor;
    
    // Toggle theme
    fireEvent.click(themeToggle);
    
    // Verify hero background changed
    const newBackground = window.getComputedStyle(heroSection).backgroundColor;
    expect(newBackground).not.toBe(initialBackground);
  });
});
```

### 4. QA Testing

QA testing validates the entire system in a production-like environment.

#### Process Flow:

1. All components and integration points are completed
2. AI testing agent sets up a native environment for the product
3. AI testing agent creates/updates QA and E2E tests
4. AI testing agent runs QA tests against the native environment
5. AI testing agent fixes any failing tests and code issues
6. AI testing agent presents the validated system to the human via the native environment
7. Human testing agent performs comprehensive testing in the native environment
8. Human approves the system or identifies issues for the AI to fix
9. Cycle repeats until the system is fully validated

#### Implementation Details:

```javascript
/**
 * QA Test Example (End-to-End)
 * File: /test/qa-tests/HomePage.e2e.test.ts
 */
import { test, expect } from '@playwright/test';

test('Complete homepage journey', async ({ page }) => {
  // Visit the homepage
  await page.goto('http://localhost:3000');
  
  // Verify header renders
  await expect(page.locator('[data-testid="header"]')).toBeVisible();
  
  // Verify hero section renders
  await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
  
  // Click CTA button
  await page.click('[data-testid="hero-cta-button"]');
  
  // Verify form section is visible
  await expect(page.locator('[data-testid="contact-form"]')).toBeVisible();
  
  // Fill out the form
  await page.fill('[data-testid="name-input"]', 'Test User');
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="message-input"]', 'This is a test message');
  
  // Submit the form
  await page.click('[data-testid="submit-button"]');
  
  // Verify success message
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

## Implementation Tools and Configuration

### 1. Package Dependencies

```json
{
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@types/jest": "^29.5.10",
    "fs-extra": "^11.2.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "msw": "^2.0.10"
  }
}
```

### 2. Core Configuration Files

#### Jest Configuration (jest.config.js)

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
  coverageReporters: ["json", "lcov", "text", "clover", "html"]
};
```

#### Playwright Configuration (playwright.config.ts)

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

### 3. NPM Scripts for Testing

```json
{
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
    "test:all": "npm run test && npm run test:visual && npm run test:report"
  }
}
```

## Testing Utilities

### 1. Component Scaffold Generator

The testing system includes utilities to automatically generate scaffolds for testing components:

```javascript
// File: test/utils/scaffold-templates/component-scaffold.js
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
    scaffoldPagePath,
    taskId,
    componentName
  };
}

module.exports = createComponentScaffold;
```

### 2. Test Runner

```javascript
// File: test/utils/test-runner.js
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
  runTaskTests
};
```

### 3. Reporting System

```javascript
// File: test/utils/reporting/custom-reporter.js
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
    
    if (results.numFailedTests > 0) {
      reportContent += `## Failed Tests\n\n`;
      
      results.testResults.forEach(testFile => {
        const failedTests = testFile.testResults.filter(test => test.status === 'failed');
        
        if (failedTests.length > 0) {
          reportContent += `### ${path.relative(process.cwd(), testFile.testFilePath)}\n\n`;
          
          failedTests.forEach(test => {
            reportContent += `#### ${test.title}\n\n`;
            reportContent += `**Error Message:**\n\`\`\`\n${test.failureMessages.join('\n')}\n\`\`\`\n\n`;
            
            // Add potential fix suggestions
            reportContent += `**Potential Issues:**\n\n`;
            // Add AI-generated suggestions for fixing the issue
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

## Testing Workflow

This section outlines the complete testing workflow from task implementation to final QA approval.

### 1. Task-Level Testing Workflow

1. Developer or AI implements a task (e.g., T-4.1.4)
2. AI testing agent creates test scaffold:
   ```bash
   node test/utils/scaffold-templates/create-scaffold.js --taskId=T-4.1.4 --component=HeaderComponent
   ```
3. AI testing agent writes unit tests for the task
4. AI testing agent runs the unit tests:
   ```bash
   npm run test:unit -- --testPathPattern=T-4.1.4
   ```
5. AI testing agent fixes any failing tests and code issues
6. AI testing agent starts the scaffold for human validation:
   ```bash
   npm run dev
   # Human navigates to http://localhost:3000/test-scaffold/T-4.1.4/HeaderComponent
   ```
7. Human testing agent validates the task or reports issues
8. Task is marked as complete when validated

### 2. Component-Level Testing Workflow

1. After all tasks for a component are completed (e.g., C-4.1)
2. AI testing agent creates component test scaffold:
   ```bash
   node test/utils/scaffold-templates/create-scaffold.js --componentId=C-4.1 --component=HeaderComponent
   ```
3. AI testing agent writes component tests
4. AI testing agent runs the component tests:
   ```bash
   npm run test:component -- --testPathPattern=C-4.1
   ```
5. AI testing agent fixes any failing tests and code issues
6. AI testing agent starts the scaffold for human validation:
   ```bash
   npm run dev
   # Human navigates to http://localhost:3000/test-scaffold/component/C-4.1/HeaderComponent
   ```
7. Human testing agent validates the component or reports issues
8. Component is marked as complete when validated

### 3. Integration-Level Testing Workflow

1. After all components for an integration point are completed (e.g., I-4)
2. AI testing agent creates integration test scaffold:
   ```bash
   node test/utils/scaffold-templates/create-scaffold.js --integrationType=I-4 --integration=HeaderHeroIntegration
   ```
3. AI testing agent writes integration tests
4. AI testing agent runs the integration tests:
   ```bash
   npm run test:integration -- --testPathPattern=I-4
   ```
5. AI testing agent fixes any failing tests and code issues
6. AI testing agent starts the scaffold for human validation:
   ```bash
   npm run dev
   # Human navigates to http://localhost:3000/test-scaffold/integration/I-4/HeaderHeroIntegration
   ```
7. Human testing agent validates the integration or reports issues
8. Integration point is marked as complete when validated

### 4. QA-Level Testing Workflow

1. After all integration points are completed
2. AI testing agent sets up the native environment:
   ```bash
   npm run build
   npm run start
   ```
3. AI testing agent writes E2E tests using Playwright
4. AI testing agent runs the E2E tests:
   ```bash
   npm run test:e2e
   ```
5. AI testing agent fixes any failing tests and code issues
6. AI testing agent presents the complete system to the human:
   ```bash
   # Human navigates to http://localhost:3000
   ```
7. Human testing agent performs comprehensive QA testing
8. System is marked as complete when fully validated

## Implementation Plan

### 1. Initial Setup

1. Install required dependencies:
   ```bash
   npm install --save-dev jest @testing-library/react @testing-library/jest-dom @playwright/test fs-extra msw
   ```

2. Create directory structure:
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
   ```

3. Set up configuration files:
   - Create jest.config.js
   - Create playwright.config.ts
   - Update package.json with test scripts

### 2. Create Core Utilities

1. Create test helpers and setup files
2. Implement the scaffold generator
3. Implement the test runner
4. Create the reporting system

### 3. Create Example Tests

1. Create sample unit tests
2. Create sample component tests
3. Create sample integration tests
4. Create sample QA tests

### 4. Document Usage

1. Create README with usage instructions
2. Document the testing workflow
3. Provide examples for common testing scenarios

## Conclusion

This testing system specification provides a comprehensive framework for testing the Aplio Design System Modernization project. By implementing this system, both AI testing agents and human validators will have a structured approach to verify the correctness of the implementation at all levels, from granular tasks to the complete system.

The combination of automated testing driven by AI and human validation creates a robust verification process that ensures the quality and correctness of the implementation. The scaffold-based approach makes it easy for both AI agents and humans to visualize and interact with components in isolation, facilitating thorough testing and validation.

By following this specification, the project will have a consistent, reliable, and efficient testing approach that supports the development process from start to finish.
