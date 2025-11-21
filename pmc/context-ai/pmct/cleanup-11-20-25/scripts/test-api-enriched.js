/**
 * Test the enriched download API endpoint directly
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const CONVERSATION_ID = '8d8e2e10-f513-4bcd-9df3-cd260f6bc3aa'; // Most recent

async function testAPI() {
  console.log('🧪 Testing Enriched Download API Endpoint\n');
  console.log('Conversation ID:', CONVERSATION_ID, '\n');

  // First verify the conversation in DB
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: conv, error } = await supabase
    .from('conversations')
    .select('conversation_id, enrichment_status, enriched_file_path, enriched_file_size')
    .eq('conversation_id', CONVERSATION_ID)
    .single();

  if (error) {
    console.error('❌ DB Error:', error);
    return;
  }

  console.log('📊 Database State:');
  console.log('  enrichment_status:', conv.enrichment_status);
  console.log('  enriched_file_path:', conv.enriched_file_path);
  console.log('  enriched_file_size:', conv.enriched_file_size, '\n');

  // Now test the storage service method directly
  console.log('🔧 Testing Storage Service Method:\n');

  try {
    const { getConversationStorageService } = require('../src/lib/services/conversation-storage-service');
    const storageService = getConversationStorageService();
    
    const result = await storageService.getEnrichedDownloadUrl(CONVERSATION_ID);
    console.log('✅ Storage service succeeded:');
    console.log('  conversation_id:', result.conversation_id);
    console.log('  filename:', result.filename);
    console.log('  file_size:', result.file_size);
    console.log('  download_url:', result.download_url.substring(0, 100) + '...');
    console.log('  expires_at:', result.expires_at);
    console.log('  expires_in_seconds:', result.expires_in_seconds);

    // Try to download
    console.log('\n📥 Testing actual download:');
    const response = await fetch(result.download_url);
    if (response.ok) {
      const text = await response.text();
      console.log('✅ Download successful');
      console.log('  Size:', text.length, 'bytes');
      console.log('  Valid JSON:', text.startsWith('{'));
    } else {
      console.log('❌ Download failed:', response.status);
    }
  } catch (err) {
    console.error('❌ Storage service error:', err.message);
    console.error('   Full error:', err);
  }
}

testAPI().catch(console.error);
