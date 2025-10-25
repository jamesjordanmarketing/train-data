# Progress File Generation in PMC v3 - Comprehensive Guide

## 1. Introduction

The Project Memory Core (PMC) progress tracking system generates comprehensive progress reports by analyzing task files in the project. This tutorial provides detailed guidance on using the progress file generation script to create structured progress tracking documents.

## Progress File Generation Script

**Script:** `pmc/product/_tools/07-create-progress-file-v3.js`

### Purpose
This script generates comprehensive progress tracking files by analyzing task files in the project. It extracts phases, tasks, subtasks, elements, and their relationships to create structured progress reports in two different formats: a detailed view (with elements) and a phase-focused view (without elements).

### Key Features
- Automatically discovers and processes all task files in the project
- Extracts project metadata, phases, tasks, and elements
- Supports both main tasks and subtasks
- Handles parent-child relationships between elements
- Creates two different progress tracking files:
  1. A detailed view with all elements (`progress.md`)
  2. A phase-focused view without element details (`progress-phase.md`)
- Maintains consistent formatting, timestamps, and metadata across both files

### Input/Output Paths

#### Input Files
1. **Task Files**
   - Primary Location: `pmc/product/_mapping/task-file-maps/*-tasks-E[XX].md`
   - Legacy Support: `pmc/product/06-aplio-mod-1-tasks.md` (fallback)
   - Format: Markdown files containing task breakdowns with specific formatting

#### Output Files
1. **Detailed Progress File**
   - Location: `pmc/core/progress.md`
   - Content: Structured progress tracking information with all task elements

2. **Phase-Focused Progress File**
   - Location: `pmc/core/progress-phase.md`
   - Content: Simplified progress tracking showing only task phases without element details

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

4. **Detailed Progress File Generation**
   - Creates timestamp
   - Organizes content hierarchically
   - Maintains relationships between tasks and elements
   - Includes all element details and their descriptions

5. **Phase-Focused Progress File Generation**
   - Uses the same metadata and structure as the detailed file
   - Omits all element-level details
   - Includes only static phase names for each task and subtask:
     - Preparation Phase
     - Implementation Phase
     - Validation Phase
   - Provides a higher-level overview for project management

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
Found 9 task file(s) to process
Content of first file: 6-aplio-mod-1-tasks-E01.md
...
Extracting content using line-by-line approach...
Found phase 1: Project Foundation
  Found main task: T-1.1.0: Next.js 14 App Router Implementation
    Found subtask: T-1.1.1: Project Initialization
      Found element: T-1.1.1:ELE-1 Configure Next.js 14 with App Router
[... processing continues ...]
Progress file generated successfully at pmc/core/progress.md
Project: Aplio Design System Modernization
Phases: 9, Tasks: 45, Elements: 158
Generating phase-focused progress-phase.md file...
Phase-focused progress file generated successfully at pmc/core/progress-phase.md
Progress file generation completed.
```

### Detailed Progress File Format Example

```markdown
# Aplio Design System Modernization - Progress Tracking

## Project Overview
Task Breakdown

A comprehensive modernization project converting the legacy Aplio Design System to leverage Next.js 14's App Router architecture and TypeScript, focusing on the Home-4 template implementation while preserving visual fidelity and enhancing developer experience.

## Implementation Progress

### Phase 1: Project Foundation

#### Task 1.1: Next.js 14 App Router Implementation
- [ ] T-1.1.0: Next.js 14 App Router Implementation
  - [ ] T-1.1.0:ELE-1 Configure base Next.js 14 project structure
  - [ ] T-1.1.0:ELE-2 Set up App Router architecture
    - [ ] T-1.1.0:ELE-2a Set up page routing
    - [ ] T-1.1.0:ELE-2b Set up layout components

- [ ] T-1.1.1: Project Initialization with Next.js 14
  - [ ] T-1.1.1:ELE-1 Initialize project with create-next-app
  - [ ] T-1.1.1:ELE-2 Configure TypeScript settings
  - [ ] T-1.1.1:ELE-3 Set up initial folder structure

...
```

### Phase-Focused Progress File Format Example

```markdown
# Aplio Design System Modernization - Phase Progress Tracking

## Project Overview
Task Breakdown

A comprehensive modernization project converting the legacy Aplio Design System to leverage Next.js 14's App Router architecture and TypeScript, focusing on the Home-4 template implementation while preserving visual fidelity and enhancing developer experience.

## Implementation Phase Progress

### Phase 1: Project Foundation

- [ ] T-1.1.0: Next.js 14 App Router Implementation
  - [ ] Preparation Phase
  - [ ] Implementation Phase
  - [ ] Validation Phase

- [ ] T-1.1.1: Project Initialization with Next.js 14
  - [ ] Preparation Phase
  - [ ] Implementation Phase
  - [ ] Validation Phase

...
```

### Common Issues and Solutions

1. **No Task Files Found**
   - Error: `No task files found. Cannot generate progress.md`
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

4. **Missing Structure Elements**
   - Symptom: Some tasks or phases are missing from output
   - Solution: Check task file format consistency and verify headers use proper formatting

### Best Practices

1. **Before Running**
   - Ensure all task files are properly formatted
   - Verify task IDs are consistent and sequential
   - Check that element IDs follow the correct pattern

2. **After Running**
   - Review both generated progress files
   - Verify all phases, tasks, and elements are captured correctly
   - Check parent-child relationships are properly maintained in the detailed file
   - Ensure the phase-focused file includes all tasks with standard phase names

3. **Maintenance**
   - Run after significant task file updates
   - Keep task file formatting consistent
   - Regularly backup both progress files

### Integration with Other Tools
- Works alongside the prompt generation script
- Can be part of automated build/documentation processes
- Supports project tracking and reporting workflows
- Provides two different views for different management needs

### CLI Integration
The script can be run through the PMC CLI system:

```bash
# Using PMC CLI to generate progress files
node pmc/bin/aplio-agent-cli.js create-progress
```

This command will generate both the detailed and phase-focused progress files in one operation. 