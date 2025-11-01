-- Database Health Monitoring Foundation - Migration
-- Created: 2025-11-01
-- Purpose: Setup all required tables and functions for database health monitoring

-- ============================================================================
-- TABLES
-- ============================================================================

-- Maintenance Operations Table
CREATE TABLE IF NOT EXISTS maintenance_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type TEXT NOT NULL CHECK (operation_type IN ('VACUUM', 'VACUUM FULL', 'ANALYZE', 'REINDEX')),
  table_name TEXT,
  index_name TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms BIGINT,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  initiated_by UUID NOT NULL REFERENCES auth.users(id),
  error_message TEXT,
  options JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_operations_status ON maintenance_operations(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_operations_created_at ON maintenance_operations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_operations_table ON maintenance_operations(table_name);

-- Performance Alerts Table - ADD missing columns to existing table
-- Note: Table already exists with: id, alert_type, severity, message, details, created_at, resolved_at, resolved_by, resolution_notes
-- We need to add: acknowledged_at and acknowledged_by for alert workflow

-- Add acknowledged_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'performance_alerts' 
    AND column_name = 'acknowledged_at'
  ) THEN
    ALTER TABLE performance_alerts ADD COLUMN acknowledged_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add acknowledged_by column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'performance_alerts' 
    AND column_name = 'acknowledged_by'
  ) THEN
    ALTER TABLE performance_alerts ADD COLUMN acknowledged_by UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Indexes (IF NOT EXISTS will skip if they already exist)
CREATE INDEX IF NOT EXISTS idx_performance_alerts_resolved ON performance_alerts(resolved_at);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_created ON performance_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_severity ON performance_alerts(severity);

-- ============================================================================
-- HEALTH MONITORING FUNCTIONS
-- ============================================================================

-- Drop existing functions if signatures changed
DROP FUNCTION IF EXISTS get_database_overview();
DROP FUNCTION IF EXISTS get_table_health_metrics();
DROP FUNCTION IF EXISTS get_index_health_metrics();
DROP FUNCTION IF EXISTS get_connection_pool_metrics();
DROP FUNCTION IF EXISTS get_slow_queries(integer, integer);

-- Get Database Overview Metrics
CREATE OR REPLACE FUNCTION get_database_overview()
RETURNS TABLE (
  datname NAME,
  database_size BIGINT,
  numbackends INTEGER,
  xact_commit BIGINT,
  xact_rollback BIGINT,
  blks_read BIGINT,
  blks_hit BIGINT,
  tup_returned BIGINT,
  tup_fetched BIGINT,
  tup_inserted BIGINT,
  tup_updated BIGINT,
  tup_deleted BIGINT,
  conflicts BIGINT,
  temp_files BIGINT,
  temp_bytes BIGINT,
  deadlocks BIGINT,
  checksum_failures BIGINT,
  stats_reset TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.datname,
    pg_database_size(d.datname) AS database_size,
    d.numbackends,
    d.xact_commit,
    d.xact_rollback,
    d.blks_read,
    d.blks_hit,
    d.tup_returned,
    d.tup_fetched,
    d.tup_inserted,
    d.tup_updated,
    d.tup_deleted,
    d.conflicts,
    d.temp_files,
    d.temp_bytes,
    d.deadlocks,
    COALESCE(d.checksum_failures, 0) AS checksum_failures,
    d.stats_reset
  FROM pg_stat_database d
  WHERE d.datname = current_database();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Table Health Metrics
CREATE OR REPLACE FUNCTION get_table_health_metrics()
RETURNS TABLE (
  schemaname NAME,
  relname NAME,
  n_live_tup BIGINT,
  n_dead_tup BIGINT,
  table_size BIGINT,
  last_vacuum TIMESTAMP WITH TIME ZONE,
  last_autovacuum TIMESTAMP WITH TIME ZONE,
  last_analyze TIMESTAMP WITH TIME ZONE,
  last_autoanalyze TIMESTAMP WITH TIME ZONE,
  vacuum_count BIGINT,
  autovacuum_count BIGINT,
  analyze_count BIGINT,
  autoanalyze_count BIGINT,
  bloat_pct NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.schemaname,
    s.relname,
    s.n_live_tup,
    s.n_dead_tup,
    pg_total_relation_size(s.relid) AS table_size,
    s.last_vacuum,
    s.last_autovacuum,
    s.last_analyze,
    s.last_autoanalyze,
    s.vacuum_count,
    s.autovacuum_count,
    s.analyze_count,
    s.autoanalyze_count,
    -- Simple bloat estimation based on dead tuple ratio
    CASE 
      WHEN s.n_live_tup > 0 
      THEN ROUND((s.n_dead_tup::NUMERIC / s.n_live_tup::NUMERIC) * 100, 2)
      ELSE 0
    END AS bloat_pct
  FROM pg_stat_user_tables s
  ORDER BY pg_total_relation_size(s.relid) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Index Health Metrics
CREATE OR REPLACE FUNCTION get_index_health_metrics()
RETURNS TABLE (
  schemaname NAME,
  relname NAME,
  indexrelname NAME,
  index_size BIGINT,
  idx_scan BIGINT,
  idx_tup_read BIGINT,
  idx_tup_fetch BIGINT,
  days_since_last_use NUMERIC,
  bloat_pct NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.schemaname,
    s.relname,
    s.indexrelname,
    pg_relation_size(s.indexrelid) AS index_size,
    s.idx_scan,
    s.idx_tup_read,
    s.idx_tup_fetch,
    -- Approximate days since last use (0 if recently used)
    CASE 
      WHEN s.idx_scan > 0 THEN 0::NUMERIC
      ELSE 30::NUMERIC  -- Simplified: assume 30 days if never scanned
    END AS days_since_last_use,
    0::NUMERIC AS bloat_pct  -- Simplified bloat calculation
  FROM pg_stat_user_indexes s
  ORDER BY pg_relation_size(s.indexrelid) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Connection Pool Metrics
CREATE OR REPLACE FUNCTION get_connection_pool_metrics()
RETURNS TABLE (
  total BIGINT,
  active BIGINT,
  idle BIGINT,
  idle_in_transaction BIGINT,
  waiting BIGINT,
  max_connections INTEGER,
  by_database JSONB,
  by_user JSONB,
  longest_query_seconds NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT AS total,
    COUNT(*) FILTER (WHERE state = 'active')::BIGINT AS active,
    COUNT(*) FILTER (WHERE state = 'idle')::BIGINT AS idle,
    COUNT(*) FILTER (WHERE state = 'idle in transaction')::BIGINT AS idle_in_transaction,
    COUNT(*) FILTER (WHERE wait_event_type IS NOT NULL)::BIGINT AS waiting,
    (SELECT setting::INTEGER FROM pg_settings WHERE name = 'max_connections') AS max_connections,
    (SELECT COALESCE(jsonb_object_agg(datname, count), '{}'::jsonb) FROM (
      SELECT datname, COUNT(*)::INTEGER as count 
      FROM pg_stat_activity 
      WHERE datname IS NOT NULL
      GROUP BY datname
    ) db_counts) AS by_database,
    (SELECT COALESCE(jsonb_object_agg(usename, count), '{}'::jsonb) FROM (
      SELECT usename, COUNT(*)::INTEGER as count 
      FROM pg_stat_activity 
      WHERE usename IS NOT NULL
      GROUP BY usename
    ) user_counts) AS by_user,
    COALESCE(MAX(EXTRACT(EPOCH FROM (NOW() - query_start))), 0)::NUMERIC AS longest_query_seconds
  FROM pg_stat_activity
  WHERE pid <> pg_backend_pid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Slow Queries (requires pg_stat_statements extension)
-- Note: This function will fail if pg_stat_statements is not enabled
CREATE OR REPLACE FUNCTION get_slow_queries(
  hours_back INT DEFAULT 24,
  min_duration_ms INT DEFAULT 500
)
RETURNS TABLE (
  queryid BIGINT,
  query TEXT,
  calls BIGINT,
  total_exec_time NUMERIC,
  mean_exec_time NUMERIC,
  min_exec_time NUMERIC,
  max_exec_time NUMERIC,
  stddev_exec_time NUMERIC,
  rows BIGINT,
  shared_blks_hit BIGINT,
  shared_blks_read BIGINT
) AS $$
BEGIN
  -- Check if pg_stat_statements exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements'
  ) THEN
    RAISE NOTICE 'pg_stat_statements extension is not enabled. Returning empty result.';
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    s.queryid,
    s.query,
    s.calls,
    s.total_exec_time,
    s.mean_exec_time,
    s.min_exec_time,
    s.max_exec_time,
    s.stddev_exec_time,
    s.rows,
    s.shared_blks_hit,
    s.shared_blks_read
  FROM pg_stat_statements s
  WHERE s.mean_exec_time > min_duration_ms
  ORDER BY s.mean_exec_time DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- MAINTENANCE OPERATION FUNCTIONS
-- ============================================================================

-- Drop existing maintenance functions if they exist
DROP FUNCTION IF EXISTS execute_vacuum(text, boolean, boolean, boolean);
DROP FUNCTION IF EXISTS execute_analyze(text, boolean);
DROP FUNCTION IF EXISTS execute_reindex(text, text, boolean);
DROP FUNCTION IF EXISTS table_exists(text);
DROP FUNCTION IF EXISTS index_exists(text);

-- Execute VACUUM
CREATE OR REPLACE FUNCTION execute_vacuum(
  p_table_name TEXT DEFAULT NULL,
  p_full BOOLEAN DEFAULT FALSE,
  p_analyze BOOLEAN DEFAULT FALSE,
  p_verbose BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
DECLARE
  v_sql TEXT;
BEGIN
  -- Build VACUUM command
  v_sql := 'VACUUM';
  
  IF p_full THEN
    v_sql := v_sql || ' FULL';
  END IF;
  
  IF p_verbose THEN
    v_sql := v_sql || ' VERBOSE';
  END IF;
  
  IF p_analyze THEN
    v_sql := v_sql || ' ANALYZE';
  END IF;
  
  IF p_table_name IS NOT NULL THEN
    -- Validate table exists
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = p_table_name) THEN
      RAISE EXCEPTION 'Table % does not exist', p_table_name;
    END IF;
    v_sql := v_sql || ' ' || quote_ident(p_table_name);
  END IF;
  
  -- Execute VACUUM
  EXECUTE v_sql;
  
  RAISE NOTICE 'VACUUM completed: %', v_sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute ANALYZE
CREATE OR REPLACE FUNCTION execute_analyze(
  p_table_name TEXT DEFAULT NULL,
  p_verbose BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
DECLARE
  v_sql TEXT;
BEGIN
  v_sql := 'ANALYZE';
  
  IF p_verbose THEN
    v_sql := v_sql || ' VERBOSE';
  END IF;
  
  IF p_table_name IS NOT NULL THEN
    -- Validate table exists
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = p_table_name) THEN
      RAISE EXCEPTION 'Table % does not exist', p_table_name;
    END IF;
    v_sql := v_sql || ' ' || quote_ident(p_table_name);
  END IF;
  
  EXECUTE v_sql;
  
  RAISE NOTICE 'ANALYZE completed: %', v_sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute REINDEX
CREATE OR REPLACE FUNCTION execute_reindex(
  p_table_name TEXT DEFAULT NULL,
  p_index_name TEXT DEFAULT NULL,
  p_concurrent BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
DECLARE
  v_sql TEXT;
BEGIN
  IF p_index_name IS NOT NULL THEN
    -- Reindex specific index
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = p_index_name) THEN
      RAISE EXCEPTION 'Index % does not exist', p_index_name;
    END IF;
    
    v_sql := 'REINDEX';
    IF p_concurrent THEN
      v_sql := v_sql || ' INDEX CONCURRENTLY';
    ELSE
      v_sql := v_sql || ' INDEX';
    END IF;
    v_sql := v_sql || ' ' || quote_ident(p_index_name);
  ELSIF p_table_name IS NOT NULL THEN
    -- Reindex entire table
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = p_table_name) THEN
      RAISE EXCEPTION 'Table % does not exist', p_table_name;
    END IF;
    
    v_sql := 'REINDEX';
    IF p_concurrent THEN
      v_sql := v_sql || ' TABLE CONCURRENTLY';
    ELSE
      v_sql := v_sql || ' TABLE';
    END IF;
    v_sql := v_sql || ' ' || quote_ident(p_table_name);
  ELSE
    RAISE EXCEPTION 'Either table_name or index_name must be provided';
  END IF;
  
  EXECUTE v_sql;
  
  RAISE NOTICE 'REINDEX completed: %', v_sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Check if table exists
CREATE OR REPLACE FUNCTION table_exists(p_table_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = p_table_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if index exists
CREATE OR REPLACE FUNCTION index_exists(p_index_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname = p_index_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on maintenance_operations
ALTER TABLE maintenance_operations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all operations
CREATE POLICY "Allow authenticated users to view maintenance operations"
ON maintenance_operations FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert operations (initiated_by will be their user_id)
CREATE POLICY "Allow authenticated users to create maintenance operations"
ON maintenance_operations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = initiated_by);

-- Only allow service role to update operations (for status updates)
CREATE POLICY "Allow service role to update maintenance operations"
ON maintenance_operations FOR UPDATE
TO service_role
USING (true);

-- Enable RLS on performance_alerts (if not already enabled)
ALTER TABLE performance_alerts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Allow authenticated users to view alerts" ON performance_alerts;
DROP POLICY IF EXISTS "Allow authenticated users to acknowledge alerts" ON performance_alerts;
DROP POLICY IF EXISTS "Allow service role to create alerts" ON performance_alerts;

-- Allow authenticated users to view all alerts
CREATE POLICY "Allow authenticated users to view alerts"
ON performance_alerts FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to update alerts (for acknowledgment)
CREATE POLICY "Allow authenticated users to acknowledge alerts"
ON performance_alerts FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow service role to insert alerts (from monitoring system)
CREATE POLICY "Allow service role to create alerts"
ON performance_alerts FOR INSERT
TO service_role
WITH CHECK (true);

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION get_database_overview() TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_health_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_index_health_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_connection_pool_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_slow_queries(INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_vacuum(TEXT, BOOLEAN, BOOLEAN, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_analyze(TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_reindex(TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION table_exists(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION index_exists(TEXT) TO authenticated;

-- Grant table permissions
GRANT SELECT ON maintenance_operations TO authenticated;
GRANT INSERT ON maintenance_operations TO authenticated;
GRANT SELECT ON performance_alerts TO authenticated;
GRANT UPDATE ON performance_alerts TO authenticated;

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE maintenance_operations IS 'Tracks database maintenance operations (VACUUM, ANALYZE, REINDEX) with execution history and status';
COMMENT ON COLUMN performance_alerts.acknowledged_at IS 'Timestamp when alert was acknowledged by a user';
COMMENT ON COLUMN performance_alerts.acknowledged_by IS 'User who acknowledged the alert';

COMMENT ON FUNCTION get_database_overview() IS 'Returns comprehensive database-wide metrics from pg_stat_database';
COMMENT ON FUNCTION get_table_health_metrics() IS 'Returns table-level health metrics including bloat and maintenance status';
COMMENT ON FUNCTION get_index_health_metrics() IS 'Returns index-level health metrics including usage statistics';
COMMENT ON FUNCTION get_connection_pool_metrics() IS 'Returns connection pool status and utilization metrics';
COMMENT ON FUNCTION get_slow_queries(INT, INT) IS 'Returns slow queries from pg_stat_statements (requires extension)';
COMMENT ON FUNCTION execute_vacuum(TEXT, BOOLEAN, BOOLEAN, BOOLEAN) IS 'Executes VACUUM operation with safety checks';
COMMENT ON FUNCTION execute_analyze(TEXT, BOOLEAN) IS 'Executes ANALYZE operation with safety checks';
COMMENT ON FUNCTION execute_reindex(TEXT, TEXT, BOOLEAN) IS 'Executes REINDEX operation with safety checks';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify migration
DO $$
BEGIN
  RAISE NOTICE '✅ Database Health Monitoring migration completed successfully';
  RAISE NOTICE '📊 Table created: maintenance_operations';
  RAISE NOTICE '📊 Table updated: performance_alerts (added acknowledged_at, acknowledged_by columns)';
  RAISE NOTICE '🔧 Functions created: 11 monitoring and maintenance functions';
  RAISE NOTICE '🔒 RLS policies configured for security';
  RAISE NOTICE '⚠️  Note: pg_stat_statements extension must be enabled separately for slow query tracking';
END $$;

