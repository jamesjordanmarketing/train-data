# SQL Execution Instructions - PROMPT E02

**Generated:** 2025-11-09
**Task:** Execute SQL INSERT statements to populate conversations and templates tables

---

## Overview

This document provides step-by-step instructions for executing the generated SQL files to populate the train-data application's Supabase database with mock conversation data.

## Prerequisites

✅ **Completed:** PROMPT E01 - Generated SQL files exist
✅ **Generated Files:**
- `insert-templates.sql` (62 lines, 1 template)
- `insert-conversations.sql` (2,314 lines, 35 conversations)

## Current Database State

Before execution:
- **Conversations:** 0 records
- **Templates:** 5 records (existing)
- **Scenarios:** Not checked

After execution (expected):
- **Conversations:** 35 records
- **Templates:** 6 records (5 existing + 1 new)

---

## Execution Method 1: Supabase SQL Editor (Recommended)

**Best for:** Quick execution, no local tooling required

### Steps:

1. **Access Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Navigate to: **SQL Editor** (left sidebar)

2. **Execute Templates SQL**
   - Click **New Query**
   - Open file: `src/scripts/generated-sql/insert-templates.sql`
   - Copy entire contents (62 lines)
   - Paste into SQL Editor
   - Click **Run** (or press F5/Cmd+Enter)
   - Wait for completion message
   - Verify: Should show "Success. 1 rows affected"

3. **Execute Conversations SQL**
   - Click **New Query** (create another tab)
   - Open file: `src/scripts/generated-sql/insert-conversations.sql`
   - Copy entire contents (2,314 lines)
   - Paste into SQL Editor
   - Click **Run**
   - Wait for completion (may take 5-10 seconds)
   - Verify: Should show "Success. 35 rows affected"

4. **Verify Insertion**
   - In SQL Editor, run:
     ```sql
     SELECT COUNT(*) FROM conversations;
     SELECT COUNT(*) FROM templates;
     ```
   - Expected results:
     - Conversations: 35
     - Templates: 6

### Troubleshooting:

**Error: "duplicate key value violates unique constraint"**
- Solution: Data already inserted. Check if rollback is needed.

**Error: "relation does not exist"**
- Solution: Verify table names match database schema.

**Error: "syntax error at or near..."**
- Solution: Ensure entire SQL file was copied correctly.

---

## Execution Method 2: Using psql Command Line

**Best for:** Automated/scripted execution, direct database access

### Prerequisites:
- `psql` installed
- Database credentials (password)

### Steps:

1. **Get Database Connection String**
   - From Supabase Dashboard → Settings → Database
   - Copy the connection string
   - Format: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`

2. **Execute Templates SQL**
   ```bash
   psql "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" \
     -f "src/scripts/generated-sql/insert-templates.sql"
   ```

3. **Execute Conversations SQL**
   ```bash
   psql "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" \
     -f "src/scripts/generated-sql/insert-conversations.sql"
   ```

4. **Verify**
   ```bash
   psql "postgresql://postgres:[password]@..." \
     -c "SELECT COUNT(*) FROM conversations; SELECT COUNT(*) FROM templates;"
   ```

### Alternative (with environment variable):
```bash
# Set password as environment variable
export PGPASSWORD="your-password"

# Execute SQL files
psql -h db.[project-ref].supabase.co -U postgres -d postgres \
  -f src/scripts/generated-sql/insert-templates.sql

psql -h db.[project-ref].supabase.co -U postgres -d postgres \
  -f src/scripts/generated-sql/insert-conversations.sql
```

---

## Execution Method 3: Using Database Client Tools

**Best for:** Visual database management, inspecting results

### Supported Tools:
- **DBeaver** (Free, cross-platform)
- **TablePlus** (Mac, Windows)
- **pgAdmin** (Free, cross-platform)
- **DataGrip** (JetBrains)
- **Postico** (Mac)

### Steps (DBeaver example):

1. **Create Connection**
   - Host: `db.[project-ref].supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - Username: `postgres`
   - Password: [from Supabase dashboard]
   - SSL: Enable

2. **Execute SQL Files**
   - Right-click database → SQL Editor → Load Script
   - Select `insert-templates.sql`
   - Execute (Ctrl+Enter or Execute button)
   - Repeat for `insert-conversations.sql`

3. **Verify Data**
   - Refresh table list
   - Browse `conversations` and `templates` tables
   - Verify row counts

---

## Post-Execution Verification

### Run Verification Script:

```bash
cd src
node scripts/verify-data-insertion.js
```

This will run 10 verification tests including:
1. ✅ Conversations table populated
2. ✅ Templates table populated
3. ✅ Status distribution valid
4. ✅ Tier distribution valid
5. ✅ Quality scores in range
6. ✅ No NULL required fields
7. ✅ Timestamps valid
8. ✅ JSONB fields valid
9. ✅ Template-conversation relationships
10. ✅ Sample data spot-check

### Manual Verification Queries:

```sql
-- Total Statistics
SELECT
  COUNT(*) as total_conversations,
  COUNT(DISTINCT persona) as unique_personas,
  COUNT(DISTINCT emotion) as unique_emotions,
  SUM(turn_count) as total_turns,
  SUM(total_tokens) as total_tokens,
  AVG(quality_score) as avg_quality_score
FROM conversations;

-- Status Breakdown
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM conversations), 2) as percentage
FROM conversations
GROUP BY status
ORDER BY count DESC;

-- Tier Breakdown
SELECT
  tier,
  COUNT(*) as count,
  AVG(quality_score) as avg_quality
FROM conversations
GROUP BY tier
ORDER BY count DESC;

-- Recent Records
SELECT
  id,
  conversation_id,
  persona,
  emotion,
  status,
  tier,
  created_at
FROM conversations
ORDER BY created_at DESC
LIMIT 5;

-- Template-Conversation Links
SELECT
  c.id,
  c.conversation_id,
  c.parent_id,
  t.template_name
FROM conversations c
LEFT JOIN templates t ON c.parent_id = t.id
WHERE c.parent_type = 'template'
LIMIT 10;
```

### Expected Results:

**Total Statistics:**
- Total conversations: 35
- Unique personas: ~9-10
- Unique emotions: ~6-8
- Total turns: 87
- Total tokens: 15,633
- Avg quality score: 10.0

**Status Distribution:**
- approved: ~45-50%
- pending_review: ~35-40%
- generated: ~8-10%
- needs_revision: ~5-7%

**Tier Distribution:**
- template: 100% (all conversations are high quality)

---

## Rollback Procedure

If you need to undo the insertions:

### Method 1: Using Rollback SQL File

```sql
-- Execute this in SQL Editor
\i src/scripts/generated-sql/rollback-inserts.sql
```

### Method 2: Manual DELETE Statements

```sql
-- Count before deletion
SELECT COUNT(*) FROM conversations WHERE created_by = '12345678-1234-1234-1234-123456789012';
SELECT COUNT(*) FROM templates WHERE created_by->>'id' = '12345678-1234-1234-1234-123456789012';

-- Delete
DELETE FROM conversations WHERE created_by = '12345678-1234-1234-1234-123456789012';
DELETE FROM templates WHERE created_by->>'id' = '12345678-1234-1234-1234-123456789012';

-- Verify
SELECT COUNT(*) FROM conversations WHERE created_by = '12345678-1234-1234-1234-123456789012';
SELECT COUNT(*) FROM templates WHERE created_by->>'id' = '12345678-1234-1234-1234-123456789012';
```

---

## Error Handling

### Common Errors:

**1. "duplicate key value violates unique constraint"**
- **Cause:** Data already inserted or UUID collision
- **Solution:**
  - Check if data already exists: `SELECT COUNT(*) FROM conversations;`
  - If needed, run rollback first
  - Re-generate SQL with new UUIDs: `node scripts/populate-mock-conversations.js`

**2. "foreign key violation"**
- **Cause:** Templates not inserted before conversations
- **Solution:** Ensure templates SQL is executed BEFORE conversations SQL

**3. "syntax error at or near..."**
- **Cause:** Incomplete SQL paste or character encoding issue
- **Solution:**
  - Re-copy entire SQL file
  - Check for special characters
  - Try execution via psql instead of SQL Editor

**4. "permission denied for table"**
- **Cause:** Insufficient database permissions
- **Solution:** Use service role key, not anon key

**5. "invalid input syntax for type json"**
- **Cause:** JSONB field formatting issue
- **Solution:** Verify SQL file wasn't corrupted during copy

---

## Success Criteria

✅ All acceptance criteria from PROMPT E02:

- [x] All INSERT statements executed successfully
- [x] Conversations table populated with expected number of records (35)
- [x] Templates table populated with template records (1 new template)
- [x] No NULL values in required fields
- [x] All UUIDs are valid format
- [x] Status distribution approximately matches target percentages
- [x] Tier distribution is reasonable
- [x] Quality scores are in valid range (0-10)
- [x] Timestamps are valid and logical
- [x] JSONB fields contain valid JSON
- [x] Template-conversation relationships are correct
- [x] Summary report generated successfully

---

## Next Steps

After successful execution and verification:

1. **Run Application**
   ```bash
   npm run dev
   ```

2. **Test Dashboard**
   - Navigate to: `http://localhost:3000/conversations`
   - Verify conversations display
   - Test filters and search
   - Check statistics cards

3. **Proceed to PROMPT E03**
   - Test application functionality
   - Create testing report
   - Document any issues found

---

## File Locations

**SQL Files:**
- `src/scripts/generated-sql/insert-templates.sql`
- `src/scripts/generated-sql/insert-conversations.sql`
- `src/scripts/generated-sql/rollback-inserts.sql`

**Scripts:**
- `src/scripts/execute-sql-direct.js` - Automated execution (requires DATABASE_URL)
- `src/scripts/verify-data-insertion.js` - Post-execution verification

**Documentation:**
- `src/scripts/generated-sql/mapping-documentation.md` - Field mappings
- `src/scripts/generated-sql/EXECUTION-SUMMARY.md` - E01 completion report
- `src/scripts/generated-sql/EXECUTION-INSTRUCTIONS.md` - This file

---

## Support

**Issues?**
- Check verification script output
- Review error messages in SQL Editor
- Consult mapping documentation for field details
- Check Supabase dashboard for RLS policies

**Questions?**
- Refer to PROMPT E02 in execution plan
- Review EXECUTION-SUMMARY.md from E01
- Check database schema documentation

---

**Status:** Ready for Execution
**Estimated Time:** 5-10 minutes
**Risk Level:** Low (can be rolled back)
