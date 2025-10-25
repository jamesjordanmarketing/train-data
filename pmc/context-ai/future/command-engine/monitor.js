/**
 * Conversation Monitor
 *
 * This module analyzes the conversation to detect context changes,
 * such as task transitions, file operations, and other events that
 * should trigger specific commands.
 */

import { log } from './utils.js';

class ConversationMonitor {
  constructor(registry, state) {
    this.registry = registry;
    this.state = state;
    this.lastProcessedMessage = null;
    
    // Regular expression patterns for detecting different contexts
    this.patterns = {
      taskId: /T-\d+\.\d+\.\d+/g,
      elementId: /T-\d+\.\d+\.\d+:ELE-\d+/g,
      filePath: /(?:\/[\w.-]+)+\.\w+|(?:[\w-]+\/)+[\w.-]+\.\w+/g,
      confidence: /confidence(?:\s*level)?(?:\s*:|\s+is|\s+at)?\s*(\d+)(?:\/10)?/i,
      testStatus: /test(?:s|ing)?\s+(?:is|are)?\s*(pass(?:ed|ing)?|fail(?:ed|ing)?|complet(?:ed|e|ing)?|running|ready)/i,
      implementation: /implement(?:ed|ing|ation)/i,
      complete: /(?:task|element|implementation)\s+(?:is|has been)?\s*complet(?:ed|e)/i,
      markComplete: /mark\s+(?:as|this|task|element)?\s+(?:as)?\s*(?:being)?\s*complet(?:ed|e)/i,
      startTask: /(?:start|begin|starting|beginning|initiate)\s+(?:task|work(?:ing)?\s+on)\s+(T-\d+\.\d+\.\d+)/i,
      fileModified: /(?:modif(?:y|ied)|update[d]?|change[d]?|edit(?:ed)?)\s+(?:the|a|this)?\s*file/i,
      fileCreated: /(?:creat(?:e|ed)|add(?:ed)?|new)\s+(?:a|the|this)?\s*file/i
    };
    
    log('INFO', 'Conversation monitor initialized');
  }
  
  /**
   * Process a message to detect context changes
   * @param {string} message - The message content
   * @param {string} role - The role (user or assistant)
   */
  processMessage(message, role) {
    this.lastProcessedMessage = {
      message,
      role,
      timestamp: new Date()
    };
    
    // Extract all detected patterns
    const detections = this.detectPatterns(message);
    
    // Check for task transitions
    if (detections.taskIds.length > 0) {
      this.checkForTaskTransition(detections.taskIds, message);
    }
    
    // Check for element status changes
    if (detections.elementIds.length > 0) {
      this.checkForElementStatusChange(detections.elementIds, message);
    }
    
    // Check for file operations
    if (detections.filePaths.length > 0) {
      this.checkForFileOperations(detections.filePaths, message);
    }
    
    // Update active context based on detections
    this.updateActiveContext(detections, message, role);
    
    log('INFO', `Processed message (role: ${role}, length: ${message.length})`);
  }
  
  /**
   * Detect all patterns in a message
   * @param {string} message - The message content
   * @returns {object} Object containing all detected patterns
   */
  detectPatterns(message) {
    const result = {
      taskIds: this.extractPattern(message, this.patterns.taskId),
      elementIds: this.extractPattern(message, this.patterns.elementId),
      filePaths: this.extractPattern(message, this.patterns.filePath),
      confidenceLevel: this.extractConfidence(message),
      contexts: this.detectContexts(message),
      isTaskCompletion: this.patterns.complete.test(message) || this.patterns.markComplete.test(message),
      isTaskStart: this.patterns.startTask.test(message),
      isImplementation: this.patterns.implementation.test(message),
      isFileModified: this.patterns.fileModified.test(message),
      isFileCreated: this.patterns.fileCreated.test(message)
    };
    
    // Extract task ID from startTask pattern
    if (result.isTaskStart) {
      const startTaskMatch = message.match(this.patterns.startTask);
      if (startTaskMatch && startTaskMatch[1]) {
        if (!result.taskIds.includes(startTaskMatch[1])) {
          result.taskIds.push(startTaskMatch[1]);
        }
      }
    }
    
    return result;
  }
  
  /**
   * Extract a pattern from a message
   * @param {string} message - The message content
   * @param {RegExp} pattern - The pattern to extract
   * @returns {array} Array of unique matches
   */
  extractPattern(message, pattern) {
    const matches = message.match(pattern) || [];
    return [...new Set(matches)];
  }
  
  /**
   * Extract confidence level from a message
   * @param {string} message - The message content
   * @returns {number|null} Confidence level or null
   */
  extractConfidence(message) {
    const confidenceMatch = message.match(this.patterns.confidence);
    if (confidenceMatch && confidenceMatch[1]) {
      const confidence = parseInt(confidenceMatch[1]);
      if (!isNaN(confidence) && confidence >= 0 && confidence <= 10) {
        return confidence;
      }
    }
    return null;
  }
  
  /**
   * Detect contexts from a message
   * @param {string} message - The message content
   * @returns {array} Array of detected contexts
   */
  detectContexts(message) {
    const contexts = [];
    
    // Always include global context
    contexts.push('global');
    
    // Detect implementation context
    if (this.patterns.implementation.test(message)) {
      contexts.push('implementation');
    }
    
    // Detect task transition context
    if (this.patterns.startTask.test(message)) {
      contexts.push('task_transition');
    }
    
    // Detect task completion context
    if (this.patterns.complete.test(message) || this.patterns.markComplete.test(message)) {
      contexts.push('task_completion');
    }
    
    // Detect file operations context
    if (this.patterns.fileCreated.test(message) || this.patterns.fileModified.test(message)) {
      contexts.push('file_operations');
    }
    
    // Detect element progress context
    if (this.patterns.elementId.test(message) && (
      this.patterns.complete.test(message) || 
      this.patterns.testStatus.test(message)
    )) {
      contexts.push('element_progress');
    }
    
    return contexts;
  }
  
  /**
   * Check for task transitions
   * @param {array} taskIds - Detected task IDs
   * @param {string} message - The message content
   */
  checkForTaskTransition(taskIds, message) {
    // If we have a current task and detected a different task, it's a transition
    if (
      this.state.currentTask && 
      taskIds.length > 0 && 
      !taskIds.includes(this.state.currentTask)
    ) {
      // Only flag as transition if it seems like we're starting a new task
      if (this.patterns.startTask.test(message)) {
        const newTaskId = taskIds[0];
        
        log('INFO', `Detected task transition from ${this.state.currentTask} to ${newTaskId}`);
        
        // Get commands that should be triggered on task transition
        const completionCommands = this.registry.getCommandsForEvent('taskComplete');
        const startCommands = this.registry.getCommandsForEvent('taskStart');
        
        // Add pending commands for the previous task completion
        completionCommands.forEach(cmd => {
          this.state.pendingCommands.push({
            id: cmd.id,
            pattern: cmd.pattern.replace('[TASK_ID]', this.state.currentTask),
            reason: 'Task transition requires completing previous task',
            contextDetected: 'task_completion',
            criticalityLevel: cmd.criticalityLevel,
            timestamp: new Date()
          });
        });
        
        // Add pending commands for the new task start
        startCommands.forEach(cmd => {
          this.state.pendingCommands.push({
            id: cmd.id,
            pattern: cmd.pattern.replace('[TASK_ID]', newTaskId),
            reason: 'Task transition requires starting new task',
            contextDetected: 'task_transition',
            criticalityLevel: cmd.criticalityLevel,
            timestamp: new Date()
          });
        });
        
        // Update current task
        this.state.currentTask = newTaskId;
      }
    } 
    // If we don't have a current task but detected one, set it as current
    else if (!this.state.currentTask && taskIds.length > 0) {
      this.state.currentTask = taskIds[0];
      log('INFO', `Set current task to ${this.state.currentTask}`);
    }
  }
  
  /**
   * Check for element status changes
   * @param {array} elementIds - Detected element IDs
   * @param {string} message - The message content
   */
  checkForElementStatusChange(elementIds, message) {
    // Check if the message indicates a status change
    const isComplete = this.patterns.complete.test(message) || this.patterns.markComplete.test(message);
    let status = 'In Progress';
    
    if (isComplete) {
      status = 'Complete';
    } else {
      // Check for test status
      const testStatusMatch = message.match(this.patterns.testStatus);
      if (testStatusMatch && testStatusMatch[1]) {
        const testStatus = testStatusMatch[1].toLowerCase();
        if (testStatus.includes('pass') || testStatus.includes('complet')) {
          status = 'TEST_PASSED';
        } else if (testStatus.includes('fail')) {
          status = 'TEST_FAILED';
        } else if (testStatus.includes('ready')) {
          status = 'TEST_READY';
        } else if (testStatus.includes('running')) {
          status = 'TESTING';
        }
      }
    }
    
    elementIds.forEach(elementId => {
      // Get commands for element status change
      const elementCommands = this.registry.getCommandsForEvent('elementStatusChange');
      
      // Add pending commands
      elementCommands.forEach(cmd => {
        this.state.pendingCommands.push({
          id: cmd.id,
          pattern: cmd.pattern
            .replace('[ELEMENT_ID]', elementId)
            .replace('[STATUS]', status),
          reason: `Element ${elementId} status changed to ${status}`,
          contextDetected: 'element_progress',
          criticalityLevel: cmd.criticalityLevel,
          timestamp: new Date()
        });
      });
      
      log('INFO', `Detected element status change for ${elementId} to ${status}`);
    });
  }
  
  /**
   * Check for file operations
   * @param {array} filePaths - Detected file paths
   * @param {string} message - The message content
   */
  checkForFileOperations(filePaths, message) {
    filePaths.forEach(filePath => {
      // Determine if this is a file creation or modification
      let eventType = null;
      let purpose = 'Unknown purpose';
      
      if (this.patterns.fileCreated.test(message)) {
        eventType = 'fileCreated';
        purpose = 'Created new file';
      } else if (this.patterns.fileModified.test(message)) {
        eventType = 'fileModified';
        purpose = 'Modified existing file';
      } else if (message.toLowerCase().includes('read') && message.toLowerCase().includes('file')) {
        eventType = 'fileRead';
        purpose = 'Reading file contents';
      }
      
      if (eventType) {
        // Get commands for this file operation
        const fileCommands = this.registry.getCommandsForEvent(eventType);
        
        // Add pending commands
        fileCommands.forEach(cmd => {
          this.state.pendingCommands.push({
            id: cmd.id,
            pattern: cmd.pattern
              .replace('[FILE_PATH]', filePath)
              .replace('[PURPOSE]', purpose)
              .replace('[CHANGES]', 'Changes made to the file'),
            reason: `File operation detected: ${eventType} on ${filePath}`,
            contextDetected: 'file_operations',
            criticalityLevel: cmd.criticalityLevel,
            timestamp: new Date()
          });
        });
        
        log('INFO', `Detected file operation: ${eventType} on ${filePath}`);
      }
    });
  }
  
  /**
   * Update active context based on detections
   * @param {object} detections - Detected patterns
   * @param {string} message - The message content
   * @param {string} role - The role (user or assistant)
   */
  updateActiveContext(detections, message, role) {
    // Update active contexts
    this.state.activeContext = {
      ...this.state.activeContext,
      contexts: detections.contexts,
      lastDetectedTaskIds: detections.taskIds,
      lastDetectedElementIds: detections.elementIds,
      lastDetectedFilePaths: detections.filePaths,
      lastConfidenceLevel: detections.confidenceLevel,
      taskTransitionDetected: detections.isTaskStart,
      taskCompletionDetected: detections.isTaskCompletion,
      implementationDetected: detections.isImplementation,
      fileOperationDetected: detections.isFileCreated || detections.isFileModified
    };
    
    // Add token-count based commands that are due
    const tokenCountCommands = this.registry.getCommandsForTokenCount(this.state.tokenCount);
    tokenCountCommands.forEach(cmd => {
      this.state.pendingCommands.push({
        id: cmd.id,
        pattern: cmd.pattern,
        reason: `Token count threshold reached (${this.state.tokenCount} tokens)`,
        contextDetected: 'global',
        criticalityLevel: cmd.criticalityLevel,
        requiredExecutions: cmd.expectedExecutions - cmd.actualExecutions,
        timestamp: new Date()
      });
    });
    
    log('INFO', `Updated active context with ${detections.contexts.length} contexts`);
  }
  
  /**
   * Get the most relevant pending commands
   * @param {number} limit - Maximum number of commands to return
   * @returns {array} Array of pending commands
   */
  getRelevantPendingCommands(limit = 5) {
    if (!this.state.pendingCommands || this.state.pendingCommands.length === 0) {
      return [];
    }
    
    // Sort by criticality level
    const sortedCommands = [...this.state.pendingCommands].sort((a, b) => {
      const criticalityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
      return criticalityOrder[a.criticalityLevel] - criticalityOrder[b.criticalityLevel];
    });
    
    return sortedCommands.slice(0, limit);
  }
  
  /**
   * Clear a pending command
   * @param {string} commandId - ID of the command to clear
   */
  clearPendingCommand(commandId) {
    this.state.pendingCommands = this.state.pendingCommands.filter(cmd => cmd.id !== commandId);
  }
}

export default ConversationMonitor; 