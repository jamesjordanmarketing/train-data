/**
 * Integration Test: Complete Pipeline Flow
 * 
 * Tests the full flow from conversation generation to enrichment
 * 
 * This script:
 * 1. Generates a test conversation
 * 2. Waits for enrichment pipeline to complete
 * 3. Verifies enriched file is created
 * 4. Downloads and validates enriched JSON
 * 
 * Usage:
 *   npx tsx test-pipeline-integration.ts
 */

import { ConversationGenerationService } from './src/lib/services/conversation-generation-service';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function testIntegration() {
  console.log('='.repeat(80));
  console.log('INTEGRATION TEST: Complete Pipeline Flow');
  console.log('='.repeat(80));
  console.log('');

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const generationService = new ConversationGenerationService();

  // Test user ID
  const testUserId = '00000000-0000-0000-0000-000000000001';

  try {
    // STEP 1: Generate conversation
    console.log('📝 Step 1: Generating test conversation...');
    
    const generationParams = {
      templateId: 'test-template',
      userId: testUserId,
      tier: 'template' as const,
      parameters: {
        persona_id: 'test-persona',
        emotional_arc_id: 'test-arc',
        training_topic_id: 'test-topic'
      }
    };

    const generationResult = await generationService.generateSingleConversation(generationParams);

    if (!generationResult.success) {
      throw new Error(`Generation failed: ${generationResult.error}`);
    }

    const conversationId = generationResult.conversationId!;
    console.log(`✅ Conversation generated: ${conversationId}`);
    console.log('');

    // STEP 2: Wait for enrichment to complete
    console.log('⏳ Step 2: Waiting for enrichment pipeline to complete...');
    console.log('   (Pipeline runs asynchronously after generation)');
    console.log('');

    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout
    let enrichmentComplete = false;

    while (attempts < maxAttempts && !enrichmentComplete) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      attempts++;

      // Check enrichment status
      const { data: conversation } = await supabase
        .from('conversations')
        .select('enrichment_status, enriched_file_path, enrichment_error')
        .eq('conversation_id', conversationId)
        .single();

      if (conversation) {
        const status = conversation.enrichment_status;
        process.stdout.write(`   [${attempts}s] Status: ${status}\r`);

        if (status === 'completed') {
          enrichmentComplete = true;
          console.log('\n');
          console.log(`✅ Enrichment completed in ${attempts} seconds`);
        } else if (['validation_failed', 'normalization_failed'].includes(status)) {
          console.log('\n');
          console.log(`❌ Enrichment failed with status: ${status}`);
          console.log(`   Error: ${conversation.enrichment_error}`);
          throw new Error(`Enrichment failed: ${status}`);
        }
      }
    }

    if (!enrichmentComplete) {
      throw new Error('Enrichment timeout (30 seconds)');
    }

    console.log('');

    // STEP 3: Verify enriched file exists
    console.log('📁 Step 3: Verifying enriched file...');

    const { data: conversation } = await supabase
      .from('conversations')
      .select('enriched_file_path, enriched_file_size')
      .eq('conversation_id', conversationId)
      .single();

    if (!conversation?.enriched_file_path) {
      throw new Error('Enriched file path not found in database');
    }

    console.log(`   Path: ${conversation.enriched_file_path}`);
    console.log(`   Size: ${conversation.enriched_file_size} bytes`);
    console.log('');

    // STEP 4: Download and validate enriched JSON
    console.log('⬇️  Step 4: Downloading enriched JSON...');

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('conversation-files')
      .download(conversation.enriched_file_path);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download enriched file: ${downloadError?.message}`);
    }

    const enrichedJson = await fileData.text();
    const enriched = JSON.parse(enrichedJson);

    console.log('✅ Enriched file downloaded and parsed');
    console.log('');

    // STEP 5: Validate enriched structure
    console.log('🔍 Step 5: Validating enriched structure...');

    const validations = [
      { name: 'Has dataset_metadata', check: !!enriched.dataset_metadata },
      { name: 'Has consultant_profile', check: !!enriched.consultant_profile },
      { name: 'Has training_pairs array', check: Array.isArray(enriched.training_pairs) },
      { name: 'Has at least 1 training pair', check: enriched.training_pairs.length > 0 },
      { name: 'Dataset name matches format', check: enriched.dataset_metadata?.dataset_name?.includes(conversationId) },
      { name: 'Consultant name exists', check: !!enriched.consultant_profile?.name },
      { name: 'First training pair has ID', check: !!enriched.training_pairs[0]?.id },
      { name: 'First training pair has system_prompt', check: !!enriched.training_pairs[0]?.system_prompt },
      { name: 'First training pair has emotional_context', check: !!enriched.training_pairs[0]?.emotional_context },
      { name: 'First training pair has training_metadata', check: !!enriched.training_pairs[0]?.training_metadata }
    ];

    let allValid = true;
    validations.forEach(validation => {
      const status = validation.check ? '✅' : '❌';
      console.log(`   ${status} ${validation.name}`);
      if (!validation.check) allValid = false;
    });

    console.log('');

    if (!allValid) {
      throw new Error('Enriched structure validation failed');
    }

    // SUCCESS
    console.log('='.repeat(80));
    console.log('✅ INTEGRATION TEST PASSED');
    console.log('='.repeat(80));
    console.log('');
    console.log('Summary:');
    console.log(`  Conversation ID: ${conversationId}`);
    console.log(`  Training Pairs: ${enriched.training_pairs.length}`);
    console.log(`  File Size: ${conversation.enriched_file_size} bytes`);
    console.log(`  Enrichment Time: ~${attempts} seconds`);
    console.log('');
    console.log('The complete pipeline is working correctly:');
    console.log('  1. ✅ Conversation generated');
    console.log('  2. ✅ Raw response stored');
    console.log('  3. ✅ Enrichment pipeline triggered automatically');
    console.log('  4. ✅ Validation passed');
    console.log('  5. ✅ Enrichment completed');
    console.log('  6. ✅ Normalization successful');
    console.log('  7. ✅ Enriched file stored');
    console.log('  8. ✅ Structure validated');
    console.log('');
    console.log('='.repeat(80));

    process.exit(0);

  } catch (error) {
    console.error('');
    console.error('='.repeat(80));
    console.error('❌ INTEGRATION TEST FAILED');
    console.error('='.repeat(80));
    console.error('');
    console.error('Error:', error instanceof Error ? error.message : error);
    console.error('');
    process.exit(1);
  }
}

// Run integration test
testIntegration().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

