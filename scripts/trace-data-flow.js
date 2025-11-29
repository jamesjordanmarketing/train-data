/**
 * Trace Data Flow Investigation
 * 
 * This script investigates the data flow from batch job creation to final enriched JSON
 * to understand where the scaffolding metadata is being lost.
 */

require('../load-env.js');
const saol = require('../supa-agent-ops/dist/index.js');

async function investigate() {
  console.log('='.repeat(80));
  console.log('DATA FLOW INVESTIGATION');
  console.log('='.repeat(80));
  console.log('');

  // Find the most recent completed batch job with successful items
  console.log('STEP 1: FINDING RECENT COMPLETED BATCH JOB');
  console.log('-'.repeat(80));
  
  const jobsResult = await saol.agentQuery({
    table: 'batch_jobs',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    where: [
      { column: 'status', operator: 'eq', value: 'completed' }
    ],
    orderBy: { column: 'created_at', ascending: false },
    limit: 5,
    transport: 'supabase'
  });
  
  if (!jobsResult.success || !jobsResult.data || jobsResult.data.length === 0) {
    console.log('❌ No completed batch jobs found');
    return;
  }
  
  // Find a job with successful items
  let targetJob = null;
  for (const job of jobsResult.data) {
    if (job.successful_items > 0) {
      targetJob = job;
      break;
    }
  }
  
  if (!targetJob) {
    console.log('❌ No batch jobs with successful items found');
    return;
  }
  
  console.log(`\n✓ Found batch job: ${targetJob.id}`);
  console.log(`   Name: ${targetJob.name}`);
  console.log(`   Status: ${targetJob.status}`);
  console.log(`   Successful items: ${targetJob.successful_items}`);
  console.log(`   Created: ${targetJob.created_at}`);
  
  // Get batch items for this job
  console.log('\n\nSTEP 2: CHECKING BATCH ITEMS');
  console.log('-'.repeat(80));
  
  const itemsResult = await saol.agentQuery({
    table: 'batch_items',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    where: [
      { column: 'batch_job_id', operator: 'eq', value: targetJob.id },
      { column: 'status', operator: 'eq', value: 'completed' }
    ],
    limit: 1,
    transport: 'supabase'
  });
  
  if (!itemsResult.success || !itemsResult.data || itemsResult.data.length === 0) {
    console.log('❌ No completed batch items found for this job');
    return;
  }
  
  const targetItem = itemsResult.data[0];
  console.log(`\n✓ Found batch item: ${targetItem.id}`);
  console.log(`   Status: ${targetItem.status}`);
  console.log(`   Conversation ID: ${targetItem.conversation_id || 'NOT SET'}`);
  console.log('\n📋 Item parameters:');
  console.log(JSON.stringify(targetItem.parameters, null, 2));
  
  if (!targetItem.conversation_id) {
    console.log('❌ Batch item has no conversation_id - cannot continue');
    return;
  }
  
  // Get the conversation record
  console.log('\n\nSTEP 3: CHECKING CONVERSATION RECORD');
  console.log('-'.repeat(80));
  
  const convResult = await saol.agentQuery({
    table: 'conversations',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    where: [
      { column: 'id', operator: 'eq', value: targetItem.conversation_id }
    ],
    limit: 1,
    transport: 'supabase'
  });
  
  if (!convResult.success || !convResult.data || convResult.data.length === 0) {
    console.log('❌ Conversation record not found');
    return;
  }
  
  const conv = convResult.data[0];
  console.log(`\n✓ Found conversation: ${conv.conversation_id}`);
  console.log(`   DB ID (PK): ${conv.id}`);
  console.log(`   Name: ${conv.conversation_name || 'NOT SET'}`);
  console.log(`   Status: ${conv.status}`);
  console.log(`   Processing Status: ${conv.processing_status || 'NOT SET'}`);
  console.log(`   Enrichment Status: ${conv.enrichment_status || 'NOT SET'}`);
  console.log('\n📋 Scaffolding IDs in conversation record:');
  console.log(`   persona_id: ${conv.persona_id || 'NOT SET'}`);
  console.log(`   emotional_arc_id: ${conv.emotional_arc_id || 'NOT SET'}`);
  console.log(`   training_topic_id: ${conv.training_topic_id || 'NOT SET'}`);
  console.log('\n📋 File paths:');
  console.log(`   file_path: ${conv.file_path || 'NOT SET'}`);
  console.log(`   raw_response_path: ${conv.raw_response_path || 'NOT SET'}`);
  console.log(`   enriched_file_path: ${conv.enriched_file_path || 'NOT SET'}`);
  
  // Check if scaffolding IDs are set
  const hasScaffoldingIds = conv.persona_id && conv.emotional_arc_id && conv.training_topic_id;
  
  if (hasScaffoldingIds) {
    console.log('\n✅ Scaffolding IDs ARE set in conversation record');
    
    // Fetch the actual scaffolding data to verify
    console.log('\n\nSTEP 4: VERIFYING SCAFFOLDING DATA');
    console.log('-'.repeat(80));
    
    const [personaResult, arcResult, topicResult] = await Promise.all([
      saol.agentQuery({
        table: 'personas',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        where: [{ column: 'id', operator: 'eq', value: conv.persona_id }],
        limit: 1,
        transport: 'supabase'
      }),
      saol.agentQuery({
        table: 'emotional_arcs',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        where: [{ column: 'id', operator: 'eq', value: conv.emotional_arc_id }],
        limit: 1,
        transport: 'supabase'
      }),
      saol.agentQuery({
        table: 'training_topics',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        where: [{ column: 'id', operator: 'eq', value: conv.training_topic_id }],
        limit: 1,
        transport: 'supabase'
      })
    ]);
    
    const persona = personaResult.data?.[0];
    const arc = arcResult.data?.[0];
    const topic = topicResult.data?.[0];
    
    console.log('\n📋 Persona:');
    console.log(`   ${persona ? '✓' : '❌'} ${persona?.name || 'NOT FOUND'} (${persona?.persona_key || 'N/A'})`);
    console.log(`   Archetype: ${persona?.archetype || 'N/A'}`);
    
    console.log('\n📋 Emotional Arc:');
    console.log(`   ${arc ? '✓' : '❌'} ${arc?.name || 'NOT FOUND'} (${arc?.arc_key || 'N/A'})`);
    
    console.log('\n📋 Training Topic:');
    console.log(`   ${topic ? '✓' : '❌'} ${topic?.name || 'NOT FOUND'} (${topic?.topic_key || 'N/A'})`);
    
  } else {
    console.log('\n❌ Scaffolding IDs are NOT set in conversation record');
    console.log('   This is the ROOT CAUSE - scaffolding IDs never made it to the DB');
  }
  
  // Summary
  console.log('\n\n' + '='.repeat(80));
  console.log('INVESTIGATION SUMMARY');
  console.log('='.repeat(80));
  
  console.log('\n📊 Data Flow Status:');
  console.log(`   1. Batch Item Parameters: ${targetItem.parameters?.persona_id ? '✓' : '❌'} Has scaffolding IDs`);
  console.log(`   2. Conversation Record: ${hasScaffoldingIds ? '✓' : '❌'} Has scaffolding IDs`);
  console.log(`   3. Raw JSON file: ${conv.file_path ? '✓' : '❌'} Exists`);
  console.log(`   4. Enriched JSON file: ${conv.enriched_file_path ? '✓' : '❌'} Exists`);
  
  console.log('\n🔍 Root Cause Analysis:');
  if (!hasScaffoldingIds) {
    console.log('   ❌ Scaffolding IDs never made it to conversations table');
    console.log('   This means parseAndStoreFinal() cannot fetch them to add to input_parameters');
    console.log('   This also means enrichment cannot add them to training_pairs');
  } else if (!conv.enriched_file_path) {
    console.log('   ⚠️  Scaffolding IDs are in DB but enrichment never ran');
  } else {
    console.log('   ⚠️  Scaffolding IDs are in DB and files exist');
    console.log('   Need to check if input_parameters is being added to JSON files');
  }
  
  console.log('\n' + '='.repeat(80));
}

investigate()
  .then(() => {
    console.log('\n✅ Investigation completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Investigation failed:', error);
    process.exit(1);
  });

