# Testing System Development & Setup Specification v2

## Overview

This document provides detailed implementation instructions for the AI-driven testing system, incorporating:
1. Core testing infrastructure
2. Managed test server with dashboard
3. Mock data generation with Faker.js
4. Automated installation script

Each section specifies exactly what files and scripts are needed, where they should be located, and which agent is responsible for each task.

## Directory Structure Creation

**Responsible Agent: AI Coding Agent**

Create the following directory structure:

```
aplio-modern-1/
├── test/
│   ├── utils/
│   │   ├── scaffold-templates/    (Reusable testing page templates)
│   │   ├── helpers/               (Helper functions for tests)
│   │   ├── reporting/             (Test result report generators)
│   │   ├── server/                (Test server implementation)
│   │   │   └── dashboard/         (Server monitoring dashboard)
│   │   └── data-factory/          (Mock data generation)
│   │       ├── models/            (Domain-specific data models)
│   │       └── fixtures/          (Pre-generated test data)
│   ├── unit-tests/                (Unit test files)
│   ├── component-tests/           (Component tests)
│   ├── integration-tests/         (Integration tests)
│   ├── qa-tests/                  (QA tests)
│   └── .reports/                  (Test reports output)
│       ├── screenshots/           (Visual test screenshots)
│       ├── coverage/              (Coverage reports)
│       └── bug-reports/           (Generated bug reports)
├── app/
│   └── test-scaffold/             (Next.js scaffold pages)
└── scripts/
    └── setup-testing.sh           (Installation script)
```

Command to create this structure:

```bash
mkdir -p test/utils/scaffold-templates
mkdir -p test/utils/helpers
mkdir -p test/utils/reporting
mkdir -p test/utils/server/dashboard
mkdir -p test/utils/data-factory/models
mkdir -p test/utils/data-factory/fixtures
mkdir -p test/unit-tests
mkdir -p test/component-tests
mkdir -p test/integration-tests
mkdir -p test/qa-tests
mkdir -p test/.reports/screenshots
mkdir -p test/.reports/coverage
mkdir -p test/.reports/bug-reports
mkdir -p app/test-scaffold
mkdir -p scripts
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
  msw@2.0.10 \
  express@4.18.2 \
  react@18.2.0 \
  react-dom@18.2.0 \
  commander@9.4.1 \
  faker@5.5.3
```

## 1. Core Testing Infrastructure

### 1.1 Jest Configuration

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

### 1.2 Playwright Configuration

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

### 1.3 Package.json Scripts

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
  "scaffold:create": "node test/utils/scaffold-templates/create-scaffold.js",
  "test:server": "node test/utils/server/start-server.js",
  "test:dashboard": "node test/utils/server/dashboard/start-dashboard.js",
  "test:generate-fixtures": "node test/utils/data-factory/generate-fixtures.js",
  "test:reset-fixtures": "rm -rf test/utils/data-factory/fixtures/* && npm run test:generate-fixtures",
  "test:setup": "bash scripts/setup-testing.sh"
}
```

### 1.4 Jest Setup File

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

### 1.5 File Mock for Images

**Responsible Agent: AI Coding Agent**

File: `test/utils/helpers/fileMock.js`

```javascript
module.exports = 'test-file-stub';
```

## 2. Test Server Implementation

### 2.1 Server Manager

**Responsible Agent: AI Coding Agent**

File: `test/utils/server/server-manager.js`

```javascript
const express = require('express');
const fs = require('fs-extra');
const path = require('path');

class TestServerManager {
  constructor() {
    this.server = null;
    this.app = null;
    this.port = 3333; // Fixed port for predictability
    this.isRunning = false;
    this.activeTests = new Map();
  }

  // Start server if not already running
  async start() {
    if (this.isRunning) {
      console.log(`Test server already running on http://localhost:${this.port}`);
      return this.port;
    }

    try {
      // Create Express server for test scaffolds
      this.app = express();
      
      // Serve static test output
      this.app.use('/test-output', express.static(path.join(process.cwd(), 'test', '.reports')));
      
      // Serve component test pages
      this.app.get('/test-scaffold/:taskId/:component', (req, res) => {
        const { taskId, component } = req.params;
        const htmlPath = path.join(
          process.cwd(), 
          'test', 
          '.temp', 
          'scaffolds', 
          taskId, 
          `${component}.html`
        );
        
        if (fs.existsSync(htmlPath)) {
          res.sendFile(htmlPath);
        } else {
          res.status(404).send(`Test scaffold for ${component} (${taskId}) not found`);
        }
      });
      
      // Status endpoint to check what's running
      this.app.get('/status', (req, res) => {
        res.json({
          running: this.isRunning,
          port: this.port,
          activeTests: Array.from(this.activeTests.entries())
        });
      });
      
      // Create server
      this.server = this.app.listen(this.port);
      this.isRunning = true;
      
      console.log(`Test server started on http://localhost:${this.port}`);
      console.log(`Server status: http://localhost:${this.port}/status`);
      
      return this.port;
    } catch (error) {
      console.error('Failed to start test server:', error);
      throw error;
    }
  }

  // Register active test
  registerTest(taskId, component, params = {}) {
    const testId = `${taskId}:${component}`;
    const url = new URL(`http://localhost:${this.port}/test-scaffold/${taskId}/${component}`);
    
    // Add any params as search params
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    
    this.activeTests.set(testId, {
      startTime: new Date().toISOString(),
      taskId,
      component,
      url: url.toString()
    });
    
    return url.toString();
  }

  // Unregister test when complete
  unregisterTest(taskId, component) {
    const testId = `${taskId}:${component}`;
    this.activeTests.delete(testId);
  }

  // Completely stop the server
  stop() {
    if (this.server && this.isRunning) {
      this.server.close();
      this.isRunning = false;
      this.activeTests.clear();
      console.log('Test server stopped');
    }
  }

  // Get server status
  getStatus() {
    return {
      running: this.isRunning,
      port: this.port,
      activeTests: Array.from(this.activeTests.entries())
    };
  }
}

// Create singleton instance
const serverManager = new TestServerManager();

// Handle graceful shutdown
process.on('SIGINT', () => {
  serverManager.stop();
  process.exit();
});

process.on('SIGTERM', () => {
  serverManager.stop();
  process.exit();
});

module.exports = serverManager;
```

### 2.2 Server Starter

**Responsible Agent: AI Coding Agent**

File: `test/utils/server/start-server.js`

```javascript
#!/usr/bin/env node

const serverManager = require('./server-manager');

async function main() {
  try {
    await serverManager.start();
    console.log('Test server is running. Press Ctrl+C to stop.');
    
    // Keep the process running
    process.stdin.resume();
  } catch (error) {
    console.error('Failed to start test server:', error);
    process.exit(1);
  }
}

main();
```

### 2.3 Server Dashboard

**Responsible Agent: AI Coding Agent**

File: `test/utils/server/dashboard/dashboard.js`

```javascript
const express = require('express');
const serverManager = require('../server-manager');

/**
 * Starts a dashboard to monitor test server status
 */
function startDashboard(port = 3334) {
  const app = express();
  
  // Serve dashboard HTML
  app.get('/', (req, res) => {
    const status = serverManager.getStatus();
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Test Server Dashboard</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 2rem; }
            .dashboard { max-width: 1200px; margin: 0 auto; }
            .status { padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
            .running { background-color: #d1fae5; }
            .stopped { background-color: #fee2e2; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #ddd; }
            .actions { margin-top: 1rem; }
            button { padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
            .refresh { background-color: #e0f2fe; border: 1px solid #bae6fd; }
            .stop { background-color: #fee2e2; border: 1px solid #fca5a5; }
          </style>
          <script>
            function refreshDashboard() {
              window.location.reload();
            }
            
            function stopServer() {
              fetch('/stop', { method: 'POST' })
                .then(() => window.location.reload());
            }
            
            // Auto-refresh every 10 seconds
            setTimeout(() => refreshDashboard(), 10000);
          </script>
        </head>
        <body>
          <div class="dashboard">
            <h1>Test Server Dashboard</h1>
            
            <div class="status ${status.running ? 'running' : 'stopped'}">
              <h2>Server Status: ${status.running ? 'Running' : 'Stopped'}</h2>
              <p>Port: ${status.port}</p>
              <p>Server URL: <a href="http://localhost:${status.port}" target="_blank">http://localhost:${status.port}</a></p>
              <p>Status endpoint: <a href="http://localhost:${status.port}/status" target="_blank">http://localhost:${status.port}/status</a></p>
            </div>
            
            <h2>Active Tests (${status.activeTests.length})</h2>
            ${status.activeTests.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Task ID</th>
                    <th>Component</th>
                    <th>Start Time</th>
                    <th>URL</th>
                  </tr>
                </thead>
                <tbody>
                  ${status.activeTests.map(([id, test]) => `
                    <tr>
                      <td>${test.taskId}</td>
                      <td>${test.component}</td>
                      <td>${test.startTime}</td>
                      <td><a href="${test.url}" target="_blank">${test.url}</a></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p>No active tests</p>'}
            
            <div class="actions">
              <button class="refresh" onclick="refreshDashboard()">Refresh</button>
              ${status.running ? `<button class="stop" onclick="stopServer()">Stop Server</button>` : ''}
            </div>
          </div>
        </body>
      </html>
    `;
    
    res.send(html);
  });
  
  // Stop server endpoint
  app.post('/stop', (req, res) => {
    serverManager.stop();
    res.json({ success: true });
  });
  
  // Start dashboard server
  const server = app.listen(port, () => {
    console.log(`Dashboard available at http://localhost:${port}`);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    server.close();
  });
  
  process.on('SIGTERM', () => {
    server.close();
  });
  
  return server;
}

module.exports = {
  startDashboard
};
```

### 2.4 Dashboard Starter

**Responsible Agent: AI Coding Agent**

File: `test/utils/server/dashboard/start-dashboard.js`

```javascript
#!/usr/bin/env node

const { startDashboard } = require('./dashboard');

async function main() {
  try {
    startDashboard();
    console.log('Dashboard is running. Press Ctrl+C to stop.');
    
    // Keep the process running
    process.stdin.resume();
  } catch (error) {
    console.error('Failed to start dashboard:', error);
    process.exit(1);
  }
}

main();
```

### 2.5 Static Scaffold Generator

**Responsible Agent: AI Coding Agent**

File: `test/utils/scaffold-templates/static-scaffold-generator.js`

```javascript
const fs = require('fs-extra');
const path = require('path');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const serverManager = require('../server/server-manager');

/**
 * Creates a static HTML test scaffold for a component
 */
async function createStaticScaffold(options) {
  const { taskId, componentName, componentPath, props = {} } = options;
  
  // Ensure test server is running
  await serverManager.start();
  
  // Create temp directory for scaffold
  const scaffoldDir = path.join(
    process.cwd(),
    'test',
    '.temp',
    'scaffolds',
    taskId
  );
  
  fs.ensureDirSync(scaffoldDir);
  
  try {
    // Import the component (this requires a bit of magic - in real implementation, 
    // you might need to use a bundler like webpack to handle this properly)
    const Component = require(path.join(process.cwd(), componentPath)).default;
    
    // Generate component HTML
    const componentElement = React.createElement(Component, props);
    const componentHtml = ReactDOMServer.renderToStaticMarkup(componentElement);
    
    // Create full HTML page
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${componentName} Test Scaffold (${taskId})</title>
          <link rel="stylesheet" href="/test-output/styles/test-scaffold.css">
          <style>
            body { font-family: system-ui, sans-serif; padding: 2rem; }
            .test-scaffold { max-width: 1200px; margin: 0 auto; }
            .component-container { 
              border: 1px solid #ddd; 
              padding: 2rem; 
              margin-top: 2rem; 
              border-radius: 8px;
            }
          </style>
        </head>
        <body>
          <div class="test-scaffold">
            <h1>${componentName} Test Scaffold (${taskId})</h1>
            <p>Generated: ${new Date().toISOString()}</p>
            <div class="component-container" data-testid="${componentName.toLowerCase()}">
              ${componentHtml}
            </div>
          </div>
        </body>
      </html>
    `;
    
    // Write HTML to file
    const htmlPath = path.join(scaffoldDir, `${componentName}.html`);
    fs.writeFileSync(htmlPath, html);
    
    // Register test with server manager
    const testUrl = serverManager.registerTest(taskId, componentName);
    
    return {
      taskId,
      componentName,
      htmlPath,
      testUrl
    };
  } catch (error) {
    console.error(`Error creating scaffold for ${componentName}:`, error);
    throw error;
  }
}

module.exports = {
  createStaticScaffold
};
```

## 3. Mock Data Factory

### 3.1 Factory Core

**Responsible Agent: AI Coding Agent**

File: `test/utils/data-factory/index.js`

```javascript
const faker = require('faker');
const fs = require('fs-extra');
const path = require('path');

// Import model factories
const userFactory = require('./models/user');
const productFactory = require('./models/product');
// Add other model imports as needed

// Set seed for reproducible data
let currentSeed = 123;
faker.seed(currentSeed);

/**
 * Creates multiple instances of a model
 * @param {Function} factory - Factory function to create objects
 * @param {number} count - Number of instances to create
 * @param {Object} overrides - Properties to override in all instances
 * @returns {Array} Array of created objects
 */
const createMany = (factory, count = 3, overrides = {}) => {
  return Array.from({ length: count }, (_, index) => 
    factory({ id: `id-${index + 1}`, ...overrides })
  );
};

/**
 * Resets the faker seed for reproducible results
 * @param {number} seed - Seed value to use
 */
const resetSeed = (seed = 123) => {
  currentSeed = seed;
  faker.seed(seed);
};

/**
 * Generates JSON fixture files from factories
 * @param {Object} config - Configuration of models to generate
 * @param {string} outputDir - Output directory for fixtures
 */
const generateFixtures = (config, outputDir = path.join(process.cwd(), 'test', 'utils', 'data-factory', 'fixtures')) => {
  fs.ensureDirSync(outputDir);
  
  Object.entries(config).forEach(([filename, options]) => {
    const { factory, count = 10, overrides = {} } = options;
    const data = createMany(factory, count, overrides);
    fs.writeFileSync(
      path.join(outputDir, `${filename}.json`),
      JSON.stringify(data, null, 2)
    );
    console.log(`Generated fixture: ${filename}.json with ${count} items`);
  });
};

module.exports = {
  // Core utilities
  createMany,
  resetSeed,
  generateFixtures,
  faker, // Export faker for direct access when needed
  
  // Model factories
  user: userFactory,
  product: productFactory,
  // Add other exports as needed
};
```

### 3.2 User Factory

**Responsible Agent: AI Coding Agent**

File: `test/utils/data-factory/models/user.js`

```javascript
const faker = require('faker');

/**
 * Creates a user object with realistic data
 * @param {Object} overrides - Properties to override
 * @returns {Object} User object
 */
const createUser = (overrides = {}) => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  
  return {
    id: faker.datatype.uuid(),
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    email: faker.internet.email(firstName, lastName).toLowerCase(),
    avatar: faker.image.avatar(),
    role: faker.random.arrayElement(['admin', 'user', 'editor']),
    createdAt: faker.date.past().toISOString(),
    ...overrides
  };
};

module.exports = createUser;
```

### 3.3 Product Factory

**Responsible Agent: AI Coding Agent**

File: `test/utils/data-factory/models/product.js`

```javascript
const faker = require('faker');

/**
 * Creates a product object with realistic data
 * @param {Object} overrides - Properties to override
 * @returns {Object} Product object
 */
const createProduct = (overrides = {}) => {
  const name = faker.commerce.productName();
  
  return {
    id: faker.datatype.uuid(),
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    price: parseFloat(faker.commerce.price()),
    description: faker.commerce.productDescription(),
    category: faker.commerce.department(),
    image: `https://source.unsplash.com/400x300/?${encodeURIComponent(name)}`,
    inStock: faker.datatype.boolean(0.8),
    createdAt: faker.date.past().toISOString(),
    ...overrides
  };
};

module.exports = createProduct;
```

### 3.4 Fixture Generator

**Responsible Agent: AI Coding Agent**

File: `test/utils/data-factory/generate-fixtures.js`

```javascript
#!/usr/bin/env node

const { generateFixtures, user, product } = require('./index');

// Configure which fixtures to generate
generateFixtures({
  'users': { 
    factory: user,
    count: 20
  },
  'products': { 
    factory: product,
    count: 30
  },
  'admin-users': {
    factory: user,
    count: 5,
    overrides: { role: 'admin' }
  }
});

console.log('All fixtures generated successfully');
```

## 4. Installation Script

### 4.1 Setup Script

**Responsible Agent: AI Coding Agent**

File: `scripts/setup-testing.sh`

```bash
#!/bin/bash

# Testing Environment Setup Script
# This script installs and configures the testing environment

# Print commands before execution
set -x

# Exit on error
set -e

# Get the directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "Setting up testing environment in $PROJECT_ROOT..."

# 1. Install dependencies
echo "Installing dependencies..."
npm install --save-dev jest@29.7.0 \
  @testing-library/react@14.1.2 \
  @testing-library/jest-dom@6.1.5 \
  @types/jest@29.5.10 \
  jest-environment-jsdom@29.7.0 \
  identity-obj-proxy \
  @playwright/test@1.40.0 \
  fs-extra@11.2.0 \
  msw@2.0.10 \
  express@4.18.2 \
  react@18.2.0 \
  react-dom@18.2.0 \
  commander@9.4.1 \
  faker@5.5.3

# 2. Create directory structure
echo "Creating directory structure..."
mkdir -p test/utils/scaffold-templates
mkdir -p test/utils/helpers
mkdir -p test/utils/reporting
mkdir -p test/utils/server/dashboard
mkdir -p test/utils/data-factory/models
mkdir -p test/utils/data-factory/fixtures
mkdir -p test/unit-tests
mkdir -p test/component-tests
mkdir -p test/integration-tests
mkdir -p test/qa-tests
mkdir -p test/.reports/screenshots
mkdir -p test/.reports/coverage
mkdir -p test/.reports/bug-reports
mkdir -p test/.temp/scaffolds
mkdir -p app/test-scaffold

# 3. Setup Playwright
echo "Setting up Playwright..."
npx playwright install --with-deps chromium

# 4. Generate mock data
echo "Generating mock data..."
if [ -f "test/utils/data-factory/generate-fixtures.js" ]; then
  node test/utils/data-factory/generate-fixtures.js
else
  echo "Mock data generator not found, skipping..."
fi

# 5. Setup complete
echo "Testing environment setup complete!"
echo "Run 'npm run test:server' to start the test server"
echo "Run 'npm run test:dashboard' to start the dashboard"
echo "Run 'npm test' to run the tests"

# Verification
echo "Verifying installation..."
echo "Jest: $(npx jest --version)"
echo "Playwright: $(npx playwright --version)"

echo "Setup complete!"
```

### 4.2 Cleanup Script

**Responsible Agent: AI Coding Agent**

File: `test/utils/cleanup-servers.js`

```javascript
#!/usr/bin/env node

/**
 * Utility to find and clean up any orphaned test servers
 */

const { exec } = require('child_process');

// Ports to check
const PORTS = [3333, 3334]; // Test server and dashboard ports

function findProcessOnPort(port) {
  return new Promise((resolve, reject) => {
    // Command differs based on OS
    const command = process.platform === 'win32'
      ? `netstat -ano | find "LISTENING" | find ":${port}"`
      : `lsof -i :${port} -t`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        // Port likely not in use
        resolve(null);
        return;
      }
      
      if (stdout) {
        // Extract PID from output
        let pid;
        if (process.platform === 'win32') {
          // Windows format - last column is PID
          const match = stdout.trim().match(/\s+(\d+)$/);
          pid = match ? match[1] : null;
        } else {
          // Unix format - output is just PID
          pid = stdout.trim();
        }
        
        resolve(pid);
      } else {
        resolve(null);
      }
    });
  });
}

function killProcess(pid) {
  return new Promise((resolve, reject) => {
    const command = process.platform === 'win32'
      ? `taskkill /F /PID ${pid}`
      : `kill -9 ${pid}`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Failed to kill process ${pid}:`, error);
        reject(error);
        return;
      }
      
      resolve();
    });
  });
}

async function main() {
  console.log('Cleaning up test servers...');
  
  for (const port of PORTS) {
    try {
      const pid = await findProcessOnPort(port);
      if (pid) {
        console.log(`Found process ${pid} on port ${port}, killing...`);
        await killProcess(pid);
        console.log(`Process ${pid} killed successfully.`);
      } else {
        console.log(`No process found on port ${port}.`);
      }
    } catch (error) {
      console.error(`Error cleaning up port ${port}:`, error);
    }
  }
  
  console.log('Cleanup complete.');
}

main().catch(error => {
  console.error('Cleanup failed:', error);
  process.exit(1);
});
```

## Role Responsibilities

### AI Coding Agent Responsibilities

1. Create directory structure and install dependencies
2. Implement all utility scripts and configuration files
3. Create the test scaffold and server infrastructure
4. Create the mock data factory and generators
5. Implement the installation and cleanup scripts

### AI Testing Agent Responsibilities

1. Create test cases for components based on their requirements
2. Run tests and validate test results
3. Debug failing tests and propose fixes
4. Generate test reports for human review
5. Create and maintain test scaffolds for components
6. Leverage the mock data factory to generate realistic test data

### Human Agent Responsibilities

1. Run the installation script to set up the testing environment
2. Review test implementations and scaffolds
3. Verify components through the test scaffolds
4. Provide feedback on test quality and coverage
5. Approve completed tasks when tests pass and visual validation is satisfactory

## Implementation Plan

### Phase 1: Initial Setup

**Responsible Agent: AI Coding Agent**

1. Run the installation script to create the structure and install dependencies
   ```bash
   bash scripts/setup-testing.sh
   ```

### Phase 2: Core Infrastructure Development

**Responsible Agent: AI Coding Agent**

1. Implement the server manager and dashboard
2. Implement the mock data factory
3. Configure Jest and Playwright

### Phase 3: Example Tests

**Responsible Agent: AI Testing Agent**

1. Create an example component (e.g., HeaderComponent)
2. Generate appropriate test data using the mock data factory
3. Use the scaffold generator to create test files
4. Run the tests and verify they pass

### Phase 4: Verification

**Responsible Agent: Human Agent**

1. Start the test server and dashboard
   ```bash
   npm run test:server
   npm run test:dashboard
   ```
2. View the test scaffolds through the dashboard
3. Verify that mock data is generated correctly
4. Provide feedback for any necessary adjustments

## Conclusion

This updated testing system provides a comprehensive solution for AI-driven testing with:

1. A robust testing infrastructure using Jest and Playwright
2. A managed server with dashboard for better visibility and control
3. A mock data factory for generating realistic test data
4. An automated installation script for easy setup

By following these instructions, the AI coding agent can create the necessary infrastructure, the AI testing agent can implement and run tests with realistic data, and the human agent can validate the results through the provided scaffolds. 