import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createBackup, getBackup, cleanupExpiredBackups } from '@/../src/lib/backup/storage';
import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';

// Mock dependencies
vi.mock('@supabase/supabase-js');
vi.mock('fs/promises');
vi.mock('fs');
vi.mock('@/../train-wireframe/src/lib/errors/error-logger');

describe('Backup Flow Integration', () => {
  const mockUserId = 'user-integration-test';
  const mockConversationIds = ['conv-1', 'conv-2', 'conv-3'];

  let mockSupabaseClient: any;

  beforeEach(() => {
    vi.clearAllMocks();

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

  it('should complete full backup creation and retrieval flow', async () => {
    const mockConversations = [
      {
        id: 'conv-1',
        content: 'Conversation 1 content',
        persona: 'Expert',
        conversation_turns: [
          { id: 'turn-1', content: 'Turn 1' },
        ],
      },
      {
        id: 'conv-2',
        content: 'Conversation 2 content',
        persona: 'Beginner',
        conversation_turns: [
          { id: 'turn-2', content: 'Turn 2' },
        ],
      },
      {
        id: 'conv-3',
        content: 'Conversation 3 content',
        persona: 'Intermediate',
        conversation_turns: [],
      },
    ];

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
      id: 'backup-uuid-123',
      backup_id: 'backup-test-123',
      user_id: mockUserId,
      file_path: '/backups/backup-test-123.json',
      conversation_ids: mockConversationIds,
      backup_reason: 'bulk_delete',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
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

    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(writeFile).mockResolvedValue(undefined);

    // Create backup
    const backup = await createBackup(mockConversationIds, mockUserId, 'bulk_delete');

    expect(backup.backupId).toContain('backup-');
    expect(backup.userId).toBe(mockUserId);
    expect(backup.conversationIds).toEqual(mockConversationIds);

    // Verify backup file was written
    expect(writeFile).toHaveBeenCalled();
    const writeFileCall = vi.mocked(writeFile).mock.calls[0];
    const backupData = JSON.parse(writeFileCall[1] as string);

    expect(backupData.version).toBe('1.0');
    expect(backupData.backupReason).toBe('bulk_delete');
    expect(backupData.conversations).toHaveLength(3);

    // Now retrieve the backup
    mockSupabaseClient.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockBackupRecord,
            error: null,
          }),
        }),
      }),
    });

    const retrievedBackup = await getBackup(backup.backupId);

    expect(retrievedBackup).not.toBeNull();
    expect(retrievedBackup?.backupId).toBe(backup.backupId);
    expect(retrievedBackup?.conversationIds).toEqual(mockConversationIds);
  });

  it('should prevent delete if backup creation fails', async () => {
    // Mock conversation fetch failure
    const mockError = new Error('Database connection lost');

    mockSupabaseClient.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    });

    // Backup creation should fail
    await expect(
      createBackup(mockConversationIds, mockUserId, 'bulk_delete')
    ).rejects.toThrow();

    // Verify no file was written
    expect(writeFile).not.toHaveBeenCalled();
  });

  it('should cleanup expired backups and delete files', async () => {
    const now = new Date();
    const expiredDate = new Date(now.getTime() - 1000);

    const expiredBackups = [
      {
        id: 'backup-1',
        backup_id: 'backup-expired-1',
        file_path: '/backups/backup-expired-1.json',
        expires_at: expiredDate.toISOString(),
      },
      {
        id: 'backup-2',
        backup_id: 'backup-expired-2',
        file_path: '/backups/backup-expired-2.json',
        expires_at: expiredDate.toISOString(),
      },
    ];

    // Mock fetching expired backups
    mockSupabaseClient.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({
        data: expiredBackups,
        error: null,
      }),
    });

    // Mock deleting expired records
    mockSupabaseClient.from.mockReturnValueOnce({
      delete: vi.fn().mockResolvedValue({
        error: null,
      }),
    });

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(unlink).mockResolvedValue(undefined);

    const deletedCount = await cleanupExpiredBackups();

    expect(deletedCount).toBe(2);

    // Verify both files were deleted
    expect(unlink).toHaveBeenCalledTimes(2);
    expect(unlink).toHaveBeenCalledWith('/backups/backup-expired-1.json');
    expect(unlink).toHaveBeenCalledWith('/backups/backup-expired-2.json');
  });

  it('should handle backup download flow', async () => {
    const mockBackupRecord = {
      id: 'backup-uuid',
      backup_id: 'backup-download-test',
      user_id: mockUserId,
      file_path: '/backups/backup-download-test.json',
      conversation_ids: mockConversationIds,
      backup_reason: 'manual_backup',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    };

    // Mock backup retrieval
    mockSupabaseClient.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockBackupRecord,
            error: null,
          }),
        }),
      }),
    });

    const backup = await getBackup('backup-download-test');

    expect(backup).not.toBeNull();
    expect(backup?.backupId).toBe('backup-download-test');

    // Verify file exists check would be performed
    vi.mocked(existsSync).mockReturnValue(true);

    // Mock file read for download
    const mockBackupContent = JSON.stringify({
      version: '1.0',
      createdAt: new Date().toISOString(),
      backupReason: 'manual_backup',
      conversations: [],
    });

    vi.mocked(readFile).mockResolvedValue(mockBackupContent);

    const fileContent = await readFile(backup!.filePath, 'utf-8');

    expect(fileContent).toBeTruthy();
    expect(JSON.parse(fileContent).version).toBe('1.0');
  });

  it('should handle backup expiration correctly', async () => {
    const expiredDate = new Date(Date.now() - 1000);

    const expiredBackup = {
      id: 'backup-uuid',
      backup_id: 'backup-expired',
      user_id: mockUserId,
      file_path: '/backups/backup-expired.json',
      conversation_ids: mockConversationIds,
      backup_reason: 'bulk_delete',
      expires_at: expiredDate.toISOString(),
      created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // Mock backup retrieval
    mockSupabaseClient.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: expiredBackup,
            error: null,
          }),
        }),
      }),
    });

    const backup = await getBackup('backup-expired');

    expect(backup).not.toBeNull();
    expect(new Date(backup!.expiresAt).getTime()).toBeLessThan(Date.now());
  });

  it('should handle multiple backups for same user', async () => {
    const mockBackups = [
      {
        id: 'backup-1',
        backup_id: 'backup-multi-1',
        user_id: mockUserId,
        file_path: '/backups/backup-multi-1.json',
        conversation_ids: ['conv-1', 'conv-2'],
        backup_reason: 'bulk_delete',
        expires_at: new Date(Date.now() + 100000).toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'backup-2',
        backup_id: 'backup-multi-2',
        user_id: mockUserId,
        file_path: '/backups/backup-multi-2.json',
        conversation_ids: ['conv-3', 'conv-4'],
        backup_reason: 'manual_backup',
        expires_at: new Date(Date.now() + 200000).toISOString(),
        created_at: new Date().toISOString(),
      },
    ];

    // Simulating getUserBackups functionality
    mockSupabaseClient.from.mockReturnValueOnce({
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

    // This would be called by getUserBackups in storage.ts
    const { getUserBackups } = await import('@/../src/lib/backup/storage');
    const userBackups = await getUserBackups(mockUserId);

    expect(userBackups).toHaveLength(2);
    expect(userBackups[0].backupId).toBe('backup-multi-1');
    expect(userBackups[1].backupId).toBe('backup-multi-2');
  });

  it('should preserve conversation structure in backup', async () => {
    const complexConversations = [
      {
        id: 'conv-complex-1',
        content: 'Complex conversation',
        persona: 'Expert',
        system_prompt: 'You are an expert',
        conversation_turns: [
          {
            id: 'turn-1',
            content: 'User message',
            role: 'user',
            sequence: 1,
          },
          {
            id: 'turn-2',
            content: 'Assistant response',
            role: 'assistant',
            sequence: 2,
          },
        ],
        metadata: {
          tags: ['test', 'complex'],
          difficulty: 'hard',
        },
      },
    ];

    mockSupabaseClient.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: complexConversations,
          error: null,
        }),
      }),
    });

    const mockBackupRecord = {
      id: 'backup-uuid',
      backup_id: 'backup-structure-test',
      user_id: mockUserId,
      file_path: '/backups/backup-structure-test.json',
      conversation_ids: ['conv-complex-1'],
      backup_reason: 'manual_backup',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
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

    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(writeFile).mockResolvedValue(undefined);

    await createBackup(['conv-complex-1'], mockUserId, 'manual_backup');

    // Verify structure was preserved in written file
    expect(writeFile).toHaveBeenCalled();
    const writeCall = vi.mocked(writeFile).mock.calls[0];
    const backupData = JSON.parse(writeCall[1] as string);

    expect(backupData.conversations[0].conversation_turns).toHaveLength(2);
    expect(backupData.conversations[0].metadata).toEqual({
      tags: ['test', 'complex'],
      difficulty: 'hard',
    });
  });
});

