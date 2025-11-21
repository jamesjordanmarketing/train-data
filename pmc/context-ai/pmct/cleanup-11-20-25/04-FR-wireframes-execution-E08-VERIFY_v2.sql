-- ============================================================================
-- E08 SETTINGS & ADMINISTRATION MODULE - COMPREHENSIVE VERIFICATION SCRIPT V2
-- ============================================================================
-- This script performs comprehensive checks on all E08 database components
-- FIXED: Now shows ALL verification results in a single comprehensive output
-- Run this in Supabase SQL Editor to get complete implementation status
-- ============================================================================

WITH 
-- Define expected E08 tables and their specifications
expected_tables AS (
  SELECT * FROM (VALUES 
    ('user_preferences', 5, 0, 'User preference settings'),
    ('ai_configurations', 10, 0, 'AI model configurations'),
    ('ai_configuration_audit', 8, 0, 'AI config change audit trail'),
    ('maintenance_operations', 12, 0, 'System maintenance operations'),
    ('configuration_audit_log', 10, 1, 'Configuration change audit log')
  ) AS t(table_name, expected_columns, expected_triggers, description)
),

-- Check table existence
table_existence AS (
  SELECT 
    et.table_name,
    et.description,
    et.expected_columns,
    et.expected_triggers,
    EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = et.table_name
    ) as table_exists
  FROM expected_tables et
),

-- Get actual column counts
actual_columns AS (
  SELECT 
    table_name,
    COUNT(*) as column_count
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name IN (SELECT table_name FROM expected_tables)
  GROUP BY table_name
),

-- Get actual trigger counts
actual_triggers AS (
  SELECT 
    cl.relname as table_name,
    COUNT(*) as trigger_count
  FROM pg_trigger t 
  JOIN pg_class cl ON t.tgrelid = cl.oid 
  JOIN pg_namespace n ON cl.relnamespace = n.oid 
  WHERE n.nspname = 'public' 
    AND cl.relname IN (SELECT table_name FROM expected_tables)
    AND t.tgname NOT LIKE 'RI_%'  -- Exclude system triggers
  GROUP BY cl.relname
),

-- Get detailed column information
column_details AS (
  SELECT 
    table_name,
    STRING_AGG(
      column_name || ' (' || data_type || 
      CASE WHEN is_nullable = 'NO' THEN ', NOT NULL' ELSE '' END || ')',
      ', ' ORDER BY ordinal_position
    ) as columns_list
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name IN (SELECT table_name FROM expected_tables)
  GROUP BY table_name
),

-- Get index information
table_indexes AS (
  SELECT 
    t.relname as table_name,
    COUNT(*) as index_count,
    STRING_AGG(i.relname, ', ') as indexes_list
  FROM pg_class t
  JOIN pg_index ix ON t.oid = ix.indrelid
  JOIN pg_class i ON i.oid = ix.indexrelid
  JOIN pg_namespace n ON t.relnamespace = n.oid
  WHERE n.nspname = 'public'
    AND t.relname IN (SELECT table_name FROM expected_tables)
    AND NOT ix.indisprimary  -- Exclude primary key indexes
  GROUP BY t.relname
),

-- Get RLS policy information
rls_policies AS (
  SELECT 
    tablename as table_name,
    COUNT(*) as policy_count,
    STRING_AGG(policyname, ', ') as policies_list
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN (SELECT table_name FROM expected_tables)
  GROUP BY tablename
),

-- Get constraint information
table_constraints AS (
  SELECT 
    tc.table_name,
    COUNT(*) as constraint_count,
    STRING_AGG(tc.constraint_name || ' (' || tc.constraint_type || ')', ', ') as constraints_list
  FROM information_schema.table_constraints tc
  WHERE tc.table_schema = 'public'
    AND tc.table_name IN (SELECT table_name FROM expected_tables)
    AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE', 'CHECK')
  GROUP BY tc.table_name
),

-- Combine all information
comprehensive_status AS (
  SELECT 
    te.table_name,
    te.description,
    te.table_exists,
    te.expected_columns,
    COALESCE(ac.column_count, 0) as actual_columns,
    te.expected_triggers,
    COALESCE(at.trigger_count, 0) as actual_triggers,
    COALESCE(ti.index_count, 0) as index_count,
    COALESCE(rls.policy_count, 0) as rls_policy_count,
    COALESCE(tcon.constraint_count, 0) as constraint_count,
    cd.columns_list,
    ti.indexes_list,
    rls.policies_list,
    tcon.constraints_list,
    -- Categorization logic
    CASE
      WHEN NOT te.table_exists THEN 4  -- Category 4: Table doesn't exist
      WHEN te.table_exists AND 
           COALESCE(ac.column_count, 0) = te.expected_columns AND 
           COALESCE(at.trigger_count, 0) = te.expected_triggers THEN 1  -- Category 1: Fully implemented
      WHEN te.table_exists AND 
           (COALESCE(ac.column_count, 0) != te.expected_columns OR 
            COALESCE(at.trigger_count, 0) != te.expected_triggers) THEN 2  -- Category 2: Needs changes
      ELSE 3  -- Category 3: Potential conflicts (shouldn't happen in this case)
    END as category
  FROM table_existence te
  LEFT JOIN actual_columns ac ON te.table_name = ac.table_name
  LEFT JOIN actual_triggers at ON te.table_name = at.table_name
  LEFT JOIN column_details cd ON te.table_name = cd.table_name
  LEFT JOIN table_indexes ti ON te.table_name = ti.table_name
  LEFT JOIN rls_policies rls ON te.table_name = rls.table_name
  LEFT JOIN table_constraints tcon ON te.table_name = tcon.table_name
)

-- FINAL COMPREHENSIVE OUTPUT - ALL VERIFICATION RESULTS
SELECT 
  '🎯 E08 COMPREHENSIVE VERIFICATION RESULTS' as verification_section,
  table_name,
  description,
  
  -- Existence Status
  CASE WHEN table_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END as table_status,
  
  -- Column Status
  actual_columns || '/' || expected_columns as columns_actual_vs_expected,
  CASE 
    WHEN NOT table_exists THEN '❌ N/A - Table Missing'
    WHEN actual_columns = expected_columns THEN '✅ Correct Count'
    WHEN actual_columns > expected_columns THEN '⚠️ Extra Columns'
    ELSE '⚠️ Missing Columns'
  END as column_status,
  
  -- Trigger Status
  actual_triggers || '/' || expected_triggers as triggers_actual_vs_expected,
  CASE 
    WHEN NOT table_exists THEN '❌ N/A - Table Missing'
    WHEN actual_triggers = expected_triggers THEN '✅ Correct Count'
    WHEN actual_triggers > expected_triggers THEN '⚠️ Extra Triggers'
    ELSE '⚠️ Missing Triggers'
  END as trigger_status,
  
  -- Additional Info
  COALESCE(index_count, 0) as indexes,
  COALESCE(rls_policy_count, 0) as rls_policies,
  COALESCE(constraint_count, 0) as constraints,
  
  -- Final Category
  category as final_category,
  CASE
    WHEN category = 1 THEN '✅ CATEGORY 1: Fully Implemented'
    WHEN category = 2 THEN '⚠️ CATEGORY 2: Needs Additional Fields/Triggers'
    WHEN category = 3 THEN '🔄 CATEGORY 3: Potential Conflicts'
    WHEN category = 4 THEN '❌ CATEGORY 4: Table Missing'
    ELSE '❓ Unknown Status'
  END as category_description,
  
  -- Detailed Information
  COALESCE(columns_list, 'No columns found') as detailed_columns,
  COALESCE(indexes_list, 'No indexes') as detailed_indexes,
  COALESCE(policies_list, 'No RLS policies') as detailed_rls_policies,
  COALESCE(constraints_list, 'No constraints') as detailed_constraints

FROM comprehensive_status
ORDER BY category DESC, table_name;

-- Add summary statistics at the end
-- This will appear as additional rows in the same result set
UNION ALL

SELECT 
  '📊 SUMMARY STATISTICS' as verification_section,
  'TOTALS' as table_name,
  'Overall E08 Implementation Status' as description,
  
  -- Summary counts
  (SELECT COUNT(*) FROM comprehensive_status WHERE table_exists)::text || '/' || 
  (SELECT COUNT(*) FROM comprehensive_status)::text as table_status,
  
  'Cat1: ' || (SELECT COUNT(*) FROM comprehensive_status WHERE category = 1)::text as columns_actual_vs_expected,
  'Cat2: ' || (SELECT COUNT(*) FROM comprehensive_status WHERE category = 2)::text as column_status,
  'Cat3: ' || (SELECT COUNT(*) FROM comprehensive_status WHERE category = 3)::text as triggers_actual_vs_expected,
  'Cat4: ' || (SELECT COUNT(*) FROM comprehensive_status WHERE category = 4)::text as trigger_status,
  
  (SELECT SUM(COALESCE(index_count, 0)) FROM comprehensive_status)::int as indexes,
  (SELECT SUM(COALESCE(rls_policy_count, 0)) FROM comprehensive_status)::int as rls_policies,
  (SELECT SUM(COALESCE(constraint_count, 0)) FROM comprehensive_status)::int as constraints,
  
  0 as final_category,
  CASE 
    WHEN (SELECT COUNT(*) FROM comprehensive_status WHERE category = 4) > 0 
    THEN '❌ CRITICAL: Missing Tables Found'
    WHEN (SELECT COUNT(*) FROM comprehensive_status WHERE category = 2) > 0 
    THEN '⚠️ WARNING: Tables Need Updates'
    WHEN (SELECT COUNT(*) FROM comprehensive_status WHERE category = 1) = (SELECT COUNT(*) FROM comprehensive_status)
    THEN '✅ SUCCESS: All Tables Fully Implemented'
    ELSE '❓ MIXED: Review Individual Table Status'
  END as category_description,
  
  'Review individual table rows above for detailed status' as detailed_columns,
  'Total tables analyzed: ' || (SELECT COUNT(*) FROM comprehensive_status)::text as detailed_indexes,
  'Run individual table queries for more details if needed' as detailed_rls_policies,
  'E08 verification complete - check category_description for next steps' as detailed_constraints;