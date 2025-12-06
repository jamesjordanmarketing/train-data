/**
 * Query Operations Module
 * Advanced SELECT queries with filtering, pagination, aggregation, and counting
 */

import { getSupabaseClient } from '../core/client';
import { 
  QueryParams, 
  QueryResult, 
  CountParams, 
  CountResult,
  QueryFilter,
  OrderSpec,
  NextAction
} from '../core/types';
import { logger } from '../utils/logger';
import { generateRecoverySteps } from '../errors/handlers';

/**
 * Applies a single filter to a Supabase query builder
 */
function applyFilter(query: any, filter: QueryFilter): any {
  // Support backward compatibility: use 'field' alias if 'column' is not provided
  const column = filter.column || filter.field;
  const { operator, value } = filter;
  
  if (!column) {
    logger.warn('Filter missing column name, skipping');
    return query;
  }
  
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
 * Applies all filters to a Supabase query builder
 */
function applyFilters(query: any, filters: QueryFilter[]): any {
  let result = query;
  for (const filter of filters) {
    result = applyFilter(result, filter);
  }
  return result;
}

/**
 * Applies ordering to a Supabase query builder
 */
function applyOrdering(query: any, orderBy: OrderSpec[]): any {
  let result = query;
  for (const order of orderBy) {
    result = result.order(order.column, { ascending: order.asc });
  }
  return result;
}

/**
 * Advanced query operation with filtering, pagination, and aggregation
 * 
 * @param params - Query parameters including table, filters, ordering, pagination
 * @returns Query result with data, count, and aggregates
 * 
 * @example
 * ```typescript
 * const result = await agentQuery({
 *   table: 'conversations',
 *   where: [{ column: 'status', operator: 'eq', value: 'approved' }],
 *   orderBy: [{ column: 'created_at', asc: false }],
 *   limit: 10
 * });
 * ```
 */
export async function agentQuery(params: QueryParams): Promise<QueryResult> {
  const startTime = Date.now();
  
  try {
    const supabase = getSupabaseClient();
    const {
      table,
      select = ['*'],
      where = [],
      filters,  // Backward compatibility alias for 'where'
      orderBy = [],
      limit,
      offset,
      count = false,
      aggregate = []
    } = params;

    // Use filters as fallback if where is empty (backward compatibility)
    const actualWhere = where.length > 0 ? where : (filters || []);

    logger.info(`Executing query on table: ${table}`);

    // Normalize select parameter - handle both string and array
    let selectStr: string;
    if (Array.isArray(select)) {
      selectStr = select.join(',');
    } else if (typeof select === 'string') {
      selectStr = select;
    } else {
      selectStr = '*';
    }

    // Build base query
    let query = supabase.from(table).select(
      selectStr,
      { count: count ? 'exact' : undefined }
    );

    // Apply filters
    if (actualWhere.length > 0) {
      query = applyFilters(query, actualWhere);
    }

    // Apply ordering
    if (orderBy.length > 0) {
      query = applyOrdering(query, orderBy);
    }

    // Apply pagination
    if (limit !== undefined) {
      query = query.limit(limit);
    }
    if (offset !== undefined) {
      query = query.range(offset, offset + (limit || 1000) - 1);
    }

    // Execute query
    const { data, error, count: recordCount } = await query;

    if (error) {
      logger.error(`Query failed: ${error.message}`);
      throw error;
    }

    // Handle aggregations if requested
    let aggregates: Record<string, any> | undefined;
    if (aggregate.length > 0) {
      aggregates = {};
      for (const agg of aggregate) {
        const alias = agg.alias || `${agg.function.toLowerCase()}_${agg.column}`;
        
        // Compute aggregation on returned data (client-side)
        // Note: For production, consider using RPC or database functions for server-side aggregation
        switch (agg.function) {
          case 'COUNT':
            aggregates[alias] = data?.length || 0;
            break;
          case 'SUM':
            aggregates[alias] = data?.reduce((sum, row: any) => sum + (Number(row[agg.column]) || 0), 0) || 0;
            break;
          case 'AVG':
            const sum = data?.reduce((s, row: any) => s + (Number(row[agg.column]) || 0), 0) || 0;
            aggregates[alias] = data && data.length > 0 ? sum / data.length : 0;
            break;
          case 'MIN':
            aggregates[alias] = data && data.length > 0 
              ? Math.min(...data.map((row: any) => Number(row[agg.column]) || Infinity))
              : null;
            break;
          case 'MAX':
            aggregates[alias] = data && data.length > 0
              ? Math.max(...data.map((row: any) => Number(row[agg.column]) || -Infinity))
              : null;
            break;
        }
      }
    }

    const executionTimeMs = Date.now() - startTime;
    const recordCountValue = recordCount !== null ? recordCount : data?.length || 0;

    logger.info(`Query completed: ${data?.length || 0} records returned in ${executionTimeMs}ms`);

    const nextActions: NextAction[] = [];
    
    // Suggest export if many records
    if (data && data.length > 100) {
      nextActions.push({
        action: 'EXPORT_DATA',
        description: `Consider exporting ${data.length} records to file`,
        example: 'agentExportData({ table, config: { format: "json" } })',
        priority: 'LOW'
      });
    }

    // Suggest pagination if limit not set and many records
    if (data && data.length > 50 && !limit) {
      nextActions.push({
        action: 'ADD_PAGINATION',
        description: 'Consider adding pagination for better performance',
        example: 'agentQuery({ ...params, limit: 50, offset: 0 })',
        priority: 'MEDIUM'
      });
    }

    return {
      success: true,
      summary: `Retrieved ${data?.length || 0} records from ${table}${count ? ` (total: ${recordCountValue})` : ''}`,
      executionTimeMs,
      data: data || [],
      count: count ? recordCountValue : undefined,
      aggregates,
      nextActions
    };

  } catch (error: any) {
    const executionTimeMs = Date.now() - startTime;
    logger.error(`Query operation failed: ${error.message}`);

    // Use filters as fallback if where is empty (backward compatibility)
    const actualWhere = params.where && params.where.length > 0 ? params.where : (params.filters || []);

    // Generate recovery steps
    const recoverySteps = generateRecoverySteps([{
      record: { table: params.table, filters: actualWhere },
      error: {
        code: error.code || 'QUERY_ERROR',
        message: error.message
      }
    }]);

    const nextActions: NextAction[] = recoverySteps.map(step => ({
      action: step.action,
      description: step.description,
      example: step.example,
      priority: step.priority
    }));

    // Add table verification suggestion
    nextActions.push({
      action: 'VERIFY_TABLE',
      description: `Verify table '${params.table}' exists and has correct schema`,
      example: 'agentIntrospectSchema({ table: "' + params.table + '" })',
      priority: 'HIGH'
    });

    return {
      success: false,
      summary: `Query failed: ${error.message}`,
      executionTimeMs,
      data: [],
      nextActions
    };
  }
}

/**
 * Optimized count query with optional filtering
 * 
 * @param params - Count parameters including table and filters
 * @returns Count result with total count
 * 
 * @example
 * ```typescript
 * const result = await agentCount({
 *   table: 'conversations',
 *   where: [{ column: 'tier', operator: 'eq', value: 'template' }]
 * });
 * console.log(`Total records: ${result.count}`);
 * ```
 */
export async function agentCount(params: CountParams): Promise<CountResult> {
  const startTime = Date.now();

  try {
    const supabase = getSupabaseClient();
    const { table, where = [], distinct } = params;

    logger.info(`Executing count on table: ${table}${distinct ? ` (distinct: ${distinct})` : ''}`);

    // Build count query
    let query = supabase
      .from(table)
      .select(distinct || '*', { count: 'exact', head: true });

    // Apply filters
    if (where.length > 0) {
      query = applyFilters(query, where);
    }

    // Execute count query
    const { count, error } = await query;

    if (error) {
      logger.error(`Count query failed: ${error.message}`);
      throw error;
    }

    const executionTimeMs = Date.now() - startTime;
    const countValue = count || 0;

    logger.info(`Count completed: ${countValue} records in ${executionTimeMs}ms`);

    const nextActions: NextAction[] = [];

    // Suggest query if count is small
    if (countValue > 0 && countValue <= 1000) {
      nextActions.push({
        action: 'QUERY_DATA',
        description: `Query the ${countValue} records for processing`,
        example: 'agentQuery({ table: "' + table + '", where: [...] })',
        priority: 'LOW'
      });
    }

    // Suggest export if count is large
    if (countValue > 1000) {
      nextActions.push({
        action: 'EXPORT_DATA',
        description: `Large dataset (${countValue} records) - consider export`,
        example: 'agentExportData({ table: "' + table + '", config: { format: "jsonl" } })',
        priority: 'MEDIUM'
      });
    }

    return {
      success: true,
      summary: `Count: ${countValue} record(s) in ${table}`,
      executionTimeMs,
      count: countValue,
      nextActions
    };

  } catch (error: any) {
    const executionTimeMs = Date.now() - startTime;
    logger.error(`Count operation failed: ${error.message}`);

    const nextActions: NextAction[] = [{
      action: 'VERIFY_TABLE',
      description: `Verify table '${params.table}' exists and is accessible`,
      example: 'agentIntrospectSchema({ table: "' + params.table + '" })',
      priority: 'HIGH'
    }];

    return {
      success: false,
      summary: `Count failed: ${error.message}`,
      executionTimeMs,
      count: 0,
      nextActions
    };
  }
}

