# Review Queue API - Quick Reference Guide

## Quick Start

### 1. Run Database Migration
```bash
# Apply the migration
psql -U postgres -d your_database -f supabase/migrations/20251031_create_review_functions.sql

# Or use Supabase CLI
supabase db push
```

### 2. Test Endpoints

```bash
# Set your token
export TOKEN="your-supabase-token"

# Test queue
curl "http://localhost:3000/api/review/queue" \
  -H "Cookie: sb-access-token=$TOKEN"

# Test action
curl -X POST "http://localhost:3000/api/review/actions" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=$TOKEN" \
  -d '{"conversationId":"conv_123","action":"approved","comment":"Approved"}'

# Test feedback
curl "http://localhost:3000/api/review/feedback?timeWindow=30d" \
  -H "Cookie: sb-access-token=$TOKEN"
```

---

## API Endpoints Cheat Sheet

### GET /api/review/queue
**Fetch conversations awaiting review**

```typescript
// Request
GET /api/review/queue?page=1&limit=25&sortBy=quality_score&sortOrder=asc&minQuality=6

// Response
{
  data: Conversation[],
  pagination: { page, limit, total, pages },
  statistics: { totalPending, averageQuality, oldestPendingDate }
}
```

**Parameters:**
- `page` (1) - Page number
- `limit` (25) - Items per page, max 100
- `sortBy` (quality_score) - quality_score | created_at
- `sortOrder` (asc) - asc | desc
- `minQuality` - Minimum quality score 0-10

---

### POST /api/review/actions
**Submit review decision**

```typescript
// Request
POST /api/review/actions
{
  conversationId: string,
  action: 'approved' | 'rejected' | 'revision_requested',
  comment?: string,
  reasons?: string[]
}

// Response
{
  success: true,
  conversation: ConversationRecord,
  message: "Conversation approved successfully"
}
```

**Action → Status Mapping:**
- `approved` → `approved`
- `rejected` → `rejected`
- `revision_requested` → `needs_revision`

---

### GET /api/review/feedback
**Get template performance metrics**

```typescript
// Request
GET /api/review/feedback?timeWindow=30d&minUsageCount=5

// Response
{
  templates: [{
    template_id, template_name, tier,
    usage_count, avg_quality,
    approved_count, rejected_count,
    approval_rate, performance
  }],
  overall_stats: {
    total_templates,
    low_performing_count,
    avg_approval_rate
  }
}
```

**Parameters:**
- `timeWindow` (30d) - 7d | 30d | all
- `minUsageCount` (5) - Minimum conversations

**Performance Levels:**
- `high` - Approval >= 85% AND quality >= 8
- `low` - Approval < 70% OR quality < 6
- `medium` - Everything else

---

## Service Layer Quick Reference

### Review Queue Service
```typescript
import {
  fetchReviewQueue,
  submitReviewAction,
  getQueueStatistics,
  validateReviewAction,
} from '@/lib/services/review-queue-service';

// Fetch queue
const result = await fetchReviewQueue({
  page: 1,
  limit: 25,
  sortBy: 'quality_score',
  sortOrder: 'asc',
  minQuality: 6,
  userId: user.id,
});

// Submit action
const conversation = await submitReviewAction({
  conversationId: 'conv_123',
  action: 'approved',
  userId: user.id,
  comment: 'Looks good',
  reasons: ['high_quality'],
});

// Get statistics
const stats = await getQueueStatistics();
```

### Quality Feedback Service
```typescript
import {
  aggregateFeedbackByTemplate,
  identifyLowPerformingTemplates,
  getFeedbackTrends,
} from '@/lib/services/quality-feedback-service';

// Get feedback
const feedback = await aggregateFeedbackByTemplate({
  timeWindow: '30d',
  minUsageCount: 5,
});

// Find low performers
const lowPerformers = await identifyLowPerformingTemplates(70);

// Get trends
const trends = await getFeedbackTrends();
```

---

## Common Use Cases

### 1. Display Review Queue
```typescript
async function ReviewQueueComponent() {
  const response = await fetch('/api/review/queue?page=1&limit=25');
  const { data, pagination, statistics } = await response.json();

  return (
    <div>
      <h1>Review Queue ({statistics.totalPending} pending)</h1>
      <p>Average Quality: {statistics.averageQuality}</p>
      {data.map(conv => (
        <ConversationCard key={conv.id} conversation={conv} />
      ))}
      <Pagination {...pagination} />
    </div>
  );
}
```

### 2. Approve Conversation
```typescript
async function approveConversation(conversationId: string, comment: string) {
  const response = await fetch('/api/review/actions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversationId,
      action: 'approved',
      comment,
      reasons: ['high_quality'],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details);
  }

  return await response.json();
}
```

### 3. Show Template Performance
```typescript
async function TemplatePerformanceComponent() {
  const response = await fetch('/api/review/feedback?timeWindow=30d');
  const { templates, overall_stats } = await response.json();

  const lowPerformers = templates.filter(t => t.performance === 'low');

  return (
    <div>
      <h1>Template Performance</h1>
      <p>Average Approval Rate: {overall_stats.avg_approval_rate}%</p>
      <h2>Low Performers ({lowPerformers.length})</h2>
      {lowPerformers.map(template => (
        <TemplateCard key={template.template_id} template={template} />
      ))}
    </div>
  );
}
```

---

## Database Functions

### append_review_action
**Atomically add review action to conversation**

```sql
-- Usage
SELECT append_review_action(
  'conversation-uuid'::uuid,    -- conversation ID
  'approved',                    -- action type
  'user-uuid'::uuid,            -- performed by
  'Comment text',                -- comment (optional)
  ARRAY['reason1', 'reason2']   -- reasons (optional)
);

-- Verify
SELECT review_history FROM conversations 
WHERE id = 'conversation-uuid'::uuid;
```

### aggregate_template_feedback
**Get template performance metrics**

```sql
-- Usage
SELECT * FROM aggregate_template_feedback(
  INTERVAL '30 days',  -- time window
  5                     -- minimum usage count
);

-- Returns
-- template_id, template_name, tier, usage_count, 
-- avg_quality, approved_count, rejected_count, approval_rate
```

---

## Error Handling

### Error Response Format
```typescript
{
  error: string,        // Error category
  details?: string,     // Detailed message
  code?: string         // Error code
}
```

### Common HTTP Status Codes
- `200` - Success
- `400` - Invalid parameters
- `401` - Unauthorized (missing/invalid auth)
- `404` - Resource not found
- `409` - Conflict (invalid state)
- `500` - Server error

### Error Handling Example
```typescript
try {
  const response = await fetch('/api/review/actions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId, action }),
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 401) {
      // Redirect to login
    } else if (response.status === 404) {
      // Show "not found" message
    } else if (response.status === 409) {
      // Show "invalid state" message
    } else {
      // Show generic error
    }
    throw new Error(error.details || error.error);
  }

  return await response.json();
} catch (error) {
  console.error('Failed to submit review:', error);
  throw error;
}
```

---

## TypeScript Types

### Import Types
```typescript
import type {
  FetchReviewQueueParams,
  FetchReviewQueueResult,
  SubmitReviewActionParams,
  ConversationRecord,
  ReviewActionType,
  TimeWindow,
  TemplateFeedback,
} from '@/lib/types/review.types';
```

### Key Type Definitions
```typescript
type ReviewActionType = 'approved' | 'rejected' | 'revision_requested';
type TimeWindow = '7d' | '30d' | 'all';
type PerformanceLevel = 'high' | 'medium' | 'low';

interface SubmitReviewActionParams {
  conversationId: string;
  action: ReviewActionType;
  userId: string;
  comment?: string;
  reasons?: string[];
}
```

---

## Validation Rules

### Review Queue
- `page` >= 1
- `limit` between 1 and 100
- `minQuality` between 0 and 10 (if provided)
- `sortBy` must be 'quality_score' or 'created_at'
- `sortOrder` must be 'asc' or 'desc'

### Review Actions
- `conversationId` required, must be string
- `action` required, must be valid ReviewActionType
- `comment` optional, must be string
- `reasons` optional, must be array
- Conversation must exist and be in valid state

### Feedback
- `timeWindow` must be '7d', '30d', or 'all'
- `minUsageCount` must be non-negative integer

---

## Performance Tips

### 1. Use Pagination
```typescript
// Good - paginated
fetch('/api/review/queue?page=1&limit=25')

// Bad - fetching everything
fetch('/api/review/queue?limit=1000')
```

### 2. Filter Early
```typescript
// Good - filter at database level
fetch('/api/review/queue?minQuality=7')

// Bad - fetch all then filter client-side
const all = await fetch('/api/review/queue?limit=1000')
const filtered = all.data.filter(c => c.quality_score >= 7)
```

### 3. Cache Statistics
```typescript
// Cache queue statistics for 5 minutes
const cacheKey = 'queue-stats';
const cached = cache.get(cacheKey);
if (cached) return cached;

const stats = await getQueueStatistics();
cache.set(cacheKey, stats, 300); // 5 min TTL
```

### 4. Batch Review Actions
```typescript
// Use bulk operation for multiple reviews
await submitBulkReviewActions([
  { conversationId: 'c1', action: 'approved', userId },
  { conversationId: 'c2', action: 'approved', userId },
  { conversationId: 'c3', action: 'rejected', userId },
]);
```

---

## Testing Checklist

### Manual Testing
- [ ] Fetch review queue with default parameters
- [ ] Test pagination (page 1, 2, 3)
- [ ] Test sorting by quality_score
- [ ] Test sorting by created_at
- [ ] Test minQuality filter
- [ ] Submit approve action
- [ ] Submit reject action
- [ ] Submit revision_requested action
- [ ] Fetch template feedback (7d)
- [ ] Fetch template feedback (30d)
- [ ] Fetch template feedback (all)

### Error Testing
- [ ] Test without authentication (expect 401)
- [ ] Test with invalid page number (expect 400)
- [ ] Test with invalid action type (expect 400)
- [ ] Test with non-existent conversation (expect 404)
- [ ] Test reviewing already-approved conversation (expect 409)

### Database Testing
```sql
-- Verify indexes exist
SELECT indexname FROM pg_indexes 
WHERE tablename = 'conversations' 
AND indexname LIKE 'idx_conversations%';

-- Verify functions exist
SELECT proname FROM pg_proc 
WHERE proname IN ('append_review_action', 'aggregate_template_feedback');

-- Check index usage
EXPLAIN ANALYZE 
SELECT * FROM conversations 
WHERE status = 'pending_review' 
ORDER BY quality_score ASC 
LIMIT 25;
```

---

## Troubleshooting

### Issue: "append_review_action function not found"
```bash
# Run migration
psql -d your_db -f supabase/migrations/20251031_create_review_functions.sql
```

### Issue: Slow queue queries
```sql
-- Check if index exists
SELECT * FROM pg_indexes 
WHERE indexname = 'idx_conversations_review_queue';

-- If not, create it
CREATE INDEX idx_conversations_review_queue 
ON conversations(status, quality_score, created_at) 
WHERE status = 'pending_review';
```

### Issue: Authentication failing
```typescript
// Ensure cookies are being sent
fetch('/api/review/queue', {
  credentials: 'include',  // Important!
});
```

### Issue: Empty feedback results
```typescript
// Check parameters
// timeWindow might be too narrow
// minUsageCount might be too high
const feedback = await fetch('/api/review/feedback?timeWindow=all&minUsageCount=1');
```

---

## Files Reference

| File | Purpose | Lines |
|------|---------|-------|
| `src/lib/types/review.types.ts` | TypeScript types | 205 |
| `src/lib/services/review-queue-service.ts` | Queue business logic | 384 |
| `src/lib/services/quality-feedback-service.ts` | Feedback logic | 398 |
| `src/app/api/review/queue/route.ts` | Queue API endpoint | 117 |
| `src/app/api/review/actions/route.ts` | Actions API endpoint | 157 |
| `src/app/api/review/feedback/route.ts` | Feedback API endpoint | 118 |
| `src/app/api/review/README.md` | API documentation | 750+ |
| `supabase/migrations/20251031_create_review_functions.sql` | Database setup | 250+ |

---

## Next Steps

1. **Frontend Integration**
   - Create Review Queue UI component
   - Add action buttons (Approve/Reject/Request Changes)
   - Show statistics dashboard

2. **Monitoring**
   - Set up performance monitoring
   - Track query execution times
   - Monitor error rates

3. **Enhancements**
   - Add real-time updates using Supabase Realtime
   - Implement reviewer assignment
   - Add email notifications
   - Create review analytics dashboard

---

## Support

- **Documentation:** `src/app/api/review/README.md`
- **Types:** `src/lib/types/review.types.ts`
- **Examples:** See Usage Examples section above
- **Testing:** See Testing Checklist section

---

**Version:** 1.0.0  
**Last Updated:** October 31, 2025

