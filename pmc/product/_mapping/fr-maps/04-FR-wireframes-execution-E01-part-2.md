# Train Platform - Implementation Execution Part 2 (E01-Part-2)
**Generated**: 2025-10-29  
**Segment**: E01-Part-2 - Database Performance & Monitoring Infrastructure  
**Dependencies**: E01-Part-1 MUST be complete (database schema, core services, API routes)  
**Total Prompts**: 2  
**Estimated Implementation Time**: 24-32 hours

---

## Executive Summary

This execution file completes the E01 (Foundation & Core Infrastructure) requirements by implementing the missing components identified in `04-train-FR-wireframes-E01-output.md`:

**What Was Already Built in Part 1:**
- ✅ Conversations and conversation_turns tables with indexes
- ✅ Conversation service with CRUD operations
- ✅ Template service (using conversation_templates table)
- ✅ Generation log service
- ✅ API routes for conversations and templates
- ✅ Claude API integration with rate limiting
- ✅ Core UI components (dashboard, table, filters)

**What This Part 2 Adds (DELTA):**
- ❌ Database Performance Monitoring Service (T-1.3.1)
- ❌ Automated Index Maintenance System (T-1.3.2)
- ❌ Schema Migration Framework (T-1.3.3)
- ❌ Performance monitoring SQL infrastructure
- ❌ Scheduled maintenance jobs

---

## Context and Dependencies

### What Must Exist Before Running Part 2

**Database Tables (from Part 1):**
- `conversations` table with status, tier, quality_score columns
- `conversation_turns` table
- `conversation_templates` table (NOT prompt_templates)
- `generation_logs` table
- `scenarios` table
- `edge_cases` table
- `export_logs` table
- `batch_jobs` table

**Services (from Part 1):**
- `src/lib/conversation-service.ts` - Conversation CRUD
- `src/lib/template-service.ts` - Template management
- `src/lib/generation-log-service.ts` - API logging
- `src/app/api/conversations/route.ts` - Conversation endpoints
- `src/app/api/templates/route.ts` - Template endpoints

**Verification Command:**
```bash
# Verify tables exist
supabase db pull
# Check for: conversations, conversation_turns, conversation_templates, generation_logs
```

If any of these are missing, Part 1 is NOT complete. Do NOT proceed.

---

## SQL Setup Instructions

### Performance Monitoring Extensions and Tables

You must execute this SQL in the Supabase SQL Editor to enable performance monitoring infrastructure.

**IMPORTANT**: Run these SQL statements in order. Each section must complete successfully before proceeding to the next.

### Step 1: Enable Required Extensions

========================


```sql
-- ============================================================================
-- PERFORMANCE MONITORING EXTENSIONS
-- Description: Enable PostgreSQL extensions for query performance tracking
-- ============================================================================

-- Enable pg_stat_statements for query statistics
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Enable pg_trgm for text search performance (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Verify extensions are enabled
SELECT extname, extversion 
FROM pg_extension 
WHERE extname IN ('pg_stat_statements', 'pg_trgm');

-- Expected output: Two rows showing both extensions
```


++++++++++++++++++

### Step 2: Create Performance Monitoring Tables

========================


```sql
-- ============================================================================
-- PERFORMANCE MONITORING TABLES
-- Description: Tables for tracking query performance and system health
-- ============================================================================

-- Query performance log table
CREATE TABLE IF NOT EXISTS query_performance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_text TEXT NOT NULL,
    query_hash TEXT, -- MD5 hash of normalized query
    duration_ms INTEGER NOT NULL,
    execution_timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES user_profiles(id),
    endpoint TEXT, -- API endpoint that triggered the query
    parameters JSONB, -- Query parameters (sanitized)
    error_message TEXT, -- NULL if successful
    stack_trace TEXT, -- For debugging slow queries
    is_slow BOOLEAN GENERATED ALWAYS AS (duration_ms > 500) STORED,
    
    -- Indexes
    CONSTRAINT query_performance_logs_duration_check CHECK (duration_ms >= 0)
);

CREATE INDEX IF NOT EXISTS idx_query_perf_timestamp ON query_performance_logs(execution_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_query_perf_slow ON query_performance_logs(is_slow, duration_ms DESC) WHERE is_slow = true;
CREATE INDEX IF NOT EXISTS idx_query_perf_hash ON query_performance_logs(query_hash);
CREATE INDEX IF NOT EXISTS idx_query_perf_user ON query_performance_logs(user_id);

-- Index usage tracking table
CREATE TABLE IF NOT EXISTS index_usage_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_timestamp TIMESTAMPTZ DEFAULT NOW(),
    schemaname TEXT NOT NULL,
    tablename TEXT NOT NULL,
    indexname TEXT NOT NULL,
    idx_scan BIGINT NOT NULL, -- Number of index scans
    idx_tup_read BIGINT, -- Tuples read from index
    idx_tup_fetch BIGINT, -- Tuples fetched from table
    index_size_bytes BIGINT, -- Size of index
    table_size_bytes BIGINT, -- Size of table
    
    CONSTRAINT unique_snapshot UNIQUE(snapshot_timestamp, schemaname, tablename, indexname)
);

CREATE INDEX IF NOT EXISTS idx_usage_snapshots_time ON index_usage_snapshots(snapshot_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_usage_snapshots_table ON index_usage_snapshots(tablename, indexname);

-- Table bloat tracking
CREATE TABLE IF NOT EXISTS table_bloat_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_timestamp TIMESTAMPTZ DEFAULT NOW(),
    schemaname TEXT NOT NULL,
    tablename TEXT NOT NULL,
    actual_size_bytes BIGINT NOT NULL,
    estimated_size_bytes BIGINT NOT NULL,
    bloat_bytes BIGINT GENERATED ALWAYS AS (actual_size_bytes - estimated_size_bytes) STORED,
    bloat_ratio NUMERIC GENERATED ALWAYS AS (
        CASE 
            WHEN estimated_size_bytes > 0 
            THEN ROUND((actual_size_bytes - estimated_size_bytes)::NUMERIC / estimated_size_bytes * 100, 2)
            ELSE 0 
        END
    ) STORED,
    dead_tuples BIGINT,
    live_tuples BIGINT,
    
    CONSTRAINT unique_bloat_snapshot UNIQUE(snapshot_timestamp, schemaname, tablename)
);

CREATE INDEX IF NOT EXISTS idx_bloat_snapshots_time ON table_bloat_snapshots(snapshot_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_bloat_snapshots_ratio ON table_bloat_snapshots(bloat_ratio DESC) WHERE bloat_ratio > 20;

-- Performance alerts table
CREATE TABLE IF NOT EXISTS performance_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_type TEXT NOT NULL CHECK (alert_type IN ('slow_query', 'high_bloat', 'unused_index', 'missing_index', 'connection_pool')),
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES user_profiles(id),
    resolution_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_alerts_type ON performance_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_unresolved ON performance_alerts(created_at DESC) WHERE resolved_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON performance_alerts(severity, created_at DESC);

COMMENT ON TABLE query_performance_logs IS 'Tracks query execution times for performance monitoring';
COMMENT ON TABLE index_usage_snapshots IS 'Periodic snapshots of index usage statistics';
COMMENT ON TABLE table_bloat_snapshots IS 'Tracks table bloat over time for maintenance scheduling';
COMMENT ON TABLE performance_alerts IS 'System-generated performance alerts requiring attention';
```


++++++++++++++++++

### Step 3: Create Performance Monitoring Functions

========================


```sql
-- ============================================================================
-- PERFORMANCE MONITORING FUNCTIONS
-- Description: Helper functions for performance analysis and monitoring
-- ============================================================================

-- Function to capture current index usage snapshot
CREATE OR REPLACE FUNCTION capture_index_usage_snapshot()
RETURNS INTEGER AS $$
DECLARE
    rows_inserted INTEGER;
BEGIN
    INSERT INTO index_usage_snapshots (
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch,
        index_size_bytes,
        table_size_bytes
    )
    SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch,
        pg_relation_size(indexrelid) as index_size_bytes,
        pg_relation_size(relid) as table_size_bytes
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public';
    
    GET DIAGNOSTICS rows_inserted = ROW_COUNT;
    RETURN rows_inserted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect unused indexes (no scans in last 30 days)
CREATE OR REPLACE FUNCTION detect_unused_indexes(age_days INTEGER DEFAULT 30)
RETURNS TABLE (
    schemaname TEXT,
    tablename TEXT,
    indexname TEXT,
    index_size TEXT,
    idx_scan BIGINT,
    days_since_last_scan INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.schemaname::TEXT,
        s.tablename::TEXT,
        s.indexname::TEXT,
        pg_size_pretty(pg_relation_size(s.indexrelid))::TEXT as index_size,
        s.idx_scan,
        age_days as days_since_last_scan
    FROM pg_stat_user_indexes s
    WHERE s.schemaname = 'public'
        AND s.idx_scan = 0
        AND pg_relation_size(s.indexrelid) > 100000 -- Only indexes > 100KB
        AND s.indexname NOT LIKE '%_pkey' -- Exclude primary keys
    ORDER BY pg_relation_size(s.indexrelid) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate table bloat
CREATE OR REPLACE FUNCTION capture_table_bloat_snapshot()
RETURNS INTEGER AS $$
DECLARE
    rows_inserted INTEGER;
BEGIN
    INSERT INTO table_bloat_snapshots (
        schemaname,
        tablename,
        actual_size_bytes,
        estimated_size_bytes,
        dead_tuples,
        live_tuples
    )
    SELECT 
        schemaname,
        tablename,
        pg_total_relation_size(schemaname || '.' || tablename)::BIGINT as actual_size_bytes,
        -- Rough estimate: avg_row_size * live_tuples + some overhead
        (COALESCE(n_live_tup, 0) * 100 + 8192)::BIGINT as estimated_size_bytes, -- Assume 100 bytes per row avg
        n_dead_tup as dead_tuples,
        n_live_tup as live_tuples
    FROM pg_stat_user_tables
    WHERE schemaname = 'public';
    
    GET DIAGNOSTICS rows_inserted = ROW_COUNT;
    RETURN rows_inserted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get slow queries from the last N hours
CREATE OR REPLACE FUNCTION get_slow_queries(hours_back INTEGER DEFAULT 24, min_duration_ms INTEGER DEFAULT 500)
RETURNS TABLE (
    query_text TEXT,
    avg_duration_ms NUMERIC,
    max_duration_ms INTEGER,
    execution_count BIGINT,
    last_execution TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qpl.query_text::TEXT,
        ROUND(AVG(qpl.duration_ms)::NUMERIC, 2) as avg_duration_ms,
        MAX(qpl.duration_ms) as max_duration_ms,
        COUNT(*) as execution_count,
        MAX(qpl.execution_timestamp) as last_execution
    FROM query_performance_logs qpl
    WHERE qpl.execution_timestamp > NOW() - (hours_back || ' hours')::INTERVAL
        AND qpl.duration_ms >= min_duration_ms
    GROUP BY qpl.query_text
    ORDER BY avg_duration_ms DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create performance alert
CREATE OR REPLACE FUNCTION create_performance_alert(
    p_alert_type TEXT,
    p_severity TEXT,
    p_message TEXT,
    p_details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    alert_id UUID;
BEGIN
    INSERT INTO performance_alerts (alert_type, severity, message, details)
    VALUES (p_alert_type, p_severity, p_message, p_details)
    RETURNING id INTO alert_id;
    
    RETURN alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and alert on high bloat
CREATE OR REPLACE FUNCTION check_table_bloat_alerts()
RETURNS INTEGER AS $$
DECLARE
    alert_count INTEGER := 0;
    bloat_record RECORD;
BEGIN
    FOR bloat_record IN 
        SELECT tablename, bloat_ratio, bloat_bytes
        FROM table_bloat_snapshots
        WHERE snapshot_timestamp > NOW() - INTERVAL '1 hour'
            AND bloat_ratio > 20
    LOOP
        PERFORM create_performance_alert(
            'high_bloat',
            CASE 
                WHEN bloat_record.bloat_ratio > 50 THEN 'critical'
                WHEN bloat_record.bloat_ratio > 35 THEN 'error'
                ELSE 'warning'
            END,
            'Table ' || bloat_record.tablename || ' has ' || bloat_record.bloat_ratio || '% bloat',
            jsonb_build_object(
                'table', bloat_record.tablename,
                'bloat_ratio', bloat_record.bloat_ratio,
                'bloat_bytes', bloat_record.bloat_bytes
            )
        );
        alert_count := alert_count + 1;
    END LOOP;
    
    RETURN alert_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION capture_index_usage_snapshot() IS 'Captures current index usage statistics for trend analysis';
COMMENT ON FUNCTION detect_unused_indexes(INTEGER) IS 'Identifies indexes with no usage that can potentially be dropped';
COMMENT ON FUNCTION capture_table_bloat_snapshot() IS 'Calculates and stores table bloat metrics';
COMMENT ON FUNCTION get_slow_queries(INTEGER, INTEGER) IS 'Returns aggregated slow query statistics';
COMMENT ON FUNCTION create_performance_alert(TEXT, TEXT, TEXT, JSONB) IS 'Creates a new performance alert';
COMMENT ON FUNCTION check_table_bloat_alerts() IS 'Checks for high table bloat and creates alerts';
```


++++++++++++++++++

### Step 4: Create Maintenance Functions

========================


```sql
-- ============================================================================
-- AUTOMATED MAINTENANCE FUNCTIONS
-- Description: Functions for automated database maintenance tasks
-- ============================================================================

-- Function to perform vacuum analyze on specified table
CREATE OR REPLACE FUNCTION vacuum_analyze_table(table_name TEXT)
RETURNS TEXT AS $$
BEGIN
    EXECUTE format('VACUUM ANALYZE %I', table_name);
    RETURN 'VACUUM ANALYZE completed for ' || table_name;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'Error during VACUUM ANALYZE: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reindex table if bloat exceeds threshold
CREATE OR REPLACE FUNCTION reindex_if_bloated(
    table_name TEXT,
    bloat_threshold NUMERIC DEFAULT 20.0
)
RETURNS TEXT AS $$
DECLARE
    current_bloat NUMERIC;
    result_text TEXT;
BEGIN
    -- Get current bloat ratio
    SELECT bloat_ratio INTO current_bloat
    FROM table_bloat_snapshots
    WHERE tablename = table_name
    ORDER BY snapshot_timestamp DESC
    LIMIT 1;
    
    IF current_bloat IS NULL THEN
        RETURN 'No bloat data available for ' || table_name;
    END IF;
    
    IF current_bloat > bloat_threshold THEN
        EXECUTE format('REINDEX TABLE %I', table_name);
        result_text := 'REINDEX completed for ' || table_name || ' (bloat was ' || current_bloat || '%)';
        
        -- Create alert
        PERFORM create_performance_alert(
            'high_bloat',
            'info',
            'Table reindexed: ' || table_name,
            jsonb_build_object('previous_bloat', current_bloat, 'threshold', bloat_threshold)
        );
    ELSE
        result_text := 'Bloat (' || current_bloat || '%) below threshold (' || bloat_threshold || '%) for ' || table_name;
    END IF;
    
    RETURN result_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to perform weekly maintenance on all train module tables
CREATE OR REPLACE FUNCTION weekly_maintenance()
RETURNS TEXT AS $$
DECLARE
    result_text TEXT := '';
    table_record RECORD;
BEGIN
    -- Capture snapshots first
    PERFORM capture_index_usage_snapshot();
    PERFORM capture_table_bloat_snapshot();
    
    -- Vacuum analyze all train module tables
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
            AND tablename IN (
                'conversations', 
                'conversation_turns', 
                'conversation_templates',
                'scenarios',
                'edge_cases',
                'generation_logs',
                'export_logs',
                'batch_jobs',
                'query_performance_logs',
                'index_usage_snapshots',
                'table_bloat_snapshots'
            )
    LOOP
        result_text := result_text || vacuum_analyze_table(table_record.tablename) || '; ';
    END LOOP;
    
    -- Check for alerts
    PERFORM check_table_bloat_alerts();
    
    result_text := result_text || 'Weekly maintenance completed.';
    RETURN result_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION vacuum_analyze_table(TEXT) IS 'Performs VACUUM ANALYZE on specified table';
COMMENT ON FUNCTION reindex_if_bloated(TEXT, NUMERIC) IS 'Reindexes table if bloat exceeds threshold';
COMMENT ON FUNCTION weekly_maintenance() IS 'Performs comprehensive weekly maintenance on all tables';
```


++++++++++++++++++

### Step 5: Verify SQL Installation

After running all SQL sections above, verify installation with this query:

```sql
-- Verify all monitoring infrastructure is installed
SELECT 
    'Extensions' as component,
    COUNT(*) as count
FROM pg_extension 
WHERE extname IN ('pg_stat_statements', 'pg_trgm')

UNION ALL

SELECT 
    'Monitoring Tables',
    COUNT(*)
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN (
        'query_performance_logs',
        'index_usage_snapshots', 
        'table_bloat_snapshots',
        'performance_alerts'
    )

UNION ALL

SELECT 
    'Monitoring Functions',
    COUNT(*)
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name IN (
        'capture_index_usage_snapshot',
        'detect_unused_indexes',
        'capture_table_bloat_snapshot',
        'get_slow_queries',
        'create_performance_alert',
        'check_table_bloat_alerts',
        'vacuum_analyze_table',
        'reindex_if_bloated',
        'weekly_maintenance'
    );

-- Expected output:
-- Extensions: 2
-- Monitoring Tables: 4
-- Monitoring Functions: 9
```

**If any counts are wrong, review error messages and re-run failed sections.**

---

## Implementation Prompts

### Prompt 1: Database Performance Monitoring Service

**Scope**: Query performance logging, index monitoring, bloat tracking  
**Dependencies**: SQL setup above MUST be complete  
**Estimated Time**: 12-16 hours  
**Risk Level**: Medium

========================


You are a database performance engineer implementing comprehensive performance monitoring for the Interactive LoRA Conversation Generation platform.

**CONTEXT AND REQUIREMENTS:**

**Product Vision**: The system must maintain <100ms query performance as the conversation dataset grows to 10,000+ records. Performance degradation must be detected automatically and addressed proactively.

**Current Codebase State:**

Existing Infrastructure (DO NOT MODIFY):
- `src/lib/supabase.ts`: Supabase client configuration
- `src/lib/database.ts`: Generic database service patterns  
- Database tables: conversations, conversation_turns, conversation_templates, generation_logs
- Database monitoring tables: query_performance_logs, index_usage_snapshots, table_bloat_snapshots, performance_alerts
- Database functions: capture_index_usage_snapshot(), detect_unused_indexes(), capture_table_bloat_snapshot(), get_slow_queries(), create_performance_alert(), check_table_bloat_alerts()

**IMPLEMENTATION TASKS:**

**1. Query Performance Logging Service** (`src/lib/services/query-performance-service.ts`)

Create service to log and analyze query performance:

```typescript
import { createClient } from '@/lib/supabase';

interface QueryPerformanceLog {
  id: string;
  query_text: string;
  query_hash?: string;
  duration_ms: number;
  execution_timestamp: string;
  user_id?: string;
  endpoint?: string;
  parameters?: Record<string, any>;
  error_message?: string;
  stack_trace?: string;
  is_slow: boolean;
}

interface SlowQuery {
  query_text: string;
  avg_duration_ms: number;
  max_duration_ms: number;
  execution_count: number;
  last_execution: string;
}

export class QueryPerformanceService {
  private supabase = createClient();

  /**
   * Log a query execution with performance metrics
   */
  async logQuery(params: {
    query_text: string;
    duration_ms: number;
    user_id?: string;
    endpoint?: string;
    parameters?: Record<string, any>;
    error_message?: string;
    stack_trace?: string;
  }): Promise<void> {
    try {
      // Generate query hash for grouping similar queries
      const query_hash = this.hashQuery(params.query_text);

      const { error } = await this.supabase
        .from('query_performance_logs')
        .insert({
          query_text: params.query_text,
          query_hash,
          duration_ms: params.duration_ms,
          user_id: params.user_id,
          endpoint: params.endpoint,
          parameters: params.parameters || {},
          error_message: params.error_message,
          stack_trace: params.stack_trace,
        });

      if (error) {
        console.error('Failed to log query performance:', error);
      }

      // If slow query, create alert
      if (params.duration_ms > 500) {
        await this.createSlowQueryAlert(params.query_text, params.duration_ms);
      }
    } catch (err) {
      // Don't let logging failures break the application
      console.error('Query performance logging error:', err);
    }
  }

  /**
   * Get slow queries from the last N hours
   */
  async getSlowQueries(hours: number = 24, minDurationMs: number = 500): Promise<SlowQuery[]> {
    const { data, error } = await this.supabase
      .rpc('get_slow_queries', {
        hours_back: hours,
        min_duration_ms: minDurationMs,
      });

    if (error) {
      console.error('Failed to get slow queries:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get query performance statistics
   */
  async getQueryStats(startDate: Date, endDate: Date): Promise<{
    total_queries: number;
    slow_queries: number;
    avg_duration_ms: number;
    p95_duration_ms: number;
  }> {
    const { data, error } = await this.supabase
      .from('query_performance_logs')
      .select('duration_ms, is_slow')
      .gte('execution_timestamp', startDate.toISOString())
      .lte('execution_timestamp', endDate.toISOString());

    if (error || !data) {
      console.error('Failed to get query stats:', error);
      return { total_queries: 0, slow_queries: 0, avg_duration_ms: 0, p95_duration_ms: 0 };
    }

    const durations = data.map(d => d.duration_ms).sort((a, b) => a - b);
    const p95Index = Math.floor(durations.length * 0.95);
    
    return {
      total_queries: data.length,
      slow_queries: data.filter(d => d.is_slow).length,
      avg_duration_ms: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      p95_duration_ms: durations[p95Index] || 0,
    };
  }

  /**
   * Create alert for slow query
   */
  private async createSlowQueryAlert(queryText: string, durationMs: number): Promise<void> {
    const severity = durationMs > 2000 ? 'error' : durationMs > 1000 ? 'warning' : 'info';
    
    await this.supabase.rpc('create_performance_alert', {
      p_alert_type: 'slow_query',
      p_severity: severity,
      p_message: `Slow query detected: ${durationMs}ms`,
      p_details: {
        query: queryText.substring(0, 500), // Truncate long queries
        duration_ms: durationMs,
      },
    });
  }

  /**
   * Hash query text for grouping similar queries
   */
  private hashQuery(queryText: string): string {
    // Normalize query by removing literal values
    const normalized = queryText
      .replace(/\d+/g, '?') // Replace numbers with ?
      .replace(/'[^']*'/g, '?') // Replace string literals with ?
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .toLowerCase();
    
    // Simple hash function (in production, use crypto.createHash)
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }
}

// Export singleton instance
export const queryPerformanceService = new QueryPerformanceService();
```

**2. Index Monitoring Service** (`src/lib/services/index-monitoring-service.ts`)

Create service to monitor index usage and detect issues:

```typescript
import { createClient } from '@/lib/supabase';

interface IndexUsageSnapshot {
  schemaname: string;
  tablename: string;
  indexname: string;
  idx_scan: number;
  idx_tup_read: number;
  idx_tup_fetch: number;
  index_size_bytes: number;
  table_size_bytes: number;
}

interface UnusedIndex {
  schemaname: string;
  tablename: string;
  indexname: string;
  index_size: string;
  idx_scan: number;
  days_since_last_scan: number;
}

export class IndexMonitoringService {
  private supabase = createClient();

  /**
   * Capture current index usage snapshot
   */
  async captureSnapshot(): Promise<number> {
    const { data, error } = await this.supabase
      .rpc('capture_index_usage_snapshot');

    if (error) {
      console.error('Failed to capture index snapshot:', error);
      return 0;
    }

    return data || 0;
  }

  /**
   * Detect unused indexes
   */
  async detectUnusedIndexes(ageDays: number = 30): Promise<UnusedIndex[]> {
    const { data, error } = await this.supabase
      .rpc('detect_unused_indexes', { age_days: ageDays });

    if (error) {
      console.error('Failed to detect unused indexes:', error);
      return [];
    }

    // Create alerts for large unused indexes
    if (data && data.length > 0) {
      for (const index of data) {
        await this.createUnusedIndexAlert(index);
      }
    }

    return data || [];
  }

  /**
   * Get index usage trends
   */
  async getIndexTrends(tableName: string, days: number = 7): Promise<{
    indexname: string;
    scans_per_day: number[];
  }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await this.supabase
      .from('index_usage_snapshots')
      .select('indexname, idx_scan, snapshot_timestamp')
      .eq('tablename', tableName)
      .gte('snapshot_timestamp', startDate.toISOString())
      .order('snapshot_timestamp', { ascending: true });

    if (error || !data) {
      console.error('Failed to get index trends:', error);
      return [];
    }

    // Group by index and calculate daily scan rates
    const indexMap = new Map<string, number[]>();
    
    data.forEach(row => {
      if (!indexMap.has(row.indexname)) {
        indexMap.set(row.indexname, []);
      }
      indexMap.get(row.indexname)!.push(row.idx_scan);
    });

    return Array.from(indexMap.entries()).map(([indexname, scans]) => ({
      indexname,
      scans_per_day: scans,
    }));
  }

  /**
   * Create alert for unused index
   */
  private async createUnusedIndexAlert(index: UnusedIndex): Promise<void> {
    await this.supabase.rpc('create_performance_alert', {
      p_alert_type: 'unused_index',
      p_severity: 'warning',
      p_message: `Unused index detected: ${index.indexname} (${index.index_size})`,
      p_details: {
        table: index.tablename,
        index: index.indexname,
        size: index.index_size,
        days_unused: index.days_since_last_scan,
      },
    });
  }
}

export const indexMonitoringService = new IndexMonitoringService();
```

**3. Table Bloat Monitoring Service** (`src/lib/services/bloat-monitoring-service.ts`)

Create service to track and alert on table bloat:

```typescript
import { createClient } from '@/lib/supabase';

interface BloatSnapshot {
  schemaname: string;
  tablename: string;
  actual_size_bytes: number;
  estimated_size_bytes: number;
  bloat_bytes: number;
  bloat_ratio: number;
  dead_tuples: number;
  live_tuples: number;
}

export class BloatMonitoringService {
  private supabase = createClient();

  /**
   * Capture current table bloat snapshot
   */
  async captureSnapshot(): Promise<number> {
    const { data, error } = await this.supabase
      .rpc('capture_table_bloat_snapshot');

    if (error) {
      console.error('Failed to capture bloat snapshot:', error);
      return 0;
    }

    // Check for alerts
    await this.checkBloatAlerts();

    return data || 0;
  }

  /**
   * Get current bloat status for all tables
   */
  async getBloatStatus(): Promise<BloatSnapshot[]> {
    const { data, error } = await this.supabase
      .from('table_bloat_snapshots')
      .select('*')
      .order('snapshot_timestamp', { ascending: false })
      .limit(20); // One per table from latest snapshot

    if (error) {
      console.error('Failed to get bloat status:', error);
      return [];
    }

    // Filter to most recent snapshot per table
    const latestByTable = new Map<string, BloatSnapshot>();
    data?.forEach(snapshot => {
      if (!latestByTable.has(snapshot.tablename)) {
        latestByTable.set(snapshot.tablename, snapshot as BloatSnapshot);
      }
    });

    return Array.from(latestByTable.values());
  }

  /**
   * Get tables with high bloat (>20%)
   */
  async getHighBloatTables(threshold: number = 20): Promise<BloatSnapshot[]> {
    const allBloat = await this.getBloatStatus();
    return allBloat.filter(b => b.bloat_ratio > threshold);
  }

  /**
   * Check bloat and create alerts
   */
  private async checkBloatAlerts(): Promise<void> {
    const { error } = await this.supabase
      .rpc('check_table_bloat_alerts');

    if (error) {
      console.error('Failed to check bloat alerts:', error);
    }
  }
}

export const bloatMonitoringService = new BloatMonitoringService();
```

**4. Query Wrapper Middleware** (`src/lib/middleware/query-logger.ts`)

Create middleware to automatically log all database queries:

```typescript
import { queryPerformanceService } from '@/lib/services/query-performance-service';

/**
 * Wraps a database query with performance logging
 */
export async function withQueryLogging<T>(
  queryFn: () => Promise<T>,
  context: {
    queryName: string;
    endpoint?: string;
    userId?: string;
    parameters?: Record<string, any>;
  }
): Promise<T> {
  const startTime = performance.now();
  let error: Error | undefined;

  try {
    const result = await queryFn();
    return result;
  } catch (err) {
    error = err as Error;
    throw err;
  } finally {
    const duration = Math.round(performance.now() - startTime);
    
    // Log performance (don't await to avoid slowing down the query)
    queryPerformanceService.logQuery({
      query_text: context.queryName,
      duration_ms: duration,
      user_id: context.userId,
      endpoint: context.endpoint,
      parameters: context.parameters,
      error_message: error?.message,
      stack_trace: error?.stack,
    }).catch(err => {
      console.error('Failed to log query performance:', err);
    });
  }
}

/**
 * Example usage in existing services:
 * 
 * // In conversation-service.ts:
 * async list(filters: FilterConfig): Promise<Conversation[]> {
 *   return withQueryLogging(
 *     async () => {
 *       const { data } = await this.supabase
 *         .from('conversations')
 *         .select('*')
 *         .eq('status', filters.status);
 *       return data || [];
 *     },
 *     {
 *       queryName: 'conversations.list',
 *       endpoint: '/api/conversations',
 *       parameters: filters,
 *     }
 *   );
 * }
 */
```

**5. Performance Dashboard API Route** (`src/app/api/performance/route.ts`)

Create API endpoint to retrieve performance metrics:

```typescript
import { NextResponse } from 'next/server';
import { queryPerformanceService } from '@/lib/services/query-performance-service';
import { indexMonitoringService } from '@/lib/services/index-monitoring-service';
import { bloatMonitoringService } from '@/lib/services/bloat-monitoring-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric') || 'summary';

    switch (metric) {
      case 'summary':
        const endDate = new Date();
        const startDate = new Date();
        startDate.setHours(startDate.getHours() - 24);

        const [queryStats, bloatStatus, unusedIndexes] = await Promise.all([
          queryPerformanceService.getQueryStats(startDate, endDate),
          bloatMonitoringService.getBloatStatus(),
          indexMonitoringService.detectUnusedIndexes(),
        ]);

        return NextResponse.json({
          query_performance: queryStats,
          table_bloat: bloatStatus,
          unused_indexes: unusedIndexes,
          generated_at: new Date().toISOString(),
        });

      case 'slow_queries':
        const hours = parseInt(searchParams.get('hours') || '24');
        const slowQueries = await queryPerformanceService.getSlowQueries(hours);
        return NextResponse.json({ slow_queries: slowQueries });

      case 'bloat':
        const threshold = parseInt(searchParams.get('threshold') || '20');
        const highBloat = await bloatMonitoringService.getHighBloatTables(threshold);
        return NextResponse.json({ high_bloat_tables: highBloat });

      default:
        return NextResponse.json({ error: 'Invalid metric type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Performance API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve performance metrics' },
      { status: 500 }
    );
  }
}
```

**6. Scheduled Monitoring Job** (`src/lib/cron/performance-monitoring.ts`)

Create scheduled job to capture snapshots periodically:

```typescript
import { queryPerformanceService } from '@/lib/services/query-performance-service';
import { indexMonitoringService } from '@/lib/services/index-monitoring-service';
import { bloatMonitoringService } from '@/lib/services/bloat-monitoring-service';

/**
 * Hourly performance monitoring job
 * This should be triggered by your deployment platform's cron system
 * (Vercel Cron, AWS EventBridge, etc.)
 */
export async function hourlyMonitoring(): Promise<void> {
  console.log('[Cron] Starting hourly performance monitoring...');

  try {
    // Capture index usage snapshot
    const indexCount = await indexMonitoringService.captureSnapshot();
    console.log(`[Cron] Captured ${indexCount} index usage snapshots`);

    // Capture bloat snapshot
    const bloatCount = await bloatMonitoringService.captureSnapshot();
    console.log(`[Cron] Captured ${bloatCount} table bloat snapshots`);

    // Check for performance issues
    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 1);
    
    const queryStats = await queryPerformanceService.getQueryStats(startDate, endDate);
    
    if (queryStats.p95_duration_ms > 1000) {
      console.warn(`[Cron] P95 query duration (${queryStats.p95_duration_ms}ms) exceeds threshold (1000ms)`);
      // Alert would be automatically created by the service
    }

    console.log('[Cron] Hourly monitoring complete:', {
      queries: queryStats.total_queries,
      slow_queries: queryStats.slow_queries,
      avg_duration: queryStats.avg_duration_ms,
      p95_duration: queryStats.p95_duration_ms,
    });
  } catch (error) {
    console.error('[Cron] Hourly monitoring failed:', error);
  }
}

/**
 * Daily maintenance job
 * This should run during low-traffic hours (e.g., 2 AM)
 */
export async function dailyMaintenance(): Promise<void> {
  console.log('[Cron] Starting daily maintenance...');

  try {
    // Detect unused indexes
    const unusedIndexes = await indexMonitoringService.detectUnusedIndexes(30);
    console.log(`[Cron] Found ${unusedIndexes.length} unused indexes`);

    // Check for high bloat tables
    const highBloat = await bloatMonitoringService.getHighBloatTables(20);
    console.log(`[Cron] Found ${highBloat.length} tables with high bloat`);

    console.log('[Cron] Daily maintenance complete');
  } catch (error) {
    console.error('[Cron] Daily maintenance failed:', error);
  }
}
```

**ACCEPTANCE CRITERIA:**

Services:
- ✅ QueryPerformanceService logs all queries with duration
- ✅ Slow queries (>500ms) automatically create alerts
- ✅ IndexMonitoringService detects unused indexes
- ✅ BloatMonitoringService tracks table bloat over time
- ✅ Query wrapper middleware can be used in existing services
- ✅ Performance API endpoint returns comprehensive metrics

Integration:
- ✅ All services use correct table names (conversation_templates, NOT prompt_templates)
- ✅ All services reference user_profiles for user IDs
- ✅ Error handling prevents monitoring failures from breaking application
- ✅ Logging is async to avoid performance impact
- ✅ TypeScript types match database schema

Monitoring:
- ✅ Hourly snapshots captured automatically
- ✅ Daily maintenance reports sent
- ✅ Alerts created for slow queries, high bloat, unused indexes
- ✅ Dashboard displays real-time performance metrics

**DELIVERABLES:**

1. Three monitoring services with comprehensive tracking
2. Query logging middleware for integration with existing code
3. Performance API endpoint
4. Scheduled monitoring jobs
5. TypeScript types matching database schema
6. JSDoc documentation for all public methods

**VALIDATION:**

After implementation, test with these commands:

```typescript
// Test query logging
import { queryPerformanceService } from '@/lib/services/query-performance-service';

await queryPerformanceService.logQuery({
  query_text: 'SELECT * FROM conversations WHERE status = ?',
  duration_ms: 750,
  endpoint: '/api/conversations',
  user_id: 'test-user-id',
});

// Verify log was created
const slowQueries = await queryPerformanceService.getSlowQueries(1);
console.log('Slow queries:', slowQueries);

// Test index monitoring
import { indexMonitoringService } from '@/lib/services/index-monitoring-service';

await indexMonitoringService.captureSnapshot();
const unusedIndexes = await indexMonitoringService.detectUnusedIndexes();
console.log('Unused indexes:', unusedIndexes);

// Test bloat monitoring
import { bloatMonitoringService } from '@/lib/services/bloat-monitoring-service';

await bloatMonitoringService.captureSnapshot();
const bloatStatus = await bloatMonitoringService.getBloatStatus();
console.log('Bloat status:', bloatStatus);
```

Implement this feature completely, ensuring all acceptance criteria are met.


++++++++++++++++++

---

### Prompt 2: Schema Migration Framework

**Scope**: Migration manager, safe migration patterns, version control  
**Dependencies**: Prompt 1 complete, SQL setup complete  
**Estimated Time**: 12-16 hours  
**Risk Level**: High (affects deployment safety)

========================


You are a database architect implementing a safe schema migration framework for the Interactive LoRA Conversation Generation platform.

**CONTEXT AND REQUIREMENTS:**

**Challenge**: The system must support zero-downtime deployments with backward-compatible schema changes. Migrations must be reversible, versioned, and testable.

**Current Codebase State:**

Database Tables (DO NOT MODIFY):
- All train module tables exist: conversations, conversation_turns, conversation_templates, scenarios, edge_cases, generation_logs, export_logs, batch_jobs
- Monitoring tables exist: query_performance_logs, index_usage_snapshots, table_bloat_snapshots, performance_alerts
- Supabase migrations directory exists at `supabase/migrations/`

**IMPLEMENTATION TASKS:**

**1. Schema Version Tracking Table** (Add to Supabase SQL Editor)

First, create the schema version tracking table if it doesn't exist:

```sql
-- Create schema_migrations table if not exists (Supabase usually has this)
CREATE TABLE IF NOT EXISTS schema_migrations (
    version BIGINT PRIMARY KEY,
    description TEXT NOT NULL,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    applied_by TEXT,
    execution_time_ms INTEGER,
    checksum TEXT,
    
    CONSTRAINT valid_version CHECK (version > 0)
);

CREATE INDEX IF NOT EXISTS idx_schema_migrations_applied ON schema_migrations(applied_at DESC);

COMMENT ON TABLE schema_migrations IS 'Tracks applied database migrations for version control';
```

**2. Migration Manager Service** (`src/lib/services/migration-manager.ts`)

Create service to manage database migrations:

```typescript
import { createClient } from '@/lib/supabase';
import { createHash } from 'crypto';

interface Migration {
  version: number;
  description: string;
  applied_at?: string;
  applied_by?: string;
  execution_time_ms?: number;
  checksum?: string;
}

interface MigrationScript {
  version: number;
  description: string;
  up: string;
  down: string;
}

export class MigrationManager {
  private supabase = createClient();

  /**
   * Get current schema version
   */
  async getCurrentVersion(): Promise<number> {
    const { data, error } = await this.supabase
      .from('schema_migrations')
      .select('version')
      .order('version', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Failed to get current version:', error);
      return 0;
    }

    return data?.[0]?.version || 0;
  }

  /**
   * Get all applied migrations
   */
  async getAppliedMigrations(): Promise<Migration[]> {
    const { data, error } = await this.supabase
      .from('schema_migrations')
      .select('*')
      .order('version', { ascending: true });

    if (error) {
      console.error('Failed to get applied migrations:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Check if migration has been applied
   */
  async isMigrationApplied(version: number): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('schema_migrations')
      .select('version')
      .eq('version', version)
      .single();

    return !!data && !error;
  }

  /**
   * Record migration as applied
   */
  async recordMigration(params: {
    version: number;
    description: string;
    executionTimeMs: number;
    checksum: string;
    appliedBy?: string;
  }): Promise<void> {
    const { error } = await this.supabase
      .from('schema_migrations')
      .insert({
        version: params.version,
        description: params.description,
        execution_time_ms: params.executionTimeMs,
        checksum: params.checksum,
        applied_by: params.appliedBy,
      });

    if (error) {
      throw new Error(`Failed to record migration: ${error.message}`);
    }
  }

  /**
   * Remove migration record (for rollback)
   */
  async removeMigration(version: number): Promise<void> {
    const { error } = await this.supabase
      .from('schema_migrations')
      .delete()
      .eq('version', version);

    if (error) {
      throw new Error(`Failed to remove migration: ${error.message}`);
    }
  }

  /**
   * Calculate checksum of migration script
   */
  calculateChecksum(script: string): string {
    return createHash('md5').update(script).digest('hex');
  }

  /**
   * Validate migration script
   */
  validateMigration(migration: MigrationScript): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (migration.version <= 0) {
      errors.push('Version must be positive');
    }

    if (!migration.description) {
      errors.push('Description is required');
    }

    if (!migration.up || migration.up.trim().length === 0) {
      errors.push('Up migration script is required');
    }

    if (!migration.down || migration.down.trim().length === 0) {
      errors.push('Down migration script is required');
    }

    // Check for dangerous operations
    const dangerousPatterns = [
      /DROP\s+TABLE/i,
      /TRUNCATE/i,
      /DELETE\s+FROM.*WHERE\s+1=1/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(migration.up)) {
        errors.push(`Dangerous operation detected: ${pattern.source}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const migrationManager = new MigrationManager();
```

**3. Safe Migration Utilities** (`src/lib/services/migration-utils.ts`)

Create utility functions for safe migration patterns:

```typescript
/**
 * Safe migration patterns for zero-downtime deployments
 */

/**
 * Pattern 1: Add column with default value (no table rewrite)
 * 
 * Example:
 * ALTER TABLE conversations 
 * ADD COLUMN new_field TEXT DEFAULT 'default_value' NOT NULL;
 */
export function addColumnSafely(params: {
  table: string;
  column: string;
  type: string;
  defaultValue?: string;
  notNull?: boolean;
}): string {
  const { table, column, type, defaultValue, notNull } = params;
  
  let sql = `ALTER TABLE ${table}\nADD COLUMN IF NOT EXISTS ${column} ${type}`;
  
  if (defaultValue !== undefined) {
    sql += `\nDEFAULT ${defaultValue}`;
  }
  
  if (notNull) {
    sql += ' NOT NULL';
  }
  
  sql += ';';
  
  return sql;
}

/**
 * Pattern 2: Add constraint without full table scan (NOT VALID pattern)
 * 
 * Example:
 * ALTER TABLE conversations
 * ADD CONSTRAINT chk_quality_score 
 * CHECK (quality_score >= 0 AND quality_score <= 10)
 * NOT VALID;
 * 
 * -- Then later validate:
 * ALTER TABLE conversations
 * VALIDATE CONSTRAINT chk_quality_score;
 */
export function addConstraintSafely(params: {
  table: string;
  constraintName: string;
  constraintDefinition: string;
}): { add: string; validate: string } {
  const { table, constraintName, constraintDefinition } = params;
  
  return {
    add: `ALTER TABLE ${table}\nADD CONSTRAINT ${constraintName}\n${constraintDefinition}\nNOT VALID;`,
    validate: `ALTER TABLE ${table}\nVALIDATE CONSTRAINT ${constraintName};`,
  };
}

/**
 * Pattern 3: Rename column with backward-compatible view
 * 
 * Example:
 * Step 1: Add new column
 * Step 2: Copy data from old to new
 * Step 3: Create view with old name
 * Step 4: Update application code
 * Step 5: Drop view and old column
 */
export function renameColumnSafely(params: {
  table: string;
  oldColumn: string;
  newColumn: string;
  columnType: string;
}): {
  step1_add: string;
  step2_copy: string;
  step3_view: string;
  step4_drop_old: string;
} {
  const { table, oldColumn, newColumn, columnType } = params;
  
  return {
    step1_add: `ALTER TABLE ${table}\nADD COLUMN ${newColumn} ${columnType};`,
    step2_copy: `UPDATE ${table}\nSET ${newColumn} = ${oldColumn}\nWHERE ${newColumn} IS NULL;`,
    step3_view: `CREATE OR REPLACE VIEW ${table}_compat AS\nSELECT\n  *,\n  ${newColumn} AS ${oldColumn}\nFROM ${table};`,
    step4_drop_old: `ALTER TABLE ${table}\nDROP COLUMN ${oldColumn};`,
  };
}

/**
 * Pattern 4: Create index concurrently (no table locks)
 * 
 * Example:
 * CREATE INDEX CONCURRENTLY idx_conversations_new_field
 * ON conversations(new_field);
 */
export function createIndexConcurrently(params: {
  table: string;
  indexName: string;
  columns: string[];
  unique?: boolean;
  where?: string;
}): string {
  const { table, indexName, columns, unique, where } = params;
  
  let sql = 'CREATE';
  
  if (unique) {
    sql += ' UNIQUE';
  }
  
  sql += ` INDEX CONCURRENTLY IF NOT EXISTS ${indexName}`;
  sql += `\nON ${table}(${columns.join(', ')})`;
  
  if (where) {
    sql += `\nWHERE ${where}`;
  }
  
  sql += ';';
  
  return sql;
}

/**
 * Pattern 5: Drop column safely (two-phase approach)
 * 
 * Example:
 * Phase 1: Stop writing to column (application update)
 * Phase 2: Drop column after verification
 */
export function dropColumnSafely(params: {
  table: string;
  column: string;
}): { verify: string; drop: string } {
  const { table, column } = params;
  
  return {
    verify: `SELECT COUNT(*) as recent_updates\nFROM ${table}\nWHERE updated_at > NOW() - INTERVAL '7 days'\n  AND ${column} IS NOT NULL;`,
    drop: `ALTER TABLE ${table}\nDROP COLUMN IF EXISTS ${column};`,
  };
}

/**
 * Generate migration template
 */
export function generateMigrationTemplate(params: {
  version: number;
  description: string;
}): string {
  const { version, description } = params;
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  
  return `-- Migration: ${version}
-- Description: ${description}
-- Date: ${timestamp}
-- Author: [Your Name]

-- ============================================================================
-- UP MIGRATION
-- ============================================================================

-- Add your schema changes here
-- Use safe migration patterns:
--   - Add columns with DEFAULT values to avoid table rewrites
--   - Use NOT VALID constraints, then VALIDATE separately
--   - Create indexes CONCURRENTLY to avoid locks
--   - Use views for backward compatibility during column renames

BEGIN;

-- Your migration code here

COMMIT;

-- ============================================================================
-- DOWN MIGRATION (ROLLBACK)
-- ============================================================================

-- Reverse your changes here
-- This should restore the schema to its previous state

BEGIN;

-- Your rollback code here

COMMIT;
`;
}
```

**4. Migration CLI Tool** (`src/scripts/migrate.ts`)

Create command-line tool for running migrations:

```typescript
#!/usr/bin/env tsx

import { migrationManager } from '@/lib/services/migration-manager';
import { createClient } from '@/lib/supabase';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface CLIOptions {
  command: 'status' | 'up' | 'down' | 'create';
  version?: number;
  description?: string;
  steps?: number;
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  switch (options.command) {
    case 'status':
      await showStatus();
      break;
    case 'up':
      await migrateUp(options.version);
      break;
    case 'down':
      await migrateDown(options.steps || 1);
      break;
    case 'create':
      await createMigration(options.description!);
      break;
    default:
      showHelp();
  }
}

async function showStatus() {
  console.log('Migration Status:\n');
  
  const currentVersion = await migrationManager.getCurrentVersion();
  console.log(`Current Version: ${currentVersion}\n`);
  
  const applied = await migrationManager.getAppliedMigrations();
  console.log('Applied Migrations:');
  applied.forEach(m => {
    console.log(`  ${m.version}: ${m.description} (${m.applied_at})`);
  });
}

async function migrateUp(targetVersion?: number) {
  console.log('Running migrations...\n');
  
  const currentVersion = await migrationManager.getCurrentVersion();
  console.log(`Current version: ${currentVersion}`);
  
  // In a real implementation, you would:
  // 1. Read migration files from disk
  // 2. Filter migrations > currentVersion
  // 3. Sort by version
  // 4. Execute each migration
  // 5. Record in schema_migrations table
  
  console.log('Migration complete!');
}

async function migrateDown(steps: number) {
  console.log(`Rolling back ${steps} migration(s)...\n`);
  
  // In a real implementation, you would:
  // 1. Get last N applied migrations
  // 2. Execute down scripts in reverse order
  // 3. Remove from schema_migrations table
  
  console.log('Rollback complete!');
}

async function createMigration(description: string) {
  const version = Date.now(); // Use timestamp as version
  const filename = `${version}_${description.toLowerCase().replace(/\s+/g, '_')}.sql`;
  
  console.log(`Creating migration: ${filename}`);
  
  // Generate migration template
  const { generateMigrationTemplate } = await import('@/lib/services/migration-utils');
  const template = generateMigrationTemplate({ version, description });
  
  // Write to file (in real implementation)
  console.log('Migration template generated at: supabase/migrations/' + filename);
}

function parseArgs(args: string[]): CLIOptions {
  // Simple argument parsing (use a library like 'commander' in production)
  const command = args[0] as CLIOptions['command'];
  
  return {
    command,
    version: args.includes('--version') ? parseInt(args[args.indexOf('--version') + 1]) : undefined,
    description: args.includes('--description') ? args[args.indexOf('--description') + 1] : undefined,
    steps: args.includes('--steps') ? parseInt(args[args.indexOf('--steps') + 1]) : undefined,
  };
}

function showHelp() {
  console.log(`
Migration CLI Tool

Usage:
  tsx src/scripts/migrate.ts <command> [options]

Commands:
  status              Show current migration status
  up                  Run pending migrations
  down --steps N      Rollback N migrations
  create --description "Add new column"  Create new migration

Examples:
  tsx src/scripts/migrate.ts status
  tsx src/scripts/migrate.ts up
  tsx src/scripts/migrate.ts down --steps 1
  tsx src/scripts/migrate.ts create --description "Add user preferences"
  `);
}

main().catch(console.error);
```

**5. Migration Testing Utilities** (`src/lib/services/migration-testing.ts`)

Create utilities for testing migrations:

```typescript
import { createClient } from '@/lib/supabase';

export class MigrationTester {
  private supabase = createClient();

  /**
   * Test that migration can be applied and rolled back cleanly
   */
  async testMigration(params: {
    upScript: string;
    downScript: string;
  }): Promise<{
    success: boolean;
    errors: string[];
    timing: {
      up_ms: number;
      down_ms: number;
    };
  }> {
    const errors: string[] = [];
    let upTime = 0;
    let downTime = 0;

    try {
      // Test UP migration
      const upStart = Date.now();
      await this.executeSQL(params.upScript);
      upTime = Date.now() - upStart;

      // Test DOWN migration (rollback)
      const downStart = Date.now();
      await this.executeSQL(params.downScript);
      downTime = Date.now() - downStart;

      return {
        success: true,
        errors: [],
        timing: { up_ms: upTime, down_ms: downTime },
      };
    } catch (error) {
      errors.push((error as Error).message);
      return {
        success: false,
        errors,
        timing: { up_ms: upTime, down_ms: downTime },
      };
    }
  }

  /**
   * Execute SQL script
   */
  private async executeSQL(script: string): Promise<void> {
    const { error } = await this.supabase.rpc('exec_sql', { sql_script: script });
    
    if (error) {
      throw new Error(`SQL execution failed: ${error.message}`);
    }
  }

  /**
   * Verify table exists
   */
  async tableExists(tableName: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', tableName)
      .single();

    return !!data && !error;
  }

  /**
   * Verify column exists
   */
  async columnExists(tableName: string, columnName: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', tableName)
      .eq('column_name', columnName)
      .single();

    return !!data && !error;
  }

  /**
   * Verify index exists
   */
  async indexExists(indexName: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('pg_indexes')
      .select('indexname')
      .eq('indexname', indexName)
      .single();

    return !!data && !error;
  }
}

export const migrationTester = new MigrationTester();
```

**6. Documentation** (`docs/migrations.md`)

Create comprehensive migration documentation:

```markdown
# Database Migration Guide

## Safe Migration Patterns

### 1. Adding a Column

**DO:**
```sql
ALTER TABLE conversations
ADD COLUMN new_field TEXT DEFAULT 'default_value' NOT NULL;
```

**DON'T:**
```sql
-- This causes a table rewrite for large tables
ALTER TABLE conversations
ADD COLUMN new_field TEXT NOT NULL;
```

### 2. Adding Constraints

**DO:**
```sql
-- Add constraint without full table scan
ALTER TABLE conversations
ADD CONSTRAINT chk_quality_score
CHECK (quality_score >= 0 AND quality_score <= 10)
NOT VALID;

-- Validate in background
ALTER TABLE conversations
VALIDATE CONSTRAINT chk_quality_score;
```

### 3. Renaming Columns

Use a multi-phase approach:

**Phase 1: Deploy with both columns**
```sql
ALTER TABLE conversations ADD COLUMN new_name TEXT;
UPDATE conversations SET new_name = old_name;
CREATE VIEW conversations_v1 AS 
SELECT *, new_name AS old_name FROM conversations;
```

**Phase 2: Update application code**
Update all references from old_name to new_name

**Phase 3: Clean up**
```sql
DROP VIEW conversations_v1;
ALTER TABLE conversations DROP COLUMN old_name;
```

### 4. Creating Indexes

**DO:**
```sql
-- No table locks
CREATE INDEX CONCURRENTLY idx_conversations_field
ON conversations(field);
```

### 5. Zero-Downtime Deployments

1. Migrations must be backward compatible
2. Deploy database changes first
3. Then deploy application changes
4. Never remove columns/tables in same release that stops using them

## Migration Workflow

1. Create migration: `tsx src/scripts/migrate.ts create --description "Your change"`
2. Edit generated file with up/down scripts
3. Test in development: `tsx src/scripts/migrate.ts up`
4. Test rollback: `tsx src/scripts/migrate.ts down --steps 1`
5. Deploy to staging
6. Verify in staging
7. Deploy to production
```

**ACCEPTANCE CRITERIA:**

Migration Framework:
- ✅ Schema version tracking table created
- ✅ MigrationManager service tracks applied migrations
- ✅ Safe migration utilities provide proven patterns
- ✅ CLI tool supports create, up, down, status commands
- ✅ Migration tester validates up/down scripts
- ✅ Documentation covers all safe patterns

Safety:
- ✅ All migrations reversible via down scripts
- ✅ Dangerous operations flagged during validation
- ✅ Migrations tested before production deployment
- ✅ Zero-downtime patterns documented and enforced
- ✅ Backward compatibility maintained

Integration:
- ✅ Works with existing Supabase migrations
- ✅ Uses conversation_templates (not prompt_templates)
- ✅ References user_profiles (not auth.users)
- ✅ TypeScript types match database schema

**DELIVERABLES:**

1. Migration manager service with version tracking
2. Safe migration utility functions
3. CLI tool for migration management
4. Migration testing utilities
5. Comprehensive documentation with examples
6. Example migrations demonstrating patterns

**VALIDATION:**

After implementation, test with these scenarios:

```bash
# Show current migration status
tsx src/scripts/migrate.ts status

# Create a test migration
tsx src/scripts/migrate.ts create --description "Add test field"

# Test the migration utilities
```

```typescript
// Test migration manager
import { migrationManager } from '@/lib/services/migration-manager';

const version = await migrationManager.getCurrentVersion();
console.log('Current version:', version);

const applied = await migrationManager.getAppliedMigrations();
console.log('Applied migrations:', applied);

// Test safe patterns
import { addColumnSafely, createIndexConcurrently } from '@/lib/services/migration-utils';

const addColumnSQL = addColumnSafely({
  table: 'conversations',
  column: 'test_field',
  type: 'TEXT',
  defaultValue: "'default'",
  notNull: true,
});
console.log('Add column SQL:', addColumnSQL);

const indexSQL = createIndexConcurrently({
  table: 'conversations',
  indexName: 'idx_test_field',
  columns: ['test_field'],
});
console.log('Create index SQL:', indexSQL);
```

Implement this feature completely, ensuring production-ready migration framework.


++++++++++++++++++

---

## Completion ChecklistSQL Editor

After completing both prompts, verify:

**SQL Infrastructure:**
- [ ] Extensions enabled (pg_stat_statements, pg_trgm)
- [ ] Monitoring tables created (query_performance_logs, index_usage_snapshots, table_bloat_snapshots, performance_alerts)
- [ ] Monitoring functions created (9 total functions)
- [ ] Maintenance functions created (vacuum_analyze_table, reindex_if_bloated, weekly_maintenance)
- [ ] Schema_migrations table created

**Services:**
- [ ] QueryPerformanceService implemented and tested
- [ ] IndexMonitoringService implemented and tested
- [ ] BloatMonitoringService implemented and tested
- [ ] Query logging middleware created
- [ ] Performance API endpoint created
- [ ] MigrationManager service implemented
- [ ] Migration utilities created
- [ ] Migration CLI tool created

**Integration:**
- [ ] All services use correct table names
- [ ] All services reference user_profiles for FKs
- [ ] Scheduled monitoring jobs configured
- [ ] Migration testing utilities working
- [ ] Documentation complete

**Testing:**
- [ ] Query logging tested with sample queries
- [ ] Index monitoring captures snapshots correctly
- [ ] Bloat monitoring detects high bloat
- [ ] Migration up/down cycle works
- [ ] Safe migration patterns validated

---

## Next Steps

After completing Part 2:

1. **Configure Scheduled Jobs**: Set up cron jobs on your hosting platform to run:
   - `hourlyMonitoring()` every hour
   - `dailyMaintenance()` once per day at low-traffic time

2. **Integrate Query Logging**: Update existing services to use `withQueryLogging` middleware

3. **Set Up Alerting**: Configure alert destinations (email, Slack, etc.) for performance alerts

4. **Monitor Performance**: Use the `/api/performance` endpoint to track system health

5. **Document Runbooks**: Create operational procedures for responding to alerts

6. **Proceed to E04-E06**: With foundation complete, implement generation workflows, export system, and review queue

---

**Document Status**: Ready for Implementation  
**Dependencies**: E01-Part-1 must be complete  
**Estimated Completion**: 24-32 hours  
**Risk Assessment**: Medium-High (database operations require careful testing)

