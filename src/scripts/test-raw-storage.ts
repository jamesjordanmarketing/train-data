/**
 * Test Script: Raw Response Storage
 * 
 * Tests the Phase 2 raw response storage implementation to verify:
 * - Raw Claude responses are stored correctly
 * - Database records are created with raw_response_* fields
 * - Files are accessible in Supabase Storage
 * - Parse attempts are tracked correctly
 * 
 * Run: npx tsx src/scripts/test-raw-storage.ts
 */

import { ConversationStorageService } from '../lib/services/conversation-storage-service';
import { createClient } from '@supabase/supabase-js';

async function testRawStorage() {
  console.log('='.repeat(60));
  console.log('RAW RESPONSE STORAGE TEST');
  console.log('='.repeat(60));
  console.log();

  // Initialize service
  const service = new ConversationStorageService();
  
  const testConvId = `test-raw-${Date.now()}`;
  const testUserId = 'test-user-123';
  
  // Simulate various Claude response formats
  const testCases = [
    {
      name: 'Valid JSON',
      response: JSON.stringify({
        conversation_metadata: {
          client_persona: 'Test User',
          session_context: 'Testing raw storage',
          conversation_phase: 'test'
        },
        turns: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' }
        ]
      }, null, 2),
      shouldParse: true
    },
    {
      name: 'Malformed JSON (unescaped quotes)',
      response: `{
        "conversation_metadata": {
          "client_persona": "Test User",
          "session_context": "Test says "hello" world",
          "conversation_phase": "test"
        },
        "turns": []
      }`,
      shouldParse: false
    },
    {
      name: 'Truncated JSON',
      response: `{
        "conversation_metadata": {
          "client_persona": "Test User"
        },
        "turns": [`,
      shouldParse: false
    }
  ];

  console.log(`Testing ${testCases.length} scenarios...\n`);

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const convId = `${testConvId}-${i}`;
    
    console.log('-'.repeat(60));
    console.log(`Test ${i + 1}: ${testCase.name}`);
    console.log('-'.repeat(60));
    
    // Step 1: Store raw response
    console.log('Step 1: Storing raw response...');
    const result = await service.storeRawResponse({
      conversationId: convId,
      rawResponse: testCase.response,
      userId: testUserId,
      metadata: {
        tier: 'template'
      }
    });
    
    if (!result.success) {
      console.error('❌ Raw storage failed:', result.error);
      console.log();
      continue;
    }
    
    console.log('✅ Raw storage succeeded');
    console.log(`   Path: ${result.rawPath}`);
    console.log(`   Size: ${result.rawSize} bytes`);
    console.log();
    
    // Step 2: Verify file exists in storage
    console.log('Step 2: Verifying file in storage...');
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('conversation-files')
        .download(result.rawPath);
      
      if (downloadError || !fileData) {
        console.error('❌ File download failed:', downloadError);
      } else {
        const content = await fileData.text();
        console.log('✅ File exists and is downloadable');
        console.log(`   Content length: ${content.length} bytes`);
      }
    } catch (error) {
      console.error('❌ Error verifying file:', error);
    }
    console.log();
    
    // Step 3: Verify database record
    console.log('Step 3: Verifying database record...');
    try {
      const conversation = await service.getConversation(convId);
      
      if (!conversation) {
        console.error('❌ Conversation record not found');
      } else {
        console.log('✅ Database record exists');
        console.log(`   Conversation ID: ${conversation.conversation_id}`);
        console.log(`   Raw Path: ${conversation.raw_response_path || 'Missing'}`);
        console.log(`   Raw Size: ${conversation.raw_response_size || 0} bytes`);
        console.log(`   Raw Stored At: ${conversation.raw_stored_at || 'Missing'}`);
        console.log(`   Processing Status: ${conversation.processing_status}`);
        console.log(`   Note: Use getPresignedDownloadUrl(raw_response_path) to get download URL`);
      }
    } catch (error) {
      console.error('❌ Error querying database:', error);
    }
    console.log();
    
    // Step 4: Attempt parse
    console.log('Step 4: Attempting parse...');
    const parseResult = await service.parseAndStoreFinal({
      conversationId: convId,
      rawResponse: testCase.response,
      userId: testUserId,
    });
    
    if (parseResult.success) {
      console.log(`✅ Parse succeeded (method: ${parseResult.parseMethod})`);
      console.log(`   Turn count: ${parseResult.conversation?.turn_count || 0}`);
      console.log(`   Final file path: ${parseResult.conversation?.file_path || 'Unknown'}`);
    } else {
      console.log(`⚠️  Parse failed (expected: ${!testCase.shouldParse})`);
      console.log(`   Error: ${parseResult.error}`);
      console.log(`   Method: ${parseResult.parseMethod}`);
    }
    console.log();
    
    // Step 5: Check parse tracking
    console.log('Step 5: Checking parse attempt tracking...');
    try {
      const conversation = await service.getConversation(convId);
      
      if (conversation) {
        console.log(`   Parse attempts: ${conversation.parse_attempts || 0}`);
        console.log(`   Last attempt: ${conversation.last_parse_attempt_at || 'Never'}`);
        console.log(`   Parse method: ${conversation.parse_method_used || 'None'}`);
        console.log(`   Requires manual review: ${conversation.requires_manual_review ? 'Yes' : 'No'}`);
        console.log(`   Parse error: ${conversation.parse_error_message || 'None'}`);
      }
    } catch (error) {
      console.error('❌ Error checking parse tracking:', error);
    }
    console.log();
  }

  console.log('='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total test cases: ${testCases.length}`);
  console.log(`Test conversation IDs created:`);
  testCases.forEach((tc, i) => {
    console.log(`  - ${testConvId}-${i} (${tc.name})`);
  });
  console.log();
  console.log('Next steps:');
  console.log('1. Check Supabase Dashboard > Storage > conversation-files > raw/');
  console.log('2. Check database for conversation records');
  console.log('3. Verify raw_response_* fields are populated');
  console.log('4. Check parse_attempts and requires_manual_review flags');
  console.log();
}

// Run the test
testRawStorage()
  .then(() => {
    console.log('✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });

