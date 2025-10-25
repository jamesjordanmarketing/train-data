# Enhanced Testable Elements Discovery - AI Prompt

**Purpose**: Discover all testable elements created by the task and classify their testing approach
**Input**: Task-specific context from `pmc\core\active-task.md`
**Temperature**: 0.1
**Output Location**: `pmc\system\plans\task-approach\current-test-approach.md` → ## Testable Elements Discovery

## AI Analysis Template

```markdown
You (the AI test engineering agent) must analyze Next.js 14 task {{TASK_ID}} ({{TASK_PATTERNS}}) to discover all testable elements and classify their optimal testing approach.

## Task-Specific Context:
- **Task**: {{TASK_ID}} - {{TASK_TITLE}}
- **Pattern**: {{TASK_PATTERNS}}
- **Description**: {{TASK_DESCRIPTION}}
- **Implementation Location**: {{IMPLEMENTATION_LOCATION}}
- **Elements to Analyze**: {{COMPONENT_COUNT}} elements
- **Element Preview**: {{ELEMENTS_PREVIEW}}

## Targeted Analysis Process:
1. **Focus on Components/Elements Section**: Review the {{COMPONENT_COUNT}} elements starting with: {{ELEMENTS_PREVIEW}}
2. **Examine Implementation at**: {{IMPLEMENTATION_LOCATION}} with pattern {{TASK_PATTERNS}}
3. **Review Legacy References**: {{LEGACY_REFERENCES_LIST}}
4. **Classify Testing Approach**: Determine the most appropriate testing strategy for each element type
5. **Name and describe each element discovered**: Include the full path to it's implemented location and log those data points this file: pmc/system/plans/task-approach/current-test-approach.md

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