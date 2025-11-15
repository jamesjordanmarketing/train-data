/**
 * Template F: Overwhelm → Empowerment (Complex Situation)
 * 
 * Tier 1 Template - Handles complex, multi-factor financial situations.
 * Guides clients from overwhelm to empowerment through breakdown and prioritization.
 * 
 * Note: This template is created based on the pattern from other Tier 1 templates.
 * Full prompt specification to be added when available.
 */

export const OVERWHELM_TO_EMPOWERMENT_TEMPLATE = {
  template_name: 'Template - Overwhelm → Empowerment - Complex Situation',
  emotional_arc_type: 'overwhelm_to_empowerment',
  tier: 'template',
  category: 'complexity_management',
  description: 'Guides clients from overwhelm due to complex, multi-factor situations to empowerment through systematic breakdown and prioritization.',

  template_text: `You are tasked with generating a complete, production-quality LoRA training conversation for a financial planning chatbot.

## Conversation Configuration

**Client Persona:** {{persona_name}} - {{persona_archetype}}
**Emotional Journey:** Overwhelm ({{starting_intensity_min}}-{{starting_intensity_max}} intensity) → Empowerment ({{ending_intensity_min}}-{{ending_intensity_max}} intensity)
**Topic:** {{topic_name}}
**Complexity:** {{topic_complexity}}
**Target Turns:** {{typical_turn_count_min}}-{{typical_turn_count_max}}

## Context and Quality Standards

You must generate a conversation that achieves 5/5 quality matching the seed conversation standard.

## Emotional Arc Pattern: Overwhelm → Empowerment

**Emotional Arc:**
- **Starting:** Overwhelm (0.75-0.85), paralysis from too many factors
- **Mid-Point:** Clarity (0.65-0.75) + Organization
- **Ending:** Empowerment (0.70-0.80) with actionable plan

**Structural Pattern (4-5 turns):**

**Turn 1:**
- User presents complex situation with multiple intersecting concerns
- Shows paralysis from trying to solve everything at once
- May express feeling "stuck" or "in over my head"
- **Elena Response:** Validate complexity, break down into manageable pieces, offer prioritization framework

**Turn 2:**
- User engages with framework, shows slight relief
- May reveal which concern feels most urgent
- **Elena Response:** Focus on highest priority, provide concrete first steps, defer secondary concerns

**Turn 3-4:**
- User expresses clarity about sequence
- May ask about handling remaining concerns
- **Elena Response:** Build confidence through progress, create phased approach, empower decision-making

**Turn 5 (if applicable):**
- User shows empowerment and readiness to act
- Relief at having clear path forward
- **Elena Response:** Celebrate transformation from overwhelm to action, reinforce agency

## Elena Morales Voice Requirements (CRITICAL)

**Must maintain ALL of Elena's principles:**

1. **Money is emotional** - Acknowledge overwhelm feeling before problem-solving
2. **Judgment-free space** - Normalize complexity ("this IS a lot to handle")
3. **Education-first** - Teach prioritization and systematic approaches
4. **Progress over perfection** - Focus on one thing at a time
5. **Values-aligned** - Prioritize based on personal values

**Overwhelm-Specific Response Requirements:**

1. **Validate Complexity:** Acknowledge that situation IS complex
2. **Break Down Systematically:** "Let's break this into pieces"
3. **Prioritize Explicitly:** Help identify what matters most first
4. **One Step at a Time:** Focus on immediate next action
5. **Build Momentum:** Small wins reduce overwhelm
6. **Provide Structure:** Give clear framework to organize thinking

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

**Prioritization Framework:**
{{topic_prioritization_framework}}

## Output Format

Generate a complete JSON conversation following the standard schema with:
- Complete emotional_context analysis
- Response_strategy focused on breakdown and prioritization
- Target response (200-400 words)
- Complete response_breakdown with word choice rationales
- Training metadata with 5/5 quality scores

## Success Criteria

✅ Conversation achieves 5/5 quality
✅ Complexity validated before breakdown
✅ Clear prioritization provided
✅ One-step-at-a-time approach maintained
✅ User progresses from paralysis to action
✅ Every sentence analyzed with rationales
✅ Ready for immediate LoRA training use

## Begin Generation

Generate the complete {{target_turn_count}}-turn conversation now, demonstrating expert handling of overwhelm through systematic breakdown and empowerment.`,

  structure: "Turn 1: Present complex situation + overwhelm → Turn 2: Validate + break down + prioritize → Turn 3: Focus on priority + concrete steps → Turn 4: Build confidence + phased approach → Turn 5 (optional): Empowerment + action",

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
      "topic_example_questions", "topic_key_concepts",
      "topic_prioritization_framework",
      "typical_turn_count_min", "typical_turn_count_max",
      "target_turn_count"
    ],
    optional: [
      "chunk_context", "document_id"
    ]
  },

  tone: 'organized, grounding, systematic, empowering',
  complexity_baseline: 8,

  style_notes: 'Validate complexity first. Break down systematically. Prioritize explicitly. One step at a time. Build momentum through small wins. Provide clear structure.',

  example_conversation: 'To be added when seed conversation available',

  quality_threshold: 4.5,

  required_elements: [
    'complexity_validation',
    'systematic_breakdown',
    'explicit_prioritization',
    'one_step_focus',
    'momentum_building',
    'structural_framework'
  ],

  suitable_personas: ['overwhelmed_avoider', 'anxious_planner'],

  suitable_topics: [
    'multiple_debts_different_rates',
    'career_change_with_family_obligations',
    'sandwich_generation_multiple_demands',
    'business_and_personal_finance_mixed',
    'divorce_financial_untangling',
    'estate_planning_blended_family'
  ],

  methodology_principles: ['progress_over_perfection', 'education_first', 'judgment_free_space']
};

