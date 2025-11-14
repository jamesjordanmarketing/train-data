-- RPC Functions for Scaffolding Data Usage Tracking
-- These functions safely increment usage counts for personas, emotional_arcs, and training_topics
-- To be executed in Supabase SQL Editor

-- ============================================================================
-- Function: increment_persona_usage
-- Purpose: Increment usage count for a persona
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_persona_usage(persona_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE personas
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = persona_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Function: increment_arc_usage
-- Purpose: Increment usage count for an emotional arc
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_arc_usage(arc_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE emotional_arcs
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = arc_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Function: increment_topic_usage
-- Purpose: Increment usage count for a training topic
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_topic_usage(topic_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE training_topics
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Test increment_persona_usage
-- SELECT increment_persona_usage('your-persona-id-here');
-- SELECT id, name, usage_count FROM personas WHERE id = 'your-persona-id-here';

-- Test increment_arc_usage
-- SELECT increment_arc_usage('your-arc-id-here');
-- SELECT id, name, usage_count FROM emotional_arcs WHERE id = 'your-arc-id-here';

-- Test increment_topic_usage
-- SELECT increment_topic_usage('your-topic-id-here');
-- SELECT id, name, usage_count FROM training_topics WHERE id = 'your-topic-id-here';

-- ============================================================================
-- Grant Execute Permissions (adjust as needed for your security model)
-- ============================================================================

-- Grant execute to authenticated users (adjust based on your RLS policies)
-- GRANT EXECUTE ON FUNCTION increment_persona_usage TO authenticated;
-- GRANT EXECUTE ON FUNCTION increment_arc_usage TO authenticated;
-- GRANT EXECUTE ON FUNCTION increment_topic_usage TO authenticated;

-- Grant execute to service role
-- GRANT EXECUTE ON FUNCTION increment_persona_usage TO service_role;
-- GRANT EXECUTE ON FUNCTION increment_arc_usage TO service_role;
-- GRANT EXECUTE ON FUNCTION increment_topic_usage TO service_role;

