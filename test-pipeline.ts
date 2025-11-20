/**
 * Test script for Enrichment Pipeline Orchestrator
 * 
 * Tests the complete enrichment pipeline from raw JSON to enriched JSON
 * 
 * Usage:
 *   npx tsx test-pipeline.ts <conversation_id> <user_id>
 * 
 * Example:
 *   npx tsx test-pipeline.ts test-conv-001 00000000-0000-0000-0000-000000000001
 */

import { getPipelineOrchestrator } from './src/lib/services/enrichment-pipeline-orchestrator';

async function testPipeline() {
  const conversationId = process.argv[2];
  const userId = process.argv[3];

  if (!conversationId || !userId) {
    console.error('❌ Usage: npx tsx test-pipeline.ts <conversation_id> <user_id>');
    console.error('   Example: npx tsx test-pipeline.ts test-conv-001 00000000-0000-0000-0000-000000000001');
    process.exit(1);
  }

  console.log('='.repeat(80));
  console.log('TEST: Enrichment Pipeline Orchestrator');
  console.log('='.repeat(80));
  console.log('Conversation ID:', conversationId);
  console.log('User ID:', userId);
  console.log('');

  try {
    const orchestrator = getPipelineOrchestrator();
    
    console.log('🚀 Running complete enrichment pipeline...\n');
    const startTime = Date.now();
    
    const result = await orchestrator.runPipeline(conversationId, userId);
    
    const durationMs = Date.now() - startTime;
    const durationSec = (durationMs / 1000).toFixed(2);

    console.log('\n' + '='.repeat(80));
    console.log('PIPELINE RESULT');
    console.log('='.repeat(80));
    console.log('Success:', result.success ? '✅ YES' : '❌ NO');
    console.log('Final Status:', result.finalStatus);
    console.log('Stages Completed:', result.stagesCompleted.join(' → '));
    console.log('Duration:', `${durationSec}s`);
    console.log('');

    if (result.success) {
      console.log('✅ ENRICHMENT SUCCESSFUL');
      console.log('');
      console.log('Enriched File Path:', result.enrichedPath);
      console.log('Enriched File Size:', result.enrichedSize, 'bytes');
      console.log('');
      console.log('Next Steps:');
      console.log('1. Check Supabase Storage: conversation-files bucket');
      console.log('2. Verify enriched.json file exists at:', result.enrichedPath);
      console.log('3. Check database: enrichment_status should be "completed"');
      console.log('4. Download enriched file via API: GET /api/conversations/' + conversationId + '/download/enriched');
    } else {
      console.log('❌ ENRICHMENT FAILED');
      console.log('');
      console.log('Error:', result.error);
      
      if (result.validationReport) {
        console.log('');
        console.log('Validation Report:');
        console.log('  Summary:', result.validationReport.summary);
        console.log('  Blockers:', result.validationReport.blockers.length);
        console.log('  Warnings:', result.validationReport.warnings.length);
        
        if (result.validationReport.blockers.length > 0) {
          console.log('');
          console.log('Blocking Issues:');
          result.validationReport.blockers.forEach((blocker: any, i: number) => {
            console.log(`  ${i + 1}. [${blocker.code}] ${blocker.field}`);
            console.log(`     ${blocker.message}`);
            if (blocker.suggestion) {
              console.log(`     💡 ${blocker.suggestion}`);
            }
          });
        }
      }
      
      console.log('');
      console.log('Troubleshooting:');
      console.log('1. Check if raw_response_path exists in database');
      console.log('2. Verify raw JSON is valid');
      console.log('3. Check validation report for specific issues');
      console.log('4. View full logs above for detailed error messages');
    }

    console.log('');
    console.log('='.repeat(80));

    process.exit(result.success ? 0 : 1);

  } catch (error) {
    console.error('\n❌ TEST FAILED WITH ERROR:');
    console.error(error);
    console.error('');
    process.exit(1);
  }
}

// Run test
testPipeline().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

