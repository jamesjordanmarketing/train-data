# Review Queue API - Validation Checklist

## Pre-Deployment Validation

Use this checklist to validate the Review Queue API implementation before deploying to production.

---

## ✅ Database Setup

### Migration Execution
- [ ] Database migration file exists: `supabase/migrations/20251031_create_review_functions.sql`
- [ ] Migration has been applied to database
- [ ] No errors during migration execution
- [ ] Functions created successfully:
  - [ ] `append_review_action`
  - [ ] `aggregate_template_feedback`
- [ ] Indexes created successfully:
  - [ ] `idx_conversations_review_queue`
  - [ ] `idx_conversations_parent_id_status`
  - [ ] `idx_conversations_approved_by`
- [ ] Required columns exist:
  - [ ] `review_history` (JSONB)
  - [ ] `approved_by` (UUID)
  - [ ] `approved_at` (TIMESTAMPTZ)
  - [ ] `reviewer_notes` (TEXT)

### Verification Queries
```sql
-- ✅ Check functions exist
SELECT proname FROM pg_proc 
WHERE proname IN ('append_review_action', 'aggregate_template_feedback');
-- Expected: 2 rows

-- ✅ Check indexes exist
SELECT indexname FROM pg_indexes 
WHERE tablename = 'conversations' 
AND indexname LIKE 'idx_conversations%';
-- Expected: At least 3 indexes

-- ✅ Check columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'conversations' 
AND column_name IN ('review_history', 'approved_by', 'approved_at', 'reviewer_notes');
-- Expected: 4 rows
```

---

## ✅ File Structure

### Files Created
- [ ] `src/lib/types/review.types.ts` exists and compiles
- [ ] `src/lib/services/review-queue-service.ts` exists and compiles
- [ ] `src/lib/services/quality-feedback-service.ts` exists and compiles
- [ ] `src/app/api/review/queue/route.ts` exists and compiles
- [ ] `src/app/api/review/actions/route.ts` exists and compiles
- [ ] `src/app/api/review/feedback/route.ts` exists and compiles
- [ ] `src/app/api/review/README.md` exists
- [ ] `supabase/migrations/20251031_create_review_functions.sql` exists

### TypeScript Compilation
```bash
# Run TypeScript compiler
npm run type-check
# or
tsc --noEmit

# Expected: No errors
```

- [ ] No TypeScript compilation errors
- [ ] No ESLint errors
- [ ] No import resolution errors

---

## ✅ API Endpoint Testing

### GET /api/review/queue

#### Basic Functionality
- [ ] Returns 200 OK for valid request
- [ ] Returns JSON response
- [ ] Response includes `data`, `pagination`, and `statistics` fields
- [ ] `data` is an array of conversations
- [ ] All conversations have status='pending_review'
- [ ] Pagination metadata is correct
- [ ] Statistics are accurate

#### Pagination
- [ ] Default page=1, limit=25 works
- [ ] Custom page and limit work
- [ ] Max limit=100 is enforced
- [ ] Returns 400 for page < 1
- [ ] Returns 400 for limit < 1 or limit > 100

#### Sorting
- [ ] Default sort is quality_score ASC, created_at ASC
- [ ] sortBy=quality_score works
- [ ] sortBy=created_at works
- [ ] sortOrder=asc works
- [ ] sortOrder=desc works

#### Filtering
- [ ] minQuality filter works correctly
- [ ] Returns 400 for minQuality < 0
- [ ] Returns 400 for minQuality > 10

#### Authentication
- [ ] Returns 401 without authentication
- [ ] Returns 200 with valid authentication
- [ ] User ID is validated

#### Error Handling
- [ ] Returns appropriate error messages
- [ ] Returns correct HTTP status codes
- [ ] Errors are logged to console

#### Test Commands
```bash
# Basic fetch
curl "http://localhost:3000/api/review/queue" \
  -H "Cookie: sb-access-token=$TOKEN"

# With pagination
curl "http://localhost:3000/api/review/queue?page=2&limit=10" \
  -H "Cookie: sb-access-token=$TOKEN"

# With filtering
curl "http://localhost:3000/api/review/queue?minQuality=7&sortBy=quality_score&sortOrder=asc" \
  -H "Cookie: sb-access-token=$TOKEN"

# Without auth (expect 401)
curl "http://localhost:3000/api/review/queue"
```

---

### POST /api/review/actions

#### Basic Functionality
- [ ] Returns 200 OK for valid request
- [ ] Returns JSON response with `success`, `conversation`, and `message`
- [ ] Conversation status is updated correctly
- [ ] Review action is appended to review_history
- [ ] approved_by is set correctly for 'approved' action
- [ ] approved_at is set correctly for 'approved' action
- [ ] reviewer_notes is set when comment provided

#### Action Types
- [ ] 'approved' action changes status to 'approved'
- [ ] 'rejected' action changes status to 'rejected'
- [ ] 'revision_requested' action changes status to 'needs_revision'
- [ ] Returns 400 for invalid action type

#### Validation
- [ ] Returns 400 if conversationId missing
- [ ] Returns 400 if action missing
- [ ] Returns 404 if conversation not found
- [ ] Returns 409 if conversation not eligible for review
- [ ] Comment is optional (accepts null/undefined)
- [ ] Reasons is optional (accepts null/undefined)

#### Atomicity
- [ ] Review action and status update happen atomically
- [ ] No partial updates on error
- [ ] Concurrent requests don't corrupt data

#### Authentication
- [ ] Returns 401 without authentication
- [ ] Returns 200 with valid authentication
- [ ] performedBy is set to authenticated user ID

#### Error Handling
- [ ] Returns appropriate error messages
- [ ] Returns correct HTTP status codes
- [ ] Errors are logged to console

#### Test Commands
```bash
# Approve conversation
curl -X POST "http://localhost:3000/api/review/actions" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=$TOKEN" \
  -d '{
    "conversationId": "conv_123",
    "action": "approved",
    "comment": "Excellent quality",
    "reasons": ["high_quality"]
  }'

# Reject conversation
curl -X POST "http://localhost:3000/api/review/actions" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=$TOKEN" \
  -d '{
    "conversationId": "conv_456",
    "action": "rejected",
    "comment": "Poor quality"
  }'

# Request changes
curl -X POST "http://localhost:3000/api/review/actions" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=$TOKEN" \
  -d '{
    "conversationId": "conv_789",
    "action": "revision_requested",
    "comment": "Needs improvement"
  }'

# Invalid action (expect 400)
curl -X POST "http://localhost:3000/api/review/actions" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=$TOKEN" \
  -d '{
    "conversationId": "conv_123",
    "action": "invalid_action"
  }'

# Without auth (expect 401)
curl -X POST "http://localhost:3000/api/review/actions" \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "conv_123", "action": "approved"}'
```

---

### GET /api/review/feedback

#### Basic Functionality
- [ ] Returns 200 OK for valid request
- [ ] Returns JSON response with `templates`, `overall_stats`, and `metadata`
- [ ] `templates` is an array of template feedback objects
- [ ] Each template has all required fields
- [ ] `overall_stats` contains correct aggregations
- [ ] `metadata` includes timeWindow and generatedAt

#### Time Windows
- [ ] timeWindow='7d' works correctly
- [ ] timeWindow='30d' works correctly (default)
- [ ] timeWindow='all' works correctly
- [ ] Returns 400 for invalid time window

#### Filtering
- [ ] minUsageCount filter works correctly
- [ ] Default minUsageCount=5 works
- [ ] Returns 400 for negative minUsageCount

#### Performance Classification
- [ ] 'high' performance calculated correctly (>= 85% approval, >= 8.0 quality)
- [ ] 'low' performance calculated correctly (< 70% approval OR < 6.0 quality)
- [ ] 'medium' performance calculated correctly (everything else)

#### Metrics Accuracy
- [ ] usage_count is correct
- [ ] avg_quality is accurate
- [ ] approved_count is correct
- [ ] rejected_count is correct
- [ ] approval_rate is calculated correctly
- [ ] Templates sorted by approval_rate ASC (worst first)

#### Authentication
- [ ] Returns 401 without authentication
- [ ] Returns 200 with valid authentication

#### Error Handling
- [ ] Returns appropriate error messages
- [ ] Returns correct HTTP status codes
- [ ] Errors are logged to console

#### Test Commands
```bash
# Default (30 days)
curl "http://localhost:3000/api/review/feedback" \
  -H "Cookie: sb-access-token=$TOKEN"

# 7 days
curl "http://localhost:3000/api/review/feedback?timeWindow=7d&minUsageCount=10" \
  -H "Cookie: sb-access-token=$TOKEN"

# All time
curl "http://localhost:3000/api/review/feedback?timeWindow=all&minUsageCount=1" \
  -H "Cookie: sb-access-token=$TOKEN"

# Invalid time window (expect 400)
curl "http://localhost:3000/api/review/feedback?timeWindow=invalid" \
  -H "Cookie: sb-access-token=$TOKEN"

# Without auth (expect 401)
curl "http://localhost:3000/api/review/feedback"
```

---

## ✅ Service Layer Testing

### Review Queue Service

#### fetchReviewQueue
- [ ] Returns correct data structure
- [ ] Pagination works correctly
- [ ] Filtering works correctly
- [ ] Sorting works correctly
- [ ] Error handling works
- [ ] Returns accurate statistics

#### submitReviewAction
- [ ] Updates conversation status
- [ ] Appends to review_history
- [ ] Sets approval metadata
- [ ] Validates conversation state
- [ ] Error handling works

#### getQueueStatistics
- [ ] Returns totalPending count
- [ ] Calculates averageQuality correctly
- [ ] Finds oldestPendingDate correctly
- [ ] Handles empty queue

#### validateReviewAction
- [ ] Validates conversation exists
- [ ] Checks conversation state
- [ ] Validates action type
- [ ] Returns appropriate error messages

#### Test Code
```typescript
import {
  fetchReviewQueue,
  submitReviewAction,
  getQueueStatistics,
  validateReviewAction,
} from '@/lib/services/review-queue-service';

// Test fetch
const result = await fetchReviewQueue({
  page: 1,
  limit: 25,
  sortBy: 'quality_score',
  sortOrder: 'asc',
  userId: 'test-user-id',
});
console.assert(result.data.length <= 25);
console.assert(result.pagination.page === 1);

// Test submit
const conversation = await submitReviewAction({
  conversationId: 'test-conv-id',
  action: 'approved',
  userId: 'test-user-id',
  comment: 'Test comment',
});
console.assert(conversation.status === 'approved');

// Test statistics
const stats = await getQueueStatistics();
console.assert(typeof stats.totalPending === 'number');
```

---

### Quality Feedback Service

#### aggregateFeedbackByTemplate
- [ ] Returns templates array
- [ ] Returns overall_stats
- [ ] Filters by time window correctly
- [ ] Filters by minUsageCount correctly
- [ ] Calculates metrics correctly
- [ ] Classifies performance correctly
- [ ] Falls back to client-side if RPC unavailable

#### identifyLowPerformingTemplates
- [ ] Returns templates below threshold
- [ ] Includes quality score in evaluation
- [ ] Returns empty array if none found

#### getFeedbackTrends
- [ ] Returns daily trends
- [ ] Returns template-specific trends
- [ ] Calculates trend direction correctly (improving/stable/declining)

#### Test Code
```typescript
import {
  aggregateFeedbackByTemplate,
  identifyLowPerformingTemplates,
  getFeedbackTrends,
} from '@/lib/services/quality-feedback-service';

// Test aggregation
const feedback = await aggregateFeedbackByTemplate({
  timeWindow: '30d',
  minUsageCount: 5,
});
console.assert(Array.isArray(feedback.templates));
console.assert(feedback.overall_stats.total_templates >= 0);

// Test low performers
const lowPerformers = await identifyLowPerformingTemplates(70);
console.assert(Array.isArray(lowPerformers));

// Test trends
const trends = await getFeedbackTrends();
console.assert(Array.isArray(trends.daily));
console.assert(typeof trends.byTemplate === 'object');
```

---

## ✅ Database Function Testing

### append_review_action

```sql
-- ✅ Test basic append
SELECT append_review_action(
  'valid-conversation-uuid'::uuid,
  'approved',
  'valid-user-uuid'::uuid,
  'Test comment',
  ARRAY['test_reason']
);

-- ✅ Verify review_history was updated
SELECT review_history FROM conversations 
WHERE id = 'valid-conversation-uuid'::uuid;
-- Expected: Array with new review action

-- ✅ Test invalid conversation (expect error)
SELECT append_review_action(
  'invalid-uuid'::uuid,
  'approved',
  'valid-user-uuid'::uuid,
  NULL,
  NULL
);
-- Expected: ERROR: Conversation with id ... not found

-- ✅ Test invalid action type (expect error)
SELECT append_review_action(
  'valid-conversation-uuid'::uuid,
  'invalid_action',
  'valid-user-uuid'::uuid,
  NULL,
  NULL
);
-- Expected: ERROR: Invalid action type
```

- [ ] Function executes successfully with valid inputs
- [ ] review_history is appended correctly
- [ ] Error handling works for invalid conversation
- [ ] Error handling works for invalid action type
- [ ] Concurrent calls don't corrupt data

---

### aggregate_template_feedback

```sql
-- ✅ Test basic aggregation
SELECT * FROM aggregate_template_feedback(
  INTERVAL '30 days',
  5
);
-- Expected: Rows with template metrics

-- ✅ Test different time windows
SELECT * FROM aggregate_template_feedback(INTERVAL '7 days', 5);
SELECT * FROM aggregate_template_feedback(INTERVAL '100 years', 1); -- all time

-- ✅ Verify calculations
SELECT 
  template_id,
  usage_count,
  approved_count,
  approval_rate,
  -- Manual calculation
  (approved_count::float / usage_count * 100) as manual_approval_rate
FROM aggregate_template_feedback(INTERVAL '30 days', 5);
-- approval_rate should match manual_approval_rate
```

- [ ] Function executes successfully
- [ ] Returns correct columns
- [ ] usage_count is accurate
- [ ] avg_quality is calculated correctly
- [ ] approved_count is accurate
- [ ] rejected_count is accurate
- [ ] approval_rate calculation is correct
- [ ] minUsageCount filter works
- [ ] Time window filter works

---

## ✅ Performance Validation

### Query Performance

```sql
-- ✅ Test queue query performance
EXPLAIN ANALYZE 
SELECT * FROM conversations 
WHERE status = 'pending_review' 
ORDER BY quality_score ASC, created_at ASC
LIMIT 25;
-- Expected: Uses idx_conversations_review_queue, < 500ms

-- ✅ Test aggregation performance
EXPLAIN ANALYZE 
SELECT * FROM aggregate_template_feedback(INTERVAL '30 days', 5);
-- Expected: Uses indexes, < 1000ms
```

- [ ] Queue query uses idx_conversations_review_queue index
- [ ] Queue query completes in < 500ms with 1000 conversations
- [ ] Action submission completes in < 200ms
- [ ] Feedback aggregation completes in < 1000ms
- [ ] No full table scans on large tables

### Load Testing (Optional)
```bash
# Use a tool like Apache Bench or k6
ab -n 100 -c 10 "http://localhost:3000/api/review/queue"
# Expected: All requests succeed, avg response time < 500ms
```

- [ ] API handles 10 concurrent requests
- [ ] No race conditions or deadlocks
- [ ] Error rate < 1%

---

## ✅ Integration Testing

### End-to-End Flow

1. **Create Test Conversation**
```sql
INSERT INTO conversations (
  id, conversation_id, title, status, tier, category,
  quality_score, total_turns, total_tokens, parameters
) VALUES (
  gen_random_uuid(),
  'test_conv_e2e',
  'E2E Test Conversation',
  'pending_review',
  'template',
  ARRAY['test'],
  7.5,
  10,
  1500,
  '{}'::jsonb
) RETURNING id;
-- Note the returned ID
```

2. **Fetch Queue - Verify Appears**
```bash
curl "http://localhost:3000/api/review/queue" \
  -H "Cookie: sb-access-token=$TOKEN" \
  | jq '.data[] | select(.title=="E2E Test Conversation")'
# Expected: Returns the conversation
```

3. **Submit Approve Action**
```bash
curl -X POST "http://localhost:3000/api/review/actions" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=$TOKEN" \
  -d '{
    "conversationId": "INSERT_ID_HERE",
    "action": "approved",
    "comment": "E2E test approval"
  }'
# Expected: Returns success response
```

4. **Verify Status Changed**
```sql
SELECT id, status, approved_by, approved_at, reviewer_notes, review_history
FROM conversations 
WHERE id = 'INSERT_ID_HERE';
-- Expected: 
-- status = 'approved'
-- approved_by = current user ID
-- approved_at = recent timestamp
-- reviewer_notes = 'E2E test approval'
-- review_history = array with approve action
```

5. **Verify No Longer in Queue**
```bash
curl "http://localhost:3000/api/review/queue" \
  -H "Cookie: sb-access-token=$TOKEN" \
  | jq '.data[] | select(.title=="E2E Test Conversation")'
# Expected: No results (conversation removed from queue)
```

6. **Clean Up**
```sql
DELETE FROM conversations WHERE conversation_id = 'test_conv_e2e';
```

#### Checklist
- [ ] Test conversation created successfully
- [ ] Conversation appears in queue
- [ ] Approval action succeeds
- [ ] Status changes to 'approved'
- [ ] approved_by is set correctly
- [ ] approved_at is set correctly
- [ ] reviewer_notes contains comment
- [ ] review_history contains action
- [ ] Conversation removed from queue
- [ ] Test data cleaned up

---

## ✅ Security Validation

### Authentication
- [ ] All endpoints require authentication
- [ ] Returns 401 for missing auth token
- [ ] Returns 401 for invalid auth token
- [ ] Returns 401 for expired auth token
- [ ] User ID is validated on each request

### Authorization
- [ ] Users can only review conversations they have access to (if RLS enabled)
- [ ] performedBy is always set to authenticated user
- [ ] approved_by is always set to authenticated user
- [ ] Users cannot spoof user IDs

### Input Validation
- [ ] All inputs are validated before database queries
- [ ] SQL injection is prevented (using parameterized queries)
- [ ] XSS is prevented (proper escaping)
- [ ] No sensitive data in error messages
- [ ] Rate limiting considered (if needed)

---

## ✅ Documentation Validation

- [ ] API documentation exists (`src/app/api/review/README.md`)
- [ ] All endpoints are documented
- [ ] Request/response formats are documented
- [ ] Error responses are documented
- [ ] Code examples are provided
- [ ] TypeScript types are documented
- [ ] Database functions are documented
- [ ] Migration file is documented

---

## ✅ Code Quality

### TypeScript
- [ ] No `any` types used without justification
- [ ] All functions have proper type signatures
- [ ] Interfaces are well-defined
- [ ] Type guards are used where appropriate

### Error Handling
- [ ] All errors are caught and handled
- [ ] Errors are logged appropriately
- [ ] Error messages are user-friendly
- [ ] HTTP status codes are correct

### Code Style
- [ ] Consistent formatting
- [ ] Meaningful variable names
- [ ] Functions are single-purpose
- [ ] Comments explain complex logic
- [ ] No unused imports or variables

### Best Practices
- [ ] DRY principle followed
- [ ] Separation of concerns maintained
- [ ] Service layer properly abstracted
- [ ] Database queries are optimized
- [ ] No hardcoded values

---

## ✅ Deployment Readiness

- [ ] All tests pass
- [ ] No linter errors
- [ ] No TypeScript compilation errors
- [ ] Database migration ready
- [ ] Environment variables documented
- [ ] Rollback plan exists
- [ ] Monitoring plan exists
- [ ] Performance benchmarks documented

---

## 🎯 Final Sign-Off

### Pre-Production
- [ ] All checklist items completed
- [ ] Code reviewed by at least one other developer
- [ ] QA testing completed
- [ ] Security review completed
- [ ] Performance testing completed
- [ ] Documentation reviewed and approved

### Production Deployment
- [ ] Database backup taken
- [ ] Migration applied to production
- [ ] Application deployed
- [ ] Smoke tests passed
- [ ] Monitoring active
- [ ] Team notified of deployment

---

## 📊 Test Results Summary

| Category | Tests | Passed | Failed | Notes |
|----------|-------|--------|--------|-------|
| Database Setup | | | | |
| API Endpoints | | | | |
| Service Layer | | | | |
| Database Functions | | | | |
| Performance | | | | |
| Integration | | | | |
| Security | | | | |
| **Total** | **0** | **0** | **0** | |

---

**Validation Date:** _______________  
**Validated By:** _______________  
**Status:** ⬜ Pending / ⬜ Approved / ⬜ Rejected  
**Notes:** _______________

---

**Version:** 1.0.0  
**Last Updated:** October 31, 2025

