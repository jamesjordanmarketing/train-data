-- Add remaining missing columns to batch_jobs table
ALTER TABLE batch_jobs ADD COLUMN IF NOT EXISTS total_items INTEGER DEFAULT 0;
ALTER TABLE batch_jobs ADD COLUMN IF NOT EXISTS completed_items INTEGER DEFAULT 0;
ALTER TABLE batch_jobs ADD COLUMN IF NOT EXISTS failed_items INTEGER DEFAULT 0;
ALTER TABLE batch_jobs ADD COLUMN IF NOT EXISTS successful_items INTEGER DEFAULT 0;
ALTER TABLE batch_jobs ADD COLUMN IF NOT EXISTS estimated_time_remaining INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN batch_jobs.total_items IS 'Total number of items in the batch';
COMMENT ON COLUMN batch_jobs.completed_items IS 'Number of items processed (success + fail)';
COMMENT ON COLUMN batch_jobs.failed_items IS 'Number of items that failed processing';
COMMENT ON COLUMN batch_jobs.successful_items IS 'Number of items successfully processed';
COMMENT ON COLUMN batch_jobs.estimated_time_remaining IS 'Estimated seconds remaining for batch completion';
