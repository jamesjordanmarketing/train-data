# Edge Case Conversation Generation - Root Cause Analysis & Fix Specification

**Document Version**: 1.0  
**Analysis Date**: December 6, 2025  
**Job ID**: `9eeaacda-15ef-4b20-ae67-fd65ccf25411`  
**Status**: 36/36 edge case conversations FAILED  

---

## Executive Summary

All 36 edge case conversations failed during batch generation because **NO prompt templates exist in the database for edge case emotional arcs**. The application has 3 edge case emotional arcs defined, but ZERO matching prompt templates to generate conversations from them.

### Critical Finding

The `prompt_templates` table contains **ZERO** records with `tier = 'edge_case'`. All 7 existing templates are `tier = 'template'`.

---

## 1. Root Cause Analysis

### 1.1 The Template Matching Failure

**Error from logs**:
```
[ProcessNext] Looking for template with arc_type: overwhelm_to_triage, tier: edge_case
[ProcessNext] No template found for arc_type=overwhelm_to_triage
Error: No suitable template found for the emotional arc.
```

**What the code does**:

The batch processing endpoint (`src/app/api/batch-jobs/[id]/process-next/route.ts`) attempts to auto-select a prompt template by:

1. Getting the `arc_key` from the `emotional_arcs` table (e.g., `"overwhelm_to_triage"`)
2. Querying `prompt_templates` table for a match:
   ```typescript
   .from('prompt_templates')
   .select('id')
   .eq('emotional_arc_type', arcType)  // ← Looking for "overwhelm_to_triage"
   .eq('tier', tier)                    // ← Looking for "edge_case"
   ```
3. If no template is found, it throws: `"No suitable template found for the emotional arc."`

**Why it fails**:

| Emotional Arc (arc_key) | Tier | Templates Found |
|-------------------------|------|-----------------|
| `crisis_to_referral` | `edge_case` | **0** |
| `hostility_to_boundary` | `edge_case` | **0** |
| `overwhelm_to_triage` | `edge_case` | **0** |

---

### 1.2 Database State Analysis

#### Emotional Arcs Table

**Query**: `SELECT arc_key, name, tier FROM emotional_arcs WHERE tier = 'edge_case'`

**Results**:
```
1. crisis_to_referral     - Crisis → Referral         (edge_case)
2. hostility_to_boundary  - Hostility → Boundary      (edge_case)
3. overwhelm_to_triage    - Overwhelm → Triage        (edge_case)
```

✅ **3 edge case emotional arcs exist** and are properly configured.

#### Prompt Templates Table

**Query**: `SELECT template_name, tier, emotional_arc_type FROM prompt_templates WHERE tier = 'edge_case'`

**Results**:
```
(no rows)
```

❌ **ZERO edge case prompt templates exist**.

**All existing templates**:
```
1. Template - Anxiety → Confidence - Investment Anxiety (tier: template, arc: fear_to_confidence)
2. Template - Confusion → Clarity - Education Focus (tier: template, arc: confusion_to_clarity)
3. Template - Couple Conflict → Alignment - Money Values (tier: template, arc: couple_conflict_to_alignment)
4. Template - Emergency → Calm - Crisis Management (tier: template, arc: emergency_to_calm)
5. Template - Grief/Loss → Healing - Values-Based Recovery (tier: template, arc: grief_to_healing)
6. Template - Overwhelm → Empowerment - Complex Situation (tier: template, arc: overwhelm_to_empowerment)
7. Template - Shame → Acceptance - Financial Trauma (tier: template, arc: shame_to_acceptance)
```

---

### 1.3 Schema Analysis

**Prompt Templates Table Structure**:
```
- id (uuid, PK)
- template_name (varchar, NOT NULL)
- tier (varchar, nullable) ← CAN BE NULL
- emotional_arc_type (varchar, nullable) ← CAN BE NULL
- template_text (text, NOT NULL)
- suitable_personas (ARRAY, nullable)
- suitable_topics (ARRAY, nullable)
... 20 more columns
```

**Key Observation**: The `emotional_arc_type` column expects `arc_key` values from the `emotional_arcs` table, not full names or IDs.

---

## 2. Secondary Issue: Failed Conversations Page Shows Zero Records

### 2.1 The Problem

The `/conversations/failed` page shows **ZERO failed conversations**, even though 36 edge case generations failed.

### 2.2 Root Cause

The failed generations page queries the `conversations` table:

```sql
SELECT * FROM conversations 
WHERE status = 'failed' OR enrichment_status = 'failed'
```

**Query result**: 0 rows

**Why**: The batch processing errors occur BEFORE any conversation record is created in the database. The errors happen during **template selection**, not during **conversation generation**.

### 2.3 The Error Recording System

The application HAS a separate error recording system in the `failed_generations` table (referenced by the failed page component at line 99), but these errors are never inserted because:

1. The error occurs at line 276 in `process-next/route.ts`: `throw new Error('No suitable template found...')`
2. This is BEFORE the conversation generation service is ever called
3. The `failed_generations` table only records failures from the **conversation generation service**, not from **parameter assembly or template selection**

---

## 3. Missing Prompt Templates - Detailed Analysis

### 3.1 What's Missing

Based on the edge case emotional arcs, the following prompt templates are missing:

| Arc Key | Arc Name | Template Name (Expected) | Status |
|---------|----------|--------------------------|--------|
| `crisis_to_referral` | Crisis → Referral | Template - Crisis → Referral - Edge Case | ❌ MISSING |
| `hostility_to_boundary` | Hostility → Boundary | Template - Hostility → Boundary - Edge Case | ❌ MISSING |
| `overwhelm_to_triage` | Overwhelm → Triage | Template - Overwhelm → Triage - Edge Case | ❌ MISSING |

### 3.2 Required Template Metadata

Each missing template must have:

1. **Core Fields**:
   - `template_name`: Descriptive name (e.g., "Template - Crisis → Referral - Emergency Boundary Setting")
   - `tier`: `'edge_case'`
   - `emotional_arc_type`: Must match `arc_key` from `emotional_arcs` table
   - `template_text`: The full prompt template text

2. **Scaffolding Compatibility**:
   - `suitable_personas`: Array of persona keys compatible with this edge case
   - `suitable_topics`: Array of topic keys compatible with this edge case

3. **Optional But Recommended**:
   - `description`: What makes this edge case unique
   - `methodology_principles`: Array of principles for handling the edge case
   - `required_elements`: Array of must-have elements in the conversation

### 3.3 Example: Crisis → Referral Template

Based on the existing template structure, a Crisis → Referral template should include:

```json
{
  "template_name": "Template - Crisis → Referral - Safety & Professional Boundaries",
  "tier": "edge_case",
  "emotional_arc_type": "crisis_to_referral",
  "description": "Handles situations requiring immediate professional referral - suicidal ideation, severe mental health crisis, domestic violence, or other scenarios beyond a financial planner's scope.",
  "suitable_personas": ["overwhelmed_avoider", "anxious_planner"],
  "suitable_topics": [
    "severe_depression_financial_paralysis",
    "domestic_violence_financial_control",
    "suicidal_ideation_debt_overwhelm",
    "severe_addiction_financial_destruction"
  ],
  "methodology_principles": [
    "Immediate safety assessment",
    "Professional boundary maintenance",
    "Warm referral to crisis resources",
    "Compassionate but firm redirection",
    "Follow-up plan for financial matters after crisis stabilizes"
  ],
  "template_text": "... [FULL PROMPT TEMPLATE] ..."
}
```

---

## 4. Code Flow Analysis

### 4.1 The Happy Path (When Templates Exist)

```
1. User selects "Edge Case" tier in batch-jobs UI
2. Batch job creates 36 items with emotional_arc_id = [edge case arc UUIDs]
3. process-next endpoint picks up first queued item
4. autoSelectTemplate() is called (line 75-135)
   ├─ Gets arc_key from emotional_arcs table
   ├─ Queries prompt_templates for matching emotional_arc_type + tier
   └─ Returns template_id
5. ParameterAssemblyService assembles full parameters
6. ConversationGenerationService generates conversation
7. Conversation saved to database
8. Item marked as 'completed'
```

### 4.2 The Current Broken Path

```
1. User selects "Edge Case" tier in batch-jobs UI
2. Batch job creates 36 items with emotional_arc_id = [edge case arc UUIDs]
3. process-next endpoint picks up first queued item
4. autoSelectTemplate() is called (line 75-135)
   ├─ Gets arc_key from emotional_arcs table (e.g., "overwhelm_to_triage")
   ├─ Queries prompt_templates for matching emotional_arc_type + tier
   └─ ❌ NO RESULTS FOUND
5. ❌ Throws error: "No suitable template found for the emotional arc."
6. ❌ Item marked as 'failed'
7. ❌ Error is logged to batch-logs but NOT to failed_generations table
8. ❌ No conversation record is created
```

### 4.3 Why Failed Conversations Don't Appear

The `/conversations/failed` page expects records in the `conversations` table with `status = 'failed'`, but these template selection errors prevent any conversation record from being created in the first place.

**Existing Failed Generations System**: There IS a `failed_generations` table and API (`/api/failed-generations`), but it only captures failures from the conversation generation service itself, not from earlier stages like template selection.

---

## 5. Fix Specification

### 5.1 Primary Fix: Create Missing Prompt Templates

**Objective**: Create 3 prompt templates for edge case emotional arcs.

**Requirements**:

1. **Template Content Creation** (LoRA Expert Task):
   - Write full prompt templates for:
     - Crisis → Referral (crisis_to_referral)
     - Hostility → Boundary (hostility_to_boundary)
     - Overwhelm → Triage (overwhelm_to_triage)
   - Each template must follow the existing template structure (see section 3.3)
   - Templates must align with Elena Morales' methodology and communication style

2. **Database Insertion**:
   - Insert records into `prompt_templates` table
   - **CRITICAL**: Set `emotional_arc_type` to the exact `arc_key` from `emotional_arcs` table
   - Set `tier` to `'edge_case'`
   - Populate `suitable_personas` and `suitable_topics` arrays

3. **Validation**:
   - Query to verify templates exist:
     ```sql
     SELECT template_name, tier, emotional_arc_type 
     FROM prompt_templates 
     WHERE tier = 'edge_case'
     ```
   - Expected: 3 rows

### 5.2 Secondary Fix: Improve Error Visibility

**Objective**: Make template selection failures visible in the Failed Conversations page.

**Requirements**:

1. **Option A**: Extend Failed Generations System (RECOMMENDED)
   - Modify `process-next/route.ts` to catch template selection errors
   - Insert error records into `failed_generations` table with:
     - `failure_type`: `'validation_error'`
     - `error_message`: The specific error (e.g., "No template found for arc_type=overwhelm_to_triage")
     - Relevant scaffolding IDs (persona_id, emotional_arc_id, topic_id)
   
2. **Option B**: Create Batch Item Errors View
   - Create new page: `/batch-jobs/failed-items`
   - Query `batch_items` table for items with `status = 'failed'`
   - Display error messages from `batch_items.error` column

**Recommended**: Option A, because the failed-generations infrastructure already exists and is designed for this purpose.

### 5.3 Tertiary Fix: Add Fallback Mechanism

**Objective**: Prevent total batch failure when edge case templates are missing.

**Requirements**:

1. **Graceful Degradation**:
   - Modify `autoSelectTemplate()` function (line 75-135 in process-next/route.ts)
   - When no tier-specific template is found, try to find a related template arc
   - Example fallback logic:
     ```typescript
     // If "overwhelm_to_triage" not found, try "overwhelm_to_empowerment"
     // If "crisis_to_referral" not found, try "emergency_to_calm"
     ```

2. **Warning Logging**:
   - Log when fallback is used: `"⚠️ No template for ${arcType}, using fallback ${fallbackArcType}"`
   - Track fallback usage for later template creation prioritization

**Priority**: LOW (implement only after primary fix is complete)

---

## 6. Implementation Steps for LoRA Expert Agent

### Step 1: Create Edge Case Prompt Templates

**For EACH of the 3 edge case emotional arcs**:

1. **Research the Arc**:
   - Review the `emotional_arcs` table record for the arc
   - Note: `starting_emotion`, `ending_emotion`, `arc_strategy`, `key_principles`, `characteristic_phrases`

2. **Review Existing Templates**:
   - Study the 7 existing `template` tier templates for structure and tone
   - Understand Elena Morales' methodology (from consultant_profile in training files)

3. **Write the Prompt Template**:
   - Create a full prompt template following the existing structure
   - Include:
     - System prompt section
     - Context variables section
     - Conversation structure guidance
     - Emotional arc navigation instructions
     - Edge case handling protocols

4. **Define Metadata**:
   - `suitable_personas`: Which persona types work best with this edge case?
   - `suitable_topics`: Which training topics are appropriate?
   - `methodology_principles`: Key principles for handling this edge case
   - `required_elements`: Must-have conversation elements

### Step 2: Insert Templates into Database

**Using SAOL (Supabase Agent Ops Library)**:

```javascript
const saol = require('./supa-agent-ops');
require('dotenv').config({path:'.env.local'});

const template = {
  template_name: "Template - Crisis → Referral - Safety & Professional Boundaries",
  tier: "edge_case",
  emotional_arc_type: "crisis_to_referral",  // ← MUST match arc_key exactly
  description: "...",
  template_text: "...",  // Full prompt template
  suitable_personas: ["overwhelmed_avoider", "anxious_planner"],
  suitable_topics: ["..."],
  methodology_principles: ["..."],
  is_active: true,
  created_at: new Date().toISOString(),
  // ... other fields
};

await saol.agentWrite({
  table: 'prompt_templates',
  data: template,
  transport: 'pg'
});
```

**Repeat for all 3 templates**.

### Step 3: Validation Queries

**Verify templates exist**:

```bash
cd supa-agent-ops
node -e "
require('dotenv').config({path:'../.env.local'});
const {Client}=require('pg');
const client=new Client({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});
(async()=>{
  await client.connect();
  const result=await client.query(\"SELECT template_name, tier, emotional_arc_type FROM prompt_templates WHERE tier = 'edge_case'\");
  console.log('Edge case templates:', result.rowCount);
  result.rows.forEach(r=>{console.log('-', r.template_name);});
  await client.end();
})();
"
```

**Expected output**:
```
Edge case templates: 3
- Template - Crisis → Referral - Safety & Professional Boundaries
- Template - Hostility → Boundary - Professional Boundary Setting
- Template - Overwhelm → Triage - Initial Assessment & Prioritization
```

### Step 4: Test Edge Case Generation

**Create a new batch job**:

1. Go to `/batch-jobs` page
2. Select "Edge Case" tier
3. Select personas, emotional arcs, and topics
4. Generate 3-5 conversations
5. Verify:
   - All conversations generate successfully
   - No "No template found" errors
   - Conversations match the edge case emotional arc

---

## 7. Database Queries for Investigation

### 7.1 Current State Queries

**Check emotional arcs**:
```sql
SELECT id, arc_key, name, tier 
FROM emotional_arcs 
WHERE tier = 'edge_case';
```

**Check prompt templates**:
```sql
SELECT id, template_name, tier, emotional_arc_type, suitable_personas, suitable_topics
FROM prompt_templates 
WHERE tier = 'edge_case';
```

**Check failed batch job**:
```sql
SELECT id, status, total_items, completed_items, successful_items, failed_items 
FROM batch_jobs 
WHERE id = '9eeaacda-15ef-4b20-ae67-fd65ccf25411';
```

### 7.2 Verification Queries (After Fix)

**Verify template-arc linkage**:
```sql
SELECT 
  ea.arc_key,
  ea.name AS arc_name,
  pt.template_name,
  pt.tier
FROM emotional_arcs ea
LEFT JOIN prompt_templates pt ON pt.emotional_arc_type = ea.arc_key AND pt.tier = 'edge_case'
WHERE ea.tier = 'edge_case';
```

**Expected result**: 3 rows with NON-NULL template_name values.

---

## 8. Code Files Reference

| File | Purpose | Lines of Interest |
|------|---------|-------------------|
| `src/app/api/batch-jobs/[id]/process-next/route.ts` | Batch processing endpoint | 75-135 (autoSelectTemplate), 268-278 (template selection) |
| `src/app/(dashboard)/conversations/failed/page.tsx` | Failed generations UI | 99-102 (API call), 282-289 (empty state) |
| `src/lib/services/template-selection-service.ts` | Template selection logic | (not reviewed in this analysis) |
| `src/lib/services/parameter-assembly-service.ts` | Parameter assembly | (not reviewed in this analysis) |

---

## 9. Risk Assessment

### 9.1 Risks if Not Fixed

| Risk | Impact | Likelihood |
|------|--------|------------|
| Edge case conversations never generate | **HIGH** - Missing critical training data | **CERTAIN** |
| Users confused by "failed" batch jobs with no visible errors | **MEDIUM** - Poor UX | **CERTAIN** |
| Production pipeline incomplete | **HIGH** - Cannot generate full training dataset | **CERTAIN** |

### 9.2 Risks During Fix

| Risk | Mitigation |
|------|------------|
| New templates don't match arc strategy | Review arc definitions before writing templates |
| Templates use wrong `emotional_arc_type` value | Use exact `arc_key` values from database query |
| Templates incompatible with existing personas/topics | Review `suitable_personas` and `suitable_topics` arrays in existing records |

---

## 10. Success Criteria

### 10.1 Primary Success Criteria

- [ ] 3 prompt templates exist in database with `tier = 'edge_case'`
- [ ] Each template has `emotional_arc_type` matching an edge case `arc_key`
- [ ] Can generate edge case conversations successfully via batch-jobs UI
- [ ] No "No template found" errors in logs

### 10.2 Secondary Success Criteria

- [ ] Failed template selection errors visible in failed generations page (if Option A implemented)
- [ ] Batch job error messages are clear and actionable
- [ ] Documentation updated to reflect edge case template requirements

---

## 11. Related Issues & Future Improvements

### 11.1 Discovered During Analysis

1. **No Template-Arc Validation**: Database has no foreign key or check constraint ensuring `prompt_templates.emotional_arc_type` references a valid `emotional_arcs.arc_key`.

2. **Fallback System Missing**: No graceful degradation when templates are missing.

### 11.2 Future Enhancements

1. **Template-Arc Referential Integrity**: Add database constraint or application-level validation
2. **Template Coverage Dashboard**: UI showing which arcs have templates and which don't
3. **Template Auto-Generation**: AI-assisted template creation from arc definitions
4. **Better Error Recovery**: Retry failed batch items with different parameters

---

## 12. Appendix: Log Analysis

### 12.1 Sample Error Log

```
2025-12-06 00:15:51 [ProcessNext] Processing item 5c9a1ba5-c5af-4ae5-a214-78775018c360 (2 remaining)
2025-12-06 00:15:51 [ProcessNext] Auto-selecting template for item 5c9a1ba5-c5af-4ae5-a214-78775018c360
2025-12-06 00:15:51 [ProcessNext] Looking for template with arc_type: overwhelm_to_triage, tier: edge_case
2025-12-06 00:15:51 [ProcessNext] No template found for arc_type=overwhelm_to_triage
2025-12-06 00:15:51 [ProcessNext] Item 5c9a1ba5-c5af-4ae5-a214-78775018c360 error in 839ms: Error: No suitable template found for the emotional arc.
```

**Pattern**: ALL 36 failures follow this exact pattern.

### 12.2 Arc Types Requested (from logs)

| Arc Type | Occurrence Count |
|----------|------------------|
| `overwhelm_to_triage` | ~20 times |
| `hostility_to_boundary` | ~16 times |
| `crisis_to_referral` | 0 (not selected in this batch) |

---

## Document Status

- [x] Root cause identified
- [x] Database state verified
- [x] Code flow analyzed
- [x] Fix specification written
- [x] Implementation steps documented
- [x] Success criteria defined

**Ready for LoRA Expert Agent execution**.

---

**End of Analysis**

