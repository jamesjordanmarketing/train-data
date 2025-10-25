# Implementation Patterns Generation Prompt

## Product Summary
Bright Run is a comprehensive LoRA fine-tuning training data platform that transforms an organization's raw, unstructured knowledge into proprietary LoRA-ready training datasets through an intuitive six-stage workflow. The platform enables non-technical users to create custom LLMs that think with their unique knowledge, beliefs, and proprietary processes while maintaining complete data ownership and privacy.

## Your Role
You are an expert technical architect and implementation specialist tasked with defining clear, practical implementation patterns for the Bright Run LoRA Training Product. Your expertise spans modern frontend frameworks, design systems, and component architecture. You will create an authoritative reference document that bridges the gap between high-level requirements and concrete implementation code.

## Context and Purpose
This document will serve as the definitive guide for implementing the Bright Run LoRA Training Product. AI agents and developers will rely on these patterns to ensure consistent, high-quality code across the entire project. The patterns you define must be:

1. Precisely aligned with the structure specification
2. Optimized for the specific requirements of the project
3. Complete with code examples that demonstrate best practices
4. Structured to promote maintainability and future extensibility
5. Organized for efficient lookup and reference by AI and human developers

Your patterns will establish the foundation for all implementation work, ensuring the final product maintains premium design quality while leveraging modern technical approaches.

## Required Inputs
Before generating this document, you must read and fully understand the following files:

- **Implementation Patterns Template:** `C:/Users/james/Master/BrightHub/Bright Pod/bright-mode-1a/pmc/product/_templates/05-implementation-patterns-template.md`
  - Defines the required format for the resulting document.
  - Follow this template's structure precisely.
- **Structure Specification:** `C:/Users/james/Master/BrightHub/Bright Pod/bright-mode-1a/pmc/product/04-bmo-structure.md`
  - Contains the complete file and folder structure for the project.
  - All implementation patterns MUST align with and support this structure.
  - Pay special attention to component organization, file naming conventions, and quality standards.
- **Overview Document:** `C:/Users/james/Master/BrightHub/Bright Pod/bright-mode-1a/pmc/product/01-bmo-overview.md`
  - Contains project goals, technical stack, and architectural decisions.
- **User Stories:** `C:/Users/james/Master/BrightHub/Bright Pod/bright-mode-1a/pmc/product/02-bmo-user-stories.md`
  - Details the functional requirements and user needs.
- **Functional Requirements:** `C:/Users/james/Master/BrightHub/Bright Pod/bright-mode-1a/pmc/product/03-bmo-functional-requirements.md`
  - Contains detailed requirements that the structure must support.
  - Extract specific implementation patterns needed from these requirements.
- **Example:** `C:/Users/james/Master/BrightHub/Bright Pod/bright-mode-1a/pmc/product/_examples/05-bmo-implementation-patterns.md`
  - Provides a reference for structure, depth, and quality expectations.


## Core Requirements

### Document Structure
1. **Pattern Index**
   - Place at the beginning of the document
   - Organize by developer tasks (e.g., "Creating components", "Setting up data fetching")
   - Group by component types and technical concerns
   - Include direct links to each pattern using consistent IDs
   - Each entry should briefly describe when to use the pattern

2. **Core Component Patterns**
   - Server-side patterns
   - Client-side patterns
   - Component organization
   - Type definitions

3. **Data Management Patterns**
   - State management
   - Data fetching
   - Cache strategies
   - Error handling

4. **UI/UX Patterns**
   - Animation patterns
   - Interaction patterns
   - Responsive design patterns
   - Accessibility patterns

5. **Task-Based Guides**
   - Common implementation workflows
   - Step-by-step procedures referencing specific patterns
   - Decision trees for pattern selection
   - Examples of combining multiple patterns

6. **Implementation Rules**
   - Code organization
   - Type safety requirements
   - Performance guidelines
   - Testing standards

7. **Quality Standards**
   - Code quality metrics
   - Performance benchmarks
   - Security requirements
   - Testing coverage

### Pattern Documentation

#### Each Pattern Must Include
1. **Pattern Definition**
   - Unique pattern ID (e.g., "P001-SERVER-COMPONENT")
   - Clear purpose and use case
   - Implementation location
   - Usage guidelines
   - Type definitions
   - When to use and when not to use guidance

2. **Code Example**
   ```typescript
   // Location: path/to/implementation
   // Usage: Specific use cases

   // Pattern implementation with:
   // - Imports
   // - Type definitions
   // - Core logic
   // - Error handling
   // - Documentation
   ```

3. **Implementation Rules**
   - Setup requirements
   - Dependencies
   - Edge cases
   - Error scenarios

4. **Structure Alignment**
   - How the pattern fits into the defined structure
   - File locations and naming conventions
   - Component hierarchies
   - Import/export patterns

5. **Related Patterns**
   - References to other patterns by ID that work well together
   - Alternatives for different use cases
   - Patterns to avoid in combination

### Quality Requirements

1. **Code Quality**
   - Type safety
   - Error handling
   - Performance optimization
   - Documentation standards

2. **Pattern Usability**
   - Clear implementation steps
   - Practical examples
   - Common use cases
   - Edge case handling

3. **Technical Alignment**
   - Framework best practices
   - Language idioms
   - Performance patterns
   - Security patterns

4. **Maintainability**
   - Code organization
   - Documentation
   - Testing approach
   - Update strategies

## Pattern Development Guidelines

### 1. Pattern Analysis
- Review technical requirements
- Understand use cases
- Consider performance implications
- Evaluate maintenance needs

### 2. Pattern Design
- Focus on reusability
- Consider extensibility
- Plan for scale
- Account for edge cases

### 3. Implementation Standards
- Consistent style
- Clear documentation
- Type safety
- Error handling

### 4. Testing Requirements
- Unit test patterns
- Integration test patterns
- Performance test patterns
- Security test patterns

### 5. Documentation Standards
- Clear purpose
- Usage examples
- Edge cases
- Error scenarios

## Success Criteria

### Completeness
- [ ] All required patterns defined
- [ ] Implementation examples provided
- [ ] Type definitions included
- [ ] Test patterns specified
- [ ] Pattern index and task guides included

### Clarity
- [ ] Clear pattern purposes
- [ ] Unambiguous implementations
- [ ] Explicit guidelines
- [ ] Comprehensive examples
- [ ] Consistent pattern IDs and cross-references

### Technical Alignment
- [ ] Matches architecture requirements
- [ ] Supports technical stack
- [ ] Enables type safety
- [ ] Facilitates testing

### Maintainability
- [ ] Clear organization
- [ ] Comprehensive documentation
- [ ] Test coverage
- [ ] Update strategy

### Structure Alignment
- [ ] All patterns align with the structure specification
- [ ] File and folder organization is consistent
- [ ] Component hierarchies are preserved
- [ ] Naming conventions are followed

### Usability
- [ ] Organized for easy reference
- [ ] Task-based guides cover common workflows
- [ ] Pattern relationships are clearly documented
- [ ] Consistent heading structure for programmatic navigation

## Document Generation Workflow
1. Analyze project requirements thoroughly
2. Identify core patterns needed from the functional requirements
3. Ensure alignment with the structure specification
4. Design pattern implementations
5. Document usage guidelines
6. Create pattern index and task-based guides
7. Establish consistent pattern IDs and cross-references
8. Include test patterns
9. Validate against success criteria

## Output Location
- Save the completed **Implementation Patterns Document** in:
  ```
  C:/Users/james/Master/BrightHub/Bright Pod/bright-mode-1a/pmc/product/05-bmo-implementation-patterns.md
  ```

## Additional Guidelines

### 1. Technology-Specific Considerations
- Framework patterns
- Language patterns
- Tool patterns
- Platform patterns

### 2. Cross-Cutting Concerns
- Security patterns
- Performance patterns
- Testing patterns
- Documentation patterns

### 3. Future-Proofing
- Pattern evolution
- Version compatibility
- Migration patterns
- Deprecation strategies

### 4. Implementation Support
- Setup guides
- Usage examples
- Troubleshooting
- Best practices

Remember: The implementation patterns must be precise and practical, as they will serve as the foundation for consistent development across the project. AI agents will rely on these patterns for implementation, so clarity and completeness are essential. Each pattern should include concrete examples that can be directly applied to the project's specific needs. Ensure all patterns align with the structure specification document and support the functional requirements. The document should be structured for easy navigation and reference by both AI systems and human developers. 
