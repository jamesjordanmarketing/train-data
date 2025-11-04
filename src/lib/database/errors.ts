/**
 * Database Error Classification and Messages
 * 
 * Provides:
 * - Postgres error code enumeration
 * - Error classification by category
 * - User-friendly error messages
 * - Recovery action recommendations
 * - Retryability determination
 * 
 * @module database/errors
 */

import { DatabaseError, ErrorCode } from '../../../train-wireframe/src/lib/errors';

/**
 * Postgres error codes enum
 * Reference: https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export enum PostgresErrorCode {
  // Class 23 — Integrity Constraint Violation
  UNIQUE_VIOLATION = '23505',
  FOREIGN_KEY_VIOLATION = '23503',
  NOT_NULL_VIOLATION = '23502',
  CHECK_VIOLATION = '23514',
  
  // Class 40 — Transaction Rollback
  DEADLOCK_DETECTED = '40P01',
  SERIALIZATION_FAILURE = '40001',
  
  // Class 08 — Connection Exception
  CONNECTION_FAILURE = '08000',
  CONNECTION_DOES_NOT_EXIST = '08003',
  CONNECTION_FAILURE_SQLCLIENT = '08006',
  
  // Class 57 — Operator Intervention
  QUERY_CANCELED = '57014',
  
  // Supabase specific
  PGRST_NO_ROWS = 'PGRST116',
  PGRST_JWT_EXPIRED = 'PGRST301',
}

/**
 * Database error category enum
 */
export enum DatabaseErrorCategory {
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  TRANSACTION_ERROR = 'TRANSACTION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  QUERY_ERROR = 'QUERY_ERROR',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Recovery action recommendations
 */
export enum DatabaseRecoveryAction {
  RETRY = 'RETRY',
  FIX_DATA = 'FIX_DATA',
  CHECK_NETWORK = 'CHECK_NETWORK',
  CONTACT_ADMIN = 'CONTACT_ADMIN',
  CHECK_PERMISSIONS = 'CHECK_PERMISSIONS',
  NONE = 'NONE',
}

/**
 * Error classification result
 */
export interface DatabaseErrorClassification {
  /** Error category */
  category: DatabaseErrorCategory;
  /** Whether the error can be retried */
  isRetryable: boolean;
  /** Recommended recovery action */
  recoveryAction: DatabaseRecoveryAction;
  /** User-friendly error message */
  userMessage: string;
  /** Technical error message for logging */
  technicalMessage: string;
  /** Constraint name if applicable */
  constraint?: string;
  /** Field name if applicable */
  field?: string;
}

/**
 * Classify a database error and provide recovery guidance.
 * 
 * @param error Error to classify (can be Supabase error, Postgres error, or generic Error)
 * @returns Classification with user-friendly message and recovery action
 * 
 * @example
 * ```typescript
 * try {
 *   await createConversation(data);
 * } catch (error) {
 *   const classification = classifyDatabaseError(error);
 *   if (classification.isRetryable) {
 *     // Retry logic
 *   } else {
 *     toast.error(classification.userMessage);
 *   }
 * }
 * ```
 */
export function classifyDatabaseError(error: unknown): DatabaseErrorClassification {
  const supabaseError = error as any;
  const code = supabaseError?.code as string;
  const message = supabaseError?.message || 'Unknown database error';
  const details = supabaseError?.details || '';

  // Unique constraint violation
  if (code === PostgresErrorCode.UNIQUE_VIOLATION) {
    const constraint = details?.match(/Key \((.*?)\)/)?.[1] || 'unknown field';
    const value = details?.match(/=\((.*?)\)/)?.[1];
    
    return {
      category: DatabaseErrorCategory.CONSTRAINT_VIOLATION,
      isRetryable: false,
      recoveryAction: DatabaseRecoveryAction.FIX_DATA,
      userMessage: `A record with this ${constraint} already exists${value ? ` (${value})` : ''}. Please use a different value.`,
      technicalMessage: message,
      constraint,
      field: constraint,
    };
  }

  // Foreign key violation
  if (code === PostgresErrorCode.FOREIGN_KEY_VIOLATION) {
    const constraint = details?.match(/violates foreign key constraint "(.*?)"/)?.[1] || 'unknown';
    const table = details?.match(/on table "(.*?)"/)?.[1];
    
    return {
      category: DatabaseErrorCategory.CONSTRAINT_VIOLATION,
      isRetryable: false,
      recoveryAction: DatabaseRecoveryAction.FIX_DATA,
      userMessage: `Referenced record not found${table ? ` in ${table}` : ''}. Please select a valid ${constraint.replace(/_/g, ' ')}.`,
      technicalMessage: message,
      constraint,
    };
  }

  // Not null violation
  if (code === PostgresErrorCode.NOT_NULL_VIOLATION) {
    const column = details?.match(/column "(.*?)"/)?.[1] || 'unknown';
    const fieldName = column.replace(/_/g, ' ');
    
    return {
      category: DatabaseErrorCategory.CONSTRAINT_VIOLATION,
      isRetryable: false,
      recoveryAction: DatabaseRecoveryAction.FIX_DATA,
      userMessage: `${fieldName} is required. Please provide a value.`,
      technicalMessage: message,
      constraint: `not_null_${column}`,
      field: column,
    };
  }

  // Check constraint violation
  if (code === PostgresErrorCode.CHECK_VIOLATION) {
    const constraint = details?.match(/violates check constraint "(.*?)"/)?.[1] || 'unknown';
    
    return {
      category: DatabaseErrorCategory.CONSTRAINT_VIOLATION,
      isRetryable: false,
      recoveryAction: DatabaseRecoveryAction.FIX_DATA,
      userMessage: `Invalid data: ${constraint.replace(/_/g, ' ')}. Please check your input.`,
      technicalMessage: message,
      constraint,
    };
  }

  // Deadlock detected
  if (code === PostgresErrorCode.DEADLOCK_DETECTED) {
    return {
      category: DatabaseErrorCategory.TRANSACTION_ERROR,
      isRetryable: true,
      recoveryAction: DatabaseRecoveryAction.RETRY,
      userMessage: 'The operation conflicted with another operation. Retrying automatically...',
      technicalMessage: message,
    };
  }

  // Serialization failure
  if (code === PostgresErrorCode.SERIALIZATION_FAILURE) {
    return {
      category: DatabaseErrorCategory.TRANSACTION_ERROR,
      isRetryable: true,
      recoveryAction: DatabaseRecoveryAction.RETRY,
      userMessage: 'Transaction conflict detected. Retrying automatically...',
      technicalMessage: message,
    };
  }

  // Connection errors
  if (
    code === PostgresErrorCode.CONNECTION_FAILURE ||
    code === PostgresErrorCode.CONNECTION_DOES_NOT_EXIST ||
    code === PostgresErrorCode.CONNECTION_FAILURE_SQLCLIENT
  ) {
    return {
      category: DatabaseErrorCategory.CONNECTION_ERROR,
      isRetryable: true,
      recoveryAction: DatabaseRecoveryAction.CHECK_NETWORK,
      userMessage: 'Database connection failed. Please check your network connection and try again.',
      technicalMessage: message,
    };
  }

  // Query canceled (timeout)
  if (code === PostgresErrorCode.QUERY_CANCELED) {
    return {
      category: DatabaseErrorCategory.TIMEOUT_ERROR,
      isRetryable: true,
      recoveryAction: DatabaseRecoveryAction.RETRY,
      userMessage: 'The operation took too long and was canceled. Please try again or simplify your request.',
      technicalMessage: message,
    };
  }

  // No rows returned (PGRST116)
  if (code === PostgresErrorCode.PGRST_NO_ROWS) {
    return {
      category: DatabaseErrorCategory.QUERY_ERROR,
      isRetryable: false,
      recoveryAction: DatabaseRecoveryAction.NONE,
      userMessage: 'The requested record was not found.',
      technicalMessage: message,
    };
  }

  // JWT expired
  if (code === PostgresErrorCode.PGRST_JWT_EXPIRED) {
    return {
      category: DatabaseErrorCategory.PERMISSION_ERROR,
      isRetryable: false,
      recoveryAction: DatabaseRecoveryAction.CHECK_PERMISSIONS,
      userMessage: 'Your session has expired. Please sign in again.',
      technicalMessage: message,
    };
  }

  // Default: Unknown error
  return {
    category: DatabaseErrorCategory.UNKNOWN,
    isRetryable: false,
    recoveryAction: DatabaseRecoveryAction.CONTACT_ADMIN,
    userMessage: 'An unexpected database error occurred. Please try again or contact support if the issue persists.',
    technicalMessage: message,
  };
}

/**
 * Check if a database error is retryable.
 * 
 * @param error Error to check
 * @returns True if the error can be retried, false otherwise
 * 
 * @example
 * ```typescript
 * if (isDatabaseErrorRetryable(error)) {
 *   await retryOperation();
 * }
 * ```
 */
export function isDatabaseErrorRetryable(error: unknown): boolean {
  const classification = classifyDatabaseError(error);
  return classification.isRetryable;
}

/**
 * Get user-friendly message for a database error.
 * 
 * @param error Error to get message for
 * @returns User-friendly error message
 * 
 * @example
 * ```typescript
 * const message = getDatabaseErrorMessage(error);
 * toast.error(message);
 * ```
 */
export function getDatabaseErrorMessage(error: unknown): string {
  const classification = classifyDatabaseError(error);
  return classification.userMessage;
}

/**
 * Get recovery action for a database error.
 * 
 * @param error Error to get recovery action for
 * @returns Recommended recovery action
 * 
 * @example
 * ```typescript
 * const action = getDatabaseRecoveryAction(error);
 * if (action === DatabaseRecoveryAction.RETRY) {
 *   // Implement retry logic
 * }
 * ```
 */
export function getDatabaseRecoveryAction(error: unknown): DatabaseRecoveryAction {
  const classification = classifyDatabaseError(error);
  return classification.recoveryAction;
}

/**
 * User-friendly error messages by category
 */
export const DATABASE_ERROR_MESSAGES: Record<DatabaseErrorCategory, string> = {
  [DatabaseErrorCategory.CONSTRAINT_VIOLATION]:
    'The data violates database constraints. Please check your input.',
  [DatabaseErrorCategory.CONNECTION_ERROR]:
    'Unable to connect to the database. Please check your network connection.',
  [DatabaseErrorCategory.TRANSACTION_ERROR]:
    'Transaction conflict occurred. The operation will be retried automatically.',
  [DatabaseErrorCategory.TIMEOUT_ERROR]:
    'The database operation took too long. Please try again.',
  [DatabaseErrorCategory.PERMISSION_ERROR]:
    'You do not have permission to perform this operation.',
  [DatabaseErrorCategory.QUERY_ERROR]:
    'The database query failed. Please try again.',
  [DatabaseErrorCategory.UNKNOWN]:
    'An unexpected database error occurred.',
};

