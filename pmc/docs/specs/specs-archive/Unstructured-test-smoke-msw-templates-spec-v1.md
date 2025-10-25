# Template Files and Smoke Test Specification

## 1. Template Files

The installation script will copy several template files to bootstrap the testing environment. Here's a detailed breakdown of these files:

### Configuration Templates

```
templates/
├── config/
│   ├── jest.config.js         // Jest configuration
│   ├── playwright.config.ts   // Playwright configuration
│   ├── tsconfig.test.json     // TypeScript configuration for tests
│   └── babel.test.js          // Babel configuration for tests
```

### Test Scaffold Templates

```
templates/
├── scaffolds/
│   ├── unit-test.template.tsx        // Basic unit test template
│   ├── component-test.template.tsx   // Component test template
│   ├── visual-test.template.tsx      // Visual test template
│   └── integration-test.template.tsx // Integration test template
```

### Server Templates

```
templates/
├── server/
│   ├── server-manager.template.js    // Server manager implementation
│   ├── dashboard.template.js         // Dashboard implementation
│   ├── static/                       // Static assets for test server
│   │   ├── styles.css                // Default styling for test pages
│   │   ├── test-scaffold.css         // Styling for test scaffolds
│   │   └── dashboard.css             // Dashboard styling
│   └── templates/                    // HTML templates
│       ├── component-scaffold.html   // Template for component testing
│       └── dashboard.html            // Dashboard HTML template
```

### Mock Data Templates

```
templates/
├── data-factory/
│   ├── index.template.js             // Main factory export template
│   ├── models/                       // Model factory templates
│   │   ├── user.template.js          // User model template
│   │   └── product.template.js       // Product model template
│   └── generators.template.js        // Custom generators template
```

### MSW Handler Templates

```
templates/
├── msw-handlers/
│   ├── index.template.js             // Combined handlers export
│   ├── browser.template.js           // Browser setup
│   ├── node.template.js              // Node.js setup
│   └── endpoints/                    // Endpoint handler templates
│       ├── users.template.js         // User API handlers
│       └── products.template.js      // Product API handlers
```

### Helper Templates

```
templates/
├── helpers/
│   ├── jest-setup.template.js        // Jest setup file
│   ├── file-mock.template.js         // File mock for Jest
│   ├── style-mock.template.js        // Style mock for Jest
│   └── test-utils.template.js        // Common test utilities
```

### Report Templates

```
templates/
├── reporting/
│   ├── custom-reporter.template.js   // Custom Jest reporter
│   ├── report-template.html          // HTML report template
│   └── markdown-template.md          // Markdown report template
```

## 2. Smoke Test Details

The "simple smoke test" in the verification script should verify that all core testing functionality works properly. Here's what it should include:

### Component Rendering Test

```javascript
// smoke-tests/component-render.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple test component
const TestButton = ({ label = 'Click me' }) => (
  <button data-testid="test-button">{label}</button>
);

describe('Smoke Test: Component Rendering', () => {
  test('renders a simple component', () => {
    render(<TestButton label="Test Button" />);
    const buttonElement = screen.getByTestId('test-button');
    
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveTextContent('Test Button');
  });
});
```

### Server Functionality Test

```javascript
// smoke-tests/server.test.js
const fetch = require('node-fetch');
const serverManager = require('../utils/server-manager');

describe('Smoke Test: Server Manager', () => {
  let port;
  
  beforeAll(async () => {
    // Start the server
    port = await serverManager.start();
  });
  
  afterAll(() => {
    // Stop the server
    serverManager.stop();
  });
  
  test('server responds to status endpoint', async () => {
    const response = await fetch(`http://localhost:${port}/status`);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('running', true);
    expect(data).toHaveProperty('port', port);
  });
});
```

### Mock Data Generation Test

```javascript
// smoke-tests/mock-data.test.js
const { user, product, resetSeed } = require('../utils/data-factory');

describe('Smoke Test: Mock Data Factory', () => {
  beforeEach(() => {
    // Reset seed for consistent tests
    resetSeed(123);
  });
  
  test('generates user data', () => {
    const testUser = user();
    
    expect(testUser).toHaveProperty('id');
    expect(testUser).toHaveProperty('firstName');
    expect(testUser).toHaveProperty('lastName');
    expect(testUser).toHaveProperty('email');
  });
  
  test('generates product data', () => {
    const testProduct = product();
    
    expect(testProduct).toHaveProperty('id');
    expect(testProduct).toHaveProperty('name');
    expect(testProduct).toHaveProperty('price');
  });
  
  test('supports overrides', () => {
    const customUser = user({ firstName: 'Custom', role: 'admin' });
    
    expect(customUser.firstName).toBe('Custom');
    expect(customUser.role).toBe('admin');
  });
});
```

### MSW API Mocking Test

```javascript
// smoke-tests/msw.test.js
import { rest } from 'msw';
import { server } from '../utils/msw-handlers/node';
import { user } from '../utils/data-factory';

describe('Smoke Test: MSW Handlers', () => {
  test('intercepts API requests', async () => {
    // Custom handler for this test
    server.use(
      rest.get('/api/test-endpoint', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({ success: true, message: 'MSW is working!' })
        );
      })
    );
    
    // Make the request
    const response = await fetch('/api/test-endpoint');
    const data = await response.json();
    
    expect(data.success).toBe(true);
    expect(data.message).toBe('MSW is working!');
  });
  
  test('works with data factory', async () => {
    // Use data factory with MSW
    const testUser = user({ name: 'Test User' });
    
    server.use(
      rest.get('/api/users/current', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(testUser));
      })
    );
    
    const response = await fetch('/api/users/current');
    const data = await response.json();
    
    expect(data.name).toBe('Test User');
  });
});
```

### End-to-End Workflow Test

```javascript
// smoke-tests/workflow.test.js
const { runTaskTests } = require('../utils/test-runner');

describe('Smoke Test: Full Workflow', () => {
  test('executes test runner workflow', async () => {
    // Create a mock task ID
    const taskId = 'T-0.0.1';
    
    // Execute test runner
    const results = await runTaskTests({
      taskId,
      testType: 'unit',
      visual: false
    });
    
    // Verify test execution
    expect(results).toHaveProperty('success');
    expect(results).toHaveProperty('taskId', taskId);
    expect(results).toHaveProperty('jestResults');
  });
});
```

### Reporting Test

```javascript
// smoke-tests/reporting.test.js
const fs = require('fs-extra');
const path = require('path');
const { generateTaskReport } = require('../utils/reporting');

describe('Smoke Test: Reporting', () => {
  test('generates test reports', async () => {
    // Mock test results
    const mockResults = {
      numTotalTests: 5,
      numPassedTests: 4,
      numFailedTests: 1,
      testResults: [
        {
          testFilePath: 'test/unit-tests/example.test.js',
          testResults: [
            {
              title: 'failed test example',
              status: 'failed',
              failureMessages: ['Expected true to be false']
            }
          ]
        }
      ]
    };
    
    // Generate report
    const reportPath = await generateTaskReport('T-0.0.1', { results: mockResults }, null);
    
    // Verify report was created
    expect(fs.existsSync(reportPath)).toBe(true);
    
    // Check report content
    const reportContent = fs.readFileSync(reportPath, 'utf8');
    expect(reportContent).toContain('Test Report: T-0.0.1');
    expect(reportContent).toContain('failed test example');
  });
});
```

The verification script will run these smoke tests as part of the installation verification process to ensure all components of the testing infrastructure are functioning correctly.


# MSW Handlers Directory Specification

## Purpose

The `msw-handlers/` directory serves as a central location for organizing Mock Service Worker (MSW) request handlers. These handlers intercept network requests during tests and return mock responses, eliminating the need for a real backend during testing.

## Contents and Structure

```
test/utils/msw-handlers/
├── index.js                 // Main export of all handlers
├── browser.js               // Browser-specific setup
├── node.js                  // Node.js-specific setup
├── endpoints/               // Organized by API endpoint
│   ├── users.js             // User API handlers
│   ├── products.js          // Product API handlers
│   ├── auth.js              // Authentication API handlers
│   └── ...                  // Other API endpoint handlers
└── responses/               // Pre-defined responses (optional)
    ├── success.js           // Standard success responses
    ├── errors.js            // Standard error responses
    └── loading-states.js    // Responses for testing loading states
```

## Key Files

### 1. `index.js`

The main entry point that combines and exports all API handlers:

```javascript
// Combine all handlers for easy import
const userHandlers = require('./endpoints/users');
const productHandlers = require('./endpoints/products');
const authHandlers = require('./endpoints/auth');
// Import other handler modules

// Export all handlers as a flat array
module.exports = [
  ...userHandlers,
  ...productHandlers,
  ...authHandlers,
  // Add other handlers
];
```

### 2. `browser.js` and `node.js`

Environment-specific setup files:

```javascript
// browser.js - For browser environment
const { setupWorker } = require('msw');
const handlers = require('./index');

// Setup MSW for browser environment
const worker = setupWorker(...handlers);

module.exports = { worker };
```

```javascript
// node.js - For Node.js environment (Jest)
const { setupServer } = require('msw/node');
const handlers = require('./index');

// Setup MSW for Node.js environment
const server = setupServer(...handlers);

module.exports = { server };
```

### 3. API Endpoint Handlers

Organized by API endpoint type:

```javascript
// endpoints/users.js
const { rest } = require('msw');
const { user } = require('../../data-factory');

// User API handlers
const userHandlers = [
  // GET /api/users - Returns list of users
  rest.get('/api/users', (req, res, ctx) => {
    const count = req.url.searchParams.get('limit') || 10;
    const users = user.createMany(user, parseInt(count));
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
  
  // Other user endpoints (PUT, DELETE, etc.)
];

module.exports = userHandlers;
```

## Integration with Testing

The MSW handlers integrate directly with the test environment:

1. **Jest Setup**:
```javascript
// test/utils/helpers/jest-setup.js
const { server } = require('../msw-handlers/node');

// Start MSW server before tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());
```

2. **Component Test Usage**:
```javascript
// Example component test
import { render, screen } from '@testing-library/react';
import UserList from '../components/UserList';
import { server } from '../utils/msw-handlers/node';
import { rest } from 'msw';
import { user } from '../utils/data-factory';

test('renders custom user list', async () => {
  // Override default handler for this specific test
  server.use(
    rest.get('/api/users', (req, res, ctx) => {
      return res(ctx.json([
        user({ firstName: 'Test', lastName: 'User' }),
        user({ firstName: 'Another', lastName: 'Tester' })
      ]));
    })
  );
  
  render(<UserList />);
  
  // Assert that the list renders with our custom users
  expect(await screen.findByText('Test User')).toBeInTheDocument();
  expect(await screen.findByText('Another Tester')).toBeInTheDocument();
});
```

This structure ensures mock API responses are:
1. **Organized** - By API endpoint for easy maintenance
2. **Consistent** - Using the data factory for realistic data
3. **Flexible** - Easily overridden for specific test cases
4. **Reusable** - Available in both browser and Node.js environments

The `msw-handlers/` directory is a crucial part of the testing infrastructure, providing the connection between mock data and component tests by simulating real API behavior.