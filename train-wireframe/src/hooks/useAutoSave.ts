import { useEffect, useRef, useState, useCallback } from 'react';
import { errorLogger } from '../lib/errors/error-logger';
import { AppError, ErrorCode } from '../lib/errors';
import { withRetry } from '../lib/api/retry';

// Save status type
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// Auto-save configuration
export interface AutoSaveConfig {
  /**
   * Interval between auto-saves in milliseconds
   * @default 30000 (30 seconds)
   */
  interval?: number;
  
  /**
   * Debounce delay after user stops typing in milliseconds
   * @default 2000 (2 seconds)
   */
  debounceDelay?: number;
  
  /**
   * Maximum retry attempts for failed saves
   * @default 3
   */
  maxRetries?: number;
  
  /**
   * Whether to enable auto-save
   * @default true
   */
  enabled?: boolean;
  
  /**
   * Save immediately on unmount (cleanup)
   * @default true
   */
  saveOnUnmount?: boolean;
}

// Default configuration
const DEFAULT_CONFIG: Required<AutoSaveConfig> = {
  interval: 30000, // 30 seconds
  debounceDelay: 2000, // 2 seconds
  maxRetries: 3,
  enabled: true,
  saveOnUnmount: true,
};

// Auto-save hook return type
export interface UseAutoSaveReturn<T> {
  /** Current save status */
  status: SaveStatus;
  
  /** Last successful save timestamp */
  lastSaved: Date | null;
  
  /** Error from last failed save */
  error: Error | null;
  
  /** Manually trigger save */
  saveDraft: () => Promise<void>;
  
  /** Clear the draft */
  clearDraft: () => Promise<void>;
  
  /** Reset error state */
  resetError: () => void;
}

/**
 * Custom React hook for automatic draft saving with debouncing and retry logic.
 * 
 * Features:
 * - Automatic saving at configurable intervals
 * - Debouncing to avoid saving while user is actively typing
 * - Retry logic with exponential backoff for failed saves
 * - Manual save trigger
 * - Save on component unmount
 * - Status tracking (idle, saving, saved, error)
 * 
 * @param data The data to auto-save
 * @param onSave Async function to save the data (returns void or throws error)
 * @param config Auto-save configuration options
 * @returns Save status, controls, and metadata
 * 
 * @example
 * function ConversationEditor({ conversation }) {
 *   const [content, setContent] = useState(conversation.content);
 *   
 *   const { status, lastSaved, saveDraft } = useAutoSave(
 *     { conversationId: conversation.id, content },
 *     async (data) => {
 *       await saveDraftToServer(data.conversationId, data.content);
 *     },
 *     { interval: 30000, debounceDelay: 2000 }
 *   );
 *   
 *   return (
 *     <div>
 *       <textarea value={content} onChange={e => setContent(e.target.value)} />
 *       <SaveStatusIndicator status={status} lastSaved={lastSaved} />
 *       <button onClick={saveDraft}>Save Now</button>
 *     </div>
 *   );
 * }
 */
export function useAutoSave<T>(
  data: T,
  onSave: (data: T) => Promise<void>,
  config: AutoSaveConfig = {}
): UseAutoSaveReturn<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  // Refs to track state without causing re-renders
  const dataRef = useRef<T>(data);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const hasChangesRef = useRef(false);
  
  // Update data ref when data changes
  useEffect(() => {
    dataRef.current = data;
    hasChangesRef.current = true; // Mark as changed
  }, [data]);
  
  /**
   * Perform the save operation with retry logic.
   */
  const performSave = useCallback(async () => {
    if (isSavingRef.current || !hasChangesRef.current) {
      return; // Skip if already saving or no changes
    }
    
    isSavingRef.current = true;
    setStatus('saving');
    setError(null);
    
    try {
      // Use retry logic from Prompt 2
      await withRetry(
        () => onSave(dataRef.current),
        {
          maxAttempts: finalConfig.maxRetries,
          initialDelay: 1000,
          backoffFactor: 2,
          maxDelay: 8000,
        },
        { component: 'AutoSave' }
      );
      
      setStatus('saved');
      setLastSaved(new Date());
      hasChangesRef.current = false; // Clear change flag
      
      errorLogger.debug('Auto-save successful', {
        component: 'useAutoSave',
        dataSize: JSON.stringify(dataRef.current).length,
      });
    } catch (err) {
      const saveError = err instanceof Error ? err : new Error('Auto-save failed');
      
      setStatus('error');
      setError(saveError);
      
      errorLogger.error('Auto-save failed', saveError, {
        component: 'useAutoSave',
        retries: finalConfig.maxRetries,
      });
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave, finalConfig.maxRetries]);
  
  /**
   * Debounced save: Wait for user to stop typing before saving.
   */
  const debouncedSave = useCallback(() => {
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      performSave();
    }, finalConfig.debounceDelay);
  }, [performSave, finalConfig.debounceDelay]);
  
  /**
   * Manual save trigger.
   */
  const saveDraft = useCallback(async () => {
    // Cancel any pending debounced save
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    await performSave();
  }, [performSave]);
  
  /**
   * Clear the draft.
   */
  const clearDraft = useCallback(async () => {
    hasChangesRef.current = false;
    setStatus('idle');
    setError(null);
    setLastSaved(null);
  }, []);
  
  /**
   * Reset error state.
   */
  const resetError = useCallback(() => {
    setError(null);
    if (status === 'error') {
      setStatus('idle');
    }
  }, [status]);
  
  // Set up interval-based auto-save
  useEffect(() => {
    if (!finalConfig.enabled) {
      return;
    }
    
    intervalTimerRef.current = setInterval(() => {
      if (hasChangesRef.current && !isSavingRef.current) {
        performSave();
      }
    }, finalConfig.interval);
    
    return () => {
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
      }
    };
  }, [finalConfig.enabled, finalConfig.interval, performSave]);
  
  // Trigger debounced save when data changes
  useEffect(() => {
    if (!finalConfig.enabled) {
      return;
    }
    
    debouncedSave();
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [data, finalConfig.enabled, debouncedSave]);
  
  // Save on unmount if enabled
  useEffect(() => {
    return () => {
      if (finalConfig.saveOnUnmount && hasChangesRef.current) {
        // Synchronous save on unmount (best effort)
        onSave(dataRef.current).catch(err => {
          errorLogger.error('Failed to save on unmount', err);
        });
      }
    };
  }, [finalConfig.saveOnUnmount, onSave]);
  
  return {
    status,
    lastSaved,
    error,
    saveDraft,
    clearDraft,
    resetError,
  };
}

