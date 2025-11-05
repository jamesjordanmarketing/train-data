import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createBackup,
  getBackup,
  cleanupExpiredBackups,
  getUserBackups,
  Backup,
  BackupData,
} from '../storage';
import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';

// Mock dependencies
vi.mock('@supabase/supabase-js');
vi.mock('fs/promises');
vi.mock('fs');
vi.mock('../../../@/lib/errors/error-logger');

describe('Backup Storage', () => {
  const mockUserId = 'user-123';
  const mockConversationIds = ['conv-1', 'conv-2', 'conv-3'];
  const mockConversations = [
    {
      id: 'conv-1',
      content: 'Conversation 1',
      conversation_turns: [],
    },
    {
      id: 'conv-2',
      content: 'Conversation 2',
      conversation_turns: [],
    },
    {
      id: 'conv-3',
      content: 'Conversation 3',
      conversation_turns: [],
    },
  ];

  let mockSupabaseClient: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Supabase client
    mockSupabaseClient = {
      from: vi.fn(),
      auth: {
        getUser: vi.fn(),
      },
    };

    vi.mocked(createClient).mockReturnValue(mockSupabaseClient as any);
    vi.mocked(existsSync).mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createBackup', () => {
    it('should create backup successfully', async () => {
      // Mock conversation fetch
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: mockConversations,
            error: null,
          }),
        }),
      });

      // Mock backup metadata insert
      const mockBackupRecord = {
        id: 'backup-uuid',
        backup_id: expect.stringContaining('backup-'),
        user_id: mockUserId,
        file_path: expect.stringContaining('.json'),
        conversation_ids: mockConversationIds,
        backup_reason: 'bulk_delete',
        expires_at: expect.any(String),
        created_at: expect.any(String),
      };

      mockSupabaseClient.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockBackupRecord,
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(mkdir).mockResolvedValue(undefined);
      vi.mocked(writeFile).mockResolvedValue(undefined);

      const result = await createBackup(mockConversationIds, mockUserId, 'bulk_delete');

      expect(result.backupId).toContain('backup-');
      expect(result.userId).toBe(mockUserId);
      expect(result.conversationIds).toEqual(mockConversationIds);
      expect(writeFile).toHaveBeenCalled();
    });

    it('should throw error if conversation fetch fails', async () => {
      const mockError = new Error('Database error');

      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      });

      await expect(
        createBackup(mockConversationIds, mockUserId)
      ).rejects.toThrow();
    });

    it('should create backup directory if it does not exist', async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: mockConversations,
            error: null,
          }),
        }),
      });

      const mockBackupRecord = {
        id: 'backup-uuid',
        backup_id: 'backup-123',
        user_id: mockUserId,
        file_path: '/backups/backup-123.json',
        conversation_ids: mockConversationIds,
        backup_reason: 'manual_backup',
        expires_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      mockSupabaseClient.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockBackupRecord,
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(mkdir).mockResolvedValue(undefined);
      vi.mocked(writeFile).mockResolvedValue(undefined);

      await createBackup(mockConversationIds, mockUserId);

      expect(mkdir).toHaveBeenCalledWith(
        expect.stringContaining('backups'),
        { recursive: true }
      );
    });

    it('should set expiration to 7 days from now', async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: mockConversations,
            error: null,
          }),
        }),
      });

      const now = new Date();
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const mockBackupRecord = {
        id: 'backup-uuid',
        backup_id: 'backup-123',
        user_id: mockUserId,
        file_path: '/backups/backup-123.json',
        conversation_ids: mockConversationIds,
        backup_reason: 'manual_backup',
        expires_at: sevenDaysLater.toISOString(),
        created_at: now.toISOString(),
      };

      mockSupabaseClient.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockBackupRecord,
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(mkdir).mockResolvedValue(undefined);
      vi.mocked(writeFile).mockResolvedValue(undefined);

      const result = await createBackup(mockConversationIds, mockUserId);

      const expiresAtDiff = result.expiresAt.getTime() - new Date().getTime();
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

      // Allow small time difference due to test execution time
      expect(expiresAtDiff).toBeGreaterThan(sevenDaysInMs - 10000);
      expect(expiresAtDiff).toBeLessThan(sevenDaysInMs + 10000);
    });
  });

  describe('getBackup', () => {
    it('should retrieve backup by ID', async () => {
      const mockBackupData = {
        id: 'backup-uuid',
        backup_id: 'backup-123',
        user_id: mockUserId,
        file_path: '/backups/backup-123.json',
        conversation_ids: mockConversationIds,
        backup_reason: 'bulk_delete',
        expires_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockBackupData,
              error: null,
            }),
          }),
        }),
      });

      const result = await getBackup('backup-123');

      expect(result).not.toBeNull();
      expect(result?.backupId).toBe('backup-123');
      expect(result?.userId).toBe(mockUserId);
    });

    it('should return null if backup not found', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }),
        }),
      });

      const result = await getBackup('nonexistent-backup');

      expect(result).toBeNull();
    });

    it('should throw error for database errors', async () => {
      const mockError = { code: 'SOME_ERROR', message: 'Database error' };

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      await expect(getBackup('backup-123')).rejects.toThrow();
    });
  });

  describe('cleanupExpiredBackups', () => {
    it('should delete expired backups', async () => {
      const expiredBackups = [
        {
          id: 'backup-1',
          backup_id: 'backup-old-1',
          file_path: '/backups/backup-old-1.json',
          expires_at: new Date(Date.now() - 1000).toISOString(),
        },
        {
          id: 'backup-2',
          backup_id: 'backup-old-2',
          file_path: '/backups/backup-old-2.json',
          expires_at: new Date(Date.now() - 2000).toISOString(),
        },
      ];

      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockResolvedValue({
          data: expiredBackups,
          error: null,
        }),
      });

      mockSupabaseClient.from.mockReturnValueOnce({
        delete: vi.fn().mockResolvedValue({
          error: null,
        }),
      });

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(unlink).mockResolvedValue(undefined);

      const result = await cleanupExpiredBackups();

      expect(result).toBe(2);
      expect(unlink).toHaveBeenCalledTimes(2);
    });

    it('should return 0 if no expired backups', async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      const result = await cleanupExpiredBackups();

      expect(result).toBe(0);
    });

    it('should continue if file deletion fails', async () => {
      const expiredBackups = [
        {
          id: 'backup-1',
          backup_id: 'backup-old-1',
          file_path: '/backups/backup-old-1.json',
          expires_at: new Date(Date.now() - 1000).toISOString(),
        },
      ];

      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockResolvedValue({
          data: expiredBackups,
          error: null,
        }),
      });

      mockSupabaseClient.from.mockReturnValueOnce({
        delete: vi.fn().mockResolvedValue({
          error: null,
        }),
      });

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(unlink).mockRejectedValue(new Error('File deletion failed'));

      // Should not throw error
      const result = await cleanupExpiredBackups();

      expect(result).toBe(1);
    });
  });

  describe('getUserBackups', () => {
    it('should retrieve all user backups', async () => {
      const mockBackups = [
        {
          id: 'backup-1',
          backup_id: 'backup-123',
          user_id: mockUserId,
          file_path: '/backups/backup-123.json',
          conversation_ids: ['conv-1'],
          backup_reason: 'bulk_delete',
          expires_at: new Date(Date.now() + 100000).toISOString(),
          created_at: new Date().toISOString(),
        },
        {
          id: 'backup-2',
          backup_id: 'backup-456',
          user_id: mockUserId,
          file_path: '/backups/backup-456.json',
          conversation_ids: ['conv-2'],
          backup_reason: 'manual_backup',
          expires_at: new Date(Date.now() + 200000).toISOString(),
          created_at: new Date().toISOString(),
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gt: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockBackups,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await getUserBackups(mockUserId);

      expect(result).toHaveLength(2);
      expect(result[0].backupId).toBe('backup-123');
      expect(result[1].backupId).toBe('backup-456');
    });

    it('should return empty array if no backups', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gt: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await getUserBackups(mockUserId);

      expect(result).toEqual([]);
    });
  });
});

