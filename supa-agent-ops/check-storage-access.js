#!/usr/bin/env node
/**
 * Test Storage Access Permissions
 * 
 * This script tests whether:
 * 1. Service role key can access files (admin access)
 * 2. Authenticated user can access files (RLS/bucket policies)
 * 3. What the actual error is when using authenticated client
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxaHRieGxnenl6ZmJla2V4d2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNzQyNzMsImV4cCI6MjA0NDg1MDI3M30.QySqYRBSuqZHcmKNzSWdJMkQD7G31hzDcbiwsyv0IfA';

// Test data
const userId = '79c81162-6399-41d4-a968-996e0ca0df0c';
const conversationId = '4158a61c-8eab-4d6d-9708-b4bbd0dcad9d';
const filePath = `${userId}/${conversationId}/conversation.json`;

async function testStorageAccess() {
  console.log('=================================================');
  console.log('Testing Storage Access Permissions');
  console.log('=================================================\n');

  // ================================================================
  // Test 1: Service Role Key Access (Admin)
  // ================================================================
  console.log('Test 1: Accessing with SERVICE ROLE KEY (admin)...');
  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    const { data: signedData, error: signedError } = await adminClient.storage
      .from('conversation-files')
      .createSignedUrl(filePath, 3600);

    if (signedError) {
      console.log(`❌ Service role FAILED to create signed URL:`, signedError);
    } else {
      console.log(`✅ Service role SUCCEEDED`);
      console.log(`   Signed URL: ${signedData.signedUrl.substring(0, 80)}...`);
    }
  } catch (error) {
    console.log(`❌ Service role ERROR:`, error.message);
  }

  console.log('');

  // ================================================================
  // Test 2: Anon Key Access (Unauthenticated)
  // ================================================================
  console.log('Test 2: Accessing with ANON KEY (unauthenticated)...');
  const anonClient = createClient(SUPABASE_URL, ANON_KEY);

  try {
    const { data: signedData, error: signedError } = await anonClient.storage
      .from('conversation-files')
      .createSignedUrl(filePath, 3600);

    if (signedError) {
      console.log(`❌ Anon key FAILED to create signed URL:`, signedError);
      console.log(`   Error details:`, JSON.stringify(signedError, null, 2));
    } else {
      console.log(`✅ Anon key SUCCEEDED`);
      console.log(`   Signed URL: ${signedData.signedUrl.substring(0, 80)}...`);
    }
  } catch (error) {
    console.log(`❌ Anon key ERROR:`, error.message);
  }

  console.log('');

  // ================================================================
  // Test 3: Authenticated User Access
  // ================================================================
  console.log('Test 3: Accessing as AUTHENTICATED USER...');
  console.log('   (Note: We need a real JWT token to test this properly)');
  console.log('   For now, checking bucket policies via admin client...\n');

  // List bucket details
  try {
    const { data: buckets, error: bucketsError } = await adminClient.storage.listBuckets();
    
    if (bucketsError) {
      console.log(`❌ Failed to list buckets:`, bucketsError);
    } else {
      const convBucket = buckets.find(b => b.name === 'conversation-files');
      if (convBucket) {
        console.log('Bucket Details:');
        console.log(`   Name: ${convBucket.name}`);
        console.log(`   Public: ${convBucket.public}`);
        console.log(`   File size limit: ${convBucket.file_size_limit || 'None'}`);
        console.log(`   Allowed MIME types: ${convBucket.allowed_mime_types?.join(', ') || 'All'}`);
      }
    }
  } catch (error) {
    console.log(`❌ Bucket info ERROR:`, error.message);
  }

  console.log('\n=================================================');
  console.log('Diagnosis');
  console.log('=================================================');
  console.log('If service role works but anon key fails:');
  console.log('  → The bucket is PRIVATE (requires RLS policies)');
  console.log('  → Download endpoint needs to use service role key');
  console.log('  → OR bucket policies need to be added for authenticated users');
  console.log('');
  console.log('If both work:');
  console.log('  → There\'s a bug in the download endpoint code');
  console.log('  → Check path formatting or client initialization');
  console.log('=================================================');
}

testStorageAccess().catch(console.error);
