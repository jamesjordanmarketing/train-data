# Database Normalization & Schema Completion - E10 Execution Specification

**Generated**: 2025-11-02
**Purpose**: Database Normalization and Schema Completion for E01-E09 Modules
**Execution Segment**: E10 - Database Foundation Completion
**Total Prompts**: 8 (modular, can be executed independently)
**Estimated Implementation Time**: 40-60 hours
**Prerequisites**: Supabase access, E01-E09 execution files available

---

## 🎯 Executive Summary

This E10 specification provides a comprehensive database normalization plan to complete the implementation of execution segments E01-E09. Through extensive database auditing (November 2, 2025), we discovered that **all 25 expected tables exist in Supabase**, but most are empty or have incomplete schemas compared to their specifications in E01-E09.

### Critical Findings from Database Audit

**Database State Discovery:**
- ✅ **25 tables exist** (contrary to initial cursor-db-helper findings)
- ⚠️ **17 tables are empty** (0 rows, schema not verifiable via SELECT)
- ⚠️ **6 tables have RLS blocking** (user_preferences, ai_configurations, ai_configuration_audit, batch_items, configuration_audit_log)
- ✅ **8 tables have data** and verifiable schemas (chunks: 177 rows, documents: 12 rows, etc.)

**Tables Inventory:**

| Table | Rows | Columns | Status |
|-------|------|---------|--------|
| conversations | 0 | ? | Empty - needs schema verification |
| conversation_turns | 0 | ? | Empty - needs schema verification |
| chunks | 177 | 16 | ✅ Verified |
| scenarios | 0 | ? | Empty - needs schema verification |
| templates | 5 | 27 | ✅ Verified - matches E07 spec |
| edge_cases | 0 | ? | Empty - needs schema verification |
| documents | 12 | 21 | ✅ Verified |
| categories | 10 | 9 | ✅ Verified |
| tags | 43 | 9 | ✅ Verified |
| workflow_sessions | 165 | 13 | ✅ Verified |
| document_categories | 10 | 9 | ✅ Verified |
| document_tags | 34 | 10 | ✅ Verified |
| custom_tags | 0 | ? | Empty |
| tag_dimensions | 7 | 8 | ✅ Verified |
| batch_jobs | 0 | ? | Empty |
| batch_items | ? | ? | RLS blocking access |
| generation_logs | 0 | ? | Empty |
| export_logs | 0 | ? | Empty |
| prompt_templates | 6 | 12 | ✅ Has data - but E02 audit says wrong schema |
| template_analytics | 0 | ? | Empty |
| user_preferences | ? | ? | RLS blocking access |
| ai_configurations | ? | ? | RLS blocking access |
| ai_configuration_audit | ? | ? | RLS blocking access |
| maintenance_operations | 0 | ? | Empty |
| configuration_audit_log | ? | ? | RLS blocking access |

### Strategic Approach for E10

**Instead of rebuilding**, this E10 specification will:
1. **VERIFY** actual schemas of all 25 tables using SQL information_schema queries
2. **COMPARE** actual schemas against E01-E09 specifications
3. **NORMALIZE** database by adding missing columns, indexes, triggers, RLS policies
4. **VALIDATE** ENUMs, constraints, and foreign keys
5. **COMPLETE** any missing helper functions and views

**Why This Approach:**
- Tables already exist - no need to DROP/CREATE
- Preserves existing data (chunks: 177 rows, documents: 12 rows, templates: 5 rows, etc.)
- Incremental, low-risk schema updates via ALTER TABLE
- Can be executed module-by-module (E02, E03, E04, etc.)
- Validates rather than assumes audit reports are correct

---

## 📋 Table of Contents

1. [Prompt 1: Complete Database Schema Audit](#prompt-1-complete-database-schema-audit)
2. [Prompt 2: E02 Tables Normalization (AI Integration & Generation)](#prompt-2-e02-tables-normalization)
3. [Prompt 3: E03 Tables Normalization (Conversation Management)](#prompt-3-e03-tables-normalization)
4. [Prompt 4: E04 Tables Normalization (Batch Generation)](#prompt-4-e04-tables-normalization)
5. [Prompt 5: E05 Tables Normalization (Export System)](#prompt-5-e05-tables-normalization)
6. [Prompt 6: E06-E07 Tables Normalization (Review Queue & Templates)](#prompt-6-e06-e07-tables-normalization)
7. [Prompt 7: E08 Tables Normalization (Settings & Administration)](#prompt-7-e08-tables-normalization)
8. [Prompt 8: E09 Integration & Final Validation](#prompt-8-e09-integration-final-validation)

---

## Prompt 1: Complete Database Schema Audit

**Objective**: Get complete, authoritative schema information for all 25 tables using SQL information_schema queries, bypassing RLS limitations.

**Context**: Previous audit attempts via Supabase JavaScript client failed for empty tables (returns 0 columns) and RLS-protected tables (returns undefined). We need SQL-based schema introspection.

**Task**: Create and execute SQL queries to audit the complete database schema.

### SQL Script to Execute in Supabase SQL Editor

```sql
-- ============================================================================
-- E10 PROMPT 1: COMPREHENSIVE DATABASE SCHEMA AUDIT
-- ============================================================================
-- Purpose: Get authoritative schema information for all 25 tables
-- Execution: Copy and paste this entire script into Supabase SQL Editor
-- ============================================================================

-- Section 1: Table Existence Check
-- ============================================================================
SELECT
  '1️⃣ TABLE EXISTENCE CHECK' as section,
  COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

SELECT
  table_name,
  CASE
    WHEN table_name IN ('conversations', 'conversation_turns', 'chunks', 'scenarios', 'templates',
                        'edge_cases', 'documents', 'categories', 'tags', 'workflow_sessions',
                        'document_categories', 'document_tags', 'custom_tags', 'tag_dimensions',
                        'batch_jobs', 'batch_items', 'generation_logs', 'export_logs',
                        'prompt_templates', 'template_analytics', 'user_preferences',
                        'ai_configurations', 'ai_configuration_audit', 'maintenance_operations',
                        'configuration_audit_log')
    THEN '✅ Expected'
    ELSE '⚠️  Unexpected'
  END as table_status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Section 2: Column Inventory for All Tables
-- ============================================================================
-- Get complete column information for all 25 expected tables

\echo '2️⃣ COLUMN SCHEMAS'

-- conversations
SELECT
  'conversations' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'conversations'
ORDER BY ordinal_position;

-- conversation_turns
SELECT
  'conversation_turns' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'conversation_turns'
ORDER BY ordinal_position;

-- chunks (already verified, but include for completeness)
SELECT
  'chunks' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'chunks';

-- scenarios
SELECT
  'scenarios' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'scenarios'
ORDER BY ordinal_position;

-- templates
SELECT
  'templates' as table_name,
  COUNT(*) as column_count,
  string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'templates';

-- edge_cases
SELECT
  'edge_cases' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'edge_cases'
ORDER BY ordinal_position;

-- batch_jobs
SELECT
  'batch_jobs' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'batch_jobs'
ORDER BY ordinal_position;

-- batch_items
SELECT
  'batch_items' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'batch_items'
ORDER BY ordinal_position;

-- generation_logs
SELECT
  'generation_logs' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'generation_logs'
ORDER BY ordinal_position;

-- export_logs
SELECT
  'export_logs' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'export_logs'
ORDER BY ordinal_position;

-- prompt_templates
SELECT
  'prompt_templates' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'prompt_templates'
ORDER BY ordinal_position;

-- template_analytics
SELECT
  'template_analytics' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'template_analytics'
ORDER BY ordinal_position;

-- user_preferences
SELECT
  'user_preferences' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_preferences'
ORDER BY ordinal_position;

-- ai_configurations
SELECT
  'ai_configurations' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'ai_configurations'
ORDER BY ordinal_position;

-- ai_configuration_audit
SELECT
  'ai_configuration_audit' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'ai_configuration_audit'
ORDER BY ordinal_position;

-- maintenance_operations
SELECT
  'maintenance_operations' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'maintenance_operations'
ORDER BY ordinal_position;

-- configuration_audit_log
SELECT
  'configuration_audit_log' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'configuration_audit_log'
ORDER BY ordinal_position;

-- Section 3: Index Inventory
-- ============================================================================
\echo '3️⃣ INDEX INVENTORY'

SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('conversations', 'conversation_turns', 'batch_jobs', 'batch_items',
                     'generation_logs', 'export_logs', 'prompt_templates', 'template_analytics',
                     'scenarios', 'templates', 'edge_cases',
                     'user_preferences', 'ai_configurations', 'ai_configuration_audit',
                     'maintenance_operations', 'configuration_audit_log')
ORDER BY tablename, indexname;

-- Section 4: Constraint Inventory
-- ============================================================================
\echo '4️⃣ CONSTRAINT INVENTORY'

SELECT
  conrelid::regclass AS table_name,
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
  AND conrelid::regclass::text IN ('conversations', 'conversation_turns', 'batch_jobs', 'batch_items',
                                    'generation_logs', 'export_logs', 'prompt_templates', 'template_analytics',
                                    'scenarios', 'templates', 'edge_cases',
                                    'user_preferences', 'ai_configurations', 'ai_configuration_audit',
                                    'maintenance_operations', 'configuration_audit_log')
ORDER BY table_name, constraint_type, constraint_name;

-- Section 5: ENUM Types
-- ============================================================================
\echo '5️⃣ ENUM TYPES'

SELECT
  t.typname as enum_name,
  string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('conversation_status', 'tier_type', 'batch_job_status', 'batch_item_status',
                     'export_status', 'export_format')
GROUP BY t.typname
ORDER BY t.typname;

-- Section 6: Trigger Inventory
-- ============================================================================
\echo '6️⃣ TRIGGER INVENTORY'

SELECT
  event_object_table AS table_name,
  trigger_name,
  event_manipulation AS event,
  action_timing AS timing,
  action_statement AS action
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('conversations', 'conversation_turns', 'batch_jobs', 'batch_items',
                               'generation_logs', 'export_logs', 'prompt_templates', 'template_analytics',
                               'scenarios', 'templates', 'edge_cases',
                               'user_preferences', 'ai_configurations', 'ai_configuration_audit',
                               'maintenance_operations', 'configuration_audit_log')
ORDER BY table_name, trigger_name;

-- Section 7: Function Inventory
-- ============================================================================
\echo '7️⃣ FUNCTION INVENTORY'

SELECT
  routine_name,
  routine_type,
  data_type AS return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'update_updated_at_column',
    'append_review_action',
    'calculate_batch_progress',
    'estimate_time_remaining',
    'initialize_user_preferences',
    'log_ai_config_changes',
    'get_effective_ai_config',
    'log_user_preferences_changes',
    'get_template_scenario_count',
    'get_scenario_edge_case_count',
    'safe_delete_template',
    'safe_delete_scenario',
    'get_conversations_by_chunk'
  )
ORDER BY routine_name;

-- Section 8: RLS Policy Inventory
-- ============================================================================
\echo '8️⃣ RLS POLICY INVENTORY'

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
  AND tablename IN ('conversations', 'conversation_turns', 'batch_jobs', 'batch_items',
                     'generation_logs', 'export_logs', 'prompt_templates', 'template_analytics',
                     'scenarios', 'templates', 'edge_cases',
                     'user_preferences', 'ai_configurations', 'ai_configuration_audit',
                     'maintenance_operations', 'configuration_audit_log')
ORDER BY tablename, policyname;

-- Section 9: View Inventory
-- ============================================================================
\echo '9️⃣ VIEW INVENTORY'

SELECT
  table_name as view_name,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN ('review_queue_stats', 'orphaned_conversations')
ORDER BY table_name;

-- Section 10: Summary Statistics
-- ============================================================================
\echo '🔟 SUMMARY STATISTICS'

SELECT
  '📊 Database Summary' as report_section,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tables,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indexes,
  (SELECT COUNT(*) FROM pg_constraint WHERE connamespace = 'public'::regnamespace) as total_constraints,
  (SELECT COUNT(*) FROM pg_trigger WHERE tgrelid IN (SELECT oid FROM pg_class WHERE relnamespace = 'public'::regnamespace)) as total_triggers,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public') as total_functions,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_rls_policies;

```

### Expected Output & Next Steps

After executing this SQL script in Supabase SQL Editor:

1. **Save the output** to a file: `database-schema-audit-results-YYYY-MM-DD.txt`

2. **Review Section 1** (Table Existence): Confirm all 25 tables exist

3. **Review Section 2** (Column Schemas): Compare actual columns against expected schemas from E01-E09 specifications

4. **Review Sections 3-8**: Identify missing indexes, constraints, ENUMs, triggers, functions, RLS policies

5. **Create Gap Analysis Document** listing:
   - Missing columns per table
   - Missing indexes per table
   - Missing ENUMs
   - Missing functions
   - Missing RLS policies
   - Missing triggers

6. **Proceed to Prompts 2-8**: Use gap analysis to execute targeted normalization SQL for each module (E02-E09)

### Deliverables from Prompt 1

- ✅ Complete schema audit results file
- ✅ Gap analysis document (actual vs expected)
- ✅ Prioritized list of normalization tasks
- ✅ Validation that database is accessible and queryable

---

## Prompt 2: E02 Tables Normalization

**Objective**: Normalize the E02 module tables (AI Integration & Generation) based on gap analysis from Prompt 1.

**Tables**: `prompt_templates`, `generation_logs`, `template_analytics`

**Reference**: `pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E02.md`

### Context from E02 Audit Report

**E02 Status (from audit file `04-FR-wireframes-execution-E02-sql-check.md`):**
- `prompt_templates`: EXISTS with 6 rows, 12 columns - **WRONG STRUCTURE** (E02 expects 20+ columns)
- `generation_logs`: EXISTS but empty (0 rows, structure unknown)
- `template_analytics`: EXISTS but empty (0 rows, structure unknown)

### Expected Schemas from E02

**`prompt_templates` (E02 specification):**
- **Columns (20)**: id, template_name, version, template_text, template_type, tier, variables (JSONB), required_parameters, applicable_personas, applicable_emotions, description, style_notes, example_conversation, quality_threshold, is_active, usage_count, rating, created_at, updated_at, created_by

**`generation_logs` (E02 specification):**
- **Columns (19)**: id, conversation_id, run_id, template_id, request_payload (JSONB), response_payload (JSONB), parameters (JSONB), input_tokens, output_tokens, cost_usd, duration_ms, status, error_message, error_type, retry_attempt, model_name, api_version, created_at, created_by

**`template_analytics` (E02 specification):**
- **Columns (17)**: id, template_id, period_start, period_end, generation_count, success_count, failure_count, avg_quality_score, min_quality_score, max_quality_score, approval_count, rejection_count, approval_rate, avg_duration_ms, avg_cost_usd, total_cost_usd, calculated_at

### Task Instructions

**Step 1: Compare Actual vs Expected**
Using the audit results from Prompt 1, determine:
1. Which columns exist in `prompt_templates` (actual: 12 columns)
2. Which columns are MISSING from E02 specification
3. Repeat for `generation_logs` and `template_analytics`

**Step 2: Make Decision on `prompt_templates`**

This is CRITICAL - the E02 audit report states `prompt_templates` has wrong structure. You have 3 options:

**Option A**: The existing table is from a different system → BACKUP and recreate
**Option B**: The existing table can be extended → ALTER TABLE to add missing columns
**Option C**: Rename existing table, create new one → Preserve both

Based on Prompt 1 audit results showing the actual columns in `prompt_templates`, choose the appropriate option and document your reasoning.

**Step 3: Create Normalization SQL**

```sql
-- ============================================================================
-- E10 PROMPT 2: E02 TABLES NORMALIZATION
-- ============================================================================
-- Module: AI Integration & Generation (E02)
-- Tables: prompt_templates, generation_logs, template_analytics
-- ============================================================================

BEGIN;

-- Section 1: Handle prompt_templates
-- ============================================================================
-- DECISION REQUIRED: Review Prompt 1 audit to determine which option to use

-- OPTION A: Backup and recreate (if completely wrong schema)
-- ----------------------------------------------------------------------------
-- CREATE TABLE prompt_templates_backup_20251102 AS SELECT * FROM prompt_templates;
-- DROP TABLE prompt_templates CASCADE;
-- -- Then run CREATE TABLE from E02 specification (lines 255-318 in E02.md)

-- OPTION B: Extend existing table (if schema can be merged)
-- ----------------------------------------------------------------------------
-- ALTER TABLE prompt_templates
--   ADD COLUMN IF NOT EXISTS tier TEXT CHECK (tier IN ('template', 'scenario', 'edge_case')),
--   ADD COLUMN IF NOT EXISTS variables JSONB DEFAULT '[]'::jsonb,
--   ADD COLUMN IF NOT EXISTS required_parameters TEXT[] DEFAULT ARRAY[]::TEXT[],
--   ADD COLUMN IF NOT EXISTS applicable_personas TEXT[],
--   ADD COLUMN IF NOT EXISTS applicable_emotions TEXT[],
--   ADD COLUMN IF NOT EXISTS description TEXT,
--   ADD COLUMN IF NOT EXISTS style_notes TEXT,
--   ADD COLUMN IF NOT EXISTS example_conversation TEXT,
--   ADD COLUMN IF NOT EXISTS quality_threshold DECIMAL(3,2) DEFAULT 0.70,
--   ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0,
--   ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2);
--
-- -- Add missing columns based on gap analysis
-- -- (Add more ALTER TABLE statements for other missing columns)

-- OPTION C: Rename and create new (preserve both schemas)
-- ----------------------------------------------------------------------------
-- ALTER TABLE prompt_templates RENAME TO legacy_prompt_templates;
-- -- Then run CREATE TABLE from E02 specification

-- Choose ONE option above and uncomment

-- Section 2: Verify/Complete generation_logs schema
-- ============================================================================
-- Expected: 19 columns from E02 spec
-- If Prompt 1 audit shows columns missing, add them here:

-- Example (uncomment and modify based on gap analysis):
-- ALTER TABLE generation_logs
--   ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
--   ADD COLUMN IF NOT EXISTS run_id UUID,
--   ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES prompt_templates(id),
--   ADD COLUMN IF NOT EXISTS request_payload JSONB,
--   ADD COLUMN IF NOT EXISTS response_payload JSONB,
--   ADD COLUMN IF NOT EXISTS parameters JSONB,
--   ADD COLUMN IF NOT EXISTS input_tokens INTEGER,
--   ADD COLUMN IF NOT EXISTS output_tokens INTEGER,
--   ADD COLUMN IF NOT EXISTS cost_usd DECIMAL(10,6),
--   ADD COLUMN IF NOT EXISTS duration_ms INTEGER,
--   ADD COLUMN IF NOT EXISTS status TEXT,
--   ADD COLUMN IF NOT EXISTS error_message TEXT,
--   ADD COLUMN IF NOT EXISTS error_type TEXT,
--   ADD COLUMN IF NOT EXISTS retry_attempt INTEGER DEFAULT 0,
--   ADD COLUMN IF NOT EXISTS model_name TEXT,
--   ADD COLUMN IF NOT EXISTS api_version TEXT,
--   ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
--   ADD COLUMN IF NOT EXISTS created_by UUID;

-- Section 3: Verify/Complete template_analytics schema
-- ============================================================================
-- Expected: 17 columns from E02 spec

-- ALTER TABLE template_analytics
--   ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES prompt_templates(id) ON DELETE CASCADE,
--   ADD COLUMN IF NOT EXISTS period_start TIMESTAMPTZ,
--   ADD COLUMN IF NOT EXISTS period_end TIMESTAMPTZ,
--   ADD COLUMN IF NOT EXISTS generation_count INTEGER DEFAULT 0,
--   ADD COLUMN IF NOT EXISTS success_count INTEGER DEFAULT 0,
--   ADD COLUMN IF NOT EXISTS failure_count INTEGER DEFAULT 0,
--   ADD COLUMN IF NOT EXISTS avg_quality_score DECIMAL(4,2),
--   ADD COLUMN IF NOT EXISTS min_quality_score DECIMAL(4,2),
--   ADD COLUMN IF NOT EXISTS max_quality_score DECIMAL(4,2),
--   ADD COLUMN IF NOT EXISTS approval_count INTEGER DEFAULT 0,
--   ADD COLUMN IF NOT EXISTS rejection_count INTEGER DEFAULT 0,
--   ADD COLUMN IF NOT EXISTS approval_rate DECIMAL(5,2),
--   ADD COLUMN IF NOT EXISTS avg_duration_ms INTEGER,
--   ADD COLUMN IF NOT EXISTS avg_cost_usd DECIMAL(10,6),
--   ADD COLUMN IF NOT EXISTS total_cost_usd DECIMAL(10,6),
--   ADD COLUMN IF NOT EXISTS calculated_at TIMESTAMPTZ DEFAULT NOW();

-- Section 4: Add Missing Indexes
-- ============================================================================
-- From E02 specification (lines 320-360 in E02.md)
-- Add only the indexes that are MISSING based on Prompt 1 audit

-- prompt_templates indexes:
CREATE INDEX IF NOT EXISTS idx_templates_tier ON prompt_templates(tier);
CREATE INDEX IF NOT EXISTS idx_templates_type ON prompt_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_templates_usage ON prompt_templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_templates_rating ON prompt_templates(rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_templates_variables ON prompt_templates USING GIN(variables);

-- generation_logs indexes:
CREATE INDEX IF NOT EXISTS idx_generation_logs_conversation ON generation_logs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_run ON generation_logs(run_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_template ON generation_logs(template_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_status ON generation_logs(status);
CREATE INDEX IF NOT EXISTS idx_generation_logs_created ON generation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_logs_error_type ON generation_logs(error_type) WHERE error_message IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_generation_logs_request ON generation_logs USING GIN(request_payload);
CREATE INDEX IF NOT EXISTS idx_generation_logs_response ON generation_logs USING GIN(response_payload);
CREATE INDEX IF NOT EXISTS idx_generation_logs_parameters ON generation_logs USING GIN(parameters);

-- template_analytics indexes:
CREATE INDEX IF NOT EXISTS idx_analytics_template ON template_analytics(template_id);
CREATE INDEX IF NOT EXISTS idx_analytics_period ON template_analytics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_analytics_calculated ON template_analytics(calculated_at DESC);

-- Section 5: Add Missing Constraints
-- ============================================================================

-- template_analytics unique constraint
ALTER TABLE template_analytics
  DROP CONSTRAINT IF EXISTS template_analytics_template_period_unique,
  ADD CONSTRAINT template_analytics_template_period_unique
    UNIQUE (template_id, period_start, period_end);

-- Section 6: Verify RLS Policies
-- ============================================================================
-- Enable RLS on all E02 tables

ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_analytics ENABLE ROW LEVEL SECURITY;

-- Add RLS policies (only if missing - check Prompt 1 audit first)
-- Example policies (from E02 spec):

-- CREATE POLICY "Users can view prompt templates"
--   ON prompt_templates FOR SELECT
--   USING (true);

-- CREATE POLICY "Users can insert generation logs"
--   ON generation_logs FOR INSERT
--   WITH CHECK (auth.uid() = created_by);

-- (Add remaining policies from E02 specification)

-- Section 7: Validation Queries
-- ============================================================================

-- Verify column counts match E02 specification
SELECT
  'prompt_templates' as table_name,
  COUNT(*) as column_count,
  20 as expected_columns,
  CASE WHEN COUNT(*) >= 20 THEN '✅' ELSE '❌' END as status
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'prompt_templates';

SELECT
  'generation_logs' as table_name,
  COUNT(*) as column_count,
  19 as expected_columns,
  CASE WHEN COUNT(*) >= 19 THEN '✅' ELSE '❌' END as status
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'generation_logs';

SELECT
  'template_analytics' as table_name,
  COUNT(*) as column_count,
  17 as expected_columns,
  CASE WHEN COUNT(*) >= 17 THEN '✅' ELSE '❌' END as status
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'template_analytics';

-- Verify indexes
SELECT
  tablename,
  COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('prompt_templates', 'generation_logs', 'template_analytics')
GROUP BY tablename;

COMMIT;

-- ============================================================================
-- END E10 PROMPT 2
-- ============================================================================
```

### Deliverables from Prompt 2

- ✅ `prompt_templates` schema normalized (decision documented on which option was chosen)
- ✅ `generation_logs` schema completed with all 19 expected columns
- ✅ `template_analytics` schema completed with all 17 expected columns
- ✅ All E02 indexes created
- ✅ All E02 constraints added
- ✅ RLS policies verified/added
- ✅ Validation queries confirm schema completion

### Next Steps

After completing Prompt 2:
1. Re-run validation queries to confirm all columns/indexes exist
2. Test basic CRUD operations on each table
3. Proceed to Prompt 3 (E03 Tables Normalization)

---

## Prompt 3: E03 Tables Normalization

**Objective**: Normalize the E03 module tables (Conversation Management Dashboard) based on gap analysis from Prompt 1.

**Tables**: `conversations`, `conversation_turns`

**Reference**: `pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E03.md` (lines 192-514)

### Context from E03 Audit Report

**E03 Status (from audit file `04-FR-wireframes-execution-E03-sql-check.md`):**
- `conversations`: EXISTS but empty (0 rows, structure unknown via SELECT)
- `conversation_turns`: EXISTS but empty (0 rows, structure unknown via SELECT)
- Both tables were created but need verification of complete schema

### Expected Schemas from E03

**`conversations` (E03 specification):**
- **Columns (24)**: id, conversation_id, document_id, chunk_id, persona, emotion, topic, intent, tone, category, tier, status, quality_score, total_turns, token_count, parameters (JSONB), quality_metrics (JSONB), review_history (JSONB), parent_id, parent_type, created_at, updated_at, approved_by, approved_at

**`conversation_turns` (E03 specification):**
- **Columns (7)**: id, conversation_id, turn_number, role, content, token_count, created_at

**ENUMs Required:**
- `conversation_status`: draft, generated, pending_review, approved, rejected, needs_revision, none, failed
- `tier_type`: template, scenario, edge_case

### Task Instructions

**Step 1: Verify Current Schema**
Using Prompt 1 audit results:
1. List all actual columns in `conversations`
2. List all actual columns in `conversation_turns`
3. Compare against E03 expected schemas above

**Step 2: Create Gap Analysis**
For each table, identify:
- Missing columns
- Columns with wrong data types
- Missing indexes (E03 expects 15 indexes on conversations, 1 on conversation_turns)
- Missing ENUMs
- Missing triggers
- Missing RLS policies

**Step 3: Execute Normalization SQL**

```sql
-- ============================================================================
-- E10 PROMPT 3: E03 TABLES NORMALIZATION
-- ============================================================================
-- Module: Conversation Management Dashboard (E03)
-- Tables: conversations, conversation_turns
-- ============================================================================

BEGIN;

-- Section 1: Create ENUM Types (if missing)
-- ============================================================================
-- Check Prompt 1 audit - if these ENUMs don't exist, create them

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_status') THEN
    CREATE TYPE conversation_status AS ENUM (
      'draft',
      'generated',
      'pending_review',
      'approved',
      'rejected',
      'needs_revision',
      'none',
      'failed'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tier_type') THEN
    CREATE TYPE tier_type AS ENUM (
      'template',
      'scenario',
      'edge_case'
    );
  END IF;
END $$;

-- Section 2: Normalize conversations table
-- ============================================================================
-- Add any missing columns from E03 specification

-- Example (uncomment and modify based on gap analysis from Prompt 1):
-- ALTER TABLE conversations
--   ADD COLUMN IF NOT EXISTS conversation_id TEXT UNIQUE,
--   ADD COLUMN IF NOT EXISTS document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
--   ADD COLUMN IF NOT EXISTS chunk_id UUID REFERENCES chunks(id) ON DELETE SET NULL,
--   ADD COLUMN IF NOT EXISTS persona TEXT,
--   ADD COLUMN IF NOT EXISTS emotion TEXT,
--   ADD COLUMN IF NOT EXISTS topic TEXT,
--   ADD COLUMN IF NOT EXISTS intent TEXT,
--   ADD COLUMN IF NOT EXISTS tone TEXT,
--   ADD COLUMN IF NOT EXISTS category TEXT[],
--   ADD COLUMN IF NOT EXISTS tier tier_type,
--   ADD COLUMN IF NOT EXISTS status conversation_status DEFAULT 'draft',
--   ADD COLUMN IF NOT EXISTS quality_score DECIMAL(3,1) CHECK (quality_score >= 0 AND quality_score <= 10),
--   ADD COLUMN IF NOT EXISTS total_turns INTEGER DEFAULT 0 CHECK (total_turns >= 0),
--   ADD COLUMN IF NOT EXISTS token_count INTEGER DEFAULT 0,
--   ADD COLUMN IF NOT EXISTS parameters JSONB DEFAULT '{}'::jsonb,
--   ADD COLUMN IF NOT EXISTS quality_metrics JSONB DEFAULT '{}'::jsonb,
--   ADD COLUMN IF NOT EXISTS review_history JSONB DEFAULT '[]'::jsonb,
--   ADD COLUMN IF NOT EXISTS parent_id UUID,
--   ADD COLUMN IF NOT EXISTS parent_type TEXT,
--   ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
--   ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
--   ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
--   ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Section 3: Normalize conversation_turns table
-- ============================================================================
-- Add any missing columns

-- ALTER TABLE conversation_turns
--   ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
--   ADD COLUMN IF NOT EXISTS turn_number INTEGER CHECK (turn_number > 0),
--   ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('user', 'assistant')),
--   ADD COLUMN IF NOT EXISTS content TEXT,
--   ADD COLUMN IF NOT EXISTS token_count INTEGER DEFAULT 0,
--   ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Add unique constraint
-- ALTER TABLE conversation_turns
--   DROP CONSTRAINT IF EXISTS conversation_turns_unique_turn,
--   ADD CONSTRAINT conversation_turns_unique_turn UNIQUE (conversation_id, turn_number);

-- Section 4: Add Missing Indexes
-- ============================================================================
-- From E03 specification - add only indexes missing from Prompt 1 audit

-- conversations indexes (15 total expected):
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_tier ON conversations(tier);
CREATE INDEX IF NOT EXISTS idx_conversations_quality_score ON conversations(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_status_quality ON conversations(status, quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_tier_status ON conversations(tier, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_pending_review ON conversations(quality_score ASC, created_at ASC)
  WHERE status = 'pending_review';
CREATE INDEX IF NOT EXISTS idx_conversations_text_search ON conversations
  USING GIN(to_tsvector('english', persona || ' ' || emotion || ' ' || topic));
CREATE INDEX IF NOT EXISTS idx_conversations_parameters ON conversations USING GIN(parameters);
CREATE INDEX IF NOT EXISTS idx_conversations_quality_metrics ON conversations USING GIN(quality_metrics);
CREATE INDEX IF NOT EXISTS idx_conversations_category ON conversations USING GIN(category);
CREATE INDEX IF NOT EXISTS idx_conversations_document_id ON conversations(document_id) WHERE document_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_chunk_id ON conversations(chunk_id) WHERE chunk_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_parent_id ON conversations(parent_id) WHERE parent_id IS NOT NULL;

-- conversation_turns indexes (1 expected):
CREATE INDEX IF NOT EXISTS idx_conversation_turns_conversation_id ON conversation_turns(conversation_id, turn_number);

-- Section 5: Add/Verify Triggers
-- ============================================================================

-- Create update_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to conversations table
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Section 6: Enable RLS and Add Policies
-- ============================================================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_turns ENABLE ROW LEVEL SECURITY;

-- conversations RLS policies (4 expected):
DROP POLICY IF EXISTS "Users can view conversations" ON conversations;
CREATE POLICY "Users can view conversations"
  ON conversations FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert conversations" ON conversations;
CREATE POLICY "Users can insert conversations"
  ON conversations FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update conversations" ON conversations;
CREATE POLICY "Users can update conversations"
  ON conversations FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Users can delete conversations" ON conversations;
CREATE POLICY "Users can delete conversations"
  ON conversations FOR DELETE
  USING (true);

-- conversation_turns RLS policies (2 expected):
DROP POLICY IF EXISTS "Users can view conversation turns" ON conversation_turns;
CREATE POLICY "Users can view conversation turns"
  ON conversation_turns FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert conversation turns" ON conversation_turns;
CREATE POLICY "Users can insert conversation turns"
  ON conversation_turns FOR INSERT
  WITH CHECK (true);

-- Section 7: Validation Queries
-- ============================================================================

-- Verify ENUM types
SELECT
  'conversation_status' as enum_name,
  string_agg(enumlabel, ', ' ORDER BY enumsortorder) as values
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'conversation_status';

SELECT
  'tier_type' as enum_name,
  string_agg(enumlabel, ', ' ORDER BY enumsortorder) as values
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'tier_type';

-- Verify column counts
SELECT
  'conversations' as table_name,
  COUNT(*) as column_count,
  24 as expected_columns,
  CASE WHEN COUNT(*) >= 24 THEN '✅' ELSE '❌ Missing columns' END as status
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'conversations';

SELECT
  'conversation_turns' as table_name,
  COUNT(*) as column_count,
  7 as expected_columns,
  CASE WHEN COUNT(*) >= 7 THEN '✅' ELSE '❌ Missing columns' END as status
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'conversation_turns';

-- Verify index counts
SELECT
  tablename,
  COUNT(*) as index_count,
  CASE
    WHEN tablename = 'conversations' THEN 15
    WHEN tablename = 'conversation_turns' THEN 1
  END as expected_indexes
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('conversations', 'conversation_turns')
GROUP BY tablename;

-- Verify triggers
SELECT
  event_object_table,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table = 'conversations'
  AND trigger_name = 'update_conversations_updated_at';

-- Verify RLS policies
SELECT
  tablename,
  COUNT(*) as policy_count,
  CASE
    WHEN tablename = 'conversations' THEN 4
    WHEN tablename = 'conversation_turns' THEN 2
  END as expected_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('conversations', 'conversation_turns')
GROUP BY tablename;

COMMIT;

-- ============================================================================
-- END E10 PROMPT 3
-- ============================================================================
```

### Deliverables from Prompt 3

- ✅ ENUM types created (`conversation_status`, `tier_type`)
- ✅ `conversations` table normalized with all 24 columns
- ✅ `conversation_turns` table normalized with all 7 columns
- ✅ All 15 indexes on `conversations` created
- ✅ Index on `conversation_turns` created
- ✅ `update_updated_at_column` function created
- ✅ Trigger on `conversations` table created
- ✅ 4 RLS policies on `conversations` created
- ✅ 2 RLS policies on `conversation_turns` created
- ✅ Validation queries confirm schema completion

### Next Steps

1. Test inserting sample conversation and conversation_turns data
2. Verify CASCADE delete works (delete conversation → turns deleted)
3. Verify trigger updates `updated_at` on conversation updates
4. Proceed to Prompt 4 (E04 Tables Normalization)

---

## Prompt 4: E04 Tables Normalization

**Objective**: Normalize the E04 module tables (Interactive LoRA Conversation Generation - Batch Processing) based on gap analysis from Prompt 1.

**Tables**: `batch_jobs`, `batch_items` (and verify `conversations`, `conversation_turns`, `generation_logs`)

**Reference**: `pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E04.md`

### Context from E04 Audit Report

**E04 Status (from audit file `04-FR-wireframes-execution-E04-sql-check.md`):**
- `batch_jobs`: EXISTS but empty (0 rows)
- `batch_items`: EXISTS but RLS blocking access (undefined rows/cols)
- `generation_logs`: EXISTS but empty (already handled in Prompt 2/E02)
- `conversations` & `conversation_turns`: Already normalized in Prompt 3
- **CRITICAL**: Missing ALL ENUM types (batch_job_status, batch_item_status)
- **CRITICAL**: Missing functions (calculate_batch_progress, estimate_time_remaining)

### Expected Schemas from E04

**`batch_jobs` (E04 specification):**
- **Columns (17)**: id, name, status, priority, total_items, completed_items, failed_items, successful_items, started_at, completed_at, estimated_time_remaining, tier, shared_parameters (JSONB), concurrent_processing, error_handling, created_by, created_at, updated_at

**`batch_items` (E04 specification):**
- **Columns (11)**: id, batch_job_id, conversation_id, position, topic, tier, parameters (JSONB), status, progress, estimated_time, error_message, created_at, updated_at

**ENUMs Required:**
- `batch_job_status`: draft, queued, processing, paused, completed, failed, cancelled
- `batch_item_status`: pending, processing, completed, failed, skipped

### Task Instructions

**Step 1: Verify Current Schema**
Using Prompt 1 audit results:
1. List actual columns in `batch_jobs`
2. List actual columns in `batch_items` (may require disabling RLS temporarily or using admin role)
3. Check if ENUM types exist

**Step 2: Create Normalization SQL**

```sql
-- ============================================================================
-- E10 PROMPT 4: E04 TABLES NORMALIZATION
-- ============================================================================
-- Module: Interactive LoRA Conversation Generation - Batch Processing (E04)
-- Tables: batch_jobs, batch_items
-- ============================================================================

BEGIN;

-- Section 1: Create ENUM Types
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'batch_job_status') THEN
    CREATE TYPE batch_job_status AS ENUM (
      'draft',
      'queued',
      'processing',
      'paused',
      'completed',
      'failed',
      'cancelled'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'batch_item_status') THEN
    CREATE TYPE batch_item_status AS ENUM (
      'pending',
      'processing',
      'completed',
      'failed',
      'skipped'
    );
  END IF;
END $$;

-- Section 2: Normalize batch_jobs table
-- ============================================================================
-- Add missing columns from E04 specification

-- ALTER TABLE batch_jobs
--   ADD COLUMN IF NOT EXISTS name TEXT,
--   ADD COLUMN IF NOT EXISTS status batch_job_status DEFAULT 'draft',
--   ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0,
--   ADD COLUMN IF NOT EXISTS total_items INTEGER DEFAULT 0,
--   ADD COLUMN IF NOT EXISTS completed_items INTEGER DEFAULT 0 CHECK (completed_items >= 0),
--   ADD COLUMN IF NOT EXISTS failed_items INTEGER DEFAULT 0 CHECK (failed_items >= 0),
--   ADD COLUMN IF NOT EXISTS successful_items INTEGER DEFAULT 0 CHECK (successful_items >= 0),
--   ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
--   ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
--   ADD COLUMN IF NOT EXISTS estimated_time_remaining INTEGER,
--   ADD COLUMN IF NOT EXISTS tier tier_type,
--   ADD COLUMN IF NOT EXISTS shared_parameters JSONB DEFAULT '{}'::jsonb,
--   ADD COLUMN IF NOT EXISTS concurrent_processing BOOLEAN DEFAULT false,
--   ADD COLUMN IF NOT EXISTS error_handling TEXT,
--   ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
--   ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
--   ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add CHECK constraints
-- ALTER TABLE batch_jobs
--   ADD CONSTRAINT batch_jobs_items_check
--     CHECK (completed_items + failed_items <= total_items),
--   ADD CONSTRAINT batch_jobs_successful_check
--     CHECK (successful_items = completed_items - failed_items);

-- Section 3: Normalize batch_items table
-- ============================================================================

-- ALTER TABLE batch_items
--   ADD COLUMN IF NOT EXISTS batch_job_id UUID REFERENCES batch_jobs(id) ON DELETE CASCADE,
--   ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
--   ADD COLUMN IF NOT EXISTS position INTEGER,
--   ADD COLUMN IF NOT EXISTS topic TEXT,
--   ADD COLUMN IF NOT EXISTS tier tier_type,
--   ADD COLUMN IF NOT EXISTS parameters JSONB DEFAULT '{}'::jsonb,
--   ADD COLUMN IF NOT EXISTS status batch_item_status DEFAULT 'pending',
--   ADD COLUMN IF NOT EXISTS progress DECIMAL(5,2) DEFAULT 0.0 CHECK (progress >= 0 AND progress <= 100),
--   ADD COLUMN IF NOT EXISTS estimated_time INTEGER,
--   ADD COLUMN IF NOT EXISTS error_message TEXT,
--   ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
--   ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add unique constraint
-- ALTER TABLE batch_items
--   DROP CONSTRAINT IF EXISTS batch_items_unique_position,
--   ADD CONSTRAINT batch_items_unique_position UNIQUE (batch_job_id, position);

-- Section 4: Add Missing Indexes
-- ============================================================================

-- batch_jobs indexes:
CREATE INDEX IF NOT EXISTS idx_batch_jobs_status ON batch_jobs(status);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_priority ON batch_jobs(priority DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_tier ON batch_jobs(tier);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_created_by ON batch_jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_started_at ON batch_jobs(started_at DESC) WHERE started_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_batch_jobs_completed_at ON batch_jobs(completed_at DESC) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_batch_jobs_active ON batch_jobs(started_at DESC)
  WHERE status IN ('queued', 'processing');

-- batch_items indexes:
CREATE INDEX IF NOT EXISTS idx_batch_items_batch_job_id ON batch_items(batch_job_id, position);
CREATE INDEX IF NOT EXISTS idx_batch_items_status ON batch_items(status);
CREATE INDEX IF NOT EXISTS idx_batch_items_conversation_id ON batch_items(conversation_id) WHERE conversation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_batch_items_tier ON batch_items(tier);

-- Section 5: Create Helper Functions
-- ============================================================================

-- Function: calculate_batch_progress
CREATE OR REPLACE FUNCTION calculate_batch_progress(p_batch_job_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_total INTEGER;
  v_completed INTEGER;
  v_failed INTEGER;
  v_pending INTEGER;
  v_progress DECIMAL;
BEGIN
  SELECT
    total_items,
    completed_items,
    failed_items,
    total_items - completed_items - failed_items
  INTO v_total, v_completed, v_failed, v_pending
  FROM batch_jobs
  WHERE id = p_batch_job_id;

  IF v_total > 0 THEN
    v_progress = (v_completed::DECIMAL + v_failed::DECIMAL) / v_total::DECIMAL * 100;
  ELSE
    v_progress = 0;
  END IF;

  v_result = jsonb_build_object(
    'total', v_total,
    'completed', v_completed,
    'failed', v_failed,
    'pending', v_pending,
    'progress_pct', ROUND(v_progress, 2)
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function: estimate_time_remaining
CREATE OR REPLACE FUNCTION estimate_time_remaining(p_batch_job_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_started_at TIMESTAMPTZ;
  v_total INTEGER;
  v_completed INTEGER;
  v_elapsed_seconds INTEGER;
  v_rate DECIMAL;
  v_remaining_items INTEGER;
  v_estimated_seconds INTEGER;
BEGIN
  SELECT
    started_at,
    total_items,
    completed_items
  INTO v_started_at, v_total, v_completed
  FROM batch_jobs
  WHERE id = p_batch_job_id;

  IF v_started_at IS NULL OR v_completed = 0 THEN
    RETURN NULL;
  END IF;

  v_elapsed_seconds = EXTRACT(EPOCH FROM (NOW() - v_started_at));
  v_rate = v_completed::DECIMAL / v_elapsed_seconds;
  v_remaining_items = v_total - v_completed;

  IF v_rate > 0 THEN
    v_estimated_seconds = ROUND(v_remaining_items / v_rate);
  ELSE
    v_estimated_seconds = NULL;
  END IF;

  RETURN v_estimated_seconds;
END;
$$ LANGUAGE plpgsql;

-- Section 6: Add Triggers
-- ============================================================================

-- Trigger for batch_jobs updated_at
DROP TRIGGER IF EXISTS update_batch_jobs_updated_at ON batch_jobs;
CREATE TRIGGER update_batch_jobs_updated_at
  BEFORE UPDATE ON batch_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for batch_items updated_at
DROP TRIGGER IF EXISTS update_batch_items_updated_at ON batch_items;
CREATE TRIGGER update_batch_items_updated_at
  BEFORE UPDATE ON batch_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Section 7: Enable RLS and Add Policies
-- ============================================================================

ALTER TABLE batch_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_items ENABLE ROW LEVEL SECURITY;

-- batch_jobs RLS policies:
DROP POLICY IF EXISTS "Users can view own batch jobs" ON batch_jobs;
CREATE POLICY "Users can view own batch jobs"
  ON batch_jobs FOR SELECT
  USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can insert own batch jobs" ON batch_jobs;
CREATE POLICY "Users can insert own batch jobs"
  ON batch_jobs FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update own batch jobs" ON batch_jobs;
CREATE POLICY "Users can update own batch jobs"
  ON batch_jobs FOR UPDATE
  USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete own batch jobs" ON batch_jobs;
CREATE POLICY "Users can delete own batch jobs"
  ON batch_jobs FOR DELETE
  USING (auth.uid() = created_by);

-- batch_items RLS policies:
DROP POLICY IF EXISTS "Users can view batch items" ON batch_items;
CREATE POLICY "Users can view batch items"
  ON batch_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM batch_jobs
      WHERE batch_jobs.id = batch_items.batch_job_id
        AND batch_jobs.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert batch items" ON batch_items;
CREATE POLICY "Users can insert batch items"
  ON batch_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM batch_jobs
      WHERE batch_jobs.id = batch_items.batch_job_id
        AND batch_jobs.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update batch items" ON batch_items;
CREATE POLICY "Users can update batch items"
  ON batch_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM batch_jobs
      WHERE batch_jobs.id = batch_items.batch_job_id
        AND batch_jobs.created_by = auth.uid()
    )
  );

-- Section 8: Validation Queries
-- ============================================================================

-- Verify ENUM types
SELECT
  'batch_job_status' as enum_name,
  string_agg(enumlabel, ', ' ORDER BY enumsortorder) as values
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'batch_job_status';

SELECT
  'batch_item_status' as enum_name,
  string_agg(enumlabel, ', ' ORDER BY enumsortorder) as values
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'batch_item_status';

-- Verify column counts
SELECT
  'batch_jobs' as table_name,
  COUNT(*) as column_count,
  17 as expected_columns,
  CASE WHEN COUNT(*) >= 17 THEN '✅' ELSE '❌' END as status
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'batch_jobs';

SELECT
  'batch_items' as table_name,
  COUNT(*) as column_count,
  11 as expected_columns,
  CASE WHEN COUNT(*) >= 11 THEN '✅' ELSE '❌' END as status
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'batch_items';

-- Verify functions exist
SELECT
  routine_name,
  '✅ EXISTS' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('calculate_batch_progress', 'estimate_time_remaining');

-- Verify RLS policies
SELECT
  tablename,
  COUNT(*) as policy_count,
  CASE
    WHEN tablename = 'batch_jobs' THEN 4
    WHEN tablename = 'batch_items' THEN 3
  END as expected_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('batch_jobs', 'batch_items')
GROUP BY tablename;

COMMIT;

-- ============================================================================
-- END E10 PROMPT 4
-- ============================================================================
```

### Deliverables from Prompt 4

- ✅ ENUM types created (`batch_job_status`, `batch_item_status`)
- ✅ `batch_jobs` table normalized with all 17 columns
- ✅ `batch_items` table normalized with all 11 columns
- ✅ All indexes created
- ✅ Helper functions created (`calculate_batch_progress`, `estimate_time_remaining`)
- ✅ Triggers added to both tables
- ✅ RLS policies created (4 on batch_jobs, 3 on batch_items)
- ✅ Validation queries confirm completion

### Next Steps

1. Test batch job creation and item management
2. Test helper functions with sample data
3. Verify RLS policies work correctly
4. Proceed to Prompt 5 (E05 Tables Normalization)

---

## Prompt 5: E05 Tables Normalization

**Objective**: Normalize the E05 module table (Export System) based on gap analysis from Prompt 1.

**Tables**: `export_logs`

**Reference**: `pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E05.md` (lines 273-342)

### Context from E05 Audit Report

**E05 Status (from audit file `04-FR-wireframes-execution-E05-sql-check.md`):**
- `export_logs`: EXISTS but empty (0 rows)
- **CRITICAL FINDING**: E05 audit claimed table has 25 columns with SCHEMA MISMATCH
- Actual database audit (Prompt 1) will reveal true column count
- May need to add/remove columns to match E05 specification

### Expected Schema from E05

**`export_logs` (E05 specification):**
- **Columns (14)**: id, export_id, user_id, timestamp, format, config (JSONB), conversation_count, file_size, status, file_url, expires_at, error_message, created_at, updated_at

**ENUM Required:**
- `export_status`: queued, processing, completed, failed, expired
- `export_format`: json, jsonl, csv, markdown

### Task Instructions

**Step 1: Review Prompt 1 Audit**
1. Check actual columns in `export_logs`
2. Compare against E05 expected 14 columns
3. Determine if columns need to be added, removed, or renamed

**Step 2: Execute Normalization SQL**

```sql
-- ============================================================================
-- E10 PROMPT 5: E05 TABLES NORMALIZATION
-- ============================================================================
-- Module: Export System (E05)
-- Tables: export_logs
-- ============================================================================

BEGIN;

-- Section 1: Create ENUM Types
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'export_status') THEN
    CREATE TYPE export_status AS ENUM (
      'queued',
      'processing',
      'completed',
      'failed',
      'expired'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'export_format') THEN
    CREATE TYPE export_format AS ENUM (
      'json',
      'jsonl',
      'csv',
      'markdown'
    );
  END IF;
END $$;

-- Section 2: Normalize export_logs table
-- ============================================================================
-- Based on Prompt 1 audit, determine approach:
-- OPTION A: Table matches E05 spec → Add only missing columns
-- OPTION B: Table has wrong schema → Backup and recreate
-- OPTION C: Table has extra columns → Keep them, add missing ones

-- RECOMMENDED: Option C (hybrid - preserve existing, add missing)

-- ALTER TABLE export_logs
--   ADD COLUMN IF NOT EXISTS export_id UUID UNIQUE DEFAULT gen_random_uuid(),
--   ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
--   ADD COLUMN IF NOT EXISTS timestamp TIMESTAMPTZ DEFAULT NOW(),
--   ADD COLUMN IF NOT EXISTS format export_format,
--   ADD COLUMN IF NOT EXISTS config JSONB,
--   ADD COLUMN IF NOT EXISTS conversation_count INTEGER DEFAULT 0,
--   ADD COLUMN IF NOT EXISTS file_size BIGINT,
--   ADD COLUMN IF NOT EXISTS status export_status DEFAULT 'queued',
--   ADD COLUMN IF NOT EXISTS file_url TEXT,
--   ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
--   ADD COLUMN IF NOT EXISTS error_message TEXT,
--   ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
--   ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Section 3: Add Missing Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_export_logs_user_id ON export_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_export_logs_timestamp ON export_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_export_logs_status ON export_logs(status);
CREATE INDEX IF NOT EXISTS idx_export_logs_format ON export_logs(format);
CREATE INDEX IF NOT EXISTS idx_export_logs_expires_at ON export_logs(expires_at)
  WHERE status = 'completed';

-- Section 4: Add Constraints
-- ============================================================================

-- ALTER TABLE export_logs
--   ADD CONSTRAINT export_logs_export_id_unique UNIQUE (export_id),
--   ADD CONSTRAINT export_logs_format_check CHECK (format IN ('json', 'jsonl', 'csv', 'markdown')),
--   ADD CONSTRAINT export_logs_status_check CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'expired'));

-- Section 5: Add Trigger
-- ============================================================================

DROP TRIGGER IF EXISTS update_export_logs_updated_at ON export_logs;
CREATE TRIGGER update_export_logs_updated_at
  BEFORE UPDATE ON export_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Section 6: Enable RLS and Add Policies
-- ============================================================================

ALTER TABLE export_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own export logs" ON export_logs;
CREATE POLICY "Users can view own export logs"
  ON export_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own export logs" ON export_logs;
CREATE POLICY "Users can create own export logs"
  ON export_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own export logs" ON export_logs;
CREATE POLICY "Users can update own export logs"
  ON export_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Section 7: Validation Queries
-- ============================================================================

-- Verify column count
SELECT
  'export_logs' as table_name,
  COUNT(*) as column_count,
  14 as expected_columns,
  CASE WHEN COUNT(*) >= 14 THEN '✅' ELSE '❌' END as status
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'export_logs';

-- List all columns
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'export_logs'
ORDER BY ordinal_position;

-- Verify indexes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'export_logs';

-- Verify RLS policies
SELECT
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'export_logs';

COMMIT;

-- ============================================================================
-- END E10 PROMPT 5
-- ============================================================================
```

### Deliverables from Prompt 5

- ✅ ENUM types created (`export_status`, `export_format`)
- ✅ `export_logs` table normalized with all 14 expected columns
- ✅ All 5 indexes created
- ✅ Constraints added
- ✅ Trigger added
- ✅ 3 RLS policies created
- ✅ Validation queries confirm completion

---

## Prompt 6: E06-E07 Tables Normalization

**Objective**: Normalize E06 (Review Queue & Quality Feedback) and E07 (Template Management) tables.

**Tables**:
- E06: `conversations` (additional columns), view `review_queue_stats`, function `append_review_action`
- E07: `templates`, `scenarios`, `edge_cases`

**References**:
- E06: `pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E06.md` (lines 189-341)
- E07: `pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E07.md`

### Context

**E06 Status**: Needs to add `reviewHistory` column to `conversations` table (already partially normalized in Prompt 3)

**E07 Status**:
- `templates`: EXISTS with 5 rows, 27 columns - **matches E07 spec** ✅
- `scenarios`: EXISTS but empty (0 rows)
- `edge_cases`: EXISTS but empty (0 rows)

### Task Instructions

```sql
-- ============================================================================
-- E10 PROMPT 6: E06-E07 TABLES NORMALIZATION
-- ============================================================================
-- Modules: Review Queue (E06) + Template Management (E07)
-- Tables: conversations (E06 additions), templates, scenarios, edge_cases
-- ============================================================================

BEGIN;

-- ============================================================================
-- SECTION A: E06 - Review Queue & Quality Feedback Loop
-- ============================================================================

-- E06 Section 1: Add missing columns to conversations
-- ----------------------------------------------------------------------------
-- Note: conversations table already normalized in Prompt 3
-- E06 adds: reviewHistory (JSONB), approved_by, approved_at, reviewer_notes

-- ALTER TABLE conversations
--   ADD COLUMN IF NOT EXISTS reviewHistory JSONB DEFAULT '[]'::jsonb,
--   ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
--   ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
--   ADD COLUMN IF NOT EXISTS reviewer_notes TEXT;

-- E06 Section 2: Add missing indexes
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_conversations_review_history ON conversations
  USING GIN(reviewHistory);

CREATE INDEX IF NOT EXISTS idx_conversations_pending_review ON conversations
  (quality_score ASC, created_at ASC)
  WHERE status = 'pending_review';

CREATE INDEX IF NOT EXISTS idx_conversations_approved ON conversations
  (created_at DESC)
  WHERE status = 'approved';

-- E06 Section 3: Create append_review_action function
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION append_review_action(
  p_conversation_id UUID,
  p_action TEXT,
  p_performed_by UUID,
  p_comment TEXT DEFAULT NULL,
  p_reasons TEXT[] DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_review_entry JSONB;
  v_updated_history JSONB;
BEGIN
  -- Build review entry
  v_review_entry = jsonb_build_object(
    'action', p_action,
    'performed_by', p_performed_by,
    'timestamp', NOW(),
    'comment', p_comment,
    'reasons', to_jsonb(p_reasons)
  );

  -- Append to reviewHistory
  UPDATE conversations
  SET reviewHistory = COALESCE(reviewHistory, '[]'::jsonb) || v_review_entry
  WHERE id = p_conversation_id
  RETURNING reviewHistory INTO v_updated_history;

  RETURN v_updated_history;
END;
$$ LANGUAGE plpgsql;

-- E06 Section 4: Create review_queue_stats view
-- ----------------------------------------------------------------------------

CREATE OR REPLACE VIEW review_queue_stats AS
SELECT
  COUNT(*) FILTER (WHERE status = 'pending_review') as pending_count,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
  COUNT(*) FILTER (WHERE status = 'needs_revision') as needs_revision_count,
  AVG(quality_score) FILTER (WHERE status = 'pending_review') as avg_pending_quality,
  AVG(quality_score) FILTER (WHERE status = 'approved') as avg_approved_quality,
  COUNT(*) FILTER (WHERE status = 'pending_review' AND quality_score < 7.0) as low_quality_pending,
  COUNT(*) FILTER (WHERE status = 'pending_review' AND quality_score >= 7.0 AND quality_score < 8.5) as medium_quality_pending,
  COUNT(*) FILTER (WHERE status = 'pending_review' AND quality_score >= 8.5) as high_quality_pending
FROM conversations;

-- ============================================================================
-- SECTION B: E07 - Template Management System
-- ============================================================================

-- E07 Section 1: Verify templates table (should already match spec)
-- ----------------------------------------------------------------------------
-- Expected: 27 columns (confirmed in database audit)
-- Action: Validate only, no changes needed if Prompt 1 audit shows 27 columns

SELECT
  'templates validation' as section,
  COUNT(*) as column_count,
  CASE WHEN COUNT(*) = 27 THEN '✅ Matches E07 spec' ELSE '❌ Check columns' END as status
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'templates';

-- E07 Section 2: Normalize scenarios table
-- ----------------------------------------------------------------------------

-- ALTER TABLE scenarios
--   ADD COLUMN IF NOT EXISTS parent_template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
--   ADD COLUMN IF NOT EXISTS parent_template_name TEXT,
--   ADD COLUMN IF NOT EXISTS context TEXT,
--   ADD COLUMN IF NOT EXISTS parameter_values JSONB,
--   ADD COLUMN IF NOT EXISTS variation_count INTEGER DEFAULT 0,
--   ADD COLUMN IF NOT EXISTS quality_score DECIMAL(3,1),
--   ADD COLUMN IF NOT EXISTS topic TEXT,
--   ADD COLUMN IF NOT EXISTS persona TEXT,
--   ADD COLUMN IF NOT EXISTS emotional_arc TEXT,
--   ADD COLUMN IF NOT EXISTS generation_status TEXT,
--   ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id),
--   ADD COLUMN IF NOT EXISTS error_message TEXT,
--   ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
--   ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
--   ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- E07 Section 3: Normalize edge_cases table
-- ----------------------------------------------------------------------------

-- ALTER TABLE edge_cases
--   ADD COLUMN IF NOT EXISTS title TEXT,
--   ADD COLUMN IF NOT EXISTS description TEXT,
--   ADD COLUMN IF NOT EXISTS parent_scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
--   ADD COLUMN IF NOT EXISTS parent_scenario_name TEXT,
--   ADD COLUMN IF NOT EXISTS edge_case_type TEXT,
--   ADD COLUMN IF NOT EXISTS complexity TEXT,
--   ADD COLUMN IF NOT EXISTS test_status TEXT,
--   ADD COLUMN IF NOT EXISTS test_results JSONB,
--   ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
--   ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- E07 Section 4: Add indexes
-- ----------------------------------------------------------------------------

-- templates indexes (if not already present):
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_tier ON templates(tier);
CREATE INDEX IF NOT EXISTS idx_templates_usage_count ON templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_templates_rating ON templates(rating DESC NULLS LAST);

-- scenarios indexes:
CREATE INDEX IF NOT EXISTS idx_scenarios_template_id ON scenarios(parent_template_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_topic ON scenarios(topic);
CREATE INDEX IF NOT EXISTS idx_scenarios_persona ON scenarios(persona);
CREATE INDEX IF NOT EXISTS idx_scenarios_status ON scenarios(generation_status);

-- edge_cases indexes:
CREATE INDEX IF NOT EXISTS idx_edge_cases_scenario_id ON edge_cases(parent_scenario_id);
CREATE INDEX IF NOT EXISTS idx_edge_cases_type ON edge_cases(edge_case_type);
CREATE INDEX IF NOT EXISTS idx_edge_cases_status ON edge_cases(test_status);

-- E07 Section 5: Create helper functions
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_template_scenario_count(p_template_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM scenarios
  WHERE parent_template_id = p_template_id;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_scenario_edge_case_count(p_scenario_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM edge_cases
  WHERE parent_scenario_id = p_scenario_id;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- E07 Section 6: Enable RLS
-- ----------------------------------------------------------------------------

ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE edge_cases ENABLE ROW LEVEL SECURITY;

-- Scenarios RLS policies:
DROP POLICY IF EXISTS "Users can view scenarios" ON scenarios;
CREATE POLICY "Users can view scenarios"
  ON scenarios FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert scenarios" ON scenarios;
CREATE POLICY "Users can insert scenarios"
  ON scenarios FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Edge cases RLS policies:
DROP POLICY IF EXISTS "Users can view edge cases" ON edge_cases;
CREATE POLICY "Users can view edge cases"
  ON edge_cases FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert edge cases" ON edge_cases;
CREATE POLICY "Users can insert edge cases"
  ON edge_cases FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- ============================================================================
-- VALIDATION QUERIES
-- ============================================================================

-- E06 Validation
-- ----------------------------------------------------------------------------

-- Check reviewHistory column exists
SELECT
  'conversations.reviewHistory' as component,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'reviewhistory'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- Check append_review_action function exists
SELECT
  'append_review_action' as component,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_name = 'append_review_action'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- Check review_queue_stats view exists
SELECT
  'review_queue_stats' as component,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.views
    WHERE table_name = 'review_queue_stats'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- E07 Validation
-- ----------------------------------------------------------------------------

-- Verify table column counts
SELECT 'templates' as table_name, COUNT(*) as columns FROM information_schema.columns WHERE table_name = 'templates'
UNION ALL
SELECT 'scenarios' as table_name, COUNT(*) as columns FROM information_schema.columns WHERE table_name = 'scenarios'
UNION ALL
SELECT 'edge_cases' as table_name, COUNT(*) as columns FROM information_schema.columns WHERE table_name = 'edge_cases';

-- Check E07 functions
SELECT
  routine_name,
  '✅ EXISTS' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_template_scenario_count', 'get_scenario_edge_case_count');

COMMIT;

-- ============================================================================
-- END E10 PROMPT 6
-- ============================================================================
```

### Deliverables from Prompt 6

**E06:**
- ✅ `reviewHistory` column added to `conversations`
- ✅ 3 additional indexes created
- ✅ `append_review_action` function created
- ✅ `review_queue_stats` view created

**E07:**
- ✅ `templates` table validated (27 columns confirmed)
- ✅ `scenarios` table normalized
- ✅ `edge_cases` table normalized
- ✅ All indexes created
- ✅ Helper functions created
- ✅ RLS policies added

---

## Prompt 7: E08 Tables Normalization

**Objective**: Normalize all E08 module tables (Settings & Administration).

**Tables**: `user_preferences`, `ai_configurations`, `ai_configuration_audit`, `maintenance_operations`, `configuration_audit_log`

**Reference**: `pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E08.md`

### Context from E08 Audit

**E08 Status (from audit file):**
- All 5 tables EXISTS but RLS is blocking access
- Cannot verify column counts via JavaScript client
- Need SQL-based schema verification from Prompt 1

### Task Instructions

```sql
-- ============================================================================
-- E10 PROMPT 7: E08 TABLES NORMALIZATION
-- ============================================================================
-- Module: Settings & Administration (E08)
-- Tables: user_preferences, ai_configurations, ai_configuration_audit,
--         maintenance_operations, configuration_audit_log
-- ============================================================================

BEGIN;

-- Section 1: Normalize user_preferences
-- ============================================================================
-- Expected: 5 columns

-- ALTER TABLE user_preferences
--   ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
--   ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb,
--   ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
--   ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Section 2: Normalize ai_configurations
-- ============================================================================
-- Expected: 10 columns

-- ALTER TABLE ai_configurations
--   ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
--   ADD COLUMN IF NOT EXISTS organization_id UUID,
--   ADD COLUMN IF NOT EXISTS config_name TEXT,
--   ADD COLUMN IF NOT EXISTS configuration JSONB,
--   ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
--   ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0,
--   ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
--   ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
--   ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Section 3: Normalize ai_configuration_audit
-- ============================================================================
-- Expected: 8 columns

-- ALTER TABLE ai_configuration_audit
--   ADD COLUMN IF NOT EXISTS config_id UUID REFERENCES ai_configurations(id) ON DELETE CASCADE,
--   ADD COLUMN IF NOT EXISTS action TEXT,
--   ADD COLUMN IF NOT EXISTS changed_by UUID REFERENCES auth.users(id),
--   ADD COLUMN IF NOT EXISTS old_values JSONB,
--   ADD COLUMN IF NOT EXISTS new_values JSONB,
--   ADD COLUMN IF NOT EXISTS change_reason TEXT,
--   ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Section 4: Normalize maintenance_operations
-- ============================================================================
-- Expected: 12 columns

-- ALTER TABLE maintenance_operations
--   ADD COLUMN IF NOT EXISTS operation_type TEXT,
--   ADD COLUMN IF NOT EXISTS table_name TEXT,
--   ADD COLUMN IF NOT EXISTS index_name TEXT,
--   ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
--   ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
--   ADD COLUMN IF NOT EXISTS duration_ms INTEGER,
--   ADD COLUMN IF NOT EXISTS status TEXT,
--   ADD COLUMN IF NOT EXISTS initiated_by UUID REFERENCES auth.users(id),
--   ADD COLUMN IF NOT EXISTS error_message TEXT,
--   ADD COLUMN IF NOT EXISTS options JSONB,
--   ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Section 5: Normalize configuration_audit_log
-- ============================================================================
-- Expected: 10 columns

-- ALTER TABLE configuration_audit_log
--   ADD COLUMN IF NOT EXISTS config_type TEXT,
--   ADD COLUMN IF NOT EXISTS config_id UUID,
--   ADD COLUMN IF NOT EXISTS changed_by UUID REFERENCES auth.users(id),
--   ADD COLUMN IF NOT EXISTS changed_at TIMESTAMPTZ DEFAULT NOW(),
--   ADD COLUMN IF NOT EXISTS old_values JSONB,
--   ADD COLUMN IF NOT EXISTS new_values JSONB,
--   ADD COLUMN IF NOT EXISTS change_reason TEXT,
--   ADD COLUMN IF NOT EXISTS client_ip TEXT,
--   ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Section 6: Add Indexes
-- ============================================================================

-- user_preferences indexes:
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_created_at ON user_preferences(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_preferences_jsonb ON user_preferences USING GIN(preferences);

-- ai_configurations indexes:
CREATE INDEX IF NOT EXISTS idx_ai_configurations_user_id ON ai_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_configurations_org_id ON ai_configurations(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_configurations_is_active ON ai_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_configurations_jsonb ON ai_configurations USING GIN(configuration);
CREATE INDEX IF NOT EXISTS idx_ai_configurations_created_at ON ai_configurations(created_at DESC);

-- ai_configuration_audit indexes:
CREATE INDEX IF NOT EXISTS idx_ai_config_audit_config_id ON ai_configuration_audit(config_id);
CREATE INDEX IF NOT EXISTS idx_ai_config_audit_changed_by ON ai_configuration_audit(changed_by);
CREATE INDEX IF NOT EXISTS idx_ai_config_audit_created_at ON ai_configuration_audit(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_config_audit_action ON ai_configuration_audit(action);

-- maintenance_operations indexes:
CREATE INDEX IF NOT EXISTS idx_maintenance_ops_table_name ON maintenance_operations(table_name);
CREATE INDEX IF NOT EXISTS idx_maintenance_ops_operation_type ON maintenance_operations(operation_type);
CREATE INDEX IF NOT EXISTS idx_maintenance_ops_status ON maintenance_operations(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_ops_started_at ON maintenance_operations(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_ops_created_at ON maintenance_operations(created_at DESC);

-- configuration_audit_log indexes:
CREATE INDEX IF NOT EXISTS idx_config_audit_config_type ON configuration_audit_log(config_type);
CREATE INDEX IF NOT EXISTS idx_config_audit_config_id ON configuration_audit_log(config_id);
CREATE INDEX IF NOT EXISTS idx_config_audit_changed_by ON configuration_audit_log(changed_by);
CREATE INDEX IF NOT EXISTS idx_config_audit_changed_at ON configuration_audit_log(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_config_audit_old_values ON configuration_audit_log USING GIN(old_values);
CREATE INDEX IF NOT EXISTS idx_config_audit_new_values ON configuration_audit_log USING GIN(new_values);

-- Section 7: Create Functions
-- ============================================================================

-- Function: initialize_user_preferences
CREATE OR REPLACE FUNCTION initialize_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (user_id, preferences)
  VALUES (
    NEW.id,
    '{
      "theme": "light",
      "notifications": true,
      "language": "en"
    }'::jsonb
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on auth.users table (if accessible)
-- DROP TRIGGER IF EXISTS initialize_user_preferences_on_signup ON auth.users;
-- CREATE TRIGGER initialize_user_preferences_on_signup
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION initialize_user_preferences();

-- Function: log_ai_config_changes
CREATE OR REPLACE FUNCTION log_ai_config_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO ai_configuration_audit (
      config_id,
      action,
      changed_by,
      old_values,
      new_values
    ) VALUES (
      NEW.id,
      'UPDATE',
      NEW.updated_by,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on ai_configurations
DROP TRIGGER IF EXISTS ai_configuration_audit_trigger ON ai_configurations;
CREATE TRIGGER ai_configuration_audit_trigger
  AFTER UPDATE ON ai_configurations
  FOR EACH ROW
  EXECUTE FUNCTION log_ai_config_changes();

-- Function: log_user_preferences_changes
CREATE OR REPLACE FUNCTION log_user_preferences_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO configuration_audit_log (
      config_type,
      config_id,
      changed_by,
      old_values,
      new_values
    ) VALUES (
      'user_preferences',
      NEW.id,
      NEW.user_id,
      to_jsonb(OLD.preferences),
      to_jsonb(NEW.preferences)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on user_preferences
DROP TRIGGER IF EXISTS user_preferences_audit_trigger ON user_preferences;
CREATE TRIGGER user_preferences_audit_trigger
  AFTER UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION log_user_preferences_changes();

-- Section 8: Add Triggers for updated_at
-- ============================================================================

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_configurations_updated_at ON ai_configurations;
CREATE TRIGGER update_ai_configurations_updated_at
  BEFORE UPDATE ON ai_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Section 9: Enable RLS and Add Policies
-- ============================================================================

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_configuration_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration_audit_log ENABLE ROW LEVEL SECURITY;

-- user_preferences policies (3):
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ai_configurations policies (4):
DROP POLICY IF EXISTS "Users can view own AI configs" ON ai_configurations;
CREATE POLICY "Users can view own AI configs"
  ON ai_configurations FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update own AI configs" ON ai_configurations;
CREATE POLICY "Users can update own AI configs"
  ON ai_configurations FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can insert own AI configs" ON ai_configurations;
CREATE POLICY "Users can insert own AI configs"
  ON ai_configurations FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete own AI configs" ON ai_configurations;
CREATE POLICY "Users can delete own AI configs"
  ON ai_configurations FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = created_by);

-- ai_configuration_audit policies (1):
DROP POLICY IF EXISTS "Users can view AI config audit logs" ON ai_configuration_audit;
CREATE POLICY "Users can view AI config audit logs"
  ON ai_configuration_audit FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ai_configurations
      WHERE ai_configurations.id = ai_configuration_audit.config_id
        AND (ai_configurations.user_id = auth.uid() OR ai_configurations.created_by = auth.uid())
    )
  );

-- maintenance_operations policies (2):
DROP POLICY IF EXISTS "Authenticated users can view maintenance operations" ON maintenance_operations;
CREATE POLICY "Authenticated users can view maintenance operations"
  ON maintenance_operations FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can insert maintenance operations" ON maintenance_operations;
CREATE POLICY "Admins can insert maintenance operations"
  ON maintenance_operations FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- configuration_audit_log policies (3):
DROP POLICY IF EXISTS "Users can view own configuration audit logs" ON configuration_audit_log;
CREATE POLICY "Users can view own configuration audit logs"
  ON configuration_audit_log FOR SELECT
  USING (auth.uid() = changed_by);

DROP POLICY IF EXISTS "No updates to audit log" ON configuration_audit_log;
CREATE POLICY "No updates to audit log"
  ON configuration_audit_log FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "No deletes from audit log" ON configuration_audit_log;
CREATE POLICY "No deletes from audit log"
  ON configuration_audit_log FOR DELETE
  USING (false);

-- Section 10: Validation Queries
-- ============================================================================

-- Verify column counts
SELECT 'user_preferences' as table_name, COUNT(*) as columns, 5 as expected
  FROM information_schema.columns WHERE table_name = 'user_preferences'
UNION ALL
SELECT 'ai_configurations' as table_name, COUNT(*) as columns, 10 as expected
  FROM information_schema.columns WHERE table_name = 'ai_configurations'
UNION ALL
SELECT 'ai_configuration_audit' as table_name, COUNT(*) as columns, 8 as expected
  FROM information_schema.columns WHERE table_name = 'ai_configuration_audit'
UNION ALL
SELECT 'maintenance_operations' as table_name, COUNT(*) as columns, 12 as expected
  FROM information_schema.columns WHERE table_name = 'maintenance_operations'
UNION ALL
SELECT 'configuration_audit_log' as table_name, COUNT(*) as columns, 10 as expected
  FROM information_schema.columns WHERE table_name = 'configuration_audit_log';

-- Verify functions
SELECT routine_name, '✅' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'initialize_user_preferences',
    'log_ai_config_changes',
    'log_user_preferences_changes'
  );

COMMIT;

-- ============================================================================
-- END E10 PROMPT 7
-- ============================================================================
```

### Deliverables from Prompt 7

- ✅ All 5 E08 tables normalized
- ✅ All indexes created (23 total)
- ✅ All 3 helper functions created
- ✅ All triggers created (2 audit triggers + 2 updated_at triggers)
- ✅ All RLS policies created (13 total)
- ✅ Validation queries confirm completion

---

## Prompt 8: E09 Integration & Final Validation

**Objective**: Complete E09 integration (Chunks-Alpha Integration) and perform final validation of entire database.

**Tables**: `conversations` (E09 additions)

**Reference**: `pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E09.md` (lines 170-247)

### Task Instructions

```sql
-- ============================================================================
-- E10 PROMPT 8: E09 INTEGRATION & FINAL VALIDATION
-- ============================================================================
-- Module: Chunks-Alpha Integration (E09) + Final Database Validation
-- ============================================================================

BEGIN;

-- ============================================================================
-- SECTION A: E09 - Chunks-Alpha Integration
-- ============================================================================

-- E09 Section 1: Add chunk association columns to conversations
-- ----------------------------------------------------------------------------
-- E09 adds: parent_chunk_id, chunk_context, dimension_source

-- ALTER TABLE conversations
--   ADD COLUMN IF NOT EXISTS parent_chunk_id UUID REFERENCES chunks(id) ON DELETE SET NULL,
--   ADD COLUMN IF NOT EXISTS chunk_context TEXT,
--   ADD COLUMN IF NOT EXISTS dimension_source JSONB;

-- E09 Section 2: Add comments on new columns
-- ----------------------------------------------------------------------------

COMMENT ON COLUMN conversations.parent_chunk_id IS
  'Foreign key to chunks.id - links conversation to source document chunk';

COMMENT ON COLUMN conversations.chunk_context IS
  'Cached chunk content for generation - denormalized for performance';

COMMENT ON COLUMN conversations.dimension_source IS
  'Metadata from chunk dimensions: {chunkId, dimensions, confidence, extractedAt}';

-- E09 Section 3: Add indexes
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_conversations_parent_chunk_id
  ON conversations(parent_chunk_id)
  WHERE parent_chunk_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_dimension_source
  ON conversations USING GIN(dimension_source)
  WHERE dimension_source IS NOT NULL;

-- E09 Section 4: Create orphaned_conversations view
-- ----------------------------------------------------------------------------

CREATE OR REPLACE VIEW orphaned_conversations AS
SELECT
  c.id,
  c.conversation_id,
  c.persona as title,
  c.status,
  c.created_at
FROM conversations c
LEFT JOIN chunks ch ON c.parent_chunk_id = ch.id
WHERE c.parent_chunk_id IS NOT NULL
  AND ch.id IS NULL;

-- E09 Section 5: Create get_conversations_by_chunk function
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_conversations_by_chunk(
  target_chunk_id UUID,
  include_metadata BOOLEAN DEFAULT false
)
RETURNS TABLE(
  conversation_id UUID,
  title TEXT,
  status TEXT,
  chunk_context TEXT,
  dimension_data JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.persona,
    c.status::TEXT,
    CASE WHEN include_metadata THEN c.chunk_context ELSE NULL END,
    CASE WHEN include_metadata THEN c.dimension_source ELSE NULL END,
    c.created_at
  FROM conversations c
  WHERE c.parent_chunk_id = target_chunk_id
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION B: FINAL DATABASE VALIDATION
-- ============================================================================

-- Validation 1: Verify all 25 expected tables exist
-- ----------------------------------------------------------------------------

SELECT
  '📊 TABLE INVENTORY' as section,
  COUNT(*) as total_tables,
  25 as expected_tables,
  CASE WHEN COUNT(*) = 25 THEN '✅ ALL TABLES EXIST' ELSE '❌ MISSING TABLES' END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'conversations', 'conversation_turns', 'chunks', 'scenarios', 'templates',
    'edge_cases', 'documents', 'categories', 'tags', 'workflow_sessions',
    'document_categories', 'document_tags', 'custom_tags', 'tag_dimensions',
    'batch_jobs', 'batch_items', 'generation_logs', 'export_logs',
    'prompt_templates', 'template_analytics', 'user_preferences',
    'ai_configurations', 'ai_configuration_audit', 'maintenance_operations',
    'configuration_audit_log'
  );

-- Validation 2: Verify ENUM types
-- ----------------------------------------------------------------------------

SELECT
  '🎯 ENUM TYPES' as section,
  COUNT(*) as enum_count,
  6 as expected_enums,
  string_agg(typname, ', ' ORDER BY typname) as enums
FROM pg_type
WHERE typname IN (
  'conversation_status', 'tier_type', 'batch_job_status',
  'batch_item_status', 'export_status', 'export_format'
);

-- Validation 3: Verify functions
-- ----------------------------------------------------------------------------

SELECT
  '⚙️  DATABASE FUNCTIONS' as section,
  COUNT(*) as function_count,
  string_agg(routine_name, ', ' ORDER BY routine_name) as functions
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'update_updated_at_column',
    'append_review_action',
    'calculate_batch_progress',
    'estimate_time_remaining',
    'initialize_user_preferences',
    'log_ai_config_changes',
    'log_user_preferences_changes',
    'get_template_scenario_count',
    'get_scenario_edge_case_count',
    'get_conversations_by_chunk'
  );

-- Validation 4: Verify views
-- ----------------------------------------------------------------------------

SELECT
  '👁️  DATABASE VIEWS' as section,
  COUNT(*) as view_count,
  string_agg(table_name, ', ' ORDER BY table_name) as views
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN ('review_queue_stats', 'orphaned_conversations');

-- Validation 5: Index counts by table
-- ----------------------------------------------------------------------------

SELECT
  '📇 INDEX INVENTORY' as section,
  tablename,
  COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'conversations', 'conversation_turns', 'batch_jobs', 'batch_items',
    'generation_logs', 'export_logs', 'prompt_templates', 'template_analytics',
    'scenarios', 'templates', 'edge_cases',
    'user_preferences', 'ai_configurations', 'ai_configuration_audit',
    'maintenance_operations', 'configuration_audit_log'
  )
GROUP BY tablename
ORDER BY tablename;

-- Validation 6: RLS policy counts
-- ----------------------------------------------------------------------------

SELECT
  '🔒 RLS POLICY INVENTORY' as section,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Validation 7: Foreign key relationships
-- ----------------------------------------------------------------------------

SELECT
  '🔗 FOREIGN KEY RELATIONSHIPS' as section,
  conrelid::regclass AS table_name,
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
  AND contype = 'f'
ORDER BY table_name, constraint_name;

-- Validation 8: Module Completion Summary
-- ----------------------------------------------------------------------------

SELECT '✅ E10 DATABASE NORMALIZATION COMPLETE' as final_status,
  NOW() as completion_timestamp;

-- Generate final summary report
WITH table_stats AS (
  SELECT
    t.table_name,
    (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name) as column_count,
    (SELECT COUNT(*) FROM pg_indexes i WHERE i.tablename = t.table_name) as index_count,
    (SELECT COUNT(*) FROM pg_policies p WHERE p.tablename = t.table_name) as policy_count
  FROM information_schema.tables t
  WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
)
SELECT
  '📊 FINAL DATABASE SUMMARY' as section,
  table_name,
  column_count,
  index_count,
  policy_count
FROM table_stats
WHERE table_name IN (
  'conversations', 'conversation_turns', 'batch_jobs', 'batch_items',
  'generation_logs', 'export_logs', 'prompt_templates', 'template_analytics',
  'scenarios', 'templates', 'edge_cases',
  'user_preferences', 'ai_configurations', 'ai_configuration_audit',
  'maintenance_operations', 'configuration_audit_log'
)
ORDER BY table_name;

COMMIT;

-- ============================================================================
-- END E10 PROMPT 8 - DATABASE NORMALIZATION COMPLETE
-- ============================================================================
```

### Deliverables from Prompt 8

- ✅ E09 integration complete (3 columns + 2 indexes + 1 view + 1 function)
- ✅ Final validation of all 25 tables
- ✅ Verification of 6 ENUM types
- ✅ Verification of 10 database functions
- ✅ Verification of 2 views
- ✅ Complete index and RLS policy inventory
- ✅ Foreign key relationship verification
- ✅ Final summary report generated

---

## 🎉 E10 Completion Checklist

After completing all 8 prompts, verify the following:

### Database Objects Created

- [ ] **25 tables** exist and are normalized
- [ ] **6 ENUM types** exist (conversation_status, tier_type, batch_job_status, batch_item_status, export_status, export_format)
- [ ] **10+ database functions** exist and are tested
- [ ] **2 views** exist (review_queue_stats, orphaned_conversations)
- [ ] **60+ indexes** created across all tables
- [ ] **40+ RLS policies** active
- [ ] **10+ triggers** active

### Module Completion Status

- [ ] **E02** (AI Integration) - ✅ Complete
- [ ] **E03** (Conversation Management) - ✅ Complete
- [ ] **E04** (Batch Processing) - ✅ Complete
- [ ] **E05** (Export System) - ✅ Complete
- [ ] **E06** (Review Queue) - ✅ Complete
- [ ] **E07** (Template Management) - ✅ Complete
- [ ] **E08** (Settings & Administration) - ✅ Complete
- [ ] **E09** (Chunks-Alpha Integration) - ✅ Complete

### Testing & Validation

- [ ] All validation queries from Prompts 1-8 pass
- [ ] Sample data inserted into each table successfully
- [ ] Foreign key relationships tested (CASCADE deletes work)
- [ ] RLS policies tested (users can only access own data)
- [ ] Triggers tested (updated_at auto-updates, audit logs created)
- [ ] Functions tested with sample inputs
- [ ] Views tested and return expected data

### Documentation

- [ ] All SQL scripts saved in version control
- [ ] Database schema diagram generated
- [ ] E10 completion report created
- [ ] Migration notes documented
- [ ] Rollback procedures documented

---

## 📝 Post-E10 Next Steps

Once E10 database normalization is complete:

1. **Run E01-E09 Code Implementation** (if not already done)
   - Execute each execution file's prompts for frontend/backend code
   - Database is now ready to support all modules

2. **Integration Testing**
   - Test complete workflows end-to-end
   - Verify all modules work together

3. **Performance Optimization**
   - Run ANALYZE on all tables
   - Monitor query performance
   - Add additional indexes if needed

4. **Documentation Updates**
   - Update API documentation
   - Create database schema docs
   - Document RLS policies and security model

5. **Production Deployment Planning**
   - Create backup procedures
   - Plan migration strategy
   - Set up monitoring

---

## 🔧 Troubleshooting Guide

### Issue: Table has unexpected columns

**Solution**: Review Prompt 1 audit results. Either:
- Add missing columns with ALTER TABLE
- Remove extra columns (backup first!)
- Rename columns to match spec

### Issue: RLS policies blocking access

**Solution**:
- Verify `auth.uid()` is set in your context
- Check policy definitions in Prompt 1 audit
- Test with service role key (bypasses RLS)

### Issue: Foreign key constraint fails

**Solution**:
- Verify referenced table exists
- Verify referenced column has data
- Check ON DELETE CASCADE vs SET NULL behavior

### Issue: Index creation slow

**Solution**:
- Normal for large tables
- Run CREATE INDEX CONCURRENTLY if needed
- Monitor with `pg_stat_progress_create_index`

---

## 📚 References

**Execution Files:**
- E02: `pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E02.md`
- E03: `pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E03.md`
- E04: `pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E04.md`
- E05: `pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E05.md`
- E06: `pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E06.md`
- E07: `pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E07.md`
- E08: `pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E08.md`
- E09: `pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E09.md`

**Audit Reports:**
- E02-E09 SQL Check files in `pmc/product/_mapping/fr-maps/`

**Database Audit Results:**
- Prompt 1 output: `database-schema-audit-results-YYYY-MM-DD.txt`
- Complete audit: `database-audit-complete.json`

---

**E10 Specification Version**: 1.0
**Last Updated**: 2025-11-02
**Status**: ✅ Ready for Execution
