# Revised Testing Protocol AI Prompt Execution Plan

## Overview
This document defines AI prompts for discovering and inferring testing requirements from active task instructions. The prompts analyze `pmc\core\active-task.md` to extract components, implementation details, and testing strategies that cannot be mechanically parsed.

## Core Principles
1. **Discovery-Based**: AI prompts discover components and requirements from task implementation paths
2. **Inference-Focused**: AI extrapolates testing needs from high-level task descriptions 
3. **Single Input Source**: Only `pmc\core\active-task.md` is provided as input
4. **Minimal Prompt Set**: Only include prompts that require AI reasoning vs mechanical processing

## Execution Strategy

### Sequential Execution (Required)
All prompts must execute sequentially because each discovery builds context for subsequent analysis.

### Temperature Control
- **Discovery prompts**: temperature=0.1 (consistency in component identification)
- **Analysis prompts**: temperature=0.0 (precision in classification and validation logic)

## AI Section Prompts

### PROMPT 1: COMPONENT_DISCOVERY_AND_CLASSIFICATION
**Purpose**: Discover implemented components and classify server vs client nature
**Input**: Complete `pmc\core\active-task.md` content
**Temperature**: 0.1
**Output**: Component list with server/client classifications

```markdown
PROMPT_COMPONENT_DISCOVERY_AND_CLASSIFICATION:

You are analyzing a completed Next.js task to discover all implemented components and classify them as Server or Client components.

## Task Instructions Input:
```
{{ACTIVE_TASK_CONTENT}}
```

## Your Analysis Process:
1. **Examine Recent Actions**: Look for clues about what components were actually implemented
2. **Analyze Implementation Paths**: Follow file path references to understand component locations
3. **Infer from Task Type**: Based on "Server Component Implementation", determine what types of components would be created
4. **Extract Implementation Details**: Find any specific component names mentioned in task elements or descriptions

## Classification Logic:
- **Server Components**: Non-interactive elements (cards, static sections, layouts, stats displays)
- **Client Components**: Interactive elements (buttons, forms, charts, dropdowns, modals)

## Required Output Format:
Generate a comma-separated list in this exact format:
```
ComponentName1 (Server Component), ComponentName2 (Client Component), ComponentName3 (Server Component)
```

## Discovery Requirements:
- Find ALL components mentioned or implied in the task
- Classify each as Server or Client based on interactivity
- Use realistic Next.js component names
- Include 4-8 components total
```

### PROMPT 2: TESTING_INFRASTRUCTURE_ANALYSIS
**Purpose**: Analyze task requirements to determine testing tools and file structure needs
**Input**: Complete `pmc\core\active-task.md` content  
**Temperature**: 0.0
**Output**: Testing infrastructure requirements

```markdown
PROMPT_TESTING_INFRASTRUCTURE_ANALYSIS:

You are analyzing task requirements to determine testing infrastructure needs.

## Task Instructions Input:
```
{{ACTIVE_TASK_CONTENT}}
```

## Analysis Focus:
1. **Extract Test Location**: Find the specified test directory path
2. **Identify Testing Tools**: Extract testing tools mentioned (Jest, Playwright, etc.)
3. **Determine Test Types**: Infer what types of tests are needed based on task acceptance criteria
4. **Analyze Coverage Requirements**: Extract any coverage requirements mentioned

## Required Output (JSON Format):
```json
{
  "testDirectory": "extracted/test/path",
  "testingTools": ["Jest", "React Testing Library", "Playwright"],
  "testTypes": ["unit", "component", "visual"],
  "coverageRequirement": "90%",
  "testFilePattern": "*.test.tsx"
}
```

## Inference Rules:
- If no test directory specified, infer from task ID pattern
- Server/Client component tasks require unit + component testing  
- Visual validation mentioned = add visual testing
- Default to 80% coverage if not specified
```

### PROMPT 3: VALIDATION_CRITERIA_EXTRACTION  
**Purpose**: Extract and interpret acceptance criteria into testable validation points
**Input**: Complete `pmc\core\active-task.md` content
**Temperature**: 0.0
**Output**: Testable validation criteria

```markdown
PROMPT_VALIDATION_CRITERIA_EXTRACTION:

You are extracting acceptance criteria and converting them into specific, testable validation points.

## Task Instructions Input:
```
{{ACTIVE_TASK_CONTENT}}
```

## Analysis Process:
1. **Extract Acceptance Criteria**: Find the exact acceptance criteria listed
2. **Identify Validation Phase Steps**: Extract VAL-# steps that define testing requirements
3. **Interpret Testing Implications**: Convert high-level requirements into specific test cases
4. **Map Components to Criteria**: Connect discovered components to acceptance requirements

## Required Output (JSON Format):
```json
{
  "acceptanceCriteria": [
    {
      "requirement": "exact text from acceptance criteria",
      "testValidation": "specific test that validates this requirement",
      "applicableComponents": ["Component1", "Component2"]
    }
  ],
  "validationSteps": [
    {
      "step": "VAL-1 exact text",
      "testType": "unit|component|visual|integration", 
      "validationMethod": "specific testing approach"
    }
  ],
  "successCriteria": {
    "serverComponentValidation": "how to verify server components",
    "clientComponentValidation": "how to verify client components", 
    "compositionValidation": "how to verify server/client composition"
  }
}
```
```

### PROMPT 4: VISUAL_TESTING_REQUIREMENTS
**Purpose**: Determine if visual testing is needed and extract visual validation requirements
**Input**: Complete `pmc\core\active-task.md` content
**Temperature**: 0.1  
**Output**: Visual testing strategy or null if not needed

```markdown
PROMPT_VISUAL_TESTING_REQUIREMENTS:

You are determining whether visual testing is required for this task and extracting visual validation needs.

## Task Instructions Input:
```
{{ACTIVE_TASK_CONTENT}}
```

## Analysis Questions:
1. **UI Component Task?**: Does this task involve visual UI components?
2. **Design Preservation Required?**: Any mentions of preserving design, layout, or visual fidelity?
3. **Component Rendering Validation?**: Need to verify components render correctly?
4. **Cross-Component Visual Validation?**: Need to verify component composition visually?

## Decision Logic:
- **Require Visual Testing If**: Task involves UI components, mentions visual validation, or requires design preservation
- **Skip Visual Testing If**: Pure logic/API task with no visual components

## Required Output:
If visual testing needed:
```json
{
  "visualTestingRequired": true,
  "screenshotStrategy": "component-level|page-level|both",
  "visualValidationPoints": [
    "specific visual elements to validate"
  ],
  "llmVisionAnalysis": true,
  "rateLimit": "60 seconds between LLM vision calls"
}
```

If not needed:
```json
{
  "visualTestingRequired": false,
  "reason": "explanation why visual testing not needed"
}
```
```

## Execution Flow

### Phase 1: Component Discovery (Sequential)
1. Execute PROMPT_COMPONENT_DISCOVERY_AND_CLASSIFICATION
2. Parse component list for subsequent prompts

### Phase 2: Infrastructure Analysis (Sequential) 
1. Execute PROMPT_TESTING_INFRASTRUCTURE_ANALYSIS
2. Execute PROMPT_VALIDATION_CRITERIA_EXTRACTION  
3. Execute PROMPT_VISUAL_TESTING_REQUIREMENTS

### Phase 3: Template Population (Mechanical)
1. Use discovered components to populate test templates
2. Use infrastructure analysis to generate command structures
3. Use validation criteria to create success metrics
4. Use visual requirements to configure screenshot/analysis workflows

## Key Improvements from Original
1. **Reduced from 11 to 4 prompts** - eliminated mechanical formatting prompts
2. **Discovery-focused** - prompts discover components from task implementation
3. **Single input source** - only uses `active-task.md` content
4. **AI-appropriate tasks** - focuses on inference, classification, and requirement extraction
5. **Mechanical template population** - testing instructions generated via templates, not AI prompts

## Template Integration
The mechanical system will use these AI discoveries to populate templates like:
```
You are creating {{TEST_TYPE}} tests for the following components: {{DISCOVERED_COMPONENTS}}
Test each component for: {{VALIDATION_CRITERIA}}  
Use testing tools: {{TESTING_TOOLS}}
Save tests to: {{TEST_DIRECTORY}}
```
