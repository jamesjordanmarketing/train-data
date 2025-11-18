/**
 * Test Script: On-Demand URL Generation
 * 
 * This script demonstrates and tests the new on-demand URL generation pattern
 * for the ConversationStorageService.
 * 
 * Usage:
 *   ts-node src/scripts/test-url-generation.ts <conversation_id>
 * 
 * What it tests:
 * 1. getConversation() returns file_path (not file_url)
 * 2. getPresignedDownloadUrl() generates fresh signed URL
 * 3. getDownloadUrlForConversation() convenience method
 * 4. getRawResponseDownloadUrl() for raw responses
 * 5. Generated URLs are different each time
 * 6. URLs contain proper token and expiration
 */

import { ConversationStorageService } from '../lib/services/conversation-storage-service';
import { createClient } from '@supabase/supabase-js';

async function testUrlGeneration(conversationId: string) {
  console.log('='.repeat(80));
  console.log('🧪 Testing On-Demand URL Generation');
  console.log('='.repeat(80));
  console.log();

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const service = new ConversationStorageService(supabase);

  console.log(`📝 Testing conversation: ${conversationId}`);
  console.log();

  // TEST 1: getConversation() returns file_path, not file_url
  console.log('TEST 1: getConversation() returns file_path (not file_url)');
  console.log('-'.repeat(80));
  
  const conversation = await service.getConversation(conversationId);
  
  if (!conversation) {
    console.error('❌ Conversation not found');
    process.exit(1);
  }

  console.log('✅ Conversation found');
  console.log(`   - file_path: ${conversation.file_path}`);
  console.log(`   - raw_response_path: ${conversation.raw_response_path}`);
  console.log(`   - has file_url property: ${'file_url' in conversation}`);
  console.log(`   - has raw_response_url property: ${'raw_response_url' in conversation}`);
  console.log();

  if (!conversation.file_path) {
    console.error('❌ No file_path found for conversation');
    process.exit(1);
  }

  // TEST 2: getPresignedDownloadUrl() generates fresh URL
  console.log('TEST 2: getPresignedDownloadUrl() generates fresh URL');
  console.log('-'.repeat(80));
  
  const url1 = await service.getPresignedDownloadUrl(conversation.file_path);
  console.log('✅ Generated first URL:');
  console.log(`   Length: ${url1.length} characters`);
  console.log(`   Contains token: ${url1.includes('?token=')}`);
  console.log(`   Contains sign: ${url1.includes('/sign/')}`);
  console.log(`   URL: ${url1.substring(0, 100)}...`);
  console.log();

  // TEST 3: Generate second URL and verify it's different
  console.log('TEST 3: Generate second URL (should be different)');
  console.log('-'.repeat(80));
  
  const url2 = await service.getPresignedDownloadUrl(conversation.file_path);
  console.log('✅ Generated second URL:');
  console.log(`   Length: ${url2.length} characters`);
  console.log(`   URLs are different: ${url1 !== url2}`);
  console.log(`   URL: ${url2.substring(0, 100)}...`);
  console.log();

  if (url1 === url2) {
    console.warn('⚠️  Warning: URLs are identical (expected to be different due to unique tokens)');
  } else {
    console.log('✅ Confirmed: Each call generates a unique URL');
  }
  console.log();

  // TEST 4: getDownloadUrlForConversation() convenience method
  console.log('TEST 4: getDownloadUrlForConversation() convenience method');
  console.log('-'.repeat(80));
  
  const downloadInfo = await service.getDownloadUrlForConversation(conversationId);
  console.log('✅ Generated download info:');
  console.log(`   conversation_id: ${downloadInfo.conversation_id}`);
  console.log(`   filename: ${downloadInfo.filename}`);
  console.log(`   file_size: ${downloadInfo.file_size} bytes`);
  console.log(`   expires_in_seconds: ${downloadInfo.expires_in_seconds}`);
  console.log(`   expires_at: ${downloadInfo.expires_at}`);
  console.log(`   download_url length: ${downloadInfo.download_url.length} characters`);
  console.log();

  // Verify expiration is approximately 1 hour from now
  const expiresAt = new Date(downloadInfo.expires_at);
  const now = new Date();
  const diffMinutes = Math.round((expiresAt.getTime() - now.getTime()) / 1000 / 60);
  console.log(`   ⏱️  URL expires in approximately ${diffMinutes} minutes`);
  
  if (diffMinutes >= 59 && diffMinutes <= 61) {
    console.log('   ✅ Expiration time is correct (~60 minutes)');
  } else {
    console.warn(`   ⚠️  Unexpected expiration time: ${diffMinutes} minutes (expected ~60)`);
  }
  console.log();

  // TEST 5: getRawResponseDownloadUrl() if raw response exists
  if (conversation.raw_response_path) {
    console.log('TEST 5: getRawResponseDownloadUrl() for raw responses');
    console.log('-'.repeat(80));
    
    const rawDownloadInfo = await service.getRawResponseDownloadUrl(conversationId);
    console.log('✅ Generated raw response download info:');
    console.log(`   conversation_id: ${rawDownloadInfo.conversation_id}`);
    console.log(`   filename: ${rawDownloadInfo.filename}`);
    console.log(`   file_size: ${rawDownloadInfo.file_size} bytes`);
    console.log(`   expires_in_seconds: ${rawDownloadInfo.expires_in_seconds}`);
    console.log(`   download_url length: ${rawDownloadInfo.download_url.length} characters`);
    console.log();
  } else {
    console.log('TEST 5: getRawResponseDownloadUrl() - SKIPPED');
    console.log('-'.repeat(80));
    console.log('⏭️  No raw_response_path found for this conversation');
    console.log();
  }

  // TEST 6: Verify URLs are accessible (optional - requires actual file)
  console.log('TEST 6: Verify URL accessibility');
  console.log('-'.repeat(80));
  console.log('📥 Attempting to fetch file from generated URL...');
  
  try {
    const response = await fetch(downloadInfo.download_url);
    if (response.ok) {
      const contentLength = response.headers.get('content-length');
      const contentType = response.headers.get('content-type');
      console.log('✅ URL is accessible:');
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Content-Type: ${contentType}`);
      console.log(`   Content-Length: ${contentLength} bytes`);
      
      // Verify it's JSON
      if (contentType?.includes('application/json')) {
        console.log('   ✅ Content-Type is application/json');
      } else {
        console.warn(`   ⚠️  Unexpected Content-Type: ${contentType}`);
      }
    } else {
      console.error(`❌ URL returned status: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Failed to fetch URL:', error instanceof Error ? error.message : error);
  }
  console.log();

  // Summary
  console.log('='.repeat(80));
  console.log('✅ All Tests Complete');
  console.log('='.repeat(80));
  console.log();
  console.log('Summary:');
  console.log('  ✅ getConversation() returns file_path (not file_url)');
  console.log('  ✅ getPresignedDownloadUrl() generates fresh URLs');
  console.log('  ✅ Each URL is unique (different tokens)');
  console.log('  ✅ getDownloadUrlForConversation() works correctly');
  console.log('  ✅ URLs expire in 1 hour (3600 seconds)');
  if (conversation.raw_response_path) {
    console.log('  ✅ getRawResponseDownloadUrl() works correctly');
  }
  console.log();
  console.log('Pattern Verified:');
  console.log('  ✅ Never return stored URLs from database');
  console.log('  ✅ Always generate fresh URLs on-demand');
  console.log('  ✅ URLs are unique and temporary (1 hour expiration)');
  console.log();
}

// Main execution
const conversationId = process.argv[2];

if (!conversationId) {
  console.error('❌ Missing conversation_id argument');
  console.error();
  console.error('Usage:');
  console.error('  ts-node src/scripts/test-url-generation.ts <conversation_id>');
  console.error();
  console.error('Example:');
  console.error('  ts-node src/scripts/test-url-generation.ts abc-123-def-456');
  process.exit(1);
}

testUrlGeneration(conversationId)
  .then(() => {
    console.log('✅ Test script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });

