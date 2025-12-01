/**
 * Migration: Create training_files and training_file_conversations tables
 * Purpose: Track aggregated LoRA training files (JSON + JSONL pairs)
 * 
 * Run with: npx tsx src/scripts/migrations/create-training-files-table.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables:');
  if (!supabaseUrl) console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  if (!serviceRoleKey) console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const migrationSQL = `
-- ============================================================================
-- Migration: Create training_files table
-- Purpose: Track aggregated LoRA training files (JSON + JSONL pairs)
-- ============================================================================

-- Main training_files table
CREATE TABLE IF NOT EXISTS training_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  
  -- File Storage Paths (NOT URLs - generate signed URLs on-demand)
  json_file_path TEXT NOT NULL,
  jsonl_file_path TEXT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'training-files',
  
  -- Aggregation Metadata
  conversation_count INTEGER NOT NULL DEFAULT 0,
  total_training_pairs INTEGER NOT NULL DEFAULT 0,
  json_file_size BIGINT,
  jsonl_file_size BIGINT,
  
  -- Quality Summary (aggregated from included conversations)
  avg_quality_score NUMERIC(3,2),
  min_quality_score NUMERIC(3,2),
  max_quality_score NUMERIC(3,2),
  human_reviewed_count INTEGER DEFAULT 0,
  
  -- Scaffolding Distribution (JSON field tracking persona/arc/topic counts)
  scaffolding_distribution JSONB DEFAULT '{}',
  
  -- Status Tracking
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'processing', 'failed')),
  last_updated_at TIMESTAMPTZ,
  
  -- Audit Fields
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Junction table: which conversations are in which training files
CREATE TABLE IF NOT EXISTS training_file_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_file_id UUID NOT NULL REFERENCES training_files(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Prevent duplicates (same conversation can't be in same file twice)
  CONSTRAINT unique_training_file_conversation UNIQUE(training_file_id, conversation_id)
);

-- ============================================================================
-- Indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_training_files_created_by ON training_files(created_by);
CREATE INDEX IF NOT EXISTS idx_training_files_status ON training_files(status);
CREATE INDEX IF NOT EXISTS idx_training_files_created_at ON training_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_training_file_conversations_file_id ON training_file_conversations(training_file_id);
CREATE INDEX IF NOT EXISTS idx_training_file_conversations_conversation_id ON training_file_conversations(conversation_id);

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE training_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_file_conversations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view training files" ON training_files;
DROP POLICY IF EXISTS "Users can create training files" ON training_files;
DROP POLICY IF EXISTS "Users can update own training files" ON training_files;
DROP POLICY IF EXISTS "Users can view training file conversations" ON training_file_conversations;
DROP POLICY IF EXISTS "Users can add conversations to own training files" ON training_file_conversations;

-- Users can view all training files (for dropdown selector)
CREATE POLICY "Users can view training files"
  ON training_files FOR SELECT
  USING (true);

-- Users can create training files
CREATE POLICY "Users can create training files"
  ON training_files FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own training files
CREATE POLICY "Users can update own training files"
  ON training_files FOR UPDATE
  USING (auth.uid() = created_by);

-- Users can view all training file conversations
CREATE POLICY "Users can view training file conversations"
  ON training_file_conversations FOR SELECT
  USING (true);

-- Users can add conversations to training files they created
CREATE POLICY "Users can add conversations to own training files"
  ON training_file_conversations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_files 
      WHERE id = training_file_id 
      AND created_by = auth.uid()
    )
  );

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE training_files IS 'Aggregated LoRA training files containing multiple conversations';
COMMENT ON TABLE training_file_conversations IS 'Junction table linking conversations to training files';

COMMENT ON COLUMN training_files.json_file_path IS 'Storage path to full training JSON file (use getDownloadUrl for signed URL)';
COMMENT ON COLUMN training_files.jsonl_file_path IS 'Storage path to JSONL training file (use getDownloadUrl for signed URL)';
COMMENT ON COLUMN training_files.scaffolding_distribution IS 'JSON object with persona/arc/topic counts: {personas: {key: count}, emotional_arcs: {key: count}, training_topics: {key: count}}';
`;

async function runMigration() {
  console.log('🚀 Starting migration: create-training-files-table...\n');

  try {
    // Execute migration using raw SQL
    const { error } = await supabase.rpc('exec', { sql: migrationSQL });

    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!\n');
    
    // Verify tables were created
    console.log('📋 Verifying tables...');
    const { data: trainingFilesTable, error: verifyError1 } = await supabase
      .from('training_files')
      .select('*')
      .limit(0);
    
    const { data: conversationsTable, error: verifyError2 } = await supabase
      .from('training_file_conversations')
      .select('*')
      .limit(0);

    if (verifyError1 || verifyError2) {
      console.error('❌ Verification failed:', verifyError1 || verifyError2);
      process.exit(1);
    }

    console.log('✅ Verified: training_files table exists');
    console.log('✅ Verified: training_file_conversations table exists');
    
    console.log('\n🎉 Migration complete! Tables are ready to use.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run migration
runMigration();

