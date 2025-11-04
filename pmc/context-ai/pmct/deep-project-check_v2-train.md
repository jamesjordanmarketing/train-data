# Deep Project Check v2 — Gap Discovery (Train)

## Purpose
- Detect missing functionality: identify required features in the product specs that are not implemented in the codebase (`src`).
- Focus on existence of functionality modules, endpoints, services, flows, and UI—NOT bug detection or behavioral correctness.

## Scope
- Inputs: `pmc\product\01-train-overview.md`, `pmc\product\02.5-train-user-journey.md`, `pmc\product\03-bmo-functional-requirements.md`, `pmc\product\03-train-FR-enhancement-analysis-summary_v1.md`.
- Codebase target: `src\` including `app\`, `components\`, `lib\`, `hooks\`, `stores\`, `utils\`, `supabase\functions\`, `supabase\migrations\`.
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
   - Build a searchable index of `src\` artifacts:
     - Next.js routes: `src\app\api\**\route.ts`, `src\app\**\page.tsx`, `src\app\actions\**`.
     - UI: `src\components\**`, `src\app\**\page.tsx`.
     - Services: `src\lib\**` (e.g., `auth-service.ts`, `chunk-service.ts`, `export-service.ts`, `template-service.ts`, `dimension-service.ts`).
     - State: `src\stores\**` (e.g., `workflow-store.ts`), `src\hooks\**`.
     - Data: `supabase\functions\**`, `supabase\migrations\**`, `src\lib\database\**`, `src\lib\supabase*.ts`.
     - Utilities: `src\lib\utils\**`, `src\utils\**`, `src\lib\retry-manager.ts`, `src\lib\rate-limiter.ts`.
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
   - Generate `pmc\context-ai\pmct\gap-report_v2-train.md`:
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
- `review_prompts`: questions for human verification.

---

## Matching Heuristics Tailored to `src`

- Next.js Routes
  - API endpoints: look for `src\app\api\{feature}\route.ts`.
  - UI pages: `src\app\{segment}\page.tsx` for feature surfaces.
  - Server actions: `src\app\actions\**\*.ts`; exported async functions.

- Services (backend logic)
  - `src\lib\*\*-service.ts`: exported business functions.
  - Known services: `auth-service.ts`, `chunk-service.ts`, `template-service.ts`, `export-service.ts`, `dimension-service.ts`, `scenario-service.ts`.

- State & Hooks
  - `src\stores\**\*.ts`: state slices (e.g., `workflow-store.ts`).
  - `src\hooks\**\*.ts`: custom hooks that back UI features.

- Supabase & Data
  - `supabase\migrations\**`: presence of tables/columns required by FR.
  - `src\lib\supabase*.ts`, `src\lib\database\**`: client/server wrappers.
  - `supabase\functions\**`: edge functions for FRs needing serverless.

- UI Components
  - `src\components\**`: feature-specific components (`auth`, `chunks`, `upload`, `workflow`, `templates`, `ui`).
  - Name patterns: component names align with FR titles or tags.

- Utilities & Infra
  - Cross-cutting (`rate-limiter.ts`, `retry-manager.ts`, `middleware\**`).
  - If a FR requires throttling/retry, ensure these exist and are used.

- Confidence Rules
  - Strong signal: exact route match + service function + component.
  - Medium: service + component but missing route (or vice versa).
  - Weak: only util or generic code with no feature-specific signals.

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
    { "type": "component", "path_patterns": ["src\\components\\auth\\**\\*.tsx", "src\\app\\(auth)\\**\\page.tsx"], "symbol_patterns": ["Login", "SignIn"], "required": true },
    { "type": "service", "path_patterns": ["src\\lib\\auth-service.ts"], "symbol_patterns": ["export function signIn", "export async function getSession"], "required": true },
    { "type": "route", "path_patterns": ["src\\app\\api\\auth\\route.ts"], "symbol_patterns": [], "required": false }
  ],
  "threshold": 2,
  "notes": "Either API or server-side auth acceptable depending on architecture."
}
```

```json
{
  "fr_id": "FR-CHUNKS-UPLOAD-002",
  "artifacts": [
    { "type": "component", "path_patterns": ["src\\components\\upload\\**\\*.tsx"], "symbol_patterns": ["Upload", "Dropzone"], "required": true },
    { "type": "service", "path_patterns": ["src\\lib\\chunk-service.ts", "src\\lib\\file-processing\\**\\*.ts"], "symbol_patterns": ["extractChunks", "saveChunks"], "required": true },
    { "type": "route", "path_patterns": ["src\\app\\api\\chunks\\route.ts"], "symbol_patterns": ["POST"], "required": false },
    { "type": "migration", "path_patterns": ["supabase\\migrations\\**\\*.sql"], "symbol_patterns": ["CREATE TABLE chunks"], "required": false }
  ],
  "threshold": 2,
  "notes": "Presence of service + UI suggests implementation even without a dedicated API route."
}
```

```json
{
  "fr_id": "FR-EXPORT-CSV-003",
  "artifacts": [
    { "type": "service", "path_patterns": ["src\\lib\\export-service.ts", "src\\lib\\export-transformers\\**\\*.ts"], "symbol_patterns": ["toCSV", "exportChunks"], "required": true },
    { "type": "route", "path_patterns": ["src\\app\\api\\export\\route.ts"], "symbol_patterns": ["GET", "POST"], "required": false },
    { "type": "component", "path_patterns": ["src\\components\\chunks\\**\\*.tsx", "src\\components\\templates\\**\\*.tsx"], "symbol_patterns": ["ExportButton"], "required": false }
  ],
  "threshold": 1,
  "notes": "Service implementation is the core requirement."
}
```

---

## Implementation Plan (v1)

- Requirements Extractor
  - Parse `.md` files in `pmc\product\` and extract FRs using keyword patterns and headings.
  - Normalize into `fr-catalog.json` with tags inferred from content and known domains.

- Artifact Indexer
  - Walk `src\` and `supabase\` to collect files by type.
  - Extract exported symbols, route definitions, component names, server actions.

- Matcher
  - For each FR, evaluate `FRCheck` against the artifact index.
  - Compute `status`, `confidence`, `evidence`, `gaps`.

- Reporter
  - Generate `pmc\context-ai\pmct\gap-report_v2-train.md`.
  - Include summary, per-FR details, and manual review prompts.

- Configuration
  - `pmc\context-ai\pmct\fr-checks.json`: holds FRChecks with path/symbol patterns.
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
  - `auth` → `src\\lib\\auth-service.ts`, `src\\components\\auth\\`, `src\\app\\(auth)\\`.
  - `chunks` → `src\\lib\\chunk-service.ts`, `src\\components\\chunks\\`, `src\\app\\chunks\\`.
  - `export` → `src\\lib\\export-service.ts`, `src\\lib\\export-transformers\\`.
  - `templates` → `src\\lib\\template-service.ts`, `src\\components\\templates\\`, `src\\lib\\template-engine\\`.
  - `workflow` → `src\\stores\\workflow-store.ts`, `src\\app\\(workflow)\\`, `src\\components\\workflow\\`.
  - `data/supabase` → `supabase\\migrations\\`, `src\\lib\\supabase*.ts`, `supabase\\functions\\`.

---

## Output Example (Per FR)

- FR AUTH LOGIN 001
  - Status: Implemented
  - Confidence: 0.86
  - Expected Artifacts:
    - Component: `src\components\auth\Login.tsx` or `src\app\(auth)\page.tsx`
    - Service: `src\lib\auth-service.ts` (`signIn`, `getSession`)
  - Found Evidence:
    - `src\lib\auth-service.ts` (exported `signIn`)
    - `src\app\(auth)\page.tsx` (Login UI)
  - Missing:
    - API `src\app\api\auth\route.ts` (optional)
  - Manual Review:
    - Confirm authentication handled via server actions/sessions without API route.

---

## Next Steps

- Implement the extractor and indexer modules.
- Draft initial `fr-checks.json` using tags inferred from product docs.
- Run the matcher and produce an initial `gap-report_v2-train.md`.
- Iterate on synonyms and path patterns to improve confidence.

---

## Appendix: Observed Codebase Landmarks (from `src\`)

- `src\app\`
  - Route groups: `(auth)`, `(dashboard)`, `(workflow)`, `api`, `actions`, `chunks`, `test-chunks`.
  - Shell: `layout.tsx`, `page.tsx`, `globals.css`.

- `src\components\`
  - Domains: `auth`, `chunks`, `upload`, `workflow`, `templates`, `ui`, `client`, `server`.

- `src\lib\`
  - Services: `auth-service.ts`, `chunk-service.ts`, `template-service.ts`, `export-service.ts`, `dimension-service.ts`, `scenario-service.ts`.
  - Infra: `supabase.ts`, `supabase-server.ts`, `database.ts`, `rate-limiter.ts`, `retry-manager.ts`.
  - Pipelines: `file-processing`, `generation`, `quality`, `monitoring`.

- `src\stores\`
  - `workflow-store.ts`.

- `src\hooks\`
  - `use-debounce.ts`.

- `supabase\`
  - `migrations\` and `functions\`.

This structure informs the default mapping and matching rules for FRChecks.