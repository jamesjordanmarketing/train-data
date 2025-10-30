# Database Migration Framework

A production-ready, zero-downtime database migration framework for the Interactive LoRA Conversation Generation platform.

## 🚀 Quick Start

```bash
# Check current migration status
tsx src/scripts/migrate.ts status

# Create a new migration
tsx src/scripts/migrate.ts create --description "Add user preferences"

# Apply migrations
tsx src/scripts/migrate.ts up

# Rollback last migration
tsx src/scripts/migrate.ts down --steps 1

# Test the framework
tsx src/scripts/test-migration-framework.ts
```

## 📚 Documentation

- **[Quick Start Guide](docs/migrations-quick-start.md)** - Get started in 5 minutes
- **[Full Documentation](docs/migrations.md)** - Comprehensive guide with patterns and best practices
- **[Setup Guide](docs/migration-framework-setup.md)** - Installation and integration instructions

## 🏗️ Architecture

### Core Components

```
src/lib/services/
├── migration-manager.ts      # Migration tracking and version management
├── migration-utils.ts         # Safe migration pattern utilities
└── migration-testing.ts       # Testing and verification utilities

src/scripts/
├── migrate.ts                 # CLI tool for managing migrations
└── test-migration-framework.ts # Test suite

supabase/migrations/
├── example_add_conversation_priority.sql  # Example: Adding columns safely
└── example_rename_column_safe.sql         # Example: Renaming with zero downtime

docs/
├── migrations.md              # Complete documentation
├── migrations-quick-start.md  # Quick start guide
└── migration-framework-setup.md # Setup instructions
```

## ✨ Features

### Safe Migration Patterns

✅ **Zero-downtime deployments**
- Add columns with DEFAULT values (no table rewrite)
- Create indexes CONCURRENTLY (no locks)
- Add constraints with NOT VALID (instant)

✅ **Backward compatibility**
- Multi-phase column renaming
- View-based compatibility layers
- Reversible migrations

✅ **Safety validations**
- Dangerous operation detection
- Checksum verification
- Migration validation before applying

✅ **Testing utilities**
- Test migrations before deployment
- Verify schema changes
- Check data integrity

## 📖 Usage Examples

### Create a Safe Migration

```typescript
import { addColumnSafely, createIndexConcurrently } from '@/lib/services/migration-utils';

// Generate safe SQL for adding a column
const sql = addColumnSafely({
  table: 'conversations',
  column: 'priority',
  type: 'TEXT',
  defaultValue: "'medium'",
  notNull: true,
});
// Result: ALTER TABLE conversations
//         ADD COLUMN IF NOT EXISTS priority TEXT
//         DEFAULT 'medium' NOT NULL;

// Generate safe index creation
const indexSql = createIndexConcurrently({
  table: 'conversations',
  indexName: 'idx_conversations_priority',
  columns: ['priority'],
  where: "status = 'active'"
});
```

### Track Migrations Programmatically

```typescript
import { migrationManager } from '@/lib/services/migration-manager';

// Get current schema version
const version = await migrationManager.getCurrentVersion();

// Get all applied migrations
const applied = await migrationManager.getAppliedMigrations();

// Check if specific migration was applied
const isApplied = await migrationManager.isMigrationApplied(1698765432000);

// Validate migration before applying
const validation = migrationManager.validateMigration({
  version: Date.now(),
  description: 'Add user preferences',
  up: 'ALTER TABLE users ADD COLUMN preferences JSONB;',
  down: 'ALTER TABLE users DROP COLUMN preferences;',
});

if (!validation.valid) {
  console.error('Migration validation failed:', validation.errors);
}
```

### Test Migrations

```typescript
import { migrationTester } from '@/lib/services/migration-testing';

// Test migration can apply and rollback
const result = await migrationTester.testMigration({
  upScript: 'ALTER TABLE test ADD COLUMN test_col TEXT;',
  downScript: 'ALTER TABLE test DROP COLUMN test_col;',
});

// Verify schema changes
const columnExists = await migrationTester.columnExists('conversations', 'priority');
const indexExists = await migrationTester.indexExists('idx_conversations_priority');
```

## 🎯 Key Features

### 1. Version Tracking

All migrations are tracked in the `schema_migrations` table:

```sql
CREATE TABLE schema_migrations (
  version BIGINT PRIMARY KEY,           -- Timestamp-based version
  description TEXT NOT NULL,             -- Human-readable description
  applied_at TIMESTAMP DEFAULT NOW(),    -- When applied
  applied_by TEXT,                       -- Who applied it
  execution_time_ms INTEGER,             -- How long it took
  checksum TEXT                          -- Integrity verification
);
```

### 2. Safe Patterns Library

Pre-built utilities for common operations:

- **`addColumnSafely`** - Add columns without table rewrites
- **`addConstraintSafely`** - Add constraints with NOT VALID pattern
- **`createIndexConcurrently`** - Create indexes without locks
- **`renameColumnSafely`** - Rename columns with backward compatibility
- **`dropColumnSafely`** - Two-phase column removal
- **`generateMigrationTemplate`** - Standard migration template

### 3. CLI Tool

Manage migrations from command line:

```bash
# Check status
tsx src/scripts/migrate.ts status

# Create new migration
tsx src/scripts/migrate.ts create --description "Your change"

# Apply migrations
tsx src/scripts/migrate.ts up

# Rollback
tsx src/scripts/migrate.ts down --steps N
```

### 4. Validation & Testing

- Validates migrations before applying
- Detects dangerous operations (DROP TABLE, TRUNCATE)
- Tests migrations in development
- Verifies schema changes
- Checks data integrity

## 📋 Best Practices

### DO ✅

- Always write reversible migrations
- Use safe patterns (DEFAULT, NOT VALID, CONCURRENTLY)
- Test in development first
- Deploy database changes before app changes
- Keep migrations small and focused
- Monitor after deployment

### DON'T ❌

- Modify existing applied migrations
- Use DROP TABLE without extreme caution
- Add NOT NULL without DEFAULT on large tables
- Create indexes without CONCURRENTLY
- Skip testing
- Combine unrelated changes

## 🔍 Safety Features

### Dangerous Operation Detection

The framework automatically detects and warns about:

- `DROP TABLE` - Data loss risk
- `TRUNCATE` - Irreversible deletion
- `DELETE FROM ... WHERE 1=1` - Bulk deletion

### Validation Checks

Before applying migrations:

- ✅ Version must be positive
- ✅ Description is required
- ✅ UP and DOWN scripts are required
- ✅ No dangerous operations
- ✅ Checksum verification

### Rollback Support

Every migration must have a DOWN script:

```sql
-- UP MIGRATION
ALTER TABLE users ADD COLUMN preferences JSONB;

-- DOWN MIGRATION (ROLLBACK)
ALTER TABLE users DROP COLUMN preferences;
```

## 📊 Example Migrations

### Example 1: Add Column with Constraint

```sql
-- Safe: No table rewrite
ALTER TABLE conversations
ADD COLUMN priority TEXT DEFAULT 'medium' NOT NULL;

-- Add constraint without validation
ALTER TABLE conversations
ADD CONSTRAINT chk_priority
CHECK (priority IN ('low', 'medium', 'high'))
NOT VALID;

-- Validate in background
ALTER TABLE conversations
VALIDATE CONSTRAINT chk_priority;

-- Add index without locks
CREATE INDEX CONCURRENTLY idx_conversations_priority
ON conversations(priority);
```

### Example 2: Rename Column (Zero Downtime)

```sql
-- Phase 1: Add new column and compatibility view
ALTER TABLE conversations ADD COLUMN conversation_status TEXT;
UPDATE conversations SET conversation_status = status;
CREATE VIEW conversations_v1 AS 
  SELECT *, conversation_status AS status FROM conversations;

-- Phase 2: Update application code (deploy separately)

-- Phase 3: Clean up (separate migration after verification)
DROP VIEW conversations_v1;
ALTER TABLE conversations DROP COLUMN status;
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
tsx src/scripts/test-migration-framework.ts
```

This tests:
- Migration manager functionality
- Safe migration utilities
- Migration validation
- Checksum calculation
- Dangerous operation detection

## 🔧 Configuration

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Optional: Package.json Scripts

```json
{
  "scripts": {
    "migrate:status": "tsx src/scripts/migrate.ts status",
    "migrate:up": "tsx src/scripts/migrate.ts up",
    "migrate:down": "tsx src/scripts/migrate.ts down --steps 1",
    "migrate:create": "tsx src/scripts/migrate.ts create --description",
    "migrate:test": "tsx src/scripts/test-migration-framework.ts"
  }
}
```

## 📈 Workflow

### Development

1. Create migration: `tsx src/scripts/migrate.ts create --description "..."`
2. Edit migration file with safe SQL patterns
3. Test locally: `tsx src/scripts/migrate.ts up`
4. Test rollback: `tsx src/scripts/migrate.ts down --steps 1`
5. Commit to version control

### Staging

1. Deploy migration to staging database
2. Run automated tests
3. Manual verification
4. Load testing if needed

### Production

1. Schedule during low-traffic period
2. Apply migration: `tsx src/scripts/migrate.ts up`
3. Monitor performance and errors
4. Keep rollback ready for 24-48 hours

## 🆘 Troubleshooting

### Migration Failed

```bash
# Check status
tsx src/scripts/migrate.ts status

# Rollback if needed
tsx src/scripts/migrate.ts down --steps 1
```

### Index Creation Failed

```sql
-- Find invalid indexes
SELECT indexrelid::regclass FROM pg_index WHERE NOT indisvalid;

-- Drop and recreate
DROP INDEX CONCURRENTLY invalid_index_name;
CREATE INDEX CONCURRENTLY new_index_name ON table(column);
```

### Manual Intervention Needed

```typescript
import { migrationManager } from '@/lib/services/migration-manager';

// Record manual fix
await migrationManager.recordMigration({
  version: Date.now(),
  description: 'Manual fix for issue X',
  executionTimeMs: 0,
  checksum: 'manual',
  appliedBy: 'admin',
});
```

## 📚 Additional Resources

- [PostgreSQL ALTER TABLE Documentation](https://www.postgresql.org/docs/current/sql-altertable.html)
- [Supabase Migration Guide](https://supabase.com/docs/guides/database/migrations)
- [Zero Downtime Database Migrations](https://www.braintreepayments.com/blog/safe-operations-for-high-volume-postgresql/)

## 🤝 Contributing

When adding new migration patterns:

1. Add utility function to `migration-utils.ts`
2. Add tests to `test-migration-framework.ts`
3. Document in `docs/migrations.md`
4. Create example migration in `supabase/migrations/`

## 📝 License

Part of the Interactive LoRA Conversation Generation platform.

---

**Version:** 1.0.0  
**Status:** Production Ready ✅  
**Last Updated:** October 31, 2023

