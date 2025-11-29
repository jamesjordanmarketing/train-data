/**
 * Test script to verify enrichment pipeline fixes
 * Run with: npx tsx src/scripts/test-enrichment-fix.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { getPipelineOrchestrator } from '../lib/services/enrichment-pipeline-orchestrator';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

// Test conversation from context document
const TEST_CONVERSATION_ID = '1a86807b-f74e-44bf-9782-7f1c27814fbd';

async function testEnrichmentFix() {
  console.log('=== ENRICHMENT PIPELINE FIX VERIFICATION ===\n');
  console.log(`Target conversation: ${TEST_CONVERSATION_ID}\n`);
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing environment variables');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
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
    process.exit(1);
  }
  
  console.log('Current conversation state:');
  console.log(`  created_by: ${conv.created_by}`);
  console.log(`  file_path: ${conv.file_path}`);
  console.log(`  enriched_file_path: ${conv.enriched_file_path || 'null'}`);
  console.log(`  enrichment_status: ${conv.enrichment_status}\n`);
  
  // Get the orchestrator instance
  console.log('--- Initializing pipeline orchestrator ---');
  const orchestrator = getPipelineOrchestrator();
  console.log('✅ Orchestrator initialized\n');
  
  // Run enrichment pipeline
  console.log('--- Running enrichment pipeline ---');
  console.log('This will test the following fixes:');
  console.log('  1. fetchParsedJson() now reads from file_path (with input_parameters)');
  console.log('  2. buildClientBackground() properly serializes JSONB demographics');
  console.log('  3. Scaffolding metadata is added to training pairs\n');
  
  const result = await orchestrator.runPipeline(
    TEST_CONVERSATION_ID,
    conv.created_by || '00000000-0000-0000-0000-000000000000'
  );
  
  console.log('\n--- Pipeline Result ---');
  console.log(`Success: ${result.success ? '✅' : '❌'}`);
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
    process.exit(1);
  }
  
  if (result.success) {
    console.log('\n✅ Enrichment completed successfully!');
    
    // Download and verify the enriched JSON
    console.log('\n--- Verifying Enriched JSON ---');
    
    const { data: enrichedFile, error: downloadError } = await supabase.storage
      .from('conversation-files')
      .download(result.enrichedPath!);
    
    if (downloadError || !enrichedFile) {
      console.error('❌ Failed to download enriched file:', downloadError?.message);
      process.exit(1);
    }
    
    const enrichedJson = JSON.parse(await enrichedFile.text());
    
    // Check for input_parameters
    console.log('\nTest 1: input_parameters present');
    const hasInputParams = !!enrichedJson.input_parameters;
    console.log(`  Result: ${hasInputParams ? '✅ PASS' : '❌ FAIL'}`);
    if (hasInputParams) {
      console.log(`  Fields: ${Object.keys(enrichedJson.input_parameters).join(', ')}`);
    }
    
    // Check for scaffolding metadata in first training pair
    console.log('\nTest 2: Scaffolding metadata in training pairs');
    const firstPair = enrichedJson.training_pairs?.[0];
    if (firstPair) {
      const metadata = firstPair.conversation_metadata;
      const checks = [
        { field: 'persona_archetype', value: metadata?.persona_archetype },
        { field: 'emotional_arc', value: metadata?.emotional_arc },
        { field: 'emotional_arc_key', value: metadata?.emotional_arc_key },
        { field: 'training_topic', value: metadata?.training_topic },
        { field: 'training_topic_key', value: metadata?.training_topic_key }
      ];
      
      checks.forEach(check => {
        const passed = !!check.value;
        console.log(`  ${check.field}: ${passed ? '✅' : '❌'} ${check.value || 'MISSING'}`);
      });
      
      const allPassed = checks.every(c => !!c.value);
      console.log(`  Result: ${allPassed ? '✅ PASS' : '❌ FAIL'}`);
    } else {
      console.log('  Result: ❌ FAIL - No training pairs found');
    }
    
    // Check client_background for [object Object]
    console.log('\nTest 3: client_background formatting');
    const clientBg = firstPair?.conversation_metadata?.client_background || '';
    const hasObjectObject = clientBg.includes('[object Object]');
    console.log(`  Has "[object Object]": ${hasObjectObject ? '❌ YES (FAIL)' : '✅ NO (PASS)'}`);
    
    if (clientBg.length > 0) {
      const preview = clientBg.length > 80 ? clientBg.substring(0, 80) + '...' : clientBg;
      console.log(`  Content preview: "${preview}"`);
    }
    console.log(`  Result: ${!hasObjectObject ? '✅ PASS' : '❌ FAIL'}`);
    
    // Final summary
    console.log('\n=== VERIFICATION SUMMARY ===');
    const allTestsPassed = hasInputParams && 
                           firstPair?.conversation_metadata?.persona_archetype &&
                           !hasObjectObject;
    
    if (allTestsPassed) {
      console.log('🎉 ALL TESTS PASSED! Fixes are working correctly.');
    } else {
      console.log('⚠️ SOME TESTS FAILED - Further investigation needed');
      process.exit(1);
    }
    
  } else {
    console.log('\n❌ Enrichment failed');
    process.exit(1);
  }
}

testEnrichmentFix().catch(error => {
  console.error('❌ Test script error:', error);
  process.exit(1);
});

