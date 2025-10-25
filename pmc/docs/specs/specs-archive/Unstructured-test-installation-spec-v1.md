# Testing Application Installation Script Specification

## Overview

This document specifies the requirements for the installation script that will set up the entire testing environment. The script will automate the installation process, configure all necessary components, and provide verification steps to ensure successful setup.

## Installation Script Requirements

### 1. Configuration File

The script must use a configuration file (.test-config.js) with the following characteristics:

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

### 2. Script Functionality

The installation script (`install-test-environment.js`) must:

- Check for and create the configuration file if it doesn't exist
- Read the configuration to determine installation locations
- Install all required npm packages
- Create the directory structure for tests
- Copy template files to the appropriate locations
- Generate initial mock data fixtures
- Set up the test server
- Verify the installation with status checks
- Generate a detailed installation report

### 3. Directory Structure

The script must create this structure:

```
refactored-and-new-code-product/ (appDir)
├── node_modules/            (Dependencies)
├── test/                    (testDir)
│   ├── utils/               (Testing utilities)
│   │   ├── scaffold-templates/
│   │   ├── server-manager/
│   │   ├── data-factory/
│   │   ├── helpers/
│   │   ├── reporting/
│   │   └── msw-handlers/
│   ├── unit-tests/
│   ├── component-tests/
│   ├── integration-tests/
│   ├── qa-tests/
│   ├── fixtures/           (Generated mock data)
│   └── .reports/           (Test reports output)
├── jest.config.js
└── playwright.config.ts
```

### 4. Implementation Requirements

1. **Command-Line Interface**:
   - Support for `--config` parameter to specify config location
   - Support for `--verbose` flag for detailed logging
   - Support for `--force` flag to reinstall everything

2. **Environment Detection**:
   - Detect Node.js version and warn if incompatible
   - Check for existing test installations
   - Verify VS Code project structure

3. **Dependency Management**:
   - Install all required npm packages
   - Use package.json for consistent versioning
   - Handle duplicate installations gracefully

4. **Error Handling**:
   - Provide clear error messages for common issues
   - Create backups before modifying existing files
   - Support rollback for failed installations
   - Log all actions to an install-log.txt file

### 5. Post-Installation Verification

After installation, the script must verify:
- All required directories exist
- Configuration files are properly created
- Test server starts correctly
- Mock data can be generated
- Basic tests can be executed

## Package.json Integration

The script must add these entries to package.json:

```json
"scripts": {
  "test:setup": "node test/utils/install-test-environment.js",
  "test:server": "node test/utils/server-manager/start-server.js",
  "test:dashboard": "node test/utils/server-manager/start-dashboard.js",
  "test:mock-data": "node test/utils/data-factory/generate-fixtures.js",
  "test:verify": "node test/utils/verify-installation.js"
}
```

## Verification Script

A companion verification script (`verify-installation.js`) must:
1. Check all directory structures
2. Verify all required files exist
3. Test the server by starting it and making a request
4. Test mock data generation
5. Run a simple smoke test
6. Generate a verification report

## Usage Instructions

The script must output clear usage instructions after installation, including:
1. How to start the test server
2. How to access the dashboard
3. How to generate mock data
4. How to run different types of tests
5. Where to find test reports

This specification provides the comprehensive details needed for the AI coding agent to implement a robust installation script that will properly set up the entire testing environment according to all requirements.