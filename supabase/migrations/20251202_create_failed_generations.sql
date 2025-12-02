-- Create failed_generations table for diagnostic storage
-- Stores failed conversation generations with full diagnostic context
-- Part of: Foundation Layer - Failed Generation Storage & Visibility System

-- Create failed_generations table
CREATE TABLE IF NOT EXISTS failed_generations (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign key relationships (nullable - failures may occur before records created)
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  run_id UUID,
  
  -- Request context (what we sent to Claude)
  prompt TEXT NOT NULL,
  prompt_length INTEGER NOT NULL,
  model TEXT NOT NULL,
  max_tokens INTEGER NOT NULL,
  temperature NUMERIC(3, 2),
  structured_outputs_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Response data (what Claude returned)
  raw_response JSONB NOT NULL,
  response_content TEXT,
  
  -- Diagnostics (from Claude API)
  stop_reason TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  
  -- Failure analysis (our detection)
  failure_type TEXT NOT NULL CHECK (failure_type IN ('truncation', 'parse_error', 'api_error', 'validation_error')),
  truncation_pattern TEXT,
  truncation_details TEXT,
  
  -- Error context (if applicable)
  error_message TEXT,
  error_stack TEXT,
  
  -- Storage reference
  raw_file_path TEXT, -- Path to error report JSON in Supabase Storage
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Scaffolding context (nullable - may not always have scaffolding)
  persona_id UUID REFERENCES personas(id) ON DELETE SET NULL,
  emotional_arc_id UUID REFERENCES emotional_arcs(id) ON DELETE SET NULL,
  training_topic_id UUID REFERENCES training_topics(id) ON DELETE SET NULL,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_failed_generations_failure_type ON failed_generations(failure_type);
CREATE INDEX IF NOT EXISTS idx_failed_generations_stop_reason ON failed_generations(stop_reason);
CREATE INDEX IF NOT EXISTS idx_failed_generations_created_at ON failed_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_failed_generations_truncation_pattern ON failed_generations(truncation_pattern) WHERE truncation_pattern IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_failed_generations_run_id ON failed_generations(run_id) WHERE run_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_failed_generations_conversation_id ON failed_generations(conversation_id) WHERE conversation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_failed_generations_created_by ON failed_generations(created_by);

-- Enable Row Level Security
ALTER TABLE failed_generations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users to read all failed generations
CREATE POLICY "Allow authenticated users to read failed generations"
  ON failed_generations
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policy: Allow service role to insert failed generations
CREATE POLICY "Allow service role to insert failed generations"
  ON failed_generations
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- RLS Policy: Allow authenticated users to insert their own failed generations
CREATE POLICY "Allow authenticated users to insert their own failed generations"
  ON failed_generations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Create storage bucket for failed generation error reports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'failed-generation-files',
  'failed-generation-files',
  false, -- Private bucket
  10485760, -- 10MB limit per file
  ARRAY['application/json']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Allow authenticated users to read error reports
CREATE POLICY "Allow authenticated users to read error reports"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'failed-generation-files');

-- Storage RLS: Allow service role to insert error reports
CREATE POLICY "Allow service role to insert error reports"
  ON storage.objects
  FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'failed-generation-files');

-- Storage RLS: Allow authenticated users to insert error reports
CREATE POLICY "Allow authenticated users to insert error reports"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'failed-generation-files');

-- Comment on table
COMMENT ON TABLE failed_generations IS 'Stores failed conversation generations with full diagnostic context for root cause analysis';

-- Comment on columns
COMMENT ON COLUMN failed_generations.stop_reason IS 'Claude API stop_reason: end_turn, max_tokens, stop_sequence, or tool_use';
COMMENT ON COLUMN failed_generations.failure_type IS 'Type of failure: truncation, parse_error, api_error, or validation_error';
COMMENT ON COLUMN failed_generations.truncation_pattern IS 'Detected truncation pattern (if failure_type = truncation)';
COMMENT ON COLUMN failed_generations.raw_file_path IS 'Path to comprehensive error report JSON in storage bucket';

