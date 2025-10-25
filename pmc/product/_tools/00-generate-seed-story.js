#!/usr/bin/env node

/*
 * generate-seed-story.js
 *
 * Purpose:
 *  - Interactive script to generate a seed story from a seed narrative
 *  - Generates prompts for the user to copy/paste into Cursor
 *  - Maintains high-quality documentation through example-based generation
 *  - Uses configuration from ./seed-story-config.json
 *
 * Usage:
 *  From pmc/product/_tools/, run:
 *     node generate-seed-story.js
 *
 * Notes:
 *  - Project name and abbreviation are read from seed-narrative-v1.md
 *  - Progress is saved automatically and can be resumed
 *  - Use 'quit' at any prompt to exit safely
 *  - File paths are cached per project for reuse
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Convert absolute path to project-relative path for display
function toProjectPath(absolutePath) {
  const normalized = absolutePath.replace(/\\/g, '/');
  const projectRoot = 'pmc/';
  if (normalized.includes(projectRoot)) {
    return normalized.substring(normalized.indexOf(projectRoot));
  }
  return normalized;
}

// Convert path to LLM-friendly format (relative to project root)
function toLLMPath(absolutePath) {
  const normalized = absolutePath.replace(/\\/g, '/');
  const projectRoot = 'pmc/';
  
  if (normalized.includes(projectRoot)) {
    return normalized.substring(normalized.indexOf(projectRoot));
  }
  
  // If path doesn't contain project root, it's likely relative to _tools
  // Need to adjust it to be relative to project root
  const toolsDir = '/product/_tools/';
  if (normalized.includes(toolsDir)) {
    return 'pmc/product/' + normalized.split(toolsDir)[1];
  }
  
  // For paths that start with ../
  if (normalized.startsWith('../')) {
    return 'pmc/product/' + normalized.replace('../', '');
  }
  
  return normalized;
}

// Process and resolve all types of paths
function processPath(inputPath, projectAbbrev, projectName, defaultDir) {
  // First, replace all placeholders
  let processedPath = inputPath
    .replace(/\{\{project_abbreviation\}\}/g, projectAbbrev)
    .replace(/\{\{project_name\}\}/g, projectName);
  
  // Convert Windows backslashes to forward slashes
  processedPath = processedPath.replace(/\\/g, '/');
  
  // Handle absolute paths (Windows or Unix style)
  if (processedPath.match(/^([A-Za-z]:)?\//) || processedPath.match(/^[A-Za-z]:\\/)) {
    return processedPath;
  }
  
  // Handle relative paths
  if (processedPath.startsWith('../')) {
    // Paths relative to script location
    return path.resolve(__dirname, processedPath);
  } else if (processedPath.startsWith('./')) {
    // Paths relative to current directory
    return path.resolve(process.cwd(), processedPath);
  } else if (!processedPath.includes('/')) {
    // Just a filename - put it in the default directory
    return path.resolve(__dirname, '../../product', defaultDir || '', processedPath);
  } else if (processedPath.startsWith('product/')) {
    // Explicit product-relative path
    return path.resolve(__dirname, '../..', processedPath);
  }
  
  // For paths that might be relative to workspace root
  try {
    const workspaceRoot = path.resolve(__dirname, '../../..');
    const absolutePath = path.resolve(workspaceRoot, processedPath);
    if (fs.existsSync(absolutePath)) {
      return absolutePath;
    }
  } catch (error) {
    // Ignore resolution errors
  }
  
  // Fallback - treat as project-relative path
  return path.resolve(__dirname, '../..', processedPath);
}

// Validate processed path exists
function validateProcessedPath(processedPath, key) {
  if (!fs.existsSync(processedPath)) {
    console.warn(`Warning: Path for ${key} does not exist: ${toProjectPath(processedPath)}`);
    return false;
  }
  return true;
}

// Log path resolution for debugging
function logPathResolution(key, originalPath, processedPath) {
  console.log(`Processing ${key}:`);
  console.log(`  Original: ${originalPath}`);
  console.log(`  Processed: ${toProjectPath(processedPath)}`);
  console.log(`  Exists: ${fs.existsSync(processedPath)}`);
}

// Load the seed story configuration
function loadConfig() {
  const configPath = path.resolve(__dirname, './seed-story-config.json');
  try {
    const configContent = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(configContent);
  } catch (error) {
    console.error('Error loading seed story configuration:', error);
    process.exit(1);
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

// Track generation progress
function loadProgress(projectName, projectAbbrev) {
  const progressPath = path.resolve(__dirname, `../../.seed-story-${projectAbbrev}-progress.json`);
  try {
    return JSON.parse(fs.readFileSync(progressPath, 'utf-8'));
  } catch (error) {
    return {
      currentStep: 0,
      projectName: projectName,
      projectAbbrev: projectAbbrev
    };
  }
}

// Save generation progress
function saveProgress(progress, projectAbbrev) {
  const progressPath = path.resolve(__dirname, `../../.seed-story-${projectAbbrev}-progress.json`);
  fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
}

// Load cached paths for a project
function loadPathCache(projectAbbrev) {
  const cachePath = path.resolve(__dirname, `../../.seed-story-${projectAbbrev}-paths-cache.json`);
  try {
    return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  } catch (error) {
    return null;
  }
}

// Save paths to cache
function savePathCache(projectAbbrev, paths) {
  const cachePath = path.resolve(__dirname, `../../.seed-story-${projectAbbrev}-paths-cache.json`);
  fs.writeFileSync(cachePath, JSON.stringify(paths, null, 2));
}

// Get all required file paths for a specific step
async function getReferencePaths(config, projectName, projectAbbrev, step) {
  console.log(`\nValidating reference documents for ${step}...`);
  
  const paths = {};
  const cache = loadPathCache(projectAbbrev);
  
  // First handle regular placeholders
  for (const [key, value] of Object.entries(config[step].required_placeholders)) {
    // Get the directory type based on the path type
    let defaultDir = '_templates';
    switch (value.type) {
      case 'template_path':
        defaultDir = '_templates';
        break;
      case 'seed_path':
        defaultDir = '_seeds';
        break;
      case 'example_path':
        defaultDir = '_examples';
        break;
      case 'product_path':
        defaultDir = '';
        break;
      case 'text':
        // For text type, just process placeholders and continue
        paths[key] = value.default
          .replace(/\{\{project_abbreviation\}\}/g, projectAbbrev)
          .replace(/\{\{project_name\}\}/g, projectName);
        continue;
    }
    
    // Process the path first
    let processedPath = processPath(value.default, projectAbbrev, projectName, defaultDir);
    
    // For path fields, validate and get user input if needed
    if (cache?.[step]?.placeholders?.[key]) {
      processedPath = cache[step].placeholders[key];
    }
    
    // Log path resolution
    logPathResolution(key, value.default, processedPath);
    
    // Skip validation for OUTPUT_PATH since it's a destination, not a source
    if (key === 'OUTPUT_PATH') {
      paths[key] = processedPath;
    } else {
      // Get valid path from user if needed
      const validPath = await getValidFilePath(key, processedPath, projectAbbrev);
      paths[key] = validPath || processedPath;
    }
  }
  
  // Now handle conditional sections last
  const conditionals = {};
  for (const [sectionName, sectionConfig] of Object.entries(config[step].conditional_sections)) {
    if (sectionName === 'current_status') {
      // Ask user if they want to review the codebase
      const enable = await question(`\nReview Codebase? (y/n) [default: n] > `);
      const isEnabled = enable.toLowerCase() === 'y';
      
      conditionals[sectionName] = {
        enabled: isEnabled,
        path_variable: sectionConfig.path_variable
      };
      
      // If enabled and has a path variable, we'll need to get that path
      if (isEnabled && sectionConfig.path_variable) {
        const defaultDir = '_templates'; // You can adjust this based on the variable type
        const defaultPath = path.resolve(__dirname, '../../product', defaultDir);
        
        console.log(`\nProcessing ${sectionConfig.path_variable}:`);
        const processedPath = await getValidFilePath(sectionConfig.path_variable, defaultPath, projectAbbrev);
        paths[sectionConfig.path_variable] = processedPath;
      }
    } else {
      // Handle other conditional sections if they exist
      conditionals[sectionName] = sectionConfig;
    }
  }
  
  // Save processed paths to cache
  const cacheData = cache || {};
  cacheData[step] = {
    placeholders: paths,
    conditionals: conditionals
  };
  savePathCache(projectAbbrev, cacheData);
  
  return {
    placeholders: paths,
    conditionals: conditionals
  };
}

// Get valid file path with user interaction
async function getValidFilePath(description, defaultPath, projectAbbrev) {
  // Clean up the display path
  const displayPath = toProjectPath(defaultPath).trim();
  
  while (true) {
    process.stdout.write(`Enter path for ${description}\nDefault: ${displayPath}\n> `);
    const filePath = await question('');
    
    // If user just hits enter, use the default path
    if (!filePath.trim()) {
      if (validateProcessedPath(defaultPath, description)) {
        return defaultPath;
      }
      console.log('Default path does not exist. Please enter a valid path.');
      continue;
    }
    
    // Process and validate the user-provided path
    const processedPath = processPath(filePath.trim(), projectAbbrev, null, null);
    if (validateProcessedPath(processedPath, description)) {
      return processedPath;
    }
    console.log('Entered path does not exist. Please try again.');
  }
}

// Read project details from narrative
function readProjectDetails() {
  const narrativePath = path.resolve(__dirname, '../../product/_seeds/seed-narrative-v1.md');
  try {
    const content = fs.readFileSync(narrativePath, 'utf-8');
    const lines = content.split('\n');
    
    // Extract project name and abbreviation from first two lines
    const projectName = lines[0].replace(/^#\s+/, '').trim();
    const projectAbbrev = lines[1].replace(/^.*Product Abbreviation:\s*/, '').trim();
    
    console.log(`Found project details:`);
    console.log(`Name: ${projectName}`);
    console.log(`Abbreviation: ${projectAbbrev}\n`);
    
    return { projectName, projectAbbrev };
  } catch (error) {
    console.error('Error reading seed narrative:', error);
    process.exit(1);
  }
}

// Main execution
async function main() {
  try {
    // Load configuration
    const config = loadConfig();
    
    // Read project details
    const { projectName, projectAbbrev } = readProjectDetails();
    
    // Load or initialize progress
    const progress = loadProgress(projectName, projectAbbrev);
    
    // First handle seed-narrative
    console.log('\nGenerating Seed Narrative Prompt:');
    console.log('================================');
    
    const narrativeData = await getReferencePaths(config, projectName, projectAbbrev, 'seed-narrative');
    
    // Generate the narrative prompt
    const narrativeTemplate = fs.readFileSync(path.resolve(__dirname, config['seed-narrative'].promptPath), 'utf-8');
    let narrativePrompt = narrativeTemplate;
    
    // Replace placeholders with LLM-friendly paths
    for (const [key, value] of Object.entries(narrativeData.placeholders)) {
      const placeholder = `{${key}}`;
      if (key.endsWith('_PATH')) {
        // For path values, convert to LLM-friendly format without brackets
        narrativePrompt = narrativePrompt.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), 
          `\`${toLLMPath(value)}\``); // Wrap in backticks instead of curly braces
      } else {
        // For non-path values (like PROJECT_NAME), use as is
        narrativePrompt = narrativePrompt.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
      }
    }
    
    // Handle conditional sections
    for (const [sectionName, config] of Object.entries(narrativeData.conditionals)) {
      const pattern = new RegExp(`\\[\\[ if ${sectionName}\\.enabled \\]\\]([\\s\\S]*?)\\[\\[ endif \\]\\]`, 'g');
      narrativePrompt = narrativePrompt.replace(pattern, (match, content) => {
        return config.enabled ? content : '';
      });
    }
    
    // Save the narrative prompt to file
    const narrativeFilename = `00-product-${projectAbbrev}-seed-narrative-prompt-v1.md`;
    console.log('\nGenerating Seed Narrative Prompt:');
    console.log('================================');
    const narrativeFilePath = savePromptToFile(narrativePrompt, narrativeFilename, projectAbbrev);
    console.log('\n================================\n');
    
    // Ask if user wants to proceed with seed story
    const proceed = await question('Would you like to generate the seed story prompt now? (y/n) > ');
    
    if (proceed.toLowerCase() === 'y') {
      // Now handle seed-story
      console.log('\nGenerating Seed Story Prompt:');
      console.log('============================');
      
      const storyData = await getReferencePaths(config, projectName, projectAbbrev, 'seed-story');
      
      // Generate the story prompt
      const storyTemplate = fs.readFileSync(path.resolve(__dirname, config['seed-story'].promptPath), 'utf-8');
      let storyPrompt = storyTemplate;
      
      // Replace placeholders with LLM-friendly paths
      for (const [key, value] of Object.entries(storyData.placeholders)) {
        const placeholder = `{${key}}`;
        if (key.endsWith('_PATH')) {
          // For path values, convert to LLM-friendly format without brackets
          storyPrompt = storyPrompt.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), 
            `\`${toLLMPath(value)}\``); // Wrap in backticks instead of curly braces
        } else {
          // For non-path values (like PROJECT_NAME), use as is
          storyPrompt = storyPrompt.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
        }
      }
      
      // Handle conditional sections
      for (const [sectionName, config] of Object.entries(storyData.conditionals)) {
        const pattern = new RegExp(`\\[\\[ if ${sectionName}\\.enabled \\]\\]([\\s\\S]*?)\\[\\[ endif \\]\\]`, 'g');
        storyPrompt = storyPrompt.replace(pattern, (match, content) => {
          if (config.enabled) {
            // Replace the path variable in the content if it exists
            if (config.path_variable && storyData.placeholders[config.path_variable]) {
              return content.replace(
                new RegExp(`\\{${config.path_variable}\\}`, 'g'),
                `\`${toLLMPath(storyData.placeholders[config.path_variable])}\``
              );
            }
            return content;
          }
          return '';
        });
      }
      
      // Save the story prompt to file
      const storyFilename = `00-product-${projectAbbrev}-seed-story-prompt-v1.md`;
      console.log('\nGenerated Seed Story Prompt:');
      console.log('============================');
      const storyFilePath = savePromptToFile(storyPrompt, storyFilename, projectAbbrev);
      console.log('\n============================\n');
    }
    
    // Save progress
    progress.currentStep++;
    saveProgress(progress, projectAbbrev);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
main(); 