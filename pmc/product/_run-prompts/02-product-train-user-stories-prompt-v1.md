# User Stories Generation Prompt

## Context and Purpose
You are a senior product manager who is an expert in SaaS product requirements and user stories. You are great at creating very granular users stories to map to a functional spec that will contain 100% of all the features needed to produce a high end, well designed {{Interactive LoRA Conversation Generation}}. 

You will not leave anything out.
You are tasked with creating comprehensive user stories {{Interactive LoRA Conversation Generation}}. These stories will form the foundation for subsequent functional requirements. Focus on capturing user needs, expectations, and desired outcomes across different user types and roles, while maintaining alignment with business impact and strategic goals.


## Required Inputs
- **Template:** `pmc/product/_templates/02-user-stories-template.md`
  - Defines the required format for the resulting document.
- **Seed Story:** `pmc/product/00-train-seed-story.md`
  - The foundational user story serving as the starting point for this product.
- **Overview Document:** `pmc/product/01-train-overview.md`
  - Contains technical details and implementation plans.
- **Example:** `pmc/product/_examples/02-aplio-mod-1-user-stories.md`
  - Provides a reference for structure, depth, and quality expectations.

- **Current Status:** `C:/Users/james/Master/BrightHub/BRun/train-data/src`
  - The entire current codebase is here and has been worked on toward this project's goal. 
  - Read all the files in all the folders & subfolders to determine the current state.


## Core Requirements

### Document Structure
1. Use the exact template structure from the user stories template
2. Maintain consistent formatting and hierarchy
3. Categories should be derived from stakeholder analysis, not predefined
4. Each category should group related stories logically

### Story Components
Each user story must include:
1. Unique identifier (USx.x.x) following the hierarchical structure
2. Clear title reflecting the story's purpose
3. Role affected (specific stakeholder role from analysis)
4. Standard user story format: "As a [role], I want [feature] so that [benefit]"
5. Impact Weighting (Revenue Impact / Strategic Growth / Operational Efficiency)
6. Detailed acceptance criteria
7. Priority level (High/Medium/Low)
8. Placeholder for FR mapping

### Quality Requirements
1. Stories must be INVEST:
   - Independent: Can be developed in any order
   - Negotiable: Allows room for discussion
   - Valuable: Delivers value to stakeholders
   - Estimable: Can be sized relatively
   - Small: Fits within an iteration
   - Testable: Has clear acceptance criteria

2. Stories must address:
   - Business value alignment
   - Technical feasibility
   - User experience impact
   - Performance implications
   - Security considerations

### Cross-cutting Concerns
1. Ensure stories cover:
   - Security requirements
   - Performance expectations
   - Accessibility needs
   - Error handling
   - User experience
   - Documentation needs
   - Technical constraints
   - Business objectives

## Story Generation Guidelines

### 1. Category Organization
- Derive categories from stakeholder analysis
- Group related stories logically
- Ensure coverage of all key user types
- Consider technical and business dependencies

### 2. Role and Impact Analysis
- Roles must match stakeholder analysis
- Impact weighting should reflect:
  - Direct revenue contribution
  - Strategic importance
  - Operational efficiency gains
  - Market positioning
  - User satisfaction

### 3. Acceptance Criteria Development
- Must be specific and testable
- Include both functional and non-functional requirements
- Cover edge cases and error scenarios
- Align with technical constraints
- Consider performance implications

### 4. Technical Considerations
- Server/client component boundaries
- TypeScript and type safety requirements
- Performance metrics
- Deployment considerations
- Infrastructure needs
- Security implications

### 5. Business Value Alignment
- Core value proposition support
- Market positioning impact
- Stakeholder pain point resolution
- Success metric contribution
- ROI implications

## Example Story Format
```
### [Category derived from stakeholder analysis]
- **US[X.Y.Z]: [Descriptive Title]**
  - **Role**: [Specific Stakeholder Role]
  - *As a [role], I want [specific feature] so that [clear benefit]*
  - **Impact Weighting**: [Revenue Impact / Strategic Growth / Operational Efficiency]
  - **Acceptance Criteria**:
    - [Specific, measurable criterion 1]
    - [Specific, measurable criterion 2]
    - ...
  - **Priority**: [High/Medium/Low]
  - **FR Mapping**: [To be populated during FR generation]
```

## Success Criteria
1. All stakeholder roles are represented
2. Stories properly categorized by stakeholder needs
3. Impact weightings reflect business value
4. Acceptance criteria are specific and testable
5. Priorities reflect both business and technical needs
6. Cross-cutting concerns are addressed
7. Stories align with project goals from seed story

## Document Generation Workflow
1. This document (User Stories) is generated first
2. Functional Requirements document will be generated based on these stories
3. FR numbers will be automatically mapped back to relevant user stories
4. This document will be updated with FR mappings
5. Both documents will maintain bidirectional traceability

## Output Location
- Save the completed **User Stories Document** in:
  ```
  {pmc/product/02-train-user-stories.md}
  ```

## Additional Guidelines
1. Use stakeholder analysis from seed story to identify roles
2. Consider technical constraints from overview document
3. Align impact weightings with business objectives
4. Ensure stories support defined success metrics
5. Consider dependencies between different roles
6. Allow for future updates and refinements
7. Do not issue identical user story numbers. Even if the user story is a duplicate, it must have a unique number.
8. Maintain traceability to project objectives

Remember: Focus on user needs and outcomes while considering business impact and technical feasibility. The functional requirements will address detailed technical implementation based on these stories. 