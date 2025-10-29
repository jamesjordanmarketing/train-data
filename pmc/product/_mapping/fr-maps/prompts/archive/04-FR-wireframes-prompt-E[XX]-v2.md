# FR Wireframes Prompt — Major Task #1 (FR1.1.0 Document Processing)

This document contains:
- A complete, product- and task-agnostic prompt to paste into the Figma Make AI agent to generate wireframes for a selected Functional Requirement (FR)
- A mapping section template to align acceptance criteria to UI components
- A section to capture non-UI acceptance criteria
- A section estimating the number of UI pages required

All sections are parameterized so you can reuse this for any FR and stage.

---

## Section A — New Wireframe Prompt (copy/paste into Figma Make AI)

You are an expert product designer and system mapper. Generate high-fidelity wireframes that fully express the selected Functional Requirement (FR) as a tangible, testable user experience. Follow these instructions precisely.

Context and Inputs
- Read the following source documents in full and treat them as the single source of truth for scope and acceptance criteria:
  1) Overview Document: `pmc/product/01-bmo-overview.md`
  2) User Stories: `pmc/product/02-bmo-user-stories.md`
  3) Functional Requirements: `pmc/product/03-bmo-functional-requirements.md`
  4) Task-Specific FR Map: `pmc/product/_mapping/fr-maps/04-bmo-FR-wireframes-E01.md`

Wireframe Objective
- Target FR: FR1.1.0 — Document Processing (Major Task #1)
- Stage Name (if applicable): Stage 1 — Knowledge Ingestion & Document Processing
- Build wireframes that satisfy every acceptance criterion for the target FR that has a user-facing or interaction implication. Represent each such criterion as a concrete UI element, component, screen, interaction, state, or validation feedback.
- Any acceptance criteria without a direct UI should be documented as “System Notes” attached to the relevant screen(s) or included in a dedicated Notes/Cover frame.

Task Scope Focus (pre-extracted from FR1.1.0)
- UI-relevant acceptance criteria to represent explicitly:
  - Drag-and-drop interface for multi-file uploads
  - Visual progress indicators for upload, processing status, and estimated completion time
  - Batch/queue view to manage multiple files (queued, analyzing, complete, error) with per-file actions (preview, delete, reprocess)
  - Content preview of extracted text with formatting preservation options
  - Metadata panel: display and (where appropriate) edit document properties (title, author, creation date)
  - File validation feedback: integrity/compatibility checks, unsupported/corrupted file errors with remediation steps
  - Character encoding detection surfaced as status/warnings (e.g., UTF-8/ASCII)
  - Large file handling guidance (up to 100MB) with streaming/progressive feedback
  - Processing logs access/download (per file), with clear event summaries
  - Supported formats surfaced (PDF, DOC, DOCX, PPT, PPTX, TXT, MD, CSV, JSON) and auto-detection indicators
- Non-UI criteria (to note in System Notes):
  - 99%+ content extraction accuracy (OCR/text parsing)
  - Metadata preservation requirements beyond UI display
  - Processing logs retention and structure details

Parsing and Extraction Rules
1) In the Task-Specific FR Map, locate the exact FR section matching [FR_NUMBER_PLACEHOLDER]. If not found, fall back to the FR section of the main Functional Requirements document.
2) Extract:
   - All User Story Acceptance Criteria for this FR
   - All Functional Requirements Acceptance Criteria for this FR
3) Classify criteria into:
   - UI-relevant criteria: Affects screens, components, user flows, feedback, or visualizations
   - Non-UI criteria: System behaviors, background processes, integrations, accuracy targets, logs, etc.

Wireframe Deliverables
Produce Figma frames that include:
1) Screen Set (Page Plan)
   - Compute and then specify the required number of distinct UI pages/screens to realize the FR end-to-end. Use: 3 as a lower bound and add screens if acceptance criteria require them.
   - Name screens clearly, e.g., “FR[FR_NUMBER]-[Screen Purpose]”.
2) Components and States
   - For each UI-relevant acceptance criterion, create or place a concrete UI element/component and depict all essential states:
     - Loading, Empty, Success, Error, Disabled, Validation/Warning, In-Progress
     - Include inline helper text, error messages, and remediation steps when applicable
3) Interactions and Flows
   - Connect screens using arrows/flow annotations to reflect the user journey across the FR scope
   - Show key interactions: drag-and-drop, select, configure, submit, retry, preview, pagination, filtering, sorting, etc. (only those required by criteria)
4) Visual Feedback and Progress
   - Where the acceptance criteria call for visual indicators or progress, include progress bars, status chips, timers/ETAs, activity logs, and inline toasts where appropriate
5) Annotations (Mandatory)
   - On each element or region, attach notes that explicitly cite the matching acceptance criterion text (verbatim or summarized) and its source (User Story vs Functional Requirement)
   - Add a “Mapping Table” frame summarizing: Acceptance Criterion → Screen → Component(s) → State(s)
6) System Notes (for non-UI criteria)
   - Add a dedicated Notes/Cover frame listing non-UI acceptance criteria and how the UI hints or exposes their outcomes (if any). Note service integrations, background jobs, accuracy targets, and logging requirements.

Information Architecture and Layout
- Use a clean, responsive layout grid suitable for desktop-first applications (minimum 1440px width). Apply logical grouping for upload/inputs, configuration, queue/state, feedback/logs, and previews as relevant to the FR.
- Label sections with semantic headings. Use clear typography hierarchy. Keep spacing consistent and legible.

Accessibility and Usability
- Provide visible focus states, clear label–control associations, aria labeling guidance, and WCAG AA color contrast pointers in annotations.
- Specify keyboard-accessible flows for key actions from each screen.

Validation and Error Handling
- For every input/control, annotate validation rules and related messages based on acceptance criteria.
- For error scenarios noted in criteria, include explicit error states with actionable remediation.

Output Requirements (Figma)
- Deliver a top-level cover frame titled: “FR [FR_NUMBER_PLACEHOLDER] Wireframes — [STAGE_NAME_PLACEHOLDER]”.
- Include frames for each screen and a final “Mapping Table” frame.
- Include a “System Notes” frame listing non-UI criteria.
- Name layers and components clearly so developers can infer implementation.

Constraints
- Scope strictly to the target FR. Do not drift into other FRs or stages beyond minimal navigation context.
- Do not include FR1.2.0 (Export) or FR1.3.0 (Training Pipeline) features in these wireframes.
- Prefer generic components and labels—no brand visuals or custom iconography.
- Avoid lorem ipsum for actionable UI; prefer realistic labels derived from the criteria.

Final Checklist (must be completed in output)
- [ ] Every UI-relevant acceptance criterion appears as a concrete UI element/state
- [ ] Non-UI acceptance criteria are listed in System Notes
- [ ] All key interactions required by criteria are wired in the flow
- [ ] Validation, error, and progress states are visible
- [ ] Mapping Table accurately links criteria → UI
- [ ] Page count is justified and documented

Parameters (pre-filled for this task)
- FR Number: FR1.1.0 — Document Processing
- Stage Name: Stage 1 — Knowledge Ingestion & Document Processing
- Minimum Page Count: 3

Begin by listing the extracted acceptance criteria (UI-relevant and non-UI) for FR [FR_NUMBER_PLACEHOLDER], then present the page plan, then render the wireframes with annotations and include the Mapping Table and System Notes frames at the end.

---

## Section B — Acceptance Criteria → UI Component Mapping (to be maintained with output)

Instruction: After the Figma Make AI produces the wireframes, complete or verify this mapping. Include every acceptance criterion for FR FR1.1.0 that impacts UI.

Template:
- Acceptance Criterion: [paste criterion verbatim]
  - Source: [User Story | Functional Requirement]
  - Screen(s): [Screen Name(s)]
  - Component(s): [Component names]
  - State(s): [Loading | Empty | Success | Error | Disabled | Validation | In-Progress | etc.]
  - Notes: [how the UI satisfies the criterion]

Repeat for all UI-relevant criteria.

---

## Section C — Non-UI Acceptance Criteria (required for completeness)

Instruction: List criteria for FR FR1.1.0 that do not directly create UI, but affect system behavior, performance, integrations, or quality targets. These must appear in the “System Notes” frame in Figma.

Template:
- Non-UI Criterion: [paste criterion verbatim]
  - Impact: [e.g., accuracy target, logging, integration dependency, background job]
  - UI Hint (if any): [e.g., surfaced as status text, tooltip, note]

---

## Section D — Estimated Page Count for This FR

Provide the page count and rationale specific to FR FR1.1.0. If unknown prior to generation, the Figma Make AI must compute and document the count during the “Screen Set (Page Plan)” step.

Guidance to determine count:
- 1–2 screens: simple single-step operations (upload-only, configure-only)
- 3–4 screens: multi-step flow with configuration, processing/progress, and results/preview
- 5+ screens: flows that include queue management, advanced validation, logs, or complex previews

Record here:
- Estimated Pages: [ESTIMATED_PAGE_COUNT_PLACEHOLDER]
- Rationale: [brief justification tied to acceptance criteria]


