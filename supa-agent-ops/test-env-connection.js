/**
 * Test SAOL Environment Variables and Database Connection
 * This script tests if SAOL can access Supabase with the .env file
 */

require('dotenv').config();
const { agentQuery, agentExecuteSQL } = require('./dist/index');

async function testSAOL() {
  console.log('=================================================');
  console.log('SAOL Environment Variables Test');
  console.log('=================================================\n');

  // Check if environment variables are loaded
  console.log('Checking environment variables...');
  console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Loaded' : '✗ Missing'}`);
  console.log();

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Environment variables not loaded. Check .env file.');
    process.exit(1);
  }

  try {
    // Test 1: Simple query to verify connection
    console.log('Test 1: Basic connection test - counting conversations...');
    const result = await agentQuery({
      table: 'conversations',
      select: ['id', 'conversation_id', 'created_at'],
      limit: 5,
      count: true
    });
    
    console.log(`✓ Connection successful!`);
    console.log(`  Total conversations in database: ${result.count || 'N/A'}`);
    console.log(`  Retrieved ${result.data.length} records`);
    console.log();

    // Test 2: Diagnostic query to find conversation with specific ID
    console.log('Test 2: Diagnostic query - searching for conversation 501e3b87...');
    const diagnosticSQL = `
      SELECT 
        id,
        conversation_id,
        created_at,
        file_path,
        raw_response_path,
        processing_status,
        created_by
      FROM conversations 
      WHERE id::text LIKE '501e3b87%' 
         OR conversation_id::text LIKE '501e3b87%'
      ORDER BY created_at DESC
      LIMIT 5;
    `;
    
    const diagResult = await agentExecuteSQL({ sql: diagnosticSQL, transport: 'rpc' });
    console.log(`✓ Diagnostic query executed`);
    console.log(`  Records found: ${diagResult.rows ? diagResult.rows.length : 0}`);
    
    if (diagResult.rows && diagResult.rows.length > 0) {
      console.log('\n  Results:');
      diagResult.rows.forEach((row, idx) => {
        console.log(`  [${idx + 1}]`);
        console.log(`    id: ${row.id}`);
        console.log(`    conversation_id: ${row.conversation_id || 'NULL ❌'}`);
        console.log(`    created_at: ${row.created_at}`);
        console.log(`    file_path: ${row.file_path ? '✓ Present' : '✗ Missing'}`);
        console.log(`    raw_response_path: ${row.raw_response_path ? '✓ Present' : '✗ Missing'}`);
        console.log(`    processing_status: ${row.processing_status}`);
        console.log(`    created_by: ${row.created_by}`);
      });
    } else {
      console.log('  No conversations found with ID containing 501e3b87');
    }
    console.log();

    // Test 3: Count NULL conversation_id records
    console.log('Test 3: Checking for NULL conversation_id records...');
    const nullCheckSQL = `
      SELECT 
        COUNT(*) as total_conversations,
        COUNT(conversation_id) as with_conversation_id,
        COUNT(*) - COUNT(conversation_id) as null_conversation_id
      FROM conversations;
    `;
    
    const nullCheck = await agentExecuteSQL({ sql: nullCheckSQL, transport: 'rpc' });
    console.log(`✓ NULL check query executed`);
    if (nullCheck.rows && nullCheck.rows.length > 0) {
      const stats = nullCheck.rows[0];
      console.log(`  Total conversations: ${stats.total_conversations}`);
      console.log(`  With conversation_id: ${stats.with_conversation_id}`);
      console.log(`  NULL conversation_id: ${stats.null_conversation_id}`);
      
      if (stats.null_conversation_id > 0) {
        console.log(`\n  ⚠️  WARNING: ${stats.null_conversation_id} conversations have NULL conversation_id!`);
      } else {
        console.log(`\n  ✓ All conversations have conversation_id populated`);
      }
    }
    console.log();

    // Test 4: Get most recent conversations
    console.log('Test 4: Fetching 5 most recent conversations...');
    const recentSQL = `
      SELECT 
        id,
        conversation_id,
        raw_response_path,
        file_path,
        processing_status,
        created_at
      FROM conversations 
      WHERE raw_response_path IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 5;
    `;
    
    const recentResult = await agentExecuteSQL({ sql: recentSQL, transport: 'rpc' });
    console.log(`✓ Recent conversations query executed`);
    console.log(`  Records found: ${recentResult.rows ? recentResult.rows.length : 0}`);
    
    if (recentResult.rows && recentResult.rows.length > 0) {
      console.log('\n  Most recent conversations:');
      recentResult.rows.forEach((row, idx) => {
        console.log(`  [${idx + 1}] ${row.conversation_id || 'NULL'} (id: ${row.id}) - ${row.processing_status}`);
      });
    }
    console.log();

    console.log('=================================================');
    console.log('✓ All tests passed! SAOL is working correctly.');
    console.log('=================================================');

  } catch (error) {
    console.error('\n❌ Error during testing:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testSAOL();
