## PROMPT 2: TESTING_INFRASTRUCTURE_ANALYSIS

**Purpose**: Analyze task requirements to determine testing tools, environment needs, and test execution strategy
**Input**: Task-specific infrastructure context
**Temperature**: 0.0
**Output Location**: `pmc\system\plans\task-approach\current-test-approach.md` → ## Testing Infrastructure Analysis

```markdown
PROMPT_TESTING_INFRASTRUCTURE_ANALYSIS:

You are analyzing task T-1.1.5 requirements and discovered testable elements to determine optimal testing infrastructure and execution strategy.

## Task-Specific Infrastructure Context:
- **Task**: T-1.1.5 - T-1.1.5: Layout and Metadata Implementation  
- **Testing Tools Specified**: Jest, React Testing Library, Lighthouse, Cheerio
- **Test Location**: **Test Locations**:
- **Coverage Requirement**: 90% code coverage
- **Task Dependencies**: T-1.1.4

## Previously Discovered Elements:
Review the ## Testable Elements Discovery section in current-test-approach.md to understand what needs testing.

## Targeted Analysis Focus:
1. **Use Specified Tools**: Task specifies these testing tools: Jest, React Testing Library, Lighthouse, Cheerio. Focus your infrastructure analysis on optimizing for these specific tools.
2. **Use Test Location**: **Test Locations**: and plan infrastructure for 90% code coverage coverage
3. **Consider Dependencies**: T-1.1.4 may affect testing infrastructure setup
4. **Map Element Types**: Based on discovered elements, identify required test types (unit, component, integration, visual, accessibility)
5. **Plan Execution Strategy**: Determine optimal test running approach

## Required Output:
Write your findings to the ## Testing Infrastructure Analysis section of current-test-approach.md:

```
## Testing Infrastructure Analysis

### Test Directory Structure
- Primary test location: **Test Locations**:
- Test file organization: [based on discovered element types]
- Required subdirectories: [for different test types]

### Testing Tools Required
- **Specified Tools**: Jest, React Testing Library, Lighthouse, Cheerio
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
- **Dependency Considerations**: T-1.1.4

### Execution Strategy
- **Test Coverage Target**: 90% code coverage
- **Test Running Order**: [Optimal sequence for test execution]
- **Performance Considerations**: [Any performance testing requirements]
```

## Infrastructure Rules:
- Prioritize specified tools: Jest, React Testing Library, Lighthouse, Cheerio
- Use exact test location: **Test Locations**:
- Target coverage: 90% code coverage
- Consider task dependencies: T-1.1.4
```

