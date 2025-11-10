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

Execute this prompt in a fresh context with access to the train-data repository.