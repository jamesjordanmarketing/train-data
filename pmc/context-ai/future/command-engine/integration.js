/**
 * Command Engine - PMC Integration Example
 *
 * This file demonstrates how to integrate the Command Engine with the existing
 * Project Memory Core (PMC) system. It shows how to:
 * 
 * 1. Initialize the Command Engine
 * 2. Hook it into PMC commands
 * 3. Validate command execution
 * 4. Enforce required commands
 */

import commandEngine from './index.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { log } from './utils.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert exec to promise-based
const execAsync = promisify(exec);

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize the Command Engine and integrate with PMC
 */
async function initializeIntegration() {
  try {
    // Initialize Command Engine
    await commandEngine.initialize();
    
    log('INFO', 'Command Engine initialized for PMC integration');
    
    return {
      success: true,
      message: 'Command Engine integrated successfully'
    };
  } catch (error) {
    log('ERROR', `Failed to initialize Command Engine integration: ${error.message}`);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Enhanced executeCommand function that tracks command execution
 * Can replace or wrap the existing command execution in PMC
 */
async function executeCommand(command, options = {}) {
  try {
    // Log the command being executed
    log('INFO', `Executing command: ${command}`);
    
    // Register the command with Command Engine
    commandEngine.registerCommandExecution(command, {
      timestamp: new Date(),
      ...options
    });
    
    // Execute the command
    const { stdout, stderr } = await execAsync(command);
    
    // Return result
    return {
      success: true,
      stdout,
      stderr
    };
  } catch (error) {
    log('ERROR', `Command execution failed: ${error.message}`);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Pre-response hook to validate required commands
 * This would be called before the AI assistant responds to the user
 */
function preResponseHook(message) {
  // Process the message to detect context changes
  commandEngine.processMessage(message, 'assistant');
  
  // Validate required commands
  const validation = commandEngine.validateBeforeResponse();
  
  if (!validation.canProceed) {
    // If we can't proceed, generate warning message
    return {
      canProceed: false,
      warnings: validation.missingCriticalCommands.map(cmd => 
        `⚠️ Critical command required: ${cmd.pattern}`
      ),
      commandsToExecute: validation.missingCriticalCommands.map(cmd => cmd.pattern)
    };
  }
  
  if (validation.recommendations.length > 0) {
    // If we have recommendations, include them
    return {
      canProceed: true,
      warnings: [],
      recommendations: validation.recommendations.map(rec => 
        `Recommended command: ${rec.command} (${rec.reason})`
      )
    };
  }
  
  return {
    canProceed: true,
    warnings: [],
    recommendations: []
  };
}

/**
 * Post-command hook to reconcile after commands are executed
 * This would be called after a PMC command is executed
 */
function postCommandHook(command) {
  // Reconcile after command execution
  const reconciliation = commandEngine.reconcileAfterAction(command);
  
  // If we have pending commands, return them
  if (reconciliation.pendingCommandsCount > 0) {
    return {
      pendingCommands: reconciliation.recommendations.map(rec => rec.command),
      criticalCount: reconciliation.missingCriticalCommands
    };
  }
  
  return {
    pendingCommands: [],
    criticalCount: 0
  };
}

/**
 * Process user message to track context
 */
function processUserMessage(message) {
  // Process the message to detect context changes
  commandEngine.processMessage(message, 'user');
  
  // Run checkpoint if token count reaches threshold
  if (commandEngine.state.tokenCount - commandEngine.state.lastCheckpoint >= commandEngine.config.checkpointInterval) {
    commandEngine.runCheckpoint();
  }
}

/**
 * Integrate with aplio-agent-cli.js commands
 * This shows how to modify the existing CLI to track commands
 */
function integratePmcCli() {
  // This is a demonstration of how to modify the PMC CLI
  // In a real implementation, you would modify the actual CLI code
  
  console.log(`
=== COMMAND ENGINE INTEGRATION ===

To integrate the Command Engine with PMC CLI, modify bin/aplio-agent-cli.js:

1. Import the Command Engine:
   import commandEngine from '../command-engine/index.js';

2. Initialize it at startup:
   await commandEngine.initialize();

3. Track command execution by adding to each command handler:
   commandEngine.registerCommandExecution(fullCommandString, { 
     taskId, 
     context: 'someContext' 
   });

4. Add validation before responding:
   const validation = commandEngine.validateBeforeResponse();
   if (!validation.canProceed) {
     console.warn(validation.warning);
     // Prompt to execute missing commands
   }

5. Run checkpoints at regular intervals:
   if (tokenCount - lastCheckpoint >= 500) {
     commandEngine.runCheckpoint();
     lastCheckpoint = tokenCount;
   }
  `);
}

/**
 * Get required commands for the current context
 */
function getRequiredCommands() {
  // Get the current state
  const state = commandEngine.getState();
  
  // Run validation
  const validation = commandEngine.validateBeforeResponse();
  
  // Get pending commands
  const pendingCommands = state.pendingCommands || [];
  
  return {
    criticalCommands: pendingCommands
      .filter(cmd => cmd.criticalityLevel === 'critical')
      .map(cmd => cmd.pattern),
    highPriorityCommands: pendingCommands
      .filter(cmd => cmd.criticalityLevel === 'high')
      .map(cmd => cmd.pattern),
    otherCommands: pendingCommands
      .filter(cmd => cmd.criticalityLevel !== 'critical' && cmd.criticalityLevel !== 'high')
      .map(cmd => cmd.pattern),
    canProceed: validation.canProceed
  };
}

/**
 * Create CLI wrapper for enhanced PMC commands
 */
function createCliWrapper() {
  // This is a demonstration of a CLI wrapper
  // In a real implementation, you would modify the actual CLI code
  
  console.log(`
=== CLI WRAPPER EXAMPLE ===

Create a CLI wrapper at bin/enhanced-cli.js:

#!/usr/bin/env node

import commandEngine from '../command-engine/index.js';
import { spawnSync } from 'child_process';
import path from 'path';

// Initialize Command Engine
await commandEngine.initialize();

// Get original command
const args = process.argv.slice(2);
const command = args.join(' ');

// Track the command
commandEngine.registerCommandExecution(\`node pmc/bin/aplio-agent-cli.js \${command}\`);

// Execute the original command
const result = spawnSync('node', [
  path.join(process.cwd(), 'bin/aplio-agent-cli.js'),
  ...args
], { stdio: 'inherit' });

// Run post-command reconciliation
const reconciliation = commandEngine.reconcileAfterAction(command);

// Check for pending commands
if (reconciliation.pendingCommandsCount > 0) {
  console.log('\\nPending commands detected:');
  reconciliation.recommendations.forEach(rec => {
    console.log(\`- \${rec.command}\`);
  });
}

process.exit(result.status);
  `);
}

// Export integration functions
export {
  initializeIntegration,
  executeCommand,
  preResponseHook,
  postCommandHook,
  processUserMessage,
  integratePmcCli,
  getRequiredCommands,
  createCliWrapper
};

// If this file is run directly, show integration guide
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('\n=== Command Engine PMC Integration Guide ===\n');
  console.log('This file demonstrates how to integrate the Command Engine with PMC.\n');
  console.log('To use this integration:');
  console.log('1. Import functions from this file in your PMC code');
  console.log('2. Call initializeIntegration() when your app starts');
  console.log('3. Use executeCommand() to run PMC commands');
  console.log('4. Call preResponseHook() before responding to users');
  console.log('5. Call postCommandHook() after executing commands');
  console.log('6. Process user messages with processUserMessage()');
  console.log('\nFor more details, see the implementation in this file.\n');
  
  // Call integration examples
  integratePmcCli();
  createCliWrapper();
} 