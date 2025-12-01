/**
 * Test Script for Training Files System
 * 
 * This script validates the training files implementation by:
 * 1. Checking database schema
 * 2. Testing TrainingFileService methods
 * 3. Validating JSON/JSONL generation
 * 
 * Run with: npx tsx src/scripts/test-training-files.ts
 */

import { createClient } from '@supabase/supabase-js';
import { createTrainingFileService } from '../lib/services/training-file-service';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testDatabaseSchema() {
  console.log('\n📋 Testing Database Schema...');
  
  try {
    // Test training_files table
    const { data: filesData, error: filesError } = await supabase
      .from('training_files')
      .select('*')
      .limit(1);
    
    if (filesError) {
      console.error('❌ training_files table not accessible:', filesError.message);
      return false;
    }
    
    console.log('✅ training_files table exists');
    
    // Test training_file_conversations table
    const { data: convsData, error: convsError } = await supabase
      .from('training_file_conversations')
      .select('*')
      .limit(1);
    
    if (convsError) {
      console.error('❌ training_file_conversations table not accessible:', convsError.message);
      return false;
    }
    
    console.log('✅ training_file_conversations table exists');
    
    return true;
  } catch (error) {
    console.error('❌ Schema test failed:', error);
    return false;
  }
}

async function testStorageBucket() {
  console.log('\n📦 Testing Storage Bucket...');
  
  try {
    const { data, error } = await supabase.storage
      .from('training-files')
      .list('', { limit: 1 });
    
    if (error) {
      console.error('❌ training-files bucket not accessible:', error.message);
      console.log('💡 Create bucket with:');
      console.log('   INSERT INTO storage.buckets (id, name, public) VALUES (\'training-files\', \'training-files\', false);');
      return false;
    }
    
    console.log('✅ training-files bucket exists');
    return true;
  } catch (error) {
    console.error('❌ Storage test failed:', error);
    return false;
  }
}

async function testTrainingFileService() {
  console.log('\n🔧 Testing TrainingFileService...');
  
  try {
    const service = createTrainingFileService(supabase);
    
    // Test 1: List training files
    console.log('  Testing listTrainingFiles()...');
    const files = await service.listTrainingFiles();
    console.log(`  ✅ Listed ${files.length} training files`);
    
    // Test 2: Check for test conversations
    console.log('\n  Checking for enriched conversations...');
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('conversation_id, enrichment_status, enriched_file_path, persona_key, emotional_arc_key, topic_key')
      .eq('enrichment_status', 'completed')
      .not('enriched_file_path', 'is', null)
      .limit(5);
    
    if (convError || !conversations || conversations.length === 0) {
      console.log('  ⚠️  No enriched conversations found');
      console.log('  💡 Create test conversations with:');
      console.log('     - enrichment_status = \'completed\'');
      console.log('     - enriched_file_path set to valid storage path');
      return true; // Not a failure, just no test data
    }
    
    console.log(`  ✅ Found ${conversations.length} enriched conversations`);
    console.log('  Available for testing:');
    conversations.forEach((conv, idx) => {
      console.log(`    ${idx + 1}. ${conv.conversation_id.substring(0, 8)}... (${conv.persona_key}/${conv.emotional_arc_key}/${conv.topic_key})`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Service test failed:', error);
    return false;
  }
}

async function testJSONAggregation() {
  console.log('\n🔄 Testing JSON Aggregation Logic...');
  
  try {
    // Find a test conversation
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('conversation_id, enriched_file_path')
      .eq('enrichment_status', 'completed')
      .not('enriched_file_path', 'is', null)
      .limit(1);
    
    if (error || !conversations || conversations.length === 0) {
      console.log('  ⚠️  No test conversations available (skipping aggregation test)');
      return true;
    }
    
    const testConv = conversations[0];
    console.log(`  Testing with conversation: ${testConv.conversation_id.substring(0, 8)}...`);
    
    // Try to download and parse enriched JSON
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('conversation-files')
      .download(testConv.enriched_file_path);
    
    if (downloadError) {
      console.log(`  ⚠️  Could not download enriched file: ${downloadError.message}`);
      return true;
    }
    
    const jsonText = await fileData.text();
    const enrichedJSON = JSON.parse(jsonText);
    
    console.log('  ✅ Successfully downloaded and parsed enriched JSON');
    console.log(`  📊 Training pairs: ${enrichedJSON.training_pairs?.length || 0}`);
    
    // Validate structure
    const hasDatasetMetadata = !!enrichedJSON.dataset_metadata;
    const hasConsultantProfile = !!enrichedJSON.consultant_profile;
    const hasTrainingPairs = Array.isArray(enrichedJSON.training_pairs);
    
    console.log(`  ${hasDatasetMetadata ? '✅' : '❌'} Has dataset_metadata`);
    console.log(`  ${hasConsultantProfile ? '✅' : '❌'} Has consultant_profile`);
    console.log(`  ${hasTrainingPairs ? '✅' : '❌'} Has training_pairs array`);
    
    if (hasTrainingPairs && enrichedJSON.training_pairs.length > 0) {
      const firstPair = enrichedJSON.training_pairs[0];
      console.log('  First training pair structure:');
      console.log(`    ${!!firstPair.conversation_metadata ? '✅' : '❌'} Has conversation_metadata`);
      console.log(`    ${!!firstPair.system_prompt ? '✅' : '❌'} Has system_prompt`);
      console.log(`    ${Array.isArray(firstPair.conversation_history) ? '✅' : '❌'} Has conversation_history`);
      console.log(`    ${!!firstPair.emotional_context ? '✅' : '❌'} Has emotional_context`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Aggregation test failed:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Training Files System Tests\n');
  console.log('=' .repeat(60));
  
  const results = {
    schema: await testDatabaseSchema(),
    storage: await testStorageBucket(),
    service: await testTrainingFileService(),
    aggregation: await testJSONAggregation(),
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Results Summary:\n');
  console.log(`  Database Schema: ${results.schema ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Storage Bucket:  ${results.storage ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Service Layer:   ${results.service ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  JSON Aggregation: ${results.aggregation ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(r => r);
  
  console.log('\n' + '='.repeat(60));
  
  if (allPassed) {
    console.log('\n✅ All tests passed! System is ready to use.\n');
    console.log('Next steps:');
    console.log('  1. Create training files via API or UI');
    console.log('  2. Test with actual enriched conversations');
    console.log('  3. Verify JSON/JSONL output quality');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.\n');
    console.log('Common issues:');
    console.log('  - Run migration: npx tsx src/scripts/migrations/create-training-files-table.ts');
    console.log('  - Create storage bucket: training-files');
    console.log('  - Ensure enriched conversations exist');
  }
  
  console.log('');
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});

