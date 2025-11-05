/**
 * Transaction Wrapper Unit Tests
 * 
 * Tests for transaction wrapper functionality:
 * - Transaction commit/rollback
 * - Timeout enforcement
 * - Error classification
 * - Retry logic
 * - Isolation levels
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { withTransaction, withTransactionRetry, TransactionContext, TRANSACTION_SQL_FUNCTIONS } from '../transaction';
import { DatabaseError, ErrorCode } from '../../../../@/lib/errors';

// Mock Supabase client
const mockRpc = jest.fn();
const mockSupabase = {
  rpc: mockRpc,
} as any;

// Mock dependencies
jest.mock('../../supabase', () => ({
  supabase: mockSupabase,
}));

jest.mock('../../../../@/lib/errors/error-logger', () => ({
  errorLogger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../../../@/lib/api/retry', () => ({
  withRetry: jest.fn((fn) => fn()),
}));

describe('withTransaction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRpc.mockResolvedValue({ data: null, error: null });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should successfully execute function within transaction', async () => {
    const testFunction = jest.fn(async (ctx: TransactionContext) => {
      expect(ctx.client).toBeDefined();
      expect(ctx.transactionId).toBeDefined();
      expect(ctx.startTime).toBeDefined();
      return 'success';
    });

    const result = await withTransaction(testFunction);

    expect(result).toBe('success');
    expect(mockRpc).toHaveBeenCalledWith('begin_transaction', {
      isolation_level: 'READ COMMITTED',
    });
    expect(mockRpc).toHaveBeenCalledWith('commit_transaction');
    expect(testFunction).toHaveBeenCalledTimes(1);
  });

  it('should rollback transaction on error', async () => {
    const testError = new Error('Test error');
    const testFunction = jest.fn(async () => {
      throw testError;
    });

    await expect(withTransaction(testFunction)).rejects.toThrow();

    expect(mockRpc).toHaveBeenCalledWith('begin_transaction', expect.any(Object));
    expect(mockRpc).toHaveBeenCalledWith('rollback_transaction');
    expect(mockRpc).not.toHaveBeenCalledWith('commit_transaction');
  });

  it('should handle custom isolation level', async () => {
    const testFunction = jest.fn(async () => 'success');

    await withTransaction(testFunction, {
      isolationLevel: 'SERIALIZABLE',
    });

    expect(mockRpc).toHaveBeenCalledWith('begin_transaction', {
      isolation_level: 'SERIALIZABLE',
    });
  });

  it('should enforce transaction timeout', async () => {
    const testFunction = jest.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return 'success';
    });

    await expect(
      withTransaction(testFunction, { timeout: 100 })
    ).rejects.toThrow(DatabaseError);

    await expect(
      withTransaction(testFunction, { timeout: 100 })
    ).rejects.toThrow(/timed out/);
  });

  it('should classify database errors correctly', async () => {
    const deadlockError = {
      code: '40P01',
      message: 'deadlock detected',
    };

    mockRpc.mockResolvedValueOnce({ data: null, error: null }); // begin
    
    const testFunction = jest.fn(async () => {
      throw deadlockError;
    });

    await expect(withTransaction(testFunction)).rejects.toThrow(DatabaseError);
    await expect(withTransaction(testFunction)).rejects.toMatchObject({
      code: ErrorCode.ERR_DB_DEADLOCK,
    });
  });

  it('should handle unique constraint violations', async () => {
    const uniqueError = {
      code: '23505',
      message: 'duplicate key value',
      details: 'Key (email)=(test@example.com) already exists',
    };

    mockRpc.mockResolvedValueOnce({ data: null, error: null }); // begin
    
    const testFunction = jest.fn(async () => {
      throw uniqueError;
    });

    await expect(withTransaction(testFunction)).rejects.toThrow(DatabaseError);
    await expect(withTransaction(testFunction)).rejects.toMatchObject({
      code: ErrorCode.ERR_DB_CONSTRAINT,
    });
  });

  it('should handle foreign key violations', async () => {
    const fkError = {
      code: '23503',
      message: 'foreign key violation',
      details: 'violates foreign key constraint "fk_user_id"',
    };

    mockRpc.mockResolvedValueOnce({ data: null, error: null }); // begin
    
    const testFunction = jest.fn(async () => {
      throw fkError;
    });

    await expect(withTransaction(testFunction)).rejects.toThrow(DatabaseError);
    await expect(withTransaction(testFunction)).rejects.toMatchObject({
      code: ErrorCode.ERR_DB_CONSTRAINT,
    });
  });

  it('should handle not null violations', async () => {
    const notNullError = {
      code: '23502',
      message: 'not null violation',
      details: 'column "name" violates not-null constraint',
    };

    mockRpc.mockResolvedValueOnce({ data: null, error: null }); // begin
    
    const testFunction = jest.fn(async () => {
      throw notNullError;
    });

    await expect(withTransaction(testFunction)).rejects.toThrow(DatabaseError);
    await expect(withTransaction(testFunction)).rejects.toMatchObject({
      code: ErrorCode.ERR_DB_CONSTRAINT,
    });
  });

  it('should handle connection errors', async () => {
    const connectionError = {
      code: '08000',
      message: 'connection failure',
    };

    mockRpc.mockResolvedValueOnce({ data: null, error: null }); // begin
    
    const testFunction = jest.fn(async () => {
      throw connectionError;
    });

    await expect(withTransaction(testFunction)).rejects.toThrow(DatabaseError);
    await expect(withTransaction(testFunction)).rejects.toMatchObject({
      code: ErrorCode.ERR_DB_CONNECTION,
    });
  });

  it('should handle begin transaction failure', async () => {
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: new Error('Failed to begin'),
    });

    const testFunction = jest.fn(async () => 'success');

    await expect(withTransaction(testFunction)).rejects.toThrow(DatabaseError);
    await expect(withTransaction(testFunction)).rejects.toMatchObject({
      code: ErrorCode.ERR_DB_CONNECTION,
    });
  });

  it('should handle commit transaction failure', async () => {
    mockRpc
      .mockResolvedValueOnce({ data: null, error: null }) // begin
      .mockResolvedValueOnce({ data: null, error: new Error('Commit failed') }) // commit
      .mockResolvedValueOnce({ data: null, error: null }); // rollback

    const testFunction = jest.fn(async () => 'success');

    await expect(withTransaction(testFunction)).rejects.toThrow(DatabaseError);
    expect(mockRpc).toHaveBeenCalledWith('rollback_transaction');
  });

  it('should pass DatabaseError through without wrapping', async () => {
    const dbError = new DatabaseError(
      'Custom database error',
      ErrorCode.ERR_DB_QUERY
    );

    mockRpc.mockResolvedValueOnce({ data: null, error: null }); // begin
    
    const testFunction = jest.fn(async () => {
      throw dbError;
    });

    await expect(withTransaction(testFunction)).rejects.toBe(dbError);
  });
});

describe('withTransactionRetry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRpc.mockResolvedValue({ data: null, error: null });
  });

  it('should retry on deadlock errors', async () => {
    const deadlockError = {
      code: '40P01',
      message: 'deadlock detected',
    };

    let attempts = 0;
    const testFunction = jest.fn(async () => {
      attempts++;
      if (attempts < 3) {
        throw deadlockError;
      }
      return 'success';
    });

    // Mock withRetry to actually retry
    const { withRetry } = require('../../../../@/lib/api/retry');
    withRetry.mockImplementation(async (fn: any) => {
      let lastError;
      for (let i = 0; i < 3; i++) {
        try {
          return await fn();
        } catch (error) {
          lastError = error;
        }
      }
      throw lastError;
    });

    const result = await withTransactionRetry(testFunction);

    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  it('should not retry when retryDeadlocks is false', async () => {
    const testFunction = jest.fn(async () => 'success');

    await withTransactionRetry(testFunction, { retryDeadlocks: false });

    const { withRetry } = require('../../../../@/lib/api/retry');
    expect(withRetry).not.toHaveBeenCalled();
  });
});

describe('TRANSACTION_SQL_FUNCTIONS', () => {
  it('should contain SQL for all transaction functions', () => {
    expect(TRANSACTION_SQL_FUNCTIONS).toContain('begin_transaction');
    expect(TRANSACTION_SQL_FUNCTIONS).toContain('commit_transaction');
    expect(TRANSACTION_SQL_FUNCTIONS).toContain('rollback_transaction');
    expect(TRANSACTION_SQL_FUNCTIONS).toContain('LANGUAGE plpgsql');
  });
});

