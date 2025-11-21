-- ============================================================================
-- E05 Export System - Create RPC Function for Schema Inspection
-- ============================================================================
-- Run this SQL ONCE in Supabase SQL Editor to create the RPC function
-- After this, the JavaScript scripts can call it programmatically
-- ============================================================================

CREATE OR REPLACE FUNCTION get_export_logs_schema()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'columns', (
      SELECT json_agg(json_build_object(
        'column_name', column_name,
        'data_type', data_type,
        'is_nullable', is_nullable,
        'column_default', column_default,
        'ordinal_position', ordinal_position
      ) ORDER BY ordinal_position)
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'export_logs'
    ),
    'indexes', (
      SELECT json_agg(json_build_object(
        'indexname', indexname,
        'indexdef', indexdef
      ) ORDER BY indexname)
      FROM pg_indexes
      WHERE schemaname = 'public' AND tablename = 'export_logs'
    ),
    'constraints', (
      SELECT json_agg(json_build_object(
        'constraint_name', conname,
        'constraint_type', CASE contype
          WHEN 'c' THEN 'CHECK'
          WHEN 'f' THEN 'FOREIGN KEY'
          WHEN 'p' THEN 'PRIMARY KEY'
          WHEN 'u' THEN 'UNIQUE'
          WHEN 't' THEN 'TRIGGER'
          WHEN 'x' THEN 'EXCLUSION'
          ELSE contype::text
        END,
        'definition', pg_get_constraintdef(oid)
      ) ORDER BY contype, conname)
      FROM pg_constraint
      WHERE conrelid = 'export_logs'::regclass
    ),
    'rls_policies', (
      SELECT json_agg(json_build_object(
        'policyname', policyname,
        'cmd', cmd,
        'qual', qual,
        'with_check', with_check
      ) ORDER BY policyname)
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'export_logs'
    ),
    'rls_enabled', (
      SELECT rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public' AND tablename = 'export_logs'
    ),
    'table_exists', (
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'export_logs'
      )
    ),
    'row_count', (
      SELECT COUNT(*)::int
      FROM export_logs
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_export_logs_schema() TO authenticated;

-- Test the function
SELECT get_export_logs_schema();

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- If the above SELECT returns JSON with schema information, you're all set!
-- Now you can run: node src/scripts/verify-e05-with-rpc.js
-- ============================================================================

