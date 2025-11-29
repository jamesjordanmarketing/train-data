/**
 * Integration test for enrichment pipeline
 * Verifies end-to-end that input_parameters flows through to enriched JSON
 */

require('../load-env.js');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runTest() {
  console.log('=== ENRICHMENT PIPELINE INTEGRATION TEST ===\n');
  
  // Find a conversation with both file_path and enriched_file_path
  const { data: conv, error } = await supabase
    .from('conversations')
    .select('conversation_id, file_path, enriched_file_path, persona_id')
    .not('file_path', 'is', null)
    .not('enriched_file_path', 'is', null)
    .limit(1)
    .single();

  if (error || !conv) {
    console.error('❌ No suitable conversation found for testing');
    console.error('Error:', error?.message);
    return;
  }

  console.log(`Testing conversation: ${conv.conversation_id}`);
  console.log(`  file_path: ${conv.file_path}`);
  console.log(`  enriched_file_path: ${conv.enriched_file_path}`);
  
  // Download parsed JSON
  const { data: parsedFile, error: parsedError } = await supabase.storage
    .from('conversation-files')
    .download(conv.file_path);
  
  if (parsedError) {
    console.error('❌ Failed to download parsed JSON:', parsedError.message);
    return;
  }
  
  const parsedJson = JSON.parse(await parsedFile.text());
  
  // Download enriched JSON
  const { data: enrichedFile, error: enrichedError } = await supabase.storage
    .from('conversation-files')
    .download(conv.enriched_file_path);
  
  if (enrichedError) {
    console.error('❌ Failed to download enriched JSON:', enrichedError.message);
    return;
  }
  
  const enrichedJson = JSON.parse(await enrichedFile.text());
  
  // Test 1: Parsed JSON has input_parameters
  console.log('\n--- Test 1: Parsed JSON has input_parameters ---');
  const hasInputParams = !!parsedJson.input_parameters;
  console.log(`  Result: ${hasInputParams ? '✅ PASS' : '❌ FAIL'}`);
  if (hasInputParams) {
    console.log(`  Fields: ${Object.keys(parsedJson.input_parameters).join(', ')}`);
  }
  
  // Test 2: Enriched JSON has input_parameters
  console.log('\n--- Test 2: Enriched JSON has input_parameters ---');
  const enrichedHasInputParams = !!enrichedJson.input_parameters;
  console.log(`  Result: ${enrichedHasInputParams ? '✅ PASS' : '❌ FAIL'}`);
  if (enrichedHasInputParams) {
    console.log(`  Fields: ${Object.keys(enrichedJson.input_parameters).join(', ')}`);
  }
  
  // Test 3: Training pairs have scaffolding metadata
  console.log('\n--- Test 3: Training pairs have scaffolding metadata ---');
  const firstPair = enrichedJson.training_pairs?.[0];
  if (!firstPair) {
    console.log('  Result: ❌ FAIL - No training pairs found');
  } else {
    const metadata = firstPair.conversation_metadata;
    const hasPersonaArchetype = !!metadata?.persona_archetype;
    const hasEmotionalArc = !!metadata?.emotional_arc;
    const hasEmotionalArcKey = !!metadata?.emotional_arc_key;
    const hasTrainingTopic = !!metadata?.training_topic;
    const hasTrainingTopicKey = !!metadata?.training_topic_key;
    
    console.log(`  persona_archetype: ${metadata?.persona_archetype || 'MISSING'} ${hasPersonaArchetype ? '✅' : '❌'}`);
    console.log(`  emotional_arc: ${metadata?.emotional_arc || 'MISSING'} ${hasEmotionalArc ? '✅' : '❌'}`);
    console.log(`  emotional_arc_key: ${metadata?.emotional_arc_key || 'MISSING'} ${hasEmotionalArcKey ? '✅' : '❌'}`);
    console.log(`  training_topic: ${metadata?.training_topic || 'MISSING'} ${hasTrainingTopic ? '✅' : '❌'}`);
    console.log(`  training_topic_key: ${metadata?.training_topic_key || 'MISSING'} ${hasTrainingTopicKey ? '✅' : '❌'}`);
    
    const hasAllScaffolding = hasPersonaArchetype && hasEmotionalArc && hasEmotionalArcKey && 
                               hasTrainingTopic && hasTrainingTopicKey;
    console.log(`  Result: ${hasAllScaffolding ? '✅ PASS' : '❌ FAIL'}`);
  }
  
  // Test 4: client_background is proper string (no [object Object])
  console.log('\n--- Test 4: client_background is proper string ---');
  const clientBg = firstPair?.conversation_metadata?.client_background || '';
  const hasObjectObject = clientBg.includes('[object Object]');
  
  if (clientBg.length > 80) {
    console.log(`  client_background: ${clientBg.substring(0, 80)}...`);
  } else {
    console.log(`  client_background: ${clientBg}`);
  }
  
  console.log(`  Contains "[object Object]": ${hasObjectObject ? '❌ YES (FAIL)' : '✅ NO (PASS)'}`);
  console.log(`  Result: ${!hasObjectObject ? '✅ PASS' : '❌ FAIL'}`);
  
  // Summary
  console.log('\n=== SUMMARY ===');
  const allTests = [
    { name: 'Parsed JSON has input_parameters', passed: hasInputParams },
    { name: 'Enriched JSON has input_parameters', passed: enrichedHasInputParams },
    { name: 'Training pairs have scaffolding', passed: firstPair && 
      firstPair.conversation_metadata?.persona_archetype &&
      firstPair.conversation_metadata?.emotional_arc &&
      firstPair.conversation_metadata?.training_topic },
    { name: 'client_background is valid string', passed: !hasObjectObject }
  ];
  
  const passedCount = allTests.filter(t => t.passed).length;
  const totalCount = allTests.length;
  
  console.log(`Tests passed: ${passedCount}/${totalCount}`);
  allTests.forEach(test => {
    console.log(`  ${test.passed ? '✅' : '❌'} ${test.name}`);
  });
  
  if (passedCount === totalCount) {
    console.log('\n🎉 ALL TESTS PASSED!');
  } else {
    console.log('\n⚠️ SOME TESTS FAILED - Review fixes needed');
  }
}

runTest().catch(console.error);

