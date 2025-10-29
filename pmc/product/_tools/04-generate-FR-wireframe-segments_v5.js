/**
 * FR Wireframe Prompt Generator (v5)
 *
 * - Uses v4 generator template: product/_prompt_engineering/04-FR-with-wireframes-create-tasks_v1.md
 * - NEW: Uses execution template: product/_prompt_engineering/04-FR-with-wireframes-execution-prompts_v1.md
 * - For each section E[XX], extracts all FR IDs (e.g., FR1.1.0, FR1.2.0, FR1.3.0)
 * - Generates a generator prompt per FR by replacing all placeholders:
 *   [FR_NUMBER_PLACEHOLDER], [STAGE_NAME_PLACEHOLDER], [MINIMUM_PAGE_COUNT_PLACEHOLDER],
 *   [SECTION_ID_PLACEHOLDER], [FR_LOCATE_FILE_PATH_PLACEHOLDER], [FR_LOCATE_LINE_PLACEHOLDER],
 *   [OUTPUT_FILE_PATH_PLACEHOLDER]
 * - Appends all FR generator prompts for a section into one file:
 *   product/_mapping/fr-maps/prompts/04-FR-wireframes-prompt-E[XX].md
 * - NEW: Generates execution prompts for each section:
 *   product/_mapping/fr-maps/prompts/04-FR-with-wireframes-execution-prompts_v1.md
 * - Computes the starting line number for each FR block within that file and injects it
 * - Enforces the final Figma prompt output path per section:
 *   product/_mapping/fr-maps/04-bmo-FR-wireframes-output-E[XX].md
 */

const fs = require('fs');
const path = require('path');

function resolveProjectPath(relativePath) {
  const scriptDir = __dirname; // .../pmc/product/_tools
  const projectRoot = path.resolve(scriptDir, '../..');
  return path.join(projectRoot, relativePath);
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

function parseFunctionalRequirementsFile(requirementsContent) {
  const lines = requirementsContent.split(/\r?\n/);
  const sections = {};
  let currentSection = null;
  let currentContent = [];
  let inHeader = true;
  let headerContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (/^##\s+\d+\.\s+.+$/.test(trimmed)) {
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n');
        currentContent = [];
      } else {
        inHeader = false;
        headerContent = lines.slice(0, i);
      }
      const sectionNumber = trimmed.match(/^##\s+(\d+)\./)[1];
      currentSection = `E${sectionNumber.padStart(2, '0')}`;
      currentContent.push(line);
    } else if (currentSection) {
      currentContent.push(line);
    } else if (inHeader) {
      headerContent.push(line);
    }
  }
  if (currentSection) sections[currentSection] = currentContent.join('\n');
  sections['header'] = headerContent.join('\n');
  return sections;
}

function extractSectionHeader(sectionContent) {
  const lines = sectionContent.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^##\s+\d+\.\s+.+$/.test(trimmed)) return trimmed;
  }
  return 'Unknown Section';
}

function getSectionNumberAndTitle(sectionHeader) {
  const m = sectionHeader.match(/^##\s+(\d+)\.\s+(.+)$/);
  if (!m) return { number: '0', title: 'Unknown' };
  return { number: m[1], title: m[2] };
}

function parseFRList(sectionContent) {
  // Matches lines like: - **FR1.1.0:**
  const frRegex = /\*\*(FR\d+\.\d+\.\d+)\:\*\*/g;
  const result = [];
  let match;
  while ((match = frRegex.exec(sectionContent)) !== null) {
    result.push(match[1]);
  }
  return Array.from(new Set(result));
}

function countLines(str) {
  if (!str) return 0;
  return str.split('\n').length;
}

// Load journey mapping data
const journeyMapping = require('../_mapping/journey-to-wireframe-mapping.json');

function enhancePromptWithJourney(prompt, stageNumber) {
  const stageData = journeyMapping[`stage${stageNumber}`];
  
  if (!stageData) return prompt;
  
  // Insert journey context into prompt
  const journeySection = `
### Journey-Informed Design Elements
- User Goals: ${stageData.goals.join(', ')}
- Emotional Requirements: ${stageData.emotions.join(', ')}
- Progressive Disclosure:
  * Basic: ${stageData.progressive.level1}
  * Advanced: ${stageData.progressive.level2}
  * Expert: ${stageData.progressive.level3}
- Success Indicators: ${stageData.success.join(', ')}
  `;
  
  // Insert after Context Summary
  return prompt.replace(
    /Context Summary[\s\S]*?(?=Wireframe Goals)/,
    `$&\n${journeySection}\n`
  );
}

function fillTemplateForFR(template, params) {
  const {
    frNumber,
    sectionId,
    stageName,
    minPageCount,
    frLocateFilePath,
    frLocateLineNumber,
    outputFilePath,
    journeyStageNumber,
    productAbbreviation,
    sectionNumber,
    previousSectionId,
  } = params;

  let out = template;

  // Replace new variables first
  out = out.replace(/\[prod-abbr\]/g, productAbbreviation);
  out = out.replace(/\[XX\]/g, sectionNumber);
  out = out.replace(/\[PREVIOUS_SECTION_ID\]/g, previousSectionId || 'N/A');

  // Replace existing variables
  out = out.replace(/\[FR_NUMBER_PLACEHOLDER\]/g, frNumber);
  out = out.replace(/\[STAGE_NAME_PLACEHOLDER\]/g, stageName);
  out = out.replace(/\[MINIMUM_PAGE_COUNT_PLACEHOLDER\]/g, String(minPageCount));
  out = out.replace(/\[SECTION_ID_PLACEHOLDER\]/g, sectionId);
  out = out.replace(/\[FR_LOCATE_FILE_PATH_PLACEHOLDER\]/g, frLocateFilePath);
  out = out.replace(/\[FR_LOCATE_LINE_PLACEHOLDER\]/g, String(frLocateLineNumber));
  out = out.replace(/\[JOURNEY_STAGE_NUMBER\]/g, String(journeyStageNumber));

  // Safety second pass
  out = out.replace(/\[prod-abbr\]/g, productAbbreviation);
  out = out.replace(/\[XX\]/g, sectionNumber);
  out = out.replace(/\[PREVIOUS_SECTION_ID\]/g, previousSectionId || 'N/A');
  out = out.replace(/\[FR_NUMBER_PLACEHOLDER\]/g, frNumber);
  out = out.replace(/\[STAGE_NAME_PLACEHOLDER\]/g, stageName);
  out = out.replace(/\[MINIMUM_PAGE_COUNT_PLACEHOLDER\]/g, String(minPageCount));
  out = out.replace(/\[SECTION_ID_PLACEHOLDER\]/g, sectionId);
  out = out.replace(/\[FR_LOCATE_FILE_PATH_PLACEHOLDER\]/g, frLocateFilePath);
  out = out.replace(/\[FR_LOCATE_LINE_PLACEHOLDER\]/g, String(frLocateLineNumber));
  out = out.replace(/\[JOURNEY_STAGE_NUMBER\]/g, String(journeyStageNumber));

  return out;
}

function generateExecutionPromptForSection(sectionId, sectionContent, executionTemplate, promptsOutputDir, productAbbreviation) {
  const sectionHeader = extractSectionHeader(sectionContent);
  const { number: stageNumber, title: stageTitle } = getSectionNumberAndTitle(sectionHeader);
  const stageName = `Stage ${stageNumber} — ${stageTitle}`;

  // Extract section number from sectionId (e.g., "E01" -> "01")
  const sectionNumber = sectionId.replace(/^E/, '');
  
  // Calculate previous section ID (e.g., "E02" -> "E01")
  const currentSectionNum = parseInt(sectionNumber);
  const previousSectionId = currentSectionNum > 1 ? `E${String(currentSectionNum - 1).padStart(2, '0')}` : null;

  const frList = parseFRList(sectionContent);
  if (frList.length === 0) {
    console.warn(`No FRs found in ${sectionId}. Skipping execution prompt generation for this section.`);
    return;
  }

  const executionFilePath = path.join(promptsOutputDir, `04-FR-wireframes-execution-prompt-${sectionId}.md`);

  // Fill template with section-specific variables
  let filled = fillTemplateForFR(executionTemplate, {
    frNumber: frList.join(', '), // Include all FRs for this section
    sectionId,
    stageName,
    minPageCount: 3,
    frLocateFilePath: `pmc/product/_mapping/fr-maps/prompts/04-FR-wireframes-prompt-${sectionId}.md`,
    frLocateLineNumber: 1,
    outputFilePath: `pmc/product/_mapping/fr-maps/04-${productAbbreviation}-${sectionNumber}-task-list_v2.md`,
    journeyStageNumber: stageNumber,
    productAbbreviation,
    sectionNumber,
    previousSectionId,
  });

  // Enhance with journey data
  try {
    filled = enhancePromptWithJourney(filled, parseInt(stageNumber));
  } catch (error) {
    console.warn(`Could not enhance execution prompt for ${sectionId} with journey data:`, error.message);
  }

  fs.writeFileSync(executionFilePath, filled, { encoding: 'utf-8' });
  console.log(`Wrote execution prompt: ${executionFilePath}`);
}

function generatePromptsForSection(sectionId, sectionContent, promptTemplate, promptsOutputDir, productAbbreviation) {
  const sectionHeader = extractSectionHeader(sectionContent);
  const { number: stageNumber, title: stageTitle } = getSectionNumberAndTitle(sectionHeader);
  const stageName = `Stage ${stageNumber} — ${stageTitle}`;
  const minPageCount = 3;

  // Extract section number from sectionId (e.g., "E01" -> "01")
  const sectionNumber = sectionId.replace(/^E/, '');

  const frList = parseFRList(sectionContent);
  if (frList.length === 0) {
    console.warn(`No FRs found in ${sectionId}. Skipping prompt generation for this section.`);
    return;
  }

  const combinedFilePath = path.join(promptsOutputDir, `04-FR-wireframes-prompt-${sectionId}.md`);
  const frLocateFilePath = `pmc/product/_mapping/fr-maps/prompts/04-FR-wireframes-prompt-${sectionId}.md`;
  const outputFilePath = `pmc/product/_mapping/fr-maps/04-${productAbbreviation}-${sectionNumber}-task-list_v2.md`;

  let combined = '';
  const separator = '\n\n';

  for (const frNumber of frList) {
    // Compute starting line number for this FR block (cover line is the first line of the block)
    const cover = `# ${frNumber} — Wireframe Generator Prompt (v4)\n\n`;
    const frStartLine = countLines(combined) + 1; // 1-based

    let filled = fillTemplateForFR(promptTemplate, {
      frNumber,
      sectionId,
      stageName,
      minPageCount,
      frLocateFilePath,
      frLocateLineNumber: frStartLine,
      outputFilePath,
      journeyStageNumber: stageNumber,
      productAbbreviation,
      sectionNumber,
    });

    // Enhance with journey data
    try {
      filled = enhancePromptWithJourney(filled, parseInt(stageNumber));
    } catch (error) {
      console.warn(`Could not enhance ${frNumber} with journey data:`, error.message);
    }

    combined += cover + filled + separator;
  }

  fs.writeFileSync(combinedFilePath, combined.trim() + '\n', { encoding: 'utf-8' });
  console.log(`Wrote combined generator prompts with line numbers: ${combinedFilePath}`);
}

function generateUIFunctionalRequirementsSegmentsV5(projectName, projectAbbreviation) {
  const functionalRequirementsFileName = `03-${projectAbbreviation}-functional-requirements.md`;
  const functionalRequirementsFilePath = resolveProjectPath(`product/${functionalRequirementsFileName}`);
  const promptTemplatePath = resolveProjectPath(`product/_prompt_engineering/04-FR-with-wireframes-create-tasks_v1.md`);
  const executionTemplatePath = resolveProjectPath(`product/_prompt_engineering/04-FR-with-wireframes-execution-prompts_v1.md`);

  const outputDir = resolveProjectPath(`product/_mapping/fr-maps`);
  const promptsOutputDir = path.join(outputDir, 'prompts');

  ensureDirectoryExists(outputDir);
  ensureDirectoryExists(promptsOutputDir);

  if (!fs.existsSync(functionalRequirementsFilePath)) {
    console.error(`Error: Functional requirements file not found at ${functionalRequirementsFilePath}`);
    process.exit(1);
  }
  if (!fs.existsSync(promptTemplatePath)) {
    console.error(`Error: Prompt template not found at ${promptTemplatePath}`);
    process.exit(1);
  }
  if (!fs.existsSync(executionTemplatePath)) {
    console.error(`Error: Execution template not found at ${executionTemplatePath}`);
    process.exit(1);
  }

  const functionalRequirementsContent = fs.readFileSync(functionalRequirementsFilePath, 'utf-8');
  const promptTemplate = fs.readFileSync(promptTemplatePath, 'utf-8');
  const executionTemplate = fs.readFileSync(executionTemplatePath, 'utf-8');

  const sections = parseFunctionalRequirementsFile(functionalRequirementsContent);

  for (const [sectionId, sectionContent] of Object.entries(sections)) {
    if (sectionId === 'header') continue;

    const sectionHeader = extractSectionHeader(sectionContent);
    console.log(`Processing section: ${sectionId} - ${sectionHeader}`);

    // Generate task creation prompts (existing functionality)
    generatePromptsForSection(sectionId, sectionContent, promptTemplate, promptsOutputDir, projectAbbreviation);
    
    // Generate execution prompts (new functionality)
    generateExecutionPromptForSection(sectionId, sectionContent, executionTemplate, promptsOutputDir, projectAbbreviation);
  }

  console.log(`\nGeneration complete for project: ${projectName} (${projectAbbreviation})`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Prompts directory: ${promptsOutputDir}`);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.error('Usage: node product/_tools/04-generate-FR-wireframe-segments_v5.js "<Project Name>" <project-abbreviation>');
    console.error('Example:');
    console.error('  node product/_tools/04-generate-FR-wireframe-segments_v5.js "Bright Run LoRA Fine-Tuning Training Data Platform" bmo');
    process.exit(1);
  }
  const [projectName, projectAbbreviation] = args;
  generateUIFunctionalRequirementsSegmentsV5(projectName, projectAbbreviation);
}

module.exports = {
  generateUIFunctionalRequirementsSegmentsV5,
  parseFunctionalRequirementsFile,
  extractSectionHeader,
  getSectionNumberAndTitle,
  parseFRList,
  fillTemplateForFR,
  generatePromptsForSection,
  generateExecutionPromptForSection,
};