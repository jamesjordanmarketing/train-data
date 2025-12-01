# Training Files Migration Scripts

This directory contains migration scripts for creating the training files system tables and storage bucket.

---

## Quick Start (Recommended: Manual SQL Paste)

**The simplest and most reliable method is to paste SQL directly into Supabase SQL Editor.**

### Step 1: Create Tables
1. Go to your Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy the entire contents of `01-create-training-files-tables.sql`
4. Paste into the editor
5. Click "Run"
6. Verify: You should see "Success. No rows returned"

### Step 2: Create Storage Bucket
1. In SQL Editor, click "New Query"
2. Copy the entire contents of `02-create-training-files-bucket.sql`
3. Paste into the editor
4. Click "Run"
5. Verify: You should see "Success. No rows returned"

### Step 3: Verify Installation
Run the test script:
```bash
node supa-agent-ops/migrations/test-training-files.js
```

You should see:
```
✅ Database Schema:  PASS
✅ Storage Bucket:   PASS
✅ Service Layer:    PASS
✅ Table Structure:  PASS
```

---

## Alternative: SAOL Scripts (Experimental)

**Note**: The SAOL scripts are currently encountering validation issues with `agentExecuteSQL`. Use the manual SQL paste method above instead.

If you want to try the SAOL approach:

```bash
# Attempt to run migrations via SAOL
node supa-agent-ops/migrations/create-training-files-tables.js
node supa-agent-ops/migrations/setup-training-files-bucket.js
```

---

## Files in This Directory

| File | Purpose | Method |
|------|---------|--------|
| `01-create-training-files-tables.sql` | Create tables, indexes, RLS policies | **Manual paste (recommended)** |
| `02-create-training-files-bucket.sql` | Create storage bucket and policies | **Manual paste (recommended)** |
| `create-training-files-tables.js` | SAOL script for tables | **SAOL (experimental)** |
| `setup-training-files-bucket.js` | SAOL script for bucket | **SAOL (experimental)** |
| `test-training-files.js` | Verification script | **SAOL (works)** |

---

## What Gets Created

### Tables

**`training_files`**
- Main table tracking aggregated training files
- Stores metadata, file paths, quality metrics, scaffolding distribution
- RLS enabled: Users can view all, create/edit own

**`training_file_conversations`**
- Junction table linking conversations to training files
- Unique constraint prevents duplicates
- RLS enabled: Users can view all, add to own files

### Storage Bucket

**`training-files`**
- Private bucket for JSON and JSONL files
- 50MB file size limit
- Restricted to `application/json` and `application/x-ndjson` MIME types
- RLS policies: Authenticated users can upload, read, update

### Indexes

- `idx_training_files_created_by` - Query by creator
- `idx_training_files_status` - Filter by status
- `idx_training_files_created_at` - Sort by creation date
- `idx_training_file_conversations_file_id` - Join performance
- `idx_training_file_conversations_conversation_id` - Reverse lookup

---

## Troubleshooting

### Error: "relation training_files already exists"
**Solution**: Tables already created. This is OK. Run the test script to verify.

### Error: "duplicate key value violates unique constraint"
**Solution**: Bucket already exists. This is OK. Run the test script to verify.

### Error: "permission denied for schema storage"
**Solution**: Ensure you're running as a database admin or using the service role key.

### Test Script Shows "❌ FAIL"
**Solutions**:
1. Check that SQL was run successfully in Supabase
2. Verify `.env.local` has correct credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Check Supabase logs for detailed errors

---

## Next Steps

After successful migration:

1. **Verify Installation**:
   ```bash
   node supa-agent-ops/migrations/test-training-files.js
   ```

2. **Use the API**:
   ```bash
   # Create a training file
   curl -X POST http://localhost:3000/api/training-files \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT" \
     -d '{
       "name": "test_batch_001",
       "conversation_ids": ["uuid-1", "uuid-2"]
     }'
   ```

3. **Check Documentation**:
   - `docs/TRAINING_FILES_QUICK_START.md` - Usage guide
   - `TRAINING_FILES_IMPLEMENTATION_SUMMARY.md` - Full implementation details

---

## Rollback

To remove the training files system:

```sql
-- Drop tables (cascades to related data)
DROP TABLE IF EXISTS training_file_conversations CASCADE;
DROP TABLE IF NOT EXISTS training_files CASCADE;

-- Remove storage bucket (requires no files in bucket)
DELETE FROM storage.objects WHERE bucket_id = 'training-files';
DELETE FROM storage.buckets WHERE id = 'training-files';
```

**Warning**: This will permanently delete all training files and metadata!

