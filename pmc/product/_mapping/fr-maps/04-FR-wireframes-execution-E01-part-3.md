# Train Platform - Prompt 2: Schema Migration Framework

**Generated**: 2025-10-30  
**Source**: E01-Part-2 (Migration Framework Implementation)  
**Scope**: Migration manager, safe migration patterns, version control  
**Dependencies**: Prompt 1 complete, schema_migrations table created in database  
**Estimated Time**: 12-16 hours  
**Risk Level**: High (affects deployment safety)

---

## Instructions for Use

This is a **standalone prompt** ready to be pasted into Claude-4.5-sonnet Thinking LLM in Cursor.

**Prerequisites (MUST be complete before running):**
- ✅ Prompt 1 (Database Performance Monitoring Service) has been implemented
- ✅ `schema_migrations` table has been created in Supabase database
- ✅ All monitoring tables exist: query_performance_logs, index_usage_snapshots, table_bloat_snapshots, performance_alerts
- ✅ All monitoring functions exist: capture_index_usage_snapshot(), detect_unused_indexes(), etc.

**To execute:**
1. Copy everything from the marker line below (========================) to the end marker (+++++++++++++++++)
2. Paste into a fresh Claude-4.5-sonnet context window in Cursor
3. Let Claude implement all deliverables completely

---

========================


You are a database architect implementing a safe schema migration framework for the Interactive LoRA Conversation Generation platform.

**CONTEXT AND REQUIREMENTS:**

**Challenge**: The system must support zero-downtime deployments with backward-compatible schema changes. Migrations must be reversible, versioned, and testable.

**Current Codebase State:**

Database Tables (DO NOT MODIFY):
- All train module tables exist: conversations, conversation_turns, conversation_templates, scenarios, edge_cases, generation_logs, export_logs, batch_jobs
- Monitoring tables exist: query_performance_logs, index_usage_snapshots, table_bloat_snapshots, performance_alerts
- Schema tracking table exists: schema_migrations (already created with version, description, applied_at, applied_by, execution_time_ms, checksum columns)
- Supabase migrations directory exists at `supabase/migrations/`

Database Functions (DO NOT MODIFY):
- Performance monitoring functions: capture_index_usage_snapshot(), detect_unused_indexes(), capture_table_bloat_snapshot(), get_slow_queries(), create_performance_alert(), check_table_bloat_alerts()
- Maintenance functions: vacuum_analyze_table(), reindex_if_bloated(), weekly_maintenance()

Existing Services (DO NOT MODIFY):
- `src/lib/supabase.ts`: Supabase client configuration
- `src/lib/database.ts`: Generic database service patterns
- `src/lib/services/query-performance-service.ts`: Query performance logging
- `src/lib/services/index-monitoring-service.ts`: Index usage monitoring
- `src/lib/services/bloat-monitoring-service.ts`: Table bloat tracking

**IMPLEMENTATION TASKS:**

**1. Migration Manager Service** (`src/lib/services/migration-manager.ts`)

Create service to manage database migrations:

```typescript
import { createClient } from '@/lib/supabase';
import { createHash } from 'crypto';

interface Migration {
  version: number;
  description: string;
  applied_at?: string;
  applied_by?: string;
  execution_time_ms?: number;
  checksum?: string;
}

interface MigrationScript {
  version: number;
  description: string;
  up: string;
  down: string;
}

export class MigrationManager {
  private supabase = createClient();

  /**
   * Get current schema version
   */
  async getCurrentVersion(): Promise<number> {
    const { data, error } = await this.supabase
      .from('schema_migrations')
      .select('version')
      .order('version', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Failed to get current version:', error);
      return 0;
    }

    return data?.[0]?.version || 0;
  }

  /**
   * Get all applied migrations
   */
  async getAppliedMigrations(): Promise<Migration[]> {
    const { data, error } = await this.supabase
      .from('schema_migrations')
      .select('*')
      .order('version', { ascending: true });

    if (error) {
      console.error('Failed to get applied migrations:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Check if migration has been applied
   */
  async isMigrationApplied(version: number): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('schema_migrations')
      .select('version')
      .eq('version', version)
      .single();

    return !!data && !error;
  }

  /**
   * Record migration as applied
   */
  async recordMigration(params: {
    version: number;
    description: string;
    executionTimeMs: number;
    checksum: string;
    appliedBy?: string;
  }): Promise<void> {
    const { error } = await this.supabase
      .from('schema_migrations')
      .insert({
        version: params.version,
        description: params.description,
        execution_time_ms: params.executionTimeMs,
        checksum: params.checksum,
        applied_by: params.appliedBy,
      });

    if (error) {
      throw new Error(`Failed to record migration: ${error.message}`);
    }
  }

  /**
   * Remove migration record (for rollback)
   */
  async removeMigration(version: number): Promise<void> {
    const { error } = await this.supabase
      .from('schema_migrations')
      .delete()
      .eq('version', version);

    if (error) {
      throw new Error(`Failed to remove migration: ${error.message}`);
    }
  }

  /**
   * Calculate checksum of migration script
   */
  calculateChecksum(script: string): string {
    return createHash('md5').update(script).digest('hex');
  }

  /**
   * Validate migration script
   */
  validateMigration(migration: MigrationScript): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (migration.version <= 0) {
      errors.push('Version must be positive');
    }

    if (!migration.description) {
      errors.push('Description is required');
    }

    if (!migration.up || migration.up.trim().length === 0) {
      errors.push('Up migration script is required');
    }

    if (!migration.down || migration.down.trim().length === 0) {
      errors.push('Down migration script is required');
    }

    // Check for dangerous operations
    const dangerousPatterns = [
      /DROP\s+TABLE/i,
      /TRUNCATE/i,
      /DELETE\s+FROM.*WHERE\s+1=1/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(migration.up)) {
        errors.push(`Dangerous operation detected: ${pattern.source}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const migrationManager = new MigrationManager();
```

**2. Safe Migration Utilities** (`src/lib/services/migration-utils.ts`)

Create utility functions for safe migration patterns:

```typescript
/**
 * Safe migration patterns for zero-downtime deployments
 */

/**
 * Pattern 1: Add column with default value (no table rewrite)
 * 
 * Example:
 * ALTER TABLE conversations 
 * ADD COLUMN new_field TEXT DEFAULT 'default_value' NOT NULL;
 */
export function addColumnSafely(params: {
  table: string;
  column: string;
  type: string;
  defaultValue?: string;
  notNull?: boolean;
}): string {
  const { table, column, type, defaultValue, notNull } = params;
  
  let sql = `ALTER TABLE ${table}\nADD COLUMN IF NOT EXISTS ${column} ${type}`;
  
  if (defaultValue !== undefined) {
    sql += `\nDEFAULT ${defaultValue}`;
  }
  
  if (notNull) {
    sql += ' NOT NULL';
  }
  
  sql += ';';
  
  return sql;
}

/**
 * Pattern 2: Add constraint without full table scan (NOT VALID pattern)
 * 
 * Example:
 * ALTER TABLE conversations
 * ADD CONSTRAINT chk_quality_score 
 * CHECK (quality_score >= 0 AND quality_score <= 10)
 * NOT VALID;
 * 
 * -- Then later validate:
 * ALTER TABLE conversations
 * VALIDATE CONSTRAINT chk_quality_score;
 */
export function addConstraintSafely(params: {
  table: string;
  constraintName: string;
  constraintDefinition: string;
}): { add: string; validate: string } {
  const { table, constraintName, constraintDefinition } = params;
  
  return {
    add: `ALTER TABLE ${table}\nADD CONSTRAINT ${constraintName}\n${constraintDefinition}\nNOT VALID;`,
    validate: `ALTER TABLE ${table}\nVALIDATE CONSTRAINT ${constraintName};`,
  };
}

/**
 * Pattern 3: Rename column with backward-compatible view
 * 
 * Example:
 * Step 1: Add new column
 * Step 2: Copy data from old to new
 * Step 3: Create view with old name
 * Step 4: Update application code
 * Step 5: Drop view and old column
 */
export function renameColumnSafely(params: {
  table: string;
  oldColumn: string;
  newColumn: string;
  columnType: string;
}): {
  step1_add: string;
  step2_copy: string;
  step3_view: string;
  step4_drop_old: string;
} {
  const { table, oldColumn, newColumn, columnType } = params;
  
  return {
    step1_add: `ALTER TABLE ${table}\nADD COLUMN ${newColumn} ${columnType};`,
    step2_copy: `UPDATE ${table}\nSET ${newColumn} = ${oldColumn}\nWHERE ${newColumn} IS NULL;`,
    step3_view: `CREATE OR REPLACE VIEW ${table}_compat AS\nSELECT\n  *,\n  ${newColumn} AS ${oldColumn}\nFROM ${table};`,
    step4_drop_old: `ALTER TABLE ${table}\nDROP COLUMN ${oldColumn};`,
  };
}

/**
 * Pattern 4: Create index concurrently (no table locks)
 * 
 * Example:
 * CREATE INDEX CONCURRENTLY idx_conversations_new_field
 * ON conversations(new_field);
 */
export function createIndexConcurrently(params: {
  table: string;
  indexName: string;
  columns: string[];
  unique?: boolean;
  where?: string;
}): string {
  const { table, indexName, columns, unique, where } = params;
  
  let sql = 'CREATE';
  
  if (unique) {
    sql += ' UNIQUE';
  }
  
  sql += ` INDEX CONCURRENTLY IF NOT EXISTS ${indexName}`;
  sql += `\nON ${table}(${columns.join(', ')})`;
  
  if (where) {
    sql += `\nWHERE ${where}`;
  }
  
  sql += ';';
  
  return sql;
}

/**
 * Pattern 5: Drop column safely (two-phase approach)
 * 
 * Example:
 * Phase 1: Stop writing to column (application update)
 * Phase 2: Drop column after verification
 */
export function dropColumnSafely(params: {
  table: string;
  column: string;
}): { verify: string; drop: string } {
  const { table, column } = params;
  
  return {
    verify: `SELECT COUNT(*) as recent_updates\nFROM ${table}\nWHERE updated_at > NOW() - INTERVAL '7 days'\n  AND ${column} IS NOT NULL;`,
    drop: `ALTER TABLE ${table}\nDROP COLUMN IF EXISTS ${column};`,
  };
}

/**
 * Generate migration template
 */
export function generateMigrationTemplate(params: {
  version: number;
  description: string;
}): string {
  const { version, description } = params;
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  
  return `-- Migration: ${version}
-- Description: ${description}
-- Date: ${timestamp}
-- Author: [Your Name]

-- ============================================================================
-- UP MIGRATION
-- ============================================================================

-- Add your schema changes here
-- Use safe migration patterns:
--   - Add columns with DEFAULT values to avoid table rewrites
--   - Use NOT VALID constraints, then VALIDATE separately
--   - Create indexes CONCURRENTLY to avoid locks
--   - Use views for backward compatibility during column renames

BEGIN;

-- Your migration code here

COMMIT;

-- ============================================================================
-- DOWN MIGRATION (ROLLBACK)
-- ============================================================================

-- Reverse your changes here
-- This should restore the schema to its previous state

BEGIN;

-- Your rollback code here

COMMIT;
`;
}
```

**3. Migration CLI Tool** (`src/scripts/migrate.ts`)

Create command-line tool for running migrations:

```typescript
#!/usr/bin/env tsx

import { migrationManager } from '@/lib/services/migration-manager';
import { createClient } from '@/lib/supabase';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface CLIOptions {
  command: 'status' | 'up' | 'down' | 'create';
  version?: number;
  description?: string;
  steps?: number;
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  switch (options.command) {
    case 'status':
      await showStatus();
      break;
    case 'up':
      await migrateUp(options.version);
      break;
    case 'down':
      await migrateDown(options.steps || 1);
      break;
    case 'create':
      await createMigration(options.description!);
      break;
    default:
      showHelp();
  }
}

async function showStatus() {
  console.log('Migration Status:\n');
  
  const currentVersion = await migrationManager.getCurrentVersion();
  console.log(`Current Version: ${currentVersion}\n`);
  
  const applied = await migrationManager.getAppliedMigrations();
  console.log('Applied Migrations:');
  applied.forEach(m => {
    console.log(`  ${m.version}: ${m.description} (${m.applied_at})`);
  });
}

async function migrateUp(targetVersion?: number) {
  console.log('Running migrations...\n');
  
  const currentVersion = await migrationManager.getCurrentVersion();
  console.log(`Current version: ${currentVersion}`);
  
  // In a real implementation, you would:
  // 1. Read migration files from disk
  // 2. Filter migrations > currentVersion
  // 3. Sort by version
  // 4. Execute each migration
  // 5. Record in schema_migrations table
  
  console.log('Migration complete!');
}

async function migrateDown(steps: number) {
  console.log(`Rolling back ${steps} migration(s)...\n`);
  
  // In a real implementation, you would:
  // 1. Get last N applied migrations
  // 2. Execute down scripts in reverse order
  // 3. Remove from schema_migrations table
  
  console.log('Rollback complete!');
}

async function createMigration(description: string) {
  const version = Date.now(); // Use timestamp as version
  const filename = `${version}_${description.toLowerCase().replace(/\s+/g, '_')}.sql`;
  
  console.log(`Creating migration: ${filename}`);
  
  // Generate migration template
  const { generateMigrationTemplate } = await import('@/lib/services/migration-utils');
  const template = generateMigrationTemplate({ version, description });
  
  // Write to file (in real implementation)
  console.log('Migration template generated at: supabase/migrations/' + filename);
}

function parseArgs(args: string[]): CLIOptions {
  // Simple argument parsing (use a library like 'commander' in production)
  const command = args[0] as CLIOptions['command'];
  
  return {
    command,
    version: args.includes('--version') ? parseInt(args[args.indexOf('--version') + 1]) : undefined,
    description: args.includes('--description') ? args[args.indexOf('--description') + 1] : undefined,
    steps: args.includes('--steps') ? parseInt(args[args.indexOf('--steps') + 1]) : undefined,
  };
}

function showHelp() {
  console.log(`
Migration CLI Tool

Usage:
  tsx src/scripts/migrate.ts <command> [options]

Commands:
  status              Show current migration status
  up                  Run pending migrations
  down --steps N      Rollback N migrations
  create --description "Add new column"  Create new migration

Examples:
  tsx src/scripts/migrate.ts status
  tsx src/scripts/migrate.ts up
  tsx src/scripts/migrate.ts down --steps 1
  tsx src/scripts/migrate.ts create --description "Add user preferences"
  `);
}

main().catch(console.error);
```

**4. Migration Testing Utilities** (`src/lib/services/migration-testing.ts`)

Create utilities for testing migrations:

```typescript
import { createClient } from '@/lib/supabase';

export class MigrationTester {
  private supabase = createClient();

  /**
   * Test that migration can be applied and rolled back cleanly
   */
  async testMigration(params: {
    upScript: string;
    downScript: string;
  }): Promise<{
    success: boolean;
    errors: string[];
    timing: {
      up_ms: number;
      down_ms: number;
    };
  }> {
    const errors: string[] = [];
    let upTime = 0;
    let downTime = 0;

    try {
      // Test UP migration
      const upStart = Date.now();
      await this.executeSQL(params.upScript);
      upTime = Date.now() - upStart;

      // Test DOWN migration (rollback)
      const downStart = Date.now();
      await this.executeSQL(params.downScript);
      downTime = Date.now() - downStart;

      return {
        success: true,
        errors: [],
        timing: { up_ms: upTime, down_ms: downTime },
      };
    } catch (error) {
      errors.push((error as Error).message);
      return {
        success: false,
        errors,
        timing: { up_ms: upTime, down_ms: downTime },
      };
    }
  }

  /**
   * Execute SQL script
   */
  private async executeSQL(script: string): Promise<void> {
    const { error } = await this.supabase.rpc('exec_sql', { sql_script: script });
    
    if (error) {
      throw new Error(`SQL execution failed: ${error.message}`);
    }
  }

  /**
   * Verify table exists
   */
  async tableExists(tableName: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', tableName)
      .single();

    return !!data && !error;
  }

  /**
   * Verify column exists
   */
  async columnExists(tableName: string, columnName: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', tableName)
      .eq('column_name', columnName)
      .single();

    return !!data && !error;
  }

  /**
   * Verify index exists
   */
  async indexExists(indexName: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('pg_indexes')
      .select('indexname')
      .eq('indexname', indexName)
      .single();

    return !!data && !error;
  }
}

export const migrationTester = new MigrationTester();
```

**5. Documentation** (`docs/migrations.md`)

Create comprehensive migration documentation:

```markdown
# Database Migration Guide

## Safe Migration Patterns

### 1. Adding a Column

**DO:**
```sql
ALTER TABLE conversations
ADD COLUMN new_field TEXT DEFAULT 'default_value' NOT NULL;
```

**DON'T:**
```sql
-- This causes a table rewrite for large tables
ALTER TABLE conversations
ADD COLUMN new_field TEXT NOT NULL;
```

### 2. Adding Constraints

**DO:**
```sql
-- Add constraint without full table scan
ALTER TABLE conversations
ADD CONSTRAINT chk_quality_score
CHECK (quality_score >= 0 AND quality_score <= 10)
NOT VALID;

-- Validate in background
ALTER TABLE conversations
VALIDATE CONSTRAINT chk_quality_score;
```

### 3. Renaming Columns

Use a multi-phase approach:

**Phase 1: Deploy with both columns**
```sql
ALTER TABLE conversations ADD COLUMN new_name TEXT;
UPDATE conversations SET new_name = old_name;
CREATE VIEW conversations_v1 AS 
SELECT *, new_name AS old_name FROM conversations;
```

**Phase 2: Update application code**
Update all references from old_name to new_name

**Phase 3: Clean up**
```sql
DROP VIEW conversations_v1;
ALTER TABLE conversations DROP COLUMN old_name;
```

### 4. Creating Indexes

**DO:**
```sql
-- No table locks
CREATE INDEX CONCURRENTLY idx_conversations_field
ON conversations(field);
```

### 5. Zero-Downtime Deployments

1. Migrations must be backward compatible
2. Deploy database changes first
3. Then deploy application changes
4. Never remove columns/tables in same release that stops using them

## Migration Workflow

1. Create migration: `tsx src/scripts/migrate.ts create --description "Your change"`
2. Edit generated file with up/down scripts
3. Test in development: `tsx src/scripts/migrate.ts up`
4. Test rollback: `tsx src/scripts/migrate.ts down --steps 1`
5. Deploy to staging
6. Verify in staging
7. Deploy to production
```

**ACCEPTANCE CRITERIA:**

Migration Framework:
- ✅ Schema version tracking table created (already done)
- ✅ MigrationManager service tracks applied migrations
- ✅ Safe migration utilities provide proven patterns
- ✅ CLI tool supports create, up, down, status commands
- ✅ Migration tester validates up/down scripts
- ✅ Documentation covers all safe patterns

Safety:
- ✅ All migrations reversible via down scripts
- ✅ Dangerous operations flagged during validation
- ✅ Migrations tested before production deployment
- ✅ Zero-downtime patterns documented and enforced
- ✅ Backward compatibility maintained

Integration:
- ✅ Works with existing Supabase migrations
- ✅ Uses conversation_templates (not prompt_templates)
- ✅ References user_profiles (not auth.users)
- ✅ TypeScript types match database schema

**DELIVERABLES:**

1. Migration manager service with version tracking
2. Safe migration utility functions
3. CLI tool for migration management
4. Migration testing utilities
5. Comprehensive documentation with examples
6. Example migrations demonstrating patterns

**VALIDATION:**

After implementation, test with these scenarios:

```bash
# Show current migration status
tsx src/scripts/migrate.ts status

# Create a test migration
tsx src/scripts/migrate.ts create --description "Add test field"

# Test the migration utilities
```

```typescript
// Test migration manager
import { migrationManager } from '@/lib/services/migration-manager';

const version = await migrationManager.getCurrentVersion();
console.log('Current version:', version);

const applied = await migrationManager.getAppliedMigrations();
console.log('Applied migrations:', applied);

// Test safe patterns
import { addColumnSafely, createIndexConcurrently } from '@/lib/services/migration-utils';

const addColumnSQL = addColumnSafely({
  table: 'conversations',
  column: 'test_field',
  type: 'TEXT',
  defaultValue: "'default'",
  notNull: true,
});
console.log('Add column SQL:', addColumnSQL);

const indexSQL = createIndexConcurrently({
  table: 'conversations',
  indexName: 'idx_test_field',
  columns: ['test_field'],
});
console.log('Create index SQL:', indexSQL);
```

Implement this feature completely, ensuring production-ready migration framework.


++++++++++++++++++

