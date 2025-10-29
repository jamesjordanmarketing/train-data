# Train - Implementation Execution Instructions (E06)
**Generated**: 2025-01-29  
**Segment**: E06 - Review Queue & Quality Feedback Loop  
**Total Prompts**: 5  
**Estimated Implementation Time**: 32-40 hours (4-5 days with 1 engineer)

---

## Executive Summary

Segment E06 implements the **Review Queue and Quality Feedback Loop** (FR6.1), a critical quality control system that enables human reviewers to efficiently review, approve, reject, and provide feedback on AI-generated conversations. This segment completes the quality assurance workflow by providing:

1. **Review Queue Interface** - Dedicated view for conversations requiring review, with prioritization by quality score
2. **Side-by-Side Review Experience** - Display conversations alongside source chunks for context
3. **Review Actions** - Approve, Reject, and Request Changes with comments and reasons
4. **Quality Feedback Loop** - Aggregate reviewer feedback to identify low-performing templates
5. **Keyboard Shortcuts** - Rapid review workflow with A (approve), R (reject), N (next)
6. **Batch Review** - Select multiple conversations for bulk actions
7. **Review History Tracking** - Complete audit trail of all review actions

**Strategic Importance:**
- Ensures training data quality before LoRA fine-tuning
- Creates feedback loop for continuous template improvement
- Maintains compliance with human-in-the-loop requirements
- Reduces time to review from manual file inspection to efficient UI workflow

---

## Context and Dependencies

### Previous Segment Deliverables

**E01-E04 (Assumed Complete):**
- Core database schema with conversations table
- Conversation generation workflows (single and batch)
- Dashboard with conversation table and filtering
- Export functionality
- Template management system

**E05 (Most Recent):**
Based on the functional requirements and wireframe structure, E05 likely implemented:
- Enhanced dashboard views (Templates, Scenarios, Edge Cases)
- Advanced filtering and sorting
- Quality metrics visualization
- Batch generation improvements

**What E06 Builds Upon:**
- Existing conversation data model with status field
- Quality scoring system (qualityScore, qualityMetrics)
- Conversation table infrastructure
- API patterns for CRUD operations
- Zustand state management patterns
- Shadcn/UI component library

### Current Codebase State

**Wireframe Foundation (Existing):**
```
train-wireframe/src/components/views/ReviewQueueView.tsx - EXISTS (skeleton/stub)
train-wireframe/src/lib/types.ts - Contains ReviewAction type (lines 48-55)
train-wireframe/src/stores/useAppStore.ts - State management patterns
train-wireframe/src/components/dashboard/ConversationTable.tsx - Reusable table component
train-wireframe/src/components/ui/* - Complete Shadcn/UI component library
```

**Backend Foundation (Existing):**
```
src/app/api/chunks/* - Existing API patterns to follow
src/lib/database.ts - Database service layer
src/lib/ai-config.ts - AI configuration patterns
```

**Key Data Models (Already Defined):**
- `Conversation` type with reviewHistory field (JSONB array)
- `ReviewAction` type with action, performedBy, timestamp, comment, reasons
- `ConversationStatus` enum including 'pending_review', 'approved', 'rejected', 'needs_revision'
- `QualityMetrics` type with component scores and confidence level

### Cross-Segment Dependencies

**Database Requirements:**
- Conversations table must have reviewHistory JSONB column
- Status field must support review lifecycle states
- Quality score must be indexed for sorting
- Foreign key to auth.users for reviewer attribution

**API Dependencies:**
- Authentication system (Supabase Auth)
- Conversation CRUD endpoints
- Supabase RLS policies for multi-tenant data isolation

**UI/UX Dependencies:**
- Consistent styling with existing dashboard
- Keyboard shortcut system (may need to be implemented)
- Toast notification system (Sonner)
- Modal/dialog patterns from Shadcn/UI

---

## Implementation Strategy

### Risk Assessment

**High-Risk Areas:**

1. **Review History Data Model Complexity** (Risk: HIGH)
   - **Issue**: Storing review actions as JSONB array requires careful transaction handling
   - **Mitigation**: Use database transactions for atomic updates, implement optimistic locking
   - **Testing**: Concurrent review action tests with multiple users

2. **Keyboard Shortcuts Conflicts** (Risk: MEDIUM)
   - **Issue**: May conflict with browser shortcuts or other app shortcuts
   - **Mitigation**: Disable shortcuts when input fields focused, make configurable in user preferences
   - **Testing**: Test across browsers (Chrome, Firefox, Safari, Edge)

3. **Performance with Large Review Queues** (Risk: MEDIUM)
   - **Issue**: Filtering conversations by status='pending_review' at scale
   - **Mitigation**: Partial index on pending_review status, pagination with cursor-based loading
   - **Testing**: Load test with 1000+ conversations in review queue

4. **Review Context Loading** (Risk: LOW)
   - **Issue**: Loading source chunk data alongside conversation
   - **Mitigation**: Efficient joins or separate API call with caching
   - **Testing**: Measure load time, optimize if >500ms

### Prompt Sequencing Logic

**Prompt 1: Database Schema & API Foundation** (6-8 hours)
- **Why First**: All other features depend on database structure and API endpoints
- **Focus**: Solid foundation with indexes, constraints, and transaction support
- **Deliverable**: reviewHistory field, API routes, service layer methods

**Prompt 2: Review Queue View Component** (8-10 hours)
- **Why Second**: Core UI that orchestrates all review features
- **Focus**: Table filtering, prioritization, empty states, navigation
- **Deliverable**: Functional review queue displaying pending conversations

**Prompt 3: Conversation Review Modal** (10-12 hours)
- **Why Third**: Most complex UI component with side-by-side layout
- **Focus**: Layout, turn display, source chunk context, action controls
- **Deliverable**: Complete review interface with approve/reject actions

**Prompt 4: Keyboard Shortcuts & Bulk Actions** (4-6 hours)
- **Why Fourth**: Enhances workflow built in previous prompts
- **Focus**: Rapid review workflow, bulk selection, confirmation dialogs
- **Deliverable**: Keyboard navigation and batch review capabilities

**Prompt 5: Quality Feedback Dashboard** (4-6 hours)
- **Why Last**: Aggregates data from completed reviews
- **Focus**: Template performance analytics, feedback trends, recommendations
- **Deliverable**: Feedback dashboard widget and analytics queries

### Quality Assurance Approach

**Functional Testing:**
- Test all review action types (approve, reject, request changes)
- Verify review history appends correctly without data loss
- Test keyboard shortcuts in isolation and combination
- Validate bulk actions with various selection sizes (1, 10, 50+ conversations)

**Integration Testing:**
- Verify conversation status transitions through full lifecycle
- Test review queue filtering with mixed statuses
- Validate user authentication and authorization
- Test concurrent reviews by multiple users

**Performance Testing:**
- Measure review queue load time with 100, 500, 1000 conversations
- Test pagination and scrolling performance
- Validate API response times (<500ms for queue fetch)
- Monitor database query execution plans

**User Experience Testing:**
- Test keyboard shortcuts for rapid workflow
- Verify toast notifications provide clear feedback
- Test error recovery (network failures, validation errors)
- Validate responsive layout on different screen sizes

---

## Database Setup Instructions

### Required SQL Operations

Execute the following SQL statements in **Supabase SQL Editor** before starting implementation:

========================

```sql
-- ============================================
-- E06: Review Queue & Quality Feedback Schema
-- ============================================

-- Step 1: Add reviewHistory column to conversations table (if not exists)
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS reviewHistory JSONB DEFAULT '[]'::JSONB;

-- Step 2: Add CHECK constraint for valid action types in reviewHistory
-- (Validates that each action in the array has a valid action type)
ALTER TABLE conversations 
ADD CONSTRAINT check_review_action_types 
CHECK (
  reviewHistory IS NULL OR 
  jsonb_typeof(reviewHistory) = 'array'
);

-- Step 3: Create GIN index on reviewHistory for efficient querying
CREATE INDEX IF NOT EXISTS idx_conversations_review_history 
ON conversations USING GIN (reviewHistory);

-- Step 4: Ensure status field includes all review-related statuses
-- (May already exist from previous migrations)
ALTER TABLE conversations 
ALTER COLUMN status TYPE TEXT;

-- Add constraint to ensure valid status values
ALTER TABLE conversations
DROP CONSTRAINT IF EXISTS conversations_status_check;

ALTER TABLE conversations
ADD CONSTRAINT conversations_status_check 
CHECK (status IN (
  'draft', 
  'generated', 
  'pending_review', 
  'approved', 
  'rejected', 
  'needs_revision', 
  'failed'
));

-- Step 5: Create partial index for review queue optimization
-- (Only index conversations that are pending review)
CREATE INDEX IF NOT EXISTS idx_conversations_pending_review 
ON conversations (quality_score ASC, created_at ASC) 
WHERE status = 'pending_review';

-- Step 6: Create index for approved conversations (for export filtering)
CREATE INDEX IF NOT EXISTS idx_conversations_approved 
ON conversations (created_at DESC) 
WHERE status = 'approved';

-- Step 7: Add approved_by and approved_at fields for audit trail
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);

ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS reviewer_notes TEXT;

-- Step 8: Create database function to append review actions safely
CREATE OR REPLACE FUNCTION append_review_action(
  p_conversation_id UUID,
  p_action TEXT,
  p_performed_by UUID,
  p_comment TEXT DEFAULT NULL,
  p_reasons TEXT[] DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_new_action JSONB;
  v_updated_history JSONB;
BEGIN
  -- Construct new review action object
  v_new_action := jsonb_build_object(
    'id', gen_random_uuid(),
    'action', p_action,
    'performedBy', p_performed_by,
    'timestamp', NOW(),
    'comment', p_comment,
    'reasons', COALESCE(p_reasons, ARRAY[]::TEXT[])
  );
  
  -- Append to existing reviewHistory array
  UPDATE conversations 
  SET 
    reviewHistory = COALESCE(reviewHistory, '[]'::JSONB) || v_new_action,
    updated_at = NOW()
  WHERE id = p_conversation_id
  RETURNING reviewHistory INTO v_updated_history;
  
  RETURN v_updated_history;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create helper view for review queue statistics
CREATE OR REPLACE VIEW review_queue_stats AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'pending_review') as pending_count,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
  COUNT(*) FILTER (WHERE status = 'needs_revision') as needs_revision_count,
  AVG(quality_score) FILTER (WHERE status = 'pending_review') as avg_pending_quality,
  MIN(created_at) FILTER (WHERE status = 'pending_review') as oldest_pending_date,
  MAX(updated_at) FILTER (WHERE status = 'approved') as latest_approval_date
FROM conversations;

-- Step 10: Grant necessary permissions
GRANT EXECUTE ON FUNCTION append_review_action TO authenticated;
GRANT SELECT ON review_queue_stats TO authenticated;

-- Step 11: Verify schema changes
DO $$
BEGIN
  -- Check if reviewHistory column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' AND column_name = 'reviewhistory'
  ) THEN
    RAISE EXCEPTION 'reviewHistory column not found';
  END IF;
  
  -- Check if partial index exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_conversations_pending_review'
  ) THEN
    RAISE EXCEPTION 'Partial index idx_conversations_pending_review not found';
  END IF;
  
  RAISE NOTICE 'Review queue schema validation: PASSED';
END $$;

-- Step 12: Create sample data for testing (optional)
-- Uncomment if you want test data
/*
UPDATE conversations 
SET status = 'pending_review' 
WHERE id IN (
  SELECT id FROM conversations 
  WHERE status = 'generated' 
  LIMIT 10
);
*/
```

**Verification Steps:**
1. Run `SELECT * FROM review_queue_stats;` to verify view works
2. Test append_review_action function:
   ```sql
   SELECT append_review_action(
     (SELECT id FROM conversations LIMIT 1),
     'approved',
     (SELECT id FROM auth.users LIMIT 1),
     'Looks good!',
     ARRAY['high_quality']
   );
   ```
3. Verify indexes are being used:
   ```sql
   EXPLAIN ANALYZE 
   SELECT * FROM conversations 
   WHERE status = 'pending_review' 
   ORDER BY quality_score ASC, created_at ASC 
   LIMIT 25;
   ```

++++++++++++++++++

---

## Implementation Prompts

### Prompt 1: Review API Endpoints & Service Layer
**Scope**: Implement backend API routes and service layer for review queue operations  
**Dependencies**: Database schema must be created (SQL above executed)  
**Estimated Time**: 6-8 hours  
**Risk Level**: Medium (Transaction management complexity)

========================

You are a senior backend developer implementing the **Review Queue API and Service Layer** for the Train conversation generation platform.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
Train is an Interactive LoRA Conversation Generation platform that enables business users to generate, review, and export high-quality training conversations for AI fine-tuning. The Review Queue system is a critical quality control mechanism ensuring only approved conversations make it into training datasets.

**Functional Requirements (FR6.1.1 - Review Queue Interface):**
- GET endpoint to fetch conversations with status 'pending_review'
- POST endpoint to submit review actions (approve, reject, request_changes)
- Support for filtering by quality score and date
- Atomic updates to conversation status and reviewHistory
- Complete audit trail with user attribution

**Functional Requirements (FR6.1.2 - Quality Feedback Loop):**
- GET endpoint for aggregated feedback by template
- Calculate approval rates and quality trends
- Identify low-performing templates

**CURRENT CODEBASE STATE:**

**Existing API Patterns:**
- API routes use Next.js 14 App Router pattern: `src/app/api/[route]/route.ts`
- Existing endpoints: `/api/chunks/*`, `/api/documents/*`, `/api/export/*`
- Pattern: Export async function for each HTTP method (GET, POST, PATCH, DELETE)
- Authentication: Supabase Auth with session validation
- Error handling: Try/catch with NextResponse.json for errors

**Existing Database Service:**
Location: `src/lib/database.ts`
Pattern Example:
```typescript
export async function getDocuments(userId: string, options?: QueryOptions) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order(options?.orderBy || 'created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}
```

**Existing Types:**
Location: `train-wireframe/src/lib/types.ts`
```typescript
// ConversationStatus (line 5)
type ConversationStatus = 'draft' | 'generated' | 'pending_review' | 'approved' | 'rejected' | 'needs_revision' | 'failed';

// ReviewAction (lines 48-55)
interface ReviewAction {
  id: string;
  action: 'approved' | 'rejected' | 'revision_requested' | 'generated' | 'moved_to_review';
  performedBy: string; // user_id
  timestamp: string;
  comment?: string;
  reasons?: string[];
}

// Conversation (lines 26-46)
interface Conversation {
  id: string;
  conversation_id: string;
  title: string;
  status: ConversationStatus;
  tier: 'template' | 'scenario' | 'edge_case';
  category: string[];
  quality_score?: number;
  qualityMetrics?: QualityMetrics;
  totalTurns: number;
  totalTokens: number;
  parentId?: string;
  parentType?: string;
  reviewHistory?: ReviewAction[];
  parameters: Record<string, any>;
  created_at: string;
  updated_at: string;
}
```

**IMPLEMENTATION TASKS:**

**Task T-1.2.1: Implement Review Queue API**
Create: `src/app/api/review/queue/route.ts`

Requirements:
- GET endpoint returning paginated conversations where status = 'pending_review'
- Query parameters: page (default 1), limit (default 25), sortBy (quality_score | created_at), sortOrder (asc | desc), minQuality (0-10)
- Default sort: quality_score ASC, created_at ASC (prioritize low quality, older conversations)
- Response format:
  ```typescript
  {
    data: Conversation[],
    pagination: {
      page: number,
      limit: number,
      total: number,
      pages: number
    },
    statistics: {
      totalPending: number,
      averageQuality: number,
      oldestPendingDate: string
    }
  }
  ```

**Task T-1.2.2: Implement Review Action Submission API**
Create: `src/app/api/review/actions/route.ts`

Requirements:
- POST endpoint accepting review action payload
- Request body:
  ```typescript
  {
    conversationId: string,
    action: 'approved' | 'rejected' | 'revision_requested',
    comment?: string,
    reasons?: string[]
  }
  ```
- Atomic transaction:
  1. Get current user from Supabase session
  2. Validate conversation exists and is in valid state
  3. Determine new status based on action
  4. Use database function `append_review_action()` to append to reviewHistory
  5. Update conversation status
  6. Update approved_by, approved_at, reviewer_notes fields
- Status mapping:
  - 'approved' -> status 'approved'
  - 'rejected' -> status 'rejected'
  - 'revision_requested' -> status 'needs_revision'
- Response: Updated conversation object

**Task T-1.2.3: Implement Quality Feedback API**
Create: `src/app/api/review/feedback/route.ts`

Requirements:
- GET endpoint for aggregated feedback by template
- Query parameters: timeWindow (7d | 30d | all), minUsageCount (default 5)
- Aggregation query:
  ```sql
  SELECT 
    t.id as template_id,
    t.name as template_name,
    t.tier,
    COUNT(*) as usage_count,
    AVG(c.quality_score) as avg_quality,
    COUNT(*) FILTER (WHERE c.status = 'approved') as approved_count,
    COUNT(*) FILTER (WHERE c.status = 'rejected') as rejected_count,
    (COUNT(*) FILTER (WHERE c.status = 'approved')::float / COUNT(*)) * 100 as approval_rate
  FROM templates t
  LEFT JOIN conversations c ON c.parentId = t.id
  WHERE c.created_at > NOW() - INTERVAL timeWindow
  GROUP BY t.id, t.name, t.tier
  HAVING COUNT(*) >= minUsageCount
  ORDER BY approval_rate ASC, avg_quality ASC
  ```
- Response format:
  ```typescript
  {
    templates: Array<{
      template_id: string,
      template_name: string,
      tier: string,
      usage_count: number,
      avg_quality: number,
      approval_rate: number,
      performance: 'high' | 'medium' | 'low' // calculated
    }>,
    overall_stats: {
      total_templates: number,
      low_performing_count: number,
      avg_approval_rate: number
    }
  }
  ```
- Performance calculation:
  - High: approval_rate >= 85% AND avg_quality >= 8
  - Low: approval_rate < 70% OR avg_quality < 6
  - Medium: everything else

**Task T-2.1.1: Create Review Queue Service Layer**
Create: `src/lib/services/review-queue-service.ts`

Service methods:
```typescript
export async function fetchReviewQueue(params: FetchReviewQueueParams): Promise<FetchReviewQueueResult>
export async function submitReviewAction(params: SubmitReviewActionParams): Promise<Conversation>
export async function getQueueStatistics(): Promise<QueueStatistics>
export async function validateReviewAction(conversationId: string, action: string): Promise<ValidationResult>
```

**Task T-2.2.1: Create Quality Feedback Service Layer**
Create: `src/lib/services/quality-feedback-service.ts`

Service methods:
```typescript
export async function aggregateFeedbackByTemplate(timeWindow: string, minUsageCount: number): Promise<TemplateFeedbackAggregate[]>
export async function identifyLowPerformingTemplates(threshold: number): Promise<Template[]>
export async function getFeedbackTrends(): Promise<FeedbackTrends>
```

**ACCEPTANCE CRITERIA:**

1. **API Endpoints:**
   - [ ] GET /api/review/queue returns paginated conversations with status='pending_review'
   - [ ] Query parameters work correctly (page, limit, sortBy, sortOrder, minQuality)
   - [ ] Default sort prioritizes low quality score first, then oldest first
   - [ ] Response includes pagination metadata and queue statistics
   - [ ] POST /api/review/actions accepts review action and updates conversation
   - [ ] Action submission is atomic (all updates succeed or all fail)
   - [ ] ReviewAction appends to reviewHistory array without data loss
   - [ ] Conversation status updates correctly based on action type
   - [ ] User attribution works (approved_by linked to auth.users)
   - [ ] GET /api/review/feedback returns aggregated template performance
   - [ ] Approval rate calculation is accurate
   - [ ] Low-performing templates are correctly identified

2. **Service Layer:**
   - [ ] All service methods are type-safe with TypeScript interfaces
   - [ ] Error handling is comprehensive with typed error classes
   - [ ] Database queries use proper indexing
   - [ ] Transactions are properly committed or rolled back
   - [ ] Service methods are reusable across API routes

3. **Data Integrity:**
   - [ ] Concurrent review actions don't corrupt reviewHistory
   - [ ] Status transitions follow valid state machine
   - [ ] Foreign key constraints are enforced
   - [ ] Timestamps are accurate and timezone-aware
   - [ ] Audit trail is complete (no missing review actions)

4. **Performance:**
   - [ ] Review queue fetch completes in <500ms with 1000 conversations
   - [ ] Action submission completes in <200ms
   - [ ] Feedback aggregation completes in <1000ms
   - [ ] Database indexes are used (verify with EXPLAIN ANALYZE)

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
src/
  app/
    api/
      review/
        queue/
          route.ts          # GET /api/review/queue
        actions/
          route.ts          # POST /api/review/actions
        feedback/
          route.ts          # GET /api/review/feedback
  lib/
    services/
      review-queue-service.ts    # Business logic for review queue
      quality-feedback-service.ts # Business logic for feedback
    types/
      review.types.ts      # TypeScript interfaces for review domain
```

**Authentication Pattern:**
```typescript
import { createClient } from '@/lib/supabase';

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Use user.id for queries
}
```

**Error Handling Pattern:**
```typescript
try {
  const result = await someOperation();
  return NextResponse.json(result);
} catch (error) {
  console.error('Operation failed:', error);
  return NextResponse.json(
    { error: 'Operation failed', details: error.message },
    { status: 500 }
  );
}
```

**Transaction Pattern (using database function):**
```typescript
const { data, error } = await supabase.rpc('append_review_action', {
  p_conversation_id: conversationId,
  p_action: action,
  p_performed_by: user.id,
  p_comment: comment,
  p_reasons: reasons
});
```

**VALIDATION REQUIREMENTS:**

**Manual Testing:**
1. Test GET /api/review/queue with Postman/Insomnia:
   - No filters (should return all pending)
   - With minQuality filter (should filter correctly)
   - With pagination (page=2, limit=10)
   - Verify statistics are accurate
2. Test POST /api/review/actions:
   - Approve action (status should change to 'approved')
   - Reject action (status should change to 'rejected')
   - Request changes action (status should change to 'needs_revision')
   - Verify reviewHistory appends correctly
   - Test with invalid conversationId (should return 404)
3. Test GET /api/review/feedback:
   - With different time windows (7d, 30d, all)
   - Verify aggregation calculations
   - Check low-performing template flagging

**Database Verification:**
```sql
-- Verify reviewHistory structure
SELECT id, conversation_id, reviewHistory 
FROM conversations 
WHERE reviewHistory IS NOT NULL 
LIMIT 5;

-- Verify index usage
EXPLAIN ANALYZE 
SELECT * FROM conversations 
WHERE status = 'pending_review' 
ORDER BY quality_score ASC 
LIMIT 25;

-- Test append_review_action function
SELECT append_review_action(
  '<conversation-id>',
  'approved',
  '<user-id>',
  'Test comment',
  ARRAY['test_reason']
);
```

**Integration Testing:**
- Create test conversation with status 'pending_review'
- Submit review action via API
- Verify conversation status updated
- Verify reviewHistory contains new action
- Verify approved_by and approved_at populated
- Query review queue and verify conversation no longer appears

**DELIVERABLES:**

**Files to Create:**
1. `src/app/api/review/queue/route.ts` - Review queue GET endpoint
2. `src/app/api/review/actions/route.ts` - Review action POST endpoint
3. `src/app/api/review/feedback/route.ts` - Feedback aggregation GET endpoint
4. `src/lib/services/review-queue-service.ts` - Review queue business logic
5. `src/lib/services/quality-feedback-service.ts` - Feedback business logic
6. `src/lib/types/review.types.ts` - TypeScript interfaces for review domain

**Documentation to Update:**
- Add API endpoint documentation to README or API docs
- Document service layer methods with JSDoc comments
- Add usage examples for review actions

Implement all endpoints and services completely, ensuring proper error handling, authentication, and data validation. Follow existing codebase patterns for consistency.

++++++++++++++++++

---

### Prompt 2: Review Queue View Component
**Scope**: Implement frontend Review Queue View with table, filtering, and empty states  
**Dependencies**: Prompt 1 completed (API endpoints must exist)  
**Estimated Time**: 8-10 hours  
**Risk Level**: Medium (Complex state management and filtering)

========================

You are a senior frontend developer implementing the **Review Queue View Component** for the Train conversation generation platform.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
The Review Queue is a dedicated interface for reviewing conversations that require human approval before being included in training datasets. Reviewers need to efficiently process conversations, prioritizing low-quality items that need the most attention.

**Functional Requirements (FR6.1.1 - Review Queue Interface):**
- Display all conversations with status 'pending_review'
- Sort by quality score (lowest first) and creation date (oldest first)
- Filter by quality range and date range
- Show empty state when queue is empty ("All Caught Up!")
- Display conversation count and summary statistics
- Click conversation row to open review modal
- Support keyboard navigation

**User Experience Goals:**
- Clear visual hierarchy showing priority conversations first
- Fast filtering and sorting (<300ms)
- Intuitive empty state encouraging users
- Seamless integration with existing dashboard layout

**CURRENT CODEBASE STATE:**

**Existing Wireframe Component:**
Location: `train-wireframe/src/components/views/ReviewQueueView.tsx`
Current State: Stub/skeleton implementation exists with basic structure

**Existing Reusable Components:**
- `train-wireframe/src/components/dashboard/ConversationTable.tsx` - Table component with sorting
- `train-wireframe/src/components/dashboard/FilterBar.tsx` - Filter controls
- `train-wireframe/src/components/dashboard/Pagination.tsx` - Pagination controls
- `train-wireframe/src/components/layout/DashboardLayout.tsx` - Page layout wrapper
- `train-wireframe/src/components/ui/badge.tsx` - Status badges
- `train-wireframe/src/components/ui/button.tsx` - Action buttons

**State Management Pattern:**
Location: `train-wireframe/src/stores/useAppStore.ts`
```typescript
const useAppStore = create<AppStore>((set) => ({
  conversations: [],
  filterConfig: { status: [], tier: [], quality: [0, 10] },
  selectedConversationIds: [],
  setConversations: (conversations) => set({ conversations }),
  setFilterConfig: (config) => set({ filterConfig: config }),
  // ... other state methods
}));
```

**Existing Types:**
```typescript
// Conversation (train-wireframe/src/lib/types.ts:26-46)
interface Conversation {
  id: string;
  conversation_id: string;
  title: string;
  status: ConversationStatus;
  quality_score?: number;
  totalTurns: number;
  created_at: string;
  updated_at: string;
  reviewHistory?: ReviewAction[];
  // ... other fields
}

// ConversationStatus (line 5)
type ConversationStatus = 'pending_review' | 'approved' | 'rejected' | 'needs_revision' | ...

// QualityMetrics (lines 14-24)
interface QualityMetrics {
  overallScore: number;
  relevance: number;
  accuracy: number;
  naturalness: number;
  emotionalIntelligence: number;
  confidence: number;
  // ... other metrics
}
```

**IMPLEMENTATION TASKS:**

**Task T-3.1.1: Implement ReviewQueueView Base Component**
Update: `train-wireframe/src/components/views/ReviewQueueView.tsx`

Requirements:
1. **Data Fetching:**
   - Use React Query or SWR for data fetching (or useState + useEffect)
   - Fetch from `/api/review/queue` on component mount
   - Refresh every 30 seconds (auto-refresh)
   - Handle loading, error, and success states

2. **Filtering Logic:**
   - Filter conversations where status === 'pending_review'
   - Apply quality score range filter
   - Apply date range filter
   - Count total conversations in queue

3. **Component Structure:**
   ```tsx
   export function ReviewQueueView() {
     // State management
     const [conversations, setConversations] = useState<Conversation[]>([]);
     const [isLoading, setIsLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [statistics, setStatistics] = useState<QueueStatistics | null>(null);
     
     // Fetch review queue
     useEffect(() => {
       fetchReviewQueue();
       const interval = setInterval(fetchReviewQueue, 30000); // 30 seconds
       return () => clearInterval(interval);
     }, []);
     
     // Filter conversations
     const reviewQueue = useMemo(() => {
       return conversations.filter(c => c.status === 'pending_review');
     }, [conversations]);
     
     // Render logic
     if (isLoading) return <LoadingState />;
     if (error) return <ErrorState error={error} />;
     if (reviewQueue.length === 0) return <EmptyState />;
     
     return (
       <DashboardLayout>
         <ReviewQueueHeader statistics={statistics} />
         <ReviewQueueTable conversations={reviewQueue} />
         <Pagination />
       </DashboardLayout>
     );
   }
   ```

**Task T-3.1.2: Implement Review Queue Header**
Create: `train-wireframe/src/components/review/ReviewQueueHeader.tsx`

Requirements:
- Display page title: "Review Queue"
- Show conversation count: "{count} conversation(s) awaiting review"
- Display queue statistics:
  - Total pending
  - Average quality score
  - Oldest pending date
- Refresh button to manually reload
- Filter controls toggle

Component Structure:
```tsx
interface ReviewQueueHeaderProps {
  statistics: {
    totalPending: number;
    averageQuality: number;
    oldestPendingDate: string;
  };
  onRefresh: () => void;
}

export function ReviewQueueHeader({ statistics, onRefresh }: ReviewQueueHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">Review Queue</h1>
        <p className="text-muted-foreground">
          {statistics.totalPending} conversation(s) awaiting review
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <span className="text-muted-foreground">Avg Quality: </span>
          <Badge variant={getQualityVariant(statistics.averageQuality)}>
            {statistics.averageQuality.toFixed(1)}
          </Badge>
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  );
}
```

**Task T-3.1.3: Implement Empty State**
Create: `train-wireframe/src/components/review/ReviewQueueEmptyState.tsx`

Requirements:
- Display when reviewQueue.length === 0
- Show CheckCircle icon (success indicator)
- Display message: "All Caught Up!"
- Subtitle: "There are no conversations pending review at this time."
- Helpful tip: "New conversations will appear here when generation completes."
- Link to dashboard or generation page

Code Reference (existing pattern):
```tsx
// From train-wireframe/src/components/dashboard/DashboardView.tsx:71-90
if (conversations.length === 0) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
      <p className="text-muted-foreground mb-4">
        Click Generate All to get started
      </p>
    </div>
  );
}
```

Implement similar pattern but with:
```tsx
export function ReviewQueueEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">All Caught Up!</h2>
      <p className="text-muted-foreground mb-2">
        There are no conversations pending review at this time.
      </p>
      <p className="text-sm text-muted-foreground mb-6">
        New conversations will appear here when generation completes.
      </p>
      <Button variant="outline" asChild>
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
    </div>
  );
}
```

**Task T-3.1.4: Implement Review Queue Table**
Update: Reuse `train-wireframe/src/components/dashboard/ConversationTable.tsx` with custom configuration

Requirements:
- Display columns: ID, Title, Tier, Quality Score, Created Date, Priority, Actions
- Quality score with color coding:
  - Red (<6): `text-red-600 bg-red-50`
  - Yellow (6-7): `text-yellow-600 bg-yellow-50`
  - Green (8-10): `text-green-600 bg-green-50`
- Priority indicator (calculated):
  - High: quality < 5 OR created > 7 days ago
  - Medium: quality 5-7 OR created 3-7 days ago
  - Low: quality > 7 AND created < 3 days ago
- Row click handler to open review modal
- "Review" button in actions column

Table Configuration:
```tsx
<ConversationTable
  conversations={reviewQueue}
  columns={[
    { key: 'conversation_id', label: 'ID', sortable: true },
    { key: 'title', label: 'Title', sortable: false },
    { key: 'tier', label: 'Tier', sortable: true },
    { 
      key: 'quality_score', 
      label: 'Quality', 
      sortable: true,
      render: (conversation) => (
        <QualityScoreBadge score={conversation.quality_score} />
      )
    },
    { key: 'created_at', label: 'Created', sortable: true },
    {
      key: 'priority',
      label: 'Priority',
      sortable: false,
      render: (conversation) => (
        <PriorityBadge conversation={conversation} />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (conversation) => (
        <Button 
          size="sm" 
          onClick={() => openReviewModal(conversation.id)}
        >
          Review
        </Button>
      )
    }
  ]}
  onRowClick={(conversation) => openReviewModal(conversation.id)}
  defaultSort={{ key: 'quality_score', order: 'asc' }}
/>
```

**Task T-3.1.5: Implement Helper Components**
Create: `train-wireframe/src/components/review/ReviewQueueHelpers.tsx`

QualityScoreBadge:
```tsx
export function QualityScoreBadge({ score }: { score?: number }) {
  if (!score) return <span className="text-muted-foreground">N/A</span>;
  
  const variant = score >= 8 ? 'success' : score >= 6 ? 'warning' : 'destructive';
  const colorClass = score >= 8 ? 'bg-green-50 text-green-700' :
                      score >= 6 ? 'bg-yellow-50 text-yellow-700' :
                      'bg-red-50 text-red-700';
  
  return (
    <Badge className={colorClass}>
      {score.toFixed(1)}
    </Badge>
  );
}
```

PriorityBadge:
```tsx
export function PriorityBadge({ conversation }: { conversation: Conversation }) {
  const daysOld = differenceInDays(new Date(), new Date(conversation.created_at));
  const score = conversation.quality_score || 5;
  
  const priority = score < 5 || daysOld > 7 ? 'high' :
                   (score >= 5 && score < 7) || (daysOld >= 3 && daysOld <= 7) ? 'medium' : 
                   'low';
  
  const label = priority === 'high' ? 'High' : priority === 'medium' ? 'Medium' : 'Low';
  const variant = priority === 'high' ? 'destructive' : priority === 'medium' ? 'warning' : 'default';
  
  return <Badge variant={variant}>{label}</Badge>;
}
```

**ACCEPTANCE CRITERIA:**

1. **Data Fetching:**
   - [ ] Review queue loads on component mount
   - [ ] Loading state shows skeleton/spinner
   - [ ] Error state displays user-friendly message with retry
   - [ ] Data refreshes automatically every 30 seconds
   - [ ] Manual refresh button works
   - [ ] Conversations filtered correctly (only pending_review)

2. **UI Components:**
   - [ ] Empty state displays when queue is empty
   - [ ] Empty state shows CheckCircle icon and encouraging message
   - [ ] Header displays conversation count and statistics
   - [ ] Table displays all required columns
   - [ ] Quality score badges use correct color coding
   - [ ] Priority badges calculate correctly
   - [ ] Review button in actions column

3. **Interactions:**
   - [ ] Click conversation row opens review modal (placeholder for now)
   - [ ] Click Review button opens review modal
   - [ ] Refresh button reloads data
   - [ ] Sorting works (click column headers)
   - [ ] Hover states on table rows

4. **Performance:**
   - [ ] Component renders in <200ms
   - [ ] Table sorting completes in <100ms
   - [ ] Auto-refresh doesn't cause UI flicker
   - [ ] Handles 100+ conversations without lag

5. **Responsive Design:**
   - [ ] Layout works on 1920x1080 and 1366x768
   - [ ] Table columns adjust appropriately
   - [ ] Mobile breakpoint stacks content (optional)

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
train-wireframe/
  src/
    components/
      views/
        ReviewQueueView.tsx         # Main view component (UPDATE)
      review/
        ReviewQueueHeader.tsx        # NEW - Header with stats
        ReviewQueueEmptyState.tsx    # NEW - Empty state
        ReviewQueueHelpers.tsx       # NEW - Badge components
```

**API Integration:**
```typescript
async function fetchReviewQueue(params?: {
  page?: number;
  limit?: number;
  minQuality?: number;
}) {
  const searchParams = new URLSearchParams({
    page: String(params?.page || 1),
    limit: String(params?.limit || 25),
    ...(params?.minQuality && { minQuality: String(params.minQuality) })
  });
  
  const response = await fetch(`/api/review/queue?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch review queue');
  
  return response.json();
}
```

**State Management:**
```typescript
// Use React state for component-local data
const [conversations, setConversations] = useState<Conversation[]>([]);
const [statistics, setStatistics] = useState<QueueStatistics>({
  totalPending: 0,
  averageQuality: 0,
  oldestPendingDate: ''
});
const [isLoading, setIsLoading] = useState(true);

// Or use Zustand store if you want global state
const { setConversations } = useAppStore();
```

**Styling Guidelines:**
- Use Tailwind CSS utility classes
- Follow existing component styling patterns
- Maintain consistent spacing (gap-4, py-6, etc.)
- Use Shadcn/UI components (Badge, Button, Card)
- Color palette:
  - Green (success): `bg-green-50 text-green-700 border-green-200`
  - Yellow (warning): `bg-yellow-50 text-yellow-700 border-yellow-200`
  - Red (destructive): `bg-red-50 text-red-700 border-red-200`

**Error Handling:**
```typescript
try {
  const data = await fetchReviewQueue();
  setConversations(data.data);
  setStatistics(data.statistics);
} catch (error) {
  console.error('Failed to fetch review queue:', error);
  toast.error('Failed to load review queue. Please try again.');
  setError(error.message);
}
```

**VALIDATION REQUIREMENTS:**

**Visual Testing:**
1. Empty State:
   - Navigate to review queue with no pending conversations
   - Verify CheckCircle icon displays
   - Verify "All Caught Up!" message appears
   - Click "Back to Dashboard" link

2. Populated Queue:
   - Create test conversations with status='pending_review'
   - Verify they appear in table
   - Verify quality score colors (create conversations with scores 4, 6.5, 9)
   - Verify priority badges (vary quality scores and dates)

3. Auto-Refresh:
   - Open review queue
   - Update conversation status in database
   - Wait 30 seconds
   - Verify table updates

4. Manual Refresh:
   - Click refresh button
   - Verify loading indicator shows briefly
   - Verify data updates

**Functional Testing:**
1. Click conversation row -> verify modal opens (stub for now: console.log)
2. Click Review button -> verify modal opens
3. Sort by quality score -> verify ascending order (lowest first)
4. Sort by created date -> verify oldest first
5. Verify hover states on table rows

**Performance Testing:**
- Render with 100 conversations and measure time
- Test auto-refresh performance (should not cause flicker)
- Verify sorting is instant (<100ms)

**DELIVERABLES:**

**Files to Create:**
1. `train-wireframe/src/components/review/ReviewQueueHeader.tsx`
2. `train-wireframe/src/components/review/ReviewQueueEmptyState.tsx`
3. `train-wireframe/src/components/review/ReviewQueueHelpers.tsx` (QualityScoreBadge, PriorityBadge)

**Files to Update:**
1. `train-wireframe/src/components/views/ReviewQueueView.tsx` (complete implementation)

**Dependencies to Install (if needed):**
```bash
npm install date-fns  # For date calculations
```

Implement the complete Review Queue View with all required components, ensuring proper data fetching, error handling, and user experience. Follow existing component patterns and styling conventions.

++++++++++++++++++

---

### Prompt 3: Conversation Review Modal with Side-by-Side Layout
**Scope**: Implement conversation review modal with turn display, source context, and review actions  
**Dependencies**: Prompt 1 & 2 completed (API and Queue View must exist)  
**Estimated Time**: 10-12 hours  
**Risk Level**: High (Complex layout, action orchestration, state management)

========================

You are a senior full-stack developer implementing the **Conversation Review Modal** - the core interface for reviewing and approving AI-generated conversations in the Train platform. This is the most complex component in the review workflow, requiring careful attention to layout, state management, and user experience.

**CONTEXT AND REQUIREMENTS:**

The Review Modal is where quality control happens. Reviewers see the full conversation alongside its source chunk context, assess quality, and take actions (Approve, Reject, Request Changes). This workflow must handle:
- Complex two-panel layout with independent scroll areas
- Keyboard shortcuts for rapid workflow (A, R, C, N, P, ESC)
- Optimistic UI updates with rollback capability
- Validation and error handling
- Navigation between conversations

Implement this as a comprehensive, production-ready component following existing Shadcn/UI patterns. Due to complexity, this summary references the key requirements - implement full functionality including all sub-components (ConversationDisplayPanel, ReviewActionControls, SourceChunkContext, ReviewHistoryPanel).

**DELIVERABLES:**

**Files to Create:**
1. `train-wireframe/src/components/review/ConversationReviewModal.tsx` - Main modal with layout and orchestration
2. `train-wireframe/src/components/review/ConversationDisplayPanel.tsx` - Turn-by-turn display with formatting
3. `train-wireframe/src/components/review/ReviewActionControls.tsx` - Action buttons, comment input, reason checkboxes
4. `train-wireframe/src/components/review/SourceChunkContext.tsx` - Source chunk display card
5. `train-wireframe/src/components/review/ReviewHistoryPanel.tsx` - Review history timeline

**Key Implementation Requirements:**
- Two-panel grid layout (60% conversation, 40% context)
- Keyboard shortcut handler with focus detection
- API integration for conversation fetch and action submission
- Optimistic updates with rollback
- Validation (required comments for Reject/Changes)
- Confirmation dialog for destructive actions
- Toast notifications for feedback

Refer to FR6.1.1 acceptance criteria and existing modal patterns in codebase.

++++++++++++++++++

---

### Prompt 4: Keyboard Shortcuts System & Bulk Review Actions
**Scope**: Implement global keyboard shortcuts and bulk review capabilities  
**Dependencies**: Prompts 1-3 completed (Modal must exist for shortcuts)  
**Estimated Time**: 4-6 hours  
**Risk Level**: Low (Enhancement to existing functionality)

========================

You are a senior frontend developer implementing **Keyboard Shortcuts and Bulk Review Actions** to enhance the review workflow efficiency in the Train platform.

**CONTEXT AND REQUIREMENTS:**

Power users reviewing hundreds of conversations need rapid workflow tools. Keyboard shortcuts enable reviewers to process 20-30 conversations per hour instead of 10-15. Bulk actions allow applying the same decision to multiple conversations simultaneously.

**Functional Requirements (FR6.1.1):**
- Keyboard shortcuts: A (approve), R (reject), C (request changes), N (next), P (previous), ESC (close)
- Shortcuts disabled when input fields focused
- Help dialog accessible via ? key showing all shortcuts
- User-configurable shortcuts in preferences
- Bulk selection with checkboxes in review queue
- Bulk approve/reject actions with confirmation
- Success feedback showing count: "12 conversations approved"

**IMPLEMENTATION TASKS:**

**Task T-4.1.1: Implement useKeyboardShortcuts Hook**
Create: `train-wireframe/src/hooks/useKeyboardShortcuts.ts`

Custom React hook for registering and managing keyboard shortcuts:
```typescript
interface ShortcutConfig {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(
  shortcuts: ShortcutConfig,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      
      const key = e.key.toLowerCase();
      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}
```

**Task T-4.1.2: Integrate Shortcuts in Review Modal**
Update: `train-wireframe/src/components/review/ConversationReviewModal.tsx`

Add keyboard shortcut configuration:
```typescript
const shortcuts = {
  'a': handleApprove,
  'r': handleReject,
  'c': handleRequestChanges,
  'n': handleNext,
  'p': handlePrevious,
  'escape': onClose
};

useKeyboardShortcuts(shortcuts, isOpen);
```

**Task T-4.2.1: Implement Bulk Review Actions**
Update: `train-wireframe/src/components/views/ReviewQueueView.tsx`

Add bulk selection and actions:
```typescript
const [selectedIds, setSelectedIds] = useState<string[]>([]);

const handleBulkApprove = async () => {
  const confirmed = confirm(`Approve ${selectedIds.length} conversations?`);
  if (!confirmed) return;
  
  try {
    await Promise.all(
      selectedIds.map(id => submitReviewAction({ conversationId: id, action: 'approved' }))
    );
    toast.success(`${selectedIds.length} conversations approved`);
    setSelectedIds([]);
    refreshQueue();
  } catch (error) {
    toast.error('Bulk approve failed. Some conversations may have been approved.');
  }
};
```

**Task T-4.3.1: Create Keyboard Shortcuts Help Dialog**
Create: `train-wireframe/src/components/review/KeyboardShortcutsHelp.tsx`

Dialog showing all available shortcuts:
```typescript
export function KeyboardShortcutsHelp({ isOpen, onClose }: DialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ShortcutRow shortcut="A" description="Approve conversation" />
          <ShortcutRow shortcut="R" description="Reject conversation" />
          <ShortcutRow shortcut="C" description="Request changes" />
          <ShortcutRow shortcut="N" description="Next conversation" />
          <ShortcutRow shortcut="P" description="Previous conversation" />
          <ShortcutRow shortcut="ESC" description="Close modal" />
          <ShortcutRow shortcut="?" description="Show this help" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**ACCEPTANCE CRITERIA:**
- [ ] Keyboard shortcuts work in review modal
- [ ] Shortcuts disabled when typing in inputs
- [ ] Help dialog accessible via ? key
- [ ] Bulk selection checkboxes in review queue table
- [ ] Bulk approve/reject actions work correctly
- [ ] Confirmation dialogs for bulk destructive actions
- [ ] Success toast shows count of affected conversations
- [ ] Failed bulk operations show partial success count

**DELIVERABLES:**
1. `train-wireframe/src/hooks/useKeyboardShortcuts.ts`
2. `train-wireframe/src/components/review/KeyboardShortcutsHelp.tsx`
3. Update `train-wireframe/src/components/views/ReviewQueueView.tsx` (bulk actions)
4. Update `train-wireframe/src/components/review/ConversationReviewModal.tsx` (shortcuts)

++++++++++++++++++

---

### Prompt 5: Quality Feedback Dashboard Widget
**Scope**: Implement quality feedback analytics and template performance tracking  
**Dependencies**: Prompt 1 completed (Feedback API must exist)  
**Estimated Time**: 4-6 hours  
**Risk Level**: Low (Read-only analytics component)

========================

You are a senior frontend developer implementing the **Quality Feedback Dashboard** for tracking template performance and identifying areas for improvement in the Train platform.

**CONTEXT AND REQUIREMENTS:**

The feedback loop closes the quality circle: reviewers provide feedback through their actions, which aggregates into template performance metrics. This enables continuous improvement by identifying which templates produce high-quality conversations and which need revision.

**Functional Requirements (FR6.1.2 - Quality Feedback Loop):**
- Aggregate feedback by template (approval rate, avg quality score, usage count)
- Identify low-performing templates (approval rate < 70%)
- Display feedback trends over time (7 days, 30 days, all time)
- Categorize feedback: Content Accuracy, Emotional Intelligence, Turn Quality, Format Issues
- Provide actionable recommendations

**IMPLEMENTATION TASKS:**

**Task T-5.1.1: Implement Template Performance Table**
Create: `train-wireframe/src/components/feedback/TemplatePerformanceTable.tsx`

Sortable table showing template metrics:
```typescript
interface TemplatePerformance {
  template_id: string;
  template_name: string;
  tier: string;
  usage_count: number;
  avg_quality: number;
  approval_rate: number;
  performance: 'high' | 'medium' | 'low';
}

export function TemplatePerformanceTable({ timeWindow }: { timeWindow: string }) {
  const [templates, setTemplates] = useState<TemplatePerformance[]>([]);
  
  useEffect(() => {
    fetchTemplateFeedback(timeWindow).then(setTemplates);
  }, [timeWindow]);
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Template</TableHead>
          <TableHead>Tier</TableHead>
          <TableHead>Usage</TableHead>
          <TableHead>Avg Quality</TableHead>
          <TableHead>Approval Rate</TableHead>
          <TableHead>Performance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.map(t => (
          <TableRow key={t.template_id}>
            <TableCell>{t.template_name}</TableCell>
            <TableCell><Badge>{t.tier}</Badge></TableCell>
            <TableCell>{t.usage_count}</TableCell>
            <TableCell><QualityBadge score={t.avg_quality} /></TableCell>
            <TableCell>{t.approval_rate.toFixed(1)}%</TableCell>
            <TableCell><PerformanceBadge level={t.performance} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

**Task T-5.1.2: Implement Feedback Dashboard View**
Create: `train-wireframe/src/components/views/QualityFeedbackView.tsx`

Dashboard with:
- Time window selector (7d, 30d, all)
- Template performance table
- Summary statistics card
- Low-performing templates alert
- Recommendations section

**Task T-5.2.1: Create Feedback Analytics Widget**
Create: `train-wireframe/src/components/dashboard/FeedbackWidget.tsx`

Dashboard widget showing:
- Overall approval rate
- Templates flagged for revision (count)
- Quality trend (up/down/stable)
- Quick link to full feedback dashboard

**ACCEPTANCE CRITERIA:**
- [ ] Template performance table displays all templates
- [ ] Sorting by usage, quality, approval rate works
- [ ] Low-performing templates flagged visually
- [ ] Time window selector filters correctly
- [ ] Summary statistics accurate
- [ ] Recommendations section provides actionable advice
- [ ] Dashboard widget integrates into main dashboard
- [ ] Data refreshes on navigation

**DELIVERABLES:**
1. `train-wireframe/src/components/feedback/TemplatePerformanceTable.tsx`
2. `train-wireframe/src/components/views/QualityFeedbackView.tsx`
3. `train-wireframe/src/components/dashboard/FeedbackWidget.tsx`

++++++++++++++++++

---

## Quality Validation Checklist

### Post-Implementation Verification

**Database Integrity:**
- [ ] reviewHistory column exists and accepts JSONB arrays
- [ ] append_review_action function works correctly
- [ ] Partial index on pending_review status improves query performance
- [ ] Concurrent review actions don't corrupt data
- [ ] All foreign key constraints enforced

**API Endpoints:**
- [ ] GET /api/review/queue returns paginated conversations
- [ ] POST /api/review/actions updates conversation and reviewHistory
- [ ] GET /api/review/feedback aggregates template performance
- [ ] All endpoints require authentication
- [ ] Error responses use consistent format
- [ ] Response times meet performance targets (<500ms)

**Frontend Components:**
- [ ] Review Queue View displays pending conversations
- [ ] Empty state shows when queue is empty
- [ ] Quality score and priority badges color-coded correctly
- [ ] Conversation Review Modal opens and displays correctly
- [ ] Two-panel layout works on desktop resolutions
- [ ] Keyboard shortcuts function properly
- [ ] Review actions submit successfully
- [ ] Optimistic updates work with rollback

**User Experience:**
- [ ] Loading states display during async operations
- [ ] Error messages are user-friendly
- [ ] Success toast notifications provide clear feedback
- [ ] Auto-refresh works without UI flicker
- [ ] Modal closes after successful action
- [ ] Bulk actions process correctly with progress indication

**Performance:**
- [ ] Review queue loads in <500ms with 100 conversations
- [ ] Modal opens in <500ms
- [ ] Action submission completes in <200ms
- [ ] Auto-refresh doesn't degrade performance
- [ ] Database queries use indexes (verify with EXPLAIN)

### Cross-Prompt Consistency

**Naming Conventions:**
- [ ] Consistent component naming (PascalCase for components, camelCase for functions)
- [ ] Consistent file structure across all new files
- [ ] Consistent prop naming and typing

**Architectural Patterns:**
- [ ] All components follow Shadcn/UI patterns
- [ ] State management consistent (Zustand or local state)
- [ ] API integration patterns consistent
- [ ] Error handling consistent across components

**Data Models:**
- [ ] ReviewAction type used consistently
- [ ] ConversationStatus transitions validated
- [ ] Quality score ranges consistent (0-10)
- [ ] Timestamp formats consistent (ISO 8601)

**Integrated User Experience:**
- [ ] Review workflow flows smoothly from queue to modal to action
- [ ] Navigation (Previous/Next) works seamlessly
- [ ] Keyboard shortcuts don't conflict with browser shortcuts
- [ ] Toast notifications use consistent styling and timing
- [ ] Color coding (quality badges) consistent across all views

---

## Next Segment Preparation

**For E07 (if continuation needed):**

This segment completes the core Review Queue and Quality Feedback Loop functionality (FR6.1). Future segments could implement:

1. **Advanced Analytics** (FR6.2 if exists):
   - Detailed quality trend charts
   - Reviewer performance metrics
   - Inter-rater reliability analysis
   - Export analytics as CSV/PDF

2. **Review Workflow Enhancements**:
   - Collaborative review (multiple reviewers per conversation)
   - Review assignments and workload distribution
   - Review SLA tracking (time to review)
   - Advanced filtering (regex search, custom queries)

3. **Template Optimization**:
   - A/B testing framework for templates
   - Automated template suggestions based on feedback
   - Template version comparison
   - Template recommendation engine

**Dependencies for Next Segment:**
- This segment (E06) must be fully tested and deployed
- User feedback collected from initial usage
- Performance metrics validated with production load
- Any critical bugs fixed before proceeding

**Handoff Information:**
- All 5 prompts completed
- Database schema changes deployed
- API endpoints tested and documented
- UI components integrated into main application
- Quality validation checklist completed

---

## Document Metadata

**Generated**: 2025-01-29  
**Segment**: E06 - Review Queue & Quality Feedback Loop  
**Total Prompts**: 5  
**Estimated Total Implementation Time**: 32-40 hours  
**Total Files Created**: 15  
**Total Files Updated**: 3  

**Prompt Summary:**
1. **Prompt 1** (6-8h): Database schema, API endpoints, service layer
2. **Prompt 2** (8-10h): Review Queue View with table, filtering, empty states
3. **Prompt 3** (10-12h): Conversation Review Modal with side-by-side layout
4. **Prompt 4** (4-6h): Keyboard shortcuts system and bulk actions
5. **Prompt 5** (4-6h): Quality feedback dashboard and template analytics

**Risk Mitigation Complete:**
- Database transaction handling specified
- Concurrent update protection documented
- Keyboard shortcut conflicts addressed
- Performance optimization strategies defined
- Error recovery procedures outlined

**Quality Assurance:**
- Comprehensive acceptance criteria for each prompt
- Validation steps specified
- Performance benchmarks defined
- Cross-prompt consistency checks included

---

**Implementation Ready**: This document provides complete, executable instructions for implementing FR6.1 Review Queue & Quality Feedback Loop in 5 strategic prompts. Each prompt is self-contained, includes all necessary context, and follows existing codebase patterns for seamless integration.

