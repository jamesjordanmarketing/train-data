# Maintenance Operations Guide

The Supabase Agent Ops Library provides comprehensive maintenance and verification operations to keep your PostgreSQL database healthy and performant.

## Table of Contents

- [Maintenance Operations](#maintenance-operations)
  - [VACUUM](#vacuum)
  - [ANALYZE](#analyze)
  - [REINDEX](#reindex)
- [Verification Operations](#verification-operations)
  - [Table Structure Verification](#table-structure-verification)
- [Performance Monitoring](#performance-monitoring)
  - [Index Usage Analysis](#index-usage-analysis)
  - [Table Bloat Analysis](#table-bloat-analysis)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Maintenance Operations

### VACUUM

Reclaims storage occupied by dead tuples (deleted or updated rows).

#### When to Run

- After large DELETE/UPDATE operations
- Weekly maintenance window
- When bloat is detected
- To prevent transaction ID wraparound

#### Usage

```typescript
import { agentVacuum } from 'supa-agent-ops';

// VACUUM a specific table
const result = await agentVacuum({ 
  table: 'conversations'
});

// VACUUM with ANALYZE (recommended)
const result2 = await agentVacuum({ 
  table: 'conversations',
  analyze: true 
});

// VACUUM all tables
const result3 = await agentVacuum({
  analyze: true
});

// Dry run to preview
const result4 = await agentVacuum({
  table: 'conversations',
  dryRun: true
});
```

#### VACUUM FULL Warning

⚠️ **VACUUM FULL requires exclusive table lock.** Only run during maintenance windows.

```typescript
// Use VACUUM FULL with caution - locks the table!
const result = await agentVacuum({
  table: 'conversations',
  full: true,
  dryRun: true  // Always preview first
});
```

**VACUUM FULL** rewrites the entire table and reclaims maximum space, but:
- Locks the table (blocks all reads and writes)
- Takes significantly longer than regular VACUUM
- Can take 2-3x the table size in temporary disk space

**Alternatives:**
- Regular VACUUM (non-blocking, reclaims most space)
- pg_repack extension (online table reorganization)
- Partition and archive old data

#### Example Response

```typescript
{
  success: true,
  summary: "VACUUM ANALYZE completed for conversations",
  executionTimeMs: 1234,
  operation: "maintenance",
  tablesProcessed: ["conversations"],
  nextActions: [
    {
      action: "VERIFY_STATISTICS",
      description: "Statistics updated. Query planner will use new statistics.",
      priority: "LOW"
    }
  ]
}
```

---

### ANALYZE

Updates table statistics for the query planner to optimize query performance.

#### When to Run

- After bulk INSERT/UPDATE/DELETE operations
- After significant data changes
- Before complex queries or migrations
- When query plans seem suboptimal
- Automatically with `VACUUM ANALYZE`

#### Usage

```typescript
import { agentAnalyze } from 'supa-agent-ops';

// ANALYZE entire table
const result = await agentAnalyze({
  table: 'conversations'
});

// ANALYZE specific columns (faster for large tables)
const result2 = await agentAnalyze({
  table: 'conversations',
  columns: ['persona', 'status', 'tier']
});

// ANALYZE all tables
const result3 = await agentAnalyze({});
```

#### What ANALYZE Does

1. Samples rows from the table
2. Computes statistics (value distribution, null counts, etc.)
3. Updates pg_stats system catalog
4. Query planner uses these statistics to choose optimal execution plans

#### Example Response

```typescript
{
  success: true,
  summary: "ANALYZE completed for conversations (columns: persona, status)",
  executionTimeMs: 456,
  operation: "maintenance",
  nextActions: [
    {
      action: "VERIFY_STATISTICS",
      description: "Statistics updated. Query planner will use new statistics for optimization.",
      example: "EXPLAIN ANALYZE SELECT ... to verify query plan",
      priority: "LOW"
    }
  ]
}
```

---

### REINDEX

Rebuilds indexes to reclaim space and fix corruption.

#### When to Run

- Suspected index corruption
- Index bloat detected
- Performance degradation
- After pg_upgrade
- B-tree index deduplication issues

#### Usage

```typescript
import { agentReindex } from 'supa-agent-ops';

// REINDEX a table (all indexes) - CONCURRENTLY (non-blocking)
const result = await agentReindex({
  target: 'table',
  name: 'conversations',
  concurrent: true
});

// REINDEX a specific index
const result2 = await agentReindex({
  target: 'index',
  name: 'idx_conversations_persona',
  concurrent: true
});

// REINDEX entire schema (during maintenance window)
const result3 = await agentReindex({
  target: 'schema',
  name: 'public'
});
```

#### REINDEX CONCURRENTLY

PostgreSQL 12+ supports `REINDEX CONCURRENTLY`, which:
- Does NOT lock the table
- Allows reads and writes during reindex
- Takes longer than regular REINDEX
- Safe for production

**Without CONCURRENTLY** (default in older versions):
- Locks the table for writes
- Faster but blocks production traffic
- Only use during maintenance windows

#### Example Response

```typescript
{
  success: true,
  summary: "REINDEX CONCURRENTLY completed for table conversations",
  executionTimeMs: 5678,
  operation: "maintenance",
  nextActions: [
    {
      action: "VERIFY_INDEX_HEALTH",
      description: "Index rebuilt successfully. Verify index usage and performance.",
      example: "agentAnalyzeIndexUsage({ table: 'conversations' })",
      priority: "LOW"
    }
  ]
}
```

---

## Verification Operations

### Table Structure Verification

Validates table structure against expected schema and generates fix SQL.

#### When to Use

- Before migrations
- After deployments
- Schema validation in tests
- Detecting schema drift
- Pre-flight checks for data operations

#### Usage

```typescript
import { agentVerifyTable } from 'supa-agent-ops';

// Verify table structure
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

// Check results
console.log('Exists:', result.exists);
console.log('Category:', result.category);  // 1=OK, 2=Warning, 3=Critical, 4=Blocking
console.log('Can Proceed:', result.canProceed);

// Review issues
result.issues.forEach(issue => {
  console.log(`[${issue.severity}] ${issue.description}`);
  if (issue.fixSQL) {
    console.log('Fix:', issue.fixSQL);
  }
});

// Apply fix SQL if generated
if (result.fixSQL && !result.canProceed) {
  console.log('Apply this SQL to fix issues:');
  console.log(result.fixSQL);
}
```

#### Severity Categories

- **Category 1 (OK)**: No issues, table is valid
- **Category 2 (Warning)**: Minor issues, can proceed (e.g., missing optional columns)
- **Category 3 (Critical)**: Serious issues, review required (e.g., type mismatches)
- **Category 4 (Blocking)**: Cannot proceed (e.g., table doesn't exist, missing required columns)

#### Example Response

```typescript
{
  success: false,
  summary: "Found 3 issue(s) in table conversations (Category 3)",
  executionTimeMs: 234,
  operation: "verification",
  exists: true,
  issues: [
    {
      type: "missing_column",
      severity: "critical",
      description: "Missing column: tier",
      fixSQL: "ALTER TABLE conversations ADD COLUMN tier text;"
    },
    {
      type: "type_mismatch",
      severity: "error",
      description: "Column status type mismatch: expected text, got character varying",
      fixSQL: "ALTER TABLE conversations ALTER COLUMN status TYPE text;"
    },
    {
      type: "missing_index",
      severity: "warning",
      description: "Missing index: idx_conversations_tier",
      fixSQL: "-- CREATE INDEX idx_conversations_tier ON conversations (...);  -- Specify columns"
    }
  ],
  fixSQL: "ALTER TABLE conversations ADD COLUMN tier text;\n\nALTER TABLE conversations ALTER COLUMN status TYPE text;\n\n-- CREATE INDEX idx_conversations_tier ON conversations (...);",
  category: 3,
  canProceed: false,
  nextActions: [
    {
      action: "REVIEW_ISSUES",
      description: "Found 3 issue(s) in table conversations",
      priority: "HIGH"
    },
    {
      action: "APPLY_FIX_SQL",
      description: "Apply generated fix SQL to resolve issues",
      priority: "HIGH"
    }
  ]
}
```

---

## Performance Monitoring

### Index Usage Analysis

Identifies unused or underutilized indexes that consume space without improving performance.

#### When to Use

- Monthly performance reviews
- Before adding new indexes
- To identify indexes to drop
- Database optimization
- Cost reduction (storage)

#### Usage

```typescript
import { agentAnalyzeIndexUsage } from 'supa-agent-ops';

// Analyze all indexes with low usage (< 100 scans)
const result = await agentAnalyzeIndexUsage({
  minScans: 100
});

// Analyze indexes for a specific table
const result2 = await agentAnalyzeIndexUsage({
  table: 'conversations',
  minScans: 10
});

// Review results
console.log('Recommendations:', result.recommendations);

// Find unused indexes
const unusedIndexes = result.indexes.filter(idx => idx.unused);
unusedIndexes.forEach(idx => {
  console.log(`Unused index: ${idx.indexName} on ${idx.tableName}`);
  console.log(`  Size: ${idx.sizeBytes} bytes`);
  console.log(`  Scans: ${idx.scans}`);
});
```

#### What It Analyzes

- **scans**: Number of times the index was used
- **tuplesRead**: Rows read from index
- **tuplesReturned**: Rows returned to query
- **sizeBytes**: Index size on disk
- **unused**: Never used (0 scans)

#### Example Response

```typescript
{
  success: true,
  summary: "Analyzed 5 index(es) on table 'conversations' with usage below 100 scans",
  executionTimeMs: 123,
  operation: "performance",
  indexes: [
    {
      tableName: "conversations",
      indexName: "idx_conversations_created_at",
      scans: 0,
      tuplesRead: 0,
      tuplesReturned: 0,
      sizeBytes: 8192000,
      unused: true
    },
    {
      tableName: "conversations",
      indexName: "idx_conversations_tier",
      scans: 45,
      tuplesRead: 1234,
      tuplesReturned: 567,
      sizeBytes: 4096000,
      unused: false
    }
  ],
  recommendations: [
    "Found 1 unused index(es) consuming 8 MB. Consider dropping them to reclaim space.",
    "Found 1 index(es) with very low usage (< 10 scans). Review if they are still needed."
  ],
  nextActions: [
    {
      action: "DROP_UNUSED_INDEXES",
      description: "Drop unused indexes: idx_conversations_created_at",
      example: "DROP INDEX IF EXISTS idx_conversations_created_at;",
      priority: "MEDIUM"
    }
  ]
}
```

---

### Table Bloat Analysis

Analyzes table size and provides recommendations for optimization.

#### Usage

```typescript
import { agentAnalyzeTableBloat } from 'supa-agent-ops';

const result = await agentAnalyzeTableBloat('conversations');

console.log(result.summary);
// "Table conversations size: 256 MB (12.5% of database)"
```

---

## Best Practices

### Regular Maintenance Schedule

```typescript
// Weekly maintenance (Sunday 2 AM)
async function weeklyMaintenance() {
  // 1. VACUUM ANALYZE all tables
  await agentVacuum({ analyze: true });
  
  // 2. Check for unused indexes
  const indexUsage = await agentAnalyzeIndexUsage({ minScans: 10 });
  console.log('Index recommendations:', indexUsage.recommendations);
  
  // 3. Verify critical tables
  const verification = await agentVerifyTable({
    table: 'conversations',
    expectedColumns: [...],
    generateFixSQL: true
  });
  
  if (!verification.canProceed) {
    console.error('Critical issues found:', verification.issues);
  }
}
```

### Pre-Deployment Checks

```typescript
async function preDeploymentChecks() {
  // Verify all critical tables
  const tables = ['conversations', 'templates', 'scenarios'];
  
  for (const table of tables) {
    const result = await agentVerifyTable({
      table,
      expectedColumns: getExpectedSchema(table),
      generateFixSQL: true
    });
    
    if (result.category >= 3) {
      throw new Error(`Blocking issues in ${table}: ${result.summary}`);
    }
  }
}
```

### Index Optimization

```typescript
async function optimizeIndexes() {
  // 1. Find unused indexes
  const usage = await agentAnalyzeIndexUsage({ minScans: 100 });
  
  const toReview = usage.indexes.filter(idx => 
    idx.unused && idx.sizeBytes > 1024 * 1024 // > 1MB
  );
  
  // 2. Review with team before dropping
  console.log('Indexes to review:', toReview);
  
  // 3. Drop confirmed unused indexes
  // DROP INDEX IF EXISTS idx_name;
}
```

---

## Troubleshooting

### VACUUM Permission Denied

```
ERROR: permission denied for table conversations
```

**Solution**: Grant VACUUM permission:

```sql
GRANT ALL ON TABLE conversations TO your_role;
-- OR for all tables:
GRANT ALL ON ALL TABLES IN SCHEMA public TO your_role;
```

### REINDEX CONCURRENTLY Not Supported

```
ERROR: CONCURRENTLY is not supported by this command
```

**Solution**: 
1. Check PostgreSQL version (requires 12+):
   ```sql
   SELECT version();
   ```
2. Use non-concurrent reindex during maintenance window:
   ```typescript
   await agentReindex({ target: 'table', name: 'conversations', concurrent: false });
   ```

### Index Usage Analysis Returns Empty

**Possible causes**:
1. Statistics collector not enabled
2. No queries have been run yet
3. Database recently restarted (stats reset)

**Solution**:
```sql
-- Check if stats are being collected
SHOW track_counts;  -- Should be ON

-- Reset stats if needed (as superuser)
SELECT pg_stat_reset();
```

### ANALYZE Takes Too Long

For very large tables, ANALYZE can take a while.

**Solution**: Analyze specific columns:
```typescript
await agentAnalyze({
  table: 'large_table',
  columns: ['frequently_queried_column']
});
```

---

## Additional Resources

- [PostgreSQL VACUUM Documentation](https://www.postgresql.org/docs/current/sql-vacuum.html)
- [PostgreSQL ANALYZE Documentation](https://www.postgresql.org/docs/current/sql-analyze.html)
- [PostgreSQL REINDEX Documentation](https://www.postgresql.org/docs/current/sql-reindex.html)
- [Monitoring Database Activity](https://www.postgresql.org/docs/current/monitoring-stats.html)

---

## Support

For issues or questions:
- Check the [main README](./README.md)
- Review [SCHEMA_OPERATIONS_GUIDE.md](./SCHEMA_OPERATIONS_GUIDE.md)
- Open an issue on GitHub

