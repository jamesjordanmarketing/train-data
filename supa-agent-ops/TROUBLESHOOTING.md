# Supabase Agent Ops Library (SAOL) Troubleshooting Guide

This guide addresses common issues agents and developers may encounter when using SAOL.

## 1. Environment Variable Errors

### Error: `Missing required environment variables: SUPABASE_URL`
**Symptom:**
Scripts fail immediately with this error message during the preflight check or initialization.

**Cause:**
The library cannot find `SUPABASE_URL` in `process.env`. This often happens because:
1.  The `.env` file is not being loaded correctly.
2.  The project uses `NEXT_PUBLIC_SUPABASE_URL` instead of `SUPABASE_URL`.

**Solution:**
SAOL v1.2+ automatically checks for `NEXT_PUBLIC_SUPABASE_URL` as a fallback.
1.  **Check Path:** Ensure you are loading the correct env file in your script:
    ```javascript
    require('dotenv').config({ path: '../.env.local' }); // Adjust path as needed
    ```
2.  **Check File Content:** Verify `.env.local` contains either `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`.

### Error: `Missing required environment variables: SUPABASE_SERVICE_ROLE_KEY`
**Symptom:**
Operations fail with authentication errors or specific missing variable errors.

**Cause:**
SAOL requires the **Service Role Key** (admin privileges) to bypass Row Level Security (RLS) and perform maintenance tasks. The anonymous key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) is insufficient.

**Solution:**
Add the service role key to your `.env.local` file:
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```
*Warning: Never expose this key in client-side code.*

## 2. Preflight Failures

### Error: `Table existence check failed`
**Symptom:**
`agentPreflight` returns `ok: false` with an issue stating the table does not exist.

**Cause:**
1.  The table name is misspelled.
2.  The `SUPABASE_URL` points to a different project than expected.
3.  The table is in a schema other than `public` (SAOL defaults to `public`).

**Solution:**
1.  Verify the table name in Supabase Dashboard.
2.  Run `agentIntrospectSchema` to list available tables:
    ```javascript
    const schema = await saol.agentIntrospectSchema({ table: 'your_table', transport: 'pg' });
    ```

## 3. Import/Export Issues

### Error: `Violates foreign key constraint`
**Symptom:**
Import fails with a PostgreSQL error about foreign keys.

**Cause:**
You are trying to insert records that reference IDs not present in the related tables.

**Solution:**
1.  Import parent records first (e.g., `users` before `conversations`).
2.  Use `agentImportTool` with `mode: 'upsert'` to handle existing records gracefully.

### Error: `JSON parsing failed` during Import
**Symptom:**
The tool fails to read the source file.

**Cause:**
The source file is not valid JSON or NDJSON (newline-delimited JSON).

**Solution:**
1.  Validate the source file syntax.
2.  If using NDJSON, ensure each line is a valid JSON object.

## 4. General Debugging

If you are unsure why an operation is failing:
1.  **Enable Dry Run:** Use `dryRun: true` in options to see what *would* happen.
2.  **Check `nextActions`:** The result object always includes `nextActions` with specific recommendations.
3.  **Use `pg` Transport:** For schema-related issues, switch to `transport: 'pg'` for more detailed error messages from the database directly.
