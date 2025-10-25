## PROMPT 1: TESTABLE_ELEMENTS_DISCOVERY_AND_CLASSIFICATION

**Purpose**: Discover all testable elements created by the task and classify their testing approach
**Input**: Task-specific context from `pmc\core\active-task.md`
**Temperature**: 0.1
**Output Location**: `pmc\system\plans\task-approach\current-test-approach.md` → ## Testable Elements Discovery

```markdown
PROMPT_TESTABLE_ELEMENTS_DISCOVERY_AND_CLASSIFICATION:

You are analyzing Next.js 14 task T-1.1.5 (P013-LAYOUT-COMPONENT) to discover all testable elements and classify their optimal testing approach.

## Task-Specific Context:
- **Task**: T-1.1.5 - T-1.1.5: Layout and Metadata Implementation
- **Pattern**: P013-LAYOUT-COMPONENT
- **Description**: Implement layouts and metadata for optimal code sharing and SEO
- **Implementation Location**: C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-modern-1\app
- **Elements to Analyze**: 1 elements
- **Element Preview**: Layout implementation

## Targeted Analysis Process:
1. **Focus on Components/Elements Section**: Review the 1 elements starting with: Layout implementation
2. **Examine Implementation at**: C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-modern-1\app with pattern P013-LAYOUT-COMPONENT
3. **Review Legacy References**: C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\app\layout.jsx:1-30, C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\app\home-4\page.jsx:8-12
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
- Find ALL testable elements mentioned in the 1 Components/Elements
- Classify each element by its most appropriate testing approach
- Include realistic Next.js 14 element names based on P013-LAYOUT-COMPONENT implementation
- Prioritize elements based on user impact and complexity
- Consider legacy references: C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\app\layout.jsx:1-30, C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\app\home-4\page.jsx:8-12
```

