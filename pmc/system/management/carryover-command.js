#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get PMC root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PMC_ROOT = path.resolve(__dirname, '../..');

// Constants - all paths relative to pmc
const PATHS = {
    TEMPLATES_DIR: path.join('system', 'templates'),
    CONTEXT_CARRIES_DIR: path.join('system', 'plans', 'context-carries'),
    CONTEXT_HISTORY_DIR: path.join('system', 'plans', 'context-carries', 'context-history'),
    INFO_TEMPLATE_PATH: path.join('system', 'templates', 'context-carry-info-template.md'),
    PROMPTS_TEMPLATE_PATH: path.join('system', 'templates', 'context-carry-prompts-template.md')
};

// Template variables
const TEMPLATE_VARS = {
    PROJECT_NAME: '{{PROJECT_NAME}}',
    CONTEXT_FILE_PATH: '{{CONTEXT_FILE_PATH}}',
    CURRENT_DATE: '{{CURRENT_DATE}}'
};

// Default values for template variables
const DEFAULT_VALUES = {
    PROJECT_NAME: 'Project Memory Core'
};

/**
 * Generates a timestamp-based filename in the format MM-DD-YY-hhmm-A
 * @returns {string} Formatted timestamp string
 */
function generateTimestamp() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? 'pm' : 'am';
    const hour12 = hours % 12 || 12;

    return `${month}-${day}-${year}-${hour12}${minutes}${period}`;
}

/**
 * Generates formatted date string in the format YYYY-MM-DD HH:mm PST
 * @returns {string} Formatted date string
 */
function generateFormattedDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes} PST`;
}

/**
 * Generates file names based on timestamp
 * @param {string} timestamp - Formatted timestamp string
 * @returns {Object} Object containing file names
 */
function generateFileNames(timestamp) {
    return {
        infoFile: `context-carry-info-${timestamp}.md`,
        promptsFile: `context-carry-prompts-${timestamp}.md`
    };
}

/**
 * Archives existing context files to history directory
 */
async function archiveHistoricalFiles() {
    console.log('Archiving historical context files...');
    const files = await fs.readdir(path.join(PMC_ROOT, PATHS.CONTEXT_CARRIES_DIR));
    
    const historicalFiles = files.filter(file => 
        (file.startsWith('context-carry-info-') || file.startsWith('context-carry-prompts-')) &&
        file.endsWith('.md')
    );
    
    for (const file of historicalFiles) {
        const sourcePath = path.join(PMC_ROOT, PATHS.CONTEXT_CARRIES_DIR, file);
        const destPath = path.join(PMC_ROOT, PATHS.CONTEXT_HISTORY_DIR, file);
        console.log(`Moving ${file} to history...`);
        await fs.rename(sourcePath, destPath);
    }
}

/**
 * Process array sections in template
 * @param {string} content - Template content
 * @param {string} startTag - Array section start tag
 * @param {string} endTag - Array section end tag
 * @param {Array} items - Array items to process
 * @param {string} template - Template string for each item
 * @returns {string} Processed content
 */
function processArraySection(content, startTag, endTag, items, template) {
    const sections = content.split(startTag);
    return sections.map((section, index) => {
        if (index === 0) return section;
        const [arraySection, rest] = section.split(endTag);
        const itemsContent = items.map(item => {
            let itemTemplate = template;
            Object.entries(item).forEach(([key, value]) => {
                itemTemplate = itemTemplate.replace(new RegExp(`{{${key}}}`, 'g'), value);
            });
            return itemTemplate;
        }).join('\n');
        return itemsContent + rest;
    }).join('');
}

/**
 * Process template content by replacing template variables
 * @param {string} templateContent - Content of the template file
 * @param {Object} replacements - Key-value pairs for template variable replacements
 * @returns {string} Processed content
 */
function processTemplate(templateContent, replacements) {
    let content = templateContent;

    // Process simple replacements
    Object.entries(replacements).forEach(([key, value]) => {
        if (typeof value === 'string' && TEMPLATE_VARS[key]) {
            const regex = new RegExp(TEMPLATE_VARS[key], 'g');
            content = content.replace(regex, value);
        }
    });

    // Fill in any remaining variables with defaults
    Object.entries(DEFAULT_VALUES).forEach(([key, value]) => {
        if (typeof value === 'string' && TEMPLATE_VARS[key]) {
            const regex = new RegExp(TEMPLATE_VARS[key], 'g');
            content = content.replace(regex, value);
        }
    });

    return content;
}

/**
 * Creates necessary directories if they don't exist
 * @param {string} dirPath - Directory path to create
 */
async function ensureDirectoryExists(dirPath) {
    try {
        await fs.access(path.join(PMC_ROOT, dirPath));
    } catch {
        await fs.mkdir(path.join(PMC_ROOT, dirPath), { recursive: true });
    }
}

/**
 * Main execution function
 */
async function main() {
    try {
        // Change working directory to pmc
        process.chdir(PMC_ROOT);
        console.log('Working from:', process.cwd());

        // Ensure directories exist
        await ensureDirectoryExists(PATHS.CONTEXT_CARRIES_DIR);
        await ensureDirectoryExists(PATHS.CONTEXT_HISTORY_DIR);
        
        // Archive historical files
        await archiveHistoricalFiles();

        // Generate timestamp and file names
        const timestamp = generateTimestamp();
        const { infoFile, promptsFile } = generateFileNames(timestamp);
        
        const newInfoFilePath = path.join(PATHS.CONTEXT_CARRIES_DIR, infoFile);
        const newPromptsFilePath = path.join(PATHS.CONTEXT_CARRIES_DIR, promptsFile);

        // Read template files
        console.log('Reading template files...');
        const infoTemplateContent = await fs.readFile(path.join(PMC_ROOT, PATHS.INFO_TEMPLATE_PATH), 'utf8');
        const promptsTemplateContent = await fs.readFile(path.join(PMC_ROOT, PATHS.PROMPTS_TEMPLATE_PATH), 'utf8');

        // Generate formatted date for content
        const formattedDate = generateFormattedDate();

        // Process templates
        console.log('Processing templates...');
        const infoContent = processTemplate(infoTemplateContent, {
            CURRENT_DATE: formattedDate,
            CONTEXT_FILE_PATH: `pmc/${path.join(PATHS.CONTEXT_CARRIES_DIR, infoFile)}`.replace(/\\/g, '/')
        });

        const promptsContent = processTemplate(promptsTemplateContent, {
            CURRENT_DATE: formattedDate,
            CONTEXT_FILE_PATH: `pmc/${path.join(PATHS.CONTEXT_CARRIES_DIR, infoFile)}`.replace(/\\/g, '/')
        });

        // Write new files
        console.log('Creating new context files...');
        await fs.writeFile(path.join(PMC_ROOT, newInfoFilePath), infoContent);
        await fs.writeFile(path.join(PMC_ROOT, newPromptsFilePath), promptsContent);

        console.log('Context carryover completed successfully:');
        console.log(`- Created info file: ${newInfoFilePath}`);
        console.log(`- Created prompts file: ${newPromptsFilePath}`);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

// Run script
main().then(() => process.exit(0)); 