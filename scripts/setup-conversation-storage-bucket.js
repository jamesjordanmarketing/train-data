#!/usr/bin/env node
/**
 * Setup Conversation Files Storage Bucket
 * 
 * Creates and configures the 'conversation-files' storage bucket for conversation JSON files.
 * 
 * Note: Storage bucket policies must be configured manually in Supabase Dashboard.
 * This script will create the bucket and provide instructions for policy setup.
 * 
 * Usage: node scripts/setup-conversation-storage-bucket.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Ensure environment variables are set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorageBucket() {
  console.log('===== STORAGE BUCKET SETUP =====\n');
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log('');
  
  const bucketName = 'conversation-files';
  
  // Step 1: Check if bucket exists
  console.log(`1. Checking if bucket '${bucketName}' exists...`);
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('❌ Error listing buckets:', listError.message);
    console.log('\nTroubleshooting:');
    console.log('  • Verify SUPABASE_SERVICE_ROLE_KEY is correct');
    console.log('  • Check Supabase project is active');
    console.log('  • Ensure Storage is enabled in Supabase Dashboard');
    return false;
  }
  
  const bucketExists = buckets.some(b => b.name === bucketName);
  
  if (bucketExists) {
    console.log(`✅ Bucket '${bucketName}' already exists`);
    
    // Get bucket details
    const existingBucket = buckets.find(b => b.name === bucketName);
    console.log(`   Public: ${existingBucket.public}`);
    console.log(`   Created: ${existingBucket.created_at}`);
  } else {
    console.log(`⚠️  Bucket '${bucketName}' does not exist`);
    console.log('\n2. Creating bucket...');
    
    // Try to create bucket via API
    const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucketName, {
      public: false,
      fileSizeLimit: 10485760, // 10MB in bytes
      allowedMimeTypes: ['application/json']
    });
    
    if (createError) {
      console.error('❌ Failed to create bucket via API:', createError.message);
      console.log('\n📋 MANUAL SETUP REQUIRED:');
      console.log('   1. Go to Supabase Dashboard > Storage');
      console.log('   2. Click "Create bucket"');
      console.log(`   3. Name: ${bucketName}`);
      console.log('   4. Settings:');
      console.log('      - Public: false (requires authentication)');
      console.log('      - File size limit: 10MB');
      console.log('      - Allowed MIME types: application/json');
      console.log('');
      return false;
    } else {
      console.log('✅ Bucket created successfully via API');
      console.log(`   Name: ${bucketName}`);
      console.log('   Public: false');
      console.log('   File size limit: 10MB');
      console.log('   Allowed MIME types: application/json');
    }
  }
  
  // Step 2: Test bucket access
  console.log('\n3. Testing bucket access...');
  
  const { data: listData, error: listFilesError } = await supabase.storage
    .from(bucketName)
    .list();
  
  if (listFilesError) {
    console.error('❌ Error accessing bucket:', listFilesError.message);
    return false;
  }
  
  console.log('✅ Bucket is accessible');
  console.log(`   Files in bucket: ${listData.length}`);
  
  // Step 3: Provide storage policy instructions
  console.log('\n4. Storage RLS Policies Setup...');
  console.log('\n📋 MANUAL SETUP REQUIRED for Storage RLS Policies:');
  console.log('\n   Go to: Supabase Dashboard > Storage > Policies');
  console.log(`   Select bucket: ${bucketName}`);
  console.log('   Create the following policies:\n');
  
  console.log('   ┌─────────────────────────────────────────────────────────────┐');
  console.log('   │ Policy 1: Users can upload to own folder                   │');
  console.log('   ├─────────────────────────────────────────────────────────────┤');
  console.log('   │ Operation:   INSERT                                         │');
  console.log('   │ Target:      All users (authenticated)                      │');
  console.log('   │ Policy SQL:                                                 │');
  console.log('   │   (bucket_id = \'conversation-files\' AND                    │');
  console.log('   │    (storage.foldername(name))[1] = auth.uid()::text)       │');
  console.log('   └─────────────────────────────────────────────────────────────┘\n');
  
  console.log('   ┌─────────────────────────────────────────────────────────────┐');
  console.log('   │ Policy 2: Users can read from own folder                   │');
  console.log('   ├─────────────────────────────────────────────────────────────┤');
  console.log('   │ Operation:   SELECT                                         │');
  console.log('   │ Target:      All users (authenticated)                      │');
  console.log('   │ Policy SQL:                                                 │');
  console.log('   │   (bucket_id = \'conversation-files\' AND                    │');
  console.log('   │    (storage.foldername(name))[1] = auth.uid()::text)       │');
  console.log('   └─────────────────────────────────────────────────────────────┘\n');
  
  console.log('   ┌─────────────────────────────────────────────────────────────┐');
  console.log('   │ Policy 3: Users can update their own files                 │');
  console.log('   ├─────────────────────────────────────────────────────────────┤');
  console.log('   │ Operation:   UPDATE                                         │');
  console.log('   │ Target:      All users (authenticated)                      │');
  console.log('   │ Policy SQL:                                                 │');
  console.log('   │   (bucket_id = \'conversation-files\' AND                    │');
  console.log('   │    (storage.foldername(name))[1] = auth.uid()::text)       │');
  console.log('   └─────────────────────────────────────────────────────────────┘\n');
  
  console.log('   ┌─────────────────────────────────────────────────────────────┐');
  console.log('   │ Policy 4: Users can delete their own files                 │');
  console.log('   ├─────────────────────────────────────────────────────────────┤');
  console.log('   │ Operation:   DELETE                                         │');
  console.log('   │ Target:      All users (authenticated)                      │');
  console.log('   │ Policy SQL:                                                 │');
  console.log('   │   (bucket_id = \'conversation-files\' AND                    │');
  console.log('   │    (storage.foldername(name))[1] = auth.uid()::text)       │');
  console.log('   └─────────────────────────────────────────────────────────────┘\n');
  
  console.log('   📝 Explanation:');
  console.log('   • Files are organized by user ID: <user-id>/<filename>.json');
  console.log('   • storage.foldername(name) extracts folder path from file path');
  console.log('   • [1] gets the first folder level (user ID)');
  console.log('   • auth.uid() is the current authenticated user ID');
  console.log('   • Users can only access files in their own folder\n');
  
  console.log('===== STORAGE BUCKET SETUP COMPLETE =====');
  console.log('\n📋 Summary:');
  console.log(`   • Bucket '${bucketName}' is ready`);
  console.log('   • Bucket is private (authentication required)');
  console.log('   • File size limit: 10MB');
  console.log('   • Allowed MIME types: application/json');
  console.log('   • Storage RLS policies must be created manually (see above)');
  console.log('\n📋 Next Steps:');
  console.log('   1. Create Storage RLS policies in Supabase Dashboard');
  console.log('   2. Test file upload with conversation service');
  console.log('   3. Verify file access restrictions work correctly');
  
  return true;
}

setupStorageBucket()
  .then((success) => {
    if (success) {
      console.log('\n✅ Storage bucket setup verification complete');
      process.exit(0);
    } else {
      console.error('\n❌ Storage bucket setup failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ Storage bucket setup failed with exception:', error);
    console.error(error.stack);
    process.exit(1);
  });

