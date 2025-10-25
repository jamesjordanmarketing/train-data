# Enhanced Test System Operationalization Specification

## Overview
This specification defines the complete implementation of automated testing protocol generation using a hybrid mechanical script + AI discovery approach. The system analyzes `pmc\core\active-task.md` to generate comprehensive testing protocols through component discovery, requirement inference, and template population.

## Architecture

### Input-Output Flow
```
active-task.md → [AI Discovery Phase] → [Mechanical Template Population] → enhanced-testing-protocol.md
```

### Core Design Principles
1. **Discovery-First**: AI discovers components and requirements from task implementation
2. **Hybrid Processing**: AI handles inference, mechanical scripts handle formatting and execution
3. **Single Source Truth**: Only `active-task.md` drives the entire generation process
4. **Minimal AI Surface**: 4 focused AI prompts, rest is mechanical template population
5. **Proven Patterns**: Based on successful T-1.1.3 implementation with 100% component discovery accuracy

## AI Discovery Phase

### Execution Requirements
- **Sequential Processing**: Prompts must execute in order (discovery builds context)
- **Rate Limiting**: 60-second delays for LLM Vision analysis (proven critical from T-1.1.3)
- **Temperature Control**: 0.1 for discovery, 0.0 for precision analysis
- **Error Handling**: Retry mechanisms with fallback content

### AI Prompt Integration Points

#### PROMPT 1: COMPONENT_DISCOVERY_AND_CLASSIFICATION
**Input**: Complete `active-task.md` content
**Output**: Comma-separated component list with classifications
**Template Variable**: `{{DISCOVERED_COMPONENTS}}`
**Mechanical Processing**: Parse into bash arrays and individual component variables

**Example Output**:
```
Card (Server Component), Button (Client Component), FaqItem (Client Component), FaqSection (Server Component), DashboardStats (Server Component), StatChart (Client Component), LoginForm (Client Component)
```

**Mechanical Parser Logic**:
```bash
# Parse component list into arrays
IFS=',' read -ra COMPONENT_ARRAY <<< "${DISCOVERED_COMPONENTS}"
SERVER_COMPONENTS=()
CLIENT_COMPONENTS=()
ALL_COMPONENTS=()

for component in "${COMPONENT_ARRAY[@]}"; do
    name=$(echo "$component" | sed 's/ (.*)//')
    if [[ $component == *"Server Component"* ]]; then
        SERVER_COMPONENTS+=("$name")
    else
        CLIENT_COMPONENTS+=("$name")
    fi
    ALL_COMPONENTS+=("$name")
done
```

#### PROMPT 2: TESTING_INFRASTRUCTURE_ANALYSIS
**Input**: Complete `active-task.md` content  
**Output**: JSON infrastructure requirements
**Template Variables**: `{{TEST_DIRECTORY}}`, `{{TESTING_TOOLS}}`, `{{TEST_TYPES}}`

**Mechanical Processing**: Parse JSON and extract directory paths, tool lists, coverage requirements

#### PROMPT 3: VALIDATION_CRITERIA_EXTRACTION
**Input**: Complete `active-task.md` content
**Output**: JSON validation criteria
**Template Variables**: `{{ACCEPTANCE_CRITERIA}}`, `{{VALIDATION_STEPS}}`, `{{SUCCESS_CRITERIA}}`

**Mechanical Processing**: Convert acceptance criteria into test validation logic

#### PROMPT 4: VISUAL_TESTING_REQUIREMENTS
**Input**: Complete `active-task.md` content
**Output**: JSON visual testing strategy or null
**Template Variables**: `{{VISUAL_TESTING_REQUIRED}}`, `{{SCREENSHOT_STRATEGY}}`, `{{LLM_VISION_ANALYSIS}}`

**Conditional Processing**: Generate visual testing sections only if required

## Enhanced Template Structure

### File Location
`pmc/system/templates/enhanced-active-task-test-template.md`

### Template Variables

#### Mechanical Variables (Direct Substitution)
- `{{TASK_ID}}` - Extracted from active-task.md Task ID field
- `{{TASK_TITLE}}` - Extracted from active-task.md Task Title field  
- `{{APP_DIRECTORY}}` - Default: "aplio-modern-1"
- `{{IMPLEMENTATION_PATH}}` - Extracted from Implementation Location field

#### AI-Discovered Variables (From AI Prompts)
- `{{DISCOVERED_COMPONENTS}}` - Output from PROMPT 1
- `{{TEST_DIRECTORY}}` - Output from PROMPT 2  
- `{{TESTING_TOOLS}}` - Output from PROMPT 2
- `{{ACCEPTANCE_CRITERIA}}` - Output from PROMPT 3
- `{{VISUAL_TESTING_REQUIRED}}` - Output from PROMPT 4

#### Computed Variables (Derived from AI Outputs)
- `{{SERVER_COMPONENTS_ARRAY}}` - Bash array of server components
- `{{CLIENT_COMPONENTS_ARRAY}}` - Bash array of client components
- `{{ALL_COMPONENTS_ARRAY}}` - Bash array of all components
- `{{COMPONENT_COUNT}}` - Total number of components

### Enhanced Template Content

```markdown
# {{TASK_ID}}: {{TASK_TITLE}} - Enhanced Testing Protocol

## Mission Statement
Execute complete testing cycle from environment setup through visual validation with LLM Vision analysis to ensure {{TASK_ID}} components ({{DISCOVERED_COMPONENTS}}) are properly implemented, styled, and functioning with proper server/client component classification.

## Discovered Components Analysis
**Total Components**: {{COMPONENT_COUNT}}
**Server Components**: {{SERVER_COMPONENTS_LIST}}
**Client Components**: {{CLIENT_COMPONENTS_LIST}}

## Testing Strategy Overview
{{#IF_VISUAL_TESTING_REQUIRED}}
**Testing Phases**: 5 (Setup → Unit → Discovery → Visual → LLM Analysis)
**Visual Testing**: Required - {{SCREENSHOT_STRATEGY}}
**LLM Vision Analysis**: Enabled with 60-second rate limiting
{{/IF_VISUAL_TESTING_REQUIRED}}
{{#IF_NO_VISUAL_TESTING}}
**Testing Phases**: 3 (Setup → Unit → Validation)
**Visual Testing**: Not required - {{VISUAL_TESTING_SKIP_REASON}}
{{/IF_NO_VISUAL_TESTING}}

## Fix/Test/Analyze Cycle Pattern
For any failed validation step in ANY phase:
1. **Log Issue**: Document failure details and error messages
2. **Attempt Fix**: Apply automated correction if possible  
3. **Re-run Test**: Execute the failed step again
4. **Evaluate Results**: Check if issue is resolved
5. **Update Artifacts**: Regenerate affected files (scaffolds, screenshots, reports)
6. **Repeat**: Continue until success or maximum iterations reached (default: 3 attempts)

## Phase 0: Pre-Testing Environment Setup
### Prerequisites
- You are in the project root directory: `/c%3A/Users/james/Master/BrightHub/Build/APSD-runs/aplio-27-a1-c`
- You have npm and Node.js installed
- Git bash or equivalent terminal access

### Actions
#### Step 0.1: Navigate to Application Directory
```bash
cd {{APP_DIRECTORY}}
pwd  # Verify: should show .../{{APP_DIRECTORY}}
```

#### Step 0.2: Create Test Directory Structure
```bash
mkdir -p {{TEST_DIRECTORY}}
mkdir -p test/screenshots/{{TASK_ID}}
mkdir -p test/scaffolds/{{TASK_ID}}
mkdir -p test/references/{{TASK_ID}}
mkdir -p test/diffs
mkdir -p test/reports
mkdir -p test/vision-results
echo "Created test directory structure for {{TASK_ID}}"
```

#### Step 0.3: Verify Dependencies
```bash
# Verify testing tools: {{TESTING_TOOLS}}
npm list jest react-testing-library @testing-library/react || echo "Testing dependencies verification needed"
{{#IF_VISUAL_TESTING_REQUIRED}}
npm list playwright || echo "Playwright needed for visual testing"
{{/IF_VISUAL_TESTING_REQUIRED}}
```

## Phase 1: Unit Testing
### Prerequisites (builds on Phase 0)
- Test environment setup complete from Phase 0
- All {{TASK_ID}} components implemented in {{IMPLEMENTATION_PATH}}

### Component Classification Testing
#### Step 1.1: Create Server Component Validation Test
```bash
cat > {{TEST_DIRECTORY}}/server-component-render.test.tsx << 'EOF'
import React from 'react';
import { render } from '@testing-library/react';
import fs from 'fs';
import path from 'path';

// Server Components (should NOT have 'use client' directive)
const SERVER_COMPONENTS = [{{SERVER_COMPONENTS_ARRAY}}];

describe('{{TASK_ID}} Server Component Implementation', () => {
  SERVER_COMPONENTS.forEach((componentName) => {
    test(`${componentName} should be a server component (no 'use client' directive)`, () => {
      const componentPath = path.join(process.cwd(), 'app/_components', `${componentName}.tsx`);
      expect(fs.existsSync(componentPath)).toBe(true);
      
      const fileContent = fs.readFileSync(componentPath, 'utf8');
      expect(fileContent).not.toMatch(/^['"]use client['"];?\s*$/m);
    });
    
    test(`${componentName} should export a default React component`, () => {
      const componentPath = path.join(process.cwd(), 'app/_components', `${componentName}.tsx`);
      const fileContent = fs.readFileSync(componentPath, 'utf8');
      expect(fileContent).toMatch(/export\s+default\s+function\s+\w+/);
    });
  });
});
EOF
```

#### Step 1.2: Create Client Component Validation Test  
```bash
cat > {{TEST_DIRECTORY}}/client-directive.test.ts << 'EOF'
import fs from 'fs';
import path from 'path';

// Client Components (should HAVE 'use client' directive)
const CLIENT_COMPONENTS = [{{CLIENT_COMPONENTS_ARRAY}}];

describe('{{TASK_ID}} Client Component Implementation', () => {
  CLIENT_COMPONENTS.forEach((componentName) => {
    test(`${componentName} should be a client component (has 'use client' directive)`, () => {
      const componentPath = path.join(process.cwd(), 'app/_components', `${componentName}.tsx`);
      expect(fs.existsSync(componentPath)).toBe(true);
      
      const fileContent = fs.readFileSync(componentPath, 'utf8');
      expect(fileContent).toMatch(/^['"]use client['"];?\s*$/m);
    });
    
    test(`${componentName} should export a default React component`, () => {
      const componentPath = path.join(process.cwd(), 'app/_components', `${componentName}.tsx`);
      const fileContent = fs.readFileSync(componentPath, 'utf8');
      expect(fileContent).toMatch(/export\s+default\s+function\s+\w+/);
    });
  });
});
EOF
```

#### Step 1.3: Execute Unit Tests
```bash
cd {{APP_DIRECTORY}}
npm test -- {{TEST_DIRECTORY}} --verbose
echo "Unit testing phase complete for {{TASK_ID}}"
```

{{#IF_VISUAL_TESTING_REQUIRED}}
## Phase 2: Component Discovery & React SSR
### Prerequisites (builds on Phase 1)
- Unit tests passing for all {{TASK_ID}} components
- Component classification validated

### Enhanced Scaffold Generation
#### Step 2.1: Create Component Importer
```bash
cat > test/utils/ComponentImporter.mjs << 'EOF'
import React from 'react';
import { renderToString } from 'react-dom/server';

const COMPONENTS = [{{ALL_COMPONENTS_ARRAY}}];

export async function generateEnhancedScaffolds() {
  const scaffolds = {};
  
  for (const componentName of COMPONENTS) {
    try {
      const componentPath = `../app/_components/${componentName}.tsx`;
      const { default: Component } = await import(componentPath);
      
      const componentType = await getComponentType(componentName);
      const borderColor = componentType === 'Server' ? 'border-blue-500' : 'border-green-500';
      
      const enhancedHTML = renderToString(
        React.createElement('div', {
          className: `p-8 border-4 ${borderColor} rounded-lg bg-white shadow-lg`,
          children: [
            React.createElement('h2', {
              className: 'text-xl font-bold mb-4 text-gray-800',
              children: `${componentName} (${componentType} Component)`
            }),
            React.createElement(Component)
          ]
        })
      );
      
      scaffolds[componentName] = enhancedHTML;
    } catch (error) {
      console.error(`Error generating scaffold for ${componentName}:`, error);
      scaffolds[componentName] = `<div>Error loading ${componentName}</div>`;
    }
  }
  
  return scaffolds;
}

async function getComponentType(componentName) {
  const fs = await import('fs');
  const path = await import('path');
  const componentPath = path.join(process.cwd(), 'app/_components', `${componentName}.tsx`);
  const fileContent = fs.readFileSync(componentPath, 'utf8');
  return fileContent.includes('use client') ? 'Client' : 'Server';
}
EOF
```

#### Step 2.2: Generate Enhanced Scaffolds
```bash
cd {{APP_DIRECTORY}}
node test/utils/ComponentImporter.mjs
echo "Enhanced scaffolds generated for {{TASK_ID}} components"
```

## Phase 3: Visual Testing  
### Prerequisites (builds on Phase 2)
- Enhanced scaffolds generated for all {{TASK_ID}} components
- Test server available for screenshot capture

### Screenshot Capture
#### Step 3.1: Create Screenshot Script
```bash
cat > test/utils/capture-{{TASK_ID}}-screenshots.js << 'EOF'
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const COMPONENTS = [{{ALL_COMPONENTS_ARRAY}}];

async function captureScreenshots() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 800 });
  
  for (const component of COMPONENTS) {
    try {
      const scaffoldPath = path.join(__dirname, '..', 'scaffolds', '{{TASK_ID}}', `${component}.html`);
      await page.goto(`file://${scaffoldPath}`);
      await page.waitForLoadState('networkidle');
      
      const screenshotPath = path.join(__dirname, '..', 'screenshots', '{{TASK_ID}}', `${component}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot captured: ${component}.png`);
    } catch (error) {
      console.error(`Error capturing screenshot for ${component}:`, error);
    }
  }
  
  await browser.close();
}

captureScreenshots();
EOF
```

#### Step 3.2: Execute Screenshot Capture
```bash
cd {{APP_DIRECTORY}}
node test/utils/capture-{{TASK_ID}}-screenshots.js
echo "Screenshot capture complete for {{TASK_ID}}"
```

## Phase 4: LLM Vision Analysis
### Prerequisites (builds on Phase 3)
- All {{TASK_ID}} component screenshots captured
- Enhanced LLM Vision Analyzer available

### Critical Rate Limiting Requirements
**MANDATORY**: 60-second delays between component analyses to prevent API failures

#### Step 4.1: Create Analysis Script
```bash
cat > test/utils/analyze-{{TASK_ID}}-components.sh << 'EOF'
#!/bin/bash

COMPONENTS=({{ALL_COMPONENTS_ARRAY}})
ANALYSIS_COUNT=${#COMPONENTS[@]}

echo "Starting LLM Vision Analysis for {{TASK_ID}} - ${ANALYSIS_COUNT} components"

for i in "${!COMPONENTS[@]}"; do
    component="${COMPONENTS[$i]}"
    echo "Analyzing component: $component ($(($i + 1))/${ANALYSIS_COUNT})"
    
    # Execute LLM Vision analysis
    node ../../../pmc/context-ai/llm-vision-analyzer/analyze-component.js \
        "test/screenshots/{{TASK_ID}}/${component}.png" \
        "{{TASK_ID}}" \
        "$component"
    
    # Mandatory 60-second delay (except for last component)
    if [ $i -lt $((${#COMPONENTS[@]} - 1)) ]; then
        echo "Rate limiting: waiting 60 seconds before next analysis..."
        sleep 60
    fi
done

echo "LLM Vision Analysis complete for {{TASK_ID}}"
EOF

chmod +x test/utils/analyze-{{TASK_ID}}-components.sh
```

#### Step 4.2: Execute LLM Vision Analysis
```bash
cd {{APP_DIRECTORY}}
./test/utils/analyze-{{TASK_ID}}-components.sh
echo "LLM Vision Analysis phase complete for {{TASK_ID}}"
```
{{/IF_VISUAL_TESTING_REQUIRED}}

## Success Validation
### Acceptance Criteria Validation
{{ACCEPTANCE_CRITERIA_VALIDATION}}

### Testing Completion Checklist
- [ ] Unit tests pass for all {{COMPONENT_COUNT}} components
- [ ] Server component classification verified
- [ ] Client component classification verified
{{#IF_VISUAL_TESTING_REQUIRED}}
- [ ] Enhanced scaffolds generated for all components
- [ ] Screenshots captured for all components  
- [ ] LLM Vision analysis completed with rate limiting
{{/IF_VISUAL_TESTING_REQUIRED}}

## Troubleshooting

### Common Issues
1. **Component Not Found**: Check implementation path {{IMPLEMENTATION_PATH}}
2. **Test Failures**: Review component export patterns and file extensions
3. **Visual Testing Issues**: Verify scaffold generation and test server availability
{{#IF_VISUAL_TESTING_REQUIRED}}
4. **LLM Vision API Failures**: Ensure 60-second delays between analyses
{{/IF_VISUAL_TESTING_REQUIRED}}

### Recovery Procedures
- Re-run failed tests with increased verbosity
- Regenerate scaffolds if screenshot capture fails
- Check component import paths and dependencies
- Verify testing tool versions and compatibility

---

**Generated Protocol Version**: 2.0 (Discovery-Based)
**Source Task**: {{TASK_ID}} - {{TASK_TITLE}}
**Generation Timestamp**: {{TIMESTAMP}}
**Total Discovered Components**: {{COMPONENT_COUNT}}
```

## Mechanical Script Implementation

### Script Location
`pmc/system/scripts/generate-enhanced-testing-protocol.js`

### Core Processing Logic

#### Step 1: Parse Active Task
```javascript
function parseActiveTask(activeTaskContent) {
  const taskData = {
    taskId: extractTaskId(activeTaskContent),
    taskTitle: extractTaskTitle(activeTaskContent),
    implementationPath: extractImplementationPath(activeTaskContent),
    testLocation: extractTestLocation(activeTaskContent)
  };
  return taskData;
}
```

#### Step 2: Execute AI Discovery
```javascript
async function executeAIDiscovery(activeTaskContent) {
  const discoveries = {};
  
  // Sequential execution required
  discoveries.components = await executePrompt('COMPONENT_DISCOVERY_AND_CLASSIFICATION', activeTaskContent);
  discoveries.infrastructure = await executePrompt('TESTING_INFRASTRUCTURE_ANALYSIS', activeTaskContent);
  discoveries.validation = await executePrompt('VALIDATION_CRITERIA_EXTRACTION', activeTaskContent);
  discoveries.visual = await executePrompt('VISUAL_TESTING_REQUIREMENTS', activeTaskContent);
  
  return discoveries;
}
```

#### Step 3: Process Discoveries
```javascript
function processDiscoveries(discoveries) {
  const processed = {
    serverComponents: extractServerComponents(discoveries.components),
    clientComponents: extractClientComponents(discoveries.components),
    allComponents: extractAllComponents(discoveries.components),
    testingTools: discoveries.infrastructure.testingTools,
    visualRequired: discoveries.visual.visualTestingRequired
  };
  return processed;
}
```

#### Step 4: Populate Template
```javascript
function populateTemplate(templateContent, taskData, processedDiscoveries) {
  let output = templateContent;
  
  // Mechanical substitutions
  output = output.replace(/\{\{TASK_ID\}\}/g, taskData.taskId);
  output = output.replace(/\{\{TASK_TITLE\}\}/g, taskData.taskTitle);
  
  // AI discovery substitutions
  output = output.replace(/\{\{DISCOVERED_COMPONENTS\}\}/g, processedDiscoveries.allComponents.join(', '));
  output = output.replace(/\{\{SERVER_COMPONENTS_ARRAY\}\}/g, formatBashArray(processedDiscoveries.serverComponents));
  
  // Conditional content processing
  output = processConditionalBlocks(output, processedDiscoveries);
  
  return output;
}
```

## Integration with start-task Command

### Modified Context Manager Integration
**File**: `pmc/system/management/context-manager-v2.js`

#### Enhanced Start Task Function
```javascript
async function startTask(taskId) {
  // Existing start task logic...
  
  // Generate enhanced testing protocol
  const activeTaskPath = path.join(process.cwd(), 'core', 'active-task.md');
  const activeTaskContent = fs.readFileSync(activeTaskPath, 'utf8');
  
  try {
    const enhancedProtocol = await generateEnhancedTestingProtocol(activeTaskContent);
    const protocolPath = path.join(process.cwd(), 'core', `active-task-unit-tests-enhanced.md`);
    fs.writeFileSync(protocolPath, enhancedProtocol);
    
    console.log(`✅ Enhanced testing protocol generated: ${protocolPath}`);
  } catch (error) {
    console.warn(`⚠️  Enhanced protocol generation failed, using basic template: ${error.message}`);
    // Fallback to existing basic template logic
  }
}
```

## Success Metrics & Validation

### Performance Targets
1. **Generation Speed**: <60 seconds for complete protocol generation
2. **Discovery Accuracy**: 100% of implemented components discovered
3. **Template Population**: 95%+ variable substitution success rate
4. **AI Reliability**: 90%+ prompt execution success rate

### Quality Assurance
1. **Component Validation**: Cross-check discovered components against implementation
2. **Template Integrity**: Validate all variables are populated
3. **Testing Logic**: Verify generated test commands are executable
4. **Rate Limiting**: Ensure 60-second delays for LLM Vision analysis

### Fallback Mechanisms
1. **AI Failure**: Revert to basic template with manual component entry
2. **Discovery Failure**: Use default component patterns for task type
3. **Template Error**: Generate minimal viable testing protocol
4. **Integration Failure**: Continue with existing start-task workflow

## Proven Success Patterns (T-1.1.3 Validation)

### Validated Approaches
- **Component Discovery**: Directory scanning + file analysis = 100% accuracy
- **Classification Logic**: 'use client' directive detection = reliable Server/Client identification  
- **Template Structure**: 5-phase testing protocol = comprehensive coverage
- **Rate Limiting**: 60-second delays = prevents LLM Vision API failures
- **Bash Arrays**: Component iteration patterns = robust test execution

### Critical Requirements
- **Sequential AI Execution**: Dependency order prevents context loss
- **Mechanical Processing**: Template population via string replacement = high reliability
- **Error Recovery**: Retry mechanisms + fallback content = production resilience
- **Visual Testing Integration**: Conditional generation based on task requirements = flexible coverage

---

**Specification Version**: 2.0 (Discovery-Based Implementation)
**Last Updated**: Based on T-1.1.3 success patterns and 4-prompt optimization
**Implementation Status**: Ready for mechanical script development and context manager integration
