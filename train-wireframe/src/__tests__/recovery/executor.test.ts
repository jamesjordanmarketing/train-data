/**
 * Unit tests for recovery executor
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { recoverItem, recoverItems } from '@/lib/recovery/executor';
import {
  RecoverableItem,
  RecoverableItemType,
  RecoveryStatus,
  DraftRecoveryData,
  BatchRecoveryData,
  BackupRecoveryData,
  ExportRecoveryData,
} from '@/lib/recovery/types';
import * as autoSaveStorage from '@/lib/auto-save/storage';
import * as batchCheckpoint from '@/lib/batch/checkpoint';

// Mock dependencies
vi.mock('@/lib/auto-save/storage');
vi.mock('@/lib/batch/checkpoint');
vi.mock('@/lib/batch/processor');
vi.mock('@/lib/errors/error-logger');

describe('Recovery Executor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('recoverItem', () => {
    it('should recover draft conversation successfully', async () => {
      const draftData: DraftRecoveryData = {
        draftId: 'draft-1',
        conversationId: 'conv-1',
        topic: 'Test Draft',
        turns: 5,
        lastSaved: new Date().toISOString(),
      };

      const item: RecoverableItem = {
        id: 'draft-draft-1',
        type: RecoverableItemType.DRAFT_CONVERSATION,
        timestamp: new Date().toISOString(),
        description: 'Draft: "Test Draft" (5 turns)',
        priority: 80,
        data: draftData,
        status: RecoveryStatus.PENDING,
      };

      vi.mocked(autoSaveStorage.deleteDraft).mockResolvedValue(undefined);

      const result = await recoverItem(item);

      expect(result.success).toBe(true);
      expect(result.itemId).toBe(item.id);
      expect(autoSaveStorage.deleteDraft).toHaveBeenCalledWith('draft-1');
    });

    it('should recover incomplete batch successfully', async () => {
      const batchData: BatchRecoveryData = {
        jobId: 'batch-1',
        totalItems: 100,
        completedItems: 50,
        failedItems: 5,
        progressPercentage: 50,
        lastCheckpoint: new Date().toISOString(),
      };

      const item: RecoverableItem = {
        id: 'batch-batch-1',
        type: RecoverableItemType.INCOMPLETE_BATCH,
        timestamp: new Date().toISOString(),
        description: 'Batch job: 50% complete',
        priority: 70,
        data: batchData,
        status: RecoveryStatus.PENDING,
      };

      vi.mocked(batchCheckpoint.cleanupCheckpoint).mockResolvedValue(undefined);

      const result = await recoverItem(item);

      expect(result.success).toBe(true);
      expect(result.itemId).toBe(item.id);
      expect(batchCheckpoint.cleanupCheckpoint).toHaveBeenCalledWith('batch-1');
    });

    it('should recover backup successfully', async () => {
      const backupData: BackupRecoveryData = {
        backupId: 'backup-1',
        conversationCount: 10,
        backupReason: 'Pre-delete backup',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        filePath: '/backups/backup-1.json',
      };

      const item: RecoverableItem = {
        id: 'backup-backup-1',
        type: RecoverableItemType.AVAILABLE_BACKUP,
        timestamp: new Date().toISOString(),
        description: 'Backup: 10 conversations',
        priority: 60,
        data: backupData,
        status: RecoveryStatus.PENDING,
      };

      const result = await recoverItem(item);

      expect(result.success).toBe(true);
      expect(result.itemId).toBe(item.id);
      expect(result.recoveredData).toEqual({
        backupId: 'backup-1',
        conversationCount: 10,
      });
    });

    it('should recover failed export successfully', async () => {
      const exportData: ExportRecoveryData = {
        exportId: 'export-1',
        format: 'csv',
        conversationCount: 5,
        failureReason: 'Network error',
        canRetry: true,
      };

      const item: RecoverableItem = {
        id: 'export-export-1',
        type: RecoverableItemType.FAILED_EXPORT,
        timestamp: new Date().toISOString(),
        description: 'Failed export: 5 conversations to CSV',
        priority: 50,
        data: exportData,
        status: RecoveryStatus.PENDING,
      };

      const result = await recoverItem(item);

      expect(result.success).toBe(true);
      expect(result.itemId).toBe(item.id);
      expect(result.recoveredData).toEqual({
        exportId: 'export-1',
        format: 'csv',
      });
    });

    it('should handle draft recovery failure', async () => {
      const draftData: DraftRecoveryData = {
        draftId: 'draft-1',
        topic: 'Test Draft',
        turns: 5,
        lastSaved: new Date().toISOString(),
      };

      const item: RecoverableItem = {
        id: 'draft-draft-1',
        type: RecoverableItemType.DRAFT_CONVERSATION,
        timestamp: new Date().toISOString(),
        description: 'Draft: "Test Draft" (5 turns)',
        priority: 80,
        data: draftData,
        status: RecoveryStatus.PENDING,
      };

      vi.mocked(autoSaveStorage.deleteDraft).mockRejectedValue(new Error('Storage error'));

      const result = await recoverItem(item);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Storage error');
    });

    it('should handle unknown recovery type', async () => {
      const item: RecoverableItem = {
        id: 'unknown-1',
        type: 'UNKNOWN_TYPE' as any,
        timestamp: new Date().toISOString(),
        description: 'Unknown item',
        priority: 50,
        data: {},
        status: RecoveryStatus.PENDING,
      };

      const result = await recoverItem(item);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown recovery type');
    });
  });

  describe('recoverItems', () => {
    it('should recover multiple items in sequence', async () => {
      const items: RecoverableItem[] = [
        {
          id: 'draft-1',
          type: RecoverableItemType.DRAFT_CONVERSATION,
          timestamp: new Date().toISOString(),
          description: 'Draft 1',
          priority: 80,
          data: { draftId: 'draft-1', topic: 'Test', turns: 5, lastSaved: new Date().toISOString() },
          status: RecoveryStatus.PENDING,
        },
        {
          id: 'batch-1',
          type: RecoverableItemType.INCOMPLETE_BATCH,
          timestamp: new Date().toISOString(),
          description: 'Batch 1',
          priority: 70,
          data: { 
            jobId: 'batch-1', 
            totalItems: 100,
            completedItems: 50,
            failedItems: 5,
            progressPercentage: 50,
            lastCheckpoint: new Date().toISOString() 
          },
          status: RecoveryStatus.PENDING,
        },
      ];

      vi.mocked(autoSaveStorage.deleteDraft).mockResolvedValue(undefined);
      vi.mocked(batchCheckpoint.cleanupCheckpoint).mockResolvedValue(undefined);

      const summary = await recoverItems(items);

      expect(summary.totalItems).toBe(2);
      expect(summary.successCount).toBe(2);
      expect(summary.failedCount).toBe(0);
      expect(summary.skippedCount).toBe(0);
    });

    it('should handle partial recovery (some succeed, some fail)', async () => {
      const items: RecoverableItem[] = [
        {
          id: 'draft-1',
          type: RecoverableItemType.DRAFT_CONVERSATION,
          timestamp: new Date().toISOString(),
          description: 'Draft 1',
          priority: 80,
          data: { draftId: 'draft-1', topic: 'Test', turns: 5, lastSaved: new Date().toISOString() },
          status: RecoveryStatus.PENDING,
        },
        {
          id: 'draft-2',
          type: RecoverableItemType.DRAFT_CONVERSATION,
          timestamp: new Date().toISOString(),
          description: 'Draft 2',
          priority: 70,
          data: { draftId: 'draft-2', topic: 'Test 2', turns: 3, lastSaved: new Date().toISOString() },
          status: RecoveryStatus.PENDING,
        },
      ];

      vi.mocked(autoSaveStorage.deleteDraft)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Storage error'));

      const summary = await recoverItems(items);

      expect(summary.totalItems).toBe(2);
      expect(summary.successCount).toBe(1);
      expect(summary.failedCount).toBe(1);
      expect(summary.skippedCount).toBe(0);
    });

    it('should skip items marked as skipped', async () => {
      const items: RecoverableItem[] = [
        {
          id: 'draft-1',
          type: RecoverableItemType.DRAFT_CONVERSATION,
          timestamp: new Date().toISOString(),
          description: 'Draft 1',
          priority: 80,
          data: { draftId: 'draft-1', topic: 'Test', turns: 5, lastSaved: new Date().toISOString() },
          status: RecoveryStatus.PENDING,
        },
        {
          id: 'draft-2',
          type: RecoverableItemType.DRAFT_CONVERSATION,
          timestamp: new Date().toISOString(),
          description: 'Draft 2',
          priority: 70,
          data: { draftId: 'draft-2', topic: 'Test 2', turns: 3, lastSaved: new Date().toISOString() },
          status: RecoveryStatus.SKIPPED,
        },
      ];

      vi.mocked(autoSaveStorage.deleteDraft).mockResolvedValue(undefined);

      const summary = await recoverItems(items);

      expect(summary.totalItems).toBe(2);
      expect(summary.successCount).toBe(1);
      expect(summary.failedCount).toBe(0);
      expect(summary.skippedCount).toBe(1);
      expect(autoSaveStorage.deleteDraft).toHaveBeenCalledTimes(1);
    });

    it('should call progress callback for each item', async () => {
      const items: RecoverableItem[] = [
        {
          id: 'draft-1',
          type: RecoverableItemType.DRAFT_CONVERSATION,
          timestamp: new Date().toISOString(),
          description: 'Draft 1',
          priority: 80,
          data: { draftId: 'draft-1', topic: 'Test', turns: 5, lastSaved: new Date().toISOString() },
          status: RecoveryStatus.PENDING,
        },
        {
          id: 'draft-2',
          type: RecoverableItemType.DRAFT_CONVERSATION,
          timestamp: new Date().toISOString(),
          description: 'Draft 2',
          priority: 70,
          data: { draftId: 'draft-2', topic: 'Test 2', turns: 3, lastSaved: new Date().toISOString() },
          status: RecoveryStatus.PENDING,
        },
      ];

      vi.mocked(autoSaveStorage.deleteDraft).mockResolvedValue(undefined);

      const progressCallback = vi.fn();
      await recoverItems(items, progressCallback);

      expect(progressCallback).toHaveBeenCalledTimes(2);
      expect(progressCallback).toHaveBeenNthCalledWith(1, expect.any(Object), 50);
      expect(progressCallback).toHaveBeenNthCalledWith(2, expect.any(Object), 100);
    });

    it('should update item status during recovery', async () => {
      const items: RecoverableItem[] = [
        {
          id: 'draft-1',
          type: RecoverableItemType.DRAFT_CONVERSATION,
          timestamp: new Date().toISOString(),
          description: 'Draft 1',
          priority: 80,
          data: { draftId: 'draft-1', topic: 'Test', turns: 5, lastSaved: new Date().toISOString() },
          status: RecoveryStatus.PENDING,
        },
      ];

      vi.mocked(autoSaveStorage.deleteDraft).mockResolvedValue(undefined);

      await recoverItems(items);

      expect(items[0].status).toBe(RecoveryStatus.SUCCESS);
    });
  });
});

