/**
 * Trigger enrichment on the test conversation via internal service call
 * This bypasses the API and directly calls the orchestrator
 */

require('../load-env.js');

// Test conversation from context document
const TEST_CONVERSATION_ID = '1a86807b-f74e-44bf-9782-7f1c27814fbd';

async function triggerEnrichment() {
  console.log('=== TRIGGER ENRICHMENT TEST ===\n');
  console.log(`Target conversation: ${TEST_CONVERSATION_ID}`);
  
  console.log('\n--- Approach ---');
  console.log('To test the enrichment fixes, we have a few options:\n');
  
  console.log('Option 1: Call the API endpoint directly');
  console.log('  curl -X POST http://localhost:3000/api/conversations/${conversationId}/enrich\n');
  
  console.log('Option 2: Use the Supabase service role to update conversation status');
  console.log('  This will trigger the batch processor to pick it up\n');
  
  console.log('Option 3: Generate a new conversation with enrichment');
  console.log('  This ensures we test the full pipeline end-to-end\n');
  
  console.log('--- Recommended: Use Option 2 (Reset enrichment status) ---\n');
  
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  // Get current conversation state
  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .select('conversation_id, user_id, file_path, enriched_file_path, enrichment_status')
    .eq('conversation_id', TEST_CONVERSATION_ID)
    .single();
  
  if (convError || !conv) {
    console.error('❌ Failed to fetch conversation:', convError?.message);
    return;
  }
  
  console.log('Current conversation state:');
  console.log(`  user_id: ${conv.user_id}`);
  console.log(`  file_path: ${conv.file_path}`);
  console.log(`  enriched_file_path: ${conv.enriched_file_path}`);
  console.log(`  enrichment_status: ${conv.enrichment_status}`);
  
  // Reset enrichment status to trigger re-enrichment
  console.log('\n--- Resetting enrichment status ---');
  
  const { data: updated, error: updateError } = await supabase
    .from('conversations')
    .update({
      enrichment_status: 'not_started',
      enrichment_error: null,
      enriched_file_path: null,
      updated_at: new Date().toISOString()
    })
    .eq('conversation_id', TEST_CONVERSATION_ID)
    .select()
    .single();
  
  if (updateError) {
    console.error('❌ Failed to reset enrichment status:', updateError.message);
    return;
  }
  
  console.log('✅ Enrichment status reset to: not_started');
  console.log('\nTo trigger enrichment, you can:');
  console.log('1. Use the web UI and click "Enrich" button');
  console.log('2. Call the API endpoint: POST /api/conversations/${conversationId}/enrich');
  console.log('3. Run the batch processor (if configured)');
  
  console.log('\n--- Manual API Call (if server is running) ---');
  console.log('You can manually trigger enrichment with:');
  console.log(`\nfetch('http://localhost:3000/api/conversations/${TEST_CONVERSATION_ID}/enrich', {`);
  console.log(`  method: 'POST',`);
  console.log(`  headers: { 'Content-Type': 'application/json' }`);
  console.log(`})`);
  
  console.log('\n--- After enrichment completes ---');
  console.log('Run verification: node scripts/temp-check-files.js');
}

triggerEnrichment().catch(console.error);

