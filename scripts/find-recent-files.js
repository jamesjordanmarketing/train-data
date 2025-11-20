/**
 * Find most recent conversation files in storage
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function findRecentFiles() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔍 Finding Most Recent Conversation Files\n');

  // Get most recent conversation
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select('conversation_id, created_at, created_by, enrichment_status, raw_response_path, enriched_file_path, raw_response_size, enriched_file_size')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${conversations.length} recent conversations:\n`);

  for (const conv of conversations) {
    console.log('─'.repeat(60));
    console.log(`Conversation ID: ${conv.conversation_id}`);
    console.log(`Created: ${conv.created_at}`);
    console.log(`Enrichment Status: ${conv.enrichment_status || 'NULL'}`);
    console.log(`\nRaw Response:`);
    console.log(`  Path: ${conv.raw_response_path || 'NULL'}`);
    console.log(`  Size: ${conv.raw_response_size || 0} bytes`);
    console.log(`\nEnriched File:`);
    console.log(`  Path: ${conv.enriched_file_path || 'NULL'}`);
    console.log(`  Size: ${conv.enriched_file_size || 0} bytes`);

    // Check if files exist in storage
    if (conv.raw_response_path) {
      const { data: rawUrl, error: rawError } = await supabase.storage
        .from('conversation-files')
        .createSignedUrl(conv.raw_response_path, 60);
      
      if (rawUrl) {
        console.log(`\n✅ Raw file URL: ${rawUrl.signedUrl.substring(0, 100)}...`);
      } else {
        console.log(`\n❌ Raw file error: ${rawError?.message}`);
      }
    }

    if (conv.enriched_file_path) {
      const { data: enrichedUrl, error: enrichedError } = await supabase.storage
        .from('conversation-files')
        .createSignedUrl(conv.enriched_file_path, 60);
      
      if (enrichedUrl) {
        console.log(`✅ Enriched file URL: ${enrichedUrl.signedUrl.substring(0, 100)}...`);
      } else {
        console.log(`❌ Enriched file error: ${enrichedError?.message}`);
      }
    }

    console.log('');
  }

  // Show most recent
  if (conversations.length > 0) {
    const latest = conversations[0];
    console.log('\n' + '='.repeat(60));
    console.log('📁 MOST RECENT CONVERSATION FILES');
    console.log('='.repeat(60));
    console.log(`Conversation ID: ${latest.conversation_id}`);
    console.log(`User ID: ${latest.created_by}`);
    console.log(`\nRaw JSON path:`);
    console.log(latest.raw_response_path || 'NOT SET');
    console.log(`\nEnriched JSON path:`);
    console.log(latest.enriched_file_path || 'NOT SET');
    console.log('='.repeat(60));
  }
}

findRecentFiles().catch(console.error);
