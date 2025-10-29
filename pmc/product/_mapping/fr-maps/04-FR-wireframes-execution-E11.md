# Interactive LoRA Training Platform - Implementation Execution Instructions (E11)
**Generated**: 2025-01-29
**Segment**: E11 - Performance Optimization & Scalability  
**Total Prompts**: 8  
**Estimated Implementation Time**: 180-240 hours

---

## Executive Summary

Segment E11 transforms the wireframe prototype into a production-ready, high-performance application by implementing comprehensive performance optimization and scalability enhancements. This segment addresses FR11.1.1 (Response Time Targets) and FR11.1.2 (Scalability Optimizations), ensuring the platform can handle 10,000+ conversations while maintaining sub-second response times.

**Strategic Importance:**
- **Foundation for Scale**: Establishes performance infrastructure supporting enterprise-level usage
- **User Experience**: Delivers responsive, lag-free interactions meeting professional software standards
- **Production Readiness**: Transforms prototype into production-grade application with monitoring and optimization
- **Competitive Advantage**: Differentiates platform through superior performance vs. competitors

**Scope Coverage:**
- Database performance foundation with strategic indexing and query optimization
- API performance optimization with caching, pagination, and connection pooling
- Frontend performance with React optimization, code splitting, and virtual scrolling
- State management optimization with selective subscriptions and batching
- Client-side caching strategies reducing redundant network requests
- Comprehensive performance monitoring and alerting
- Complete performance testing suite validating all targets

**Success Metrics:**
- Page load: <2 seconds (Lighthouse score >90)
- Table filtering: <300ms for 10,000 conversations
- Table sorting: <200ms for 10,000 conversations
- Database query p95: <100ms
- API response p95: <500ms
- Bundle size: <500KB initial load
- Support for 50+ concurrent users without degradation

---

## Context and Dependencies

### Previous Segment Deliverables

**E10 Analysis**: Assuming E10 completed core UI components, basic data flows, and initial database schema, this segment builds upon:

1. **Wireframe Components (Assumed Complete)**:
   - Dashboard layout with conversation table (`ConversationTable.tsx`)
   - Filter system (`FilterBar.tsx`) with basic functionality
   - Generation modals (`BatchGenerationModal.tsx`, `SingleGenerationForm.tsx`)
   - View components (Templates, Scenarios, EdgeCases, ReviewQueue, Settings)
   - Basic state management (`useAppStore.ts`)

2. **Database Schema (Assumed Established)**:
   - Conversations table with basic structure
   - Conversation_turns normalized table
   - Templates, scenarios, edge_cases tables
   - Basic foreign key relationships
   - Initial indexes (may need optimization)

3. **API Routes (Assumed Functional)**:
   - Basic CRUD endpoints for conversations
   - Document and chunk management endpoints
   - Initial generation endpoints
   - Export functionality

**What E10 Likely Lacks (E11 Addresses)**:
- Performance-optimized database indexes
- Query optimization and monitoring
- API-level caching and rate limiting
- Frontend rendering optimization
- Virtual scrolling for large datasets
- Background job processing
- Performance monitoring dashboard
- Load testing validation

### Current Codebase State

**Strengths to Leverage**:
1. **Clean Architecture**: Well-organized component structure with clear separation of concerns
2. **Type Safety**: Comprehensive TypeScript types defined in `train-wireframe/src/lib/types.ts`
3. **UI Framework**: Shadcn/UI component library providing solid foundation
4. **State Management**: Zustand store with clear state structure
5. **Database Service Layer**: Abstracted database operations in `src/lib/database.ts`

**Areas Requiring Enhancement**:
1. **Database Queries**: Basic queries without optimization, pagination, or indexing strategy
2. **Component Rendering**: No memoization, causing unnecessary re-renders
3. **Data Fetching**: Lack of caching, potential N+1 query problems
4. **Bundle Size**: No code splitting or lazy loading implemented
5. **Monitoring**: No performance metrics collection or dashboards

**Critical Files for Enhancement**:
- `src/lib/database.ts`: Add query optimization, pagination, caching
- `train-wireframe/src/components/dashboard/ConversationTable.tsx`: Add virtual scrolling, memoization
- `train-wireframe/src/components/dashboard/FilterBar.tsx`: Optimize filter application
- `train-wireframe/src/stores/useAppStore.ts`: Add selective subscriptions, batching
- Supabase migrations: Create performance-optimized indexes

### Cross-Segment Dependencies

**Upstream Dependencies (Must Exist)**:
- ✅ Supabase project configured with database schema
- ✅ Next.js application structure with API routes
- ✅ Wireframe components with basic functionality
- ✅ Anthropic Claude API integration for generation
- ✅ Authentication system (Supabase Auth)

**Downstream Impact (E11 Enables)**:
- Future segments can assume performant data access patterns
- Advanced features can build on caching infrastructure
- Real-time features can leverage optimized state management
- Analytics can use performance monitoring data

**External System Dependencies**:
- Supabase: Database performance monitoring requires pg_stat_statements extension
- Anthropic API: Rate limiting must respect API tier limits
- Browser: Virtual scrolling requires modern browser APIs
- Node.js: Background jobs may require worker threads or separate processes

---

## Implementation Strategy

### Risk Assessment

**HIGH-RISK AREAS** (Require Careful Implementation):

1. **Database Migration for Indexes** (Risk Level: HIGH)
   - **Risk**: Creating indexes on large tables can lock tables, causing downtime
   - **Impact**: Production application unavailable during index creation
   - **Mitigation**: 
     - Use `CREATE INDEX CONCURRENTLY` in PostgreSQL to avoid table locks
     - Schedule migrations during low-traffic windows
     - Test on production-scale dataset in staging first
     - Have rollback plan ready

2. **Virtual Scrolling Implementation** (Risk Level: HIGH)
   - **Risk**: Complex refactoring of core table component, potential regressions
   - **Impact**: Breaking existing table functionality, user workflow disruption
   - **Mitigation**:
     - Implement behind feature flag for gradual rollout
     - Extensive testing with various dataset sizes
     - Maintain fallback to standard pagination
     - User acceptance testing before full deployment

3. **State Management Refactoring** (Risk Level: MEDIUM-HIGH)
   - **Risk**: Changing subscription patterns could introduce subtle bugs
   - **Impact**: UI state inconsistencies, data synchronization issues
   - **Mitigation**:
     - Incremental refactoring component by component
     - Comprehensive test coverage before refactoring
     - Monitor error rates closely after deployment
     - Quick rollback capability

**MEDIUM-RISK AREAS** (Standard Implementation Caution):

4. **API Caching Layer** (Risk Level: MEDIUM)
   - **Risk**: Stale data served from cache, cache invalidation complexities
   - **Impact**: Users see outdated information
   - **Mitigation**:
     - Conservative TTL values (5 minutes for dynamic data)
     - Clear cache invalidation strategy on mutations
     - Cache versioning for safe rollout

5. **Code Splitting and Lazy Loading** (Risk Level: MEDIUM)
   - **Risk**: Bundle split points causing loading delays, route transitions feeling slower
   - **Impact**: Perceived performance degradation despite smaller initial bundle
   - **Mitigation**:
     - Strategic split points at route boundaries
     - Prefetch critical routes on hover
     - Skeleton screens for loading states

**LOW-RISK AREAS** (Straightforward Implementation):

6. **Performance Monitoring** (Risk Level: LOW)
   - **Risk**: Monitoring overhead impacts performance
   - **Impact**: Minimal, monitoring is read-only
   - **Mitigation**: Sample metrics collection, async logging

7. **Component Memoization** (Risk Level: LOW)
   - **Risk**: Over-memoization causing stale data
   - **Impact**: Minimal, easily testable
   - **Mitigation**: Careful dependency array management, unit tests

### Prompt Sequencing Logic

**Optimal Implementation Order** (8 Prompts):

**Phase 1: Foundation (Prompts 1-2)** - Database & API Layer
- Start with database because all other layers depend on it
- API optimization follows naturally after database foundation
- These layers are independent of UI, can be developed in parallel with UI work

**Phase 2: Frontend Core (Prompts 3-4)** - React & State Optimization
- Frontend optimization builds on performant backend
- Component and state optimization are tightly coupled, address together
- Establishes patterns for remaining UI work

**Phase 3: Advanced Features (Prompts 5-6)** - Caching & Virtual Scrolling
- Virtual scrolling is most complex UI change, tackle with solid foundation
- Caching strategies leverage both backend and frontend work
- These features provide biggest user-facing performance gains

**Phase 4: Monitoring & Validation (Prompts 7-8)** - Testing & Observability
- Monitoring validates all previous work
- Testing suite ensures quality before production deployment
- These prompts confirm all performance targets met

**Why This Sequence?**
1. **Bottom-Up Approach**: Foundation → Application → Verification
2. **Risk Mitigation**: High-risk database work first when rollback easiest
3. **Dependency Management**: Each prompt builds on completed work
4. **Parallel Development**: Some prompts can be worked simultaneously
5. **Validation at End**: Testing confirms all optimizations effective

### Quality Assurance Approach

**Multi-Layer Validation Strategy**:

1. **Unit Testing** (Per Prompt):
   - Each component/function includes unit tests
   - Performance benchmarks for critical paths
   - Mock data for consistent testing

2. **Integration Testing** (Cross-Prompt):
   - Test data flow from database → API → frontend
   - Validate state management across components
   - End-to-end user workflows

3. **Performance Testing** (Dedicated Prompt 8):
   - Load testing with k6: 50 concurrent users, 10,000 conversations
   - Lighthouse audits for frontend performance
   - Database query analysis with EXPLAIN ANALYZE
   - Response time measurement for all API endpoints

4. **User Acceptance Testing** (Post-Implementation):
   - Real-world usage patterns
   - Subjective performance feel
   - Edge case discovery

**Success Criteria Validation**:
- Every FR acceptance criterion mapped to specific test
- Automated regression testing for performance targets
- Continuous monitoring in production environment

---

## Database Setup Instructions

### Required SQL Operations

**IMPORTANT**: These SQL statements must be executed in Supabase SQL Editor **BEFORE** beginning implementation prompts. Execute them in the order presented to avoid dependency errors.

========================

-- =====================================================
-- E11 DATABASE PERFORMANCE OPTIMIZATION
-- =====================================================
-- Purpose: Create performance-optimized indexes for handling
--          10,000+ conversations with <100ms query response
-- 
-- Execution: Run in Supabase SQL Editor
-- Estimated Time: 5-10 minutes (depends on data volume)
-- Rollback: DROP INDEX statements provided at end
-- =====================================================

-- Enable pg_stat_statements extension for query performance monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- =====================================================
-- PRIMARY INDEXES (T-1.1.1)
-- =====================================================
-- Purpose: Optimize frequently queried single-column filters

-- Status index for filtering by conversation status
CREATE INDEX IF NOT EXISTS idx_conversations_status 
ON conversations(status);

-- Tier index for filtering by conversation tier (template/scenario/edge_case)
CREATE INDEX IF NOT EXISTS idx_conversations_tier 
ON conversations(tier);

-- Quality score index for filtering by quality thresholds
CREATE INDEX IF NOT EXISTS idx_conversations_quality_score 
ON conversations(quality_score);

-- Created timestamp index for date ordering (newest first default)
CREATE INDEX IF NOT EXISTS idx_conversations_created_at 
ON conversations(created_at DESC);

-- Updated timestamp index for recent activity queries
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at 
ON conversations(updated_at DESC);

-- =====================================================
-- COMPOSITE INDEXES (T-1.1.2)
-- =====================================================
-- Purpose: Optimize common multi-column filter combinations

-- Status + Quality composite for filtered dashboard queries
-- Example: "Show me all approved conversations with quality >= 8"
CREATE INDEX IF NOT EXISTS idx_conversations_status_quality 
ON conversations(status, quality_score);

-- Tier + Status + Created composite for sorted filtered views
-- Example: "Show template tier, pending review, newest first"
CREATE INDEX IF NOT EXISTS idx_conversations_tier_status_created 
ON conversations(tier, status, created_at DESC);

-- Partial index for review queue optimization
-- Only indexes conversations needing review, much smaller index size
CREATE INDEX IF NOT EXISTS idx_conversations_review 
ON conversations(created_at DESC) 
WHERE status = 'pending_review';

-- =====================================================
-- JSONB AND ARRAY INDEXES (T-1.1.3)
-- =====================================================
-- Purpose: Enable efficient querying of JSONB and array fields

-- GIN index for parameters JSONB field (flexible metadata queries)
CREATE INDEX IF NOT EXISTS idx_conversations_parameters 
ON conversations USING GIN (parameters jsonb_path_ops);

-- GIN index for category array (multi-category filtering)
CREATE INDEX IF NOT EXISTS idx_conversations_category 
ON conversations USING GIN (category);

-- GIN index for review_history JSONB (audit trail queries)
CREATE INDEX IF NOT EXISTS idx_conversations_review_history 
ON conversations USING GIN (review_history);

-- =====================================================
-- FULL-TEXT SEARCH INDEX (T-1.1.4)
-- =====================================================
-- Purpose: Enable fast text search across title, persona, emotion

-- Add generated tsvector column for full-text search
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS search_vector tsvector 
GENERATED ALWAYS AS (
  to_tsvector('english', 
    coalesce(title, '') || ' ' || 
    coalesce(persona, '') || ' ' || 
    coalesce(emotion, '')
  )
) STORED;

-- GIN index on search vector for fast full-text queries
CREATE INDEX IF NOT EXISTS idx_conversations_search 
ON conversations USING GIN (search_vector);

-- =====================================================
-- CONVERSATION TURNS TABLE INDEXES
-- =====================================================
-- Purpose: Optimize joins and lookups in normalized turns table

-- Foreign key index for efficient joins
CREATE INDEX IF NOT EXISTS idx_conversation_turns_conversation_id 
ON conversation_turns(conversation_id);

-- Composite index for ordered turn retrieval
CREATE INDEX IF NOT EXISTS idx_conversation_turns_conversation_turn 
ON conversation_turns(conversation_id, turn_number);

-- =====================================================
-- GENERATION LOGS TABLE INDEXES
-- =====================================================
-- Purpose: Optimize audit trail and performance monitoring queries

-- Conversation ID index for retrieving conversation generation history
CREATE INDEX IF NOT EXISTS idx_generation_logs_conversation_id 
ON generation_logs(conversation_id);

-- Created timestamp index for time-series analysis
CREATE INDEX IF NOT EXISTS idx_generation_logs_created_at 
ON generation_logs(created_at DESC);

-- Template ID index for template performance analysis
CREATE INDEX IF NOT EXISTS idx_generation_logs_template_id 
ON generation_logs(template_id);

-- =====================================================
-- STATISTICS UPDATE
-- =====================================================
-- Purpose: Update query planner statistics for accurate cost estimation

ANALYZE conversations;
ANALYZE conversation_turns;
ANALYZE generation_logs;

-- =====================================================
-- VERIFY INDEX CREATION
-- =====================================================
-- Purpose: Confirm all indexes created successfully

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('conversations', 'conversation_turns', 'generation_logs')
ORDER BY tablename, indexname;

-- =====================================================
-- ROLLBACK SCRIPT (USE ONLY IF NEEDED)
-- =====================================================
-- WARNING: Only execute if you need to remove these indexes
-- Uncomment and run individually if rollback required

/*
DROP INDEX IF EXISTS idx_conversations_status;
DROP INDEX IF EXISTS idx_conversations_tier;
DROP INDEX IF EXISTS idx_conversations_quality_score;
DROP INDEX IF EXISTS idx_conversations_created_at;
DROP INDEX IF EXISTS idx_conversations_updated_at;
DROP INDEX IF EXISTS idx_conversations_status_quality;
DROP INDEX IF EXISTS idx_conversations_tier_status_created;
DROP INDEX IF EXISTS idx_conversations_review;
DROP INDEX IF EXISTS idx_conversations_parameters;
DROP INDEX IF EXISTS idx_conversations_category;
DROP INDEX IF EXISTS idx_conversations_review_history;
DROP INDEX IF EXISTS idx_conversations_search;
ALTER TABLE conversations DROP COLUMN IF EXISTS search_vector;
DROP INDEX IF EXISTS idx_conversation_turns_conversation_id;
DROP INDEX IF EXISTS idx_conversation_turns_conversation_turn;
DROP INDEX IF EXISTS idx_generation_logs_conversation_id;
DROP INDEX IF EXISTS idx_generation_logs_created_at;
DROP INDEX IF EXISTS idx_generation_logs_template_id;
*/

-- =====================================================
-- POST-EXECUTION VALIDATION
-- =====================================================
-- Run these queries to validate performance improvements

-- Test 1: Verify index usage for common queries
EXPLAIN ANALYZE
SELECT * FROM conversations
WHERE status = 'approved' 
AND quality_score >= 8
ORDER BY created_at DESC
LIMIT 25;
-- Expected: Should use idx_conversations_status_quality

-- Test 2: Verify full-text search performance
EXPLAIN ANALYZE
SELECT * FROM conversations
WHERE search_vector @@ to_tsquery('english', 'anxious & investor');
-- Expected: Should use idx_conversations_search

-- Test 3: Check index bloat (should be low initially)
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    idx_scan AS number_of_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename IN ('conversations', 'conversation_turns', 'generation_logs')
ORDER BY pg_relation_size(indexrelid) DESC;

++++++++++++++++++

### Post-Execution Verification

After executing the SQL operations above, verify successful completion:

1. **Confirm Index Creation**: 
   - Run the "VERIFY INDEX CREATION" query
   - Should see 15+ indexes listed for conversations, conversation_turns, generation_logs tables

2. **Test Query Performance**:
   - Run the three validation queries at the end
   - All should complete in <100ms with appropriate index usage

3. **Check for Errors**:
   - Review Supabase logs for any constraint violations or errors
   - Confirm no blocking operations or lock waits

4. **Monitor Production Impact** (if running on production):
   - Watch active connections during index creation
   - Monitor API response times for any degradation
   - Be ready to kill long-running queries if needed

**Expected Execution Time**: 5-10 minutes for empty/small database, 30-60 minutes for database with 10,000+ conversations.

**Common Issues & Solutions**:
- **Issue**: "relation does not exist" → Table names may be different in your schema
- **Issue**: Index creation taking very long → Database too large for CONCURRENTLY, schedule during maintenance window
- **Issue**: Out of disk space → Indexes require significant disk space, free up space before retry

---

## Implementation Prompts

### Prompt 1: API Performance Optimization & Pagination
**Scope**: Optimize conversation list API with cursor-based pagination, caching, and query optimization  
**Dependencies**: Database indexes must be created (SQL operations above)  
**Estimated Time**: 16-20 hours  
**Risk Level**: Medium

========================

You are a senior backend developer implementing API performance optimization for the Interactive LoRA Training Platform. Your goal is to transform the basic conversation listing API into a production-grade, high-performance endpoint capable of handling 10,000+ conversations with <200ms response times.

**CONTEXT AND REQUIREMENTS:**

**Product Context:**
The Interactive LoRA Training Platform enables small businesses to generate 90-100 high-quality training conversations for LoRA fine-tuning. The conversation dashboard is the primary interface where users filter, sort, and manage thousands of conversations. Current implementation has basic pagination and querying, but lacks optimization for production scale.

**Functional Requirements Being Implemented:**
- FR11.1.1: API responses optimized for <100ms for simple queries
- FR11.1.2: Cursor-based pagination implemented for large result sets
- FR11.1.2: Response caching implemented for template and scenario data
- FR11.1.2: Database connection pooling optimized

**Technical Architecture:**
- Next.js 14 API Routes (serverless functions)
- Supabase PostgreSQL database with new performance indexes
- TypeScript with strict mode
- Database service layer abstraction in `src/lib/database.ts`

**CURRENT CODEBASE STATE:**

**Existing Database Service** (`src/lib/database.ts`):
```typescript
export const documentService = {
  async getAll() {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
}
```
**Issues**: No pagination, loads all records, no selective field loading, no caching

**Existing API Endpoint** (assumed pattern):
```typescript
// src/app/api/conversations/route.ts
export async function GET(request: Request) {
  const conversations = await conversationService.getAll();
  return Response.json(conversations);
}
```
**Issues**: No query parameters for filtering, no pagination, no performance monitoring

**IMPLEMENTATION TASKS:**

**Task Group T-1.2.1: Conversation List API Optimization**

1. **Create Cursor-Based Pagination Service Method**:
   - Add method `conversationService.getPage(options)` to `src/lib/database.ts`
   - Accept parameters: `limit` (default 25), `cursor` (id + created_at composite), `filters`, `sortBy`, `sortDir`
   - Use indexed columns from database setup (status, quality_score, tier, created_at)
   - Implement cursor logic: `WHERE (created_at, id) < (cursor_date, cursor_id)` for consistent pagination
   - Return: `{ data: Conversation[], nextCursor: string | null, hasMore: boolean, totalCount: number }`

2. **Selective Field Loading**:
   - Identify minimum fields needed for table view: id, title, persona, emotion, tier, status, qualityScore, totalTurns, createdAt
   - Modify select query to only fetch required fields, not full conversation object
   - Separate method for fetching full conversation with turns: `conversationService.getById(id)`
   - Reduce payload size by 60-70% for list views

3. **Filter Query Optimization**:
   - Build dynamic WHERE clauses using indexed fields
   - Support filters from FilterBar component: status (array), tier (array), quality (range), search (text), dateRange
   - Use parameterized queries to prevent SQL injection
   - Leverage composite indexes for multi-column filters
   - Example: `status IN ('approved', 'pending_review') AND quality_score >= 8 AND tier = 'template'`

4. **Count Query Optimization**:
   - Create separate efficient count endpoint: `GET /api/conversations/count`
   - Use same filters as main query but only return count
   - Optimize with covering indexes to avoid table scan
   - Cache count results for 30 seconds (stale counts acceptable for pagination)

5. **Update API Route with Pagination**:
   - Modify `src/app/api/conversations/route.ts` to accept query params
   - Parse pagination params: `limit`, `cursor`, `status[]`, `tier[]`, `quality_min`, `quality_max`, `search`, `start_date`, `end_date`
   - Validate params and apply sensible defaults
   - Return paginated response with metadata

**Task Group T-1.2.2: Response Caching Strategy**

1. **Create Cache Service**:
   - New file: `src/lib/cache.ts`
   - Implement in-memory cache using Map with TTL cleanup
   - Methods: `get(key)`, `set(key, value, ttl)`, `invalidate(key)`, `clear(pattern)`
   - TTL in seconds, default 300 (5 minutes)
   - Automatic cleanup of expired entries every 60 seconds

2. **Cache Template and Scenario Data**:
   - Wrap template API calls with cache layer (5-minute TTL)
   - Wrap scenario API calls with cache layer (5-minute TTL)
   - Cache key format: `templates:all`, `scenarios:all`, `templates:${id}`
   - Invalidate cache on template/scenario updates

3. **Cache Invalidation Hooks**:
   - On conversation status update: invalidate count cache
   - On template update: invalidate `templates:*`
   - On scenario update: invalidate `scenarios:*`
   - Add `X-Cache-Hit: true/false` header for debugging

**Task Group T-1.2.3: Database Connection Pooling**

1. **Configure Supabase Client for Performance**:
   - Review `src/lib/supabase.ts` configuration
   - Set connection pool size appropriate for serverless (10-20 connections)
   - Configure connection timeout: 30 seconds
   - Enable prepared statement caching

2. **Connection Pool Monitoring**:
   - Create endpoint: `GET /api/admin/db-stats` (admin only)
   - Expose: active connections, idle connections, waiting queries
   - Log pool exhaustion warnings

**Task Group T-1.2.4: Request/Response Compression**

1. **Enable Compression in Next.js**:
   - Update `next.config.js` to enable built-in compression
   - Configure compression for JSON responses (API routes)

2. **Add Compression Middleware**:
   - Create `src/middleware.ts` if not exists
   - Add compression headers: `Content-Encoding: gzip`
   - Filter by Content-Type: compress JSON, HTML, CSS, JS

**ACCEPTANCE CRITERIA:**

✅ Cursor-based pagination working with consistent results across page boundaries
✅ API response time <200ms for 25-item page with filters (tested with 10,000 conversations)
✅ Count query executes in <50ms
✅ Selective field loading reduces payload size by 60%+
✅ Template/scenario caching achieves 80%+ hit rate
✅ Compressed responses show 70%+ size reduction for JSON
✅ Connection pool utilization stays below 80% under load (50 concurrent requests)
✅ All queries use appropriate indexes (verify with EXPLAIN ANALYZE)

**TECHNICAL SPECIFICATIONS:**

**File Locations:**
- `src/lib/database.ts` - Update conversationService methods
- `src/lib/cache.ts` - New cache service
- `src/lib/supabase.ts` - Update connection configuration
- `src/app/api/conversations/route.ts` - Update with pagination
- `src/app/api/conversations/count/route.ts` - New count endpoint
- `src/app/api/admin/db-stats/route.ts` - New monitoring endpoint
- `src/middleware.ts` - Add compression middleware
- `next.config.js` - Enable compression

**Data Models:**
```typescript
// Pagination options
interface PaginationOptions {
  limit?: number; // default 25, max 100
  cursor?: string; // base64 encoded {created_at, id}
  filters?: {
    status?: ConversationStatus[];
    tier?: TierType[];
    quality_min?: number;
    quality_max?: number;
    search?: string;
    start_date?: string;
    end_date?: string;
  };
  sortBy?: 'created_at' | 'updated_at' | 'quality_score';
  sortDir?: 'asc' | 'desc';
}

// Paginated response
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
    totalCount: number;
  };
  meta: {
    cached: boolean;
    query_time_ms: number;
  };
}
```

**Query Optimization Patterns:**
```typescript
// Efficient pagination query
const { data, error } = await supabase
  .from('conversations')
  .select('id, title, persona, emotion, tier, status, quality_score, total_turns, created_at')
  .order('created_at', { ascending: false })
  .order('id', { ascending: false }) // tie-breaker for consistent pagination
  .lt('created_at', cursorDate)
  .limit(limit + 1); // fetch one extra to determine hasMore

const hasMore = data.length > limit;
const results = data.slice(0, limit);
const nextCursor = hasMore ? encodeCursor(results[results.length - 1]) : null;
```

**Error Handling:**
- Invalid cursor: Return 400 with clear message
- Database timeout: Return 504 Gateway Timeout
- Cache errors: Log but don't fail request, fetch from database
- Connection pool exhausted: Return 503 Service Unavailable with retry-after header

**Performance Monitoring:**
- Log query execution time for all database calls
- Track cache hit rate metrics
- Monitor API response times (p50, p95, p99)
- Alert on slow queries (>500ms)

**VALIDATION REQUIREMENTS:**

1. **Functional Testing**:
   - Test pagination through 10,000 conversations
   - Verify cursor consistency (same conversation doesn't appear twice)
   - Test all filter combinations
   - Verify count accuracy

2. **Performance Testing**:
   - Load test: 50 concurrent users, measure p95 response time <500ms
   - Query analysis: EXPLAIN ANALYZE showing index usage
   - Cache hit rate monitoring: achieve 80%+ for templates/scenarios

3. **Edge Cases**:
   - Empty result set handling
   - Last page detection
   - Concurrent updates during pagination
   - Invalid filter parameters

**DELIVERABLES:**

1. Updated `src/lib/database.ts` with optimized conversationService
2. New `src/lib/cache.ts` with TTL-based caching
3. Updated `src/app/api/conversations/route.ts` with pagination
4. New `src/app/api/conversations/count/route.ts`
5. New `src/app/api/admin/db-stats/route.ts` for monitoring
6. Updated `src/middleware.ts` with compression
7. Updated `next.config.js` with compression config
8. Performance test results documenting response times

Implement this optimization completely, ensuring all acceptance criteria are met. Document any design decisions and performance trade-offs made during implementation.

++++++++++++++++++

### Prompt 2: Frontend Component Rendering Optimization
**Scope**: Optimize React components with memoization, optimize filtering and sorting logic  
**Dependencies**: Prompt 1 (API pagination) should be complete  
**Estimated Time**: 18-22 hours  
**Risk Level**: Medium

========================

You are a senior React developer implementing frontend performance optimization for the Interactive LoRA Training Platform dashboard. Your goal is to eliminate unnecessary re-renders, optimize filtering and sorting, and ensure the UI remains responsive even with large datasets.

**CONTEXT AND REQUIREMENTS:**

**Product Context:**
The conversation table is the most frequently used interface, displaying 25-100 conversations at a time with real-time filtering and sorting. Current implementation causes full component tree re-renders on every state change, leading to laggy interactions with large datasets.

**Functional Requirements Being Implemented:**
- FR11.1.1: Table filtering responds within 300ms
- FR11.1.1: Table sorting responds within 200ms
- FR11.1.2: Handles 10,000+ rows without performance degradation
- FR11.1.1: Page load completes within 2 seconds

**CURRENT CODEBASE STATE:**

**ConversationTable Component** (`train-wireframe/src/components/dashboard/ConversationTable.tsx`):
- Currently around 315 lines
- Renders all conversation rows directly in map function
- No memoization, causing re-renders on unrelated state changes
- Sorting logic triggers full re-render
- No optimization of event handlers

**DashboardView Component** (`train-wireframe/src/components/dashboard/DashboardView.tsx`):
- Contains filtering logic with useMemo
- Dependencies may not be optimally configured
- Renders entire component tree on filter change

**State Management** (`train-wireframe/src/stores/useAppStore.ts`):
- Zustand store with conversations array
- Components may be subscribing to entire store
- No selective subscription implementation

**IMPLEMENTATION TASKS:**

**Task Group T-1.3.1: Component Rendering Optimization**

1. **Memoize ConversationTable Component**:
   - Wrap ConversationTable export with React.memo
   - Create custom comparison function checking only relevant props: `conversations`, `onSelectConversation`, `selectedIds`
   - Prevent re-render when unrelated state changes (e.g., sidebar collapsed)

2. **Memoize Individual Table Rows**:
   - Extract ConversationRow as separate component
   - Wrap with React.memo and custom comparison
   - Only re-render when conversation data changes or selection state changes
   - Compare by conversation.id and conversation.updated_at

3. **Optimize Event Handlers with useCallback**:
   - Wrap all event handlers in useCallback with stable dependencies
   - Handlers to optimize: onRowClick, onCheckboxChange, onActionMenuOpen
   - Ensure callbacks don't recreate on every render

4. **Optimize FilterBar Dependencies**:
   - Review useMemo dependencies in DashboardView filtering logic
   - Ensure minimal dependencies: only filter values, not entire filterConfig object
   - Extract filter application logic to separate memoized function

5. **Implement Shallow Equality for Store Subscriptions**:
   - Update store subscriptions to use selector functions
   - Example: `const conversations = useAppStore(state => state.conversations, shallow)`
   - Prevent re-render when other store properties change

**Task Group T-3.1.1: Filtering Performance Optimization**

1. **Optimize Filter Logic**:
   - Current location: `train-wireframe/src/components/dashboard/DashboardView.tsx:23-50`
   - Profile current performance with 10,000 conversations
   - Optimize filter chain with early bailout for non-matching items
   - Use indexed Map for O(1) ID lookups instead of array.find()

2. **Create Conversation Index Map**:
   - Build Map<string, Conversation> on conversations load
   - Update map on conversation changes (add/update/delete)
   - Use map for fast ID-based lookups in selection logic

3. **Debounce Search Input**:
   - FilterBar search input triggers filtering on every keystroke
   - Add 150ms debounce to search input
   - Show "Searching..." indicator during debounce

4. **Memoize Filter Results Aggressively**:
   - Current useMemo may have too many dependencies
   - Split into multiple memos: statusFilter, tierFilter, qualityFilter, searchFilter
   - Combine results only when any filter changes
   - Cache filter results by filter hash

**Task Group T-3.1.2: Sorting Performance Optimization**

1. **Stable Sort Implementation**:
   - Current sort in ConversationTable.tsx:73-82
   - Implement stable sort with secondary sort key (id) for consistent results
   - Cache sort comparator function with useMemo

2. **Type-Specific Sort Comparators**:
   - Optimize comparisons by data type
   - String: localeCompare with caching
   - Number: direct comparison
   - Date: timestamp comparison
   - Quality score: numeric comparison with index usage

3. **Memoize Sorted Results**:
   - Wrap sorting logic in useMemo with dependencies: [filteredConversations, sortConfig]
   - Only re-sort when data or sort config changes
   - Show sorting indicator during sort operation (>100ms)

**Task Group T-2.2.0: State Management Optimization**

1. **Implement Selective Store Subscriptions**:
   - Replace destructured store access with selector functions
   - Example: Replace `const { conversations, filterConfig } = useAppStore()` with individual selectors
   - Use shallow equality comparator for object/array selections

2. **State Update Batching**:
   - Create batchUpdate action in Zustand store
   - Batch multiple filter changes into single state update
   - Reduce render count by 60%+ for filter operations

**ACCEPTANCE CRITERIA:**

✅ React DevTools Profiler shows 50%+ reduction in component re-renders
✅ Filtering 10,000 conversations completes in <300ms
✅ Sorting 10,000 conversations completes in <200ms
✅ Changing unrelated state (sidebar toggle) doesn't re-render table
✅ Search input debounced, no filtering on every keystroke
✅ Event handlers maintain stable references across renders
✅ Store subscriptions selective, only trigger on relevant state changes
✅ Memory usage reasonable (<100MB for 10,000 conversations in table)

**TECHNICAL SPECIFICATIONS:**

**File Locations:**
- `train-wireframe/src/components/dashboard/ConversationTable.tsx` - Memoize table and rows
- `train-wireframe/src/components/dashboard/DashboardView.tsx` - Optimize filtering
- `train-wireframe/src/components/dashboard/FilterBar.tsx` - Add debounce to search
- `train-wireframe/src/stores/useAppStore.ts` - Review store structure for selective subscriptions
- `train-wireframe/src/hooks/use-debounced-value.ts` - New debounce hook

**Memoization Pattern Examples:**

```typescript
// Memoized table component
export const ConversationTable = React.memo(function ConversationTable({
  conversations,
  selectedIds,
  onSelectConversation
}: ConversationTableProps) {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if conversations or selection changed
  return prevProps.conversations === nextProps.conversations &&
         prevProps.selectedIds === nextProps.selectedIds;
});

// Memoized row component
const ConversationRow = React.memo(function ConversationRow({
  conversation,
  isSelected,
  onSelect
}: ConversationRowProps) {
  // Row rendering
}, (prevProps, nextProps) => {
  return prevProps.conversation.id === nextProps.conversation.id &&
         prevProps.conversation.updated_at === nextProps.conversation.updated_at &&
         prevProps.isSelected === nextProps.isSelected;
});

// Optimized event handlers
const handleRowClick = useCallback((conversationId: string) => {
  onSelectConversation(conversationId);
}, [onSelectConversation]); // stable dependency

// Optimized filtering with early bailout
const filteredConversations = useMemo(() => {
  let results = conversations;
  
  // Early bailout if no filters applied
  if (!hasActiveFilters(filterConfig)) {
    return results;
  }
  
  // Status filter (fastest, filter early)
  if (filterConfig.status?.length > 0) {
    const statusSet = new Set(filterConfig.status);
    results = results.filter(c => statusSet.has(c.status));
  }
  
  // Quality filter (range check)
  if (filterConfig.quality_min !== undefined) {
    results = results.filter(c => c.qualityScore >= filterConfig.quality_min!);
  }
  
  // Search filter (most expensive, do last)
  if (filterConfig.search) {
    const searchLower = filterConfig.search.toLowerCase();
    results = results.filter(c => 
      c.title.toLowerCase().includes(searchLower) ||
      c.persona.toLowerCase().includes(searchLower) ||
      c.emotion.toLowerCase().includes(searchLower)
    );
  }
  
  return results;
}, [conversations, filterConfig.status, filterConfig.quality_min, filterConfig.search]);

// Selective store subscription
const conversations = useAppStore(state => state.conversations);
const setConversations = useAppStore(state => state.setConversations);
// Don't subscribe to entire store: const store = useAppStore();
```

**Debounce Implementation:**

```typescript
// useDebouncedValue hook (create in train-wireframe/src/hooks/use-debounced-value.ts)
import { useState, useEffect } from 'react';

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// Usage in FilterBar.tsx
const [searchInput, setSearchInput] = useState('');
const debouncedSearch = useDebouncedValue(searchInput, 150);

useEffect(() => {
  setFilterConfig({ ...filterConfig, search: debouncedSearch });
}, [debouncedSearch]);
```

**Performance Profiling:**

Use React DevTools Profiler to measure before/after:
1. Record profiling session while filtering and sorting
2. Measure "Why did this render?" for ConversationTable
3. Compare render count before and after optimization
4. Document improvement percentage

**Error Handling:**
- Memoization errors: Fall back to non-memoized rendering with error boundary
- Performance degradation: Log slow operations (>300ms) for investigation
- Memory leaks: Ensure cleanup in useEffect hooks

**VALIDATION REQUIREMENTS:**

1. **Performance Benchmarks**:
   - Test with 1,000, 5,000, 10,000 conversations
   - Measure filtering time with console.time()
   - Measure sorting time with performance.now()
   - Use React DevTools Profiler for render metrics

2. **Functional Testing**:
   - Verify filtering produces correct results
   - Verify sorting maintains stability
   - Test all filter combinations
   - Test rapid filter changes (debounce)

3. **Memory Profiling**:
   - Use Chrome DevTools Memory Profiler
   - Check for memory leaks during prolonged use
   - Verify garbage collection working correctly

**DELIVERABLES:**

1. Optimized ConversationTable.tsx with memoization
2. Optimized DashboardView.tsx with efficient filtering
3. Optimized FilterBar.tsx with debounced search
4. New useDebouncedValue hook
5. Performance benchmark results (before/after comparison)
6. React DevTools Profiler screenshots showing improvement
7. Documentation of optimization techniques used

Implement this optimization completely, ensuring all acceptance criteria are met. Pay special attention to maintaining functionality while improving performance.

++++++++++++++++++

### Prompt 3: Virtual Scrolling & Code Splitting
**Scope**: Implement virtual scrolling for large datasets and code splitting for bundle size optimization  
**Dependencies**: Prompts 1 & 2 (API pagination and component optimization) must be complete  
**Estimated Time**: 24-28 hours  
**Risk Level**: High

========================

You are a senior frontend engineer implementing advanced performance optimizations for the Interactive LoRA Training Platform. Your focus is on virtual scrolling to handle 10,000+ row tables efficiently and code splitting to achieve <500KB initial bundle size.

**CONTEXT AND REQUIREMENTS:**

**Product Context:**
Users need to scroll through large lists of conversations efficiently. Current implementation renders all visible rows, causing performance issues with 1000+ conversations even with pagination. Code splitting will reduce initial page load time by loading components on demand.

**Functional Requirements Being Implemented:**
- FR11.1.2: Virtual scrolling implemented for large lists
- FR11.1.1: Bundle size <500KB initial load
- FR11.1.1: Time to Interactive (TTI) <3 seconds
- FR11.1.2: Lazy loading used for conversation details

**CURRENT CODEBASE STATE:**

**ConversationTable** (`train-wireframe/src/components/dashboard/ConversationTable.tsx`):
- Renders all rows in visible page
- No windowing or virtualization
- Performance degrades with 100+ rows per page

**App Routing** (`train-wireframe/src/App.tsx`):
- All route components imported at top level
- No lazy loading, single large bundle
- Modal components imported eagerly

**IMPLEMENTATION TASKS:**

**Task Group T-1.3.2: Virtual Scrolling Implementation**

1. **Install and Configure react-window**:
   - Add react-window dependency: `npm install react-window @types/react-window`
   - Import FixedSizeList or VariableSizeList component

2. **Refactor TableBody for Virtual Scrolling**:
   - Replace standard table body with react-window FixedSizeList
   - Calculate row height: 60px for standard row, 120px for expanded
   - Implement custom row renderer component
   - Maintain table styling within virtual list

3. **Handle Dynamic Row Heights**:
   - Use VariableSizeList if rows have variable heights
   - Calculate height based on content (expanded detail view)
   - Update height on row expansion/collapse
   - Cache calculated heights for performance

4. **Preserve Scroll Position**:
   - Store scroll position in Zustand store
   - Restore scroll position on navigation back to table
   - Handle scroll to specific conversation (deep linking)

5. **Maintain Keyboard Navigation**:
   - Ensure arrow key navigation works with virtual list
   - Focus management for accessibility
   - Scroll to focused item if not visible

**Task Group T-1.3.3: Code Splitting and Lazy Loading**

1. **Route-Based Code Splitting**:
   - Convert all route components to lazy imports
   - Wrap with React.lazy and Suspense
   - Create route-level chunks

```typescript
// Before
import { DashboardView } from './components/dashboard/DashboardView';
import { TemplatesView } from './components/views/TemplatesView';

// After
const DashboardView = lazy(() => import('./components/dashboard/DashboardView'));
const TemplatesView = lazy(() => import('./components/views/TemplatesView'));
```

2. **Modal Lazy Loading**:
   - Lazy load modal components (BatchGenerationModal, ExportModal, etc.)
   - Load on demand when modal opened
   - Preload on button hover for instant feel

3. **Heavy Component Lazy Loading**:
   - Identify large dependencies (charts, rich editors)
   - Lazy load with dynamic imports
   - Show skeleton while loading

4. **Suspense Boundaries with Loading States**:
   - Add Suspense wrapper with Skeleton fallback
   - Create consistent loading UI across app
   - Prevent layout shift during lazy load

5. **Analyze Bundle with webpack-bundle-analyzer**:
   - Install analyzer: `npm install --save-dev webpack-bundle-analyzer`
   - Run build with analysis: `npm run build --analyze`
   - Document chunk sizes before/after optimization

**ACCEPTANCE CRITERIA:**

✅ Virtual scrolling handles 10,000 conversations smoothly (60fps scrolling)
✅ Memory usage reduced by 80%+ for large lists (only visible rows in memory)
✅ Scroll position persists across navigation
✅ Keyboard navigation maintained with virtual scrolling
✅ Initial bundle size <500KB (measured with Lighthouse)
✅ Route chunks load in <500ms on fast 3G
✅ Lazy-loaded components preload on hover for instant feel
✅ No layout shift during component lazy loading (CLS <0.1)

**TECHNICAL SPECIFICATIONS:**

**File Locations:**
- `train-wireframe/src/components/dashboard/ConversationTable.tsx` - Add virtual scrolling
- `train-wireframe/src/App.tsx` - Add lazy route loading
- `train-wireframe/src/components/generation/BatchGenerationModal.tsx` - Make lazy loadable
- `train-wireframe/src/components/export/ExportModal.tsx` - Make lazy loadable
- `train-wireframe/src/components/ui/skeleton.tsx` - Enhanced loading states
- `train-wireframe/src/stores/useAppStore.ts` - Add scroll position state
- `package.json` - Add react-window dependency

**Virtual Scrolling Implementation:**

```typescript
import { FixedSizeList } from 'react-window';

// ConversationTable with virtual scrolling
export function ConversationTable({ conversations, selectedIds }: Props) {
  const ROW_HEIGHT = 60;
  const TABLE_HEIGHT = 600; // or dynamically calculate
  
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const conversation = conversations[index];
    return (
      <div style={style}>
        <ConversationRow
          conversation={conversation}
          isSelected={selectedIds.includes(conversation.id)}
          onSelect={handleSelect}
        />
      </div>
    );
  }, [conversations, selectedIds, handleSelect]);
  
  return (
    <FixedSizeList
      height={TABLE_HEIGHT}
      itemCount={conversations.length}
      itemSize={ROW_HEIGHT}
      width="100%"
      overscanCount={5}
    >
      {Row}
    </FixedSizeList>
  );
}
```

**Code Splitting Pattern:**

```typescript
// App.tsx route definitions
const DashboardView = lazy(() => import('./components/dashboard/DashboardView'));
const TemplatesView = lazy(() => import('./components/views/TemplatesView'));
const ScenariosView = lazy(() => import('./components/views/ScenariosView'));
const EdgeCasesView = lazy(() => import('./components/views/EdgeCasesView'));
const ReviewQueueView = lazy(() => import('./components/views/ReviewQueueView'));
const SettingsView = lazy(() => import('./components/views/SettingsView'));

function App() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Routes>
        <Route path="/" element={<DashboardView />} />
        <Route path="/templates" element={<TemplatesView />} />
        <Route path="/scenarios" element={<ScenariosView />} />
        <Route path="/edge-cases" element={<EdgeCasesView />} />
        <Route path="/review" element={<ReviewQueueView />} />
        <Route path="/settings" element={<SettingsView />} />
      </Routes>
    </Suspense>
  );
}

// Modal lazy loading with preload on hover
const BatchGenerationModal = lazy(() => import('./components/generation/BatchGenerationModal'));

function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const preloadModal = () => {
    // Preload on hover for instant feel
    import('./components/generation/BatchGenerationModal');
  };
  
  return (
    <>
      <Button 
        onClick={() => setIsModalOpen(true)}
        onMouseEnter={preloadModal}
      >
        Generate All
      </Button>
      
      {isModalOpen && (
        <Suspense fallback={<ModalSkeleton />}>
          <BatchGenerationModal />
        </Suspense>
      )}
    </>
  );
}
```

**Skeleton Loading States:**

```typescript
// DashboardSkeleton component
export function DashboardSkeleton() {
  return (
    <div className="p-6">
      <Skeleton className="h-12 w-64 mb-6" /> {/* Header */}
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-10 w-32" /> {/* Filter button */}
        <Skeleton className="h-10 w-32" /> {/* Generate button */}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" /> {/* Table rows */}
        ))}
      </div>
    </div>
  );
}
```

**Error Handling:**
- Virtual scroll errors: Fall back to standard pagination
- Lazy load failures: Show error boundary with retry option
- Network errors during chunk load: Cache chunks for offline use

**Performance Monitoring:**
- Measure Time to Interactive (TTI) with Lighthouse
- Track bundle size with webpack-bundle-analyzer
- Monitor scroll performance with FPS meter
- Measure memory usage with Chrome DevTools

**VALIDATION REQUIREMENTS:**

1. **Virtual Scrolling Tests**:
   - Load 10,000 conversations, measure FPS during scroll (target 60fps)
   - Test memory usage before/after (target 80%+ reduction)
   - Test scroll position persistence
   - Test keyboard navigation

2. **Code Splitting Tests**:
   - Measure initial bundle size with Lighthouse (target <500KB)
   - Test lazy load performance on slow 3G
   - Verify no layout shift (CLS <0.1)
   - Test preload on hover functionality

3. **Integration Tests**:
   - Verify all routes load correctly
   - Test modal lazy loading
   - Verify error boundaries catch lazy load failures

**DELIVERABLES:**

1. Updated ConversationTable.tsx with react-window virtual scrolling
2. Updated App.tsx with lazy route loading
3. Lazy-loadable modal components
4. Enhanced Skeleton components for loading states
5. webpack-bundle-analyzer report (before/after)
6. Lighthouse audit results (TTI, bundle size)
7. Performance test results (FPS, memory usage)
8. Updated package.json with new dependencies

Implement this optimization completely, ensuring all acceptance criteria are met. Document performance improvements with concrete metrics.

++++++++++++++++++

### Prompt 4: Client-Side Caching & Network Optimization
**Scope**: Implement client-side caching strategy and network request optimization  
**Dependencies**: Prompts 1-3 complete  
**Estimated Time**: 20-24 hours  
**Risk Level**: Medium

========================

You are a senior frontend engineer implementing client-side caching and network optimization for the Interactive LoRA Training Platform. Your goal is to minimize redundant network requests and improve perceived performance through intelligent caching strategies.

**CONTEXT AND REQUIREMENTS:**

**Product Context:**
Template and scenario data is relatively static and accessed frequently. Current implementation fetches this data on every page load and navigation, wasting bandwidth and slowing down the application. Client-side caching will reduce API calls by 70%+ and improve responsiveness.

**Functional Requirements Being Implemented:**
- FR11.1.2: Template and scenario data cached with 5-minute TTL
- FR11.1.2: Cache hit rate >80% for static data
- FR11.1.1: Request deduplication prevents redundant API calls
- FR11.1.1: Response compression reduces payload size by 70%+

**CURRENT CODEBASE STATE:**

**API Calls**:
- No caching layer, every request hits network
- No request deduplication
- Potential for race conditions with concurrent identical requests

**Data Fetching**:
- Templates fetched on every templates view load
- Scenarios fetched on every scenarios view load
- No stale-while-revalidate pattern

**IMPLEMENTATION TASKS:**

**Task Group T-4.1.0: Client-Side Caching Strategy**

1. **Create Client Cache Service**:
   - New file: `train-wireframe/src/lib/client-cache.ts`
   - Implement Map-based cache with TTL support
   - Methods: get, set, invalidate, clear, has
   - Automatic cleanup of expired entries

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ClientCache {
  private cache = new Map<string, CacheEntry<any>>();
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  set<T>(key: string, data: T, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  invalidate(key: string): void {
    this.cache.delete(key);
  }
  
  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

export const clientCache = new ClientCache();
```

2. **Implement Cached API Client**:
   - Create wrapper around fetch with cache layer
   - Check cache before making network request
   - Store response in cache with appropriate TTL
   - Handle cache invalidation on mutations

3. **Template Data Caching**:
   - Cache template list with 5-minute TTL
   - Cache individual templates with 10-minute TTL
   - Invalidate on template update/create/delete
   - Use cache key: `templates:list`, `templates:${id}`

4. **Scenario Data Caching**:
   - Cache scenario list with 5-minute TTL
   - Cache individual scenarios with 10-minute TTL
   - Invalidate on scenario update/create/delete
   - Use cache key: `scenarios:list`, `scenarios:${id}`

5. **Stale-While-Revalidate Pattern**:
   - Serve stale data immediately while revalidating in background
   - Update UI when fresh data arrives
   - Configurable staleness tolerance

**Task Group T-4.2.0: Network Optimization**

1. **Request Deduplication**:
   - Track in-flight requests in Map
   - Return same Promise for duplicate concurrent requests
   - Clean up on request completion
   - Prevent race conditions

```typescript
class RequestDeduplicator {
  private inFlight = new Map<string, Promise<any>>();
  
  async fetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Return existing promise if request in flight
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key)!;
    }
    
    // Create new request promise
    const promise = fetcher().finally(() => {
      this.inFlight.delete(key);
    });
    
    this.inFlight.set(key, promise);
    return promise;
  }
}
```

2. **Request Batching** (optional enhancement):
   - Batch multiple individual requests into single bulk request
   - Debounce batching with 50ms window
   - Split response and fulfill individual promises

3. **Optimistic Updates**:
   - Update cache immediately on mutation
   - Revert on server error
   - Show toast notification on revert

4. **Background Sync**:
   - Periodically refresh cached data in background
   - Use visibility API to pause when tab hidden
   - Resume on tab focus

**ACCEPTANCE CRITERIA:**

✅ Cache hit rate >80% for template/scenario data
✅ Network requests reduced by 70%+ through caching
✅ Request deduplication prevents concurrent identical requests
✅ Stale-while-revalidate provides instant UI updates
✅ Cache invalidation working correctly on mutations
✅ Memory usage reasonable (<50MB for cache)
✅ Cache survives page navigation within session
✅ Background sync keeps data fresh without user action

**TECHNICAL SPECIFICATIONS:**

**File Locations:**
- `train-wireframe/src/lib/client-cache.ts` - New cache service
- `train-wireframe/src/lib/api-client.ts` - Cached API wrapper
- `train-wireframe/src/lib/request-deduplicator.ts` - Request deduplication
- `train-wireframe/src/hooks/use-cached-data.ts` - Custom hook for cached fetching

**Cached Fetch Hook:**

```typescript
// use-cached-data.ts
import { useEffect, useState } from 'react';
import { clientCache } from '../lib/client-cache';
import { requestDeduplicator } from '../lib/request-deduplicator';

interface UseCachedDataOptions {
  key: string;
  fetcher: () => Promise<any>;
  ttl?: number;
  staleWhileRevalidate?: boolean;
}

export function useCachedData<T>({
  key,
  fetcher,
  ttl = 300000,
  staleWhileRevalidate = true
}: UseCachedDataOptions) {
  const [data, setData] = useState<T | null>(() => clientCache.get<T>(key));
  const [isLoading, setIsLoading] = useState(!data);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const cachedData = clientCache.get<T>(key);
    
    if (cachedData && !staleWhileRevalidate) {
      setData(cachedData);
      setIsLoading(false);
      return;
    }
    
    // Serve stale data immediately if available
    if (cachedData && staleWhileRevalidate) {
      setData(cachedData);
      setIsLoading(false);
    }
    
    // Fetch fresh data
    requestDeduplicator.fetch(key, fetcher)
      .then((freshData) => {
        clientCache.set(key, freshData, ttl);
        setData(freshData);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        // Keep stale data on error if available
        if (!cachedData) {
          setIsLoading(false);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [key]);
  
  return { data, isLoading, error };
}

// Usage in component
function TemplatesView() {
  const { data: templates, isLoading } = useCachedData({
    key: 'templates:list',
    fetcher: () => fetch('/api/templates').then(r => r.json()),
    ttl: 300000, // 5 minutes
    staleWhileRevalidate: true
  });
  
  if (isLoading && !templates) return <Skeleton />;
  
  return <TemplatesList templates={templates} />;
}
```

**Cache Monitoring:**

```typescript
// Cache statistics for debugging
interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  entries: { key: string; age: number }[];
}

class ClientCache {
  private stats = { hits: 0, misses: 0 };
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry || Date.now() - entry.timestamp > entry.ttl) {
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    return entry.data;
  }
  
  getStats(): CacheStats {
    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses),
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp
      }))
    };
  }
}
```

**Error Handling:**
- Network errors: Serve stale cache if available, show error toast
- Cache errors: Fall back to direct fetch
- Invalid cache entries: Clear and refetch
- Memory pressure: Implement LRU eviction policy

**VALIDATION REQUIREMENTS:**

1. **Cache Performance Tests**:
   - Measure cache hit rate over 100 page loads (target >80%)
   - Test stale-while-revalidate provides instant UI
   - Verify cache invalidation on mutations

2. **Network Tests**:
   - Count network requests during typical session (target 70%+ reduction)
   - Test request deduplication with concurrent requests
   - Measure time to first render with cached data

3. **Memory Tests**:
   - Monitor cache size growth
   - Verify cleanup of expired entries
   - Test LRU eviction if implemented

**DELIVERABLES:**

1. New client-cache.ts with TTL-based caching
2. New api-client.ts with cached fetch wrapper
3. New request-deduplicator.ts
4. New use-cached-data.ts custom hook
5. Updated components using cached data hooks
6. Cache statistics dashboard (for debugging)
7. Performance metrics (hit rate, network reduction)
8. Documentation of caching strategy

Implement this caching strategy completely, ensuring all acceptance criteria are met. Focus on correctness and cache invalidation to prevent stale data issues.

++++++++++++++++++

### Prompt 5: State Management Optimization & Loading States
**Scope**: Optimize Zustand store subscriptions and implement skeleton loading states  
**Dependencies**: Prompts 1-4 complete  
**Estimated Time**: 16-20 hours  
**Risk Level**: Medium

========================

You are a senior React developer optimizing state management and loading states for the Interactive LoRA Training Platform. Your goal is to minimize unnecessary component re-renders through selective subscriptions and improve perceived performance with skeleton screens.

**CONTEXT AND REQUIREMENTS:**

**Product Context:**
The Zustand store currently causes excessive re-renders when components subscribe to the entire store instead of specific slices. Loading states need enhancement to prevent layout shift and improve perceived performance during data fetching.

**Functional Requirements Being Implemented:**
- FR11.1.1: State updates trigger only necessary component re-renders
- FR11.1.1: State update batching reduces render count by 60%+
- FR3.2.1: Skeleton screens preserve layout (no layout shift)
- FR3.2.1: Loading states don't block user interaction where possible

**CURRENT CODEBASE STATE:**

**State Management** (`train-wireframe/src/stores/useAppStore.ts`):
- Components subscribing to entire store
- No selective subscription implementation
- State updates not batched

**Loading States**:
- Generic spinners causing layout shift
- No skeleton screens matching component layouts
- Blocking loading states

**IMPLEMENTATION TASKS:**

**Task Group T-2.2.1: Selective Store Subscriptions**

1. **Replace Full Store Subscriptions**:
   - Audit all components using `useAppStore()`
   - Replace destructured access with selector functions
   - Example: Replace `const { conversations, filters } = useAppStore()` with:
```typescript
const conversations = useAppStore(state => state.conversations);
const filters = useAppStore(state => state.filters);
```

2. **Implement Shallow Equality Comparator**:
   - Install zustand/shallow if not present
   - Use shallow equality for object/array selections
```typescript
import { shallow } from 'zustand/shallow';
const { status, tier } = useAppStore(
  state => ({ status: state.filterConfig.status, tier: state.filterConfig.tier }),
  shallow
);
```

3. **Create Memoized Selectors**:
   - Extract commonly used selectors to separate file
   - Memoize complex derivations
```typescript
// selectors.ts
export const selectActiveConversations = (state: AppState) => 
  state.conversations.filter(c => c.status !== 'archived');

export const selectFilteredConversations = (state: AppState) => {
  // Complex filtering logic
  return filtered;
};

// Usage
const activeConversations = useAppStore(selectActiveConversations);
```

**Task Group T-2.2.2: State Update Batching**

1. **Create Batch Update Action**:
   - Add `batchUpdate` method to Zustand store
   - Accept partial state object, merge all changes in single update
```typescript
batchUpdate: (updates: Partial<AppState>) => {
  set(state => ({ ...state, ...updates }));
}
```

2. **Batch Filter Updates**:
   - FilterBar currently triggers multiple state updates on filter application
   - Batch all filter changes into single update

3. **Batch Conversation Updates**:
   - Bulk approve/reject actions should update all conversations in single operation
   - Use Supabase batch update, then single state update

**Task Group T-3.2.1: Skeleton Screen Implementation**

1. **Create Table Skeleton**:
   - Match ConversationTable layout exactly
   - Same column widths, same row heights
   - Animated shimmer effect
```typescript
export function ConversationTableSkeleton() {
  return (
    <div className="border rounded-lg">
      {/* Header */}
      <div className="flex border-b p-4">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-32 ml-4" />
        <Skeleton className="h-5 w-24 ml-4" />
        {/* More columns */}
      </div>
      {/* Rows */}
      {Array.from({ length: 25 }).map((_, i) => (
        <div key={i} className="flex border-b p-4">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-32 ml-4" />
          <Skeleton className="h-5 w-24 ml-4" />
        </div>
      ))}
    </div>
  );
}
```

2. **Create Stats Card Skeletons**:
   - Dashboard stats cards need matching skeletons
   - Preserve card dimensions and spacing

3. **Create Modal Skeletons**:
   - Lazy-loaded modals show skeleton while loading
   - Match modal dimensions to prevent layout shift

4. **Implement Progressive Loading**:
   - Show skeleton for initial load
   - Transition smoothly to content without shift
   - Measure and minimize Cumulative Layout Shift (CLS)

**Task Group T-3.2.2: Optimistic UI Updates**

1. **Implement Optimistic Conversation Status Update**:
   - Update UI immediately on approve/reject
   - Revert with toast notification on API error
```typescript
updateConversation: (id: string, updates: Partial<Conversation>) => {
  const previous = get().conversations;
  
  // Optimistic update
  set(state => ({
    conversations: state.conversations.map(c =>
      c.id === id ? { ...c, ...updates } : c
    )
  }));
  
  // API call
  fetch(`/api/conversations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  })
  .catch(error => {
    // Revert on error
    set({ conversations: previous });
    toast.error('Failed to update conversation');
  });
}
```

2. **Optimistic Bulk Actions**:
   - Update multiple conversations immediately
   - Show success count, revert failures individually

**ACCEPTANCE CRITERIA:**

✅ Components only re-render when subscribed state changes
✅ Render count reduced by 60%+ through selective subscriptions
✅ State update batching working for filters and bulk actions
✅ Skeleton screens match component layouts exactly
✅ No layout shift during loading (CLS <0.1)
✅ Optimistic updates provide instant feedback
✅ Failed optimistic updates revert cleanly with user notification

**TECHNICAL SPECIFICATIONS:**

**File Locations:**
- `train-wireframe/src/stores/useAppStore.ts` - Add batch update, optimize structure
- `train-wireframe/src/stores/selectors.ts` - New memoized selectors file
- `train-wireframe/src/components/ui/skeleton.tsx` - Already exists, enhance
- `train-wireframe/src/components/dashboard/ConversationTableSkeleton.tsx` - New skeleton
- `train-wireframe/src/components/dashboard/DashboardSkeleton.tsx` - New skeleton
- All components using useAppStore - Update to selective subscriptions

**Selective Subscription Pattern:**

```typescript
// BAD: Re-renders on ANY store change
const store = useAppStore();

// BAD: Re-renders on conversations OR filters change
const { conversations, filters } = useAppStore();

// GOOD: Only re-renders when conversations change
const conversations = useAppStore(state => state.conversations);

// GOOD: Shallow equality for object subscriptions
const filters = useAppStore(
  state => ({ status: state.filterConfig.status, tier: state.filterConfig.tier }),
  shallow
);

// BEST: Memoized selector for complex derivations
const filteredConversations = useAppStore(selectFilteredConversations);
```

**Batch Update Pattern:**

```typescript
// BAD: Multiple state updates
setFilterStatus(['approved']);
setFilterTier(['template']);
setFilterQuality({ min: 8, max: 10 });

// GOOD: Single batched update
batchUpdate({
  filterConfig: {
    ...filterConfig,
    status: ['approved'],
    tier: ['template'],
    quality: { min: 8, max: 10 }
  }
});
```

**Error Handling:**
- Selector errors: Fall back to default value, log error
- Optimistic update failures: Revert state, show user-friendly error
- Skeleton rendering errors: Show generic loading state

**VALIDATION REQUIREMENTS:**

1. **Re-render Testing**:
   - Use React DevTools Profiler to count re-renders
   - Compare before/after selective subscriptions
   - Target 60%+ reduction in unnecessary re-renders

2. **Layout Shift Measurement**:
   - Use Lighthouse to measure CLS
   - Target CLS <0.1
   - Test skeleton-to-content transition

3. **Optimistic Update Testing**:
   - Test immediate UI response
   - Simulate API errors, verify revert
   - Test bulk operation rollback

**DELIVERABLES:**

1. Updated useAppStore.ts with batch updates and optimized structure
2. New selectors.ts with memoized selectors
3. New ConversationTableSkeleton.tsx
4. New DashboardSkeleton.tsx
5. Updated all components to use selective subscriptions
6. Optimistic update implementation for key actions
7. React DevTools Profiler results showing re-render reduction
8. Lighthouse CLS measurements

Implement this optimization completely, ensuring all acceptance criteria are met. Focus on maintaining correct state updates while minimizing re-renders.

++++++++++++++++++

### Prompt 6: Performance Monitoring Dashboard
**Scope**: Build admin dashboard for performance monitoring and query analysis  
**Dependencies**: Prompts 1-5 complete  
**Estimated Time**: 18-22 hours  
**Risk Level**: Low

========================

You are a senior full-stack developer implementing performance monitoring infrastructure for the Interactive LoRA Training Platform. Your goal is to create comprehensive monitoring dashboards that enable proactive performance issue detection and resolution.

**CONTEXT AND REQUIREMENTS:**

**Product Context:**
Production performance monitoring is essential for maintaining sub-second response times as the system scales. Monitoring dashboard provides visibility into database performance, API response times, and frontend metrics.

**Functional Requirements Being Implemented:**
- FR11.1.1: Query performance monitoring and slow query identification
- FR11.1.1: API response time tracking (p50, p95, p99)
- FR1.3.1: Real-time performance metrics displayed
- FR1.3.1: Automatic performance report generation

**CURRENT CODEBASE STATE:**

**Monitoring**:
- No performance metrics collection
- No dashboard for performance visibility
- No alerting on performance degradation

**Database**:
- pg_stat_statements extension enabled (from database setup)
- No interface to query performance statistics

**IMPLEMENTATION TASKS:**

**Task Group T-1.1.5 & T-5.1.0: Performance Monitoring Dashboard**

1. **Create Admin Performance Dashboard Page**:
   - New route: `/admin/performance`
   - Restricted to admin users only
   - Display real-time performance metrics

2. **Database Performance Metrics Endpoint**:
   - New API: `GET /api/admin/performance/database`
   - Query pg_stat_statements for slow queries
   - Return: query text, total time, calls, mean time, max time

```sql
SELECT 
  query,
  calls,
  total_exec_time / 1000 as total_time_sec,
  mean_exec_time / 1000 as mean_time_sec,
  max_exec_time / 1000 as max_time_sec,
  rows
FROM pg_stat_statements
WHERE userid = (SELECT usesysid FROM pg_user WHERE usename = current_user)
ORDER BY total_exec_time DESC
LIMIT 50;
```

3. **API Response Time Tracking**:
   - Create middleware logging response times
   - Store metrics in memory (circular buffer, last 1000 requests)
   - Calculate p50, p95, p99 percentiles
   - Endpoint: `GET /api/admin/performance/api`

```typescript
// Middleware for API timing
export function performanceMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = performance.now();
  
  res.on('finish', () => {
    const duration = performance.now() - start;
    metrics.recordApiCall({
      path: req.path,
      method: req.method,
      duration,
      status: res.statusCode,
      timestamp: Date.now()
    });
  });
  
  next();
}
```

4. **Frontend Performance Metrics**:
   - Integrate Web Vitals library
   - Track LCP, FID, CLS, TTFB
   - Send metrics to API endpoint
   - Display in dashboard

5. **Cache Performance Metrics**:
   - Track cache hit/miss rates
   - Display cache size and entry count
   - Show most frequently cached keys
   - Endpoint: `GET /api/admin/performance/cache`

6. **Index Usage Statistics**:
   - Query pg_stat_user_indexes
   - Display index scan counts
   - Identify unused indexes
   - Show index bloat warnings

7. **Performance Dashboard UI**:
   - Overview cards: Avg response time, DB query time, cache hit rate, active connections
   - Slow queries table with query text and timing
   - API response time chart (p50, p95, p99 over time)
   - Index usage table
   - Cache statistics
   - Web Vitals display

8. **Alert Configuration**:
   - Define alert thresholds (e.g., p95 > 1000ms)
   - Show alert status in dashboard
   - Optional: Send email/Slack notifications (future enhancement)

**Task Group T-1.1.5: Query Performance Monitoring Setup**

1. **Enable Query Logging**:
   - Configure pg_stat_statements to track all queries
   - Set appropriate query log threshold (500ms)

2. **Create Query Analysis Tools**:
   - EXPLAIN ANALYZE runner for slow queries
   - Query plan visualizer
   - Index suggestion tool

**ACCEPTANCE CRITERIA:**

✅ Performance dashboard accessible at /admin/performance
✅ Database metrics showing slow queries (>500ms)
✅ API response times tracked with percentiles (p50, p95, p99)
✅ Frontend Web Vitals collected and displayed
✅ Cache statistics showing hit rate >80%
✅ Index usage statistics identifying unused indexes
✅ Dashboard updates in real-time or with manual refresh
✅ Alert thresholds configurable and status visible

**TECHNICAL SPECIFICATIONS:**

**File Locations:**
- `src/app/api/admin/performance/database/route.ts` - Database metrics endpoint
- `src/app/api/admin/performance/api/route.ts` - API metrics endpoint
- `src/app/api/admin/performance/cache/route.ts` - Cache metrics endpoint
- `src/app/admin/performance/page.tsx` - Performance dashboard page
- `src/lib/performance/metrics.ts` - Metrics collection service
- `src/lib/performance/web-vitals.ts` - Web Vitals integration
- `src/middleware.ts` - Add performance middleware

**Dashboard Layout:**

```typescript
export default function PerformanceDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Performance Monitoring</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard title="Avg Response Time" value="245ms" trend="+5%" />
        <MetricCard title="DB Query Time" value="89ms" trend="-2%" />
        <MetricCard title="Cache Hit Rate" value="84%" trend="+12%" />
        <MetricCard title="Active Connections" value="12" trend="0%" />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>API Response Times</CardHeader>
          <CardContent>
            <LineChart data={apiMetrics} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>Web Vitals</CardHeader>
          <CardContent>
            <BarChart data={webVitals} />
          </CardContent>
        </Card>
      </div>
      
      {/* Tables */}
      <Card className="mb-6">
        <CardHeader>Slow Queries (>500ms)</CardHeader>
        <CardContent>
          <SlowQueriesTable queries={slowQueries} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>Index Usage Statistics</CardHeader>
        <CardContent>
          <IndexUsageTable indexes={indexStats} />
        </CardContent>
      </Card>
    </div>
  );
}
```

**Metrics Collection:**

```typescript
// metrics.ts
class MetricsCollector {
  private apiMetrics: CircularBuffer<ApiMetric>;
  private dbMetrics: Map<string, QueryMetric>;
  
  recordApiCall(metric: ApiMetric) {
    this.apiMetrics.push(metric);
    this.calculatePercentiles();
  }
  
  getApiMetrics(): ApiMetrics {
    return {
      p50: this.calculatePercentile(50),
      p95: this.calculatePercentile(95),
      p99: this.calculatePercentile(99),
      count: this.apiMetrics.length,
      avgDuration: this.calculateAverage()
    };
  }
  
  calculatePercentile(percentile: number): number {
    const sorted = this.apiMetrics.toArray()
      .map(m => m.duration)
      .sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }
}
```

**Web Vitals Integration:**

```typescript
// web-vitals.ts
import { getCLS, getFID, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  fetch('/api/admin/performance/web-vitals', {
    method: 'POST',
    body: JSON.stringify(metric)
  });
}

export function initWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}
```

**Error Handling:**
- Metrics collection failures: Log but don't fail app
- Dashboard query failures: Show error message, allow retry
- Invalid metrics: Filter out, log warning

**VALIDATION REQUIREMENTS:**

1. **Dashboard Functionality**:
   - Verify all metrics display correctly
   - Test real-time update (if implemented)
   - Test with simulated slow queries

2. **Metrics Accuracy**:
   - Validate percentile calculations
   - Compare API metrics with actual response times
   - Verify cache hit rate calculations

3. **Performance Impact**:
   - Ensure monitoring adds <5ms overhead per request
   - Verify metrics collection doesn't impact app performance

**DELIVERABLES:**

1. Performance dashboard page at /admin/performance
2. Database metrics API endpoint
3. API metrics API endpoint with percentile calculations
4. Cache metrics API endpoint
5. Web Vitals integration
6. Metrics collection service
7. Dashboard UI components
8. Documentation of metrics and thresholds

Implement this monitoring dashboard completely, ensuring all acceptance criteria are met. Focus on providing actionable insights for performance optimization.

++++++++++++++++++

### Prompt 7: Comprehensive Performance Testing Suite
**Scope**: Implement load testing, frontend performance testing, and benchmark suite  
**Dependencies**: Prompts 1-6 must be complete to test all optimizations  
**Estimated Time**: 22-26 hours  
**Risk Level**: Low

========================

You are a senior QA engineer and performance testing specialist implementing a comprehensive testing suite for the Interactive LoRA Training Platform. Your goal is to validate all FR11.1.1 and FR11.1.2 performance requirements through automated testing.

**CONTEXT AND REQUIREMENTS:**

**Product Context:**
All performance optimizations have been implemented. Comprehensive testing is required to validate performance targets are met and establish regression testing to prevent performance degradation.

**Functional Requirements Being Validated:**
- FR11.1.1: Page load <2s, filtering <300ms, sorting <200ms, database queries <100ms
- FR11.1.2: Supports 10,000 conversations, 50+ concurrent users, pagination/caching/virtual scrolling working

**IMPLEMENTATION TASKS:**

**Task Group T-6.1.1: Load Testing Suite**

1. **Install k6 Load Testing Tool**:
   - Install k6: `npm install --save-dev k6`
   - Create test directory: `tests/performance/load/`

2. **Create Baseline Load Test** (50 concurrent users):
```javascript
// tests/performance/load/baseline.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50, // 50 concurrent users
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    http_req_failed: ['rate<0.05'],    // <5% error rate
  },
};

export default function () {
  // Test conversation list API
  const res = http.get('http://localhost:3000/api/conversations?limit=25');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

3. **Create Spike Test** (sudden traffic increase):
```javascript
export const options = {
  stages: [
    { duration: '1m', target: 10 },  // Ramp up to 10 users
    { duration: '30s', target: 100 }, // Spike to 100 users
    { duration: '1m', target: 10 },  // Scale back down
  ],
};
```

4. **Create Stress Test** (find breaking point):
```javascript
export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '2m', target: 300 }, // Push to failure
  ],
};
```

5. **Create Endurance Test** (sustained load):
```javascript
export const options = {
  vus: 50,
  duration: '1h', // 1 hour sustained load
};
```

**Task Group T-6.1.2: Frontend Performance Testing**

1. **Configure Lighthouse CI**:
```json
// .lighthouserc.json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/templates"
      ]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "first-contentful-paint": ["error", {"maxNumericValue": 1500}],
        "interactive": ["error", {"maxNumericValue": 3000}],
        "speed-index": ["error", {"maxNumericValue": 2500}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}]
      }
    }
  }
}
```

2. **Create Playwright Performance Tests**:
```typescript
// tests/performance/frontend/pageload.spec.ts
import { test, expect } from '@playwright/test';

test('dashboard loads within 2 seconds', async ({ page }) => {
  const start = Date.now();
  await page.goto('http://localhost:3000/');
  await page.waitForSelector('[data-testid="conversation-table"]');
  const duration = Date.now() - start;
  
  expect(duration).toBeLessThan(2000);
});

test('filtering responds within 300ms', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.waitForSelector('[data-testid="filter-bar"]');
  
  const start = performance.now();
  await page.click('[data-testid="filter-status-approved"]');
  await page.waitForSelector('[data-testid="conversation-table"] tr[data-status="approved"]');
  const duration = performance.now() - start;
  
  expect(duration).toBeLessThan(300);
});

test('sorting responds within 200ms', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  
  const start = performance.now();
  await page.click('[data-testid="sort-quality-score"]');
  await page.waitForFunction(() => {
    const rows = document.querySelectorAll('[data-testid="conversation-row"]');
    return rows.length > 0;
  });
  const duration = performance.now() - start;
  
  expect(duration).toBeLessThan(200);
});
```

**Task Group T-6.1.3: Database Performance Testing**

1. **Create Database Benchmark Suite**:
```sql
-- tests/performance/database/benchmarks.sql
-- Benchmark: Paginated conversation list with filters
EXPLAIN ANALYZE
SELECT id, title, persona, emotion, tier, status, quality_score, created_at
FROM conversations
WHERE status = 'approved' AND quality_score >= 8
ORDER BY created_at DESC
LIMIT 25;
-- Expected: Index scan, <100ms execution

-- Benchmark: Full-text search
EXPLAIN ANALYZE
SELECT * FROM conversations
WHERE search_vector @@ to_tsquery('english', 'anxious & investor');
-- Expected: GIN index scan, <100ms execution

-- Benchmark: Count query with filters
EXPLAIN ANALYZE
SELECT COUNT(*) FROM conversations
WHERE tier = 'template' AND status IN ('approved', 'pending_review');
-- Expected: Index-only scan, <50ms execution
```

2. **Create pgbench Test Scripts** (if using pgbench):
```bash
#!/bin/bash
# Run pgbench performance test
pgbench -h localhost -U postgres -d train_data \
  -c 50 \  # 50 concurrent clients
  -j 10 \  # 10 threads
  -T 60 \  # 60 second duration
  -f tests/performance/database/queries.sql
```

**ACCEPTANCE CRITERIA:**

✅ Baseline load test passes with 50 concurrent users (p95 <500ms)
✅ Spike test handles sudden 10x traffic increase without errors
✅ Stress test identifies breaking point (>200 concurrent users)
✅ Endurance test shows no memory leaks or performance degradation over 1 hour
✅ Lighthouse CI passes with performance score >90
✅ Page load <2s validated by Playwright tests
✅ Filtering <300ms and sorting <200ms validated
✅ Database queries <100ms verified with EXPLAIN ANALYZE
✅ All tests automated and runnable in CI/CD pipeline

**TECHNICAL SPECIFICATIONS:**

**File Locations:**
- `tests/performance/load/baseline.js` - k6 baseline test
- `tests/performance/load/spike.js` - k6 spike test
- `tests/performance/load/stress.js` - k6 stress test
- `tests/performance/load/endurance.js` - k6 endurance test
- `tests/performance/frontend/pageload.spec.ts` - Playwright tests
- `tests/performance/database/benchmarks.sql` - SQL benchmarks
- `.lighthouserc.json` - Lighthouse CI configuration
- `package.json` - Add test scripts

**Test Scripts in package.json:**

```json
{
  "scripts": {
    "test:perf:load": "k6 run tests/performance/load/baseline.js",
    "test:perf:spike": "k6 run tests/performance/load/spike.js",
    "test:perf:stress": "k6 run tests/performance/load/stress.js",
    "test:perf:endurance": "k6 run tests/performance/load/endurance.js",
    "test:perf:frontend": "playwright test tests/performance/frontend",
    "test:perf:lighthouse": "lhci autorun",
    "test:perf:all": "npm run test:perf:load && npm run test:perf:frontend && npm run test:perf:lighthouse"
  }
}
```

**Error Handling:**
- Test failures: Generate detailed report with metrics
- Infrastructure errors: Retry with exponential backoff
- Flaky tests: Run multiple times, require consistent pass rate

**VALIDATION REQUIREMENTS:**

1. **Functional Testing**:
   - All tests must pass consistently (>95% pass rate)
   - Test results must be reproducible
   - Tests must run in CI/CD without manual intervention

2. **Performance Metrics**:
   - Document baseline performance metrics
   - Compare against FR acceptance criteria
   - Identify any regressions from optimizations

3. **Reporting**:
   - Generate HTML reports for all test runs
   - Include graphs and visualizations
   - Document pass/fail status for each criterion

**DELIVERABLES:**

1. Complete k6 load testing suite (4 test files)
2. Playwright frontend performance tests
3. Lighthouse CI configuration and integration
4. Database benchmark SQL scripts
5. Test automation scripts in package.json
6. Test results documentation with metrics
7. Performance baseline report
8. CI/CD integration instructions

Implement this testing suite completely, ensuring all FR11.1.1 and FR11.1.2 acceptance criteria are validated. Document all test results with concrete metrics.

++++++++++++++++++

### Prompt 8: Performance Documentation & Knowledge Transfer
**Scope**: Document all optimizations, create performance tuning guide, and knowledge transfer materials  
**Dependencies**: All prompts 1-7 must be complete  
**Estimated Time**: 14-18 hours  
**Risk Level**: Low

========================

You are a technical documentation specialist creating comprehensive documentation for the Interactive LoRA Training Platform performance optimizations. Your goal is to ensure future maintainers understand the performance architecture and can troubleshoot issues effectively.

**CONTEXT AND REQUIREMENTS:**

**Product Context:**
All performance optimizations and testing are complete. Comprehensive documentation is required for knowledge transfer, troubleshooting, and future maintenance.

**Functional Requirements Being Documented:**
- All FR11.1.1 and FR11.1.2 implementations
- Performance architecture decisions
- Troubleshooting procedures
- Best practices for maintaining performance

**IMPLEMENTATION TASKS:**

**Task Group T-7.1.0: Performance Documentation**

1. **Create Performance Architecture Document** (`docs/performance/architecture.md`):
   - Overview of performance optimization strategy
   - Database indexing strategy with rationale
   - API caching architecture
   - Frontend optimization techniques
   - State management optimization
   - Network optimization strategies

2. **Create Performance Tuning Guide** (`docs/performance/tuning-guide.md`):
   - How to analyze slow queries
   - When to add new indexes
   - Cache configuration tuning
   - Bundle size optimization techniques
   - React performance profiling
   - Database query optimization

3. **Create Troubleshooting Playbook** (`docs/performance/troubleshooting.md`):
   - Slow dashboard loading → Check database indexes, API response times
   - High memory usage → Check for memory leaks, optimize virtual scrolling
   - Cache misses → Verify TTL configuration, check invalidation logic
   - API timeouts → Check database connection pool, query performance
   - Layout shift issues → Verify skeleton screens match components

4. **Create Performance Best Practices** (`docs/performance/best-practices.md`):
   - Always use selective Zustand subscriptions
   - Memoize expensive computations with useMemo/useCallback
   - Add indexes before foreign keys
   - Cache static data with appropriate TTL
   - Use virtual scrolling for lists >100 items
   - Code-split routes and heavy components
   - Monitor performance metrics regularly

5. **Create Performance Metrics Reference** (`docs/performance/metrics.md`):
   - Definition of all tracked metrics
   - Target values for each metric
   - How to interpret metrics
   - Alert thresholds and escalation procedures

6. **Add Inline Code Comments**:
   - Complex query optimizations
   - Non-obvious performance trade-offs
   - Cache invalidation logic
   - Virtual scrolling edge cases

7. **Create Runbook** (`docs/performance/runbook.md`):
   - Daily performance monitoring checklist
   - Weekly performance review process
   - Monthly optimization review
   - Performance regression response procedure

8. **Create Training Materials**:
   - Performance optimization presentation slides
   - Video walkthroughs of key optimizations (optional)
   - Quiz/assessment for knowledge verification

**ACCEPTANCE CRITERIA:**

✅ Architecture documentation explains all major optimization decisions
✅ Tuning guide provides actionable steps for performance improvement
✅ Troubleshooting playbook covers common performance issues
✅ Best practices document clear and comprehensive
✅ All complex code has inline comments explaining performance rationale
✅ Runbook provides clear procedures for performance monitoring
✅ Documentation is accessible and well-organized
✅ Knowledge transfer materials complete

**TECHNICAL SPECIFICATIONS:**

**File Locations:**
- `docs/performance/architecture.md` - Performance architecture
- `docs/performance/tuning-guide.md` - Performance tuning guide
- `docs/performance/troubleshooting.md` - Troubleshooting playbook
- `docs/performance/best-practices.md` - Best practices
- `docs/performance/metrics.md` - Metrics reference
- `docs/performance/runbook.md` - Operational runbook
- `README-PERFORMANCE.md` - Performance overview at root
- Inline code comments throughout codebase

**Documentation Structure Example:**

```markdown
# Performance Architecture

## Overview
The Interactive LoRA Training Platform is optimized for handling 10,000+ conversations with <2s page loads and <300ms filtering. This document explains the architectural decisions and optimization strategies employed.

## Database Performance

### Indexing Strategy
We use a multi-layered indexing approach:

1. **Primary Indexes**: Single-column btree indexes on frequently queried fields (status, tier, quality_score, created_at)
2. **Composite Indexes**: Multi-column indexes for common filter combinations (status + quality_score)
3. **Partial Indexes**: Conditional indexes for specific use cases (pending_review queue)
4. **GIN Indexes**: For JSONB and array fields (parameters, category)
5. **Full-Text Search**: Generated tsvector column with GIN index

**Rationale**: This strategy provides optimal performance for all dashboard query patterns while minimizing index maintenance overhead.

### Query Optimization
All queries use indexed columns in WHERE clauses and ORDER BY. Cursor-based pagination ensures consistent performance regardless of dataset size.

**Example Optimized Query**:
```sql
SELECT id, title, persona, emotion, tier, status, quality_score, created_at
FROM conversations
WHERE status = 'approved' AND quality_score >= 8  -- Uses idx_conversations_status_quality
ORDER BY created_at DESC, id DESC  -- Uses idx_conversations_created_at
LIMIT 25;
```

## API Performance

### Caching Strategy
- **Template/Scenario Data**: 5-minute TTL (rarely changes)
- **Conversation Counts**: 30-second TTL (stale counts acceptable)
- **Cache Invalidation**: Triggered on relevant mutations

### Response Compression
All JSON responses compressed with gzip, achieving 70%+ payload reduction.

### Connection Pooling
Supabase client configured with 10-20 connections for serverless environment.

## Frontend Performance

### React Optimization
- **Memoization**: React.memo with custom comparison functions
- **Selective Subscriptions**: Zustand selectors prevent unnecessary re-renders
- **Virtual Scrolling**: react-window for lists >100 items
- **Code Splitting**: Route-level and component-level lazy loading

### Bundle Optimization
- Initial bundle: <500KB
- Route chunks: 50-150KB each
- Tree shaking enabled
- Production build uses Terser minification

## Network Optimization
- Request deduplication prevents concurrent identical requests
- Stale-while-revalidate provides instant UI updates
- Client-side caching reduces network requests by 70%+

## Performance Monitoring
Real-time monitoring dashboard tracks:
- Database query performance (pg_stat_statements)
- API response times (p50, p95, p99)
- Frontend Web Vitals (LCP, FID, CLS, TTFB)
- Cache hit rates

## Future Enhancements
- WebSocket for real-time updates (reduce polling)
- Service worker for offline capability
- CDN for static assets
- Read replicas for database scaling
```

**DELIVERABLES:**

1. Performance architecture documentation
2. Performance tuning guide
3. Troubleshooting playbook
4. Best practices document
5. Metrics reference guide
6. Operational runbook
7. Inline code comments added throughout codebase
8. README-PERFORMANCE.md summary document

Implement this documentation completely, ensuring all optimizations are thoroughly documented for future maintainers.

++++++++++++++++++

---

## Quality Validation Checklist

### Post-Implementation Verification

After completing all 8 prompts, validate the following:

- [ ] **Database Performance**
  - [ ] All indexes created and used by queries
  - [ ] Slow queries (<10) identified and optimized
  - [ ] Query performance <100ms for indexed lookups
  - [ ] Connection pool configured and monitored

- [ ] **API Performance**
  - [ ] Cursor-based pagination working correctly
  - [ ] Cache hit rate >80% for templates/scenarios
  - [ ] API response time p95 <500ms
  - [ ] Request deduplication preventing duplicate calls
  - [ ] Response compression enabled

- [ ] **Frontend Performance**
  - [ ] Component re-renders reduced by 60%+
  - [ ] Filtering responds in <300ms
  - [ ] Sorting responds in <200ms
  - [ ] Virtual scrolling handles 10,000 conversations
  - [ ] Code splitting achieved <500KB initial bundle
  - [ ] Skeleton screens prevent layout shift (CLS <0.1)

- [ ] **State Management**
  - [ ] Selective subscriptions implemented
  - [ ] State update batching working
  - [ ] Optimistic updates with rollback

- [ ] **Client-Side Caching**
  - [ ] Cache hit rate >80%
  - [ ] Stale-while-revalidate working
  - [ ] Cache invalidation correct
  - [ ] Memory usage reasonable (<50MB)

- [ ] **Monitoring**
  - [ ] Performance dashboard accessible
  - [ ] Database metrics tracked
  - [ ] API metrics tracked with percentiles
  - [ ] Web Vitals collected
  - [ ] Alert thresholds configured

- [ ] **Testing**
  - [ ] All load tests pass
  - [ ] Lighthouse score >90
  - [ ] Frontend performance tests pass
  - [ ] Database benchmarks <100ms

- [ ] **Documentation**
  - [ ] Architecture documented
  - [ ] Tuning guide complete
  - [ ] Troubleshooting playbook created
  - [ ] Best practices documented
  - [ ] Runbook created

### Cross-Prompt Consistency

- [ ] **Naming Conventions**
  - [ ] Consistent service method naming
  - [ ] Consistent component naming
  - [ ] Consistent cache key patterns

- [ ] **Architectural Patterns**
  - [ ] Consistent error handling across layers
  - [ ] Consistent logging patterns
  - [ ] Consistent type definitions

- [ ] **Data Models**
  - [ ] Type definitions match database schema
  - [ ] API contracts consistent with frontend expectations
  - [ ] Cache data structures match source data

- [ ] **User Experience**
  - [ ] Consistent loading states
  - [ ] Consistent error messages
  - [ ] Smooth transitions between optimizations

---

## Next Segment Preparation

### Information for Segment E12

**Performance Infrastructure Available:**
- Comprehensive database indexing for 10,000+ conversations
- API pagination and caching infrastructure
- Frontend optimization patterns (memoization, virtual scrolling, code splitting)
- State management best practices
- Client-side caching framework
- Performance monitoring dashboard
- Complete testing suite

**Performance Metrics Baseline:**
- Page load: <2 seconds
- Filtering: <300ms
- Sorting: <200ms
- Database queries: <100ms p95
- API responses: <500ms p95
- Bundle size: <500KB initial
- Cache hit rate: >80%
- Support: 50+ concurrent users

**Recommended Next Features:**
- Real-time updates with WebSocket (reduce polling overhead)
- Background job processing for long-running operations
- Advanced analytics and reporting features
- Collaboration features (can now handle concurrent users)

**Known Limitations:**
- Virtual scrolling may need adjustment for variable-height rows
- Cache invalidation may need refinement based on usage patterns
- Monitoring dashboard needs production telemetry integration

---

## Implementation Summary

**Total Implementation Time**: 180-240 hours (8 prompts)
**Estimated Calendar Time**: 4-6 weeks (with 2-3 developers)
**Risk Level**: Medium (High-risk items mitigated with careful implementation)

**Key Success Factors:**
1. Execute database migrations during low-traffic windows
2. Implement virtual scrolling behind feature flag
3. Monitor performance metrics closely during rollout
4. Have rollback plan ready for each prompt
5. Test thoroughly with production-scale data

**Expected Outcomes:**
- 95%+ improvement in page load times
- 70%+ reduction in network requests
- 80%+ reduction in memory usage for large lists
- 60%+ reduction in unnecessary component re-renders
- Complete performance monitoring and alerting infrastructure
- Comprehensive testing and documentation

**Quality Assurance:**
- All FR11.1.1 response time targets met
- All FR11.1.2 scalability targets met
- 100% test coverage of performance requirements
- Complete documentation for future maintainers

---

**Document Status:** Complete  
**Ready for Implementation:** Yes  
**Approval Required:** Technical Lead, Product Manager

