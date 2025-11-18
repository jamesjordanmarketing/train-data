-- Migration: Deprecate URL Storage Columns
-- Date: 2025-11-18
-- Purpose: Remove stored URLs, keep only file paths for on-demand signed URL generation
-- 
-- CRITICAL: Signed URLs expire. We must NEVER store them in the database.
-- Instead:
--   - Store file_path (e.g., "user-id/conv-id/conversation.json")
--   - Generate signed URLs on-demand when user requests download
--   - Signed URLs valid for 1 hour, then expire

BEGIN;

-- Clear all stored URLs (they're expired anyway)
UPDATE conversations SET 
  file_url = NULL,
  raw_response_url = NULL
WHERE file_url IS NOT NULL OR raw_response_url IS NOT NULL;

-- Add comments documenting why these columns are deprecated
COMMENT ON COLUMN conversations.file_url IS 
  'DEPRECATED (2025-11-18): Signed URLs expire after 1 hour. Use file_path and generate signed URLs on-demand via ConversationStorageService.getPresignedDownloadUrl()';

COMMENT ON COLUMN conversations.raw_response_url IS 
  'DEPRECATED (2025-11-18): Signed URLs expire after 1 hour. Use raw_response_path and generate signed URLs on-demand via ConversationStorageService.getPresignedDownloadUrl()';

-- Add comments documenting correct usage
COMMENT ON COLUMN conversations.file_path IS 
  'Storage path relative to conversation-files bucket. Used to generate signed URLs on-demand. Example: "00000000-0000-0000-0000-000000000000/abc123.../conversation.json"';

COMMENT ON COLUMN conversations.raw_response_path IS 
  'Storage path for raw Claude response. Used to generate signed URLs on-demand. Example: "raw/00000000-0000-0000-0000-000000000000/abc123.json"';

COMMIT;

-- Verify migration
SELECT 
  COUNT(*) as remaining_urls
FROM conversations
WHERE file_url IS NOT NULL OR raw_response_url IS NOT NULL;
-- Expected: 0

SELECT 
  COUNT(*) as valid_paths
FROM conversations
WHERE file_path IS NOT NULL;
-- Expected: > 0 (at least some conversations have paths)

-- Display column comments
SELECT 
  table_name,
  column_name,
  col_description((table_name::text::regclass)::oid, ordinal_position) as comment
FROM information_schema.columns
WHERE table_name = 'conversations'
  AND column_name IN ('file_url', 'raw_response_url', 'file_path', 'raw_response_path')
ORDER BY column_name;

