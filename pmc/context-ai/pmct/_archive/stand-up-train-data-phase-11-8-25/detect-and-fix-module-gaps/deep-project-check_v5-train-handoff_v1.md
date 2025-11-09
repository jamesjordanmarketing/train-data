# Project + Module Context (Read First)

This repository implements the Bright Run LoRA fine-tuning Training Data platform (“BRUN”) with a modular architecture. The `train-data` module you are operating sits on top of an already functioning `chunks-alpha` module that provides chunk extraction, visualization, dimension generation/validation, and regeneration workflows. The gap discovery system in this file is designed to continuously verify that functional requirements across these modules have concrete implementation signals in code.

Product overview and module documentation:
- Full product overview: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\01-bmo-overview-full-brun-product.md`
- Integrated module overview (chunks-alpha): `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\01-bmo-overview-chunk-alpha_v2.md`
- Functional requirements source (referenced by generator): `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-bmo-functional-requirements.md`

What “chunks-alpha” provides
- Located conceptually under the BRUN product as the content chunking and analysis engine.
- Implements the chunk UI and routes for dashboard, dimension detail, and spreadsheet views (see module doc for exact page structure and UI responsibilities).
- Core paths within this repository reflecting chunk features:
  - `C:\Users\james\Master\BrightHub\brun\train-data\src\app\chunks\`
  - `C:\Users\james\Master\BrightHub\brun\train-data\src\components\chunks\`
  - Services like `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\chunk-service.ts` and `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\dimension-service.ts`
- UI design and functional flow details: `01-bmo-overview-chunk-alpha_v2.md` (full path above).

What “train-data” adds on top of chunks-alpha
- Guided training data creation atop chunked content: upload workflows, dimension generation/regeneration, QA pair curation, export to LoRA-ready CSV.
- Workflow and UI modules beyond chunks-alpha:
  - Upload UI: `C:\Users\james\Master\BrightHub\brun\train-data\src\components\upload\` and `C:\Users\james\Master\BrightHub\brun\train-data\src\app\(dashboard)\upload\`
  - Workflow UI: `C:\Users\james\Master\BrightHub\brun\train-data\src\components\workflow\`
  - Export UI and routes: `C:\Users\james\Master\BrightHub\brun\train-data\src\components\import-export\`, `C:\Users\james\Master\BrightHub\brun\train-data\src\app\api\export\`
- Back-end and service layer:
  - `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\export-service.ts`, `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\chunk-service.ts`, `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\dimension-service.ts`
  - DB integration (Supabase): `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\database.ts`, migrations under `C:\Users\james\Master\BrightHub\brun\train-data\supabase\migrations\`

Why the gap discovery system exists
- BRUN’s breadth requires an automated, evidence-based sanity check to align implementation with functional requirements.
- This system statically indexes code and matches artifact patterns (routes, components, services, migrations) and optional symbol patterns drawn from product docs.
- Reports provide an “implemented/partial/missing” snapshot and confidence score per FR to guide review and prioritization.

# Gap Discovery System — Operational + Technical Handover (v1)

This document is the operational tutorial and technical handoff for the Train Data gap discovery system. It enables a new agent to operate, adapt, and extend the system that generates implementation evidence across functional requirements.

Key scripts and artifacts:
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\run-gap-check.js`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\generate-fr-checks.js`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\debug-glob.js`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\fr-checks.json`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\fr-checks.generated.json`
- Report output: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\gap-report_v2-train.md`
- Source spec: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-bmo-functional-requirements.md`

---

## Operational Tutorial

### Prerequisites
- Windows environment with Node.js (v18+ recommended).
- Current working directory: `C:\Users\james\Master\BrightHub\brun\train-data`.
- Ensure the functional requirements doc is up to date:
  - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-bmo-functional-requirements.md`.

### Quick Start — Generate and Run
1) Generate FR checks from the product document:
```
node pmc\context-ai\pmct\generate-fr-checks.js
```
- Produces: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\fr-checks.generated.json`.

2) Run the gap check:
```
node pmc\context-ai\pmct\run-gap-check.js
```
- Produces: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\gap-report_v2-train.md`.

3) Review the report:
- Open `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\gap-report_v2-train.md`.
- Summary section shows implemented/partial/missing counts.
- Per-FR sections show expected artifacts, found evidence, missing expectations, and manual review notes.

### Common Operations
- Update base checks: edit `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\fr-checks.json`.
- Regenerate doc-derived checks: run `generate-fr-checks.js` to update `fr-checks.generated.json`.
- Extend the scan scope: adjust directories in `run-gap-check.js` (see Technical Handoff).
- Debug glob patterns: use `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\debug-glob.js` (see Troubleshooting).

---

## Technical Handoff

### Architecture Overview
- Generator reads code references from the spec and emits FR checks:
  - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\generate-fr-checks.js` parses `03-bmo-functional-requirements.md`.
  - Output: `fr-checks.generated.json` with `checks: [{ fr_id, artifacts[] }]`.
- Matcher merges base and generated checks and scans codebase:
  - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\run-gap-check.js`.
  - Builds an index of files under target directories.
  - For each FR, matches path patterns and optional symbol patterns.
  - Classifies FRs: implemented / partial / missing with a confidence heuristic.
  - Renders the final report to `gap-report_v2-train.md`.

### Indexer Scan Scope (run-gap-check.js)
Indexed directories are controlled in `buildIndex()` within:
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\run-gap-check.js`

Default directories scanned:
- `C:\Users\james\Master\BrightHub\brun\train-data\src\`
- `C:\Users\james\Master\BrightHub\brun\train-data\supabase\migrations\`
- `C:\Users\james\Master\BrightHub\brun\train-data\src\supabase\functions\`
- `C:\Users\james\Master\BrightHub\brun\train-data\train-wireframe\src\`

Ignore rules:
- Skips `node_modules`, `.git`, `.swc`, `archive`, and `train-wireframe\node_modules`.
- Only indexes files with extensions: `.ts`, `.tsx`, `.js`, `.jsx`, `.sql`, `.md`, `.json`.

To add more directories:
- Modify `buildIndex()` in `run-gap-check.js` to push additional `listFiles(<dir>)` calls.

### FR Check Model
Artifacts within each FRCheck have the shape:
- `type`: one of `route | component | migration | service | pipeline | store | hook | util`.
- `path_patterns`: list of glob-like absolute patterns (Windows paths are supported).
- `symbol_patterns` (optional): strings or regex fragments to search within matched files.
- `required`: boolean indicating whether the artifact is necessary.
- `threshold` (optional): minimum number of matched artifacts needed for “implemented”.

Base checks live in:
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\fr-checks.json`
Doc-derived checks are generated to:
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\fr-checks.generated.json`

### Matching & Classification (run-gap-check.js)
- Path matching: `anyPathMatches()` converts file paths to forward slashes and tests against `globToRegExp()` outputs.
- Symbol matching: `fileContainsAnySymbols()` reads file content and tests for `symbol_patterns` (case-insensitive regex fallback).
- Classification:
  - `implemented`: all required artifacts matched and overall matches >= `threshold`.
  - `partial`: some required artifacts matched or overall matches >= ~50% of `threshold`.
  - `missing`: no meaningful matches.
- Confidence score:
  - Weighted by required match ratio, capped optional matches, and symbol hits.
  - Range: `0.0–1.0` with decimal rounding.

### Glob Engine Details
- Implemented in `globToRegExp()` inside:
  - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\run-gap-check.js`
- Normalization:
  - All globs and file paths internally normalized to forward slashes.
- Wildcards:
  - `*` → `[^/]*` (match within a single path segment, not across `/`).
  - `**/` → `(?:.*/)?` (zero or more nested directories).
  - Remaining `**` → `.*` (cross-directory match).
- Debug and local verification:
  - Use `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\debug-glob.js` to print the regex and test a specific path.

### Report Rendering
- Renderer prints summary, per-FR details, expected artifact patterns, found evidence paths (up to 5 per artifact), missing expectations, and manual review prompts.
- Output file:
  - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\gap-report_v2-train.md`
- Appendix includes an index snapshot with the directories scanned.

### Generator (Doc → Checks)
- Script: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\generate-fr-checks.js`
- Input: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-bmo-functional-requirements.md`
- Behavior:
  - Parses FR IDs, titles, and “Code Reference” entries.
  - Normalizes references to absolute forward-slash paths within the repository root.
  - Classifies artifacts by path:
    - `/app/api/` → `route`
    - `/components/` → `component`
    - `/supabase/migrations/` or `.sql` → `migration`
    - otherwise → `service`
  - Emits `checks: [...]` to `fr-checks.generated.json`.

---

## Adapting the System

### Add or Refine an FR Check
1) In `fr-checks.json`, add a new entry or refine existing ones. Example artifact structure:
```
{
  "fr_id": "FR-EXAMPLE-001",
  "artifacts": [
    {
      "type": "component",
      "path_patterns": [
        "C:/Users/james/Master/BrightHub/brun/train-data/src/components/example/**/*.tsx"
      ],
      "symbol_patterns": ["ExampleButton", "handleExampleClick"],
      "required": true
    },
    {
      "type": "route",
      "path_patterns": [
        "C:/Users/james/Master/BrightHub/brun/train-data/src/app/api/example/route.ts"
      ],
      "required": true
    }
  ],
  "threshold": 2
}
```
2) Run `node pmc\context-ai\pmct\run-gap-check.js` and review the report output.

### Expand the Indexer
- Add directories in `buildIndex()` within:
  - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\run-gap-check.js`
- Example additions:
  - `docs` for spec alignment signals.
  - `src\scripts` for operational tooling signals.

### Increase Strictness
- If a critical artifact (e.g., migrations) is missing, you can treat the FR as `partial` by raising `threshold` or requiring that artifact:
  - Mark the migration artifact as `required: true` in `fr-checks.json`.
  - Optionally increase `threshold` in the FR to enforce multiple signals.

### Improve Confidence
- Add `symbol_patterns` for key functions/types/components.
  - Examples: `generateDimensions`, `ExportButton`, `Conversation` type.
- Keep patterns specific but resilient (avoid overfitting to exact names unless necessary).

---

## Troubleshooting

### Glob Patterns Not Matching
- Use `debug-glob.js` to test a single pattern and file path:
```
node pmc\context-ai\pmct\debug-glob.js
```
- Edit the `pattern` and `fp` variables inside:
  - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\debug-glob.js`
- Check:
  - Paths are normalized to forward slashes internally.
  - Use `**/` for zero or more directories; use `*` within a segment.

### Missing Migration Evidence
- Ensure migration files exist under:
  - `C:\Users\james\Master\BrightHub\brun\train-data\supabase\migrations\`
- Add migration patterns to FR checks or mark them as required.

### Low Confidence Scores
- Add symbol checks for core functions/types.
- Add additional artifact patterns (e.g., routes + services + components).
- Verify scan scope includes all relevant directories.

### Duplicate or Broad “Expected Artifacts”
- Doc-derived checks can produce repeated entries when the doc references the same file multiple times.
- You can manually curate `fr-checks.generated.json` to reduce noise and improve specificity.

### Node / CWD Issues
- Always run commands from repo root:
  - `C:\Users\james\Master\BrightHub\brun\train-data`
- Ensure Node v18+ to avoid minor fs/regExp differences.

---

## Operations Playbook
- Update product doc with new references:
  - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-bmo-functional-requirements.md`
- Regenerate checks: `node pmc\context-ai\pmct\generate-fr-checks.js`
- Run matcher: `node pmc\context-ai\pmct\run-gap-check.js`
- Review report: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\gap-report_v2-train.md`
- If mismatches appear, debug with `debug-glob.js` and refine patterns.
- Iterate until confidence and coverage are acceptable.

---

## Reference Paths & Artifacts
- Matcher: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\run-gap-check.js`
- Generator: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\generate-fr-checks.js`
- Glob Debugger: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\debug-glob.js`
- Base FR Checks: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\fr-checks.json`
- Generated FR Checks: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\fr-checks.generated.json`
- Report Output: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\gap-report_v2-train.md`
- Spec Source: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-bmo-functional-requirements.md`
- Indexed Directories:
  - `C:\Users\james\Master\BrightHub\brun\train-data\src\`
  - `C:\Users\james\Master\BrightHub\brun\train-data\supabase\migrations\`
  - `C:\Users\james\Master\BrightHub\brun\train-data\src\supabase\functions\`
  - `C:\Users\james\Master\BrightHub\brun\train-data\train-wireframe\src\`

---

## Final Notes
- This system provides static evidence of implementation; it does not replace runtime tests.
- Treat “implemented” as strong artifact presence, not production readiness.
- Increase strictness where necessary by adjusting `required` flags and `threshold` per FR.
- Keep glob patterns maintainable: prefer targeted directories and segment-level `*` when possible.