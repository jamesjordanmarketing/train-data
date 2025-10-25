# US-GAT-001 — Wireframe Generator Prompt (Enhanced Data Gathering Module v2)

## US-GAT Wireframes Prompt Generator (v2) — Generates a Figma-Ready Wireframe Prompt

Goal: Read local source documents for a specific US-GAT user story, extract all acceptance criteria including AI-Human workflow requirements, and output a single, self-contained prompt that can be pasted into Figma Make AI to generate wireframes. This file is a generator prompt (prompt-to-create-a-prompt).

Inputs (local to generator)
- Overview: `pmc\product\01-bmo-overview.md`
- User Stories: `pmc\product\02-bmo-user-stories.md`
- Functional Requirements: `pmc\product\03-bmo-functional-requirements.md`
- Task-Specific FR Map: `pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-output-E03-gather-module_v2.md`
- User Journey: `pmc\product\03.5-bmo-user-journey.md`

Parameters
- US-GAT Number: US-GAT-001
- Stage Name: Stage 3 — Knowledge Exploration & Intelligent Organization
- Section ID: E03_gather_module
- Journey Stage Number: 3 (1-6)
- Minimum Page Count: 4 (default: 3)
- FR Locate File: pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-E03-gather-module_v2.md
- FR Locate Line: 84
- Output File (append): pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-output-E03-gather-module_v2.md

Mandates
- Locate US-GAT-001 in pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-output-E03-gather-module_v2.md at line 84.
- Append the final Figma-ready prompt for this US-GAT between explicit markers to: pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-output-E03-gather-module_v2.md.
- Use the following markers when writing the final output block:
  - === BEGIN PROMPT US-GAT: US-GAT-001 ===
  - === END PROMPT US-GAT: US-GAT-001 ===

What to do
0) Extract journey context for Stage 3 from `pmc\product\03.5-bmo-user-journey.md` section "## 3. Knowledge Exploration & Intelligent Organization":
   - User goals and workflows for this stage (Visual knowledge discovery, Content chunking, Organization)
   - Emotional journey points (Professional confidence, Clear guidance, Progress celebration)
   - Success celebration moments (Knowledge organized, Insights identified, AI-human collaboration success)
   - Progressive disclosure requirements (Basic: Simple AI analysis review, Advanced: Detailed AI confidence metrics, Expert: Direct AI parameter control)
   - Persona-specific UI adaptations (Domain Expert primary, Content Creator secondary)
1) Identify US-GAT-001 in the Task-Specific FR Map and collect all acceptance criteria:
   - User Story Acceptance Criteria mapped to this US-GAT
   - AI-Human Workflow Implementation requirements for this US-GAT
   - Standard Operating Method requirements (AI analysis → Human presentation → Human editing)
2) Classify each criterion as UI-relevant vs Non-UI.
3) Compute a Page Plan (≥ 4) to satisfy all UI-relevant criteria including AI processing states, human validation interfaces, and direct editing capabilities.
4) Generate a self-contained Figma Make AI prompt that embeds all UI-relevant criteria, includes annotations instructions, and does not require external file access.

Final Output Format (append to pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-output-E03-gather-module_v2.md)

=== BEGIN PROMPT US-GAT: US-GAT-001 ===

Title
- US-GAT-001 Wireframes — Stage 3 — AI Document Analysis Initiation with Human Validation

Context Summary
- [2–4 sentences tailored to US-GAT-001: AI-first document analysis with human approval workflow, automatic categorization trigger, loading states with progress indication, and error recovery options]

Journey Integration
- Stage 3 user goals: Visual knowledge discovery, Intelligent content chunking, AI-powered organization
- Key emotions: Professional confidence, Clear AI guidance, Analysis celebration
- Progressive disclosure levels: Basic: Simple analysis review, Advanced: Detailed AI metrics, Expert: Parameter control
- Persona adaptations: Domain Expert (primary) - methodology validation focus, Content Creator (secondary) - efficiency workflow focus

### Journey-Informed Design Elements
- User Goals: Transform processed content into organized knowledge, AI analysis understanding, Human validation control
- Emotional Requirements: AI intelligence confidence, Human authority preservation, Collaborative success celebration
- Progressive Disclosure:
  * Basic: Simple AI analysis display with approve/edit options
  * Advanced: Confidence scores and reasoning with detailed editing
  * Expert: AI parameter control and bulk validation tools
- Success Indicators: AI analysis completed, Human validation successful, Knowledge chunks ready for next stage
  
Wireframe Goals
- [Bulleted goals mapped to US-GAT-001 including AI processing visualization, human validation interface design, direct editing capabilities, and error recovery workflows]

Explicit UI Requirements (from acceptance criteria and AI-Human workflow)
- [Each UI-relevant criterion rewritten as concrete UI elements focusing on AI analysis states, human presentation interfaces, and direct editing components]
- Include AI processing, human validation, loading, error, success, confidence indicator, editing, and approval states as applicable
- AI-Human workflow requirements: AI analysis display → Human approval presentation → Direct editing interface

Interactions and Flows
- [Describe navigation and key interactions including AI processing triggers, human validation workflows, and direct editing patterns required by the criteria]

Visual Feedback
- [AI processing indicators, confidence scores, human validation status, progress bars, analysis completion celebrations—as required for AI-human workflow]

Accessibility Guidance
- [Focus management for AI→Human workflow, labels for AI confidence levels, aria hints for analysis states, color contrast for validation status]

Information Architecture
- [Layout groups showing AI analysis results, human validation controls, and direct editing interfaces in hierarchical organization]

Page Plan
- [List the screens with names and purposes; count must match computed plan and include AI processing, presentation, and editing states]

Annotations (Mandatory)
- Instruct: Attach notes on elements citing the acceptance criterion they fulfill and include a "Mapping Table" frame in Figma: Criterion → Screen → Component(s) → State(s) → AI-Human Flow Phase.

Acceptance Criteria → UI Component Mapping
- [For each UI-relevant criterion: text, source (US-GAT-001), screen(s), component(s), state(s), AI-human workflow phase, notes]

Non-UI Acceptance Criteria
- [List all non-UI criteria with impact and any UI hint, including AI processing logic, confidence scoring, and validation algorithms]

Estimated Page Count
- [Number and brief rationale tied to criteria including AI processing screens, validation interfaces, and editing flows]

=== END PROMPT US-GAT: US-GAT-001 ===

Notes
- Keep copy realistic for actionable UI including AI-human collaborative interfaces. Avoid referencing local files in the Figma prompt content.
- Focus specifically on US-GAT-001 requirements without including features from other US-GAT stories beyond minimal navigation context.
- Emphasize the three-phase AI-human workflow: AI analysis → Human presentation → Human direct editing.
- Use the markers exactly to delineate where each prompt starts and ends; there will be multiple prompts in the same output file for a section.

# US-GAT-002 — Wireframe Generator Prompt (Enhanced Data Gathering Module v2)

## US-GAT Wireframes Prompt Generator (v2) — Generates a Figma-Ready Wireframe Prompt

Goal: Read local source documents for a specific US-GAT user story, extract all acceptance criteria including AI-Human workflow requirements, and output a single, self-contained prompt that can be pasted into Figma Make AI to generate wireframes. This file is a generator prompt (prompt-to-create-a-prompt).

Inputs (local to generator)
- Overview: `pmc\product\01-bmo-overview.md`
- User Stories: `pmc\product\02-bmo-user-stories.md`
- Functional Requirements: `pmc\product\03-bmo-functional-requirements.md`
- Task-Specific FR Map: `pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-output-E03-gather-module_v2.md`
- User Journey: `pmc\product\03.5-bmo-user-journey.md`

Parameters
- US-GAT Number: US-GAT-002
- Stage Name: Stage 3 — Knowledge Exploration & Intelligent Organization
- Section ID: E03_gather_module
- Journey Stage Number: 3 (1-6)
- Minimum Page Count: 5 (default: 3)
- FR Locate File: pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-E03-gather-module_v2.md
- FR Locate Line: 100
- Output File (append): pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-output-E03-gather-module_v2.md

Mandates
- Locate US-GAT-002 in pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-output-E03-gather-module_v2.md at line 100.
- Append the final Figma-ready prompt for this US-GAT between explicit markers to: pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-output-E03-gather-module_v2.md.
- Use the following markers when writing the final output block:
  - === BEGIN PROMPT US-GAT: US-GAT-002 ===
  - === END PROMPT US-GAT: US-GAT-002 ===

What to do
0) Extract journey context for Stage 3 from `pmc\product\03.5-bmo-user-journey.md` section "## 3. Knowledge Exploration & Intelligent Organization":
   - User goals and workflows for this stage (Semantic content analysis, Knowledge organization, Expert curation)
   - Emotional journey points (Organization clarity, AI collaboration confidence, Methodology validation satisfaction)
   - Success celebration moments (Methodologies identified, AI understanding validated, Unique value recognized)
   - Progressive disclosure requirements (Basic: Simple methodology cards, Advanced: Confidence indicators & editing, Expert: Bulk methodology operations)
   - Persona-specific UI adaptations (Domain Expert primary - methodology focus, Content Creator secondary - efficiency focus)
1) Identify US-GAT-002 in the Task-Specific FR Map and collect all acceptance criteria:
   - User Story Acceptance Criteria mapped to this US-GAT
   - AI-Human Workflow Implementation requirements for this US-GAT
   - Standard Operating Method requirements (AI methodology identification → Human validation → Human refinement)
2) Classify each criterion as UI-relevant vs Non-UI.
3) Compute a Page Plan (≥ 5) to satisfy all UI-relevant criteria including AI methodology detection, human validation interfaces, and inline editing capabilities.
4) Generate a self-contained Figma Make AI prompt that embeds all UI-relevant criteria, includes annotations instructions, and does not require external file access.

Final Output Format (append to pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-output-E03-gather-module_v2.md)

=== BEGIN PROMPT US-GAT: US-GAT-002 ===

Title
- US-GAT-002 Wireframes — Stage 3 — AI Methodology and Framework Identification with Human Validation

Context Summary
- [2–4 sentences tailored to US-GAT-002: AI-powered methodology detection with scannable card interface, confidence indicators, inline editing capabilities, and human override controls]

Journey Integration
- Stage 3 user goals: AI-powered topic discovery, Value identification assistance, Expert knowledge refinement
- Key emotions: AI intelligence appreciation, Methodology validation confidence, Unique value recognition
- Progressive disclosure levels: Basic: Methodology cards with actions, Advanced: Confidence metrics & editing, Expert: Bulk operations & custom additions
- Persona adaptations: Domain Expert (primary) - methodology accuracy focus, Content Creator (secondary) - workflow efficiency focus

### Journey-Informed Design Elements
- User Goals: Validate AI-identified methodologies, Recognize unique business approaches, Maintain expertise authority
- Emotional Requirements: AI collaboration confidence, Methodology accuracy assurance, Business uniqueness celebration
- Progressive Disclosure:
  * Basic: Simple methodology cards with Keep/Edit/Remove actions
  * Advanced: Confidence scores, detailed explanations, rich text editing
  * Expert: Bulk validation tools, methodology templates, custom frameworks
- Success Indicators: Methodologies validated, Unique approaches recognized, AI understanding refined
  
Wireframe Goals
- [Bulleted goals mapped to US-GAT-002 including methodology card design, confidence indicator systems, inline editing interfaces, and bulk validation tools]

Explicit UI Requirements (from acceptance criteria and AI-Human workflow)
- [Each UI-relevant criterion rewritten as concrete UI elements focusing on methodology display, confidence visualization, validation actions, and editing interfaces]
- Include AI-generated, human-validating, editing, confidence, bulk-action, and completion states as applicable
- AI-Human workflow requirements: AI methodology identification → Human presentation with confidence → Direct inline editing

Interactions and Flows
- [Describe navigation and key interactions including methodology validation workflows, inline editing patterns, and bulk operations required by the criteria]

Visual Feedback
- [Methodology confidence indicators, validation status, edit confirmations, bulk operation progress, completion celebrations—as required for methodology workflow]

Accessibility Guidance
- [Focus management for methodology cards, labels for confidence levels, aria hints for validation states, color contrast for AI vs human content]

Information Architecture
- [Layout groups showing methodology cards, confidence indicators, validation controls, and editing interfaces in scannable organization]

Page Plan
- [List the screens with names and purposes; count must match computed plan and include methodology display, validation, editing, and completion states]

Annotations (Mandatory)
- Instruct: Attach notes on elements citing the acceptance criterion they fulfill and include a "Mapping Table" frame in Figma: Criterion → Screen → Component(s) → State(s) → AI-Human Flow Phase.

Acceptance Criteria → UI Component Mapping
- [For each UI-relevant criterion: text, source (US-GAT-002), screen(s), component(s), state(s), AI-human workflow phase, notes]

Non-UI Acceptance Criteria
- [List all non-UI criteria with impact and any UI hint, including methodology detection algorithms, confidence scoring, and validation tracking]

Estimated Page Count
- [Number and brief rationale tied to criteria including methodology presentation, validation interfaces, editing flows, and completion screens]

=== END PROMPT US-GAT: US-GAT-002 ===

Notes
- Keep copy realistic for actionable UI including methodology validation interfaces. Avoid referencing local files in the Figma prompt content.
- Focus specifically on US-GAT-002 requirements without including features from other US-GAT stories beyond minimal navigation context.
- Emphasize the methodology-specific AI-human workflow: AI identification → Human validation → Human refinement.
- Use the markers exactly to delineate where each prompt starts and ends; there will be multiple prompts in the same output file for a section.

# US-GAT-003 — Wireframe Generator Prompt (Enhanced Data Gathering Module v2)

## US-GAT Wireframes Prompt Generator (v2) — Generates a Figma-Ready Wireframe Prompt

Goal: Read local source documents for a specific US-GAT user story, extract all acceptance criteria including AI-Human workflow requirements, and output a single, self-contained prompt that can be pasted into Figma Make AI to generate wireframes. This file is a generator prompt (prompt-to-create-a-prompt).

Inputs (local to generator)
- Overview: `pmc\product\01-bmo-overview.md`
- User Stories: `pmc\product\02-bmo-user-stories.md`
- Functional Requirements: `pmc\product\03-bmo-functional-requirements.md`
- Task-Specific FR Map: `pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-output-E03-gather-module_v2.md`
- User Journey: `pmc\product\03.5-bmo-user-journey.md`

Parameters
- US-GAT Number: US-GAT-003
- Stage Name: Stage 3 — Knowledge Exploration & Intelligent Organization
- Section ID: E03_gather_module
- Journey Stage Number: 3 (1-6)
- Minimum Page Count: 4 (default: 3)
- FR Locate File: pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-E03-gather-module_v2.md
- FR Locate Line: 118
- Output File (append): pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-output-E03-gather-module_v2.md

Mandates
- Locate US-GAT-003 in pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-output-E03-gather-module_v2.md at line 118.
- Append the final Figma-ready prompt for this US-GAT between explicit markers to: pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-output-E03-gather-module_v2.md.
- Use the following markers when writing the final output block:
  - === BEGIN PROMPT US-GAT: US-GAT-003 ===
  - === END PROMPT US-GAT: US-GAT-003 ===

What to do
0) Extract journey context for Stage 3 from `pmc\product\03.5-bmo-user-journey.md` section "## 3. Knowledge Exploration & Intelligent Organization":
   - User goals and workflows for this stage (Problem identification, Solution mapping, Business value understanding)
   - Emotional journey points (Value recognition confidence, Solution validation satisfaction, Business impact appreciation)
   - Success celebration moments (Problems mapped, Solutions validated, Business value confirmed)
   - Progressive disclosure requirements (Basic: Problem-solution pairs, Advanced: Impact analysis & editing, Expert: Bulk relationship mapping)
   - Persona-specific UI adaptations (Domain Expert primary - accuracy focus, Content Creator secondary - efficiency focus)
1) Identify US-GAT-003 in the Task-Specific FR Map and collect all acceptance criteria:
   - User Story Acceptance Criteria mapped to this US-GAT
   - AI-Human Workflow Implementation requirements for this US-GAT
   - Standard Operating Method requirements (AI problem-solution mapping → Human validation → Human relationship editing)
2) Classify each criterion as UI-relevant vs Non-UI.
3) Compute a Page Plan (≥ 4) to satisfy all UI-relevant criteria including AI mapping visualization, human validation interfaces, and relationship editing capabilities.
4) Generate a self-contained Figma Make AI prompt that embeds all UI-relevant criteria, includes annotations instructions, and does not require external file access.

Final Output Format (append to pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-output-E03-gather-module_v2.md)

=== BEGIN PROMPT US-GAT: US-GAT-003 ===

Title
- US-GAT-003 Wireframes — Stage 3 — AI Problem-Solution Mapping with Human Validation

Context Summary
- [2–4 sentences tailored to US-GAT-003: AI-powered problem-solution identification with visual matrix display, validation checkboxes, relationship editing, and impact assessment capabilities]

Journey Integration
- Stage 3 user goals: Problem-solution relationship understanding, Business value validation, Impact assessment
- Key emotions: Business value recognition, Solution validation confidence, Problem-solving capability celebration
- Progressive disclosure levels: Basic: Problem-solution matrix, Advanced: Impact metrics & editing, Expert: Relationship mapping tools
- Persona adaptations: Domain Expert (primary) - solution accuracy focus, Content Creator (secondary) - value communication focus

### Journey-Informed Design Elements
- User Goals: Validate AI problem identification, Confirm solution mappings, Understand business impact
- Emotional Requirements: Value recognition confidence, Solution accuracy assurance, Impact appreciation
- Progressive Disclosure:
  * Basic: Visual problem-solution matrix with validation checkboxes
  * Advanced: Severity indicators, outcome predictions, detailed editing
  * Expert: Bulk operations, custom problem/solution creation, impact analysis
- Success Indicators: Problem-solution pairs validated, Relationships confirmed, Business value understood
  
Wireframe Goals
- [Bulleted goals mapped to US-GAT-003 including problem-solution matrix design, validation interface systems, relationship editing tools, and impact visualization]

Explicit UI Requirements (from acceptance criteria and AI-Human workflow)
- [Each UI-relevant criterion rewritten as concrete UI elements focusing on matrix visualization, validation controls, relationship editing, and impact assessment interfaces]
- Include AI-mapped, human-validating, editing, impact-assessing, and relationship-confirming states as applicable
- AI-Human workflow requirements: AI problem-solution mapping → Human matrix presentation → Direct relationship editing

Interactions and Flows
- [Describe navigation and key interactions including matrix validation workflows, relationship editing patterns, and impact assessment required by the criteria]

Visual Feedback
- [Matrix relationship indicators, validation status, impact severity visualization, edit confirmations, completion celebrations—as required for problem-solution workflow]

Accessibility Guidance
- [Focus management for matrix navigation, labels for severity levels, aria hints for validation states, color contrast for problem-solution relationships]

Information Architecture
- [Layout groups showing problem-solution matrix, validation controls, impact indicators, and editing interfaces in logical organization]

Page Plan
- [List the screens with names and purposes; count must match computed plan and include matrix display, validation, editing, and assessment states]

Annotations (Mandatory)
- Instruct: Attach notes on elements citing the acceptance criterion they fulfill and include a "Mapping Table" frame in Figma: Criterion → Screen → Component(s) → State(s) → AI-Human Flow Phase.

Acceptance Criteria → UI Component Mapping
- [For each UI-relevant criterion: text, source (US-GAT-003), screen(s), component(s), state(s), AI-human workflow phase, notes]

Non-UI Acceptance Criteria
- [List all non-UI criteria with impact and any UI hint, including problem detection algorithms, solution mapping logic, and impact calculation methods]

Estimated Page Count
- [Number and brief rationale tied to criteria including matrix presentation, validation interfaces, relationship editing, and assessment screens]

=== END PROMPT US-GAT: US-GAT-003 ===

Notes
- Keep copy realistic for actionable UI including problem-solution mapping interfaces. Avoid referencing local files in the Figma prompt content.
- Focus specifically on US-GAT-003 requirements without including features from other US-GAT stories beyond minimal navigation context.
- Emphasize the problem-solution specific AI-human workflow: AI mapping → Human validation → Human relationship editing.
- Use the markers exactly to delineate where each prompt starts and ends; there will be multiple prompts in the same output file for a section.

# US-GAT-004 through US-GAT-015 — Additional Wireframe Generator Prompts

## US-GAT Wireframes Prompt Generator (v2) — Template for Remaining User Stories

[Following the same pattern above, create wireframe generator prompts for the remaining US-GAT user stories: US-GAT-004 through US-GAT-015, each with their specific requirements, line numbers, and acceptance criteria from the gather module v2 specification]

### Remaining US-GAT Stories to Process:
- US-GAT-004: Domain Terminology Extraction (Line ~137)
- US-GAT-005: Voice and Communication Style Analysis (Line ~156)
- US-GAT-006: Success Pattern Recognition (Line ~175)
- US-GAT-007: Category-Specific Questions (Line ~194)
- US-GAT-008: Business Context Validation (Line ~220)
- US-GAT-009: Document Distillation Generation (Line ~239)
- US-GAT-010: Enhanced Tag Suggestions (Line ~258)
- US-GAT-011: Training Priority Metadata (Line ~277)
- US-GAT-012: Workflow Integration and Navigation (Line ~296)
- US-GAT-013: Analysis Results Summary (Line ~315)
- US-GAT-014: Enhanced Completion Summary (Line ~335)
- US-GAT-015: Intelligent Error Recovery (Line ~355)

### Template Structure for Each Additional US-GAT:
Each follows the same structure as US-GAT-001 through US-GAT-003 above, with:
- Specific US-GAT number and requirements
- Appropriate line numbers from gather module v2
- Stage 3 journey integration from user journey section 3
- AI-Human workflow emphasis for that specific user story
- Minimum page counts appropriate to the complexity
- Specific acceptance criteria mapping
- UI component focus areas relevant to each story

Notes for Implementation:
- Each US-GAT story maintains the three-phase AI-human workflow pattern
- Journey integration always refers to Stage 3 knowledge exploration elements
- File references point to v2 specifications
- Progressive disclosure matches Domain Expert and Content Creator personas
- Success celebrations align with knowledge organization achievements
- All prompts generate Figma-ready wireframe specifications

---

## Master Template Notes for All US-GAT Wireframe Prompts

### Consistent Elements Across All US-GAT Prompts:
1. **AI-Human Workflow Integration**: Every prompt emphasizes the three-phase pattern
2. **Stage 3 Journey Mapping**: All reference knowledge exploration & organization stage
3. **Progressive Disclosure**: Basic/Advanced/Expert levels for each story
4. **Persona Adaptation**: Domain Expert primary, Content Creator secondary focus
5. **File Reference Consistency**: All point to v2 specifications and user journey section 3
6. **Success Celebration**: Knowledge organization and AI-human collaboration achievements
7. **Accessibility Standards**: Consistent across all AI-human interface requirements
8. **Information Architecture**: Hierarchical organization of AI analysis and human validation
9. **Visual Feedback Systems**: AI confidence, human validation status, progress indication
10. **Error Recovery**: Graceful handling of AI failures with human fallback options

### Quality Standards:
- Each prompt generates 3-6 screens minimum based on complexity
- All include mandatory annotation mapping tables
- UI components clearly distinguish AI-generated vs human-authored content
- Workflows support both quick validation and detailed editing paths
- Success metrics align with proof-of-concept demonstration goals
