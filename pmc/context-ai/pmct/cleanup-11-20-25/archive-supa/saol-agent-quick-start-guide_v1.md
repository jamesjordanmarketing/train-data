# SAOL Agent Quick Start Guide

**Version:** 1.0  
**Last Updated:** November 12, 2025  
**Purpose:** Essential reference for AI agents using Supabase Agent Ops Library

---

## What is SAOL?

The **Supabase Agent Ops Library (SAOL)** is a proprietary TypeScript/JavaScript library that provides AI agents with safe, reliable database operations for Supabase/PostgreSQL databases. It handles special characters automatically, prevents SQL injection, provides intelligent error guidance, and includes preflight validation.

**Key Features:**
- Zero manual escaping (handles quotes, apostrophes, emojis, newlines automatically)
- Intelligent error reporting with `nextActions` guidance
- Safe-by-default (preflight checks, dry-run mode, required confirmations)
- Support for import/upsert, query, export, delete, schema operations
- Multiple transport options (Supabase client, direct PostgreSQL, RPC)

---

## Critical Rules (Read These First)

1. **Never manually escape strings** - SAOL handles ALL special characters automatically
2. **Always use SERVICE_ROLE_KEY** (not anon key) - Check environment variables
3. **Run preflight checks** before operations - `agentPreflight({ table })`
4. **Use dry-run for destructive operations** - Test before executing
5. **Check `result.success` and follow `nextActions`** - Every operation returns guidance

---

## Environment Setup

**Required Environment Variables:**
```bash
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Service role, not anon!
```

**Optional (for pg transport):**
```bash
export DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres
```

**Validation:**
```typescript
const { agentPreflight } = require('supa-agent-ops');
const check = await agentPreflight({ table: 'your_table' });
```

---

## Most Common Operations

### Query Records
```typescript
const saol = require('supa-agent-ops');

const result = await saol.agentQuery({
  table: 'conversations',
  where: [{ column: 'status', operator: 'eq', value: 'pending_review' }],
  limit: 10
});
console.log(result.data);
```

### Count Records
```typescript
const count = await saol.agentCount({
  table: 'conversations',
  where: [{ column: 'status', operator: 'eq', value: 'approved' }]
});
console.log(`Count: ${count.count}`);
```

### Import/Upsert Data
```typescript
const result = await saol.agentImportTool({
  source: './data.ndjson',  // File path or array of objects
  table: 'conversations',
  mode: 'upsert',
  onConflict: 'id'
});
```

### Export Data
```typescript
await saol.agentExportData({
  table: 'conversations',
  destination: './export.json',
  config: { format: 'json', includeMetadata: true },
  filters: [{ column: 'quality_score', operator: 'lt', value: 6 }]
});
```

### Introspect Schema
```typescript
const schema = await saol.agentIntrospectSchema({
  table: 'conversations',
  includeColumns: true,
  includeIndexes: true,
  transport: 'pg'  // Required for schema operations
});
console.log(schema.tables[0].columns);
```

### Delete Records
```typescript
const result = await saol.agentDelete({
  table: 'conversations',
  where: [{ column: 'status', operator: 'eq', value: 'draft' }],
  confirm: true  // Required for safety
});
```

---

## Function Reference

| Operation | Function | Key Parameters |
|-----------|----------|----------------|
| **Query** | `agentQuery()` | `table`, `where`, `limit`, `orderBy` |
| **Count** | `agentCount()` | `table`, `where` |
| **Insert/Update** | `agentImportTool()` | `source`, `table`, `mode: 'upsert'`, `onConflict` |
| **Delete** | `agentDelete()` | `table`, `where`, `confirm: true` |
| **Schema** | `agentIntrospectSchema()` | `table`, `transport: 'pg'` |
| **Export** | `agentExportData()` | `table`, `destination`, `config.format` |
| **Preflight** | `agentPreflight()` | `table`, `mode` |
| **DDL** | `agentExecuteDDL()` | `sql`, `dryRun` |
| **RPC** | `agentExecuteRPC()` | `functionName`, `params` |

---

## Transport Selection

- **`supabase`** (default): Use for Import, Query, Export operations
- **`pg`**: Use for Schema operations, DDL, Maintenance tasks
- **`rpc`**: Use for Custom SQL execution or stored procedure calls

Example:
```typescript
// Schema operations require 'pg' transport
await saol.agentIntrospectSchema({ table: 'conversations', transport: 'pg' });
```

---

## Quick Reference: One-Liner Commands

### Query Records
```bash
node -e "const saol=require('supa-agent-ops');(async()=>{const r=await saol.agentQuery({table:'conversations',limit:10});console.log(r.data);})();"
```

### Count Records
```bash
node -e "const saol=require('supa-agent-ops');(async()=>{const r=await saol.agentCount({table:'conversations',where:[{column:'status',operator:'eq',value:'approved'}]});console.log('Count:',r.count);})();"
```

### Check Schema
```bash
node -e "const saol=require('supa-agent-ops');(async()=>{const r=await saol.agentIntrospectSchema({table:'conversations',transport:'pg'});console.log(r.tables[0].columns);})();"
```

### Export Data
```bash
node -e "const saol=require('supa-agent-ops');(async()=>{await saol.agentExportData({table:'conversations',destination:'./export.json',config:{format:'json'}});console.log('Exported');})();"
```

---

## Error Handling

Every SAOL operation returns a result object with:
- `success`: boolean indicating success/failure
- `summary`: human-readable summary
- `nextActions`: array of recommended next steps with examples

**Always check these properties:**
```typescript
const result = await saol.agentImportTool({...});

if (!result.success) {
  console.log('Error:', result.summary);
  console.log('Recommended actions:', result.nextActions);
  return;
}

console.log('Success:', result.summary);
```

---

## Common Patterns

### Preflight → Dry-Run → Execute
```typescript
// 1. Preflight check
const preflight = await saol.agentPreflight({ table: 'conversations' });
if (!preflight.ok) {
  console.log('Preflight issues:', preflight.issues);
  return;
}

// 2. Dry-run
const dryRun = await saol.agentImportTool({
  source: './data.ndjson',
  table: 'conversations',
  dryRun: true
});
if (!dryRun.success) return;

// 3. Execute
const result = await saol.agentImportTool({
  source: './data.ndjson',
  table: 'conversations',
  mode: 'upsert',
  onConflict: 'id'
});
```

### Query with Multiple Filters
```typescript
const result = await saol.agentQuery({
  table: 'conversations',
  where: [
    { column: 'status', operator: 'eq', value: 'approved' },
    { column: 'quality_score', operator: 'gte', value: 8 },
    { column: 'tier', operator: 'in', value: ['template', 'scenario'] }
  ],
  orderBy: [{ column: 'created_at', ascending: false }],
  limit: 50
});
```

### Conditional Delete with Confirmation
```typescript
// Always use WHERE clause and confirm=true for safety
const result = await saol.agentDelete({
  table: 'conversations',
  where: [
    { column: 'status', operator: 'eq', value: 'draft' },
    { column: 'created_at', operator: 'lt', value: '2025-01-01' }
  ],
  confirm: true,
  dryRun: true  // Test first!
});
```

---

## Full Documentation Reference

For comprehensive details, consult the full manual at:  
**`C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\saol-agent-manual_v2.md`**

### Table of Contents (by line numbers)

| Section | Lines | When to Use |
|---------|-------|-------------|
| **Quick Start** | 30-53 | Installation, basic usage |
| **Environment Setup** | 55-73 | Configuration, credentials |
| **Core Concepts** | 75-108 | Understanding library principles |
| **Import Operations** | 110-208 | Inserting/upserting data |
| **Query Operations** | 210-283 | Selecting and filtering data |
| **Export Operations** | 285-353 | Exporting data to files |
| **Delete Operations** | 355-413 | Safely deleting records |
| **Schema Operations** | 415-518 | DDL, introspection, indexes |
| **RPC Operations** | 520-588 | Custom SQL, stored procedures |
| **Maintenance Operations** | 590-678 | Vacuum, analyze, reindex |
| **Verification Operations** | 680-758 | Table/index validation |
| **Error Handling** | 760-838 | Troubleshooting operations |
| **Usage Patterns by Agent Type** | 840-918 | Context-specific workflows |
| **Quick Reference Tables** | 920-1008 | Function summaries, parameters |
| **Common Pitfalls & Solutions** | 1010-1280 | Known issues and fixes |

**Navigation Tip:** Jump directly to line ranges using your editor's "Go to Line" feature.

---

## Prompt Inclusion Statement

When crafting coding or bug-fixing prompts, include this statement:

> **For all Supabase operations use the Supabase Agent Ops Library (SAOL).**  
> **Library location:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`  
> **Quick Start Guide:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\saol-agent-quick-start-guide_v1.md`

---

**End of Quick Start Guide**
