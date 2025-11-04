-- =====================================================
-- Database Transaction Management Functions
-- =====================================================
-- 
-- This script creates PostgreSQL functions for transaction
-- management that can be called via Supabase RPC.
-- 
-- These functions enable:
-- - Transaction BEGIN with configurable isolation levels
-- - Transaction COMMIT
-- - Transaction ROLLBACK
-- 
-- Installation:
-- 1. Open Supabase SQL Editor
-- 2. Paste this entire script
-- 3. Execute
-- 
-- Verification:
-- Run: SELECT proname FROM pg_proc WHERE proname LIKE '%transaction%';
-- 
-- =====================================================

-- Function to begin a transaction with configurable isolation level
-- Supports: READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, SERIALIZABLE
CREATE OR REPLACE FUNCTION begin_transaction(
  isolation_level TEXT DEFAULT 'READ COMMITTED'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate isolation level
  IF isolation_level NOT IN (
    'READ UNCOMMITTED',
    'READ COMMITTED',
    'REPEATABLE READ',
    'SERIALIZABLE'
  ) THEN
    RAISE EXCEPTION 'Invalid isolation level: %. Must be one of: READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, SERIALIZABLE', isolation_level;
  END IF;

  -- Begin transaction with specified isolation level
  EXECUTE format('BEGIN ISOLATION LEVEL %s', isolation_level);
  
  -- Log transaction start (optional, for debugging)
  RAISE NOTICE 'Transaction started with isolation level: %', isolation_level;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION begin_transaction(TEXT) IS 
'Begin a database transaction with configurable isolation level. 
Default isolation level is READ COMMITTED.
Supports: READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, SERIALIZABLE';

-- =====================================================

-- Function to commit a transaction
CREATE OR REPLACE FUNCTION commit_transaction()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Commit the current transaction
  COMMIT;
  
  -- Log commit (optional, for debugging)
  RAISE NOTICE 'Transaction committed successfully';
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION commit_transaction() IS 
'Commit the current database transaction.
All changes made within the transaction will be persisted.';

-- =====================================================

-- Function to rollback a transaction
CREATE OR REPLACE FUNCTION rollback_transaction()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Rollback the current transaction
  ROLLBACK;
  
  -- Log rollback (optional, for debugging)
  RAISE NOTICE 'Transaction rolled back';
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION rollback_transaction() IS 
'Rollback the current database transaction.
All changes made within the transaction will be discarded.';

-- =====================================================

-- Optional: Helper function to execute arbitrary SQL
-- Useful for testing and integration tests
CREATE OR REPLACE FUNCTION execute_sql(sql TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

COMMENT ON FUNCTION execute_sql(TEXT) IS 
'Execute arbitrary SQL statement. 
WARNING: Use with caution. This function should only be accessible to administrators.';

-- =====================================================

-- Grant execute permissions (adjust based on your security requirements)
-- Option 1: Grant to authenticated users (most common)
GRANT EXECUTE ON FUNCTION begin_transaction(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION commit_transaction() TO authenticated;
GRANT EXECUTE ON FUNCTION rollback_transaction() TO authenticated;

-- Option 2: Grant to specific role (recommended for production)
-- GRANT EXECUTE ON FUNCTION begin_transaction(TEXT) TO your_app_role;
-- GRANT EXECUTE ON FUNCTION commit_transaction() TO your_app_role;
-- GRANT EXECUTE ON FUNCTION rollback_transaction() TO your_app_role;

-- Option 3: Grant to public (not recommended for production)
-- GRANT EXECUTE ON FUNCTION begin_transaction(TEXT) TO public;
-- GRANT EXECUTE ON FUNCTION commit_transaction() TO public;
-- GRANT EXECUTE ON FUNCTION rollback_transaction() TO public;

-- =====================================================

-- Verification queries
-- Uncomment to verify installation:

-- SELECT 
--   proname AS function_name,
--   pg_get_functiondef(oid) AS definition
-- FROM pg_proc 
-- WHERE proname IN ('begin_transaction', 'commit_transaction', 'rollback_transaction');

-- Test transaction functions:
-- SELECT begin_transaction('READ COMMITTED');
-- SELECT commit_transaction();
-- SELECT rollback_transaction();

-- =====================================================
-- END OF SCRIPT
-- =====================================================

