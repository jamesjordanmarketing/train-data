/**
 * Investigate Failed Conversation Generation
 * Check if conversation record exists and file was stored
 */

require('dotenv').config();
const { agentQuery } = require('./dist/index');

async function investigateFailedGeneration() {
  console.log('=================================================');
  console.log('Investigating Conversation: 4158a61c-8eab-4d6d-9708-b4bbd0dcad9d');
  console.log('=================================================\n');

  try {
    const conversationId = '4158a61c-8eab-4d6d-9708-b4bbd0dcad9d';
    const userId = '79c81162-6399-41d4-a968-996e0ca0df0c';

    // Query 1: Find conversation by conversation_id
    console.log('Query 1: Looking for conversation by conversation_id...');
    const result = await agentQuery({
      table: 'conversations',
      select: ['id', 'conversation_id', 'created_by', 'file_path', 'raw_response_path', 'processing_status', 'status', 'created_at'],
      where: [
        { column: 'conversation_id', operator: 'eq', value: conversationId }
      ],
      limit: 1
    });

    console.log(`✓ Query executed`);
    console.log(`  Records found: ${result.data.length}\n`);

    if (result.data.length === 0) {
      console.log('❌ PROBLEM #1: No conversation record found in database!');
      console.log('   This means the generation failed before creating the record.');
      console.log('   OR the record was created with a different conversation_id.');
      console.log();

      // Try searching by user
      console.log('Query 2: Searching for ANY conversations by this user...');
      const userConvs = await agentQuery({
        table: 'conversations',
        select: ['id', 'conversation_id', 'created_by', 'file_path', 'processing_status', 'created_at'],
        where: [
          { column: 'created_by', operator: 'eq', value: userId }
        ],
        orderBy: [{ column: 'created_at', asc: false }],
        limit: 10
      });

      console.log(`✓ Found ${userConvs.data.length} conversations for user ${userId}\n`);

      if (userConvs.data.length === 0) {
        console.log('❌ PROBLEM: User has NO conversations in database!');
        console.log('   This confirms generation is failing to store records.');
      } else {
        console.log('Most recent conversations:');
        userConvs.data.forEach((conv, idx) => {
          console.log(`[${idx + 1}] ${conv.conversation_id || 'NULL'}`);
          console.log(`    created_by: ${conv.created_by}`);
          console.log(`    file_path: ${conv.file_path || 'NULL'}`);
          console.log(`    status: ${conv.processing_status}`);
          console.log(`    created: ${conv.created_at}`);
          console.log();
        });

        // Check if the latest one matches our ID
        const latest = userConvs.data[0];
        if (latest.conversation_id === conversationId) {
          console.log('✓ Found the conversation! Analyzing...\n');
          analyzeConversation(latest);
        } else {
          console.log('⚠️  Latest conversation has different ID:');
          console.log(`   Expected: ${conversationId}`);
          console.log(`   Found: ${latest.conversation_id}`);
          console.log();
        }
      }
    } else {
      const conversation = result.data[0];
      console.log('✓ Found conversation record! Analyzing...\n');
      analyzeConversation(conversation);
    }

    // Query 3: Check ALL recent conversations (any user)
    console.log('\nQuery 3: Checking ALL recent conversations...');
    const allRecent = await agentQuery({
      table: 'conversations',
      select: ['id', 'conversation_id', 'created_by', 'file_path', 'processing_status', 'created_at'],
      orderBy: [{ column: 'created_at', asc: false }],
      limit: 5
    });

    console.log(`✓ Found ${allRecent.data.length} recent conversations:\n`);
    allRecent.data.forEach((conv, idx) => {
      const isOurs = conv.conversation_id === conversationId;
      console.log(`[${idx + 1}] ${conv.conversation_id || 'NULL'}${isOurs ? ' ← THIS IS OURS!' : ''}`);
      console.log(`    created_by: ${conv.created_by}`);
      console.log(`    file_path: ${conv.file_path || 'NULL'}`);
      console.log(`    status: ${conv.processing_status}`);
      console.log(`    created: ${conv.created_at}`);
      console.log();
    });

  } catch (error) {
    console.error('\n❌ Error during investigation:');
    console.error(error);
    process.exit(1);
  }

  console.log('=================================================');
  console.log('Investigation Complete');
  console.log('=================================================');
}

function analyzeConversation(conv) {
  console.log('Conversation Details:');
  console.log('=' .repeat(60));
  console.log(`ID (primary key): ${conv.id}`);
  console.log(`conversation_id: ${conv.conversation_id || '❌ NULL'}`);
  console.log(`created_by: ${conv.created_by}`);
  console.log(`file_path: ${conv.file_path || '❌ NULL - NO FILE STORED!'}`);
  console.log(`raw_response_path: ${conv.raw_response_path || '❌ NULL - NO RAW FILE!'}`);
  console.log(`processing_status: ${conv.processing_status}`);
  console.log(`status: ${conv.status || 'N/A'}`);
  console.log(`created_at: ${conv.created_at}`);
  console.log();

  // Diagnose issues
  console.log('Diagnosis:');
  console.log('-'.repeat(60));

  if (!conv.file_path) {
    console.log('❌ PROBLEM #2: file_path is NULL!');
    console.log('   The final parsed conversation was NOT stored to Supabase Storage.');
    console.log('   This is why download fails with "Object not found".');
    console.log();
  }

  if (!conv.raw_response_path) {
    console.log('❌ PROBLEM #3: raw_response_path is NULL!');
    console.log('   The raw Claude response was NOT stored to Supabase Storage.');
    console.log('   This suggests the storage service failed.');
    console.log();
  }

  if (conv.processing_status === 'completed' && !conv.file_path) {
    console.log('⚠️  INCONSISTENCY: Status is "completed" but no file_path!');
    console.log('   The generation thinks it succeeded but storage failed.');
    console.log();
  }

  if (conv.created_by && conv.created_by !== '00000000-0000-0000-0000-000000000000') {
    console.log('✓ GOOD: Conversation owned by real user (not system user).');
    console.log('   Auth fix is working correctly.');
    console.log();
  }

  console.log('\nLikely Root Cause:');
  console.log('=' .repeat(60));
  console.log('The conversation generation completed, but the storage service');
  console.log('failed to upload files to Supabase Storage. Possible reasons:');
  console.log('  1. Storage bucket permissions issue');
  console.log('  2. Invalid file path format');
  console.log('  3. Supabase Storage API error');
  console.log('  4. Network/timeout issue during upload');
  console.log();
}

// Run investigation
investigateFailedGeneration();
