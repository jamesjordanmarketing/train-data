# Chunks-Alpha Module — Context (v2)

Purpose
- Provide a distilled, expert context for the Chunks-Alpha module based on the product overview, functional requirements, and wireframe execution outputs, with actionable guidance to answer questions and execute support tasks without re-reading long source documents.

Sources Reviewed (anchor paths)
- `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\01-bmo-overview-chunk-alpha_v1.md` (unstructured spec with detailed extraction workflow and meta-dimension design)
- `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-bmo-functional-requirements.md` (v3.0.0 FRs; traceability to chunks-alpha integration and 60+ dimension system)
- `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\archive\04-bmo-FR-wireframes-output-E01.md` (Stage 1 foundation: workspace/doc processing UX, acceptance criteria → UI)
- `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\archive\04-bmo-FR-wireframes-output-E03.md` (Stage 3 generation engine: configuration, preview, progress, validation, results)
- `c:\Users\james\Master\BrightHub\brun\train-data\docs\chunks-integration\VERIFICATION-CHECKLIST.md` (integration testing and readiness evidence)

## Product Summary
- Chunks-Alpha is the first module in the LoRA training pipeline focused on extracting, labeling, and validating rich “chunk” artifacts from source documents. It standardizes a 60+ dimension ontology for each chunk, supports AI-assisted dimension generation with confidence scoring, and presents results in a spreadsheet-like dashboard for review, filtering, sorting, export, and run comparison.
- It integrates with downstream training data generation (templates, scenarios, edge cases) by linking conversations to source chunks and using dimension-driven parameters to guide generation quality, voice, and context adherence.

## Objectives (distilled)
- Display all chunk dimensions in a compact, spreadsheet-like UI with sort/filter on key columns and resizable headers.
- Auto-extract prioritized chunk types and populate baseline + meta dimensions; store normalized in Supabase.
- Use simple, contract-style JSON prompts to generate first-pass values for dimensions requiring AI; track precision/accuracy confidence.
- Enable per-chunk run regeneration, versioned result pages, and side-by-side run comparison.
- Maintain traceability to source excerpts and provide validation/bias flags and quality scores on generated outputs.

## Dimension System (baseline + meta)
- Baseline dimensions derive from `document-metadata-dictionary.csv` (author, audience, section markers, tokens, embeddings, tags, etc.).
- Meta dimensions (from overview-chunk-alpha) are added to improve management and QA:
  - Importance/Criticalness (1–10) relative to LoRA interpretation quality
  - Category Type (e.g., Privacy → `IP_Sensitivity`, `PII_Flag`)
  - Context Engineering Type (mechanical vs generative; prompt strategy category)
  - Precision-Confidence (1–10) and Accuracy-Confidence (1–10)
  - Generation Cost Estimate (tokens × model rate)
- Result: a 60+ dimension ontology with both baseline and meta fields; AI-generated fields are marked with confidence and flagged when below thresholds.

## Chunk Types & Detection
- Chapter/Section (hierarchical structure): detect via headings, TOC/bookmarks, numbered outlines, typography cues; fill `Section_Heading`, `Page_Start/End`, `Char_Start/End`, `Token_Count`, `Chunk_Summary`, `Key_Terms`, `Audience`, `Intent`, `Primary_Category`, `Chunk_Type=Chapter_Sequential`, `Embedding_ID`, `Vector_Checksum`, `Include_In_Training`, `Data_Split`.
- Instructional Unit (procedures/tasks): detect imperative steps, “How to…”, checklists; fill `Task_Name`, `Preconditions`, `Inputs`, `Steps_JSON`, `Expected_Output`, `Warnings_Failure_Modes` plus promptable pairs.
- Claim–Evidence–Reasoning (CER): detect assertions with citations/stats/tables; fill `Claim`, `Evidence_Snippets`, `Reasoning_Sketch`, `Citations`, `Factual_Confidence_0_1`, `Compliance_Flags`.
- Example/Scenario/Dialog: detect case studies, Q&A, transcripts; fill `Scenario_Type`, `Problem_Context`, `Solution_Action`, `Outcome_Metrics`, `Style_Notes`, optional promptable pairs.
- Extraction targets are capped (Instructional ≤5, Examples ≤5, CER ≤10) to keep the UI navigable while preserving representative diversity.

## Core Workflows
- Category → Chunks: After categorization approval, a new “Chunks” action appears on the document dashboard; first run auto-extracts default chunk sets.
- Extraction & Labeling: Populate baseline fields from existing document-level metadata; generate generative fields via AI with simple context prompts.
- Storage: Save all chunk, metadata, referential, tags/labels, and generated dimension content to normalized, human-readable Supabase tables; include JSONB for flexible parameters and audit fields.
- Review: Spreadsheet-like dashboard shows all dimensions, sortable/filterable columns, header resizing; per-chunk historical runs are viewable and comparable.
- Regeneration: Trigger per-chunk regeneration; persist run IDs (chunk name + timestamp); enable run selection filtered by the current chunk.

## UI Behaviors (from FR wireframe outputs)
- Stage 1 foundation (E01):
  - Guided workspace + document processing flows with upload queue, validation/preview, progress indicators, status chips, breadcrumbs, and activity logs.
  - Accessibility: keyboard navigation, ARIA live regions for dynamic status, high-contrast indicators.
  - Acceptance → UI mapping is explicit for each element (creation wizard, dashboard status, queue management, validation, preview).
- Stage 3 generation engine (E03):
  - Configuration: task type (Q&A, multi-turn, instruction, completion), difficulty, batch size; optional bias/safety, domain adaptation.
  - Preview: side-by-side source excerpt vs generated pair; sub-scores (fidelity, factuality, appropriateness) and warnings.
  - Progress: per-batch bars with ETA, logs; run states (idle, queued, in-progress, paused, completed, failed).
  - Results: table with `Type`, `Difficulty`, `Quality score`, `Validation`, `Bias flag`, `Source link`; filters and bulk actions.
  - Traceability: “View source” drawer with highlight; validation/bias badges with tooltips.

## AI Integration & Prompts
- Default endpoint: Claude Sonnet 4.5 (configurable via code for now). Distinguish mechanical extraction (no engineered context) vs generative analysis (needs context engineering).
- Contract-style prompt format: JSON + JSON Schema with validation; include category constraints, expected fields, and confidence scoring rules.
- Context Engineering Type governs prompt selection (industry verticals, compliance, CER validation, task procedures) while staying minimal in this iteration.

## Data Model & Storage
- Supabase tables are normalized and named for clarity; use JSONB for flexible parameters and metadata; indexes defined for query performance.
- Audit trails track extraction runs, dimension changes, validation results, and linkages from conversations to source chunks.
- FR traceability indicates conversation-to-chunk linking, dimension-driven parameters, and 60-dimension utilization in downstream generation and QA.

## Validation & Readiness
- Integration checklist confirms production readiness: 78 tests passing, 4 API endpoints, E2E workflow validated, ~72.7% coverage, zero TypeScript errors.
- Critical acceptance criteria (from overview + FRs + wireframes):
  - Display all 61 dimensions per chunk with sortable/filterable columns and resizable headers.
  - Run comparison by chunk with versioned result pages and historical selection.
  - Export formats for downstream training (JSONL/JSON/CSV), with audit trails.
  - Generation quality visible (scores, validation, bias flags); traceability to source excerpts.
  - Accessibility and responsive behavior per wireframe specs.

## Code Pointers (minimal anchors)
- Train-wireframe mapping: dashboard layout, table, filtering, export, and views mapped to components; FR v3.0.0 includes file references for traceability.
- Chunks-alpha data and dashboard example: reference UI behaviors and columns from `chunks-alpha-dashboard` to align spreadsheet-like display and interactions.

## How To Answer (pattern)
- Outcome first: what the module does and the current behavior/state.
- Evidence: 1–2 acceptance criteria or UI behaviors, plus a validation artifact (e.g., test pass, progress state, export support).
- Traceability: 1 canonical source path to spec or FRs, 1 to wireframe output if helpful.
- Action: what to do next (e.g., where to trigger a run, which filters to apply, how to export).

## Quick Response Examples
- Q: Do we show all chunk dimensions, and can users sort/filter columns?
  - A: Yes. The dashboard presents all 61+ dimensions in a compact table with sortable and filterable columns and resizable headers. Users can filter by type/flags/score and sort by confidence, difficulty, or category. Evidence: E01 acceptance mapping confirms sortable table and filter bar; FRs require multi-column sorting and accessibility-compliant controls. Next action: Use the table’s filters to isolate low-confidence dimensions, then select a chunk to compare runs.
  - Sources: `01-bmo-overview-chunk-alpha_v1.md`, `04-bmo-FR-wireframes-output-E01.md`, verification checklist.

- Q: Is multi-turn conversation generation implemented with coherence validation?
  - A: Yes. Users configure scenarios, voice, and length; the turn-based viewer surfaces coherence indicators per turn and overall with warnings for context drift, plus sentiment/voice consistency chips. Preview provides a sample with quality badges; logs and progress visualize job states. Next action: Run a preview, inspect the coherence badges, then start the full generation; use filters to review conversations by quality and flags.
  - Sources: `04-bmo-FR-wireframes-output-E03.md` (FR3.2.0/FR3.1.0 sections), FR v3.0.0 wireframe mapping.

- Q: How are chunks extracted and stored for downstream linkage?
  - A: The module auto-extracts Chapter/Section, Instructional, CER, and Example/Scenario chunks, populates baseline and meta dimensions, and stores normalized records in Supabase with JSONB for flexible parameters. Each run has a unique ID; conversations link back to source chunks, enabling dimension-driven generation and auditability. Next action: Trigger “Chunks” extraction from the document dashboard; verify new records and run history; export JSONL for training.
  - Sources: `01-bmo-overview-chunk-alpha_v1.md`, FR traceability (FR9.1.x), verification checklist.

## Notes
- v2 focuses on distilled content; path lists are minimized and used only as anchors. For deeper UI spec details, consult the wireframe outputs (E01, E03) and FR v3.0.0 mapping tables.