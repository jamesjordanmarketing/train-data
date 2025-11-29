/**
 * Get signed URL for conversation JSON
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const conversationPK = process.argv[2];

if (!conversationPK) {
  console.error('Usage: node scripts/get-conversation-json-url.js <conversation-pk>');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getJsonUrl() {
  // Get conversation record to find file path  
  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .select('id, conversation_id, file_path, created_by')
    .eq('id', conversationPK)
    .single();

  if (convError || !conv) {
    console.error('Error fetching conversation:', convError?.message);
    return;
  }

  console.log(`\nConversation: ${conv.conversation_id}`);
  console.log(`File path: ${conv.file_path}\n`);

  if (!conv.file_path) {
    console.error('No file_path set on conversation');
    return;
  }

  // Generate signed URL
  const { data: urlData, error: urlError } = await supabase.storage
    .from('conversation-files')
    .createSignedUrl(conv.file_path, 3600);

  if (urlError) {
    console.error('Error generating signed URL:', urlError.message);
    return;
  }

  console.log('Raw JSON URL:');
  console.log(urlData.signedUrl);
  console.log('');
}

getJsonUrl().catch(console.error);

