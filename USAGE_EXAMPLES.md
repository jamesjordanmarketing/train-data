# Migration Framework - Usage Examples

This document provides practical examples of using the migration framework.

## 🎯 Common Use Cases

### 1. Adding a New Column

**Scenario:** Add a `priority` field to the `conversations` table.

**Step 1: Create migration**
```bash
tsx src/scripts/migrate.ts create --description "Add priority field to conversations"
```

**Step 2: Edit the generated migration file**
```sql
-- UP MIGRATION
BEGIN;

-- Safe: Uses DEFAULT to avoid table rewrite
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' NOT NULL;

-- Add constraint without validation (instant)
ALTER TABLE conversations
ADD CONSTRAINT chk_conversation_priority
CHECK (priority IN ('low', 'medium', 'high'))
NOT VALID;

-- Validate in background
ALTER TABLE conversations
VALIDATE CONSTRAINT chk_conversation_priority;

-- Create index without locks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_priority
ON conversations(priority);

COMMIT;

-- DOWN MIGRATION
BEGIN;

DROP INDEX IF EXISTS idx_conversations_priority;
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS chk_conversation_priority;
ALTER TABLE conversations DROP COLUMN IF EXISTS priority;

COMMIT;
```

**Step 3: Apply migration**
```bash
tsx src/scripts/migrate.ts up
```

### 2. Using Migration Utilities

**Scenario:** Generate safe SQL using utility functions.

```typescript
import {
  addColumnSafely,
  addConstraintSafely,
  createIndexConcurrently,
} from '@/lib/services/migration-utils';

// Generate SQL for adding a column
const addColumn = addColumnSafely({
  table: 'conversations',
  column: 'priority',
  type: 'TEXT',
  defaultValue: "'medium'",
  notNull: true,
});

console.log(addColumn);
// Output:
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
// Output:
// ALTER TABLE conversations
// ADD CONSTRAINT chk_priority
// CHECK (priority IN ('low', 'medium', 'high'))
// NOT VALID;

console.log(validate);
// Output:
// ALTER TABLE conversations
// VALIDATE CONSTRAINT chk_priority;

// Generate index creation
const createIndex = createIndexConcurrently({
  table: 'conversations',
  indexName: 'idx_conversations_priority',
  columns: ['priority'],
  where: "status = 'active'",
});

console.log(createIndex);
// Output:
// CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_priority
// ON conversations(priority)
// WHERE status = 'active';
```

### 3. Adding a JSONB Column for Flexible Data

**Scenario:** Add a `metadata` JSONB column to `conversation_turns`.

```typescript
import { addColumnSafely, createIndexConcurrently } from '@/lib/services/migration-utils';

// Generate SQL
const addMetadata = addColumnSafely({
  table: 'conversation_turns',
  column: 'metadata',
  type: 'JSONB',
  defaultValue: "'{}'::JSONB",
  notNull: true,
});

// Create GIN index for JSONB queries
const createGinIndex = createIndexConcurrently({
  table: 'conversation_turns',
  indexName: 'idx_conversation_turns_metadata',
  columns: ['metadata'],
});

console.log(addMetadata);
// ALTER TABLE conversation_turns
// ADD COLUMN IF NOT EXISTS metadata JSONB
// DEFAULT '{}'::JSONB NOT NULL;

console.log(createGinIndex);
// CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversation_turns_metadata
// ON conversation_turns(metadata);
```

**Migration file:**
```sql
-- UP MIGRATION
BEGIN;

ALTER TABLE conversation_turns
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::JSONB NOT NULL;

-- GIN index for JSONB is automatically created with proper operator class
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversation_turns_metadata
ON conversation_turns USING GIN (metadata);

COMMIT;

-- DOWN MIGRATION
BEGIN;

DROP INDEX IF EXISTS idx_conversation_turns_metadata;
ALTER TABLE conversation_turns DROP COLUMN IF EXISTS metadata;

COMMIT;
```

### 4. Renaming a Column Safely

**Scenario:** Rename `content` to `turn_content` in `conversation_turns`.

**Phase 1 Migration: Add new column and compatibility view**
```sql
-- UP MIGRATION
BEGIN;

-- Add new column
ALTER TABLE conversation_turns
ADD COLUMN IF NOT EXISTS turn_content TEXT;

-- Copy data from old to new
UPDATE conversation_turns
SET turn_content = content
WHERE turn_content IS NULL AND content IS NOT NULL;

-- Create backward compatibility view
CREATE OR REPLACE VIEW conversation_turns_v1 AS
SELECT
  id,
  conversation_id,
  turn_number,
  role,
  turn_content,
  turn_content AS content,  -- Alias for backward compatibility
  template_variables,
  quality_score,
  created_at,
  updated_at
FROM conversation_turns;

COMMENT ON VIEW conversation_turns_v1 IS 'Backward compatibility during column rename';

COMMIT;

-- DOWN MIGRATION
BEGIN;

DROP VIEW IF EXISTS conversation_turns_v1;
ALTER TABLE conversation_turns DROP COLUMN IF EXISTS turn_content;

COMMIT;
```

**Phase 2: Deploy application changes**
Update application code to use `turn_content` instead of `content`.

**Phase 3 Migration: Clean up (after verification)**
```sql
-- UP MIGRATION
BEGIN;

-- Drop compatibility view
DROP VIEW IF EXISTS conversation_turns_v1;

-- Drop old column
ALTER TABLE conversation_turns
DROP COLUMN IF EXISTS content;

COMMIT;

-- DOWN MIGRATION
BEGIN;

-- Add back old column
ALTER TABLE conversation_turns
ADD COLUMN IF NOT EXISTS content TEXT;

-- Copy data back
UPDATE conversation_turns
SET content = turn_content;

-- Recreate view
CREATE OR REPLACE VIEW conversation_turns_v1 AS
SELECT
  id,
  conversation_id,
  turn_number,
  role,
  turn_content,
  turn_content AS content,
  template_variables,
  quality_score,
  created_at,
  updated_at
FROM conversation_turns;

COMMIT;
```

### 5. Adding a Foreign Key

**Scenario:** Add foreign key from `conversation_turns` to `conversation_templates`.

```sql
-- UP MIGRATION
BEGIN;

-- Add column for FK
ALTER TABLE conversation_turns
ADD COLUMN IF NOT EXISTS template_id UUID;

-- Populate with data (if applicable)
UPDATE conversation_turns ct
SET template_id = c.template_id
FROM conversations c
WHERE ct.conversation_id = c.id
  AND ct.template_id IS NULL;

-- Add FK constraint without validation (instant)
ALTER TABLE conversation_turns
ADD CONSTRAINT fk_conversation_turns_template
FOREIGN KEY (template_id)
REFERENCES conversation_templates(id)
ON DELETE SET NULL
NOT VALID;

-- Validate in background
ALTER TABLE conversation_turns
VALIDATE CONSTRAINT fk_conversation_turns_template;

-- Add index for FK queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversation_turns_template_id
ON conversation_turns(template_id);

COMMIT;

-- DOWN MIGRATION
BEGIN;

DROP INDEX IF EXISTS idx_conversation_turns_template_id;
ALTER TABLE conversation_turns DROP CONSTRAINT IF EXISTS fk_conversation_turns_template;
ALTER TABLE conversation_turns DROP COLUMN IF EXISTS template_id;

COMMIT;
```

### 6. Creating a Compound Index

**Scenario:** Add compound index on `(status, created_at)` for efficient queries.

```typescript
import { createIndexConcurrently } from '@/lib/services/migration-utils';

const compoundIndex = createIndexConcurrently({
  table: 'conversations',
  indexName: 'idx_conversations_status_created_at',
  columns: ['status', 'created_at DESC'],
});

console.log(compoundIndex);
// CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_status_created_at
// ON conversations(status, created_at DESC);
```

**Migration:**
```sql
-- UP MIGRATION
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_status_created_at
ON conversations(status, created_at DESC);

-- DOWN MIGRATION
DROP INDEX CONCURRENTLY IF EXISTS idx_conversations_status_created_at;
```

### 7. Adding an Array Column

**Scenario:** Add `tags` array to `conversations`.

```sql
-- UP MIGRATION
BEGIN;

ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::TEXT[] NOT NULL;

-- GIN index for array searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_tags
ON conversations USING GIN (tags);

COMMIT;

-- DOWN MIGRATION
BEGIN;

DROP INDEX IF EXISTS idx_conversations_tags;
ALTER TABLE conversations DROP COLUMN IF EXISTS tags;

COMMIT;
```

**Usage in application:**
```typescript
// Query conversations with specific tag
const { data } = await supabase
  .from('conversations')
  .select('*')
  .contains('tags', ['important']);

// Query conversations with any of these tags
const { data } = await supabase
  .from('conversations')
  .select('*')
  .overlaps('tags', ['urgent', 'priority']);
```

### 8. Changing Column Type (Safe Pattern)

**Scenario:** Expand VARCHAR length from 255 to 1000.

```sql
-- UP MIGRATION
-- Safe: No data conversion needed, just metadata update
ALTER TABLE conversations
ALTER COLUMN title TYPE VARCHAR(1000);

-- DOWN MIGRATION
-- Safe: Shrinking is also instant if data fits
ALTER TABLE conversations
ALTER COLUMN title TYPE VARCHAR(255);
```

**For conversions requiring data transformation:**
```sql
-- UP MIGRATION (Multi-phase approach)
BEGIN;

-- Phase 1: Add new column
ALTER TABLE conversations
ADD COLUMN new_timestamp TIMESTAMPTZ;

-- Phase 2: Copy and convert data in batches
-- (Do this in a separate script or background job)
UPDATE conversations
SET new_timestamp = old_timestamp AT TIME ZONE 'UTC'
WHERE new_timestamp IS NULL
LIMIT 10000;

-- Phase 3: After all data is migrated
-- Create view for compatibility
CREATE VIEW conversations_v1 AS
SELECT
  *,
  new_timestamp AS old_timestamp
FROM conversations;

COMMIT;

-- Phase 4 (separate migration after verification):
-- Drop view and old column
```

### 9. Adding a Computed Column (Generated)

**Scenario:** Add computed `full_name` column.

```sql
-- UP MIGRATION
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS full_name TEXT
GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED;

-- No index needed initially, add if queries require it
-- CREATE INDEX CONCURRENTLY idx_user_profiles_full_name
-- ON user_profiles(full_name);

-- DOWN MIGRATION
ALTER TABLE user_profiles
DROP COLUMN IF EXISTS full_name;
```

### 10. Tracking Migration Programmatically

**Scenario:** Check migration status in application code.

```typescript
import { migrationManager } from '@/lib/services/migration-manager';

async function checkMigrationStatus() {
  // Get current schema version
  const version = await migrationManager.getCurrentVersion();
  console.log(`Current schema version: ${version}`);

  // Get all applied migrations
  const applied = await migrationManager.getAppliedMigrations();
  console.log(`Total migrations applied: ${applied.length}`);

  // List recent migrations
  const recent = applied.slice(-5);
  console.log('Recent migrations:');
  recent.forEach(m => {
    console.log(`  ${m.version}: ${m.description} (${m.applied_at})`);
  });

  // Check if specific migration was applied
  const targetVersion = 1698765432000;
  const isApplied = await migrationManager.isMigrationApplied(targetVersion);
  console.log(`Migration ${targetVersion} applied: ${isApplied}`);
}
```

### 11. Validating Migrations Before Applying

**Scenario:** Validate migration script before running.

```typescript
import { migrationManager } from '@/lib/services/migration-manager';

const migration = {
  version: Date.now(),
  description: 'Add priority field',
  up: `
    ALTER TABLE conversations
    ADD COLUMN priority TEXT DEFAULT 'medium' NOT NULL;
  `,
  down: `
    ALTER TABLE conversations
    DROP COLUMN priority;
  `,
};

// Validate migration
const result = migrationManager.validateMigration(migration);

if (!result.valid) {
  console.error('Migration validation failed:');
  result.errors.forEach(err => console.error(`  - ${err}`));
  process.exit(1);
}

console.log('Migration is valid!');

// Calculate checksum
const checksum = migrationManager.calculateChecksum(migration.up);
console.log(`Migration checksum: ${checksum}`);
```

### 12. Testing Migrations

**Scenario:** Test migration before production deployment.

```typescript
import { migrationTester } from '@/lib/services/migration-testing';

async function testMigration() {
  const upScript = `
    ALTER TABLE conversations
    ADD COLUMN test_field TEXT DEFAULT 'test' NOT NULL;
  `;

  const downScript = `
    ALTER TABLE conversations
    DROP COLUMN test_field;
  `;

  // Test migration can apply and rollback
  const result = await migrationTester.testMigration({
    upScript,
    downScript,
  });

  if (!result.success) {
    console.error('Migration test failed:');
    result.errors.forEach(err => console.error(`  - ${err}`));
    return;
  }

  console.log('Migration test passed!');
  console.log(`UP migration took: ${result.timing.up_ms}ms`);
  console.log(`DOWN migration took: ${result.timing.down_ms}ms`);

  // Verify schema changes
  const columnExists = await migrationTester.columnExists(
    'conversations',
    'test_field'
  );
  console.log(`Column exists: ${columnExists}`);
}
```

## 🎓 Best Practice Patterns

### Pattern 1: Always Use DEFAULT for NOT NULL Columns

```typescript
// ✅ GOOD
const sql = addColumnSafely({
  table: 'conversations',
  column: 'priority',
  type: 'TEXT',
  defaultValue: "'medium'",
  notNull: true,
});

// ❌ BAD - Causes table rewrite
// ALTER TABLE conversations
// ADD COLUMN priority TEXT NOT NULL;
```

### Pattern 2: Use NOT VALID for Constraints

```typescript
// ✅ GOOD
const { add, validate } = addConstraintSafely({
  table: 'conversations',
  constraintName: 'chk_priority',
  constraintDefinition: "CHECK (priority IN ('low', 'medium', 'high'))",
});
// Use add immediately, validate later

// ❌ BAD - Full table scan with lock
// ALTER TABLE conversations
// ADD CONSTRAINT chk_priority
// CHECK (priority IN ('low', 'medium', 'high'));
```

### Pattern 3: Always Use CONCURRENTLY for Indexes

```typescript
// ✅ GOOD
const sql = createIndexConcurrently({
  table: 'conversations',
  indexName: 'idx_conversations_status',
  columns: ['status'],
});

// ❌ BAD - Locks table
// CREATE INDEX idx_conversations_status
// ON conversations(status);
```

### Pattern 4: Multi-phase for Renames

```typescript
// ✅ GOOD - Multi-phase approach
const steps = renameColumnSafely({
  table: 'conversations',
  oldColumn: 'old_name',
  newColumn: 'new_name',
  columnType: 'TEXT',
});
// Deploy phases separately with verification

// ❌ BAD - Breaks existing code
// ALTER TABLE conversations
// RENAME COLUMN old_name TO new_name;
```

## 📚 Additional Resources

- **Full Documentation:** `docs/migrations.md`
- **Quick Start:** `docs/migrations-quick-start.md`
- **Setup Guide:** `docs/migration-framework-setup.md`
- **Example Migrations:** `supabase/migrations/example_*.sql`

---

**Last Updated:** October 31, 2023

