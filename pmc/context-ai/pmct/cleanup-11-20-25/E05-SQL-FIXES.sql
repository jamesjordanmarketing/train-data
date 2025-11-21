-- MISSING COLUMNS (Add these to export_logs table)
-- You may need to check the correct data types in E05 execution file

-- timestamp
-- ALTER TABLE export_logs ADD COLUMN timestamp [TYPE];

-- ⭐ CRITICAL: config
-- ALTER TABLE export_logs ADD COLUMN config [TYPE];

-- file_size
-- ALTER TABLE export_logs ADD COLUMN file_size [TYPE];

-- file_url
-- ALTER TABLE export_logs ADD COLUMN file_url [TYPE];

-- created_at
-- ALTER TABLE export_logs ADD COLUMN created_at [TYPE];

-- updated_at
-- ALTER TABLE export_logs ADD COLUMN updated_at [TYPE];

-- MISSING RLS POLICIES

CREATE POLICY "Users can update own export logs"
  ON export_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- MISSING INDEXES

-- idx_export_logs_timestamp
-- See E05 execution file for exact index definition

-- idx_export_logs_expires_at
-- See E05 execution file for exact index definition

