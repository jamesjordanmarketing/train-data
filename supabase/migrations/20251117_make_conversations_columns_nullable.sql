-- Migration: Make denormalized columns nullable in conversations table
-- Date: 2025-11-17
-- Purpose: Fix NOT NULL constraints on denormalized data columns
-- 
-- Issue: The conversations table has NOT NULL constraints on persona, emotional_arc, 
-- and training_topic columns, but the code stores foreign key IDs (persona_id, etc.) 
-- instead of the denormalized data. This causes inserts to fail.
--
-- Solution: Make these columns nullable since we're using the ID references.
-- The denormalized data can be populated later via a view or trigger if needed.

BEGIN;

-- Make denormalized data columns nullable
ALTER TABLE conversations 
ALTER COLUMN persona DROP NOT NULL;

ALTER TABLE conversations 
ALTER COLUMN emotional_arc DROP NOT NULL;

ALTER TABLE conversations 
ALTER COLUMN training_topic DROP NOT NULL;

-- Add comments explaining the relationship
COMMENT ON COLUMN conversations.persona IS 'Denormalized persona data (JSON). Can be null if only persona_id is set.';
COMMENT ON COLUMN conversations.emotional_arc IS 'Denormalized emotional arc data (JSON). Can be null if only emotional_arc_id is set.';
COMMENT ON COLUMN conversations.training_topic IS 'Denormalized training topic data (JSON). Can be null if only training_topic_id is set.';

-- Note: The foreign key IDs (persona_id, emotional_arc_id, training_topic_id) 
-- are the primary references. The denormalized columns are for convenience/performance only.

COMMIT;
