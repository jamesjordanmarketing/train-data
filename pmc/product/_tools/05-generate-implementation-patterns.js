#!/usr/bin/env node

/*
 * 05-generate-implementation-patterns.js
 *
 * Purpose:
 *  - Interactive script that generates an implementation patterns specification document
 *  - Uses 05-product-implementation-patterns-prompt_v1.md as the prompt template
 *  - Generates output prompt file in product/_prompt_engineering/output-prompts directory
 *  - Creates a comprehensive implementation patterns document for AI implementation
 *
 * Usage:
 *  From pmc/product/_tools/, run:
 *     node 05-generate-implementation-patterns.js "Project Name" project-abbrev
 *  
 * Examples:
 *     node 05-generate-implementation-patterns.js "Next.js 14 Modernization" aplio-mod-1
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
  return path.join('cache', `05-${projectAbbrev}-paths-cache.json`);
}

// Normalize path with improved handling
function normalizePath(inputPath, defaultDir) {
  try {
    // Check if inputPath is undefined or null
    if (!inputPath) {
      console.error('Input path is undefined or null');
      return null;
    }
    
    // Always start from pmc/product
    const baseDir = path.resolve(__dirname, '..');
    
    // If path starts with ../, treat it as relative to _tools directory
    if (inputPath.startsWith('../')) {
      return path.resolve(__dirname, inputPath);
    }
    
    // If path doesn't contain slashes, assume it's in the default directory
    if (!inputPath.includes('/') && !inputPath.includes('\\')) {
      // Handle case when defaultDir is undefined
      if (defaultDir === undefined) {
        return path.resolve(baseDir, inputPath);
      }
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
  console.log('\n=== Implementation Patterns Generation ===');
  console.log(`Project: ${productName} (${productAbbrev})`);
  console.log('==========================================\n');
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

// Get all required paths for implementation patterns generation
async function getReferencePaths(projectAbbrev) {
  const paths = {
    template: await getValidFilePath(
      'Implementation Patterns Prompt Template',
      '_prompt_engineering/05-product-implementation-patterns-prompt_v1.md',
      projectAbbrev
    ),
    implementationTemplate: await getValidFilePath(
      'Implementation Patterns Template',
      '_templates/05-implementation-patterns-template.md',
      projectAbbrev
    ),
    structure: await getValidFilePath(
      'Structure Specification',
      `04-${projectAbbrev}-structure.md`,
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
      `_examples/05-${projectAbbrev}-implementation-patterns.md`,
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
    'Output Implementation Patterns File',
    `05-${projectAbbrev}-implementation-patterns.md`,
    projectAbbrev
  );
  
  // Save to cache
  savePathCache(projectAbbrev, paths);
  
  return { paths, enableCodebase };
}

// Write the processed prompt to a file
function writePromptToFile(prompt, templatePath, projectAbbrev) {
  try {
    // Calculate output path
    const outputDir = path.resolve(__dirname, '..', '_prompt_engineering', 'output-prompts');
    ensureDirectoryExists(outputDir);
    
    const templateFileName = path.basename(templatePath);
    const outputFileName = templateFileName.replace('.md', `-output.md`);
    const outputPath = path.join(outputDir, outputFileName);
    
    // Write the file
    fs.writeFileSync(outputPath, prompt);
    
    console.log(`\nPrompt successfully generated and saved to: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Error writing prompt to file:', error);
    return null;
  }
}

// Generate the implementation patterns prompt by replacing variables in the template
async function generateImplementationPatternsPrompt(pathsData, projectName, projectAbbrev) {
  try {
    const { paths, enableCodebase } = pathsData;
    
    // Read the template file
    const templatePath = normalizePath(paths.template);
    let templateContent = fs.readFileSync(templatePath, 'utf-8');
    
    // Extract project summary from overview
    let projectSummary = "";
    try {
      const overview = fs.readFileSync(normalizePath(paths.overview, ''), 'utf-8');
      // Get just the "## Product Summary" section, without "& Value Proposition"
      const summaryMatch = overview.match(/## Product Summary(?:.*?)(?:\r?\n)([\s\S]+?)(?=##|$)/i);
      if (summaryMatch && summaryMatch[1]) {
        projectSummary = summaryMatch[1].trim();
      } else {
        // If we still couldn't find it, try another approach
        const altSummaryMatch = overview.match(/## Product Summary([\s\S]+?)(?=##|$)/i);
        if (altSummaryMatch && altSummaryMatch[1]) {
          projectSummary = altSummaryMatch[1].trim();
        } else {
          projectSummary = `${projectName} is a project focused on modern software development practices.`;
        }
      }
    } catch (error) {
      console.warn('Could not extract project summary from overview:', error.message);
      projectSummary = `${projectName} is a project focused on modern software development practices.`;
    }
    
    // Build a dictionary of replacements
    const replacements = {
      '{{PROJECT_NAME}}': projectName,
      '{{PROJECT_SUMMARY}}': projectSummary,
      '{IMPLEMENTATION_TEMPLATE_PATH}': toLLMPath(normalizePath(paths.implementationTemplate, '')),
      '{STRUCTURE_PATH}': toLLMPath(normalizePath(paths.structure, '')),
      '{OVERVIEW_PATH}': toLLMPath(normalizePath(paths.overview, '')),
      '{USER_STORIES_PATH}': toLLMPath(normalizePath(paths.userStories, '')),
      '{FUNCTIONAL_REQUIREMENTS_PATH}': toLLMPath(normalizePath(paths.functionalRequirements, '')),
      '{REFERENCE_EXAMPLE_PATH}': toLLMPath(normalizePath(paths.example, '')),
      '{OUTPUT_PATH}': toLLMPath(normalizePath(paths.outputPath, ''))
    };
    
    // Handle conditional sections for codebase review
    const regex = /\[\[\s*if\s+current_status\.enabled\s*\]\]([\s\S]*?)\[\[\s*endif\s*\]\]/g;
    
    if (enableCodebase) {
      replacements['{CODEBASE_REVIEW_PATH}'] = toLLMPath(normalizePath(paths.codebase, ''));
      // Enable the conditional section by removing the conditional markers
      templateContent = templateContent.replace(regex, (match, conditionalContent) => {
        return conditionalContent;
      });
    } else {
      // Remove the conditional sections entirely
      templateContent = templateContent.replace(regex, '');
    }
    
    // Apply all replacements
    let processedContent = templateContent;
    for (const [key, value] of Object.entries(replacements)) {
      processedContent = processedContent.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    }
    
    // Write the processed prompt to a file
    const outputPath = writePromptToFile(processedContent, templatePath, projectAbbrev);
    
    return {
      success: true,
      outputPath,
      content: processedContent
    };
  } catch (error) {
    console.error('Error generating implementation patterns prompt:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function main() {
  try {
    // Check for command line arguments
    if (process.argv.length < 4) {
      console.log('\nUsage: node 05-generate-implementation-patterns.js "Project Name" project-abbrev');
      console.log('Example: node 05-generate-implementation-patterns.js "Next.js 14 Modernization" aplio-mod-1\n');
      process.exit(1);
    }
    
    const projectName = process.argv[2];
    const projectAbbrev = process.argv[3];
    
    // Display header
    displayHeader(projectName, projectAbbrev);
    
    // Get all required paths
    const pathsData = await getReferencePaths(projectAbbrev);
    
    // Generate the implementation patterns prompt
    console.log('\nGenerating implementation patterns prompt...');
    const result = await generateImplementationPatternsPrompt(pathsData, projectName, projectAbbrev);
    
    if (result.success) {
      console.log('\nImplementation patterns prompt generated successfully!');
      console.log(`\nNext steps:`);
      console.log(`1. Review the generated prompt at: ${result.outputPath}`);
      console.log(`2. Use the prompt with your preferred AI to generate the implementation patterns document`);
      console.log(`3. Save the AI's response to: ${toLLMPath(normalizePath(pathsData.paths.outputPath, ''))}`);
    } else {
      console.error(`\nError generating implementation patterns prompt: ${result.error}`);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  } finally {
    // Close the readline interface
    rl.close();
  }
}

// Run the main function
main(); 