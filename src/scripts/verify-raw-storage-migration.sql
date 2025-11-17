-- Verification Script: Raw Response Storage Migration
-- Purpose: Verify that all columns and indexes were created correctly

-- =============================================================================
-- PART 1: Verify New Columns Exist
-- =============================================================================

SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'conversations'
  AND column_name IN (
    'raw_response_url', 
    'raw_response_path', 
    'raw_response_size',
    'raw_stored_at',
    'parse_attempts',
    'last_parse_attempt_at',
    'parse_error_message',
    'parse_method_used',
    'requires_manual_review'
  )
ORDER BY column_name;

-- Expected: 9 rows

-- =============================================================================
-- PART 2: Verify Indexes Created
-- =============================================================================

SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'conversations'
  AND (
    indexname = 'idx_conversations_requires_review' OR
    indexname = 'idx_conversations_parse_attempts'
  )
ORDER BY indexname;

-- Expected: 2 rows

-- =============================================================================
-- PART 3: Check Column Comments
-- =============================================================================

SELECT 
  cols.column_name,
  pg_catalog.col_description(c.oid, cols.ordinal_position::int) as column_comment
FROM information_schema.columns cols
JOIN pg_catalog.pg_class c ON c.relname = cols.table_name
WHERE cols.table_name = 'conversations'
  AND cols.column_name IN (
    'raw_response_url',
    'raw_response_path',
    'raw_response_size',
    'raw_stored_at',
    'parse_attempts',
    'last_parse_attempt_at',
    'parse_error_message',
    'parse_method_used',
    'requires_manual_review'
  )
ORDER BY cols.column_name;

-- Expected: 9 rows with comments

-- =============================================================================
-- PART 4: Test Sample Data (Optional - Run After Test Script)
-- =============================================================================

-- Query conversations with raw response data
SELECT 
  conversation_id,
  raw_response_url,
  raw_response_path,
  raw_response_size,
  raw_stored_at,
  parse_attempts,
  parse_method_used,
  requires_manual_review,
  processing_status,
  created_at
FROM conversations
WHERE raw_response_path IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- =============================================================================
-- PART 5: Check Conversations Requiring Manual Review
-- =============================================================================

SELECT 
  conversation_id,
  parse_attempts,
  last_parse_attempt_at,
  parse_error_message,
  processing_status,
  raw_response_url
FROM conversations
WHERE requires_manual_review = true
ORDER BY last_parse_attempt_at DESC;

-- Expected: Shows conversations that failed parsing (if any exist)

-- =============================================================================
-- PART 6: Statistics - Parse Success Rate
-- =============================================================================

SELECT 
  parse_method_used,
  COUNT(*) as count,
  AVG(parse_attempts) as avg_attempts
FROM conversations
WHERE parse_method_used IS NOT NULL
GROUP BY parse_method_used
ORDER BY count DESC;

-- Expected: Shows breakdown by parse method (direct, jsonrepair, manual)

-- =============================================================================
-- PART 7: Storage Usage Statistics
-- =============================================================================

SELECT 
  COUNT(*) as total_conversations,
  COUNT(raw_response_path) as with_raw_storage,
  COUNT(file_path) as with_final_storage,
  SUM(raw_response_size) as total_raw_bytes,
  SUM(file_size) as total_final_bytes,
  AVG(raw_response_size) as avg_raw_size,
  AVG(file_size) as avg_final_size
FROM conversations
WHERE raw_response_path IS NOT NULL;

-- Expected: Shows storage usage metrics

-- =============================================================================
-- PART 8: Processing Status Breakdown
-- =============================================================================

SELECT 
  processing_status,
  COUNT(*) as count,
  AVG(parse_attempts) as avg_parse_attempts
FROM conversations
WHERE raw_response_path IS NOT NULL
GROUP BY processing_status
ORDER BY count DESC;

-- Expected: Shows distribution of processing statuses

