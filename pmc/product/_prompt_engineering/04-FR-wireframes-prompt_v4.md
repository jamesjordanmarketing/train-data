## FR Wireframes Prompt Generator (v4) — Generates a Figma-Ready Wireframe Prompt

Goal: Read local source documents for a specific FR, extract all acceptance criteria, and output a single, self-contained prompt that can be pasted into Figma Make AI to generate wireframes. This file is a generator prompt (prompt-to-create-a-prompt).

Inputs (local to generator)
- Overview: `pmc/product/01-bmo-overview.md`
- User Stories: `pmc/product/02-bmo-user-stories.md`
- Functional Requirements: `pmc/product/03-bmo-functional-requirements.md`
- Task-Specific FR Map: `pmc/product/_mapping/fr-maps/04-bmo-FR-wireframes-[SECTION_ID_PLACEHOLDER].md`
- User Journey: `pmc/product/03.5-bmo-user-journey.md`

Parameters
- FR Number: [FR_NUMBER_PLACEHOLDER]
- Stage Name: [STAGE_NAME_PLACEHOLDER]
- Section ID: [SECTION_ID_PLACEHOLDER] (E.g., E01)
- Journey Stage Number: [JOURNEY_STAGE_NUMBER] (1-6)
- Minimum Page Count: [MINIMUM_PAGE_COUNT_PLACEHOLDER] (default: 3)
- FR Locate File: [FR_LOCATE_FILE_PATH_PLACEHOLDER]
- FR Locate Line: [FR_LOCATE_LINE_PLACEHOLDER]
- Output File (append): [OUTPUT_FILE_PATH_PLACEHOLDER]

Mandates
- Locate FR [FR_NUMBER_PLACEHOLDER] in [FR_LOCATE_FILE_PATH_PLACEHOLDER] at line [FR_LOCATE_LINE_PLACEHOLDER].
- Append the final Figma-ready prompt for this FR between explicit markers to: [OUTPUT_FILE_PATH_PLACEHOLDER].
- Use the following markers when writing the final output block:
  - === BEGIN PROMPT FR: [FR_NUMBER_PLACEHOLDER] ===
  - === END PROMPT FR: [FR_NUMBER_PLACEHOLDER] ===

What to do
0) Extract journey context for Stage [JOURNEY_STAGE_NUMBER]:
   - User goals and workflows for this stage
   - Emotional journey points
   - Success celebration moments
   - Progressive disclosure requirements
   - Persona-specific UI adaptations
1) Identify FR [FR_NUMBER_PLACEHOLDER] in the Task-Specific FR Map (or the main FR file if not present) and collect all acceptance criteria:
   - User Story Acceptance Criteria mapped to this FR
   - Functional Requirements Acceptance Criteria for this FR
2) Classify each criterion as UI-relevant vs Non-UI.
3) Compute a Page Plan (≥ [MINIMUM_PAGE_COUNT_PLACEHOLDER]) to satisfy all UI-relevant criteria with clear flows and states.
4) Generate a self-contained Figma Make AI prompt that embeds all UI-relevant criteria, includes annotations instructions, and does not require external file access.

Final Output Format (append to [OUTPUT_FILE_PATH_PLACEHOLDER])

=== BEGIN PROMPT FR: [FR_NUMBER_PLACEHOLDER] ===

Title
- FR [FR_NUMBER_PLACEHOLDER] Wireframes — [STAGE_NAME_PLACEHOLDER]

Context Summary
- [2–4 sentences tailored to FR: scope, user value, constraints]

Journey Integration
- Stage [JOURNEY_STAGE_NUMBER] user goals: [extracted from journey]
- Key emotions: [confidence building, anxiety reduction, celebration]
- Progressive disclosure levels: [basic, advanced, expert]
- Persona adaptations: [unified interface serving all personas]

Wireframe Goals
- [Bulleted goals mapped to this FR]

Explicit UI Requirements (from acceptance criteria)
- [Each UI-relevant criterion rewritten as concrete UI elements, components, states, interactions]
- Include validation, error, loading, empty, success, disabled, in-progress states as applicable

Interactions and Flows
- [Describe navigation and key interactions required by the criteria]

Visual Feedback
- [Progress indicators, status chips, ETAs, logs, toasts—as required]

Accessibility Guidance
- [Focus, labels, aria hints, color contrast]

Information Architecture
- [Layout groups and hierarchy]

Page Plan
- [List the screens with names and purposes; count must match computed plan]

Annotations (Mandatory)
- Instruct: Attach notes on elements citing the acceptance criterion they fulfill and include a “Mapping Table” frame in Figma: Criterion → Screen → Component(s) → State(s).

Acceptance Criteria → UI Component Mapping
- [For each UI-relevant criterion: text, source (US/FR), screen(s), component(s), state(s), notes]

Non-UI Acceptance Criteria
- [List all non-UI criteria with impact and any UI hint]

Estimated Page Count
- [Number and brief rationale tied to criteria]

=== END PROMPT FR: [FR_NUMBER_PLACEHOLDER] ===

Notes
- Keep copy realistic for actionable UI. Avoid referencing local files in the Figma prompt content.
- Do not include features from other FRs beyond minimal navigation context.
- Use the markers exactly to delineate where each prompt starts and ends; there will be multiple prompts in the same output file for a section.



