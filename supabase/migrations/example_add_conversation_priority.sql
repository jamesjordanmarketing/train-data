-- Migration: example_add_conversation_priority
-- Description: Example migration demonstrating safe patterns for adding priority field
-- Date: 20231031
-- Author: Migration Framework
--
-- This is an EXAMPLE migration that demonstrates safe migration patterns.
-- It shows how to add a new field with proper constraints and indexes.

-- ============================================================================
-- UP MIGRATION
-- ============================================================================

-- Pattern 1: Add column with DEFAULT value (no table rewrite)
-- This is instant in PostgreSQL 11+ because only metadata is updated
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' NOT NULL;

-- Pattern 2: Add constraint without full table scan (NOT VALID pattern)
-- Add constraint first without validating existing rows
ALTER TABLE conversations
ADD CONSTRAINT chk_conversation_priority
CHECK (priority IN ('low', 'medium', 'high'))
NOT VALID;

-- Validate constraint in background (this can be done later during low traffic)
-- New rows are checked immediately, this validates existing rows
ALTER TABLE conversations
VALIDATE CONSTRAINT chk_conversation_priority;

-- Pattern 3: Create index concurrently (no table locks)
-- This allows reads and writes to continue during index creation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_priority
ON conversations(priority);

-- Optional: Create partial index for active conversations with high priority
-- Partial indexes are smaller and faster for specific queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_high_priority_active
ON conversations(priority, status)
WHERE priority = 'high' AND status = 'active';

-- Add helpful comment for future developers
COMMENT ON COLUMN conversations.priority IS 'Priority level for conversation processing: low, medium, or high. Defaults to medium.';

-- ============================================================================
-- DOWN MIGRATION (ROLLBACK)
-- ============================================================================

-- Reverse the changes in opposite order
-- Drop indexes first
DROP INDEX CONCURRENTLY IF EXISTS idx_conversations_high_priority_active;
DROP INDEX CONCURRENTLY IF EXISTS idx_conversations_priority;

-- Drop constraint
ALTER TABLE conversations
DROP CONSTRAINT IF EXISTS chk_conversation_priority;

-- Drop column
ALTER TABLE conversations
DROP COLUMN IF EXISTS priority;

-- ============================================================================
-- NOTES AND BEST PRACTICES
-- ============================================================================

-- 1. Add columns with DEFAULT values to avoid table rewrites
--    PostgreSQL 11+ makes this instant by storing the default in metadata
--
-- 2. Use NOT VALID for constraints to avoid full table scans
--    Then VALIDATE separately when convenient
--
-- 3. Always use CONCURRENTLY for index creation in production
--    This prevents table locks but takes longer to complete
--
-- 4. Create partial indexes for specific query patterns
--    They're smaller and faster than full indexes
--
-- 5. Always write reversible migrations
--    DOWN script should restore the previous state completely
--
-- 6. Test both UP and DOWN migrations in development
--    Ensure rollback works before deploying to production
--
-- 7. Deploy database changes BEFORE application changes
--    This maintains backward compatibility during deployments

-- ============================================================================
-- VALIDATION QUERIES (run these after migration to verify)
-- ============================================================================

-- Check that column was added
-- SELECT column_name, data_type, column_default, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'conversations' AND column_name = 'priority';

-- Check that constraint exists
-- SELECT constraint_name, constraint_type
-- FROM information_schema.table_constraints
-- WHERE table_name = 'conversations' AND constraint_name = 'chk_conversation_priority';

-- Check that indexes were created
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'conversations'
--   AND indexname LIKE '%priority%';

-- Verify data distribution
-- SELECT priority, COUNT(*) as count
-- FROM conversations
-- GROUP BY priority
-- ORDER BY priority;

-- Check index usage (after some production traffic)
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan as scans,
--   idx_tup_read as tuples_read,
--   idx_tup_fetch as tuples_fetched
-- FROM pg_stat_user_indexes
-- WHERE tablename = 'conversations'
--   AND indexname LIKE '%priority%'
-- ORDER BY idx_scan DESC;

