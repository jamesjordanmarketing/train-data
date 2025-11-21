# E02 Fixes A — Execution Plan (Supabase-Driven)

Date: 2025-11-09
Prepared by: Automation QA

Objective
- Complete PROMPT E02 by inserting mock data into the Supabase database using the existing scripts under `C:\Users\james\Master\BrightHub\brun\train-data\src\scripts\` (Windows paths are case-insensitive; equivalent to `...BRun\...`).
- Verify that inserts are correct, relationships are valid, and QA documentation is updated.
- Use only Supabase tools and scripts from `src\scripts`; iterate a test script to confirm read/write/edit access. Cease if hard block prevents access (no manual handoff steps).

Scope
- Tables to populate:
  - `templates` — insert 1 template (from `insert-templates-fixed.sql`).
  - `conversations` — insert 35 conversations (from `insert-conversations.sql`).
- Tables explicitly not populated:
  - All `kv_store*` tables (ignored by specification).
- How tables will be updated:
  - Direct SQL execution via `src\scripts\execute-sql-direct.js` using `.env.local` with `DATABASE_URL` or runtime connection obtained from `supabase-access-details_v1.md`.
  - If direct SQL connection is unavailable, iterate Supabase access test to confirm we can write using `@supabase/supabase-js` (service role). If write access is blocked and cannot be resolved, cease the task and report the hard block.
- Verification:
  - Run `src\scripts\verify-data-insertion.js` and helper queries via `cursor-db-helper.js` (`count`, `sql`) to confirm counts and distributions.
- Reporting:
  - Update `pmc\context-ai\pmct\mock-data-execution-prompt-E02-qa_v1.md` with actual results.

Approach & Tools
- Supabase scripts directory: `C:\Users\james\Master\BrightHub\brun\train-data\src\scripts\`
- Tutorial: `C:\Users\james\Master\BrightHub\brun\train-data\src\scripts\supabase-access-details_v1.md`
- Primary scripts:
  - `execute-sql-direct.js` — direct SQL execution using `pg` with `DATABASE_URL`.
  - `cursor-db-helper.js` — list tables, describe schema, count, targeted `sql` selects.
  - `verify-data-insertion.js` — verification checks for inserted data.
- Generated SQL:
  - `src\scripts\generated-sql\insert-templates-fixed.sql` (recommended for SQL Editor or direct execution).
  - `src\scripts\generated-sql\insert-conversations.sql`.
  - `src\scripts\generated-sql\rollback-inserts.sql` (safe revert by `created_by` marker).

Plan Summary
- Step 1: Validate Supabase access and environment using a test script that performs read/write/edit to a safe target.
- Step 2: Introspect DB objects to confirm visibility of tables, constraints, functions, and triggers.
- Step 3: Execute SQL inserts (templates first, then conversations) using `execute-sql-direct.js`.
- Step 4: Verify data insertion using `verify-data-insertion.js` and helper counts; confirm distributions and relationships.
- Step 5: Update QA report with actual numbers, evidence logs, and pass/fail per acceptance criteria.
- Step 6: If needed, rollback and re-run; report any hard blocks and cease if Supabase objects cannot be read/written/edited.

Prompts
Each prompt is standalone and can be run in a fresh 200k Thinking LLM context. All instructions and code are self-contained within the prompt blocks.

Prompt 1 — Supabase Access Verification & Environment Setup
========================

Context:
- Goal: confirm read/write/edit access to Supabase from `src\scripts` using `.env.local`.
- Paths:
  - Scripts: `C:\Users\james\Master\BrightHub\brun\train-data\src\scripts\`
  - Tutorial: `C:\Users\james\Master\BrightHub\brun\train-data\src\scripts\supabase-access-details_v1.md`
  - Env file: `C:\Users\james\Master\BrightHub\BRun\train-data\.env.local`
- Required envs in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL=...`
  - `SUPABASE_SERVICE_ROLE_KEY=...`
  - Optional (preferred for direct SQL): `DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres`

Tasks:
1) Open the tutorial `supabase-access-details_v1.md`. Confirm how to obtain `DATABASE_URL`. If `DATABASE_URL` cannot be determined, proceed with service-role client access tests.
2) Create a new test script `src\scripts\supabase-access-test.js` to verify:
   - Read: counts for `templates` and `conversations`.
   - Write: insert a test row into `templates` with `created_by='access_test'`, then update `description`, then delete it.
   - Edit: perform an update on an existing row with `created_by='access_test'` (created during the test).
3) Run the test:
   - `node src\scripts\supabase-access-test.js read`
   - `node src\scripts\supabase-access-test.js write`
   - `node src\scripts\supabase-access-test.js edit`
   - `node src\scripts\supabase-access-test.js cleanup`
4) If any test fails, iterate:
   - Verify `.env.local` paths and values.
   - Confirm service role key validity and project ref.
   - Investigate RLS and policies on `templates` and `conversations`.
   - Re-run until read/write/edit succeeds or a hard block is identified.
5) Hard block rule:
   - If you confirm that read/write/edit operations cannot be performed from `src\scripts` using Supabase credentials, STOP and output a clear cease message indicating the barrier (do not provide manual workarounds).

Script: `src\scripts\supabase-access-test.js`
- Create this file and implement the following:
- Use `@supabase/supabase-js` with `SUPABASE_SERVICE_ROLE_KEY`.
- Actions: `read`, `write`, `edit`, `cleanup` as described.
- For the `write` test, insert minimal valid fields into `templates` (e.g., `id` as UUID v4, `template_name`, `created_by='access_test'`, `is_active=true`, timestamps).
- For `edit`, update `description` and confirm the change.
- For `cleanup`, delete test rows with `created_by='access_test'`.

Outputs to capture:
- Counts before/after write.
- Errors with full messages if any.
- Final status summary: PASS or HARD BLOCK.

+++++++++++++++++

Prompt 2 — Database Introspection (Objects Visibility)
========================

Context:
- Goal: enumerate tables, columns, indexes, constraints, triggers, and functions to ensure full visibility and confirm the presence of `templates` and `conversations` schemas relevant to E02.

Tasks:
1) Create `src\scripts\introspect-db-objects.js` that:
   - Uses `pg` Client with `DATABASE_URL`from `.env.local`.
   - Queries:
     - `information_schema.tables` for all schemas and tables.
     - `information_schema.columns` for selected tables (`templates`, `conversations`).
     - `pg_indexes` for indexes on these tables.
     - `pg_trigger` for triggers on these tables.
     - `pg_proc` for functions in `public` schema.
   - Outputs a markdown file `src\scripts\generated-sql\db-introspection.md` summarizing findings.
2) Run:
   - `node src\scripts\introspect-db-objects.js`
3) Confirm:
   - Tables `templates` and `conversations` present and match expected columns.
   - No blocking triggers/policies that would prevent inserts when using service role or direct SQL.

+++++++++++++++++

Prompt 3 — Execute SQL Inserts (Templates then Conversations)
========================

Context:
- Goal: execute generated SQL to populate `templates` (1 row) and `conversations` (35 rows).
- Files:
  - Templates: `src\scripts\generated-sql\insert-templates-fixed.sql`
  - Conversations: `src\scripts\generated-sql\insert-conversations.sql`
- Script:
  - `src\scripts\execute-sql-direct.js` (uses `pg` and `.env.local`)

Prerequisites:
- `.env.local` includes `DATABASE_URL`. If not, return to Prompt 1 to iterate access setup.
- Run a quick pre-check:
  - `node src\scripts\cursor-db-helper.js count conversations` -> Expect `0`.
  - `node src\scripts\cursor-db-helper.js count templates` -> Expect current baseline (e.g., `5`).

Tasks:
1) Execute templates insert:
   - `node src\scripts\execute-sql-direct.js`
   - Ensure script loads and runs `insert-templates-fixed.sql` FIRST.
2) Execute conversations insert:
   - Same run will execute `insert-conversations.sql` SECOND.
3) Capture outputs:
   - Rows inserted.
   - Duration and any errors.

Post-check:
- `node src\scripts\cursor-db-helper.js sql "SELECT COUNT(*) FROM templates"`
- `node src\scripts\cursor-db-helper.js sql "SELECT COUNT(*) FROM conversations"`

If errors (e.g., quote or JSONB parsing):
- Re-run with the fixed templates file and verify conversation file consistency (JSONB casts already provided).
- If partial inserts occurred, proceed to Prompt 5 for rollback and re-run.

+++++++++++++++++

Prompt 4 — Verification & QA Report Update
========================

Context:
- Goal: verify correctness of populated data and update the QA report `pmc\context-ai\pmct\mock-data-execution-prompt-E02-qa_v1.md` with live results.

Tasks:
1) Run the verification script:
   - `node src\scripts\verify-data-insertion.js`
   - Capture:
     - Conversations count (target ~35)
     - Templates count (+1 added)
     - Status and tier distributions
     - Quality score ranges
     - JSONB field validity checks
     - Template-conversation relationships
2) Helper checks:
   - `node src\scripts\cursor-db-helper.js count conversations`
   - `node src\scripts\cursor-db-helper.js count templates`
   - `node src\scripts\cursor-db-helper.js sql "SELECT parent_type, COUNT(*) FROM conversations GROUP BY parent_type"`
3) Update QA report:
   - Open `pmc\context-ai\pmct\mock-data-execution-prompt-E02-qa_v1.md`.
   - Replace "Current state" section with live counts and evidence logs of commands run.
   - Mark acceptance criteria as PASS if counts match and verification checks succeed.
   - If any check fails, note details and plan remediation (fix data, re-run inserts).

+++++++++++++++++

Prompt 5 — Rollback & Re-run (Safe Reset)
========================

Context:
- Goal: safely revert E02 inserts if partial execution or errors occurred, then re-run cleanly.

Tasks:
1) Rollback:
   - Open and run `src\scripts\generated-sql\rollback-inserts.sql` using `execute-sql-direct.js` (or via `pg` within the same script implementation).
   - Confirm deletions selectively target rows by `created_by` marker set in the E02 inserts.
2) Verify reset:
   - `node src\scripts\cursor-db-helper.js sql "SELECT COUNT(*) FROM conversations"`
   - Expect `0`.
3) Re-run Prompt 3 to perform clean inserts and then Prompt 4 to verify.

+++++++++++++++++

Prompt 6 — Hard Block Detection & Cease Protocol
========================

Context:
- Specification requires ceasing the task if we cannot view, audit, and edit actual Supabase objects from `src\scripts` using provided credentials.

Tasks:
1) Criteria for hard block:
   - `supabase-access-test.js` write/edit consistently fails due to credentials or policies.
   - `execute-sql-direct.js` cannot connect (missing or invalid `DATABASE_URL`) and no path exists in the tutorial to obtain it in this environment.
   - Supabase policies or configuration prevent service role operations and cannot be changed in this task’s scope.
2) Action:
   - STOP all further execution.
   - Output a concise cease message including:
     - Which operations failed (read/write/edit).
     - Errors and any diagnostic context.
     - Confirmation that no manual workaround steps will be provided per requirement.
3) Record the cease in the QA report under "Conclusion" with "HARD BLOCK — TASK CEASED".

+++++++++++++++++

Acceptance Criteria
- Access test confirms we can read/write/edit Supabase tables via `src\scripts`.
- `insert-templates-fixed.sql` and `insert-conversations.sql` executed via `execute-sql-direct.js`.
- Conversations populated: 35 rows; Templates populated: +1 row.
- Distributions and JSONB fields verified; timestamps valid; relationships intact.
- QA report updated with live counts and evidence; rollback path validated.

Notes
- Use Windows-compatible path separators in commands.
- Ensure templates are inserted before conversations to satisfy `parent_id` linkage for records with `parent_type='template'`.
- Ignore all tables prefixed with `kv_store` per specification.