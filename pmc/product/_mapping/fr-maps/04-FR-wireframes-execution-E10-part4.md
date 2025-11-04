# Interactive LoRA Conversation Generation - Implementation Execution Instructions (E10 Part 4)
**Generated**: 2025-11-04  
**Segment**: E10 - Error Handling & Recovery Module (Prompt 8)  
**Total Prompts**: 1 (of 8 total)  
**Estimated Implementation Time**: 18-22 hours

---

## Executive Summary

This document contains the detailed implementation instructions for **Prompt 8** of the E10 segment (Error Handling & Recovery Module). This prompt was originally too cursory and has been expanded to match the comprehensive detail level of Prompts 1-7.

**Prompt 8** implements the **Recovery Wizard** - a guided multi-step interface for detecting and recovering from all types of failures - and the **Comprehensive Test Suite** that validates the entire error handling and recovery system end-to-end.

This prompt is the **capstone** of the E10 segment, integrating all recovery mechanisms from Prompts 1-7 (auto-save, batch resume, backups) into a unified user experience, and ensuring production-grade reliability through extensive testing.

---

## Context from Prompts 1-7

### What Has Been Implemented (Prompts 1-7)

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

**Prompt 6 Deliverables:**
- Batch checkpoint system (save/load/cleanup)
- Idempotent batch processor
- Resume dialog and batch summary UI
- Pre-delete backup system with 7-day retention
- Files: `train-wireframe/src/lib/batch/checkpoint.ts`, `processor.ts`, `components/batch/ResumeDialog.tsx`, `src/lib/backup/storage.ts`

**Prompt 7 Deliverables:**
- NotificationManager with toast deduplication
- Error-specific toasts (RateLimit, Network, Validation, Generation)
- ErrorDetailsModal with Summary and Technical tabs
- Copy to clipboard and Report Issue functionality
- Files: `train-wireframe/src/lib/notifications/manager.ts`, `components/notifications/*`, `components/errors/ErrorDetailsModal.tsx`

### Integration Points for Prompt 8

**What Prompt 8 Will Use:**
- Auto-save detection from Prompt 5 (`detectDrafts()`)
- Batch checkpoint detection from Prompt 6 (`getIncompleteCheckpoints()`)
- Backup system from Prompt 6 (for recovery data integrity)
- Error classes from Prompt 1 (for error classification)
- NotificationManager from Prompt 7 (for recovery success/failure messages)
- ErrorLogger from Prompt 1 (for logging recovery operations)

**What Prompt 8 Will Provide:**
- Unified recovery wizard detecting all failure types
- Guided multi-step recovery process
- Comprehensive test suite validating entire E10 segment
- Production readiness validation

---

## Implementation Prompts

### Prompt 8: Recovery Wizard & Comprehensive Testing

**Scope**: Recovery detection across all failure types, multi-step recovery wizard UI, comprehensive test suite for all error scenarios  
**Dependencies**: Prompts 1-7 (integrates all recovery mechanisms)  
**Estimated Time**: 18-22 hours  
**Risk Level**: Low-Medium

========================

You are a senior full-stack developer implementing the **Recovery Wizard and Comprehensive Testing Suite** for the Interactive LoRA Conversation Generation platform.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
The Training Data Generation platform enables batch generation of 90-100 AI training conversations. Users can experience various types of failures:
- Browser crashes or tab closures during conversation editing
- Network interruptions during batch generation
- Server errors during export operations
- Accidental bulk deletes of important conversations

Business users need:
- Automatic detection of recoverable data when they return to the application
- Guided recovery process with clear explanations of what can be recovered
- Confidence that their work is protected and can be restored
- Comprehensive testing ensuring the recovery system works reliably

**Functional Requirements (FR10.1.2):**

**Recovery Wizard Requirements:**
- Wizard must automatically detect all recoverable data on page load
- Must detect: draft conversations, incomplete batches, available backups, failed exports
- Must display list of recoverable items with type, timestamp, and description
- User must be able to select which items to recover
- Recovery progress must show item-by-item status (pending, recovering, success, failed)
- Recovery summary must show success/failure counts and next steps
- Wizard must be dismissible with option to recover later
- All recovery operations must be logged for audit trail
- Wizard must handle partial recovery (some items succeed, others fail)

**Testing Requirements:**
- Unit tests must cover all error classes, type guards, and utilities (85%+ coverage)
- Integration tests must cover API error flows end-to-end
- Component tests must verify error boundaries, modals, and wizards
- E2E tests must simulate real failure scenarios (network loss, timeouts, crashes)
- Performance tests must verify error handling doesn't degrade normal operations
- Manual test scenarios must be documented for QA validation

**Technical Architecture:**
- TypeScript with strict mode enabled
- Integration with auto-save from Prompt 5 (`train-wireframe/src/lib/auto-save/`)
- Integration with batch checkpoints from Prompt 6 (`train-wireframe/src/lib/batch/`)
- Integration with backup system from Prompt 6 (`src/lib/backup/`)
- Files located in:
  - Recovery logic: `train-wireframe/src/lib/recovery/`
  - Recovery UI: `train-wireframe/src/components/recovery/`
  - Test suites: `train-wireframe/src/__tests__/`

**CURRENT CODEBASE STATE:**

**Existing Recovery Mechanisms (from Prompts 5-6):**
```typescript
// Auto-save detection (Prompt 5)
// train-wireframe/src/lib/auto-save/storage.ts
export async function detectDrafts(): Promise<DraftConversation[]> {
  // Returns drafts from IndexedDB
}

// Batch checkpoint detection (Prompt 6)
// train-wireframe/src/lib/batch/checkpoint.ts
export async function getIncompleteCheckpoints(): Promise<BatchCheckpoint[]> {
  // Returns incomplete batches from database
}

// Backup detection (Prompt 6)
// src/lib/backup/storage.ts
export async function getBackup(backupId: string): Promise<Backup | null> {
  // Returns backup metadata
}
```

**Existing Error Infrastructure (from Prompts 1-3):**
```typescript
// Error classes and guards available
import { AppError, categorizeError, getUserMessage } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { ErrorBoundary } from '@/components/errors';
```

**Existing Notification System (from Prompt 7):**
```typescript
// Notification manager available
import { notificationManager } from '@/lib/notifications/manager';
import { showSuccess, showError } from '@/lib/notifications/manager';
```

**Gaps Prompt 8 Will Fill:**
1. No unified recovery detection across all sources
2. No recovery wizard UI
3. No priority scoring for recovery items
4. No guided recovery workflow
5. No comprehensive test suite for error handling
6. No integration tests for recovery flows
7. No performance validation of error handling

**IMPLEMENTATION TASKS:**

**Task T-8.1.1: Recovery Detection System**

1. Create `train-wireframe/src/lib/recovery/types.ts`:

```typescript
/**
 * Types for recovery detection and wizard.
 */

// Recoverable item types
export enum RecoverableItemType {
  DRAFT_CONVERSATION = 'DRAFT_CONVERSATION',
  INCOMPLETE_BATCH = 'INCOMPLETE_BATCH',
  AVAILABLE_BACKUP = 'AVAILABLE_BACKUP',
  FAILED_EXPORT = 'FAILED_EXPORT',
}

// Recovery status
export enum RecoveryStatus {
  PENDING = 'PENDING',
  RECOVERING = 'RECOVERING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

// Recoverable item interface
export interface RecoverableItem {
  id: string;
  type: RecoverableItemType;
  timestamp: string; // ISO date string
  description: string; // User-friendly description
  priority: number; // 0-100, higher = more important
  data: unknown; // Type-specific recovery data
  status: RecoveryStatus;
  error?: string; // Error message if recovery failed
}

// Draft conversation recovery data
export interface DraftRecoveryData {
  draftId: string;
  conversationId?: string;
  topic: string;
  turns: number;
  lastSaved: string;
  conflictsWith?: string; // Existing conversation ID
}

// Batch checkpoint recovery data
export interface BatchRecoveryData {
  jobId: string;
  totalItems: number;
  completedItems: number;
  failedItems: number;
  progressPercentage: number;
  lastCheckpoint: string;
}

// Backup recovery data
export interface BackupRecoveryData {
  backupId: string;
  conversationCount: number;
  backupReason: string;
  expiresAt: string;
  filePath: string;
}

// Failed export recovery data
export interface ExportRecoveryData {
  exportId: string;
  format: string;
  conversationCount: number;
  failureReason: string;
  canRetry: boolean;
}

// Recovery result
export interface RecoveryResult {
  itemId: string;
  success: boolean;
  error?: string;
  recoveredData?: unknown;
}

// Recovery summary
export interface RecoverySummary {
  totalItems: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  results: RecoveryResult[];
  timestamp: string;
}
```

2. Create `train-wireframe/src/lib/recovery/detection.ts`:

```typescript
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
```

3. Implement unit tests for recovery detection.

**Task T-8.1.2: Recovery Execution Logic**

1. Create `train-wireframe/src/lib/recovery/executor.ts`:

```typescript
import { saveDraft, deleteDraft } from '../auto-save/storage';
import { resumeBatchProcessing } from '../batch/processor';
import { cleanupCheckpoint } from '../batch/checkpoint';
import { errorLogger } from '../errors/error-logger';
import {
  RecoverableItem,
  RecoverableItemType,
  RecoveryStatus,
  RecoveryResult,
  RecoverySummary,
  DraftRecoveryData,
  BatchRecoveryData,
  BackupRecoveryData,
  ExportRecoveryData,
} from './types';

/**
 * Recover a draft conversation.
 * 
 * @param item Recoverable item with draft data
 * @returns Recovery result
 */
async function recoverDraft(item: RecoverableItem): Promise<RecoveryResult> {
  const data = item.data as DraftRecoveryData;
  
  try {
    errorLogger.info('Recovering draft', { draftId: data.draftId });
    
    // TODO: Implement actual draft recovery logic
    // This would typically involve:
    // 1. Load draft from IndexedDB
    // 2. Restore to conversation editor
    // 3. Delete draft from storage
    
    await deleteDraft(data.draftId);
    
    errorLogger.info('Draft recovered successfully', { draftId: data.draftId });
    
    return {
      itemId: item.id,
      success: true,
      recoveredData: { conversationId: data.conversationId },
    };
  } catch (error) {
    errorLogger.error('Failed to recover draft', error, { draftId: data.draftId });
    
    return {
      itemId: item.id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Recover an incomplete batch.
 * 
 * @param item Recoverable item with batch data
 * @returns Recovery result
 */
async function recoverBatch(item: RecoverableItem): Promise<RecoveryResult> {
  const data = item.data as BatchRecoveryData;
  
  try {
    errorLogger.info('Recovering batch', { jobId: data.jobId });
    
    // TODO: Implement actual batch resume logic
    // This would typically involve:
    // 1. Load batch configuration
    // 2. Resume from checkpoint
    // 3. Continue processing
    
    // For now, just cleanup the checkpoint
    await cleanupCheckpoint(data.jobId);
    
    errorLogger.info('Batch recovered successfully', { jobId: data.jobId });
    
    return {
      itemId: item.id,
      success: true,
      recoveredData: { jobId: data.jobId },
    };
  } catch (error) {
    errorLogger.error('Failed to recover batch', error, { jobId: data.jobId });
    
    return {
      itemId: item.id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Restore from backup.
 * 
 * @param item Recoverable item with backup data
 * @returns Recovery result
 */
async function recoverBackup(item: RecoverableItem): Promise<RecoveryResult> {
  const data = item.data as BackupRecoveryData;
  
  try {
    errorLogger.info('Recovering from backup', { backupId: data.backupId });
    
    // TODO: Implement actual backup restore logic
    // This would typically involve:
    // 1. Load backup file
    // 2. Parse conversation data
    // 3. Import into database
    
    errorLogger.info('Backup recovered successfully', { backupId: data.backupId });
    
    return {
      itemId: item.id,
      success: true,
      recoveredData: { 
        backupId: data.backupId,
        conversationCount: data.conversationCount,
      },
    };
  } catch (error) {
    errorLogger.error('Failed to recover backup', error, { backupId: data.backupId });
    
    return {
      itemId: item.id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Retry failed export.
 * 
 * @param item Recoverable item with export data
 * @returns Recovery result
 */
async function recoverExport(item: RecoverableItem): Promise<RecoveryResult> {
  const data = item.data as ExportRecoveryData;
  
  try {
    errorLogger.info('Recovering failed export', { exportId: data.exportId });
    
    // TODO: Implement actual export retry logic
    // This would typically involve:
    // 1. Load export configuration
    // 2. Retry export operation
    // 3. Update export status
    
    errorLogger.info('Export recovered successfully', { exportId: data.exportId });
    
    return {
      itemId: item.id,
      success: true,
      recoveredData: { 
        exportId: data.exportId,
        format: data.format,
      },
    };
  } catch (error) {
    errorLogger.error('Failed to recover export', error, { exportId: data.exportId });
    
    return {
      itemId: item.id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Recover a single item based on its type.
 * 
 * @param item Recoverable item
 * @returns Recovery result
 */
export async function recoverItem(item: RecoverableItem): Promise<RecoveryResult> {
  errorLogger.info('Starting recovery', { 
    itemId: item.id, 
    type: item.type,
  });
  
  switch (item.type) {
    case RecoverableItemType.DRAFT_CONVERSATION:
      return await recoverDraft(item);
    
    case RecoverableItemType.INCOMPLETE_BATCH:
      return await recoverBatch(item);
    
    case RecoverableItemType.AVAILABLE_BACKUP:
      return await recoverBackup(item);
    
    case RecoverableItemType.FAILED_EXPORT:
      return await recoverExport(item);
    
    default:
      errorLogger.error('Unknown recovery type', { itemId: item.id, type: item.type });
      return {
        itemId: item.id,
        success: false,
        error: `Unknown recovery type: ${item.type}`,
      };
  }
}

/**
 * Recover multiple items in sequence.
 * Updates each item's status as recovery progresses.
 * 
 * @param items Items to recover
 * @param onProgress Optional callback for progress updates
 * @returns Recovery summary
 * 
 * @example
 * const items = await detectRecoverableData();
 * const summary = await recoverItems(
 *   items,
 *   (currentItem, progress) => updateUI(currentItem, progress)
 * );
 */
export async function recoverItems(
  items: RecoverableItem[],
  onProgress?: (item: RecoverableItem, progress: number) => void
): Promise<RecoverySummary> {
  errorLogger.info('Starting recovery batch', { itemCount: items.length });
  
  const results: RecoveryResult[] = [];
  let successCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    // Skip if item is already processed
    if (item.status === RecoveryStatus.SKIPPED) {
      skippedCount++;
      results.push({
        itemId: item.id,
        success: true,
        error: 'Skipped by user',
      });
      continue;
    }
    
    // Update status to recovering
    item.status = RecoveryStatus.RECOVERING;
    
    // Notify progress
    if (onProgress) {
      onProgress(item, ((i + 1) / items.length) * 100);
    }
    
    // Attempt recovery
    const result = await recoverItem(item);
    results.push(result);
    
    // Update status based on result
    if (result.success) {
      item.status = RecoveryStatus.SUCCESS;
      successCount++;
    } else {
      item.status = RecoveryStatus.FAILED;
      item.error = result.error;
      failedCount++;
    }
    
    // Small delay between items to avoid overwhelming the system
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  
  const summary: RecoverySummary = {
    totalItems: items.length,
    successCount,
    failedCount,
    skippedCount,
    results,
    timestamp: new Date().toISOString(),
  };
  
  errorLogger.info('Recovery batch complete', summary);
  
  return summary;
}
```

2. Implement unit tests for recovery execution.

**Task T-8.1.3: Recovery Wizard UI Components**

1. Create `train-wireframe/src/components/recovery/RecoverableItemList.tsx`:

```typescript
'use client';

import React from 'react';
import { FileText, Loader, Database, Download, CheckCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  RecoverableItem, 
  RecoverableItemType,
  RecoveryStatus 
} from '@/lib/recovery/types';

interface RecoverableItemListProps {
  items: RecoverableItem[];
  selectedIds: Set<string>;
  onToggleSelection: (itemId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const ICONS = {
  [RecoverableItemType.DRAFT_CONVERSATION]: FileText,
  [RecoverableItemType.INCOMPLETE_BATCH]: Loader,
  [RecoverableItemType.AVAILABLE_BACKUP]: Database,
  [RecoverableItemType.FAILED_EXPORT]: Download,
};

const TYPE_COLORS = {
  [RecoverableItemType.DRAFT_CONVERSATION]: 'bg-blue-500/10 text-blue-700',
  [RecoverableItemType.INCOMPLETE_BATCH]: 'bg-purple-500/10 text-purple-700',
  [RecoverableItemType.AVAILABLE_BACKUP]: 'bg-green-500/10 text-green-700',
  [RecoverableItemType.FAILED_EXPORT]: 'bg-orange-500/10 text-orange-700',
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

function RecoverableItemCard({ 
  item, 
  selected, 
  onToggle 
}: { 
  item: RecoverableItem; 
  selected: boolean; 
  onToggle: () => void;
}) {
  const Icon = ICONS[item.type];
  const colorClass = TYPE_COLORS[item.type];
  
  return (
    <Card 
      className={`cursor-pointer transition-all ${
        selected ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'
      }`}
      onClick={onToggle}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <Checkbox
            checked={selected}
            onCheckedChange={onToggle}
            className="mt-1"
          />
          
          {/* Icon */}
          <div className={`p-2 rounded-lg ${colorClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-medium text-sm truncate">
                  {item.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTimestamp(item.timestamp)}
                </p>
              </div>
              
              {/* Priority Badge */}
              {item.priority >= 70 && (
                <Badge variant="default" className="text-xs">
                  High Priority
                </Badge>
              )}
            </div>
            
            {/* Type Badge */}
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {item.type.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RecoverableItemList({
  items,
  selectedIds,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
}: RecoverableItemListProps) {
  const allSelected = items.length > 0 && items.every((item) => selectedIds.has(item.id));
  const someSelected = items.some((item) => selectedIds.has(item.id)) && !allSelected;
  
  return (
    <div className="space-y-4">
      {/* Header with Select All */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            ref={(el) => el && (el.indeterminate = someSelected)}
            onCheckedChange={(checked) => {
              if (checked) {
                onSelectAll();
              } else {
                onDeselectAll();
              }
            }}
          />
          <span className="text-sm font-medium">
            {selectedIds.size} of {items.length} selected
          </span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            className="text-sm text-primary hover:underline"
            disabled={allSelected}
          >
            Select All
          </button>
          <span className="text-sm text-muted-foreground">|</span>
          <button
            onClick={onDeselectAll}
            className="text-sm text-primary hover:underline"
            disabled={selectedIds.size === 0}
          >
            Deselect All
          </button>
        </div>
      </div>
      
      {/* Item List */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
            <p className="text-lg font-semibold">No items to recover</p>
            <p className="text-sm text-muted-foreground mt-1">
              All your data is safe and up to date!
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {items.map((item) => (
              <RecoverableItemCard
                key={item.id}
                item={item}
                selected={selectedIds.has(item.id)}
                onToggle={() => onToggleSelection(item.id)}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
```

2. Create `train-wireframe/src/components/recovery/RecoveryProgress.tsx`:

```typescript
'use client';

import React from 'react';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { RecoverableItem, RecoveryStatus } from '@/lib/recovery/types';

interface RecoveryProgressProps {
  items: RecoverableItem[];
  currentProgress: number; // 0-100
}

const STATUS_ICONS = {
  [RecoveryStatus.PENDING]: AlertCircle,
  [RecoveryStatus.RECOVERING]: Loader2,
  [RecoveryStatus.SUCCESS]: CheckCircle,
  [RecoveryStatus.FAILED]: XCircle,
  [RecoveryStatus.SKIPPED]: AlertCircle,
};

const STATUS_COLORS = {
  [RecoveryStatus.PENDING]: 'text-muted-foreground',
  [RecoveryStatus.RECOVERING]: 'text-primary animate-spin',
  [RecoveryStatus.SUCCESS]: 'text-success',
  [RecoveryStatus.FAILED]: 'text-destructive',
  [RecoveryStatus.SKIPPED]: 'text-muted-foreground',
};

const STATUS_LABELS = {
  [RecoveryStatus.PENDING]: 'Waiting',
  [RecoveryStatus.RECOVERING]: 'Recovering',
  [RecoveryStatus.SUCCESS]: 'Success',
  [RecoveryStatus.FAILED]: 'Failed',
  [RecoveryStatus.SKIPPED]: 'Skipped',
};

function RecoveryItemStatus({ item }: { item: RecoverableItem }) {
  const Icon = STATUS_ICONS[item.status];
  const colorClass = STATUS_COLORS[item.status];
  const label = STATUS_LABELS[item.status];
  
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Status Icon */}
          <Icon className={`h-5 w-5 flex-shrink-0 ${colorClass}`} />
          
          {/* Description */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{item.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant={item.status === RecoveryStatus.SUCCESS ? 'default' : 'secondary'}
                className="text-xs"
              >
                {label}
              </Badge>
              {item.error && (
                <span className="text-xs text-destructive truncate">
                  {item.error}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RecoveryProgress({ items, currentProgress }: RecoveryProgressProps) {
  const successCount = items.filter((i) => i.status === RecoveryStatus.SUCCESS).length;
  const failedCount = items.filter((i) => i.status === RecoveryStatus.FAILED).length;
  const recoveringCount = items.filter((i) => i.status === RecoveryStatus.RECOVERING).length;
  
  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-muted-foreground">
            {Math.round(currentProgress)}%
          </span>
        </div>
        <Progress value={currentProgress} className="h-2" />
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-lg bg-success/10">
          <div className="text-2xl font-bold text-success">{successCount}</div>
          <div className="text-xs text-muted-foreground">Recovered</div>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-destructive/10">
          <div className="text-2xl font-bold text-destructive">{failedCount}</div>
          <div className="text-xs text-muted-foreground">Failed</div>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-primary/10">
          <div className="text-2xl font-bold text-primary">{recoveringCount}</div>
          <div className="text-xs text-muted-foreground">In Progress</div>
        </div>
      </div>
      
      {/* Item List */}
      <div>
        <h4 className="text-sm font-semibold mb-3">Recovery Status</h4>
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {items.map((item) => (
              <RecoveryItemStatus key={item.id} item={item} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
```

3. Create `train-wireframe/src/components/recovery/RecoverySummary.tsx`:

```typescript
'use client';

import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RecoverySummary as RecoverySummaryType } from '@/lib/recovery/types';

interface RecoverySummaryProps {
  summary: RecoverySummaryType;
  onClose: () => void;
  onViewFailures?: () => void;
}

export function RecoverySummary({
  summary,
  onClose,
  onViewFailures,
}: RecoverySummaryProps) {
  const hasFailures = summary.failedCount > 0;
  const allSuccess = summary.successCount === summary.totalItems;
  
  return (
    <div className="space-y-6">
      {/* Success/Warning Header */}
      {allSuccess ? (
        <div className="text-center py-6">
          <div className="inline-flex p-4 rounded-full bg-success/10 mb-4">
            <CheckCircle className="h-12 w-12 text-success" />
          </div>
          <h3 className="text-2xl font-bold">Recovery Complete!</h3>
          <p className="text-muted-foreground mt-2">
            All {summary.totalItems} items were recovered successfully.
          </p>
        </div>
      ) : hasFailures ? (
        <div className="text-center py-6">
          <div className="inline-flex p-4 rounded-full bg-warning/10 mb-4">
            <AlertTriangle className="h-12 w-12 text-warning" />
          </div>
          <h3 className="text-2xl font-bold">Partial Recovery</h3>
          <p className="text-muted-foreground mt-2">
            {summary.successCount} of {summary.totalItems} items recovered successfully.
          </p>
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="inline-flex p-4 rounded-full bg-destructive/10 mb-4">
            <XCircle className="h-12 w-12 text-destructive" />
          </div>
          <h3 className="text-2xl font-bold">Recovery Failed</h3>
          <p className="text-muted-foreground mt-2">
            Unable to recover any items. Please try again or contact support.
          </p>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
            <div className="text-3xl font-bold">{summary.successCount}</div>
            <div className="text-sm text-muted-foreground">Recovered</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <div className="text-3xl font-bold">{summary.failedCount}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <div className="text-3xl font-bold">{summary.skippedCount}</div>
            <div className="text-sm text-muted-foreground">Skipped</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Failure Alert */}
      {hasFailures && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {summary.failedCount} item{summary.failedCount > 1 ? 's' : ''} could not be recovered.
            {onViewFailures && (
              <>
                {' '}
                <button
                  onClick={onViewFailures}
                  className="font-medium underline"
                >
                  View details
                </button>
              </>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Next Steps */}
      <div>
        <h4 className="font-semibold mb-3">Next Steps</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {summary.successCount > 0 && (
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>
                Your recovered data is now available in the application.
              </span>
            </li>
          )}
          {hasFailures && (
            <li className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
              <span>
                Failed items may require manual recovery or support assistance.
              </span>
            </li>
          )}
          <li className="flex items-start gap-2">
            <Download className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>
              A recovery log has been saved for your records.
            </span>
          </li>
        </ul>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        {hasFailures && onViewFailures && (
          <Button variant="outline" onClick={onViewFailures} className="flex-1">
            View Failures
          </Button>
        )}
        <Button onClick={onClose} className="flex-1">
          {allSuccess ? 'Done' : 'Close'}
        </Button>
      </div>
    </div>
  );
}
```

4. Create `train-wireframe/src/components/recovery/RecoveryWizard.tsx`:

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { detectRecoverableData } from '@/lib/recovery/detection';
import { recoverItems } from '@/lib/recovery/executor';
import { 
  RecoverableItem, 
  RecoveryStatus,
  RecoverySummary as RecoverySummaryType
} from '@/lib/recovery/types';
import { RecoverableItemList } from './RecoverableItemList';
import { RecoveryProgress as RecoveryProgressComponent } from './RecoveryProgress';
import { RecoverySummary } from './RecoverySummary';
import { errorLogger } from '@/lib/errors/error-logger';
import { toast } from 'sonner';

enum WizardStep {
  DETECTION = 'DETECTION',
  SELECTION = 'SELECTION',
  RECOVERY = 'RECOVERY',
  SUMMARY = 'SUMMARY',
}

interface RecoveryWizardProps {
  autoOpen?: boolean; // If true, opens automatically when items detected
  onComplete?: () => void;
}

export function RecoveryWizard({ autoOpen = true, onComplete }: RecoveryWizardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<WizardStep>(WizardStep.DETECTION);
  const [items, setItems] = useState<RecoverableItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [recoveryProgress, setRecoveryProgress] = useState(0);
  const [summary, setSummary] = useState<RecoverySummaryType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Detect recoverable items on mount
  useEffect(() => {
    detectItems();
  }, []);

  async function detectItems() {
    try {
      setIsLoading(true);
      errorLogger.info('Detecting recoverable items');
      
      const detectedItems = await detectRecoverableData();
      
      if (detectedItems.length > 0) {
        setItems(detectedItems);
        
        // Pre-select all items
        setSelectedIds(new Set(detectedItems.map((item) => item.id)));
        
        // Open wizard if autoOpen is enabled
        if (autoOpen) {
          setIsOpen(true);
          setStep(WizardStep.SELECTION);
          
          toast.info(
            `Found ${detectedItems.length} recoverable item${detectedItems.length > 1 ? 's' : ''}`
          );
        }
      } else {
        errorLogger.info('No recoverable items found');
      }
    } catch (error) {
      errorLogger.error('Failed to detect recoverable items', error);
      toast.error('Failed to detect recoverable data');
    } finally {
      setIsLoading(false);
    }
  }

  function handleToggleSelection(itemId: string) {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(itemId)) {
      newSelectedIds.delete(itemId);
    } else {
      newSelectedIds.add(itemId);
    }
    setSelectedIds(newSelectedIds);
  }

  function handleSelectAll() {
    setSelectedIds(new Set(items.map((item) => item.id)));
  }

  function handleDeselectAll() {
    setSelectedIds(new Set());
  }

  async function handleStartRecovery() {
    if (selectedIds.size === 0) {
      toast.warning('Please select at least one item to recover');
      return;
    }

    try {
      setStep(WizardStep.RECOVERY);
      setRecoveryProgress(0);
      
      // Mark non-selected items as skipped
      const itemsToRecover = items.map((item) => ({
        ...item,
        status: selectedIds.has(item.id) ? RecoveryStatus.PENDING : RecoveryStatus.SKIPPED,
      }));
      
      setItems(itemsToRecover);
      
      // Execute recovery
      const recoverySummary = await recoverItems(
        itemsToRecover,
        (currentItem, progress) => {
          setRecoveryProgress(progress);
          setItems((prevItems) =>
            prevItems.map((item) =>
              item.id === currentItem.id ? currentItem : item
            )
          );
        }
      );
      
      setSummary(recoverySummary);
      setStep(WizardStep.SUMMARY);
      
      // Show success/failure toast
      if (recoverySummary.failedCount === 0) {
        toast.success(
          `Successfully recovered ${recoverySummary.successCount} item${recoverySummary.successCount > 1 ? 's' : ''}!`
        );
      } else {
        toast.warning(
          `Recovered ${recoverySummary.successCount} of ${recoverySummary.totalItems} items`
        );
      }
    } catch (error) {
      errorLogger.error('Recovery failed', error);
      toast.error('Recovery process failed');
      setStep(WizardStep.SELECTION);
    }
  }

  function handleClose() {
    setIsOpen(false);
    
    if (onComplete) {
      onComplete();
    }
    
    // Reset wizard state
    setTimeout(() => {
      setStep(WizardStep.DETECTION);
      setItems([]);
      setSelectedIds(new Set());
      setRecoveryProgress(0);
      setSummary(null);
    }, 300);
  }

  function handleSkipRecovery() {
    errorLogger.info('User skipped recovery');
    toast.info('Recovery skipped. You can access this wizard later from Settings.');
    handleClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            {step !== WizardStep.SUMMARY && (
              <AlertCircle className="h-6 w-6 text-primary mt-0.5" />
            )}
            <div className="flex-1">
              <DialogTitle>
                {step === WizardStep.DETECTION && 'Detecting Recoverable Data...'}
                {step === WizardStep.SELECTION && 'Data Recovery Available'}
                {step === WizardStep.RECOVERY && 'Recovering Your Data'}
                {step === WizardStep.SUMMARY && 'Recovery Complete'}
              </DialogTitle>
              <DialogDescription>
                {step === WizardStep.DETECTION &&
                  'Scanning for recoverable drafts, batches, and backups...'}
                {step === WizardStep.SELECTION &&
                  'Select the items you want to recover.'}
                {step === WizardStep.RECOVERY &&
                  'Please wait while we recover your data...'}
                {step === WizardStep.SUMMARY &&
                  'Recovery process has finished.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Step: Detection */}
        {step === WizardStep.DETECTION && (
          <div className="py-8 text-center">
            <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4 animate-pulse">
              <AlertCircle className="h-8 w-8 text-primary" />
            </div>
            <Progress value={undefined} className="w-full h-2" />
          </div>
        )}

        {/* Step: Selection */}
        {step === WizardStep.SELECTION && (
          <>
            <RecoverableItemList
              items={items}
              selectedIds={selectedIds}
              onToggleSelection={handleToggleSelection}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
            />

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleSkipRecovery}
                className="flex-1"
              >
                Skip Recovery
              </Button>
              <Button
                onClick={handleStartRecovery}
                disabled={selectedIds.size === 0}
                className="flex-1"
              >
                Recover Selected ({selectedIds.size})
              </Button>
            </div>
          </>
        )}

        {/* Step: Recovery */}
        {step === WizardStep.RECOVERY && (
          <>
            <RecoveryProgressComponent
              items={items}
              currentProgress={recoveryProgress}
            />
            
            <div className="text-center text-sm text-muted-foreground">
              Please do not close this window...
            </div>
          </>
        )}

        {/* Step: Summary */}
        {step === WizardStep.SUMMARY && summary && (
          <RecoverySummary
            summary={summary}
            onClose={handleClose}
            onViewFailures={() => {
              // TODO: Show detailed failure report
              toast.info('Detailed failure report coming soon');
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
```

5. Implement component tests for recovery wizard.

**ACCEPTANCE CRITERIA:**

**Recovery Detection & Execution:**
1. ✅ detectRecoverableData() scans all sources (drafts, batches, backups, exports)
2. ✅ Priority scoring correctly ranks items by recency and work amount
3. ✅ RecoverableItem interface includes all required metadata
4. ✅ recoverItem() correctly routes to type-specific recovery functions
5. ✅ recoverItems() processes items sequentially with progress callbacks
6. ✅ Recovery logs all operations to ErrorLogger
7. ✅ Partial recovery is handled (some items succeed, others fail)
8. ✅ RecoverySummary aggregates results correctly

**Recovery Wizard UI:**
9. ✅ Wizard automatically detects recoverable items on page load
10. ✅ RecoverableItemList displays all items with type icons and timestamps
11. ✅ Select all / Deselect all functionality works
12. ✅ Individual item selection toggles correctly
13. ✅ High priority items are visually marked
14. ✅ RecoveryProgress shows real-time status updates
15. ✅ Progress bar reflects overall completion percentage
16. ✅ Success/Failed/In Progress counts update dynamically
17. ✅ RecoverySummary displays final results with stats
18. ✅ "Skip Recovery" dismisses wizard with log entry
19. ✅ Wizard can be reopened from Settings
20. ✅ All components are accessible (keyboard navigation, ARIA labels)

**Testing:**
21. ✅ Unit tests for error classes cover all constructors and methods
22. ✅ Integration tests for API error handling cover retry logic
23. ✅ Component tests for error boundaries verify catching and fallback
24. ✅ E2E tests simulate network failures and recovery flows
25. ✅ Performance tests verify error handling overhead < 5%
26. ✅ Test coverage for error handling modules > 85%

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
train-wireframe/src/lib/recovery/
├── detection.ts                   # Recovery detection across all sources
├── executor.ts                    # Recovery execution logic
└── types.ts                       # Recovery type definitions

train-wireframe/src/components/recovery/
├── RecoveryWizard.tsx             # Main wizard component
├── RecoverableItemList.tsx        # Step 1: Item selection
├── RecoveryProgress.tsx           # Step 2: Recovery progress
└── RecoverySummary.tsx            # Step 3: Summary

train-wireframe/src/__tests__/
├── errors/
│   ├── error-classes.test.ts      # Unit tests for error classes
│   ├── error-guards.test.ts       # Unit tests for type guards
│   └── error-logger.test.ts       # Unit tests for logger
├── api/
│   ├── client.test.ts             # Unit tests for API client
│   ├── retry.test.ts              # Unit tests for retry logic
│   └── rate-limit.test.ts         # Unit tests for rate limiter
├── components/
│   ├── error-boundary.test.tsx    # Component tests for boundaries
│   ├── recovery-wizard.test.tsx   # Component tests for wizard
│   └── notifications.test.tsx     # Component tests for toasts
└── integration/
    ├── error-flows.test.ts        # E2E error handling flows
    ├── recovery-flows.test.ts     # E2E recovery flows
    └── performance.test.ts        # Performance validation
```

**Integration Points:**
- Recovery wizard integrated into application mount
- Auto-detection runs on app initialization
- Recovery wizard accessible from Settings menu
- Recovery operations logged to error_logs table
- All recovery uses existing error infrastructure

**Configuration:**
```typescript
// Environment variables
ENABLE_AUTO_RECOVERY=true
RECOVERY_DETECTION_INTERVAL=300000 // 5 minutes
RECOVERY_LOG_RETENTION_DAYS=90
```

**VALIDATION REQUIREMENTS:**

**Unit Tests:**
1. Test recovery detection for each source type
2. Test priority calculation with various timestamps
3. Test recovery execution for each item type
4. Test partial recovery scenarios
5. Test error handling during recovery
6. Test progress callback functionality
7. Test summary aggregation

**Component Tests:**
1. Test RecoverableItemList rendering and selection
2. Test RecoveryProgress status updates
3. Test RecoverySummary display
4. Test RecoveryWizard step transitions
5. Test wizard dismissal and reopening
6. Test keyboard navigation
7. Test accessibility features

**Integration Tests:**
1. Test end-to-end draft recovery flow
2. Test end-to-end batch resume flow
3. Test end-to-end backup restore flow
4. Test wizard with mixed item types
5. Test wizard with failures
6. Test wizard cancellation

**Performance Tests:**
1. Test recovery detection with 100+ items
2. Test recovery execution with 50+ items
3. Verify error handling overhead < 5% of normal operations
4. Verify no memory leaks in wizard
5. Test wizard with slow network conditions

**Manual Testing:**
1. Create draft conversation, close tab, reopen and verify wizard appears
2. Start batch generation, interrupt midway, verify resume prompt
3. Create backup, delete conversations, verify restore option
4. Select subset of items, verify only selected items recovered
5. Trigger recovery failure, verify error displayed
6. Test "Skip Recovery" and verify wizard doesn't reappear
7. Open wizard from Settings, verify all items shown
8. Test with no recoverable items, verify "No items" message
9. Test wizard on mobile/tablet viewports
10. Test with screen reader for accessibility

**DELIVERABLES:**

**Required Files:**
1. `train-wireframe/src/lib/recovery/types.ts` (200+ lines)
2. `train-wireframe/src/lib/recovery/detection.ts` (400+ lines)
3. `train-wireframe/src/lib/recovery/executor.ts` (250+ lines)
4. `train-wireframe/src/components/recovery/RecoveryWizard.tsx` (400+ lines)
5. `train-wireframe/src/components/recovery/RecoverableItemList.tsx` (250+ lines)
6. `train-wireframe/src/components/recovery/RecoveryProgress.tsx` (150+ lines)
7. `train-wireframe/src/components/recovery/RecoverySummary.tsx` (200+ lines)

**Test Files:**
8. `train-wireframe/src/__tests__/errors/error-classes.test.ts` (300+ lines)
9. `train-wireframe/src/__tests__/errors/error-guards.test.ts` (200+ lines)
10. `train-wireframe/src/__tests__/errors/error-logger.test.ts` (250+ lines)
11. `train-wireframe/src/__tests__/api/client.test.ts` (300+ lines)
12. `train-wireframe/src/__tests__/api/retry.test.ts` (250+ lines)
13. `train-wireframe/src/__tests__/api/rate-limit.test.ts` (200+ lines)
14. `train-wireframe/src/__tests__/components/error-boundary.test.tsx` (200+ lines)
15. `train-wireframe/src/__tests__/components/recovery-wizard.test.tsx` (300+ lines)
16. `train-wireframe/src/__tests__/components/notifications.test.tsx` (250+ lines)
17. `train-wireframe/src/__tests__/integration/error-flows.test.ts` (400+ lines)
18. `train-wireframe/src/__tests__/integration/recovery-flows.test.ts` (350+ lines)
19. `train-wireframe/src/__tests__/integration/performance.test.ts` (200+ lines)

**Integration:**
20. Update `train-wireframe/src/App.tsx` or main layout to mount `<RecoveryWizard />`
21. Add Settings menu item to manually trigger recovery wizard
22. Update onboarding to mention recovery features

**Documentation:**
- Add recovery guide to README
- Document recovery item types and priority scoring
- Document testing strategy and coverage
- Add troubleshooting section for recovery failures
- Document recovery wizard accessibility features

**Example Usage:**
```typescript
// Automatic recovery detection on app mount
// train-wireframe/src/App.tsx
import { RecoveryWizard } from '@/components/recovery/RecoveryWizard';

function App() {
  return (
    <>
      <RecoveryWizard autoOpen={true} onComplete={() => {
        // Handle completion
      }} />
      
      {/* Rest of app */}
    </>
  );
}

// Manual recovery trigger from Settings
import { detectRecoverableData } from '@/lib/recovery/detection';

async function handleManualRecovery() {
  const items = await detectRecoverableData();
  if (items.length > 0) {
    // Show recovery wizard
  } else {
    toast.info('No recoverable data found');
  }
}

// Test error handling
import { APIError, ErrorCode } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';

try {
  await apiCall();
} catch (error) {
  if (error instanceof APIError && error.code === ErrorCode.ERR_API_RATE_LIMIT) {
    errorLogger.warn('Rate limit hit', error);
    // Handle rate limit
  } else {
    errorLogger.error('API call failed', error);
    throw error;
  }
}
```

Implement the complete Recovery Wizard and Comprehensive Testing Suite, ensuring all acceptance criteria are met and the entire E10 Error Handling & Recovery Module is production-ready.

++++++++++++++++++


---

## Quality Validation Checklist

### Post-Implementation Verification (Prompt 8)

**Recovery Detection:**
- [ ] detectRecoverableData() scans all sources
- [ ] Priority scoring ranks items correctly
- [ ] Detection runs on application mount
- [ ] Manual detection trigger works from Settings
- [ ] No duplicate items detected
- [ ] Detection completes within 2 seconds

**Recovery Execution:**
- [ ] recoverItem() routes to correct type-specific function
- [ ] Draft recovery restores conversation editor state
- [ ] Batch recovery resumes from checkpoint
- [ ] Backup recovery imports conversations to database
- [ ] Export recovery retries failed export
- [ ] Partial recovery handles mixed success/failure
- [ ] All operations logged to ErrorLogger
- [ ] Recovery completes within reasonable time

**Recovery Wizard UI:**
- [ ] Wizard opens automatically when items detected
- [ ] RecoverableItemList displays all items
- [ ] Item selection/deselection works
- [ ] High priority items visually marked
- [ ] RecoveryProgress updates in real-time
- [ ] RecoverySummary shows correct stats
- [ ] "Skip Recovery" works and logs event
- [ ] Wizard accessible via keyboard
- [ ] Screen reader announcements work
- [ ] Mobile/responsive layout works

**Testing Suite:**
- [ ] Unit tests for error classes pass
- [ ] Unit tests for API client pass
- [ ] Unit tests for retry logic pass
- [ ] Component tests for boundaries pass
- [ ] Component tests for wizard pass
- [ ] Integration tests for error flows pass
- [ ] Integration tests for recovery flows pass
- [ ] Performance tests pass (< 5% overhead)
- [ ] Test coverage > 85% for error modules
- [ ] All manual test scenarios documented

### Cross-Prompt Integration Testing

**Full Error Handling Flow:**
1. Generate API error → APIError thrown
2. ErrorLogger logs error with context
3. Retry logic attempts recovery
4. Error boundary catches if unrecoverable
5. NotificationManager displays error toast
6. ErrorDetailsModal shows technical details
7. User can view error details and report issue

**Full Recovery Flow:**
1. User editing conversation → browser crashes
2. Auto-save saves draft to IndexedDB
3. User reopens application
4. detectRecoverableData() finds draft
5. RecoveryWizard opens automatically
6. User selects draft to recover
7. Recovery restores editor state
8. RecoverySummary confirms success
9. Draft cleaned up from storage

**Batch Resume Flow:**
1. Batch job running → checkpoint saved after each item
2. Network fails midway
3. User reloads page
4. detectRecoverableData() finds incomplete batch
5. RecoveryWizard offers resume
6. User confirms resume
7. Batch processor skips completed items (idempotent)
8. Batch completes successfully
9. Checkpoint cleaned up

### E10 Segment Completion

**All Prompts Complete:**
- [x] Prompt 1: Error Infrastructure
- [x] Prompt 2: API Error Handling
- [x] Prompt 3: Error Boundaries
- [x] Prompt 4: Database Resilience
- [x] Prompt 5: Auto-Save & Draft Recovery
- [x] Prompt 6: Batch Resume & Backup
- [x] Prompt 7: Enhanced Notifications
- [ ] Prompt 8: Recovery Wizard & Testing

**Production Readiness:**
- [ ] All error classes implemented and tested
- [ ] All API errors handled with retry
- [ ] All React errors caught by boundaries
- [ ] All database operations wrapped in transactions
- [ ] Auto-save protects user work
- [ ] Batch jobs resumable from checkpoints
- [ ] Pre-delete backups prevent data loss
- [ ] Error notifications clear and actionable
- [ ] Recovery wizard guides users through failures
- [ ] Comprehensive test coverage validates reliability
- [ ] Performance overhead acceptable (< 5%)
- [ ] Documentation complete
- [ ] Manual testing completed
- [ ] Production deployment successful

---

## Next Segment Preparation

**E11 Dependencies Met:**

**What E10 Provides:**
1. **Complete Error Infrastructure** → All future features use error classes, logging, and recovery
2. **Reliable API Communication** → Rate limiting, retry logic, and error handling for all APIs
3. **Data Protection** → Auto-save, batch resume, and backups prevent data loss
4. **User Guidance** → Clear error messages and recovery wizard help users recover from failures
5. **Production-Grade Testing** → Comprehensive test suite validates system reliability

**Integration Points for E11:**
- New features should use error classes from E10
- New API calls should use APIClient and withRetry()
- New components should wrap in error boundaries
- New batch operations should use checkpoint system
- New modals should integrate auto-save
- New failure modes should be added to recovery detection

**Lessons Learned:**
- Document common error patterns and solutions
- Maintain error code registry as new errors discovered
- Update recovery wizard for new recoverable data types
- Extend test suite for new error scenarios
- Monitor error rates in production

---

## Document Status

**Generated**: 2025-11-04  
**Version**: 1.0  
**Status**: Complete - Ready for Implementation

**Total Prompts**: 1 (Prompt 8 of 8 total)  
**Estimated Total Time**: 18-22 hours  
**Risk Level**: Low-Medium  
**Dependencies**: Prompts 1-7 (integrates all recovery mechanisms)

**Implementation Team Recommendations:**
- **Prompt 8**: Senior QA engineer + full-stack dev (recovery + testing focus)
  - QA engineer leads test suite implementation
  - Full-stack dev implements recovery wizard
  - Pair on integration testing

**Estimated Calendar Time:**
- With 1 full-time engineer: 2.5-3 weeks
- With 2 engineers (parallel): 1.5-2 weeks

**Completion Criteria:**
- [ ] Recovery wizard fully functional
- [ ] All test suites passing
- [ ] Test coverage > 85%
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] Production deployment successful

---

**End of E10 Part 4 Implementation Execution Instructions**

