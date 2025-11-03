-- ============================================================================
-- E05 Export System - Manual Verification Script (Supabase Compatible)
-- ============================================================================
-- Run this entire script in Supabase SQL Editor
-- It will return multiple result sets with all verification information
-- ============================================================================

-- QUERY 1: TABLE EXISTENCE CHECK
-- ============================================================================
SELECT 
  '1. TABLE EXISTENCE' as verification_section,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'export_logs'
  ) AS table_exists,
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'export_logs'
    ) THEN '✅ Table EXISTS'
    ELSE '❌ Table MISSING'
  END as status;

-- QUERY 2: COLUMN STRUCTURE
-- ============================================================================
SELECT 
  '2. COLUMNS' as verification_section,
  column_name AS column_name, 
  data_type AS data_type,
  CASE 
    WHEN character_maximum_length IS NOT NULL 
    THEN data_type || '(' || character_maximum_length || ')'
    WHEN numeric_precision IS NOT NULL
    THEN data_type || '(' || numeric_precision || ')'
    ELSE data_type 
  END AS full_type,
  is_nullable AS nullable,
  CASE 
    WHEN column_default LIKE 'gen_random_uuid()%' THEN 'UUID auto-generated'
    WHEN column_default LIKE 'now()%' THEN 'Current timestamp'
    WHEN column_default LIKE 'CURRENT_TIMESTAMP%' THEN 'Current timestamp'
    ELSE column_default
  END AS default_value,
  ordinal_position as position
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'export_logs'
ORDER BY ordinal_position;

-- QUERY 3: COLUMN COUNT SUMMARY
-- ============================================================================
SELECT 
  '3. COLUMN SUMMARY' as verification_section,
  COUNT(*) AS actual_columns,
  14 AS expected_columns,
  CASE 
    WHEN COUNT(*) = 14 THEN '✅ Correct column count'
    WHEN COUNT(*) > 14 THEN '⚠️  Extra columns (' || (COUNT(*) - 14) || ' more than expected)'
    ELSE '❌ Missing columns (' || (14 - COUNT(*)) || ' missing)'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'export_logs';

-- QUERY 4: CHECK FOR CRITICAL COLUMNS
-- ============================================================================
WITH expected_columns AS (
  SELECT unnest(ARRAY[
    'id', 'export_id', 'user_id', 'timestamp', 'format', 'config',
    'conversation_count', 'file_size', 'status', 'file_url', 
    'expires_at', 'error_message', 'created_at', 'updated_at'
  ]) AS col_name
),
actual_columns AS (
  SELECT column_name 
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'export_logs'
)
SELECT 
  '4. MISSING COLUMNS CHECK' as verification_section,
  e.col_name as expected_column,
  CASE 
    WHEN a.column_name IS NOT NULL THEN '✅ Present'
    ELSE '❌ MISSING'
  END as status,
  CASE 
    WHEN e.col_name IN ('id', 'export_id', 'user_id', 'format', 'status', 'config') THEN '⭐ CRITICAL'
    ELSE 'Standard'
  END as importance
FROM expected_columns e
LEFT JOIN actual_columns a ON e.col_name = a.column_name
ORDER BY 
  CASE WHEN a.column_name IS NULL THEN 0 ELSE 1 END,
  e.col_name;

-- QUERY 5: INDEXES
-- ============================================================================
SELECT 
  '5. INDEXES' as verification_section,
  indexname AS index_name,
  indexdef AS index_definition
FROM pg_indexes 
WHERE schemaname = 'public' AND tablename = 'export_logs'
ORDER BY indexname;

-- QUERY 6: INDEX COUNT SUMMARY
-- ============================================================================
SELECT 
  '6. INDEX SUMMARY' as verification_section,
  COUNT(*) AS actual_indexes,
  5 AS expected_indexes,
  CASE 
    WHEN COUNT(*) >= 5 THEN '✅ Sufficient indexes'
    ELSE '⚠️  Missing ' || (5 - COUNT(*)) || ' indexes'
  END as status
FROM pg_indexes 
WHERE schemaname = 'public' AND tablename = 'export_logs';

-- QUERY 7: CHECK FOR EXPECTED INDEXES
-- ============================================================================
WITH expected_indexes AS (
  SELECT unnest(ARRAY[
    'idx_export_logs_user_id',
    'idx_export_logs_timestamp',
    'idx_export_logs_status',
    'idx_export_logs_format',
    'idx_export_logs_expires_at'
  ]) AS idx_name
),
actual_indexes AS (
  SELECT indexname 
  FROM pg_indexes
  WHERE schemaname = 'public' AND tablename = 'export_logs'
)
SELECT 
  '7. MISSING INDEXES CHECK' as verification_section,
  e.idx_name as expected_index,
  CASE 
    WHEN a.indexname IS NOT NULL THEN '✅ Present'
    ELSE '❌ MISSING'
  END as status
FROM expected_indexes e
LEFT JOIN actual_indexes a ON e.idx_name = a.indexname
ORDER BY 
  CASE WHEN a.indexname IS NULL THEN 0 ELSE 1 END,
  e.idx_name;

-- QUERY 8: CONSTRAINTS
-- ============================================================================
SELECT 
  '8. CONSTRAINTS' as verification_section,
  conname AS constraint_name,
  CASE contype
    WHEN 'c' THEN 'CHECK'
    WHEN 'f' THEN 'FOREIGN KEY'
    WHEN 'p' THEN 'PRIMARY KEY'
    WHEN 'u' THEN 'UNIQUE'
    WHEN 't' THEN 'TRIGGER'
    WHEN 'x' THEN 'EXCLUSION'
    ELSE contype::text
  END AS constraint_type,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'export_logs'::regclass
ORDER BY contype, conname;

-- QUERY 9: CONSTRAINT SUMMARY
-- ============================================================================
SELECT 
  '9. CONSTRAINT SUMMARY' as verification_section,
  COUNT(*) FILTER (WHERE contype = 'p') AS primary_keys,
  COUNT(*) FILTER (WHERE contype = 'u') AS unique_constraints,
  COUNT(*) FILTER (WHERE contype = 'f') AS foreign_keys,
  COUNT(*) FILTER (WHERE contype = 'c') AS check_constraints,
  COUNT(*) AS total_constraints,
  CASE 
    WHEN COUNT(*) FILTER (WHERE contype = 'p') >= 1 
     AND COUNT(*) FILTER (WHERE contype = 'u') >= 1
     AND COUNT(*) FILTER (WHERE contype = 'f') >= 1
     AND COUNT(*) FILTER (WHERE contype = 'c') >= 2
    THEN '✅ All expected constraint types present'
    ELSE '⚠️  Some constraints may be missing'
  END as status
FROM pg_constraint
WHERE conrelid = 'export_logs'::regclass;

-- QUERY 10: RLS ENABLED CHECK
-- ============================================================================
SELECT 
  '10. RLS STATUS' as verification_section,
  tablename AS table_name, 
  rowsecurity AS rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ RLS is ENABLED'
    ELSE '❌ RLS is DISABLED'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'export_logs';

-- QUERY 11: RLS POLICIES
-- ============================================================================
SELECT 
  '11. RLS POLICIES' as verification_section,
  policyname AS policy_name,
  cmd AS command_type,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Read/View'
    WHEN cmd = 'INSERT' THEN 'Create'
    WHEN cmd = 'UPDATE' THEN 'Modify'
    WHEN cmd = 'DELETE' THEN 'Remove'
    ELSE cmd::text
  END as operation,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'export_logs'
ORDER BY cmd, policyname;

-- QUERY 12: RLS POLICY COUNT SUMMARY
-- ============================================================================
SELECT 
  '12. RLS POLICY SUMMARY' as verification_section,
  COUNT(*) AS actual_policies,
  3 AS expected_policies,
  COUNT(*) FILTER (WHERE cmd = 'SELECT') AS select_policies,
  COUNT(*) FILTER (WHERE cmd = 'INSERT') AS insert_policies,
  COUNT(*) FILTER (WHERE cmd = 'UPDATE') AS update_policies,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ Sufficient policies'
    ELSE '⚠️  Missing ' || (3 - COUNT(*)) || ' policies'
  END as status
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'export_logs';

-- QUERY 13: FOREIGN KEY RELATIONSHIPS
-- ============================================================================
SELECT
  '13. FOREIGN KEYS' as verification_section,
  tc.constraint_name AS constraint_name,
  kcu.column_name AS from_column,
  ccu.table_name AS references_table,
  ccu.column_name AS references_column,
  rc.update_rule AS on_update,
  rc.delete_rule AS on_delete
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'export_logs'
  AND tc.table_schema = 'public';

-- QUERY 14: TABLE STATISTICS
-- ============================================================================
SELECT 
  '14. TABLE DATA' as verification_section,
  COUNT(*) AS total_rows,
  CASE 
    WHEN COUNT(*) = 0 THEN 'Table is empty (expected for new setup)'
    ELSE COUNT(*)::text || ' rows present'
  END as data_status
FROM export_logs;

-- QUERY 15: OVERALL STATUS SUMMARY
-- ============================================================================
WITH 
table_check AS (
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'export_logs'
  ) AS exists
),
column_check AS (
  SELECT COUNT(*) = 14 AS correct
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'export_logs'
),
index_check AS (
  SELECT COUNT(*) >= 5 AS sufficient
  FROM pg_indexes 
  WHERE schemaname = 'public' AND tablename = 'export_logs'
),
rls_check AS (
  SELECT rowsecurity AS enabled
  FROM pg_tables 
  WHERE schemaname = 'public' AND tablename = 'export_logs'
),
policy_check AS (
  SELECT COUNT(*) >= 3 AS sufficient
  FROM pg_policies 
  WHERE schemaname = 'public' AND tablename = 'export_logs'
),
constraint_check AS (
  SELECT 
    COUNT(*) FILTER (WHERE contype = 'p') >= 1 AS has_pk,
    COUNT(*) FILTER (WHERE contype = 'f') >= 1 AS has_fk
  FROM pg_constraint
  WHERE conrelid = 'export_logs'::regclass
)
SELECT 
  '15. 🎯 FINAL ASSESSMENT' as verification_section,
  CASE WHEN t.exists THEN '✅ EXISTS' ELSE '❌ MISSING' END as table_status,
  CASE WHEN c.correct THEN '✅ CORRECT' ELSE '⚠️  ISSUES' END as columns_status,
  CASE WHEN i.sufficient THEN '✅ SUFFICIENT' ELSE '⚠️  MISSING' END as indexes_status,
  CASE WHEN r.enabled THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status,
  CASE WHEN p.sufficient THEN '✅ SUFFICIENT' ELSE '⚠️  MISSING' END as policies_status,
  CASE WHEN con.has_pk AND con.has_fk THEN '✅ PRESENT' ELSE '⚠️  MISSING' END as constraints_status,
  CASE 
    WHEN t.exists AND c.correct AND i.sufficient AND r.enabled AND p.sufficient AND con.has_pk AND con.has_fk
    THEN '🎉 Category 1: FULLY IMPLEMENTED - Ready for E05!'
    WHEN t.exists AND c.correct
    THEN '⚠️  Category 2: Table exists but missing indexes/policies - Can proceed with caution'
    WHEN t.exists
    THEN '⚠️  Category 2: Table exists but needs fixes - Review required'
    ELSE '❌ Category 4: Table missing - Run SQL from E05 execution file'
  END as overall_assessment
FROM table_check t, column_check c, index_check i, rls_check r, policy_check p, constraint_check con;

-- ============================================================================
-- SCRIPT COMPLETE
-- ============================================================================
-- Review the results above. The final query (#15) gives you the overall status.
-- 
-- If everything shows ✅: You're ready to proceed with E05 Prompt 1!
-- If there are ⚠️ or ❌: Check the detailed queries above to see what's missing.
-- ============================================================================
