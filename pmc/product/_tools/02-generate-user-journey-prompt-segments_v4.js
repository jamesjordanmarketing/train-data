/**
 * User Journey Segmentation Script
 * Version 4.0 - Enhanced Content Filtering
 * 
 * This script segments user journey into separate files by stage
 * and generates customized prompt files for each stage based on the
 * enhanced Version E template with hybrid acceptance criteria.
 * 
 * NEW IN V4:
 * - Content filtering to remove unwanted sections from output files
 * - Filters out content from "### Journey Scope and Boundaries" through "## User Persona Definitions"
 * - Cleaner stage-specific files without noise content
 * - Maintains all v3 functionality
 * 
 * The script reads from:
 * - pmc/product/03.5-[project-abbreviation]-user-journey.md (existing user journey file)
 * - pmc/product/_prompt_engineering/03.5-user-journey-stages-prompt-template_v9-version-e.md (Version E template)
 * 
 * And outputs:
 * - pmc/product/_mapping/02-user-journeys/specs/03.5-user-journey-E##.md (stage spec files)
 * - pmc/product/_mapping/02-user-journeys/prompts/03.5-user-journey-prompt-E##.md (customized prompts)
 * - pmc/product/_mapping/02-user-journeys/03.5-user-journey-index.md (index file)
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
 * Parse user journey file to identify stages with content filtering
 * @param {string} userJourneyContent - Content of the user journey file
 * @returns {Object} Object with stage ID as key and content as value
 */
function parseUserJourneyFile(userJourneyContent) {
    const lines = userJourneyContent.split(/\r?\n/);
    const stages = {};
    let currentStage = null;
    let currentContent = [];
    let inHeader = true;
    let headerContent = [];
    let inUnwantedSection = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        // Check for the start of unwanted content section
        if (trimmedLine === '### Journey Scope and Boundaries') {
            inUnwantedSection = true;
            continue; // Skip this line
        }
        
        // Detect stage headers (level 2 headings, e.g., ## 1. Discovery & Project Initialization)
        if (trimmedLine.match(/^##\s+\d+\.\s+.+$/)) {
            // End of unwanted section when we hit the first stage
            inUnwantedSection = false;
            
            // If we encounter a new stage, save the previous one (if exists)
            if (currentStage) {
                stages[currentStage] = currentContent.join('\n');
                currentContent = [];
            } else {
                // First stage encountered, store the filtered header content
                inHeader = false;
            }
            
            // Extract stage number from the heading (e.g., "1" from "## 1. Discovery & Project Initialization")
            const stageNumber = trimmedLine.match(/^##\s+(\d+)\./)[1];
            currentStage = `E${stageNumber.padStart(2, '0')}`;
            
            // Start content with the stage header
            currentContent.push(line);
        } else if (currentStage) {
            // Add content to current stage (we're past the header section)
            currentContent.push(line);
        } else if (inHeader && !inUnwantedSection) {
            // Add to header content only if we're not in an unwanted section
            headerContent.push(line);
        }
        // If we're in an unwanted section and not processing a stage, skip the line
    }
    
    // Add the last stage if it exists
    if (currentStage) {
        stages[currentStage] = currentContent.join('\n');
    }
    
    // Store filtered header content
    stages['header'] = headerContent.join('\n');
    
    return stages;
}

/**
 * Extract stage header and details from stage content
 * @param {string} stageContent - Content of the stage
 * @returns {Object} Object with stage header, number, name, and description
 */
function extractStageInfo(stageContent) {
    const lines = stageContent.split(/\r?\n/);
    let stageHeader = "";
    let stageNumber = "";
    let stageName = "";
    let stageDescription = "";
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        // Find the stage header (## X. Name)
        if (trimmedLine.match(/^##\s+\d+\.\s+.+$/)) {
            stageHeader = trimmedLine;
            const match = trimmedLine.match(/^##\s+(\d+)\.\s+(.+)$/);
            if (match) {
                stageNumber = match[1];
                stageName = match[2];
            }
        }
        
        // Find the stage description (STAGE X: Name)
        if (trimmedLine.match(/^\*\*STAGE\s+\d+:/)) {
            stageDescription = trimmedLine;
            break;
        }
    }
    
    return {
        header: stageHeader,
        number: stageNumber,
        name: stageName,
        description: stageDescription,
        id: `UJ${stageNumber}`,
        stageId: `E${stageNumber.padStart(2, '0')}`
    };
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
 * Calculate previous and next stage IDs for cross-stage references
 * @param {string} currentStageId - Current stage ID (e.g., "E02")
 * @param {number} totalStages - Total number of stages available
 * @returns {Object} Object with previous and next stage IDs
 */
function calculateStageReferences(currentStageId, totalStages = 6) {
    const stageMatch = currentStageId.match(/^E(\d+)$/);
    if (!stageMatch) {
        return { previous: null, next: null };
    }
    
    const currentNum = parseInt(stageMatch[1], 10);
    
    const previous = currentNum > 1 ? `E${(currentNum - 1).toString().padStart(2, '0')}` : null;
    const next = currentNum < totalStages ? `E${(currentNum + 1).toString().padStart(2, '0')}` : null;
    
    return { previous, next };
}

/**
 * Enhanced prompt customization for Version E template with new variable patterns
 * @param {string} promptTemplate - Template content
 * @param {Object} stageInfo - Stage information object
 * @param {string} outputFilePath - Path to the output file for this stage
 * @param {string} projectAbbreviation - Project abbreviation for generating file paths
 * @returns {string} Customized prompt content
 */
function customizePrompt(promptTemplate, stageInfo, outputFilePath, projectAbbreviation) {
    let customized = promptTemplate;
    
    // Calculate stage references for cross-stage integration
    const stageRefs = calculateStageReferences(stageInfo.stageId);
    
    // NEW VERSION E PATTERNS - Handle complex patterns first to avoid double replacements
    // For [STAGE-1] and [STAGE+1], extract just the number portion since template already has 'E' prefix
    const prevStageNum = stageRefs.previous ? stageRefs.previous.replace('E', '') : 'N/A';
    const nextStageNum = stageRefs.next ? stageRefs.next.replace('E', '') : 'N/A';
    
    customized = customized.replace(/\[STAGE-1\]/g, prevStageNum);
    customized = customized.replace(/\[STAGE\+1\]/g, nextStageNum);
    
    // Handle stage number patterns (just the number without 'E')
    customized = customized.replace(/\[STAGE\]/g, stageInfo.number);
    
    // BACKWARDS COMPATIBILITY - Existing v2 patterns
    customized = customized.replace(/\[STAGE_NUMBER_PLACEHOLDER\]/g, stageInfo.number);
    customized = customized.replace(/\[STAGE_NAME_PLACEHOLDER\]/g, stageInfo.name);
    customized = customized.replace(/\[STAGE_ID_PLACEHOLDER\]/g, stageInfo.id);
    customized = customized.replace(/\[PROJECT_ABBREVIATION_PLACEHOLDER\]/g, projectAbbreviation);
    customized = customized.replace(/\[OUTPUT_FILE_PATH_PLACEHOLDER\]/g, outputFilePath);
    
    // File path references for the enhanced template
    const locateFile = `pmc/product/03.5-${projectAbbreviation}-user-journey.md`;
    customized = customized.replace(/\[UJ_LOCATE_FILE_PATH_PLACEHOLDER\]/g, locateFile);
    customized = customized.replace(/\[UJ_LOCATE_LINE_PLACEHOLDER\]/g, "See stage parsing");
    
    // Additional Version E template placeholders (if they exist in the template)
    // These will only replace if the patterns exist, otherwise they'll be ignored
    customized = customized.replace(/\[Stage Name and Purpose\]/g, stageInfo.name);
    customized = customized.replace(/\[Subsection Name\]/g, `${stageInfo.name} Operations`);
    
    // Date and version placeholders (common in Version E)
    const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '-');
    customized = customized.replace(/\[MM-DD-YYYY\]/g, currentDate);
    customized = customized.replace(/\[X\.0\.0\]/g, '4.0.0');
    
    return customized;
}

/**
 * Generate index file with links to all stage files
 * @param {Object} stages - Object with stage ID as key and content as value
 * @param {string} projectName - Name of the project
 * @param {string} projectAbbreviation - Project abbreviation for file naming
 * @returns {string} Index file content
 */
function generateIndexFile(stages, projectName, projectAbbreviation) {
    const stageIds = Object.keys(stages).filter(id => id !== 'header').sort();
    const timestamp = new Date().toISOString();
    
    let indexContent = `# ${projectName} User Journey - Stage Index\n\n`;
    indexContent += `**Generated:** ${timestamp}\n`;
    indexContent += `**Tool Version:** v4.0 (Content Filtering Enhanced)\n\n`;
    indexContent += `This index contains links to user journey stages and their corresponding prompt files.\n\n`;
    
    indexContent += `## Stages\n\n`;
    
    for (const stageId of stageIds) {
        const stageContent = stages[stageId];
        const stageInfo = extractStageInfo(stageContent);
        
        indexContent += `### ${stageInfo.header}\n\n`;
        indexContent += `- **Spec File**: [${stageInfo.stageId} - ${stageInfo.name}](./specs/03.5-user-journey-${stageInfo.stageId}.md)\n`;
        indexContent += `- **Prompt File**: [User Journey Prompt for ${stageInfo.stageId}](./prompts/03.5-user-journey-prompt-${stageInfo.stageId}.md)\n`;
        indexContent += `- **Output File**: [Generated Output for ${stageInfo.stageId}](./03.5-user-journey-${stageInfo.stageId}-output.md)\n\n`;
    }
    
    return indexContent;
}

/**
 * Generate user journey segments and customized prompts using Version E template with content filtering
 * @param {string} projectName - The full project name
 * @param {string} projectAbbreviation - The project abbreviation (e.g., 'bmo')
 */
function generateUserJourneySegments(projectName, projectAbbreviation) {
    // Define file paths - Updated for Version E template
    const userJourneyFileName = `03.5-${projectAbbreviation}-user-journey.md`;
    const promptTemplateFileName = `03.5-user-journey-stages-prompt-template_v9-version-e.md`;
    
    const userJourneyFilePath = resolveProjectPath(`product/${userJourneyFileName}`);
    const promptTemplatePath = resolveProjectPath(`product/_prompt_engineering/${promptTemplateFileName}`);
    
    // Define output directories
    const outputDir = resolveProjectPath(`product/_mapping/02-user-journeys`);
    const specsOutputDir = path.join(outputDir, 'specs');
    const promptsOutputDir = path.join(outputDir, 'prompts');
     
    // Ensure output directories exist
    ensureDirectoryExists(outputDir);
    ensureDirectoryExists(specsOutputDir);
    ensureDirectoryExists(promptsOutputDir);
    
    console.log(`User Journey Generator v4.0 (Content Filtering Enhanced)`);
    console.log(`Running from: ${process.cwd()}`);
    console.log(`Reading user journey file from: ${userJourneyFilePath}`);
    console.log(`Reading Version E template from: ${promptTemplatePath}`);
    console.log(`Writing spec files to: ${specsOutputDir}`);
    console.log(`Writing prompt files to: ${promptsOutputDir}`);
    
    // Check if input files exist
    if (!fs.existsSync(userJourneyFilePath)) {
        console.error(`Error: User journey file not found at ${userJourneyFilePath}`);
        process.exit(1);
    }
    
    if (!fs.existsSync(promptTemplatePath)) {
        console.error(`Error: Version E template not found at ${promptTemplatePath}`);
        console.error(`Expected: ${promptTemplateFileName}`);
        process.exit(1);
    }
    
    // Read input files
    const userJourneyContent = fs.readFileSync(userJourneyFilePath, 'utf-8');
    const promptTemplate = fs.readFileSync(promptTemplatePath, 'utf-8');
    
    console.log(`Successfully loaded Version E template (${promptTemplate.length} characters)`);
    
    // Parse user journey file to identify stages with content filtering
    const stages = parseUserJourneyFile(userJourneyContent);
    const stageCount = Object.keys(stages).filter(id => id !== 'header').length;
    console.log(`Parsed ${stageCount} stages from user journey file with content filtering`);
    
    // Log content filtering status
    const originalLines = userJourneyContent.split(/\r?\n/).length;
    const filteredHeaderLines = stages['header'].split(/\r?\n/).length;
    console.log(`📝 Content filtering: ${originalLines} total lines → ${filteredHeaderLines} header lines (unwanted sections removed)`);
    
    // Generate and write stage files and customized prompts
    for (const [stageId, stageContent] of Object.entries(stages)) {
        // Skip the header stage, it's just for storage
        if (stageId === 'header') continue;
        
        const stageInfo = extractStageInfo(stageContent);
        console.log(`Processing stage: ${stageId} - ${stageInfo.header}`);
        
        // Write spec file to specs directory with filtered header content
        const specFileName = `03.5-user-journey-${stageInfo.stageId}.md`;
        const specFilePath = path.join(specsOutputDir, specFileName);
        const specFileContent = `${stages['header']}\n\n${stageContent}`;
        fs.writeFileSync(specFilePath, specFileContent, { encoding: 'utf-8' });
        console.log(`✓ Wrote filtered spec file: ${specFilePath}`);
        
        // Create relative path with forward slashes for the output file reference (this is where the prompt output goes)
        const outputFileRelPath = `pmc/product/_mapping/02-user-journeys/03.5-user-journey-${stageInfo.stageId}-output.md`;
        
        // Generate and write customized prompt using enhanced Version E customization
        const customizedPrompt = customizePrompt(promptTemplate, stageInfo, outputFileRelPath, projectAbbreviation);
        const promptFilePath = path.join(promptsOutputDir, `03.5-user-journey-prompt-${stageInfo.stageId}.md`);
        fs.writeFileSync(promptFilePath, customizedPrompt, { encoding: 'utf-8' });
        console.log(`✓ Wrote Version E prompt file: ${promptFilePath}`);
        
        // Log variable replacements for debugging
        const stageRefs = calculateStageReferences(stageInfo.stageId);
        const prevStageNum = stageRefs.previous ? stageRefs.previous.replace('E', '') : 'N/A';
        const nextStageNum = stageRefs.next ? stageRefs.next.replace('E', '') : 'N/A';
        console.log(`  Variables: [STAGE]=${stageInfo.number}, [STAGE-1]=${prevStageNum}, [STAGE+1]=${nextStageNum}`);
    }
    
    // Generate and write index file
    const indexFilePath = path.join(outputDir, `03.5-user-journey-index.md`);
    const indexContent = generateIndexFile(stages, projectName, projectAbbreviation);
    fs.writeFileSync(indexFilePath, indexContent, { encoding: 'utf-8' });
    console.log(`✓ Wrote content-filtered index file: ${indexFilePath}`);
    
    console.log(`\n🎉 Successfully generated all files with content filtering!`);
    console.log(`📊 Processed ${stageCount} stages with enhanced variable mapping`);
    console.log(`🔗 Cross-stage references calculated automatically`);
    console.log(`🧹 Unwanted content sections filtered from output files`);
    console.log(`📋 Index file updated with v4.0 metadata\n`);
}

// --- CLI Entry Point ---
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
        console.error('User Journey Generator v4.0 (Content Filtering Enhanced)');
        console.error('Usage: node <path_to_script>/02-generate-user-journey-prompt-segments_v4.js <"Project Name"> <project-abbreviation>');
        console.error('');
        console.error('Examples:');
        console.error('  From project root:');
        console.error('  node pmc/product/_tools/02-generate-user-journey-prompt-segments_v4.js "Bright Run LoRA Fine-Tuning Training Data Platform" bmo');
        console.error('');
        console.error('  From any directory:');
        console.error('  node /path/to/pmc/product/_tools/02-generate-user-journey-prompt-segments_v4.js "Bright Run LoRA Fine-Tuning Training Data Platform" bmo');
        console.error('');
        console.error('NEW IN V4:');
        console.error('- Content filtering removes unwanted sections from output files');
        console.error('- Filters out Journey Scope, Success Definition, Value Progression, and User Persona sections');
        console.error('- Cleaner stage-specific files without noise content');
        console.error('- Maintains all v3 functionality and Version E template support');
        process.exit(1);
    }

    const [projectName, projectAbbreviation] = args;
    generateUserJourneySegments(projectName, projectAbbreviation);
}

// Export for potential testing or module use
module.exports = { 
    generateUserJourneySegments, 
    parseUserJourneyFile,
    extractStageInfo,
    customizePrompt,
    generateIndexFile,
    getBaseProjectDir,
    calculateStageReferences
};
