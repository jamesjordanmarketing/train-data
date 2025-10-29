# Generating Implementation Patterns in PMC
**Document:** `pmc/product/05-[project-abbreviation]-implementation-patterns.md`  
**Generator Script:** `pmc/product/_tools/05-generate-implementation-patterns.js`  
**Implementation Patterns Template:** `pmc/product/_templates/05-implementation-patterns-template.md`  
**Prompt Template:** `pmc/product/_prompt_engineering/05-product-implementation-patterns-prompt_v1.md`

## Overview
This tutorial explains the process of generating an implementation patterns document in PMC. The implementation patterns document serves as a comprehensive guide for AI agents and developers, providing concrete examples and standards for implementing the product. These patterns ensure consistency, code quality, and alignment with the project's structure and requirements.

## Purpose and How To Use the Output File

The implementation patterns document plays a critical role in transforming high-level specifications into practical, consistent code. Here's why it's valuable and how to use it effectively:

### Benefits of Implementation Patterns

1. **Consistency Across the Codebase**
   - Establishes standardized approaches to common implementation challenges
   - Ensures uniform coding styles, file organization, and architectural patterns
   - Prevents "reinventing the wheel" for recurring development tasks

2. **Preservation of Design Quality**
   - Bridges the gap between design specifications and actual code
   - Maintains visual and interaction fidelity with legacy systems during modernization
   - Ensures design tokens, animations, and responsive behaviors are implemented correctly

3. **Technical Excellence and Maintainability**
   - Promotes best practices specific to the project's technology stack
   - Reduces technical debt through standardized approaches
   - Facilitates easier onboarding for new developers or AI agents

4. **Type Safety and Error Prevention**
   - Provides concrete examples of type definitions and interfaces
   - Demonstrates proper error handling patterns
   - Shows how to implement controlled and uncontrolled component patterns

5. **Performance Optimization**
   - Illustrates optimized patterns for server/client component boundaries
   - Demonstrates efficient state management approaches
   - Shows techniques for animation performance and reduced motion

### How AI Coding Agents Can Use This Document

The implementation patterns document is designed to be a practical reference for AI agents during coding tasks:

1. **Pattern-Based Implementation**
   - AI agents should reference specific patterns by ID when implementing features
   - Example: "Implement the hero section following P016-ENTRY-ANIMATION for the fade-in effect"

2. **Type-Safe Development**
   - AI should reference component type definitions and follow the established type patterns
   - Example: "Create type definitions for the feature component based on P005-COMPONENT-TYPES"

3. **Task-Oriented Guidance**
   - For complex implementation tasks, AI can follow the task-based guides
   - Example: "Add a new feature component using T002-ADD-FEATURE as a guide"

4. **Decision Making**
   - When faced with implementation choices, AI should prefer approaches aligned with the patterns
   - Example: "Choose server component implementation since the pattern specifies static content should use P002-SERVER-COMPONENT"

5. **Quality Assurance**
   - AI should validate implementations against the rules specified in each pattern
   - Example: "Verify the button implementation follows all implementation rules in P008-COMPONENT-VARIANTS"

### Instructing AI Agents to Use Implementation Patterns

When working with AI coding agents, you can maximize the value of the implementation patterns document with these approaches:

1. **Direct Pattern References**
   ```
   "Implement a hero section component following pattern P016-ENTRY-ANIMATION for entrance animations and P009-RESPONSIVE-STYLES for responsive layout."
   ```

2. **Component Creation Guidance**
   ```
   "Create a new feature component for the pricing section using T002-ADD-FEATURE as your guide. Ensure you follow P005-COMPONENT-TYPES for type definitions."
   ```

3. **Problem-Solving Context**
   ```
   "We're seeing inconsistent animation behavior across components. Review P018-TRANSITION-ANIMATION and align all transition animations with this pattern."
   ```

4. **Quality Verification**
   ```
   "Verify that the button component implementation follows all eight implementation rules specified in P003-CLIENT-COMPONENT and P008-COMPONENT-VARIANTS."
   ```

By leveraging these implementation patterns effectively, AI coding agents can produce higher quality, more consistent code that aligns perfectly with the project's requirements and architectural vision.

## Prerequisites
Before generating the implementation patterns document, ensure you have:
1. Overview document (`01-[project-abbreviation]-overview.md`)
2. User stories (`02-[project-abbreviation]-user-stories.md`)
3. Functional requirements (`03-[project-abbreviation]-functional-requirements.md`)
4. Structure specification (`04-[project-abbreviation]-structure.md`)
5. Implementation patterns template in `_templates` directory
6. Reference example in `_examples` directory
7. Access to legacy codebase (if applicable for reference)

## Generation Process

### 1. Generator Script Overview
The script `pmc\product\_tools\05-generate-implementation-patterns.js`:
- Creates an implementation patterns prompt
- Integrates context from previous documents including structure
- Identifies specific implementation patterns needed based on requirements
- Supports legacy codebase review for adaptation of existing patterns

### 2. Required Files
The script needs access to:
1. **Overview Document:** Project context and goals
2. **User Stories:** Core functionality and features
3. **Functional Requirements:** Detailed specifications
4. **Structure Specification:** Component organization and architecture
5. **Implementation Patterns Template:** Document format and sections
6. **Reference Example:** Guide for pattern organization and depth
7. **Legacy Codebase:** (Optional) For extraction of existing patterns

### 3. Running the Generator

Navigate to the tools directory and run:
```bash
node 05-generate-implementation-patterns.js "Project Name" project-abbrev
```

Example:
```bash
node product/_tools/05-generate-implementation-patterns.js "Aplio Design System Next.js 14 Modernization" aplio-mod-1
```

The script will:
1. Prompt for file paths (with defaults)
2. Ask about including legacy codebase review
3. Generate the implementation patterns prompt
4. Save the output to `_prompt_engineering/output-prompts`

### 4. Prompt Generation Process

The script processes your inputs through several steps:
1. **Context Collection**
   - Reads overview for project goals and technical stack
   - Analyzes structure specification for component organization
   - Reviews functional requirements to identify needed patterns
   - Maps user stories to implementation needs
   - Extracts pattern examples from legacy code if available

2. **Template Processing**
   - Replaces variables in prompt template
   - Integrates file paths for AI context
   - Adds legacy code references if enabled
   - Formats output for AI consumption

3. **Output Generation**
   - Creates prompt file in output directory
   - Includes all necessary context
   - Maintains file references
   - Structures pattern requirements

### 5. Creating the Implementation Patterns Document

After generating the prompt:
1. Copy the contents of:
   `pmc/product/_prompt_engineering/output-prompts/05-product-implementation-patterns-prompt_v1-output.md`

2. Submit to an AI model capable of:
   - Understanding complex software architecture and design patterns
   - Processing multiple context documents
   - Generating detailed code examples and pattern specifications
   - Maintaining consistency with the structure specification

3. Save the AI's response as:
   `pmc/product/05-[project-abbreviation]-implementation-patterns.md`

## Output Format
The final implementation patterns document follows this format:
```markdown
# [Project Name] - Implementation Patterns
**Version:** [version]
**Date:** [date]
**Category:** [Product type/category]

## Pattern Index
[Organized list of patterns with links and brief descriptions]

## Core Architecture Patterns
### [Pattern ID]: [Pattern Name]
- **Pattern Definition:** [Purpose, usage, when to use/not use]
- **Code Example:** [Concrete implementation example]
- **Implementation Rules:** [Specific guidelines to follow]
- **Structure Alignment:** [How it fits in the overall structure]
- **Related Patterns:** [Links to related patterns]

## Design System Patterns
[Design token and component patterns]

## Animation Patterns
[Animation implementation patterns]

## Task-Based Implementation Guides
[Step-by-step guides for common tasks]
```

## Validation Checklist
After generation, verify:
1. All required patterns are defined with concrete examples
2. Implementation rules are clear and actionable
3. Patterns align with the structure specification
4. Type definitions are comprehensive
5. Code examples demonstrate best practices
6. Task-based guides cover common workflows
7. Animation and interaction patterns preserve design quality
8. Server/client component boundaries are clearly defined

## Next Steps
1. Review the generated implementation patterns
2. Validate patterns against requirements and structure
3. Verify technical feasibility and best practices
4. Share with development team
5. Use as reference during implementation

## Common Issues and Solutions

### Incomplete Pattern Examples
If pattern examples lack detail:
- Ensure structure specification is sufficiently detailed
- Provide more context from legacy codebase if applicable
- Specify concrete implementation requirements

### Misaligned Patterns
If patterns don't align with structure:
- Verify structure specification is properly referenced in prompt
- Check for inconsistencies between requirements and structure
- Clarify component organization and relationships

### Insufficient Type Definitions
If type definitions are inadequate:
- Request more comprehensive type examples
- Specify required prop types and interfaces
- Clarify type safety requirements

### Animation Pattern Gaps
If animation patterns are insufficient:
- Provide visual references or descriptions of required animations
- Specify timing, easing, and interaction requirements
- Reference legacy implementation if available