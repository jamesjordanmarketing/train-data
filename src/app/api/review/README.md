# Review Queue API Documentation

Complete API documentation for the Review Queue system, which manages conversation review workflows, quality feedback, and approval processes.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [GET /api/review/queue](#get-apireviewqueue)
  - [POST /api/review/actions](#post-apireviewactions)
  - [GET /api/review/feedback](#get-apireviewfeedback)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)

---

## Overview

The Review Queue API provides three main capabilities:

1. **Queue Management** - Fetch and filter conversations awaiting review
2. **Review Actions** - Submit approval, rejection, or revision requests
3. **Quality Feedback** - Analyze template performance and identify issues

All endpoints require authentication via Supabase Auth.

---

## Authentication

All endpoints require a valid Supabase authentication token passed via cookies. The API uses `createServerSupabaseClientWithAuth()` to validate user sessions.

**Authentication Flow:**
1. User logs in via Supabase Auth
2. Session cookies are automatically set
3. API routes validate the session on each request

**Error Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized",
  "details": "Authentication required"
}
```

---

## Endpoints

### GET /api/review/queue

Fetch paginated list of conversations with status `pending_review`.

**URL:** `/api/review/queue`  
**Method:** `GET`  
**Auth Required:** Yes

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (must be >= 1) |
| `limit` | number | No | 25 | Items per page (1-100) |
| `sortBy` | string | No | quality_score | Sort field: `quality_score` or `created_at` |
| `sortOrder` | string | No | asc | Sort direction: `asc` or `desc` |
| `minQuality` | number | No | - | Minimum quality score (0-10) |

#### Response (200 OK)

```json
{
  "data": [
    {
      "id": "conv_123",
      "conversation_id": "conv_123",
      "title": "Technical Support Conversation",
      "status": "pending_review",
      "tier": "template",
      "category": ["support"],
      "quality_score": 7.5,
      "quality_metrics": {
        "overall": 7.5,
        "relevance": 8.0,
        "accuracy": 7.0,
        "naturalness": 8.5,
        "methodology": 7.0,
        "coherence": 8.0,
        "confidence": "high",
        "uniqueness": 7.5,
        "trainingValue": "high"
      },
      "total_turns": 10,
      "total_tokens": 1500,
      "parent_id": "template_456",
      "parent_type": "template",
      "review_history": [],
      "parameters": {},
      "created_at": "2025-10-28T10:00:00Z",
      "updated_at": "2025-10-28T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 150,
    "pages": 6
  },
  "statistics": {
    "totalPending": 150,
    "averageQuality": 7.2,
    "oldestPendingDate": "2025-10-15T08:30:00Z"
  }
}
```

#### Example Request

```bash
curl -X GET "https://yourdomain.com/api/review/queue?page=1&limit=25&sortBy=quality_score&sortOrder=asc&minQuality=6" \
  -H "Cookie: sb-access-token=YOUR_TOKEN"
```

#### Error Responses

**400 Bad Request:**
```json
{
  "error": "Invalid parameter",
  "details": "Page must be >= 1"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to fetch review queue",
  "details": "Database connection error"
}
```

---

### POST /api/review/actions

Submit a review action for a conversation (approve, reject, request changes).

**URL:** `/api/review/actions`  
**Method:** `POST`  
**Auth Required:** Yes

#### Request Body

```json
{
  "conversationId": "conv_123",
  "action": "approved",
  "comment": "High quality conversation, meets all requirements",
  "reasons": ["high_quality", "meets_requirements"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `conversationId` | string | Yes | ID of the conversation to review |
| `action` | string | Yes | Review action: `approved`, `rejected`, or `revision_requested` |
| `comment` | string | No | Reviewer's comment |
| `reasons` | string[] | No | Array of reason codes |

#### Response (200 OK)

```json
{
  "success": true,
  "conversation": {
    "id": "conv_123",
    "conversation_id": "conv_123",
    "title": "Technical Support Conversation",
    "status": "approved",
    "tier": "template",
    "category": ["support"],
    "quality_score": 7.5,
    "review_history": [
      {
        "id": "review_789",
        "action": "approved",
        "performedBy": "user_456",
        "timestamp": "2025-10-31T12:00:00Z",
        "comment": "High quality conversation, meets all requirements",
        "reasons": ["high_quality", "meets_requirements"]
      }
    ],
    "approved_by": "user_456",
    "approved_at": "2025-10-31T12:00:00Z",
    "reviewer_notes": "High quality conversation, meets all requirements",
    "created_at": "2025-10-28T10:00:00Z",
    "updated_at": "2025-10-31T12:00:00Z"
  },
  "message": "Conversation approved successfully"
}
```

#### Status Mapping

The `action` field determines the new conversation status:

| Action | New Status | Description |
|--------|------------|-------------|
| `approved` | `approved` | Conversation approved for training |
| `rejected` | `rejected` | Conversation rejected |
| `revision_requested` | `needs_revision` | Changes requested |

#### Example Request

```bash
curl -X POST "https://yourdomain.com/api/review/actions" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -d '{
    "conversationId": "conv_123",
    "action": "approved",
    "comment": "High quality conversation",
    "reasons": ["high_quality"]
  }'
```

#### Error Responses

**400 Bad Request:**
```json
{
  "error": "Validation error",
  "details": "Invalid action. Must be one of: approved, rejected, revision_requested"
}
```

**404 Not Found:**
```json
{
  "error": "Conversation not found",
  "details": "Conversation with ID conv_123 not found"
}
```

**409 Conflict:**
```json
{
  "error": "Invalid conversation state",
  "details": "Conversation status 'approved' is not eligible for review"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to submit review action",
  "details": "Failed to append review action: Database error"
}
```

---

### GET /api/review/feedback

Get aggregated template performance metrics including approval rates and quality scores.

**URL:** `/api/review/feedback`  
**Method:** `GET`  
**Auth Required:** Yes

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `timeWindow` | string | No | 30d | Time period: `7d`, `30d`, or `all` |
| `minUsageCount` | number | No | 5 | Minimum conversations per template |

#### Response (200 OK)

```json
{
  "templates": [
    {
      "template_id": "template_123",
      "template_name": "Technical Support Template",
      "tier": "template",
      "usage_count": 45,
      "avg_quality": 7.8,
      "approved_count": 38,
      "rejected_count": 7,
      "approval_rate": 84.4,
      "performance": "high"
    },
    {
      "template_id": "template_456",
      "template_name": "Sales Inquiry Template",
      "tier": "template",
      "usage_count": 30,
      "avg_quality": 5.2,
      "approved_count": 18,
      "rejected_count": 12,
      "approval_rate": 60.0,
      "performance": "low"
    }
  ],
  "overall_stats": {
    "total_templates": 15,
    "low_performing_count": 3,
    "avg_approval_rate": 78.5
  },
  "metadata": {
    "timeWindow": "30d",
    "minUsageCount": 5,
    "generatedAt": "2025-10-31T12:00:00Z"
  }
}
```

#### Performance Classification

| Level | Criteria |
|-------|----------|
| `high` | Approval rate >= 85% AND avg quality >= 8.0 |
| `low` | Approval rate < 70% OR avg quality < 6.0 |
| `medium` | Everything else |

#### Example Request

```bash
curl -X GET "https://yourdomain.com/api/review/feedback?timeWindow=30d&minUsageCount=10" \
  -H "Cookie: sb-access-token=YOUR_TOKEN"
```

#### Error Responses

**400 Bad Request:**
```json
{
  "error": "Invalid parameter",
  "details": "timeWindow must be one of: 7d, 30d, all"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to aggregate feedback",
  "details": "Database aggregation error"
}
```

---

## Data Models

### ConversationRecord

```typescript
interface ConversationRecord {
  id: string;
  conversation_id: string;
  title: string;
  status: ConversationStatus;
  tier: TierType;
  category: string[];
  quality_score?: number;
  quality_metrics?: QualityMetrics;
  total_turns: number;
  total_tokens: number;
  parent_id?: string;
  parent_type?: string;
  review_history?: ReviewAction[];
  parameters: Record<string, any>;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
  reviewer_notes?: string;
}
```

### ReviewAction

```typescript
interface ReviewAction {
  id: string;
  action: 'approved' | 'rejected' | 'revision_requested' | 'generated' | 'moved_to_review';
  performedBy: string;
  timestamp: string;
  comment?: string;
  reasons?: string[];
}
```

### TemplateFeedback

```typescript
interface TemplateFeedback {
  template_id: string;
  template_name: string;
  tier: TierType;
  usage_count: number;
  avg_quality: number;
  approved_count: number;
  rejected_count: number;
  approval_rate: number;
  performance: 'high' | 'medium' | 'low';
}
```

---

## Error Handling

All endpoints follow consistent error response format:

```typescript
interface ApiErrorResponse {
  error: string;        // Short error category
  details?: string;     // Detailed error message
  code?: string;        // Error code (optional)
}
```

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful request |
| 400 | Bad Request | Invalid parameters or request body |
| 401 | Unauthorized | Missing or invalid authentication |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Invalid state for operation |
| 500 | Internal Server Error | Server-side error |

---

## Usage Examples

### TypeScript/JavaScript

```typescript
// Fetch review queue
async function fetchReviewQueue(page = 1, limit = 25) {
  const response = await fetch(
    `/api/review/queue?page=${page}&limit=${limit}&sortBy=quality_score&sortOrder=asc`,
    {
      credentials: 'include', // Include cookies
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error);
  }
  
  return await response.json();
}

// Submit review action
async function approveConversation(conversationId: string, comment: string) {
  const response = await fetch('/api/review/actions', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversationId,
      action: 'approved',
      comment,
      reasons: ['high_quality', 'meets_requirements'],
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error);
  }
  
  return await response.json();
}

// Get template feedback
async function getTemplateFeedback(timeWindow = '30d') {
  const response = await fetch(
    `/api/review/feedback?timeWindow=${timeWindow}&minUsageCount=5`,
    {
      credentials: 'include',
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error);
  }
  
  return await response.json();
}
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

function useReviewQueue(page = 1, limit = 25) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await fetch(
          `/api/review/queue?page=${page}&limit=${limit}`,
          { credentials: 'include' }
        );
        
        if (!result.ok) throw new Error('Failed to fetch');
        
        const json = await result.json();
        setData(json);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [page, limit]);

  return { data, loading, error };
}
```

---

## Performance Considerations

### Pagination

- Default page size: 25 items
- Maximum page size: 100 items
- Use pagination to avoid loading large datasets

### Caching

Consider implementing client-side caching for:
- Queue statistics (cache for 1-5 minutes)
- Template feedback (cache for 10-30 minutes)

### Database Indexes

The following indexes are recommended for optimal performance:

```sql
-- Index on status and quality_score for queue fetching
CREATE INDEX idx_conversations_review_queue 
ON conversations(status, quality_score, created_at) 
WHERE status = 'pending_review';

-- Index on parent_id for template aggregation
CREATE INDEX idx_conversations_parent_id 
ON conversations(parent_id, status, quality_score);
```

---

## Database Functions

### append_review_action

The review actions endpoint uses a PostgreSQL function for atomic review history updates:

```sql
CREATE OR REPLACE FUNCTION append_review_action(
  p_conversation_id UUID,
  p_action TEXT,
  p_performed_by UUID,
  p_comment TEXT DEFAULT NULL,
  p_reasons TEXT[] DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  UPDATE conversations
  SET review_history = COALESCE(review_history, '[]'::jsonb) || 
    jsonb_build_object(
      'id', gen_random_uuid(),
      'action', p_action,
      'performedBy', p_performed_by,
      'timestamp', NOW(),
      'comment', p_comment,
      'reasons', p_reasons
    )
  WHERE id = p_conversation_id;
END;
$$ LANGUAGE plpgsql;
```

---

## Testing

### Manual Testing with curl

```bash
# 1. Get review queue
curl -X GET "http://localhost:3000/api/review/queue?page=1&limit=10" \
  -H "Cookie: sb-access-token=YOUR_TOKEN"

# 2. Approve a conversation
curl -X POST "http://localhost:3000/api/review/actions" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -d '{
    "conversationId": "conv_123",
    "action": "approved",
    "comment": "Looks good"
  }'

# 3. Get template feedback
curl -X GET "http://localhost:3000/api/review/feedback?timeWindow=7d" \
  -H "Cookie: sb-access-token=YOUR_TOKEN"
```

### Integration Tests

See `src/app/api/review/__tests__/` for integration test examples.

---

## Support

For issues or questions:
1. Check the error response details
2. Verify authentication is working
3. Check database function exists: `append_review_action`
4. Review server logs for detailed error messages

---

## Changelog

### Version 1.0.0 (2025-10-31)
- Initial implementation of Review Queue API
- Added queue fetching with pagination and filtering
- Added review action submission
- Added template feedback aggregation
- Implemented authentication and authorization

