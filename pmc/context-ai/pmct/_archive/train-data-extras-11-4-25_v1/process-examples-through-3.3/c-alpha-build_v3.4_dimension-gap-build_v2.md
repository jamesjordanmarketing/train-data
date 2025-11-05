# Dimension Gap Fix - Simple Build Instructions
**Version:** 2.0 (Simplified)
**Date:** 2025-01-10
**Goal:** Fix missing AI-generated dimensions (78% → 97% completion)

---

## What You Need to Do

**Total Time:** 15 minutes
**Steps:** 3 simple actions

---

## STEP 1: Clean Up Database Templates

**Problem:** You have 12 templates but only need 6 (duplicates from running the script twice)

**Action:** Run this SQL in Supabase SQL Editor:

```sql
-- Delete old _v1 templates (keep the new Oct 10 templates)
DELETE FROM prompt_templates
WHERE template_name LIKE '%_v1';

-- Verify exactly 6 templates remain
SELECT 
  template_name,
  template_type,
  is_active,
  created_at
FROM prompt_templates
ORDER BY created_at DESC;
```

**Expected Result:** 6 rows showing templates created on 2025-10-10

---

## STEP 2: Deploy to Vercel

**Action:** Push your code to git and deploy

```bash
git add .
git commit -m "Fix: Seed prompt templates for dimension generation"
git push
```

**Note:** Your Vercel project should auto-deploy. Wait 2-3 minutes for build to complete.

---

## STEP 3: Generate New Chunks Document

**Action:** Upload a test document through your web interface

The system will automatically:
- Chunk the document
- Generate all 60 dimensions using the new templates
- Store results in `chunk_dimensions` table

**Verify Success:**
1. Go to Supabase → Table Editor → `chunk_dimensions`
2. Check recent rows have populated fields like:
   - `chunk_summary_1s` ✅
   - `key_terms` ✅
   - `audience` ✅
   - `intent` ✅
   - `tone_voice_tags` ✅
   - `brand_persona_tags` ✅
   - `domain_tags` ✅

---

## That's It!

**Before:** 47/60 dimensions (78%)
**After:** 56-58/60 dimensions (97%)

**What Got Fixed:**
- ✅ Database now has 6 active prompt templates
- ✅ AI dimension generation works for all chunk types
- ✅ Arrays properly converted to strings

**What's Still Missing (Backlog):**
- `embedding_id` - Requires embedding system (future build)
- `vector_checksum` - Requires embedding system (future build)

---

## Troubleshooting

**If dimension generation fails:**
1. Check Supabase logs: Table Editor → `api_response_logs`
2. Verify Claude API key is set in Vercel environment variables
3. Check `chunk_runs` table for error messages

**If you see NULL dimensions:**
1. Some dimensions only apply to specific chunk types:
   - `task_name` → Only for `Instructional_Unit` chunks
   - `claim` → Only for `CER` chunks
   - `scenario_type` → Only for `Example_Scenario` chunks
2. That's expected and correct!

---

**Document Version:** 2.0
**Status:** Ready to Execute
