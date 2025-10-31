# Export Logs Table Migration Reference

## Overview

This document describes the `export_logs` table migration that should already be executed in your Supabase database. The actual migration SQL has been run as part of the database setup instructions mentioned in the main prompt.

## Migration Details

**Migration Name**: `create_export_logs_table`  
**Purpose**: Create the export_logs table for tracking export operations  
**Status**: Should be executed prior to implementing the Export Service Layer

## Expected Table Structure

The `export_logs` table should have been created with the following SQL:

```sql
-- Create export_logs table
CREATE TABLE IF NOT EXISTS public.export_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  export_id UUID UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('json', 'jsonl', 'csv', 'markdown')),
  config JSONB NOT NULL,
  conversation_count INTEGER NOT NULL CHECK (conversation_count >= 0),
  file_size BIGINT CHECK (file_size >= 0),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'expired')),
  file_url TEXT,
  expires_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_export_logs_user_id ON public.export_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_export_logs_timestamp ON public.export_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_export_logs_status ON public.export_logs(status);
CREATE INDEX IF NOT EXISTS idx_export_logs_format ON public.export_logs(format);
CREATE INDEX IF NOT EXISTS idx_export_logs_expires_at ON public.export_logs(expires_at);

-- Enable Row Level Security
ALTER TABLE public.export_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can select their own exports
CREATE POLICY "Users can select own exports"
  ON public.export_logs
  FOR SELECT
  TO public
  USING (user_id = auth.uid());

-- RLS Policy: Users can insert their own exports
CREATE POLICY "Users can insert own exports"
  ON public.export_logs
  FOR INSERT
  TO public
  WITH CHECK (user_id = auth.uid());

-- RLS Policy: Users can update their own exports
CREATE POLICY "Users can update own exports"
  ON public.export_logs
  FOR UPDATE
  TO public
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_export_logs_updated_at
  BEFORE UPDATE ON public.export_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE public.export_logs IS 'Audit log for all export operations with download links and expiration tracking';
COMMENT ON COLUMN public.export_logs.export_id IS 'Unique export identifier used in URLs and API responses';
COMMENT ON COLUMN public.export_logs.config IS 'Export configuration JSON (scope, format options, filters)';
COMMENT ON COLUMN public.export_logs.expires_at IS 'Timestamp when download link expires (typically 24 hours)';
```

## Verification

To verify the migration was successful, run the verification script:

```bash
# Located at: scripts/verify-export-logs-table.sql
```

Or manually check in Supabase SQL Editor:

```sql
-- Quick verification
SELECT 
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'export_logs' AND table_schema = 'public';

-- Should return: column_count = 14
```

## Rollback (If Needed)

If you need to rollback this migration for any reason:

```sql
-- WARNING: This will delete all export logs!
DROP TABLE IF EXISTS public.export_logs CASCADE;
```

## Next Steps

After verifying the migration:

1. ✅ Run verification script (`scripts/verify-export-logs-table.sql`)
2. ✅ Review verification output
3. ✅ Test service layer (`scripts/test-export-service.ts`)
4. ✅ Integrate with application code

## Dependencies

- **auth.users** table must exist (Supabase built-in)
- **PostgreSQL 12+** with UUID extension
- **Row Level Security (RLS)** enabled in Supabase

## Notes

- The migration uses `IF NOT EXISTS` clauses to prevent errors if run multiple times
- RLS policies ensure data isolation between users
- The `updated_at` column is automatically updated via trigger
- Foreign key constraint ensures referential integrity with users
- Check constraints validate status and format values
- Indexes optimize common query patterns (by user, by date, by status)

---

**Created**: 2025-10-31  
**Status**: Reference Document (Migration should already be executed)

