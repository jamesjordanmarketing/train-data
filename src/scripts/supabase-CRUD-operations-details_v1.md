# Supabase CRUD Operations — Detailed Techniques and Operational Guide (v1.0)

Audience: Handover for the next coding agent who will operate Supabase data access in this repo.

This guide documents the end-to-end approaches used across this codebase to read, write, update, and introspect data in Supabase. It covers client-side CRUD, raw SQL via RPC, direct PostgreSQL execution, schema verification, batching strategies, error handling, and operational safety.

--------------------------------------------------------------------------------

## 1) Prerequisites & Environment

- Required env file: `train-data/.env.local`
- Required keys:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (for browser clients; not used in scripts here)
  - `SUPABASE_SERVICE_ROLE_KEY` (server-side only; scripts use this)
  - `DATABASE_URL` (optional; enables direct PostgreSQL access via `pg`)
- Credential handling:
  - Service role key is powerful; use only in Node scripts or server-side code. Never expose to the browser.
  - Scripts typically read `.env.local` directly (manual parsing or `dotenv`).

Example `.env.local` (sanitized):
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...  # keep private; server-side only
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require
```

--------------------------------------------------------------------------------

## 2) Access Methods Overview

We use four complementary techniques, selected by task:

- Supabase JS Client (`@supabase/supabase-js`): Primary for CRUD on application tables, parameterized JSONB writes, batch upsert.
- RPC-Based Raw SQL (`supabase.rpc('exec_sql', ...)`): Executes multi-statement SQL from files or strings through an RPC function.
- Direct PostgreSQL via `pg` Client: Executes `.sql` files atomically in transactions; best for complex/large inserts and DDL.
- Supabase SQL Editor (Dashboard): Manual fallback when direct DB connections aren’t configured; run generated SQL interactively.

Associated scripts (paths):
- Client CRUD: `src/scripts/import-conversations-direct.js`, `src/scripts/insert-conversations-direct.js`, `src/scripts/execute-via-client.js`
- RPC SQL: `src/scripts/execute-sql-files.js`, `src/scripts/test-exec-sql.js`
- Direct SQL: `src/scripts/execute-sql-direct.js`, `src/scripts/test-db-connection.js`
- Introspection: `src/scripts/verify-e05-with-rpc.js`, `src/scripts/introspect-db-objects_v3.js`

--------------------------------------------------------------------------------

## 3) Supabase Client — CRUD Operations (Recommended Default)

Initialize client:
```js
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
```

Reads:
- Sample count (efficient):
```js
const { count, error } = await supabase.from('conversations').select('*', { count: 'exact', head: true });
```
- Sample data:
```js
const { data, error } = await supabase.from('templates').select('id, template_name').limit(10);
```

Inserts (JSONB-friendly, parameterized):
```js
const record = { id, template_name, parameters: { nested: 'json', list: [1,2] } };
const { data, error } = await supabase.from('templates').insert(record);
```

Batch Upsert (idempotent imports):
```js
const batch = [...];
const { data, error } = await supabase
  .from('conversations')
  .upsert(batch, { onConflict: 'id', ignoreDuplicates: false });
```

Updates:
```js
const { data, error } = await supabase
  .from('conversations')
  .update({ status: 'approved' })
  .eq('id', someId);
```

Deletes:
```js
const { data, error } = await supabase
  .from('templates')
  .delete()
  .eq('id', templateIdToRemove);
```

Notes:
- JSONB values are handled safely; no manual escaping for apostrophes or quotes.
- For large imports, use small batches (e.g., 10–50) with short delays (e.g., 100ms) to avoid rate limits.
- Client credentials use service role; enforce that scripts run only server-side.

References:
- `src/scripts/import-conversations-direct.js` — batch upsert, FK field sanitization.
- `src/scripts/insert-conversations-direct.js` — transforms training pairs, inserts as single rows.
- `src/scripts/execute-via-client.js` — inserts a complex template with nested JSONB; demonstrates parameterization.

--------------------------------------------------------------------------------

## 4) RPC-Based Raw SQL Execution (`exec_sql`)

Purpose: Execute multi-statement SQL directly from scripts via `supabase.rpc('exec_sql', { sql_script })`.

Usage:
```js
const { data, error } = await supabase.rpc('exec_sql', { sql_script: 'SELECT COUNT(*) FROM templates;' });
```

Executing files:
```js
const sql = fs.readFileSync('src/scripts/generated-sql/insert-templates.sql', 'utf8');
const { data, error } = await supabase.rpc('exec_sql', { sql_script: sql });
```

Operational guidance:
- Ensure the RPC exists in your DB (function signature typically accepts `text` and executes). If missing, use the SQL Editor to create it.
- Treat as privileged: restrict `GRANT EXECUTE` carefully (ideally only to `service_role` or a dedicated role).
- Suited for DDL + bulk DML originating from this repo. Prefer client-based CRUD for everyday application writes.

References:
- `src/scripts/execute-sql-files.js` — reads `.sql` and executes via RPC.
- `src/scripts/test-exec-sql.js` — sanity checks against `conversations` and `templates`.

Security notes:
- Arbitrary SQL is dangerous if exposed broadly. Keep RPC use strictly server-side. Consider limiting statements in the RPC implementation (e.g., block `DROP` unless explicitly allowed).

--------------------------------------------------------------------------------

## 5) Direct PostgreSQL via `pg` Client (Transactions)

Purpose: Most reliable for complex/large SQL files (e.g., heavy JSONB inserts), with transaction control and detailed error context.

Connection:
- Uses `DATABASE_URL`. Supports Supabase pooler (`:6543`) or direct (`:5432`) with `?sslmode=require`.
- Diagnostic script tries multiple permutations and prints masked connection info and hints.

Example execution (from `execute-sql-direct.js`):
```js
await client.query('BEGIN');
try {
  await client.query(sqlFileContents);
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
}
```

Diagnostics (`test-db-connection.js`):
- Tests: current `DATABASE_URL`, `+sslmode=require`, pooler→direct conversion, `sslmode=disable` (testing only).
- Provides hints for common errors (DNS, refused, timeout, auth, SSL/TLS, pooler tenant mismatch).

Manual fallback (when no direct access):
- Use Supabase SQL Editor to paste and run generated SQL.
- Or use `psql`/GUI clients (DBeaver/TablePlus) with `DATABASE_URL`.

References:
- `src/scripts/execute-sql-direct.js` — atomic file execution, error position context.
- `src/scripts/test-db-connection.js` — connectivity matrix with hints and summary.

--------------------------------------------------------------------------------

## 6) Schema Introspection & Verification (Advanced)

A) RPC-based introspection (preferred):
- Create a PostgreSQL function (e.g., `get_export_logs_schema()`) using `SECURITY DEFINER`.
- Query system catalogs: `information_schema`, `pg_indexes`, `pg_constraint`, `pg_policies`, `pg_tables`.
- Return structured JSON with columns, indexes, constraints, RLS status/policies, row count, table existence.
- Call via `supabase.rpc('get_export_logs_schema')` from Node.

Benefits:
- Works through Supabase client; no direct DB needed.
- Programmable and secure with controlled grants.
- Enables automated checks and SQL fix generation.

References:
- `src/scripts/verify-e05-with-rpc.js` — full template to adapt for other tables, including expected schema checks and fix SQL emission.

B) Client-only probing (no RPC):
- Attempt `.select('*')` to verify existence, get sample row, infer column types.
- Check insert capability with a test row, then delete it.
- Suitable for light-touch validation when RPC isn’t available.

References:
- `src/scripts/introspect-db-objects_v3.js` — probes tables, infers types, checks required columns.

Security considerations:
- For RPC functions: grant execute only to required roles, use `SECURITY DEFINER`, and audit the function body.
- Avoid exposing system catalog queries via normal client roles.

--------------------------------------------------------------------------------

## 7) Import & Data Shaping Patterns

General strategy:
- Insert parent records first (e.g., `templates`) to satisfy FK relationships.
- Insert child records (`conversations`) after parents exist.
- If FK tables are restricted (e.g., `auth.users`), drop or mock FK fields during import.

Batching:
- Use small batches (e.g., 10) with a slight delay (~100ms) to avoid rate limiting.
- Prefer `upsert(..., { onConflict: 'id' })` for idempotent re-runs.

Transformations (example from training pairs):
- Compute derived fields: `conversation_id`, `total_tokens`, timestamps, status (`approved`, `pending_review`, `generated`, `needs_revision`).
- Build complex JSONB fields: `parameters`, `quality_metrics`, `review_history`.

Apostrophes & special characters:
- Rely on parameterized inserts via Supabase client — avoids manual escaping.
- Post-insert check: fetch sample rows and confirm strings with apostrophes are stored correctly.

References:
- `src/scripts/insert-conversations-direct.js` — transforms and inserts conversations.
- `src/scripts/import-conversations-direct.js` — sanitizes FK fields and batch upserts JSON-heavy records.

--------------------------------------------------------------------------------

## 8) Post-Import Verification & Diagnostics

Counts:
```js
const { count } = await supabase.from('conversations').select('*', { count: 'exact', head: true });
```

Status distribution:
```js
const { data } = await supabase.from('conversations').select('status');
const histogram = data.reduce((acc, { status }) => (acc[status] = (acc[status]||0)+1, acc), {});
```

Sample integrity checks:
- Fetch sample rows and inspect `parameters` JSON for expected keys.
- Log record IDs and portions of JSON to validate structure.

Connection diagnostics:
- Use `test-db-connection.js` to determine a working `DATABASE_URL` & SSL mode.
- If all tests fail, verify credentials in Supabase Dashboard and network/firewall settings.

Error handling patterns:
- Capture `error.code`, `error.message`, and `error.details`/`error.hint` where available.
- On batch errors, collect failures and continue with subsequent batches; summarize successes/failures.

--------------------------------------------------------------------------------

## 9) Safety, RLS, and Permissions

- Service role key grants broad privileges; keep it private and server-side.
- For RPCs with elevated access:
  - Use `SECURITY DEFINER` cautiously.
  - Restrict `GRANT EXECUTE` to the minimal role(s).
  - Consider validating/limiting SQL inside the function.
- RLS awareness:
  - Client-side `.from(...).insert(...)` with service role bypasses RLS; intended for admin scripts.
  - For runtime app panels, use anon/authenticated keys and appropriate policies.

--------------------------------------------------------------------------------

## 10) Operational Playbooks

A) Quick-Start (Client CRUD)
- Initialize client with service role.
- Insert templates, then conversations.
- Verify counts, sample rows, and status distribution.

B) Intermediate (RPC `exec_sql`)
- Confirm `exec_sql` exists; call with single SELECT to sanity check.
- Execute `insert-templates.sql`, then `insert-conversations.sql`.
- Verify counts and sample data.

C) Advanced (Direct `pg` + RPC Introspection)
- Find working `DATABASE_URL` with `test-db-connection.js`.
- Execute `.sql` files in transactions for atomicity.
- Use RPC introspection to verify schema, indexes, constraints, and RLS policies.
- Generate and apply fix SQL as needed.

--------------------------------------------------------------------------------

## 11) Common Pitfalls & Remedies

- 404s or platform-level errors on app deploy are unrelated to DB access; verify Next.js routing separately.
- Foreign key constraints blocking imports: insert parents first or remove optional FK fields from import payloads.
- Pooler vs direct DB connection: `:6543` pooler may fail for certain usernames; try `:5432` direct with `sslmode=require`.
- Large JSONB inserts via raw SQL: prefer `pg` transactions or client parameterization to avoid escaping issues.

--------------------------------------------------------------------------------

## 12) File Map & Where to Look

- Client CRUD examples:
  - `src/scripts/execute-via-client.js`
  - `src/scripts/insert-conversations-direct.js`
  - `src/scripts/import-conversations-direct.js`
- RPC SQL execution:
  - `src/scripts/execute-sql-files.js`
  - `src/scripts/test-exec-sql.js`
- Direct SQL + diagnostics:
  - `src/scripts/execute-sql-direct.js`
  - `src/scripts/test-db-connection.js`
- Introspection & verification:
  - `src/scripts/verify-e05-with-rpc.js`
  - `src/scripts/introspect-db-objects_v3.js`

--------------------------------------------------------------------------------

## 13) Cheat Sheet (Snippets)

- Count rows efficiently:
```js
await supabase.from('X').select('*', { count: 'exact', head: true });
```
- Batch upsert:
```js
await supabase.from('X').upsert(batch, { onConflict: 'id' });
```
- Execute SQL via RPC:
```js
await supabase.rpc('exec_sql', { sql_script: sql });
```
- Transaction via `pg`:
```js
await client.query('BEGIN');
try { await client.query(sql); await client.query('COMMIT'); } catch (e) { await client.query('ROLLBACK'); }
```

--------------------------------------------------------------------------------

## 14) Next Agent — First Steps

- Confirm `.env.local` is present and has valid Supabase URL + service role key; add `DATABASE_URL` if planning direct SQL.
- Choose access method based on task:
  - CRUD/batches: Supabase client
  - Multi-file SQL: RPC or `pg` transactions
  - Schema verification: RPC introspection
- After operations, run verification: counts, sample rows, status distribution, and JSON integrity.
- Document any anomalies and add fix SQL or import sanitization accordingly.

--------------------------------------------------------------------------------

End of v1.0.