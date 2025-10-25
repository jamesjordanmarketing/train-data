// ES Module imports
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file and directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const PATHS = {
  progressFile: path.join(process.cwd(), 'core', 'progress.md'),
  taskContextFile: path.join(process.cwd(), 'core', 'task-context.md'),
  activeTaskFile: path.join(process.cwd(), 'core', 'active-task.md'),
  activeTaskTestFile: path.join(process.cwd(), 'core', 'active-task-unit-tests.md'),
  improvementFile: path.join(__dirname, '../live-change-requests/improvement-suggestions.md'),
  liveSpecDiscoveryFile: path.join(__dirname, '../live-change-requests/live-spec-discovery.md'),
  // Look for the task breakdown file in both locations - first in pmc and then in the parent directory
  taskBreakdownFile: fs.existsSync(path.join(process.cwd(), 'product', '06-aplio-mod-1-tasks.md')) 
    ? path.join(process.cwd(), 'product', '06-aplio-mod-1-tasks.md') 
    : path.join(process.cwd(), '..', 'product', '06-aplio-mod-1-tasks.md'),
  taskHistory: {
    activeTask: path.join(process.cwd(), 'system/plans/task-history/active-task-history.md'),
    activeTaskTests: path.join(process.cwd(), 'system/plans/task-history/active-task-unit-tests-history.md')
  },
  templates: {
    taskContext: path.join(__dirname, '../templates/task-context-template.md'),
    activeTask: path.join(__dirname, '../templates/active-task-template-2.md'),
    activeTaskTest: path.join(__dirname, '../templates/active-task-test-template.md'),
    improvement: path.join(__dirname, '../templates/improvement-template.md'),
    dependency: path.join(__dirname, '../templates/dependency-template.md')
  }
};

// System reset paths (add to existing PATHS object)
const RESET_PATHS = {
  // Source reset templates
  progressResetTemplate: path.join(process.cwd(), 'core', 'resets', 'progress-reset.md'),
  
  // Target files to reset
  progressFile: path.join(process.cwd(), 'core', 'progress.md'),
  liveSpecDiscoveryFile: path.join(process.cwd(), 'system', 'live-change-requests', 'live-spec-discovery.md'),
  improvementSuggestionsFile: path.join(process.cwd(), 'system', 'live-change-requests', 'improvement-suggestions.md'),
  taskImplementationLogFile: path.join(process.cwd(), 'core', 'task-implementation-log.md'),
  actionLogFile: path.join(process.cwd(), 'core', 'actionLog.md'),
  taskApproachFile: path.join(process.cwd(), 'system', 'plans', 'task-approach', 'current-task-approach.md'),
  taskHistoryLogFile: path.join(process.cwd(), 'core', 'task-history-log.md'),
  
  // Archive directories
  archiveDir: path.join(process.cwd(), '_archive', 'active-task-history')
};

/**
 * Generates a timestamp for file naming (without seconds)
 * Format: MM-DD-YY-hhmm
 * @returns {string} Formatted timestamp
 */
function generateFileTimestamp() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  const hours = now.getHours() % 12 || 12; // 12-hour format
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const period = now.getHours() >= 12 ? 'pm' : 'am';
  
  return `${month}-${day}-${year}-${hours}${minutes}${period}`;
}

/**
 * Creates directory if it doesn't exist
 * @param {string} dirPath - Path to directory
 * @returns {Promise<boolean>} Success status
 */
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.promises.mkdir(dirPath, { recursive: true });
    return true;
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error);
    return false;
  }
}

/**
 * Archives a file before resetting it
 * @param {string} sourceFilePath - File to archive
 * @param {string} archiveDir - Archive directory
 * @param {string} fileNamePrefix - Prefix for the archived file
 * @returns {Promise<boolean>} Success status
 */
async function archiveFile(sourceFilePath, archiveDir, fileNamePrefix) {
  try {
    // Check if source file exists
    if (!fs.existsSync(sourceFilePath)) {
      console.log(`No file to archive at ${sourceFilePath}`);
      return true; // Not an error if file doesn't exist
    }
    
    // Ensure archive directory exists
    await ensureDirectoryExists(archiveDir);
    
    // Generate archive file path with timestamp
    const timestamp = generateFileTimestamp();
    const archiveFilePath = path.join(archiveDir, `${fileNamePrefix}-${timestamp}.md`);
    
    // Copy file to archive
    await fs.promises.copyFile(sourceFilePath, archiveFilePath);
    console.log(`Archived ${sourceFilePath} to ${archiveFilePath}`);
    
    return true;
  } catch (error) {
    console.error(`Error archiving ${sourceFilePath}:`, error);
    return false;
  }
}

/**
 * Initialize the entire system by resetting all state files
 * @returns {Promise<{success: boolean, message: string}>} Result with status and message
 */
async function initialize() {
  console.log('Initializing Project Memory Core system...');
  
  try {
    // 1. Archive task history log before resetting
    await archiveFile(
      RESET_PATHS.taskHistoryLogFile,
      RESET_PATHS.archiveDir,
      'active-task'
    );
    
    // 2. Reset progress.md with template content
    try {
      const progressResetContent = await fs.promises.readFile(RESET_PATHS.progressResetTemplate, 'utf8');
      await fs.promises.writeFile(RESET_PATHS.progressFile, progressResetContent);
      console.log('Reset progress.md with template content');
    } catch (error) {
      console.error('Error resetting progress.md:', error);
      throw new Error(`Failed to reset progress.md: ${error.message}`);
    }
    
    // 3. Reset live-spec-discovery.md (blank file)
    try {
      await fs.promises.writeFile(RESET_PATHS.liveSpecDiscoveryFile, '');
      console.log('Reset live-spec-discovery.md to blank content');
    } catch (error) {
      console.error('Error resetting live-spec-discovery.md:', error);
      throw new Error(`Failed to reset live-spec-discovery.md: ${error.message}`);
    }
    
    // 4. Reset improvement-suggestions.md
    try {
      const improvementContent = '# Improvement Suggestions\nThis file contains suggestions for improvements that are outside the current task scope.\n';
      await fs.promises.writeFile(RESET_PATHS.improvementSuggestionsFile, improvementContent);
      console.log('Reset improvement-suggestions.md with minimal content');
    } catch (error) {
      console.error('Error resetting improvement-suggestions.md:', error);
      throw new Error(`Failed to reset improvement-suggestions.md: ${error.message}`);
    }
    
    // 5. Reset task-implementation-log.md
    try {
      const taskLogContent = '# Task Implementation Log\nThis file contains the complete implementation history of all tasks.\n';
      await fs.promises.writeFile(RESET_PATHS.taskImplementationLogFile, taskLogContent);
      console.log('Reset task-implementation-log.md with minimal content');
    } catch (error) {
      console.error('Error resetting task-implementation-log.md:', error);
      throw new Error(`Failed to reset task-implementation-log.md: ${error.message}`);
    }
    
    // 6. Reset actionLog.md
    try {
      await fs.promises.writeFile(RESET_PATHS.actionLogFile, '# Action Log\n');
      console.log('Reset actionLog.md with minimal content');
    } catch (error) {
      console.error('Error resetting actionLog.md:', error);
      throw new Error(`Failed to reset actionLog.md: ${error.message}`);
    }
    
    // 7. Reset current-task-approach.md (blank file)
    try {
      await fs.promises.writeFile(RESET_PATHS.taskApproachFile, '');
      console.log('Reset current-task-approach.md to blank content');
    } catch (error) {
      console.error('Error resetting current-task-approach.md:', error);
      throw new Error(`Failed to reset current-task-approach.md: ${error.message}`);
    }
    
    // 8. Reset task-history-log.md (blank file after archiving)
    try {
      await fs.promises.writeFile(RESET_PATHS.taskHistoryLogFile, '');
      console.log('Reset task-history-log.md to blank content');
    } catch (error) {
      console.error('Error resetting task-history-log.md:', error);
      throw new Error(`Failed to reset task-history-log.md: ${error.message}`);
    }
    
    console.log('System initialization complete - all state files reset.');
    return { success: true, message: 'System initialized successfully' };
  } catch (error) {
    console.error('Error during initialization:', error);
    return { success: false, message: `Initialization failed: ${error.message}` };
  }
}

// Format timestamp in a human-readable format
function formatTimestamp(date = new Date()) {
  const options = {
    timeZone: 'America/Los_Angeles',
    hour12: true,
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  
  return date.toLocaleString('en-US', options);
}

/**
 * Process template with replacements
 * @param {string} template - Template content
 * @param {Object} replacements - Key-value pairs for replacements
 * @returns {string} - Processed template
 */
function processTemplate(template, replacements) {
    if (!template) {
        console.error('Template is empty or undefined');
        return 'Error: Template not available';
    }
    
    if (!replacements || Object.keys(replacements).length === 0) {
        console.error('No replacements provided for template processing');
        return template;
    }

    let processedTemplate = template;
    
    // Find all placeholders in the template using a regex
    const placeholders = new Set();
    const placeholderRegex = /\{\{([A-Z_]+)\}\}/g;
    let match;
    
    while ((match = placeholderRegex.exec(template)) !== null) {
        placeholders.add(match[1]);
    }
    
    console.log(`Found ${placeholders.size} distinct placeholders in template`);
    
    // Check for missing replacements
    const missingReplacements = [];
    for (const placeholder of placeholders) {
        if (replacements[placeholder] === undefined) {
            missingReplacements.push(placeholder);
        }
    }
    
    if (missingReplacements.length > 0) {
        console.warn(`Missing replacements for ${missingReplacements.length} placeholders:`, missingReplacements);
    }
    
    // Replace all placeholders with their corresponding values
    for (const [key, value] of Object.entries(replacements)) {
        const placeholder = `{{${key}}}`;
        const safeValue = value !== undefined && value !== null ? value : `[Missing: ${key}]`;
        
        // Use safe replacement to avoid issues with special regex characters in the value
        processedTemplate = processedTemplate.split(placeholder).join(safeValue);
    }
    
    // Check if any placeholders remain unreplaced
    const unreplacedPlaceholders = [];
    const checkRegex = /\{\{([A-Z_]+)\}\}/g;
    while ((match = checkRegex.exec(processedTemplate)) !== null) {
        unreplacedPlaceholders.push(match[1]);
    }
    
    if (unreplacedPlaceholders.length > 0) {
        console.warn(`${unreplacedPlaceholders.length} placeholders remain unreplaced:`, unreplacedPlaceholders);
    } else {
        console.log('All placeholders successfully replaced');
    }
    
    return processedTemplate;
}

// Update task context with new task
async function updateTaskContext(taskId) {
  try {
    // Read task breakdown file to get task details
    const taskBreakdown = fs.readFileSync(PATHS.taskBreakdownFile, 'utf8');
    
    // Extract task details using regex
    const taskRegex = new RegExp(`#### ${taskId}: .*\\n([\\s\\S]*?)(?=\\n#### |$)`, 'g');
    const taskMatch = taskRegex.exec(taskBreakdown);
    
    if (!taskMatch) {
      throw new Error(`Task ${taskId} not found in task breakdown file`);
    }

    // Update progress.md to mark task as In Progress
    try {
      const progress = fs.readFileSync(PATHS.progressFile, 'utf8');
      
      // Find the task line in progress.md and update its status
      const taskLineRegex = new RegExp(`(- \\[[ x]\\] ${taskId}:.*?)(?:\\(Status:.*?\\))?\\s*$`, 'm');
      const updatedProgress = progress.replace(
        taskLineRegex,
        `$1 (Status: In Progress, Updated: ${formatTimestamp()})`
      );
      
      fs.writeFileSync(PATHS.progressFile, updatedProgress);
    } catch (error) {
      console.error('Error updating progress.md:', error);
      // Continue with task context update even if progress.md update fails
    }

    const taskDetails = taskMatch[1];
    
    // Extract relevant information
    const frReference = taskDetails.match(/\*\*FR Reference\*\*: (.*)/)?.[1] || 'N/A';
    const implementationLocation = taskDetails.match(/\*\*Implementation Location\*\*: (.*)/)?.[1] || 'N/A';
    const dependencies = taskDetails.match(/\*\*Dependencies\*\*: (.*)/)?.[1] || 'None';
    const description = taskDetails.match(/\*\*Description\*\*: (.*)/)?.[1] || 'N/A';
    
    // Extract implementation process phases
    const preparationPhaseMatch = taskDetails.match(/1\. Preparation Phase:([\s\S]*?)2\. Implementation Phase:/);
    const implementationPhaseMatch = taskDetails.match(/2\. Implementation Phase:([\s\S]*?)3\. Validation Phase:/);
    const validationPhaseMatch = taskDetails.match(/3\. Validation Phase:([\s\S]*?)(?=\*\*|$)/);
    
    // Format steps
    function formatSteps(phaseText) {
        if (!phaseText) return '';
        
        // Split into lines and filter out empty lines
        const lines = phaseText.split('\n').filter(line => line.trim());
        
        // Skip processing if this is the quality standards section
        if (phaseText.includes('Quality Standards')) {
            return phaseText;
        }
        
        // Process other implementation steps
        return lines.map(line => {
            // Remove any existing checkbox
            line = line.replace(/^[-*]\s*\[[ x]\]\s*/, '');
            // Add checkbox
            return `- [ ] ${line.trim()}`;
        }).join('\n');
    }
    
    const preparationSteps = formatSteps(preparationPhaseMatch?.[1]);
    const implementationSteps = formatSteps(implementationPhaseMatch?.[1]);
    const validationSteps = formatSteps(validationPhaseMatch?.[1]);
    
    // Extract elements
    const elementsRegex = /\[([^:]+):(ELE-\d+[a-z]?)\] ([^\n]*)/g;
    let elementsMatch;
    let elements = [];
    
    while ((elementsMatch = elementsRegex.exec(taskDetails)) !== null) {
      elements.push({
        id: elementsMatch[2],
        fullId: `${elementsMatch[1]}:${elementsMatch[2]}`,
        description: elementsMatch[3]
      });
    }
    
    // Also extract sub-elements with letters
    const subElementsRegex = /\[([^:]+):(ELE-\d+[a-z])\] ([^\n]*)/g;
    let subElementsMatch;
    
    while ((subElementsMatch = subElementsRegex.exec(taskDetails)) !== null) {
      // Check if this sub-element is already added (might have been caught by the previous regex)
      const fullId = `${subElementsMatch[1]}:${subElementsMatch[2]}`;
      const exists = elements.some(e => e.fullId === fullId);
      
      if (!exists) {
        elements.push({
          id: subElementsMatch[2],
          fullId: fullId,
          description: subElementsMatch[3]
        });
      }
    }
    
    // Format elements list
    const elementsList = elements.length > 0 
      ? elements
          // Sort elements so main elements come before their sub-elements
          .sort((a, b) => {
            // Extract just the number part of ELE-X or ELE-Xa
            const aBaseId = a.id.match(/ELE-(\d+)/)[1];
            const bBaseId = b.id.match(/ELE-(\d+)/)[1];
            
            // Compare base numbers first
            if (aBaseId !== bBaseId) {
              return parseInt(aBaseId) - parseInt(bBaseId);
            }
            
            // If same base number, the one without letter comes first
            const aHasLetter = /ELE-\d+[a-z]/.test(a.id);
            const bHasLetter = /ELE-\d+[a-z]/.test(b.id);
            
            if (!aHasLetter && bHasLetter) return -1;
            if (aHasLetter && !bHasLetter) return 1;
            
            // If both have letters, sort by the letter
            if (aHasLetter && bHasLetter) {
              const aLetter = a.id.charAt(a.id.length - 1);
              const bLetter = b.id.charAt(b.id.length - 1);
              return aLetter.localeCompare(bLetter);
            }
            
            return 0;
          })
          // Format with indentation for sub-elements
          .map(e => {
            const isSubElement = /ELE-\d+[a-z]/.test(e.id);
            return isSubElement 
              ? `  - [ ] ${e.fullId}: ${e.description}` // Indented sub-element
              : `- [ ] ${e.fullId}: ${e.description}`;  // Main element
          })
          .join('\n')
      : '- [ ] No elements specified';
    
    // Extract legacy code references
    const legacyCodeSection = extractMetadata(taskDetails, 'Legacy Code Location');
    console.log('Legacy code section:', legacyCodeSection);
    
    const legacyCodeFiles = {
        primary: [],
        supporting: [],
        details: []
    };

    if (legacyCodeSection) {
        const lines = legacyCodeSection.split('\n');
        let currentSection = 'primary'; // Default to primary if no section specified
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            
            if (trimmedLine === 'Primary Configuration:' || 
                trimmedLine.includes('Primary Configuration:')) {
                currentSection = 'primary';
                continue;
            } else if (trimmedLine === 'Theme Implementation:' || 
                      trimmedLine === 'Component Usage:' || 
                      trimmedLine === 'Dark Mode Implementation:' ||
                      trimmedLine === 'Color System Structure:' ||
                      trimmedLine === 'Theme Integration:' ||
                      trimmedLine.includes('Theme Implementation:') || 
                      trimmedLine.includes('Component Usage:') || 
                      trimmedLine.includes('Dark Mode Implementation:') ||
                      trimmedLine.includes('Color System Structure:') ||
                      trimmedLine.includes('Theme Integration:')) {
                currentSection = 'supporting';
                continue;
            }
            
            if (trimmedLine.startsWith('-')) {
                const fileLine = trimmedLine.substring(1).trim();
                if (fileLine.includes(':') && (fileLine.includes('(') || fileLine.includes(')'))) {
                    legacyCodeFiles.details.push(fileLine);
                } else if (currentSection === 'primary') {
                    legacyCodeFiles.primary.push(fileLine);
                } else if (currentSection === 'supporting') {
                    legacyCodeFiles.supporting.push(fileLine);
                }
            }
        }
    }
    
    console.log('Legacy code files:', legacyCodeFiles);

    // Format additional files section
    const additionalFiles = '';
    
    // Initial recent actions
    const recentActions = '- [' + formatTimestamp() + '] Task initialized\n- [' + formatTimestamp() + '] Context updated';
    
    // Next steps with priorities
    const nextStep1 = "Begin Preparation Phase";
    const nextStep2 = "Implement first element";
    const nextStep3 = "Validate requirements";
    const dependencies1 = dependencies !== 'None' ? `, Dependencies: ${dependencies}` : '';
    const dependencies2 = '';
    
    // Additional notes
    const additionalNotes = "Starting with initial analysis of requirements";
    
    // Use template with replacements
    const replacements = {
      TASK_ID: taskId,
      DESCRIPTION: description || 'N/A',
      FR_REFERENCE: frReference || 'N/A',
      IMPLEMENTATION_LOCATION: implementationLocation || 'N/A',
      DEPENDENCIES: dependencies || 'None',
      CONFIDENCE: '8', // Default initial confidence
      ELEMENTS_LIST: elementsList,
      PREPARATION_STEPS: preparationSteps,
      IMPLEMENTATION_STEPS: implementationSteps,
      VALIDATION_STEPS: validationSteps,
      CURRENT_ELEMENT_ID: elements.length > 0 ? elements[0].fullId : 'None',
      CURRENT_ELEMENT_DESCRIPTION: elements.length > 0 ? elements[0].description : 'None',
      CURRENT_ELEMENT_STATUS: 'Not Started',
      ELEMENT_TIMESTAMP: formatTimestamp(),
      LEGACY_CODE_REFERENCES: legacyCodeRefs,
      TIMESTAMP: formatTimestamp(),
      IMPLEMENTATION_STATUS: 'not yet started',
      ADDITIONAL_NOTES: additionalNotes,
      ADDITIONAL_FILES: additionalFiles,
      RECENT_ACTIONS: recentActions,
      NEXT_STEP_1: nextStep1,
      NEXT_STEP_2: nextStep2,
      NEXT_STEP_3: nextStep3,
      DEPENDENCIES_1: dependencies1,
      DEPENDENCIES_2: dependencies2
    };
    
    // Process template
    const taskContextContent = processTemplate(PATHS.templates.taskContext, replacements);
    
    // Write to task context file
    fs.writeFileSync(PATHS.taskContextFile, taskContextContent);

    return true;
  } catch (error) {
    console.error('Error in updateTaskContext:', error);
    return false;
  }
}

// Update task context with element progress
function updateElementProgress(taskId, elementId, status) {
  // Read task context file
  const taskContext = fs.readFileSync(PATHS.taskContextFile, 'utf8');
  
  // Update element status
  const elementRegex = new RegExp(`- Element ID: ${elementId.replace(/\[/g, '\\[').replace(/\]/g, '\\]')}\\n- Description: (.*?)\\n- Status: .*?\\n- Updated: .*?\\n`, 'g');
  const updatedTaskContext = taskContext.replace(elementRegex, `- Element ID: ${elementId}\n- Description: $1\n- Status: ${status}\n- Updated: ${formatTimestamp()}\n`);
  
  // Add micro-action for status change
  const updatedWithAction = logMicroActionToContext(
    updatedTaskContext,
    `Updated element ${elementId} status to "${status}"`, 
    9, // High confidence for status updates
    []  // No specific files for a status update
  );
  
  // Write updated content
  fs.writeFileSync(PATHS.taskContextFile, updatedWithAction);
  
  // Update progress.md if element is complete
  if (status === 'Complete') {
    updateProgressFile(taskId, elementId);
  }
}

// CLEANED: Removed legacy implementation of logMicroActionToContext, replacing with a stub
function logMicroActionToContext(taskContext, action, confidence, files) {
  // Stub for future implementation
  console.log('logMicroActionToContext stub - to be implemented');
  return taskContext; // Return unchanged context
}

/**
 * Logs a micro-action to active-task.md and actionLog.md
 * @param {string} action - Description of the action
 * @param {number} confidence - Confidence level (1-10)
 * @param  {...string} files - Files involved in the action
 * @returns {boolean} - Success status
 */
function logMicroAction(action, confidence, ...files) {
  try {
    if (!action) {
      console.error('Action description is required');
      return false;
    }
    
    // Validate confidence
    const confidenceValue = parseInt(confidence) || 8;
    if (confidenceValue < 1 || confidenceValue > 10) {
      console.warn('Confidence should be between 1-10, defaulting to 8');
    }
    
    // Format the action entry
    const formattedEntry = formatTimestampedEntry(action, {
      confidence: confidenceValue,
      files: files
    });
    
    // Update the active-task.md file
    if (fs.existsSync(PATHS.activeTaskFile)) {
      try {
        const activeTaskContent = fs.readFileSync(PATHS.activeTaskFile, 'utf8');
        const updatedActiveTaskContent = updateSectionInActiveTask(
          activeTaskContent,
          'Recent Actions',
          formattedEntry
        );
        
        // Write the updated content back to the file
        fs.writeFileSync(PATHS.activeTaskFile, updatedActiveTaskContent);
        console.log(`Updated Recent Actions in active-task.md with: ${action}`);
      } catch (error) {
        console.error('Error updating active-task.md:', error);
      }
    } else {
      console.warn('active-task.md not found, could not update Recent Actions');
    }
    
    // Also append to the actionLog.md for historical record
    try {
      const actionLogPath = path.join(process.cwd(), 'core', 'actionLog.md');
      
      // Create the file if it doesn't exist
      if (!fs.existsSync(actionLogPath)) {
        fs.writeFileSync(actionLogPath, `# Action Log\n\n**Started:** ${formatTimestamp()}\n\n## Actions\n\n`);
      }
      
      // Append the action
      fs.appendFileSync(actionLogPath, `${formattedEntry}\n`);
      console.log(`Appended action to actionLog.md: ${action}`);
    } catch (error) {
      console.error('Error updating actionLog.md:', error);
    }
    
    // Update the legacy task-context.md file for backward compatibility, if it exists
    if (fs.existsSync(PATHS.taskContextFile)) {
      try {
        const taskContext = fs.readFileSync(PATHS.taskContextFile, 'utf8');
        const updatedTaskContext = logMicroActionToContext(taskContext, action, confidenceValue, files);
        fs.writeFileSync(PATHS.taskContextFile, updatedTaskContext);
      } catch (error) {
        console.error('Error updating task-context.md:', error);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in logMicroAction:', error);
    return false;
  }
}

/**
 * Updates the confidence level in the Task Information section of active-task.md
 * @param {number} confidence - The new confidence level (1-10)
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
async function updateConfidence(confidence) {
  // Validate confidence level
  if (!Number.isInteger(confidence) || confidence < 1 || confidence > 10) {
    console.error('Confidence level must be an integer between 1 and 10');
    return false;
  }

  try {
    // Read active-task.md
    const activeTaskPath = path.join(process.cwd(), 'core', 'active-task.md');
    const content = await fs.promises.readFile(activeTaskPath, 'utf8');

    // Find Task Information section and update confidence
    const taskInfoSection = findSectionInActiveTask(content, 'Task Information');
    if (!taskInfoSection) {
      console.error('Task Information section not found in active-task.md');
      return false;
    }

    // Update the confidence line
    const updatedContent = content.replace(
      /- Confidence:.*(\r?\n|$)/m,
      `- Confidence: ${confidence}/10\n`
    );

    // Update the Last Updated timestamp
    const timestamp = formatTimestamp();
    const finalContent = updatedContent.replace(
      /- Last Updated:.*(\r?\n|$)/m,
      `- Last Updated: ${timestamp}\n`
    );

    // Write back to file
    await fs.promises.writeFile(activeTaskPath, finalContent);

    // Log to implementation log
    const logEntry = `[${timestamp}] Updated task confidence to ${confidence}/10`;
    await appendToTaskLog(getCurrentTask()?.id || 'unknown', logEntry);

    return true;
  } catch (error) {
    console.error('Error updating confidence:', error);
    return false;
  }
}

/**
 * Adds a new file entry to the Expected Implementation Files section in active-task.md
 * @param {string} filePath - The path of the file to add
 * @param {boolean} isPrimary - Whether this is a primary implementation file
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
async function addImplementationFile(filePath, isPrimary = false) {
  if (!filePath) {
    console.error('File path is required');
    return false;
  }

  try {
    // Read active-task.md
    const activeTaskPath = path.join(process.cwd(), 'core', 'active-task.md');
    const content = await fs.promises.readFile(activeTaskPath, 'utf8');

    // Find or create Expected Implementation Files section
    const sectionTitle = 'Expected Implementation Files';
    let sectionInfo = findSectionInActiveTask(content, sectionTitle);
    
    if (!sectionInfo.found) {
      // Create new section with both subsections
      const sectionTemplate = `## ${sectionTitle}\n\nPrimary:\n\nAdditional Files:\n`;
      const updatedContent = content.replace(/## Next Steps/g, `${sectionTemplate}\n## Next Steps`);
      await fs.promises.writeFile(activeTaskPath, updatedContent);
      
      // Re-read the file to get updated content
      const newContent = await fs.promises.readFile(activeTaskPath, 'utf8');
      const updatedSectionInfo = findSectionInActiveTask(newContent, sectionTitle);
      if (!updatedSectionInfo.found) {
        throw new Error('Failed to create Expected Implementation Files section');
      }
      sectionInfo = updatedSectionInfo;
    }

    // Split section into subsections using the section content
    const primaryMatch = sectionInfo.content.match(/Primary:\n([\s\S]*?)(?=\n\nAdditional Files:|\n\n##|$)/);
    const additionalMatch = sectionInfo.content.match(/Additional Files:\n([\s\S]*?)(?=\n\n##|$)/);

    let primaryFiles = primaryMatch ? primaryMatch[1].trim().split('\n').filter(Boolean) : [];
    let additionalFiles = additionalMatch ? additionalMatch[1].trim().split('\n').filter(Boolean) : [];

    // Check for duplicates
    const fileEntry = `- ${filePath} (Added: ${formatTimestamp()})`;
    const existingEntries = [...primaryFiles, ...additionalFiles];
    if (existingEntries.some(entry => entry.startsWith(`- ${filePath} `))) {
      console.log(`File ${filePath} is already listed`);
      return true;
    }

    // Add new file entry to appropriate subsection
    if (isPrimary) {
      primaryFiles.push(fileEntry);
    } else {
      additionalFiles.push(fileEntry);
    }

    // Format the updated section
    const updatedSection = `## ${sectionTitle}\n\nPrimary:\n${primaryFiles.join('\n')}\n\nAdditional Files:\n${additionalFiles.join('\n')}\n`;

    // Update the file
    const updatedContent = content.substring(0, sectionInfo.startIndex) + 
      updatedSection + 
      content.substring(sectionInfo.endIndex);
    
    await fs.promises.writeFile(activeTaskPath, updatedContent);

    // Log to implementation log
    const logEntry = `[${formatTimestamp()}] Added ${isPrimary ? 'primary' : 'additional'} implementation file: ${filePath}`;
    await appendToTaskLog(getCurrentTask()?.id || 'unknown', logEntry);

    return true;
  } catch (error) {
    console.error('Error adding implementation file:', error);
    return false;
  }
}

// Update progress.md file
async function updateProgressFile(taskId, elementId, status = 'Complete') {
  try {
    // Ensure progress file exists
    if (!fs.existsSync(PATHS.progressFile)) {
      console.log('Progress file not found, creating from template...');
      const templatePath = path.join(__dirname, '../templates/progress-template.md');
      
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Progress template not found at ${templatePath}`);
      }
      
      // Create the directory if it doesn't exist
      const progressDir = path.dirname(PATHS.progressFile);
      if (!fs.existsSync(progressDir)) {
        fs.mkdirSync(progressDir, { recursive: true });
        console.log(`Created directory: ${progressDir}`);
      }
      
      // Copy the template
      const progressTemplate = fs.readFileSync(templatePath, 'utf8');
      fs.writeFileSync(PATHS.progressFile, progressTemplate);
      console.log('Progress file created successfully from template');
    }

    // Read progress file
    const progress = fs.readFileSync(PATHS.progressFile, 'utf8');
    
    if (!progress) {
      throw new Error('Progress file is empty');
    }

    // Update element checkbox if elementId is provided
    let updatedProgress = progress;
    if (elementId) {
      // Determine checkbox value based on status
      let checkbox = '[ ]';
      switch (status) {
        case 'Not Started':
          checkbox = '[ ]';
          break;
        case 'In Progress':
          checkbox = '[-]';
          break;
        case 'Unit Testing':
          checkbox = '[y]';
          break;
        case 'Complete - Unit Test Successful':
        case 'Complete - Unit Test Incomplete':
        case 'Complete':
        case 'Completed':
          checkbox = '[x]';
          break;
        case 'Abandoned':
          checkbox = '[a]';
          break;
        default:
          checkbox = '[ ]';
          break;
      }
      
      // Create status indicator
      const timestamp = formatTimestamp();
      const statusIndicator = status === 'Not Started' ? '' : ` (Status: ${status}, Updated: ${timestamp})`;
      
      // Find and update the element line
      // Escape special regex characters in the element ID, but we'll use a different approach for finding the line
      const escapedElementId = elementId.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      
      // Split the file into lines to find and replace the exact line with the element ID
      const lines = updatedProgress.split('\n');
      let elementFound = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Look for lines that contain our element ID and have checkbox format
        if (line.includes(elementId) && line.includes('[') && line.includes(']')) {
          // Capture the original indentation
          const indentMatch = line.match(/^(\s*)/);
          const indentation = indentMatch ? indentMatch[1] : '';
          
          // Get the checkbox position
          const checkboxEnd = line.indexOf(']') + 1;
          
          // Get content after the checkbox until any existing status indicator
          let afterCheckbox = '';
          const statusStart = line.indexOf('(Status:');
          
          if (statusStart !== -1) {
            // If there's an existing status indicator, extract content before it
            afterCheckbox = line.substring(checkboxEnd, statusStart).trim();
          } else {
            // If no status indicator, take the rest of the line
            afterCheckbox = line.substring(checkboxEnd).trim();
          }
          
          // Build the updated line with proper checkbox and status, preserving indentation
          lines[i] = `${indentation}- ${checkbox} ${afterCheckbox}${statusIndicator}`;
          elementFound = true;
          break;
        }
      }
      
      if (elementFound) {
        updatedProgress = lines.join('\n');
        console.log(`Updated element ${elementId} in progress file`);
      } else {
        console.log(`WARNING: Element ${elementId} not found in progress file`);
      }
    }

    // Update current focus section
    const currentFocusRegex = /## Current Focus\n([\s\S]*?)(?=\n## |$)/g;
    if (!currentFocusRegex.test(updatedProgress)) {
      console.log('Current Focus section not found, adding it...');
      updatedProgress = updatedProgress.replace(
        /# Project Progress\n/,
        `# Project Progress\n\n## Current Focus\nStarting task initialization...\n\n`
      );
    }

    // Get task details
    const taskBreakdown = fs.readFileSync(PATHS.taskBreakdownFile, 'utf8');
    const taskRegex = new RegExp(`#### ${taskId}: .*\\n([\\s\\S]*?)(?=\n#### |$)`, 'g');
    const taskMatch = taskRegex.exec(taskBreakdown);

    let nextElement = 'Next element to be determined';
    if (taskMatch) {
      const elementsRegex = /\[([^:]+):(ELE-\d+)\] ([^\n]*)/g;
      let elementsMatch;
      let elements = [];
      
      while ((elementsMatch = elementsRegex.exec(taskMatch[1])) !== null) {
        elements.push({
          id: elementsMatch[2],
          fullId: `${elementsMatch[1]}:${elementsMatch[2]}`,
          description: elementsMatch[3]
        });
      }
      
      // Find current element index
      const currentElementIndex = elements.findIndex(e => e.fullId === elementId);
      if (currentElementIndex !== -1 && currentElementIndex < elements.length - 1) {
        nextElement = `${elements[currentElementIndex + 1].fullId}: ${elements[currentElementIndex + 1].description}`;
      } else {
        // Get next task
        const tasksRegex = /#### (T-[\d\.]+): ([^\n]*)/g;
        let taskMatches = [];
        let match;
        
        while ((match = tasksRegex.exec(taskBreakdown)) !== null) {
          taskMatches.push({
            id: match[1],
            description: match[2]
          });
        }
        
        // Find current task index
        const currentTaskIndex = taskMatches.findIndex(t => t.id === taskId);
        if (currentTaskIndex !== -1 && currentTaskIndex < taskMatches.length - 1) {
          nextElement = `Moving to next task: ${taskMatches[currentTaskIndex + 1].id}: ${taskMatches[currentTaskIndex + 1].description}`;
        } else {
          nextElement = 'All tasks completed';
        }
      }
    }

    // Only include "Completed" text for complete statuses
    const isCompleted = status.includes('Complete') || status === 'Completed';
    const updatedFocus = updatedProgress.replace(
      currentFocusRegex, 
      `## Current Focus\n${elementId ? (isCompleted ? `Completed ${elementId}, next: ` : `Working on ${elementId}, status: ${status}, next: `) : ''}${nextElement}`
    );

    // Calculate progress percentages
    const totalElements = (updatedFocus.match(/- \[[ x\-ya]\]/g) || []).length;
    const completedElements = (updatedFocus.match(/- \[x\]/g) || []).length;
    const completionPercentage = totalElements > 0 ? Math.round((completedElements / totalElements) * 100) : 0;

    // Update overall progress section
    const overallProgressRegex = /## Overall Progress\n- \*\*Tasks Completed\*\*: .*\n- \*\*Elements Completed\*\*: .*\n- \*\*Current Completion\*\*: .*%/g;
    if (!overallProgressRegex.test(updatedFocus)) {
      console.log('Overall Progress section not found, adding it...');
      updatedProgress = updatedFocus.replace(
        /# Project Progress\n/,
        `# Project Progress\n\n## Overall Progress\n- **Tasks Completed**: ${completedElements} of ${totalElements}\n- **Elements Completed**: ${completedElements} of ${totalElements}\n- **Current Completion**: ${completionPercentage}%\n\n`
      );
    } else {
      updatedProgress = updatedFocus.replace(
        overallProgressRegex,
        `## Overall Progress\n- **Tasks Completed**: ${completedElements} of ${totalElements}\n- **Elements Completed**: ${completedElements} of ${totalElements}\n- **Current Completion**: ${completionPercentage}%`
      );
    }

    // Write updated content
    fs.writeFileSync(PATHS.progressFile, updatedProgress);
    console.log('Progress file updated successfully');

    // Update task context if needed - DEPRECATED - Don't update task-context.md anymore
    // Instead, log to implementation log for tracking
    if (elementId) {
      try {
        await appendToTaskLog(taskId, `Updated element ${elementId} status to "${status}"`);
      } catch (error) {
        console.error('Error logging to implementation log:', error);
      }
    }

    return true;
  } catch (error) {
    console.error('Error in updateProgressFile:', error);
    return false;
  }
}

/**
 * Logs an improvement suggestion to active-task.md and improvement tracking file
 * @param {string} taskId - ID of the current task
 * @param {string} suggestion - Detailed description of the improvement suggestion
 * @returns {boolean} - Success status
 */
function logImprovement(taskId, suggestion) {
  try {
    if (!taskId || !suggestion) {
      console.error('Task ID and improvement suggestion are required');
      return false;
    }
    
    console.log(`Logging improvement for task ${taskId}: ${suggestion}`);
    
    // Format the improvement entry
    const timestamp = formatTimestamp();
    const formattedEntry = `- [${timestamp}] Improvement: ${suggestion}`;
    
    // Update the active-task.md file
    if (fs.existsSync(PATHS.activeTaskFile)) {
      try {
        const activeTaskContent = fs.readFileSync(PATHS.activeTaskFile, 'utf8');
        
        // Look for the Addendums section first
        const addendumSection = findSectionInActiveTask(activeTaskContent, "Addendums");
        let updatedActiveTaskContent;
        
        if (addendumSection.found) {
          // Try to find Improvement Suggestions subsection within Addendums
          const addendumContent = activeTaskContent.substring(addendumSection.startIndex, addendumSection.endIndex);
          const improvementSubsectionMatch = addendumContent.match(/### Improvement Suggestions\s*\n([\s\S]*?)(?=\n###|\n---|\n$)/i);
          
          if (improvementSubsectionMatch) {
            // Found the subsection within Addendums
            const fullContent = improvementSubsectionMatch[0];
            const sectionContent = improvementSubsectionMatch[1].trim();
            const startOfSubsection = addendumSection.startIndex + improvementSubsectionMatch.index;
            const endOfSubsection = startOfSubsection + fullContent.length;
            
            // Check if section has "None" placeholder
            if (sectionContent === "None" || sectionContent === "None yet") {
              // Replace placeholder
              updatedActiveTaskContent = activeTaskContent.substring(0, startOfSubsection) + 
                `### Improvement Suggestions\n${formattedEntry}\n\n` + 
                activeTaskContent.substring(endOfSubsection);
            } else {
              // Add to existing content
              updatedActiveTaskContent = activeTaskContent.substring(0, startOfSubsection) + 
                `### Improvement Suggestions\n${sectionContent}\n${formattedEntry}\n\n` + 
                activeTaskContent.substring(endOfSubsection);
            }
          } else {
            // Improvement Suggestions subsection not found
            // Look for New Dependencies subsection to add after it
            const dependenciesSubsectionMatch = addendumContent.match(/### New Dependencies\s*\n([\s\S]*?)(?=\n###|\n---|\n$)/i);
            
            if (dependenciesSubsectionMatch) {
              // Found Dependencies subsection, add Improvement Suggestions after it
              const fullContent = dependenciesSubsectionMatch[0];
              const startOfSubsection = addendumSection.startIndex + dependenciesSubsectionMatch.index;
              const endOfSubsection = startOfSubsection + fullContent.length;
              
              updatedActiveTaskContent = activeTaskContent.substring(0, endOfSubsection) + 
                `\n### Improvement Suggestions\n${formattedEntry}\n\n` + 
                activeTaskContent.substring(endOfSubsection);
            } else {
              // No Dependencies subsection either, add after Addendums header
              const addendumHeaderEnd = addendumSection.startIndex + activeTaskContent.substring(addendumSection.startIndex).indexOf("\n") + 1;
              
              updatedActiveTaskContent = activeTaskContent.substring(0, addendumHeaderEnd) + 
                `\n### Improvement Suggestions\n${formattedEntry}\n\n` + 
                activeTaskContent.substring(addendumHeaderEnd);
            }
          }
        } else {
          // Addendums section not found, directly check for Improvement Suggestions
          const improvementSection = findSectionInActiveTask(activeTaskContent, "Improvement Suggestions");
          
          if (improvementSection.found) {
            // Improvement Suggestions section exists outside of Addendums
            const sectionContent = improvementSection.content.trim();
            
            // Check if section has "None" placeholder
            if (sectionContent === "None" || sectionContent === "None yet") {
              // Replace placeholder
              const beforeSection = activeTaskContent.substring(0, improvementSection.startIndex);
              const afterSection = activeTaskContent.substring(improvementSection.endIndex);
              
              // Determine if it's a main section (##) or subsection (###)
              const isSectionStartWithTripleHash = activeTaskContent.substring(improvementSection.startIndex, improvementSection.startIndex + 4) === '### ';
              const headerPrefix = isSectionStartWithTripleHash ? '### ' : '## ';
              
              updatedActiveTaskContent = beforeSection + 
                `${headerPrefix}Improvement Suggestions\n${formattedEntry}\n\n` + 
                afterSection;
            } else {
              // Add to existing content using standard update
              updatedActiveTaskContent = updateSectionInActiveTask(
                activeTaskContent,
                "Improvement Suggestions",
                formattedEntry
              );
            }
          } else {
            // Check for New Dependencies to place after it
            const dependenciesSection = findSectionInActiveTask(activeTaskContent, "New Dependencies");
            
            if (dependenciesSection.found) {
              // Add after Dependencies section
              updatedActiveTaskContent = activeTaskContent.substring(0, dependenciesSection.endIndex) + 
                `\n### Improvement Suggestions\n${formattedEntry}\n\n` + 
                activeTaskContent.substring(dependenciesSection.endIndex);
            } else {
              // Create Addendums with Improvement Suggestions
              // Try to find a good place to insert - before Next Steps or at end of file
              const nextStepsSection = findSectionInActiveTask(activeTaskContent, "Next Steps");
              
              if (nextStepsSection.found) {
                // Insert before Next Steps
                updatedActiveTaskContent = activeTaskContent.substring(0, nextStepsSection.startIndex) + 
                  `## Addendums\n\n### Improvement Suggestions\n${formattedEntry}\n\n` + 
                  activeTaskContent.substring(nextStepsSection.startIndex);
              } else {
                // Append to the end of the file
                updatedActiveTaskContent = activeTaskContent + 
                  `\n\n## Addendums\n\n### Improvement Suggestions\n${formattedEntry}\n`;
              }
            }
          }
        }
        
        // Write the updated content back to the file
        fs.writeFileSync(PATHS.activeTaskFile, updatedActiveTaskContent);
        console.log(`Updated Improvement Suggestions in active-task.md: ${suggestion}`);
      } catch (error) {
        console.error('Error updating active-task.md:', error);
      }
    } else {
      console.warn('active-task.md not found, could not update Improvement Suggestion');
    }
    
    // Rest of the function - handling improvement tracking file - remains unchanged
    
    // Parse the suggestion to extract structured information
    let description = suggestion;
    let rationale = 'Provides additional functionality or improvement';
    let implementation = 'Implementation details not specified';
    let priority = 'Medium';
    let effort = 'Medium';
    
    // Extract structured information if provided in a specific format
    const descriptionMatch = suggestion.match(/Description:\s*(.*?)(?=Rationale:|$)/s);
    const rationaleMatch = suggestion.match(/Rationale:\s*(.*?)(?=Implementation:|$)/s);
    const implementationMatch = suggestion.match(/Implementation:\s*(.*?)(?=Priority:|$)/s);
    const priorityMatch = suggestion.match(/Priority:\s*(.*?)(?=Effort:|$)/s);
    const effortMatch = suggestion.match(/Effort:\s*(.*?)(?=$)/s);
    
    if (descriptionMatch) description = descriptionMatch[1].trim();
    if (rationaleMatch) rationale = rationaleMatch[1].trim();
    if (implementationMatch) implementation = implementationMatch[1].trim();
    if (priorityMatch) priority = priorityMatch[1].trim();
    if (effortMatch) effort = effortMatch[1].trim();
    
    // Use template with replacements
    const replacements = {
      TIMESTAMP: timestamp,
      TASK_ID: taskId,
      DESCRIPTION: description,
      RATIONALE: rationale,
      IMPLEMENTATION: implementation,
      PRIORITY: priority,
      EFFORT: effort
    };
    
    // Log to improvement tracking file
    try {
      // Process template if it exists
      let improvementContent = '';
      
      if (fs.existsSync(PATHS.templates.improvement)) {
        const template = fs.readFileSync(PATHS.templates.improvement, 'utf8');
        improvementContent = processTemplate(template, replacements);
      } else {
        // Fallback if template doesn't exist
        improvementContent = `## [${timestamp}] Improvement for ${taskId}

### Description
${description}

### Rationale
${rationale}

### Implementation
${implementation}

### Priority
${priority}

### Effort
${effort}

---

`;
      }
      
      // Create the directory structure if it doesn't exist
      const dirPath = path.dirname(PATHS.improvementFile);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      // Append to the improvement file
      if (fs.existsSync(PATHS.improvementFile)) {
        // File exists, append to it
        // Extract header if present
        const existingContent = fs.readFileSync(PATHS.improvementFile, 'utf8');
        const headerMatch = existingContent.match(/^(# Improvement Suggestions\s*\n\s*This file contains.*?\n\n)/s);
        const header = headerMatch ? headerMatch[1] : '';
        
        // Remove header from existing content
        const contentWithoutHeader = headerMatch 
          ? existingContent.substring(headerMatch[0].length) 
          : existingContent;
        
        // Write with header preserved
        fs.writeFileSync(PATHS.improvementFile, header + improvementContent + contentWithoutHeader);
      } else {
        // Create the file
        const header = `# Improvement Suggestions\n\nThis file contains improvement suggestions discovered during implementation.\n\n`;
        fs.writeFileSync(PATHS.improvementFile, header + improvementContent);
      }
      
      console.log(`Improvement logged to ${PATHS.improvementFile}`);
    } catch (error) {
      console.error('Error logging to improvement file:', error);
    }
    
    // REMOVED: Don't add as a micro-action to avoid updating Recent Actions
    
    return true;
  } catch (error) {
    console.error('Error in logImprovement:', error);
    return false;
  }
}

/**
 * Logs a dependency discovery to active-task.md and dependency tracking file
 * @param {string} taskId - ID of the current task
 * @param {string} dependencySpec - Detailed description of the dependency
 * @returns {boolean} - Success status
 */
function logDependencyDiscovery(taskId, dependencySpec) {
  try {
    if (!taskId || !dependencySpec) {
      console.error('Task ID and dependency specification are required');
      return false;
    }
    
    console.log(`Logging dependency for task ${taskId}: ${dependencySpec}`);
    
    // Format the dependency entry
    const timestamp = formatTimestamp();
    const formattedEntry = `- [${timestamp}] Dependency: ${dependencySpec}`;
    
    // Update the active-task.md file
    if (fs.existsSync(PATHS.activeTaskFile)) {
      try {
        const activeTaskContent = fs.readFileSync(PATHS.activeTaskFile, 'utf8');
        
        // Look for the Addendums section first
        const addendumSection = findSectionInActiveTask(activeTaskContent, "Addendums");
        let updatedActiveTaskContent;
        
        if (addendumSection.found) {
          // Try to find New Dependencies subsection within Addendums
          const addendumContent = activeTaskContent.substring(addendumSection.startIndex, addendumSection.endIndex);
          const dependencySubsectionMatch = addendumContent.match(/### New Dependencies\s*\n([\s\S]*?)(?=\n###|\n---|\n$)/i);
          
          if (dependencySubsectionMatch) {
            // Found the subsection within Addendums
            const fullContent = dependencySubsectionMatch[0];
            const sectionContent = dependencySubsectionMatch[1].trim();
            const startOfSubsection = addendumSection.startIndex + dependencySubsectionMatch.index;
            const endOfSubsection = startOfSubsection + fullContent.length;
            
            // Check if section has "None" placeholder
            if (sectionContent === "None" || sectionContent === "None yet") {
              // Replace placeholder
              updatedActiveTaskContent = activeTaskContent.substring(0, startOfSubsection) + 
                `### New Dependencies\n${formattedEntry}\n\n` + 
                activeTaskContent.substring(endOfSubsection);
            } else {
              // Add to existing content
              updatedActiveTaskContent = activeTaskContent.substring(0, startOfSubsection) + 
                `### New Dependencies\n${sectionContent}\n${formattedEntry}\n\n` + 
                activeTaskContent.substring(endOfSubsection);
            }
          } else {
            // New Dependencies subsection not found, create it within Addendums
            // Find where to insert the new subsection (right after the Addendums header)
            const addendumHeaderEnd = addendumSection.startIndex + activeTaskContent.substring(addendumSection.startIndex).indexOf("\n") + 1;
            
            updatedActiveTaskContent = activeTaskContent.substring(0, addendumHeaderEnd) + 
              `\n### New Dependencies\n${formattedEntry}\n\n` + 
              activeTaskContent.substring(addendumHeaderEnd);
          }
        } else {
          // Addendums section not found, directly check for New Dependencies
          const dependenciesSection = findSectionInActiveTask(activeTaskContent, "New Dependencies");
          
          if (dependenciesSection.found) {
            // New Dependencies section exists outside of Addendums
            const sectionContent = dependenciesSection.content.trim();
            
            // Check if section has "None" placeholder
            if (sectionContent === "None" || sectionContent === "None yet") {
              // Replace placeholder
              const beforeSection = activeTaskContent.substring(0, dependenciesSection.startIndex);
              const afterSection = activeTaskContent.substring(dependenciesSection.endIndex);
              
              // Determine if it's a main section (##) or subsection (###)
              const isSectionStartWithTripleHash = activeTaskContent.substring(dependenciesSection.startIndex, dependenciesSection.startIndex + 4) === '### ';
              const headerPrefix = isSectionStartWithTripleHash ? '### ' : '## ';
              
              updatedActiveTaskContent = beforeSection + 
                `${headerPrefix}New Dependencies\n${formattedEntry}\n\n` + 
                afterSection;
            } else {
              // Add to existing content using standard update
              updatedActiveTaskContent = updateSectionInActiveTask(
                activeTaskContent,
                "New Dependencies",
                formattedEntry
              );
            }
          } else {
            // Neither Addendums nor New Dependencies sections exist
            // Create Addendums section with New Dependencies subsection
            
            // Try to find a good place to insert - before Next Steps or at end of file
            const nextStepsSection = findSectionInActiveTask(activeTaskContent, "Next Steps");
            
            if (nextStepsSection.found) {
              // Insert before Next Steps
              updatedActiveTaskContent = activeTaskContent.substring(0, nextStepsSection.startIndex) + 
                `## Addendums\n\n### New Dependencies\n${formattedEntry}\n\n` + 
                activeTaskContent.substring(nextStepsSection.startIndex);
            } else {
              // Append to the end of the file
              updatedActiveTaskContent = activeTaskContent + 
                `\n\n## Addendums\n\n### New Dependencies\n${formattedEntry}\n`;
            }
          }
        }
        
        // Write the updated content back to the file
        fs.writeFileSync(PATHS.activeTaskFile, updatedActiveTaskContent);
        console.log(`Updated New Dependencies in active-task.md: ${dependencySpec}`);
      } catch (error) {
        console.error('Error updating active-task.md:', error);
      }
    } else {
      console.warn('active-task.md not found, could not update Dependencies');
    }
    
    // Rest of the function remains unchanged - dependencies file logging
    
    // Also log to dependency tracking file
    try {
      // Create the directory structure if it doesn't exist
      const dirPath = path.join(__dirname, '../live-change-requests');
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      const dependencyContent = `## [${timestamp}] Dependency for ${taskId}

### Description
${dependencySpec}

### Blocking
Yes

### Affected Tasks
- ${taskId}

### Proposed Implementation
New task required to implement this dependency.

---

`;
      
      // Append to the dependency file
      const liveSpecDiscoveryFile = PATHS.liveSpecDiscoveryFile;
      if (fs.existsSync(liveSpecDiscoveryFile)) {
        // File exists, append to it
        // Extract header if present
        const existingContent = fs.readFileSync(liveSpecDiscoveryFile, 'utf8');
        const headerMatch = existingContent.match(/^(# Live Specification Discoveries\s*\n\s*This file documents.*?\n\n)/s);
        const header = headerMatch ? headerMatch[1] : '';
        
        // Remove header from existing content
        const contentWithoutHeader = headerMatch 
          ? existingContent.substring(headerMatch[0].length) 
          : existingContent;
        
        // Write with header preserved
        fs.writeFileSync(liveSpecDiscoveryFile, header + dependencyContent + contentWithoutHeader);
      } else {
        // Create the file
        const header = `# Live Specification Discoveries\n\nThis file documents dependencies or specifications discovered during implementation.\n\n`;
        fs.writeFileSync(liveSpecDiscoveryFile, header + dependencyContent);
      }
      
      console.log(`Dependency logged to ${liveSpecDiscoveryFile}`);
    } catch (error) {
      console.error('Error logging to dependency file:', error);
    }
    
    // REMOVED: Don't add as a micro-action to avoid updating Recent Actions
    
    return true;
  } catch (error) {
    console.error('Error in logDependencyDiscovery:', error);
    return false;
  }
}

// Get current task and element from progress.md
function getCurrentTask() {
  // Read progress file
  const progress = fs.readFileSync(PATHS.progressFile, 'utf8');
  
  // Get current focus
  const currentFocusRegex = /## Current Focus\n([\s\S]*?)(?=\n## |$)/g;
  const currentFocusMatch = currentFocusRegex.exec(progress);
  
  if (!currentFocusMatch) {
    return { taskId: null, elementId: null, description: 'No current task found' };
  }
  
  // Parse current focus text
  const focusText = currentFocusMatch[1];
  const taskMatch = focusText.match(/T-[\d\.]+/);
  const elementMatch = focusText.match(/[T-[\d\.]+:ELE-\d+/);
  
  return {
    taskId: taskMatch ? taskMatch[0] : null,
    elementId: elementMatch ? elementMatch[0] : null,
    description: focusText
  };
}

// Get current status from progress file with improved regex handling
async function getStatus() {
  try {
    // Check if progress file exists
    const progressFilePath = path.join(process.cwd(), 'core', 'progress.md');
    if (!fs.existsSync(progressFilePath)) {
      return 'No progress file found. Run initialization first.';
    }
    
    // Read progress file
    const progressContent = fs.readFileSync(progressFilePath, 'utf8');
    
    // Debug information about the file
    console.log(`Progress file read. Size: ${progressContent.length} characters`);
    
    // Check if the text exists at all
    if (!progressContent.includes('## Current Focus')) {
      console.log('Could not find "## Current Focus" text in the file at all.');
      
      // Look for something similar
      const headings = progressContent.match(/##\s+[^\n\r]+/g) || [];
      console.log('Found these headings:');
      headings.slice(0, 10).forEach(h => console.log(`- ${h}`));
      
      return 'The "## Current Focus" section does not exist in the progress file.';
    }
    
    // Extract current focus section with improved regex for different line endings
    // This handles both \n and \r\n line endings and allows whitespace after the heading
    const currentFocusMatch = progressContent.match(/## Current Focus\s*[\r\n]+([\s\S]*?)(?=[\r\n]+##\s+|$)/);
    
    if (!currentFocusMatch) {
      console.log('Found "## Current Focus" text but regex match failed.');
      
      // Extract content around the heading for debugging
      const focusIndex = progressContent.indexOf('## Current Focus');
      const contextBefore = progressContent.substring(Math.max(0, focusIndex - 50), focusIndex);
      const contextAfter = progressContent.substring(focusIndex, focusIndex + 200);
      
      console.log('Context around the heading:');
      console.log('---BEFORE---');
      console.log(contextBefore);
      console.log('---HEADING AND AFTER---');
      console.log(contextAfter);
      console.log('---END---');
      
      return 'Found "## Current Focus" in the file but could not extract its content. Check console for details.';
    }
    
    console.log('Successfully found "## Current Focus" section.');
    
    // Extract project statistics
    const statsMatch = progressContent.match(/## Project Statistics\s*[\r\n]+([\s\S]*?)(?=[\r\n]+##\s+|$)/);
    const statsText = statsMatch ? statsMatch[1].trim() : 'No statistics available';
    
    // Format the status information
    const status = `
=== CURRENT TASK STATUS ===
${currentFocusMatch[1].trim()}

=== PROJECT STATISTICS ===
${statsText}

Last Updated: ${formatTimestamp()}
`;
    
    return status;
  } catch (error) {
    console.error('Error getting status:', error);
    return `Error getting status: ${error.message}`;
  }
}

// Update element status with more flexible pattern matching
async function updateElementStatus(elementId, status) {
  try {
    if (!elementId || !status) {
      throw new Error('Element ID and status are required');
    }
    
    console.log(`Updating element ${elementId} status to: ${status}`);
    
    // Parse the element ID to get task ID
    const taskIdMatch = elementId.match(/^(T-[\d\.]+):/);
    if (!taskIdMatch) {
      throw new Error(`Invalid element ID format: ${elementId}`);
    }
    
    const taskId = taskIdMatch[1];
    console.log(`Associated task ID: ${taskId}`);
    
    // Validate status value
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
      console.log(`Warning: Unrecognized status "${status}". Valid statuses are: ${validStatuses.join(', ')}`);
    }
    
    // Get current timestamp
    const timestamp = formatTimestamp();
    
    // Read progress file and update Current Focus section
    const progressFilePath = path.join(process.cwd(), 'core', 'progress.md');
    if (!fs.existsSync(progressFilePath)) {
      throw new Error('Progress file not found. Run initialization first.');
    }
    
    let progressContent = fs.readFileSync(progressFilePath, 'utf8');
    console.log(`Progress file loaded, size: ${progressContent.length} characters`);
    
    // Update the Current Focus section in progress.md
    const currentFocusRegex = /## Current Focus\s*[\r\n]+([\s\S]*?)(?=[\r\n]+##\s+|$)/;
    const focusReplacement = `## Current Focus\n\nTask: ${taskId}\nElement: ${elementId}\nStatus: ${status}\nUpdated: ${timestamp}\n`;
    
    if (progressContent.match(currentFocusRegex)) {
      progressContent = progressContent.replace(currentFocusRegex, focusReplacement);
    } else {
      // Add section if it doesn't exist
      const headerEndIndex = progressContent.indexOf('\n\n');
      if (headerEndIndex !== -1) {
        progressContent = 
          progressContent.substring(0, headerEndIndex + 2) + 
          focusReplacement + '\n' + 
          progressContent.substring(headerEndIndex + 2);
      } else {
        progressContent = focusReplacement + '\n' + progressContent;
      }
    }
    
    // Write the updated content back to progress.md
    fs.writeFileSync(progressFilePath, progressContent);
    console.log(`Updated Current Focus section in progress.md`);
    
    // Also update the element in the task list section of progress.md
    await updateProgressFile(taskId, elementId, status);
    console.log(`Updated element in task list section of progress.md`);
    
    // Now update active-task.md
    const activeTaskPath = path.join(process.cwd(), 'core', 'active-task.md');
    if (!fs.existsSync(activeTaskPath)) {
      throw new Error('Active task file not found. Run start-task first.');
    }
    
    let activeTaskContent = fs.readFileSync(activeTaskPath, 'utf8');
    
    // Define checkbox values based on status
    let checkboxValue;
    switch (status) {
      case 'Not Started':
        checkboxValue = '[ ]';
        break;
      case 'In Progress':
        checkboxValue = '[-]';
        break;
      case 'Unit Testing':
        checkboxValue = '[y]';
        break;
      case 'Complete':
        checkboxValue = '[x]';
        break;
      case 'Complete - Unit Test Successful':
        checkboxValue = '[x]';
        break;
      case 'Complete - Unit Test Incomplete':
        checkboxValue = '[z]';
        break;
      case 'Abandoned':
        checkboxValue = '[a]';
        break;
      default:
        checkboxValue = '[ ]';
        break;
    }
    
    // Status indicator format
    const statusIndicator = status === 'Not Started' 
      ? '' 
      : ` (Status: ${status}, Updated: ${timestamp})`;
    
    // 1. Update Components/Elements section
    const elementsRegex = /## Components\/Elements\s*\n([\s\S]*?)(?=\n## |$)/;
    const elementsMatch = activeTaskContent.match(elementsRegex);
    
    if (elementsMatch) {
      const elementsSection = elementsMatch[0];
      const elementLines = elementsSection.split('\n');
      
      // Look for the specific element line
      let updatedLines = [];
      let elementFound = false;
      
      for (let i = 0; i < elementLines.length; i++) {
        const line = elementLines[i];
        
        // Check if the line contains the element ID and has a checkbox format
        if (line.includes(elementId) && line.includes('[') && line.includes(']')) {
          // Found the element line
          elementFound = true;
          
          // Remove existing status indicator if present
          const cleanedLine = line.replace(/\(Status:[^\)]*\)/, '').trim();
          
          // Capture the original indentation (whitespace at the beginning of the line)
          const indentMatch = line.match(/^(\s*)/);
          const indentation = indentMatch ? indentMatch[1] : '';
          
          // Get the checkbox position
          const checkboxStart = cleanedLine.indexOf('[');
          const checkboxEnd = cleanedLine.indexOf(']') + 1;
          
          // Get the content after the checkbox but before any status indicator
          const afterCheckbox = cleanedLine.substring(checkboxEnd).trim();
          
          // Rebuild the line with the same indentation but updated checkbox and status
          updatedLines.push(`${indentation}- ${checkboxValue} ${afterCheckbox}${statusIndicator}`);
        } else {
          updatedLines.push(line);
        }
      }
      
      // If element wasn't found, log warning but continue with other updates
      if (!elementFound) {
        console.log(`WARNING: Element ${elementId} not found in Components/Elements section`);
      } else {
        // Update the entire elements section
        const updatedElementsSection = updatedLines.join('\n');
        activeTaskContent = activeTaskContent.replace(elementsSection, updatedElementsSection);
        console.log(`Updated element status in Components/Elements section`);
      }
    } else {
      console.log(`WARNING: Components/Elements section not found in active-task.md`);
    }
    
    // 2. Update Current Element section
    const currentElementRegex = /## Current Element\s*\n([\s\S]*?)(?=\n## |$)/;
    const currentElementMatch = activeTaskContent.match(currentElementRegex);
    
    // Try to find the element description from the Components/Elements section
    let elementDescription = '';
    
    // Instead of using regex, scan through the element lines to find the description
    const allLines = activeTaskContent.split('\n');
    for (const line of allLines) {
      if ((line.match(/^\s*- \[.?\]/) || line.match(/^\s+- \[.?\]/)) && line.includes(elementId + ':')) {
        // Extract description after the colon
        const colonIndex = line.indexOf(':');
        const statusIndex = line.indexOf('(Status:');
        if (colonIndex !== -1) {
          if (statusIndex !== -1) {
            elementDescription = line.substring(colonIndex + 1, statusIndex).trim();
          } else {
            elementDescription = line.substring(colonIndex + 1).trim();
          }
          break;
        }
      }
    }
    
    // Fallback if description not found
    if (!elementDescription) {
      elementDescription = elementId.split(':')[1] || 'No description available';
    }
    
    const newCurrentElementContent = `## Current Element
- Element ID: ${elementId}
- Description: ${elementDescription}
- Status: ${status}
- Updated: ${timestamp}

`;
    
    if (currentElementMatch) {
      activeTaskContent = activeTaskContent.replace(currentElementMatch[0], newCurrentElementContent);
      console.log(`Updated Current Element section`);
    } else {
      console.log(`WARNING: Current Element section not found in active-task.md`);
    }
    
    // 3. Update Current Implementation Focus section
    const implementationFocusRegex = /## Current Implementation Focus\s*\n([\s\S]*?)(?=\n## |$)/;
    const implementationFocusMatch = activeTaskContent.match(implementationFocusRegex);
    
    const newFocusContent = `## Current Implementation Focus
Currently: Working on ${elementId}
Phase: Implementing
Step: ${status}
Current Element: ${elementId}

`;
    
    if (implementationFocusMatch) {
      activeTaskContent = activeTaskContent.replace(implementationFocusMatch[0], newFocusContent);
      console.log(`Updated Current Implementation Focus section`);
    } else {
      console.log(`WARNING: Current Implementation Focus section not found in active-task.md`);
    }
    
    // 4. Update Task Information section (Last Updated timestamp)
    const taskInfoRegex = /(## Task Information\s*\n[\s\S]*?Last Updated:) .*/;
    const lastUpdatedMatch = activeTaskContent.match(taskInfoRegex);
    
    if (lastUpdatedMatch) {
      activeTaskContent = activeTaskContent.replace(lastUpdatedMatch[0], `${lastUpdatedMatch[1]} ${timestamp}`);
      console.log(`Updated Last Updated timestamp in Task Information section`);
    } else {
      console.log(`WARNING: Last Updated timestamp not found in Task Information section`);
    }
    
    // Write updated content to active-task.md
    fs.writeFileSync(activeTaskPath, activeTaskContent);
    
    // Log to implementation log
    await appendToTaskLog(taskId, `Updated element ${elementId} status to "${status}"`);
    
    console.log(`Element ${elementId} status updated to "${status}" successfully`);
    return true;
  } catch (error) {
    console.error(`Error updating element status: ${error.message}`);
    throw error;
  }
}

/**
 * Appends content to the task implementation log
 * @param {string} taskId - The ID of the task
 * @param {string} content - The content to append
 * @returns {Promise<boolean>} - Success status
 */
async function appendToTaskLog(taskId, content) {
  try {
    if (!taskId) {
      console.error('Task ID is required for appending to task log');
      return false;
    }
    
    if (!content || typeof content !== 'string') {
      console.error('Content is required and must be a string');
      return false;
    }
    
    const taskLogPath = path.join(process.cwd(), 'core', 'task-implementation-log.md');
    
    // Create file if it doesn't exist
    if (!fs.existsSync(taskLogPath)) {
      fs.writeFileSync(
        taskLogPath, 
        `# Task Implementation Log\n\nThis file contains the complete implementation history of all tasks.\n\n`
      );
      console.log('Created task implementation log file');
    }
    
    // Format the content with clear section headings
    const timestamp = formatTimestamp();
    const formattedContent = `\n\n## Task ${taskId} - ${timestamp}\n\n${content}`;
    
    // Append to the log file
    fs.appendFileSync(taskLogPath, formattedContent);
    console.log(`Appended content for task ${taskId} to implementation log`);
    
    return true;
  } catch (error) {
    console.error('Error appending to task log:', error);
    return false;
  }
}

/**
 * Logs an error to active-task.md and implementation log
 * @param {string} errorDescription - Description of the error
 * @param {number} severity - Severity rating (1-10)
 * @returns {Promise<boolean>} - Success status
 */
async function logError(errorDescription, severity) {
  try {
    if (!errorDescription) {
      console.error('Error description is required');
      return false;
    }
    
    // Validate severity
    const severityValue = parseInt(severity) || 5;
    if (severityValue < 1 || severityValue > 10) {
      console.warn('Severity should be between 1-10, defaulting to 5');
    }
    
    console.log(`Logging error: ${errorDescription} (Severity: ${severityValue}/10)`);
    
    // Format the error entry
    const formattedEntry = formatTimestampedEntry(errorDescription, {
      severity: severityValue
    });
    
    // Update the active-task.md file
    if (fs.existsSync(PATHS.activeTaskFile)) {
      try {
        const activeTaskContent = fs.readFileSync(PATHS.activeTaskFile, 'utf8');
        
        // Find the Errors Encountered section
        const section = findSectionInActiveTask(activeTaskContent, "Errors Encountered");
        
        let updatedActiveTaskContent;
        
        if (section.found) {
          // Determine if it's a main section (##) or subsection (###)
          const isSectionStartWithTripleHash = activeTaskContent.substring(section.startIndex, section.startIndex + 4) === '### ';
          const headerPrefix = isSectionStartWithTripleHash ? '### ' : '## ';
          
          // Get the section content as it appears in the file (not just the trimmed content)
          const fullSectionContent = activeTaskContent.substring(section.startIndex, section.endIndex);
          
          // Check explicitly for "None yet" text anywhere in the section
          if (fullSectionContent.includes("None yet")) {
            // Extract the section text before and after the "None yet" text
            const beforeNoneYet = fullSectionContent.substring(0, fullSectionContent.indexOf("None yet"));
            const afterNoneYet = fullSectionContent.substring(fullSectionContent.indexOf("None yet") + "None yet".length);
            
            // Rebuild the section without the "None yet" text
            const newSectionContent = beforeNoneYet + formattedEntry + afterNoneYet;
            
            // Replace the entire section in the file content
            updatedActiveTaskContent = activeTaskContent.substring(0, section.startIndex) + 
              newSectionContent + 
              activeTaskContent.substring(section.endIndex);
          } else {
            // If no "None yet" placeholder, use the standard section update function
            updatedActiveTaskContent = updateSectionInActiveTask(
              activeTaskContent,
              "Errors Encountered",
              formattedEntry
            );
          }
        } else {
          // If section doesn't exist, create it
          updatedActiveTaskContent = updateSectionInActiveTask(
            activeTaskContent,
            "Errors Encountered",
            formattedEntry
          );
        }
        
        // Write the updated content back to the file
        fs.writeFileSync(PATHS.activeTaskFile, updatedActiveTaskContent);
        console.log(`Updated Errors Encountered in active-task.md: ${errorDescription}`);
      } catch (error) {
        console.error('Error updating active-task.md:', error);
        return false;
      }
    } else {
      console.warn('active-task.md not found, could not update Errors Encountered');
      return false;
    }
    
    // Get current task
    try {
      const currentTask = await getCurrentTask();
      
      // Also append to the implementation log if we have a current task
      if (currentTask && currentTask.taskId) {
        await appendToTaskLog(
          currentTask.taskId,
          `### New Error\n${formattedEntry}`
        );
      }
    } catch (error) {
      console.error('Error getting current task:', error);
      // Continue even if this fails
    }
    
    // REMOVED: Don't add as a micro-action to avoid updating Recent Actions
    
    return true;
  } catch (error) {
    console.error('Error in logError:', error);
    return false;
  }
}

/**
 * Updates the Notes section in active-task.md
 * @param {string} noteText - The note to add
 * @returns {Promise<boolean>} - Success status
 */
async function updateNotes(noteText) {
  try {
    if (!noteText) {
      console.error('Note text is required');
      return false;
    }
    
    console.log(`Adding note: "${noteText}"`);
    
    // Format the note entry
    const formattedEntry = formatTimestampedEntry(noteText);
    
    // Update the active-task.md file
    if (fs.existsSync(PATHS.activeTaskFile)) {
      try {
        const activeTaskContent = fs.readFileSync(PATHS.activeTaskFile, 'utf8');
        const updatedActiveTaskContent = updateSectionInActiveTask(
          activeTaskContent,
          'Notes',
          formattedEntry
        );
        
        // Write the updated content back to the file
        fs.writeFileSync(PATHS.activeTaskFile, updatedActiveTaskContent);
        console.log(`Updated Notes in active-task.md with: ${noteText}`);
      } catch (error) {
        console.error('Error updating active-task.md:', error);
        return false;
      }
    } else {
      console.warn('active-task.md not found, could not update Notes');
      return false;
    }
    
    // Get current task
    try {
      const currentTask = await getCurrentTask();
      
      // Also append to the implementation log if we have a current task
      if (currentTask && currentTask.taskId) {
        await appendToTaskLog(
          currentTask.taskId,
          `### New Note\n${formattedEntry}`
        );
      }
    } catch (error) {
      console.error('Error getting current task:', error);
      // Continue even if this fails
    }
    
    // REMOVED: Don't add as a micro-action to avoid updating Recent Actions
    
    return true;
  } catch (error) {
    console.error('Error in updateNotes:', error);
    return false;
  }
}

/**
 * Updates the Implementation Phase status in the active task file
 * @param {string} phase - The phase to update (Preparation Phase, Implementation Phase, Validation Phase)
 * @param {number} lineNumber - The line number within the phase section to update 
 * @param {string} lineItemText - The exact text of the line item to update
 * @param {string} status - The status to set (e.g., "Not Started", "In Progress", "Complete")
 * @returns {Promise<{success: boolean, message: string}>} - Success status and message
 */
async function updateImplementationPhase(phase, lineNumber, lineItemText, status) {
  try {
    // Validate parameters
    if (!phase) {
      return { success: false, message: 'Phase is required' };
    }
    
    if (!lineNumber || isNaN(lineNumber)) {
      return { success: false, message: 'Line number is required and must be a number' };
    }
    
    if (!lineItemText) {
      return { success: false, message: 'Line item text is required' };
    }
    
    if (!status) {
      return { success: false, message: 'Status is required' };
    }
    
    // Validate phase value
    const validPhases = ['Preparation Phase', 'Implementation Phase', 'Validation Phase'];
    if (!validPhases.includes(phase)) {
      return { success: false, message: `Invalid phase: ${phase}. Must be one of: ${validPhases.join(', ')}` };
    }
    
    // Validate status
    const validStatusValues = ['Not Started', 'In Progress', 'Complete'];
    if (!validStatusValues.includes(status)) {
      return { success: false, message: `Invalid status: ${status}. Must be one of: ${validStatusValues.join(', ')}` };
    }

    // Check if active-task.md exists
    if (!fs.existsSync(PATHS.activeTaskFile)) {
      return { success: false, message: 'active-task.md not found. Please start a task first using start-task command.' };
    }
    
    // Read current active task file
    const activeTaskContent = fs.readFileSync(PATHS.activeTaskFile, 'utf8');
    
    // Get current task ID
    const currentTask = await getCurrentTask();
    const taskId = currentTask?.taskId || 'unknown';
    
    // Format timestamp
    const timestamp = formatTimestamp();
    
    // Determine the checkbox format based on status
    let checkbox = '[ ]'; // Default: Not Started
    if (status === 'In Progress') {
      checkbox = '[-]';
    } else if (status === 'Complete') {
      checkbox = '[x]';
    }
    
    // Format the status indicator to append to the line
    const statusIndicator = `(Status: ${status}, Updated: ${timestamp})`;
    
    // Find the specific phase section
    const phaseHeader = `### ${phase}`;
    const phaseRegex = new RegExp(`${phaseHeader}\\s*\\n([\\s\\S]*?)(?=\\n### |\\n## |$)`, 'g');
    const phaseMatch = phaseRegex.exec(activeTaskContent);
    
    // Variables to track if we found the phase and line item
    let phaseFound = false;
    let lineItemFound = false;
    let updatedActiveTaskContent = activeTaskContent;
    
    if (phaseMatch) {
      phaseFound = true;
      // Extract phase content
      const phaseContent = phaseMatch[1];
      
      // Split into lines for analysis
      const phaseLines = phaseContent.split('\n').filter(line => line.trim());
      
      // Find all task lines (those starting with "- ")
      const taskLines = phaseLines.filter(line => line.trim().startsWith('- '));
      
      // Check if the requested line number is valid
      if (lineNumber > taskLines.length) {
        return { 
          success: false, 
          message: `Line number ${lineNumber} is out of range. The ${phase} has only ${taskLines.length} items.` 
        };
      }
      
      // Find the target line (1-indexed in parameter, but 0-indexed in array)
      const targetLine = taskLines[lineNumber - 1];
      
      // Verify if the line content matches what was provided
      // Remove checkbox, status indicator, and trim to compare with provided text
      const lineWithoutStatus = targetLine.replace(/- \[[ x\-]\] /, '')
                                         .replace(/\(Status:.*\)/, '')
                                         .trim();
      
      const cleanedLineItemText = lineItemText.trim();
      
      // Check if the line text matches (case insensitive)
      const textMatches = lineWithoutStatus.toLowerCase() === cleanedLineItemText.toLowerCase();
      
      if (textMatches) {
        lineItemFound = true;
        
        // Create updated line with new checkbox and status
        const updatedLine = `- ${checkbox} ${cleanedLineItemText} ${statusIndicator}`;
        
        // Replace the line in the phase content
        const updatedPhaseContent = phaseContent.replace(targetLine, updatedLine);
        
        // Replace the phase section in the active task content
        updatedActiveTaskContent = activeTaskContent.replace(
          phaseMatch[0],
          `${phaseHeader}\n${updatedPhaseContent}`
        );
      } else {
        // Line number matched but text didn't match - search for text in other lines
        const matchingLineIndex = taskLines.findIndex(line => {
          const cleanedLine = line.replace(/- \[[ x\-]\] /, '')
                                .replace(/\(Status:.*\)/, '')
                                .trim()
                                .toLowerCase();
          return cleanedLine === cleanedLineItemText.toLowerCase();
        });
        
        if (matchingLineIndex !== -1) {
          lineItemFound = true;
          const matchingLine = taskLines[matchingLineIndex];
          
          // Create updated line with new checkbox and status
          const updatedLine = `- ${checkbox} ${cleanedLineItemText} ${statusIndicator}`;
          
          // Replace the matching line in the phase content
          const updatedPhaseContent = phaseContent.replace(matchingLine, updatedLine);
          
          // Replace the phase section in the active task content
          updatedActiveTaskContent = activeTaskContent.replace(
            phaseMatch[0],
            `${phaseHeader}\n${updatedPhaseContent}`
          );
          
          return { 
            success: true, 
            message: `Line text matched on line ${matchingLineIndex + 1} instead of specified line ${lineNumber}. Updated successfully.` 
          };
        }
        
        return { 
          success: false, 
          message: `Line ${lineNumber} found but content doesn't match "${cleanedLineItemText}". Found "${lineWithoutStatus}" instead.` 
        };
      }
    }
    
    if (!phaseFound) {
      return { success: false, message: `Phase "${phase}" not found in active-task.md.` };
    }
    
    if (!lineItemFound) {
      return { success: false, message: `Line item "${lineItemText}" not found in ${phase}.` };
    }
    
    // 1. Update Current Implementation Focus section
    const implFocusRegex = /## Current Implementation Focus\s*\n([\s\S]*?)(?=\n## |$)/;
    const implFocusMatch = implFocusRegex.exec(updatedActiveTaskContent);
    
    if (implFocusMatch) {
      const focusContent = implFocusMatch[1];
      
      // Format the focus update
      const focusUpdate = `- Phase: ${phase}\n- Step: ${lineItemText}\n- Status: ${status}\n- Updated: ${timestamp}`;
      
      // Replace the focus content
      updatedActiveTaskContent = updatedActiveTaskContent.replace(
        implFocusMatch[0],
        `## Current Implementation Focus\n${focusUpdate}\n\n`
      );
    }
    
    // 2. Update Task Information section - Last Updated timestamp
    const taskInfoRegex = /## Task Information\s*\n([\s\S]*?)(?=\n## |$)/;
    const taskInfoMatch = taskInfoRegex.exec(updatedActiveTaskContent);
    
    if (taskInfoMatch) {
      const taskInfoContent = taskInfoMatch[1];
      
      // Replace the last updated timestamp line
      const updatedTaskInfo = taskInfoContent.replace(
        /- Last Updated:.*$/m,
        `- Last Updated: ${timestamp}`
      );
      
      // Replace the task info section
      updatedActiveTaskContent = updatedActiveTaskContent.replace(
        taskInfoMatch[0],
        `## Task Information\n${updatedTaskInfo}\n`
      );
    }
    
    // Write the updated content to active-task.md
    fs.writeFileSync(PATHS.activeTaskFile, updatedActiveTaskContent);
    
    // Also append to the implementation log (external logging)
    await appendToTaskLog(
      taskId,
      `### Phase Update\n- Phase: ${phase}\n- Line: ${lineNumber}\n- Line Item: ${lineItemText}\n- Status: ${status}\n- Timestamp: ${timestamp}`
    );
    
    return { 
      success: true, 
      message: `Updated ${phase} line ${lineNumber} ("${lineItemText}") status to "${status}"` 
    };
  } catch (error) {
    console.error(`Error updating ${phase} line ${lineNumber}:`, error);
    return { 
      success: false, 
      message: `Error: ${error.message}` 
    };
  }
}

// Keep this function for backward compatibility, but route to the main function
async function updateImplementationPhaseWithLineItem(phase, lineNumber, lineItemText, status) {
  return await updateImplementationPhase(phase, lineNumber, lineItemText, status);
}

// Legacy function is fully deprecated and will always return an error
async function updateImplementationPhase_legacy(phase, status, note) {
  console.log('Legacy update phase function is deprecated');
  return { 
    success: false, 
    message: 'Legacy update-phase format is no longer supported. Please use the new format with line items.' 
  };
}

// This function is no longer needed since we don't need to handle duplicates in active-task.md
function removeDuplicateImplementationProcessSections(taskContext) {
  return taskContext; // No-op function kept for backward compatibility
}

// Complete element function
async function completeElement(elementId) {
  if (!elementId) {
    console.error('Element ID is required');
    return false;
  }

  try {
    // Update the element status to Complete - Unit Test Successful
    const statusUpdateResult = await updateElementStatus(elementId, 'Complete - Unit Test Successful');
    if (!statusUpdateResult) {
      console.error('Failed to update element status');
      return false;
    }

    // Parse the element ID to get task ID
    const taskIdMatch = elementId.match(/^(T-[\d\.]+):/);
    if (!taskIdMatch) {
      throw new Error(`Invalid element ID format: ${elementId}`);
    }
    
    const taskId = taskIdMatch[1];
    
    // Update the progress file
    await updateProgressFile(taskId, elementId);
    
    // Log to implementation log
    await appendToTaskLog(taskId, `Completed element ${elementId} with successful unit tests`);

    console.log(`Element ${elementId} completed successfully`);
    return true;
  } catch (error) {
    console.error('Error completing element:', error);
    return false;
  }
}

/**
 * Extract task details from the task breakdown content
 * @param {string} taskId - Task ID to extract
 * @param {string} taskBreakdownContent - Content of the task breakdown file
 * @returns {Object} - Task data
 */
function extractTaskDetails(taskId, taskBreakdownContent) {
    console.log(`Extracting details for task: ${taskId}`);
    
    // Improved regex to find the task section more reliably
    const taskRegex = new RegExp(`####\\s+${taskId}:[^#]*(?=\\n####\\s+T-|$)`, 'ms');
    const taskMatch = taskBreakdownContent.match(taskRegex);
    
    if (!taskMatch) {
        console.error(`Task ${taskId} not found in task breakdown file`);
        throw new Error(`Task ${taskId} not found in task breakdown file`);
    }

    const taskContent = taskMatch[0];
    // Get the exact first line as the full task title
    const fullTaskTitle = taskContent.split('\n')[0].replace(/^####\s+/, '').trim();
    
    console.log('Found task content:', fullTaskTitle);
    
    // Extract ALL metadata fields with detailed logging
    const frReference = extractMetadata(taskContent, 'FR Reference') || '';
    console.log('FR Reference:', frReference);
    
    const implementationLocation = extractMetadata(taskContent, 'Implementation Location') || '';
    console.log('Implementation Location:', implementationLocation);
    
    // Fix for Pattern vs. Patterns - try both formats
    let pattern = extractMetadata(taskContent, 'Pattern') || '';
    if (!pattern) {
        pattern = extractMetadata(taskContent, 'Patterns') || '';
    }
    console.log('Pattern:', pattern);
    
    const dependencies = extractMetadata(taskContent, 'Dependencies') || 'None';
    console.log('Dependencies:', dependencies);
    
    const estimatedHours = extractMetadata(taskContent, 'Estimated Hours') || 
                          extractMetadata(taskContent, 'Estimated Human Testing Hours') || '';
    console.log('Estimated Hours:', estimatedHours);
    
    const description = extractMetadata(taskContent, 'Description') || '';
    console.log('Description:', description ? 'Found' : 'Missing');
    
    // Extract Test Coverage Requirements section
    const testCoverageSection = extractTestCoverageRequirementsSection(taskContent);
    console.log('Test Coverage Requirements section:', testCoverageSection ? 'Found' : 'Missing');
    
    // Extract test-related metadata with detailed logging
    // First try from the main task section
    let testLocations = extractMetadata(taskContent, 'Test Location') || '';
    if (!testLocations) {
        testLocations = extractMetadata(taskContent, 'Test Locations') || '';
    }
    
    // If not found in main section, try to extract from Test Coverage Requirements section
    if (!testLocations && testCoverageSection) {
        testLocations = extractTestMetadata(testCoverageSection, 'Test Location');
    }
    console.log('Test Locations:', testLocations);
    
    // Similarly for Testing Tools
    let testingTools = extractMetadata(taskContent, 'Testing Tools') || '';
    if (!testingTools && testCoverageSection) {
        testingTools = extractTestMetadata(testCoverageSection, 'Testing Tools');
    }
    console.log('Testing Tools:', testingTools);
    
    // And for Test Coverage
    let testCoverage = extractMetadata(taskContent, 'Test Coverage Requirements') || '';
    if (!testCoverage) {
        testCoverage = extractMetadata(taskContent, 'Coverage Target') || '';
    }
    
    // If not found, try to extract from Test Coverage Requirements section
    if (!testCoverage && testCoverageSection) {
        testCoverage = extractTestMetadata(testCoverageSection, 'Coverage Target');
    }
    console.log('Test Coverage:', testCoverage);
    
    const completesComponent = extractMetadata(taskContent, 'Completes Component?') || '';
    console.log('Completes Component:', completesComponent);

    // Extract legacy code references using the improved extractSection function
    const legacyCodeSection = extractSection(taskContent, 'Legacy Code Location', false);
    console.log('Legacy code section extracted:', legacyCodeSection ? 'Found' : 'Missing');
    
    // Process legacy code references into structured format
    const legacyCodeFiles = {
        primary: [],
        supporting: [],
        details: []
    };

    if (legacyCodeSection && legacyCodeSection.trim()) {
        // Process each line in the legacy code section
        const lines = legacyCodeSection.split('\n');
        let currentSection = 'primary'; // Default to primary if no section specified
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Check for section headers - these start with a hyphen
            if (line.startsWith('- Primary') || 
                line.includes('Primary Configuration:') ||
                line.includes('Primary Files:') ||
                line.includes('Primary Components:') ||
                line.includes('Font Configuration:')) {
                currentSection = 'primary';
                continue;
            } else if (line.startsWith('- Theme') || 
                      line.startsWith('- Component') || 
                      line.startsWith('- Dark Mode') ||
                      line.startsWith('- Color System') ||
                      line.includes('Theme Implementation:') || 
                      line.includes('Component Usage:') || 
                      line.includes('Dark Mode Implementation:') ||
                      line.includes('Color System Structure:') ||
                      line.includes('Supporting Files:') ||
                      line.includes('Theme Integration:') ||
                      line.includes('Typography Scale:') ||
                      line.includes('Base Typography:') ||
                      line.includes('Component Typography:') ||
                      line.includes('Implementation Patterns:')) {
                currentSection = 'supporting';
                continue;
            } else if (line.includes('File Details:') ||
                      line.includes('Implementation Details:')) {
                currentSection = 'details';
                continue;
            }
            
            // Process file reference lines that start with a dash (bullet point)
            // or just lines that contain file paths
            if (line.startsWith('-') || line.includes('/') || line.includes('\\')) {
                // Remove leading dash if present
                const fileLine = line.startsWith('-') ? line.substring(1).trim() : line;
                
                // Add to the appropriate section
                if (currentSection === 'primary') {
                    legacyCodeFiles.primary.push(fileLine);
                } else if (currentSection === 'supporting') {
                    legacyCodeFiles.supporting.push(fileLine);
                } else if (currentSection === 'details') {
                    legacyCodeFiles.details.push(fileLine);
                }
            }
        }
    } else {
        console.log('No Legacy Code Location section found or it is empty');
    }
    
    console.log('Legacy code files extracted:', {
        primaryCount: legacyCodeFiles.primary.length,
        supportingCount: legacyCodeFiles.supporting.length,
        detailsCount: legacyCodeFiles.details.length
    });

    // Find related tasks with additional logging
    const relatedTasks = findRelatedTasks(taskId, taskBreakdownContent);
    console.log('Related tasks identified');

    // Look for Element Test Mapping section for elements and phases
    let elements = [];
    const elementMappingSection = findElementTestMappingSection(taskContent, taskId);
    
    if (elementMappingSection && elementMappingSection.trim()) {
        console.log('Found Element Test Mapping section');
        // Extract elements from Element Test Mapping section
        elements = extractElementsFromMapping(elementMappingSection, taskId);
        console.log(`Extracted ${elements.length} elements from Element Test Mapping section`);
    } else {
        // Fallback to traditional Components/Elements section
        elements = parseTaskElements(taskContent);
        console.log(`Found ${elements.length} elements from Components/Elements section`);
    }
    
    // Extract implementation phases with additional logging
    // First check if we can extract them from Element Test Mapping section
    let phases = {
        preparation: [],
        implementation: [],
        validation: []
    };
    
    if (elementMappingSection && elementMappingSection.trim() && elements.length > 0) {
        // Extract phases from Element Test Mapping entries
        phases = extractPhasesFromElementMapping(elementMappingSection);
        console.log(`Extracted phases from Element Test Mapping: P:${phases.preparation.length}, I:${phases.implementation.length}, V:${phases.validation.length}`);
    } else {
        // Fallback to traditional Implementation Process section
        phases = parseImplementationPhases(taskContent);
        console.log(`Extracted phases from Implementation Process: P:${phases.preparation.length}, I:${phases.implementation.length}, V:${phases.validation.length}`);
    }
    
    // Extract testing infrastructure details
    const testingInfrastructure = extractTestingInfrastructure(taskContent, phases.validation);
    console.log('Testing infrastructure extracted');

    return {
        taskId,
        fullTaskTitle,
        description,
        frReference,
        implementationLocation,
        pattern,
        dependencies,
        estimatedHours,
        testLocations,
        testingTools,
        testCoverage,
        completesComponent,
        legacyCodeFiles,
        elements,
        preparationPhase: phases.preparation,
        implementationPhase: phases.implementation,
        validationPhase: phases.validation,
        testingInfrastructure,
        relatedTasks
    };
}

/**
 * Extract the Test Coverage Requirements section from task content
 * @param {string} taskContent - Task content
 * @returns {string} - Test Coverage Requirements section or empty string
 */
function extractTestCoverageRequirementsSection(taskContent) {
    // Look for the Test Coverage Requirements section with different patterns
    console.log('Looking for Test Coverage Requirements section');
    
    // Look for the dedicated Test Coverage Requirements section
    // The exact format in our sample: #### Test Coverage Requirements
    const testCoverageSectionHeader = '#### Test Coverage Requirements';
    const headerIndex = taskContent.indexOf(testCoverageSectionHeader);
    
    if (headerIndex !== -1) {
        console.log('Found Test Coverage Requirements section header');
        // Find the end of this section (the next header or end of content)
        const nextHeaderIndex = taskContent.indexOf('####', headerIndex + testCoverageSectionHeader.length);
        const endIndex = nextHeaderIndex !== -1 ? nextHeaderIndex : taskContent.length;
        
        // Extract the section content
        const sectionContent = taskContent.substring(headerIndex, endIndex);
        console.log(`Extracted Test Coverage Requirements section with length: ${sectionContent.length}`);
        console.log(`Sample content: ${sectionContent.substring(0, Math.min(100, sectionContent.length))}...`);
        return sectionContent;
    }
    
    // If not found, try other patterns
    const patterns = [
        /#### Test Coverage Requirements\s*\n([\s\S]*?)(?=\n####|$)/i,
        /##### Test Coverage Requirements\s*\n([\s\S]*?)(?=\n#####|$)/i,
        /- \*\*Test Coverage Requirements\*\*:([\s\S]*?)(?=\n- \*\*|$)/i,
        /#### Acceptance Criteria\s*\n([\s\S]*?)(?=\n####|$)/i  // Sometimes under Acceptance Criteria
    ];
    
    for (const pattern of patterns) {
        const match = taskContent.match(pattern);
        if (match && match[1].trim()) {
            console.log('Found Test Coverage Requirements section using pattern');
            return match[1].trim();
        }
    }
    
    console.log('No Test Coverage Requirements section found in task content');
    return '';
}

/**
 * Extract metadata from the Test Coverage Requirements section
 * @param {string} sectionContent - Content of the Test Coverage Requirements section
 * @param {string} key - Metadata key to extract
 * @returns {string} - Metadata value or empty string
 */
function extractTestMetadata(sectionContent, key) {
    if (!sectionContent) return '';
    
    // Simple check for key in the content
    const keyIndex = sectionContent.indexOf(`**${key}**:`);
    
    if (keyIndex !== -1) {
        // Extract line containing this key
        const startLineIndex = sectionContent.lastIndexOf('\n', keyIndex) + 1;
        const endLineIndex = sectionContent.indexOf('\n', keyIndex);
        const line = sectionContent.substring(
            startLineIndex, 
            endLineIndex !== -1 ? endLineIndex : sectionContent.length
        );
        
        // Extract the value after the colon
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
            const value = line.substring(colonIndex + 1).trim();
            console.log(`Found ${key} in Test Coverage Requirements: ${value}`);
            return value;
        }
    }
    
    // If not found with the direct approach, try patterns
    const patterns = [
        // Pattern with dash and double asterisks: - **Test Location**: `path/to/test`
        new RegExp(`- \\*\\*${key}\\*\\*:\\s*(.*)(?=\\n|$)`, 'i'),
        // Pattern with just asterisks: **Test Location**: `path/to/test`
        new RegExp(`\\*\\*${key}\\*\\*:\\s*(.*)(?=\\n|$)`, 'i'),
        // Pattern with dash but no asterisks: - Test Location: `path/to/test`
        new RegExp(`- ${key}:\\s*(.*)(?=\\n|$)`, 'i')
    ];
    
    for (const pattern of patterns) {
        const match = sectionContent.match(pattern);
        if (match && match[1].trim()) {
            console.log(`Found ${key} in Test Coverage Requirements with pattern: ${match[1].trim()}`);
            return match[1].trim();
        }
    }
    
    console.log(`${key} not found in Test Coverage Requirements section`);
    return '';
}

/**
 * Find the Element Test Mapping section for a specific task
 * @param {string} taskContent - Task content 
 * @param {string} taskId - Task ID
 * @returns {string} - Element Test Mapping section content or empty string
 */
function findElementTestMappingSection(taskContent, taskId) {
    console.log('Looking for Element Test Mapping section');
    
    // Look specifically for the #### Element Test Mapping header
    const elementMappingHeader = '#### Element Test Mapping';
    const headerIndex = taskContent.indexOf(elementMappingHeader);
    
    if (headerIndex !== -1) {
        console.log('Found Element Test Mapping header');
        // Find the end of this section (the next header or end of content)
        const nextHeaderIndex = taskContent.indexOf('####', headerIndex + elementMappingHeader.length);
        const endIndex = nextHeaderIndex !== -1 ? nextHeaderIndex : taskContent.length;
        
        // Extract the section content
        const sectionContent = taskContent.substring(headerIndex, endIndex);
        console.log(`Extracted Element Test Mapping section with length: ${sectionContent.length}`);
        return sectionContent;
    }
    
    // If no specific header, look for element entries
    const elementPattern = `##### [${taskId}:ELE-`;
    const elementIndex = taskContent.indexOf(elementPattern);
    
    if (elementIndex !== -1) {
        console.log(`Found element pattern: ${elementPattern}`);
        // Find the end of the elements section (next header or end of content)
        const nextHeaderIndex = taskContent.indexOf('####', elementIndex);
        const endIndex = nextHeaderIndex !== -1 ? nextHeaderIndex : taskContent.length;
        
        // Extract the section containing the elements
        const elementSection = taskContent.substring(elementIndex, endIndex);
        console.log(`Extracted element section with length: ${elementSection.length}`);
        return elementSection;
    }
    
    console.log('No Element Test Mapping section or element entries found');
    return '';
}

/**
 * Extract elements from Element Test Mapping section
 * @param {string} mappingContent - Content of Element Test Mapping section
 * @param {string} taskId - Task ID
 * @returns {Array} - Array of element objects
 */
function extractElementsFromMapping(mappingContent, taskId) {
    console.log(`Extracting elements from mapping content for task ${taskId}. Content length: ${mappingContent.length}`);
    console.log(`Mapping content sample: ${mappingContent.substring(0, 100)}...`);
    
    const elements = [];
    
    // Look for elements with the pattern: ##### [T-1.1.1:ELE-1] Element description
    // First find all element entries
    const lines = mappingContent.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // If the line starts with ##### and contains [taskId:ELE-
        if (line.startsWith('#####') && line.includes(`[${taskId}:ELE-`)) {
            console.log(`Found element line: ${line}`);
            
            // Extract the element ID and description
            const match = line.match(/\[(.*?):(.*?)\]\s*(.*)/);
            
            if (match) {
                const elementTaskId = match[1];
                const elementId = match[2];
                const description = match[3];
                
                const element = {
                    id: `${elementTaskId}:${elementId}`,
                    description: description,
                    mapsTo: [],
                    isSubElement: /ELE-\d+[a-z]/.test(elementId)
                };
                
                // Scan the next lines for maps-to references
                for (let j = i + 1; j < lines.length && !lines[j].startsWith('#####'); j++) {
                    const subLine = lines[j].trim();
                    if (subLine.includes('Maps to:')) {
                        const mapsToMatch = subLine.match(/Maps to:\s*(.*)/i);
                        if (mapsToMatch) {
                            element.mapsTo.push(mapsToMatch[1].trim());
                        }
                    }
                }
                
                console.log(`Extracted element: ${element.id} - ${element.description}`);
                elements.push(element);
            }
        }
    }
    
    console.log(`Extracted ${elements.length} elements total`);
    return elements;
}

/**
 * Extract implementation phases from Element Test Mapping section
 * @param {string} mappingContent - Content of Element Test Mapping section
 * @returns {Object} - Object with preparation, implementation, and validation steps
 */
function extractPhasesFromElementMapping(mappingContent) {
    const phases = {
        preparation: [],
        implementation: [],
        validation: []
    };
    
    console.log('Extracting phases from Element Test Mapping content');

    // Process the content line by line
    const lines = mappingContent.split('\n');
    let currentPhase = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!line) continue;
        
        // Detect phase sections
        if (line.includes('**Preparation Steps**:')) {
            currentPhase = 'preparation';
            continue;
        } else if (line.includes('**Implementation Steps**:')) {
            currentPhase = 'implementation';
            continue;
        } else if (line.includes('**Validation Steps**:')) {
            currentPhase = 'validation';
            continue;
        } else if (line.includes('**Test Requirements**:')) {
            currentPhase = null; // Exit phase parsing when we hit test requirements
            continue;
        }
        
        // If we're in a phase and line starts with - or has a [PHASE-X] pattern, extract it
        if (currentPhase && (line.startsWith('-') || line.includes('[PREP-') || 
                            line.includes('[IMP-') || line.includes('[VAL-'))) {
            // Extract the step content by removing the leading dash or [PHASE-X] marker
            let stepContent = line;
            
            // Remove leading dash
            if (stepContent.startsWith('-')) {
                stepContent = stepContent.substring(1).trim();
            }
            
            // Remove [PHASE-X] markers
            stepContent = stepContent.replace(/\[(PREP|IMP|VAL)-\d+\]\s*/, '');
            
            // Add to the appropriate phase
            if (currentPhase === 'preparation') {
                phases.preparation.push(stepContent);
            } else if (currentPhase === 'implementation') {
                phases.implementation.push(stepContent);
            } else if (currentPhase === 'validation') {
                phases.validation.push(stepContent);
            }
        }
    }
    
    console.log(`Extracted phases from Element Test Mapping: P:${phases.preparation.length}, I:${phases.implementation.length}, V:${phases.validation.length}`);
    return phases;
}

/**
 * Extract metadata from task content
 * @param {string} content - Task content
 * @param {string} field - Field name to extract
 * @returns {string|null} - Field value or null
 */
function extractMetadata(content, field) {
    // Updated regex to match the format: - **Field**: Value
    // This handles both single-line and multi-line fields by looking ahead to the next field
    const metadataPattern = new RegExp(`- \\*\\*${field}\\*\\*:(.*?)(?=\\n-\\s*\\*\\*|\\n\\*\\*Components\\/Elements|\\n\\*\\*Implementation Process|$)`, 'si');
    const match = content.match(metadataPattern);
    
    if (match && match[1]) {
        // Trim any leading/trailing whitespace and handle multi-line content properly
        return match[1].split('\n')
            .map(line => line.trim())
            .filter(line => line)
            .join('\n');
    }
    
    return null;
}

/**
 * Extract a section by name from content
 * @param {string} text - Content to search in 
 * @param {string} sectionTitle - Name of section to extract
 * @param {boolean} useMarkdownHeaders - Whether to use ## headers (true) or **Section** format (false)
 * @returns {string} - Extracted section content or empty string
 */
function extractSection(text, sectionTitle, useMarkdownHeaders = true) {
  if (useMarkdownHeaders) {
    // Original implementation for Markdown headers (## Section)
    const regex = new RegExp(`## ${sectionTitle}\\s*\\n([\\s\\S]*?)(?=\n## |$)`, 'g');
    const match = regex.exec(text);
    
    if (match) {
      return `### ${sectionTitle}\n${match[1].trim()}`;
    }
    
    return '';
  } else {
    // Special handling for Legacy Code sections which have unique formats
    // Support both "Legacy Code Location" and "Legacy Code References" section titles
    if (sectionTitle === 'Legacy Code Location') {
      // First, try with the original section title
      let legacySection = extractLegacyCodeSection(text, 'Legacy Code Location');
      
      // If not found, try with the alternate title
      if (!legacySection.trim()) {
        legacySection = extractLegacyCodeSection(text, 'Legacy Code References');
      }
      
      return legacySection;
    }
    
    // Updated implementation for task breakdown format (- **Section**:)
    // Improved to handle multi-line content with proper indentation preservation
    const sectionPattern = new RegExp(`- \\*\\*${sectionTitle}\\*\\*:(.*?)(?=\\n- \\*\\*|\\n\\*\\*Components\\/Elements|\\n\\*\\*Implementation Process|$)`, 'ms');
    const match = text.match(sectionPattern);
    
    if (match && match[1]) {
      // Process the section text line by line
      return match[1].split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .join('\n');
    }
    
    return '';
  }
}

/**
 * Helper function to extract legacy code section with a specific title
 * @param {string} text - Content to search in
 * @param {string} sectionTitle - Section title to extract (e.g., "Legacy Code Location" or "Legacy Code References")
 * @returns {string} - Extracted section content or empty string
 */
function extractLegacyCodeSection(text, sectionTitle) {
  console.log(`Attempting to extract Legacy Code section with title: ${sectionTitle}`);
  
  // Look for various formats of the Legacy Code section header
  const patterns = [
    // Format with no dash
    new RegExp(`\\*\\*${sectionTitle}\\*\\*:`, 'i'),
    // Format with dash
    new RegExp(`- \\*\\*${sectionTitle}\\*\\*:`, 'i'),
    // Format with markdown header
    new RegExp(`###\\s+${sectionTitle}`, 'i'),
    // Format with different markdown header level
    new RegExp(`####\\s+${sectionTitle}`, 'i')
  ];
  
  let startMatch = null;
  let matchedPattern = null;
  
  // Try each pattern until we find a match
  for (const pattern of patterns) {
    startMatch = pattern.exec(text);
    if (startMatch) {
      matchedPattern = pattern;
      console.log(`Found Legacy Code section with pattern: ${pattern}`);
      break;
    }
  }
  
  if (!startMatch) {
    console.log(`No Legacy Code section found with title: ${sectionTitle}`);
    return '';
  }
  
  // Calculate the start index based on the matched pattern
  const startIdx = startMatch.index + startMatch[0].length;
  
  // Define all possible end patterns (sections that might follow the Legacy Code section)
  const possibleEndPatterns = [
    // Regular section headers in task breakdown format
    /\n- \*\*(?:Implementation Location|Pattern|Dependencies|Estimated Hours|Description)\*\*/i,
    // Component/Elements section headers
    /\n\*\*Components\/Elements/i,
    // Implementation Process section headers
    /\n\*\*Implementation Process/i,
    // Markdown headers for new sections or tasks
    /\n###\s+/i,
    /\n####\s+/i,
    // Other common section headers
    /\n\*\*[A-Z][a-zA-Z ]+\*\*/
  ];
  
  // Try to find the nearest end pattern
  let endIdx = text.length; // Default to end of text
  
  for (const pattern of possibleEndPatterns) {
    const endMatch = text.substring(startIdx).match(pattern);
    if (endMatch) {
      const candidateEndIdx = startIdx + endMatch.index;
      if (candidateEndIdx < endIdx) {
        endIdx = candidateEndIdx;
        console.log(`Found end of Legacy Code section at offset: ${endMatch.index} (pattern: ${pattern})`);
      }
    }
  }
  
  // Extract the content between start and end
  let sectionContent = text.substring(startIdx, endIdx).trim();
  
  // Clean up the content - remove any leading blank lines or dash lists that might have been captured
  sectionContent = sectionContent
    .replace(/^\s*[\n\r]+/, '') // Remove leading blank lines
    .replace(/^\s*-\s*$/, '');  // Remove lone dashes
  
  console.log(`Extracted Legacy Code section (${sectionContent.length} chars)`);
  console.log(`Section begins with: "${sectionContent.substring(0, Math.min(50, sectionContent.length))}..."`);
  
  return sectionContent;
}

/**
 * Parse task elements including sub-elements
 * @param {string} taskContent - Task content
 * @returns {Array} - Array of element objects
 */
function parseTaskElements(taskContent) {
    const elements = [];
    
    // Try multiple patterns to match the Components/Elements section
    let componentsMatch = taskContent.match(/\*\*Components\/Elements\*\*:([\s\S]*?)(?=\*\*Implementation Process\*\*:|$)/i);
    
    if (!componentsMatch || !componentsMatch[1].trim()) {
        // Try alternative pattern with ## header format
        componentsMatch = taskContent.match(/##\s*Components\/Elements\s*\n([\s\S]*?)(?=##|$)/i);
    }
    
    // Try another pattern for Element Test Mapping
    if (!componentsMatch || !componentsMatch[1].trim()) {
        componentsMatch = taskContent.match(/#### Element Test Mapping\s*\n([\s\S]*?)(?=####|$)/i);
    }
    
    if (!componentsMatch || !componentsMatch[1].trim()) {
        console.log('No Components/Elements section found or it is empty');
        console.log('Task content sample:', taskContent.substring(0, 500));
        return elements;
    }
    
    console.log('Found Components/Elements section');
    
    // Split the elements section into lines for processing
    const elementContent = componentsMatch[1];
    const lines = elementContent.split('\n').map(line => line.trim()).filter(line => line);
    
    console.log(`Processing ${lines.length} lines from Elements section`);
    
    let currentElement = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        console.log(`Processing element line: ${line}`);
        
        // Try multiple formats to catch all element definitions
        // Format: - [T-1.1.1:ELE-1] Element description
        let mainElementMatch = line.match(/^-\s*\[([^:]+):([^\]]+)\]\s*(.*)/);
        
        // If not matched, try alternative format: - [ ] T-1.1.1:ELE-1: Element description
        if (!mainElementMatch) {
            mainElementMatch = line.match(/^-\s*\[\s*\]\s*([^:]+):([^:]+):\s*(.*)/);
        }
        
        // If not matched, try basic format: - T-1.1.1:ELE-1: Element description
        if (!mainElementMatch) {
            mainElementMatch = line.match(/^-\s*([^:]+):([^:]+):\s*(.*)/);
        }
        
        // Try yet another format with heading patterns: ##### [T-1.1.1:ELE-1] Element description
        if (!mainElementMatch) {
            mainElementMatch = line.match(/^#####\s*\[([^:]+):([^\]]+)\]\s*(.*)/);
        }
        
        if (mainElementMatch) {
            const taskId = mainElementMatch[1].trim();
            const eleId = mainElementMatch[2].trim();
            const description = mainElementMatch[3].trim();
            
            console.log(`Found element: ${taskId}:${eleId} - ${description}`);
            
            // Check if it's a main element (no letter) or sub-element (with letter)
            const isSubElement = /ELE-\d+[a-z]/.test(eleId);
            
            currentElement = {
                id: `${taskId}:${eleId}`,
                description: description,
                mapsTo: [],
                isSubElement: isSubElement
            };
            
            elements.push(currentElement);
            continue;
        }
        
        // Match Maps to references: * Maps to: FR1.1.1 "Description"
        const mapsToMatch = line.match(/^\*\s*Maps\s+to:\s*(.*)/i);
        if (mapsToMatch && currentElement) {
            currentElement.mapsTo.push(mapsToMatch[1].trim());
            console.log(`Found maps-to reference for ${currentElement.id}`);
        }
    }
    
    console.log(`Extracted ${elements.length} elements`);
    return elements;
}

/**
 * Parse implementation phases
 * @param {string} taskContent - Task content section
 * @returns {Object} - Object with preparation, implementation, and validation steps
 */
function parseImplementationPhases(taskContent) {
    const phases = {
        preparation: [],
        implementation: [],
        validation: []
    };

    // Try multiple patterns to find the Implementation Process section
    let processContent = '';
    
    // Try **Implementation Process**: format
    const implProcessIndex = taskContent.indexOf('**Implementation Process**:');
    if (implProcessIndex !== -1) {
        console.log('Found Implementation Process section with ** style');
        
        // Get content until next section or end
        let endIndex = taskContent.length;
        const legacyCodeRefIndex = taskContent.indexOf('**Legacy Code References**:');
        const legacyCodeLocIndex = taskContent.indexOf('**Legacy Code Location**:');
        
        if (legacyCodeRefIndex !== -1 && legacyCodeRefIndex > implProcessIndex) {
            endIndex = legacyCodeRefIndex;
        } else if (legacyCodeLocIndex !== -1 && legacyCodeLocIndex > implProcessIndex) {
            endIndex = legacyCodeLocIndex;
        }
        
        processContent = taskContent.substring(implProcessIndex + 26, endIndex).trim();
    } else {
        // Try alternative pattern with ## header format
        const headerMatch = taskContent.match(/##\s*Implementation Process\s*\n([\s\S]*?)(?=##|$)/i);
        if (headerMatch) {
            console.log('Found Implementation Process section with ## style');
            processContent = headerMatch[1].trim();
        } else {
            console.log('No Implementation Process section found - trying numbered sections directly');
            
            // Try to find numbered phases directly by looking in the Element Test Mapping section
            const elementSection = taskContent.match(/#### Element Test Mapping\s*\n([\s\S]*?)(?=####|$)/i);
            if (elementSection && elementSection[1]) {
                const prepMatch = elementSection[1].match(/- \*\*Preparation Steps\*\*:([\s\S]*?)(?=- \*\*Implementation Steps\*\*:|$)/i);
                const implMatch = elementSection[1].match(/- \*\*Implementation Steps\*\*:([\s\S]*?)(?=- \*\*Validation Steps\*\*:|$)/i);
                const valMatch = elementSection[1].match(/- \*\*Validation Steps\*\*:([\s\S]*?)(?=- \*\*Test Requirements\*\*:|$)/i);
                
                if (prepMatch || implMatch || valMatch) {
                    console.log('Found preparation/implementation/validation steps in Element Test Mapping');
                    
                    if (prepMatch && prepMatch[1].trim()) {
                        phases.preparation = extractPhaseSteps(prepMatch[1]);
                        console.log(`Found ${phases.preparation.length} preparation steps from Element Test Mapping`);
                    }
                    
                    if (implMatch && implMatch[1].trim()) {
                        phases.implementation = extractPhaseSteps(implMatch[1]);
                        console.log(`Found ${phases.implementation.length} implementation steps from Element Test Mapping`);
                    }
                    
                    if (valMatch && valMatch[1].trim()) {
                        phases.validation = extractPhaseSteps(valMatch[1]);
                        console.log(`Found ${phases.validation.length} validation steps from Element Test Mapping`);
                    }
                    
                    return phases;
                }
            }
            
            // Try to find numbered phases directly in the main content
            const prepMatch = taskContent.match(/1\.\s*Preparation Phase:([\s\S]*?)(?=2\.\s*Implementation Phase:|$)/i);
            const implMatch = taskContent.match(/2\.\s*Implementation Phase:([\s\S]*?)(?=3\.\s*Validation Phase:|$)/i);
            const valMatch = taskContent.match(/3\.\s*Validation Phase:([\s\S]*?)(?=$)/i);
            
            if (prepMatch || implMatch || valMatch) {
                console.log('Found numbered phases directly');
                
                if (prepMatch && prepMatch[1].trim()) {
                    phases.preparation = extractPhaseSteps(prepMatch[1]);
                    console.log(`Found ${phases.preparation.length} preparation steps directly`);
                }
                
                if (implMatch && implMatch[1].trim()) {
                    phases.implementation = extractPhaseSteps(implMatch[1]);
                    console.log(`Found ${phases.implementation.length} implementation steps directly`);
                }
                
                if (valMatch && valMatch[1].trim()) {
                    phases.validation = extractPhaseSteps(valMatch[1]);
                    console.log(`Found ${phases.validation.length} validation steps directly`);
                }
                
                return phases;
            }
            
            console.log('No Implementation Process section found in any format');
            console.log('Task content sample:', taskContent.substring(0, 500));
            return phases;
        }
    }
    
    console.log('Process content found, extracting phases');
    
    // Extract each phase using regex with multiple patterns
    // Try different patterns for phase headers
    let prepMatch = processContent.match(/1\.\s*Preparation Phase:([\s\S]*?)(?=2\.\s*Implementation Phase:|$)/i);
    if (!prepMatch) {
        prepMatch = processContent.match(/Preparation Phase[:\s]+([\s\S]*?)(?=Implementation Phase[:\s]|$)/i);
    }
    
    let implMatch = processContent.match(/2\.\s*Implementation Phase:([\s\S]*?)(?=3\.\s*Validation Phase:|$)/i);
    if (!implMatch) {
        implMatch = processContent.match(/Implementation Phase[:\s]+([\s\S]*?)(?=Validation Phase[:\s]|$)/i);
    }
    
    let valMatch = processContent.match(/3\.\s*Validation Phase:([\s\S]*?)(?=$)/i);
    if (!valMatch) {
        valMatch = processContent.match(/Validation Phase[:\s]+([\s\S]*?)(?=$)/i);
    }
    
    if (prepMatch && prepMatch[1].trim()) {
        phases.preparation = extractPhaseSteps(prepMatch[1]);
        console.log(`Found ${phases.preparation.length} preparation steps`);
    } else {
        console.log('No preparation phase found or it is empty');
    }
    
    if (implMatch && implMatch[1].trim()) {
        phases.implementation = extractPhaseSteps(implMatch[1]);
        console.log(`Found ${phases.implementation.length} implementation steps`);
    } else {
        console.log('No implementation phase found or it is empty');
    }
    
    if (valMatch && valMatch[1].trim()) {
        phases.validation = extractPhaseSteps(valMatch[1]);
        console.log(`Found ${phases.validation.length} validation steps`);
    } else {
        console.log('No validation phase found or it is empty');
    }

    return phases;
}

/**
 * Extract steps from phase content
 * @param {string} phaseContent - Content of a phase section
 * @returns {Array} - Array of step strings
 */
function extractPhaseSteps(phaseContent) {
    if (!phaseContent || !phaseContent.trim()) return [];
    
    // Extract each step that starts with a dash
    const steps = [];
    const lines = phaseContent.split('\n');
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        // Skip quality standards section
        if (trimmedLine.includes('Quality Standards') || 
            trimmedLine.includes('Follow these quality standards')) {
            continue;
        }
        // Only include lines that start with a dash (bullet point)
        if (trimmedLine.startsWith('-')) {
            // Remove the leading dash and trim spaces
            steps.push(trimmedLine.substring(1).trim());
        }
    }
    
    return steps;
}

/**
 * Format elements list with proper indentation and commands
 * @param {Array} elements - Array of element objects
 * @returns {string} - Formatted elements list
 */
function formatElements(elements) {
    if (!elements || elements.length === 0) {
        return "No elements found for this task.";
    }
    
    return elements.map(element => {
        const indent = element.isSubElement ? '  ' : '';
        let elementText = `${indent}- [ ] ${element.id}: ${element.description}`;
        
        if (element.mapsTo && element.mapsTo.length > 0) {
            elementText += '\n' + element.mapsTo.map(mapping => 
                `${indent}  * Maps to: ${mapping}`
            ).join('\n');
        }
        
        elementText += `\n${indent}  When you start work on this element you MUST call:
${indent}  \`\`\`
${indent}  node bin/aplio-agent-cli.js update-element-status "${element.id}" "In Progress"
${indent}  \`\`\`
${indent}  Then paste the command output here.
${indent}  Begin coding this task element.
${indent}  When completed, you MUST call:
${indent}  \`\`\`
${indent}  node bin/aplio-agent-cli.js update-element-status "${element.id}" "Complete"
${indent}  \`\`\`
${indent}  Then paste the command output here.`;
        return elementText;
    }).join('\n\n');
}

/**
 * Format legacy code files for display
 * @param {Array} files - Array of file references
 * @returns {string} - Formatted file list
 */
function formatLegacyCodeFiles(files) {
    if (!files || !Array.isArray(files) || files.length === 0) {
        return "None";
    }
    
    // Remove any empty entries
    const validFiles = files.filter(file => file && file.trim());
    
    if (validFiles.length === 0) {
        return "None";
    }
    
    return validFiles.map(file => `- ${file}`).join('\n');
}

/**
 * Format phase steps with commands
 * @param {Array} steps - Array of step objects
 * @param {string} phase - Phase name
 * @returns {string} - Formatted phase steps
 */
function formatPhaseSteps(steps, phase) {
    if (!steps || !steps.length) return '';
    
    // Filter out quality standards and Layer 1 header from implementation steps
    const filteredSteps = phase === 'Implementation' 
        ? steps.filter(step => !step.includes('Quality Standards') && 
                             !step.includes('Follow these quality standards') &&
                             !step.includes('Ensure proper type checking') &&
                             !step.includes('Maintain basic ESLint') &&
                             !step.includes('Verify correct import/export') &&
                             !step.includes('Use consistent naming') &&
                             !step.includes('Meet test coverage') &&
                             !step.includes('Implement proper component') &&
                             !step.includes('Apply consistent error handling') &&
                             !step.includes('**Layer 1: Static Analysis**'))
        : steps;
    
    // Format the steps with checkboxes and progress tracking
    const formattedSteps = filteredSteps.map((step, index) => {
        const stepNumber = index + 1;
        return `- [ ] ${step}
  When you start work on this step you MUST call:
  \`\`\`
  node bin/aplio-agent-cli.js update-phase "${phase} Phase" ${stepNumber} "${step}" "In Progress"
  \`\`\`
  Then paste the command output here.
  When completed, you MUST call:
  \`\`\`
  node bin/aplio-agent-cli.js update-phase "${phase} Phase" ${stepNumber} "${step}" "Complete"
  \`\`\`
  Then paste the command output here.`;
    }).join('\n\n');
    
    // For Implementation phase, add the quality standards block at the top
    if (phase === 'Implementation') {
        return `Quality Standards
Follow these quality standards during implementation:
- Ensure proper type checking and type compatibility
- Maintain basic ESLint rule compliance
- Verify correct import/export patterns
- Use consistent naming conventions across the codebase
- Meet test coverage thresholds
- Implement proper component prop validation
- Apply consistent error handling patterns

${formattedSteps}`;
    }
    
    return formattedSteps;
}

/**
 * Generate active-task.md content from template and task data
 * @param {Object} taskData - Parsed task data
 * @returns {string} - Generated content
 */
function generateActiveTaskContent(taskData) {
    // Log key fields to ensure they are available for replacement
    console.log('Generating active task content with metadata:');
    console.log('FR Reference:', taskData.frReference);
    console.log('Pattern:', taskData.pattern);
    console.log('Dependencies:', taskData.dependencies);
    console.log('Estimated Hours:', taskData.estimatedHours);
    console.log('Test Locations:', taskData.testLocations);
    console.log('Testing Tools:', taskData.testingTools);
    console.log('Test Coverage:', taskData.testCoverage);
    console.log('Elements count:', taskData.elements?.length || 0);
    console.log('Preparation steps:', taskData.preparationPhase?.length || 0);
    console.log('Implementation steps:', taskData.implementationPhase?.length || 0);
    console.log('Validation steps:', taskData.validationPhase?.length || 0);
    
    // Use active-task-template.md as the default template
    const templatePath = PATHS.templates.activeTask;
    let template;
    
    try {
        template = fs.readFileSync(templatePath, 'utf8');
        console.log('Successfully read active task template from:', templatePath);
    } catch (error) {
        console.error('Error reading template file:', error);
        template = createBasicTemplate();
        console.log('Created fallback template due to error');
    }
    
    // Get current timestamp
    const currentTimestamp = formatTimestamp();
    
    // Format legacy code files with error protection
    let legacyCodeDetails = 'None';
    try {
        legacyCodeDetails = formatLegacyCodeFiles(taskData.legacyCodeFiles);
        console.log('Successfully formatted legacy code files');
    } catch (error) {
        console.error('Error formatting legacy code files:', error);
    }
    
    // Format elements with test cross-references with error protection
    let elementsWithTestRefs = 'No elements found for this task.';
    try {
        if (taskData.elements && taskData.elements.length > 0) {
            elementsWithTestRefs = formatElementsWithTestRefs(taskData.elements, taskData.taskId);
            console.log('Successfully formatted elements with test references');
        } else {
            console.warn('No elements available to format');
        }
    } catch (error) {
        console.error('Error formatting elements with test references:', error);
    }
    
    // Format phase steps with error protection
    let preparationPhase = 'No preparation steps found.';
    let implementationPhase = 'No implementation steps found.';
    let validationPhase = 'When you have completed all implementation steps, proceed to the Validation Phase by:\n1. Reading the companion test file: core/active-task-unit-tests.md\n2. Following the test file creation, implementation, and execution steps\n3. Recording all test results in that file\n4. Reporting coverage metrics and addressing any test failures\n\nDo NOT proceed to the Validation Phase until all elements in the Implementation Phase are complete.';
    
    try {
        if (taskData.preparationPhase && taskData.preparationPhase.length > 0) {
            preparationPhase = formatPhaseSteps(taskData.preparationPhase, 'Preparation');
            console.log('Successfully formatted preparation phase');
        } else {
            console.warn('No preparation phase steps available to format');
        }
    } catch (error) {
        console.error('Error formatting preparation phase:', error);
    }
    
    try {
        if (taskData.implementationPhase && taskData.implementationPhase.length > 0) {
            implementationPhase = formatPhaseSteps(taskData.implementationPhase, 'Implementation');
            console.log('Successfully formatted implementation phase');
        } else {
            console.warn('No implementation phase steps available to format');
        }
    } catch (error) {
        console.error('Error formatting implementation phase:', error);
    }
    
    // Generate test element list with error protection
    let testElementList = 'No elements to test';
    try {
        if (taskData.elements && taskData.elements.length > 0) {
            testElementList = formatTestElementList(taskData.elements, taskData.taskId);
            console.log('Successfully formatted test element list');
        } else {
            console.warn('No elements available for test list');
        }
    } catch (error) {
        console.error('Error formatting test element list:', error);
    }
    
    // Prepare replacements for template placeholders with fallbacks for all fields
    const replacements = {
        'TASK_ID': taskData.taskId || 'Unknown Task',
        'TASK_TITLE': taskData.fullTaskTitle || 'Untitled Task',
        'FR_REFERENCE': taskData.frReference || 'None specified',
        'IMPLEMENTATION_LOCATION': taskData.implementationLocation || 'Not specified',
        'PATTERN': taskData.pattern || 'None specified',
        'DEPENDENCIES': taskData.dependencies || 'None',
        'ESTIMATED_HOURS': taskData.estimatedHours || 'Not specified',
        'DESCRIPTION': taskData.description || 'No description provided',
        'TEST_LOCATIONS': taskData.testLocations || 'Not specified',
        'TESTING_TOOLS': taskData.testingTools || 'Not specified',
        'TEST_COVERAGE': taskData.testCoverage || 'Not specified',
        'COMPLETES_COMPONENT': taskData.completesComponent || 'Not specified',
        'CONFIDENCE': '', // Empty confidence value to start
        'LEGACY_CODE_DETAILS': legacyCodeDetails || 'None',
        'ELEMENTS_SECTION': elementsWithTestRefs || 'No elements found for this task.',
        'PREPARATION_PHASE': preparationPhase || 'No preparation steps found.',
        'IMPLEMENTATION_PHASE': implementationPhase || 'No implementation steps found.',
        'VALIDATION_PHASE': validationPhase,
        'TEST_ELEMENT_LIST': testElementList || 'No elements to test',
        'TIMESTAMP': currentTimestamp,
        'PRIOR_TASK_ID': taskData.relatedTasks?.prior?.id || 'None',
        'PRIOR_TASK_TITLE': taskData.relatedTasks?.prior?.title || 'None',
        'PRIOR_TASK_LINE': taskData.relatedTasks?.prior?.line || 'N/A',
        'PRIOR_DEPENDENCY': taskData.relatedTasks?.prior?.isDependency ? 'Yes' : 'No',
        'NEXT_TASK_ID': taskData.relatedTasks?.next?.id || 'None',
        'NEXT_TASK_TITLE': taskData.relatedTasks?.next?.title || 'None',
        'NEXT_TASK_LINE': taskData.relatedTasks?.next?.line || 'N/A',
        'NEXT_DEPENDENCY': taskData.relatedTasks?.next?.isDependency ? 'Yes' : 'No'
    };

    // Check for missing template placeholders
    const placeholderRegex = /\{\{([A-Z_]+)\}\}/g;
    let match;
    let missingReplacements = [];
    while ((match = placeholderRegex.exec(template)) !== null) {
        const placeholder = match[1];
        if (!replacements[placeholder]) {
            missingReplacements.push(placeholder);
        }
    }
    
    if (missingReplacements.length > 0) {
        console.warn('Missing replacements for placeholders:', missingReplacements);
    }
    
    // Process the template with replacements
    console.log('Template replacements ready for processing');
    const result = processTemplate(template, replacements);
    console.log('Template processing complete');
    
    return result;
}

/**
 * Generate active-task-unit-tests.md content from template and task data
 * @param {Object} taskData - Parsed task data
 * @returns {string} - Generated content
 */
function generateActiveTaskTestContent(taskData) {
    console.log('Generating active task test content with metadata:');
    console.log('Test Locations:', taskData.testLocations);
    console.log('Testing Tools:', taskData.testingTools);
    console.log('Test Coverage:', taskData.testCoverage);
    console.log('Elements count:', taskData.elements?.length || 0);
    
    // Use active-task-test-template.md as the default template
    const templatePath = PATHS.templates.activeTaskTest;
    let template;
    
    try {
        template = fs.readFileSync(templatePath, 'utf8');
        console.log('Successfully read test template from:', templatePath);
    } catch (error) {
        console.error('Error reading test template file:', error);
        template = createBasicTestTemplate();
        console.log('Created fallback test template due to error');
    }
    
    // Get current timestamp
    const currentTimestamp = formatTimestamp();
    
    // Format all test content with error protection
    let testElementTOC = '   - No elements to test';
    try {
        if (taskData.elements && taskData.elements.length > 0) {
            testElementTOC = formatTestElementTOC(taskData.elements, taskData.taskId);
            console.log('Successfully formatted test element TOC');
        } else {
            console.warn('No elements available for test TOC');
        }
    } catch (error) {
        console.error('Error formatting test element TOC:', error);
    }
    
    let testElementsContent = 'No elements to test';
    try {
        if (taskData.elements && taskData.elements.length > 0) {
            testElementsContent = formatTestElementsContent(
                taskData.elements, 
                taskData.taskId, 
                taskData.testingInfrastructure || {}
            );
            console.log('Successfully formatted test elements content');
        } else {
            console.warn('No elements available for test content');
        }
    } catch (error) {
        console.error('Error formatting test elements content:', error);
    }
    
    let coverageElementList = '  - No elements to test';
    try {
        if (taskData.elements && taskData.elements.length > 0) {
            coverageElementList = formatCoverageElementList(taskData.elements, taskData.taskId);
            console.log('Successfully formatted coverage element list');
        } else {
            console.warn('No elements available for coverage list');
        }
    } catch (error) {
        console.error('Error formatting coverage element list:', error);
    }
    
    // Prepare replacements for template placeholders
    const replacements = {
        'TASK_ID': taskData.taskId || 'Unknown Task',
        'TASK_TITLE': taskData.fullTaskTitle || 'Untitled Task',
        'IMPLEMENTATION_LOCATION': taskData.implementationLocation || 'Not specified',
        'TEST_LOCATIONS': taskData.testLocations || 'Not specified',
        'TESTING_TOOLS': taskData.testingTools || 'Not specified',
        'TEST_COVERAGE': taskData.testCoverage || 'Not specified',
        'DEPENDENCIES': taskData.dependencies || 'None',
        'TEST_ELEMENT_TOC': testElementTOC || '   - No elements to test',
        'TEST_ELEMENTS_CONTENT': testElementsContent || 'No elements to test',
        'COVERAGE_ELEMENT_LIST': coverageElementList || '  - No elements to test',
        'TIMESTAMP': currentTimestamp
    };

    // Check for missing template placeholders
    const placeholderRegex = /\{\{([A-Z_]+)\}\}/g;
    let match;
    let missingReplacements = [];
    while ((match = placeholderRegex.exec(template)) !== null) {
        const placeholder = match[1];
        if (!replacements[placeholder]) {
            missingReplacements.push(placeholder);
        }
    }
    
    if (missingReplacements.length > 0) {
        console.warn('Missing replacements for placeholders in test template:', missingReplacements);
    }

    // Process the template with replacements
    console.log('Test template replacements ready for processing');
    const result = processTemplate(template, replacements);
    console.log('Test template processing complete');
    
    return result;
}

/**
 * Create a basic test template when the template file is missing
 * @returns {string} - Basic test template
 */
function createBasicTestTemplate() {
    return `# Unit Tests for {{TASK_ID}}: {{TASK_TITLE}}

## Table of Contents
1. [Overview](#overview)
2. [Test Environment Setup](#test-environment-setup)
3. [Element Tests](#element-tests)
   {{TEST_ELEMENT_TOC}}
4. [Coverage Reporting](#coverage-reporting)
5. [Test Result Summary](#test-result-summary)

## Overview
This file contains testing instructions for task {{TASK_ID}}. 
Do NOT begin testing until you have completed all implementation steps in core/active-task.md.

- Implementation Location: {{IMPLEMENTATION_LOCATION}}
- Test Location: {{TEST_LOCATIONS}}
- Testing Tools: {{TESTING_TOOLS}}
- Coverage Requirements: {{TEST_COVERAGE}}

## Test Environment Setup
Before creating or running tests, ensure your environment is ready:

1. Verify Jest and TypeScript testing tools are installed
2. Verify the test directory structure exists
3. Check for Jest configuration
4. Ensure tests will meet coverage requirements
5. Verify dependencies are completed

## Element Tests
{{TEST_ELEMENTS_CONTENT}}

## Coverage Reporting
After running all tests with coverage, document the results here.

## Test Result Summary
- [ ] All tests have been executed
- [ ] All tests have passed
- [ ] Coverage requirements have been met

When all tests are complete, return to core/active-task.md to complete the task.`;
}

/**
 * Find related tasks (prior and next) in the task breakdown
 * @param {string} taskId - Current task ID
 * @param {string} taskBreakdownContent - Full task breakdown content
 * @returns {Object} - Prior and next task info
 */
function findRelatedTasks(taskId, taskBreakdownContent) {
    const allTasks = [];
    // Improved regex to find task sections with more flexible heading matching
    const taskRegex = /^#{1,6}\s*(T-[\d.]+):(.*?)(?=^#{1,6}\s*T-|$)/gms;
    let match;
    
    while ((match = taskRegex.exec(taskBreakdownContent)) !== null) {
        allTasks.push({
            id: match[1],
            title: match[2].trim(),
            line: taskBreakdownContent.substring(0, match.index).split('\n').length + 1
        });
    }

    const currentIndex = allTasks.findIndex(task => task.id === taskId);
    if (currentIndex === -1) return { prior: null, next: null };

    const prior = currentIndex > 0 ? allTasks[currentIndex - 1] : null;
    const next = currentIndex < allTasks.length - 1 ? allTasks[currentIndex + 1] : null;

    // Find dependent task IDs for more accurate dependency detection
    const dependencyFromCurrentRegex = new RegExp(`Dependencies:.*?${taskId}`, 'i');
    const currentDependsOnRegex = new RegExp(`Task ID:\\s*${taskId}.*?Dependencies:\\s*([^\\n]+)`, 'i');
    
    // Check for dependencies
    if (prior) {
        // Check if current task depends on prior task
        const currentTaskContent = taskBreakdownContent.substring(
            taskBreakdownContent.indexOf(taskId),
            next ? taskBreakdownContent.indexOf(next.id) : taskBreakdownContent.length
        );
        
        const currentDependsMatch = currentTaskContent.match(currentDependsOnRegex);
        if (currentDependsMatch && currentDependsMatch[1].includes(prior.id)) {
            prior.isDependency = true;
        } else {
            // Check if dependencies are listed in a different format
            const dependsOnPrior = new RegExp(`Dependencies:.*?${prior.id}`, 'i').test(currentTaskContent);
            prior.isDependency = dependsOnPrior;
        }
    }
    
    if (next) {
        // Check if next task depends on current task
        const nextTaskContent = taskBreakdownContent.substring(
            taskBreakdownContent.indexOf(next.id),
            taskBreakdownContent.length
        );
        
        const nextDependsOnCurrent = nextTaskContent.match(new RegExp(`Dependencies:.*?${taskId}`, 'i'));
        next.isDependency = nextDependsOnCurrent !== null;
        
        // If not found in the regular format, try finding it in the parent task relationship
        if (!next.isDependency) {
            const parentMatch = next.id.match(/^(T-[\d.]+)\.\d+$/);
            if (parentMatch && parentMatch[1] === taskId) {
                next.isDependency = true;
            }
        }
    }

    return { prior, next };
}

/**
 * Update progress.md to mark task as in progress
 * @param {string} taskId - Task ID
 * @returns {boolean} - Success status
 */
function updateProgressForTaskStart(taskId) {
    try {
        const progress = fs.readFileSync(PATHS.progressFile, 'utf8');
        
        // Find the task line and update its status
        const taskLineRegex = new RegExp(`(- \\[[ x]\\] ${taskId}:.*?)(?:\\(Status:.*?\\))?\\s*$`, 'm');
        const updatedProgress = progress.replace(
            taskLineRegex,
            `$1 (Status: In Progress, Updated: ${formatTimestamp()})`
        );
        
        fs.writeFileSync(PATHS.progressFile, updatedProgress);
        return true;
    } catch (error) {
        console.error('Error updating progress file:', error);
        return false;
    }
}

/**
 * Starts a new task (stub function that calls improved implementation)
 * @param {string} taskId - Task ID to start
 * @returns {Promise<object>} - Result with status and message
 */
async function startTask(taskId) {
    console.log(`Calling improved startTask implementation from context-manager-v2.js...`);
    
    // Import the context-manager-v2.js module dynamically
    try {
        // Using import() for dynamic imports with proper URL handling
        const contextManagerV2Path = path.join(__dirname, 'context-manager-v2.js');
        // Convert path to URL format for ESM imports
        const moduleURL = new URL('file://' + contextManagerV2Path.replace(/\\/g, '/'));
        const contextManagerV2 = await import(moduleURL);
        
        // Forward the call to the startTaskV2 function
        const result = await contextManagerV2.startTaskV2(taskId);
        
        return result;
    } catch (error) {
        console.error(`Error calling startTaskV2: ${error.message}`);
        return {
            success: false,
            message: `Failed to use improved implementation: ${error.message}. Falling back to original implementation would be necessary but is not implemented in this stub.`
        };
    }
}

// Export functions
export default {
  updateTaskContext,
  updateElementProgress,
  updateProgressFile,
  logImprovement,
  logDependencyDiscovery,
  logDependency: logDependencyDiscovery, // Add alias for CLI compatibility
  getCurrentTask,
  logMicroAction,
  updateConfidence,
  addImplementationFile,
  formatTimestamp,
  initialize,
  getStatus,
  updateElementStatus,
  extractSection,
  appendToTaskLog,
  logError,
  updateNotes,
  updateImplementationPhase,
  updateImplementationPhase_legacy,
  completeElement,
  startTask,
  formatLegacyCodeFiles,
  extractTestingInfrastructure,
  generateActiveTaskContent,
  generateActiveTaskTestContent,
  formatElementsWithTestRefs,
  formatTestElementList,
  formatTestElementTOC,
  formatTestElementsContent,
  formatCoverageElementList
};

/**
 * Finds a section in the active-task.md content
 * @param {string} activeTaskContent - The content of active-task.md
 * @param {string} sectionTitle - The title of the section to find
 * @returns {object} - Object containing start index, end index, and section content
 */
function findSectionInActiveTask(activeTaskContent, sectionTitle) {
  // Create regex patterns to match both ## and ### section headers
  // First try to match a ### section header (for sub-sections like "New Dependencies" and "Improvement Suggestions")
  const subSectionRegex = new RegExp(`### ${sectionTitle}\\s*\\n([\\s\\S]*?)(?=\\n### |\\n## |$)`, 'i');
  let match = activeTaskContent.match(subSectionRegex);
  
  if (!match) {
    // If not found, try to match a ## section header
    const mainSectionRegex = new RegExp(`## ${sectionTitle}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
    match = activeTaskContent.match(mainSectionRegex);
  }
  
  if (!match) {
    return {
      found: false,
      startIndex: -1,
      endIndex: -1,
      content: ''
    };
  }
  
  const startIndex = match.index;
  const endIndex = startIndex + match[0].length;
  
  return {
    found: true,
    startIndex,
    endIndex,
    content: match[1].trim()
  };
}

/**
 * Updates a section in the active-task.md content
 * @param {string} activeTaskContent - The content of active-task.md
 * @param {string} sectionTitle - The title of the section to update
 * @param {string} newEntry - The new entry to add to the section
 * @returns {string} - Updated active-task.md content
 */
function updateSectionInActiveTask(activeTaskContent, sectionTitle, newEntry) {
  // Find the section
  const section = findSectionInActiveTask(activeTaskContent, sectionTitle);
  
  if (section.found) {
    // Section exists, add new entry
    const sectionContent = section.content;
    
    // Determine if it's a main section (##) or subsection (###)
    const isSectionStartWithTripleHash = activeTaskContent.substring(section.startIndex, section.startIndex + 4) === '### ';
    const headerPrefix = isSectionStartWithTripleHash ? '### ' : '## ';
    
    // Check if section has "None yet" or "None" placeholder
    if (sectionContent === "None yet" || sectionContent === "None") {
      // Replace the placeholder with the new entry
      return activeTaskContent.substring(0, section.startIndex) + 
        `${headerPrefix}${sectionTitle}\n${newEntry}\n\n` + 
        activeTaskContent.substring(section.endIndex);
    } else {
      // Add to existing content
      return activeTaskContent.substring(0, section.startIndex) + 
        `${headerPrefix}${sectionTitle}\n${sectionContent}\n${newEntry}\n\n` + 
        activeTaskContent.substring(section.endIndex);
    }
  } else {
    // Section doesn't exist, create it
    // Try to find a relevant parent section for subsections

    // For "New Dependencies" - look for "Addendums" section
    if (sectionTitle === "New Dependencies") {
      const addendumSection = findSectionInActiveTask(activeTaskContent, "Addendums");
      if (addendumSection.found) {
        // Find where to insert the new subsection (after the Addendums header)
        const insertIndex = addendumSection.startIndex + "## Addendums\n".length;
        return activeTaskContent.substring(0, insertIndex) + 
          `\n### ${sectionTitle}\n${newEntry}\n\n` + 
          activeTaskContent.substring(insertIndex);
      }
    }
    
    // For "Improvement Suggestions" - look for "New Dependencies" section
    if (sectionTitle === "Improvement Suggestions") {
      const dependenciesSection = findSectionInActiveTask(activeTaskContent, "New Dependencies");
      if (dependenciesSection.found) {
        // Insert after the Dependencies section
        return activeTaskContent.substring(0, dependenciesSection.endIndex) + 
          `\n### ${sectionTitle}\n${newEntry}\n\n` + 
          activeTaskContent.substring(dependenciesSection.endIndex);
      }
    }
    
    // Find a good place to insert the new section
    // We'll try to insert before "Next Steps" if it exists
    const nextStepsSection = findSectionInActiveTask(activeTaskContent, "Next Steps");
    
    if (nextStepsSection.found) {
      // Insert before Next Steps
      return activeTaskContent.substring(0, nextStepsSection.startIndex) + 
        `## ${sectionTitle}\n${newEntry}\n\n` + 
        activeTaskContent.substring(nextStepsSection.startIndex);
    } else {
      // Append to the end of the file
      return activeTaskContent + `\n\n## ${sectionTitle}\n${newEntry}\n`;
    }
  }
}

/**
 * Creates a consistently formatted timestamped entry
 * @param {string} entryText - The text of the entry
 * @param {object} additionalInfo - Additional information for the entry
 * @returns {string} - Formatted entry
 */
function formatTimestampedEntry(entryText, additionalInfo = {}) {
  const timestamp = formatTimestamp();
  let entry = `- [${timestamp}] ${entryText}`;
  
  // Add confidence if provided
  if (additionalInfo.confidence !== undefined) {
    entry += ` (Confidence: ${additionalInfo.confidence}/10)`;
  }
  
  // Add severity if provided
  if (additionalInfo.severity !== undefined) {
    entry += ` (Severity: ${additionalInfo.severity}/10)`;
  }
  
  // Add files if provided
  if (additionalInfo.files && additionalInfo.files.length > 0) {
    entry += ` [${additionalInfo.files.join(', ')}]`;
  }
  
  return entry;
}

/**
 * Extract testing infrastructure from task content
 * @param {string} taskContent - Task content
 * @param {Array} validationPhase - Validation phase steps
 * @returns {Object} - Testing infrastructure details
 */
function extractTestingInfrastructure(taskContent, validationPhase) {
    // Extract test sections from validation phase
    let testFileCreation = '';
    let testImplementation = '';
    let unitTests = '';
    
    // Extract test metadata from task content
    const testLocations = extractMetadata(taskContent, 'Test Locations') || '';
    const testingTools = extractMetadata(taskContent, 'Testing Tools') || '';
    const testCoverage = extractMetadata(taskContent, 'Test Coverage Requirements') || '';
    const completesComponent = extractMetadata(taskContent, 'Completes Component?') || '';
    
    // Find validation phase section
    const validationMatch = taskContent.match(/3\.\s*Validation Phase:([\s\S]*?)(?=\*\*Testing Deliverables|\*\*Human Testing Checkpoints|$)/i);
    
    if (!validationMatch || !validationMatch[1].trim()) {
        console.log('No validation phase found or validation phase is empty. Using standard validation steps.');
        // If no specific test sections found, return empty strings but don't fail
        return { 
            testLocations, 
            testingTools, 
            testCoverage, 
            completesComponent,
            testFileCreation, 
            testImplementation, 
            unitTests,
            elements: []
        };
    }
    
    const validationContent = validationMatch[1];
    
    // Extract test file creation section
    const testFileCreationMatch = validationContent.match(/Test File Creation:([\s\S]*?)(?=Test Implementation:|$)/i);
    if (testFileCreationMatch && testFileCreationMatch[1].trim()) {
        testFileCreation = testFileCreationMatch[1].trim();
        console.log('Found test file creation section');
    } else {
        console.log('No test file creation section found');
    }
    
    // Extract test implementation section
    const testImplementationMatch = validationContent.match(/Test Implementation:([\s\S]*?)(?=Unit Tests:|$)/i);
    if (testImplementationMatch && testImplementationMatch[1].trim()) {
        testImplementation = testImplementationMatch[1].trim();
        console.log('Found test implementation section');
    } else {
        console.log('No test implementation section found');
    }
    
    // Extract unit tests section
    const unitTestsMatch = validationContent.match(/Unit Tests:([\s\S]*?)(?=Human Verification:|$)/i);
    if (unitTestsMatch && unitTestsMatch[1].trim()) {
        unitTests = unitTestsMatch[1].trim();
        console.log('Found unit tests section');
    } else {
        console.log('No unit tests section found');
    }
    
    // Extract test elements by analyzing the test content
    const elements = extractTestElements(testFileCreation, testImplementation, unitTests);
    
    return { 
        testLocations, 
        testingTools, 
        testCoverage, 
        completesComponent,
        testFileCreation, 
        testImplementation, 
        unitTests,
        elements
    };
}

/**
 * Extract test elements from test sections
 * @param {string} testFileCreation - Test file creation content
 * @param {string} testImplementation - Test implementation content
 * @param {string} unitTests - Unit tests content
 * @returns {Array} - Array of test elements
 */
function extractTestElements(testFileCreation, testImplementation, unitTests) {
    const elements = [];
    
    // Extract elements from file creation section
    const fileRegex = /test\/.*?\/ele-(\d+[a-z]*)\.test/g;
    let match;
    
    while ((match = fileRegex.exec(testFileCreation)) !== null) {
        const elementId = match[1];
        if (!elements.includes(elementId)) {
            elements.push(elementId);
        }
    }
    
    // Sort elements to ensure consistent ordering
    elements.sort((a, b) => {
        // Sort numeric elements first, then alphanumeric
        const aNum = parseInt(a.replace(/[a-z]/g, ''));
        const bNum = parseInt(b.replace(/[a-z]/g, ''));
        
        if (aNum === bNum) {
            return a.localeCompare(b);
        }
        
        return aNum - bNum;
    });
    
    return elements;
}

/**
 * Format elements with test cross-references
 * @param {Array} elements - Array of element objects
 * @param {string} taskId - Task ID
 * @returns {string} - Formatted elements with test cross-references
 */
function formatElementsWithTestRefs(elements, taskId) {
    if (!elements || elements.length === 0) {
        console.log('No elements to format with test references');
        return 'No elements found for this task.';
    }
    
    console.log(`Formatting ${elements.length} elements with test references`);
    
    try {
        return elements.map(element => {
            // Determine indentation based on sub-element status
            const indent = element.isSubElement ? '  ' : '';
            
            // Extract the element ID without the task ID prefix
            const elementIdPart = element.id.split(':')[1];
            
            // Build the element line with command instructions and test reference
            let elementLine = `${indent}- [ ] ${element.id}: ${element.description}`;
            
            // Add maps-to references if available
            let mapsToLines = '';
            if (element.mapsTo && element.mapsTo.length > 0) {
                mapsToLines = element.mapsTo.map(ref => 
                    `${indent}  * Maps to: ${ref}`
                ).join('\n');
            }
            
            // Add test reference
            const testReference = `${indent}  * Tests for this element are in core/active-task-unit-tests.md#${taskId}-${elementIdPart}-Tests`;
            
            // Add command instructions for this element
            const commandInstructions = `${indent}  When you start work on this element you MUST call:
${indent}  \`\`\`
${indent}  node bin/aplio-agent-cli.js update-element-status "${element.id}" "In Progress"
${indent}  \`\`\`
${indent}  Then paste the command output here.
${indent}  Begin coding this task element.
${indent}  When completed, you MUST call:
${indent}  \`\`\`
${indent}  node bin/aplio-agent-cli.js update-element-status "${element.id}" "Complete"
${indent}  \`\`\`
${indent}  Then paste the command output here.`;
            
            // Combine all parts
            const parts = [];
            parts.push(elementLine);
            if (mapsToLines) parts.push(mapsToLines);
            parts.push(testReference);
            parts.push(commandInstructions);
            
            return parts.join('\n');
        }).join('\n\n');
    } catch (error) {
        console.error('Error formatting elements with test references:', error);
        return 'Error formatting elements with test references.';
    }
}

/**
 * Format test element list for the testing overview section
 * @param {Array} elements - Array of element objects
 * @param {string} taskId - Task ID
 * @returns {string} - Formatted test element list
 */
function formatTestElementList(elements, taskId) {
    if (!elements || elements.length === 0) {
        console.log('No elements to format for test element list');
        return 'No elements to test';
    }
    
    console.log(`Formatting test element list for ${elements.length} elements`);
    
    try {
        return elements.map(element => {
            if (!element || !element.id) {
                return '';
            }
            
            // Extract the element ID without the task ID prefix
            let elementIdPart;
            try {
                elementIdPart = element.id.split(':')[1] || element.id;
            } catch (error) {
                console.error('Error extracting element ID part:', error);
                elementIdPart = element.id;
            }
            
            const elementDescription = element.description || 'No description';
            
            // Create test element list entry
            return `- ${element.id}: ${elementDescription}`;
        }).filter(Boolean).join('\n');
    } catch (error) {
        console.error('Error formatting test element list:', error);
        return 'Error formatting test element list';
    }
}

/**
 * Format test element TOC
 * @param {Array} elements - Array of element objects
 * @param {string} taskId - Task ID
 * @returns {string} - Formatted test element TOC
 */
function formatTestElementTOC(elements, taskId) {
    if (!elements || elements.length === 0) {
        console.log('No elements to format for test TOC');
        return '   - No elements to test';
    }
    
    console.log(`Formatting test TOC for ${elements.length} elements`);
    
    try {
        return elements.map(element => {
            if (!element || !element.id) {
                return '';
            }
            
            // Extract the element ID without the task ID prefix
            let elementIdPart;
            try {
                elementIdPart = element.id.split(':')[1] || element.id;
            } catch (error) {
                console.error('Error extracting element ID part:', error);
                elementIdPart = element.id;
            }
            
            const elementDescription = element.description || 'No description';
            
            // Create element TOC entry with link to the test section
            return `   - [${element.id} - ${elementDescription}](#${taskId}-${elementIdPart}-Tests)`;
        }).filter(Boolean).join('\n');
    } catch (error) {
        console.error('Error formatting test element TOC:', error);
        return '   - Error formatting test element TOC';
    }
}

/**
 * Format coverage element list
 * @param {Array} elements - Array of element objects
 * @param {string} taskId - Task ID
 * @returns {string} - Formatted coverage element list
 */
function formatCoverageElementList(elements, taskId) {
    if (!elements || elements.length === 0) {
        console.log('No elements to format for coverage list');
        return '  - No elements to test';
    }
    
    console.log(`Formatting coverage list for ${elements.length} elements`);
    
    try {
        return elements.map(element => {
            if (!element || !element.id) {
                return '';
            }
            
            // Extract the element ID without the task ID prefix
            let elementIdPart;
            try {
                elementIdPart = element.id.split(':')[1] || element.id;
            } catch (error) {
                console.error('Error extracting element ID part:', error);
                elementIdPart = element.id;
            }
            
            // Create element coverage line
            return `  - ${element.id}: __% coverage`;
        }).filter(Boolean).join('\n');
    } catch (error) {
        console.error('Error formatting coverage element list:', error);
        return '  - Error formatting coverage element list';
    }
}

/**
 * Format test file creation section
 * @param {string} testFileCreation - Test file creation content
 * @returns {string} - Formatted test file creation section
 */
function formatTestFileCreation(testFileCreation) {
    if (!testFileCreation || !testFileCreation.trim()) {
        return 'No test file creation instructions provided for this element.';
    }
    
    // Process the content through phases: find code blocks, parse steps, and format them
    let inCodeBlock = false;
    let formattedContent = [];
    let stepNumber = 1;
    
    const lines = testFileCreation.split('\n').map(line => line.trim()).filter(line => line);
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Handle code blocks
        if (line.includes('```bash') || line.includes('```shell')) {
            inCodeBlock = true;
            formattedContent.push(line);
            continue;
        }
        
        if (line.startsWith('```') && inCodeBlock) {
            inCodeBlock = false;
            formattedContent.push(line);
            continue;
        }
        
        // Inside a code block, just add the line
        if (inCodeBlock) {
            formattedContent.push(line);
            continue;
        }
        
        // Handle step labels (FIRST, THEN, NEXT, FINALLY)
        if (line.match(/^\d+\.\s*([A-Z]+):/) || 
            line.includes('FIRST:') || 
            line.includes('THEN:') || 
            line.includes('NEXT:') || 
            line.includes('FINALLY:')) {
            
            // Extract step label
            const stepMatch = line.match(/^\d+\.\s*([A-Z]+):|([A-Z]+):/);
            const stepLabel = stepMatch ? (stepMatch[1] || stepMatch[2]) : `STEP ${stepNumber}`;
            
            // Extract the description after the label
            let description = line.replace(/^\d+\.\s*[A-Z]+:|[A-Z]+:/, '').trim();
            
            formattedContent.push(`- [ ] ${stepLabel}: ${description}`);
            stepNumber++;
            continue;
        }
        
        // Handle regular steps
        if (line.startsWith('-')) {
            const stepText = line.substring(1).trim();
            formattedContent.push(`- [ ] ${stepText}`);
            continue;
        }
        
        // General instructions or other content
        formattedContent.push(line);
    }
    
    // Add command execution instructions for file creation commands
    let result = formattedContent.join('\n');
    
    // Add instructions for mkdir and touch commands
    result = result.replace(/(mkdir -p [^\n]+)/g, 
        `$1\n  When you execute this command you MUST call:\n  \`\`\`\n  node bin/aplio-agent-cli.js log-action "Created test directory structure" 8\n  \`\`\`\n  Then paste the command output here.`);
    
    result = result.replace(/(touch [^\n]+)/g, 
        `$1\n  When you execute this command you MUST call:\n  \`\`\`\n  node bin/aplio-agent-cli.js log-action "Created test file" 8\n  \`\`\`\n  Then paste the command output here.`);
    
    return result;
}

/**
 * Format test implementation section
 * @param {string} testImplementation - Test implementation content
 * @returns {string} - Formatted test implementation section
 */
function formatTestImplementation(testImplementation) {
    if (!testImplementation || !testImplementation.trim()) {
        return 'No test implementation guidance provided for this element.';
    }
    
    // Process the test implementation content
    let formattedContent = [];
    let inImplementationBlock = false;
    let currentComponent = '';
    
    const lines = testImplementation.split('\n').map(line => line.trim()).filter(line => line);
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Detect component implementation blocks (e.g., "Implement color token types test:")
        if (line.match(/Implement\s+.*?\s+test:/) && !inImplementationBlock) {
            currentComponent = line.replace(/Implement\s+|\s+test:.*$/, '').trim();
            inImplementationBlock = true;
            formattedContent.push(`- [ ] ${line}`);
            formattedContent.push(`  When implementing this test, you MUST:`);
            continue;
        }
        
        // Add sub-points within an implementation block
        if (inImplementationBlock) {
            // Check if this is a nested point or the end of the block
            if (line.startsWith('-') || line.match(/Test\s+.*?\s+by running:/) || i === lines.length - 1 || line.match(/Implement\s+.*?\s+test:/)) {
                // If we're starting a new implementation block or ending, close the current one
                if (line.match(/Implement\s+.*?\s+test:/) || i === lines.length - 1) {
                    inImplementationBlock = false;
                    formattedContent.push(`  When completed, you MUST check this box.`);
                    
                    // Add the new implementation block line if there is one
                    if (line.match(/Implement\s+.*?\s+test:/)) {
                        currentComponent = line.replace(/Implement\s+|\s+test:.*$/, '').trim();
                        inImplementationBlock = true;
                        formattedContent.push(`- [ ] ${line}`);
                        formattedContent.push(`  When implementing this test, you MUST:`);
                    }
                    continue;
                }
            }
            
            // Process points within the implementation block
            if (line.startsWith('-')) {
                const point = line.substring(1).trim();
                formattedContent.push(`  - [ ] ${point}`);
                continue;
            }
        }
        
        // Add regular lines outside implementation blocks
        if (!inImplementationBlock) {
            formattedContent.push(line);
        }
    }
    
    return formattedContent.join('\n');
}

/**
 * Format unit tests section
 * @param {string} unitTests - Unit tests content
 * @returns {string} - Formatted unit tests section
 */
function formatUnitTests(unitTests) {
    if (!unitTests || !unitTests.trim()) {
        return 'No unit test commands provided for this element.';
    }
    
    // Process the unit tests content
    let formattedContent = [];
    let inCodeBlock = false;
    
    const lines = unitTests.split('\n').map(line => line.trim()).filter(line => line);
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Handle code blocks
        if (line.includes('```bash') || line.includes('```shell')) {
            inCodeBlock = true;
            formattedContent.push(line);
            continue;
        }
        
        if (line.startsWith('```') && inCodeBlock) {
            inCodeBlock = false;
            formattedContent.push(line);
            continue;
        }
        
        // Inside a code block, check for npx jest commands
        if (inCodeBlock && line.includes('npx jest')) {
            // Get the test type from the line
            const testNameMatch = line.match(/test\/(.*?)\.test/);
            const testType = testNameMatch ? testNameMatch[1].split('/').pop() : 'unknown';
            
            formattedContent.push(`- [ ] Run test for ${testType}:`);
            formattedContent.push(`  ${line}`);
            formattedContent.push(`  When you execute this test command you MUST:`);
            formattedContent.push(`  1. Record the command output here`);
            formattedContent.push(`  2. Document any test failures`);
            formattedContent.push(`  3. Fix failing tests before proceeding`);
            formattedContent.push(`  4. Re-run the test until it passes`);
            continue;
        }
        
        // Handle regular lines outside code blocks
        if (!inCodeBlock) {
            // Test step description lines
            if (line.startsWith('-')) {
                const testDesc = line.substring(1).trim();
                formattedContent.push(`- [ ] ${testDesc}`);
                continue;
            }
            
            // Handle "Test X by running:" lines
            if (line.match(/Test\s+.*?\s+by running:/)) {
                const componentName = line.replace(/Test\s+|\s+by running:.*$/, '').trim();
                formattedContent.push(`- [ ] ${line}`);
                continue;
            }
            
            // Other content
            formattedContent.push(line);
            continue;
        }
        
        // Regular code block content
        formattedContent.push(line);
    }
    
    // Add special handling for coverage tests
    let result = formattedContent.join('\n');
    result = result.replace(/npx jest --coverage/g, 
        `- [ ] Verify test coverage:\n  npx jest --coverage\n  After running coverage tests, you MUST:\n  1. Document the overall coverage percentage\n  2. Verify it meets the {{TEST_COVERAGE}} requirement\n  3. Identify any areas that need additional test coverage\n  4. Update the Coverage Reporting section with the results`);
    
    return result;
}

/**
 * Create a basic template when the template file is missing
 * @returns {string} - Basic template
 */
function createBasicTemplate() {
    return `# Current Active Task Coding Instructions

## Table of Contents
1. [Task Information](#task-information)
2. [Current Implementation Focus](#current-implementation-focus)
3. [Task Approach](#task-approach)
4. [Expected Implementation Files](#expected-implementation-files)
5. [Element States and Transitions](#element-states-and-transitions)
6. [Components/Elements](#componentselements)
7. [Implementation Process Phases](#implementation-process-phases)
   - [7.1 Preparation Phase](#preparation-phase)
   - [7.2 Implementation Phase](#implementation-phase)
   - [7.3 Validation Phase](#validation-phase)
8. [Testing Overview](#testing-overview)
9. [Current Element](#current-element)
10. [Recent Actions](#recent-actions)
11. [Legacy Code References](#legacy-code-references)
12. [Notes](#notes)
13. [Errors Encountered](#errors-encountered)
14. [Next Steps](#next-steps)
15. [Complete Task](#complete-task)
16. [Addendums](#addendums)

## Task Information
Task ID: {{TASK_ID}}
Task Title: {{TASK_TITLE}}

- FR Reference: {{FR_REFERENCE}}
- Implementation Location: {{IMPLEMENTATION_LOCATION}}
- Pattern: {{PATTERN}}
- Dependencies: {{DEPENDENCIES}}
- Estimated Hours: {{ESTIMATED_HOURS}}
- Description: {{DESCRIPTION}}
- Test Locations: {{TEST_LOCATIONS}}
- Testing Tools: {{TESTING_TOOLS}}
- Test Coverage Requirements: {{TEST_COVERAGE}}
- Completes Component?: {{COMPLETES_COMPONENT}}
- Confidence: 
- Last Updated: {{TIMESTAMP}}

## Current Implementation Focus
Currently: Reading task requirements
Phase: Not started
Step: Initial review
Current Element: None - reviewing task requirements

## Task Approach
(To be filled in by the coding agent)

## Expected Implementation Files
Before beginning implementation, list all files you expect to create or modify:
- Primary:

- Additional files:

## Components/Elements
{{ELEMENTS_SECTION}}

## Implementation Process Phases

### Preparation Phase
{{PREPARATION_PHASE}}

### Implementation Phase
{{IMPLEMENTATION_PHASE}}

### Validation Phase
{{VALIDATION_PHASE}}

## Testing Overview
Testing for this task is managed in a separate file to reduce cognitive load and ensure comprehensive test implementation.

- Test Location: {{TEST_LOCATIONS}}
- Testing Tools: {{TESTING_TOOLS}}
- Coverage Requirements: {{TEST_COVERAGE}}

After completing the Implementation Phase, you MUST:
1. Open and read core/active-task-unit-tests.md
2. Follow all testing instructions in that file
3. Execute all tests and verify coverage requirements are met

Test execution will follow the same element structure as implementation:
{{TEST_ELEMENT_LIST}}

When all tests are complete, you MUST return to this file to complete the task.

## Current Element
- Element ID: None selected
- Description: Not started
- Status: Not started
- Updated: {{TIMESTAMP}}

## Recent Actions
None yet

## Legacy Code References
{{LEGACY_CODE_DETAILS}}

## Notes
Task initialized on {{TIMESTAMP}}
Implementation Status: Not Started

## Errors Encountered
None yet

## Next Steps
1. Review task details and requirements (Priority: High)
2. Examine legacy code references (Priority: High)
3. Begin with first element (Priority: High)

## Complete Task
When all elements of the task are complete and tested, you MUST complete the task.

## Addendums

### Full Project Context
You can refresh your knowledge of the project and this task in context by reading these files:
- pmc/product/06-aplio-mod-1-tasks.md (for detailed task specifications)
- pmc/core/progress.md (for overall project progress)`;
}

/**
 * Appends content to a history file with a separator
 * @param {string} filePath - Path to the history file
 * @param {string} content - Content to append
 * @returns {Promise<boolean>} Success status
 */
async function appendToHistoryFile(filePath, content) {
  try {
    const separator = '\n-----------------------------------------------------\n';
    const existingContent = fs.existsSync(filePath) ? await fs.promises.readFile(filePath, 'utf8') : '';
    const newContent = existingContent ? `${existingContent}${separator}${content}` : content;
    await fs.promises.writeFile(filePath, newContent);
    return true;
  } catch (error) {
    console.error(`Error appending to history file ${filePath}:`, error);
    return false;
  }
}

/**
 * Format test elements content
 * @param {Array} elements - Array of element objects
 * @param {string} taskId - Task ID
 * @param {Object} testingInfrastructure - Testing infrastructure data
 * @returns {string} - Formatted test elements content
 */
function formatTestElementsContent(elements, taskId, testingInfrastructure = {}) {
    if (!elements || elements.length === 0) {
        console.log('No elements to format for test content');
        return 'No elements to test for this task.';
    }
    
    console.log(`Formatting test content for ${elements.length} elements`);
    
    try {
        // Check for test locations in both testing infrastructure and task data
        let testLocations = testingInfrastructure.testLocations || '';
        console.log('Test locations for directory setup:', testLocations);
        
        // Format the test directory creation command if test locations are specified
        let dirSetupCommand = '';
        if (testLocations && testLocations.trim()) {
            dirSetupCommand = `2. Verify the test directory structure exists for this task:
   \`\`\`bash
   mkdir -p ${testLocations}
   \`\`\`

`;
        } else {
            console.log('No test locations specified for directory setup');
            dirSetupCommand = `2. Create appropriate test directories for this task based on your project structure.

`;
        }
        
        // Generate individual test sections for each element
        const elementTestSections = elements.map(element => {
            if (!element || !element.id) {
                console.warn('Invalid element encountered when formatting test content');
                return '';
            }
            
            // Extract the element ID without the task ID prefix
            let elementIdPart = '';
            try {
                elementIdPart = element.id.split(':')[1] || element.id;
            } catch (error) {
                console.error('Error extracting element ID part:', error);
                elementIdPart = element.id;
            }
            
            // Create the anchor for linking from the main task file
            const elementAnchor = `<a id="${taskId}-${elementIdPart}-Tests"></a>`;
            
            // Create the heading
            const elementDescription = element.description || 'No description';
            const heading = `### ${element.id} - ${elementDescription}`;
            
            // Generate test steps based on element type
            let testSteps;
            if (element.isSubElement) {
                testSteps = `1. Create unit tests for this sub-element:
   - Test that ${elementDescription.toLowerCase()}
   - Focus on testing just this specific functionality
   - Ensure test isolation from other sub-elements

2. Run unit tests and verify coverage:
   \`\`\`bash
   # Run the unit tests for this element
   npm test -- -t "${elementIdPart}"
   \`\`\`

3. Record test results and coverage:
   - [ ] All tests passing: Yes/No
   - [ ] Coverage percentage: __%
   - [ ] Issues encountered:`;
            } else {
                testSteps = `1. Create comprehensive test suite for this element:
   - Test all functionality described in the element
   - Include positive and negative test cases
   - Verify expected behavior in edge cases

2. Run the tests and verify coverage:
   \`\`\`bash
   # Run the tests for this element
   npm test -- -t "${elementIdPart}"
   \`\`\`

3. Record test results and coverage:
   - [ ] All tests passing: Yes/No
   - [ ] Coverage percentage: __%
   - [ ] Issues encountered:`;
            }
            
            return `${elementAnchor}
${heading}

${testSteps}`;
        }).filter(Boolean); // Remove any empty strings
        
        if (elementTestSections.length === 0) {
            console.warn('No valid element test sections generated');
            return 'No valid elements to test for this task.';
        }
        
        // Combine directory setup with element test sections
        return `${dirSetupCommand}${elementTestSections.join('\n\n')}`;
    } catch (error) {
        console.error('Error formatting test elements content:', error);
        return 'Error formatting test elements content.';
    }
}