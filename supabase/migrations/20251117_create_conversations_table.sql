-- Migration: Create or Update Conversations Table
-- Date: 2025-11-17
-- Purpose: Ensure conversations table has all required columns
-- 
-- This migration creates the conversations table if it doesn't exist,
-- or adds missing columns if it does exist.

BEGIN;

-- Create conversations table if it doesn't exist
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  
  -- Scaffolding references
  persona_id UUID,
  emotional_arc_id UUID,
  training_topic_id UUID,
  template_id UUID,
  
  -- Denormalized data (nullable - populated from IDs if needed)
  persona JSONB,
  emotional_arc JSONB,
  training_topic JSONB,
  
  -- Classification
  tier VARCHAR(50),
  
  -- Status and review
  status VARCHAR(50) DEFAULT 'pending_review',
  processing_status VARCHAR(50) DEFAULT 'queued',
  
  -- Storage paths
  storage_path TEXT,
  bucket_name VARCHAR(255) DEFAULT 'conversation-files',
  
  -- Ownership and audit
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Flags
  is_active BOOLEAN DEFAULT true,
  requires_manual_review BOOLEAN DEFAULT false
);

-- Now add columns that might not exist yet
-- Use IF NOT EXISTS equivalent with DO block

DO $$ 
BEGIN
  -- Raw response storage columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='conversations' AND column_name='raw_response_url') THEN
    ALTER TABLE conversations ADD COLUMN raw_response_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='conversations' AND column_name='raw_response_path') THEN
    ALTER TABLE conversations ADD COLUMN raw_response_path TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='conversations' AND column_name='raw_response_size') THEN
    ALTER TABLE conversations ADD COLUMN raw_response_size BIGINT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='conversations' AND column_name='raw_stored_at') THEN
    ALTER TABLE conversations ADD COLUMN raw_stored_at TIMESTAMPTZ;
  END IF;
  
  -- Parse tracking columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='conversations' AND column_name='parse_attempts') THEN
    ALTER TABLE conversations ADD COLUMN parse_attempts INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='conversations' AND column_name='last_parse_attempt_at') THEN
    ALTER TABLE conversations ADD COLUMN last_parse_attempt_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='conversations' AND column_name='parse_error_message') THEN
    ALTER TABLE conversations ADD COLUMN parse_error_message TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='conversations' AND column_name='parse_method_used') THEN
    ALTER TABLE conversations ADD COLUMN parse_method_used VARCHAR(50);
  END IF;
  
  -- Make sure persona columns are nullable
  BEGIN
    ALTER TABLE conversations ALTER COLUMN persona DROP NOT NULL;
  EXCEPTION
    WHEN OTHERS THEN NULL; -- Column might not exist or already nullable
  END;
  
  BEGIN
    ALTER TABLE conversations ALTER COLUMN emotional_arc DROP NOT NULL;
  EXCEPTION
    WHEN OTHERS THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE conversations ALTER COLUMN training_topic DROP NOT NULL;
  EXCEPTION
    WHEN OTHERS THEN NULL;
  END;
END $$;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_conversations_conversation_id 
ON conversations(conversation_id);

CREATE INDEX IF NOT EXISTS idx_conversations_status 
ON conversations(status);

CREATE INDEX IF NOT EXISTS idx_conversations_created_by 
ON conversations(created_by);

CREATE INDEX IF NOT EXISTS idx_conversations_requires_review 
ON conversations(requires_manual_review) 
WHERE requires_manual_review = true;

CREATE INDEX IF NOT EXISTS idx_conversations_parse_attempts 
ON conversations(parse_attempts) 
WHERE parse_attempts > 0;

CREATE INDEX IF NOT EXISTS idx_conversations_processing_status 
ON conversations(processing_status);

-- Add helpful comments
COMMENT ON TABLE conversations IS 'Stores conversation metadata and tracks generation/parsing status';
COMMENT ON COLUMN conversations.conversation_id IS 'Unique identifier for the conversation (used in storage paths)';
COMMENT ON COLUMN conversations.persona IS 'Denormalized persona data (JSON). Can be null if only persona_id is set.';
COMMENT ON COLUMN conversations.emotional_arc IS 'Denormalized emotional arc data (JSON). Can be null if only emotional_arc_id is set.';
COMMENT ON COLUMN conversations.training_topic IS 'Denormalized training topic data (JSON). Can be null if only training_topic_id is set.';
COMMENT ON COLUMN conversations.raw_response_path IS 'Storage path to raw response file (before parsing)';
COMMENT ON COLUMN conversations.parse_method_used IS 'Method that successfully parsed: direct, jsonrepair, or manual';
COMMENT ON COLUMN conversations.requires_manual_review IS 'Flag for conversations needing manual JSON correction';
COMMENT ON COLUMN conversations.processing_status IS 'Processing status: queued, processing, raw_stored, completed, failed, parse_failed';

COMMIT;

-- Verification: Show table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'conversations'
ORDER BY ordinal_position;
