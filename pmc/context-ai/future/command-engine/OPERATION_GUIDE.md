# Command Engine Operation Guide

## Overview

The Command Engine is a validation and enforcement framework designed to prevent context loss during the development process by ensuring proper command execution. This guide explains how the Command Engine operates and what you need to know to use it effectively.

## How It Works

### Core Operational Flow

1. **Initialization**
   - The Command Engine loads required commands from the system prompt
   - It sets up components for monitoring, validation, and enforcement
   - Configuration parameters determine checkpoint intervals and log paths

2. **Continuous Monitoring**
   - Every message in the conversation is processed to detect context changes
   - The engine tracks task transitions, file operations, and element status changes
   - Token count is updated to trigger periodic validation checkpoints

3. **Command Validation**
   - Before responding to messages, the engine validates that all required commands have been executed
   - Critical commands must be executed to proceed, while others generate recommendations
   - Context mismatches between conversation and task files are detected

4. **Command Reconciliation**
   - After actions are taken, the engine reconciles executed commands
   - It updates pending commands lists and maintains command execution debt
   - Periodic reconciliation ensures no required commands are missed long-term

5. **Checkpoint Mechanism**
   - At regular token intervals, the engine runs validation checkpoints
   - It creates action plans for missed commands based on criticality
   - Health scores and statistics track system performance over time

6. **User Feedback**
   - The engine generates warnings for critical missing commands
   - It provides recommendations for high-priority commands
   - Status reports inform about the current state and required actions

### Key Components and Their Functions

| Component | File | Primary Function |
|-----------|------|------------------|
| Core Engine | `index.js` | Central coordinator connecting all components |
| Command Registry | `registry.js` | Maintains command definitions and execution history |
| Conversation Monitor | `monitor.js` | Analyzes conversation for context changes |
| Pre-Response Validator | `validator.js` | Ensures required commands are executed |
| Post-Action Reconciliation | `validator.js` | Reconciles commands after execution |
| Checkpoint Mechanism | `checkpoint.js` | Runs validation at token thresholds |
| User Interface | `interface.js` | Generates warnings and recommendations |

## Human Operator Guide

### Preventing Context Loss

Context loss in AI-assisted development typically happens when:
- Task transitions occur without proper documentation
- Critical operations aren't logged
- Status changes aren't recorded
- File modifications aren't tracked

The Command Engine addresses these issues by enforcing command execution, but human operators need to understand how to work with it effectively.

### Key Concepts to Understand

1. **Command Criticality Levels**
   - **Critical**: Must be executed to proceed (e.g., task transition commands)
   - **High**: Should be executed soon (e.g., file operation commands)
   - **Medium**: Important for context (e.g., logging decisions)
   - **Low**: Helpful but optional (e.g., additional documentation)

2. **Context Types**
   - **Task Context**: Current task being worked on
   - **File Operations**: Files being created, modified, or read
   - **Element Progress**: Status of specific task elements
   - **Token-Based**: Commands triggered after specific token counts

3. **Validation States**
   - **Healthy**: All required commands executed
   - **Warning**: Missing high-priority commands
   - **Critical**: Missing critical commands

### Best Practices for Human Operators

#### 1. Ensuring the Engine is Running

- **Verify Initialization**: After starting a session, check that the Command Engine has initialized:
  ```
  node pmc/command-engine/cli.js status
  ```

- **Check Periodic Logs**: Review command-engine.log to verify operation:
  ```
  cat pmc/command-engine/logs/command-engine.log | tail
  ```

#### 2. Responding to Warnings

- **Critical Warnings**: Always execute critical commands immediately when warned
- **High Priority Recommendations**: Execute high priority commands at natural break points
- **Context Mismatch Warnings**: Run check-context and update task context as needed

#### 3. Manual Command Execution

- **Registering Manual Commands**: If you execute a command manually, register it with the engine:
  ```
  node pmc/command-engine/cli.js register "node pmc/bin/aplio-agent-cli.js [command]"
  ```

- **Parallel Command Execution**: If executing commands in parallel processes, always register them

#### 4. Regular Health Checks

- **Run Checkpoints Manually**: At major state changes, run a checkpoint:
  ```
  node pmc/command-engine/cli.js checkpoint
  ```

- **Full Reconciliation**: Periodically run full reconciliation to catch any missed commands:
  ```
  node pmc/command-engine/cli.js reconcile
  ```

#### 5. Key Commands to Never Skip

Never skip these critical context-preservation commands:

1. **When Transitioning Tasks**:
   ```
   node pmc/bin/aplio-agent-cli.js status "[TASK_ID]" "Complete"
   node pmc/bin/aplio-agent-cli.js complete-task "[TASK_ID]"
   node pmc/bin/aplio-agent-cli.js status "[NEW_TASK_ID]" "In Progress"
   node pmc/bin/aplio-agent-cli.js start-task "[NEW_TASK_ID]"
   ```

2. **After File Creation/Modification**:
   ```
   node pmc/bin/aplio-agent-cli.js file-created "[FILE_PATH]" "[PURPOSE]"
   node pmc/bin/aplio-agent-cli.js file-modified "[FILE_PATH]" "[CHANGES]"
   ```

3. **Periodic Context Checking**:
   ```
   node pmc/bin/aplio-agent-cli.js check-context
   ```

4. **When Making Significant Decisions**:
   ```
   node pmc/bin/aplio-agent-cli.js decision "[DECISION_DESCRIPTION]" [CONFIDENCE_RATING]
   ```

### Troubleshooting

#### Common Issues and Solutions

1. **Commands Not Recognized**
   - **Symptom**: Commands executed don't get registered
   - **Solution**: Check command syntax against registered patterns
   - **Fix**: Use the exact command pattern from the system prompt

2. **False Positive Warnings**
   - **Symptom**: Engine warns about missing commands that were executed
   - **Solution**: Register commands manually
   - **Fix**: `node pmc/command-engine/cli.js register "..."`

3. **Task Context Mismatch**
   - **Symptom**: Engine warns about task mismatch
   - **Solution**: Check and update task context files
   - **Fix**: Run check-context and start-task with correct task ID

4. **Command Flood**
   - **Symptom**: Too many pending commands
   - **Solution**: Focus on critical and high priority first
   - **Fix**: `node pmc/command-engine/cli.js clear` then re-run validation

#### Diagnostic Tools

- **View Engine Status**:
  ```
  node pmc/command-engine/cli.js status
  ```

- **Validate Current State**:
  ```
  node pmc/command-engine/cli.js validate
  ```

- **Run Health Check**:
  ```
  node pmc/command-engine/cli.js checkpoint
  ```

- **View Log File**:
  ```
  cat pmc/command-engine/logs/command-engine.log
  ```

## Integration with Development Workflow

### IDE Integration

The Command Engine can be integrated with your IDE workflow:

1. **Add CLI Path to IDE Terminal Profiles**
2. **Set Up Keyboard Shortcuts for Common Commands**
3. **Consider IDE Extensions** that can run commands on file save/change

### CI/CD Integration

For team environments, consider:

1. **Pre-commit Hooks** to validate command execution
2. **Status Checks** that require all critical commands
3. **Integration with Team Dashboards** to show command health

### Customization

The Command Engine can be customized by:

1. **Adding New Commands** to the registry in `registry.js`
2. **Modifying Trigger Conditions** in `monitor.js`
3. **Adjusting Criticality Levels** based on project needs
4. **Changing Checkpoint Intervals** in the configuration

## Advanced Usage

### Command Execution Metrics

Track command execution metrics to identify improvements:

```
node pmc/command-engine/cli.js checkpoint | grep "Health Score"
```

### Custom Command Patterns

Create custom command patterns for specific project needs:

1. Add to the registry in `registry.js`
2. Define trigger conditions and criticality
3. Test with the CLI tool

### Batch Command Execution

For multiple related commands, use batch execution:

```bash
# Example batch script for task transition
#!/bin/bash
node pmc/bin/aplio-agent-cli.js status "T-1.1.1" "Complete"
node pmc/bin/aplio-agent-cli.js complete-task "T-1.1.1"
node pmc/bin/aplio-agent-cli.js summarize-context
node pmc/bin/aplio-agent-cli.js status "T-1.1.2" "In Progress"
node pmc/bin/aplio-agent-cli.js start-task "T-1.1.2"
```

### Command Engine API

For programmatic usage, import the Command Engine into your scripts:

```javascript
import commandEngine from './pmc/command-engine/index.js';
import { executeCommand } from './pmc/command-engine/integration.js';

// Initialize
await commandEngine.initialize();

// Process messages
commandEngine.processMessage(userMessage, 'user');

// Execute commands
await executeCommand('node pmc/bin/aplio-agent-cli.js check-context');

// Validate
const validation = commandEngine.validateBeforeResponse();
if (!validation.canProceed) {
  console.warn(validation.warning);
}
```

## Conclusion

The Command Engine is a powerful tool for preventing context loss during development by enforcing proper command execution. By understanding how it works and following the guidelines in this document, you can ensure your development process maintains consistent context, proper documentation, and reliable tracking of all critical operations.

Remember the key principles:
1. **Never skip critical commands**
2. **Regularly check system health**
3. **Address warnings promptly**
4. **Maintain task context accuracy**

Following these principles will ensure the Command Engine effectively prevents context loss and keeps your development process running smoothly. 