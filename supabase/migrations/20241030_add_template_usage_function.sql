-- Migration: Add function to increment template usage count
-- Description: Creates a database function to safely increment the usage_count
--              for a template and update its updated_at timestamp
-- Date: 2024-10-30

-- ============================================================================
-- Function: increment_template_usage
-- ============================================================================
-- Purpose: Atomically increment a template's usage count and update timestamp
-- Used by: Template service when a template is applied to a conversation
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE prompt_templates
  SET 
    usage_count = usage_count + 1,
    updated_at = NOW()
  WHERE id = template_id;
  
  -- Check if the template exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template with id % not found', template_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Rollback Instructions
-- ============================================================================
-- To rollback this migration, run:
-- DROP FUNCTION IF EXISTS increment_template_usage(UUID);
-- ============================================================================

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_template_usage(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_template_usage(UUID) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION increment_template_usage(UUID) IS 
  'Atomically increments the usage_count for a template and updates its timestamp. Used when a template is applied to a conversation.';

