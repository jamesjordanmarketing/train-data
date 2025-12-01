-- ============================================================================
-- Validation Script: Check Training Files Installation
-- Purpose: Verify tables, indexes, policies, and bucket were created correctly
-- Instructions: Copy and paste this into Supabase SQL Editor and run
-- ============================================================================

-- Check 1: Verify training_files table exists
SELECT 
  'training_files table' as check_name,
  CASE WHEN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'training_files'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- Check 2: Verify training_file_conversations table exists
SELECT 
  'training_file_conversations table' as check_name,
  CASE WHEN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'training_file_conversations'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- Check 3: Count columns in training_files
SELECT 
  'training_files columns' as check_name,
  COUNT(*)::text || ' columns' as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'training_files';

-- Check 4: List all columns in training_files
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'training_files'
ORDER BY ordinal_position;

-- Check 5: Verify indexes exist
SELECT 
  'Indexes on training_files' as check_name,
  COUNT(*)::text || ' indexes' as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename = 'training_files';

-- Check 6: List all indexes
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('training_files', 'training_file_conversations')
ORDER BY tablename, indexname;

-- Check 7: Verify RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('training_files', 'training_file_conversations');

-- Check 8: List RLS policies
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('training_files', 'training_file_conversations')
ORDER BY tablename, policyname;

-- Check 9: Verify storage bucket exists
SELECT 
  'training-files bucket' as check_name,
  CASE WHEN EXISTS (
    SELECT FROM storage.buckets 
    WHERE id = 'training-files'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- Check 10: Storage bucket details
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'training-files';

-- Check 11: Storage policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%training files%'
ORDER BY policyname;

-- ============================================================================
-- Summary Check
-- ============================================================================

-- Final summary
SELECT 
  '=== INSTALLATION SUMMARY ===' as summary,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('training_files', 'training_file_conversations')
    ) = 2 
    AND (
      SELECT COUNT(*) 
      FROM storage.buckets 
      WHERE id = 'training-files'
    ) = 1
    THEN '✅ ALL CHECKS PASSED - System Ready'
    ELSE '❌ INCOMPLETE - Review output above'
  END as status;

