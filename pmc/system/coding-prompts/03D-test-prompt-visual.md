## PROMPT 4: VISUAL_TESTING_REQUIREMENTS

**Purpose**: Determine visual testing strategy based on task type and UI component requirements
**Input**: Task-specific visual context and component analysis
**Temperature**: 0.1  
**Output Location**: `pmc\system\plans\task-approach\current-test-approach.md` → ## Visual Testing Requirements

```markdown
PROMPT_VISUAL_TESTING_REQUIREMENTS:

You are determining the visual testing strategy for task T-1.1.5 based on task type and discovered UI elements.

## Task-Specific Visual Context:
- **Task**: T-1.1.5 - T-1.1.5: Layout and Metadata Implementation
- **UI Components Present**: Yes
- **Component Types**: Layout Component, Page Component
- **Legacy Design References**: C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\app\layout.jsx:1-30, C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\app\home-4\page.jsx:8-12
- **Visual Keywords**: layout, ui, component

## Previously Discovered Elements:
Review the ## Testable Elements Discovery section in current-test-approach.md to understand what UI elements exist.

## Targeted Analysis Questions:
1. **UI Component Analysis**: Task includes Yes UI components. Component types: Layout Component, Page Component
2. **Design Preservation Requirements**: Legacy design references: C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\app\layout.jsx:1-30, C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\app\home-4\page.jsx:8-12
3. **Visual Keywords Detected**: layout, ui, component
4. **Cross-Component Visual Integration**: Do components need to work together visually?
5. **Accessibility Visual Requirements**: Are there visual accessibility standards to meet?

## Decision Logic:
- **Require Visual Testing If**: 
  - Task involves UI components with visual presentation (Yes)
  - Task mentions visual validation, design preservation, or layout requirements (layout, ui, component)
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
- **Component Types**: Layout Component, Page Component

### Visual Validation Points
- **Layout Validation**: [Specific layout elements to validate]
- **Responsive Validation**: [Breakpoints and responsive behaviors to test]
- **Component Integration**: [How components should work together visually]
- **Design Consistency**: [Specific design elements to preserve from: C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\app\layout.jsx:1-30, C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\app\home-4\page.jsx:8-12]

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
- Consider UI components: Yes
- Reference legacy designs: C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\app\layout.jsx:1-30, C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\app\home-4\page.jsx:8-12
- Consider visual keywords: layout, ui, component
- Include accessibility visual validation for interactive components
- Plan for both automated (LLM Vision) and manual validation approaches
- Always include rate limiting for LLM Vision API calls
