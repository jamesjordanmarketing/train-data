#!/usr/bin/env node
// This is an ES module
// Import the context manager and path utilities
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Additional debug information to help diagnose path issues
console.log(`CLI Directory: ${__dirname}`);

// Import the context managers using relative paths
// The relative path is more reliable than trying to construct absolute URLs
import contextManager from '../system/management/context-manager.js';
import contextManagerV2 from '../system/management/context-manager-v2.js';
import contextManagerV3 from '../system/management/context-manager-v3.js';
import { updateTestApproach } from '../system/management/context-manager-v3.js';

// Import task and test concatenation scripts
import { generateConsolidatedTaskFile } from '../product/_tools/utility-06-concatenate-tasks.js';
import { generateConsolidatedTestMappingFile } from '../product/_tools/utility-07-concatenate-task-tests.js';

// Create a dummy token counter in case the real one isn't available
const dummyTokenCounter = {
  executeTokenCounter: async (options = {}) => {
    return {
      success: true,
      model: 'disabled',
      counts: {
        input: { iteration: 0, cumulative: 0 },
        output: { iteration: 0, cumulative: 0 },
        total: { iteration: 0, cumulative: 0 }
      },
      contextCheck: {
        status: 'normal',
        message: '',
        contextCheckRequired: false
      },
      message: 'Token counting is disabled in this build'
    };
  },
  updateTokenCount: () => 0,
  resetTokenCount: () => {},
  getCurrentTokenCount: () => 0
};

// Try to import token counter, but use dummy if not available
let tokenCounter;
try {
  tokenCounter = await import('../system/management/token-counter.js').then(module => module.default);
  console.log('Token counter loaded successfully');
} catch (error) {
  console.log('Token counter module not available, using dummy implementation');
  tokenCounter = dummyTokenCounter;
}

/**
 * Logs a micro-action with optional confidence and involved files
 * @param {string} action - Description of the action
 * @param {number} confidence - Confidence level (1-10)
 * @param  {...string} files - Files involved in the action
 * @returns {Promise<void>}
 */
async function logAction(action, confidence, ...files) {
  if (!action) {
    console.log('Action description is required.');
    return;
  }
  
  const confidenceValue = confidence ? parseInt(confidence) : 8;
  if (isNaN(confidenceValue) || confidenceValue < 1 || confidenceValue > 10) {
    console.log('Confidence must be a number between 1 and 10, defaulting to 8.');
  }
  
  console.log(`Logging action: ${action}`);
  
  const result = contextManager.logMicroAction(action, confidenceValue, ...files);
  
  if (result) {
    console.log('Action logged successfully.');
  } else {
    console.error('Failed to log action.');
  }
}

/**
 * Updates the confidence level in the Task Information section of active-task.md
 * @param {string} confidence - The new confidence level (1-10)
 * @returns {Promise<void>}
 */
async function updateConfidence(confidence) {
  if (!confidence) {
    console.log('Confidence value is required.');
    return;
  }
  
  const confidenceValue = parseInt(confidence);
  if (isNaN(confidenceValue) || confidenceValue < 1 || confidenceValue > 10) {
    console.error('Confidence must be a number between 1 and 10.');
    return;
  }
  
  console.log(`Updating confidence to: ${confidenceValue}/10`);
  
  try {
    const result = await contextManager.updateConfidence(confidenceValue);
    
    if (result) {
      console.log('Confidence updated successfully.');
    } else {
      console.error('Failed to update confidence.');
    }
  } catch (error) {
    console.error(`Error updating confidence: ${error.message}`);
  }
}

/**
 * Adds a new file entry to the Expected Implementation Files section in active-task.md
 * @param {string} filePath - The path of the file to add
 * @param {boolean} isPrimary - Whether this is a primary implementation file
 * @returns {Promise<void>}
 */
async function addImplementationFile(filePath, isPrimary) {
  if (!filePath) {
    console.log('File path is required.');
    return;
  }

  console.log(`Adding implementation file: ${filePath}${isPrimary ? ' (Primary)' : ''}`);

  try {
    const result = await contextManager.addImplementationFile(filePath, isPrimary);
    
    if (result) {
      console.log('Implementation file added successfully.');
    } else {
      console.error('Failed to add implementation file.');
    }
  } catch (error) {
    console.error(`Error adding implementation file: ${error.message}`);
  }
}

/**
 * Logs an error with optional severity
 * @param {string} errorDescription - Description of the error
 * @param {number} severity - Severity level (1-10)
 * @returns {Promise<void>}
 */
async function logError(errorDescription, severity) {
  if (!errorDescription) {
    console.log('Error description is required.');
    return;
  }
  
  const severityValue = severity ? parseInt(severity) : 5;
  if (isNaN(severityValue) || severityValue < 1 || severityValue > 10) {
    console.log('Severity must be a number between 1 and 10, defaulting to 5.');
  }
  
  console.log(`Logging error: ${errorDescription} (Severity: ${severityValue}/10)`);
  
  const result = await contextManager.logError(errorDescription, severityValue);
  
  if (result) {
    console.log('Error logged successfully.');
  } else {
    console.error('Failed to log error.');
  }
}

/**
 * Updates implementation notes
 * @param {string} noteText - The note to add
 * @returns {Promise<void>}
 */
async function updateNotes(noteText) {
  if (!noteText) {
    console.log('Note text is required.');
    return;
  }
  
  console.log(`Adding note: ${noteText}`);
  
  const result = await contextManager.updateNotes(noteText);
  
  if (result) {
    console.log('Note added successfully.');
  } else {
    console.error('Failed to add note.');
  }
}

// Update phase
async function updatePhase(phase, lineNumber, lineItemText, status) {
  // Validate required parameters
  if (!phase || !lineNumber || !lineItemText || !status) {
    console.log('Phase, line number, line item text, and status are required.');
    return;
  }
  
  // Convert lineNumber to integer
  const lineNum = parseInt(lineNumber, 10);
  if (isNaN(lineNum) || lineNum < 1) {
    console.log('Line number must be a positive integer.');
    return;
  }
  
  console.log(`Updating ${phase}, Line ${lineNum}: "${lineItemText}" to status "${status}"`);
  
  const result = await contextManager.updateImplementationPhase(phase, lineNum, lineItemText, status);
  
  if (result) {
    console.log('Phase update completed successfully.');
  } else {
    console.error('Failed to update phase.');
  }
}

// Start task
async function startTask(taskId, productAbbr) {
  if (!taskId) {
    console.log('Task ID is required.');
    return;
  }
  
  if (!productAbbr) {
    console.log('Product abbreviation is required.');
    return;
  }
  
  console.log(`Starting task: ${taskId} for product: ${productAbbr}`);
  
  try {
    const result = await contextManagerV2.startTaskV2(taskId, { productAbbr });
    
    if (result.success) {
      console.log(`Task ${taskId} started successfully.`);
      if (result.message) {
        console.log(result.message);
      }
    } else {
      console.error(`Failed to start task ${taskId}: ${result.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error(`Error starting task ${taskId}: ${error.message}`);
  }
}

async function startTaskV2Enhanced(taskId, productAbbr) {
  if (!taskId) {
    console.log('Task ID is required.');
    return;
  }
  
  if (!productAbbr) {
    console.log('Product abbreviation is required.');
    return;
  }
  
  console.log(`Starting task with enhanced Version 2 testing system: ${taskId} for product: ${productAbbr}`);
  
  try {
    const result = await contextManagerV2.startTaskV2Enhanced(taskId, { productAbbr });
    
    if (result.success) {
      console.log(`✓ Task ${taskId} started successfully with Version 2 testing system for product: ${productAbbr}.`);
      if (result.message) {
        console.log(result.message);
      }
      
      // Display enhanced features information
      if (result.enhancedFeatures) {
        console.log('\n✓ Enhanced Features Enabled:');
        Object.entries(result.enhancedFeatures).forEach(([feature, enabled]) => {
          if (enabled) {
            console.log(`  - ${feature.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
          }
        });
      }
      
      // Display file information
      console.log('\n📁 Generated Files:');
      console.log(`  - Main task file: ${result.mainFile}`);
      console.log(`  - Enhanced test file: ${result.testFile}`);
      if (result.testFileV1) {
        console.log(`  - Legacy test file: ${result.testFileV1}`);
      }
      
      // Display statistics
      console.log('\n📊 Task Statistics:');
      console.log(`  - Elements: ${result.elementsCount || 0}`);
      console.log(`  - Implementation phases: ${result.phasesCount || 0}`);
      console.log(`  - Acceptance criteria: ${result.acceptanceCriteriaCount || 0}`);
      
    } else {
      console.error(`Failed to start task ${taskId}: ${result.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error(`Error starting enhanced task ${taskId}: ${error.message}`);
  }
}

// Log dependency
async function logDependency(taskId, dependencyDescription) {
  if (!taskId || !dependencyDescription) {
    console.log('Task ID and dependency description are required.');
    return;
  }
  
  console.log(`Logging dependency for task ${taskId}: ${dependencyDescription}`);
  
  try {
    const result = await contextManager.logDependency(taskId, dependencyDescription);
    
    if (result) {
      console.log('Dependency logged successfully.');
    } else {
      console.error('Failed to log dependency.');
    }
  } catch (error) {
    console.error(`Error logging dependency: ${error.message}`);
  }
}

// Log improvement
async function logImprovement(taskId, improvementDescription) {
  if (!taskId || !improvementDescription) {
    console.log('Task ID and improvement description are required.');
    return;
  }
  
  console.log(`Logging improvement for task ${taskId}: ${improvementDescription}`);
  
  try {
    const result = await contextManager.logImprovement(taskId, improvementDescription);
    
    if (result) {
      console.log('Improvement logged successfully.');
    } else {
      console.error('Failed to log improvement.');
    }
  } catch (error) {
    console.error(`Error logging improvement: ${error.message}`);
  }
}

// Complete task
async function completeTaskCommand(taskId, options = {}) {
  if (!taskId) {
    console.log('Task ID is required.');
    return;
  }
  
  console.log(`Completing task: ${taskId}`);
  if (options.force) console.log('Using force flag - bypassing validations');
  if (options.startNext) console.log('Using start-next flag - will start next task automatically');
  
  try {
    const result = await contextManagerV2.completeTask(taskId, options);
    
    if (result.success) {
      console.log(`Task ${taskId} completed successfully.`);
      if (result.message) {
        console.log(result.message);
      }
    } else {
      console.error(`Failed to complete task ${taskId}: ${result.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error(`Error completing task ${taskId}: ${error.message}`);
  }
}

// Update Phase Stage
async function updatePhaseStage(taskId, phaseAbbr, status) {
  if (!taskId || !phaseAbbr || !status) {
    console.log('Task ID, phase abbreviation, and status are required.');
    console.log('Usage: update-phase-stage <taskId> <phaseAbbr> <status>');
    console.log('  phaseAbbr: PREP, IMP, or VAL');
    console.log('  status: "not started", "active", or "complete"');
    return;
  }
  
  console.log(`Updating phase stage for task ${taskId}: ${phaseAbbr} -> ${status}`);
  
  try {
    const result = await contextManagerV3.updatePhaseStage(taskId, phaseAbbr, status);
    
    if (result.success) {
      console.log(result.message);
    } else {
      console.error(`Failed to update phase stage: ${result.message}`);
    }
  } catch (error) {
    console.error(`Error updating phase status: ${error.message}`);
  }
}

// Process CLI arguments
const [command, ...args] = process.argv.slice(2);

switch (command) {
  case 'init':
    await initialize();
    break;
  case 'status':
    await getStatus();
    break;
  case 'update-context':
    await updateContext(args[0]);
    break;
  case 'complete-element':
    await completeElement(args[0]);
    break;
  case 'update-element-status':
    await updateElementStatus(args[0], args[1]);
    break;
  case 'log-improvement':
    await logImprovement(args[0], args.slice(1).join(' '));
    break;
  case 'log-dependency':
    await logDependency(args[0], args.slice(1).join(' '));
    break;
  case 'log-action':
    await logAction(args[0], args[1], ...(args.slice(2) || []));
    break;
  case 'update-confidence':
    await updateConfidence(args[0]);
    break;
  case 'add-implementation-file':
    await addImplementationFile(args[0], args.includes('--primary'));
    break;
  case 'error':
    await logError(args[0], args[1]);
    break;
  case 'update-notes':
    await updateNotes(args.slice(1).join(' '));
    break;
  case 'task-approach':
    const confidenceArg = args[0];
    const confidence = confidenceArg ? parseInt(confidenceArg, 10) : undefined;
    
    console.log(`Processing task-approach with confidence: ${confidence || 'from approach file'}`);
    
    try {
      const result = await contextManagerV2.updateTaskApproach(confidence);
      if (result.success) {
        console.log('Task approach updated successfully.');
        if (result.message) {
          console.log(result.message);
        }
      } else {
        console.error(`Failed to update task approach: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Error updating task approach: ${error.message}`);
    }
    break;
  case 'update-phase':
    if (args.length >= 4) {
      // New format with full implementation
      await updatePhase(args[0], args[1], args[2], args[3]);
    } else {
      console.log('Insufficient arguments for update-phase command.');
      console.log('Usage: update-phase "Phase Name" <lineNumber> "Line Item Text" "Status"');
      console.log('Example: update-phase "Preparation Phase" 1 "Set up color token types" "In Progress"');
      printHelp();
    }
    break;
  case 'start-task':
    await startTaskV2Enhanced(args[0], args[1]);
    break;
  case 'complete-task':
    const taskId = args[0];
    const options = {
      force: args.includes('--force'),
      startNext: args.includes('--startnext')
    };
    completeTaskCommand(taskId, options);
    break;
  case 'test-prompt-build':
    try {
      const result = await contextManagerV3.testPromptBuild();
      if (!result.success) {
        console.error(`Failed to build test prompts: ${result.message}`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`Error building test prompts: ${error.message}`);
      process.exit(1);
    }
    break;
  case 'test-approach':
    const testConfidence = args[0] ? parseInt(args[0], 10) : undefined;
    
    if (testConfidence !== undefined && (isNaN(testConfidence) || testConfidence < 1 || testConfidence > 10)) {
      console.error('Error: Confidence must be a number between 1 and 10');
      process.exit(1);
    }
    
    console.log(`Processing test-approach with confidence: ${testConfidence || 'from approach file'}`);
    
    try {
      const result = await updateTestApproach(testConfidence);
      if (result.success) {
        console.log(`Success: ${result.message}`);
      } else {
        console.error(`Error: ${result.message}`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`Error executing test-approach: ${error.message}`);
      process.exit(1);
    }
    break;
  case 'token-counter':
  case 'count-tokens':
    const modelArg = args.find(arg => arg.startsWith('--model='));
    const model = modelArg ? modelArg.split('=')[1] : undefined;
    
    const newFlag = args.includes('--new');
    const verifyFlag = args.includes('--verify-context');
    
    try {
      const result = await tokenCounter.executeTokenCounter({
        model,
        new: newFlag,
        verifyContext: verifyFlag
      });
      
      if (result.success) {
        console.log(`Using model: ${result.model}`);
        console.log('Token counts:');
        console.log(`  Input:  ${result.counts.input.iteration} (Current) / ${result.counts.input.cumulative} (Total)`);
        console.log(`  Output: ${result.counts.output.iteration} (Current) / ${result.counts.output.cumulative} (Total)`);
        console.log(`  Total:  ${result.counts.total.iteration} (Current) / ${result.counts.total.cumulative} (Total)`);
        
        if (result.contextCheck.message) {
          console.log(`\nContext Check: ${result.contextCheck.status.toUpperCase()}`);
          console.log(result.contextCheck.message);
        }
        
        if (result.message) {
          console.log(`\n${result.message}`);
        }
      } else {
        console.error(`Failed to count tokens: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Error counting tokens: ${error.message}`);
    }
    break;
  case 'concatenate-tasks':
    await concatenateTasks();
    break;
  case 'concatenate-test-maps':
    await concatenateTestMaps();
    break;
  case 'update-phase-stage':
    await updatePhaseStage(args[0], args[1], args[2]);
    break;
  case 'help':
  default:
    printHelp();
    break;
}

// Additional functions needed
async function initialize() {
  console.log('Initializing Project Memory Core system...');
  const result = await contextManager.initialize();
  
  if (result.success) {
    console.log(`Success: ${result.message}`);
  } else {
    console.error(`Error: ${result.message}`);
  }
}

async function getStatus() {
  console.log('Getting current task status...');
  const status = await contextManager.getStatus();
  console.log(status);
}

async function updateContext(taskId) {
  console.log('Updating task context...');
  
  if (!taskId) {
    console.log('Task ID is required.');
    return;
  }
  
  const result = await contextManager.updateTaskContext(taskId);
  
  if (result) {
    console.log(`Task context updated with ${taskId}.`);
  } else {
    console.error('Failed to update task context.');
  }
}

async function completeElement(elementId) {
  console.log(`Marking element ${elementId} as complete...`);
  
  if (!elementId) {
    console.log('Element ID is required.');
    return;
  }
  
  const result = await contextManager.completeElement(elementId);
  
  if (result) {
    console.log(`Element ${elementId} marked as complete.`);
  } else {
    console.error(`Failed to mark element ${elementId} as complete.`);
  }
}

async function updateElementStatus(elementId, status) {
  console.log(`Updating element ${elementId} status to ${status}...`);
  
  if (!elementId || !status) {
    console.log('Element ID and status are required.');
    return;
  }
  
  // Validate status
  const validStatuses = [
    'Not Started',
    'In Progress',
    'Unit Testing',
    'Complete',
    'Complete - Unit Test Successful',
    'Complete - Unit Test Incomplete',
    'Abandoned'
  ];
  if (!validStatuses.includes(status)) {
    console.log(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    return;
  }
  
  const result = await contextManager.updateElementStatus(elementId, status);
  
  if (result) {
    console.log(`Element ${elementId} status updated to ${status}.`);
  } else {
    console.error(`Failed to update element ${elementId} status.`);
  }
}

async function concatenateTasks(productAbbr = 'bmo') {
  console.log(`Concatenating task fragment files for product: ${productAbbr}...`);
  
  // Get the current directory
  const cwd = process.cwd();
  console.log(`Current working directory: ${cwd}`);
  
  // Set up explicit paths for debugging
  const options = {
    sourceDirOverride: path.join(cwd, 'pmc/product/_mapping/task-file-maps'),
    templatePathOverride: path.join(cwd, 'pmc/product/_templates/06-tasks-built-template.md'),
    outputPathOverride: path.join(cwd, `pmc/product/06b-${productAbbr}-tasks-built.md`)
  };
  
  console.log('Using explicit paths for debugging:');
  console.log(`Source directory: ${options.sourceDirOverride}`);
  console.log(`Template path: ${options.templatePathOverride}`);
  console.log(`Output path: ${options.outputPathOverride}`);
  
  try {
    await generateConsolidatedTaskFile(options);
    console.log('Task file concatenation completed successfully.');
  } catch (error) {
    console.error(`Error concatenating task files: ${error.message}`);
  }
}

async function concatenateTestMaps(productAbbr = 'bmo') {
  console.log(`Concatenating test mapping fragment files for product: ${productAbbr}...`);
  
  // Get the current directory
  const cwd = process.cwd();
  console.log(`Current working directory: ${cwd}`);
  
  // Set up explicit paths for debugging
  const options = {
    sourceDirOverride: path.join(cwd, 'pmc/product/_mapping/test-maps'),
    templatePathOverride: path.join(cwd, 'pmc/product/_templates/07-tasks-tests-built-template.md.md'),
    outputPathOverride: path.join(cwd, `pmc/product/07b-task-${productAbbr}-testing-built.md`)
  };
  
  console.log('Using explicit paths for debugging:');
  console.log(`Source directory: ${options.sourceDirOverride}`);
  console.log(`Template path: ${options.templatePathOverride}`);
  console.log(`Output path: ${options.outputPathOverride}`);
  
  try {
    await generateConsolidatedTestMappingFile(options);
    console.log('Test mapping file concatenation completed successfully.');
  } catch (error) {
    console.error(`Error concatenating test mapping files: ${error.message}`);
  }
}

function printHelp() {
  console.log(`
Aplio Agent CLI - Project Memory Core

Usage: node bin/aplio-agent-cli.js <command> [options]

Commands:
  init                                  Initialize the system with necessary files and folders
  status                                Display the current task status
  update-context <taskId>               Update the task context with the specified task

  complete-element <elementId>          Mark an element as complete
  update-element-status <elementId> <status>    Update an element's status (Not Started, In Progress, Complete)
  log-action <action> <confidence> [files...]   Log a micro-action with optional confidence and files
  update-confidence <value>             Update the confidence level (1-10)
  add-implementation-file <path> [isPrimary]   Add an implementation file, optionally marking as primary
  error <description> <severity>        Log an error with severity (1-10)
  update-notes <notes>                  Update implementation notes
  update-phase <phase> <lineNumber> <lineItemText> <status>  Update implementation phase status
  start-task <taskId> <productAbbr>     Start a new task with enhanced Version 2 testing system (productAbbr: product abbreviation like 'bmo')
  log-dependency <taskId> <description> Log a dependency discovered during implementation

  log-improvement <taskId> <description> Log an improvement suggestion
  task-approach <confidence>            Update task approach in active-task.md using current-task-approach.md
  complete-task <taskId> [--force] [--startnext]  Complete a task with optional force and start-next flags
  test-prompt-build                     Generate customized test prompts for current active task
  test-approach <confidence>            Update test approach in active-task-unit-tests-2.md using current-test-approach.md
  token-counter [--model=<model>] [--new] [--verify-context]  Count tokens in the specified model
  concatenate-tasks                     Concatenate task fragment files into a consolidated file
  concatenate-test-maps                 Concatenate test mapping fragment files into a consolidated file
  update-phase-stage <taskId> <phaseAbbr> <status>
    Updates the status of a phase in the progress-phase.md file
    taskId: Task ID (e.g., T-1.3.3)
    phaseAbbr: Phase abbreviation (PREP, IMP, or VAL)
    status: Status (not started, active, or complete)



`);
}