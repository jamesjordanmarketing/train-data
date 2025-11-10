# Usage Examples

Comprehensive examples for common use cases with the Supabase Agent Ops library.

## Table of Contents

1. [Basic Import](#basic-import)
2. [Upsert Mode](#upsert-mode)
3. [Preflight Checks](#preflight-checks)
4. [Error Handling](#error-handling)
5. [Dry Run Validation](#dry-run-validation)
6. [Character Safety](#character-safety)
7. [Batch Configuration](#batch-configuration)
8. [Multiple Tables](#multiple-tables)

## Basic Import

### Import from NDJSON File

```typescript
const { agentImportTool } = require('supa-agent-ops');

const result = await agentImportTool({
  source: './data/conversations.ndjson',
  table: 'conversations'
});

console.log(result.summary);
// Output: Import completed for table: conversations
//         Total: 35 | Success: 35 | Failed: 0 | Duration: 2.45s
```

### Import from JSON Array

```typescript
const result = await agentImportTool({
  source: './data/conversations.json',  // Array of objects
  table: 'conversations'
});
```

### Import from In-Memory Array

```typescript
const conversations = [
  { id: '1', persona: 'Marcus', note: "don't worry" },
  { id: '2', persona: 'Sarah', note: "It's fine 😊" }
];

const result = await agentImportTool({
  source: conversations,
  table: 'conversations'
});
```

## Upsert Mode

### Basic Upsert

```typescript
const result = await agentImportTool({
  source: './data/users.ndjson',
  table: 'users',
  mode: 'upsert',
  onConflict: 'id'  // Primary key column
});
```

### Composite Key Upsert

```typescript
const result = await agentImportTool({
  source: './data/mappings.ndjson',
  table: 'user_roles',
  mode: 'upsert',
  onConflict: ['user_id', 'role_id']  // Composite key
});
```

### Auto-Detect Primary Key

```typescript
const result = await agentImportTool({
  source: './data/users.ndjson',
  table: 'users',
  mode: 'upsert'
  // onConflict is auto-detected
});

// Check if auto-detection was used
if (result.nextActions.some(a => a.action === 'VERIFY_ONCONFLICT')) {
  console.log('Primary key was auto-detected');
}
```

## Preflight Checks

### Run Preflight Before Import

```typescript
const { agentPreflight, agentImportTool } = require('supa-agent-ops');

// Always run preflight first
const preflight = await agentPreflight({ 
  table: 'conversations', 
  mode: 'upsert' 
});

if (!preflight.ok) {
  console.log('Configuration issues detected:');
  preflight.recommendations.forEach(rec => {
    console.log(`  [${rec.priority}] ${rec.description}`);
    if (rec.example) console.log(`    ${rec.example}`);
  });
  return;
}

// Proceed with import
const result = await agentImportTool({
  source: './data.ndjson',
  table: 'conversations',
  mode: 'upsert',
  onConflict: 'id'
});
```

### Check Multiple Tables

```typescript
const tables = ['templates', 'conversations', 'users'];

for (const table of tables) {
  const preflight = await agentPreflight({ table });
  
  if (!preflight.ok) {
    console.log(`❌ ${table}: ${preflight.issues.join(', ')}`);
  } else {
    console.log(`✅ ${table}: Ready`);
  }
}
```

## Error Handling

### Basic Error Handling

```typescript
const result = await agentImportTool({
  source: './data.ndjson',
  table: 'conversations'
});

if (!result.success) {
  console.log(`❌ Import failed`);
  console.log(`Failed: ${result.totals.failed} records`);
  console.log(`Error report: ${result.reportPaths.errors}`);
} else {
  console.log(`✅ Import successful`);
}
```

### Analyze and Recover from Errors

```typescript
const { agentImportTool, analyzeImportErrors } = require('supa-agent-ops');

const result = await agentImportTool({
  source: './data.ndjson',
  table: 'conversations'
});

if (!result.success) {
  // Analyze errors for recovery steps
  const analysis = await analyzeImportErrors(result);

  console.log('Recovery steps:');
  analysis.recoverySteps.forEach(step => {
    console.log(`\n[${step.priority}] ${step.description}`);
    console.log(`Affected records: ${step.affectedCount}`);
    
    if (step.automatable) {
      console.log('✅ Can be automatically fixed');
    }
    
    if (step.example) {
      console.log(`Example:\n${step.example}`);
    }
  });
}
```

### Automatic Retry with Upsert

```typescript
let result = await agentImportTool({
  source: './data.ndjson',
  table: 'conversations'
});

// If unique violation, retry with upsert
if (!result.success) {
  const analysis = await analyzeImportErrors(result);
  const hasUniqueViolation = analysis.recoverySteps.some(
    s => s.errorCode === 'ERR_DB_UNIQUE_VIOLATION'
  );
  
  if (hasUniqueViolation) {
    console.log('Retrying with upsert mode...');
    result = await agentImportTool({
      source: './data.ndjson',
      table: 'conversations',
      mode: 'upsert',
      onConflict: 'id'
    });
  }
}
```

## Dry Run Validation

### Validate Before Import

```typescript
// Test import without writing to database
const result = await agentImportTool({
  source: './data.ndjson',
  table: 'conversations',
  dryRun: true
});

console.log(`Validation complete: ${result.totals.total} records validated`);

if (result.success) {
  console.log('✅ All records valid, ready for actual import');
  
  // Now run actual import
  const actualResult = await agentImportTool({
    source: './data.ndjson',
    table: 'conversations'
  });
} else {
  console.log(`❌ Found ${result.totals.failed} issues`);
  console.log(`Check: ${result.reportPaths.errors}`);
}
```

## Character Safety

### Handle Apostrophes and Quotes

```typescript
const records = [
  { 
    id: '1', 
    text: "don't worry about apostrophes" 
  },
  { 
    id: '2', 
    text: 'He said "hello" with quotes' 
  },
  {
    id: '3',
    parameters: {
      note: "It's Marcus's strategy",
      dialogue: '"Don\'t panic," she said.'
    }
  }
];

const result = await agentImportTool({
  source: records,
  table: 'messages',
  sanitize: true  // Enabled by default
});

// All special characters are handled automatically
```

### Handle Emojis and Unicode

```typescript
const records = [
  { id: '1', message: 'Happy 😊😍🎉' },
  { id: '2', message: 'café résumé naïve' },
  { id: '3', message: '中文 日本語 한글' }
];

const result = await agentImportTool({
  source: records,
  table: 'messages',
  normalization: 'NFC'  // Unicode normalization
});
```

### Handle Newlines and Tabs

```typescript
const records = [
  { 
    id: '1', 
    template: 'Line 1\nLine 2\nLine 3' 
  },
  { 
    id: '2', 
    tsv: 'Col1\tCol2\tCol3' 
  },
  {
    id: '3',
    email: 'Dear {name},\n\nThank you.\n\nBest regards'
  }
];

const result = await agentImportTool({
  source: records,
  table: 'templates',
  sanitize: true  // Preserves newlines and tabs
});
```

## Batch Configuration

### Optimize for Large Datasets

```typescript
const result = await agentImportTool({
  source: './large-dataset.ndjson',
  table: 'events',
  batchSize: 500,     // Larger batches for better throughput
  concurrency: 5      // More parallel batches
});
```

### Optimize for Rate Limits

```typescript
const result = await agentImportTool({
  source: './data.ndjson',
  table: 'conversations',
  batchSize: 100,     // Smaller batches
  concurrency: 1,     // Sequential processing
  retry: {
    maxAttempts: 3,   // More retries
    backoffMs: 500    // Longer backoff
  }
});
```

## Multiple Tables

### Import with Dependencies

```typescript
// Import in dependency order
const tables = [
  { name: 'templates', file: './templates.ndjson' },
  { name: 'conversations', file: './conversations.ndjson' },
  { name: 'messages', file: './messages.ndjson' }
];

for (const { name, file } of tables) {
  console.log(`Importing ${name}...`);
  
  const result = await agentImportTool({
    source: file,
    table: name,
    mode: 'upsert',
    onConflict: 'id'
  });
  
  if (!result.success) {
    console.error(`❌ ${name} failed: ${result.totals.failed} errors`);
    break;  // Stop on first failure
  }
  
  console.log(`✅ ${name}: ${result.totals.success} records`);
}
```

### Parallel Import (Independent Tables)

```typescript
const imports = [
  agentImportTool({ source: './users.ndjson', table: 'users' }),
  agentImportTool({ source: './products.ndjson', table: 'products' }),
  agentImportTool({ source: './categories.ndjson', table: 'categories' })
];

const results = await Promise.all(imports);

results.forEach((result, i) => {
  const table = ['users', 'products', 'categories'][i];
  console.log(`${table}: ${result.success ? '✅' : '❌'} ${result.summary}`);
});
```

## Advanced Usage

### Custom Transport (PostgreSQL Direct)

```typescript
const result = await agentImportTool({
  source: './data.ndjson',
  table: 'conversations',
  transport: 'pg'  // Use pg client instead of Supabase
});
```

### Schema Validation

```typescript
const { createValidator } = require('supa-agent-ops');

const schema = {
  required: ['id', 'name', 'email'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    age: { type: 'number' }
  }
};

const validator = createValidator(schema);

const result = await agentImportTool({
  source: './users.ndjson',
  table: 'users',
  schema: validator
});
```

### Generate SQL for Manual Execution

```typescript
const { generateDollarQuotedInsert } = require('supa-agent-ops');

const record = {
  id: '1',
  persona: "Marcus - The Overwhelmed Avoider",
  parameters: {
    note: "don't panic",
    emoji: "😊"
  }
};

const sql = generateDollarQuotedInsert('conversations', record);
console.log(sql);

// Output:
// INSERT INTO conversations (id, persona, parameters) VALUES (
//   $$1$$,
//   $$Marcus - The Overwhelmed Avoider$$,
//   $${"note":"don't panic","emoji":"😊"}$$::jsonb
// );
```

## See Also

- [README.md](./README.md) - Quick start guide
- [API.md](./API.md) - Complete API reference
- [ERROR_CODES.md](./ERROR_CODES.md) - Error reference

