-- Migration: Add Enrichment Tracking to Conversations Table
-- Date: 2025-11-19
-- Purpose: Track validation, enrichment, and normalization pipeline status

BEGIN;

-- Enrichment status tracking columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='conversations' AND column_name='enrichment_status') THEN
    ALTER TABLE conversations ADD COLUMN enrichment_status VARCHAR(50) DEFAULT 'not_started'
      CHECK (enrichment_status IN (
        'not_started',
        'validation_failed',
        'validated',
        'enrichment_in_progress',
        'enriched',
        'normalization_failed',
        'completed'
      ));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='conversations' AND column_name='validation_report') THEN
    ALTER TABLE conversations ADD COLUMN validation_report JSONB;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='conversations' AND column_name='enriched_file_path') THEN
    ALTER TABLE conversations ADD COLUMN enriched_file_path TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='conversations' AND column_name='enriched_file_size') THEN
    ALTER TABLE conversations ADD COLUMN enriched_file_size BIGINT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='conversations' AND column_name='enriched_at') THEN
    ALTER TABLE conversations ADD COLUMN enriched_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='conversations' AND column_name='enrichment_version') THEN
    ALTER TABLE conversations ADD COLUMN enrichment_version VARCHAR(20) DEFAULT 'v1.0';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='conversations' AND column_name='enrichment_error') THEN
    ALTER TABLE conversations ADD COLUMN enrichment_error TEXT;
  END IF;
END $$;

-- Index for querying by enrichment status
CREATE INDEX IF NOT EXISTS idx_conversations_enrichment_status 
  ON conversations(enrichment_status);

-- Column comments
COMMENT ON COLUMN conversations.enrichment_status IS 'Tracks progress through enrichment pipeline: not_started → validated → enriched → completed';
COMMENT ON COLUMN conversations.validation_report IS 'JSONB ValidationResult with blockers and warnings';
COMMENT ON COLUMN conversations.enriched_file_path IS 'Storage path to enriched.json (with predetermined fields populated)';
COMMENT ON COLUMN conversations.enriched_file_size IS 'Size of enriched JSON file in bytes';
COMMENT ON COLUMN conversations.enriched_at IS 'Timestamp when enrichment completed';
COMMENT ON COLUMN conversations.enrichment_version IS 'Version of enrichment logic used (for future migrations)';
COMMENT ON COLUMN conversations.enrichment_error IS 'Last error message if enrichment failed';

COMMIT;

-- Verification query
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'conversations'
  AND column_name IN ('enrichment_status', 'validation_report', 'enriched_file_path', 'enriched_file_size', 'enriched_at', 'enrichment_version', 'enrichment_error')
ORDER BY ordinal_position;

