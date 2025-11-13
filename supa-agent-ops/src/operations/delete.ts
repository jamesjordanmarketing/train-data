/**
 * Delete Operations Module
 * Safe delete operations with dry-run, confirmation, and preview
 */

import { getSupabaseClient } from '../core/client';
import { 
  DeleteParams, 
  DeleteResult,
  QueryFilter,
  NextAction
} from '../core/types';
import { agentQuery } from './query';
import { logger } from '../utils/logger';

/**
 * Applies a single filter to a Supabase delete query builder
 */
function applyDeleteFilter(query: any, filter: QueryFilter): any {
  const { column, operator, value } = filter;
  
  switch (operator) {
    case 'eq':
      return query.eq(column, value);
    case 'neq':
      return query.neq(column, value);
    case 'gt':
      return query.gt(column, value);
    case 'gte':
      return query.gte(column, value);
    case 'lt':
      return query.lt(column, value);
    case 'lte':
      return query.lte(column, value);
    case 'like':
      return query.like(column, value);
    case 'in':
      return query.in(column, value);
    case 'is':
      return query.is(column, value);
    default:
      logger.warn(`Unknown operator: ${operator}, skipping filter`);
      return query;
  }
}

/**
 * Applies all filters to a Supabase delete query builder
 */
function applyDeleteFilters(query: any, filters: QueryFilter[]): any {
  let result = query;
  for (const filter of filters) {
    result = applyDeleteFilter(result, filter);
  }
  return result;
}

/**
 * Safe delete operation with dry-run and confirmation
 * 
 * @param params - Delete parameters with required WHERE clause
 * @returns Delete result with deleted count and preview
 * 
 * @example
 * ```typescript
 * // Step 1: Dry-run to preview what will be deleted
 * const dryRun = await agentDelete({
 *   table: 'conversations',
 *   where: [{ column: 'status', operator: 'eq', value: 'draft' }],
 *   dryRun: true
 * });
 * console.log(`Would delete ${dryRun.previewRecords?.length} records`);
 * 
 * // Step 2: Execute with confirmation
 * const result = await agentDelete({
 *   table: 'conversations',
 *   where: [{ column: 'status', operator: 'eq', value: 'draft' }],
 *   confirm: true
 * });
 * console.log(`Deleted ${result.deletedCount} records`);
 * ```
 */
export async function agentDelete(params: DeleteParams): Promise<DeleteResult> {
  const startTime = Date.now();
  
  try {
    const {
      table,
      where,
      cascade = false,
      dryRun = false,
      confirm = false
    } = params;

    // SAFETY CHECK 1: Require WHERE clause
    if (!where || where.length === 0) {
      throw new Error(
        'WHERE clause required for delete operations (safety measure). ' +
        'This prevents accidental deletion of all records.'
      );
    }

    logger.info(`Delete operation on ${table}: dryRun=${dryRun}, confirm=${confirm}`);

    // DRY-RUN MODE: Preview what would be deleted
    if (dryRun) {
      logger.info('Executing dry-run to preview affected records...');
      
      const preview = await agentQuery({
        table,
        where,
        count: true
      });

      if (!preview.success) {
        throw new Error(`Preview query failed: ${preview.summary}`);
      }

      const executionTimeMs = Date.now() - startTime;
      const recordCount = preview.data.length;

      logger.info(`Dry-run complete: Would delete ${recordCount} records`);

      const nextActions: NextAction[] = [{
        action: 'CONFIRM_DELETE',
        description: `Execute deletion of ${recordCount} record(s)`,
        example: 'agentDelete({ ...params, confirm: true })',
        priority: 'HIGH'
      }];

      // Warn if deleting many records
      if (recordCount > 100) {
        nextActions.push({
          action: 'REVIEW_RECORDS',
          description: `Large deletion (${recordCount} records) - review carefully`,
          example: 'Review previewRecords in result',
          priority: 'HIGH'
        });
      }

      // Suggest backup
      if (recordCount > 0) {
        nextActions.push({
          action: 'BACKUP_FIRST',
          description: 'Consider backing up records before deletion',
          example: 'agentExportData({ table, filters: [...], config: { format: "json" } })',
          priority: 'MEDIUM'
        });
      }

      return {
        success: true,
        summary: `Would delete ${recordCount} record(s) from ${table} (dry-run)`,
        executionTimeMs,
        deletedCount: 0,
        previewRecords: preview.data.slice(0, 10), // Return first 10 for review
        nextActions
      };
    }

    // SAFETY CHECK 2: Require explicit confirmation
    if (!confirm) {
      throw new Error(
        'confirm: true required to execute delete (safety measure). ' +
        'Run with dryRun: true first to preview affected records.'
      );
    }

    // EXECUTE DELETE
    logger.info('Executing confirmed delete operation...');
    
    const supabase = getSupabaseClient();
    
    // Build delete query with filters
    let deleteQuery = supabase.from(table).delete();
    deleteQuery = applyDeleteFilters(deleteQuery, where);
    
    // Execute the delete
    const { error, count } = await deleteQuery;

    if (error) {
      logger.error(`Delete failed: ${error.message}`);
      throw error;
    }

    const executionTimeMs = Date.now() - startTime;
    const deletedCount = count !== null && count !== undefined ? count : 0;

    logger.info(`Delete completed: ${deletedCount} records deleted`);

    const nextActions: NextAction[] = [];

    // Suggest verification
    if (deletedCount > 0) {
      nextActions.push({
        action: 'VERIFY_DELETION',
        description: 'Verify records were deleted successfully',
        example: 'agentCount({ table: "' + table + '", where: [...] })',
        priority: 'MEDIUM'
      });
    }

    // Warn if no records deleted
    if (deletedCount === 0) {
      nextActions.push({
        action: 'CHECK_FILTERS',
        description: 'No records deleted - verify WHERE clause matches records',
        example: 'agentQuery({ table: "' + table + '", where: [...] })',
        priority: 'HIGH'
      });
    }

    return {
      success: true,
      summary: `Deleted ${deletedCount} record(s) from ${table}`,
      executionTimeMs,
      deletedCount,
      nextActions
    };

  } catch (error: any) {
    const executionTimeMs = Date.now() - startTime;
    logger.error(`Delete operation failed: ${error.message}`);

    const nextActions: NextAction[] = [];

    // Provide helpful error recovery
    if (error.message.includes('WHERE clause required')) {
      nextActions.push({
        action: 'ADD_WHERE_CLAUSE',
        description: 'Add WHERE clause to target specific records',
        example: 'agentDelete({ table, where: [{ column: "id", operator: "eq", value: "..." }], ... })',
        priority: 'HIGH'
      });
    } else if (error.message.includes('confirm: true required')) {
      nextActions.push({
        action: 'RUN_DRY_RUN_FIRST',
        description: 'Run dry-run to preview affected records',
        example: 'agentDelete({ ...params, dryRun: true })',
        priority: 'HIGH'
      });
    } else {
      // Generic error recovery
      nextActions.push({
        action: 'VERIFY_TABLE',
        description: `Verify table '${params.table}' exists and is accessible`,
        example: 'agentIntrospectSchema({ table: "' + params.table + '" })',
        priority: 'HIGH'
      });
      
      nextActions.push({
        action: 'CHECK_PERMISSIONS',
        description: 'Verify you have DELETE permission on this table',
        example: 'Check RLS policies and role permissions',
        priority: 'HIGH'
      });
    }

    return {
      success: false,
      summary: `Delete failed: ${error.message}`,
      executionTimeMs,
      deletedCount: 0,
      nextActions
    };
  }
}

/**
 * Legacy function name for backward compatibility
 * @deprecated Use agentDelete instead
 */
export async function agentDeleteTool(params: {
  table: string;
  where: Record<string, any>;
  dryRun?: boolean;
}): Promise<{ success: boolean; deletedCount: number }> {
  // Convert old where format to new filters format
  const filters = Object.entries(params.where).map(([column, value]) => ({
    column,
    operator: 'eq' as const,
    value
  }));
  
  const result = await agentDelete({
    table: params.table,
    where: filters,
    dryRun: params.dryRun,
    confirm: !params.dryRun // Auto-confirm if not dry-run (legacy behavior)
  });
  
  return {
    success: result.success,
    deletedCount: result.deletedCount
  };
}
