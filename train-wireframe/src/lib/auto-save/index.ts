/**
 * Auto-Save Library
 * 
 * Draft storage and recovery utilities.
 */

export { draftStorage } from './storage';
export type { Draft } from './storage';

export {
  checkForRecoverableDrafts,
  detectConflict,
  resolveConflict,
  recoverDraft,
  discardDraft,
  saveDraft,
  loadDraft,
  ConflictResolution,
} from './recovery';

export type {
  RecoveryItem,
  Conflict,
} from './recovery';

