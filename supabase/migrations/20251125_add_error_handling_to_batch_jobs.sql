-- Add missing error_handling column to batch_jobs table
-- This column was referenced in the code but never added to the schema

ALTER TABLE batch_jobs 
ADD COLUMN IF NOT EXISTS error_handling VARCHAR(20) DEFAULT 'continue';

-- Add check constraint
ALTER TABLE batch_jobs
ADD CONSTRAINT check_error_handling 
CHECK (error_handling IN ('stop', 'continue'));

-- Add comment
COMMENT ON COLUMN batch_jobs.error_handling IS 
'Error handling strategy: stop (halt on first error) or continue (process all items). Default: continue';

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'batch_jobs' 
AND column_name = 'error_handling';
