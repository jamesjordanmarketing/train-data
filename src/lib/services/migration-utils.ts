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

