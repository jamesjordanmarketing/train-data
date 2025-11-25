# Context Carryover: Bulk Generation Schema Fixes & SAOL Implementation

**Date:** November 25, 2025  
**Phase:** Bulk Conversation Generation - Database Schema Fixes  
**Status:** Database schema fully patched, SAOL verified working, Ready for End-to-End Testing

---

## 📋 Project Context

### What This Application Does

**Bright Run LoRA Training Data Platform** - A Next.js 14 application that generates high-quality AI training conversations for fine-tuning large language models. The platform enables non-technical domain experts to transform proprietary knowledge into LoRA-ready training datasets.

**Core Capabilities**:
1. **Conversation Generation**: AI-powered generation using Claude API with predetermined field structure
2. **Enrichment Pipeline**: 5-stage validation and enrichment process for quality assurance
3. **Storage System**: File storage (Supabase Storage) + metadata (PostgreSQL)
4. **Management Dashboard**: UI for reviewing, downloading, and managing conversations
5. **Download System**: Export both raw (minimal) and enriched (complete) JSON formats

### Core Workflow

```
User → Generate Conversation → Claude API → Raw JSON Stored →
Enrichment Pipeline (5 stages) → Enriched JSON Stored →
Dashboard View → Download (Raw or Enriched)
```

---

## 🎯 Session Summary

### What We Accomplished This Session

1.  **Diagnosed & Fixed SAOL Usage**:
    *   Identified that scripts were failing because they couldn't find `dotenv`.
    *   **Fix**: Updated scripts to use the local `load-env.js` utility (`require('../load-env.js')`).
    *   **Outcome**: SAOL scripts now run reliably in the local environment.

2.  **Audited Database Schema**:
    *   Created a probe script (`scripts/audit-schema-probe.js`) to verify column existence and types using SAOL `agentQuery`.
    *   **Findings**:
        *   `batch_jobs` table had `priority` as an **INTEGER** (causing "invalid input syntax" errors).
        *   `batch_items` table was missing the `error_message` column.
        *   `batch_jobs` was missing `successful_items`, `failed_items`, `completed_items`, `total_items`.

3.  **Comprehensive Schema Fix**:
    *   Created and executed a **Robust SQL Migration** (`supabase/migrations/20251125_robust_schema_fix.sql`).
    *   Used a `DO` block to safely drop conflicting CHECK constraints on `priority`.
    *   Converted `priority` to `VARCHAR` (default 'normal').
    *   Added all missing columns (`error_message`, etc.).
    *   Ensured `shared_parameters` is `JSONB`.

### Current Status

✅ **Fixed Issues:**
*   `priority` column type mismatch (Integer -> Varchar).
*   Missing `error_message` column in `batch_items`.
*   Missing progress tracking columns in `batch_jobs`.
*   SAOL script execution environment (fixed `dotenv` issue).

⏳ **Ready for Testing:**
*   The database schema is now fully aligned with `batch-job-service.ts`.
*   The Bulk Generator should now run without `PGRST204` (missing column) or `22P02` (type mismatch) errors.

---

## 🚨 CRITICAL: SAOL Tool Usage (MUST READ)

**The Supabase Client is unreliable for administrative tasks due to RLS (Row Level Security).**
**You MUST use the Supabase Agent Ops Library (SAOL) for all database operations.**

### ✅ CORRECT SAOL USAGE PATTERN

SAOL is a **Functional API**, not a class.

**1. Import Pattern (in scripts):**
Use the local `load-env.js` to ensure environment variables are loaded correctly.

```javascript
// ✅ CORRECT IMPORT (in scripts/ folder)
require('../load-env.js'); 
const saol = require('../supa-agent-ops/dist/index.js');

// ❌ INCORRECT
// require('dotenv').config(); // Fails to find module often
// const saol = new SupabaseAgentOpsLibrary(); // It is NOT a class
```

**2. Querying Data (agentQuery):**
Use `agentQuery` for reading data. It works over the HTTP API and is robust.

```javascript
const result = await saol.agentQuery({
  table: 'batch_jobs',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  where: [{ column: 'status', operator: 'eq', value: 'failed' }],
  limit: 5,
  transport: 'supabase' // CRITICAL: Use 'supabase' transport
});

if (result.success) {
  console.log(result.data);
}
```

**3. Introspection (agentIntrospectSchema):**
⚠️ **WARNING**: `agentIntrospectSchema` often requires `transport: 'pg'` and a direct `DATABASE_URL` connection string, which may not be available.
**Better Approach**: Use "Probe Queries" with `agentQuery` to check if columns exist (select specific columns with `limit: 1`).

---

## 🔧 Testing Checklist for Next Agent

The previous agent (me) fixed the schema. Your job is to verify the application works.

### 1. Run the Bulk Generator Test
1.  Navigate to `/bulk-generator`.
2.  Select a **Small Batch**:
    *   1 Persona
    *   1 Emotional Arc
    *   2 Topics
    *   **Total**: 2 Conversations.
3.  Click **Generate**.
4.  **Success Criteria**:
    *   Redirects to `/batch-jobs/[id]`.
    *   Status moves from `queued` -> `processing` -> `completed`.
    *   **NO** "invalid input syntax" errors in the logs.
    *   **NO** "Could not find column" errors in the logs.

### 2. Verify Data in Database (using SAOL)
Use `scripts/debug-saol.js` as a template to check the results:

```javascript
// Check if job completed
const job = await saol.agentQuery({
  table: 'batch_jobs',
  where: [{ column: 'status', operator: 'eq', value: 'completed' }],
  limit: 1
});
```

---

## 📁 Important Files Reference

### Scripts (Use these!)
*   `scripts/audit-schema-probe.js`: **GOLD STANDARD** for checking if the schema is correct. Run this if you suspect missing columns.
*   `scripts/debug-saol.js`: Simple connectivity test.
*   `load-env.js`: Critical utility for loading environment variables in scripts.

### Migrations (History of Fixes)
*   `supabase/migrations/20251125_robust_schema_fix.sql`: **The Master Fix**. Contains the `DO` block to drop constraints and the `ALTER TABLE` statements.

### Source Code
*   `src/lib/services/batch-job-service.ts`: The source of truth for what columns the application expects.

---

## 💡 Pro Tips for Next Agent

1.  **If a script hangs**: It's likely an unclosed handle or network timeout. Use `Ctrl+C` and try again, or check `load-env.js` usage.
2.  **If you see "operator does not exist"**: It's a type mismatch (e.g., comparing Integer vs String). Check the DB schema types against the code.
3.  **Trust SAOL over Supabase Client**: If the app throws RLS errors, use SAOL in a script to verify the data actually exists.
4.  **Vercel Logs**: Keep `vercel logs --follow` open (or check the dashboard) to see the real-time server-side errors during generation.

**Go get 'em! The schema is clean and ready for the first successful bulk run.** 🚀
