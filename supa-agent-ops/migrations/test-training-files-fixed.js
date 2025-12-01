/**
 * SAOL Test: Verify training files system (FIXED)
 * Run with: node supa-agent-ops/migrations/test-training-files-fixed.js
 * 
 * This version uses 'supabase' transport instead of 'pg' to work without DATABASE_URL
 */

require('dotenv').config({ path: '../../.env.local' });
const { agentQuery, agentCount } = require('../dist/index.js');

// Verify environment variables loaded
console.log('\n🔍 Environment Check:');
console.log(`  SUPABASE_URL: ${process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Found' : '❌ Missing'}`);
console.log(`  SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Found' : '❌ Missing'}`);
console.log('');

async function testDatabaseSchema() {
  console.log('\n📋 Testing Database Schema...');
  
  try {
    // Test training_files table by querying it
    const filesResult = await agentQuery({
      table: 'training_files',
      limit: 1
    });
    
    if (!filesResult.success) {
      console.error('❌ training_files table not accessible:', filesResult.summary);
      return false;
    }
    
    console.log('✅ training_files table exists');
    
    // Test training_file_conversations table
    const convsResult = await agentQuery({
      table: 'training_file_conversations',
      limit: 1
    });
    
    if (!convsResult.success) {
      console.error('❌ training_file_conversations table not accessible:', convsResult.summary);
      return false;
    }
    
    console.log('✅ training_file_conversations table exists');
    
    return true;
  } catch (error) {
    console.error('❌ Schema test failed:', error.message);
    return false;
  }
}

async function testStorageBucket() {
  console.log('\n📦 Testing Storage Bucket...');
  
  try {
    // Query storage buckets (using public schema access)
    const queryResult = await agentQuery({
      table: 'storage.buckets',
      where: [{ column: 'id', operator: 'eq', value: 'training-files' }],
      limit: 1
    });
    
    if (!queryResult.success || !queryResult.data || queryResult.data.length === 0) {
      console.error('❌ training-files bucket not found');
      console.log('💡 Create bucket with SQL script:');
      console.log('   supa-agent-ops/migrations/02-create-training-files-bucket.sql');
      return false;
    }
    
    console.log('✅ training-files bucket exists');
    return true;
  } catch (error) {
    console.error('❌ Storage test failed:', error.message);
    return false;
  }
}

async function testTrainingFileService() {
  console.log('\n🔧 Testing Training File Service...');
  
  try {
    // Test 1: Count training files
    console.log('  Counting training files...');
    const countResult = await agentCount({
      table: 'training_files'
    });
    
    if (!countResult.success) {
      console.error('  ❌ Could not count training files:', countResult.summary);
      return false;
    }
    
    console.log(`  ✅ Found ${countResult.count} training files`);
    
    // Test 2: Check for enriched conversations
    console.log('\n  Checking for enriched conversations...');
    const convCount = await agentCount({
      table: 'conversations',
      where: [
        { column: 'enrichment_status', operator: 'eq', value: 'completed' }
      ]
    });
    
    if (!convCount.success) {
      console.log('  ⚠️  Could not check conversations (table may not exist yet)');
      return true; // Not a failure if conversations table doesn't exist
    }
    
    if (convCount.count === 0) {
      console.log('  ⚠️  No enriched conversations found');
      console.log('  💡 This is OK if you haven\'t created conversations yet');
      return true;
    }
    
    console.log(`  ✅ Found ${convCount.count} enriched conversations`);
    
    // Show a few examples
    const sampleConvs = await agentQuery({
      table: 'conversations',
      select: ['conversation_id', 'persona_key', 'emotional_arc_key', 'topic_key'],
      where: [
        { column: 'enrichment_status', operator: 'eq', value: 'completed' }
      ],
      limit: 5
    });
    
    if (sampleConvs.success && sampleConvs.data && sampleConvs.data.length > 0) {
      console.log('  Available for testing:');
      sampleConvs.data.forEach((conv, idx) => {
        const id = conv.conversation_id ? conv.conversation_id.substring(0, 8) : 'unknown';
        console.log(`    ${idx + 1}. ${id}... (${conv.persona_key}/${conv.emotional_arc_key}/${conv.topic_key})`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Service test failed:', error.message);
    return false;
  }
}

async function testTableStructure() {
  console.log('\n🔍 Testing Table Structure...');
  
  try {
    // Query the table to verify basic structure
    const result = await agentQuery({
      table: 'training_files',
      limit: 0 // Just checking if we can query it
    });
    
    if (!result.success) {
      console.error('❌ Could not query training_files');
      return false;
    }
    
    console.log('✅ training_files table is queryable');
    console.log('  💡 For detailed schema info, run the SQL validation script:');
    console.log('     supa-agent-ops/migrations/validate-installation.sql');
    
    return true;
  } catch (error) {
    console.error('❌ Structure test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Training Files System Tests (SAOL - Fixed)\n');
  console.log('=' .repeat(60));
  
  const results = {
    schema: await testDatabaseSchema(),
    storage: await testStorageBucket(),
    service: await testTrainingFileService(),
    structure: await testTableStructure(),
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Results Summary:\n');
  console.log(`  Database Schema:  ${results.schema ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Storage Bucket:   ${results.storage ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Service Layer:    ${results.service ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Table Structure:  ${results.structure ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(r => r);
  
  console.log('\n' + '='.repeat(60));
  
  if (allPassed) {
    console.log('\n✅ All tests passed! System is ready to use.\n');
    console.log('Next steps:');
    console.log('  1. Create training files via API or UI');
    console.log('  2. Test with actual enriched conversations');
    console.log('  3. Verify JSON/JSONL output quality');
    console.log('\nFor detailed schema validation, run:');
    console.log('  Paste supa-agent-ops/migrations/validate-installation.sql into Supabase SQL Editor');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.\n');
    console.log('Common issues:');
    console.log('  - Tables not created: Run SQL from 01-create-training-files-tables.sql');
    console.log('  - Bucket not created: Run SQL from 02-create-training-files-bucket.sql');
    console.log('  - For detailed validation: Run validate-installation.sql in Supabase');
  }
  
  console.log('');
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test runner failed:', error.message);
  process.exit(1);
});

