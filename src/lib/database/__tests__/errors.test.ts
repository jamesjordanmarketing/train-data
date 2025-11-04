/**
 * Database Error Classification Unit Tests
 * 
 * Tests for database error classification:
 * - Postgres error code mapping
 * - User-friendly message generation
 * - Retryability determination
 * - Recovery action recommendations
 * - Constraint extraction
 */

import { describe, it, expect } from '@jest/globals';
import {
  classifyDatabaseError,
  isDatabaseErrorRetryable,
  getDatabaseErrorMessage,
  getDatabaseRecoveryAction,
  PostgresErrorCode,
  DatabaseErrorCategory,
  DatabaseRecoveryAction,
  DATABASE_ERROR_MESSAGES,
} from '../errors';

describe('classifyDatabaseError', () => {
  it('should classify unique constraint violations', () => {
    const error = {
      code: PostgresErrorCode.UNIQUE_VIOLATION,
      message: 'duplicate key value violates unique constraint',
      details: 'Key (email)=(test@example.com) already exists',
    };

    const classification = classifyDatabaseError(error);

    expect(classification.category).toBe(DatabaseErrorCategory.CONSTRAINT_VIOLATION);
    expect(classification.isRetryable).toBe(false);
    expect(classification.recoveryAction).toBe(DatabaseRecoveryAction.FIX_DATA);
    expect(classification.userMessage).toContain('email');
    expect(classification.userMessage).toContain('already exists');
    expect(classification.constraint).toBe('email');
    expect(classification.field).toBe('email');
  });

  it('should classify foreign key violations', () => {
    const error = {
      code: PostgresErrorCode.FOREIGN_KEY_VIOLATION,
      message: 'insert or update on table violates foreign key constraint',
      details: 'violates foreign key constraint "fk_user_id" on table "users"',
    };

    const classification = classifyDatabaseError(error);

    expect(classification.category).toBe(DatabaseErrorCategory.CONSTRAINT_VIOLATION);
    expect(classification.isRetryable).toBe(false);
    expect(classification.recoveryAction).toBe(DatabaseRecoveryAction.FIX_DATA);
    expect(classification.userMessage).toContain('Referenced record not found');
    expect(classification.userMessage).toContain('users');
    expect(classification.constraint).toBe('fk_user_id');
  });

  it('should classify not null violations', () => {
    const error = {
      code: PostgresErrorCode.NOT_NULL_VIOLATION,
      message: 'null value in column violates not-null constraint',
      details: 'column "user_name" of relation "users" violates not-null constraint',
    };

    const classification = classifyDatabaseError(error);

    expect(classification.category).toBe(DatabaseErrorCategory.CONSTRAINT_VIOLATION);
    expect(classification.isRetryable).toBe(false);
    expect(classification.recoveryAction).toBe(DatabaseRecoveryAction.FIX_DATA);
    expect(classification.userMessage).toContain('user name');
    expect(classification.userMessage).toContain('required');
    expect(classification.constraint).toBe('not_null_user_name');
    expect(classification.field).toBe('user_name');
  });

  it('should classify check constraint violations', () => {
    const error = {
      code: PostgresErrorCode.CHECK_VIOLATION,
      message: 'check constraint violation',
      details: 'violates check constraint "age_positive"',
    };

    const classification = classifyDatabaseError(error);

    expect(classification.category).toBe(DatabaseErrorCategory.CONSTRAINT_VIOLATION);
    expect(classification.isRetryable).toBe(false);
    expect(classification.recoveryAction).toBe(DatabaseRecoveryAction.FIX_DATA);
    expect(classification.userMessage).toContain('age positive');
    expect(classification.constraint).toBe('age_positive');
  });

  it('should classify deadlock errors as retryable', () => {
    const error = {
      code: PostgresErrorCode.DEADLOCK_DETECTED,
      message: 'deadlock detected',
    };

    const classification = classifyDatabaseError(error);

    expect(classification.category).toBe(DatabaseErrorCategory.TRANSACTION_ERROR);
    expect(classification.isRetryable).toBe(true);
    expect(classification.recoveryAction).toBe(DatabaseRecoveryAction.RETRY);
    expect(classification.userMessage).toContain('Retrying automatically');
  });

  it('should classify serialization failures as retryable', () => {
    const error = {
      code: PostgresErrorCode.SERIALIZATION_FAILURE,
      message: 'could not serialize access',
    };

    const classification = classifyDatabaseError(error);

    expect(classification.category).toBe(DatabaseErrorCategory.TRANSACTION_ERROR);
    expect(classification.isRetryable).toBe(true);
    expect(classification.recoveryAction).toBe(DatabaseRecoveryAction.RETRY);
  });

  it('should classify connection failures as retryable', () => {
    const error = {
      code: PostgresErrorCode.CONNECTION_FAILURE,
      message: 'connection failed',
    };

    const classification = classifyDatabaseError(error);

    expect(classification.category).toBe(DatabaseErrorCategory.CONNECTION_ERROR);
    expect(classification.isRetryable).toBe(true);
    expect(classification.recoveryAction).toBe(DatabaseRecoveryAction.CHECK_NETWORK);
    expect(classification.userMessage).toContain('network');
  });

  it('should classify query timeouts as retryable', () => {
    const error = {
      code: PostgresErrorCode.QUERY_CANCELED,
      message: 'canceling statement due to statement timeout',
    };

    const classification = classifyDatabaseError(error);

    expect(classification.category).toBe(DatabaseErrorCategory.TIMEOUT_ERROR);
    expect(classification.isRetryable).toBe(true);
    expect(classification.recoveryAction).toBe(DatabaseRecoveryAction.RETRY);
    expect(classification.userMessage).toContain('took too long');
  });

  it('should classify no rows errors', () => {
    const error = {
      code: PostgresErrorCode.PGRST_NO_ROWS,
      message: 'no rows returned',
    };

    const classification = classifyDatabaseError(error);

    expect(classification.category).toBe(DatabaseErrorCategory.QUERY_ERROR);
    expect(classification.isRetryable).toBe(false);
    expect(classification.recoveryAction).toBe(DatabaseRecoveryAction.NONE);
    expect(classification.userMessage).toContain('not found');
  });

  it('should classify JWT expired errors', () => {
    const error = {
      code: PostgresErrorCode.PGRST_JWT_EXPIRED,
      message: 'JWT token expired',
    };

    const classification = classifyDatabaseError(error);

    expect(classification.category).toBe(DatabaseErrorCategory.PERMISSION_ERROR);
    expect(classification.isRetryable).toBe(false);
    expect(classification.recoveryAction).toBe(DatabaseRecoveryAction.CHECK_PERMISSIONS);
    expect(classification.userMessage).toContain('session has expired');
  });

  it('should handle unknown errors gracefully', () => {
    const error = {
      code: 'UNKNOWN_CODE',
      message: 'unknown error',
    };

    const classification = classifyDatabaseError(error);

    expect(classification.category).toBe(DatabaseErrorCategory.UNKNOWN);
    expect(classification.isRetryable).toBe(false);
    expect(classification.recoveryAction).toBe(DatabaseRecoveryAction.CONTACT_ADMIN);
    expect(classification.userMessage).toContain('unexpected');
  });

  it('should handle errors without code', () => {
    const error = {
      message: 'error without code',
    };

    const classification = classifyDatabaseError(error);

    expect(classification.category).toBe(DatabaseErrorCategory.UNKNOWN);
    expect(classification.technicalMessage).toBe('error without code');
  });

  it('should handle errors without details', () => {
    const error = {
      code: PostgresErrorCode.UNIQUE_VIOLATION,
      message: 'duplicate key',
    };

    const classification = classifyDatabaseError(error);

    expect(classification.category).toBe(DatabaseErrorCategory.CONSTRAINT_VIOLATION);
    expect(classification.userMessage).toContain('unknown field');
  });
});

describe('isDatabaseErrorRetryable', () => {
  it('should return true for retryable errors', () => {
    const deadlockError = {
      code: PostgresErrorCode.DEADLOCK_DETECTED,
      message: 'deadlock',
    };

    expect(isDatabaseErrorRetryable(deadlockError)).toBe(true);
  });

  it('should return false for non-retryable errors', () => {
    const uniqueError = {
      code: PostgresErrorCode.UNIQUE_VIOLATION,
      message: 'duplicate key',
    };

    expect(isDatabaseErrorRetryable(uniqueError)).toBe(false);
  });

  it('should return true for connection errors', () => {
    const connectionError = {
      code: PostgresErrorCode.CONNECTION_FAILURE,
      message: 'connection failed',
    };

    expect(isDatabaseErrorRetryable(connectionError)).toBe(true);
  });

  it('should return true for timeout errors', () => {
    const timeoutError = {
      code: PostgresErrorCode.QUERY_CANCELED,
      message: 'query canceled',
    };

    expect(isDatabaseErrorRetryable(timeoutError)).toBe(true);
  });
});

describe('getDatabaseErrorMessage', () => {
  it('should return user-friendly message for unique violation', () => {
    const error = {
      code: PostgresErrorCode.UNIQUE_VIOLATION,
      message: 'duplicate key',
      details: 'Key (email)=(test@test.com) already exists',
    };

    const message = getDatabaseErrorMessage(error);

    expect(message).toContain('email');
    expect(message).toContain('already exists');
  });

  it('should return user-friendly message for deadlock', () => {
    const error = {
      code: PostgresErrorCode.DEADLOCK_DETECTED,
      message: 'deadlock',
    };

    const message = getDatabaseErrorMessage(error);

    expect(message).toContain('conflicted');
    expect(message).toContain('Retrying');
  });

  it('should return user-friendly message for unknown errors', () => {
    const error = {
      message: 'weird error',
    };

    const message = getDatabaseErrorMessage(error);

    expect(message).toContain('unexpected');
  });
});

describe('getDatabaseRecoveryAction', () => {
  it('should return FIX_DATA for constraint violations', () => {
    const error = {
      code: PostgresErrorCode.UNIQUE_VIOLATION,
      message: 'duplicate key',
    };

    const action = getDatabaseRecoveryAction(error);

    expect(action).toBe(DatabaseRecoveryAction.FIX_DATA);
  });

  it('should return RETRY for deadlocks', () => {
    const error = {
      code: PostgresErrorCode.DEADLOCK_DETECTED,
      message: 'deadlock',
    };

    const action = getDatabaseRecoveryAction(error);

    expect(action).toBe(DatabaseRecoveryAction.RETRY);
  });

  it('should return CHECK_NETWORK for connection errors', () => {
    const error = {
      code: PostgresErrorCode.CONNECTION_FAILURE,
      message: 'connection failed',
    };

    const action = getDatabaseRecoveryAction(error);

    expect(action).toBe(DatabaseRecoveryAction.CHECK_NETWORK);
  });

  it('should return CHECK_PERMISSIONS for JWT expired', () => {
    const error = {
      code: PostgresErrorCode.PGRST_JWT_EXPIRED,
      message: 'JWT expired',
    };

    const action = getDatabaseRecoveryAction(error);

    expect(action).toBe(DatabaseRecoveryAction.CHECK_PERMISSIONS);
  });

  it('should return CONTACT_ADMIN for unknown errors', () => {
    const error = {
      message: 'unknown error',
    };

    const action = getDatabaseRecoveryAction(error);

    expect(action).toBe(DatabaseRecoveryAction.CONTACT_ADMIN);
  });
});

describe('DATABASE_ERROR_MESSAGES', () => {
  it('should contain messages for all error categories', () => {
    expect(DATABASE_ERROR_MESSAGES[DatabaseErrorCategory.CONSTRAINT_VIOLATION]).toBeDefined();
    expect(DATABASE_ERROR_MESSAGES[DatabaseErrorCategory.CONNECTION_ERROR]).toBeDefined();
    expect(DATABASE_ERROR_MESSAGES[DatabaseErrorCategory.TRANSACTION_ERROR]).toBeDefined();
    expect(DATABASE_ERROR_MESSAGES[DatabaseErrorCategory.TIMEOUT_ERROR]).toBeDefined();
    expect(DATABASE_ERROR_MESSAGES[DatabaseErrorCategory.PERMISSION_ERROR]).toBeDefined();
    expect(DATABASE_ERROR_MESSAGES[DatabaseErrorCategory.QUERY_ERROR]).toBeDefined();
    expect(DATABASE_ERROR_MESSAGES[DatabaseErrorCategory.UNKNOWN]).toBeDefined();
  });

  it('should have non-empty messages', () => {
    Object.values(DATABASE_ERROR_MESSAGES).forEach((message) => {
      expect(message.length).toBeGreaterThan(0);
    });
  });
});

