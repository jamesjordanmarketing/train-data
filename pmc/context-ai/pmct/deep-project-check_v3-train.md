# Deep Project Check v3 — Gap Discovery (Train)

## Purpose
- Detect missing functionality: identify required features in the product specs that are not implemented in the codebase (`C:\Users\james\Master\BrightHub\brun\train-data\src\`).
- Focus on existence of functionality modules, endpoints, services, flows, and UI—NOT bug detection or behavioral correctness.

## Scope
- Inputs: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\01-train-overview.md`, `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\02.5-train-user-journey.md`, `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-bmo-functional-requirements.md`, `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-train-FR-enhancement-analysis-summary_v1.md`.
- Codebase target: `C:\Users\james\Master\BrightHub\brun\train-data\src\` including `C:\Users\james\Master\BrightHub\brun\train-data\src\app\`, `C:\Users\james\Master\BrightHub\brun\train-data\src\components\`, `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\`, `C:\Users\james\Master\BrightHub\brun\train-data\src\hooks\`, `C:\Users\james\Master\BrightHub\brun\train-data\src\stores\`, `C:\Users\james\Master\BrightHub\brun\train-data\src\utils\`, `C:\Users\james\Master\BrightHub\brun\train-data\src\supabase\functions\`, `C:\Users\james\Master\BrightHub\brun\train-data\src\supabase\migrations\`.
- Output: A structured gap report that lists FRs and their implementation status with confidence.

## Non-Goals
- No unit/integration testing.
- No runtime behavior validation.
- No performance/security auditing.

## Success Criteria
- Each FR extracted from specs is mapped to code artifacts with an implementation status: `implemented`, `partial`, or `missing`.
- Each status includes supporting evidence (files, symbols, routes) and a confidence score.
- Report is reproducible and can be updated as code or specs evolve.

---

## High-Level Approach

1. Requirements Extraction
   - Parse the four spec documents and extract “Feature Requirements” (FRs) using patterns like “must/shall/should/can” and explicit requirement sections.
   - Normalize FRs into a catalog with `id`, `title`, `description`, `acceptance_criteria`, `priority`, and `tags` (feature domain, UI/API, backend, data).
   - Derive “checkable signals” per FR (e.g., expected API route, service method, component, store, or migration).

2. Codebase Artifact Indexing
   - Build a searchable index of `C:\Users\james\Master\BrightHub\brun\train-data\src\` artifacts:
     - Next.js routes: `C:\Users\james\Master\BrightHub\brun\train-data\src\app\api\**\route.ts`, `C:\Users\james\Master\BrightHub\brun\train-data\src\app\**\page.tsx`, `C:\Users\james\Master\BrightHub\brun\train-data\src\app\actions\**`.
     - UI: `C:\Users\james\Master\BrightHub\brun\train-data\src\components\**`, `C:\Users\james\Master\BrightHub\brun\train-data\src\app\**\page.tsx`.
     - Services: `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\**` (e.g., `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\auth-service.ts`, `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\chunk-service.ts`, `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\export-service.ts`, `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\template-service.ts`, `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\dimension-service.ts`).
     - State: `C:\Users\james\Master\BrightHub\brun\train-data\src\stores\**` (e.g., `C:\Users\james\Master\BrightHub\brun\train-data\src\stores\workflow-store.ts`), `C:\Users\james\Master\BrightHub\brun\train-data\src\hooks\**`.
     - Data: `C:\Users\james\Master\BrightHub\brun\train-data\src\supabase\functions\**`, `C:\Users\james\Master\BrightHub\brun\train-data\src\supabase\migrations\**`, `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\database\**`, `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\supabase*.ts`.
     - Utilities: `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\utils\**`, `C:\Users\james\Master\BrightHub\brun\train-data\src\utils\**`, `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\retry-manager.ts`, `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\rate-limiter.ts`.
   - Extract symbols: exported functions/classes, server actions, React components, route segments, and migrations.

3. Mapping & Detection
   - For each FR, define a `FRCheck` with expected artifacts and matching heuristics:
     - File path expectations (directory + filename patterns).
     - Symbol/name expectations (function/class/component names).
     - Route expectations (`api` endpoints, `page.tsx` presence).
     - Data expectations (migrations for new tables/columns; supabase functions).
   - Run matchers to classify FRs into:
     - Implemented: All required signals present with strong matches.
     - Partial: Some signals present or weak matches.
     - Missing: No meaningful signals found.

4. Reporting
   - Generate `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\gap-report_v2-train.md`:
     - Summary counts by status and feature domain.
     - Per-FR details: expected vs. found, evidence links, confidence.
     - “Manual review” prompts where automated confidence is low.

---

## Data Models

### FR Item (from specs)
- `id`: stable identifier (e.g., `FR-AUTH-LOGIN-001`).
- `title`: concise name.
- `description`: normalized text extracted from specs.
- `acceptance_criteria`: bullet list from specs if present.
- `priority`: optional (e.g., Must/Should/Could).
- `tags`: array of domains: `auth`, `workflow`, `chunks`, `export`, `template`, `supabase`, `ui`, `api`, `store`, `hook`, `migration`.

### FRCheck (implementation expectation)
- `fr_id`: link to FR item.
- `artifacts`: list of expected signals:
  - `type`: `route|api|component|service|store|hook|migration|function|util|server-action`.
  - `path_patterns`: list of glob-like patterns (Windows separators).
  - `symbol_patterns`: regex for names, e.g., `export function signIn`.
  - `required`: boolean (true = must exist; false = optional helper).
- `threshold`: minimum matches required to consider implemented.
- `notes`: clarifications or manual review guidance.

### Match Result
- `fr_id`
- `status`: `implemented|partial|missing`
- `confidence`: `0.0–1.0` based on signals matched and specificity.
- `evidence`: list of files/symbols matched.
- `gaps`: list of expected signals missing.

---

## Output Format

- Summary
  - Totals by `status` with percentages.
  - Breakdown by domain tag.

- Per-FR Section
  - `FR {id}: {title}`
  - `Status`: implemented | partial | missing
  - `Confidence`: 0.00–1.00
  - `Expected Artifacts`: bullet list from FRCheck.
  - `Found Evidence`: file paths and symbols.
  - `Missing`: which expected artifacts were not found.
  - `Manual Review`: prompts or follow-ups.

- Appendix
  - Artifact index snapshot: directories scanned, counts per type.

---

## Example FRChecks (Illustrative)

> Note: These are examples; the actual FRs come from the four product docs during extraction.

```json
{
  "fr_id": "FR-AUTH-LOGIN-001",
  "artifacts": [
    { "type": "component", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\components\\\\auth\\\\**\\\\*.tsx", "C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\app\\\\(auth)\\\\**\\\\page.tsx"], "symbol_patterns": ["Login", "SignIn"], "required": true },
    { "type": "service", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\lib\\\\auth-service.ts"], "symbol_patterns": ["export function signIn", "export async function getSession"], "required": true },
    { "type": "route", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\app\\\\api\\\\auth\\\\route.ts"], "symbol_patterns": [], "required": false }
  ],
  "threshold": 2,
  "notes": "Either API or server-side auth acceptable depending on architecture."
}
```

```json
{
  "fr_id": "FR-CHUNKS-UPLOAD-002",
  "artifacts": [
    { "type": "component", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\components\\\\upload\\\\**\\\\*.tsx"], "symbol_patterns": ["Upload", "Dropzone"], "required": true },
    { "type": "service", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\lib\\\\chunk-service.ts", "C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\lib\\\\file-processing\\\\**\\\\*.ts"], "symbol_patterns": ["extractChunks", "saveChunks"], "required": true },
    { "type": "route", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\app\\\\api\\\\chunks\\\\route.ts"], "symbol_patterns": ["POST"], "required": false },
    { "type": "migration", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\supabase\\\\migrations\\\\**\\\\*.sql"], "symbol_patterns": ["CREATE TABLE chunks"], "required": false }
  ],
  "threshold": 2,
  "notes": "Presence of service + UI suggests implementation even without a dedicated API route."
}
```

```json
{
  "fr_id": "FR-EXPORT-CSV-003",
  "artifacts": [
    { "type": "service", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\lib\\\\export-service.ts", "C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\lib\\\\export-transformers\\\\**\\\\*.ts"], "symbol_patterns": ["toCSV", "exportChunks"], "required": true },
    { "type": "route", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\app\\\\api\\\\export\\\\route.ts"], "symbol_patterns": ["GET", "POST"], "required": false },
    { "type": "component", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\components\\\\chunks\\\\**\\\\*.tsx", "C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\components\\\\templates\\\\**\\\\*.tsx"], "symbol_patterns": ["ExportButton"], "required": false }
  ],
  "threshold": 1,
  "notes": "Service implementation is the core requirement."
}
```

---

## Implementation Plan (v1)

- Requirements Extractor
  - Parse `.md` files in `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\` and extract FRs using keyword patterns and headings.
  - Normalize into `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\fr-catalog.json` with tags inferred from content and known domains.

- Artifact Indexer
  - Walk `C:\Users\james\Master\BrightHub\brun\train-data\src\` and `C:\Users\james\Master\BrightHub\brun\train-data\src\supabase\` to collect files by type.
  - Extract exported symbols, route definitions, component names, server actions.

- Matcher
  - For each FR, evaluate `FRCheck` against the artifact index.
  - Compute `status`, `confidence`, `evidence`, `gaps`.

- Reporter
  - Generate `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\gap-report_v2-train.md`.
  - Include summary, per-FR details, and manual review prompts.

- Configuration
  - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\fr-checks.json`: holds FRChecks with path/symbol patterns.
  - Allow overrides for architecture nuances (e.g., server actions vs API routes).

---

## Manual Review Prompts

- If a FR expects a route but a server action exists, confirm architecture intent.
- If generic component names are found (e.g., `Button`, `Modal`) without domain-specific usage, mark as low confidence.
- If migrations exist without corresponding services or UI, check if feature was dropped or is backend-only.
- If services exist but are unused (no imports), flag as partial with action to verify integration points.

---

## Limitations

- Heuristic matching may miss features implemented under unconventional names.
- Specs may use different terminology than code; synonym dictionary will mitigate but not eliminate gaps.
- Some features are cross-cutting (e.g., rate limiting) and require usage tracing, not just presence.

---

## Heuristic Aids

- Synonym Maps
  - Auth: `sign in`, `login`, `session`, `token`.
  - Chunks: `segment`, `extract`, `split`, `ingest`.
  - Export: `download`, `transform`, `CSV`, `JSON`.
  - Templates: `render`, `template-engine`, `fill`.
  - Workflow: `step`, `phase`, `progress`, `store`.

- Domain-to-Directory Defaults
  - `auth` → `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\auth-service.ts`, `C:\Users\james\Master\BrightHub\brun\train-data\src\components\auth\`, `C:\Users\james\Master\BrightHub\brun\train-data\src\app\(auth)\`.
  - `chunks` → `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\chunk-service.ts`, `C:\Users\james\Master\BrightHub\brun\train-data\src\components\chunks\`, `C:\Users\james\Master\BrightHub\brun\train-data\src\app\chunks\`.
  - `export` → `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\export-service.ts`, `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\export-transformers\`.
  - `templates` → `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\template-service.ts`, `C:\Users\james\Master\BrightHub\brun\train-data\src\components\templates\`, `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\template-engine\`.
  - `workflow` → `C:\Users\james\Master\BrightHub\brun\train-data\src\stores\workflow-store.ts`, `C:\Users\james\Master\BrightHub\brun\train-data\src\app\(workflow)\`, `C:\Users\james\Master\BrightHub\brun\train-data\src\components\workflow\`.
  - `data/supabase` → `C:\Users\james\Master\BrightHub\brun\train-data\src\supabase\migrations\`, `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\supabase*.ts`, `C:\Users\james\Master\BrightHub\brun\train-data\src\supabase\functions\`.

---

## Output Example (Per FR)

- FR AUTH LOGIN 001
  - Status: Implemented
  - Confidence: 0.86
  - Expected Artifacts:
    - Component: `C:\Users\james\Master\BrightHub\brun\train-data\src\components\auth\Login.tsx` or `C:\Users\james\Master\BrightHub\brun\train-data\src\app\(auth)\page.tsx`
    - Service: `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\auth-service.ts` (`signIn`, `getSession`)
  - Found Evidence:
    - `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\auth-service.ts` (exported `signIn`)
    - `C:\Users\james\Master\BrightHub\brun\train-data\src\app\(auth)\page.tsx` (Login UI)
  - Missing:
    - API `C:\Users\james\Master\BrightHub\brun\train-data\src\app\api\auth\route.ts` (optional)
  - Manual Review:
    - Confirm authentication handled via server actions/sessions without API route.

---

## Next Steps

- Implement the extractor and indexer modules.
- Draft initial `fr-checks.json` using tags inferred from product docs.
- Run the matcher and produce an initial `gap-report_v2-train.md`.
- Iterate on synonyms and path patterns to improve confidence.

---

## Appendix: Observed Codebase Landmarks (from `C:\Users\james\Master\BrightHub\brun\train-data\src\`)

- `C:\Users\james\Master\BrightHub\brun\train-data\src\app\`
  - Route groups: `(auth)`, `(dashboard)`, `(workflow)`, `api`, `actions`, `chunks`, `test-chunks`.
  - Shell: `layout.tsx`, `page.tsx`, `globals.css`.

- `C:\Users\james\Master\BrightHub\brun\train-data\src\components\`
  - Domains: `auth`, `chunks`, `upload`, `workflow`, `templates`, `ui`, `client`, `server`.

- `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\`
  - Services: `auth-service.ts`, `chunk-service.ts`, `template-service.ts`, `export-service.ts`, `dimension-service.ts`, `scenario-service.ts`.
  - Infra: `supabase.ts`, `supabase-server.ts`, `database.ts`, `rate-limiter.ts`, `retry-manager.ts`.
  - Pipelines: `file-processing`, `generation`, `quality`, `monitoring`.

- `C:\Users\james\Master\BrightHub\brun\train-data\src\stores\`
  - `workflow-store.ts`.

- `C:\Users\james\Master\BrightHub\brun\train-data\src\hooks\`
  - `use-debounce.ts`.

- `C:\Users\james\Master\BrightHub\brun\train-data\src\supabase\`
  - `functions\` and `migrations\`.

This structure informs the default mapping and matching rules for FRChecks.