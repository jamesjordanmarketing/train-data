/**
 * Transaction Wrapper with Automatic Rollback
 * 
 * Provides database transaction management with:
 * - Automatic BEGIN/COMMIT/ROLLBACK
 * - Timeout enforcement
 * - Deadlock retry with exponential backoff
 * - Error logging and classification
 * - Configurable isolation levels
 * 
 * @module database/transaction
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { DatabaseError, ErrorCode } from '../../../train-wireframe/src/lib/errors';
import { errorLogger } from '../../../train-wireframe/src/lib/errors/error-logger';
import { withRetry } from '../../../train-wireframe/src/lib/api/retry';

// Transaction configuration interface
export interface TransactionConfig {
  /** Transaction isolation level */
  isolationLevel?: 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE';
  /** Transaction timeout in milliseconds */
  timeout?: number;
  /** Whether to automatically retry deadlocks */
  retryDeadlocks?: boolean;
  /** Maximum number of retry attempts */
  maxRetries?: number;
}

// Default transaction configuration
const DEFAULT_TRANSACTION_CONFIG: Required<TransactionConfig> = {
  isolationLevel: 'READ COMMITTED',
  timeout: 30000, // 30 seconds
  retryDeadlocks: true,
  maxRetries: 3,
};

// Transaction context passed to transaction function
export interface TransactionContext {
  /** Supabase client for database operations */
  client: SupabaseClient;
  /** Unique transaction ID for tracking */
  transactionId: string;
  /** Transaction start timestamp */
  startTime: number;
}

/**
 * Execute a function within a database transaction.
 * Automatically handles:
 * - BEGIN/COMMIT/ROLLBACK
 * - Timeout enforcement
 * - Error logging
 * - Transaction isolation
 * 
 * @param fn Function to execute in transaction context
 * @param config Transaction configuration
 * @returns Result of the function execution
 * 
 * @example
 * ```typescript
 * const result = await withTransaction(async (ctx) => {
 *   const { data: conversation, error: convError } = await ctx.client
 *     .from('conversations')
 *     .insert(conversationData)
 *     .select()
 *     .single();
 *   
 *   if (convError) throw convError;
 *   
 *   const { error: turnsError } = await ctx.client
 *     .from('conversation_turns')
 *     .insert(turnsData.map(t => ({ ...t, conversation_id: conversation.id })));
 *   
 *   if (turnsError) throw turnsError;
 *   
 *   return conversation;
 * });
 * ```
 */
export async function withTransaction<T>(
  fn: (context: TransactionContext) => Promise<T>,
  config: TransactionConfig = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_TRANSACTION_CONFIG, ...config };
  const transactionId = crypto.randomUUID();
  const startTime = Date.now();

  errorLogger.debug('Starting transaction', {
    transactionId,
    isolationLevel: finalConfig.isolationLevel,
    timeout: finalConfig.timeout,
  });

  // Create transaction client
  // Note: Supabase JS client doesn't expose native PostgreSQL transactions directly.
  // We'll use RPC calls to execute transaction control statements.
  const client = supabase;

  try {
    // Begin transaction
    const { error: beginError } = await client.rpc('begin_transaction', {
      isolation_level: finalConfig.isolationLevel,
    });

    if (beginError) {
      throw new DatabaseError(
        'Failed to begin transaction',
        ErrorCode.ERR_DB_CONNECTION,
        {
          cause: beginError instanceof Error ? beginError : new Error(String(beginError)),
          context: {
            component: 'TransactionWrapper',
            metadata: { transactionId, isolationLevel: finalConfig.isolationLevel },
          },
        }
      );
    }

    // Set up timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new DatabaseError(
          `Transaction timed out after ${finalConfig.timeout}ms`,
          ErrorCode.ERR_DB_TIMEOUT,
          {
            context: {
              component: 'TransactionWrapper',
              metadata: { transactionId, duration: Date.now() - startTime },
            },
          }
        ));
      }, finalConfig.timeout);
    });

    // Execute function with timeout race
    const context: TransactionContext = {
      client,
      transactionId,
      startTime,
    };

    const result = await Promise.race([
      fn(context),
      timeoutPromise,
    ]);

    // Commit transaction
    const { error: commitError } = await client.rpc('commit_transaction');

    if (commitError) {
      // Try to rollback if commit fails
      await client.rpc('rollback_transaction').catch(() => {
        // Ignore rollback errors after commit failure
      });

      throw new DatabaseError(
        'Failed to commit transaction',
        ErrorCode.ERR_DB_QUERY,
        {
          cause: commitError instanceof Error ? commitError : new Error(String(commitError)),
          context: {
            component: 'TransactionWrapper',
            metadata: { transactionId, duration: Date.now() - startTime },
          },
        }
      );
    }

    const duration = Date.now() - startTime;
    errorLogger.info('Transaction committed successfully', {
      transactionId,
      duration,
    });

    return result;
  } catch (error) {
    // Rollback on any error
    const { error: rollbackError } = await client.rpc('rollback_transaction');

    if (rollbackError) {
      errorLogger.error('Failed to rollback transaction', rollbackError instanceof Error ? rollbackError : undefined, {
        transactionId,
        originalError: error instanceof Error ? error.message : String(error),
      });
    } else {
      errorLogger.warn('Transaction rolled back due to error', error instanceof Error ? error : undefined, {
        transactionId,
        duration: Date.now() - startTime,
      });
    }

    // Re-throw the original error (now classified)
    if (error instanceof DatabaseError) {
      throw error;
    }

    // Classify and wrap unknown errors
    throw classifyDatabaseError(error, transactionId);
  }
}

/**
 * Wrapper that adds automatic deadlock retry to withTransaction.
 * Use this for operations that commonly encounter deadlocks.
 * 
 * @param fn Function to execute in transaction context
 * @param config Transaction configuration
 * @returns Result of the function execution
 * 
 * @example
 * ```typescript
 * const result = await withTransactionRetry(async (ctx) => {
 *   // Operations that might deadlock
 *   const { data, error } = await ctx.client
 *     .from('conversations')
 *     .update(updates)
 *     .eq('id', id)
 *     .select()
 *     .single();
 *   
 *   if (error) throw error;
 *   return data;
 * });
 * ```
 */
export async function withTransactionRetry<T>(
  fn: (context: TransactionContext) => Promise<T>,
  config: TransactionConfig = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_TRANSACTION_CONFIG, ...config };

  if (!finalConfig.retryDeadlocks) {
    return withTransaction(fn, finalConfig);
  }

  return withRetry(
    () => withTransaction(fn, finalConfig),
    {
      maxAttempts: finalConfig.maxRetries,
      initialDelay: 100,
      backoffFactor: 2,
      maxDelay: 2000,
      retryableErrors: ['ERR_DB_DEADLOCK', 'ERR_DB_TIMEOUT'],
    },
    { component: 'TransactionRetryWrapper' }
  );
}

/**
 * Classify database errors into specific DatabaseError types.
 * Maps Postgres error codes to application error codes.
 * 
 * @param error Error to classify
 * @param transactionId Optional transaction ID for context
 * @returns Classified DatabaseError instance
 */
function classifyDatabaseError(error: unknown, transactionId?: string): DatabaseError {
  if (error instanceof DatabaseError) {
    return error;
  }

  // Supabase errors have a code property
  const supabaseError = error as any;
  const code = supabaseError?.code;
  const message = supabaseError?.message || 'Unknown database error';

  // Map Postgres error codes
  // Reference: https://www.postgresql.org/docs/current/errcodes-appendix.html
  if (code === '40P01') {
    // Deadlock detected
    return new DatabaseError(
      'Database deadlock detected. The operation will be retried.',
      ErrorCode.ERR_DB_DEADLOCK,
      {
        sqlCode: code,
        context: {
          component: 'TransactionWrapper',
          metadata: { transactionId, postgresCode: code },
        },
        cause: error instanceof Error ? error : undefined,
      }
    );
  }

  if (code === '23505') {
    // Unique violation
    const constraint = supabaseError?.details?.match(/Key \((.*?)\)/)?.[1] || 'unknown';
    return new DatabaseError(
      `Duplicate entry: ${constraint} already exists`,
      ErrorCode.ERR_DB_CONSTRAINT,
      {
        sqlCode: code,
        constraint,
        context: {
          component: 'TransactionWrapper',
          metadata: { transactionId, postgresCode: code, constraint },
        },
        cause: error instanceof Error ? error : undefined,
      }
    );
  }

  if (code === '23503') {
    // Foreign key violation
    const constraint = supabaseError?.details?.match(/violates foreign key constraint "(.*?)"/)?.[1] || 'unknown';
    return new DatabaseError(
      `Referenced record not found: ${constraint}`,
      ErrorCode.ERR_DB_CONSTRAINT,
      {
        sqlCode: code,
        constraint,
        context: {
          component: 'TransactionWrapper',
          metadata: { transactionId, postgresCode: code, constraint },
        },
        cause: error instanceof Error ? error : undefined,
      }
    );
  }

  if (code === '23502') {
    // Not null violation
    const column = supabaseError?.details?.match(/column "(.*?)"/)?.[1] || 'unknown';
    return new DatabaseError(
      `Required field missing: ${column}`,
      ErrorCode.ERR_DB_CONSTRAINT,
      {
        sqlCode: code,
        constraint: `not_null_${column}`,
        context: {
          component: 'TransactionWrapper',
          metadata: { transactionId, postgresCode: code, column },
        },
        cause: error instanceof Error ? error : undefined,
      }
    );
  }

  if (code === 'PGRST301' || code === '08000' || code === '08003' || code === '08006') {
    // Connection errors
    return new DatabaseError(
      'Database connection failed. Please check your network connection.',
      ErrorCode.ERR_DB_CONNECTION,
      {
        sqlCode: code,
        context: {
          component: 'TransactionWrapper',
          metadata: { transactionId, postgresCode: code },
        },
        cause: error instanceof Error ? error : undefined,
      }
    );
  }

  // Default to generic query error
  return new DatabaseError(
    message,
    ErrorCode.ERR_DB_QUERY,
    {
      sqlCode: code || 'UNKNOWN',
      context: {
        component: 'TransactionWrapper',
        metadata: { transactionId, postgresCode: code },
      },
      cause: error instanceof Error ? error : undefined,
    }
  );
}

/**
 * SQL functions for transaction management.
 * These should be run in Supabase SQL Editor during setup.
 */
export const TRANSACTION_SQL_FUNCTIONS = `
-- Function to begin a transaction with configurable isolation level
CREATE OR REPLACE FUNCTION begin_transaction(isolation_level TEXT DEFAULT 'READ COMMITTED')
RETURNS void AS $$
BEGIN
  EXECUTE format('BEGIN ISOLATION LEVEL %s', isolation_level);
END;
$$ LANGUAGE plpgsql;

-- Function to commit a transaction
CREATE OR REPLACE FUNCTION commit_transaction()
RETURNS void AS $$
BEGIN
  COMMIT;
END;
$$ LANGUAGE plpgsql;

-- Function to rollback a transaction
CREATE OR REPLACE FUNCTION rollback_transaction()
RETURNS void AS $$
BEGIN
  ROLLBACK;
END;
$$ LANGUAGE plpgsql;
`;

