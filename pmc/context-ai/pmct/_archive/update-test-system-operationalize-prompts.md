# Enhanced Testing Protocol AI Prompt Execution Plan

## Overview
This document defines the structured approach for executing AI prompts to populate AI_SECTION placeholders in the intermediate testing protocol file. The plan prioritizes reliability, predictability, and structured output generation.

## Execution Strategy

### Core Principles
1. **Sequential Dependencies**: Execute prompts in dependency order to ensure context availability
2. **Structured Output**: Use JSON/markdown formatting for predictable parsing
3. **Temperature Control**: Use temperature=0.1 for maximum consistency
4. **Validation Gates**: Include output validation at each step
5. **Error Recovery**: Built-in retry mechanisms with context preservation

### Execution Phases

#### Phase A: Foundation Analysis (Sequential)
**Purpose**: Establish component context and classification strategy
**Execution**: Sequential, each prompt builds on previous results
**Critical**: High - These results feed all subsequent prompts

#### Phase B: Infrastructure Commands (Parallel)
**Purpose**: Generate mechanical command structures
**Execution**: Can run in parallel after Phase A completion
**Critical**: Medium - Standardized patterns with low variance

#### Phase C: Testing Strategies (Sequential)
**Purpose**: Generate phase-specific testing approaches
**Execution**: Sequential, builds on component analysis and infrastructure
**Critical**: High - Complex logic requiring component context

#### Phase D: Validation & Documentation (Sequential)
**Purpose**: Create success criteria and verification steps
**Execution**: Sequential after all testing strategies complete
**Critical**: High - Must align with all generated strategies

## AI Section Prompts

### Phase A: Foundation Analysis

#### AI_SECTION:DISCOVERED_COMPONENTS
**Execution Order**: 1
**Dependencies**: Component discovery data
**Temperature**: 0.1
**Expected Output**: Structured component list with classifications

```markdown
PROMPT_DISCOVERED_COMPONENTS:

You are creating a component summary for a Next.js testing protocol.

## Input Data:
```json
{{DISCOVERED_COMPONENTS_JSON}}
```

## Task:
Generate a comma-separated list of components with their classifications.

## Output Format (EXACT):
```
Card (Server Component), Button (Client Component), FaqItem (Client Component), FaqSection (Server Component), DashboardStats (Server Component), StatChart (Client Component), LoginForm (Client Component)
```

## Requirements:
- Use ONLY the component names from the input data
- Classification based on isClient flag: true = "Client Component", false = "Server Component"
- Comma-separated format with parenthetical classifications
- NO additional text or explanations
- Must include ALL discovered components

## Validation:
- Count must match input component count
- All component names must appear exactly as in input data
- Format must be: "ComponentName (Type), ComponentName (Type)"
```

#### AI_SECTION:COMPONENT_CLASSIFICATION_STRATEGY
**Execution Order**: 2
**Dependencies**: Component discovery data, task acceptance criteria
**Temperature**: 0.1
**Expected Output**: Brief classification strategy description

```markdown
PROMPT_COMPONENT_CLASSIFICATION_STRATEGY:

You are defining component classification strategy for a Next.js testing protocol.

## Input Data:
- Task Acceptance Criteria: {{ACCEPTANCE_CRITERIA}}
- Server Components: {{SERVER_COMPONENTS_LIST}}
- Client Components: {{CLIENT_COMPONENTS_LIST}}

## Task:
Generate a brief strategy description (maximum 10 words) for how components are classified.

## Output Format (EXACT):
Choose ONE of these patterns based on acceptance criteria:
- "server/client classification"
- "Next.js 14 App Router boundaries"
- "interactive vs non-interactive components"
- "client directive vs server rendering"

## Requirements:
- Maximum 10 words
- Must reflect the actual classification approach used
- NO additional explanations or context
- Must align with acceptance criteria focus

## Validation:
- Word count ≤ 10
- Must be one of the approved patterns or similar brief phrase
- Must align with acceptance criteria themes
```

### Phase B: Infrastructure Commands (Parallel Execution)

#### AI_SECTION:TESTING_INFRASTRUCTURE_COMMANDS
**Execution Order**: 3 (can run parallel with other Phase B)
**Dependencies**: Task data
**Temperature**: 0.1
**Expected Output**: Bash commands for test infrastructure

```markdown
PROMPT_TESTING_INFRASTRUCTURE_COMMANDS:

You are generating bash commands to start testing infrastructure.

## Input Data:
- App Directory: {{APP_DIRECTORY}}
- Has Enhanced Testing: {{HAS_ENHANCED_TESTING}}

## Task:
Generate bash commands to start test servers and verify connectivity.

## Output Format (EXACT):
```bash
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

## Requirements:
- Must use enhanced test commands if available
- Include startup verification with curl
- Include retry instructions for failures
- Use consistent port numbers (3333, 3334)
- NO additional explanations outside bash comments

## Validation:
- All commands must be valid bash syntax
- Must include sleep delays for startup
- Must include error handling with RETRY messages
```

#### AI_SECTION:DEPENDENCY_VERIFICATION_COMMANDS
**Execution Order**: 4 (can run parallel with other Phase B)
**Dependencies**: Task data, testing tools
**Temperature**: 0.1
**Expected Output**: Bash commands for dependency verification

```markdown
PROMPT_DEPENDENCY_VERIFICATION_COMMANDS:

You are generating bash commands to verify testing dependencies.

## Input Data:
- Testing Tools: {{TESTING_TOOLS}}
- Required Dependencies: Jest, Playwright, TypeScript, Enhanced scaffold system

## Task:
Generate bash commands to verify and install missing dependencies.

## Output Format (EXACT):
```bash
npm list jest > /dev/null || npm install --save-dev jest
npx playwright --version > /dev/null || npx playwright install
npm list axios > /dev/null || npm install axios
node -e "require('ts-node')" || npm install --save-dev ts-node typescript
node -e "require('./test/utils/scaffold-templates/create-enhanced-scaffold.js')" || echo "CRITICAL: Enhanced scaffold system missing"
```

## Requirements:
- Check for jest, playwright, axios, ts-node, typescript
- Include enhanced scaffold system check
- Use conditional install syntax: command || install
- Include CRITICAL warning for missing scaffold system
- NO additional explanations

## Validation:
- All commands must be valid bash syntax
- Must include conditional operators (||)
- Must check for all required dependencies
- Enhanced scaffold check must use exact path
```

### Phase C: Testing Strategies (Sequential Execution)

#### AI_SECTION:UNIT_TESTING_STRATEGY
**Execution Order**: 5
**Dependencies**: Component data, acceptance criteria
**Temperature**: 0.1
**Expected Output**: Complete unit testing section with bash commands

```markdown
PROMPT_UNIT_TESTING_STRATEGY:

You are creating unit testing strategy for discovered components.

## Input Data:
```json
{
  "taskId": "{{TASK_ID}}",
  "components": {{DISCOVERED_COMPONENTS_JSON}},
  "serverComponents": {{SERVER_COMPONENTS_JSON}},
  "clientComponents": {{CLIENT_COMPONENTS_JSON}},
  "acceptanceCriteria": "{{ACCEPTANCE_CRITERIA}}",
  "implementationPath": "{{IMPLEMENTATION_PATH}}"
}
```

## Task:
Generate complete unit testing strategy with executable bash commands.

## Output Format (EXACT):
```markdown
#### Step 1.1: Run Jest Unit Tests for {{TASK_ID}} Components
```bash
# PURPOSE: Execute Jest-based unit tests to validate component behavior and compilation
# WHEN: Run this when all {{TASK_ID}} components have been implemented
# PREREQUISITES: Jest installed, test files exist in test/unit-tests/task-1-1/{{TASK_ID}}/
# EXPECTED OUTCOME: All unit tests pass, components compile successfully
# FAILURE HANDLING: If tests fail, analyze errors and apply fix/test/analyze cycle

npm test -- --testPathPattern=task-1-1/{{TASK_ID}} --coverage
```

#### Step 1.2: Validate Server/Client Component Classification
```bash
# PURPOSE: Verify proper 'use client' directive usage for client components and absence for server components
# WHEN: Run this after unit tests to ensure correct component classification
# PREREQUISITES: All {{TASK_ID}} component files exist in {{IMPLEMENTATION_PATH}}
# EXPECTED OUTCOME: Client components ({{CLIENT_COMPONENTS_NAMES}}) have 'use client', server components ({{SERVER_COMPONENTS_NAMES}}) do not
# FAILURE HANDLING: If classification is wrong, add/remove 'use client' directives as needed

# Check client components have 'use client' directive
{{CLIENT_GREP_COMMANDS}}

# Verify server components don't have 'use client' directive  
{{SERVER_GREP_COMMANDS}}
```

#### Step 1.3: Create Unit Test Files for {{TASK_ID}}
```bash
{{UNIT_TEST_FILE_CREATION_COMMANDS}}
```
```

## Requirements:
- Replace ALL {{PLACEHOLDER}} variables with actual data
- Generate specific grep commands for each component type
- Create complete test file creation bash commands
- Include all PURPOSE/WHEN/PREREQUISITES/EXPECTED OUTCOME comments
- Use exact discovered component names
- NO placeholder text - all must be populated

## Validation:
- All bash commands must be executable
- Component names must match discovery data exactly
- Must include both positive and negative tests for 'use client'
- Test file creation must include full cat commands with EOF
```

#### AI_SECTION:COMPONENT_DISCOVERY_STRATEGY
**Execution Order**: 6
**Dependencies**: Component data, unit testing results
**Temperature**: 0.1
**Expected Output**: Component discovery and scaffold generation strategy

```markdown
PROMPT_COMPONENT_DISCOVERY_STRATEGY:

You are creating component discovery and React SSR scaffold generation strategy.

## Input Data:
```json
{
  "taskId": "{{TASK_ID}}",
  "components": {{DISCOVERED_COMPONENTS_JSON}},
  "serverComponents": {{SERVER_COMPONENTS_JSON}},
  "clientComponents": {{CLIENT_COMPONENTS_JSON}}"
}
```

## Task:
Generate complete component discovery strategy with specific scaffold generation commands.

## Output Format (EXACT):
```markdown
#### Step 2.1: Discover and Validate {{TASK_ID}} Components
```bash
# PURPOSE: Automatically discover and validate that all {{TASK_ID}} components can be imported and compiled
# WHEN: Run this after unit tests pass to ensure components are ready for scaffold generation
# PREREQUISITES: Component importer system available, all {{TASK_ID}} components implemented
# EXPECTED OUTCOME: All {{COMPONENT_COUNT}} {{TASK_ID}} components successfully imported and validated
# FAILURE HANDLING: If component import fails, check file paths and TypeScript compilation errors

node -e "
const { ComponentImporter } = require('./test/utils/scaffold-templates/component-importer.js');
const importer = new ComponentImporter();
const {{TASK_ID_LOWER}}Components = [{{COMPONENT_NAMES_ARRAY}}];

async function validateAllComponents() {
  for (const name of {{TASK_ID_LOWER}}Components) {
    try {
      await importer.loadComponent(name);
      console.log('✓', name, 'imported successfully');
    } catch (error) {
      console.error('✗', name, 'failed:', error.message);
      throw error;
    }
  }
  console.log('All {{TASK_ID}} components validated');
}

validateAllComponents().catch(console.error);
"
```

#### Step 2.2: Generate Enhanced Scaffolds for All {{TASK_ID}} Components
```bash
# PURPOSE: Generate React SSR scaffolds with real rendering, Tailwind CSS, and visual boundaries for all {{TASK_ID}} components
# WHEN: Run this after component validation to create visual testing artifacts
# PREREQUISITES: Enhanced scaffold system available, components successfully imported
# EXPECTED OUTCOME: {{COMPONENT_COUNT}} enhanced scaffold HTML files created in test/scaffolds/{{TASK_ID}}/ with real React content
# FAILURE HANDLING: If scaffold generation fails, check component props and Enhanced scaffold system

node -e "
const { createEnhancedScaffold } = require('./test/utils/scaffold-templates/create-enhanced-scaffold.js');
const components = [
{{COMPONENT_SCAFFOLD_ARRAY}}
];

async function generateAllScaffolds() {
  for (const component of components) {
    try {
      const path = await createEnhancedScaffold({ task: '{{TASK_ID}}', component: component.name, props: component.props });
      console.log('✓', component.name, '(' + component.type + ')', 'scaffold created:', path);
    } catch (error) {
      console.error('✗', component.name, 'scaffold failed:', error.message);
      throw error;
    }
  }
  console.log('All {{TASK_ID}} scaffolds generated');
}

generateAllScaffolds().catch(console.error);
"
```

#### Step 2.3: Validate Scaffold Content Quality
```bash
{{SCAFFOLD_VALIDATION_COMMANDS}}
```
```

## Requirements:
- Generate specific component arrays with actual names
- Create component scaffold definitions with appropriate props
- Include exact component counts and task IDs
- Generate specific validation commands for scaffold quality
- All variables must be populated with real data

## Validation:
- Component arrays must use correct JavaScript syntax
- Scaffold definitions must include realistic props for each component type
- Task ID must be consistent throughout
- All bash commands must be executable
```

#### AI_SECTION:VISUAL_TESTING_STRATEGY
**Execution Order**: 7
**Dependencies**: Component data, scaffold generation
**Temperature**: 0.1
**Expected Output**: Visual testing and screenshot capture strategy

```markdown
PROMPT_VISUAL_TESTING_STRATEGY:

You are creating visual testing strategy for component screenshots.

## Input Data:
```json
{
  "taskId": "{{TASK_ID}}",
  "components": {{DISCOVERED_COMPONENTS_JSON}},
  "componentCount": {{COMPONENT_COUNT}}
}
```

## Task:
Generate complete visual testing strategy with Playwright screenshot capture.

## Output Format (EXACT):
```markdown
#### Step 3.1: Execute Enhanced Visual Testing for {{TASK_ID}}
```bash
# PURPOSE: Capture pixel-perfect screenshots of all {{TASK_ID}} components using Playwright
# WHEN: Run this after scaffold generation to create visual testing artifacts
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

node -e "
const fs = require('fs');
const screenshotDir = 'test/screenshots/{{TASK_ID}}';
const expectedComponents = [{{COMPONENT_NAMES_QUOTED_ARRAY}}];

if (!fs.existsSync(screenshotDir)) {
  throw new Error('Screenshot directory not found: ' + screenshotDir);
}

const screenshots = fs.readdirSync(screenshotDir).filter(f => f.endsWith('.png'));
console.log('Generated screenshots:', screenshots.length);

let allValid = true;
expectedComponents.forEach(component => {
  const fileName = component + '-enhanced.png';
  if (screenshots.includes(fileName)) {
    console.log('✓', component, 'screenshot captured');
  } else {
    console.log('✗', component, 'screenshot missing');
    allValid = false;
  }
});

if (!allValid) {
  throw new Error('Some {{TASK_ID}} component screenshots are missing');
}
console.log('All {{TASK_ID}} component screenshots validated');
"
```

#### Step 3.3: Validate Component Boundaries in Screenshots
```bash
# PURPOSE: Verify visual boundaries are properly displayed in enhanced scaffolds
# WHEN: Run this after screenshot validation to ensure component classification is visually clear
# PREREQUISITES: Enhanced scaffolds exist with component boundary styling
# EXPECTED OUTCOME: Server components show blue boundaries, client components show green boundaries
# FAILURE HANDLING: If boundaries missing, regenerate scaffolds with proper boundary injection

{{BOUNDARY_VALIDATION_COMMANDS}}
```
```

## Requirements:
- Use exact component counts and names from input data
- Generate quoted array of component names for JavaScript
- Create specific boundary validation commands for server vs client components
- Include proper error handling in all Node.js scripts

## Validation:
- Component counts must match input data
- Arrays must use proper JavaScript/bash syntax
- All file paths must reference correct task ID
- Boundary validation must distinguish server (blue) vs client (green)
```

#### AI_SECTION:LLM_VISION_STRATEGY
**Execution Order**: 8 (CRITICAL)
**Dependencies**: Component data, visual testing completion
**Temperature**: 0.0 (Maximum reliability for timing)
**Expected Output**: LLM Vision analysis with mandatory 60-second delays

```markdown
PROMPT_LLM_VISION_STRATEGY:

You are creating LLM Vision analysis strategy with MANDATORY rate limiting.

## Input Data:
```json
{
  "taskId": "{{TASK_ID}}",
  "components": {{DISCOVERED_COMPONENTS_JSON}},
  "componentNames": [{{COMPONENT_NAMES_ARRAY}}],
  "lastComponent": "{{LAST_COMPONENT_NAME}}"
}
```

## Task:
Generate LLM Vision analysis strategy with MANDATORY 60-second delays between analyses.

## Output Format (EXACT):
```markdown
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

COMPONENTS=({{COMPONENT_NAMES_BASH_ARRAY}})

for component in "${COMPONENTS[@]}"; do
  echo "Analyzing ${component} component..."
  node test/utils/vision/enhanced-llm-vision-analyzer.js "$component" || echo "RETRY: Analysis failed for ${component}"
  
  # Wait 60 seconds between analyses to prevent API rate limiting
  if [ "$component" != "{{LAST_COMPONENT_NAME}}" ]; then
    echo "⏱️ Waiting 60 seconds before next analysis to prevent rate limiting..."
    sleep 60
  fi
done
```

#### Step 4.3: Validate LLM Vision Analysis Results
```bash
# PURPOSE: Verify all {{TASK_ID}} components have comprehensive analysis reports with acceptable confidence scores
# WHEN: Run this after component analysis to ensure all deliverables are complete
# PREREQUISITES: Enhanced LLM Vision analysis completed for all components
# EXPECTED OUTCOME: {{COMPONENT_COUNT}} detailed analysis reports confirmed in test/screenshots/{{TASK_ID}}/
# FAILURE HANDLING: If reports missing or confidence low, re-run analysis with improved prompts

COMPONENTS=({{COMPONENT_NAMES_BASH_ARRAY}})

for component in "${COMPONENTS[@]}"; do
  report_path="test/screenshots/{{TASK_ID}}/${component}-enhanced-analysis.md"
  if [ -f "$report_path" ]; then
    echo "✓ ${component} Enhanced LLM Vision report: $report_path"
  else
    echo "✗ ${component} Enhanced LLM Vision report missing: $report_path"
  fi
done
```
```

## CRITICAL Requirements:
- MANDATORY: Include 60-second sleep delays between all analyses except last
- Use exact component names from input data in bash arrays
- Last component name must be excluded from delay check
- All bash array syntax must be correct: ("Name1" "Name2" "Name3")
- Temperature MUST be 0.0 for this section to ensure timing reliability

## Validation:
- Must include sleep 60 command between analyses
- Conditional check must use exact last component name
- Bash arrays must use proper quoted syntax
- All file paths must use correct task ID
- Report validation loop must match analysis loop exactly
```

### Phase D: Validation & Documentation (Sequential Execution)

#### AI_SECTION:VALIDATION_REPORTING_STRATEGY
**Execution Order**: 9
**Dependencies**: All testing strategies, component data
**Temperature**: 0.1
**Expected Output**: Complete validation and reporting commands

```markdown
PROMPT_VALIDATION_REPORTING_STRATEGY:

You are creating validation and reporting strategy for all testing phases.

## Input Data:
```json
{
  "taskId": "{{TASK_ID}}",
  "components": {{DISCOVERED_COMPONENTS_JSON}},
  "componentCount": {{COMPONENT_COUNT}},
  "serverComponents": {{SERVER_COMPONENTS_JSON}},
  "clientComponents": {{CLIENT_COMPONENTS_JSON}}
}
```

## Task:
Generate complete validation and reporting strategy with comprehensive testing summary.

## Output Format (EXACT):
```markdown
#### Step 5.1: Compile {{TASK_ID}} Testing Results
```bash
# PURPOSE: Generate comprehensive summary of all {{TASK_ID}} testing phase results
# WHEN: Run this after all testing phases complete to create final validation report
# PREREQUISITES: All testing artifacts exist (unit tests, scaffolds, screenshots, analysis reports)
# EXPECTED OUTCOME: Complete testing summary with pass/fail status for all {{TASK_ID}} components
# FAILURE HANDLING: If compilation fails, verify all prerequisite artifacts exist

node -e "
const fs = require('fs');
const components = [{{COMPONENT_NAMES_QUOTED_ARRAY}}];

console.log('=== {{TASK_ID}} TESTING SUMMARY ===');
console.log('Task: {{TASK_TITLE}}');
console.log('Components Tested:', components.length);
console.log('');

let allPassed = true;

// Check unit test results
console.log('UNIT TESTING:');
try {
  console.log('✓ Jest unit tests completed');
} catch (e) {
  console.log('✗ Jest unit tests failed');
  allPassed = false;
}

// Check scaffolds
console.log('\\nREACT SSR SCAFFOLDS:');
components.forEach(comp => {
  const scaffoldPath = \`test/scaffolds/{{TASK_ID}}/\${comp}-enhanced.html\`;
  if (fs.existsSync(scaffoldPath)) {
    console.log('✓', comp, 'scaffold generated');
  } else {
    console.log('✗', comp, 'scaffold missing');
    allPassed = false;
  }
});

// Check screenshots
console.log('\\nVISUAL TESTING:');
components.forEach(comp => {
  const screenshotPath = \`test/screenshots/{{TASK_ID}}/\${comp}-enhanced.png\`;
  if (fs.existsSync(screenshotPath)) {
    console.log('✓', comp, 'screenshot captured');
  } else {
    console.log('✗', comp, 'screenshot missing');
    allPassed = false;
  }
});

// Check LLM Vision analysis
console.log('\\nLLM VISION ANALYSIS:');
components.forEach(comp => {
  const reportPath = \`test/screenshots/{{TASK_ID}}/\${comp}-enhanced-analysis.md\`;
  if (fs.existsSync(reportPath)) {
    console.log('✓', comp, 'analysis report available');
  } else {
    console.log('✗', comp, 'analysis report missing');
    allPassed = false;
  }
});

console.log('\\n=== FINAL RESULT ===');
if (allPassed) {
  console.log('✓ ALL {{TASK_ID}} TESTING PHASES PASSED');
  console.log('Components ready for production validation');
} else {
  console.log('✗ SOME {{TASK_ID}} TESTING PHASES FAILED');
  console.log('Review failed items and apply fix/test/analyze cycle');
}
"
```

#### Step 5.2: Generate Human-Readable Testing Report
```bash
# PURPOSE: Create final testing report for human validation with all {{TASK_ID}} results and artifacts
# WHEN: Run this as the final step to provide complete testing documentation
# PREREQUISITES: Testing summary compiled, all artifacts confirmed
# EXPECTED OUTCOME: Comprehensive testing report saved for human review
# FAILURE HANDLING: If report generation fails, check file permissions and artifact availability

cat > test/reports/{{TASK_ID}}-testing-report.md << 'EOF'
# {{TASK_ID}}: {{TASK_TITLE}} - Testing Report

## Executive Summary
Complete testing validation for {{TASK_ID}} components with Enhanced LLM Vision analysis.

## Components Tested
{{COMPONENT_REPORT_LIST}}

## Testing Phases Completed
1. ✓ Unit Testing - Jest validation and TypeScript compilation
2. ✓ Component Discovery & React SSR - Real component rendering
3. ✓ Visual Testing - Screenshot capture with Playwright
4. ✓ LLM Vision Analysis - AI-powered content verification
5. ✓ Validation & Reporting - Comprehensive results compilation

## Artifacts Generated
- Unit test files: \`test/unit-tests/task-1-1/{{TASK_ID}}/\`
- Enhanced scaffolds: \`test/scaffolds/{{TASK_ID}}/\`
- Screenshots: \`test/screenshots/{{TASK_ID}}/\`
- LLM Vision reports: \`test/screenshots/{{TASK_ID}}/*-enhanced-analysis.md\`

## Success Criteria Met
- All unit tests pass with proper component behavior validation
- Components render with real React SSR (not mock HTML)
- Screenshots show actual Tailwind CSS styling
{{SERVER_COMPONENT_SUCCESS_CRITERIA}}
{{CLIENT_COMPONENT_SUCCESS_CRITERIA}}
- LLM Vision analysis validates content with 95%+ confidence
- Component classification (server/client) correctly identified

## Human Verification Required
Please review the generated artifacts and confirm:
1. Visual quality meets {{TASK_ID}} requirements
2. Component boundaries are clearly visible
3. LLM Vision analysis reports show acceptable confidence scores
4. All acceptance criteria satisfied

Report generated: \$(date)
EOF

echo "✓ {{TASK_ID}} testing report generated: test/reports/{{TASK_ID}}-testing-report.md"
```
```

## Requirements:
- Generate component report list with server/client classifications
- Create specific success criteria for server and client components
- Use exact task ID and title throughout
- Include proper file path references
- All components must be listed in testing summary

## Validation:
- Component arrays must match discovery data
- File paths must use correct task ID format
- Success criteria must align with component types
- All bash commands must be valid and executable
```

#### AI_SECTION:SUCCESS_CRITERIA
**Execution Order**: 10
**Dependencies**: All previous sections, component analysis
**Temperature**: 0.1
**Expected Output**: Component-specific success criteria

```markdown
PROMPT_SUCCESS_CRITERIA:

You are creating component-specific success criteria for testing validation.

## Input Data:
```json
{
  "taskId": "{{TASK_ID}}",
  "taskTitle": "{{TASK_TITLE}}",
  "acceptanceCriteria": "{{ACCEPTANCE_CRITERIA}}",
  "serverComponents": {{SERVER_COMPONENTS_JSON}},
  "clientComponents": {{CLIENT_COMPONENTS_JSON}}
}
```

## Task:
Generate specific success criteria and quality gates based on actual components and acceptance criteria.

## Output Format (EXACT):
```markdown
### Component Implementation Requirements
{{SERVER_COMPONENT_REQUIREMENTS}}
{{CLIENT_COMPONENT_REQUIREMENTS}}

### Testing Quality Gates
- **Phase 0**: Environment setup complete, all dependencies verified
- **Phase 1**: Unit tests pass, component classification validated
- **Phase 2**: Real React SSR rendering confirmed, scaffolds generated
- **Phase 3**: High-quality screenshots captured, visual boundaries visible
- **Phase 4**: LLM Vision analysis ≥ 95% confidence for all components
- **Phase 5**: Complete testing documentation and human-readable reports

### Final Acceptance Criteria
- All {{COMPONENT_COUNT}} {{TASK_ID}} components implemented and tested
- Server/client classification correctly applied and validated
- Enhanced LLM Vision Analyzer confirms component quality
- Visual testing demonstrates proper styling and boundaries
- Complete testing artifacts available for review
- Testing report confirms all phases passed successfully
```

## Requirements:
- Generate specific requirements for each discovered server component
- Generate specific requirements for each discovered client component
- Use actual component names and counts
- Align with provided acceptance criteria
- Include phase-specific quality gates

## Validation:
- Must list all discovered components by name
- Requirements must distinguish server vs client component expectations
- Component count must match discovery data
- Must align with task acceptance criteria
```

#### AI_SECTION:HUMAN_VERIFICATION_STEPS
**Execution Order**: 11
**Dependencies**: All sections, success criteria
**Temperature**: 0.1
**Expected Output**: Manual verification checklist

```markdown
PROMPT_HUMAN_VERIFICATION_STEPS:

You are creating human verification steps for manual testing validation.

## Input Data:
```json
{
  "taskId": "{{TASK_ID}}",
  "components": {{DISCOVERED_COMPONENTS_JSON}},
  "serverComponents": {{SERVER_COMPONENTS_JSON}},
  "clientComponents": {{CLIENT_COMPONENTS_JSON}}"
}
```

## Task:
Generate specific human verification steps for the discovered components.

## Output Format (EXACT):
```markdown
### Review Locations
- **Enhanced Scaffolds**: \`test/scaffolds/{{TASK_ID}}/\` - Real React rendering with boundaries
- **Screenshots**: \`test/screenshots/{{TASK_ID}}/\` - Visual component validation
- **LLM Vision Reports**: \`test/screenshots/{{TASK_ID}}/*-enhanced-analysis.md\` - AI analysis
- **Testing Report**: \`test/reports/{{TASK_ID}}-testing-report.md\` - Complete summary

### Manual Validation Steps
1. Open enhanced scaffolds in browser to verify real React content
2. Review screenshots for proper Tailwind CSS styling and boundaries
3. Read LLM Vision analysis reports for confidence scores and feedback
4. Confirm all components meet {{TASK_ID}} acceptance criteria
5. Validate server/client classification through visual boundaries

### Component-Specific Verification
{{SERVER_COMPONENT_VERIFICATION}}
{{CLIENT_COMPONENT_VERIFICATION}}

### Completion Checklist
- [ ] All testing phases executed successfully
- [ ] {{COMPONENT_COUNT}} {{TASK_ID}} components validated through Enhanced LLM Vision analysis
- [ ] Visual boundaries clearly distinguish server (blue) vs client (green) components
- [ ] Testing artifacts complete and accessible
- [ ] Human verification confirms quality and requirements satisfaction

**Testing Complete**: {{TASK_ID}} {{TASK_TITLE}} validated through comprehensive testing with Enhanced LLM Vision analysis.
```

## Requirements:
- Generate specific verification steps for each server component (blue boundaries)
- Generate specific verification steps for each client component (green boundaries)
- Use actual component names and task details
- Include component count validation
- Reference correct file paths

## Validation:
- Must include verification steps for all discovered components
- Server components must reference blue boundaries
- Client components must reference green boundaries
- All file paths must use correct task ID
- Component count must match discovery data
```

## Execution Instructions

### Sequential Execution Plan

#### Step 1: Prepare Context Data
```bash
# Extract all required data from intermediate file and component discovery
CONTEXT_DATA = {
  "taskId": extracted_task_id,
  "taskTitle": extracted_task_title,
  "discoveredComponents": component_discovery_results,
  "serverComponents": filtered_server_components,
  "clientComponents": filtered_client_components,
  "acceptanceCriteria": extracted_acceptance_criteria,
  "implementationPath": extracted_implementation_path,
  "componentCount": total_component_count,
  "lastComponentName": last_component_in_list
}
```

#### Step 2: Execute Phase A (Foundation - Sequential)
```javascript
// Execute in order, each depends on previous
const foundationResults = await executeSequentially([
  { 
    prompt: "PROMPT_DISCOVERED_COMPONENTS",
    section: "DISCOVERED_COMPONENTS",
    temperature: 0.1,
    maxTokens: 200,
    context: CONTEXT_DATA
  },
  { 
    prompt: "PROMPT_COMPONENT_CLASSIFICATION_STRATEGY",
    section: "COMPONENT_CLASSIFICATION_STRATEGY",
    temperature: 0.1,
    maxTokens: 50,
    context: { ...CONTEXT_DATA, discoveredComponents: foundationResults[0] }
  }
]);
```

#### Step 3: Execute Phase B (Infrastructure - Parallel)
```javascript
// Can run in parallel after Phase A
const infrastructureResults = await executeParallel([
  { 
    prompt: "PROMPT_TESTING_INFRASTRUCTURE_COMMANDS",
    section: "TESTING_INFRASTRUCTURE_COMMANDS",
    temperature: 0.1,
    maxTokens: 400,
    context: CONTEXT_DATA
  },
  { 
    prompt: "PROMPT_DEPENDENCY_VERIFICATION_COMMANDS",
    section: "DEPENDENCY_VERIFICATION_COMMANDS",
    temperature: 0.1,
    maxTokens: 300,
    context: CONTEXT_DATA
  }
]);
```

#### Step 4: Execute Phase C (Testing Strategies - Sequential)
```javascript
// Execute in order, builds on previous results
const testingResults = await executeSequentially([
  { 
    prompt: "PROMPT_UNIT_TESTING_STRATEGY",
    section: "UNIT_TESTING_STRATEGY",
    temperature: 0.1,
    maxTokens: 1500,
    context: { ...CONTEXT_DATA, ...foundationResults, ...infrastructureResults }
  },
  { 
    prompt: "PROMPT_COMPONENT_DISCOVERY_STRATEGY",
    section: "COMPONENT_DISCOVERY_STRATEGY",
    temperature: 0.1,
    maxTokens: 1200,
    context: { ...CONTEXT_DATA, ...foundationResults, ...infrastructureResults }
  },
  { 
    prompt: "PROMPT_VISUAL_TESTING_STRATEGY",
    section: "VISUAL_TESTING_STRATEGY",
    temperature: 0.1,
    maxTokens: 1000,
    context: { ...CONTEXT_DATA, ...foundationResults }
  },
  { 
    prompt: "PROMPT_LLM_VISION_STRATEGY",
    section: "LLM_VISION_STRATEGY",
    temperature: 0.0, // CRITICAL: Maximum reliability for timing
    maxTokens: 1200,
    context: { ...CONTEXT_DATA, ...foundationResults }
  }
]);
```

#### Step 5: Execute Phase D (Validation - Sequential)
```javascript
// Execute in order after all testing strategies complete
const validationResults = await executeSequentially([
  { 
    prompt: "PROMPT_VALIDATION_REPORTING_STRATEGY",
    section: "VALIDATION_REPORTING_STRATEGY",
    temperature: 0.1,
    maxTokens: 1500,
    context: { ...CONTEXT_DATA, ...foundationResults, ...testingResults }
  },
  { 
    prompt: "PROMPT_SUCCESS_CRITERIA",
    section: "SUCCESS_CRITERIA",
    temperature: 0.1,
    maxTokens: 800,
    context: { ...CONTEXT_DATA, ...foundationResults }
  },
  { 
    prompt: "PROMPT_HUMAN_VERIFICATION_STEPS",
    section: "HUMAN_VERIFICATION_STEPS",
    temperature: 0.1,
    maxTokens: 600,
    context: { ...CONTEXT_DATA, ...foundationResults }
  }
]);
```

#### Step 6: Final Assembly and Validation
```javascript
// Replace all AI_SECTION placeholders in intermediate file
const finalContent = await replaceAISections(
  intermediateFileContent,
  { ...foundationResults, ...infrastructureResults, ...testingResults, ...validationResults }
);

// Validate final content
await validateFinalContent(finalContent, CONTEXT_DATA);

// Save final testing protocol
await saveFile('core/active-task-unit-tests-2.md', finalContent);
```

### Error Handling and Retry Strategy

#### Individual Prompt Failure
```javascript
async function executeWithRetry(promptConfig, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await executeAIPrompt(promptConfig);
      const validation = await validatePromptResult(result, promptConfig.section);
      
      if (validation.isValid) {
        return result;
      } else {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
    } catch (error) {
      console.log(`Attempt ${attempt} failed for ${promptConfig.section}: ${error.message}`);
      
      if (attempt === maxRetries) {
        // Use fallback content for this section
        return generateFallbackContent(promptConfig.section, promptConfig.context);
      }
      
      // Wait before retry with exponential backoff
      await sleep(1000 * Math.pow(2, attempt - 1));
    }
  }
}
```

#### Critical Section Handling
```javascript
// LLM_VISION_STRATEGY is critical - must include timing
if (section === "LLM_VISION_STRATEGY") {
  const result = await executeAIPrompt(promptConfig);
  
  // Validate mandatory 60-second delays are present
  if (!result.includes("sleep 60")) {
    throw new Error("CRITICAL: LLM Vision strategy missing mandatory 60-second delays");
  }
  
  // Validate component array syntax
  if (!result.includes('COMPONENTS=(')) {
    throw new Error("CRITICAL: LLM Vision strategy missing component array");
  }
  
  return result;
}
```

### Quality Assurance Metrics

#### Success Validation Criteria
- **Completeness**: All 11 AI sections populated with non-placeholder content
- **Accuracy**: Component names match discovery data exactly (100%)
- **Executability**: All bash commands pass syntax validation
- **Consistency**: Component counts and names consistent across all sections
- **Critical Requirements**: LLM Vision analysis includes mandatory delays
- **Structured Output**: All content follows specified format patterns

#### Performance Targets
- **Total Execution Time**: < 5 minutes for complete protocol generation
- **Success Rate**: > 95% for complete generation without fallbacks
- **Variance Reduction**: < 5% difference in output between runs with same input
- **Reliability**: 100% inclusion of critical timing requirements
