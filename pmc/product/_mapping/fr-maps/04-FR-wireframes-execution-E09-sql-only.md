-- ============================================
-- E09 Chunks-Alpha Integration Schema
-- Generated: 2025-01-29
-- Purpose: Add chunk association and dimension metadata to conversations
-- ============================================

-- Step 1: Add chunk association columns to conversations table
ALTER TABLE conversations
  ADD COLUMN parent_chunk_id UUID REFERENCES chunks(id) ON DELETE SET NULL,
  ADD COLUMN chunk_context TEXT,
  ADD COLUMN dimension_source JSONB;

-- Step 2: Create index on parent_chunk_id for efficient chunk-to-conversation lookups
CREATE INDEX idx_conversations_parent_chunk_id 
  ON conversations(parent_chunk_id)
  WHERE parent_chunk_id IS NOT NULL;

-- Step 3: Create GIN index on dimension_source for JSONB queries
CREATE INDEX idx_conversations_dimension_source 
  ON conversations USING GIN(dimension_source)
  WHERE dimension_source IS NOT NULL;

-- Step 4: Add comment documentation
COMMENT ON COLUMN conversations.parent_chunk_id IS 
  'Foreign key to chunks.id - links conversation to source document chunk';
COMMENT ON COLUMN conversations.chunk_context IS 
  'Cached chunk content for generation - denormalized for performance';
COMMENT ON COLUMN conversations.dimension_source IS 
  'Metadata from chunk dimensions: {chunkId, dimensions, confidence, extractedAt}';

-- Step 5: Create helper view for orphaned conversations
CREATE OR REPLACE VIEW orphaned_conversations AS
SELECT 
  c.id,
  c.conversation_id,
  c.title,
  c.status,
  c.created_at
FROM conversations c
WHERE c.parent_chunk_id IS NULL
  AND c.status NOT IN ('draft', 'archived');

-- Step 6: Create helper function to get conversations by chunk
CREATE OR REPLACE FUNCTION get_conversations_by_chunk(chunk_uuid UUID)
RETURNS TABLE (
  id UUID,
  conversation_id TEXT,
  title TEXT,
  status TEXT,
  quality_score NUMERIC,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.conversation_id,
    c.title,
    c.status::TEXT,
    c.quality_score,
    c.created_at
  FROM conversations c
  WHERE c.parent_chunk_id = chunk_uuid
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Verification queries
-- Run these to verify schema changes:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'conversations' 
--   AND column_name IN ('parent_chunk_id', 'chunk_context', 'dimension_source');

-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'conversations' 
--   AND indexname LIKE '%chunk%';