#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory path of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths relative to this script
const projectRoot = path.resolve(__dirname, '../../');
// New: Path to task file maps directory instead of a single file
const taskMapsDir = path.join(projectRoot, 'product', '_mapping', 'task-file-maps');
// Original hardcoded path for backward compatibility
const legacyTasksFilePath = path.join(projectRoot, 'product', '06-aplio-mod-1-tasks.md');
const progressFilePath = path.join(projectRoot, 'core', 'progress.md');
// New: Path for the phase-focused progress file
const progressPhaseFilePath = path.join(projectRoot, 'core', 'progress-phase.md');

// Format timestamp in a human-readable format
function formatTimestamp(date = new Date()) {
  const options = {
    timeZone: 'America/Los_Angeles',
    hour12: true,
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleString('en-US', options);
}

// New: Function to discover task files
function discoverTaskFiles() {
  try {
    // Check if the directory exists
    if (!fs.existsSync(taskMapsDir)) {
      console.log(`Task maps directory does not exist: ${taskMapsDir}`);
      // Fall back to legacy file if it exists
      if (fs.existsSync(legacyTasksFilePath)) {
        console.log(`Using legacy task file: ${legacyTasksFilePath}`);
        return [legacyTasksFilePath];
      }
      return [];
    }
    
    // Get all files matching the pattern *-tasks-E*.md
    const files = fs.readdirSync(taskMapsDir)
      .filter(file => file.match(/.*-tasks-E\d+\.md$/))
      .sort((a, b) => {
        // Sort by epic number (E01, E02, etc.)
        const epicNumA = parseInt(a.match(/E(\d+)\.md$/)[1]);
        const epicNumB = parseInt(b.match(/E(\d+)\.md$/)[1]);
        return epicNumA - epicNumB;
      });
    
    if (files.length === 0) {
      // Fall back to legacy file if it exists
      if (fs.existsSync(legacyTasksFilePath)) {
        console.log(`No task files found in directory. Using legacy task file: ${legacyTasksFilePath}`);
        return [legacyTasksFilePath];
      }
    }
    
    return files.map(file => path.join(taskMapsDir, file));
  } catch (error) {
    console.error('Error discovering task files:', error);
    // Fall back to legacy file if it exists
    if (fs.existsSync(legacyTasksFilePath)) {
      console.log(`Error in file discovery. Using legacy task file: ${legacyTasksFilePath}`);
      return [legacyTasksFilePath];
    }
    return [];
  }
}

// Extract metadata from a task file
function extractMetadata(fileContent) {
  const projectNameMatch = fileContent.match(/# ([^-]+) - (.*)/);
  const metadata = {
    projectName: projectNameMatch ? projectNameMatch[1].trim() : 'Project',
    projectDescription: projectNameMatch ? projectNameMatch[2].trim() : 'Task Breakdown',
  };
  
  const versionMatch = fileContent.match(/\*\*Version:\*\* ([^\n]+)/);
  metadata.version = versionMatch ? versionMatch[1].trim() : '1.0.0';
  
  const categoryMatch = fileContent.match(/\*\*Category:\*\* ([^\n]+)/);
  metadata.category = categoryMatch ? categoryMatch[1].trim() : 'Project Category';
  
  const abbreviationMatch = fileContent.match(/\*\*Product Abbreviation:\*\* ([^\n]+)/);
  metadata.productAbbreviation = abbreviationMatch ? abbreviationMatch[1].trim() : 'project-abbr';
  
  return metadata;
}

// Extract phases, tasks, and elements from a file
function extractPhaseTasksElements(fileContent) {
  // We'll try a different approach - line by line processing
  const lines = fileContent.split('\n');
  const phases = [];
  let currentPhase = null;
  let currentMainTask = null;
  let currentSubtask = null;
  
  console.log("Extracting content using line-by-line approach...");
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Match phase headings (## 1. Project Foundation)
    const phaseMatch = line.match(/^## (\d+)\. (.+)$/);
    if (phaseMatch) {
      const phaseNumber = phaseMatch[1];
      const phaseTitle = phaseMatch[2].trim();
      
      console.log(`Found phase ${phaseNumber}: ${phaseTitle}`);
      
      // Create a new phase
      currentPhase = {
        number: phaseNumber,
        title: phaseTitle,
        tasks: []
      };
      
      phases.push(currentPhase);
      currentMainTask = null; // Reset current task
      currentSubtask = null; // Reset current subtask
      continue;
    }
    
    // Ignore if we don't have a current phase
    if (!currentPhase) continue;
    
    // Match main task headings (### T-1.1.0: Next.js 14 App Router Implementation)
    const mainTaskMatch = line.match(/^### (T-[\d\.]+): (.+)$/);
    if (mainTaskMatch) {
      const taskId = mainTaskMatch[1];
      const taskTitle = mainTaskMatch[2].trim();
      
      console.log(`  Found main task: ${taskId}: ${taskTitle}`);
      
      // Create a main task
      currentMainTask = {
        id: taskId,
        title: taskTitle,
        elements: [],
        details: {},
        isParent: false // Will be set to true if subtasks are found
      };
      
      currentPhase.tasks.push(currentMainTask);
      currentSubtask = null; // Reset current subtask
      continue;
    }
    
    // Match subtask headings (#### T-1.1.1: Project Initialization with Next.js 14)
    const subtaskMatch = line.match(/^#### (T-[\d\.]+): (.+)$/);
    if (subtaskMatch && currentMainTask) {
      const subtaskId = subtaskMatch[1];
      const subtaskTitle = subtaskMatch[2].trim();
      
      console.log(`    Found subtask: ${subtaskId}: ${subtaskTitle}`);
      
      // Create a subtask
      currentSubtask = {
        id: subtaskId,
        title: subtaskTitle,
        elements: [],
        details: {},
        parentTaskId: currentMainTask.id
      };
      
      // Mark the main task as a parent
      currentMainTask.isParent = true;
      
      currentPhase.tasks.push(currentSubtask);
      continue;
    }
    
    // Match element lines - Update regex to match multiple formats
    // It should match both these formats:
    // [T-1.1.1:ELE-1] Primary color palette
    // - Implement [T-1.1.1:ELE-1] Primary color palette
    const elementMatch = line.match(/.*\[(T-[\d\.]+):(ELE-\d+[a-z]?)\]\s*(.+)$/);
    if (elementMatch && (currentMainTask || currentSubtask)) {
      const taskId = elementMatch[1];
      const elementId = elementMatch[2];
      const description = elementMatch[3].trim();
      const fullId = `${taskId}:${elementId}`;
      
      // Determine if this is a parent or child element
      const isChild = /ELE-\d+[a-z]/.test(elementId);
      
      // Add element to current task or subtask
      const currentTask = currentSubtask || currentMainTask;
      
      if (currentTask) {
        // Initialize elementMap if not exists
        if (!currentTask.elementMap) {
          currentTask.elementMap = new Map();
        }
        
        // Add to element map for parent-child relationship
        if (isChild) {
          // Child element (has a letter suffix)
          const parentElementId = elementId.replace(/([a-z])$/, '');
          const parentFullId = `${taskId}:${parentElementId}`;
          
          // Initialize parent in map if not exists
          if (!currentTask.elementMap.has(parentFullId)) {
            currentTask.elementMap.set(parentFullId, {
              isParent: true,
              id: parentFullId,
              description: '', // Will be filled if we find the parent
              children: []
            });
          }
          
          // Add child to parent
          currentTask.elementMap.get(parentFullId).children.push({
            id: fullId,
            description: description
          });
        } else {
          // Parent element (no letter suffix)
          if (!currentTask.elementMap.has(fullId)) {
            currentTask.elementMap.set(fullId, {
              isParent: true,
              id: fullId,
              description: description,
              children: []
            });
          } else {
            // Update description if this element already exists
            currentTask.elementMap.get(fullId).description = description;
          }
        }
        
        // Add to elements array
        currentTask.elements.push({
          id: fullId,
          description: description,
          isChild: isChild
        });
        
        console.log(`      Found element: ${fullId}: ${description}`);
      }
      
      continue;
    }
    
    // Match task details (- **Key**: Value)
    const detailMatch = line.match(/^- \*\*([^:]+)\*\*: (.+)$/);
    if (detailMatch && (currentMainTask || currentSubtask)) {
      const key = detailMatch[1].trim();
      const value = detailMatch[2].trim();
      
      // Add detail to current task or subtask
      const currentTask = currentSubtask || currentMainTask;
      if (currentTask) {
        currentTask.details[key] = value;
      }
      
      continue;
    }
  }
  
  // Log summary
  console.log(`Extracted ${phases.length} phases in total`);
  for (const phase of phases) {
    const mainTasks = phase.tasks.filter(t => !t.parentTaskId);
    const subtasks = phase.tasks.filter(t => t.parentTaskId);
    let elementCount = 0;
    phase.tasks.forEach(task => {
      elementCount += task.elements ? task.elements.length : 0;
    });
    console.log(`Phase ${phase.number} has ${mainTasks.length} main tasks, ${subtasks.length} subtasks, and ${elementCount} elements`);
  }
  
  return phases;
}

// Parse tasks file and generate progress.md
async function generateProgressFile() {
  console.log('Generating progress.md file from task breakdown...');
  
  try {
    // Discover task files
    const taskFiles = discoverTaskFiles();
    
    if (taskFiles.length === 0) {
      throw new Error('No task files found. Cannot generate progress.md');
    }
    
    console.log(`Found ${taskFiles.length} task file(s) to process`);
    
    // For debugging: Print the content of the first file
    const firstFileContent = fs.readFileSync(taskFiles[0], 'utf8');
    console.log(`Content of first file (${taskFiles[0]}):`);
    console.log(firstFileContent);
    
    // Read the first file to extract metadata
    const metadata = extractMetadata(firstFileContent);
    
    // Create maps to track unique phases and tasks
    const phaseMap = new Map(); // key: phaseNumber, value: phase object
    
    // Process each file to extract phases, tasks and elements
    for (const filePath of taskFiles) {
      console.log(`Processing file: ${filePath}`);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Verify metadata consistency (for files after the first)
      if (filePath !== taskFiles[0]) {
        const fileMetadata = extractMetadata(fileContent);
        if (fileMetadata.projectName !== metadata.projectName) {
          console.warn(`Warning: Project name mismatch in file ${filePath}`);
        }
      }
      
      // Extract phases, tasks and elements
      const phases = extractPhaseTasksElements(fileContent);
      
      // Merge with existing data
      for (const phase of phases) {
        if (!phaseMap.has(phase.number)) {
          // New phase
          phaseMap.set(phase.number, phase);
        } else {
          // Existing phase, merge tasks
          const existingPhase = phaseMap.get(phase.number);
          for (const task of phase.tasks) {
            // Check if task already exists by ID
            const existingTaskIndex = existingPhase.tasks.findIndex(t => t.id === task.id);
            if (existingTaskIndex === -1) {
              // New task, add to existing phase
              existingPhase.tasks.push(task);
            } else {
              // Task exists, this should be a warning as tasks shouldn't be duplicated
              console.warn(`Warning: Duplicate task ID ${task.id} found in phase ${phase.number}`);
            }
          }
        }
      }
    }
    
    // Convert phase map to array and sort by phase number
    const allPhases = Array.from(phaseMap.values())
      .sort((a, b) => parseInt(a.number) - parseInt(b.number));
    
    console.log(`After merging, found ${allPhases.length} unique phases`);
    
    // Sort tasks within each phase
    for (const phase of allPhases) {
      phase.tasks.sort((a, b) => {
        const aNum = a.id.substring(2).split('.').map(Number);
        const bNum = b.id.substring(2).split('.').map(Number);
        
        // Compare phase
        if (aNum[0] !== bNum[0]) return aNum[0] - bNum[0];
        // Compare task
        return aNum[1] - bNum[1];
      });
      
      console.log(`Phase ${phase.number} has ${phase.tasks.length} tasks`);
    }
    
    // Count total tasks and elements
    let totalTasks = 0;
    let totalElements = 0;
    
    allPhases.forEach(phase => {
      totalTasks += phase.tasks.length;
      phase.tasks.forEach(task => {
        totalElements += task.elements ? task.elements.length : 0;
      });
    });
    
    // Get the first task and element for the current focus section
    const firstPhase = allPhases[0];
    const firstTask = firstPhase && firstPhase.tasks.length > 0 ? firstPhase.tasks[0] : null;
    const firstElement = firstTask && firstTask.elements && firstTask.elements.length > 0 ? 
                         firstTask.elements[0] : null;
    
    // Generate the progress.md content
    let progressContent = `# ${metadata.projectName} - Progress Tracking

## Project Overview
${metadata.projectDescription}

A comprehensive modernization project converting the legacy Aplio Design System to leverage Next.js 14's App Router architecture and TypeScript, focusing on the Home-4 template implementation while preserving visual fidelity and enhancing developer experience.

## Implementation Progress

`;
    
    // Add each phase and its tasks
    allPhases.forEach(phase => {
      progressContent += `### Phase ${phase.number}: ${phase.title}\n\n`;
      
      // Group tasks by their parent task IDs for proper nesting
      const mainTasks = phase.tasks.filter(t => !t.parentTaskId);
      const subtasksByParent = {};
      
      phase.tasks.filter(t => t.parentTaskId).forEach(subtask => {
        if (!subtasksByParent[subtask.parentTaskId]) {
          subtasksByParent[subtask.parentTaskId] = [];
        }
        subtasksByParent[subtask.parentTaskId].push(subtask);
      });
      
      // Add main tasks with their subtasks
      mainTasks.forEach(task => {
        const taskId = task.id.substring(2); // Remove "T-" prefix for display
        progressContent += `#### Task ${taskId}: ${task.title}\n`;
        progressContent += `- [ ] ${task.id}: ${task.title}\n`;
        
        // Add elements for this main task if it has any
        if (task.elements && task.elements.length > 0) {
          // Use the elementMap if available to maintain parent-child relationships
          if (task.elementMap && task.elementMap.size > 0) {
            const processedElementIds = new Set();
            
            // First process all parent elements (without letter suffix)
            task.elements.forEach(element => {
              if (!element.isChild && !processedElementIds.has(element.id)) {
                processedElementIds.add(element.id);
                progressContent += `  - [ ] ${element.id} ${element.description}\n`;
                
                // Add child elements if they exist
                if (task.elementMap.has(element.id) && task.elementMap.get(element.id).children.length > 0) {
                  const parent = task.elementMap.get(element.id);
                  parent.children.forEach(child => {
                    processedElementIds.add(child.id);
                    progressContent += `    - [ ] ${child.id} ${child.description}\n`;
                  });
                }
              }
            });
            
            // Add any remaining elements (should be rare, but handle the case)
            task.elements.forEach(element => {
              if (!processedElementIds.has(element.id)) {
                progressContent += `  - [ ] ${element.id} ${element.description}\n`;
              }
            });
          } else {
            // Simple flat listing if no elementMap
            task.elements.forEach(element => {
              progressContent += `  - [ ] ${element.id} ${element.description}\n`;
            });
          }
        }
        
        // Add subtasks if they exist
        if (subtasksByParent[task.id] && subtasksByParent[task.id].length > 0) {
          subtasksByParent[task.id].forEach(subtask => {
            const subtaskId = subtask.id.substring(2); // Remove "T-" prefix for display
            progressContent += `\n- [ ] ${subtask.id}: ${subtask.title}\n`;
            
            // Add elements for this subtask
            if (subtask.elements && subtask.elements.length > 0) {
              // Use the elementMap if available to maintain parent-child relationships
              if (subtask.elementMap && subtask.elementMap.size > 0) {
                const processedElementIds = new Set();
                
                // First process all parent elements (without letter suffix)
                subtask.elements.forEach(element => {
                  if (!element.isChild && !processedElementIds.has(element.id)) {
                    processedElementIds.add(element.id);
                    progressContent += `  - [ ] ${element.id} ${element.description}\n`;
                    
                    // Add child elements if they exist
                    if (subtask.elementMap.has(element.id) && subtask.elementMap.get(element.id).children.length > 0) {
                      const parent = subtask.elementMap.get(element.id);
                      parent.children.forEach(child => {
                        processedElementIds.add(child.id);
                        progressContent += `    - [ ] ${child.id} ${child.description}\n`;
                      });
                    }
                  }
                });
                
                // Add any remaining elements (should be rare, but handle the case)
                subtask.elements.forEach(element => {
                  if (!processedElementIds.has(element.id)) {
                    progressContent += `  - [ ] ${element.id} ${element.description}\n`;
                  }
                });
              } else {
                // Simple flat listing if no elementMap
                subtask.elements.forEach(element => {
                  progressContent += `  - [ ] ${element.id} ${element.description}\n`;
                });
              }
            }
          });
        }
        
        progressContent += '\n';
      });
    });
    
    // Add project status section
    progressContent += `## Project Status

### Milestone Progress
`;

    // Add milestone progress for each phase
    allPhases.forEach(phase => {
      progressContent += `- [ ] Phase ${phase.number}: ${phase.title} (0% complete)\n`;
    });

    progressContent += `
### Overall Progress
- **Tasks Completed**: 0 of ${totalTasks}
- **Elements Completed**: 0 of ${totalElements}
- **Current Completion**: 0%

## Current Focus

Task: ${firstTask ? firstTask.id : 'T-1.1.1'}
Element: ${firstElement ? firstElement.id : 'T-1.1.1:ELE-1'}
Status: Not Started
Updated: ${formatTimestamp()}

## Next Steps
`;

    // Add next steps (first 3 tasks)
    let nextStepsAdded = 0;
    for (let i = 0; i < allPhases.length && nextStepsAdded < 3; i++) {
      const phase = allPhases[i];
      for (let j = 0; j < phase.tasks.length && nextStepsAdded < 3; j++) {
        const task = phase.tasks[j];
        progressContent += `${nextStepsAdded + 1}. Complete ${task.id}: ${task.title}\n`;
        nextStepsAdded++;
      }
    }

    // Add blockers section
    progressContent += `
## Blockers
No blockers identified at this stage.

## Notes
The progress tracking file is designed to be updated as tasks are completed, with a clear representation of task dependencies and hierarchical structure. Each checkbox represents a trackable item that can be marked as complete, allowing for granular progress tracking.
`;
    
    // Write the progress.md file
    fs.writeFileSync(progressFilePath, progressContent);
    
    console.log(`Progress file generated successfully at ${progressFilePath}`);
    console.log(`Project: ${metadata.projectName}`);
    console.log(`Phases: ${allPhases.length}, Tasks: ${totalTasks}, Elements: ${totalElements}`);
    
    // Now generate the phase-focused progress file
    await generatePhaseProgressFile(metadata, allPhases, totalTasks);
    
    return true;
  } catch (error) {
    console.error('Error generating progress file:', error);
    return false;
  }
}

// New function to generate the phase-focused progress file
async function generatePhaseProgressFile(metadata, allPhases, totalTasks) {
  console.log('Generating phase-focused progress-phase.md file...');
  
  try {
    // Generate the progress-phase.md content
    let progressPhaseContent = `# ${metadata.projectName} - Phase Progress Tracking

## Project Overview
${metadata.projectDescription}

A comprehensive modernization project converting the legacy Aplio Design System to leverage Next.js 14's App Router architecture and TypeScript, focusing on the Home-4 template implementation while preserving visual fidelity and enhancing developer experience.

## Implementation Phase Progress

`;
    
    // Add each phase and its tasks, but only include phase information
    allPhases.forEach(phase => {
      progressPhaseContent += `### Phase ${phase.number}: ${phase.title}\n\n`;
      
      // Group tasks by their parent task IDs for proper nesting
      const mainTasks = phase.tasks.filter(t => !t.parentTaskId);
      const subtasksByParent = {};
      
      phase.tasks.filter(t => t.parentTaskId).forEach(subtask => {
        if (!subtasksByParent[subtask.parentTaskId]) {
          subtasksByParent[subtask.parentTaskId] = [];
        }
        subtasksByParent[subtask.parentTaskId].push(subtask);
      });
      
      // Add main tasks with their phases only
      mainTasks.forEach(task => {
        progressPhaseContent += `- [ ] ${task.id}: ${task.title}\n`;
        // Add static phase names for each task
        progressPhaseContent += `  - [ ] Preparation Phase\n`;
        progressPhaseContent += `  - [ ] Implementation Phase\n`;
        progressPhaseContent += `  - [ ] Validation Phase\n`;
        
        // Add subtasks if they exist
        if (subtasksByParent[task.id] && subtasksByParent[task.id].length > 0) {
          subtasksByParent[task.id].forEach(subtask => {
            progressPhaseContent += `\n- [ ] ${subtask.id}: ${subtask.title}\n`;
            // Add static phase names for each subtask
            progressPhaseContent += `  - [ ] Preparation Phase\n`;
            progressPhaseContent += `  - [ ] Implementation Phase\n`;
            progressPhaseContent += `  - [ ] Validation Phase\n`;
          });
        }
        
        progressPhaseContent += '\n';
      });
    });
    
    // Add project status section
    progressPhaseContent += `## Project Status

### Milestone Progress
`;

    // Add milestone progress for each phase
    allPhases.forEach(phase => {
      progressPhaseContent += `- [ ] Phase ${phase.number}: ${phase.title} (0% complete)\n`;
    });

    progressPhaseContent += `
### Overall Progress
- **Tasks Completed**: 0 of ${totalTasks}
- **Current Completion**: 0%

## Current Focus

Task: ${allPhases[0]?.tasks[0]?.id || 'T-1.1.1'}
Status: Not Started
Updated: ${formatTimestamp()}

## Notes
This phase-focused progress tracking file shows only the implementation phases for each task without element details, providing a higher-level view of project progress.
`;
    
    // Write the progress-phase.md file
    fs.writeFileSync(progressPhaseFilePath, progressPhaseContent);
    
    console.log(`Phase-focused progress file generated successfully at ${progressPhaseFilePath}`);
    
    return true;
  } catch (error) {
    console.error('Error generating phase-focused progress file:', error);
    return false;
  }
}

// Run the script
generateProgressFile().then(success => {
  if (success) {
    console.log('Progress file generation completed.');
  } else {
    console.error('Progress file generation failed.');
    process.exit(1);
  }
}); 