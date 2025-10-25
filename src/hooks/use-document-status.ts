import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Document status data
 */
export interface DocumentStatus {
  id: string;
  status: 'uploaded' | 'processing' | 'completed' | 'error' | 'pending' | 'categorizing';
  progress: number;
  error: string | null;
  processingStartedAt: string | null;
  processingCompletedAt: string | null;
  estimatedSecondsRemaining: number | null;
  title: string;
  fileName: string;
  fileSize: number;
  sourceType: string;
}

/**
 * Hook configuration options
 */
export interface UseDocumentStatusOptions {
  /** Polling interval in milliseconds (default: 2000) */
  pollInterval?: number;
  /** Whether to pause polling when tab is inactive (default: true) */
  pauseWhenHidden?: boolean;
  /** Whether polling is enabled (default: true) */
  enabled?: boolean;
}

/**
 * Hook return value
 */
export interface UseDocumentStatusReturn {
  /** Current status data for documents */
  statuses: Map<string, DocumentStatus>;
  /** Whether polling is currently active */
  isPolling: boolean;
  /** Whether initial fetch is in progress */
  isLoading: boolean;
  /** Error from status API */
  error: string | null;
  /** Manually trigger a status refresh */
  refresh: () => Promise<void>;
  /** Stop polling */
  stopPolling: () => void;
  /** Resume polling */
  resumePolling: () => void;
}

/**
 * useDocumentStatus Hook
 * 
 * Polls document processing status at regular intervals
 * Automatically stops when all documents reach terminal state
 * Pauses when browser tab is hidden (performance optimization)
 * 
 * @param documentIds - Array of document IDs to monitor
 * @param options - Configuration options
 * @returns Status data and polling controls
 * 
 * @example
 * ```tsx
 * const { statuses, isPolling } = useDocumentStatus(['doc-id-1', 'doc-id-2']);
 * const status = statuses.get('doc-id-1');
 * ```
 */
export function useDocumentStatus(
  documentIds: string[],
  options: UseDocumentStatusOptions = {}
): UseDocumentStatusReturn {
  const {
    pollInterval = 2000,
    pauseWhenHidden = true,
    enabled = true
  } = options;

  // State
  const [statuses, setStatuses] = useState<Map<string, DocumentStatus>>(new Map());
  const [isPolling, setIsPolling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  /**
   * Check if all documents are in terminal state
   */
  const allDocumentsComplete = useCallback((statusMap: Map<string, DocumentStatus>): boolean => {
    if (statusMap.size === 0) return false;
    
    const statuses = Array.from(statusMap.values());
    for (const status of statuses) {
      // Continue polling if any document is still processing
      if (status.status === 'uploaded' || status.status === 'processing') {
        return false;
      }
    }
    
    return true;
  }, []);

  /**
   * Fetch status from API
   */
  const fetchStatus = useCallback(async () => {
    if (documentIds.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Call status API
      const idsParam = documentIds.join(',');
      const response = await fetch(`/api/documents/status?ids=${idsParam}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch status');
      }

      const data = await response.json();

      if (!isMountedRef.current) return;

      if (data.success && data.documents) {
        // Convert array to Map for O(1) lookups
        const statusMap = new Map<string, DocumentStatus>();
        data.documents.forEach((doc: DocumentStatus) => {
          statusMap.set(doc.id, doc);
        });

        setStatuses(statusMap);
        setError(null);

        // Stop polling if all documents are complete
        if (allDocumentsComplete(statusMap)) {
          console.log('[useDocumentStatus] All documents completed, stopping polling');
          stopPolling();
        }
      }

    } catch (err) {
      console.error('[useDocumentStatus] Fetch error:', err);
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [documentIds, allDocumentsComplete]);

  /**
   * Start polling
   */
  const startPolling = useCallback(() => {
    if (!enabled) return;
    
    console.log('[useDocumentStatus] Starting polling');
    setIsPolling(true);

    // Initial fetch
    fetchStatus();

    // Set up interval
    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        fetchStatus();
      }
    }, pollInterval);
  }, [enabled, fetchStatus, pollInterval, isPaused]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    console.log('[useDocumentStatus] Stopping polling');
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsPolling(false);
  }, []);

  /**
   * Resume polling
   */
  const resumePolling = useCallback(() => {
    if (!isPolling && enabled) {
      startPolling();
    }
  }, [isPolling, enabled, startPolling]);

  /**
   * Manual refresh
   */
  const refresh = useCallback(async () => {
    await fetchStatus();
  }, [fetchStatus]);

  // ================================================
  // Effect: Handle visibility change (pause when tab hidden)
  // ================================================
  useEffect(() => {
    if (!pauseWhenHidden) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('[useDocumentStatus] Tab hidden, pausing polling');
        setIsPaused(true);
      } else {
        console.log('[useDocumentStatus] Tab visible, resuming polling');
        setIsPaused(false);
        // Trigger immediate fetch when tab becomes visible
        fetchStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pauseWhenHidden, fetchStatus]);

  // ================================================
  // Effect: Start/stop polling based on enabled state
  // ================================================
  useEffect(() => {
    if (enabled && documentIds.length > 0) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [documentIds.length, enabled]); // Deliberately exclude startPolling/stopPolling to avoid re-polling

  // ================================================
  // Effect: Cleanup on unmount
  // ================================================
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    statuses,
    isPolling,
    isLoading,
    error,
    refresh,
    stopPolling,
    resumePolling
  };
}

