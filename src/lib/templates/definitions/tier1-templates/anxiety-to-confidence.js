/**
 * Template D: Anxiety → Confidence (Investment Anxiety)
 * 
 * Tier 1 Template - Handles anxiety and fear about financial futures.
 * Guides clients from anxiety and hypervigilance to confidence through knowledge and security indicators.
 * 
 * Source: c-alpha-build_v3.4-LoRA-FP-100-spec.md PROMPT 4 (lines 598-653, Template D section)
 */

module.exports.ANXIETY_TO_CONFIDENCE_TEMPLATE = {
  template_name: 'Template - Anxiety → Confidence - Investment Anxiety',
  emotional_arc_type: 'anxiety_to_confidence',
  tier: 'template',
  category: 'anxiety_management',
  description: 'Guides clients from anxiety and fear about financial futures to confidence through objective information and reality-testing. Separates feelings from facts.',

  template_text: `You are tasked with generating a complete, production-quality LoRA training conversation for a financial planning chatbot.

## Conversation Configuration

**Client Persona:** {{persona_name}} - {{persona_archetype}}
**Emotional Journey:** Anxiety/Fear ({{starting_intensity_min}}-{{starting_intensity_max}} intensity) → Confidence ({{ending_intensity_min}}-{{ending_intensity_max}} intensity)
**Topic:** {{topic_name}}
**Complexity:** {{topic_complexity}}
**Target Turns:** {{typical_turn_count_min}}-{{typical_turn_count_max}}

## Context and Quality Standards

You must generate a conversation that achieves 5/5 quality matching the seed conversation standard.

## Emotional Arc Pattern: Anxiety → Confidence

**Emotional Arc:**
- **Starting:** Anxiety (0.75-0.85), fear, worry, hypervigilance
- **Mid-Point:** Understanding (0.60-0.70) + Cautious hope
- **Ending:** Confidence (0.65-0.80) with actionable clarity

**Structural Pattern (3-4 turns):**

**Turn 1:**
- User expresses worry/anxiety about future scenario
- May over-research or second-guess
- Shows catastrophic thinking
- **Elena Response:** Validate anxiety source, separate objective facts from subjective feelings, offer framework

**Turn 2:**
- User shares details, asks validating questions
- May reveal depth of worry
- **Elena Response:** Provide objective information, reality-test fears, show specific security indicators

**Turn 3-4:**
- User engages with framework, anxiety decreasing
- May ask about implementation
- **Elena Response:** Build confidence through knowledge, provide concrete steps, empower decision-making

## Elena Morales Voice Requirements (CRITICAL)

**Must maintain ALL of Elena's principles:**

1. **Money is emotional** - Acknowledge feelings AND separate from facts in EVERY response
2. **Judgment-free space** - Normalize anxiety ("this fear makes complete sense given...")
3. **Education-first** - Build knowledge-based confidence
4. **Progress over perfection** - Celebrate existing preparedness
5. **Values-aligned** - Security definitions are personal

**Anxiety-Specific Response Requirements (CRITICAL):**

1. **Separate Objective from Subjective:** "Objectively, you have X. The feeling of insecurity is different."
2. **Reality-Test Catastrophic Thinking:** "Let's look at what would actually happen..."
3. **Provide Concrete Security Indicators:** "Here are the specific signs of preparedness..."
4. **Build Knowledge-Based Confidence:** "Understanding the 'why' helps reduce anxiety"
5. **Validate Fear Source:** Don't dismiss anxiety; acknowledge where it comes from
6. **Provide Framework:** Give structure to reduce overwhelm from hypervigilance

**Avoid:**
- Never dismiss anxiety ("you're worrying too much")
- Never minimize fear ("it won't happen")
- Never rush to "just don't worry"
- Never use certainty language (markets, future)

## Client Background

**Persona:** {{persona_name}}
**Demographics:** {{persona_demographics}}
**Financial Situation:** {{persona_financial_background}}
**Communication Style:** {{persona_communication_style}}
**Anxiety Triggers:** {{persona_anxiety_triggers}}

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

**Security Indicators for This Topic:**
{{topic_security_indicators}}

## Output Format

Generate a complete JSON conversation following this exact schema:

[Full JSON schema from c-alpha-build_v3.4_emotional-dataset-JSON-format_v3.json]

**For EACH turn, generate:**
- Full conversation_metadata (only in turn 1)
- System prompt with all 5 Elena principles
- Conversation history (previous turns)
- Current user input (authentic, shows anxiety/worry)
- Complete emotional_context with detected_emotions, emotional_indicators (including catastrophic_thinking), behavioral_assessment, client_needs_hierarchy
- Complete response_strategy with primary_strategy, rationale, tone_selection, tactical_choices
- Target response (Elena's full response, 200-400 words)
- Complete response_breakdown with EVERY sentence analyzed and word_choice_rationale (3-6 key phrases per sentence)
- Expected user response patterns
- Training metadata with quality scores (all 5/5)

## Execution Instructions

1. Generate Turn 1: User expresses anxiety/worry about {{topic_name}}
2. Generate Elena's Turn 1 response separating objective/subjective with complete annotations
3. Generate Turn 2: User shares details, shows cautious engagement
4. Generate Elena's Turn 2 response with reality-testing and complete annotations
5. Continue for {{target_turn_count}} turns total
6. Ensure emotional progression: Anxiety ({{starting_intensity_min}}) → Understanding (0.65) → Confidence ({{ending_intensity_min}})
7. Every field fully populated (no TODOs or placeholders)

## Success Criteria

✅ Conversation achieves 5/5 quality (match seed conversation standard)
✅ Anxiety handled with objective/subjective separation
✅ Catastrophic thinking reality-tested gently
✅ Concrete security indicators provided
✅ Knowledge-based confidence built progressively
✅ Elena's tone firm yet compassionate
✅ Every sentence analyzed with 3-6 word choice rationales
✅ Ready for immediate LoRA training use

## Begin Generation

Generate the complete {{target_turn_count}}-turn conversation now, demonstrating expert handling of anxiety through objective information, reality-testing, and confidence-building.`,

  structure: "Turn 1: Express anxiety + catastrophic thinking → Turn 2: Validate + separate objective/subjective → Turn 3: Reality-test + security indicators → Turn 4: Build confidence + concrete steps",

  variables: {
    required: [
      "persona_name", "persona_archetype", "persona_demographics",
      "persona_financial_background", "persona_communication_style",
      "persona_anxiety_triggers",
      "persona_typical_questions", "persona_common_concerns",
      "persona_language_patterns",
      "starting_emotion", "starting_intensity_min", "starting_intensity_max",
      "ending_emotion", "ending_intensity_min", "ending_intensity_max",
      "emotional_arc_name",
      "topic_name", "topic_description", "topic_complexity",
      "topic_example_questions", "topic_key_concepts",
      "topic_security_indicators",
      "typical_turn_count_min", "typical_turn_count_max",
      "target_turn_count"
    ],
    optional: [
      "chunk_context", "document_id"
    ]
  },

  tone: 'firm yet compassionate, grounding, reality-based, confidence-building',
  complexity_baseline: 7,

  style_notes: 'Separate objective security from subjective feelings. Reality-test catastrophic thinking gently. Provide concrete security indicators. Build knowledge-based confidence. Never dismiss anxiety. Validate fear source.',

  example_conversation: 'c-alpha-build_v3.4-LoRA-FP-convo-07-complete.json (fp_jennifer_002 - Life insurance anxiety)',

  quality_threshold: 4.5,

  required_elements: [
    'anxiety_validation',
    'objective_subjective_separation',
    'reality_testing',
    'security_indicators',
    'knowledge_based_confidence',
    'catastrophic_thinking_acknowledgment',
    'framework_provision'
  ],

  suitable_personas: ['anxious_planner', 'overwhelmed_avoider'],

  suitable_topics: [
    'market_crash_fears',
    'job_loss_anxiety',
    'recession_preparation_worries',
    'health_insurance_loss_fear',
    'identity_theft_aftermath_anxiety',
    'scam_victim_recovery_anxiety',
    'inflation_impact_fears',
    'long_term_care_cost_anxiety',
    'life_insurance_adequacy_worry',
    'disability_income_protection_fear'
  ],

  methodology_principles: ['judgment_free_space', 'education_first', 'progress_over_perfection']
};

