# Project Memory Core (PMC) Complete Tutorial - Steps 1-7
**Version:** 1.0  
**Date:** September 2025  
**Product Example:** Bright Run LoRA Fine-Tuning Training Data Platform  
**Project Abbreviation:** bmo

## Introduction

This comprehensive tutorial guides you through the complete Project Memory Core (PMC) workflow, transforming a project concept into detailed implementation tasks with full traceability and testing specifications. 

The PMC system creates a structured development pipeline that ensures no requirements are missed, all features are properly tested, and complete documentation is maintained throughout the project lifecycle.

## Prerequisites

1. Node.js installed on your computer
2. Access to the pmc directory
3. AI assistant (Cursor or similar) for processing generated prompts

## PMC Workflow Overview

The complete PMC process follows these sequential steps:

1. **Step 1**: Generate Overview Document
2. **Step 2**: Generate User Stories 
3. **Step 3**: Generate Functional Requirements (2-phase process)
4. ~~**Step 4**: Generate Structure~~ (No longer done)
5. ~~**Step 5**: Generate Implementation Patterns~~ (No longer done)  
6. **Step 6**: Generate Tasks (multi-phase process)
7. **Step 7**: Generate Test Mapping

---

## Step 1: Generate Overview Document

### Purpose
Creates comprehensive project overview document serving as the foundation for all subsequent documentation.

### Input Files Required
- **Seed Narrative**: `pmc/product/_seeds/seed-narrative-v1.md`
- **Overview Template**: `pmc/product/_templates/01-overview-template.md`

### Output File
- `pmc/product/01-bmo-overview.md`

### Command Syntax
```bash
cd pmc/product/_tools/
node 01-02-generate-product-specs.js "Bright Run LoRA Fine-Tuning Training Data Platform" bmo
```

### Process Flow
1. Script loads prompt template for overview generation  
2. Asks for file paths to referenced documents
3. Option to include codebase review (y/n, default: n)
4. Generates and saves overview prompt to `_run-prompts/` directory
5. You copy/paste this prompt into AI assistant
6. AI generates overview document which you save manually

### Key Features Generated
- Project scope and objectives
- Technical architecture overview
- Stakeholder analysis
- Success metrics and KPIs
- Implementation approach
- Risk assessment

---

## Step 2: Generate User Stories

### Purpose
Creates detailed user stories that capture all stakeholder needs and form the foundation for functional requirements.

### Input Files Required  
- **Overview Document**: `pmc/product/01-bmo-overview.md`
- **User Stories Template**: `pmc/product/_templates/02-user-stories-template.md`
- **Example Reference**: `pmc/product/_examples/02-aplio-mod-1-user-stories.md`

### Output File
- `pmc/product/02-bmo-user-stories.md`

### Command Syntax
```bash
cd pmc/product/_tools/
node 01-02-generate-product-specs.js "Bright Run LoRA Fine-Tuning Training Data Platform" bmo
```

### Process Flow
1. Overview prompt is generated first (Step 1)
2. Script asks if you want to proceed with user stories
3. User stories prompt is generated and saved
4. You copy/paste prompt into AI assistant  
5. AI generates user stories document

### Key Story Components
Each user story includes:
- **Unique ID**: US[X.Y.Z] format
- **Role**: Specific stakeholder (Small Business Owner, Domain Expert, etc.)
- **Story Format**: "As a [role], I want [feature] so that [benefit]"
- **Impact Weighting**: Revenue Impact/Strategic Growth/Operational Efficiency
- **Acceptance Criteria**: Detailed, testable requirements
- **Priority**: High/Medium/Low
- **FR Mapping**: Placeholder for functional requirements

### User Story Output Specifications

Based on the wireframe output examples in `pmc/product/_mapping/fr-maps/04-bmo-FR-wireframes-output-E01.md`, user stories must include these specific output specifications:

**Context Integration Requirements:**
- Each story must integrate Journey context with specific stage goals, emotional requirements, and progressive disclosure levels
- Stories must adapt to unified interface serving all personas without technical barriers

**Acceptance Criteria Format:**
- Use hybrid approach with both User Journey and Technical acceptance criteria
- User Journey criteria: GIVEN/WHEN/THEN/AND format with 5-8+ detailed statements
- Technical criteria: 3-5+ specific technical requirements with measurable benchmarks

**UI Requirement Mapping:**
- Each user story must map to specific UI components and interactive states
- Include comprehensive state definitions: Empty/Valid/Invalid/Loading/Error/Success
- Document responsive behavior and progressive disclosure patterns

**Example Enhanced User Story Format:**
```markdown
- **US1.1.1: Create Project Workspace**
  - **Role**: Small Business Owner
  - *As a Small Business Owner, I want to create organized project workspaces so that I can manage my LoRA training data projects efficiently*
  - **Impact Weighting**: Strategic Growth
  - **User Journey Acceptance Criteria**:
    - GIVEN I am a new user accessing the platform
    - WHEN I initiate project workspace creation  
    - THEN I see a guided wizard with step-by-step setup
    - AND the wizard uses business-friendly language without technical jargon
    - AND I can provide descriptive names and purposes for my project
    - AND smart defaults are applied based on my business context
    - AND I receive immediate confirmation of successful creation
  - **Technical Acceptance Criteria**:
    - System creates organized file structure with metadata storage
    - Workspace initialization includes status tracking capabilities
    - Project naming includes validation and conflict prevention
    - Real-time progress indicators show setup completion status
  - **Priority**: High
  - **FR Mapping**: [To be populated]
```

---

## Step 3: Generate Functional Requirements (2-Phase Process)

### Purpose
Transforms user stories into detailed technical requirements through preprocessing and enhancement phases.

### Phase 3A: Preprocessing Functional Requirements

#### Input Files Required
- **User Stories**: `pmc/product/02-bmo-user-stories.md`  
- **Overview**: `pmc/product/01-bmo-overview.md`
- **Preprocessing Template**: `pmc/product/_prompt_engineering/3a-preprocess-functional-requirements-prompt_v1.md`

#### Command Syntax
```bash
cd pmc/product/_tools/
node 03-generate-functional-requirements.js "Bright Run LoRA Fine-Tuning Training Data Platform" bmo
```

#### Process Flow
1. Script generates preprocessing prompt
2. You copy/paste prompt into AI assistant
3. AI processes and cleans up requirements:
   - Removes non-product requirements (market positioning, team metrics)
   - Removes duplicate requirements
   - Reorders into logical build sequence
   - Creates comprehensive change log
4. Save output as `pmc/product/03-bmo-functional-requirements.md`

### Phase 3B: Enhancement

#### Input Files Required
- **Preprocessed FRs**: `pmc/product/03-bmo-functional-requirements.md`
- **Enhancement Template**: `pmc/product/_prompt_engineering/3b-functional-requirements-prompt_v1.md`

#### Process Flow
1. Script generates enhancement prompt  
2. You copy/paste prompt into AI assistant
3. AI enhances requirements by:
   - Adding FR-specific acceptance criteria
   - Breaking down complex requirements  
   - Filling identified gaps
   - Adding technical implementation details

#### Key FR Components
Each functional requirement includes:
- **FR ID**: FR[X.Y.Z] format
- **Description**: Clear requirement statement
- **Impact Weighting**: Strategic/Revenue/Operational
- **Priority**: High/Medium/Low  
- **User Stories**: References to originating stories
- **User Story Acceptance Criteria**: Preserved from stories
- **Functional Requirements Acceptance Criteria**: Enhanced technical details
- **Tasks**: Placeholder for task references

---

## Step 4 & 5: Structure and Implementation Patterns (No Longer Done)

These steps have been removed from the current PMC workflow. The system now proceeds directly from Functional Requirements to Task generation.

---

## Step 6: Generate Tasks (Multi-Phase Process)

### Purpose
Converts functional requirements into structured, implementable tasks with detailed breakdowns and test specifications.

### Phase 6A: Initial Task Generation

#### Input Files Required
- **Functional Requirements**: `pmc/product/03-bmo-functional-requirements.md`

#### Output File  
- `pmc/product/06-bmo-tasks.md`

#### Command Syntax
```bash
cd pmc/product/_tools/
node 06a-generate-task-initial-v4.js "Bright Run LoRA Fine-Tuning Training Data Platform" bmo
```

#### Process Flow
1. Script reads functional requirements file
2. Converts FR-X.Y.Z identifiers to T-X.Y.Z task format
3. Creates initial task structure with metadata
4. Generates test locations and coverage requirements

### Phase 6B: Task Segmentation and Enhancement

#### Purpose
Segments large task files into manageable sections for AI processing and generates detailed task breakdowns.

#### Command Syntax
```bash
cd pmc/product/_tools/  
node 06b-generate-task-prompt-segments_v6.0.js "Bright Run LoRA Fine-Tuning Training Data Platform" bmo
```

#### Output Files
- Section files: `pmc/product/_mapping/task-file-maps/6-bmo-tasks-E01.md`, `6-bmo-tasks-E02.md`, etc.
- Prompt files: `pmc/product/_mapping/task-file-maps/prompts/06a-product-task-elements-breakdown-prompt-v6.0-E01.md`
- Index: `pmc/product/_mapping/task-file-maps/6-bmo-tasks-index.md`

#### Process Flow
1. Script segments task file by major sections
2. Generates customized prompt file for each section
3. You process each section prompt with AI assistant:
   - Open prompt file for section (e.g., `06a-product-task-elements-breakdown-prompt-v6.0-E01.md`)
   - Copy/paste into AI assistant
   - AI generates detailed task breakdowns with elements
   - Save AI output to corresponding section file

#### Enhanced Task Structure
After AI processing, each task contains:

```markdown
#### T-1.1.1: Implement Project Workspace Creation
- **FR Reference**: FR-1.1.1
- **Parent Task**: T-1.1.0  
- **Implementation Location**: src/app/(dashboard)/projects/create/page.tsx
- **Pattern**: Next.js App Router Page Pattern
- **Dependencies**: T-1.0.1 (Authentication System)
- **Estimated Human Work Hours**: 4-6 hours
- **Description**: Implement comprehensive project workspace creation with guided wizard

**Components/Elements**:
- [T-1.1.1:ELE-1] Project Creation Wizard UI: Implement step-by-step creation interface
  * Maps to: US1.1.1 "guided setup wizard with business-friendly language"
- [T-1.1.1:ELE-2] Workspace Data Models: Create TypeScript interfaces for project data
  * Maps to: FR1.1.1 "organized file structure with metadata storage"
- [T-1.1.1:ELE-3] Validation Logic: Implement name validation and conflict prevention
  * Maps to: US1.1.1 "validation and conflict prevention with real-time feedback"

**Implementation Process**:
1. **Preparation Phase**:
   - [PREP-1] Research Next.js 14 App Router patterns (implements ELE-1)
   - [PREP-2] Design workspace data structure (implements ELE-2)

2. **Implementation Phase**:  
   - [IMP-1] Create project creation page component (implements ELE-1)
   - [IMP-2] Implement TypeScript data models (implements ELE-2)
   - [IMP-3] Add validation logic with real-time feedback (implements ELE-3)

3. **Validation Phase**:
   - [VAL-1] Test wizard flow across all steps (validates ELE-1) 
   - [VAL-2] Verify data model type safety (validates ELE-2)
   - [VAL-3] Test validation logic with edge cases (validates ELE-3)
```

### Wireframe Figma Prompts Integration

Based on the wireframe specifications in `04-bmo-FR-wireframes-output-E01.md`, task generation must incorporate Figma prompt requirements:

**Wireframe Prompt Structure for Tasks:**
- Each UI-related task must generate comprehensive wireframe specifications
- Include Context Summary tailored to specific FR scope and user value
- Integrate Journey elements: user goals, emotions, progressive disclosure, persona adaptations
- Define explicit UI requirements from acceptance criteria with concrete UI elements and states

**Required Wireframe Elements per Task:**
- **Interactions and Flows**: Navigation and key user interactions
- **Visual Feedback**: Progress indicators, status displays, loading states, user confirmations  
- **Accessibility Guidance**: Focus management, ARIA labels, screen reader compatibility
- **Information Architecture**: Layout hierarchy and content organization
- **Page Plan**: Specific screens with clear purposes and functionality coverage

**Figma Annotation Requirements:**
```markdown
**Wireframe Annotations (Mandatory)**:
- Attach detailed notes citing specific acceptance criteria fulfillment
- Include "Mapping Table" frame linking: Criterion → Screen → Component → States → User Value
- Document all interaction states: hover, loading, success, error, validation
- Provide responsive behavior specifications with progressive enhancement patterns

**Example Mapping:**
- "Can create new project workspaces" (US1.1.1) → Project Creation Page → Name Input Field + Wizard Steps → States: Empty/Valid/Invalid/Submitted → User Value: Guided workspace setup
```

---

## Step 7: Generate Test Mapping

### Purpose
Creates comprehensive test-to-task mapping with detailed test specifications and human verification requirements.

### Input Files Required
- **Completed Task Files**: All section files from Step 6B
- **Test Mapping Template**: `pmc/product/_prompt_engineering/7-task-test-mapping-creation-prompt-v4.md`

### Output Files
- Test mapping files: `pmc/product/_mapping/test-maps/06-bmo-task-test-mapping-E01.md`
- Test prompt files: `pmc/product/_mapping/test-maps/prompts/06b-task-test-mapping-creation-prompt-v3-E01.md` 
- Index: `pmc/product/_mapping/test-maps/06-bmo-task-test-mapping-index.md`

### Command Syntax
```bash
cd pmc/product/_tools/
node 07-generate-task-test-mapping_v4.js "Bright Run LoRA Fine-Tuning Training Data Platform" bmo
```

### Process Flow
1. Script analyzes completed task files 
2. Groups tasks by major sections
3. Generates test mapping structure for each section
4. Creates customized test prompts for AI processing
5. You process each test prompt with AI assistant:
   - Open test prompt file (e.g., `06b-task-test-mapping-creation-prompt-v3-E01.md`)
   - Copy/paste into AI assistant  
   - AI generates comprehensive test specifications
   - Save output to corresponding test mapping file

### Test Mapping Structure

Each test mapping includes:

```markdown
#### T-1.1.1: Implement Project Workspace Creation

- **Parent Task**: T-1.1.0
- **Implementation Location**: src/app/(dashboard)/projects/create/page.tsx
- **Estimated Human Testing Hours**: 6-8 hours
- **Testing Tools**: Jest, TypeScript, React Testing Library, Playwright
- **Coverage Target**: 90% code coverage

#### Acceptance Criteria
- Implement guided project creation wizard with business-friendly interface
- Ensure workspace data is stored in type-safe structure with metadata
- Complete real-time validation with conflict prevention and user feedback

#### Element Test Mapping

##### [T-1.1.1:ELE-1] Project Creation Wizard UI
- **Test Requirements**:
  - Verify wizard renders all steps with proper navigation controls
  - Validate business-friendly language without technical jargon
  - Test step progression and completion confirmation
  - Ensure responsive design across device breakpoints
  
- **Testing Deliverables**:
  - `ProjectWizard.test.tsx`: Component rendering and interaction tests
  - `wizard-navigation.test.ts`: Step navigation and validation tests
  - `wizard-integration.test.ts`: End-to-end wizard completion flow
  
- **Human Verification Items**:
  - Visually verify wizard layout maintains design consistency across viewport sizes
  - Confirm language and terminology feels approachable for non-technical users
  - Validate success celebration provides appropriate user satisfaction feedback
```

---

## File Structure Overview

After completing all steps, your project structure will include:

```
pmc/
├── product/
│   ├── 01-bmo-overview.md                    # Step 1 output
│   ├── 02-bmo-user-stories.md                # Step 2 output  
│   ├── 03-bmo-functional-requirements.md     # Step 3 output
│   ├── 06-bmo-tasks.md                       # Step 6A output
│   ├── _mapping/
│   │   ├── task-file-maps/                   # Step 6B outputs
│   │   │   ├── 6-bmo-tasks-E01.md
│   │   │   ├── 6-bmo-tasks-E02.md
│   │   │   ├── prompts/
│   │   │   └── 6-bmo-tasks-index.md
│   │   └── test-maps/                        # Step 7 outputs
│   │       ├── 06-bmo-task-test-mapping-E01.md
│   │       ├── prompts/
│   │       └── 06-bmo-task-test-mapping-index.md
│   ├── _run-prompts/                         # Generated AI prompts
│   └── _tools/                               # PMC scripts
└── docs/ltc-6a/                              # This tutorial
```

---

## Troubleshooting Common Issues

### Script Execution Problems
- **Node.js not found**: Ensure Node.js is installed and in your PATH
- **File not found errors**: Verify all prerequisite files exist before running scripts
- **Permission errors**: Run terminal as administrator on Windows if needed

### Generated Prompt Issues  
- **Missing placeholders**: Check that all referenced files exist and are properly formatted
- **Path errors**: Use full absolute paths when prompted by scripts
- **Template validation**: Ensure templates haven't been modified from original versions

### AI Processing Issues
- **Incomplete responses**: Break large prompts into smaller sections
- **Format inconsistencies**: Provide clear examples in your prompts
- **Missing context**: Include all referenced files in your AI conversation

### File Organization
- **Lost output files**: Check `_run-prompts/` directory for generated prompts
- **Version confusion**: Use consistent naming with project abbreviation (bmo)
- **Directory structure**: Ensure all `_mapping/` subdirectories are created properly

---

## Quality Validation Checklist

After completing each step, verify:

- [ ] **Step 1**: Overview includes all stakeholders, technical approach, and success metrics
- [ ] **Step 2**: User stories cover all features with testable acceptance criteria  
- [ ] **Step 3**: Functional requirements are in logical build order with enhanced criteria
- [ ] **Step 6**: Tasks include detailed elements with prep/implementation/validation phases
- [ ] **Step 7**: Test mappings provide comprehensive coverage with human verification items

---

## Best Practices

1. **Sequential Processing**: Complete each step fully before proceeding to the next
2. **File Management**: Keep all generated prompts for reference and reuse
3. **Consistent Naming**: Always use the same project name and abbreviation
4. **Traceability**: Verify FR mappings and task references are maintained throughout  
5. **Quality Review**: Have stakeholders review user stories and functional requirements
6. **Version Control**: Save all generated documents with consistent version numbers

This tutorial provides the complete PMC workflow for transforming project concepts into implementation-ready development tasks with full traceability, testing specifications, and quality assurance.
