const fs = require('fs');
const path = require('path');

/**
 * Ensures a path uses Windows-style backslashes
 * @param {string} filePath - The path to convert
 * @returns {string} - The path with Windows backslashes
 */
function ensureWindowsPath(filePath) {
  return filePath.replace(/\//g, '\\');
}

/**
 * Gets the base project directory by navigating up from cwd until finding the root
 * @returns {string} The absolute path to the base project directory
 */
function getBaseProjectDir() {
  // We're assuming the script is run from within the pmc directory
  // or a subdirectory of it
  const cwd = process.cwd();
  
  // If cwd contains 'pmc', navigate up to the parent directory
  // that contains the pmc directory
  if (cwd.includes('pmc')) {
    const parts = cwd.split(path.sep);
    const index = parts.indexOf('pmc');
    if (index > 0) {
      return parts.slice(0, index).join(path.sep);
    }
  }
  
  // Default: return the parent of the current directory
  return path.dirname(cwd);
}

// Main function to generate only the task-to-test mapping prompt files
function generateTestPromptsOnly() {
  console.log('Generating Task-to-Test Mapping prompt files only...');
  
  // Define directory paths
  const baseOutputDir = path.join(process.cwd(), 'product', '_mapping');
  const testMapsDir = path.join(baseOutputDir, 'test-maps');
  const promptsDir = path.join(testMapsDir, 'prompts');
  const taskFileMapsDir = path.join(baseOutputDir, 'task-file-maps');
  
  // Create prompts directory if it doesn't exist
  if (!fs.existsSync(promptsDir)) {
    fs.mkdirSync(promptsDir, { recursive: true });
  }
  
  // Check if task-file-maps directory exists
  if (!fs.existsSync(taskFileMapsDir)) {
    console.error(`Error: Task file maps directory not found at ${taskFileMapsDir}`);
    return;
  }
  
  // Get all task files from the task-file-maps directory
  const taskFiles = fs.readdirSync(taskFileMapsDir)
    .filter(file => file.match(/^\d+-aplio-mod-1-tasks-E\d+\.md$/))
    .sort();
  
  console.log(`Found ${taskFiles.length} task files in ${taskFileMapsDir}`);
  
  if (taskFiles.length === 0) {
    console.error('No task files found. Please check the directory path.');
    return;
  }
  
  // Process each task file
  taskFiles.forEach(taskFile => {
    console.log(`Processing task file: ${taskFile}`);
    
    // Extract section ID from the filename (E01, E02, etc.)
    const sectionMatch = taskFile.match(/E(\d+)\.md$/);
    if (!sectionMatch) {
      console.warn(`Could not extract section ID from filename: ${taskFile}. Skipping.`);
      return;
    }
    
    const paddedSectionId = sectionMatch[1];
    const sectionId = parseInt(paddedSectionId, 10).toString();
    
    // Read the task file
    const tasksContent = fs.readFileSync(path.join(taskFileMapsDir, taskFile), 'utf8');
    
    // Parse tasks from this file
    const tasks = parseTasks(tasksContent);
    console.log(`Parsed ${tasks.length} tasks from ${taskFile}`);
    
    // If tasks array is empty, skip this file
    if (tasks.length === 0) {
      console.warn(`No tasks found in ${taskFile}. Skipping.`);
      return;
    }
    
    // Create a customized prompt file for this section
    createCustomPromptFile(sectionId, paddedSectionId, promptsDir, tasks);
    
    console.log(`Prompt file for Section ${sectionId} generated successfully!`);
  });
  
  console.log('All prompt files have been regenerated.');
}

// Parse tasks, elements, and their relationships from the tasks file
function parseTasks(tasksContent) {
  const tasks = [];
  const lines = tasksContent.split('\n');
  
  let currentTask = null;
  let currentElement = null;
  let inAcceptanceCriteria = false;
  let acceptanceCriteriaText = '';
  let currentSection = null;
  
  // Regex patterns for parsing - match both ### and #### patterns for tasks
  const taskPattern = /^#{3,4} T-(\d+\.\d+\.\d+): (.+)$/;
  const elementPattern = /\[T-(\d+\.\d+\.\d+):ELE-(\d+)\] (.+)$/;
  const implementationStepPattern = /\[(\w+)-(\d+)\] (.+?)( \(implements ELE-(\d+)(?:, ELE-(\d+))?(?:, ELE-(\d+))?\))?$/;
  const validationStepPattern = /\[VAL-(\d+)\] (.+?)( \(validates ELE-(\d+)(?:, ELE-(\d+))?(?:, ELE-(\d+))?\))?$/;
  const metadataPattern = /- \*\*([^:]+)\*\*: (.+)$/;
  
  // Log a few lines to debug
  console.log('First 5 lines of task file:');
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    console.log(`Line ${i+1}: ${lines[i]}`);
  }
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for task headers
    const taskMatch = line.match(taskPattern);
    if (taskMatch) {
      console.log(`Found task: ${line}`);
      // If we found a new task, save the previous one if it exists
      if (currentTask) {
        tasks.push(currentTask);
      }
      
      // Start a new task
      currentTask = {
        id: taskMatch[1],
        title: taskMatch[2],
        metadata: {},
        acceptanceCriteria: '',
        elements: []
      };
      
      inAcceptanceCriteria = false;
      currentSection = 'metadata';
      continue;
    }
    
    // Check for acceptance criteria section
    if (line === '**Functional Requirements Acceptance Criteria**:' && currentTask) {
      inAcceptanceCriteria = true;
      currentSection = 'acceptanceCriteria';
      continue;
    }
    
    // Check for components/elements section
    if (line === '**Components/Elements**:' && currentTask) {
      inAcceptanceCriteria = false;
      currentSection = 'elements';
      continue;
    }
    
    // Check for implementation process section
    if (line === '**Implementation Process**:' && currentTask) {
      currentSection = 'implementation';
      continue;
    }
    
    // Process lines based on current section
    if (currentTask) {
      // Metadata section
      if (currentSection === 'metadata') {
        const metadataMatch = line.match(metadataPattern);
        if (metadataMatch) {
          currentTask.metadata[metadataMatch[1]] = metadataMatch[2].trim();
        }
      }
      
      // Acceptance criteria section
      if (inAcceptanceCriteria) {
        if (line && !line.startsWith('#')) {
          currentTask.acceptanceCriteria += line + '\n';
        }
      }
      
      // Elements section
      if (currentSection === 'elements') {
        const elementMatch = line.match(elementPattern);
        if (elementMatch) {
          currentElement = {
            taskId: elementMatch[1],
            id: elementMatch[2],
            name: elementMatch[3],
            implementationSteps: [],
            validationSteps: []
          };
          currentTask.elements.push(currentElement);
        }
      }
      
      // Implementation and validation steps
      if (currentSection === 'implementation') {
        // Check for implementation steps (PREP, IMP, etc.)
        const impMatch = line.match(implementationStepPattern);
        if (impMatch) {
          const stepType = impMatch[1]; // PREP, IMP, etc.
          const stepId = impMatch[2];
          const description = impMatch[3];
          const elementsClause = impMatch[4] || '';
          
          // Extract element IDs if present
          const elements = [];
          if (impMatch[5]) elements.push(impMatch[5]);
          if (impMatch[6]) elements.push(impMatch[6]);
          if (impMatch[7]) elements.push(impMatch[7]);
          
          // Store the full text of the step including the "(implements ELE-X)" part
          const fullText = line.replace(/^\s*-\s*/, ''); // Remove leading dash and spaces
          
          if (elements.length > 0) {
            elements.forEach(elementId => {
              const element = currentTask.elements.find(e => e.id === elementId);
              if (element) {
                if (stepType === 'IMP') {
                  element.implementationSteps.push({
                    id: stepId,
                    description: description,
                    fullText: fullText,
                    elementsClause: elementsClause,
                    stepType: stepType
                  });
                } else if (stepType === 'PREP') {
                  if (!element.preparationSteps) {
                    element.preparationSteps = [];
                  }
                  element.preparationSteps.push({
                    id: stepId,
                    description: description,
                    fullText: fullText,
                    elementsClause: elementsClause,
                    stepType: stepType
                  });
                }
              }
            });
          }
        }
        
        // Check for validation steps
        const valMatch = line.match(validationStepPattern);
        if (valMatch) {
          const stepId = valMatch[1];
          const description = valMatch[2];
          const elementsClause = valMatch[3] || '';
          
          // Extract element IDs if present
          const elements = [];
          if (valMatch[4]) elements.push(valMatch[4]);
          if (valMatch[5]) elements.push(valMatch[5]);
          if (valMatch[6]) elements.push(valMatch[6]);
          
          // Store the full text of the step including the "(validates ELE-X)" part
          const fullText = line.replace(/^\s*-\s*/, ''); // Remove leading dash and spaces
          
          if (elements.length > 0) {
            elements.forEach(elementId => {
              const element = currentTask.elements.find(e => e.id === elementId);
              if (element) {
                element.validationSteps.push({
                  id: stepId,
                  description: description,
                  fullText: fullText,
                  elementsClause: elementsClause
                });
              }
            });
          }
        }
      }
    }
  }
  
  // Add the last task if it exists
  if (currentTask) {
    tasks.push(currentTask);
  }
  
  return tasks;
}

// Function to extract the task range from a list of tasks
function getTaskRange(tasks) {
  if (!tasks || tasks.length === 0) {
    return '';
  }
  
  // Sort tasks by ID
  const sortedTasks = [...tasks].sort((a, b) => {
    const aParts = a.id.split('.').map(Number);
    const bParts = b.id.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
      if (aParts[i] !== bParts[i]) {
        return aParts[i] - bParts[i];
      }
    }
    
    return 0;
  });
  
  // Get the first and last task IDs
  const firstTaskId = sortedTasks[0].id;
  const lastTaskId = sortedTasks[sortedTasks.length - 1].id;
  
  return `T-${firstTaskId} - T-${lastTaskId}`;
}

// Create a customized prompt file for a specific section
function createCustomPromptFile(sectionId, paddedSectionId, promptsDir, sectionTasks) {
  try {
    // Read the prompt template
    const templatePath = path.join(process.cwd(), 'product', '_prompt_engineering', '06b-task-test-mapping-creation-prompt-v3.md');
    const promptTemplate = fs.readFileSync(templatePath, 'utf8');
    
    // Extract the task range for this section
    const taskRange = getTaskRange(sectionTasks);
    
    // Get a sample task ID to create a Windows-style test location path
    const firstTask = sectionTasks[0];
    if (firstTask) {
      // Get base project directory
      const baseProjectDir = getBaseProjectDir();
      
      // Create test paths like the ones in the task files
      const taskId = firstTask.id;
      const baseFolderNumber = firstTask.id.split('.')[0];
      const testRelativePath = `pmc/system/test/unit-tests/task-${baseFolderNumber}/T-${taskId}/`;
      const fullTestPath = ensureWindowsPath(path.join(baseProjectDir, testRelativePath));
      
      // Update any example test paths in the template
      let customizedPrompt = promptTemplate
        // Update the current task range
        .replace(/\*\*Current Task Range\*\*:.+/g, `**Current Task Range**: ${taskRange}`)
        // Update any example test paths
        .replace(/pmc\/system\/test\/unit-tests\/task-[0-9\-]+\/T-[0-9\.]+\//g, 
                 `\`${fullTestPath}\``);
                 
      // Replace [two-digit-task-number] with the actual paddedSectionId in the file path
      customizedPrompt = customizedPrompt.replace(
        /\[two-digit-task-number\]/g,
        paddedSectionId
      );
      
      // Write the customized prompt file
      const promptFilePath = path.join(promptsDir, `06b-task-test-mapping-creation-prompt-v3-E${paddedSectionId}.md`);
      fs.writeFileSync(promptFilePath, customizedPrompt);
      
      console.log(`Customized prompt file created at: ${promptFilePath}`);
      console.log(`Task range set to: ${taskRange}`);
    } else {
      // Just update the task range if no tasks available for creating paths
      let customizedPrompt = promptTemplate.replace(
        /\*\*Current Task Range\*\*:.+/g,
        `**Current Task Range**: ${taskRange}`
      );
      
      // Replace [two-digit-task-number] with the actual paddedSectionId in the file path
      customizedPrompt = customizedPrompt.replace(
        /\[two-digit-task-number\]/g,
        paddedSectionId
      );
      
      // Write the customized prompt file
      const promptFilePath = path.join(promptsDir, `06b-task-test-mapping-creation-prompt-v3-E${paddedSectionId}.md`);
      fs.writeFileSync(promptFilePath, customizedPrompt);
      
      console.log(`Customized prompt file created at: ${promptFilePath}`);
      console.log(`Task range set to: ${taskRange}`);
    }
  } catch (error) {
    console.error(`Error creating customized prompt file for section ${sectionId}:`, error);
  }
}

// Call the main function if this script is run directly
if (require.main === module) {
  generateTestPromptsOnly();
}

// Export the function for use as a module
module.exports = {
  generateTestPromptsOnly
};