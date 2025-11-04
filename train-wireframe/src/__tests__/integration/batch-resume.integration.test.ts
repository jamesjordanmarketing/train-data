import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  saveCheckpoint,
  loadCheckpoint,
  cleanupCheckpoint,
  BatchCheckpoint,
} from '@/lib/batch/checkpoint';
import {
  resumeBatchProcessing,
  BatchItem,
} from '@/lib/batch/processor';
import { supabase } from '@/utils/supabase/client';

// Mock Supabase
vi.mock('@/utils/supabase/client');
vi.mock('@/lib/database/transaction');
vi.mock('@/lib/errors/error-logger');

describe('Batch Resume Integration', () => {
  const mockJobId = 'integration-test-job-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should complete full batch processing flow with checkpoints', async () => {
    const allItems: BatchItem[] = [
      { id: 'conv-1', topic: 'Topic 1', parameters: {}, status: 'pending' },
      { id: 'conv-2', topic: 'Topic 2', parameters: {}, status: 'pending' },
      { id: 'conv-3', topic: 'Topic 3', parameters: {}, status: 'pending' },
      { id: 'conv-4', topic: 'Topic 4', parameters: {}, status: 'pending' },
      { id: 'conv-5', topic: 'Topic 5', parameters: {}, status: 'pending' },
    ];

    // Mock checkpoint load (no existing checkpoint)
    vi.mocked(supabase.from as any).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' },
          }),
        }),
      }),
    });

    // Mock checkpoint saves (one per item)
    const mockWithTransaction = vi.fn(async (callback) => {
      await callback({
        client: {
          from: vi.fn().mockReturnValue({
            upsert: vi.fn().mockResolvedValue({ error: null }),
          }),
        },
      });
    });

    const { withTransaction } = await import('@/lib/database/transaction');
    vi.mocked(withTransaction).mockImplementation(mockWithTransaction);

    const processFn = vi.fn().mockResolvedValue(undefined);
    const progressUpdates: any[] = [];

    const result = await resumeBatchProcessing(
      mockJobId,
      allItems,
      processFn,
      (progress) => progressUpdates.push(progress)
    );

    // Verify all items were processed
    expect(processFn).toHaveBeenCalledTimes(5);
    expect(result.completed).toHaveLength(5);
    expect(result.failed).toHaveLength(0);

    // Verify checkpoint was saved after each item
    expect(mockWithTransaction).toHaveBeenCalledTimes(5);

    // Verify progress updates
    expect(progressUpdates).toHaveLength(5);
    expect(progressUpdates[4]).toEqual({
      completed: 5,
      failed: 0,
      total: 5,
    });
  });

  it('should resume batch from checkpoint after interruption', async () => {
    const allItems: BatchItem[] = [
      { id: 'conv-1', topic: 'Topic 1', parameters: {}, status: 'pending' },
      { id: 'conv-2', topic: 'Topic 2', parameters: {}, status: 'pending' },
      { id: 'conv-3', topic: 'Topic 3', parameters: {}, status: 'pending' },
      { id: 'conv-4', topic: 'Topic 4', parameters: {}, status: 'pending' },
      { id: 'conv-5', topic: 'Topic 5', parameters: {}, status: 'pending' },
    ];

    // Simulate checkpoint from previous run (first 2 items completed)
    const existingCheckpoint: BatchCheckpoint = {
      id: 'checkpoint-1',
      jobId: mockJobId,
      completedItems: ['conv-1', 'conv-2'],
      failedItems: [],
      progressPercentage: 40,
      lastCheckpointAt: '2025-11-04T10:00:00Z',
      createdAt: '2025-11-04T09:00:00Z',
      updatedAt: '2025-11-04T10:00:00Z',
    };

    // Mock checkpoint load
    vi.mocked(supabase.from as any).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: existingCheckpoint.id,
              job_id: existingCheckpoint.jobId,
              completed_items: existingCheckpoint.completedItems,
              failed_items: existingCheckpoint.failedItems,
              progress_percentage: existingCheckpoint.progressPercentage,
              last_checkpoint_at: existingCheckpoint.lastCheckpointAt,
              created_at: existingCheckpoint.createdAt,
              updated_at: existingCheckpoint.updatedAt,
            },
            error: null,
          }),
        }),
      }),
    });

    // Mock checkpoint saves
    const mockWithTransaction = vi.fn(async (callback) => {
      await callback({
        client: {
          from: vi.fn().mockReturnValue({
            upsert: vi.fn().mockResolvedValue({ error: null }),
          }),
        },
      });
    });

    const { withTransaction } = await import('@/lib/database/transaction');
    vi.mocked(withTransaction).mockImplementation(mockWithTransaction);

    const processFn = vi.fn().mockResolvedValue(undefined);

    const result = await resumeBatchProcessing(
      mockJobId,
      allItems,
      processFn
    );

    // Should only process remaining 3 items (conv-3, conv-4, conv-5)
    expect(processFn).toHaveBeenCalledTimes(3);

    // Final result should include all 5 items
    expect(result.completed).toHaveLength(5);
    expect(result.completed).toContain('conv-1'); // From checkpoint
    expect(result.completed).toContain('conv-2'); // From checkpoint
    expect(result.completed).toContain('conv-3'); // Newly processed
    expect(result.completed).toContain('conv-4'); // Newly processed
    expect(result.completed).toContain('conv-5'); // Newly processed
  });

  it('should handle failures and save failed items in checkpoint', async () => {
    const allItems: BatchItem[] = [
      { id: 'conv-1', topic: 'Topic 1', parameters: {}, status: 'pending' },
      { id: 'conv-2', topic: 'Topic 2', parameters: {}, status: 'pending' },
      { id: 'conv-3', topic: 'Topic 3', parameters: {}, status: 'pending' },
    ];

    // Mock checkpoint load (no existing checkpoint)
    vi.mocked(supabase.from as any).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' },
          }),
        }),
      }),
    });

    // Mock checkpoint saves
    const mockWithTransaction = vi.fn(async (callback) => {
      await callback({
        client: {
          from: vi.fn().mockReturnValue({
            upsert: vi.fn().mockResolvedValue({ error: null }),
          }),
        },
      });
    });

    const { withTransaction } = await import('@/lib/database/transaction');
    vi.mocked(withTransaction).mockImplementation(mockWithTransaction);

    // Fail on second item
    const processFn = vi.fn()
      .mockResolvedValueOnce(undefined) // conv-1 succeeds
      .mockRejectedValueOnce(new Error('API rate limit')) // conv-2 fails
      .mockResolvedValueOnce(undefined); // conv-3 succeeds

    const result = await resumeBatchProcessing(
      mockJobId,
      allItems,
      processFn
    );

    expect(result.completed).toHaveLength(2);
    expect(result.failed).toHaveLength(1);
    expect(result.failed[0].itemId).toBe('conv-2');
    expect(result.failed[0].error).toBe('API rate limit');

    // Verify checkpoint was saved after each item (including failures)
    expect(mockWithTransaction).toHaveBeenCalledTimes(3);
  });

  it('should be idempotent - not reprocess completed items', async () => {
    const allItems: BatchItem[] = [
      { id: 'conv-1', topic: 'Topic 1', parameters: {}, status: 'pending' },
      { id: 'conv-2', topic: 'Topic 2', parameters: {}, status: 'pending' },
      { id: 'conv-3', topic: 'Topic 3', parameters: {}, status: 'pending' },
    ];

    // Checkpoint shows all items completed
    const completeCheckpoint: BatchCheckpoint = {
      id: 'checkpoint-1',
      jobId: mockJobId,
      completedItems: ['conv-1', 'conv-2', 'conv-3'],
      failedItems: [],
      progressPercentage: 100,
      lastCheckpointAt: '2025-11-04T10:00:00Z',
      createdAt: '2025-11-04T09:00:00Z',
      updatedAt: '2025-11-04T10:00:00Z',
    };

    vi.mocked(supabase.from as any).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: completeCheckpoint.id,
              job_id: completeCheckpoint.jobId,
              completed_items: completeCheckpoint.completedItems,
              failed_items: completeCheckpoint.failedItems,
              progress_percentage: completeCheckpoint.progressPercentage,
              last_checkpoint_at: completeCheckpoint.lastCheckpointAt,
              created_at: completeCheckpoint.createdAt,
              updated_at: completeCheckpoint.updatedAt,
            },
            error: null,
          }),
        }),
      }),
    });

    const processFn = vi.fn();

    const result = await resumeBatchProcessing(
      mockJobId,
      allItems,
      processFn
    );

    // Should not process any items (all already completed)
    expect(processFn).not.toHaveBeenCalled();
    expect(result.completed).toHaveLength(3);
  });

  it('should cleanup checkpoint after successful completion', async () => {
    const mockDelete = vi.fn().mockResolvedValue({ error: null });

    vi.mocked(supabase.from as any).mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: mockDelete,
      }),
    });

    await cleanupCheckpoint(mockJobId);

    expect(mockDelete).toHaveBeenCalledWith(mockJobId);
  });

  it('should handle multiple resume attempts with partial failures', async () => {
    const allItems: BatchItem[] = [
      { id: 'conv-1', topic: 'Topic 1', parameters: {}, status: 'pending' },
      { id: 'conv-2', topic: 'Topic 2', parameters: {}, status: 'pending' },
      { id: 'conv-3', topic: 'Topic 3', parameters: {}, status: 'pending' },
      { id: 'conv-4', topic: 'Topic 4', parameters: {}, status: 'pending' },
    ];

    // First attempt: conv-1 succeeds, conv-2 fails
    const firstCheckpoint: BatchCheckpoint = {
      id: 'checkpoint-1',
      jobId: mockJobId,
      completedItems: ['conv-1'],
      failedItems: [
        { itemId: 'conv-2', error: 'First failure', timestamp: '2025-11-04T10:00:00Z' },
      ],
      progressPercentage: 25,
      lastCheckpointAt: '2025-11-04T10:00:00Z',
      createdAt: '2025-11-04T09:00:00Z',
      updatedAt: '2025-11-04T10:00:00Z',
    };

    vi.mocked(supabase.from as any).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: firstCheckpoint.id,
              job_id: firstCheckpoint.jobId,
              completed_items: firstCheckpoint.completedItems,
              failed_items: firstCheckpoint.failedItems,
              progress_percentage: firstCheckpoint.progressPercentage,
              last_checkpoint_at: firstCheckpoint.lastCheckpointAt,
              created_at: firstCheckpoint.createdAt,
              updated_at: firstCheckpoint.updatedAt,
            },
            error: null,
          }),
        }),
      }),
    });

    const mockWithTransaction = vi.fn(async (callback) => {
      await callback({
        client: {
          from: vi.fn().mockReturnValue({
            upsert: vi.fn().mockResolvedValue({ error: null }),
          }),
        },
      });
    });

    const { withTransaction } = await import('@/lib/database/transaction');
    vi.mocked(withTransaction).mockImplementation(mockWithTransaction);

    // Second attempt: process remaining items (conv-2, conv-3, conv-4)
    const processFn = vi.fn().mockResolvedValue(undefined);

    const result = await resumeBatchProcessing(
      mockJobId,
      allItems,
      processFn
    );

    // Should only process items not in completed list (conv-2, conv-3, conv-4)
    // Note: conv-2 is in failed list, so it won't be reprocessed
    expect(processFn).toHaveBeenCalledTimes(2); // conv-3 and conv-4 only

    // Result includes original completed items plus newly completed
    expect(result.completed).toHaveLength(3); // conv-1, conv-3, conv-4
    expect(result.failed).toHaveLength(1); // conv-2 from first attempt
  });
});

