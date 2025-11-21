# Mock Data Population Execution Plan v1
**Train-Data Application Database Seeding**

---

## Executive Summary

This execution plan details the process for populating the train-data application's Supabase database with mock conversation data derived from 10 LoRA fine-tuning training conversation JSON files. The plan focuses exclusively on the train-data module features (/conversations, /conversations/review-queue, /conversations/templates) while preserving existing chunks-alpha module data.

**Target Tables:**
- `conversations` - Main training conversation records
- `templates` - Conversation generation templates
- `scenarios` - Scenario definitions

**Data Source:**
- 10 JSON files: `c-alpha-build_v3.4-LoRA-FP-convo-[01-10]-complete.json`
- Located: `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\training-data-seeds\`

**Expected Outcomes:**
- ~40 conversation records (4 turns × 10 conversations)
- ~10 template records (derived from unique conversation patterns)
- ~3-5 scenario records (derived from conversation metadata)
- Fully functional /conversations dashboard with filtering and statistics
- Populated review queue with actionable items
- Templates available for conversation generation

---

## Context and Dependencies

### Database State
**Current State:**
- `conversations` table: **EMPTY** (0 records)
- `templates` table: **HAS STRUCTURE** (columns defined, 0 records)
- `scenarios` table: **EMPTY** (0 records)
- Chunks-alpha tables (chunks, documents, categories, tags): **POPULATED** (existing mock data)

**Database Access:**
- Supabase PostgreSQL database
- Access via helper script: `C:\Users\james\Master\BrightHub\BRun\train-data\src\scripts\cursor-db-helper.js`
- Direct SQL execution: `node cursor-db-helper.js sql "SELECT ..."`

### Codebase Dependencies
**Application Structure:**
- Framework: Next.js 14 with TypeScript
- State Management: Zustand
- Database: Supabase with Row Level Security
- Type Definitions: `src/lib/types/conversations.ts`
- Services: `src/lib/services/conversation-service.ts`

**Key Pages:**
1. `/conversations` - `src/app/(dashboard)/conversations/page.tsx`
2. `/conversations/review-queue` - Review queue (to be implemented/populated)
3. `/conversations/templates` - Templates management (to be implemented/populated)

### Data Schema Reference

**Conversations Table Structure:**
```typescript
interface Conversation {
  id: string;                          // UUID
  conversationId: string;              // Unique identifier

  // Foreign Keys
  documentId?: string;                 // Optional link to document
  chunkId?: string;                    // Optional link to chunk

  // Core Metadata
  title?: string;                      // Conversation title
  persona: string;                     // Required - e.g., "Marcus Thompson - Overwhelmed Avoider"
  emotion: string;                     // Required - e.g., "guilt", "relief"
  topic?: string;                      // e.g., "inheritance planning"
  intent?: string;                     // e.g., "seek permission"
  tone?: string;                       // e.g., "warm, validating"

  // Classification
  tier: 'template' | 'scenario' | 'edge_case';
  status: 'draft' | 'generated' | 'pending_review' | 'approved' | 'rejected' | 'needs_revision' | 'failed';
  category: string[];                  // Array of category tags

  // Quality Metrics
  qualityScore?: number;               // 0-10
  qualityMetrics?: QualityMetrics;     // Detailed quality breakdown
  confidenceLevel?: 'high' | 'medium' | 'low';

  // Stats
  turnCount: number;                   // Number of conversation turns
  totalTokens: number;                 // Total tokens in conversation

  // Cost Tracking
  estimatedCostUsd?: number;
  actualCostUsd?: number;
  generationDurationMs?: number;

  // Approval
  approvedBy?: string;
  approvedAt?: string;
  reviewerNotes?: string;

  // Relationships
  parentId?: string;                   // Parent template/scenario ID
  parentType?: 'template' | 'scenario' | 'conversation';

  // Metadata
  parameters: Record<string, any>;     // JSONB field
  reviewHistory: ReviewAction[];       // Array of review actions

  // Error Handling
  errorMessage?: string;
  retryCount: number;                  // Default 0

  // Audit
  createdAt: string;                   // ISO timestamp
  updatedAt: string;                   // ISO timestamp
  createdBy: string;                   // User ID
}
```

**Templates Table Structure:**
```typescript
interface Template {
  id: string;                          // UUID
  template_name: string;               // Required
  description: string;                 // Required
  category: string;                    // Required
  tier: string;                        // 'template' | 'scenario' | 'edge_case'
  template_text: string;               // The actual prompt template
  structure: string;                   // Template structure description
  variables: object;                   // JSONB - template variables
  tone: string;                        // Desired tone
  complexity_baseline: number;         // 1-10
  style_notes: object;                 // JSONB - optional styling notes
  example_conversation: object;        // JSONB - example conversation
  quality_threshold: object;           // JSONB - quality thresholds
  required_elements: object;           // JSONB - required elements
  applicable_personas: object;         // JSONB - applicable personas
  applicable_emotions: object;         // JSONB - applicable emotions
  applicable_topics: object;           // JSONB - applicable topics
  usage_count: number;                 // Default 0
  rating: number;                      // Average rating
  success_rate: number;                // Success rate %
  version: number;                     // Template version
  is_active: boolean;                  // Active status
  created_at: string;
  updated_at: string;
  created_by: object;                  // JSONB - creator info
  last_modified_by: object;            // JSONB - last modifier
  last_modified: string;
}
```

**Scenarios Table:**
(Schema to be derived from conversations table - similar structure with scenario-specific fields)

---

## Implementation Strategy

### Phase 1: Data Analysis and Mapping
1. Parse all 10 JSON training files
2. Extract conversation metadata and turns
3. Map JSON structure to database schema
4. Identify unique templates and scenarios
5. Generate data transformation logic

### Phase 2: Conversations Table Population
1. Transform training pairs into conversation records
2. Calculate token counts and statistics
3. Set appropriate status values (mix of approved, pending_review, generated)
4. Insert records with proper UUID generation
5. Create associated conversation turns (separate table if exists)

### Phase 3: Templates Table Population
1. Extract unique conversation patterns from training data
2. Create template records based on consultant profiles and response strategies
3. Link templates to generated conversations (parentId)
4. Set usage statistics and quality thresholds

### Phase 4: Scenarios Table Population
1. Identify unique client scenarios from conversation metadata
2. Create scenario records with client personas and emotional contexts
3. Link scenarios to conversations
4. Set scenario parameters and expected outcomes

### Phase 5: Validation and Testing
1. Verify all records inserted successfully
2. Test /conversations page loads with data
3. Verify filtering and search functionality
4. Check statistics calculations
5. Validate review queue population
6. Test templates page functionality

---

## Execution Prompts

The following sections contain complete, copy-paste ready prompts for execution in a fresh 200k Claude-4.5-sonnet Thinking context window in Cursor.

---

### PROMPT E01: Parse Training Data and Generate Transformation Script

**Scope:** Parse 10 JSON training files and create data transformation script
**Dependencies:** Access to training-data-seeds directory, Node.js environment
**Estimated Time:** 45-60 minutes
**Risk Level:** Low
**Output:** JavaScript transformation script that converts JSON to SQL INSERT statements

========================

You are tasked with creating a data transformation script to populate the train-data application's Supabase database with mock conversation data from 10 LoRA training JSON files.

## Context

**Location of JSON Files:**
`C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\training-data-seeds\`

**Files to Process:**
- `c-alpha-build_v3.4-LoRA-FP-convo-01-complete.json`
- `c-alpha-build_v3.4-LoRA-FP-convo-02-complete.json`
- `c-alpha-build_v3.4-LoRA-FP-convo-03-complete.json`
- `c-alpha-build_v3.4-LoRA-FP-convo-04-complete.json`
- `c-alpha-build_v3.4-LoRA-FP-convo-05-complete.json`
- `c-alpha-build_v3.4-LoRA-FP-convo-06-complete.json`
- `c-alpha-build_v3.4-LoRA-FP-convo-07-complete.json`
- `c-alpha-build_v3.4-LoRA-FP-convo-08-complete.json`
- `c-alpha-build_v3.4-LoRA-FP-convo-09-complete.json`
- `c-alpha-build_v3.4-LoRA-FP-convo-10-complete.json`

**Database Access:**
The project has a helper script for database operations:
`C:\Users\james\Master\BrightHub\BRun\train-data\src\scripts\cursor-db-helper.js`

You can execute SQL via:
```bash
node scripts/cursor-db-helper.js sql "YOUR SQL HERE"
```

**Target Tables:**
1. `conversations` - Main conversation records
2. `templates` - Conversation generation templates
3. `scenarios` - Scenario definitions

## Your Tasks

### Task 1: Read and Analyze JSON Structure

Read ONE of the JSON files first (file 01) to understand the structure. Document:
- The structure of `dataset_metadata`
- The structure of `consultant_profile`
- The structure of `training_pairs` array
- How conversation turns are represented
- What metadata is available for extraction

### Task 2: Create Mapping Strategy

Create a mapping document that shows:
- How to map `training_pairs` to `conversations` table fields
- How to extract persona, emotion, topic, intent from the JSON
- How to calculate `turnCount`, `totalTokens`, `qualityScore`
- How to determine appropriate `tier` and `status` values
- How to structure the `parameters` JSONB field
- How to create meaningful `reviewHistory` entries

### Task 3: Develop Transformation Script

Create a Node.js script: `C:\Users\james\Master\BrightHub\BRun\train-data\src\scripts\populate-mock-conversations.js`

The script should:

1. **Import required modules:**
   ```javascript
   const fs = require('fs');
   const path = require('path');
   const { v4: uuidv4 } = require('uuid');
   ```

2. **Read all 10 JSON files** from the training-data-seeds directory

3. **Transform each training_pair into a conversation record:**
   - Generate UUID for `id`
   - Use `training_pair.id` as `conversationId`
   - Extract `persona` from `conversation_metadata.client_persona`
   - Extract `emotion` from `emotional_context.detected_emotions.primary`
   - Set `tier` to 'template' for high quality conversations, 'scenario' for others
   - Set varied `status` values:
     - 40% 'approved'
     - 30% 'pending_review'
     - 20% 'generated'
     - 10% 'needs_revision'
   - Calculate `turnCount` from conversation turns
   - Estimate `totalTokens` (roughly 4 chars = 1 token)
   - Extract `qualityScore` from `training_metadata.quality_score`
   - Build `parameters` object with all metadata
   - Create `title` from conversation topic
   - Set `createdBy` to a mock user UUID
   - Set timestamps appropriately

4. **Generate SQL INSERT statements** for conversations table

5. **Write SQL to output file:** `C:\Users\james\Master\BrightHub\BRun\train-data\src\scripts\generated-sql\insert-conversations.sql`

6. **Generate statistics report:**
   - Total conversations created
   - Breakdown by status
   - Breakdown by tier
   - Average quality score
   - Total tokens

### Task 4: Create Template Extraction Logic

Extend the script to extract unique templates:

1. **Identify unique consultant response strategies** from `response_strategy` fields
2. **Create template records** based on:
   - Consultant profile information
   - Response strategy primary_strategy
   - Core principles and communication style
   - Applicable personas and emotions

3. **Generate template records** with:
   - Unique `id` (UUID)
   - Descriptive `template_name` based on strategy
   - `description` from strategy rationale
   - `category` = consultant expertise area
   - `tier` = 'template'
   - `template_text` = system_prompt from training data
   - `variables` = extract from response_strategy.tactical_choices
   - `applicable_personas` = from consultant profile
   - `applicable_emotions` = from response_strategy

4. **Link conversations to templates** using `parentId` and `parentType='template'`

5. **Write SQL to:** `C:\Users\james\Master\BrightHub\BRun\train-data\src\scripts\generated-sql\insert-templates.sql`

### Task 5: Execution Validation

The script should include:
- Error handling for missing files
- Validation of required fields
- Data type checking
- Duplicate detection
- Summary statistics output to console

## Acceptance Criteria

✅ Script successfully reads all 10 JSON files
✅ Script generates valid SQL INSERT statements for conversations table
✅ All required fields are populated
✅ JSONB fields are properly formatted
✅ UUIDs are properly generated
✅ Timestamps are valid ISO 8601 strings
✅ Status distribution matches specified percentages
✅ Template extraction creates meaningful template records
✅ Templates are properly linked to conversations
✅ Output SQL files are created in generated-sql directory
✅ Script outputs summary statistics
✅ No errors when running the script

## Deliverables

1. **Transformation Script:**
   - File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\scripts\populate-mock-conversations.js`
   - Fully documented with comments
   - Executable with `node scripts/populate-mock-conversations.js`

2. **Generated SQL Files:**
   - `src/scripts/generated-sql/insert-conversations.sql`
   - `src/scripts/generated-sql/insert-templates.sql`
   - Ready for execution via cursor-db-helper

3. **Mapping Documentation:**
   - Markdown file documenting the transformation logic
   - File: `src/scripts/generated-sql/mapping-documentation.md`

4. **Statistics Report:**
   - Console output showing:
     - Total records generated
     - Breakdown by category
     - Data quality metrics
     - Any warnings or issues

## Technical Specifications

**UUID Generation:**
```javascript
const { v4: uuidv4 } = require('uuid');
const newId = uuidv4();
```

**Token Estimation:**
```javascript
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}
```

**Status Distribution:**
```javascript
function assignStatus(index, total) {
  const rand = Math.random();
  if (rand < 0.4) return 'approved';
  if (rand < 0.7) return 'pending_review';
  if (rand < 0.9) return 'generated';
  return 'needs_revision';
}
```

**JSONB Field Formatting:**
Ensure all object fields are properly JSON stringified:
```javascript
parameters: JSON.stringify({
  consultant_persona: consultantProfile,
  emotional_context: emotionalContext,
  response_strategy: responseStrategy
})
```

**SQL Escaping:**
Escape single quotes in text fields:
```javascript
function escapeSql(text) {
  return text.replace(/'/g, "''");
}
```

## Important Notes

1. **User UUID:** Create a consistent mock user UUID for `createdBy` field
2. **Timestamps:** Use actual timestamps with slight variations (spread over last 30 days)
3. **Quality Scores:** Use the quality_score from training_metadata when available
4. **Review History:** Create realistic review history with 1-3 entries for approved conversations
5. **Categories:** Extract from conversation_metadata or consultant_profile
6. **Tone:** Extract from consultant communication_style or response_strategy
7. **Parent Relationships:** Link conversations to templates where appropriate

## Validation Requirements

Before generating SQL:
- Verify all JSON files exist and are readable
- Check that required fields are present in JSON
- Validate UUID format
- Validate timestamp format
- Check for SQL injection vulnerabilities
- Verify JSONB is valid JSON

After generating SQL:
- Count total INSERT statements
- Verify no duplicate IDs
- Check that all foreign keys reference valid records
- Validate that status values are from allowed enum
- Ensure tier values are valid
- Confirm token counts are positive integers

Execute this prompt in a fresh Cursor context with access to the train-data repository.

+++++++++++++++++

---

### PROMPT E02: Execute SQL and Populate Database

**Scope:** Execute generated SQL to populate conversations and templates tables
**Dependencies:** Successful completion of PROMPT E01
**Estimated Time:** 15-20 minutes
**Risk Level:** Low
**Output:** Populated database tables with verification queries

========================

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

Execute this prompt in a fresh Cursor context after completing PROMPT E01.

+++++++++++++++++

---

### PROMPT E03: Test Application and Verify Functionality

**Scope:** Start the application and verify all pages work with populated data
**Dependencies:** Successful completion of PROMPT E02
**Estimated Time:** 30-45 minutes
**Risk Level:** Low
**Output:** Verified working application with functional pages and features

========================

You are tasked with starting the train-data application and verifying that all conversation-related pages function correctly with the newly populated mock data.

## Context

You should have completed PROMPT E02 which populated:
- `conversations` table with training conversation data
- `templates` table with template records

**Application Details:**
- Framework: Next.js 14
- Port: Default 3000 (or next available)
- Working Directory: `C:\Users\james\Master\BrightHub\BRun\train-data`

## Your Tasks

### Task 1: Start the Development Server

1. **Navigate to project directory:**
   ```bash
   cd C:\Users\james\Master\BrightHub\BRun\train-data
   ```

2. **Install dependencies (if needed):**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Verify server starts successfully:**
   - Check console output for "Ready on http://localhost:3000"
   - Note any errors or warnings
   - Confirm build completes without errors

### Task 2: Test /conversations Dashboard Page

Navigate to: `http://localhost:3000/conversations`

**Verify Page Loads:**
- [ ] Page renders without errors
- [ ] No console errors in browser DevTools
- [ ] Loading skeleton shows briefly then content appears

**Verify Dashboard Stats Cards:**
- [ ] "Total Conversations" shows correct count
- [ ] "Approval Rate" shows calculated percentage
- [ ] "Avg Quality Score" shows average quality
- [ ] "Pending Review" shows count of pending items

**Verify Conversation Table:**
- [ ] Table displays conversation records
- [ ] Columns render correctly:
  - Conversation ID
  - Persona
  - Emotion
  - Status badge (with appropriate color)
  - Tier badge
  - Quality Score
  - Turn Count
  - Created Date
  - Actions (view/edit icons)
- [ ] At least 10 conversations visible
- [ ] Pagination controls appear if > 25 records
- [ ] Data matches database records

**Verify Filtering:**
1. **Status Filter:**
   - [ ] Click status filter dropdown
   - [ ] Select "Approved" - table updates to show only approved
   - [ ] Select "Pending Review" - table updates correctly
   - [ ] Clear filter - all conversations return

2. **Tier Filter:**
   - [ ] Click tier filter dropdown
   - [ ] Select "Template" - table updates
   - [ ] Select "Scenario" - table updates
   - [ ] Clear filter

3. **Quality Range Filter:**
   - [ ] Adjust quality score slider
   - [ ] Table filters to matching quality scores
   - [ ] Clear filter

4. **Search:**
   - [ ] Type persona name in search box
   - [ ] Table filters to matching conversations
   - [ ] Type emotion keyword
   - [ ] Table updates dynamically
   - [ ] Clear search

**Verify Conversation Detail Modal:**
- [ ] Click on a conversation row
- [ ] Modal opens displaying conversation details
- [ ] All metadata fields populated correctly
- [ ] Conversation turns display (if implemented)
- [ ] Quality metrics shown
- [ ] Review history visible (if available)
- [ ] Close modal button works

**Verify Bulk Actions:**
- [ ] Select multiple conversations (checkboxes)
- [ ] Bulk actions toolbar appears
- [ ] "Select All" works
- [ ] "Deselect All" works
- [ ] Bulk actions menu shows options

### Task 3: Test Review Queue

Navigate to: `http://localhost:3000/conversations/review-queue`

**Note:** This page may need to be created if it doesn't exist yet.

**If Page Exists:**
- [ ] Page loads without errors
- [ ] Shows only conversations with status "pending_review" or "needs_revision"
- [ ] Queue is sortable by priority/date
- [ ] Review actions available (approve/reject/request changes)

**If Page Doesn't Exist:**
Document this and note it needs implementation. The data is ready for it.

### Task 4: Test Templates Page

Navigate to: `http://localhost:3000/conversations/templates`

**Note:** This page may need to be created if it doesn't exist yet.

**If Page Exists:**
- [ ] Page loads without errors
- [ ] Template list displays
- [ ] Template cards show:
  - Template name
  - Category
  - Description
  - Usage count
  - Active status
- [ ] Can click to view template details
- [ ] Template usage statistics display

**If Page Doesn't Exist:**
Document this and note it needs implementation. The data is ready for it.

### Task 5: Test API Endpoints

Use browser DevTools Network tab or manual API testing:

1. **GET /api/conversations:**
   ```bash
   # Using curl or Postman
   GET http://localhost:3000/api/conversations
   ```
   - [ ] Returns JSON array of conversations
   - [ ] Includes all expected fields
   - [ ] Pagination works if implemented

2. **GET /api/conversations/[id]:**
   - [ ] Returns single conversation detail
   - [ ] Includes all metadata
   - [ ] Returns 404 for invalid ID

3. **GET /api/templates:**
   - [ ] Returns template list
   - [ ] Templates properly formatted

4. **GET /api/conversations/stats:**
   - [ ] Returns statistics object
   - [ ] Stats match dashboard display

### Task 6: Test State Management

**Verify Zustand Store:**
- [ ] Filter selections persist when navigating away and back
- [ ] Selected conversations persist (if applicable)
- [ ] View preferences saved to localStorage
- [ ] Store hydrates correctly on page reload

### Task 7: Performance Testing

**Check Performance:**
- [ ] Page load time < 3 seconds
- [ ] Table rendering smooth with 25+ records
- [ ] Filtering responsive (updates < 500ms)
- [ ] Sorting works efficiently
- [ ] No memory leaks (check DevTools Memory tab)
- [ ] Smooth scrolling on long lists

### Task 8: Data Integrity Verification

**Cross-Reference UI with Database:**

1. **Pick 3 random conversations from UI**
2. **Query database for each:**
   ```sql
   SELECT * FROM conversations WHERE id = 'CONVERSATION_UUID';
   ```
3. **Verify all fields match:**
   - [ ] Persona matches
   - [ ] Emotion matches
   - [ ] Status matches
   - [ ] Quality score matches
   - [ ] Turn count matches
   - [ ] Timestamps match

**Check Template Relationships:**
1. **Find conversations linked to templates (parentType='template')**
2. **Verify parent template exists:**
   ```sql
   SELECT c.conversation_id, c.parent_id, t.template_name
   FROM conversations c
   JOIN templates t ON c.parent_id = t.id
   WHERE c.parent_type = 'template';
   ```
3. **Confirm relationship displays correctly in UI**

### Task 9: Error Handling Testing

**Test Error States:**
- [ ] Disconnect internet - verify offline message
- [ ] Invalid filter combinations - verify graceful handling
- [ ] Database timeout simulation - verify error message
- [ ] Empty result sets - verify "no results" message
- [ ] Malformed query params - verify validation

### Task 10: Create Test Report

Create a comprehensive test report: `pmc/context-ai/pmct/mock-data-testing-report_v1.md`

Include:

**Summary:**
- Date and time of testing
- Application version / commit hash
- Database state (record counts)
- Overall test pass/fail status

**Detailed Results:**
- ✅ Passing tests with evidence
- ❌ Failing tests with screenshots/error messages
- ⚠️ Warnings or issues encountered
- 📝 Notes and observations

**Page-by-Page Results:**
For each page tested:
- Load time
- Errors encountered
- Features working
- Features not working
- Screenshots (key pages)

**Performance Metrics:**
- Average page load time
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

**Data Verification:**
- Sample data spot-checks
- Relationship integrity
- Calculation accuracy

**Recommendations:**
- Issues to fix
- Performance improvements
- Feature enhancements
- Documentation needs

## Acceptance Criteria

✅ Development server starts without errors
✅ /conversations page loads and displays data
✅ Dashboard stats calculations correct
✅ Table displays all conversation records
✅ Filtering functionality works for all filters
✅ Search functionality works
✅ Sorting works (if implemented)
✅ Pagination works (if applicable)
✅ Conversation detail modal works
✅ Review queue accessible (or documented as needed)
✅ Templates page accessible (or documented as needed)
✅ API endpoints return correct data
✅ State management persists correctly
✅ Performance meets acceptable standards
✅ Data integrity verified across UI and database
✅ Error states handled gracefully
✅ Test report created and comprehensive

## Deliverables

1. **Test Report:**
   - File: `pmc/context-ai/pmct/mock-data-testing-report_v1.md`
   - Comprehensive results of all tests
   - Screenshots of key pages
   - Performance metrics

2. **Bug List (if any):**
   - File: `pmc/context-ai/pmct/mock-data-bugs-found_v1.md`
   - List of bugs discovered
   - Steps to reproduce
   - Expected vs actual behavior
   - Severity ratings

3. **Feature Gap Analysis:**
   - File: `pmc/context-ai/pmct/mock-data-feature-gaps_v1.md`
   - Pages that need to be created
   - Features that need implementation
   - Enhancement opportunities

4. **Screenshots:**
   - Directory: `pmc/context-ai/pmct/screenshots/`
   - Dashboard with populated data
   - Table with filters applied
   - Conversation detail modal
   - Any error states encountered

## Troubleshooting Common Issues

### Issue: Page loads but no data displays
**Solution:**
- Check browser console for errors
- Verify API is returning data: `curl http://localhost:3000/api/conversations`
- Check Supabase connection
- Verify RLS policies allow data access

### Issue: "No conversations" empty state shows
**Solution:**
- Query database directly: `SELECT COUNT(*) FROM conversations`
- Check if data filtered out by default filters
- Verify user authentication (conversations may be user-scoped)

### Issue: Statistics show 0 or incorrect values
**Solution:**
- Check calculation logic in `use-computed-conversation-stats` hook
- Verify database fields have correct data types
- Check for NULL values affecting calculations

### Issue: Filters not working
**Solution:**
- Check Zustand store updates
- Verify filter logic in `use-filtered-conversations` hook
- Check if filters applied to correct fields
- Verify Supabase query builder syntax

### Issue: Modal not opening
**Solution:**
- Check browser console for errors
- Verify modal state management
- Check if modal component properly imported
- Verify conversation ID passed correctly

## Next Steps After Testing

After successful testing:

1. **Document Working Features:**
   - Update README with features list
   - Create user guide if needed

2. **Address Critical Bugs:**
   - Fix any show-stopper issues
   - Create tickets for non-critical bugs

3. **Implement Missing Features:**
   - Create review queue page if needed
   - Create templates page if needed
   - Implement any missing API endpoints

4. **Performance Optimization:**
   - Address any performance issues found
   - Implement caching if needed
   - Optimize database queries

5. **Production Readiness:**
   - Add proper error boundaries
   - Implement loading states
   - Add analytics tracking
   - Set up monitoring

Execute this prompt in a fresh Cursor context after completing PROMPT E02.

+++++++++++++++++

---

## Rollback Strategy

If issues are discovered and rollback is needed:

### Database Rollback

```sql
-- Save current state first
CREATE TABLE conversations_backup AS SELECT * FROM conversations;
CREATE TABLE templates_backup AS SELECT * FROM templates;

-- Delete inserted mock data (use the mock user UUID from insertion)
DELETE FROM conversations WHERE created_by = 'YOUR_MOCK_USER_UUID';
DELETE FROM templates WHERE created_by->>'id' = 'YOUR_MOCK_USER_UUID';

-- Verify deletion
SELECT COUNT(*) FROM conversations;
SELECT COUNT(*) FROM templates;
```

### File Cleanup

```bash
# Remove generated files
rm -rf src/scripts/generated-sql/
rm src/scripts/populate-mock-conversations.js
rm src/scripts/execute-sql-inserts.js
```

### Restore from Backup (if needed)

```sql
-- Restore conversations
INSERT INTO conversations SELECT * FROM conversations_backup;

-- Restore templates
INSERT INTO templates SELECT * FROM templates_backup;

-- Drop backup tables
DROP TABLE conversations_backup;
DROP TABLE templates_backup;
```

---

## Success Metrics

Upon successful completion of all prompts, you should have:

### Database Metrics
- **Conversations Table:**
  - ✅ 40+ conversation records
  - ✅ 40% approved, 30% pending review, 20% generated, 10% needs revision
  - ✅ Average quality score 7.5-9.0
  - ✅ All required fields populated
  - ✅ Valid UUIDs throughout

- **Templates Table:**
  - ✅ 8-12 template records
  - ✅ Linked to conversations via parent_id
  - ✅ All metadata fields populated
  - ✅ Active templates ready for use

### Application Metrics
- **Dashboard:**
  - ✅ Loads in < 3 seconds
  - ✅ Stats accurately calculated
  - ✅ All filters functional
  - ✅ Smooth pagination

- **Data Quality:**
  - ✅ No orphaned records
  - ✅ All relationships valid
  - ✅ JSONB fields properly formatted
  - ✅ Timestamps logical and valid

- **User Experience:**
  - ✅ No console errors
  - ✅ Responsive UI
  - ✅ Clear data presentation
  - ✅ Intuitive navigation

---

## Appendix A: Database Schema Quick Reference

### Conversations Table
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id TEXT UNIQUE NOT NULL,
  document_id UUID REFERENCES documents(id),
  chunk_id UUID REFERENCES chunks(id),
  title TEXT,
  persona TEXT NOT NULL,
  emotion TEXT NOT NULL,
  topic TEXT,
  intent TEXT,
  tone TEXT,
  tier TEXT NOT NULL CHECK (tier IN ('template', 'scenario', 'edge_case')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'pending_review', 'approved', 'rejected', 'needs_revision', 'failed')),
  category TEXT[],
  quality_score NUMERIC(3,1) CHECK (quality_score >= 0 AND quality_score <= 10),
  quality_metrics JSONB,
  confidence_level TEXT CHECK (confidence_level IN ('high', 'medium', 'low')),
  turn_count INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  estimated_cost_usd NUMERIC(10,6),
  actual_cost_usd NUMERIC(10,6),
  generation_duration_ms INTEGER,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  reviewer_notes TEXT,
  parent_id UUID,
  parent_type TEXT CHECK (parent_type IN ('template', 'scenario', 'conversation')),
  parameters JSONB DEFAULT '{}',
  review_history JSONB DEFAULT '[]',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL
);

CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_tier ON conversations(tier);
CREATE INDEX idx_conversations_persona ON conversations(persona);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_conversations_quality_score ON conversations(quality_score);
```

### Templates Table
```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tier TEXT NOT NULL,
  template_text TEXT NOT NULL,
  structure TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  tone TEXT NOT NULL,
  complexity_baseline NUMERIC(3,1) CHECK (complexity_baseline >= 1 AND complexity_baseline <= 10),
  style_notes JSONB,
  example_conversation JSONB,
  quality_threshold JSONB,
  required_elements JSONB,
  applicable_personas JSONB,
  applicable_emotions JSONB,
  applicable_topics JSONB,
  usage_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0,
  success_rate NUMERIC(5,2) DEFAULT 0,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by JSONB,
  last_modified_by JSONB,
  last_modified TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_tier ON templates(tier);
CREATE INDEX idx_templates_is_active ON templates(is_active);
```

---

## Appendix B: Sample Data Mapping

Example of mapping JSON training data to conversations record:

**JSON Input:**
```json
{
  "id": "fp_marcus_004_turn1",
  "conversation_id": "fp_marcus_004",
  "turn_number": 1,
  "conversation_metadata": {
    "client_persona": "Marcus Thompson - The Overwhelmed Avoider",
    "session_context": "Evening chat (8:45 PM), emotional vulnerability, guilt about inheritance"
  },
  "emotional_context": {
    "detected_emotions": {
      "primary": "guilt",
      "primary_confidence": 0.75
    }
  },
  "response_strategy": {
    "primary_strategy": "validate_complex_emotions_then_reframe_use_as_honoring"
  },
  "target_response": "First, I'm sorry for your loss...",
  "training_metadata": {
    "quality_score": 5
  }
}
```

**SQL Output:**
```sql
INSERT INTO conversations (
  id,
  conversation_id,
  persona,
  emotion,
  topic,
  tier,
  status,
  quality_score,
  turn_count,
  total_tokens,
  parameters,
  review_history,
  retry_count,
  created_by,
  created_at,
  updated_at
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'fp_marcus_004',
  'Marcus Thompson - The Overwhelmed Avoider',
  'guilt',
  'inheritance planning',
  'template',
  'approved',
  9.5,
  1,
  450,
  '{"session_context": "Evening chat (8:45 PM)", "emotional_confidence": 0.75, "response_strategy": "validate_complex_emotions_then_reframe_use_as_honoring"}'::jsonb,
  '[{"action": "approved", "performedBy": "system", "timestamp": "2025-11-01T10:00:00Z", "comment": "High quality training example"}]'::jsonb,
  0,
  '12345678-1234-1234-1234-123456789012',
  '2025-11-01T10:00:00Z',
  '2025-11-01T10:00:00Z'
);
```

---

## Appendix C: Useful Database Queries

### Analytics Queries

**Conversation Quality Distribution:**
```sql
SELECT
  CASE
    WHEN quality_score >= 8 THEN 'Excellent (8-10)'
    WHEN quality_score >= 6 THEN 'Good (6-7.9)'
    WHEN quality_score >= 4 THEN 'Fair (4-5.9)'
    ELSE 'Poor (0-3.9)'
  END as quality_tier,
  COUNT(*) as count,
  ROUND(AVG(quality_score), 2) as avg_score
FROM conversations
WHERE quality_score IS NOT NULL
GROUP BY quality_tier
ORDER BY avg_score DESC;
```

**Persona Analysis:**
```sql
SELECT
  persona,
  COUNT(*) as conversation_count,
  AVG(quality_score) as avg_quality,
  AVG(turn_count) as avg_turns,
  STRING_AGG(DISTINCT emotion, ', ') as emotions_expressed
FROM conversations
GROUP BY persona
ORDER BY conversation_count DESC;
```

**Emotion Distribution:**
```sql
SELECT
  emotion,
  COUNT(*) as count,
  ROUND(AVG(quality_score), 2) as avg_quality,
  ARRAY_AGG(DISTINCT persona) as personas
FROM conversations
GROUP BY emotion
ORDER BY count DESC;
```

**Template Usage:**
```sql
SELECT
  t.template_name,
  t.category,
  COUNT(c.id) as conversations_generated,
  AVG(c.quality_score) as avg_conversation_quality
FROM templates t
LEFT JOIN conversations c ON c.parent_id = t.id AND c.parent_type = 'template'
GROUP BY t.id, t.template_name, t.category
ORDER BY conversations_generated DESC;
```

**Review Queue Priority:**
```sql
SELECT
  id,
  conversation_id,
  persona,
  emotion,
  status,
  quality_score,
  EXTRACT(EPOCH FROM (NOW() - created_at))/3600 as hours_since_creation
FROM conversations
WHERE status IN ('pending_review', 'needs_revision')
ORDER BY
  CASE status
    WHEN 'needs_revision' THEN 1
    WHEN 'pending_review' THEN 2
  END,
  created_at ASC;
```

---

## Appendix D: Troubleshooting Guide

### Common Issues and Solutions

**Issue: "Cannot read property 'map' of undefined" in UI**
- **Cause:** Conversations array not loading from API
- **Solution:** Check API endpoint, verify Supabase connection, check RLS policies

**Issue: Quality score showing as NaN**
- **Cause:** Invalid or null quality_score values in database
- **Solution:** Update records: `UPDATE conversations SET quality_score = 8.0 WHERE quality_score IS NULL;`

**Issue: Filters not persisting**
- **Cause:** localStorage not saving Zustand state
- **Solution:** Check Zustand persist configuration, clear localStorage and retry

**Issue: Template relationships broken**
- **Cause:** parent_id not matching template UUID
- **Solution:** Query orphaned records and update parent_id values

**Issue: Token counts seem incorrect**
- **Cause:** Estimation formula may be off
- **Solution:** Recalculate using: `UPDATE conversations SET total_tokens = LENGTH(content) / 4;`

---

## Conclusion

This execution plan provides a comprehensive, step-by-step approach to populating the train-data application's database with high-quality mock conversation data derived from LoRA training files. Each prompt is designed to be executed independently in a fresh context window, ensuring modularity and clear task boundaries.

**Key Success Factors:**
1. Thorough data mapping from JSON to database schema
2. Proper UUID and timestamp generation
3. Realistic status and quality score distribution
4. Valid template-conversation relationships
5. Comprehensive testing and verification

**Final Deliverables:**
- Populated conversations table (40+ records)
- Populated templates table (8-12 records)
- Functional /conversations dashboard
- Verified data integrity
- Comprehensive test reports
- Working application ready for development

Execute each prompt in sequence, validating success before proceeding to the next phase.
