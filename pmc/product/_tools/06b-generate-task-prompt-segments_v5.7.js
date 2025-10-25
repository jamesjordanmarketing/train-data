/**
 *  * Task File Segmentation Script
 *  *Version 5.7 using prompt 5.7
 * 
 * This script segments an existing task file into separate files by major section
 * and generates customized prompt files for each section based on a template.
 * It creates an index file that links to all segment files.
 * 
 * The script reads from:
 * - pmc/product/06-[project-abbreviation]-tasks.md (existing task file)
 * - pmc/product/_prompt_engineering/06a-product-task-elements-breakdown-prompt-v5.7.md (template)
 * 
 * And outputs:
 * - pmc/product/_mapping/task-file-maps/6-[project-abbreviation]-tasks-E[XX].md (section files)
 * - pmc/product/_mapping/task-file-maps/prompts/06a-product-task-elements-breakdown-prompt-v5.7-E[XX].md (customized prompts)
 * - pmc/product/_mapping/task-file-maps/6-[project-abbreviation]-tasks-index.md (index file)
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
 * Parse task file to identify major sections
 * @param {string} tasksContent - Content of the tasks file
 * @returns {Object} Object with section ID as key and content as value
 */
function parseTaskFile(tasksContent) {
    const lines = tasksContent.split(/\r?\n/);
    const sections = {};
    let currentSection = null;
    let currentContent = [];
    let inHeader = true;
    let headerContent = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        // Detect major section headers (level 2 headings, e.g., ## 1. Project Foundation)
        if (trimmedLine.match(/^##\s+\d+\.\s+.+$/)) {
            // If we encounter a new section, save the previous one (if exists)
            if (currentSection) {
                sections[currentSection] = currentContent.join('\n');
                currentContent = [];
            } else {
                // First section encountered, store the header content
                inHeader = false;
                headerContent = lines.slice(0, i);
            }
            
            // Extract section number from the heading (e.g., "1" from "## 1. Project Foundation")
            const sectionNumber = trimmedLine.match(/^##\s+(\d+)\./)[1];
            currentSection = `E${sectionNumber.padStart(2, '0')}`;
            
            // Start content with the section header
            currentContent.push(line);
        } else if (currentSection) {
            // Add content to current section
            currentContent.push(line);
        } else if (inHeader) {
            // Add to header content before any sections are found
            headerContent.push(line);
        }
    }
    
    // Add the last section if it exists
    if (currentSection) {
        sections[currentSection] = currentContent.join('\n');
    }
    
    // Store header content
    sections['header'] = headerContent.join('\n');
    
    return sections;
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
 * Generate index file with links to all section files
 * @param {Object} sections - Object with section ID as key and content as value
 * @param {string} projectName - Name of the project
 * @param {string} projectAbbreviation - Abbreviation of the project
 * @returns {string} Index file content
 */
function generateIndexFile(sections, projectName, projectAbbreviation) {
    const sectionIds = Object.keys(sections).filter(id => id !== 'header');
    const timestamp = new Date().toISOString();
    
    let indexContent = `# ${projectName} Tasks - Section Index\n\n`;
    indexContent += `**Generated:** ${timestamp}\n\n`;
    indexContent += `This index contains links to task sections and their corresponding prompt files.\n\n`;
    
    indexContent += `## Sections\n\n`;
    
    for (const sectionId of sectionIds) {
        const sectionContent = sections[sectionId];
        const sectionHeader = extractSectionHeader(sectionContent);
        
        indexContent += `### ${sectionHeader}\n\n`;
        indexContent += `- **Task File**: [${sectionId} - ${sectionHeader}](./6-${projectAbbreviation}-tasks-${sectionId}.md)\n`;
        indexContent += `- **Prompt File**: [Breakdown Prompt for ${sectionId}](./prompts/06a-product-task-elements-breakdown-prompt-v5.7-${sectionId}.md)\n\n`;
    }
    
    return indexContent;
}

/**
 * Generate task segments and customized prompts
 * @param {string} projectName - The full project name
 * @param {string} projectAbbreviation - The project abbreviation (e.g., 'aplio-mod-1')
 */
function generateTaskSegments(projectName, projectAbbreviation) {
    // Define file paths
    const taskFileName = `06-${projectAbbreviation}-tasks.md`;
    const promptTemplateFileName = `06a-product-task-elements-breakdown-prompt-v5.7.md`;
    
    const taskFilePath = resolveProjectPath(`product/${taskFileName}`);
    const promptTemplatePath = resolveProjectPath(`product/_prompt_engineering/${promptTemplateFileName}`);
    
    // Define output directories
    const outputDir = resolveProjectPath(`product/_mapping/task-file-maps`);
    const promptsOutputDir = path.join(outputDir, 'prompts');
    const testMapsDir = resolveProjectPath(`product/_mapping/test-maps`);
    
    // Ensure output directories exist
    ensureDirectoryExists(outputDir);
    ensureDirectoryExists(promptsOutputDir);
    ensureDirectoryExists(testMapsDir);
    
    console.log(`Running from: ${process.cwd()}`);
    console.log(`Reading task file from: ${taskFilePath}`);
    console.log(`Reading prompt template from: ${promptTemplatePath}`);
    console.log(`Writing section files to: ${outputDir}`);
    console.log(`Writing prompt files to: ${promptsOutputDir}`);
    console.log(`Test mapping files directory: ${testMapsDir}`);
    
    // Check if input files exist
    if (!fs.existsSync(taskFilePath)) {
        console.error(`Error: Task file not found at ${taskFilePath}`);
        process.exit(1);
    }
    
    if (!fs.existsSync(promptTemplatePath)) {
        console.error(`Error: Prompt template not found at ${promptTemplatePath}`);
        process.exit(1);
    }
    
    // Read input files
    const taskContent = fs.readFileSync(taskFilePath, 'utf-8');
    const promptTemplate = fs.readFileSync(promptTemplatePath, 'utf-8');
    
    // Parse task file to identify sections
    const sections = parseTaskFile(taskContent);
    
    // Generate and write section files and customized prompts
    for (const [sectionId, sectionContent] of Object.entries(sections)) {
        // Skip the header section, it's just for storage
        if (sectionId === 'header') continue;
        
        const sectionHeader = extractSectionHeader(sectionContent);
        console.log(`Processing section: ${sectionId} - ${sectionHeader}`);
        
        // Write section file
        const sectionFileName = `6-${projectAbbreviation}-tasks-${sectionId}.md`;
        const sectionFilePath = path.join(outputDir, sectionFileName);
        const sectionFileContent = `${sections['header']}\n\n${sectionContent}`;
        fs.writeFileSync(sectionFilePath, sectionFileContent, { encoding: 'utf-8' });
        console.log(`Wrote section file: ${sectionFilePath}`);
        
        // Create relative path with forward slashes for the output file reference
        const outputFileRelPath = `pmc/product/_mapping/task-file-maps/${sectionFileName}`;
        
        // Generate and write customized prompt
        const customizedPrompt = customizePrompt(promptTemplate, sectionHeader, sectionId, outputFileRelPath, projectAbbreviation);
        const promptFilePath = path.join(promptsOutputDir, `06a-product-task-elements-breakdown-prompt-v5.7-${sectionId}.md`);
        fs.writeFileSync(promptFilePath, customizedPrompt, { encoding: 'utf-8' });
        console.log(`Wrote prompt file: ${promptFilePath}`);
    }
    
    // Generate and write index file
    const indexFilePath = path.join(outputDir, `6-${projectAbbreviation}-tasks-index.md`);
    const indexContent = generateIndexFile(sections, projectName, projectAbbreviation);
    fs.writeFileSync(indexFilePath, indexContent, { encoding: 'utf-8' });
    console.log(`Wrote index file: ${indexFilePath}`);
    
    console.log(`Successfully generated all files.`);
}

// --- CLI Entry Point ---
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
        console.error('Usage: node <path_to_script>/06b-generate-task-prompt-segments.js <"Project Name"> <project-abbreviation>');
        console.error('Examples:');
        console.error('  From project root:');
        console.error('  node product/_tools/06b-generate-task-prompt-segments.js "Aplio Design System Modernization" aplio-mod-1');
        console.error('');
        console.error('  From any directory:');
        console.error('  node /path/to/pmc/product/_tools/06b-generate-task-prompt-segments.js "Aplio Design System Modernization" aplio-mod-1');
        process.exit(1);
    }

    const [projectName, projectAbbreviation] = args;
    generateTaskSegments(projectName, projectAbbreviation);
}

// Export for potential testing or module use
module.exports = { 
    generateTaskSegments, 
    parseTaskFile,
    extractSectionHeader,
    customizePrompt,
    generateIndexFile,
    getBaseProjectDir
}; 