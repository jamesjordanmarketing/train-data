#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * New Panel New Test Automation Script
 * 
 * This script automates the creation of timestamped new test files from templates.
 * It copies templates, generates proper timestamps, extracts task IDs, and replaces path variables.
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

function extractTaskId(filePath, lineNumber, description) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        if (lines.length < lineNumber) {
            console.error(`Error: ${filePath} has only ${lines.length} lines, but line ${lineNumber} was requested`);
            return null;
        }
        
        const line = lines[lineNumber - 1]; // Convert to 0-based index
        
        // Look for task ID pattern T-X.Y.Z
        const taskIdMatch = line.match(/T-\d+\.\d+\.\d+/);
        
        if (taskIdMatch) {
            console.log(`Extracted ${description}: ${taskIdMatch[0]} from line ${lineNumber} of ${filePath}`);
            return taskIdMatch[0];
        } else {
            console.error(`Warning: No task ID found in expected format T-X.Y.Z on line ${lineNumber} of ${filePath}`);
            console.error(`Line content: "${line}"`);
            return null;
        }
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
        return null;
    }
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

function archiveExistingFiles() {
    const newTestsDir = 'system/plans/new-tests/';
    const historyDir = 'system/plans/new-tests/tests-history/';
    
    ensureDirectoryExists(historyDir);
    
    try {
        const files = fs.readdirSync(newTestsDir);
        const patterns = [
            /^00-new-test-automation-prompt-\d{2}-\d{2}-\d{2}-\d{4}(AM|PM)\.md$/,
            /^01-new-test-carry-prompt-\d{2}-\d{2}-\d{2}-\d{4}(AM|PM)\.md$/,
            /^02-new-test-carry-context-\d{2}-\d{2}-\d{2}-\d{4}(AM|PM)\.md$/,
            /^03-new-test-active-test-2-enhanced-\d{2}-\d{2}-\d{2}-\d{4}(AM|PM)\.md$/,
            /^04-new-test-conductor-prompt-\d{2}-\d{2}-\d{2}-\d{4}(AM|PM)\.md$/,
            /^05-new-test-conductor-output-\d{2}-\d{2}-\d{2}-\d{4}(AM|PM)\.md$/
        ];
        
        let archivedCount = 0;
        
        for (const file of files) {
            const isMatchingPattern = patterns.some(pattern => pattern.test(file));
            
            if (isMatchingPattern) {
                const sourcePath = path.join(newTestsDir, file);
                const destPath = path.join(historyDir, file);
                
                fs.copyFileSync(sourcePath, destPath);
                fs.unlinkSync(sourcePath);
                console.log(`Archived: ${file} -> tests-history/`);
                archivedCount++;
            }
        }
        
        if (archivedCount === 0) {
            console.log('No existing new-test files found to archive.');
        } else {
            console.log(`Archived ${archivedCount} existing files.`);
        }
        
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('New tests directory does not exist yet - skipping archive step.');
        } else {
            console.error('Error during archiving:', error.message);
        }
    }
}

function main() {
    console.log('New Panel New Test Automation Script Starting...');
    
    // Ensure we're in the right directory
    if (!fs.existsSync('system/templates/new-test-automation-prompt-template.md') || 
        !fs.existsSync('system/templates/new-test-carry-prompt-template.md') ||
        !fs.existsSync('system/templates/new-test-carry-context-template.md') ||
        !fs.existsSync('system/templates/new-test-active-test-2-enhanced.md') ||
        !fs.existsSync('system/templates/new-test-conductor-prompt-template.md') ||
        !fs.existsSync('system/templates/new-test-conductor-output-template.md')) {
        console.error('Error: Must be run from pmc directory');
        console.error('Templates not found at expected paths');
        process.exit(1);
    }
    
    // Extract task IDs
    const currentTaskId = extractTaskId('core/active-task-unit-tests-2.md', 1, 'CURRENT_TASK_ID');
    const previousTaskId = extractTaskId('core/previous-task.md', 1, 'PREVIOUS_TASK_ID');
    
    if (!currentTaskId || !previousTaskId) {
        console.error('Error: Failed to extract one or both task IDs');
        process.exit(1);
    }
    
    // Archive any existing files first
    archiveExistingFiles();
    
    // Generate timestamp
    const timestamp = generateTimestamp();
    console.log(`Using timestamp: ${timestamp}`);
    
    // Define file paths
    const newTestsDir = 'system/plans/new-tests/';
    const newTestAutomationPromptFile = `00-new-test-automation-prompt-${timestamp}.md`;
    const newTestCarryPromptFile = `01-new-test-carry-prompt-${timestamp}.md`;
    const newTestCarryContextFile = `02-new-test-carry-context-${timestamp}.md`;
    const newTestActiveTest2EnhancedFile = `03-new-test-active-test-2-enhanced-${timestamp}.md`;
    const newTestConductorPromptFile = `04-new-test-conductor-prompt-${timestamp}.md`;
    const newTestConductorOutputFile = `05-new-test-conductor-output-${timestamp}.md`;
    
    const newTestAutomationPromptPath = path.join(newTestsDir, newTestAutomationPromptFile);
    const newTestCarryPromptPath = path.join(newTestsDir, newTestCarryPromptFile);
    const newTestCarryContextPath = path.join(newTestsDir, newTestCarryContextFile);
    const newTestActiveTest2EnhancedPath = path.join(newTestsDir, newTestActiveTest2EnhancedFile);
    const newTestConductorPromptPath = path.join(newTestsDir, newTestConductorPromptFile);
    const newTestConductorOutputPath = path.join(newTestsDir, newTestConductorOutputFile);
    
    // Ensure output directory exists
    ensureDirectoryExists(newTestsDir);
    
    // Define replacements for templates - all use shared variables
    const sharedReplacements = {
        'CURRENT_TASK_ID': currentTaskId,
        'PREVIOUS_TASK_ID': previousTaskId,
        'NEW_TEST_CARRY_PROMPT_PATH': newTestCarryPromptPath,
        'NEW_TEST_CARRY_CONTEXT_PATH': newTestCarryContextPath,
        'NEW_TEST_ENHANCED_PLAN_PATH': newTestActiveTest2EnhancedPath,
        'NEW_TEST_CONDUCTOR_PATH': newTestConductorPromptPath,
        'NEW_TEST_CONDUCTOR_OUTPUT_PATH': newTestConductorOutputPath,
        'DATETIMESTAMP': timestamp
    };
    
    // Process templates
    const success1 = copyAndProcessTemplate(
        'system/templates/new-test-automation-prompt-template.md',
        newTestAutomationPromptPath,
        sharedReplacements
    );
    
    const success2 = copyAndProcessTemplate(
        'system/templates/new-test-carry-prompt-template.md',
        newTestCarryPromptPath,
        sharedReplacements
    );
    
    const success3 = copyAndProcessTemplate(
        'system/templates/new-test-carry-context-template.md',
        newTestCarryContextPath,
        sharedReplacements
    );
    
    const success4 = copyAndProcessTemplate(
        'system/templates/new-test-active-test-2-enhanced.md',
        newTestActiveTest2EnhancedPath,
        sharedReplacements
    );
    
    const success5 = copyAndProcessTemplate(
        'system/templates/new-test-conductor-prompt-template.md',
        newTestConductorPromptPath,
        sharedReplacements
    );
    
    const success6 = copyAndProcessTemplate(
        'system/templates/new-test-conductor-output-template.md',
        newTestConductorOutputPath,
        sharedReplacements
    );
    
    if (success1 && success2 && success3 && success4 && success5 && success6) {
        console.log('\n✅ New Panel New Test automation completed successfully!');
        console.log(`📄 Test Automation Prompt file: ${newTestAutomationPromptPath}`);
        console.log(`📄 Test Carry Prompt file: ${newTestCarryPromptPath}`);
        console.log(`📄 Test Carry Context file: ${newTestCarryContextPath}`);
        console.log(`📄 Test Enhanced Plan file: ${newTestActiveTest2EnhancedPath}`);
        console.log(`📄 Test Conductor Prompt file: ${newTestConductorPromptPath}`);
        console.log(`📄 Test Conductor Output file: ${newTestConductorOutputPath}`);
        console.log(`\n🔧 Task IDs extracted:`);
        console.log(`   Current Task ID: ${currentTaskId}`);
        console.log(`   Previous Task ID: ${previousTaskId}`);
    } else {
        console.log('\n❌ Some errors occurred during processing');
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { generateTimestamp, copyAndProcessTemplate, archiveExistingFiles, extractTaskId };
