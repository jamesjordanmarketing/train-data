/**
 * Check if batch log blobs exist in Supabase Storage
 * 
 * Usage: node scripts/check-batch-logs.js [job_id]
 */

require('../load-env.js');
const { createClient } = require('@supabase/supabase-js');

const jobId = process.argv[2] || 'ea1fc6e7-7dc3-476b-a8ff-7d12e0c918fe';

async function checkBatchLogs() {
  console.log(`\n📁 Checking batch logs for job: ${jobId}\n`);
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  // Check if batch-logs bucket exists
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error('❌ Failed to list buckets:', bucketsError.message);
    return;
  }
  
  const batchLogsBucket = buckets.find(b => b.name === 'batch-logs');
  
  if (!batchLogsBucket) {
    console.log('⚠️ batch-logs bucket does NOT exist');
    console.log('\n📋 Available buckets:');
    buckets.forEach(b => console.log(`   - ${b.name}`));
    console.log('\n💡 The batch-logs bucket needs to be created in Supabase.');
    return;
  }
  
  console.log('✅ batch-logs bucket exists');
  
  // List files in the job folder
  const { data: files, error: filesError } = await supabase.storage
    .from('batch-logs')
    .list(jobId);
    
  if (filesError) {
    console.error('❌ Failed to list files:', filesError.message);
    return;
  }
  
  if (!files || files.length === 0) {
    console.log(`\n⚠️ No log files found for job ${jobId}`);
    
    // Check root level for any files
    const { data: rootFiles } = await supabase.storage
      .from('batch-logs')
      .list('', { limit: 10 });
      
    if (rootFiles && rootFiles.length > 0) {
      console.log('\n📋 Files at root level of batch-logs bucket:');
      rootFiles.forEach(f => console.log(`   - ${f.name}`));
    } else {
      console.log('\n📋 The batch-logs bucket is empty.');
    }
    return;
  }
  
  console.log(`\n📋 Log files for job ${jobId}:`);
  for (const file of files) {
    console.log(`   - ${file.name} (${file.metadata?.size || 'unknown'} bytes)`);
    
    // Download and show first few lines of log.txt
    if (file.name === 'log.txt') {
      const { data: logData, error: downloadError } = await supabase.storage
        .from('batch-logs')
        .download(`${jobId}/log.txt`);
        
      if (!downloadError && logData) {
        const text = await logData.text();
        const lines = text.split('\n');
        console.log(`\n📜 Log preview (${lines.length} lines total):`);
        console.log('   --- First 5 lines ---');
        lines.slice(0, 5).forEach(line => console.log(`   ${line}`));
        console.log('   --- Last 5 lines ---');
        lines.slice(-5).forEach(line => console.log(`   ${line}`));
      }
    }
  }
  
  console.log('\n✅ Log file location: Supabase Storage > batch-logs > {jobId}/log.txt');
}

checkBatchLogs().catch(console.error);

