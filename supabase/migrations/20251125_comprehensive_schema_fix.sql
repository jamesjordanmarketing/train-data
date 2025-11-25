-- COMPREHENSIVE FIX based on Audit Results

-- 1. Fix 'priority' column type in batch_jobs (Integer -> Varchar)
-- The audit showed "invalid input syntax for type integer: 'normal'", confirming it is an INTEGER.
ALTER TABLE batch_jobs 
ALTER COLUMN priority TYPE VARCHAR(20) 
USING priority::VARCHAR;

ALTER TABLE batch_jobs 
ALTER COLUMN priority SET DEFAULT 'normal';

-- 2. Add missing 'error_message' column to batch_items
-- The audit explicitly failed to find this column.
ALTER TABLE batch_items 
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- 3. Ensure 'shared_parameters' is JSONB
-- Just to be safe and ensure consistency.
ALTER TABLE batch_jobs 
ALTER COLUMN shared_parameters TYPE JSONB 
USING shared_parameters::JSONB;

-- 4. Verify/Fix other potential type mismatches
ALTER TABLE batch_jobs ALTER COLUMN status TYPE VARCHAR(20);
ALTER TABLE batch_jobs ALTER COLUMN error_handling TYPE VARCHAR(20);
ALTER TABLE batch_jobs ALTER COLUMN tier TYPE VARCHAR(50);

-- 5. Add comments for clarity
COMMENT ON COLUMN batch_jobs.priority IS 'Priority: low, normal, high';
COMMENT ON COLUMN batch_items.error_message IS 'Error message if processing failed';
