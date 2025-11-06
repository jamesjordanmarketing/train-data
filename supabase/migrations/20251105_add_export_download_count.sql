-- Migration: Add downloaded_count to export_logs
-- Date: 2025-11-05
-- Purpose: Track number of times export has been downloaded

ALTER TABLE export_logs
  ADD COLUMN IF NOT EXISTS downloaded_count INTEGER DEFAULT 0;

COMMENT ON COLUMN export_logs.downloaded_count IS
  'Number of times this export has been downloaded';

-- Verify column added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'export_logs'
  AND column_name = 'downloaded_count';
