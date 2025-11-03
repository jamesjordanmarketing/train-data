-- E05 Table Structure Verification
-- Run this in Supabase SQL Editor to verify export_logs table implementation

-- 1. Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'export_logs'
) AS table_exists;

-- 2. Get table structure (columns, data types, constraints)
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'export_logs'
ORDER BY ordinal_position;

-- 3. Get indexes
SELECT 
  indexname, 
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' AND tablename = 'export_logs'
ORDER BY indexname;

-- 4. Get RLS policies
SELECT 
  tablename, 
  policyname, 
  cmd, 
  qual, 
  with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'export_logs'
ORDER BY policyname;

-- 5. Check if RLS is enabled
SELECT 
  tablename, 
  rowsecurity AS rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'export_logs';

-- 6. Get constraints (PRIMARY KEY, FOREIGN KEY, CHECK, UNIQUE)
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'export_logs'::regclass
ORDER BY contype, conname;

-- 7. Get foreign key relationships
SELECT
  tc.constraint_name,
  tc.table_name AS from_table,
  kcu.column_name AS from_column,
  ccu.table_name AS to_table,
  ccu.column_name AS to_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'export_logs'
  AND tc.table_schema = 'public';

-- 8. Check for any data in the table (count)
SELECT COUNT(*) AS row_count FROM export_logs;

-- 9. Get sample data (if any exists)
SELECT * FROM export_logs LIMIT 3;

