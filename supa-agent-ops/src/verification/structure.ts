/**
 * Verification Module
 * Provides table structure validation and integrity checks
 */

import { 
  AgentOperationResult,
  NextAction
} from '../core/types';
import { agentIntrospectSchema } from '../operations/schema';
import { logger } from '../utils/logger';

/**
 * Column specification for verification
 */
export interface ColumnSpec {
  name: string;
  type: string;
  required?: boolean;
}

/**
 * Constraint specification for verification
 */
export interface ConstraintSpec {
  name: string;
  type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK';
  columns: string[];
}

/**
 * Parameters for table verification
 */
export interface TableVerifyParams {
  table: string;
  expectedColumns?: ColumnSpec[];
  expectedIndexes?: string[];
  expectedConstraints?: ConstraintSpec[];
  generateFixSQL?: boolean;
}

/**
 * Verification issue details
 */
export interface VerificationIssue {
  type: 'missing_column' | 'missing_index' | 'missing_constraint' | 'type_mismatch' | 'missing_table';
  severity: 'warning' | 'error' | 'critical';
  description: string;
  fixSQL?: string;
}

/**
 * Result from table verification
 */
export interface TableVerifyResult extends AgentOperationResult {
  exists: boolean;
  issues: VerificationIssue[];
  fixSQL?: string;
  category: 1 | 2 | 3 | 4; // 1=OK, 2=Warning, 3=Critical, 4=Blocking
  canProceed: boolean;
  operation: string;
}

/**
 * Verifies table structure against expected schema
 * 
 * @param params - Table verification parameters with expected schema
 * @returns Verification result with issues, fix SQL, and severity category
 * 
 * @example
 * ```typescript
 * // Verify table structure
 * const result = await agentVerifyTable({
 *   table: 'conversations',
 *   expectedColumns: [
 *     { name: 'id', type: 'uuid', required: true },
 *     { name: 'persona', type: 'text', required: true },
 *     { name: 'parameters', type: 'jsonb' },
 *     { name: 'status', type: 'text', required: true }
 *   ],
 *   expectedIndexes: [
 *     'idx_conversations_persona',
 *     'idx_conversations_status'
 *   ],
 *   generateFixSQL: true
 * });
 * 
 * // Check if can proceed
 * if (result.canProceed) {
 *   console.log('Table structure is valid');
 * } else {
 *   console.log('Critical issues found:', result.issues);
 *   if (result.fixSQL) {
 *     console.log('Fix SQL:', result.fixSQL);
 *   }
 * }
 * ```
 */
export async function agentVerifyTable(params: TableVerifyParams): Promise<TableVerifyResult> {
  const startTime = Date.now();
  const {
    table,
    expectedColumns = [],
    expectedIndexes = [],
    expectedConstraints = [],
    generateFixSQL = false
  } = params;

  logger.info('Starting table verification', { table, generateFixSQL });

  const issues: VerificationIssue[] = [];

  try {
    // 1. Get actual schema
    const schemaResult = await agentIntrospectSchema({ 
      table,
      includeColumns: true,
      includeIndexes: true,
      includeConstraints: true
    });

    // 2. Check if table exists
    if (!schemaResult.tables[0]?.exists) {
      logger.warn('Table does not exist', { table });

      const fixSQL = generateFixSQL ? generateCreateTableSQL(table, params) : undefined;

      return {
        success: false,
        summary: `Table ${table} does not exist`,
        executionTimeMs: Date.now() - startTime,
        operation: 'verification',
        exists: false,
        issues: [{
          type: 'missing_table',
          severity: 'critical',
          description: `Table ${table} does not exist`,
          fixSQL
        }],
        fixSQL,
        category: 4,
        canProceed: false,
        nextActions: [{
          action: 'CREATE_TABLE',
          description: `Create table ${table}`,
          example: fixSQL || `CREATE TABLE ${table} (...);`,
          priority: 'HIGH'
        }]
      };
    }

    const actualSchema = schemaResult.tables[0];

    // 3. Verify columns
    if (expectedColumns.length > 0) {
      for (const expectedCol of expectedColumns) {
        const actualCol = actualSchema.columns.find(c => c.name === expectedCol.name);

        if (!actualCol) {
          issues.push({
            type: 'missing_column',
            severity: expectedCol.required ? 'critical' : 'warning',
            description: `Missing column: ${expectedCol.name}`,
            fixSQL: `ALTER TABLE ${table} ADD COLUMN ${expectedCol.name} ${expectedCol.type};`
          });
        } else {
          // Check type mismatch (normalize types for comparison)
          const actualType = normalizeType(actualCol.type);
          const expectedType = normalizeType(expectedCol.type);
          
          if (actualType !== expectedType) {
            issues.push({
              type: 'type_mismatch',
              severity: 'error',
              description: `Column ${expectedCol.name} type mismatch: expected ${expectedCol.type}, got ${actualCol.type}`,
              fixSQL: `ALTER TABLE ${table} ALTER COLUMN ${expectedCol.name} TYPE ${expectedCol.type};`
            });
          }
        }
      }
    }

    // 4. Verify indexes
    if (expectedIndexes.length > 0) {
      for (const expectedIdx of expectedIndexes) {
        const actualIdx = actualSchema.indexes.find(idx => idx.name === expectedIdx);

        if (!actualIdx) {
          issues.push({
            type: 'missing_index',
            severity: 'warning',
            description: `Missing index: ${expectedIdx}`,
            fixSQL: `-- CREATE INDEX ${expectedIdx} ON ${table} (...);  -- Specify columns`
          });
        }
      }
    }

    // 5. Verify constraints
    if (expectedConstraints.length > 0) {
      for (const expectedConstr of expectedConstraints) {
        const actualConstr = actualSchema.constraints.find(c => c.name === expectedConstr.name);

        if (!actualConstr) {
          issues.push({
            type: 'missing_constraint',
            severity: expectedConstr.type === 'PRIMARY KEY' ? 'critical' : 'error',
            description: `Missing constraint: ${expectedConstr.name} (${expectedConstr.type})`,
            fixSQL: generateConstraintSQL(table, expectedConstr)
          });
        }
      }
    }

    // 6. Determine category
    const hasCritical = issues.some(i => i.severity === 'critical');
    const hasError = issues.some(i => i.severity === 'error');
    const hasWarning = issues.some(i => i.severity === 'warning');

    const category: 1 | 2 | 3 | 4 = hasCritical ? 4 : hasError ? 3 : hasWarning ? 2 : 1;
    const canProceed = category <= 2;

    // 7. Generate fix SQL if requested
    let fixSQL: string | undefined;
    if (generateFixSQL && issues.length > 0) {
      fixSQL = issues
        .filter(i => i.fixSQL)
        .map(i => i.fixSQL)
        .join('\n\n');
    }

    const executionTimeMs = Date.now() - startTime;

    logger.info('Table verification completed', { 
      table, 
      issueCount: issues.length, 
      category,
      canProceed,
      executionTimeMs 
    });

    const nextActions: NextAction[] = [];

    if (issues.length > 0) {
      nextActions.push({
        action: 'REVIEW_ISSUES',
        description: `Found ${issues.length} issue(s) in table ${table}`,
        example: JSON.stringify(issues.slice(0, 3), null, 2),
        priority: category >= 3 ? 'HIGH' : 'MEDIUM'
      });

      if (fixSQL) {
        nextActions.push({
          action: 'APPLY_FIX_SQL',
          description: 'Apply generated fix SQL to resolve issues',
          example: fixSQL.split('\n\n')[0], // Show first fix as example
          priority: category >= 3 ? 'HIGH' : 'MEDIUM'
        });
      }
    }

    return {
      success: issues.length === 0,
      summary: issues.length === 0
        ? `Table ${table} verification passed (Category ${category}: OK)`
        : `Found ${issues.length} issue(s) in table ${table} (Category ${category})`,
      executionTimeMs,
      operation: 'verification',
      exists: true,
      issues,
      fixSQL,
      category,
      canProceed,
      nextActions
    };

  } catch (error: any) {
    const executionTimeMs = Date.now() - startTime;
    logger.error('Table verification failed', { error: error.message, table });

    return {
      success: false,
      summary: `Verification failed: ${error.message}`,
      executionTimeMs,
      operation: 'verification',
      exists: false,
      issues: [],
      category: 4,
      canProceed: false,
      nextActions: [{
        action: 'CHECK_DATABASE_CONNECTION',
        description: 'Verify database connection and permissions',
        priority: 'HIGH'
      }, {
        action: 'CHECK_TABLE_ACCESS',
        description: `Verify access to table ${table}`,
        example: `SELECT * FROM ${table} LIMIT 1;`,
        priority: 'HIGH'
      }]
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Normalizes PostgreSQL type names for comparison
 */
function normalizeType(type: string): string {
  const normalized = type.toLowerCase().trim();
  
  // Map common type aliases
  const typeMap: Record<string, string> = {
    'int': 'integer',
    'int4': 'integer',
    'int8': 'bigint',
    'float8': 'double precision',
    'float4': 'real',
    'bool': 'boolean',
    'varchar': 'character varying',
    'char': 'character',
    'timestamptz': 'timestamp with time zone',
    'timestamp': 'timestamp without time zone'
  };

  // Extract base type (remove size/precision)
  const baseType = normalized.split('(')[0].trim();
  
  return typeMap[baseType] || baseType;
}

/**
 * Generates CREATE TABLE SQL from expected schema
 */
function generateCreateTableSQL(table: string, params: TableVerifyParams): string {
  const { expectedColumns = [], expectedConstraints = [] } = params;

  if (expectedColumns.length === 0) {
    return `CREATE TABLE ${table} (\n  -- Add column definitions\n);`;
  }

  const columnDefs = expectedColumns.map(col => {
    let def = `  ${col.name} ${col.type}`;
    if (col.required) {
      def += ' NOT NULL';
    }
    return def;
  });

  const lines = [...columnDefs];

  // Add constraints
  if (expectedConstraints.length > 0) {
    for (const constraint of expectedConstraints) {
      if (constraint.type === 'PRIMARY KEY') {
        lines.push(`  CONSTRAINT ${constraint.name} PRIMARY KEY (${constraint.columns.join(', ')})`);
      }
    }
  }

  return `CREATE TABLE ${table} (\n${lines.join(',\n')}\n);`;
}

/**
 * Generates constraint SQL
 */
function generateConstraintSQL(table: string, constraint: ConstraintSpec): string {
  const { name, type, columns } = constraint;

  switch (type) {
    case 'PRIMARY KEY':
      return `ALTER TABLE ${table} ADD CONSTRAINT ${name} PRIMARY KEY (${columns.join(', ')});`;
    case 'UNIQUE':
      return `ALTER TABLE ${table} ADD CONSTRAINT ${name} UNIQUE (${columns.join(', ')});`;
    case 'FOREIGN KEY':
      return `-- ALTER TABLE ${table} ADD CONSTRAINT ${name} FOREIGN KEY (${columns.join(', ')}) REFERENCES referenced_table(referenced_columns);`;
    case 'CHECK':
      return `-- ALTER TABLE ${table} ADD CONSTRAINT ${name} CHECK (...);  -- Specify check condition`;
    default:
      return `-- Unknown constraint type: ${type}`;
  }
}

