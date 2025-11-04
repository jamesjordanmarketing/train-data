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

