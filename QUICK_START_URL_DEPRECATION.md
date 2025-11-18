# Quick Start: URL Deprecation Migration

## 🚀 Run This Now (5 Minutes)

### Step 1: Run Migration (Choose One)

#### Option A: Supabase Dashboard (Easiest)

1. Open Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy and paste this:

```sql
-- Migration: Deprecate URL Storage Columns
-- Date: 2025-11-18
-- Purpose: Remove stored URLs, keep only file paths for on-demand signed URL generation

BEGIN;

-- Clear all stored URLs (they're expired anyway)
UPDATE conversations SET 
  file_url = NULL,
  raw_response_url = NULL
WHERE file_url IS NOT NULL OR raw_response_url IS NOT NULL;

-- Add comments documenting why these columns are deprecated
COMMENT ON COLUMN conversations.file_url IS 
  'DEPRECATED (2025-11-18): Signed URLs expire after 1 hour. Use file_path and generate signed URLs on-demand via ConversationStorageService.getPresignedDownloadUrl()';

COMMENT ON COLUMN conversations.raw_response_url IS 
  'DEPRECATED (2025-11-18): Signed URLs expire after 1 hour. Use raw_response_path and generate signed URLs on-demand via ConversationStorageService.getPresignedDownloadUrl()';

-- Add comments documenting correct usage
COMMENT ON COLUMN conversations.file_path IS 
  'Storage path relative to conversation-files bucket. Used to generate signed URLs on-demand. Example: "00000000-0000-0000-0000-000000000000/abc123.../conversation.json"';

COMMENT ON COLUMN conversations.raw_response_path IS 
  'Storage path for raw Claude response. Used to generate signed URLs on-demand. Example: "raw/00000000-0000-0000-0000-000000000000/abc123.json"';

COMMIT;
```

4. Click "Run"
5. Expected result: "Success. No rows returned"

#### Option B: Supabase CLI

```bash
npx supabase migration up
```

### Step 2: Verify Migration

Copy and paste this in Supabase SQL Editor:

```sql
-- Quick verification
SELECT 
  COUNT(*) FILTER (WHERE file_url IS NOT NULL OR raw_response_url IS NOT NULL) as urls_remaining,
  COUNT(*) FILTER (WHERE file_path IS NOT NULL) as paths_present,
  CASE 
    WHEN COUNT(*) FILTER (WHERE file_url IS NOT NULL OR raw_response_url IS NOT NULL) = 0
    THEN '✅ SUCCESS'
    ELSE '❌ FAILED'
  END as status
FROM conversations;
```

**Expected Result:**
- urls_remaining: 0
- paths_present: > 0
- status: ✅ SUCCESS

### Step 3: Test TypeScript

```bash
npm run type-check
```

**Expected:** No errors

### Step 4: Test Download (Optional)

```bash
# Start dev server
npm run dev

# In browser or curl, replace YOUR_CONVERSATION_ID with real ID:
curl http://localhost:3000/api/conversations/YOUR_CONVERSATION_ID/download
```

**Expected:** JSON response with download_url

## ✅ Done!

Your database now stores file paths only and generates signed URLs on-demand. No more 404 errors!

## 🔍 What Changed?

| Before | After |
|--------|-------|
| Stored `file_url` in database | Store `file_path` only |
| URLs expire after 1 hour | Generate fresh URLs on-demand |
| 404 errors on old URLs | Always valid, fresh URLs |

## 📚 Need More Info?

See `PROMPT2_FILE1_V2_IMPLEMENTATION_SUMMARY.md` for full details.

