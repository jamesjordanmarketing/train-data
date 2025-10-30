# Migration Framework Quick Start

This guide gets you up and running with the database migration framework in 5 minutes.

## Installation

The migration framework is already installed. No additional dependencies needed.

## Quick Start

### 1. Check Migration Status

```bash
tsx src/scripts/migrate.ts status
```

This shows:
- Current schema version
- List of applied migrations
- Migration history with timestamps

### 2. Create Your First Migration

```bash
tsx src/scripts/migrate.ts create --description "Add user preferences"
```

This generates a timestamped migration file in `supabase/migrations/`.

### 3. Edit the Migration

Open the generated file and add your SQL:

```sql
-- UP MIGRATION
BEGIN;

ALTER TABLE user_profiles
ADD COLUMN preferences JSONB DEFAULT '{}'::JSONB NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_preferences
ON user_profiles USING GIN (preferences);

COMMIT;

-- DOWN MIGRATION
BEGIN;

DROP INDEX IF EXISTS idx_user_profiles_preferences;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS preferences;

COMMIT;
```

### 4. Test the Migration

```bash
# Apply the migration
tsx src/scripts/migrate.ts up

# Verify in your database
# ...

# Test rollback
tsx src/scripts/migrate.ts down --steps 1

# Re-apply if everything looks good
tsx src/scripts/migrate.ts up
```

## Using the Migration Utilities

Instead of writing SQL manually, use the safe migration utilities:

```typescript
import {
  addColumnSafely,
  createIndexConcurrently,
} from '@/lib/services/migration-utils';

// Generate safe SQL for adding a column
const sql = addColumnSafely({
  table: 'user_profiles',
  column: 'preferences',
  type: 'JSONB',
  defaultValue: "'{}'::JSONB",
  notNull: true,
});

console.log(sql);
// ALTER TABLE user_profiles
// ADD COLUMN IF NOT EXISTS preferences JSONB
// DEFAULT '{}'::JSONB NOT NULL;
```

## Common Commands

```bash
# Show current status
tsx src/scripts/migrate.ts status

# Create new migration
tsx src/scripts/migrate.ts create --description "Your description here"

# Apply all pending migrations
tsx src/scripts/migrate.ts up

# Rollback last migration
tsx src/scripts/migrate.ts down --steps 1

# Rollback last 3 migrations
tsx src/scripts/migrate.ts down --steps 3
```

## Example Migrations

Check out the example migrations in `supabase/migrations/`:

1. **example_add_conversation_priority.sql** - Shows safe patterns for:
   - Adding columns with DEFAULT values
   - Adding constraints with NOT VALID
   - Creating indexes CONCURRENTLY
   - Proper rollback scripts

2. **example_rename_column_safe.sql** - Shows how to:
   - Rename columns with zero downtime
   - Maintain backward compatibility
   - Use views for transition periods
   - Multi-phase deployment approach

## Safety Checklist

Before deploying a migration to production:

- [ ] Tested in development environment
- [ ] Tested rollback (down script)
- [ ] Uses safe patterns (DEFAULT, NOT VALID, CONCURRENTLY)
- [ ] Backward compatible with current application
- [ ] Reviewed by another developer
- [ ] Tested on staging with production-like data volume
- [ ] Monitoring plan in place
- [ ] Rollback plan ready

## Need Help?

- **Full documentation:** `docs/migrations.md`
- **Example migrations:** `supabase/migrations/example_*.sql`
- **Safe patterns:** Review `src/lib/services/migration-utils.ts`

## Troubleshooting

### Migration Won't Apply

```bash
# Check current state
tsx src/scripts/migrate.ts status

# Look for error messages in the output
```

### Need to Rollback

```bash
# Rollback last migration
tsx src/scripts/migrate.ts down --steps 1
```

### Manual Database Changes Needed

Connect to your database and run SQL directly. Then record the migration:

```typescript
import { migrationManager } from '@/lib/services/migration-manager';

await migrationManager.recordMigration({
  version: 1698765432000,
  description: 'Manual fix for issue X',
  executionTimeMs: 0,
  checksum: 'manual',
  appliedBy: 'admin',
});
```

## Next Steps

1. Read the full documentation: `docs/migrations.md`
2. Study the example migrations
3. Create a test migration in development
4. Practice the workflow before using in production

