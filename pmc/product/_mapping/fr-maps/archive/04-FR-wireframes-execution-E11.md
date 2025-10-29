# Train Data Generation Platform - Implementation Execution Instructions (E11)
**Generated**: 2025-10-29  
**Segment**: E11 - Performance & Optimization  
**Total Prompts**: 6  
**Estimated Implementation Time**: 120-160 hours (5-7 weeks with 2 engineers)

---

## Executive Summary

Segment E11 implements comprehensive performance optimization and scalability enhancements for the Interactive LoRA Conversation Generation Module. This segment focuses on:

**Core Objectives:**
1. **Performance Monitoring Infrastructure** - Establish real-time query monitoring, slow query detection, and performance analytics
2. **Database Optimization** - Implement strategic indexing, connection pooling, and query optimization
3. **Caching Layer** - Deploy intelligent caching with LRU eviction and smart invalidation
4. **Frontend Performance** - Add table virtualization, optimistic updates, and code splitting
5. **Scalability Features** - Implement pagination, background job processing, and load testing
6. **Production Monitoring** - Deploy APM tools for ongoing performance observability

**Strategic Importance:**
- Ensures application remains responsive as conversation datasets grow to 10,000+ records
- Reduces database load through intelligent caching and query optimization
- Provides visibility into performance bottlenecks before they impact users
- Establishes foundation for horizontal scaling as user base grows
- Meets target performance benchmarks: <2s page load, <300ms filtering, <100ms queries

**Success Metrics:**
- All database queries <100ms for indexed lookups
- Table operations (filter, sort) <300ms with 1000+ records
- Support 100+ concurrent users without degradation
- 95%+ cache hit rate for frequently accessed data
- p95 API response times <500ms

---

## Context and Dependencies

### Previous Segment Deliverables

**E09 (Chunks-Alpha Integration) - COMPLETED:**
- Conversation-to-chunk linking with foreign key associations
- Dimension-driven generation using 60-dimensional semantic analysis
- Chunk metadata storage and orphan detection
- Chunk service integration layer for data access
- UI components for chunk selection and dimension display

**E10 (Error Handling & Recovery) - ASSUMED COMPLETE:**
- Comprehensive error handling across all system operations
- Graceful error recovery with user-friendly messaging
- Failed batch job resume capabilities
- Database transaction rollback on errors
- Error boundary components for React errors

**E01-E08 (Core Features) - OPERATIONAL:**
- Database foundation with conversations, turns, metadata tables
- Conversation generation (single, batch, tier-based)
- Dashboard with table, filters, search
- Review queue and approval workflow
- Template, scenario, and edge case management
- Export functionality in multiple formats

### Current Codebase State

**Database Layer (`src/lib/database.ts`):**
- Basic Supabase client wrapper with CRUD operations
- Order by and filtering support
- No performance monitoring
- No connection pooling configuration
- No query optimization patterns

**Frontend State (`train-wireframe/src/stores/useAppStore.ts`):**
- Zustand store managing global state
- Basic state updates without optimistic patterns
- Filter config and selected items tracked
- No caching layer
- Direct API calls without batching

**UI Components (`train-wireframe/src/components/dashboard/`):**
- ConversationTable renders all rows (no virtualization)
- FilterBar with multi-dimensional filters
- Pagination component (offset-based, no cursor)
- DashboardView coordinating dashboard layout

**API Routes (`src/app/api/`):**
- Conversations CRUD endpoints
- Chunk generation and dimension analysis
- No pagination implementation
- Synchronous request processing
- No background job queue

### Cross-Segment Dependencies

**External Dependencies:**
- **Supabase Pro** - Required for pg_stat_statements and advanced indexing features
- **Redis** (Optional) - For distributed caching and job queue (BullMQ)
- **Node.js 18+** - For performance.now() and other modern APIs

**Internal Dependencies:**
- All core conversation generation features must be operational
- Database schema must be stable (no breaking changes during optimization)
- Existing API endpoints required for performance baseline measurements
- Frontend components must be fully functional for optimization testing

---

## Implementation Strategy

### Risk Assessment

**HIGH RISK:**
1. **Database Index Creation on Production** - Creating indexes on large tables can lock tables
   - **Mitigation:** Use CONCURRENTLY option, create during low-traffic periods
   
2. **Cache Invalidation Bugs** - Incorrect invalidation leads to stale data
   - **Mitigation:** Comprehensive testing, conservative TTLs, manual cache clear endpoint
   
3. **Query Performance Regression** - Optimization attempts could worsen performance
   - **Mitigation:** Benchmark before/after, gradual rollout, rollback plan

**MEDIUM RISK:**
1. **Virtual Scrolling Complexity** - Table virtualization breaks existing keyboard navigation
   - **Mitigation:** Thorough accessibility testing, fallback to pagination if issues arise

2. **Background Job Failures** - Job queue crashes lose work
   - **Mitigation:** Durable Redis setup, job retry logic, monitoring alerts

**LOW RISK:**
1. **Monitoring Overhead** - Performance tracking adds latency
   - **Mitigation:** Measure monitoring overhead (<5ms acceptable), optimize if needed

2. **Code Splitting Issues** - Lazy loading breaks certain user flows
   - **Mitigation:** Test all navigation paths, add proper loading states

### Prompt Sequencing Logic

**Phase 1: Foundation (Prompts 1-2)** - Establish monitoring before optimization
- Prompt 1 creates performance monitoring infrastructure
- Prompt 2 implements database indexing with measurement

**Rationale:** Must measure current performance before optimizing. Monitoring reveals bottlenecks to prioritize. Indexes provide biggest performance win with least risk.

**Phase 2: Data Layer (Prompt 3)** - Optimize data access patterns
- Prompt 3 adds caching layer and batch query optimization

**Rationale:** With indexes in place, caching reduces database load. Batch optimization eliminates N+1 queries revealed by monitoring.

**Phase 3: Frontend (Prompt 4)** - Optimize user-facing performance
- Prompt 4 implements UI performance enhancements (virtualization, optimistic updates, code splitting)

**Rationale:** Backend optimization ensures fast data delivery. Frontend optimization ensures smooth user experience with large datasets.

**Phase 4: Scalability (Prompt 5)** - Handle growth and concurrent users
- Prompt 5 adds pagination and background job processing

**Rationale:** With core performance solid, add features enabling horizontal scaling and handling peak loads.

**Phase 5: Testing & Monitoring (Prompt 6)** - Validate and observe
- Prompt 6 implements load testing and production monitoring

**Rationale:** Validate all optimizations under realistic load. Production monitoring ensures ongoing performance visibility.

### Quality Assurance Approach

**Performance Benchmarking:**
- Establish baseline metrics before each optimization
- Measure after implementation with same workload
- Require 50%+ improvement or rollback change

**Load Testing:**
- Test with realistic data volumes (10,000+ conversations)
- Simulate concurrent users (100+ simultaneous)
- Verify p95 latency targets met

**Regression Prevention:**
- Performance tests in CI/CD pipeline
- Alert on performance degradation >20%
- Automated rollback on critical threshold breach

**User Testing:**
- Beta test with power users having large datasets
- Gather feedback on perceived performance
- Monitor support tickets for performance complaints

---

## Database Setup Instructions

### Required SQL Operations

Execute these SQL statements in Supabase SQL Editor before starting implementation:

========================
-- E11 Database Performance Setup

-- 1. Enable pg_stat_statements extension (requires Supabase Pro)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 2. Create performance logging table
CREATE TABLE IF NOT EXISTS performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type VARCHAR(50) NOT NULL, -- SELECT, INSERT, UPDATE, DELETE
  query_fingerprint VARCHAR(64) NOT NULL, -- MD5 hash of normalized query
  execution_time_ms INTEGER NOT NULL,
  row_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create index on performance logs for time-series queries
CREATE INDEX idx_performance_logs_created_at ON performance_logs(created_at DESC);
CREATE INDEX idx_performance_logs_query_fingerprint ON performance_logs(query_fingerprint);

-- 4. Create performance metrics summary table (aggregated data)
CREATE TABLE IF NOT EXISTS performance_metrics_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_fingerprint VARCHAR(64) NOT NULL,
  time_bucket TIMESTAMPTZ NOT NULL, -- Aggregation window (1min, 5min, 1hr)
  p50_ms INTEGER NOT NULL,
  p95_ms INTEGER NOT NULL,
  p99_ms INTEGER NOT NULL,
  query_count INTEGER NOT NULL,
  error_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(query_fingerprint, time_bucket)
);

-- 5. Create index usage tracking view (wraps pg_stat_user_indexes)
CREATE OR REPLACE VIEW v_index_usage AS
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC; -- Show least-used indexes first

-- 6. Create slow query log table
CREATE TABLE IF NOT EXISTS slow_query_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text TEXT NOT NULL,
  execution_time_ms INTEGER NOT NULL,
  query_plan JSONB, -- EXPLAIN ANALYZE output
  context JSONB, -- Request context (user_id, endpoint, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_slow_query_logs_created_at ON slow_query_logs(created_at DESC);

-- 7. Add performance optimization comment metadata to existing tables
COMMENT ON TABLE conversations IS 'Main table - indexed for performance on status, tier, created_at, quality_score';

-- 8. Verify index readiness function
CREATE OR REPLACE FUNCTION check_index_health()
RETURNS TABLE(
  index_name TEXT,
  table_name TEXT,
  is_valid BOOLEAN,
  size TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.relname::TEXT as index_name,
    t.relname::TEXT as table_name,
    i.indisvalid as is_valid,
    pg_size_pretty(pg_relation_size(i.indexrelid)) as size
  FROM pg_index idx
  JOIN pg_class i ON i.oid = idx.indexrelid
  JOIN pg_class t ON t.oid = idx.indrelid
  WHERE t.relnamespace = 'public'::regnamespace;
END;
$$ LANGUAGE plpgsql;

-- 9. Grant permissions for performance monitoring
GRANT SELECT ON performance_logs TO authenticated;
GRANT SELECT ON performance_metrics_summary TO authenticated;
GRANT SELECT ON slow_query_logs TO authenticated;
GRANT EXECUTE ON FUNCTION check_index_health() TO authenticated;

-- Verification query
SELECT 'Performance monitoring tables created successfully' as status;
SELECT * FROM check_index_health();

++++++++++++++++++

**Post-Execution Validation:**
1. Verify all tables created: `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'performance%';`
2. Verify pg_stat_statements enabled: `SELECT * FROM pg_stat_statements LIMIT 1;`
3. Verify function works: `SELECT * FROM check_index_health();`

---

## Implementation Prompts

### Prompt 1: Performance Monitoring Infrastructure
**Scope**: Implement comprehensive database query performance monitoring system  
**Dependencies**: Database setup SQL executed, Supabase Pro tier active  
**Estimated Time**: 16-20 hours  
**Risk Level**: Low

========================

You are a senior full-stack developer implementing performance monitoring infrastructure for the Train Data Generation Platform conversation module.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
The Interactive LoRA Conversation Generation Module handles large-scale conversation datasets (10,000+ records) and requires real-time performance visibility. This implementation establishes the foundation for identifying and resolving performance bottlenecks before they impact users.

**Functional Requirements (FR11.1.1):**
- Query execution time must be measured for every database operation
- Slow query threshold must be configurable (default 500ms)
- Query performance logs must capture: query text, execution time, row count, plan hash
- Performance metrics must be aggregated by operation type
- p50, p95, p99 latency percentiles must be calculated for each query pattern
- Alert triggers when query execution exceeds threshold 3 consecutive times
- Query plans must be captured using EXPLAIN ANALYZE for queries >1000ms
- Historical performance data must be retained for 30 days minimum

**CURRENT CODEBASE STATE:**
- `src/lib/database.ts` - Basic Supabase client wrapper with simple CRUD operations
- No existing performance monitoring
- All queries execute without timing measurement

**IMPLEMENTATION TASKS:**

From Task Inventory (T-1.1.0, T-1.1.1, T-1.1.2, T-1.1.3):

**Phase 1: Core Monitoring Infrastructure**
1. Create `src/lib/database-performance-monitor.ts` with performance monitoring utilities
2. Implement high-resolution timing wrapper using `performance.now()`
3. Create query fingerprinting function (normalize queries for pattern grouping)
4. Build in-memory circular buffer for hot performance metrics
5. Implement async batch write to `performance_logs` table

**Phase 2: Slow Query Detection**
6. Implement threshold comparison logic (warning: 500ms, critical: 1000ms)
7. Create EventEmitter for slow query alerts
8. Add automatic EXPLAIN ANALYZE execution for critical slow queries
9. Implement rate limiting to prevent alert flooding

**Phase 3: Metrics Aggregation**
10. Implement streaming percentile calculation
11. Create time-window aggregation scheduler (1min, 5min, 1hr)
12. Build query pattern fingerprinting and grouping
13. Store aggregated metrics in `performance_metrics_summary` table

**Phase 4: API Endpoints**
14. Create `GET /api/admin/performance/metrics` endpoint
15. Create `GET /api/admin/performance/slow-queries` endpoint
16. Add authentication check (admin-only access)

**ACCEPTANCE CRITERIA:**
- [ ] All Supabase queries wrapped with timing decorator
- [ ] Query execution time measured with <1ms accuracy
- [ ] Query fingerprints generated consistently
- [ ] Slow queries detected when exceeding 500ms threshold
- [ ] EXPLAIN ANALYZE automatically captured for queries >1000ms
- [ ] p50, p95, p99 percentiles calculated accurately
- [ ] Metrics aggregated into time windows
- [ ] API endpoints require admin authentication
- [ ] Monitoring overhead measured at <5ms per operation

**TECHNICAL SPECIFICATIONS:**

Create `src/lib/database-performance-monitor.ts`:
```typescript
import { SupabaseClient } from '@supabase/supabase-js';
import { performance } from 'perf_hooks';
import crypto from 'crypto';

export interface QueryMetrics {
  fingerprint: string;
  executionTimeMs: number;
  rowCount: number;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  timestamp: Date;
}

export class PerformanceMonitor {
  private metricsBuffer: QueryMetrics[] = [];
  private slowQueryThreshold: number = 500;
  private criticalThreshold: number = 1000;

  async wrapQuery<T>(
    queryFn: () => Promise<T>,
    queryText: string
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await queryFn();
      const duration = performance.now() - startTime;
      
      await this.recordMetric(queryText, duration, result);
      
      if (duration > this.criticalThreshold) {
        await this.captureExplainPlan(queryText);
      }
      
      return result;
    } catch (error) {
      // Log error but don't break query
      console.error('Performance monitoring error:', error);
      throw error;
    }
  }

  private queryFingerprint(queryText: string): string {
    const normalized = queryText
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/\d+/g, '?')
      .replace(/'[^']*'/g, '?')
      .trim();
    return crypto.createHash('md5').update(normalized).digest('hex');
  }

  private async recordMetric(queryText: string, duration: number, result: any): Promise<void> {
    // Buffer metrics and batch write to database
  }

  private calculatePercentiles(values: number[], percentiles: number[] = [50, 95, 99]): Record<number, number> {
    const sorted = [...values].sort((a, b) => a - b);
    const result: Record<number, number> = {};

    for (const p of percentiles) {
      const index = Math.ceil((p / 100) * sorted.length) - 1;
      result[p] = sorted[Math.max(0, index)];
    }

    return result;
  }
}
```

Modify `src/lib/database.ts` to wrap queries:
```typescript
const monitor = getPerformanceMonitor();

export async function getConversations(filters: FilterConfig) {
  return monitor.wrapQuery(
    () => supabase.from('conversations').select('*').execute(),
    'SELECT conversations with filters'
  );
}
```

**VALIDATION REQUIREMENTS:**
1. Execute various queries and verify timing accuracy
2. Trigger slow queries and verify detection
3. Test metrics aggregation with sample data
4. Verify API endpoints return correct data
5. Measure monitoring overhead (<5ms average)

**DELIVERABLES:**
- `src/lib/database-performance-monitor.ts` - Core monitoring class (300-400 lines)
- `src/lib/performance-utils.ts` - Utility functions (150-200 lines)
- `src/app/api/admin/performance/metrics/route.ts` - API endpoint (80-100 lines)
- `src/app/api/admin/performance/slow-queries/route.ts` - API endpoint (80-100 lines)
- `src/lib/database.ts` - Modified with monitoring wrappers
- Tests: `tests/database-performance-monitor.test.ts` (200-250 lines)

Implement this performance monitoring infrastructure completely, ensuring minimal overhead while providing comprehensive visibility into database query performance.

++++++++++++++++++

### Prompt 2: Database Index Optimization
**Scope**: Implement comprehensive database indexing strategy with monitoring  
**Dependencies**: Prompt 1 completed, performance monitoring operational  
**Estimated Time**: 20-24 hours  
**Risk Level**: Medium (index creation can lock tables)

========================

You are a senior database engineer implementing strategic indexing for the Train Data Generation Platform conversation module.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
Database queries currently perform full table scans without indexes, causing slow performance with large datasets. Strategic indexing will reduce query time from seconds to milliseconds while enabling scalability to 10,000+ conversations.

**Functional Requirements (FR11.1.1, FR11.1.2):**
- Btree indexes must exist on: status, tier, created_at, updated_at, quality_score
- Composite index must exist on (status, quality_score) for dashboard queries
- GIN index must exist on category array field for array containment queries
- Full-text search index must exist on title, persona, emotion fields
- Composite index on (tier, status, created_at DESC) for filtered sorted views
- Partial index on (status = 'pending_review') for review queue optimization
- JSONB indexes must use GIN with jsonb_path_ops operator class
- Index hit rate must be >95% for all indexed columns
- Missing index detector must analyze query logs and suggest new indexes
- Unused index detector must flag indexes with idx_scan = 0 for 30+ days

**CURRENT CODEBASE STATE:**
- Conversations table has no indexes beyond primary key
- All queries perform sequential scans
- No index monitoring or recommendations

**IMPLEMENTATION TASKS:**

From Task Inventory (T-1.2.0, T-1.2.1, T-1.2.2, T-1.2.3):

**Phase 1: Core Table Indexes**
1. Create migration file `migrations/20XX_create_performance_indexes.sql`
2. Add single-column btree indexes (status, tier, created_at, quality_score)
3. Add composite indexes for common filter patterns
4. Add partial index for review queue optimization
5. Use CONCURRENTLY option to avoid table locks

**Phase 2: Advanced Indexes**
6. Create GIN indexes for JSONB fields (parameters, metadata)
7. Create GIN index for category array field
8. Create full-text search index using to_tsvector
9. Test all indexes with EXPLAIN ANALYZE

**Phase 3: Index Monitoring**
10. Create `src/lib/database-index-optimizer.ts`
11. Query pg_stat_user_indexes for index usage statistics
12. Implement unused index detector (idx_scan = 0 for 30 days)
13. Implement missing index detector from query logs
14. Create API endpoint for index recommendations

**ACCEPTANCE CRITERIA:**
- [ ] All core indexes created with CONCURRENTLY option
- [ ] Dashboard query uses composite index (verify with EXPLAIN)
- [ ] Review queue query uses partial index
- [ ] JSONB queries use GIN indexes
- [ ] Full-text search uses GIN index
- [ ] Index hit rate >95% for all indexed columns
- [ ] Unused index detector identifies low-usage indexes
- [ ] Missing index detector suggests new indexes
- [ ] API endpoint returns index health and recommendations

**TECHNICAL SPECIFICATIONS:**

Create migration `migrations/20XX_create_performance_indexes.sql`:
```sql
-- Single-column btree indexes
CREATE INDEX CONCURRENTLY idx_conversations_status 
  ON conversations(status);
  
CREATE INDEX CONCURRENTLY idx_conversations_tier 
  ON conversations(tier);
  
CREATE INDEX CONCURRENTLY idx_conversations_created_at 
  ON conversations(created_at DESC);
  
CREATE INDEX CONCURRENTLY idx_conversations_quality_score 
  ON conversations(quality_score);

-- Composite indexes for common patterns
CREATE INDEX CONCURRENTLY idx_conversations_status_quality 
  ON conversations(status, quality_score);
  
CREATE INDEX CONCURRENTLY idx_conversations_tier_status_date 
  ON conversations(tier, status, created_at DESC);

-- Partial index for review queue
CREATE INDEX CONCURRENTLY idx_conversations_pending_review 
  ON conversations(created_at) 
  WHERE status = 'pending_review';

-- GIN indexes for JSONB
CREATE INDEX CONCURRENTLY idx_conversations_parameters_gin 
  ON conversations USING GIN (parameters jsonb_path_ops);

-- GIN index for array containment
CREATE INDEX CONCURRENTLY idx_conversations_category_gin 
  ON conversations USING GIN (category);

-- Full-text search index
CREATE INDEX CONCURRENTLY idx_conversations_text_search 
  ON conversations USING GIN (
    to_tsvector('english', 
      COALESCE(title, '') || ' ' || 
      COALESCE(persona, '') || ' ' || 
      COALESCE(emotion, '')
    )
  );
```

Create `src/lib/database-index-optimizer.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

export class IndexOptimizer {
  async getIndexUsageStats() {
    const { data } = await this.supabase
      .from('pg_stat_user_indexes')
      .select('*')
      .eq('schemaname', 'public');
    
    return data;
  }

  async detectUnusedIndexes(daysThreshold: number = 30) {
    // Query indexes with idx_scan = 0 for X days
    const unused = await this.supabase.rpc('detect_unused_indexes', {
      days: daysThreshold
    });
    
    return unused.data;
  }

  async suggestMissingIndexes() {
    // Analyze pg_stat_statements for sequential scans
    const slowSeqScans = await this.supabase.rpc('find_slow_seq_scans');
    
    // Generate index recommendations
    const recommendations = this.generateRecommendations(slowSeqScans.data);
    
    return recommendations;
  }

  private generateRecommendations(queries: any[]) {
    const recommendations = [];
    
    for (const query of queries) {
      // Parse WHERE clauses and suggest indexes
      if (query.query.includes('WHERE')) {
        const columns = this.extractWhereColumns(query.query);
        recommendations.push({
          table: query.table,
          columns,
          reason: 'Frequent sequential scan with WHERE clause',
          estimatedImprovement: this.estimateImprovement(query)
        });
      }
    }
    
    return recommendations;
  }
}
```

Create API endpoint `src/app/api/admin/indexes/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { IndexOptimizer } from '@/lib/database-index-optimizer';

export async function GET(request: Request) {
  const optimizer = new IndexOptimizer();
  
  const [usage, unused, missing] = await Promise.all([
    optimizer.getIndexUsageStats(),
    optimizer.detectUnusedIndexes(),
    optimizer.suggestMissingIndexes()
  ]);

  return NextResponse.json({
    indexUsage: usage,
    unusedIndexes: unused,
    recommendations: missing
  });
}
```

**VALIDATION REQUIREMENTS:**
1. Run EXPLAIN ANALYZE on dashboard query and verify index usage
2. Query pg_stat_user_indexes and verify idx_scan > 0 for new indexes
3. Test unused index detector with test indexes
4. Validate missing index recommendations with known slow queries
5. Measure query performance before/after indexes (>50% improvement expected)

**DELIVERABLES:**
- `migrations/20XX_create_performance_indexes.sql` - Index creation (80-100 lines)
- `src/lib/database-index-optimizer.ts` - Index monitoring (250-300 lines)
- `src/app/api/admin/indexes/route.ts` - API endpoint (60-80 lines)
- `tests/database-index-optimizer.test.ts` - Unit tests (150-200 lines)
- Performance benchmark report comparing before/after

Implement this indexing strategy carefully using CONCURRENTLY to avoid table locks in production. Monitor index creation progress and roll back if issues arise.

++++++++++++++++++

### Prompt 3: Caching Layer and Query Optimization
**Scope**: Implement caching layer with LRU eviction and batch query optimization  
**Dependencies**: Prompts 1-2 completed, indexes operational  
**Estimated Time**: 18-22 hours  
**Risk Level**: Medium (cache invalidation complexity)

========================

You are a senior backend engineer implementing caching and query optimization for the Train Data Generation Platform.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
With indexes in place, the next optimization is reducing database load through intelligent caching. Frequently accessed data (templates, statistics, filter options) should be cached to minimize redundant database queries.

**Functional Requirements (FR11.1.1, FR11.1.2):**
- Template and scenario data must be cached with 5-minute TTL
- Dashboard statistics must be cached with 1-minute TTL
- Filter dropdown options must be cached with 10-minute TTL
- Cache keys generated from query fingerprint
- Cache hit/miss ratio must be monitored
- Cache invalidation must occur on relevant data mutations
- N+1 query problems must be eliminated using DataLoader pattern
- Bulk operations must use batch queries

**CURRENT CODEBASE STATE:**
- No caching layer exists
- All queries hit database directly
- Some N+1 query patterns in conversation-to-chunk relationships

**IMPLEMENTATION TASKS:**

From Task Inventory (T-2.1.0, T-2.1.1, T-2.1.2, T-2.1.3, T-2.2.0, T-2.2.1):

**Phase 1: In-Memory LRU Cache**
1. Create `src/lib/query-cache.ts` with LRU cache implementation
2. Implement TTL expiration management
3. Add cache statistics tracking (hit/miss ratios)
4. Create cache key generation from query fingerprint
5. Implement parameter normalization for consistent keys

**Phase 2: Cache Invalidation**
6. Add invalidation hooks in database CRUD operations
7. Implement pattern-based invalidation (by prefix)
8. Create admin cache clear endpoint
9. Add stale-while-revalidate pattern for non-critical queries

**Phase 3: DataLoader Integration**
10. Install DataLoader library
11. Create conversationLoader for batch fetching
12. Create templateLoader for batch fetching
13. Replace N+1 queries with loader.load() calls

**Phase 4: Batch Query Optimization**
14. Identify N+1 query patterns in codebase
15. Implement batch INSERT with multiple VALUES
16. Optimize bulk UPDATE operations with CASE statements

**ACCEPTANCE CRITERIA:**
- [ ] LRU cache with configurable max size (1000 items)
- [ ] TTL expiration automatically removes stale entries
- [ ] Cache hit rate >80% for templates and statistics
- [ ] Cache keys generated consistently
- [ ] Invalidation triggers on INSERT/UPDATE/DELETE
- [ ] DataLoader batches requests within event loop tick
- [ ] N+1 queries eliminated in conversation fetching
- [ ] Bulk operations use batch queries
- [ ] Cache statistics exposed via API endpoint

**TECHNICAL SPECIFICATIONS:**

Create `src/lib/query-cache.ts`:
```typescript
import LRU from 'lru-cache';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class QueryCache {
  private cache: LRU<string, CacheEntry<any>>;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0
  };

  constructor(maxSize: number = 1000) {
    this.cache = new LRU({
      max: maxSize,
      dispose: () => this.stats.evictions++
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.value;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      size: this.cache.size
    };
  }
}

// Singleton instance
let cacheInstance: QueryCache;

export function getQueryCache(): QueryCache {
  if (!cacheInstance) {
    cacheInstance = new QueryCache();
  }
  return cacheInstance;
}
```

Add cache wrapper to `src/lib/database.ts`:
```typescript
import { getQueryCache } from './query-cache';

export async function getTemplates() {
  const cache = getQueryCache();
  const cacheKey = 'templates:all';

  // Try cache first
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  // Fetch from database
  const { data } = await supabase.from('templates').select('*');

  // Cache for 5 minutes
  cache.set(cacheKey, data, 5 * 60 * 1000);

  return data;
}

export async function updateTemplate(id: string, updates: any) {
  const result = await supabase.from('templates').update(updates).eq('id', id);

  // Invalidate template cache
  const cache = getQueryCache();
  cache.invalidateByPrefix('templates:');

  return result;
}
```

Create `src/lib/data-loader.ts` for DataLoader pattern:
```typescript
import DataLoader from 'dataloader';
import { createClient } from './supabase';

// Batch load conversations by IDs
const conversationBatchFn = async (ids: readonly string[]) => {
  const { data } = await createClient()
    .from('conversations')
    .select('*')
    .in('id', ids as string[]);

  // Return in same order as requested IDs
  const conversationMap = new Map(data?.map(c => [c.id, c]));
  return ids.map(id => conversationMap.get(id) || null);
};

export const conversationLoader = new DataLoader(conversationBatchFn, {
  maxBatchSize: 100
});

// Usage: Replace individual queries
// Before (N+1):
// for (const id of conversationIds) {
//   const conversation = await getConversationById(id);
// }

// After (batched):
// const conversations = await Promise.all(
//   conversationIds.map(id => conversationLoader.load(id))
// );
```

Create API endpoint `src/app/api/admin/cache/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getQueryCache } from '@/lib/query-cache';

export async function GET() {
  const cache = getQueryCache();
  return NextResponse.json(cache.getStats());
}

export async function DELETE() {
  const cache = getQueryCache();
  cache.invalidateByPrefix('');  // Clear all
  return NextResponse.json({ success: true });
}
```

**VALIDATION REQUIREMENTS:**
1. Verify cache hit rate reaches >80% after warm-up period
2. Test TTL expiration removes stale entries correctly
3. Validate invalidation triggers on data mutations
4. Verify DataLoader batches requests (check query logs)
5. Measure performance improvement with caching (30-50% reduction in query count)

**DELIVERABLES:**
- `src/lib/query-cache.ts` - LRU cache implementation (200-250 lines)
- `src/lib/data-loader.ts` - DataLoader setup (150-200 lines)
- `src/lib/database.ts` - Modified with caching wrappers (add caching to 10+ functions)
- `src/app/api/admin/cache/route.ts` - Cache management API (40-50 lines)
- `tests/query-cache.test.ts` - Unit tests (150-200 lines)

Implement caching carefully with proper invalidation to avoid stale data bugs. Monitor cache hit rates and adjust TTLs as needed.

++++++++++++++++++

### Prompt 4: Frontend Performance Optimization
**Scope**: Implement table virtualization, optimistic updates, and code splitting  
**Dependencies**: Backend optimizations completed (Prompts 1-3)  
**Estimated Time**: 20-24 hours  
**Risk Level**: Medium (virtualization breaks some interactions)

========================

You are a senior frontend engineer implementing performance optimizations for the Train Data Generation Platform UI.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
With backend optimization complete, frontend performance is the next focus. Large conversation tables (1000+ rows) cause sluggish rendering. Code splitting will reduce initial bundle size, and optimistic updates will improve perceived performance.

**Functional Requirements (FR11.1.1, FR11.1.2):**
- Table must support 10,000+ conversations without lag
- Table filtering must respond within 300ms
- Table sorting must respond within 200ms
- Initial bundle size must be <200KB gzipped
- Route-based code splitting must be implemented
- Heavy components must be lazy loaded
- Optimistic UI updates for approve/reject actions

**CURRENT CODEBASE STATE:**
- `train-wireframe/src/components/dashboard/ConversationTable.tsx` renders all rows
- No virtualization or code splitting
- All route components loaded upfront
- UI updates wait for API responses

**IMPLEMENTATION TASKS:**

From Task Inventory (T-3.1.0, T-3.1.1, T-3.2.0, T-3.2.1, T-3.3.0, T-3.3.1):

**Phase 1: Table Virtualization**
1. Install @tanstack/react-virtual library
2. Refactor ConversationTable to use virtualizer
3. Configure scroll container and viewport
4. Handle dynamic row heights
5. Test with 10,000 row dataset

**Phase 2: Optimistic Updates**
6. Modify `train-wireframe/src/stores/useAppStore.ts` 
7. Create withOptimisticUpdate() wrapper function
8. Implement state snapshot and rollback logic
9. Refactor approve/reject actions to use optimistic pattern
10. Add error handling with state revert

**Phase 3: Code Splitting**
11. Convert route imports to React.lazy
12. Add Suspense boundaries with loading fallbacks
13. Implement route preloading on link hover
14. Lazy load heavy components (charts, modals)

**Phase 4: Bundle Optimization**
15. Run webpack bundle analyzer
16. Identify and optimize large dependencies
17. Verify bundle size <200KB gzipped

**ACCEPTANCE CRITERIA:**
- [ ] Table renders smoothly with 10,000 rows at 60fps
- [ ] Only visible rows rendered (viewport + buffer)
- [ ] Scroll performance maintains 60fps
- [ ] Approve/reject updates UI instantly before API response
- [ ] Failed operations revert UI changes with error toast
- [ ] Initial bundle size <200KB gzipped
- [ ] Route chunks loaded on navigation
- [ ] Heavy components lazy loaded
- [ ] Loading states display during chunk loading

**TECHNICAL SPECIFICATIONS:**

Refactor `train-wireframe/src/components/dashboard/ConversationTable.tsx`:
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export function ConversationTable({ conversations }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: conversations.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Row height in pixels
    overscan: 10 // Render extra rows for smooth scrolling
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualRow => {
          const conversation = conversations[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <ConversationRow conversation={conversation} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

Add optimistic updates to `train-wireframe/src/stores/useAppStore.ts`:
```typescript
import { create } from 'zustand';

interface AppStore {
  conversations: Conversation[];
  approveConversation: (id: string) => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  conversations: [],

  approveConversation: async (id: string) => {
    // Snapshot current state
    const previousConversations = get().conversations;

    // Optimistic update
    set({
      conversations: get().conversations.map(c =>
        c.id === id ? { ...c, status: 'approved' } : c
      )
    });

    try {
      // API call
      await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved' })
      });

      // Success - no action needed (already updated)
    } catch (error) {
      // Revert on error
      set({ conversations: previousConversations });
      toast.error('Failed to approve conversation');
    }
  }
}));
```

Implement route-based code splitting in `train-wireframe/src/App.tsx`:
```typescript
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load route components
const DashboardView = lazy(() => import('./components/dashboard/DashboardView'));
const TemplatesView = lazy(() => import('./components/views/TemplatesView'));
const ScenariosView = lazy(() => import('./components/views/ScenariosView'));
const SettingsView = lazy(() => import('./components/views/SettingsView'));

// Loading fallback
const RouteLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
  </div>
);

function App() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/" element={<DashboardView />} />
        <Route path="/templates" element={<TemplatesView />} />
        <Route path="/scenarios" element={<ScenariosView />} />
        <Route path="/settings" element={<SettingsView />} />
      </Routes>
    </Suspense>
  );
}
```

**VALIDATION REQUIREMENTS:**
1. Load 10,000 conversations and verify smooth scrolling (60fps)
2. Test optimistic updates with network throttling
3. Verify error cases revert UI state correctly
4. Run Lighthouse and verify bundle size <200KB
5. Test all routes load correctly with code splitting
6. Measure performance improvement (First Contentful Paint <1.5s)

**DELIVERABLES:**
- `train-wireframe/src/components/dashboard/ConversationTable.tsx` - Modified with virtualization (add 50-80 lines)
- `train-wireframe/src/stores/useAppStore.ts` - Modified with optimistic updates (add 30-50 lines)
- `train-wireframe/src/App.tsx` - Modified with lazy loading (modify imports)
- `tests/ConversationTable.test.tsx` - Tests for virtualization (100-150 lines)
- Performance audit report (Lighthouse scores)

Implement frontend optimizations carefully, ensuring accessibility and keyboard navigation still work with virtualization.

++++++++++++++++++

### Prompt 5: Pagination and Background Job Processing
**Scope**: Implement cursor-based pagination and background job queue for scalability  
**Dependencies**: All previous prompts completed  
**Estimated Time**: 18-22 hours  
**Risk Level**: Medium (job queue infrastructure)

========================

You are a senior backend engineer implementing pagination and background job processing for the Train Data Generation Platform.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
To support horizontal scaling and handle peak loads, long-running operations must be moved to background jobs, and API responses must use cursor-based pagination to avoid performance degradation with large datasets.

**Functional Requirements (FR11.1.2):**
- API must use cursor-based pagination (not offset-based)
- Default page size: 25, max: 100
- Response must include: data, nextCursor, hasMore, totalCount
- Long-running batch operations must be asynchronous
- Job queue must support priority, retry logic, rate limiting
- Job status must be queryable
- Failed jobs must retry with exponential backoff (max 3 retries)
- Queue must be durable (survive server restart)

**CURRENT CODEBASE STATE:**
- API uses simple SELECT without pagination
- Batch generation runs synchronously in API route
- No job queue infrastructure

**IMPLEMENTATION TASKS:**

From Task Inventory (T-4.1.0, T-4.1.1, T-4.2.0, T-4.2.1):

**Phase 1: Cursor-Based Pagination**
1. Create `src/lib/pagination-utils.ts` with cursor encoding/decoding
2. Modify `src/app/api/conversations/route.ts` to use cursor pagination
3. Implement query modification for cursor-based fetch
4. Format response with pagination metadata
5. Handle first page request (no cursor)

**Phase 2: Job Queue Setup**
6. Install BullMQ library and setup Redis connection
7. Create `src/lib/job-queue.ts` with queue configuration
8. Set up worker to process jobs
9. Define job types: batch-generation, export, cleanup
10. Implement retry logic with exponential backoff

**Phase 3: Background Batch Generation**
11. Refactor batch generation API to enqueue jobs
12. Create job processor for batch generation
13. Implement progress tracking in job metadata
14. Add job status query endpoint
15. Handle job cancellation

**ACCEPTANCE CRITERIA:**
- [ ] Cursor tokens are opaque, encrypted
- [ ] Pagination works correctly with filters and sorting
- [ ] Invalid cursors return clear error message
- [ ] Job queue connected to Redis
- [ ] Batch generation runs as background job
- [ ] Job progress queryable via API
- [ ] Failed jobs retry with exponential backoff
- [ ] Queue survives server restart
- [ ] Admin panel shows job queue status

**TECHNICAL SPECIFICATIONS:**

Create `src/lib/pagination-utils.ts`:
```typescript
import crypto from 'crypto';

interface CursorData {
  lastId: string;
  lastCreatedAt: string;
}

export function encodeCursor(data: CursorData): string {
  const json = JSON.stringify(data);
  const encrypted = crypto
    .createCipher('aes-256-cbc', process.env.CURSOR_SECRET!)
    .update(json, 'utf8', 'base64');
  return encrypted;
}

export function decodeCursor(cursor: string): CursorData {
  try {
    const decrypted = crypto
      .createDecipher('aes-256-cbc', process.env.CURSOR_SECRET!)
      .update(cursor, 'base64', 'utf8');
    return JSON.parse(decrypted);
  } catch {
    throw new Error('Invalid cursor');
  }
}
```

Modify `src/app/api/conversations/route.ts`:
```typescript
import { encodeCursor, decodeCursor } from '@/lib/pagination-utils';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cursor = url.searchParams.get('cursor');
  const pageSize = Math.min(parseInt(url.searchParams.get('pageSize') || '25'), 100);

  let query = supabase
    .from('conversations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(pageSize + 1); // Fetch one extra to determine hasMore

  if (cursor) {
    const { lastId, lastCreatedAt } = decodeCursor(cursor);
    query = query.or(`created_at.lt.${lastCreatedAt},and(created_at.eq.${lastCreatedAt},id.lt.${lastId})`);
  }

  const { data } = await query;
  
  const hasMore = data.length > pageSize;
  const conversations = data.slice(0, pageSize);

  const nextCursor = hasMore && conversations.length > 0
    ? encodeCursor({
        lastId: conversations[conversations.length - 1].id,
        lastCreatedAt: conversations[conversations.length - 1].created_at
      })
    : null;

  return NextResponse.json({
    data: conversations,
    nextCursor,
    hasMore,
    pageSize
  });
}
```

Create `src/lib/job-queue.ts`:
```typescript
import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export const batchGenerationQueue = new Queue('batch-generation', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: {
      age: 24 * 3600 // Keep for 24 hours
    }
  }
});

// Worker to process jobs
const worker = new Worker(
  'batch-generation',
  async (job: Job) => {
    const { conversationIds } = job.data;

    for (let i = 0; i < conversationIds.length; i++) {
      await generateConversation(conversationIds[i]);
      
      // Update progress
      await job.updateProgress({
        completed: i + 1,
        total: conversationIds.length
      });
    }

    return { success: true, count: conversationIds.length };
  },
  { connection: redis }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});
```

Refactor batch generation API:
```typescript
// src/app/api/conversations/generate-batch/route.ts
import { batchGenerationQueue } from '@/lib/job-queue';

export async function POST(request: Request) {
  const { conversationIds } = await request.json();

  const job = await batchGenerationQueue.add('generate', {
    conversationIds
  }, {
    priority: 1
  });

  return NextResponse.json({
    jobId: job.id,
    status: 'queued',
    message: 'Batch generation started in background'
  });
}
```

Create job status endpoint:
```typescript
// src/app/api/jobs/[id]/route.ts
import { batchGenerationQueue } from '@/lib/job-queue';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const job = await batchGenerationQueue.getJob(params.id);

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  const state = await job.getState();
  const progress = job.progress;

  return NextResponse.json({
    jobId: job.id,
    state,
    progress,
    data: job.data,
    result: await job.returnvalue
  });
}
```

**VALIDATION REQUIREMENTS:**
1. Test pagination through multiple pages with various filters
2. Verify cursor stability with concurrent data changes
3. Test job enqueueing and processing
4. Verify retry logic on failures
5. Test queue persistence (restart server during job processing)
6. Load test with 100+ concurrent job submissions

**DELIVERABLES:**
- `src/lib/pagination-utils.ts` - Cursor utilities (80-100 lines)
- `src/lib/job-queue.ts` - Job queue setup (200-250 lines)
- `src/app/api/conversations/route.ts` - Modified with pagination (add 40-60 lines)
- `src/app/api/conversations/generate-batch/route.ts` - Modified to use jobs (50-70 lines)
- `src/app/api/jobs/[id]/route.ts` - Job status endpoint (40-50 lines)
- `tests/job-queue.test.ts` - Unit tests (150-200 lines)

Implement pagination and job processing carefully, ensuring data consistency and proper error handling for failed jobs.

++++++++++++++++++

### Prompt 6: Load Testing and Production Monitoring
**Scope**: Implement comprehensive load testing and production APM  
**Dependencies**: All optimizations completed (Prompts 1-5)  
**Estimated Time**: 16-20 hours  
**Risk Level**: Low

========================

You are a senior DevOps engineer implementing load testing and production monitoring for the Train Data Generation Platform.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
With all optimizations implemented, validate performance under realistic load and establish production monitoring to ensure ongoing performance visibility and alerting.

**Functional Requirements (FR11.1.1, FR11.1.2):**
- Load tests must simulate 100+ concurrent users
- Response time benchmarks established for all endpoints
- Database query performance tested under load
- Frontend rendering performance measured with Lighthouse
- Performance regression tests run in CI/CD pipeline
- Real-time performance metrics tracked in production
- Alerts trigger for performance degradation
- Custom metrics track conversation generation time

**CURRENT CODEBASE STATE:**
- No load testing infrastructure
- No production monitoring beyond basic logging
- No performance benchmarks established

**IMPLEMENTATION TASKS:**

From Task Inventory (T-5.1.0, T-5.1.1, T-6.1.0, T-6.1.1):

**Phase 1: Load Testing with k6**
1. Install k6 load testing tool
2. Create `tests/performance/api-load-tests.js` with test scenarios
3. Configure realistic load profiles (VU ramp-up, duration)
4. Define performance thresholds (p95 < 500ms, error rate < 1%)
5. Test critical endpoints under load

**Phase 2: Frontend Performance Testing**
6. Set up Lighthouse CI in GitHub Actions
7. Define performance budgets (FCP < 1.5s, LCP < 2.5s, CLS < 0.1)
8. Run Lighthouse tests on every PR
9. Fail builds that regress performance

**Phase 3: Production Monitoring Setup**
10. Create Sentry account and integrate SDK
11. Configure performance monitoring and tracing
12. Add custom transactions for conversation generation
13. Set up alert rules for performance degradation
14. Create performance dashboard

**ACCEPTANCE CRITERIA:**
- [ ] Load tests simulate 100+ concurrent users
- [ ] API endpoints maintain p95 < 500ms under load
- [ ] Error rate remains <1% under load
- [ ] Lighthouse CI runs on every PR
- [ ] Performance budgets enforced in CI
- [ ] Sentry captures errors and performance data
- [ ] Custom metrics track generation time
- [ ] Alerts configured for p95 > 1000ms
- [ ] Dashboard shows real-time performance

**TECHNICAL SPECIFICATIONS:**

Create `tests/performance/api-load-tests.js`:
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 },  // Ramp up to 50 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 }    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],    // Error rate < 1%
  }
};

export default function () {
  // Test conversations list endpoint
  const listRes = http.get('http://localhost:3000/api/conversations');
  check(listRes, {
    'list status is 200': (r) => r.status === 200,
    'list response time < 500ms': (r) => r.timings.duration < 500
  });

  sleep(1);

  // Test single conversation fetch
  const conversations = JSON.parse(listRes.body).data;
  if (conversations.length > 0) {
    const singleRes = http.get(`http://localhost:3000/api/conversations/${conversations[0].id}`);
    check(singleRes, {
      'single status is 200': (r) => r.status === 200,
      'single response time < 200ms': (r) => r.timings.duration < 200
    });
  }

  sleep(2);
}
```

Run load tests:
```bash
# Install k6
brew install k6  # macOS
# or
sudo apt install k6  # Linux

# Run load tests
k6 run tests/performance/api-load-tests.js

# Run with custom VUs and duration
k6 run --vus 100 --duration 5m tests/performance/api-load-tests.js
```

Create `.github/workflows/lighthouse.yml`:
```yaml
name: Lighthouse CI
on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: npm run start &
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/templates
          uploadArtifacts: true
          temporaryPublicStorage: true
          budgetPath: ./lighthouse-budget.json
```

Create `lighthouse-budget.json`:
```json
{
  "resourceSizes": [
    {
      "resourceType": "script",
      "budget": 200
    },
    {
      "resourceType": "total",
      "budget": 500
    }
  ],
  "timings": [
    {
      "metric": "first-contentful-paint",
      "budget": 1500
    },
    {
      "metric": "largest-contentful-paint",
      "budget": 2500
    },
    {
      "metric": "cumulative-layout-shift",
      "budget": 0.1
    }
  ]
}
```

Initialize Sentry in `src/lib/sentry.ts`:
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing({
      tracingOrigins: ['localhost', /^\//],
    }),
  ],
});

export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({ name, op });
}
```

Add custom transaction for conversation generation:
```typescript
import { startTransaction } from '@/lib/sentry';

export async function generateConversation(params: any) {
  const transaction = startTransaction('conversation.generate', 'generation');

  try {
    // ... generation logic ...

    transaction.setStatus('ok');
    return result;
  } catch (error) {
    transaction.setStatus('error');
    Sentry.captureException(error);
    throw error;
  } finally {
    transaction.finish();
  }
}
```

Configure Sentry alerts:
```
1. Go to Sentry → Alerts → Create Alert
2. Configure conditions:
   - When p95 transaction duration for conversation.generate > 1000ms
   - For more than 5 minutes
   - Send notification to team Slack channel
```

**VALIDATION REQUIREMENTS:**
1. Run k6 load tests and verify all thresholds pass
2. Run Lighthouse CI and verify all budgets met
3. Trigger Sentry errors and verify captured correctly
4. Verify performance transactions appear in Sentry
5. Test alerts trigger when thresholds exceeded
6. Generate load test report with graphs

**DELIVERABLES:**
- `tests/performance/api-load-tests.js` - k6 test scenarios (150-200 lines)
- `.github/workflows/lighthouse.yml` - Lighthouse CI workflow (30-40 lines)
- `lighthouse-budget.json` - Performance budgets (30-40 lines)
- `src/lib/sentry.ts` - Sentry initialization (40-50 lines)
- Load test report with performance graphs
- Performance monitoring dashboard URL
- Alert configuration documentation

Implement comprehensive testing and monitoring to ensure performance remains optimal in production. Document all performance benchmarks for future reference.

++++++++++++++++++

---

## Quality Validation Checklist

### Post-Implementation Verification

**Performance Targets Met:**
- [ ] Page load completes within 2 seconds
- [ ] Table filtering responds within 300ms
- [ ] Table sorting responds within 200ms
- [ ] Single conversation generation completes within 30 seconds
- [ ] Database queries optimized to <100ms for indexed lookups
- [ ] Initial bundle size <200KB gzipped
- [ ] p95 API response times <500ms under load

**Functional Requirements:**
- [ ] All database queries wrapped with performance monitoring
- [ ] All core indexes created and in use
- [ ] Cache hit rate >80% for frequently accessed data
- [ ] Table virtualization handles 10,000+ rows smoothly
- [ ] Optimistic UI updates work correctly with rollback on error
- [ ] Cursor-based pagination implemented across all list endpoints
- [ ] Background jobs process long-running operations
- [ ] Load tests pass all defined thresholds
- [ ] Production monitoring captures errors and performance data

**Integration & Compatibility:**
- [ ] Performance monitoring integrates with existing database service
- [ ] Indexes don't break existing queries
- [ ] Cache invalidation triggers correctly on data mutations
- [ ] Table virtualization maintains accessibility features
- [ ] Pagination works with existing filters and sorting
- [ ] Job queue handles concurrent job submissions

**Code Quality:**
- [ ] TypeScript strict mode passes
- [ ] ESLint shows zero errors
- [ ] All new code has JSDoc comments
- [ ] Unit tests achieve 80%+ coverage for critical paths
- [ ] Integration tests verify end-to-end workflows

**Testing Coverage:**
- [ ] Performance monitoring tested with various query types
- [ ] Index usage verified with EXPLAIN ANALYZE
- [ ] Cache tested with TTL expiration and invalidation
- [ ] Table virtualization tested with large datasets
- [ ] Pagination tested with edge cases (first page, last page, invalid cursor)
- [ ] Job queue tested with failures and retries
- [ ] Load tests simulate realistic user behavior

**Documentation:**
- [ ] Performance monitoring setup documented
- [ ] Index strategy documented with rationale
- [ ] Cache TTL values documented with reasoning
- [ ] API pagination format documented
- [ ] Job queue architecture documented
- [ ] Load testing procedures documented
- [ ] Production monitoring dashboard access documented

### Cross-Prompt Consistency

**Architecture Patterns:**
- [ ] Consistent error handling across all new modules
- [ ] Uniform TypeScript interface definitions
- [ ] Standardized API response formats
- [ ] Common logging patterns used throughout

**Naming Conventions:**
- [ ] Database indexes follow idx_table_column(s) pattern
- [ ] Cache keys use prefix:identifier format
- [ ] API endpoints follow RESTful conventions
- [ ] Functions use descriptive, action-oriented names

**Performance Standards:**
- [ ] All database queries use indexes where applicable
- [ ] All expensive operations are cached
- [ ] All long-running operations use background jobs
- [ ] All frontend lists use virtualization for large datasets

**User Experience:**
- [ ] Loading states consistent across all operations
- [ ] Error messages user-friendly and actionable
- [ ] Performance improvements noticeable to users
- [ ] No regressions in existing functionality

---

## Next Segment Preparation

**E12 Segment (Future Work):**
The next segment will focus on advanced analytics and reporting features:
- Real-time analytics dashboard with performance metrics visualization
- Conversation quality trends over time
- Template effectiveness analysis
- Usage patterns and user behavior analytics
- Cost tracking and optimization recommendations
- Export audit reports for compliance

**Dependencies from E11:**
- Performance monitoring data will feed analytics dashboards
- Index optimizations enable efficient analytics queries
- Job queue infrastructure will process analytics computations
- Production monitoring provides real-time data for dashboards

**Technical Debt to Address:**
- Consider implementing Redis cluster for high-availability job queue
- Evaluate moving from in-memory cache to Redis for multi-instance deployments
- Plan for database sharding if conversations exceed 1 million records
- Implement query result streaming for very large exports

**Performance Benchmarks Established:**
Document all performance metrics achieved in E11 for future comparison:
- Database query times (p50, p95, p99)
- API response times by endpoint
- Frontend rendering metrics (LCP, FID, CLS)
- Cache hit rates
- Job processing throughput

These benchmarks will be used to detect performance regressions in future segments.

---

**Segment E11 Complete**

This comprehensive implementation plan provides all necessary context, requirements, and technical specifications for implementing performance optimization and scalability enhancements across the Train Data Generation Platform. Execute prompts sequentially, validating each phase before proceeding to the next.

**Total Implementation Scope:**
- 6 Implementation Prompts
- 120-160 hours estimated
- 68 tasks from task inventory
- Foundation for scaling to 10,000+ conversations and 100+ concurrent users

**Success Criteria:**
Upon completion of all prompts, the application will meet all FR11 performance and scalability requirements, with comprehensive monitoring and testing infrastructure in place for ongoing optimization.

