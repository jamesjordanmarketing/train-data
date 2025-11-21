# Supabase Agent Ops Library — Full Product Specification (CLI + RPC + SDK)

> **Purpose:** A reusable, agent-friendly system to manipulate Supabase objects safely and predictably: import/export, CRUD at scale, migrations, and policy management. Designed for **deterministic behavior**, **robust data handling**, and **low-friction agent tooling**.

---

## 1. Core Goals & Non-Goals

### 1.1 Goals

* Deterministic, idempotent operations callable by agents or humans.
* Excellent **failure visibility**: pinpoint the exact record(s) and reason on any break.
* Handles **data character interruptions** robustly (apostrophes, quotes, backslashes, Unicode, emojis, multi-line strings, control chars).
* Short, memorable **CLI surface** with parameter-driven flows.
* Clear **pathing discipline** using **full paths** in docs and logs for agent reliability.
* Works with: Supabase client, Postgres RPC for atomic operations, and emergency SQL Editor runbooks.

### 1.2 Non-Goals

* Not a general-purpose ETL. Focused on Supabase project CRUD, bulk import/export, schema/policies/migrations, and integrity guards.
* Not a UI. Text CLI + JSON reports only.

---

## 2. High-Level Architecture

### 2.1 Layers

1. **CLI** (`supops`)

   * Parameterized commands, zero prompt-dependence.
   * Structured logging and reports on disk.
2. **SDK (TypeScript)** (`@supops/core`)

   * Typed wrappers for Supabase client.
   * Validation (Zod), normalization, batching, retries.
   * Error contracts and metrics hooks.
3. **Server-side RPC** (SQL/PLpgSQL)

   * Atomic multi-table ops.
   * Server-side validation/casting.
4. **Migrations & Policies**

   * Versioned SQL. Verification commands.
5. **Observability**

   * Structured logs, per-batch metrics, machine-readable reports.

### 2.2 Data Flow (Import Example)

`source file(s)` → **Reader** → **Normalizer** → **Validator** → **Batcher** → **Inserter (RPC or client)** → **Result Aggregator** → `reports/` (success + failure) → **exit code**

---

## 3. Supported Operations

* **Imports**: JSON/NDJSON/CSV → tables (e.g., `conversations`, `users`, `events`).
* **Upsert/Insert/Patch/Delete** with idempotency controls.
* **Exports**: table → JSON/NDJSON/CSV (schema-aware).
* **Migrations**: apply/verify; RLS/policy checkers.
* **Policy & Index management**: verify presence, generate diffs.
* **Health checks**: connectivity, role permissions, RLS status, function presence.

---

## 4. CLI Specification

### 4.1 Command Structure

```
supops <command> [subcommand] --flags...

Commands:
  import            Import rows into a table (file → DB)
  export            Export rows from a table (DB → file)
  migrate           Apply or verify migrations
  policy            Verify or scaffold policies
  health            Connectivity & environment checks
  inspect           Dry-run validation of a source dataset
  rpc               Call sanctioned RPCs with a payload file
```

### 4.2 Global Flags

* `--project / --url` Supabase URL (full URL)
* `--key` API key (prefer env `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_ANON_KEY`)
* `--role` `service|anon` (default `service` for ops)
* `--config` full path to config file
* `--outDir` full path for logs/reports
* `--json` machine-readable console output
* `--quiet` minimal console noise

### 4.3 `import` Command

```
supops import \
  --table conversations \
  --source /full/path/datasets/conversations.ndjson \
  --format ndjson \
  --mapping /full/path/specs/conversations.mapping.json \
  --mode upsert \
  --onConflict id \
  --batch 200 \
  --atomic rpc \
  --dryRun false
```

**Flags**

* `--table` target table (required)
* `--source` full path to file/dir (required)
* `--format` `json|ndjson|csv` (required)
* `--mapping` schema mapping file (see §6)
* `--mode` `insert|upsert|merge`
* `--onConflict` column or `(col1,col2)`
* `--batch` rows per request (default 200)
* `--atomic` `none|rpc` (rpc → transaction in server)
* `--dryRun` validate only, no writes

**Outputs**

* Exit code: `0` success, `2` partial, `3` all failed, `10+` config/env errors.
* Reports in `--outDir`:

  * `YYYYMMDD-HHmmss/import.summary.json`
  * `YYYYMMDD-HHmmss/import.errors.ndjson`
  * `YYYYMMDD-HHmmss/import.success.ndjson`
  * `YYYYMMDD-HHmmss/logs/import.run.log`

### 4.4 `export` Command

```
supops export \
  --table conversations \
  --where "/full/path/specs/conversations.where.sql" \
  --format ndjson \
  --out /full/path/exports/conversations_2025-11-09.ndjson
```

### 4.5 `inspect` (Dry-run validation only)

```
supops inspect \
  --table conversations \
  --source /full/path/datasets/conversations.ndjson \
  --format ndjson \
  --mapping /full/path/specs/conversations.mapping.json
```

### 4.6 `rpc` Command

```
supops rpc \
  --name rpc_import_conversations \
  --payload /full/path/datasets/conversations.ndjson \
  --format ndjson
```

---

## 5. Error Handling & Reporting

### 5.1 Error Model (SDK)

```ts
type SupOpsError = {
  code: string;             // e.g., ERR_UNIQUE_VIOLATION, ERR_FK_MISSING_TARGET, ERR_CAST_JSON
  message: string;
  hint?: string;
  detail?: string;
  recordIndex?: number;     // 0-based index in source
  recordIdPath?: string;    // JSONPath to ID in record
  batchId?: string;         // unique batch UUID
  cause?: unknown;          // raw driver error
};
```

### 5.2 Failure Report (NDJSON)

Each line corresponds to a failing record:

```json
{"ts":"2025-11-09T10:14:23.120Z","table":"conversations","batchId":"b-001","index":124,"id":98765,"code":"ERR_UNIQUE_VIOLATION","message":"duplicate key value violates unique constraint \"conversations_pkey\"","detail":"Key (id)=(98765) already exists.","sourceExcerpt":"{...original record...}"}
```

### 5.3 Summary Report

```json
{
  "runId":"20251109T101423Z",
  "table":"conversations",
  "source":"/full/path/datasets/conversations.ndjson",
  "rowsTotal":2000,
  "rowsSucceeded":1978,
  "rowsFailed":22,
  "mode":"upsert",
  "atomic":"rpc",
  "durationMs":42150,
  "batches":21,
  "topErrors":[
    {"code":"ERR_CAST_JSON","count":8},
    {"code":"ERR_UNIQUE_VIOLATION","count":7},
    {"code":"ERR_FK_MISSING_TARGET","count":7}
  ]
}
```

---

## 6. Schema Mapping & Validation

### 6.1 Mapping File (JSON)

```json
{
  "$schema":"https://supops.dev/schema/mapping-1.json",
  "table":"conversations",
  "idPath":"$.id",
  "columns":{
    "id":{"from":"$.id","type":"bigint"},
    "message_json":{"from":"$.message","type":"jsonb"},
    "meta_json":{"from":"$.meta","type":"jsonb","default":"{}"},
    "created_at":{"from":"$.created_at","type":"timestamptz","defaultNow":true}
  },
  "defaults":{
    "meta_json":{}
  },
  "constraints":{
    "required":["id","message_json"],
    "enum":{"meta_json.status":["draft","live","archived"]}
  },
  "normalizers":[
    {"field":"message_json.text","fn":"trim"},
    {"field":"message_json.text","fn":"collapseWhitespace"}
  ]
}
```

### 6.2 Validation (Zod)

* Coerce numeric strings to numbers when safe.
* JSON string → parsed JSON object.
* Unicode normalization to NFC (§7).
* Reject invalid UTF-8 or control chars (unless allowed by config).
* Output **per-record** validation errors into failure report.

---

## 7. Data Character Interruption Handling

The library must **never rely on manual escaping** by the agent.

### 7.1 Input Decoding

* Assume UTF-8; detect BOM, strip.
* Detect invalid UTF-8; replace with `\uFFFD` or fail per `--strictChars`.
* Normalize to **NFC** (configurable to NFKC).
* Preserve newlines, tabs, and emojis by default.

### 7.2 Special Characters

* Apostrophes/quotes/backslashes: handled by **client JSON serialization** or **RPC casting**; never embed raw into SQL strings.
* Newlines in CSV fields: require RFC 4180 quoting; reject or auto-fix with `--csvRelaxed`.
* Control characters: default deny list `\u0000-\u001F` except `\t`, `\n`, `\r`; configurable `--allowControls`.
* Unescaped delimiters (CSV): auto-quote when exporting; on import, strict parser with fallback relaxed mode reporting exact line/column.

### 7.3 Sanitizers (Configurable)

* `trim`, `collapseWhitespace`, `maxLen(n)`, `stripControls`, `normalizeNFC`, `replace(pattern,repl)` with RE2-safe patterns.

---

## 8. Batching, Retries, Idempotency

* Default **batch size 200** rows or ~1–2 MB per payload (whichever first).
* Retries: exponential backoff for transient errors (`429`, `5xx`).
* **Idempotency**:

  * `upsert` with `--onConflict` to allow re-runs.
  * Optional **idempotency keys** per batch to dedupe server-side RPC execution.
* **Atomic Mode**:

  * `--atomic rpc` → send an array to `rpc_import_<table>`; entire batch succeeds or fails.
  * `--atomic none` → non-transactional client upserts; partial successes reported per batch.

---

## 9. RPC Contracts (Server-Side)

### 9.1 Naming

* `rpc_import_<table>` for batch import.
* `rpc_merge_<domain>` for cross-table atomic merges.

### 9.2 Signature

```sql
-- payload: jsonb array
-- options: jsonb object (optional: on_conflict, strict, dry_run)
returns table(idx int, id bigint, status text, err text)
```

### 9.3 Behavior

* Validates `payload` is array; iterates per element.
* Casts fields safely; raises controlled exceptions with `status='error'`.
* Honors `options.on_conflict`.
* If `options.dry_run=true`, validate only.

---

## 10. Security & Roles

* **RLS ON** by default for all tables.
* CLI defaults to **service-role** for imports; never ship this key to the client/browser.
* Read-only operations with **anon** when possible.
* Dedicated admin schema for RPCs; least-privilege grants.
* Option `--assumeRLS`: validate RLS policies exist and report if bypass would occur.

---

## 11. Configuration

### 11.1 Config File (JSON)

```json
{
  "$schema":"https://supops.dev/schema/config-1.json",
  "projectUrl":"https://abc.supabase.co",
  "role":"service",
  "outDir":"/full/path/supops/runs",
  "defaults":{
    "batch":200,
    "atomic":"rpc",
    "strictChars":true,
    "csvRelaxed":false
  },
  "tables":{
    "conversations":{
      "mapping":"/full/path/specs/conversations.mapping.json",
      "rpc":"rpc_import_conversations",
      "onConflict":"id"
    }
  }
}
```

### 11.2 Resolution Rules

* CLI flags override config.
* All documentation and sample configs use **full absolute paths**.

---

## 12. Logging & Observability

* **Console:** human-readable unless `--json`.
* **File logs:** `/full/path/.../logs/*.log`
* **Structured events:** NDJSON in `reports/`.
* Hook for metrics emitters (StatsD/OTLP) with toggles.
* Correlation IDs: `runId`, `batchId`, `recordIndex`.

---

## 13. Exit Codes

* `0` success
* `1` generic failure
* `2` partial success (some records failed)
* `3` all records failed
* `10` invalid config
* `11` auth/permission error
* `12` connectivity timeout
* `13` mapping/validation error
* `14` RPC missing/incompatible

---

## 14. Developer Experience (DX)

* Single package `supops` binary; `npx supops ...` supported.
* Type definitions generated from Supabase:
  `npx supabase gen types typescript --project-id <id> > src/db.types.ts`
* Local `.env` for URL/keys; production via env vars or flags.
* Rich `--help` and `supops help import`.

---

## 15. Agent Tool Interface

Expose minimal, deterministic tools (JSON in/out), mirroring CLI:

* `tool.import({ table, sourcePath, format, mode, onConflict, batch, atomic, dryRun }) -> { runId, summaryPath, errorsPath, successPath }`
* `tool.export({ table, wherePath, format, outPath }) -> { outPath, count }`
* `tool.rpc({ name, payloadPath, format }) -> { summaryPath, errorsPath }`
* All **paths must be absolute** in docs and responses.

---

## 16. Testing & CI

* **Fixtures**: curated datasets covering:

  * Apostrophes, quotes, backslashes
  * Emojis & astral plane chars
  * Multi-line strings
  * CSV with embedded commas/newlines/quotes
  * Invalid UTF-8 bytes
  * Large payloads (10k+ rows)
* Unit tests for normalizers/validators/mappers.
* Integration tests against ephemeral Supabase instance:

  * RLS on/off cases
  * RPC happy/edge paths
* CI job: `supops health`, `supops migrate --verify`, sample `import --dryRun`.

---

## 17. Documentation Conventions

* Always show **full paths** in examples.
* Include “SQL Editor Playbook” appendix:

  * Dollar-quoting patterns for JSONB
  * `BEGIN/ROLLBACK/COMMIT`
  * Common validation queries
* Provide **Runbook** for common failures:

  * Unique violations → suggest `--mode upsert` or pre-deletes
  * FK missing → ordering guidance or staged imports
  * JSON cast errors → mapping fixes and example record diffs

---

## 18. Example End-to-End

### 18.1 Inspect

```
supops inspect \
  --table conversations \
  --source /data/conversations.ndjson \
  --format ndjson \
  --mapping /specs/conversations.mapping.json \
  --outDir /runs/2025-11-09
```

### 18.2 Import (Atomic via RPC)

```
supops import \
  --table conversations \
  --source /data/conversations.ndjson \
  --format ndjson \
  --mapping /specs/conversations.mapping.json \
  --mode upsert \
  --onConflict id \
  --batch 200 \
  --atomic rpc \
  --outDir /runs/2025-11-09
```

**Artifacts produced:**

* `/runs/2025-11-09/20251109T101423/import.summary.json`
* `/runs/2025-11-09/20251109T101423/import.errors.ndjson`
* `/runs/2025-11-09/20251109T101423/import.success.ndjson`
* `/runs/2025-11-09/20251109T101423/logs/import.run.log`

---

## 19. Performance & Limits

* Target throughput: ≥ 5k rows/min with `batch=200` on typical networks.
* Auto-adjust batch size on 413/timeout, with backoff.
* Memory caps: stream NDJSON; do not load whole file for large sources.

---

## 20. Roadmap (Post-MVP)

* **Diff mode**: compute row-level diffs before merge.
* **Snapshotting**: write pre/post counts & checksums.
* **Rollbacks**: reversible operations via change journals (opt-in).
* **Policy scaffolder**: generate RLS templates from mapping.

---

## 21. Acceptance Criteria

* Can import a 2,000-line NDJSON with emojis, apostrophes, and multi-line fields, producing:

  * ≥ 95% success with clear per-record failures if issues exist.
  * Accurate `summary.json` and `errors.ndjson`.
* Re-run **idempotent** imports without duplications using `--mode upsert --onConflict id`.
* RPC import provides **atomicity per batch** and clear error rows.
* All docs and CLI examples use **full absolute paths**.
* Agent can execute at least:

  * `inspect` → `import` (rpc) → `export` roundtrip, with reports discoverable via returned absolute paths.

---

### Appendix A — Character Handling Matrix

| Case          | Example           | Strategy                                                     |
| ------------- | ----------------- | ------------------------------------------------------------ |
| Apostrophe    | `don't`           | Client JSON serialization or RPC cast; no manual SQL strings |
| Double quote  | `"hello"` in JSON | Parse & serialize; CSV quoting on export                     |
| Backslash     | `c:\path\file`    | Treat as normal char in JSON; escape per JSON; CSV quote     |
| Newlines      | multi-line `text` | JSON allowed; CSV require quoted fields                      |
| Emoji         | `🧠🚀`            | NFC normalize; preserve                                      |
| Control chars | `\u0007`          | Default reject; `--allowControls` to permit                  |
| Invalid UTF-8 | `0xC0 0xAF`       | Replace with `\uFFFD` or fail `--strictChars`                |

---

This spec gives you a **fully formed** product: a stable CLI, a typed core SDK, atomic RPCs, rock-solid error reporting, aggressive character handling, and simple agent hooks—all documented with **full paths** and deterministic artifacts.
