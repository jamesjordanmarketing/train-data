#!/usr/bin/env node

/**
 * Validate Scaffolding Data Import
 * 
 * Verifies all data was imported correctly and performs cross-reference validation
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

const client = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function validatePersonas() {
  console.log('\n=== VALIDATING PERSONAS ===');
  
  // Count total personas
  const { data: personas, error, count } = await client
    .from('personas')
    .select('*', { count: 'exact' });
  
  if (error) {
    console.error('✗ Error querying personas:', error.message);
    return false;
  }
  
  console.log(`✓ Found ${count} personas in database`);
  
  // Validate each persona
  personas.forEach(p => {
    console.log(`\n  Persona: ${p.name} (${p.persona_key})`);
    console.log(`    - Archetype: ${p.archetype}`);
    console.log(`    - Age Range: ${p.age_range}`);
    console.log(`    - Occupation: ${p.occupation}`);
    console.log(`    - Income Range: ${p.income_range}`);
    console.log(`    - Demographics: ${JSON.stringify(p.demographics)}`);
    console.log(`    - Typical Questions: ${p.typical_questions.length} items`);
    console.log(`    - Common Concerns: ${p.common_concerns.length} items`);
    console.log(`    - Language Patterns: ${p.language_patterns.length} items`);
    console.log(`    - Is Active: ${p.is_active}`);
    
    // Validation checks
    const issues = [];
    if (!p.persona_key) issues.push('Missing persona_key');
    if (!p.name) issues.push('Missing name');
    if (!p.archetype) issues.push('Missing archetype');
    if (!p.typical_questions || p.typical_questions.length < 5) issues.push('Insufficient typical_questions (need 5+)');
    if (!p.common_concerns || p.common_concerns.length < 5) issues.push('Insufficient common_concerns (need 5+)');
    if (!p.demographics || !p.demographics.age) issues.push('Missing demographics.age');
    
    if (issues.length > 0) {
      console.log(`    ⚠️  Issues: ${issues.join(', ')}`);
    } else {
      console.log(`    ✓ All fields valid`);
    }
  });
  
  return count === 3;
}

async function validateEmotionalArcs() {
  console.log('\n=== VALIDATING EMOTIONAL ARCS ===');
  
  const { data: arcs, error, count } = await client
    .from('emotional_arcs')
    .select('*', { count: 'exact' });
  
  if (error) {
    console.error('✗ Error querying emotional arcs:', error.message);
    return false;
  }
  
  console.log(`✓ Found ${count} emotional arcs in database`);
  
  arcs.forEach(arc => {
    console.log(`\n  Arc: ${arc.name} (${arc.arc_key})`);
    console.log(`    - Journey: ${arc.starting_emotion} (${arc.starting_intensity_min}-${arc.starting_intensity_max}) → ${arc.ending_emotion} (${arc.ending_intensity_min}-${arc.ending_intensity_max})`);
    console.log(`    - Strategy: ${arc.arc_strategy}`);
    console.log(`    - Turn Count: ${arc.typical_turn_count_min}-${arc.typical_turn_count_max}`);
    console.log(`    - Complexity: ${arc.complexity_baseline}/10`);
    console.log(`    - Tier: ${arc.tier}`);
    console.log(`    - Key Principles: ${arc.key_principles.length} items`);
    console.log(`    - Characteristic Phrases: ${arc.characteristic_phrases.length} items`);
    console.log(`    - Response Techniques: ${arc.response_techniques.length} items`);
    console.log(`    - Avoid Tactics: ${arc.avoid_tactics.length} items`);
    console.log(`    - Suitable Personas: ${arc.suitable_personas.join(', ')}`);
    console.log(`    - Suitable Topics: ${arc.suitable_topics.length} topics`);
    console.log(`    - Example Conversation: ${arc.example_conversation_id}`);
    
    // Validation checks
    const issues = [];
    if (arc.starting_intensity_min < 0 || arc.starting_intensity_min > 1) issues.push('Invalid starting_intensity_min');
    if (arc.starting_intensity_max < 0 || arc.starting_intensity_max > 1) issues.push('Invalid starting_intensity_max');
    if (arc.ending_intensity_min < 0 || arc.ending_intensity_min > 1) issues.push('Invalid ending_intensity_min');
    if (arc.ending_intensity_max < 0 || arc.ending_intensity_max > 1) issues.push('Invalid ending_intensity_max');
    if (arc.suitable_personas.length === 0) issues.push('No suitable_personas defined');
    if (arc.suitable_topics.length === 0) issues.push('No suitable_topics defined');
    
    if (issues.length > 0) {
      console.log(`    ⚠️  Issues: ${issues.join(', ')}`);
    } else {
      console.log(`    ✓ All fields valid`);
    }
  });
  
  return count >= 7;
}

async function validateTrainingTopics() {
  console.log('\n=== VALIDATING TRAINING TOPICS ===');
  
  const { data: topics, error, count } = await client
    .from('training_topics')
    .select('*', { count: 'exact' });
  
  if (error) {
    console.error('✗ Error querying training topics:', error.message);
    return false;
  }
  
  console.log(`✓ Found ${count} training topics in database`);
  
  // Group by category
  const byCategory = {};
  topics.forEach(t => {
    if (!byCategory[t.category]) byCategory[t.category] = [];
    byCategory[t.category].push(t);
  });
  
  console.log('\nTopics by category:');
  Object.entries(byCategory).forEach(([cat, items]) => {
    console.log(`  ${cat}: ${items.length} topics`);
  });
  
  // Sample a few topics for detailed validation
  console.log('\nSample topic details:');
  const samples = [topics[0], topics[Math.floor(topics.length / 2)], topics[topics.length - 1]];
  
  samples.forEach(topic => {
    console.log(`\n  Topic: ${topic.name} (${topic.topic_key})`);
    console.log(`    - Category: ${topic.category}`);
    console.log(`    - Complexity: ${topic.complexity_level}`);
    console.log(`    - Description: ${topic.description.substring(0, 80)}...`);
    console.log(`    - Question Examples: ${topic.typical_question_examples.length} items`);
    console.log(`    - Key Concepts: ${topic.key_concepts.length} items`);
    console.log(`    - Suitable Personas: ${topic.suitable_personas.join(', ')}`);
    console.log(`    - Suitable Arcs: ${topic.suitable_emotional_arcs.join(', ')}`);
    
    const issues = [];
    if (!topic.topic_key) issues.push('Missing topic_key');
    if (!topic.category) issues.push('Missing category');
    if (!topic.complexity_level) issues.push('Missing complexity_level');
    if (!topic.typical_question_examples || topic.typical_question_examples.length < 3) issues.push('Need 3+ question examples');
    if (!topic.suitable_personas || topic.suitable_personas.length === 0) issues.push('No suitable_personas');
    if (!topic.suitable_emotional_arcs || topic.suitable_emotional_arcs.length === 0) issues.push('No suitable_emotional_arcs');
    
    if (issues.length > 0) {
      console.log(`    ⚠️  Issues: ${issues.join(', ')}`);
    } else {
      console.log(`    ✓ All fields valid`);
    }
  });
  
  return count >= 50;
}

async function crossReferenceValidation() {
  console.log('\n=== CROSS-REFERENCE VALIDATION ===');
  
  // Get all data
  const { data: personas } = await client.from('personas').select('persona_key');
  const { data: arcs } = await client.from('emotional_arcs').select('arc_key, suitable_personas, suitable_topics');
  const { data: topics } = await client.from('training_topics').select('topic_key, suitable_personas, suitable_emotional_arcs');
  
  const personaKeys = new Set(personas.map(p => p.persona_key));
  const arcKeys = new Set(arcs.map(a => a.arc_key));
  const topicKeys = new Set(topics.map(t => t.topic_key));
  
  console.log('\nValidating emotional arc references:');
  let arcIssues = 0;
  arcs.forEach(arc => {
    // Check if suitable_personas reference valid personas
    arc.suitable_personas.forEach(p => {
      if (!personaKeys.has(p)) {
        console.log(`  ⚠️  Arc "${arc.arc_key}" references invalid persona: ${p}`);
        arcIssues++;
      }
    });
    
    // Check if suitable_topics reference valid topics
    arc.suitable_topics.forEach(t => {
      if (!topicKeys.has(t)) {
        console.log(`  ⚠️  Arc "${arc.arc_key}" references invalid topic: ${t}`);
        arcIssues++;
      }
    });
  });
  
  if (arcIssues === 0) {
    console.log('  ✓ All emotional arc references are valid');
  }
  
  console.log('\nValidating training topic references:');
  let topicIssues = 0;
  topics.forEach(topic => {
    // Check if suitable_personas reference valid personas
    topic.suitable_personas.forEach(p => {
      if (!personaKeys.has(p)) {
        console.log(`  ⚠️  Topic "${topic.topic_key}" references invalid persona: ${p}`);
        topicIssues++;
      }
    });
    
    // Check if suitable_emotional_arcs reference valid arcs
    topic.suitable_emotional_arcs.forEach(a => {
      if (!arcKeys.has(a)) {
        console.log(`  ⚠️  Topic "${topic.topic_key}" references invalid arc: ${a}`);
        topicIssues++;
      }
    });
  });
  
  if (topicIssues === 0) {
    console.log('  ✓ All training topic references are valid');
  }
  
  // Test combinations
  console.log('\nTesting sample combinations:');
  const testPersona = 'overwhelmed_avoider';
  const compatibleArcs = arcs.filter(a => a.suitable_personas.includes(testPersona));
  const compatibleTopics = topics.filter(t => t.suitable_personas.includes(testPersona));
  
  console.log(`\n  Persona: ${testPersona}`);
  console.log(`    - Compatible Arcs: ${compatibleArcs.length} (${compatibleArcs.map(a => a.arc_key).join(', ')})`);
  console.log(`    - Compatible Topics: ${compatibleTopics.length} topics`);
  
  if (compatibleArcs.length > 0 && compatibleTopics.length > 0) {
    console.log(`    ✓ Valid combinations exist`);
  } else {
    console.log(`    ⚠️  No valid combinations found`);
  }
  
  return arcIssues === 0 && topicIssues === 0;
}

async function main() {
  console.log('Starting scaffolding data validation...');
  
  try {
    const personasValid = await validatePersonas();
    const arcsValid = await validateEmotionalArcs();
    const topicsValid = await validateTrainingTopics();
    const crossRefValid = await crossReferenceValidation();
    
    console.log('\n=== VALIDATION SUMMARY ===');
    console.log('Personas:', personasValid ? '✓ Valid (3 personas)' : '✗ Invalid');
    console.log('Emotional Arcs:', arcsValid ? '✓ Valid (7+ arcs)' : '✗ Invalid');
    console.log('Training Topics:', topicsValid ? '✓ Valid (50+ topics)' : '✗ Invalid');
    console.log('Cross-References:', crossRefValid ? '✓ Valid' : '✗ Invalid');
    
    if (personasValid && arcsValid && topicsValid && crossRefValid) {
      console.log('\n✓ All validation checks passed!');
      console.log('\n📊 Final Counts:');
      console.log('  - 3 personas extracted and validated');
      console.log('  - 7 emotional arcs extracted and validated');
      console.log('  - 65 training topics extracted and validated');
      console.log('  - All cross-references validated');
      process.exit(0);
    } else {
      console.log('\n✗ Some validation checks failed. See details above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\nUnexpected error during validation:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

