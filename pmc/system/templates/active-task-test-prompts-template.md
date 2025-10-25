# Enhanced Testing Protocol AI Prompt Templates v4.0
# Generated for Task: {{TASK_ID}} - {{TASK_TITLE}}

## Template Variables Reference
- Task Context: {{TASK_ID}}, {{TASK_TITLE}}, {{TASK_DESCRIPTION}}, {{TASK_PATTERN}}
- Implementation: {{IMPLEMENTATION_LOCATION}}, {{LEGACY_REFERENCES}}
- Elements: {{ELEMENT_COUNT}}, {{ELEMENT_LIST_PREVIEW}}, {{HAS_UI_COMPONENTS}}, {{COMPONENT_TYPES}}
- Testing: {{TESTING_TOOLS}}, {{TEST_LOCATIONS}}, {{COVERAGE_REQUIREMENT}}
- Validation: {{ACCEPTANCE_CRITERIA_LIST}}, {{VALIDATION_STEPS_LIST}}, {{CRITERIA_COUNT}}, {{VALIDATION_COUNT}}
- Visual: {{LEGACY_VISUAL_REFERENCES}}, {{VISUAL_KEYWORDS}}

## PROMPT 1: TESTABLE_ELEMENTS_DISCOVERY_AND_CLASSIFICATION

**Purpose**: Discover all testable elements created by the task and classify their testing approach
**Input**: Task-specific context from `pmc\core\active-task.md`
**Temperature**: 0.1
**Output Location**: `pmc\system\plans\task-approach\current-test-approach.md` → ## Testable Elements Discovery

```markdown
PROMPT_TESTABLE_ELEMENTS_DISCOVERY_AND_CLASSIFICATION:

You are analyzing Next.js 14 task {{TASK_ID}} ({{TASK_PATTERN}}) to discover all testable elements and classify their optimal testing approach.

## Task-Specific Context:
- **Task**: {{TASK_ID}} - {{TASK_TITLE}}
- **Pattern**: {{TASK_PATTERN}}
- **Description**: {{TASK_DESCRIPTION}}
- **Implementation Location**: {{IMPLEMENTATION_LOCATION}}
- **Elements to Analyze**: {{ELEMENT_COUNT}} elements
- **Element Preview**: {{ELEMENT_LIST_PREVIEW}}

## Targeted Analysis Process:
1. **Focus on Components/Elements Section**: Review the {{ELEMENT_COUNT}} elements starting with: {{ELEMENT_LIST_PREVIEW}}
2. **Examine Implementation at**: {{IMPLEMENTATION_LOCATION}} with pattern {{TASK_PATTERN}}
3. **Review Legacy References**: {{LEGACY_REFERENCES}}
4. **Classify Testing Approach**: Determine the most appropriate testing strategy for each element type

## Element Classification Logic:
- **React Components**: 
  - Server Components (non-interactive): Render testing, props validation, server-side behavior
  - Client Components (interactive): User interaction testing, state management, event handling
- **Utility Functions**: Unit testing for input/output, edge cases, type safety
- **Infrastructure Elements**: 
  - loading.tsx/error.tsx: Error simulation, loading state validation
  - Route handlers: Request/response testing, error handling
- **Type Definitions**: Type checking, interface compliance testing
- **Design System Elements**: Component variant testing, design token validation

## Required Output Format:
Write your findings to the ## Testable Elements Discovery section of current-test-approach.md:

```
## Testable Elements Discovery

### React Components
- ComponentName1 (Server Component): Description of component purpose and testing focus
- ComponentName2 (Client Component): Description of interactive features requiring testing

### Utility Functions  
- UtilityFunction1: Description of function purpose and testing requirements
- UtilityFunction2: Description of expected inputs/outputs and edge cases

### Infrastructure Elements
- loading.tsx: Loading state validation requirements
- error.tsx: Error handling scenarios to test

### Type Definitions
- InterfaceName: Type safety and compliance testing requirements

### Testing Priority Classification
- **High Priority**: Critical user-facing elements requiring comprehensive testing
- **Medium Priority**: Supporting elements requiring basic validation  
- **Low Priority**: Type definitions and simple utilities requiring minimal testing
```

## Discovery Requirements:
- Find ALL testable elements mentioned in the {{ELEMENT_COUNT}} Components/Elements
- Classify each element by its most appropriate testing approach
- Include realistic Next.js 14 element names based on {{TASK_PATTERN}} implementation
- Prioritize elements based on user impact and complexity
- Consider legacy references: {{LEGACY_REFERENCES}}
```

## PROMPT 2: TESTING_INFRASTRUCTURE_ANALYSIS

**Purpose**: Analyze task requirements to determine testing tools, environment needs, and test execution strategy
**Input**: Task-specific infrastructure context
**Temperature**: 0.0
**Output Location**: `pmc\system\plans\task-approach\current-test-approach.md` → ## Testing Infrastructure Analysis

```markdown
PROMPT_TESTING_INFRASTRUCTURE_ANALYSIS:

You are analyzing task {{TASK_ID}} requirements and discovered testable elements to determine optimal testing infrastructure and execution strategy.

## Task-Specific Infrastructure Context:
- **Task**: {{TASK_ID}} - {{TASK_TITLE}}  
- **Testing Tools Specified**: {{TESTING_TOOLS}}
- **Test Location**: {{TEST_LOCATIONS}}
- **Coverage Requirement**: {{COVERAGE_REQUIREMENT}}
- **Task Dependencies**: {{TASK_DEPENDENCIES}}

## Previously Discovered Elements:
Review the ## Testable Elements Discovery section in current-test-approach.md to understand what needs testing.

## Targeted Analysis Focus:
1. **Use Specified Tools**: Task specifies these testing tools: {{TESTING_TOOLS}}. Focus your infrastructure analysis on optimizing for these specific tools.
2. **Use Test Location**: {{TEST_LOCATIONS}} and plan infrastructure for {{COVERAGE_REQUIREMENT}} coverage
3. **Consider Dependencies**: {{TASK_DEPENDENCIES}} may affect testing infrastructure setup
4. **Map Element Types**: Based on discovered elements, identify required test types (unit, component, integration, visual, accessibility)
5. **Plan Execution Strategy**: Determine optimal test running approach

## Required Output:
Write your findings to the ## Testing Infrastructure Analysis section of current-test-approach.md:

```
## Testing Infrastructure Analysis

### Test Directory Structure
- Primary test location: {{TEST_LOCATIONS}}
- Test file organization: [based on discovered element types]
- Required subdirectories: [for different test types]

### Testing Tools Required
- **Specified Tools**: {{TESTING_TOOLS}}
- **Unit Testing**: Jest + TypeScript for utility functions and pure logic
- **Component Testing**: React Testing Library for component behavior
- **Visual Testing**: [Playwright/Storybook if UI components discovered]
- **Accessibility Testing**: [Axe-core if interactive components discovered]
- **Integration Testing**: [MSW/Supertest if API integration discovered]

### Test Types Mapping
- **Unit Tests**: [List utility functions and pure logic requiring unit tests]
- **Component Tests**: [List React components requiring component testing]
- **Visual Tests**: [List UI elements requiring visual validation]
- **Integration Tests**: [List cross-component or API interactions requiring integration testing]

### Environment Requirements
- **Mock Dependencies**: [List external dependencies requiring mocking]
- **Test Data**: [Describe test data requirements for realistic testing]
- **Special Setup**: [Any special environment configuration needed]
- **Dependency Considerations**: {{TASK_DEPENDENCIES}}

### Execution Strategy
- **Test Coverage Target**: {{COVERAGE_REQUIREMENT}}
- **Test Running Order**: [Optimal sequence for test execution]
- **Performance Considerations**: [Any performance testing requirements]
```

## Infrastructure Rules:
- Prioritize specified tools: {{TESTING_TOOLS}}
- Use exact test location: {{TEST_LOCATIONS}}
- Target coverage: {{COVERAGE_REQUIREMENT}}
- Consider task dependencies: {{TASK_DEPENDENCIES}}
```

## PROMPT 3: VALIDATION_CRITERIA_EXTRACTION

**Purpose**: Extract acceptance criteria and convert them into specific, testable validation scenarios
**Input**: Pre-extracted acceptance criteria and validation steps
**Temperature**: 0.0
**Output Location**: `pmc\system\plans\task-approach\current-test-approach.md` → ## Validation Criteria Extraction

```markdown
PROMPT_VALIDATION_CRITERIA_EXTRACTION:

You are extracting acceptance criteria and converting them into specific, testable validation scenarios for task {{TASK_ID}}.

## Task-Specific Validation Context:
- **Task**: {{TASK_ID}} - {{TASK_TITLE}}
- **Criteria Count**: {{CRITERIA_COUNT}} acceptance criteria to map
- **Validation Steps**: {{VALIDATION_COUNT}} validation steps to analyze

## Pre-Extracted Acceptance Criteria:
Map these {{CRITERIA_COUNT}} acceptance criteria to discovered elements:
{{ACCEPTANCE_CRITERIA_LIST}}

## Pre-Extracted Validation Steps:
Analyze these {{VALIDATION_COUNT}} validation steps:
{{VALIDATION_STEPS_LIST}}

## Previously Discovered Elements:
Review the ## Testable Elements Discovery section in current-test-approach.md to understand what elements need validation.

## Targeted Analysis Process:
1. **Map Each Criteria**: Connect each of the {{CRITERIA_COUNT}} acceptance criteria to specific testable elements
2. **Analyze VAL Steps**: Map each of the {{VALIDATION_COUNT}} validation steps to testing approaches
3. **Define Success Scenarios**: Convert high-level requirements into specific test scenarios
4. **Identify Edge Cases**: Determine boundary conditions and error scenarios to test

## Required Output:
Write your findings to the ## Validation Criteria Extraction section of current-test-approach.md:

```
## Validation Criteria Extraction

### Acceptance Criteria Mapping
1. **[First acceptance criteria from list above]**
   - Testable Elements: [List specific elements that validate this criteria]
   - Test Scenarios: [Specific test cases that prove this criteria is met]
   - Success Conditions: [Measurable outcomes that demonstrate success]

2. **[Second acceptance criteria from list above]**
   - Testable Elements: [Continue for each of the {{CRITERIA_COUNT}} criteria...]
   - Test Scenarios: [...]
   - Success Conditions: [...]

### Validation Phase Steps
- **[First VAL step from list above]**
  - Testing Approach: [How to test this validation step]
  - Required Tools: [Testing tools needed for this validation]
  - Expected Outcome: [What success looks like]

### Element-Specific Validation Requirements
- **React Components**:
  - Rendering validation: [Ensure components render without errors]
  - Props validation: [Test all prop combinations and edge cases]
  - Interaction validation: [Test user interactions and state changes]

- **Utility Functions**:
  - Input validation: [Test all input types and edge cases]
  - Output validation: [Verify correct outputs for all scenarios]
  - Error handling: [Test error conditions and boundary cases]

- **Infrastructure Elements**:
  - Error state validation: [Test error handling and recovery]
  - Loading state validation: [Test loading behaviors and timeouts]
  - Route validation: [Test routing and navigation behaviors]

### Success Criteria Summary
- **Primary Success Indicators**: [Key metrics that demonstrate task completion]
- **Quality Gates**: [Minimum quality standards that must be met]
- **Performance Benchmarks**: [Any performance requirements to validate]
```

## Extraction Rules:
- Map all {{CRITERIA_COUNT}} acceptance criteria to specific testable elements
- Analyze all {{VALIDATION_COUNT}} validation steps
- Convert high-level requirements into measurable test scenarios
- Include both positive and negative test cases
- Ensure validation scenarios are realistic and achievable
```

## PROMPT 4: VISUAL_TESTING_REQUIREMENTS

**Purpose**: Determine visual testing strategy based on task type and UI component requirements
**Input**: Task-specific visual context and component analysis
**Temperature**: 0.1  
**Output Location**: `pmc\system\plans\task-approach\current-test-approach.md` → ## Visual Testing Requirements

```markdown
PROMPT_VISUAL_TESTING_REQUIREMENTS:

You are determining the visual testing strategy for task {{TASK_ID}} based on task type and discovered UI elements.

## Task-Specific Visual Context:
- **Task**: {{TASK_ID}} - {{TASK_TITLE}}
- **UI Components Present**: {{HAS_UI_COMPONENTS}}
- **Component Types**: {{COMPONENT_TYPES}}
- **Legacy Design References**: {{LEGACY_VISUAL_REFERENCES}}
- **Visual Keywords**: {{VISUAL_KEYWORDS}}

## Previously Discovered Elements:
Review the ## Testable Elements Discovery section in current-test-approach.md to understand what UI elements exist.

## Targeted Analysis Questions:
1. **UI Component Analysis**: Task includes {{HAS_UI_COMPONENTS}} UI components. Component types: {{COMPONENT_TYPES}}
2. **Design Preservation Requirements**: Legacy design references: {{LEGACY_VISUAL_REFERENCES}}
3. **Visual Keywords Detected**: {{VISUAL_KEYWORDS}}
4. **Cross-Component Visual Integration**: Do components need to work together visually?
5. **Accessibility Visual Requirements**: Are there visual accessibility standards to meet?

## Decision Logic:
- **Require Visual Testing If**: 
  - Task involves UI components with visual presentation ({{HAS_UI_COMPONENTS}})
  - Task mentions visual validation, design preservation, or layout requirements ({{VISUAL_KEYWORDS}})
  - Task requires responsive behavior across breakpoints
  - Task involves component composition that affects visual presentation

- **Skip Visual Testing If**: 
  - Task focuses on pure logic, utilities, or API functionality
  - Task involves only infrastructure elements without visual presentation
  - Task explicitly states no visual requirements

## Required Output:
Write your findings to the ## Visual Testing Requirements section of current-test-approach.md:

If visual testing is needed:
```
## Visual Testing Requirements

### Visual Testing Strategy
- **Testing Required**: Yes
- **Testing Scope**: [component-level|page-level|both]
- **Primary Focus**: [Layout preservation|Responsive behavior|Component integration|Design fidelity]
- **Component Types**: {{COMPONENT_TYPES}}

### Visual Validation Points
- **Layout Validation**: [Specific layout elements to validate]
- **Responsive Validation**: [Breakpoints and responsive behaviors to test]
- **Component Integration**: [How components should work together visually]
- **Design Consistency**: [Specific design elements to preserve from: {{LEGACY_VISUAL_REFERENCES}}]

### Visual Testing Implementation
- **Screenshot Strategy**: [When and what to capture]
- **Comparison Method**: [How to validate visual correctness]
- **LLM Vision Analysis**: 
  - Required: Yes
  - Analysis Focus: [What aspects need AI visual analysis]
  - Rate Limiting: 60 seconds between LLM vision calls
- **Manual Validation Points**: [Elements requiring human verification]

### Visual Testing Tools
- **Primary Tool**: [Playwright for screenshots + LLM Vision for analysis]
- **Fallback Method**: [Manual validation checklist if automated fails]
- **Integration**: [How visual tests integrate with other test types]
```

If visual testing is not needed:
```
## Visual Testing Requirements

### Visual Testing Strategy
- **Testing Required**: No
- **Reason**: [Specific explanation why visual testing is not needed]
- **Alternative Validation**: [How to validate functionality without visual testing]

### Non-Visual Validation Focus
- **Functional Testing**: [Focus on behavior and logic validation]
- **Performance Testing**: [Focus on performance and efficiency]
- **Integration Testing**: [Focus on API and data flow validation]
```

## Visual Testing Rules:
- Consider UI components: {{HAS_UI_COMPONENTS}}
- Reference legacy designs: {{LEGACY_VISUAL_REFERENCES}}
- Consider visual keywords: {{VISUAL_KEYWORDS}}
- Include accessibility visual validation for interactive components
- Plan for both automated (LLM Vision) and manual validation approaches
- Always include rate limiting for LLM Vision API calls
