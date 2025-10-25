# Generating Tasks in PMC v3 - Comprehensive Guide

## Table of Contents

| Script/Command | Purpose | File Path |
|---------------|---------|-----------|
| Prompt Files Regeneration | Regenerates customized prompt files for each task section | `product/_tools/utility-06b-generate-prompts-only.js` |
| Progress File Generation | Creates progress tracking files by analyzing tasks | `product/_tools/07-create-progress-file-v3.js` |
| Task Files Concatenation | Combines task fragment files into a single consolidated file | `product/_tools/utility-06-concatenate-tasks.js` |
| Task Files Concatenation CLI | CLI wrapper for the concatenation script | `bin/aplio-agent-cli.js concatenate-tasks` |
| Test Mapping Concatenation | Combines test mapping fragments into a consolidated file | `product/_tools/utility-07-concatenate-task-tests.js` |
| Test Mapping Concatenation CLI | CLI wrapper for the test mapping concatenation | `bin/aplio-agent-cli.js concatenate-test-maps` |

## 1. Introduction

The Project Memory Core (PMC) task generation system transforms functional requirements into structured, implementation-ready tasks with comprehensive metadata, testing requirements, and traceability. This tutorial provides detailed guidance on using the task generation toolchain to create well-structured development tasks.

# Utility Scripts Tutorials

## Prompt Files Regeneration Script
**Script:** `pmc/product/_tools/utility-06b-generate-prompts-only.js`

### Purpose
This script regenerates customized prompt files for each task section in the Aplio Design System Modernization project. It reads existing task files and generates corresponding prompt files without modifying the original task files.

### Key Features
- Only regenerates prompt files, preserving existing task files
- Automatically detects and processes all task files for a given project
- Maintains consistent file naming and directory structure
- Customizes prompts with correct file paths and section headers

### Input/Output Paths

#### Input Files
1. **Task Files (Read Only)**
   - Location: `pmc/product/_mapping/task-file-maps/6-[project-abbreviation]-tasks-E[XX].md`
   - Purpose: Source files containing task sections
   - Example: `6-aplio-mod-1-tasks-E01.md`, `6-aplio-mod-1-tasks-E02.md`, etc.

2. **Prompt Template**
   - Location: `pmc/product/_prompt_engineering/06a-product-task-elements-breakdown-prompt-v5.4.md`
   - Purpose: Base template for generating customized prompts

#### Output Files
1. **Generated Prompt Files**
   - Location: `pmc/product/_mapping/task-file-maps/prompts/06a-product-task-elements-breakdown-prompt-v5.4-E[XX].md`
   - Example: `06a-product-task-elements-breakdown-prompt-v5.4-E01.md`

### Command Line Parameters

#### Required Parameters
1. **Project Name** (string, in quotes)
   - Description: The full name of the project
   - Format: Must be enclosed in quotes if it contains spaces
   - Example: `"Aplio Next.js 14 Design System Modernization"`

2. **Project Abbreviation** (string)
   - Description: Short identifier used in file names
   - Format: Lowercase with hyphens, no spaces
   - Example: `aplio-mod-1`

### Usage Examples

1. **Running from Project Root**
```bash
node product/_tools/utility-06b-generate-prompts-only.js "Aplio Next.js 14 Design System Modernization" aplio-mod-1
```

2. **Running from Any Directory (using absolute path)**
```bash
node /path/to/pmc/product/_tools/utility-06b-generate-prompts-only.js "Aplio Next.js 14 Design System Modernization" aplio-mod-1
```

### Behavior and Process

1. **Directory Validation**
   - Creates the prompts output directory if it doesn't exist
   - Verifies existence of prompt template file
   - Checks for task files matching the project abbreviation pattern

2. **Task File Processing**
   - Scans for files matching pattern `6-[project-abbreviation]-tasks-E[XX].md`
   - Extracts section headers from each task file
   - Generates corresponding prompt files with customized content

3. **Prompt Customization**
   - Replaces placeholder text with actual section headers
   - Updates file paths to match the project structure
   - Maintains correct test mapping references

4. **Error Handling**
   - Reports missing template files
   - Warns if no matching task files are found
   - Provides clear error messages for troubleshooting

### Example Run with Current Project

```bash
# Navigate to project root
cd pmc

# Run the script
node product/_tools/utility-06b-generate-prompts-only.js "Aplio Next.js 14 Design System Modernization" aplio-mod-1
```

Expected Output:
```
Running from: /path/to/pmc
Reading prompt template from: /path/to/pmc/product/_prompt_engineering/06a-product-task-elements-breakdown-prompt-v5.4.md
Reading task files from: /path/to/pmc/product/_mapping/task-file-maps
Writing prompt files to: /path/to/pmc/product/_mapping/task-file-maps/prompts
Found 9 task files to process
Processing task file: 6-aplio-mod-1-tasks-E01.md (Section ID: E01)
Section header: ## 1. Project Foundation
Wrote prompt file: .../06a-product-task-elements-breakdown-prompt-v5.4-E01.md
[... similar output for E02-E09 ...]
Successfully regenerated all prompt files.
```

### Common Issues and Solutions

1. **Template File Not Found**
   - Error: `Error: Prompt template not found at [path]`
   - Solution: Verify the template file exists in the correct location under `product/_prompt_engineering/`

2. **No Task Files Found**
   - Error: `Error: No task files found matching the pattern in [directory]`
   - Solution: Verify task files exist and match the naming pattern `6-[project-abbreviation]-tasks-E[XX].md`

3. **Permission Issues**
   - Error: `EACCES: permission denied`
   - Solution: Ensure you have write permissions in the output directory

### Best Practices

1. **Before Running**
   - Verify all task files are complete and correctly formatted
   - Ensure the prompt template contains all necessary placeholders
   - Back up existing prompt files if needed

2. **After Running**
   - Verify all prompt files were generated correctly
   - Check that section headers were properly extracted
   - Validate file paths in generated prompts

3. **Maintenance**
   - Run this script whenever task files are updated
   - Keep the prompt template up to date with any new requirements
   - Maintain consistent file naming conventions

## Progress File Generation Script
**Script:** `pmc/product/_tools/07-create-progress-file-v3.js`

### Purpose
This script generates a comprehensive progress tracking file by analyzing task files in the project. It extracts phases, tasks, elements, and their relationships to create a structured progress report.

### Key Features
- Automatically discovers and processes all task files in the project
- Extracts project metadata, phases, tasks, and elements
- Supports both main tasks and subtasks
- Handles parent-child relationships between elements
- Creates a well-formatted progress tracking file

### Input/Output Paths

#### Input Files
1. **Task Files**
   - Primary Location: `pmc/product/_mapping/task-file-maps/*-tasks-E[XX].md`
   - Legacy Support: `pmc/product/06-aplio-mod-1-tasks.md` (fallback)
   - Format: Markdown files containing task breakdowns with specific formatting

#### Output File
- Location: `pmc/core/progress.md`
- Content: Structured progress tracking information with timestamps

### Command Line Usage

```bash
# From project root directory
node product/_tools/07-create-progress-file-v3.js

# Using npm script (if configured)
npm run create-progress
```

### Behavior and Process

1. **File Discovery**
   - Scans the task-file-maps directory for files matching `*-tasks-E[XX].md`
   - Sorts files by epic number (E01, E02, etc.)
   - Falls back to legacy file if no task files found

2. **Metadata Extraction**
   - Project name and description
   - Version information
   - Category
   - Product abbreviation

3. **Content Processing**
   - Phases (## 1. Project Foundation)
   - Main tasks (### T-1.1.0: Task Title)
   - Subtasks (#### T-1.1.1: Subtask Title)
   - Elements ([T-1.1.1:ELE-1] Element Description)
   - Parent-child element relationships

4. **Progress File Generation**
   - Creates timestamp
   - Organizes content hierarchically
   - Maintains relationships between tasks and elements

### Example Run for Aplio Design Project

```bash
# Navigate to project root
cd pmc

# Run the script
node product/_tools/07-create-progress-file-v3.js
```

Expected Output:
```
Discovering task files...
Found task files:
- 6-aplio-mod-1-tasks-E01.md
- 6-aplio-mod-1-tasks-E02.md
...
Extracting content using line-by-line approach...
Found phase 1: Project Foundation
  Found main task: T-1.1.0: Next.js 14 App Router Implementation
    Found subtask: T-1.1.1: Project Initialization
[... processing continues ...]
Generated progress file at: core/progress.md
```

### Common Issues and Solutions

1. **No Task Files Found**
   - Error: `No task files found in directory`
   - Solution: Verify task files exist in `product/_mapping/task-file-maps/` with correct naming pattern

2. **Invalid Task File Format**
   - Error: `Error extracting content from task file`
   - Solution: Ensure task files follow the required formatting:
     - Phase headers: `## 1. Phase Name`
     - Task headers: `### T-1.1.0: Task Name`
     - Element format: `[T-1.1.0:ELE-1] Element Description`

3. **Permission Issues**
   - Error: `EACCES: permission denied`
   - Solution: Ensure write permissions for the `core` directory

### Best Practices

1. **Before Running**
   - Ensure all task files are properly formatted
   - Verify task IDs are consistent and sequential
   - Check that element IDs follow the correct pattern

2. **After Running**
   - Review the generated progress.md file
   - Verify all phases, tasks, and elements are captured
   - Check parent-child relationships are correct

3. **Maintenance**
   - Run after significant task file updates
   - Keep task file formatting consistent
   - Regularly backup the progress file

### Integration with Other Tools
- Works alongside the prompt generation script
- Can be part of automated build/documentation processes
- Supports project tracking and reporting workflows

## Task Files Concatenation Script
**Script:** `pmc/product/_tools/utility-06-concatenate-tasks.js`

### Purpose
This script concatenates fragment task files from a source directory into a single consolidated file based on a template. It combines multiple task file fragments (identified by E## suffixes) into one comprehensive file for improved readability and reference.

### Key Features
- Automatically detects and processes all task fragment files for a given project
- Sorts fragments in numerical order according to their E## suffix
- Applies template with proper metadata and formatting
- Populates variables with information from the project overview file
- Handles different path formats and file naming conventions
- Includes source file references in the output

### Input/Output Paths

#### Input Files
1. **Task Fragment Files**
   - Location: `pmc/product/_mapping/task-file-maps/6-[project-abbreviation]-tasks-E[##].md`
   - Purpose: Individual task fragments organized by sections
   - Example: `6-aplio-mod-1-tasks-E01.md`, `6-aplio-mod-1-tasks-E02.md`, etc.

2. **Template File**
   - Location: `pmc/product/_templates/06-tasks-built-template.md`
   - Purpose: Header template with metadata and formatting for the consolidated file

3. **Project Overview File (for metadata)**
   - Location: `pmc/product/01-aplio-mod-1-overview.md`
   - Purpose: Source for project name, category, and abbreviation information

#### Output File
- Location: `pmc/product/06b-[project-abbreviation]-tasks-built.md`
- Example: `pmc/product/06b-aplio-mod-1-tasks-built.md`

### Command Line Usage

#### Using Node.js directly
```bash
# From project root directory
node pmc/product/_tools/utility-06-concatenate-tasks.js
```

#### Using PMC CLI
```bash
# From project root directory
node pmc/bin/aplio-agent-cli.js concatenate-tasks
```

### Example Run for Aplio Design Project

```bash
# Navigate to project root
cd pmc

# Run using the PMC CLI
node bin/aplio-agent-cli.js concatenate-tasks
```

Expected Output:
```
Concatenating task fragment files...
Extracted project info: {"projectName":"Next.js 14 Modernization for Aplio Design System","category":"Design System Platform","abbreviation":"aplio-mod-1"}
Using project abbreviation: aplio-mod-1
Found existing path: pmc/product/_mapping/task-file-maps
Found existing path: pmc/product/_templates/06-tasks-built-template.md
Starting task file concatenation...
Source directory: pmc/product/_mapping/task-file-maps
Template: pmc/product/_templates/06-tasks-built-template.md
Output path: pmc/product/06b-aplio-mod-1-tasks-built.md
Files in directory: 6-aplio-mod-1-tasks-E01.md, 6-aplio-mod-1-tasks-E02.md, ...
Filtered files: 6-aplio-mod-1-tasks-E01.md, 6-aplio-mod-1-tasks-E02.md, ...
Read fragment file: 6-aplio-mod-1-tasks-E01.md
Read fragment file: 6-aplio-mod-1-tasks-E02.md
...
Found 9 fragment files to concatenate
Successfully generated consolidated task file: pmc/product/06b-aplio-mod-1-tasks-built.md
Task file concatenation completed successfully.
```

### Important Notes
- The script automatically extracts metadata from the project overview file
- Date is formatted with 12-hour Pacific time (e.g., "05/03/2025 9:31 AM PST")
- Files are sorted and concatenated in numerical order based on their E## suffix
- Source references are included in the header of the consolidated file

## Test Mapping Concatenation Script
**Script:** `pmc/product/_tools/utility-07-concatenate-task-tests.js`

### Purpose
This script concatenates test mapping fragment files from a source directory into a single consolidated file based on a template. It combines multiple test mapping fragments (identified by E## suffixes) into one comprehensive file for improved readability and reference.

### Key Features
- Automatically detects and processes all test mapping fragment files for a given project
- Sorts fragments in numerical order according to their E## suffix
- Applies template with proper metadata and formatting
- Populates variables with information from the project overview file
- Handles different path formats and file naming conventions
- Includes source file references in the output

### Input/Output Paths

#### Input Files
1. **Test Mapping Fragment Files**
   - Location: `pmc/product/_mapping/test-maps/06-[project-abbreviation]-task-test-mapping-E[##].md`
   - Purpose: Individual test mapping fragments organized by sections
   - Example: `06-aplio-mod-1-task-test-mapping-E01.md`, `06-aplio-mod-1-task-test-mapping-E02.md`, etc.

2. **Template File**
   - Location: `pmc/product/_templates/07-tasks-tests-built-template.md.md`
   - Purpose: Header template with metadata and formatting for the consolidated file

3. **Project Overview File (for metadata)**
   - Location: `pmc/product/01-aplio-mod-1-overview.md`
   - Purpose: Source for project name, category, and abbreviation information

#### Output File
- Location: `pmc/product/07b-task-[project-abbreviation]-testing-built.md`
- Example: `pmc/product/07b-task-aplio-mod-1-testing-built.md`

### Command Line Usage

#### Using Node.js directly
```bash
# From project root directory
node pmc/product/_tools/utility-07-concatenate-task-tests.js
```

#### Using PMC CLI
```bash
# From project root directory
node pmc/bin/aplio-agent-cli.js concatenate-test-maps
```

### Example Run for Aplio Design Project

```bash
# Navigate to project root
cd pmc

# Run using the PMC CLI
node bin/aplio-agent-cli.js concatenate-test-maps
```

Expected Output:
```
Concatenating test mapping fragment files...
Extracted project info: {"projectName":"Next.js 14 Modernization for Aplio Design System","category":"Design System Platform","abbreviation":"aplio-mod-1"}
Using project abbreviation: aplio-mod-1
Found existing path: pmc/product/_mapping/test-maps
Found existing path: pmc/product/_templates/07-tasks-tests-built-template.md.md
Starting test mapping file concatenation...
Source directory: pmc/product/_mapping/test-maps
Template: pmc/product/_templates/07-tasks-tests-built-template.md.md
Output path: pmc/product/07b-task-aplio-mod-1-testing-built.md
Files in directory: 06-aplio-mod-1-task-test-mapping-E01.md, 06-aplio-mod-1-task-test-mapping-E02.md, ...
Filtered files: 06-aplio-mod-1-task-test-mapping-E01.md, 06-aplio-mod-1-task-test-mapping-E02.md, ...
Read fragment file: 06-aplio-mod-1-task-test-mapping-E01.md
Read fragment file: 06-aplio-mod-1-task-test-mapping-E02.md
...
Found 9 fragment files to concatenate
Successfully generated consolidated test mapping file: pmc/product/07b-task-aplio-mod-1-testing-built.md
Test mapping file concatenation completed successfully.
```

### Important Notes
- The script automatically extracts metadata from the project overview file
- Date is formatted with 12-hour Pacific time (e.g., "05/03/2025 9:31 AM PST")
- Files are sorted and concatenated in numerical order based on their E## suffix
- Source references are included in the header of the consolidated file
- The process preserves all test mapping relationships and structure

### Common Issues and Solutions for Both Scripts

1. **Fragment Files Not Found**
   - Error: `No fragment files found in [directory]`
   - Solution: Verify fragment files exist in the correct location and match the expected naming pattern

2. **Template File Not Found**
   - Error: `Template file not found: [path]`
   - Solution: Ensure the template file exists in the correct location under `product/_templates/`

3. **Overview File Not Found or Missing Metadata**
   - Symptom: Default values used instead of project-specific values
   - Solution: Verify the overview file exists and contains the expected metadata sections

4. **File Path Issues**
   - Error: `Error reading file: [path]`
   - Solution: Check file paths and permissions; the scripts support multiple path formats

### Best Practices

1. **Before Running**
   - Ensure all fragment files are complete and correctly formatted
   - Verify the template files contain the necessary placeholders
   - Make sure the project overview file has up-to-date metadata

2. **After Running**
   - Review the consolidated files to ensure all fragments were included
   - Verify metadata was correctly populated from the overview file
   - Check that source references are correctly listed

3. **Integration with Workflow**
   - Run these scripts whenever fragment files are updated
   - Consider running both scripts in sequence to keep task and test mapping files in sync
   - Use the PMC CLI commands for easier integration with existing workflows
