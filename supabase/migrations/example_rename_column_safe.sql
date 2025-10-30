-- Migration: example_rename_column_safe
-- Description: Example demonstrating safe column renaming with zero downtime
-- Date: 20231031
-- Author: Migration Framework
--
-- This is an EXAMPLE migration showing how to rename a column safely.
-- This uses a multi-phase approach to maintain backward compatibility.
--
-- IMPORTANT: This should be split into multiple migrations in production:
--   Migration 1: Add new column and create view
--   [Deploy and verify]
--   Migration 2: Drop view and old column

-- ============================================================================
-- PHASE 1: ADD NEW COLUMN AND COMPATIBILITY VIEW
-- ============================================================================

-- Add the new column with the desired name
ALTER TABLE conversation_turns
ADD COLUMN IF NOT EXISTS turn_content TEXT;

-- Copy data from old column to new column
-- Only update rows where new column is NULL (idempotent)
UPDATE conversation_turns
SET turn_content = content
WHERE turn_content IS NULL AND content IS NOT NULL;

-- Create a view that provides backward compatibility
-- Old code can still reference 'content' through this view
CREATE OR REPLACE VIEW conversation_turns_v1 AS
SELECT
  id,
  conversation_id,
  turn_number,
  role,
  turn_content,           -- New column
  turn_content AS content, -- Alias for backward compatibility
  template_variables,
  quality_score,
  created_at,
  updated_at
FROM conversation_turns;

-- Grant appropriate permissions to the view
-- GRANT SELECT ON conversation_turns_v1 TO authenticated;

-- Add helpful comments
COMMENT ON COLUMN conversation_turns.turn_content IS 'Content of the conversation turn. Renamed from content for clarity.';
COMMENT ON VIEW conversation_turns_v1 IS 'Backward compatibility view for conversation_turns during column rename migration.';

-- At this point:
-- - New code can use conversation_turns.turn_content
-- - Old code can use conversation_turns_v1 which includes 'content' alias
-- - Both work simultaneously during deployment

-- ============================================================================
-- PHASE 2: CLEANUP (DO THIS IN A SEPARATE MIGRATION AFTER VERIFYING PHASE 1)
-- ============================================================================

-- This should be in a SEPARATE migration file, deployed after:
-- 1. Phase 1 migration is deployed
-- 2. Application code is updated to use 'turn_content'
-- 3. Verified that no code references 'content' anymore
-- 4. Waited at least 7 days to ensure all old processes are gone

/*
-- Drop the compatibility view
DROP VIEW IF EXISTS conversation_turns_v1;

-- Drop the old column
ALTER TABLE conversation_turns
DROP COLUMN IF EXISTS content;
*/

-- ============================================================================
-- DOWN MIGRATION (ROLLBACK FOR PHASE 1)
-- ============================================================================

-- Drop the compatibility view
DROP VIEW IF EXISTS conversation_turns_v1;

-- Drop the new column (data is still in old column)
ALTER TABLE conversation_turns
DROP COLUMN IF EXISTS turn_content;

-- ============================================================================
-- NOTES AND BEST PRACTICES FOR COLUMN RENAMING
-- ============================================================================

-- 1. NEVER rename a column directly in production
--    This breaks all existing code immediately
--
-- 2. Use a multi-phase approach:
--    Phase 1: Add new column, create view (this migration)
--    Phase 2: Update application code to use new column
--    Phase 3: Drop view and old column (separate migration)
--
-- 3. Split into separate migrations with verification between each:
--    - Migration A: Create new column and view
--    - [Deploy and test]
--    - Update application code
--    - [Deploy and test]
--    - Migration B: Clean up old column and view
--
-- 4. Keep the view for at least 7 days
--    This ensures any long-running processes complete
--
-- 5. Monitor application logs for any references to old column name
--    Before proceeding to Phase 2 cleanup
--
-- 6. The view provides read compatibility
--    For write compatibility, you may need triggers:
--    CREATE TRIGGER sync_old_to_new BEFORE INSERT OR UPDATE ON conversation_turns
--    FOR EACH ROW EXECUTE FUNCTION sync_content_columns();

-- ============================================================================
-- ALTERNATIVE APPROACH: Using Triggers for Bidirectional Sync
-- ============================================================================

-- If you need both read and write compatibility, use triggers:

/*
-- Create function to sync columns
CREATE OR REPLACE FUNCTION sync_turn_content_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- If turn_content is set, copy to content
  IF NEW.turn_content IS NOT NULL THEN
    NEW.content := NEW.turn_content;
  -- If content is set but turn_content isn't, copy from content
  ELSIF NEW.content IS NOT NULL THEN
    NEW.turn_content := NEW.content;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER sync_turn_content
BEFORE INSERT OR UPDATE ON conversation_turns
FOR EACH ROW
EXECUTE FUNCTION sync_turn_content_columns();

-- Clean up when no longer needed:
-- DROP TRIGGER IF EXISTS sync_turn_content ON conversation_turns;
-- DROP FUNCTION IF EXISTS sync_turn_content_columns();
*/

-- ============================================================================
-- VALIDATION QUERIES
-- ============================================================================

-- Verify new column exists
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'conversation_turns'
--   AND column_name IN ('content', 'turn_content')
-- ORDER BY column_name;

-- Verify view exists
-- SELECT table_name, view_definition
-- FROM information_schema.views
-- WHERE table_name = 'conversation_turns_v1';

-- Verify data was copied correctly
-- SELECT
--   COUNT(*) as total_rows,
--   COUNT(content) as content_not_null,
--   COUNT(turn_content) as turn_content_not_null,
--   COUNT(CASE WHEN content = turn_content THEN 1 END) as matching,
--   COUNT(CASE WHEN content != turn_content OR 
--               (content IS NULL AND turn_content IS NOT NULL) OR
--               (content IS NOT NULL AND turn_content IS NULL)
--         THEN 1 END) as mismatches
-- FROM conversation_turns;

-- Check for recent updates to old column (before Phase 2 cleanup)
-- SELECT COUNT(*) as recent_updates_to_old_column
-- FROM conversation_turns
-- WHERE updated_at > NOW() - INTERVAL '7 days'
--   AND content IS NOT NULL;
-- If this returns 0, it's safe to proceed with Phase 2 cleanup

