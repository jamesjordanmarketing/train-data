/**
 * Check if conversation JSON has input_parameters section
 */

const https = require('https');

const rawUrl = process.argv[2];

if (!rawUrl) {
  console.error('Usage: node scripts/check-json-params.js <raw-json-url>');
  process.exit(1);
}

https.get(rawUrl, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      
      console.log('\n🔍 Checking Raw JSON for Input Parameters\n');
      console.log('═══════════════════════════════════════════\n');
      
      // Check for input_parameters
      if (json.input_parameters) {
        console.log('✅ input_parameters section EXISTS\n');
        console.log('📋 Input Parameters:');
        console.log(JSON.stringify(json.input_parameters, null, 2));
        
        // Check individual fields
        const hasPersona = json.input_parameters.persona_id && json.input_parameters.persona_name;
        const hasArc = json.input_parameters.emotional_arc_id && json.input_parameters.emotional_arc_name;
        const hasTopic = json.input_parameters.training_topic_id && json.input_parameters.training_topic_name;
        
        console.log('\n✓ Validation:');
        console.log(`   ${hasPersona ? '✅' : '❌'} Persona: ${json.input_parameters.persona_name || 'MISSING'}`);
        console.log(`   ${hasArc ? '✅' : '❌'} Emotional Arc: ${json.input_parameters.emotional_arc_name || 'MISSING'}`);
        console.log(`   ${hasTopic ? '✅' : '❌'} Training Topic: ${json.input_parameters.training_topic_name || 'MISSING'}`);
        
        if (hasPersona && hasArc && hasTopic) {
          console.log('\n✨ ALL THREE PRIMARY INPUT PARAMETERS PRESENT!\n');
        } else {
          console.log('\n⚠️  Some parameters are missing!\n');
        }
      } else {
        console.log('❌ input_parameters section MISSING\n');
        console.log('This means the persona validation fix did not work.\n');
      }
      
      // Also check conversation_metadata.client_persona
      if (json.conversation_metadata?.client_persona) {
        console.log(`📝 conversation_metadata.client_persona: "${json.conversation_metadata.client_persona}"`);
      } else {
        console.log('❌ conversation_metadata.client_persona is missing');
      }
      
      console.log('\n');
      
    } catch (err) {
      console.error('Error parsing JSON:', err.message);
      console.log('Raw response:', data.substring(0, 200));
    }
  });
}).on('error', (err) => {
  console.error('Error fetching URL:', err.message);
});

