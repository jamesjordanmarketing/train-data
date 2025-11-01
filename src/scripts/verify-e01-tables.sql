-- ============================================================================
-- E01 TABLE VERIFICATION SCRIPT
-- Run this in Supabase SQL Editor to check table structures
-- ============================================================================

-- Create a comprehensive view of all tables and their columns
SELECT 
    table_name,
    COUNT(*) as column_count,
    string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN (
        'conversations',
        'conversation_turns',
        'generation_logs',
        'prompt_templates',
        'scenarios',
        'edge_cases',
        'export_logs',
        'batch_jobs',
        'query_performance_logs',
        'index_usage_snapshots',
        'table_bloat_snapshots',
        'performance_alerts',
        'schema_migrations'
    )
GROUP BY table_name
ORDER BY table_name;

-- Check key columns for conversations table
SELECT 'conversations' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'conversation_id') THEN '✅' ELSE '❌' END as has_conversation_id,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'persona') THEN '✅' ELSE '❌' END as has_persona,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'emotion') THEN '✅' ELSE '❌' END as has_emotion,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'tier') THEN '✅' ELSE '❌' END as has_tier,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'status') THEN '✅' ELSE '❌' END as has_status,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'quality_score') THEN '✅' ELSE '❌' END as has_quality_score;

-- Check key columns for conversation_turns table
SELECT 'conversation_turns' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversation_turns' AND column_name = 'conversation_id') THEN '✅' ELSE '❌' END as has_conversation_id,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversation_turns' AND column_name = 'turn_number') THEN '✅' ELSE '❌' END as has_turn_number,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversation_turns' AND column_name = 'role') THEN '✅' ELSE '❌' END as has_role,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversation_turns' AND column_name = 'content') THEN '✅' ELSE '❌' END as has_content;

-- Check key columns for generation_logs table
SELECT 'generation_logs' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generation_logs' AND column_name = 'conversation_id') THEN '✅' ELSE '❌' END as has_conversation_id,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generation_logs' AND column_name = 'template_id') THEN '✅' ELSE '❌' END as has_template_id,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generation_logs' AND column_name = 'model_used') THEN '✅' ELSE '❌' END as has_model_used,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generation_logs' AND column_name = 'input_tokens') THEN '✅' ELSE '❌' END as has_input_tokens,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generation_logs' AND column_name = 'output_tokens') THEN '✅' ELSE '❌' END as has_output_tokens;

-- Check key columns for prompt_templates table
SELECT 'prompt_templates' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prompt_templates' AND column_name = 'template_name') THEN '✅' ELSE '❌' END as has_template_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prompt_templates' AND column_name = 'tier') THEN '✅' ELSE '❌' END as has_tier,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prompt_templates' AND column_name = 'template_text') THEN '✅' ELSE '❌' END as has_template_text;

-- Check for functions
SELECT routine_name, routine_type
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
        'weekly_maintenance',
        'update_updated_at_column',
        'calculate_quality_score',
        'auto_flag_low_quality'
    )
ORDER BY routine_name;

-- Check for triggers
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
    AND event_object_table IN (
        'conversations',
        'conversation_turns',
        'prompt_templates',
        'scenarios',
        'edge_cases',
        'batch_jobs'
    )
ORDER BY event_object_table, trigger_name;

-- Get detailed column information for ALL E01 tables
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN (
        'conversations',
        'conversation_turns',
        'generation_logs',
        'prompt_templates',
        'scenarios',
        'edge_cases',
        'export_logs',
        'batch_jobs',
        'query_performance_logs',
        'index_usage_snapshots',
        'table_bloat_snapshots',
        'performance_alerts',
        'schema_migrations'
    )
ORDER BY table_name, ordinal_position;

