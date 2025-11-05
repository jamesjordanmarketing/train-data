# Consolidated Task Generation Process Specification - v6.0

## 1. Executive Summary

This specification outlines an enhanced task generation process for the Project Memory Core (PMC) system, building on previous implementations while addressing identified shortcomings. Primary goals include:

1. Supporting the new, more structured Functional Requirements format
2. Establishing comprehensive traceability between requirements, elements, implementation, and tests
3. Preserving detailed acceptance criteria without increasing cognitive load
4. Maintaining task sizes of 2-4 hours including testing
5. Supporting a clear 3-tier task hierarchy (T-X.Y, T-X.Y.Z, T-X.Y.Z:ELE-n)
6. Improving test generation with direct links to acceptance criteria

## 2. Current System Analysis

### 2.1 Current Task Structure

The `pmc/product/06-aplio-mod-1-tasks-original.md` file follows this hierarchy:
- **Major Tasks** = `[Task X.Y]`
- **Tasks** = `[Task X.Y.Z]`
- **Task Elements** = `[T-X.Y.Z:ELE-xy]`

This structure has been integrated into the AI coding instructions (`pmc/core/active-task.md`), designed to minimize cognitive load for AI coding agents.

### 2.2 Valued Aspects of Current Format

1. **Consistent Task Headers** with detailed metadata
2. **Manageable Task Size** - estimated human work hours under 4 hours
3. **Detailed Legacy Code References** with exact path links
4. **Clear Structure** with subtasks and implementation phases
5. **Three-Tier Task Hierarchy** providing appropriate complexity level
6. **Consistent Metadata** enforced across all tasks

### 2.3 Current Issues Analysis

1. **Functional Requirements Format Change**  
   - The new FR format has shifted to a structured format with impact weightings, priorities, and nested acceptance criteria
   - Current scripts don't properly parse this new format

2. **Acceptance Criteria Detail Loss**  
   - FR documents contain detailed, testable acceptance criteria with context
   - These details are lost when transferred to task elements
   - Test generation requires recreating missing context

3. **Legacy Reference Context Loss**  
   - FR documents include valuable code references for implementation guidance
   - These references are stripped during task element creation

4. **Traceability Deficiencies**  
   - No explicit link between elements and implementation steps
   - No explicit link between elements and test cases
   - No clear mapping between element-level acceptance criteria and FR acceptance criteria

5. **Process Documentation Gaps**  
   - Unclear task template format
   - Incomplete documentation of the end-to-end process
   - Lack of validation mechanisms for generated tasks

### 2.4 Current Tools and Resources

- **Scripts**:
  - `pmc/product/_tools/06a-generate-task-initial-v2.js`
  - `pmc/product/_tools/06b-generate-and-reorder-tasks.js`
  - `pmc/product/_tools/06c-generate-ele-for-tasks.js`

- **Prompts**:
  - `pmc/product/_prompt_engineering/06a-product-task-elements-breakdown-prompt-v6.md`
  - `pmc/product/_prompt_engineering/06ab-product-task-test-creation-prompt-v2.md`
  - `pmc/product/_prompt_engineering/06abc-product-task-test-components-prompt.md`

- **Missing Items**:
  - No template file (unlike other PMC components)
  - Outdated tutorial: `pmc/docs/ltc-6a/06-generating-tasks-v2.md`

## 3. Enhanced Requirements

### 3.1 Complete Criteria Preservation

- **Detailed Mapping Files**:
  - Preserve all acceptance criteria details in separate mapping files
  - Include legacy code references and full context
  - Maintain the full text of acceptance criteria as defined in FR
  - Support rich traceability without cluttering task documents

### 3.2 Clean Task Documents

- **Simplified Element Structure**:
  - Keep task documents focused and uncluttered
  - Use clear element references in implementation steps
  - Provide action-oriented instructions for AI coding agents
  - Maintain readability while ensuring traceability

### 3.3 Comprehensive Test Generation

- **Test Generation from Criteria**:
  - Automatically generate tests based on complete acceptance criteria
  - Include verification logic for each specific aspect of criteria
  - Reference legacy code for context and implementation guidance
  - Create standardized test structure that mirrors implementation

### 3.4 Traceability Validation

- **Validation Mechanisms**:
  - Validate that each acceptance criterion has corresponding tests
  - Ensure all aspects of criteria are covered by tests
  - Maintain a clear chain from FR to task elements to tests
  - Provide tools to verify traceability completeness

## 4. Technical Implementation Plan

### 4.1 Directory Structure

```
pmc/
├── product/
│   ├── _tools/
│   │   ├── 06a-generate-task-initial-v3.js    # Enhanced to preserve criteria
│   │   ├── 06c-generate-ele-for-tasks.js      # Updated for cleaner referencing
│   │   ├── 06d-split-task-files.js            # For large task file management
│   │   ├── 06e-validate-tasks-completeness.js # Validation script
│   │   ├── 06f-create-element-tests.js        # Generate tests from criteria
│   │   └── ...
│   ├── _templates/
│   │   ├── 06-tasks-template.md               # Main task template
│   │   ├── 06-task-mapping-template.md        # FR-to-element mapping template
│   │   └── ...
│   ├── _mappings/                             # Detailed mapping storage
│   │   ├── [project]-fr-to-task-mapping.md    # Complete mapping with full context
│   │   └── ...
│   └── ...
├── system/
│   ├── test/
│   │   ├── unit-tests/                        # Generated test structure
│   │   │   └── ...
│   │   └── ...
│   └── ...
└── ...
```

### 4.2 Enhanced Mapping File Format

```markdown
# Functional Requirements to Task Element Mapping
**Project:** aplio-mod-1
**Generated:** [date]

## FR1.1.1: Create a comprehensive color system extraction

### Task Elements:
- T-1.1.2:ELE-1 -> Color token types
- T-1.1.2:ELE-2 -> Color token values
- T-1.1.2:ELE-2a -> Primary, secondary, and accent colors
- T-1.1.2:ELE-2b -> Text and background color combinations

### Complete Acceptance Criteria:

#### T-1.1.2:ELE-1 (Color token types)
- **Acceptance Criteria:** Color token naming system established
  - **Details:** Must define TypeScript types for all color categories
  - **Legacy Reference:** aplio-modern-1/src/lib/design-system/tokens/colors.ts:19-35
  - **Verification:** Types must be strongly typed with appropriate type safety
```

### 4.3 Script Updates

#### 4.3.1 06a-generate-task-initial-v3.js (New Version)
- Parse the new FR format with impact weightings and acceptance criteria
- Extract comprehensive acceptance criteria with context
- Generate clean task structure and detailed mapping files
- Support the new 3-tier task hierarchy

#### 4.3.2 06c-generate-ele-for-tasks.js (Update)
- Add traceability references with cleaner syntax
- Support the new implementation step format that references elements without cluttering
- Add placeholders for test references

#### 4.3.3 06d-split-task-files.js (New)
- Split large task files into manageable chunks
- Create index files for navigation
- Maintain backup of original files

#### 4.3.4 06e-validate-tasks-completeness.js (New)
- Validate traceability between FRs, elements, implementation, and tests
- Ensure that all tasks follow the size and structure guidelines
- Generate reports of any issues found

#### 4.3.5 06f-create-element-tests.js (New)
- Generate test structure based on element definitions
- Create test templates with acceptance criteria references
- Set up co-located test directories

### 4.4 Prompt Updates

#### 4.4.1 Task Element Breakdown Prompt v5.5
- Focus on clean element structure
- Use implementation step references that don't clutter the task
- Ensure all aspects of requirements are covered by elements
- Maintain size constraints (2-4 hours per task)

### 4.5 Templates

#### 4.5.1 Task Template
```markdown
# [Project Name] - Task Breakdown

#### T-1.1.1: [Task Name]
- **FR Reference**: FR1.1.1
- **Implementation Location**: [File path]
- **Pattern**: [Implementation pattern]
- **Dependencies**: [Task dependencies]
- **Estimated Human Work Hours**: [2-4]
- **Description**: [Task description]
- **Legacy Code References**:
  - [Reference 1]
  - [Reference 2]

**Components/Elements**:
- [T-1.1.1:ELE-1] [Element description]
- [T-1.1.1:ELE-2] [Element description]

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] [Preparation step] (implements ELE-1)
   - [PREP-2] [Preparation step] (implements ELE-2)

2. Implementation Phase:
   - [IMP-1] [Implementation step] (implements ELE-1)
   - [IMP-2] [Implementation step] (implements ELE-2)

3. Validation Phase:
   - [VAL-1] [Validation step] (validates ELE-1)
   - [VAL-2] [Validation step] (validates ELE-2)
```

## 5. Implementation Workflow

### 5.1 Complete Task Generation Workflow

1. **Generate Initial Tasks**:
   ```bash
   node pmc/product/_tools/06a-generate-task-initial-v3.js "Project Name" project-abbreviation
   ```
   This creates:
   - Basic task structure in `06-<project>-tasks.md`
   - Detailed mapping in `_mappings/<project>-fr-to-task-mapping.md`

2. **Add Element IDs and Traceability** (if needed):
   ```bash
   node pmc/product/_tools/06c-generate-ele-for-tasks.js project-abbreviation
   ```

3. **Improve Task Details with AI Architect**:
   - Submit task file with the revised element breakdown prompt
   - AI architect enhances the structure while maintaining the clean format

4. **Split Task Files** (Optional):
   ```bash
   node pmc/product/_tools/06d-split-task-files.js pmc/product/06-project-abbreviation-tasks.md pmc/product/tasks
   ```

5. **Validate Tasks**:
   ```bash
   node pmc/product/_tools/06e-validate-tasks-completeness.js project-abbreviation
   ```

### 5.2 Task Execution and Testing Workflow

1. **Start a Task**:
   ```bash
   node bin/aplio-agent-cli.js start-task "T-X.Y.Z"
   ```
   This:
   - Creates `active-task.md` with the task details
   - Generates test structure in system test directory
   - Creates `active-task-unit-tests.md` with acceptance criteria

2. **Implement Task**:
   - AI coding agent follows the `active-task.md` instructions
   - Implements each element in sequence
   - References `active-task-unit-tests.md` for test requirements

3. **Run Tests**:
   - AI coding agent implements tests based on acceptance criteria
   - Executes tests to verify implementation
   - Reports coverage and results

4. **Complete Task**:
   ```bash
   node bin/aplio-agent-cli.js complete-task "T-X.Y.Z" --startnext
   ```
   - Updates progress tracking
   - Archives task context
   - Starts the next task

## 6. Implementation Plan

### 6.1 Development Sequence

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| 1 | Create `06a-generate-task-initial-v3.js` | 4 hours |
| 2 | Create templates for tasks and mapping | 2 hours |
| 3 | Create `06f-create-element-tests.js` | 4 hours |
| 4 | Update `06c-generate-ele-for-tasks.js` | 2 hours |
| 5 | Create `06d-split-task-files.js` | 2 hours |
| 6 | Create `06e-validate-tasks-completeness.js` | 3 hours |
| 7 | Update `start-task` command | 3 hours |
| 8 | Testing and debugging | 4 hours |
| 9 | Documentation updates | 2 hours |
| **Total** | | **26 hours** |

### 6.2 Key Features to Implement

1. **Preserved Acceptance Criteria**:
   - Extract and maintain all criteria details from FR
   - Include legacy code references in the mapping file
   - Keep verification requirements accessible

2. **Clean Task Documents**:
   - Simple element structure
   - Implementation steps with clear references
   - No redundant or excessive information

3. **Comprehensive Testing**:
   - Tests derived from complete criteria
   - Test structure that mirrors implementation
   - Clear verification requirements

4. **Validation Integration**:
   - Task quality validation
   - Test coverage validation
   - Process integrity checks

## 7. Quality Standards

### 7.1 Task Size Standard
- Each task must be 2-4 hours including testing
- Elements should be balanced and cohesive

### 7.2 Traceability Standard
- 100% of elements must have FR references in the mapping file
- 100% of elements must have test references
- 100% of elements must be referenced in implementation steps
- 100% of elements must be referenced in validation steps

### 7.3 Testing Standard
- Each element must have at least one specific test case
- Test cases must validate acceptance criteria
- Test files must follow the co-location pattern

### 7.4 Documentation Standard
- All tasks must include complete metadata
- Legacy code references must be included where applicable
- Implementation process must be clearly defined
- Test cases must be specific and verifiable

## 8. Open Questions

1. **Testing Framework Choice**:
   - Is there a preferred testing framework (Jest, Vitest, etc.)?
   - Are there specific testing utilities required?

2. **Testing Structure**:
   - Should we use co-located tests or a separate test directory structure?
   - How should we handle test dependencies on other components?

3. **FR to Task Mapping**:
   - Should we maintain a separate mapping file or integrate mapping information directly into tasks?
   - How should we handle updates to FR documents that affect existing tasks?

4. **Implementation Process**:
   - Should we further refine the implementation step format?
   - Are there additional automation opportunities in the workflow?

## 9. Summary of Benefits

The enhanced Task Generation Process provides these key benefits:

1. **Reduced Cognitive Load**: AI coding agents can focus on implementation rather than documentation overhead
2. **Comprehensive Traceability**: Clear connections between requirements, implementation, and testing
3. **Detailed Acceptance Criteria**: Complete criteria available for testing without cluttering task documents
4. **Automated Testing**: Test generation based directly on acceptance criteria
5. **Process Validation**: Tools to ensure task quality and completeness

This specification represents a significant improvement to the PMC system while maintaining compatibility with existing workflows and minimizing disruption to ongoing development.