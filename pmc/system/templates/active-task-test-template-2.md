# {{TASK_ID}}: {{TASK_TITLE}} - Enhanced Testing Protocol

## Mission Statement
Execute complete testing cycle from environment setup through visual validation with LLM Vision analysis to ensure {{TASK_ID}} components ({{DISCOVERED_COMPONENTS}}) are properly implemented, styled, and functioning with {{COMPONENT_CLASSIFICATION_DESCRIPTION}}.

## Fix/Test/Analyze Cycle Pattern
For any failed validation step in ANY phase:
1. **Log Issue**: Document failure details and error messages
2. **Attempt Fix**: Apply automated correction if possible  
3. **Re-run Test**: Execute the failed step again
4. **Evaluate Results**: Check if issue is resolved
5. **Update Artifacts**: Regenerate affected files (scaffolds, screenshots, reports)
6. **Repeat**: Continue until success or maximum iterations reached (default: 3 attempts)

## Test Approach
<!-- After reading the test requirements, describe your execution approach here -->
(To be filled in by the testing agent)

## Phase 0: Pre-Testing Environment Setup

### Prerequisites
- You are in the project root directory
- You have npm and Node.js installed
- Git bash or equivalent terminal access

### Actions

#### Step 0.1: Navigate to Application Directory
```bash
# PURPOSE: Navigate from pmc directory to aplio-modern-1 application directory where testing infrastructure exists
# WHEN: Execute this as the first step before any testing operations
# PREREQUISITES: You are currently in pmc directory (default shell location)
# EXPECTED OUTCOME: You will be in aplio-modern-1/ directory with access to test/ subdirectory
# FAILURE HANDLING: If directory doesn't exist, verify you're in the correct project structure

cd ..
cd aplio-modern-1
```

#### Step 0.2: Create Test Directory Structure
```bash
# PURPOSE: Create the complete directory structure required for {{TASK_ID}} testing artifacts
# WHEN: Run this before any testing phases to ensure all output directories exist
# PREREQUISITES: You are in aplio-modern-1/ directory
# EXPECTED OUTCOME: All required test directories exist for {{TASK_ID}} components
# FAILURE HANDLING: If mkdir fails, check permissions and available disk space

{{TEST_DIRECTORY_CREATION_COMMANDS}}
mkdir -p test/screenshots/{{TASK_ID}}
mkdir -p test/scaffolds/{{TASK_ID}}
mkdir -p test/references/{{TASK_ID}}
mkdir -p test/diffs
mkdir -p test/reports
mkdir -p test/vision-results
```

#### Step 0.3: Start Testing Infrastructure
```bash
# PURPOSE: Start enhanced test server and dashboard for React SSR and visual testing
# WHEN: Run this after directory creation and keep running during all testing phases
# PREREQUISITES: npm packages installed, ports 3333 and 3334 available
# EXPECTED OUTCOME: Test server running on port 3333, dashboard on port 3334
# FAILURE HANDLING: If server fails to start, check port availability and npm dependencies

# Terminal 1: Start enhanced test server
npm run test:server:enhanced

# Wait for server startup, then verify
sleep 5
curl -s http://localhost:3333/status || echo "RETRY: npm run test:server:enhanced"

# Terminal 2: Start enhanced dashboard  
npm run test:dashboard:enhanced

# Wait for dashboard startup, then verify
sleep 3
curl -s http://localhost:3334 > /dev/null || echo "RETRY: npm run test:dashboard:enhanced"
```

#### Step 0.4: Verify System Dependencies
```bash
# PURPOSE: Ensure all required testing tools and dependencies are installed and functional
# WHEN: Run this after server startup to validate complete testing environment
# PREREQUISITES: npm is available, internet connection for package installation
# EXPECTED OUTCOME: Jest, Playwright, TypeScript, Enhanced scaffold system, and LLM Vision dependencies confirmed
# FAILURE HANDLING: Install missing packages as indicated by each check

npm list jest > /dev/null || npm install --save-dev jest
npx playwright --version > /dev/null || npx playwright install
npm list axios > /dev/null || npm install axios
node -e "require('ts-node')" || npm install --save-dev ts-node typescript
node -e "require('./test/utils/scaffold-templates/create-enhanced-scaffold.js')" || echo "CRITICAL: Enhanced scaffold system missing"
```

### Validation
- [ ] aplio-modern-1/ directory accessed
- [ ] All {{TASK_ID}} test directories created
- [ ] Test server running on port 3333
- [ ] Dashboard running on port 3334
- [ ] All testing dependencies installed

### Deliverables
- Complete test directory structure for {{TASK_ID}}
- Running test server and dashboard
- Verified testing environment ready for Phase 1

## Phase 1: Component Discovery & Classification

### Prerequisites (builds on Phase 0)
- Test environment setup complete from Phase 0
- Test server and dashboard running
- Enhanced scaffold system verified in Phase 0

### Discovery Requirements:
- Find ALL testable elements mentioned in the Components/Elements section
- Name and describe each element discovered. Include the full path to it's implemented location and log those data points this file: pmc/system/plans/task-approach/current-test-discovery.md  
- Prioritize elements based on user impact and complexity
- Consider legacy references: {{LEGACY_REFERENCES_LIST}}


### Actions

#### Step 1.1: Enhanced Testable Elements Discovery and Classification
```bash
# PURPOSE: Discover all testable elements created by {{TASK_ID}} and classify their testing approach using AI-powered analysis
# WHEN: Execute this after environment setup to understand what needs to be tested comprehensively
# PREREQUISITES: Task requirements reviewed, active-task.md available, AI discovery system configured
# EXPECTED OUTCOME: Complete analysis of all testable elements logged to current-test-discovery.md with classifications
# FAILURE HANDLING: If discovery fails, review task requirements and legacy references for clarity, retry with improved prompts

# Enhanced Testable Components Discovery
# Task-Specific Context Analysis:
# - Task: {{TASK_ID}} - {{TASK_TITLE}}
# - Pattern: {{TASK_PATTERNS}}
# - Description: {{TASK_DESCRIPTION}}
# - Implementation Location: {{IMPLEMENTATION_LOCATION}}
# - Elements to Analyze: {{COMPONENT_COUNT}} elements
# - Element Preview: {{ELEMENTS_PREVIEW}}

# Targeted Analysis Process:
# 1. Focus on Components/Elements Section: Review the {{COMPONENT_COUNT}} elements starting with: {{ELEMENTS_PREVIEW}}
# 2. Examine Implementation at: {{IMPLEMENTATION_LOCATION}} with pattern {{TASK_PATTERNS}}
# 3. Review Legacy References: {{LEGACY_REFERENCES_LIST}}
# 4. Classify Testing Approach: Determine the most appropriate testing strategy for each element type
# 5. Output structured findings to pmc/system/plans/task-approach/current-test-discovery.md

# Element Classification Logic:
# - React Components: 
#   - Server Components (non-interactive): Render testing, props validation, server-side behavior
#   - Client Components (interactive): User interaction testing, state management, event handling
# - Utility Functions: Unit testing for input/output, edge cases, type safety
# - Infrastructure Elements: 
#   - loading.tsx/error.tsx: Error simulation, loading state validation
#   - Route handlers: Request/response testing, error handling
# - Type Definitions: Type checking, interface compliance testing
# - Design System Elements: Component variant testing, design token validation

# Required Output Format for current-test-discovery.md:
# ## Testable Elements Discovery
# 
# ### React Components
# - ComponentName1 (Server Component): Description of component purpose and testing focus
# - ComponentName2 (Client Component): Description of interactive features requiring testing
# 
# ### Utility Functions  
# - UtilityFunction1: Description of function purpose and testing requirements
# - UtilityFunction2: Description of expected inputs/outputs and edge cases
# 
# ### Infrastructure Elements
# - loading.tsx: Loading state validation requirements
# - error.tsx: Error handling scenarios to test
# 
# ### Type Definitions
# - InterfaceName: Type safety and compliance testing requirements
# 
# ### Testing Priority Classification
# - High Priority: Critical user-facing elements requiring comprehensive testing
# - Medium Priority: Supporting elements requiring basic validation  
# - Low Priority: Type definitions and simple utilities requiring minimal testing

echo "=== ENHANCED TESTABLE ELEMENTS DISCOVERY ==="
echo "Task: {{TASK_ID}} - {{TASK_TITLE}}"
echo "Pattern: {{TASK_PATTERNS}}"
echo "Elements Count: {{COMPONENT_COUNT}}"
echo "Implementation Location: {{IMPLEMENTATION_LOCATION}}"
echo ""
echo "Analyzing {{ELEMENTS_PREVIEW}} and related testable elements..."
echo "Legacy References: {{LEGACY_REFERENCES_LIST}}"
echo ""
echo "Discovery results will be logged to: pmc/system/plans/task-approach/current-test-discovery.md"
echo "=== DISCOVERY COMPLETE ==="
```

#### Step 1.2: Discover and Validate {{TASK_ID}} Components
```bash
# PURPOSE: Validate that all {{TASK_ID}} components can be imported and compiled
# WHEN: Run this after testable elements discovery to ensure components are ready for testing and scaffold generation
# DOCUMENTATION: You MUST read all of C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\system\plans\task-approach\current-test-discovery.md because all testable elements have been documented there.
# PREREQUISITES: Component importer system available, all {{TASK_ID}} components implemented
# EXPECTED OUTCOME: All {{COMPONENT_COUNT}} {{TASK_ID}} components successfully imported and validated
# FAILURE HANDLING: If component import fails, check file paths and TypeScript compilation errors

{{COMPONENT_DISCOVERY_SCRIPT}}
```

#### Step 1.3: Generate Enhanced Scaffolds for All {{TASK_ID}} Components
```bash
# PURPOSE: Generate React SSR scaffolds with real rendering, Tailwind CSS, and visual boundaries for all {{TASK_ID}} components
# WHEN: Run this after component validation to create visual testing artifacts
# DOCUMENTATION: You MUST read all of C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\system\plans\task-approach\current-test-discovery.md because all testable elements have been documented there.
# PREREQUISITES: Enhanced scaffold system available, components successfully imported
# EXPECTED OUTCOME: {{COMPONENT_COUNT}} enhanced scaffold HTML files created in test/scaffolds/{{TASK_ID}}/ with real React content
# FAILURE HANDLING: If scaffold generation fails, check component props and Enhanced scaffold system

{{ENHANCED_SCAFFOLD_GENERATION_SCRIPT}}
```

#### Step 1.4: Validate Scaffold Content Quality
```bash
# PURPOSE: Verify scaffolds contain real React content with Tailwind CSS styling and proper component boundaries
# WHEN: Run this after scaffold generation to ensure quality before testing phases
# PREREQUISITES: Enhanced scaffolds generated in test/scaffolds/{{TASK_ID}}/
# EXPECTED OUTCOME: All scaffolds contain real content, Tailwind classes, and visual boundaries
# FAILURE HANDLING: If validation fails, regenerate scaffolds with correct props and styling

# Verify scaffolds contain real content (not mock/placeholder)
find test/scaffolds/{{TASK_ID}} -name "*-enhanced.html" -exec grep -L "Mock\|placeholder\|test content" {} \; | while read file; do echo "✓ $file contains real content"; done

# Verify Tailwind CSS classes are present
find test/scaffolds/{{TASK_ID}} -name "*-enhanced.html" -exec grep -l "bg-white\|rounded-lg\|shadow-md\|bg-blue\|bg-green" {} \; | while read file; do echo "✓ $file has Tailwind CSS"; done

# Check for proper component boundaries
find test/scaffolds/{{TASK_ID}} -name "*-enhanced.html" -exec grep -l "Server Component\|Client Component\|component-boundary" {} \; | while read file; do echo "✓ $file has visual boundaries"; done
```

### Validation
- [ ] All {{COMPONENT_COUNT}} {{TASK_ID}} components successfully discovered and classified
- [ ] Components successfully imported and validated
- [ ] Enhanced scaffolds generated for all components
- [ ] Scaffolds contain real React content (not mock HTML)
- [ ] Tailwind CSS styling applied correctly
- [ ] Visual boundaries present (blue for server, green for client)

### Deliverables
- Complete testable elements discovery logged to current-test-discovery.md
- {{COMPONENT_COUNT}} enhanced scaffold HTML files in test/scaffolds/{{TASK_ID}}/
- Component import validation results
- Real React SSR rendered content ready for testing phases

## Phase 2: Unit Testing

### Prerequisites (builds on Phase 1)
- Component discovery and classification complete from Phase 1
- All {{TASK_ID}} components discovered and validated
- Enhanced scaffolds generated and validated
- Component classifications documented in current-test-discovery.md

### Actions

#### Step 2.1: Run Jest Unit Tests for {{TASK_ID}} Components
```bash
# PURPOSE: Execute Jest-based unit tests to validate component behavior and compilation
# WHEN: Run this after component discovery to test all discovered components
# DOCUMENTATION: You MUST read all of C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\system\plans\task-approach\current-test-discovery.md because all testable elements have been documented there.
# PREREQUISITES: Jest installed, test files exist in {{UNIT_TEST_LOCATION}}, components discovered in Phase 1
# EXPECTED OUTCOME: All unit tests pass, components compile successfully
# FAILURE HANDLING: If tests fail, analyze errors and apply fix/test/analyze cycle

{{JEST_TEST_COMMAND}}
```

#### Step 2.2: Validate Server/Client Component Classification
```bash
# PURPOSE: Verify proper 'use client' directive usage for client components and absence for server components
# WHEN: Run this after component discovery to validate discovered component classifications
# PREREQUISITES: All {{TASK_ID}} component files discovered in Phase 1, components exist in {{IMPLEMENTATION_LOCATION}}
# EXPECTED OUTCOME: {{CLIENT_COMPONENTS}} have 'use client', {{SERVER_COMPONENTS}} do not
# FAILURE HANDLING: If classification is wrong, add/remove 'use client' directives as needed

{{CLIENT_COMPONENT_VALIDATION_COMMANDS}}

{{SERVER_COMPONENT_VALIDATION_COMMANDS}}
```

#### Step 2.3: Create Unit Test Files for {{TASK_ID}}
```bash
# PURPOSE: Generate comprehensive unit test files for server and client component validation
# WHEN: Run this if unit test files don't exist for discovered {{TASK_ID}} components
# DOCUMENTATION: You MUST read all of C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\system\plans\task-approach\current-test-discovery.md because all testable elements have been documented there.
# PREREQUISITES: {{UNIT_TEST_LOCATION}} directory exists, components discovered in Phase 1
# EXPECTED OUTCOME: Complete test files for server component rendering and client directive validation
# FAILURE HANDLING: If file creation fails, check directory permissions and path accuracy

{{UNIT_TEST_FILE_CREATION_COMMANDS}}
```

### Validation
- [ ] All Jest unit tests pass for discovered {{TASK_ID}} components
- [ ] Server components ({{SERVER_COMPONENT_NAMES}}) have no 'use client' directive
- [ ] Client components ({{CLIENT_COMPONENT_NAMES}}) have 'use client' directive
- [ ] All components compile successfully with TypeScript
- [ ] Unit test files created and functional

### Deliverables
- Jest test results with coverage for {{TASK_ID}}
- Component classification validation results
- Unit test files for future regression testing

## Phase 3: Visual Testing

### Prerequisites (builds on Phase 2)
- Component discovery and classification complete from Phase 1
- Unit testing complete from Phase 2
- Enhanced scaffolds generated for all {{TASK_ID}} components
- Test server running on port 3333
- Scaffolds contain real React content with styling

### Actions

#### Step 3.1: Execute Enhanced Visual Testing for {{TASK_ID}}
```bash
# PURPOSE: Capture pixel-perfect screenshots of all {{TASK_ID}} components using Playwright
# WHEN: Run this after unit testing and scaffold generation to create visual testing artifacts
# DOCUMENTATION: You MUST read all of C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\system\plans\task-approach\current-test-discovery.md because all testable elements have been documented there.
# PREREQUISITES: Enhanced scaffolds exist, test server running, Playwright installed
# EXPECTED OUTCOME: High-quality PNG screenshots captured for all {{COMPONENT_COUNT}} {{TASK_ID}} components
# FAILURE HANDLING: If visual testing fails, restart test server and check scaffold accessibility

npm run test:visual:enhanced {{TASK_ID}}
```

#### Step 3.2: Validate Screenshot Generation
```bash
# PURPOSE: Verify all expected {{TASK_ID}} component screenshots were successfully captured
# WHEN: Run this after visual testing to confirm all artifacts are ready for LLM Vision analysis
# PREREQUISITES: Visual testing completed, test/screenshots/{{TASK_ID}}/ directory exists
# EXPECTED OUTCOME: {{COMPONENT_COUNT}} PNG screenshot files confirmed for {{TASK_ID}} components
# FAILURE HANDLING: If screenshots missing, re-run visual testing for missing components

{{SCREENSHOT_VALIDATION_SCRIPT}}
```

#### Step 3.3: Validate Component Boundaries in Screenshots
```bash
# PURPOSE: Verify visual boundaries are properly displayed in enhanced scaffolds
# WHEN: Run this after screenshot validation to ensure component classification is visually clear
# PREREQUISITES: Enhanced scaffolds exist with component boundary styling
# EXPECTED OUTCOME: Server components show blue boundaries, client components show green boundaries
# FAILURE HANDLING: If boundaries missing, regenerate scaffolds with proper boundary injection

{{COMPONENT_BOUNDARY_VALIDATION_COMMANDS}}
```

### Validation
- [ ] All {{COMPONENT_COUNT}} {{TASK_ID}} component screenshots captured
- [ ] Screenshots are high-quality PNG files
- [ ] Server components display blue visual boundaries
- [ ] Client components display green visual boundaries
- [ ] Tailwind CSS styling visible in screenshots

### Deliverables
- {{COMPONENT_COUNT}} PNG screenshot files in test/screenshots/{{TASK_ID}}/
- Visual regression testing artifacts
- Component boundary validation results

## Phase 4: LLM Vision Analysis

### Prerequisites (builds on Phase 3)
- Component discovery and classification complete from Phase 1
- Unit testing complete from Phase 2
- All {{COMPONENT_COUNT}} {{TASK_ID}} component screenshots captured
- Enhanced LLM Vision Analyzer available
- Screenshots show proper styling and boundaries

### Actions

#### Step 4.1: Verify Enhanced LLM Vision Analyzer Setup
```bash
# PURPOSE: Ensure Enhanced LLM Vision Analyzer API is configured and accessible
# WHEN: Run this before component analysis to validate LLM Vision system readiness
# PREREQUISITES: Enhanced LLM Vision Analyzer installed, API configuration available
# EXPECTED OUTCOME: LLM Vision API connection confirmed, analyzer ready for component analysis
# FAILURE HANDLING: If connection fails, check API configuration and network connectivity

node -e "
const { EnhancedLLMVisionAnalyzer } = require('./test/utils/vision/enhanced-llm-vision-analyzer');
async function testConnection() {
  try {
    const analyzer = new EnhancedLLMVisionAnalyzer({ verbose: false });
    await analyzer.initialize();
    console.log('✓ Enhanced LLM Vision Analyzer API connection successful');
    await analyzer.close();
  } catch (error) {
    console.error('✗ Enhanced LLM Vision Analyzer connection failed:', error.message);
    throw error;
  }
}
testConnection();
"
```

#### Step 4.2: Execute Enhanced LLM Vision Analysis for All {{TASK_ID}} Components
```bash
# PURPOSE: Run Enhanced LLM Vision analysis on each {{TASK_ID}} component to validate content and classification
# WHEN: Run this after screenshot validation to get comprehensive component analysis
# PREREQUISITES: Screenshots exist, Enhanced LLM Vision Analyzer configured, task context available
# EXPECTED OUTCOME: Detailed analysis reports with 95%+ confidence scores for all components
# FAILURE HANDLING: If analysis fails or confidence low, apply fix/test/analyze cycle
# NOTE: 60-second delay between analyses prevents API rate limiting and ensures reliable processing

{{LLM_VISION_ANALYSIS_COMMANDS}}
```

#### Step 4.3: Validate LLM Vision Analysis Results
```bash
# PURPOSE: Verify all {{TASK_ID}} components have comprehensive analysis reports with acceptable confidence scores
# WHEN: Run this after component analysis to ensure all deliverables are complete
# PREREQUISITES: Enhanced LLM Vision analysis completed for all components
# EXPECTED OUTCOME: {{COMPONENT_COUNT}} detailed analysis reports confirmed in test/screenshots/{{TASK_ID}}/
# FAILURE HANDLING: If reports missing or confidence low, re-run analysis with improved prompts

{{LLM_VISION_VALIDATION_COMMANDS}}
```

### Validation
- [ ] Enhanced LLM Vision Analyzer API connection successful
- [ ] All {{COMPONENT_COUNT}} {{TASK_ID}} components analyzed successfully
- [ ] Analysis reports generated for each component
- [ ] Confidence scores ≥ 95% achieved for all components
- [ ] Component classification validated through LLM Vision

### Deliverables
- {{COMPONENT_COUNT}} detailed LLM Vision analysis reports in test/screenshots/{{TASK_ID}}/
- Confidence scores and quality assessments
- Component classification validation results

## Phase 5: Validation & Reporting

### Prerequisites (builds on Phase 4)
- Component discovery and classification complete from Phase 1
- Unit testing complete from Phase 2
- Visual testing complete from Phase 3
- All testing phases completed successfully
- LLM Vision analysis reports available
- All test artifacts generated

### Actions

#### Step 5.1: Compile {{TASK_ID}} Testing Results
```bash
# PURPOSE: Generate comprehensive summary of all {{TASK_ID}} testing phase results
# WHEN: Run this after all testing phases complete to create final validation report
# PREREQUISITES: All testing artifacts exist (discovery results, unit tests, scaffolds, screenshots, analysis reports)
# EXPECTED OUTCOME: Complete testing summary with pass/fail status for all {{TASK_ID}} components
# FAILURE HANDLING: If compilation fails, verify all prerequisite artifacts exist

{{TESTING_RESULTS_COMPILATION_SCRIPT}}
```

#### Step 5.2: Generate Human-Readable Testing Report
```bash
# PURPOSE: Create final testing report for human validation with all {{TASK_ID}} results and artifacts
# WHEN: Run this as the final step to provide complete testing documentation
# PREREQUISITES: Testing summary compiled, all artifacts confirmed
# EXPECTED OUTCOME: Comprehensive testing report saved for human review
# FAILURE HANDLING: If report generation fails, check file permissions and artifact availability

{{HUMAN_READABLE_REPORT_GENERATION}}
```

### Validation
- [ ] All {{TASK_ID}} testing phases completed successfully
- [ ] Testing summary compiled with pass/fail status
- [ ] Human-readable testing report generated
- [ ] All artifacts confirmed and accessible
- [ ] Success criteria validation completed

### Deliverables
- Complete testing summary with component status
- Human-readable testing report in test/reports/
- All testing artifacts organized and accessible
- {{TASK_ID}} ready for human validation

## Success Criteria & Quality Gates

### Component Implementation Requirements
{{COMPONENT_REQUIREMENTS}}

### Testing Quality Gates
- **Phase 0**: Environment setup complete, all dependencies verified
- **Phase 1**: Component discovery complete, scaffolds generated with real content
- **Phase 2**: Unit tests pass, component classification validated
- **Phase 3**: High-quality screenshots captured, visual boundaries visible
- **Phase 4**: LLM Vision analysis ≥ 95% confidence for all components
- **Phase 5**: Complete testing documentation and human-readable reports

### Final Acceptance Criteria
{{ACCEPTANCE_CRITERIA}}

## Human Verification

### Review Locations
- **Enhanced Scaffolds**: `test/scaffolds/{{TASK_ID}}/` - Real React rendering with boundaries
- **Screenshots**: `test/screenshots/{{TASK_ID}}/` - Visual component validation
- **LLM Vision Reports**: `test/screenshots/{{TASK_ID}}/*-enhanced-analysis.md` - AI analysis
- **Testing Report**: `test/reports/{{TASK_ID}}-testing-report.md` - Complete summary

### Manual Validation Steps
1. Open enhanced scaffolds in browser to verify real React content
2. Review screenshots for proper Tailwind CSS styling and boundaries
3. Read LLM Vision analysis reports for confidence scores and feedback
4. Confirm all components meet {{TASK_ID}} acceptance criteria
5. Validate server/client classification through visual boundaries

### Completion Checklist
- [ ] All testing phases executed successfully
- [ ] {{COMPONENT_COUNT}} {{TASK_ID}} components validated through Enhanced LLM Vision analysis
- [ ] Visual boundaries clearly distinguish server (blue) vs client (green) components
- [ ] Testing artifacts complete and accessible
- [ ] Human verification confirms quality and requirements satisfaction

{{LEGACY_REFERENCES_SECTION}}

## Testing Tools and Infrastructure
- **Testing Tools**: {{TESTING_TOOLS}}
- **Coverage Requirements**: {{TEST_COVERAGE}}
- **Implementation Location**: {{IMPLEMENTATION_LOCATION}}
- **Enhanced Testing Infrastructure**: aplio-modern-1/test with utilities in test/utils/
- **Discovery Results**: pmc/system/plans/task-approach/current-test-discovery.md

**Important Note**: All components documented in `pmc/system/plans/task-approach/current-test-discovery.md` must go through the complete test cycle of every subsequent step in this testing protocol. This ensures comprehensive validation of each discovered component.

---
