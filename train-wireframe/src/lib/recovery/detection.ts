import { supabase } from '@/utils/supabase/client';
import { detectDrafts, DraftConversation } from '../auto-save/storage';
import { getIncompleteCheckpoints, BatchCheckpoint } from '../batch/checkpoint';
import { errorLogger } from '../errors/error-logger';
import {
  RecoverableItem,
  RecoverableItemType,
  RecoveryStatus,
  DraftRecoveryData,
  BatchRecoveryData,
  BackupRecoveryData,
  ExportRecoveryData,
} from './types';

/**
 * Calculate priority score for recovery item.
 * More recent items and items with more work get higher priority.
 * 
 * @param timestamp ISO timestamp string
 * @param workAmount Relative amount of work (0-1)
 * @returns Priority score 0-100
 */
function calculatePriority(timestamp: string, workAmount: number): number {
  const now = Date.now();
  const itemTime = new Date(timestamp).getTime();
  const ageMs = now - itemTime;
  
  // Recency factor: items from last hour = 100, older = decreasing
  const hourMs = 60 * 60 * 1000;
  const recencyFactor = Math.max(0, Math.min(100, 100 - (ageMs / hourMs) * 10));
  
  // Work factor: more work = higher priority
  const workFactor = workAmount * 100;
  
  // Weighted average (70% recency, 30% work)
  return Math.round(recencyFactor * 0.7 + workFactor * 0.3);
}

/**
 * Detect draft conversations that can be recovered.
 * 
 * @returns Array of recoverable draft items
 */
async function detectDraftConversations(): Promise<RecoverableItem[]> {
  try {
    errorLogger.debug('Detecting draft conversations');
    
    const drafts = await detectDrafts();
    
    const items: RecoverableItem[] = drafts.map((draft: DraftConversation) => {
      const turnCount = draft.turns?.length || 0;
      const workAmount = Math.min(1, turnCount / 10); // Normalize to 0-1
      
      const data: DraftRecoveryData = {
        draftId: draft.id,
        conversationId: draft.conversationId,
        topic: draft.topic || 'Untitled conversation',
        turns: turnCount,
        lastSaved: draft.updatedAt,
        conflictsWith: draft.conflictsWith,
      };
      
      return {
        id: `draft-${draft.id}`,
        type: RecoverableItemType.DRAFT_CONVERSATION,
        timestamp: draft.updatedAt,
        description: `Draft: "${draft.topic || 'Untitled'}" (${turnCount} turns)`,
        priority: calculatePriority(draft.updatedAt, workAmount),
        data,
        status: RecoveryStatus.PENDING,
      };
    });
    
    errorLogger.info('Draft conversations detected', { count: items.length });
    return items;
  } catch (error) {
    errorLogger.error('Failed to detect draft conversations', error);
    return [];
  }
}

/**
 * Detect incomplete batch jobs that can be resumed.
 * 
 * @returns Array of recoverable batch items
 */
async function detectIncompleteBatches(): Promise<RecoverableItem[]> {
  try {
    errorLogger.debug('Detecting incomplete batches');
    
    const checkpoints = await getIncompleteCheckpoints();
    
    const items: RecoverableItem[] = checkpoints.map((checkpoint: BatchCheckpoint) => {
      const progress = checkpoint.progressPercentage / 100; // 0-1
      
      const data: BatchRecoveryData = {
        jobId: checkpoint.jobId,
        totalItems: checkpoint.completedItems.length + checkpoint.failedItems.length + 
                    Math.round((100 - checkpoint.progressPercentage) / 100 * 
                    (checkpoint.completedItems.length + checkpoint.failedItems.length)),
        completedItems: checkpoint.completedItems.length,
        failedItems: checkpoint.failedItems.length,
        progressPercentage: checkpoint.progressPercentage,
        lastCheckpoint: checkpoint.lastCheckpointAt,
      };
      
      return {
        id: `batch-${checkpoint.jobId}`,
        type: RecoverableItemType.INCOMPLETE_BATCH,
        timestamp: checkpoint.lastCheckpointAt,
        description: `Batch job: ${checkpoint.progressPercentage}% complete (${checkpoint.completedItems.length} done, ${checkpoint.failedItems.length} failed)`,
        priority: calculatePriority(checkpoint.lastCheckpointAt, progress),
        data,
        status: RecoveryStatus.PENDING,
      };
    });
    
    errorLogger.info('Incomplete batches detected', { count: items.length });
    return items;
  } catch (error) {
    errorLogger.error('Failed to detect incomplete batches', error);
    return [];
  }
}

/**
 * Detect available backups that haven't been restored.
 * 
 * @returns Array of recoverable backup items
 */
async function detectAvailableBackups(): Promise<RecoverableItem[]> {
  try {
    errorLogger.debug('Detecting available backups');
    
    // Query backups that are not expired
    const { data: backups, error } = await supabase
      .from('backup_exports')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    
    if (error) {
      errorLogger.error('Failed to query backups', error);
      return [];
    }
    
    const items: RecoverableItem[] = (backups || []).map((backup) => {
      const conversationCount = Array.isArray(backup.conversation_ids) 
        ? backup.conversation_ids.length 
        : 0;
      const workAmount = Math.min(1, conversationCount / 50); // Normalize to 0-1
      
      const data: BackupRecoveryData = {
        backupId: backup.backup_id,
        conversationCount,
        backupReason: backup.backup_reason,
        expiresAt: backup.expires_at,
        filePath: backup.file_path,
      };
      
      return {
        id: `backup-${backup.backup_id}`,
        type: RecoverableItemType.AVAILABLE_BACKUP,
        timestamp: backup.created_at,
        description: `Backup: ${conversationCount} conversations (${backup.backup_reason})`,
        priority: calculatePriority(backup.created_at, workAmount),
        data,
        status: RecoveryStatus.PENDING,
      };
    });
    
    errorLogger.info('Available backups detected', { count: items.length });
    return items;
  } catch (error) {
    errorLogger.error('Failed to detect available backups', error);
    return [];
  }
}

/**
 * Detect failed exports that can be retried.
 * 
 * @returns Array of recoverable export items
 */
async function detectFailedExports(): Promise<RecoverableItem[]> {
  try {
    errorLogger.debug('Detecting failed exports');
    
    // Query exports with 'failed' status
    const { data: exports, error } = await supabase
      .from('exports')
      .select('*')
      .eq('status', 'failed')
      .order('created_at', { ascending: false })
      .limit(10); // Only show recent failures
    
    if (error) {
      errorLogger.error('Failed to query exports', error);
      return [];
    }
    
    const items: RecoverableItem[] = (exports || []).map((exp) => {
      const conversationCount = Array.isArray(exp.conversation_ids) 
        ? exp.conversation_ids.length 
        : 0;
      const workAmount = Math.min(1, conversationCount / 50); // Normalize to 0-1
      
      const data: ExportRecoveryData = {
        exportId: exp.id,
        format: exp.format,
        conversationCount,
        failureReason: exp.error_message || 'Unknown error',
        canRetry: true,
      };
      
      return {
        id: `export-${exp.id}`,
        type: RecoverableItemType.FAILED_EXPORT,
        timestamp: exp.created_at,
        description: `Failed export: ${conversationCount} conversations to ${exp.format.toUpperCase()}`,
        priority: calculatePriority(exp.created_at, workAmount),
        data,
        status: RecoveryStatus.PENDING,
      };
    });
    
    errorLogger.info('Failed exports detected', { count: items.length });
    return items;
  } catch (error) {
    errorLogger.error('Failed to detect failed exports', error);
    return [];
  }
}

/**
 * Detect all recoverable data across all sources.
 * Returns items sorted by priority (highest first).
 * 
 * @returns Array of all recoverable items
 * 
 * @example
 * const items = await detectRecoverableData();
 * if (items.length > 0) {
 *   // Show recovery wizard
 * }
 */
export async function detectRecoverableData(): Promise<RecoverableItem[]> {
  errorLogger.info('Starting recovery detection');
  
  try {
    // Detect from all sources in parallel
    const [drafts, batches, backups, exports] = await Promise.all([
      detectDraftConversations(),
      detectIncompleteBatches(),
      detectAvailableBackups(),
      detectFailedExports(),
    ]);
    
    // Combine all items
    const allItems = [...drafts, ...batches, ...backups, ...exports];
    
    // Sort by priority (highest first)
    allItems.sort((a, b) => b.priority - a.priority);
    
    errorLogger.info('Recovery detection complete', {
      totalItems: allItems.length,
      drafts: drafts.length,
      batches: batches.length,
      backups: backups.length,
      exports: exports.length,
    });
    
    return allItems;
  } catch (error) {
    errorLogger.error('Recovery detection failed', error);
    return [];
  }
}

/**
 * Filter recoverable items by type.
 * 
 * @param items All recoverable items
 * @param type Type to filter by
 * @returns Filtered items
 */
export function filterItemsByType(
  items: RecoverableItem[],
  type: RecoverableItemType
): RecoverableItem[] {
  return items.filter((item) => item.type === type);
}

/**
 * Get count of items by status.
 * 
 * @param items All recoverable items
 * @returns Count of items by status
 */
export function getStatusCounts(items: RecoverableItem[]): Record<RecoveryStatus, number> {
  const counts = {
    [RecoveryStatus.PENDING]: 0,
    [RecoveryStatus.RECOVERING]: 0,
    [RecoveryStatus.SUCCESS]: 0,
    [RecoveryStatus.FAILED]: 0,
    [RecoveryStatus.SKIPPED]: 0,
  };
  
  items.forEach((item) => {
    counts[item.status]++;
  });
  
  return counts;
}

