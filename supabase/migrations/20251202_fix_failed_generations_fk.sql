-- Fix foreign key constraint on failed_generations.created_by
-- This constraint blocks storing failed generations when using nil UUID
-- 
-- Root Cause: The batch processing system uses '00000000-0000-0000-0000-000000000000' 
-- as a fallback when job.createdBy is null, but this UUID doesn't exist in auth.users
--
-- This is a quick fix. The proper fix is to ensure valid user IDs are always
-- propagated through the batch generation pipeline.
-- See: pmc/context-ai/pmct/iteration-2-bug-fixing-step-2-truncation-auth-bug_v1.md

-- Drop the problematic FK constraint
ALTER TABLE public.failed_generations 
DROP CONSTRAINT IF EXISTS failed_generations_created_by_fkey;

-- Also try the named version used in original migration (if different)
ALTER TABLE public.failed_generations 
DROP CONSTRAINT IF EXISTS fk_failed_generations_user;

-- Make created_by nullable since we may not always have valid user context
ALTER TABLE public.failed_generations 
ALTER COLUMN created_by DROP NOT NULL;

-- Add comment explaining the change
COMMENT ON COLUMN public.failed_generations.created_by IS 
  'User who triggered the generation. Nullable for system/automated processes. FK to auth.users removed to allow nil UUID fallback.';
