# Document Upload Module - Architectural Decisions
**Version:** 1.0  
**Date:** October 9, 2025  
**Purpose:** Document key architectural decisions for Document Upload & Processing Module  
**Status:** In Progress

---

## Overview

This document records the architectural decisions made during the design phase of the Document Upload & Processing Module for the Bright Run LoRA Training Data Platform. Each decision includes context, analysis, and rationale.

---

## Decision Log

### Decision #1: File Processing State Reporting Mechanism

**Status:** ✅ DECIDED  
**Date:** October 9, 2025  
**Priority:** 1 (CRITICAL)  
**Estimated Analysis Time:** 30 minutes  
**Decision Owner:** Technical Architecture

---

#### Context

Users need to see real-time processing status for uploaded documents as they progress through multiple stages:

```
Upload → Text Extraction → Validation → Ready for Categorization
```

**Processing States:**
- `uploaded` - File received, queued for processing
- `processing` - Text extraction in progress
- `completed` - Ready for categorization workflow
- `error` - Processing failed, needs attention

**User Requirements:**
- See which documents are currently processing
- Monitor progress without page refresh
- Identify and retry failed uploads
- Know when documents are ready for next workflow step

**Technical Context:**
- Application deployed on Vercel (serverless)
- Next.js 14 App Router
- Server-side text extraction (PDF, DOCX parsing)
- Processing time varies: 2-30 seconds per document
- Batch uploads: up to 100 files

---

#### Options Analyzed

Three approaches were evaluated for status reporting:

**Option A: JavaScript Polling (Recommended)**  
**Option B: WebSockets (Real-time)**  
**Option C: No Real-Time Updates (Manual Refresh)**

---

### Option A: JavaScript Polling ✅ RECOMMENDED

#### Description
Frontend periodically calls a status API endpoint to check processing state.

```typescript
// Polling implementation pattern
const pollStatus = async (documentId: string) => {
  const response = await fetch(`/api/documents/status?id=${documentId}`);
  const { status, progress } = await response.json();
  
  // Update UI with latest status
  updateDocumentStatus(documentId, status, progress);
  
  // Continue polling if still processing
  if (status === 'processing') {
    setTimeout(() => pollStatus(documentId), 2000);
  }
};
```

#### Implementation Details

**Status Endpoint:**
```typescript
// src/app/api/documents/status/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('id');
  
  // Query document status from database
  const { data, error } = await supabase
    .from('documents')
    .select('id, status, processing_progress, error_message')
    .eq('id', documentId)
    .single();
    
  return NextResponse.json({
    status: data.status,
    progress: data.processing_progress || 0,
    error: data.error_message
  });
}
```

**Frontend Polling:**
```typescript
// Hook for polling document status
function useDocumentStatus(documentId: string) {
  const [status, setStatus] = useState<DocumentStatus>('uploaded');
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    const poll = async () => {
      const response = await fetch(`/api/documents/status?id=${documentId}`);
      const data = await response.json();
      
      setStatus(data.status);
      setProgress(data.progress);
      
      // Stop polling when complete or error
      if (data.status === 'completed' || data.status === 'error') {
        clearInterval(intervalId);
      }
    };
    
    // Poll every 2 seconds while processing
    if (status === 'processing' || status === 'uploaded') {
      intervalId = setInterval(poll, 2000);
    }
    
    return () => clearInterval(intervalId);
  }, [documentId, status]);
  
  return { status, progress };
}
```

#### Advantages ✅

1. **Simple Implementation**
   - Straightforward REST API pattern
   - No additional infrastructure required
   - Easy to debug and test
   - Works with existing Next.js API routes

2. **Vercel Compatible**
   - No persistent connections needed
   - Serverless-friendly architecture
   - No WebSocket server to maintain
   - Scales automatically with Vercel

3. **Reliable**
   - Survives network interruptions (auto-recovers)
   - No connection state to manage
   - Client controls polling frequency
   - Easy error handling and retry logic

4. **Low Complexity**
   - No new dependencies
   - Minimal code changes
   - Standard HTTP patterns developers know
   - Simple testing with curl/Postman

5. **Flexible**
   - Can adjust polling frequency dynamically
   - Batch status checks (multiple documents at once)
   - Easy to pause/resume polling
   - Works across browser tabs

6. **Cost-Effective**
   - No additional service costs
   - Standard HTTP requests (included in Vercel)
   - Polling only when needed (active uploads)
   - Stops automatically when complete

#### Disadvantages ⚠️

1. **Slight Delay**
   - 2-3 second lag between status changes and UI update
   - Not "instant" like WebSockets
   - Polling interval trade-off (faster = more requests)

2. **API Request Volume**
   - Multiple requests per document
   - 30 requests per minute per document (2s interval)
   - Could be significant with 100 concurrent uploads
   - Mitigated by: batch endpoint, stopping when complete

3. **Battery Usage**
   - Continuous polling drains mobile battery
   - Background tabs keep polling
   - Mitigated by: stop polling when tab inactive

#### Existing Patterns in Codebase

**Pattern Already Used:** Chunk Extraction Status
```typescript
// src/app/api/chunks/status/route.ts (lines 4-30)
export async function GET(request: NextRequest) {
  const documentId = searchParams.get('documentId');
  const job = await chunkExtractionJobService.getLatestJob(documentId);
  
  return NextResponse.json({
    job: job || null,
  });
}
```

**Database Service Exists:**
```typescript
// src/lib/chunk-service.ts (lines 258-261)
async getLatestJob(documentId: string): Promise<ChunkExtractionJob | null> {
  return this.getJobByDocument(documentId);
}
```

**Frontend Already Handles Async Processing:**
```typescript
// src/components/client/WorkflowCompleteClient.tsx (lines 352-381)
{isSubmitting && (
  <Card>
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Clock className="animate-spin" />
        <h3>Processing Categorization Data</h3>
      </div>
      <Progress value={progress} />
    </div>
  </Card>
)}
```

#### Implementation Effort

**Estimated Time:** 2-3 hours

**Tasks:**
1. Create `/api/documents/status` endpoint (30 min)
2. Add `processing_progress` column to documents table (15 min)
3. Create `useDocumentStatus` React hook (45 min)
4. Update upload UI to show status (45 min)
5. Add batch status endpoint for multiple documents (30 min)
6. Testing and refinement (30 min)

**Files to Create:**
- `src/app/api/documents/status/route.ts` (new)
- `src/hooks/use-document-status.ts` (new)

**Files to Modify:**
- `src/lib/database.ts` (add status service)
- Upload UI component (add status display)

---

### Option B: WebSockets (Real-Time)

#### Description
Persistent bidirectional connection for instant status updates.

```typescript
// WebSocket implementation pattern
const ws = new WebSocket('wss://api.example.com/documents/status');

ws.onmessage = (event) => {
  const { documentId, status, progress } = JSON.parse(event.data);
  updateDocumentStatus(documentId, status, progress);
};
```

#### Advantages ✅

1. **True Real-Time**
   - Instant status updates (< 100ms latency)
   - No polling delay
   - Server pushes updates immediately

2. **Efficient**
   - Single persistent connection
   - Lower bandwidth than polling
   - No repeated request overhead

3. **Better UX**
   - Feels more responsive
   - Progress updates smoother
   - Professional appearance

#### Disadvantages ❌

1. **Vercel Incompatible** 🚨
   - Vercel serverless functions are stateless
   - Cannot maintain WebSocket connections
   - Would require separate WebSocket server
   - Additional infrastructure cost and complexity

2. **Complex Implementation**
   - Need WebSocket server (separate service)
   - Connection state management
   - Reconnection logic required
   - Authentication complexity

3. **Additional Dependencies**
   - WebSocket library (Socket.io, ws)
   - Potentially Redis for pub/sub
   - Separate deployment pipeline
   - More moving parts to debug

4. **Cost**
   - Additional server costs (WebSocket server)
   - Redis or similar for message broker
   - Increased infrastructure complexity
   - Ongoing maintenance burden

5. **Browser Compatibility**
   - Need fallback for older browsers
   - Connection can drop on mobile networks
   - More edge cases to handle

#### Implementation Effort

**Estimated Time:** 8-12 hours (Plus ongoing maintenance)

**Tasks:**
1. Set up separate WebSocket server (3-4 hours)
2. Implement authentication for WebSocket (2 hours)
3. Build reconnection logic (2 hours)
4. Create frontend WebSocket client (2 hours)
5. Test connection edge cases (2 hours)
6. Deploy and configure infrastructure (2 hours)

**Additional Infrastructure:**
- WebSocket server (Node.js + Socket.io)
- Redis or message broker
- Separate deployment from Vercel
- Load balancer for WebSocket server

#### Verdict

**❌ Not Recommended** for this use case due to:
- Vercel deployment constraints
- Overkill for 2-30 second processing times
- Significant complexity increase
- Additional cost and maintenance

**When to Reconsider:**
- If migrating off Vercel to traditional servers
- If real-time collaboration features needed
- If processing time > 5 minutes per document
- If building admin dashboard with live monitoring

---

### Option C: No Real-Time Updates (Manual Refresh)

#### Description
User must manually refresh page or navigate away and back to see status changes.

```typescript
// Simple status display (no updates)
function DocumentList() {
  const documents = await getDocuments(); // Server Component
  
  return documents.map(doc => (
    <div>
      <span>{doc.title}</span>
      <Badge>{doc.status}</Badge>
    </div>
  ));
}
```

#### Advantages ✅

1. **Zero Complexity**
   - No polling logic
   - No status endpoints
   - No frontend state management
   - Simplest possible implementation

2. **Zero Cost**
   - No additional API calls
   - No background processes
   - Minimal server load

3. **Server Component Compatible**
   - Can use Next.js Server Components
   - No client JavaScript needed
   - Better SEO and initial load

#### Disadvantages ❌

1. **Poor User Experience** 🚨
   - Users don't know when processing is complete
   - Must manually refresh repeatedly
   - Frustrating for batch uploads
   - Feels broken or stuck

2. **Workflow Disruption**
   - Cannot proceed to next step without knowing status
   - No visual feedback during processing
   - Users may leave page thinking it failed
   - Higher support burden ("Is it working?")

3. **Cannot Show Progress**
   - No indication of how long to wait
   - Binary state only (processing vs complete)
   - No error detection until refresh
   - No retry mechanism

4. **Not Viable for This Use Case**
   - Document processing is core workflow
   - Users need to proceed to categorization
   - Batch uploads need progress tracking
   - Processing errors need immediate visibility

#### Implementation Effort

**Estimated Time:** 30 minutes

**Tasks:**
1. Display static status badges (30 min)

#### Verdict

**❌ Not Acceptable** for this use case because:
- Breaks critical workflow (upload → categorize)
- Poor user experience for core feature
- No way to know when to proceed
- Would require adding polling later anyway

**When This Would Be Acceptable:**
- Background admin processes
- Overnight batch jobs
- Non-critical reporting features
- When email notification suffices

---

## Decision Summary

### ✅ DECISION: Implement JavaScript Polling (Option A)

**Rationale:**

1. **Best Fit for Requirements**
   - Provides real-time-enough updates (2-3s delay acceptable)
   - Works perfectly with Vercel serverless architecture
   - Handles batch uploads effectively
   - Users get continuous feedback

2. **Technical Alignment**
   - Pattern already exists in codebase (chunk status endpoint)
   - No new infrastructure needed
   - Leverages existing API routes and database
   - Team already familiar with pattern

3. **Pragmatic Balance**
   - Sufficient UX for 2-30 second processing times
   - Low complexity and maintenance burden
   - Cost-effective solution
   - Can be implemented quickly (2-3 hours)

4. **Processing Time Context**
   - Text extraction: 2-30 seconds per document
   - 2-second polling interval = 1-15 status checks per document
   - Small delay compared to total processing time
   - Users won't notice 2-3 second lag

5. **Batch Upload Support**
   - Can batch check status of multiple documents
   - Single endpoint call returns status for all active uploads
   - Stops polling for completed/error documents
   - Scales well to 100 concurrent uploads

**Implementation Plan:**

```
Phase 1: Basic Polling (Sprint 1)
├── Create /api/documents/status endpoint
├── Add processing_progress column
├── Build useDocumentStatus hook
└── Update upload UI with status badges

Phase 2: Optimization (Sprint 2)
├── Add batch status endpoint
├── Implement exponential backoff
├── Add pause/resume on tab visibility
└── Battery-saving optimizations
```

**Success Metrics:**
- Status updates visible within 3 seconds of change
- Polling stops when document reaches terminal state
- API calls < 50 per document upload
- No polling for documents in completed/error state

---

## Alternative Approaches Considered

### Hybrid Approach: Polling + Server-Sent Events (SSE)

**Description:** Use polling for initial implementation, migrate to SSE later if needed.

**Advantages:**
- Start simple, optimize later
- SSE is one-way (simpler than WebSockets)
- SSE works with Vercel Edge Functions

**Decision:** Defer until proven need
- Polling sufficient for current requirements
- Can migrate if processing times increase significantly
- Would require client code changes

### Push Notifications

**Description:** Browser push notifications when processing completes.

**Advantages:**
- Works even when user leaves page
- Good for long-processing documents

**Decision:** Not for MVP
- Requires permission prompt (poor UX)
- Overkill for 2-30 second processing
- Add as future enhancement if needed

---

## Database Schema Updates Required

Add processing progress tracking to documents table:

```sql
-- Add processing progress column
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS processing_progress INTEGER DEFAULT 0;

-- Add processing error details
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS processing_error TEXT;

-- Add processing timestamps
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS processing_completed_at TIMESTAMPTZ;

-- Index for efficient status queries
CREATE INDEX IF NOT EXISTS idx_documents_status_updated 
  ON documents(status, updated_at) 
  WHERE status IN ('uploaded', 'processing');

-- Comments
COMMENT ON COLUMN documents.processing_progress IS 'Processing progress percentage (0-100)';
COMMENT ON COLUMN documents.processing_error IS 'Error message if processing failed';
```

---

## API Endpoint Specification

### GET /api/documents/status

**Purpose:** Get processing status for one or more documents

**Query Parameters:**
- `id` (string) - Single document ID
- `ids` (string) - Comma-separated document IDs for batch query
- `userId` (string) - Filter by user (security)

**Response Format:**
```json
{
  "documents": [
    {
      "id": "uuid-here",
      "status": "processing",
      "progress": 45,
      "error": null,
      "processingStartedAt": "2025-10-09T14:30:00Z",
      "estimatedSecondsRemaining": 12
    }
  ]
}
```

**Status Codes:**
- 200: Success
- 400: Invalid parameters
- 403: Unauthorized (not user's document)
- 404: Document not found
- 500: Server error

**Caching:**
- No caching for documents in processing state
- 60s cache for completed/error states

---

## Polling Strategy Details

### Interval Timing

**Base Interval:** 2000ms (2 seconds)

**Dynamic Adjustment:**
```typescript
function getPollingInterval(status: DocumentStatus, consecutiveChecks: number) {
  // Start fast, slow down for long-running processes
  if (status === 'uploaded') return 1000;  // Check faster when just uploaded
  if (status === 'processing' && consecutiveChecks < 5) return 2000;
  if (status === 'processing' && consecutiveChecks < 10) return 3000;
  return 5000; // Max interval for very long processes
}
```

### Stop Conditions

Polling stops when:
1. Status becomes `completed`
2. Status becomes `error`
3. User navigates away from page
4. Browser tab becomes inactive (pauses, resumes on active)
5. Network error > 3 consecutive failures
6. Maximum poll duration exceeded (5 minutes)

### Batch Optimization

For multiple simultaneous uploads:
```typescript
// Instead of N separate polls, one batch poll
const documentIds = activeUploads.map(d => d.id);
const statuses = await fetch(`/api/documents/status?ids=${documentIds.join(',')}`);
```

**Benefits:**
- Single API call for all documents
- Reduces request volume by N times
- More efficient database query (WHERE id IN (...))
- Lower Vercel function invocations

---

## Error Handling Strategy

### Network Errors

```typescript
async function pollWithRetry(documentId: string, retryCount = 0) {
  try {
    const response = await fetch(`/api/documents/status?id=${documentId}`);
    return await response.json();
  } catch (error) {
    if (retryCount < 3) {
      // Exponential backoff: 2s, 4s, 8s
      await delay(2000 * Math.pow(2, retryCount));
      return pollWithRetry(documentId, retryCount + 1);
    }
    throw new Error('Failed to check status after 3 retries');
  }
}
```

### Processing Errors

When document status is `error`:
1. Stop polling immediately
2. Display error message from `processing_error` field
3. Show "Retry" button to requeue document
4. Log error details for debugging

### Timeout Handling

```typescript
const PROCESSING_TIMEOUT = 5 * 60 * 1000; // 5 minutes

function useDocumentStatus(documentId: string) {
  useEffect(() => {
    const startTime = Date.now();
    
    const poll = async () => {
      if (Date.now() - startTime > PROCESSING_TIMEOUT) {
        setError('Processing timeout - please contact support');
        return;
      }
      // ... continue polling
    };
  }, [documentId]);
}
```

---

## Performance Considerations

### Request Volume Calculation

**Single Document:**
- Upload time: 1 second
- Processing time: 10 seconds (average)
- Polling interval: 2 seconds
- Total polls: 5 requests
- Total API calls: ~6 (including upload)

**Batch Upload (100 documents):**
- Using individual polling: 100 × 5 = 500 requests
- Using batch polling: ~50 requests (10s processing ÷ 2s interval)
- **Savings: 90% fewer requests**

### Database Query Optimization

```sql
-- Efficient batch query
SELECT id, status, processing_progress, processing_error
FROM documents
WHERE id = ANY($1::uuid[])  -- Batch query
  AND author_id = $2         -- Security filter
LIMIT 100;                   -- Safety limit

-- Uses index: idx_documents_status_updated
```

**Query time:** < 5ms for 100 documents

### Vercel Function Invocations

**Cost Estimate:**
- Vercel free tier: 100,000 invocations/month
- Batch upload (100 docs): ~50 status checks
- Monthly capacity: ~2,000 batch uploads
- Well within free tier limits

---

## Mobile & Battery Optimization

### Tab Visibility Detection

```typescript
function useDocumentStatus(documentId: string) {
  const [isTabVisible, setIsTabVisible] = useState(true);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  
  // Only poll when tab is visible
  useEffect(() => {
    if (!isTabVisible) return; // Pause polling
    
    // Resume polling...
  }, [isTabVisible, documentId]);
}
```

**Battery Impact:**
- Active polling: ~1-2% battery per hour
- Paused (background): 0% battery drain
- Automatic pause/resume based on tab visibility

---

## Testing Strategy

### Unit Tests

```typescript
describe('useDocumentStatus', () => {
  it('polls status every 2 seconds', async () => {
    const { result } = renderHook(() => useDocumentStatus('doc-123'));
    
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    }, { timeout: 2500 });
  });
  
  it('stops polling when status is completed', async () => {
    fetchMock.mockResolvedValue({ status: 'completed' });
    const { result } = renderHook(() => useDocumentStatus('doc-123'));
    
    await waitFor(() => {
      expect(result.current.status).toBe('completed');
    });
    
    // Wait additional time to verify no more polls
    await new Promise(resolve => setTimeout(resolve, 5000));
    expect(fetchMock).toHaveBeenCalledTimes(1); // Only initial call
  });
});
```

### Integration Tests

1. **Upload → Process → Complete Flow**
   - Upload document
   - Verify status endpoint returns 'processing'
   - Wait for completion
   - Verify status endpoint returns 'completed'

2. **Batch Upload Test**
   - Upload 10 documents simultaneously
   - Verify batch status endpoint works
   - Verify all documents complete successfully

3. **Error Handling Test**
   - Upload corrupt file
   - Verify status endpoint returns 'error'
   - Verify error message is displayed
   - Test retry functionality

### Load Testing

```bash
# Artillery load test config
scenarios:
  - name: "Status polling simulation"
    flow:
      - get:
          url: "/api/documents/status?ids=doc1,doc2,doc3"
      - think: 2  # 2 second wait (polling interval)
      - loop:
        - get:
            url: "/api/documents/status?ids=doc1,doc2,doc3"
        - think: 2
        count: 10  # 10 polls = 20 seconds of processing

# Run with 50 concurrent users
artillery run --count 50 polling-test.yml
```

**Performance Targets:**
- P95 latency < 200ms
- No errors under 50 concurrent users
- No database connection pool exhaustion

---

## Migration Path (Future)

If polling becomes insufficient (unlikely), migration path to SSE:

**Phase 1: Add SSE Support (Keep Polling as Fallback)**
```typescript
function useDocumentStatus(documentId: string) {
  const [useSSE] = useState(() => 'EventSource' in window);
  
  if (useSSE) {
    // Use Server-Sent Events
    const eventSource = new EventSource(`/api/documents/status/stream?id=${documentId}`);
    eventSource.onmessage = (event) => {
      const { status, progress } = JSON.parse(event.data);
      updateStatus(status, progress);
    };
  } else {
    // Fallback to polling
    // ... existing polling logic
  }
}
```

**Phase 2: Gradually Migrate Users**
- A/B test SSE vs polling
- Monitor error rates and latency
- Gradual rollout based on browser support

**Phase 3: Deprecate Polling (Optional)**
- Remove polling code after SSE proven stable
- Keep polling endpoint for API consumers

---

## Documentation Requirements

### Developer Documentation

Create `docs/api/documents-status.md`:
- Endpoint specification
- Polling best practices
- Code examples
- Error handling guide

### User-Facing Documentation

No user documentation needed - status updates are automatic and transparent.

---

## Security Considerations

### Authorization

```typescript
// Status endpoint security
export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const documentId = searchParams.get('id');
  
  // Verify user owns the document
  const document = await supabase
    .from('documents')
    .select('author_id')
    .eq('id', documentId)
    .single();
  
  if (document.author_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // ... return status
}
```

### Rate Limiting

```typescript
// Prevent abuse via excessive polling
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
});

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  const { success } = await ratelimit.limit(session.user.id);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' }, 
      { status: 429 }
    );
  }
  
  // ... return status
}
```

**Rate Limits:**
- 100 requests per minute per user
- Sufficient for polling 50 documents at 2s interval
- Prevents abuse and runaway polling loops

---

## Implementation Checklist

### Backend Tasks

- [ ] Add database columns (processing_progress, processing_error, timestamps)
- [ ] Create migration script
- [ ] Create `/api/documents/status` endpoint
- [ ] Add authorization checks
- [ ] Implement batch query support
- [ ] Add rate limiting
- [ ] Update text extraction service to set progress
- [ ] Write unit tests for status endpoint

### Frontend Tasks

- [ ] Create `useDocumentStatus` hook
- [ ] Implement polling logic with stop conditions
- [ ] Add tab visibility detection
- [ ] Create status badge components
- [ ] Update upload UI to show status
- [ ] Add progress bars
- [ ] Implement error display and retry
- [ ] Add batch status management
- [ ] Write React hook tests

### Testing Tasks

- [ ] Unit tests for polling hook
- [ ] Integration tests for upload → status → complete flow
- [ ] Test error handling and retry
- [ ] Test batch status queries
- [ ] Load test with 50 concurrent users
- [ ] Mobile battery impact testing
- [ ] Browser compatibility testing

### Documentation Tasks

- [ ] API endpoint documentation
- [ ] Code examples for developers
- [ ] Architecture decision record (this document)
- [ ] Update system architecture diagram

---

## Appendix: Code Examples

### Complete useDocumentStatus Hook

```typescript
// src/hooks/use-document-status.ts
import { useState, useEffect, useCallback } from 'react';

type DocumentStatus = 'uploaded' | 'processing' | 'completed' | 'error';

interface StatusResult {
  status: DocumentStatus;
  progress: number;
  error: string | null;
  estimatedSecondsRemaining: number | null;
}

interface UseDocumentStatusResult extends StatusResult {
  isLoading: boolean;
  retry: () => void;
}

export function useDocumentStatus(
  documentId: string | null,
  options: {
    enabled?: boolean;
    interval?: number;
    onComplete?: () => void;
    onError?: (error: string) => void;
  } = {}
): UseDocumentStatusResult {
  const {
    enabled = true,
    interval = 2000,
    onComplete,
    onError,
  } = options;

  const [status, setStatus] = useState<DocumentStatus>('uploaded');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [estimatedSecondsRemaining, setEstimatedSecondsRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);

  // Handle tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Polling function
  const pollStatus = useCallback(async () => {
    if (!documentId || !enabled || !isTabVisible) return;

    try {
      const response = await fetch(`/api/documents/status?id=${documentId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      setStatus(data.status);
      setProgress(data.progress);
      setError(data.error);
      setEstimatedSecondsRemaining(data.estimatedSecondsRemaining);
      setIsLoading(false);
      setConsecutiveErrors(0);

      // Trigger callbacks
      if (data.status === 'completed' && onComplete) {
        onComplete();
      }
      if (data.status === 'error' && onError && data.error) {
        onError(data.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to poll document status:', errorMessage);
      
      setConsecutiveErrors(prev => prev + 1);
      
      // Stop polling after 3 consecutive errors
      if (consecutiveErrors >= 2) {
        setError('Failed to check status. Please refresh the page.');
        setIsLoading(false);
      }
    }
  }, [documentId, enabled, isTabVisible, consecutiveErrors, onComplete, onError]);

  // Polling effect
  useEffect(() => {
    if (!documentId || !enabled) return;

    // Initial poll
    pollStatus();

    // Continue polling if still processing
    const shouldContinuePolling = 
      isTabVisible &&
      (status === 'uploaded' || status === 'processing') &&
      consecutiveErrors < 3;

    if (!shouldContinuePolling) return;

    const intervalId = setInterval(pollStatus, interval);

    return () => clearInterval(intervalId);
  }, [documentId, enabled, status, interval, isTabVisible, consecutiveErrors, pollStatus]);

  // Retry function
  const retry = useCallback(() => {
    setConsecutiveErrors(0);
    setError(null);
    setIsLoading(true);
    pollStatus();
  }, [pollStatus]);

  return {
    status,
    progress,
    error,
    estimatedSecondsRemaining,
    isLoading,
    retry,
  };
}
```

### Usage Example

```typescript
// Upload component
function DocumentUpload() {
  const [uploadedDocId, setUploadedDocId] = useState<string | null>(null);
  
  const { status, progress, error, retry } = useDocumentStatus(uploadedDocId, {
    onComplete: () => {
      toast.success('Document ready for categorization!');
      router.push(`/workflow/${uploadedDocId}/categorize`);
    },
    onError: (error) => {
      toast.error(`Processing failed: ${error}`);
    },
  });

  const handleUpload = async (file: File) => {
    const document = await uploadDocument(file);
    setUploadedDocId(document.id);
  };

  return (
    <div>
      <FileUploader onUpload={handleUpload} />
      
      {uploadedDocId && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Document</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Status: {status}</span>
                <Badge variant={status === 'completed' ? 'success' : 'default'}>
                  {status}
                </Badge>
              </div>
              
              <Progress value={progress} />
              
              <div className="text-sm text-muted-foreground">
                {progress}% complete
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {error}
                    <Button onClick={retry} variant="outline" size="sm" className="ml-2">
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

## Conclusion

**JavaScript polling with a 2-second interval provides the optimal balance** of real-time feedback, implementation simplicity, and compatibility with our Vercel deployment architecture. This decision enables us to deliver a great user experience for document upload status tracking without introducing unnecessary complexity or infrastructure dependencies.

The pattern already exists in our codebase for chunk extraction status, making this a natural extension of our existing architecture. Implementation time is estimated at 2-3 hours, and the solution will scale effectively to our requirement of 100 concurrent document uploads.

---

## Decision #2: Architectural Approach - Integrated vs. Standalone Module

**Status:** ✅ DECIDED  
**Date:** October 9, 2025  
**Priority:** 2 (HIGH)  
**Estimated Analysis Time:** 45 minutes  
**Decision Owner:** System Architecture

---

#### Context

The document upload module can be implemented in two fundamentally different ways:

**Option A: Integrated Module** - Build upload functionality directly within the main Next.js application (`chunks-alpha/src/`)

**Option B: Standalone Module** - Build as a separate application (like `doc-module/`) with independent deployment

This decision impacts:
- Development workflow and speed
- Code reuse and maintenance
- User experience and navigation
- Deployment complexity
- Future scalability

**Current State:**
- Main application: `src/` - Next.js 14, deployed to Vercel, 75+ components
- Wireframe: `doc-module/` - Vite, standalone, UI reference only
- Workflow: Dashboard → Document Selection → Categorization → Chunks → Dimensions

**Critical Question:** Should users experience upload as part of the unified application workflow, or as a separate tool?

---

#### Application Size & Complexity Analysis

### Main Application (`src/`)

**Size Metrics:**
- **Files:** 75+ component files, 38 page files, 118+ imports
- **Lines of Code:** ~15,000+ lines (estimated)
- **Components:** 48 UI components, 27 feature components
- **Pages:** 12+ page routes
- **API Routes:** 15+ endpoints

**Architecture:**
```
src/
├── app/
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Dashboard & document selection
│   ├── (workflow)/          # Categorization workflow (3 stages)
│   ├── chunks/              # Chunk viewing & management
│   ├── api/                 # 15+ API endpoints
│   └── ...
├── components/
│   ├── ui/                  # 48 Radix UI components
│   ├── client/              # Client components
│   ├── server/              # Server components
│   ├── workflow/            # Workflow-specific UI
│   ├── chunks/              # Chunk-related components
│   └── auth/                # Auth forms
├── lib/
│   ├── database.ts          # Supabase services
│   ├── supabase.ts          # Client setup
│   ├── auth-context.tsx     # Auth provider
│   ├── dimension-generation/ # AI dimension generator
│   ├── chunk-extraction/    # AI chunk extractor
│   └── ...
└── stores/
    └── workflow-store.ts    # Zustand state management
```

**Dependencies:**
- Next.js 14 (App Router, Server Components)
- Supabase (Database + Auth + Storage)
- Anthropic AI (Claude API)
- Radix UI (48 components)
- Zustand (State management)
- Lucide React (Icons)

**Current User Flow:**
```
1. Sign In (/signin)
2. Dashboard (/dashboard) - Document list
3. Select Document → Categorization Workflow
4. Stage 1: Belonging Rating
5. Stage 2: Category Selection
6. Stage 3: Tag Assignment
7. Complete → View Chunks
8. Generate Dimensions → Export Training Data
```

**Missing Step:** Document Upload (currently users work with pre-existing documents)

---

### Wireframe Module (`doc-module/`)

**Size Metrics:**
- **Files:** 53 component files
- **Lines of Code:** ~3,000+ lines
- **Components:** 48 UI components (same Radix set), 5 feature components
- **Build System:** Vite (different from Next.js)

**Architecture:**
```
doc-module/
├── src/
│   ├── components/
│   │   ├── ui/              # 48 Radix UI components (duplicated)
│   │   ├── upload-interface.tsx
│   │   ├── queue-management.tsx
│   │   └── content-preview.tsx
│   ├── lib/
│   │   └── stores/
│   │       └── document-store.ts  # Zustand (mock data)
│   └── App.tsx
└── package.json             # Vite dependencies
```

**Key Characteristics:**
- **No Backend Integration:** Mock data only, simulated processing
- **No Authentication:** No user management
- **No Database:** Local state only
- **Separate Routing:** Not integrated with Next.js routes
- **Purpose:** UI design reference/prototype

**Differences from Main App:**
- Build system: Vite vs. Next.js
- Routing: SPA router vs. App Router
- Data: Mock vs. Supabase
- Auth: None vs. Supabase Auth
- Deployment: Not deployed vs. Vercel production

---

#### Option A: Integrated Module (Recommended)

### Description

Build upload functionality directly within `chunks-alpha/src/` as part of the main Next.js application.

**Implementation Approach:**
```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx        # Update: Add "Upload" button
│   │   └── upload/                   # NEW: Upload page
│   │       └── page.tsx              # Upload interface
│   └── api/
│       └── documents/
│           ├── upload/route.ts       # NEW: Upload endpoint
│           ├── process/route.ts      # NEW: Text extraction
│           └── status/route.ts       # NEW: Processing status
├── components/
│   └── upload/                       # NEW: Upload components
│       ├── upload-interface.tsx      # Drag-drop uploader
│       ├── upload-queue.tsx          # Processing queue
│       ├── upload-form.tsx           # Metadata form
│       └── document-status.tsx       # Status indicators
├── lib/
│   └── file-processing/              # NEW: Text extraction
│       ├── text-extractor.ts
│       └── document-processor.ts
└── hooks/
    └── use-document-status.ts        # NEW: Polling hook
```

**Integration Points:**
1. **Dashboard Integration:**
   - Add "Upload Document" button to dashboard header
   - Show recent uploads in document list immediately
   - Unified navigation and auth

2. **Workflow Integration:**
   - Upload → Processing → Ready for Categorization
   - Seamless transition: upload completes → start workflow
   - Single application state

3. **Component Reuse:**
   - Use existing UI components (Button, Card, Progress, Badge, etc.)
   - Leverage existing auth context
   - Share Supabase client and services
   - Consistent styling and theming

4. **Database Integration:**
   - Direct access to `documents` table
   - No API layer needed between apps
   - Transactional consistency

---

### Advantages ✅

#### 1. **Seamless User Experience** 🎯
- **Single Application:** Users never leave the main app
- **Unified Navigation:** Dashboard → Upload → Categorize → Chunks → Export
- **Consistent UI:** Same look, feel, and interaction patterns
- **No Context Switching:** All features in one place

**User Flow:**
```
Dashboard
  ↓ (Click "Upload Document")
/upload
  ↓ (Upload + metadata entry)
Processing Status (2-30 seconds)
  ↓ (Auto-redirect when ready)
/workflow/{documentId}/stage1
  ↓ (Continue categorization)
```

#### 2. **Massive Component Reuse** 📦
- **48 UI Components Already Available:** Button, Card, Dialog, Form, Progress, Badge, Alert, etc.
- **No Duplication:** Don't need to maintain two copies of Radix UI components
- **Consistent Styling:** Automatically matches application theme
- **Auth Components:** Use existing SignIn/SignOut flow
- **Layout Components:** Leverage existing page layouts

**Reusable Components:**
```typescript
// Can use directly without modification:
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { Dialog } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
// ... 39 more components ready to use
```

**Code Savings:** ~5,000 lines of component code don't need to be duplicated or maintained

#### 3. **Shared Authentication & Authorization** 🔐
- **Single Sign-On:** User authenticates once
- **Consistent Permissions:** Use existing auth context
- **User Profiles:** Access to full user data
- **Session Management:** Leverage existing auth flow

```typescript
// Upload component can use existing auth
import { useAuth } from '@/lib/auth-context'

function UploadPage() {
  const { user, profile } = useAuth()  // Already authenticated!
  
  // Upload documents associated with current user
  await uploadDocument(file, user.id)
}
```

**No Need For:**
- Separate auth flow
- Cross-domain cookie management
- Token passing between apps
- Duplicated auth logic

#### 4. **Direct Database Access** 💾
- **No API Layer:** Direct Supabase calls
- **Type Safety:** Shared TypeScript types
- **Transactional Consistency:** All operations in same database
- **Real-time Updates:** Supabase realtime subscriptions work

```typescript
// Upload service can directly use existing database service
import { documentService, fileService } from '@/lib/database'

// Create document record immediately
const document = await documentService.create({
  title: file.name,
  author_id: user.id,
  status: 'processing'
})

// Upload to Supabase Storage
await fileService.uploadDocument(file, user.id)
```

**Benefits:**
- No REST API needed between modules
- No data synchronization issues
- No latency from API calls
- Simpler error handling

#### 5. **Single Deployment Pipeline** 🚀
- **One Vercel Project:** Single deployment, single domain
- **Unified CI/CD:** One build, one test suite, one deploy
- **No CORS Issues:** All routes under same domain
- **Easier Rollbacks:** Single version to manage
- **Lower Infrastructure Cost:** One hosting plan

**Deployment:**
```bash
# Single command deploys everything
npm run build
vercel deploy

# Result: https://your-app.vercel.app
# - /dashboard
# - /upload        (NEW)
# - /workflow/...
# - /chunks/...
```

**vs. Standalone Approach:**
```bash
# Would need two separate deployments
cd src && npm run build && vercel deploy
cd doc-module && npm run build && vercel deploy

# Result: 
# - https://main-app.vercel.app
# - https://upload-module.vercel.app  (separate domain)
# - Need to configure CORS
# - Need to share auth tokens
# - Need API layer for data sync
```

#### 6. **Simplified Maintenance** 🛠️
- **One Codebase:** Single repository, single package.json
- **Unified Dependencies:** Update libraries once
- **Consistent Versioning:** No version skew between modules
- **Single Test Suite:** Test all features together
- **Easier Refactoring:** Change shared code in one place

**Dependency Management:**
```json
// Single package.json with one set of versions
{
  "dependencies": {
    "next": "14.2.33",
    "@radix-ui/react-dialog": "1.1.2",
    "@supabase/supabase-js": "2.46.1"
    // ... all dependencies in one place
  }
}
```

**vs. Standalone:**
```json
// Would need to keep two package.json files in sync
src/package.json:     "next": "14.2.33"
doc-module/package.json: "vite": "6.3.5" (different build system!)
```

#### 7. **Better Developer Experience** 👨‍💻
- **Single Dev Server:** `npm run dev` starts everything
- **Hot Reload:** Changes reflect immediately
- **Unified Debugging:** One browser, one dev tools session
- **Consistent Patterns:** Same coding style throughout
- **Easier Onboarding:** New developers learn one architecture

**Development Workflow:**
```bash
# Start everything with one command
npm run dev

# Access at http://localhost:3000
# - /dashboard
# - /upload
# - /workflow/...
# All features available immediately
```

#### 8. **Natural Workflow Integration** 🔄
Upload is **part of the workflow**, not a separate tool:

```
Current Workflow:
  [Dashboard] → [Select Document] → [Categorize] → [Chunks] → [Dimensions]
  
With Integrated Upload:
  [Dashboard] → [Upload] → [Categorize] → [Chunks] → [Dimensions]
                    ↓
            [Processing Status]
                    ↓
        [Ready - Start Workflow]
```

**Seamless Experience:**
- User uploads document
- Status updates show in same UI
- When ready, "Start Categorization" button appears
- Clicks → goes to workflow
- **No app switching, no data export/import**

#### 9. **State Management Simplification** 📊
- **Single Zustand Store:** Can extend existing workflow store
- **Shared Context:** Auth, theme, user preferences
- **No Cross-App Communication:** All state in one app
- **Persistent State:** Local storage works across all features

```typescript
// Can extend existing workflow store
export const useWorkflowStore = create<WorkflowState>()((set, get) => ({
  // Existing workflow state
  currentDocument: null,
  belongingRating: null,
  
  // NEW: Add upload state
  uploadQueue: [],
  uploadProgress: {},
  
  // Unified actions
  setCurrentDocument: (doc) => set({ currentDocument: doc }),
  addToUploadQueue: (file) => set((state) => ({ 
    uploadQueue: [...state.uploadQueue, file] 
  })),
}))
```

#### 10. **Lower Complexity** 🧩
**Integrated Approach:**
- 1 application architecture
- 1 routing system
- 1 authentication flow
- 1 deployment target
- 1 monitoring setup

**Complexity Score:** **LOW**

---

### Disadvantages ⚠️

#### 1. **Larger Main Application Bundle**
- Adding upload increases main app bundle size
- **Mitigation:** Next.js code splitting automatically handles this
- Upload route only loads when accessed
- Estimated increase: ~100KB gzipped

**Impact:** MINIMAL - Next.js lazy loads routes

#### 2. **Coupled Development**
- Upload changes might affect other features
- **Mitigation:** Modular structure with clear boundaries
- Upload components in separate directory
- Use TypeScript for type safety

**Impact:** LOW - Good architecture practices mitigate this

#### 3. **Testing Complexity**
- More features to test in single app
- **Mitigation:** Organize tests by feature
- Upload tests isolated in `__tests__/upload/`
- Integration tests validate workflow

**Impact:** LOW - Standard testing practices handle this

---

### Implementation Roadmap

**Phase 1: Core Upload (Week 1)**
```
src/
├── app/
│   ├── (dashboard)/
│   │   └── upload/
│   │       └── page.tsx              # Main upload page
│   └── api/
│       └── documents/
│           ├── upload/route.ts       # Upload endpoint
│           └── status/route.ts       # Status polling
├── components/
│   └── upload/
│       ├── upload-dropzone.tsx       # Drag-drop UI
│       └── upload-status.tsx         # Status badges
└── hooks/
    └── use-document-status.ts        # Status polling
```

**Phase 2: Text Extraction (Week 1)**
```
src/
├── app/
│   └── api/
│       └── documents/
│           └── process/route.ts      # Text extraction
└── lib/
    └── file-processing/
        ├── text-extractor.ts         # PDF/DOCX parsing
        └── document-processor.ts     # Orchestration
```

**Phase 3: Metadata & Queue (Week 2)**
```
src/
└── components/
    └── upload/
        ├── metadata-form.tsx         # Doc metadata input
        ├── upload-queue.tsx          # Batch management
        └── processing-stats.tsx      # Stats dashboard
```

**Phase 4: Integration (Week 2)**
```
src/
├── app/
│   └── (dashboard)/
│       └── dashboard/
│           └── page.tsx              # Add upload button
└── components/
    └── upload/
        └── upload-workflow-bridge.tsx # Workflow integration
```

**Total Timeline:** 2 weeks

---

### Code Example: Dashboard Integration

**Before (Current):**
```typescript
// src/app/(dashboard)/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div>
      <h1>Document Categorization</h1>
      <DocumentSelectorServer />
    </div>
  )
}
```

**After (Integrated Upload):**
```typescript
// src/app/(dashboard)/dashboard/page.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1>Document Categorization</h1>
        
        {/* NEW: Upload button */}
        <Link href="/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Documents
          </Button>
        </Link>
      </div>
      
      <DocumentSelectorServer />
    </div>
  )
}
```

**New Upload Page:**
```typescript
// src/app/(dashboard)/upload/page.tsx
'use client'

import { UploadDropzone } from '@/components/upload/upload-dropzone'
import { UploadQueue } from '@/components/upload/upload-queue'
import { useAuth } from '@/lib/auth-context'

export default function UploadPage() {
  const { user } = useAuth()
  
  return (
    <div className="container mx-auto py-8">
      <h1>Upload Documents</h1>
      <UploadDropzone userId={user.id} />
      <UploadQueue />
    </div>
  )
}
```

**Result:** 
- Single click from dashboard to upload
- User stays in same application
- Same navigation, auth, styling
- Seamless experience

---

### Security & Authorization

**Integrated Approach Benefits:**
```typescript
// Upload components automatically inherit auth
import { useAuth } from '@/lib/auth-context'

function UploadPage() {
  const { user, isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    redirect('/signin')  // Automatic redirect
  }
  
  // User guaranteed to be authenticated here
  // Can directly associate uploads with user.id
  await uploadDocument(file, user.id)
}
```

**Authorization Rules:**
- Only authenticated users can upload
- Documents automatically tagged with uploader's user_id
- RLS policies in Supabase enforce access control
- No token passing or API authentication needed

---

### Performance Characteristics

**Bundle Size:**
- **Main App (Current):** ~850KB (gzipped)
- **Upload Module Added:** +100KB (gzipped)
- **Total:** ~950KB (gzipped)

**Load Times:**
- **Dashboard (Current):** ~800ms initial load
- **Upload Page:** ~200ms (lazy loaded route)
- **No Performance Impact:** Other pages unaffected due to code splitting

**Comparison:**
```
Integrated:
  Dashboard:     800ms    (unchanged)
  Upload:        200ms    (lazy loaded)
  Total:         1000ms   (first upload visit)

Standalone:
  Dashboard:     800ms    
  Upload App:    600ms    (separate app load)
  Total:         1400ms   (switching to upload app)
  + CORS delay:  +50ms
  + Auth check:  +100ms
  = 1550ms total
```

**Winner:** Integrated (35% faster)

---

## Option B: Standalone Module ❌ NOT RECOMMENDED

### Description

Build upload as a separate application (similar to `doc-module/`) with independent deployment and codebase.

**Implementation Approach:**
```
Project Structure:

chunks-alpha/
├── src/                    # Main application (existing)
│   └── ...
└── upload-module/          # NEW: Separate app
    ├── src/
    │   ├── components/
    │   │   └── ui/         # DUPLICATE 48 components
    │   ├── pages/
    │   └── lib/
    ├── package.json        # Separate dependencies
    ├── vite.config.ts      # Different build system
    └── vercel.json         # Separate deployment

Deployment:
- Main App:    https://app.example.com
- Upload App:  https://upload.example.com
```

**Integration Method:**
- Separate domains or subdomains
- API layer for data synchronization
- Shared authentication tokens
- Cross-origin requests (CORS)

---

### Disadvantages ❌

#### 1. **Poor User Experience** 🚨
- **Context Switching:** Users must navigate between two applications
- **Separate URLs:** Different domains/subdomains confuse users
- **Duplicate Login:** Might need to authenticate twice
- **Inconsistent UI:** Hard to maintain identical styling
- **Lost State:** Navigation state lost between apps

**User Journey:**
```
1. User in Main App at app.example.com/dashboard
2. Clicks "Upload" → Redirects to upload.example.com
3. Might need to log in again (token issues)
4. Upload documents
5. After upload → Must manually go back to app.example.com
6. Lost context: Which step was I on?
```

**vs. Integrated:**
```
1. User in Main App at app.example.com/dashboard
2. Clicks "Upload" → Navigates to app.example.com/upload
3. Already authenticated
4. Upload documents
5. Click "Start Workflow" → app.example.com/workflow/{id}
6. Seamless continuation
```

#### 2. **Massive Code Duplication** 📦
- **48 UI Components Duplicated:** Must maintain two copies of every Radix UI component
- **Styling Duplication:** Tailwind config, theme, CSS duplicated
- **Type Definitions:** TypeScript types duplicated
- **Utility Functions:** Helper functions duplicated
- **Auth Logic:** Authentication code duplicated

**Duplicated Code:**
```
Main App (src/):
  components/ui/button.tsx
  components/ui/card.tsx
  components/ui/dialog.tsx
  ... 45 more components
  
Upload App (upload-module/):
  components/ui/button.tsx     (DUPLICATE)
  components/ui/card.tsx       (DUPLICATE)
  components/ui/dialog.tsx     (DUPLICATE)
  ... 45 more components       (ALL DUPLICATES)
```

**Maintenance Nightmare:**
- Update button style? Update in TWO places
- Fix dialog bug? Fix in TWO places
- New Radix UI version? Upgrade TWO apps
- Theme change? Update TWO configs

**Estimated Duplicate Code:** ~5,000 lines

#### 3. **Complex Authentication** 🔐
- **Token Sharing:** Must pass auth tokens between applications
- **Cookie Domain Issues:** Cookies don't work across subdomains by default
- **Session Management:** Two apps with separate session states
- **Logout Synchronization:** User logs out of one app, still logged into other
- **Security Risks:** Token passing increases attack surface

**Technical Challenges:**
```typescript
// Upload app needs to verify token from main app
async function verifyAuthToken(token: string) {
  // Call main app's API to validate token
  const response = await fetch('https://app.example.com/api/auth/verify', {
    headers: { Authorization: `Bearer ${token}` }
  })
  
  // Handle expired tokens
  // Handle refresh token flow
  // Handle CORS preflight
  // Handle different security policies
}
```

**Additional Work:**
- Implement OAuth flow between apps
- Set up shared session storage (Redis?)
- Configure CORS for auth endpoints
- Handle token refresh across apps
- Implement logout propagation

**Security Concerns:**
- Tokens exposed in URL parameters (if using redirect-based auth)
- CSRF attacks across domains
- XSS vulnerabilities in token handling

#### 4. **API Layer Overhead** 🔌
Since upload app can't directly access main app's database, need API layer:

**Required API Endpoints:**
```
Main App must expose:
- POST /api/integration/documents    (Create document)
- GET  /api/integration/documents    (List documents)
- PUT  /api/integration/documents/:id (Update document)
- POST /api/integration/upload       (Upload file)
- GET  /api/integration/user         (Get user profile)
- POST /api/integration/auth/verify  (Verify token)
```

**Upload App must implement:**
```typescript
// Every database operation becomes an API call
async function uploadDocument(file: File) {
  // 1. Upload file to main app
  const formData = new FormData()
  formData.append('file', file)
  
  const uploadResponse = await fetch('https://app.example.com/api/integration/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  })
  
  // 2. Create document record in main app
  const docResponse = await fetch('https://app.example.com/api/integration/documents', {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: file.name,
      file_path: uploadResponse.path
    })
  })
  
  // 3. Handle errors from either call
  // 4. Retry logic for failed requests
  // 5. Handle race conditions
}
```

**Problems:**
- **Latency:** Every operation requires network round-trip
- **Complexity:** API versioning, error handling, retries
- **Data Consistency:** Race conditions, transaction handling across apps
- **Development Overhead:** Mock API for testing, API documentation

**vs. Integrated:**
```typescript
// Direct database access
async function uploadDocument(file: File) {
  await documentService.create({
    title: file.name,
    file_path: await fileService.upload(file)
  })
}
// Simple, fast, transactional
```

#### 5. **Deployment Complexity** 🚀
- **Two Vercel Projects:** Separate deployments, separate configs
- **Two Domains:** DNS setup, SSL certificates
- **CORS Configuration:** Allow cross-origin requests
- **Synchronized Deployments:** Both apps must be compatible
- **Double Monitoring:** Two apps to monitor for errors
- **Double Costs:** Two hosting plans

**Deployment Process:**
```bash
# Deploy main app
cd src
npm run build
vercel deploy --prod
# Configure: app.example.com

# Deploy upload app
cd ../upload-module
npm run build  
vercel deploy --prod
# Configure: upload.example.com

# Configure CORS
# - Main app must allow requests from upload.example.com
# - Upload app must allow requests from app.example.com

# Configure DNS
# - A record for app.example.com
# - A record for upload.example.com
# - SSL certificates for both

# Configure Environment Variables (in TWO places):
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - MAIN_APP_API_URL (in upload app)
# - UPLOAD_APP_URL (in main app)
```

**Rollback Complexity:**
- If main app breaks, upload app might also break
- If upload app breaks, might not be obvious until user tries to upload
- Version compatibility issues between apps

#### 6. **Development Friction** 👨‍💻
- **Two Dev Servers:** `npm run dev` in two terminals
- **Port Management:** Avoid port conflicts (3000, 3001)
- **Separate Hot Reload:** Changes in shared logic require manual refresh
- **Testing Nightmare:** E2E tests must run both apps
- **Debugging Complexity:** Debug sessions across two apps

**Daily Developer Experience:**
```bash
# Terminal 1: Start main app
cd src
npm run dev
# Running on http://localhost:3000

# Terminal 2: Start upload app
cd upload-module
npm run dev
# Running on http://localhost:3001

# Terminal 3: Watch for changes
# (Must manually keep dependencies in sync)

# Testing requires both apps running
# Browser needs both tabs open
# Dev tools needs to switch between tabs
```

#### 7. **Dependency Management Hell** 📚
- **Two package.json Files:** Different versions, different dependencies
- **Version Drift:** Main app upgrades React, upload app stays behind
- **Breaking Changes:** Upgrade Radix UI in one app, breaks UI consistency
- **NPM Audit:** Security vulnerabilities in two places
- **Bundle Size:** No shared dependencies between apps

**Example Problem:**
```json
// Main app (src/package.json)
{
  "dependencies": {
    "react": "^18.3.0",
    "@radix-ui/react-dialog": "^1.1.2"
  }
}

// Upload app (upload-module/package.json)
{
  "dependencies": {
    "react": "^18.2.0",           // ⚠️ Different version!
    "@radix-ui/react-dialog": "^1.0.5"  // ⚠️ Old version!
  }
}

// Result:
// - UI looks different between apps
// - Bugs in old version of Radix UI
// - Must update both manually
```

#### 8. **State Synchronization Issues** 📊
- **Separate State:** Upload app state vs. Main app state
- **No Shared Context:** Can't share Zustand stores
- **Manual Sync:** Must implement data synchronization
- **Race Conditions:** User uploads in one app, main app doesn't know yet
- **Stale Data:** Refresh needed to see updates

**Synchronization Challenges:**
```typescript
// Upload app: User uploads document
await uploadDocument(file)

// How does main app know?
// Option 1: WebSocket connection (complex)
// Option 2: Polling (inefficient)
// Option 3: Manual refresh (bad UX)
// Option 4: Event bus (more infrastructure)

// vs. Integrated:
const { addDocument } = useWorkflowStore()
await uploadDocument(file)
addDocument(document)  // State updated immediately
```

#### 9. **Testing Complexity** 🧪
- **Integration Tests:** Must start both apps
- **E2E Tests:** Navigate between apps, handle auth
- **API Mocking:** Mock main app API in upload app tests
- **Data Fixtures:** Maintain test data in two places
- **CI/CD:** Two test suites, double the time

**Test Setup:**
```typescript
// Integration test for upload flow
describe('Upload Flow', () => {
  beforeAll(async () => {
    // Start main app on port 3000
    mainApp = await startMainApp(3000)
    
    // Start upload app on port 3001
    uploadApp = await startUploadApp(3001)
    
    // Configure API mocking
    mockServer = setupMockServer()
    
    // Configure CORS for testing
    configureCORS()
  })
  
  it('uploads document and shows in main app', async () => {
    // 1. Navigate to upload app
    await page.goto('http://localhost:3001')
    
    // 2. Upload file
    await uploadFile('test.pdf')
    
    // 3. Navigate back to main app
    await page.goto('http://localhost:3000/dashboard')
    
    // 4. Wait for synchronization
    await page.waitForTimeout(5000)  // Hope it's synced?
    
    // 5. Verify document appears
    expect(page.locator('[data-testid="document-test.pdf"]')).toBeVisible()
  })
})
```

**vs. Integrated:**
```typescript
describe('Upload Flow', () => {
  it('uploads document and shows in dashboard', async () => {
    await page.goto('/upload')
    await uploadFile('test.pdf')
    await page.click('button:has-text("View in Dashboard")')
    
    // Same app, instant state update
    expect(page.locator('[data-testid="document-test.pdf"]')).toBeVisible()
  })
})
```

#### 10. **Higher Costs** 💰
- **Two Vercel Projects:** Double the hosting costs
- **Two Domains:** Domain registration and renewal
- **More Bandwidth:** Cross-app API calls use bandwidth
- **More Function Invocations:** API layer adds function calls
- **More Maintenance Time:** Developer time spent managing two apps

**Cost Breakdown:**
```
Integrated Approach:
  Vercel Pro:         $20/month  (single project)
  Domain:             $12/year   (app.example.com)
  Total Monthly:      ~$21/month

Standalone Approach:
  Vercel Pro (Main):  $20/month
  Vercel Pro (Upload):$20/month
  Domains:            $24/year   (app + upload subdomains)
  Total Monthly:      ~$42/month
  
Extra Cost:           $21/month = $252/year
```

**Plus Hidden Costs:**
- Developer time maintaining two codebases: +20% dev time
- More complex debugging: +30% bug fix time
- Double deployment time: +15 minutes per deploy
- More infrastructure issues: +10% support time

#### 11. **Workflow Disruption** 🔄
Upload becomes a **separate tool** rather than part of the workflow:

```
Standalone Approach:
  [Main App: Dashboard] 
        ↓
  [Switch to Upload App] ❌ Context switch
        ↓
  [Upload Documents]
        ↓
  [Switch back to Main App] ❌ Context switch
        ↓
  [Find uploaded documents] ❌ May not be synced yet
        ↓
  [Start Categorization]

vs. Integrated Approach:
  [Dashboard] → [Upload] → [Categorize]
  ✅ Natural flow, no context switching
```

**User Experience:**
- Confusing: "Why am I leaving the main app?"
- Slower: Extra navigation and loading time
- Frustrating: Lost context between apps
- Error-prone: Easy to forget to go back

---

### When Standalone Might Make Sense

Despite all disadvantages, standalone could be considered if:

1. **Upload is a Separate Product:**
   - Monetized separately
   - Different target users (e.g., admin tool)
   - Different branding and identity

2. **Technical Requirements Diverge:**
   - Upload needs different tech stack (e.g., Python backend for ML)
   - Requires libraries incompatible with main app
   - Different performance requirements (e.g., ultra-low latency)

3. **Team Organization:**
   - Separate teams own upload vs. main app
   - Different release cycles required
   - Political/organizational boundaries

4. **Scaling Needs:**
   - Upload has 100x more traffic than main app
   - Needs independent scaling strategy
   - Different infrastructure requirements

**None of these apply to our use case.**

---

## Decision Summary

### ✅ DECISION: Build Upload as Integrated Module (Option A)

**Rationale:**

#### 1. **Workflow Integration is Critical**
Upload is not a standalone tool—it's the **first step in the document processing workflow**:
```
Upload → Categorize → Extract Chunks → Generate Dimensions → Export Training Data
```

Users need a **seamless flow**, not context switching between applications.

#### 2. **Massive Code Reuse**
- **48 UI components already exist** and ready to use
- **Authentication system** already built
- **Database services** already implemented
- **Styling and theming** already configured
- Estimated **~5,000 lines of code** don't need duplication

#### 3. **Superior User Experience**
- Single application, unified navigation
- No context switching or separate logins
- Consistent UI and interaction patterns
- Faster performance (no cross-app calls)
- Better mobile experience

#### 4. **Lower Complexity**
- One codebase to maintain
- One deployment pipeline
- One set of dependencies
- One test suite
- One monitoring system

#### 5. **Faster Development**
- Leverage existing components and patterns
- No API layer needed
- No auth token passing
- No CORS configuration
- Estimated **2 weeks** vs. 4-6 weeks for standalone

#### 6. **Cost Effective**
- Single Vercel project
- No duplicate infrastructure
- Lower maintenance burden
- **~$252/year savings** in hosting alone
- **20-30% less development time**

---

### Implementation Plan

**Week 1: Core Upload + Text Extraction**
- Create `/upload` page route
- Build upload dropzone component
- Implement file upload endpoint
- Add text extraction service
- Implement status polling

**Week 2: Integration + Metadata**
- Add metadata form
- Integrate with dashboard
- Add processing queue UI
- Connect to workflow
- Testing and refinement

**Total: 2 weeks for production-ready integrated upload module**

---

### Success Metrics

After implementation, we should measure:

**User Experience:**
- Time from upload to categorization start: < 60 seconds
- User confusion rate: < 5% (vs. expected 20-30% with standalone)
- Navigation abandonment: < 2%

**Technical Performance:**
- Page load time: < 1 second
- Upload success rate: > 98%
- Processing completion: 95% within 30 seconds
- Zero CORS errors
- Zero auth token issues

**Development Metrics:**
- Code duplication: 0 lines
- Deployment time: < 5 minutes
- Bug fix time: Similar to other features
- Maintenance burden: +10% (vs. +40% standalone)

---

### Migration Path (If Ever Needed)

If we ever need to extract upload into standalone module later:

**Step 1:** Encapsulate upload code in dedicated directory
```
src/
└── modules/
    └── upload/
        ├── components/
        ├── pages/
        ├── api/
        └── lib/
```

**Step 2:** Create clean API boundaries
```typescript
// Public API for upload module
export { useUpload, UploadPage, uploadDocument }
```

**Step 3:** If needed, extract later
- Copy `modules/upload/` to new repository
- Add API layer for communication
- Set up separate deployment
- Configure auth token sharing

**Effort:** ~1 week of refactoring

**Likelihood:** Very low (< 5% chance needed)

---

### Rejected Alternative: Hybrid Approach

**Considered:** Build upload as separate npm package, import into main app

```
Approach:
  @company/upload-module (npm package)
      ↓
  Import into chunks-alpha/src

Benefits:
  - Modular code
  - Could theoretically reuse in other projects

Problems:
  - Added complexity of npm package management
  - Still need to duplicate UI components or add peer dependencies
  - Versioning headaches
  - Overkill for single application
```

**Decision:** Rejected - Adds complexity without meaningful benefits for our use case.

---

## Appendix: File Structure Comparison

### Integrated Approach (Chosen)

```
chunks-alpha/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx           # Existing
│   │   │   └── upload/                # NEW
│   │   │       └── page.tsx           # Upload interface
│   │   ├── (workflow)/                # Existing
│   │   │   └── workflow/
│   │   │       └── [documentId]/
│   │   │           ├── stage1/
│   │   │           ├── stage2/
│   │   │           └── stage3/
│   │   └── api/
│   │       └── documents/
│   │           ├── route.ts           # Existing
│   │           ├── upload/            # NEW
│   │           │   └── route.ts
│   │           ├── process/           # NEW
│   │           │   └── route.ts
│   │           └── status/            # NEW
│   │               └── route.ts
│   ├── components/
│   │   ├── ui/                        # 48 existing components
│   │   └── upload/                    # NEW
│   │       ├── upload-dropzone.tsx
│   │       ├── upload-queue.tsx
│   │       ├── upload-status.tsx
│   │       └── metadata-form.tsx
│   ├── lib/
│   │   ├── database.ts                # Existing
│   │   ├── supabase.ts                # Existing
│   │   └── file-processing/           # NEW
│   │       ├── text-extractor.ts
│   │       └── document-processor.ts
│   └── hooks/
│       └── use-document-status.ts     # NEW
└── package.json                       # ONE file

Files Added: ~15 files
Lines of Code: ~2,000 new lines
Dependencies Added: 3 (pdf-parse, mammoth, html-to-text)
```

### Standalone Approach (Rejected)

```
chunks-alpha/
├── src/                               # Main app (existing)
│   └── ... (existing structure)
├── upload-module/                     # NEW: Separate app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.tsx              # Upload interface
│   │   │   └── queue.tsx              # Queue management
│   │   ├── components/
│   │   │   ├── ui/                    # DUPLICATE 48 components
│   │   │   │   ├── button.tsx         # Same as main app
│   │   │   │   ├── card.tsx           # Same as main app
│   │   │   │   └── ... (46 more)     # All duplicated
│   │   │   └── upload/
│   │   │       ├── dropzone.tsx
│   │   │       ├── queue.tsx
│   │   │       └── status.tsx
│   │   ├── lib/
│   │   │   ├── api-client.ts          # NEW: Call main app API
│   │   │   ├── auth.ts                # NEW: Token management
│   │   │   └── supabase.ts            # DUPLICATE
│   │   └── hooks/
│   │       └── use-auth.ts            # DUPLICATE
│   ├── package.json                   # SEPARATE dependencies
│   ├── vite.config.ts
│   └── vercel.json                    # SEPARATE deployment
└── shared/                            # NEW: Shared types?
    └── types/
        └── document.ts

Main App API Extensions:
├── src/
│   └── app/
│       └── api/
│           └── integration/           # NEW: API for upload app
│               ├── documents/
│               ├── upload/
│               ├── auth/
│               └── user/

Files Added: ~70 files (including duplicates)
Lines of Code: ~7,000 lines (including duplicates)
Dependencies: Duplicated + different build tools
```

**Comparison:**
- **Integrated:** 15 new files, ~2,000 lines
- **Standalone:** 70 new files, ~7,000 lines (5,000 duplicated)
- **Maintenance Burden:** 3.5x higher for standalone

---

## Conclusion

**Building the document upload module as an integrated feature within the main Next.js application** is the clear winner. This approach:

✅ Delivers superior user experience through seamless workflow integration
✅ Maximizes code reuse (48 components, auth, database services)
✅ Minimizes complexity (single codebase, deployment, auth flow)
✅ Accelerates development (2 weeks vs. 4-6 weeks)
✅ Reduces costs ($252/year savings + 20-30% less dev time)
✅ Simplifies maintenance (one codebase, one test suite)

The standalone approach would only make sense for a fundamentally different product with separate users, branding, or technical requirements—none of which apply here. Upload is an integral part of the document processing workflow and should be treated as such architecturally.

**Next Steps:**
1. Create upload page route at `/upload`
2. Build upload components using existing UI library
3. Implement text extraction service
4. Add status polling endpoint
5. Integrate with dashboard navigation
6. Test end-to-end workflow

---

**End of Decision #2**

**Next Decision:** [Decision #3: TBD - To be determined based on specification writing process](#decision-3)


