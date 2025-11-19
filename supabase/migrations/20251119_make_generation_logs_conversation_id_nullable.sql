-- Fix generation_logs.conversation_id type mismatch and foreign key constraint
-- 
-- This allows logging generation failures even when the conversation
-- was never created in the conversations table (e.g., timeout errors).
-- 
-- Issue: generation_logs.conversation_id was UUID but conversations.conversation_id is TEXT
-- Solution: Convert generation_logs.conversation_id from UUID to TEXT to match conversations table
-- 
-- Before: conversation_id is UUID (mismatched with conversations.conversation_id TEXT)
-- After: conversation_id is TEXT (matches conversations.conversation_id), nullable, with correct FK

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE generation_logs 
DROP CONSTRAINT IF EXISTS generation_logs_conversation_id_fkey;

-- Step 2: Drop existing index (will be recreated with correct type)
DROP INDEX IF EXISTS idx_generation_logs_conversation_id;

-- Step 3: Convert conversation_id from UUID to TEXT
-- This preserves existing UUID values as text strings (e.g., "550e8400-e29b-41d4-a716-446655440000")
ALTER TABLE generation_logs 
ALTER COLUMN conversation_id TYPE text USING conversation_id::text;

-- Step 4: Add correct foreign key constraint
-- Now both generation_logs.conversation_id and conversations.conversation_id are TEXT type
ALTER TABLE generation_logs 
ADD CONSTRAINT generation_logs_conversation_id_fkey 
FOREIGN KEY (conversation_id) 
REFERENCES conversations (conversation_id) 
ON DELETE SET NULL;

-- Step 5: Recreate index for performance
CREATE INDEX idx_generation_logs_conversation_id 
ON generation_logs(conversation_id) 
WHERE conversation_id IS NOT NULL;

-- Step 6: Add comment explaining the nullable field and type
COMMENT ON COLUMN generation_logs.conversation_id IS 
'TEXT identifier of the conversation this generation attempt was for. NULL if generation failed before conversation was created. Matches conversations.conversation_id type (TEXT).';
