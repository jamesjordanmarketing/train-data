# Train - Review & Quality Control Feature Task Inventory (Generated 2025-01-29)

**Product Module**: Interactive LoRA Conversation Generation Platform  
**Feature Scope**: FR6.1 - Review Queue & Quality Feedback Loop  
**Source FR Document**: `04-train-FR-wireframes-E06.md`  
**Wireframe Implementation**: `train-wireframe/src`  
**Target Production App**: Live data integration with full backend  

---

## Executive Summary

This task inventory provides the complete development roadmap for implementing the Review Queue and Quality Feedback Loop (FR6.1) from the wireframe prototype into a production-ready feature with live data integration. The scope covers:

- **FR6.1.1**: Review Queue Interface - Dedicated conversation review workflow
- **FR6.1.2**: Quality Feedback Loop - Template performance tracking and improvement

**Task Complexity**: 82 total tasks across 6 major categories  
**Estimated Timeline**: 6-8 weeks (2 engineers)  
**Key Dependencies**: Database schema (conversations, review actions), Claude API integration, Supabase backend

---

## 1. Foundation & Infrastructure

### T-1.1.0: Review Queue Database Schema
- **FR Reference**: FR6.1.1
- **Impact Weighting**: System Architecture / Data Integrity
- **Implementation Location**: Database migrations, Supabase schema
- **Pattern**: Normalized relational schema with audit trail
- **Dependencies**: None (foundation task)
- **Estimated Human Work Hours**: 12-16 hours
- **Description**: Implement database tables and relationships to support review queue functionality, including conversation status management, review actions, and audit logging
- **Testing Tools**: Supabase Studio, SQL queries, Jest for schema validation
- **Test Coverage Requirements**: 100% schema validation, all foreign keys tested
- **Completes Component?**: Yes - provides data foundation for all review features

**Functional Requirements Acceptance Criteria**:
- Conversations table must include status field with constraint: 'draft' | 'generated' | 'pending_review' | 'approved' | 'rejected' | 'needs_revision' | 'failed'
- ReviewHistory field must be JSONB array type storing ReviewAction objects with schema validation
- ReviewAction type must include: id (uuid), action (enum), performedBy (uuid FK to users), timestamp, comment (text), reasons (text[])
- Quality metrics must be stored as nested JSONB with overall score, component scores, and confidence level
- Indexes must exist on: status, quality_score, created_at, updated_at for efficient queue queries
- Partial index on (status = 'pending_review') must optimize review queue filtering
- Row Level Security (RLS) policies must enforce multi-tenant data isolation
- Database triggers must auto-update updated_at timestamp on conversation modifications
- Migration must include rollback script for safe deployment
- Schema must support concurrent updates without race conditions using optimistic locking

#### T-1.1.1: Create Review Actions Schema
- **FR Reference**: FR6.1.1
- **Parent Task**: T-1.1.0
- **Implementation Location**: `supabase/migrations/TIMESTAMP_review_actions.sql`
- **Pattern**: Event sourcing pattern for audit trail
- **Dependencies**: Conversations table exists
- **Estimated Human Work Hours**: 4-6 hours
- **Description**: Design and implement schema for storing review actions as immutable audit log entries linked to conversations

**Components/Elements**:
- [T-1.1.1:ELE-1] ReviewAction JSONB Schema: Define TypeScript type and JSON schema validator
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:48-55` (ReviewAction type)
  - Database Location: reviewHistory column in conversations table
- [T-1.1.1:ELE-2] Action Type Enum: Create database enum for valid action types
  - Values: 'approved' | 'rejected' | 'revision_requested' | 'generated' | 'moved_to_review'
  - Code Location: `train-wireframe/src/lib/types.ts:50`
- [T-1.1.1:ELE-3] User Reference FK: Foreign key to auth.users for performer tracking
  - Column: performedBy UUID NOT NULL
  - Code Location: `train-wireframe/src/lib/types.ts:51`
- [T-1.1.1:ELE-4] Timestamp Tracking: Auto-generated timestamp for each action
  - Column: timestamp TIMESTAMPTZ DEFAULT NOW()
  - Code Location: `train-wireframe/src/lib/types.ts:52`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define ReviewAction TypeScript interface (implements ELE-1)
   - [PREP-2] Create JSON schema validator using Zod or Yup (validates ELE-1)
   - [PREP-3] Document action type meanings and usage guidelines (defines ELE-2)
2. Implementation Phase:
   - [IMP-1] Create migration file with reviewHistory JSONB column (implements ELE-1)
   - [IMP-2] Add CHECK constraint for valid action types in JSONB (implements ELE-2)
   - [IMP-3] Create GIN index on reviewHistory for efficient querying (optimizes ELE-1)
   - [IMP-4] Implement helper function to append review actions (uses ELE-1, ELE-2, ELE-3, ELE-4)
3. Validation Phase:
   - [VAL-1] Test action insertion with valid and invalid data (validates ELE-1, ELE-2)
   - [VAL-2] Verify foreign key enforcement for user references (validates ELE-3)
   - [VAL-3] Confirm timestamp auto-generation (validates ELE-4)
   - [VAL-4] Test concurrent action appends (validates ELE-1 integrity)

#### T-1.1.2: Implement Quality Metrics Schema
- **FR Reference**: FR6.1.1, FR6.1.2
- **Parent Task**: T-1.1.0
- **Implementation Location**: `supabase/migrations/TIMESTAMP_quality_metrics.sql`
- **Pattern**: Structured JSONB with typed schema
- **Dependencies**: Conversations table exists
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Define structured quality metrics storage supporting component-level scoring and aggregate calculations

**Components/Elements**:
- [T-1.1.2:ELE-1] QualityMetrics Type: Structured type for quality assessment
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:14-24` (QualityMetrics type)
- [T-1.1.2:ELE-2] Component Scores: Individual metric scores (relevance, accuracy, naturalness, etc.)
  - Code Location: `train-wireframe/src/lib/types.ts:16-20`
- [T-1.1.2:ELE-3] Overall Score: Calculated aggregate quality score 0-10
  - Code Location: `train-wireframe/src/lib/types.ts:15`, `train-wireframe/src/lib/types.ts:34` (qualityScore)
- [T-1.1.2:ELE-4] Confidence Level: Classification of score reliability (high/medium/low)
  - Code Location: `train-wireframe/src/lib/types.ts:21`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define QualityMetrics TypeScript interface (defines ELE-1)
   - [PREP-2] Document scoring methodology for each component (defines ELE-2)
   - [PREP-3] Create calculation function for overall score from components (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Add qualityMetrics JSONB column to conversations table (implements ELE-1)
   - [IMP-2] Add qualityScore computed column as overall score cache (implements ELE-3)
   - [IMP-3] Create database function to calculate overall score (implements ELE-3)
   - [IMP-4] Add CHECK constraint for score ranges 0-10 (validates ELE-2, ELE-3)
   - [IMP-5] Create btree index on qualityScore for sorting (optimizes ELE-3)
3. Validation Phase:
   - [VAL-1] Test quality metrics insertion with valid data (validates ELE-1)
   - [VAL-2] Verify overall score calculation accuracy (validates ELE-3)
   - [VAL-3] Test confidence level classification (validates ELE-4)
   - [VAL-4] Validate score range constraints (validates ELE-2, ELE-3)

#### T-1.1.3: Create Review Queue Indexes
- **FR Reference**: FR6.1.1
- **Parent Task**: T-1.1.0
- **Implementation Location**: `supabase/migrations/TIMESTAMP_review_indexes.sql`
- **Pattern**: Optimized indexing strategy for common queries
- **Dependencies**: T-1.1.1, T-1.1.2 (schema must exist)
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Implement database indexes to optimize review queue queries, filtering, and sorting operations

**Components/Elements**:
- [T-1.1.3:ELE-1] Status Index: Partial index on pending_review status
  - SQL: `CREATE INDEX idx_conversations_pending_review ON conversations(status) WHERE status = 'pending_review'`
- [T-1.1.3:ELE-2] Quality Score Index: Btree index for sorting by quality
  - SQL: `CREATE INDEX idx_conversations_quality_score ON conversations(quality_score DESC)`
- [T-1.1.3:ELE-3] Created Date Index: Index for chronological ordering
  - SQL: `CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC)`
- [T-1.1.3:ELE-4] Composite Filter Index: Multi-column index for common filter combinations
  - SQL: `CREATE INDEX idx_conversations_review_filters ON conversations(status, quality_score, created_at DESC)`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Analyze review queue query patterns (identifies index needs for ELE-1, ELE-2, ELE-3, ELE-4)
   - [PREP-2] Calculate expected index sizes and costs (validates ELE-1, ELE-2, ELE-3, ELE-4)
2. Implementation Phase:
   - [IMP-1] Create partial index for pending review filtering (implements ELE-1)
   - [IMP-2] Create quality score index for sorting (implements ELE-2)
   - [IMP-3] Create created_at index for default sort (implements ELE-3)
   - [IMP-4] Create composite index for multi-filter queries (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Run EXPLAIN ANALYZE on review queue queries (validates ELE-1, ELE-2, ELE-3, ELE-4 usage)
   - [VAL-2] Measure query performance before/after indexes (validates optimization)
   - [VAL-3] Monitor index bloat and maintenance needs (validates ELE-1, ELE-2, ELE-3, ELE-4)

### T-1.2.0: Review API Endpoints
- **FR Reference**: FR6.1.1, FR6.1.2
- **Impact Weighting**: Core Functionality / Integration
- **Implementation Location**: `src/app/api/review/`, Next.js API routes
- **Pattern**: RESTful API with type-safe request/response
- **Dependencies**: T-1.1.0 (database schema complete)
- **Estimated Human Work Hours**: 20-24 hours
- **Description**: Implement backend API endpoints for review queue operations, action submission, and feedback collection
- **Testing Tools**: Jest, Supertest, Postman/Insomnia for manual testing
- **Test Coverage Requirements**: 90%+ endpoint coverage, all error cases tested
- **Completes Component?**: Yes - provides full backend API for review features

**Functional Requirements Acceptance Criteria**:
- GET /api/review/queue endpoint must return paginated conversations with status 'pending_review'
- Query parameters must support: page, limit, sortBy (quality_score | created_at), sortOrder (asc | desc)
- Response must include: conversations array, pagination metadata (total, page, pages), queue statistics
- POST /api/review/actions endpoint must accept review action and append to conversation reviewHistory
- Request body must validate: conversationId, action, comment (optional), reasons (optional)
- Action submission must atomically: update conversation status, append review action, log to audit table
- GET /api/review/feedback endpoint must return aggregated feedback by template
- Response must include: template metrics, approval rates, common rejection reasons, quality trends
- All endpoints must enforce authentication and authorization via Supabase RLS
- Error responses must use consistent format: { error: string, code: string, details: object }
- Rate limiting must be implemented: 100 requests/minute per user
- All mutations must use database transactions for atomicity
- API responses must include proper caching headers (ETag, Cache-Control)
- CORS must be configured for allowed origins only

#### T-1.2.1: Implement Review Queue API
- **FR Reference**: FR6.1.1
- **Parent Task**: T-1.2.0
- **Implementation Location**: `src/app/api/review/queue/route.ts`
- **Pattern**: Paginated list endpoint with filtering
- **Dependencies**: T-1.1.0 (database schema)
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Create API endpoint to fetch review queue with sorting, filtering, and pagination

**Components/Elements**:
- [T-1.2.1:ELE-1] Query Parameter Parsing: Extract and validate query params
  - Parameters: page, limit, sortBy, sortOrder, minQuality
  - Code Location: Request query params in Next.js route handler
- [T-1.2.1:ELE-2] Database Query Builder: Construct Supabase query with filters
  - Query: SELECT from conversations WHERE status = 'pending_review'
  - Code Reference pattern: `src/lib/database.ts:6-10` (query optimization)
- [T-1.2.1:ELE-3] Pagination Logic: Calculate offset and limit for pagination
  - Formula: offset = (page - 1) * limit
  - Response includes: { data, page, total, pages }
- [T-1.2.1:ELE-4] Response Formatter: Transform database rows to API response format
  - Maps database schema to client-expected format
  - Code Reference: `train-wireframe/src/lib/types.ts:26-46` (Conversation type)

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define request/response TypeScript interfaces (defines ELE-1, ELE-4)
   - [PREP-2] Create query parameter validation schema (validates ELE-1)
   - [PREP-3] Design pagination metadata structure (defines ELE-3)
2. Implementation Phase:
   - [IMP-1] Create Next.js API route file (implements handler structure)
   - [IMP-2] Implement query parameter extraction and validation (implements ELE-1)
   - [IMP-3] Build Supabase query with filters and sorting (implements ELE-2)
   - [IMP-4] Add pagination calculation and application (implements ELE-3)
   - [IMP-5] Format response with metadata (implements ELE-4)
   - [IMP-6] Add error handling and logging (implements error cases)
3. Validation Phase:
   - [VAL-1] Test with various pagination parameters (validates ELE-1, ELE-3)
   - [VAL-2] Verify sorting by quality score and date (validates ELE-2)
   - [VAL-3] Test edge cases: empty queue, large page numbers (validates ELE-2, ELE-3)
   - [VAL-4] Validate response format matches specification (validates ELE-4)

#### T-1.2.2: Implement Review Action Submission API
- **FR Reference**: FR6.1.1
- **Parent Task**: T-1.2.0
- **Implementation Location**: `src/app/api/review/actions/route.ts`
- **Pattern**: POST endpoint with transaction management
- **Dependencies**: T-1.1.1 (ReviewAction schema)
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Create API endpoint to submit review actions (approve, reject, request revision) with atomic updates

**Components/Elements**:
- [T-1.2.2:ELE-1] Request Validation: Validate action submission payload
  - Required fields: conversationId, action
  - Optional fields: comment, reasons[]
  - Code Reference: `train-wireframe/src/lib/types.ts:48-55` (ReviewAction type)
- [T-1.2.2:ELE-2] User Context Extraction: Get authenticated user from session
  - Source: Supabase Auth session
  - Populates: performedBy field in ReviewAction
- [T-1.2.2:ELE-3] Transaction Manager: Execute atomic updates (status, reviewHistory, audit log)
  - Pattern: Begin transaction -> Update conversation -> Append action -> Commit
  - Rollback on any failure
- [T-1.2.2:ELE-4] Status Transition Logic: Determine new conversation status based on action
  - Mappings: 'approved' -> status 'approved', 'rejected' -> status 'rejected', 'revision_requested' -> status 'needs_revision'
  - Code Reference: `train-wireframe/src/lib/types.ts:5` (ConversationStatus enum)

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define ReviewActionRequest type (defines ELE-1)
   - [PREP-2] Map action types to status transitions (defines ELE-4)
   - [PREP-3] Design transaction flow diagram (defines ELE-3)
2. Implementation Phase:
   - [IMP-1] Create POST endpoint handler (implements route structure)
   - [IMP-2] Implement request body validation (implements ELE-1)
   - [IMP-3] Extract user context from Supabase session (implements ELE-2)
   - [IMP-4] Build transaction with multiple updates (implements ELE-3)
   - [IMP-5] Apply status transition logic (implements ELE-4)
   - [IMP-6] Append ReviewAction to reviewHistory array (uses ELE-1, ELE-2)
   - [IMP-7] Log action to separate audit table (implements audit trail)
3. Validation Phase:
   - [VAL-1] Test all action types (approve, reject, revision) (validates ELE-1, ELE-4)
   - [VAL-2] Verify user attribution works correctly (validates ELE-2)
   - [VAL-3] Test transaction rollback on failure (validates ELE-3)
   - [VAL-4] Validate reviewHistory array updates (validates ELE-1, ELE-3)
   - [VAL-5] Test concurrent action submissions (validates ELE-3 atomicity)

#### T-1.2.3: Implement Quality Feedback API
- **FR Reference**: FR6.1.2
- **Parent Task**: T-1.2.0
- **Implementation Location**: `src/app/api/review/feedback/route.ts`
- **Pattern**: Aggregation endpoint with analytics
- **Dependencies**: T-1.1.2 (quality metrics schema), T-1.2.2 (review actions)
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Create API endpoint to fetch aggregated quality feedback by template, supporting continuous improvement

**Components/Elements**:
- [T-1.2.3:ELE-1] Aggregation Query: SQL query to aggregate feedback by template
  - Groups by: parentId (template reference)
  - Aggregates: avg(quality_score), approval_rate, rejection_reasons
- [T-1.2.3:ELE-2] Feedback Categories: Structured feedback categorization
  - Categories: Content Accuracy, Emotional Intelligence, Turn Quality, Format Issues
  - Code Reference: FR6.1.2 acceptance criteria
- [T-1.2.3:ELE-3] Trend Analysis: Calculate quality trends over time
  - Windows: last 7 days, last 30 days, all time
  - Metrics: average quality score, approval rate, generation count
- [T-1.2.3:ELE-4] Template Performance Ranking: Identify high/low performing templates
  - Sort by: approval_rate DESC, avg_quality_score DESC
  - Flag templates with approval_rate < 70% for revision

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design feedback aggregation data structure (defines ELE-1, ELE-2)
   - [PREP-2] Create SQL query for template metrics (implements ELE-1)
   - [PREP-3] Define trend calculation algorithm (defines ELE-3)
2. Implementation Phase:
   - [IMP-1] Create GET endpoint handler (implements route structure)
   - [IMP-2] Implement aggregation query execution (implements ELE-1)
   - [IMP-3] Structure feedback by categories (implements ELE-2)
   - [IMP-4] Calculate quality trends (implements ELE-3)
   - [IMP-5] Rank templates by performance (implements ELE-4)
   - [IMP-6] Format response with actionable insights (implements ELE-2, ELE-4)
3. Validation Phase:
   - [VAL-1] Verify aggregation accuracy with known data (validates ELE-1)
   - [VAL-2] Test feedback categorization (validates ELE-2)
   - [VAL-3] Validate trend calculations over different time windows (validates ELE-3)
   - [VAL-4] Confirm low-performing templates are flagged (validates ELE-4)

---

## 2. Data Management & Processing

### T-2.1.0: Review Queue Service Layer
- **FR Reference**: FR6.1.1
- **Impact Weighting**: Business Logic / Data Access
- **Implementation Location**: `src/lib/services/review-queue-service.ts`
- **Pattern**: Service layer abstraction with business logic
- **Dependencies**: T-1.1.0 (database schema), T-1.2.0 (API layer)
- **Estimated Human Work Hours**: 16-20 hours
- **Description**: Implement service layer for review queue business logic, encapsulating data access and transformation
- **Testing Tools**: Jest for unit tests, integration tests with test database
- **Test Coverage Requirements**: 95%+ service method coverage
- **Completes Component?**: Yes - provides reusable business logic layer

**Functional Requirements Acceptance Criteria**:
- fetchReviewQueue() method must return conversations filtered by pending_review status
- Method must support parameters: pagination, sorting, filtering by quality range
- submitReviewAction() method must validate action and update conversation atomically
- Method must enforce business rules: can't approve conversation with quality_score < 6 (configurable threshold)
- Method must create ReviewAction object with auto-populated timestamp and user reference
- getQueueStatistics() method must return: total pending, average quality score, oldest pending date
- Service must use repository pattern for database access (decoupled from Supabase specifics)
- All methods must include comprehensive error handling with typed error classes
- Service must log all operations for debugging and audit purposes
- Methods must be fully typed with TypeScript for compile-time safety

#### T-2.1.1: Implement fetchReviewQueue Service Method
- **FR Reference**: FR6.1.1
- **Parent Task**: T-2.1.0
- **Implementation Location**: `src/lib/services/review-queue-service.ts:fetchReviewQueue()`
- **Pattern**: Repository pattern with query builder
- **Dependencies**: T-1.1.0 (database schema)
- **Estimated Human Work Hours**: 5-6 hours
- **Description**: Implement service method to fetch and process review queue with business logic

**Components/Elements**:
- [T-2.1.1:ELE-1] Query Parameters Interface: Type-safe method parameters
  - Parameters: page, pageSize, sortBy, sortOrder, minQuality, maxQuality
  - Returns: { conversations: Conversation[], pagination: PaginationMeta }
- [T-2.1.1:ELE-2] Default Sort Logic: Apply intelligent default sorting
  - Default: Sort by quality_score ASC (lowest quality first), then created_at ASC (oldest first)
  - Rationale: Prioritize low-quality, older conversations for review
- [T-2.1.1:ELE-3] Business Rule Validation: Enforce review queue constraints
  - Rule: Exclude conversations updated in last 5 minutes (allow generation time)
  - Rule: Exclude conversations with active batch job processing
- [T-2.1.1:ELE-4] Response Enrichment: Add calculated fields to conversation objects
  - Add: daysInQueue (days since created_at), priorityLevel (calculated from quality + age)

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define FetchReviewQueueParams and FetchReviewQueueResult types (defines ELE-1)
   - [PREP-2] Document business rules for queue filtering (defines ELE-3)
   - [PREP-3] Design priority calculation algorithm (defines ELE-4)
2. Implementation Phase:
   - [IMP-1] Create fetchReviewQueue method signature (implements ELE-1)
   - [IMP-2] Build Supabase query with status filter (implements queue filtering)
   - [IMP-3] Apply default sorting logic (implements ELE-2)
   - [IMP-4] Add business rule filters (implements ELE-3)
   - [IMP-5] Calculate enriched fields for each conversation (implements ELE-4)
   - [IMP-6] Apply pagination and return result (implements ELE-1)
3. Validation Phase:
   - [VAL-1] Test with various parameter combinations (validates ELE-1)
   - [VAL-2] Verify default sort order (validates ELE-2)
   - [VAL-3] Test business rule exclusions (validates ELE-3)
   - [VAL-4] Validate calculated fields (validates ELE-4)

#### T-2.1.2: Implement submitReviewAction Service Method
- **FR Reference**: FR6.1.1
- **Parent Task**: T-2.1.0
- **Implementation Location**: `src/lib/services/review-queue-service.ts:submitReviewAction()`
- **Pattern**: Command pattern with transaction
- **Dependencies**: T-1.1.1 (ReviewAction schema), T-1.2.2 (Action API)
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Implement service method to process review action submission with validation and state transitions

**Components/Elements**:
- [T-2.1.2:ELE-1] Action Validation Logic: Validate action can be performed on conversation
  - Checks: Conversation exists, conversation in valid state for action, user has permission
  - Returns: ValidationResult with success/error details
- [T-2.1.2:ELE-2] Status Transition State Machine: Map action to new conversation status
  - Transitions: 'approved' -> 'approved', 'rejected' -> 'rejected', 'revision_requested' -> 'needs_revision'
  - Code Reference: `train-wireframe/src/lib/types.ts:5` (ConversationStatus enum)
- [T-2.1.2:ELE-3] ReviewAction Builder: Construct ReviewAction object with auto-fields
  - Auto-populate: id (uuid), timestamp (now), performedBy (from session)
  - User-provided: action, comment, reasons
  - Code Reference: `train-wireframe/src/lib/types.ts:48-55` (ReviewAction type)
- [T-2.1.2:ELE-4] Transaction Executor: Execute atomic database updates
  - Updates: conversation.status, conversation.reviewHistory, conversation.updated_at
  - Inserts: audit log entry
  - Pattern: All-or-nothing with rollback on error

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define SubmitReviewActionParams type (defines ELE-1, ELE-3)
   - [PREP-2] Create status transition mapping (defines ELE-2)
   - [PREP-3] Design validation error types (defines ELE-1)
2. Implementation Phase:
   - [IMP-1] Create submitReviewAction method signature (implements method structure)
   - [IMP-2] Implement pre-submission validation (implements ELE-1)
   - [IMP-3] Build ReviewAction object (implements ELE-3)
   - [IMP-4] Determine new status from action (implements ELE-2)
   - [IMP-5] Execute transaction with all updates (implements ELE-4)
   - [IMP-6] Handle errors and rollback if needed (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test validation rejection cases (validates ELE-1)
   - [VAL-2] Test all status transitions (validates ELE-2)
   - [VAL-3] Verify ReviewAction object structure (validates ELE-3)
   - [VAL-4] Test transaction rollback on failure (validates ELE-4)

#### T-2.1.3: Implement getQueueStatistics Service Method
- **FR Reference**: FR6.1.1
- **Parent Task**: T-2.1.0
- **Implementation Location**: `src/lib/services/review-queue-service.ts:getQueueStatistics()`
- **Pattern**: Aggregation with caching
- **Dependencies**: T-1.1.0 (database schema)
- **Estimated Human Work Hours**: 4-5 hours
- **Description**: Implement service method to calculate and return review queue statistics for dashboard display

**Components/Elements**:
- [T-2.1.3:ELE-1] Statistics Calculator: Compute queue metrics
  - Metrics: totalPending, averageQualityScore, oldestPendingDate, averageTimeInQueue
  - SQL: SELECT COUNT, AVG, MIN, MAX WHERE status = 'pending_review'
- [T-2.1.3:ELE-2] Quality Distribution: Calculate distribution of quality scores in queue
  - Buckets: 0-3 (low), 3-6 (medium-low), 6-8 (medium), 8-10 (high)
  - Returns: { range: string, count: number, percentage: number }[]
- [T-2.1.3:ELE-3] Caching Layer: Cache statistics for 5 minutes to reduce database load
  - Pattern: Cache-aside with TTL
  - Invalidate on: review action submitted, conversation generated
- [T-2.1.3:ELE-4] Trend Indicators: Calculate change from previous period
  - Metrics: pendingChange (vs yesterday), qualityChange (vs last week)
  - Returns: { value: number, trend: 'up' | 'down' | 'stable', percentage: number }

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define QueueStatistics response type (defines ELE-1, ELE-2, ELE-4)
   - [PREP-2] Design caching strategy (defines ELE-3)
   - [PREP-3] Create SQL aggregation queries (implements ELE-1, ELE-2)
2. Implementation Phase:
   - [IMP-1] Create getQueueStatistics method (implements method structure)
   - [IMP-2] Check cache for existing statistics (implements ELE-3)
   - [IMP-3] Execute aggregation queries if cache miss (implements ELE-1, ELE-2)
   - [IMP-4] Calculate trend indicators from historical data (implements ELE-4)
   - [IMP-5] Store result in cache with TTL (implements ELE-3)
   - [IMP-6] Return formatted statistics (implements ELE-1, ELE-2, ELE-4)
3. Validation Phase:
   - [VAL-1] Verify calculation accuracy with known data (validates ELE-1, ELE-2)
   - [VAL-2] Test cache hit/miss scenarios (validates ELE-3)
   - [VAL-3] Validate trend calculations (validates ELE-4)
   - [VAL-4] Test cache invalidation triggers (validates ELE-3)

### T-2.2.0: Quality Feedback Service Layer
- **FR Reference**: FR6.1.2
- **Impact Weighting**: Continuous Improvement / Analytics
- **Implementation Location**: `src/lib/services/quality-feedback-service.ts`
- **Pattern**: Analytics service with aggregation
- **Dependencies**: T-1.1.2 (quality metrics schema), T-1.2.3 (feedback API)
- **Estimated Human Work Hours**: 14-18 hours
- **Description**: Implement service layer for collecting, aggregating, and analyzing quality feedback to improve template performance
- **Testing Tools**: Jest for unit tests, mock data for aggregation tests
- **Test Coverage Requirements**: 90%+ method coverage
- **Completes Component?**: Yes - provides analytics foundation for quality improvement

**Functional Requirements Acceptance Criteria**:
- aggregateFeedbackByTemplate() method must group feedback by parentId (template reference)
- Method must calculate: average quality score, approval rate, common rejection reasons, usage count
- Method must identify low-performing templates (approval rate < 70%, configurable threshold)
- identifyFeedbackTrends() method must calculate quality trends over time windows
- Time windows must include: last 7 days, last 30 days, all time
- generateImprovementRecommendations() method must return actionable suggestions
- Recommendations must be specific: "Template X has 45% approval rate - review prompt structure"
- Service must support feedback category filtering (Content Accuracy, Emotional Intelligence, etc.)
- All analytics must be performant with 1000+ conversations (<1 second query time)
- Service must use database aggregation (not in-memory processing) for efficiency

#### T-2.2.1: Implement aggregateFeedbackByTemplate Method
- **FR Reference**: FR6.1.2
- **Parent Task**: T-2.2.0
- **Implementation Location**: `src/lib/services/quality-feedback-service.ts:aggregateFeedbackByTemplate()`
- **Pattern**: SQL aggregation with GROUP BY
- **Dependencies**: T-1.1.2 (quality metrics), T-1.2.2 (review actions)
- **Estimated Human Work Hours**: 6-7 hours
- **Description**: Implement method to aggregate quality feedback metrics grouped by template for performance analysis

**Components/Elements**:
- [T-2.2.1:ELE-1] Aggregation Query Builder: Construct SQL query to group feedback
  - Group by: parentId (template reference)
  - Aggregates: COUNT(*), AVG(quality_score), SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) / COUNT(*)
  - Joins: conversations LEFT JOIN templates ON conversations.parentId = templates.id
- [T-2.2.1:ELE-2] Metric Calculator: Calculate derived metrics from aggregates
  - approval_rate: (approved_count / total_count) * 100
  - avg_quality_score: AVG(quality_score)
  - usage_count: COUNT(*)
  - Code Reference: `train-wireframe/src/lib/types.ts:70-71` (Template usageCount, rating)
- [T-2.2.1:ELE-3] Rejection Reason Analyzer: Extract and count common rejection reasons
  - Parse: reviewHistory array for 'rejected' actions
  - Extract: reasons field from ReviewAction objects
  - Aggregate: COUNT(*) GROUP BY reason
  - Code Reference: `train-wireframe/src/lib/types.ts:54` (ReviewAction reasons)
- [T-2.2.1:ELE-4] Performance Classifier: Classify templates by performance level
  - High: approval_rate >= 85%, avg_quality >= 8
  - Medium: approval_rate 70-85%, avg_quality 6-8
  - Low: approval_rate < 70% OR avg_quality < 6
  - Flag low performers for revision

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define TemplateFeedbackAggregate type (defines ELE-1, ELE-2, ELE-4)
   - [PREP-2] Design rejection reason extraction logic (defines ELE-3)
   - [PREP-3] Create performance classification rules (defines ELE-4)
2. Implementation Phase:
   - [IMP-1] Create aggregateFeedbackByTemplate method (implements method structure)
   - [IMP-2] Build SQL aggregation query (implements ELE-1)
   - [IMP-3] Calculate derived metrics (implements ELE-2)
   - [IMP-4] Extract and aggregate rejection reasons (implements ELE-3)
   - [IMP-5] Classify template performance (implements ELE-4)
   - [IMP-6] Format result with all metrics (implements ELE-1, ELE-2, ELE-3, ELE-4)
3. Validation Phase:
   - [VAL-1] Verify aggregation accuracy with test data (validates ELE-1, ELE-2)
   - [VAL-2] Test rejection reason extraction (validates ELE-3)
   - [VAL-3] Validate performance classification (validates ELE-4)
   - [VAL-4] Test with templates having zero usage (validates edge case)

---

## 3. User Interface Components

### T-3.1.0: Review Queue View Component
- **FR Reference**: FR6.1.1
- **Impact Weighting**: User Experience / Workflow Efficiency
- **Implementation Location**: `src/components/views/ReviewQueueView.tsx`
- **Pattern**: React component with hooks
- **Dependencies**: T-1.2.1 (queue API), T-2.1.0 (service layer)
- **Estimated Human Work Hours**: 16-20 hours
- **Description**: Implement main review queue interface component showing conversations awaiting review
- **Testing Tools**: Jest, React Testing Library, Storybook
- **Test Coverage Requirements**: 85%+ component coverage
- **Completes Component?**: Yes - provides complete review queue UI

**Functional Requirements Acceptance Criteria**:
- Component must fetch and display conversations with status 'pending_review'
- Empty state must show when queue is empty with "All Caught Up!" message
- Code Reference: `train-wireframe/src/components/views/ReviewQueueView.tsx:19-30` (empty state)
- Table must display columns: Title, Tier, Quality Score, Generated Date, Priority, Actions
- Quality score must be color-coded: green (>=8), yellow (5-7), red (<5)
- Code Reference: `train-wireframe/src/components/views/ReviewQueueView.tsx:65-70` (color coding)
- Review button must open conversation detail modal for in-depth review
- Component must support sorting by quality score (lowest first) and date (oldest first)
- Loading state must show skeleton placeholders while fetching data
- Error state must display user-friendly error message with retry option
- Component must auto-refresh queue every 30 seconds to show new conversations
- Keyboard shortcuts must work: R (refresh), N (next conversation), Esc (close modal)

#### T-3.1.1: Implement ReviewQueueView Base Component
- **FR Reference**: FR6.1.1
- **Parent Task**: T-3.1.0
- **Implementation Location**: `src/components/views/ReviewQueueView.tsx`
- **Pattern**: Functional component with React hooks
- **Dependencies**: T-1.2.1 (queue API endpoint)
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Create base React component structure for review queue with data fetching and state management

**Components/Elements**:
- [T-3.1.1:ELE-1] Data Fetching Hook: useEffect hook to fetch review queue on mount
  - API call: GET /api/review/queue
  - State management: conversations, isLoading, error
  - Code Reference: `train-wireframe/src/components/views/ReviewQueueView.tsx:16` (useAppStore conversations)
- [T-3.1.1:ELE-2] Filter Function: Filter conversations to pending_review status
  - Filter: conversations.filter(c => c.status === 'pending_review')
  - Code Reference: `train-wireframe/src/components/views/ReviewQueueView.tsx:17`
- [T-3.1.1:ELE-3] Empty State Rendering: Conditional rendering for empty queue
  - Condition: reviewQueue.length === 0
  - Display: CheckCircle icon, "All Caught Up!" message
  - Code Reference: `train-wireframe/src/components/views/ReviewQueueView.tsx:19-30`
- [T-3.1.1:ELE-4] Queue Statistics Display: Show queue count and summary
  - Display: "{count} conversation(s) awaiting review"
  - Code Reference: `train-wireframe/src/components/views/ReviewQueueView.tsx:39`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Set up component file with imports (sets up structure)
   - [PREP-2] Define component prop types (if any) (defines interface)
   - [PREP-3] Design component state structure (defines ELE-1)
2. Implementation Phase:
   - [IMP-1] Create functional component shell (implements component structure)
   - [IMP-2] Add useAppStore hook for conversations (implements ELE-1 state)
   - [IMP-3] Implement filter logic for pending review (implements ELE-2)
   - [IMP-4] Add empty state conditional rendering (implements ELE-3)
   - [IMP-5] Add queue statistics display (implements ELE-4)
   - [IMP-6] Add basic styling with Tailwind classes (implements UI styling)
3. Validation Phase:
   - [VAL-1] Test with mock data (validates ELE-1, ELE-2)
   - [VAL-2] Verify empty state renders correctly (validates ELE-3)
   - [VAL-3] Check statistics calculation (validates ELE-4)
   - [VAL-4] Test responsive layout (validates styling)

#### T-3.1.2: Implement Review Queue Table
- **FR Reference**: FR6.1.1
- **Parent Task**: T-3.1.0
- **Implementation Location**: `src/components/views/ReviewQueueView.tsx` (table section)
- **Pattern**: Shadcn Table component with custom columns
- **Dependencies**: T-3.1.1 (base component)
- **Estimated Human Work Hours**: 5-6 hours
- **Description**: Implement table component to display review queue conversations with sortable columns

**Components/Elements**:
- [T-3.1.2:ELE-1] Table Structure: Shadcn Table component with header and body
  - Columns: Title, Tier, Quality Score, Generated, Priority, Actions
  - Code Reference: `train-wireframe/src/components/views/ReviewQueueView.tsx:45-92`
- [T-3.1.2:ELE-2] Quality Score Cell: Color-coded quality score display
  - Color logic: score >= 8 (green), score >= 5 (yellow), score < 5 (red)
  - Format: score.toFixed(1)
  - Code Reference: `train-wireframe/src/components/views/ReviewQueueView.tsx:64-72`
- [T-3.1.2:ELE-3] Tier Badge: Badge component showing conversation tier
  - Values: template | scenario | edge_case
  - Styling: variant="outline"
  - Code Reference: `train-wireframe/src/components/views/ReviewQueueView.tsx:60-62`
- [T-3.1.2:ELE-4] Review Action Button: Button to open review interface
  - Handler: onClick -> open review modal
  - Styling: size="sm"
  - Code Reference: `train-wireframe/src/components/views/ReviewQueueView.tsx:81-86`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Import Shadcn Table components (imports Table, TableHeader, etc.)
   - [PREP-2] Import Badge and Button components (imports UI components)
   - [PREP-3] Design table column structure (defines ELE-1)
2. Implementation Phase:
   - [IMP-1] Create Table component structure (implements ELE-1)
   - [IMP-2] Add TableHeader with column definitions (implements ELE-1)
   - [IMP-3] Implement TableBody with row mapping (implements ELE-1)
   - [IMP-4] Add quality score cell with color logic (implements ELE-2)
   - [IMP-5] Add tier badge cell (implements ELE-3)
   - [IMP-6] Add review action button cell (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test table rendering with mock data (validates ELE-1)
   - [VAL-2] Verify quality score colors (validates ELE-2)
   - [VAL-3] Check tier badge display (validates ELE-3)
   - [VAL-4] Test review button click handler (validates ELE-4)

#### T-3.1.3: Implement Bulk Review Actions Bar
- **FR Reference**: FR6.1.1
- **Parent Task**: T-3.1.0
- **Implementation Location**: `src/components/views/ReviewQueueView.tsx` (bulk actions section)
- **Pattern**: Conditional rendering based on selection count
- **Dependencies**: T-3.1.2 (table with selection)
- **Estimated Human Work Hours**: 4-5 hours
- **Description**: Implement bulk action controls for reviewing multiple conversations simultaneously

**Components/Elements**:
- [T-3.1.3:ELE-1] Selection Context: Track selected conversation IDs
  - State: selectedConversationIds from useAppStore
  - Code Reference: `train-wireframe/src/stores/useAppStore.ts:41,83-87` (selection state)
- [T-3.1.3:ELE-2] Bulk Actions Bar: Conditional toolbar showing selected count
  - Condition: reviewQueue.length > 5 (minimum for bulk actions)
  - Display: "{count} selected" with action buttons
  - Code Reference: `train-wireframe/src/components/views/ReviewQueueView.tsx:94-103`
- [T-3.1.3:ELE-3] Approve Selected Button: Bulk approve action
  - Handler: submitBulkReviewAction(selectedIds, 'approved')
  - Confirmation: Optional confirmation dialog
- [T-3.1.3:ELE-4] Reject Selected Button: Bulk reject action
  - Handler: submitBulkReviewAction(selectedIds, 'rejected')
  - Confirmation: Required confirmation dialog with reason

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Add checkbox column to table for selection (enables ELE-1)
   - [PREP-2] Design bulk actions bar layout (defines ELE-2)
   - [PREP-3] Create bulk action confirmation dialogs (defines ELE-3, ELE-4)
2. Implementation Phase:
   - [IMP-1] Add selection state management (implements ELE-1)
   - [IMP-2] Create conditional bulk actions bar (implements ELE-2)
   - [IMP-3] Implement approve selected handler (implements ELE-3)
   - [IMP-4] Implement reject selected handler (implements ELE-4)
   - [IMP-5] Add success/error toast notifications (implements feedback)
3. Validation Phase:
   - [VAL-1] Test selection state updates (validates ELE-1)
   - [VAL-2] Verify bulk actions bar visibility (validates ELE-2)
   - [VAL-3] Test bulk approve flow (validates ELE-3)
   - [VAL-4] Test bulk reject with confirmation (validates ELE-4)

### T-3.2.0: Conversation Review Modal
- **FR Reference**: FR6.1.1
- **Impact Weighting**: Core Review Workflow / UX
- **Implementation Location**: `src/components/review/ConversationReviewModal.tsx`
- **Pattern**: Modal dialog with side-by-side layout
- **Dependencies**: T-3.1.0 (review queue view)
- **Estimated Human Work Hours**: 20-24 hours
- **Description**: Implement detailed conversation review modal displaying conversation content with source chunk context and review actions
- **Testing Tools**: Jest, React Testing Library, Storybook for component isolation
- **Test Coverage Requirements**: 90%+ coverage including interaction flows
- **Completes Component?**: Yes - provides complete review interface

**Functional Requirements Acceptance Criteria**:
- Modal must display conversation side-by-side with source chunk reference
- Code Reference: FR6.1.1 acceptance criteria - "Review interface must display conversation side-by-side with source chunk"
- Left panel must show conversation turns in readable format (USER: / ASSISTANT:)
- Right panel must show source chunk content, metadata, and quality metrics
- Review actions must include: Approve, Reject, Request Changes buttons
- Code Reference: `train-wireframe/src/lib/types.ts:50` (ReviewAction action types)
- Comment textarea must support markdown formatting with preview
- Reason checkboxes must be provided for rejection (Content Accuracy, Emotional Intelligence, Turn Quality, Format Issues)
- Keyboard shortcuts must work: A (approve), R (reject), C (request changes), N (next), P (previous), Esc (close)
- Code Reference: FR6.1.1 acceptance criteria - "Keyboard shortcuts must enable rapid review: A (approve), R (reject), N (next)"
- Navigation buttons (Previous/Next) must move through review queue
- Modal must show conversation metadata: tier, quality score, generated date, token count
- All actions must provide immediate feedback via toast notifications
- Action submission must be optimistic with rollback on error

#### T-3.2.1: Implement Modal Structure and Layout
- **FR Reference**: FR6.1.1
- **Parent Task**: T-3.2.0
- **Implementation Location**: `src/components/review/ConversationReviewModal.tsx`
- **Pattern**: Shadcn Dialog with custom layout
- **Dependencies**: T-3.1.0 (triggered from review queue)
- **Estimated Human Work Hours**: 5-6 hours
- **Description**: Create base modal structure with side-by-side layout for conversation and source chunk display

**Components/Elements**:
- [T-3.2.1:ELE-1] Dialog Component: Shadcn Dialog with overlay and content
  - Props: open (boolean), onOpenChange (function), conversationId (string)
  - Code Reference: `train-wireframe/src/components/ui/dialog.tsx`
- [T-3.2.1:ELE-2] Two-Panel Layout: Grid layout with conversation and chunk panels
  - Layout: CSS Grid with 60/40 split (conversation 60%, chunk 40%)
  - Responsive: Stack vertically on mobile (< 768px)
- [T-3.2.1:ELE-3] Header Section: Modal title with conversation metadata
  - Display: Conversation title, tier badge, quality score, ID
  - Actions: Close button, Previous/Next navigation
- [T-3.2.1:ELE-4] Footer Section: Action buttons and comment input
  - Actions: Approve, Reject, Request Changes buttons
  - Input: Comment textarea with markdown support

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Import Shadcn Dialog components (imports Dialog, DialogContent, etc.)
   - [PREP-2] Design two-panel layout structure (defines ELE-2)
   - [PREP-3] Create modal prop interface (defines ELE-1)
2. Implementation Phase:
   - [IMP-1] Create Dialog component structure (implements ELE-1)
   - [IMP-2] Implement two-panel grid layout (implements ELE-2)
   - [IMP-3] Add header section with metadata (implements ELE-3)
   - [IMP-4] Add footer section with actions (implements ELE-4)
   - [IMP-5] Add responsive styling (implements ELE-2 responsive)
3. Validation Phase:
   - [VAL-1] Test modal open/close (validates ELE-1)
   - [VAL-2] Verify two-panel layout (validates ELE-2)
   - [VAL-3] Check header displays correctly (validates ELE-3)
   - [VAL-4] Verify footer actions (validates ELE-4)

#### T-3.2.2: Implement Conversation Display Panel
- **FR Reference**: FR6.1.1
- **Parent Task**: T-3.2.0
- **Implementation Location**: `src/components/review/ConversationDisplayPanel.tsx`
- **Pattern**: Turn-by-turn conversation rendering
- **Dependencies**: T-3.2.1 (modal structure)
- **Estimated Human Work Hours**: 6-7 hours
- **Description**: Implement left panel displaying conversation turns in readable, formatted style

**Components/Elements**:
- [T-3.2.2:ELE-1] Turn Container: Scrollable container for conversation turns
  - Styling: max-height, overflow-y-scroll, padding
  - Turn structure: Array of ConversationTurn objects
  - Code Reference: `train-wireframe/src/lib/types.ts:7-12` (ConversationTurn type)
- [T-3.2.2:ELE-2] Turn Message Component: Individual message display
  - Format: "USER:" or "ASSISTANT:" label + content
  - Styling: Different background colors for user vs assistant
  - Timestamp: Display relative time (e.g., "2 hours ago")
- [T-3.2.2:ELE-3] Turn Metrics Display: Show token count per turn
  - Display: Small badge showing token count
  - Code Reference: `train-wireframe/src/lib/types.ts:11` (tokenCount field)
- [T-3.2.2:ELE-4] Conversation Summary: Display total turns and tokens
  - Metrics: totalTurns, totalTokens
  - Code Reference: `train-wireframe/src/lib/types.ts:40-41` (Conversation totalTurns, totalTokens)

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design turn message component structure (defines ELE-2)
   - [PREP-2] Create styling for user vs assistant messages (defines ELE-2)
   - [PREP-3] Plan scrollable container behavior (defines ELE-1)
2. Implementation Phase:
   - [IMP-1] Create scrollable turn container (implements ELE-1)
   - [IMP-2] Implement turn message component (implements ELE-2)
   - [IMP-3] Add token count badges (implements ELE-3)
   - [IMP-4] Add conversation summary section (implements ELE-4)
   - [IMP-5] Style user/assistant messages differently (implements ELE-2)
3. Validation Phase:
   - [VAL-1] Test with conversations of varying lengths (validates ELE-1)
   - [VAL-2] Verify turn formatting (validates ELE-2)
   - [VAL-3] Check token count display (validates ELE-3)
   - [VAL-4] Validate summary metrics (validates ELE-4)

#### T-3.2.3: Implement Review Action Controls
- **FR Reference**: FR6.1.1
- **Parent Task**: T-3.2.0
- **Implementation Location**: `src/components/review/ReviewActionControls.tsx`
- **Pattern**: Form component with validation
- **Dependencies**: T-1.2.2 (review action API), T-3.2.1 (modal structure)
- **Estimated Human Work Hours**: 7-8 hours
- **Description**: Implement review action controls with comment input, reason selection, and action buttons

**Components/Elements**:
- [T-3.2.3:ELE-1] Action Buttons: Three primary action buttons
  - Buttons: Approve (green), Reject (red), Request Changes (yellow)
  - Handlers: submitReviewAction(conversationId, action, comment, reasons)
  - Code Reference: `train-wireframe/src/lib/types.ts:50` (ReviewAction action enum)
- [T-3.2.3:ELE-2] Comment Textarea: Markdown-enabled comment input
  - Component: Textarea with markdown preview
  - Validation: Max 2000 characters
  - Optional: Required for reject and request changes actions
- [T-3.2.3:ELE-3] Reason Checkboxes: Multi-select reasons for rejection
  - Options: Content Accuracy, Emotional Intelligence, Turn Quality, Format Issues
  - Code Reference: FR6.1.2 acceptance criteria (feedback categories)
  - Condition: Only shown when Reject or Request Changes selected
- [T-3.2.3:ELE-4] Confirmation Dialog: Confirmation for destructive actions
  - Triggers: Reject action (destructive)
  - Display: "Are you sure you want to reject this conversation?"
  - Code Reference: `train-wireframe/src/stores/useAppStore.ts:96-99` (showConfirm pattern)

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define action submission interface (defines ELE-1)
   - [PREP-2] Create reason options list (defines ELE-3)
   - [PREP-3] Design confirmation dialog flow (defines ELE-4)
2. Implementation Phase:
   - [IMP-1] Create action button group (implements ELE-1)
   - [IMP-2] Add comment textarea with character count (implements ELE-2)
   - [IMP-3] Implement reason checkbox group (implements ELE-3)
   - [IMP-4] Add confirmation dialog for destructive actions (implements ELE-4)
   - [IMP-5] Wire up action submission handlers (implements ELE-1)
3. Validation Phase:
   - [VAL-1] Test all action types (validates ELE-1)
   - [VAL-2] Verify comment validation (validates ELE-2)
   - [VAL-3] Test reason selection (validates ELE-3)
   - [VAL-4] Confirm dialog triggers correctly (validates ELE-4)

### T-3.3.0: Quality Feedback Dashboard
- **FR Reference**: FR6.1.2
- **Impact Weighting**: Continuous Improvement / Analytics
- **Implementation Location**: `src/components/feedback/QualityFeedbackDashboard.tsx`
- **Pattern**: Analytics dashboard with charts
- **Dependencies**: T-1.2.3 (feedback API), T-2.2.0 (feedback service)
- **Estimated Human Work Hours**: 16-20 hours
- **Description**: Implement dashboard for visualizing quality feedback trends and template performance
- **Testing Tools**: Jest, Storybook, visual regression testing
- **Test Coverage Requirements**: 80%+ coverage for data transformations
- **Completes Component?**: Yes - provides complete feedback analytics UI

**Functional Requirements Acceptance Criteria**:
- Dashboard must display template performance metrics: approval rate, avg quality score, usage count
- Templates must be sortable by: approval rate, quality score, usage count
- Low-performing templates (approval rate < 70%) must be visually flagged
- Code Reference: FR6.1.2 acceptance criteria - "Low-performing templates must be flagged for revision"
- Feedback trends must be displayed over time windows: 7 days, 30 days, all time
- Charts must show: quality score trend, approval rate trend, generation count trend
- Common rejection reasons must be displayed as horizontal bar chart
- Dashboard must include actionable recommendations section
- Refresh data button must be provided with loading state
- Export feedback data as CSV must be supported
- Dashboard must be responsive and work on tablet/desktop

#### T-3.3.1: Implement Template Performance Table
- **FR Reference**: FR6.1.2
- **Parent Task**: T-3.3.0
- **Implementation Location**: `src/components/feedback/TemplatePerformanceTable.tsx`
- **Pattern**: Sortable table with conditional styling
- **Dependencies**: T-1.2.3 (feedback API)
- **Estimated Human Work Hours**: 6-7 hours
- **Description**: Create table displaying template performance metrics with sorting and visual indicators

**Components/Elements**:
- [T-3.3.1:ELE-1] Performance Data Fetching: Fetch aggregated template feedback
  - API: GET /api/review/feedback
  - Response: TemplateFeedbackAggregate[]
  - Fields: templateId, name, usageCount, approvalRate, avgQualityScore, performance
- [T-3.3.1:ELE-2] Sortable Table Component: Table with sortable columns
  - Columns: Template Name, Usage Count, Approval Rate, Avg Quality, Performance Level
  - Sort: Click column header to toggle asc/desc
  - Code Reference: `train-wireframe/src/components/dashboard/ConversationTable.tsx:69-96` (sorting pattern)
- [T-3.3.1:ELE-3] Performance Badge: Visual indicator of template performance
  - Levels: High (green), Medium (yellow), Low (red)
  - Logic: Based on approval_rate and avg_quality_score thresholds
  - Display: Badge component with appropriate color
- [T-3.3.1:ELE-4] Flag Icon: Alert icon for low-performing templates
  - Condition: performance === 'Low' OR approval_rate < 70%
  - Display: AlertTriangle icon with tooltip "Needs Revision"

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define TemplateFeedbackAggregate type (defines ELE-1)
   - [PREP-2] Design table column structure (defines ELE-2)
   - [PREP-3] Create performance classification logic (defines ELE-3)
2. Implementation Phase:
   - [IMP-1] Fetch template feedback data (implements ELE-1)
   - [IMP-2] Create sortable table component (implements ELE-2)
   - [IMP-3] Add performance badge to each row (implements ELE-3)
   - [IMP-4] Add flag icon for low performers (implements ELE-4)
   - [IMP-5] Style table with Tailwind classes (implements styling)
3. Validation Phase:
   - [VAL-1] Test data fetching and display (validates ELE-1, ELE-2)
   - [VAL-2] Verify sorting functionality (validates ELE-2)
   - [VAL-3] Check performance badge colors (validates ELE-3)
   - [VAL-4] Validate flag icon display (validates ELE-4)

---

## 4. Feature Implementation

### T-4.1.0: Keyboard Shortcuts System
- **FR Reference**: FR6.1.1
- **Impact Weighting**: Productivity / Power User Experience
- **Implementation Location**: `src/hooks/useKeyboardShortcuts.ts`, `src/components/review/KeyboardShortcutsHelp.tsx`
- **Pattern**: Custom React hook with event listeners
- **Dependencies**: T-3.2.0 (review modal)
- **Estimated Human Work Hours**: 10-12 hours
- **Description**: Implement keyboard shortcuts for rapid review navigation and actions
- **Testing Tools**: Jest, React Testing Library with keyboard event simulation
- **Test Coverage Requirements**: 95%+ coverage for all shortcut combinations
- **Completes Component?**: Yes - provides complete keyboard navigation

**Functional Requirements Acceptance Criteria**:
- Keyboard shortcuts must include: A (approve), R (reject), C (request changes), N (next), P (previous), Esc (close)
- Code Reference: FR6.1.1 acceptance criteria - "Keyboard shortcuts must enable rapid review: A (approve), R (reject), N (next)"
- Shortcuts must only trigger when review modal is active (not in background)
- Shortcuts must be disabled when text input is focused (comment textarea)
- Help dialog must be accessible via ? key showing all available shortcuts
- Shortcuts must be user-configurable in preferences (optional)
- Code Reference: `train-wireframe/src/lib/types.ts:222` (keyboardShortcutsEnabled preference)
- Visual feedback must be provided when shortcut is triggered (toast or animation)
- Shortcuts must support modifier keys: Cmd/Ctrl+Enter to submit, Cmd/Ctrl+K to open help
- Custom shortcuts must be stored in user preferences and persisted to database
- Shortcuts must work across all supported browsers (Chrome, Firefox, Safari, Edge)

#### T-4.1.1: Implement useKeyboardShortcuts Hook
- **FR Reference**: FR6.1.1
- **Parent Task**: T-4.1.0
- **Implementation Location**: `src/hooks/useKeyboardShortcuts.ts`
- **Pattern**: Custom React hook with event listeners
- **Dependencies**: None
- **Estimated Human Work Hours**: 5-6 hours
- **Description**: Create reusable React hook for registering and managing keyboard shortcuts

**Components/Elements**:
- [T-4.1.1:ELE-1] Shortcut Registry: Map of keyboard shortcuts to action handlers
  - Structure: Map<string, () => void> where key is "KeyCode+Modifiers"
  - Example: { "KeyA": approveAction, "KeyR": rejectAction, "KeyN": nextAction }
- [T-4.1.1:ELE-2] Event Listener: Global keydown event listener
  - Attach: document.addEventListener('keydown', handleKeydown)
  - Cleanup: Removes listener on unmount
  - Filter: Only process if not in input/textarea (check event.target)
- [T-4.1.1:ELE-3] Modifier Key Support: Handle Cmd/Ctrl+key combinations
  - Detection: event.metaKey || event.ctrlKey
  - Example: Cmd+Enter to submit form
- [T-4.1.1:ELE-4] Enabled State Management: Toggle shortcuts on/off
  - State: enabled (boolean)
  - Source: User preferences
  - Code Reference: `train-wireframe/src/lib/types.ts:222` (keyboardShortcutsEnabled)

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define shortcut configuration type (defines ELE-1)
   - [PREP-2] Plan event listener lifecycle (defines ELE-2)
   - [PREP-3] Document modifier key combinations (defines ELE-3)
2. Implementation Phase:
   - [IMP-1] Create useKeyboardShortcuts hook (implements hook structure)
   - [IMP-2] Implement shortcut registry (implements ELE-1)
   - [IMP-3] Add keydown event listener (implements ELE-2)
   - [IMP-4] Handle modifier keys (implements ELE-3)
   - [IMP-5] Add enabled/disabled toggle (implements ELE-4)
   - [IMP-6] Implement cleanup on unmount (implements ELE-2)
3. Validation Phase:
   - [VAL-1] Test shortcut registration (validates ELE-1)
   - [VAL-2] Verify event listener works (validates ELE-2)
   - [VAL-3] Test modifier key combinations (validates ELE-3)
   - [VAL-4] Verify shortcuts can be disabled (validates ELE-4)

#### T-4.1.2: Integrate Shortcuts in Review Modal
- **FR Reference**: FR6.1.1
- **Parent Task**: T-4.1.0
- **Implementation Location**: `src/components/review/ConversationReviewModal.tsx` (add shortcuts)
- **Pattern**: Hook integration in component
- **Dependencies**: T-4.1.1 (shortcuts hook), T-3.2.0 (review modal)
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Integrate keyboard shortcuts into review modal for rapid review actions

**Components/Elements**:
- [T-4.1.2:ELE-1] Shortcut Hook Usage: Use useKeyboardShortcuts in review modal
  - Call: useKeyboardShortcuts(shortcutConfig, isModalOpen)
  - Config: Map shortcuts to modal action handlers
- [T-4.1.2:ELE-2] Action Handler Mapping: Map shortcuts to review actions
  - A -> handleApprove, R -> handleReject, C -> handleRequestChanges
  - N -> handleNext, P -> handlePrevious, Esc -> handleClose
- [T-4.1.2:ELE-3] Focus Management: Prevent shortcuts when input focused
  - Check: event.target is not input/textarea
  - Handle: Skip shortcut execution if focused
- [T-4.1.2:ELE-4] Visual Feedback: Show toast when shortcut triggers action
  - Display: "Approved via keyboard shortcut (A)"
  - Library: Sonner toast notification

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define shortcut config object (defines ELE-2)
   - [PREP-2] Plan focus management logic (defines ELE-3)
   - [PREP-3] Design visual feedback messages (defines ELE-4)
2. Implementation Phase:
   - [IMP-1] Import and use useKeyboardShortcuts hook (implements ELE-1)
   - [IMP-2] Map shortcuts to action handlers (implements ELE-2)
   - [IMP-3] Add focus check in shortcut handler (implements ELE-3)
   - [IMP-4] Add toast notifications (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test all shortcuts trigger actions (validates ELE-2)
   - [VAL-2] Verify shortcuts disabled when input focused (validates ELE-3)
   - [VAL-3] Check visual feedback displays (validates ELE-4)

### T-4.2.0: Auto-Refresh Queue System
- **FR Reference**: FR6.1.1
- **Impact Weighting**: UX / Data Freshness
- **Implementation Location**: `src/components/views/ReviewQueueView.tsx` (add auto-refresh)
- **Pattern**: Polling with useEffect and interval
- **Dependencies**: T-3.1.0 (review queue view), T-1.2.1 (queue API)
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Implement auto-refresh mechanism to keep review queue data current without manual refresh
- **Testing Tools**: Jest with fake timers, React Testing Library
- **Test Coverage Requirements**: 90%+ coverage including edge cases
- **Completes Component?**: Yes - provides real-time data updates

**Functional Requirements Acceptance Criteria**:
- Queue must auto-refresh every 30 seconds to show new conversations
- Code Reference: FR6.1.1 acceptance criteria - "Component must auto-refresh queue every 30 seconds"
- Refresh interval must be configurable in user preferences (15s / 30s / 60s / disabled)
- Auto-refresh must pause when review modal is open (don't interrupt user)
- Manual refresh button must be provided to force immediate update
- Refresh must show subtle loading indicator (not full page spinner)
- Refresh must preserve current sort order and filters
- Failed refresh attempts must not disrupt UI (silent failure with error log)
- Refresh must use optimistic UI update pattern (show new data immediately)
- Refresh must detect network status and pause when offline
- Auto-refresh must stop when component unmounts (cleanup)

#### T-4.2.1: Implement Auto-Refresh useEffect Hook
- **FR Reference**: FR6.1.1
- **Parent Task**: T-4.2.0
- **Implementation Location**: `src/components/views/ReviewQueueView.tsx` (add useEffect)
- **Pattern**: useEffect with setInterval and cleanup
- **Dependencies**: T-1.2.1 (queue API)
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Create useEffect hook to poll review queue API at regular intervals

**Components/Elements**:
- [T-4.2.1:ELE-1] Interval Setup: setInterval for periodic refresh
  - Interval: 30000ms (30 seconds), configurable from preferences
  - Function: fetchReviewQueue()
  - Cleanup: clearInterval on unmount
- [T-4.2.1:ELE-2] Pause Logic: Conditional pause when modal open
  - Check: isModalOpen state
  - Action: Skip refresh if modal is active
- [T-4.2.1:ELE-3] Silent Error Handling: Log errors without UI disruption
  - Catch: API errors in refresh call
  - Action: console.error but don't show user error
  - Fallback: Keep displaying stale data
- [T-4.2.1:ELE-4] Loading State: Subtle refresh indicator
  - State: isRefreshing (boolean)
  - Display: Small spinner icon in header, not full-page

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define refresh interval constant (defines ELE-1)
   - [PREP-2] Plan pause condition logic (defines ELE-2)
   - [PREP-3] Design error handling strategy (defines ELE-3)
2. Implementation Phase:
   - [IMP-1] Add useEffect with setInterval (implements ELE-1)
   - [IMP-2] Implement pause logic check (implements ELE-2)
   - [IMP-3] Add silent error handling (implements ELE-3)
   - [IMP-4] Add subtle loading state (implements ELE-4)
   - [IMP-5] Add cleanup function (implements ELE-1 cleanup)
3. Validation Phase:
   - [VAL-1] Test interval triggers refresh (validates ELE-1)
   - [VAL-2] Verify pause when modal open (validates ELE-2)
   - [VAL-3] Test error handling (validates ELE-3)
   - [VAL-4] Check loading indicator (validates ELE-4)

---

## 5. Quality Assurance & Testing

### T-5.1.0: Unit Testing - Review Services
- **FR Reference**: FR6.1.1, FR6.1.2
- **Impact Weighting**: Code Quality / Reliability
- **Implementation Location**: `src/lib/services/__tests__/review-queue-service.test.ts`, `quality-feedback-service.test.ts`
- **Pattern**: Jest unit tests with mocks
- **Dependencies**: T-2.1.0 (review service), T-2.2.0 (feedback service)
- **Estimated Human Work Hours**: 12-16 hours
- **Description**: Write comprehensive unit tests for review and feedback service layers
- **Testing Tools**: Jest, @testing-library/react-hooks
- **Test Coverage Requirements**: 95%+ coverage for all service methods
- **Completes Component?**: Yes - full service layer test coverage

**Functional Requirements Acceptance Criteria**:
- All service methods must have unit tests covering happy path and error cases
- fetchReviewQueue tests must cover: empty queue, pagination, sorting, filtering
- submitReviewAction tests must cover: all action types, validation failures, transaction rollback
- aggregateFeedbackByTemplate tests must cover: aggregation accuracy, zero usage, multiple templates
- Tests must use mocked database calls (no real database connections)
- Tests must use mocked API responses (no real API calls)
- Edge cases must be tested: null values, empty arrays, invalid inputs
- Performance tests must validate query execution time (< 100ms for mock data)
- Tests must use snapshot testing for response format validation
- Test coverage report must be generated and reviewed (aim for 95%+)

#### T-5.1.1: Write fetchReviewQueue Tests
- **FR Reference**: FR6.1.1
- **Parent Task**: T-5.1.0
- **Implementation Location**: `src/lib/services/__tests__/review-queue-service.test.ts`
- **Pattern**: Jest describe/it blocks with setup/teardown
- **Dependencies**: T-2.1.1 (fetchReviewQueue method)
- **Estimated Human Work Hours**: 4-5 hours
- **Description**: Write comprehensive unit tests for fetchReviewQueue service method

**Components/Elements**:
- [T-5.1.1:ELE-1] Happy Path Test: Test successful queue fetch
  - Setup: Mock database with pending conversations
  - Assert: Returns conversations array with correct status
  - Assert: Pagination metadata is accurate
- [T-5.1.1:ELE-2] Empty Queue Test: Test behavior when no conversations pending
  - Setup: Mock database with no pending conversations
  - Assert: Returns empty array
  - Assert: Pagination shows 0 total
- [T-5.1.1:ELE-3] Sorting Tests: Test all sort combinations
  - Cases: quality ASC, quality DESC, date ASC, date DESC
  - Assert: Conversations returned in correct order
- [T-5.1.1:ELE-4] Error Handling Test: Test database error handling
  - Setup: Mock database throws error
  - Assert: Method throws appropriate error
  - Assert: Error is logged

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Create test file with imports (sets up test structure)
   - [PREP-2] Create mock data generators (creates test fixtures)
   - [PREP-3] Set up database mocks (mocks Supabase)
2. Implementation Phase:
   - [IMP-1] Write happy path test (implements ELE-1)
   - [IMP-2] Write empty queue test (implements ELE-2)
   - [IMP-3] Write sorting tests (implements ELE-3)
   - [IMP-4] Write error handling test (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Run tests and verify all pass (validates ELE-1, ELE-2, ELE-3, ELE-4)
   - [VAL-2] Check test coverage report (validates coverage)

### T-5.2.0: Integration Testing - Review Workflow
- **FR Reference**: FR6.1.1
- **Impact Weighting**: Feature Reliability / E2E Verification
- **Implementation Location**: `src/__tests__/integration/review-workflow.test.ts`
- **Pattern**: Integration tests with test database
- **Dependencies**: T-1.2.0 (API endpoints), T-2.1.0 (services)
- **Estimated Human Work Hours**: 14-18 hours
- **Description**: Write integration tests covering end-to-end review workflow from queue fetch to action submission
- **Testing Tools**: Jest, Supertest for API testing, test Supabase instance
- **Test Coverage Requirements**: Cover all critical user paths
- **Completes Component?**: Yes - validates complete review workflow integration

**Functional Requirements Acceptance Criteria**:
- Complete review workflow must be tested: fetch queue -> open conversation -> submit action -> verify update
- Tests must use real API endpoints (not mocked)
- Tests must use test database with isolated data (not production)
- Concurrent review action tests must validate atomicity (no race conditions)
- Tests must validate RLS policies work correctly (user can only see their data)
- Batch review action tests must verify all conversations updated correctly
- Failed API calls must be tested with retry logic validation
- Tests must clean up test data after execution (teardown)
- Performance tests must validate API response times (< 500ms for queue fetch)
- Integration tests must run in CI/CD pipeline before deployment

---

## 6. Deployment & Operations

### T-6.1.0: Database Migrations Deployment
- **FR Reference**: FR6.1.1, FR6.1.2
- **Impact Weighting**: Production Readiness / Deployment Safety
- **Implementation Location**: `supabase/migrations/`, deployment scripts
- **Pattern**: Versioned migrations with rollback capability
- **Dependencies**: T-1.1.0 (database schema complete)
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Prepare and execute database migrations for production deployment with rollback plan
- **Testing Tools**: Supabase Studio, psql for manual verification
- **Test Coverage Requirements**: Test migrations in staging environment first
- **Completes Component?**: Yes - production database ready

**Functional Requirements Acceptance Criteria**:
- All migrations must be versioned with timestamp prefix (YYYYMMDDHHMMSS)
- Each migration must have corresponding rollback script
- Migrations must be idempotent (safe to run multiple times)
- Production deployment must follow sequence: backup -> migrate -> validate -> rollback if needed
- Migration execution must be logged with timestamp and executor
- Schema changes must be backward compatible (no breaking changes for running application)
- Data migrations must be tested with production-like dataset (performance validation)
- Zero-downtime deployment must be achieved (new code works with old schema during transition)
- Post-migration validation queries must confirm schema correctness
- Rollback plan must be documented and tested in staging

#### T-6.1.1: Create Review Schema Migration File
- **FR Reference**: FR6.1.1
- **Parent Task**: T-6.1.0
- **Implementation Location**: `supabase/migrations/20250129000000_review_schema.sql`
- **Pattern**: Single migration file with all review schema changes
- **Dependencies**: T-1.1.0 (schema design complete)
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Create migration file consolidating all review queue schema changes

**Components/Elements**:
- [T-6.1.1:ELE-1] Migration File: SQL file with all DDL statements
  - Includes: reviewHistory column, quality metrics, indexes, RLS policies
  - Format: Standard Supabase migration format
- [T-6.1.1:ELE-2] Rollback File: Corresponding rollback SQL
  - Includes: DROP statements for all created objects
  - Safe: Checks for existence before dropping
- [T-6.1.1:ELE-3] Validation Queries: SQL queries to verify migration success
  - Check: reviewHistory column exists with correct type
  - Check: Indexes created successfully
  - Check: RLS policies active
- [T-6.1.1:ELE-4] Performance Test Queries: Queries to test performance with migration
  - Query: SELECT from conversations WHERE status = 'pending_review'
  - Assert: Query uses indexes, execution time < 100ms

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Consolidate all schema changes (defines ELE-1)
   - [PREP-2] Write rollback statements (defines ELE-2)
   - [PREP-3] Create validation query list (defines ELE-3)
2. Implementation Phase:
   - [IMP-1] Create migration SQL file (implements ELE-1)
   - [IMP-2] Create rollback SQL file (implements ELE-2)
   - [IMP-3] Add validation queries (implements ELE-3)
   - [IMP-4] Add performance test queries (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test migration in local database (validates ELE-1)
   - [VAL-2] Test rollback in local database (validates ELE-2)
   - [VAL-3] Run validation queries (validates ELE-3)
   - [VAL-4] Run performance tests (validates ELE-4)

### T-6.2.0: Monitoring & Observability
- **FR Reference**: FR6.1.1, FR6.1.2
- **Impact Weighting**: Operations / Incident Response
- **Implementation Location**: Logging, monitoring dashboards
- **Pattern**: Structured logging with metrics and alerts
- **Dependencies**: T-1.2.0 (API endpoints deployed)
- **Estimated Human Work Hours**: 10-12 hours
- **Description**: Implement monitoring, logging, and alerting for review queue features in production
- **Testing Tools**: Sentry for error tracking, Supabase logs, custom dashboards
- **Test Coverage Requirements**: Test alert triggers in staging
- **Completes Component?**: Yes - production monitoring complete

**Functional Requirements Acceptance Criteria**:
- All API endpoints must log request/response with structured format (JSON)
- Error logs must include: error type, stack trace, user context, request payload
- Metrics must be tracked: review action count, queue size, average review time, error rate
- Alerts must trigger for: high error rate (> 5%), queue size > 100, API response time > 2s
- Dashboard must display: real-time queue size, review action trends, template performance
- Logs must be searchable by: user, conversation ID, action type, timestamp
- Audit trail must be complete: all review actions logged with user attribution
- Performance metrics must be tracked: database query time, API response time, frontend render time
- Alerts must be sent to: Slack channel, email for critical errors
- Log retention must be configured: 30 days for standard logs, 90 days for audit logs

---

## Task Summary

**Total Tasks**: 82 tasks across 6 major categories

### Task Breakdown by Category:
1. **Foundation & Infrastructure** (T-1.X.X): 18 tasks
   - Database schema: 9 tasks
   - API endpoints: 9 tasks

2. **Data Management & Processing** (T-2.X.X): 12 tasks
   - Review queue service: 6 tasks
   - Quality feedback service: 6 tasks

3. **User Interface Components** (T-3.X.X): 22 tasks
   - Review queue view: 9 tasks
   - Conversation review modal: 9 tasks
   - Quality feedback dashboard: 4 tasks

4. **Feature Implementation** (T-4.X.X): 10 tasks
   - Keyboard shortcuts: 5 tasks
   - Auto-refresh: 5 tasks

5. **Quality Assurance & Testing** (T-5.X.X): 12 tasks
   - Unit tests: 6 tasks
   - Integration tests: 6 tasks

6. **Deployment & Operations** (T-6.X.X): 8 tasks
   - Database migrations: 4 tasks
   - Monitoring: 4 tasks

### Estimated Timeline:
- **Foundation & Infrastructure**: 2-3 weeks
- **Data Management & Processing**: 2 weeks
- **User Interface Components**: 2-3 weeks
- **Feature Implementation**: 1 week
- **Quality Assurance & Testing**: 1-2 weeks
- **Deployment & Operations**: 1 week

**Total Duration**: 6-8 weeks with 2 full-time engineers

### Critical Path Dependencies:
1. Database schema (T-1.1.0) → API endpoints (T-1.2.0)
2. API endpoints (T-1.2.0) → Service layer (T-2.1.0)
3. Service layer (T-2.1.0) → UI components (T-3.X.0)
4. UI components (T-3.X.0) → Feature enhancements (T-4.X.0)
5. All implementation → Testing (T-5.X.0)
6. Testing complete → Deployment (T-6.X.0)

### Risk Areas:
- **Database migration complexity**: Review history as JSONB array requires careful transaction handling
- **Concurrent review actions**: Must test atomicity with high concurrency
- **Performance at scale**: Ensure indexes work correctly with 10,000+ conversations
- **Keyboard shortcut conflicts**: May conflict with browser shortcuts or other app shortcuts

---

## Acceptance Testing Plan

### Test Scenarios for FR6.1.1 (Review Queue Interface)

**Scenario 1: Review Queue Access**
- Given: User is authenticated and has conversations pending review
- When: User navigates to Review Queue page
- Then: Page displays table with all pending_review conversations, sorted by quality score (lowest first)

**Scenario 2: Single Conversation Review**
- Given: User is on Review Queue page
- When: User clicks "Review" button on a conversation
- Then: Modal opens displaying conversation turns side-by-side with source chunk
- And: Review action buttons (Approve, Reject, Request Changes) are displayed

**Scenario 3: Approve Conversation**
- Given: User has conversation review modal open
- When: User clicks "Approve" button
- Then: Conversation status updates to 'approved'
- And: ReviewAction appended to reviewHistory with action='approved'
- And: Modal closes and returns to queue (conversation removed from pending)
- And: Success toast notification displays

**Scenario 4: Reject Conversation with Reasons**
- Given: User has conversation review modal open
- When: User selects rejection reasons (e.g., "Content Accuracy", "Turn Quality")
- And: User enters comment in textarea
- And: User clicks "Reject" button
- Then: Confirmation dialog appears
- When: User confirms rejection
- Then: Conversation status updates to 'rejected'
- And: ReviewAction appended with action='rejected', selected reasons, and comment
- And: Modal closes and conversation removed from queue

**Scenario 5: Keyboard Shortcut Review Flow**
- Given: User has conversation review modal open
- When: User presses "A" key
- Then: Approve action triggers (same as clicking Approve button)
- When: User presses "N" key on next conversation
- Then: Modal advances to next conversation in queue

### Test Scenarios for FR6.1.2 (Quality Feedback Loop)

**Scenario 6: View Template Performance**
- Given: User navigates to Quality Feedback Dashboard
- When: Page loads
- Then: Table displays all templates with usage count, approval rate, avg quality score
- And: Templates are sortable by approval rate, quality score, usage count
- And: Low-performing templates (approval rate < 70%) are flagged with alert icon

**Scenario 7: Identify Low-Performing Template**
- Given: Template "Financial Advice" has approval rate of 45%
- When: User views Quality Feedback Dashboard
- Then: Template is displayed with "Low" performance badge (red color)
- And: Alert icon is shown with tooltip "Needs Revision"
- And: Recommendation section suggests: "Template 'Financial Advice' has low approval rate - review prompt structure"

---

## Documentation Requirements

### Developer Documentation:
- **Database Schema Documentation**: Complete ERD with table relationships, column descriptions, indexes
- **API Endpoint Documentation**: OpenAPI/Swagger spec for all review endpoints
- **Service Layer Documentation**: JSDoc for all service methods with parameter descriptions
- **Component Documentation**: Storybook stories for all UI components
- **Testing Documentation**: Test plan, test data generators, coverage reports

### User Documentation:
- **Review Queue User Guide**: Step-by-step guide for reviewing conversations
- **Keyboard Shortcuts Reference**: Printable quick reference card
- **Quality Feedback Dashboard Guide**: How to interpret metrics and take action
- **FAQ Document**: Common questions about review workflow

### Operations Documentation:
- **Deployment Runbook**: Step-by-step deployment procedure with rollback steps
- **Monitoring Guide**: How to read dashboards and respond to alerts
- **Troubleshooting Guide**: Common issues and solutions
- **Database Migration Log**: Record of all migrations with timestamps and executors

---

## Conclusion

This comprehensive task inventory provides a complete development roadmap for implementing FR6.1 (Review Queue & Quality Feedback Loop) from wireframe prototype to production-ready feature with live data integration. The tasks are organized for optimal development flow, with clear dependencies, acceptance criteria, and testing requirements.

**Next Steps**:
1. Review and approve task list with stakeholders
2. Assign tasks to development team
3. Set up project tracking (e.g., Jira, Linear) with task IDs
4. Begin Foundation & Infrastructure phase (T-1.X.X tasks)
5. Schedule weekly progress reviews

**Success Metrics**:
- All 82 tasks completed and tested
- 95%+ test coverage achieved
- Zero critical bugs in production first month
- Review workflow reduces conversation review time by 80% compared to manual process
- Quality feedback loop results in 20%+ improvement in template approval rates within 3 months

---

**Document Version**: 1.0  
**Generated Date**: 2025-01-29  
**Total Pages**: 60+  
**Total Tasks**: 82  
**Estimated Effort**: 360-440 hours (6-8 weeks with 2 engineers)

