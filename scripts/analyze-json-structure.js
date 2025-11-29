/**
 * Analysis Script: Compare Expected vs Actual JSON Structure
 * 
 * This script analyzes the generated JSON files and compares them against
 * the expected structure from iteration-2-json-updated_v1.md
 */

require('../load-env.js');
const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('JSON STRUCTURE ANALYSIS');
console.log('='.repeat(80));
console.log('');

// Read the raw CSV
const rawCsvPath = path.join(
  process.cwd(),
  'pmc',
  '_archive',
  'batch-json-raw-test_v1.csv'
);

// Read the enriched CSV
const enrichedCsvPath = path.join(
  process.cwd(),
  'pmc',
  '_archive',
  'batch-json-enriched-test_v1.csv'
);

console.log('STEP 1: ANALYZING RAW JSON');
console.log('-'.repeat(80));

try {
  const rawContent = fs.readFileSync(rawCsvPath, 'utf8');
  console.log(`✓ Raw CSV loaded (${rawContent.length} bytes)`);
  
  // Parse JSON from CSV (it's actually just a JSON file)
  const rawJson = JSON.parse(rawContent);
  
  console.log('\n📋 Raw JSON Structure:');
  console.log(`   Has conversation_metadata: ${!!rawJson.conversation_metadata}`);
  console.log(`   Has input_parameters: ${!!rawJson.input_parameters}`);
  console.log(`   Number of turns: ${rawJson.turns ? rawJson.turns.length : 0}`);
  
  if (rawJson.conversation_metadata) {
    console.log('\n📋 conversation_metadata fields:');
    console.log(`   ${Object.keys(rawJson.conversation_metadata).join(', ')}`);
  }
  
  if (rawJson.input_parameters) {
    console.log('\n📋 input_parameters fields:');
    console.log(`   ${Object.keys(rawJson.input_parameters).join(', ')}`);
    console.log('\n📋 input_parameters values:');
    console.log(JSON.stringify(rawJson.input_parameters, null, 2));
  } else {
    console.log('\n⚠️  NO input_parameters in raw JSON!');
  }
  
  if (rawJson.turns && rawJson.turns.length > 0) {
    console.log('\n📋 First turn structure:');
    console.log(`   Fields: ${Object.keys(rawJson.turns[0]).join(', ')}`);
  }
  
} catch (error) {
  console.error('❌ Error reading raw CSV:', error.message);
}

console.log('\n\nSTEP 2: ANALYZING ENRICHED JSON');
console.log('-'.repeat(80));

try {
  const enrichedContent = fs.readFileSync(enrichedCsvPath, 'utf8');
  console.log(`✓ Enriched CSV loaded (${enrichedContent.length} bytes)`);
  
  // Parse JSON from CSV
  const enrichedJson = JSON.parse(enrichedContent);
  
  console.log('\n📋 Enriched JSON Structure:');
  console.log(`   Has dataset_metadata: ${!!enrichedJson.dataset_metadata}`);
  console.log(`   Has consultant_profile: ${!!enrichedJson.consultant_profile}`);
  console.log(`   Has input_parameters: ${!!enrichedJson.input_parameters}`);
  console.log(`   Number of training_pairs: ${enrichedJson.training_pairs ? enrichedJson.training_pairs.length : 0}`);
  
  if (enrichedJson.input_parameters) {
    console.log('\n📋 input_parameters in enriched JSON:');
    console.log(JSON.stringify(enrichedJson.input_parameters, null, 2));
  } else {
    console.log('\n⚠️  NO input_parameters in enriched JSON!');
  }
  
  if (enrichedJson.training_pairs && enrichedJson.training_pairs.length > 0) {
    const firstPair = enrichedJson.training_pairs[0];
    console.log('\n📋 First training_pair structure:');
    console.log(`   Top-level fields: ${Object.keys(firstPair).join(', ')}`);
    
    if (firstPair.conversation_metadata) {
      console.log('\n📋 conversation_metadata in training_pair:');
      const metadata = firstPair.conversation_metadata;
      console.log(`   Fields: ${Object.keys(metadata).join(', ')}`);
      
      // Check for the 5 new fields from iteration 2
      const expectedNewFields = [
        'persona_archetype',
        'emotional_arc',
        'emotional_arc_key',
        'training_topic',
        'training_topic_key'
      ];
      
      console.log('\n🔍 Checking for iteration-2 enhancements:');
      for (const field of expectedNewFields) {
        const exists = metadata.hasOwnProperty(field);
        const value = metadata[field];
        const status = exists && value ? '✅' : (exists ? '⚠️ ' : '❌');
        console.log(`   ${status} ${field}: ${exists ? (value || 'null/empty') : 'MISSING'}`);
      }
      
      // Show the actual metadata
      console.log('\n📋 Actual conversation_metadata content:');
      console.log(JSON.stringify(metadata, null, 2));
    }
  }
  
} catch (error) {
  console.error('❌ Error reading enriched CSV:', error.message);
}

console.log('\n\nSTEP 3: EXPECTED vs ACTUAL COMPARISON');
console.log('-'.repeat(80));

console.log('\n📋 Expected Structure (from iteration-2-json-updated_v1.md):');
console.log(`
File-level input_parameters should have:
- persona_id (UUID)
- persona_name
- persona_key
- persona_archetype
- emotional_arc_id (UUID)
- emotional_arc_name
- emotional_arc_key
- training_topic_id (UUID)
- training_topic_name
- training_topic_key

Each training_pair.conversation_metadata should have:
- client_persona
- persona_archetype (NEW)
- client_background
- emotional_arc (NEW)
- emotional_arc_key (NEW)
- training_topic (NEW)
- training_topic_key (NEW)
- session_context
- conversation_phase
- expected_outcome
`);

console.log('\n' + '='.repeat(80));
console.log('ANALYSIS COMPLETE');
console.log('='.repeat(80));

