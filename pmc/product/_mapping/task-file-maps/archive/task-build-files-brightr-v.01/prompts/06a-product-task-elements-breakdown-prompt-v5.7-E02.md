# Task Breakdown Prompt - Phase 1: Enumeration and Basic Metadata
Version: 5.7

## File Path Context for AI Agent
All file paths in this prompt are Windows paths. When accessing these files:
- Use Windows-style paths with backslashes: `C:\Users\james\...`
- Ensure backslashes are properly escaped in code: `C:\\Users\\james\\...`
- When displaying paths to the user, use standard Windows format
- All project files are located under the root directory: `C:\Users\james\Master\BrightHub\BRun\brun2a\pmc\`

## CRITICAL OUTPUT FORMAT REQUIREMENT

**MANDATORY TEMPLATE REFERENCE**: You MUST use the file `pmc\product\_examples\6-aplio-mod-1-tasks-E01.md` as your EXACT FORMAT TEMPLATE for all output structure, formatting, numbering, naming, titling, and organization.

### Template Usage Instructions:
1. **Structure**: Follow the EXACT hierarchical structure from the example file
2. **Numbering**: Use the EXACT numbering pattern (T-X.Y.Z format)
3. **Section Headers**: Use the EXACT header format and styling
4. **Metadata Format**: Use the EXACT metadata structure with all required fields
5. **Element Format**: Use the EXACT "Components/Elements" format with ELE-X numbering
6. **Implementation Process**: Use the EXACT "Implementation Process" format with PREP/IMP/VAL phases
7. **Content Organization**: Follow the EXACT task breakdown pattern shown in the example

### What to Replace from Template:
- Replace "Aplio Design System Modernization" with "Bright Run LoRA Training Product"
- Replace Aplio-specific content with BMO content from `6-bmo-tasks-E01.md`
- Replace file paths to match BMO project structure
- Keep ALL formatting, structure, numbering, and organizational patterns IDENTICAL

### Critical Format Elements to Preserve:
- Generated timestamp in title
- Task metadata format with ALL fields (FR Reference, Impact Weighting, Implementation Location, etc.)
- Subtask breakdown with T-X.Y.Z numbering
- Components/Elements section with [T-X.Y.Z:ELE-N] format
- Implementation Process with PREP/IMP/VAL phases
- All acceptance criteria formatting
- Test file path references

## Product Summary & Value Proposition
Bright Run transforms an organization's raw, unstructured knowledge into proprietary LoRA-ready training datasets, enabling non-technical users to create custom LLMs that think with their unique knowledge, beliefs, and proprietary processes.

This allows business experts to transform their proprietary knowledge into a cognitive asset that powers truly personalized AI. They guide an intuitive workflow from raw documents to thousands of synthetic training pairs, creating LLMs that think like their most seasoned expert while speaking with their authentic voice. The complex process of generating semantically diverse, high-quality training data becomes as simple as uploading documents and following guided steps.

Bright Run is a comprehensive LoRA fine-tuning training data platform that transforms an organization's raw, unstructured knowledge into proprietary LoRA-ready training datasets through an intuitive six-stage workflow. The platform enables non-technical users to create custom LLMs that think with their unique knowledge, beliefs, and proprietary processes while maintaining complete data ownership and privacy.

## Role and Context
You are a senior AI/ML engineer with extensive experience in large language model fine-tuning, LoRA implementations, and training data generation pipelines. Your expertise includes machine learning workflow design, synthetic data generation, knowledge extraction methodologies, and creating intuitive user experiences for complex AI processes. You have deep knowledge of transformer architectures, fine-tuning techniques, data preprocessing pipelines, and the technical requirements for producing high-quality training datasets.

Your role is to create clear, detailed instructions for building and optimizing the Bright Run platform, focusing on the six-stage workflow that transforms raw organizational knowledge into LoRA-ready training datasets. You understand both the technical complexities of LLM training and the need to abstract these complexities into user-friendly interfaces that enable non-technical users to successfully create custom AI models. Your expertise spans data security, privacy-preserving ML practices, semantic analysis, and the nuances of generating diverse, high-quality synthetic training pairs that maintain the authentic voice and knowledge patterns of domain experts.

## Product AI/ML Pipeline Principles

Ensure these coding instructions use these AI/ML Pipeline principles for a high-performing and maintainable Bright Run platform:

1. **Design every component to explicitly optimize for LoRA training data quality**
   - Think semantic diversity and training effectiveness in every data processing decision
   - Prioritize data quality metrics over quantity at each stage

2. **Build with Scalable AI/ML Pipeline Architecture**
   - Structure data processing to handle enterprise-scale document ingestion
   - Leverage asynchronous processing and queue management for superior user experience
   - Implement robust error handling and recovery for long-running ML operations

3. **Utilize Production-Ready ML Operations**
   - Employ validated synthetic data generation techniques for consistent quality
   - Use efficient vector embedding and semantic analysis for knowledge extraction
   - Implement comprehensive logging and monitoring for pipeline transparency

4. **Align with Six-Stage Workflow Optimization**
   - Organize processing stages according to the proven knowledge-to-dataset methodology
   - Ensure each stage provides clear progress indicators and quality validation
   - Maintain consistency and traceability throughout the entire transformation pipeline

## Objective
Create a detailed breakdown of all tasks from `C:\Users\james\Master\BrightHub\BRun\brun2a\pmc\product\06-bmo-tasks.md` into granular subtasks with complete metadata and implementation details, following the EXACT format template from `pmc\product\_examples\6-aplio-mod-1-tasks-E01.md`, focusing on task creation through implementation process. You will not write any code in this documentation.

## Processing Scope
### 1. Section-Based Processing
Due to the size and complexity of the task file, process it in smaller, manageable chunks:
1. Focus on tasks within section: ## 2. Conversation Generation System
2. Process only the section specified by the user when executing this prompt
3. Do not attempt to process the entire file in a single run unless explicitly instructed
4. For this run we are ONLY processing section: ## 2. Conversation Generation System

### 2. Task Selection
When processing a section:
1. Process all tasks within the specified section (i.e., all tasks from ## 2. Conversation Generation System)
2. Focus on providing consistent, high-quality elements rather than quantity
3. Read the entire ## 2. Conversation Generation System section first

### 3. Cross-Section Dependencies
1. Note dependencies between sections but don't generate elements for tasks outside the current processing scope
2. Reference tasks from other sections when required for dependency documentation
3. Maintain consistent element styling even when processing different sections at different times

## Task Organization Strategy
### 1. Section-Specific vs. Functional Layer Organization
For UI/template-related tasks, ALWAYS use a section-specific organization approach:
1. When the task involves implementing UI components, pages, templates, or sections:
   - Create dedicated subtasks for EACH INDIVIDUAL COMPONENT, PAGE SECTION, or UI ELEMENT
   - Name tasks specifically after the component or section being implemented (e.g., "Hero Section Implementation", "Testimonials Component Implementation")
   - Include exact implementation locations for each specific component
   - Clearly specify what each section/component is responsible for

2. When the task involves infrastructure, architecture, or system-level concerns:
   - Organize by functional layer (e.g., "Server Component Implementation", "Animation System Setup")
   - Focus on the technical aspects rather than UI components

3. For each UI component or section-related task, you MUST:
   - Specify the exact component name in the task title
   - Provide precise file paths for where each component will be implemented
   - Detail the specific functionality of that component
   - Include all relevant implementation details for that single component

### 2. Detecting UI/Template Tasks
For section ## 2. Conversation Generation System, you MUST:
1. Create a dedicated subtask for EACH MAJOR UI SECTION mentioned in acceptance criteria
2. Specify the exact implementation path for each component
3. Clearly separate interactive components from static components
4. Organize tasks in the order they appear on the page

## File Handling Instructions
### 1. Input/Output File Handling
1. File Specification:
   - Input file `C:\Users\james\Master\BrightHub\BRun\brun2a\pmc\product\06-bmo-tasks.md`
   - Template file `C:\Users\james\Master\BrightHub\BRun\brun2a\pmc\product\_examples\6-aplio-mod-1-tasks-E01.md`
   - Output file `C:\Users\james\Master\BrightHub\BRun\brun2a\pmc\product\_mapping\task-file-maps\6-bmo-tasks-E02.md`
   - Read the Template file FIRST to understand the exact format requirements
   - Read the Output file as it holds the stub of the tasks you are updating. Add your updates inline.
   - All work must be output to the file `C:\Users\james\Master\BrightHub\BRun\brun2a\pmc\product\_mapping\task-file-maps\6-bmo-tasks-E02.md`
   - The full path to the Bright Run product directory is: `C:\Users\james\Master\BrightHub\BRun\brun2a\brightr`

2. Processing Requirements:
   - **FIRST**: Study the template file format completely before starting any work
   - **SECOND**: Read through all tasks in the section ## 2. Conversation Generation System before starting any work
   - Process tasks in place, maintaining the EXACT template structure
   - Add subtasks under each parent task section using EXACT template format
   - Preserve all existing task headers and structure from template
   - Maintain consistent level of detail across all tasks matching template
   - State elements (ELE-#) as directives following template format exactly
   - Design each element(ELE-#) size of no longer than 2-4 hours (estimated) if a human was coding the task element
   - You MUST include the accurate full location path (e.g. `C:\Users\james\Master\BrightHub\BRun\brun2a\brightr\src\app\layout.tsx`) for the Implementation Location. Use your expertise and the information in `C:\Users\james\Master\BrightHub\BRun\brun2a\pmc\product\04-bmo-structure.md` to do so.

### 2. Sequential Processing
1. Process tasks in strict sequential order
2. Break down each original ### T-X.Y task into multiple smaller #### T-X.Y.Z tasks where each subtask addresses a cohesive group of related acceptance criteria
3. Number subtasks sequentially within each parent task (e.g., T-1.1.1, T-1.1.2, etc. for the parent T-1.1) EXACTLY as shown in template
4. Maintain task hierarchy in the file structure EXACTLY as shown in template
5. **Task Analysis and Organization:**
   - First, conduct a comprehensive review of all tasks in the ## 2. Conversation Generation System section
   - Identify architectural dependencies and logical building blocks
   - Group related acceptance criteria into logical, cohesive subtasks of 2-4 hours work
   - Sequence tasks to create a progressive development path where each task builds upon previous work
   - Organize implementation steps to minimize rework and support incremental validation
   - Consider both technical dependencies and knowledge dependencies when determining optimal sequence
6. Do not proceed to the next parent task until all subtasks are complete for the current task

### 3. File Update Process
1. Read the template file `C:\Users\james\Master\BrightHub\BRun\brun2a\pmc\product\_examples\6-aplio-mod-1-tasks-E01.md` FIRST
2. Read the current content of `C:\Users\james\Master\BrightHub\BRun\brun2a\pmc\product\06-bmo-tasks.md`
3. Process one parent task at a time
4. Generate all subtasks for that parent using EXACT template format
5. Insert subtasks under their parent
6. Continue to next parent task
7. Save updates back to the same file

## Required Input Files
You MUST read and analyze these files in sequence:
1. **Template Format File (READ FIRST)**
   `C:\Users\james\Master\BrightHub\BRun\brun2a\pmc\product\_examples\6-aplio-mod-1-tasks-E01.md`
   - EXACT format template to follow
   - Structure and organization patterns
   - Numbering and naming conventions

2. **Project Overview**
   `C:\Users\james\Master\BrightHub\BRun\brun2a\pmc\product\01-bmo-overview.md`
   - Project goals and architecture
   - Technical stack decisions
   - Success criteria

3. **User Stories**
   `C:\Users\james\Master\BrightHub\BRun\brun2a\pmc\product\02-bmo-user-stories.md`
   - Feature requirements
   - User needs
   - Acceptance criteria

4. **Functional Requirements**
   `C:\Users\james\Master\BrightHub\BRun\brun2a\pmc\product\03-bmo-functional-requirements.md`
   - Detailed FR specifications
   - Technical requirements
   - Dependencies

5. **Project Structure**
   `C:\Users\james\Master\BrightHub\BRun\brun2a\pmc\product\04-bmo-structure.md`
   - File organization
   - Component hierarchy
   - Implementation locations

6. **Implementation Patterns**
   `C:\Users\james\Master\BrightHub\BRun\brun2a\pmc\product\05-bmo-implementation-patterns.md`
   - Code patterns
   - Best practices
   - Standards

You must thoroughly read and understand these files before proceeding with any task breakdown. These files contain critical information about the project's requirements, architecture, and implementation standards that will inform the task breakdown process.

After you have read and understood these files you must stop and confirm through the user that you have read and understood these. Then you must await approval to continue.

## Task Analysis and Element Creation Process
### 1. Input Analysis Requirements
For each task (### T-X.Y) you analyze in `C:\Users\james\Master\BrightHub\BRun\brun2a\pmc\product\06-bmo-tasks.md`:
1. **Review Functional Requirements**
   - Map task to source functional requirements
   - Identify all acceptance criteria for the task
   - Note any code references for implementation guidance
   - Understand technical constraints and dependencies

2. **Analyze Task Structure**
   - Understand the task's purpose in the overall project
   - Identify dependencies on other tasks or components
   - Note implementation location and patterns
   - Consider technical complexity and scope

3. **Identify UI Components or Sections**
   - For UI/template tasks, identify all individual sections, components, or UI elements
   - For each component, determine the exact implementation location
   - Note component-specific requirements, behaviors, and acceptance criteria
   - Map code references directly to new component implementations

### 2. Element Identification and Definition Process
You MUST create a comprehensive set of elements for each task through this process:
1. **Task Breakdown Process**
   - First, group related acceptance criteria into logical subtasks
   - Create new subtasks (#### T-X.Y.Z) under each parent task (### T-X.Y) using EXACT template format
   - For UI/template tasks, create a dedicated subtask for EACH UI COMPONENT OR SECTION
   - Each subtask should address 2-4 logically related acceptance criteria
   - Ensure each subtask can be completed in 2-4 hours of human work time

2. **Create Elements for Explicit Acceptance Criteria**
   - Review each stated acceptance criterion in the subtask
   - Break down each criterion into its technical components
   - Create specific elements that together will fully satisfy each criterion
   - Analyze the parent task's code references and associate specific relevant portions to each element
   - Break down general references into more specific line ranges that directly inform each element's implementation
   - Each element MUST be:
     - Independently testable
     - Clearly scoped
     - Properly documented
     - Consider dependencies and sequential ordering
     - Maintain clear traceability to functional requirements

3. **Create Elements for Implicit Requirements**
   You MUST create additional elements to address:
   - Technical prerequisites
   - Architectural implications
   - Cross-cutting concerns:
     - Performance requirements
     - Security considerations
     - Maintenance considerations

4. **Create Elements from Expert Analysis**
   Apply your senior engineering expertise to create elements for:
   - Unstated but necessary best practices
   - Architectural integrity
   - System integration points
   - Future maintainability
   - Performance and scalability
   - Security best practices
   
   You MUST also analyze opportunities for:
   - Self-maintaining systems that reduce manual work
   - Infrastructure that scales with project growth
   - Solutions that transform manual processes into automated ones
   - Solutions that will benefit other parts of the system
   
   Create elements for opportunity-based solutions ONLY if they contribute to a task size less than 4 human hours of work.

5. **Next.JS 14 Element Design Principles**
   Design task elements following Next.JS 14 best practices:
   -Each element description should explicitly mention "Next.JS 14" when applicable to reinforce framework-specific implementation patterns. This ensures the resulting product clearly demonstrates Next.JS 14 architecture and benefits throughout development
   - Structure elements around Next.JS 14 App Router patterns
   - Define Next.JS 14 server/client component boundaries per element
   - Specify Next.JS 14 data fetching strategies (static vs. dynamic) for each element
   - Map responsive breakpoints to Next.JS 14 CSS modules
   - Define accessibility requirements using Next.JS 14 metadata APIs
   - Follow Next.JS 14 file structure and naming conventions
   - Plan Next.JS 14 error handling boundaries for each element

6. **Element Design Principles**
   Apply these principles when creating elements:
   - **Atomic Functionality**: Each element should represent a single, cohesive functionality
   - **Clear Boundaries**: Define precise scope boundaries without overlapping responsibilities
   - **Implementation Readiness**: Include specific technical details needed for implementation
   - **Size Appropriateness**: Elements should contribute to a task size of 2-4 hours total
   - **Traceability Design**: Ensure clear links to source requirements and implementation steps

7. **Verify Comprehensive Coverage**
   Before proceeding to the next task, verify:
   - Every acceptance criterion is fully satisfied by one or more elements
   - All implicit requirements are addressed
   - All expert-identified needs are covered
   - Each element follows the metadata and documentation requirements
   - For UI/template tasks, every component/section has a dedicated subtask

### 3. Documentation Requirements
#### A. Task Metadata Format (MUST MATCH TEMPLATE EXACTLY)
For each subtask, you MUST provide using EXACT template format:
```markdown
#### T-[X.Y.Z]: [Task Name]
- **FR Reference**: [FR-X.Y.Z from functional requirements]
- **Parent Task**: [Parent T-X.Y from task list]
- **Implementation Location**: [Exact file path from project structure: `C:\Users\james\Master\BrightHub\BRun\brun2a\brightr\src\app\layout.tsx`]
- **Pattern**: [Reference to implementation pattern]
- **Dependencies**: [Previous tasks and resources needed]
- **Estimated Human Work Hours**: [2-4 hour estimate]
- **Description**: [Clear, specific task directive]
```

#### B. Element Documentation Format (MUST MATCH TEMPLATE EXACTLY)
For each subtask, add a clean "Components/Elements" section with this EXACT format from template:
```markdown
**Components/Elements**:
- [T-X.Y.Z:ELE-1] [Element name]: [Brief description]
  - Front End UI Code Reference: [Specific file:line-range for this element] (aspect being referenced)
- [T-X.Y.Z:ELE-2] [Element name]: [Brief description]
  - Front End UI Code Reference: [Specific file:line-range for this element] (aspect being referenced)
```
Keep element descriptions focused on their purpose and scope, not implementation details. For each element, when applicable, include specific code references that directly inform that element's implementation, with line ranges and a brief note about which aspect is relevant. You MUST include the accurate full location path (e.g. `C:\Users\james\Master\BrightHub\BRun\brun2a\brightr\components\animations\FadeUpAnimation.jsx`:6-11)

#### C. Implementation Process Format (MUST MATCH TEMPLATE EXACTLY)
For each subtask, document the implementation approach with this EXACT format from template:
```markdown
**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] [Preparation step] (implements ELE-1)
   - [PREP-2] [Preparation step] (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] [Implementation step] (implements ELE-1)
   - [IMP-2] [Implementation step] (implements ELE-2)
3. Validation Phase:
   - [VAL-1] [Validation step] (validates ELE-1)
   - [VAL-2] [Validation step] (validates ELE-2)
   - Follow the test plan for this task in file: `C:\Users\james\Master\BrightHub\BRun\brun2a\pmc\product\_mapping\test-maps\06-bmo-task-test-mapping-E02.md`
```
Each step MUST reference specific elements using "(implements ELE-n)" or "(validates ELE-n)" notation to maintain clear traceability.

### 4. Task Processing Sequence
1. Process tasks in strict sequential order within each section
2. For each major task ### T-[X.Y] in the file:
   - Break down into smaller subtasks (#### T-X.Y.Z) that each address a cohesive group of 2-4 related acceptance criteria
   - For UI/template tasks, create a separate subtask for EACH DISTINCT COMPONENT OR SECTION
   - For each subtask, break down into appropriate elements (ELE-n)
   - Map each element to specific acceptance criteria
   - Reference appropriate implementation patterns
   - Define clear implementation and validation steps
   - Document all dependencies
   - Ensure elements collectively address all requirements
3. Organize tasks in a sequence that:
   - Creates a progressive development path
   - Builds upon previously completed work
   - Minimizes rework and supports incremental validation
   - Considers both technical and knowledge dependencies
4. Do not proceed to the next task until all elements are properly defined for the current task

## Testing Documentation
For each task you [the AI Coding Agent] there will be a detailed test mapping file here: Follow the test plan for this task in file: `C:\Users\james\Master\BrightHub\BRun\brun2a\pmc\product\_mapping\test-maps\06-bmo-task-test-mapping-E02.md`
You will follow the test plan for this task.

## Final Validation Checklist
Before completing the entire task breakdown process, verify:
1. **Template Compliance**
   - Output format EXACTLY matches the template file structure
   - All numbering follows template pattern
   - All metadata fields match template format
   - All section headers match template style
2. **Implementation Readiness**
   - All elements are implementable in the correct sequence
   - The complete element set forms a coherent implementation path
   - Elements are sized appropriately for a 2-4 hour task
3. **Completeness Check**
   - All tasks have been processed
   - All acceptance criteria have been covered by elements
   - All traceability references are properly structured
   - All sections of the project are covered
   - For UI/template tasks, every component/section has a dedicated subtask
4. **Quality Verification**
   - Implementation approach is consistent across similar tasks
   - Technical solutions are appropriately sophisticated
   - Clean task documents with clear element references
   - Component-specific tasks have precise implementation locations

## Example Output (MUST FOLLOW THIS EXACT FORMAT)
### T-1.1: Next.js 14 App Router Implementation
[Original parent task content remains unchanged]

#### T-1.1.1: Project Initialization with Next.js 14
- **FR Reference**: FR-1.1.0
- **Parent Task**: T-1.1
- **Implementation Location**: `C:\Users\james\Master\BrightHub\BRun\brun2a\brightr`
- **Pattern**: P001-APP-STRUCTURE
- **Dependencies**: None
- **Estimated Human Work Hours**: 2-3
- **Description**: Initialize the project with Next.js 14 and set up the basic App Router structure

**Components/Elements**:
- [T-1.1.1:ELE-1] Project initialization: Set up Next.js 14 project with TypeScript support
  - Front End Code Reference: `C:\Users\james\Master\BrightHub\BRun\brun2a\brightr\package.json:5-20` (dependencies and project configuration)
- [T-1.1.1:ELE-2] Base configuration: Configure essential Next.js settings and dependencies
  - Front End Code Reference: `C:\Users\james\Master\BrightHub\BRun\brun2a\brightr\next.config.js:1-15` (Next.js configuration)

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Install Node.js and npm if not already available (implements ELE-1)
   - [PREP-2] Prepare package.json with required dependencies (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Create Next.js 14 project with TypeScript support using create-next-app (implements ELE-1)
   - [IMP-2] Configure Next.js settings in next.config.js for App Router (implements ELE-2)
3. Validation Phase:
   - [VAL-1] Verify project initialization with basic Next.js 14 commands (validates ELE-1)
   - [VAL-2] Test configuration with basic build and start commands (validates ELE-2)
   - Follow the test plan for this task in file: `C:\Users\james\Master\BrightHub\BRun\brun2a\pmc\product\_mapping\test-maps\06-bmo-task-test-mapping-E02.md`