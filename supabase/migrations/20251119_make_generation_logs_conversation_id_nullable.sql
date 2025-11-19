-- Make generation_logs.conversation_id nullable
-- 
-- This allows logging generation failures even when the conversation
-- was never created in the conversations table (e.g., timeout errors).
-- 
-- Before: conversation_id has FOREIGN KEY constraint and is NOT NULL
-- After: conversation_id is nullable, foreign key constraint remains
--        but only enforces when a value is present

-- Drop the foreign key constraint
ALTER TABLE generation_logs 
DROP CONSTRAINT IF EXISTS generation_logs_conversation_id_fkey;

-- Make conversation_id nullable
ALTER TABLE generation_logs 
ALTER COLUMN conversation_id DROP NOT NULL;

-- Re-add foreign key constraint (now allows NULL)
ALTER TABLE generation_logs 
ADD CONSTRAINT generation_logs_conversation_id_fkey 
FOREIGN KEY (conversation_id) 
REFERENCES conversations(conversation_id) 
ON DELETE SET NULL;

-- Add index for queries that filter by conversation_id
-- (helps performance when looking up logs for a specific conversation)
CREATE INDEX IF NOT EXISTS idx_generation_logs_conversation_id 
ON generation_logs(conversation_id) 
WHERE conversation_id IS NOT NULL;

-- Add comment explaining the nullable field
COMMENT ON COLUMN generation_logs.conversation_id IS 
'UUID of the conversation this generation attempt was for. NULL if generation failed before conversation was created.';
