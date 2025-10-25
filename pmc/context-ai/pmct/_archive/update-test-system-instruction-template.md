# PMC Enhanced Testing Template Specification

## Project Overview

**Objective**: Create a new enhanced testing instruction template (`active-task-test-template-2.md`) that integrates the comprehensive AI testing agent instructions from `pmc/core/active-task-unit-tests-qa-agent-visual-v7.md` into the PMC task management system.

**Scope**: Replace the existing basic testing template (`active-task-test-template.md`) with an enhanced version that includes Enhanced LLM Vision Analyzer capabilities, React SSR testing, visual regression testing, and autonomous fix/test/analyze cycles.

**Key Requirements**: 
- Maintain PMC template variable system compatibility
- Preserve Enhanced LLM Vision Analyzer integration
- Ensure autonomous testing capabilities
- Simplify and organize for clarity
- Enable automatic generation through `start-task` command

## Detailed Requirements

### 1. Template Structure and Organization

#### Required Template File
- **Location**: `pmc/system/templates/active-task-test-template-2.md`
- **Purpose**: Replace `active-task-test-template.md` as the primary testing template
- **Format**: Markdown with PMC template variables in `{{VARIABLE_NAME}}` format

#### Document Structure Requirements
```markdown
# Unit Tests for {{TASK_ID}}: {{TASK_TITLE}}

## Table of Contents
[Clear navigation structure with 5 main phases]

## Overview
[Brief description with mission statement and fix/test/analyze cycle explanation]

## Pre-Testing Environment Setup
[Phase 0: Environment verification and setup]

## Phase 1: Unit Testing
[Traditional Jest-based testing with component validation]

## Phase 2: Component Discovery & React SSR
[Component import and enhanced scaffold generation]

## Phase 3: Visual Testing
[Screenshot capture and visual regression testing]

## Phase 4: LLM Vision Analysis
[Enhanced LLM Vision Analyzer execution and validation]

## Phase 5: Validation & Reporting
[Results compilation and final reporting]

## Success Criteria & Quality Gates
[Clear pass/fail criteria for each phase]

## Autonomous Execution Commands
[Quick reference for autonomous testing agent]

## Human Verification
[Manual validation steps and report locations]
```

### 2. Template Variables Integration

#### Essential Template Variables
The new template must support all existing PMC template variables plus new enhanced testing variables:

**Existing PMC Variables** (must be preserved):
- `{{TASK_ID}}` - Task identifier (e.g., T-1.1.3)
- `{{TASK_TITLE}}` - Task title 
- `{{IMPLEMENTATION_LOCATION}}` - Implementation file location
- `{{TEST_LOCATIONS}}` - Test file locations
- `{{TESTING_TOOLS}}` - Testing tools specification
- `{{TEST_COVERAGE}}` - Coverage requirements
- `{{ACCEPTANCE_CRITERIA_SECTION}}` - Acceptance criteria

**New Enhanced Testing Variables** (to be added):
```javascript
// Component organization variables
'{{SERVER_COMPONENTS}}' - JSON array of server component names
'{{CLIENT_COMPONENTS}}' - JSON array of client component names  
'{{ALL_COMPONENTS}}' - Combined list of all task components

// Directory structure variables
'{{TEST_DIRECTORY}}' - Task-specific test directory (e.g., task-1-1/T-1.1.3)
'{{SCREENSHOT_DIRECTORY}}' - Screenshot output directory
'{{SCAFFOLD_DIRECTORY}}' - Enhanced scaffold directory
'{{VISION_RESULTS_DIRECTORY}}' - LLM Vision analysis results directory

// Command template variables
'{{PROJECT_ROOT}}' - Base project directory (aplio-modern-1)
'{{ENHANCED_VISION_COMMAND}}' - Enhanced LLM Vision Analyzer command template
'{{TEST_RETRY_COUNT}}' - Default retry attempts for fix/test/analyze cycles

// Testing configuration variables
'{{TEST_SERVER_PORT}}' - Enhanced test server port (3333)
'{{DASHBOARD_PORT}}' - Test dashboard port (3334)
'{{VISION_CONFIDENCE_THRESHOLD}}' - Minimum confidence score (0.95)
```

#### Template Variable Processing Requirements
- All template variables must be processed by existing `processTemplateV2` function
- Component lists must be generated from task element data in `context-manager-v2.js`
- Command templates must work with variable substitution
- Default values must be provided for all optional variables

### 3. Content Simplification Requirements

#### Content Reduction Goals
Transform the 973-line comprehensive instructions into approximately 300-400 lines by:

**Remove**:
- Task-specific hard-coded content (T-1.1.3 references)
- Verbose status messages and debugging output
- Redundant command alternatives
- Repetitive retry logic (extract to common pattern)
- Explanatory content that doesn't affect execution

**Preserve**:
- Core testing phases and their sequence
- Critical validation steps and success criteria  
- Enhanced LLM Vision Analyzer command line interface
- Fix/test/analyze cycle concept
- Essential error handling patterns

#### Phase Structure Requirements
Each testing phase must follow this standardized structure:

```markdown
## Phase X: [Phase Name]

### Prerequisites
- [Clear entry criteria]
- [Required system state]
- [Dependencies verification]

### Quick Steps Summary
1. [Action 1 brief description]
2. [Action 2 brief description]
3. [Action 3 brief description]

### Detailed Instructions

#### Step X.1: [Step Name]
[Clear action description]

```bash
# [Command description]
[standardized command with template variables]
```

#### Step X.2: [Step Name]
[Clear action description with retry pattern reference]

### Validation
- [ ] [Success criterion 1]
- [ ] [Success criterion 2]
- [ ] [Success criterion 3]

### Deliverables
- [Output artifact 1]
- [Output artifact 2]
```

### 4. Enhanced LLM Vision Analyzer Integration

#### Command Line Interface Requirements
The template must preserve the exact Enhanced LLM Vision Analyzer usage:

```bash
# Enhanced LLM Vision Analyzer command (template version)
cd {{PROJECT_ROOT}}
node test/utils/vision/enhanced-llm-vision-analyzer.js {{COMPONENT_NAME}}
```

#### Integration Specifications
- **Task Context Loading**: Ensure analyzer loads current task requirements from `pmc/core/active-task.md`
- **Dual Validation**: Preserve standard UI validation + task-contextualized validation
- **Confidence Threshold**: Use `{{VISION_CONFIDENCE_THRESHOLD}}` variable (default: 95%)
- **Retry Logic**: Implement fix/test/analyze cycles for low confidence results
- **Report Generation**: Automatic markdown report generation for each component

#### Component Analysis Requirements
The template must include instructions for analyzing each task component:

```markdown
#### Enhanced LLM Vision Analysis for Each Component
For each component in {{ALL_COMPONENTS}}:
1. Execute: `node test/utils/vision/enhanced-llm-vision-analyzer.js [COMPONENT_NAME]`
2. Verify confidence score ≥ {{VISION_CONFIDENCE_THRESHOLD}}
3. Review generated analysis report
4. If confidence < threshold, enter fix/test/analyze cycle
```

### 5. Fix/Test/Analyze Cycle Implementation

#### Standardized Retry Pattern
Create a common retry pattern that can be referenced throughout the template:

```markdown
### Standard Fix/Test/Analyze Cycle
For any failed validation step:
1. **Log Issue**: Document failure details and error messages
2. **Attempt Fix**: Apply automated correction if possible
3. **Re-run Test**: Execute the failed step again
4. **Evaluate Results**: Check if issue is resolved
5. **Update Artifacts**: Regenerate affected files (scaffolds, screenshots, reports)
6. **Repeat**: Continue until success or maximum iterations reached ({{TEST_RETRY_COUNT}})
```

#### Phase-Specific Retry Applications
- **Unit Testing**: Retry failed Jest tests with verbose output
- **Component Discovery**: Retry component import and compilation errors
- **Visual Testing**: Retry screenshot capture and scaffold generation
- **LLM Vision Analysis**: Retry low confidence results with improved prompts
- **Validation**: Retry incomplete report generation

### 6. PMC Integration Requirements

#### Context Manager Integration
The template must be compatible with `context-manager-v2.js` requirements:

**Template Path Configuration**:
```javascript
// In context-manager-v2.js PATHS object:
templates: {
  activeTask: path.join(PROJECT_ROOT, 'system', 'templates', 'active-task-template-2.md'),
  activeTaskTest: path.join(PROJECT_ROOT, 'system', 'templates', 'active-task-test-template-2.md') // NEW
}
```

**Template Variable Generation**:
The `generateActiveTaskTestContentV2` function must be updated to support new variables:

```javascript
// Additional template variables for enhanced testing
const enhancedReplacements = {
  'SERVER_COMPONENTS': generateServerComponentsList(taskData.elements),
  'CLIENT_COMPONENTS': generateClientComponentsList(taskData.elements),
  'ALL_COMPONENTS': generateAllComponentsList(taskData.elements),
  'TEST_DIRECTORY': `task-${taskData.taskId.split('.')[0]}-${taskData.taskId.split('.')[1]}/${taskData.taskId}`,
  'ENHANCED_VISION_COMMAND': `node test/utils/vision/enhanced-llm-vision-analyzer.js`,
  'PROJECT_ROOT': 'aplio-modern-1',
  'TEST_RETRY_COUNT': '3',
  'VISION_CONFIDENCE_THRESHOLD': '0.95'
};
```

#### Component List Generation
New functions needed in `context-manager-v2.js`:

```javascript
function generateServerComponentsList(elements) {
  // Extract server components from task elements
  // Return JSON array format for template processing
}

function generateClientComponentsList(elements) {
  // Extract client components from task elements  
  // Return JSON array format for template processing
}

function generateAllComponentsList(elements) {
  // Extract all components from task elements
  // Return combined list for iteration
}
```

### 7. Template Testing and Validation

#### Template Processing Validation
- Verify all template variables are correctly replaced
- Test with actual task data from existing tasks
- Ensure generated commands are syntactically correct
- Validate directory paths and file references

#### Command Validation
- Test all bash commands with template variables
- Verify Enhanced LLM Vision Analyzer command works
- Ensure retry patterns function correctly
- Validate error handling and recovery

#### Integration Testing
- Test `startTaskV2` function with new template
- Verify generated testing specifications are complete
- Ensure compatibility with existing PMC workflow
- Test template variable processing edge cases

### 8. Implementation Plan

#### Phase 1: Template Creation
1. **Create base template structure** with 5 main testing phases
2. **Implement template variables** for all identified requirements
3. **Simplify content** from comprehensive instructions following analysis
4. **Integrate Enhanced LLM Vision Analyzer** commands and patterns

#### Phase 2: PMC Integration
1. **Update context-manager-v2.js** to support new template variables
2. **Implement component list generation** functions
3. **Update template path configuration** to use new template
4. **Test template processing** with existing task data

#### Phase 3: Validation and Testing
1. **Generate test specification** using new template
2. **Execute testing workflow** to verify functionality
3. **Validate Enhanced LLM Vision Analyzer integration**
4. **Test fix/test/analyze cycles** with actual failures

#### Phase 4: Documentation and Finalization
1. **Document new template variables** and their usage
2. **Update PMC command reference** with enhanced testing options
3. **Create usage examples** and best practices guide
4. **Archive old template** and update references

### 9. Success Criteria

#### Template Requirements Met
- [ ] New template created at `pmc/system/templates/active-task-test-template-2.md`
- [ ] All existing PMC template variables supported
- [ ] New enhanced testing variables implemented
- [ ] Content simplified to 300-400 lines while preserving functionality
- [ ] Enhanced LLM Vision Analyzer integration preserved

#### PMC Integration Complete
- [ ] `context-manager-v2.js` updated to support new template variables
- [ ] Component list generation functions implemented
- [ ] Template processing works with `startTaskV2` function
- [ ] Generated testing specifications are complete and accurate

#### Functionality Validated
- [ ] All template commands execute successfully with variables
- [ ] Enhanced LLM Vision Analyzer integration works correctly
- [ ] Fix/test/analyze cycles function as designed
- [ ] Template generates usable testing specifications for any task

#### Documentation Complete
- [ ] New template variables documented in PMC system documentation
- [ ] Usage examples and best practices provided
- [ ] Integration process documented for future maintenance
- [ ] Old template archived with clear migration path

## File Locations and References

**Primary Template File**: 
- `pmc/system/templates/active-task-test-template-2.md`

**PMC Integration Files**:
- `pmc/system/management/context-manager-v2.js` (lines 2096+ for template processing)

**Source Reference**:
- `pmc/core/active-task-unit-tests-qa-agent-visual-v7.md` (comprehensive instructions to simplify)

**Enhanced LLM Vision Analyzer**:
- `aplio-modern-1/test/utils/vision/enhanced-llm-vision-analyzer.js` (command line interface)

**Testing System Documentation**:
- `pmc/docs/stm-5a/testing-system-operations-tutorial-v6.md` (usage reference)

This specification provides a complete roadmap for creating the enhanced testing template that will enable PMC to automatically generate comprehensive testing specifications with Enhanced LLM Vision Analyzer capabilities for any task.
