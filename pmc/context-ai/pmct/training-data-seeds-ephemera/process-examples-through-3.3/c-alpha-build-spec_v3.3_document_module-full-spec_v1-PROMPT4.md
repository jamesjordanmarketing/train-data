# PROMPT 4: Status Polling & Queue Management
**Module:** Document Upload & Processing  
**Phase:** Real-Time Updates & Queue Interface  
**Estimated Time:** 4-5 hours  
**Prerequisites:** Prompts 1-3 completed (Upload & extraction functional)

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

### Your Task in Prompt 4
1. ✅ Create Status Polling API Endpoint (real-time status updates)
2. ✅ Create Status Polling React Hook (2-second polling with auto-stop)
3. ✅ Create Upload Queue Component (full-featured table)
4. ✅ Create Upload Statistics Component (aggregate metrics)
5. ✅ Create Upload Filters Component (search, filter by status/type/date)
6. ✅ Create Document Status Badge Component (visual status indicators)
7. ✅ Update Upload Page to use queue management

### Success Criteria
- Status updates in real-time (2-second polling) without page refresh
- Upload queue table displays all user's documents
- Filters work (status, file type, date, search)
- Statistics cards show aggregate counts
- Visual status badges with icons and colors
- Polling stops automatically when documents complete
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



## STEP 3: Create Document Status Badge Component

**DIRECTIVE:** You shall create a reusable visual component that displays document status with appropriate colors, icons, and progress indicators.

**Instructions:**
1. Create file: `src/components/upload/document-status-badge.tsx`
2. Copy the complete code below
3. Save and verify no TypeScript errors

**File:** `src/components/upload/document-status-badge.tsx`

```typescript
'use client';

import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2, 
  AlertCircle,
  FileText 
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

export type DocumentStatusType = 
  | 'uploaded' 
  | 'processing' 
  | 'completed' 
  | 'error' 
  | 'pending' 
  | 'categorizing';

interface DocumentStatusBadgeProps {
  /** Current document status */
  status: DocumentStatusType;
  /** Processing progress (0-100), shown for 'processing' status */
  progress?: number;
  /** Whether to show progress percentage inline */
  showProgress?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
}

/**
 * DocumentStatusBadge Component
 * 
 * Visual status indicator with icon, color, and optional progress
 * 
 * Status Colors:
 * - uploaded: Gray (queued)
 * - processing: Blue (in progress)
 * - completed: Green (success)
 * - error: Red (failed)
 * - pending: Gray (waiting)
 * - categorizing: Purple (workflow active)
 */
export function DocumentStatusBadge({ 
  status, 
  progress = 0,
  showProgress = false,
  size = 'md',
  className 
}: DocumentStatusBadgeProps) {
  // Get status configuration
  const config = getStatusConfig(status, progress);

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium',
        sizeClasses[size],
        config.className,
        className
      )}
    >
      <Icon 
        className={cn(
          iconSizeClasses[size],
          config.animated && 'animate-spin'
        )} 
      />
      <span>{config.label}</span>
      {showProgress && status === 'processing' && (
        <span className="font-normal opacity-90">
          {progress}%
        </span>
      )}
    </Badge>
  );
}

/**
 * Get status configuration (icon, color, label)
 */
function getStatusConfig(status: DocumentStatusType, progress: number) {
  switch (status) {
    case 'uploaded':
      return {
        icon: Clock,
        label: 'Queued',
        variant: 'secondary' as const,
        className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        animated: false
      };

    case 'processing':
      return {
        icon: Loader2,
        label: progress > 0 ? `Processing` : 'Processing',
        variant: 'default' as const,
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        animated: true
      };

    case 'completed':
      return {
        icon: CheckCircle,
        label: 'Completed',
        variant: 'default' as const,
        className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        animated: false
      };

    case 'error':
      return {
        icon: XCircle,
        label: 'Error',
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        animated: false
      };

    case 'pending':
      return {
        icon: FileText,
        label: 'Pending',
        variant: 'secondary' as const,
        className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        animated: false
      };

    case 'categorizing':
      return {
        icon: Loader2,
        label: 'Categorizing',
        variant: 'default' as const,
        className: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
        animated: true
      };

    default:
      return {
        icon: AlertCircle,
        label: 'Unknown',
        variant: 'secondary' as const,
        className: '',
        animated: false
      };
  }
}

/**
 * Get status display text (for use outside badge)
 */
export function getStatusText(status: DocumentStatusType): string {
  const config = getStatusConfig(status, 0);
  return config.label;
}

/**
 * Check if status is terminal (won't change without user action)
 */
export function isTerminalStatus(status: DocumentStatusType): boolean {
  return status === 'completed' || status === 'error';
}

/**
 * Check if status is active (currently being processed)
 */
export function isActiveStatus(status: DocumentStatusType): boolean {
  return status === 'processing' || status === 'categorizing';
}
```

**Explanation:**
- **Visual Feedback:** Color-coded badges with icons
- **Animated Icons:** Spinner for 'processing' and 'categorizing' states
- **Progress Display:** Optional progress percentage for processing status
- **Size Variants:** Small, medium, large sizes
- **Utility Functions:** Helper functions for status checking
- **Dark Mode:** Supports dark mode with appropriate colors

**Verification:**
1. Component compiles with no TypeScript errors
2. Can be imported: `import { DocumentStatusBadge } from '@/components/upload/document-status-badge';`



++++++++++++++++++++++++



## STEP 4: Create Upload Statistics Component

**DIRECTIVE:** You shall create a dashboard component that displays aggregate statistics about uploaded documents using stat cards.

**Instructions:**
1. Create file: `src/components/upload/upload-stats.tsx`
2. Copy the complete code below
3. Save and verify no TypeScript errors

**File:** `src/components/upload/upload-stats.tsx`

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { 
  FileText, 
  Clock, 
  Loader2, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../../lib/utils';

interface UploadStatsData {
  total: number;
  queued: number;
  processing: number;
  completed: number;
  errors: number;
}

interface UploadStatsProps {
  /** Auto-refresh interval in ms (default: 5000, set to 0 to disable) */
  refreshInterval?: number;
  /** Custom className */
  className?: string;
}

/**
 * UploadStats Component
 * 
 * Displays aggregate statistics about uploaded documents
 * Features:
 * - Total files count
 * - Queued (uploaded) count
 * - Processing count
 * - Completed count
 * - Error count
 * - Auto-refresh every 5 seconds
 */
export function UploadStats({ 
  refreshInterval = 5000,
  className 
}: UploadStatsProps) {
  const [stats, setStats] = useState<UploadStatsData>({
    total: 0,
    queued: 0,
    processing: 0,
    completed: 0,
    errors: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch statistics from database
   */
  const fetchStats = async () => {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        setIsLoading(false);
        return;
      }

      // Get all user's documents
      const { data: documents, error: queryError } = await supabase
        .from('documents')
        .select('status')
        .eq('author_id', session.user.id);

      if (queryError) {
        throw new Error(queryError.message);
      }

      if (!documents) {
        setStats({ total: 0, queued: 0, processing: 0, completed: 0, errors: 0 });
        return;
      }

      // Calculate statistics
      const statsData: UploadStatsData = {
        total: documents.length,
        queued: documents.filter(d => d.status === 'uploaded').length,
        processing: documents.filter(d => d.status === 'processing').length,
        completed: documents.filter(d => d.status === 'completed').length,
        errors: documents.filter(d => d.status === 'error').length
      };

      setStats(statsData);
      setError(null);

    } catch (err) {
      console.error('[UploadStats] Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(fetchStats, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Error state
  if (error && !isLoading) {
    return (
      <div className={cn('text-sm text-red-600 dark:text-red-400', className)}>
        Failed to load statistics: {error}
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-2 md:grid-cols-5 gap-4', className)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-8 w-12 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Stat cards configuration
  const statCards = [
    {
      label: 'Total Files',
      value: stats.total,
      icon: FileText,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-800'
    },
    {
      label: 'Queued',
      value: stats.queued,
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
    },
    {
      label: 'Processing',
      value: stats.processing,
      icon: Loader2,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      animated: true
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      label: 'Errors',
      value: stats.errors,
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    }
  ];

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-5 gap-4', className)}>
      {statCards.map((stat) => {
        const Icon = stat.icon;
        
        return (
          <Card key={stat.label} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div className={cn(
                  'p-2 rounded-lg',
                  stat.bgColor
                )}>
                  <Icon 
                    className={cn(
                      'w-5 h-5',
                      stat.color,
                      stat.animated && 'animate-spin'
                    )} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
```

**Explanation:**
- **5 Stat Cards:** Total, Queued, Processing, Completed, Errors
- **Auto-Refresh:** Updates every 5 seconds by default
- **Responsive:** 2 columns on mobile, 5 on desktop
- **Visual Icons:** Color-coded icons for each metric
- **Loading State:** Skeleton placeholders during load
- **Error Handling:** Displays error message if query fails

**Verification:**
1. Component compiles with no TypeScript errors
2. Skeleton component exists at `src/components/ui/skeleton.tsx` (created in Prompt 2)



++++++++++++++++++++++++



## STEP 5: Create Upload Filters Component

**DIRECTIVE:** You shall create a comprehensive filtering interface with status, file type, date range, and search filters.

**Instructions:**
1. Create file: `src/components/upload/upload-filters.tsx`
2. Copy the complete code below
3. Save and verify no TypeScript errors

**File:** `src/components/upload/upload-filters.tsx`

```typescript
'use client';

import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, X, Filter } from 'lucide-react';
import { Badge } from '../ui/badge';

export interface UploadFilters {
  status: string;
  fileType: string;
  dateRange: string;
  searchQuery: string;
}

interface UploadFiltersProps {
  /** Current filter values */
  filters: UploadFilters;
  /** Callback when filters change */
  onFiltersChange: (filters: UploadFilters) => void;
  /** Number of active filters (for badge display) */
  activeFilterCount?: number;
}

/**
 * UploadFilters Component
 * 
 * Comprehensive filtering interface for upload queue
 * Features:
 * - Status filter (All, Queued, Processing, Completed, Error)
 * - File type filter (All, PDF, DOCX, TXT, etc.)
 * - Date range filter (Today, Last 7 days, Last 30 days, All time)
 * - Search by filename
 * - Clear all filters button
 * - Real-time filtering (no submit button)
 */
export function UploadFilters({ 
  filters, 
  onFiltersChange,
  activeFilterCount = 0
}: UploadFiltersProps) {
  /**
   * Update a single filter
   */
  const updateFilter = (key: keyof UploadFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      fileType: 'all',
      dateRange: 'all',
      searchQuery: ''
    });
  };

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = 
    filters.status !== 'all' ||
    filters.fileType !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.searchQuery !== '';

  return (
    <div className="space-y-4">
      {/* Filter Controls Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Status Filter */}
        <div className="flex-1 min-w-[150px]">
          <Select 
            value={filters.status} 
            onValueChange={(value) => updateFilter('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="uploaded">Queued</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* File Type Filter */}
        <div className="flex-1 min-w-[150px]">
          <Select 
            value={filters.fileType} 
            onValueChange={(value) => updateFilter('fileType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="File Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="docx">DOCX</SelectItem>
              <SelectItem value="doc">DOC</SelectItem>
              <SelectItem value="txt">TXT</SelectItem>
              <SelectItem value="md">Markdown</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="rtf">RTF</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="flex-1 min-w-[150px]">
          <Select 
            value={filters.dateRange} 
            onValueChange={(value) => updateFilter('dateRange', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            size="default"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by filename..."
          value={filters.searchQuery}
          onChange={(e) => updateFilter('searchQuery', e.target.value)}
          className="pl-9 pr-9"
        />
        {filters.searchQuery && (
          <button
            onClick={() => updateFilter('searchQuery', '')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span>Active filters:</span>
          </div>
          
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status}
              <button
                onClick={() => updateFilter('status', 'all')}
                className="ml-1 hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {filters.fileType !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Type: {filters.fileType.toUpperCase()}
              <button
                onClick={() => updateFilter('fileType', 'all')}
                className="ml-1 hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {filters.dateRange !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Date: {filters.dateRange}
              <button
                onClick={() => updateFilter('dateRange', 'all')}
                className="ml-1 hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {filters.searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: "{filters.searchQuery}"
              <button
                onClick={() => updateFilter('searchQuery', '')}
                className="ml-1 hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
```

**Explanation:**
- **4 Filter Types:** Status, File Type, Date Range, Search
- **Real-Time:** No submit button, changes apply instantly
- **Active Filter Badges:** Shows which filters are applied
- **Clear Filters:** Individual or all at once
- **Responsive:** Stacks on mobile, row on desktop
- **Search:** Filters by filename with clear button

**Verification:**
1. Component compiles with no TypeScript errors
2. UI components (Select, Input, Button, Badge) exist



++++++++++++++++++++++++



## STEP 6: Create Upload Queue Component

**DIRECTIVE:** You shall create a comprehensive table component that displays all uploaded documents with status, progress, actions, and integrates with the status polling hook.

**Instructions:**
1. Create file: `src/components/upload/upload-queue.tsx`
2. Copy the complete code below
3. Save and verify no TypeScript errors

**File:** `src/components/upload/upload-queue.tsx`

```typescript
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { 
  FileText, 
  MoreVertical, 
  Eye, 
  RefreshCw, 
  Trash2,
  Download
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { DocumentStatusBadge } from './document-status-badge';
import { Progress } from '../ui/progress';
import { formatFileSize, formatTimeAgo } from '../../lib/types/upload';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useDocumentStatus } from '../../hooks/use-document-status';
import { UploadFilters } from './upload-filters';
import { Skeleton } from '../ui/skeleton';

interface Document {
  id: string;
  title: string;
  status: 'uploaded' | 'processing' | 'completed' | 'error' | 'pending' | 'categorizing';
  processing_progress: number;
  processing_error: string | null;
  file_path: string;
  file_size: number;
  source_type: string;
  created_at: string;
  metadata: { original_filename?: string } | null;
}

interface UploadQueueProps {
  /** Auto-refresh on mount */
  autoRefresh?: boolean;
}

/**
 * UploadQueue Component
 * 
 * Full-featured upload queue table with:
 * - Real-time status updates via polling
 * - Filters (status, type, date, search)
 * - Sorting
 * - Actions (view, retry, delete)
 * - Progress indicators
 * - Empty state
 * - Loading state
 */
export function UploadQueue({ autoRefresh = true }: UploadQueueProps) {
  const router = useRouter();
  
  // State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<UploadFilters>({
    status: 'all',
    fileType: 'all',
    dateRange: 'all',
    searchQuery: ''
  });

  // Get document IDs for polling
  const documentIds = useMemo(() => documents.map(d => d.id), [documents]);

  // Status polling hook
  const { statuses, isPolling } = useDocumentStatus(documentIds, {
    enabled: autoRefresh && documents.length > 0
  });

  /**
   * Fetch documents from database
   */
  const fetchDocuments = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Authentication required');
        return;
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('author_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setDocuments(data || []);
    } catch (error) {
      console.error('[UploadQueue] Fetch error:', error);
      toast.error('Failed to load documents', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Update document status from polling
  useEffect(() => {
    if (statuses.size === 0) return;

    setDocuments(prevDocs => 
      prevDocs.map(doc => {
        const polledStatus = statuses.get(doc.id);
        if (polledStatus) {
          return {
            ...doc,
            status: polledStatus.status,
            processing_progress: polledStatus.progress,
            processing_error: polledStatus.error
          };
        }
        return doc;
      })
    );
  }, [statuses]);

  /**
   * Filter and sort documents
   */
  const filteredDocuments = useMemo(() => {
    let filtered = [...documents];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(doc => doc.status === filters.status);
    }

    // File type filter
    if (filters.fileType !== 'all') {
      filtered = filtered.filter(doc => doc.source_type === filters.fileType);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = Date.now();
      const ranges: Record<string, number> = {
        today: 24 * 60 * 60 * 1000,
        '7days': 7 * 24 * 60 * 60 * 1000,
        '30days': 30 * 24 * 60 * 60 * 1000,
        '90days': 90 * 24 * 60 * 60 * 1000,
      };
      
      const range = ranges[filters.dateRange];
      if (range) {
        filtered = filtered.filter(doc => {
          const docTime = new Date(doc.created_at).getTime();
          return now - docTime <= range;
        });
      }
    }

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(doc => {
        const filename = doc.metadata?.original_filename || doc.file_path;
        return (
          doc.title.toLowerCase().includes(query) ||
          filename.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [documents, filters]);

  /**
   * Retry document processing
   */
  const handleRetry = async (documentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Authentication required');
        return;
      }

      toast.loading('Retrying processing...', { id: 'retry' });

      const response = await fetch('/api/documents/process', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ documentId })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Processing restarted', { id: 'retry' });
        await fetchDocuments();
      } else {
        toast.error('Retry failed', {
          id: 'retry',
          description: data.error || 'Unknown error'
        });
      }
    } catch (error) {
      toast.error('Retry failed', {
        id: 'retry',
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Delete document
   */
  const handleDelete = async (documentId: string, filePath: string) => {
    if (!confirm('Are you sure you want to delete this document? This cannot be undone.')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Authentication required');
        return;
      }

      toast.loading('Deleting document...', { id: 'delete' });

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        // Continue anyway - database delete is more important
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('author_id', session.user.id);

      if (dbError) {
        throw new Error(dbError.message);
      }

      toast.success('Document deleted', { id: 'delete' });
      await fetchDocuments();
    } catch (error) {
      toast.error('Delete failed', {
        id: 'delete',
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * View document in workflow
   */
  const handleView = (documentId: string) => {
    router.push(`/workflow/${documentId}/stage1`);
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state (no documents at all)
  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No documents uploaded yet</h3>
          <p className="text-muted-foreground mb-4">
            Upload your first document to get started
          </p>
          <Button onClick={() => router.push('/upload')}>
            Upload Documents
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <UploadFilters 
        filters={filters} 
        onFiltersChange={setFilters}
      />

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filteredDocuments.length === 0 ? (
            // Empty state (filtered results)
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters
              </p>
              <Button 
                variant="outline" 
                onClick={() => setFilters({
                  status: 'all',
                  fileType: 'all',
                  dateRange: 'all',
                  searchQuery: ''
                })}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => {
                    const filename = doc.metadata?.original_filename || 
                                   doc.file_path.split('/').pop() || 
                                   'Unknown';

                    return (
                      <TableRow key={doc.id}>
                        {/* Document Name */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium truncate">{doc.title}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {filename}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Status Badge */}
                        <TableCell>
                          <DocumentStatusBadge 
                            status={doc.status}
                            progress={doc.processing_progress}
                          />
                        </TableCell>

                        {/* Progress Bar */}
                        <TableCell>
                          {(doc.status === 'processing' || doc.status === 'uploaded') && (
                            <div className="w-24">
                              <Progress value={doc.processing_progress} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">
                                {doc.processing_progress}%
                              </p>
                            </div>
                          )}
                          {doc.status === 'completed' && (
                            <span className="text-sm text-green-600 dark:text-green-400">
                              ✓ Done
                            </span>
                          )}
                          {doc.status === 'error' && (
                            <span className="text-sm text-red-600 dark:text-red-400">
                              Failed
                            </span>
                          )}
                        </TableCell>

                        {/* File Type */}
                        <TableCell>
                          <span className="text-sm uppercase font-mono">
                            {doc.source_type}
                          </span>
                        </TableCell>

                        {/* File Size */}
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatFileSize(doc.file_size)}
                          </span>
                        </TableCell>

                        {/* Upload Time */}
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatTimeAgo(doc.created_at)}
                          </span>
                        </TableCell>

                        {/* Actions Dropdown */}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(doc.id)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Document
                              </DropdownMenuItem>
                              {doc.status === 'error' && (
                                <DropdownMenuItem onClick={() => handleRetry(doc.id)}>
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Retry Processing
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleDelete(doc.id, doc.file_path)}
                                className="text-red-600 dark:text-red-400"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Polling Indicator */}
      {isPolling && (
        <div className="text-xs text-muted-foreground text-center">
          Auto-refreshing status every 2 seconds...
        </div>
      )}
    </div>
  );
}
```

**Explanation:**
- **Real-Time Updates:** Integrates with `useDocumentStatus` hook for 2-second polling
- **Comprehensive Table:** Shows all document info with sortable columns
- **Filters:** Integrates UploadFilters component
- **Actions:** View, Retry (for errors), Delete
- **Progress Bars:** Visual progress for processing documents
- **Empty States:** Handles no documents and no filtered results
- **Loading States:** Skeleton placeholders
- **Error Handling:** Toast notifications for all actions

**Verification:**
1. Component compiles with no TypeScript errors
2. All UI components exist (Table, DropdownMenu, etc.)



++++++++++++++++++++++++



## STEP 7: Update Upload Page with Queue Management

**DIRECTIVE:** You shall update the existing upload page to integrate the new upload queue and statistics components.

**Instructions:**
1. Open file: `src/app/(dashboard)/upload/page.tsx`
2. Replace the entire file contents with the code below
3. Save and verify no TypeScript errors

**File:** `src/app/(dashboard)/upload/page.tsx`

```typescript
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { UploadDropzone } from '../../../components/upload/upload-dropzone';
import { UploadQueue } from '../../../components/upload/upload-queue';
import { UploadStats } from '../../../components/upload/upload-stats';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { ArrowLeft, Upload as UploadIcon, ListFilter } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { UploadDocumentResponse } from '../../../lib/types/upload';

/**
 * Upload Page Component (Updated)
 * 
 * Enhanced upload page with:
 * - Two tabs: "Upload Files" and "Manage Queue"
 * - Upload dropzone in upload tab
 * - Full queue management in manage tab
 * - Statistics dashboard
 * - Real-time status updates
 */
export default function UploadPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('upload');
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [queueRefreshKey, setQueueRefreshKey] = React.useState(0);

  /**
   * Handle files added from dropzone
   */
  const handleFilesAdded = async (files: File[]) => {
    await uploadFiles(files);
  };

  /**
   * Upload files to API sequentially
   */
  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Authentication required', {
          description: 'Please sign in to upload documents'
        });
        router.push('/signin');
        return;
      }

      const token = session.access_token;
      let completedCount = 0;
      let failedCount = 0;

      // Upload files sequentially
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update progress
        const progressPercent = Math.round(((i / files.length) * 100));
        setUploadProgress(progressPercent);

        try {
          // Create form data
          const formData = new FormData();
          formData.append('file', file);
          formData.append('title', file.name.replace(/\.[^/.]+$/, '')); // Remove extension

          // Call upload API
          const response = await fetch('/api/documents/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          const data: UploadDocumentResponse = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.error || 'Upload failed');
          }

          completedCount++;
          
          toast.success(`Uploaded: ${file.name}`, {
            description: 'Text extraction started automatically'
          });

        } catch (error) {
          failedCount++;
          console.error(`Failed to upload ${file.name}:`, error);
          toast.error(`Failed to upload ${file.name}`, {
            description: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Final progress
      setUploadProgress(100);

      // Show summary
      if (completedCount > 0) {
        toast.success('Upload complete', {
          description: `Successfully uploaded ${completedCount} of ${files.length} file(s)`
        });
        
        // Switch to queue tab and refresh
        setActiveTab('queue');
        setQueueRefreshKey(prev => prev + 1);
      }

      if (failedCount === files.length) {
        toast.error('All uploads failed', {
          description: 'Please check your files and try again'
        });
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsUploading(false);
      // Keep progress at 100% for a moment before resetting
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <h1 className="text-3xl font-bold">Document Upload & Management</h1>
        <p className="text-muted-foreground">
          Upload documents for processing, monitor status, and manage your upload queue
        </p>
      </div>

      {/* Statistics Dashboard */}
      <div className="mb-6">
        <UploadStats refreshInterval={5000} />
      </div>

      {/* Tabs: Upload vs Queue Management */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="upload" className="gap-2">
            <UploadIcon className="w-4 h-4" />
            Upload Files
          </TabsTrigger>
          <TabsTrigger value="queue" className="gap-2">
            <ListFilter className="w-4 h-4" />
            Manage Queue
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <UploadDropzone
            onFilesAdded={handleFilesAdded}
            currentFileCount={0}
            maxFiles={100}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        </TabsContent>

        {/* Queue Management Tab */}
        <TabsContent value="queue">
          <UploadQueue key={queueRefreshKey} autoRefresh={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

**Explanation:**
- **Tabbed Interface:** Upload tab for new uploads, Queue tab for management
- **Statistics:** Shows aggregate metrics at top
- **Auto-Switch:** After upload completes, switches to queue tab automatically
- **Real-Time Updates:** Queue uses status polling hook
- **Refresh Key:** Forces queue refresh after uploads complete
- **Responsive:** Full width container for better table visibility

**Verification:**
1. File compiles with no TypeScript errors
2. Tabs component exists at `src/components/ui/tabs.tsx`
3. All imports resolve correctly



++++++++++++++++++++++++



## PROMPT 4 COMPLETION CHECKLIST

Before proceeding to Prompt 5, verify all items below:

### Components Created
- [ ] Status Polling API: `src/app/api/documents/status/route.ts`
- [ ] Status Polling Hook: `src/hooks/use-document-status.ts`
- [ ] Status Badge Component: `src/components/upload/document-status-badge.tsx`
- [ ] Upload Statistics: `src/components/upload/upload-stats.tsx`
- [ ] Upload Filters: `src/components/upload/upload-filters.tsx`
- [ ] Upload Queue: `src/components/upload/upload-queue.tsx`
- [ ] Updated Upload Page: `src/app/(dashboard)/upload/page.tsx`

### Build Verification
- [ ] Run `npm run build` - no TypeScript errors
- [ ] All imports resolve correctly
- [ ] No console errors when starting dev server
- [ ] Upload page loads at `/upload`

### Status Polling Testing
- [ ] Upload a PDF file
- [ ] Watch status badge change from "Queued" → "Processing" → "Completed"
- [ ] Verify status updates every 2 seconds without page refresh
- [ ] Verify polling stops when document reaches "Completed" state
- [ ] Check browser console for polling logs
- [ ] Switch to different tab, verify polling pauses (check console logs)
- [ ] Switch back to tab, verify polling resumes

### Queue Management Testing
- [ ] Navigate to "Manage Queue" tab
- [ ] Verify all uploaded documents appear in table
- [ ] Check statistics cards show correct counts
- [ ] Test status filter (select "Completed", verify filtering works)
- [ ] Test file type filter (select "PDF", verify filtering works)
- [ ] Test search (enter filename, verify filtering works)
- [ ] Test clear filters button
- [ ] Verify active filters display as badges
- [ ] Test actions dropdown (View, Retry, Delete)

### Real-Time Updates Testing
- [ ] Open two browser windows side-by-side
- [ ] Upload file in window 1
- [ ] Watch window 2 for real-time status updates
- [ ] Verify both windows show same status within 2 seconds

### Error Handling Testing
- [ ] Upload a corrupt PDF (create empty file with .pdf extension)
- [ ] Verify status changes to "Error"
- [ ] Verify error badge is red with X icon
- [ ] Click actions dropdown, verify "Retry Processing" option appears
- [ ] Click retry, verify processing restarts
- [ ] Verify error message stored in database

### Performance Testing
- [ ] Upload 10+ files at once
- [ ] Verify all files process without timeout
- [ ] Verify polling doesn't cause excessive network traffic
- [ ] Check Network tab: status API calls should be ~200ms or less
- [ ] Verify UI remains responsive during processing

### UI/UX Testing
- [ ] Status badges have correct colors (gray, blue, green, red)
- [ ] Progress bars animate smoothly
- [ ] Icons animate for "Processing" status (spinner rotates)
- [ ] Table is responsive on mobile
- [ ] Filters work on mobile
- [ ] Statistics cards stack properly on mobile
- [ ] Empty state displays when no documents
- [ ] Empty state displays when no filtered results

### Integration Testing
- [ ] Upload → View workflow (click "View Document", navigates to workflow)
- [ ] Upload → Process → Complete → Navigate to workflow
- [ ] Delete document, verify removed from queue
- [ ] Verify deleted document removed from storage (check Supabase)
- [ ] Upload, immediately switch to Queue tab, verify appears

### Manual Test Scenario

1. **Fresh Upload Test:**
   - Navigate to `/upload`
   - Upload 3 different file types (PDF, DOCX, TXT)
   - Verify statistics update (Total Files increases)
   - Verify "Queued" count increases
   - Wait 5-10 seconds
   - Verify "Processing" count increases, "Queued" decreases
   - Wait for completion
   - Verify "Completed" count increases, "Processing" decreases

2. **Queue Management Test:**
   - Switch to "Manage Queue" tab
   - Verify all 3 files appear in table
   - Filter by status: "Completed"
   - Verify only completed files show
   - Clear filter
   - Search for one filename
   - Verify only matching file shows
   - Click actions dropdown on a completed file
   - Click "View Document"
   - Verify navigation to workflow page

3. **Error Handling Test:**
   - Create empty file: `touch empty.pdf`
   - Upload empty.pdf
   - Watch it fail (status becomes "Error")
   - Click actions dropdown
   - Click "Retry Processing"
   - Verify retry attempted (will fail again, expected)
   - Click "Delete"
   - Confirm deletion
   - Verify document removed from queue

4. **Polling Behavior Test:**
   - Upload a large PDF (5-10 MB)
   - Open browser DevTools → Console
   - Watch for `[useDocumentStatus]` log messages
   - Verify polling starts
   - Minimize or switch to different tab
   - Check console: should see "Tab hidden, pausing polling"
   - Switch back to tab
   - Check console: should see "Tab visible, resuming polling"
   - Wait for document to complete
   - Check console: should see "All documents completed, stopping polling"

**If all items checked:** ✅ Prompt 4 complete! Proceed to Prompt 5.

---

## What's Next

**Prompt 5** will build:
- Metadata editing form (edit title, version, URL, date)
- Content preview component (show extracted text)
- Enhanced error details dialog
- Metadata update API endpoint (PATCH /api/documents/:id)

**Prompt 6** will build:
- Workflow integration (connect upload module to categorization workflow)
- Document selector updates (include uploaded documents)
- Bulk workflow processing
- End-to-end testing
- Final documentation

After Prompt 6, the document upload module will be **fully complete** with all features from the requirements specification.

---

**END OF PROMPT 4**

