-- ============================================================================
-- E08 SETTINGS & ADMINISTRATION MODULE - COMPREHENSIVE VERIFICATION SCRIPT
-- ============================================================================
-- This script performs comprehensive checks on all E08 database components
-- Run this in Supabase SQL Editor to get detailed implementation status
-- 
-- NOTE: All results are combined into single queries for visibility in Supabase
-- ============================================================================

-- ============================================================================
-- SECTION 1: TABLE EXISTENCE CHECK
-- ============================================================================
SELECT 
  '1. TABLE EXISTENCE CHECK' as section,
  table_name,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = t.table_name
  ) as exists,
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t.table_name)
    THEN '✅ Table exists'
    ELSE '❌ Table missing - needs SQL migration'
  END as status
FROM (
  VALUES 
    ('user_preferences'),
    ('ai_configurations'),
    ('ai_configuration_audit'),
    ('maintenance_operations'),
    ('configuration_audit_log')
) AS t(table_name)
ORDER BY table_name;

-- ============================================================================
-- SECTION 2: COLUMN COUNT VERIFICATION
-- ============================================================================
SELECT 
  '2. COLUMN COUNT CHECK' as section,
  t.table_name,
  COALESCE(c.actual_columns, 0) as actual_columns,
  t.expected_columns,
  CASE 
    WHEN NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t.table_name)
    THEN '❌ Table missing'
    WHEN COALESCE(c.actual_columns, 0) = t.expected_columns 
    THEN '✅ Column count matches'
    WHEN COALESCE(c.actual_columns, 0) > t.expected_columns
    THEN '⚠️ Extra columns found'
    ELSE '⚠️ Missing columns'
  END as status
FROM (
  VALUES 
    ('user_preferences', 5),
    ('ai_configurations', 10),
    ('ai_configuration_audit', 8),
    ('maintenance_operations', 12),
    ('configuration_audit_log', 10)
) AS t(table_name, expected_columns)
LEFT JOIN (
  SELECT 
    table_name,
    COUNT(*) as actual_columns
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name IN ('user_preferences', 'ai_configurations', 'ai_configuration_audit', 'maintenance_operations', 'configuration_audit_log')
  GROUP BY table_name
) c ON t.table_name = c.table_name
ORDER BY t.table_name;

-- ============================================================================
-- SECTION 3: DETAILED COLUMN LIST FOR EACH TABLE
-- ============================================================================
SELECT 
  '3. DETAILED COLUMNS' as section,
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('user_preferences', 'ai_configurations', 'ai_configuration_audit', 'maintenance_operations', 'configuration_audit_log')
ORDER BY table_name, ordinal_position;

-- ============================================================================
-- SECTION 4: INDEX VERIFICATION
-- ============================================================================
SELECT 
  '4. INDEX COUNT CHECK' as section,
  t.table_name,
  COALESCE(i.actual_indexes, 0) as actual_indexes,
  t.expected_indexes,
  CASE 
    WHEN NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t.table_name)
    THEN '❌ Table missing'
    WHEN COALESCE(i.actual_indexes, 0) >= t.expected_indexes 
    THEN '✅ Has minimum indexes'
    ELSE '⚠️ Missing indexes'
  END as status
FROM (
  VALUES 
    ('user_preferences', 3),
    ('ai_configurations', 5),
    ('ai_configuration_audit', 4),
    ('maintenance_operations', 5),
    ('configuration_audit_log', 6)
) AS t(table_name, expected_indexes)
LEFT JOIN (
  SELECT 
    tablename as table_name,
    COUNT(*) as actual_indexes
  FROM pg_indexes
  WHERE schemaname = 'public' 
    AND tablename IN ('user_preferences', 'ai_configurations', 'ai_configuration_audit', 'maintenance_operations', 'configuration_audit_log')
  GROUP BY tablename
) i ON t.table_name = i.table_name
ORDER BY t.table_name;

-- ============================================================================
-- SECTION 5: DETAILED INDEX LIST
-- ============================================================================
SELECT 
  '5. DETAILED INDEXES' as section,
  tablename as table_name,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename IN ('user_preferences', 'ai_configurations', 'ai_configuration_audit', 'maintenance_operations', 'configuration_audit_log')
ORDER BY tablename, indexname;

-- ============================================================================
-- SECTION 6: CONSTRAINT VERIFICATION
-- ============================================================================
SELECT 
  '6. CONSTRAINTS' as section,
  cl.relname as table_name,
  c.conname as constraint_name,
  CASE c.contype
    WHEN 'p' THEN 'PRIMARY KEY'
    WHEN 'f' THEN 'FOREIGN KEY'
    WHEN 'u' THEN 'UNIQUE'
    WHEN 'c' THEN 'CHECK'
    ELSE c.contype::text
  END as constraint_type,
  pg_get_constraintdef(c.oid) as definition
FROM pg_constraint c
JOIN pg_class cl ON c.conrelid = cl.oid
JOIN pg_namespace n ON cl.relnamespace = n.oid
WHERE n.nspname = 'public' 
  AND cl.relname IN ('user_preferences', 'ai_configurations', 'ai_configuration_audit', 'maintenance_operations', 'configuration_audit_log')
ORDER BY cl.relname, c.conname;

-- ============================================================================
-- SECTION 7: TRIGGER VERIFICATION
-- ============================================================================
SELECT 
  '7. TRIGGER COUNT CHECK' as section,
  t.table_name,
  COALESCE(tr.actual_triggers, 0) as actual_triggers,
  t.expected_triggers,
  CASE 
    WHEN NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t.table_name)
    THEN '❌ Table missing'
    WHEN COALESCE(tr.actual_triggers, 0) = t.expected_triggers 
    THEN '✅ All triggers present'
    WHEN t.expected_triggers = 0 AND COALESCE(tr.actual_triggers, 0) = 0
    THEN '✅ Correct - no triggers needed'
    ELSE '⚠️ Trigger count mismatch'
  END as status
FROM (
  VALUES 
    ('user_preferences', 2),
    ('ai_configurations', 2),
    ('ai_configuration_audit', 0),
    ('maintenance_operations', 0),
    ('configuration_audit_log', 1)
) AS t(table_name, expected_triggers)
LEFT JOIN (
  SELECT 
    cl.relname as table_name,
    COUNT(*) as actual_triggers
  FROM pg_trigger tg
  JOIN pg_class cl ON tg.tgrelid = cl.oid
  JOIN pg_namespace n ON cl.relnamespace = n.oid
  WHERE n.nspname = 'public' 
    AND cl.relname IN ('user_preferences', 'ai_configurations', 'ai_configuration_audit', 'maintenance_operations', 'configuration_audit_log')
    AND tg.tgname NOT LIKE 'RI_%'
  GROUP BY cl.relname
) tr ON t.table_name = tr.table_name
ORDER BY t.table_name;

-- ============================================================================
-- SECTION 8: DETAILED TRIGGER LIST
-- ============================================================================
SELECT 
  '8. DETAILED TRIGGERS' as section,
  cl.relname as table_name,
  tg.tgname as trigger_name,
  CASE 
    WHEN tg.tgtype::int & 2 = 2 THEN 'BEFORE'
    WHEN tg.tgtype::int & 64 = 64 THEN 'INSTEAD OF'
    ELSE 'AFTER'
  END as timing,
  CASE 
    WHEN tg.tgtype::int & 4 = 4 THEN 'INSERT'
    WHEN tg.tgtype::int & 8 = 8 THEN 'DELETE'
    WHEN tg.tgtype::int & 16 = 16 THEN 'UPDATE'
    ELSE 'OTHER'
  END as event,
  tg.tgenabled as is_enabled
FROM pg_trigger tg
JOIN pg_class cl ON tg.tgrelid = cl.oid
JOIN pg_namespace n ON cl.relnamespace = n.oid
WHERE n.nspname = 'public' 
  AND cl.relname IN ('user_preferences', 'ai_configurations', 'ai_configuration_audit', 'maintenance_operations', 'configuration_audit_log')
  AND tg.tgname NOT LIKE 'RI_%'
ORDER BY cl.relname, tg.tgname;

-- ============================================================================
-- SECTION 9: RLS (ROW LEVEL SECURITY) STATUS
-- ============================================================================
SELECT 
  '9. RLS ENABLED CHECK' as section,
  tablename as table_name,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ RLS enabled'
    ELSE '⚠️ RLS not enabled'
  END as status
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('user_preferences', 'ai_configurations', 'ai_configuration_audit', 'maintenance_operations', 'configuration_audit_log')
ORDER BY tablename;

-- ============================================================================
-- SECTION 10: RLS POLICY VERIFICATION
-- ============================================================================
SELECT 
  '10. RLS POLICY COUNT CHECK' as section,
  t.table_name,
  COALESCE(p.actual_policies, 0) as actual_policies,
  t.expected_policies,
  CASE 
    WHEN NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t.table_name)
    THEN '❌ Table missing'
    WHEN COALESCE(p.actual_policies, 0) = t.expected_policies 
    THEN '✅ All policies present'
    WHEN COALESCE(p.actual_policies, 0) > t.expected_policies 
    THEN '⚠️ Extra policies found'
    ELSE '⚠️ Policy count mismatch'
  END as status
FROM (
  VALUES 
    ('user_preferences', 3),
    ('ai_configurations', 4),
    ('ai_configuration_audit', 1),
    ('maintenance_operations', 2),
    ('configuration_audit_log', 3)
) AS t(table_name, expected_policies)
LEFT JOIN (
  SELECT 
    tablename as table_name,
    COUNT(*) as actual_policies
  FROM pg_policies
  WHERE schemaname = 'public' 
    AND tablename IN ('user_preferences', 'ai_configurations', 'ai_configuration_audit', 'maintenance_operations', 'configuration_audit_log')
  GROUP BY tablename
) p ON t.table_name = p.table_name
ORDER BY t.table_name;

-- ============================================================================
-- SECTION 11: DETAILED RLS POLICIES
-- ============================================================================
SELECT 
  '11. DETAILED RLS POLICIES' as section,
  tablename as table_name,
  policyname as policy_name,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('user_preferences', 'ai_configurations', 'ai_configuration_audit', 'maintenance_operations', 'configuration_audit_log')
ORDER BY tablename, policyname;

-- ============================================================================
-- SECTION 12: DATABASE FUNCTION VERIFICATION
-- ============================================================================
SELECT 
  '12. DATABASE FUNCTIONS CHECK' as section,
  f.function_name,
  EXISTS (SELECT FROM pg_proc WHERE proname = f.function_name) as exists,
  CASE 
    WHEN EXISTS (SELECT FROM pg_proc WHERE proname = f.function_name)
    THEN '✅ Function exists'
    ELSE '❌ Function missing'
  END as status,
  f.description
FROM (
  VALUES 
    ('update_updated_at_column', 'Updates updated_at timestamp on row update'),
    ('initialize_user_preferences', 'Creates default preferences for new users'),
    ('log_ai_config_changes', 'Logs AI configuration changes to audit table'),
    ('get_effective_ai_config', 'Gets effective AI config with fallback chain'),
    ('log_user_preferences_changes', 'Logs user preference changes to audit log')
) AS f(function_name, description)
ORDER BY function_name;

-- ============================================================================
-- SECTION 13: OVERALL IMPLEMENTATION STATUS
-- ============================================================================
SELECT 
  '13. OVERALL STATUS SUMMARY' as section,
  component,
  actual,
  expected,
  status
FROM (
  SELECT 
    1 as sort_order,
    'TABLES' as component,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_schema = 'public' 
     AND table_name IN ('user_preferences', 'ai_configurations', 'ai_configuration_audit', 'maintenance_operations', 'configuration_audit_log')
    ) as actual,
    5 as expected,
    CASE 
      WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('user_preferences', 'ai_configurations', 'ai_configuration_audit', 'maintenance_operations', 'configuration_audit_log')) = 5
      THEN '✅ All tables exist'
      WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('user_preferences', 'ai_configurations', 'ai_configuration_audit', 'maintenance_operations', 'configuration_audit_log')) = 0
      THEN '❌ No tables exist'
      ELSE '⚠️ Some tables missing'
    END as status
  
  UNION ALL
  
  SELECT 
    2,
    'FUNCTIONS',
    (SELECT COUNT(*) FROM pg_proc 
     WHERE proname IN ('update_updated_at_column', 'initialize_user_preferences', 'log_ai_config_changes', 'get_effective_ai_config', 'log_user_preferences_changes')
    ),
    5,
    CASE
      WHEN (SELECT COUNT(*) FROM pg_proc WHERE proname IN ('update_updated_at_column', 'initialize_user_preferences', 'log_ai_config_changes', 'get_effective_ai_config', 'log_user_preferences_changes')) = 5
      THEN '✅ All functions exist'
      WHEN (SELECT COUNT(*) FROM pg_proc WHERE proname IN ('update_updated_at_column', 'initialize_user_preferences', 'log_ai_config_changes', 'get_effective_ai_config', 'log_user_preferences_changes')) = 0
      THEN '❌ No functions exist'
      ELSE '⚠️ Some functions missing'
    END
  
  UNION ALL
  
  SELECT 
    3,
    'RLS ENABLED',
    (SELECT COUNT(*) FROM pg_tables 
     WHERE schemaname = 'public' 
     AND tablename IN ('user_preferences', 'ai_configurations', 'ai_configuration_audit', 'maintenance_operations', 'configuration_audit_log')
     AND rowsecurity = true
    ),
    5,
    CASE
      WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('user_preferences', 'ai_configurations', 'ai_configuration_audit', 'maintenance_operations', 'configuration_audit_log') AND rowsecurity = true) = 5
      THEN '✅ RLS enabled on all tables'
      WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('user_preferences', 'ai_configurations', 'ai_configuration_audit', 'maintenance_operations', 'configuration_audit_log') AND rowsecurity = true) = 0
      THEN '⚠️ RLS not enabled'
      ELSE '⚠️ RLS partially enabled'
    END
) summary
ORDER BY sort_order;

-- ============================================================================
-- SECTION 14: FINAL CATEGORIZATION
-- ============================================================================
WITH table_status AS (
  SELECT 
    'user_preferences' as table_name,
    5 as expected_columns,
    2 as expected_triggers,
    EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences') as exists,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_preferences') as column_count,
    COALESCE((SELECT COUNT(*) FROM pg_trigger t 
      JOIN pg_class cl ON t.tgrelid = cl.oid 
      JOIN pg_namespace n ON cl.relnamespace = n.oid 
      WHERE n.nspname = 'public' AND cl.relname = 'user_preferences' AND t.tgname NOT LIKE 'RI_%'), 0) as trigger_count
  UNION ALL
  SELECT 
    'ai_configurations',
    10,
    2,
    EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_configurations'),
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ai_configurations'),
    COALESCE((SELECT COUNT(*) FROM pg_trigger t 
      JOIN pg_class cl ON t.tgrelid = cl.oid 
      JOIN pg_namespace n ON cl.relnamespace = n.oid 
      WHERE n.nspname = 'public' AND cl.relname = 'ai_configurations' AND t.tgname NOT LIKE 'RI_%'), 0)
  UNION ALL
  SELECT 
    'ai_configuration_audit',
    8,
    0,
    EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_configuration_audit'),
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ai_configuration_audit'),
    COALESCE((SELECT COUNT(*) FROM pg_trigger t 
      JOIN pg_class cl ON t.tgrelid = cl.oid 
      JOIN pg_namespace n ON cl.relnamespace = n.oid 
      WHERE n.nspname = 'public' AND cl.relname = 'ai_configuration_audit' AND t.tgname NOT LIKE 'RI_%'), 0)
  UNION ALL
  SELECT 
    'maintenance_operations',
    12,
    0,
    EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'maintenance_operations'),
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'maintenance_operations'),
    COALESCE((SELECT COUNT(*) FROM pg_trigger t 
      JOIN pg_class cl ON t.tgrelid = cl.oid 
      JOIN pg_namespace n ON cl.relnamespace = n.oid 
      WHERE n.nspname = 'public' AND cl.relname = 'maintenance_operations' AND t.tgname NOT LIKE 'RI_%'), 0)
  UNION ALL
  SELECT 
    'configuration_audit_log',
    10,
    1,
    EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'configuration_audit_log'),
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'configuration_audit_log'),
    COALESCE((SELECT COUNT(*) FROM pg_trigger t 
      JOIN pg_class cl ON t.tgrelid = cl.oid 
      JOIN pg_namespace n ON cl.relnamespace = n.oid 
      WHERE n.nspname = 'public' AND cl.relname = 'configuration_audit_log' AND t.tgname NOT LIKE 'RI_%'), 0)
)
SELECT 
  '14. 🎯 FINAL CATEGORIZATION' as section,
  table_name,
  exists as table_exists,
  column_count,
  expected_columns,
  trigger_count,
  expected_triggers,
  CASE
    WHEN NOT exists THEN 4  -- Category 4: Table doesn't exist at all
    WHEN column_count = expected_columns AND trigger_count = expected_triggers THEN 1  -- Category 1: Fully implemented
    WHEN column_count != expected_columns OR trigger_count != expected_triggers THEN 2  -- Category 2: Exists but needs fields/triggers
    ELSE 2  -- Default to Category 2 for manual verification
  END as category,
  CASE
    WHEN NOT exists THEN '❌ CATEGORY 4: Table does not exist - needs SQL migration'
    WHEN column_count = expected_columns AND trigger_count = expected_triggers THEN '✅ CATEGORY 1: Fully implemented as described'
    WHEN column_count != expected_columns THEN '⚠️ CATEGORY 2: Missing or extra columns'
    WHEN trigger_count != expected_triggers THEN '⚠️ CATEGORY 2: Missing or extra triggers'
    ELSE '⚠️ CATEGORY 2: Needs manual verification'
  END as category_description
FROM table_status
ORDER BY category DESC, table_name;

-- ============================================================================
-- VERIFICATION COMPLETE
-- ============================================================================
SELECT 
  '✅ E08 VERIFICATION COMPLETE' as final_status,
  'Review all sections above for detailed implementation status' as instructions,
  'Look at Section 14 for final categorization (Category 1-4)' as key_section;
