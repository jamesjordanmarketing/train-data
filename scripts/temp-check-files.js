require('../load-env.js'); 
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() { 
  const conversationId = '1a86807b-f74e-44bf-9782-7f1c27814fbd';
  
  // Download the file_path version (should have input_parameters)
  const { data: parsedFile, error: parsedError } = await supabase.storage
    .from('conversation-files')
    .download(`00000000-0000-0000-0000-000000000000/${conversationId}/conversation.json`);
    
  if (parsedError) { 
    console.error('Error downloading parsed file:', parsedError); 
  } else {
    const text = await parsedFile.text();
    const json = JSON.parse(text);
    
    console.log('=== PARSED JSON (file_path) ===');
    console.log('Has input_parameters:', !!json.input_parameters);
    if (json.input_parameters) {
      console.log('input_parameters:', JSON.stringify(json.input_parameters, null, 2));
    }
    console.log('conversation_metadata.client_persona:', json.conversation_metadata?.client_persona);
  }
  
  // Download the raw version
  const { data: rawFile, error: rawError } = await supabase.storage
    .from('conversation-files')
    .download(`raw/00000000-0000-0000-0000-000000000000/${conversationId}.json`);
    
  if (rawError) { 
    console.error('Error downloading raw file:', rawError); 
  } else {
    const text = await rawFile.text();
    const json = JSON.parse(text);
    
    console.log('\n=== RAW JSON (raw_response_path) ===');
    console.log('Has input_parameters:', !!json.input_parameters);
    console.log('conversation_metadata.client_persona:', json.conversation_metadata?.client_persona);
  }
  
  // Download the enriched version
  const { data: enrichedFile, error: enrichedError } = await supabase.storage
    .from('conversation-files')
    .download(`00000000-0000-0000-0000-000000000000/${conversationId}/enriched.json`);
    
  if (enrichedError) { 
    console.error('Error downloading enriched file:', enrichedError); 
  } else {
    const text = await enrichedFile.text();
    const json = JSON.parse(text);
    
    console.log('\n=== ENRICHED JSON (enriched_file_path) ===');
    console.log('Has input_parameters:', !!json.input_parameters);
    if (json.training_pairs && json.training_pairs.length > 0) {
      const firstPair = json.training_pairs[0];
      console.log('First training_pair.conversation_metadata:', JSON.stringify(firstPair.conversation_metadata, null, 2));
    }
  }
} 

check().catch(console.error);
