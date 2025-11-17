-- Fix #9: Foreign Key Constraints and Missing Functions
-- 
-- Issues fixed:
-- 1. created_by references non-existent system user
-- 2. persona/emotion columns have NOT NULL constraints
-- 3. Missing increment functions (non-critical warnings)

BEGIN;

-- Part 1: Make created_by nullable (allows system-generated conversations)
ALTER TABLE conversations ALTER COLUMN created_by DROP NOT NULL;

-- Part 2: Create system user for tracking (optional but recommended)
INSERT INTO user_profiles (id, email, full_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'system@brighthub.ai',
  'System',
  'system'
)
ON CONFLICT (id) DO NOTHING;

-- Part 3: Make denormalized columns nullable (Fix #8 continued)
-- These were identified in previous testing but column names were wrong
ALTER TABLE conversations ALTER COLUMN persona DROP NOT NULL;
ALTER TABLE conversations ALTER COLUMN emotion DROP NOT NULL;

-- Part 4: Create missing increment functions (fixes warnings)
-- These functions increment usage counters for scaffolding entities

CREATE OR REPLACE FUNCTION increment_persona_usage(persona_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE personas
  SET usage_count = COALESCE(usage_count, 0) + 1,
      last_used_at = NOW()
  WHERE id = persona_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_arc_usage(arc_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE emotional_arcs
  SET usage_count = COALESCE(usage_count, 0) + 1,
      last_used_at = NOW()
  WHERE id = arc_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_topic_usage(topic_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE training_topics
  SET usage_count = COALESCE(usage_count, 0) + 1,
      last_used_at = NOW()
  WHERE id = topic_id;
END;
$$;

COMMIT;

-- Verify changes
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'conversations' 
  AND column_name IN ('created_by', 'persona', 'emotion')
ORDER BY column_name;
