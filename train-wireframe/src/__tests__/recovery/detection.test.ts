/**
 * Unit tests for recovery detection
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  detectRecoverableData, 
  filterItemsByType, 
  getStatusCounts 
} from '@/lib/recovery/detection';
import {
  RecoverableItemType,
  RecoveryStatus,
  RecoverableItem,
} from '@/lib/recovery/types';
import * as autoSaveStorage from '@/lib/auto-save/storage';
import * as batchCheckpoint from '@/lib/batch/checkpoint';
import { supabase } from '@/utils/supabase/client';

// Mock dependencies
vi.mock('@/lib/auto-save/storage');
vi.mock('@/lib/batch/checkpoint');
vi.mock('@/utils/supabase/client');
vi.mock('@/lib/errors/error-logger');

describe('Recovery Detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('detectRecoverableData', () => {
    it('should detect drafts from auto-save storage', async () => {
      // Mock draft detection
      const mockDrafts = [
        {
          id: 'draft-1',
          topic: 'Test Draft',
          turns: [{ role: 'user', content: 'test' }],
          updatedAt: new Date().toISOString(),
        },
      ];
      
      vi.mocked(autoSaveStorage.detectDrafts).mockResolvedValue(mockDrafts as any);
      vi.mocked(batchCheckpoint.getIncompleteCheckpoints).mockResolvedValue([]);
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      } as any);

      const items = await detectRecoverableData();

      expect(items).toHaveLength(1);
      expect(items[0].type).toBe(RecoverableItemType.DRAFT_CONVERSATION);
      expect(items[0].description).toContain('Test Draft');
    });

    it('should detect incomplete batches from checkpoints', async () => {
      // Mock batch detection
      const mockCheckpoints = [
        {
          jobId: 'batch-1',
          completedItems: ['item1', 'item2'],
          failedItems: [],
          progressPercentage: 50,
          lastCheckpointAt: new Date().toISOString(),
        },
      ];

      vi.mocked(autoSaveStorage.detectDrafts).mockResolvedValue([]);
      vi.mocked(batchCheckpoint.getIncompleteCheckpoints).mockResolvedValue(mockCheckpoints as any);
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      } as any);

      const items = await detectRecoverableData();

      expect(items).toHaveLength(1);
      expect(items[0].type).toBe(RecoverableItemType.INCOMPLETE_BATCH);
      expect(items[0].description).toContain('50%');
    });

    it('should detect available backups from database', async () => {
      const mockBackups = [
        {
          backup_id: 'backup-1',
          conversation_ids: ['conv1', 'conv2'],
          backup_reason: 'Pre-delete backup',
          expires_at: new Date(Date.now() + 86400000).toISOString(),
          created_at: new Date().toISOString(),
          file_path: '/backups/backup-1.json',
        },
      ];

      vi.mocked(autoSaveStorage.detectDrafts).mockResolvedValue([]);
      vi.mocked(batchCheckpoint.getIncompleteCheckpoints).mockResolvedValue([]);
      
      const mockFrom = vi.fn();
      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'backup_exports') {
          return {
            select: vi.fn().mockReturnThis(),
            gt: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockBackups, error: null }),
          } as any;
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        } as any;
      });

      const items = await detectRecoverableData();

      expect(items).toHaveLength(1);
      expect(items[0].type).toBe(RecoverableItemType.AVAILABLE_BACKUP);
      expect(items[0].description).toContain('2 conversations');
    });

    it('should detect failed exports from database', async () => {
      const mockExports = [
        {
          id: 'export-1',
          conversation_ids: ['conv1'],
          format: 'csv',
          status: 'failed',
          error_message: 'Network error',
          created_at: new Date().toISOString(),
        },
      ];

      vi.mocked(autoSaveStorage.detectDrafts).mockResolvedValue([]);
      vi.mocked(batchCheckpoint.getIncompleteCheckpoints).mockResolvedValue([]);

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'exports') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: mockExports, error: null }),
          } as any;
        }
        return {
          select: vi.fn().mockReturnThis(),
          gt: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        } as any;
      });

      const items = await detectRecoverableData();

      expect(items).toHaveLength(1);
      expect(items[0].type).toBe(RecoverableItemType.FAILED_EXPORT);
      expect(items[0].description).toContain('CSV');
    });

    it('should sort items by priority (highest first)', async () => {
      const oldDate = new Date(Date.now() - 86400000).toISOString(); // 1 day ago
      const newDate = new Date().toISOString();

      const mockDrafts = [
        {
          id: 'draft-old',
          topic: 'Old Draft',
          turns: Array(20).fill({ role: 'user', content: 'test' }), // More work
          updatedAt: oldDate,
        },
        {
          id: 'draft-new',
          topic: 'New Draft',
          turns: [{ role: 'user', content: 'test' }], // Less work
          updatedAt: newDate,
        },
      ];

      vi.mocked(autoSaveStorage.detectDrafts).mockResolvedValue(mockDrafts as any);
      vi.mocked(batchCheckpoint.getIncompleteCheckpoints).mockResolvedValue([]);
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      } as any);

      const items = await detectRecoverableData();

      expect(items).toHaveLength(2);
      // New draft should have higher priority due to recency
      expect(items[0].description).toContain('New Draft');
      expect(items[0].priority).toBeGreaterThan(items[1].priority);
    });

    it('should handle errors gracefully and return empty array', async () => {
      vi.mocked(autoSaveStorage.detectDrafts).mockRejectedValue(new Error('Storage error'));
      vi.mocked(batchCheckpoint.getIncompleteCheckpoints).mockRejectedValue(new Error('DB error'));
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: new Error('Query error') }),
      } as any);

      const items = await detectRecoverableData();

      expect(items).toEqual([]);
    });
  });

  describe('filterItemsByType', () => {
    it('should filter items by type', () => {
      const items: RecoverableItem[] = [
        {
          id: '1',
          type: RecoverableItemType.DRAFT_CONVERSATION,
          timestamp: new Date().toISOString(),
          description: 'Draft',
          priority: 50,
          data: {},
          status: RecoveryStatus.PENDING,
        },
        {
          id: '2',
          type: RecoverableItemType.INCOMPLETE_BATCH,
          timestamp: new Date().toISOString(),
          description: 'Batch',
          priority: 60,
          data: {},
          status: RecoveryStatus.PENDING,
        },
        {
          id: '3',
          type: RecoverableItemType.DRAFT_CONVERSATION,
          timestamp: new Date().toISOString(),
          description: 'Draft 2',
          priority: 70,
          data: {},
          status: RecoveryStatus.PENDING,
        },
      ];

      const drafts = filterItemsByType(items, RecoverableItemType.DRAFT_CONVERSATION);

      expect(drafts).toHaveLength(2);
      expect(drafts.every(item => item.type === RecoverableItemType.DRAFT_CONVERSATION)).toBe(true);
    });
  });

  describe('getStatusCounts', () => {
    it('should count items by status', () => {
      const items: RecoverableItem[] = [
        { 
          id: '1', 
          status: RecoveryStatus.PENDING,
          type: RecoverableItemType.DRAFT_CONVERSATION,
          timestamp: new Date().toISOString(),
          description: 'Item 1',
          priority: 50,
          data: {},
        },
        { 
          id: '2', 
          status: RecoveryStatus.SUCCESS,
          type: RecoverableItemType.DRAFT_CONVERSATION,
          timestamp: new Date().toISOString(),
          description: 'Item 2',
          priority: 50,
          data: {},
        },
        { 
          id: '3', 
          status: RecoveryStatus.SUCCESS,
          type: RecoverableItemType.DRAFT_CONVERSATION,
          timestamp: new Date().toISOString(),
          description: 'Item 3',
          priority: 50,
          data: {},
        },
        { 
          id: '4', 
          status: RecoveryStatus.FAILED,
          type: RecoverableItemType.DRAFT_CONVERSATION,
          timestamp: new Date().toISOString(),
          description: 'Item 4',
          priority: 50,
          data: {},
        },
      ];

      const counts = getStatusCounts(items);

      expect(counts[RecoveryStatus.PENDING]).toBe(1);
      expect(counts[RecoveryStatus.SUCCESS]).toBe(2);
      expect(counts[RecoveryStatus.FAILED]).toBe(1);
      expect(counts[RecoveryStatus.RECOVERING]).toBe(0);
      expect(counts[RecoveryStatus.SKIPPED]).toBe(0);
    });
  });
});

