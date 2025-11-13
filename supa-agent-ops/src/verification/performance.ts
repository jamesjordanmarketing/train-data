/**
 * Performance Monitoring Module
 * Provides index usage analysis and query optimization tools
 */

import { 
  AgentOperationResult,
  NextAction
} from '../core/types';
import { agentExecuteSQL } from '../operations/rpc';
import { logger } from '../utils/logger';

/**
 * Parameters for index usage analysis
 */
export interface IndexUsageParams {
  table?: string;
  minScans?: number;
}

/**
 * Index usage information
 */
export interface IndexUsageInfo {
  tableName: string;
  indexName: string;
  scans: number;
  tuplesRead: number;
  tuplesReturned: number;
  sizeBytes: number;
  unused: boolean;
}

/**
 * Result from index usage analysis
 */
export interface IndexUsageResult extends AgentOperationResult {
  indexes: IndexUsageInfo[];
  recommendations: string[];
  operation: string;
}

/**
 * Analyzes index usage and identifies unused or underutilized indexes
 * 
 * @param params - Index usage analysis parameters
 * @returns Analysis result with index usage stats and recommendations
 * 
 * @example
 * ```typescript
 * // Analyze all indexes with low usage
 * const result = await agentAnalyzeIndexUsage({
 *   minScans: 100
 * });
 * 
 * // Analyze indexes for a specific table
 * const result2 = await agentAnalyzeIndexUsage({
 *   table: 'conversations',
 *   minScans: 10
 * });
 * 
 * // Review recommendations
 * console.log('Recommendations:', result.recommendations);
 * result.indexes.filter(idx => idx.unused).forEach(idx => {
 *   console.log(`Unused index: ${idx.indexName} on ${idx.tableName}`);
 * });
 * ```
 */
export async function agentAnalyzeIndexUsage(params: IndexUsageParams): Promise<IndexUsageResult> {
  const startTime = Date.now();
  const { table, minScans = 100 } = params;

  logger.info('Starting index usage analysis', { table, minScans });

  try {
    // Query pg_stat_user_indexes for usage statistics
    const sql = `
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan AS scans,
        idx_tup_read AS tuples_read,
        idx_tup_fetch AS tuples_returned,
        pg_relation_size(indexrelid) AS size_bytes
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
        AND idx_scan < ${minScans}
        ${table ? `AND tablename = '${table}'` : ''}
      ORDER BY idx_scan ASC, size_bytes DESC;
    `;

    const result = await agentExecuteSQL({ 
      sql,
      transport: 'pg'
    });

    if (!result.success) {
      throw new Error(result.summary);
    }

    // Parse index usage data
    const indexes: IndexUsageInfo[] = (result.rows || []).map(row => ({
      tableName: row.tablename,
      indexName: row.indexname,
      scans: parseInt(row.scans) || 0,
      tuplesRead: parseInt(row.tuples_read) || 0,
      tuplesReturned: parseInt(row.tuples_returned) || 0,
      sizeBytes: parseInt(row.size_bytes) || 0,
      unused: (parseInt(row.scans) || 0) === 0
    }));

    // Generate recommendations
    const recommendations: string[] = [];
    const unusedIndexes = indexes.filter(idx => idx.unused && idx.sizeBytes > 1000000); // > 1MB
    const lowUsageIndexes = indexes.filter(idx => !idx.unused && idx.scans < 10);

    if (unusedIndexes.length > 0) {
      const totalSize = unusedIndexes.reduce((sum, idx) => sum + idx.sizeBytes, 0);
      recommendations.push(
        `Found ${unusedIndexes.length} unused index(es) consuming ${formatBytes(totalSize)}. Consider dropping them to reclaim space.`
      );
    }

    if (lowUsageIndexes.length > 0) {
      recommendations.push(
        `Found ${lowUsageIndexes.length} index(es) with very low usage (< 10 scans). Review if they are still needed.`
      );
    }

    if (indexes.length === 0) {
      recommendations.push(
        table 
          ? `All indexes on table '${table}' are performing well (>= ${minScans} scans).`
          : `All indexes are performing well (>= ${minScans} scans).`
      );
    }

    // Check for indexes with low selectivity (many tuples read vs returned)
    const lowSelectivityIndexes = indexes.filter(idx => {
      return idx.tuplesRead > 0 && idx.tuplesReturned > 0 && 
             (idx.tuplesRead / idx.tuplesReturned) > 10;
    });

    if (lowSelectivityIndexes.length > 0) {
      recommendations.push(
        `Found ${lowSelectivityIndexes.length} index(es) with low selectivity. They may not be improving query performance.`
      );
    }

    const executionTimeMs = Date.now() - startTime;

    logger.info('Index usage analysis completed', { 
      indexCount: indexes.length,
      unusedCount: unusedIndexes.length,
      executionTimeMs 
    });

    // Build next actions
    const nextActions: NextAction[] = [];

    if (unusedIndexes.length > 0) {
      const indexNames = unusedIndexes.slice(0, 3).map(idx => idx.indexName).join(', ');
      nextActions.push({
        action: 'DROP_UNUSED_INDEXES',
        description: `Drop unused indexes: ${indexNames}${unusedIndexes.length > 3 ? '...' : ''}`,
        example: `DROP INDEX IF EXISTS ${unusedIndexes[0].indexName};`,
        priority: 'MEDIUM'
      });
    }

    if (lowUsageIndexes.length > 0) {
      nextActions.push({
        action: 'REVIEW_LOW_USAGE_INDEXES',
        description: `Review indexes with low usage to determine if they are needed`,
        priority: 'LOW'
      });
    }

    recommendations.forEach(rec => {
      if (rec.includes('performing well')) {
        nextActions.push({
          action: 'MONITOR_INDEX_USAGE',
          description: rec,
          priority: 'LOW'
        });
      }
    });

    return {
      success: true,
      summary: `Analyzed ${indexes.length} index(es)${table ? ` on table '${table}'` : ''} with usage below ${minScans} scans`,
      executionTimeMs,
      operation: 'performance',
      indexes,
      recommendations,
      nextActions: nextActions.length > 0 ? nextActions : [{
        action: 'CONTINUE_MONITORING',
        description: 'Index usage analysis complete. Continue monitoring over time.',
        priority: 'LOW'
      }]
    };

  } catch (error: any) {
    const executionTimeMs = Date.now() - startTime;
    logger.error('Index usage analysis failed', { error: error.message, table });

    return {
      success: false,
      summary: `Index usage analysis failed: ${error.message}`,
      executionTimeMs,
      operation: 'performance',
      indexes: [],
      recommendations: [],
      nextActions: [{
        action: 'CHECK_PERMISSIONS',
        description: 'Verify database role has SELECT permissions on pg_stat_user_indexes',
        example: 'GRANT SELECT ON pg_stat_user_indexes TO role_name;',
        priority: 'HIGH'
      }, {
        action: 'CHECK_STATISTICS',
        description: 'Ensure statistics collector is enabled in PostgreSQL',
        example: 'SHOW track_counts;  -- Should be ON',
        priority: 'HIGH'
      }]
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Formats bytes into human-readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Analyzes table bloat and provides recommendations
 * 
 * @param table - Table name to analyze for bloat
 * @returns Analysis result with bloat statistics
 * 
 * @example
 * ```typescript
 * const result = await agentAnalyzeTableBloat('conversations');
 * console.log(`Bloat percentage: ${result.bloatPercentage}%`);
 * ```
 */
export async function agentAnalyzeTableBloat(table: string): Promise<AgentOperationResult> {
  const startTime = Date.now();

  logger.info('Starting table bloat analysis', { table });

  try {
    // Query to estimate table bloat
    const sql = `
      SELECT 
        current_database() AS database,
        schemaname AS schema,
        tablename AS table,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
        pg_total_relation_size(schemaname||'.'||tablename) AS total_bytes,
        ROUND(100 * pg_total_relation_size(schemaname||'.'||tablename) / 
          NULLIF(pg_database_size(current_database()), 0), 2) AS percent_of_db
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename = '${table}'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    `;

    const result = await agentExecuteSQL({ 
      sql,
      transport: 'pg'
    });

    if (!result.success) {
      throw new Error(result.summary);
    }

    const executionTimeMs = Date.now() - startTime;
    const data = result.rows?.[0];

    if (!data) {
      return {
        success: false,
        summary: `Table ${table} not found`,
        executionTimeMs,
        operation: 'performance',
        nextActions: [{
          action: 'CHECK_TABLE_EXISTS',
          description: `Verify table '${table}' exists`,
          example: 'agentIntrospectSchema({ table: "' + table + '" })',
          priority: 'HIGH'
        }]
      };
    }

    const recommendations: string[] = [];
    const totalBytes = parseInt(data.total_bytes) || 0;
    const percentOfDb = parseFloat(data.percent_of_db) || 0;

    if (totalBytes > 1024 * 1024 * 1024) { // > 1GB
      recommendations.push(
        `Table ${table} is large (${data.total_size}). Consider partitioning or archiving old data.`
      );
    }

    if (percentOfDb > 50) {
      recommendations.push(
        `Table ${table} occupies ${percentOfDb}% of the database. Monitor growth and consider optimization.`
      );
    }

    const nextActions: NextAction[] = recommendations.map(rec => ({
      action: 'REVIEW_TABLE_SIZE',
      description: rec,
      priority: 'MEDIUM'
    }));

    nextActions.push({
      action: 'CONSIDER_VACUUM',
      description: 'Run VACUUM to reclaim dead tuple space',
      example: 'agentVacuum({ table: "' + table + '", analyze: true })',
      priority: 'LOW'
    });

    logger.info('Table bloat analysis completed', { table, executionTimeMs });

    return {
      success: true,
      summary: `Table ${table} size: ${data.total_size} (${percentOfDb}% of database)`,
      executionTimeMs,
      operation: 'performance',
      nextActions
    };

  } catch (error: any) {
    const executionTimeMs = Date.now() - startTime;
    logger.error('Table bloat analysis failed', { error: error.message, table });

    return {
      success: false,
      summary: `Table bloat analysis failed: ${error.message}`,
      executionTimeMs,
      operation: 'performance',
      nextActions: [{
        action: 'CHECK_PERMISSIONS',
        description: 'Verify database role has permissions to query system catalogs',
        priority: 'HIGH'
      }]
    };
  }
}

