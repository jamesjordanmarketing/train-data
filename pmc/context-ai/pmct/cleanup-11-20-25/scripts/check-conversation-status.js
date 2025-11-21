require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkConversation() {
  const { data, error } = await supabase
    .from('conversations')
    .select('conversation_id, enrichment_status, enriched_file_path, enriched_file_size, raw_response_path, created_by, processing_status')
    .eq('conversation_id', '4acf22d3-e8e5-4293-88d6-db03de41675a')
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
