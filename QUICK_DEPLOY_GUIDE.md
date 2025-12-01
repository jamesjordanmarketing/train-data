# 🚀 Training Files System - Quick Deploy Guide

**3 steps to deploy. 5 minutes total.**

---

## Step 1: Create Database Tables (2 min)

1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Click **"New Query"**
4. **Copy/Paste** this file:
   ```
   supa-agent-ops/migrations/01-create-training-files-tables.sql
   ```
5. Click **"Run"**
6. ✅ See "Success. No rows returned"

---

## Step 2: Create Storage Bucket (1 min)

1. In SQL Editor, click **"New Query"**
2. **Copy/Paste** this file:
   ```
   supa-agent-ops/migrations/02-create-training-files-bucket.sql
   ```
3. Click **"Run"**
4. ✅ See "Success. No rows returned"

---

## Step 3: Verify Installation (1 min)

Run the test script:

```bash
node supa-agent-ops/migrations/test-training-files.js
```

✅ **Expected Output**:
```
Database Schema:  ✅ PASS
Storage Bucket:   ✅ PASS
Service Layer:    ✅ PASS
Table Structure:  ✅ PASS

✅ All tests passed! System is ready to use.
```

---

## ✅ Done!

Your training files system is now ready to use.

**Test the API**:
```bash
curl -X POST http://localhost:3000/api/training-files \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{
    "name": "test_batch_001",
    "conversation_ids": ["uuid-1", "uuid-2"]
  }'
```

**Full documentation**:
- `supa-agent-ops/migrations/README.md` - Complete migration guide
- `docs/TRAINING_FILES_QUICK_START.md` - API usage guide
- `TRAINING_FILES_IMPLEMENTATION_SUMMARY.md` - Full implementation

---

## ⚠️ Troubleshooting

**Test fails?**
- Check `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
- Verify SQL commands ran successfully
- See `supa-agent-ops/migrations/README.md`

**SQL paste errors?**
- Ensure you're using admin/service role
- Tables may already exist (this is OK)
- Check Supabase project logs

---

**Ready to use in 5 minutes!** 🎉

