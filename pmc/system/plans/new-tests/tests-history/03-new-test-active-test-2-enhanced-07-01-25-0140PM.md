# T-2.5.5: CSS Implementation Strategy - Enhanced Testing Protocol

## Mission Statement
You shall execute comprehensive CSS-specific testing for T-2.5.5 implementation (reset.css, variables.css, base.css, breakpoints.css) to validate compilation, cascade behavior, theme switching, and responsive design functionality. CSS testing requires different validation strategies than component testing.

## Fix/Test/Analyze Cycle Pattern
For any failed validation step in ANY phase:
1. **Log Issue**: You must document the exact CSS error, line number, and browser console output
2. **Attempt Fix**: You shall apply CSS-specific corrections (syntax, specificity, cascade order)  
3. **Re-run Test**: Execute the failed CSS validation again with cache cleared
4. **Evaluate Results**: Check if CSS properly loads, variables resolve, and styles apply
5. **Update Artifacts**: Regenerate affected CSS test reports and visual comparisons
6. **Repeat**: Continue until success or 3 attempts maximum

## Test Approach
You must document your CSS-specific testing approach here, focusing on:
- How you will validate CSS compilation in Next.js build
- Your strategy for testing CSS custom property availability
- Methods for verifying theme switching without JavaScript
- Approach for responsive breakpoint validation

## Phase 0: CSS Testing Environment Setup

### Prerequisites
- You are in the pmc directory (default shell location)
- Node.js and npm are installed
- Next.js 14 project structure exists

### Actions

#### Step 0.1: Navigate to Application Directory
```bash
# PURPOSE: Navigate to aplio-modern-1 where CSS files and testing infrastructure exist
# CRITICAL: CSS files are located at aplio-modern-1/styles/globals/
cd ..
cd aplio-modern-1
```

#### Step 0.2: Create CSS Test Directory Structure
```bash
# PURPOSE: Create directories for CSS-specific testing artifacts
# SPECIFIC TO T-2.5.5: Includes directories for CSS validation reports
mkdir -p test/unit-tests/task-2-5/T-2.5.5
mkdir -p test/css-validation/T-2.5.5
mkdir -p test/theme-switching/T-2.5.5
mkdir -p test/responsive-tests/T-2.5.5
mkdir -p test/reports/css
```

#### Step 0.3: Verify CSS Files Exist
```bash
# PURPOSE: Confirm all four T-2.5.5 CSS files were created
# CRITICAL: These are the primary deliverables of T-2.5.5
ls -la styles/globals/reset.css styles/globals/variables.css styles/globals/base.css styles/globals/breakpoints.css
```

### Validation
- [ ] You have navigated to aplio-modern-1/ directory
- [ ] All CSS test directories are created
- [ ] All four CSS files confirmed to exist (reset.css, variables.css, base.css, breakpoints.css)

## Phase 1: CSS Discovery & Analysis

### Prerequisites
- CSS test environment setup complete
- All four CSS files exist in styles/globals/

### Actions

#### Step 1.1: Analyze CSS Implementation Structure
```bash
# PURPOSE: Document the CSS files and their purposes for testing
# You MUST create this discovery file with CSS-specific information

cat > ../pmc/system/plans/task-approach/current-test-discovery.md << 'EOF'
## T-2.5.5 CSS Implementation Discovery

### CSS Files Implemented
- **reset.css** (3.8KB): Modern CSS reset with accessibility features
  - Location: aplio-modern-1/styles/globals/reset.css
  - Testing focus: Box-sizing, margin/padding normalization, focus styles
  
- **variables.css** (8.2KB): CSS custom properties for light/dark themes  
  - Location: aplio-modern-1/styles/globals/variables.css
  - Testing focus: --aplio-* variable availability, theme switching
  
- **base.css** (10.1KB): Global typography and form styling
  - Location: aplio-modern-1/styles/globals/base.css
  - Testing focus: Typography scales, form elements, utility classes
  
- **breakpoints.css** (10.8KB): Responsive media query system
  - Location: aplio-modern-1/styles/globals/breakpoints.css
  - Testing focus: Breakpoint triggers, container widths, responsive utilities

### Testing Priority Classification
- **High Priority**: variables.css (critical for T-2.5.4 integration)
- **High Priority**: breakpoints.css (responsive behavior validation)
- **Medium Priority**: base.css (global styling foundation)
- **Medium Priority**: reset.css (browser normalization)

### CSS-Specific Testing Requirements
- No React component testing needed
- Focus on CSS compilation and cascade
- Validate computed styles in browser
- Test theme switching via class toggle
EOF
```

#### Step 1.2: Validate CSS Import Integration
```bash
# PURPOSE: Verify CSS files are properly imported in globals.css
# CRITICAL: Integration point for Next.js build system

grep -n "@import" app/globals.css | head -10
```

#### Step 1.3: Test CSS Compilation
```bash
# PURPOSE: Ensure all CSS files compile without errors
# You MUST check for any CSS syntax errors or warnings

npm run build 2>&1 | grep -E "error|Error|ERROR|warning|Warning|CSS" || echo "Build completed successfully"
```

### Validation
- [ ] CSS discovery documented in current-test-discovery.md
- [ ] All four CSS files confirmed imported in globals.css
- [ ] CSS compilation successful with no errors

## Phase 2: CSS Variable Testing

### Prerequisites
- CSS discovery complete
- Build process successful

### Actions

#### Step 2.1: Create CSS Variable Test File
```bash
# PURPOSE: Generate test to validate CSS custom property availability
# SPECIFIC TO T-2.5.5: Tests --aplio-* variables required by T-2.5.4

cat > test/unit-tests/task-2-5/T-2.5.5/css-variables.test.js << 'EOF'
const puppeteer = require('puppeteer');

describe('T-2.5.5 CSS Variables', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('CSS variables are available in computed styles', async () => {
    await page.goto('http://localhost:3000');
    
    const cssVariables = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      const variables = [
        '--aplio-button-primary-bg',
        '--aplio-card-bg',
        '--aplio-input-border',
        '--aplio-text-primary'
      ];
      
      const results = {};
      variables.forEach(varName => {
        results[varName] = styles.getPropertyValue(varName);
      });
      return results;
    });
    
    expect(cssVariables['--aplio-button-primary-bg']).toBeTruthy();
    expect(cssVariables['--aplio-card-bg']).toBeTruthy();
    expect(cssVariables['--aplio-input-border']).toBeTruthy();
    expect(cssVariables['--aplio-text-primary']).toBeTruthy();
  });
});
EOF
```

#### Step 2.2: Validate Critical CSS Variables
```bash
# PURPOSE: Manually verify key CSS variables for T-2.5.4 compatibility
# You MUST confirm these exact variables exist

echo "Checking button variables expected by T-2.5.4..."
grep -c "aplio-button" styles/globals/variables.css

echo "Checking card variables expected by T-2.5.4..."
grep -c "aplio-card" styles/globals/variables.css

echo "Checking input variables expected by T-2.5.4..."
grep -c "aplio-input" styles/globals/variables.css
```

### Validation
- [ ] CSS variable test file created
- [ ] Button variables confirmed (--aplio-button-*)
- [ ] Card variables confirmed (--aplio-card-*)
- [ ] Input variables confirmed (--aplio-input-*)

## Phase 3: Theme Switching Testing

### Prerequisites
- CSS variables validated
- Test server running on port 3000

### Actions

#### Step 3.1: Create Theme Switching Test
```bash
# PURPOSE: Test automatic CSS variable updates on theme change
# CRITICAL: Must work without JavaScript re-renders

cat > test/unit-tests/task-2-5/T-2.5.5/theme-switching.test.js << 'EOF'
describe('T-2.5.5 Theme Switching', () => {
  test('CSS variables update when dark class is added', async () => {
    await page.goto('http://localhost:3000');
    
    // Get light theme values
    const lightValues = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return {
        buttonBg: styles.getPropertyValue('--aplio-button-primary-bg'),
        textColor: styles.getPropertyValue('--aplio-text-primary')
      };
    });
    
    // Add dark class
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    // Get dark theme values
    const darkValues = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return {
        buttonBg: styles.getPropertyValue('--aplio-button-primary-bg'),
        textColor: styles.getPropertyValue('--aplio-text-primary')
      };
    });
    
    // Values should be different
    expect(lightValues.buttonBg).not.toBe(darkValues.buttonBg);
    expect(lightValues.textColor).not.toBe(darkValues.textColor);
  });
});
EOF
```

#### Step 3.2: Validate Theme Variable Sets
```bash
# PURPOSE: Confirm both light and dark theme variables exist
# You MUST verify complete theme coverage

echo "Light theme root variables:"
grep -c ":root," styles/globals/variables.css

echo "Dark theme root variables:"
grep -c ":root.dark" styles/globals/variables.css
```

### Validation
- [ ] Theme switching test created
- [ ] Light theme variables confirmed
- [ ] Dark theme variables confirmed
- [ ] Theme switching works without JavaScript

## Phase 4: Responsive Breakpoint Testing

### Prerequisites
- Theme testing complete
- Playwright available for viewport testing

### Actions

#### Step 4.1: Create Responsive Test Suite
```bash
# PURPOSE: Test all seven breakpoints defined in T-2.5.5
# SPECIFIC: xs:475px, sm:640px, md:768px, lg:1024px, xl:1280px, 1xl:1400px, 2xl:1536px

cat > test/unit-tests/task-2-5/T-2.5.5/responsive-behavior.test.js << 'EOF'
const breakpoints = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '1xl': 1400,
  '2xl': 1536
};

describe('T-2.5.5 Responsive Breakpoints', () => {
  Object.entries(breakpoints).forEach(([name, width]) => {
    test(`${name} breakpoint (${width}px) applies correct styles`, async () => {
      await page.setViewport({ width, height: 800 });
      await page.goto('http://localhost:3000');
      
      const containerWidth = await page.evaluate(() => {
        const container = document.querySelector('.container');
        return container ? getComputedStyle(container).maxWidth : null;
      });
      
      expect(containerWidth).toBeTruthy();
      console.log(`${name} container width: ${containerWidth}`);
    });
  });
});
EOF
```

#### Step 4.2: Validate Media Query Definitions
```bash
# PURPOSE: Confirm all breakpoints are defined in CSS
# You MUST check each breakpoint from legacy config

echo "Checking breakpoint definitions..."
grep -E "@media.*\(min-width: (475|640|768|1024|1280|1400|1536)px\)" styles/globals/breakpoints.css | wc -l
```

### Validation
- [ ] Responsive test suite created
- [ ] All 7 breakpoints defined in CSS
- [ ] Container system responsive
- [ ] Touch optimizations included

## Phase 5: Visual CSS Validation

### Prerequisites
- All CSS tests created
- Development server running

### Actions

#### Step 5.1: Generate CSS Test Page
```bash
# PURPOSE: Create visual test page for CSS validation
# You MUST include elements that use all CSS features

cat > app/test-css-t255.tsx << 'EOF'
export default function TestCSST255() {
  return (
    <div className="container">
      <h1>T-2.5.5 CSS Test Page</h1>
      
      {/* Test Typography from base.css */}
      <section>
        <h2>Typography Test</h2>
        <p>Regular paragraph text</p>
        <small>Small text</small>
      </section>
      
      {/* Test Form Styles from base.css */}
      <section>
        <h2>Form Elements</h2>
        <input type="text" placeholder="Test input" />
        <button>Test Button</button>
      </section>
      
      {/* Test Utility Classes */}
      <section>
        <div className="text-primary">Primary text color</div>
        <div className="bg-secondary">Secondary background</div>
      </section>
      
      {/* Test Theme Switching */}
      <button onClick={() => document.documentElement.classList.toggle('dark')}>
        Toggle Theme
      </button>
    </div>
  );
}
EOF
```

#### Step 5.2: Capture CSS Visual Evidence
```bash
# PURPOSE: Document CSS rendering for validation
# You SHALL capture before/after theme switching

npm run dev &
sleep 5

echo "Visual validation instructions:"
echo "1. Navigate to http://localhost:3000/test-css-t255"
echo "2. Verify typography scales use CSS variables"
echo "3. Test theme toggle button"
echo "4. Resize browser to test breakpoints"
echo "5. Check focus styles on interactive elements"
```

### Validation
- [ ] CSS test page created
- [ ] Typography renders with CSS variables
- [ ] Form elements styled correctly
- [ ] Theme switching visual confirmation
- [ ] Responsive behavior at breakpoints

## Phase 6: DSAP Compliance Validation

### Prerequisites
- All CSS testing phases complete
- DSAP specifications reviewed

### Actions

#### Step 6.1: Validate Button Specifications
```bash
# PURPOSE: Confirm exact DSAP button requirements met
# CRITICAL: 30px padding, 30px border radius required

echo "Checking DSAP button specifications..."
grep "aplio-button-padding-x: 30px" styles/globals/variables.css
grep "aplio-button-border-radius: 30px" styles/globals/variables.css
```

#### Step 6.2: Generate CSS Compliance Report
```bash
# PURPOSE: Document DSAP compliance for CSS implementation
# You MUST verify all specifications are met

cat > test/reports/css/T-2.5.5-dsap-compliance.md << 'EOF'
# T-2.5.5 CSS DSAP Compliance Report

## Button Specifications
- ✅ Padding: 30px horizontal (--aplio-button-padding-x: 30px)
- ✅ Border Radius: 30px (--aplio-button-border-radius: 30px)
- ✅ Transition: 500ms (--aplio-button-transition: all 500ms ease)

## Color Specifications
- ✅ Primary button bg: #18181B (light) / #B1E346 (dark)
- ✅ Text colors: Theme-reactive with CSS variables

## Responsive Specifications
- ✅ All legacy breakpoints preserved
- ✅ Touch-friendly adjustments on mobile

## Accessibility
- ✅ Focus ring: 2px solid with CSS variable color
- ✅ Reduced motion support included
- ✅ High contrast mode support

Date: $(date)
EOF
```

### Validation
- [ ] DSAP button specs verified (30px/30px)
- [ ] Color specifications match exactly
- [ ] Accessibility features confirmed
- [ ] Compliance report generated

## Success Criteria & Final Validation

### CSS Implementation Requirements
You MUST verify all four files meet their specific requirements:
- **reset.css**: Browser normalization, accessibility, legacy compatibility
- **variables.css**: Complete --aplio-* coverage, theme reactivity
- **base.css**: Typography foundation, form styling, utilities
- **breakpoints.css**: Seven breakpoints, responsive containers

### Testing Quality Gates
You SHALL confirm each gate before proceeding:
- **Phase 0**: CSS files exist and are imported correctly
- **Phase 1**: CSS compiles without errors
- **Phase 2**: All CSS variables available in computed styles
- **Phase 3**: Theme switching updates variables instantly
- **Phase 4**: Breakpoints trigger at correct widths
- **Phase 5**: Visual rendering matches specifications
- **Phase 6**: DSAP compliance fully validated

### Final Deliverables
You MUST generate these artifacts:
- CSS variable test results
- Theme switching validation
- Responsive behavior tests
- DSAP compliance report
- Visual test page at /test-css-t255

## Human Verification Checklist

You SHALL instruct the human to verify:
- [ ] CSS variables resolve in browser DevTools
- [ ] Theme switching is instantaneous (<100ms)
- [ ] Responsive breakpoints match legacy config
- [ ] Focus styles meet accessibility standards
- [ ] Integration with T-2.5.4 composition system works

**CRITICAL**: CSS testing is fundamentally different from component testing. You MUST NOT attempt to test CSS files as React components. Focus on compilation, cascade, computed styles, and visual output.
