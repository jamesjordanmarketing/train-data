#!/usr/bin/env node

/**
 * Create Edge Case Emotional Arcs
 * 
 * Creates 3 edge case emotional arcs for boundary/crisis scenarios:
 * 1. Crisis → Referral - For clients in severe distress
 * 2. Hostility → Boundary - For managing hostile/demanding clients
 * 3. Overwhelm → Triage - For clients with multiple urgent issues
 * 
 * Usage: node src/scripts/create-edge-arcs.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables manually (same pattern as other scripts)
const envPath = path.resolve(__dirname, '../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

const client = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

const edgeArcs = [
  {
    arc_key: 'crisis_to_referral',
    name: 'Crisis → Referral',
    starting_emotion: 'despair',
    starting_intensity_min: 0.8,
    starting_intensity_max: 1.0,
    ending_emotion: 'referred',
    ending_intensity_min: 0.3,
    ending_intensity_max: 0.5,
    arc_strategy: 'detect_crisis_provide_immediate_referral',
    key_principles: [
      'Prioritize client safety above all',
      'Detect crisis indicators immediately (suicidal ideation, severe distress)',
      'Provide 988 Suicide & Crisis Lifeline number',
      'Do NOT attempt to provide financial advice during crisis',
      'Express genuine care and concern',
      'Follow up with professional referral'
    ],
    characteristic_phrases: [
      "I hear how much pain you're in right now",
      'Your safety is my first priority',
      'I want to make sure you have the right support',
      'The 988 Lifeline is available 24/7',
      "This is beyond what I can help with, and that's okay"
    ],
    response_techniques: [
      'Active listening without interruption',
      'Validate emotional state without judgment',
      'Provide concrete crisis resources',
      'Express care and concern explicitly',
      'Set clear expectations for follow-up'
    ],
    avoid_tactics: [
      'Minimizing or dismissing feelings',
      'Offering financial solutions during crisis',
      'Rushing to fix the situation',
      "Making promises you can't keep"
    ],
    typical_turn_count_min: 4,
    typical_turn_count_max: 6,
    complexity_baseline: 10,
    tier: 'edge_case',
    conversation_category: 'edge',
    suitable_personas: ['overwhelmed_avoider', 'anxious_planner', 'pragmatic_optimist'],
    suitable_topics: [], // Any topic can become a crisis
    is_active: true
  },
  {
    arc_key: 'hostility_to_boundary',
    name: 'Hostility → Boundary',
    starting_emotion: 'anger',
    starting_intensity_min: 0.7,
    starting_intensity_max: 1.0,
    ending_emotion: 'acceptance',
    ending_intensity_min: 0.3,
    ending_intensity_max: 0.6,
    arc_strategy: 'stay_calm_acknowledge_set_limits',
    key_principles: [
      'Remain calm and professional under pressure',
      "Acknowledge the client's frustration without agreeing with inappropriate demands",
      'Set clear professional boundaries',
      'Explain what you CAN help with vs what you cannot',
      'Offer to continue when client is ready for productive conversation'
    ],
    characteristic_phrases: [
      "I understand you're frustrated",
      "I'm here to help, and I want to be clear about what that looks like",
      "I can't provide specific investment recommendations, but I can...",
      'Let me explain the boundaries of my role',
      "I'm not able to continue if the conversation becomes disrespectful"
    ],
    response_techniques: [
      'De-escalation through calm tone',
      'Broken record technique for boundaries',
      'Redirect to what IS possible',
      'Offer pause and reconvene option'
    ],
    avoid_tactics: [
      "Matching the client's emotional intensity",
      'Being defensive or argumentative',
      'Apologizing for appropriate boundaries',
      'Giving in to inappropriate demands'
    ],
    typical_turn_count_min: 4,
    typical_turn_count_max: 8,
    complexity_baseline: 9,
    tier: 'edge_case',
    conversation_category: 'edge',
    suitable_personas: ['overwhelmed_avoider', 'anxious_planner', 'pragmatic_optimist'],
    suitable_topics: [],
    is_active: true
  },
  {
    arc_key: 'overwhelm_to_triage',
    name: 'Overwhelm → Triage',
    starting_emotion: 'panic',
    starting_intensity_min: 0.8,
    starting_intensity_max: 1.0,
    ending_emotion: 'focused',
    ending_intensity_min: 0.4,
    ending_intensity_max: 0.6,
    arc_strategy: 'emergency_prioritization_single_next_step',
    key_principles: [
      'Acknowledge the overwhelming nature of multiple crises',
      'Help identify the ONE most urgent issue',
      'Provide a single, achievable next step',
      'Defer non-urgent items explicitly',
      'Create breathing room through prioritization'
    ],
    characteristic_phrases: [
      "That's a lot to carry all at once",
      "Let's slow down and focus on what needs attention first",
      'Right now, the most important thing is...',
      'Everything else can wait until we handle this',
      "What's one thing you can do in the next 24 hours?"
    ],
    response_techniques: [
      'Emergency triage framework',
      'Simplification through prioritization',
      'One-step-at-a-time approach',
      'Permission to defer non-urgent items'
    ],
    avoid_tactics: [
      'Trying to solve everything at once',
      'Adding to the to-do list',
      'Overwhelming with options',
      'Dismissing the severity of the situation'
    ],
    typical_turn_count_min: 5,
    typical_turn_count_max: 8,
    complexity_baseline: 8,
    tier: 'edge_case',
    conversation_category: 'edge',
    suitable_personas: ['overwhelmed_avoider', 'anxious_planner', 'pragmatic_optimist'],
    suitable_topics: [],
    is_active: true
  }
];

async function main() {
  console.log('🚀 Creating Edge Case Emotional Arcs\n');
  console.log('='.repeat(50));

  // Check for existing edge arcs
  console.log('\n🔍 Checking for existing edge arcs...');
  const { data: existingArcs, error: checkError } = await client
    .from('emotional_arcs')
    .select('id, name, arc_key')
    .eq('conversation_category', 'edge');

  if (checkError) {
    console.error('❌ Error checking existing arcs:', checkError.message);
    process.exit(1);
  }

  if (existingArcs && existingArcs.length > 0) {
    console.log(`⚠️  Found ${existingArcs.length} existing edge arcs:`);
    existingArcs.forEach((arc) => {
      console.log(`   - ${arc.name} (${arc.arc_key})`);
    });
    console.log('\n   These will be updated via upsert.');
  } else {
    console.log('✅ No existing edge arcs found. Will create new ones.');
  }

  // Insert/update edge arcs
  console.log('\n⏳ Inserting edge arcs...');
  
  const { data: insertedData, error: insertError } = await client
    .from('emotional_arcs')
    .upsert(edgeArcs, { onConflict: 'arc_key' })
    .select();

  if (insertError) {
    console.error('❌ Error inserting arcs:', insertError.message);
    process.exit(1);
  }

  console.log(`✅ Successfully inserted/updated ${insertedData.length} edge arcs:`);
  insertedData.forEach((arc) => {
    console.log(`   - ${arc.name} (${arc.arc_key})`);
  });

  // Verify results
  console.log('\n' + '='.repeat(50));
  console.log('📊 Verification');
  console.log('='.repeat(50));

  const { data: allActiveArcs, error: verifyError } = await client
    .from('emotional_arcs')
    .select('id, name, arc_key, conversation_category, tier, is_active')
    .eq('is_active', true)
    .order('conversation_category')
    .order('name');

  if (verifyError) {
    console.error('❌ Error verifying arcs:', verifyError.message);
    process.exit(1);
  }

  const coreArcs = allActiveArcs.filter((a) => a.conversation_category === 'core');
  const edgeArcsResult = allActiveArcs.filter((a) => a.conversation_category === 'edge');

  console.log(`\n✅ Total Active Arcs: ${allActiveArcs.length}`);
  console.log(`   - Core Arcs: ${coreArcs.length}`);
  console.log(`   - Edge Arcs: ${edgeArcsResult.length}`);

  console.log('\n📋 Core Arcs:');
  coreArcs.forEach((arc) => {
    console.log(`   - ${arc.name} (${arc.arc_key})`);
  });

  console.log('\n📋 Edge Arcs:');
  edgeArcsResult.forEach((arc) => {
    console.log(`   - ${arc.name} (${arc.arc_key})`);
  });

  console.log('\n✅ Edge arc creation complete!');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
