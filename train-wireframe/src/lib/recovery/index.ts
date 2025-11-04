/**
 * Recovery detection and execution module.
 * 
 * This module provides unified recovery detection across all failure types
 * and execution logic for recovering data.
 */

// Export types
export type {
  RecoverableItem,
  DraftRecoveryData,
  BatchRecoveryData,
  BackupRecoveryData,
  ExportRecoveryData,
  RecoveryResult,
  RecoverySummary,
} from './types';

export {
  RecoverableItemType,
  RecoveryStatus,
} from './types';

// Export detection functions
export {
  detectRecoverableData,
  filterItemsByType,
  getStatusCounts,
} from './detection';

// Export execution functions
export {
  recoverItem,
  recoverItems,
} from './executor';

