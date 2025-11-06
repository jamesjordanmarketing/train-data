import { createClient } from '@supabase/supabase-js';
import { DatabaseError, ErrorCode } from '../types/errors';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Simple logger for backup operations
const logger = {
  info: (message: string, context?: any) => console.log('[INFO]', message, context || ''),
  debug: (message: string, context?: any) => console.debug('[DEBUG]', message, context || ''),
  warn: (message: string, error?: any, context?: any) => console.warn('[WARN]', message, error || '', context || ''),
  error: (message: string, error?: any, context?: any) => console.error('[ERROR]', message, error || '', context || ''),
};

/**
 * Get Supabase client with lazy initialization
 * Avoids module-level initialization that breaks Next.js build
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Backup metadata
export interface Backup {
  id: string;
  backupId: string;
  userId: string;
  filePath: string;
  conversationIds: string[];
  backupReason: string;
  expiresAt: Date;
  createdAt: Date;
}

// Backup data structure
export interface BackupData {
  version: string;
  createdAt: string;
  backupReason: string;
  conversations: any[];
}

/**
 * Create backup of conversations before delete.
 * Exports conversation data to JSON file.
 * 
 * @param conversationIds Array of conversation IDs to backup
 * @param userId User ID creating the backup
 * @param reason Reason for backup (e.g., "bulk_delete")
 * @returns Backup metadata with download link
 * 
 * @example
 * const backup = await createBackup(
 *   ['conv-1', 'conv-2', 'conv-3'],
 *   'user-123',
 *   'bulk_delete'
 * );
 * console.log(`Backup created: ${backup.filePath}`);
 */
export async function createBackup(
  conversationIds: string[],
  userId: string,
  reason: string = 'manual_backup'
): Promise<Backup> {
  const backupId = `backup-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  logger.info('Creating backup', {
    backupId,
    conversationCount: conversationIds.length,
    reason,
  });

  try {
    const supabase = getSupabaseClient();
    
    // Fetch conversation data
    const { data: conversations, error: fetchError } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_turns:conversation_turns(*)
      `)
      .in('id', conversationIds);

    if (fetchError) {
      throw new DatabaseError(
        'Failed to fetch conversations for backup',
        ErrorCode.ERR_DB_QUERY,
        {
          cause: fetchError,
          context: {
            component: 'BackupStorage',
            metadata: { backupId, conversationCount: conversationIds.length },
          },
        }
      );
    }

    // Create backup data structure
    const backupData: BackupData = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      backupReason: reason,
      conversations: conversations || [],
    };

    // Generate file path
    const fileName = `${backupId}.json`;
    const backupDir = path.join(process.cwd(), 'backups');
    const filePath = path.join(backupDir, fileName);

    // Ensure backup directory exists
    if (!existsSync(backupDir)) {
      await mkdir(backupDir, { recursive: true });
    }

    // Write backup file
    await writeFile(filePath, JSON.stringify(backupData, null, 2), 'utf-8');

    logger.info('Backup file created', {
      backupId,
      filePath,
      fileSize: JSON.stringify(backupData).length,
    });

    // Save backup metadata to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days retention

    const { data: backupRecord, error: insertError } = await supabase
      .from('backup_exports')
      .insert({
        backup_id: backupId,
        user_id: userId,
        file_path: filePath,
        conversation_ids: conversationIds,
        backup_reason: reason,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      throw new DatabaseError(
        'Failed to save backup metadata',
        ErrorCode.ERR_DB_QUERY,
        {
          cause: insertError,
          context: {
            component: 'BackupStorage',
            metadata: { backupId },
          },
        }
      );
    }

    logger.info('Backup created successfully', {
      backupId,
      conversationCount: conversationIds.length,
      expiresAt: expiresAt.toISOString(),
    });

    return {
      id: backupRecord.id,
      backupId: backupRecord.backup_id,
      userId: backupRecord.user_id,
      filePath: backupRecord.file_path,
      conversationIds: backupRecord.conversation_ids,
      backupReason: backupRecord.backup_reason,
      expiresAt: new Date(backupRecord.expires_at),
      createdAt: new Date(backupRecord.created_at),
    };
  } catch (error) {
    logger.error('Backup creation failed', error, {
      backupId,
      conversationCount: conversationIds.length,
    });
    throw error;
  }
}

/**
 * Get backup by ID.
 * 
 * @param backupId Backup identifier
 * @returns Backup metadata
 */
export async function getBackup(backupId: string): Promise<Backup | null> {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('backup_exports')
      .select('*')
      .eq('backup_id', backupId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new DatabaseError(
        'Failed to fetch backup',
        ErrorCode.ERR_DB_QUERY,
        {
          cause: error,
          context: {
            component: 'BackupStorage',
            metadata: { backupId },
          },
        }
      );
    }

    return {
      id: data.id,
      backupId: data.backup_id,
      userId: data.user_id,
      filePath: data.file_path,
      conversationIds: data.conversation_ids,
      backupReason: data.backup_reason,
      expiresAt: new Date(data.expires_at),
      createdAt: new Date(data.created_at),
    };
  } catch (error) {
    logger.error('Failed to get backup', error, { backupId });
    throw error;
  }
}

/**
 * Delete expired backups (scheduled job).
 * Should be run daily via cron or scheduled task.
 * 
 * @returns Number of deleted backups
 */
export async function cleanupExpiredBackups(): Promise<number> {
  logger.info('Running backup cleanup');

  try {
    const supabase = getSupabaseClient();
    
    const { data: expiredBackups, error: fetchError } = await supabase
      .from('backup_exports')
      .select('*')
      .lt('expires_at', new Date().toISOString());

    if (fetchError) {
      throw new DatabaseError(
        'Failed to fetch expired backups',
        ErrorCode.ERR_DB_QUERY,
        {
          cause: fetchError,
          context: { component: 'BackupStorage' },
        }
      );
    }

    if (!expiredBackups || expiredBackups.length === 0) {
      logger.info('No expired backups to clean up');
      return 0;
    }

    // Delete backup files from filesystem
    for (const backup of expiredBackups) {
      try {
        if (existsSync(backup.file_path)) {
          await unlink(backup.file_path);
          logger.debug('Deleted backup file', {
            backupId: backup.backup_id,
            filePath: backup.file_path,
          });
        }
      } catch (error) {
        logger.warn('Failed to delete backup file', error, {
          backupId: backup.backup_id,
          filePath: backup.file_path,
        });
      }
    }

    // Delete backup records from database
    const { error: deleteError } = await supabase
      .from('backup_exports')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (deleteError) {
      throw new DatabaseError(
        'Failed to delete expired backup records',
        ErrorCode.ERR_DB_QUERY,
        {
          cause: deleteError,
          context: { component: 'BackupStorage' },
        }
      );
    }

    logger.info('Backup cleanup completed', {
      deletedCount: expiredBackups.length,
    });

    return expiredBackups.length;
  } catch (error) {
    logger.error('Backup cleanup failed', error);
    throw error;
  }
}

/**
 * Get all backups for a user.
 * 
 * @param userId User ID
 * @returns Array of backups
 */
export async function getUserBackups(userId: string): Promise<Backup[]> {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('backup_exports')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      throw new DatabaseError(
        'Failed to fetch user backups',
        ErrorCode.ERR_DB_QUERY,
        {
          cause: error,
          context: {
            component: 'BackupStorage',
            metadata: { userId },
          },
        }
      );
    }

    return (data || []).map((row) => ({
      id: row.id,
      backupId: row.backup_id,
      userId: row.user_id,
      filePath: row.file_path,
      conversationIds: row.conversation_ids,
      backupReason: row.backup_reason,
      expiresAt: new Date(row.expires_at),
      createdAt: new Date(row.created_at),
    }));
  } catch (error) {
    logger.error('Failed to get user backups', error, { userId });
    throw error;
  }
}

