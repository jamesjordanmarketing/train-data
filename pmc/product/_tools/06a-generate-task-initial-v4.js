/**
 * Enhanced Task Generation Script v4
 * 
 * This script transforms functional requirements into an initial task structure.
 * It creates a task file (06-[project-abbreviation]-tasks.md) by extracting and
 * transforming functional requirements from the source file 
 * (03-[project-abbreviation]-functional-requirements.md).
 * 
 * The script specifically excludes User Stories, Tasks references, and User Story
 * Acceptance Criteria while preserving Description, Impact Weighting, and the full
 * Functional Requirements Acceptance Criteria.
 *
 * Updated to convert FR X.Y.Z to T-X.Y.Z format, preserving the original numbering.
 * 
 * Updated to convert all legacy file references from relative paths to full absolute paths
 * to improve AI coding agent reliability in finding and accessing files.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

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

// Helper function to get the base project directory (parent of pmc)
function getBaseProjectDir() {
    const scriptDir = __dirname;
    // Navigate to project root (pmc) and then up one more level
    return path.resolve(scriptDir, '../../..');
}

/**
 * Ensures a path uses Windows-style backslashes
 * @param {string} filePath - The path to convert
 * @returns {string} - The path with Windows backslashes
 */
function ensureWindowsPath(filePath) {
    return filePath.replace(/\//g, '\\');
}

/**
 * Converts a relative legacy file reference to a full absolute path
 * @param {string} line - The line potentially containing a legacy file reference
 * @returns {string} The line with updated file path if applicable
 */
function convertToFullPath(line) {
    // Pattern to match single-line legacy code references for both aplio-legacy and aplio-modern-1
    const legacyRefPattern = /(Legacy Code Reference:)\s+((?:aplio-legacy|aplio-modern-1)\/[^\s:]+)(:[\d-]+)?/g;
    
    // Get the absolute base project directory
    const baseProjectDir = getBaseProjectDir();
    
    // Replace test mapping path placeholder if present
    if (line.includes('[Test Mapping Path]')) {
        const testMappingRelativePath = 'pmc/product/_mapping/test-maps/06-aplio-mod-1-task-test-mapping-E05.md';
        const testMappingPath = ensureWindowsPath(path.join(baseProjectDir, testMappingRelativePath));
        line = line.replace('[Test Mapping Path]', `\`${testMappingPath}\``);
    }
    
    // Handle bulleted reference lines that start with "- aplio-legacy/" or "- aplio-modern-1/"
    if (line.trim().startsWith('- aplio-legacy/') || line.trim().startsWith('- aplio-modern-1/')) {
        const filePath = line.trim().substring(2).split(':')[0];
        const lineRange = line.includes(':') ? ':' + line.split(':')[1] : '';
        const fullPath = ensureWindowsPath(path.join(baseProjectDir, filePath));
        return `    - \`${fullPath}\`${lineRange}`;
    }
    
    // Replace any matches with full path
    return line.replace(legacyRefPattern, (match, prefix, filePath, lineRange) => {
        // Build the full absolute path
        const fullPath = ensureWindowsPath(path.join(baseProjectDir, filePath));
        return `${prefix} \`${fullPath}\`${lineRange || ''}`;
    });
}

/**
 * Generate a task block from FR information
 * @param {string} frNumber - The FR number (X.Y.Z)
 * @param {string} description - The FR description
 * @param {string} impactWeighting - The impact weighting value
 * @param {string[]} acceptanceCriteria - The functional requirements acceptance criteria array
 * @returns {string} Formatted task block
 */
function generateTaskBlock(frNumber, description, impactWeighting, acceptanceCriteria = []) {
    // Convert FR X.Y.Z to T-X.Y.Z format (preserving the original numbers)
    const taskId = `T-${frNumber}`;
    
    // Get the base number (X.Y) from X.Y.Z for the test folder path
    const baseFolderNumber = frNumber.match(/(\d+\.\d+)\.\d+/)[1];
    
    // Build the full absolute path for test locations
    const baseProjectDir = getBaseProjectDir();
    const testRelativePath = `pmc/system/test/unit-tests/task-${baseFolderNumber.replace(/\./g, '-')}/${taskId}/`;
    const testLocation = ensureWindowsPath(path.join(baseProjectDir, testRelativePath));
    
    // Build the full absolute path for test mapping file
    const testMappingRelativePath = `pmc/product/_mapping/test-maps/06-aplio-mod-1-task-test-mapping-E05.md`;
    const testMappingPath = ensureWindowsPath(path.join(baseProjectDir, testMappingRelativePath));

    // Format criteria to preserve the indentation pattern from source document
    // Keep the 2-space indentation for main items but remove the first 4 spaces
    // This preserves the indentation hierarchy while avoiding excessive space
    const formattedCriteria = acceptanceCriteria.map(line => {
        // Convert any legacy file references to full paths
        let lineWithFullPaths = convertToFullPath(line);
        
        // Replace test mapping path placeholder with full path
        if (lineWithFullPaths.includes('[Test Mapping Path]')) {
            lineWithFullPaths = lineWithFullPaths.replace('[Test Mapping Path]', `\`${testMappingPath}\``);
        }
        
        if (lineWithFullPaths.startsWith('    ')) {
            // Add 2 spaces before each line for proper indentation hierarchy
            return '  ' + lineWithFullPaths.substring(4);
        }
        return lineWithFullPaths;
    });

    const criteriaBlock = acceptanceCriteria.length > 0 
        ? `**Functional Requirements Acceptance Criteria**:\n${formattedCriteria.join('\n')}` 
        : '**Functional Requirements Acceptance Criteria**:';

    // Determine header level - If it's an X.Y.0 FR, use ### (tier 3), otherwise use #### (tier 4)
    const headerTier = frNumber.endsWith('.0') ? '###' : '####';
    
    // Task block construction with additional newline at the end to ensure spacing between tasks
    const resultBlock = `${headerTier} ${taskId}: ${description}\n` +
                       `- **FR Reference**: FR-${frNumber}\n` +
                       `- **Impact Weighting**: ${impactWeighting || 'N/A'}\n` +
                       `- **Implementation Location**: \n` +
                       `- **Pattern**: \n` +
                       `- **Dependencies**: \n` +
                       `- **Estimated Human Work Hours**: 2-4\n` +
                       `- **Description**: ${description}\n` +
                       `- **Test Locations**: \`${testLocation}\`\n` +
                       `- **Testing Tools**: Jest, TypeScript\n` +
                       `- **Test Coverage Requirements**: 90% code coverage\n` +
                       `- **Completes Component?**: \n\n` +
                       `${criteriaBlock}\n\n`; // Added an extra newline here

    return resultBlock;
}

/**
 * Generate initial task file from functional requirements
 * @param {string} projectName - The full project name
 * @param {string} projectAbbreviation - The project abbreviation (e.g., 'aplio-mod-1')
 */
function generateInitialTasks(projectName, projectAbbreviation) {
    // Define file paths
    const frFileName = `03-${projectAbbreviation}-functional-requirements.md`;
    const taskFileName = `06-${projectAbbreviation}-tasks.md`;
    const frFilePath = resolveProjectPath(`product/${frFileName}`);
    const taskFilePath = resolveProjectPath(`product/${taskFileName}`);

    console.log(`Running from: ${process.cwd()}`);
    console.log(`Reading FR file from: ${frFilePath}`);
    console.log(`Writing Task file to: ${taskFilePath}`);
    console.log(`Base project directory: ${getBaseProjectDir()}`);

    if (!fs.existsSync(frFilePath)) {
        console.error(`Error: Functional Requirements file not found at ${frFilePath}`);
        process.exit(1);
    }

    // Read and split the FR content into lines
    const frContent = fs.readFileSync(frFilePath, 'utf-8');
    const lines = frContent.split(/\r?\n/);

    // Initialize the output content with a title
    let outputContent = `# ${projectName} - Initial Tasks (Generated ${new Date().toISOString()})\n\n`;
    
    // Initialize tracking variables
    let currentFR = null;
    let currentDescription = '';
    let currentImpactWeighting = '';
    let currentAcceptanceCriteria = [];
    let parsingCriteria = false;
    let skipSection = false;
    let inUnwantedSection = false;
    let previousLineSectionHeader = false;
    
    // Define sections to skip
    const unwantedSections = [
        '## Document Purpose',
        '## Requirement Guidelines',
        '## Document Generation Workflow',
        '## Requirement Mapping Guide',
        '## Requirement Structure Guide'
    ];

    // Process each line
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        // Check if we're entering an unwanted section
        if (unwantedSections.includes(trimmedLine)) {
            inUnwantedSection = true;
            continue;
        }
        
        // Skip processing if we're in an unwanted section
        if (inUnwantedSection) {
            // Exit unwanted section when we hit a new section header
            if (trimmedLine.startsWith('##')) {
                inUnwantedSection = false;
            } else {
                continue;
            }
        }

        // Handle section skipping logic
        if (trimmedLine.startsWith('#### User Stories: US') || 
            trimmedLine.startsWith('#### Tasks: [T-') ||
            trimmedLine.startsWith('* User Story Acceptance Criteria:')) {
            skipSection = true;
            continue;
        }
        
        // Stop skipping if we hit a new FR or section header or the start of Functional Requirements criteria
        if (skipSection) {
            if (trimmedLine.startsWith('- **FR') || 
                trimmedLine.startsWith('##') || 
                trimmedLine.startsWith('###') ||
                trimmedLine.startsWith('* Functional Requirements Acceptance Criteria:')) {
                skipSection = false;
            } else {
                continue;
            }
        }
        
        // Process section headers (## or ###)
        if (trimmedLine.startsWith('## ') || trimmedLine.startsWith('### ')) {
            // Write out any previous FR block before starting a new section
            if (currentFR) {
                outputContent += generateTaskBlock(currentFR, currentDescription, currentImpactWeighting, currentAcceptanceCriteria);
                currentFR = null;
                currentAcceptanceCriteria = [];
                parsingCriteria = false;
            }
            
            // Format section headers with appropriate spacing
            if (trimmedLine.startsWith('## ')) {
                outputContent += `\n${line}\n`;
                previousLineSectionHeader = true;
            } else {
                if (previousLineSectionHeader) {
                    outputContent += `${line}\n`;
                } else {
                    outputContent += `\n${line}\n`;
                }
                previousLineSectionHeader = false;
            }
            continue;
        } else {
            previousLineSectionHeader = false;
        }

        // Match FR line - format: "- **FR1.2.3:** Description text"
        const frMatch = trimmedLine.match(/^-\s+\*\*FR(\d+\.\d+\.\d+):\*\*\s+(.+)$/);
        if (frMatch) {
            // Write out any previous FR block before starting a new one
            if (currentFR) {
                outputContent += generateTaskBlock(currentFR, currentDescription, currentImpactWeighting, currentAcceptanceCriteria);
            }
            
            // Start tracking a new FR
            currentFR = frMatch[1];
            currentDescription = frMatch[2];
            currentImpactWeighting = '';
            currentAcceptanceCriteria = [];
            parsingCriteria = false;
            continue;
        }

        // Only process these if we are inside an FR block
        if (currentFR) {
            // Extract Impact Weighting
            const impactMatch = trimmedLine.match(/^\* Impact Weighting: (.+)$/);
            if (impactMatch) {
                currentImpactWeighting = impactMatch[1];
                continue;
            }

            // Detect start of Functional Requirements Acceptance Criteria section
            if (trimmedLine.startsWith('* Functional Requirements Acceptance Criteria:')) {
                parsingCriteria = true;
                continue;
            }

            // Process multi-line Legacy Code Reference blocks
            if (parsingCriteria && 
                trimmedLine.startsWith('Legacy Code Reference:') && 
                i + 1 < lines.length && 
                lines[i + 1].trim().startsWith('-')) {
                
                // Add the header line
                currentAcceptanceCriteria.push(line);
                i++;
                
                // Process each bullet point
                while (i < lines.length && lines[i].trim().startsWith('-')) {
                    currentAcceptanceCriteria.push(lines[i]);
                    i++;
                }
                
                i--; // Adjust index since the for loop will increment it again
                continue;
            }
            
            // Extract Acceptance Criteria items
            if (parsingCriteria) {
                // Skip blank lines within the criteria section
                if (trimmedLine === '') {
                    continue;
                }
                
                // If line is indented, it's a criteria item
                if (line.match(/^\s+/)) {
                    currentAcceptanceCriteria.push(line);
                    continue;
                } else {
                    // If not indented and not blank, it's the end of criteria
                    parsingCriteria = false;
                }
            }
        }
    }

    // Don't forget the last FR block
    if (currentFR) {
        outputContent += generateTaskBlock(currentFR, currentDescription, currentImpactWeighting, currentAcceptanceCriteria);
    }

    // Write the output file
    fs.writeFileSync(taskFilePath, outputContent, { encoding: 'utf-8' });
    console.log(`Successfully generated ${taskFilePath}`);
    console.log(`Legacy file references have been converted to absolute paths with backticks`);
}

// --- CLI Entry Point ---
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
        console.error('Usage: node <path_to_script>/06a-generate-task-initial-v4.js <"Project Name"> <project-abbreviation>');
        console.error('Examples:');
        console.error('  From project root:');
        console.error('  node product/_tools/06a-generate-task-initial-v4.js "Aplio Design System Modernization" aplio-mod-1');
        console.error('');
        console.error('  From any directory:');
        console.error('  node /path/to/pmc/product/_tools/06a-generate-task-initial-v4.js "Aplio Design System Modernization" aplio-mod-1');
        process.exit(1);
    }

    const [projectName, projectAbbreviation] = args;
    generateInitialTasks(projectName, projectAbbreviation);
}

// Export for potential testing or module use
module.exports = { 
    generateInitialTasks, 
    generateTaskBlock,
    convertToFullPath,
    getBaseProjectDir
}; 