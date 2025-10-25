/**
 * Command Registry System
 *
 * This module maintains a comprehensive registry of all commands required by the PMC system,
 * their execution status, and the rules for when they should be executed.
 */

import { log } from './utils.js';

class CommandRegistry {
  constructor(initialCommands = []) {
    this.commands = {};
    this.commandHistory = [];
    this.contextTriggers = {};
    
    // Add predefined commands if none were extracted
    if (initialCommands.length === 0) {
      this.initializeDefaultCommands();
    } else {
      initialCommands.forEach(cmd => this.registerCommand(cmd));
    }
    
    log('INFO', `Command Registry initialized with ${Object.keys(this.commands).length} commands`);
  }
  
  /**
   * Initialize default commands based on PMC system prompt
   */
  initializeDefaultCommands() {
    const defaultCommands = [
      {
        id: 'check-context',
        pattern: 'node pmc/bin/aplio-agent-cli.js check-context',
        description: 'Check task context',
        triggerType: 'tokenCount',
        triggerValue: 500,
        required: true,
        criticalityLevel: 'high',
        contexts: ['global'],
        parameters: []
      },
      {
        id: 'log-action',
        pattern: 'node pmc/bin/aplio-agent-cli.js action "[ACTION_DESCRIPTION]" [CONFIDENCE_RATING]',
        description: 'Log an action with confidence rating',
        triggerType: 'tokenCount',
        triggerValue: 2000,
        required: true,
        criticalityLevel: 'high',
        contexts: ['implementation'],
        parameters: ['ACTION_DESCRIPTION', 'CONFIDENCE_RATING']
      },
      {
        id: 'log-file-read',
        pattern: 'node pmc/bin/aplio-agent-cli.js log "Reading file: [FILE_PATH] for [PURPOSE]"',
        description: 'Document file reading purpose',
        triggerType: 'event',
        triggerValue: 'fileRead',
        required: true,
        criticalityLevel: 'medium',
        contexts: ['global'],
        parameters: ['FILE_PATH', 'PURPOSE']
      },
      {
        id: 'start-task',
        pattern: 'node pmc/bin/aplio-agent-cli.js start-task "[TASK_ID]"',
        description: 'Start a new task',
        triggerType: 'event',
        triggerValue: 'taskStart',
        required: true,
        criticalityLevel: 'critical',
        contexts: ['task_transition'],
        parameters: ['TASK_ID']
      },
      {
        id: 'status-in-progress',
        pattern: 'node pmc/bin/aplio-agent-cli.js status "[TASK_ID]" "In Progress"',
        description: 'Mark task as in progress',
        triggerType: 'event',
        triggerValue: 'taskStart',
        required: true,
        criticalityLevel: 'high',
        contexts: ['task_transition'],
        parameters: ['TASK_ID']
      },
      {
        id: 'log-task-approach',
        pattern: 'node pmc/bin/aplio-agent-cli.js log "[TASK_ID]: Beginning implementation with approach: [APPROACH]"',
        description: 'Document implementation approach',
        triggerType: 'event',
        triggerValue: 'taskStart',
        required: true,
        criticalityLevel: 'medium',
        contexts: ['task_transition'],
        parameters: ['TASK_ID', 'APPROACH']
      },
      {
        id: 'status-complete',
        pattern: 'node pmc/bin/aplio-agent-cli.js status "[TASK_ID]" "Complete"',
        description: 'Mark task as complete',
        triggerType: 'event',
        triggerValue: 'taskComplete',
        required: true,
        criticalityLevel: 'high',
        contexts: ['task_completion'],
        parameters: ['TASK_ID']
      },
      {
        id: 'complete-task',
        pattern: 'node pmc/bin/aplio-agent-cli.js complete-task "[TASK_ID]"',
        description: 'Complete a task',
        triggerType: 'event',
        triggerValue: 'taskComplete',
        required: true,
        criticalityLevel: 'critical',
        contexts: ['task_completion'],
        parameters: ['TASK_ID']
      },
      {
        id: 'log-task-completion',
        pattern: 'node pmc/bin/aplio-agent-cli.js log "[TASK_ID]: Completed implementation with [SUCCESS_LEVEL]"',
        description: 'Document task completion',
        triggerType: 'event',
        triggerValue: 'taskComplete',
        required: true,
        criticalityLevel: 'medium',
        contexts: ['task_completion'],
        parameters: ['TASK_ID', 'SUCCESS_LEVEL']
      },
      {
        id: 'file-created',
        pattern: 'node pmc/bin/aplio-agent-cli.js file-created "[FILE_PATH]" "[PURPOSE]"',
        description: 'Document new file creation',
        triggerType: 'event',
        triggerValue: 'fileCreated',
        required: true,
        criticalityLevel: 'medium',
        contexts: ['file_operations'],
        parameters: ['FILE_PATH', 'PURPOSE']
      },
      {
        id: 'file-modified',
        pattern: 'node pmc/bin/aplio-agent-cli.js file-modified "[FILE_PATH]" "[CHANGES]"',
        description: 'Document file modifications',
        triggerType: 'event',
        triggerValue: 'fileModified',
        required: true,
        criticalityLevel: 'medium',
        contexts: ['file_operations'],
        parameters: ['FILE_PATH', 'CHANGES']
      },
      {
        id: 'update-element-status',
        pattern: 'node pmc/bin/aplio-agent-cli.js update-element-status "[ELEMENT_ID]" "[STATUS]"',
        description: 'Update element status',
        triggerType: 'event',
        triggerValue: 'elementStatusChange',
        required: true,
        criticalityLevel: 'high',
        contexts: ['element_progress'],
        parameters: ['ELEMENT_ID', 'STATUS']
      }
    ];
    
    defaultCommands.forEach(cmd => this.registerCommand(cmd));
  }
  
  /**
   * Register a command in the registry
   * @param {object} command - Command details
   */
  registerCommand(command) {
    if (!command.id) {
      command.id = this.generateCommandId(command.pattern);
    }
    
    this.commands[command.id] = {
      ...command,
      executionStatus: {
        executed: false,
        lastExecuted: null,
        executionCount: 0,
        expectedExecutionCount: 0,
        missedExecutions: 0
      }
    };
    
    // Register context triggers
    if (command.contexts && command.contexts.length > 0) {
      command.contexts.forEach(context => {
        if (!this.contextTriggers[context]) {
          this.contextTriggers[context] = [];
        }
        if (!this.contextTriggers[context].includes(command.id)) {
          this.contextTriggers[context].push(command.id);
        }
      });
    }
    
    return command.id;
  }
  
  /**
   * Generate a command ID from its pattern
   * @param {string} pattern - Command pattern
   * @returns {string} Generated ID
   */
  generateCommandId(pattern) {
    const firstWord = pattern.split(' ')[0];
    const secondWord = pattern.split(' ')[1];
    return `${firstWord}-${secondWord}`.replace(/[^\w-]/g, '');
  }
  
  /**
   * Register a command execution
   * @param {string} commandOrPattern - Command ID or pattern
   * @param {object} context - Execution context
   * @returns {boolean} Success status
   */
  registerExecution(commandOrPattern, context = {}) {
    const commandId = this.resolveCommandId(commandOrPattern);
    
    if (!commandId) {
      log('WARN', `Unknown command pattern: ${commandOrPattern}`);
      return false;
    }
    
    const command = this.commands[commandId];
    const now = new Date();
    
    // Update execution status
    command.executionStatus.executed = true;
    command.executionStatus.lastExecuted = now;
    command.executionStatus.executionCount++;
    
    // Record in history
    this.commandHistory.push({
      commandId,
      timestamp: now,
      context
    });
    
    log('INFO', `Registered execution of command: ${commandId}`);
    return true;
  }
  
  /**
   * Resolve a command ID from a pattern
   * @param {string} commandOrPattern - Command ID or pattern
   * @returns {string|null} Resolved command ID or null
   */
  resolveCommandId(commandOrPattern) {
    // If it's already an ID
    if (this.commands[commandOrPattern]) {
      return commandOrPattern;
    }
    
    // Look for matching pattern
    for (const id in this.commands) {
      const command = this.commands[id];
      if (this.matchesPattern(commandOrPattern, command.pattern)) {
        return id;
      }
    }
    
    return null;
  }
  
  /**
   * Check if a command string matches a pattern
   * @param {string} commandString - The command string
   * @param {string} pattern - The pattern to match against
   * @returns {boolean} Whether the command matches the pattern
   */
  matchesPattern(commandString, pattern) {
    // Convert pattern to regex by escaping special chars and replacing placeholders with regex
    const regexPattern = pattern
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
      .replace(/\[([A-Z_]+)\]/g, '([^"\\s]+|"[^"]*")'); // Replace [PLACEHOLDER] with regex
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(commandString);
  }
  
  /**
   * Get commands that should be triggered in a specific context
   * @param {string} context - The context to check
   * @returns {array} Array of command IDs
   */
  getCommandsForContext(context) {
    return this.contextTriggers[context] || [];
  }
  
  /**
   * Get commands that should be triggered by a specific event
   * @param {string} event - The event type
   * @returns {array} Array of command objects
   */
  getCommandsForEvent(event) {
    const result = [];
    
    for (const id in this.commands) {
      const command = this.commands[id];
      if (command.triggerType === 'event' && command.triggerValue === event) {
        result.push({
          id,
          ...command
        });
      }
    }
    
    return result;
  }
  
  /**
   * Get commands that should be triggered at a token count
   * @param {number} tokenCount - Current token count
   * @returns {array} Array of command objects that should be triggered
   */
  getCommandsForTokenCount(tokenCount) {
    const result = [];
    
    for (const id in this.commands) {
      const command = this.commands[id];
      if (command.triggerType === 'tokenCount') {
        const expectedExecutions = Math.floor(tokenCount / command.triggerValue);
        const actualExecutions = command.executionStatus.executionCount;
        
        if (expectedExecutions > actualExecutions) {
          // Update the expected count
          command.executionStatus.expectedExecutionCount = expectedExecutions;
          command.executionStatus.missedExecutions = expectedExecutions - actualExecutions;
          
          result.push({
            id,
            ...command,
            expectedExecutions,
            actualExecutions
          });
        }
      }
    }
    
    return result;
  }
  
  /**
   * Get the status of all commands
   * @returns {object} Command status object
   */
  getCommandStatus() {
    const result = {};
    
    for (const id in this.commands) {
      const command = this.commands[id];
      result[id] = {
        description: command.description,
        pattern: command.pattern,
        required: command.required,
        criticalityLevel: command.criticalityLevel,
        executed: command.executionStatus.executed,
        lastExecuted: command.executionStatus.lastExecuted,
        executionCount: command.executionStatus.executionCount,
        expectedExecutionCount: command.executionStatus.expectedExecutionCount,
        missedExecutions: command.executionStatus.missedExecutions
      };
    }
    
    return result;
  }
  
  /**
   * Get missed critical commands
   * @returns {array} Array of critical commands that were missed
   */
  getMissedCriticalCommands() {
    const result = [];
    
    for (const id in this.commands) {
      const command = this.commands[id];
      
      if (
        command.required &&
        command.criticalityLevel === 'critical' &&
        command.executionStatus.missedExecutions > 0
      ) {
        result.push({
          id,
          description: command.description,
          pattern: command.pattern,
          missedExecutions: command.executionStatus.missedExecutions
        });
      }
    }
    
    return result;
  }
  
  /**
   * Get the command execution debt (all missed required commands)
   * @returns {array} Array of all missed required commands
   */
  getCommandDebt() {
    const result = [];
    
    for (const id in this.commands) {
      const command = this.commands[id];
      
      if (
        command.required &&
        command.executionStatus.missedExecutions > 0
      ) {
        result.push({
          id,
          description: command.description,
          pattern: command.pattern,
          criticalityLevel: command.criticalityLevel,
          missedExecutions: command.executionStatus.missedExecutions
        });
      }
    }
    
    // Sort by criticality level
    result.sort((a, b) => {
      const criticalityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
      return criticalityOrder[a.criticalityLevel] - criticalityOrder[b.criticalityLevel];
    });
    
    return result;
  }
}

export default CommandRegistry; 