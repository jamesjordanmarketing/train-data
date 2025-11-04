# E09/E10 Quick Start Guide - Safe Execution

**Date**: November 2, 2025
**Audit Status**: ✅ COMPLETE - No conflicts detected
**Ready to Execute**: YES

---

## 🚀 3-Step Execution (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click **"SQL Editor"** in left sidebar
3. Click **"New Query"** button

### Step 2: Copy & Paste Safe SQL
1. Open file: `pmc/product/_mapping/fr-maps/E09-E10-SAFE-SQL.sql`
2. **Copy entire file** (Ctrl+A, Ctrl+C)
3. **Paste into SQL Editor** (Ctrl+V)

### Step 3: Execute & Verify
1. Click **"Run"** button (or press Ctrl+Enter)
2. Wait 5-10 seconds for execution
3. Check Messages panel for ✅ confirmations
4. Verify final output shows all green checkmarks

**DONE!** ✅

---

## ✅ Expected Output (Success)

You should see these messages in the output:

```
✅ Added column: conversations.parent_chunk_id
✅ Added column: conversations.chunk_context
✅ Added column: conversations.dimension_source
✅ Index created/verified: idx_conversations_parent_chunk_id
✅ Index created/verified: idx_conversations_dimension_source
✅ Column comments added
✅ View created/replaced: orphaned_conversations
✅ Function created/replaced: get_conversations_by_chunk
✅ VERIFICATION: All 3 columns exist in conversations table
✅ VERIFICATION: All 2 indexes exist
✅ VERIFICATION: View orphaned_conversations exists
✅ VERIFICATION: Function get_conversations_by_chunk exists
🎉 E09 CHUNKS-ALPHA INTEGRATION COMPLETE
```

---

## ❌ What NOT to Do

**DON'T** run these (they will conflict):
- ❌ Original E09 SQL (lines 177-235 in `04-FR-wireframes-execution-E09.md`)
- ❌ E10 Prompt 8 (in `04-FR-wireframes-execution-E10-DATABASE-NORMALIZATION.md`)

**DO** run this:
- ✅ `E09-E10-SAFE-SQL.sql` (the safe, idempotent version)

---

## 🧪 Quick Test After Execution

Run this query in SQL Editor to verify:

```sql
-- Should return 3 rows showing the new columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'conversations'
  AND column_name IN ('parent_chunk_id', 'chunk_context', 'dimension_source')
ORDER BY column_name;
```

Expected result:
```
chunk_context      | text
dimension_source   | jsonb
parent_chunk_id    | uuid
```

---

## 🔧 If Something Goes Wrong

**If you see errors**, most likely:

1. **"relation 'chunks' does not exist"**
   - Cause: chunks table not created yet
   - Fix: Create chunks table first, then re-run

2. **"column already exists"**
   - Cause: Already ran this before
   - Fix: This is actually OK! Script handles this gracefully
   - The script will show ⚠️ warnings but continue

3. **"permission denied"**
   - Cause: Not using service role key
   - Fix: Make sure you're logged into Supabase dashboard as owner

**Need to start over?** See rollback script in the detailed execution file.

---

## 📋 Files Reference

| File | Purpose | Location |
|------|---------|----------|
| **Safe SQL** | Execute this | `pmc/product/_mapping/fr-maps/E09-E10-SAFE-SQL.sql` |
| **Detailed Guide** | Full instructions | `pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-catch-up_v3.md` |
| **Audit Script** | Re-check database | `src/scripts/audit-e09-e10-conflicts.js` |
| **Audit Results** | Current state | `e09-e10-conflict-audit-results.json` |

---

## 🎯 What Gets Created

**3 Columns** on `conversations` table:
- `parent_chunk_id` (UUID) - Links to chunks table
- `chunk_context` (TEXT) - Cached chunk content
- `dimension_source` (JSONB) - Chunk metadata

**2 Indexes**:
- `idx_conversations_parent_chunk_id` - Fast chunk lookups
- `idx_conversations_dimension_source` - Fast JSONB queries

**1 View**:
- `orphaned_conversations` - Find conversations with invalid chunk references

**1 Function**:
- `get_conversations_by_chunk(uuid, boolean)` - Get all conversations for a chunk

---

## ⏱️ Time Estimate

- SQL execution: 5-10 seconds
- Verification: 1-2 minutes
- Total: **Under 5 minutes**

---

## ✅ Success Criteria

You're done when:
- [ ] SQL executed without errors
- [ ] All ✅ messages appeared in output
- [ ] Test query returns 3 rows
- [ ] No ❌ or errors in Messages panel

---

**Questions?** See the detailed guide: `04-FR-wireframes-execution-catch-up_v3.md`
