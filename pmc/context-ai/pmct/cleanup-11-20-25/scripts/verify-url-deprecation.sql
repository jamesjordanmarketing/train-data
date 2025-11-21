-- Verification Script: URL Deprecation Migration
-- Run this AFTER applying the migration to verify everything is correct

-- ============================================================================
-- 1. Verify all URLs are NULL
-- ============================================================================
SELECT 
  'URLs Remaining' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ PASS'
    ELSE '❌ FAIL - URLs should be NULL'
  END as status
FROM conversations
WHERE file_url IS NOT NULL OR raw_response_url IS NOT NULL;

-- ============================================================================
-- 2. Verify file_path values exist
-- ============================================================================
SELECT 
  'Conversations with Paths' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PASS'
    ELSE '⚠️  WARNING - No paths found'
  END as status
FROM conversations
WHERE file_path IS NOT NULL;

-- ============================================================================
-- 3. Verify raw_response_path values exist
-- ============================================================================
SELECT 
  'Conversations with Raw Paths' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PASS'
    ELSE 'ℹ️  INFO - No raw paths yet'
  END as status
FROM conversations
WHERE raw_response_path IS NOT NULL;

-- ============================================================================
-- 4. Display column comments
-- ============================================================================
SELECT 
  'Column Comments' as check_name,
  column_name,
  SUBSTRING(col_description((table_name::text::regclass)::oid, ordinal_position), 1, 100) as comment_preview
FROM information_schema.columns
WHERE table_name = 'conversations'
  AND column_name IN ('file_url', 'raw_response_url', 'file_path', 'raw_response_path')
ORDER BY column_name;

-- ============================================================================
-- 5. Sample data verification
-- ============================================================================
SELECT 
  'Sample Conversations' as check_name,
  conversation_id,
  CASE 
    WHEN file_url IS NOT NULL THEN '❌ Has URL'
    ELSE '✅ No URL'
  END as file_url_status,
  CASE 
    WHEN raw_response_url IS NOT NULL THEN '❌ Has URL'
    ELSE '✅ No URL'
  END as raw_url_status,
  CASE 
    WHEN file_path IS NOT NULL THEN '✅ Has Path'
    ELSE '⚠️  No Path'
  END as file_path_status,
  CASE 
    WHEN raw_response_path IS NOT NULL THEN '✅ Has Path'
    ELSE 'ℹ️  No Path'
  END as raw_path_status
FROM conversations
ORDER BY created_at DESC
LIMIT 5;

-- ============================================================================
-- 6. Overall summary
-- ============================================================================
SELECT 
  'Migration Summary' as summary,
  COUNT(*) as total_conversations,
  COUNT(CASE WHEN file_url IS NULL THEN 1 END) as null_file_urls,
  COUNT(CASE WHEN raw_response_url IS NULL THEN 1 END) as null_raw_urls,
  COUNT(CASE WHEN file_path IS NOT NULL THEN 1 END) as valid_file_paths,
  COUNT(CASE WHEN raw_response_path IS NOT NULL THEN 1 END) as valid_raw_paths,
  CASE 
    WHEN COUNT(CASE WHEN file_url IS NOT NULL OR raw_response_url IS NOT NULL THEN 1 END) = 0
    THEN '✅ MIGRATION SUCCESSFUL'
    ELSE '❌ MIGRATION INCOMPLETE'
  END as overall_status
FROM conversations;

