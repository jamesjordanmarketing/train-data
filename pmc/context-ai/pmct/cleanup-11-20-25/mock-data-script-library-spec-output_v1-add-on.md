supa-agent-ops/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts                  # Main exports
│   ├── core/
│   │   ├── client.ts             # Supabase + pg clients bootstrap
│   │   ├── types.ts              # Core types and interfaces
│   │   ├── config.ts             # Env/config management
│   ├── operations/
│   │   ├── import.ts             # Import operations (primary agent tool)
│   │   ├── export.ts             # Export operations
│   │   ├── upsert.ts             # Upsert operations
│   │   ├── delete.ts             # Delete operations
│   ├── validation/
│   │   ├── schema.ts             # Schema validation (zod/jsonschema)
│   │   ├── sanitize.ts           # Character sanitization
│   │   ├── normalize.ts          # Data normalization
│   ├── errors/
│   │   ├── codes.ts              # Error code definitions
│   │   ├── handlers.ts           # Error recovery strategies
│   │   ├── reports.ts            # Report generators and schema
│   ├── utils/
│   │   ├── paths.ts              # Cross-platform path handling
│   │   ├── logger.ts             # Structured logging
│   │   ├── batch.ts              # Batching utilities
│   ├── preflight/
│   │   ├── checks.ts             # Agent preflight checks (env, table, schema)
│   │   ├── decision-tree.ts      # Prescriptive agent next-actions
│   ├── fixtures/
│   │   ├── apostrophes.test.json     # don't, can't, it's
│   │   ├── quotes.test.json          # "quoted", 'single'
│   │   ├── multiline.test.json       # \n\r\t
│   │   ├── emoji.test.json           # emojis/UTF-8
│   │   ├── e02-problem.test.json     # real failing records
├── dist/                           # Compiled output
├── reports/                        # Generated reports



---

## 2. Configuration

### 2.1 Required Environment Variables

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role API key (required for server-side imports and bypassing RLS)
- Optional for pg fallback:
  - `DATABASE_URL`: PostgreSQL connection string for direct `pg` client (SSL enabled if required)

Notes:
- Operations assume server context with Service Role access. If using user keys, RLS policies must permit the import. The library enforces service role by default and warns otherwise.
- Windows paths are fully supported; internal path handling uses Node’s `path.win32`.

### 2.2 Configuration Loader

- Reads env vars and validates presence.
- Enforces safe defaults:
  - Transport: `supabase` (default) | `pg` (fallback when configured).
  - Character validation and sanitization: enabled by default.
  - Batch size: 200 (tunable).
  - Concurrency: 2 (tunable).
  - Retry policy: exponential backoff (base 300ms), max attempts 2.

On missing critical config, preflight fails with actionable next steps (never silent failure).

---

## 3. Critical Feature: Apostrophe & Special Character Safety

### 3.1 Three-Layer Safety

1) Supabase Client (preferred):
```typescript
const { data, error } = await supabase
  .from('conversations')
  .insert([{ parameters: params }]); // Parameterized and safe
```

2) Prepared Statements (pg fallback):
```typescript
const query = { text: 'INSERT INTO conversations (parameters) VALUES ($1)', values: [params] };
await client.query(query);
```

3) Dollar-Quoting (human-reviewed SQL only):
- Generates review-time SQL using `$$...$$` for JSONB/text. Not used for automated execution.

### 3.2 Character Handling Matrix

- Apostrophes, quotes, backslashes, newlines, tabs, emojis: auto-handled safely via client/parameterization.
- Control chars: removed by default except `\t`, `\n`, `\r`.
- Invalid UTF-8: stripped by default with warnings.
- Unicode normalization: `NFC` by default.

### 3.3 Validation and Sanitization

```typescript
export interface CharacterValidationConfig {
  allowApostrophes: boolean;          // Default: true
  allowQuotes: boolean;               // Default: true
  allowBackslashes: boolean;          // Default: true
  allowNewlines: boolean;             // Default: true
  allowTabs: boolean;                 // Default: true
  allowEmoji: boolean;                // Default: true
  allowControlChars: boolean;         // Default: false (except \t\n\r)
  normalizeUnicode: 'NFC' | 'NFKC' | 'none'; // Default: 'NFC'
  stripInvalidUtf8: boolean;          // Default: true
  maxFieldLength: number;             // Default: 1_000_000
}

export const DEFAULT_CONFIG: CharacterValidationConfig = {
  allowApostrophes: true,
  allowQuotes: true,
  allowBackslashes: true,
  allowNewlines: true,
  allowTabs: true,
  allowEmoji: true,
  allowControlChars: false,
  normalizeUnicode: 'NFC',
  stripInvalidUtf8: true,
  maxFieldLength: 1_000_000
};
```

---

## 4. Agent-First API (Guarded)

### 4.1 Primary Tool: `agentImportTool`

Contract:
```typescript
export interface AgentImportParams {
  source: string | Record<string, any>[]; // NDJSON/JSON file path or array of records
  table: string;                          // Target table
  mode?: 'insert' | 'upsert';             // Default: 'insert'
  onConflict?: string | string[];         // Default: auto-detect or 'id'
  outputDir?: string;                     // Default: './reports'
  batchSize?: number;                     // Default: 200
  concurrency?: number;                   // Default: 2
  dryRun?: boolean;                       // Default: false
  retry?: { maxAttempts?: number; backoffMs?: number }; // Default: {2, 300}
  validateCharacters?: boolean;           // Default: true
  sanitize?: boolean;                     // Default: true
  normalization?: 'NFC' | 'NFKC' | 'none';// Default: 'NFC'
  schema?: unknown;                       // Optional zod/jsonschema for records
  transport?: 'supabase' | 'pg' | 'auto'; // Default: 'supabase'
}

export interface AgentImportResult {
  success: boolean;
  summary: string;
  totals: { total: number; success: number; failed: number; skipped: number; durationMs: number };
  reportPaths: { summary: string; errors?: string; success?: string };
  nextActions: Array<{ action: string; description: string; example?: string; priority: 'HIGH'|'MEDIUM'|'LOW' }>;
}

export async function agentImportTool(params: AgentImportParams): Promise<AgentImportResult>;
```

Behavior:
- Accepts NDJSON/JSON file (auto-detected) or array input. NDJSON reads are streaming; JSON arrays buffered.
- `mode: 'upsert'` uses `onConflict`; if omitted, attempts to auto-detect primary key via pg introspection (if `DATABASE_URL` available). Otherwise defaults to `'id'` and surfaces a HIGH-priority next action if mismatch is detected at runtime.
- Sanitization and normalization apply before sending to DB.
- Batching and concurrency defaults tuned to avoid rate limits; configurable.
- Dry-run validates, normalizes, and generates reports without writing to DB.
- Transport:
  - `supabase`: uses Supabase client with Service Role key.
  - `pg`: uses prepared statements against `DATABASE_URL`.
  - `auto`: prefers `supabase`; falls back to `pg` if Supabase env missing.
- Returns prescriptive `nextActions` even when `success=true` if any warnings detected, ensuring agents always have follow-up guidance.

### 4.2 Helper: `analyzeImportErrors`

```typescript
export async function analyzeImportErrors(result: AgentImportResult): Promise<{
  recoverySteps: Array<{ priority: 'HIGH'|'MEDIUM'|'LOW'; errorCode: string; affectedCount: number; action: string; description: string; example?: string; automatable: boolean }>;
}>;
```

- Consumes error report and maps to remediation steps (e.g., enable upsert, import dependencies first, enable sanitization).
- Always provides at least one actionable step; agents never see a dead end.

### 4.3 Preflight: `agentPreflight`

```typescript
export async function agentPreflight(params: { table: string; mode?: 'insert'|'upsert'; onConflict?: string|string[] }): Promise<{
  ok: boolean;
  issues: string[];
  recommendations: Array<{ description: string; example?: string; priority: 'HIGH'|'MEDIUM'|'LOW' }>;
}>;
```

- Validates env vars, service role presence, table existence, and upsert readiness.
- If any check fails, returns targeted recommendations and examples, guiding agents to correct configuration before attempting imports.

---

## 5. Error Handling & Intelligent Routing

### 5.1 Error Taxonomy

- `ERR_VALIDATION_*`: schema or record validation failures.
- `ERR_CHAR_*`: character/encoding issues (E02 class).
- `ERR_DB_*`: database constraint violations.
- `ERR_CAST_*`: type casting failures.
- `ERR_AUTH_*`: authentication/permission/RLS issues.
- `ERR_FATAL`: unrecoverable errors.

### 5.2 Mapping (Patterns and PG Codes)

Common mappings:
- `ERR_DB_UNIQUE_VIOLATION` → PG `23505` or message contains `duplicate key value violates unique constraint`.
- `ERR_DB_FK_VIOLATION` → PG `23503` or message contains `violates foreign key constraint`.
- `ERR_DB_NOT_NULL_VIOLATION` → PG `23502` or message contains `null value in column`.
- `ERR_DB_CHECK_VIOLATION` → PG `23514` or message contains `violates check constraint`.
- `ERR_CAST_INVALID_INPUT` → PG `22P02` or message contains `invalid input syntax`.
- `ERR_CHAR_INVALID_UTF8` → message contains `invalid byte sequence for encoding "UTF8"`.
- `ERR_AUTH_RLS_DENIED` → Supabase message contains `row level security` or permission errors.

Implementation:
- Prefer PG codes when available (via `pg`). With Supabase client, extract `error.code` where present, else pattern-match `error.message`.
- All mapped errors include remediation guidance via `handlers.ts`.

### 5.3 Example Error Report

Reports schema (see 6. Reporting) includes error breakdown and `recoverySteps` with automatable flags. Agents consume `nextActions` and `recoverySteps` to always proceed.

---

## 6. Reporting

### 6.1 File Naming

- `reports/import-{table}-{runId}.summary.json`
- `reports/import-{table}-{runId}.errors.json`
- `reports/import-{table}-{runId}.success.json`

`runId`: UTC `YYYYMMDDThhmmssZ` (e.g., `20251109T143022Z`)

### 6.2 Summary Report Schema

```json
{
  "runId": "20251109T143022Z",
  "table": "conversations",
  "totals": { "total": 35, "success": 35, "failed": 0, "skipped": 0, "durationMs": 2450 },
  "warnings": ["Removed invalid UTF-8 characters"],
  "config": {
    "mode": "upsert",
    "onConflict": "id",
    "batchSize": 200,
    "concurrency": 2,
    "sanitize": true,
    "normalization": "NFC",
    "transport": "supabase"
  },
  "nextActions": [
    { "priority": "LOW", "action": "REVIEW_WARNINGS", "description": "Check sanitization impact", "example": "Open summary report and inspect 'warnings'" }
  ]
}
```

### 6.3 Errors Report Schema

```json
{
  "runId": "20251109T143022Z",
  "table": "conversations",
  "totalErrors": 22,
  "errorBreakdown": [
    { "code": "ERR_DB_UNIQUE_VIOLATION", "count": 15, "percentage": 68.2, "description": "Duplicate key violates unique constraint" },
    { "code": "ERR_CHAR_INVALID_UTF8", "count": 5, "percentage": 22.7, "description": "Invalid UTF-8 sequences" },
    { "code": "ERR_DB_FK_VIOLATION", "count": 2, "percentage": 9.1, "description": "Foreign key constraint violation" }
  ],
  "recoverySteps": [
    {
      "priority": "HIGH",
      "errorCode": "ERR_DB_UNIQUE_VIOLATION",
      "affectedCount": 15,
      "action": "RETRY_WITH_UPSERT",
      "description": "Re-run import with mode 'upsert' and proper onConflict",
      "example": "await agentImportTool({ ...params, mode: 'upsert', onConflict: 'id' });",
      "automatable": true
    }
  ]
}
```

### 6.4 Success Report Schema

```json
{
  "runId": "20251109T143022Z",
  "table": "conversations",
  "records": [
    { "id": "1" },
    { "id": "2" }
  ]
}
```

---

## 7. Incremental Adoption & Compatibility

- Operates alongside existing scripts; no breaking changes required.
- Suggested migration:
  1. Install and link library.
  2. Replace manual SQL with `agentImportTool` in critical paths (E02).
  3. Convert generated SQL into NDJSON once; re-use for guarded imports.

Installation:
```bash
npm install
npm run build
npm link
```

Link usage:
```bash
cd C:\Users\james\Master\BrightHub\BRun\train-data\src\scripts
npm link supa-agent-ops
```

---

## 8. Agent Guardrails and No-Dead-End Design

- Safe-by-default:
  - No string concatenation pathways exposed to agents.
  - Parameterized operations only; raw SQL generation is review-only.
- Preflight required:
  - `agentPreflight` runs automatically on first call; if failed, returns `ok=false` with explicit recommendations and examples.
- Deterministic outcomes:
  - Every call returns `nextActions` with at least one actionable step, even on success when warnings exist.
- Option validation and correction:
  - If `mode='upsert'` and `onConflict` missing, library attempts auto-detection; if unable, sets `'id'` and returns HIGH-priority corrective action.
  - Unknown options or invalid values result in a `ERR_VALIDATION_*` with a suggested corrected call.
- Dry-run:
  - Agents can run `dryRun: true` to get full reports and `nextActions` before writing.
- Self-healing retries:
  - Transient errors retried with exponential backoff; persistent failures surfaced with remediation.
- Error specificity:
  - Errors are categorized and routed to handlers that produce prescriptive steps; agents never receive vague failures.
- Windows path normalization:
  - All file paths normalized; NDJSON reader handles CRLF safely.

---

## 9. Testing Setup

- Env requirements:
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, optional `DATABASE_URL`.
- DB seeding:
  - Provide seed fixtures and a minimal schema for `conversations`, `templates`.
- Test coverage:
  - Apostrophe/quote/multiline/emoji safety
  - Batch processing
  - Error categorization and mapping
  - Dollar-quoting generation (review-only)
  - E02 regression (uses real problematic records)
- Running tests:
```bash
npm test
```

---

## 10. Performance Acceptance Criteria

- Throughput: ≥ 5,000 records/minute with `batchSize=200`, `concurrency=2`.
- Memory: ≤ 500MB for 10,000 records processed.
- Startup: ≤ 100ms library load time.
- Batch latency: ~200ms per batch (network-dependent).
- Measurement:
  - Built-in timing in summary report (`durationMs`).
  - CI job to assert thresholds for e02 fixtures.

---

## 11. RPC Scope (Deferred for v2)

- For simplicity and reduced surface area, RPC templates and caller are optional in v2.
- If included, provide at least one example SQL function and a caller using parameterized inputs.
- Default recommendation: agents should prefer `agentImportTool` over RPC.

---

## 12. Decision Tree (Agent Quick Guidance)

Need to import data to Supabase?
- YES → Is data JSON/NDJSON?
  - YES → Use `agentImportTool()` (safe characters, error reports, batching)
  - NO → Convert to NDJSON, then use `agentImportTool()`
- NO → Need SQL for human review?
  - YES → Use `generateDollarQuotedInsert()` (review-only)

---

## 13. Quick Reference Card

Install:
```bash
npm link supa-agent-ops
```

Import:
```typescript
const { agentImportTool, agentPreflight, analyzeImportErrors } = require('supa-agent-ops');
```

Use:
```typescript
const preflight = await agentPreflight({ table: 'conversations', mode: 'upsert' });
if (!preflight.ok) { /* follow preflight.recommendations and retry */ }

const result = await agentImportTool({
  source: 'C:\\Users\\james\\data\\conversations.ndjson',
  table: 'conversations',
  mode: 'upsert',
  onConflict: 'id'
});

console.log(result.summary);
if (!result.success) {
  const analysis = await analyzeImportErrors(result);
  analysis.recoverySteps.forEach(step => console.log(`${step.priority}: ${step.description}`));
}
```

---

Document Version: 2.0-Guarded
Target Audience: Claude Code, Cursor AI agents, Human developers
Library Path: `C:\Users\james\Master\BrightHub\BRun\train-data\supa-agent-ops\`