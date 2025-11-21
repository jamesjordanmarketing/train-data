-- ============================================================================
-- E09 CHUNKS-ALPHA INTEGRATION - SAFE SQL (Idempotent)
-- ============================================================================
-- Generated: 2025-11-02
-- Purpose: Add chunk association to conversations table (safe execution)
-- Note: This SQL uses IF NOT EXISTS to prevent conflicts
-- Can be safely executed multiple times
-- ============================================================================

-- AUDIT RESULTS (2025-11-02):
-- ✅ All objects SAFE TO CREATE - none currently exist
-- ⚠️  WARNING: E10 Prompt 8 creates IDENTICAL objects
-- 💡 SOLUTION: Run THIS script instead of both E09 and E10 Prompt 8

BEGIN;

-- ============================================================================
-- SECTION 1: Add Columns to conversations Table
-- ============================================================================

-- Check and add parent_chunk_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'conversations'
      AND column_name = 'parent_chunk_id'
  ) THEN
    ALTER TABLE conversations
      ADD COLUMN parent_chunk_id UUID REFERENCES chunks(id) ON DELETE SET NULL;

    RAISE NOTICE '✅ Added column: conversations.parent_chunk_id';
  ELSE
    RAISE NOTICE '⚠️  Column already exists: conversations.parent_chunk_id (skipping)';
  END IF;
END $$;

-- Check and add chunk_context column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'conversations'
      AND column_name = 'chunk_context'
  ) THEN
    ALTER TABLE conversations
      ADD COLUMN chunk_context TEXT;

    RAISE NOTICE '✅ Added column: conversations.chunk_context';
  ELSE
    RAISE NOTICE '⚠️  Column already exists: conversations.chunk_context (skipping)';
  END IF;
END $$;

-- Check and add dimension_source column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'conversations'
      AND column_name = 'dimension_source'
  ) THEN
    ALTER TABLE conversations
      ADD COLUMN dimension_source JSONB;

    RAISE NOTICE '✅ Added column: conversations.dimension_source';
  ELSE
    RAISE NOTICE '⚠️  Column already exists: conversations.dimension_source (skipping)';
  END IF;
END $$;

-- ============================================================================
-- SECTION 2: Create Indexes (Safe - IF NOT EXISTS)
-- ============================================================================

-- Index on parent_chunk_id for chunk-to-conversation lookups
CREATE INDEX IF NOT EXISTS idx_conversations_parent_chunk_id
  ON conversations(parent_chunk_id)
  WHERE parent_chunk_id IS NOT NULL;

RAISE NOTICE '✅ Index created/verified: idx_conversations_parent_chunk_id';

-- GIN index on dimension_source for JSONB queries
CREATE INDEX IF NOT EXISTS idx_conversations_dimension_source
  ON conversations USING GIN(dimension_source)
  WHERE dimension_source IS NOT NULL;

RAISE NOTICE '✅ Index created/verified: idx_conversations_dimension_source';

-- ============================================================================
-- SECTION 3: Add Column Comments (Documentation)
-- ============================================================================

COMMENT ON COLUMN conversations.parent_chunk_id IS
  'Foreign key to chunks.id - links conversation to source document chunk';

COMMENT ON COLUMN conversations.chunk_context IS
  'Cached chunk content for generation - denormalized for performance';

COMMENT ON COLUMN conversations.dimension_source IS
  'Metadata from chunk dimensions: {chunkId, dimensions, confidence, extractedAt}';

RAISE NOTICE '✅ Column comments added';

-- ============================================================================
-- SECTION 4: Create Helper View (Safe - CREATE OR REPLACE)
-- ============================================================================

-- View to identify orphaned conversations (no chunk association)
CREATE OR REPLACE VIEW orphaned_conversations AS
SELECT
  c.id,
  c.conversation_id,
  c.persona as title,  -- E09 spec uses c.title, but conversations may not have title column
  c.status,
  c.created_at
FROM conversations c
LEFT JOIN chunks ch ON c.parent_chunk_id = ch.id
WHERE c.parent_chunk_id IS NOT NULL
  AND ch.id IS NULL;

RAISE NOTICE '✅ View created/replaced: orphaned_conversations';

-- ============================================================================
-- SECTION 5: Create Helper Function (Safe - CREATE OR REPLACE)
-- ============================================================================

-- Function to get all conversations associated with a specific chunk
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
    c.persona,  -- Using persona as title since conversations may not have title column
    c.status::TEXT,
    CASE WHEN include_metadata THEN c.chunk_context ELSE NULL END,
    CASE WHEN include_metadata THEN c.dimension_source ELSE NULL END,
    c.created_at
  FROM conversations c
  WHERE c.parent_chunk_id = target_chunk_id
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

RAISE NOTICE '✅ Function created/replaced: get_conversations_by_chunk';

-- ============================================================================
-- SECTION 6: Verification Queries
-- ============================================================================

-- Verify columns were added
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'conversations'
    AND column_name IN ('parent_chunk_id', 'chunk_context', 'dimension_source');

  IF v_count = 3 THEN
    RAISE NOTICE '✅ VERIFICATION: All 3 columns exist in conversations table';
  ELSE
    RAISE WARNING '❌ VERIFICATION FAILED: Expected 3 columns, found %', v_count;
  END IF;
END $$;

-- Verify indexes were created
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND tablename = 'conversations'
    AND indexname IN ('idx_conversations_parent_chunk_id', 'idx_conversations_dimension_source');

  IF v_count = 2 THEN
    RAISE NOTICE '✅ VERIFICATION: All 2 indexes exist';
  ELSE
    RAISE WARNING '❌ VERIFICATION FAILED: Expected 2 indexes, found %', v_count;
  END IF;
END $$;

-- Verify view exists
DO $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.views
    WHERE table_schema = 'public'
      AND table_name = 'orphaned_conversations'
  ) INTO v_exists;

  IF v_exists THEN
    RAISE NOTICE '✅ VERIFICATION: View orphaned_conversations exists';
  ELSE
    RAISE WARNING '❌ VERIFICATION FAILED: View orphaned_conversations not found';
  END IF;
END $$;

-- Verify function exists
DO $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_name = 'get_conversations_by_chunk'
  ) INTO v_exists;

  IF v_exists THEN
    RAISE NOTICE '✅ VERIFICATION: Function get_conversations_by_chunk exists';
  ELSE
    RAISE WARNING '❌ VERIFICATION FAILED: Function get_conversations_by_chunk not found';
  END IF;
END $$;

COMMIT;

-- ============================================================================
-- VERIFICATION COMPLETE
-- ============================================================================

SELECT
  '🎉 E09 CHUNKS-ALPHA INTEGRATION COMPLETE' as status,
  NOW() as completed_at;

-- Display summary
SELECT
  'conversations' as table_name,
  COUNT(*) FILTER (WHERE column_name = 'parent_chunk_id') as parent_chunk_id,
  COUNT(*) FILTER (WHERE column_name = 'chunk_context') as chunk_context,
  COUNT(*) FILTER (WHERE column_name = 'dimension_source') as dimension_source
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'conversations'
  AND column_name IN ('parent_chunk_id', 'chunk_context', 'dimension_source');

-- ============================================================================
-- ROLLBACK SCRIPT (Use only if needed to reverse changes)
-- ============================================================================
/*

-- To rollback these changes, execute this commented block:

BEGIN;

DROP VIEW IF EXISTS orphaned_conversations;
DROP FUNCTION IF EXISTS get_conversations_by_chunk(UUID, BOOLEAN);
DROP INDEX IF EXISTS idx_conversations_dimension_source;
DROP INDEX IF EXISTS idx_conversations_parent_chunk_id;

ALTER TABLE conversations
  DROP COLUMN IF EXISTS dimension_source,
  DROP COLUMN IF EXISTS chunk_context,
  DROP COLUMN IF EXISTS parent_chunk_id;

COMMIT;

SELECT '✅ E09 changes rolled back' as status;

*/

-- ============================================================================
-- END OF E09 SAFE SQL
-- ============================================================================
