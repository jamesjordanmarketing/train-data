import { BatchCheckpoint, loadCheckpoint, saveCheckpoint } from './checkpoint';
import { errorLogger } from '../errors/error-logger';

// Batch item interface
export interface BatchItem {
  id: string;
  conversationId?: string;
  topic: string;
  parameters: Record<string, any>;
  status: 'pending' | 'completed' | 'failed';
}

/**
 * Check if a batch item has already been completed.
 * 
 * @param itemId Batch item identifier
 * @param checkpoint Current batch checkpoint
 * @returns true if item is already completed
 */
export function isItemCompleted(
  itemId: string,
  checkpoint: BatchCheckpoint | null
): boolean {
  if (!checkpoint) return false;
  return checkpoint.completedItems.includes(itemId);
}

/**
 * Filter batch items to only pending (unprocessed) items.
 * Skips items that are already completed or failed.
 * 
 * @param allItems All batch items
 * @param checkpoint Current batch checkpoint
 * @returns Array of pending items only
 * 
 * @example
 * const checkpoint = await loadCheckpoint(jobId);
 * const pendingItems = filterPendingItems(allItems, checkpoint);
 * // Only process pendingItems to avoid duplicates
 */
export function filterPendingItems(
  allItems: BatchItem[],
  checkpoint: BatchCheckpoint | null
): BatchItem[] {
  if (!checkpoint) return allItems;

  const completedIds = new Set(checkpoint.completedItems);
  const failedIds = new Set(checkpoint.failedItems.map((f) => f.itemId));

  const pending = allItems.filter(
    (item) => !completedIds.has(item.id) && !failedIds.has(item.id)
  );

  errorLogger.debug('Filtered pending items', {
    total: allItems.length,
    completed: completedIds.size,
    failed: failedIds.size,
    pending: pending.length,
  });

  return pending;
}

/**
 * Resume batch processing from checkpoint.
 * Only processes pending items (idempotent - safe to retry).
 * 
 * @param jobId Batch job identifier
 * @param allItems All batch items (including completed)
 * @param processFn Function to process each item
 * @param onProgress Optional progress callback
 * 
 * @example
 * await resumeBatchProcessing(
 *   'batch-123',
 *   allItems,
 *   async (item) => await generateConversation(item),
 *   (progress) => updateUI(progress)
 * );
 */
export async function resumeBatchProcessing(
  jobId: string,
  allItems: BatchItem[],
  processFn: (item: BatchItem) => Promise<void>,
  onProgress?: (progress: { completed: number; failed: number; total: number }) => void
): Promise<{ completed: string[]; failed: Array<{ itemId: string; error: string }> }> {
  errorLogger.info('Resuming batch processing', {
    jobId,
    totalItems: allItems.length,
  });

  // Load checkpoint
  const checkpoint = await loadCheckpoint(jobId);

  // Filter to pending items only
  const pendingItems = filterPendingItems(allItems, checkpoint);

  errorLogger.info('Batch resume prepared', {
    jobId,
    pendingCount: pendingItems.length,
    alreadyCompleted: checkpoint?.completedItems.length || 0,
    alreadyFailed: checkpoint?.failedItems.length || 0,
  });

  // Initialize tracking arrays
  const completedItems: string[] = [...(checkpoint?.completedItems || [])];
  const failedItems: Array<{ itemId: string; error: string; timestamp: string }> = [
    ...(checkpoint?.failedItems || []),
  ];

  // Process each pending item
  for (const item of pendingItems) {
    try {
      await processFn(item);
      completedItems.push(item.id);

      // Save checkpoint after each successful item
      await saveCheckpoint(jobId, completedItems, failedItems, allItems.length);

      // Notify progress
      if (onProgress) {
        onProgress({
          completed: completedItems.length,
          failed: failedItems.length,
          total: allItems.length,
        });
      }
    } catch (error) {
      errorLogger.error('Batch item processing failed', error, {
        jobId,
        itemId: item.id,
      });

      failedItems.push({
        itemId: item.id,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });

      // Save checkpoint with failure
      await saveCheckpoint(jobId, completedItems, failedItems, allItems.length);

      // Notify progress
      if (onProgress) {
        onProgress({
          completed: completedItems.length,
          failed: failedItems.length,
          total: allItems.length,
        });
      }

      // Continue processing other items (don't fail entire batch)
    }
  }

  errorLogger.info('Batch processing completed', {
    jobId,
    totalCompleted: completedItems.length,
    totalFailed: failedItems.length,
  });

  return {
    completed: completedItems,
    failed: failedItems.map((f) => ({ itemId: f.itemId, error: f.error })),
  };
}

