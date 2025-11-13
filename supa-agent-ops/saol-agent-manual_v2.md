# Supabase Agent Ops Library (SAOL) - AI Agent Manual v2.0

**Version:** 1.3.0  
**Last Updated:** November 12, 2025  
**Purpose:** Low-context, quick-reference manual for AI coding agents

---

## Table of Contents

| Section | Lines |
|---------|-------|
| [Quick Start](#quick-start) | 30-53 |
| [Environment Setup](#environment-setup) | 55-73 |
| [Core Concepts](#core-concepts) | 75-108 |
| [Import Operations](#import-operations) | 110-208 |
| [Query Operations](#query-operations) | 210-283 |
| [Export Operations](#export-operations) | 285-353 |
| [Delete Operations](#delete-operations) | 355-413 |
| [Schema Operations](#schema-operations) | 415-518 |
| [RPC Operations](#rpc-operations) | 520-588 |
| [Maintenance Operations](#maintenance-operations) | 590-678 |
| [Verification Operations](#verification-operations) | 680-758 |
| [Error Handling](#error-handling) | 760-838 |
| [Usage Patterns by Agent Type](#usage-patterns-by-agent-type) | 840-918 |
| [Quick Reference Tables](#quick-reference-tables) | 920-1008 |
| [Common Pitfalls & Solutions](#common-pitfalls--solutions) | 1010-1280 |
| [Additional Resources](#additional-resources) | 1282-1310 |

---

## Quick Start

**Installation:**
```bash
cd C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops
npm install && npm run build && npm link
```

**Basic Usage:**
```typescript
const { agentImportTool } = require('supa-agent-ops');

const result = await agentImportTool({
  source: './data.ndjson',  // File path or array of objects
  table: 'conversations',
  mode: 'upsert',
  onConflict: 'id'
});
```

**Key Principle:** All special characters (apostrophes, quotes, emojis) are handled automatically. **Never** manually escape strings.

---

## Environment Setup

**Required Environment Variables:**
```bash
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Use SERVICE ROLE, not anon key
```

**Optional (for pg transport):**
```bash
export DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres
```

**Validation:**
Always run preflight checks before operations:
```typescript
const { agentPreflight } = require('supa-agent-ops');
const check = await agentPreflight({ table: 'your_table' });
```

---

## Core Concepts

### 1. **Zero Manual Escaping**
The library handles ALL special characters automatically via parameterized queries.
- ✅ Apostrophes: `don't`, `can't`, `it's`
- ✅ Quotes: `"hello"`, `'world'`
- ✅ Emojis: `😊`, `🎉`
- ✅ Newlines: `\n`, `\r\n`
- ✅ Backslashes: `C:\path\to\file`

### 2. **Intelligent Error Reporting**
Every result includes:
- `success`: boolean
- `summary`: human-readable summary
- `nextActions`: array of recommended next steps with examples

### 3. **Safe-by-Default**
- Preflight checks prevent wasted API calls
- Dry-run mode for validation
- Delete operations require WHERE clause + confirmation
- Transaction safety for DDL operations

### 4. **Transport Options**
- `supabase` (default): Uses Supabase client
- `pg`: Direct PostgreSQL connection (requires DATABASE_URL)
- `auto`: Automatically selects best transport

---

## Import Operations

**Function:** `agentImportTool(params)`

### Basic Import

```typescript
const result = await agentImportTool({
  source: './data.ndjson',      // File path or Record<string, any>[]
  table: 'conversations'         // Table name
});
```

### Upsert Mode

```typescript
const result = await agentImportTool({
  source: './data.ndjson',
  table: 'conversations',
  mode: 'upsert',               // 'insert' | 'upsert'
  onConflict: 'id'              // Column(s) for conflict resolution
});
```

### Advanced Options

```typescript
const result = await agentImportTool({
  source: records,
  table: 'conversations',
  mode: 'upsert',
  onConflict: ['user_id', 'role_id'],  // Composite key
  batchSize: 200,               // Records per batch (default: 200)
  concurrency: 2,               // Parallel batches (default: 2)
  dryRun: true,                 // Validate without writing
  sanitize: true,               // Auto-sanitize characters (default: true)
  normalization: 'NFC',         // Unicode normalization
  transport: 'supabase'         // 'supabase' | 'pg' | 'auto'
});
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `source` | `string \| Record<string, any>[]` | Yes | - | File path or array of records |
| `table` | `string` | Yes | - | Target table name |
| `mode` | `'insert' \| 'upsert'` | No | `'insert'` | Insert or upsert mode |
| `onConflict` | `string \| string[]` | No | Auto-detect | Conflict resolution column(s) |
| `batchSize` | `number` | No | `200` | Records per batch |
| `concurrency` | `number` | No | `2` | Parallel batch execution |
| `dryRun` | `boolean` | No | `false` | Validate without writing |
| `sanitize` | `boolean` | No | `true` | Auto-sanitize special characters |
| `normalization` | `'NFC' \| 'NFKC' \| 'none'` | No | `'NFC'` | Unicode normalization |
| `transport` | `'supabase' \| 'pg' \| 'auto'` | No | `'auto'` | Transport method |

### Result Structure

```typescript
{
  success: boolean,
  summary: string,
  totals: {
    total: number,
    success: number,
    failed: number,
    skipped: number,
    durationMs: number
  },
  reportPaths: {
    summary: string,
    errors?: string,
    success?: string
  },
  nextActions: NextAction[]
}
```

### Example: Import with Error Recovery

```typescript
let result = await agentImportTool({
  source: './data.ndjson',
  table: 'conversations'
});

if (!result.success) {
  const { analyzeImportErrors } = require('supa-agent-ops');
  const analysis = await analyzeImportErrors(result);
  
  // Check for unique violations
  const hasUniqueViolation = analysis.recoverySteps.some(
    s => s.errorCode === 'ERR_DB_UNIQUE_VIOLATION' && s.automatable
  );
  
  if (hasUniqueViolation) {
    // Retry with upsert
    result = await agentImportTool({
      source: './data.ndjson',
      table: 'conversations',
      mode: 'upsert',
      onConflict: 'id'
    });
  }
}
```

---

## Query Operations

**Functions:** `agentQuery(params)`, `agentCount(params)`

### Basic Query

```typescript
const { agentQuery } = require('supa-agent-ops');

const result = await agentQuery({
  table: 'conversations',
  limit: 10
});

console.log(result.data);  // Array of records
```

### Filtering

```typescript
const result = await agentQuery({
  table: 'conversations',
  where: [
    { column: 'status', operator: 'eq', value: 'approved' },
    { column: 'tier', operator: 'in', value: ['template', 'prime'] },
    { column: 'created_at', operator: 'gte', value: '2024-01-01' }
  ]
});
```

### Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equal to | `{ column: 'status', operator: 'eq', value: 'active' }` |
| `neq` | Not equal to | `{ column: 'status', operator: 'neq', value: 'deleted' }` |
| `gt` | Greater than | `{ column: 'count', operator: 'gt', value: 10 }` |
| `gte` | Greater than or equal | `{ column: 'count', operator: 'gte', value: 10 }` |
| `lt` | Less than | `{ column: 'count', operator: 'lt', value: 100 }` |
| `lte` | Less than or equal | `{ column: 'count', operator: 'lte', value: 100 }` |
| `like` | Pattern match | `{ column: 'name', operator: 'like', value: '%Marcus%' }` |
| `in` | In array | `{ column: 'tier', operator: 'in', value: ['a', 'b'] }` |
| `is` | Is null/not null | `{ column: 'deleted_at', operator: 'is', value: null }` |

### Ordering & Pagination

```typescript
const result = await agentQuery({
  table: 'conversations',
  where: [{ column: 'status', operator: 'eq', value: 'approved' }],
  orderBy: [
    { column: 'created_at', asc: false }  // DESC
  ],
  limit: 50,
  offset: 100
});
```

### Aggregations

```typescript
const result = await agentQuery({
  table: 'conversations',
  aggregate: [
    { function: 'COUNT', column: 'id', alias: 'total' },
    { function: 'AVG', column: 'rating', alias: 'avg_rating' },
    { function: 'SUM', column: 'score', alias: 'total_score' }
  ]
});

console.log(result.aggregations);  // { total: 1234, avg_rating: 4.5, ... }
```

### Count Query

```typescript
const { agentCount } = require('supa-agent-ops');

const result = await agentCount({
  table: 'conversations',
  where: [{ column: 'tier', operator: 'eq', value: 'template' }]
});

console.log(result.count);  // 123
```

---

## Export Operations

**Function:** `agentExportData(params)`

### Supported Formats

| Format | Extension | Use Case | Compatible With |
|--------|-----------|----------|-----------------|
| JSONL | `.jsonl` | Training data, streaming | OpenAI, Anthropic |
| JSON | `.json` | Structured data | General purpose |
| CSV | `.csv` | Spreadsheets | Excel, Google Sheets |
| Markdown | `.md` | Reports | Human-readable |

### JSONL Export (Training Format)

```typescript
const { agentExportData } = require('supa-agent-ops');

const result = await agentExportData({
  table: 'conversations',
  destination: './training-data.jsonl',
  config: {
    format: 'jsonl',
    includeMetadata: false,
    includeTimestamps: false
  },
  filters: [{ column: 'status', operator: 'eq', value: 'approved' }]
});
```

### JSON Export

```typescript
const result = await agentExportData({
  table: 'conversations',
  destination: './export.json',
  config: {
    format: 'json',
    includeMetadata: true,   // Adds version, date metadata
    includeTimestamps: true  // Includes created_at, updated_at
  }
});
```

### CSV Export (Excel-Compatible)

```typescript
const result = await agentExportData({
  table: 'conversations',
  destination: './data.csv',
  config: {
    format: 'csv',
    includeMetadata: true,
    includeTimestamps: true
  }
});
```

### Markdown Export (Reports)

```typescript
const result = await agentExportData({
  table: 'conversations',
  destination: './report.md',
  config: {
    format: 'markdown',
    includeMetadata: true,
    includeTimestamps: true
  }
});
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `table` | `string` | Yes | Source table name |
| `destination` | `string` | Yes | Output file path |
| `config.format` | `'jsonl' \| 'json' \| 'csv' \| 'markdown'` | Yes | Export format |
| `config.includeMetadata` | `boolean` | No | Include metadata fields |
| `config.includeTimestamps` | `boolean` | No | Include timestamp columns |
| `filters` | `QueryFilter[]` | No | Filter records (same as query) |
| `orderBy` | `OrderSpec[]` | No | Sort order |
| `limit` | `number` | No | Max records to export |

---

## Delete Operations

**Function:** `agentDelete(params)`

### Safety Features

1. **Mandatory WHERE clause** - Prevents accidental full table deletion
2. **Explicit confirmation** - `confirm: true` required
3. **Dry-run preview** - See what will be deleted
4. **Automatic backup suggestions** - In nextActions

### Dry-Run (Preview)

```typescript
const { agentDelete } = require('supa-agent-ops');

const preview = await agentDelete({
  table: 'conversations',
  where: [{ column: 'status', operator: 'eq', value: 'draft' }],
  dryRun: true
});

console.log(`Would delete: ${preview.previewRecords.length} records`);
preview.previewRecords.forEach(r => console.log(r.id));
```

### Execute Delete

```typescript
const result = await agentDelete({
  table: 'conversations',
  where: [{ column: 'status', operator: 'eq', value: 'draft' }],
  confirm: true  // REQUIRED for actual deletion
});

console.log(`Deleted: ${result.deletedCount} records`);
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `table` | `string` | Yes | Target table |
| `where` | `QueryFilter[]` | **Yes** | WHERE clause (cannot be empty) |
| `dryRun` | `boolean` | No | Preview without deleting |
| `confirm` | `boolean` | **Yes (for execution)** | Explicit confirmation |
| `cascade` | `boolean` | No | Cascade to related records |

### Safety Violations

```typescript
// ❌ This will FAIL - no WHERE clause
await agentDelete({ table: 'conversations', where: [], confirm: true });
// Error: WHERE clause required

// ❌ This will FAIL - no confirmation
await agentDelete({ table: 'conversations', where: [...] });
// Error: confirm: true required

// ✅ This works
await agentDelete({ table: 'conversations', where: [...], confirm: true });
```

---

## Schema Operations

**Functions:** `agentIntrospectSchema()`, `agentExecuteDDL()`, `agentManageIndex()`

### Introspect Schema

```typescript
const { agentIntrospectSchema } = require('supa-agent-ops');

const result = await agentIntrospectSchema({
  table: 'conversations',
  includeColumns: true,
  includeIndexes: true,
  includeConstraints: true,
  includePolicies: true,
  includeStats: true,
  transport: 'pg'
});

const table = result.tables[0];
console.log(`Table: ${table.name}`);
console.log(`Exists: ${table.exists}`);
console.log(`Rows: ${table.rowCount}`);
console.log(`Size: ${table.sizeBytes} bytes`);

table.columns.forEach(col => {
  console.log(`  ${col.name} (${col.type}) ${col.nullable ? 'NULL' : 'NOT NULL'}`);
});
```

### Execute DDL

```typescript
const { agentExecuteDDL } = require('supa-agent-ops');

// Always use dry-run first!
const dryRun = await agentExecuteDDL({
  sql: `
    CREATE TABLE test_table (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  dryRun: true,
  transport: 'pg'
});

if (dryRun.success) {
  // Execute for real
  const result = await agentExecuteDDL({
    sql: dryRun.sql,  // Use same SQL from dry-run
    transport: 'pg'
  });
}
```

### Manage Indexes

```typescript
const { agentManageIndex } = require('supa-agent-ops');

// List indexes
const list = await agentManageIndex({
  operation: 'list',
  table: 'conversations',
  transport: 'pg'
});

// Create index (CONCURRENTLY for production)
const create = await agentManageIndex({
  operation: 'create',
  table: 'conversations',
  indexName: 'idx_conversations_status',
  columns: ['status'],
  concurrent: true,  // Non-blocking
  transport: 'pg'
});

// Drop index
const drop = await agentManageIndex({
  operation: 'drop',
  indexName: 'idx_conversations_old',
  transport: 'pg'
});
```

### Parameters (Introspect)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `table` | `string` | - | Table name |
| `includeColumns` | `boolean` | `true` | Include column details |
| `includeIndexes` | `boolean` | `true` | Include indexes |
| `includeConstraints` | `boolean` | `true` | Include constraints |
| `includePolicies` | `boolean` | `false` | Include RLS policies |
| `includeStats` | `boolean` | `false` | Include row count, size |
| `transport` | `'supabase' \| 'pg'` | `'pg'` | Transport method |

### Parameters (DDL)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sql` | `string` | - | DDL statement |
| `dryRun` | `boolean` | `false` | Validate without executing |
| `transport` | `'supabase' \| 'pg'` | `'pg'` | Transport method |

### Parameters (Index)

| Parameter | Type | Description |
|-----------|------|-------------|
| `operation` | `'list' \| 'create' \| 'drop'` | Index operation |
| `table` | `string` | Table name (for list/create) |
| `indexName` | `string` | Index name (for create/drop) |
| `columns` | `string[]` | Columns to index (for create) |
| `unique` | `boolean` | Unique constraint (for create) |
| `concurrent` | `boolean` | Non-blocking creation (for create) |
| `indexType` | `'btree' \| 'hash' \| 'gin' \| 'gist'` | Index type (for create) |
| `transport` | `'supabase' \| 'pg'` | Transport method |

---

## RPC Operations

**Functions:** `agentExecuteRPC()`, `agentExecuteSQL()`

### Execute RPC Function

```typescript
const { agentExecuteRPC } = require('supa-agent-ops');

const result = await agentExecuteRPC({
  functionName: 'get_user_stats',
  params: { user_id: '123' },
  timeout: 5000  // 5 seconds
});

console.log(result.data);  // Function return value
console.log(result.rowCount);
```

### Execute Raw SQL (via RPC)

```typescript
const { agentExecuteSQL } = require('supa-agent-ops');

const result = await agentExecuteSQL({
  sql: `
    SELECT persona, COUNT(*) as count
    FROM conversations
    WHERE status = 'approved'
    GROUP BY persona
    ORDER BY count DESC;
  `,
  transport: 'rpc'  // Uses exec_sql() RPC function
});

console.log(result.rows);
```

### Execute Raw SQL (via pg)

```typescript
const result = await agentExecuteSQL({
  sql: `
    UPDATE conversations
    SET status = 'approved'
    WHERE tier = 'template' AND status = 'pending';
  `,
  transport: 'pg',
  useTransaction: true  // Wrap in BEGIN/COMMIT
});

console.log(result.affectedRows);
```

### Parameters (RPC)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `functionName` | `string` | - | RPC function name |
| `params` | `Record<string, any>` | `{}` | Function parameters |
| `timeout` | `number` | `30000` | Timeout in milliseconds |

### Parameters (SQL)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sql` | `string` | - | SQL statement(s) |
| `transport` | `'rpc' \| 'pg'` | `'pg'` | Execution method |
| `useTransaction` | `boolean` | `true` | Wrap in transaction |
| `dryRun` | `boolean` | `false` | Validate without executing |

---

## Maintenance Operations

**Functions:** `agentVacuum()`, `agentAnalyze()`, `agentReindex()`

### VACUUM

Reclaims storage from dead tuples.

```typescript
const { agentVacuum } = require('supa-agent-ops');

// VACUUM with ANALYZE (recommended)
const result = await agentVacuum({
  table: 'conversations',
  analyze: true
});

// VACUUM FULL (locks table - maintenance window only!)
const fullVacuum = await agentVacuum({
  table: 'conversations',
  full: true,
  dryRun: true  // Always preview first
});

// VACUUM all tables
const allTables = await agentVacuum({
  analyze: true
});
```

### ANALYZE

Updates table statistics for query planner.

```typescript
const { agentAnalyze } = require('supa-agent-ops');

// ANALYZE entire table
const result = await agentAnalyze({
  table: 'conversations'
});

// ANALYZE specific columns (faster)
const columns = await agentAnalyze({
  table: 'conversations',
  columns: ['persona', 'status', 'tier']
});

// ANALYZE all tables
const all = await agentAnalyze({});
```

### REINDEX

Rebuilds indexes to fix corruption or bloat.

```typescript
const { agentReindex } = require('supa-agent-ops');

// REINDEX table (CONCURRENTLY - non-blocking)
const result = await agentReindex({
  target: 'table',
  name: 'conversations',
  concurrent: true  // Safe for production
});

// REINDEX specific index
const indexReindex = await agentReindex({
  target: 'index',
  name: 'idx_conversations_persona',
  concurrent: true
});

// REINDEX schema (maintenance window)
const schema = await agentReindex({
  target: 'schema',
  name: 'public'
});
```

### Parameters (VACUUM)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `table` | `string` | - | Table to vacuum (omit for all) |
| `full` | `boolean` | `false` | VACUUM FULL (locks table!) |
| `analyze` | `boolean` | `false` | Run ANALYZE after VACUUM |
| `dryRun` | `boolean` | `false` | Preview without executing |

### Parameters (ANALYZE)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `table` | `string` | - | Table to analyze (omit for all) |
| `columns` | `string[]` | - | Specific columns (faster) |

### Parameters (REINDEX)

| Parameter | Type | Description |
|-----------|------|-------------|
| `target` | `'table' \| 'index' \| 'schema'` | Target type |
| `name` | `string` | Name of table/index/schema |
| `concurrent` | `boolean` | Non-blocking (PostgreSQL 12+) |

---

## Verification Operations

**Functions:** `agentVerifyTable()`, `agentAnalyzeIndexUsage()`, `agentAnalyzeTableBloat()`

### Verify Table Structure

```typescript
const { agentVerifyTable } = require('supa-agent-ops');

const result = await agentVerifyTable({
  table: 'conversations',
  expectedColumns: [
    { name: 'id', type: 'uuid', required: true },
    { name: 'persona', type: 'text', required: true },
    { name: 'parameters', type: 'jsonb' },
    { name: 'status', type: 'text', required: true },
    { name: 'tier', type: 'text', required: true }
  ],
  expectedIndexes: [
    'idx_conversations_persona',
    'idx_conversations_status'
  ],
  expectedConstraints: [
    {
      name: 'conversations_pkey',
      type: 'PRIMARY KEY',
      columns: ['id']
    }
  ],
  generateFixSQL: true
});

console.log('Category:', result.category);  // 1=OK, 2=Warning, 3=Critical, 4=Blocking
console.log('Can Proceed:', result.canProceed);

if (result.fixSQL) {
  console.log('Fix SQL:', result.fixSQL);
}
```

### Severity Categories

| Category | Description | canProceed | Action |
|----------|-------------|------------|--------|
| 1 (OK) | No issues | ✅ Yes | Proceed |
| 2 (Warning) | Minor issues | ✅ Yes | Review warnings |
| 3 (Critical) | Serious issues | ❌ No | Apply fixes |
| 4 (Blocking) | Cannot proceed | ❌ No | Critical fixes required |

### Analyze Index Usage

```typescript
const { agentAnalyzeIndexUsage } = require('supa-agent-ops');

// Find unused/underutilized indexes
const result = await agentAnalyzeIndexUsage({
  table: 'conversations',
  minScans: 100  // Indexes with < 100 scans
});

console.log('Recommendations:', result.recommendations);

result.indexes.forEach(idx => {
  if (idx.unused) {
    console.log(`Unused index: ${idx.indexName} (${idx.sizeBytes} bytes)`);
  }
});
```

### Analyze Table Bloat

```typescript
const { agentAnalyzeTableBloat } = require('supa-agent-ops');

const result = await agentAnalyzeTableBloat('conversations');

console.log(result.summary);
// "Table conversations size: 256 MB (12.5% of database)"
```

---

## Error Handling

### Error Codes

| Code | Description | Automatable | Action |
|------|-------------|-------------|--------|
| `ERR_DB_UNIQUE_VIOLATION` | Duplicate key | ✅ Yes | Retry with `mode: 'upsert'` |
| `ERR_DB_FK_VIOLATION` | Foreign key violation | ❌ No | Import parent tables first |
| `ERR_DB_NOT_NULL_VIOLATION` | NOT NULL constraint | ❌ No | Populate required fields |
| `ERR_DB_CHECK_VIOLATION` | CHECK constraint | ❌ No | Fix data to match constraint |
| `ERR_DB_TABLE_NOT_FOUND` | Table doesn't exist | ❌ No | Create table or fix name |
| `ERR_DB_COLUMN_NOT_FOUND` | Column doesn't exist | ❌ No | Fix column names |
| `ERR_CAST_INVALID_INPUT` | Type casting failed | ❌ No | Fix data types |
| `ERR_CAST_JSONB` | Invalid JSONB | ❌ No | Fix JSON structure |
| `ERR_CHAR_INVALID_UTF8` | Invalid UTF-8 | ✅ Yes | Enable `sanitize: true` |
| `ERR_CHAR_CONTROL` | Control characters | ✅ Yes | Enable `sanitize: true` |
| `ERR_AUTH_RLS_DENIED` | RLS policy denied | ❌ No | Use SERVICE ROLE key |
| `ERR_AUTH_INVALID_KEY` | Invalid auth key | ❌ No | Check env variables |
| `ERR_VALIDATION_SCHEMA` | Schema mismatch | ❌ No | Fix data structure |
| `ERR_VALIDATION_REQUIRED` | Required field missing | ❌ No | Add required fields |
| `ERR_FATAL` | Unknown error | ❌ No | Review error details |

### Analyzing Errors

```typescript
const result = await agentImportTool({ ... });

if (!result.success) {
  const { analyzeImportErrors } = require('supa-agent-ops');
  const analysis = await analyzeImportErrors(result);
  
  analysis.recoverySteps.forEach(step => {
    console.log(`[${step.priority}] ${step.description}`);
    console.log(`Affected: ${step.affectedCount} records`);
    
    if (step.automatable) {
      console.log('✅ Auto-fixable');
      console.log(`Example: ${step.example}`);
    }
  });
}
```

### NextActions Pattern

Every result includes `nextActions`:

```typescript
result.nextActions.forEach(action => {
  console.log(`[${action.priority}] ${action.action}`);
  console.log(`  ${action.description}`);
  if (action.example) {
    console.log(`  Example: ${action.example}`);
  }
});
```

---

## Usage Patterns by Agent Type

### 1. Cloud Agent (OpenAI, Anthropic)

**Context:** Remote execution, token limits, async operations

**Pattern:**
```typescript
// Minimal context, maximum efficiency
const { agentImportTool, agentQuery, agentExportData } = require('supa-agent-ops');

// Import
await agentImportTool({
  source: data,
  table: 'conversations',
  mode: 'upsert',
  onConflict: 'id'
});

// Query
const result = await agentQuery({
  table: 'conversations',
  where: [{ column: 'status', operator: 'eq', value: 'approved' }],
  limit: 100
});

// Export
await agentExportData({
  table: 'conversations',
  destination: './export.jsonl',
  config: { format: 'jsonl', includeMetadata: false }
});
```

**Key Points:**
- Use default values where possible
- Minimize parameters
- Check `result.success` and `nextActions`
- Use error analysis only when needed

### 2. Local Agent (Interactive Mode)

**Context:** User interaction, step-by-step guidance

**Pattern:**
```typescript
const saol = require('supa-agent-ops');

// Step 1: Preflight
const preflight = await saol.agentPreflight({ table: 'conversations' });
if (!preflight.ok) {
  console.log('Issues:', preflight.issues);
  return;
}

// Step 2: Dry-run
const dryRun = await saol.agentImportTool({
  source: './data.ndjson',
  table: 'conversations',
  dryRun: true
});

if (!dryRun.success) {
  console.log('Validation failed:', dryRun.summary);
  return;
}

// Step 3: Execute
const result = await saol.agentImportTool({
  source: './data.ndjson',
  table: 'conversations',
  mode: 'upsert',
  onConflict: 'id'
});

// Step 4: Report
console.log(result.summary);
console.log(`Reports: ${result.reportPaths.summary}`);
```

**Key Points:**
- Verbose output for user feedback
- Progressive validation (preflight → dry-run → execute)
- Show report paths

### 3. Terminal Mode (Cursor, Claude Code)

**Context:** CLI execution, script-based

**Pattern:**
```bash
# Quick one-liner
node -e "
const saol = require('supa-agent-ops');
(async () => {
  const r = await saol.agentImportTool({
    source: './data.ndjson',
    table: 'conversations',
    mode: 'upsert',
    onConflict: 'id'
  });
  console.log(r.summary);
})();
"
```

**Or script file:**
```javascript
#!/usr/bin/env node
const saol = require('supa-agent-ops');

(async () => {
  const result = await saol.agentImportTool({
    source: process.argv[2],
    table: process.argv[3],
    mode: 'upsert',
    onConflict: 'id'
  });
  
  console.log(result.summary);
  process.exit(result.success ? 0 : 1);
})();
```

**Key Points:**
- Exit codes (0 = success, 1 = failure)
- Command-line arguments
- Concise output

### 4. Multi-Agent Workflow

**Context:** Agent coordination, pipeline processing

**Pattern:**
```typescript
// Agent 1: Data preparation
async function prepareData() {
  const result = await agentQuery({
    table: 'raw_data',
    where: [{ column: 'processed', operator: 'eq', value: false }]
  });
  return result.data;
}

// Agent 2: Data transformation
async function transformData(records) {
  return records.map(r => ({
    ...r,
    processed: true,
    transformed_at: new Date().toISOString()
  }));
}

// Agent 3: Data import
async function importData(records) {
  return await agentImportTool({
    source: records,
    table: 'processed_data',
    mode: 'upsert',
    onConflict: 'id'
  });
}

// Orchestration
const raw = await prepareData();
const transformed = await transformData(raw);
const result = await importData(transformed);
```

**Key Points:**
- Pass data between agents (arrays, not files)
- Check `success` at each stage
- Fail fast on errors
- Use `nextActions` for recovery

---

## Quick Reference Tables

### Function Summary

| Category | Function | Purpose | Key Params |
|----------|----------|---------|------------|
| **Import** | `agentImportTool` | Insert/upsert data | `source`, `table`, `mode` |
| **Import** | `analyzeImportErrors` | Error analysis | `result` |
| **Preflight** | `agentPreflight` | Validate config | `table`, `mode` |
| **Query** | `agentQuery` | SELECT with filters | `table`, `where`, `limit` |
| **Query** | `agentCount` | Count records | `table`, `where` |
| **Export** | `agentExportData` | Export to file | `table`, `destination`, `config.format` |
| **Delete** | `agentDelete` | Safe delete | `table`, `where`, `confirm` |
| **Schema** | `agentIntrospectSchema` | Query structure | `table`, `includeColumns` |
| **Schema** | `agentExecuteDDL` | CREATE/ALTER/DROP | `sql`, `dryRun` |
| **Schema** | `agentManageIndex` | Manage indexes | `operation`, `table` |
| **RPC** | `agentExecuteRPC` | Call function | `functionName`, `params` |
| **RPC** | `agentExecuteSQL` | Raw SQL | `sql`, `transport` |
| **Maintenance** | `agentVacuum` | Reclaim storage | `table`, `analyze` |
| **Maintenance** | `agentAnalyze` | Update stats | `table`, `columns` |
| **Maintenance** | `agentReindex` | Rebuild indexes | `target`, `name` |
| **Verify** | `agentVerifyTable` | Check structure | `table`, `expectedColumns` |
| **Verify** | `agentAnalyzeIndexUsage` | Index usage | `table`, `minScans` |
| **Verify** | `agentAnalyzeTableBloat` | Table bloat | `table` |

### Common Parameters

| Parameter | Type | Default | Used In |
|-----------|------|---------|---------|
| `table` | `string` | - | Most functions |
| `source` | `string \| array` | - | Import |
| `destination` | `string` | - | Export |
| `where` | `QueryFilter[]` | `[]` | Query, Delete, Export |
| `mode` | `'insert' \| 'upsert'` | `'insert'` | Import |
| `onConflict` | `string \| string[]` | Auto | Import |
| `dryRun` | `boolean` | `false` | Import, Delete, DDL, Vacuum |
| `confirm` | `boolean` | `false` | Delete |
| `transport` | `'supabase' \| 'pg' \| 'auto'` | `'auto'` | Schema, RPC |
| `limit` | `number` | - | Query, Export |
| `offset` | `number` | `0` | Query |
| `orderBy` | `OrderSpec[]` | `[]` | Query, Export |

### Priority Levels

| Priority | When Used | Action |
|----------|-----------|--------|
| `HIGH` | Critical issues, >50% records affected | Fix immediately |
| `MEDIUM` | Significant issues, >5 records affected | Review and fix |
| `LOW` | Minor issues, recommendations | Optional |

---

## Common Pitfalls & Solutions

### 1. Manual String Escaping

**❌ DON'T:**
```typescript
const text = "don't panic";
const escaped = text.replace(/'/g, "''");  // Manual escaping
```

**✅ DO:**
```typescript
// Library handles escaping automatically
await agentImportTool({
  source: [{ text: "don't panic" }],
  table: 'messages'
});
```

### 2. Using Anon Key Instead of Service Role

**❌ DON'T:**
```bash
export SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...anon  # Wrong key!
```

**✅ DO:**
```bash
export SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...service_role  # Service role
```

**How to tell:**
- Service role keys are typically longer
- Check your Supabase project settings → API

### 3. Forgetting Preflight Checks

**❌ DON'T:**
```typescript
// Import without checking
await agentImportTool({ ... });
```

**✅ DO:**
```typescript
// Always preflight first
const check = await agentPreflight({ table: 'conversations' });
if (!check.ok) {
  console.log('Issues:', check.issues);
  return;
}
await agentImportTool({ ... });
```

### 4. No WHERE Clause in Delete

**❌ DON'T:**
```typescript
// This will fail (safety feature)
await agentDelete({ 
  table: 'conversations', 
  where: [], 
  confirm: true 
});
```

**✅ DO:**
```typescript
await agentDelete({ 
  table: 'conversations', 
  where: [{ column: 'status', operator: 'eq', value: 'draft' }], 
  confirm: true 
});
```

### 5. Not Using Dry-Run

**❌ DON'T:**
```typescript
// Execute without preview
await agentDelete({ table: 'conversations', where: [...], confirm: true });
```

**✅ DO:**
```typescript
// Preview first
const preview = await agentDelete({ 
  table: 'conversations', 
  where: [...], 
  dryRun: true 
});
console.log(`Will delete: ${preview.previewRecords.length}`);

// Then execute
await agentDelete({ 
  table: 'conversations', 
  where: [...], 
  confirm: true 
});
```

### 6. Ignoring nextActions

**❌ DON'T:**
```typescript
const result = await agentImportTool({ ... });
if (!result.success) {
  console.log('Failed');  // No context
}
```

**✅ DO:**
```typescript
const result = await agentImportTool({ ... });
if (!result.success) {
  result.nextActions.forEach(action => {
    console.log(`[${action.priority}] ${action.description}`);
    if (action.example) console.log(`  ${action.example}`);
  });
}
```

### 7. Not Handling Automatable Errors

**❌ DON'T:**
```typescript
const result = await agentImportTool({ ... });
if (!result.success) {
  throw new Error('Failed');  // Give up
}
```

**✅ DO:**
```typescript
let result = await agentImportTool({ ... });
if (!result.success) {
  const analysis = await analyzeImportErrors(result);
  
  // Check for unique violations (automatable)
  const canRetry = analysis.recoverySteps.some(
    s => s.errorCode === 'ERR_DB_UNIQUE_VIOLATION' && s.automatable
  );
  
  if (canRetry) {
    result = await agentImportTool({ 
      ...params, 
      mode: 'upsert', 
      onConflict: 'id' 
    });
  }
}
```

### 8. Wrong Transport for Operation

**❌ DON'T:**
```typescript
// Schema operations need 'pg' transport
await agentIntrospectSchema({ 
  table: 'conversations', 
  transport: 'supabase'  // Won't work for introspection
});
```

**✅ DO:**
```typescript
await agentIntrospectSchema({ 
  table: 'conversations', 
  transport: 'pg'  // Correct transport
});
```

**Rule of thumb:**
- Import/Query/Export: `supabase` (default)
- Schema/DDL/Maintenance: `pg`
- RPC: `rpc` or `supabase`

### 9. VACUUM FULL in Production

**❌ DON'T:**
```typescript
// VACUUM FULL locks the table!
await agentVacuum({ 
  table: 'conversations', 
  full: true 
});
```

**✅ DO:**
```typescript
// Regular VACUUM (non-blocking)
await agentVacuum({ 
  table: 'conversations', 
  analyze: true 
});

// Or VACUUM FULL during maintenance window
await agentVacuum({ 
  table: 'conversations', 
  full: true, 
  dryRun: true  // Preview first
});
```

### 10. Not Checking Environment Variables

**❌ DON'T:**
```typescript
// Assume environment is set
const result = await agentImportTool({ ... });
```

**✅ DO:**
```typescript
// Check environment first
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Environment variables not set');
}

// Or use preflight
const check = await agentPreflight({ table: 'conversations' });
if (!check.ok) {
  console.log('Environment issues:', check.issues);
  return;
}
```

---

## Additional Resources

**Full Documentation Paths:**
- **Quick Start:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\QUICK_START.md`
- **Examples:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\EXAMPLES.md`
- **Error Codes:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\ERROR_CODES.md`
- **Schema Guide:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\SCHEMA_OPERATIONS_GUIDE.md`
- **Maintenance Guide:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\MAINTENANCE_GUIDE.md`
- **Implementation Summary:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\IMPLEMENTATION_SUMMARY.md`

---

## Version History

- **v1.3.0** (Current): Maintenance, verification, performance monitoring
- **v1.2.0**: Query, export, delete operations
- **v1.1.0**: Schema operations, DDL, RPC
- **v1.0.0**: Initial release (import/upsert)

---

**Last Updated:** November 12, 2025  
**Maintainer:** Supabase Agent Ops Team  
**License:** MIT

---

# APPENDIX 1: Quick Start Reference

For agents needing immediate context, refer to these sections:
- **Basic import/upsert:** Lines 110-208
- **Query operations:** Lines 210-283
- **Error handling:** Lines 760-838
- **Quick reference tables:** Lines 920-1008

---

# APPENDIX 2: Inclusion Block for Coding Prompts

**Copy-paste this block into all coding prompts where Supabase operations are needed:**

```markdown
## Supabase Database Operations

For ALL Supabase operations (CRUD, schema, maintenance), use the **Supabase Agent Ops Library (SAOL)**.

**Library:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`

**Quick Reference:**
```typescript
const saol = require('supa-agent-ops');

// Import/Upsert: await saol.agentImportTool({ source, table, mode: 'upsert', onConflict: 'id' });
// Query: await saol.agentQuery({ table, where: [...], limit: 100 });
// Export: await saol.agentExportData({ table, destination, config: { format: 'jsonl' } });
// Delete: await saol.agentDelete({ table, where: [...], confirm: true });
// Schema: await saol.agentIntrospectSchema({ table, transport: 'pg' });
```

**Full Manual:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\saol-agent-manual_v2.md` (use TOC line numbers for direct access)

**Critical Rules:**
1. Never manually escape strings
2. Always use SERVICE_ROLE_KEY (not anon key)
3. Run preflight checks: `agentPreflight({ table })`
4. Use dry-run for destructive operations
5. Check `result.success` and follow `nextActions`
```

**Environment Setup:**
```bash
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
