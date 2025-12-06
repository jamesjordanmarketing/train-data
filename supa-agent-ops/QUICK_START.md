# SAOL Agent Quick Start Guide

**Version:** 2.1 (Bug Fixes)
**Last Updated:** December 6, 2025
**Purpose:** The authoritative reference for AI agents using Supabase Agent Ops Library.

---

## 🚀 What is SAOL?

The **Supabase Agent Ops Library (SAOL)** is a proprietary TypeScript/JavaScript library that provides AI agents with safe, reliable database operations for Supabase/PostgreSQL databases.

**Why use it?**
- **Safe:** Handles special characters automatically (no manual escaping needed).
- **Smart:** Provides intelligent error guidance and "next actions".
- **Robust:** Includes preflight checks and dry-run modes.
- **Flexible:** Supports multiple parameter formats for backward compatibility.

---

## ⚠️ Critical Rules (Read First)

1.  **Never manually escape strings** - SAOL handles quotes, emojis, and newlines automatically.
2.  **Use Service Role Key** - Operations require admin privileges (`SUPABASE_SERVICE_ROLE_KEY`).
3.  **Run Preflight Checks** - Always run `agentPreflight({ table })` before modifying data.
4.  **Check Results** - Always check `result.success` and follow `result.nextActions`.
5.  **Parameter Flexibility** - SAOL accepts both old and new parameter formats (see examples below).

---

## 🛠️ Environment Setup

**Required Variables (in `.env.local`):**

```bash
# Connection URL (SAOL accepts either)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# OR
SUPABASE_URL=https://your-project.supabase.co

# Admin Key (REQUIRED for all operations)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Initialization:**
```javascript
// Load environment variables from the correct path
require('dotenv').config({ path: '../.env.local' });
const saol = require('supa-agent-ops');
```

---

## ⚡ Common Operations

### 1. Query Records

**Basic Query** (multiple formats supported):
```javascript
// Format 1: Using 'where' and 'column' (recommended)
const result = await saol.agentQuery({
  table: 'conversations',
  where: [{ column: 'status', operator: 'eq', value: 'pending_review' }],
  limit: 10
});

// Format 2: Using 'filters' and 'field' (backward compatible)
const result = await saol.agentQuery({
  table: 'conversations',
  filters: [{ field: 'status', operator: 'eq', value: 'pending_review' }],
  limit: 10
});

console.log('Success:', result.success);
console.log('Data count:', result.data.length);
console.log('Data:', result.data);
```

**Select Specific Columns**:
```javascript
// String format (simple)
const result = await saol.agentQuery({
  table: 'prompt_templates',
  select: 'template_name,tier,emotional_arc_type',
  where: [{ column: 'tier', operator: 'eq', value: 'template' }]
});

// Array format (also works)
const result = await saol.agentQuery({
  table: 'prompt_templates',
  select: ['template_name', 'tier', 'emotional_arc_type'],
  where: [{ column: 'tier', operator: 'eq', value: 'template' }]
});
```

### 2. Count Records
```javascript
const result = await saol.agentCount({
  table: 'conversations',
  where: [{ column: 'status', operator: 'eq', value: 'approved' }]
});
console.log('Total count:', result.count);
```

### 3. Import/Upsert Data
```javascript
const result = await saol.agentImportTool({
  source: './data.ndjson',
  table: 'conversations',
  mode: 'upsert',
  onConflict: 'id'
});
```

### 4. Introspect Schema
```javascript
const schema = await saol.agentIntrospectSchema({
  table: 'conversations',
  transport: 'pg' // Required for schema details
});
console.log(schema.tables[0].columns);
```

---

## 🔍 Troubleshooting

**Error: `select.join is not a function`** (FIXED in v2.1)
- This error occurred when passing `select` as a string instead of an array.
- **Fixed:** SAOL now accepts both `select: '*'` (string) and `select: ['*']` (array).
- Update to latest version: `cd supa-agent-ops && npm run build`

**Error: `column undefined does not exist`**
- You may be using the old parameter format (`field` instead of `column`).
- **Fixed:** SAOL now supports both `field` and `column` for backward compatibility.
- Preferred: Use `column` in new code.

**Error: `Missing required environment variables`**
- Ensure you are loading the `.env.local` file correctly.
- Verify `SUPABASE_SERVICE_ROLE_KEY` exists.
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for details.

**Error: `Table not found`**
- Check your spelling.
- Use `agentIntrospectSchema` to list valid tables.

---

## 📚 Full Documentation

For comprehensive details, consult the full manual:
**`C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\saol-agent-manual_v2.md`**
