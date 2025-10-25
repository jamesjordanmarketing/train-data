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

/**
 * Gets command line arguments and validates them
 * @returns {Object} Object containing productName and productAbbr
 */
function getCommandLineArguments() {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.error('Error: Both project name and product abbreviation are required as command line arguments.');
    console.error('Usage: node 07-generate-task-test-mapping_v3.js "<Project Name>" <product-abbr>');
    console.error('Example: node 07-generate-task-test-mapping_v3.js "Document Categorization Module" bmo');
    process.exit(1);
  }
  return {
    productName: args[0],
    productAbbr: args[1]
  };
}

/**
 * Extract project information from functional requirements file
 * @param {string} productAbbr - Product abbreviation for filename
 * @returns {Object} Object containing project title and summary
 */
function extractProjectInformation(productAbbr) {
  try {
    const frFilePath = path.join(process.cwd(), 'product', `03-${productAbbr}-functional-requirements.md`);
    
    if (!fs.existsSync(frFilePath)) {
      console.warn(`Functional requirements file not found at ${frFilePath}, using defaults`);
      return {
        projectTitle: `${productAbbr.toUpperCase()} Project`,
        projectSummary: `This document defines the functional requirements and testing approach for the ${productAbbr.toUpperCase()} project.`
      };
    }
    
    const frContent = fs.readFileSync(frFilePath, 'utf8');
    const lines = frContent.split('\n');
    
    let projectTitle = `${productAbbr.toUpperCase()} Project`;
    let projectSummary = '';
    
    // Extract title from first heading
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i].trim();
      if (line.startsWith('# ')) {
        projectTitle = line.replace(/^#\s*/, '');
        break;
      }
    }
    
    // Extract summary from Executive Summary section
    let inSummary = false;
    let summaryLines = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine === '## Executive Summary') {
        inSummary = true;
        continue;
      }
      
      if (inSummary) {
        if (trimmedLine.startsWith('##') && trimmedLine !== '## Executive Summary') {
          break; // End of Executive Summary section
        }
        
        if (trimmedLine && !trimmedLine.startsWith('**')) {
          summaryLines.push(trimmedLine);
        }
      }
    }
    
    if (summaryLines.length > 0) {
      projectSummary = summaryLines.join(' ').substring(0, 500) + (summaryLines.join(' ').length > 500 ? '...' : '');
    } else {
      projectSummary = `This document defines the functional requirements and testing approach for the ${projectTitle}.`;
    }
    
    console.log(`Extracted project info - Title: "${projectTitle}", Summary length: ${projectSummary.length} chars`);
    
    return {
      projectTitle,
      projectSummary
    };
    
  } catch (error) {
    console.error('Error extracting project information:', error);
    return {
      projectTitle: `${productAbbr.toUpperCase()} Project`,
      projectSummary: `This document defines the functional requirements and testing approach for the ${productAbbr.toUpperCase()} project.`
    };
  }
}

/**
 * Replace template variables in content
 * @param {string} content - Content with template variables
 * @param {Object} variables - Object containing variable replacements
 * @returns {string} Content with variables replaced
 */
function replaceTemplateVariables(content, variables) {
  let result = content;
  
  // Replace template variables with actual values
  Object.keys(variables).forEach(key => {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), variables[key]);
  });
  
  return result;
}

// Main function to generate the task-to-test mapping document
function generateTaskTestMapping() {
  const { productName, productAbbr } = getCommandLineArguments();
  console.log(`Generating Task-to-Test Mapping documents for: "${productName}" (${productAbbr})...`);
  
  // Extract project information from functional requirements
  const projectInfo = extractProjectInformation(productAbbr);
  
  // Create output directories if they don't exist
  const baseOutputDir = path.join(process.cwd(), 'product', '_mapping');
  if (!fs.existsSync(baseOutputDir)) {
    fs.mkdirSync(baseOutputDir, { recursive: true });
  }
  
  const testMapsDir = path.join(baseOutputDir, 'test-maps');
  if (!fs.existsSync(testMapsDir)) {
    fs.mkdirSync(testMapsDir, { recursive: true });
  }

  const promptsDir = path.join(testMapsDir, 'prompts');
  if (!fs.existsSync(promptsDir)) {
    fs.mkdirSync(promptsDir, { recursive: true });
  }
  
  // Define task-file-maps directory path
  const taskFileMapsDir = path.join(baseOutputDir, 'task-file-maps');
  
  // Check if task-file-maps directory exists
  if (!fs.existsSync(taskFileMapsDir)) {
    console.error(`Error: Task file maps directory not found at ${taskFileMapsDir}`);
    return;
  }
  
  // Get all task files from the task-file-maps directory using dynamic product abbreviation
  const taskFilePattern = new RegExp(`^\\d+-${productAbbr}-tasks-E\\d+\\.md$`);
  const taskFiles = fs.readdirSync(taskFileMapsDir)
    .filter(file => taskFilePattern.test(file))
    .sort();
  
  console.log(`Found ${taskFiles.length} task files in ${taskFileMapsDir}`);
  
  if (taskFiles.length === 0) {
    console.error('No task files found. Please check the directory path.');
    // Try to process the legacy file for backward compatibility
    processLegacyTaskFile(baseOutputDir, testMapsDir, promptsDir, productName, productAbbr, projectInfo);
    return;
  }
  
  // Array to store all tasks from all files for consolidated output
  const allTasks = [];
  const taskGroups = {};
  
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
    
    // Add tasks to allTasks array for consolidated output
    allTasks.push(...tasks);
    
    // Group tasks by major section
    tasks.forEach(task => {
      const majorSection = task.id.split('.')[0];
      if (!taskGroups[majorSection]) {
        taskGroups[majorSection] = [];
      }
      taskGroups[majorSection].push(task);
    });
    
    // If tasks array is empty, skip this file
    if (tasks.length === 0) {
      console.warn(`No tasks found in ${taskFile}. Skipping.`);
      return;
    }
    
    // Get the section name from the tasks
    const sectionName = getSectionName(sectionId, tasks);
    
    // Generate the mapping document for this section
    const mappingDocument = generateMappingStructure(tasks, sectionId, sectionName, productName, projectInfo);
    
    // Add placeholders for human input
    const documentWithPlaceholders = addHumanInputPlaceholders(mappingDocument);
    
    // Write the output markdown file to the test-maps directory using dynamic product abbreviation
    const mdOutputPath = path.join(testMapsDir, `06-${productAbbr}-task-test-mapping-E${paddedSectionId}.md`);
    fs.writeFileSync(mdOutputPath, documentWithPlaceholders);
    
    // Create a customized prompt file for this section
    createCustomPromptFile(sectionId, paddedSectionId, promptsDir, tasks, productAbbr, projectInfo);
    
    console.log(`Task-to-Test mapping for Section ${sectionId} generated successfully!`);
    console.log(`Output: ${mdOutputPath}`);
  });
  
    // For backward compatibility, create a consolidated file with all tasks
  if (allTasks.length > 0) {
    const consolidatedDocument = generateConsolidatedDocument(allTasks, productName, projectInfo);
    const documentWithPlaceholders = addHumanInputPlaceholders(consolidatedDocument);
    
    // Write the consolidated MD output file
    const consolidatedMdPath = path.join(baseOutputDir, '07-task-bmo-testing-built.md');
    fs.writeFileSync(consolidatedMdPath, documentWithPlaceholders);
    
    console.log(`Consolidated task-to-test mapping generated at: ${consolidatedMdPath}`);
    
    // Create a consolidated index file using dynamic product abbreviation
    const consolidatedIndex = generateConsolidatedIndex(taskGroups, productName, productAbbr);
    const indexPath = path.join(testMapsDir, `06-${productAbbr}-task-test-mapping-index.md`);
    fs.writeFileSync(indexPath, consolidatedIndex);
    console.log(`Consolidated index generated at: ${indexPath}`);
  }
}

// Function to process the legacy task file for backward compatibility
function processLegacyTaskFile(baseOutputDir, testMapsDir, promptsDir, productName, productAbbr, projectInfo) {
  console.log('Attempting to process legacy task file...');
  
  try {
    // Try to read the legacy tasks file using dynamic product abbreviation
    const legacyFilePath = path.join(process.cwd(), 'product', `06-${productAbbr}-tasks.md`);
    if (!fs.existsSync(legacyFilePath)) {
      console.error(`Legacy task file not found at ${legacyFilePath}`);
      return;
    }
    
    const tasksContent = fs.readFileSync(legacyFilePath, 'utf8');
    console.log('Successfully read the legacy tasks file');
    
    // Parse tasks from the legacy file
    const tasks = parseTasks(tasksContent);
    console.log(`Parsed ${tasks.length} tasks from legacy file`);
    
    if (tasks.length === 0) {
      console.error('No tasks found in legacy file.');
      return;
    }
    
    // Group tasks by major section
    const taskGroups = {};
    tasks.forEach(task => {
      const majorSection = task.id.split('.')[0];
      if (!taskGroups[majorSection]) {
        taskGroups[majorSection] = [];
      }
      taskGroups[majorSection].push(task);
    });
    
    // Generate consolidated document
    const consolidatedDocument = generateConsolidatedDocument(tasks, productName, projectInfo);
    const documentWithPlaceholders = addHumanInputPlaceholders(consolidatedDocument);
    
    // Write the consolidated MD output file
    const consolidatedMdPath = path.join(baseOutputDir, '07-task-bmo-testing-built.md');
    fs.writeFileSync(consolidatedMdPath, documentWithPlaceholders);
    
    console.log(`Consolidated task-to-test mapping generated at: ${consolidatedMdPath}`);
    
    // Process each section separately
    Object.keys(taskGroups).sort().forEach(sectionId => {
      const sectionTasks = taskGroups[sectionId];
      const sectionName = getSectionName(sectionId, tasks);
      const paddedSectionId = sectionId.padStart(2, '0');
      
      // Generate the mapping document for this section
      const mappingDocument = generateMappingStructure(sectionTasks, sectionId, sectionName, productName, projectInfo);
      
      // Add placeholders for human input
      const documentWithPlaceholders = addHumanInputPlaceholders(mappingDocument);
      
      // Write the output markdown file to the test-maps directory using dynamic product abbreviation
      const mdOutputPath = path.join(testMapsDir, `06-${productAbbr}-task-test-mapping-E${paddedSectionId}.md`);
      fs.writeFileSync(mdOutputPath, documentWithPlaceholders);
      
      // Create a customized prompt file for this section
      createCustomPromptFile(sectionId, paddedSectionId, promptsDir, sectionTasks, productAbbr, projectInfo);
      
      console.log(`Task-to-Test mapping for Section ${sectionId} generated successfully!`);
      console.log(`Output: ${mdOutputPath}`);
    });
    
    // Create a consolidated index file using dynamic product abbreviation
    const consolidatedIndex = generateConsolidatedIndex(taskGroups, productName, productAbbr);
    const indexPath = path.join(testMapsDir, `06-${productAbbr}-task-test-mapping-index.md`);
    fs.writeFileSync(indexPath, consolidatedIndex);
    console.log(`Consolidated index generated at: ${indexPath}`);
  } catch (error) {
    console.error('Error processing legacy task file:', error);
  }
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
function createCustomPromptFile(sectionId, paddedSectionId, promptsDir, sectionTasks, productAbbr, projectInfo) {
  try {
    // Read the prompt template - check for v4 first, then fallback to v3
    let templatePath = path.join(process.cwd(), 'product', '_prompt_engineering', '7-task-test-mapping-creation-prompt-v4.md');
    let promptVersion = 'v4';
    
    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(process.cwd(), 'product', '_prompt_engineering', '06b-task-test-mapping-creation-prompt-v3.md');
      promptVersion = 'v3';
    }
    
    if (!fs.existsSync(templatePath)) {
      console.error(`Prompt template not found at either v4 or v3 locations`);
      return;
    }
    
    const promptTemplate = fs.readFileSync(templatePath, 'utf8');
    
    // Extract the task range for this section
    const taskRange = getTaskRange(sectionTasks);
    
    // Prepare template variables for replacement
    const templateVariables = {
      'PROJECT_TITLE': projectInfo.projectTitle,
      'PROJECT_SUMMARY': projectInfo.projectSummary
    };
    
    // Replace template variables first
    let customizedPrompt = replaceTemplateVariables(promptTemplate, templateVariables);
    
    // Replace the "Current Task Range" placeholder with the actual task range for this section
    customizedPrompt = customizedPrompt.replace(
      /\*\*Current Task Range\*\*:.+/g,
      `**Current Task Range**: ${taskRange}`
    );
    
    // Replace [two-digit-task-number] with the actual paddedSectionId in the file path
    customizedPrompt = customizedPrompt.replace(
      /\[two-digit-task-number\]/g,
      paddedSectionId
    );
    
    // Replace product abbreviation placeholders if they exist in the template
    customizedPrompt = customizedPrompt.replace(
      /\[product-abbreviation\]/g,
      productAbbr
    );
    
    // Replace hardcoded "aplio-mod-1" references with dynamic product abbreviation
    customizedPrompt = customizedPrompt.replace(
      /aplio-mod-1/g,
      productAbbr
    );
    
    // Write the customized prompt file using dynamic naming
    const promptFileName = promptVersion === 'v4' 
      ? `7-task-test-mapping-creation-prompt-v4-E${paddedSectionId}.md`
      : `06b-task-test-mapping-creation-prompt-v3-E${paddedSectionId}.md`;
    
    const promptFilePath = path.join(promptsDir, promptFileName);
    fs.writeFileSync(promptFilePath, customizedPrompt);
    
    console.log(`Customized prompt file created at: ${promptFilePath}`);
    console.log(`Task range set to: ${taskRange}`);
  } catch (error) {
    console.error(`Error creating customized prompt file for section ${sectionId}:`, error);
  }
}

// Generate a consolidated document with all tasks
function generateConsolidatedDocument(tasks, productName, projectInfo) {
  let output = '';
  
  // Document header with dynamic product name
  output += `# ${projectInfo.projectTitle} - Task to Test Mapping\n`;
  output += `**Generated:** ${new Date().toISOString().split('T')[0]}\n\n`;
  
  output += '## Overview\n';
  output += 'This document maps tasks (T-X.Y.Z) and their elements (ELE-n) to their corresponding test requirements and implementation details. Each task element may be covered by multiple implementation steps (IMP-n) and validation steps (VAL-n).\n\n';
  
  // Group tasks by major section (1.x.x, 2.x.x, etc.)
  const taskGroups = {};
  tasks.forEach(task => {
    const majorSection = task.id.split('.')[0];
    if (!taskGroups[majorSection]) {
      taskGroups[majorSection] = [];
    }
    taskGroups[majorSection].push(task);
  });
  
  // Generate content for each major section
  Object.keys(taskGroups).sort().forEach(sectionId => {
    const sectionName = getSectionName(sectionId, tasks);
    output += `## ${sectionId}. ${sectionName}\n\n`;
    
    // Process tasks in this section - first process parent tasks (X.Y.0), then their children
    const parentTasks = taskGroups[sectionId].filter(task => task.id.endsWith('.0'));
    
    console.log(`Section ${sectionId}: Found ${parentTasks.length} parent tasks`);
    parentTasks.forEach(pt => console.log(`  - ${pt.id}: ${pt.title}`));
    
    // Process each parent task
    parentTasks.forEach(parentTask => {
      // Add parent task section (### T-X.Y.0)
      output += `### T-${parentTask.id}: ${parentTask.title}\n\n`;
      
      // Add parent metadata
      output += `- **FR Reference**: ${parentTask.metadata['FR Reference'] || ''}\n`;
      output += `- **Impact Weighting**: ${parentTask.metadata['Impact Weighting'] || ''}\n`;
      output += `- **Dependencies**: ${parentTask.metadata['Dependencies'] || ''}\n`;
      output += `- **Description**: ${parentTask.metadata['Description'] || ''}\n`;
      output += `- **Completes Component?**: ${parentTask.metadata['Completes Component?'] || ''}\n\n`;
      
      // Add Functional Requirements Acceptance Criteria
      output += '**Functional Requirements Acceptance Criteria**:\n';
      output += parentTask.acceptanceCriteria + '\n';
      
      // Find and process child tasks for this parent
      const childTasks = taskGroups[sectionId].filter(task => {
        const taskParts = task.id.split('.');
        return taskParts[0] === parentTask.id.split('.')[0] && 
               taskParts[1] === parentTask.id.split('.')[1] && 
               taskParts[2] !== '0';
      });
      
      console.log(`  Task ${parentTask.id} has ${childTasks.length} children`);
      
      // Process each child task
      childTasks.forEach(task => {
        // Use #### for child tasks (T-X.Y.Z where Z ≠ 0)
        output += `#### T-${task.id}: ${task.title}\n\n`;
        
        // Add child metadata
        output += `- **Parent Task**: ${task.metadata['Parent Task'] || ''}\n`;
        output += `- **Implementation Location**: ${task.metadata['Implementation Location'] || ''}\n`;
        output += `- **Patterns**: ${task.metadata['Pattern'] || ''}\n`;
        output += `- **Dependencies**: ${task.metadata['Dependencies'] || ''}\n`;
        output += `- **Estimated Human Testing Hours**: \n`;
        output += `- **Description**: ${task.metadata['Description'] || ''}\n\n`;
        
        // Test Coverage Requirements
        output += '#### Test Coverage Requirements\n';
        const taskParts = task.id.split('.');
        const taskDirName = `task-${taskParts[0]}-${taskParts[1]}`;
        const testRelativePath = `pmc/system/test/unit-tests/${taskDirName}/T-${task.id}/`;
        // Create Windows-style absolute path
        const baseProjectDir = getBaseProjectDir();
        const fullTestPath = ensureWindowsPath(path.join(baseProjectDir, testRelativePath));
        const testLocation = task.metadata['Test Locations'] || `\`${fullTestPath}\``;
        output += `- **Test Location**: ${testLocation}\n`;
        output += `- **Testing Tools**: \n`;
        output += `- **Coverage Target**: ${task.metadata['Test Coverage Requirements'] || '90% code coverage'}\n\n`;
        
        // Component Completion
        if (task.metadata['Completes Component?'] && task.metadata['Completes Component?'].trim() === 'Yes') {
          output += '- **Component Completion**:\n';
          output += '  - **Completes Component**: Yes\n';
          if (task.metadata['Component Name']) {
            output += `  - **Component Name**: ${task.metadata['Component Name']}\n`;
          }
          output += '  - **Component Testing Reference**: This component will be tested according to the Component Testing Specification document after task completion.\n\n';
        }
        
        // Acceptance Criteria
        output += '#### Acceptance Criteria\n';
        output += task.acceptanceCriteria + '\n';
        
        // Element Test Mapping
        output += '#### Element Test Mapping\n\n';
        
        // Process each element
        task.elements.forEach(element => {
          output += `##### [T-${element.taskId}:ELE-${element.id}] ${element.name}\n`;
          
          // Preparation Steps (if any)
          if (element.preparationSteps && element.preparationSteps.length > 0) {
            output += '- **Preparation Steps**:\n';
            element.preparationSteps.forEach(step => {
              // Use the fullText but avoid duplicating the step ID
              output += `  - ${step.fullText}\n`;
            });
          }
          
          // Implementation Steps
          if (element.implementationSteps.length > 0) {
            output += '- **Implementation Steps**:\n';
            element.implementationSteps.forEach(step => {
              // Use the fullText but avoid duplicating the step ID
              output += `  - ${step.fullText}\n`;
            });
          }
          
          // Validation Steps
          if (element.validationSteps.length > 0) {
            output += '- **Validation Steps**:\n';
            element.validationSteps.forEach(step => {
              // Use the fullText but avoid duplicating the step ID
              output += `  - ${step.fullText}\n`;
            });
          }
          
          // Add placeholder for test requirements, deliverables, and verification items
          // These will be filled out by addHumanInputPlaceholders
          output += '- **Test Requirements**:\n';
          output += '- **Testing Deliverables**:\n';
          output += '- **Human Verification Items**:\n\n';
        });
      });
    });
  });
  
  return output;
}

// Generate the mapping document structure for a specific section
function generateMappingStructure(tasks, sectionId, sectionName, productName, projectInfo) {
  let output = '';
  
  // Document header with dynamic product name
  output += `# ${projectInfo.projectTitle} - Task to Test Mapping - Section ${sectionId}\n`;
  output += `**Generated:** ${new Date().toISOString().split('T')[0]}\n\n`;
  
  output += '## Overview\n';
  output += `This document maps tasks (T-${sectionId}.Y.Z) and their elements (ELE-n) to their corresponding test requirements and implementation details. Each task element may be covered by multiple implementation steps (IMP-n) and validation steps (VAL-n).\n\n`;
  
  // Generate content for this section
  output += `## ${sectionId}. ${sectionName}\n\n`;
  
  // Process tasks in this section - first process parent tasks (X.Y.0), then their children
  const parentTasks = tasks.filter(task => task.id.endsWith('.0'));
  
  console.log(`Section ${sectionId}: Found ${parentTasks.length} parent tasks`);
  parentTasks.forEach(pt => console.log(`  - ${pt.id}: ${pt.title}`));
  
  // Process each parent task
  parentTasks.forEach(parentTask => {
    // Add parent task section (### T-X.Y.0)
    output += `### T-${parentTask.id}: ${parentTask.title}\n\n`;
    
    // Add parent metadata
    output += `- **FR Reference**: ${parentTask.metadata['FR Reference'] || ''}\n`;
    output += `- **Impact Weighting**: ${parentTask.metadata['Impact Weighting'] || ''}\n`;
    output += `- **Dependencies**: ${parentTask.metadata['Dependencies'] || ''}\n`;
    output += `- **Description**: ${parentTask.metadata['Description'] || ''}\n`;
    output += `- **Completes Component?**: ${parentTask.metadata['Completes Component?'] || ''}\n\n`;
    
    // Add Functional Requirements Acceptance Criteria
    output += '**Functional Requirements Acceptance Criteria**:\n';
    output += parentTask.acceptanceCriteria + '\n';
    
    // Find and process child tasks for this parent
    const childTasks = tasks.filter(task => {
      const taskParts = task.id.split('.');
      return taskParts[0] === parentTask.id.split('.')[0] && 
             taskParts[1] === parentTask.id.split('.')[1] && 
             taskParts[2] !== '0';
    });
    
    console.log(`  Task ${parentTask.id} has ${childTasks.length} children`);
    
    // Process each child task
    childTasks.forEach(task => {
      // Use #### for child tasks (T-X.Y.Z where Z ≠ 0)
      output += `#### T-${task.id}: ${task.title}\n\n`;
      
      // Add child metadata
      output += `- **Parent Task**: ${task.metadata['Parent Task'] || ''}\n`;
      output += `- **Implementation Location**: ${task.metadata['Implementation Location'] || ''}\n`;
      output += `- **Patterns**: ${task.metadata['Pattern'] || ''}\n`;
      output += `- **Dependencies**: ${task.metadata['Dependencies'] || ''}\n`;
      output += `- **Estimated Human Testing Hours**: \n`;
      output += `- **Description**: ${task.metadata['Description'] || ''}\n\n`;
      
      // Test Coverage Requirements
      output += '#### Test Coverage Requirements\n';
      const taskParts = task.id.split('.');
      const taskDirName = `task-${taskParts[0]}-${taskParts[1]}`;
      const testRelativePath = `pmc/system/test/unit-tests/${taskDirName}/T-${task.id}/`;
      // Create Windows-style absolute path
      const baseProjectDir = getBaseProjectDir();
      const fullTestPath = ensureWindowsPath(path.join(baseProjectDir, testRelativePath));
      const testLocation = task.metadata['Test Locations'] || `\`${fullTestPath}\``;
      output += `- **Test Location**: ${testLocation}\n`;
      output += `- **Testing Tools**: \n`;
      output += `- **Coverage Target**: ${task.metadata['Test Coverage Requirements'] || '90% code coverage'}\n\n`;
      
      // Component Completion
      if (task.metadata['Completes Component?'] && task.metadata['Completes Component?'].trim() === 'Yes') {
        output += '- **Component Completion**:\n';
        output += '  - **Completes Component**: Yes\n';
        if (task.metadata['Component Name']) {
          output += `  - **Component Name**: ${task.metadata['Component Name']}\n`;
        }
        output += '  - **Component Testing Reference**: This component will be tested according to the Component Testing Specification document after task completion.\n\n';
      }
      
      // Acceptance Criteria
      output += '#### Acceptance Criteria\n';
      output += task.acceptanceCriteria + '\n';
      
      // Element Test Mapping
      output += '#### Element Test Mapping\n\n';
      
      // Process each element
      task.elements.forEach(element => {
        output += `##### [T-${element.taskId}:ELE-${element.id}] ${element.name}\n`;
        
        // Preparation Steps (if any)
        if (element.preparationSteps && element.preparationSteps.length > 0) {
          output += '- **Preparation Steps**:\n';
          element.preparationSteps.forEach(step => {
            // Use the fullText but avoid duplicating the step ID
            output += `  - ${step.fullText}\n`;
          });
        }
        
        // Implementation Steps
        if (element.implementationSteps.length > 0) {
          output += '- **Implementation Steps**:\n';
          element.implementationSteps.forEach(step => {
            // Use the fullText but avoid duplicating the step ID
            output += `  - ${step.fullText}\n`;
          });
        }
        
        // Validation Steps
        if (element.validationSteps.length > 0) {
          output += '- **Validation Steps**:\n';
          element.validationSteps.forEach(step => {
            // Use the fullText but avoid duplicating the step ID
            output += `  - ${step.fullText}\n`;
          });
        }
        
        // Add placeholder for test requirements, deliverables, and verification items
        // These will be filled out by addHumanInputPlaceholders
        output += '- **Test Requirements**:\n';
        output += '- **Testing Deliverables**:\n';
        output += '- **Human Verification Items**:\n\n';
      });
    });
  });
  
  return output;
}

// Generate a consolidated index file that links to all individual section files
function generateConsolidatedIndex(taskGroups, productName, productAbbr) {
  let output = '';
  
  // Document header with dynamic product name
  output += `# ${productName} - Task to Test Mapping Index\n`;
  output += `**Generated:** ${new Date().toISOString().split('T')[0]}\n\n`;
  
  output += '## Overview\n';
  output += 'This document serves as an index to the task-to-test mapping documents that have been split by major sections.\n\n';
  
  output += '## Section Files\n\n';
  
  // List all section files with links using dynamic product abbreviation
  Object.keys(taskGroups).sort().forEach(sectionId => {
    const sectionName = getSectionName(sectionId, [].concat(...Object.values(taskGroups)));
    const paddedSectionId = sectionId.padStart(2, '0');
    output += `- [Section ${sectionId}: ${sectionName}](./06-${productAbbr}-task-test-mapping-E${paddedSectionId}.md)\n`;
  });
  
  return output;
}

// Add placeholders for sections requiring human input
function addHumanInputPlaceholders(mappingDocument) {
  // Replace all instances of "- **Test Requirements**:" with human input placeholders
  let documentWithPlaceholders = mappingDocument.replace(
    /- \*\*Test Requirements\*\*:/g, 
    '- **Test Requirements**: [NEEDS THINKING INPUT]\n  - [Placeholder for test requirement]\n  - [Placeholder for test requirement]'
  );
  
  // Replace all instances of "- **Testing Deliverables**:" with human input placeholders
  documentWithPlaceholders = documentWithPlaceholders.replace(
    /- \*\*Testing Deliverables\*\*:/g, 
    '- **Testing Deliverables**: [NEEDS THINKING INPUT]\n  - [Placeholder for testing deliverable]\n  - [Placeholder for testing deliverable]'
  );
  
  // Replace all instances of "- **Human Verification Items**:" with human input placeholders
  documentWithPlaceholders = documentWithPlaceholders.replace(
    /- \*\*Human Verification Items\*\*:/g, 
    '- **Human Verification Items**: [NEEDS THINKING INPUT]\n  - [Placeholder for human verification item]\n  - [Placeholder for human verification item]'
  );
  
  return documentWithPlaceholders;
}

// Helper function to get the section name
function getSectionName(sectionId, tasks) {
  // Find a task in this section to extract the section name
  const taskInSection = tasks.find(t => t.id.startsWith(`${sectionId}.`));
  
  if (taskInSection) {
    // Extract major section from metadata if available
    const majorSection = taskInSection.metadata['Major Section'];
    if (majorSection) {
      return majorSection;
    }
  }
  
  // Fallback section names based on common structure
  const sectionNames = {
    '1': 'Project Foundation',
    '2': 'Core Framework',
    '3': 'UI Components',
    '4': 'Business Logic',
    '5': 'Testing and QA',
    '6': 'Deployment and DevOps'
  };
  
  return sectionNames[sectionId] || `Section ${sectionId}`;
}

// Call the main function if this script is run directly
if (require.main === module) {
  generateTaskTestMapping();
}

// Export the function for use as a module
module.exports = {
  generateTaskTestMapping,
  extractProjectInformation,
  replaceTemplateVariables
};
