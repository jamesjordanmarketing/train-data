/**
 * Prompt Files Regeneration Script
 * 
 * This script ONLY regenerates the customized prompt files based on existing task files.
 * It does NOT modify, update, or regenerate the task files themselves.
 * 
 * The script reads from:
 * - pmc/product/_mapping/task-file-maps/6-[project-abbreviation]-tasks-E[XX].md (existing task files)
 * - pmc/product/_prompt_engineering/06a-product-task-elements-breakdown-prompt-v5.4.md (template)
 * 
 * And outputs:
 * - pmc/product/_mapping/task-file-maps/prompts/06a-product-task-elements-breakdown-prompt-v5.4-E[XX].md (customized prompts)
 */

const fs = require('fs');
const path = require('path');

// Helper function to resolve paths relative to project root
function resolveProjectPath(relativePath) {
    // Get the directory of the current script
    const scriptDir = __dirname;
    
    // Navigate to project root (pmc)
    // __dirname will be .../pmc/product/_tools
    // So we need to go up two levels to reach pmc
    const projectRoot = path.resolve(scriptDir, '../..');
    
    // Join with the relative path
    return path.join(projectRoot, relativePath);
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
 * Extract section header from section content
 * @param {string} sectionContent - Content of the section
 * @returns {string} Section header text
 */
function extractSectionHeader(sectionContent) {
    const lines = sectionContent.split(/\r?\n/);
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.match(/^##\s+\d+\.\s+.+$/)) {
            return trimmedLine; // Return the full header including ## 
        }
    }
    return "Unknown Section";
}

/**
 * Helper function to get the base project directory (parent of pmc)
 * @returns {string} The absolute path to the base project directory
 */
function getBaseProjectDir() {
    // Get the directory of the current script
    const scriptDir = __dirname;
    
    // Navigate to project root (pmc) and then up one more level
    return path.resolve(scriptDir, '../../..');
}

/**
 * Customize prompt template for a specific section
 * @param {string} promptTemplate - Template content
 * @param {string} sectionHeader - Section header to replace placeholder
 * @param {string} sectionId - Section ID (e.g., E01)
 * @param {string} outputFilePath - Path to the output file for this section
 * @param {string} projectAbbreviation - Project abbreviation for generating test mapping path
 * @returns {string} Customized prompt content
 */
function customizePrompt(promptTemplate, sectionHeader, sectionId, outputFilePath, projectAbbreviation) {
    let customized = promptTemplate;
    
    // Replace [Major Task Number & Tier] with the section header
    customized = customized.replace(/\[Major Task Number & Tier\]/g, sectionHeader);
    
    // Get base project directory for absolute paths
    const baseProjectDir = getBaseProjectDir();
    
    // Convert the output file path to an absolute path with Windows-style backslashes
    const outputFileFullPath = path.join(baseProjectDir, outputFilePath);
    
    // Replace [Output File For This Prompt] with the full absolute output file path
    // Note: Case insensitive replace to catch both variants (Prompt vs prompt)
    customized = customized.replace(/\[Output File For This [Pp]rompt\]/g, outputFileFullPath);
    
    // Build the full test mapping path with Windows-style backslashes
    const testMappingRelativePath = `pmc/product/_mapping/test-maps/06-${projectAbbreviation}-task-test-mapping-${sectionId}.md`;
    const testMappingFullPath = path.join(baseProjectDir, testMappingRelativePath);
    
    // Replace _mappings/06-aplio-mod-1-task-mapping.md with the relative test mapping file path
    customized = customized.replace(/_mappings\/06-aplio-mod-1-task-mapping\.md/g, testMappingRelativePath);
    
    // Replace [Test Mapping Path] with the full absolute path with single backticks
    customized = customized.replace(/\[Test Mapping Path\]/g, `\`${testMappingFullPath}\``);
    
    return customized;
}

/**
 * Generate only prompt files from existing task files
 * @param {string} projectName - The full project name
 * @param {string} projectAbbreviation - The project abbreviation (e.g., 'aplio-mod-1')
 */
function generatePromptsOnly(projectName, projectAbbreviation) {
    // Define file paths
    const promptTemplateFileName = `06a-product-task-elements-breakdown-prompt-v5.4.md`;
    const promptTemplatePath = resolveProjectPath(`product/_prompt_engineering/${promptTemplateFileName}`);
    
    // Define directories
    const taskFilesDir = resolveProjectPath(`product/_mapping/task-file-maps`);
    const promptsOutputDir = path.join(taskFilesDir, 'prompts');
    
    // Ensure output directory exists
    ensureDirectoryExists(promptsOutputDir);
    
    console.log(`Running from: ${process.cwd()}`);
    console.log(`Reading prompt template from: ${promptTemplatePath}`);
    console.log(`Reading task files from: ${taskFilesDir}`);
    console.log(`Writing prompt files to: ${promptsOutputDir}`);
    
    // Check if prompt template exists
    if (!fs.existsSync(promptTemplatePath)) {
        console.error(`Error: Prompt template not found at ${promptTemplatePath}`);
        process.exit(1);
    }
    
    // Read prompt template
    const promptTemplate = fs.readFileSync(promptTemplatePath, 'utf-8');
    
    // Get list of task files
    const taskFilePattern = new RegExp(`^6-${projectAbbreviation}-tasks-E\\d{2}\\.md$`);
    const files = fs.readdirSync(taskFilesDir);
    const taskFiles = files.filter(file => taskFilePattern.test(file));
    
    if (taskFiles.length === 0) {
        console.error(`Error: No task files found matching the pattern in ${taskFilesDir}`);
        process.exit(1);
    }
    
    console.log(`Found ${taskFiles.length} task files to process`);
    
    // Process each task file
    for (const taskFileName of taskFiles) {
        // Extract section ID from filename (e.g., "E01" from "6-aplio-mod-1-tasks-E01.md")
        const sectionId = taskFileName.match(/E\d{2}/)[0];
        const taskFilePath = path.join(taskFilesDir, taskFileName);
        
        console.log(`Processing task file: ${taskFileName} (Section ID: ${sectionId})`);
        
        // Read task file
        const taskContent = fs.readFileSync(taskFilePath, 'utf-8');
        
        // Extract section header
        const sectionHeader = extractSectionHeader(taskContent);
        console.log(`Section header: ${sectionHeader}`);
        
        // Create relative path with forward slashes for the output file reference
        const outputFileRelPath = `product/_mapping/task-file-maps/${taskFileName}`;
        
        // Generate and write customized prompt
        const customizedPrompt = customizePrompt(promptTemplate, sectionHeader, sectionId, outputFileRelPath, projectAbbreviation);
        const promptFilePath = path.join(promptsOutputDir, `06a-product-task-elements-breakdown-prompt-v5.4-${sectionId}.md`);
        
        fs.writeFileSync(promptFilePath, customizedPrompt, { encoding: 'utf-8' });
        console.log(`Wrote prompt file: ${promptFilePath}`);
    }
    
    console.log(`Successfully regenerated all prompt files.`);
}

// --- CLI Entry Point ---
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
        console.error('Usage: node <path_to_script>/utility-06b-generate-prompts-only.js <"Project Name"> <project-abbreviation>');
        console.error('Examples:');
        console.error('  From project root:');
        console.error('  node product/_tools/utility-06b-generate-prompts-only.js "Aplio Design System Modernization" aplio-mod-1');
        console.error('');
        console.error('  From any directory:');
        console.error('  node /path/to/pmc/product/_tools/utility-06b-generate-prompts-only.js "Aplio Design System Modernization" aplio-mod-1');
        process.exit(1);
    }

    const [projectName, projectAbbreviation] = args;
    generatePromptsOnly(projectName, projectAbbreviation);
}

// Export for potential testing or module use
module.exports = { 
    generatePromptsOnly,
    extractSectionHeader,
    customizePrompt,
    getBaseProjectDir
}; 