/**
 * BMO Task Files Concatenation Script
 * 
 * This script concatenates BMO task fragment files from a source directory
 * into a single consolidated file based on a template.
 * 
 * The script reads from:
 * - pmc/product/_mapping/task-file-maps/6-bmo-tasks-output-E[##].md (fragment files)
 * - pmc/product/_templates/06-tasks-built-template.md (template file)
 * 
 * STRICT FILTERING: Only concatenates files that match exactly "6-bmo-tasks-output-E[##].md"
 * - Must start with exactly "6-bmo-tasks-output-E"
 * - Must be followed by exactly numbers (no other characters)
 * - Must end with exactly ".md" (no additional strings after the numbers)
 * - Files are concatenated in ascending numeric order
 * 
 * And outputs:
 * - pmc/product/06b-[project-abbreviation]-tasks-built.md (consolidated file)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper function to resolve paths relative to project root
function resolveProjectPath(relativePath) {
    const scriptDir = path.dirname(fileURLToPath(import.meta.url));
    const projectRoot = path.resolve(scriptDir, '../..');
    return path.join(projectRoot, relativePath);
}

/**
 * Format current date and time in Pacific time zone
 * @returns {string} Formatted date and time string (MM-DD-YYYY h:mm A PST)
 */
function formatDateWithPacificTime() {
    const now = new Date();
    
    // Convert to Pacific time
    const options = { 
        timeZone: 'America/Los_Angeles',
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };
    
    const pacificTime = now.toLocaleString('en-US', options);
    
    // Split into date and time parts to format as MM-DD-YYYY h:mm A PST
    const [datePart, timePart] = pacificTime.split(', ');
    return `${datePart} ${timePart} PST`;
}

/**
 * Extract project information from the overview file
 * @returns {Object} Project information including name, category, and abbreviation
 */
function extractProjectInfo() {
    try {
        const overviewPath = resolveProjectPath('product/01-bmo-overview.md');
        const overviewContent = fs.readFileSync(overviewPath, 'utf8');
        
        // Extract project name from the first line (title)
        const titleMatch = overviewContent.match(/^# (.+)/);
        const projectName = titleMatch ? titleMatch[1] : 'Aplio Design System Modernization';
        
        // Extract category
        const categoryMatch = overviewContent.match(/\*\*Category:\*\* ([^\n]+)/);
        const category = categoryMatch ? categoryMatch[1] : 'Design System Modernization';
        
        // Extract abbreviation
        const abbreviationMatch = overviewContent.match(/\*\*Product Abbreviation:\*\* ([^\n]+)/);
        const abbreviation = abbreviationMatch ? abbreviationMatch[1] : 'bmo';
        
        return {
            projectName,
            category,
            abbreviation
        };
    } catch (error) {
        console.error(`Error extracting project info: ${error.message}`);
        return {
            projectName: 'Aplio Design System Modernization',
            category: 'Design System Modernization',
            abbreviation: 'bmo'
        };
    }
}

/**
 * Ensure directory exists, create it if it doesn't
 * @param {string} dirPath - Directory path to ensure
 */
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
    }
}

/**
 * Extract numerical suffix from filename (e.g., 'E01' from '6-bmo-tasks-E01.md')
 * @param {string} filename - Filename to extract suffix from
 * @returns {string} The numerical suffix or null if not found
 */
function extractFileSuffix(filename) {
    const match = filename.match(/E(\d+)\.md$/);
    return match ? match[1] : null;
}

/**
 * Read and process fragment files in numerical order
 * @param {string} sourceDir - Directory containing fragment files
 * @param {string} filePrefix - File prefix pattern to match (e.g., '6-bmo-tasks-')
 * @returns {Object} Object with sorted fragments and source file list
 */
function processFragmentFiles(sourceDir, filePrefix) {
    // Debug log files in directory
    const allFiles = fs.readdirSync(sourceDir);
    console.log(`Files in directory: ${allFiles.join(', ')}`);
    
    // Strict filter that ONLY matches files with exact pattern: 6-bmo-tasks-output-E[##].md
    // The pattern must be: exactly "6-bmo-tasks-output-E" + numbers + ".md" (nothing else)
    const sourceFiles = allFiles.filter(file => {
        const pattern = /^6-bmo-tasks-output-E\d+\.md$/;
        const matches = pattern.test(file);
        if (matches) {
            console.log(`File matches pattern: ${file}`);
        } else {
            console.log(`File does not match pattern: ${file}`);
        }
        return matches;
    });
    
    console.log(`Files matching pattern: ${sourceFiles.join(', ')}`);
    
    // Sort files by their numerical suffix
    sourceFiles.sort((a, b) => {
        const suffixA = extractFileSuffix(a);
        const suffixB = extractFileSuffix(b);
        
        if (!suffixA || !suffixB) return 0;
        return parseInt(suffixA) - parseInt(suffixB);
    });
    
    let fragments = [];
    let sourceFileList = [];
    
    for (const file of sourceFiles) {
        const filePath = path.join(sourceDir, file);
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            fragments.push(content);
            sourceFileList.push(file);
            console.log(`Read fragment file: ${file}`);
        } catch (error) {
            console.error(`Error reading file ${file}: ${error.message}`);
        }
    }
    
    return { fragments, sourceFileList };
}

/**
 * Process template file and replace variables
 * @param {string} templatePath - Path to template file
 * @param {Object} variables - Object with variable names and values
 * @param {Array} sourceFileList - List of source fragment files
 * @param {string} sourceDir - Source directory path
 * @returns {string} Processed template content
 */
function processTemplate(templatePath, variables, sourceFileList, sourceDir) {
    try {
        let template = fs.readFileSync(templatePath, 'utf8');
        
        // Replace variables
        for (const [key, value] of Object.entries(variables)) {
            const placeholder = `{{${key}}}`;
            template = template.replace(new RegExp(placeholder, 'g'), value);
        }
        
        // Replace source references
        const sourceListPlaceholder = '[list of 6-bmo-tasks-E[##].md files that were concatenated]';
        const formattedSourceList = sourceFileList.map(file => `  - ${file}`).join('\n');
        
        const sourceDirPlaceholder = '[path/to/source-directory/]';
        const relativeDirPath = sourceDir.split(path.sep).join('/');
        
        template = template.replace(sourceDirPlaceholder, relativeDirPath);
        template = template.replace(sourceListPlaceholder, formattedSourceList);
        
        // Replace date placeholder
        const datePattern = /\*\*Date:\*\* \[MM-DD-YYYY\]/g;
        const formattedDate = `**Date:** ${formatDateWithPacificTime()}`;
        template = template.replace(datePattern, formattedDate);
        
        // Replace category and abbreviation placeholders
        const categoryPattern = /\*\*Category:\*\* \[Product type\/category\]/g;
        const abbreviationPattern = /\*\*Product Abbreviation:\*\* \[Product Abbreviation\]/g;
        
        template = template.replace(categoryPattern, `**Category:** ${variables.category}`);
        template = template.replace(abbreviationPattern, `**Product Abbreviation:** ${variables.abbreviation}`);
        
        return template;
    } catch (error) {
        console.error(`Error processing template: ${error.message}`);
        return null;
    }
}

/**
 * Try multiple path variants to handle different path formats
 * @param {string} basePath - Base project path 
 * @param {string} relativePath - Relative path to try
 * @returns {string|null} First path that exists or null if none found
 */
function findExistingPath(basePath, relativePath) {
    // Try different formats of the path
    const pathVariants = [
        path.join(basePath, relativePath),
        path.join(basePath, relativePath.replace(/\\/g, '')),  // No backslashes
        path.join(basePath, relativePath.replace(/\//g, path.sep)),  // Convert forward slashes
        path.join(basePath, relativePath.replace(/\//g, path.sep).replace(/\\/g, '')),  // Both conversions
        path.join(basePath, relativePath.replace(/_/g, '')),  // No underscores
    ];
    
    for (const pathVariant of pathVariants) {
        if (fs.existsSync(pathVariant)) {
            console.log(`Found existing path: ${pathVariant}`);
            return pathVariant;
        }
        console.log(`Path not found: ${pathVariant}`);
    }
    
    return null;
}

/**
 * Generate consolidated task file
 * @param {Object} options - Options for file generation
 */
export async function generateConsolidatedTaskFile(options = {}) {
    // Get project info from overview file
    const projectInfo = extractProjectInfo();
    console.log(`Extracted project info: ${JSON.stringify(projectInfo)}`);
    
    const {
        projectName = projectInfo.projectName,
        projectAbbreviation = projectInfo.abbreviation,
        version = '1.0.0',
        category = projectInfo.category,
        sourceDirOverride,
        templatePathOverride,
        outputPathOverride
    } = options;
    
    console.log(`Using project abbreviation: ${projectAbbreviation}`);
    
    // Use overrides if provided, otherwise try to find the paths
    const projectRoot = resolveProjectPath('');
    
    // Source directory
    let sourceDir;
    if (sourceDirOverride) {
        sourceDir = sourceDirOverride;
    } else {
        // Try different path formats
        const sourceDirRelative = 'product/_mapping/task-file-maps';
        sourceDir = findExistingPath(projectRoot, sourceDirRelative);
        
        if (!sourceDir) {
            console.error(`Could not find source directory for task files.`);
            return;
        }
    }
    
    // Template path
    let templatePath;
    if (templatePathOverride) {
        templatePath = templatePathOverride;
    } else {
        const templateRelative = 'product/_templates/06-tasks-built-template.md';
        templatePath = findExistingPath(projectRoot, templateRelative);
        
        if (!templatePath) {
            console.error(`Could not find template file.`);
            return;
        }
    }
    
    // Output path
    const outputDir = path.join(projectRoot, 'product');
    const outputFileName = `06b-${projectAbbreviation.trim()}-tasks-built.md`;
    const outputPath = outputPathOverride || path.join(outputDir, outputFileName);
    
    console.log(`Starting task file concatenation...`);
    console.log(`Source directory: ${sourceDir}`);
    console.log(`Template: ${templatePath}`);
    console.log(`Output path: ${outputPath}`);
    
    // Ensure the output directory exists
    ensureDirectoryExists(path.dirname(outputPath));
    
    // Process fragment files - now using strict BMO pattern matching
    const filePrefix = `6-${projectAbbreviation}-tasks-`;
    console.log(`Looking for files with exact pattern: 6-bmo-tasks-output-E[##].md`);
    
    const { fragments, sourceFileList } = processFragmentFiles(sourceDir, filePrefix);
    
    if (fragments.length === 0) {
        console.error(`No fragment files found in ${sourceDir} matching pattern 6-bmo-tasks-output-E[##].md`);
        return;
    }
    
    console.log(`Found ${fragments.length} fragment files to concatenate`);
    
    // Process template
    const templateVariables = {
        PROJECT_NAME: projectName,
        'Version number': version,
        category,
        abbreviation: projectAbbreviation.trim()
    };
    
    const processedTemplate = processTemplate(templatePath, templateVariables, sourceFileList, sourceDir);
    if (!processedTemplate) {
        return;
    }
    
    // Concatenate fragments
    const concatenatedContent = fragments.join('\n\n');
    
    // Combine template header and concatenated content
    const outputContent = `${processedTemplate}\n\n${concatenatedContent}`;
    
    // Write output file
    try {
        fs.writeFileSync(outputPath, outputContent, 'utf8');
        console.log(`Successfully generated consolidated task file: ${outputPath}`);
    } catch (error) {
        console.error(`Error writing output file: ${error.message}`);
    }
}

// Main execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    generateConsolidatedTaskFile();
}

export default { generateConsolidatedTaskFile }; 