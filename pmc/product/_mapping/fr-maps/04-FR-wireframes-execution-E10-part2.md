# Interactive LoRA Conversation Generation - Implementation Execution Instructions (E10 Part 2)
**Generated**: 2025-11-04  
**Segment**: E10 - Error Handling & Recovery Module (Prompts 4-5)  
**Total Prompts**: 2 (of 8 total)  
**Estimated Implementation Time**: 31-41 hours

---

## Executive Summary

This document contains the detailed implementation instructions for **Prompts 4 & 5** of the E10 segment (Error Handling & Recovery Module). These prompts were originally too cursory and have been expanded to match the comprehensive detail level of Prompts 1-3.

**Prompt 4** implements database resilience with transaction management, error classification, and health monitoring. **Prompt 5** implements auto-save and draft recovery to prevent data loss.

These prompts build upon the error infrastructure established in Prompts 1-3 and are critical for ensuring data integrity and user trust in the platform.

---

## Context from Prompts 1-3

### What Has Been Implemented (Prompts 1-3)

**Prompt 1 Deliverables:**
- Error classes: `AppError`, `APIError`, `NetworkError`, `ValidationError`, `GenerationError`, `DatabaseError`
- Error codes enum with 25+ codes (ERR_API_*, ERR_NET_*, ERR_GEN_*, ERR_DB_*, ERR_VAL_*)
- Type guards: `isAPIError()`, `isNetworkError()`, etc.
- ErrorLogger service with batching and multiple destinations
- Files: `train-wireframe/src/lib/errors/error-classes.ts`, `error-guards.ts`, `error-logger.ts`

**Prompt 2 Deliverables:**
- APIClient with rate limiting (50 req/min, 3 concurrent)
- Retry logic with exponential backoff (1s, 2s, 4s, 8s, 16s)
- Rate limit header parsing
- Generation error classification
- Files: `train-wireframe/src/lib/api/client.ts`, `retry.ts`, `rate-limit.ts`, `lib/generation/errors.ts`

**Prompt 3 Deliverables:**
- ErrorBoundary component (global and feature-specific)
- ErrorFallback UI with error details
- Feature boundaries: Dashboard, Generation, Templates, Export
- Integration with layout components
- Files: `train-wireframe/src/components/errors/ErrorBoundary.tsx`, `ErrorFallback.tsx`, `FeatureErrorBoundary.tsx`

### Integration Points for Prompts 4-5

**What Prompt 4 Will Use:**
- `DatabaseError` class from Prompt 1 for throwing database-specific errors
- `ErrorLogger` from Prompt 1 for logging transaction failures
- `withRetry()` from Prompt 2 for retrying deadlock/timeout errors
- Error codes: `ERR_DB_CONNECTION`, `ERR_DB_QUERY`, `ERR_DB_CONSTRAINT`, `ERR_DB_DEADLOCK`, `ERR_DB_TIMEOUT`

**What Prompt 5 Will Use:**
- `AppError` class from Prompt 1 for auto-save failures
- `ErrorLogger` from Prompt 1 for logging save failures
- `withRetry()` from Prompt 2 for retrying failed saves
- `ErrorBoundary` from Prompt 3 for catching UI errors during auto-save

---

## Implementation Prompts

### Prompt 4: Database Resilience & Transaction Management

**Scope**: Transaction wrapper with automatic rollback, database error classification, health monitoring integration  
**Dependencies**: Prompt 1 (Error Infrastructure)  
**Estimated Time**: 12-16 hours  
**Risk Level**: High

========================

You are a senior backend developer implementing **Database Resilience and Transaction Management** for the Interactive LoRA Conversation Generation platform.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
The Training Data Generation platform generates 90-100 high-quality AI training conversations through multi-step workflows. Database operations must be:
- Atomic: Multi-step operations (conversation + turns insert) must succeed or fail together
- Resilient: Transient errors (deadlocks, timeouts) must be retried automatically
- Monitored: Health issues must be detected and reported proactively
- Recoverable: Failed transactions must rollback cleanly without data corruption

Business users cannot afford data corruption or inconsistent states in the database.

**Functional Requirements (FR10.1.2):**
- Multi-step database operations must use transactions with automatic rollback
- Database errors must be classified into retryable vs non-retryable categories
- Postgres error codes must be mapped to user-friendly messages
- Deadlock errors must trigger automatic retry (max 3 attempts with exponential backoff)
- Constraint violations must provide actionable feedback to users
- Connection errors must be retried with exponential backoff
- Queries must timeout after configurable duration (default 30s)
- Transaction isolation level must be configurable per operation
- Health monitoring must detect degraded database performance

**Technical Architecture:**
- TypeScript with strict mode enabled
- Supabase PostgreSQL database
- Integration with error classes from Prompt 1 (`DatabaseError`, `ErrorCode`)
- Integration with retry logic from Prompt 2 (`withRetry`)
- Integration with ErrorLogger from Prompt 1
- Files located in `src/lib/database/` (backend service layer)

**CURRENT CODEBASE STATE:**

**Existing Database Operations (Basic):**
```typescript
// src/lib/database.ts - Current pattern (no transactions)
export const documentService = {
  async create(document: Partial<Document>) {
    const { data, error } = await supabase
      .from('documents')
      .insert(document)
      .select()
      .single();
    
    if (error) throw error; // No transaction, no error classification
    return data;
  },

  async update(id: string, updates: Partial<Document>) {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error; // Basic error propagation only
    return data;
  }
};
```

**Existing Services (No Transaction Support):**
```typescript
// src/lib/services/conversation-service.ts
// Currently: No transaction wrapper for multi-step operations
// Example: Creating conversation + multiple turns is not atomic
class ConversationService {
  async createConversation(data: ConversationCreateInput) {
    // Step 1: Insert conversation
    const conversation = await supabase
      .from('conversations')
      .insert(data)
      .select()
      .single();
    
    // Step 2: Insert turns (if step 1 succeeds but step 2 fails, data is inconsistent)
    const turns = await supabase
      .from('conversation_turns')
      .insert(turnsData);
    
    // Problem: No rollback if second operation fails!
    return conversation;
  }
}
```

**Existing Health Monitoring (Already Implemented):**
```typescript
// src/lib/services/database-health-service.ts - Already exists
// This service provides health metrics but doesn't handle errors
class DatabaseHealthService {
  async getHealthReport(): Promise<DatabaseHealthReport> {
    // Returns metrics about connection pool, query performance, etc.
  }
}
```

**Gaps Prompt 4 Will Fill:**
1. No transaction wrapper for atomic multi-step operations
2. No automatic rollback on errors
3. No Postgres error code classification
4. No user-friendly error messages for constraint violations
5. No automatic retry for deadlock/timeout errors
6. No query timeout handling
7. No integration between health monitoring and error handling

**IMPLEMENTATION TASKS:**

**Task T-4.1.1: Transaction Wrapper with Automatic Rollback**

1. Create `src/lib/database/transaction.ts`:

```typescript
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { DatabaseError, ErrorCode } from '../../train-wireframe/src/lib/errors';
import { errorLogger } from '../../train-wireframe/src/lib/errors/error-logger';
import { withRetry } from '../../train-wireframe/src/lib/api/retry';

// Transaction configuration
export interface TransactionConfig {
  isolationLevel?: 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE';
  timeout?: number; // milliseconds
  retryDeadlocks?: boolean;
  maxRetries?: number;
}

// Default transaction configuration
const DEFAULT_TRANSACTION_CONFIG: Required<TransactionConfig> = {
  isolationLevel: 'READ COMMITTED',
  timeout: 30000, // 30 seconds
  retryDeadlocks: true,
  maxRetries: 3,
};

// Transaction context type
export interface TransactionContext {
  client: SupabaseClient;
  transactionId: string;
  startTime: number;
}

/**
 * Execute a function within a database transaction.
 * Automatically handles:
 * - BEGIN/COMMIT/ROLLBACK
 * - Timeout enforcement
 * - Deadlock retry
 * - Error logging
 * - Transaction isolation
 * 
 * @param fn Function to execute in transaction context
 * @param config Transaction configuration
 * @returns Result of the function execution
 * 
 * @example
 * const result = await withTransaction(async (ctx) => {
 *   const conversation = await ctx.client
 *     .from('conversations')
 *     .insert(conversationData)
 *     .select()
 *     .single();
 *   
 *   await ctx.client
 *     .from('conversation_turns')
 *     .insert(turnsData.map(t => ({ ...t, conversation_id: conversation.data.id })));
 *   
 *   return conversation.data;
 * });
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
          cause: beginError,
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
          cause: commitError,
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
      errorLogger.error('Failed to rollback transaction', rollbackError, {
        transactionId,
        originalError: error instanceof Error ? error.message : String(error),
      });
    } else {
      errorLogger.warn('Transaction rolled back due to error', error, {
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
 * @example
 * const result = await withTransactionRetry(async (ctx) => {
 *   // Operations that might deadlock
 * });
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
 * Create Postgres functions for transaction management.
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
```

2. Implement comprehensive unit tests for transaction wrapper.

**Task T-4.1.2: Database Error Classifier and Messages**

Create `src/lib/database/errors.ts`:

```typescript
import { DatabaseError, ErrorCode } from '../../train-wireframe/src/lib/errors';

// Postgres error codes enum
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

// Error category enum
export enum DatabaseErrorCategory {
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  TRANSACTION_ERROR = 'TRANSACTION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  QUERY_ERROR = 'QUERY_ERROR',
  UNKNOWN = 'UNKNOWN',
}

// Recovery action enum
export enum DatabaseRecoveryAction {
  RETRY = 'RETRY',
  FIX_DATA = 'FIX_DATA',
  CHECK_NETWORK = 'CHECK_NETWORK',
  CONTACT_ADMIN = 'CONTACT_ADMIN',
  CHECK_PERMISSIONS = 'CHECK_PERMISSIONS',
  NONE = 'NONE',
}

// Error classification result
export interface DatabaseErrorClassification {
  category: DatabaseErrorCategory;
  isRetryable: boolean;
  recoveryAction: DatabaseRecoveryAction;
  userMessage: string;
  technicalMessage: string;
  constraint?: string;
  field?: string;
}

/**
 * Classify a database error and provide recovery guidance.
 * 
 * @param error Error to classify (can be Supabase error, Postgres error, or generic Error)
 * @returns Classification with user-friendly message and recovery action
 * 
 * @example
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
 */
export function getDatabaseRecoveryAction(error: unknown): DatabaseRecoveryAction {
  const classification = classifyDatabaseError(error);
  return classification.recoveryAction;
}

// Export user-friendly error messages
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
```

**Task T-4.1.3: Health Monitor Integration**

Create `src/lib/database/health.ts`:

```typescript
import { DatabaseHealthService } from '../services/database-health-service';
import { errorLogger } from '../../train-wireframe/src/lib/errors/error-logger';

// Health status enum
export enum DatabaseHealthStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  UNHEALTHY = 'UNHEALTHY',
  CRITICAL = 'CRITICAL',
}

// Health check result
export interface DatabaseHealthCheck {
  status: DatabaseHealthStatus;
  message: string;
  metrics: {
    connectionPoolUsage: number; // Percentage
    avgQueryTime: number; // Milliseconds
    cacheHitRatio: number; // Percentage
    activeConnections: number;
    idleConnections: number;
  };
  recommendations: string[];
  lastChecked: string;
}

// Health thresholds configuration
export interface HealthThresholds {
  degraded: {
    connectionPoolUsage: number; // Percentage
    avgQueryTime: number; // Milliseconds
    cacheHitRatio: number; // Percentage (minimum)
  };
  unhealthy: {
    connectionPoolUsage: number; // Percentage
    avgQueryTime: number; // Milliseconds
    cacheHitRatio: number; // Percentage (minimum)
  };
  critical: {
    connectionPoolUsage: number; // Percentage
    avgQueryTime: number; // Milliseconds
    cacheHitRatio: number; // Percentage (minimum)
  };
}

// Default health thresholds
const DEFAULT_HEALTH_THRESHOLDS: HealthThresholds = {
  degraded: {
    connectionPoolUsage: 70,
    avgQueryTime: 100,
    cacheHitRatio: 90,
  },
  unhealthy: {
    connectionPoolUsage: 85,
    avgQueryTime: 250,
    cacheHitRatio: 80,
  },
  critical: {
    connectionPoolUsage: 95,
    avgQueryTime: 500,
    cacheHitRatio: 70,
  },
};

/**
 * Perform a database health check.
 * 
 * @returns Health check result with status and metrics
 */
export async function performHealthCheck(
  thresholds: HealthThresholds = DEFAULT_HEALTH_THRESHOLDS
): Promise<DatabaseHealthCheck> {
  const healthService = new DatabaseHealthService();
  
  try {
    // Get health metrics from existing service
    const report = await healthService.getHealthReport();
    
    // Calculate metrics
    const connectionPoolUsage = (report.connectionPool.active / report.connectionPool.max) * 100;
    const avgQueryTime = report.slowQueries.reduce((sum, q) => sum + q.mean_exec_time, 0) / (report.slowQueries.length || 1);
    const cacheHitRatio = report.overview.cacheHitRatio;
    const activeConnections = report.connectionPool.active;
    const idleConnections = report.connectionPool.idle;
    
    // Determine status
    let status: DatabaseHealthStatus;
    let message: string;
    const recommendations: string[] = [];
    
    if (
      connectionPoolUsage >= thresholds.critical.connectionPoolUsage ||
      avgQueryTime >= thresholds.critical.avgQueryTime ||
      cacheHitRatio < thresholds.critical.cacheHitRatio
    ) {
      status = DatabaseHealthStatus.CRITICAL;
      message = 'Database health is critical. Immediate action required.';
      recommendations.push('Contact database administrator immediately');
      recommendations.push('Consider scaling database resources');
    } else if (
      connectionPoolUsage >= thresholds.unhealthy.connectionPoolUsage ||
      avgQueryTime >= thresholds.unhealthy.avgQueryTime ||
      cacheHitRatio < thresholds.unhealthy.cacheHitRatio
    ) {
      status = DatabaseHealthStatus.UNHEALTHY;
      message = 'Database health is unhealthy. Performance degradation detected.';
      recommendations.push('Investigate slow queries');
      recommendations.push('Consider increasing connection pool size');
    } else if (
      connectionPoolUsage >= thresholds.degraded.connectionPoolUsage ||
      avgQueryTime >= thresholds.degraded.avgQueryTime ||
      cacheHitRatio < thresholds.degraded.cacheHitRatio
    ) {
      status = DatabaseHealthStatus.DEGRADED;
      message = 'Database health is degraded. Monitor closely.';
      recommendations.push('Review recent query patterns');
      recommendations.push('Optimize slow queries if possible');
    } else {
      status = DatabaseHealthStatus.HEALTHY;
      message = 'Database health is good.';
    }
    
    // Add specific recommendations
    if (connectionPoolUsage >= thresholds.degraded.connectionPoolUsage) {
      recommendations.push(`Connection pool usage is ${connectionPoolUsage.toFixed(1)}%. Consider increasing pool size.`);
    }
    if (avgQueryTime >= thresholds.degraded.avgQueryTime) {
      recommendations.push(`Average query time is ${avgQueryTime.toFixed(0)}ms. Investigate slow queries.`);
    }
    if (cacheHitRatio < thresholds.degraded.cacheHitRatio) {
      recommendations.push(`Cache hit ratio is ${cacheHitRatio.toFixed(1)}%. Consider increasing shared_buffers.`);
    }
    
    const healthCheck: DatabaseHealthCheck = {
      status,
      message,
      metrics: {
        connectionPoolUsage,
        avgQueryTime,
        cacheHitRatio,
        activeConnections,
        idleConnections,
      },
      recommendations,
      lastChecked: new Date().toISOString(),
    };
    
    // Log health status
    if (status === DatabaseHealthStatus.CRITICAL || status === DatabaseHealthStatus.UNHEALTHY) {
      errorLogger.error('Database health check failed', undefined, {
        status,
        metrics: healthCheck.metrics,
      });
    } else if (status === DatabaseHealthStatus.DEGRADED) {
      errorLogger.warn('Database health degraded', undefined, {
        status,
        metrics: healthCheck.metrics,
      });
    } else {
      errorLogger.debug('Database health check passed', {
        status,
      });
    }
    
    return healthCheck;
  } catch (error) {
    errorLogger.error('Failed to perform health check', error, {
      component: 'DatabaseHealthMonitor',
    });
    
    return {
      status: DatabaseHealthStatus.UNHEALTHY,
      message: 'Failed to perform health check',
      metrics: {
        connectionPoolUsage: 0,
        avgQueryTime: 0,
        cacheHitRatio: 0,
        activeConnections: 0,
        idleConnections: 0,
      },
      recommendations: ['Health check service is unavailable', 'Contact system administrator'],
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Schedule periodic health checks.
 * Returns a cleanup function to stop the checks.
 * 
 * @param intervalMs Interval between health checks in milliseconds
 * @param onStatusChange Callback function called when health status changes
 * @returns Cleanup function to stop health checks
 */
export function scheduleHealthChecks(
  intervalMs: number = 60000, // 1 minute default
  onStatusChange?: (check: DatabaseHealthCheck) => void
): () => void {
  let lastStatus: DatabaseHealthStatus | null = null;
  
  const checkHealth = async () => {
    const check = await performHealthCheck();
    
    // Notify if status changed
    if (check.status !== lastStatus && onStatusChange) {
      onStatusChange(check);
    }
    
    lastStatus = check.status;
  };
  
  // Run initial check
  checkHealth();
  
  // Schedule periodic checks
  const intervalId = setInterval(checkHealth, intervalMs);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
  };
}
```

**ACCEPTANCE CRITERIA:**

1. ✅ withTransaction() executes function within BEGIN/COMMIT/ROLLBACK block
2. ✅ Automatic rollback on any error within transaction
3. ✅ Transaction timeout enforced (default 30s, configurable)
4. ✅ Deadlock errors automatically retried up to 3 times with exponential backoff
5. ✅ Transaction isolation level configurable (default READ COMMITTED)
6. ✅ Transaction ID generated and logged for debugging
7. ✅ Postgres error codes mapped to DatabaseError instances
8. ✅ User-friendly messages for constraint violations (unique, foreign key, not null, check)
9. ✅ Error classification returns category, retryability, and recovery action
10. ✅ Health check monitors connection pool, query time, cache hit ratio
11. ✅ Health status classified: HEALTHY, DEGRADED, UNHEALTHY, CRITICAL
12. ✅ Health recommendations provided based on metrics
13. ✅ Health checks can be scheduled with callback on status change
14. ✅ All database errors logged with ErrorLogger
15. ✅ Integration tests verify transaction rollback on error
16. ✅ Integration tests verify deadlock retry behavior

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
src/lib/database/
├── transaction.ts         # Transaction wrapper and retry logic
├── errors.ts              # Error classification and messages
├── health.ts              # Health monitoring integration
└── __tests__/
    ├── transaction.test.ts
    ├── errors.test.ts
    └── health.test.ts
```

**Postgres Functions Required:**
```sql
-- Run in Supabase SQL Editor
CREATE OR REPLACE FUNCTION begin_transaction(isolation_level TEXT DEFAULT 'READ COMMITTED')
RETURNS void AS $$
BEGIN
  EXECUTE format('BEGIN ISOLATION LEVEL %s', isolation_level);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION commit_transaction()
RETURNS void AS $$
BEGIN
  COMMIT;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION rollback_transaction()
RETURNS void AS $$
BEGIN
  ROLLBACK;
END;
$$ LANGUAGE plpgsql;
```

**Integration Points:**
- Uses `DatabaseError` from `train-wireframe/src/lib/errors/error-classes.ts`
- Uses `ErrorLogger` from `train-wireframe/src/lib/errors/error-logger.ts`
- Uses `withRetry` from `train-wireframe/src/lib/api/retry.ts`
- Uses existing `DatabaseHealthService` from `src/lib/services/database-health-service.ts`
- Transaction wrapper used by `ConversationService`, `BatchGenerationService`, etc.

**VALIDATION REQUIREMENTS:**

**Unit Tests:**
1. Test withTransaction() successful commit
2. Test withTransaction() automatic rollback on error
3. Test transaction timeout enforcement
4. Test transaction isolation level configuration
5. Test classifyDatabaseError() for each Postgres error code
6. Test error message generation for constraint violations
7. Test isDatabaseErrorRetryable() logic
8. Test performHealthCheck() status determination
9. Test health threshold configuration

**Integration Tests:**
```typescript
// __tests__/transaction.integration.test.ts
describe('Transaction Integration', () => {
  it('should rollback on error', async () => {
    await expect(
      withTransaction(async (ctx) => {
        await ctx.client.from('conversations').insert({ data: 'test' });
        throw new Error('Intentional failure');
      })
    ).rejects.toThrow();
    
    // Verify rollback - data should not exist
    const { data } = await supabase.from('conversations').select('*');
    expect(data).not.toContainEqual({ data: 'test' });
  });

  it('should retry deadlocks automatically', async () => {
    let attempts = 0;
    const result = await withTransactionRetry(async (ctx) => {
      attempts++;
      if (attempts < 3) {
        throw new DatabaseError('Deadlock', ErrorCode.ERR_DB_DEADLOCK);
      }
      return 'success';
    });
    
    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });
});
```

**Manual Testing:**
1. Simulate deadlock by running concurrent transactions
2. Test constraint violation with duplicate unique key
3. Test foreign key violation with invalid reference
4. Simulate network error and verify retry
5. Trigger health check and verify status determination
6. Test transaction timeout with slow query

**DELIVERABLES:**

**Required Files:**
1. `src/lib/database/transaction.ts` (400+ lines)
2. `src/lib/database/errors.ts` (300+ lines)
3. `src/lib/database/health.ts` (200+ lines)
4. `src/lib/database/__tests__/transaction.test.ts` (unit tests)
5. `src/lib/database/__tests__/errors.test.ts` (unit tests)
6. `src/lib/database/__tests__/health.test.ts` (unit tests)
7. `src/lib/database/__tests__/transaction.integration.test.ts` (integration tests)
8. SQL functions script for Supabase setup

**Documentation:**
- Add JSDoc comments to all exported functions
- Create README.md in database/ directory with usage examples
- Document transaction patterns and best practices
- Update main project README with database resilience section

**Service Updates:**
Update existing services to use transaction wrapper:
```typescript
// src/lib/services/conversation-service.ts
import { withTransaction, withTransactionRetry } from '../database/transaction';

class ConversationService {
  async createConversation(data: ConversationCreateInput) {
    return withTransaction(async (ctx) => {
      // Step 1: Insert conversation
      const { data: conversation, error: convError } = await ctx.client
        .from('conversations')
        .insert(data)
        .select()
        .single();
      
      if (convError) throw convError;
      
      // Step 2: Insert turns (atomic with step 1)
      const { error: turnsError } = await ctx.client
        .from('conversation_turns')
        .insert(
          turnsData.map(t => ({ ...t, conversation_id: conversation.id }))
        );
      
      if (turnsError) throw turnsError;
      
      return conversation;
      // Automatic rollback if any step fails
    });
  }
  
  async updateConversation(id: string, updates: Partial<Conversation>) {
    return withTransactionRetry(async (ctx) => {
      // This will retry deadlocks automatically
      const { data, error } = await ctx.client
        .from('conversations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    });
  }
}
```

Implement complete database resilience infrastructure, ensuring all acceptance criteria are met and database operations are atomic, resilient, and monitored.

++++++++++++++++++


### Prompt 5: Auto-Save & Draft Recovery

**Scope**: Auto-save hook with debounced saving, IndexedDB draft storage, recovery dialog with conflict resolution  
**Dependencies**: Prompt 1 (Error Infrastructure), Prompt 4 (Transaction wrapper)  
**Estimated Time**: 19-25 hours  
**Risk Level**: Medium

========================

You are a senior full-stack developer implementing **Auto-Save and Draft Recovery** for the Interactive LoRA Conversation Generation platform.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
Business users spend significant time creating and editing conversations. Data loss due to browser crashes, network failures, or accidental tab closes is unacceptable. The system must:
- Automatically save work in progress every 30 seconds
- Persist drafts locally even if the server is unreachable
- Recover unsaved work when the user returns
- Resolve conflicts when drafts differ from server state
- Provide clear feedback about save status

**Functional Requirements (FR10.1.2):**
- Conversation drafts must auto-save every 30 seconds (configurable)
- Auto-save must be debounced to avoid excessive writes
- Auto-save indicator must show "Saving...", "Saved", or "Failed to save"
- Failed auto-saves must retry with exponential backoff (max 3 attempts)
- Drafts must be recoverable if user closes browser
- Conflict resolution when multiple tabs edit same conversation
- Auto-saved data must not overwrite manually saved data
- User must be prompted to recover unsaved changes on page load
- IndexedDB used for client-side persistence
- Drafts expire after 24 hours
- Manual save must take priority over auto-save

**Technical Architecture:**
- React hooks for auto-save logic
- IndexedDB for local storage (with localStorage fallback)
- TypeScript with strict mode
- Integration with error infrastructure from Prompt 1
- Integration with transaction wrapper from Prompt 4
- Files in `train-wireframe/src/hooks/` and `train-wireframe/src/lib/auto-save/`

**CURRENT CODEBASE STATE:**

**Existing Hooks (Minimal):**
```typescript
// train-wireframe/src/hooks/useKeyboardShortcuts.ts - Only keyboard shortcuts exist
// No auto-save hooks implemented yet
```

**Existing Conversation Editing (No Auto-Save):**
```typescript
// train-wireframe/src/components/conversations/ConversationEditor.tsx (hypothetical)
// Currently: User edits conversation, must manually save
// Problem: Data lost if browser crashes or tab closes accidentally
function ConversationEditor({ conversation }) {
  const [editedContent, setEditedContent] = useState(conversation.content);
  
  const handleSave = async () => {
    await saveConversation(conversation.id, editedContent);
    toast.success('Saved successfully');
  };
  
  // No auto-save! User must remember to save manually.
  return (
    <div>
      <textarea value={editedContent} onChange={e => setEditedContent(e.target.value)} />
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
```

**Database State (From E10 Setup):**
```sql
-- From E10 database setup
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS draft_data JSONB,
ADD COLUMN IF NOT EXISTS draft_saved_at TIMESTAMPTZ;
```

**Gaps Prompt 5 Will Fill:**
1. No auto-save hook for React components
2. No debounced save logic
3. No IndexedDB storage for drafts
4. No draft recovery system
5. No conflict resolution
6. No recovery dialog UI
7. No save status indicator component

**IMPLEMENTATION TASKS:**

**Task T-5.1.1: Auto-Save Hook with Debouncing**

Create `train-wireframe/src/hooks/useAutoSave.ts`:

```typescript
import { useEffect, useRef, useState, useCallback } from 'react';
import { errorLogger } from '../lib/errors/error-logger';
import { AppError, ErrorCode } from '../lib/errors';
import { withRetry } from '../lib/api/retry';

// Save status type
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// Auto-save configuration
export interface AutoSaveConfig {
  /**
   * Interval between auto-saves in milliseconds
   * @default 30000 (30 seconds)
   */
  interval?: number;
  
  /**
   * Debounce delay after user stops typing in milliseconds
   * @default 2000 (2 seconds)
   */
  debounceDelay?: number;
  
  /**
   * Maximum retry attempts for failed saves
   * @default 3
   */
  maxRetries?: number;
  
  /**
   * Whether to enable auto-save
   * @default true
   */
  enabled?: boolean;
  
  /**
   * Save immediately on unmount (cleanup)
   * @default true
   */
  saveOnUnmount?: boolean;
}

// Default configuration
const DEFAULT_CONFIG: Required<AutoSaveConfig> = {
  interval: 30000, // 30 seconds
  debounceDelay: 2000, // 2 seconds
  maxRetries: 3,
  enabled: true,
  saveOnUnmount: true,
};

// Auto-save hook return type
export interface UseAutoSaveReturn<T> {
  /** Current save status */
  status: SaveStatus;
  
  /** Last successful save timestamp */
  lastSaved: Date | null;
  
  /** Error from last failed save */
  error: Error | null;
  
  /** Manually trigger save */
  saveDraft: () => Promise<void>;
  
  /** Clear the draft */
  clearDraft: () => Promise<void>;
  
  /** Reset error state */
  resetError: () => void;
}

/**
 * Custom React hook for automatic draft saving with debouncing and retry logic.
 * 
 * Features:
 * - Automatic saving at configurable intervals
 * - Debouncing to avoid saving while user is actively typing
 * - Retry logic with exponential backoff for failed saves
 * - Manual save trigger
 * - Save on component unmount
 * - Status tracking (idle, saving, saved, error)
 * 
 * @param data The data to auto-save
 * @param onSave Async function to save the data (returns void or throws error)
 * @param config Auto-save configuration options
 * @returns Save status, controls, and metadata
 * 
 * @example
 * function ConversationEditor({ conversation }) {
 *   const [content, setContent] = useState(conversation.content);
 *   
 *   const { status, lastSaved, saveDraft } = useAutoSave(
 *     { conversationId: conversation.id, content },
 *     async (data) => {
 *       await saveDraftToServer(data.conversationId, data.content);
 *     },
 *     { interval: 30000, debounceDelay: 2000 }
 *   );
 *   
 *   return (
 *     <div>
 *       <textarea value={content} onChange={e => setContent(e.target.value)} />
 *       <SaveStatusIndicator status={status} lastSaved={lastSaved} />
 *       <button onClick={saveDraft}>Save Now</button>
 *     </div>
 *   );
 * }
 */
export function useAutoSave<T>(
  data: T,
  onSave: (data: T) => Promise<void>,
  config: AutoSaveConfig = {}
): UseAutoSaveReturn<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  // Refs to track state without causing re-renders
  const dataRef = useRef<T>(data);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const hasChangesRef = useRef(false);
  
  // Update data ref when data changes
  useEffect(() => {
    dataRef.current = data;
    hasChangesRef.current = true; // Mark as changed
  }, [data]);
  
  /**
   * Perform the save operation with retry logic.
   */
  const performSave = useCallback(async () => {
    if (isSavingRef.current || !hasChangesRef.current) {
      return; // Skip if already saving or no changes
    }
    
    isSavingRef.current = true;
    setStatus('saving');
    setError(null);
    
    try {
      // Use retry logic from Prompt 2
      await withRetry(
        () => onSave(dataRef.current),
        {
          maxAttempts: finalConfig.maxRetries,
          initialDelay: 1000,
          backoffFactor: 2,
          maxDelay: 8000,
        },
        { component: 'AutoSave' }
      );
      
      setStatus('saved');
      setLastSaved(new Date());
      hasChangesRef.current = false; // Clear change flag
      
      errorLogger.debug('Auto-save successful', {
        component: 'useAutoSave',
        dataSize: JSON.stringify(dataRef.current).length,
      });
    } catch (err) {
      const saveError = err instanceof Error ? err : new Error('Auto-save failed');
      
      setStatus('error');
      setError(saveError);
      
      errorLogger.error('Auto-save failed', saveError, {
        component: 'useAutoSave',
        retries: finalConfig.maxRetries,
      });
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave, finalConfig.maxRetries]);
  
  /**
   * Debounced save: Wait for user to stop typing before saving.
   */
  const debouncedSave = useCallback(() => {
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      performSave();
    }, finalConfig.debounceDelay);
  }, [performSave, finalConfig.debounceDelay]);
  
  /**
   * Manual save trigger.
   */
  const saveDraft = useCallback(async () => {
    // Cancel any pending debounced save
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    await performSave();
  }, [performSave]);
  
  /**
   * Clear the draft.
   */
  const clearDraft = useCallback(async () => {
    hasChangesRef.current = false;
    setStatus('idle');
    setError(null);
    setLastSaved(null);
  }, []);
  
  /**
   * Reset error state.
   */
  const resetError = useCallback(() => {
    setError(null);
    if (status === 'error') {
      setStatus('idle');
    }
  }, [status]);
  
  // Set up interval-based auto-save
  useEffect(() => {
    if (!finalConfig.enabled) {
      return;
    }
    
    intervalTimerRef.current = setInterval(() => {
      if (hasChangesRef.current && !isSavingRef.current) {
        performSave();
      }
    }, finalConfig.interval);
    
    return () => {
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
      }
    };
  }, [finalConfig.enabled, finalConfig.interval, performSave]);
  
  // Trigger debounced save when data changes
  useEffect(() => {
    if (!finalConfig.enabled) {
      return;
    }
    
    debouncedSave();
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [data, finalConfig.enabled, debouncedSave]);
  
  // Save on unmount if enabled
  useEffect(() => {
    return () => {
      if (finalConfig.saveOnUnmount && hasChangesRef.current) {
        // Synchronous save on unmount (best effort)
        onSave(dataRef.current).catch(err => {
          errorLogger.error('Failed to save on unmount', err);
        });
      }
    };
  }, [finalConfig.saveOnUnmount, onSave]);
  
  return {
    status,
    lastSaved,
    error,
    saveDraft,
    clearDraft,
    resetError,
  };
}
```

**Task T-5.1.2: Draft Storage with IndexedDB**

Create `train-wireframe/src/lib/auto-save/storage.ts`:

```typescript
import { errorLogger } from '../errors/error-logger';

// Draft data interface
export interface Draft<T = any> {
  id: string;
  data: T;
  savedAt: string;
  expiresAt: string;
  version: number;
}

// Storage interface (abstraction for IndexedDB and localStorage)
interface DraftStorage {
  save<T>(id: string, data: T, expiresInHours?: number): Promise<void>;
  load<T>(id: string): Promise<Draft<T> | null>;
  delete(id: string): Promise<void>;
  list(): Promise<Draft[]>;
  clear(): Promise<void>;
  cleanup(): Promise<void>;
}

/**
 * IndexedDB-based draft storage.
 * Uses IndexedDB for modern browsers with localStorage fallback.
 */
class IndexedDBDraftStorage implements DraftStorage {
  private dbName = 'TrainingDataDrafts';
  private storeName = 'drafts';
  private version = 1;
  private db: IDBDatabase | null = null;
  
  /**
   * Initialize IndexedDB connection.
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => {
        errorLogger.error('Failed to open IndexedDB', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
          objectStore.createIndex('expiresAt', 'expiresAt', { unique: false });
          objectStore.createIndex('savedAt', 'savedAt', { unique: false });
        }
      };
    });
  }
  
  /**
   * Save a draft to IndexedDB.
   */
  async save<T>(id: string, data: T, expiresInHours: number = 24): Promise<void> {
    try {
      const db = await this.initDB();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);
      
      const draft: Draft<T> = {
        id,
        data,
        savedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        version: 1,
      };
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const objectStore = transaction.objectStore(this.storeName);
        const request = objectStore.put(draft);
        
        request.onsuccess = () => {
          errorLogger.debug('Draft saved to IndexedDB', { id, size: JSON.stringify(data).length });
          resolve();
        };
        
        request.onerror = () => {
          errorLogger.error('Failed to save draft to IndexedDB', request.error, { id });
          reject(request.error);
        };
      });
    } catch (error) {
      errorLogger.error('IndexedDB save error', error, { id });
      throw error;
    }
  }
  
  /**
   * Load a draft from IndexedDB.
   */
  async load<T>(id: string): Promise<Draft<T> | null> {
    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const objectStore = transaction.objectStore(this.storeName);
        const request = objectStore.get(id);
        
        request.onsuccess = () => {
          const draft = request.result as Draft<T> | undefined;
          
          if (!draft) {
            resolve(null);
            return;
          }
          
          // Check if expired
          if (new Date(draft.expiresAt) < new Date()) {
            errorLogger.debug('Draft expired, deleting', { id });
            this.delete(id); // Async delete, don't wait
            resolve(null);
            return;
          }
          
          errorLogger.debug('Draft loaded from IndexedDB', { id });
          resolve(draft);
        };
        
        request.onerror = () => {
          errorLogger.error('Failed to load draft from IndexedDB', request.error, { id });
          reject(request.error);
        };
      });
    } catch (error) {
      errorLogger.error('IndexedDB load error', error, { id });
      return null;
    }
  }
  
  /**
   * Delete a draft from IndexedDB.
   */
  async delete(id: string): Promise<void> {
    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const objectStore = transaction.objectStore(this.storeName);
        const request = objectStore.delete(id);
        
        request.onsuccess = () => {
          errorLogger.debug('Draft deleted from IndexedDB', { id });
          resolve();
        };
        
        request.onerror = () => {
          errorLogger.error('Failed to delete draft from IndexedDB', request.error, { id });
          reject(request.error);
        };
      });
    } catch (error) {
      errorLogger.error('IndexedDB delete error', error, { id });
      throw error;
    }
  }
  
  /**
   * List all drafts in IndexedDB.
   */
  async list(): Promise<Draft[]> {
    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const objectStore = transaction.objectStore(this.storeName);
        const request = objectStore.getAll();
        
        request.onsuccess = () => {
          const drafts = request.result as Draft[];
          const now = new Date();
          
          // Filter out expired drafts
          const validDrafts = drafts.filter(draft => new Date(draft.expiresAt) >= now);
          
          errorLogger.debug('Drafts listed from IndexedDB', { count: validDrafts.length });
          resolve(validDrafts);
        };
        
        request.onerror = () => {
          errorLogger.error('Failed to list drafts from IndexedDB', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      errorLogger.error('IndexedDB list error', error);
      return [];
    }
  }
  
  /**
   * Clear all drafts from IndexedDB.
   */
  async clear(): Promise<void> {
    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const objectStore = transaction.objectStore(this.storeName);
        const request = objectStore.clear();
        
        request.onsuccess = () => {
          errorLogger.info('All drafts cleared from IndexedDB');
          resolve();
        };
        
        request.onerror = () => {
          errorLogger.error('Failed to clear drafts from IndexedDB', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      errorLogger.error('IndexedDB clear error', error);
      throw error;
    }
  }
  
  /**
   * Clean up expired drafts.
   */
  async cleanup(): Promise<void> {
    try {
      const db = await this.initDB();
      const now = new Date().toISOString();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const objectStore = transaction.objectStore(this.storeName);
        const index = objectStore.index('expiresAt');
        const request = index.openCursor(IDBKeyRange.upperBound(now));
        
        let deletedCount = 0;
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          
          if (cursor) {
            cursor.delete();
            deletedCount++;
            cursor.continue();
          } else {
            errorLogger.info('Expired drafts cleaned up', { deletedCount });
            resolve();
          }
        };
        
        request.onerror = () => {
          errorLogger.error('Failed to cleanup expired drafts', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      errorLogger.error('IndexedDB cleanup error', error);
      throw error;
    }
  }
}

/**
 * LocalStorage-based draft storage (fallback for browsers without IndexedDB).
 */
class LocalStorageDraftStorage implements DraftStorage {
  private prefix = 'draft_';
  
  async save<T>(id: string, data: T, expiresInHours: number = 24): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);
    
    const draft: Draft<T> = {
      id,
      data,
      savedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      version: 1,
    };
    
    try {
      localStorage.setItem(this.prefix + id, JSON.stringify(draft));
      errorLogger.debug('Draft saved to localStorage', { id });
    } catch (error) {
      errorLogger.error('Failed to save draft to localStorage', error, { id });
      throw error;
    }
  }
  
  async load<T>(id: string): Promise<Draft<T> | null> {
    try {
      const item = localStorage.getItem(this.prefix + id);
      
      if (!item) {
        return null;
      }
      
      const draft = JSON.parse(item) as Draft<T>;
      
      // Check if expired
      if (new Date(draft.expiresAt) < new Date()) {
        this.delete(id);
        return null;
      }
      
      errorLogger.debug('Draft loaded from localStorage', { id });
      return draft;
    } catch (error) {
      errorLogger.error('Failed to load draft from localStorage', error, { id });
      return null;
    }
  }
  
  async delete(id: string): Promise<void> {
    try {
      localStorage.removeItem(this.prefix + id);
      errorLogger.debug('Draft deleted from localStorage', { id });
    } catch (error) {
      errorLogger.error('Failed to delete draft from localStorage', error, { id });
    }
  }
  
  async list(): Promise<Draft[]> {
    const drafts: Draft[] = [];
    const now = new Date();
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith(this.prefix)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const draft = JSON.parse(item) as Draft;
            
            // Filter out expired
            if (new Date(draft.expiresAt) >= now) {
              drafts.push(draft);
            } else {
              localStorage.removeItem(key); // Clean up expired
            }
          }
        } catch (error) {
          errorLogger.error('Failed to parse draft from localStorage', error, { key });
        }
      }
    }
    
    return drafts;
  }
  
  async clear(): Promise<void> {
    const keys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key);
      }
    }
    
    keys.forEach(key => localStorage.removeItem(key));
    errorLogger.info('All drafts cleared from localStorage');
  }
  
  async cleanup(): Promise<void> {
    const now = new Date();
    let deletedCount = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith(this.prefix)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const draft = JSON.parse(item) as Draft;
            
            if (new Date(draft.expiresAt) < now) {
              localStorage.removeItem(key);
              deletedCount++;
            }
          }
        } catch (error) {
          errorLogger.error('Failed to cleanup draft from localStorage', error, { key });
        }
      }
    }
    
    errorLogger.info('Expired drafts cleaned up from localStorage', { deletedCount });
  }
}

/**
 * Create the appropriate draft storage based on browser capabilities.
 */
function createDraftStorage(): DraftStorage {
  if (typeof window === 'undefined') {
    // Server-side: return no-op storage
    return {
      save: async () => {},
      load: async () => null,
      delete: async () => {},
      list: async () => [],
      clear: async () => {},
      cleanup: async () => {},
    };
  }
  
  // Check for IndexedDB support
  if ('indexedDB' in window) {
    return new IndexedDBDraftStorage();
  }
  
  // Fallback to localStorage
  return new LocalStorageDraftStorage();
}

// Export singleton instance
export const draftStorage = createDraftStorage();

// Schedule periodic cleanup (every hour)
if (typeof window !== 'undefined') {
  setInterval(() => {
    draftStorage.cleanup();
  }, 60 * 60 * 1000); // 1 hour
}
```

**Task T-5.1.3: Draft Recovery System**

Create `train-wireframe/src/lib/auto-save/recovery.ts`:

```typescript
import { draftStorage, Draft } from './storage';
import { errorLogger } from '../errors/error-logger';

// Recovery item interface
export interface RecoveryItem<T = any> {
  id: string;
  data: T;
  savedAt: Date;
  type: 'conversation' | 'batch' | 'template' | 'other';
  description: string;
}

// Conflict resolution strategy
export enum ConflictResolution {
  USE_DRAFT = 'USE_DRAFT',       // Use the draft data
  USE_SERVER = 'USE_SERVER',     // Use the server data
  MERGE = 'MERGE',                // Attempt to merge (not implemented in v1)
  ASK_USER = 'ASK_USER',          // Prompt user to choose
}

// Conflict information
export interface Conflict<T = any> {
  draftData: T;
  serverData: T;
  draftSavedAt: Date;
  serverUpdatedAt: Date;
}

/**
 * Check for recoverable drafts on page load.
 * Returns drafts that are newer than their server versions.
 * 
 * @returns Array of recovery items
 */
export async function checkForRecoverableDrafts(): Promise<RecoveryItem[]> {
  try {
    const drafts = await draftStorage.list();
    const recoveryItems: RecoveryItem[] = [];
    
    for (const draft of drafts) {
      // Parse draft ID to determine type
      const type = parseDraftType(draft.id);
      
      recoveryItems.push({
        id: draft.id,
        data: draft.data,
        savedAt: new Date(draft.savedAt),
        type,
        description: generateDescription(type, draft.data),
      });
    }
    
    errorLogger.info('Found recoverable drafts', { count: recoveryItems.length });
    return recoveryItems;
  } catch (error) {
    errorLogger.error('Failed to check for recoverable drafts', error);
    return [];
  }
}

/**
 * Parse draft type from ID.
 * Convention: {type}_{id} (e.g., "conversation_abc123", "batch_xyz789")
 */
function parseDraftType(draftId: string): RecoveryItem['type'] {
  if (draftId.startsWith('conversation_')) return 'conversation';
  if (draftId.startsWith('batch_')) return 'batch';
  if (draftId.startsWith('template_')) return 'template';
  return 'other';
}

/**
 * Generate human-readable description for recovery item.
 */
function generateDescription(type: RecoveryItem['type'], data: any): string {
  switch (type) {
    case 'conversation':
      return `Conversation: ${data.persona || 'Unknown'} (${data.turnCount || 0} turns)`;
    case 'batch':
      return `Batch Job: ${data.totalItems || 0} items (${data.completedItems || 0} completed)`;
    case 'template':
      return `Template: ${data.name || 'Untitled'}`;
    default:
      return 'Unsaved changes';
  }
}

/**
 * Detect conflicts between draft and server data.
 * A conflict exists if both draft and server have been updated, and server is newer.
 * 
 * @param draftId Draft identifier
 * @param serverData Current server data
 * @param serverUpdatedAt Server data last update timestamp
 * @returns Conflict information if conflict exists, null otherwise
 */
export async function detectConflict<T>(
  draftId: string,
  serverData: T | null,
  serverUpdatedAt: Date | null
): Promise<Conflict<T> | null> {
  try {
    const draft = await draftStorage.load<T>(draftId);
    
    if (!draft) {
      return null; // No draft, no conflict
    }
    
    if (!serverData || !serverUpdatedAt) {
      return null; // No server data, no conflict (draft can be used)
    }
    
    const draftSavedAt = new Date(draft.savedAt);
    
    // Conflict exists if server was updated after draft was saved
    if (serverUpdatedAt > draftSavedAt) {
      errorLogger.warn('Conflict detected', {
        draftId,
        draftSavedAt: draftSavedAt.toISOString(),
        serverUpdatedAt: serverUpdatedAt.toISOString(),
      });
      
      return {
        draftData: draft.data,
        serverData,
        draftSavedAt,
        serverUpdatedAt,
      };
    }
    
    return null; // Draft is newer, no conflict
  } catch (error) {
    errorLogger.error('Failed to detect conflict', error, { draftId });
    return null;
  }
}

/**
 * Resolve a conflict using the specified strategy.
 * 
 * @param conflict Conflict to resolve
 * @param strategy Resolution strategy
 * @returns Resolved data
 */
export function resolveConflict<T>(
  conflict: Conflict<T>,
  strategy: ConflictResolution
): T {
  switch (strategy) {
    case ConflictResolution.USE_DRAFT:
      errorLogger.info('Conflict resolved: using draft');
      return conflict.draftData;
    
    case ConflictResolution.USE_SERVER:
      errorLogger.info('Conflict resolved: using server data');
      return conflict.serverData;
    
    case ConflictResolution.MERGE:
      // TODO: Implement merge strategy (v2)
      errorLogger.warn('Merge strategy not implemented, using draft');
      return conflict.draftData;
    
    case ConflictResolution.ASK_USER:
      // Should be handled by UI, default to draft for safety
      errorLogger.warn('User resolution required, defaulting to draft');
      return conflict.draftData;
    
    default:
      errorLogger.error('Unknown conflict resolution strategy', { strategy });
      return conflict.draftData;
  }
}

/**
 * Recover a draft by its ID.
 * 
 * @param draftId Draft identifier
 * @returns Draft data or null if not found
 */
export async function recoverDraft<T>(draftId: string): Promise<T | null> {
  try {
    const draft = await draftStorage.load<T>(draftId);
    
    if (!draft) {
      return null;
    }
    
    errorLogger.info('Draft recovered', { draftId });
    return draft.data;
  } catch (error) {
    errorLogger.error('Failed to recover draft', error, { draftId });
    return null;
  }
}

/**
 * Discard a draft by its ID.
 * 
 * @param draftId Draft identifier
 */
export async function discardDraft(draftId: string): Promise<void> {
  try {
    await draftStorage.delete(draftId);
    errorLogger.info('Draft discarded', { draftId });
  } catch (error) {
    errorLogger.error('Failed to discard draft', error, { draftId });
    throw error;
  }
}

/**
 * Save draft with standard format.
 * 
 * @param type Draft type
 * @param id Entity ID
 * @param data Data to save
 */
export async function saveDraft<T>(
  type: RecoveryItem['type'],
  id: string,
  data: T
): Promise<void> {
  const draftId = `${type}_${id}`;
  await draftStorage.save(draftId, data);
}

/**
 * Load draft with standard format.
 * 
 * @param type Draft type
 * @param id Entity ID
 * @returns Draft data or null
 */
export async function loadDraft<T>(
  type: RecoveryItem['type'],
  id: string
): Promise<T | null> {
  const draftId = `${type}_${id}`;
  return recoverDraft<T>(draftId);
}
```

**Task T-5.1.4: Recovery Dialog Component**

Create `train-wireframe/src/components/auto-save/RecoveryDialog.tsx`:

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import {
  checkForRecoverableDrafts,
  recoverDraft,
  discardDraft,
  RecoveryItem,
  detectConflict,
  resolveConflict,
  ConflictResolution,
  Conflict,
} from '../../lib/auto-save/recovery';
import { errorLogger } from '../../lib/errors/error-logger';
import { toast } from 'sonner';

interface RecoveryDialogProps {
  /** Callback when recovery is complete */
  onRecover?: (item: RecoveryItem, data: any) => void;
  
  /** Callback when draft is discarded */
  onDiscard?: (item: RecoveryItem) => void;
  
  /** Function to fetch server data for conflict detection */
  getServerData?: (itemId: string, type: RecoveryItem['type']) => Promise<{
    data: any;
    updatedAt: Date;
  } | null>;
}

export function RecoveryDialog({
  onRecover,
  onDiscard,
  getServerData,
}: RecoveryDialogProps) {
  const [open, setOpen] = useState(false);
  const [recoveryItems, setRecoveryItems] = useState<RecoveryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<RecoveryItem | null>(null);
  const [conflict, setConflict] = useState<Conflict | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  
  // Check for recoverable drafts on mount
  useEffect(() => {
    const checkDrafts = async () => {
      const items = await checkForRecoverableDrafts();
      
      if (items.length > 0) {
        setRecoveryItems(items);
        setOpen(true);
      }
    };
    
    checkDrafts();
  }, []);
  
  const handleRecover = async (item: RecoveryItem) => {
    setIsRecovering(true);
    setSelectedItem(item);
    
    try {
      // Check for conflicts if getServerData is provided
      if (getServerData) {
        const serverInfo = await getServerData(item.id, item.type);
        
        if (serverInfo) {
          const detectedConflict = await detectConflict(
            item.id,
            serverInfo.data,
            serverInfo.updatedAt
          );
          
          if (detectedConflict) {
            // Show conflict resolution UI
            setConflict(detectedConflict);
            setIsRecovering(false);
            return;
          }
        }
      }
      
      // No conflict or no server check, proceed with recovery
      const data = await recoverDraft(item.id);
      
      if (data) {
        onRecover?.(item, data);
        
        // Remove from list
        setRecoveryItems(prev => prev.filter(i => i.id !== item.id));
        
        toast.success('Draft recovered successfully', {
          description: item.description,
        });
        
        // Close dialog if no more items
        if (recoveryItems.length === 1) {
          setOpen(false);
        }
      } else {
        toast.error('Failed to recover draft');
      }
    } catch (error) {
      errorLogger.error('Failed to recover draft', error, { itemId: item.id });
      toast.error('Failed to recover draft. Please try again.');
    } finally {
      setIsRecovering(false);
      setSelectedItem(null);
    }
  };
  
  const handleDiscard = async (item: RecoveryItem) => {
    try {
      await discardDraft(item.id);
      onDiscard?.(item);
      
      // Remove from list
      setRecoveryItems(prev => prev.filter(i => i.id !== item.id));
      
      toast.success('Draft discarded');
      
      // Close dialog if no more items
      if (recoveryItems.length === 1) {
        setOpen(false);
      }
    } catch (error) {
      errorLogger.error('Failed to discard draft', error, { itemId: item.id });
      toast.error('Failed to discard draft');
    }
  };
  
  const handleResolveConflict = async (strategy: ConflictResolution) => {
    if (!conflict || !selectedItem) return;
    
    try {
      const resolved = resolveConflict(conflict, strategy);
      onRecover?.(selectedItem, resolved);
      
      setRecoveryItems(prev => prev.filter(i => i.id !== selectedItem.id));
      setConflict(null);
      setSelectedItem(null);
      
      toast.success('Conflict resolved', {
        description: `Using ${strategy === ConflictResolution.USE_DRAFT ? 'draft' : 'server'} data`,
      });
      
      if (recoveryItems.length === 1) {
        setOpen(false);
      }
    } catch (error) {
      errorLogger.error('Failed to resolve conflict', error);
      toast.error('Failed to resolve conflict');
    }
  };
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Unsaved Changes Detected
          </DialogTitle>
          <DialogDescription>
            We found {recoveryItems.length} draft{recoveryItems.length > 1 ? 's' : ''} with unsaved changes.
            Would you like to recover your work?
          </DialogDescription>
        </DialogHeader>
        
        {conflict && selectedItem ? (
          // Conflict resolution UI
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This draft conflicts with newer data on the server. Choose which version to keep:
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">Your Draft</h4>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Saved {formatTime(conflict.draftSavedAt)}
                  </p>
                  <Button
                    onClick={() => handleResolveConflict(ConflictResolution.USE_DRAFT)}
                    className="w-full"
                  >
                    Use Draft
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">Server Version</h4>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Updated {formatTime(conflict.serverUpdatedAt)}
                  </p>
                  <Button
                    onClick={() => handleResolveConflict(ConflictResolution.USE_SERVER)}
                    variant="outline"
                    className="w-full"
                  >
                    Use Server
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setConflict(null);
                  setSelectedItem(null);
                }}
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // Recovery items list
          <div className="space-y-3">
            {recoveryItems.map((item) => (
              <Card key={item.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium">{item.description}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Saved {formatTime(item.savedAt)}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleRecover(item)}
                        disabled={isRecovering && selectedItem?.id === item.id}
                        size="sm"
                      >
                        {isRecovering && selectedItem?.id === item.id ? 'Recovering...' : 'Recover'}
                      </Button>
                      <Button
                        onClick={() => handleDiscard(item)}
                        variant="ghost"
                        size="sm"
                      >
                        Discard
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {!conflict && (
          <DialogFooter className="border-t pt-4">
            <Button
              onClick={() => {
                // Discard all
                Promise.all(recoveryItems.map(item => handleDiscard(item)));
                setOpen(false);
              }}
              variant="ghost"
            >
              Discard All
            </Button>
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
            >
              Decide Later
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

**Task T-5.1.5: Save Status Indicator Component**

Create `train-wireframe/src/components/auto-save/SaveStatusIndicator.tsx`:

```typescript
'use client';

import React from 'react';
import { SaveStatus } from '../../hooks/useAutoSave';
import { CheckCircle, Loader2, AlertCircle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  lastSaved: Date | null;
  error?: Error | null;
  className?: string;
}

export function SaveStatusIndicator({
  status,
  lastSaved,
  error,
  className,
}: SaveStatusIndicatorProps) {
  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      {status === 'idle' && (
        <>
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {lastSaved ? `Saved ${formatLastSaved(lastSaved)}` : 'Not saved'}
          </span>
        </>
      )}
      
      {status === 'saving' && (
        <>
          <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          <span className="text-blue-500">Saving...</span>
        </>
      )}
      
      {status === 'saved' && (
        <>
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-green-500">
            Saved {lastSaved && formatLastSaved(lastSaved)}
          </span>
        </>
      )}
      
      {status === 'error' && (
        <>
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-destructive" title={error?.message}>
            Failed to save
          </span>
        </>
      )}
    </div>
  );
}
```

**ACCEPTANCE CRITERIA:**

1. ✅ useAutoSave() hook tracks data changes and auto-saves every 30s (configurable)
2. ✅ Debouncing delays save for 2s after user stops typing (configurable)
3. ✅ Save status tracked: idle, saving, saved, error
4. ✅ Failed saves retry up to 3 times with exponential backoff
5. ✅ Manual save trigger (saveDraft()) available
6. ✅ Save on component unmount (configurable)
7. ✅ IndexedDB used for modern browsers with localStorage fallback
8. ✅ Drafts expire after 24 hours (configurable)
9. ✅ Automatic cleanup of expired drafts (hourly)
10. ✅ Recovery dialog displays on page load if drafts exist
11. ✅ Conflict detection compares draft vs server timestamps
12. ✅ Conflict resolution UI allows choosing draft or server data
13. ✅ Save status indicator shows visual feedback
14. ✅ All save operations logged with ErrorLogger
15. ✅ Integration with withRetry for save retries
16. ✅ Draft ID format: {type}_{id} for easy categorization

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
train-wireframe/src/
├── hooks/
│   ├── useAutoSave.ts              # Auto-save hook
│   └── __tests__/
│       └── useAutoSave.test.ts
├── lib/auto-save/
│   ├── storage.ts                  # IndexedDB/localStorage wrapper
│   ├── recovery.ts                 # Recovery and conflict resolution
│   └── __tests__/
│       ├── storage.test.ts
│       └── recovery.test.ts
└── components/auto-save/
    ├── RecoveryDialog.tsx          # Recovery UI
    ├── SaveStatusIndicator.tsx     # Status indicator
    └── __tests__/
        ├── RecoveryDialog.test.tsx
        └── SaveStatusIndicator.test.tsx
```

**IndexedDB Schema:**
```
Database: TrainingDataDrafts
ObjectStore: drafts
  - keyPath: id
  - indexes:
    - expiresAt (for cleanup queries)
    - savedAt (for sorting)
  
Draft object:
  {
    id: string,
    data: any,
    savedAt: string (ISO),
    expiresAt: string (ISO),
    version: number
  }
```

**Integration Points:**
- Uses `AppError` and `ErrorLogger` from Prompt 1
- Uses `withRetry` from Prompt 2 for save retries
- Integrates with any form/editor component
- RecoveryDialog mounts in app layout for global recovery

**Usage Example:**
```typescript
// In ConversationEditor.tsx
function ConversationEditor({ conversation }) {
  const [content, setContent] = useState(conversation.content);
  const [persona, setPersona] = useState(conversation.persona);
  
  const { status, lastSaved, saveDraft } = useAutoSave(
    { conversationId: conversation.id, content, persona },
    async (data) => {
      await saveDraft('conversation', data.conversationId, {
        content: data.content,
        persona: data.persona,
      });
    },
    { interval: 30000, debounceDelay: 2000 }
  );
  
  return (
    <div>
      <SaveStatusIndicator status={status} lastSaved={lastSaved} />
      <textarea value={content} onChange={e => setContent(e.target.value)} />
      <button onClick={saveDraft}>Save Now</button>
    </div>
  );
}

// In app layout
function AppLayout({ children }) {
  return (
    <>
      <RecoveryDialog
        onRecover={(item, data) => {
          // Navigate to recovered item and load data
          router.push(`/${item.type}s/${extractId(item.id)}`);
        }}
      />
      {children}
    </>
  );
}
```

**VALIDATION REQUIREMENTS:**

**Unit Tests:**
1. Test useAutoSave() debouncing behavior
2. Test auto-save interval triggering
3. Test manual save trigger
4. Test save status transitions
5. Test retry logic on save failure
6. Test IndexedDB save/load/delete operations
7. Test localStorage fallback
8. Test expired draft cleanup
9. Test conflict detection logic
10. Test conflict resolution strategies

**Integration Tests:**
```typescript
// __tests__/auto-save.integration.test.ts
describe('Auto-Save Integration', () => {
  it('should save draft after debounce delay', async () => {
    const { result } = renderHook(() => 
      useAutoSave(
        { content: 'test' },
        mockSave,
        { debounceDelay: 1000 }
      )
    );
    
    // Wait for debounce
    await waitFor(() => {
      expect(mockSave).toHaveBeenCalled();
    }, { timeout: 2000 });
    
    expect(result.current.status).toBe('saved');
  });

  it('should recover draft on page load', async () => {
    // Save draft
    await draftStorage.save('conversation_123', { content: 'draft' });
    
    // Simulate page load
    const items = await checkForRecoverableDrafts();
    
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('conversation_123');
  });

  it('should detect and resolve conflicts', async () => {
    const draftData = { content: 'draft', version: 1 };
    const serverData = { content: 'server', version: 2 };
    
    await draftStorage.save('conversation_123', draftData);
    
    const conflict = await detectConflict(
      'conversation_123',
      serverData,
      new Date()
    );
    
    expect(conflict).toBeTruthy();
    
    const resolved = resolveConflict(conflict!, ConflictResolution.USE_SERVER);
    expect(resolved).toEqual(serverData);
  });
});
```

**Manual Testing:**
1. Edit conversation, wait 2s, verify save triggered
2. Edit conversation, wait 30s, verify interval save
3. Close browser, reopen, verify recovery dialog
4. Edit in multiple tabs, verify conflict detection
5. Disconnect network, verify save retry
6. Clear IndexedDB, verify localStorage fallback
7. Wait 24+ hours, verify draft expired
8. Manually save, verify auto-save doesn't overwrite

**DELIVERABLES:**

**Required Files:**
1. `train-wireframe/src/hooks/useAutoSave.ts` (250+ lines)
2. `train-wireframe/src/lib/auto-save/storage.ts` (400+ lines)
3. `train-wireframe/src/lib/auto-save/recovery.ts` (250+ lines)
4. `train-wireframe/src/components/auto-save/RecoveryDialog.tsx` (300+ lines)
5. `train-wireframe/src/components/auto-save/SaveStatusIndicator.tsx` (100+ lines)
6. Unit tests for all modules
7. Integration tests for auto-save flow

**Component Integration:**
Update conversation editor to use auto-save:
```typescript
// train-wireframe/src/components/conversations/ConversationEditor.tsx
import { useAutoSave } from '@/hooks/useAutoSave';
import { SaveStatusIndicator } from '@/components/auto-save/SaveStatusIndicator';
import { saveDraft as saveDraftToStorage } from '@/lib/auto-save/recovery';

function ConversationEditor({ conversation, onSave }) {
  const [content, setContent] = useState(conversation.content);
  const [turns, setTurns] = useState(conversation.turns);
  
  const { status, lastSaved, saveDraft, error } = useAutoSave(
    {
      conversationId: conversation.id,
      content,
      turns,
      updatedAt: new Date().toISOString(),
    },
    async (data) => {
      // Save to IndexedDB
      await saveDraftToStorage('conversation', data.conversationId, {
        content: data.content,
        turns: data.turns,
        updatedAt: data.updatedAt,
      });
      
      // Optionally save to server (best effort)
      try {
        await onSave(data);
      } catch (err) {
        // Don't fail if server save fails, draft is in IndexedDB
        console.warn('Server save failed, draft saved locally', err);
      }
    },
    {
      interval: 30000,      // Auto-save every 30 seconds
      debounceDelay: 2000,  // Wait 2s after typing stops
      enabled: true,
      saveOnUnmount: true,
    }
  );
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2>Edit Conversation</h2>
        <div className="flex items-center gap-4">
          <SaveStatusIndicator
            status={status}
            lastSaved={lastSaved}
            error={error}
          />
          <Button onClick={saveDraft} size="sm">
            Save Now
          </Button>
        </div>
      </div>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full min-h-[200px]"
        placeholder="Conversation content..."
      />
      
      {/* Turns editor... */}
    </div>
  );
}
```

Implement complete auto-save and draft recovery system, ensuring all acceptance criteria are met and users never lose work due to crashes or network issues.

++++++++++++++++++


---

## Quality Validation Checklist

### Post-Implementation Verification (Prompts 4-5)

**Database Resilience (Prompt 4):**
- [ ] withTransaction() successfully commits multi-step operations
- [ ] Automatic rollback verified with intentional errors
- [ ] Transaction timeout enforced (tested with slow queries)
- [ ] Deadlock retry tested with concurrent transactions
- [ ] All Postgres error codes mapped correctly
- [ ] User-friendly messages displayed for constraint violations
- [ ] Health check reports correct status (HEALTHY, DEGRADED, etc.)
- [ ] Health recommendations generated based on metrics
- [ ] Services updated to use transaction wrapper
- [ ] SQL functions created in Supabase

**Auto-Save & Recovery (Prompt 5):**
- [ ] Auto-save triggers after debounce delay (2s)
- [ ] Interval-based save works (30s)
- [ ] Save status indicator shows correct states
- [ ] Manual save trigger works immediately
- [ ] IndexedDB storage persists across browser sessions
- [ ] LocalStorage fallback works when IndexedDB unavailable
- [ ] Recovery dialog displays on page load with drafts
- [ ] Conflict detection identifies newer server data
- [ ] Conflict resolution UI allows choosing version
- [ ] Expired drafts cleaned up automatically
- [ ] Draft IDs follow standard format
- [ ] Save failures retry with exponential backoff

### Cross-Prompt Integration Testing

**Database + Error Infrastructure:**
1. Database error → DatabaseError thrown → ErrorLogger logs → User sees friendly message
2. Deadlock error → withTransactionRetry → Retry logic from Prompt 2 → Success after 2 retries
3. Constraint violation → Error classified → User-friendly message → Recovery action suggested

**Auto-Save + Error Infrastructure:**
1. Save failure → AppError logged → Retry with backoff → Success toast displayed
2. IndexedDB failure → Falls back to localStorage → ErrorLogger logs fallback → Save continues
3. Browser crash → Page reload → RecoveryDialog loads → Draft recovered → User continues work

**Database + Auto-Save:**
1. Auto-save triggers → withTransaction used → Multi-step save atomic → Success or rollback
2. Conflict detected → Server has newer data → User chooses draft → Transaction applies draft
3. Draft recovery → Data loaded → withTransaction creates conversation + turns → Atomic creation

### Cross-Prompt Consistency

**Error Handling Patterns:**
- [ ] All database operations use DatabaseError from Prompt 1
- [ ] All save operations use withRetry from Prompt 2
- [ ] All errors logged with ErrorLogger from Prompt 1
- [ ] All user messages friendly and actionable
- [ ] All technical messages preserved for debugging

**Code Organization:**
- [ ] File structure follows established patterns
- [ ] TypeScript strict mode enforced
- [ ] JSDoc comments on all exported functions
- [ ] Consistent naming conventions (camelCase, PascalCase)
- [ ] Test files colocated with source files

**User Experience:**
- [ ] All operations provide visual feedback
- [ ] Loading states shown during async operations
- [ ] Error states allow retry or recovery
- [ ] Success states confirmed with toasts
- [ ] Status indicators update in real-time

---

## Integration with Existing Codebase

### Services to Update with Transaction Wrapper

**Priority 1 (Critical):**
```typescript
// src/lib/services/conversation-service.ts
// Update: createConversation, updateConversation, deleteConversation
// Impact: Ensures conversation + turns atomicity

// src/lib/services/batch-generation-service.ts
// Update: createBatchJob, updateBatchProgress
// Impact: Ensures batch state consistency
```

**Priority 2 (Important):**
```typescript
// src/lib/services/template-service.ts
// Update: createTemplate, updateTemplate
// Impact: Ensures template + scenarios atomicity

// src/lib/services/scenario-service.ts
// Update: createScenario, updateScenario
// Impact: Ensures scenario + edge cases atomicity
```

### Components to Add Auto-Save

**Priority 1 (High User Impact):**
```typescript
// train-wireframe/src/components/conversations/ConversationEditor.tsx
// Add: useAutoSave hook, SaveStatusIndicator
// Impact: Prevents data loss during conversation editing

// train-wireframe/src/components/batch/BatchGenerationModal.tsx
// Add: useAutoSave for batch configuration
// Impact: Preserves batch setup across browser crashes
```

**Priority 2 (Medium User Impact):**
```typescript
// train-wireframe/src/components/templates/TemplateEditor.tsx
// Add: useAutoSave for template editing
// Impact: Prevents template data loss

// train-wireframe/src/components/scenarios/ScenarioEditor.tsx
// Add: useAutoSave for scenario editing
// Impact: Prevents scenario data loss
```

### Layout Integration

```typescript
// train-wireframe/src/app/layout.tsx
import { RecoveryDialog } from '@/components/auto-save/RecoveryDialog';
import { useRouter } from 'next/navigation';

export default function RootLayout({ children }) {
  const router = useRouter();
  
  return (
    <html>
      <body>
        <RecoveryDialog
          onRecover={(item, data) => {
            // Route to appropriate page based on item type
            const path = getRouteForRecoveryItem(item);
            router.push(path);
            
            // Store recovered data in state for component to use
            sessionStorage.setItem(`recovered_${item.id}`, JSON.stringify(data));
          }}
          getServerData={async (itemId, type) => {
            // Fetch current server state for conflict detection
            const response = await fetch(`/api/${type}s/${itemId}`);
            if (!response.ok) return null;
            
            const data = await response.json();
            return {
              data: data.data,
              updatedAt: new Date(data.updated_at),
            };
          }}
        />
        {children}
      </body>
    </html>
  );
}

function getRouteForRecoveryItem(item: RecoveryItem): string {
  const id = item.id.split('_')[1]; // Extract ID from "type_id" format
  
  switch (item.type) {
    case 'conversation':
      return `/conversations/${id}/edit`;
    case 'batch':
      return `/batch/${id}`;
    case 'template':
      return `/templates/${id}/edit`;
    default:
      return '/dashboard';
  }
}
```

---

## Next Steps (Prompts 6-8)

**Prompt 6: Batch Job Resume & Backup** (19-25 hours)
- Checkpoint system for batch jobs
- Resume UI for incomplete batches
- Pre-delete backup with 7-day retention
- Dependencies: Prompts 4 (transaction wrapper) and 5 (storage patterns)

**Prompt 7: Enhanced Notifications & Error Details** (7-10 hours)
- Toast notification system upgrade
- Error details modal
- Rate limit toast with countdown
- Dependencies: Prompts 1 (error classes) and 2 (rate limiter)

**Prompt 8: Recovery Wizard & Testing** (18-22 hours)
- Recovery detection across all failure types
- Multi-step recovery wizard UI
- Comprehensive test suite
- Dependencies: All previous prompts

---

## Document Status

**Generated**: 2025-11-04  
**Version**: 1.0  
**Status**: Ready for Implementation  
**Segment**: E10 Part 2 (Prompts 4-5)

**Prompts Covered**: 2 of 8  
**Estimated Time**: 31-41 hours (12-16 hours Prompt 4, 19-25 hours Prompt 5)  
**Risk Level**: Medium-High (High risk for Prompt 4 database operations)

**Dependencies Met:**
- ✅ Prompt 1: Error Infrastructure (error classes, logger)
- ✅ Prompt 2: API Error Handling (retry logic)
- ✅ Prompt 3: Error Boundaries (React error catching)

**Next Dependencies:**
- Prompts 6-8 will use transaction wrapper from Prompt 4
- Prompts 6-8 will use auto-save patterns from Prompt 5
- All prompts will use error infrastructure from Prompts 1-3

---

**End of E10 Part 2 Implementation Execution Instructions**

