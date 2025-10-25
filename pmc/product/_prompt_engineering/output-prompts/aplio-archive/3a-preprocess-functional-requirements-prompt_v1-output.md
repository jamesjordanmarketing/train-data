# Functional Requirements Organization Prompt

## Product Summary
The Next.js 14 Modernization for Aplio Design System represents a strategic transformation of the Aplio Design System Theme, focusing on migrating the Home 4 template (https://js-aplio-6.vercel.app/home-4) as our flagship demonstration. This initiative is centered around preserving the exceptional design aesthetics and user experience from our legacy codebase while implementing modern architectural patterns and development practices.

Our legacy product has proven highly successful in delivering beautiful, professional websites that users love. This modernization effort will maintain every aspect of this premium design while upgrading the technical foundation through a systematic design system extraction and modern implementation approach.

## Your Role
You are a Senior Technical Product Manager. Your task is to organize the script-generated Functional Requirements (FR) document into a logical build order while removing non-product requirements.

## File Processing Instructions

1. **Input/Output File**
   - Process file: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\product\03-aplio-mod-1-functional-requirements.md`
   - You MUST process the ENTIRE `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\product\03-aplio-mod-1-functional-requirements.md` document from start to finish
   - Create complete inventory of all FRs before beginning reorganization
   - Verify no FRs are missing from original count
   - Modify this file directly - do not create new files
   - Generate a complete updated version of the entire document
   - Maintain the existing markdown format
   
2. **Reference Files**
- **Overview Document:** `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\product\01-aplio-mod-1-overview.md`
  - Contains project goals, technical stack, and architectural decisions.
- **User Stories:** `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\product\02-aplio-mod-1-user-stories.md`
  - Details the functional requirements and user needs.

3. **Output Format**
   - Keep the original file header
   - Use the same FR structure format
   - Update content following the organization steps below

## Input Requirements

1. Read and analyze:
   - The script-generated FR document - `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\product\03-aplio-mod-1-functional-requirements.md`
   - User Stories `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\product\02-aplio-mod-1-user-stories.md`
   - Overview Document `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\product\01-aplio-mod-1-overview.md`

## Primary Tasks

### 1. Remove Non-Product Requirements
- Remove any FR that does not directly affect the software product build
- Common removals include:
  * Market positioning requirements
  * Business metrics not affecting product
  * General development efficiency
  * Cost reduction metrics
  * Team performance metrics
- Preserve any acceptance criteria from removed FRs that specify product functionality

### 2. Remove Duplicate Requirements
- Identify and merge duplicate/near-duplicate FRs
- Preserve all unique acceptance criteria
- Ensure merged requirements maintain all US references
- Fix any duplicate FR numbers by assigning new unique numbers

### 3. Reorder Requirements
Organize FRs following this logical build progression. Note that these are NOT strict sections but rather a guide to understanding build dependencies. Each logical group may span multiple sections in the final FR document:

A. Foundation Layer
   - Core config/setup
   - Base architecture
   - Development environment
   - Security foundation
   - Build and deployment setup
   - Core tooling and frameworks

B. Infrastructure Layer
   - Data management
   - Service architecture
   - Error handling
   - Logging/monitoring
   - System integration points
   - Core services setup

C. Base Components Layer
   - Shared components
   - Core layouts
   - Base UI elements
   - Common utilities
   - Design system foundations
   - Styling infrastructure

D. Primary Features Layer
   - Main user workflows
   - Essential functions
   - Core interactions
   - Primary interfaces
   - Key business logic
   - Core user journeys

E. Advanced Features Layer
   - Complex workflows
   - Advanced capabilities
   - Integration features
   - Enhanced functions
   - Extended functionality
   - Advanced interactions

F. Cross-Cutting Layer
   - Performance requirements
   - Security features
   - Accessibility requirements
   - Testing framework
   - System-wide concerns
   - Quality attributes

IMPORTANT ORGANIZATION RULES:
1. These logical groups are guidelines for understanding dependencies, NOT strict section constraints
2. The final FR document may have MORE or FEWER sections than these logical groups
3. A single logical group might span multiple sections in the final document
4. Multiple logical groups might be combined into a single section if it makes sense
5. The final organization should reflect the project's specific needs
6. Focus on dependencies and relationships, not strict categorization
7. Requirements should be grouped based on their natural relationships and dependencies
8. Section numbers in the final document are independent of these logical groups
9. New sections can be created as needed to better organize the specific requirements
10. The goal is clear organization that serves the project, not forcing requirements into predefined categories

## Output Requirements

1. **Maintain FR Document Structure**
   ```markdown
   ## [Category Number]. [Category Name]
   
   - **FR[X.Y.Z]:** [Requirement Name]
     * Description: [Clear product requirement]
     * Impact Weighting: [Business impact]
     * Priority: [Priority level]
     * User Stories: [US references]
     * Tasks: [T- references]
     * User Story Acceptance Criteria: [From US]
     * Functional Requirements Acceptance Criteria: [FR specific]
   ```

2. **Update Section Numbering (REQUIRED)**
   - Adjust all section numbers sequentially starting from 1
   - Reassign ALL FR numbers using this scheme:
     * First number matches the section number
     * Second number for major feature grouping
     * Third number for individual requirements
     * Example: FR in section "Core Infrastructure" becomes FRN.X.Y where N is the section number
   - Every FR must be renumbered - no exceptions
   - IMPORTANT: Keep the original User Story references (USX.Y.Z) in the "User Stories:" attribute unchanged to maintain traceability
   - Document all FR number changes in the change log

3. **Preserve Required Elements**
   - All product-specific requirements
   - All User Story acceptance criteria affecting product
   - Impact weightings and priorities
   - Each FR has a blank section for the Functional Requirements Acceptance Criteria. That is NOT to be filled. It is to be left blank with the comment: "To be filled"

4. **Change Logging Requirements**
1. Each atomic change MUST be logged individually in `pmc\product\_tools\cache\aplio-mod-1-fr-changes.log`:
   - Each FR modification MUST generate multiple log entries, one for each:
     * Acceptance criteria movement or modification
     * Priority or impact weight change
     * Description modification
     * User Story reference change
     * Task reference change
   - FORMAT: [ID/Type] -> [Action] -> [Destination] | REASON: [Detailed Rationale]
   - Related changes MUST be grouped using change group IDs:

## Rules and Guidelines

1. **Keep Focus on Product Build**
   - Every FR must specify something buildable
   - Every acceptance criterion must be testable
   - Remove requirements not affecting product functionality

2. **Maintain Traceability**
   - Preserve all User Story references
   - Keep existing User Story (USX.Y.Z) references
   - Document all removed/merged requirements

3. **Ensure Completeness**
   - Process entire document
   - Handle all sections
   - Resolve all duplicate numbers
   - Remove all non-product content

Begin your analysis now. Process the entire document systematically following these steps. Provide a brief explanation for major organizational decisions.