/**
 * Transaction Integration Tests
 * 
 * Integration tests for transaction wrapper:
 * - Real database transaction testing
 * - Rollback verification
 * - Multi-step operation atomicity
 * - Deadlock retry behavior
 * - Constraint violation handling
 * 
 * Note: These tests require a running Supabase instance with the
 * transaction RPC functions installed.
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { withTransaction, withTransactionRetry, TransactionContext } from '../transaction';
import { DatabaseError, ErrorCode } from '../../../../train-wireframe/src/lib/errors';
import { supabase } from '../../supabase';

describe('Transaction Integration Tests', () => {
  const TEST_TABLE = 'test_transactions';
  const testData = {
    id: crypto.randomUUID(),
    name: 'Test Record',
    value: 100,
  };

  beforeAll(async () => {
    // Create test table if it doesn't exist
    const { error } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS ${TEST_TABLE} (
          id UUID PRIMARY KEY,
          name TEXT NOT NULL,
          value INTEGER NOT NULL CHECK (value >= 0),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `,
    });

    if (error) {
      console.warn('Could not create test table:', error.message);
    }
  });

  afterAll(async () => {
    // Clean up test table
    const { error } = await supabase.rpc('execute_sql', {
      sql: `DROP TABLE IF EXISTS ${TEST_TABLE};`,
    });

    if (error) {
      console.warn('Could not drop test table:', error.message);
    }
  });

  describe('withTransaction', () => {
    it('should commit transaction on successful execution', async () => {
      const result = await withTransaction(async (ctx: TransactionContext) => {
        const { data, error } = await ctx.client
          .from(TEST_TABLE)
          .insert({
            id: testData.id,
            name: testData.name,
            value: testData.value,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(testData.id);

      // Verify data was committed
      const { data: verifyData } = await supabase
        .from(TEST_TABLE)
        .select('*')
        .eq('id', testData.id)
        .single();

      expect(verifyData).toBeDefined();
      expect(verifyData?.name).toBe(testData.name);

      // Cleanup
      await supabase.from(TEST_TABLE).delete().eq('id', testData.id);
    });

    it('should rollback transaction on error', async () => {
      const rollbackTestId = crypto.randomUUID();

      await expect(
        withTransaction(async (ctx: TransactionContext) => {
          // Insert data
          const { error } = await ctx.client
            .from(TEST_TABLE)
            .insert({
              id: rollbackTestId,
              name: 'Should be rolled back',
              value: 50,
            });

          if (error) throw error;

          // Throw error to trigger rollback
          throw new Error('Intentional test error');
        })
      ).rejects.toThrow('Intentional test error');

      // Verify data was rolled back
      const { data: verifyData } = await supabase
        .from(TEST_TABLE)
        .select('*')
        .eq('id', rollbackTestId)
        .single();

      expect(verifyData).toBeNull();
    });

    it('should handle multi-step operations atomically', async () => {
      const parentId = crypto.randomUUID();
      const childId = crypto.randomUUID();

      await expect(
        withTransaction(async (ctx: TransactionContext) => {
          // Step 1: Insert parent record
          const { error: parentError } = await ctx.client
            .from(TEST_TABLE)
            .insert({
              id: parentId,
              name: 'Parent',
              value: 100,
            });

          if (parentError) throw parentError;

          // Step 2: Insert child record
          const { error: childError } = await ctx.client
            .from(TEST_TABLE)
            .insert({
              id: childId,
              name: 'Child',
              value: 50,
            });

          if (childError) throw childError;

          // Step 3: Intentional error - both should rollback
          throw new Error('Rollback all');
        })
      ).rejects.toThrow('Rollback all');

      // Verify both records were rolled back
      const { data: parentData } = await supabase
        .from(TEST_TABLE)
        .select('*')
        .eq('id', parentId)
        .single();

      const { data: childData } = await supabase
        .from(TEST_TABLE)
        .select('*')
        .eq('id', childId)
        .single();

      expect(parentData).toBeNull();
      expect(childData).toBeNull();
    });

    it('should enforce transaction timeout', async () => {
      await expect(
        withTransaction(
          async (ctx: TransactionContext) => {
            // Simulate slow operation
            await new Promise(resolve => setTimeout(resolve, 2000));
            return 'should timeout';
          },
          { timeout: 1000 } // 1 second timeout
        )
      ).rejects.toThrow(DatabaseError);

      await expect(
        withTransaction(
          async () => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return 'should timeout';
          },
          { timeout: 1000 }
        )
      ).rejects.toMatchObject({
        code: ErrorCode.ERR_DB_TIMEOUT,
      });
    }, 10000); // Increase test timeout

    it('should handle unique constraint violations', async () => {
      const uniqueId = crypto.randomUUID();

      // Insert first record
      await supabase.from(TEST_TABLE).insert({
        id: uniqueId,
        name: 'Unique Test',
        value: 100,
      });

      // Try to insert duplicate
      await expect(
        withTransaction(async (ctx: TransactionContext) => {
          const { error } = await ctx.client
            .from(TEST_TABLE)
            .insert({
              id: uniqueId, // Duplicate ID
              name: 'Duplicate',
              value: 200,
            });

          if (error) throw error;
        })
      ).rejects.toThrow(DatabaseError);

      await expect(
        withTransaction(async (ctx: TransactionContext) => {
          const { error } = await ctx.client
            .from(TEST_TABLE)
            .insert({
              id: uniqueId,
              name: 'Duplicate',
              value: 200,
            });

          if (error) throw error;
        })
      ).rejects.toMatchObject({
        code: ErrorCode.ERR_DB_CONSTRAINT,
      });

      // Cleanup
      await supabase.from(TEST_TABLE).delete().eq('id', uniqueId);
    });

    it('should handle check constraint violations', async () => {
      const checkId = crypto.randomUUID();

      await expect(
        withTransaction(async (ctx: TransactionContext) => {
          const { error } = await ctx.client
            .from(TEST_TABLE)
            .insert({
              id: checkId,
              name: 'Negative Value Test',
              value: -10, // Violates CHECK (value >= 0)
            });

          if (error) throw error;
        })
      ).rejects.toThrow(DatabaseError);
    });

    it('should handle not null violations', async () => {
      const nullId = crypto.randomUUID();

      await expect(
        withTransaction(async (ctx: TransactionContext) => {
          const { error } = await ctx.client
            .from(TEST_TABLE)
            .insert({
              id: nullId,
              // Missing required 'name' field
              value: 100,
            } as any);

          if (error) throw error;
        })
      ).rejects.toThrow(DatabaseError);
    });

    it('should use custom isolation level', async () => {
      const isolationId = crypto.randomUUID();

      const result = await withTransaction(
        async (ctx: TransactionContext) => {
          const { data, error } = await ctx.client
            .from(TEST_TABLE)
            .insert({
              id: isolationId,
              name: 'Serializable Test',
              value: 100,
            })
            .select()
            .single();

          if (error) throw error;
          return data;
        },
        { isolationLevel: 'SERIALIZABLE' }
      );

      expect(result).toBeDefined();

      // Cleanup
      await supabase.from(TEST_TABLE).delete().eq('id', isolationId);
    });
  });

  describe('withTransactionRetry', () => {
    it('should retry on deadlock errors', async () => {
      let attempts = 0;
      const retryId = crypto.randomUUID();

      const result = await withTransactionRetry(async (ctx: TransactionContext) => {
        attempts++;

        if (attempts < 2) {
          // Simulate deadlock on first attempt
          throw {
            code: '40P01',
            message: 'deadlock detected',
          };
        }

        // Succeed on second attempt
        const { data, error } = await ctx.client
          .from(TEST_TABLE)
          .insert({
            id: retryId,
            name: 'Retry Test',
            value: 100,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      });

      expect(result).toBeDefined();
      expect(attempts).toBe(2);

      // Cleanup
      await supabase.from(TEST_TABLE).delete().eq('id', retryId);
    });

    it('should not retry non-retryable errors', async () => {
      let attempts = 0;

      await expect(
        withTransactionRetry(async (ctx: TransactionContext) => {
          attempts++;

          // Throw non-retryable error
          throw {
            code: '23505', // Unique violation
            message: 'duplicate key',
          };
        })
      ).rejects.toThrow(DatabaseError);

      // Should only attempt once for non-retryable errors
      expect(attempts).toBe(1);
    });

    it('should respect maxRetries configuration', async () => {
      let attempts = 0;

      await expect(
        withTransactionRetry(
          async () => {
            attempts++;
            throw {
              code: '40P01', // Deadlock
              message: 'deadlock',
            };
          },
          { maxRetries: 2 }
        )
      ).rejects.toThrow(DatabaseError);

      expect(attempts).toBe(2);
    });
  });
});

