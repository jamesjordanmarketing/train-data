/**
 * Database Resilience & Transaction Management
 * 
 * Centralized exports for database transaction management,
 * error classification, and health monitoring utilities.
 * 
 * @module database
 */

// Transaction Management
export {
  withTransaction,
  withTransactionRetry,
  TRANSACTION_SQL_FUNCTIONS,
  type TransactionConfig,
  type TransactionContext,
} from './transaction';

// Error Classification
export {
  classifyDatabaseError,
  isDatabaseErrorRetryable,
  getDatabaseErrorMessage,
  getDatabaseRecoveryAction,
  PostgresErrorCode,
  DatabaseErrorCategory,
  DatabaseRecoveryAction,
  DATABASE_ERROR_MESSAGES,
  type DatabaseErrorClassification,
} from './errors';

// Health Monitoring
export {
  performHealthCheck,
  scheduleHealthChecks,
  DatabaseHealthStatus,
  type DatabaseHealthCheck,
  type HealthThresholds,
} from './health';

/**
 * Quick Start Example:
 * 
 * ```typescript
 * import { withTransaction, classifyDatabaseError, performHealthCheck } from '@/lib/database';
 * 
 * // 1. Use transactions for atomic operations
 * const result = await withTransaction(async (ctx) => {
 *   const { data, error } = await ctx.client
 *     .from('conversations')
 *     .insert(conversationData)
 *     .select()
 *     .single();
 *   
 *   if (error) throw error;
 *   return data;
 * });
 * 
 * // 2. Handle errors gracefully
 * try {
 *   await saveData();
 * } catch (error) {
 *   const classification = classifyDatabaseError(error);
 *   if (classification.isRetryable) {
 *     // Retry
 *   } else {
 *     toast.error(classification.userMessage);
 *   }
 * }
 * 
 * // 3. Monitor database health
 * const health = await performHealthCheck();
 * if (health.status !== 'HEALTHY') {
 *   console.warn(health.message, health.recommendations);
 * }
 * ```
 */

