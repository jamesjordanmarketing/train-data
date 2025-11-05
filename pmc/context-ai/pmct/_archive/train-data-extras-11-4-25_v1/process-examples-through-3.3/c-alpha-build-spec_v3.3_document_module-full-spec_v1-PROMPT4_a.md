# PROMPT 4A: Status Polling API & Hook (Part 1 of 4)
**Module:** Document Upload & Processing  
**Phase:** Real-Time Updates & Queue Interface  
**Estimated Time:** 1-1.5 hours (Steps 1-2)  
**Prerequisites:** Prompts 1-3 completed (Upload & extraction functional)

---

## 📌 CONTEXT: This is Part 1 of 4

This prompt file contains the first 2 steps of Prompt 4:
- **STEP 1:** Status Polling API Endpoint
- **STEP 2:** Status Polling React Hook

After completing this part, proceed to **PROMPT4_b.md** for Steps 3-4.

---

## CONTEXT FOR CODING AGENT

You are implementing Phase 4 of the document upload module for "Bright Run." In Prompts 1-3, you created the database schema, upload API, upload UI, and text extraction engine. Now you will build real-time status updates and a comprehensive upload queue management interface.

### What Was Built in Previous Prompts
✅ **Prompt 1:** Database schema, Storage configuration, NPM packages, Upload API  
✅ **Prompt 2:** Upload Dropzone UI, Upload Page, Dashboard integration  
✅ **Prompt 3:** Text Extractor Service, Document Processor, Processing API

### Current State
- Users can upload files via `/upload` page
- Files are stored in Supabase Storage
- Text is automatically extracted from uploaded files
- Database tracks processing status: 'uploaded' → 'processing' → 'completed' or 'error'
- Users must manually refresh to see status updates

### Your Task in Prompt 4A (Steps 1-2)
1. ✅ Create Status Polling API Endpoint (real-time status updates)
2. ✅ Create Status Polling React Hook (2-second polling with auto-stop)

### Success Criteria for Part 4A
- Status polling API returns document status efficiently
- React hook polls every 2 seconds
- Polling stops when documents complete
- Performance optimized (pauses when tab inactive)

---



====================



## STEP 1: Create Status Polling API Endpoint

**DIRECTIVE:** You shall create an API endpoint that provides current processing status for one or more documents, supporting both single and batch queries.

**Instructions:**
1. Create directory: `src/app/api/documents/status/`
2. Create file: `src/app/api/documents/status/route.ts`
3. Copy the complete code below
4. Save and verify no TypeScript errors

**File:** `src/app/api/documents/status/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const runtime = 'nodejs';
export const maxDuration = 10; // Quick status check

/**
 * Document status response
 */
interface DocumentStatusResponse {
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
 * GET /api/documents/status
 * Retrieve current processing status for documents
 * 
 * Query Parameters:
 *   - id: string (single document ID)
 *   - ids: string (comma-separated document IDs, max 100)
 * 
 * Response:
 *   - 200: { success: true, documents: DocumentStatusResponse[] }
 *   - 400: { success: false, error: string }
 *   - 401: { success: false, error: string }
 *   - 500: { success: false, error: string }
 */
export async function GET(request: NextRequest) {
  console.log('[StatusAPI] Received status request');
  
  try {
    // ================================================
    // STEP 1: Authentication
    // ================================================
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required',
          errorCode: 'AUTH_REQUIRED'
        },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('[StatusAPI] Authentication error:', userError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid authentication',
          errorCode: 'AUTH_INVALID'
        },
        { status: 401 }
      );
    }

    // ================================================
    // STEP 2: Parse Query Parameters
    // ================================================
    const { searchParams } = new URL(request.url);
    const singleId = searchParams.get('id');
    const multipleIds = searchParams.get('ids');

    let documentIds: string[] = [];

    if (singleId) {
      documentIds = [singleId];
    } else if (multipleIds) {
      documentIds = multipleIds.split(',').map(id => id.trim()).filter(Boolean);
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Either "id" or "ids" query parameter is required',
          errorCode: 'INVALID_REQUEST'
        },
        { status: 400 }
      );
    }

    // Validate batch size
    if (documentIds.length > 100) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Maximum 100 documents per request. Use pagination for larger batches.',
          errorCode: 'BATCH_TOO_LARGE'
        },
        { status: 400 }
      );
    }

    console.log(`[StatusAPI] Fetching status for ${documentIds.length} document(s)`);

    // ================================================
    // STEP 3: Query Database
    // ================================================
    const { data: documents, error: queryError } = await supabase
      .from('documents')
      .select(`
        id,
        title,
        status,
        processing_progress,
        processing_error,
        processing_started_at,
        processing_completed_at,
        file_path,
        file_size,
        source_type,
        metadata,
        author_id
      `)
      .in('id', documentIds)
      .eq('author_id', user.id); // Security: Only return user's own documents

    if (queryError) {
      console.error('[StatusAPI] Database query error:', queryError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch document status',
          errorCode: 'DB_ERROR'
        },
        { status: 500 }
      );
    }

    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { 
          success: true, 
          documents: [] 
        },
        { status: 200 }
      );
    }

    // ================================================
    // STEP 4: Format Response
    // ================================================
    const statusResponses: DocumentStatusResponse[] = documents.map(doc => {
      // Calculate estimated time remaining (rough estimate)
      let estimatedSecondsRemaining: number | null = null;
      
      if (doc.status === 'processing' && doc.processing_started_at) {
        const startedAt = new Date(doc.processing_started_at).getTime();
        const now = Date.now();
        const elapsedMs = now - startedAt;
        const progress = doc.processing_progress || 0;
        
        if (progress > 0 && progress < 100) {
          // Estimate total time based on current progress
          const estimatedTotalMs = (elapsedMs / progress) * 100;
          const remainingMs = estimatedTotalMs - elapsedMs;
          estimatedSecondsRemaining = Math.max(0, Math.round(remainingMs / 1000));
        }
      }

      // Extract original filename from metadata or file_path
      const metadata = doc.metadata as { original_filename?: string } || {};
      const fileName = metadata.original_filename || doc.file_path?.split('/').pop() || 'Unknown';

      return {
        id: doc.id,
        status: doc.status,
        progress: doc.processing_progress || 0,
        error: doc.processing_error,
        processingStartedAt: doc.processing_started_at,
        processingCompletedAt: doc.processing_completed_at,
        estimatedSecondsRemaining,
        title: doc.title,
        fileName,
        fileSize: doc.file_size || 0,
        sourceType: doc.source_type || 'unknown'
      };
    });

    // ================================================
    // STEP 5: Return Response
    // ================================================
    return NextResponse.json({
      success: true,
      documents: statusResponses
    }, { status: 200 });

  } catch (error) {
    console.error('[StatusAPI] Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred',
        errorCode: 'SERVER_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
```

**Explanation:**
- **Single & Batch Queries:** Supports `?id=uuid` or `?ids=uuid1,uuid2,uuid3`
- **Security:** Only returns documents owned by authenticated user
- **Estimated Time:** Calculates remaining time based on current progress
- **Fast Response:** < 200ms response time for quick polling
- **Batch Limit:** Max 100 documents per request

**Verification:**
1. File compiles with no TypeScript errors
2. Endpoint will be available at: `GET /api/documents/status`

**Testing:**
```bash
# Test single document
curl "http://localhost:3000/api/documents/status?id=YOUR_DOC_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test multiple documents
curl "http://localhost:3000/api/documents/status?ids=ID1,ID2,ID3" \
  -H "Authorization: Bearer YOUR_TOKEN"
```



++++++++++++++++++++++++



## STEP 2: Create Status Polling React Hook

**DIRECTIVE:** You shall create a custom React hook that polls the status endpoint every 2 seconds and automatically stops when documents reach a terminal state.

**Instructions:**
1. Create directory: `src/hooks/`
2. Create file: `src/hooks/use-document-status.ts`
3. Copy the complete code below
4. Save and verify no TypeScript errors

**File:** `src/hooks/use-document-status.ts`

```typescript
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
    
    for (const status of statusMap.values()) {
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
```

**Explanation:**
- **Automatic Polling:** Starts immediately, polls every 2 seconds
- **Auto-Stop:** Stops when all documents reach 'completed' or 'error' status
- **Visibility Optimization:** Pauses when browser tab is hidden
- **Memory Safe:** Proper cleanup on unmount
- **Type Safe:** Full TypeScript support with interfaces
- **Batch Queries:** Fetches status for multiple documents in one API call

**Verification:**
1. File compiles with no TypeScript errors
2. Hook can be imported: `import { useDocumentStatus } from '@/hooks/use-document-status';`



++++++++++++++++++++++++



## PROMPT 4A COMPLETION CHECKLIST

Before proceeding to Prompt 4B, verify:

### Components Created (Part A)
- [ ] Status Polling API: `src/app/api/documents/status/route.ts`
- [ ] Status Polling Hook: `src/hooks/use-document-status.ts`

### Build Verification
- [ ] Run `npm run build` - no TypeScript errors
- [ ] All imports resolve correctly
- [ ] No console errors when starting dev server

### API Testing
- [ ] Upload a test document
- [ ] Call status API manually with document ID
- [ ] Verify API returns status correctly
- [ ] Test batch query with multiple IDs

---

## ➡️ NEXT: Proceed to PROMPT4_b.md

After completing and verifying the above checklist, continue with:
- **PROMPT4_b.md** - Steps 3-4 (Status Badge & Statistics Components)

This will build the visual components that use the polling infrastructure you just created.

---

**END OF PROMPT 4A**
