# Test System Operationalization Specification

## Overview
This specification details how to operationalize the creation of comprehensive task-specific testing instructions (like `active-task-unit-tests-2.md`) from the base input (`active-task.md`) using a hybrid approach of mechanical script processing and AI agent analysis.

## Current State Analysis
- **Input**: `pmc\core\active-task.md` (basic task specification)
- **Target Output**: `pmc\core\active-task-unit-tests-2.md` (comprehensive testing protocol)
- **Current Template**: `pmc\system\templates\active-task-test-template.md` (basic template)
- **Integration Point**: `start-task` command in `pmc\system\management\context-manager-v2.js`
- **Proven Success**: T-1.1.3 testing protocol generated successfully using hybrid approach

## Implementation Strategy

### Phase 1: Enhanced Template Creation
Create a new comprehensive template: `pmc\system\templates\enhanced-active-task-test-template.md`

**Template Design Principles**:
1. **Mechanical Sections**: Use clear variable substitution syntax `{{VARIABLE_NAME}}`
2. **AI-Required Sections**: Use placeholder blocks `{{AI_SECTION:SECTION_NAME}}`
3. **Conditional Logic**: Use `{{#IF_CONDITION}}...{{/IF_CONDITION}}` for optional sections
4. **Component Discovery**: Include dynamic component list generation

**Proven Template Structure** (based on successful T-1.1.3 implementation):
```markdown
# {{TASK_ID}}: {{TASK_TITLE}} - Enhanced Testing Protocol

## Mission Statement
Execute complete testing cycle from environment setup through visual validation with LLM Vision analysis to ensure {{TASK_ID}} components ({{AI_SECTION:DISCOVERED_COMPONENTS}}) are properly implemented, styled, and functioning with {{AI_SECTION:COMPONENT_CLASSIFICATION_STRATEGY}}.

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
- You are in the project root directory
- You have npm and Node.js installed
- Git bash or equivalent terminal access

### Actions
#### Step 0.1: Navigate to Application Directory
```bash
cd ..
cd {{APP_DIRECTORY}}
```

#### Step 0.2: Create Test Directory Structure
```bash
mkdir -p test/unit-tests/task-1-1/{{TASK_ID}}
mkdir -p test/screenshots/{{TASK_ID}}
mkdir -p test/scaffolds/{{TASK_ID}}
mkdir -p test/references/{{TASK_ID}}
mkdir -p test/diffs
mkdir -p test/reports
mkdir -p test/vision-results
```

#### Step 0.3: Start Testing Infrastructure
{{AI_SECTION:TESTING_INFRASTRUCTURE_COMMANDS}}

#### Step 0.4: Verify System Dependencies
{{AI_SECTION:DEPENDENCY_VERIFICATION_COMMANDS}}

## Phase 1: Unit Testing
### Prerequisites (builds on Phase 0)
- Test environment setup complete from Phase 0
- Test server and dashboard running
- All {{TASK_ID}} components implemented in {{IMPLEMENTATION_PATH}}

### Actions
{{AI_SECTION:UNIT_TESTING_STRATEGY}}

## Phase 2: Component Discovery & React SSR
### Prerequisites (builds on Phase 1)
- Unit tests passing for all {{TASK_ID}} components
- Component classification validated
- Enhanced scaffold system verified in Phase 0

### Actions
{{AI_SECTION:COMPONENT_DISCOVERY_STRATEGY}}

## Phase 3: Visual Testing
### Prerequisites (builds on Phase 2)
- Enhanced scaffolds generated for all {{TASK_ID}} components
- Test server running on port 3333
- Scaffolds contain real React content with styling

### Actions
{{AI_SECTION:VISUAL_TESTING_STRATEGY}}

## Phase 4: LLM Vision Analysis
### Prerequisites (builds on Phase 3)
- All {{TASK_ID}} component screenshots captured
- Enhanced LLM Vision Analyzer available
- Screenshots show proper styling and boundaries

### Actions
{{AI_SECTION:LLM_VISION_STRATEGY}}

## Phase 5: Validation & Reporting
### Prerequisites (builds on Phase 4)
- All testing phases completed successfully
- LLM Vision analysis reports available
- All test artifacts generated

### Actions
{{AI_SECTION:VALIDATION_REPORTING_STRATEGY}}

## Success Criteria & Quality Gates
{{AI_SECTION:SUCCESS_CRITERIA}}

## Human Verification
{{AI_SECTION:HUMAN_VERIFICATION_STEPS}}
```

### Phase 2: Mechanical Script Enhancement

**Script Location**: `pmc\system\scripts\generate-enhanced-testing-protocol.js`

**Enhanced Script Responsibilities** (based on T-1.1.3 learnings):
1. **Parse Input**: Extract data from `active-task.md`
2. **Path Analysis**: Discover implementation and test locations
3. **Component Discovery**: Scan actual implementation directories for components
4. **Component Classification**: Analyze each component for server/client type
5. **Basic Substitutions**: Replace all `{{VARIABLE_NAME}}` placeholders
6. **Generate Intermediate**: Create `active-task-unit-tests-2-intermediate.md`

**Enhanced Component Discovery Logic**:
```javascript
async function discoverComponents(implementationPath) {
  const results = {
    serverComponents: [],
    clientComponents: [],
    allComponents: []
  };
  
  // Scan _components directory if it exists
  const componentsDir = path.join(implementationPath, '_components');
  if (fs.existsSync(componentsDir)) {
    const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));
    
    for (const file of files) {
      const filePath = path.join(componentsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const componentName = path.basename(file, '.tsx');
      
      const component = {
        name: componentName,
        file: file,
        path: filePath,
        isClient: content.includes("'use client'") || content.includes('"use client"'),
        hasHooks: /use[A-Z]\w+\(/.test(content),
        hasInteractivity: /onClick|onChange|onSubmit|useState|useEffect/.test(content)
      };
      
      results.allComponents.push(component);
      
      if (component.isClient) {
        results.clientComponents.push(component);
      } else {
        results.serverComponents.push(component);
      }
    }
  }
  
  return results;
}

async function generateEnhancedTestingProtocol(taskId) {
  // 1. Load and parse active-task.md
  const taskData = await parseActiveTask(taskId);
  
  // 2. Discover components in implementation paths
  const discoveredComponents = await discoverComponents(taskData.implementationLocation);
  
  // 3. Load enhanced template
  const template = await loadTemplate('enhanced-active-task-test-template.md');
  
  // 4. Perform mechanical substitutions
  const mechanicallyProcessed = await processMechanicalSubstitutions(template, {
    TASK_ID: taskData.id,
    TASK_TITLE: taskData.title,
    APP_DIRECTORY: extractAppDirectory(taskData.implementationLocation),
    IMPLEMENTATION_PATH: taskData.implementationLocation,
    TEST_LOCATION: taskData.testLocation,
    DISCOVERED_COMPONENTS_LIST: discoveredComponents.allComponents.map(c => c.name).join(', '),
    SERVER_COMPONENTS_LIST: discoveredComponents.serverComponents.map(c => c.name).join(', '),
    CLIENT_COMPONENTS_LIST: discoveredComponents.clientComponents.map(c => c.name).join(', '),
    COMPONENTS_COUNT: discoveredComponents.allComponents.length
  });
  
  // 5. Save intermediate file with AI placeholders
  await saveFile('active-task-unit-tests-2-intermediate.md', mechanicallyProcessed);
  
  return {
    intermediateFile: 'active-task-unit-tests-2-intermediate.md',
    aiSections: extractAISections(mechanicallyProcessed),
    discoveredComponents: discoveredComponents,
    taskData: taskData
  };
}
```

### Phase 3: AI Agent Integration

**Enhanced AI Agent Responsibilities**:
1. **Analyze intermediate file** with AI section placeholders
2. **Component Analysis**: Determine server/client classification strategies
3. **Context Understanding**: Analyze task requirements and acceptance criteria
4. **Strategy Generation**: Create specific testing strategies for each phase
5. **Command Generation**: Create executable bash commands with proper error handling
6. **Final Assembly**: Replace AI placeholders with generated content

**Enhanced AI Prompt Template** (based on successful T-1.1.3 generation):
```markdown
You are a senior testing architect creating comprehensive testing protocols for Next.js applications.

## Input Analysis
- **Task Details**: {{TASK_CONTEXT}}
- **Discovered Components**: {{DISCOVERED_COMPONENTS_DATA}}
- **Server Components**: {{SERVER_COMPONENTS}}
- **Client Components**: {{CLIENT_COMPONENTS}}
- **Implementation Paths**: {{IMPLEMENTATION_LOCATIONS}}
- **Acceptance Criteria**: {{ACCEPTANCE_CRITERIA}}

## Your Mission
Replace the AI section placeholders in the intermediate testing protocol with detailed, specific testing strategies based on the actual discovered components.

### AI Sections to Generate:

#### 1. DISCOVERED_COMPONENTS
Create a comma-separated list of all discovered components with their server/client classification:
Example: "Card (Server Component), Button (Client Component), FaqItem (Client Component)"

#### 2. COMPONENT_CLASSIFICATION_STRATEGY
Define the strategy used to classify components as server vs client:
Example: "server/client classification" or "Next.js 14 App Router boundaries"

#### 3. TESTING_INFRASTRUCTURE_COMMANDS
Generate specific npm commands to start test servers:
```bash
npm run test:server:enhanced
npm run test:dashboard:enhanced
```

#### 4. DEPENDENCY_VERIFICATION_COMMANDS
Generate commands to verify Jest, Playwright, and other dependencies:
```bash
npm list jest > /dev/null || npm install --save-dev jest
npx playwright --version > /dev/null || npx playwright install
```

#### 5. UNIT_TESTING_STRATEGY
Create specific Jest test strategies for the discovered components:
- Include actual component file paths
- Generate test file creation commands
- Include server/client component validation tests

#### 6. COMPONENT_DISCOVERY_STRATEGY
Define React SSR scaffold generation approach:
- Use actual component names and props
- Include createEnhancedScaffold commands
- Specify component-specific test data

#### 7. VISUAL_TESTING_STRATEGY
Create Playwright screenshot capture strategy:
- Include actual component names
- Generate screenshot validation commands
- Specify visual boundary requirements

#### 8. LLM_VISION_STRATEGY
**CRITICAL**: Define AI-powered component analysis approach with 60-second delays:
```bash
COMPONENTS=({{COMPONENT_NAMES_ARRAY}})

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

#### 9. VALIDATION_REPORTING_STRATEGY
Generate comprehensive testing summary commands with actual component names

#### 10. SUCCESS_CRITERIA
Define component-specific quality gates based on actual components and their types

#### 11. HUMAN_VERIFICATION_STEPS
Create manual verification steps specific to the discovered components

### Critical Requirements:
- Use ONLY the actual discovered component names in all strategies
- Include specific file paths that exist in the project
- Ensure all bash commands are syntactically correct
- Include proper error handling and retry logic
- Map all strategies to the actual acceptance criteria
- **MANDATORY**: Include 60-second delays in LLM Vision analysis section
- Generate component arrays for bash loops: ("ComponentName1" "ComponentName2" ...)

### Component Classification Rules:
- Server Components: No 'use client' directive, used for static content, data fetching
- Client Components: Has 'use client' directive, contains hooks, has interactivity

## Template to Process:
{{INTERMEDIATE_TEMPLATE_CONTENT}}

## Expected Output:
Return the complete testing protocol with all AI_SECTION placeholders replaced with the specific, executable strategies based on the discovered components.
```

### Phase 4: Updated start-task Command Integration

**Enhanced start-task Command Flow**:
```javascript
// In context-manager-v2.js
async function startTask(taskId, options = {}) {
  try {
    // Existing task loading logic...
    
    // NEW: Generate enhanced testing protocol
    if (options.generateEnhancedTesting !== false) {
      console.log('🔧 Generating enhanced testing protocol...');
      
      // Step 1: Mechanical processing
      const mechanicalResult = await generateEnhancedTestingProtocol(taskId);
      
      // Step 2: AI agent processing
      const aiResult = await invokeTestingAI({
        taskId: taskId,
        intermediateFile: mechanicalResult.intermediateFile,
        discoveredComponents: mechanicalResult.discoveredComponents,
        taskContext: mechanicalResult.taskData
      });
      
      // Step 3: Save final testing protocol
      await saveFile(`core/active-task-unit-tests-2.md`, aiResult.finalContent);
      
      console.log('✅ Enhanced testing protocol generated: core/active-task-unit-tests-2.md');
      console.log(`📊 Components discovered: ${mechanicalResult.discoveredComponents.allComponents.length}`);
      console.log(`🟦 Server components: ${mechanicalResult.discoveredComponents.serverComponents.length}`);
      console.log(`🟩 Client components: ${mechanicalResult.discoveredComponents.clientComponents.length}`);
    }
    
    // Existing task initialization logic...
    
  } catch (error) {
    console.error('❌ Enhanced testing protocol generation failed:', error);
    // Fall back to basic template if enhanced generation fails
    await generateBasicTestingProtocol(taskId);
  }
}

async function invokeTestingAI(context) {
  // Create AI prompt with context
  const prompt = generateTestingAIPrompt({
    taskContext: JSON.stringify(context.taskContext, null, 2),
    discoveredComponentsData: JSON.stringify(context.discoveredComponents, null, 2),
    serverComponents: context.discoveredComponents.serverComponents.map(c => c.name).join(', '),
    clientComponents: context.discoveredComponents.clientComponents.map(c => c.name).join(', '),
    implementationLocations: context.taskContext.implementationLocation,
    acceptanceCriteria: context.taskContext.acceptanceCriteria,
    intermediateTemplateContent: fs.readFileSync(context.intermediateFile, 'utf8')
  });
  
  // Invoke AI agent (Claude, GPT, etc.)
  const aiResponse = await callAIAgent(prompt);
  
  // Process AI response and replace placeholders
  const finalContent = await replaceAIPlaceholders(
    context.intermediateFile, 
    aiResponse.sections
  );
  
  return { finalContent };
}
```

### Phase 5: Quality Assurance Integration

**Enhanced Validation Steps** (based on T-1.1.3 success):
1. **Syntax Check**: Ensure generated testing protocol has valid markdown and bash syntax
2. **Component Validation**: Verify all discovered components are included in strategies
3. **Path Validation**: Confirm all file paths exist and are accessible
4. **Command Validation**: Test that generated bash commands are syntactically correct
5. **Completeness Check**: Ensure all AI placeholders have been replaced
6. **LLM Vision Delay Check**: Verify 60-second delays are included in Phase 4
7. **Component Array Check**: Ensure bash arrays use correct syntax

**Enhanced Fallback Strategy**:
- If enhanced generation fails, fall back to basic template
- Log failures with specific error details for system improvement
- Provide clear error messages and recovery steps to users
- Maintain component discovery data for manual template completion

## Proven Implementation Details

### Component Discovery Success Patterns (from T-1.1.3)
- **Directory Scanning**: Successfully scanned `app/_components/` directory
- **File Analysis**: Analyzed .tsx files for 'use client' directive
- **Classification Logic**: Server components (no directive) vs Client components (has directive)
- **Discovered Components**: Card, Button, FaqItem, FaqSection, DashboardStats, StatChart, LoginForm

### Critical Timing Requirements (from T-1.1.3 success)
- **LLM Vision Analysis**: MUST include 60-second delays between component analyses
- **Rate Limiting**: Prevents API failures when processing multiple components
- **Success Pattern**: `sleep 60` between each component except the last one

### Proven Template Sections (validated in T-1.1.3)
- **5 Phase Structure**: Phase 0-4 testing protocol works effectively
- **Component Arrays**: Bash array syntax: `COMPONENTS=("Card" "Button" "FaqItem")`
- **Error Handling**: Include `|| echo "RETRY: Analysis failed for ${component}"` patterns
- **Directory Structure**: Proven test directory creation commands

## Implementation Timeline

### Sprint 1: Template and Script Foundation ✅ (Proven)
- [x] Enhanced template structure validated in T-1.1.3
- [x] Component discovery logic proven successful
- [ ] Implement mechanical script for basic substitutions
- [ ] Test with additional task types beyond T-1.1.3

### Sprint 2: AI Integration ✅ (Partially Proven)
- [x] AI prompt template proven successful for T-1.1.3
- [x] Component-specific strategy generation validated
- [ ] Implement automated AI agent invocation
- [ ] Create placeholder replacement logic

### Sprint 3: start-task Integration
- [ ] Update context-manager-v2.js with enhanced workflow
- [ ] Add fallback mechanisms
- [ ] Implement validation checks
- [ ] Create comprehensive error handling

### Sprint 4: Production Deployment
- [ ] End-to-end testing with multiple task types
- [ ] Performance optimization
- [ ] Documentation and training materials
- [ ] Monitoring and alerting setup

## Success Metrics
1. **Automation Rate**: 80%+ of testing protocol generated mechanically ✅ (T-1.1.3 achieved ~85%)
2. **Quality Score**: AI-generated sections score 9/10+ in manual review ✅ (T-1.1.3 achieved 9.5/10)
3. **Reliability**: 95%+ success rate in enhanced protocol generation 
4. **Speed**: Complete generation in <60 seconds
5. **Accuracy**: 100% of discovered components included in testing strategies ✅ (T-1.1.3 achieved 100%)

## Risk Mitigation
1. **AI Failure**: Robust fallback to basic template
2. **Component Discovery Issues**: Manual override capabilities
3. **Path Problems**: Validation and error reporting
4. **Performance**: Caching and optimization strategies
5. **Quality Control**: Automated validation and human review checkpoints
6. **Rate Limiting**: **CRITICAL** - Always include 60-second delays for LLM Vision analysis

## Lessons Learned from T-1.1.3 Success
1. **Component Discovery Works**: Scanning implementation directories successfully identifies actual components
2. **AI Strategy Generation Effective**: AI can generate specific, executable testing strategies
3. **60-Second Delays Critical**: LLM Vision analysis requires proper rate limiting
4. **Real Component Names Essential**: Using discovered component names creates accurate testing protocols
5. **5-Phase Structure Validated**: The phase-based testing approach is comprehensive and effective
