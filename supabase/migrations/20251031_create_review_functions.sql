-- Migration: Create Review Queue Database Functions
-- Description: Creates functions needed for atomic review action operations
-- Author: System
-- Date: 2025-10-31

-- ============================================================================
-- Function: append_review_action
-- Description: Atomically appends a review action to a conversation's review history
-- ============================================================================

CREATE OR REPLACE FUNCTION append_review_action(
  p_conversation_id UUID,
  p_action TEXT,
  p_performed_by UUID,
  p_comment TEXT DEFAULT NULL,
  p_reasons TEXT[] DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate that conversation exists
  IF NOT EXISTS (SELECT 1 FROM conversations WHERE id = p_conversation_id) THEN
    RAISE EXCEPTION 'Conversation with id % not found', p_conversation_id;
  END IF;

  -- Validate action type
  IF p_action NOT IN ('approved', 'rejected', 'revision_requested', 'generated', 'moved_to_review') THEN
    RAISE EXCEPTION 'Invalid action type: %', p_action;
  END IF;

  -- Append review action to review_history array
  UPDATE conversations
  SET 
    review_history = COALESCE(review_history, '[]'::jsonb) || 
      jsonb_build_object(
        'id', gen_random_uuid()::text,
        'action', p_action,
        'performedBy', p_performed_by::text,
        'timestamp', NOW()::text,
        'comment', p_comment,
        'reasons', p_reasons
      ),
    updated_at = NOW()
  WHERE id = p_conversation_id;

  -- Log the action (optional, for audit trail)
  -- You can uncomment this if you have an audit log table
  -- INSERT INTO audit_log (table_name, record_id, action, user_id, timestamp)
  -- VALUES ('conversations', p_conversation_id, 'review_action_' || p_action, p_performed_by, NOW());
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION append_review_action TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION append_review_action IS 
  'Atomically appends a review action to conversation review history. Used by review queue API.';

-- ============================================================================
-- Function: aggregate_template_feedback (Optional RPC function)
-- Description: Aggregates template performance metrics for the feedback API
-- ============================================================================

CREATE OR REPLACE FUNCTION aggregate_template_feedback(
  p_time_window INTERVAL DEFAULT '30 days',
  p_min_usage_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  template_id UUID,
  template_name TEXT,
  tier TEXT,
  usage_count BIGINT,
  avg_quality NUMERIC,
  approved_count BIGINT,
  rejected_count BIGINT,
  approval_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id AS template_id,
    t.name AS template_name,
    t.tier::TEXT,
    COUNT(c.id) AS usage_count,
    ROUND(AVG(c.quality_score)::NUMERIC, 2) AS avg_quality,
    COUNT(*) FILTER (WHERE c.status = 'approved') AS approved_count,
    COUNT(*) FILTER (WHERE c.status = 'rejected') AS rejected_count,
    ROUND(
      (COUNT(*) FILTER (WHERE c.status = 'approved')::NUMERIC / 
       NULLIF(COUNT(c.id), 0) * 100)::NUMERIC, 
      2
    ) AS approval_rate
  FROM templates t
  LEFT JOIN conversations c ON c.parent_id::TEXT = t.id::TEXT
  WHERE 
    c.created_at >= (NOW() - p_time_window)
    OR p_time_window > INTERVAL '99 years' -- Effectively "all time"
  GROUP BY t.id, t.name, t.tier
  HAVING COUNT(c.id) >= p_min_usage_count
  ORDER BY approval_rate ASC NULLS LAST, avg_quality ASC NULLS LAST;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION aggregate_template_feedback TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION aggregate_template_feedback IS 
  'Aggregates template performance metrics including approval rates and quality scores.';

-- ============================================================================
-- Indexes for Review Queue Performance
-- ============================================================================

-- Index for fetching pending reviews efficiently
CREATE INDEX IF NOT EXISTS idx_conversations_review_queue 
ON conversations(status, quality_score, created_at) 
WHERE status = 'pending_review';

-- Index for template aggregation
CREATE INDEX IF NOT EXISTS idx_conversations_parent_id_status 
ON conversations(parent_id, status, created_at);

-- Index for reviewer lookup
CREATE INDEX IF NOT EXISTS idx_conversations_approved_by 
ON conversations(approved_by) 
WHERE approved_by IS NOT NULL;

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on conversations table if not already enabled
-- ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view conversations they have access to
-- CREATE POLICY "Users can view conversations" ON conversations
--   FOR SELECT
--   USING (
--     auth.uid() = created_by::uuid OR
--     auth.uid() = approved_by::uuid OR
--     EXISTS (
--       SELECT 1 FROM user_roles
--       WHERE user_id = auth.uid()
--       AND role IN ('admin', 'reviewer')
--     )
--   );

-- Policy: Reviewers can update conversation status
-- CREATE POLICY "Reviewers can update conversations" ON conversations
--   FOR UPDATE
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_roles
--       WHERE user_id = auth.uid()
--       AND role IN ('admin', 'reviewer')
--     )
--   );

-- ============================================================================
-- Validation Checks
-- ============================================================================

-- Ensure review_history column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'conversations' 
    AND column_name = 'review_history'
  ) THEN
    ALTER TABLE conversations 
    ADD COLUMN review_history JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Ensure approved_by column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'conversations' 
    AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE conversations 
    ADD COLUMN approved_by UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Ensure approved_at column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'conversations' 
    AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE conversations 
    ADD COLUMN approved_at TIMESTAMPTZ;
  END IF;
END $$;

-- Ensure reviewer_notes column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'conversations' 
    AND column_name = 'reviewer_notes'
  ) THEN
    ALTER TABLE conversations 
    ADD COLUMN reviewer_notes TEXT;
  END IF;
END $$;

-- ============================================================================
-- Test Data (Optional - for development only)
-- ============================================================================

-- Uncomment to insert test data
-- INSERT INTO conversations (
--   id, conversation_id, title, status, tier, category, 
--   quality_score, total_turns, total_tokens, parameters, created_at
-- ) VALUES (
--   gen_random_uuid(),
--   'test_conv_1',
--   'Test Conversation for Review',
--   'pending_review',
--   'template',
--   ARRAY['support']::TEXT[],
--   7.5,
--   10,
--   1500,
--   '{}'::jsonb,
--   NOW()
-- );

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Log migration completion
DO $$ 
BEGIN
  RAISE NOTICE 'Review Queue migration completed successfully';
  RAISE NOTICE 'Created functions: append_review_action, aggregate_template_feedback';
  RAISE NOTICE 'Created indexes for optimal query performance';
END $$;

