/**
 * Re-run enrichment on a specific conversation to test fixes
 * This will trigger the enrichment pipeline API endpoint
 */

require('../load-env.js');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test conversation from context document
const TEST_CONVERSATION_ID = '1a86807b-f74e-44bf-9782-7f1c27814fbd';

async function reEnrichConversation() {
  console.log('=== RE-ENRICHMENT TEST ===\n');
  console.log(`Target conversation: ${TEST_CONVERSATION_ID}`);
  
  // Get conversation details
  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .select('conversation_id, user_id, file_path, enriched_file_path, enrichment_status')
    .eq('conversation_id', TEST_CONVERSATION_ID)
    .single();
  
  if (convError || !conv) {
    console.error('❌ Failed to fetch conversation:', convError?.message);
    return;
  }
  
  console.log(`\nCurrent state:`);
  console.log(`  user_id: ${conv.user_id}`);
  console.log(`  file_path: ${conv.file_path}`);
  console.log(`  enriched_file_path: ${conv.enriched_file_path}`);
  console.log(`  enrichment_status: ${conv.enrichment_status}`);
  
  // Import the orchestrator service
  console.log('\n--- Running enrichment pipeline ---');
  
  try {
    // We need to dynamically import the TypeScript service
    // For now, let's make a direct API call to the enrichment endpoint
    const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('supabase.co', 'vercel.app') || 'http://localhost:3000'}/api/conversations/${TEST_CONVERSATION_ID}/enrich`;
    
    console.log(`\nNote: To trigger enrichment, call the API endpoint:`);
    console.log(`POST ${apiUrl}`);
    console.log(`\nOr run the enrichment pipeline directly using the orchestrator service in your application.`);
    console.log(`\nFor testing purposes, let's use a direct service call instead...`);
    
    // Import the EnrichmentPipelineOrchestrator
    const { EnrichmentPipelineOrchestrator } = require('../src/lib/services/enrichment-pipeline-orchestrator.ts');
    const orchestrator = new EnrichmentPipelineOrchestrator();
    
    const result = await orchestrator.runPipeline(TEST_CONVERSATION_ID, conv.user_id);
    
    console.log('\n--- Pipeline Result ---');
    console.log(`Success: ${result.success}`);
    console.log(`Final Status: ${result.finalStatus}`);
    console.log(`Stages Completed: ${result.stagesCompleted?.join(', ')}`);
    
    if (result.error) {
      console.error(`Error: ${result.error}`);
    }
    
    if (result.success) {
      console.log('\n✅ Enrichment completed successfully!');
      console.log('\nRun the verification script to check results:');
      console.log('  node scripts/temp-check-files.js');
    }
    
  } catch (error) {
    console.error('\n❌ Failed to run enrichment:', error.message);
    console.log('\nAlternatively, you can trigger enrichment via the web UI or API endpoint.');
  }
}

reEnrichConversation().catch(console.error);

