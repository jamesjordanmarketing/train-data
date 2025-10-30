# Database Migration Guide

## Overview

This guide covers safe database migration patterns for the Interactive LoRA Conversation Generation platform. All migrations must support zero-downtime deployments and be fully reversible.

## Table of Contents

- [Safe Migration Patterns](#safe-migration-patterns)
- [Migration Workflow](#migration-workflow)
- [Using the Migration Tools](#using-the-migration-tools)
- [Testing Migrations](#testing-migrations)
- [Common Scenarios](#common-scenarios)
- [Troubleshooting](#troubleshooting)

## Safe Migration Patterns

### 1. Adding a Column

**✅ DO: Use DEFAULT values to avoid table rewrites**

```sql
-- Safe: No table rewrite, instant for all Postgres versions >= 11
ALTER TABLE conversations
ADD COLUMN priority TEXT DEFAULT 'medium' NOT NULL;
```

**❌ DON'T: Add NOT NULL without DEFAULT**

```sql
-- Dangerous: Causes full table rewrite on large tables
ALTER TABLE conversations
ADD COLUMN priority TEXT NOT NULL;
```

**Why it matters:** Adding a column with a DEFAULT value in PostgreSQL 11+ is instant because it only updates the table metadata, not every row. Without DEFAULT, PostgreSQL must rewrite the entire table.

### 2. Adding Constraints

**✅ DO: Use NOT VALID pattern for constraints**

```sql
-- Step 1: Add constraint without validating existing rows (instant)
ALTER TABLE conversations
ADD CONSTRAINT chk_quality_score
CHECK (quality_score >= 0 AND quality_score <= 10)
NOT VALID;

-- Step 2: Validate constraint in background (can be done later)
ALTER TABLE conversations
VALIDATE CONSTRAINT chk_quality_score;
```

**❌ DON'T: Add constraint directly**

```sql
-- Dangerous: Full table scan with exclusive lock
ALTER TABLE conversations
ADD CONSTRAINT chk_quality_score
CHECK (quality_score >= 0 AND quality_score <= 10);
```

**Why it matters:** `NOT VALID` adds the constraint without scanning existing rows. New rows are checked immediately. The `VALIDATE CONSTRAINT` step can be run later during low-traffic periods.

### 3. Renaming Columns

Use a multi-phase approach to maintain backward compatibility:

**Phase 1: Deploy with both columns (Migration A)**

```sql
-- Add new column
ALTER TABLE conversations 
ADD COLUMN conversation_status TEXT;

-- Copy data from old to new
UPDATE conversations 
SET conversation_status = status 
WHERE conversation_status IS NULL;

-- Create backward-compatible view
CREATE VIEW conversations_v1 AS 
SELECT 
  *,
  conversation_status AS status 
FROM conversations;
```

**Phase 2: Update application code**

Deploy application changes that use `conversation_status` instead of `status`.

**Phase 3: Clean up (Migration B, after verifying Phase 2)**

```sql
-- Drop the compatibility view
DROP VIEW IF EXISTS conversations_v1;

-- Drop the old column
ALTER TABLE conversations 
DROP COLUMN IF EXISTS status;
```

**Why it matters:** This ensures zero downtime. Old code uses the view, new code uses the renamed column.

### 4. Creating Indexes

**✅ DO: Use CONCURRENTLY**

```sql
-- Safe: No table locks, can run during production traffic
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_status
ON conversations(status);

-- For partial indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_active
ON conversations(status)
WHERE status = 'active';
```

**❌ DON'T: Create index without CONCURRENTLY**

```sql
-- Dangerous: Locks table for reads and writes
CREATE INDEX idx_conversations_status
ON conversations(status);
```

**Why it matters:** `CONCURRENTLY` allows reads and writes to continue during index creation. On large tables, this can be the difference between seconds and hours of downtime.

**Note:** If `CREATE INDEX CONCURRENTLY` fails, it leaves an invalid index. Clean it up:

```sql
-- Find invalid indexes
SELECT indexrelid::regclass, indrelid::regclass
FROM pg_index
WHERE NOT indisvalid;

-- Drop invalid index
DROP INDEX CONCURRENTLY idx_conversations_status;
```

### 5. Dropping Columns

Use a two-phase approach:

**Phase 1: Stop writing to the column**

Deploy application changes that no longer use the column. Wait 7+ days to ensure all old processes are gone.

**Phase 2: Verify and drop (Migration)**

```sql
-- Verify no recent writes
SELECT COUNT(*) as recent_updates
FROM conversations
WHERE updated_at > NOW() - INTERVAL '7 days'
  AND old_column IS NOT NULL;

-- If count is 0, safe to drop
ALTER TABLE conversations
DROP COLUMN IF EXISTS old_column;
```

**Why it matters:** Dropping a column is instant but irreversible. Ensure no code is still writing to it.

### 6. Changing Column Types

**Safe pattern for compatible types:**

```sql
-- Expanding VARCHAR length (safe)
ALTER TABLE conversations
ALTER COLUMN title TYPE VARCHAR(500);

-- Safe type changes (no data conversion)
-- TEXT to VARCHAR, VARCHAR to TEXT
-- INTEGER to BIGINT
```

**Risky pattern (requires table rewrite):**

```sql
-- Requires conversion and full table rewrite
ALTER TABLE conversations
ALTER COLUMN created_at TYPE TIMESTAMPTZ
USING created_at AT TIME ZONE 'UTC';
```

For risky changes, use the rename column pattern:
1. Add new column with new type
2. Copy/convert data in batches
3. Create view for backward compatibility
4. Switch application code
5. Drop old column

### 7. Zero-Downtime Deployment Order

**Critical rule:** Always deploy database changes before application changes.

**Example: Adding a required field**

1. **Migration 1:** Add column with DEFAULT value
   ```sql
   ALTER TABLE conversations
   ADD COLUMN priority TEXT DEFAULT 'medium' NOT NULL;
   ```

2. **Deploy:** Application code that uses `priority` (optional at first)

3. **Migration 2:** Add NOT NULL constraint (if not already present)

4. **Deploy:** Application code that requires `priority`

## Migration Workflow

### Step 1: Create Migration

```bash
tsx src/scripts/migrate.ts create --description "Add priority field to conversations"
```

This generates a timestamped migration file in `supabase/migrations/`.

### Step 2: Edit Migration

Edit the generated file with your UP and DOWN scripts:

```sql
-- Migration: 1698765432000
-- Description: Add priority field to conversations
-- Date: 20231031

-- ============================================================================
-- UP MIGRATION
-- ============================================================================

BEGIN;

ALTER TABLE conversations
ADD COLUMN priority TEXT DEFAULT 'medium' NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_priority
ON conversations(priority);

COMMIT;

-- ============================================================================
-- DOWN MIGRATION (ROLLBACK)
-- ============================================================================

BEGIN;

DROP INDEX IF EXISTS idx_conversations_priority;

ALTER TABLE conversations
DROP COLUMN IF EXISTS priority;

COMMIT;
```

### Step 3: Test in Development

```bash
# Check current status
tsx src/scripts/migrate.ts status

# Apply migration
tsx src/scripts/migrate.ts up

# Verify changes in database
# ...

# Test rollback
tsx src/scripts/migrate.ts down --steps 1

# Re-apply to continue testing
tsx src/scripts/migrate.ts up
```

### Step 4: Code Review

Have another developer review:
- [ ] Migration uses safe patterns
- [ ] DOWN script properly reverses UP script
- [ ] No dangerous operations (DROP TABLE, TRUNCATE)
- [ ] Backward compatible with current application code
- [ ] Indexed columns are appropriate

### Step 5: Deploy to Staging

```bash
# On staging environment
tsx src/scripts/migrate.ts up
```

Test thoroughly:
- [ ] Application works with new schema
- [ ] Performance is acceptable
- [ ] Rollback works if needed
- [ ] Data integrity maintained

### Step 6: Deploy to Production

1. **Apply migration during low-traffic period**
   ```bash
   tsx src/scripts/migrate.ts up
   ```

2. **Monitor performance and errors**

3. **Deploy application changes** (if any)

4. **Keep rollback ready** for 24-48 hours

## Using the Migration Tools

### Migration Manager Service

```typescript
import { migrationManager } from '@/lib/services/migration-manager';

// Get current schema version
const version = await migrationManager.getCurrentVersion();
console.log('Current version:', version);

// Get all applied migrations
const applied = await migrationManager.getAppliedMigrations();
console.log('Applied migrations:', applied);

// Check if specific migration was applied
const isApplied = await migrationManager.isMigrationApplied(1698765432000);

// Record a migration (done automatically by CLI)
await migrationManager.recordMigration({
  version: 1698765432000,
  description: 'Add priority field',
  executionTimeMs: 150,
  checksum: 'abc123...',
  appliedBy: 'admin@example.com',
});
```

### Safe Migration Utilities

```typescript
import {
  addColumnSafely,
  addConstraintSafely,
  createIndexConcurrently,
  renameColumnSafely,
  dropColumnSafely,
} from '@/lib/services/migration-utils';

// Generate safe SQL for adding a column
const sql = addColumnSafely({
  table: 'conversations',
  column: 'priority',
  type: 'TEXT',
  defaultValue: "'medium'",
  notNull: true,
});
console.log(sql);
// ALTER TABLE conversations
// ADD COLUMN IF NOT EXISTS priority TEXT
// DEFAULT 'medium' NOT NULL;

// Generate constraint with NOT VALID pattern
const { add, validate } = addConstraintSafely({
  table: 'conversations',
  constraintName: 'chk_priority',
  constraintDefinition: "CHECK (priority IN ('low', 'medium', 'high'))",
});
console.log(add);
console.log(validate);

// Generate index creation SQL
const indexSql = createIndexConcurrently({
  table: 'conversations',
  indexName: 'idx_conversations_priority',
  columns: ['priority'],
  where: "status = 'active'",
});
```

### Migration Testing

```typescript
import { migrationTester } from '@/lib/services/migration-testing';

// Test migration can apply and rollback
const result = await migrationTester.testMigration({
  upScript: 'ALTER TABLE conversations ADD COLUMN test TEXT;',
  downScript: 'ALTER TABLE conversations DROP COLUMN test;',
});

if (!result.success) {
  console.error('Migration test failed:', result.errors);
}

// Verify schema changes
const tableExists = await migrationTester.tableExists('conversations');
const columnExists = await migrationTester.columnExists('conversations', 'priority');
const indexExists = await migrationTester.indexExists('idx_conversations_priority');

// Verify data integrity
const integrity = await migrationTester.verifyDataIntegrity({
  tableName: 'conversations',
  expectedCount: 1000,
  sampleChecks: [
    { column: 'priority', constraint: "IN ('low', 'medium', 'high')" },
  ],
});
```

## Common Scenarios

### Scenario 1: Add Optional Field

```typescript
// Use the utility to generate safe SQL
import { addColumnSafely } from '@/lib/services/migration-utils';

const sql = addColumnSafely({
  table: 'conversations',
  column: 'tags',
  type: 'TEXT[]',
  defaultValue: "'{}'::TEXT[]",
  notNull: false,
});
```

**Migration:**
```sql
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::TEXT[];
```

### Scenario 2: Add Required Field with Validation

**Migration:**
```sql
-- Add column with default
ALTER TABLE conversations
ADD COLUMN priority TEXT DEFAULT 'medium' NOT NULL;

-- Add constraint without validation
ALTER TABLE conversations
ADD CONSTRAINT chk_priority
CHECK (priority IN ('low', 'medium', 'high'))
NOT VALID;

-- Validate constraint (can be done asynchronously)
ALTER TABLE conversations
VALIDATE CONSTRAINT chk_priority;

-- Add index
CREATE INDEX CONCURRENTLY idx_conversations_priority
ON conversations(priority);
```

### Scenario 3: Rename Table

```sql
-- Phase 1: Create view with old name
CREATE VIEW old_table_name AS
SELECT * FROM new_table_name;

-- Phase 2: Update application code to use new_table_name

-- Phase 3: Drop view
DROP VIEW old_table_name;
```

### Scenario 4: Split Column

```sql
-- Example: Split 'name' into 'first_name' and 'last_name'

-- Phase 1: Add new columns
ALTER TABLE user_profiles
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT;

-- Populate from existing data
UPDATE user_profiles
SET 
  first_name = split_part(name, ' ', 1),
  last_name = split_part(name, ' ', 2)
WHERE first_name IS NULL;

-- Phase 2: Update application to use new columns

-- Phase 3: Drop old column
ALTER TABLE user_profiles
DROP COLUMN name;
```

### Scenario 5: Add Foreign Key

```sql
-- Add column for FK
ALTER TABLE conversation_turns
ADD COLUMN template_id UUID;

-- Populate with data
UPDATE conversation_turns ct
SET template_id = c.template_id
FROM conversations c
WHERE ct.conversation_id = c.id;

-- Add FK constraint without validation
ALTER TABLE conversation_turns
ADD CONSTRAINT fk_conversation_turns_template
FOREIGN KEY (template_id)
REFERENCES conversation_templates(id)
NOT VALID;

-- Validate in background
ALTER TABLE conversation_turns
VALIDATE CONSTRAINT fk_conversation_turns_template;
```

## Troubleshooting

### Migration Failed to Apply

1. **Check the error message:**
   ```bash
   tsx src/scripts/migrate.ts status
   ```

2. **Verify database connection:**
   - Check `.env` configuration
   - Test Supabase connection

3. **Manual rollback if needed:**
   ```bash
   tsx src/scripts/migrate.ts down --steps 1
   ```

### Index Creation Failed

```sql
-- Find and drop invalid indexes
SELECT indexrelid::regclass, indrelid::regclass
FROM pg_index
WHERE NOT indisvalid;

DROP INDEX CONCURRENTLY invalid_index_name;

-- Re-create the index
CREATE INDEX CONCURRENTLY idx_name ON table(column);
```

### Migration Too Slow

For large tables, consider:

1. **Batch updates:**
   ```sql
   -- Instead of:
   UPDATE large_table SET new_col = old_col;
   
   -- Do:
   UPDATE large_table SET new_col = old_col
   WHERE id IN (
     SELECT id FROM large_table 
     WHERE new_col IS NULL 
     LIMIT 10000
   );
   -- Repeat until all rows updated
   ```

2. **Background workers:**
   - Add column with NULL allowed
   - Backfill data gradually via background job
   - Add NOT NULL constraint later

3. **Partitioning:**
   - Process data by date ranges
   - Update one partition at a time

### Rollback Failed

If DOWN migration fails:

1. **Manual intervention:**
   - Connect to database directly
   - Inspect current state
   - Run corrective SQL manually

2. **Remove migration record:**
   ```typescript
   import { migrationManager } from '@/lib/services/migration-manager';
   await migrationManager.removeMigration(1698765432000);
   ```

3. **Fix and retry:**
   - Correct the DOWN script
   - Re-apply migration

## Best Practices

### DO:

- ✅ Always write reversible migrations
- ✅ Test migrations in development first
- ✅ Use safe patterns (DEFAULT, NOT VALID, CONCURRENTLY)
- ✅ Deploy database changes before app changes
- ✅ Keep migrations small and focused
- ✅ Add comments explaining complex migrations
- ✅ Monitor performance after deploying
- ✅ Keep rollback scripts ready for 48 hours

### DON'T:

- ❌ Modify existing migration files after they're applied
- ❌ Use DROP TABLE or TRUNCATE without extreme caution
- ❌ Add NOT NULL without DEFAULT on large tables
- ❌ Create indexes without CONCURRENTLY
- ❌ Skip testing migrations
- ❌ Combine unrelated changes in one migration
- ❌ Remove backward compatibility too soon

## Reference

### Schema Migrations Table

```sql
CREATE TABLE schema_migrations (
  version BIGINT PRIMARY KEY,
  description TEXT NOT NULL,
  applied_at TIMESTAMP DEFAULT NOW(),
  applied_by TEXT,
  execution_time_ms INTEGER,
  checksum TEXT
);
```

### Useful PostgreSQL Queries

```sql
-- Check table size
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Check active queries
SELECT 
  pid,
  age(clock_timestamp(), query_start),
  usename,
  query 
FROM pg_stat_activity
WHERE query != '<IDLE>' 
  AND query NOT ILIKE '%pg_stat_activity%'
ORDER BY query_start;

-- Check locks
SELECT 
  relation::regclass,
  mode,
  granted
FROM pg_locks
WHERE NOT granted;
```

## Additional Resources

- [PostgreSQL Documentation: ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
- [Supabase Documentation: Database Migrations](https://supabase.com/docs/guides/database/migrations)
- [Zero Downtime Database Migrations](https://www.braintreepayments.com/blog/safe-operations-for-high-volume-postgresql/)

