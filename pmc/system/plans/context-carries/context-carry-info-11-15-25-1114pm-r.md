# Context Carryover Document - 11/15/25 Revision

## For Next Agent: Critical Context and Instructions

This document provides the complete context for continuing work on the batch job conversation generation system. **READ THIS ENTIRE DOCUMENT BEFORE STARTING ANY WORK.**

---

## IMMEDIATE ACTION REQUIRED

### Use the Specification File to Implement Fixes

A detailed specification has been created with full analysis and implementation instructions:

📄 **`pmc/context-ai/pmct/iteration-1-bug-fixing-step-10_v1.md`** (608 lines)

This specification contains:
- Complete root cause analysis
- Data flow diagrams
- Code location references with line numbers
- Implementation patterns
- Priority recommendations

**Your task is to use the specification file above to make the updates to the codebase.**

---

## Bug Summary - THREE CRITICAL ISSUES TO FIX

### Bug #5: Persona Mismatch - CRITICAL 🔴

**Symptom**: User submitted "David Chen" persona but generated conversation contains "Marcus Chen"

**Root Cause**: The `process-next` route passes UUIDs to the generation service, but the template expects resolved persona names. The template has placeholders like `{{persona_name}}` that go UNREPLACED, causing Claude to hallucinate persona details.

**Evidence**:
- Database `batch_items.parameters` contains: `{ persona_id: "aa514346-cd61-42ac-adad-498934975402" }` (David Chen's UUID)
- Template expects: `{{persona_name}}`, `{{persona_archetype}}`, `{{persona_demographics}}`
- What Claude receives: Unresolved `{{persona_name}}` placeholders
- What Claude generates: Invents "Marcus Chen" based on context clues in the emotional arc

**Files to Fix**:
- `src/app/api/batch-jobs/[id]/process-next/route.ts` (lines 266-271)

**The Fix**: Must resolve scaffolding data (persona, emotional_arc, training_topic) BEFORE calling generation service. See specification section 5.7 for complete implementation pattern.

---

### Bug #6: Storage Doesn't Validate Input Parameters - MEDIUM 🟡

**Symptom**: Even if Claude receives correct persona, the storage service stores Claude's output without validating against input parameters.

**Root Cause**: `parseAndStoreFinal()` stores `parsed.conversation_metadata.client_persona` directly from Claude's response without checking it matches the input persona.

**Files to Fix**:
- `src/lib/services/conversation-storage-service.ts` (in `parseAndStoreFinal()`)
- `src/lib/services/conversation-enrichment-service.ts` (in `buildTrainingPairs()`)

**The Fix**: After parsing Claude's response, override `client_persona` with the actual persona name from the database. Add `input_parameters` section to JSON for audit trail.

---

### Bug #3: "Body Already Read" Error - EXISTING

**Status**: Previously documented, may still need attention

**Symptom**: Error when trying to read request body multiple times in Next.js 14

**Root Cause**: Next.js 14 App Router Request bodies can only be read once

**Workaround**: Parse body once at route handler start, pass parsed data to functions

---

## Project Context

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
- Vercel serverless functions have execution time limits
- Frontend polls `/api/batch-jobs/[id]/process-next` to process one item at a time
- Each item generates one conversation, stores results, marks complete

---

## SAOL Quick Reference

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

## Critical File Locations

### Batch Processing
| File | Purpose |
|------|---------|
| `src/app/api/batch-jobs/[id]/process-next/route.ts` | Processes single batch item per poll - **NEEDS FIX** |
| `src/app/api/batch-jobs/route.ts` | Creates batch jobs |
| `src/app/(main)/batch-jobs/page.tsx` | UI for batch job management |

### Generation Services
| File | Purpose |
|------|---------|
| `src/lib/services/conversation-generation-service.ts` | Calls Claude API |
| `src/lib/services/template-resolver.ts` | Resolves `{{placeholder}}` syntax |
| `src/lib/services/parameter-assembly-service.ts` | **REFERENCE** - Properly resolves scaffolding (use this pattern!) |

### Storage Services
| File | Purpose |
|------|---------|
| `src/lib/services/conversation-storage-service.ts` | Stores JSON + DB records - **NEEDS FIX** |
| `src/lib/services/conversation-enrichment-service.ts` | Creates training pairs - **NEEDS FIX** |

### Scaffolding API
| File | Purpose |
|------|---------|
| `src/app/api/scaffolding/route.ts` | CRUD for personas/arcs/topics |
| `src/lib/services/scaffolding-service.ts` | Service layer for scaffolding |

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
batch_items: id, job_id, status, parameters, conversation_id, error, started_at, completed_at

-- Conversations
conversations: conversation_id, status, persona_id, emotional_arc_id, training_topic_id, file_path, enriched_file_path
```

### Important Relationships
- `batch_items.parameters` contains `{ persona_id, emotional_arc_id, training_topic_id }` (UUIDs)
- `conversations.persona_id` links to `personas.id`
- Conversation JSON files stored in Supabase Storage bucket

---

## Code Pattern Reference

### CORRECT: How `generate-with-scaffolding` Resolves Parameters

```typescript
// From src/app/api/generate-with-scaffolding/route.ts
const assembled = await parameterAssemblyService.assembleParameters({
  persona_id: body.persona_id,
  emotional_arc_id: body.emotional_arc_id,
  training_topic_id: body.training_topic_id,
});

const result = await generationService.generateSingleConversation({
  templateId: body.template_id,
  parameters: assembled.template_variables,  // ← RESOLVED values!
  tier: 'template',
  userId,
  runId,
});
```

### INCORRECT: How `process-next` Currently Works (BUG)

```typescript
// From src/app/api/batch-jobs/[id]/process-next/route.ts (lines 266-271)
const result = await generationService.generateSingleConversation({
  templateId,
  parameters: item.parameters || {},  // ← Just UUIDs! NOT RESOLVED!
  tier: item.tier,
  userId: job.createdBy,
  runId: jobId,
});
```

### THE FIX PATTERN (Implement This)

```typescript
// Resolve scaffolding data BEFORE generation
const [persona, emotional_arc, training_topic] = await Promise.all([
  scaffoldingService.getPersonaById(item.parameters.persona_id),
  scaffoldingService.getEmotionalArcById(item.parameters.emotional_arc_id),
  scaffoldingService.getTrainingTopicById(item.parameters.training_topic_id),
]);

const resolvedParameters = {
  persona_name: persona.name,
  persona_archetype: persona.archetype,
  persona_demographics: formatDemographics(persona.demographics),
  persona_financial_background: persona.financial_background,
  persona_communication_style: persona.communication_style,
  starting_emotion: emotional_arc.starting_emotion,
  ending_emotion: emotional_arc.ending_emotion,
  arc_description: emotional_arc.arc_description,
  topic_name: training_topic.name,
  topic_description: training_topic.description,
  topic_key_points: formatKeyPoints(training_topic.key_points),
  // ... see parameter-assembly-service.ts for complete list
};

const result = await generationService.generateSingleConversation({
  templateId,
  parameters: resolvedParameters,  // ← RESOLVED!
  tier: item.tier,
  userId: job.createdBy,
  runId: jobId,
});
```

---

## Testing After Fix

After implementing the fixes, verify:

1. **Create a new batch job** with "David Chen" persona
2. **Process the batch** via the batch-jobs UI
3. **Check the generated JSON**:
   - `conversation_metadata.client_persona` should contain "David Chen"
   - The conversation content should reference teacher income ($65k-$85k), not tech worker income
4. **Check the database**:
   - `conversations.persona_id` should match the David Chen UUID
   - `batch_items.parameters.persona_id` should match

---

## Environment Notes

- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL + Storage)
- **AI**: Anthropic Claude API with structured outputs
- **Runtime**: Vercel serverless (execution time limits apply)

---

## Summary for Next Agent

**YOUR MISSION**: Fix the persona mismatch bug that causes generated conversations to use invented persona names instead of the submitted persona.

**STEPS**:
1. Read the specification at `pmc/context-ai/pmct/iteration-1-bug-fixing-step-10_v1.md`
2. Fix `process-next/route.ts` to resolve scaffolding data before generation
3. Fix `conversation-storage-service.ts` to validate/override `client_persona`
4. Test by creating a batch job with a specific persona and verifying the output

**PRIORITY**: Bug #5 (input resolution) is CRITICAL - must fix first. Bug #6 (storage validation) is secondary but important for data integrity.

---

*Document created: 11/15/25 - Updated with persona mismatch root cause analysis*
