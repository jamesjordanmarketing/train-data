# Deep Project Check v5 — Gap Discovery (Train)

## Purpose
- Detect missing functionality: identify required Train Data features specified in product docs that are not implemented in the codebase (`C:\Users\james\Master\BrightHub\brun\train-data\src\`).
- Focus on existence of modules, endpoints, services, flows, UI, and migrations—NOT bug detection or behavioral correctness.
- Treat Auth as a dependency only; gaps are considered for Train Data’s persistent user scoping, not Auth features themselves.

## Scope
- Inputs: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\01-train-overview.md`, `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\02.5-train-user-journey.md`, `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-bmo-functional-requirements.md`, `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-train-FR-enhancement-analysis-summary_v1.md`.
- Codebase target: `C:\Users\james\Master\BrightHub\brun\train-data\src\`, including:
  - `C:\Users\james\Master\BrightHub\brun\train-data\src\app\`
  - `C:\Users\james\Master\BrightHub\brun\train-data\src\components\`
  - `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\`
  - `C:\Users\james\Master\BrightHub\brun\train-data\src\hooks\`
  - `C:\Users\james\Master\BrightHub\brun\train-data\src\stores\`
  - `C:\Users\james\Master\BrightHub\brun\train-data\src\utils\`
  - `C:\Users\james\Master\BrightHub\brun\train-data\src\supabase\functions\`
- Migrations: top-level `C:\Users\james\Master\BrightHub\brun\train-data\supabase\migrations\`.
- Output: A gap report that lists FRs and their implementation status with confidence.

## Non-Goals
- No unit/integration testing.
- No runtime behavior validation.
- No performance/security auditing.
- No Auth feature gap analysis (Auth is a dependency only).

## Success Criteria
- Each FR extracted from specs is mapped to Train Data artifacts with status: `implemented`, `partial`, or `missing`.
- Each status includes supporting evidence (files, symbols, routes) and a confidence score.
- Report is reproducible and can be updated as code or specs evolve.

---

## High-Level Approach

1. Requirements Extraction
   - Parse the four spec documents and extract “Feature Requirements” (FRs) using patterns like “must/shall/should/can” and explicit requirement sections.
   - Normalize FRs into a catalog with `id`, `title`, `description`, `acceptance_criteria`, `priority`, and `tags` (feature domain, UI/API, backend, data).
   - Derive “checkable signals” per FR (expected API route, service method, component, store, or migration).

2. Codebase Artifact Indexing
   - Build a searchable index of `C:\Users\james\Master\BrightHub\brun\train-data\src\` artifacts:
     - Next.js routes: `C:\Users\james\Master\BrightHub\brun\train-data\src\app\api\**\route.ts`, `C:\Users\james\Master\BrightHub\brun\train-data\src\app\**\page.tsx`, `C:\Users\james\Master\BrightHub\brun\train-data\src\app\actions\**`.
     - UI: `C:\Users\james\Master\BrightHub\brun\train-data\src\components\**`, including `import-export\`, `upload\`, `templates\`, `chunks\`.
     - Services: `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\**` (e.g., `chunk-service.ts`, `export-service.ts`, `template-service.ts`, `dimension-service.ts`, `edge-case-service.ts`).
     - Pipelines: `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\quality\**\*`, `generation\**\*`, `file-processing\**\*`.
     - State: `C:\Users\james\Master\BrightHub\brun\train-data\src\stores\**` (e.g., `workflow-store.ts`), `C:\Users\james\Master\BrightHub\brun\train-data\src\hooks\**`.
     - Data: `C:\Users\james\Master\BrightHub\brun\train-data\src\supabase\functions\**`, `C:\Users\james\Master\BrightHub\brun\train-data\supabase\migrations\**`, `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\database\**`, `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\supabase*.ts`.
     - Utilities: `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\utils\**`, `C:\Users\james\Master\BrightHub\brun\train-data\src\utils\**`, `retry-manager.ts`, `rate-limiter.ts`.
   - Extract symbols: exported functions/classes, server actions, React components, route segments, and migrations.

3. Mapping & Detection
   - For each FR, define a `FRCheck` with expected artifacts and matching heuristics:
     - File path expectations (directory + filename patterns).
     - Symbol/name expectations (function/class/component names).
     - Route expectations (`api` endpoints, `page.tsx` presence).
     - Data expectations (migrations for new tables/columns; supabase functions).
   - Run matchers to classify FRs into implemented, partial, or missing.

4. Reporting
   - Generate `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\gap-report_v2-train.md` with summary, per-FR details, evidence, and manual review prompts.

---

## Data Models

### FR Item (from specs)
- `id`: stable identifier (e.g., `FR-CHUNKS-UPLOAD-002`).
- `title`: concise name.
- `description`: normalized text extracted from specs.
- `acceptance_criteria`: bullet list from specs if present.
- `priority`: optional (e.g., Must/Should/Could).
- `tags`: array of domains: `workflow`, `chunks`, `export`, `template`, `supabase`, `ui`, `api`, `store`, `hook`, `migration`, `user-context`.

### FRCheck (implementation expectation)
- `fr_id`: link to FR item.
- `artifacts`: list of expected signals:
  - `type`: `route|api|component|service|store|hook|migration|function|util|server-action|pipeline`.
  - `path_patterns`: list of glob-like patterns (Windows separators).
  - `symbol_patterns`: regex for names (e.g., `generateDimensions`, `ExportButton`).
  - `required`: boolean (true = must exist; false = optional helper).
- `threshold`: minimum matches required to consider implemented.
- `notes`: clarifications or manual review guidance.

### Match Result
- `fr_id`
- `status`: `implemented|partial|missing`
- `confidence`: `0.0–1.0`
- `evidence`: list of files/symbols matched.
- `gaps`: list of expected signals missing.

---

## Example FRChecks (Illustrative)

> Note: Examples focus on Train Data; Auth is a dependency only.

```json
{
  "fr_id": "FR-TRAIN-USER-CONTEXT-001",
  "artifacts": [
    { "type": "service", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\lib\\\\**\\\\*.ts"], "symbol_patterns": ["userId", "ownerId"], "required": true },
    { "type": "migration", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\supabase\\\\migrations\\\\**\\\\*.sql"], "symbol_patterns": ["user_id", "owner_id"], "required": false }
  ],
  "threshold": 1,
  "notes": "Gap only if Train Data reads/writes ignore persistent user context."
}
```

```json
{
  "fr_id": "FR-CHUNKS-UPLOAD-002",
  "artifacts": [
    { "type": "component", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\components\\\\upload\\\\**\\\\*.tsx"], "symbol_patterns": ["Upload", "Dropzone"], "required": true },
    { "type": "service", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\lib\\\\chunk-service.ts", "C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\lib\\\\file-processing\\\\**\\\\*.ts"], "symbol_patterns": ["extractChunks", "saveChunks"], "required": true },
    { "type": "route", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\app\\\\api\\\\chunks\\\\route.ts"], "symbol_patterns": ["POST"], "required": false },
    { "type": "migration", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\supabase\\\\migrations\\\\**\\\\*.sql"], "symbol_patterns": ["CREATE TABLE chunks"], "required": false }
  ],
  "threshold": 2,
  "notes": "Service + UI implies implementation even if no dedicated API route."
}
```

```json
{
  "fr_id": "FR-EXPORT-CSV-003",
  "artifacts": [
    { "type": "service", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\lib\\\\export-service.ts", "C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\lib\\\\export-transformers\\\\**\\\\*.ts"], "symbol_patterns": ["toCSV", "exportChunks"], "required": true },
    { "type": "route", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\app\\\\api\\\\export\\\\route.ts", "C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\app\\\\api\\\\export\\\\download\\\\route.ts"], "symbol_patterns": ["GET", "POST"], "required": false },
    { "type": "component", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\components\\\\import-export\\\\**\\\\*.tsx"], "symbol_patterns": ["ExportButton", "ImportButton"], "required": false }
  ],
  "threshold": 1,
  "notes": "Service implementation is core; UI trigger and routes strengthen confidence."
}
```

```json
{
  "fr_id": "FR-DIMENSION-GENERATION-005",
  "artifacts": [
    { "type": "service", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\lib\\\\dimension-service.ts", "C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\lib\\\\dimension-generation\\\\**\\\\*"] , "symbol_patterns": ["generateDimensions", "regenerateDimensions"], "required": true },
    { "type": "route", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\app\\\\api\\\\chunks\\\\generate-dimensions\\\\route.ts", "C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\app\\\\api\\\\chunks\\\\regenerate\\\\route.ts"], "symbol_patterns": ["POST"], "required": false }
  ],
  "threshold": 1,
  "notes": "Service-backed generation is primary; associated routes strengthen confidence."
}
```

```json
{
  "fr_id": "FR-EDGE-CASE-HANDLING-007",
  "artifacts": [
    { "type": "service", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\lib\\\\edge-case-service.ts"], "symbol_patterns": ["handleEdgeCases", "detectOutliers"], "required": true },
    { "type": "route", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\app\\\\api\\\\export\\\\edge-cases\\\\route.ts"], "symbol_patterns": ["POST", "GET"], "required": false },
    { "type": "pipeline", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\lib\\\\quality\\\\**\\\\*"] , "symbol_patterns": ["edgeCase", "outlier", "exception"], "required": false }
  ],
  "threshold": 1,
  "notes": "Service presence is core; route and quality pipeline evidence strengthen confidence."
}
```

```json
{
  "fr_id": "FR-QUALITY-REVIEW-008",
  "artifacts": [
    { "type": "pipeline", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\lib\\\\quality\\\\**\\\\*"] , "symbol_patterns": ["score", "validate", "review"], "required": true },
    { "type": "service", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\lib\\\\chunk-service.ts", "C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\lib\\\\export-service.ts"], "symbol_patterns": ["applyQualityChecks", "qualityGate"], "required": false }
  ],
  "threshold": 1,
  "notes": "Quality pipeline evidence is sufficient; integration in services improves confidence."
}
```

```json
{
  "fr_id": "FR-IMPORT-EXPORT-UI-TRIGGER-009",
  "artifacts": [
    { "type": "component", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\components\\\\import-export\\\\**\\\\*.tsx"], "symbol_patterns": ["ExportButton", "ImportButton"], "required": true },
    { "type": "route", "path_patterns": ["C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\app\\\\api\\\\export\\\\conversations\\\\route.ts", "C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\app\\\\api\\\\export\\\\download\\\\route.ts", "C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\app\\\\api\\\\export\\\\history\\\\route.ts", "C\\\\Users\\\\james\\\\Master\\\\BrightHub\\\\brun\\\\train-data\\\\src\\\\app\\\\api\\\\export\\\\templates\\\\route.ts"], "symbol_patterns": ["GET", "POST"], "required": false }
  ],
  "threshold": 1,
  "notes": "UI triggers should connect to export flows; routes provide operational evidence."
}
```

---

## Implementation Plan (v1)

- Requirements Extractor
  - Parse `.md` files in `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\` and extract FRs using keyword patterns and headings.
  - Normalize into `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\fr-catalog.json` with tags inferred from content and domains.

- Artifact Indexer
  - Walk `C:\Users\james\Master\BrightHub\brun\train-data\src\`, `C:\Users\james\Master\BrightHub\brun\train-data\src\supabase\`, and `C:\Users\james\Master\BrightHub\brun\train-data\supabase\` to collect files by type.
  - Extract exported symbols, route definitions, component names, server actions, and migration DDL.

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
- If Train Data read/write flows do not scope by `userId` or equivalent, flag a gap under `FR-TRAIN-USER-CONTEXT-001`.

---

## Limitations

- Heuristic matching may miss features implemented under unconventional names.
- Specs may use different terminology than code; synonym dictionary will mitigate but not eliminate gaps.
- Some features are cross-cutting (e.g., quality and edge-case handling) and require usage tracing, not just presence.

---

## Heuristic Aids

- Synonym Maps
  - User Context: `userId`, `ownerId`, `session`, `tenant`, `account`.
  - Chunks: `segment`, `extract`, `split`, `ingest`.
  - Export: `download`, `transform`, `CSV`, `JSON`.
  - Templates: `render`, `template-engine`, `fill`.
  - Workflow: `step`, `phase`, `progress`, `store`.
  - Edge Cases: `outlier`, `exception`, `anomaly`, `rare`, `fallback`.
  - Quality: `score`, `validate`, `review`, `gate`, `check`.

- Domain-to-Directory Defaults
  - `chunks` → `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\chunk-service.ts`, `C:\Users\james\Master\BrightHub\brun\train-data\src\components\chunks\`, `C:\Users\james\Master\BrightHub\brun\train-data\src\app\chunks\`.
  - `export` → `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\export-service.ts`, `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\export-transformers\`, `C:\Users\james\Master\BrightHub\brun\train-data\src\components\import-export\`.
  - `templates` → `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\template-service.ts`, `C:\Users\james\Master\BrightHub\brun\train-data\src\components\templates\`, `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\template-engine\`.
  - `workflow` → `C:\Users\james\Master\BrightHub\brun\train-data\src\stores\workflow-store.ts`, `C:\Users\james\Master\BrightHub\brun\train-data\src\app\(workflow)\`, `C:\Users\james\Master\BrightHub\brun\train-data\src\components\workflow\`.
  - `edge-cases` → `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\edge-case-service.ts`, `C:\Users\james\Master\BrightHub\brun\train-data\src\app\api\export\edge-cases\`.
  - `quality` → `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\quality\**\*`.
  - `data/supabase` → `C:\Users\james\Master\BrightHub\brun\train-data\supabase\migrations\`, `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\supabase*.ts`, `C:\Users\james\Master\BrightHub\brun\train-data\src\supabase\functions\`.

---

## Output Example (Per FR)

- FR CHUNKS UPLOAD 002
  - Status: Implemented
  - Confidence: 0.82
  - Expected Artifacts:
    - Component: `C:\Users\james\Master\BrightHub\brun\train-data\src\components\upload\**\*.tsx`
    - Service: `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\chunk-service.ts`
  - Found Evidence:
    - `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\chunk-service.ts` (`extractChunks`)
    - `C:\Users\james\Master\BrightHub\brun\train-data\src\app\api\chunks\route.ts` (POST handler)
  - Missing:
    - Migration `C:\Users\james\Master\BrightHub\brun\train-data\supabase\migrations\**\*.sql` for `chunks` table (optional)
  - Manual Review:
    - Confirm UI wires to service and route; check per-user scoping evidence.

- FR IMPORT EXPORT UI 009
  - Status: Partial
  - Confidence: 0.65
  - Expected Artifacts:
    - Component: `C:\Users\james\Master\BrightHub\brun\train-data\src\components\import-export\**\*.tsx`
    - Routes: `C:\Users\james\Master\BrightHub\brun\train-data\src\app\api\export\**\route.ts`
  - Found Evidence:
    - `C:\Users\james\Master\BrightHub\brun\train-data\src\app\api\export\download\route.ts` (GET)
    - `C:\Users\james\Master\BrightHub\brun\train-data\src\app\api\export\conversations\route.ts` (POST)
  - Missing:
    - Clear UI trigger component names (e.g., `ExportButton`, `ImportButton`) in `import-export\` (optional)
  - Manual Review:
    - Verify that UI triggers exist and connect to export flows; assess user scoping.

---

## Appendix: Observed Codebase Landmarks

- From `C:\Users\james\Master\BrightHub\brun\train-data\src\`
  - `app\` route groups: `(auth)`, `(dashboard)`, `(workflow)`, `api`, `actions`, `chunks`, `test-chunks`.
  - `components\`: `auth`, `chunks`, `upload`, `import-export`, `workflow`, `templates`, `ui`, `client`, `server`.
  - `lib\` services and pipelines: `chunk-service.ts`, `export-service.ts`, `template-service.ts`, `dimension-service.ts`, `edge-case-service.ts`, `quality\`, `generation\`, `file-processing\`, `rate-limiter.ts`, `retry-manager.ts`.
  - `stores\`: `workflow-store.ts`. `hooks\`: `use-debounce.ts`.
  - `supabase\`: `functions\`.

- From `C:\Users\james\Master\BrightHub\brun\train-data\supabase\`
  - `migrations\`.

This structure informs the default mapping and matching rules for FRChecks.