-- Migration: Add Raw Response Storage Columns
-- Date: 2025-11-17
-- Purpose: Track raw Claude responses for retry capability (Phase 2: Zero Data Loss)

BEGIN;

-- Add raw response tracking columns
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS raw_response_url TEXT,
ADD COLUMN IF NOT EXISTS raw_response_path TEXT,
ADD COLUMN IF NOT EXISTS raw_response_size BIGINT,
ADD COLUMN IF NOT EXISTS raw_stored_at TIMESTAMPTZ;

-- Add parse attempt tracking columns
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS parse_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_parse_attempt_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS parse_error_message TEXT,
ADD COLUMN IF NOT EXISTS parse_method_used VARCHAR(50);

-- Add manual review flag
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS requires_manual_review BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN conversations.raw_response_url IS 'URL to raw Claude API response (first draft, before parsing)';
COMMENT ON COLUMN conversations.raw_response_path IS 'Storage path to raw response file';
COMMENT ON COLUMN conversations.raw_response_size IS 'Size of raw response in bytes';
COMMENT ON COLUMN conversations.raw_stored_at IS 'Timestamp when raw response was first stored';
COMMENT ON COLUMN conversations.parse_attempts IS 'Number of parse attempts made';
COMMENT ON COLUMN conversations.last_parse_attempt_at IS 'Timestamp of most recent parse attempt';
COMMENT ON COLUMN conversations.parse_error_message IS 'Error message from last failed parse (for debugging)';
COMMENT ON COLUMN conversations.parse_method_used IS 'Method that successfully parsed: direct, jsonrepair, or manual';
COMMENT ON COLUMN conversations.requires_manual_review IS 'Flag for conversations needing manual JSON correction';

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_conversations_requires_review 
ON conversations(requires_manual_review) 
WHERE requires_manual_review = true;

CREATE INDEX IF NOT EXISTS idx_conversations_parse_attempts 
ON conversations(parse_attempts) 
WHERE parse_attempts > 0;

-- Add new processing_status values for raw storage workflow
COMMENT ON COLUMN conversations.processing_status IS 'Processing status: queued, processing, raw_stored, completed, failed, parse_failed';

COMMIT;

