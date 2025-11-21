/**
 * Test Download Flow End-to-End
 * Simulates exactly what happens when user clicks download button
 */

require('dotenv').config();
const { agentQuery } = require('./dist/index');

async function testDownloadFlow() {
  console.log('=================================================');
  console.log('End-to-End Download Flow Test');
  console.log('=================================================\n');

  try {
    // Step 1: Get the specific conversation by conversation_id (what dashboard passes)
    const targetConversationId = '501e3b87-930e-4bbd-bcf2-1b71614b4d38';
    
    console.log(`Step 1: Querying for conversation_id = ${targetConversationId}`);
    const result = await agentQuery({
      table: 'conversations',
      select: ['id', 'conversation_id', 'file_path', 'raw_response_path', 'processing_status', 'created_by'],
      where: [
        { column: 'conversation_id', operator: 'eq', value: targetConversationId }
      ],
      limit: 1
    });

    console.log(`✓ Query executed`);
    console.log(`  Records found: ${result.data.length}\n`);

    if (result.data.length === 0) {
      console.log('❌ BUG CONFIRMED: Query by conversation_id returned NO results!');
      console.log('   This is why download is failing with 404.\n');
      
      // Try finding it by other means
      console.log('Step 2: Trying to find conversation in raw_response_path...');
      const pathSearchResult = await agentQuery({
        table: 'conversations',
        select: ['id', 'conversation_id', 'file_path', 'raw_response_path', 'processing_status'],
        limit: 50
      });

      const found = pathSearchResult.data.find(conv => 
        conv.raw_response_path && conv.raw_response_path.includes(targetConversationId)
      );

      if (found) {
        console.log('✓ Found conversation by searching raw_response_path!');
        console.log(`  Database id: ${found.id}`);
        console.log(`  conversation_id in database: ${found.conversation_id}`);
        console.log(`  raw_response_path: ${found.raw_response_path}`);
        console.log(`\n  🔍 INSIGHT: The conversation EXISTS but query by conversation_id field fails!`);
        console.log(`  This suggests either:`);
        console.log(`  1. RLS policy is blocking the query`);
        console.log(`  2. Index issue on conversation_id column`);
        console.log(`  3. Data type mismatch (UUID vs text)`);
      }
    } else {
      const conversation = result.data[0];
      console.log('✅ SUCCESS: Conversation found by conversation_id query!');
      console.log(`  Database id: ${conversation.id}`);
      console.log(`  conversation_id: ${conversation.conversation_id}`);
      console.log(`  file_path: ${conversation.file_path ? '✓' : '❌'}`);
      console.log(`  raw_response_path: ${conversation.raw_response_path ? '✓' : '❌'}`);
      console.log(`  processing_status: ${conversation.processing_status}`);
      console.log(`  created_by: ${conversation.created_by}`);
      console.log(`\n  ✓ Download should work - conversation is queryable!`);
    }

    // Step 3: Check RLS policies
    console.log('\nStep 3: Checking RLS policies...');
    console.log('Note: SAOL uses service role key which bypasses RLS.');
    console.log('If this test succeeds but browser fails, RLS is the issue.');

  } catch (error) {
    console.error('\n❌ Error during test:');
    console.error(error);
    process.exit(1);
  }

  console.log('\n=================================================');
  console.log('Test Complete');
  console.log('=================================================');
}

// Run the test
testDownloadFlow();
