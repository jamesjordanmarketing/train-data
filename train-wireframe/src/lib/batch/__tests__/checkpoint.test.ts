import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  saveCheckpoint,
  loadCheckpoint,
  cleanupCheckpoint,
  getIncompleteCheckpoints,
  calculateProgress,
  BatchCheckpoint,
} from '../checkpoint';
import { supabase } from '@/utils/supabase/client';
import { withTransaction } from '../../../../../../src/lib/database/transaction';

// Mock dependencies
vi.mock('@/utils/supabase/client');
vi.mock('../../../../../../src/lib/database/transaction');
vi.mock('../../errors/error-logger');

describe('Batch Checkpoint System', () => {
  const mockJobId = 'test-job-123';
  const mockCompletedItems = ['conv-1', 'conv-2', 'conv-3'];
  const mockFailedItems = [
    { itemId: 'conv-4', error: 'Rate limit exceeded', timestamp: '2025-11-04T10:00:00Z' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('saveCheckpoint', () => {
    it('should save checkpoint with correct progress percentage', async () => {
      const totalItems = 10;
      const expectedProgress = Math.round(((3 + 1) / 10) * 100); // 40%

      const mockUpsert = vi.fn().mockReturnValue({
        error: null,
      });

      vi.mocked(withTransaction).mockImplementation(async (callback) => {
        await callback({
          client: {
            from: vi.fn().mockReturnValue({
              upsert: mockUpsert,
            }),
          } as any,
        });
      });

      await saveCheckpoint(mockJobId, mockCompletedItems, mockFailedItems, totalItems);

      expect(withTransaction).toHaveBeenCalled();
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          job_id: mockJobId,
          completed_items: mockCompletedItems,
          failed_items: mockFailedItems,
          progress_percentage: expectedProgress,
        }),
        { onConflict: 'job_id' }
      );
    });

    it('should throw DatabaseError if upsert fails', async () => {
      const mockError = new Error('Database error');

      vi.mocked(withTransaction).mockImplementation(async (callback) => {
        await callback({
          client: {
            from: vi.fn().mockReturnValue({
              upsert: vi.fn().mockReturnValue({
                error: mockError,
              }),
            }),
          } as any,
        });
      });

      await expect(
        saveCheckpoint(mockJobId, mockCompletedItems, mockFailedItems, 10)
      ).rejects.toThrow();
    });

    it('should calculate 100% progress when all items are complete', async () => {
      const totalItems = 5;
      const completedItems = ['conv-1', 'conv-2', 'conv-3', 'conv-4', 'conv-5'];

      const mockUpsert = vi.fn().mockReturnValue({ error: null });

      vi.mocked(withTransaction).mockImplementation(async (callback) => {
        await callback({
          client: {
            from: vi.fn().mockReturnValue({
              upsert: mockUpsert,
            }),
          } as any,
        });
      });

      await saveCheckpoint(mockJobId, completedItems, [], totalItems);

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          progress_percentage: 100,
        }),
        expect.anything()
      );
    });
  });

  describe('loadCheckpoint', () => {
    it('should load checkpoint successfully', async () => {
      const mockCheckpointData = {
        id: 'checkpoint-1',
        job_id: mockJobId,
        completed_items: mockCompletedItems,
        failed_items: mockFailedItems,
        progress_percentage: 40,
        last_checkpoint_at: '2025-11-04T10:00:00Z',
        created_at: '2025-11-04T09:00:00Z',
        updated_at: '2025-11-04T10:00:00Z',
      };

      vi.mocked(supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockCheckpointData,
              error: null,
            }),
          }),
        }),
      });

      const result = await loadCheckpoint(mockJobId);

      expect(result).toEqual({
        id: mockCheckpointData.id,
        jobId: mockCheckpointData.job_id,
        completedItems: mockCheckpointData.completed_items,
        failedItems: mockCheckpointData.failed_items,
        progressPercentage: mockCheckpointData.progress_percentage,
        lastCheckpointAt: mockCheckpointData.last_checkpoint_at,
        createdAt: mockCheckpointData.created_at,
        updatedAt: mockCheckpointData.updated_at,
      });
    });

    it('should return null if checkpoint does not exist', async () => {
      vi.mocked(supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }),
        }),
      });

      const result = await loadCheckpoint(mockJobId);

      expect(result).toBeNull();
    });

    it('should throw error for database errors other than not found', async () => {
      const mockError = { code: 'SOME_ERROR', message: 'Database error' };

      vi.mocked(supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      await expect(loadCheckpoint(mockJobId)).rejects.toThrow();
    });
  });

  describe('cleanupCheckpoint', () => {
    it('should delete checkpoint successfully', async () => {
      const mockDelete = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(supabase.from as any).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: mockDelete,
        }),
      });

      await cleanupCheckpoint(mockJobId);

      expect(mockDelete).toHaveBeenCalledWith(mockJobId);
    });

    it('should not throw error if cleanup fails (non-critical)', async () => {
      const mockError = new Error('Delete failed');

      vi.mocked(supabase.from as any).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: mockError }),
        }),
      });

      // Should not throw, just log warning
      await expect(cleanupCheckpoint(mockJobId)).resolves.not.toThrow();
    });
  });

  describe('getIncompleteCheckpoints', () => {
    it('should return all incomplete checkpoints', async () => {
      const mockCheckpoints = [
        {
          id: 'checkpoint-1',
          job_id: 'job-1',
          completed_items: ['conv-1'],
          failed_items: [],
          progress_percentage: 50,
          last_checkpoint_at: '2025-11-04T10:00:00Z',
          created_at: '2025-11-04T09:00:00Z',
          updated_at: '2025-11-04T10:00:00Z',
        },
        {
          id: 'checkpoint-2',
          job_id: 'job-2',
          completed_items: ['conv-2', 'conv-3'],
          failed_items: [],
          progress_percentage: 75,
          last_checkpoint_at: '2025-11-04T11:00:00Z',
          created_at: '2025-11-04T10:00:00Z',
          updated_at: '2025-11-04T11:00:00Z',
        },
      ];

      vi.mocked(supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          lt: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockCheckpoints,
              error: null,
            }),
          }),
        }),
      });

      const result = await getIncompleteCheckpoints();

      expect(result).toHaveLength(2);
      expect(result[0].jobId).toBe('job-1');
      expect(result[1].jobId).toBe('job-2');
    });

    it('should return empty array if no incomplete checkpoints', async () => {
      vi.mocked(supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          lt: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      const result = await getIncompleteCheckpoints();

      expect(result).toEqual([]);
    });
  });

  describe('calculateProgress', () => {
    it('should calculate progress correctly', () => {
      const checkpoint: BatchCheckpoint = {
        id: 'checkpoint-1',
        jobId: mockJobId,
        completedItems: ['conv-1', 'conv-2', 'conv-3'],
        failedItems: [{ itemId: 'conv-4', error: 'Error', timestamp: '2025-11-04T10:00:00Z' }],
        progressPercentage: 40,
        lastCheckpointAt: '2025-11-04T10:00:00Z',
        createdAt: '2025-11-04T09:00:00Z',
        updatedAt: '2025-11-04T10:00:00Z',
      };

      const totalItems = 10;
      const progress = calculateProgress(checkpoint, totalItems);

      expect(progress.totalItems).toBe(10);
      expect(progress.completedItems).toBe(3);
      expect(progress.failedItems).toBe(1);
      expect(progress.pendingItems).toBe(6);
      expect(progress.progressPercentage).toBe(40);
    });

    it('should handle 100% completion', () => {
      const checkpoint: BatchCheckpoint = {
        id: 'checkpoint-1',
        jobId: mockJobId,
        completedItems: ['conv-1', 'conv-2', 'conv-3', 'conv-4', 'conv-5'],
        failedItems: [],
        progressPercentage: 100,
        lastCheckpointAt: '2025-11-04T10:00:00Z',
        createdAt: '2025-11-04T09:00:00Z',
        updatedAt: '2025-11-04T10:00:00Z',
      };

      const progress = calculateProgress(checkpoint, 5);

      expect(progress.completedItems).toBe(5);
      expect(progress.failedItems).toBe(0);
      expect(progress.pendingItems).toBe(0);
      expect(progress.progressPercentage).toBe(100);
    });
  });
});

