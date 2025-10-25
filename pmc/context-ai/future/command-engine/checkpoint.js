/**
 * Checkpoint Mechanism
 *
 * This module manages scheduled checkpoints to validate command execution
 * and reconcile missed commands at regular intervals.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { log } from './utils.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CheckpointMechanism {
  constructor(registry, state, config) {
    this.registry = registry;
    this.state = state;
    this.config = config;
    this.checkpointHistory = [];
    this.lastCheckpointTime = Date.now();
    
    // Create checkpoint log directory if it doesn't exist
    const checkpointDir = path.join(__dirname, 'logs/checkpoints');
    if (!fs.existsSync(checkpointDir)) {
      fs.mkdirSync(checkpointDir, { recursive: true });
    }
    
    log('INFO', 'Checkpoint Mechanism initialized');
  }
  
  /**
   * Run a checkpoint to validate the overall state
   * @returns {object} Checkpoint results
   */
  runCheckpoint() {
    const now = Date.now();
    const elapsed = now - this.lastCheckpointTime;
    this.lastCheckpointTime = now;
    
    // Get missed critical commands
    const missedCriticalCommands = this.registry.getMissedCriticalCommands();
    
    // Get token-count based commands that are due
    const tokenCountCommands = this.registry.getCommandsForTokenCount(this.state.tokenCount);
    
    // Get active contexts
    const activeContexts = this.getActiveContexts();
    
    // Get all missed commands
    const allMissedCommands = this.registry.getCommandDebt();
    
    // Create action plan for missed commands
    const actionPlan = this.createActionPlan(allMissedCommands, tokenCountCommands);
    
    // Create checkpoint record
    const checkpoint = {
      timestamp: new Date(),
      tokenCount: this.state.tokenCount,
      elapsed: elapsed,
      activeContexts,
      currentTask: this.state.currentTask,
      missedCriticalCommandsCount: missedCriticalCommands.length,
      allMissedCommandsCount: allMissedCommands.length,
      actionPlanCount: actionPlan.length,
      status: missedCriticalCommands.length > 0 ? 'critical' : 
              allMissedCommands.length > 0 ? 'warning' : 'healthy'
    };
    
    // Add to history
    this.checkpointHistory.push(checkpoint);
    
    // Keep only the most recent 10 checkpoints
    if (this.checkpointHistory.length > 10) {
      this.checkpointHistory.shift();
    }
    
    // Log checkpoint result
    this.logCheckpoint(checkpoint, allMissedCommands, actionPlan);
    
    // Add checkpoint-specific commands to pending commands
    this.addCheckpointCommands(actionPlan);
    
    // Return checkpoint information
    return {
      ...checkpoint,
      missedCriticalCommands,
      allMissedCommands,
      actionPlan,
      history: this.checkpointHistory
    };
  }
  
  /**
   * Get active contexts from the state
   * @returns {array} Array of active contexts
   */
  getActiveContexts() {
    let activeContexts = ['global'];
    
    if (this.state.activeContext && this.state.activeContext.contexts) {
      activeContexts = [...new Set([...activeContexts, ...this.state.activeContext.contexts])];
    }
    
    return activeContexts;
  }
  
  /**
   * Create an action plan for missed commands
   * @param {array} missedCommands - Array of missed commands
   * @param {array} tokenCountCommands - Array of token-count based commands
   * @returns {array} Action plan with prioritized commands
   */
  createActionPlan(missedCommands, tokenCountCommands) {
    const criticalityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
    
    // Combine missed commands and token count commands
    const allCommands = [
      ...missedCommands.map(cmd => ({
        ...cmd,
        reason: `Command missed ${cmd.missedExecutions} time(s)`,
        source: 'missed'
      })),
      ...tokenCountCommands.map(cmd => ({
        id: cmd.id,
        description: cmd.description,
        pattern: cmd.pattern,
        criticalityLevel: cmd.criticalityLevel,
        reason: `Token count reached ${this.state.tokenCount} tokens (requires execution every ${cmd.triggerValue} tokens)`,
        source: 'tokenCount',
        missedExecutions: cmd.expectedExecutions - cmd.actualExecutions
      }))
    ];
    
    // De-duplicate by command ID
    const uniqueCommands = [];
    const seenIds = new Set();
    
    allCommands.forEach(cmd => {
      if (!seenIds.has(cmd.id)) {
        seenIds.add(cmd.id);
        uniqueCommands.push(cmd);
      }
    });
    
    // Sort by criticality level and then by missed executions
    uniqueCommands.sort((a, b) => {
      // First sort by criticality level
      const criticalityDiff = criticalityOrder[a.criticalityLevel] - criticalityOrder[b.criticalityLevel];
      if (criticalityDiff !== 0) {
        return criticalityDiff;
      }
      
      // Then sort by number of missed executions
      return b.missedExecutions - a.missedExecutions;
    });
    
    return uniqueCommands;
  }
  
  /**
   * Log the checkpoint to file
   * @param {object} checkpoint - Checkpoint object
   * @param {array} missedCommands - Array of missed commands
   * @param {array} actionPlan - Action plan with prioritized commands
   */
  logCheckpoint(checkpoint, missedCommands, actionPlan) {
    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const logFilePath = path.join(__dirname, `logs/checkpoints/checkpoint-${timestamp}.json`);
      
      const logData = {
        checkpoint,
        missedCommands,
        actionPlan
      };
      
      fs.writeFileSync(logFilePath, JSON.stringify(logData, null, 2));
      log('INFO', `Checkpoint logged to ${logFilePath}`);
    } catch (error) {
      log('ERROR', `Failed to log checkpoint: ${error.message}`);
    }
  }
  
  /**
   * Add checkpoint-specific commands to pending commands
   * @param {array} actionPlan - Action plan with prioritized commands
   */
  addCheckpointCommands(actionPlan) {
    // Add the most critical commands to pending commands
    const criticalCommands = actionPlan.filter(cmd => cmd.criticalityLevel === 'critical');
    const highPriorityCommands = actionPlan.filter(cmd => cmd.criticalityLevel === 'high');
    
    // Always add critical commands
    criticalCommands.forEach(cmd => {
      const existingIndex = this.state.pendingCommands.findIndex(pc => pc.id === cmd.id);
      if (existingIndex !== -1) {
        // Update existing command
        this.state.pendingCommands[existingIndex] = {
          ...this.state.pendingCommands[existingIndex],
          pattern: cmd.pattern,
          reason: cmd.reason,
          criticalityLevel: cmd.criticalityLevel,
          missedExecutions: cmd.missedExecutions,
          updatedAt: new Date()
        };
      } else {
        // Add new command
        this.state.pendingCommands.push({
          id: cmd.id,
          pattern: cmd.pattern,
          reason: cmd.reason,
          contextDetected: 'checkpoint',
          criticalityLevel: cmd.criticalityLevel,
          missedExecutions: cmd.missedExecutions,
          timestamp: new Date()
        });
      }
    });
    
    // Add high priority commands if we don't have too many pending already
    if (this.state.pendingCommands.length < 5) {
      highPriorityCommands.forEach(cmd => {
        const existingIndex = this.state.pendingCommands.findIndex(pc => pc.id === cmd.id);
        if (existingIndex === -1) {
          this.state.pendingCommands.push({
            id: cmd.id,
            pattern: cmd.pattern,
            reason: cmd.reason,
            contextDetected: 'checkpoint',
            criticalityLevel: cmd.criticalityLevel,
            missedExecutions: cmd.missedExecutions,
            timestamp: new Date()
          });
        }
      });
    }
    
    log('INFO', `Added ${criticalCommands.length} critical and ${
      this.state.pendingCommands.length - criticalCommands.length
    } high priority commands to pending commands`);
  }
  
  /**
   * Get checkpoint statistics
   * @returns {object} Checkpoint statistics
   */
  getCheckpointStats() {
    if (this.checkpointHistory.length === 0) {
      return {
        totalCheckpoints: 0,
        averageMissedCriticalCommands: 0,
        averageMissedCommands: 0,
        statusDistribution: {
          critical: 0,
          warning: 0,
          healthy: 0
        }
      };
    }
    
    // Calculate statistics
    const totalCheckpoints = this.checkpointHistory.length;
    const totalMissedCriticalCommands = this.checkpointHistory.reduce(
      (sum, cp) => sum + cp.missedCriticalCommandsCount, 0
    );
    const totalMissedCommands = this.checkpointHistory.reduce(
      (sum, cp) => sum + cp.allMissedCommandsCount, 0
    );
    
    // Status distribution
    const statusCounts = {
      critical: 0,
      warning: 0,
      healthy: 0
    };
    
    this.checkpointHistory.forEach(cp => {
      statusCounts[cp.status]++;
    });
    
    return {
      totalCheckpoints,
      averageMissedCriticalCommands: totalMissedCriticalCommands / totalCheckpoints,
      averageMissedCommands: totalMissedCommands / totalCheckpoints,
      statusDistribution: statusCounts
    };
  }
  
  /**
   * Get health score based on checkpoint history
   * @returns {number} Health score (0-100)
   */
  getHealthScore() {
    const stats = this.getCheckpointStats();
    
    if (stats.totalCheckpoints === 0) {
      return 100; // Assume healthy if no checkpoints
    }
    
    // Calculate health score based on status distribution
    const { critical, warning, healthy } = stats.statusDistribution;
    const criticalWeight = 0;
    const warningWeight = 50;
    const healthyWeight = 100;
    
    const totalWeight = critical * criticalWeight + warning * warningWeight + healthy * healthyWeight;
    const healthScore = Math.round(totalWeight / stats.totalCheckpoints);
    
    return healthScore;
  }
}

export default CheckpointMechanism; 