/**
 * Check if conversation has scaffolding IDs in database
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const conversationId = process.argv[2];

if (!conversationId) {
  console.error('Usage: node scripts/check-conversation-scaffolding.js <conversation-id>');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkScaffolding() {
  console.log(`\n🔍 Checking scaffolding for conversation: ${conversationId}\n`);

  // Try by ID first, then by conversation_id
  let { data: conv, error: convError } = await supabase
    .from('conversations')
    .select('id, conversation_id, conversation_name, persona_id, emotional_arc_id, training_topic_id, created_at')
    .eq('id', conversationId)
    .maybeSingle();

  if (convError) {
    console.error('❌ Error fetching conversation by id:', convError.message);
    return;
  }

  if (!conv) {
    // Try by conversation_id (business key)
    const result = await supabase
      .from('conversations')
      .select('id, conversation_id, conversation_name, persona_id, emotional_arc_id, training_topic_id, created_at')
      .eq('conversation_id', conversationId)
      .maybeSingle();
    
    conv = result.data;
    convError = result.error;

    if (convError) {
      console.error('❌ Error fetching conversation by conversation_id:', convError.message);
      return;
    }
  }

  if (!conv) {
    console.error('❌ Conversation not found');
    return;
  }

  console.log('📊 Conversation Record:');
  console.log(`   ID (PK): ${conv.id}`);
  console.log(`   Conversation ID: ${conv.conversation_id}`);
  console.log(`   Name: ${conv.conversation_name}`);
  console.log(`   Created: ${conv.created_at}`);
  console.log('');
  console.log('🔗 Scaffolding IDs:');
  console.log(`   Persona ID: ${conv.persona_id || '❌ NULL'}`);
  console.log(`   Emotional Arc ID: ${conv.emotional_arc_id || '❌ NULL'}`);
  console.log(`   Training Topic ID: ${conv.training_topic_id || '❌ NULL'}`);
  console.log('');

  // Fetch actual scaffolding data if IDs exist
  if (conv.persona_id) {
    const { data: persona } = await supabase
      .from('personas')
      .select('name, archetype, persona_key')
      .eq('id', conv.persona_id)
      .single();
    
    if (persona) {
      console.log(`✅ Persona: ${persona.name} - ${persona.archetype} (${persona.persona_key})`);
    }
  }

  if (conv.emotional_arc_id) {
    const { data: arc } = await supabase
      .from('emotional_arcs')
      .select('name, arc_key, starting_emotion, ending_emotion')
      .eq('id', conv.emotional_arc_id)
      .single();
    
    if (arc) {
      console.log(`✅ Emotional Arc: ${arc.name} (${arc.arc_key})`);
      console.log(`   ${arc.starting_emotion} → ${arc.ending_emotion}`);
    }
  }

  if (conv.training_topic_id) {
    const { data: topic } = await supabase
      .from('training_topics')
      .select('name, topic_key')
      .eq('id', conv.training_topic_id)
      .single();
    
    if (topic) {
      console.log(`✅ Training Topic: ${topic.name} (${topic.topic_key})`);
    }
  }

  console.log('\n💡 Diagnosis:');
  if (conv.persona_id && conv.emotional_arc_id && conv.training_topic_id) {
    console.log('   ✅ All three scaffolding IDs are present in the database');
    console.log('   ⚠️  BUT input_parameters is missing from JSON');
    console.log('   ➡️  This means parseAndStoreFinal() is not adding the section');
    console.log('   ➡️  The fix in conversation-storage-service.ts may not be working');
  } else {
    console.log('   ❌ Some scaffolding IDs are NULL in the database');
    console.log('   ➡️  The scaffoldingIds are not being passed correctly');
    console.log('   ➡️  OR they are being passed but not saved by storeRawResponse()');
  }
  console.log('');
}

checkScaffolding().catch(console.error);

