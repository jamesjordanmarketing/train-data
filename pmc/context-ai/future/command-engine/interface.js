/**
 * User Interface
 *
 * This module generates user-facing prompts, warnings, and recommendations
 * based on the current state of the command engine.
 */

import { log } from './utils.js';

class UserInterface {
  constructor(state, config) {
    this.state = state;
    this.config = config;
    this.lastPrompts = [];
    this.lastShownWarningTime = null;
    this.warningCooldown = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    log('INFO', 'User Interface initialized');
  }
  
  /**
   * Generate user-facing prompts based on the current state
   * @returns {object} User-facing prompts and recommendations
   */
  generatePrompts() {
    const now = Date.now();
    const result = {
      warnings: [],
      recommendations: [],
      infoMessages: [],
      status: 'healthy'
    };
    
    // Check if we have pending commands
    if (this.state.pendingCommands && this.state.pendingCommands.length > 0) {
      // Sort by criticality level
      const criticalityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
      const sortedCommands = [...this.state.pendingCommands].sort((a, b) => 
        criticalityOrder[a.criticalityLevel] - criticalityOrder[b.criticalityLevel]
      );
      
      // Add critical commands to warnings
      const criticalCommands = sortedCommands.filter(cmd => cmd.criticalityLevel === 'critical');
      if (criticalCommands.length > 0) {
        result.status = 'critical';
        
        // Only show warnings if we haven't shown one recently
        if (
          !this.lastShownWarningTime || 
          now - this.lastShownWarningTime > this.warningCooldown
        ) {
          criticalCommands.forEach(cmd => {
            result.warnings.push({
              level: 'critical',
              message: `Missing critical command: ${cmd.reason}`,
              command: cmd.pattern,
              id: cmd.id
            });
          });
          
          this.lastShownWarningTime = now;
        }
      }
      
      // Add high priority commands to recommendations
      const highPriorityCommands = sortedCommands.filter(cmd => cmd.criticalityLevel === 'high');
      if (highPriorityCommands.length > 0) {
        if (result.status !== 'critical') {
          result.status = 'warning';
        }
        
        highPriorityCommands.forEach(cmd => {
          result.recommendations.push({
            level: 'high',
            message: cmd.reason,
            command: cmd.pattern,
            id: cmd.id
          });
        });
      }
      
      // Add medium and low priority commands to recommendations (limited to top 3)
      const otherCommands = sortedCommands.filter(
        cmd => cmd.criticalityLevel === 'medium' || cmd.criticalityLevel === 'low'
      ).slice(0, 3);
      
      otherCommands.forEach(cmd => {
        result.recommendations.push({
          level: cmd.criticalityLevel,
          message: cmd.reason,
          command: cmd.pattern,
          id: cmd.id
        });
      });
    }
    
    // Add task context mismatch warning if detected
    if (this.detectTaskContextMismatch()) {
      result.warnings.push({
        level: 'high',
        message: 'Task context mismatch detected. Current conversation does not match recorded task context.',
        command: 'node pmc/bin/aplio-agent-cli.js check-context',
        id: 'context-mismatch'
      });
      
      if (result.status !== 'critical') {
        result.status = 'warning';
      }
    }
    
    // Add info messages based on current state
    this.addInfoMessages(result);
    
    // Record generated prompts
    this.lastPrompts = {
      timestamp: now,
      warnings: result.warnings.length,
      recommendations: result.recommendations.length,
      infoMessages: result.infoMessages.length,
      status: result.status
    };
    
    log('INFO', `Generated user prompts: ${result.warnings.length} warnings, ${result.recommendations.length} recommendations, status ${result.status}`);
    
    return result;
  }
  
  /**
   * Generate a task status report
   * @returns {string} Formatted task status report
   */
  generateTaskStatusReport() {
    // Build a detailed status report for the current task
    let report = '## Command Engine Status Report\n\n';
    
    // Add current task information
    report += '### Current Task\n';
    report += this.state.currentTask 
      ? `Task ID: ${this.state.currentTask}\n` 
      : 'No active task detected\n';
    
    // Add pending commands summary
    const pendingCount = this.state.pendingCommands ? this.state.pendingCommands.length : 0;
    report += `\n### Command Status\n`;
    report += `- Pending Commands: ${pendingCount}\n`;
    
    // Add critical pending commands
    if (pendingCount > 0) {
      const criticalCommands = this.state.pendingCommands.filter(
        cmd => cmd.criticalityLevel === 'critical'
      );
      
      if (criticalCommands.length > 0) {
        report += `\n#### Critical Pending Commands\n`;
        criticalCommands.forEach(cmd => {
          report += `- \`${cmd.pattern}\` - ${cmd.reason}\n`;
        });
      }
    }
    
    // Add token count information
    report += `\n### Conversation Stats\n`;
    report += `- Token Count: ~${this.state.tokenCount} tokens\n`;
    
    // Add action recommendations
    report += `\n### Recommended Actions\n`;
    
    const prompts = this.generatePrompts();
    if (prompts.recommendations.length > 0) {
      prompts.recommendations.forEach(rec => {
        report += `- \`${rec.command}\` - ${rec.message}\n`;
      });
    } else {
      report += `- No immediate actions required\n`;
    }
    
    return report;
  }
  
  /**
   * Detect task context mismatch
   * @returns {boolean} Whether there's a task context mismatch
   */
  detectTaskContextMismatch() {
    // This would require checking the actual task-context.md file
    // For demonstration purposes, we'll use a simplified check
    if (
      this.state.activeContext && 
      this.state.activeContext.lastDetectedTaskIds && 
      this.state.activeContext.lastDetectedTaskIds.length > 0 && 
      this.state.currentTask &&
      !this.state.activeContext.lastDetectedTaskIds.includes(this.state.currentTask)
    ) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Add information messages based on current state
   * @param {object} result - Result object to add info messages to
   */
  addInfoMessages(result) {
    // Add token count info
    result.infoMessages.push({
      type: 'tokenCount',
      message: `Current token count: ~${this.state.tokenCount}`
    });
    
    // Add current task info
    if (this.state.currentTask) {
      result.infoMessages.push({
        type: 'currentTask',
        message: `Current active task: ${this.state.currentTask}`
      });
    }
    
    // Add context info
    const activeContexts = this.state.activeContext && this.state.activeContext.contexts
      ? this.state.activeContext.contexts
      : ['global'];
    
    result.infoMessages.push({
      type: 'activeContexts',
      message: `Active contexts: ${activeContexts.join(', ')}`
    });
  }
  
  /**
   * Format a user warning message
   * @param {string} message - Warning message content
   * @param {string} level - Warning level (critical, high, medium, low)
   * @returns {string} Formatted warning message
   */
  formatWarning(message, level = 'critical') {
    const emoji = level === 'critical' ? '⚠️' : '⚠';
    return `${emoji} **Command Engine Warning (${level})**: ${message}`;
  }
  
  /**
   * Format a user recommendation message
   * @param {object} recommendation - Recommendation object
   * @returns {string} Formatted recommendation message
   */
  formatRecommendation(recommendation) {
    let prefix = '';
    switch (recommendation.level) {
      case 'high':
        prefix = '**High Priority**';
        break;
      case 'medium':
        prefix = '**Recommended**';
        break;
      case 'low':
        prefix = '*Optional*';
        break;
      default:
        prefix = 'Recommendation';
    }
    
    return `${prefix}: ${recommendation.message}\n\`${recommendation.command}\``;
  }
  
  /**
   * Generate a summarized status message
   * @returns {string} Formatted status message
   */
  generateStatusMessage() {
    const prompts = this.generatePrompts();
    
    let message = '';
    
    if (prompts.status === 'critical') {
      message = '⚠️ **Command Engine Critical Alert**: Missing required commands!';
    } else if (prompts.status === 'warning') {
      message = '⚠ **Command Engine Warning**: Command execution check recommended';
    } else {
      message = '✅ Command Engine: All required commands executed';
    }
    
    // Add counts
    message += `\n- Critical issues: ${prompts.warnings.filter(w => w.level === 'critical').length}`;
    message += `\n- High priority recommendations: ${prompts.recommendations.filter(r => r.level === 'high').length}`;
    
    return message;
  }
}

export default UserInterface; 