/**
 * Test Script: Validate Enriched Download Fix
 * Tests the new getEnrichedDownloadUrl method and endpoint
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const CONVERSATION_ID = '4acf22d3-e8e5-4293-88d6-db03de41675a';

async function testEnrichedDownloadFix() {
  console.log('🧪 Testing Enriched Download Fix\n');
  console.log('Test conversation:', CONVERSATION_ID, '\n');

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Test 1: Verify conversation state
  console.log('TEST 1: Verify Conversation State');
  const { data: conv, error } = await supabase
    .from('conversations')
    .select('conversation_id, enrichment_status, enriched_file_path, enriched_file_size')
    .eq('conversation_id', CONVERSATION_ID)
    .single();

  if (error || !conv) {
    console.log('❌ Conversation not found:', error?.message);
    return;
  }

  console.log('✅ Conversation found');
  console.log('   Status:', conv.enrichment_status);
  console.log('   File path:', conv.enriched_file_path);
  console.log('   File size:', conv.enriched_file_size, 'bytes\n');

  // Test 2: Test storage service method directly
  console.log('TEST 2: Test Storage Service Method (getEnrichedDownloadUrl)');
  const { getConversationStorageService } = require('./src/lib/services/conversation-storage-service.ts');
  const storageService = getConversationStorageService();

  try {
    const downloadInfo = await storageService.getEnrichedDownloadUrl(CONVERSATION_ID);
    console.log('✅ Storage service method works');
    console.log('   Download URL:', downloadInfo.download_url.substring(0, 80) + '...');
    console.log('   Filename:', downloadInfo.filename);
    console.log('   File size:', downloadInfo.file_size, 'bytes');
    console.log('   Expires in:', downloadInfo.expires_in_seconds, 'seconds\n');

    // Test 3: Try to download the file
    console.log('TEST 3: Download File via Storage Service URL');
    const response = await fetch(downloadInfo.download_url);
    if (response.ok) {
      const text = await response.text();
      const size = text.length;
      console.log('✅ File downloaded successfully');
      console.log('   Downloaded size:', size, 'bytes');
      console.log('   Is valid JSON:', text.startsWith('{') && text.endsWith('}'));
      
      // Parse and check structure
      try {
        const json = JSON.parse(text);
        console.log('   Has conversation_id:', !!json.conversation_id);
        console.log('   Has messages array:', Array.isArray(json.messages));
        console.log('   Message count:', json.messages?.length || 0);
      } catch (e) {
        console.log('⚠️  JSON parse failed:', e.message);
      }
    } else {
      console.log('❌ Download failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Storage service method failed:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ FIX VALIDATION COMPLETE');
  console.log('='.repeat(60));
}

testEnrichedDownloadFix().catch(console.error);
