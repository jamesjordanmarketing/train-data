# Templates Table Upgrade Specification

**Version:** 1.0
**Date:** 2025-11-13
**Status:** Implementation Specification
**Purpose:** Specification for upgrading the prompt_templates table with emotionally intelligent prompts from seed data

---

## Executive Summary

This document specifies how to upgrade the `prompt_templates` table from its current state (mock/placeholder data) to production-ready emotionally intelligent conversation prompts based on the seed conversation specifications. The upgraded templates will enable generation of high-quality training conversations that match the 5/5 quality benchmark established in the 10 seed conversations.

**Key Objectives:**
1. Extract prompt templates from c-alpha-build_v3.4-LoRA-FP-100-spec.md
2. Templatize prompts from seed conversations 1-10
3. Embed Elena Morales methodology in all templates
4. Organize templates by emotional arc as primary selector
5. Ensure all templates produce seed-quality conversations (4.5+ average)

**Out of Scope:**
- Visual template editor UI
- A/B testing different prompts
- Dynamic prompt generation
- Multi-language templates

---

## Current State Analysis

### Existing Templates Table Issues

**Problems with Current Data:**

1. **Mock/Placeholder Content**
   - Current templates contain generic, non-specific prompts
   - Do not reflect Elena Morales methodology
   - Missing emotional intelligence components
   - Not aligned with emotional arc structure

2. **Organizational Issues**
   - No clear relationship to emotional arcs
   - Templates not categorized by journey type
   - Missing tier-specific variations

3. **Quality Concerns**
   - Would not produce 5/5 quality conversations
   - Lack specific guidance on response strategies
   - Missing characteristic Elena phrases and patterns

**Current Schema (Existing Fields):**
```sql
prompt_templates:
  id, template_name, description, category, tier,
  template_text, structure, variables (JSONB),
  tone, complexity_baseline, style_notes, example_conversation,
  quality_threshold, required_elements (TEXT[]),
  usage_count, rating, success_rate,
  version, is_active,
  created_at, updated_at, created_by, last_modified_by, last_modified
```

**New Fields Added (from Pipeline Spec):**
```sql
  emotional_arc_id UUID REFERENCES emotional_arcs(id),
  emotional_arc_type VARCHAR(50),
  suitable_personas TEXT[],
  suitable_topics TEXT[],
  methodology_principles TEXT[]
```

---

## Target State Specification

### Template Organization Structure

**Primary Organization: Emotional Arc Type**

Templates will be organized by emotional journey, with variants per tier:

```
Emotional Arc: Confusion → Clarity
  ├── Template - Confusion → Clarity - Education Focus (Tier 1)
  ├── Scenario - Confusion → Clarity - Complex System (Tier 2)
  └── Edge Case - Confusion → Clarity - Extreme Overwhelm (Tier 3)

Emotional Arc: Shame → Acceptance
  ├── Template - Shame → Acceptance - Financial Trauma (Tier 1)
  ├── Scenario - Shame → Acceptance - Hidden Situation (Tier 2)
  └── Edge Case - Shame → Acceptance - Spouse Conflict (Tier 3)

Emotional Arc: Couple Conflict → Alignment
  ├── Template - Couple Conflict → Alignment - Money Values (Tier 1)
  ├── Scenario - Couple Conflict → Alignment - Major Purchase (Tier 2)
  └── Edge Case - Couple Conflict → Alignment - Emergency (Tier 3)

... (additional arcs)
```

### Elena Morales Methodology Integration

**ALL templates must embed these 5 core principles:**

1. **Money is emotional** - Acknowledge feelings before facts in EVERY response
2. **Judgment-free space** - Normalize confusion/shame explicitly
3. **Education-first** - Teach "why" not just "what"
4. **Progress over perfection** - Celebrate existing understanding
5. **Values-aligned** - Personal context over generic rules

**Characteristic Communication Patterns (must be present):**
- Explicit emotion acknowledgment: "I can hear the [emotion] in your question"
- Normalization statements: "This is incredibly common - you're not alone"
- Permission-asking: "Would it be helpful if I explained..."
- Complexity breakdown: "Let's start simple..."
- Progress celebration: "You're asking exactly the right question"
- Jargon avoidance: Never use technical terms without explanation
- Support offers: "Does that make sense?"

---

## Template Extraction Methodology

### Source Documents for Extraction

**Primary Source:**
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-100-spec.md`
  - Contains 7 prompt templates (one per emotional arc × tier combination)
  - Structured prompts with detailed guidance
  - Quality requirements and examples

**Validation Source:**
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\`
  - Conversations 1-10 (c-alpha-build_v3.4-LoRA-FP-convo-01 through 10)
  - Actual generated conversations matching spec prompts
  - Quality benchmark: All scored 5/5
  - Used to validate template effectiveness

### Extraction Process

**Step 1: Identify Prompt Boundaries**
- In c-alpha-build spec, prompts are delimited by `==========` (start) and `++++++++++` (end)
- Each prompt is complete and executable

**Step 2: Parse Prompt Structure**

Each prompt in the spec contains:
```
[PROMPT HEADER]
- Purpose
- Gold Standard Reference
- Quality Requirements

[MAIN PROMPT]
==========
You are tasked with generating...

## Task Overview
[Task description]

## Context and Quality Standards
[Quality requirements]

## Template [X] Pattern: [Emotional Arc Name]
[Arc description and structure]

## Topics for Conversations [##-##]
[Topic list]

## Persona Variation Requirements
[Persona distribution]

## Elena Morales Voice Requirements (CRITICAL)
[Voice and methodology requirements]

## Output Format
[JSON structure specification]

## Execution Instructions
[Step-by-step guidance]

## Success Criteria
[Quality gates]
++++++++++
```

**Step 3: Extract Key Components**

From each prompt, extract:

1. **Template Metadata:**
   - Name: "Template A - Confusion→Clarity"
   - Emotional Arc Type: "confusion_to_clarity"
   - Tier: "template" (based on prompt naming)
   - Description: From "Purpose" section

2. **Structural Pattern:**
   - Turn structure (3-5 turns typical)
   - Phase descriptions (confusion expression → normalization → education → clarity)

3. **Response Strategy Guidance:**
   - Primary strategy: "normalize_confusion_then_educate"
   - Response techniques: List of tactical approaches
   - Avoid tactics: What NOT to do

4. **Elena Voice Requirements:**
   - Core principles emphasized
   - Characteristic phrases
   - Communication patterns

5. **Quality Requirements:**
   - Turn count targets
   - Annotation detail level
   - Success criteria

6. **Variables:**
   - {{persona_name}}, {{starting_emotion}}, {{topic}}, etc.

**Step 4: Templatize Prompt Text**

Convert the full prompt into a reusable template with placeholders:

```
You are tasked with generating a complete, production-quality LoRA training conversation for a financial planning chatbot.

## Conversation Configuration

**Client Persona:** {{persona_name}} - {{persona_archetype}}
**Emotional Journey:** {{starting_emotion}} → {{ending_emotion}} ({{emotional_arc_name}})
**Topic:** {{topic_name}}
**Complexity:** {{topic_complexity}}
**Target Turns:** {{target_turn_count}}

## Context and Quality Standards

[Quality requirements from extraction]

## Emotional Arc Pattern: {{emotional_arc_name}}

[Arc structure from extraction]

## Elena Morales Voice Requirements (CRITICAL)

Your core principles:
1. Money is emotional - Acknowledge feelings before facts
2. Judgment-free space - Normalize struggles explicitly
3. Education-first - Teach why before what
4. Progress over perfection - Celebrate understanding
5. Values-aligned - Personal context over generic rules

Communication patterns for this arc:
{{arc_characteristic_phrases}}

Response techniques to use:
{{arc_response_techniques}}

Tactics to avoid:
{{arc_avoid_tactics}}

## Client Background

**Demographics:** {{persona_demographics}}
**Financial Situation:** {{persona_financial_background}}
**Communication Style:** {{persona_communication_style}}
**Typical Questions:** {{persona_typical_questions}}
**Common Concerns:** {{persona_common_concerns}}

## Topic Context

**Description:** {{topic_description}}
**Example Questions:**
{{topic_example_questions}}

## Output Format

[JSON structure specification - standardized across all templates]

## Execution Instructions

1. Generate a complete {{target_turn_count}}-turn conversation
2. Begin with user expressing {{starting_emotion}} about {{topic_name}}
3. Guide client from {{starting_emotion}} to {{ending_emotion}}
4. Maintain Elena's voice and methodology throughout
5. Every sentence analyzed with word choice rationales
6. Complete emotional context and response strategy annotations

## Success Criteria

✅ Conversation achieves 5/5 quality (match seed standard)
✅ Emotional progression realistic across all turns
✅ Elena's voice perfectly consistent
✅ Financial advice accurate and safe
✅ Zero placeholders or TODOs
✅ Ready for immediate LoRA training use
```

---

## Template Specifications by Emotional Arc

### Template 1: Confusion → Clarity (Tier 1)

**Source:** PROMPT 1 in c-alpha-build spec (lines 49-328)

**Template Metadata:**
```typescript
{
  template_name: "Template - Confusion → Clarity - Education Focus",
  emotional_arc_type: "confusion_to_clarity",
  tier: "template",
  category: "educational",
  description: "Guides clients from genuine confusion about financial concepts to clear understanding through judgment-free education. Most common arc for complex financial topics.",

  suitable_personas: ["overwhelmed_avoider", "anxious_planner", "pragmatic_optimist"],
  suitable_topics: [
    "hsa_vs_fsa_decision", "roth_ira_conversion", "life_insurance_types",
    "529_vs_utma", "backdoor_roth", "rmds_at_retirement", etc.
  ],
  methodology_principles: ["judgment_free_space", "education_first", "progress_over_perfection"],

  typical_turn_count_min: 3,
  typical_turn_count_max: 5,
  complexity_baseline: 7,
  quality_threshold: 4.5,

  style_notes: "Core philosophy: Confusion is normal and common. Break complexity into simple steps. Use concrete numbers. Ask permission to educate. Celebrate understanding progress.",

  example_conversation: "See c-alpha-build_v3.4-LoRA-FP-convo-01-complete.json (fp_marcus_002 - RSUs confusion)"
}
```

**Template Text (excerpt):**
```
You are tasked with generating a complete, production-quality LoRA training conversation for a financial planning chatbot.

## Conversation Configuration

**Client Persona:** {{persona_name}} - {{persona_archetype}}
**Emotional Journey:** Confusion (0.70-0.85 intensity) → Clarity (0.70-0.80 intensity)
**Topic:** {{topic_name}}
**Complexity:** {{topic_complexity}}
**Target Turns:** 3-5

## Emotional Arc Pattern: Confusion → Clarity

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

## Elena Morales Voice Requirements (CRITICAL)

**Must maintain ALL of Elena's principles:**

1. **Money is emotional** - Acknowledge feelings before facts in EVERY response
2. **Judgment-free space** - Normalize confusion explicitly ("this is incredibly common")
3. **Education-first** - Teach "why" not just "what"
4. **Progress over perfection** - Celebrate existing understanding
5. **Values-aligned** - Personal context over generic rules

**Communication Patterns:**
- Acknowledges emotions explicitly: "I can hear the confusion in your question"
- Uses concrete numbers: "$6,500 annual limit" not "there's a limit"
- Asks permission: "Would it be helpful if I explained..."
- Breaks complexity: "Let's start simple..."
- Celebrates progress: "You're asking exactly the right question"
- Never uses jargon without explanation
- Ends with support: "Does that make sense?"

## Client Background

**Persona:** {{persona_name}}
**Demographics:** {{persona_demographics}}
**Financial Situation:** {{persona_financial_background}}
**Communication Style:** {{persona_communication_style}}

**Typical Questions This Persona Asks:**
{{persona_typical_questions}}

**Common Concerns:**
{{persona_common_concerns}}

**Language Patterns to Expect:**
{{persona_language_patterns}}

## Topic Context

**Topic:** {{topic_name}}
**Description:** {{topic_description}}
**Complexity Level:** {{topic_complexity}}

**Typical Questions Clients Ask About This Topic:**
{{topic_example_questions}}

**Key Concepts to Address:**
{{topic_key_concepts}}

## Output Format

Generate a complete JSON conversation following this exact schema:

[Full JSON schema from c-alpha-build_v3.4_emotional-dataset-JSON-format_v2.json]

**For EACH turn, generate:**
- Full conversation_metadata (only in turn 1)
- System prompt with all 5 Elena principles
- Conversation history (previous turns)
- Current user input (authentic, shows confusion)
- Complete emotional_context with:
  - detected_emotions (primary, secondary, tertiary with confidence scores)
  - emotional_indicators (6-8 categories with 4-8 specific examples each)
  - emotional_progression (for turns 2+)
  - behavioral_assessment (4 dimensions)
  - client_needs_hierarchy (3-4 prioritized needs)
- Complete response_strategy with:
  - primary_strategy with 2-3 sentence rationale
  - secondary_strategies (2-3)
  - tone_selection with rationale
  - tactical_choices (5-8 specific decisions)
  - avoid_tactics (what NOT to do)
  - specific_techniques (2-3 with application and purpose)
- Target response (Elena's full response, 200-400 words)
- Complete response_breakdown with EVERY sentence analyzed:
  - sentence_number, text, function, emotional_purpose, technique
  - word_choice_rationale (3-6 key phrases per sentence with explanations)
  - psychological_principle (if applicable)
- Expected user response patterns (positive, neutral, negative indicators)
- Training metadata with quality scores (all 5/5)

## Execution Instructions

1. Generate Turn 1: User expresses confusion about {{topic_name}}
2. Generate Elena's Turn 1 response with complete annotations
3. Generate Turn 2: User provides details, slight relief
4. Generate Elena's Turn 2 response with complete annotations
5. Continue for {{target_turn_count}} turns total
6. Ensure emotional progression: Confusion (0.75) → Recognition (0.65) → Clarity (0.75)
7. Every field fully populated (no TODOs or placeholders)

## Success Criteria

✅ Conversation achieves 5/5 quality (match seed conversation #1)
✅ Every sentence analyzed with 3-6 word choice rationales
✅ Emotional progression realistic across all turns
✅ Elena's voice perfectly consistent throughout
✅ Financial advice accurate and safe for {{topic_name}}
✅ Numbers realistic for {{persona_name}}'s situation
✅ Zero placeholders or TODOs
✅ Ready for immediate LoRA training use

## Begin Generation

Generate the complete {{target_turn_count}}-turn conversation now, following all requirements above.
```

**Variable Mapping:**
```typescript
{
  persona_name: "Marcus", // from persona.short_name
  persona_archetype: "Overwhelmed Avoider", // from persona.archetype_summary
  starting_emotion: "confusion", // from emotional_arc.starting_emotion
  ending_emotion: "clarity", // from emotional_arc.ending_emotion
  emotional_arc_name: "Confusion → Clarity", // from emotional_arc.name
  topic_name: "HSA vs FSA Decision Paralysis", // from training_topic.name
  topic_description: "Client confusion about...", // from training_topic.description
  topic_complexity: "intermediate", // from training_topic.complexity_level
  target_turn_count: "3-5", // from emotional_arc.typical_turn_count_min/max
  persona_demographics: {...}, // from persona.demographics (as formatted text)
  persona_financial_background: "...", // from persona.financial_background
  persona_communication_style: "...", // from persona.communication_style
  persona_typical_questions: [...], // from persona.typical_questions (as bullet list)
  persona_common_concerns: [...], // from persona.common_concerns (as bullet list)
  persona_language_patterns: [...], // from persona.language_patterns (as bullet list)
  topic_example_questions: [...], // from training_topic.typical_question_examples
  topic_key_concepts: [...], // derived or stored in training_topic
  arc_characteristic_phrases: [...], // from emotional_arc.characteristic_phrases
  arc_response_techniques: [...], // from emotional_arc.response_techniques
  arc_avoid_tactics: [...] // from emotional_arc.avoid_tactics
}
```

### Template 2: Shame → Acceptance (Tier 1)

**Source:** PROMPT 2 in c-alpha-build spec (lines 330-455)

**Template Metadata:**
```typescript
{
  template_name: "Template - Shame → Acceptance - Financial Trauma",
  emotional_arc_type: "shame_to_acceptance",
  tier: "template",
  category: "therapeutic",
  description: "Guides clients from financial shame and self-judgment to acceptance and self-compassion. Handles sensitive situations with deep emotional care.",

  suitable_personas: ["overwhelmed_avoider", "anxious_planner"],
  suitable_topics: [
    "no_retirement_at_45", "paycheck_to_paycheck_high_income",
    "never_checking_401k", "credit_card_debt_lifestyle", etc.
  ],
  methodology_principles: ["judgment_free_space", "progress_over_perfection", "values_aligned"],

  typical_turn_count_min: 4,
  typical_turn_count_max: 5,
  complexity_baseline: 8,
  quality_threshold: 5.0, // Shame conversations require highest quality

  style_notes: "CRITICAL for shame: Immediate normalization, explicit non-judgment, separate past from future, celebrate courage, reframe strength, provide concrete path forward. NEVER say 'you should have...', never minimize shame, never rush to solutions.",

  example_conversation: "See c-alpha-build_v3.4-LoRA-FP-convo-05-complete.json (fp_marcus_006 - Debt shame)"
}
```

**Key Differences from Confusion→Clarity:**

1. **Opening Response MUST include:**
   - "You are not alone - this is more common than you think"
   - "There's no judgment here" or "You have nothing to be ashamed of"
   - "It takes real courage to face this honestly"

2. **Middle Turns MUST:**
   - Separate past from future: "You can't change the past, but you can change what happens next"
   - Find and celebrate existing positive actions
   - Shift from shame to actionable steps quickly (but not before validation)

3. **Avoid at ALL costs:**
   - "You should have..." language
   - Minimizing: "It's not that bad"
   - Rushing to solutions before validating emotion
   - Comparative language: "Others have it worse"

**Template Text Structure:** Similar to Template 1, but with shame-specific sections emphasized and examples changed.

### Template 3: Couple Conflict → Alignment (Tier 1)

**Source:** PROMPT 3 in c-alpha-build spec (lines 457-500+)

**Template Metadata:**
```typescript
{
  template_name: "Template - Couple Conflict → Alignment - Money Values",
  emotional_arc_type: "couple_conflict_to_alignment",
  tier: "template",
  category: "conflict_resolution",
  description: "Navigates financial disagreements between partners, validating both perspectives while finding third-way solutions. Handles tension and external pressure.",

  suitable_personas: ["pragmatic_optimist", "anxious_planner"],
  suitable_topics: [
    "wedding_debt_vs_house", "spending_habits_conflict",
    "retirement_timeline_disagreement", "risk_tolerance_mismatch", etc.
  ],
  methodology_principles: ["values_aligned", "judgment_free_space", "education_first"],

  typical_turn_count_min: 3,
  typical_turn_count_max: 4,
  complexity_baseline: 7,
  quality_threshold: 4.5,

  style_notes: "Normalize couple money disagreements immediately. Validate BOTH perspectives explicitly. Challenge either/or thinking. Look for values underneath positions. Third-way solutions that honor both partners.",

  example_conversation: "See c-alpha-build_v3.4-LoRA-FP-convo-10-complete.json (fp_david_002 - Wedding debt vs house)"
}
```

**Key Pattern:**
1. **Turn 1:** Validate both perspectives explicitly, normalize couple conflict
2. **Turn 2:** Explore values beneath positions, challenge either/or framing
3. **Turn 3:** Suggest third-way solutions, provide framework for discussion
4. **Turn 4 (optional):** Celebrate partnership, reinforce shared values

---

## Database Population Strategy

### Step 1: Clear Existing Mock Data

```sql
-- Backup existing templates (just in case)
CREATE TABLE prompt_templates_backup AS SELECT * FROM prompt_templates;

-- Delete mock templates
DELETE FROM prompt_templates WHERE created_by IS NULL;
-- OR: Delete ALL if starting fresh
TRUNCATE TABLE prompt_templates CASCADE;
```

### Step 2: Insert New Templates

**Insertion Script:** `src/scripts/populate-templates.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { TEMPLATE_DEFINITIONS } from './template-definitions';

async function populateTemplates() {
  const supabase = createClient();

  console.log('Starting template population...');

  for (const template of TEMPLATE_DEFINITIONS) {
    // 1. Link to emotional arc
    const { data: arc, error: arcError } = await supabase
      .from('emotional_arcs')
      .select('id')
      .eq('arc_type', template.emotional_arc_type)
      .single();

    if (arcError || !arc) {
      console.error(`Failed to find emotional arc: ${template.emotional_arc_type}`);
      continue;
    }

    // 2. Prepare template record
    const templateRecord = {
      template_name: template.template_name,
      description: template.description,
      category: template.category,
      tier: template.tier,

      template_text: template.template_text, // Full prompt with placeholders
      structure: template.structure, // Turn-by-turn structure summary
      variables: template.variables, // JSONB: list of all placeholders

      tone: template.tone,
      complexity_baseline: template.complexity_baseline,
      style_notes: template.style_notes,
      example_conversation: template.example_conversation,
      quality_threshold: template.quality_threshold,
      required_elements: template.required_elements,

      // New fields
      emotional_arc_id: arc.id,
      emotional_arc_type: template.emotional_arc_type,
      suitable_personas: template.suitable_personas,
      suitable_topics: template.suitable_topics,
      methodology_principles: template.methodology_principles,

      // Metadata
      usage_count: 0,
      rating: 0, // Will be updated based on usage
      success_rate: 0, // Will be tracked over time
      version: 1,
      is_active: true,

      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 3. Insert template
    const { error: insertError } = await supabase
      .from('prompt_templates')
      .insert(templateRecord);

    if (insertError) {
      console.error(`Failed to insert template ${template.template_name}:`, insertError);
    } else {
      console.log(`✓ Inserted template: ${template.template_name}`);
    }
  }

  console.log('\n✅ Template population complete!');
}

// Run if executed directly
if (require.main === module) {
  populateTemplates().catch(console.error);
}
```

### Step 3: Validate Templates

**Validation Script:** `src/scripts/validate-templates.ts`

```typescript
async function validateTemplates() {
  const supabase = createClient();

  // 1. Check all templates have emotional arc links
  const { data: templatesWithoutArcs } = await supabase
    .from('prompt_templates')
    .select('id, template_name')
    .is('emotional_arc_id', null);

  if (templatesWithoutArcs && templatesWithoutArcs.length > 0) {
    console.error('Templates missing emotional arc links:', templatesWithoutArcs);
  }

  // 2. Check all templates have required fields
  const { data: allTemplates } = await supabase
    .from('prompt_templates')
    .select('*');

  for (const template of allTemplates || []) {
    const issues: string[] = [];

    if (!template.template_text) issues.push('Missing template_text');
    if (!template.methodology_principles || template.methodology_principles.length === 0) {
      issues.push('Missing methodology_principles');
    }
    if (!template.suitable_personas || template.suitable_personas.length === 0) {
      issues.push('Missing suitable_personas');
    }
    if (!template.quality_threshold) issues.push('Missing quality_threshold');

    if (issues.length > 0) {
      console.error(`Template ${template.template_name} issues:`, issues);
    }
  }

  // 3. Check template count per arc
  const { data: arcs } = await supabase
    .from('emotional_arcs')
    .select('arc_type, name');

  for (const arc of arcs || []) {
    const { count } = await supabase
      .from('prompt_templates')
      .select('*', { count: 'exact', head: true })
      .eq('emotional_arc_type', arc.arc_type);

    if (count === 0) {
      console.warn(`Emotional arc ${arc.name} has no templates!`);
    } else {
      console.log(`✓ ${arc.name}: ${count} template(s)`);
    }
  }

  console.log('\n✅ Template validation complete!');
}
```

---

## Template Quality Assurance

### Quality Checklist Per Template

Before marking a template as production-ready:

**1. Elena Methodology Embedded ✓**
- [ ] All 5 core principles explicitly stated in template
- [ ] Characteristic phrases included
- [ ] Communication patterns specified
- [ ] Response techniques listed
- [ ] Avoid tactics documented

**2. Complete Variable Coverage ✓**
- [ ] All persona variables mapped
- [ ] All emotional arc variables mapped
- [ ] All training topic variables mapped
- [ ] All tier-specific variables mapped
- [ ] Additional context variables (chunk, document) supported

**3. JSON Schema Alignment ✓**
- [ ] Output format matches c-alpha-build JSON schema exactly
- [ ] All required fields specified
- [ ] Annotation depth requirements clear (3-6 word choices per sentence)
- [ ] Quality scoring criteria included

**4. Quality Targets Clear ✓**
- [ ] Success criteria specified
- [ ] Quality threshold defined (4.5+)
- [ ] Turn count targets stated
- [ ] Emotional progression mapped
- [ ] Example conversation referenced

**5. Edge Case Handling ✓**
- [ ] Guidance for unusual situations
- [ ] Error recovery instructions
- [ ] Boundary condition notes
- [ ] Safety guardrails (financial advice accuracy)

### Testing Strategy

**Test Generation Per Template:**

1. **Baseline Test:**
   - Generate 3 conversations using template with different personas
   - Verify all produce parseable JSON
   - Check quality scores (target: 4.5+)
   - Validate emotional progression realistic

2. **Persona Compatibility Test:**
   - Test template with each suitable persona type
   - Verify persona traits reflected in conversation
   - Check language patterns match persona

3. **Topic Variation Test:**
   - Test template with 3 different topics from suitable list
   - Verify topic-specific guidance incorporated
   - Check financial advice accuracy per topic

4. **Edge Case Test:**
   - Test with extreme emotional intensities
   - Test with unusual persona-topic combinations
   - Verify graceful degradation (still produces quality conversation)

5. **Comparison to Seed:**
   - Generate conversation matching seed scenario
   - Compare structure, quality, voice
   - Verify meets or exceeds seed quality

---

## Template Definitions Reference

### Complete Template List (POC)

**Tier 1 (Template) - 7 templates:**

1. Template - Confusion → Clarity - Education Focus
2. Template - Shame → Acceptance - Financial Trauma
3. Template - Couple Conflict → Alignment - Money Values
4. Template - Fear → Confidence - Investment Anxiety
5. Template - Overwhelm → Empowerment - Complex Situation
6. Template - Plateau → Breakthrough - Stagnation
7. Template - Emergency → Calm - Crisis Management

**Tier 2 (Scenario) - TBD (Future):**
- Scenario variations of each arc with domain-specific contexts

**Tier 3 (Edge Case) - TBD (Future):**
- Boundary condition handling, unusual combinations

### Template File Structure

**Organization:** `src/lib/templates/definitions/`

```
definitions/
├── tier1-templates/
│   ├── confusion-to-clarity.ts
│   ├── shame-to-acceptance.ts
│   ├── couple-conflict-to-alignment.ts
│   ├── fear-to-confidence.ts
│   ├── overwhelm-to-empowerment.ts
│   ├── plateau-to-breakthrough.ts
│   └── emergency-to-calm.ts
├── tier2-scenarios/ (future)
└── tier3-edge-cases/ (future)
```

**Example File:** `confusion-to-clarity.ts`

```typescript
export const CONFUSION_TO_CLARITY_TEMPLATE = {
  template_name: "Template - Confusion → Clarity - Education Focus",
  emotional_arc_type: "confusion_to_clarity",
  tier: "template",
  category: "educational",
  description: "Guides clients from genuine confusion about financial concepts to clear understanding through judgment-free education. Most common arc for complex financial topics.",

  template_text: `[Full prompt text as extracted]`,

  structure: "Turn 1: Express confusion → Turn 2: Normalize + educate → Turn 3: Follow-up + understanding → Turn 4: Clarity + confidence → Turn 5 (optional): Action readiness",

  variables: {
    required: [
      "persona_name", "persona_archetype", "persona_demographics",
      "persona_financial_background", "persona_communication_style",
      "persona_typical_questions", "persona_common_concerns",
      "starting_emotion", "ending_emotion", "emotional_arc_name",
      "topic_name", "topic_description", "topic_complexity",
      "topic_example_questions", "target_turn_count"
    ],
    optional: [
      "chunk_context", "topic_key_concepts"
    ]
  },

  tone: "warm, professional, never condescending, deeply empathetic",
  complexity_baseline: 7,

  style_notes: "Core philosophy: Confusion is normal and common. Break complexity into simple steps. Use concrete numbers. Ask permission to educate. Celebrate understanding progress.",

  example_conversation: "c-alpha-build_v3.4-LoRA-FP-convo-01-complete.json (fp_marcus_002)",

  quality_threshold: 4.5,

  required_elements: [
    "explicit_emotion_acknowledgment",
    "normalization_statement",
    "concrete_numbers_or_examples",
    "permission_asking",
    "complexity_breakdown",
    "progress_celebration",
    "jargon_avoidance"
  ],

  suitable_personas: ["overwhelmed_avoider", "anxious_planner", "pragmatic_optimist"],
  suitable_topics: [
    "hsa_vs_fsa_decision", "roth_ira_conversion", "life_insurance_types",
    "529_vs_utma", "backdoor_roth", "rmds_at_retirement", "mega_backdoor_roth",
    "donor_advised_funds", "tax_loss_harvesting", "index_vs_mutual_vs_etf"
  ],
  methodology_principles: ["judgment_free_space", "education_first", "progress_over_perfection"]
};
```

---

## Maintenance & Iteration Strategy

### Template Versioning

**Version Tracking:**
- Each template has `version` field (starts at 1)
- When updating template, increment version
- Keep previous version for comparison/rollback

**Version Update Process:**
1. Duplicate current template
2. Update `version` field to N+1
3. Modify template_text
4. Test with 3+ generations
5. Compare quality to previous version
6. If better, activate new version
7. If worse, keep old version active

### Quality Improvement Loop

**Monthly Review Process:**

1. **Usage Analysis:**
   - Which templates used most?
   - Which have highest success rates?
   - Which produce highest quality scores?

2. **Quality Scoring:**
   - Average quality score per template
   - Approval rate per template
   - Identify low performers (< 4.5 average)

3. **Refinement:**
   - For low performers: Analyze failed generations
   - Identify common issues (emotional progression, voice consistency, structure)
   - Update template guidance
   - Re-test with same scenarios

4. **Documentation:**
   - Log changes made
   - Track quality improvement
   - Update best practices guide

---

## Implementation Checklist

### Phase 1: Extraction & Preparation (Week 1)

- [ ] Read full c-alpha-build_v3.4-LoRA-FP-100-spec.md
- [ ] Extract all 7 prompts (Template A, B, C, etc.)
- [ ] Read all 10 seed conversations
- [ ] Map prompts to seed conversations (which prompt generated which conversation)
- [ ] Document extraction methodology
- [ ] Create template definition files

### Phase 2: Templatization (Week 1-2)

- [ ] Create template structure for each arc
- [ ] Identify all variable placeholders
- [ ] Write variable substitution logic
- [ ] Embed Elena methodology in all templates
- [ ] Add quality requirements
- [ ] Document suitable personas/topics per template

### Phase 3: Database Population (Week 2)

- [ ] Write population script
- [ ] Clear mock data from templates table
- [ ] Insert new templates
- [ ] Link to emotional arcs
- [ ] Validate all required fields present
- [ ] Run validation script

### Phase 4: Testing & Validation (Week 2-3)

- [ ] Test each template with 3+ persona-topic combinations
- [ ] Verify quality scores (4.5+)
- [ ] Compare to seed conversations
- [ ] Check emotional progression
- [ ] Validate Elena voice consistency
- [ ] Test variable substitution correctness

### Phase 5: Integration (Week 3)

- [ ] Integrate templates with TemplateSelectionService
- [ ] Test full generation flow with new templates
- [ ] Verify UI correctly displays template-generated conversations
- [ ] End-to-end testing

### Phase 6: Documentation (Week 3-4)

- [ ] Document template organization structure
- [ ] Create maintenance guide
- [ ] Write quality assurance procedures
- [ ] Document versioning strategy
- [ ] Create troubleshooting guide

---

## Success Criteria

**Templates Upgrade Complete When:**

1. ✅ All 7 Tier 1 templates extracted and populated
2. ✅ Every template linked to correct emotional arc
3. ✅ Elena methodology embedded in all templates
4. ✅ Variable substitution tested and working
5. ✅ Test generations achieve 4.5+ average quality
6. ✅ Emotional progressions realistic and natural
7. ✅ Generated conversations indistinguishable from seed quality
8. ✅ Template selection logic working correctly
9. ✅ Documentation complete
10. ✅ Validation scripts passing

---

## Appendix A: Full Template Extraction Example

**Source Prompt (excerpt from c-alpha-build spec):**

```markdown
==========

You are tasked with generating 10 complete, production-quality LoRA training conversations for a financial planning chatbot.

## Task Overview

Generate conversations 11-20 following the **"Confusion→Clarity" emotional arc template** (Tier 1, Template A).

## Context and Quality Standards

**You must read and internalize these files first:**
1. `c-alpha-build_v3.4-LoRA-FP-convo-10-first_v1.json` - Review conversation #1 (fp_marcus_002) as your quality benchmark
2. `c-alpha-build_v3.4_emotional-dataset-JSON-format_v2.json` - Exact JSON schema to follow
3. `financial-planner-demo-conversation-and-metadata_v1.txt` - Elena Morales persona and client personas

**Quality Requirements:**
- Every conversation must achieve 5/5 quality (match Phase 1 standard)
- Every sentence analyzed with 3-6 word choice rationales
...

++++++++++
```

**Extracted Template:**

```
Template Name: Template - Confusion → Clarity - Education Focus
Emotional Arc: confusion_to_clarity
Tier: template

[Full templatized prompt with all guidance and requirements]
```

**Result:** Template ready for database insertion and use in generation.

---

## Appendix B: Variable Substitution Reference

**Complete Variable List:**

```typescript
interface TemplateVariables {
  // Persona
  persona_name: string;
  persona_type: string;
  persona_archetype: string;
  persona_demographics: string; // Formatted text
  persona_financial_background: string;
  persona_financial_situation: string;
  persona_communication_style: string;
  persona_emotional_baseline: string;
  persona_typical_questions: string; // Bullet list
  persona_common_concerns: string; // Bullet list
  persona_language_patterns: string; // Bullet list

  // Emotional Arc
  emotional_arc_name: string;
  starting_emotion: string;
  starting_intensity_min: number;
  starting_intensity_max: number;
  ending_emotion: string;
  ending_intensity_min: number;
  ending_intensity_max: number;
  arc_strategy: string;
  arc_key_principles: string; // Comma-separated
  arc_characteristic_phrases: string; // Bullet list
  arc_response_techniques: string; // Bullet list
  arc_avoid_tactics: string; // Bullet list

  // Training Topic
  topic_name: string;
  topic_key: string;
  topic_description: string;
  topic_category: string;
  topic_complexity: string;
  topic_example_questions: string; // Bullet list
  topic_key_concepts: string; // Bullet list (optional)

  // Generation Configuration
  tier: string;
  target_turn_count: string; // "3-5"
  temperature: number;
  max_tokens: number;

  // Additional Context (optional)
  chunk_context: string;
  document_id: string;
  chunk_id: string;
}
```

---

**Document Status:** Template upgrade specification complete, ready for extraction and implementation
**Next Steps:** Begin template extraction from c-alpha-build spec
**Related Documents:**
- `04-categories-to-conversation-strategic-overview_v1.md` (Strategic foundation)
- `04-categories-to-conversation-pipeline-spec_v1.md` (Pipeline technical spec)
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-100-spec.md` (Source for extraction)
