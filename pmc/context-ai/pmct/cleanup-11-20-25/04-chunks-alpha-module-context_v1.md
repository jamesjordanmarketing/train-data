# Chunks-Alpha Module Context (v1)

Audience: New agent responsible for explaining and tracing the chunks-alpha module within this codebase.

Purpose: Enable confident responses with exact file paths, FR traceability, execution outputs (E01–E*), validation artifacts, and implementation-aware pointers.

## Product Overview
- Scope: Document chunk extraction, dimension analysis, and spreadsheet-style evaluation module feeding downstream training data.
- Outcomes: Structured dimensions, UI review artifacts, FR-linked execution logs, SQL checks, and integration with the main app.

## Canonical Sources (Absolute Paths)
- Overview: `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\01-bmo-overview-chunk-alpha_v2.md`
- Functional requirements: `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-bmo-functional-requirements-chunks-alpha_v1.md`
- FR wireframes archive index: `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\archive\04-FR-wireframes-index.md`
- Codebases:
  - Main app: `c:\Users\james\Master\BrightHub\brun\train-data\src`
  - Wireframe/UI: `c:\Users\james\Master\BrightHub\brun\train-data\train-wireframe\src`

## FR → Wireframe Execution Outputs (Archive)
- Directory: `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\archive\`
- Key outputs (chunks-alpha):
  - `04-bmo-FR-wireframes-output-E01.md`, `04-bmo-FR-wireframes-output-E01_v2.md`, `04-bmo-FR-wireframes-output-E01-integrated.md`, `04-bmo-FR-wireframes-output-E01_orginal.md`
  - `04-bmo-FR-wireframes-output-E02.md`
  - `04-bmo-FR-wireframes-output-E03.md` and variations (categorization, gather-module v2/v3)
  - `04-bmo-FR-wireframes-output-E04.md`
  - `04-bmo-FR-wireframes-output-E05.md`
  - `04-bmo-FR-wireframes-output-E06.md`
  - Additional references: `04-bmo-FR-wireframes-E01.md`–`E11.md` and train-FR variants

## Recommended Reading Order
- Start with `01-bmo-overview-chunk-alpha_v2.md` → `03-bmo-functional-requirements-chunks-alpha_v1.md`.
- Review archive outputs: `04-bmo-FR-wireframes-output-E01.md` through `E06.md`, plus variations for E03.
- Consult the index: `04-FR-wireframes-index.md` for cross-linking and scope.

## Key Concepts
- Dimension System: Chunks carry a 60+ dimension ontology; artifacts demonstrate display, sorting, filtering, and export readiness.
- Traceability: FR IDs in the functional requirements link to concrete execution outputs in `archive/`.
- Validation: SQL checks and verification scripts appear across E* outputs and supporting files.

## How To Inform the User (Answer Patterns)
- Summarize the outcome, cite one canonical source (overview or FR), and link the matching E0X `output` file.
- Include a validation artifact when available (SQL check, verification results), and note UI or code mapping.

## Action Directives
- Always include at least one absolute path to a source document and one to an E0X output.
- Connect features to FR identifiers from `03-bmo-functional-requirements-chunks-alpha_v1.md`.
- For UI behavior (sorting/filtering/resizing), reference the wireframe and main app component paths as needed.

## Common Workflows
- Explain module status: Overview + FR section + most recent E0X output; add notes for E03 variations.
- Trace a feature: Find the FR section and link the matching `output-E0X` file; add any SQL/verification references.
- Validate data: Cite `output-E0X` plus any `SQL-CHECK` artifacts; describe a one-line result.

## Validation & Evidence Artifacts (Examples)
- Archive outputs: `04-bmo-FR-wireframes-output-E01*.md` through `E06.md`, E03 categorization/gather variants
- Wireframe references: `04-bmo-FR-wireframes-E01.md`–`E11.md`
- Index: `04-FR-wireframes-index.md`

## Codebase Pointers
- Chunk feature views/components live under: `c:\Users\james\Master\BrightHub\brun\train-data\src\components\chunks\` and `src\app\chunks\`
- Services/utilities: `src\lib\chunk-extraction\`, `src\lib\chunk-service.ts`, `src\lib\dimension-service.ts`
- Validation scripts: `src\scripts\check-e01-sql.js`, `src\scripts\check-e06-sql.js`

## Answer Template (Use and Adapt)
- Outcome: One-sentence summary of the chunk-alpha feature.
- Sources: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-bmo-functional-requirements-chunks-alpha_v1.md` (FR[X.Y.Z]).
- Execution: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\archive\04-bmo-FR-wireframes-output-E0N*.md` (include variant if relevant).
- Evidence: Reference any SQL/verification note or output filename.
- Next step: Optional validation or UI trace.

## Quick Response Examples
- Data dimensions display and sorting:
  - Outcome: All chunk dimensions display with sortable columns.
  - Sources: `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-bmo-functional-requirements-chunks-alpha_v1.md` (display/sorting FRs).
  - Execution: `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\archive\04-bmo-FR-wireframes-output-E03.md` (or categorization/gather variants).
  - Evidence: UI behavior confirmed in E03 output variations.

- E01 SQL verification status:
  - Outcome: Baseline SQL checks for chunk ingestion executed; key validations passed.
  - Sources: `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-bmo-functional-requirements-chunks-alpha_v1.md` (ingestion/integrity FRs).
  - Execution: `c:\Users\james\Master\BrightHub\brun\train-data\src\scripts\check-e01-sql.js` results tied to `archive\04-bmo-FR-wireframes-output-E01*.md`.
  - Evidence: Check logs and output notes within E01 files.

- Column resizing and filter behavior:
  - Outcome: Columns resizable; filters operate across dimension values.
  - Sources: `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-bmo-functional-requirements-chunks-alpha_v1.md` (UX FRs).
  - Execution: `c:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\archive\04-bmo-FR-wireframes-output-E04.md`–`E06.md`.
  - Evidence: Wireframe outputs document the interaction model.

## Where This Context Lives
- `c:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\04-chunks-alpha-module-context_v1.md`