# Seed Story Generation Prompt

## Context and Purpose
You are tasked with transforming a seed narrative into a comprehensive seed story 
for Bright Run. 
This seed story will serve as the foundational document for the entire project, guiding all subsequent documentation and 
development. Your role is to analyze the narrative, conduct necessary research, and create a structured seed story that provides 
clear direction for both AI agents and human stakeholders. You must record and create every single user story that is 
relevant to the widest interpretation of this project. Do not leave user stories out. You can transfer every relevant 
user story from the narrative document. You can also create new user stories that are not in the narrative document.


## Required Inputs
- **Template:** ``pmc/product/_templates/00-seed-story-template.md``
  - Defines the required format for the resulting document.
- **Seed Narrative:** ``pmc/product/00-bmo-seed-narrative.md``
  - The initial narrative document serving as input for the seed story.
- **Example:** ``pmc/product/_examples/00-aplio-mod-1-seed-story.md``
  - Provides a reference for structure, depth, and quality expectations.


## Core Requirements

### Document Structure
1. Use the exact template structure from `pmc/product/_templates/00-seed-story-template.md`
2. Maintain consistent formatting and hierarchy
You must also include a robust description of the action items and feature goals for the project as a whole in these sections:
3. Include all required sections:
   - Product Vision
   - Stakeholder Breakdown
   - Current Context
   - Success State Description
   - Core Capabilities
   - User Stories
   - Quality Attributes
   - Journey to Success
   - Known Challenges
   - Success Metrics
   - Additional Notes

### Research Requirements
1. Conduct market and technical research to validate and enhance:
   - Technology choices and architectural decisions
   - Industry best practices and standards
   - Competitive landscape and market positioning
   - User needs and pain points
   - Success metrics and benchmarks

### Analysis Components
Each section must include:
1. Synthesis of narrative information
2. Research-backed enhancements
3. Clear, actionable insights
4. Measurable outcomes where applicable
5. Alignment with project goals

### Quality Requirements
1. Content must be:
   - Comprehensive and well-researched
   - Strategically aligned with business goals
   - Technically accurate and feasible
   - Clear and actionable
   - Forward-looking and scalable

### Scope
1. Current Functionality Scope:
This is the first iteration of the Bright Run project. The goal of this iteration is to build a proof of concept that demonstrates the value of the Bright Run platform. The focus of this iteration is on the user journey, the user interface, and the user experience.

1. this is a true internal MVP. This project plan MUST NOT include any tasks related to user authentication, user settings, data isolation, privacy features, encryption, or any other non LoRA training infrastructure items. All included tasks must contribute directly to the full LoRA Fine-Tuning Training Data functionality.


### Cross-cutting Concerns
1. Ensure coverage of:
   - Technical feasibility
   - Market viability
   - Resource requirements
   - Risk factors
   - Timeline considerations
   - Stakeholder needs

## Section-Specific Guidelines

### 1. Product Vision
- Synthesize the core value proposition
- Define clear, compelling objectives
- Align with market needs and opportunities
- Consider both immediate and long-term impact

## 2 Stakeholder Breakdown

| **Role**               | **Type**      | **Stake in the Product**         | **Key Needs** |
|-----------------------|--------------|---------------------------------|--------------|
| [Role Name]          | Customer     | [What they "pay" for]          | [Needs] |
| [Role Name]          | End User     | [Direct interaction]           | [Needs] |
| [Role Name]          | Influencer   | [How they shape direction]      | [Needs] |

### 3. Current Context
- Analyze existing systems and solutions
- Identify key stakeholders and their roles
- Document relevant constraints and dependencies
- Research similar implementations and best practices

### 4. Success State Description
- Define clear, measurable outcomes
- Consider multiple stakeholder perspectives
- Include both functional and non-functional aspects
- Set realistic yet ambitious targets

### 5. Core Capabilities
- Prioritize features based on value and feasibility
- Distinguish between must-have and nice-to-have
- Consider technical constraints and opportunities
- Align with user needs and market demands

### 6. User Stories
- Identify all relevant user types
- Create comprehensive story sets
- Include acceptance criteria
- Consider edge cases and special needs
- Follow the format of the example user stories in the example seed story document.

Each user story (called Initial Story in this document, initials: IS) must include:
1. Unique identifier (ISx.x.x) following the hierarchical structure
2. Clear title reflecting the story's purpose
3. Role Affected
4. Standard user story format: "As a [user], I want [capability] so that [business benefit]."
5. Include acceptance criteria
6. Priority level (High/Medium/Low)
7. Impact Weighting: [Revenue Impact / Strategic Growth / Operational Efficiency]
8. Placeholder for (USx.x.x) mapping from the User Stories document



### 7. Quality Attributes
- Define measurable quality standards
- Consider all relevant quality dimensions
- Set specific, achievable targets
- Include monitoring and validation approaches

## Implementation Guidelines
1. Start with thorough analysis of the seed narrative
2. Conduct necessary research to fill gaps
3. Validate assumptions and claims
4. Ensure comprehensive coverage of all aspects
5. Maintain strategic alignment throughout

## Success Criteria
1. All sections are thoroughly addressed
2. Research insights are properly integrated
3. Content is actionable and measurable
4. Technical aspects are accurate and feasible
5. Business goals are clearly supported
6. Stakeholder needs are comprehensively covered

## Output Format
1. Follow markdown formatting
2. Use consistent indentation
3. Include all template sections
4. Maintain hierarchical structure
5. Use proper heading levels

## Additional Notes
1. The seed story is the foundation for all project documentation
2. Consider future maintainability and scalability
3. Ensure traceability to business objectives
4. Allow for future updates and refinements
5. Before generating content, spend 30 seconds carefully analyzing the problem statement

## Example Section Format
```
## [Section Name]

### [Subsection]
- **[Key Point]**: [Detailed explanation]
  - [Supporting detail 1]
  - [Supporting detail 2]
  - ...
```

## Output Location
- Save the completed **Seed Story Document** in:
  ```
  `pmc/product/00-bmo-seed-story.md`
  ```

Remember: This document must be comprehensive enough to guide the entire project while being specific enough to drive actionable development. Focus on creating a clear, well-researched foundation that will support all subsequent project documentation and development efforts. 