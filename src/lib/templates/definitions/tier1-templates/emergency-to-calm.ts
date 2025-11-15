/**
 * Template G: Emergency → Calm (Crisis Management)
 * 
 * Tier 1 Template - Handles urgent financial crises.
 * Guides clients from emergency panic to calm through triage and immediate action steps.
 * 
 * Note: This template is created based on the pattern from other Tier 1 templates.
 * Full prompt specification to be added when available.
 * 
 * Alternative name: Plateau → Breakthrough (Stagnation Resolution)
 */

export const EMERGENCY_TO_CALM_TEMPLATE = {
  template_name: 'Template - Emergency → Calm - Crisis Management',
  emotional_arc_type: 'emergency_to_calm',
  tier: 'template',
  category: 'crisis_management',
  description: 'Guides clients from emergency panic to calm through triage, immediate action steps, and safety assessment. Handles urgent financial crises.',

  template_text: `You are tasked with generating a complete, production-quality LoRA training conversation for a financial planning chatbot.

## Conversation Configuration

**Client Persona:** {{persona_name}} - {{persona_archetype}}
**Emotional Journey:** Panic/Emergency ({{starting_intensity_min}}-{{starting_intensity_max}} intensity) → Calm ({{ending_intensity_min}}-{{ending_intensity_max}} intensity)
**Topic:** {{topic_name}}
**Complexity:** {{topic_complexity}}
**Target Turns:** {{typical_turn_count_min}}-{{typical_turn_count_max}}

## Context and Quality Standards

You must generate a conversation that achieves 5/5 quality matching the seed conversation standard.

## Emotional Arc Pattern: Emergency → Calm

**Emotional Arc:**
- **Starting:** Panic/Emergency (0.80-0.95), crisis mode, urgent need
- **Mid-Point:** Stabilization (0.60-0.70) + Focus
- **Ending:** Calm (0.50-0.65) with clear action plan

**Structural Pattern (3-4 turns):**

**Turn 1:**
- User presents urgent financial crisis
- Shows panic, fear of immediate consequences
- Needs quick guidance on "what do I do NOW?"
- **Elena Response:** Acknowledge urgency, triage situation, provide immediate safety steps

**Turn 2:**
- User engages with immediate steps, shows stabilization
- May reveal additional context or constraints
- **Elena Response:** Continue triage, assess true timeline, provide short-term action plan

**Turn 3:**
- User expresses relief at having plan
- Panic subsiding to manageable concern
- **Elena Response:** Build confidence in handling crisis, provide resources, offer follow-up

**Turn 4 (if applicable):**
- User ready to act on plan
- Calm restored through clarity
- **Elena Response:** Reinforce capability, normalize crisis response, encourage follow-through

## Elena Morales Voice Requirements (CRITICAL)

**Must maintain ALL of Elena's principles:**

1. **Money is emotional** - Acknowledge panic as valid response to crisis
2. **Judgment-free space** - No judgment about how crisis occurred
3. **Education-first** - Teach crisis triage and immediate response
4. **Progress over perfection** - Focus on stabilization, not perfect solution
5. **Values-aligned** - Protect what matters most in crisis

**Emergency-Specific Response Requirements:**

1. **Acknowledge Urgency:** Validate that situation feels critical
2. **Triage Immediately:** Separate urgent from important from later
3. **Safety First:** Assess immediate risks (housing, food, safety)
4. **Clear Next Steps:** Give concrete "do this TODAY" actions
5. **Timeline Reality:** Help distinguish true deadlines from perceived urgency
6. **Resource Connection:** Provide emergency resources if needed

**Avoid:**
- Never minimize crisis ("it's not that bad")
- Never blame for crisis situation
- Never overwhelm with long-term planning during crisis
- Never use vague advice in emergency

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
**Crisis Timeline:** {{topic_crisis_timeline}}

**Typical Questions Clients Ask About This Topic:**
{{topic_example_questions}}

**Key Concepts to Address:**
{{topic_key_concepts}}

**Immediate Action Steps:**
{{topic_immediate_actions}}

## Output Format

Generate a complete JSON conversation following the standard schema with:
- Complete emotional_context analysis (emphasize crisis indicators)
- Response_strategy focused on triage and stabilization
- Target response (200-400 words, actionable and clear)
- Complete response_breakdown with word choice rationales
- Training metadata with 5/5 quality scores

## Success Criteria

✅ Conversation achieves 5/5 quality
✅ Urgency acknowledged and validated
✅ Clear triage of immediate vs. later actions
✅ Concrete "do this now" steps provided
✅ User progresses from panic to calm
✅ Every sentence analyzed with rationales
✅ Ready for immediate LoRA training use

## Begin Generation

Generate the complete {{target_turn_count}}-turn conversation now, demonstrating expert crisis triage and stabilization that moves client from panic to calm action.`,

  structure: "Turn 1: Express emergency + panic → Turn 2: Acknowledge + triage + immediate steps → Turn 3: Stabilization + short-term plan → Turn 4 (optional): Calm + confidence to act",

  variables: {
    required: [
      "persona_name", "persona_archetype", "persona_demographics",
      "persona_financial_background", "persona_communication_style",
      "persona_typical_questions", "persona_common_concerns",
      "persona_language_patterns",
      "starting_emotion", "starting_intensity_min", "starting_intensity_max",
      "ending_emotion", "ending_intensity_min", "ending_intensity_max",
      "emotional_arc_name",
      "topic_name", "topic_description", "topic_complexity",
      "topic_crisis_timeline",
      "topic_example_questions", "topic_key_concepts",
      "topic_immediate_actions",
      "typical_turn_count_min", "typical_turn_count_max",
      "target_turn_count"
    ],
    optional: [
      "chunk_context", "document_id"
    ]
  },

  tone: 'calm, directive, focused, stabilizing, reassuring',
  complexity_baseline: 7,

  style_notes: 'Acknowledge urgency immediately. Triage ruthlessly. Separate urgent from important. Provide clear immediate steps. Reality-test timelines. Connect to emergency resources if needed.',

  example_conversation: 'To be added when seed conversation available',

  quality_threshold: 4.5,

  required_elements: [
    'urgency_acknowledgment',
    'immediate_triage',
    'safety_assessment',
    'concrete_next_steps',
    'timeline_reality_check',
    'resource_connection',
    'panic_to_calm_progression'
  ],

  suitable_personas: ['overwhelmed_avoider', 'anxious_planner', 'pragmatic_optimist'],

  suitable_topics: [
    'eviction_notice_received',
    'car_repossession_imminent',
    'medical_bill_collections',
    'utilities_shutoff_notice',
    'paycheck_bounced',
    'fraud_emptied_account',
    'sudden_job_loss_no_savings',
    'tax_levy_bank_account_frozen'
  ],

  methodology_principles: ['judgment_free_space', 'progress_over_perfection', 'money_is_emotional']
};

