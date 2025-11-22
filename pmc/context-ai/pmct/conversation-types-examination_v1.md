# Conversation Generation Types & Chunk Usage: Technical Examination
**Version:** 1.0  
**Date:** November 21, 2025  
**Purpose:** Direct code-driven analysis of prompt templates, chunk injection, and tier differences  
**Method:** Real data from codebase + database (SAOL queries)

---

## Executive Summary: The Truth About "Three Types"

**CRITICAL FINDING:** There are **NOT three separate generation systems**. There is ONE template-based generation system with a `tier` label field. The "types" are a **conceptual distinction**, not a structural one.

**Reality:**
- **All prompts come from the same `prompt_templates` table**
- **All prompts use the same variable substitution system**
- **All prompts can optionally include `chunk_context`**
- **The only difference is the `tier` field value**: `'template'`, `'scenario'`, or `'edge_case'`

**What This Means:**
- "Template" vs "Scenario" vs "Edge Case" are **tier labels**, not different generation engines
- Chunk injection works **identically** for all tiers
- The same prompt can theoretically be used for any tier

---

## Part 1: Database Reality - What Actually Exists

### 1.1 Database Schema for `prompt_templates`

**Source:** SAOL schema introspection (queried 2025-11-21 23:53:25 UTC)

```sql
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR,
  tier VARCHAR DEFAULT 'template',  -- ⚠️ THIS IS THE ONLY "TYPE" FIELD
  template_text TEXT NOT NULL,      -- THE ACTUAL PROMPT
  structure TEXT,                   -- Brief notes about structure
  variables JSONB,                  -- Required/optional variables
  tone VARCHAR,
  complexity_baseline INTEGER,
  style_notes TEXT,
  example_conversation VARCHAR,
  quality_threshold NUMERIC,
  required_elements TEXT[],
  usage_count INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  success_rate NUMERIC DEFAULT 0,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  last_modified_by UUID,
  last_modified TIMESTAMPTZ DEFAULT now(),
  emotional_arc_id UUID,
  emotional_arc_type VARCHAR,
  suitable_personas TEXT[],
  suitable_topics TEXT[],
  methodology_principles TEXT[]
);
```

**Key Observations:**
1. **`tier` field** stores: `'template'`, `'scenario'`, or `'edge_case'` as VARCHAR
2. **`template_text`** contains the FULL prompt (not just a reference)
3. **`variables`** is JSONB containing `{required: [], optional: []}`
4. **NO separate tables** for scenarios or edge cases
5. **ALL templates stored in one table** with 7 records currently

---

### 1.2 Actual Templates in Database

**Source:** SAOL query `agentQuery({table:'prompt_templates',limit:10})`

**All 7 templates currently in database:**

| ID (abbreviated) | Template Name | Tier | Optional Variables |
|------------------|--------------|------|-------------------|
| b5038036-929a | Template - Confusion → Clarity | **template** | `chunk_context`, `document_id` |
| 4097016f-4833 | Template - Couple Conflict → Alignment | **template** | `chunk_context`, `document_id`, `partner_name` |
| d5478f2d-1fed | Template - Grief/Loss → Healing | **template** | `chunk_context`, `document_id` |
| 9dd19cf7-6f38 | Template - Overwhelm → Empowerment | **template** | `chunk_context`, `document_id` |
| ea9dee1e-a2ca | Template - Shame → Acceptance | **template** | `chunk_context`, `document_id` |
| f1e6ba5d-8a53 | Template - Anxiety → Confidence | **template** | `chunk_context`, `document_id` |
| 5a84d632-92d1 | Template - Emergency → Calm | **template** | `chunk_context`, `document_id` |

**CRITICAL FINDING:** 
- **ALL 7 templates have `tier: "template"`**
- **ZERO templates have `tier: "scenario"`**
- **ZERO templates have `tier: "edge_case"`**
- **ALL templates include `chunk_context` as an optional variable**

**This means:**
- There are NO separate "Scenario" prompt templates in the database
- There are NO separate "Edge Case" prompt templates in the database
- The "Scenario" and "Edge Case" tiers must use the SAME template prompts as "Template" tier

---

## Part 2: Prompt Template Structure - RAW vs COMPOSED

### 2.1 RAW Template Text (Unmodified from Database)

**Source:** `prompt_templates.template_text` for "Confusion → Clarity"

**Storage Location:** Database table `prompt_templates`, column `template_text`

```
You are tasked with generating a complete, production-quality LoRA training conversation for a financial planning chatbot.

## Conversation Configuration

**Client Persona:** {{persona_name}} - {{persona_archetype}}
**Emotional Journey:** {{starting_emotion}} ({{starting_intensity_min}}-{{starting_intensity_max}} intensity) → {{ending_emotion}} ({{ending_intensity_min}}-{{ending_intensity_max}} intensity)
**Topic:** {{topic_name}}
**Complexity:** {{topic_complexity}}
**Target Turns:** {{typical_turn_count_min}}-{{typical_turn_count_max}}

## Context and Quality Standards

You must generate a conversation that achieves 5/5 quality matching the seed conversation standard.

## Emotional Arc Pattern: {{emotional_arc_name}}

**Turn 1:**
- User expresses confusion about {{topic_name}}
- Likely includes self-deprecation ("this might sound stupid")
- Shows decision paralysis from complexity
- **Elena Response:** Normalize confusion, reframe to positive, offer to break down complexity

**Turn 2:**
- User provides details, shows slight relief at normalization
- May reveal specific decision to be made
- **Elena Response:** Break concept into simple steps, use concrete numbers, ask permission to educate

**Turn 3-4:**
- User asks follow-up questions, shows growing understanding
- May express concern about making wrong choice
- **Elena Response:** Continue education, validate fears, provide specific actionable guidance

**Turn 5 (if applicable):**
- User expresses clarity and readiness to act
- May show gratitude or empowerment
- **Elena Response:** Celebrate transformation, reinforce confidence, offer continued support

[... continues for ~140 more lines with Elena's principles, persona background, topic context, output format, execution instructions, success criteria...]
```

**Key Placeholder Variables:**
- `{{persona_name}}`, `{{persona_archetype}}`, `{{persona_demographics}}`
- `{{starting_emotion}}`, `{{ending_emotion}}`, `{{emotional_arc_name}}`
- `{{topic_name}}`, `{{topic_description}}`, `{{topic_complexity}}`
- `{{chunk_context}}` ← **OPTIONAL (only used if provided)**
- `{{document_id}}` ← **OPTIONAL (only used if provided)**

---

### 2.2 COMPOSED Template (Variables Substituted)

**Source:** Simulated resolution with sample parameters

**Substitution Logic Location:** `src/lib/services/template-resolver.ts` lines 505-568 (`resolveScaffoldingTemplate()`)

**Example Composition:**

```
You are tasked with generating a complete, production-quality LoRA training conversation for a financial planning chatbot.

## Conversation Configuration

**Client Persona:** ****Marcus Thompson**** - ****Mid-Career Professional (35-45) concerned about falling behind financially****
**Emotional Journey:** ****Confusion**** (****0.70****-****0.85**** intensity) → ****Clarity**** (****0.70****-****0.80**** intensity)
**Topic:** ****HSA vs FSA Decision****
**Complexity:** ****intermediate****
**Target Turns:** ****4****-****6****

## Context and Quality Standards

You must generate a conversation that achieves 5/5 quality matching the seed conversation standard.

## Emotional Arc Pattern: ****Confusion → Clarity (Education Focus)****

**Turn 1:**
- User expresses confusion about ****HSA vs FSA Decision****
- Likely includes self-deprecation ("this might sound stupid")
- Shows decision paralysis from complexity
- **Elena Response:** Normalize confusion, reframe to positive, offer to break down complexity

[... template continues with all variables resolved ...]

## Client Background

**Persona:** ****Marcus Thompson****
**Demographics:** ****Age: 35-45, Income: $75K-$150K, Family: Married with young children****
**Financial Situation:** ****Solid income but overwhelmed by financial decisions. Wants to "do it right" but paralyzed by options.****
**Communication Style:** ****Direct but shows vulnerability. Asks permission before sharing concerns.****

**Typical Questions This Persona Asks:**
****- "Is this a stupid question?"
- "What's the right way to handle this?"
- "Should I know this already?"
- "Can you break this down for me?"****

[... additional context sections ...]

Additional context from knowledge base:
****[CHUNK CONTENT WOULD APPEAR HERE IF PROVIDED]****

[... execution instructions and success criteria follow ...]
```

**Variable Substitution Markers:**
- All substituted values wrapped in `****value****` for visibility
- Empty optionals removed or left blank
- Chunk context appended at designated placeholder location

---

## Part 3: Chunk Injection Mechanism - Exact Process

### 3.1 Where Chunks Are Injected

**Code Location:** `src/lib/services/parameter-assembly-service.ts` lines 193-234

**Function:** `buildTemplateVariables(params: ConversationParameters)`

```typescript
buildTemplateVariables(params: ConversationParameters): Record<string, any> {
  return {
    // Persona variables
    persona_name: params.persona.name,
    persona_type: params.persona.persona_key,
    persona_archetype: params.persona.archetype,
    // ... [20+ more persona variables] ...
    
    // Emotional arc variables
    emotional_arc_name: params.emotional_arc.name,
    emotional_arc_type: params.emotional_arc.arc_key,
    starting_emotion: params.emotional_arc.starting_emotion,
    // ... [15+ more arc variables] ...
    
    // Topic variables
    topic_name: params.training_topic.name,
    topic_key: params.training_topic.topic_key,
    topic_description: params.training_topic.description,
    // ... [10+ more topic variables] ...
    
    // Generation configuration
    tier: params.tier,  // ← THE TIER LABEL (template/scenario/edge_case)
    target_turns: params.target_turn_count,
    temperature: params.temperature,
    
    // ⚠️ CHUNK INJECTION HAPPENS HERE
    chunk_context: params.chunk_context || '',  // ← CHUNK CONTENT AS STRING
    has_chunk_context: Boolean(params.chunk_context)  // ← FLAG
  };
}
```

**What Gets Injected:**
1. **`chunk_context`**: Raw text content from the document chunk (up to 5000 characters, see below)
2. **`has_chunk_context`**: Boolean flag indicating whether chunk was provided

---

### 3.2 Chunk Processing Pipeline

**Code Location:** `src/lib/generation/prompt-context-builder.ts` lines 1-187

**Class:** `PromptContextBuilder`

```typescript
export class PromptContextBuilder {
  private maxChunkLength: number = 5000; // ← MAX CHUNK SIZE
  
  buildPrompt(
    template: string,
    chunk?: ChunkReference,
    dimensions?: DimensionSource
  ): string {
    if (!chunk) {
      return template;  // ← NO CHUNK = RETURN TEMPLATE AS-IS
    }
    
    const context = this.buildContext(chunk, dimensions);
    
    // ⚠️ REPLACE PLACEHOLDERS IN TEMPLATE
    let prompt = template
      .replace('{{chunk_content}}', context.chunkContent)  // ← RAW CHUNK
      .replace('{{chunk_metadata}}', context.chunkMetadata);  // ← METADATA
    
    if (context.dimensionContext) {
      prompt = prompt.replace('{{dimension_context}}', context.dimensionContext);
    } else {
      prompt = prompt.replace('{{dimension_context}}', '');
    }
    
    return prompt;
  }
  
  private truncateContent(content: string): string {
    if (content.length <= this.maxChunkLength) {
      return content;
    }
    
    // ⚠️ INTELLIGENT TRUNCATION
    // Try to break at sentence boundaries
    const truncated = content.slice(0, this.maxChunkLength);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastNewline = truncated.lastIndexOf('\n');
    
    const breakPoint = Math.max(lastPeriod, lastNewline);
    
    if (breakPoint > this.maxChunkLength * 0.8) {
      return truncated.slice(0, breakPoint + 1) + '\n\n[Content truncated...]';
    }
    
    return truncated + '\n\n[Content truncated...]';
  }
}
```

**Chunk Transformation Steps:**
1. **Fetch chunk** from `chunks` table (via `chunk_id`)
2. **Truncate** to 5000 characters if needed (intelligent sentence-boundary truncation)
3. **Extract metadata**: `documentTitle`, `documentId`, `sectionHeading`
4. **Optional dimension context**: If semantic dimensions exist, format as additional context
5. **Inject into template** at `{{chunk_content}}` placeholder

---

### 3.3 System Prompt Chunk Injection

**Code Location:** `src/lib/services/parameter-assembly-service.ts` lines 240-283

**Function:** `constructSystemPrompt(params: ConversationParameters)`

```typescript
constructSystemPrompt(params: ConversationParameters): string {
  return `You are an emotionally intelligent financial planning chatbot representing Elena Morales, CFP of Pathways Financial Planning.

Your core principles:
1. Money is emotional - Acknowledge feelings before facts in EVERY response
2. Judgment-free space - Normalize confusion/shame explicitly
3. Education-first - Teach "why" not just "what"
4. Progress over perfection - Celebrate existing understanding
5. Values-aligned - Personal context over generic rules

Current conversation context:
- Client Persona: ${params.persona.name}
- Emotional Baseline: ${params.persona.emotional_baseline}
- Emotional Journey: ${params.emotional_arc.name} (${params.emotional_arc.starting_emotion} → ${params.emotional_arc.ending_emotion})
- Topic: ${params.training_topic.name}
- Complexity Level: ${params.training_topic.complexity_level}
- Target Turns: ${params.target_turn_count || '3-5'}

Persona background:
- Name: ${params.persona.name}
- Archetype: ${params.persona.archetype}
- Emotional Baseline: ${params.persona.emotional_baseline}

Communication patterns for this arc:
${params.emotional_arc.characteristic_phrases.slice(0, 5).map(p => '- ' + p).join('\n')}

Response techniques to use:
${params.emotional_arc.response_techniques.slice(0, 5).map(t => '- ' + t).join('\n')}

Tactics to avoid:
${params.emotional_arc.avoid_tactics.slice(0, 5).map(t => '- ' + t).join('\n')}

Client communication style: ${params.persona.communication_style || 'conversational'}

Typical client concerns:
${params.persona.common_concerns.slice(0, 5).map(c => '- ' + c).join('\n')}

${params.chunk_context ? `\nAdditional context from knowledge base:\n${params.chunk_context}\n` : ''}

Your goal: Guide this client from ${params.emotional_arc.starting_emotion} to ${params.emotional_arc.ending_emotion} through ${params.target_turn_count || '3-5'} conversational turns, maintaining Elena's voice and methodology throughout.`;
}
```

**Chunk Injection Location:**
- **Line 281**: Conditional chunk context section
- **Only appears if `params.chunk_context` is truthy**
- **Formatted as**: 
  ```
  Additional context from knowledge base:
  [CHUNK CONTENT HERE]
  ```

---

## Part 4: The Three "Tiers" - Operational Analysis

### 4.1 Code Reality: How Tiers Are Used

**Finding:** The `tier` field is passed through the generation pipeline but **does NOT change the prompt template selection**.

**Evidence from Code:**

**File:** `src/lib/services/parameter-assembly-service.ts` lines 28-124

```typescript
async assembleParameters(input: {
  persona_id: string;
  emotional_arc_id: string;
  training_topic_id: string;
  tier: 'template' | 'scenario' | 'edge_case';  // ← TIER IS INPUT
  template_id?: string;
  chunk_id?: string;
  chunk_context?: string;
  // ... other params
}): Promise<AssembledParameters> {
  
  // 1. Fetch scaffolding data (persona, arc, topic)
  const [persona, emotional_arc, training_topic] = await Promise.all([...]);
  
  // 2. Check compatibility
  const compatibility = await this.scaffoldingService.checkCompatibility({
    persona_id, arc_id, topic_id
  });
  
  // 3. Select template (SAME LOGIC FOR ALL TIERS)
  let template_id;
  if (input.template_id) {
    template_id = input.template_id;  // Manual override
  } else {
    // ⚠️ SELECT BEST TEMPLATE BASED ON EMOTIONAL ARC
    // NO TIER-SPECIFIC LOGIC HERE
    template_id = await this.templateSelectionService.selectTemplateByArc({
      arc_key: training_topic.topic_key
    });
  }
  
  // 4. Build conversation parameters
  const conversation_params: ConversationParameters = {
    persona,
    emotional_arc,
    training_topic,
    tier: input.tier,  // ← TIER STORED BUT NOT USED FOR TEMPLATE SELECTION
    template_id,
    chunk_id: input.chunk_id,
    chunk_context: input.chunk_context,  // ← CHUNK PASSED THROUGH
    // ... other config
  };
  
  // 5. Build template variables (includes chunk_context)
  const template_variables = this.buildTemplateVariables(conversation_params);
  
  // 6. Construct system prompt (includes chunk_context)
  const system_prompt = this.constructSystemPrompt(conversation_params);
  
  return {
    conversation_params,
    template_variables,
    system_prompt,
    // ...
  };
}
```

**KEY FINDING:** 
- **Template selection is based on `emotional_arc`**, NOT `tier`
- **Tier label is stored in parameters but does NOT affect which prompt template is used**
- **Chunk context is passed through identically for all tiers**

---

### 4.2 What Actually Differs Between Tiers?

**Answer: NOTHING in the generation pipeline.**

**Tier differences are CONCEPTUAL ONLY:**

| Aspect | Template Tier | Scenario Tier | Edge Case Tier |
|--------|--------------|---------------|----------------|
| **Prompt Template** | Same pool | Same pool | Same pool |
| **Template Selection** | By emotional arc | By emotional arc | By emotional arc |
| **Variable Substitution** | Same system | Same system | Same system |
| **Chunk Injection** | Optional | Optional | Optional |
| **System Prompt** | Same construction | Same construction | Same construction |
| **API Call** | Same Claude API | Same Claude API | Same Claude API |
| **Quality Scoring** | Same scorer | Same scorer | Same scorer |

**The ONLY difference:**
- **Tier label** stored in `conversations.tier` field
- **Conceptual purpose** (human understanding, not system behavior)

---

### 4.3 Template Selection Logic

**File:** `src/lib/services/template-selection-service.ts` lines 30-274

**Method:** `selectTemplateByArc(params: {arc_key: string, persona_key?: string, topic_key?: string})`

```typescript
async selectTemplateByArc(params: {
  arc_key: string;
  persona_key?: string;
  topic_key?: string;
}): Promise<string> {
  
  // Fetch templates matching emotional arc
  const { data: templates, error } = await this.supabase
    .from('prompt_templates')
    .select('*')
    .eq('emotional_arc_type', params.arc_key)  // ← MATCH BY ARC TYPE
    .eq('is_active', true)
    .order('rating', { ascending: false });
  
  if (error || !templates || templates.length === 0) {
    throw new Error(`No templates found for arc: ${params.arc_key}`);
  }
  
  // If persona provided, filter by suitable_personas
  let candidates = templates;
  if (params.persona_key) {
    const personaMatches = templates.filter(t =>
      !t.suitable_personas || 
      t.suitable_personas.length === 0 ||
      t.suitable_personas.includes(params.persona_key)
    );
    if (personaMatches.length > 0) {
      candidates = personaMatches;
    }
  }
  
  // If topic provided, filter by suitable_topics
  if (params.topic_key) {
    const topicMatches = candidates.filter(t =>
      !t.suitable_topics ||
      t.suitable_topics.length === 0 ||
      t.suitable_topics.includes(params.topic_key)
    );
    if (topicMatches.length > 0) {
      candidates = topicMatches;
    }
  }
  
  // Return highest-rated candidate
  return candidates[0].id;
}
```

**Selection Criteria:**
1. **Match emotional arc type** (e.g., `confusion_to_clarity`)
2. **Filter by persona compatibility** (if specified)
3. **Filter by topic compatibility** (if specified)
4. **Sort by rating** (descending)
5. **Return top-rated template**

**NO TIER FILTERING** - Templates are selected purely on arc/persona/topic match.

---

## Part 5: Answering the Diagnostic Questions

### A. What is the real operational difference between Template, Scenario, and Edge Case prompts?

**Answer:** **There is NO operational difference.**

All three use:
- The same prompt templates from `prompt_templates` table
- The same variable substitution system
- The same chunk injection mechanism
- The same template selection logic (by emotional arc, NOT tier)

The `tier` field is a **label** for:
- **Human understanding** of conversation purpose
- **Database filtering** (e.g., "show me all template-tier conversations")
- **Quality expectations** (templates might have stricter quality thresholds)
- **UI organization** (grouping conversations by tier in dashboard)

**Conclusion:** They are the SAME generation system with different conceptual labels.

---

### B. Is a Scenario prompt literally the same as a Template prompt but with chunk variables appended?

**Answer:** **YES, exactly.**

Both Template and Scenario tiers:
1. Pull from the same `prompt_templates` table
2. Use the same template selection logic
3. Include `chunk_context` as an optional variable
4. Resolve variables identically

**The difference is NOT in the prompt structure - it's in WHEN you provide chunk context:**

- **"Template" conversations**: Generated **without** chunk context (or minimal chunk context)
- **"Scenario" conversations**: Generated **with** rich chunk context from documents
- **"Edge Case" conversations**: Generated **with or without** chunks, but testing boundary conditions

**Example:**

```typescript
// Template-tier generation
await generateConversation({
  tier: 'template',
  template_id: 'confusion-to-clarity-template',
  chunk_context: undefined  // ← NO CHUNK
});

// Scenario-tier generation (SAME TEMPLATE)
await generateConversation({
  tier: 'scenario',
  template_id: 'confusion-to-clarity-template',  // ← SAME TEMPLATE
  chunk_context: 'From document: HSA contributions can be made...'  // ← CHUNK PROVIDED
});
```

**Both use the EXACT SAME template prompt.** The only difference is whether `chunk_context` variable is populated.

---

### C. Where in the pipeline are chunks transformed (summarized, pruned, merged, embedded)?

**Answer:** **Chunks are transformed in ONE place: `PromptContextBuilder`**

**File:** `src/lib/generation/prompt-context-builder.ts`

**Transformations Applied:**
1. **Truncation** (line 94-116): Chunk content limited to 5000 characters with intelligent sentence-boundary truncation
2. **Metadata extraction** (line 49-88): Extract document title, section heading, document ID
3. **Dimension context** (optional, line 54-87): If semantic dimensions exist, format as additional context
4. **Multi-chunk combination** (line 122-172): If multiple chunks provided, combine with markers: `[PRIMARY CHUNK]`, `[REFERENCE CHUNK 1]`, etc.

**NO summarization, pruning (beyond truncation), or embedding happens in this pipeline.** Chunks are passed through relatively raw.

**Full transformation path:**
```
1. Database (chunks table) → raw content string
2. PromptContextBuilder.truncateContent() → 5000 char max
3. PromptContextBuilder.buildContext() → format metadata
4. template.replace('{{chunk_content}}', ...) → inject into template
5. Claude API → generate conversation
```

---

### D. How many layers of "prompt shaping" exist?

**Answer:** **4 layers:**

**Layer 1: Base Template (Database)**
- Stored in `prompt_templates.template_text`
- Contains placeholders: `{{persona_name}}`, `{{chunk_context}}`, etc.
- Example: "Confusion → Clarity" template

**Layer 2: Variable Assembly (Parameter Assembly Service)**
- Function: `buildTemplateVariables(params)`
- Extracts ~40+ variables from persona, arc, topic entities
- Adds `chunk_context` if provided
- Result: `{ persona_name: "Marcus Thompson", topic_name: "HSA vs FSA", chunk_context: "...", ... }`

**Layer 3: Template Resolution (Template Resolver)**
- Function: `resolveScaffoldingTemplate(templateText, scaffoldingData)`
- Performs string replacement: `{{persona_name}}` → `"Marcus Thompson"`
- Returns fully resolved prompt text

**Layer 4: System Prompt Construction (Parameter Assembly Service)**
- Function: `constructSystemPrompt(params)`
- Builds Elena Morales system prompt with principles
- Appends chunk context if available
- Prepended to resolved template as "system" message

**Final Prompt Structure:**
```
[SYSTEM MESSAGE: Elena principles + conversation context + chunk context]
+
[RESOLVED TEMPLATE: Full prompt with all variables replaced]
→ Sent to Claude API
```

---

### E. Which parts of the prompt logic are cached, and which are recomputed on each generation?

**Answer:**

**CACHED:**
1. **Templates** (in `TemplateResolver.templateCache`)
   - TTL: 60 seconds (1 minute)
   - Avoids database hit for repeated template lookups
   - Key: `template_id`

**RECOMPUTED EVERY TIME:**
1. **Scaffolding data** (persona, arc, topic) - fetched from database
2. **Compatibility check** - calculated based on current data
3. **Template selection** - best match determined dynamically
4. **Variable assembly** - built from fresh scaffolding data
5. **Template resolution** - placeholders replaced with current values
6. **System prompt** - constructed from current parameters
7. **Chunk context** - fetched and processed if `chunk_id` provided

**Why?** 
- Templates are stable (rarely change)
- Scaffolding data may be updated frequently (usage counts, ratings)
- Each generation is unique (different persona/arc/topic combinations)
- Caching resolved prompts would be memory-intensive and low-value

---

### F. Does the codebase actually define "Scenario Templates" as distinct objects?

**Answer:** **NO.**

**Evidence:**
1. **Database**: All templates have `tier: 'template'` (0 with `tier: 'scenario'`)
2. **Codebase**: No `ScenarioTemplate` type or class exists
3. **File system**: Only `tier1-templates/*.ts` files exist (no `tier2-templates/` or `tier3-templates/`)
4. **Generation logic**: No conditional branching based on tier

**The term "Scenario Template" is a MISNOMER.** What exists is:
- **Template-tier conversations**: Use templates without (or with minimal) chunk context
- **Scenario-tier conversations**: Use the SAME templates WITH chunk context
- **Edge-case-tier conversations**: Use the SAME templates, testing boundaries

**Correct terminology:**
- ❌ "Template prompts vs Scenario prompts" (implies different structures)
- ✅ "Conversations labeled as template/scenario/edge_case tiers" (labels only)

---

### G. What conditions cause a prompt to "upgrade" from Template → Scenario → Edge Case?

**Answer:** **There is NO automatic upgrading.** Tier is explicitly specified by the caller.

**Code Evidence:**

**File:** `src/app/api/conversations/generate-with-scaffolding/route.ts` lines 84-96

```typescript
const assembled = await parameterAssemblyService.assembleParameters({
  persona_id: validated.persona_id,
  emotional_arc_id: validated.emotional_arc_id,
  training_topic_id: validated.training_topic_id,
  tier: validated.tier,  // ← EXPLICITLY PROVIDED BY API CALLER
  template_id: validated.template_id,
  chunk_id: validated.chunk_id,
  chunk_context: validated.chunk_context,
  // ...
});
```

**Tier assignment is MANUAL:**
- User (or calling code) specifies `tier: 'template'` or `tier: 'scenario'` or `tier: 'edge_case'`
- No conditional logic upgrades tier based on parameters
- Tier is stored in database as provided

**Conceptual tier distinctions (HUMAN-DEFINED, not system-enforced):**
- **Template**: Foundational patterns (minimal chunk context)
- **Scenario**: Real-world situations (rich chunk context from documents)
- **Edge Case**: Boundary testing (adversarial scenarios)

**But operationally:** All three use the same generation pipeline with the same prompts.

---

## Part 6: Storage & Construction Analysis

### 6.1 Template Storage Location

**Primary Storage:** Database table `prompt_templates`
- **Row count**: 7 templates currently
- **Size**: 237,568 bytes (~238 KB)
- **Key column**: `template_text` (TEXT type, stores full prompt)

**Secondary Storage (Historical):** Codebase files
- **Location**: `src/lib/templates/definitions/tier1-templates/*.ts`
- **Count**: 7 TypeScript files
- **Purpose**: Seed data for initial database population
- **Status**: NOT used directly in generation (database is source of truth)

**File Examples:**
- `confusion-to-clarity.ts`
- `anxiety-to-confidence.ts`
- `couple-conflict-to-alignment.ts`
- `grief-to-healing.ts`
- `shame-to-acceptance.ts`
- `overwhelm-to-empowerment.ts`
- `emergency-to-calm.ts`

**Note:** These files export objects with `template_text` property that was imported into the database. Subsequent changes to templates happen in the database, NOT in files.

---

### 6.2 Template Loading Pipeline

```
1. API Request
   ↓
2. Parameter Assembly Service
   - Calls: templateSelectionService.selectTemplateByArc()
   ↓
3. Template Selection Service
   - Queries: SELECT * FROM prompt_templates WHERE emotional_arc_type = ?
   - Returns: template_id (UUID)
   ↓
4. Template Resolver
   - Calls: getTemplate(template_id)
   - Checks: Cache (60s TTL)
   - Fallback: Database query
   - Returns: Template object with .structure (template_text)
   ↓
5. Template Resolution
   - Calls: resolveScaffoldingTemplate(templateText, scaffoldingData)
   - Performs: String replacement of all {{placeholders}}
   - Returns: Fully resolved prompt string
   ↓
6. Prompt Context Builder (if chunk_id provided)
   - Calls: buildPrompt(template, chunk, dimensions)
   - Injects: chunk_content, chunk_metadata
   - Returns: Final prompt with chunk
   ↓
7. Claude API Call
   - Sends: System prompt + Resolved template
   - Returns: Generated conversation JSON
```

---

### 6.3 Variable Transformation Path

**Variables flow through 3 transformations:**

**Transformation 1: Database → Scaffolding Objects**
```typescript
// Raw database records
const personaRow = { name: 'Marcus Thompson', archetype: 'Overwhelmed Avoider', ... };
const arcRow = { name: 'Confusion → Clarity', starting_emotion: 'Confusion', ... };
const topicRow = { name: 'HSA vs FSA Decision', complexity_level: 'intermediate', ... };

// Mapped to type-safe objects
const persona: Persona = mapToPersona(personaRow);
const arc: EmotionalArc = mapToEmotionalArc(arcRow);
const topic: TrainingTopic = mapToTrainingTopic(topicRow);
```

**Transformation 2: Scaffolding Objects → Template Variables**
```typescript
// Extracted into flat key-value pairs
const variables = {
  persona_name: 'Marcus Thompson',
  persona_archetype: 'Overwhelmed Avoider',
  starting_emotion: 'Confusion',
  topic_name: 'HSA vs FSA Decision',
  chunk_context: '[CHUNK CONTENT IF PROVIDED]',
  // ... ~40 more variables
};
```

**Transformation 3: Variables → Resolved Prompt**
```typescript
// String replacement in template
template_text
  .replace('{{persona_name}}', 'Marcus Thompson')
  .replace('{{persona_archetype}}', 'Overwhelmed Avoider')
  .replace('{{starting_emotion}}', 'Confusion')
  .replace('{{chunk_context}}', '[CHUNK CONTENT IF PROVIDED]')
  // ... all placeholders replaced
```

---

## Part 7: Composed Prompt Examples

### 7.1 Template-Tier Conversation (No Chunks)

**Input Parameters:**
```json
{
  "tier": "template",
  "persona_id": "uuid-marcus-thompson",
  "emotional_arc_id": "uuid-confusion-to-clarity",
  "training_topic_id": "uuid-hsa-vs-fsa",
  "chunk_id": null,
  "chunk_context": null
}
```

**Composed System Prompt:**
```
You are an emotionally intelligent financial planning chatbot representing Elena Morales, CFP of Pathways Financial Planning.

Your core principles:
1. Money is emotional - Acknowledge feelings before facts in EVERY response
2. Judgment-free space - Normalize confusion/shame explicitly
3. Education-first - Teach "why" not just "what"
4. Progress over perfection - Celebrate existing understanding
5. Values-aligned - Personal context over generic rules

Current conversation context:
- Client Persona: ****Marcus Thompson****
- Emotional Baseline: ****Moderate anxiety about financial decisions****
- Emotional Journey: ****Confusion → Clarity**** (****Confusion**** → ****Clarity****)
- Topic: ****HSA vs FSA Decision****
- Complexity Level: ****intermediate****
- Target Turns: ****5****

Persona background:
- Name: ****Marcus Thompson****
- Archetype: ****Overwhelmed Avoider****
- Emotional Baseline: ****Moderate anxiety about financial decisions****

Communication patterns for this arc:
- "I can hear the confusion in your question"
- "Let me break this down into simple parts"
- "This is one of the most common questions I get"
- "Would it be helpful if I explained..."
- "You're asking exactly the right question"

Response techniques to use:
- Normalize confusion explicitly
- Break complexity into simple steps
- Use concrete numbers and examples
- Ask permission before explaining
- Celebrate understanding progress

Tactics to avoid:
- Never use jargon without explanation
- Never assume prior knowledge
- Never rush past emotional acknowledgment
- Never dismiss confusion as "not important"
- Never provide generic advice without context

Client communication style: Direct but shows vulnerability

Typical client concerns:
- "Is this a stupid question?"
- "What's the right way to handle this?"
- "Should I know this already?"
- "Can you break this down for me?"
- "I don't want to make the wrong choice"

[NO CHUNK CONTEXT - SECTION OMITTED]

Your goal: Guide this client from ****Confusion**** to ****Clarity**** through ****5**** conversational turns, maintaining Elena's voice and methodology throughout.
```

**Composed Template Prompt:**
```
You are tasked with generating a complete, production-quality LoRA training conversation for a financial planning chatbot.

## Conversation Configuration

**Client Persona:** ****Marcus Thompson**** - ****Overwhelmed Avoider (Mid-Career Professional concerned about falling behind)****
**Emotional Journey:** ****Confusion**** (****0.70****-****0.85**** intensity) → ****Clarity**** (****0.70****-****0.80**** intensity)
**Topic:** ****HSA vs FSA Decision****
**Complexity:** ****intermediate****
**Target Turns:** ****4****-****6****

## Context and Quality Standards

You must generate a conversation that achieves 5/5 quality matching the seed conversation standard.

## Emotional Arc Pattern: ****Confusion → Clarity (Education Focus)****

**Turn 1:**
- User expresses confusion about ****HSA vs FSA Decision****
- Likely includes self-deprecation ("this might sound stupid")
- Shows decision paralysis from complexity
- **Elena Response:** Normalize confusion, reframe to positive, offer to break down complexity

[... full template continues with all 140+ lines resolved ...]
```

**Key Characteristics:**
- ✅ All persona, arc, and topic variables substituted
- ❌ NO chunk context section (omitted)
- ✅ Elena's principles and communication patterns included
- ✅ Generic financial planning knowledge expected

---

### 7.2 Scenario-Tier Conversation (With Chunks)

**Input Parameters:**
```json
{
  "tier": "scenario",
  "persona_id": "uuid-marcus-thompson",
  "emotional_arc_id": "uuid-confusion-to-clarity",
  "training_topic_id": "uuid-hsa-vs-fsa",
  "chunk_id": "uuid-chunk-hsa-document",
  "chunk_context": "HSA Contribution Limits for 2025:\n\nFor individuals: $4,150\nFor families: $8,300\nCatch-up contribution (age 55+): Additional $1,000\n\nKey Advantages:\n- Triple tax benefit: Pre-tax contributions, tax-free growth, tax-free withdrawals for qualified medical expenses\n- Funds roll over year to year (unlike FSA)\n- Portable - account stays with you if you change jobs\n- After age 65, can withdraw for non-medical expenses (taxed as income, no penalty)\n\nEligibility Requirements:\n- Must be enrolled in a High Deductible Health Plan (HDHP)\n- Cannot be claimed as dependent on someone else's tax return\n- Cannot be enrolled in Medicare\n\nCommon Confusion Point:\nMany people think HSA is \"use it or lose it\" like an FSA - this is FALSE. HSAs are actually more like retirement accounts that you own permanently."
}
```

**Composed System Prompt:**
```
[... same as Template example above through "Typical client concerns" ...]

****Additional context from knowledge base:****
****HSA Contribution Limits for 2025:

For individuals: $4,150
For families: $8,300
Catch-up contribution (age 55+): Additional $1,000

Key Advantages:
- Triple tax benefit: Pre-tax contributions, tax-free growth, tax-free withdrawals for qualified medical expenses
- Funds roll over year to year (unlike FSA)
- Portable - account stays with you if you change jobs
- After age 65, can withdraw for non-medical expenses (taxed as income, no penalty)

Eligibility Requirements:
- Must be enrolled in a High Deductible Health Plan (HDHP)
- Cannot be claimed as dependent on someone else's tax return
- Cannot be enrolled in Medicare

Common Confusion Point:
Many people think HSA is "use it or lose it" like an FSA - this is FALSE. HSAs are actually more like retirement accounts that you own permanently.****

Your goal: Guide this client from ****Confusion**** to ****Clarity**** through ****5**** conversational turns, maintaining Elena's voice and methodology throughout.
```

**Composed Template Prompt:**
```
[... IDENTICAL to Template example - same prompt template used ...]

## Client Background

**Persona:** ****Marcus Thompson****
[... same as Template example ...]

## Topic Context

**Topic:** ****HSA vs FSA Decision****
**Description:** ****Understanding the differences between Health Savings Accounts and Flexible Spending Accounts****
**Complexity Level:** ****intermediate****

**Typical Questions Clients Ask About This Topic:**
****- "Which one should I choose?"
- "What's the difference between HSA and FSA?"
- "Can I have both?"
- "What happens if I don't use all the money?"****

**Key Concepts to Address:**
****- Contribution limits
- Tax advantages
- Rollover rules
- Eligibility requirements
- Use cases for each****

[... execution instructions and success criteria follow ...]
```

**Key Characteristics:**
- ✅ Same template as Template-tier (no structural difference)
- ✅ Chunk context included in system prompt
- ✅ All specific numbers and details from document available to model
- ✅ Model can reference document content directly in conversation

---

### 7.3 Operational Comparison

**Side-by-Side:**

| Element | Template-Tier | Scenario-Tier |
|---------|--------------|---------------|
| **Template Used** | `confusion-to-clarity` | `confusion-to-clarity` (SAME) |
| **Template Structure** | Identical | Identical |
| **Persona Variables** | ✅ Marcus Thompson | ✅ Marcus Thompson (SAME) |
| **Arc Variables** | ✅ Confusion → Clarity | ✅ Confusion → Clarity (SAME) |
| **Topic Variables** | ✅ HSA vs FSA | ✅ HSA vs FSA (SAME) |
| **System Prompt** | Elena principles + context | Elena principles + context (SAME) |
| **Chunk Context** | ❌ NONE | ✅ **HSA document content** |
| **Expected Output** | Generic HSA/FSA guidance | Document-grounded HSA/FSA guidance |

**Conclusion:** The ONLY difference is the presence/absence of chunk content. Everything else is identical.

---

## Part 8: Final Answers to Original Questions

### 1. What is the operational difference between all conversation generation types?

**Answer:** **There is NO operational difference in how they are generated.**

All types (Template, Scenario, Edge Case) use:
- The same `prompt_templates` table
- The same template selection logic (by emotional arc)
- The same variable substitution system
- The same chunk injection mechanism
- The same Claude API calls
- The same quality scoring

The ONLY differences are:
1. **`tier` label** stored in database (for human organization)
2. **Chunk context usage**:
   - Template: Usually NO chunks (or minimal)
   - Scenario: Usually WITH rich chunk context
   - Edge Case: Variable (depends on test case)

**These are conventions, not enforced system behaviors.**

---

### 2. Exactly how are document chunks being injected, referenced, or transformed inside Scenario-based prompts?

**Answer:** **Chunks are injected as raw text (with truncation) into two locations:**

**Location 1: System Prompt**
- **File**: `parameter-assembly-service.ts` line 281
- **Format**:
  ```
  Additional context from knowledge base:
  [CHUNK CONTENT]
  ```
- **Placement**: After Elena's principles, before final goal statement

**Location 2: Template Placeholders** (if template includes `{{chunk_content}}`)
- **File**: `prompt-context-builder.ts` line 32-41
- **Replacement**: `{{chunk_content}}` → truncated chunk text
- **Max Length**: 5000 characters (intelligent truncation at sentence boundaries)

**Transformations Applied:**
1. **Truncation**: Limit to 5000 chars, break at sentence/paragraph boundaries
2. **Metadata extraction**: Document title, section heading
3. **Dimension context** (optional): If 60-dimensional semantic analysis exists, format as additional context
4. **Multi-chunk combination**: If multiple chunks, combine with `[PRIMARY CHUNK]` / `[REFERENCE CHUNK]` markers

**NO summarization, embedding, or semantic pruning happens.** Chunks are passed through relatively raw to preserve document language.

---

### 3. Are "Template prompts" and "Scenario prompts" two different entities?

**Answer:** **NO. They are the SAME prompts with different usage patterns.**

**Evidence:**
- Same database table: `prompt_templates`
- Same template files: `tier1-templates/*.ts`
- Same selection logic: `selectTemplateByArc()`
- Same resolution logic: `resolveScaffoldingTemplate()`

**The naming is misleading:**
- ❌ "Template prompt" vs "Scenario prompt" (implies different structures)
- ✅ "Prompt used for Template-tier conversations" vs "Prompt used for Scenario-tier conversations" (same prompt, different context)

**Analogy:** 
It's like calling a form "Tax Form" vs "Detailed Tax Form" when it's the SAME form, just with more fields filled in.

---

### 4. Are scenarios simply templates with more variables, chunk integration, and higher context depth?

**Answer:** **YES, but with a critical clarification:**

**They're not "templates with MORE variables"** - they use the EXACT SAME variable set.

**They're "templates with the `chunk_context` variable POPULATED":**

```typescript
// Template-tier
{
  persona_name: "Marcus Thompson",
  topic_name: "HSA vs FSA",
  chunk_context: "",  // ← EMPTY
  // ... 40 other variables
}

// Scenario-tier (SAME VARIABLES)
{
  persona_name: "Marcus Thompson",
  topic_name: "HSA vs FSA",
  chunk_context: "HSA Contribution Limits for 2025...",  // ← POPULATED
  // ... 40 other variables (IDENTICAL)
}
```

**Chunk integration adds context depth, not structural complexity.**

---

## Part 9: System Architecture Summary

### Single Generation Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                   UNIFIED GENERATION SYSTEM                     │
│                                                                 │
│  Input: persona_id, emotional_arc_id, training_topic_id,      │
│         tier, chunk_id (optional), chunk_context (optional)    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                    ┌───────▼───────┐
                    │ Fetch Scaffolding │
                    │ (persona, arc,   │
                    │  topic entities) │
                    └───────┬───────┘
                            │
                ┌───────────▼───────────┐
                │ Check Compatibility   │
                │ (persona × arc ×      │
                │  topic validation)    │
                └───────────┬───────────┘
                            │
                ┌───────────▼───────────┐
                │ Select Template       │
                │ BY EMOTIONAL ARC      │
                │ (NOT by tier)         │
                └───────────┬───────────┘
                            │
                ┌───────────▼───────────┐
                │ Build Variables       │
                │ (~40 variables from   │
                │  scaffolding +        │
                │  chunk_context)       │
                └───────────┬───────────┘
                            │
                ┌───────────▼───────────┐
                │ Resolve Template      │
                │ (replace {{placeholders}} │
                │  with variable values)│
                └───────────┬───────────┘
                            │
                    ┌───────▼───────┐
                    │ Inject Chunk  │
                    │ (if provided) │
                    └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │ Construct     │
                    │ System Prompt │
                    └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │ Call Claude   │
                    │ API           │
                    └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │ Parse &       │
                    │ Score Quality │
                    └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │ Store with    │
                    │ tier label    │
                    └───────────────┘
```

**Key Insight:** The `tier` label flows through but doesn't alter the pipeline. It's stored as metadata, not used for branching logic.

---

## Part 10: Recommendations

### For Product Understanding

1. **Stop calling them "three types"** - They're one system with three labels
2. **Rename in UI**: "Template Tier" → "Foundational Patterns", "Scenario Tier" → "Document-Grounded", "Edge Case Tier" → "Boundary Testing"
3. **Emphasize chunk presence/absence** as the real differentiator, not tier label

### For Documentation

1. **Clarify that all tiers use the same prompts** - Update docs to reflect reality
2. **Document chunk injection as the key variable** - Not a separate system
3. **Remove references to "Scenario templates"** - They don't exist as distinct objects

### For Future Development

1. **Consider removing tier field entirely** - Use `has_chunk_context` flag instead
2. **Or enforce tier semantics with validation**:
   ```typescript
   if (tier === 'template' && chunk_context) {
     warn('Template tier should not have chunk context');
   }
   if (tier === 'scenario' && !chunk_context) {
     error('Scenario tier requires chunk context');
   }
   ```
3. **Create actual distinct templates if tiers are meant to be different** - Right now they're not

---

## Appendix: File Locations Reference

### Code Files

| File | Purpose | Key Functions |
|------|---------|--------------|
| `src/lib/services/parameter-assembly-service.ts` | Assemble generation parameters | `assembleParameters()`, `buildTemplateVariables()`, `constructSystemPrompt()` |
| `src/lib/services/template-resolver.ts` | Resolve template placeholders | `resolveTemplate()`, `resolveScaffoldingTemplate()` |
| `src/lib/services/template-selection-service.ts` | Select best template | `selectTemplateByArc()`, `validateCompatibility()` |
| `src/lib/generation/prompt-context-builder.ts` | Inject chunk context | `buildPrompt()`, `truncateContent()`, `buildMultiChunkPrompt()` |
| `src/lib/conversation-generator.ts` | Main generation orchestrator | `generateSingle()`, `callClaudeAPI()` |
| `src/app/api/conversations/generate-with-scaffolding/route.ts` | API endpoint | `POST()` handler |

### Database Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `prompt_templates` | Store prompt templates | `id`, `template_name`, `tier`, `template_text`, `variables`, `emotional_arc_type` |
| `personas` | Store persona entities | `id`, `name`, `archetype`, `typical_questions`, `common_concerns` |
| `emotional_arcs` | Store emotional arc entities | `id`, `name`, `arc_key`, `starting_emotion`, `ending_emotion` |
| `training_topics` | Store topic entities | `id`, `name`, `topic_key`, `complexity_level`, `typical_question_examples` |
| `chunks` | Store document chunks | `id`, `content`, `document_id`, `semantic_dimensions` |
| `conversations` | Store generated conversations | `id`, `tier`, `persona_id`, `emotional_arc_id`, `topic_id`, `chunk_id`, `turns` |

---

**End of Technical Examination**

**Status:** Complete with real code references and database data  
**Next Actions:** Review findings, update product documentation, consider tier system redesign  
**Key Takeaway:** "Three types" is a conceptual model, not a technical reality. The system has ONE generation pipeline with optional chunk context.

