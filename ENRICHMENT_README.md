# Conversation Enrichment Service

**Version:** 1.0  
**Status:** ✅ Production Ready  
**Last Updated:** November 20, 2025

---

## Overview

The Conversation Enrichment Service transforms minimal JSON conversations from Claude into enriched, training-ready JSON files by populating predetermined fields from the database.

### What It Does

1. **Fetches Database Metadata** - Retrieves data from personas, emotional_arcs, training_topics, templates, generation_logs
2. **Enriches Conversations** - Populates missing fields with database data and calculated values
3. **Stores Results** - Saves enriched JSON to Supabase Storage and updates database
4. **Tracks Progress** - Updates enrichment_status for pipeline visibility

### What It Doesn't Do (Out of Scope)

- ❌ AI analysis of content
- ❌ Quality scoring (uses existing scores)
- ❌ Response strategy calculation
- ❌ Validation (handled by separate service)

---

## Quick Links

- **[Quick Start Guide](./ENRICHMENT_QUICK_START.md)** - Get running in 5 minutes
- **[Implementation Summary](./ENRICHMENT_IMPLEMENTATION_SUMMARY.md)** - Detailed documentation
- **[Test Script](./test-enrichment.ts)** - Example usage
- **[Setup Script](./setup-test-conversation.ts)** - Database setup helper

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Enrichment Pipeline                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Raw Storage (✅ Complete)                               │
│     └─ Claude JSON → raw_response_path                      │
│                                                              │
│  2. Validation (✅ Complete)                                │
│     └─ ConversationValidationService validates structure    │
│                                                              │
│  3. Enrichment (✅ Complete - THIS SERVICE)                 │
│     └─ ConversationEnrichmentService populates fields       │
│                                                              │
│  4. Normalization (⏭️ Future)                               │
│     └─ Standardize formats, validate ranges                 │
│                                                              │
│  5. API Export (⏭️ Future)                                  │
│     └─ REST API for training data export                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

```
┌─────────────────────┐
│   Minimal JSON      │  From Claude (validated)
│  (4 required fields)│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│  ConversationEnrichmentService              │
├─────────────────────────────────────────────┤
│                                             │
│  Fetches from DB:                           │
│  • conversations (quality_score, IDs)       │
│  • personas (demographics, background)      │
│  • emotional_arcs (emotions, progression)   │
│  • training_topics (complexity)             │
│  • prompt_templates (objectives, skills)    │
│  • generation_logs (system_prompt)          │
│                                             │
│  Calculates:                                │
│  • Emotional valence (pos/neg/mixed)        │
│  • Quality breakdown (4 scores)             │
│  • Conversation history                     │
│  • Client background                        │
│                                             │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│   Enriched JSON (Training-Ready)            │
├─────────────────────────────────────────────┤
│  • dataset_metadata (11 fields)             │
│  • consultant_profile (static config)       │
│  • training_pairs[] (1 per turn)            │
│    - conversation_metadata (5 fields)       │
│    - system_prompt                          │
│    - conversation_history[]                 │
│    - current_user_input                     │
│    - emotional_context (valence added)      │
│    - target_response                        │
│    - training_metadata (10 fields)          │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Storage (Supabase)                         │
├─────────────────────────────────────────────┤
│  • File: {userId}/{convId}/enriched.json    │
│  • DB: enriched_file_path, enriched_at      │
│  • Status: enrichment_status = 'enriched'   │
└─────────────────────────────────────────────┘
```

---

## Installation

```bash
# Already installed in this project
npm install
```

Dependencies:
- `@supabase/supabase-js` - Supabase client
- `dotenv` - Environment variables
- `tsx` - TypeScript execution (dev)

---

## Usage

### Basic Usage

```typescript
import { getEnrichmentService } from './src/lib/services/conversation-enrichment-service';

const service = getEnrichmentService();

const minimalJson = {
  conversation_metadata: {
    client_persona: "Client Name",
    session_context: "Context",
    conversation_phase: "phase",
    expected_outcome: "outcome"
  },
  turns: [/* ... */]
};

const enriched = await service.enrichConversation(
  'conversation-id',
  minimalJson
);

console.log(enriched.training_pairs.length); // Number of turns
```

### With Storage

```typescript
import { getEnrichmentService } from './src/lib/services/conversation-enrichment-service';
import { getConversationStorageService } from './src/lib/services/conversation-storage-service';

const enrichmentService = getEnrichmentService();
const storageService = getConversationStorageService();

// Enrich
const enriched = await enrichmentService.enrichConversation(
  conversationId,
  minimalJson
);

// Store
const result = await storageService.storeEnrichedConversation(
  conversationId,
  userId,
  enriched
);

if (result.success) {
  console.log(`Stored at: ${result.enrichedPath}`);
}
```

---

## API Reference

### ConversationEnrichmentService

#### Constructor

```typescript
new ConversationEnrichmentService(supabaseClient?: SupabaseClient)
```

Creates a new enrichment service instance. If no client provided, creates one from environment variables.

#### enrichConversation()

```typescript
async enrichConversation(
  conversationId: string,
  minimalJson: MinimalConversation
): Promise<EnrichedConversation>
```

Enriches a minimal conversation with database metadata and calculated fields.

**Parameters:**
- `conversationId` - ID of conversation to enrich
- `minimalJson` - Validated minimal JSON from Claude

**Returns:** `EnrichedConversation` with all fields populated

**Throws:** Error if conversation not found or database fetch fails

### ConversationStorageService

#### storeEnrichedConversation()

```typescript
async storeEnrichedConversation(
  conversationId: string,
  userId: string,
  enrichedData: EnrichedConversation
): Promise<{
  success: boolean;
  enrichedPath: string;
  enrichedSize: number;
  error?: string;
}>
```

Stores enriched conversation to Supabase Storage and updates database.

**Parameters:**
- `conversationId` - Conversation ID
- `userId` - User ID for file path
- `enrichedData` - Enriched conversation data

**Returns:** Storage result with path and size

---

## Types

### EnrichedConversation

```typescript
interface EnrichedConversation {
  dataset_metadata: DatasetMetadata;
  consultant_profile: ConsultantProfile;
  training_pairs: TrainingPair[];
}
```

### DatasetMetadata

```typescript
interface DatasetMetadata {
  dataset_name: string;
  version: string;
  created_date: string;
  vertical: string;
  consultant_persona: string;
  target_use: string;
  conversation_source: string;
  quality_tier: string;
  total_conversations: number;
  total_turns: number;
  notes: string;
}
```

### TrainingPair

```typescript
interface TrainingPair {
  id: string;
  conversation_id: string;
  turn_number: number;
  conversation_metadata: { /* ... */ };
  system_prompt: string;
  conversation_history: ConversationHistoryTurn[];
  current_user_input: string;
  emotional_context: { /* ... */ };
  target_response: string | null;
  training_metadata: { /* ... */ };
}
```

See `src/lib/types/conversations.ts` for complete type definitions.

---

## Configuration

### Consultant Profile

The consultant profile is static and defined in `conversation-enrichment-service.ts`:

```typescript
const CONSULTANT_PROFILE = {
  name: "Elena Morales, CFP",
  business: "Pathways Financial Planning",
  expertise: "fee-only financial planning for mid-career professionals",
  years_experience: 15,
  core_philosophy: {
    principle_1: "Money is emotional - always acknowledge feelings before facts",
    // ...
  },
  communication_style: {
    tone: "warm, professional, never condescending",
    techniques: [/* ... */],
    avoid: [/* ... */]
  }
};
```

To customize, edit this constant in the service file.

### System Prompt

The default system prompt is reconstructed if not found in generation_logs:

```typescript
"You are an emotionally intelligent financial planning chatbot representing Elena Morales, CFP of Pathways Financial Planning. Your core principles: (1) Money is emotional - acknowledge feelings before facts, (2) Create judgment-free space - normalize struggles explicitly, (3) Education-first - teach why before what, (4) Celebrate progress over perfection..."
```

To customize, edit the `getSystemPrompt()` method.

---

## Testing

### Run Tests

```bash
# 1. Setup test conversation
npx tsx setup-test-conversation.ts

# 2. Run enrichment test
npx tsx test-enrichment.ts
```

### Verify Results

**Check Storage:**
- Supabase Dashboard > Storage > `conversation-files`
- Navigate to `test-user-001/test-conv-001/enriched.json`

**Check Database:**
```sql
SELECT 
  conversation_id,
  enrichment_status,
  enriched_file_path,
  enriched_at
FROM conversations
WHERE conversation_id = 'test-conv-001';
```

---

## Performance

### Database Queries

Per conversation enrichment:
- 1 query for conversation record
- 0-5 queries for scaffolding data (if IDs exist)

**Optimization Opportunity:** Could combine into single JOIN query.

### Memory Usage

- Minimal JSON: ~1-2 KB
- Enriched JSON: ~3-5 KB per conversation
- Service holds entire conversation in memory

### Typical Timing

- Fetch metadata: 50-200ms
- Build enriched data: 5-20ms
- Store to storage: 100-300ms
- **Total: ~150-500ms per conversation**

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Failed to fetch conversation" | Conversation doesn't exist | Create conversation first |
| "Invalid JSON syntax" | Malformed minimal JSON | Run validation service first |
| "Storage upload failed" | Permission/bucket issue | Check storage permissions |
| "Database update failed" | SQL constraint violation | Check enrichment_status values |

### Error Recovery

The service uses try/catch and logs errors. Storage operations can be retried safely (upsert mode).

---

## Monitoring

### Success Metrics

Track these in your monitoring system:
- Enrichment success rate (target: >99%)
- Average enrichment time (target: <500ms)
- Storage success rate (target: 100%)
- Database update success rate (target: 100%)

### Log Messages

The service logs:
- `[Enrichment] Starting enrichment for conversation {id}`
- `[Enrichment] Fetching database metadata for {id}`
- `[Enrichment] ✅ Database metadata fetched`
- `[Enrichment] ✅ Enrichment complete: {n} training pairs created`
- `[Storage] ✅ Enriched file stored at {path}`

---

## Database Schema

### Enrichment Tracking Columns

```sql
-- Added by migration 20251120_add_enrichment_tracking.sql

enrichment_status VARCHAR(50) DEFAULT 'not_started'
  CHECK (enrichment_status IN (
    'not_started',
    'validation_failed',
    'validated',
    'enrichment_in_progress',
    'enriched',
    'normalization_failed',
    'completed'
  ));

validation_report JSONB;          -- ValidationResult with blockers/warnings
enriched_file_path TEXT;          -- Storage path (NOT URL)
enriched_file_size BIGINT;        -- File size in bytes
enriched_at TIMESTAMPTZ;          -- When enrichment completed
enrichment_version VARCHAR(20) DEFAULT 'v1.0';
enrichment_error TEXT;            -- Last error message
```

---

## Best Practices

### 1. Run Validation First

Always validate before enriching:

```typescript
const validationService = getValidationService();
const enrichmentService = getEnrichmentService();

// Validate
const validation = await validationService.validateMinimalJson(rawJson, convId);

if (!validation.isValid) {
  console.error('Validation failed:', validation.blockers);
  return;
}

// Enrich
const enriched = await enrichmentService.enrichConversation(convId, parsed);
```

### 2. Handle Missing Scaffolding Data

The service handles missing data gracefully:

```typescript
// If persona_id is null, uses default client_background
// If template_id is null, uses default learning_objective
// If emotional_arc_id is null, emotional_progression_target is empty
```

### 3. Batch Processing

For multiple conversations:

```typescript
const results = await Promise.allSettled(
  conversationIds.map(id => 
    enrichmentService.enrichConversation(id, minimalJsonMap[id])
  )
);

const succeeded = results.filter(r => r.status === 'fulfilled');
const failed = results.filter(r => r.status === 'rejected');

console.log(`✅ ${succeeded.length} enriched, ❌ ${failed.length} failed`);
```

### 4. Error Tracking

Update enrichment_status on error:

```typescript
try {
  const enriched = await enrichmentService.enrichConversation(id, json);
  // Success: status updated by storeEnrichedConversation()
} catch (error) {
  await supabase
    .from('conversations')
    .update({
      enrichment_status: 'enrichment_failed',
      enrichment_error: error.message
    })
    .eq('conversation_id', id);
}
```

---

## Roadmap

### Future Enhancements

1. **Batch Enrichment API** - Enrich multiple conversations in one call
2. **Webhook Integration** - Trigger enrichment on conversation creation
3. **Quality Validation** - Verify enriched data meets training requirements
4. **Custom Profiles** - Support multiple consultant profiles
5. **Template-Based Enrichment** - Different enrichment rules per template
6. **Performance Optimization** - Single-query metadata fetch with JOINs
7. **Caching** - Cache scaffolding data for repeated enrichments

### Integration Points

- **Validation Service** (✅ Complete) - Validates minimal JSON structure
- **Normalization Service** (⏭️ Next) - Standardizes enriched data
- **Export API** (⏭️ Future) - Exports training-ready JSON
- **Generation Pipeline** (⏭️ Future) - Auto-enrich after Claude generation

---

## Support

### Documentation

- [Quick Start](./ENRICHMENT_QUICK_START.md) - Setup and testing guide
- [Implementation Summary](./ENRICHMENT_IMPLEMENTATION_SUMMARY.md) - Complete specs
- [Source Prompt](./pmc/product/_mapping/unique/cat-to-conv-P01/06-cat-to-conv-file-filling-execution-prompts-E01_v2.md) - Original requirements

### Code Locations

- **Service:** `src/lib/services/conversation-enrichment-service.ts`
- **Types:** `src/lib/types/conversations.ts`
- **Storage:** `src/lib/services/conversation-storage-service.ts`
- **Tests:** `test-enrichment.ts`, `setup-test-conversation.ts`
- **Migration:** `supabase/migrations/20251120_add_enrichment_tracking.sql`

### Getting Help

For issues:
1. Check error messages in console output
2. Verify environment variables are set
3. Check Supabase Dashboard for database/storage issues
4. Review test script output for debugging info

---

## License

Part of BrightHub/Bright Run LoRA Training Data Platform  
Internal use only

---

**Status:** ✅ Production Ready  
**Version:** 1.0  
**Last Updated:** November 20, 2025

