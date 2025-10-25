# Generating Functional Requirements in PMC
**Document:** `pmc/product/03-[project-abbreviation]-functional-requirements.md`  
**Initial Generator:** `pmc/product/_tools/03-generate-FR-initial.js`  
**Enhancement Generator:** `pmc/product/_tools/03-generate-product-specs.js`  
**Preprocessing Prompt:** `pmc/product/_prompt_engineering/3a-preprocess-functional-requirements-prompt_v1.md`  
**Enhancement Prompt:** `pmc/product/_prompt_engineering/3b-functional-requirements-prompt_v1.md`

## Overview
This tutorial explains the two-phase process of generating functional requirements (FRs) in PMC:
1. Initial FR generation from user stories
2. FR preprocessing and enhancement

## Prerequisites
1. Completed user stories (`02-[project-abbreviation]-user-stories.md`)
2. Overview document (`01-[project-abbreviation]-overview.md`)
3. FR template in `_templates` directory

## Generation Process

### Phase 1: Initial FR Generation

#### 1. Generator Script Setup
The script `03-generate-FR-initial.js`:
- Creates initial FR document from user stories
- Maps user stories to functional requirements
- Preserves acceptance criteria
- Maintains traceability

#### 2. Input Files
Required inputs:
1. **User Stories:** Source for initial requirements
2. **Overview Document:** Project context and goals
3. **FR Template:** Document structure and format

#### 3. Initial Generation Process
1. Script reads user stories
2. Creates FR entries for each story
3. Assigns initial FR numbers
4. Maps acceptance criteria
5. Creates placeholders for FR-specific criteria

### Phase 2: FR Preprocessing and Enhancement

#### 1. Preprocessing (3a-preprocess-functional-requirements-prompt_v1.md)
The preprocessing phase:
1. **Removes Non-Product Requirements**
   - Market positioning requirements
   - Business metrics not affecting product
   - Development efficiency metrics
   - Cost reduction metrics
   - Team performance metrics

2. **Removes Duplicate Requirements**
   - Identifies and merges duplicates
   - Preserves unique acceptance criteria
   - Maintains US references
   - Fixes duplicate FR numbers

3. **Reorders Requirements**
   - Organizes into logical build order
   - Groups related requirements
   - Establishes clear dependencies
   - Creates proper section hierarchy

4. **Change Logging**
   - Documents every atomic change
   - Records section reorganization
   - Tracks requirement movements
   - Maintains change rationale

#### 2. Enhancement (3b-functional-requirements-prompt_v1.md)
The enhancement phase:

1. **Analysis Steps**
   - Reviews existing requirements
   - Identifies gaps
   - Notes areas needing breakdown
   - Flags ambiguous requirements

2. **Enhancement Areas**
   - Adds FR-specific acceptance criteria
   - Breaks down complex requirements
   - Adds missing requirements
   - Enhances descriptions

3. **Expert Analysis**
   - System integration requirements
   - Operational requirements
   - Automation opportunities
   - Future-proofing requirements
   - Security requirements

## Running the Generators

### 1. Initial Generation
```bash
node product/_tools/03-generate-FR-initial.js "Aplio Next.js 14 Design System" aplio-mod-1
```

### 2. Preprocessing and Enhancement

```bash
node product/_tools/03-generate-functional-requirements.js "Aplio Next.js 14 Design System" aplio-mod-1
```

This script will prompt you and it will ultimately create three files:
pmc\product\_prompt_engineering\output-prompts\3a-preprocess-functional-requirements-prompt_v1-output.md
pmc\product\_prompt_engineering\output-prompts\3b-#1-functional-requirements-prompt_v1-output.md
pmc\product\_prompt_engineering\output-prompts\3b-#2-functional-requirements-prompt_v1-output.md

You will submit
pmc\product\_prompt_engineering\output-prompts\3a-preprocess-functional-requirements-prompt_v1-output.md
pmc\product\_prompt_engineering\output-prompts\3b-#1-functional-requirements-prompt_v1-output.md
one at a time to a chat window to create the large fully realized file:
pmc\product\03-aplio-mod-1-functional-requirements.md

Keep in mind that the third one: pmc\product\_prompt_engineering\output-prompts\3b-#2-functional-requirements-prompt_v1-output.md
is only needed if you are converting an existing code base. It also has a prompt requirement that is too large. Each time I have run it so far I have needed several iterations of:
 - Are there any other acceptance criterion in 
   pmc\product\03-aplio-mod-1-functional-requirements.md
  where legacy code references would be helpful in the rest of the tasks?

#### Script Execution Process

The script processes functional requirements using prompts from `pmc/product/_prompt_engineering/`:

1. **Parameter Submission**
   - Inputs source documents (functional requirements, user stories, overview)
   - Validates file existence and format
   - Prepares context for LLM processing
   - Uses input/output paths defined in configuration

2. **Requirement Processing** (Prompt: `3a-preprocess-functional-requirements-prompt_v1.md`)
   - Reads and analyzes all functional requirements
   - Creates complete inventory for tracking
   - Identifies dependencies between requirements
   - Evaluates product relevance for each requirement

3. **Non-Product Filtering** (Prompt: `3a-preprocess-functional-requirements-prompt_v1.md`)
   - Eliminates business metrics not affecting product
   - Removes market positioning requirements
   - Preserves all product functionality criteria

4. **Structural Reorganization** (Prompt: `3a-preprocess-functional-requirements-prompt_v1.md`)
   - Groups requirements by logical build progression
   - Sequences from foundation to advanced features
   - Creates appropriate section hierarchy
   - Ensures build dependencies are maintained

5. **Document Updating** (Prompt: `3a-preprocess-functional-requirements-prompt_v1.md`)
   - Renumbers sections sequentially
   - Reassigns FR identifiers systematically
   - Preserves all user story references
   - Maintains original acceptance criteria

6. **Change Tracking** (Prompt: `3a-preprocess-functional-requirements-prompt_v1.md`)
   - Documents all modifications in change log
   - Records rationale for each change
   - Creates traceability for requirement movements
   - Maintains group IDs for related changes

7. **Enhancement** (Prompt: `3b-functional-requirements-prompt_v1.md`)
   - Adds FR-specific acceptance criteria
   - Identifies and fills requirement gaps 
   - Improves requirement descriptions
   - Enhances testability of criteria

## Output Format
The final document follows this structure:
```markdown
# [Project Name] - Functional Requirements
**Version:** [version]
**Date:** [date]
**Category:** [category]

## [Section 1]
- **FR[X.Y.Z]:** [Requirement Title]
  * Description: [Clear description]
  * Impact Weighting: [Strategic/Revenue/Operational]
  * Priority: [High/Medium/Low]
  * User Stories: [US references]
  * Tasks: [T- references]
  * User Story Acceptance Criteria:
    - [Criteria from US]
  * Functional Requirements Acceptance Criteria:
    - [FR-specific criteria]
```

## Change Log Format
Changes are logged in `pmc/product/_tools/cache/[project-abbreviation]-fr-changes.log`:
```markdown
[CG-001] FR8.1.0 -> REMOVED -> N/A | REASON: Market requirement
[CG-002] FR3.2.0 -> MERGED -> FR3.1.0 | REASON: Duplicate core layout
[CG-003] FR2.1.0 -> MOVED -> FR1.2.0 | REASON: Foundation requirement
```

## Validation
After generation, verify:
1. All user stories are properly mapped
2. No duplicate FR numbers exist
3. Requirements are in logical build order
4. All changes are properly logged
5. FR-specific criteria are complete
6. Sections are properly organized

## Next Steps
1. Review generated requirements
2. Validate build order logic
3. Check change log completeness
4. Prepare for task generation
5. Document any manual adjustments

## Common Issues and Solutions

1. **Incomplete Change Logging**
   - Each atomic change must be logged
   - Include detailed rationale
   - Group related changes
   - Maintain change group IDs

2. **Build Order Issues**
   - Review dependencies carefully
   - Ensure logical progression
   - Consider technical constraints
   - Document build order rationale

3. **Missing Requirements**
   - Cross-reference with overview
   - Check system-wide requirements
   - Verify integration requirements
   - Review security aspects

4. **Acceptance Criteria Issues**
   - Ensure criteria are testable
   - Add FR-specific criteria
   - Maintain traceability
   - Document validation methods