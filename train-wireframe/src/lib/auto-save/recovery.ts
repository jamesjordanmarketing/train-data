import { draftStorage, Draft } from './storage';
import { errorLogger } from '../errors/error-logger';

// Recovery item interface
export interface RecoveryItem<T = any> {
  id: string;
  data: T;
  savedAt: Date;
  type: 'conversation' | 'batch' | 'template' | 'other';
  description: string;
}

// Conflict resolution strategy
export enum ConflictResolution {
  USE_DRAFT = 'USE_DRAFT',       // Use the draft data
  USE_SERVER = 'USE_SERVER',     // Use the server data
  MERGE = 'MERGE',                // Attempt to merge (not implemented in v1)
  ASK_USER = 'ASK_USER',          // Prompt user to choose
}

// Conflict information
export interface Conflict<T = any> {
  draftData: T;
  serverData: T;
  draftSavedAt: Date;
  serverUpdatedAt: Date;
}

/**
 * Check for recoverable drafts on page load.
 * Returns drafts that are newer than their server versions.
 * 
 * @returns Array of recovery items
 */
export async function checkForRecoverableDrafts(): Promise<RecoveryItem[]> {
  try {
    const drafts = await draftStorage.list();
    const recoveryItems: RecoveryItem[] = [];
    
    for (const draft of drafts) {
      // Parse draft ID to determine type
      const type = parseDraftType(draft.id);
      
      recoveryItems.push({
        id: draft.id,
        data: draft.data,
        savedAt: new Date(draft.savedAt),
        type,
        description: generateDescription(type, draft.data),
      });
    }
    
    errorLogger.info('Found recoverable drafts', { count: recoveryItems.length });
    return recoveryItems;
  } catch (error) {
    errorLogger.error('Failed to check for recoverable drafts', error);
    return [];
  }
}

/**
 * Parse draft type from ID.
 * Convention: {type}_{id} (e.g., "conversation_abc123", "batch_xyz789")
 */
function parseDraftType(draftId: string): RecoveryItem['type'] {
  if (draftId.startsWith('conversation_')) return 'conversation';
  if (draftId.startsWith('batch_')) return 'batch';
  if (draftId.startsWith('template_')) return 'template';
  return 'other';
}

/**
 * Generate human-readable description for recovery item.
 */
function generateDescription(type: RecoveryItem['type'], data: any): string {
  switch (type) {
    case 'conversation':
      return `Conversation: ${data.persona || 'Unknown'} (${data.turnCount || 0} turns)`;
    case 'batch':
      return `Batch Job: ${data.totalItems || 0} items (${data.completedItems || 0} completed)`;
    case 'template':
      return `Template: ${data.name || 'Untitled'}`;
    default:
      return 'Unsaved changes';
  }
}

/**
 * Detect conflicts between draft and server data.
 * A conflict exists if both draft and server have been updated, and server is newer.
 * 
 * @param draftId Draft identifier
 * @param serverData Current server data
 * @param serverUpdatedAt Server data last update timestamp
 * @returns Conflict information if conflict exists, null otherwise
 */
export async function detectConflict<T>(
  draftId: string,
  serverData: T | null,
  serverUpdatedAt: Date | null
): Promise<Conflict<T> | null> {
  try {
    const draft = await draftStorage.load<T>(draftId);
    
    if (!draft) {
      return null; // No draft, no conflict
    }
    
    if (!serverData || !serverUpdatedAt) {
      return null; // No server data, no conflict (draft can be used)
    }
    
    const draftSavedAt = new Date(draft.savedAt);
    
    // Conflict exists if server was updated after draft was saved
    if (serverUpdatedAt > draftSavedAt) {
      errorLogger.warn('Conflict detected', {
        draftId,
        draftSavedAt: draftSavedAt.toISOString(),
        serverUpdatedAt: serverUpdatedAt.toISOString(),
      });
      
      return {
        draftData: draft.data,
        serverData,
        draftSavedAt,
        serverUpdatedAt,
      };
    }
    
    return null; // Draft is newer, no conflict
  } catch (error) {
    errorLogger.error('Failed to detect conflict', error, { draftId });
    return null;
  }
}

/**
 * Resolve a conflict using the specified strategy.
 * 
 * @param conflict Conflict to resolve
 * @param strategy Resolution strategy
 * @returns Resolved data
 */
export function resolveConflict<T>(
  conflict: Conflict<T>,
  strategy: ConflictResolution
): T {
  switch (strategy) {
    case ConflictResolution.USE_DRAFT:
      errorLogger.info('Conflict resolved: using draft');
      return conflict.draftData;
    
    case ConflictResolution.USE_SERVER:
      errorLogger.info('Conflict resolved: using server data');
      return conflict.serverData;
    
    case ConflictResolution.MERGE:
      // TODO: Implement merge strategy (v2)
      errorLogger.warn('Merge strategy not implemented, using draft');
      return conflict.draftData;
    
    case ConflictResolution.ASK_USER:
      // Should be handled by UI, default to draft for safety
      errorLogger.warn('User resolution required, defaulting to draft');
      return conflict.draftData;
    
    default:
      errorLogger.error('Unknown conflict resolution strategy', { strategy });
      return conflict.draftData;
  }
}

/**
 * Recover a draft by its ID.
 * 
 * @param draftId Draft identifier
 * @returns Draft data or null if not found
 */
export async function recoverDraft<T>(draftId: string): Promise<T | null> {
  try {
    const draft = await draftStorage.load<T>(draftId);
    
    if (!draft) {
      return null;
    }
    
    errorLogger.info('Draft recovered', { draftId });
    return draft.data;
  } catch (error) {
    errorLogger.error('Failed to recover draft', error, { draftId });
    return null;
  }
}

/**
 * Discard a draft by its ID.
 * 
 * @param draftId Draft identifier
 */
export async function discardDraft(draftId: string): Promise<void> {
  try {
    await draftStorage.delete(draftId);
    errorLogger.info('Draft discarded', { draftId });
  } catch (error) {
    errorLogger.error('Failed to discard draft', error, { draftId });
    throw error;
  }
}

/**
 * Save draft with standard format.
 * 
 * @param type Draft type
 * @param id Entity ID
 * @param data Data to save
 */
export async function saveDraft<T>(
  type: RecoveryItem['type'],
  id: string,
  data: T
): Promise<void> {
  const draftId = `${type}_${id}`;
  await draftStorage.save(draftId, data);
}

/**
 * Load draft with standard format.
 * 
 * @param type Draft type
 * @param id Entity ID
 * @returns Draft data or null
 */
export async function loadDraft<T>(
  type: RecoveryItem['type'],
  id: string
): Promise<T | null> {
  const draftId = `${type}_${id}`;
  return recoverDraft<T>(draftId);
}

