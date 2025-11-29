````markdown
# Iteration 2 JSON Structure Bug Fix Specification

**Status**: Bug Fix Specification (FINAL)  
**Created**: 2025-11-29  
**Version**: 3.0  
**Related**: `iteration-2-json-updated_v1.md`  
**Priority**: HIGH - Training data quality is severely impacted  
**Validated**: ✅ Root causes confirmed via file inspection and code analysis

---

## Executive Summary

The iteration-2 JSON improvements specified in `iteration-2-json-updated_v1.md` were **partially implemented but not fully functional**. Testing reveals that:

1. **Raw JSON** (`file_path`): `input_parameters` IS being added correctly ✅
2. **Enriched JSON**: `input_parameters` is NOT being copied to output ❌
3. **Enriched JSON**: The 5 new per-pair metadata fields are NOT being added ❌
4. **Enriched JSON**: `client_background` shows `[object Object]` due to improper serialization ❌

**Root Cause Confirmed**: The enrichment pipeline orchestrator reads from `raw_response_path` (raw Claude output without `input_parameters`) instead of `file_path` (parsed JSON WITH `input_parameters`).

---

## Bug Analysis

### Test Conversation Analyzed

- **conversation_id**: `1a86807b-f74e-44bf-9782-7f1c27814fbd`
- **persona_id**: `5a4a6042-5bb7-4da6-b2e2-119b6f97be6f` (Marcus Chen - The Overwhelmed Avoider)
- **emotional_arc_id**: `d2466485-d5a0-4c54-b9c4-d5ce3cf47ad3` (Shame → Acceptance)
- **training_topic_id**: `a04a104f-96a6-4d0c-b0ea-5f44f4a2203d` (Accelerated Mortgage Payoff)

### Evidence (Verified via File Download)

**Parsed JSON (`file_path`)** - CORRECTLY STORED:
```json
{
  "conversation_metadata": {
    "client_persona": "Marcus Chen - The Overwhelmed Avoider"
  },
  "input_parameters": {
    "persona_id": "5a4a6042-5bb7-4da6-b2e2-119b6f97be6f",
    "persona_key": "overwhelmed_avoider",
    "persona_name": "Marcus Chen",
    "emotional_arc_id": "d2466485-d5a0-4c54-b9c4-d5ce3cf47ad3",
    "emotional_arc_key": "shame_to_acceptance",
    "emotional_arc_name": "Shame → Acceptance",
    "training_topic_id": "a04a104f-96a6-4d0c-b0ea-5f44f4a2203d",
    "training_topic_key": "mortgage_payoff_strategy",
    "training_topic_name": "Accelerated Mortgage Payoff"
  },
  "turns": [...]
}
```

**Raw JSON (`raw_response_path`)** - NO input_parameters (expected):
```json
{
  "conversation_metadata": {
    "client_persona": "Marcus Chen - The Overwhelmed Avoider"
  },
  "turns": [...]
}
```

**Enriched JSON (`enriched_file_path`)** - INCORRECTLY MISSING DATA:
```json
{
  "dataset_metadata": {...},
  "consultant_profile": {...},
  // ❌ MISSING: input_parameters section
  "training_pairs": [
    {
      "conversation_metadata": {
        "client_persona": "Marcus Chen - The Overwhelmed Avoider",
        "client_background": "[object Object]; High earner with complex compensation...",  // ❌ BUG
        "session_context": "...",
        "conversation_phase": "...",
        "expected_outcome": "..."
        // ❌ MISSING: persona_archetype
        // ❌ MISSING: emotional_arc
        // ❌ MISSING: emotional_arc_key
        // ❌ MISSING: training_topic
        // ❌ MISSING: training_topic_key
      }
    }
  ]
}
```

---

## Root Cause Analysis

### Bug #1: Enrichment Pipeline Reads Wrong File (PRIMARY ROOT CAUSE)

**Location**: `src/lib/services/enrichment-pipeline-orchestrator.ts`, `fetchRawJson()` method, lines ~207-225

**Root Cause CONFIRMED**: The orchestrator fetches the **WRONG file**!

**Current Code** (lines 207-225):
```typescript
private async fetchRawJson(conversationId: string): Promise<string | null> {
  // Get raw_response_path from database
  const { data: conversation } = await this.supabase
    .from('conversations')
    .select('raw_response_path')  // ← WRONG! This is the RAW Claude output
    .eq('conversation_id', conversationId)
    .single();

  if (!conversation?.raw_response_path) {
    return null;
  }

  // Download from storage
  const { data, error } = await this.supabase.storage
    .from('conversation-files')
    .download(conversation.raw_response_path);  // ← Downloads raw Claude output (NO input_parameters)
  // ...
}
```

**The Problem**:
1. Pipeline fetches `raw_response_path` → points to `/raw/...` directory (raw Claude output)
2. Raw Claude output does NOT contain `input_parameters` (Claude doesn't generate it)
3. `input_parameters` is added by `parseAndStoreFinal()` and saved to `file_path`
4. So the enrichment service receives JSON WITHOUT `input_parameters`

**Data Flow Timeline**:
```
1. Claude generates response → stored at raw_response_path (NO input_parameters)
2. parseAndStoreFinal() adds input_parameters → stored at file_path (HAS input_parameters)  
3. Enrichment pipeline reads from raw_response_path ← BUG: should read file_path
4. Enrichment service receives JSON without input_parameters
5. Enriched JSON missing input_parameters and per-pair scaffolding
```

**Fix**: The orchestrator should read from `file_path` (parsed JSON), NOT `raw_response_path` (raw Claude output)

### Bug #2: Per-Pair Scaffolding Fields Not Added (Cascade from Bug #1)

**Location**: `src/lib/services/conversation-enrichment-service.ts`, `buildTrainingPair()` method, lines ~420-446

**Current Code** (lines 429-446):
```typescript
// Add scaffolding metadata from input_parameters (for LoRA training effectiveness)
if (inputParameters) {
  if (inputParameters.persona_key) {
    metadata.persona_archetype = inputParameters.persona_key;
  }
  if (inputParameters.emotional_arc_name) {
    metadata.emotional_arc = inputParameters.emotional_arc_name;
  }
  if (inputParameters.emotional_arc_key) {
    metadata.emotional_arc_key = inputParameters.emotional_arc_key;
  }
  if (inputParameters.training_topic_name) {
    metadata.training_topic = inputParameters.training_topic_name;
  }
  if (inputParameters.training_topic_key) {
    metadata.training_topic_key = inputParameters.training_topic_key;
  }
}
```

**Problem**: This code IS present and correct, but `inputParameters` is `undefined` when `buildTrainingPair()` is called.

**Root Cause**: Same as Bug #1 - the enrichment pipeline reads `raw_response_path` which lacks `input_parameters`, so:
1. `enrichConversation()` receives `minimalJson` WITHOUT `input_parameters`
2. `buildTrainingPairs()` receives `minimalJson` WITHOUT `input_parameters`  
3. `buildTrainingPair()` receives `inputParameters: undefined`
4. All scaffolding metadata is skipped

**Fix**: Once Bug #1 is fixed, this will automatically work.

### Bug #3: `client_background` Shows `[object Object]`

**Location**: `src/lib/services/conversation-enrichment-service.ts`, `buildClientBackground()` method, lines ~465-488

**Current Code**:
```typescript
private buildClientBackground(
  persona: DatabaseEnrichmentMetadata['persona'],
  client_persona: string
): string {
  if (!persona) {
    return `Client profile: ${client_persona}`;
  }

  const parts: string[] = [];

  if (persona.demographics) {
    parts.push(persona.demographics);  // ← BUG: demographics is OBJECT, not string
  }

  if (persona.financial_background) {
    parts.push(persona.financial_background);
  }

  if (parts.length === 0) {
    return `Client profile: ${client_persona}`;
  }

  return parts.join('; ');
}
```

**Problem**: `persona.demographics` is a **JSONB object** (verified via database query), not a string:
```json
{
  "age": 37,
  "gender": "male", 
  "location": "Urban/Suburban",
  "family_status": "single or married without kids"
}
```

When you do `parts.push(persona.demographics)` where `demographics` is an object, JavaScript converts it to `"[object Object]"`.

**Database Schema** (confirmed via SAOL query):
- `personas.demographics` = `jsonb` type → returns JavaScript object
- `personas.financial_background` = `text` type → returns string

---

## Detailed Fix Specification

### Fix #1: Read Parsed JSON (file_path) Instead of Raw Response

**File**: `src/lib/services/enrichment-pipeline-orchestrator.ts`

**Location**: `fetchRawJson()` method (rename to `fetchParsedJson()`), lines ~207-225

**Current Code**:
```typescript
private async fetchRawJson(conversationId: string): Promise<string | null> {
  const { data: conversation } = await this.supabase
    .from('conversations')
    .select('raw_response_path')  // ← WRONG
    .eq('conversation_id', conversationId)
    .single();

  if (!conversation?.raw_response_path) {
    return null;
  }

  const { data, error } = await this.supabase.storage
    .from('conversation-files')
    .download(conversation.raw_response_path);  // ← WRONG
  // ...
}
```

**Fixed Code**:
```typescript
/**
 * Fetch parsed JSON from storage (with input_parameters)
 * Prefers file_path (parsed), falls back to raw_response_path (raw Claude output)
 */
private async fetchParsedJson(conversationId: string): Promise<string | null> {
  // Get both paths - prefer file_path which has input_parameters
  const { data: conversation } = await this.supabase
    .from('conversations')
    .select('file_path, raw_response_path')
    .eq('conversation_id', conversationId)
    .single();

  // file_path = parsed JSON with input_parameters (preferred)
  // raw_response_path = raw Claude output (fallback for backward compatibility)
  const jsonPath = conversation?.file_path || conversation?.raw_response_path;
  
  if (!jsonPath) {
    console.log(`[Pipeline] ⚠️ No JSON path found for ${conversationId}`);
    return null;
  }

  // Log which path we're using for debugging
  if (conversation?.file_path) {
    console.log(`[Pipeline] ✅ Using file_path (has input_parameters): ${jsonPath}`);
  } else {
    console.log(`[Pipeline] ⚠️ Falling back to raw_response_path (may lack input_parameters): ${jsonPath}`);
  }

  const { data, error } = await this.supabase.storage
    .from('conversation-files')
    .download(jsonPath);

  if (error || !data) {
    throw new Error(`Failed to download JSON: ${error?.message}`);
  }

  return await data.text();
}
```

**Also update the call site in `runPipeline()` method** (around line 70):

**Current**:
```typescript
// STAGE 1: Fetch raw JSON
console.log(`[Pipeline] Stage 1: Fetching raw JSON`);
const rawJson = await this.fetchRawJson(conversationId);
```

**Fixed**:
```typescript
// STAGE 1: Fetch parsed JSON (with input_parameters)
console.log(`[Pipeline] Stage 1: Fetching parsed JSON`);
const rawJson = await this.fetchParsedJson(conversationId);
```

### Fix #2: Serialize `demographics` Object Properly (with Edge Case Handling)

**File**: `src/lib/services/conversation-enrichment-service.ts`

**Location**: `buildClientBackground()` method, lines ~465-488

**Current Code**:
```typescript
private buildClientBackground(
  persona: DatabaseEnrichmentMetadata['persona'],
  client_persona: string
): string {
  if (!persona) {
    return `Client profile: ${client_persona}`;
  }

  const parts: string[] = [];

  if (persona.demographics) {
    parts.push(persona.demographics);
  }

  if (persona.financial_background) {
    parts.push(persona.financial_background);
  }

  if (parts.length === 0) {
    return `Client profile: ${client_persona}`;
  }

  return parts.join('; ');
}
```

**Fixed Code** (with robust edge case handling):
```typescript
/**
 * Build client_background from persona data
 * Handles demographics as JSONB object and financial_background as text
 */
private buildClientBackground(
  persona: DatabaseEnrichmentMetadata['persona'],
  client_persona: string
): string {
  if (!persona) {
    return `Client profile: ${client_persona}`;
  }

  const parts: string[] = [];

  // Handle demographics as JSONB object (not string)
  if (persona.demographics) {
    if (typeof persona.demographics === 'object' && persona.demographics !== null) {
      const demo = persona.demographics as Record<string, unknown>;
      const demoString = [
        demo.age !== undefined && demo.age !== null ? `Age ${demo.age}` : null,
        typeof demo.gender === 'string' ? demo.gender : null,
        typeof demo.location === 'string' ? demo.location : null,
        typeof demo.family_status === 'string' ? demo.family_status : null
      ].filter(Boolean).join(', ');
      
      if (demoString) {
        parts.push(demoString);
      }
    } else if (typeof persona.demographics === 'string') {
      // Handle legacy string format (backward compatibility)
      parts.push(persona.demographics);
    }
    // Silently skip if demographics is neither object nor string
  }

  // Handle financial_background (should be text/string)
  if (persona.financial_background) {
    if (typeof persona.financial_background === 'string') {
      parts.push(persona.financial_background);
    } else if (typeof persona.financial_background === 'object') {
      // Unexpected: financial_background is object, stringify it
      try {
        const fbString = JSON.stringify(persona.financial_background);
        parts.push(fbString);
      } catch {
        // Skip if serialization fails
        console.warn(`[Enrichment] ⚠️ Could not serialize financial_background`);
      }
    }
  }

  if (parts.length === 0) {
    return `Client profile: ${client_persona}`;
  }

  return parts.join('; ');
}
```

**Expected Output After Fix**:
```
"Age 37, male, Urban/Suburban, single or married without kids; High earner with complex compensation..."
```

---

## Implementation Checklist

### Pre-Implementation Verification

- [x] Read `src/app/api/conversations/[id]/enrich/route.ts` to understand the enrichment trigger ✅
- [x] Trace data flow from file download → parse → enrichConversation() call ✅
- [x] Verify `MinimalConversation` interface matches stored JSON structure ✅
- [x] **ROOT CAUSE CONFIRMED**: Orchestrator reads wrong file (`raw_response_path` instead of `file_path`)
- [x] **FILE VERIFICATION**: Downloaded all 3 files and confirmed `file_path` has `input_parameters`

### Code Changes

1. **Bug #1 & #2 Fix** (orchestrator reading wrong file) - **PRIMARY FIX**:
   - [ ] Update `enrichment-pipeline-orchestrator.ts`:
     - [ ] Rename `fetchRawJson()` to `fetchParsedJson()`
     - [ ] Change to select `file_path, raw_response_path` (both columns)
     - [ ] Prefer `file_path` (parsed JSON with input_parameters)
     - [ ] Fallback to `raw_response_path` if `file_path` doesn't exist (backward compatibility)
     - [ ] Add logging to indicate which path is being used
   - [ ] Update logging message in `runPipeline()` to say "Fetching parsed JSON"

2. **Bug #3 Fix** (demographics serialization):
   - [ ] Update `buildClientBackground()` in `conversation-enrichment-service.ts`
   - [ ] Handle `demographics` as JSONB object with proper field extraction
   - [ ] Handle edge cases: null, undefined, missing fields, unexpected types
   - [ ] Add fallback for legacy string format (backward compatibility)
   - [ ] Handle unexpected `financial_background` object type gracefully

### Test Updates

3. **Unit Tests** (NEW):
   - [ ] Create/update test file: `src/lib/services/__tests__/enrichment-pipeline-orchestrator.test.ts`
     - [ ] Test that orchestrator prefers `file_path` over `raw_response_path`
     - [ ] Test fallback to `raw_response_path` when `file_path` is null
     - [ ] Test error handling when neither path exists
   - [ ] Create/update test file: `src/lib/services/__tests__/conversation-enrichment-service.test.ts`
     - [ ] Test `buildClientBackground()` with JSONB demographics object
     - [ ] Test `buildClientBackground()` with string demographics (legacy)
     - [ ] Test `buildClientBackground()` with missing/null demographics
     - [ ] Test `buildClientBackground()` with partial demographics (some fields missing)
     - [ ] Test scaffolding metadata is added when `input_parameters` present
     - [ ] Test scaffolding metadata is skipped when `input_parameters` absent

4. **Integration Tests** (NEW):
   - [ ] Add test to `scripts/` folder: `test-enrichment-pipeline.js`
     - [ ] Generate a test conversation with known scaffolding IDs
     - [ ] Run enrichment pipeline
     - [ ] Verify enriched JSON has `input_parameters`
     - [ ] Verify each training_pair has scaffolding metadata
     - [ ] Verify `client_background` is properly formatted string

### Post-Implementation Testing

- [ ] Generate new batch conversation
- [ ] Enrich the conversation
- [ ] Download enriched JSON and verify:
  - [ ] `input_parameters` section exists at file level
  - [ ] Each training pair has `persona_archetype`
  - [ ] Each training pair has `emotional_arc` and `emotional_arc_key`
  - [ ] Each training pair has `training_topic` and `training_topic_key`
  - [ ] `client_background` is a proper string (no `[object Object]`)
- [ ] Test backward compatibility with old conversations (no `file_path`)

---

## Database Schema Reference

### personas table
| Column | Type | Sample Value |
|--------|------|--------------|
| id | uuid | `5a4a6042-5bb7-4da6-b2e2-119b6f97be6f` |
| persona_key | text | `overwhelmed_avoider` |
| name | text | `Marcus Chen` |
| archetype | text | `The Overwhelmed Avoider` |
| demographics | **jsonb** | `{"age":37,"gender":"male","location":"Urban/Suburban","family_status":"single or married without kids"}` |
| financial_background | text | `High earner with complex compensation...` |

### emotional_arcs table
| Column | Type | Sample Value |
|--------|------|--------------|
| id | uuid | `d2466485-d5a0-4c54-b9c4-d5ce3cf47ad3` |
| arc_key | text | `shame_to_acceptance` |
| name | text | `Shame → Acceptance` |

### training_topics table
| Column | Type | Sample Value |
|--------|------|--------------|
| id | uuid | `a04a104f-96a6-4d0c-b0ea-5f44f4a2203d` |
| topic_key | text | `mortgage_payoff_strategy` |
| name | text | `Accelerated Mortgage Payoff` |

### conversations table (relevant columns)
| Column | Type | Description |
|--------|------|-------------|
| raw_response_path | text | Path to raw Claude output (NO input_parameters) |
| file_path | text | Path to parsed JSON (HAS input_parameters) |
| enriched_file_path | text | Path to enriched JSON |

---

## Files To Modify

| File | Changes Required | Priority |
|------|------------------|----------|
| `src/lib/services/enrichment-pipeline-orchestrator.ts` | **PRIMARY FIX**: Change `fetchRawJson()` to `fetchParsedJson()`, read from `file_path` instead of `raw_response_path` | P0 |
| `src/lib/services/conversation-enrichment-service.ts` | Fix `buildClientBackground()` demographics serialization with edge case handling | P1 |
| `src/lib/services/__tests__/enrichment-pipeline-orchestrator.test.ts` | Add unit tests for file path selection | P2 |
| `src/lib/services/__tests__/conversation-enrichment-service.test.ts` | Add unit tests for demographics handling | P2 |
| `scripts/test-enrichment-pipeline.js` | Add integration test script | P2 |

---

## Data Flow Diagram (Current vs Fixed)

### CURRENT (Broken)
```
Claude API → raw response → storeRawResponse() → raw_response_path
                                    ↓
                           parseAndStoreFinal() → file_path (HAS input_parameters)
                                    ↓
Enrichment Pipeline reads → raw_response_path ← WRONG! (NO input_parameters)
                                    ↓
                           Enriched JSON missing scaffolding data
```

### FIXED
```
Claude API → raw response → storeRawResponse() → raw_response_path
                                    ↓
                           parseAndStoreFinal() → file_path (HAS input_parameters)
                                    ↓
Enrichment Pipeline reads → file_path ← CORRECT! (HAS input_parameters)
                                    ↓
                           Enriched JSON with full scaffolding data
```

---

## Expected Final JSON Structure

### Enriched JSON (after fix)
```json
{
  "dataset_metadata": {...},
  "consultant_profile": {...},
  "input_parameters": {
    "persona_id": "5a4a6042-5bb7-4da6-b2e2-119b6f97be6f",
    "persona_key": "overwhelmed_avoider",
    "persona_name": "Marcus Chen",
    "emotional_arc_id": "d2466485-d5a0-4c54-b9c4-d5ce3cf47ad3",
    "emotional_arc_key": "shame_to_acceptance",
    "emotional_arc_name": "Shame → Acceptance",
    "training_topic_id": "a04a104f-96a6-4d0c-b0ea-5f44f4a2203d",
    "training_topic_key": "mortgage_payoff_strategy",
    "training_topic_name": "Accelerated Mortgage Payoff"
  },
  "training_pairs": [
    {
      "conversation_metadata": {
        "client_persona": "Marcus Chen - The Overwhelmed Avoider",
        "persona_archetype": "overwhelmed_avoider",
        "client_background": "Age 37, male, Urban/Suburban, single or married without kids; High earner with complex compensation (RSUs, stock options). Good income but feels paralyzed by complexity.",
        "emotional_arc": "Shame → Acceptance",
        "emotional_arc_key": "shame_to_acceptance",
        "training_topic": "Accelerated Mortgage Payoff",
        "training_topic_key": "mortgage_payoff_strategy",
        "session_context": "...",
        "conversation_phase": "...",
        "expected_outcome": "..."
      },
      ...
    }
  ]
}
```

---

## Code Snippets for Implementation

### Fix 1: enrichment-pipeline-orchestrator.ts

**Full method replacement** (`fetchRawJson` → `fetchParsedJson`):

```typescript
/**
 * Fetch parsed JSON from storage (with input_parameters)
 * Prefers file_path (parsed), falls back to raw_response_path (raw Claude output)
 */
private async fetchParsedJson(conversationId: string): Promise<string | null> {
  // Get both paths - prefer file_path which has input_parameters
  const { data: conversation } = await this.supabase
    .from('conversations')
    .select('file_path, raw_response_path')
    .eq('conversation_id', conversationId)
    .single();

  // file_path = parsed JSON with input_parameters (preferred)
  // raw_response_path = raw Claude output (fallback for backward compatibility)
  const jsonPath = conversation?.file_path || conversation?.raw_response_path;
  
  if (!jsonPath) {
    console.log(`[Pipeline] ⚠️ No JSON path found for ${conversationId}`);
    return null;
  }

  // Log which path we're using for debugging
  if (conversation?.file_path) {
    console.log(`[Pipeline] ✅ Using file_path (has input_parameters): ${jsonPath}`);
  } else {
    console.log(`[Pipeline] ⚠️ Falling back to raw_response_path (may lack input_parameters): ${jsonPath}`);
  }

  const { data, error } = await this.supabase.storage
    .from('conversation-files')
    .download(jsonPath);

  if (error || !data) {
    throw new Error(`Failed to download JSON: ${error?.message}`);
  }

  return await data.text();
}
```

### Fix 2: conversation-enrichment-service.ts

**Full method replacement** (`buildClientBackground`):

```typescript
/**
 * Build client_background from persona data
 * Handles demographics as JSONB object and financial_background as text
 */
private buildClientBackground(
  persona: DatabaseEnrichmentMetadata['persona'],
  client_persona: string
): string {
  if (!persona) {
    return `Client profile: ${client_persona}`;
  }

  const parts: string[] = [];

  // Handle demographics as JSONB object (not string)
  if (persona.demographics) {
    if (typeof persona.demographics === 'object' && persona.demographics !== null) {
      const demo = persona.demographics as Record<string, unknown>;
      const demoString = [
        demo.age !== undefined && demo.age !== null ? `Age ${demo.age}` : null,
        typeof demo.gender === 'string' ? demo.gender : null,
        typeof demo.location === 'string' ? demo.location : null,
        typeof demo.family_status === 'string' ? demo.family_status : null
      ].filter(Boolean).join(', ');
      
      if (demoString) {
        parts.push(demoString);
      }
    } else if (typeof persona.demographics === 'string') {
      // Handle legacy string format (backward compatibility)
      parts.push(persona.demographics);
    }
    // Silently skip if demographics is neither object nor string
  }

  // Handle financial_background (should be text/string)
  if (persona.financial_background) {
    if (typeof persona.financial_background === 'string') {
      parts.push(persona.financial_background);
    } else if (typeof persona.financial_background === 'object') {
      // Unexpected: financial_background is object, stringify it
      try {
        const fbString = JSON.stringify(persona.financial_background);
        parts.push(fbString);
      } catch {
        // Skip if serialization fails
        console.warn(`[Enrichment] ⚠️ Could not serialize financial_background`);
      }
    }
  }

  if (parts.length === 0) {
    return `Client profile: ${client_persona}`;
  }

  return parts.join('; ');
}
```

---

## Test Code Snippets

### Unit Test: enrichment-pipeline-orchestrator.test.ts

```typescript
import { EnrichmentPipelineOrchestrator } from '../enrichment-pipeline-orchestrator';

describe('EnrichmentPipelineOrchestrator', () => {
  describe('fetchParsedJson', () => {
    it('should prefer file_path over raw_response_path', async () => {
      // Mock supabase to return both paths
      const mockConversation = {
        file_path: 'user123/conv456/conversation.json',
        raw_response_path: 'raw/user123/conv456.json'
      };
      
      // Verify file_path is used
      // ...
    });

    it('should fallback to raw_response_path when file_path is null', async () => {
      const mockConversation = {
        file_path: null,
        raw_response_path: 'raw/user123/conv456.json'
      };
      
      // Verify raw_response_path is used as fallback
      // ...
    });

    it('should return null when neither path exists', async () => {
      const mockConversation = {
        file_path: null,
        raw_response_path: null
      };
      
      // Verify null is returned
      // ...
    });
  });
});
```

### Unit Test: conversation-enrichment-service.test.ts

```typescript
import { ConversationEnrichmentService } from '../conversation-enrichment-service';

describe('ConversationEnrichmentService', () => {
  describe('buildClientBackground', () => {
    it('should handle JSONB demographics object', () => {
      const persona = {
        name: 'Marcus Chen',
        archetype: 'The Overwhelmed Avoider',
        demographics: {
          age: 37,
          gender: 'male',
          location: 'Urban/Suburban',
          family_status: 'single or married without kids'
        },
        financial_background: 'High earner with complex compensation'
      };
      
      const result = service.buildClientBackground(persona, 'Marcus Chen');
      
      expect(result).toBe('Age 37, male, Urban/Suburban, single or married without kids; High earner with complex compensation');
      expect(result).not.toContain('[object Object]');
    });

    it('should handle string demographics (legacy format)', () => {
      const persona = {
        name: 'Test User',
        archetype: 'Test Archetype',
        demographics: 'Age 35, female, Urban',
        financial_background: 'Middle income'
      };
      
      const result = service.buildClientBackground(persona, 'Test User');
      
      expect(result).toBe('Age 35, female, Urban; Middle income');
    });

    it('should handle missing demographics fields gracefully', () => {
      const persona = {
        name: 'Test User',
        archetype: 'Test Archetype',
        demographics: {
          age: 40
          // gender, location, family_status missing
        },
        financial_background: 'Some background'
      };
      
      const result = service.buildClientBackground(persona, 'Test User');
      
      expect(result).toBe('Age 40; Some background');
    });

    it('should handle null persona', () => {
      const result = service.buildClientBackground(null, 'Fallback Name');
      
      expect(result).toBe('Client profile: Fallback Name');
    });
  });

  describe('buildTrainingPair scaffolding', () => {
    it('should add scaffolding metadata when input_parameters present', () => {
      const inputParameters = {
        persona_key: 'overwhelmed_avoider',
        emotional_arc_name: 'Shame → Acceptance',
        emotional_arc_key: 'shame_to_acceptance',
        training_topic_name: 'Accelerated Mortgage Payoff',
        training_topic_key: 'mortgage_payoff_strategy'
      };
      
      // Call buildTrainingPair with inputParameters
      // Verify metadata contains all 5 scaffolding fields
    });

    it('should skip scaffolding metadata when input_parameters absent', () => {
      // Call buildTrainingPair with inputParameters = undefined
      // Verify metadata does NOT contain scaffolding fields
    });
  });
});
```

### Integration Test: scripts/test-enrichment-pipeline.js

```javascript
/**
 * Integration test for enrichment pipeline
 * Verifies end-to-end that input_parameters flows through to enriched JSON
 */

require('../load-env.js');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runTest() {
  console.log('=== ENRICHMENT PIPELINE INTEGRATION TEST ===\n');
  
  // Find a conversation with both file_path and enriched_file_path
  const { data: conv, error } = await supabase
    .from('conversations')
    .select('conversation_id, file_path, enriched_file_path, persona_id')
    .not('file_path', 'is', null)
    .not('enriched_file_path', 'is', null)
    .limit(1)
    .single();

  if (error || !conv) {
    console.error('No suitable conversation found for testing');
    return;
  }

  console.log(`Testing conversation: ${conv.conversation_id}`);
  console.log(`  file_path: ${conv.file_path}`);
  console.log(`  enriched_file_path: ${conv.enriched_file_path}`);
  
  // Download parsed JSON
  const { data: parsedFile } = await supabase.storage
    .from('conversation-files')
    .download(conv.file_path);
  
  const parsedJson = JSON.parse(await parsedFile.text());
  
  // Download enriched JSON
  const { data: enrichedFile } = await supabase.storage
    .from('conversation-files')
    .download(conv.enriched_file_path);
  
  const enrichedJson = JSON.parse(await enrichedFile.text());
  
  // Test 1: Parsed JSON has input_parameters
  console.log('\n--- Test 1: Parsed JSON has input_parameters ---');
  const hasInputParams = !!parsedJson.input_parameters;
  console.log(`  Result: ${hasInputParams ? '✅ PASS' : '❌ FAIL'}`);
  
  // Test 2: Enriched JSON has input_parameters
  console.log('\n--- Test 2: Enriched JSON has input_parameters ---');
  const enrichedHasInputParams = !!enrichedJson.input_parameters;
  console.log(`  Result: ${enrichedHasInputParams ? '✅ PASS' : '❌ FAIL'}`);
  
  // Test 3: Training pairs have scaffolding metadata
  console.log('\n--- Test 3: Training pairs have scaffolding metadata ---');
  const firstPair = enrichedJson.training_pairs?.[0];
  const hasScaffolding = firstPair?.conversation_metadata?.persona_archetype &&
                         firstPair?.conversation_metadata?.emotional_arc &&
                         firstPair?.conversation_metadata?.training_topic;
  console.log(`  persona_archetype: ${firstPair?.conversation_metadata?.persona_archetype || 'MISSING'}`);
  console.log(`  emotional_arc: ${firstPair?.conversation_metadata?.emotional_arc || 'MISSING'}`);
  console.log(`  training_topic: ${firstPair?.conversation_metadata?.training_topic || 'MISSING'}`);
  console.log(`  Result: ${hasScaffolding ? '✅ PASS' : '❌ FAIL'}`);
  
  // Test 4: client_background is proper string (no [object Object])
  console.log('\n--- Test 4: client_background is proper string ---');
  const clientBg = firstPair?.conversation_metadata?.client_background || '';
  const hasObjectObject = clientBg.includes('[object Object]');
  console.log(`  client_background: ${clientBg.substring(0, 80)}...`);
  console.log(`  Result: ${!hasObjectObject ? '✅ PASS' : '❌ FAIL (contains [object Object])'}`);
  
  // Summary
  console.log('\n=== SUMMARY ===');
  const allPassed = hasInputParams && enrichedHasInputParams && hasScaffolding && !hasObjectObject;
  console.log(allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
}

runTest().catch(console.error);
```

---

## Priority Order

1. **P0 - CRITICAL**: Fix Bug #1 (orchestrator reading wrong file) - This is the root cause of missing scaffolding
2. **P1 - HIGH**: Fix Bug #3 (`client_background` serialization) - Clear user-visible impact
3. **P2 - MEDIUM**: Add unit tests for both fixes
4. **P2 - MEDIUM**: Add integration test script
5. **P3 - LOW**: Add validation to ensure `input_parameters` is always present when expected

---

## Verification Checklist

After implementing fixes:

- [ ] Parsed JSON (`file_path`) contains `input_parameters` with all 9 fields ✅ (already working)
- [ ] Enriched JSON contains `input_parameters` (copied from parsed)
- [ ] Each training_pair has `persona_archetype` field
- [ ] Each training_pair has `emotional_arc` field  
- [ ] Each training_pair has `emotional_arc_key` field
- [ ] Each training_pair has `training_topic` field
- [ ] Each training_pair has `training_topic_key` field
- [ ] `client_background` is proper text (no "[object Object]")
- [ ] Console logs show: `[Pipeline] ✅ Using file_path (has input_parameters)`
- [ ] Console logs show: `[Enrichment] ✅ Added scaffolding metadata to N training pairs`
- [ ] Old conversations (without `file_path`) still enrich successfully using `raw_response_path` fallback
- [ ] All unit tests pass
- [ ] Integration test script passes

---

## Rollback Plan

If issues arise after deployment:

1. **Immediate**: Revert the `enrichment-pipeline-orchestrator.ts` change (single file)
2. **Temporary Fix**: Force use of `raw_response_path` while investigating
3. **Data**: No data migration needed - both paths are stored in database

---

*Document Version: 3.0 (FINAL)*  
*Last Updated: 2025-11-29*  
*Investigation Method: Database queries, file downloads, code analysis*  
*Validation: Root causes confirmed via actual file inspection*
````
