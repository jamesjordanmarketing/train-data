/**
 * Check both raw and parsed JSON for input_parameters
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const conversationPK = process.argv[2];

if (!conversationPK) {
  console.error('Usage: node scripts/check-both-json-files.js <conversation-pk>');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkBothFiles() {
  // Get conversation record
  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .select('id, conversation_id, file_path, raw_file_path, persona_id, emotional_arc_id, training_topic_id')
    .eq('id', conversationPK)
    .single();

  if (convError || !conv) {
    console.error('Error fetching conversation:', convError?.message);
    return;
  }

  console.log(`\n🔍 Checking JSON files for conversation: ${conv.conversation_id}\n`);
  console.log('Database scaffolding IDs:');
  console.log(`  persona_id: ${conv.persona_id || 'NULL'}`);
  console.log(`  emotional_arc_id: ${conv.emotional_arc_id || 'NULL'}`);
  console.log(`  training_topic_id: ${conv.training_topic_id || 'NULL'}`);
  console.log('');

  // Check RAW file
  if (conv.raw_file_path) {
    console.log('📄 RAW JSON (from Claude API):');
    console.log(`   Path: ${conv.raw_file_path}`);
    
    const { data: rawData, error: rawError } = await supabase.storage
      .from('conversation-files')
      .download(conv.raw_file_path);

    if (rawError) {
      console.log(`   ❌ Error: ${rawError.message}`);
    } else {
      const text = await rawData.text();
      const json = JSON.parse(text);
      console.log(`   input_parameters: ${json.input_parameters ? '✅ EXISTS' : '❌ MISSING'}`);
    }
  } else {
    console.log('📄 RAW JSON: Not set');
  }
  console.log('');

  // Check PARSED/FINAL file
  if (conv.file_path) {
    console.log('📄 PARSED/FINAL JSON (after parseAndStoreFinal):');
    console.log(`   Path: ${conv.file_path}`);
    
    const { data: finalData, error: finalError } = await supabase.storage
      .from('conversation-files')
      .download(conv.file_path);

    if (finalError) {
      console.log(`   ❌ Error: ${finalError.message}`);
    } else {
      const text = await finalData.text();
      const json = JSON.parse(text);
      console.log(`   input_parameters: ${json.input_parameters ? '✅ EXISTS' : '❌ MISSING'}`);
      
      if (json.input_parameters) {
        console.log('   ✅ Input Parameters:');
        console.log(`      Persona: ${json.input_parameters.persona_name || 'N/A'}`);
        console.log(`      Arc: ${json.input_parameters.emotional_arc_name || 'N/A'}`);
        console.log(`      Topic: ${json.input_parameters.training_topic_name || 'N/A'}`);
      }
    }
  } else {
    console.log('📄 PARSED/FINAL JSON: Not set');
  }
  console.log('');

  console.log('💡 Expected behavior:');
  console.log('   RAW JSON: Should NOT have input_parameters (direct from Claude)');
  console.log('   PARSED JSON: SHOULD have input_parameters (added by parseAndStoreFinal)');
  console.log('');
}

checkBothFiles().catch(console.error);

