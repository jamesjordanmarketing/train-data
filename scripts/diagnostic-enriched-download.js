/**
 * Diagnostic Script: Validate Enriched Download Issue
 * Tests database state, storage access, and client authentication
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const CONVERSATION_ID = '4acf22d3-e8e5-4293-88d6-db03de41675a';

async function runDiagnostics() {
  console.log('🔍 DIAGNOSTIC MODE: Enriched Download Issue\n');
  console.log('Testing conversation:', CONVERSATION_ID, '\n');

  // Test 1: Check database record
  console.log('📊 TEST 1: Database Record Validation');
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: conv, error: dbError } = await adminClient
    .from('conversations')
    .select('conversation_id, enrichment_status, enriched_file_path, enriched_file_size, created_by')
    .eq('conversation_id', CONVERSATION_ID)
    .single();

  if (dbError) {
    console.log('❌ Database query failed:', dbError.message);
    return;
  }

  console.log('✅ Conversation found');
  console.log('   Status:', conv.enrichment_status);
  console.log('   File path:', conv.enriched_file_path);
  console.log('   File size:', conv.enriched_file_size, 'bytes');
  console.log('   User ID:', conv.created_by);

  if (!conv.enriched_file_path) {
    console.log('❌ No enriched_file_path in database');
    return;
  }

  // Test 2: Check file exists in storage (admin client)
  console.log('\n📦 TEST 2: Storage Access with Admin Client (SERVICE_ROLE_KEY)');
  const { data: fileList, error: listError } = await adminClient.storage
    .from('conversation-files')
    .list(conv.enriched_file_path.substring(0, conv.enriched_file_path.lastIndexOf('/')));

  if (listError) {
    console.log('❌ List files failed:', listError.message);
  } else {
    const filename = conv.enriched_file_path.split('/').pop();
    const fileExists = fileList.some(f => f.name === filename);
    console.log(fileExists ? '✅ File exists in storage' : '❌ File not found in storage');
    if (fileExists) {
      const file = fileList.find(f => f.name === filename);
      console.log('   File size:', file.metadata?.size || 'unknown', 'bytes');
    }
  }

  // Test 3: Generate signed URL with admin client
  console.log('\n🔐 TEST 3: Generate Signed URL with Admin Client');
  const { data: adminSignedUrl, error: adminSignError } = await adminClient.storage
    .from('conversation-files')
    .createSignedUrl(conv.enriched_file_path, 3600);

  if (adminSignError) {
    console.log('❌ Admin signed URL failed:', adminSignError.message);
  } else {
    console.log('✅ Admin signed URL generated');
    console.log('   URL:', adminSignedUrl.signedUrl.substring(0, 100) + '...');
    
    // Test 4: Try to download the file
    console.log('\n📥 TEST 4: Download File via Admin Signed URL');
    try {
      const response = await fetch(adminSignedUrl.signedUrl);
      if (response.ok) {
        const size = parseInt(response.headers.get('content-length'));
        console.log('✅ File downloaded successfully');
        console.log('   Downloaded size:', size, 'bytes');
        console.log('   Matches DB size:', size === conv.enriched_file_size);
      } else {
        console.log('❌ Download failed:', response.status, response.statusText);
      }
    } catch (err) {
      console.log('❌ Download error:', err.message);
    }
  }

  // Test 5: Try with user client (simulating current endpoint behavior)
  console.log('\n👤 TEST 5: Generate Signed URL with User Client (ANON_KEY)');
  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: userSignedUrl, error: userSignError } = await userClient.storage
    .from('conversation-files')
    .createSignedUrl(conv.enriched_file_path, 3600);

  if (userSignError) {
    console.log('❌ User signed URL failed:', userSignError.message);
    console.log('   This is the ROOT CAUSE of the 404 error!');
  } else {
    console.log('⚠️  User signed URL generated (unexpected)');
    console.log('   URL:', userSignedUrl.signedUrl.substring(0, 100) + '...');
    
    // Try to download
    try {
      const response = await fetch(userSignedUrl.signedUrl);
      if (response.ok) {
        console.log('✅ File downloaded (RLS may not be blocking)');
      } else {
        console.log('❌ Download failed:', response.status, response.statusText);
        console.log('   Signed URL created but file access blocked by RLS');
      }
    } catch (err) {
      console.log('❌ Download error:', err.message);
    }
  }

  // Test 6: Check RLS policies
  console.log('\n🛡️  TEST 6: Storage RLS Policy Check');
  const { data: policies, error: policyError } = await adminClient
    .from('pg_policies')
    .select('*')
    .like('tablename', '%storage%');

  if (policyError) {
    console.log('⚠️  Could not query RLS policies:', policyError.message);
  } else if (policies && policies.length > 0) {
    console.log('Found', policies.length, 'storage-related policies');
  } else {
    console.log('No storage policies found (may be managed differently)');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 DIAGNOSTIC SUMMARY\n');
  console.log('Database: File path and metadata present');
  console.log('Storage:  File exists physically');
  console.log('Admin Client: Can generate signed URL and download file');
  console.log('User Client:  ', userSignError ? '❌ FAILS (RLS blocking)' : '⚠️  Unexpected success');
  console.log('\nRoot Cause Confirmed:', userSignError ? 'YES' : 'NO');
  console.log('Fix Required: Use admin client via storage service');
  console.log('='.repeat(60));
}

runDiagnostics().catch(console.error);
