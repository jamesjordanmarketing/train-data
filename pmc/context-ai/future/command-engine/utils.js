/**
 * Command Engine Utilities
 *
 * This module contains utility functions used by the command engine.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Log a message to the command engine log file
 * @param {string} level - Log level (INFO, WARN, ERROR, DEBUG)
 * @param {string} message - Log message
 */
function log(level, message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  
  // Log to console
  console.log(`[CommandEngine] ${level}: ${message}`);
  
  try {
    // Create logs directory if it doesn't exist
    const logDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Append to log file
    const logFile = path.join(logDir, 'command-engine.log');
    fs.appendFileSync(logFile, logMessage);
  } catch (error) {
    console.error(`Failed to write to log file: ${error.message}`);
  }
}

/**
 * Extract commands from a system prompt
 * @param {string} systemPrompt - System prompt text (optional)
 * @returns {array} Array of command objects
 */
function extractCommandsFromSystemPrompt(systemPrompt = null) {
  // Define default commands
  const defaultCommands = [];
  
  if (!systemPrompt) {
    // If no system prompt provided, return default commands
    return defaultCommands;
  }
  
  try {
    // Extract command sections from system prompt using regex
    const commandSectionPattern = /###([^#]+)YOU MUST([^#]+)```([^`]+)```/g;
    let commandMatch;
    const commands = [];
    
    while ((commandMatch = commandSectionPattern.exec(systemPrompt)) !== null) {
      const sectionTitle = commandMatch[1].trim();
      const commandDescription = commandMatch[2].trim();
      const commandPattern = commandMatch[3].trim();
      
      // Skip sections that don't contain commands
      if (!commandPattern.startsWith('node')) {
        continue;
      }
      
      // Determine trigger type and value based on section title
      let triggerType = 'event';
      let triggerValue = 'manual';
      let contexts = ['global'];
      let criticalityLevel = 'medium';
      let required = true;
      
      // Extract tokens
      if (sectionTitle.includes('EVERY 500 TOKENS')) {
        triggerType = 'tokenCount';
        triggerValue = 500;
        criticalityLevel = 'high';
      } else if (sectionTitle.includes('EVERY 2000 TOKENS')) {
        triggerType = 'tokenCount';
        triggerValue = 2000;
        criticalityLevel = 'high';
      } else if (sectionTitle.includes('STARTING A TASK')) {
        triggerType = 'event';
        triggerValue = 'taskStart';
        contexts = ['task_transition'];
        criticalityLevel = 'critical';
      } else if (sectionTitle.includes('COMPLETING A TASK')) {
        triggerType = 'event';
        triggerValue = 'taskComplete';
        contexts = ['task_completion'];
        criticalityLevel = 'critical';
      } else if (sectionTitle.includes('READING ANY FILE')) {
        triggerType = 'event';
        triggerValue = 'fileRead';
        contexts = ['file_operations'];
        criticalityLevel = 'medium';
      } else if (sectionTitle.includes('FILE CREATION')) {
        triggerType = 'event';
        triggerValue = 'fileCreated';
        contexts = ['file_operations'];
        criticalityLevel = 'high';
      } else if (sectionTitle.includes('FILE MODIFICATION')) {
        triggerType = 'event';
        triggerValue = 'fileModified';
        contexts = ['file_operations'];
        criticalityLevel = 'high';
      }
      
      // Extract command parameters by looking for [PARAM_NAME] in the pattern
      const parameterPattern = /\[([A-Z_]+)\]/g;
      const parameters = [];
      let paramMatch;
      
      while ((paramMatch = parameterPattern.exec(commandPattern)) !== null) {
        if (!parameters.includes(paramMatch[1])) {
          parameters.push(paramMatch[1]);
        }
      }
      
      // Generate command ID from the command pattern
      const commandParts = commandPattern.split(' ');
      let id = commandParts[commandParts.length - 1].replace(/[^a-zA-Z0-9-]/g, '');
      if (id.length === 0) {
        id = commandParts[commandParts.length - 2].replace(/[^a-zA-Z0-9-]/g, '');
      }
      
      // Create command object
      commands.push({
        id,
        pattern: commandPattern,
        description: commandDescription,
        triggerType,
        triggerValue,
        contexts,
        criticalityLevel,
        required,
        parameters
      });
    }
    
    // Return extracted commands or default if none found
    return commands.length > 0 ? commands : defaultCommands;
  } catch (error) {
    log('ERROR', `Error extracting commands from system prompt: ${error.message}`);
    return defaultCommands;
  }
}

/**
 * Parse a command string to extract parameters
 * @param {string} command - Command string
 * @param {string} pattern - Command pattern
 * @returns {object} Extracted parameters
 */
function parseCommandParameters(command, pattern) {
  // Convert pattern to regex by escaping special chars and capturing parameter values
  const patternRegex = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
    .replace(/\[([A-Z_]+)\]/g, '([^"\\s]+|"[^"]*")'); // Replace [PARAM_NAME] with capture group
  
  const regex = new RegExp(`^${patternRegex}$`);
  const match = command.match(regex);
  
  if (!match) {
    return null;
  }
  
  // Extract parameter names from the pattern
  const paramNames = [];
  const paramPattern = /\[([A-Z_]+)\]/g;
  let paramMatch;
  
  while ((paramMatch = paramPattern.exec(pattern)) !== null) {
    paramNames.push(paramMatch[1]);
  }
  
  // Create parameter object
  const params = {};
  for (let i = 0; i < paramNames.length; i++) {
    const value = match[i + 1];
    params[paramNames[i]] = value.startsWith('"') && value.endsWith('"') 
      ? value.substring(1, value.length - 1) 
      : value;
  }
  
  return params;
}

/**
 * Format a timestamp in a human-readable format
 * @param {Date} date - Date object (default: current date)
 * @returns {string} Formatted timestamp
 */
function formatTimestamp(date = new Date()) {
  return date.toISOString();
}

/**
 * Estimate token count in a text
 * @param {string} text - Text to estimate tokens for
 * @returns {number} Estimated token count
 */
function estimateTokenCount(text) {
  if (!text) return 0;
  // Simple estimation: ~1 token per 4 characters
  return Math.ceil(text.length / 4);
}

/**
 * Read the current task from task-context.md
 * @returns {object} Current task information
 */
function readCurrentTaskFromContext() {
  try {
    const taskContextPath = path.join(process.cwd(), 'core', 'task-context.md');
    if (!fs.existsSync(taskContextPath)) {
      return {
        success: false,
        error: 'Task context file not found',
        taskId: null
      };
    }
    
    const content = fs.readFileSync(taskContextPath, 'utf8');
    
    // Extract task ID
    const taskIdMatch = content.match(/- Task ID: (T-[\d\.]+)/);
    const taskId = taskIdMatch ? taskIdMatch[1] : null;
    
    // Extract current element ID
    const elementIdMatch = content.match(/- Element ID: (T-[\d\.]+:ELE-\d+)/);
    const elementId = elementIdMatch ? elementIdMatch[1] : null;
    
    // Extract confidence
    const confidenceMatch = content.match(/- Confidence: (\d+)\/10/);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : null;
    
    return {
      success: true,
      taskId,
      elementId,
      confidence
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      taskId: null
    };
  }
}

/**
 * Get current progress from progress.md
 * @returns {object} Current progress information
 */
function readCurrentProgress() {
  try {
    const progressPath = path.join(process.cwd(), 'core', 'progress.md');
    if (!fs.existsSync(progressPath)) {
      return {
        success: false,
        error: 'Progress file not found',
        currentFocus: null
      };
    }
    
    const content = fs.readFileSync(progressPath, 'utf8');
    
    // Extract current focus section
    const currentFocusMatch = content.match(/## Current Focus\n([\s\S]*?)(?=\n## |$)/);
    const currentFocus = currentFocusMatch ? currentFocusMatch[1].trim() : null;
    
    // Extract task ID and element ID from current focus
    let taskId = null;
    let elementId = null;
    let status = null;
    
    if (currentFocus) {
      const taskMatch = currentFocus.match(/Task: (T-[\d\.]+)/);
      taskId = taskMatch ? taskMatch[1] : null;
      
      const elementMatch = currentFocus.match(/Element: (T-[\d\.]+:ELE-\d+)/);
      elementId = elementMatch ? elementMatch[1] : null;
      
      const statusMatch = currentFocus.match(/Status: ([^\n]+)/);
      status = statusMatch ? statusMatch[1] : null;
    }
    
    return {
      success: true,
      currentFocus,
      taskId,
      elementId,
      status
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      currentFocus: null
    };
  }
}

export {
  log,
  extractCommandsFromSystemPrompt,
  parseCommandParameters,
  formatTimestamp,
  estimateTokenCount,
  readCurrentTaskFromContext,
  readCurrentProgress
}; 