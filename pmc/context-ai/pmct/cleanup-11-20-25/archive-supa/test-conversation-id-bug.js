/**
 * Quick Database Investigation
 * Using agentQuery which we know works
 */

require('dotenv').config();
const { agentQuery } = require('./dist/index');

async function investigate() {
  console.log('=================================================');
  console.log('Database Investigation - conversation_id NULL Issue');
  console.log('=================================================\n');

  try {
    // Query 1: Get all conversations with their conversation_id status
    console.log('Query 1: Checking all conversations for NULL conversation_id...');
    const allConversations = await agentQuery({
      table: 'conversations',
      select: ['id', 'conversation_id', 'created_at', 'file_path', 'raw_response_path', 'processing_status'],
      orderBy: [{ column: 'created_at', asc: false }],
      limit: 50
    });

    console.log(`✓ Retrieved ${allConversations.data.length} conversations\n`);

    // Count NULL vs non-NULL conversation_id
    let nullCount = 0;
    let nonNullCount = 0;
    let recent501e = null;

    allConversations.data.forEach(row => {
      if (row.conversation_id === null) {
        nullCount++;
      } else {
        nonNullCount++;
      }
      
      // Check if this is our specific conversation
      if (row.raw_response_path && row.raw_response_path.includes('501e3b87')) {
        recent501e = row;
      }
    });

    console.log(`Statistics:`);
    console.log(`  Total conversations: ${allConversations.data.length}`);
    console.log(`  With conversation_id: ${nonNullCount}`);
    console.log(`  NULL conversation_id: ${nullCount}`);
    
    if (nullCount > 0) {
      console.log(`\n  ⚠️  CRITICAL BUG CONFIRMED: ${nullCount} conversations have NULL conversation_id!\n`);
    } else {
      console.log(`\n  ✓ All conversations have conversation_id populated\n`);
    }

    // Show most recent conversations
    console.log('Most Recent 10 Conversations:');
    console.log('=' .repeat(80));
    allConversations.data.slice(0, 10).forEach((row, idx) => {
      const convId = row.conversation_id || 'NULL';
      const rawPath = row.raw_response_path ? row.raw_response_path.substring(row.raw_response_path.lastIndexOf('/') + 1, row.raw_response_path.length - 5) : 'No raw path';
      console.log(`[${idx + 1}] id: ${row.id} | conversation_id: ${convId === 'NULL' ? '❌ ' + convId : '✓ ' + convId}`);
      console.log(`    Raw path UUID: ${rawPath}`);
      console.log(`    Status: ${row.processing_status}`);
      console.log(`    Created: ${row.created_at}`);
      console.log('');
    });

    // Check for conversation 501e3b87
    if (recent501e) {
      console.log('\n🔍 Found conversation 501e3b87 in database:');
      console.log('=' .repeat(80));
      console.log(`  Database ID: ${recent501e.id}`);
      console.log(`  conversation_id: ${recent501e.conversation_id || '❌ NULL - THIS IS THE BUG!'}`);
      console.log(`  raw_response_path: ${recent501e.raw_response_path}`);
      console.log(`  file_path: ${recent501e.file_path}`);
      console.log(`  processing_status: ${recent501e.processing_status}`);
      console.log(`  created_at: ${recent501e.created_at}`);
      console.log('');
      
      if (recent501e.conversation_id === null) {
        console.log('  ❌ BUG CONFIRMED: conversation_id is NULL but UUID is in raw_response_path!');
        console.log('  This proves the hypothesis - conversation_id field is not being populated during generation.');
      }
    } else {
      console.log('\n  ℹ️  Conversation 501e3b87 not found in recent 50 records.');
      console.log('  It may have been cleaned up or is older than the 50 most recent.');
    }

    console.log('\n=================================================');
    console.log('Investigation Complete');
    console.log('=================================================');

  } catch (error) {
    console.error('\n❌ Error during investigation:');
    console.error(error);
    process.exit(1);
  }
}

// Run the investigation
investigate();
