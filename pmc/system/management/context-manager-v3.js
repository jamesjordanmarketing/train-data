/*
 * context-manager-v3.js - Lean context management for the Project Memory Core system
 * 
 * COMMANDS SUPPORTED:
 * ------------------
 * 1. updatePhaseStage(taskId, phase, status) - Updates the phase status in progress-phase.md
 *    CLI: node bin/aplio-agent-cli.js update-phase-stage <taskId> <phase> <status>
 * 2. testPromptBuild() - Generate customized test prompts for current active task
 *    CLI: node bin/aplio-agent-cli.js test-prompt-build
 * 3. updateTestApproach(confidence) - Updates test approach in active-task-unit-tests-2.md using current-test-approach.md
 *    CLI: node bin/aplio-agent-cli.js test-approach [confidence]
 */

// ES Module imports
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Get current file and directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine project root reliably
function determineProjectRoot() {
  const rawPath = path.resolve(__dirname, '../../');
  const pathParts = rawPath.split(path.sep);
  
  // Check if the path already ends with pmc
  if (pathParts[pathParts.length - 1] === 'pmc') {
    return rawPath;
  }
  
  // Check for duplicated pattern
  const lastTwoSegments = pathParts.slice(-2);
  if (lastTwoSegments.length === 2 && 
      lastTwoSegments[0] === 'pmc' && 
      lastTwoSegments[1] === 'pmc') {
    return pathParts.slice(0, -1).join(path.sep);
  }
  
  return rawPath;
}

const PROJECT_ROOT = determineProjectRoot();
console.log(`Using PROJECT_ROOT in context-manager-v3: ${PROJECT_ROOT}`);

// File paths
const PATHS = {
  progressPhaseFile: path.join(PROJECT_ROOT, 'core', 'progress-phase.md'),
  activeTaskFile: path.join(PROJECT_ROOT, 'core', 'active-task.md'),
  testProtocolFile: path.join(PROJECT_ROOT, 'core', 'active-task-unit-tests-2.md'),
  templateFile: path.join(PROJECT_ROOT, 'system', 'templates', 'active-task-test-prompts-template.md'),
  codingPromptsDir: path.join(PROJECT_ROOT, 'system', 'coding-prompts'),
  currentTestApproachFile: path.join(PROJECT_ROOT, 'system', 'plans', 'task-approach', 'current-test-approach.md'),
  testApproachHistoryDir: path.join(PROJECT_ROOT, 'system', 'plans', 'task-approach', 'approach-history')
};

// =============================================================================
// DATA EXTRACTION FUNCTIONS
// =============================================================================

/**
 * Extract task ID from active-task.md
 * USAGE: Call this function to get the task ID for {{TASK_ID}} variable
 * WHEN: Use during test-prompt-build command execution
 * INPUT: activeTaskContent (string) - full content of active-task.md
 * OUTPUT: String containing task ID (e.g., "T-1.1.5")
 * EXAMPLE USAGE: const taskId = extractTaskId(activeTaskContent);
 */
function extractTaskId(activeTaskContent) {
    const taskIdMatch = activeTaskContent.match(/Task ID:\s*([^\n]+)/);
    return taskIdMatch ? taskIdMatch[1].trim() : 'Task ID not found';
}

/**
 * Extract task title from active-task.md
 * USAGE: Call this function to get the task title for {{TASK_TITLE}} variable
 * WHEN: Use during test-prompt-build command execution
 * INPUT: activeTaskContent (string) - full content of active-task.md
 * OUTPUT: String containing task title
 * EXAMPLE USAGE: const title = extractTaskTitle(activeTaskContent);
 */
function extractTaskTitle(activeTaskContent) {
    const titleMatch = activeTaskContent.match(/Task Title:\s*([^\n]+)/);
    return titleMatch ? titleMatch[1].trim() : 'Task title not found';
}

/**
 * Extract task description from active-task.md
 * USAGE: Call this function to get the task description for {{TASK_DESCRIPTION}} variable
 * WHEN: Use during test-prompt-build command execution
 * INPUT: activeTaskContent (string) - full content of active-task.md
 * OUTPUT: String containing task description
 * EXAMPLE USAGE: const description = extractTaskDescription(activeTaskContent);
 */
function extractTaskDescription(activeTaskContent) {
    const descriptionMatch = activeTaskContent.match(/- Description:\s*([^\n]+)/);
    return descriptionMatch ? descriptionMatch[1].trim() : 'Task description not found';
}

/**
 * Extract task pattern from active-task.md
 * USAGE: Call this function to get the task pattern for {{TASK_PATTERN}} variable
 * WHEN: Use during test-prompt-build command execution
 * INPUT: activeTaskContent (string) - full content of active-task.md
 * OUTPUT: String containing task pattern (e.g., "P013-LAYOUT-COMPONENT")
 * EXAMPLE USAGE: const pattern = extractTaskPattern(activeTaskContent);
 */
function extractTaskPattern(activeTaskContent) {
    const patternMatch = activeTaskContent.match(/- Patterns:\s*([^\n]+)/);
    return patternMatch ? patternMatch[1].trim() : 'Pattern not specified';
}

/**
 * Extract implementation location from active-task.md
 * USAGE: Call this function to get the implementation location for {{IMPLEMENTATION_LOCATION}} variable
 * WHEN: Use during test-prompt-build command execution
 * INPUT: activeTaskContent (string) - full content of active-task.md
 * OUTPUT: String containing implementation path
 * EXAMPLE USAGE: const location = extractImplementationLocation(activeTaskContent);
 */
function extractImplementationLocation(activeTaskContent) {
    const locationMatch = activeTaskContent.match(/- Implementation Location:\s*`([^`]+)`/);
    return locationMatch ? locationMatch[1].trim() : 'Implementation location not specified';
}

/**
 * Extract testing tools from active-task.md
 * USAGE: Call this function to get the testing tools for {{TESTING_TOOLS}} variable
 * WHEN: Use during test-prompt-build command execution
 * INPUT: activeTaskContent (string) - full content of active-task.md
 * OUTPUT: String containing testing tools list
 * EXAMPLE USAGE: const tools = extractTestingTools(activeTaskContent);
 */
function extractTestingTools(activeTaskContent) {
    const toolsMatch = activeTaskContent.match(/- Testing Tools:\s*([^\n]+)/);
    return toolsMatch ? toolsMatch[1].trim() : 'Testing tools not specified';
}

/**
 * Extract test locations from active-task.md
 * USAGE: Call this function to get the test locations for {{TEST_LOCATIONS}} variable
 * WHEN: Use during test-prompt-build command execution
 * INPUT: activeTaskContent (string) - full content of active-task.md
 * OUTPUT: String containing test directory path
 * EXAMPLE USAGE: const locations = extractTestLocations(activeTaskContent);
 */
function extractTestLocations(activeTaskContent) {
    const locationsMatch = activeTaskContent.match(/- Test Locations:\s*`([^`]+)`/);
    return locationsMatch ? locationsMatch[1].trim() : 'Test locations not specified';
}

/**
 * Extract test coverage requirement from active-task.md
 * USAGE: Call this function to get the coverage requirement for {{COVERAGE_REQUIREMENT}} variable
 * WHEN: Use during test-prompt-build command execution
 * INPUT: activeTaskContent (string) - full content of active-task.md
 * OUTPUT: String containing coverage percentage
 * EXAMPLE USAGE: const coverage = extractCoverageRequirement(activeTaskContent);
 */
function extractCoverageRequirement(activeTaskContent) {
    const coverageMatch = activeTaskContent.match(/- Test Coverage Requirements:\s*([^\n]+)/);
    return coverageMatch ? coverageMatch[1].trim() : '90% code coverage';
}

/**
 * Extract task dependencies from active-task.md
 * USAGE: Call this function to get the task dependencies for {{TASK_DEPENDENCIES}} variable
 * WHEN: Use during test-prompt-build command execution
 * INPUT: activeTaskContent (string) - full content of active-task.md
 * OUTPUT: String containing task dependencies
 * EXAMPLE USAGE: const dependencies = extractTaskDependencies(activeTaskContent);
 */
function extractTaskDependencies(activeTaskContent) {
    const dependenciesMatch = activeTaskContent.match(/- Dependencies:\s*([^\n]+)/);
    return dependenciesMatch ? dependenciesMatch[1].trim() : 'No dependencies specified';
}

/**
 * Extract acceptance criteria list with formatting
 * USAGE: Call this function to get formatted acceptance criteria for {{ACCEPTANCE_CRITERIA_LIST}} variable
 * WHEN: Use during test-prompt-build command execution to populate validation prompts
 * INPUT: activeTaskContent (string) - full content of active-task.md
 * OUTPUT: Formatted string with numbered acceptance criteria list
 * EXAMPLE USAGE: const criteria = extractAcceptanceCriteria(activeTaskContent);
 */
function extractAcceptanceCriteria(activeTaskContent) {
    const criteriaSection = activeTaskContent.match(/## Acceptance Criteria\n(.*?)(?=\n##|\n\n|$)/s);
    if (!criteriaSection) return 'No acceptance criteria found';
    
    const criteria = criteriaSection[1].split('\n').filter(line => line.trim().startsWith('-'));
    return criteria.map((criterion, index) => `${index + 1}. ${criterion.trim().substring(1).trim()}`).join('\n');
}

/**
 * Extract validation steps from active-task.md
 * USAGE: Call this function to get the validation steps for {{VALIDATION_STEPS_LIST}} variable
 * WHEN: Use during test-prompt-build command execution
 * INPUT: activeTaskContent (string) - full content of active-task.md
 * OUTPUT: Formatted string with validation steps
 * EXAMPLE USAGE: const steps = extractValidationSteps(activeTaskContent);
 */
function extractValidationSteps(activeTaskContent) {
    const valSection = activeTaskContent.match(/### Validation Phase[\s\S]*?(?=###|##|$)/);
    if (!valSection) return 'No validation steps found';
    
    const valSteps = valSection[0].match(/\[VAL-\d+\][^[]+/g);
    if (!valSteps) return 'No VAL steps found';
    
    return valSteps.map((step, index) => `${index + 1}. ${step.trim()}`).join('\n');
}

/**
 * Extract element count and preview list
 * USAGE: Call this function to get element count and preview for {{ELEMENT_COUNT}} and {{ELEMENT_LIST_PREVIEW}} variables
 * WHEN: Use during test-prompt-build command execution to provide element context
 * INPUT: activeTaskContent (string) - full content of active-task.md
 * OUTPUT: Object with count (number) and preview (string) properties
 * EXAMPLE USAGE: const elementInfo = extractElementInfo(activeTaskContent);
 */
function extractElementInfo(activeTaskContent) {
    const elementsSection = activeTaskContent.match(/## Components\/Elements\n(.*?)(?=\n##|\n\n|$)/s);
    if (!elementsSection) return { count: 0, preview: 'No elements found' };
    
    const elements = elementsSection[1].split('\n').filter(line => line.includes('ELE-'));
    const count = elements.length;
    const preview = elements.slice(0, 3).map(el => {
        const match = el.match(/\[.*?\]\s*(.*?):/);
        return match ? match[1].trim() : el.trim();
    }).join(', ');
    
    return { count, preview: preview || 'Elements found but titles unclear' };
}

/**
 * Extract legacy references from active-task.md
 * USAGE: Call this function to get legacy references for {{LEGACY_REFERENCES}} variable
 * WHEN: Use during test-prompt-build command execution
 * INPUT: activeTaskContent (string) - full content of active-task.md
 * OUTPUT: String containing legacy code references
 * EXAMPLE USAGE: const legacyRefs = extractLegacyReferences(activeTaskContent);
 */
function extractLegacyReferences(activeTaskContent) {
    const legacyMatches = activeTaskContent.match(/Legacy Code Reference: `([^`]+)`/g);
    if (!legacyMatches) return 'No legacy references found';
    
    return legacyMatches.map(match => match.replace('Legacy Code Reference: `', '').replace('`', '')).join(', ');
}

/**
 * Extract visual-specific legacy references
 * USAGE: Call this function to get visual legacy references for {{LEGACY_VISUAL_REFERENCES}} variable
 * WHEN: Use during test-prompt-build command execution
 * INPUT: activeTaskContent (string) - full content of active-task.md
 * OUTPUT: String containing visual legacy references
 * EXAMPLE USAGE: const visualRefs = extractLegacyVisualReferences(activeTaskContent);
 */
function extractLegacyVisualReferences(activeTaskContent) {
    const legacyRefs = extractLegacyReferences(activeTaskContent);
    if (legacyRefs === 'No legacy references found') return legacyRefs;
    
    // Filter for visual-related references
    const visualKeywords = ['layout', 'page', 'component', 'style', 'css', 'design'];
    const refs = legacyRefs.split(', ');
    const visualRefs = refs.filter(ref => 
        visualKeywords.some(keyword => ref.toLowerCase().includes(keyword))
    );
    
    return visualRefs.length > 0 ? visualRefs.join(', ') : 'No visual legacy references found';
}

/**
 * Determine if task has UI components
 * USAGE: Call this function to get boolean indicator for {{HAS_UI_COMPONENTS}} variable
 * WHEN: Use during test-prompt-build command execution
 * INPUT: activeTaskContent (string) - full content of active-task.md
 * OUTPUT: String 'Yes' or 'No' indicating if UI components are present
 * EXAMPLE USAGE: const hasUI = determineHasUIComponents(activeTaskContent);
 */
function determineHasUIComponents(activeTaskContent) {
    const uiKeywords = ['component', 'layout', 'page', 'ui', 'visual', 'design', 'render'];
    const content = activeTaskContent.toLowerCase();
    return uiKeywords.some(keyword => content.includes(keyword)) ? 'Yes' : 'No';
}

/**
 * Extract component types from task description
 * USAGE: Call this function to get component types for {{COMPONENT_TYPES}} variable
 * WHEN: Use during test-prompt-build command execution
 * INPUT: activeTaskContent (string) - full content of active-task.md
 * OUTPUT: String describing component types
 * EXAMPLE USAGE: const types = extractComponentTypes(activeTaskContent);
 */
function extractComponentTypes(activeTaskContent) {
    const content = activeTaskContent.toLowerCase();
    const types = [];
    
    if (content.includes('server component')) types.push('Server Component');
    if (content.includes('client component')) types.push('Client Component');
    if (content.includes('layout')) types.push('Layout Component');
    if (content.includes('page')) types.push('Page Component');
    
    return types.length > 0 ? types.join(', ') : 'Component types not specified';
}

/**
 * Extract visual keywords from task content
 * USAGE: Call this function to get visual keywords for {{VISUAL_KEYWORDS}} variable
 * WHEN: Use during test-prompt-build command execution
 * INPUT: activeTaskContent (string) - full content of active-task.md
 * OUTPUT: String containing visual-related keywords found
 * EXAMPLE USAGE: const keywords = extractVisualKeywords(activeTaskContent);
 */
function extractVisualKeywords(activeTaskContent) {
    const visualKeywords = ['layout', 'responsive', 'design', 'visual', 'style', 'css', 'ui', 'component', 'render'];
    const content = activeTaskContent.toLowerCase();
    const foundKeywords = visualKeywords.filter(keyword => content.includes(keyword));
    
    return foundKeywords.length > 0 ? foundKeywords.join(', ') : 'No visual keywords detected';
}

// =============================================================================
// COMMAND FUNCTIONS
// =============================================================================

/**
 * Generate individual customized prompt file from template
 * USAGE: Call this function to create each of the 4 prompt files
 * WHEN: Called by testPromptBuild for each prompt type
 * INPUT: template (string), variables (object), filename (string), promptSection (string)
 * OUTPUT: Creates individual prompt file in system/coding-prompts/
 * EXAMPLE USAGE: generateCustomizedPrompt(template, vars, '03A-test-prompt-elements.md', 'PROMPT 1');
 */
function generateCustomizedPrompt(template, variables, filename, promptSection) {
    // Extract specific prompt section from template
    const sectionRegex = new RegExp(`## ${promptSection}:.*?(?=## PROMPT [2-4]:|$)`, 's');
    let promptContent = template.match(sectionRegex);
    
    if (!promptContent) {
        throw new Error(`Could not find ${promptSection} in template`);
    }
    
    promptContent = promptContent[0];
    
    // Replace all variables in the prompt content
    Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        promptContent = promptContent.replace(regex, value);
    });
    
    // Write to specific prompt file
    const outputPath = path.join(PATHS.codingPromptsDir, filename);
    fs.writeFileSync(outputPath, promptContent);
}

/**
 * Generate customized test prompts based on active task data
 * USAGE: This is the main command function called when user runs test-prompt-build
 * WHEN: Execute this when user needs task-specific test prompts
 * COMMAND: node bin/aplio-agent-cli.js test-prompt-build
 * OUTPUT: Creates 4 customized prompt files in system/coding-prompts/
 * ERROR HANDLING: Logs errors and creates fallback content if extraction fails
 */
async function testPromptBuild() {
    try {
        console.log('🔍 Generating customized test prompts for active task...');
        
        // Verify required files exist
        if (!fs.existsSync(PATHS.activeTaskFile)) {
            throw new Error(`Active task file not found: ${PATHS.activeTaskFile}`);
        }
        
        if (!fs.existsSync(PATHS.templateFile)) {
            throw new Error(`Template file not found: ${PATHS.templateFile}`);
        }
        
        // Create coding-prompts directory if it doesn't exist
        if (!fs.existsSync(PATHS.codingPromptsDir)) {
            fs.mkdirSync(PATHS.codingPromptsDir, { recursive: true });
        }
        
        // Extract data from core files
        const activeTaskContent = fs.readFileSync(PATHS.activeTaskFile, 'utf8');
        const testProtocolContent = fs.readFileSync(PATHS.testProtocolFile, 'utf8');
        
        // Extract element information
        const elementInfo = extractElementInfo(activeTaskContent);
        
        // Extract all template variables
        const variables = {
            TASK_ID: extractTaskId(activeTaskContent),
            TASK_TITLE: extractTaskTitle(activeTaskContent),
            TASK_DESCRIPTION: extractTaskDescription(activeTaskContent),
            TASK_PATTERN: extractTaskPattern(activeTaskContent),
            IMPLEMENTATION_LOCATION: extractImplementationLocation(activeTaskContent),
            TESTING_TOOLS: extractTestingTools(activeTaskContent),
            TEST_LOCATIONS: extractTestLocations(activeTaskContent),
            COVERAGE_REQUIREMENT: extractCoverageRequirement(activeTaskContent),
            TASK_DEPENDENCIES: extractTaskDependencies(activeTaskContent),
            ACCEPTANCE_CRITERIA_LIST: extractAcceptanceCriteria(activeTaskContent),
            VALIDATION_STEPS_LIST: extractValidationSteps(activeTaskContent),
            CRITERIA_COUNT: extractAcceptanceCriteria(activeTaskContent).split('\n').length,
            VALIDATION_COUNT: extractValidationSteps(activeTaskContent).split('\n').length,
            ELEMENT_COUNT: elementInfo.count,
            ELEMENT_LIST_PREVIEW: elementInfo.preview,
            HAS_UI_COMPONENTS: determineHasUIComponents(activeTaskContent),
            COMPONENT_TYPES: extractComponentTypes(activeTaskContent),
            LEGACY_REFERENCES: extractLegacyReferences(activeTaskContent),
            LEGACY_VISUAL_REFERENCES: extractLegacyVisualReferences(activeTaskContent),
            VISUAL_KEYWORDS: extractVisualKeywords(activeTaskContent)
        };
        
        console.log(`📊 Extracted data for task: ${variables.TASK_ID}`);
        console.log(`📝 Elements to analyze: ${variables.ELEMENT_COUNT}`);
        console.log(`🔧 Testing tools: ${variables.TESTING_TOOLS}`);
        
        // Load template and generate prompts
        const template = fs.readFileSync(PATHS.templateFile, 'utf8');
        
        // Generate 4 customized prompt files
        generateCustomizedPrompt(template, variables, '03A-test-prompt-elements.md', 'PROMPT 1');
        generateCustomizedPrompt(template, variables, '03B-test-prompt-infrastructure.md', 'PROMPT 2');
        generateCustomizedPrompt(template, variables, '03C-test-prompt-validations.md', 'PROMPT 3');
        generateCustomizedPrompt(template, variables, '03D-test-prompt-visual.md', 'PROMPT 4');
        
        console.log('✅ Test prompts customized and generated successfully');
        console.log('📁 Generated files:');
        console.log('   - system/coding-prompts/03A-test-prompt-elements.md');
        console.log('   - system/coding-prompts/03B-test-prompt-infrastructure.md');
        console.log('   - system/coding-prompts/03C-test-prompt-validations.md');
        console.log('   - system/coding-prompts/03D-test-prompt-visual.md');
        console.log('📝 Use these customized prompts with LLM to generate task-specific test analysis');
        console.log('🔄 Next step: Use prompts to populate current-test-approach.md, then run test-approach command');
        
        return {
            success: true,
            message: 'Test prompts generated successfully',
            generatedFiles: [
                '03A-test-prompt-elements.md',
                '03B-test-prompt-infrastructure.md', 
                '03C-test-prompt-validations.md',
                '03D-test-prompt-visual.md'
            ]
        };
        
    } catch (error) {
        console.error('❌ Error generating test prompts:', error.message);
        return {
            success: false,
            message: `Error generating test prompts: ${error.message}`
        };
    }
}

// =============================================================================
// TEST APPROACH UTILITY FUNCTIONS
// =============================================================================

/**
 * Format timestamp in a human-readable format
 * USAGE: Call this function to create timestamps for test approach entries
 * WHEN: Use during test-approach command execution for dating entries
 * OUTPUT: String in format "MM/DD/YYYY, HH:MM:SS AM/PM"
 * EXAMPLE USAGE: const timestamp = formatTimestamp();
 */
function formatTimestamp(date = new Date()) {
  const options = {
    timeZone: 'America/Los_Angeles',
    hour12: true,
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  
  return date.toLocaleString('en-US', options);
}

/**
 * Generates a timestamp for file naming (without seconds)
 * USAGE: Call this function to create timestamps for archive filenames
 * WHEN: Use during test-approach archiving to create unique history files
 * OUTPUT: String in format "MM-DD-YY-HHmmAM/PM"
 * EXAMPLE USAGE: const fileTimestamp = generateFileTimestamp();
 */
function generateFileTimestamp() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  const hours = now.getHours() % 12 || 12; // 12-hour format
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const period = now.getHours() >= 12 ? 'pm' : 'am';
  
  return `${month}-${day}-${year}-${hours}${minutes}${period}`;
}

/**
 * Extracts confidence level from test approach document
 * USAGE: Call this function to get confidence level from current-test-approach.md
 * WHEN: Use during test-approach command to extract confidence rating
 * INPUT: content (string) - content of current-test-approach.md
 * OUTPUT: number (1-10) or null if not found
 * EXAMPLE USAGE: const confidence = extractTestConfidenceLevel(content);
 */
function extractTestConfidenceLevel(content) {
  const confidenceMatch = content.match(/## Confidence Level\s*\nConfidence:\s*(\d+)/);
  if (!confidenceMatch) {
    return null;
  }
  const confidence = parseInt(confidenceMatch[1], 10);
  return confidence >= 1 && confidence <= 10 ? confidence : null;
}

/**
 * Removes instruction sections from test approach document
 * USAGE: Call this function to clean up current-test-approach.md content
 * WHEN: Use during test-approach command to remove instruction headers
 * INPUT: content (string) - full content of test approach document
 * OUTPUT: String with instruction sections removed
 * EXAMPLE USAGE: const clean = removeTestInstructionsSection(content);
 */
function removeTestInstructionsSection(content) {
  // Look for the pattern starting with "====" line and ending with "===" line
  const instructionRegex = /={3,}[\s\S]*?={3,}.*(\n|$)/g;
  
  // Remove the instruction section
  const cleanedContent = content.replace(instructionRegex, '');
  
  // Additional cleanup: remove any trailing empty lines that might remain
  return cleanedContent.trim();
}

/**
 * Extracts a section from test approach markdown content
 * USAGE: Call this function to extract specific sections from current-test-approach.md
 * WHEN: Use during test-approach command to get Overview, Strategy, Considerations sections
 * INPUT: content (string), sectionName (string) - name of section to extract
 * OUTPUT: String containing section content or null if not found
 * EXAMPLE USAGE: const overview = extractTestApproachSection(content, 'Overview');
 */
function extractTestApproachSection(content, sectionName) {
  const sectionMatch = content.match(new RegExp(`## ${sectionName}\\s*\\n([\\s\\S]*?)(?=\\n##|$)`));
  return sectionMatch ? sectionMatch[1].trim() : null;
}

/**
 * Finds a section in active-task-unit-tests-2.md content dynamically
 * USAGE: Call this function to locate sections in the test file for replacement
 * WHEN: Use during test-approach command to find the Test Approach section
 * INPUT: testContent (string), sectionTitle (string) - section to find
 * OUTPUT: Object with found status, start/end indices, and content
 * EXAMPLE USAGE: const section = findTestSection(content, 'Test Approach');
 * NOTE: This function dynamically locates sections regardless of line position
 */
function findTestSection(testContent, sectionTitle) {
  // Create regex patterns to match both ## and ### section headers dynamically
  const subSectionRegex = new RegExp(`### ${sectionTitle}\\s*\\n([\\s\\S]*?)(?=\\n### |\\n## |$)`, 'i');
  let match = testContent.match(subSectionRegex);
  
  if (!match) {
    // If not found, try to match a ## section header
    const mainSectionRegex = new RegExp(`## ${sectionTitle}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
    match = testContent.match(mainSectionRegex);
  }
  
  if (!match) {
    return {
      found: false,
      startIndex: -1,
      endIndex: -1,
      content: ''
    };
  }
  
  const startIndex = match.index;
  const endIndex = startIndex + match[0].length;
  
  return {
    found: true,
    startIndex,
    endIndex,
    content: match[1].trim()
  };
}

// =============================================================================
// MAIN COMMAND FUNCTIONS
// =============================================================================

/**
 * Updates the status of a specific phase for a given task in the progress-phase.md file
 * @param {string} taskId - The task ID (e.g., T-1.3.3)
 * @param {string} phaseAbbr - The phase abbreviation (PREP, IMP, or VAL)
 * @param {string} status - The new status (not started, active, or complete)
 * @returns {Promise<object>} - Result object with success status and message
 */
async function updatePhaseStage(taskId, phaseAbbr, status) {
  // Validate parameters
  if (!taskId || !phaseAbbr || !status) {
    return {
      success: false,
      message: 'Missing required parameters: taskId, phaseAbbr, or status'
    };
  }
  
  // Validate phase abbreviation
  const phaseMap = {
    'PREP': 'Preparation Phase',
    'IMP': 'Implementation Phase',
    'VAL': 'Validation Phase'
  };
  
  if (!phaseMap[phaseAbbr]) {
    return {
      success: false,
      message: `Invalid phase abbreviation: ${phaseAbbr}. Must be one of: PREP, IMP, or VAL`
    };
  }
  
  // Validate status
  const statusMap = {
    'not started': '[ ]',
    'active': '[-]',
    'complete': '[x]'
  };
  
  if (!statusMap[status.toLowerCase()]) {
    return {
      success: false,
      message: `Invalid status: ${status}. Must be one of: not started, active, or complete`
    };
  }
  
  // Read progress-phase.md file
  try {
    if (!fs.existsSync(PATHS.progressPhaseFile)) {
      return {
        success: false,
        message: `Progress phase file not found at: ${PATHS.progressPhaseFile}`
      };
    }
    
    const fileContent = fs.readFileSync(PATHS.progressPhaseFile, 'utf8');
    const lines = fileContent.split('\n');
    
    // Find the task in the file
    const taskLineIndex = lines.findIndex(line => line.includes(`- ${statusMap['not started']} ${taskId}:`) || 
                                                  line.includes(`- ${statusMap['active']} ${taskId}:`) || 
                                                  line.includes(`- ${statusMap['complete']} ${taskId}:`));
    
    if (taskLineIndex === -1) {
      return {
        success: false,
        message: `Task with ID ${taskId} not found in the progress-phase.md file`
      };
    }
    
    // Find the phase line for the given task
    const phaseName = phaseMap[phaseAbbr];
    const phaseLinePattern = new RegExp(`\\s*- \\[.?\\] ${phaseName}`);
    
    // Search for the phase line within 5 lines after the task line
    let phaseLineIndex = -1;
    const searchLimit = Math.min(taskLineIndex + 6, lines.length);
    
    for (let i = taskLineIndex + 1; i < searchLimit; i++) {
      if (phaseLinePattern.test(lines[i])) {
        phaseLineIndex = i;
        break;
      }
    }
    
    if (phaseLineIndex === -1) {
      return {
        success: false,
        message: `${phaseName} not found for task ${taskId}`
      };
    }
    
    // Update the phase line with the new status
    const currentLine = lines[phaseLineIndex];
    const updatedLine = currentLine.replace(/\[.\]/, statusMap[status.toLowerCase()]);
    
    if (currentLine === updatedLine) {
      return {
        success: true,
        message: `Phase ${phaseName} for task ${taskId} already has status: ${status}`
      };
    }
    
    lines[phaseLineIndex] = updatedLine;
    
    // Write the updated content back to the file
    fs.writeFileSync(PATHS.progressPhaseFile, lines.join('\n'), 'utf8');
    
    return {
      success: true,
      message: `Updated ${phaseName} for task ${taskId} to status: ${status}`
    };
  } catch (error) {
    console.error('Error updating phase status:', error);
    return {
      success: false,
      message: `Error updating phase status: ${error.message}`
    };
  }
}

/**
 * Updates the test approach in both active-task-unit-tests-2.md and active-task-unit-tests-2-enhanced.md files
 * USAGE: Call this function to update the test approach section with entire content from current-test-approach.md
 * WHEN: Execute this when test-approach command is called from CLI
 * INPUT: confidence (number, optional) - confidence level 1-10 for this approach
 * OUTPUT: Promise resolving to {success: boolean, message: string}
 * EXAMPLE USAGE: const result = await updateTestApproach(8);
 */
async function updateTestApproach(confidence) {
  try {
    console.log(`Executing updateTestApproach with PROJECT_ROOT: ${PROJECT_ROOT}`);
    
    // Read the current test approach file
    const currentTestApproachPath = PATHS.currentTestApproachFile;
    console.log(`Current test approach file path: ${currentTestApproachPath}`);
    
    // Check if the file exists before reading
    if (!fs.existsSync(currentTestApproachPath)) {
      console.error(`File not found: ${currentTestApproachPath}`);
      return {
        success: false,
        message: `Current test approach file not found: ${currentTestApproachPath}`
      };
    }
    
    let currentTestApproach = await fs.promises.readFile(currentTestApproachPath, 'utf8');
    
    // Extract confidence level from the test approach file if specified
    const approachConfidence = extractTestConfidenceLevel(currentTestApproach);
    
    // Use the confidence from the approach file if available, otherwise use the provided confidence
    const finalConfidence = approachConfidence || confidence;
    
    // Only validate confidence if it's being used (either from file or parameter)
    if (finalConfidence !== undefined && finalConfidence !== null) {
      if (!Number.isInteger(finalConfidence) || finalConfidence < 1 || finalConfidence > 10) {
        return {
          success: false,
          message: 'Confidence must be an integer between 1 and 10'
        };
      }
    }
    
    // Remove the instruction section if present
    currentTestApproach = removeTestInstructionsSection(currentTestApproach);
    
    // Try to extract taskId if available (for archiving purposes), but don't require it
    let taskId = "current-test";
    try {
      // Read active task file to try to get task ID
      const activeTaskContent = await fs.promises.readFile(PATHS.activeTaskFile, 'utf8');
      const taskInfoMatch = activeTaskContent.match(/## Task Information[\s\S]*?Task ID:\s*([^\n]+)/);
      if (taskInfoMatch && taskInfoMatch[1]) {
        taskId = taskInfoMatch[1].trim();
        console.log(`Extracted task ID from active-task.md: ${taskId}`);
      }
    } catch (readError) {
      console.log("Could not read active-task.md to extract task ID, using generic name");
    }
    
    // Archive current test approach - ensure directory exists
    const historyDir = PATHS.testApproachHistoryDir;
    if (!fs.existsSync(historyDir)) {
      console.log(`Creating test approach history directory: ${historyDir}`);
      await fs.promises.mkdir(historyDir, { recursive: true });
    }
    
    // Generate a timestamp for the filename
    const fileTimestamp = generateFileTimestamp();
    const historyPath = path.join(historyDir, `test-approach-${taskId}-${fileTimestamp}.md`);
    await fs.promises.writeFile(historyPath, currentTestApproach);
    console.log(`Archived test approach to: ${historyPath}`);
    
    // Format the entire test approach content with proper heading hierarchy
    const confidenceStr = finalConfidence ? `, Confidence: ${finalConfidence}/10` : '';
    
    // Find the Overview section and extract content from there onwards
    const overviewMatch = currentTestApproach.match(/## Overview[\s\S]*/);
    let adjustedContent = '';
    
    if (overviewMatch) {
      // Start from Overview section onwards
      let contentFromOverview = overviewMatch[0];
      
      // Process content line by line to ensure correct hierarchy
      let lines = contentFromOverview.split('\n');
      let processedLines = [];
      
      for (let line of lines) {
        // Main sections: Overview, Testing Strategy, Key Considerations should be H3
        if (line.match(/^## (Overview|Testing Strategy|Key Considerations)(\s|$)/)) {
          processedLines.push(line.replace(/^##/, '###'));
        }
        // Numbered subsections should be H4
        else if (line.match(/^### \d+\./)) {
          processedLines.push(line.replace(/^###/, '####'));
        }
        // Other H3 subsections should be H4
        else if (line.match(/^### /)) {
          processedLines.push(line.replace(/^###/, '####'));
        }
        // Any remaining H2 should be H3
        else if (line.match(/^## /)) {
          processedLines.push(line.replace(/^##/, '###'));
        }
        // Keep everything else as is
        else {
          processedLines.push(line);
        }
      }
      
      adjustedContent = processedLines.join('\n').trim();
    } else {
      // Fallback: if no Overview section found, use original logic but warn
      console.log('Warning: No "## Overview" section found, using full content with adjusted headings');
      adjustedContent = currentTestApproach
        .replace(/^# /gm, '### ')           // H1 -> H3
        .replace(/^## /gm, '### ')          // H2 -> H3 (main sections)
        .replace(/^### (\d+\.)/gm, '#### $1') // Numbered subsections -> H4
        .replace(/^### (?!\d+\.)/gm, '#### ') // Other H3 -> H4 (avoid double replacement)
        .replace(/^#### /gm, '##### ')      // H4 -> H5
        .replace(/^##### /gm, '###### ')    // H5 -> H6
        .trim();
      
      // Remove redundant title sections if they exist
      adjustedContent = adjustedContent.replace(/^### Testing Approach for[^\n]*\n*/, '');
      adjustedContent = adjustedContent.replace(/^### Task ID:[^\n]*\n*/, '');
    }
    
    const newTestApproach = `## Current Test Approach (${formatTimestamp()}${confidenceStr})

${adjustedContent}

`;
    
    // Define both target files
    const targetFiles = [
      {
        path: PATHS.testProtocolFile,
        name: 'active-task-unit-tests-2.md'
      },
      {
        path: path.join(PROJECT_ROOT, 'core', 'active-task-unit-tests-2-enhanced.md'),
        name: 'active-task-unit-tests-2-enhanced.md'
      }
    ];
    
    let updatedFiles = [];
    let notFoundFiles = [];
    
    // Process each target file
    for (const targetFile of targetFiles) {
      try {
        if (!fs.existsSync(targetFile.path)) {
          console.log(`Target file not found: ${targetFile.name}`);
          notFoundFiles.push(targetFile.name);
          continue;
        }
        
        const fileContent = await fs.promises.readFile(targetFile.path, 'utf8');
        
                 // Check if Test Approach section exists
         if (!fileContent.includes('## Test Approach')) {
           console.log(`"## Test Approach" section not found in: ${targetFile.name}`);
           notFoundFiles.push(targetFile.name);
           continue;
         }
         
         // Replace the Test Approach section
         const updatedContent = fileContent.replace(
           /## Test Approach[\s\S]*?(?=\n##|$)/,
           `${newTestApproach}`
         );
        
        // Write updated content back to file
        await fs.promises.writeFile(targetFile.path, updatedContent);
        updatedFiles.push(targetFile.name);
        console.log(`Successfully updated Test Approach section in: ${targetFile.name}`);
        
      } catch (fileError) {
        console.error(`Error processing ${targetFile.name}:`, fileError.message);
        notFoundFiles.push(`${targetFile.name} (error: ${fileError.message})`);
      }
    }
    
    // Prepare result message
    let messages = [];
    if (updatedFiles.length > 0) {
      messages.push(`Successfully updated: ${updatedFiles.join(', ')}`);
    }
    if (notFoundFiles.length > 0) {
      messages.push(`Not found/updated: ${notFoundFiles.join(', ')}`);
    }
    
    const successCount = updatedFiles.length;
    const isSuccess = successCount > 0;
    
    return {
      success: isSuccess,
      message: `Test approach update completed. ${messages.join('. ')}${taskId !== "current-test" ? ` for ${taskId}` : ''}${finalConfidence ? ` with confidence level ${finalConfidence}` : ''}`
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// Export functions
export default {
  updatePhaseStage,
  testPromptBuild
};

// Export the new test-approach function
export { updateTestApproach };

