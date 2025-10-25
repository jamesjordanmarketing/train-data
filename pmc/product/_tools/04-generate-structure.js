#!/usr/bin/env node

/*
 * 04-generate-structure.js
 *
 * Purpose:
 *  - Interactive script that generates a structure specification document
 *  - Uses 04-product-structure-prompt_v1.md as the prompt template
 *  - Generates output prompt file in product/_prompt_engineering/output-prompts directory
 *  - Creates a comprehensive structure document for AI implementation
 *
 * Usage:
 *  From pmc/product/_tools/, run:
 *     node 04-generate-structure.js "Project Name" project-abbrev
 *  
 * Examples:
 *     node 04-generate-structure.js "Next.js 14 Modernization" aplio-mod-1
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Ensure directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Get cache filename based on project abbreviation
function getCacheFilename(projectAbbrev) {
  return path.join('cache', `04-${projectAbbrev}-paths-cache.json`);
}

// Normalize path with improved handling
function normalizePath(inputPath, defaultDir) {
  try {
    // Always start from pmc/product
    const baseDir = path.resolve(__dirname, '..');
    
    // If path starts with ../, treat it as relative to _tools directory
    if (inputPath.startsWith('../')) {
      return path.resolve(__dirname, inputPath);
    }
    
    // If path doesn't contain slashes, assume it's in the default directory
    if (!inputPath.includes('/') && !inputPath.includes('\\')) {
      return path.resolve(baseDir, defaultDir, inputPath);
    }
    
    let normalizedPath = inputPath.replace(/\\/g, '/');
    return path.resolve(baseDir, normalizedPath);
  } catch (error) {
    console.error('Path normalization error:', error);
    return null;
  }
}

// Resolve script path
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

// Convert path to LLM-friendly format
function toLLMPath(absolutePath) {
  try {
    if (!absolutePath) return '';
    
    const normalized = absolutePath.replace(/\\/g, '/');
    
    // If it's already a full path, return it
    if (normalized.startsWith('C:') || normalized.startsWith('/')) {
      return normalized;
    }
    
    // If it's a relative path starting with pmc, return as is
    if (normalized.includes('pmc/')) {
      return normalized;
    }
    
    // Otherwise, construct the full path
    return path.resolve(__dirname, '..', normalized).replace(/\\/g, '/');
  } catch (error) {
    console.error('Path conversion error:', error);
    return absolutePath;
  }
}

// Load cached paths
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

// Save paths to cache
function savePathCache(projectAbbrev, paths) {
  try {
    const cachePath = resolveScriptPath(getCacheFilename(projectAbbrev));
    ensureDirectoryExists(path.dirname(cachePath));
    fs.writeFileSync(cachePath, JSON.stringify(paths, null, 2));
  } catch (error) {
    console.error('Error saving path cache:', error);
  }
}

// Display header with step information
function displayHeader(productName, productAbbrev) {
  console.log('\n=== Structure Specification Generation ===');
  console.log(`Project: ${productName} (${productAbbrev})`);
  console.log('=======================================\n');
}

// Input validation helpers
const isYes = input => /^(y|yes)$/i.test(input);
const isNo = input => /^(n|no)$/i.test(input);
const isQuit = input => /^(q|quit)$/i.test(input);

// Get valid file path with status display
async function getValidFilePath(description, defaultPath, projectAbbrev) {
  const cache = loadPathCache(projectAbbrev);
  let cachedPath = cache ? cache[description] : null;
  
  const fullDefaultPath = path.resolve(__dirname, '..', defaultPath);
  
  console.log(`\nRequesting path for: ${description}`);
  console.log(`Default path: ${fullDefaultPath}`);
  console.log(`Default path exists: ${fs.existsSync(fullDefaultPath) ? 'TRUE' : 'FALSE'}`);
  
  if (cachedPath) {
    const fullCachedPath = path.resolve(__dirname, '..', cachedPath);
    console.log(`\nCached path: ${fullCachedPath}`);
    console.log(`Cached path exists: ${fs.existsSync(fullCachedPath) ? 'TRUE' : 'FALSE'}`);
    
    const useCache = await question('Use cached path? (y/n/quit): ');
    if (isQuit(useCache)) process.exit(0);
    if (isYes(useCache)) return cachedPath;
  }
  
  while (true) {
    const input = await question(`Enter path for ${description} (or press Enter for default): `);
    if (isQuit(input)) process.exit(0);
    
    const pathToCheck = input.trim() || defaultPath;
    const fullPathToCheck = path.resolve(__dirname, '..', pathToCheck);
    
    if (fs.existsSync(fullPathToCheck)) {
      console.log(`Using path: ${fullPathToCheck}`);
      console.log(`Path exists: TRUE`);
      return pathToCheck;
    }
    
    console.log(`Path not found: ${fullPathToCheck}`);
    console.log('Please enter a valid path.');
  }
}

// Get all required paths for structure generation
async function getReferencePaths(projectAbbrev) {
  const paths = {
    template: await getValidFilePath(
      'Structure Prompt Template',
      '_prompt_engineering/04-product-structure-prompt_v1.md',
      projectAbbrev
    ),
    structureTemplate: await getValidFilePath(
      'Structure Specification Template',
      '_templates/04-structure-specification-template.md',
      projectAbbrev
    ),
    functionalRequirements: await getValidFilePath(
      'Functional Requirements',
      `03-${projectAbbrev}-functional-requirements.md`,
      projectAbbrev
    ),
    overview: await getValidFilePath(
      'Project Overview',
      `01-${projectAbbrev}-overview.md`,
      projectAbbrev
    ),
    userStories: await getValidFilePath(
      'User Stories',
      `02-${projectAbbrev}-user-stories.md`,
      projectAbbrev
    ),
    example: await getValidFilePath(
      'Reference Example',
      `_examples/04-${projectAbbrev}-structure.md`,
      projectAbbrev
    )
  };

  // Ask about codebase review
  console.log('\nWould you like to include codebase review in the prompt?');
  const includeCodebase = await question('Include codebase review? (y/n) [default: n]: ');
  const enableCodebase = isYes(includeCodebase);

  if (enableCodebase) {
    paths.codebase = await getValidFilePath(
      'Codebase Review',
      '../../aplio-legacy',
      projectAbbrev
    );
  }
  
  // Output file path
  paths.outputPath = await getValidFilePath(
    'Output Structure File',
    `04-${projectAbbrev}-structure.md`,
    projectAbbrev
  );
  
  // Save to cache
  savePathCache(projectAbbrev, paths);
  
  return {
    paths,
    enableCodebase
  };
}

// Write prompt to file
function writePromptToFile(prompt, templatePath, projectAbbrev) {
  try {
    // Create output directory if it doesn't exist
    const outputDir = path.resolve(__dirname, '..', '_prompt_engineering', 'output-prompts');
    ensureDirectoryExists(outputDir);
    
    // Get the filename from the template path
    const templateFileName = path.basename(templatePath);
    const outputFileName = templateFileName.replace('.md', '-output.md');
    const outputPath = path.join(outputDir, outputFileName);
    
    // Write the prompt to the file
    fs.writeFileSync(outputPath, prompt);
    console.log(`Prompt saved to: ${outputPath}`);
    
    return outputPath;
  } catch (error) {
    console.error('Error writing prompt to file:', error);
    return null;
  }
}

// Generate the structure prompt with variables replaced
async function generateStructurePrompt(pathsData, projectName, projectAbbrev) {
  try {
    const { paths, enableCodebase } = pathsData;
    
    // Use the structure prompt template
    const promptTemplatePath = normalizePath(paths.template, '');
    if (!promptTemplatePath || !fs.existsSync(promptTemplatePath)) {
      throw new Error(`Template file not found at path: ${promptTemplatePath}`);
    }
    
    const template = fs.readFileSync(promptTemplatePath, 'utf-8');
    
    // Extract project summary from overview
    let projectSummary = "";
    try {
      const overview = fs.readFileSync(normalizePath(paths.overview, ''), 'utf-8');
      const summaryMatch = overview.match(/## (Product|Project) Summary\s+([\s\S]+?)(?=##|$)/i);
      if (summaryMatch && summaryMatch[2]) {
        projectSummary = summaryMatch[2].trim();
      } else {
        projectSummary = `${projectName} is a project focused on modern software development practices.`;
      }
    } catch (error) {
      console.warn('Could not extract project summary from overview:', error.message);
      projectSummary = `${projectName} is a project focused on modern software development practices.`;
    }
    
    // Create replacements
    const replacements = {
      '{{PROJECT_NAME}}': projectName,
      '{{PROJECT_SUMMARY}}': projectSummary,
      '{STRUCTURE_TEMPLATE_PATH}': toLLMPath(paths.structureTemplate),
      '{OVERVIEW_PATH}': toLLMPath(paths.overview),
      '{USER_STORIES_PATH}': toLLMPath(paths.userStories),
      '{FUNCTIONAL_REQUIREMENTS_PATH}': toLLMPath(paths.functionalRequirements),
      '{REFERENCE_EXAMPLE_PATH}': toLLMPath(paths.example),
      '{OUTPUT_PATH}': toLLMPath(paths.outputPath)
    };
    
    if (enableCodebase) {
      replacements['{CODEBASE_REVIEW_PATH}'] = toLLMPath(paths.codebase);
    }
    
    let prompt = template;
    
    // Handle conditional sections
    const conditionalPattern = /\[\[ if current_status\.enabled \]\]([\s\S]*?)\[\[ endif \]\]/g;
    prompt = prompt.replace(conditionalPattern, (match, content) => {
      return enableCodebase ? content : '';
    });
    
    // Replace all placeholders
    for (const [key, value] of Object.entries(replacements)) {
      prompt = prompt.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    }
    
    // Write prompt to file
    const outputPath = writePromptToFile(prompt, promptTemplatePath, projectAbbrev);
    console.log(`Structure prompt generated at: ${outputPath}`);
    
    return prompt;
  } catch (error) {
    console.error('Error generating structure prompt:', error);
    return null;
  }
}

// Main function
async function main() {
  try {
    const projectName = process.argv[2];
    const projectAbbrev = process.argv[3];
    
    if (!projectName || !projectAbbrev) {
      console.log('Usage: node 04-generate-structure.js "Project Name" project-abbrev');
      process.exit(1);
    }

    // Create output directory at startup
    const outputDir = path.resolve(__dirname, '..', '_prompt_engineering', 'output-prompts');
    ensureDirectoryExists(outputDir);
    console.log(`Prompt outputs will be saved to: ${outputDir}`);

    // Display header
    displayHeader(projectName, projectAbbrev);
    
    // Get reference paths
    const pathsData = await getReferencePaths(projectAbbrev);
    
    // Generate structure prompt
    await generateStructurePrompt(pathsData, projectName, projectAbbrev);
    
    console.log('\nStructure prompt generated successfully!');
    console.log('Use this prompt to generate your structure specification document.');
    rl.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 