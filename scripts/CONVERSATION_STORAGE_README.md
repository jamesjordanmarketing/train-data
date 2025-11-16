# Conversation Storage Database Setup

Quick setup guide for the Conversation Storage Service database foundation.

## Prerequisites

- ✅ SAOL installed (`supa-agent-ops@1.2.0`)
- ✅ Environment variables in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `DATABASE_URL`

## Quick Setup

Run all setup scripts in order:

```bash
# 1. Setup database tables (adds missing columns)
node scripts/setup-conversation-storage-db.js

# 2. Create performance indexes
node scripts/setup-conversation-indexes.js

# 3. Enable RLS and create policies
node scripts/setup-conversation-rls.js

# 4. Create storage bucket
node scripts/setup-conversation-storage-bucket.js

# 5. Verify setup
node scripts/verify-conversation-storage-setup.js
```

## Expected Output

Each script should complete successfully:

```
✅ All database setup tasks completed successfully
✅ Index setup completed
✅ RLS setup completed successfully
✅ Storage bucket setup verification complete
✅ ALL VERIFICATION CHECKS PASSED
```

## What Gets Created

### Database Tables (Updated)
- `conversations` table: +27 columns (file storage, quality scores, metadata)
- `conversation_turns` table: +7 columns (emotions, strategies, metrics)

### Indexes (34 total)
- 10 new indexes on `conversations` table
- 3 new indexes on `conversation_turns` table
- Optimized for filtering, sorting, and joins

### RLS Policies (12 total)
- 4 policies on `conversations` (SELECT, INSERT, UPDATE, DELETE)
- 2 policies on `conversation_turns` (SELECT, INSERT)
- All enforce user ownership via `created_by` column

### Storage Bucket
- Bucket: `conversation-files`
- Private (authentication required)
- 10MB file size limit
- JSON files only

## Manual Steps Required

### Create Storage RLS Policies

Go to **Supabase Dashboard > Storage > Policies > conversation-files** and create 4 policies:

1. **INSERT** (Users can upload to own folder):
   ```sql
   (bucket_id = 'conversation-files' AND 
    (storage.foldername(name))[1] = auth.uid()::text)
   ```

2. **SELECT** (Users can read from own folder):
   ```sql
   (bucket_id = 'conversation-files' AND 
    (storage.foldername(name))[1] = auth.uid()::text)
   ```

3. **UPDATE** (Users can update their own files):
   ```sql
   (bucket_id = 'conversation-files' AND 
    (storage.foldername(name))[1] = auth.uid()::text)
   ```

4. **DELETE** (Users can delete their own files):
   ```sql
   (bucket_id = 'conversation-files' AND 
    (storage.foldername(name))[1] = auth.uid()::text)
   ```

## Troubleshooting

### "Column does not exist" error
Ensure referenced tables exist: `personas`, `emotional_arcs`, `training_topics`, `prompt_templates`

### "Index already exists" warnings
This is normal - script skips existing indexes automatically.

### Environment variables not set
```bash
# Verify environment variables
node -e "require('dotenv').config({ path: '.env.local' }); console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');"
```

## Full Documentation

See `docs/conversation-storage-setup-guide.md` for comprehensive documentation.

## Support

- SAOL Docs: `supa-agent-ops/saol-agent-quick-start-guide_v1.md`
- Verification: `node scripts/verify-conversation-storage-setup.js`
- Supabase Dashboard: Check for errors and verify setup

---

**Setup Time:** ~10 minutes  
**Risk Level:** Low-Medium  
**SAOL Version:** 1.2.0

