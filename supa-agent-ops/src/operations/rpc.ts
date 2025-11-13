/**
 * RPC Operations Module
 * Provides RPC function execution and raw SQL execution
 */

import { 
  RPCExecuteParams, 
  RPCExecuteResult,
  SQLExecuteParams,
  SQLExecuteResult,
  NextAction
} from '../core/types';
import { getPgClient, closePgClient, getSupabaseClient } from '../core/client';
import { logger } from '../utils/logger';
import { mapDatabaseError } from '../errors/codes';

/**
 * Executes a Supabase RPC function
 * 
 * @param params - RPC execution parameters
 * @returns Result with data returned from function
 * 
 * @example
 * ```typescript
 * const result = await agentExecuteRPC({
 *   functionName: 'exec_sql',
 *   params: { sql_script: 'SELECT COUNT(*) FROM conversations;' },
 *   timeout: 30000
 * });
 * console.log(result.data);
 * ```
 */
export async function agentExecuteRPC(
  params: RPCExecuteParams
): Promise<RPCExecuteResult> {
  const startTime = Date.now();
  const { functionName, params: rpcParams = {}, timeout = 30000 } = params;

  logger.info('Executing RPC function', { functionName, timeout });

  try {
    const supabase = getSupabaseClient();
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`RPC timeout after ${timeout}ms`)), timeout);
    });

    // Execute RPC with timeout
    const rpcPromise = supabase.rpc(functionName, rpcParams);
    
    const result = await Promise.race([
      rpcPromise,
      timeoutPromise
    ]);
    
    const { data, error } = result as { data: unknown; error: Error | null };

    if (error) {
      throw error;
    }

    const executionTimeMs = Date.now() - startTime;
    
    // Determine row count if data is an array
    const rowCount = Array.isArray(data) ? data.length : undefined;
    
    const summary = `RPC function "${functionName}" executed successfully${rowCount !== undefined ? `. Rows: ${rowCount}` : ''}`;

    logger.info('RPC execution completed', { functionName, rowCount, executionTimeMs });

    return {
      success: true,
      summary,
      executionTimeMs,
      nextActions: [{
        action: 'PROCESS_DATA',
        description: 'RPC executed successfully. Process returned data.',
        priority: 'LOW'
      }],
      data,
      rowCount
    };
  } catch (error: any) {
    const mapped = mapDatabaseError(error);
    logger.error('RPC execution failed', { functionName, error: mapped });

    return {
      success: false,
      summary: `RPC execution failed: ${mapped.description}`,
      executionTimeMs: Date.now() - startTime,
      nextActions: [{
        action: 'FIX_RPC_ERROR',
        description: mapped.remediation,
        example: mapped.example,
        priority: 'HIGH'
      }],
      data: null
    };
  }
}

/**
 * Executes raw SQL via RPC or direct pg connection
 * 
 * @param params - SQL execution parameters
 * @returns Result with rows and execution details
 * 
 * @example
 * ```typescript
 * // Using RPC (requires exec_sql function)
 * const result1 = await agentExecuteSQL({
 *   sql: 'SELECT * FROM conversations LIMIT 5;',
 *   transport: 'rpc'
 * });
 * 
 * // Using direct pg connection
 * const result2 = await agentExecuteSQL({
 *   sql: 'SELECT * FROM conversations LIMIT 5;',
 *   transport: 'pg',
 *   transaction: true
 * });
 * ```
 */
export async function agentExecuteSQL(
  params: SQLExecuteParams
): Promise<SQLExecuteResult> {
  const startTime = Date.now();
  const {
    sql,
    transport = 'pg',
    transaction = false,
    dryRun = false,
    timeout = 30000
  } = params;

  logger.info('Executing SQL', { transport, transaction, dryRun });

  if (dryRun) {
    logger.info('Dry run mode - skipping SQL execution', { sql });
    
    return {
      success: true,
      summary: 'Dry run completed. SQL validated.',
      executionTimeMs: Date.now() - startTime,
      nextActions: [{
        action: 'EXECUTE_SQL',
        description: 'Validation passed. Ready to execute SQL.',
        example: 'Set dryRun: false to execute',
        priority: 'MEDIUM'
      }],
      rows: [],
      rowCount: 0,
      command: extractSqlCommand(sql)
    };
  }

  if (transport === 'rpc') {
    return await executeViaRPC(sql, timeout, startTime);
  } else {
    return await executeViaPg(sql, transaction, timeout, startTime);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Executes SQL via Supabase RPC (requires exec_sql function)
 */
async function executeViaRPC(
  sql: string, 
  timeout: number, 
  startTime: number
): Promise<SQLExecuteResult> {
  try {
    const supabase = getSupabaseClient();
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`SQL timeout after ${timeout}ms`)), timeout);
    });

    // Execute via exec_sql RPC function
    const rpcPromise = supabase.rpc('exec_sql', { sql_script: sql });
    
    const result = await Promise.race([
      rpcPromise,
      timeoutPromise
    ]);
    
    const { data, error } = result as { data: unknown; error: Error | null };

    if (error) {
      throw error;
    }

    // Check if RPC function returned an error
    if (data && typeof data === 'object' && 'error' in data) {
      const errorData = data as { error: string; code?: string };
      const errorMsg = errorData.code 
        ? `${errorData.error} (Code: ${errorData.code})`
        : errorData.error;
      throw new Error(errorMsg);
    }

    const executionTimeMs = Date.now() - startTime;
    
    // Parse result based on structure
    let rows: any[] = [];
    let rowCount = 0;
    
    if (Array.isArray(data)) {
      rows = data;
      rowCount = data.length;
    } else if (data && typeof data === 'object') {
      rows = [data];
      rowCount = 1;
    }

    const command = extractSqlCommand(sql);
    const summary = `SQL executed via RPC. Command: ${command}, Rows: ${rowCount}`;

    logger.info('SQL execution (RPC) completed', { command, rowCount, executionTimeMs });

    return {
      success: true,
      summary,
      executionTimeMs,
      nextActions: [{
        action: 'PROCESS_RESULTS',
        description: 'SQL executed successfully. Process results.',
        priority: 'LOW'
      }],
      rows,
      rowCount,
      command
    };
  } catch (error: any) {
    const mapped = mapDatabaseError(error);
    logger.error('SQL execution (RPC) failed', { error: mapped });

    return {
      success: false,
      summary: `SQL execution failed: ${mapped.description}`,
      executionTimeMs: Date.now() - startTime,
      nextActions: [{
        action: 'FIX_SQL_ERROR',
        description: mapped.remediation,
        example: mapped.example,
        priority: 'HIGH'
      }],
      rows: [],
      rowCount: 0,
      command: extractSqlCommand(sql)
    };
  }
}

/**
 * Executes SQL via direct pg client connection
 */
async function executeViaPg(
  sql: string, 
  useTransaction: boolean,
  timeout: number,
  startTime: number
): Promise<SQLExecuteResult> {
  try {
    const client = await getPgClient();
    
    // Set statement timeout
    if (timeout) {
      await client.query(`SET statement_timeout = ${timeout}`);
    }

    if (useTransaction) {
      await client.query('BEGIN');
      logger.debug('Transaction started');
    }

    try {
      const result = await client.query(sql);
      
      if (useTransaction) {
        await client.query('COMMIT');
        logger.debug('Transaction committed');
      }

      await closePgClient();

      const executionTimeMs = Date.now() - startTime;
      const rows = result.rows || [];
      const rowCount = result.rowCount || rows.length;
      const command = result.command || extractSqlCommand(sql);
      
      const summary = `SQL executed via pg client. Command: ${command}, Rows: ${rowCount}`;

      logger.info('SQL execution (pg) completed', { command, rowCount, executionTimeMs });

      return {
        success: true,
        summary,
        executionTimeMs,
        nextActions: [{
          action: 'PROCESS_RESULTS',
          description: 'SQL executed successfully. Process results.',
          priority: 'LOW'
        }],
        rows,
        rowCount,
        command
      };
    } catch (execError: any) {
      if (useTransaction) {
        await client.query('ROLLBACK');
        logger.debug('Transaction rolled back');
      }
      throw execError;
    }
  } catch (error: any) {
    await closePgClient();
    
    const mapped = mapDatabaseError(error);
    logger.error('SQL execution (pg) failed', { error: mapped });

    return {
      success: false,
      summary: `SQL execution failed: ${mapped.description}`,
      executionTimeMs: Date.now() - startTime,
      nextActions: [{
        action: 'FIX_SQL_ERROR',
        description: mapped.remediation,
        example: mapped.example,
        priority: 'HIGH'
      }],
      rows: [],
      rowCount: 0,
      command: extractSqlCommand(sql)
    };
  }
}

/**
 * Extracts the SQL command from a query (SELECT, INSERT, UPDATE, etc.)
 */
function extractSqlCommand(sql: string): string {
  const trimmed = sql.trim().toUpperCase();
  const commands = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TRUNCATE'];
  
  for (const cmd of commands) {
    if (trimmed.startsWith(cmd)) {
      return cmd;
    }
  }
  
  return 'UNKNOWN';
}

/**
 * Helper to execute SQL with transaction wrapper
 * This is a utility function that can be used by other modules
 */
export async function executeWithTransaction(
  operation: () => Promise<any>,
  useTransaction: boolean = true
): Promise<any> {
  if (!useTransaction) {
    return await operation();
  }
  
  const client = await getPgClient();
  
  try {
    await client.query('BEGIN');
    const result = await operation();
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await closePgClient();
  }
}

