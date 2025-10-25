#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Test Approach and Discovery Automation Script
 * 
 * This script automates the management of test approach and test discovery files
 * by archiving existing versions and creating blank slate files for new testing cycles.
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

function extractTaskId(filePath, lineNumber) {
    try {
        if (!fs.existsSync(filePath)) {
            return null;
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        if (lines.length < lineNumber) {
            return null;
        }
        
        const targetLine = lines[lineNumber - 1]; // Convert to 0-based index
        
        // Extract task ID using regex pattern T-X.X.X
        const taskIdMatch = targetLine.match(/T-\d+\.\d+\.\d+/);
        return taskIdMatch ? taskIdMatch[0] : null;
        
    } catch (error) {
        console.warn(`Warning: Could not extract task ID from ${filePath}:`, error.message);
        return null;
    }
}

function archiveAndClearFile(sourcePath, archiveDir, baseFileName, timestamp, taskId = null) {
    try {
        // Check if source file exists
        if (!fs.existsSync(sourcePath)) {
            console.log(`Source file not found: ${sourcePath} - creating blank file`);
            fs.writeFileSync(sourcePath, '', 'utf8');
            return true;
        }
        
        // Create archive filename with optional task ID and timestamp
        let archiveFileName;
        if (taskId) {
            archiveFileName = `${baseFileName}-${taskId}-${timestamp}.md`;
        } else {
            archiveFileName = `${baseFileName}-${timestamp}.md`;
        }
        const archivePath = path.join(archiveDir, archiveFileName);
        
        // Copy current file to archive
        fs.copyFileSync(sourcePath, archivePath);
        console.log(`Archived: ${path.basename(sourcePath)} -> ${archiveFileName}`);
        
        // Clear current file (make it blank)
        fs.writeFileSync(sourcePath, '', 'utf8');
        console.log(`Cleared: ${path.basename(sourcePath)} (now blank)`);
        
        return true;
        
    } catch (error) {
        console.error(`Error processing ${sourcePath}:`, error.message);
        return false;
    }
}

function main() {
    console.log('Test Approach and Discovery Automation Script Starting...');
    
    // Ensure we're in the right directory
    if (!fs.existsSync('system/plans/task-approach')) {
        console.error('Error: Must be run from pmc directory');
        console.error('Task approach directory not found at expected path');
        process.exit(1);
    }
    
    // Generate timestamp
    const timestamp = generateTimestamp();
    console.log(`Using timestamp: ${timestamp}`);
    
    // Define paths
    const taskApproachDir = 'system/plans/task-approach/';
    const historyDir = 'system/plans/task-approach/approach-history/';
    
    const testApproachPath = path.join(taskApproachDir, 'current-test-approach.md');
    const testDiscoveryPath = path.join(taskApproachDir, 'current-test-discovery.md');
    
    // Ensure history directory exists
    ensureDirectoryExists(historyDir);
    
    // Extract task IDs from the files before archiving
    console.log('\nExtracting task IDs from test files...');
    const testApproachTaskId = extractTaskId(testApproachPath, 1); // Line 1
    const testDiscoveryTaskId = extractTaskId(testDiscoveryPath, 4); // Line 4
    
    // Use the first available task ID, or fallback to timestamp only
    const taskId = testApproachTaskId || testDiscoveryTaskId;
    
    if (taskId) {
        console.log(`Found task ID: ${taskId}`);
    } else {
        console.log('No task ID found - using timestamp-only format');
    }
    
    // Archive and clear both files
    console.log('\nProcessing test approach and discovery files...');
    
    const success1 = archiveAndClearFile(
        testApproachPath,
        historyDir,
        'current-test-approach',
        timestamp,
        taskId
    );
    
    const success2 = archiveAndClearFile(
        testDiscoveryPath,
        historyDir,
        'current-test-discovery',
        timestamp,
        taskId
    );
    
    if (success1 && success2) {
        console.log('\n✅ Test Approach and Discovery automation completed successfully!');
        console.log(`📁 Archived files are in: ${historyDir}`);
        console.log(`📄 Current test approach file: ${testApproachPath} (now blank)`);
        console.log(`📄 Current test discovery file: ${testDiscoveryPath} (now blank)`);
        console.log('\n🔄 Ready for new testing cycle with blank slate files.');
    } else {
        console.log('\n❌ Some errors occurred during processing');
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { generateTimestamp, archiveAndClearFile, ensureDirectoryExists, extractTaskId }; 