const fs = require('fs');
const path = require('path');

// Extract personas from seed conversations
function extractPersonasFromSeeds() {
  const personas = [];

  // Define 3 core personas from seed data
  personas.push({
    persona_key: 'overwhelmed_avoider',
    name: 'Marcus Chen',
    archetype: 'The Overwhelmed Avoider',
    age_range: '35-40',
    occupation: 'Tech Worker / Software Engineer',
    income_range: '$120,000-$160,000',
    demographics: {
      age: 37,
      gender: 'male',
      family_status: 'single or married without kids',
      location: 'Urban/Suburban'
    },
    financial_background: 'High earner with complex compensation (RSUs, stock options). Good income but feels paralyzed by complexity. Often avoids financial decisions due to overwhelm. Has resources but lacks financial confidence.',
    financial_situation: 'Solid income from tech job with equity compensation. 401k exists but not optimized. Emergency fund present but inconsistent. Tends to default to cash/safe options due to analysis paralysis.',
    communication_style: 'Apologetic and self-deprecating. Frequently says "I know I should know this" or "This might be a stupid question." Detailed explainer when sharing situation. Shows relief when complexity is normalized.',
    emotional_baseline: 'Anxious despite income; shame about financial knowledge; relief-seeking',
    typical_questions: [
      'RSU tax implications and timing strategies',
      'How to prioritize between multiple financial goals',
      'Whether current savings rate is "enough"',
      'Complex financial product comparisons (HSA vs FSA, Roth vs Traditional)',
      'Investment options for non-retirement money'
    ],
    common_concerns: [
      'Making the "wrong" choice and regretting it',
      'Not maximizing tax advantages due to ignorance',
      'Being judged for not knowing "basic" things',
      'Having money but not feeling financially secure',
      'Comparison to peers who "seem to have it figured out"'
    ],
    language_patterns: [
      'Uses disclaimers: "I know this might sound stupid..."',
      'Self-deprecating humor about financial ignorance',
      'Provides extensive context before asking question',
      'Expresses relief when confusion is normalized',
      'Says "I should probably know this by now"'
    ],
    is_active: true
  });

  personas.push({
    persona_key: 'anxious_planner',
    name: 'Jennifer Martinez',
    archetype: 'The Anxious Planner',
    age_range: '40-45',
    occupation: 'Professional / Manager',
    income_range: '$100,000-$140,000',
    demographics: {
      age: 42,
      gender: 'female',
      family_status: 'married with children',
      location: 'Suburban'
    },
    financial_background: 'Financially organized but anxiety-driven. Tracks every dollar. Worries constantly about future scenarios. Over-researches decisions. Has plans but second-guesses them. High need for reassurance.',
    financial_situation: 'Solid retirement savings, emergency fund in place, insurance coverage adequate. Financially "on track" but doesn\'t feel secure. Worries about market volatility, job security, healthcare costs, college funding.',
    communication_style: 'Precise and detailed. Asks many "what if" questions. Seeks validation that choices are correct. Expresses worry explicitly. Shows vulnerability about anxiety. Grateful for reassurance.',
    emotional_baseline: 'High anxiety; hypervigilant about risks; needs reassurance and concrete indicators',
    typical_questions: [
      'Is my current plan enough for retirement?',
      'What happens if [catastrophic scenario] occurs?',
      'How do I protect against market crashes?',
      'Should I change strategy based on recent news?',
      'Am I making a mistake by [current choice]?'
    ],
    common_concerns: [
      'Running out of money in retirement',
      'Market crash destroying savings',
      'Job loss and inability to recover',
      'Unexpected medical costs',
      'Not providing adequately for children\'s future'
    ],
    language_patterns: [
      'Asks "what if" questions repeatedly',
      'Expresses worry explicitly: "I\'m really anxious about..."',
      'Seeks validation: "Does this seem reasonable?"',
      'Provides detailed contingency thinking',
      'Shows gratitude for reassurance: "That really helps"'
    ],
    is_active: true
  });

  personas.push({
    persona_key: 'pragmatic_optimist',
    name: 'David Chen',
    archetype: 'The Pragmatic Optimist',
    age_range: '30-38',
    occupation: 'Teacher / Public Service',
    income_range: '$65,000-$85,000',
    demographics: {
      age: 35,
      gender: 'male',
      family_status: 'married or partnership',
      location: 'Urban/Suburban'
    },
    financial_background: 'Modest but stable income. Values-driven financial decisions. Optimistic about future but practical about present constraints. Willing to make tradeoffs. Focused on meaningful goals over maximum optimization.',
    financial_situation: 'Moderate income with pension. Some retirement savings started. Budget-conscious but not deprived. Makes thoughtful choices within constraints. Prioritizes values over pure financial optimization.',
    communication_style: 'Direct and practical. Asks specific questions. Values clarity and actionable guidance. Appreciates context but wants bottom-line answers. Expresses values explicitly in financial decisions.',
    emotional_baseline: 'Optimistic but realistic; values-motivated; seeks practical third-way solutions',
    typical_questions: [
      'How to balance [value A] with [value B]?',
      'What\'s the pragmatic approach to [situation]?',
      'Can I afford to [values-based choice] without sacrificing [security]?',
      'What are realistic expectations for [goal]?',
      'How do other people in my situation handle [tradeoff]?'
    ],
    common_concerns: [
      'Balancing present quality of life with future security',
      'Making values-aligned choices without financial guilt',
      'Competing priorities (wedding debt vs house, career change vs stability)',
      'Modest income limiting options',
      'External pressure to make "standard" choices'
    ],
    language_patterns: [
      'Frames questions around values and priorities',
      'Direct communication style',
      'Asks "what\'s realistic?" or "what do most people do?"',
      'Expresses both desires clearly in tradeoff scenarios',
      'Shows appreciation for practical guidance'
    ],
    is_active: true
  });

  return personas;
}

// Main execution
async function main() {
  const personas = extractPersonasFromSeeds();

  // Save to JSON file for import
  const outputPath = path.join(__dirname, '../../data/personas-seed.ndjson');
  const ndjsonContent = personas.map(p => JSON.stringify(p)).join('\n');
  fs.writeFileSync(outputPath, ndjsonContent, 'utf-8');

  console.log(`✓ Extracted ${personas.length} personas to ${outputPath}`);
  console.log('Personas:', personas.map(p => `${p.name} (${p.persona_key})`).join(', '));
}

main().catch(console.error);

