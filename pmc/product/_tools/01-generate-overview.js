#!/usr/bin/env node

/*
 * generate-product-spec.js
 *
 * Purpose:
 *  - Interactive version that works with Cursor's AI interface
 *  - Generates prompts for the user to copy/paste into Cursor
 *  - Maintains high-quality documentation through example-based generation
 *  - Uses configuration from ./config/prompts-config.json
 *
 * Usage:
 *  From pmc/product/_tools/, run:
 *     node generate-product-spec.js "Project Name" project-abbrev
 *  
 * Examples:
 *     node generate-product-spec.js "Next.js 14 Modernization" ts-14
 *     node generate-product-spec.js "Project Memory Core Tracking" pmct
 *
 * Notes:
 *  - Progress is saved automatically and can be resumed
 *  - Use 'quit' at any prompt to exit safely
 *  - File paths are cached per project for reuse
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Utility function to ensure directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Create readline interface for user interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Get progress filename based on project
function getProgressFilename(projectName, projectAbbrev) {
  const sanitizedName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return path.join('progress', `${sanitizedName}-${projectAbbrev}-progress.json`);
}

// Get cache filename based on project abbreviation
function getCacheFilename(projectAbbrev) {
  return path.join('cache', `01-02-${projectAbbrev}-paths-cache.json`);
}

// Normalize path to handle Windows paths and simple filenames
function normalizePath(inputPath, defaultDir) {
  try {
    // If it's just a filename, prepend the default directory
    if (!inputPath.includes('/') && !inputPath.includes('\\')) {
      return path.resolve(__dirname, '..', defaultDir, inputPath);
    }
    
    // Convert Windows backslashes to forward slashes
    let normalizedPath = inputPath.replace(/\\/g, '/');
    
    // If it's a full project path, extract the relevant part
    const projectRoot = 'pmc/product/';
    if (normalizedPath.includes(projectRoot)) {
      normalizedPath = normalizedPath.substring(normalizedPath.indexOf(projectRoot) + projectRoot.length);
      return path.resolve(__dirname, '..', normalizedPath);
    }
    
    // Otherwise treat as relative path
    return path.resolve(__dirname, normalizedPath);
  } catch (error) {
    console.error('Path normalization error:', error);
    return null;
  }
}

// Resolve a path relative to the script's directory
function resolveScriptPath(relativePath) {
  try {
    return path.resolve(__dirname, relativePath);
  } catch (error) {
    console.error('Path resolution error:', error);
    return null;
  }
}

// Validate file exists
function validateFilePath(filePath, defaultDir) {
  try {
    const normalizedPath = normalizePath(filePath, defaultDir);
    return normalizedPath && fs.existsSync(normalizedPath);
  } catch (error) {
    console.error('File validation error:', error);
    return false;
  }
}

// Validate project name and abbreviation
function validateProjectInputs(projectName, projectAbbrev) {
  if (!projectName || typeof projectName !== 'string' || projectName.trim().length === 0) {
    throw new Error('Invalid project name. Please provide a non-empty string.');
  }
  
  if (!projectAbbrev || typeof projectAbbrev !== 'string' || !/^[a-z0-9-]+$/i.test(projectAbbrev)) {
    throw new Error('Invalid project abbreviation. Use only letters, numbers, and hyphens.');
  }
}

// Load and validate the prompts configuration
function loadPromptsConfig(projectAbbrev) {
  const configPath = resolveScriptPath('config/prompts-config.json');
  try {
    if (!fs.existsSync(configPath)) {
      throw new Error('Configuration file not found: ' + configPath);
    }
    
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent);
    
    // Validate config structure
    if (!config || typeof config !== 'object') {
      throw new Error('Invalid configuration format');
    }
    
    // Process any project abbreviation placeholders in the config
    const processedConfig = JSON.parse(
      JSON.stringify(config).replace(/\{\{project_abbreviation\}\}/g, projectAbbrev)
    );
    
    return processedConfig;
  } catch (error) {
    console.error('Error loading prompts configuration:', error);
    process.exit(1);
  }
}

// Track which prompt we're on with error handling
function loadProgress(projectName, projectAbbrev) {
  try {
    const progressPath = resolveScriptPath(getProgressFilename(projectName, projectAbbrev));
    ensureDirectoryExists(path.dirname(progressPath));
    
    if (fs.existsSync(progressPath)) {
      const content = fs.readFileSync(progressPath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn('Could not load progress, starting fresh:', error.message);
  }
  
  return {
    currentStep: 0,
    projectName: projectName
  };
}

// Save progress with error handling
function saveProgress(progress, projectAbbrev) {
  try {
    const progressPath = resolveScriptPath(getProgressFilename(progress.projectName, projectAbbrev));
    ensureDirectoryExists(path.dirname(progressPath));
    fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}

// Load cached paths with error handling
function loadPathCache(projectAbbrev) {
  try {
    const cachePath = resolveScriptPath(getCacheFilename(projectAbbrev));
    ensureDirectoryExists(path.dirname(cachePath));
    
    if (fs.existsSync(cachePath)) {
      return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    }
  } catch (error) {
    console.warn('Could not load path cache:', error.message);
  }
  return null;
}

// Save paths to cache with error handling
function savePathCache(projectAbbrev, paths) {
  try {
    const cachePath = resolveScriptPath(getCacheFilename(projectAbbrev));
    ensureDirectoryExists(path.dirname(cachePath));
    fs.writeFileSync(cachePath, JSON.stringify(paths, null, 2));
  } catch (error) {
    console.error('Error saving path cache:', error);
  }
}

// Convert path to LLM-friendly format with error handling
function toLLMPath(absolutePath) {
  try {
    if (!absolutePath) return '';
    
    const normalized = absolutePath.replace(/\\/g, '/');
    const projectRoot = 'pmc/';
    
    if (normalized.includes(projectRoot)) {
      return normalized.substring(normalized.indexOf(projectRoot));
    }
    
    // If path doesn't contain project root, it's likely relative to _tools
    const toolsDir = '/product/_tools/';
    if (normalized.includes(toolsDir)) {
      return 'pmc/product/' + normalized.split(toolsDir)[1];
    }
    
    // For paths that start with ../
    if (normalized.startsWith('../')) {
      return 'pmc/product/' + normalized.replace('../', '');
    }
    
    // For relative paths that don't start with ../, add the full prefix
    if (!normalized.startsWith('/') && !normalized.includes(':')) {
      return 'pmc/product/' + normalized;
    }
    
    return normalized;
  } catch (error) {
    console.error('Path conversion error:', error);
    return absolutePath;
  }
}

// Ensure output directory exists and save prompt to file
function savePromptToFile(prompt, filename, projectAbbrev) {
  const outputDir = path.resolve(__dirname, '../_run-prompts');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, prompt, 'utf-8');
  
  console.log(`✅ Prompt saved to: ${toProjectPath(filePath)}`);
  return filePath;
}

// Update toProjectPath to use toLLMPath for display
function toProjectPath(absolutePath) {
  return toLLMPath(absolutePath);
}

// Document type definitions with descriptions
const docTypes = [
  'overview',
  'user-stories',
  'functional-requirements',
  'architecture',
  'logging-and-reporting',
  'deployment-and-setup',
  'roadmap',
  'structure'
];

// Document name mapping with descriptions
const documentNames = {
  'overview': 'Product Overview',
  'user-stories': 'User Stories',
  'functional-requirements': 'Functional Requirements',
  'architecture': 'Architecture',
  'logging-and-reporting': 'Logging and Reporting',
  'deployment-and-setup': 'Deployment and Setup',
  'roadmap': 'Project Roadmap',
  'structure': 'Project Structure'
};

// Function to display header
function displayHeader(productName, productAbbrev, currentDoc) {
  const header = '='.repeat(45);
  console.log(header);
  console.log(`Product: ${productName}`);
  console.log(`Abbreviation: ${productAbbrev}`);
  console.log(`Current Document: ${currentDoc}`);
  console.log(header);
}

// Input handling functions
function isYes(input) {
  return input.trim() === '' || /^(y|yes)$/i.test(input);
}

function isNo(input) {
  return /^(n|no)$/i.test(input);
}

function isQuit(input) {
  return /^(q|quit)$/i.test(input);
}

// Get valid file path with improved error handling
async function getValidFilePath(description, defaultPath, projectAbbrev) {
  try {
    let defaultDir = '_templates';
    if (description.includes('SEED_STORY')) {
      defaultDir = '..';
    }
    
    // Process the default path
    const processedDefaultPath = defaultPath.replace(/\{\{project_abbreviation\}\}/g, projectAbbrev);
    const fullDefaultPath = path.resolve(__dirname, '..', processedDefaultPath).replace(/\\pmc\\(?!product)/, '\\pmc\\product\\');
    
    console.log(`\nRequesting path for: ${description}`);
    console.log(`Default path: ${fullDefaultPath}`);
    console.log(`Default path exists: ${fs.existsSync(fullDefaultPath) ? 'TRUE' : 'FALSE'}`);
    
    const pathCache = loadPathCache(projectAbbrev);
    if (pathCache && pathCache[description]) {
      const cachedPath = pathCache[description];
      const fullCachedPath = path.resolve(__dirname, '..', cachedPath).replace(/\\pmc\\(?!product)/, '\\pmc\\product\\');
      
      if (fs.existsSync(fullCachedPath)) {
        console.log(`\nCached path: ${fullCachedPath}`);
        console.log(`Cached path exists: TRUE`);
        console.log(`\nEnter path for ${description}`);
        console.log('Press Enter to use this path, or enter a new one:');
        const input = await question('Path > ');
        if (isQuit(input)) {
          console.log('Exiting...');
          process.exit(0);
        }
        if (input.trim()) {
          return input.trim();
        }
        return cachedPath;
      }
    }
    
    // Keep trying until we get a valid path or user quits
    while (true) {
              console.log(`\nEnter path for ${description}`);
      console.log('(Press Enter to use default, or type a new path)');
      
      const input = await question('Path > ');
      if (isQuit(input)) {
        console.log('Exiting...');
        process.exit(0);
      }
      
      const finalPath = input.trim() || processedDefaultPath;
      const fullFinalPath = path.resolve(__dirname, '..', finalPath).replace(/\\pmc\\(?!product)/, '\\pmc\\product\\');
      
      if (fs.existsSync(fullFinalPath)) {
        console.log(`Using path: ${fullFinalPath}`);
        console.log(`Path exists: TRUE`);
        // Update cache
        const newCache = { ...(pathCache || {}), [description]: finalPath };
        savePathCache(projectAbbrev, newCache);
        return finalPath;
      }
      
      console.log(`Path not found: ${fullFinalPath}`);
      console.log('Please verify the file exists and try again.');
      console.log(`Looking in directory: ${path.resolve(__dirname, '..', defaultDir).replace(/\\pmc\\(?!product)/, '\\pmc\\product\\')}`);
      
      // Show available files in the directory to help user
      try {
        const dir = path.resolve(__dirname, '..', defaultDir).replace(/\\pmc\\(?!product)/, '\\pmc\\product\\');
        if (fs.existsSync(dir)) {
          console.log('\nAvailable files in directory:');
          const files = fs.readdirSync(dir);
          files.forEach(file => console.log(`- ${file}`));
        }
      } catch (err) {
        console.error('Error listing directory:', err);
      }
    }
  } catch (error) {
    console.error('Error getting valid file path:', error);
    return null;
  }
}

// Get all required file paths for a document type
async function getReferencePaths(docConfig, projectAbbrev, projectName) {
  console.log('Validating reference documents...');
  
  const paths = {};
  const newPaths = {};
  
  try {
    // Handle regular placeholders
    for (const [key, defaultPath] of Object.entries(docConfig.template_config.required_placeholders)) {
      if (key === 'OUTPUT_PATH' || !key.endsWith('_PATH')) {
        let processedValue = defaultPath.replace(/\{\{project_abbreviation\}\}/g, projectAbbrev);
        processedValue = processedValue.replace(/\{project_name\}/g, projectName);
        
        // For OUTPUT_PATH, add the full project prefix
        if (key === 'OUTPUT_PATH') {
          processedValue = `pmc/product/${processedValue}`;
        }
        
        paths[key] = processedValue;
        continue;
      }
      
      // Replace any template variables in the default path
      const processedPath = defaultPath.replace(/\{\{project_abbreviation\}\}/g, projectAbbrev);
      const path = await getValidFilePath(key, processedPath, projectAbbrev);
      const llmPath = toLLMPath(path || processedPath);
      paths[key] = llmPath;
      // Store the LLM path in cache for consistency
      newPaths[key] = llmPath;
    }

    // Ask user if they want to review the codebase
    const enable = await question('\nInclude codebase review in prompt? (y/n) [default: n] > ');
    if (isQuit(enable)) {
      console.log('Exiting...');
      process.exit(0);
    }
    
    const includeCodebase = enable.toLowerCase() === 'y';
    
    const conditionals = {
      current_status: {
        enabled: includeCodebase
      }
    };
    
    if (includeCodebase) {
      // If codebase review is enabled, get the codebase path
      if (docConfig.template_config.conditional_sections?.current_status?.placeholders?.CODEBASE_REVIEW_PATH !== undefined) {
        console.log('\nProcessing codebase path:');
        const defaultDir = '../../'; // Go up to workspace root
        const defaultPath = path.resolve(__dirname, defaultDir);
        const codebasePath = await getValidFilePath('CODEBASE_REVIEW_PATH', defaultPath, projectAbbrev);
        
        if (codebasePath) {
          paths['CODEBASE_REVIEW_PATH'] = toLLMPath(codebasePath);
          conditionals.current_status.placeholders = {
            CODEBASE_REVIEW_PATH: toLLMPath(codebasePath)
          };
        }
      }
    }

    return {
      placeholders: paths,
      conditionals: conditionals
    };
  } catch (error) {
    console.error('Error getting reference paths:', error);
    return {
      placeholders: {},
      conditionals: { current_status: { enabled: false } }
    };
  }
}

// Load and process prompt template
async function generatePrompt(docConfig, paths) {
  try {
    let promptTemplate;
    if (docConfig.prompt_template_path) {
      let templatePath;
      
      if (docConfig.prompt_template_path.includes('pmc/product/')) {
        // Handle absolute path from project root
        const relativePath = docConfig.prompt_template_path.split('pmc/product/')[1];
        templatePath = path.resolve(__dirname, '..', relativePath);
      } else if (docConfig.prompt_template_path.startsWith('pmc/')) {
        // Handle full project path - resolve from project root
        const projectParts = docConfig.prompt_template_path.split('/').slice(1); // Remove 'pmc'
        templatePath = path.resolve(__dirname, '..', '..', ...projectParts);
      } else {
        // Handle relative path from tools directory
        templatePath = path.resolve(__dirname, '..', docConfig.prompt_template_path);
      }
      
      console.log('Loading prompt template from:', templatePath);
      promptTemplate = fs.readFileSync(templatePath, 'utf-8');
    } else if (docConfig.prompt_template) {
      promptTemplate = docConfig.prompt_template;
    } else {
      throw new Error('No prompt template found in configuration');
    }

    // Replace placeholders in template
    let prompt = promptTemplate;
    for (const [key, value] of Object.entries(paths.placeholders)) {
      prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }

    // Handle conditional sections
    if (paths.conditionals) {
      for (const [section, config] of Object.entries(paths.conditionals)) {
        const pattern = new RegExp(`\\[\\[ if ${section}\\.enabled \\]\\]([\\s\\S]*?)\\[\\[ endif \\]\\]`, 'g');
        prompt = prompt.replace(pattern, (match, content) => {
          return config.enabled ? content : '';
        });
      }
    }

    return prompt;
  } catch (error) {
    console.error('Error generating prompt:', error);
    return null;
  }
}

// Main execution function
async function main() {
  try {
    const projectName = process.argv[2];
    const projectAbbrev = process.argv[3];
    
    if (!projectName || !projectAbbrev) {
      console.log('Usage: node 01-02-generate-product-specs.js "Project Name" project-abbrev');
      process.exit(1);
    }
    
    const config = loadPromptsConfig(projectAbbrev);
    let progress = loadProgress(projectName, projectAbbrev);
    
    // Process the overview document (always run regardless of progress)
    const currentDoc = config.documents[0]; // Only process overview document
    
    displayHeader(projectName, projectAbbrev, currentDoc);
    
    const paths = await getReferencePaths(currentDoc, projectAbbrev, projectName);
    const prompt = await generatePrompt(currentDoc, paths);
    
    if (prompt) {
      // Generate filename for the prompt
      const filename = `01-product-${projectAbbrev}-${currentDoc.type}-prompt-v1.md`;
      
      console.log(`\nGenerated ${documentNames[currentDoc.type]} Prompt:`);
      console.log('============================');
      savePromptToFile(prompt, filename, projectAbbrev);
      console.log('============================\n');
    } else {
      console.error('Failed to generate prompt for', currentDoc.type);
    }
    
    rl.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the main function
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
} 