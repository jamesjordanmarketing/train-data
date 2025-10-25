# Command Engine for Project Memory Core

## Overview

The Command Engine is a validation and enforcement framework that ensures all required commands from the PMC system prompt are properly executed. It tracks conversation context, monitors for task transitions, and validates that essential commands are run at the appropriate times.

## Purpose

The primary goal of the Command Engine is to prevent context loss by enforcing consistent command execution throughout the development process. It addresses common issues like:

- Forgetting to mark tasks as in-progress or complete
- Missing required logging commands
- Not updating task context when transitioning between tasks
- Failing to document file operations and element status changes

## Key Features

1. **Command Validation**: Verifies that all required commands are executed according to the system prompt
2. **Context Monitoring**: Tracks conversation to detect task transitions, file operations, and context changes
3. **Pre-Response Validation**: Checks before responding to ensure required commands were run
4. **Post-Action Reconciliation**: Reconciles command execution after actions are taken
5. **Scheduled Checkpoints**: Performs regular validation at token-count thresholds
6. **User-Facing Prompts**: Provides clear warnings and recommendations when commands are missed

## Components

The Command Engine consists of several core components:

### 1. Command Registry (`registry.js`)

Maintains a registry of all commands required by the PMC system, their execution status, and rules for when they should be executed.

Key features:
- Tracks command execution history
- Maps commands to specific contexts
- Identifies missed critical commands
- Calculates command execution debt

### 2. Conversation Monitor (`monitor.js`)

Analyzes the conversation to detect context changes such as task transitions, file operations, and events that should trigger specific commands.

Key features:
- Detects task IDs, element IDs, and file paths in conversations
- Identifies task transitions and status changes
- Maintains active conversation context
- Generates pending commands based on detected events

### 3. Pre-Response Validator (`validator.js`)

Validates the state before the assistant responds to ensure all required commands are executed.

Key features:
- Identifies missing critical commands
- Generates recommendations for required commands
- Checks for context mismatches
- Produces validation results with warnings

### 4. Post-Action Reconciliation (`validator.js`)

Reconciles command execution after actions are taken to ensure all required commands are executed.

Key features:
- Updates pending commands based on executed actions
- Performs full reconciliation of all commands
- Provides reconciliation status and recommendations

### 5. Checkpoint Mechanism (`checkpoint.js`)

Manages scheduled checkpoints to validate command execution and reconcile missed commands at regular intervals.

Key features:
- Runs checkpoints at specified token thresholds
- Creates action plans for missed commands
- Logs checkpoint results for auditing
- Calculates health scores based on checkpoint history

### 6. User Interface (`interface.js`)

Generates user-facing prompts, warnings, and recommendations based on the current state.

Key features:
- Formats warnings and recommendations
- Generates task status reports
- Provides clear instructions for fixing issues
- Detects task context mismatches

## Integration with PMC

The Command Engine integrates with the Project Memory Core (PMC) system by:

1. **Reading from PMC Files**:
   - `task-context.md`: Reads current task information
   - `progress.md`: Reads current progress and element status
   - System prompt: Extracts required commands and execution rules

2. **Monitoring PMC Commands**:
   - Tracks when commands are executed via the CLI
   - Verifies parameters and execution context
   - Updates execution status in the registry

3. **Enforcing Command Execution**:
   - Provides warnings for missing critical commands
   - Generates command recommendations at the right time
   - Reminds about context management commands

## Usage

### Initialization

```javascript
import commandEngine from './command-engine/index.js';

// Initialize the engine
await commandEngine.initialize();
```

### Processing Messages

```javascript
// Process each message to detect context changes
commandEngine.processMessage(message, 'user');
```

### Validating Before Responding

```javascript
// Validate before responding
const validation = commandEngine.validateBeforeResponse();

if (!validation.canProceed) {
  // Handle critical command missing
  console.warn(validation.warning);
  // Execute recommended commands
}
```

### Registering Command Execution

```javascript
// When a command is executed, register it
commandEngine.registerCommandExecution('node pmc/bin/aplio-agent-cli.js start-task "T-1.1.2"', {
  taskId: 'T-1.1.2',
  context: 'task_transition'
});
```

### Running Checkpoints

```javascript
// Run checkpoint at regular intervals
const checkpoint = commandEngine.runCheckpoint();
console.log(`Checkpoint status: ${checkpoint.status}`);
```

## Installation

The Command Engine is installed as part of the Project Memory Core system. No additional installation steps are required.

## Configuration

The Command Engine can be configured by modifying the `config` object in `index.js`:

```javascript
this.config = {
  systemPromptPath: path.join(__dirname, '../system/prompt/system-prompt.md'),
  checkpointInterval: 500, // tokens
  reconciliationInterval: 2000, // tokens
  logPath: path.join(__dirname, 'logs/command-engine.log'),
  debugMode: true
};
```

## Logs and Monitoring

The Command Engine maintains detailed logs at:
- `command-engine/logs/command-engine.log`: Main log file
- `command-engine/logs/checkpoints/`: Checkpoint results

## Troubleshooting

### Common Issues

1. **Missing Critical Commands**: 
   - Problem: Validation fails with "Missing critical commands"
   - Solution: Execute the recommended commands before proceeding

2. **Task Context Mismatch**:
   - Problem: Task in conversation doesn't match task-context.md
   - Solution: Run `check-context` and then `start-task` with the correct task ID

3. **Command Syntax Errors**:
   - Problem: Commands not recognized due to syntax errors
   - Solution: Check command pattern and parameters against the registry

## Extending the Command Engine

The Command Engine can be extended with new functionality:

- Add new commands to the registry
- Implement additional context detection in the monitor
- Create new validation rules in the validator
- Add custom checkpoints in the checkpoint mechanism

## License

The Command Engine is part of the Project Memory Core system and shares its licensing terms. 