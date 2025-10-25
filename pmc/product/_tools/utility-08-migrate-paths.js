#!/usr/bin/env node

/**
 * Full Path Migration Tool v1
 * 
 * This script updates absolute paths in specified project files when copying/moving
 * a project to a new location. It will search for up to three possible "from" paths
 * and replace them with a single "to" path.
 */

const fs = require('fs');
const path = require('path');

// ===================================================================
// CONFIGURATION - MODIFY THESE VALUES BEFORE RUNNING
// ===================================================================

// SOURCE PATHS - COPY AND PASTE DIRECTLY (no quotes or escape characters needed)
// Add up to 3 paths, leave empty if not needed
// ===================================================================
// FROM_PATH_1 (Required):
// C:\Users\james\Master\BrightHub\BRun\brun7\

// FROM_PATH_2 (Optional):
// C:\Users\james\Master\BrightHub\BRun\brun5a\

// FROM_PATH_3 (Optional):
// C:\Users\james\Master\BrightHub\PMC\Aplio-Design-System\aplio-27-a1-c\
// ===================================================================

// Convert the comments above into usable paths
const FROM_PATHS = [
  "C:\\Users\\james\\Master\\BrightHub\\BRun\\brun7\\",
  "C:\\Users\\james\\Master\\BrightHub\\BRun\\brun5a\\",
  "C:\\Users\\james\\Master\\BrightHub\\Build\\APSD-runs\\aplio-27-a1-c\\"
].filter(path => path.trim() !== "");

// ===================================================================
// DESTINATION PATH - COPY AND PASTE DIRECTLY
// ===================================================================
// TO_PATH:
// C:\Users\james\Master\BrightHub\BRun\brun8\
// ===================================================================

// Convert the comment above into a usable path
let TO_PATH = "C:\\Users\\james\\Master\\BrightHub\\BRun\\brun8\\";

// List of files to check and update (relative to script execution path)
const FILES_TO_UPDATE = [
  "pmc\\product\\06-bmo-tasks.md",
  "pmc\\product\\07b-task-bmo-testing-built.md",
  "pmc\\product\\06b-bmo-tasks-built.md",
  "pmc\\core\\active-task.md",
  "pmc\\core\\active-task-unit-tests.md",
  "pmc\\system\\templates\\active-task-template-2.md",
  "pmc\\system\\templates\\active-task-test-template.md",
  "pmc\\system\\coding-prompts\\03-conductor-test-prompt.md",
  "pmc\\product\\_prompt_engineering\\06a-product-task-elements-breakdown-prompt-v5.7.md",
  "pmc\\product\\_prompt_engineering\\06a-product-task-elements-breakdown-prompt-v6.0-v5.md",
  "pmc\\product\\_prompt_engineering\\06a-product-task-elements-breakdown-prompt-v5.4-production-backup.md",
  "pmc\\product\\_prompt_engineering\\06b-task-test-mapping-creation-prompt-v3.md",
  "pmc\\product\\_prompt_engineering\\06d-product-task-test-components-prompt.md",      
  "pmc\\product\\_prompt_engineering\\06e-task-sequencing-analysis-only-prompt.md",
  "pmc\\product\\_mapping\\task-file-maps\\6-bmo-tasks-E01.md",
  "pmc\\product\\_mapping\\task-file-maps\\6-bmo-tasks-E02.md",
  "pmc\\product\\_mapping\\task-file-maps\\6-bmo-tasks-E03.md",
  "pmc\\product\\_mapping\\task-file-maps\\6-bmo-tasks-E04.md",
  "pmc\\product\\_mapping\\task-file-maps\\6-bmo-tasks-E05.md",
  "pmc\\product\\_mapping\\task-file-maps\\6-bmo-tasks-E06.md",
  "pmc\\product\\_mapping\\task-file-maps\\6-bmo-tasks-E07.md",
  "pmc\\product\\_mapping\\task-file-maps\\6-bmo-tasks-E08.md",
  "pmc\\product\\_mapping\\task-file-maps\\6-bmo-tasks-E09.md",
  "pmc\\product\\_mapping\\task-file-maps\\prompts\\06a-product-task-elements-breakdown-prompt-v5.4-E01.md",
  "pmc\\product\\_mapping\\task-file-maps\\prompts\\06a-product-task-elements-breakdown-prompt-v5.4-E02.md",
  "pmc\\product\\_mapping\\task-file-maps\\prompts\\06a-product-task-elements-breakdown-prompt-v5.4-E03.md",
  "pmc\\product\\_mapping\\task-file-maps\\prompts\\06a-product-task-elements-breakdown-prompt-v5.4-E04.md",
  "pmc\\product\\_mapping\\task-file-maps\\prompts\\06a-product-task-elements-breakdown-prompt-v5.4-E05.md",
  "pmc\\product\\_mapping\\task-file-maps\\prompts\\06a-product-task-elements-breakdown-prompt-v5.4-E06.md",
  "pmc\\product\\_mapping\\task-file-maps\\prompts\\06a-product-task-elements-breakdown-prompt-v5.4-E07.md",
  "pmc\\product\\_mapping\\task-file-maps\\prompts\\06a-product-task-elements-breakdown-prompt-v5.4-E08.md",
  "pmc\\product\\_mapping\\task-file-maps\\prompts\\06a-product-task-elements-breakdown-prompt-v5.4-E09.md",
  "pmc\\product\\_mapping\\test-maps\\prompts\\06b-task-test-mapping-creation-prompt-v3-E01.md",
  "pmc\\product\\_mapping\\test-maps\\prompts\\06b-task-test-mapping-creation-prompt-v3-E02.md",
  "pmc\\product\\_mapping\\test-maps\\prompts\\06b-task-test-mapping-creation-prompt-v3-E03.md",
  "pmc\\product\\_mapping\\test-maps\\prompts\\06b-task-test-mapping-creation-prompt-v3-E04.md",
  "pmc\\product\\_mapping\\test-maps\\prompts\\06b-task-test-mapping-creation-prompt-v3-E05.md",
  "pmc\\product\\_mapping\\test-maps\\prompts\\06b-task-test-mapping-creation-prompt-v3-E06.md",
  "pmc\\product\\_mapping\\test-maps\\prompts\\06b-task-test-mapping-creation-prompt-v3-E07.md",
  "pmc\\product\\_mapping\\test-maps\\prompts\\06b-task-test-mapping-creation-prompt-v3-E08.md",
  "pmc\\product\\_mapping\\test-maps\\prompts\\06b-task-test-mapping-creation-prompt-v3-E09.md",
  "pmc\\product\\_mapping\\test-maps\\06-bmo-task-test-mapping-E01.md",
  "pmc\\product\\_mapping\\test-maps\\06-bmo-task-test-mapping-E02.md",
  "pmc\\product\\_mapping\\test-maps\\06-bmo-task-test-mapping-E03.md",
  "pmc\\product\\_mapping\\test-maps\\06-bmo-task-test-mapping-E04.md",
  "pmc\\product\\_mapping\\test-maps\\06-bmo-task-test-mapping-E05.md",
  "pmc\\product\\_mapping\\test-maps\\06-bmo-task-test-mapping-E06.md",
  "pmc\\product\\_mapping\\test-maps\\06-bmo-task-test-mapping-E07.md",
  "pmc\\product\\_mapping\\test-maps\\06-bmo-task-test-mapping-E08.md",
  "pmc\\product\\_mapping\\test-maps\\06-bmo-task-test-mapping-E09.md",
  "pmc\\product\\_prompt_engineering\\output-prompts\\3a-preprocess-functional-requirements-prompt_v1-output.md",
  "pmc\\product\\_prompt_engineering\\output-prompts\\3b-#1-functional-requirements-prompt_v1-output.md",
  "pmc\\product\\_prompt_engineering\\output-prompts\\3b-#2-functional-requirements-prompt_v1-output.md",
  "pmc\\product\\_prompt_engineering\\output-prompts\\04-product-structure-prompt_v1-output.md",
  "pmc\\product\\_prompt_engineering\\output-prompts\\05-product-implementation-patterns-prompt_v1-output.md"
];

// Report file path
const REPORT_FILE_PATH = "pmc\\system\\management\\commits\\08-updated-file-paths.md";

// ===================================================================
// SCRIPT EXECUTION - DO NOT MODIFY BELOW THIS LINE
// ===================================================================

// Store results for reporting
const updatedFiles = [];
const missingFiles = [];
const failedFiles = [];

// Ensure all paths have trailing slashes for consistency
FROM_PATHS.forEach((fromPath, index) => {
  if (!fromPath.endsWith('\\')) {
    FROM_PATHS[index] = fromPath + '\\';
  }
});

if (!TO_PATH.endsWith('\\')) {
  TO_PATH = TO_PATH + '\\';
}

// Determine the base directory
// The script assumes it's being run from the root directory of the project
// (i.e., one level above pmc)
const baseDir = process.cwd();

// Determine if we need to adjust paths based on how the script is called
// Check if the baseDir already contains pmc
const isPMCDir = baseDir.includes('pmc');

console.log(`Script running from: ${baseDir}`);
console.log(`Detected as ${isPMCDir ? 'inside' : 'outside'} pmc directory`);

// Adjust the report file path based on where the script is being run from
let adjustedReportPath = REPORT_FILE_PATH;
if (isPMCDir && REPORT_FILE_PATH.startsWith('pmc\\')) {
  // If running from inside pmc, remove the prefix
  adjustedReportPath = REPORT_FILE_PATH.substring('pmc\\'.length);
  console.log(`Adjusted report path: ${adjustedReportPath}`);
}

/**
 * Process a single file, looking for and replacing old paths
 */
function processFile(filePath) {
  try {
    // Adjust the file path based on where the script is being run from
    let adjustedPath = filePath;
    if (isPMCDir && filePath.startsWith('pmc\\')) {
      // If running from inside pmc, remove the prefix
      adjustedPath = filePath.substring('pmc\\'.length);
      console.log(`Adjusted path: ${adjustedPath}`);
    }
    
    // Resolve the full path from the appropriate base directory
    const fullPath = path.resolve(baseDir, adjustedPath);
    console.log(`Processing file: ${fullPath}`);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      missingFiles.push(filePath);
      console.log(`File not found: ${fullPath}`);
      return;
    }

    // Read the file content
    let fileContent = fs.readFileSync(fullPath, 'utf8');
    let originalContent = fileContent;
    let wasUpdated = false;

    // Check if the file contains any of the FROM_PATHS
    FROM_PATHS.forEach((fromPath, index) => {
      // Create a regex that only matches absolute paths, not relative paths
      const regex = new RegExp(fromPath.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\[/g, '\\[').replace(/\]/g, '\\]'), 'g');
      
      if (fileContent.match(regex)) {
        fileContent = fileContent.replace(regex, TO_PATH);
        wasUpdated = true;
        console.log(`- Updated: File ${filePath} had paths from FROM_PATH_${index + 1} replaced`);
      }
    });

    // If the file was updated, write it back
    if (wasUpdated) {
      fs.writeFileSync(fullPath, fileContent, 'utf8');
      updatedFiles.push(filePath);
    }
  } catch (error) {
    failedFiles.push({ path: filePath, error: error.message });
    console.error(`Error processing file ${filePath}:`, error);
  }
}

/**
 * Generate a report of the path update operation
 */
function generateReport() {
  let report = `# Path Migration Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  report += `## Configuration\n\n`;
  report += `### From Paths:\n\n`;
  FROM_PATHS.forEach(fromPath => {
    report += `- \`${fromPath}\`\n`;
  });
  
  report += `\n### To Path:\n\n`;
  report += `- \`${TO_PATH}\`\n\n`;
  
  report += `## Results\n\n`;
  report += `### Updated Files (${updatedFiles.length})\n\n`;
  
  if (updatedFiles.length === 0) {
    report += `*No files were updated.*\n\n`;
  } else {
    updatedFiles.forEach(file => {
      report += `- \`${file}\`\n`;
    });
    report += `\n`;
  }
  
  report += `### Missing Files (${missingFiles.length})\n\n`;
  
  if (missingFiles.length === 0) {
    report += `*No files were missing.*\n\n`;
  } else {
    missingFiles.forEach(file => {
      report += `- \`${file}\`\n`;
    });
    report += `\n`;
  }
  
  report += `### Failed Files (${failedFiles.length})\n\n`;
  
  if (failedFiles.length === 0) {
    report += `*No files failed processing.*\n\n`;
  } else {
    failedFiles.forEach(file => {
      report += `- \`${file.path}\`: ${file.error}\n`;
    });
    report += `\n`;
  }
  
  // Create the report directory if it doesn't exist
  const reportFullPath = path.resolve(baseDir, adjustedReportPath);
  const reportDir = path.dirname(reportFullPath);
  console.log(`Creating report directory: ${reportDir}`);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  // Write the report file
  fs.writeFileSync(reportFullPath, report, 'utf8');
  console.log(`Report saved to ${reportFullPath}`);
}

/**
 * Main function to execute the path migration
 */
function main() {
  console.log('Starting path migration...');
  console.log(`Replacing paths:`);
  FROM_PATHS.forEach(fromPath => {
    console.log(`- ${fromPath}`);
  });
  console.log(`With: ${TO_PATH}`);
  console.log(`Processing ${FILES_TO_UPDATE.length} files...`);
  
  // Process each file
  FILES_TO_UPDATE.forEach(filePath => {
    processFile(filePath);
  });
  
  // Generate report
  generateReport();
  
  // Output summary
  console.log('\nMigration complete:');
  console.log(`- Updated: ${updatedFiles.length} files`);
  console.log(`- Missing: ${missingFiles.length} files`);
  console.log(`- Failed: ${failedFiles.length} files`);
  console.log(`See ${adjustedReportPath} for details.`);
}

// Run the script
main(); 