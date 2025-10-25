# Enhanced Unit Tests for T-2.2.4: Hero Section Component Visual Documentation

## Table of Contents
1. [Overview](#overview)
2. [Test Environment Setup](#test-environment-setup)
3. [Test Planning Workpad](#test-planning-workpad)
4. [Element Tests](#element-tests)
   - [T-2.2.4:ELE-1](#t-224ele-1)
   - [T-2.2.4:ELE-2](#t-224ele-2)
   - [T-2.2.4:ELE-3](#t-224ele-3)
   - [T-2.2.4:ELE-4](#t-224ele-4)
5. [Coverage Reporting](#coverage-reporting)
6. [Test Result Summary](#test-result-summary)

## Overview
This file contains testing instructions for task T-2.2.4 using the new AI-driven testing system. 
Do NOT begin testing until you have completed all implementation steps in the active task file.

- **Implementation Location**: `aplio-modern-1/design-system/docs/components/sections/hero/`
- **Test Location**: `aplio-modern-1/test/unit-tests/task-2-2/T-2.2.4/`
- **Testing Tools**: Jest, Testing Library, Managed Test Server, Visual Regression
- **Coverage Requirements**: 90% code coverage

### Acceptance Criteria
The following criteria define successful task completion and should be used to verify test coverage:

- Document hero section layout structure and content placement
- Document hero typography styles, scales, and hierarchy
- Document background handling including images, gradients, and overlays
- Document responsive behavior and layout changes at different breakpoints

**Testing Directive**: Ensure your tests explicitly verify each of these acceptance criteria. When creating test cases, map them to specific criteria and check that all criteria are covered by at least one test.

## Test Environment Setup
Before creating or running tests, ensure the testing environment is ready:

1. **Verify Installation**:
   ```bash
   node aplio-modern-1/test/utils/verify-installation.js
   ```
   
2. **Start the Test Server**:
   ```bash
   npm run test:server
   ```
   
3. **Start the Dashboard** (in a separate terminal):
   ```bash
   npm run test:dashboard
   ```

4. **Create Task-Specific Test Directory**:
   ```bash
   mkdir -p aplio-modern-1/test/unit-tests/task-2-2/T-2.2.4
   ```

5. **Test Failure Strategy**:
   - Document all test failures in the dashboard
   - For each failure, implement fixes in the corresponding implementation file
   - Rerun failed tests until they pass
   - If a test cannot be fixed after 3 attempts, document the issue in the test reports

## Test Planning Workpad

As you develop and execute tests for this task, you may use the test scaffolding system to create test templates:

```javascript
// Example scaffold creation
import { scaffoldGenerator } from '../../../../utils/helpers/scaffold-generator';

const heroTestScaffold = scaffoldGenerator.createStaticScaffold({
  componentName: 'HeroSection',
  variant: 'centered',
  props: { 
    title: 'Hero Title',
    subtitle: 'Hero subtitle text',
    backgroundType: 'image'
  }
});
```

## Element Tests
### T-2.2.4:ELE-1
**Description**: Hero section layout documentation: Document the layout structure and content placement

**Test Implementation**:

1. **Create Test Scaffold**:
   ```javascript
   // hero-layouts.test.js
   import { render, screen } from '@testing-library/react';
   import { scaffoldGenerator } from '../../../../utils/helpers/scaffold-generator';
   import { serverManager } from '../../../../utils/server-manager/server-manager';
   import HeroDocumentation from '../../../../../design-system/docs/components/sections/hero/HeroLayout';
   
   describe('Hero Layout Documentation', () => {
     beforeEach(() => {
       // Reset any test state
     });
     
     test('documents centered layout variant', () => {
       const scaffold = scaffoldGenerator.createStaticScaffold({
         componentName: 'HeroSection',
         variant: 'centered',
       });
       
       render(<HeroDocumentation />);
       expect(screen.getByText(/centered layout/i)).toBeInTheDocument();
       
       // Register test with server for visual validation
       serverManager.registerTest({
         id: 'hero-centered-layout',
         component: scaffold,
         snapshot: true
       });
     });
     
     // Additional tests for split and full-width variants
   });
   ```

2. **Register Test with Server**:
   The `serverManager.registerTest()` call will make the component available for visual inspection at:
   `http://localhost:3333/test/task-2-2/T-2.2.4/hero-centered-layout`

3. **Run Test**:
   ```bash
   npm run test:unit -- --testPathPattern=T-2.2.4/hero-layouts.test.js
   ```

4. **View Results**:
   - Check test results in the terminal
   - Check visual results in the test server
   - Check report in the dashboard at `http://localhost:3334/status`

### T-2.2.4:ELE-2
**Description**: Hero typography documentation: Document heading, subheading, and CTA text styles

**Test Implementation**:

1. **Create Typography Tests**:
   ```javascript
   // hero-typography.test.js
   import { render, screen } from '@testing-library/react';
   import { scaffoldGenerator } from '../../../../utils/helpers/scaffold-generator';
   import { serverManager } from '../../../../utils/server-manager/server-manager';
   import TypographyDocumentation from '../../../../../design-system/docs/components/sections/hero/Typography';
   
   describe('Hero Typography Documentation', () => {
     test('documents heading typography styles', () => {
       const scaffold = scaffoldGenerator.createStaticScaffold({
         componentName: 'HeroTypography',
         variant: 'heading',
       });
       
       render(<TypographyDocumentation />);
       expect(screen.getByText(/heading styles/i)).toBeInTheDocument();
       
       serverManager.registerTest({
         id: 'hero-heading-typography',
         component: scaffold,
         snapshot: true
       });
     });
     
     // Additional tests for subheading and CTA text styles
   });
   ```

2. **Run Tests**:
   ```bash
   npm run test:unit -- --testPathPattern=T-2.2.4/hero-typography.test.js
   ```

### T-2.2.4:ELE-3
**Description**: Hero section responsive behavior: Document layout changes at different breakpoints

**Test Implementation**:

1. **Create Responsive Tests**:
   ```javascript
   // responsive-layout.test.js
   import { render, screen } from '@testing-library/react';
   import { scaffoldGenerator } from '../../../../utils/helpers/scaffold-generator';
   import { serverManager } from '../../../../utils/server-manager/server-manager';
   import ResponsiveDocumentation from '../../../../../design-system/docs/components/sections/hero/Responsive';
   
   describe('Hero Responsive Documentation', () => {
     test('documents mobile breakpoint behavior', () => {
       const scaffold = scaffoldGenerator.createResponsiveScaffold({
         componentName: 'HeroSection',
         viewport: 'mobile',
         width: 375,
       });
       
       render(<ResponsiveDocumentation />);
       expect(screen.getByText(/mobile layout/i)).toBeInTheDocument();
       
       serverManager.registerTest({
         id: 'hero-mobile-responsive',
         component: scaffold,
         snapshot: true,
         viewport: { width: 375, height: 667 }
       });
     });
     
     // Additional tests for tablet and desktop breakpoints
   });
   ```

2. **Run Tests**:
   ```bash
   npm run test:unit -- --testPathPattern=T-2.2.4/responsive-layout.test.js
   ```

### T-2.2.4:ELE-4
**Description**: Hero section background options: Document background handling including images, gradients, and overlays

**Test Implementation**:

1. **Create Background Tests**:
   ```javascript
   // background-options.test.js
   import { render, screen } from '@testing-library/react';
   import { scaffoldGenerator } from '../../../../utils/helpers/scaffold-generator';
   import { serverManager } from '../../../../utils/server-manager/server-manager';
   import BackgroundDocumentation from '../../../../../design-system/docs/components/sections/hero/Background';
   
   describe('Hero Background Documentation', () => {
     test('documents image background options', () => {
       const scaffold = scaffoldGenerator.createStaticScaffold({
         componentName: 'HeroBackground',
         variant: 'image',
         props: {
           imageSrc: '/path/to/test/image.jpg',
           overlay: true,
           overlayOpacity: 0.5
         }
       });
       
       render(<BackgroundDocumentation />);
       expect(screen.getByText(/image background/i)).toBeInTheDocument();
       
       serverManager.registerTest({
         id: 'hero-image-background',
         component: scaffold,
         snapshot: true
       });
     });
     
     // Additional tests for gradient and solid backgrounds
   });
   ```

2. **Run Tests**:
   ```bash
   npm run test:unit -- --testPathPattern=T-2.2.4/background-options.test.js
   ```

## Coverage Reporting
After running all tests with coverage:

1. **Generate Coverage Report**:
   ```bash
   npm run test:unit -- --coverage --collectCoverageFrom="design-system/docs/components/sections/hero/**/*.{js,jsx,ts,tsx}"
   ```

2. **View Coverage Report**:
   - Check terminal output for coverage percentages
   - Check dashboard for visual coverage report: `http://localhost:3334/coverage`
   - View detailed HTML report in `aplio-modern-1/test/.reports/coverage/lcov-report/index.html`

3. **Document Coverage Results**:
   Create a file at `aplio-modern-1/test/unit-tests/task-2-2/T-2.2.4/test-T-2.2.4-coverage.md` with:
   - Overall coverage percentage
   - Coverage by element
   - Areas needing additional coverage

## Test Result Summary
- [ ] All tests have been executed
- [ ] All tests have passed
- [ ] Coverage requirements have been met
- [ ] Test failures have been documented and addressed
- [ ] Test results have been registered with the test server

When all tests are complete:
1. Generate a final test report: `npm run test:report -- --task=T-2.2.4`
2. Notify the human operator that all tests are complete
3. Provide the dashboard URL for reviewing results: `http://localhost:3334/status`
