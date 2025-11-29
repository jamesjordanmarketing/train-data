/**
 * Find the parameters for a failed batch item
 * 
 * Usage: node scripts/find-failed-item-params.js <item_id>
 */

require('../load-env.js');
const saol = require('../supa-agent-ops/dist/index.js');

const itemId = process.argv[2] || 'a0c9f9b2-8bf8-49c5-bf19-cad437999cb7';

async function findFailedItemParams() {
  console.log(`\n🔍 Finding parameters for batch item: ${itemId}\n`);
  
  // Get the batch item details
  const itemResult = await saol.agentQuery({
    table: 'batch_items',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    where: [{ column: 'id', operator: 'eq', value: itemId }],
    limit: 1,
    transport: 'supabase'
  });
  
  if (!itemResult.success || !itemResult.data || itemResult.data.length === 0) {
    console.error('❌ Failed to find batch item:', itemResult.error);
    return;
  }
  
  const item = itemResult.data[0];
  console.log('📋 Batch Item Details:');
  console.log(JSON.stringify(item, null, 2));
  
  // Get the batch job to see all items
  const jobId = item.batch_job_id;
  console.log(`\n📦 Batch Job ID: ${jobId}\n`);
  
  // Get all items from this batch job
  const allItemsResult = await saol.agentQuery({
    table: 'batch_items',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    where: [{ column: 'batch_job_id', operator: 'eq', value: jobId }],
    transport: 'supabase'
  });
  
  if (allItemsResult.success && allItemsResult.data) {
    console.log(`\n📊 All Items in Batch Job (${allItemsResult.data.length} total):\n`);
    
    const successful = allItemsResult.data.filter(i => i.status === 'completed');
    const failed = allItemsResult.data.filter(i => i.status === 'failed');
    
    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    
    console.log('\n📋 Failed Item Parameters:');
    console.log(JSON.stringify(item.parameters, null, 2));
    
    if (item.parameters) {
      console.log('\n🎯 Key Parameters:');
      if (item.parameters.persona_id) console.log(`   Persona ID: ${item.parameters.persona_id}`);
      if (item.parameters.emotional_arc_id) console.log(`   Emotional Arc ID: ${item.parameters.emotional_arc_id}`);
      if (item.parameters.training_topic_id) console.log(`   Training Topic ID: ${item.parameters.training_topic_id}`);
      if (item.parameters.templateId) console.log(`   Template ID: ${item.parameters.templateId}`);
      if (item.tier) console.log(`   Tier: ${item.tier}`);
    }
    
    // Compare with successful items
    if (successful.length > 0) {
      console.log('\n📊 Comparison with Successful Items:');
      const successfulParams = successful.map(i => ({
        persona_id: i.parameters?.persona_id,
        emotional_arc_id: i.parameters?.emotional_arc_id,
        training_topic_id: i.parameters?.training_topic_id,
        tier: i.tier
      }));
      
      console.log('\n✅ Successful combinations:');
      successfulParams.forEach((p, idx) => {
        console.log(`   ${idx + 1}. Persona: ${p.persona_id}, Arc: ${p.emotional_arc_id}, Topic: ${p.training_topic_id}, Tier: ${p.tier}`);
      });
      
      console.log('\n❌ Failed combination:');
      console.log(`   Persona: ${item.parameters?.persona_id}, Arc: ${item.parameters?.emotional_arc_id}, Topic: ${item.parameters?.training_topic_id}, Tier: ${item.tier}`);
    }
  }
  
  // Try to get persona/arc/topic names if IDs are available
  if (item.parameters?.persona_id) {
    const personaResult = await saol.agentQuery({
      table: 'personas',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      where: [{ column: 'id', operator: 'eq', value: item.parameters.persona_id }],
      limit: 1,
      transport: 'supabase'
    });
    
    if (personaResult.success && personaResult.data && personaResult.data.length > 0) {
      console.log(`\n👤 Persona: ${personaResult.data[0].name || personaResult.data[0].persona_key || 'Unknown'}`);
    }
  }
  
  if (item.parameters?.emotional_arc_id) {
    const arcResult = await saol.agentQuery({
      table: 'emotional_arcs',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      where: [{ column: 'id', operator: 'eq', value: item.parameters.emotional_arc_id }],
      limit: 1,
      transport: 'supabase'
    });
    
    if (arcResult.success && arcResult.data && arcResult.data.length > 0) {
      console.log(`📈 Emotional Arc: ${arcResult.data[0].name || arcResult.data[0].arc_key || 'Unknown'}`);
    }
  }
  
  if (item.parameters?.training_topic_id) {
    const topicResult = await saol.agentQuery({
      table: 'training_topics',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      where: [{ column: 'id', operator: 'eq', value: item.parameters.training_topic_id }],
      limit: 1,
      transport: 'supabase'
    });
    
    if (topicResult.success && topicResult.data && topicResult.data.length > 0) {
      console.log(`📚 Training Topic: ${topicResult.data[0].name || topicResult.data[0].topic_key || 'Unknown'}`);
    }
  }
  
  console.log('\n');
}

findFailedItemParams().catch(console.error);

