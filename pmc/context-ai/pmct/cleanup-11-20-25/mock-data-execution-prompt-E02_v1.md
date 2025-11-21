
### PROMPT E02: Execute SQL and Populate Database

**Scope:** Execute generated SQL to populate conversations and templates tables
**Dependencies:** Successful completion of PROMPT E01
**Estimated Time:** 15-20 minutes
**Risk Level:** Low
**Output:** Populated database tables with verification queries

You are tasked with executing the generated SQL scripts to populate the train-data application's Supabase database.

## Context

You should have completed PROMPT E01 which generated:
- `src/scripts/generated-sql/insert-conversations.sql`
- `src/scripts/generated-sql/insert-templates.sql`

**Database Access:**
Use the helper script: `node scripts/cursor-db-helper.js sql "SQL HERE"`

**Working Directory:**
`C:\Users\james\Master\BrightHub\BRun\train-data\src`

## Your Tasks

### Task 1: Pre-Execution Validation

Before executing, verify:

1. **Check current table state:**
   ```bash
   node scripts/cursor-db-helper.js sql "SELECT COUNT(*) FROM conversations"
   node scripts/cursor-db-helper.js sql "SELECT COUNT(*) FROM templates"
   node scripts/cursor-db-helper.js sql "SELECT COUNT(*) FROM scenarios"
   ```

2. **Verify SQL files exist:**
   - Check that `scripts/generated-sql/insert-conversations.sql` exists
   - Check that `scripts/generated-sql/insert-templates.sql` exists
   - Verify files are not empty

3. **Review generated SQL:**
   - Open each SQL file
   - Spot-check a few INSERT statements
   - Verify UUID format
   - Check for obvious syntax errors

### Task 2: Execute Conversations Insert

1. **Read the SQL file:**
   ```javascript
   const fs = require('fs');
   const conversationsSql = fs.readFileSync('scripts/generated-sql/insert-conversations.sql', 'utf8');
   ```

2. **Execute via helper script:**

   Since the SQL file may be very large, you'll need to execute it in batches or directly:

   **Option A: Direct file execution (if supported)**
   ```bash
   node scripts/cursor-db-helper.js sql-file scripts/generated-sql/insert-conversations.sql
   ```

   **Option B: Batch execution**
   Split the SQL into batches of 10 INSERT statements and execute each batch:
   ```javascript
   const sqlStatements = conversationsSql.split(';').filter(s => s.trim());
   for (let i = 0; i < sqlStatements.length; i += 10) {
     const batch = sqlStatements.slice(i, i + 10).join(';') + ';';
     // Execute batch
   }
   ```

3. **Create execution script:**

   Create `scripts/execute-sql-inserts.js`:
   ```javascript
   const { execSync } = require('child_process');
   const fs = require('fs');
   const path = require('path');

   async function executeSqlFile(filePath) {
     const sql = fs.readFileSync(filePath, 'utf8');
     const statements = sql.split(';').filter(s => s.trim().length > 0);

     console.log(`Executing ${statements.length} statements from ${filePath}`);

     let successCount = 0;
     let failCount = 0;

     for (let i = 0; i < statements.length; i++) {
       try {
         const stmt = statements[i].trim() + ';';
         execSync(`node scripts/cursor-db-helper.js sql "${stmt.replace(/"/g, '\\"')}"`, {
           cwd: process.cwd(),
           stdio: 'pipe'
         });
         successCount++;
         if ((i + 1) % 10 === 0) {
           console.log(`Progress: ${i + 1}/${statements.length}`);
         }
       } catch (error) {
         console.error(`Failed statement ${i + 1}:`, error.message);
         failCount++;
       }
     }

     console.log(`\nComplete: ${successCount} succeeded, ${failCount} failed`);
   }

   async function main() {
     console.log('Starting database population...\n');

     // Execute conversations
     await executeSqlFile('scripts/generated-sql/insert-conversations.sql');

     // Execute templates
     await executeSqlFile('scripts/generated-sql/insert-templates.sql');

     console.log('\nDatabase population complete!');
   }

   main().catch(console.error);
   ```

4. **Run the execution script:**
   ```bash
   node scripts/execute-sql-inserts.js
   ```

### Task 3: Verify Data Insertion

After execution, run verification queries:

1. **Count records:**
   ```sql
   SELECT COUNT(*) as total FROM conversations;
   SELECT COUNT(*) as total FROM templates;
   ```

2. **Check status distribution:**
   ```sql
   SELECT status, COUNT(*) as count
   FROM conversations
   GROUP BY status
   ORDER BY count DESC;
   ```

3. **Check tier distribution:**
   ```sql
   SELECT tier, COUNT(*) as count
   FROM conversations
   GROUP BY tier
   ORDER BY count DESC;
   ```

4. **Verify quality scores:**
   ```sql
   SELECT
     AVG(quality_score) as avg_quality,
     MIN(quality_score) as min_quality,
     MAX(quality_score) as max_quality
   FROM conversations
   WHERE quality_score IS NOT NULL;
   ```

5. **Check recent records:**
   ```sql
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
   ```

6. **Verify templates:**
   ```sql
   SELECT
     id,
     template_name,
     category,
     tier,
     usage_count,
     is_active
   FROM templates
   LIMIT 5;
   ```

7. **Check template-conversation relationships:**
   ```sql
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

### Task 4: Data Quality Checks

Run these queries to ensure data quality:

1. **Check for NULL required fields:**
   ```sql
   SELECT id, conversation_id
   FROM conversations
   WHERE persona IS NULL OR emotion IS NULL OR tier IS NULL;
   ```

2. **Verify UUID format:**
   ```sql
   SELECT id, conversation_id
   FROM conversations
   WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
   LIMIT 5;
   ```

3. **Check timestamp validity:**
   ```sql
   SELECT id, created_at, updated_at
   FROM conversations
   WHERE created_at > updated_at
   LIMIT 5;
   ```

4. **Verify JSONB fields:**
   ```sql
   SELECT id,
     jsonb_typeof(parameters) as params_type,
     jsonb_typeof(review_history) as review_type
   FROM conversations
   LIMIT 5;
   ```

### Task 5: Create Summary Report

Generate a summary report showing:

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

-- Template Statistics
SELECT
  COUNT(*) as total_templates,
  COUNT(*) FILTER (WHERE is_active = true) as active_templates,
  AVG(usage_count) as avg_usage_count
FROM templates;
```

Save the output to: `scripts/generated-sql/population-summary.txt`

## Acceptance Criteria

✅ All INSERT statements executed successfully
✅ Conversations table populated with expected number of records
✅ Templates table populated with template records
✅ No NULL values in required fields
✅ All UUIDs are valid format
✅ Status distribution approximately matches target percentages
✅ Tier distribution is reasonable
✅ Quality scores are in valid range (0-10)
✅ Timestamps are valid and logical
✅ JSONB fields contain valid JSON
✅ Template-conversation relationships are correct
✅ Summary report generated successfully

## Deliverables

1. **Execution Script:**
   - File: `scripts/execute-sql-inserts.js`
   - Successfully executes all SQL inserts

2. **Verification Results:**
   - All verification queries run successfully
   - Results documented in `scripts/generated-sql/verification-results.md`

3. **Summary Report:**
   - File: `scripts/generated-sql/population-summary.txt`
   - Contains all statistics and breakdowns

4. **Rollback Script (Optional but Recommended):**
   - File: `scripts/generated-sql/rollback-inserts.sql`
   - Contains DELETE statements to remove inserted data if needed:
     ```sql
     DELETE FROM conversations WHERE created_by = 'YOUR_MOCK_USER_UUID';
     DELETE FROM templates WHERE created_by->>'id' = 'YOUR_MOCK_USER_UUID';
     ```

## Error Handling

If errors occur during execution:

1. **Duplicate Key Errors:**
   - Check for duplicate UUIDs in generated SQL
   - Re-run generation script with fresh UUIDs

2. **Foreign Key Errors:**
   - Verify templates are inserted before conversations that reference them
   - Check that parent_id references exist

3. **Data Type Errors:**
   - Verify JSONB fields are properly formatted
   - Check that numeric fields contain valid numbers

4. **Constraint Violations:**
   - Check enum values (status, tier) match allowed values
   - Verify required fields are not NULL

## Rollback Procedure

If you need to rollback:

```sql
-- Count records before deletion
SELECT COUNT(*) FROM conversations;
SELECT COUNT(*) FROM templates;

-- Delete inserted records
DELETE FROM conversations WHERE created_by = 'YOUR_MOCK_USER_UUID';
DELETE FROM templates WHERE created_by->>'id' = 'YOUR_MOCK_USER_UUID';

-- Verify deletion
SELECT COUNT(*) FROM conversations;
SELECT COUNT(*) FROM templates;
```
