# Quick Start Guide - SAOL v1.2.0

## Supabase Agent Ops Library - Query, Export & Delete Operations

### Installation

```bash
npm install supa-agent-ops
```

### Setup

Create a `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

---

## Query Operations

### Basic Query

```typescript
import { agentQuery } from 'supa-agent-ops';

const result = await agentQuery({
  table: 'conversations',
  where: [
    { column: 'status', operator: 'eq', value: 'approved' }
  ],
  limit: 10
});

console.log(`Retrieved ${result.data.length} records`);
```

### Query with Ordering & Pagination

```typescript
const result = await agentQuery({
  table: 'conversations',
  where: [
    { column: 'tier', operator: 'eq', value: 'template' }
  ],
  orderBy: [
    { column: 'created_at', asc: false }
  ],
  limit: 50,
  offset: 100,
  count: true // Get total count
});

console.log(`Page records: ${result.data.length}`);
console.log(`Total records: ${result.count}`);
```

### Query Operators

Available operators:
- `eq` - Equals
- `neq` - Not equals
- `gt` - Greater than
- `gte` - Greater than or equal
- `lt` - Less than
- `lte` - Less than or equal
- `like` - Pattern matching
- `in` - In array
- `is` - Is null/not null

Example with multiple operators:

```typescript
const result = await agentQuery({
  table: 'conversations',
  where: [
    { column: 'status', operator: 'eq', value: 'approved' },
    { column: 'created_at', operator: 'gte', value: '2024-01-01' },
    { column: 'tier', operator: 'in', value: ['template', 'premium'] }
  ]
});
```

### Count Query

```typescript
import { agentCount } from 'supa-agent-ops';

const result = await agentCount({
  table: 'conversations',
  where: [
    { column: 'status', operator: 'eq', value: 'approved' }
  ]
});

console.log(`Total approved: ${result.count}`);
```

### Query with Aggregations

```typescript
const result = await agentQuery({
  table: 'conversations',
  aggregate: [
    { function: 'COUNT', column: 'id', alias: 'total' },
    { function: 'AVG', column: 'rating', alias: 'avg_rating' },
    { function: 'MAX', column: 'created_at', alias: 'latest' }
  ]
});

console.log(result.aggregates);
// { total: 150, avg_rating: 4.5, latest: '2024-01-15' }
```

---

## Export Operations

### Export to JSONL (Training Format)

Perfect for OpenAI/Anthropic fine-tuning:

```typescript
import { agentExportData } from 'supa-agent-ops';

const result = await agentExportData({
  table: 'conversations',
  destination: './training-data.jsonl',
  config: {
    format: 'jsonl',
    includeMetadata: false,
    includeTimestamps: false
  },
  filters: [
    { column: 'status', operator: 'eq', value: 'approved' }
  ]
});

console.log(`Exported ${result.recordCount} records`);
console.log(`File: ${result.filePath}`);
```

**JSONL Format:**
```jsonl
{"role":"user","content":"What is AI?"}
{"role":"assistant","content":"AI stands for..."}
```

### Export to JSON (Structured)

```typescript
const result = await agentExportData({
  table: 'conversations',
  destination: './export.json',
  config: {
    format: 'json',
    includeMetadata: true,
    includeTimestamps: true
  }
});
```

**JSON Format:**
```json
{
  "version": "1.0",
  "export_date": "2024-01-15T10:30:00Z",
  "count": 150,
  "data": [
    { "id": "1", "status": "approved", ... },
    { "id": "2", "status": "approved", ... }
  ]
}
```

### Export to CSV (Excel-Compatible)

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

**Features:**
- ✅ UTF-8 BOM for Excel compatibility
- ✅ Proper quote escaping
- ✅ Handles special characters
- ✅ Nested objects converted to JSON strings

### Export to Markdown (Human-Readable)

```typescript
const result = await agentExportData({
  table: 'conversations',
  destination: './report.md',
  config: {
    format: 'markdown',
    includeMetadata: true,
    includeTimestamps: false
  }
});
```

### Export with Column Selection

```typescript
const result = await agentExportData({
  table: 'conversations',
  destination: './export.json',
  config: { format: 'json', includeMetadata: true, includeTimestamps: true },
  columns: ['id', 'status', 'tier', 'created_at'], // Only these columns
  filters: [
    { column: 'status', operator: 'eq', value: 'approved' }
  ]
});
```

---

## Delete Operations

### 🛡️ Safety Features

1. **Mandatory WHERE clause** - Prevents accidental full table deletion
2. **Explicit confirmation** - Must set `confirm: true`
3. **Dry-run mode** - Preview before executing
4. **Backup suggestions** - Automatic recommendations

### Step 1: Dry-Run (Preview)

**Always start with a dry-run:**

```typescript
import { agentDelete } from 'supa-agent-ops';

const dryRun = await agentDelete({
  table: 'conversations',
  where: [
    { column: 'status', operator: 'eq', value: 'draft' }
  ],
  dryRun: true
});

console.log(`Would delete ${dryRun.previewRecords?.length} records`);

// Review the records
dryRun.previewRecords?.forEach(record => {
  console.log(`- ID: ${record.id}, Status: ${record.status}`);
});

// Check suggestions
dryRun.nextActions.forEach(action => {
  console.log(`${action.priority}: ${action.description}`);
});
```

### Step 2: Backup Before Delete

```typescript
// Export records before deleting
const backup = await agentExportData({
  table: 'conversations',
  destination: './backup-before-delete.json',
  config: { format: 'json', includeMetadata: true, includeTimestamps: true },
  filters: [
    { column: 'status', operator: 'eq', value: 'draft' }
  ]
});

console.log(`Backed up ${backup.recordCount} records`);
```

### Step 3: Execute Delete

```typescript
const result = await agentDelete({
  table: 'conversations',
  where: [
    { column: 'status', operator: 'eq', value: 'draft' }
  ],
  confirm: true // Required!
});

console.log(`Deleted ${result.deletedCount} records`);
```

### Delete with Multiple Conditions

```typescript
const result = await agentDelete({
  table: 'conversations',
  where: [
    { column: 'status', operator: 'eq', value: 'test' },
    { column: 'created_at', operator: 'lt', value: '2023-01-01' }
  ],
  confirm: true
});
```

### Safety Checks

```typescript
// ❌ This will fail - no WHERE clause
await agentDelete({
  table: 'conversations',
  where: [],
  confirm: true
});
// Error: WHERE clause required for delete operations (safety measure)

// ❌ This will fail - no confirmation
await agentDelete({
  table: 'conversations',
  where: [{ column: 'id', operator: 'eq', value: '123' }]
});
// Error: confirm: true required to execute delete (safety measure)

// ✅ This works - proper safety checks
await agentDelete({
  table: 'conversations',
  where: [{ column: 'id', operator: 'eq', value: '123' }],
  confirm: true
});
```

---

## Complete Workflow Example

### Query → Export → Delete Pattern

```typescript
import { agentQuery, agentExportData, agentDelete, agentCount } from 'supa-agent-ops';

async function cleanupOldRecords() {
  // Step 1: Query records to identify
  console.log('Step 1: Querying old records...');
  const oldRecords = await agentQuery({
    table: 'conversations',
    where: [
      { column: 'status', operator: 'eq', value: 'draft' },
      { column: 'created_at', operator: 'lt', value: '2023-01-01' }
    ],
    count: true
  });
  
  console.log(`Found ${oldRecords.count} old draft records`);
  
  if (oldRecords.count === 0) {
    console.log('No records to clean up');
    return;
  }

  // Step 2: Export for backup
  console.log('Step 2: Backing up records...');
  const backup = await agentExportData({
    table: 'conversations',
    destination: './backups/old-drafts.json',
    config: { 
      format: 'json',
      includeMetadata: true,
      includeTimestamps: true
    },
    filters: [
      { column: 'status', operator: 'eq', value: 'draft' },
      { column: 'created_at', operator: 'lt', value: '2023-01-01' }
    ]
  });
  
  console.log(`Backed up ${backup.recordCount} records to ${backup.filePath}`);

  // Step 3: Dry-run delete
  console.log('Step 3: Preview deletion...');
  const preview = await agentDelete({
    table: 'conversations',
    where: [
      { column: 'status', operator: 'eq', value: 'draft' },
      { column: 'created_at', operator: 'lt', value: '2023-01-01' }
    ],
    dryRun: true
  });
  
  console.log(`Would delete ${preview.previewRecords?.length} records`);

  // Step 4: Execute delete
  console.log('Step 4: Executing deletion...');
  const deleteResult = await agentDelete({
    table: 'conversations',
    where: [
      { column: 'status', operator: 'eq', value: 'draft' },
      { column: 'created_at', operator: 'lt', value: '2023-01-01' }
    ],
    confirm: true
  });
  
  console.log(`Deleted ${deleteResult.deletedCount} records`);

  // Step 5: Verify deletion
  console.log('Step 5: Verifying deletion...');
  const verifyCount = await agentCount({
    table: 'conversations',
    where: [
      { column: 'status', operator: 'eq', value: 'draft' },
      { column: 'created_at', operator: 'lt', value: '2023-01-01' }
    ]
  });
  
  console.log(`Remaining old drafts: ${verifyCount.count}`);
  console.log('✅ Cleanup completed successfully!');
}

cleanupOldRecords();
```

---

## Error Handling

All operations return comprehensive error information:

```typescript
const result = await agentQuery({
  table: 'nonexistent_table',
  where: []
});

if (!result.success) {
  console.log('Error:', result.summary);
  
  // Get recovery suggestions
  result.nextActions.forEach(action => {
    console.log(`${action.priority}: ${action.description}`);
    if (action.example) {
      console.log(`  Example: ${action.example}`);
    }
  });
}
```

**Example error response:**

```typescript
{
  success: false,
  summary: "Query failed: relation 'nonexistent_table' does not exist",
  executionTimeMs: 45,
  data: [],
  nextActions: [
    {
      action: 'VERIFY_TABLE',
      description: "Verify table 'nonexistent_table' exists and has correct schema",
      example: 'agentIntrospectSchema({ table: "nonexistent_table" })',
      priority: 'HIGH'
    }
  ]
}
```

---

## Performance Tips

### Query Operations
- Use pagination for large result sets (`limit` + `offset`)
- Select only needed columns with `select`
- Use `count: true` only when needed
- Consider RPC for complex aggregations

### Export Operations
- For large datasets (>1000 records), consider batching
- Use JSONL for streaming compatibility
- CSV exports include BOM for Excel compatibility
- Compression suggested for files >1MB

### Delete Operations
- Always use dry-run first
- Delete in batches for large operations
- Verify with count query after deletion
- Keep backups before mass deletions

---

## TypeScript Support

Full TypeScript definitions included:

```typescript
import { 
  agentQuery, 
  agentCount, 
  agentExportData, 
  agentDelete,
  QueryParams,
  QueryResult,
  CountParams,
  CountResult,
  ExportParams,
  ExportResult,
  DeleteParams,
  DeleteResult
} from 'supa-agent-ops';

const params: QueryParams = {
  table: 'conversations',
  where: [
    { column: 'status', operator: 'eq', value: 'approved' }
  ],
  limit: 10
};

const result: QueryResult = await agentQuery(params);
```

---

## Next Steps

- See `example-query-export-delete.js` for more examples
- Run tests: `npm test`
- Check `PROMPT2_IMPLEMENTATION_SUMMARY.md` for complete documentation
- Review error codes in `ERROR_CODES.md`

---

## Support

For issues and questions:
- GitHub: [Your Repository]
- Docs: [Your Documentation URL]
- Email: [Your Support Email]

---

**Version**: 1.2.0  
**License**: MIT  
**Author**: BrightHub

