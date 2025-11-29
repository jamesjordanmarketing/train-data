/**
 * Directly run enrichment pipeline on test conversation
 * This script directly instantiates the orchestrator service
 */

require('../load-env.js');
const { createClient } = require('@supabase/supabase-js');

// Test conversation from context document
const TEST_CONVERSATION_ID = '1a86807b-f74e-44bf-9782-7f1c27814fbd';

async function runEnrichment() {
  console.log('=== DIRECT ENRICHMENT PIPELINE TEST ===\n');
  console.log(`Target conversation: ${TEST_CONVERSATION_ID}\n`);
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  // Get conversation details
  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .select('conversation_id, created_by, file_path, enriched_file_path, enrichment_status')
    .eq('conversation_id', TEST_CONVERSATION_ID)
    .single();
  
  if (convError || !conv) {
    console.error('❌ Failed to fetch conversation:', convError?.message);
    return;
  }
  
  console.log('Current conversation state:');
  console.log(`  created_by (user_id): ${conv.created_by}`);
  console.log(`  file_path: ${conv.file_path}`);
  console.log(`  enriched_file_path: ${conv.enriched_file_path || 'null'}`);
  console.log(`  enrichment_status: ${conv.enrichment_status}\n`);
  
  // Import and instantiate the orchestrator
  // Note: This requires the TypeScript to be transpiled or we use ts-node
  console.log('--- Attempting to load orchestrator service ---');
  
  try {
    // Try to load the compiled JavaScript version
    const { EnrichmentPipelineOrchestrator } = require('../src/lib/services/enrichment-pipeline-orchestrator.ts');
    
    const orchestrator = new EnrichmentPipelineOrchestrator();
    
    console.log('✅ Orchestrator loaded\n');
    console.log('--- Running enrichment pipeline ---\n');
    
    const result = await orchestrator.runPipeline(
      TEST_CONVERSATION_ID,
      conv.created_by || '00000000-0000-0000-0000-000000000000'
    );
    
    console.log('\n--- Pipeline Result ---');
    console.log(`Success: ${result.success}`);
    console.log(`Final Status: ${result.finalStatus}`);
    
    if (result.stagesCompleted && result.stagesCompleted.length > 0) {
      console.log(`Stages Completed: ${result.stagesCompleted.join(', ')}`);
    }
    
    if (result.enrichedPath) {
      console.log(`Enriched Path: ${result.enrichedPath}`);
    }
    
    if (result.enrichedSize) {
      console.log(`Enriched Size: ${result.enrichedSize} bytes`);
    }
    
    if (result.error) {
      console.error(`\n❌ Error: ${result.error}`);
    }
    
    if (result.success) {
      console.log('\n✅ Enrichment completed successfully!');
      console.log('\n--- Next Step: Verify Results ---');
      console.log('Run: node scripts/temp-check-files.js');
      console.log('Or: node scripts/test-enrichment-pipeline.js');
    } else {
      console.log('\n❌ Enrichment failed');
    }
    
  } catch (error) {
    console.error('❌ Failed to load or run orchestrator:', error.message);
    console.log('\nThis might be because:');
    console.log('1. TypeScript files need to be transpiled');
    console.log('2. ts-node is not installed');
    console.log('3. Module resolution issues\n');
    
    console.log('Alternative: Start your Next.js dev server and use the API:');
    console.log(`  curl -X POST http://localhost:3000/api/conversations/${TEST_CONVERSATION_ID}/enrich`);
  }
}

runEnrichment().catch(console.error);

