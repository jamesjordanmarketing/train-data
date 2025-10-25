# Project Memory Core (PMC) V3 Operational Tutorial

## Introduction

This tutorial provides a step-by-step guide to executing tasks using the Project Memory Core (PMC) system. The PMC system centers around the `active-task.md` file, which serves as the primary context document for task execution.

## Task Execution Cycle

### 0. System Initialization
The very first step is initializing the PMC system:

```bash
node bin/aplio-agent-cli.js init
```

This command:
- Creates necessary directory structures
- Sets up all required system files with initial content
- Archives any existing files for backup
- Resets the system to a clean state

**When to use:**
- When starting a new project
- When a complete system reset is needed
- After major system upgrades

### 1. Task Initialization
The cycle begins with initializing a new task:

```bash
node bin/aplio-agent-cli.js start-task "T-1.1.1"
```

This command:
- Creates two new files:
  - `active-task.md`: The main task implementation file with preparation and implementation details
  - `active-task-unit-tests.md`: A companion file containing all testing-related content
- Populates both files with task information from the task breakdown file
- Sets up required sections with cross-references between the files
- Organizes test content by element to match the implementation structure

The two-file approach addresses context window limitations by:
- Keeping the main task file focused on implementation details
- Moving comprehensive test instructions to a separate file
- Maintaining clear cross-references between implementation and tests
- Preserving the sequential phase workflow (preparation → implementation → validation)
- Ensuring the AI coding agent completes all implementation steps before testing

**When testing should be performed:**
After completing all implementation elements, the AI coding agent is instructed to:
1. Open the companion test file (`active-task-unit-tests.md`)
2. Follow the test file creation, implementation, and execution steps
3. Record test results and coverage metrics
4. Return to the main task file to complete the task

### 2. Task Approach Development
The task approach is developed in two steps:

1. Human operator or Conductor prompt runs the prompt in `pmc\system\coding-prompts\02-task-approach-prompt.md`
2. The resulting approach is applied using:
```bash
# Basic usage
node pmc/bin/aplio-agent-cli.js task-approach

# With confidence level (1-10)
node pmc/bin/aplio-agent-cli.js task-approach 8
```

### 3. Task Implementation
During implementation, the AI agent uses various commands to track progress. Most commands are embedded in active-task.md, but can also be called independently when needed.

#### Element Status Management
```bash
# Update element status
node pmc/bin/aplio-agent-cli.js update-element-status "T-1.1.1:ELE-1" "In Progress"
node pmc/bin/aplio-agent-cli.js update-element-status "T-1.1.1:ELE-1" "Complete"
node pmc/bin/aplio-agent-cli.js update-element-status "T-1.1.1:ELE-1" "Complete - Unit Test Successful"
```
**Available Statuses**
- Not Started
- In Progress
- Unit Testing
- Complete
- Complete - Unit Test Successful
- Complete - Unit Test Incomplete
- Abandoned

**When to use independently:** 
- When changing element status outside the normal flow
- When correcting status after errors
- When force-updating status during recovery

#### Phase Management
```bash
# Update phase status
node pmc/bin/aplio-agent-cli.js update-phase "Preparation Phase" 1 "Set up color token types" "Not Started"
node pmc/bin/aplio-agent-cli.js update-phase "Implementation Phase" 2 "Implement token system" "In Progress"
node pmc/bin/aplio-agent-cli.js update-phase "Validation Phase" 3 "Test token system" "Complete"
```
**When to use independently:**
- When recovering from interrupted tasks
- When phases need reordering
- When updating multiple steps simultaneously

#### Phase Status Management in Progress Tracking
```bash
# Update phase status in progress-phase.md file
# Format: update-phase-stage <taskId> <phaseAbbr> <status>

# Update Preparation Phase to "not started" status
node pmc/bin/aplio-agent-cli.js update-phase-stage "T-1.3.3" "PREP" "not started"

# Update Implementation Phase to "active" status
node pmc/bin/aplio-agent-cli.js update-phase-stage "T-1.3.3" "IMP" "active"

# Update Validation Phase to "complete" status
node pmc/bin/aplio-agent-cli.js update-phase-stage "T-1.3.3" "VAL" "complete"
```

**Parameters:**
1. `taskId` - The task ID (e.g., T-1.3.3)
2. `phaseAbbr` - Phase abbreviation:
   - `PREP` - Preparation Phase
   - `IMP` - Implementation Phase
   - `VAL` - Validation Phase
3. `status` - The status to set:
   - `not started` - Represented as [ ] in the file
   - `active` - Represented as [-] in the file
   - `complete` - Represented as [x] in the file

**When to use:**
- When updating phase status in the phase-focused progress tracking file (progress-phase.md)
- For high-level project status reporting
- When tracking phase status independently from element details
- For quick phase status visualization across the project

**Status Markers in File:**
- Not started: `[ ]`
- Active: `[-]`
- Complete: `[x]`

#### Implementation Tracking
```bash
# Log actions with confidence (1-10) and optional file paths
node pmc/bin/aplio-agent-cli.js log-action "Added Button component styling" 9 "src/components/button.tsx"
node pmc/bin/aplio-agent-cli.js log-action "Updated color scheme" 7
node pmc/bin/aplio-agent-cli.js log-action "Refactored animation system" 8 "src/animations.ts" "src/types.ts"

# Add implementation files
node pmc/bin/aplio-agent-cli.js add-implementation-file "src/components/ui/button.tsx" true  # Primary file
node pmc/bin/aplio-agent-cli.js add-implementation-file "src/types/button.ts" false  # Secondary file

# Update confidence level (1-10)
node pmc/bin/aplio-agent-cli.js update-confidence 8
```
**When to use independently:**
- When logging significant decisions
- When adding files outside planned implementation
- When confidence changes due to new information

#### Issue Management
```bash
# Log errors with severity (1-10)
node pmc/bin/aplio-agent-cli.js error "Type error in button component" 7
node pmc/bin/aplio-agent-cli.js error "Critical performance issue" 9

# Log improvements
node pmc/bin/aplio-agent-cli.js log-improvement "T-1.1.1" "Add color contrast check"
node pmc/bin/aplio-agent-cli.js log-improvement "T-1.1.1" "Optimize bundle size"

# Log dependencies
node pmc/bin/aplio-agent-cli.js log-dependency "T-1.1.1" "Needs color token type"
node pmc/bin/aplio-agent-cli.js log-dependency "T-1.1.1" "Requires animation system"

# Update implementation notes
node pmc/bin/aplio-agent-cli.js update-notes "Using CSS custom properties for backward compatibility"
node pmc/bin/aplio-agent-cli.js update-notes "Added RTL support considerations"
```
**When to use independently:**
- When discovering issues during review
- When identifying cross-task dependencies
- When making architectural decisions

### 4. Task Completion
The cycle ends with task completion:

```bash
# Normal completion
node pmc/bin/aplio-agent-cli.js complete-task "T-1.1.1"

# Force completion (when some elements/phases are incomplete)
node pmc/bin/aplio-agent-cli.js complete-task "T-1.1.1" --force

# Complete and start next task
node pmc/bin/aplio-agent-cli.js complete-task "T-1.1.1" --startnext

# Force complete and start next task
node pmc/bin/aplio-agent-cli.js complete-task "T-1.1.1" --force --startnext
```

The complete-task command:
1. Verifies completion status of all elements and phases
2. Updates active-task.md with completion status
3. Updates progress tracking
4. Archives task context
5. Runs context carryover
6. Optionally starts the next task

## Context Management

### Context Carryover
Two commands manage context between tasks:

```bash
# Create new context carryover file and update prompts
node pmc/bin/aplio-agent-cli.js task-approach

# Manage task context carryover
node system/management/carryover-command.js
```

**When to use independently:**
- When context needs manual synchronization
- When recovering from interrupted tasks
- When verifying context state

## Other Commands

### Git Safe Save
The git-safe-save script provides a safe way to commit and push changes to GitHub:

```bash
# Navigate to the pmc directory first
cd pmc

# Run with default commit message (auto-generated timestamp)
bash system/management/git-safe-save.sh

# Run with custom commit message
bash system/management/git-safe-save.sh "Your custom commit message here"
```

This script:
1. Verifies you're in the correct directory (pmc)
2. Ensures you're on the required branch (main)
3. Adds all changes, commits, and pushes to GitHub
4. Creates a commit report in system/management/commits/

**Safety Features:**
- Prevents commits from wrong directories
- Ensures commits only on the main branch
- Creates commit reports for tracking changes
- Uses standardized commit messages

**When to use:**
- After completing significant development work
- When adding new project files or structures
- Before switching to a different task or context
- When you need to back up your work to GitHub

## Best Practices

1. **Command Usage**
   - Always run commands from the pmc directory
   - Use exact command syntax as shown
   - Include all required parameters
   - Verify command success

2. **Task Flow**
   - Follow the task cycle sequence
   - Complete each phase before moving to next
   - Document all decisions and actions
   - Maintain clear status tracking

3. **Context Preservation**
   - Keep active-task.md updated
   - Log actions as they occur
   - Document dependencies immediately
   - Use context carryover when switching tasks

4. **Error Handling**
   - Log errors with appropriate severity
   - Update confidence levels when issues arise
   - Document recovery steps
   - Use force flags only when necessary 

## Command Reference

### Key Task Commands
```bash
# Task lifecycle
node pmc/bin/aplio-agent-cli.js start-task "T-1.1.1"
node pmc/bin/aplio-agent-cli.js task-approach
node pmc/bin/aplio-agent-cli.js complete-task "T-1.1.1"

# Status management
node pmc/bin/aplio-agent-cli.js update-element-status "T-1.1.1:ELE-1" "Complete"
node pmc/bin/aplio-agent-cli.js update-phase "Preparation Phase" 1 "Set up color token types" "Complete"
node pmc/bin/aplio-agent-cli.js update-phase-stage "T-1.3.3" "PREP" "complete"

# Documentation
node pmc/bin/aplio-agent-cli.js log-action "Added Button component styling" 9 "src/components/button.tsx"
node pmc/bin/aplio-agent-cli.js update-notes "Using CSS custom properties for backward compatibility"

# Issue management
node pmc/bin/aplio-agent-cli.js error "Type error in button component" 7
node pmc/bin/aplio-agent-cli.js log-dependency "T-1.1.1" "Needs color token type" 