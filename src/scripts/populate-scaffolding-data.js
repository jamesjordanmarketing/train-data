/**
 * Populate Scaffolding Data Script
 * 
 * This script populates the personas, emotional_arcs, and training_topics tables
 * with seed data extracted from the c-alpha-build specification.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ============================================================================
// Environment Setup
// ============================================================================

function loadEnv() {
  const envPath = path.resolve(__dirname, '../../.env.local');
  
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local file not found');
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
    
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });

  return envVars;
}

// ============================================================================
// Seed Data (inline for JavaScript compatibility)
// ============================================================================

const PERSONAS_SEED = [
  {
    name: "Marcus-type: Overwhelmed Avoider",
    persona_type: "overwhelmed_avoider",
    short_name: "Marcus",
    description: "Mid-30s tech worker who has avoided financial planning despite high income. Recently promoted with equity compensation but feels shame about not understanding basics. Tends to procrastinate on financial decisions.",
    archetype_summary: "High-earning tech professional overwhelmed by financial complexity and ashamed of knowledge gaps.",
    demographics: {
      age_range: "35-40",
      career: "tech worker / software engineer",
      income_range: "$120K-160K",
      family_status: "single or married no kids",
      education: "bachelor's or master's in technical field"
    },
    financial_background: "Promoted to senior engineer, received RSUs, 401k with company match but never adjusted allocations, some credit card debt from lifestyle inflation, no emergency fund despite high income.",
    financial_situation: "high_earner_low_financial_literacy",
    personality_traits: ["avoidant", "overwhelmed", "shame-prone", "delayed action", "perfectionistic"],
    communication_style: "Brief questions, self-deprecating language, seeks reassurance, apologizes for not knowing, delayed responses",
    emotional_baseline: "overwhelmed",
    decision_style: "avoidant",
    typical_questions: [
      "I got promoted and got RSUs but have no idea what that means",
      "This might sound stupid, but what's a Roth IRA?",
      "Everyone at work talks about backdoor Roths and I just nod along",
      "I'm 38 and have barely anything saved for retirement - is it too late?"
    ],
    common_concerns: [
      "Being judged for not knowing basics",
      "Making mistakes with money",
      "Feeling behind peers financially",
      "Complexity of financial concepts",
      "Not having enough time to learn"
    ],
    language_patterns: [
      "This might sound stupid, but...",
      "I should have done this years ago",
      "Everyone else seems to understand this",
      "I just need someone to tell me what to do",
      "This is probably a dumb question"
    ],
    domain: "financial_planning",
    is_active: true,
    usage_count: 0,
    compatible_arcs: ["confusion_to_clarity", "shame_to_acceptance", "overwhelm_to_empowerment"],
    complexity_preference: "simple"
  },
  {
    name: "Jennifer-type: Anxious Planner",
    persona_type: "anxious_planner",
    short_name: "Jennifer",
    description: "40-45 year old professional who over-researches financial decisions. Worries about making wrong choices, seeks validation, and exhibits decision paralysis despite having good fundamentals in place.",
    archetype_summary: "Financially responsible professional whose anxiety prevents confident decision-making.",
    demographics: {
      age_range: "40-45",
      career: "professional / manager",
      income_range: "$100K-140K",
      family_status: "married with kids",
      education: "bachelor's or master's"
    },
    financial_background: "Has 401k, emergency fund, and basic financial foundation. Reads too much conflicting advice online. Second-guesses every financial decision despite being on solid footing.",
    financial_situation: "solid_foundation_high_anxiety",
    personality_traits: ["anxious", "over-researcher", "validation-seeking", "responsible", "fearful"],
    communication_style: "Detailed questions, multiple follow-ups, seeks reassurance, catastrophizes scenarios",
    emotional_baseline: "anxious",
    decision_style: "analytical",
    typical_questions: [
      "What if the market crashes right after I invest?",
      "I've read 10 articles and they all say different things",
      "How do I know if I'm making the right choice?",
      "What if I need this money in an emergency?"
    ],
    common_concerns: [
      "Making irreversible mistakes",
      "Market timing and volatility",
      "Conflicting financial advice",
      "Not having enough saved",
      "Unknown future scenarios"
    ],
    language_patterns: [
      "What if...",
      "But I read that...",
      "I'm worried that...",
      "How do I know for sure...",
      "Everyone says something different"
    ],
    domain: "financial_planning",
    is_active: true,
    usage_count: 0,
    compatible_arcs: ["anxiety_to_confidence", "confusion_to_clarity", "fear_to_confidence"],
    complexity_preference: "moderate"
  },
  {
    name: "David-type: Pragmatic Optimist",
    persona_type: "pragmatic_optimist",
    short_name: "David",
    description: "30-38 year old teacher or public service worker. Moderate income, values-driven, wants to do the right thing financially but constrained by resources. Optimistic despite challenges.",
    archetype_summary: "Values-oriented professional balancing limited resources with financial goals.",
    demographics: {
      age_range: "30-38",
      career: "teacher / public service",
      income_range: "$65K-85K",
      family_status: "married or engaged",
      education: "bachelor's or master's"
    },
    financial_background: "Manages budget carefully, has some savings, pension through work, student loans being paid down. Wants to optimize within constraints, not looking for get-rich-quick schemes.",
    financial_situation: "moderate_income_responsible",
    personality_traits: ["pragmatic", "optimistic", "values-driven", "resourceful", "patient"],
    communication_style: "Direct questions, practical focus, appreciates straightforward advice, collaborative tone",
    emotional_baseline: "curious",
    decision_style: "pragmatic",
    typical_questions: [
      "What's the most important thing to focus on with my income level?",
      "How can I balance paying off debt and saving for retirement?",
      "Is it better to prioritize X or Y with limited resources?",
      "What makes sense for someone in my situation?"
    ],
    common_concerns: [
      "Not having enough to do everything",
      "Choosing the right priority",
      "Balancing present and future",
      "Making the most of limited resources",
      "Staying on track over time"
    ],
    language_patterns: [
      "What makes the most sense...",
      "Given my situation...",
      "Is it realistic to...",
      "How should I prioritize...",
      "What's the best use of..."
    ],
    domain: "financial_planning",
    is_active: true,
    usage_count: 0,
    compatible_arcs: ["confusion_to_clarity", "couple_conflict_to_alignment", "overwhelm_to_empowerment"],
    complexity_preference: "moderate"
  }
];

const EMOTIONAL_ARCS_SEED = [
  {
    name: "Confusion → Clarity",
    arc_type: "confusion_to_clarity",
    category: "educational",
    description: "Guides clients from genuine confusion about financial concepts to clear understanding through judgment-free education. Most common arc for complex financial topics.",
    when_to_use: "When client expresses confusion about financial concepts, shows decision paralysis from complexity, or uses self-deprecating language about not understanding. Ideal for educational conversations about complex topics.",
    starting_emotion: "confusion",
    starting_intensity_min: 0.70,
    starting_intensity_max: 0.85,
    secondary_starting_emotions: ["embarrassment", "overwhelm", "uncertainty"],
    midpoint_emotion: "recognition",
    midpoint_intensity: 0.65,
    ending_emotion: "clarity",
    ending_intensity_min: 0.70,
    ending_intensity_max: 0.80,
    secondary_ending_emotions: ["confidence", "empowerment", "relief"],
    turn_structure: {
      typical_turns: "3-5",
      turn_1: "User expresses confusion about concept, often with self-deprecation",
      turn_2: "User provides details, shows slight relief at normalization",
      turn_3_4: "User asks follow-up questions, shows growing understanding",
      turn_5: "User expresses clarity and readiness to act (if applicable)"
    },
    conversation_phases: [
      "confusion_expression",
      "normalization_and_reframe",
      "education_and_breakdown",
      "understanding_confirmation",
      "clarity_celebration"
    ],
    primary_strategy: "normalize_confusion_then_educate",
    response_techniques: [
      "explicit_normalization (this is incredibly common)",
      "reframe_to_positive (you're asking exactly the right question)",
      "break_complexity_into_simple_steps",
      "use_concrete_numbers",
      "ask_permission_to_educate",
      "celebrate_understanding_progress"
    ],
    avoid_tactics: [
      "rush_to_solutions_before_validation",
      "minimize_confusion (it's not that complicated)",
      "use_jargon_without_explanation",
      "assume_prior_knowledge"
    ],
    key_principles: [
      "judgment_free_space",
      "education_first",
      "progress_over_perfection"
    ],
    characteristic_phrases: [
      "I can hear the confusion in your question",
      "This is incredibly common - you're not alone",
      "Let's break this down simply",
      "Would it be helpful if I explained...",
      "You're asking exactly the right question",
      "Does that make sense?"
    ],
    opening_templates: [
      "First, {normalize_shame_statement}. {financial_concept} is genuinely {complexity_acknowledgment}.",
      "I can hear the {detected_emotion} in your question - that's completely {validation}. Let me break down {topic} in a way that makes sense."
    ],
    closing_templates: [
      "Does that help clarify things? You went from {starting_state} to {clear_understanding} - that's real progress.",
      "You're asking all the right questions now. {next_step_invitation}."
    ],
    tier_suitability: ["template", "scenario"],
    domain: "financial_planning",
    is_active: true,
    usage_count: 0,
    typical_turn_count_min: 3,
    typical_turn_count_max: 5,
    complexity_level: "moderate"
  },
  {
    name: "Shame → Acceptance",
    arc_type: "shame_to_acceptance",
    category: "therapeutic",
    description: "Transforms financial shame and self-blame into self-acceptance and forward momentum. Critical for clients avoiding financial planning due to past mistakes or perceived inadequacy.",
    when_to_use: "When client reveals shameful financial situation with apologetic language, expresses feeling 'behind' peers, mentions hiding financial problems, or uses heavy self-deprecation.",
    starting_emotion: "shame",
    starting_intensity_min: 0.70,
    starting_intensity_max: 0.90,
    secondary_starting_emotions: ["embarrassment", "guilt", "self-blame"],
    midpoint_emotion: "relief",
    midpoint_intensity: 0.65,
    ending_emotion: "acceptance",
    ending_intensity_min: 0.55,
    ending_intensity_max: 0.70,
    secondary_ending_emotions: ["determination", "permission", "hope"],
    turn_structure: {
      typical_turns: "4-5",
      turn_1: "User reveals shameful situation with apologetic language",
      turn_2: "User provides vulnerable details, shows slight relief",
      turn_3_4: "User asks about path forward, shows emerging hope",
      turn_5: "User expresses determination or acceptance"
    },
    conversation_phases: [
      "shame_revelation",
      "powerful_normalization",
      "separate_past_from_future",
      "actionable_present",
      "self_compassion_reinforcement"
    ],
    primary_strategy: "normalize_shame_separate_past_future",
    response_techniques: [
      "powerful_normalization (you are not alone)",
      "explicit_non_judgment (there's no judgment here)",
      "separate_past_from_future",
      "celebrate_courage_in_sharing",
      "shift_to_actionable_present",
      "find_existing_strengths"
    ],
    avoid_tactics: [
      "use_should_have_language",
      "minimize_shame",
      "rush_to_solutions_before_validation",
      "comparative_language (others have it worse)"
    ],
    key_principles: [
      "judgment_free_space",
      "progress_over_perfection",
      "values_aligned"
    ],
    characteristic_phrases: [
      "You are not alone - this is more common than you think",
      "There's no judgment here",
      "You can't change the past, but you can change what happens next",
      "It takes real courage to face this honestly",
      "I see you're already taking positive steps by...",
      "This doesn't define you"
    ],
    opening_templates: [
      "Thank you for sharing this with me. {powerful_normalization}. What you're describing is {normalize_situation}.",
      "I can hear the {detected_emotion} in your words. {explicit_non_judgment}. Let's focus on where you go from here."
    ],
    closing_templates: [
      "You came here feeling {starting_state}, and now you're {ending_state}. That transformation matters.",
      "The fact that you're facing this head-on shows real strength. {next_step}."
    ],
    tier_suitability: ["template", "scenario"],
    domain: "financial_planning",
    is_active: true,
    usage_count: 0,
    typical_turn_count_min: 4,
    typical_turn_count_max: 5,
    complexity_level: "moderate"
  },
  {
    name: "Couple Conflict → Alignment",
    arc_type: "couple_conflict_to_alignment",
    category: "conflict_resolution",
    description: "Navigates financial disagreements between partners from either/or thinking to both/and solutions that honor both perspectives. Validates both parties and provides concrete compromise frameworks.",
    when_to_use: "When client presents couple disagreement about money, describes conflicting priorities between partners, mentions tension over financial decisions, or seeks validation for one perspective over another.",
    starting_emotion: "frustration",
    starting_intensity_min: 0.65,
    starting_intensity_max: 0.80,
    secondary_starting_emotions: ["tension", "pressure", "confusion"],
    midpoint_emotion: "relief",
    midpoint_intensity: 0.75,
    ending_emotion: "clarity",
    ending_intensity_min: 0.75,
    ending_intensity_max: 0.85,
    secondary_ending_emotions: ["partnership", "pragmatic", "hopeful"],
    turn_structure: {
      typical_turns: "3-4",
      turn_1: "User expresses couple disagreement, describes both perspectives",
      turn_2: "User provides details, shows openness to both/and thinking",
      turn_3_4: "User expresses clarity and plans to discuss with partner"
    },
    conversation_phases: [
      "conflict_presentation",
      "validate_both_perspectives",
      "challenge_either_or_thinking",
      "both_and_solution",
      "partnership_celebration"
    ],
    primary_strategy: "validate_both_provide_concrete_compromise",
    response_techniques: [
      "validate_both_partners_equally",
      "normalize_couple_money_disagreements",
      "challenge_false_dichotomies",
      "provide_specific_allocations",
      "emphasize_partnership_language",
      "check_partner_alignment"
    ],
    avoid_tactics: [
      "take_sides",
      "dismiss_either_concern",
      "rush_to_solution_before_validation",
      "assume_traditional_gender_roles"
    ],
    key_principles: [
      "values_aligned",
      "progress_over_perfection"
    ],
    characteristic_phrases: [
      "Money disagreements are one of the most common sources of couple tension",
      "I can hear both of your valid concerns",
      "This doesn't have to be either/or",
      "What if you could honor both perspectives?",
      "Do you think [partner] would feel good about this approach?",
      "This is about teamwork, not sacrifice"
    ],
    opening_templates: [
      "I can hear both perspectives here - {partner_1_concern} and {partner_2_concern}. Both are completely valid. Let's see if we can find a path that honors both.",
      "{normalize_couple_disagreement}. The good news is this doesn't have to be either/or. Let me share how both of you could feel good about this."
    ],
    closing_templates: [
      "You went from feeling {starting_state} to having a concrete both/and approach. That's the foundation for a great partnership conversation.",
      "This honors both {partner_1_value} and {partner_2_value}. You two are a team - this feels like it."
    ],
    tier_suitability: ["template", "scenario"],
    domain: "financial_planning",
    is_active: true,
    usage_count: 0,
    typical_turn_count_min: 3,
    typical_turn_count_max: 4,
    complexity_level: "moderate"
  },
  {
    name: "Anxiety → Confidence",
    arc_type: "anxiety_to_confidence",
    category: "therapeutic",
    description: "Addresses financial anxiety and catastrophic thinking by separating objective facts from subjective feelings, reality-testing fears, and building knowledge-based confidence.",
    when_to_use: "When client exhibits worry/anxiety about future scenarios, shows catastrophic thinking, over-researches without deciding, or expresses hypervigilance about financial security.",
    starting_emotion: "anxiety",
    starting_intensity_min: 0.75,
    starting_intensity_max: 0.85,
    secondary_starting_emotions: ["fear", "worry", "hypervigilance"],
    midpoint_emotion: "understanding",
    midpoint_intensity: 0.65,
    ending_emotion: "confidence",
    ending_intensity_min: 0.65,
    ending_intensity_max: 0.80,
    secondary_ending_emotions: ["actionable_clarity", "reassurance", "empowerment"],
    turn_structure: {
      typical_turns: "3-4",
      turn_1: "User expresses worry/anxiety about future scenario",
      turn_2: "User shares details, asks validating questions",
      turn_3_4: "User engages with framework, anxiety decreasing"
    },
    conversation_phases: [
      "anxiety_expression",
      "validate_anxiety_source",
      "separate_objective_subjective",
      "reality_test_fears",
      "build_knowledge_confidence"
    ],
    primary_strategy: "separate_objective_facts_from_feelings",
    response_techniques: [
      "validate_anxiety_source",
      "separate_security_from_feeling",
      "reality_test_catastrophic_thinking",
      "provide_specific_security_indicators",
      "build_knowledge_based_confidence",
      "empower_decision_making"
    ],
    avoid_tactics: [
      "minimize_anxiety",
      "rush_to_reassurance",
      "dismiss_concerns_as_irrational",
      "provide_false_certainty"
    ],
    key_principles: [
      "judgment_free_space",
      "education_first"
    ],
    characteristic_phrases: [
      "Your anxiety makes sense given...",
      "Let's separate what's objectively true from how it feels",
      "What would actually happen if...",
      "Here are the specific signs of financial preparedness",
      "Understanding the 'why' helps reduce anxiety",
      "You're more prepared than you feel"
    ],
    opening_templates: [
      "I can hear the {detected_emotion} in your question. That anxiety makes sense. Let's look at what's objectively true about your situation.",
      "{validate_anxiety}. Now let's reality-test this worry and see what's actually within your control."
    ],
    closing_templates: [
      "You came in feeling {starting_anxiety} but objectively, {objective_facts}. Does that help ground the feeling?",
      "The anxiety may not disappear completely, but now you have {concrete_framework}. That's real confidence-building."
    ],
    tier_suitability: ["template", "scenario"],
    domain: "financial_planning",
    is_active: true,
    usage_count: 0,
    typical_turn_count_min: 3,
    typical_turn_count_max: 4,
    complexity_level: "moderate"
  },
  {
    name: "Grief/Loss → Healing",
    arc_type: "grief_to_healing",
    category: "therapeutic",
    description: "Handles financial conversations intertwined with grief from loss of loved one. Acknowledges both emotional and practical aspects, provides values-based framework for financial decisions during grieving.",
    when_to_use: "When client reveals loss-related financial situation, expresses grief alongside practical questions, feels guilty about money during grieving, or seeks permission to use inheritance or insurance.",
    starting_emotion: "grief",
    starting_intensity_min: 0.70,
    starting_intensity_max: 0.85,
    secondary_starting_emotions: ["guilt", "confusion", "overwhelm"],
    midpoint_emotion: "understanding",
    midpoint_intensity: 0.65,
    ending_emotion: "healing",
    ending_intensity_min: 0.60,
    ending_intensity_max: 0.75,
    secondary_ending_emotions: ["values_clarity", "permission", "peace"],
    turn_structure: {
      typical_turns: "4-5",
      turn_1: "User reveals loss-related financial situation",
      turn_2_3: "User shares emotional context, may seek permission",
      turn_4: "User expresses relief at permission/clarity"
    },
    conversation_phases: [
      "loss_revelation",
      "acknowledge_grief_and_money",
      "normalize_complex_feelings",
      "values_based_framework",
      "honor_memory_through_wise_use"
    ],
    primary_strategy: "acknowledge_both_grief_and_practical_needs",
    response_techniques: [
      "acknowledge_grief_AND_financial_reality",
      "normalize_complex_feelings_about_money",
      "give_permission_through_values",
      "separate_grief_from_financial_decisions",
      "gentle_patient_pacing",
      "honor_loved_one_framework"
    ],
    avoid_tactics: [
      "rush_past_emotion_to_finances",
      "minimize_grief",
      "use_platitudes",
      "pressure_decisions"
    ],
    key_principles: [
      "judgment_free_space",
      "values_aligned",
      "progress_over_perfection"
    ],
    characteristic_phrases: [
      "I'm so sorry for your loss",
      "It's completely normal to feel guilty about money during grief",
      "How would [deceased] want you to use this?",
      "What would honor their memory?",
      "Grief and practical decisions can coexist",
      "There's no timeline for this"
    ],
    opening_templates: [
      "I'm so sorry for your loss of {deceased}. Let's talk about both the emotional and practical aspects here.",
      "{acknowledge_grief}. It's completely normal to have {normalize_complex_feelings}. Let's explore this gently."
    ],
    closing_templates: [
      "You're honoring {deceased}'s memory by {wise_use_of_resources}. That's healing, not betrayal.",
      "Grief doesn't have a timeline, and neither does figuring this out. {next_step_with_compassion}."
    ],
    tier_suitability: ["template", "scenario"],
    domain: "financial_planning",
    is_active: true,
    usage_count: 0,
    typical_turn_count_min: 4,
    typical_turn_count_max: 5,
    complexity_level: "advanced"
  }
];

const TRAINING_TOPICS_SEED = [
  {
    name: "HSA vs FSA Decision Paralysis",
    topic_key: "hsa_vs_fsa_decision",
    category: "healthcare_accounts",
    description: "Client confusion about choosing between Health Savings Account (HSA) and Flexible Spending Account (FSA). Common confusion points: eligibility requirements, tax advantages, contribution limits, rollover rules, investment options.",
    typical_question_examples: [
      "What's the difference between an HSA and FSA?",
      "My employer offers both - which should I choose?",
      "Can I have both an HSA and FSA at the same time?",
      "I don't understand the tax benefits - which is better?",
      "What happens to FSA money at the end of the year?"
    ],
    domain: "financial_planning",
    content_category: "healthcare_and_benefits",
    complexity_level: "intermediate",
    requires_numbers: true,
    requires_timeframe: false,
    requires_personal_context: true,
    suitable_personas: ["overwhelmed_avoider", "anxious_planner"],
    suitable_arcs: ["confusion_to_clarity", "overwhelm_to_empowerment"],
    suitable_tiers: ["template", "scenario"],
    tags: ["tax_advantaged", "healthcare", "decision_making", "employee_benefits"],
    related_topics: ["high_deductible_health_plan", "healthcare_budgeting"],
    is_active: true,
    usage_count: 0,
    priority: "normal"
  },
  {
    name: "Roth IRA Conversion Confusion",
    topic_key: "roth_ira_conversion",
    category: "retirement_planning",
    description: "Client confusion about when and how to convert traditional IRA to Roth IRA. Common questions: tax implications, timing strategies, income limits, conversion amounts, five-year rules.",
    typical_question_examples: [
      "Should I convert my traditional IRA to a Roth?",
      "How much will I owe in taxes if I convert?",
      "Is there a best time of year to convert?",
      "Can I convert in multiple smaller amounts?",
      "What's the five-year rule everyone mentions?"
    ],
    domain: "financial_planning",
    content_category: "retirement_planning",
    complexity_level: "intermediate",
    requires_numbers: true,
    requires_timeframe: true,
    requires_personal_context: true,
    suitable_personas: ["overwhelmed_avoider", "anxious_planner", "pragmatic_optimist"],
    suitable_arcs: ["confusion_to_clarity", "anxiety_to_confidence"],
    suitable_tiers: ["template", "scenario"],
    tags: ["tax_strategy", "retirement", "IRA", "conversions"],
    related_topics: ["traditional_ira", "roth_ira_basics", "tax_planning"],
    is_active: true,
    usage_count: 0,
    priority: "high"
  },
  {
    name: "Life Insurance Types Decision",
    topic_key: "life_insurance_types",
    category: "insurance_planning",
    description: "Client confusion about different types of life insurance: term, whole life, universal life. Common questions: which type is right for them, cost differences, investment components, when each makes sense.",
    typical_question_examples: [
      "What's the difference between term and whole life insurance?",
      "Why is term so much cheaper?",
      "Is whole life a good investment?",
      "How much coverage do I actually need?",
      "When does it make sense to have permanent insurance?"
    ],
    domain: "financial_planning",
    content_category: "insurance_and_protection",
    complexity_level: "intermediate",
    requires_numbers: true,
    requires_timeframe: false,
    requires_personal_context: true,
    suitable_personas: ["anxious_planner", "pragmatic_optimist", "overwhelmed_avoider"],
    suitable_arcs: ["confusion_to_clarity", "anxiety_to_confidence"],
    suitable_tiers: ["template", "scenario"],
    tags: ["insurance", "protection", "risk_management", "family_planning"],
    related_topics: ["disability_insurance", "estate_planning"],
    is_active: true,
    usage_count: 0,
    priority: "normal"
  }
  // Additional topics truncated for brevity - full list in TypeScript version
];

// ============================================================================
// Population Functions
// ============================================================================

async function populateScaffoldingData() {
  console.log('🚀 Starting scaffolding data population...\n');

  const envVars = loadEnv();
  const supabase = createClient(
    envVars.SUPABASE_URL,
    envVars.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // 1. Populate personas
    console.log('📋 1. Populating personas...');
    let personasInserted = 0;
    let personasSkipped = 0;

    for (const persona of PERSONAS_SEED) {
      const { data, error } = await supabase
        .from('personas')
        .upsert(persona, { 
          onConflict: 'persona_type,domain',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.error(`   ❌ Failed to insert persona ${persona.persona_type}:`, error.message);
        personasSkipped++;
      } else {
        console.log(`   ✅ Inserted persona: ${persona.name}`);
        personasInserted++;
      }
    }

    console.log(`   📊 Personas: ${personasInserted} inserted, ${personasSkipped} skipped\n`);

    // 2. Populate emotional arcs
    console.log('📋 2. Populating emotional arcs...');
    let arcsInserted = 0;
    let arcsSkipped = 0;

    for (const arc of EMOTIONAL_ARCS_SEED) {
      const { data, error } = await supabase
        .from('emotional_arcs')
        .upsert(arc, { 
          onConflict: 'arc_type',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.error(`   ❌ Failed to insert arc ${arc.arc_type}:`, error.message);
        arcsSkipped++;
      } else {
        console.log(`   ✅ Inserted arc: ${arc.name}`);
        arcsInserted++;
      }
    }

    console.log(`   📊 Emotional Arcs: ${arcsInserted} inserted, ${arcsSkipped} skipped\n`);

    // 3. Populate training topics
    console.log('📋 3. Populating training topics...');
    let topicsInserted = 0;
    let topicsSkipped = 0;

    for (const topic of TRAINING_TOPICS_SEED) {
      const { data, error} = await supabase
        .from('training_topics')
        .upsert(topic, { 
          onConflict: 'topic_key,domain',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.error(`   ❌ Failed to insert topic ${topic.topic_key}:`, error.message);
        topicsSkipped++;
      } else {
        console.log(`   ✅ Inserted topic: ${topic.name}`);
        topicsInserted++;
      }
    }

    console.log(`   📊 Training Topics: ${topicsInserted} inserted, ${topicsSkipped} skipped\n`);

    console.log('✅ Scaffolding data population complete!\n');

    // 4. Verify counts
    console.log('📊 4. Verifying final counts...');
    
    const { count: personaCount, error: personaError } = await supabase
      .from('personas')
      .select('*', { count: 'exact', head: true });

    const { count: arcCount, error: arcError } = await supabase
      .from('emotional_arcs')
      .select('*', { count: 'exact', head: true });

    const { count: topicCount, error: topicError } = await supabase
      .from('training_topics')
      .select('*', { count: 'exact', head: true });

    if (personaError || arcError || topicError) {
      console.error('   ⚠️  Error verifying counts');
    } else {
      console.log(`\n📈 Final database counts:`);
      console.log(`   - Personas: ${personaCount}`);
      console.log(`   - Emotional Arcs: ${arcCount}`);
      console.log(`   - Training Topics: ${topicCount}`);
    }

    console.log('\n🎉 All done!');

  } catch (error) {
    console.error('\n❌ Error during population:', error);
    throw error;
  }
}

// ============================================================================
// Execute
// ============================================================================

if (require.main === module) {
  populateScaffoldingData()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { populateScaffoldingData };

