-- ============================================================================
-- Migration: Create training-files storage bucket
-- Purpose: Storage bucket for training JSON and JSONL files
-- Instructions: Copy and paste this entire file into Supabase SQL Editor
-- ============================================================================

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'training-files',
  'training-files',
  false,
  52428800,  -- 50MB limit
  ARRAY['application/json', 'application/x-ndjson']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Storage RLS Policies
-- ============================================================================

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can upload training files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read training files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update training files" ON storage.objects;

-- Policy: Users can upload to training-files bucket
CREATE POLICY "Users can upload training files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'training-files'
    AND auth.role() = 'authenticated'
  );

-- Policy: Users can read all training files
CREATE POLICY "Users can read training files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'training-files'
    AND auth.role() = 'authenticated'
  );

-- Policy: Users can update their own files (for upsert)
CREATE POLICY "Users can update training files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'training-files'
    AND auth.role() = 'authenticated'
  );

