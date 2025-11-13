/**
 * Maintenance Operations Module
 * Provides VACUUM, ANALYZE, and REINDEX operations for database health
 */

import { 
  AgentOperationResult,
  NextAction
} from '../core/types';
import { agentExecuteSQL } from './rpc';
import { logger } from '../utils/logger';

/**
 * Parameters for VACUUM operations
 */
export interface VacuumParams {
  table?: string;
  full?: boolean;
  analyze?: boolean;
  dryRun?: boolean;
}

/**
 * Result from VACUUM operations
 */
export interface VacuumResult extends AgentOperationResult {
  tablesProcessed: string[];
  spaceReclaimed?: number;
  operation: string;
}

/**
 * Parameters for ANALYZE operations
 */
export interface AnalyzeParams {
  table?: string;
  columns?: string[];
}

/**
 * Parameters for REINDEX operations
 */
export interface ReindexParams {
  target: 'table' | 'index' | 'schema';
  name: string;
  concurrent?: boolean;
}

/**
 * Executes VACUUM operation to reclaim storage occupied by dead tuples
 * 
 * @param params - VACUUM parameters including table, full mode, analyze option
 * @returns VACUUM result with tables processed and space reclaimed
 * 
 * @example
 * ```typescript
 * // VACUUM a specific table with ANALYZE
 * const result = await agentVacuum({
 *   table: 'conversations',
 *   analyze: true
 * });
 * 
 * // VACUUM FULL (requires table lock - use with caution)
 * const result2 = await agentVacuum({
 *   table: 'conversations',
 *   full: true,
 *   dryRun: true  // Preview the operation first
 * });
 * ```
 */
export async function agentVacuum(params: VacuumParams): Promise<VacuumResult> {
  const startTime = Date.now();
  const { table, full = false, analyze = false, dryRun = false } = params;

  logger.info('Starting VACUUM operation', { table, full, analyze, dryRun });

  // Build VACUUM command
  let sql = 'VACUUM';
  if (full) {
    sql += ' FULL';
  }
  if (analyze) {
    sql += ' ANALYZE';
  }
  if (table) {
    sql += ` ${table}`;
  }

  const nextActions: NextAction[] = [];

  // Add warning for VACUUM FULL
  if (full) {
    nextActions.push({
      action: 'REVIEW_VACUUM_FULL',
      description: 'VACUUM FULL locks the table exclusively. Run during low-traffic period.',
      example: 'Schedule during maintenance window to avoid blocking production traffic',
      priority: 'HIGH'
    });
  }

  if (dryRun) {
    logger.info('Dry run mode - skipping VACUUM execution', { sql });
    
    return {
      success: true,
      summary: `Would execute: ${sql}`,
      executionTimeMs: Date.now() - startTime,
      operation: 'maintenance',
      tablesProcessed: table ? [table] : ['all'],
      nextActions: full ? nextActions : [{
        action: 'EXECUTE_VACUUM',
        description: 'Validation passed. Ready to execute VACUUM.',
        example: 'Set dryRun: false to execute',
        priority: 'MEDIUM'
      }]
    };
  }

  try {
    // VACUUM cannot run inside a transaction block
    const result = await agentExecuteSQL({ 
      sql, 
      transport: 'pg',
      transaction: false 
    });

    if (!result.success) {
      throw new Error(result.summary);
    }

    const executionTimeMs = Date.now() - startTime;

    logger.info('VACUUM completed successfully', { table, executionTimeMs });

    // Suggest next actions based on operation
    if (!analyze) {
      nextActions.push({
        action: 'RUN_ANALYZE',
        description: 'Consider running ANALYZE to update statistics for query planner',
        example: 'agentAnalyze({ table: "' + (table || 'all tables') + '" })',
        priority: 'MEDIUM'
      });
    }

    return {
      success: true,
      summary: `VACUUM${full ? ' FULL' : ''}${analyze ? ' ANALYZE' : ''} completed for ${table || 'all tables'}`,
      executionTimeMs,
      operation: 'maintenance',
      tablesProcessed: table ? [table] : ['all'],
      nextActions
    };

  } catch (error: any) {
    const executionTimeMs = Date.now() - startTime;
    logger.error('VACUUM operation failed', { error: error.message, table });

    return {
      success: false,
      summary: `VACUUM failed: ${error.message}`,
      executionTimeMs,
      operation: 'maintenance',
      tablesProcessed: [],
      nextActions: [{
        action: 'CHECK_PERMISSIONS',
        description: 'Verify database role has VACUUM permissions',
        example: 'GRANT VACUUM ON TABLE ' + (table || 'ALL TABLES') + ' TO role_name;',
        priority: 'HIGH'
      }, {
        action: 'CHECK_TABLE_EXISTS',
        description: table ? `Verify table '${table}' exists` : 'Verify database connection',
        example: 'agentIntrospectSchema({ table: "' + (table || '') + '" })',
        priority: 'HIGH'
      }]
    };
  }
}

/**
 * Executes ANALYZE operation to update statistics for query planner
 * 
 * @param params - ANALYZE parameters including table and columns
 * @returns ANALYZE result with execution details
 * 
 * @example
 * ```typescript
 * // ANALYZE entire table
 * const result = await agentAnalyze({
 *   table: 'conversations'
 * });
 * 
 * // ANALYZE specific columns
 * const result2 = await agentAnalyze({
 *   table: 'conversations',
 *   columns: ['persona', 'status', 'tier']
 * });
 * ```
 */
export async function agentAnalyze(params: AnalyzeParams): Promise<AgentOperationResult> {
  const startTime = Date.now();
  const { table, columns } = params;

  logger.info('Starting ANALYZE operation', { table, columns });

  // Build ANALYZE command
  let sql = 'ANALYZE';
  if (table) {
    sql += ` ${table}`;
    if (columns && columns.length > 0) {
      sql += ` (${columns.join(', ')})`;
    }
  }

  try {
    const result = await agentExecuteSQL({ 
      sql, 
      transport: 'pg',
      transaction: false
    });

    if (!result.success) {
      throw new Error(result.summary);
    }

    const executionTimeMs = Date.now() - startTime;

    logger.info('ANALYZE completed successfully', { table, executionTimeMs });

    const nextActions: NextAction[] = [{
      action: 'VERIFY_STATISTICS',
      description: 'Statistics updated. Query planner will use new statistics for optimization.',
      example: 'EXPLAIN ANALYZE SELECT ... to verify query plan',
      priority: 'LOW'
    }];

    return {
      success: true,
      summary: `ANALYZE completed for ${table || 'all tables'}${columns ? ` (columns: ${columns.join(', ')})` : ''}`,
      executionTimeMs,
      operation: 'maintenance',
      nextActions
    };

  } catch (error: any) {
    const executionTimeMs = Date.now() - startTime;
    logger.error('ANALYZE operation failed', { error: error.message, table });

    return {
      success: false,
      summary: `ANALYZE failed: ${error.message}`,
      executionTimeMs,
      operation: 'maintenance',
      nextActions: [{
        action: 'CHECK_PERMISSIONS',
        description: 'Verify database role has ANALYZE permissions',
        priority: 'HIGH'
      }, {
        action: 'CHECK_TABLE_EXISTS',
        description: table ? `Verify table '${table}' exists and columns are valid` : 'Verify database connection',
        example: 'agentIntrospectSchema({ table: "' + (table || '') + '" })',
        priority: 'HIGH'
      }]
    };
  }
}

/**
 * Executes REINDEX operation to rebuild indexes
 * 
 * @param params - REINDEX parameters including target type, name, and concurrent option
 * @returns REINDEX result with execution details
 * 
 * @example
 * ```typescript
 * // REINDEX a table (all indexes)
 * const result = await agentReindex({
 *   target: 'table',
 *   name: 'conversations',
 *   concurrent: true
 * });
 * 
 * // REINDEX a specific index
 * const result2 = await agentReindex({
 *   target: 'index',
 *   name: 'idx_conversations_persona',
 *   concurrent: true
 * });
 * 
 * // REINDEX entire schema
 * const result3 = await agentReindex({
 *   target: 'schema',
 *   name: 'public'
 * });
 * ```
 */
export async function agentReindex(params: ReindexParams): Promise<AgentOperationResult> {
  const startTime = Date.now();
  const { target, name, concurrent = false } = params;

  logger.info('Starting REINDEX operation', { target, name, concurrent });

  // Build REINDEX command
  let sql = 'REINDEX';
  if (concurrent) {
    sql += ' CONCURRENTLY';
  }
  sql += ` ${target.toUpperCase()} ${name}`;

  const nextActions: NextAction[] = [];

  // Add warning for non-concurrent reindex
  if (!concurrent && target !== 'schema') {
    nextActions.push({
      action: 'CONSIDER_CONCURRENT',
      description: 'REINDEX (non-concurrent) locks the table. Use CONCURRENTLY for production.',
      example: 'agentReindex({ target: "' + target + '", name: "' + name + '", concurrent: true })',
      priority: 'MEDIUM'
    });
  }

  try {
    const result = await agentExecuteSQL({ 
      sql, 
      transport: 'pg',
      transaction: false 
    });

    if (!result.success) {
      throw new Error(result.summary);
    }

    const executionTimeMs = Date.now() - startTime;

    logger.info('REINDEX completed successfully', { target, name, executionTimeMs });

    nextActions.push({
      action: 'VERIFY_INDEX_HEALTH',
      description: 'Index rebuilt successfully. Verify index usage and performance.',
      example: 'agentAnalyzeIndexUsage({ table: "' + (target === 'table' ? name : '') + '" })',
      priority: 'LOW'
    });

    return {
      success: true,
      summary: `REINDEX${concurrent ? ' CONCURRENTLY' : ''} completed for ${target} ${name}`,
      executionTimeMs,
      operation: 'maintenance',
      nextActions
    };

  } catch (error: any) {
    const executionTimeMs = Date.now() - startTime;
    logger.error('REINDEX operation failed', { error: error.message, target, name });

    const recoveryActions: NextAction[] = [{
      action: 'CHECK_POSTGRESQL_VERSION',
      description: 'REINDEX CONCURRENTLY requires PostgreSQL 12+. Check your version.',
      example: 'SELECT version();',
      priority: 'HIGH'
    }];

    // Check if error mentions CONCURRENTLY
    if (concurrent && error.message.toLowerCase().includes('concurrently')) {
      recoveryActions.unshift({
        action: 'RETRY_WITHOUT_CONCURRENT',
        description: 'CONCURRENTLY option may not be supported. Try without it during maintenance window.',
        example: 'agentReindex({ target: "' + target + '", name: "' + name + '", concurrent: false })',
        priority: 'HIGH'
      });
    }

    recoveryActions.push({
      action: 'CHECK_TARGET_EXISTS',
      description: `Verify ${target} '${name}' exists`,
      example: 'agentIntrospectSchema({ table: "' + (target === 'table' ? name : '') + '" })',
      priority: 'HIGH'
    });

    return {
      success: false,
      summary: `REINDEX failed: ${error.message}`,
      executionTimeMs,
      operation: 'maintenance',
      nextActions: recoveryActions
    };
  }
}

