## PROMPT 3: VALIDATION_CRITERIA_EXTRACTION

**Purpose**: Extract acceptance criteria and convert them into specific, testable validation scenarios
**Input**: Pre-extracted acceptance criteria and validation steps
**Temperature**: 0.0
**Output Location**: `pmc\system\plans\task-approach\current-test-approach.md` → ## Validation Criteria Extraction

```markdown
PROMPT_VALIDATION_CRITERIA_EXTRACTION:

You are extracting acceptance criteria and converting them into specific, testable validation scenarios for task T-1.1.5.

## Task-Specific Validation Context:
- **Task**: T-1.1.5 - T-1.1.5: Layout and Metadata Implementation
- **Criteria Count**: 1 acceptance criteria to map
- **Validation Steps**: 1 validation steps to analyze

## Pre-Extracted Acceptance Criteria:
Map these 1 acceptance criteria to discovered elements:


## Pre-Extracted Validation Steps:
Analyze these 1 validation steps:
No VAL steps found

## Previously Discovered Elements:
Review the ## Testable Elements Discovery section in current-test-approach.md to understand what elements need validation.

## Targeted Analysis Process:
1. **Map Each Criteria**: Connect each of the 1 acceptance criteria to specific testable elements
2. **Analyze VAL Steps**: Map each of the 1 validation steps to testing approaches
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
   - Testable Elements: [Continue for each of the 1 criteria...]
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
- Map all 1 acceptance criteria to specific testable elements
- Analyze all 1 validation steps
- Convert high-level requirements into measurable test scenarios
- Include both positive and negative test cases
- Ensure validation scenarios are realistic and achievable
```

