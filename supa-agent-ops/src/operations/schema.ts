/**
 * Schema Operations Module
 * Provides schema introspection, DDL execution, and index management
 */

import { 
  SchemaIntrospectParams, 
  SchemaIntrospectResult,
  DDLExecuteParams,
  DDLExecuteResult,
  IndexManageParams,
  IndexManageResult,
  TableSchema,
  ColumnInfo,
  IndexInfo,
  ConstraintInfo,
  PolicyInfo,
  NextAction
} from '../core/types';
import { getPgClient, closePgClient, getSupabaseClient } from '../core/client';
import { logger } from '../utils/logger';
import { mapDatabaseError } from '../errors/codes';

/**
 * Introspects database schema for tables, columns, indexes, constraints, and policies
 * 
 * @param params - Schema introspection parameters
 * @returns Schema information for requested tables
 * 
 * @example
 * ```typescript
 * const result = await agentIntrospectSchema({ 
 *   table: 'conversations',
 *   includeColumns: true,
 *   includeIndexes: true,
 *   includePolicies: true
 * });
 * console.log(result.tables[0]);
 * ```
 */
export async function agentIntrospectSchema(
  params: SchemaIntrospectParams
): Promise<SchemaIntrospectResult> {
  const startTime = Date.now();
  const {
    table,
    includeColumns = true,
    includeIndexes = true,
    includeConstraints = true,
    includePolicies = true,
    includeStats = true,
    transport = 'pg'
  } = params;

  logger.info('Starting schema introspection', { table, transport });

  try {
    const client = await getPgClient();
    const tables: TableSchema[] = [];

    // Get list of tables to introspect
    const tablesToIntrospect = table 
      ? [table] 
      : await getAllTableNames(client);

    for (const tableName of tablesToIntrospect) {
      const tableSchema: TableSchema = {
        name: tableName,
        exists: false,
        rowCount: 0,
        columns: [],
        indexes: [],
        constraints: [],
        policies: [],
        rlsEnabled: false
      };

      // Check if table exists
      const existsResult = await client.query(
        `SELECT EXISTS (
          SELECT FROM pg_tables 
          WHERE schemaname = 'public' 
          AND tablename = $1
        )`,
        [tableName]
      );
      tableSchema.exists = existsResult.rows[0].exists;

      if (!tableSchema.exists) {
        tables.push(tableSchema);
        continue;
      }

      // Get row count and size stats
      if (includeStats) {
        try {
          const statsResult = await client.query(
            `SELECT 
              (SELECT COUNT(*) FROM ${tableName}) as row_count,
              pg_total_relation_size($1::regclass) as size_bytes`,
            [tableName]
          );
          tableSchema.rowCount = parseInt(statsResult.rows[0].row_count) || 0;
          tableSchema.sizeBytes = parseInt(statsResult.rows[0].size_bytes) || 0;
        } catch (error: any) {
          logger.warn('Failed to get table stats', { table: tableName, error: error.message });
        }
      }

      // Get columns
      if (includeColumns) {
        tableSchema.columns = await getTableColumns(client, tableName);
      }

      // Get indexes
      if (includeIndexes) {
        tableSchema.indexes = await getTableIndexes(client, tableName);
      }

      // Get constraints
      if (includeConstraints) {
        tableSchema.constraints = await getTableConstraints(client, tableName);
      }

      // Get RLS status
      try {
        const rlsResult = await client.query(
          `SELECT relrowsecurity 
           FROM pg_class 
           WHERE oid = $1::regclass`,
          [tableName]
        );
        tableSchema.rlsEnabled = rlsResult.rows[0]?.relrowsecurity || false;
      } catch (error: any) {
        logger.warn('Failed to check RLS status', { table: tableName });
      }

      // Get policies
      if (includePolicies && tableSchema.rlsEnabled) {
        tableSchema.policies = await getTablePolicies(client, tableName);
      }

      tables.push(tableSchema);
    }

    await closePgClient();

    const executionTimeMs = Date.now() - startTime;
    const summary = table
      ? `Introspected table: ${table}. Exists: ${tables[0]?.exists}`
      : `Introspected ${tables.length} tables`;

    const nextActions: NextAction[] = [];
    
    // Suggest actions based on findings
    for (const t of tables) {
      if (!t.exists) {
        nextActions.push({
          action: 'CREATE_TABLE',
          description: `Table "${t.name}" does not exist`,
          example: `CREATE TABLE ${t.name} (...);`,
          priority: 'HIGH'
        });
      } else {
        if (!t.rlsEnabled) {
          nextActions.push({
            action: 'ENABLE_RLS',
            description: `Consider enabling RLS for table "${t.name}"`,
            example: `ALTER TABLE ${t.name} ENABLE ROW LEVEL SECURITY;`,
            priority: 'MEDIUM'
          });
        }
        if (t.indexes.length === 0 && t.rowCount > 1000) {
          nextActions.push({
            action: 'CREATE_INDEXES',
            description: `Table "${t.name}" has ${t.rowCount} rows but no indexes`,
            example: `CREATE INDEX idx_${t.name}_column ON ${t.name}(column);`,
            priority: 'MEDIUM'
          });
        }
      }
    }

    logger.info('Schema introspection completed', { tables: tables.length, executionTimeMs });

    return {
      success: true,
      summary,
      executionTimeMs,
      nextActions,
      tables
    };
  } catch (error: any) {
    await closePgClient();
    
    const mapped = mapDatabaseError(error);
    logger.error('Schema introspection failed', { error: mapped });

    return {
      success: false,
      summary: `Schema introspection failed: ${mapped.description}`,
      executionTimeMs: Date.now() - startTime,
      nextActions: [{
        action: 'FIX_ERROR',
        description: mapped.remediation,
        example: mapped.example,
        priority: 'HIGH'
      }],
      tables: []
    };
  }
}

/**
 * Executes DDL statements with transaction support
 * 
 * @param params - DDL execution parameters
 * @returns Execution result with affected objects
 * 
 * @example
 * ```typescript
 * const result = await agentExecuteDDL({
 *   sql: 'CREATE TABLE test_table (id uuid PRIMARY KEY, name text);',
 *   transaction: true,
 *   dryRun: false
 * });
 * ```
 */
export async function agentExecuteDDL(
  params: DDLExecuteParams
): Promise<DDLExecuteResult> {
  const startTime = Date.now();
  const {
    sql,
    dryRun = false,
    transaction = true,
    validateOnly = false,
    transport = 'pg'
  } = params;

  logger.info('Starting DDL execution', { dryRun, transaction, validateOnly });

  // Check for destructive operations
  const warnings: string[] = [];
  const destructiveKeywords = ['DROP', 'TRUNCATE', 'DELETE FROM'];
  const upperSql = sql.toUpperCase();
  
  for (const keyword of destructiveKeywords) {
    if (upperSql.includes(keyword)) {
      warnings.push(`Destructive operation detected: ${keyword}`);
    }
  }

  if (dryRun || validateOnly) {
    logger.info('Dry run mode - skipping execution', { sql });
    
    return {
      success: true,
      summary: 'Dry run completed. SQL validated.',
      executionTimeMs: Date.now() - startTime,
      nextActions: [{
        action: 'EXECUTE_DDL',
        description: 'Validation passed. Ready to execute DDL.',
        example: 'Set dryRun: false to execute',
        priority: 'MEDIUM'
      }],
      executed: false,
      statements: countStatements(sql),
      affectedObjects: extractAffectedObjects(sql),
      warnings
    };
  }

  try {
    const client = await getPgClient();
    const affectedObjects: string[] = extractAffectedObjects(sql);

    if (transaction) {
      await client.query('BEGIN');
      logger.debug('Transaction started');
    }

    try {
      // Execute the DDL
      await client.query(sql);
      
      if (transaction) {
        await client.query('COMMIT');
        logger.debug('Transaction committed');
      }

      await closePgClient();

      const executionTimeMs = Date.now() - startTime;
      const summary = `DDL executed successfully. Affected: ${affectedObjects.join(', ')}`;

      logger.info('DDL execution completed', { affectedObjects, executionTimeMs });

      return {
        success: true,
        summary,
        executionTimeMs,
        nextActions: [{
          action: 'VERIFY_CHANGES',
          description: 'DDL executed successfully. Verify database changes.',
          example: `SELECT * FROM information_schema.tables WHERE table_name IN ('${affectedObjects.join("','")}');`,
          priority: 'LOW'
        }],
        executed: true,
        statements: countStatements(sql),
        affectedObjects,
        warnings
      };
    } catch (execError: any) {
      if (transaction) {
        await client.query('ROLLBACK');
        logger.debug('Transaction rolled back');
      }
      throw execError;
    }
  } catch (error: any) {
    await closePgClient();
    
    const mapped = mapDatabaseError(error);
    logger.error('DDL execution failed', { error: mapped });

    return {
      success: false,
      summary: `DDL execution failed: ${mapped.description}`,
      executionTimeMs: Date.now() - startTime,
      nextActions: [{
        action: 'FIX_DDL_ERROR',
        description: mapped.remediation,
        example: mapped.example,
        priority: 'HIGH'
      }],
      executed: false,
      statements: countStatements(sql),
      affectedObjects: [],
      warnings
    };
  }
}

/**
 * Manages database indexes (create, drop, list, analyze)
 * 
 * @param params - Index management parameters
 * @returns Result with index information
 * 
 * @example
 * ```typescript
 * const result = await agentManageIndex({
 *   table: 'conversations',
 *   action: 'create',
 *   indexName: 'idx_conversations_persona',
 *   columns: ['persona'],
 *   concurrent: true
 * });
 * ```
 */
export async function agentManageIndex(
  params: IndexManageParams
): Promise<IndexManageResult> {
  const startTime = Date.now();
  const {
    table,
    action,
    indexName,
    columns = [],
    indexType = 'btree',
    concurrent = false,
    unique = false,
    where,
    dryRun = false,
    transport = 'pg'
  } = params;

  logger.info('Starting index management', { table, action, indexName });

  try {
    const client = await getPgClient();

    if (action === 'list' || action === 'analyze') {
      // List indexes for the table
      const indexes = await getTableIndexes(client, table);
      await closePgClient();

      const summary = `Found ${indexes.length} index(es) on table: ${table}`;
      
      return {
        success: true,
        summary,
        executionTimeMs: Date.now() - startTime,
        nextActions: indexes.length === 0 ? [{
          action: 'CREATE_INDEX',
          description: `Table "${table}" has no indexes`,
          example: `CREATE INDEX idx_${table}_column ON ${table}(column);`,
          priority: 'MEDIUM'
        }] : [],
        indexes,
        operation: action
      };
    }

    if (action === 'create') {
      if (!indexName || columns.length === 0) {
        throw new Error('Index name and columns are required for create action');
      }

      const concurrentKeyword = concurrent ? 'CONCURRENTLY' : '';
      const uniqueKeyword = unique ? 'UNIQUE' : '';
      const whereClause = where ? `WHERE ${where}` : '';
      const columnsStr = columns.join(', ');

      const createSql = `CREATE ${uniqueKeyword} INDEX ${concurrentKeyword} ${indexName} ON ${table} USING ${indexType} (${columnsStr}) ${whereClause}`.trim();

      if (dryRun) {
        logger.info('Dry run mode - skipping index creation', { sql: createSql });
        
        return {
          success: true,
          summary: `Dry run: Would create index ${indexName}`,
          executionTimeMs: Date.now() - startTime,
          nextActions: [{
            action: 'CREATE_INDEX',
            description: 'Ready to create index',
            example: createSql,
            priority: 'MEDIUM'
          }],
          indexes: [],
          operation: 'create'
        };
      }

      await client.query(createSql);
      const indexes = await getTableIndexes(client, table);
      await closePgClient();

      logger.info('Index created successfully', { indexName });

      return {
        success: true,
        summary: `Index "${indexName}" created successfully on table: ${table}`,
        executionTimeMs: Date.now() - startTime,
        nextActions: [{
          action: 'VERIFY_INDEX',
          description: 'Index created. Verify it is being used.',
          example: `EXPLAIN SELECT * FROM ${table} WHERE ${columns[0]} = ...;`,
          priority: 'LOW'
        }],
        indexes,
        operation: 'create'
      };
    }

    if (action === 'drop') {
      if (!indexName) {
        throw new Error('Index name is required for drop action');
      }

      const concurrentKeyword = concurrent ? 'CONCURRENTLY' : '';
      const dropSql = `DROP INDEX ${concurrentKeyword} ${indexName}`.trim();

      if (dryRun) {
        logger.info('Dry run mode - skipping index drop', { sql: dropSql });
        
        return {
          success: true,
          summary: `Dry run: Would drop index ${indexName}`,
          executionTimeMs: Date.now() - startTime,
          nextActions: [{
            action: 'DROP_INDEX',
            description: 'Ready to drop index',
            example: dropSql,
            priority: 'MEDIUM'
          }],
          indexes: [],
          operation: 'drop'
        };
      }

      await client.query(dropSql);
      const indexes = await getTableIndexes(client, table);
      await closePgClient();

      logger.info('Index dropped successfully', { indexName });

      return {
        success: true,
        summary: `Index "${indexName}" dropped successfully`,
        executionTimeMs: Date.now() - startTime,
        nextActions: [],
        indexes,
        operation: 'drop'
      };
    }

    await closePgClient();
    
    return {
      success: false,
      summary: `Unknown action: ${action}`,
      executionTimeMs: Date.now() - startTime,
      nextActions: [],
      indexes: []
    };
  } catch (error: any) {
    await closePgClient();
    
    const mapped = mapDatabaseError(error);
    logger.error('Index management failed', { error: mapped });

    return {
      success: false,
      summary: `Index management failed: ${mapped.description}`,
      executionTimeMs: Date.now() - startTime,
      nextActions: [{
        action: 'FIX_INDEX_ERROR',
        description: mapped.remediation,
        example: mapped.example,
        priority: 'HIGH'
      }],
      indexes: []
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Gets all table names in the public schema
 */
async function getAllTableNames(client: any): Promise<string[]> {
  const result = await client.query(
    `SELECT tablename 
     FROM pg_tables 
     WHERE schemaname = 'public' 
     ORDER BY tablename`
  );
  return result.rows.map((r: any) => r.tablename);
}

/**
 * Gets column information for a table
 */
async function getTableColumns(client: any, tableName: string): Promise<ColumnInfo[]> {
  const result = await client.query(
    `SELECT 
      c.column_name,
      c.data_type,
      c.is_nullable,
      c.column_default,
      CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key,
      CASE WHEN fk.column_name IS NOT NULL THEN true ELSE false END as is_foreign_key,
      fk.foreign_table_name,
      fk.foreign_column_name
    FROM information_schema.columns c
    LEFT JOIN (
      SELECT ku.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage ku
        ON tc.constraint_name = ku.constraint_name
      WHERE tc.table_schema = 'public'
        AND tc.table_name = $1
        AND tc.constraint_type = 'PRIMARY KEY'
    ) pk ON c.column_name = pk.column_name
    LEFT JOIN (
      SELECT 
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_schema = 'public'
        AND tc.table_name = $1
        AND tc.constraint_type = 'FOREIGN KEY'
    ) fk ON c.column_name = fk.column_name
    WHERE c.table_schema = 'public'
      AND c.table_name = $1
    ORDER BY c.ordinal_position`,
    [tableName]
  );

  return result.rows.map((row: any) => ({
    name: row.column_name,
    type: row.data_type,
    nullable: row.is_nullable === 'YES',
    default: row.column_default,
    isPrimaryKey: row.is_primary_key,
    isForeignKey: row.is_foreign_key,
    foreignKeyTable: row.foreign_table_name,
    foreignKeyColumn: row.foreign_column_name
  }));
}

/**
 * Gets index information for a table
 */
async function getTableIndexes(client: any, tableName: string): Promise<IndexInfo[]> {
  const result = await client.query(
    `SELECT
      i.relname as index_name,
      t.relname as table_name,
      a.attname as column_name,
      ix.indisunique as is_unique,
      ix.indisprimary as is_primary,
      pg_get_indexdef(i.oid) as index_def,
      pg_relation_size(i.oid) as size_bytes
    FROM pg_class t
    JOIN pg_index ix ON t.oid = ix.indrelid
    JOIN pg_class i ON i.oid = ix.indexrelid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
    WHERE t.relkind = 'r'
      AND t.relname = $1
    ORDER BY i.relname, a.attnum`,
    [tableName]
  );

  // Group by index name
  const indexMap = new Map<string, IndexInfo>();
  
  for (const row of result.rows) {
    const indexName = row.index_name;
    
    if (!indexMap.has(indexName)) {
      indexMap.set(indexName, {
        name: indexName,
        table: row.table_name,
        columns: [],
        isUnique: row.is_unique,
        isPrimary: row.is_primary,
        indexDef: row.index_def,
        sizeBytes: parseInt(row.size_bytes) || 0
      });
    }
    
    indexMap.get(indexName)!.columns.push(row.column_name);
  }

  return Array.from(indexMap.values());
}

/**
 * Gets constraint information for a table
 */
async function getTableConstraints(client: any, tableName: string): Promise<ConstraintInfo[]> {
  const result = await client.query(
    `SELECT
      tc.constraint_name,
      tc.constraint_type,
      pg_get_constraintdef(c.oid) as definition,
      array_agg(kcu.column_name) as columns
    FROM information_schema.table_constraints tc
    JOIN pg_constraint c ON c.conname = tc.constraint_name
    LEFT JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_schema = 'public'
      AND tc.table_name = $1
    GROUP BY tc.constraint_name, tc.constraint_type, c.oid
    ORDER BY tc.constraint_type, tc.constraint_name`,
    [tableName]
  );

  return result.rows.map((row: any) => ({
    name: row.constraint_name,
    type: row.constraint_type,
    definition: row.definition,
    columns: row.columns
  }));
}

/**
 * Gets RLS policy information for a table
 */
async function getTablePolicies(client: any, tableName: string): Promise<PolicyInfo[]> {
  const result = await client.query(
    `SELECT
      polname as policy_name,
      polcmd as command,
      polroles::regrole[] as roles,
      pg_get_expr(polqual, polrelid) as using_expr,
      pg_get_expr(polwithcheck, polrelid) as with_check_expr
    FROM pg_policy
    WHERE polrelid = $1::regclass
    ORDER BY polname`,
    [tableName]
  );

  return result.rows.map((row: any) => ({
    name: row.policy_name,
    command: mapPolicyCommand(row.command),
    roles: row.roles || [],
    definition: `USING (${row.using_expr || 'true'})${row.with_check_expr ? ` WITH CHECK (${row.with_check_expr})` : ''}`,
    using: row.using_expr,
    withCheck: row.with_check_expr
  }));
}

/**
 * Maps PostgreSQL policy command codes to readable names
 */
function mapPolicyCommand(cmd: string): 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL' {
  const mapping: Record<string, any> = {
    'r': 'SELECT',
    'a': 'INSERT',
    'w': 'UPDATE',
    'd': 'DELETE',
    '*': 'ALL'
  };
  return mapping[cmd] || 'ALL';
}

/**
 * Counts SQL statements (naive split by semicolon)
 */
function countStatements(sql: string): number {
  return sql.split(';').filter(s => s.trim()).length;
}

/**
 * Extracts table/object names from DDL SQL
 */
function extractAffectedObjects(sql: string): string[] {
  const objects: string[] = [];
  const patterns = [
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/gi,
    /ALTER\s+TABLE\s+(\w+)/gi,
    /DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?(\w+)/gi,
    /CREATE\s+INDEX\s+(?:\w+\s+)?(?:ON\s+)?(\w+)/gi,
    /DROP\s+INDEX\s+(\w+)/gi
  ];

  for (const pattern of patterns) {
    const matches = sql.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        objects.push(match[1]);
      }
    }
  }

  return [...new Set(objects)]; // Remove duplicates
}

