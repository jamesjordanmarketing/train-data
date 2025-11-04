/**
 * Integration tests for complete recovery flows
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { detectRecoverableData } from '@/lib/recovery/detection';
import { recoverItems } from '@/lib/recovery/executor';
import {
  RecoverableItemType,
  RecoveryStatus,
} from '@/lib/recovery/types';
import * as autoSaveStorage from '@/lib/auto-save/storage';
import * as batchCheckpoint from '@/lib/batch/checkpoint';
import { supabase } from '@/utils/supabase/client';

// Mock dependencies
vi.mock('@/lib/auto-save/storage');
vi.mock('@/lib/batch/checkpoint');
vi.mock('@/lib/batch/processor');
vi.mock('@/utils/supabase/client');
vi.mock('@/lib/errors/error-logger');

describe('Recovery Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('End-to-End Draft Recovery', () => {
    it('should detect and recover draft conversations successfully', async () => {
      // Setup: Mock draft detection
      const mockDrafts = [
        {
          id: 'draft-1',
          topic: 'Test Draft 1',
          turns: [
            { role: 'user', content: 'Hello' },
            { role: 'assistant', content: 'Hi there!' },
          ],
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'draft-2',
          topic: 'Test Draft 2',
          turns: [
            { role: 'user', content: 'How are you?' },
          ],
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

      // Step 1: Detect recoverable items
      const items = await detectRecoverableData();

      expect(items).toHaveLength(2);
      expect(items.every(item => item.type === RecoverableItemType.DRAFT_CONVERSATION)).toBe(true);

      // Step 2: Mock successful recovery
      vi.mocked(autoSaveStorage.deleteDraft).mockResolvedValue(undefined);

      // Step 3: Execute recovery
      const summary = await recoverItems(items);

      // Step 4: Verify results
      expect(summary.successCount).toBe(2);
      expect(summary.failedCount).toBe(0);
      expect(autoSaveStorage.deleteDraft).toHaveBeenCalledTimes(2);
      expect(autoSaveStorage.deleteDraft).toHaveBeenCalledWith('draft-1');
      expect(autoSaveStorage.deleteDraft).toHaveBeenCalledWith('draft-2');
    });

    it('should handle draft recovery with conflicts', async () => {
      const mockDrafts = [
        {
          id: 'draft-1',
          topic: 'Conflicting Draft',
          turns: [{ role: 'user', content: 'Test' }],
          updatedAt: new Date().toISOString(),
          conflictsWith: 'conv-123',
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
      const draftData = items[0].data as any;
      expect(draftData.conflictsWith).toBe('conv-123');
    });
  });

  describe('End-to-End Batch Resume', () => {
    it('should detect and resume incomplete batch jobs', async () => {
      // Setup: Mock batch checkpoint detection
      const mockCheckpoints = [
        {
          jobId: 'batch-1',
          completedItems: ['item1', 'item2', 'item3'],
          failedItems: ['item4'],
          progressPercentage: 40,
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

      // Step 1: Detect recoverable items
      const items = await detectRecoverableData();

      expect(items).toHaveLength(1);
      expect(items[0].type).toBe(RecoverableItemType.INCOMPLETE_BATCH);

      // Step 2: Mock successful cleanup
      vi.mocked(batchCheckpoint.cleanupCheckpoint).mockResolvedValue(undefined);

      // Step 3: Execute recovery
      const summary = await recoverItems(items);

      // Step 4: Verify results
      expect(summary.successCount).toBe(1);
      expect(summary.failedCount).toBe(0);
      expect(batchCheckpoint.cleanupCheckpoint).toHaveBeenCalledWith('batch-1');
    });
  });

  describe('End-to-End Backup Restore', () => {
    it('should detect and restore from backups', async () => {
      const mockBackups = [
        {
          backup_id: 'backup-1',
          conversation_ids: ['conv1', 'conv2', 'conv3'],
          backup_reason: 'Pre-delete backup',
          expires_at: new Date(Date.now() + 86400000).toISOString(),
          created_at: new Date().toISOString(),
          file_path: '/backups/backup-1.json',
        },
      ];

      vi.mocked(autoSaveStorage.detectDrafts).mockResolvedValue([]);
      vi.mocked(batchCheckpoint.getIncompleteCheckpoints).mockResolvedValue([]);
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

      // Step 1: Detect recoverable items
      const items = await detectRecoverableData();

      expect(items).toHaveLength(1);
      expect(items[0].type).toBe(RecoverableItemType.AVAILABLE_BACKUP);

      // Step 2: Execute recovery
      const summary = await recoverItems(items);

      // Step 3: Verify results
      expect(summary.successCount).toBe(1);
      expect(summary.failedCount).toBe(0);
    });

    it('should ignore expired backups', async () => {
      const mockBackups = [
        {
          backup_id: 'backup-1',
          conversation_ids: ['conv1', 'conv2'],
          backup_reason: 'Pre-delete backup',
          expires_at: new Date(Date.now() - 86400000).toISOString(), // Expired
          created_at: new Date().toISOString(),
          file_path: '/backups/backup-1.json',
        },
      ];

      vi.mocked(autoSaveStorage.detectDrafts).mockResolvedValue([]);
      vi.mocked(batchCheckpoint.getIncompleteCheckpoints).mockResolvedValue([]);
      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'backup_exports') {
          return {
            select: vi.fn().mockReturnThis(),
            gt: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: [], error: null }), // Empty because expired
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

      expect(items).toHaveLength(0);
    });
  });

  describe('Mixed Recovery Scenarios', () => {
    it('should handle recovery with mixed item types', async () => {
      // Setup: Mixed recoverable items
      const mockDrafts = [
        {
          id: 'draft-1',
          topic: 'Test Draft',
          turns: [{ role: 'user', content: 'Hello' }],
          updatedAt: new Date().toISOString(),
        },
      ];

      const mockCheckpoints = [
        {
          jobId: 'batch-1',
          completedItems: ['item1'],
          failedItems: [],
          progressPercentage: 50,
          lastCheckpointAt: new Date().toISOString(),
        },
      ];

      const mockBackups = [
        {
          backup_id: 'backup-1',
          conversation_ids: ['conv1'],
          backup_reason: 'Pre-delete backup',
          expires_at: new Date(Date.now() + 86400000).toISOString(),
          created_at: new Date().toISOString(),
          file_path: '/backups/backup-1.json',
        },
      ];

      vi.mocked(autoSaveStorage.detectDrafts).mockResolvedValue(mockDrafts as any);
      vi.mocked(batchCheckpoint.getIncompleteCheckpoints).mockResolvedValue(mockCheckpoints as any);
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

      // Step 1: Detect all recoverable items
      const items = await detectRecoverableData();

      expect(items).toHaveLength(3);
      expect(items.some(item => item.type === RecoverableItemType.DRAFT_CONVERSATION)).toBe(true);
      expect(items.some(item => item.type === RecoverableItemType.INCOMPLETE_BATCH)).toBe(true);
      expect(items.some(item => item.type === RecoverableItemType.AVAILABLE_BACKUP)).toBe(true);

      // Step 2: Mock successful recovery for all types
      vi.mocked(autoSaveStorage.deleteDraft).mockResolvedValue(undefined);
      vi.mocked(batchCheckpoint.cleanupCheckpoint).mockResolvedValue(undefined);

      // Step 3: Execute recovery
      const summary = await recoverItems(items);

      // Step 4: Verify results
      expect(summary.successCount).toBe(3);
      expect(summary.failedCount).toBe(0);
    });

    it('should handle partial recovery with failures', async () => {
      const mockDrafts = [
        {
          id: 'draft-1',
          topic: 'Test Draft 1',
          turns: [{ role: 'user', content: 'Hello' }],
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'draft-2',
          topic: 'Test Draft 2',
          turns: [{ role: 'user', content: 'Hi' }],
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

      // Mock one success and one failure
      vi.mocked(autoSaveStorage.deleteDraft)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Storage error'));

      const summary = await recoverItems(items);

      expect(summary.successCount).toBe(1);
      expect(summary.failedCount).toBe(1);
      expect(summary.results).toHaveLength(2);
      expect(summary.results[0].success).toBe(true);
      expect(summary.results[1].success).toBe(false);
      expect(summary.results[1].error).toBe('Storage error');
    });

    it('should respect skipped items', async () => {
      const mockDrafts = [
        {
          id: 'draft-1',
          topic: 'Test Draft 1',
          turns: [{ role: 'user', content: 'Hello' }],
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'draft-2',
          topic: 'Test Draft 2',
          turns: [{ role: 'user', content: 'Hi' }],
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

      // Mark second item as skipped
      items[1].status = RecoveryStatus.SKIPPED;

      vi.mocked(autoSaveStorage.deleteDraft).mockResolvedValue(undefined);

      const summary = await recoverItems(items);

      expect(summary.successCount).toBe(1);
      expect(summary.failedCount).toBe(0);
      expect(summary.skippedCount).toBe(1);
      expect(autoSaveStorage.deleteDraft).toHaveBeenCalledTimes(1);
      expect(autoSaveStorage.deleteDraft).toHaveBeenCalledWith('draft-1');
    });
  });

  describe('Priority Sorting', () => {
    it('should prioritize recent items with more work', async () => {
      const now = Date.now();
      const recentTime = new Date(now - 1000 * 60 * 30).toISOString(); // 30 min ago
      const oldTime = new Date(now - 1000 * 60 * 60 * 24).toISOString(); // 1 day ago

      const mockDrafts = [
        {
          id: 'draft-old-small',
          topic: 'Old Small Draft',
          turns: [{ role: 'user', content: 'test' }], // 1 turn
          updatedAt: oldTime,
        },
        {
          id: 'draft-recent-large',
          topic: 'Recent Large Draft',
          turns: Array(15).fill({ role: 'user', content: 'test' }), // 15 turns
          updatedAt: recentTime,
        },
        {
          id: 'draft-old-large',
          topic: 'Old Large Draft',
          turns: Array(20).fill({ role: 'user', content: 'test' }), // 20 turns
          updatedAt: oldTime,
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

      // Recent large draft should have highest priority
      expect(items[0].description).toContain('Recent Large Draft');
      expect(items[0].priority).toBeGreaterThan(items[1].priority);
      expect(items[0].priority).toBeGreaterThan(items[2].priority);
    });
  });
});

