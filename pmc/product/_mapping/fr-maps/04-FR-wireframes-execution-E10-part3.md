# Interactive LoRA Conversation Generation - Implementation Execution Instructions (E10 Part 3)
**Generated**: 2025-11-04  
**Segment**: E10 - Error Handling & Recovery Module (Prompts 6-7)  
**Total Prompts**: 2 (of 8 total)  
**Estimated Implementation Time**: 26-35 hours

---

## Executive Summary

This document contains the detailed implementation instructions for **Prompts 6 & 7** of the E10 segment (Error Handling & Recovery Module). These prompts were originally too cursory and have been expanded to match the comprehensive detail level of Prompts 1-5.

**Prompt 6** implements batch job resume with checkpoint system and pre-delete backup functionality to prevent data loss. **Prompt 7** implements enhanced toast notifications and error details modal for improved user communication.

These prompts build upon the error infrastructure and data protection mechanisms established in Prompts 1-5 and are critical for ensuring operational continuity and transparent user feedback.

---

## Context from Prompts 1-5

### What Has Been Implemented (Prompts 1-5)

**Prompt 1 Deliverables:**
- Error classes: `AppError`, `APIError`, `NetworkError`, `ValidationError`, `GenerationError`, `DatabaseError`
- Error codes enum with 25+ codes (ERR_API_*, ERR_NET_*, ERR_GEN_*, ERR_DB_*, ERR_VAL_*)
- Type guards: `isAPIError()`, `isNetworkError()`, etc.
- ErrorLogger service with batching and multiple destinations
- Files: `train-wireframe/src/lib/errors/error-classes.ts`, `error-guards.ts`, `error-logger.ts`

**Prompt 2 Deliverables:**
- APIClient with rate limiting (50 req/min, 3 concurrent)
- Retry logic with exponential backoff (1s, 2s, 4s, 8s, 16s)
- Rate limit header parsing
- Generation error classification
- Files: `train-wireframe/src/lib/api/client.ts`, `retry.ts`, `rate-limit.ts`, `lib/generation/errors.ts`

**Prompt 3 Deliverables:**
- ErrorBoundary component (global and feature-specific)
- ErrorFallback UI with error details
- Feature boundaries: Dashboard, Generation, Templates, Export
- Integration with layout components
- Files: `train-wireframe/src/components/errors/ErrorBoundary.tsx`, `ErrorFallback.tsx`, `FeatureErrorBoundary.tsx`

**Prompt 4 Deliverables:**
- Transaction wrapper with automatic rollback
- Database error classification (Postgres error codes)
- Health monitoring integration
- Files: `src/lib/database/transaction.ts`, `errors.ts`, `health.ts`

**Prompt 5 Deliverables:**
- Auto-save hook with debounced saving
- IndexedDB draft storage
- Recovery dialog for draft conversations
- Conflict resolution system
- Files: `train-wireframe/src/hooks/useAutoSave.ts`, `lib/auto-save/storage.ts`, `recovery.ts`, `components/auto-save/RecoveryDialog.tsx`

### Integration Points for Prompts 6-7

**What Prompt 6 Will Use:**
- `withTransaction()` from Prompt 4 for atomic checkpoint saves
- `DatabaseError` from Prompt 1 for database operation errors
- `ErrorLogger` from Prompt 1 for logging checkpoint failures
- `withRetry()` from Prompt 2 for retrying failed checkpoint saves
- Storage patterns from Prompt 5 for backup export files

**What Prompt 7 Will Use:**
- Error classes from Prompt 1 for type-safe error handling
- `getUserMessage()` from Prompt 1 for user-friendly error messages
- `categorizeError()` from Prompt 1 for error type detection
- Rate limit status from Prompt 2 for rate limit toasts
- ErrorBoundary context from Prompt 3 for modal triggering

---

## Implementation Prompts

### Prompt 6: Batch Job Resume & Backup

**Scope**: Checkpoint system for resumable batch jobs, resume UI with progress display, pre-delete backup with retention  
**Dependencies**: Prompt 4 (Transaction wrapper), Prompt 5 (Storage patterns)  
**Estimated Time**: 19-25 hours  
**Risk Level**: Medium

========================

You are a senior full-stack developer implementing **Batch Job Resume and Backup System** for the Interactive LoRA Conversation Generation platform.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
The Training Data Generation platform enables batch generation of 90-100 AI training conversations. Batch jobs can fail midway due to:
- API rate limits or errors during generation
- Network interruptions
- Browser crashes or user closes tab
- Server errors

Business users need to:
- Resume incomplete batches without losing progress
- Avoid regenerating conversations that already succeeded
- Backup data before bulk delete operations to prevent accidental data loss
- Recover from failures without manual intervention

**Functional Requirements (FR10.1.2):**

**Batch Resume Requirements:**
- Batch jobs must save checkpoint after each successful conversation generation
- Failed/interrupted batch jobs must be resumable from last checkpoint
- Resume must skip already-completed conversations (idempotent)
- User must be prompted to resume incomplete batches on page load
- Batch job state must persist across browser sessions
- Resume must use original batch configuration or allow modifications
- Batch completion must clean up checkpoint data automatically

**Backup Requirements:**
- Bulk delete operations must offer backup option before execution
- Backup must be created automatically if user confirms
- Backup must be downloadable immediately after creation
- Backup must be stored temporarily for 7 days with automatic cleanup
- Backup format must be JSON for easy import/restore
- Failed backups must prevent delete operation from proceeding
- User must confirm delete after reviewing backup availability

**Technical Architecture:**
- TypeScript with strict mode enabled
- Supabase PostgreSQL database with `batch_checkpoints` and `backup_exports` tables
- Integration with transaction wrapper from Prompt 4 (`withTransaction`)
- Integration with error classes from Prompt 1 (`DatabaseError`, `AppError`)
- Integration with ErrorLogger from Prompt 1
- Files located in:
  - Backend: `src/lib/batch/`, `src/lib/backup/`
  - Frontend: `train-wireframe/src/lib/batch/`, `train-wireframe/src/components/batch/`, `train-wireframe/src/components/backup/`

**CURRENT CODEBASE STATE:**

**Existing Batch Generation (No Checkpoint Support):**
```typescript
// Existing batch generation in src/lib/services/batch-service.ts or similar
// Currently: No checkpoint system - batch restarts from beginning on failure
class BatchGenerationService {
  async processBatch(batchId: string, items: BatchItem[]) {
    for (const item of items) {
      // Generate conversation
      await generateConversation(item);
      // No checkpoint saved - if this fails midway, user loses all progress
    }
  }
}
```

**Existing Batch Generation Modal:**
```typescript
// train-wireframe/src/components/generation/BatchGenerationModal.tsx
// Has multi-step wizard but no resume capability
export function BatchGenerationModal() {
  // Steps: Config → Preview → Progress → Summary
  // No detection of incomplete batches
  // No resume UI
}
```

**Existing Database Tables (from E10 SQL):**
```sql
-- batch_checkpoints table already created in E10 database setup
CREATE TABLE IF NOT EXISTS batch_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL,
  completed_items JSONB NOT NULL DEFAULT '[]',
  failed_items JSONB NOT NULL DEFAULT '[]',
  progress_percentage INTEGER DEFAULT 0,
  last_checkpoint_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- backup_exports table already created in E10 database setup
CREATE TABLE IF NOT EXISTS backup_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT,
  conversation_ids JSONB NOT NULL,
  backup_reason VARCHAR(100),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Gaps Prompt 6 Will Fill:**
1. No checkpoint saving during batch generation
2. No checkpoint loading and resume logic
3. No resume UI to detect and prompt for incomplete batches
4. No idempotency - batch might regenerate already-completed items
5. No pre-delete backup dialog
6. No backup file generation and storage
7. No backup cleanup scheduler

**IMPLEMENTATION TASKS:**

**Task T-6.1.1: Batch Checkpoint System**

1. Create `train-wireframe/src/lib/batch/checkpoint.ts`:

```typescript
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
```

2. Create unit tests for checkpoint system.

**Task T-6.1.2: Idempotent Batch Processor**

1. Create `train-wireframe/src/lib/batch/processor.ts`:

```typescript
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
```

2. Implement unit tests for idempotent processing.

**Task T-6.1.3: Batch Resume UI Components**

1. Create `train-wireframe/src/components/batch/ResumeDialog.tsx`:

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Play, X, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  getIncompleteCheckpoints,
  BatchCheckpoint,
  calculateProgress,
  cleanupCheckpoint,
} from '@/lib/batch/checkpoint';
import { errorLogger } from '@/lib/errors/error-logger';
import { toast } from 'sonner';

interface ResumeDialogProps {
  onResume?: (checkpoint: BatchCheckpoint) => void;
  onDiscard?: (checkpoint: BatchCheckpoint) => void;
}

export function ResumeDialog({ onResume, onDiscard }: ResumeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [checkpoints, setCheckpoints] = useState<BatchCheckpoint[]>([]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<BatchCheckpoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load incomplete checkpoints on mount
  useEffect(() => {
    loadIncompleteCheckpoints();
  }, []);

  async function loadIncompleteCheckpoints() {
    try {
      setIsLoading(true);
      const incomplete = await getIncompleteCheckpoints();
      
      if (incomplete.length > 0) {
        setCheckpoints(incomplete);
        setSelectedCheckpoint(incomplete[0]); // Select first by default
        setIsOpen(true); // Show dialog
      }
    } catch (error) {
      errorLogger.error('Failed to load incomplete checkpoints', error);
      toast.error('Failed to detect incomplete batches');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResume() {
    if (!selectedCheckpoint) return;

    errorLogger.info('User resumed batch', {
      jobId: selectedCheckpoint.jobId,
      progress: selectedCheckpoint.progressPercentage,
    });

    if (onResume) {
      onResume(selectedCheckpoint);
    }

    setIsOpen(false);
  }

  async function handleDiscard() {
    if (!selectedCheckpoint) return;

    try {
      await cleanupCheckpoint(selectedCheckpoint.jobId);
      
      errorLogger.info('User discarded batch', {
        jobId: selectedCheckpoint.jobId,
      });

      toast.success('Batch discarded');

      if (onDiscard) {
        onDiscard(selectedCheckpoint);
      }

      // Remove from list
      const updatedCheckpoints = checkpoints.filter(
        (c) => c.id !== selectedCheckpoint.id
      );
      setCheckpoints(updatedCheckpoints);

      // Select next checkpoint or close dialog
      if (updatedCheckpoints.length > 0) {
        setSelectedCheckpoint(updatedCheckpoints[0]);
      } else {
        setIsOpen(false);
      }
    } catch (error) {
      errorLogger.error('Failed to discard checkpoint', error);
      toast.error('Failed to discard batch');
    }
  }

  if (isLoading || checkpoints.length === 0) {
    return null;
  }

  const progress = selectedCheckpoint
    ? calculateProgress(selectedCheckpoint, 
        selectedCheckpoint.completedItems.length + 
        selectedCheckpoint.failedItems.length + 
        Math.round((100 - selectedCheckpoint.progressPercentage) / 100 * 
          (selectedCheckpoint.completedItems.length + selectedCheckpoint.failedItems.length))
      )
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-warning mt-0.5" />
            <div>
              <DialogTitle>Incomplete Batch Detected</DialogTitle>
              <DialogDescription>
                You have {checkpoints.length} incomplete batch{checkpoints.length > 1 ? 'es' : ''} that can be resumed.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {selectedCheckpoint && progress && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Batch Summary */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Batch Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {progress.progressPercentage}% complete
                    </span>
                  </div>
                  <Progress value={progress.progressPercentage} className="h-2" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <div>
                      <div className="text-2xl font-bold">{progress.completedItems}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <div>
                      <div className="text-2xl font-bold">{progress.failedItems}</div>
                      <div className="text-xs text-muted-foreground">Failed</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-2xl font-bold">{progress.pendingItems}</div>
                      <div className="text-xs text-muted-foreground">Pending</div>
                    </div>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="pt-2 border-t">
                  <div className="text-sm text-muted-foreground">
                    Last updated: {new Date(selectedCheckpoint.lastCheckpointAt).toLocaleString()}
                  </div>
                </div>

                {/* Failed Items (if any) */}
                {progress.failedItems > 0 && (
                  <div className="pt-2">
                    <Badge variant="destructive" className="text-xs">
                      {progress.failedItems} item{progress.failedItems > 1 ? 's' : ''} failed
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Failed items will be retried when you resume
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleDiscard}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Discard Batch
          </Button>
          <Button
            onClick={handleResume}
            className="w-full sm:w-auto"
          >
            <Play className="h-4 w-4 mr-2" />
            Resume Batch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

2. Create `train-wireframe/src/components/batch/BatchSummary.tsx`:

```typescript
'use client';

import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BatchProgress } from '@/lib/batch/checkpoint';

interface BatchSummaryProps {
  progress: BatchProgress;
  startTime?: Date;
  estimatedTimeRemaining?: number; // seconds
}

export function BatchSummary({
  progress,
  startTime,
  estimatedTimeRemaining,
}: BatchSummaryProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Batch Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {progress.completedItems + progress.failedItems} / {progress.totalItems}
            </span>
          </div>
          <Progress value={progress.progressPercentage} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10">
            <CheckCircle className="h-5 w-5 text-success" />
            <div>
              <div className="text-xl font-bold">{progress.completedItems}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10">
            <XCircle className="h-5 w-5 text-destructive" />
            <div>
              <div className="text-xl font-bold">{progress.failedItems}</div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-xl font-bold">{progress.pendingItems}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>

          {estimatedTimeRemaining !== undefined && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xl font-bold">
                  {formatTime(estimatedTimeRemaining)}
                </div>
                <div className="text-xs text-muted-foreground">Remaining</div>
              </div>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between pt-2 border-t">
          {progress.progressPercentage === 100 ? (
            <Badge variant="default" className="bg-success">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          ) : progress.failedItems > 0 ? (
            <Badge variant="destructive">
              <AlertCircle className="h-3 w-3 mr-1" />
              {progress.failedItems} Failed
            </Badge>
          ) : (
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1 animate-pulse" />
              In Progress
            </Badge>
          )}

          {startTime && (
            <span className="text-xs text-muted-foreground">
              Started {new Date(startTime).toLocaleTimeString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

3. Implement component tests for resume UI.

**Task T-6.2.1: Pre-Delete Backup System**

1. Create `src/lib/backup/storage.ts`:

```typescript
import { supabase } from '../supabase';
import { DatabaseError, ErrorCode } from '../../train-wireframe/src/lib/errors';
import { errorLogger } from '../../train-wireframe/src/lib/errors/error-logger';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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
  
  errorLogger.info('Creating backup', {
    backupId,
    conversationCount: conversationIds.length,
    reason,
  });

  try {
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
    await mkdir(backupDir, { recursive: true });

    // Write backup file
    await writeFile(filePath, JSON.stringify(backupData, null, 2), 'utf-8');

    errorLogger.info('Backup file created', {
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

    errorLogger.info('Backup created successfully', {
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
    errorLogger.error('Backup creation failed', error, {
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
  const { data, error } = await supabase
    .from('backup_exports')
    .select('*')
    .eq('backup_id', backupId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
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
}

/**
 * Delete expired backups (scheduled job).
 * Should be run daily via cron or scheduled task.
 * 
 * @returns Number of deleted backups
 */
export async function cleanupExpiredBackups(): Promise<number> {
  errorLogger.info('Running backup cleanup');

  try {
    const { data: expiredBackups, error: fetchError } = await supabase
      .from('backup_exports')
      .select('*')
      .lt('expires_at', new Date().toISOString());

    if (fetchError) {
      throw fetchError;
    }

    if (!expiredBackups || expiredBackups.length === 0) {
      errorLogger.info('No expired backups to clean up');
      return 0;
    }

    // Delete backup files from filesystem
    const fs = require('fs').promises;
    for (const backup of expiredBackups) {
      try {
        await fs.unlink(backup.file_path);
        errorLogger.debug('Deleted backup file', {
          backupId: backup.backup_id,
          filePath: backup.file_path,
        });
      } catch (error) {
        errorLogger.warn('Failed to delete backup file', error, {
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
      throw deleteError;
    }

    errorLogger.info('Backup cleanup completed', {
      deletedCount: expiredBackups.length,
    });

    return expiredBackups.length;
  } catch (error) {
    errorLogger.error('Backup cleanup failed', error);
    throw error;
  }
}
```

2. Create `train-wireframe/src/components/backup/PreDeleteBackup.tsx`:

```typescript
'use client';

import React, { useState } from 'react';
import { Download, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { errorLogger } from '@/lib/errors/error-logger';
import { toast } from 'sonner';

interface PreDeleteBackupProps {
  isOpen: boolean;
  onClose: () => void;
  conversationIds: string[];
  onConfirmDelete: () => Promise<void>;
}

export function PreDeleteBackup({
  isOpen,
  onClose,
  conversationIds,
  onConfirmDelete,
}: PreDeleteBackupProps) {
  const [createBackup, setCreateBackup] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [backupCompleted, setBackupCompleted] = useState(false);
  const [backupId, setBackupId] = useState<string | null>(null);
  const [step, setStep] = useState<'confirm' | 'backup' | 'final'>('confirm');

  async function handleProceed() {
    if (!createBackup) {
      // Skip backup and go straight to final confirmation
      setStep('final');
      return;
    }

    // Start backup creation
    setStep('backup');
    setIsCreatingBackup(true);

    try {
      errorLogger.info('Creating pre-delete backup', {
        conversationCount: conversationIds.length,
      });

      // Call backup API
      const response = await fetch('/api/backup/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationIds,
          reason: 'bulk_delete',
        }),
      });

      if (!response.ok) {
        throw new Error('Backup creation failed');
      }

      const data = await response.json();

      // Simulate progress (in real implementation, use streaming or polling)
      for (let i = 0; i <= 100; i += 10) {
        setBackupProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      setBackupId(data.backupId);
      setBackupCompleted(true);
      setIsCreatingBackup(false);

      errorLogger.info('Pre-delete backup completed', {
        backupId: data.backupId,
        conversationCount: conversationIds.length,
      });

      toast.success('Backup created successfully');

      // Move to final confirmation
      setTimeout(() => setStep('final'), 1000);
    } catch (error) {
      errorLogger.error('Pre-delete backup failed', error);
      setIsCreatingBackup(false);
      toast.error('Backup creation failed. Delete operation cancelled.');
      onClose();
    }
  }

  async function handleFinalDelete() {
    try {
      await onConfirmDelete();
      onClose();
      
      if (backupId) {
        toast.success(
          `${conversationIds.length} conversations deleted. Backup ${backupId} available for 7 days.`
        );
      } else {
        toast.success(`${conversationIds.length} conversations deleted.`);
      }
    } catch (error) {
      errorLogger.error('Delete operation failed', error);
      toast.error('Failed to delete conversations');
    }
  }

  function handleCancel() {
    errorLogger.info('User cancelled delete operation');
    onClose();
  }

  function handleDownloadBackup() {
    if (backupId) {
      window.open(`/api/backup/download/${backupId}`, '_blank');
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        {step === 'confirm' && (
          <>
            <DialogHeader>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-destructive mt-0.5" />
                <div>
                  <DialogTitle>Confirm Bulk Delete</DialogTitle>
                  <DialogDescription>
                    You are about to delete {conversationIds.length} conversation
                    {conversationIds.length > 1 ? 's' : ''}.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Alert>
              <AlertDescription>
                This action cannot be undone. We recommend creating a backup before deleting.
              </AlertDescription>
            </Alert>

            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Checkbox
                id="create-backup"
                checked={createBackup}
                onCheckedChange={(checked) => setCreateBackup(checked === true)}
              />
              <div className="flex-1">
                <label
                  htmlFor="create-backup"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Create backup before deleting
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  Backup will be stored for 7 days and can be downloaded anytime.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleProceed}>
                {createBackup ? 'Create Backup & Continue' : 'Delete Without Backup'}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'backup' && (
          <>
            <DialogHeader>
              <DialogTitle>Creating Backup</DialogTitle>
              <DialogDescription>
                Please wait while we create a backup of your conversations...
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Progress value={backupProgress} className="h-2" />
              
              <div className="text-center text-sm text-muted-foreground">
                {backupProgress}% complete
              </div>

              {backupCompleted && (
                <Alert className="bg-success/10 border-success">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <AlertDescription className="text-success">
                    Backup created successfully!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </>
        )}

        {step === 'final' && (
          <>
            <DialogHeader>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-destructive mt-0.5" />
                <div>
                  <DialogTitle>Final Confirmation</DialogTitle>
                  <DialogDescription>
                    {backupCompleted
                      ? `Backup created successfully. Proceed with deleting ${conversationIds.length} conversation${conversationIds.length > 1 ? 's' : ''}?`
                      : `Are you sure you want to delete ${conversationIds.length} conversation${conversationIds.length > 1 ? 's' : ''} without a backup?`}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {backupCompleted && backupId && (
              <Alert>
                <Download className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Backup ID: {backupId}</span>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleDownloadBackup}
                    className="h-auto p-0"
                  >
                    Download Now
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleFinalDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Conversations
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

3. Create `train-wireframe/src/components/backup/BackupProgress.tsx`:

```typescript
'use client';

import React from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

interface BackupProgressProps {
  progress: number;
  isComplete: boolean;
  fileName?: string;
}

export function BackupProgress({
  progress,
  isComplete,
  fileName,
}: BackupProgressProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Progress Icon */}
          <div className="flex items-center justify-center">
            {isComplete ? (
              <div className="rounded-full bg-success/10 p-3">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            ) : (
              <div className="rounded-full bg-primary/10 p-3">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {isComplete ? 'Backup Complete' : 'Creating Backup...'}
              </span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* File Info */}
          {fileName && (
            <div className="text-center text-sm text-muted-foreground">
              {fileName}
            </div>
          )}

          {/* Completion Message */}
          {isComplete && (
            <div className="text-center text-sm text-success">
              Your conversations have been backed up successfully.
              <br />
              The backup will be available for download for 7 days.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

4. Implement tests for backup system.

**ACCEPTANCE CRITERIA:**

1. ✅ Checkpoint system saves progress after each successful conversation
2. ✅ Checkpoint includes completed items, failed items, and progress percentage
3. ✅ loadCheckpoint() retrieves checkpoint data from database
4. ✅ saveCheckpoint() uses transaction wrapper for atomic saves
5. ✅ getIncompleteCheckpoints() returns all incomplete batches for user
6. ✅ cleanupCheckpoint() deletes checkpoint after batch completion
7. ✅ filterPendingItems() correctly identifies unprocessed items
8. ✅ isItemCompleted() checks if item is in checkpoint
9. ✅ resumeBatchProcessing() processes only pending items (idempotent)
10. ✅ Resume UI detects incomplete batches on page load
11. ✅ ResumeDialog displays batch progress with stats
12. ✅ BatchSummary shows completed, failed, and pending counts
13. ✅ User can resume or discard incomplete batches
14. ✅ Pre-delete backup dialog offers backup option
15. ✅ Backup creation exports conversation data to JSON file
16. ✅ Backup metadata stored in database with 7-day retention
17. ✅ Backup progress displayed during creation
18. ✅ Backup download link provided after creation
19. ✅ Failed backup prevents delete operation
20. ✅ Expired backups cleaned up automatically

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
train-wireframe/src/lib/batch/
├── checkpoint.ts              # Checkpoint save/load functions
└── processor.ts               # Idempotent batch processing

train-wireframe/src/components/batch/
├── ResumeDialog.tsx           # Resume confirmation dialog
└── BatchSummary.tsx           # Batch progress summary

src/lib/backup/
└── storage.ts                 # Backup creation and cleanup

train-wireframe/src/components/backup/
├── PreDeleteBackup.tsx        # Pre-delete backup dialog
└── BackupProgress.tsx         # Backup creation progress

src/app/api/backup/
├── create/route.ts            # POST /api/backup/create
└── download/[id]/route.ts     # GET /api/backup/download/:id
```

**Integration Points:**
- Checkpoint system integrated with batch generation workflow
- Resume dialog triggered on application mount
- Pre-delete backup triggered by bulk delete actions
- Backup cleanup scheduled as cron job or maintenance task

**Configuration:**
```typescript
// Environment variables
BACKUP_RETENTION_DAYS=7
BACKUP_DIRECTORY=/var/backups
CHECKPOINT_SAVE_INTERVAL=1000 // Save after every N items
```

**VALIDATION REQUIREMENTS:**

**Unit Tests:**
1. Test saveCheckpoint with various progress states
2. Test loadCheckpoint with existing and non-existent checkpoints
3. Test filterPendingItems with different checkpoint states
4. Test isItemCompleted for completed and pending items
5. Test backup creation with conversation data
6. Test backup cleanup for expired backups
7. Test checkpoint cleanup after batch completion

**Integration Tests:**
1. Test full batch resume flow from checkpoint
2. Test idempotent processing (resume doesn't duplicate)
3. Test backup creation before bulk delete
4. Test failed backup prevents delete
5. Test resume dialog detection on page load
6. Test multi-checkpoint scenario (multiple incomplete batches)

**Manual Testing:**
1. Start batch generation, interrupt midway, verify checkpoint saved
2. Reload page, verify resume dialog appears
3. Resume batch, verify skips completed items
4. Attempt bulk delete, verify backup dialog appears
5. Create backup, verify download link works
6. Complete backup, verify delete proceeds
7. Cancel backup, verify delete cancelled
8. Wait 7 days (or manually trigger), verify backup cleanup

**DELIVERABLES:**

**Required Files:**
1. `train-wireframe/src/lib/batch/checkpoint.ts` (300+ lines)
2. `train-wireframe/src/lib/batch/processor.ts` (200+ lines)
3. `train-wireframe/src/components/batch/ResumeDialog.tsx` (250+ lines)
4. `train-wireframe/src/components/batch/BatchSummary.tsx` (150+ lines)
5. `src/lib/backup/storage.ts` (300+ lines)
6. `train-wireframe/src/components/backup/PreDeleteBackup.tsx` (350+ lines)
7. `train-wireframe/src/components/backup/BackupProgress.tsx` (100+ lines)
8. `src/app/api/backup/create/route.ts` (API endpoint)
9. `src/app/api/backup/download/[id]/route.ts` (API endpoint)
10. Unit tests for all modules
11. Integration tests for resume and backup flows

**API Endpoints:**
```typescript
// POST /api/backup/create
// Creates backup of specified conversations
{
  "conversationIds": ["conv-1", "conv-2"],
  "reason": "bulk_delete"
}
→ Returns: { "backupId": "backup-123", "filePath": "/backups/backup-123.json", "expiresAt": "2025-11-11T..." }

// GET /api/backup/download/:backupId
// Downloads backup file
→ Returns: JSON file download
```

**Documentation:**
- Add batch resume guide to README
- Document checkpoint data structure
- Document backup file format
- Add recovery procedures for interrupted batches
- Document backup retention policy

Implement complete batch resume and backup system, ensuring all acceptance criteria are met and users can safely recover from interruptions and accidental deletions.

++++++++++++++++++


### Prompt 7: Enhanced Notifications & Error Details

**Scope**: Toast notification system upgrade with error-specific toasts, error details modal with technical information  
**Dependencies**: Prompt 1 (Error classes), Prompt 2 (Rate limiter)  
**Estimated Time**: 7-10 hours  
**Risk Level**: Low

========================

You are a senior frontend developer implementing **Enhanced Notifications and Error Details System** for the Interactive LoRA Conversation Generation platform.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
The Training Data Generation platform needs to communicate errors and system status effectively to business users. Current toast notifications are basic and don't differentiate between error types. Users need:
- Clear, actionable error messages that explain what went wrong
- Different visual treatments for temporary vs permanent errors
- Ability to view technical details for troubleshooting
- Rate limit notifications with countdown timers
- Action buttons (Retry, Report Issue, View Details) in error toasts

**Functional Requirements (FR10.1.1):**

**Toast Notification Requirements:**
- Toasts must differentiate error types with appropriate colors and icons
  - **Temporary errors** (network, timeout): Orange/yellow, auto-dismiss after 5s
  - **Permanent errors** (validation, constraint): Red, require manual dismissal
  - **Action required** (rate limit, retry): Blue/purple, include action button
- Multiple toasts must stack vertically without overlapping
- Duplicate toasts must be prevented within 5-second window
- Toasts must support custom actions (Retry button, View Details link)
- Rate limit toasts must show countdown timer
- All toasts must be accessible (ARIA labels, screen reader announcements)

**Error Details Modal Requirements:**
- Modal must display both user-friendly summary and technical details
- Technical details tab must include: error code, stack trace, request/response data, timestamp
- Modal must support copy-to-clipboard for technical details
- Sensitive data must be sanitized before display
- Modal must include "Report Issue" button with pre-filled error data
- Modal must be dismissible with ESC key
- Modal must support search/filter for large error logs

**Technical Architecture:**
- TypeScript with strict mode enabled
- Sonner toast library (already integrated) with custom extensions
- Integration with error classes from Prompt 1 (`getUserMessage()`, `categorizeError()`)
- Integration with rate limiter from Prompt 2 for rate limit toasts
- Shadcn UI components for modal dialogs
- Files located in:
  - `train-wireframe/src/lib/notifications/`
  - `train-wireframe/src/components/notifications/`
  - `train-wireframe/src/components/errors/` (error details modal)

**CURRENT CODEBASE STATE:**

**Existing Toast System (Basic):**
```typescript
// Current usage throughout application
import { toast } from 'sonner';

// Basic success/error toasts only
toast.success('Operation completed');
toast.error('Something went wrong');

// No error-specific styling
// No action buttons
// No deduplication
// No rate limit handling
```

**Existing Sonner Setup:**
```typescript
// train-wireframe/src/App.tsx or layout
import { Toaster } from '@/components/ui/sonner';

export function App() {
  return (
    <>
      <Toaster /> {/* Basic Sonner toaster */}
      {/* ... */}
    </>
  );
}
```

**Existing Error Classes (from Prompt 1):**
```typescript
// train-wireframe/src/lib/errors/error-classes.ts - Already implemented
export class AppError extends Error {
  getUserMessage(): string { /* User-friendly message */ }
  code: ErrorCode;
  isRecoverable: boolean;
}

// train-wireframe/src/lib/errors/error-guards.ts - Already implemented
export function categorizeError(error: unknown): ErrorCategory;
export function getUserMessage(error: unknown): string;
```

**Gaps Prompt 7 Will Fill:**
1. No centralized notification manager
2. No error-specific toast components
3. No deduplication logic
4. No rate limit toast with countdown
5. No error details modal
6. No copy-to-clipboard for error details
7. No "Report Issue" workflow

**IMPLEMENTATION TASKS:**

**Task T-7.1.1: Notification Manager**

1. Create `train-wireframe/src/lib/notifications/manager.ts`:

```typescript
import { toast as sonnerToast } from 'sonner';
import {
  AppError,
  categorizeError,
  getUserMessage,
  isRetryable,
} from '../errors';
import { errorLogger } from '../errors/error-logger';

// Notification options
export interface NotificationOptions {
  duration?: number; // ms, 0 for persistent
  action?: {
    label: string;
    onClick: () => void;
  };
  description?: string;
  important?: boolean;
}

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Deduplication cache
interface ToastCacheEntry {
  message: string;
  timestamp: number;
}

/**
 * Centralized notification manager.
 * Manages toast display with deduplication and error-specific handling.
 */
class NotificationManager {
  private static instance: NotificationManager;
  private toastCache: Map<string, ToastCacheEntry> = new Map();
  private readonly deduplicationWindow = 5000; // 5 seconds

  private constructor() {
    // Singleton pattern
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  /**
   * Check if a toast with this message was recently shown.
   */
  private isDuplicate(message: string): boolean {
    const cached = this.toastCache.get(message);
    if (!cached) return false;

    const now = Date.now();
    if (now - cached.timestamp > this.deduplicationWindow) {
      this.toastCache.delete(message);
      return false;
    }

    return true;
  }

  /**
   * Add message to deduplication cache.
   */
  private cacheMessage(message: string): void {
    this.toastCache.set(message, {
      message,
      timestamp: Date.now(),
    });

    // Auto-cleanup after window expires
    setTimeout(() => {
      this.toastCache.delete(message);
    }, this.deduplicationWindow);
  }

  /**
   * Show success toast.
   */
  success(message: string, options: NotificationOptions = {}): void {
    if (this.isDuplicate(message)) {
      errorLogger.debug('Duplicate success toast suppressed', { message });
      return;
    }

    sonnerToast.success(message, {
      duration: options.duration || 4000,
      description: options.description,
      action: options.action,
    });

    this.cacheMessage(message);
  }

  /**
   * Show info toast.
   */
  info(message: string, options: NotificationOptions = {}): void {
    if (this.isDuplicate(message)) {
      errorLogger.debug('Duplicate info toast suppressed', { message });
      return;
    }

    sonnerToast.info(message, {
      duration: options.duration || 4000,
      description: options.description,
      action: options.action,
    });

    this.cacheMessage(message);
  }

  /**
   * Show warning toast.
   */
  warning(message: string, options: NotificationOptions = {}): void {
    if (this.isDuplicate(message)) {
      errorLogger.debug('Duplicate warning toast suppressed', { message });
      return;
    }

    sonnerToast.warning(message, {
      duration: options.duration || 5000,
      description: options.description,
      action: options.action,
    });

    this.cacheMessage(message);
  }

  /**
   * Show error toast with error-specific handling.
   */
  error(
    error: Error | AppError | string,
    options: NotificationOptions = {}
  ): void {
    const message = typeof error === 'string' ? error : getUserMessage(error);

    if (this.isDuplicate(message)) {
      errorLogger.debug('Duplicate error toast suppressed', { message });
      return;
    }

    const category = typeof error === 'string' ? 'unknown' : categorizeError(error);
    const retryable = typeof error !== 'string' && isRetryable(error);

    // Determine duration based on error type
    let duration = options.duration;
    if (duration === undefined) {
      duration = retryable ? 0 : 5000; // Persistent for permanent errors, auto-dismiss for temporary
    }

    sonnerToast.error(message, {
      duration,
      description: options.description,
      action: options.action,
    });

    this.cacheMessage(message);

    // Log error
    if (typeof error !== 'string') {
      errorLogger.error('Error toast displayed', error, { category });
    }
  }

  /**
   * Show error toast from Error object with automatic message extraction.
   */
  showError(
    error: Error | AppError | unknown,
    options: NotificationOptions & {
      onRetry?: () => void;
      onViewDetails?: () => void;
    } = {}
  ): void {
    const message = getUserMessage(error);
    const retryable = isRetryable(error);

    // Build action button
    let action: NotificationOptions['action'] | undefined;
    if (options.onRetry && retryable) {
      action = {
        label: 'Retry',
        onClick: options.onRetry,
      };
    } else if (options.onViewDetails) {
      action = {
        label: 'View Details',
        onClick: options.onViewDetails,
      };
    }

    this.error(message, {
      ...options,
      action,
    });
  }

  /**
   * Show custom toast with custom component.
   */
  custom(component: React.ReactNode, options: { duration?: number } = {}): void {
    sonnerToast.custom(component, {
      duration: options.duration || 0,
    });
  }

  /**
   * Dismiss all toasts.
   */
  dismissAll(): void {
    sonnerToast.dismiss();
  }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance();

// Convenience exports
export const showSuccess = (message: string, options?: NotificationOptions) =>
  notificationManager.success(message, options);

export const showError = (error: Error | AppError | string, options?: NotificationOptions) =>
  notificationManager.error(error, options);

export const showWarning = (message: string, options?: NotificationOptions) =>
  notificationManager.warning(message, options);

export const showInfo = (message: string, options?: NotificationOptions) =>
  notificationManager.info(message, options);
```

2. Implement unit tests for notification manager.

**Task T-7.1.2: Error-Specific Toast Components**

1. Create `train-wireframe/src/components/notifications/RateLimitToast.tsx`:

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RateLimitToastProps {
  retryAfterSeconds: number;
  onRetry?: () => void;
}

export function RateLimitToast({ retryAfterSeconds, onRetry }: RateLimitToastProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(retryAfterSeconds);

  useEffect(() => {
    if (secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsRemaining]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="flex items-start gap-3 p-3">
      <div className="p-2 rounded-full bg-warning/10">
        <Clock className="h-5 w-5 text-warning" />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-sm">Rate Limit Exceeded</div>
        <div className="text-sm text-muted-foreground mt-1">
          Too many requests. Please wait before trying again.
        </div>
        {secondsRemaining > 0 ? (
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 animate-pulse" />
            <span>Retry available in {formatTime(secondsRemaining)}</span>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="mt-2 h-7 text-xs"
          >
            Retry Now
          </Button>
        )}
      </div>
    </div>
  );
}
```

2. Create `train-wireframe/src/components/notifications/NetworkErrorToast.tsx`:

```typescript
'use client';

import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NetworkErrorToastProps {
  message: string;
  onRetry?: () => void;
}

export function NetworkErrorToast({ message, onRetry }: NetworkErrorToastProps) {
  return (
    <div className="flex items-start gap-3 p-3">
      <div className="p-2 rounded-full bg-destructive/10">
        <WifiOff className="h-5 w-5 text-destructive" />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-sm">Network Error</div>
        <div className="text-sm text-muted-foreground mt-1">{message}</div>
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="mt-2 h-7 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
```

3. Create `train-wireframe/src/components/notifications/ValidationErrorToast.tsx`:

```typescript
'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ValidationErrorToastProps {
  message: string;
  errors?: Record<string, string>;
}

export function ValidationErrorToast({ message, errors }: ValidationErrorToastProps) {
  return (
    <div className="flex items-start gap-3 p-3">
      <div className="p-2 rounded-full bg-destructive/10">
        <AlertCircle className="h-5 w-5 text-destructive" />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-sm">Validation Error</div>
        <div className="text-sm text-muted-foreground mt-1">{message}</div>
        {errors && Object.keys(errors).length > 0 && (
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field} className="flex items-start gap-1">
                <span className="font-medium">{field}:</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

4. Create `train-wireframe/src/components/notifications/GenerationErrorToast.tsx`:

```typescript
'use client';

import React from 'react';
import { Zap, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GenerationErrorToastProps {
  message: string;
  errorCode?: string;
  onViewDetails?: () => void;
}

export function GenerationErrorToast({
  message,
  errorCode,
  onViewDetails,
}: GenerationErrorToastProps) {
  return (
    <div className="flex items-start gap-3 p-3">
      <div className="p-2 rounded-full bg-warning/10">
        <Zap className="h-5 w-5 text-warning" />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-sm">Generation Failed</div>
        <div className="text-sm text-muted-foreground mt-1">{message}</div>
        {errorCode && (
          <div className="mt-1 text-xs font-mono text-muted-foreground">
            Error Code: {errorCode}
          </div>
        )}
        {onViewDetails && (
          <Button
            size="sm"
            variant="link"
            onClick={onViewDetails}
            className="mt-1 h-auto p-0 text-xs"
          >
            View Details
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
```

5. Implement component tests for toast components.

**Task T-7.2.1: Error Details Modal**

1. Create `train-wireframe/src/components/errors/ErrorDetailsModal.tsx`:

```typescript
'use client';

import React, { useState } from 'react';
import { Copy, Check, Bug, X, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AppError, ErrorCode } from '@/lib/errors';
import { sanitizeError } from '@/lib/errors/error-guards';
import { toast } from 'sonner';

interface ErrorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: Error | AppError;
  errorId?: string;
}

export function ErrorDetailsModal({
  isOpen,
  onClose,
  error,
  errorId,
}: ErrorDetailsModalProps) {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const sanitized = error instanceof AppError ? sanitizeError(error) : null;
  const isAppError = error instanceof AppError;

  async function handleCopyDetails() {
    const details = {
      errorId,
      message: error.message,
      name: error.name,
      code: isAppError ? error.code : undefined,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(details, null, 2));
      setCopied(true);
      toast.success('Error details copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  }

  function handleReportIssue() {
    const subject = encodeURIComponent(`Error Report: ${error.name}`);
    const body = encodeURIComponent(
      `Error ID: ${errorId || 'N/A'}\n\n` +
      `Error: ${error.message}\n\n` +
      `Stack Trace:\n${error.stack}\n\n` +
      `Please describe what you were doing when this error occurred:\n`
    );
    
    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`, '_blank');
  }

  const filteredStack = error.stack
    ?.split('\n')
    .filter((line) => line.toLowerCase().includes(searchQuery.toLowerCase()))
    .join('\n');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle>Error Details</DialogTitle>
              <DialogDescription>
                {sanitized?.message || error.message}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyDetails}
                className="h-8"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReportIssue}
                className="h-8"
              >
                <Bug className="h-3 w-3 mr-1" />
                Report
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="summary" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="technical">Technical Details</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            {/* User-Friendly Summary */}
            <div>
              <h4 className="text-sm font-semibold mb-2">What Happened</h4>
              <p className="text-sm text-muted-foreground">
                {sanitized?.message || error.message}
              </p>
            </div>

            {errorId && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Error ID</h4>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {errorId}
                </code>
              </div>
            )}

            {isAppError && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Error Type</h4>
                <Badge variant="secondary">{error.code}</Badge>
              </div>
            )}

            {isAppError && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Recoverable</h4>
                <Badge variant={error.isRecoverable ? 'default' : 'destructive'}>
                  {error.isRecoverable ? 'Yes - Can Retry' : 'No - Permanent Error'}
                </Badge>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold mb-2">What You Can Do</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {isAppError && error.isRecoverable && (
                  <>
                    <li>Try the operation again</li>
                    <li>Check your network connection</li>
                  </>
                )}
                {isAppError && !error.isRecoverable && (
                  <>
                    <li>Review your input and try again</li>
                    <li>Contact support if the issue persists</li>
                  </>
                )}
                <li>Report this issue using the Report button above</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search in stack trace..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Error Code */}
            {isAppError && error.code && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Error Code</h4>
                <code className="text-xs bg-muted px-2 py-1 rounded block">
                  {error.code}
                </code>
              </div>
            )}

            {/* Error Name */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Error Name</h4>
              <code className="text-xs bg-muted px-2 py-1 rounded block">
                {error.name}
              </code>
            </div>

            {/* Error Message */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Error Message</h4>
              <code className="text-xs bg-muted px-2 py-1 rounded block">
                {error.message}
              </code>
            </div>

            {/* Stack Trace */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Stack Trace</h4>
              <ScrollArea className="h-[300px] w-full rounded-md border">
                <pre className="text-xs p-3 font-mono">
                  {filteredStack || error.stack || 'No stack trace available'}
                </pre>
              </ScrollArea>
            </div>

            {/* Context (if AppError) */}
            {isAppError && error.context && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Context</h4>
                <ScrollArea className="h-[150px] w-full rounded-md border">
                  <pre className="text-xs p-3 font-mono">
                    {JSON.stringify(error.context, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            )}

            {/* Timestamp */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Timestamp</h4>
              <code className="text-xs bg-muted px-2 py-1 rounded block">
                {new Date().toISOString()}
              </code>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
```

2. Implement component tests for error details modal.

**Task T-7.2.2: Integration with Error Handling**

1. Update error boundary to use error details modal:

```typescript
// train-wireframe/src/components/errors/ErrorFallback.tsx
// Add "View Details" button that opens ErrorDetailsModal

import { useState } from 'react';
import { ErrorDetailsModal } from './ErrorDetailsModal';

export function ErrorFallback({ error, errorInfo, errorId, onReset }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
        <Card className="max-w-2xl w-full">
          {/* ... existing fallback UI ... */}
          <CardFooter className="flex gap-2">
            <Button onClick={onReset} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
            <Button
              onClick={() => setShowDetails(true)}
              variant="outline"
              className="flex-1"
            >
              <Info className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </CardFooter>
        </Card>
      </div>

      <ErrorDetailsModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        error={error}
        errorId={errorId}
      />
    </>
  );
}
```

2. Update API error handling to use notification manager:

```typescript
// Example usage in API routes or services
import { notificationManager } from '@/lib/notifications/manager';
import { RateLimitToast } from '@/components/notifications/RateLimitToast';
import { NetworkErrorToast } from '@/components/notifications/NetworkErrorToast';
import { APIError, ErrorCode } from '@/lib/errors';

// Rate limit error
if (error instanceof APIError && error.code === ErrorCode.ERR_API_RATE_LIMIT) {
  const retryAfter = 30; // seconds
  notificationManager.custom(
    <RateLimitToast
      retryAfterSeconds={retryAfter}
      onRetry={() => {
        // Retry logic
      }}
    />
  );
}

// Network error
if (error instanceof NetworkError) {
  notificationManager.custom(
    <NetworkErrorToast
      message={error.getUserMessage()}
      onRetry={() => {
        // Retry logic
      }}
    />
  );
}
```

3. Implement integration tests.

**ACCEPTANCE CRITERIA:**

1. ✅ NotificationManager singleton pattern implemented
2. ✅ Toast deduplication prevents duplicate messages within 5 seconds
3. ✅ success(), info(), warning(), error() methods work correctly
4. ✅ showError() automatically extracts user message from Error objects
5. ✅ Temporary errors auto-dismiss after 5 seconds
6. ✅ Permanent errors require manual dismissal
7. ✅ RateLimitToast displays countdown timer
8. ✅ RateLimitToast shows "Retry Now" button when timer expires
9. ✅ NetworkErrorToast includes retry button
10. ✅ ValidationErrorToast lists validation errors
11. ✅ GenerationErrorToast includes "View Details" link
12. ✅ ErrorDetailsModal displays Summary and Technical tabs
13. ✅ Technical tab includes error code, stack trace, context
14. ✅ Copy button copies error details to clipboard
15. ✅ Report Issue button opens pre-filled email
16. ✅ Search functionality filters stack trace
17. ✅ Modal dismissible with ESC key
18. ✅ All toasts accessible (ARIA labels, screen reader support)
19. ✅ Sensitive data sanitized before display
20. ✅ Error details modal integrates with error boundary

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
train-wireframe/src/lib/notifications/
└── manager.ts                          # Notification manager singleton

train-wireframe/src/components/notifications/
├── RateLimitToast.tsx                  # Rate limit toast with countdown
├── NetworkErrorToast.tsx               # Network error toast with retry
├── ValidationErrorToast.tsx            # Validation error toast with field list
└── GenerationErrorToast.tsx            # Generation error toast with details link

train-wireframe/src/components/errors/
└── ErrorDetailsModal.tsx               # Error details modal with tabs
```

**Integration Points:**
- NotificationManager used throughout application instead of raw toast()
- Error-specific toasts triggered by error classification
- ErrorDetailsModal opened from error boundary and toast "View Details" buttons
- Rate limit toasts triggered by APIClient rate limiter

**Styling:**
- Use Shadcn components for consistent theming
- Use Tailwind utility classes for custom styling
- Match application color scheme (destructive, warning, success)
- Ensure accessibility with proper ARIA labels

**VALIDATION REQUIREMENTS:**

**Unit Tests:**
1. Test NotificationManager deduplication logic
2. Test toast duration for different error types
3. Test RateLimitToast countdown timer
4. Test copy to clipboard functionality
5. Test search/filter in error details modal
6. Test sanitizeError removes sensitive data

**Component Tests:**
1. Test RateLimitToast renders with correct countdown
2. Test NetworkErrorToast retry button works
3. Test ValidationErrorToast displays errors list
4. Test GenerationErrorToast "View Details" link
5. Test ErrorDetailsModal tabs work correctly
6. Test ErrorDetailsModal copy and report buttons

**Integration Tests:**
1. Test error classification triggers correct toast
2. Test error boundary opens ErrorDetailsModal
3. Test toast "View Details" opens ErrorDetailsModal
4. Test rate limit toast appears on 429 error
5. Test network error toast on network failure

**Manual Testing:**
1. Trigger rate limit error, verify countdown toast appears
2. Verify countdown updates every second
3. Verify "Retry Now" button appears when countdown reaches 0
4. Trigger network error, verify retry button works
5. Trigger validation error, verify field list displays
6. Open error details modal, verify all tabs work
7. Test copy button, verify clipboard contains error details
8. Test report button, verify email client opens with pre-filled data
9. Test search in stack trace, verify filtering works
10. Verify duplicate toasts are suppressed within 5 seconds
11. Test ESC key dismisses modal
12. Test screen reader announces toasts

**DELIVERABLES:**

**Required Files:**
1. `train-wireframe/src/lib/notifications/manager.ts` (250+ lines)
2. `train-wireframe/src/components/notifications/RateLimitToast.tsx` (100+ lines)
3. `train-wireframe/src/components/notifications/NetworkErrorToast.tsx` (60+ lines)
4. `train-wireframe/src/components/notifications/ValidationErrorToast.tsx` (70+ lines)
5. `train-wireframe/src/components/notifications/GenerationErrorToast.tsx` (80+ lines)
6. `train-wireframe/src/components/errors/ErrorDetailsModal.tsx` (400+ lines)
7. Updated `train-wireframe/src/components/errors/ErrorFallback.tsx` (integration)
8. Unit tests for NotificationManager
9. Component tests for all toast components
10. Component tests for ErrorDetailsModal
11. Integration tests for error handling flow

**Documentation:**
- Add notification usage guide to README
- Document error-specific toast patterns
- Document ErrorDetailsModal usage
- Add accessibility notes for screen readers
- Document toast deduplication behavior

**Example Usage:**
```typescript
// Success notification
import { showSuccess } from '@/lib/notifications/manager';
showSuccess('Conversation generated successfully');

// Error notification with retry
import { notificationManager } from '@/lib/notifications/manager';
notificationManager.showError(error, {
  onRetry: () => retryGeneration(),
});

// Rate limit toast
import { RateLimitToast } from '@/components/notifications/RateLimitToast';
import { notificationManager } from '@/lib/notifications/manager';
notificationManager.custom(
  <RateLimitToast retryAfterSeconds={30} onRetry={retryRequest} />
);

// Error details modal
import { ErrorDetailsModal } from '@/components/errors/ErrorDetailsModal';
const [showDetails, setShowDetails] = useState(false);
<ErrorDetailsModal
  isOpen={showDetails}
  onClose={() => setShowDetails(false)}
  error={error}
  errorId="err-123"
/>
```

Implement complete enhanced notifications and error details system, ensuring all acceptance criteria are met and users receive clear, actionable feedback for all error scenarios.

++++++++++++++++++


---

## Quality Validation Checklist

### Post-Implementation Verification (Prompts 6-7)

**Batch Resume & Backup (Prompt 6):**
- [ ] Checkpoint saves after each successful conversation
- [ ] Checkpoint includes completed, failed, and pending items
- [ ] loadCheckpoint() retrieves checkpoint from database
- [ ] Resume UI detects incomplete batches on page load
- [ ] Resume skips already-completed items (idempotent)
- [ ] Pre-delete backup dialog offers backup option
- [ ] Backup creates JSON export file
- [ ] Backup stored with 7-day retention
- [ ] Failed backup prevents delete operation
- [ ] Backup cleanup runs on schedule

**Enhanced Notifications (Prompt 7):**
- [ ] NotificationManager deduplicates toasts within 5 seconds
- [ ] Temporary errors auto-dismiss after 5 seconds
- [ ] Permanent errors require manual dismissal
- [ ] RateLimitToast displays countdown timer
- [ ] NetworkErrorToast includes retry button
- [ ] ValidationErrorToast lists field errors
- [ ] ErrorDetailsModal displays Summary and Technical tabs
- [ ] Copy button copies error details to clipboard
- [ ] Report Issue button opens pre-filled email
- [ ] Search filters stack trace correctly
- [ ] All toasts accessible to screen readers

### Cross-Prompt Integration Testing

**Batch Resume Flow:**
1. Start batch generation → interrupt midway
2. Verify checkpoint saved with progress
3. Reload page → verify resume dialog appears
4. Resume batch → verify skips completed items
5. Complete batch → verify checkpoint cleaned up

**Backup Flow:**
1. Select conversations for bulk delete
2. Verify pre-delete backup dialog appears
3. Create backup → verify progress displayed
4. Verify download link works
5. Complete delete → verify conversations deleted
6. Verify backup stored with 7-day retention

**Notification Flow:**
1. Trigger rate limit error → verify countdown toast
2. Verify countdown updates every second
3. Wait for countdown → verify "Retry Now" button
4. Trigger network error → verify retry button
5. Click "View Details" → verify modal opens
6. Verify duplicate toasts suppressed

### Cross-Prompt Consistency

**Naming Conventions:**
- [ ] Component names follow Shadcn conventions (PascalCase)
- [ ] File names match component names
- [ ] Function names use camelCase
- [ ] Constants use SCREAMING_SNAKE_CASE
- [ ] Database columns use snake_case

**Architectural Patterns:**
- [ ] All checkpoint operations use transaction wrapper
- [ ] All errors logged to ErrorLogger
- [ ] All toasts use NotificationManager
- [ ] All modals use Shadcn Dialog component
- [ ] All async operations have proper error handling

**Data Models:**
- [ ] Checkpoint includes jobId, completedItems, failedItems, progress
- [ ] Backup includes backupId, userId, filePath, conversationIds, expiresAt
- [ ] Toast notifications include message, duration, action
- [ ] Error details include code, message, stack, context

**User Experience:**
- [ ] All actions have loading states
- [ ] All confirmations use proper dialogs
- [ ] All toasts provide actionable feedback
- [ ] All keyboard shortcuts documented
- [ ] All modals dismissible with ESC key

---

## Next Steps

**Prompt 8: Recovery Wizard & Testing** (18-22 hours)
- Recovery detection across all failure types
- Multi-step recovery wizard UI
- Comprehensive test suite for all error scenarios
- Dependencies: Prompts 1-7 (integrates all recovery mechanisms)

---

## Document Status

**Generated**: 2025-11-04  
**Version**: 1.0  
**Status**: Complete - Ready for Implementation

**Total Prompts**: 2 (Prompts 6-7 of 8 total)  
**Estimated Total Time**: 26-35 hours  
**Risk Level**: Medium (Prompt 6), Low (Prompt 7)  
**Dependencies**: Prompts 1-5 (Error Infrastructure, Transaction Wrapper, Storage Patterns)

**Implementation Team Recommendations:**
- **Prompt 6**: Full-stack engineer (batch processing + UI)
- **Prompt 7**: Frontend engineer (UI/UX for notifications)

**Estimated Calendar Time:**
- With 1 full-time engineer: 3-4 weeks
- With 2 engineers (parallel): 2 weeks

---

**End of E10 Part 3 Implementation Execution Instructions**


