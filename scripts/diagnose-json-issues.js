/**
 * Diagnostic Script: Examine JSON Generation Issues
 * 
 * This script examines the database to understand why the JSON output
 * is missing expected fields from iteration-2-json-updated_v1.md
 */

require('../load-env.js');
const saol = require('../supa-agent-ops/dist/index.js');

async function diagnose() {
  console.log('='.repeat(80));
  console.log('JSON GENERATION DIAGNOSTIC');
  console.log('='.repeat(80));
  console.log('');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Step 1: Find the most recent conversation
  console.log('📋 Step 1: Finding most recent conversation...');
  const recentConvResult = await saol.agentQuery({
    table: 'conversations',
    supabaseUrl: url,
    supabaseKey: key,
    select: 'id, conversation_id, conversation_name, persona_id, emotional_arc_id, training_topic_id, file_path, enriched_file_path, created_at, processing_status, enrichment_status',
    orderBy: { column: 'created_at', ascending: false },
    limit: 3,
    transport: 'supabase'
  });

  if (!recentConvResult.success) {
    console.error('❌ Failed to fetch conversations:', recentConvResult.error);
    return;
  }

  console.log(`Found ${recentConvResult.data.length} recent conversations:`);
  recentConvResult.data.forEach((conv, idx) => {
    console.log(`  ${idx + 1}. ${conv.conversation_name || 'Unnamed'}`);
    console.log(`     ID: ${conv.conversation_id}`);
    console.log(`     Persona: ${conv.persona_id || 'NOT SET'}`);
    console.log(`     Arc: ${conv.emotional_arc_id || 'NOT SET'}`);
    console.log(`     Topic: ${conv.training_topic_id || 'NOT SET'}`);
    console.log(`     File: ${conv.file_path || 'NO FILE'}`);
    console.log(`     Enriched: ${conv.enriched_file_path || 'NOT ENRICHED'}`);
    console.log(`     Status: ${conv.processing_status} / ${conv.enrichment_status}`);
    console.log('');
  });

  // Pick the most recent one
  const targetConv = recentConvResult.data[0];
  console.log(`🎯 Examining conversation: ${targetConv.conversation_name}`);
  console.log('');

  // Step 2: Check if scaffolding IDs are set
  console.log('📋 Step 2: Checking scaffolding IDs...');
  if (targetConv.persona_id) {
    console.log(`  ✅ persona_id is SET: ${targetConv.persona_id}`);
    
    // Fetch persona details
    const personaResult = await saol.agentQuery({
      table: 'personas',
      supabaseUrl: url,
      supabaseKey: key,
      where: [{ column: 'id', operator: 'eq', value: targetConv.persona_id }],
      limit: 1,
      transport: 'supabase'
    });
    
    if (personaResult.success && personaResult.data[0]) {
      const persona = personaResult.data[0];
      console.log(`     Name: ${persona.name}`);
      console.log(`     Archetype: ${persona.archetype}`);
      console.log(`     Key: ${persona.persona_key}`);
    }
  } else {
    console.log(`  ❌ persona_id is NULL`);
  }

  if (targetConv.emotional_arc_id) {
    console.log(`  ✅ emotional_arc_id is SET: ${targetConv.emotional_arc_id}`);
    
    // Fetch arc details
    const arcResult = await saol.agentQuery({
      table: 'emotional_arcs',
      supabaseUrl: url,
      supabaseKey: key,
      where: [{ column: 'id', operator: 'eq', value: targetConv.emotional_arc_id }],
      limit: 1,
      transport: 'supabase'
    });
    
    if (arcResult.success && arcResult.data[0]) {
      const arc = arcResult.data[0];
      console.log(`     Name: ${arc.name}`);
      console.log(`     Key: ${arc.arc_key}`);
    }
  } else {
    console.log(`  ❌ emotional_arc_id is NULL`);
  }

  if (targetConv.training_topic_id) {
    console.log(`  ✅ training_topic_id is SET: ${targetConv.training_topic_id}`);
    
    // Fetch topic details
    const topicResult = await saol.agentQuery({
      table: 'training_topics',
      supabaseUrl: url,
      supabaseKey: key,
      where: [{ column: 'id', operator: 'eq', value: targetConv.training_topic_id }],
      limit: 1,
      transport: 'supabase'
    });
    
    if (topicResult.success && topicResult.data[0]) {
      const topic = topicResult.data[0];
      console.log(`     Name: ${topic.name}`);
      console.log(`     Key: ${topic.topic_key}`);
    }
  } else {
    console.log(`  ❌ training_topic_id is NULL`);
  }
  console.log('');

  // Step 3: Check batch_items to see what was submitted
  console.log('📋 Step 3: Checking batch_items...');
  const batchItemsResult = await saol.agentQuery({
    table: 'batch_items',
    supabaseUrl: url,
    supabaseKey: key,
    where: [{ column: 'conversation_id', operator: 'eq', value: targetConv.id }],
    limit: 1,
    transport: 'supabase'
  });

  if (batchItemsResult.success && batchItemsResult.data[0]) {
    const item = batchItemsResult.data[0];
    console.log(`  Batch Item Found:`);
    console.log(`  Status: ${item.status}`);
    console.log(`  Parameters:`);
    console.log(`    persona_id: ${item.parameters?.persona_id || 'MISSING'}`);
    console.log(`    emotional_arc_id: ${item.parameters?.emotional_arc_id || 'MISSING'}`);
    console.log(`    training_topic_id: ${item.parameters?.training_topic_id || 'MISSING'}`);
  } else {
    console.log(`  ⚠️  No batch_items record found for this conversation`);
  }
  console.log('');

  // Step 4: Check generation_logs
  console.log('📋 Step 4: Checking generation_logs...');
  const genLogsResult = await saol.agentQuery({
    table: 'generation_logs',
    supabaseUrl: url,
    supabaseKey: key,
    where: [{ column: 'conversation_id', operator: 'eq', value: targetConv.id }],
    orderBy: { column: 'created_at', ascending: false },
    limit: 1,
    transport: 'supabase'
  });

  if (genLogsResult.success && genLogsResult.data[0]) {
    const log = genLogsResult.data[0];
    console.log(`  Generation Log Found:`);
    console.log(`  Status: ${log.status}`);
    console.log(`  Model: ${log.model_used}`);
    console.log(`  Template ID: ${log.template_id || 'NOT SET'}`);
    console.log(`  Input Parameters (first 200 chars):`);
    const inputParams = JSON.stringify(log.input_parameters || {});
    console.log(`    ${inputParams.substring(0, 200)}${inputParams.length > 200 ? '...' : ''}`);
  } else {
    console.log(`  ⚠️  No generation_logs record found for this conversation`);
  }
  console.log('');

  // Step 5: Check conversations table for input_parameters field
  console.log('📋 Step 5: Checking if conversations table has scaffolding columns...');
  const schemaResult = await saol.agentQuery({
    table: 'conversations',
    supabaseUrl: url,
    supabaseKey: key,
    where: [{ column: 'id', operator: 'eq', value: targetConv.id }],
    select: 'persona_key, emotional_arc_key, topic_key, scaffolding_snapshot',
    limit: 1,
    transport: 'supabase'
  });

  if (schemaResult.success) {
    const row = schemaResult.data[0];
    console.log(`  persona_key: ${row?.persona_key || 'NULL'}`);
    console.log(`  emotional_arc_key: ${row?.emotional_arc_key || 'NULL'}`);
    console.log(`  topic_key: ${row?.topic_key || 'NULL'}`);
    console.log(`  scaffolding_snapshot: ${row?.scaffolding_snapshot ? 'EXISTS' : 'NULL'}`);
    if (row?.scaffolding_snapshot) {
      console.log(`    Snapshot keys: ${Object.keys(row.scaffolding_snapshot).join(', ')}`);
    }
  } else {
    console.log(`  ⚠️  Error checking columns: ${schemaResult.error}`);
  }
  console.log('');

  // Step 6: Summary of issues
  console.log('='.repeat(80));
  console.log('🔍 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(80));
  console.log('');
  
  const issues = [];
  
  if (!targetConv.persona_id) {
    issues.push('❌ persona_id is NULL in conversations table');
  }
  if (!targetConv.emotional_arc_id) {
    issues.push('❌ emotional_arc_id is NULL in conversations table');
  }
  if (!targetConv.training_topic_id) {
    issues.push('❌ training_topic_id is NULL in conversations table');
  }
  if (!targetConv.enriched_file_path) {
    issues.push('⚠️  Conversation has not been enriched yet');
  }

  if (issues.length === 0) {
    console.log('✅ No major issues detected in database records');
  } else {
    console.log('Issues detected:');
    issues.forEach(issue => console.log(`  ${issue}`));
  }
  
  console.log('');
  console.log('Next steps:');
  console.log('  1. Download the raw and enriched JSON files from Supabase Storage');
  console.log('  2. Check if input_parameters exists in raw JSON');
  console.log('  3. Check if training pairs have the 5 new scaffolding fields');
  console.log('  4. Review conversation-storage-service.ts parseAndStoreFinal() logs');
  console.log('  5. Review conversation-enrichment-service.ts buildTrainingPair() logs');
  console.log('');
}

diagnose()
  .then(() => {
    console.log('✅ Diagnostic complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Diagnostic failed:', err);
    process.exit(1);
  });

