/**
 * ## Task File Initialization
 * 
 * ### 1. Task Mirroring the Functional Requirements
 * Copy each Functional Requirement from pmc\product\03-[project-abbreviation]-functional-requirements.md
 * into a new file: pmc\product\06-[product-abbreviation]-tasks.md
 * 
 * Every single Functional Requirement shall become a Task in pmc\product\06-[product-abbreviation]-tasks.md.
 * Every single FR[X.Y.Z] shall be come a T-[X.Y.Z]
 * 
 * Each task shall be given the initial task metadata block. The initial task metadata block shall be given the following format:
 * ### T-[X.Y.Z.N]: Task Name
 * - **FR Reference**: Maps to functional requirement  
 */

const fs = require('fs');
const path = require('path');

/**
 * Generate functional requirements from user stories
 * @param {string} projectName - The full project name
 * @param {string} projectAbbreviation - The project abbreviation
 */
function generateFunctionalRequirements(projectName, projectAbbreviation) {
    projectName = projectName.replace(/-/g, ' ');

    const usFilePath = path.join(__dirname, '..', `02-${projectAbbreviation}-user-stories.md`);
    const frFilePath = path.join(__dirname, '..', `03-${projectAbbreviation}-functional-requirements.md`);

    try {
        if (!fs.existsSync(usFilePath)) {
            console.error(`User stories file not found: ${usFilePath}`);
            process.exit(1);
        }

        // Read the user stories file
        const usContent = fs.readFileSync(usFilePath, 'utf8');

        // Generate header
        const currentDate = new Date().toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });

        let frContent = generateHeader(projectName, projectAbbreviation, currentDate);

        // Parse and transform content
        const sections = parseAndTransformContent(usContent);
        
        // Generate FR content in the required format
        frContent += formatFRContent(sections);

        // Add document sections
        frContent += generateDocumentSections();

        // Write to FR file
        fs.writeFileSync(frFilePath, frContent);
        console.log(`Successfully generated ${frFilePath}`);

    } catch (error) {
        console.error('Error generating functional requirements:', error);
        process.exit(1);
    }
}

function generateHeader(projectName, projectAbbreviation, date) {
    return `# ${projectName} - Functional Requirements
**Version:** 1.0.0  
**Date:** ${date}  
**Category:** Design System Platform
**Product Abbreviation:** ${projectAbbreviation}

**Source References:**
- Seed Story: \`pmc\\product\\00-${projectAbbreviation}-seed-story.md\`
- Overview Document: \`pmc\\product\\01-${projectAbbreviation}-overview.md\`
- User Stories: \`pmc\\product\\02-${projectAbbreviation}-user-stories.md\`\n\n`;
}

function parseAndTransformContent(content) {
    const sections = [];
    let currentSection = null;
    
    // Split content into lines and process
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Match section headers
        const sectionMatch = line.match(/^###\s+(.+)$/);
        if (sectionMatch && !line.startsWith('####')) {
            if (currentSection) {
                sections.push(currentSection);
            }
            currentSection = {
                name: sectionMatch[1],
                stories: []
            };
            continue;
        }

        // Match user story blocks
        if (line.startsWith('- **US')) {
            let story = {
                content: [],
                id: line.match(/US(\d+\.\d+\.\d+)/)[1]
            };
            
            // Collect all lines until next story or section
            while (i < lines.length && !lines[i + 1]?.trim().startsWith('- **US') && !lines[i + 1]?.trim().startsWith('###')) {
                story.content.push(lines[i].trim());
                i++;
            }
            
            if (currentSection) {
                currentSection.stories.push(story);
            }
        }
    }
    
    if (currentSection) {
        sections.push(currentSection);
    }
    
    return sections;
}

function formatFRContent(sections) {
    let content = '';
    const usedSectionNames = new Map(); // Map section names to their numbers
    
    // First pass: determine section numbers based on FR numbers
    sections.forEach(section => {
        if (section.stories.length === 0) return;
        
        // Get the major version numbers from all stories in this section
        const majorVersions = section.stories.map(story => parseInt(story.id.split('.')[0]));
        // Use the most common major version for this section
        const versionCounts = new Map();
        let maxCount = 0;
        let dominantVersion = majorVersions[0];
        
        majorVersions.forEach(version => {
            const count = (versionCounts.get(version) || 0) + 1;
            versionCounts.set(version, count);
            if (count > maxCount) {
                maxCount = count;
                dominantVersion = version;
            }
        });
        
        // If this section name already exists with a different number
        if (usedSectionNames.has(section.name)) {
            const existingNumber = usedSectionNames.get(section.name);
            if (existingNumber !== dominantVersion) {
                // Append a unique identifier to the section name
                section.name = `${section.name} (${dominantVersion})`;
            }
        }
        usedSectionNames.set(section.name, dominantVersion);
    });
    
    // Second pass: generate content
    sections.forEach(section => {
        if (section.stories.length === 0) return;
        
        const sectionNumber = usedSectionNames.get(section.name);
        content += `## ${sectionNumber}. ${section.name}\n\n`;
        
        // Sort stories by their ID to ensure consistent ordering
        const sortedStories = [...section.stories].sort((a, b) => {
            const [aMajor, aMinor, aPatch] = a.id.split('.').map(Number);
            const [bMajor, bMinor, bPatch] = b.id.split('.').map(Number);
            
            if (aMajor !== bMajor) return aMajor - bMajor;
            if (aMinor !== bMinor) return aMinor - bMinor;
            return aPatch - bPatch;
        });
        
        sortedStories.forEach(story => {
            // Extract story details using regex
            const storyContent = story.content.join('\n');
            const titleMatch = storyContent.match(/\*\*US[\d.]+:\s+([^*]+)\*\*/);
            const impactMatch = storyContent.match(/\*\*Impact Weighting\*\*:\s+([^\n]+)/);
            const priorityMatch = storyContent.match(/\*\*Priority\*\*:\s+([^\n]+)/);
            
            // Extract acceptance criteria, excluding the Priority line
            const acceptanceCriteriaSection = storyContent.match(/\*\*Acceptance Criteria\*\*:\n((?:\s*-[^\n]+\n)*)/);
            const acceptanceCriteria = acceptanceCriteriaSection ? acceptanceCriteriaSection[1]
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.startsWith('-') && !line.includes('**Priority**:') && !line.includes('**FR Mapping**:'))
                .map(line => `    ${line}`)
                .join('\n') : '';
            
            // Format in the required order
            content += `- **FR${story.id}:** ${titleMatch ? titleMatch[1].trim() : '[Title Missing]'}\n`;
            content += `  * Description: [To be filled]\n`;
            content += `  * Impact Weighting: ${impactMatch ? impactMatch[1].trim() : '[To be filled]'}\n`;
            content += `  * Priority: ${priorityMatch ? priorityMatch[1].trim() : '[To be filled]'}\n`;
            content += `  * User Stories: US${story.id}\n`;
            content += `  * Tasks: [T-${story.id}]\n`;
            
            // Format acceptance criteria
            content += `  * User Story Acceptance Criteria:\n`;
            if (acceptanceCriteria) {
                content += acceptanceCriteria + '\n';
            } else {
                content += `    - [No acceptance criteria found]\n`;
            }
            
            // Add FR acceptance criteria
            content += `  * Functional Requirements Acceptance Criteria:\n`;
            content += `    - [To be filled]\n\n`;
        });
    });
    
    return content;
}

function generateDocumentSections() {
    return `
## Document Purpose
1. Break down User Stories into manageable functional requirements
2. Define clear acceptance criteria for each requirement
3. Maintain traceability between requirements, user stories, and tasks
4. Provide clear "WHAT" specifications for task generation
5. Enable validation of feature completeness against user needs

## Requirement Guidelines
1. Each requirement should map to one or more user stories
2. Requirements should focus on WHAT, not HOW
3. Both User Story and Functional Requirements acceptance criteria should be measurable
4. Technical details belong in the task specifications
5. Requirements should be understandable by non-technical stakeholders

## Document Generation Workflow
1. User Stories document is referenced
2. Functional Requirements are created based on stories
3. Implementation tasks are derived from requirements
4. Traceability is maintained across all artifacts
5. Requirements are validated against both sets of acceptance criteria

## Requirement Mapping Guide
1. Each requirement has a unique identifier (FR[X.Y.Z])
2. Requirements map to one or more user stories (US[X.Y.Z])
3. Requirements map to one or more tasks (T[X.Y.Z])
4. Requirements break down into specific tasks
5. Quality metrics are defined for validation

## Requirement Structure Guide
1. Description: Clear statement of what the feature should do
2. Impact Weighting: Business impact category
3. Priority: Implementation priority level
4. User Stories: Mapping to source user stories
5. Tasks: Mapping to implementation tasks
6. User Story Acceptance Criteria: Original criteria from user story
7. Functional Requirements Acceptance Criteria: Additional specific criteria for implementation
`;
}

// Check command line arguments
if (process.argv.length < 4) {
    console.error('Please provide project name and abbreviation');
    console.error('Usage: node 03-generate-FR-initial.js "Project Name" project-abbreviation');
    process.exit(1);
}

const projectName = process.argv[2];
const projectAbbreviation = process.argv[3];

generateFunctionalRequirements(projectName, projectAbbreviation); 