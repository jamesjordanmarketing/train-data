#!/usr/bin/env node

/**
 * Command Engine CLI
 *
 * A command-line tool for interacting with the Command Engine.
 */

import commandEngine from './index.js';
import { log } from './utils.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0]?.toLowerCase();

// Initialize engine
async function initEngine() {
  try {
    await commandEngine.initialize();
    return true;
  } catch (error) {
    console.error(`Failed to initialize Command Engine: ${error.message}`);
    return false;
  }
}

// Print help
function printHelp() {
  console.log(`
Command Engine CLI - A tool for validating PMC command execution

Usage:
  node cli.js <command> [options]

Commands:
  status              Show current status of the Command Engine
  validate            Validate the current state
  register <command>  Register a command execution
  checkpoint          Run a validation checkpoint
  reconcile           Run a full reconciliation
  history             Show command execution history
  simulate <scenario> Simulate a conversation scenario
  clear               Clear all pending commands
  help                Show this help message

Examples:
  node cli.js status
  node cli.js validate
  node cli.js register "node pmc/bin/aplio-agent-cli.js start-task \\"T-1.1.2\\""
  node cli.js checkpoint
  node cli.js simulate task-transition
  `);
}

// Show status
function showStatus() {
  const state = commandEngine.getState();
  const pendingCommands = state.pendingCommands || [];
  
  console.log('\n=== Command Engine Status ===\n');
  console.log(`Current Task: ${state.currentTask || 'None'}`);
  console.log(`Token Count: ~${state.tokenCount}`);
  console.log(`Pending Commands: ${pendingCommands.length}`);
  
  if (pendingCommands.length > 0) {
    console.log('\nPending Commands:');
    pendingCommands.forEach((cmd, index) => {
      console.log(`${index + 1}. [${cmd.criticalityLevel.toUpperCase()}] ${cmd.pattern}`);
      console.log(`   Reason: ${cmd.reason}`);
    });
  }
  
  // Show active contexts
  console.log('\nActive Contexts:');
  if (state.activeContext && state.activeContext.contexts) {
    state.activeContext.contexts.forEach(ctx => {
      console.log(`- ${ctx}`);
    });
  } else {
    console.log('- global');
  }
  
  console.log('\n');
}

// Run validation
function runValidation() {
  const validation = commandEngine.validateBeforeResponse();
  
  console.log('\n=== Validation Results ===\n');
  console.log(`Can Proceed: ${validation.canProceed ? 'YES' : 'NO'}`);
  
  if (validation.warning) {
    console.log(`Warning: ${validation.warning}`);
  }
  
  if (validation.missingCriticalCommands.length > 0) {
    console.log('\nMissing Critical Commands:');
    validation.missingCriticalCommands.forEach((cmd, index) => {
      console.log(`${index + 1}. ${cmd.pattern}`);
      console.log(`   Reason: ${cmd.reason || 'Required command'}`);
    });
  }
  
  if (validation.recommendations.length > 0) {
    console.log('\nRecommendations:');
    validation.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. [${rec.criticalityLevel.toUpperCase()}] ${rec.command}`);
      console.log(`   Reason: ${rec.reason}`);
    });
  }
  
  console.log('\n');
}

// Register command execution
function registerCommand(commandString) {
  if (!commandString) {
    console.error('Error: No command string provided');
    return;
  }
  
  const result = commandEngine.registerCommandExecution(commandString);
  
  if (result) {
    console.log(`Successfully registered command: ${commandString}`);
  } else {
    console.error(`Failed to register command: ${commandString}`);
  }
}

// Run checkpoint
function runCheckpoint() {
  const result = commandEngine.runCheckpoint();
  
  console.log('\n=== Checkpoint Results ===\n');
  console.log(`Status: ${result.status.toUpperCase()}`);
  console.log(`Token Count: ~${result.tokenCount}`);
  console.log(`Missed Critical Commands: ${result.missedCriticalCommandsCount}`);
  console.log(`All Missed Commands: ${result.allMissedCommandsCount}`);
  console.log(`Action Plan Count: ${result.actionPlanCount}`);
  
  if (result.missedCriticalCommands.length > 0) {
    console.log('\nMissed Critical Commands:');
    result.missedCriticalCommands.forEach((cmd, index) => {
      console.log(`${index + 1}. ${cmd.pattern}`);
      console.log(`   Missed Executions: ${cmd.missedExecutions}`);
    });
  }
  
  if (result.actionPlan.length > 0) {
    console.log('\nAction Plan:');
    result.actionPlan.forEach((action, index) => {
      console.log(`${index + 1}. [${action.criticalityLevel.toUpperCase()}] ${action.pattern}`);
      console.log(`   Reason: ${action.reason}`);
    });
  }
  
  console.log('\n');
}

// Run reconciliation
function runReconciliation() {
  const result = commandEngine.runReconciliation();
  
  console.log('\n=== Reconciliation Results ===\n');
  console.log(`Pending Commands: ${result.pendingCommandsCount}`);
  console.log(`Command Debt: ${result.commandDebtCount}`);
  console.log(`Missing Critical Commands: ${result.missingCriticalCommands}`);
  
  if (result.recommendations.length > 0) {
    console.log('\nRecommendations:');
    result.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. [${rec.criticalityLevel.toUpperCase()}] ${rec.command}`);
      console.log(`   Reason: ${rec.reason}`);
    });
  }
  
  console.log('\n');
}

// Show command history
function showHistory() {
  // This requires extending the registry to expose history
  console.log('\n=== Command Execution History ===\n');
  console.log('Command history feature not implemented yet');
  console.log('\n');
}

// Clear pending commands
function clearPending() {
  commandEngine.state.pendingCommands = [];
  console.log('Cleared all pending commands');
}

// Simulate a scenario
function simulateScenario(scenario) {
  if (!scenario) {
    console.error('Error: No scenario provided');
    return;
  }
  
  console.log(`Simulating scenario: ${scenario}`);
  
  switch (scenario.toLowerCase()) {
    case 'task-transition':
      simulateTaskTransition();
      break;
    case 'file-operation':
      simulateFileOperation();
      break;
    case 'element-status':
      simulateElementStatus();
      break;
    case 'token-count':
      simulateTokenCount();
      break;
    default:
      console.error(`Unknown scenario: ${scenario}`);
      return;
  }
}

// Simulate task transition
function simulateTaskTransition() {
  const oldTaskId = commandEngine.state.currentTask || 'T-1.1.1';
  const newTaskId = oldTaskId === 'T-1.1.1' ? 'T-1.1.2' : 'T-1.1.1';
  
  console.log(`Simulating transition from ${oldTaskId} to ${newTaskId}`);
  
  const message = `I'm now starting work on task ${newTaskId} instead of ${oldTaskId}`;
  commandEngine.processMessage(message, 'user');
  
  console.log('Processed message. Running validation:');
  runValidation();
}

// Simulate file operation
function simulateFileOperation() {
  const filePath = 'src/components/Example.js';
  
  console.log(`Simulating file modification on ${filePath}`);
  
  const message = `I just modified the file at ${filePath} to add new functionality`;
  commandEngine.processMessage(message, 'user');
  
  console.log('Processed message. Running validation:');
  runValidation();
}

// Simulate element status change
function simulateElementStatus() {
  const elementId = commandEngine.state.currentTask 
    ? `${commandEngine.state.currentTask}:ELE-1` 
    : 'T-1.1.1:ELE-1';
  
  console.log(`Simulating element status change for ${elementId}`);
  
  const message = `I've completed the implementation of element ${elementId} and all tests are passing`;
  commandEngine.processMessage(message, 'user');
  
  console.log('Processed message. Running validation:');
  runValidation();
}

// Simulate token count threshold
function simulateTokenCount() {
  console.log('Simulating token count threshold');
  
  // Add 500 tokens to reach the first threshold
  commandEngine.state.tokenCount += 500;
  
  console.log(`Token count increased to ~${commandEngine.state.tokenCount}`);
  console.log('Running validation:');
  runValidation();
}

// Main function
async function main() {
  if (!command || command === 'help') {
    printHelp();
    return;
  }
  
  const initialized = await initEngine();
  if (!initialized) {
    return;
  }
  
  switch (command) {
    case 'status':
      showStatus();
      break;
    case 'validate':
      runValidation();
      break;
    case 'register':
      registerCommand(args.slice(1).join(' '));
      break;
    case 'checkpoint':
      runCheckpoint();
      break;
    case 'reconcile':
      runReconciliation();
      break;
    case 'history':
      showHistory();
      break;
    case 'simulate':
      simulateScenario(args[1]);
      break;
    case 'clear':
      clearPending();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      break;
  }
}

// Run main function
main().catch(error => {
  console.error(`Command Engine CLI Error: ${error.message}`);
  process.exit(1);
}); 