-- ================================================
-- Export Logs Table Verification Script
-- ================================================
-- 
-- This script verifies the export_logs table structure,
-- indexes, constraints, and RLS policies are correctly set up.
-- 
-- Run this in Supabase SQL Editor to verify the database
-- foundation for the Export Service Layer.
--
-- Expected Results:
-- 1. Table exists with 14 columns
-- 2. 5 indexes created (user_id, timestamp, status, format, expires_at)
-- 3. Foreign key to auth.users exists
-- 4. RLS enabled with 3 policies (SELECT, INSERT, UPDATE)
-- ================================================

-- ================================================
-- 1. Verify Table Structure
-- ================================================
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'export_logs'
ORDER BY ordinal_position;

-- Expected Output:
-- Column Name          | Data Type                | Nullable | Default
-- ---------------------|--------------------------|----------|------------------
-- id                   | uuid                     | NO       | gen_random_uuid()
-- export_id            | uuid                     | NO       | -
-- user_id              | uuid                     | NO       | -
-- timestamp            | timestamp with time zone | NO       | -
-- format               | text                     | NO       | -
-- config               | jsonb                    | NO       | -
-- conversation_count   | integer                  | NO       | -
-- file_size            | bigint                   | YES      | -
-- status               | text                     | NO       | 'queued'
-- file_url             | text                     | YES      | -
-- expires_at           | timestamp with time zone | YES      | -
-- error_message        | text                     | YES      | -
-- created_at           | timestamp with time zone | NO       | now()
-- updated_at           | timestamp with time zone | NO       | now()

-- ================================================
-- 2. Verify Indexes
-- ================================================
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'export_logs'
ORDER BY indexname;

-- Expected Output:
-- Index Name                          | Definition
-- ------------------------------------|---------------------------------------
-- export_logs_pkey                    | CREATE UNIQUE INDEX ... (id)
-- idx_export_logs_export_id           | CREATE UNIQUE INDEX ... (export_id)
-- idx_export_logs_user_id             | CREATE INDEX ... (user_id)
-- idx_export_logs_timestamp           | CREATE INDEX ... (timestamp DESC)
-- idx_export_logs_status              | CREATE INDEX ... (status)
-- idx_export_logs_format              | CREATE INDEX ... (format)
-- idx_export_logs_expires_at          | CREATE INDEX ... (expires_at)

-- ================================================
-- 3. Verify Foreign Key Constraints
-- ================================================
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name = 'export_logs';

-- Expected Output:
-- Constraint Name                   | Table         | Column   | Foreign Table | Foreign Column
-- ----------------------------------|---------------|----------|---------------|---------------
-- export_logs_user_id_fkey          | export_logs   | user_id  | users         | id

-- ================================================
-- 4. Verify RLS (Row Level Security) Status
-- ================================================
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'export_logs';

-- Expected Output:
-- Table Name    | RLS Enabled
-- --------------|------------
-- export_logs   | true

-- ================================================
-- 5. Verify RLS Policies
-- ================================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'export_logs'
ORDER BY policyname;

-- Expected Output:
-- Policy Name                    | Command | Roles  | Using (qual)              | With Check
-- -------------------------------|---------|--------|---------------------------|------------------
-- Users can select own exports   | SELECT  | public | (user_id = auth.uid())    | -
-- Users can insert own exports   | INSERT  | public | -                         | (user_id = auth.uid())
-- Users can update own exports   | UPDATE  | public | (user_id = auth.uid())    | (user_id = auth.uid())

-- ================================================
-- 6. Test Basic Insert/Select (Smoke Test)
-- ================================================
-- Note: This test requires authentication
-- If you're using the SQL Editor as an authenticated user, this should work

DO $$
DECLARE
  test_export_id uuid;
  inserted_count integer;
BEGIN
  -- Insert test record
  INSERT INTO export_logs (
    export_id,
    user_id,
    timestamp,
    format,
    config,
    conversation_count,
    status
  ) VALUES (
    gen_random_uuid(),
    auth.uid(),
    NOW(),
    'jsonl',
    '{"scope":"all","format":"jsonl","includeMetadata":true,"includeQualityScores":true,"includeTimestamps":true,"includeApprovalHistory":false,"includeParentReferences":false,"includeFullContent":true}'::jsonb,
    100,
    'queued'
  )
  RETURNING export_id INTO test_export_id;

  -- Verify insert worked
  SELECT COUNT(*) INTO inserted_count
  FROM export_logs
  WHERE export_id = test_export_id;

  IF inserted_count = 1 THEN
    RAISE NOTICE '✓ Test insert successful: %', test_export_id;
  ELSE
    RAISE EXCEPTION '✗ Test insert failed';
  END IF;

  -- Clean up test record
  DELETE FROM export_logs WHERE export_id = test_export_id;
  RAISE NOTICE '✓ Test cleanup successful';

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '✗ Test failed: %', SQLERRM;
END $$;

-- ================================================
-- 7. Summary Report
-- ================================================
SELECT
  'export_logs' AS table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = 'export_logs' AND table_schema = 'public') AS column_count,
  (SELECT COUNT(*) FROM pg_indexes 
   WHERE tablename = 'export_logs' AND schemaname = 'public') AS index_count,
  (SELECT COUNT(*) FROM pg_policies 
   WHERE tablename = 'export_logs' AND schemaname = 'public') AS policy_count,
  (SELECT rowsecurity FROM pg_tables 
   WHERE tablename = 'export_logs' AND schemaname = 'public') AS rls_enabled;

-- Expected Output:
-- Table Name   | Columns | Indexes | Policies | RLS Enabled
-- -------------|---------|---------|----------|------------
-- export_logs  | 14      | 7       | 3        | true

-- ================================================
-- 8. Check for Existing Records (optional)
-- ================================================
SELECT 
  export_id,
  user_id,
  format,
  status,
  conversation_count,
  timestamp,
  created_at
FROM export_logs
ORDER BY created_at DESC
LIMIT 5;

-- ================================================
-- VERIFICATION CHECKLIST
-- ================================================
-- 
-- ✅ Check 1: Table has 14 columns with correct data types
-- ✅ Check 2: 7 indexes exist (including PK and unique export_id)
-- ✅ Check 3: Foreign key constraint to auth.users(id) exists
-- ✅ Check 4: RLS is enabled on the table
-- ✅ Check 5: 3 RLS policies exist (SELECT, INSERT, UPDATE)
-- ✅ Check 6: Test insert/select works correctly
-- 
-- If all checks pass, the database foundation is ready!
-- ================================================

