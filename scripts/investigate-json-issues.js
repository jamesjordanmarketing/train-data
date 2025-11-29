/**
 * Investigation Script: JSON Batch Generation Issues
 * 
 * This script investigates the current state of the database and compares it against
 * the expected structure from iteration-2-json-updated_v1.md
 */

require('../load-env.js');
const saol = require('../supa-agent-ops/dist/index.js');

async function investigate() {
  console.log('='.repeat(80));
  console.log('JSON BATCH GENERATION INVESTIGATION');
  console.log('='.repeat(80));
  console.log('');

  // 1. Check database schema for relevant tables
  console.log('STEP 1: CHECKING DATABASE SCHEMA');
  console.log('-'.repeat(80));

  const tables = ['conversations', 'personas', 'emotional_arcs', 'training_topics', 'batch_items', 'batch_jobs'];
  
  for (const table of tables) {
    console.log(`\n📋 Table: ${table}`);
    
    // Query one row to see what columns exist
    const result = await saol.agentQuery({
      table: table,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      limit: 1,
      transport: 'supabase'
    });
    
    if (result.success && result.data && result.data.length > 0) {
      const columns = Object.keys(result.data[0]);
      console.log(`   Columns (${columns.length}):`, columns.join(', '));
    } else {
      console.log(`   ⚠️  No data in table or query failed`);
    }
  }

  // 2. Check the most recent batch job
  console.log('\n\nSTEP 2: CHECKING RECENT BATCH JOBS');
  console.log('-'.repeat(80));
  
  const batchJobsResult = await saol.agentQuery({
    table: 'batch_jobs',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    orderBy: { column: 'created_at', ascending: false },
    limit: 5,
    transport: 'supabase'
  });
  
  if (batchJobsResult.success && batchJobsResult.data) {
    console.log(`\n📊 Found ${batchJobsResult.data.length} recent batch jobs:\n`);
    for (const job of batchJobsResult.data) {
      console.log(`   Job ID: ${job.id}`);
      console.log(`   Name: ${job.name}`);
      console.log(`   Status: ${job.status}`);
      console.log(`   Items: ${job.completed_items}/${job.total_items} completed`);
      console.log(`   Created: ${job.created_at}`);
      console.log('');
    }
  }

  // 3. Check recent batch items
  console.log('\nSTEP 3: CHECKING RECENT BATCH ITEMS');
  console.log('-'.repeat(80));
  
  const batchItemsResult = await saol.agentQuery({
    table: 'batch_items',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    orderBy: { column: 'created_at', ascending: false },
    limit: 3,
    transport: 'supabase'
  });
  
  if (batchItemsResult.success && batchItemsResult.data) {
    console.log(`\n📊 Found ${batchItemsResult.data.length} recent batch items:\n`);
    for (const item of batchItemsResult.data) {
      console.log(`   Item ID: ${item.id}`);
      console.log(`   Batch Job ID: ${item.batch_job_id}`);
      console.log(`   Status: ${item.status}`);
      console.log(`   Conversation ID: ${item.conversation_id || 'NOT SET'}`);
      console.log(`   Parameters:`, JSON.stringify(item.parameters, null, 2));
      console.log('');
    }
  }

  // 4. Check conversations table for recent conversations
  console.log('\nSTEP 4: CHECKING RECENT CONVERSATIONS');
  console.log('-'.repeat(80));
  
  const conversationsResult = await saol.agentQuery({
    table: 'conversations',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    orderBy: { column: 'created_at', ascending: false },
    limit: 3,
    transport: 'supabase'
  });
  
  if (conversationsResult.success && conversationsResult.data) {
    console.log(`\n📊 Found ${conversationsResult.data.length} recent conversations:\n`);
    for (const conv of conversationsResult.data) {
      console.log(`   Conversation ID: ${conv.conversation_id}`);
      console.log(`   Name: ${conv.conversation_name || 'NOT SET'}`);
      console.log(`   Status: ${conv.status}`);
      console.log(`   Persona ID: ${conv.persona_id || 'NOT SET'}`);
      console.log(`   Emotional Arc ID: ${conv.emotional_arc_id || 'NOT SET'}`);
      console.log(`   Training Topic ID: ${conv.training_topic_id || 'NOT SET'}`);
      console.log(`   File Path: ${conv.file_path || 'NOT SET'}`);
      console.log(`   Enriched Path: ${conv.enriched_file_path || 'NOT SET'}`);
      console.log('');
    }
  }

  // 5. Check scaffolding data samples
  console.log('\nSTEP 5: CHECKING SCAFFOLDING DATA SAMPLES');
  console.log('-'.repeat(80));
  
  // Get one persona
  const personasResult = await saol.agentQuery({
    table: 'personas',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    limit: 2,
    transport: 'supabase'
  });
  
  if (personasResult.success && personasResult.data && personasResult.data.length > 0) {
    console.log(`\n📋 Sample Personas:`);
    for (const p of personasResult.data) {
      console.log(`   ID: ${p.id}`);
      console.log(`   Name: ${p.name}`);
      console.log(`   Archetype: ${p.archetype || 'NOT SET'}`);
      console.log(`   Key: ${p.persona_key || 'NOT SET'}`);
      console.log('');
    }
  }

  // Get one emotional arc
  const arcsResult = await saol.agentQuery({
    table: 'emotional_arcs',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    limit: 2,
    transport: 'supabase'
  });
  
  if (arcsResult.success && arcsResult.data && arcsResult.data.length > 0) {
    console.log(`\n📋 Sample Emotional Arcs:`);
    for (const arc of arcsResult.data) {
      console.log(`   ID: ${arc.id}`);
      console.log(`   Name: ${arc.name}`);
      console.log(`   Key: ${arc.arc_key || 'NOT SET'}`);
      console.log('');
    }
  }

  // Get one training topic
  const topicsResult = await saol.agentQuery({
    table: 'training_topics',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    limit: 2,
    transport: 'supabase'
  });
  
  if (topicsResult.success && topicsResult.data && topicsResult.data.length > 0) {
    console.log(`\n📋 Sample Training Topics:`);
    for (const topic of topicsResult.data) {
      console.log(`   ID: ${topic.id}`);
      console.log(`   Name: ${topic.name}`);
      console.log(`   Key: ${topic.topic_key || 'NOT SET'}`);
      console.log('');
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('INVESTIGATION COMPLETE');
  console.log('='.repeat(80));
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

