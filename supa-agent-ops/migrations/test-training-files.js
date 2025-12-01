/**
 * SAOL Test: Verify training files system
 * Run with: node supa-agent-ops/migrations/test-training-files.js
 */

require('dotenv').config({ path: '../../.env.local' });
const { agentIntrospectSchema, agentQuery, agentCount } = require('../dist/index.js');

async function testDatabaseSchema() {
  console.log('\n📋 Testing Database Schema...');
  
  try {
    // Test training_files table
    const filesResult = await agentIntrospectSchema({
      table: 'training_files',
      includeColumns: true,
      transport: 'pg'
    });
    
    if (!filesResult.success || !filesResult.tables[0]?.exists) {
      console.error('❌ training_files table not accessible');
      return false;
    }
    
    console.log('✅ training_files table exists');
    
    // Test training_file_conversations table
    const convsResult = await agentIntrospectSchema({
      table: 'training_file_conversations',
      includeColumns: true,
      transport: 'pg'
    });
    
    if (!convsResult.success || !convsResult.tables[0]?.exists) {
      console.error('❌ training_file_conversations table not accessible');
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
    // Query storage buckets
    const queryResult = await agentQuery({
      table: 'storage.buckets',
      where: [{ column: 'id', operator: 'eq', value: 'training-files' }],
      limit: 1,
      transport: 'pg'
    });
    
    if (!queryResult.success || !queryResult.data || queryResult.data.length === 0) {
      console.error('❌ training-files bucket not found');
      console.log('💡 Create bucket with:');
      console.log('   node supa-agent-ops/migrations/setup-training-files-bucket.js');
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
    console.log('  Testing training_files table...');
    const countResult = await agentCount({
      table: 'training_files',
      transport: 'pg'
    });
    
    if (!countResult.success) {
      console.error('  ❌ Could not count training files');
      return false;
    }
    
    console.log(`  ✅ Found ${countResult.count} training files`);
    
    // Test 2: Check for enriched conversations
    console.log('\n  Checking for enriched conversations...');
    const convCount = await agentCount({
      table: 'conversations',
      where: [
        { column: 'enrichment_status', operator: 'eq', value: 'completed' }
      ],
      transport: 'pg'
    });
    
    if (!convCount.success) {
      console.log('  ⚠️  Could not check conversations');
      return true;
    }
    
    if (convCount.count === 0) {
      console.log('  ⚠️  No enriched conversations found');
      console.log('  💡 Create test conversations with:');
      console.log('     - enrichment_status = \'completed\'');
      console.log('     - enriched_file_path set to valid storage path');
      return true; // Not a failure, just no test data
    }
    
    console.log(`  ✅ Found ${convCount.count} enriched conversations`);
    
    // Show a few examples
    const sampleConvs = await agentQuery({
      table: 'conversations',
      select: ['conversation_id', 'persona_key', 'emotional_arc_key', 'topic_key'],
      where: [
        { column: 'enrichment_status', operator: 'eq', value: 'completed' }
      ],
      limit: 5,
      transport: 'pg'
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
    const schema = await agentIntrospectSchema({
      table: 'training_files',
      includeColumns: true,
      transport: 'pg'
    });
    
    if (!schema.success) {
      console.error('❌ Could not introspect schema');
      return false;
    }
    
    const table = schema.tables[0];
    if (!table || !table.exists) {
      console.error('❌ training_files table not found in schema');
      return false;
    }
    
    // Check key columns
    const requiredColumns = [
      'id', 'name', 'json_file_path', 'jsonl_file_path',
      'conversation_count', 'total_training_pairs',
      'scaffolding_distribution', 'status', 'created_at'
    ];
    
    const missingColumns = requiredColumns.filter(col => 
      !table.columns.some(c => c.name === col)
    );
    
    if (missingColumns.length > 0) {
      console.error('❌ Missing required columns:', missingColumns.join(', '));
      return false;
    }
    
    console.log('✅ All required columns present');
    console.log(`  Total columns: ${table.columns.length}`);
    
    return true;
  } catch (error) {
    console.error('❌ Structure test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Training Files System Tests (SAOL)\n');
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
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.\n');
    console.log('Common issues:');
    console.log('  - Run migration: node supa-agent-ops/migrations/create-training-files-tables.js');
    console.log('  - Create storage bucket: node supa-agent-ops/migrations/setup-training-files-bucket.js');
    console.log('  - Ensure enriched conversations exist');
  }
  
  console.log('');
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test runner failed:', error.message);
  process.exit(1);
});
