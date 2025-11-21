# Supabase Agent Ops Library

> **Production-grade, agent-first TypeScript/JavaScript library for Supabase operations with comprehensive error handling, special character safety, and intelligent failure reporting.**

**Version 1.3** adds maintenance operations, table verification, and performance monitoring.

## What's New in v1.3 🎉

🔧 **Maintenance Operations**
- VACUUM operations to reclaim storage space
- ANALYZE operations to update query planner statistics
- REINDEX operations with CONCURRENTLY support for non-blocking rebuilds
- Dry-run mode for safe preview of maintenance operations

✅ **Table Verification**
- Validate table structure against expected schema
- Detect missing columns, indexes, and constraints
- Automatic fix SQL generation
- Severity categorization (OK, Warning, Critical, Blocking)

📊 **Performance Monitoring**
- Index usage analysis to identify unused indexes
- Table bloat analysis for optimization recommendations
- Query pg_stat_user_indexes for usage statistics
- Actionable recommendations for database optimization

See [Maintenance Guide](./MAINTENANCE_GUIDE.md) for complete guide.

## What's New in v1.2 🎉

🔍 **Advanced Query Operations**
- Complex filtering with 9 operators (eq, neq, gt, gte, lt, lte, like, in, is)
- Ordering, pagination, and aggregations (SUM, AVG, COUNT, MIN, MAX)
- Optimized count queries with filtering

📤 **Multi-Format Export**
- JSONL format (OpenAI/Anthropic training compatible)
- JSON format (structured with metadata)
- CSV format (Excel-compatible with UTF-8 BOM)
- Markdown format (human-readable reports)

🛡️ **Safe Delete Operations**
- Dry-run mode to preview deletions
- Mandatory WHERE clause (prevents accidental full table deletes)
- Explicit confirmation required
- Automatic backup suggestions

See [Quick Start v1.2](./QUICK_START_V1.2.md) for complete guide.

### Quick Examples (v1.3)

```typescript
import { 
  agentVacuum, 
  agentAnalyze, 
  agentVerifyTable,
  agentAnalyzeIndexUsage 
} from 'supa-agent-ops';

// VACUUM with ANALYZE to reclaim space and update statistics
await agentVacuum({ 
  table: 'conversations',
  analyze: true 
});

// Verify table structure
const verification = await agentVerifyTable({
  table: 'conversations',
  expectedColumns: [
    { name: 'id', type: 'uuid', required: true },
    { name: 'persona', type: 'text', required: true }
  ],
  generateFixSQL: true
});

if (!verification.canProceed) {
  console.log('Fix SQL:', verification.fixSQL);
}

// Analyze index usage
const indexAnalysis = await agentAnalyzeIndexUsage({ 
  table: 'conversations',
  minScans: 100 
});
console.log('Recommendations:', indexAnalysis.recommendations);
```

## Previous Features

**v1.1: Schema Operations & RPC**
- Query database structure (tables, columns, indexes, constraints, policies)
- Execute DDL statements (CREATE, ALTER, DROP) with transaction safety
- Manage indexes with concurrent creation support
- Execute custom RPC functions and raw SQL

See [Schema Operations Guide](./SCHEMA_OPERATIONS_GUIDE.md) for details.

## Quick Start

### Installation

```bash
cd supa-agent-ops
npm install
npm run build
npm link

# Use in your project
cd ../your-project
npm link supa-agent-ops
```

### Basic Usage

```typescript
const { agentImportTool, agentPreflight } = require('supa-agent-ops');

// Run preflight checks (recommended)
const preflight = await agentPreflight({ 
  table: 'conversations', 
  mode: 'upsert' 
});

if (!preflight.ok) {
  console.log('Configuration issues:', preflight.issues);
  return;
}

// Import data
const result = await agentImportTool({
  source: './data.ndjson',  // Or array of objects
  table: 'conversations',
  mode: 'upsert',
  onConflict: 'id'
});

console.log(result.summary);
// Output: Import completed for table: conversations
//         Total: 35 | Success: 35 | Failed: 0 | Duration: 2.45s
```

## Key Features

### ✅ Zero Manual Escaping
All special characters (apostrophes, quotes, emojis) are handled automatically using parameterized queries.

```typescript
// ✅ This works safely - no escaping needed
await agentImportTool({
  source: [{
    id: '1',
    parameters: { text: "don't panic", emoji: "😊" }
  }],
  table: 'conversations'
});
```

### ✅ Intelligent Error Reporting
Failed imports generate detailed reports with specific recovery steps.

```typescript
if (!result.success) {
  const analysis = await analyzeImportErrors(result);
  
  // Automatic error categorization with remediation steps
  analysis.recoverySteps.forEach(step => {
    console.log(`[${step.priority}] ${step.description}`);
    console.log(`Example: ${step.example}`);
  });
}
```

### ✅ Agent-First Design
Simple API with prescriptive guidance and no-dead-end design.

```typescript
// Preflight checks prevent wasted API calls
const preflight = await agentPreflight({ table: 'users' });

// Clear recommendations on any issues
preflight.recommendations.forEach(rec => {
  console.log(`[${rec.priority}] ${rec.description}`);
  console.log(rec.example);
});
```

### ✅ Comprehensive Character Handling
Apostrophes, quotes, newlines, emojis, and control characters - all handled safely.

```typescript
const result = await agentImportTool({
  source: [{
    text: "It's working! 😊\nNew line here"
  }],
  table: 'messages',
  sanitize: true,  // Auto-sanitization enabled by default
  normalization: 'NFC'  // Unicode normalization
});
```

## Environment Setup

Required environment variables:

```bash
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional for pg transport
export DATABASE_URL=postgresql://user:pass@host:5432/db
```

## Core Functions

### `agentImportTool(params)`
Primary import function - handles insert and upsert operations.

**Parameters:**
- `source`: File path (NDJSON/JSON) or array of records
- `table`: Target table name
- `mode`: 'insert' or 'upsert' (default: 'insert')
- `onConflict`: Column(s) for upsert conflict resolution
- `batchSize`: Records per batch (default: 200)
- `concurrency`: Parallel batches (default: 2)
- `dryRun`: Validate without writing (default: false)
- `sanitize`: Auto-sanitize characters (default: true)

### `agentPreflight(params)`
Validates environment and configuration before import.

**Parameters:**
- `table`: Target table name
- `mode`: 'insert' or 'upsert'
- `onConflict`: Column(s) for upsert

### `analyzeImportErrors(result)`
Analyzes failed imports and provides recovery steps.

## Error Handling

All database errors are mapped to specific error codes with remediation steps:

| Error Code | Description | Automatable | Remediation |
|-----------|-------------|-------------|-------------|
| `ERR_DB_UNIQUE_VIOLATION` | Duplicate key | ✅ Yes | Retry with `mode: 'upsert'` |
| `ERR_DB_FK_VIOLATION` | Foreign key violation | ❌ No | Import parent tables first |
| `ERR_CHAR_INVALID_UTF8` | Invalid UTF-8 | ✅ Yes | Enable `sanitize: true` |
| `ERR_AUTH_RLS_DENIED` | RLS policy denied | ❌ No | Use Service Role key |

See [ERROR_CODES.md](./ERROR_CODES.md) for complete reference.

## Examples

### Import from File
```typescript
const result = await agentImportTool({
  source: 'C:\\data\\conversations.ndjson',
  table: 'conversations',
  mode: 'upsert',
  onConflict: 'id'
});
```

### Import from Array
```typescript
const records = [
  { id: '1', name: "Marcus", note: "don't worry" },
  { id: '2', name: "Sarah", note: "It's fine 😊" }
];

const result = await agentImportTool({
  source: records,
  table: 'users',
  mode: 'insert'
});
```

### Dry Run Validation
```typescript
const result = await agentImportTool({
  source: './data.ndjson',
  table: 'conversations',
  dryRun: true  // Validate without writing
});

if (result.success) {
  console.log('Ready for actual import');
}
```

### Error Recovery
```typescript
const result = await agentImportTool({
  source: './data.ndjson',
  table: 'conversations'
});

if (!result.success) {
  const analysis = await analyzeImportErrors(result);
  
  // Apply automated fixes where possible
  for (const step of analysis.recoverySteps) {
    if (step.automatable) {
      console.log(`Auto-fix available: ${step.description}`);
    }
  }
}
```

## Reports

All operations generate JSON reports in the `reports/` directory:

- **Summary Report**: `import-{table}-{runId}.summary.json`
- **Error Report**: `import-{table}-{runId}.errors.json`
- **Success Report**: `import-{table}-{runId}.success.json`

## Documentation

- [API Reference](./API.md) - Complete API documentation
- [Error Codes](./ERROR_CODES.md) - Error catalog with remediation
- [Examples](./EXAMPLES.md) - Common use cases
- [Preflight Guide](./PREFLIGHT.md) - Configuration validation
- [Guardrails](./GUARDRAILS.md) - Agent safety features

## Testing

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage # Coverage report
```

## Why This Library Solves E02

The E02 problem was caused by manual SQL construction with apostrophes:

```sql
-- ❌ FAILED in E02
INSERT INTO conversations (parameters) VALUES (
  '{"text":"don't panic"}'::jsonb
);
-- ERROR: syntax error at or near "t"
```

This library solves it with parameterized queries:

```typescript
// ✅ WORKS with supa-agent-ops
await agentImportTool({
  source: [{ parameters: { text: "don't panic" } }],
  table: 'conversations'
});
// SUCCESS: Supabase client handles escaping automatically
```

## License

MIT

## Version

1.0.0

