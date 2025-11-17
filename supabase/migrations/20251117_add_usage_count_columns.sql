-- Add usage_count and last_used_at columns to scaffolding tables
-- These columns track how many times each entity has been used in conversations

BEGIN;

-- Add columns to personas table
ALTER TABLE personas 
  ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE;

-- Add columns to emotional_arcs table
ALTER TABLE emotional_arcs 
  ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE;

-- Add columns to training_topics table
ALTER TABLE training_topics 
  ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE;

COMMIT;

-- Verify columns were added
SELECT 
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('personas', 'emotional_arcs', 'training_topics')
  AND column_name IN ('usage_count', 'last_used_at')
ORDER BY table_name, column_name;
