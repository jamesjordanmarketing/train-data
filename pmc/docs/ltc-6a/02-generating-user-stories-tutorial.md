# Generating User Stories in PMC
**Document:** `pmc/product/02-[project-abbreviation]-user-stories.md`  
**Generator:** `pmc/product/_tools/01-02-generate-product-specs.js`  
**Prompt:** `pmc/product/_prompt_engineering/product-user-stories-prompt-template_v1.md`

## Overview
This tutorial explains how to generate comprehensive user stories for a PMC project. The user stories document is a critical foundation that maps stakeholder needs to functional requirements.

## Prerequisites
1. Completed seed story (`00-[project-abbreviation]-seed-story.md`)
2. Completed overview document (`01-[project-abbreviation]-overview.md`)
3. User stories template in `_templates` directory

## Generation Process

### 1. Generator Script Setup
The script `01-02-generate-product-specs.js` requires:
- Project name
- Project abbreviation
- Project category
- Version
- Start date
- Last updated date

### 2. Input Files
The generator uses these input files:
1. **Template:** User stories template defining required format
2. **Seed Story:** Foundation story with stakeholder analysis
3. **Overview Document:** Technical details and implementation plans
4. **Example:** Reference for structure and quality expectations
5. **Current Status:** (Optional) Current codebase state if available

### 3. Prompt Structure
The prompt (`product-user-stories-prompt-template_v1.md`) instructs the AI to:
1. Act as a senior product manager specializing in SaaS requirements
2. Create granular user stories mapping to functional specifications
3. Ensure 100% feature coverage for high-end product design
4. Maintain alignment with business impact and strategic goals

### 4. Story Components
Each generated user story must include:
1. Unique identifier (USx.x.x) following hierarchical structure
2. Clear title reflecting story purpose
3. Affected role (specific stakeholder)
4. Standard format: "As a [role], I want [feature] so that [benefit]"
5. Impact Weighting (Revenue/Strategic/Operational)
6. Detailed acceptance criteria
7. Priority level (High/Medium/Low)
8. FR mapping placeholder

### 5. Quality Requirements
The generator ensures:
1. All stakeholder roles are represented
2. Stories are properly categorized
3. Impact weightings reflect business value
4. Acceptance criteria are specific and testable
5. Priorities reflect business and technical needs
6. Cross-cutting concerns are addressed
7. Stories align with project goals

### 6. Document Generation Workflow
1. User Stories document is generated first
2. Functional Requirements will be generated based on these stories
3. FR numbers will be mapped back to relevant user stories
4. Document will be updated with FR mappings
5. Bidirectional traceability is maintained

## Running the Generator

1. Navigate to the project root directory
2. Run the generator:
```bash
node pmc/product/_tools/01-02-generate-product-specs.js
```

3. The script will:
   - Load the prompt template
   - Replace variables with project-specific values
   - Generate the user stories document
   - Save to `pmc/product/02-[project-abbreviation]-user-stories.md`

## Output Format
The generated document follows this structure:
```markdown
# [Project Name] - User Stories
**Version:** [version]
**Date:** [date]
**Category:** [category]

## Categories
### [Category 1]
- **US[X.Y.Z]: [Descriptive Title]**
  - **Role**: [Specific Stakeholder Role]
  - *As a [role], I want [feature] so that [benefit]*
  - **Impact Weighting**: [Revenue/Strategic/Operational]
  - **Acceptance Criteria**:
    - [Criterion 1]
    - [Criterion 2]
  - **Priority**: [High/Medium/Low]
  - **FR Mapping**: [To be populated]
```

## Validation
After generation, verify:
1. All sections from seed story are covered
2. Each story has unique identifier
3. Acceptance criteria are testable
4. Impact weightings are appropriate
5. Stories are properly categorized
6. No duplicate story numbers exist

## Next Steps
1. Review generated stories for completeness
2. Validate against seed story and overview
3. Prepare for functional requirements generation
4. Document any manual adjustments needed

## Common Issues and Solutions
1. **Duplicate Story Numbers**
   - Each story must have unique number
   - Even similar stories need distinct identifiers

2. **Missing Stakeholders**
   - Cross-reference with seed story
   - Ensure all roles are represented

3. **Incomplete Acceptance Criteria**
   - Criteria must be specific and testable
   - Include measurable outcomes

4. **Incorrect Impact Weightings**
   - Align with business objectives
   - Consider long-term strategic impact 