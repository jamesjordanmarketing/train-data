/**
 * UI Functional Requirements Segmentation Script
 * Version 1.0
 * 
 * This script segments functional requirements into separate files by major section
 * and generates customized prompt files for each section based on a template.
 * It creates an index file that links to all segment files.
 * 
 * The script reads from:
 * - pmc/product/03-[project-abbreviation]-functional-requirements.md (existing functional requirements file)
 * - pmc/product/_prompt_engineering/04-[project-abbreviation]-ui-first-functional-requirements-prompt_v2.md (template)
 * 
 * And outputs:
 * - pmc/product/_mapping/ui-functional-maps/04-ui-first-functional-requirements-E[XX].md (section files)
 * - pmc/product/_mapping/ui-functional-maps/prompts/04-[project-abbreviation]-ui-first-functional-requirements-prompt-E[XX].md (customized prompts)
 * - pmc/product/_mapping/ui-functional-maps/04-ui-first-functional-requirements-index.md (index file)
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
 * Parse functional requirements file to identify major sections
 * @param {string} requirementsContent - Content of the functional requirements file
 * @returns {Object} Object with section ID as key and content as value
 */
function parseFunctionalRequirementsFile(requirementsContent) {
    const lines = requirementsContent.split(/\r?\n/);
    const sections = {};
    let currentSection = null;
    let currentContent = [];
    let inHeader = true;
    let headerContent = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        // Detect major section headers (level 2 headings, e.g., ## 1. Foundation and Infrastructure Layer)
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
            
            // Extract section number from the heading (e.g., "1" from "## 1. Foundation and Infrastructure Layer")
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
 * @param {string} projectAbbreviation - Project abbreviation for generating file paths
 * @returns {string} Customized prompt content
 */
function customizePrompt(promptTemplate, sectionHeader, sectionId, outputFilePath, projectAbbreviation) {
    let customized = promptTemplate;
    
    // Replace the new placeholder variables
    // 1. Replace {{Major_FR_Number_Tier}} with the section header
    customized = customized.replace(/\{\{Major_FR_Number_Tier\}\}/g, sectionHeader);
    
    // 2. Replace {{Output_File_For_Prompt}} with the output file path
    customized = customized.replace(/\{\{Output_File_For_Prompt\}\}/g, outputFilePath);
    
    // Replace section-specific placeholders (existing functionality)
    // Look for patterns like "## 3. Training Data Generation Engine" and replace with actual section header
    customized = customized.replace(/##\s+\d+\.\s+Training Data Generation Engine/g, sectionHeader);
    
    // Get base project directory for absolute paths
    const baseProjectDir = getBaseProjectDir();
    
    // Convert the output file path to an absolute path with Windows-style backslashes
    const outputFileFullPath = path.join(baseProjectDir, outputFilePath);
    
    // Replace output file path references (existing functionality)
    customized = customized.replace(/pmc\\product\\_mapping\\ui-functional-maps\\04-ui-first-functional-requirements-E03\.md/g, outputFilePath);
    
    // Replace any other section-specific references that might exist in the template
    // This can be expanded based on the actual template content
    
    return customized;
}

/**
 * Generate index file with links to all section files
 * @param {Object} sections - Object with section ID as key and content as value
 * @param {string} projectName - Name of the project
 * @param {string} projectAbbreviation - Project abbreviation for file naming
 * @returns {string} Index file content
 */
function generateIndexFile(sections, projectName, projectAbbreviation) {
    const sectionIds = Object.keys(sections).filter(id => id !== 'header');
    const timestamp = new Date().toISOString();
    
    let indexContent = `# ${projectName} UI-First Functional Requirements - Section Index\n\n`;
    indexContent += `**Generated:** ${timestamp}\n\n`;
    indexContent += `This index contains links to UI-first functional requirements sections and their corresponding prompt files.\n\n`;
    
    indexContent += `## Sections\n\n`;
    
    for (const sectionId of sectionIds) {
        const sectionContent = sections[sectionId];
        const sectionHeader = extractSectionHeader(sectionContent);
        
        indexContent += `### ${sectionHeader}\n\n`;
        indexContent += `- **Requirements File**: [${sectionId} - ${sectionHeader}](./04-${projectAbbreviation}-ui-first-functional-requirements-${sectionId}.md)\n`;
        indexContent += `- **Prompt File**: [UI-First Prompt for ${sectionId}](./prompts/04-ui-first-functional-requirements-prompt-${sectionId}.md)\n\n`;
    }
    
    return indexContent;
}

/**
 * Generate UI functional requirements segments and customized prompts
 * @param {string} projectName - The full project name
 * @param {string} projectAbbreviation - The project abbreviation (e.g., 'bmo')
 */
function generateUIFunctionalRequirementsSegments(projectName, projectAbbreviation) {
    // Define file paths
    const functionalRequirementsFileName = `03-${projectAbbreviation}-functional-requirements.md`;
    const promptTemplateFileName = `04-${projectAbbreviation}-ui-first-functional-requirements-prompt_v2.md`;
    
    const functionalRequirementsFilePath = resolveProjectPath(`product/${functionalRequirementsFileName}`);
    const promptTemplatePath = resolveProjectPath(`product/_prompt_engineering/${promptTemplateFileName}`);
    
    // Define output directories
    const outputDir = resolveProjectPath(`product/_mapping/ui-functional-maps`);
    const promptsOutputDir = path.join(outputDir, 'prompts');
     
    // Ensure output directories exist
    ensureDirectoryExists(outputDir);
    ensureDirectoryExists(promptsOutputDir);
    
    console.log(`Running from: ${process.cwd()}`);
    console.log(`Reading functional requirements file from: ${functionalRequirementsFilePath}`);
    console.log(`Reading prompt template from: ${promptTemplatePath}`);
    console.log(`Writing section files to: ${outputDir}`);
    console.log(`Writing prompt files to: ${promptsOutputDir}`);
    
    // Check if input files exist
    if (!fs.existsSync(functionalRequirementsFilePath)) {
        console.error(`Error: Functional requirements file not found at ${functionalRequirementsFilePath}`);
        process.exit(1);
    }
    
    if (!fs.existsSync(promptTemplatePath)) {
        console.error(`Error: Prompt template not found at ${promptTemplatePath}`);
        process.exit(1);
    }
    
    // Read input files
    const functionalRequirementsContent = fs.readFileSync(functionalRequirementsFilePath, 'utf-8');
    const promptTemplate = fs.readFileSync(promptTemplatePath, 'utf-8');
    
    // Parse functional requirements file to identify sections
    const sections = parseFunctionalRequirementsFile(functionalRequirementsContent);
    
    // Generate and write section files and customized prompts
    for (const [sectionId, sectionContent] of Object.entries(sections)) {
        // Skip the header section, it's just for storage
        if (sectionId === 'header') continue;
        
        const sectionHeader = extractSectionHeader(sectionContent);
        console.log(`Processing section: ${sectionId} - ${sectionHeader}`);
        
        // Write section file to main directory
        const sectionFileName = `04-${projectAbbreviation}-ui-first-functional-requirements-${sectionId}.md`;
        const sectionFilePath = path.join(outputDir, sectionFileName);
        const sectionFileContent = `${sections['header']}\n\n${sectionContent}`;
        fs.writeFileSync(sectionFilePath, sectionFileContent, { encoding: 'utf-8' });
        console.log(`Wrote section file: ${sectionFilePath}`);
        
        // Create relative path with forward slashes for the output file reference
        const outputFileRelPath = `pmc/product/_mapping/ui-functional-maps/04-${projectAbbreviation}-ui-first-functional-requirements-${sectionId}.md`;
        
        // Generate and write customized prompt (without project abbreviation)
        const customizedPrompt = customizePrompt(promptTemplate, sectionHeader, sectionId, outputFileRelPath, projectAbbreviation);
        const promptFilePath = path.join(promptsOutputDir, `04-ui-first-functional-requirements-prompt-${sectionId}.md`);
        fs.writeFileSync(promptFilePath, customizedPrompt, { encoding: 'utf-8' });
        console.log(`Wrote prompt file: ${promptFilePath}`);
    }
    
    // Generate and write index file
    const indexFilePath = path.join(outputDir, `04-ui-first-functional-requirements-index.md`);
    const indexContent = generateIndexFile(sections, projectName, projectAbbreviation);
    fs.writeFileSync(indexFilePath, indexContent, { encoding: 'utf-8' });
    console.log(`Wrote index file: ${indexFilePath}`);
    
    console.log(`Successfully generated all files.`);
}

// --- CLI Entry Point ---
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
        console.error('Usage: node <path_to_script>/04-generate-FR-prompt-segments.js <"Project Name"> <project-abbreviation>');
        console.error('Examples:');
        console.error('  From project root:');
        console.error('  node product/_tools/04-generate-FR-prompt-segments.js "Bright Run LoRA Fine-Tuning Training Data Platform" bmo');
        console.error('');
        console.error('  From any directory:');
        console.error('  node /path/to/pmc/product/_tools/04-generate-FR-prompt-segments.js "Bright Run LoRA Fine-Tuning Training Data Platform" bmo');
        process.exit(1);
    }

    const [projectName, projectAbbreviation] = args;
    generateUIFunctionalRequirementsSegments(projectName, projectAbbreviation);
}

// Export for potential testing or module use
module.exports = { 
    generateUIFunctionalRequirementsSegments, 
    parseFunctionalRequirementsFile,
    extractSectionHeader,
    customizePrompt,
    generateIndexFile,
    getBaseProjectDir
};