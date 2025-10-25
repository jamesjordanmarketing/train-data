# Generating Structure Specifications in PMC
**Document:** `pmc/product/04-[project-abbreviation]-structure.md`  
**Generator Script:** `pmc/product/_tools/04-generate-structure.js`  
**Structure Template:** `pmc/product/_templates/04-structure-specification-template.md`  
**Prompt Template:** `pmc/product/_prompt_engineering/04-product-structure-prompt_v1.md`

## Overview
This tutorial explains the process of generating a structure specification document in PMC. The structure document defines the architectural and component organization of your product, ensuring a clear and maintainable codebase.

## Prerequisites
Before generating the structure document, ensure you have:
1. Overview document (`01-[project-abbreviation]-overview.md`)
2. User stories (`02-[project-abbreviation]-user-stories.md`)
3. Functional requirements (`03-[project-abbreviation]-functional-requirements.md`)
4. Structure template in `_templates` directory
5. Reference example in `_examples` directory

## Generation Process

### 1. Generator Script Overview
The script `pmc\product\_tools\04-generate-structure.js`:
- Creates a structure specification prompt
- Integrates context from previous documents
- Maintains traceability to requirements and user stories
- Supports optional codebase review integration

### 2. Required Files
The script needs access to:
1. **Overview Document:** Project context and goals
2. **User Stories:** Core functionality and features
3. **Functional Requirements:** Detailed specifications
4. **Structure Template:** Document format and sections
5. **Reference Example:** Guide for structure organization

### 3. Running the Generator

Navigate to the tools directory and run:
```bash
node 04-generate-structure.js "Project Name" project-abbrev
```

Example:
```bash
node product/_tools/04-generate-structure.js "Aplio Design System Next.js 14 Modernization" aplio-mod-1
```

The script will:
1. Prompt for file paths (with defaults)
2. Ask about including codebase review
3. Generate the structure prompt
4. Save the output to `_prompt_engineering/output-prompts`

### 4. Prompt Generation Process

The script processes your inputs through several steps:
1. **Context Collection**
   - Reads overview for project summary
   - Maps user stories to components
   - Links functional requirements
   - Validates file paths and formats

2. **Template Processing**
   - Replaces variables in prompt template
   - Integrates file paths for AI context
   - Adds codebase review if enabled
   - Formats output for AI consumption

3. **Output Generation**
   - Creates prompt file in output directory
   - Includes all necessary context
   - Maintains file references
   - Preserves traceability

### 5. Creating the Structure Document

After generating the prompt:
1. Copy the contents of:
   `pmc/product/_prompt_engineering/output-prompts/04-product-structure-prompt_v1-output.md`

2. Submit to an AI model capable of:
   - Understanding complex software architecture
   - Processing multiple context documents
   - Generating detailed specifications
   - Maintaining consistency with requirements

3. Save the AI's response as:
   `pmc/product/04-[project-abbreviation]-structure.md`

## Output Format
The final structure document follows this format:
```markdown
# [Project Name] - Structure Specification
**Version:** [version]
**Date:** [date]
**Status:** [Draft/Review/Final]

## Overview
[Project architecture summary]

## Core Components
### [Component Name]
- **Purpose:** [Component's main responsibility]
- **Dependencies:** [Required components/libraries]
- **Key Features:**
  * [Feature 1]
  * [Feature 2]
- **Implementation Notes:**
  * [Technical considerations]
  * [Architecture decisions]
- **Related Requirements:** [FR references]
- **User Stories:** [US references]

## Integration Points
[System integration details]

## Development Guidelines
[Implementation standards and practices]
```

## Validation Checklist
After generation, verify:
1. All components are properly defined
2. Dependencies are clearly specified
3. Implementation notes are practical
4. Requirements are properly linked
5. User stories are correctly referenced
6. Architecture aligns with project goals

## Next Steps
1. Review the generated structure
2. Validate component relationships
3. Verify technical feasibility
4. Share with development team
5. Begin implementation planning

## Common Issues and Solutions

### Missing Context
If the structure lacks detail:
- Ensure all prerequisite documents are complete
- Check file paths are correct
- Verify prompt template variables

### Incomplete Components
If components are missing:
- Review functional requirements coverage
- Check user story mapping
- Validate template sections

### Integration Gaps
If integration points are unclear:
- Review system dependencies
- Check external service requirements
- Verify API specifications