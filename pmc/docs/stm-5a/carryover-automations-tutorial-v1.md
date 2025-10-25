# Project Memory Core (PMC) - Carryover Automations Tutorial v1.0

## Overview

This tutorial documents how human operators should execute the automated handoff processes in the Project Memory Core (PMC) system. These automations enable seamless task transitions between AI agents by generating customized context and conductor prompts.

**Two Primary Automation Processes:**
- **A. New Task Handoff Process** - Transitions from completed task to next task implementation
- **B. New Test Handoff Process** - Transitions from completed task to testing phase

Both processes use timestamp-based file naming: `MM-DD-YY-HHMMAM/PM` (e.g., `06-23-25-1228AM`)

---

## A. New Task Handoff Process

### Purpose
Automates the transition from a completed task (testing phase) to the next task implementation by generating customized context and conductor prompts for the implementation agent.

### Prerequisites
- Task completion and testing phases are finished
- You are ready to hand off to the next task implementation agent
- Access to terminal in project root directory

### Human Operator Steps

#### Step 1: Initial Setup Commands
Execute these commands in sequence **before** starting the AI automation:

```bash
# Navigate to project root
cd pmc

# Start the next task (replace T-X.X.X with actual task ID)
node bin/aplio-agent-cli.js start-task "T-X.X.X"

# Run the new panel automation script
node system/management/new-panel-new-task.js
```

**Expected Output:** 
- ✅ Script completion confirmation
- Files archived to `new-panel-history/`
- New files created with current timestamp

#### Step 2: Paste Automation Prompt to AI Agent
Copy and paste the content from:
```
system/plans/new-panels/00-new-panel-new-task-automation-prompt-[DATETIMESTAMP].md
```

**AI Agent will then:**
1. Verify directory location
2. Confirm script execution completed
3. Execute context carryover prompt
4. Execute conductor optimization prompt

#### Step 3: Monitor AI Execution
The AI agent will execute two key prompts:

**3a. Context Carryover (01-new-panel-new-task-[DATETIMESTAMP].md)**
- Updates: `02-new-task-carry-context-[DATETIMESTAMP].md`
- Contains comprehensive context from completed task
- Provides preparation details for next task
- **Wait Time:** 60 seconds for completion

**3b. Conductor Optimization (03-new-panel-new-task-conductor-[DATETIMESTAMP].md)**
- Creates: `04-new-panel-new-task-conductor-output-[DATETIMESTAMP].md`
- Generates optimized conductor prompt for next implementation agent
- **Wait Time:** 60 seconds for completion

#### Step 4: Verification
Confirm these files exist and contain relevant content:
- `system/plans/new-panels/02-new-task-carry-context-[DATETIMESTAMP].md`
- `system/plans/new-panels/04-new-panel-new-task-conductor-output-[DATETIMESTAMP].md`

#### Step 5: Handoff to Implementation Agent
Copy the contents of:
```
system/plans/new-panels/04-new-panel-new-task-conductor-output-[DATETIMESTAMP].md
```
Paste this optimized conductor prompt into a new AI implementation agent panel.

---

## B. New Test Handoff Process

### Purpose
Automates the transition from a completed task implementation to the testing phase by generating customized test context and conductor prompts for the testing agent.

### Prerequisites
- Task implementation phase is completed
- You are ready to hand off to testing agent
- Access to terminal in project root directory

### Human Operator Steps

#### Step 1: Initial Setup Commands
Execute this command **before** starting the AI automation:

```bash
# Navigate to project root
cd pmc

# Run the new test automation script
node system/management/new-panel-new-test.js
```

**Expected Output:**
- ✅ Script completion confirmation  
- Files archived to `new-tests-history/`
- New files created with current timestamp

#### Step 2: Paste Test Automation Prompt to AI Agent
Copy and paste the content from:
```
system/plans/new-tests/00-new-test-automation-prompt-[DATETIMESTAMP].md
```

**AI Agent will then:**
1. Verify directory location
2. Confirm script execution completed
3. Execute test context carryover prompt
4. Execute test conductor optimization prompt

#### Step 3: Monitor AI Execution
The AI agent will execute two key prompts:

**3a. Test Context Carryover (01-new-test-carry-prompt-[DATETIMESTAMP].md)**
- **Step 1:** Updates `02-new-test-carry-context-[DATETIMESTAMP].md`
  - Contains implementation context for testing agent
  - Documents testing focus areas and requirements
- **Step 2:** Creates `03-new-test-active-test-2-enhanced-[DATETIMESTAMP].md`
  - Enhanced test plan specific to completed task
  - Copies to `pmc/core/active-task-unit-tests-2-enhanced.md`
- **Wait Time:** 120 seconds for completion

**3b. Test Conductor Optimization (04-new-test-conductor-prompt-[DATETIMESTAMP].md)**
- Creates: `05-new-test-conductor-output-[DATETIMESTAMP].md`
- Generates optimized test conductor prompt for testing agent
- **Wait Time:** 60 seconds for completion

#### Step 4: Verification
Confirm these files exist and contain relevant content:
- `system/plans/new-tests/02-new-test-carry-context-[DATETIMESTAMP].md`
- `system/plans/new-tests/03-new-test-active-test-2-enhanced-[DATETIMESTAMP].md`
- `system/plans/new-tests/05-new-test-conductor-output-[DATETIMESTAMP].md`
- `pmc/core/active-task-unit-tests-2-enhanced.md` (copy of enhanced test plan)

#### Step 5: Handoff to Testing Agent
Copy the contents of:
```
system/plans/new-tests/05-new-test-conductor-output-[DATETIMESTAMP].md
```
Paste this optimized test conductor prompt into a new AI testing agent panel.

---

## File Structure Reference

### New Task Handoff Files
```
system/plans/new-panels/
├── 00-new-panel-new-task-automation-prompt-[DATETIMESTAMP].md  # Main automation prompt
├── 01-new-panel-new-task-[DATETIMESTAMP].md                   # Context carryover prompt
├── 02-new-task-carry-context-[DATETIMESTAMP].md               # Generated context file
├── 03-new-panel-new-task-conductor-[DATETIMESTAMP].md         # Conductor optimization prompt
├── 04-new-panel-new-task-conductor-output-[DATETIMESTAMP].md  # Final conductor prompt
└── new-panel-history/                                         # Archived previous versions
```

### New Test Handoff Files
```
system/plans/new-tests/
├── 00-new-test-automation-prompt-[DATETIMESTAMP].md           # Main test automation prompt
├── 01-new-test-carry-prompt-[DATETIMESTAMP].md                # Test context carryover prompt
├── 02-new-test-carry-context-[DATETIMESTAMP].md               # Generated test context file
├── 03-new-test-active-test-2-enhanced-[DATETIMESTAMP].md      # Enhanced test plan
├── 04-new-test-conductor-prompt-[DATETIMESTAMP].md            # Test conductor optimization prompt
├── 05-new-test-conductor-output-[DATETIMESTAMP].md            # Final test conductor prompt
└── new-tests-history/                                         # Archived previous versions
```

---

## Process Flow Diagrams

### New Task Handoff Flow
```
Human: Execute setup commands
  ↓
Human: Paste automation prompt to AI
  ↓
AI: Execute context carryover (60s)
  ↓
AI: Execute conductor optimization (60s)
  ↓
Human: Verify files generated
  ↓
Human: Copy conductor output to implementation agent
```

### New Test Handoff Flow
```
Human: Execute setup command
  ↓
Human: Paste test automation prompt to AI
  ↓
AI: Execute test context carryover (120s)
  ↓
AI: Execute test conductor optimization (60s)
  ↓
Human: Verify files generated
  ↓
Human: Copy test conductor output to testing agent
```

---

## Troubleshooting

### Common Issues

**File Not Found Errors:**
- Ensure you're in the `pmc` directory
- Verify automation scripts completed successfully
- Check that template files exist in `system/templates/`

**Context Not Updated:**
- Wait full specified time (60s or 120s) before checking
- Verify AI agent is running from correct directory
- Re-run the automation prompt if files remain empty

**Directory Navigation Issues:**
- Always start from project root
- Use `cd pmc` explicitly
- Avoid compound commands with `&&` for directory navigation

### File Verification Commands
```bash
# Check if files exist
ls -la system/plans/new-panels/
ls -la system/plans/new-tests/

# Verify file content (first 10 lines)
head -n 10 system/plans/new-panels/02-new-task-carry-context-[DATETIMESTAMP].md
head -n 10 system/plans/new-tests/05-new-test-conductor-output-[DATETIMESTAMP].md
```

---

## Quality Checklist

### Before Starting Automation
- [ ] Task implementation/testing phase completed
- [ ] In correct directory (`pmc`)
- [ ] Automation script executed successfully
- [ ] Automation prompt ready to paste

### After AI Execution
- [ ] Context carryover file contains relevant task information
- [ ] Conductor output file contains optimized prompt
- [ ] All referenced files exist and are accessible
- [ ] Wait times respected (60s/120s)

### Before Agent Handoff
- [ ] Final conductor prompt copied correctly
- [ ] Next agent panel ready for paste
- [ ] Previous task context preserved in carryover files
- [ ] File timestamps match current session

---

## Advanced Tips

### Timestamp Management
- Timestamps are auto-generated by automation scripts
- Historical files are preserved in `*-history/` directories
- Use timestamps to track session progression

### Context Quality
- Context carryover files capture implementation details from chat history
- Enhanced test plans adapt generic templates to specific tasks
- Conductor prompts provide task-specific guidance for next agents

### File Relationships
- Context files inform conductor optimization
- Enhanced test plans override base test templates
- All files reference current task specifications

---

## Integration with PMC System

These automation processes integrate with the broader PMC (Project Memory Core) system:

- **Task Management:** Integrates with `active-task.md` and task progression
- **Phase Tracking:** Works with PMC CLI commands for phase management
- **Context Preservation:** Maintains task context across agent transitions
- **Quality Assurance:** Ensures consistent handoff processes

For more information on PMC system commands, see `pmc/bin/aplio-agent-cli.js`

---

**Document Version:** v1.0  
**Last Updated:** 2025-01-05  
**Covers:** New Task Handoff Process & New Test Handoff Process  
**Target Audience:** Human PMC Operators
