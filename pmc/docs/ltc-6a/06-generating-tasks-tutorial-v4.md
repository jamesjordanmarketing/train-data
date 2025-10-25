# Generating Tasks in PMC v3 - Comprehensive Guide

## Document Overview
- **Primary Task File:** `pmc/product/06-[product]-tasks.md`  
- **Master Index:** `pmc/product/06-[product]-tasks-index.md`  
- **Section Task Files:** `pmc/product/06-[product]-tasks-[section].md`

## 1. Introduction

The Project Memory Core (PMC) task generation system transforms functional requirements into structured, implementation-ready tasks with comprehensive metadata, testing requirements, and traceability. This tutorial provides detailed guidance on using the task generation toolchain to create well-structured development tasks.

### Prerequisites
Before beginning the task generation process, you must have:
1. Completed functional requirements document (`03-[product]-functional-requirements.md`)
2. Project structure document (`04-[product]-structure.md`) 
3. Implementation patterns document (`05-[product]-implementation-patterns.md`)

### Task Hierarchy
The PMC system organizes work in a 3-tier task hierarchy:

1. **Major Tasks** [T-X.Y] - High-level project components or features
2. **Tasks** [T-X.Y.Z] - Specific implementation units (2-4 hour work items)
3. **Task Elements** [T-X.Y.Z:ELE-N] - Granular implementation components within a task

This structure ensures work is properly scoped, sequenced, and traceable to requirements.

## 2. The Task Generation Toolchain

The PMC task generation system consists of three primary tools that work in sequence:

### 2.1 Initial Task Generator (`06a-generate-task-initial-v4.js`)

**Purpose:** Transforms functional requirements into an initial task structure with proper metadata.

**Inputs:**
- Functional requirements file (`03-[product]-functional-requirements.md`)
- Project name (full project name)
- Project abbreviation (used in file naming)

**Outputs:**
- Initial task file (`06-[product]-tasks.md`) with tasks mapped to functional requirements

**Key Functions:**
- Reads functional requirements and extracts essential data
- Converts FR-X.Y.Z identifiers to T-X.Y.Z format
- Preserves acceptance criteria and impact weighting
- Creates a consistent metadata structure for each task
- Establishes test locations based on task structure

**Usage:**
```bash
node pmc/product/_tools/06a-generate-task-initial-v4.js "Project Name" product-abbreviation
```

**Example:**
```bash
node pmc/product/_tools/06a-generate-task-initial-v4.js "Aplio Design System Modernization" aplio-mod-1
```

**Output Format:**
```markdown
#### T-1.1.1: Implement Color Token System
- **FR Reference**: FR-1.1.1
- **Impact Weighting**: High
- **Implementation Location**: 
- **Pattern**: 
- **Dependencies**: 
- **Estimated Human Work Hours**: 2-4
- **Description**: Implement Color Token System
- **Test Locations**: pmc/system/test/unit-tests/task-1-1/T-1.1.1/
- **Testing Tools**: Jest, TypeScript
- **Test Coverage Requirements**: 90% code coverage
- **Completes Component?**: 

**Functional Requirements Acceptance Criteria**:
  - The system must implement a comprehensive color token system
  - Color tokens must be stored in a type-safe structure
  - All colors must be accessible via a consistent API
```

### 2.2 Task Prompt Segmentation Tool (`pmc\product\_tools\06b-generate-task-prompt-segments.js`)

**Purpose:** Segments complex task files into manageable sections for AI processing and generates customized prompt files.

**Inputs:**
- Task file (`pmc\product\06-[product]-tasks.md`)
- Prompt template (`pmc\product\_prompt_engineering\06a-product-task-elements-breakdown-prompt-v5.4.md`)

**Outputs:**
- Segmented task files (`06-[product]-tasks-E[XX].md` in `_mapping/task-file-maps/`)
- Customized prompt files for each section (`06a-product-task-elements-breakdown-prompt-v5.4-E[XX].md` in `_mapping/task-file-maps/prompts/`)
- Index file linking all sections (`06-[product]-tasks-index.md`)

**Key Functions:**
- Parses the task file to identify major sections (level 2 headings)
- Segments the file into separate files by section
- Customizes prompt templates for each section
- Creates an index file with links to all segments
- Maintains consistent structures across segments

**Usage:**
```bash
node pmc/product/_tools/06b-generate-task-prompt-segments.js "Project Name" product-abbreviation
```

**Example:**
```bash
node pmc/product/_tools/06b-generate-task-prompt-segments.js "Aplio Design System Modernization" aplio-mod-1
```

**Output:**
- Task section files (e.g., `6-aplio-mod-1-tasks-E01.md`, `6-aplio-mod-1-tasks-E02.md`)
- Customized prompts (e.g., `06a-product-task-elements-breakdown-prompt-v5.4-E01.md`)
- Index file (`6-aplio-mod-1-tasks-index.md`)

### 2.3 Task Test Mapping Generator (`pmc\product\_tools\06c-generate-task-test-mapping.js`)

**Purpose:** Establishes traceability between tasks and test files, ensuring comprehensive test coverage.

**Inputs:**
- Task file (`pmc\product\06-[product]-tasks.md`)

**Outputs:**
- Test mapping files (`06-[product]-task-test-mapping-E[XX].md` in `_mapping/test-maps/`)
- Test mapping JSON data (`06-[product]-task-test-mapping-E[XX].json`)
- Customized test prompts for each section (in `_mapping/test-maps/prompts/`)
- Consolidated index file (`06-[product]-task-test-mapping-index.md`)

**Key Functions:**
- Parses tasks and their elements from the task file
- Groups tasks by major section
- Creates test mapping structures for each section
- Generates JSON data for programmatic access
- Creates customized test prompts for AI processing
- Builds a consolidated index of all test mappings

**Usage:**
```bash
node product/_tools/06c-generate-task-test-mapping.js
```

**Output Format:**
```markdown
# Test Mapping for Project: [Project Name]
## Section: 1. [Section Name]

### T-1.1.1: [Task Name]
**Test File Location**: `pmc/system/test/unit-tests/task-1-1/T-1.1.1/`

**Elements**:
- [T-1.1.1:ELE-1] [Element description]
  * **Test Requirements**:
    - [Test description]
    - [Validation criteria]
    
- [T-1.1.1:ELE-2] [Element description]
  * **Test Requirements**:
    - [Test description]
    - [Validation criteria]
```

## 3. Step-by-Step Task Generation Workflow

### 3.1 Initial Task Generation

1. **Prepare prerequisites**
   - Ensure you have completed the functional requirements document
   - Verify the project structure document is finalized
   - Check that implementation patterns are documented

2. **Run the initial task generator**
   ```bash
   node pmc/product/_tools/06a-generate-task-initial-v4.js "Project Name" product-abbreviation
   ```
   - Replace "Project Name" with your full project name
   - Replace "product-abbreviation" with your shorthand project name

3. **Verify task structure**
   - Open `pmc/product/06-[product]-tasks.md`
   - Confirm that tasks have been created from all functional requirements
   - Check that metadata structure is complete
   - Ensure acceptance criteria are transferred correctly

### 3.2 Task Segmentation for AI Processing

1. **Run the task segmentation tool**
   ```bash
   node pmc/product/_tools/06b-generate-task-prompt-segments.js "Project Name" product-abbreviation
   ```
   
2. **Locate generated files**
   - Check `pmc/product/_mapping/task-file-maps/` for section files
   - Verify `pmc/product/_mapping/task-file-maps/prompts/` contains prompts
   - Open the index file to ensure all sections are listed

3. **Process each section with AI**
   For each section prompt file:
   
   a. Open the prompt file:
   ```
   pmc/product/_mapping/task-file-maps/prompts/06a-product-task-elements-breakdown-prompt-v5.4-E[XX].md
   ```
   
   b. Submit the prompt to the AI assistant
   
   c. Wait for AI to process and generate detailed task breakdowns
   
   d. Verify AI output is saved to the correct section file
   
   e. Proceed to the next section

### 3.3 Test Mapping Generation

1. **Run the test mapping generator**
   ```bash
   node product/_tools/06c-generate-task-test-mapping.js
   ```
   
2. **Verify test mapping files**
   - Check `pmc/product/_mapping/test-maps/` for test mapping files
   - Ensure each section has a corresponding test mapping file
   - Verify the test mapping index is complete

3. **Generate test specifications with AI**
   For each test prompt file:
   
   a. Open the test prompt file:
   ```
   pmc/product/_mapping/test-maps/prompts/06a-task-test-creation-prompt-E[XX].md
   ```
   
   b. Submit the prompt to the AI assistant
   
   c. Wait for AI to generate test specifications for all tasks in the section
   
   d. Verify the output is saved to the correct test mapping file
   
   e. Proceed to the next section

### 3.4 Dependency Validation and Task Ordering

1. **Run the dependency check analysis**
   
   a. Open the dependency analysis prompt:
   ```
   pmc/product/_prompt_engineering/06e-task-sequencing-analysis-only-prompt.md
   ```
   
   b. Submit the prompt to the AI assistant
   
   c. Review the AI's dependency analysis report
   
   d. If task reordering is needed, use:
   ```
   pmc/product/_prompt_engineering/06b-task-sequencing-prompt-still-needed-question.md
   ```

2. **Finalize the task structure**
   - Make any necessary adjustments to task ordering based on the dependency analysis
   - Ensure all dependencies are properly documented in each task
   - Verify that the sequence creates a logical implementation flow

## 4. Directory Structure and File Locations

### Key Directories

1. **Tools Directory**
   - `pmc/product/_tools/`
   - Contains all task generation scripts
   
2. **Mapping Directories**
   - `pmc/product/_mapping/task-file-maps/`
   - `pmc/product/_mapping/test-maps/`
   - Store segmented task files and test mapping documents
   
3. **Prompt Engineering Directory**
   - `pmc/product/_prompt_engineering/`
   - Contains prompt templates for AI processing
   
4. **Product Directory**
   - `pmc/product/`
   - Stores main task files and project documentation

### Key Files

1. **Task Generation Tools**
   - `06a-generate-task-initial-v4.js` - Initial task generator
   - `06b-generate-task-prompt-segments.js` - Task segmentation tool
   - `06c-generate-task-test-mapping.js` - Test mapping generator

2. **Prompt Templates**
   - `06a-product-task-elements-breakdown-prompt-v5.4.md` - Task breakdown prompt
   - `06e-task-sequencing-analysis-only-prompt.md` - Dependency analysis prompt

3. **Output Files**
   - `06-[product]-tasks.md` - Main task file
   - `06-[product]-tasks-E[XX].md` - Segmented task files
   - `06-[product]-task-test-mapping-E[XX].md` - Test mapping files

## 5. Detailed Tool Features and Options

### 5.1 Initial Task Generator

The initial task generator supports several advanced features:

- **Section Header Preservation**: Maintains section headers from the functional requirements
- **Hierarchical Task Structure**: Preserves the nested structure of requirements
- **Metadata Enrichment**: Adds standard metadata fields to each task
- **Test Path Generation**: Creates standardized test paths based on task IDs

**Advanced Options:**
- Add `--verbose` for detailed processing logs
- Add `--no-impact` to skip impact weighting
- Add `--custom-test-path [path]` to specify a custom test directory

### 5.2 Task Segmentation Tool

The segmentation tool offers options to customize the segmentation process:

- **Custom Section Patterns**: Define custom patterns for section identification
- **Prompt Templating**: Supports variable substitution in prompt templates
- **Hierarchical Output**: Maintains task hierarchy within segment files

**Advanced Options:**
- Add `--max-section-size [size]` to limit segment size
- Add `--custom-prompt [path]` to use a different prompt template
- Add `--no-index` to skip index file generation

### 5.3 Test Mapping Generator

The test mapping tool provides detailed test structure generation:

- **Element-Test Traceability**: Maps each element to specific test requirements
- **Test Location Management**: Generates consistent test file paths
- **Test Format Templates**: Creates standardized test format templates

**Advanced Options:**
- Add `--test-framework [framework]` to specify a test framework
- Add `--coverage-threshold [percentage]` to set coverage requirements
- Add `--no-prompts` to skip prompt file generation

## 6. Common Issues and Troubleshooting

### 6.1 Initial Task Generation Issues

| Issue | Solution |
|-------|----------|
| Missing functional requirements | Ensure `03-[product]-functional-requirements.md` exists and is properly formatted |
| Task numbering problems | Check that FR-X.Y.Z format is used consistently in requirements |
| Incomplete metadata | Verify that all required fields are present in the requirements document |

### 6.2 Task Segmentation Issues

| Issue | Solution |
|-------|----------|
| Empty segments | Check that section headers use the correct format (## N. Section Name) |
| Prompt template errors | Verify that the prompt template contains all required placeholder variables |
| Missing sections | Ensure sections are properly formatted with level 2 headers (##) |

### 6.3 Test Mapping Issues

| Issue | Solution |
|-------|----------|
| Missing elements | Verify that tasks have been processed by the AI and contain elements |
| Invalid JSON output | Check task format consistency and element references |
| Broken test paths | Ensure task IDs follow the standard format |

## 7. Examples

### 7.1 Complete Task Generation Workflow Example

```bash
# 1. Generate initial task structure
node product/_tools/06a-generate-task-initial-v4.js "Aplio Design System Modernization" aplio-mod-1

# 2. Segment tasks for AI processing
node product/_tools/06b-generate-task-prompt-segments.js "Aplio Design System Modernization" aplio-mod-1

# 3. Process each section with AI (manual step)
# Open and submit each prompt from product/_mapping/task-file-maps/prompts/

# 4. Generate test mapping
node pmc/product/_tools/06c-generate-task-test-mapping.js

# 5. Create test specifications with AI (manual step)
# Open and submit each prompt from product/_mapping/test-maps/prompts/

# 6. Validate dependencies (manual step)
# Submit dependency analysis prompt
```

### 7.2 Example Task Structure After Processing

```markdown
#### T-1.1.1: Implement Color Token System
- **FR Reference**: FR-1.1.1
- **Implementation Location**: src/lib/design-system/tokens/colors.ts
- **Pattern**: Design Token Pattern
- **Dependencies**: None
- **Estimated Human Work Hours**: 3
- **Description**: Implement a comprehensive color token system with a type-safe structure
- **Test Locations**: pmc/system/test/unit-tests/task-1-1/T-1.1.1/
- **Testing Tools**: Jest, TypeScript
- **Test Coverage Requirements**: 90% code coverage
- **Completes Component?**: Yes

**Components/Elements**:
- [T-1.1.1:ELE-1] Color Token Type Definitions: Create TypeScript interfaces for color tokens
  * Maps to: FR-1.1.1 "The system must implement a comprehensive color token system"
  * Tests for this element are in ColorTokenTypes.test.ts
  
- [T-1.1.1:ELE-2] Base Color Value Implementation: Implement the core color palette values
  * Maps to: FR-1.1.1 "Color tokens must be stored in a type-safe structure"
  * Tests for this element are in BaseColorValues.test.ts
  
- [T-1.1.1:ELE-3] Color Access API: Create functions to access color tokens
  * Maps to: FR-1.1.1 "All colors must be accessible via a consistent API"
  * Tests for this element are in ColorAccessAPI.test.ts

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Research color token systems in Next.js (implements ELE-1)
   - [PREP-2] Review existing color palette in legacy system (implements ELE-2)

2. Implementation Phase:
   - [IMP-1] Create color token TypeScript interfaces (implements ELE-1)
   - [IMP-2] Implement base color values using token structure (implements ELE-2)
   - [IMP-3] Develop color access functions and API (implements ELE-3)

3. Validation Phase:
   - [VAL-1] Verify type safety of color token system (validates ELE-1)
   - [VAL-2] Test color values against design specifications (validates ELE-2)
   - [VAL-3] Validate color API consistency and completeness (validates ELE-3)
```

## 8. Additional Resources

- **PMC CLI Commands**: `pmc/bin/aplio-agent-cli.js` provides additional utilities
- **Task Validation**: Use `validate-tasks` command to verify task structure
- **Documentation**: See `pmc/docs/` for additional guides 