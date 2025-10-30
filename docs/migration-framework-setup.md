# Migration Framework Setup

## Overview

The database migration framework is now fully implemented and ready to use. This document covers the complete setup and integration.

## Files Created

### Core Services

1. **`src/lib/services/migration-manager.ts`**
   - Manages migration tracking and versioning
   - Records applied migrations in `schema_migrations` table
   - Validates migration scripts
   - Calculates checksums for integrity verification

2. **`src/lib/services/migration-utils.ts`**
   - Safe migration pattern utilities
   - Functions for adding columns, constraints, indexes
   - Column rename helpers
   - Migration template generator

3. **`src/lib/services/migration-testing.ts`**
   - Testing utilities for migrations
   - Schema verification functions
   - Data integrity checks

### CLI Tools

4. **`src/scripts/migrate.ts`**
   - Command-line migration tool
   - Commands: `status`, `up`, `down`, `create`
   - Manages migration execution

5. **`src/scripts/test-migration-framework.ts`**
   - Test suite for the migration framework
   - Demonstrates usage of all utilities

### Documentation

6. **`docs/migrations.md`**
   - Comprehensive migration guide
   - Safe patterns and best practices
   - Common scenarios and troubleshooting

7. **`docs/migrations-quick-start.md`**
   - 5-minute quick start guide
   - Essential commands and workflows

8. **`docs/migration-framework-setup.md`** (this file)
   - Setup instructions
   - Integration guide

### Examples

9. **`supabase/migrations/example_add_conversation_priority.sql`**
   - Example: Adding a column with constraints and indexes
   - Demonstrates safe patterns

10. **`supabase/migrations/example_rename_column_safe.sql`**
    - Example: Renaming a column with zero downtime
    - Multi-phase approach demonstration

## Package.json Scripts (Optional)

Add these convenience scripts to your `package.json`:

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

Then use as:

```bash
npm run migrate:status
npm run migrate:create "Add user preferences"
npm run migrate:up
npm run migrate:test
```

## Environment Setup

### Prerequisites

- Node.js and TypeScript installed
- `tsx` for running TypeScript files
- Supabase project configured
- Environment variables set in `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Requirements

The `schema_migrations` table should already exist with this structure:

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  version BIGINT PRIMARY KEY,
  description TEXT NOT NULL,
  applied_at TIMESTAMP DEFAULT NOW(),
  applied_by TEXT,
  execution_time_ms INTEGER,
  checksum TEXT
);
```

## Quick Start

### 1. Verify Installation

```bash
# Test the migration framework
tsx src/scripts/test-migration-framework.ts
```

This runs a comprehensive test suite that:
- Tests the migration manager
- Validates safe migration utilities
- Demonstrates all functionality

### 2. Check Migration Status

```bash
tsx src/scripts/migrate.ts status
```

### 3. Create Your First Migration

```bash
tsx src/scripts/migrate.ts create --description "Add user preferences to user_profiles"
```

### 4. Edit and Apply

1. Edit the generated migration file
2. Test in development:
   ```bash
   tsx src/scripts/migrate.ts up
   ```
3. Test rollback:
   ```bash
   tsx src/scripts/migrate.ts down --steps 1
   ```

## Integration with Supabase

The migration framework works alongside Supabase migrations:

### Option 1: Use Framework Directly

```bash
tsx src/scripts/migrate.ts create --description "Your migration"
# Edit the file in supabase/migrations/
tsx src/scripts/migrate.ts up
```

### Option 2: Use Supabase CLI + Framework Tools

```bash
# Create migration with Supabase CLI
supabase migration new add_user_preferences

# Use framework utilities to generate safe SQL
tsx -e "
import { addColumnSafely } from './src/lib/services/migration-utils';
console.log(addColumnSafely({
  table: 'user_profiles',
  column: 'preferences',
  type: 'JSONB',
  defaultValue: \"'{}'::JSONB\",
  notNull: true
}));
"

# Copy the generated SQL to your migration file
# Then apply with Supabase CLI
supabase db push
```

### Option 3: Hybrid Approach

Use the framework for development and testing, then commit migrations to Supabase:

```bash
# Development: Use framework
tsx src/scripts/migrate.ts create --description "Add field"
tsx src/scripts/migrate.ts up  # Test locally

# Production: Use Supabase CLI
supabase db push  # Deploy to Supabase
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Database Migrations

on:
  push:
    branches: [main]
    paths:
      - 'supabase/migrations/**'

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run migration tests
        run: npm run migrate:test
      
      - name: Apply migrations to staging
        if: github.ref == 'refs/heads/main'
        env:
          SUPABASE_URL: ${{ secrets.STAGING_SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.STAGING_SUPABASE_KEY }}
        run: npm run migrate:up
      
      - name: Verify migrations
        run: npm run migrate:status
```

## Development Workflow

### Daily Development

1. **Check status:**
   ```bash
   tsx src/scripts/migrate.ts status
   ```

2. **Create migration:**
   ```bash
   tsx src/scripts/migrate.ts create --description "Your change"
   ```

3. **Edit migration file** in `supabase/migrations/`

4. **Use utilities to generate safe SQL:**
   ```typescript
   import { addColumnSafely } from '@/lib/services/migration-utils';
   const sql = addColumnSafely({ ... });
   ```

5. **Test locally:**
   ```bash
   tsx src/scripts/migrate.ts up
   ```

6. **Test rollback:**
   ```bash
   tsx src/scripts/migrate.ts down --steps 1
   ```

7. **Commit migration file** to version control

### Code Review Checklist

When reviewing migrations:

- [ ] Uses safe patterns (DEFAULT, NOT VALID, CONCURRENTLY)
- [ ] DOWN script properly reverses UP script
- [ ] Backward compatible
- [ ] No dangerous operations without justification
- [ ] Appropriate indexes created
- [ ] Comments explain complex logic
- [ ] Tested locally

### Deployment Process

1. **Staging:**
   - Deploy migration to staging database
   - Run automated tests
   - Manual verification

2. **Production:**
   - Schedule during low-traffic period
   - Apply migration
   - Monitor performance
   - Keep rollback ready

3. **Post-deployment:**
   - Verify data integrity
   - Monitor logs for errors
   - Update documentation if needed

## Troubleshooting

### Issue: Migration Manager Can't Connect

**Solution:** Check environment variables:

```bash
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Ensure `.env` file is properly configured.

### Issue: Migration Version Conflicts

**Solution:** Use timestamps for versions (already default):

```typescript
const version = Date.now(); // Always unique
```

### Issue: Migration Failed Partially

**Solution:**

1. Check current state:
   ```bash
   tsx src/scripts/migrate.ts status
   ```

2. Manually fix database if needed

3. Update migration record:
   ```typescript
   import { migrationManager } from '@/lib/services/migration-manager';
   await migrationManager.recordMigration({ ... });
   ```

### Issue: Need to Skip a Migration

**Solution:**

```typescript
// Manually record as applied without executing
import { migrationManager } from '@/lib/services/migration-manager';

await migrationManager.recordMigration({
  version: 1698765432000,
  description: 'Skipped migration',
  executionTimeMs: 0,
  checksum: 'manual',
  appliedBy: 'admin',
});
```

## Advanced Usage

### Custom Migration Scripts

For complex migrations, write custom scripts:

```typescript
import { migrationManager } from '@/lib/services/migration-manager';
import { createClient } from '@/lib/supabase';

async function customMigration() {
  const supabase = createClient();
  
  // Complex logic here
  
  await migrationManager.recordMigration({
    version: Date.now(),
    description: 'Custom migration',
    executionTimeMs: 100,
    checksum: migrationManager.calculateChecksum('...'),
  });
}

customMigration();
```

### Batch Data Migrations

For large data updates:

```typescript
async function batchUpdate() {
  const supabase = createClient();
  const batchSize = 1000;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('large_table')
      .select('id, old_field')
      .range(offset, offset + batchSize - 1);

    if (error || !data || data.length === 0) {
      hasMore = false;
      continue;
    }

    // Update batch
    for (const row of data) {
      await supabase
        .from('large_table')
        .update({ new_field: transformData(row.old_field) })
        .eq('id', row.id);
    }

    offset += batchSize;
    console.log(`Processed ${offset} rows...`);
  }
}
```

## Resources

- **Quick Start:** `docs/migrations-quick-start.md`
- **Full Documentation:** `docs/migrations.md`
- **Example Migrations:** `supabase/migrations/example_*.sql`
- **Test Suite:** `src/scripts/test-migration-framework.ts`

## Support

For questions or issues:

1. Check the documentation
2. Review example migrations
3. Run the test suite
4. Consult with the team

## Next Steps

1. ✅ Run the test suite: `tsx src/scripts/test-migration-framework.ts`
2. ✅ Check migration status: `tsx src/scripts/migrate.ts status`
3. ✅ Read the quick start: `docs/migrations-quick-start.md`
4. ✅ Review examples: `supabase/migrations/example_*.sql`
5. ✅ Create a test migration in development
6. ✅ Practice the full workflow before production use

---

**Migration Framework Version:** 1.0.0  
**Last Updated:** October 31, 2023

