# User Stories Generation Prompt

## Context and Purpose
You are a senior product manager who is an expert in SaaS product requirements and user stories. You are great at reviewing a wireframe implementation and deriving very granular users stories to map to a functional spec that will contain 100% of all the features needed to produce a high end, well designed full implementation of the Bright Run Stage 1 application as currently defined by the implementation wireframes here: wireframes\FR-1.1C-Brun-upload-page

You will not leave anything out needed to produce a high end, well designed {{PROJECT_NAME}}. 

You are tasked with creating comprehensive user stories {{PROJECT_NAME}} Stage 1. These stories will form the foundation for subsequent functional requirements. Focus on capturing user needs, expectations, and desired outcomes across different user types and roles, while maintaining alignment with business impact and strategic goals.


## Required Inputs
- **Current Implementation:** `C:\Users\james\Master\BrightHub\BRun\brun4a\wireframes\FR-1.1C-Brun-upload-page\`
  - The foundational application implementation serving as the starting point for this product. You must understand every feature and stub function in this wireframe implementation.

- **Functional Requirements Stub & Acceptance Criteria:** `C:\Users\james\Master\BrightHub\BRun\brun4a\pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-E01.md
This is not the full functional requirements or acceptance criteria. Treat it more like a scaffold spec which lays the foundation of the TYPE of product we are building. The wireframes and the granular user requirements you are building must build and enhance the functional requirements.

- **Template:** `C:\Users\james\Master\BrightHub\BRun\brun4a\pmc\product\_templates\02-user-stories-template.md`
  - Defines the required format for the resulting document.

- **Example:** `C:\Users\james\Master\BrightHub\BRun\brun4a\pmc\product\_examples\02-aplio-mod-1-user-stories.md`
  - Provides a reference for structure, depth, and quality expectations.

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
- Derive feature categories from the current wireframe implementation
- Group related stories logically
- Ensure coverage of all features implied by the wireframe implementation
- Consider technical and business dependencies

### 2. Acceptance Criteria Development
- Must be specific and testable
- Include both functional and non-functional requirements
- Cover edge cases and error scenarios
- Align with technical constraints
- Consider performance implications

### 3. Technical Considerations
- Server/client component boundaries
- TypeScript and type safety requirements
- Performance metrics
- Deployment considerations
- Infrastructure needs
- Security implications

### 4. Business Value Alignment
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
  {{OUTPUT_PATH}}
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
9. Be extremely granular and explicit. Describe the exact behavior and functions of a users need.
10. You are NOT creating user stories for ANY other part of this application execept the Stage 1 portion as currently implemented in `C:\Users\james\Master\BrightHub\BRun\brun4a\wireframes\FR-1.1C-Brun-upload-page\`

Remember: Focus on user needs and outcomes while considering business impact and technical feasibility. The functional requirements will address detailed technical implementation based on these stories.