/**
 * Check enrichment_status values in database
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkEnrichmentStatus() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔍 Checking enrichment_status field values\n');

  // Get most recent conversations
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (conversations && conversations.length > 0) {
    console.log(`Found ${conversations.length} conversations:\n`);
    
    for (const conv of conversations) {
      console.log('─'.repeat(60));
      console.log(`ID: ${conv.conversation_id}`);
      console.log(`Created: ${conv.created_at}`);
      console.log(`enrichment_status: ${conv.enrichment_status} (type: ${typeof conv.enrichment_status})`);
      console.log(`raw_response_path: ${conv.raw_response_path ? 'present' : 'NULL'}`);
      console.log(`enriched_file_path: ${conv.enriched_file_path ? 'present' : 'NULL'}`);
      console.log('');
    }

    // Check for undefined values
    console.log('\n' + '='.repeat(60));
    console.log('📊 Analysis:');
    const undefinedCount = conversations.filter(c => c.enrichment_status === undefined || c.enrichment_status === null).length;
    const completedCount = conversations.filter(c => c.enrichment_status === 'completed').length;
    
    console.log(`Undefined/NULL: ${undefinedCount}`);
    console.log(`Completed: ${completedCount}`);
    console.log(`Other statuses: ${conversations.length - undefinedCount - completedCount}`);
    console.log('='.repeat(60));
  } else {
    console.log('No conversations found');
  }
}

checkEnrichmentStatus().catch(console.error);
