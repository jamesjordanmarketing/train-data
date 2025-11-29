# Context Carryover Document - 11/29/25 Session Update

## For Next Agent: Critical Context and Instructions

This document provides the complete context for continuing work on the batch job conversation generation system. **READ THIS ENTIRE DOCUMENT BEFORE STARTING ANY WORK.**

---

## 🚨 CURRENT STATE: What Was Accomplished in This Session (11/29/25)

### ✅ Bug #5: Persona Mismatch - PARTIALLY FIXED

**Original Problem**: User submitted "David Chen" persona but generated conversation contained "Marcus Chen"

**What Was Fixed**:
1. The scaffolding data (persona, emotional_arc, training_topic) is now correctly resolved BEFORE calling the generation service
2. The `process-next` route now uses `ParameterAssemblyService` to resolve UUIDs to actual values
3. The conversation name now correctly shows "David Chen - The Pragmatic Optimist" in the database

**Verified Working**:
- `conversations.persona_id` correctly stores the UUID (e.g., `aa514346-cd61-42ac-adad-498934975402`)
- `conversations.emotional_arc_id` correctly stores the UUID
- `conversations.training_topic_id` correctly stores the UUID
- `conversations.conversation_name` shows correct persona name

### ✅ Bug #6: Storage Doesn't Validate Input Parameters - FIXED

**Original Problem**: `parseAndStoreFinal()` stored Claude's output without validating against input parameters

**What Was Fixed**:
1. Added STEP 4.5 to `conversation-storage-service.ts` (lines ~1095-1210)
2. After parsing, the code now fetches the actual persona/arc/topic from database
3. Overrides `client_persona` field with the correct persona name
4. Adds `input_parameters` section to JSON for audit trail

**Code Added** (in `parseAndStoreFinal()`):
```typescript
// STEP 4.5: Fetch scaffolding data and validate persona
const { data: convRecord } = await this.supabase
  .from('conversations')
  .select('persona_id, emotional_arc_id, training_topic_id')
  .eq('conversation_id', conversationId)
  .single();

if (convRecord?.persona_id) {
  const { data: persona } = await this.supabase
    .from('personas')
    .select('id, name, archetype, persona_key')
    .eq('id', convRecord.persona_id)
    .single();
  
  // Override Claude's output with actual input persona
  parsed.conversation_metadata.client_persona = `${persona.name} - ${persona.archetype}`;
  
  // Add audit trail
  parsed.input_parameters = {
    persona_id: persona.id,
    persona_name: persona.name,
    // ... etc
  };
}
```

### 🔴 NEW BUG DISCOVERED: Scaffolding IDs Not Set at Query Time

**Problem Identified in This Session**: The `input_parameters` section was NOT appearing in the JSON files because:

1. `storeRawResponse()` creates the conversation record
2. `storeRawResponse()` tried to get scaffolding IDs from `params.parameters?.persona_id`
3. But `params.parameters` contained **template variables** (like `persona_name: "David Chen"`) NOT the UUID
4. So `persona_id` was NULL when `parseAndStoreFinal()` queried for it
5. After `parseAndStoreFinal()` completed, `process-next` then updated the conversation with scaffolding IDs
6. Result: `parseAndStoreFinal()` saw NULL for persona_id and skipped adding `input_parameters`

**Root Cause Timeline**:
```
09:21:40.064 - storeRawResponse creates conversation (persona_id = NULL)
09:21:40.813 - parseAndStoreFinal queries persona_id -> finds NULL
09:21:40.938 - parseAndStoreFinal skips input_parameters section
09:21:41.521 - process-next FINALLY updates persona_id, emotional_arc_id, training_topic_id
```

### ✅ FIX APPLIED: Pass Scaffolding IDs Earlier

**Commit**: `4ef6d11` - "fix: Pass scaffolding UUIDs to storeRawResponse for persona validation"

**Changes Made**:

1. **Added `scaffoldingIds` to `GenerationParams` interface** (`conversation-generation-service.ts`):
```typescript
export interface GenerationParams {
  // ... existing fields
  
  /** Scaffolding IDs (UUIDs) for provenance tracking */
  scaffoldingIds?: {
    personaId?: string;
    emotionalArcId?: string;
    trainingTopicId?: string;
  };
}
```

2. **Updated `storeRawResponse()` call** (`conversation-generation-service.ts`):
```typescript
const rawStorageResult = await this.storageService.storeRawResponse({
  conversationId: generationId,
  rawResponse: apiResponse.content,
  userId: params.userId,
  metadata: {
    templateId: params.templateId,
    tier: params.tier,
    // Use scaffoldingIds (UUIDs) if provided, fallback to parameters
    personaId: params.scaffoldingIds?.personaId || params.parameters?.persona_id,
    emotionalArcId: params.scaffoldingIds?.emotionalArcId || params.parameters?.emotional_arc_id,
    trainingTopicId: params.scaffoldingIds?.trainingTopicId || params.parameters?.training_topic_id,
  },
});
```

3. **Updated `process-next` route** (`route.ts`):
```typescript
const result = await generationService.generateSingleConversation({
  templateId,
  parameters: assembled.template_variables,
  tier: item.tier,
  userId: job.createdBy || '00000000-0000-0000-0000-000000000000',
  runId: jobId,
  // Pass scaffolding UUIDs for provenance tracking
  scaffoldingIds: {
    personaId: item.parameters.persona_id,
    emotionalArcId: item.parameters.emotional_arc_id,
    trainingTopicId: item.parameters.training_topic_id,
  },
});
```

---

## 📋 VERIFICATION REQUIRED BY NEXT AGENT

After Vercel deploys the fix, the next agent should verify:

### Test Procedure
1. Go to `/bulk-generator` 
2. Create a new batch job with:
   - Persona: "David Chen"
   - Any Emotional Arc
   - Any Training Topic
   - 1 conversation
3. Wait for job to complete
4. Check Vercel logs for these messages:
   ```
   [parseAndStoreFinal] ✅ Fetched persona: David Chen (pragmatic_optimist)
   [parseAndStoreFinal] ✅ Fetched emotional_arc: <arc_name> (<arc_key>)
   [parseAndStoreFinal] ✅ Fetched training_topic: <topic_name> (<topic_key>)
   [parseAndStoreFinal] ✅ Added input_parameters section: { ... }
   ```
5. Download the conversation JSON and verify:
   - `conversation_metadata.client_persona` = "David Chen - The Pragmatic Optimist"
   - `input_parameters` section exists with all fields populated

### Expected JSON Structure
```json
{
  "conversation_metadata": {
    "client_persona": "David Chen - The Pragmatic Optimist",
    // ... other fields
  },
  "input_parameters": {
    "persona_id": "aa514346-cd61-42ac-adad-498934975402",
    "persona_name": "David Chen",
    "persona_archetype": "The Pragmatic Optimist",
    "persona_key": "pragmatic_optimist",
    "emotional_arc_id": "<uuid>",
    "emotional_arc_name": "<arc name>",
    "emotional_arc_key": "<arc_key>",
    "training_topic_id": "<uuid>",
    "training_topic_name": "<topic name>",
    "training_topic_key": "<topic_key>"
  },
  "turns": [...]
}
```

---

## 📄 Reference Specification Document

**Do NOT replace the specification with this carryover document.** If further changes are needed, reference:

📄 **`pmc/context-ai/pmct/iteration-1-bug-fixing-step-10_v1.md`** (608 lines)

This specification contains:
- Complete root cause analysis
- Data flow diagrams
- Code location references with line numbers
- Implementation patterns
- Priority recommendations

---

## 🔍 Supabase Agent Ops Library (SAOL) Quick Reference

**SAOL** = Supabase Agent Ops Library (local package at `supa-agent-ops/dist/index.js`)

### Import Pattern
```typescript
import { saol } from '@/supa-agent-ops/dist/index';
// Initialize with SERVICE ROLE KEY for admin operations
const saolClient = saol.createClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
});
```

### Common Operations
```typescript
// Fetch persona by ID
const persona = await saolClient.getPersonaById(personaId);

// Fetch emotional arc
const arc = await saolClient.getEmotionalArcById(arcId);

// Fetch training topic
const topic = await saolClient.getTrainingTopicById(topicId);

// Update conversation status
await saolClient.updateConversationStatus(conversationId, 'completed');
```

### When to Use SAOL vs Direct Supabase
- **SAOL**: Business operations (scaffolding, conversations, exports)
- **Direct Supabase**: Custom queries, storage operations, batch job internals

---

## 📋 Project Context

### System Overview

This is a **LoRA training data generation pipeline** for financial advisor conversation simulations:

1. **Scaffolding**: Personas, Emotional Arcs, Training Topics stored in Supabase
2. **Templates**: Prompt templates with `{{placeholder}}` syntax
3. **Batch Jobs**: Process multiple conversations via polling (Vercel serverless limit workaround)
4. **Generation**: Claude API generates structured conversation JSON
5. **Storage**: Supabase Storage for JSON files, PostgreSQL for metadata
6. **Export**: Training data export for LoRA fine-tuning

### Key Architecture Decision

The batch processing uses a **polling pattern** (not webhooks) because:
- Vercel serverless functions have execution time limits (300s max)
- Frontend polls `/api/batch-jobs/[id]/process-next` to process one item at a time
- Each item generates one conversation, stores results, marks complete

---

## Critical File Locations

### Files Modified in This Session

| File | Changes Made |
|------|-------------|
| `src/lib/services/conversation-generation-service.ts` | Added `scaffoldingIds` to `GenerationParams`, updated `storeRawResponse()` call |
| `src/app/api/batch-jobs/[id]/process-next/route.ts` | Added `scaffoldingIds` parameter to generation call |
| `src/lib/services/conversation-storage-service.ts` | STEP 4.5 for persona validation and `input_parameters` (previous session) |

### Batch Processing
| File | Purpose |
|------|---------|
| `src/app/api/batch-jobs/[id]/process-next/route.ts` | Processes single batch item per poll |
| `src/app/api/batch-jobs/route.ts` | Creates batch jobs |
| `src/app/(main)/batch-jobs/page.tsx` | UI for batch job management |

### Generation Services
| File | Purpose |
|------|---------|
| `src/lib/services/conversation-generation-service.ts` | Calls Claude API |
| `src/lib/services/template-resolver.ts` | Resolves `{{placeholder}}` syntax |
| `src/lib/services/parameter-assembly-service.ts` | Resolves scaffolding UUIDs to values |

### Storage Services
| File | Purpose |
|------|---------|
| `src/lib/services/conversation-storage-service.ts` | Stores JSON + DB records |
| `src/lib/services/conversation-enrichment-service.ts` | Creates training pairs |

---

## Database Schema Quick Reference

### Key Tables
```sql
-- Scaffolding
personas: id, name, archetype, persona_key, demographics, financial_background, communication_style
emotional_arcs: id, name, arc_key, starting_emotion, ending_emotion, arc_description, turn_count
training_topics: id, name, topic_key, description, key_points, common_objections

-- Batch Processing
batch_jobs: id, name, status, total_items, completed_items, failed_items, created_by, started_at, completed_at
batch_items: id, batch_job_id, status, parameters, conversation_id, error, started_at, completed_at

-- Conversations
conversations: conversation_id, status, persona_id, emotional_arc_id, training_topic_id, file_path, enriched_file_path, conversation_name
```

### Important Relationships
- `batch_items.parameters` contains `{ persona_id, emotional_arc_id, training_topic_id }` (UUIDs)
- `conversations.persona_id` links to `personas.id`
- Conversation JSON files stored in Supabase Storage bucket `conversation-files`

---

## Recent Git History

```
4ef6d11 - fix: Pass scaffolding UUIDs to storeRawResponse for persona validation
30436a4 - leaving cafe. fix batch bugs 3
```

---

## Environment Notes

- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL + Storage)
- **AI**: Anthropic Claude API with structured outputs (`claude-sonnet-4-5-20250929`)
- **Runtime**: Vercel serverless (300s max execution, `maxDuration = 300` configured)
- **Deployment**: Auto-deploys from `main` branch to `train-data-three.vercel.app`

---

## Summary for Next Agent

**CURRENT STATUS**: The persona mismatch fix has been deployed. The next step is to verify the fix works in production.

**WHAT WORKS NOW**:
1. ✅ Scaffolding data (persona, arc, topic) is resolved before generation
2. ✅ `conversation_name` shows correct persona
3. ✅ Database stores correct `persona_id`, `emotional_arc_id`, `training_topic_id`
4. ✅ `client_persona` in JSON shows correct persona name
5. ⏳ `input_parameters` section should now appear (needs verification after deploy)

**YOUR FIRST TASK**: Verify the fix by running a test batch job after Vercel deploys (usually 2-3 minutes after git push).

**IF ISSUES PERSIST**: Check Vercel logs for the `[parseAndStoreFinal]` messages. The logs should show:
- `✅ Fetched persona: <name>`
- `✅ Fetched emotional_arc: <name>`
- `✅ Fetched training_topic: <name>`
- `✅ Added input_parameters section`

If you see `⚠️ No persona_id in conversation record - skipping persona validation`, the fix didn't work and further investigation is needed.

---

*Document created: 11/15/25 - Updated 11/29/25 with scaffolding ID timing fix*
