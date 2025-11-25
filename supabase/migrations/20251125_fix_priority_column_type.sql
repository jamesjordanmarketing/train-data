-- Fix priority column type (change from Integer to Varchar)
-- The error "invalid input syntax for type integer: 'normal'" implies it is currently an INTEGER
ALTER TABLE batch_jobs 
ALTER COLUMN priority TYPE VARCHAR(20) 
USING priority::VARCHAR;

-- Set default value to 'normal'
ALTER TABLE batch_jobs 
ALTER COLUMN priority SET DEFAULT 'normal';

-- Verify/Fix other potential type mismatches just in case
ALTER TABLE batch_jobs ALTER COLUMN tier TYPE VARCHAR(50);
ALTER TABLE batch_jobs ALTER COLUMN status TYPE VARCHAR(20);
ALTER TABLE batch_jobs ALTER COLUMN error_handling TYPE VARCHAR(20);

COMMENT ON COLUMN batch_jobs.priority IS 'Priority of the batch (low, normal, high)';
