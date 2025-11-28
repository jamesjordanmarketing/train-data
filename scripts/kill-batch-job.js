/**
 * Kill a running batch job by setting its status to 'completed'
 * 
 * Usage: node scripts/kill-batch-job.js <job_id>
 */

require('../load-env.js');
const { createClient } = require('@supabase/supabase-js');

const jobId = process.argv[2] || 'ea1fc6e7-7dc3-476b-a8ff-7d12e0c918fe';

async function killJob() {
  console.log(`\n🔪 Killing batch job: ${jobId}\n`);
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  // First get the current job status
  const { data: job, error: fetchError } = await supabase
    .from('batch_jobs')
    .select('*')
    .eq('id', jobId)
    .single();
    
  if (fetchError) {
    console.error('❌ Failed to fetch job:', fetchError.message);
    return;
  }
  
  console.log('📊 Current job status:');
  console.log(`   Status: ${job.status}`);
  console.log(`   Total items: ${job.total_items}`);
  console.log(`   Completed items: ${job.completed_items}`);
  console.log(`   Successful items: ${job.successful_items}`);
  console.log(`   Failed items: ${job.failed_items}`);
  
  // Update job status to 'completed'
  const { error: updateError } = await supabase
    .from('batch_jobs')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', jobId);
    
  if (updateError) {
    console.error('❌ Failed to update job:', updateError.message);
    return;
  }
  
  // Also update any remaining 'queued' or 'processing' items to 'completed'
  const { data: updatedItems, error: itemsError } = await supabase
    .from('batch_items')
    .update({
      status: 'completed',
      processed_at: new Date().toISOString()
    })
    .eq('batch_job_id', jobId)
    .in('status', ['queued', 'processing'])
    .select();
    
  if (itemsError) {
    console.error('⚠️ Warning: Failed to update items:', itemsError.message);
  } else {
    console.log(`\n✅ Updated ${updatedItems?.length || 0} remaining items to completed`);
  }
  
  console.log('\n✅ Job killed successfully!');
  console.log('   ⚠️ IMPORTANT: Close the browser tab with the batch job page to stop the client-side polling.');
}

killJob().catch(console.error);

