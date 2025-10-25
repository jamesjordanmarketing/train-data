#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * New Panel New Task Automation Script
 * 
 * This script automates the creation of timestamped new panel task files from templates.
 * It copies templates, generates proper timestamps, and replaces path variables.
 * 
 * Must be run from the pmc directory.
 */

function generateTimestamp() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedHours = String(hours).padStart(2, '0');
    
    return `${month}-${day}-${year}-${formattedHours}${minutes}${ampm}`;
}

function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
    }
}

function extractTaskIdFromLine(filePath, lineNumber) {
    try {
        if (!fs.existsSync(filePath)) {
            console.warn(`Warning: File not found: ${filePath}`);
            return 'UNKNOWN';
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        if (lines.length < lineNumber) {
            console.warn(`Warning: File ${filePath} has fewer than ${lineNumber} lines`);
            return 'UNKNOWN';
        }
        
        const line = lines[lineNumber - 1]; // Convert to 0-based index
        
        // Look for Task ID pattern T-X.Y.Z
        const taskIdMatch = line.match(/T-\d+\.\d+\.\d+/);
        
        if (taskIdMatch) {
            return taskIdMatch[0];
        } else {
            console.warn(`Warning: No Task ID found on line ${lineNumber} of ${filePath}`);
            return 'UNKNOWN';
        }
        
    } catch (error) {
        console.error(`Error reading Task ID from ${filePath}:`, error.message);
        return 'UNKNOWN';
    }
}

function getCurrentTaskId() {
    return extractTaskIdFromLine('core/active-task-unit-tests-2.md', 1);
}

function getPreviousTaskId() {
    return extractTaskIdFromLine('core/previous-task.md', 1);
}

function copyAndProcessTemplate(templatePath, outputPath, replacements) {
    try {
        // Read template content
        let content = fs.readFileSync(templatePath, 'utf8');
        
        // Replace variables
        for (const [variable, replacement] of Object.entries(replacements)) {
            const regex = new RegExp(`\\{\\{${variable}\\}\\}`, 'g');
            content = content.replace(regex, replacement);
        }
        
        // Write processed content to output file
        fs.writeFileSync(outputPath, content, 'utf8');
        console.log(`Created: ${outputPath}`);
        
        return true;
    } catch (error) {
        console.error(`Error processing template ${templatePath}:`, error.message);
        return false;
    }
}

function processTaskApproachPrompt(contextCarryPath) {
    const templatePath = 'system/templates/active-task-approach-prompt-template.md';
    const outputPath = 'system/coding-prompts/02-task-approach-prompt.md';
    
    try {
        // Read the task approach prompt template content
        let content = fs.readFileSync(templatePath, 'utf8');
        
        // Replace the context carry file path variable
        content = content.replace(/\{\{CONTEXT_CARRY_FILE_PATH\}\}/g, contextCarryPath);
        
        // Write the customized prompt to the standard location
        fs.writeFileSync(outputPath, content, 'utf8');
        console.log(`Updated task approach prompt: ${outputPath}`);
        
        return true;
    } catch (error) {
        console.error(`Error processing task approach prompt:`, error.message);
        return false;
    }
}

function archiveExistingFiles() {
    const newPanelsDir = 'system/plans/new-panels/';
    const historyDir = 'system/plans/new-panels/new-panel-history/';
    
    ensureDirectoryExists(historyDir);
    
    try {
        const files = fs.readdirSync(newPanelsDir);
        const patterns = [
            /^00-new-panel-new-task-automation-prompt-\d{2}-\d{2}-\d{2}-\d{4}(AM|PM)\.md$/,
            /^01-new-panel-new-task-\d{2}-\d{2}-\d{2}-\d{4}(AM|PM)\.md$/,
            /^02-new-task-carry-context-\d{2}-\d{2}-\d{2}-\d{4}(AM|PM)\.md$/,
            /^03-new-panel-new-task-conductor-\d{2}-\d{2}-\d{2}-\d{4}(AM|PM)\.md$/,
            /^04-new-panel-new-task-conductor-output-\d{2}-\d{2}-\d{2}-\d{4}(AM|PM)\.md$/
        ];
        
        let archivedCount = 0;
        
        for (const file of files) {
            const isMatchingPattern = patterns.some(pattern => pattern.test(file));
            
            if (isMatchingPattern) {
                const sourcePath = path.join(newPanelsDir, file);
                const destPath = path.join(historyDir, file);
                
                fs.copyFileSync(sourcePath, destPath);
                fs.unlinkSync(sourcePath);
                console.log(`Archived: ${file} -> new-panel-history/`);
                archivedCount++;
            }
        }
        
        if (archivedCount === 0) {
            console.log('No existing new-panel files found to archive.');
        } else {
            console.log(`Archived ${archivedCount} existing files.`);
        }
        
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('New panels directory does not exist yet - skipping archive step.');
        } else {
            console.error('Error during archiving:', error.message);
        }
    }
}

function main() {
    console.log('New Panel New Task Automation Script Starting...');
    
    // Ensure we're in the right directory
    if (!fs.existsSync('system/templates/new-panel-new-task-template.md') || 
        !fs.existsSync('system/templates/new-panel-new-task-conductor-template.md') ||
        !fs.existsSync('system/templates/new-task-carry-context-template.md') ||
        !fs.existsSync('system/templates/new-panel-new-task-automation-prompt-template.md') ||
        !fs.existsSync('system/templates/new-panel-new-task-conductor-output-template.md') ||
        !fs.existsSync('system/templates/active-task-approach-prompt-template.md')) {
        console.error('Error: Must be run from pmc directory');
        console.error('Templates not found at expected paths');
        process.exit(1);
    }
    
    // Archive any existing files first
    archiveExistingFiles();
    
    // Generate timestamp
    const timestamp = generateTimestamp();
    console.log(`Using timestamp: ${timestamp}`);
    
    // Extract Task IDs
    const currentTaskId = getCurrentTaskId();
    const previousTaskId = getPreviousTaskId();
    console.log(`Current Task ID: ${currentTaskId}`);
    console.log(`Previous Task ID: ${previousTaskId}`);
    
    // Define file paths
    const newPanelsDir = 'system/plans/new-panels/';
    const newTaskFile = `01-new-panel-new-task-${timestamp}.md`;
    const newConductorFile = `03-new-panel-new-task-conductor-${timestamp}.md`;
    const newCarryContextFile = `02-new-task-carry-context-${timestamp}.md`;
    const newAutomationPromptFile = `00-new-panel-new-task-automation-prompt-${timestamp}.md`;
    const newConductorOutputFile = `04-new-panel-new-task-conductor-output-${timestamp}.md`;
    
    const newTaskPath = path.join(newPanelsDir, newTaskFile);
    const newConductorPath = path.join(newPanelsDir, newConductorFile);
    const newCarryContextPath = path.join(newPanelsDir, newCarryContextFile);
    const newAutomationPromptPath = path.join(newPanelsDir, newAutomationPromptFile);
    const newConductorOutputPath = path.join(newPanelsDir, newConductorOutputFile);
    
    // Ensure output directory exists
    ensureDirectoryExists(newPanelsDir);
    
    // Define replacements for templates - all use shared variables
    const sharedReplacements = {
        'NEW_PANEL_NEW_TASK_PATH': newTaskPath,
        'NEW_TASK_CARRY_CONTEXT_PATH': newCarryContextPath,
        'NEW_TASK_CONDUCTOR_PATH': newConductorPath,
        'NEW_TASK_CONDUCTOR_OUTPUT': newConductorOutputPath,
        'CURRENT_DATE': timestamp,
        'CURRENT_TASK_ID': currentTaskId,
        'PREVIOUS_TASK_ID': previousTaskId
    };
    
    // Process templates
    const success1 = copyAndProcessTemplate(
        'system/templates/new-panel-new-task-template.md',
        newTaskPath,
        sharedReplacements
    );
    
    const success2 = copyAndProcessTemplate(
        'system/templates/new-panel-new-task-conductor-template.md',
        newConductorPath,
        sharedReplacements
    );
    
    const success3 = copyAndProcessTemplate(
        'system/templates/new-task-carry-context-template.md',
        newCarryContextPath,
        sharedReplacements
    );
    
    const success4 = copyAndProcessTemplate(
        'system/templates/new-panel-new-task-automation-prompt-template.md',
        newAutomationPromptPath,
        sharedReplacements
    );
    
    const success5 = copyAndProcessTemplate(
        'system/templates/new-panel-new-task-conductor-output-template.md',
        newConductorOutputPath,
        sharedReplacements
    );
    
    // Process the task approach prompt with the context carry file path
    const success6 = processTaskApproachPrompt(newCarryContextPath);
    
    if (success1 && success2 && success3 && success4 && success5 && success6) {
        console.log('\n✅ New Panel New Task automation completed successfully!');
        console.log(`📄 Automation Prompt file: ${newAutomationPromptPath}`);
        console.log(`📄 Task file: ${newTaskPath}`);
        console.log(`📄 Carry Context file: ${newCarryContextPath}`);
        console.log(`📄 Task Approach Prompt (updated): system/coding-prompts/02-task-approach-prompt.md`);
        console.log(`📄 Conductor file: ${newConductorPath}`);
        console.log(`📄 Conductor Output file: ${newConductorOutputPath}`);
    } else {
        console.log('\n❌ Some errors occurred during processing');
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { generateTimestamp, copyAndProcessTemplate, archiveExistingFiles, processTaskApproachPrompt }; 