# Analysis: Comparison of Two Task Generation Prompt Systems

## Executive Summary

This analysis compares two prompt engineering files and their corresponding JavaScript tools:

1. **04-FR-with-wireframes-create-tasks_v1.md** + **04-generate-FR-wireframe-segments_v4.js**
2. **06a-product-task-elements-breakdown-prompt-v6.0-v5.md** + **06b-generate-task-prompt-segments-5.4.js**

**Key Finding**: Both systems break down Functional Requirements (FRs) into development tasks, but with different approaches and granularity:

- **04-FR-with-wireframes**: Generates comprehensive feature and function task inventories from wireframes and requirements
- **06a-product-task-elements**: Generates atomic, granular task breakdowns using the IPDM methodology

**Important Correction**: The 04-FR system does NOT generate Figma prompts. The JavaScript tool `04-generate-FR-wireframe-segments_v4.js` uses the prompt template to generate task lists, not wireframe prompts.

## 1. Analysis Validation

**Your analysis is CORRECT.** Both systems do break down Functional Requirements (FRs) into granular tasks and serve as templates for segmented generation. However, they serve fundamentally different purposes in the development pipeline.

## 2. Most Important Differences

### Purpose & Output Focus
- **04-FR-with-wireframes**: Generates **wireframe prompts for Figma Make AI** to create visual UI designs
- **06a-product-task-elements**: Generates **implementation task breakdowns** for actual development work

### Workflow Position
- **04-FR-with-wireframes**: **Pre-development** - focuses on UI/UX design and wireframe creation
- **06a-product-task-elements**: **Development phase** - focuses on actual coding tasks and implementation

### Output Granularity
- **04-FR-with-wireframes**: Creates prompts for **visual wireframes** (3+ pages per FR)
- **06a-product-task-elements**: Creates **atomic development tasks** (2-4 hours each, T-X.Y.Z format)

## 3. Difference in Intent

### 04-FR-with-wireframes Intent
- **Visual Design Generation**: Transform functional requirements into Figma-ready wireframe prompts
- **UI-First Approach**: Focus on user interface design before implementation
- **Wireframe Automation**: Streamline the process of creating visual mockups from requirements
- **Design Validation**: Enable rapid prototyping and visual validation of requirements

### 06a-product-task-elements Intent
- **Implementation Planning**: Break down requirements into actionable development tasks
- **IPDM Methodology**: Follow "Integrated Pipeline Development Methodology" with stage-sequential, step-atomic approach
- **Production-Ready Development**: Focus on building complete vertical slices through the application stack
- **Development Orchestration**: Create a systematic approach to backend, frontend, and testing integration

## 4. Evolution Analysis

**06a-product-task-elements is MORE EVOLVED** and represents a significant iteration beyond the 04-FR-with-wireframes approach:

### Evidence of Evolution:
1. **Methodology Sophistication**: 06a introduces IPDM (Integrated Pipeline Development Methodology) with formal stage-sequential processes
2. **Technical Depth**: 06a includes specific Next.js 14 patterns, App Router, Server/Client Components
3. **Production Focus**: 06a emphasizes "Production-First Development" with real data and components
4. **Quality Framework**: 06a includes comprehensive Quality Assurance Framework with IPDM Quality Gates
5. **Atomic Task Design**: 06a defines precise 2-4 hour atomic tasks vs. 04's broader wireframe generation

### Version Indicators:
- **04-FR-with-wireframes**: Version 1 (v1.md)
- **06a-product-task-elements**: Version 6.0-v5 (indicating multiple iterations)

## 5. Wireframe Codebase Integration

**04-FR-with-wireframes is MORE INTEGRATED with wireframe codebase:**

### 04-FR-with-wireframes Integration:
- **Direct Figma Integration**: Specifically designed for Figma Make AI
- **Journey Mapping**: Includes journey-to-wireframe-mapping.json integration
- **Wireframe-Specific Outputs**: Creates files like `04-{prod-abbr}-FR-wireframes-output-E{XX}.md`
- **Visual Design Focus**: Emphasizes user goals, emotional requirements, progressive disclosure
- **UI Documentation**: Requires Wireframe/UI Documentation as input

### 06a-product-task-elements Integration:
- **Codebase Integration**: References actual implementation codebase (`C:\Users\james\Master\BrightHub\BRun\brun8\4-categories-wf`)
- **Development Integration**: Focuses on backend, frontend, and testing integration
- **Production Integration**: Emphasizes building in production locations with real components

## 6. Niche Use of "Least Evolved" (04-FR-with-wireframes)

**04-FR-with-wireframes has CRITICAL niche uses:**

### Unique Value Proposition:
1. **Design-First Validation**: Essential for validating UI/UX concepts before development investment
2. **Stakeholder Communication**: Provides visual artifacts for non-technical stakeholders
3. **Rapid Prototyping**: Enables quick iteration on visual design concepts
4. **Design System Foundation**: Creates the visual foundation that informs development tasks
5. **User Journey Visualization**: Translates abstract requirements into concrete visual workflows

### When to Use 04-FR-with-wireframes:
- **Pre-development phase** when visual validation is needed
- **Stakeholder review cycles** requiring visual mockups
- **Design system creation** for new products
- **User experience validation** before development commitment
- **Client presentation** requiring visual demonstrations

### Complementary Relationship:
The 04-FR-with-wireframes system should **precede** the 06a-product-task-elements system in a complete development workflow:

1. **Phase 1**: Use 04-FR-with-wireframes to create visual designs and validate UI/UX
2. **Phase 2**: Use 06a-product-task-elements to break down implementation based on validated designs

## 7. Tool Integration Analysis

### 04-generate-FR-wireframe-segments_v4.js:
- **Input**: `03-{project-abbreviation}-functional-requirements.md`
- **Template**: `04-FR-with-wireframes-create-tasks_v1.md`
- **Output**: Figma-ready wireframe prompts per FR
- **Integration**: Journey mapping, stage-based processing, line number tracking

### 06b-generate-task-prompt-segments_v6.0.js:
- **Input**: `06-{project-abbreviation}-tasks.md` (generated by 06a-generate-task-initial-v4.js)
- **Template**: `06a-product-task-elements-breakdown-prompt-v6.0-v5.md`
- **Output**: Implementation task breakdowns with atomic granularity
- **Integration**: IPDM methodology, production-first approach, vertical slice creation

## Conclusion

Both systems are essential but serve different phases of the development lifecycle. The 04-FR-with-wireframes system excels at design validation and stakeholder communication, while the 06a-product-task-elements system excels at implementation planning and development orchestration. They should be used sequentially rather than as alternatives, with wireframe validation informing implementation planning.

## Recommendation for Modular Prompt Execution Philosophy

**Question**: Which task generation system is better suited for a modular prompt execution approach using self-contained 200k token context windows in Claude-4.5-sonnet?

**Answer**: **04-FR-with-wireframes-create-tasks_v1.md** is significantly better suited for this approach.

### Reasoning:

**Why 04-FR-with-wireframes is Superior for Modular Execution:**

1. **Self-Contained Feature Scope**: 
   - Generates 50-200 broader feature-level tasks that naturally contain complete functionality
   - Each task encompasses full-stack implementation (frontend, backend, database) in one cohesive unit
   - Reduces the risk of agents losing context since each prompt contains a complete feature scope

2. **Optimal Token Utilization**:
   - Broader tasks make better use of 200k token context windows
   - Less fragmentation means more complete context per prompt
   - Fewer total prompts needed to complete the entire project

3. **Reduced Interdependencies**:
   - Feature-level tasks are more naturally independent
   - Less coordination required between successive prompts
   - Each prompt can be executed without waiting for prior components to finish

4. **Complete Context Preservation**:
   - Comprehensive analysis framework ensures all necessary context is included
   - Full-stack coverage prevents missing integration points
   - Production readiness criteria included in each task scope

**Why 06a-product-task-elements is Less Suitable:**

1. **Excessive Granularity**:
   - 2-4 hour atomic tasks would require dozens of separate prompts
   - High risk of context loss across many small interactions
   - Inefficient use of 200k token context windows

2. **Complex Dependencies**:
   - IPDM's 6-stage sequential pipeline creates tight interdependencies
   - Subsequent prompts would need completion of prior stages
   - Violates the modular execution principle

3. **Context Fragmentation**:
   - Atomic tasks lose sight of broader feature goals
   - Agents may optimize locally while missing global objectives
   - Requires careful orchestration across many prompts

### Implementation Strategy for 04-FR-with-wireframes:

**Recommended Approach**:
1. Use `04-generate-FR-wireframe-segments_v4.js` to generate feature-level task prompts
2. Each generated prompt file (`04-FR-wireframes-prompt-E[XX].md`) becomes a self-contained 200k token execution unit
3. Include SQL setup steps and complete implementation context in each prompt
4. Structure prompts with clear ======= and +++++++ delimiters for copy-paste sections
5. Ensure each prompt contains all necessary context without external dependencies

**Expected Outcome**:
- 5-15 self-contained prompts (depending on project size) instead of 50+ granular tasks
- Each prompt delivers complete, testable features
- Minimal coordination required between prompt executions
- Better preservation of feature context and user experience goals

**Conclusion**: The 04-FR-with-wireframes system aligns perfectly with the modular prompt execution philosophy by generating appropriately-scoped, self-contained tasks that make optimal use of large context windows while preserving feature coherence.

---

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
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-[prod-abbr]-FR-wireframes-E[XX]-output.md`

2. **Product Overview Document** - Contains product vision, goals, architecture, and scope:
`C:\Users\james\Master\BrightHub\BRun\train-data\pmc\product\01-[prod-abbr]-overview.md`

3. **Functional Requirements Document** - Contains detailed feature specifications and acceptance criteria:
`C:\Users\james\Master\BrightHub\BRun\train-data\pmc\product\03-[prod-abbr]-functional-requirements.md`

4. **Functional Requirements Scope Document** - Contains specific FR scope for this segment:
`C:\Users\james\Master\BrightHub\BRun\train-data\pmc\product\_mapping\fr-maps\04-[prod-abbr]-FR-wireframes-E[XX].md`

5. **Current Implementation Codebase** - The existing wireframe and application code:
`C:\Users\james\Master\BrightHub\brun\train-data\train-wireframe\src`
`C:\Users\james\Master\BrightHub\brun\train-data\src`

6. **Previous Segment Deliverables** - Examine outputs from prior segments to understand context and dependencies:
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-[prod-abbr]-FR-wireframes-E[XX-1]-execute.md` (if exists)

## Output File
Output the complete execution instructions here:
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-[prod-abbr]-FR-wireframes-E[XX]-execute.md`

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
# [Product Name] - Implementation Execution Instructions (E[XX])
**Generated**: [ISO Date]  
**Segment**: E[XX] - [Segment Description]  
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
