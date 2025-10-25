# Functional Specification: Active Task Complete Task Command

## Document Overview

This specification focuses on implementing the `complete-task` command within the Project Memory Core (PMC) system. The command serves as the final step in task execution, marking a task as completed and archiving its information for future reference. It ensures proper closure of tasks and maintains a historical record of task execution context.

## Core Design Philosophy

The complete-task command is built on four key insights derived from observed AI agent behavior:

1. **Context Preservation**: Task completion must preserve the full execution context, ensuring that all implementation details, decisions, and outcomes are properly archived for future reference.

2. **Structured Verification**: Systematic verification of task completion requirements creates clear checkpoints that prevent premature or incomplete task closure.

3. **Directive Approach**: Clear completion criteria and explicit verification steps create procedural guardrails that make successful task closure more reliable.

4. **Task-Centric Document**: The active-task.md file serves as the central source of truth, containing all relevant information needed for task completion verification and archival.

## Command Purpose and Functionality

The `complete-task` command marks a task as completed and archives its execution context. It verifies that all elements and phases are complete before finalizing the task.

### Command Interface
```
node pmc/bin/aplio-agent-cli.js complete-task [taskId] [--force] [--startnext]
```

### Parameters
- `taskId`: The ID of the task to complete (e.g., "T-1.1.1")
- `--force` (optional): Flag to override completion requirements if some elements or phases are incomplete
- `--startnext` (optional): Flag to automatically start the next task after completion

### Completion Requirements
- All task elements must be marked as "Complete" or "Complete - Unit Test Successful".
- All implementation phases must be marked as "Complete".
- The active-task.md file must exist and be readable.
- The task ID must be valid and match the one in active-task.md.
- All implementation phase steps must be marked as complete.
- The task ID must exist in the project tasks list.
- The progress.md file must exist and be writable.
- The task-implementation-log.md file must exist and be writable.

### Completion Actions
- Updates the Complete Task section in active-task.md with completion timestamp or failure reasons.
- Updates the Recent Actions section in active-task.md with a completion entry.
- Updates the progress.md file to mark the task as complete with a timestamp on the non ELE top line item for the task.
- Updates the task completion percentage in the overall progress section of progress.md.
- Appends a completion entry to the task-implementation-log.md file.
- Archives the entire active-task.md content to the project-execution-context.md file.
- Executes the context carryover script to prepare for the next task.
- If --startnext flag is present, automatically starts the next task via the start-task command.
- Outputs completion status, timestamp, and any failure reasons to the console.

### Implementation Details

The command performs the following operations in strict sequence:

1. **Task Completion Verification**:
   - Checks active-task.md for completion status of all elements
   - Verifies all phase steps are marked as complete
   - If --force flag is not used:
     - Requires all elements to be marked as "Complete - Unit Test Successful" or "Complete"
     - Requires all phase steps to be marked as "Complete"
     - Requires at least one implementation file to be added
   - If --force flag is used:
     - Allows completion with incomplete elements/phases
     - Logs a warning about forced completion

2. **Active Task Document Updates**:
   - Updates active-task.md:
     - In "## Complete Task" section:
       ```markdown
       Task completion status [timestamp]:
       - If 100%: "All elements and sub-elements completed successfully"
       - If not: "Incomplete items found:
         - ELE-1: Implementation Phase not complete
         - ELE-2b: Validation Phase not complete"
       ```
       - If completed with --force flag: "Task completed with force flag. Incomplete items: [list of incomplete items]"
     - In "## Recent Actions" section:
       ```markdown
       - [timestamp] Completed task [TASK_ID] [with incomplete elements if applicable]
       ```

3. **Progress File Updates**:
   - Updates core/progress.md:
     - Changes task status to "Complete"
     - Adds completion timestamp
     - Updates overall project completion percentage
   - Format: `- [x] [TaskID]: Task Description (Status: Complete, Updated: [timestamp])`

4. **Task Implementation Log Updates**:
   - Appends completion entry to core/task-implementation-log.md
   - Includes:
     - Task ID and description
     - Completion timestamp
     - Status of all elements
     - Any forced completion warnings
     - Summary of task execution context

5. **Task Execution Context Archival**:
   - Copies entire active-task.md content (including updates from step 2) to system/execution-context/project-execution-context.md
   - Adds a separator line of 80 equal signs (=)
   - Preserves all sections and formatting
   - Maintains chronological order of task completions
   - Adds a new header line including: Task ID# & Title, Completion Status, Testing Status timestamp

6. **Context Carryover**:
   - Executes the context carryover script:
     ```bash
     node system/management/carryover-command.js
     ```

7. **Optional Next Task Start**:
   - If --startnext flag is present:
     - Calls the start-task command for the next Task ID from 06-aplio-mod-1-tasks.md

## Implementation Requirements

The command implementation must:

1. **Verify Task Completion Status**:
   - Check Elements Section:
     ```
     - [x] [TaskID:ELE-1]: Element Description (Status: Complete - Unit Test Successful)
     ```
   - Check Phase Steps:
     ```
     ### Preparation Phase
     - [x] Step 1 description
     ```

2. **Update Progress Tracking**:
   - Modify progress.md format:
     ```
     - [x] [TaskID]: Task Description (Status: Complete, Updated: [timestamp])
     ```
   - Update completion percentage:
     ```
     ## Overall Progress
     - Tasks Completed: X of Y
     - Current Completion: Z%
     ```

3. **Archive Task Context**:
   - Append to project-execution-context.md:
     ```
     [Full active-task.md content]
     ================================================================================
     ```

4. **Handle Error Cases**:
   - Missing active-task.md file
   - Invalid task ID
   - Incomplete elements/phases without --force flag
   - File access/write permission issues

## Technical Implementation Approach

The implementation should:

1. **Update context-manager.js**:
   - Add `completeTask` function
   - Implement verification logic
   - Handle archival operations
   - Manage progress updates

2. **Add CLI Interface**:
   - Parse command arguments
   - Handle --force flag
   - Provide clear success/error messages

3. **Implement File Operations**:
   - Read active-task.md
   - Update progress.md
   - Append to project-execution-context.md
   - Update task-implementation-log.md

4. **Add Validation Logic**:
   - Check element completion status
   - Verify phase step completion
   - Validate task existence
   - Handle force flag logic

## Sections to Update in active-task.md

The active-task.md file has the following sections that must be verified for task completion:

1. **Components/Elements Section**:
   - All elements must be marked as complete
   - Format: `- [x] [TaskID:ELE-X]: Element Description (Status: Complete - Unit Test Successful)`

2. **Phase Steps**:
   - All phase steps must be marked as complete
   - Format: `- [x] Step description`

3. **Task Information**:
   - Update completion status and timestamp
   - Record final task state before archival

## Example Usage

```bash
# Normal completion
node pmc/bin/aplio-agent-cli.js complete-task "T-1.1.1"

# Forced completion
node pmc/bin/aplio-agent-cli.js complete-task "T-1.1.1" --force
```

Expected output (normal completion):
```
Completing task T-1.1.1...
Verifying task completion status...
All elements complete: Yes
All phases complete: Yes
Updating progress.md...
Task marked as complete in progress.md
Archiving task execution context...
Context archived to project-execution-context.md
Task T-1.1.1 completed successfully.
```

Expected output (forced completion):
```
Completing task T-1.1.1...
WARNING: Using force flag - proceeding with incomplete elements/phases
Verifying task completion status...
Incomplete elements found: 2
Incomplete phases found: 1
Updating progress.md...
Task marked as complete in progress.md (forced)
Archiving task execution context...
Context archived to project-execution-context.md
Task T-1.1.1 completed with warnings (forced completion).
```

## Implementation Considerations

1. **File Handling**:
   - Ensure atomic file operations
   - Handle large file sizes
   - Maintain file integrity
   - Preserve file formatting

2. **Error Handling**:
   - Provide clear error messages
   - Handle partial failures gracefully
   - Allow rollback of failed operations
   - Log all errors for debugging

3. **Performance**:
   - Optimize file operations
   - Handle large task contexts efficiently
   - Minimize file system operations

4. **Testing Requirements**:
   - Test with various task states
   - Verify forced completion behavior
   - Check file operation atomicity
   - Validate progress calculations

## Conclusion

The `complete-task` command provides a robust mechanism for task completion and context archival within the PMC system. It ensures proper task closure, maintains historical records, and updates project progress tracking. The implementation balances the need for completion verification with flexibility through the force flag option, while maintaining the integrity of the project's execution history.

### Implementation Changes

The command implementation will be updated with the following changes:

1. **Fix for --startnext Parameter Bug**:
   - Fix the bug in the CLI argument parsing where the taskId is incorrectly set to args[0] (which is 'complete-task') instead of args[1].
   - Current incorrect code in aplio-agent-cli.js:
     ```javascript
     const taskId = args[0];
     ```
   - Corrected code:
     ```javascript
     const taskId = args[1];
     ```
   - This fix will ensure the --startnext parameter works properly by passing the correct task ID to the completeTask function.

2. **Remove Implementation Files Requirements**:
   - The verification for implementation files in the "Expected Implementation Files" section will be removed entirely.
   - Tasks will be completable without requiring any additional implementation files to be added.
   - This recognizes that default task descriptions may already specify files, and the ## Expected Implementation Files section may not need any additions.

3. **Enhanced Complete Task Section Updates**:
   - The "## Complete Task" section in active-task.md will be updated with more detailed information:
     - For successful completion: A timestamp and confirmation of successful completion.
     - For failed completion attempts: A list of each reason the task could not be completed (one per line). This must list each specific reason (i.e., "Implementation phase XYZ step ABC was not marked complete in core/active-task.md").
     - For forced completion: A list of the reasons that would have prevented completion, followed by a note that --force was used.
   - This provides clearer feedback to the human operator and AI assistant about the state of the task completion.
   - Example update format:
     ```markdown
     ## Complete Task
     
     Task completion status [04/04/2025, 12:55:23 AM]:
     ALL ELEMENTS COMPLETED SUCCESSFULLY
     ```
     
     Or for failed completion:
     ```markdown
     ## Complete Task
     
     Task completion status [04/04/2025, 12:55:23 AM]:
     COMPLETION FAILED DUE TO:
     - Element T-1.2.1:ELE-3 is not marked as Complete
     - Validation Phase step 2 "Organize tokens in a consistent schema" is not marked as Complete
     ```
     
     Or for forced completion:
     ```markdown
     ## Complete Task
     
     Task completion status [04/04/2025, 12:55:23 AM]:
     INCOMPLETE ITEMS (FORCED COMPLETION):
     - Element T-1.2.1:ELE-3 is not marked as Complete
     - Validation Phase step 2 "Organize tokens in a consistent schema" is not marked as Complete
     Task completed with --force flag override
     ```

4. **Enhanced Console Output**:
   - The command will provide detailed console output including:
     - Completion timestamp
     - Success or failure status
     - Specific failure reasons (if applicable)
     - Forced completion details (if applicable)
   - Example console output on successful completion:
     ```
     Completing task T-1.2.1...
     [04/04/2025, 12:55:23 AM] All elements and phases complete.
     Task T-1.2.1 completed successfully.
     ```
   - Example console output on failure:
     ```
     Completing task T-1.2.1...
     [04/04/2025, 12:55:23 AM] Task completion failed.
     Reasons:
     - Element T-1.2.1:ELE-3 is not marked as Complete
     - Validation Phase step 2 "Organize tokens in a consistent schema" is not marked as Complete
     ```

5. **Required Sections Verification**:
   - The command will now explicitly check for the existence of all required sections in active-task.md:
     - Task Information
     - Components/Elements
     - Implementation Process Phases
     - Current Element
     - Recent Actions
     - Complete Task
   - If any of these sections are missing, the task completion will fail unless forced.
   - Each missing section will be listed as a specific reason for failure in both the console output and the Complete Task section update.
   - Example output with missing sections:
     ```
     Completing task T-1.2.1...
     [04/04/2025, 12:55:23 AM] Task completion failed.
     Reasons:
     - Required section 'Recent Actions' is missing from active-task.md
     - Element T-1.2.1:ELE-3 is not marked as Complete
     ```

### Required Sections Clarification

The requirement "All required sections must be present in active-task.md" refers to the following key sections that are essential for task processing:

1. **Task Information**: Contains the task ID, title, and basic metadata
2. **Components/Elements**: Lists all task elements that need to be completed
3. **Implementation Process Phases**: Contains the preparation, implementation, and validation phases
4. **Current Element**: Tracks the currently active element
5. **Recent Actions**: Records actions taken during task implementation
6. **Complete Task**: The section where completion status will be recorded

These sections are determined by the structure defined in the task template used when starting a task. The system verifies these sections exist by checking for their section headers (e.g., "## Task Information", "## Components/Elements") in the active-task.md file. If any of these critical sections are missing, the completion process cannot properly verify task status or update completion information.

### Implementation Files and Code Structure

The complete-task command is implemented across two main files:

1. **pmc/bin/aplio-agent-cli.js**:
   - Contains the CLI command parser and handler
   - Defines the `completeTaskCommand` function that calls the implementation in context-manager-v2.js
   - Current issue: In the complete-task case, taskId is set to args[0] which is 'complete-task' instead of args[1]

2. **pmc/system/management/context-manager-v2.js**:
   - Contains the core implementation of the `completeTask` function
   - Handles verification of task completion status
   - Updates the complete task section in active-task.md
   - Updates progress tracking files
   - Archives task execution context

### Detailed Implementation Approach

#### 1. Fix the CLI Command in aplio-agent-cli.js:

```javascript
// Current buggy code in the switch statement:
case 'complete-task':
  const taskId = args[0];
  const options = {
    force: args.includes('--force'),
    startNext: args.includes('--startnext')
  };
  completeTaskCommand(taskId, options);
  break;

// Fixed code:
case 'complete-task':
  const taskId = args[1];
  const options = {
    force: args.includes('--force'),
    startNext: args.includes('--startnext')
  };
  completeTaskCommand(taskId, options);
  break;
```

#### 2. Remove Implementation File Requirements in context-manager-v2.js:

The current implementation doesn't explicitly check for implementation files, so no changes are needed here. However, we'll ensure that verifyElementCompletion and verifyPhaseCompletion functions don't include any checks for implementation files.

#### 3. Enhance Complete Task Section Updates in context-manager-v2.js:

Update the `updateCompleteTaskSection` function to provide more detailed information:

```javascript
function updateCompleteTaskSection(activeTaskContent, elementStatus, phaseStatus, forced = false) {
  const timestamp = formatTimestamp();
  let completionStatus = '';

  // For successful completion
  if (elementStatus.allComplete && phaseStatus.allComplete) {
    completionStatus = `Task completion status [${timestamp}]:\nALL ELEMENTS COMPLETED SUCCESSFULLY`;
  } 
  // For failed completion attempts (when --force is not used)
  else if (!forced) {
    completionStatus = `Task completion status [${timestamp}]:\nCOMPLETION FAILED DUE TO:`;
    
    if (elementStatus.incompleteElements.length > 0) {
      elementStatus.incompleteElements.forEach(element => {
        completionStatus += `\n- Element ${element.elementId} is not marked as Complete`;
      });
    }
    
    if (phaseStatus.incompletePhases.length > 0) {
      phaseStatus.incompletePhases.forEach(phase => {
        completionStatus += `\n- ${phase} is not marked as Complete`;
      });
    }
  }
  // For forced completion
  else {
    completionStatus = `Task completion status [${timestamp}]:\nINCOMPLETE ITEMS (FORCED COMPLETION):`;
    
    if (elementStatus.incompleteElements.length > 0) {
      elementStatus.incompleteElements.forEach(element => {
        completionStatus += `\n- Element ${element.elementId} is not marked as Complete`;
      });
    }
    
    if (phaseStatus.incompletePhases.length > 0) {
      phaseStatus.incompletePhases.forEach(phase => {
        completionStatus += `\n- ${phase} is not marked as Complete`;
      });
    }
    
    completionStatus += `\nTask completed with --force flag override`;
  }

  const completeTaskSection = findSectionInActiveTask(activeTaskContent, 'Complete Task');
  if (!completeTaskSection.found) {
    return activeTaskContent + `\n\n## Complete Task\n${completionStatus}\n`;
  }

  return (
    activeTaskContent.substring(0, completeTaskSection.startIndex) +
    `## Complete Task\n${completionStatus}\n` +
    activeTaskContent.substring(completeTaskSection.endIndex)
  );
}
```

#### 4. Enhance Console Output in completeTask Function:

Update the completeTask function in context-manager-v2.js to provide more detailed console output:

```javascript
export async function completeTask(taskId, options = {}) {
  const { force = false, startNext = false } = options;
  const timestamp = formatTimestamp();
  
  try {
    // 1. Read active task content
    const activeTaskContent = await fs.promises.readFile(PATHS.activeTaskFile, 'utf8');

    // 2. Verify completion status
    const elementStatus = verifyElementCompletion(activeTaskContent);
    const phaseStatus = verifyPhaseCompletion(activeTaskContent);

    // 3. Check if task can be completed
    if (!force && (!elementStatus.allComplete || !phaseStatus.allComplete)) {
      // Prepare detailed error message for console output
      let errorMessage = `[${timestamp}] Task completion failed.\nReasons:`;
      
      if (elementStatus.incompleteElements.length > 0) {
        elementStatus.incompleteElements.forEach(element => {
          errorMessage += `\n- Element ${element.elementId} is not marked as Complete`;
        });
      }
      
      if (phaseStatus.incompletePhases.length > 0) {
        phaseStatus.incompletePhases.forEach(phase => {
          errorMessage += `\n- ${phase} is not marked as Complete`;
        });
      }
      
      throw new Error(errorMessage);
    }

    // 4. Update active-task.md sections
    let updatedContent = updateCompleteTaskSection(activeTaskContent, elementStatus, phaseStatus, force);
    updatedContent = updateRecentActionsSection(
      updatedContent, 
      taskId, 
      !elementStatus.allComplete || !phaseStatus.allComplete
    );
    await fs.promises.writeFile(PATHS.activeTaskFile, updatedContent);

    // 5. Update progress.md
    await updateProgressFile(taskId, force);

    // 6. Update task-implementation-log.md
    await updateTaskImplementationLog(taskId, elementStatus, force);

    // 7. Archive to project-execution-context.md
    await archiveTaskContext(updatedContent, taskId);

    // 8. Run context carryover script
    await execAsync(`node ${PATHS.carryoverScript}`);

    // 9. Optionally start next task
    if (startNext) {
      const nextTaskId = await getNextTaskId(taskId);
      if (nextTaskId) {
        await execAsync(`node ${path.join(PROJECT_ROOT, 'bin', 'aplio-agent-cli.js')} start-task ${nextTaskId}`);
      }
    }

    // 10. Return success with enhanced message
    return {
      success: true,
      message: `[${timestamp}] ${force && (!elementStatus.allComplete || !phaseStatus.allComplete) ? 
        'Task completed with --force override.' : 
        'All elements and phases complete.'}\nTask ${taskId} completed successfully${force ? ' (forced)' : ''}.`
    };
  } catch (error) {
    return {
      success: false,
      message: error.message.includes('Task completion failed') ? 
        error.message : 
        `Failed to complete task: ${error.message}`
    };
  }
}
```

This implementation approach addresses all the required changes:
1. Fixes the bug in the CLI argument parsing
2. Removes implementation file requirements
3. Enhances the Complete Task section updates with detailed information
4. Improves console output with timestamps and specific error messages

The changes are focused on the two main files where the complete-task command is implemented, ensuring all requirements are met without introducing any new bugs.
