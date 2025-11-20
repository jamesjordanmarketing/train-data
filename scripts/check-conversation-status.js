require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkConversation() {
  const { data, error } = await supabase
    .from('conversations')
    .select('conversation_id, enrichment_status, enriched_file_path, enriched_file_size, raw_response_path, created_by')
    .eq('conversation_id', '3bc38a7b-232a-4908-9cf1-271ac2d25102')
    .single();

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  } else {
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  }
}

checkConversation();
