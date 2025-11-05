# Supabase Read/Write: Connection, Troubleshooting, and Safe Migrations (v1)

This note explains how this project connects to Supabase, whether the dev server must be running, how to diagnose connection issues, and how to safely add SQL without conflicting with what already exists.

## Overview

- The app uses `@supabase/supabase-js` with two modes:
  - Client mode uses the embedded anon key and project ref.
  - Server mode can use `SUPABASE_SERVICE_ROLE_KEY` for privileged operations.
- The Next.js app lives in `src/` (its `package.json` and `next.config.js` are in `src/`). Place your `.env.local` there so Next can load it.
- Some services read `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from the environment, while others compute the URL from a hardcoded `projectId` and use an embedded anon key.

## Connection Requirements

- Required env vars for full functionality:
  - `NEXT_PUBLIC_SUPABASE_URL` (e.g., `https://<projectRef>.supabase.co`)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public anon key)
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only; do not expose client-side)
- Location: put `.env.local` in `c:\Users\james\Master\BrightHub\brun\train-data\src\` next to `src/next.config.js`.
- The project also includes `src/utils/supabase/info.tsx` with:
  - `projectId = "hqhtbxlgzysfbekexwku"`
  - `publicAnonKey = "<anon key embedded here>"`
- `src/lib/supabase.ts` builds `supabaseUrl` as `https://${projectId}.supabase.co` and uses the service role key on the server (when `process.env.SUPABASE_SERVICE_ROLE_KEY` is set). If the service role key is absent, it falls back to the public anon key.
- Several services (e.g., `src/lib/services/database-health-service.ts`) use `process.env.NEXT_PUBLIC_SUPABASE_URL`. If that env var is missing or `.env.local` is not in `src/`, those services will fail to initialize their client.

## Do You Need the Dev Server?

- No, you do not need the dev server just to connect to Supabase. Any Node script can create a Supabase client and connect using proper keys.
- You do need to run the Next dev server (`npm run dev` in `src/`) to exercise the app’s UI/API routes that rely on Supabase.

## Current Setup Status (Based on Repo)

- Next.js app root: `train-data/src/` (not the repository root).
- Client config:
  - `src/lib/supabase.ts` uses `projectId` and `publicAnonKey` from `src/utils/supabase/info.tsx`.
- Server config:
  - `src/lib/supabase.ts` and `src/lib/supabase-server.ts` will use `SUPABASE_SERVICE_ROLE_KEY` if present; otherwise, they warn/fall back to anon.
- Env-driven services:
  - `src/lib/services/database-health-service.ts` and `src/lib/services/database-maintenance-service.ts` require `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to be set and loaded by Next.
- Observation:
  - `.env.local` is not visible at repo root. Even if you placed it at the root, Next in `src/` would not load it. Move or copy `.env.local` into `src/.env.local`.

## Troubleshooting Checklist

1. Verify env file location
   - Ensure `.env.local` is at `train-data/src/.env.local`.

2. Verify required keys
   - Add these entries to `src/.env.local`:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://hqhtbxlgzysfbekexwku.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
     SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
     ```
   - Use the exact anon key from your Supabase dashboard. The project currently embeds one in `src/utils/supabase/info.tsx`, but env-driven services still expect `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

3. Confirm server-side privileges
   - Operations that bypass RLS (maintenance, health checks, admin writes) require `SUPABASE_SERVICE_ROLE_KEY` on the server. If unset, those operations will fail or be restricted.

4. Start the app where needed
   - For UI/API route testing: `cd src && npm run dev`.
   - For quick connectivity without the server, use a one-off Node script (see below).

5. Align URL usage
   - If you prefer env-only configuration, set `NEXT_PUBLIC_SUPABASE_URL` and use it across all services.
   - Otherwise, ensure the env value matches `https://${projectId}.supabase.co` to keep both patterns consistent.

## Quick Connectivity Test (No Dev Server)

Create `scripts/test-supabase-connection.ts` (or run inline) to verify keys and network:

```ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY; // optional

const client = createClient(url, service || anon, service ? { auth: { autoRefreshToken: false, persistSession: false } } : {});

async function main() {
  // Simple list with limit: verifies basic connectivity
  const { data, error } = await client.from('documents').select('id, title').limit(1);
  if (error) {
    console.error('Connection failed:', error);
    process.exitCode = 1;
  } else {
    console.log('Connection OK. Sample:', data);
  }
}

main();
```

Run it from `src/` so it sees `.env.local`:

```bash
cd src
npm install # if not already
node -e "require('dotenv').config({ path: '.env.local' }); require('./scripts/test-supabase-connection.ts');"
```

Alternatively, add a `scripts` entry and run `npm run test:connection`.

## Asking About Tables

Based on the code, the app expects these tables (non-exhaustive):

- `documents`
- `workflow_sessions`
- `categories`
- `tag_dimensions`
- `tags`
- `document_categories`
- `document_tags`
- `custom_tags`
- `user_profiles` (referenced in auth/profile logic)

If any are missing in your Supabase project, you’ll see errors on queries. You can seed them via migrations or SQL scripts.

## Safe SQL and Conflict Prevention

Use a migration-first approach to prevent conflicts between new SQL and what already exists:

- Prefer idempotent SQL:
  - `CREATE TABLE IF NOT EXISTS ...`
  - `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...`
  - `CREATE INDEX IF NOT EXISTS ...`
  - Wrap complex changes:
    ```sql
    DO $$ BEGIN
      -- Safe add column example
      ALTER TABLE documents ADD COLUMN IF NOT EXISTS summary TEXT;
    EXCEPTION WHEN duplicate_column THEN
      -- No-op if column already exists
      NULL;
    END $$;
    ```
- Track changes as migrations:
  - Use `supabase/migrations/` to store SQL changes in timestamped files.
  - Suggested flow:
    1. `supabase login`
    2. `supabase link --project-ref hqhtbxlgzysfbekexwku`
    3. `supabase migration new <meaningful-name>`
    4. Put idempotent SQL in the created file.
    5. `supabase db push` (or apply via CI) after review.
- Validate before applying:
  - Pull remote schema for comparison: `supabase db pull`
  - Diff locally before push: check for objects already present.
- Rollback planning:
  - For risky changes, wrap in a transaction or provide a reverse migration.
  - Example:
    ```sql
    BEGIN;
      -- change statements
    COMMIT;
    -- Provide a separate down migration if needed
    ```
- Documentation:
  - See `docs/migrations.md` and `docs/migration-framework-setup.md` in this repo for broader context and process guidance.

## Summary

- You can connect without the dev server; just use a Node script with valid env vars.
- Place `.env.local` in `src/` so the Next app and scripts pick it up.
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set for server-side writes that bypass RLS.
- Align URL/key usage across the codebase (env vs embedded) to avoid inconsistent behavior.
- Implement new SQL through idempotent migrations to prevent conflicts.

If you share which tables you’ve created or any specific errors, I can pinpoint missing schema or keys and propose exact fixes.