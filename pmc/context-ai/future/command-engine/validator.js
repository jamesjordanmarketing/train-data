/**
 * Validators
 *
 * This module contains the validation components:
 * 1. PreResponseValidator - Validates before assistant responds to ensure all required commands run
 * 2. PostActionReconciliation - Reconciles command execution after actions are taken
 */

import { log } from './utils.js';

/**
 * Pre-Response Validator
 * 
 * Validates the state before the assistant responds to ensure all
 * required commands are executed
 */
class PreResponseValidator {
  constructor(registry, state) {
    this.registry = registry;
    this.state = state;
    
    log('INFO', 'Pre-Response Validator initialized');
  }
  
  /**
   * Validate the current state before responding
   * @returns {object} Validation results with warnings and recommendations
   */
  validate() {
    const result = {
      canProceed: true,
      missingCriticalCommands: [],
      missingHighPriorityCommands: [],
      recommendations: [],
      pendingCommands: [],
      warning: null
    };
    
    // Get missed critical commands
    const missedCriticalCommands = this.registry.getMissedCriticalCommands();
    if (missedCriticalCommands.length > 0) {
      result.missingCriticalCommands = missedCriticalCommands;
      result.canProceed = false;
      result.warning = 'Missing critical commands must be executed before proceeding';
    }
    
    // Get pending commands from the monitor
    const pendingCommands = this.getPendingCommands();
    if (pendingCommands.length > 0) {
      // Split by criticality
      result.pendingCommands = pendingCommands;
      
      // Add high priority commands to warnings
      const highPriorityCommands = pendingCommands.filter(cmd => cmd.criticalityLevel === 'high');
      if (highPriorityCommands.length > 0) {
        result.missingHighPriorityCommands = highPriorityCommands;
      }
      
      // Add recommendations for all pending commands
      pendingCommands.forEach(cmd => {
        result.recommendations.push({
          id: cmd.id,
          command: cmd.pattern,
          reason: cmd.reason,
          criticalityLevel: cmd.criticalityLevel
        });
      });
    }
    
    // Check for task context mismatch
    const contextMismatch = this.checkContextMismatch();
    if (contextMismatch) {
      result.recommendations.push({
        id: 'context-mismatch',
        command: 'node pmc/bin/aplio-agent-cli.js check-context',
        reason: contextMismatch.reason,
        criticalityLevel: 'high'
      });
    }
    
    // Log validation result
    log('INFO', `Pre-response validation: canProceed=${result.canProceed}, criticalCommands=${result.missingCriticalCommands.length}, recommendations=${result.recommendations.length}`);
    
    return result;
  }
  
  /**
   * Get pending commands from the state
   * @returns {array} Array of pending commands
   */
  getPendingCommands() {
    return this.state.pendingCommands || [];
  }
  
  /**
   * Check for context mismatches
   * @returns {object|null} Context mismatch object or null
   */
  checkContextMismatch() {
    // If we have an active task in conversation but different task in task-context.md
    // We would need to implement a method to read the current task from task-context.md
    // For now, this is a placeholder for how it would work
    
    // For demonstration purposes, we'll check if there's a task detected in the conversation
    // but not set as the current task
    if (
      this.state.activeContext && 
      this.state.activeContext.lastDetectedTaskIds && 
      this.state.activeContext.lastDetectedTaskIds.length > 0 && 
      !this.state.currentTask
    ) {
      return {
        reason: `Detected task ${this.state.activeContext.lastDetectedTaskIds[0]} in conversation but no current task is set`,
        detectedTask: this.state.activeContext.lastDetectedTaskIds[0],
        currentTask: this.state.currentTask
      };
    }
    
    return null;
  }
}

/**
 * Post-Action Reconciliation
 * 
 * Reconciles command execution after actions are taken to ensure
 * all required commands are executed
 */
class PostActionReconciliation {
  constructor(registry, state) {
    this.registry = registry;
    this.state = state;
    
    log('INFO', 'Post-Action Reconciliation initialized');
  }
  
  /**
   * Reconcile after an action
   * @param {string} action - The action that was performed
   * @returns {object} Reconciliation results
   */
  reconcile(action) {
    // Update pending commands based on what was executed
    this.updatePendingCommands(action);
    
    // Get current reconciliation status
    const status = this.getReconciliationStatus();
    
    // Log reconciliation result
    log('INFO', `Post-action reconciliation: action="${action}", pendingCommands=${status.pendingCommandsCount}, debt=${status.commandDebtCount}`);
    
    return status;
  }
  
  /**
   * Update pending commands based on executed action
   * @param {string} action - The action that was performed
   */
  updatePendingCommands(action) {
    // Get command id if this action matches any command pattern
    const commandId = this.registry.resolveCommandId(action);
    
    if (commandId) {
      // Remove from pending commands
      this.state.pendingCommands = this.state.pendingCommands.filter(cmd => cmd.id !== commandId);
      
      log('INFO', `Removed command ${commandId} from pending commands after execution`);
    }
  }
  
  /**
   * Perform a full reconciliation of all commands
   * @returns {object} Full reconciliation status
   */
  fullReconciliation() {
    // Get all command debt
    const commandDebt = this.registry.getCommandDebt();
    
    // Create recommended commands for all debt
    const recommendations = commandDebt.map(cmd => ({
      id: cmd.id,
      command: cmd.pattern,
      reason: `Required command missed ${cmd.missedExecutions} time(s)`,
      criticalityLevel: cmd.criticalityLevel,
      missedExecutions: cmd.missedExecutions
    }));
    
    // Add to pending commands if not already there
    recommendations.forEach(rec => {
      const existingPendingCmd = this.state.pendingCommands.find(cmd => cmd.id === rec.id);
      if (!existingPendingCmd) {
        this.state.pendingCommands.push({
          id: rec.id,
          pattern: rec.command,
          reason: rec.reason,
          contextDetected: 'reconciliation',
          criticalityLevel: rec.criticalityLevel,
          missedExecutions: rec.missedExecutions,
          timestamp: new Date()
        });
      }
    });
    
    // Return reconciliation status
    const status = this.getReconciliationStatus();
    status.fullReconciliationPerformed = true;
    
    log('INFO', `Full reconciliation performed: pendingCommands=${status.pendingCommandsCount}, debt=${status.commandDebtCount}`);
    
    return status;
  }
  
  /**
   * Get current reconciliation status
   * @returns {object} Current reconciliation status
   */
  getReconciliationStatus() {
    // Get all command debt
    const commandDebt = this.registry.getCommandDebt();
    
    return {
      pendingCommands: this.state.pendingCommands,
      pendingCommandsCount: this.state.pendingCommands.length,
      commandDebt,
      commandDebtCount: commandDebt.length,
      missingCriticalCommands: commandDebt.filter(cmd => cmd.criticalityLevel === 'critical').length,
      recommendations: this.state.pendingCommands.map(cmd => ({
        id: cmd.id,
        command: cmd.pattern,
        reason: cmd.reason,
        criticalityLevel: cmd.criticalityLevel
      }))
    };
  }
}

export { PreResponseValidator, PostActionReconciliation }; 