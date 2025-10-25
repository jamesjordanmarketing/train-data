# Task Test Mapping Generation Script Analysis

## Overview

The script `pmc\product\_tools\07-generate-task-test-mapping.js` is a Node.js utility that generates comprehensive task-to-test mapping documents for the Aplio Design System Next.js Modernization project. It parses task definition files and creates structured test mapping documents with placeholders for human input.

## Input Files

### Primary Input Files
1. **Task Definition Files** (Modern Format)
   - **Location**: `product\_mapping\task-file-maps\`
   - **Pattern**: Files matching regex `^\d+-aplio-mod-1-tasks-E\d+\.md$`
   - **Example**: `01-aplio-mod-1-tasks-E01.md`, `02-aplio-mod-1-tasks-E02.md`
   - **Content**: Structured markdown files containing tasks with IDs like `T-X.Y.Z`

2. **Legacy Task File** (Backward Compatibility)
   - **Location**: `product\06-aplio-mod-1-tasks.md`
   - **Purpose**: Fallback when modern task files are not found
   - **Content**: Single consolidated task file in older format

3. **Prompt Template**
   - **Location**: `product\_prompt_engineering\06b-task-test-mapping-creation-prompt-v3.md`
   - **Purpose**: Template for generating customized prompt files
   - **Content**: Template with placeholders for task ranges and section IDs

## Output Files

### Generated Documents

1. **Individual Section Mapping Files**
   - **Location**: `product\_mapping\test-maps\`
   - **Pattern**: `06-aplio-mod-1-task-test-mapping-E{paddedSectionId}.md`
   - **Example**: `06-aplio-mod-1-task-test-mapping-E01.md`
   - **Content**: Section-specific task-to-test mappings

2. **Consolidated Mapping File**
   - **Location**: `product\_mapping\07-task-bmo-testing-built.md`
   - **Content**: Combined task-to-test mappings from all sections

3. **Index File**
   - **Location**: `product\_mapping\test-maps\06-aplio-mod-1-task-test-mapping-index.md`
   - **Content**: Navigation index linking to all section files

4. **Customized Prompt Files**
   - **Location**: `product\_mapping\test-maps\prompts\`
   - **Pattern**: `06b-task-test-mapping-creation-prompt-v3-E{paddedSectionId}.md`
   - **Content**: Section-specific prompts with actual task ranges

### Directory Structure Created
```
product/
├── _mapping/
│   ├── test-maps/
│   │   ├── prompts/
│   │   ├── 06-aplio-mod-1-task-test-mapping-E01.md
│   │   ├── 06-aplio-mod-1-task-test-mapping-E02.md
│   │   └── 06-aplio-mod-1-task-test-mapping-index.md
│   └── 07-task-bmo-testing-built.md
```

## Internal Operations

### 1. Task File Discovery and Processing
- **Scans** `product\_mapping\task-file-maps\` directory for task files
- **Filters** files using regex pattern `^\d+-aplio-mod-1-tasks-E\d+\.md$`
- **Sorts** files alphabetically for consistent processing
- **Fallback** to legacy file if no modern task files found

### 2. Task Parsing Engine
The script parses structured markdown files to extract:

#### Task Structure Elements
- **Task Headers**: `### T-X.Y.Z: Title` or `#### T-X.Y.Z: Title`
- **Metadata**: Key-value pairs like `- **FR Reference**: value`
- **Acceptance Criteria**: Content under "Functional Requirements Acceptance Criteria" section
- **Elements**: `[T-X.Y.Z:ELE-N] Element Name` format
- **Implementation Steps**: `[STEP-N] Description (implements ELE-X)` format
- **Validation Steps**: `[VAL-N] Description (validates ELE-X)` format

#### Parsing Patterns (Regex)
- Task Pattern: `/^#{3,4} T-(\d+\.\d+\.\d+): (.+)$/`
- Element Pattern: `/\[T-(\d+\.\d+\.\d+):ELE-(\d+)\] (.+)$/`
- Implementation Step: `/\[(\w+)-(\d+)\] (.+?)( \(implements ELE-(\d+)(?:, ELE-(\d+))?(?:, ELE-(\d+))?\))?$/`
- Validation Step: `/\[VAL-(\d+)\] (.+?)( \(validates ELE-(\d+)(?:, ELE-(\d+))?(?:, ELE-(\d+))?\))?$/`

### 3. Task Organization and Grouping
- **Groups tasks** by major section (first digit of task ID)
- **Identifies parent tasks** (ending in `.0`) and their children
- **Sorts tasks** hierarchically for structured output
- **Associates elements** with their implementation and validation steps

### 4. Document Generation Process

#### For Each Section:
1. **Extract section metadata** and task ranges
2. **Generate hierarchical structure**:
   - Parent tasks as `### T-X.Y.0`
   - Child tasks as `#### T-X.Y.Z`
3. **Include comprehensive metadata** for each task
4. **Map elements to their steps** with full context
5. **Add test coverage requirements** with auto-generated file paths

#### Test Path Generation:
- **Base directory**: Determined by `getBaseProjectDir()` function
- **Test path pattern**: `pmc/system/test/unit-tests/task-{X}-{Y}/T-{X.Y.Z}/`
- **Windows path conversion**: Ensures backslash separators for Windows compatibility

### 5. Human Input Placeholder System
Automatically adds structured placeholders for manual completion:
- **Test Requirements**: `[NEEDS THINKING INPUT]` with example placeholders
- **Testing Deliverables**: Template items for human completion
- **Human Verification Items**: Manual testing checklist items

### 6. Prompt Customization Engine
- **Reads template** from prompt engineering directory
- **Replaces placeholders**:
  - `**Current Task Range**:` with actual task range (e.g., "T-1.1.0 - T-1.5.3")
  - `[two-digit-task-number]` with padded section ID (e.g., "01", "02")
- **Generates section-specific prompts** for AI assistance

### 7. Utility Functions

#### Path Management
- `ensureWindowsPath()`: Converts forward slashes to backslashes
- `getBaseProjectDir()`: Navigates up directory tree to find project root

#### Data Processing
- `getTaskRange()`: Calculates first and last task IDs in a section
- `getSectionName()`: Extracts or infers section names from metadata

#### File Operations
- **Directory creation**: Creates output directories recursively
- **File writing**: Generates all output files with UTF-8 encoding
- **Error handling**: Graceful fallback to legacy processing

## Processing Flow

1. **Initialize** → Create output directory structure
2. **Discovery** → Find and validate input task files
3. **Parse** → Extract structured data from markdown files
4. **Group** → Organize tasks by sections and hierarchy
5. **Generate** → Create mapping documents for each section
6. **Consolidate** → Combine all sections into master document
7. **Customize** → Generate section-specific prompt files
8. **Index** → Create navigation index file

## Key Features

### Backward Compatibility
- Supports both modern sectioned task files and legacy consolidated format
- Graceful fallback when expected files are missing

### Windows Path Support
- Automatically converts paths to Windows format with backslashes
- Generates absolute paths for test locations

### Hierarchical Task Processing
- Maintains parent-child task relationships
- Processes tasks in logical order (parents before children)

### Comprehensive Metadata Extraction
- Captures all task metadata fields
- Preserves implementation and validation step associations
- Maintains element-to-step mappings

### Human-AI Collaboration
- Generates structured placeholders for manual input
- Creates customized prompts for AI-assisted completion
- Maintains clear separation between automated and manual content

## Error Handling

- **Missing directories**: Creates required directories automatically
- **No task files found**: Falls back to legacy file processing
- **Parsing errors**: Continues processing other tasks, logs warnings
- **File access errors**: Provides detailed error messages and graceful continuation
