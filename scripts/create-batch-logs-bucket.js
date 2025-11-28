/**
 * Create the batch-logs bucket in Supabase Storage
 * 
 * Usage: node scripts/create-batch-logs-bucket.js
 */

require('../load-env.js');
const { createClient } = require('@supabase/supabase-js');

async function createBatchLogsBucket() {
  console.log('\n🪣 Creating batch-logs bucket...\n');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  // Create the bucket
  const { data, error } = await supabase.storage.createBucket('batch-logs', {
    public: false,
    fileSizeLimit: 10485760, // 10MB limit per file
    allowedMimeTypes: ['text/plain', 'application/json']
  });
  
  if (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️ batch-logs bucket already exists');
    } else {
      console.error('❌ Failed to create bucket:', error.message);
      return;
    }
  } else {
    console.log('✅ batch-logs bucket created successfully');
    console.log('   ID:', data.name);
  }
  
  console.log('\n📍 Log files will be stored at:');
  console.log('   Supabase Storage > batch-logs > {jobId}/log.txt');
}

createBatchLogsBucket().catch(console.error);

