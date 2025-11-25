-- ROBUST COMPREHENSIVE FIX
-- This script uses a DO block to safely remove conflicting constraints before altering types.

DO $$
DECLARE
    r RECORD;
BEGIN
    -- 1. Drop any CHECK constraints on 'batch_jobs' that involve 'priority'
    -- This fixes the "operator does not exist: character varying >= integer" error
    FOR r IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'batch_jobs'::regclass 
        AND contype = 'c' 
        AND pg_get_constraintdef(oid) LIKE '%priority%'
    LOOP
        RAISE NOTICE 'Dropping constraint: %', r.conname;
        EXECUTE 'ALTER TABLE batch_jobs DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- 2. Now safe to alter 'priority' to VARCHAR
ALTER TABLE batch_jobs 
ALTER COLUMN priority TYPE VARCHAR(20) 
USING priority::VARCHAR;

ALTER TABLE batch_jobs 
ALTER COLUMN priority SET DEFAULT 'normal';

-- 3. Add missing 'error_message' column to batch_items
ALTER TABLE batch_items 
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- 4. Ensure 'shared_parameters' is JSONB
ALTER TABLE batch_jobs 
ALTER COLUMN shared_parameters TYPE JSONB 
USING shared_parameters::JSONB;

-- 5. Fix other potential type mismatches
ALTER TABLE batch_jobs ALTER COLUMN status TYPE VARCHAR(20);
ALTER TABLE batch_jobs ALTER COLUMN error_handling TYPE VARCHAR(20);
ALTER TABLE batch_jobs ALTER COLUMN tier TYPE VARCHAR(50);

-- 6. Add comments
COMMENT ON COLUMN batch_jobs.priority IS 'Priority: low, normal, high';
COMMENT ON COLUMN batch_items.error_message IS 'Error message if processing failed';
