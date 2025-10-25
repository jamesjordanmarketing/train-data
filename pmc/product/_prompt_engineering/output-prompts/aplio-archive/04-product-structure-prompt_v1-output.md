# Structure Specification Generation Prompt

## Product Summary
& Value Proposition

The Next.js 14 Modernization for Aplio Design System represents a strategic transformation of the Aplio Design System Theme, focusing on migrating the Home 4 template (https://js-aplio-6.vercel.app/home-4) as our flagship demonstration. This initiative is centered around preserving the exceptional design aesthetics and user experience from our legacy codebase while implementing modern architectural patterns and development practices.

Our legacy product has proven highly successful in delivering beautiful, professional websites that users love. This modernization effort will maintain every aspect of this premium design while upgrading the technical foundation through a systematic design system extraction and modern implementation approach.

## Your Role
You are a team of senior software architects specializing in modern application architecture. You have extensive experience designing maintainable, scalable software systems across various technologies and frameworks. You understand how critical proper structure is to project success and developer productivity.

## Context and Purpose
You are tasked with creating a comprehensive structure specification document for Aplio Design System Next.js 14 Modernization. This document will serve as the authoritative reference for the project's file and folder organization, ensuring consistent implementation across the entire codebase. The structure must be clear, maintainable, and optimized for the specific requirements of the project.

## Required Inputs
Before generating this document, you must read and fully understand the following files:

- **Structure Template:** `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\product\_templates\04-structure-specification-template.md`
  - Defines the required format for the resulting document.
  - Follow this template's structure precisely.
- **Overview Document:** `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\product\01-aplio-mod-1-overview.md`
  - Contains project goals, technical stack, and architectural decisions.
- **User Stories:** `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\product\02-aplio-mod-1-user-stories.md`
  - Details the functional requirements and user needs.
- **Functional Requirements:** `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\product\03-aplio-mod-1-functional-requirements.md`
  - Contains detailed requirements that the structure must support.
- **Example:** `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\product\_examples/04-aplio-mod-1-structure.md`
  - Provides a reference for structure, depth, and quality expectations.

- **Current Status:** `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy`
  - The entire current codebase is here and has been worked on toward this project's goal. 
  - Read all the files in all the folders & subfolders to determine the current state.


## Output Document Format
- Use the exact format from the Structure Template
- Include appropriate metadata (version 1.0.0, current date, project category, and project abbreviation)
- List all source reference documents
- Provide a clear purpose statement
- Use markdown code blocks for directory structure visualization with comments
- Include checkbox lists for quality standards
- Maintain consistent heading levels and formatting

## Core Requirements

### Document Structure
1. **Root Structure**
   - Clear hierarchy of main directories
   - Purpose of each top-level directory
   - Configuration file placement
   - Use code blocks with comments for structure visualization

2. **Source Code Structure**
   - Feature organization
   - Component hierarchy 
   - Resource placement
   - Type definitions
   - Utility functions
   - Framework-specific folder structure based on technical requirements
   - Detailed component organization patterns

3. **Implementation Guidelines**
   - File naming conventions
   - Directory organization rules
   - Type safety requirements
   - Import/export guidelines
   - Framework-specific concerns:
     - Component patterns
     - State management
     - Routing/navigation
     - Error handling
     - Data management

4. **Quality Standards**
   - Code organization requirements with checkboxes
   - Performance considerations with checkboxes
   - Security standards with checkboxes
   - Accessibility standards with checkboxes
   - Responsive design standards with checkboxes
   - Documentation needs with checkboxes

### Directory Organization

#### Each Directory Section Must Include
1. **Purpose Statement**
   - Clear explanation of directory's role
   - Types of files contained
   - Usage guidelines

2. **Structure Visualization**
   ```
   directory/
   ├── subdirectory/              # Purpose
   │   ├── file.ext              # Purpose
   │   └── another-file.ext      # Purpose
   └── another-subdirectory/     # Purpose
   ```

3. **Implementation Rules**
   - File naming patterns
   - Organization guidelines
   - Dependency management
   - Type safety requirements

### Framework-Specific Structure Requirements
Provide highly detailed structure for the project's chosen framework architecture:

1. **Application Organization**
   - Route/page organization
   - Component hierarchy
   - State management
   - API integration
   - Error handling

2. **Component Structure**
   - Clear separation between component types
   - Detailed subcomponent organization
   - Component co-location patterns
   - Type definitions placement

3. **Core Systems Structure**
   - Application core utilities
   - Theme/styling system structure
   - Animation utilities
   - Responsive design utilities
   - Custom hooks/services organization

4. **Type System Organization**
   - Global types
   - Component types
   - API types
   - Utility types

### Quality Requirements

1. **Clarity and Precision**
   - Unambiguous directory purposes
   - Clear file naming conventions
   - Explicit organization rules
   - Comprehensive documentation

2. **Maintainability**
   - Logical grouping of files
   - Clear separation of concerns
   - Scalable structure
   - Future-proof organization

3. **Type Safety**
   - Type definition placement
   - Import/export patterns
   - Type organization
   - Type safety guidelines

4. **Performance**
   - Code splitting considerations
   - Bundle optimization
   - Asset organization
   - Cache strategies

## Structure Generation Guidelines

### 1. Project Analysis
- Review technical requirements
- Understand architectural decisions
- Consider scalability needs
- Evaluate maintenance requirements
- Identify patterns that must be preserved

### 2. Directory Planning
- Group by feature/domain
- Consider code splitting
- Plan for scalability
- Account for all file types
- Create a comprehensive component hierarchy

### 3. Naming Conventions
- Consistent patterns
- Clear purpose indication
- Technology-specific standards
- Cross-platform compatibility
- Framework-specific conventions

### 4. Implementation Rules
- Clear guidelines
- Specific examples
- Edge case handling
- Migration considerations
- Component boundaries and patterns

### 5. Quality Standards
- Code organization rules
- Performance requirements
- Security considerations
- Documentation standards
- Accessibility guidelines
- Responsive design standards

## Success Criteria

### Completeness
- [ ] All required directories defined
- [ ] File organization specified
- [ ] Naming conventions established
- [ ] Implementation rules provided
- [ ] Framework-specific patterns documented

### Clarity
- [ ] Clear directory purposes
- [ ] Unambiguous organization
- [ ] Explicit guidelines
- [ ] Comprehensive examples
- [ ] Readable code blocks with comments

### Technical Alignment
- [ ] Matches architecture requirements
- [ ] Supports technical stack
- [ ] Enables type safety
- [ ] Facilitates testing
- [ ] Preserves essential patterns

### Maintainability
- [ ] Logical organization
- [ ] Scalable structure
- [ ] Clear boundaries
- [ ] Future-proof design
- [ ] Consistent patterns

## Document Generation Workflow
1. Analyze project requirements thoroughly
2. Define root structure based on project type
3. Detail each directory's organization
4. Establish clear implementation rules
5. Document quality standards
6. Validate against success criteria

## Output Location
- Save the completed **Structure Specification Document** in:
  ```
  C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\product\04-aplio-mod-1-structure.md
  ```

## Additional Guidelines

### 1. Technology-Specific Considerations
- Framework best practices
- Language conventions
- Design patterns
- Component organization strategies
- State management approaches

### 2. Cross-Cutting Concerns
- Security implications
- Performance impact
- Testing organization
- Documentation placement
- Accessibility standards

### 3. Future-Proofing
- Scalability considerations
- Extension points
- Version control
- Dependency management
- Migration paths

### 4. Implementation Support
- Clear examples
- Common patterns
- Edge cases
- Migration guidance
- Legacy behavior preservation techniques

Remember: The structure specification must be precise and comprehensive, as it will serve as the foundation for the entire project's organization. AI agents will rely on this document for consistent implementation, so clarity and completeness are essential. 

### 5. Markdown Formatting Guidelines
- Use markdown headers for main sections (`#`, `##`, `###`)
- Include horizontal rules (`---`) between major sections
- Format directory structures in code blocks with comments
- Use bullet points for lists of requirements
- Use checkbox lists (`- [ ]`) for quality standards
- Include bold text for important concepts
- Maintain consistent indentation in code blocks
- Add comments to indicate file/directory purposes 

