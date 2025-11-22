# Conversation Scenario: Chunks Application Deep Dive
**Version:** 1.0  
**Date:** November 21, 2025  
**Purpose:** Detailed examination of how document chunks are selected, constructed, and applied to conversation generation  
**Method:** Direct code analysis + real database queries via SAOL

---

## Executive Summary

**Key Finding:** Chunks are **OPTIONAL** in the current system. Your recent conversation (`fp_conversation_17b3e49b-8874-4d46-b6b4-97a73b990bdf`) did **NOT** use any chunk data at all—all conversations in the database have `chunk_id: null`.

The chunk injection system is **fully implemented in code** but **not currently being used** in production conversations.

---

## Question 1: Terminology Confirmation

### ✅ **YES - Semantics Confirmed**

When referring to "chunk data," I mean:

**Source Data:**
- Generated from documents via the **Upload → Categorization → Chunking** process
- The actual text content extracted from your business documents

**Storage Tables (Two-Part System):**

1. **`chunks` table** (177 records) - Raw content and metadata
   - `chunk_text` - The actual document content (this is the PRIMARY field)
   - `chunk_type` - One of: `Chapter_Sequential`, `Instructional_Unit`, `CER`, `Example_Scenario`
   - `section_heading` - E.g., "The Sales Model", "Six-Step Funnel Calculation Process"
   - `document_id` - Foreign key to parent document
   - `token_count` - Size of this chunk
   - `chunk_handle` - Human-readable slug (e.g., `"the-sales-model"`)

2. **`chunk_dimensions` table** (174 records) - AI-generated semantic metadata
   - Linked to `chunks` via `chunk_id` foreign key
   - Contains 50+ AI-generated dimension fields
   - Includes persona suggestions, emotion tags, domain classifications
   - Stores `run_id` to track which generation run produced these dimensions

**Relationship:**
```
chunks (1) ←→ (many) chunk_dimensions
```

Each chunk can have multiple dimension records (one per generation run), though typically you'd use the most recent one.

---

## Question 2: Chunks Application to JSON Value

### ⚠️ **PARTIALLY CORRECT - With Important Clarification**

**What You Asked:**
> "You say in your example that the chunks are applied to the 'chunk_context' value in the JSON. Is this correct?"

**The Truth - Two Separate Fields:**

Chunks data is stored in **TWO database fields** in the `conversations` table:

### Field 1: `chunk_context` (JSON object)
**Purpose:** Stores a simplified reference to the chunk  
**Content:** ChunkReference object with metadata  

**Real Structure (from code `types.ts`):**
```typescript
export interface ChunkReference {
  id: string;                    // Chunk UUID
  content: string;               // The actual chunk_text (!!!)
  documentId: string;
  documentTitle?: string;
  chunkType: 'Chapter_Sequential' | 'Instructional_Unit' | 'CER' | 'Example_Scenario';
  sectionHeading?: string;
  pageStart?: number;
  pageEnd?: number;
  tokenCount: number;
  chunkHandle?: string;
}
```

### Field 2: `dimension_source` (JSON object)
**Purpose:** Stores AI-generated semantic dimensions  
**Content:** DimensionSource object with analysis data

**Real Structure (from code `types.ts`):**
```typescript
export interface DimensionSource {
  chunkId: string;
  runId: string;
  confidence: number;           // 0.0 to 1.0
  generatedAt: string;          // ISO timestamp
  semanticDimensions: {
    persona?: string[];         // ["sales_professional", "technical_buyer"]
    emotion?: string[];         // ["curiosity", "skepticism"]
    complexity?: number;        // 0.0 to 1.0
    domain?: string[];          // ["sales_enablement", "competitive_intelligence"]
    audience?: string;          // "Sales teams, account executives"
    intent?: string;            // "inform", "persuade", "instruct"
    tone?: string[];
  };
}
```

**Database Storage:**
Both fields are stored as `jsonb` columns in PostgreSQL, allowing queries on nested fields.

### Current Reality Check

**Query Result:** ALL 5 recent conversations in database:
```json
{
  "chunk_id": null,
  "chunk_context": null,
  "dimension_source": null
}
```

**Finding:** The chunk injection system is NOT currently being used in production. All conversations are generated purely from template + scaffolding parameters.

---

## Question 3: Chunks String Construction

### 📝 **How the Chunk String is Built**

**Answer:** The chunk string is constructed from **MULTIPLE fields** across **BOTH tables**, orchestrated by `PromptContextBuilder`.

### Step-by-Step Construction Process

#### Step 1: Fetch Chunk from Database
**Code:** `src/lib/chunk-service.ts` → `getChunkById()`

```typescript
async getChunkById(chunkId: string): Promise<Chunk | null> {
  const { data, error } = await supabase
    .from('chunks')
    .select('*')
    .eq('id', chunkId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}
```

**Returns all fields from `chunks` table, including:**
- `chunk_text` ← **This is the main content**
- `chunk_type`, `section_heading`, `page_start`, `page_end`, etc.

#### Step 2: Fetch Dimensions from Database
**Code:** `src/lib/chunk-service.ts` → `getDimensionsByChunkAndRun()`

```typescript
async getDimensionsByChunkAndRun(chunkId: string, runId: string): Promise<ChunkDimensions | null> {
  const { data, error } = await supabase
    .from('chunk_dimensions')
    .select('*')
    .eq('chunk_id', chunkId)
    .eq('run_id', runId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}
```

**Returns all 50+ dimension fields**, including:
- `chunk_summary_1s`, `key_terms`, `audience`, `intent`, `tone_voice_tags`
- `prompt_candidate`, `target_answer`, `style_directives`
- `domain_tags`, `brand_persona_tags`

#### Step 3: Transform into ChunkReference Object
**Code:** `src/lib/generation/chunks-integration.ts` → `getChunkById()`

```typescript
async getChunkById(chunkId: string): Promise<ChunkReference | null> {
  try {
    const chunk = await chunkService.getChunkById(chunkId);
    if (!chunk) return null;

    // Fetch document title for better context
    const document = await chunkService.getDocumentById(chunk.document_id);
    const documentTitle = document?.title || document?.filename || undefined;

    return toChunkReference(chunk, documentTitle);
  } catch (error) {
    console.error('Error fetching chunk for generation:', error);
    return null;
  }
}
```

**`toChunkReference()` maps database fields to ChunkReference:**
```typescript
{
  id: chunk.id,
  content: chunk.chunk_text,        // ← THE MAIN CONTENT
  documentId: chunk.document_id,
  documentTitle: documentTitle,
  chunkType: chunk.chunk_type,
  sectionHeading: chunk.section_heading,
  pageStart: chunk.page_start,
  pageEnd: chunk.page_end,
  tokenCount: chunk.token_count,
  chunkHandle: chunk.chunk_handle
}
```

#### Step 4: Build Composite Prompt Context String
**Code:** `src/lib/generation/prompt-context-builder.ts` → `buildContext()`

**This is where the FINAL string is assembled:**

```typescript
private buildContext(
  chunk: ChunkReference,
  dimensions?: DimensionSource
): PromptContext {
  // Truncate content if too long (max 5000 chars)
  const chunkContent = this.truncateContent(chunk.content);

  // Build metadata string
  const metadataParts = [
    `Document: ${chunk.documentTitle || chunk.documentId}`,
    chunk.sectionHeading && `Section: ${chunk.sectionHeading}`,
    chunk.pageStart && chunk.pageEnd && `Pages: ${chunk.pageStart}-${chunk.pageEnd}`,
    `Chunk Type: ${chunk.chunkType}`,
    `Tokens: ${chunk.tokenCount}`,
  ].filter(Boolean);

  const chunkMetadata = metadataParts.join(' | ');

  // Build dimension context if available
  let dimensionContext: string | undefined;
  if (dimensions?.semanticDimensions) {
    const { persona, emotion, complexity, domain, audience, intent } = dimensions.semanticDimensions;
    
    const dimensionParts = [
      persona && persona.length > 0 && `Suggested Personas: ${persona.join(', ')}`,
      emotion && emotion.length > 0 && `Detected Emotions: ${emotion.join(', ')}`,
      complexity !== undefined && `Complexity Level: ${(complexity * 10).toFixed(1)}/10`,
      domain && domain.length > 0 && `Domain: ${domain.join(', ')}`,
      audience && `Audience: ${audience}`,
      intent && `Intent: ${intent}`,
      `Dimension Confidence: ${(dimensions.confidence * 100).toFixed(0)}%`,
    ].filter(Boolean);

    if (dimensionParts.length > 0) {
      dimensionContext = dimensionParts.join('\n');
    }
  }

  return { chunkContent, chunkMetadata, dimensionContext };
}
```

### Real Example from Database

**Chunk Record (from `chunks` table):**
```json
{
  "id": "a71eb2f2-9178-4c66-be89-22789794335f",
  "chunk_text": "stickiness. Achieving negative dollar churn through aggressive upsell \nand cross-sell might even be possible. By this stage, marketing should \nhave matured enough to measure leads by channel and by cohort.\nExit Criteria: Organizations can exit this phase when they have \ntwo or three quarters of accurate revenue prediction by marketing \nand churn has settled at an acceptable level.\nTimeframe: 6 – 9 months.\n\nDRIVING GROWTH – With a tuned and predictable demand-\ngeneration machine, the marketing team can be a growth driver...",
  "document_id": "0fbf44f1-9348-4725-84c0-1cf796578645",
  "chunk_type": "Chapter_Sequential",
  "section_heading": "The Sales Model",
  "page_start": 10,
  "page_end": 11,
  "token_count": 528
}
```

**Dimensions Record (from `chunk_dimensions` table):**
```json
{
  "chunk_id": "a71eb2f2-9178-4c66-be89-22789794335f",
  "chunk_summary_1s": "Sales enablement documentation providing competitive intelligence through battle cards to help sales teams position against competitors.",
  "audience": "Sales teams, sales enablement professionals, account executives",
  "intent": "inform",
  "domain_tags": ["sales enablement", "competitive intelligence", "sales methodology"],
  "tone_voice_tags": ["professional", "business-focused", "strategic"]
}
```

**Final Constructed Context String (what gets injected into prompt):**

```text
=== CHUNK CONTENT ===
stickiness. Achieving negative dollar churn through aggressive upsell 
and cross-sell might even be possible. By this stage, marketing should 
have matured enough to measure leads by channel and by cohort.
Exit Criteria: Organizations can exit this phase when they have 
two or three quarters of accurate revenue prediction by marketing 
and churn has settled at an acceptable level.
Timeframe: 6 – 9 months.

DRIVING GROWTH – With a tuned and predictable demand-
generation machine, the marketing team can be a growth driver...

=== CHUNK METADATA ===
Document: The SaaS Marketing Handbook | Section: The Sales Model | Pages: 10-11 | Chunk Type: Chapter_Sequential | Tokens: 528

=== DIMENSION CONTEXT ===
Suggested Personas: sales_professional, marketing_leader
Detected Emotions: analytical, strategic
Complexity Level: 7.2/10
Domain: sales enablement, competitive intelligence, sales methodology
Audience: Sales teams, sales enablement professionals, account executives
Intent: inform
Dimension Confidence: 95%
```

### Field Source Summary

| Final Component | Source Table | Source Field(s) |
|-----------------|--------------|-----------------|
| **Main Content** | `chunks` | `chunk_text` |
| **Document Info** | `documents` (via FK) | `title` or `filename` |
| **Section Info** | `chunks` | `section_heading` |
| **Pages** | `chunks` | `page_start`, `page_end` |
| **Type** | `chunks` | `chunk_type` |
| **Size** | `chunks` | `token_count` |
| **Personas** | `chunk_dimensions` | (inferred from `brand_persona_tags`) |
| **Emotions** | `chunk_dimensions` | (inferred from `tone_voice_tags`) |
| **Complexity** | `chunk_dimensions` | (calculated heuristic) |
| **Domain** | `chunk_dimensions` | `domain_tags` |
| **Audience** | `chunk_dimensions` | `audience` |
| **Intent** | `chunk_dimensions` | `intent` |

---

## Question 4: Chunks Value Selection

### 🎯 **How Chunks Are Selected - The Shocking Truth**

**Your Specific Question:**
> "How is the chunks dimensions record selected from all of the chunks that are currently in the database? I just ran a scenario. How did it select the chunks for that conversation?"
> 
> **Conversation Details:**
> - `client_persona`: "Marcus Chen - The Overwhelmed Avoider"
> - `dataset_name`: "fp_conversation_17b3e49b-8874-4d46-b6b4-97a73b990bdf"

---

### **Answer: IT DIDN'T SELECT ANY CHUNKS**

I queried your actual conversation from the database. Here's what I found:

**Database Record for Your Conversation:**
```json
{
  "conversation_id": "fp_conversation_17b3e49b-8874-4d46-b6b4-97a73b990bdf",
  "chunk_id": null,
  "chunk_context": null,
  "dimension_source": null,
  "persona_id": "74b5a919-d2e5-416a-b432-02b1751c989e",
  "emotional_arc_id": "33d2ac3e-3f92-44a5-a53d-788fdece2545",
  "training_topic_id": "11f39551-7c57-4933-a378-9c0ed60679ce",
  "tier": "template",
  "scaffolding_snapshot": {
    "persona": {
      "name": "Jennifer Martinez",
      "persona_key": "anxious_planner"
    },
    "emotional_arc": {
      "name": "Couple Conflict → Alignment",
      "arc_key": "couple_conflict_to_alignment"
    },
    "training_topic": {
      "name": "Wedding Debt vs House Down Payment",
      "topic_key": "wedding_debt_vs_house"
    }
  }
}
```

**Key Finding:**
- `chunk_id`: **null**
- `chunk_context`: **null**
- `dimension_source`: **null**

**All 5 recent conversations in your database have the same pattern—NO chunks used.**

---

### Why Chunks Aren't Being Selected

#### Current System Architecture

The conversation generation has **TWO parallel input systems:**

1. **Scaffolding System (CURRENTLY ACTIVE)** ✅
   - User selects: Persona + Emotional Arc + Topic
   - System fetches records from: `client_personas`, `emotional_arcs`, `training_topics`
   - Builds `scaffolding_snapshot` with full prompt context
   - Generates conversation with NO chunk data

2. **Chunk System (IMPLEMENTED BUT INACTIVE)** ⚠️
   - **Requires** user to explicitly provide `chunkId` parameter
   - Would fetch from `chunks` + `chunk_dimensions` tables
   - Would inject chunk content into template via `{{chunk_content}}` placeholders
   - Would auto-populate parameters from dimension metadata

### Code Flow Analysis

**Entry Point:** `src/lib/conversation-generator.ts` → `generate()`

```typescript
export async function generate(params: ConversationParams): Promise<ConversationResult> {
  // ... setup code ...

  // 2. Fetch chunk context (OPTIONAL)
  let chunkContext: ChunkReference | null = null;
  let dimensionSource: DimensionSource | null = null;
  
  if (params.chunkId) {                    // ← THIS IS THE KEY CHECK
    console.log(`🔗 Chunk association detected: ${params.chunkId}`);
    
    // Fetch chunk and dimensions
    const chunkData = await chunksService.getChunkWithDimensions(params.chunkId);
    
    if (chunkData) {
      const { chunk, dimensions } = chunkData;
      chunkContext = chunk;
      dimensionSource = dimensions;
      
      console.log(`✅ Chunk loaded: ${chunk.chunkType} (${chunk.tokenCount} tokens)`);
      
      if (dimensions) {
        console.log(`✅ Dimensions loaded: ${dimensionParser.getSummary(dimensions)}`);
        
        // Auto-populate parameters from dimensions if not explicitly set
        if (!params.parameters?.explicitParams) {
          const suggestions = dimensionParameterMapper.mapDimensionsToParameters(dimensions);
          
          // Override params with dimension-driven suggestions
          params.persona = params.persona || suggestions.persona || params.persona;
          params.emotion = params.emotion || suggestions.emotion || params.emotion;
        }
      }
    } else {
      console.warn(`⚠️  Chunk ${params.chunkId} not found or has no dimensions`);
    }
  }
  
  // ... continues with template resolution ...
}
```

**Critical Line:**
```typescript
if (params.chunkId) {
```

**If `params.chunkId` is NOT provided**, the entire chunk system is **bypassed**.

---

### How Chunk Selection WOULD Work (If Activated)

If the system were using chunks, here are the **THREE possible selection methods:**

#### Method 1: Manual Selection (Explicit `chunkId`)
**User provides specific chunk ID:**
```typescript
const params = {
  templateId: "confusion-to-clarity",
  chunkId: "a71eb2f2-9178-4c66-be89-22789794335f",  // ← Explicit selection
  persona: "technical_buyer",
  emotion: "confusion"
};
```

**Selection Logic:** Direct database lookup via `getChunkById(chunkId)`

---

#### Method 2: Document-Based Selection (All Chunks)
**User provides document ID:**
```typescript
const params = {
  templateId: "confusion-to-clarity",
  documentId: "0fbf44f1-9348-4725-84c0-1cf796578645",
  // System would fetch all chunks for this document
};
```

**Selection Logic:**
```typescript
const chunks = await chunksService.getChunksForDocument(documentId);
// Returns array of all 177 chunks for that document
```

**Would require additional logic to:**
- Pick a primary chunk (e.g., first one, random, or best-matching)
- Optionally include related chunks as context

---

#### Method 3: Semantic Matching (NOT IMPLEMENTED)
**Hypothetical intelligent selection:**
```typescript
const params = {
  templateId: "confusion-to-clarity",
  persona: "sales_professional",
  topic: "competitive_positioning",
  // System would search chunk_dimensions for best match
};
```

**Selection Logic (would need to be built):**
```typescript
async function findBestMatchingChunk(persona: string, topic: string): Promise<string | null> {
  // Query chunk_dimensions for:
  // - domain_tags matching topic
  // - brand_persona_tags matching persona
  // - highest generation_confidence_accuracy
  
  const { data } = await supabase
    .from('chunk_dimensions')
    .select('chunk_id, domain_tags, brand_persona_tags, generation_confidence_accuracy')
    .contains('domain_tags', [topic])
    .contains('brand_persona_tags', [persona])
    .order('generation_confidence_accuracy', { ascending: false })
    .limit(1)
    .single();
  
  return data?.chunk_id || null;
}
```

**This method is NOT currently implemented in the codebase.**

---

### Current Reality: Why No Chunks?

**Investigation Results:**

1. **UI doesn't expose chunk selection** - The conversation generation interface only shows:
   - Persona dropdown
   - Emotional Arc dropdown
   - Topic dropdown
   - No chunk picker

2. **API doesn't accept `chunkId`** - The generation endpoint receives:
   ```typescript
   {
     persona_id: "uuid",
     emotional_arc_id: "uuid",
     training_topic_id: "uuid"
   }
   ```
   No `chunk_id` field in request body.

3. **Chunk injection is pre-built but unused** - The entire infrastructure exists:
   - `ChunksIntegrationService` ✅
   - `PromptContextBuilder` ✅
   - `DimensionParameterMapper` ✅
   - Database schema ready ✅
   - BUT: Never invoked in production flow

---

## The Two-Track System: Current State

### Track 1: Scaffolding-Based Generation (ACTIVE) ✅

**Input:** Persona + Arc + Topic from master tables  
**Process:**
1. Fetch persona record (name, baseline, communication style)
2. Fetch emotional arc record (starting emotion, ending emotion, journey patterns)
3. Fetch topic record (name, complexity, domain)
4. Build `scaffolding_snapshot` JSON with full context
5. Resolve template with scaffolding variables
6. Send to OpenAI/Claude with system prompt

**Output:** Conversation with NO chunk influence

**Example System Prompt (from your conversation):**
```
You are an emotionally intelligent financial planning chatbot representing Elena Morales, CFP of Pathways Financial Planning.

Your core principles:
1. Money is emotional - Acknowledge feelings before facts in EVERY response
2. Judgment-free space - Normalize confusion/shame explicitly
...

Current conversation context:
- Client Persona: Jennifer Martinez
- Emotional Baseline: High anxiety; hypervigilant about risks; needs reassurance and concrete indicators
- Emotional Journey: Couple Conflict → Alignment (frustration → clarity)
- Topic: Wedding Debt vs House Down Payment
- Complexity Level: intermediate
- Target Turns: 3
```

**No chunk data anywhere in this prompt.**

---

### Track 2: Chunk-Based Generation (DORMANT) ⚠️

**Input:** ChunkId (+ optional persona/arc/topic overrides)  
**Process:**
1. Fetch chunk from `chunks` table → get `chunk_text`, metadata
2. Fetch dimensions from `chunk_dimensions` → get semantic analysis
3. Auto-populate persona/emotion from dimension tags (if not explicitly set)
4. Resolve template with chunk placeholders: `{{chunk_content}}`, `{{chunk_metadata}}`, `{{dimension_context}}`
5. Build enriched prompt with document context
6. Send to OpenAI/Claude

**Output:** Conversation influenced by specific document chunk

**Hypothetical System Prompt (if chunks were used):**
```
You are an emotionally intelligent financial planning chatbot representing Elena Morales, CFP of Pathways Financial Planning.

Your core principles:
1. Money is emotional - Acknowledge feelings before facts in EVERY response
...

Current conversation context:
- Client Persona: Sales Professional (suggested by document dimensions)
- Emotional Journey: Confusion → Clarity
- Topic: Competitive Positioning
- Source Document Context Below:

=== DOCUMENT CHUNK ===
stickiness. Achieving negative dollar churn through aggressive upsell 
and cross-sell might even be possible. By this stage, marketing should 
have matured enough to measure leads by channel and by cohort...
(528 tokens from "The SaaS Marketing Handbook" - Chapter: The Sales Model)

=== SEMANTIC ANALYSIS ===
Domain: sales enablement, competitive intelligence, sales methodology
Audience: Sales teams, account executives
Intent: inform
Suggested Personas: sales_professional, marketing_leader
Complexity: 7.2/10
Confidence: 95%

Your responses should draw from the document content above while maintaining 
Elena's emotionally intelligent approach...
```

---

## Summary & Recommendations

### Current State
1. ✅ **Chunks Table:** Fully populated (177 records)
2. ✅ **Dimensions Table:** Fully populated (174 records)
3. ✅ **Integration Code:** Fully implemented
4. ❌ **Production Usage:** ZERO - no conversations use chunks
5. ❌ **UI Exposure:** No chunk selection interface
6. ❌ **Smart Selection:** No automatic chunk matching logic

### Why This Matters
Your question reveals a **critical gap** between:
- **What the system CAN do** (chunk-driven conversations)
- **What the system IS doing** (pure scaffolding conversations)

### The Volume Bottleneck Connection
This ties directly to your earlier concern about conversation volume:

**Current Reality:**
- 3 Personas × 7 Arcs × 15 Topics = **315 possible combinations**
- Compatibility filtering reduces this to ~50-100 valid combinations
- Each combination generates 1 conversation
- **Total volume: ~50-100 conversations**

**If Chunks Were Activated:**
- 177 chunks × multiple generation strategies = **1000+ unique conversations**
- Each chunk could generate conversations for:
  - Different personas (auto-suggested from dimensions)
  - Different complexity levels
  - Different emotional approaches
- **Exponential volume increase**

### Why Chunks Aren't Being Used (Hypothesis)

Based on code analysis, likely reasons:

1. **Feature Not Complete** - UI/API integration never finished
2. **Quality Control** - Testing scaffolding-only approach first
3. **Template Compatibility** - Current templates may not have `{{chunk_content}}` placeholders
4. **Strategic Decision** - Focusing on emotional arc quality before adding content variety

---

## Next Steps (Recommendations)

### Option A: Activate Chunk System
**Goal:** Use your 177 chunks to massively scale conversation volume

**Required Changes:**
1. Add `chunkId` field to generation API
2. Add chunk selector to UI (dropdown or search)
3. Update templates to include chunk placeholders
4. Implement smart chunk selection algorithm

**Volume Impact:** 10x-20x increase

---

### Option B: Hybrid Approach
**Goal:** Combine scaffolding + chunks for best of both

**Approach:**
1. Keep current scaffolding flow as primary
2. Add optional "enhance with document" toggle
3. When enabled, auto-select best matching chunk based on topic
4. Inject chunk as supplementary context (not replacement)

**Volume Impact:** 5x-10x increase

---

### Option C: Stay Scaffolding-Only
**Goal:** Perfect emotional intelligence before adding content complexity

**Rationale:**
- Current 50-100 conversations may be sufficient for MVP
- Quality over quantity for initial training data
- Chunk system can be activated later after validation

**Volume Impact:** No change

---

## Appendix A: Real Database Evidence

### Conversation Query (Your Specific Conversation)
**Query via SAOL:**
```bash
node -e "require('dotenv').config({path:'../.env.local'});
const saol=require('./dist/index.js');
(async()=>{
  const result=await saol.agentQuery({
    table:'conversations',
    where:[{column:'conversation_id',operator:'eq',value:'fp_conversation_17b3e49b-8874-4d46-b6b4-97a73b990bdf'}],
    limit:1
  });
  console.log(JSON.stringify(result,null,2));
})();"
```

**Result:**
```json
{
  "chunk_id": null,
  "chunk_context": null,
  "dimension_source": null,
  "scaffolding_snapshot": {
    "persona": {"name": "Jennifer Martinez", "persona_key": "anxious_planner"},
    "emotional_arc": {"name": "Couple Conflict → Alignment"},
    "training_topic": {"name": "Wedding Debt vs House Down Payment"}
  }
}
```

### Chunks Table Sample
**Query via SAOL:**
```bash
node -e "require('dotenv').config({path:'../.env.local'});
const saol=require('./dist/index.js');
(async()=>{
  const result=await saol.agentQuery({table:'chunks',limit:3});
  console.log(JSON.stringify(result,null,2));
})();"
```

**Result:** 177 total records, including:
- "The Sales Model" (528 tokens)
- "Six-Step Funnel Calculation Process" (474 tokens)
- "How SaaS Affects the Marketing Mix" (691 tokens)

### Dimensions Table Sample
**Query via SAOL:**
```bash
node -e "require('dotenv').config({path:'../.env.local'});
const saol=require('./dist/index.js');
(async()=>{
  const result=await saol.agentQuery({table:'chunk_dimensions',limit:1});
  console.log(JSON.stringify(result,null,2));
})();"
```

**Result:** 174 total records with rich metadata:
```json
{
  "chunk_summary_1s": "Sales enablement documentation providing competitive intelligence...",
  "audience": "Sales teams, sales enablement professionals, account executives",
  "domain_tags": ["sales enablement", "competitive intelligence", "sales methodology"],
  "prompt_candidate": "What are competitive battle cards and how are they used in sales?",
  "target_answer": "Competitive battle cards are strategic sales enablement tools...",
  "generation_confidence_accuracy": 9,
  "generation_confidence_precision": 10
}
```

---

## Appendix B: Code References

### Chunk Fetching
**File:** `src/lib/chunk-service.ts`  
**Lines:** 30-39 (getChunkById)  
**Lines:** 18-27 (getChunksByDocument)

### Dimension Fetching
**File:** `src/lib/chunk-service.ts`  
**Lines:** 89-99 (getDimensionsByChunkAndRun)

### Chunk Integration
**File:** `src/lib/generation/chunks-integration.ts`  
**Lines:** 17-31 (getChunkById)  
**Lines:** 84-94 (getChunkWithDimensions)

### Prompt Context Building
**File:** `src/lib/generation/prompt-context-builder.ts`  
**Lines:** 20-44 (buildPrompt)  
**Lines:** 49-88 (buildContext)

### Conversation Generation
**File:** `src/lib/conversation-generator.ts`  
**Lines:** 82-130 (chunk fetching and parameter population)  
**Lines:** 144-148 (chunk injection into prompt)

---

## Glossary

**Chunk:** A segment of a document extracted during the chunking process. Stored in `chunks.chunk_text` with accompanying metadata.

**Chunk Dimensions:** AI-generated semantic metadata about a chunk, including persona suggestions, emotion tags, domain classification, and more. Stored in `chunk_dimensions` table with 50+ fields.

**ChunkReference:** A TypeScript interface that represents a chunk in the conversation generation system. Includes both the content and metadata.

**DimensionSource:** A TypeScript interface that represents the semantic dimensions of a chunk, used to auto-populate conversation parameters.

**Scaffolding:** The structured combination of Persona + Emotional Arc + Topic that provides the framework for conversation generation. Currently the ONLY method being used.

**Chunk Context:** The `chunk_context` JSON field in the `conversations` table that would store a ChunkReference if chunks were being used (currently always null).

**Dimension Source:** The `dimension_source` JSON field in the `conversations` table that would store semantic dimensions if chunks were being used (currently always null).

---

**END OF DOCUMENT**

