/**
 * Command Engine - Main Entry Point
 * 
 * This module serves as the central coordination point for the Command Engine system,
 * which validates and enforces command execution according to the PMC system prompt.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import CommandRegistry from './registry.js';
import ConversationMonitor from './monitor.js';
import { PreResponseValidator, PostActionReconciliation } from './validator.js';
import CheckpointMechanism from './checkpoint.js';
import UserInterface from './interface.js';
import { extractCommandsFromSystemPrompt, log } from './utils.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CommandEngine {
  constructor() {
    this.initialized = false;
    this.registry = null;
    this.monitor = null;
    this.preValidator = null;
    this.postReconciliation = null;
    this.checkpointer = null;
    this.interface = null;
    
    // Configuration
    this.config = {
      systemPromptPath: path.join(__dirname, '../system/prompt/system-prompt.md'),
      checkpointInterval: 500, // tokens
      reconciliationInterval: 2000, // tokens
      logPath: path.join(__dirname, 'logs/command-engine.log'),
      debugMode: true
    };

    // State
    this.state = {
      currentTask: null,
      tokenCount: 0,
      lastCheckpoint: 0,
      lastReconciliation: 0,
      activeContext: {},
      pendingCommands: []
    };
  }

  /**
   * Initialize the Command Engine and all its components
   */
  async initialize() {
    log('INFO', 'Initializing Command Engine');
    
    // Create logs directory if it doesn't exist
    const logDir = path.dirname(this.config.logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Extract commands from system prompt
    let commands = [];
    try {
      if (fs.existsSync(this.config.systemPromptPath)) {
        const systemPrompt = fs.readFileSync(this.config.systemPromptPath, 'utf8');
        commands = extractCommandsFromSystemPrompt(systemPrompt);
      } else {
        // Fallback to extracting from predefined commands in utils.js
        commands = extractCommandsFromSystemPrompt();
      }
    } catch (error) {
      log('ERROR', `Failed to extract commands: ${error.message}`);
      // We'll still proceed with the predefined commands in the registry
    }
    
    // Initialize components
    this.registry = new CommandRegistry(commands);
    this.monitor = new ConversationMonitor(this.registry, this.state);
    this.preValidator = new PreResponseValidator(this.registry, this.state);
    this.postReconciliation = new PostActionReconciliation(this.registry, this.state);
    this.checkpointer = new CheckpointMechanism(this.registry, this.state, this.config);
    this.interface = new UserInterface(this.state, this.config);
    
    this.initialized = true;
    log('INFO', 'Command Engine initialized successfully');
    
    return {
      success: true,
      message: 'Command Engine initialized successfully'
    };
  }

  /**
   * Process a conversation message to monitor for context changes
   * @param {string} message - The message content
   * @param {string} role - The role (user or assistant)
   */
  processMessage(message, role = 'user') {
    if (!this.initialized) {
      this.initialize();
    }
    
    // Update token count (simple estimation)
    this.state.tokenCount += Math.ceil(message.length / 4);
    
    // Process the message through the monitor
    this.monitor.processMessage(message, role);
    
    // Run checkpoint if needed
    if (this.state.tokenCount - this.state.lastCheckpoint >= this.config.checkpointInterval) {
      this.runCheckpoint();
    }
    
    // Run reconciliation if needed
    if (this.state.tokenCount - this.state.lastReconciliation >= this.config.reconciliationInterval) {
      this.runReconciliation();
    }
  }

  /**
   * Register a command execution
   * @param {string} command - The command that was executed
   * @param {object} context - Context information about the execution
   */
  registerCommandExecution(command, context = {}) {
    if (!this.initialized) {
      this.initialize();
    }
    
    return this.registry.registerExecution(command, context);
  }

  /**
   * Run a validation check before responding
   * @returns {object} Validation results and warnings/recommendations
   */
  validateBeforeResponse() {
    if (!this.initialized) {
      this.initialize();
    }
    
    return this.preValidator.validate();
  }

  /**
   * Run a reconciliation after an action
   * @param {string} action - The action that was performed
   * @returns {object} Reconciliation results
   */
  reconcileAfterAction(action) {
    if (!this.initialized) {
      this.initialize();
    }
    
    return this.postReconciliation.reconcile(action);
  }

  /**
   * Run a checkpoint to validate the overall state
   * @returns {object} Checkpoint results
   */
  runCheckpoint() {
    if (!this.initialized) {
      this.initialize();
    }
    
    const result = this.checkpointer.runCheckpoint();
    this.state.lastCheckpoint = this.state.tokenCount;
    return result;
  }

  /**
   * Run a full reconciliation of all commands
   * @returns {object} Reconciliation results
   */
  runReconciliation() {
    if (!this.initialized) {
      this.initialize();
    }
    
    const result = this.postReconciliation.fullReconciliation();
    this.state.lastReconciliation = this.state.tokenCount;
    return result;
  }

  /**
   * Get user-facing prompts based on current state
   * @returns {string} User-facing message about command status
   */
  getUserPrompts() {
    if (!this.initialized) {
      this.initialize();
    }
    
    return this.interface.generatePrompts();
  }

  /**
   * Get the current state of the command engine
   * @returns {object} Current state
   */
  getState() {
    return {
      ...this.state,
      commandStatus: this.registry ? this.registry.getCommandStatus() : {},
      initialized: this.initialized
    };
  }
}

// Export singleton instance
const commandEngine = new CommandEngine();
export default commandEngine; 