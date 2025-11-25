-- Add missing columns to batch_jobs table
ALTER TABLE batch_jobs ADD COLUMN IF NOT EXISTS shared_parameters JSONB DEFAULT '{}'::jsonb;
ALTER TABLE batch_jobs ADD COLUMN IF NOT EXISTS concurrent_processing INTEGER DEFAULT 3;
ALTER TABLE batch_jobs ADD COLUMN IF NOT EXISTS tier VARCHAR(50) DEFAULT 'template';
ALTER TABLE batch_jobs ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal';

-- Add missing columns to batch_items table (just in case)
ALTER TABLE batch_items ADD COLUMN IF NOT EXISTS tier VARCHAR(50) DEFAULT 'template';
ALTER TABLE batch_items ADD COLUMN IF NOT EXISTS parameters JSONB DEFAULT '{}'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN batch_jobs.shared_parameters IS 'Shared parameters applied to all items in the batch';
COMMENT ON COLUMN batch_jobs.concurrent_processing IS 'Number of items to process concurrently';
COMMENT ON COLUMN batch_jobs.tier IS 'Tier of the batch (template, edge_case, etc.)';
COMMENT ON COLUMN batch_jobs.priority IS 'Priority of the batch (low, normal, high)';
