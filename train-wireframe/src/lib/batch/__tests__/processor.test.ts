import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isItemCompleted,
  filterPendingItems,
  resumeBatchProcessing,
  BatchItem,
} from '../processor';
import { BatchCheckpoint, loadCheckpoint, saveCheckpoint } from '../checkpoint';

// Mock dependencies
vi.mock('../checkpoint');
vi.mock('../../errors/error-logger');

describe('Batch Processor', () => {
  const mockJobId = 'test-job-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isItemCompleted', () => {
    it('should return true if item is in checkpoint completed list', () => {
      const checkpoint: BatchCheckpoint = {
        id: 'checkpoint-1',
        jobId: mockJobId,
        completedItems: ['conv-1', 'conv-2', 'conv-3'],
        failedItems: [],
        progressPercentage: 60,
        lastCheckpointAt: '2025-11-04T10:00:00Z',
        createdAt: '2025-11-04T09:00:00Z',
        updatedAt: '2025-11-04T10:00:00Z',
      };

      expect(isItemCompleted('conv-2', checkpoint)).toBe(true);
    });

    it('should return false if item is not in checkpoint', () => {
      const checkpoint: BatchCheckpoint = {
        id: 'checkpoint-1',
        jobId: mockJobId,
        completedItems: ['conv-1', 'conv-2'],
        failedItems: [],
        progressPercentage: 40,
        lastCheckpointAt: '2025-11-04T10:00:00Z',
        createdAt: '2025-11-04T09:00:00Z',
        updatedAt: '2025-11-04T10:00:00Z',
      };

      expect(isItemCompleted('conv-3', checkpoint)).toBe(false);
    });

    it('should return false if checkpoint is null', () => {
      expect(isItemCompleted('conv-1', null)).toBe(false);
    });
  });

  describe('filterPendingItems', () => {
    const allItems: BatchItem[] = [
      { id: 'conv-1', topic: 'Topic 1', parameters: {}, status: 'pending' },
      { id: 'conv-2', topic: 'Topic 2', parameters: {}, status: 'pending' },
      { id: 'conv-3', topic: 'Topic 3', parameters: {}, status: 'pending' },
      { id: 'conv-4', topic: 'Topic 4', parameters: {}, status: 'pending' },
      { id: 'conv-5', topic: 'Topic 5', parameters: {}, status: 'pending' },
    ];

    it('should return all items if no checkpoint exists', () => {
      const pending = filterPendingItems(allItems, null);

      expect(pending).toEqual(allItems);
    });

    it('should filter out completed items', () => {
      const checkpoint: BatchCheckpoint = {
        id: 'checkpoint-1',
        jobId: mockJobId,
        completedItems: ['conv-1', 'conv-2'],
        failedItems: [],
        progressPercentage: 40,
        lastCheckpointAt: '2025-11-04T10:00:00Z',
        createdAt: '2025-11-04T09:00:00Z',
        updatedAt: '2025-11-04T10:00:00Z',
      };

      const pending = filterPendingItems(allItems, checkpoint);

      expect(pending).toHaveLength(3);
      expect(pending.map(item => item.id)).toEqual(['conv-3', 'conv-4', 'conv-5']);
    });

    it('should filter out failed items', () => {
      const checkpoint: BatchCheckpoint = {
        id: 'checkpoint-1',
        jobId: mockJobId,
        completedItems: ['conv-1'],
        failedItems: [
          { itemId: 'conv-2', error: 'Error', timestamp: '2025-11-04T10:00:00Z' },
        ],
        progressPercentage: 40,
        lastCheckpointAt: '2025-11-04T10:00:00Z',
        createdAt: '2025-11-04T09:00:00Z',
        updatedAt: '2025-11-04T10:00:00Z',
      };

      const pending = filterPendingItems(allItems, checkpoint);

      expect(pending).toHaveLength(3);
      expect(pending.map(item => item.id)).toEqual(['conv-3', 'conv-4', 'conv-5']);
    });

    it('should filter out both completed and failed items', () => {
      const checkpoint: BatchCheckpoint = {
        id: 'checkpoint-1',
        jobId: mockJobId,
        completedItems: ['conv-1', 'conv-3'],
        failedItems: [
          { itemId: 'conv-2', error: 'Error', timestamp: '2025-11-04T10:00:00Z' },
        ],
        progressPercentage: 60,
        lastCheckpointAt: '2025-11-04T10:00:00Z',
        createdAt: '2025-11-04T09:00:00Z',
        updatedAt: '2025-11-04T10:00:00Z',
      };

      const pending = filterPendingItems(allItems, checkpoint);

      expect(pending).toHaveLength(2);
      expect(pending.map(item => item.id)).toEqual(['conv-4', 'conv-5']);
    });

    it('should return empty array if all items are processed', () => {
      const checkpoint: BatchCheckpoint = {
        id: 'checkpoint-1',
        jobId: mockJobId,
        completedItems: ['conv-1', 'conv-2', 'conv-3'],
        failedItems: [
          { itemId: 'conv-4', error: 'Error', timestamp: '2025-11-04T10:00:00Z' },
          { itemId: 'conv-5', error: 'Error', timestamp: '2025-11-04T10:00:00Z' },
        ],
        progressPercentage: 100,
        lastCheckpointAt: '2025-11-04T10:00:00Z',
        createdAt: '2025-11-04T09:00:00Z',
        updatedAt: '2025-11-04T10:00:00Z',
      };

      const pending = filterPendingItems(allItems, checkpoint);

      expect(pending).toHaveLength(0);
    });
  });

  describe('resumeBatchProcessing', () => {
    const allItems: BatchItem[] = [
      { id: 'conv-1', topic: 'Topic 1', parameters: {}, status: 'pending' },
      { id: 'conv-2', topic: 'Topic 2', parameters: {}, status: 'pending' },
      { id: 'conv-3', topic: 'Topic 3', parameters: {}, status: 'pending' },
    ];

    it('should process all items if no checkpoint exists', async () => {
      vi.mocked(loadCheckpoint).mockResolvedValue(null);
      vi.mocked(saveCheckpoint).mockResolvedValue(undefined);

      const processFn = vi.fn().mockResolvedValue(undefined);
      const onProgress = vi.fn();

      const result = await resumeBatchProcessing(
        mockJobId,
        allItems,
        processFn,
        onProgress
      );

      expect(processFn).toHaveBeenCalledTimes(3);
      expect(result.completed).toHaveLength(3);
      expect(result.failed).toHaveLength(0);
      expect(onProgress).toHaveBeenCalledTimes(3);
    });

    it('should only process pending items when checkpoint exists', async () => {
      const checkpoint: BatchCheckpoint = {
        id: 'checkpoint-1',
        jobId: mockJobId,
        completedItems: ['conv-1'],
        failedItems: [],
        progressPercentage: 33,
        lastCheckpointAt: '2025-11-04T10:00:00Z',
        createdAt: '2025-11-04T09:00:00Z',
        updatedAt: '2025-11-04T10:00:00Z',
      };

      vi.mocked(loadCheckpoint).mockResolvedValue(checkpoint);
      vi.mocked(saveCheckpoint).mockResolvedValue(undefined);

      const processFn = vi.fn().mockResolvedValue(undefined);

      const result = await resumeBatchProcessing(
        mockJobId,
        allItems,
        processFn
      );

      // Should only process conv-2 and conv-3
      expect(processFn).toHaveBeenCalledTimes(2);
      expect(result.completed).toHaveLength(3); // conv-1 from checkpoint + conv-2 + conv-3
    });

    it('should save checkpoint after each successful item', async () => {
      vi.mocked(loadCheckpoint).mockResolvedValue(null);
      vi.mocked(saveCheckpoint).mockResolvedValue(undefined);

      const processFn = vi.fn().mockResolvedValue(undefined);

      await resumeBatchProcessing(mockJobId, allItems, processFn);

      // Should save checkpoint 3 times (once per item)
      expect(saveCheckpoint).toHaveBeenCalledTimes(3);
    });

    it('should handle failed items and continue processing', async () => {
      vi.mocked(loadCheckpoint).mockResolvedValue(null);
      vi.mocked(saveCheckpoint).mockResolvedValue(undefined);

      // Fail on second item
      const processFn = vi.fn()
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Processing failed'))
        .mockResolvedValueOnce(undefined);

      const result = await resumeBatchProcessing(mockJobId, allItems, processFn);

      expect(result.completed).toHaveLength(2); // conv-1 and conv-3
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].itemId).toBe('conv-2');
      expect(result.failed[0].error).toBe('Processing failed');
    });

    it('should call onProgress callback with correct counts', async () => {
      vi.mocked(loadCheckpoint).mockResolvedValue(null);
      vi.mocked(saveCheckpoint).mockResolvedValue(undefined);

      const processFn = vi.fn().mockResolvedValue(undefined);
      const onProgress = vi.fn();

      await resumeBatchProcessing(mockJobId, allItems, processFn, onProgress);

      expect(onProgress).toHaveBeenCalledTimes(3);
      expect(onProgress).toHaveBeenNthCalledWith(1, {
        completed: 1,
        failed: 0,
        total: 3,
      });
      expect(onProgress).toHaveBeenNthCalledWith(2, {
        completed: 2,
        failed: 0,
        total: 3,
      });
      expect(onProgress).toHaveBeenNthCalledWith(3, {
        completed: 3,
        failed: 0,
        total: 3,
      });
    });

    it('should include checkpoint data in final result', async () => {
      const checkpoint: BatchCheckpoint = {
        id: 'checkpoint-1',
        jobId: mockJobId,
        completedItems: ['conv-1'],
        failedItems: [
          { itemId: 'conv-2', error: 'Previous error', timestamp: '2025-11-04T09:00:00Z' },
        ],
        progressPercentage: 33,
        lastCheckpointAt: '2025-11-04T10:00:00Z',
        createdAt: '2025-11-04T09:00:00Z',
        updatedAt: '2025-11-04T10:00:00Z',
      };

      vi.mocked(loadCheckpoint).mockResolvedValue(checkpoint);
      vi.mocked(saveCheckpoint).mockResolvedValue(undefined);

      const processFn = vi.fn().mockResolvedValue(undefined);

      const result = await resumeBatchProcessing(mockJobId, allItems, processFn);

      // Should include conv-1 from checkpoint
      expect(result.completed).toContain('conv-1');
      // Should include conv-2 failure from checkpoint
      expect(result.failed.some(f => f.itemId === 'conv-2')).toBe(true);
    });
  });
});

