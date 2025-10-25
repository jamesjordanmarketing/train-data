# Testing System Development & Setup Specification v3

## Overview

This document provides detailed implementation instructions for the AI-driven testing system, incorporating:
1. Core testing infrastructure
2. Managed test server with dashboard
3. Mock data generation with Faker.js
4. Automated installation script with configuration support
5. MSW (Mock Service Worker) for API mocking

Each section specifies exactly what files and scripts are needed, where they should be located, and which agent is responsible for each task.

## Configuration File

**Responsible Agent: AI Coding Agent**

The testing system uses a configuration file to make installation and operation modular and adaptable to different project structures.

File: `.test-config.js` (root directory)

```javascript
// .test-config.js
module.exports = {
  // Base project paths
  paths: {
    // Root project directory (opened in VS Code)
    projectRoot: "aplio-26-a1-c",
    
    // Target application directory (where the application code lives)
    appDir: "aplio-modern-1",
    
    // Test directory within the application
    testDir: "test"
  },
  
  // Server configuration
  server: {
    // Default port for test server
    port: 3333,
    
    // Default port for dashboard
    dashboardPort: 3334
  },
  
  // Mock data configuration
  mockData: {
    // Default seed for reproducible data
    defaultSeed: 123,
    
    // Fixtures to generate on installation
    defaultFixtures: [
      "users",
      "products",
      "theme-configs",
      "navigation"
    ]
  }
};
```

## Directory Structure Creation

**Responsible Agent: AI Coding Agent**

Create the following directory structure, with directory names determined by the configuration file:

```
{appDir}/
├── test/
│   ├── utils/
│   │   ├── scaffold-templates/    (Reusable testing page templates)
│   │   ├── helpers/               (Helper functions for tests)
│   │   ├── reporting/             (Test result report generators)
│   │   ├── server-manager/        (Test server implementation)
│   │   │   └── dashboard/         (Server monitoring dashboard)
│   │   ├── data-factory/          (Mock data generation)
│   │   │   ├── models/            (Domain-specific data models)
│   │   │   └── fixtures/          (Pre-generated test data)
│   │   ├── msw-handlers/          (Mock Service Worker request handlers)
│   │   │   ├── endpoints/         (Organized by API endpoint)
│   │   │   └── responses/         (Pre-defined responses)
│   │   └── install-test-environment.js  (Installation script)
│   ├── smoke-tests/               (Verification tests)
│   ├── unit-tests/                (Unit test files)
│   ├── component-tests/           (Component tests)
│   ├── integration-tests/         (Integration tests)
│   ├── qa-tests/                  (QA tests)
│   ├── templates/                 (Template files for tests and configs)
│   └── .reports/                  (Test reports output)
│       ├── screenshots/           (Visual test screenshots)
│       ├── coverage/              (Coverage reports)
│       ├── bug-reports/           (Generated bug reports)
│       └── install-log.txt        (Installation log)
├── app/
│   └── test-scaffold/             (Next.js scaffold pages)
├── jest.config.js
└── playwright.config.ts
```

Command to create this structure (sample - actual implementation will use paths from config):

```javascript
const fs = require('fs-extra');
const path = require('path');
const config = require('./.test-config');

// Create base directory structure
const directories = [
  path.join(config.paths.appDir, config.paths.testDir, 'utils/scaffold-templates'),
  path.join(config.paths.appDir, config.paths.testDir, 'utils/helpers'),
  path.join(config.paths.appDir, config.paths.testDir, 'utils/reporting'),
  path.join(config.paths.appDir, config.paths.testDir, 'utils/server-manager/dashboard'),
  path.join(config.paths.appDir, config.paths.testDir, 'utils/data-factory/models'),
  path.join(config.paths.appDir, config.paths.testDir, 'utils/data-factory/fixtures'),
  path.join(config.paths.appDir, config.paths.testDir, 'utils/msw-handlers/endpoints'),
  path.join(config.paths.appDir, config.paths.testDir, 'utils/msw-handlers/responses'),
  path.join(config.paths.appDir, config.paths.testDir, 'smoke-tests'),
  path.join(config.paths.appDir, config.paths.testDir, 'unit-tests'),
  path.join(config.paths.appDir, config.paths.testDir, 'component-tests'),
  path.join(config.paths.appDir, config.paths.testDir, 'integration-tests'),
  path.join(config.paths.appDir, config.paths.testDir, 'qa-tests'),
  path.join(config.paths.appDir, config.paths.testDir, 'templates'),
  path.join(config.paths.appDir, config.paths.testDir, '.reports/screenshots'),
  path.join(config.paths.appDir, config.paths.testDir, '.reports/coverage'),
  path.join(config.paths.appDir, config.paths.testDir, '.reports/bug-reports'),
  path.join(config.paths.appDir, 'app/test-scaffold')
];

// Create each directory
directories.forEach(dir => {
  fs.ensureDirSync(dir);
  console.log(`Created directory: ${dir}`);
});
```

## Package Dependencies

**Responsible Agent: AI Coding Agent**

Add the following dependencies to your project:

```javascript
const dependencies = {
  'jest': '^29.7.0',
  '@testing-library/react': '^14.1.2',
  '@testing-library/jest-dom': '^6.1.5',
  '@types/jest': '^29.5.10',
  'jest-environment-jsdom': '^29.7.0',
  'identity-obj-proxy': '^3.0.0',
  '@playwright/test': '^1.40.0',
  'fs-extra': '^11.2.0',
  'msw': '^2.0.10',
  'express': '^4.18.2',
  'react': '^18.2.0',
  'react-dom': '^18.2.0',
  'commander': '^9.4.1',
  'faker': '^5.5.3',
  'chalk': '^4.1.2',
  'node-fetch': '^3.3.2'
};

// Installation command
console.log('Installing dependencies...');
// Package manager will install dependencies from this list
```

## Automated Installation Script

**Responsible Agent: AI Coding Agent**

File: `test/utils/install-test-environment.js`

The installation script is the central component for setting up the testing environment. It should be a Node.js script with the following functionality:

```javascript
#!/usr/bin/env node

/**
 * Testing System Installation Script
 * 
 * This script installs and configures the complete testing environment
 * with support for configuration and verification.
 */

const fs = require('fs-extra');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');
const { execSync } = require('child_process');

// Setup command-line interface
program
  .name('install-test-environment')
  .description('Install and configure the testing system')
  .option('--config <path>', 'path to configuration file', './.test-config.js')
  .option('--verbose', 'enable detailed logging', false)
  .option('--force', 'force reinstallation of all components', false)
  .parse(process.argv);

const options = program.opts();
const verbose = options.verbose;
const force = options.force;

// Setup logging
const logFile = path.join(process.cwd(), 'test', '.reports', 'install-log.txt');
fs.ensureFileSync(logFile);

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  // Log to console based on verbosity
  if (verbose || level !== 'debug') {
    const consoleMethod = level === 'error' ? 'error' : 'log';
    const color = level === 'error' ? chalk.red : 
                 level === 'warning' ? chalk.yellow : 
                 level === 'success' ? chalk.green : chalk.white;
    console[consoleMethod](color(logMessage));
  }
  
  // Always append to log file
  fs.appendFileSync(logFile, logMessage + '\n');
}

// Main installation process
async function main() {
  try {
    log(`Starting installation with config: ${options.config}`, 'info');
    
    // 1. Check environment and load configuration
    const nodeVersion = process.version;
    log(`Node.js version: ${nodeVersion}`, 'debug');
    
    if (!nodeVersion.startsWith('v16') && !nodeVersion.startsWith('v18') && !nodeVersion.startsWith('v20')) {
      log(`Warning: Recommended Node.js version is 16.x, 18.x, or 20.x. Current: ${nodeVersion}`, 'warning');
    }
    
    // Load or create configuration
    let config;
    try {
      if (fs.existsSync(options.config)) {
        log(`Loading configuration from ${options.config}`, 'debug');
        config = require(path.resolve(options.config));
      } else {
        log(`Configuration file not found, creating default config at ${options.config}`, 'info');
        const defaultConfig = {
          paths: {
            projectRoot: path.basename(process.cwd()),
            appDir: '.',
            testDir: 'test'
          },
          server: {
            port: 3333,
            dashboardPort: 3334
          },
          mockData: {
            defaultSeed: 123,
            defaultFixtures: ['users', 'products']
          }
        };
        
        fs.writeFileSync(
          path.resolve(options.config), 
          `module.exports = ${JSON.stringify(defaultConfig, null, 2)};`
        );
        config = defaultConfig;
      }
    } catch (error) {
      log(`Error loading configuration: ${error.message}`, 'error');
      throw new Error('Configuration error');
    }
    
    // 2. Create directory structure
    log('Creating directory structure...', 'info');
    // Implementation similar to the earlier directory creation code
    
    // 3. Install dependencies
    log('Installing dependencies...', 'info');
    // Implementation for npm/yarn dependencies installation
    
    // 4. Copy template files
    log('Copying template files...', 'info');
    // Implementation for copying template files
    
    // 5. Configure package.json scripts
    log('Updating package.json scripts...', 'info');
    // Implementation for updating package.json
    
    // 6. Generate initial mock data
    log('Generating initial mock data...', 'info');
    // Implementation for generating mock data
    
    // 7. Run verification tests
    log('Running verification tests...', 'info');
    // Implementation for verifying installation
    
    // 8. Generate installation report
    log('Generating installation report...', 'info');
    // Implementation for creating an installation report
    
    log('Installation completed successfully!', 'success');
  } catch (error) {
    log(`Installation failed: ${error.message}`, 'error');
    if (error.stack) {
      log(`Stack trace: ${error.stack}`, 'debug');
    }
    process.exit(1);
  }
}

// Run the installation
main();
```

### Command-Line Interface

The installation script supports the following command-line options:

- `--config <path>`: Specify the path to the configuration file (default: `./.test-config.js`)
- `--verbose`: Enable detailed logging for troubleshooting
- `--force`: Force reinstallation of all components, overwriting existing files

### Error Handling

The script includes robust error handling with:

1. **Detailed logging**: All actions are logged to both console and file
2. **Backup creation**: Backups of critical files before modification
3. **Rollback support**: Restoration of backups if installation fails
4. **Environment checks**: Validation of Node.js version and dependencies

### Package.json Integration

The script will add the following entries to the project's package.json:

```json
"scripts": {
  "test:setup": "node test/utils/install-test-environment.js",
  "test:server": "node test/utils/server-manager/start-server.js",
  "test:dashboard": "node test/utils/server-manager/start-dashboard.js",
  "test:generate-fixtures": "node test/utils/data-factory/generate-fixtures.js",
  "test:reset-fixtures": "rm -rf test/utils/data-factory/fixtures/* && npm run test:generate-fixtures",
  "test:verify": "node test/utils/verify-installation.js",
  "test:cleanup": "node test/utils/cleanup-servers.js",
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

## Verification Script

**Responsible Agent: AI Coding Agent**

File: `test/utils/verify-installation.js`

This companion script verifies that the installation completed successfully. It should check:

```javascript
#!/usr/bin/env node

/**
 * Testing System Verification Script
 * 
 * This script verifies that the testing environment is properly installed
 * and all components are working correctly.
 */

const fs = require('fs-extra');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');
const fetch = require('node-fetch');
const { execSync } = require('child_process');

// Setup command-line interface
program
  .name('verify-installation')
  .description('Verify the testing system installation')
  .option('--config <path>', 'path to configuration file', './.test-config.js')
  .option('--verbose', 'enable detailed logging', false)
  .parse(process.argv);

const options = program.opts();
const verbose = options.verbose;

// Setup logging
function log(message, level = 'info') {
  const consoleMethod = level === 'error' ? 'error' : 'log';
  const color = level === 'error' ? chalk.red : 
               level === 'warning' ? chalk.yellow : 
               level === 'success' ? chalk.green : chalk.white;
  console[consoleMethod](color(message));
}

// Main verification process
async function main() {
  let config;
  let allChecksPassed = true;
  
  log(chalk.bold('\n📋 Testing System Verification'));
  log(chalk.bold('==========================\n'));
  
  try {
    // 1. Check configuration
    log('🔍 Checking configuration...');
    try {
      if (fs.existsSync(options.config)) {
        config = require(path.resolve(options.config));
        log('✅ Configuration file found and loaded', 'success');
      } else {
        log('❌ Configuration file not found', 'error');
        allChecksPassed = false;
      }
    } catch (error) {
      log(`❌ Error loading configuration: ${error.message}`, 'error');
      allChecksPassed = false;
    }
    
    // 2. Check directory structure
    log('\n🔍 Checking directory structure...');
    const requiredDirs = [
      'test/utils/scaffold-templates',
      'test/utils/helpers',
      'test/utils/reporting',
      'test/utils/server-manager/dashboard',
      'test/utils/data-factory/models',
      'test/utils/data-factory/fixtures',
      'test/utils/msw-handlers/endpoints',
      'test/smoke-tests',
      'test/unit-tests',
      'test/component-tests',
      'test/integration-tests',
      'test/qa-tests',
      'test/.reports/screenshots',
      'test/.reports/coverage',
      'app/test-scaffold'
    ];
    
    let dirChecksPassed = true;
    for (const dir of requiredDirs) {
      // Adjust path based on config if available
      const directoryPath = config ? 
        path.join(config.paths.appDir, dir) : 
        path.join(process.cwd(), dir);
        
      if (fs.existsSync(directoryPath)) {
        if (verbose) log(`✅ Directory exists: ${dir}`, 'success');
      } else {
        log(`❌ Missing directory: ${dir}`, 'error');
        dirChecksPassed = false;
        allChecksPassed = false;
      }
    }
    
    if (dirChecksPassed) {
      log('✅ All required directories exist', 'success');
    }
    
    // 3. Check required files
    log('\n🔍 Checking required files...');
    const requiredFiles = [
      'test/utils/install-test-environment.js',
      'test/utils/server-manager/server-manager.js',
      'test/utils/server-manager/start-server.js',
      'test/utils/server-manager/dashboard/dashboard.js',
      'test/utils/data-factory/index.js',
      'test/utils/data-factory/models/user.js',
      'test/utils/msw-handlers/index.js',
      'jest.config.js',
      'playwright.config.ts'
    ];
    
    let fileChecksPassed = true;
    for (const file of requiredFiles) {
      // Adjust path based on config if available
      const filePath = config ? 
        path.join(config.paths.appDir, file) : 
        path.join(process.cwd(), file);
        
      if (fs.existsSync(filePath)) {
        if (verbose) log(`✅ File exists: ${file}`, 'success');
      } else {
        log(`❌ Missing file: ${file}`, 'error');
        fileChecksPassed = false;
        allChecksPassed = false;
      }
    }
    
    if (fileChecksPassed) {
      log('✅ All required files exist', 'success');
    }
    
    // 4. Run smoke tests
    log('\n🔍 Running smoke tests...');
    try {
      const jestResult = execSync('npx jest --testPathPattern=smoke-tests --silent', { 
        encoding: 'utf8',
        stdio: verbose ? 'inherit' : 'pipe'
      });
      
      if (!verbose) log('✅ Smoke tests passed', 'success');
    } catch (error) {
      log('❌ Smoke tests failed', 'error');
      if (verbose && error.stdout) {
        log(error.stdout);
      }
      allChecksPassed = false;
    }
    
    // 5. Test server (start, make request, stop)
    log('\n🔍 Testing server...');
    let serverProcess;
    try {
      // Start server in background
      serverProcess = require('child_process').spawn(
        'node', 
        [`${config?.paths?.appDir || '.'}/test/utils/server-manager/start-server.js`],
        { detached: true, stdio: 'ignore' }
      );
      
      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Make a request to server
      const port = config?.server?.port || 3333;
      const response = await fetch(`http://localhost:${port}/status`);
      
      if (response.ok) {
        const data = await response.json();
        log(`✅ Server is running on port ${port}`, 'success');
      } else {
        log(`❌ Server returned error status: ${response.status}`, 'error');
        allChecksPassed = false;
      }
    } catch (error) {
      log(`❌ Error testing server: ${error.message}`, 'error');
      allChecksPassed = false;
    } finally {
      // Cleanup server process
      if (serverProcess && serverProcess.pid) {
        try {
          process.kill(-serverProcess.pid, 'SIGINT');
        } catch (e) {
          if (verbose) log(`Note: Could not kill server process: ${e.message}`, 'warning');
        }
      }
    }
    
    // 6. Generate a verification report
    log('\n🔍 Generating verification report...');
    const reportPath = path.join(
      config?.paths?.appDir || '.', 
      'test/.reports/verification-report.html'
    );
    
    const report = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Testing System Verification Report</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 2rem; }
            .report { max-width: 800px; margin: 0 auto; }
            .success { color: green; }
            .error { color: red; }
            table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
            th, td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="report">
            <h1>Testing System Verification Report</h1>
            <p>Generated: ${new Date().toISOString()}</p>
            <h2>Overall Status: ${allChecksPassed ? '<span class="success">PASSED</span>' : '<span class="error">FAILED</span>'}</h2>
            
            <h3>Verification Details</h3>
            <!-- Detailed verification results would go here -->
            
            <p>For full details, see the installation log at <code>test/.reports/install-log.txt</code></p>
          </div>
        </body>
      </html>
    `;
    
    fs.writeFileSync(reportPath, report);
    log(`✅ Verification report generated at ${reportPath}`, 'success');
    
    // Final summary
    log('\n=========================');
    if (allChecksPassed) {
      log(chalk.bold.green('✅ ALL CHECKS PASSED'));
      log(chalk.green('The testing system is installed correctly and ready to use.'));
    } else {
      log(chalk.bold.red('❌ SOME CHECKS FAILED'));
      log(chalk.red('Please review the verification report and fix any issues.'));
      log(chalk.yellow('Tip: Run with --verbose for more detailed output.'));
    }
    log('=========================\n');
    
  } catch (error) {
    log(`Verification failed with error: ${error.message}`, 'error');
    if (error.stack) {
      log(`Stack trace: ${error.stack}`, 'debug');
    }
    process.exit(1);
  }
  
  // Exit with appropriate code
  process.exit(allChecksPassed ? 0 : 1);
}

// Run the verification
main();
```

## MSW Handlers Implementation

**Responsible Agent: AI Coding Agent**

The Mock Service Worker (MSW) handlers provide API mocking capabilities for tests. This is a critical component for testing components that make network requests.

### MSW Core Files

File: `test/utils/msw-handlers/index.js`

```javascript
/**
 * Main entry point for all MSW handlers
 */

// Import all endpoint handlers
const userHandlers = require('./endpoints/users');
const productHandlers = require('./endpoints/products');
const authHandlers = require('./endpoints/auth');
// Import other handler modules as needed

// Combine and export all handlers as a flat array
module.exports = [
  ...userHandlers,
  ...productHandlers,
  ...authHandlers,
  // Add other handlers
];
```

File: `test/utils/msw-handlers/browser.js`

```javascript
/**
 * MSW setup for browser environment
 */
const { setupWorker } = require('msw');
const handlers = require('./index');

// Setup MSW for browser environment
const worker = setupWorker(...handlers);

module.exports = { worker };
```

File: `test/utils/msw-handlers/node.js`

```javascript
/**
 * MSW setup for Node.js environment (Jest)
 */
const { setupServer } = require('msw/node');
const handlers = require('./index');

// Setup MSW for Node.js environment
const server = setupServer(...handlers);

module.exports = { server };
```

### Example API Endpoint Handlers

File: `test/utils/msw-handlers/endpoints/users.js`

```javascript
/**
 * MSW handlers for user-related API endpoints
 */
const { rest } = require('msw');
const { user } = require('../../data-factory');

// User API handlers
const userHandlers = [
  // GET /api/users - Returns list of users
  rest.get('/api/users', (req, res, ctx) => {
    const count = req.url.searchParams.get('limit') || 10;
    const users = Array.from({ length: parseInt(count) }, () => user());
    return res(ctx.status(200), ctx.json(users));
  }),
  
  // GET /api/users/:id - Returns a single user
  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(ctx.status(200), ctx.json(user({ id })));
  }),
  
  // POST /api/users - Creates a new user
  rest.post('/api/users', async (req, res, ctx) => {
    const userData = await req.json();
    return res(
      ctx.status(201),
      ctx.json(user({ ...userData, id: `new-${Date.now()}` }))
    );
  }),
  
  // PUT /api/users/:id - Updates a user
  rest.put('/api/users/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const userData = await req.json();
    return res(
      ctx.status(200),
      ctx.json(user({ ...userData, id }))
    );
  }),
  
  // DELETE /api/users/:id - Deletes a user
  rest.delete('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({ success: true, message: `User ${id} deleted` })
    );
  })
];

module.exports = userHandlers;
```

### Integration with Jest Setup

To integrate MSW with Jest, add the following to your Jest setup file:

File: `test/utils/helpers/jest-setup.js` (updated)

```javascript
import '@testing-library/jest-dom';
const { server } = require('../msw-handlers/node');

// Start MSW server before tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});

// Close server after all tests
afterAll(() => server.close());

// Add custom matchers if needed
expect.extend({
  // Custom matchers here
});
``` 