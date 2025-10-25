## Prompt Section
This the prompt used to generate this new tutorial.
I really forget how to execute the coding system in the PMC system that we created.

What I do remember

1. I know the 06 file is the primary input file to the coding system

2. I remember the start-task command is used to generate the detailed task shell which is stored in: 

3. I know we have all of these "driver" scripts that are designed to operate the task coding cycle:

My memory are that these scripts will operate the commands like "start-task" etc. These usually prep the files to be used for coding.
brun8\pmc\system\management\context-manager.js
brun8\pmc\system\management\context-manager-v2.js
brun8\pmc\system\management\context-manager-v3.js

My memory is that this script generates the prompts and files needed to conduct the coding
brun8\pmc\system\management\new-panel-new-task.js

I need you to:
a. Read all the files in this prompt. 
b. Write a tutorial of how to use the coding system based on the reality of the operating files above.
c. Write the tutorial in a step by step way so I can use it to operate the coding system.
d. Where possible include parameter examples and any other task specific information I must know. In fact you can base this tutorial on the current brun8\pmc\product\06-bmo-tasks.md

Append the new tutorial here: brun8\pmc\docs\stm-5a\coding-operations-journey-tutorial_v1.md

## Tutorial Section:

# PMC (Project Memory Core) Coding System - Complete Operations Guide

## Overview

The PMC system is a sophisticated task management and coding workflow system designed to break down complex projects into manageable tasks with detailed specifications, testing requirements, and automated file generation. This tutorial will guide you through the complete workflow from task definition to execution.

## System Architecture

### Core Components

1. **Task Definition Files** (`06-bmo-tasks.md`) - Primary input containing all task specifications
2. **Context Managers** - Scripts that prepare and manage task execution
3. **CLI Interface** (`aplio-agent-cli.js`) - Command-line interface for all operations
4. **Template System** - Automated file generation from templates
5. **Core Files** - Active task tracking and progress management

### Directory Structure
```
pmc/
├── bin/
│   └── aplio-agent-cli.js          # Main CLI interface
├── core/                           # Active task files and progress tracking
│   ├── active-task.md             # Current task details
│   ├── active-task-unit-tests-2.md # Current task testing specs
│   ├── progress.md                # Overall progress tracking
│   └── previous-task.md           # Last completed task
├── product/
│   └── 06-bmo-tasks.md           # Primary task definitions file
├── system/
│   ├── management/               # Core management scripts
│   │   ├── context-manager.js    # Basic task operations
│   │   ├── context-manager-v2.js # Enhanced task operations
│   │   ├── context-manager-v3.js # Advanced features
│   │   └── new-panel-new-task.js # Prompt generation
│   └── templates/               # File templates
└── docs/                        # Documentation
```

## Step-by-Step Workflow

### Phase 1: Understanding Your Task Input File

The `06-bmo-tasks.md` file is your primary input. It contains structured task definitions like this:

```markdown
### T-1.1.0: Document Processing
- **FR Reference**: FR-1.1.0
- **Impact Weighting**: Operational Efficiency
- **Implementation Location**: 
- **Pattern**: 
- **Dependencies**: 
- **Estimated Human Work Hours**: 2-4
- **Description**: Document Processing
- **Test Locations**: `C:\Users\james\Master\BrightHub\BRun\brun8\pmc\system\test\unit-tests\task-1-1\T-1.1.0\`
- **Testing Tools**: Jest, TypeScript
- **Test Coverage Requirements**: 90% code coverage
- **Completes Component?**: 

**Functional Requirements Acceptance Criteria**:
  - Document format support includes PDF, DOC, DOCX, PPT, PPTX, TXT, MD, CSV, and JSON
  - Content extraction achieves 99%+ accuracy using advanced OCR
  - [Additional criteria...]
```

**Key Elements to Understand:**
- **Task ID Format**: `T-X.Y.Z` (e.g., T-1.1.0, T-2.3.1)
- **FR Reference**: Links to functional requirements
- **Dependencies**: Other tasks that must be completed first
- **Test Locations**: Where unit tests will be stored
- **Acceptance Criteria**: Detailed requirements for completion

### Phase 2: Starting a Task

#### Command: `start-task`

**Purpose**: Initializes a task by creating detailed task files and test specifications.

**Syntax**:
```bash
node pmc/bin/aplio-agent-cli.js start-task "T-1.1.0" "bmo"
```

**What This Command Does**:
1. Reads the task definition from `06-bmo-tasks.md`
2. Extracts all task metadata and requirements
3. Creates `core/active-task.md` with detailed task breakdown
4. Creates `core/active-task-unit-tests-2.md` with testing specifications
5. Archives any previous task files
6. Updates progress tracking

**Example Usage**:
```bash
# Navigate to pmc directory
cd brun8/pmc

# Start task T-1.1.0 (Document Processing)
node bin/aplio-agent-cli.js start-task "T-1.1.0" "bmo"
```

**Expected Output**:
- ✅ Task T-1.1.0 started successfully
- 📄 Created: core/active-task.md
- 📄 Created: core/active-task-unit-tests-2.md
- 📄 Archived: Previous task files moved to history

**Generated Files**:
- `core/active-task.md` - Contains:
  - Task metadata and description
  - Implementation phases (Preparation, Implementation, Validation)
  - Detailed element breakdown
  - Dependencies and patterns
  
- `core/active-task-unit-tests-2.md` - Contains:
  - Test specifications
  - Acceptance criteria
  - Testing tools and coverage requirements
  - Test file locations

### Phase 3: Task Approach Planning

#### Command: `task-approach`

**Purpose**: Creates structured approach documentation for the current task.

**Syntax**:
```bash
node pmc/bin/aplio-agent-cli.js task-approach [confidence_level]
```

**Parameters**:
- `confidence_level` (optional): 1-10 scale, defaults to 8

**What This Command Does**:
1. Creates `system/plans/task-approach/current-task-approach.md`
2. Archives previous approach files with timestamps
3. Updates approach history tracking

**Example Usage**:
```bash
# Create task approach with default confidence
node bin/aplio-agent-cli.js task-approach

# Create task approach with specific confidence level
node bin/aplio-agent-cli.js task-approach 9
```

### Phase 4: Generating Coding Prompts

#### Script: `new-panel-new-task.js`

**Purpose**: Generates timestamped prompt files for AI-assisted coding sessions.

**Syntax**:
```bash
node system/management/new-panel-new-task.js
```

**What This Script Does**:
1. Archives existing prompt files to history
2. Generates timestamped files in `system/plans/new-panels/`:
   - `00-new-panel-new-task-automation-prompt-[timestamp].md`
   - `01-new-panel-new-task-[timestamp].md`
   - `02-new-task-carry-context-[timestamp].md`
   - `03-new-panel-new-task-conductor-[timestamp].md`
   - `04-new-panel-new-task-conductor-output-[timestamp].md`
3. Updates `system/coding-prompts/02-task-approach-prompt.md`

**Example Usage**:
```bash
# Generate new panel files for current task
node system/management/new-panel-new-task.js
```

**Generated Files Include**:
- Automation prompts for AI assistants
- Context carry files for maintaining conversation state
- Conductor files for managing coding sessions
- Task-specific prompts with current task details

### Phase 5: Task Execution and Progress Tracking

#### Available Commands During Development:

**Update Element Status**:
```bash
node bin/aplio-agent-cli.js update-element-status "T-1.1.0:ELE-1" "Complete"
```

**Log Micro Actions**:
```bash
node bin/aplio-agent-cli.js log-action "Implemented file upload validation" 8 "src/upload.js"
```

**Update Confidence Level**:
```bash
node bin/aplio-agent-cli.js update-confidence 9
```

### Phase 6: Task Completion

#### Command: `complete-task`

**Purpose**: Marks a task as complete and optionally starts the next task.

**Syntax**:
```bash
node pmc/bin/aplio-agent-cli.js complete-task "T-1.1.0" [--force] [--startnext]
```

**Parameters**:
- `--force`: Skip validation checks
- `--startnext`: Automatically start the next task in sequence

**What This Command Does**:
1. Validates task completion requirements
2. Archives current task files to `previous-task.md`
3. Updates progress tracking
4. Optionally starts the next task

**Example Usage**:
```bash
# Complete current task
node bin/aplio-agent-cli.js complete-task "T-1.1.0"

# Complete and start next task
node bin/aplio-agent-cli.js complete-task "T-1.1.0" --startnext

# Force completion (skip validation)
node bin/aplio-agent-cli.js complete-task "T-1.1.0" --force
```

### Phase 7: Context Management for New Sessions

#### Script: `carryover-command.js`

**Purpose**: Generates context files for new AI chat sessions.

**Syntax**:
```bash
node system/management/carryover-command.js
```

**What This Script Does**:
1. Collects current project state
2. Generates context summary files
3. Creates session handoff documentation

## Advanced Features

### Test Approach Management

**Create Test Approach**:
```bash
node bin/aplio-agent-cli.js test-approach [confidence_level]
```

### Token Counting and Context Management

**Execute Token Counter**:
```bash
node bin/aplio-agent-cli.js token-counter [--reset] [--model gpt-4]
```

### File Concatenation Utilities

**Generate Consolidated Task File**:
```bash
node bin/aplio-agent-cli.js concatenate-tasks
```

**Generate Consolidated Test Mapping**:
```bash
node bin/aplio-agent-cli.js concatenate-tests
```

## Common Workflows

### Starting a New Task (Complete Workflow)

1. **Identify Next Task**: Check `06-bmo-tasks.md` for the next task ID
2. **Start Task**: `node bin/aplio-agent-cli.js start-task "T-X.Y.Z" "bmo"`
3. **Create Approach**: `node bin/aplio-agent-cli.js task-approach`
4. **Generate Prompts**: `node system/management/new-panel-new-task.js`
5. **Begin Development**: Use generated prompts with AI assistants
6. **Track Progress**: Use element status and action logging commands
7. **Complete Task**: `node bin/aplio-agent-cli.js complete-task "T-X.Y.Z" --startnext`

### Resuming Work on Existing Task

1. **Check Current Task**: Review `core/active-task.md`
2. **Review Progress**: Check `core/progress.md`
3. **Generate Fresh Prompts**: `node system/management/new-panel-new-task.js`
4. **Continue Development**: Use updated prompts

### Switching Between Tasks

1. **Complete Current**: `node bin/aplio-agent-cli.js complete-task "T-CURRENT"`
2. **Start New**: `node bin/aplio-agent-cli.js start-task "T-NEW" "bmo"`
3. **Update Approach**: `node bin/aplio-agent-cli.js task-approach`

## File Locations Reference

### Core Working Files
- `core/active-task.md` - Current task details
- `core/active-task-unit-tests-2.md` - Current task testing
- `core/progress.md` - Overall progress tracking
- `core/task-implementation-log.md` - Implementation history

### Generated Prompt Files
- `system/plans/new-panels/` - Timestamped prompt files
- `system/coding-prompts/` - Standard prompt templates
- `system/plans/task-approach/` - Task approach documentation

### History and Archives
- `system/plans/task-history/` - Completed task archives
- `system/plans/new-panels/new-panel-history/` - Archived prompt files

## Troubleshooting

### Common Issues

**"Task not found" Error**:
- Verify task ID exists in `06-bmo-tasks.md`
- Check exact formatting: `T-X.Y.Z`

**"Template not found" Error**:
- Ensure you're running commands from `pmc` directory
- Check that template files exist in `system/templates/`

**CLI Command Not Found**:
- Verify Node.js is installed
- Check file permissions on `bin/aplio-agent-cli.js`
- Ensure you're in the correct directory

### Best Practices

1. **Always run commands from the `pmc` directory**
2. **Use exact task ID formatting** (T-X.Y.Z)
3. **Generate fresh prompts** before starting new coding sessions
4. **Track progress regularly** using element status updates
5. **Complete tasks properly** to maintain system state
6. **Archive old files** before starting new tasks

## Task ID Examples from Current Project

Based on the `06-bmo-tasks.md` file, here are real task IDs you can use:

- `T-1.1.0` - Document Processing
- `T-1.2.0` - Export Format Generation  
- `T-1.3.0` - Training Pipeline Integration
- `T-2.1.0` - AI-Powered Content Analysis
- `T-2.2.0` - Knowledge Graph Construction
- `T-2.3.0` - Quality Assessment System
- `T-3.1.0` - Training Pair Generation

## Summary

The PMC system provides a structured approach to managing complex development projects through:

1. **Detailed task specifications** in the 06 file
2. **Automated file generation** from templates
3. **Progress tracking** and state management
4. **AI-assisted development** through generated prompts
5. **Comprehensive testing** specifications and requirements

Follow this workflow consistently to maintain project organization and ensure all requirements are met systematically.

## Additional Notes

### What `start-task` in `context-manager-v2.js` Uses `06b-${productAbbr}-tasks-built.md` For

**Question**: What does start-task in `pmc\system\management\context-manager-v2.js` use `06b-${productAbbr}-tasks-built.md` for?

**Answer**: The `start-task` function in `context-manager-v2.js` uses the `06b-${productAbbr}-tasks-built.md` file as the **primary source** for extracting complete task information when starting a new task. Here's the detailed breakdown:

**Primary Function**: `startTaskV2Enhanced()` reads this file to extract all task specifications for the given Task ID.

**File Path Construction**:
```javascript
taskBreakdownFile: path.join(PROJECT_ROOT, 'product', `06b-${productAbbr}-tasks-built.md`)
```

**What the function does with this file**:
1. **Reads the entire file** (line 3506: `fs.readFileSync(taskBreakdownPath, 'utf8')`)
2. **Extracts specific task content** using `extractTaskDetailsV2(taskId, taskBreakdownContent)`
3. **Parses task sections** using regex pattern: `#### ${taskId}:.*?(?=\\n####|$)`
4. **Extracts comprehensive task data** including:
   - Task title and description
   - FR (Functional Requirements) references
   - Implementation patterns
   - Dependencies
   - Estimated work hours
   - Implementation location
   - Test locations and tools
   - Acceptance criteria
   - Task elements and phases

**Key Difference from `new-panel-new-task.js`**:
- **`new-panel-new-task.js`**: Only reads task IDs from core tracking files
- **`start-task` in context-manager-v2.js**: Reads complete task specifications from the consolidated "built" file

**File Examples**:
- For `productAbbr = "bmo"` → `06b-bmo-tasks-built.md`
- For `productAbbr = "aplio-mod-1"` → `06b-aplio-mod-1-tasks-built.md`

**Purpose**: The "built" files serve as the definitive source of task specifications that have been consolidated and processed from various mapping and template files, providing all the detailed information needed to generate the active task files (`core/active-task.md` and `core/active-task-unit-tests-2.md`).
