import { supabase } from '@/utils/supabase/client';
import { withTransaction } from '../../../../../src/lib/database/transaction';
import { DatabaseError, ErrorCode } from '../errors';
import { errorLogger } from '../errors/error-logger';

// Checkpoint data structure
export interface BatchCheckpoint {
  id: string;
  jobId: string;
  completedItems: string[]; // Array of conversation IDs
  failedItems: Array<{
    itemId: string;
    error: string;
    timestamp: string;
  }>;
  progressPercentage: number;
  lastCheckpointAt: string;
  createdAt: string;
  updatedAt: string;
}

// Batch progress summary
export interface BatchProgress {
  totalItems: number;
  completedItems: number;
  failedItems: number;
  pendingItems: number;
  progressPercentage: number;
}

/**
 * Save batch job checkpoint to database.
 * Uses transaction to ensure atomic save.
 * 
 * @param jobId Unique batch job identifier
 * @param completedItemIds Array of completed conversation IDs
 * @param failedItems Array of failed items with error details
 * @param totalItems Total number of items in batch
 * 
 * @example
 * await saveCheckpoint(
 *   'batch-123',
 *   ['conv-1', 'conv-2', 'conv-3'],
 *   [{ itemId: 'conv-4', error: 'Rate limit', timestamp: new Date().toISOString() }],
 *   10
 * );
 */
export async function saveCheckpoint(
  jobId: string,
  completedItemIds: string[],
  failedItems: Array<{ itemId: string; error: string; timestamp: string }>,
  totalItems: number
): Promise<void> {
  const progressPercentage = Math.round(
    ((completedItemIds.length + failedItems.length) / totalItems) * 100
  );

  errorLogger.debug('Saving batch checkpoint', {
    jobId,
    completedCount: completedItemIds.length,
    failedCount: failedItems.length,
    progress: progressPercentage,
  });

  try {
    await withTransaction(async (ctx) => {
      // Upsert checkpoint (insert or update if exists)
      const { error } = await ctx.client
        .from('batch_checkpoints')
        .upsert({
          job_id: jobId,
          completed_items: completedItemIds,
          failed_items: failedItems,
          progress_percentage: progressPercentage,
          last_checkpoint_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'job_id',
        });

      if (error) {
        throw new DatabaseError(
          'Failed to save batch checkpoint',
          ErrorCode.ERR_DB_QUERY,
          {
            cause: error,
            context: {
              component: 'CheckpointSystem',
              metadata: { jobId, checkpointSize: completedItemIds.length },
            },
          }
        );
      }
    });

    errorLogger.info('Batch checkpoint saved successfully', {
      jobId,
      progress: progressPercentage,
    });
  } catch (error) {
    errorLogger.error('Failed to save batch checkpoint', error, {
      jobId,
      completedCount: completedItemIds.length,
    });
    throw error;
  }
}

/**
 * Load batch checkpoint from database.
 * Returns null if no checkpoint exists.
 * 
 * @param jobId Unique batch job identifier
 * @returns Checkpoint data or null if not found
 * 
 * @example
 * const checkpoint = await loadCheckpoint('batch-123');
 * if (checkpoint) {
 *   console.log(`Resume from ${checkpoint.progressPercentage}%`);
 * }
 */
export async function loadCheckpoint(
  jobId: string
): Promise<BatchCheckpoint | null> {
  errorLogger.debug('Loading batch checkpoint', { jobId });

  try {
    const { data, error } = await supabase
      .from('batch_checkpoints')
      .select('*')
      .eq('job_id', jobId)
      .single();

    if (error) {
      // If no checkpoint exists, return null (not an error)
      if (error.code === 'PGRST116') {
        errorLogger.debug('No checkpoint found for batch', { jobId });
        return null;
      }

      throw new DatabaseError(
        'Failed to load batch checkpoint',
        ErrorCode.ERR_DB_QUERY,
        {
          cause: error,
          context: {
            component: 'CheckpointSystem',
            metadata: { jobId },
          },
        }
      );
    }

    const checkpoint: BatchCheckpoint = {
      id: data.id,
      jobId: data.job_id,
      completedItems: data.completed_items || [],
      failedItems: data.failed_items || [],
      progressPercentage: data.progress_percentage || 0,
      lastCheckpointAt: data.last_checkpoint_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    errorLogger.info('Batch checkpoint loaded', {
      jobId,
      progress: checkpoint.progressPercentage,
      completedCount: checkpoint.completedItems.length,
    });

    return checkpoint;
  } catch (error) {
    errorLogger.error('Failed to load batch checkpoint', error, { jobId });
    throw error;
  }
}

/**
 * Delete checkpoint after batch completion.
 * 
 * @param jobId Unique batch job identifier
 * 
 * @example
 * await cleanupCheckpoint('batch-123');
 */
export async function cleanupCheckpoint(jobId: string): Promise<void> {
  errorLogger.debug('Cleaning up batch checkpoint', { jobId });

  try {
    const { error } = await supabase
      .from('batch_checkpoints')
      .delete()
      .eq('job_id', jobId);

    if (error) {
      throw new DatabaseError(
        'Failed to cleanup batch checkpoint',
        ErrorCode.ERR_DB_QUERY,
        {
          cause: error,
          context: {
            component: 'CheckpointSystem',
            metadata: { jobId },
          },
        }
      );
    }

    errorLogger.info('Batch checkpoint cleaned up', { jobId });
  } catch (error) {
    errorLogger.warn('Failed to cleanup checkpoint (non-critical)', error, { jobId });
    // Don't throw - cleanup failure shouldn't break batch completion
  }
}

/**
 * Get all incomplete batch checkpoints for current user.
 * Used to detect resumable batches on page load.
 * 
 * @returns Array of incomplete batch checkpoints
 * 
 * @example
 * const incomplete = await getIncompleteCheckpoints();
 * if (incomplete.length > 0) {
 *   // Show resume dialog
 * }
 */
export async function getIncompleteCheckpoints(): Promise<BatchCheckpoint[]> {
  errorLogger.debug('Loading incomplete batch checkpoints');

  try {
    const { data, error } = await supabase
      .from('batch_checkpoints')
      .select('*')
      .lt('progress_percentage', 100)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new DatabaseError(
        'Failed to load incomplete checkpoints',
        ErrorCode.ERR_DB_QUERY,
        {
          cause: error,
          context: { component: 'CheckpointSystem' },
        }
      );
    }

    const checkpoints: BatchCheckpoint[] = (data || []).map((row) => ({
      id: row.id,
      jobId: row.job_id,
      completedItems: row.completed_items || [],
      failedItems: row.failed_items || [],
      progressPercentage: row.progress_percentage || 0,
      lastCheckpointAt: row.last_checkpoint_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    errorLogger.info('Incomplete checkpoints loaded', {
      count: checkpoints.length,
    });

    return checkpoints;
  } catch (error) {
    errorLogger.error('Failed to load incomplete checkpoints', error);
    throw error;
  }
}

/**
 * Calculate batch progress from checkpoint.
 * 
 * @param checkpoint Batch checkpoint data
 * @param totalItems Total number of items in batch
 * @returns Progress summary
 */
export function calculateProgress(
  checkpoint: BatchCheckpoint,
  totalItems: number
): BatchProgress {
  const completedItems = checkpoint.completedItems.length;
  const failedItems = checkpoint.failedItems.length;
  const pendingItems = totalItems - completedItems - failedItems;

  return {
    totalItems,
    completedItems,
    failedItems,
    pendingItems,
    progressPercentage: checkpoint.progressPercentage,
  };
}

