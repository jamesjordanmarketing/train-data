## Execution Prompt Template for Task-to-Implementation Conversion

# Task Execution Generator Prompt v1.0
**Purpose:** Convert feature task inventories into executable SQL instructions and implementation prompts  
**Scope:** Transforms task outputs into actionable instructions for human operators and Claude-4.5-sonnet  
**Date:** 01/20/2025

## Instructions

You are a senior technical implementation architect and prompt engineering specialist. Your role is to analyze completed task inventories and transform them into precise, executable instructions that human operators can follow to implement features using Claude-4.5-sonnet in 200k token context windows.

You must **think strategically** about the optimal way to structure implementation prompts for maximum quality, completeness, and success rate. Consider dependencies, complexity, risk factors, and the most logical sequence for implementation.

## Input Requirements

You will be provided with:

1. **Task Inventory Document** - Contains the complete feature task breakdown:
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-train-FR-wireframes-E11-output.md`

2. **Product Overview Document** - Contains product vision, goals, architecture, and scope:
`C:\Users\james\Master\BrightHub\BRun\train-data\pmc\product\01-train-overview.md`

3. **Functional Requirements Document** - Contains detailed feature specifications and acceptance criteria:
`C:\Users\james\Master\BrightHub\BRun\train-data\pmc\product\03-train-functional-requirements.md`

4. **Functional Requirements Scope Document** - Contains specific FR scope for this segment:
`C:\Users\james\Master\BrightHub\BRun\train-data\pmc\product\_mapping\fr-maps\04-train-FR-wireframes-E11.md`

5. **Current Implementation Codebase** - The existing wireframe and application code:
`C:\Users\james\Master\BrightHub\brun\train-data\train-wireframe\src`
`C:\Users\james\Master\BrightHub\brun\train-data\src`

6. **Previous Segment Deliverables** - Examine outputs from prior segments to understand context and dependencies:
`C:\Users\james\Master\BrightHub\BRun\train-data\pmc\product\_mapping\fr-maps\prompts\04-FR-wireframes-execution-prompt-E10.md` (if exists)

## Output File
Output the complete execution instructions here:
`C:\Users\james\Master\BrightHub\BRun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E11.md`

Write the output file in batches, because it will be large.

## Core Implementation Philosophy

### Strategic Thinking Requirements
Before generating any instructions, you must:

1. **Analyze Task Complexity**: Evaluate which tasks are most complex and require the most context
2. **Identify Dependencies**: Map out which tasks depend on others and must be completed sequentially
3. **Assess Risk Factors**: Identify tasks with highest implementation risk and plan mitigation strategies
4. **Optimize for Context Windows**: Group related tasks to maximize the value of each 200k token prompt
5. **Plan for Quality**: Ensure each prompt includes comprehensive validation and testing instructions

### Context Examination Requirements
You must thoroughly examine:

1. **Previous Segment Outputs**: Understand what has been built and what this segment builds upon
2. **Existing Codebase State**: Analyze current implementation to avoid conflicts and leverage existing patterns
3. **Cross-Task Dependencies**: Identify shared components, data models, and integration points
4. **Technical Debt Considerations**: Plan for maintainable, scalable implementation approaches

## Output Format

Generate execution instructions following this exact structure:

```
# [Product Name] - Implementation Execution Instructions (E11)
**Generated**: [ISO Date]  
**Segment**: E11 - [Segment Description]  
**Total Prompts**: [Number]  
**Estimated Implementation Time**: [Hours]

## Executive Summary
[Brief overview of what this segment implements and its strategic importance]

## Context and Dependencies

### Previous Segment Deliverables
[Analysis of what was built in previous segments and how this segment builds upon it]

### Current Codebase State
[Analysis of existing code that this segment will modify or extend]

### Cross-Segment Dependencies
[Identification of dependencies on other segments or external systems]

## Implementation Strategy

### Risk Assessment
[Identification of highest-risk tasks and mitigation strategies]

### Prompt Sequencing Logic
[Explanation of why prompts are ordered this way for optimal implementation]

### Quality Assurance Approach
[Strategy for ensuring high-quality implementation across all prompts]

## Database Setup Instructions

### Required SQL Operations
[If any database changes are needed]

========================


[SQL statements to be executed in Supabase SQL Editor]


++++++++++++++++++


## Implementation Prompts

### Prompt 1: [Descriptive Name]
**Scope**: [What this prompt accomplishes]  
**Dependencies**: [What must be completed before this prompt]  
**Estimated Time**: [Implementation time]  
**Risk Level**: [Low/Medium/High]

========================


You are a senior full-stack developer implementing [specific feature/component] for [product name]. 

**CONTEXT AND REQUIREMENTS:**

[Complete context including:]
- Product overview and goals
- Specific functional requirements being implemented
- Technical architecture and patterns to follow
- Integration points with existing code
- Quality and testing requirements

**CURRENT CODEBASE STATE:**
[Analysis of relevant existing code that will be modified or extended]

**IMPLEMENTATION TASKS:**
[Detailed breakdown of specific tasks from the task inventory, organized for optimal implementation flow]

**ACCEPTANCE CRITERIA:**
[Specific, measurable criteria for completion]

**TECHNICAL SPECIFICATIONS:**
[Detailed technical requirements including:]
- File locations and naming conventions
- Component architecture and patterns
- Data models and API specifications
- Styling and UI requirements
- Error handling and validation
- Testing requirements

**VALIDATION REQUIREMENTS:**
[Specific steps to validate the implementation]

**DELIVERABLES:**
[Exact list of files and components that must be created or modified]

Implement this feature completely, ensuring all acceptance criteria are met and the implementation follows established patterns and best practices.


++++++++++++++++++


### Prompt 2: [Descriptive Name]
[Continue with additional prompts as needed, following the same format]

## Quality Validation Checklist

### Post-Implementation Verification
- [ ] All acceptance criteria met
- [ ] Integration with existing code verified
- [ ] Error handling implemented
- [ ] Testing coverage adequate
- [ ] Performance requirements met
- [ ] Security considerations addressed
- [ ] Documentation updated

### Cross-Prompt Consistency
- [ ] Consistent naming conventions
- [ ] Aligned architectural patterns
- [ ] Compatible data models
- [ ] Integrated user experience

## Next Segment Preparation
[Information needed for the next segment implementation]
```

## Prompt Construction Guidelines

### Sequential and Modular Design
1. **Independence**: Each prompt must be executable without requiring completion of previous prompts
2. **Self-Contained**: Include all necessary context, requirements, and specifications within each prompt
3. **Logical Sequence**: Order prompts to build complexity gradually and minimize rework
4. **Clear Boundaries**: Define exactly what each prompt accomplishes and what it doesn't

### Instructive and Directive Approach
1. **Specific Instructions**: Provide exact file paths, component names, and implementation details
2. **Clear Expectations**: Define precise acceptance criteria and deliverables
3. **Technical Depth**: Include architectural patterns, coding standards, and integration requirements
4. **Validation Steps**: Specify how to verify successful implementation

### Context Preservation
1. **Complete Requirements**: Include all relevant functional requirements and acceptance criteria
2. **Technical Context**: Provide necessary architectural and integration information
3. **Quality Standards**: Specify testing, performance, and security requirements
4. **User Experience**: Maintain focus on end-user value and experience

## Special Considerations

### Database Integration
- Include specific SQL statements for Supabase setup
- Provide clear instructions for database schema changes
- Specify data migration requirements if needed

### Codebase Integration
- Analyze existing code patterns and maintain consistency
- Identify reusable components and utilities
- Plan for minimal disruption to existing functionality

### Quality Assurance
- Include comprehensive testing requirements in each prompt
- Specify validation steps for each deliverable
- Plan for integration testing across prompt boundaries

### Performance and Scalability
- Consider performance implications of implementation choices
- Plan for scalable architecture patterns
- Include optimization requirements where relevant

Generate execution instructions that enable successful, high-quality implementation of the feature tasks through strategic, well-structured prompts that maximize the effectiveness of Claude-4.5-sonnet's capabilities.