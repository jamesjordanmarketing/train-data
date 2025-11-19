-- Make generation_logs.conversation_id nullable and fix type mismatch
-- 
-- This allows logging generation failures even when the conversation
-- was never created in the conversations table (e.g., timeout errors).
-- 
-- Issue: generation_logs.conversation_id is TEXT but conversations.conversation_id is UUID
-- Solution: Convert to UUID type, make nullable, add foreign key constraint
-- 
-- Before: conversation_id is TEXT with NOT NULL constraint
-- After: conversation_id is UUID and nullable, with foreign key to conversations

-- Step 1: Drop the existing foreign key constraint (if exists)
ALTER TABLE generation_logs 
DROP CONSTRAINT IF EXISTS generation_logs_conversation_id_fkey;

-- Step 2: Convert column from TEXT to UUID and make it nullable
-- Note: This will fail if any existing values are not valid UUIDs
-- If it fails, you may need to clean up invalid data first
ALTER TABLE generation_logs 
ALTER COLUMN conversation_id TYPE uuid USING conversation_id::uuid,
ALTER COLUMN conversation_id DROP NOT NULL;

-- Step 3: Add foreign key constraint (now with matching types and allows NULL)
ALTER TABLE generation_logs 
ADD CONSTRAINT generation_logs_conversation_id_fkey 
FOREIGN KEY (conversation_id) 
REFERENCES conversations(conversation_id) 
ON DELETE SET NULL;

-- Step 4: Add index for queries that filter by conversation_id
-- (helps performance when looking up logs for a specific conversation)
CREATE INDEX IF NOT EXISTS idx_generation_logs_conversation_id 
ON generation_logs(conversation_id) 
WHERE conversation_id IS NOT NULL;

-- Step 5: Add comment explaining the nullable field
COMMENT ON COLUMN generation_logs.conversation_id IS 
'UUID of the conversation this generation attempt was for. NULL if generation failed before conversation was created.';
