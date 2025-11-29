/**
 * Debug script: Check batch job status
 * Usage: node scripts/check-batch-status.js <job-id>
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const jobId = process.argv[2];

if (!jobId) {
  console.error('Usage: node scripts/check-batch-status.js <job-id>');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkBatchStatus() {
  console.log(`\n🔍 Checking status for batch job: ${jobId}\n`);

  // Get batch job
  const { data: job, error: jobError } = await supabase
    .from('batch_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (jobError) {
    console.error('❌ Error fetching job:', jobError.message);
    return;
  }

  if (!job) {
    console.error('❌ Job not found');
    return;
  }

  console.log('📊 Batch Job Status:');
  console.log(`   ID: ${job.id}`);
  console.log(`   Name: ${job.name}`);
  console.log(`   Status: ${job.status} ⬅️ THIS IS THE STATUS`);
  console.log(`   Total Items: ${job.total_items}`);
  console.log(`   Completed: ${job.completed_items}`);
  console.log(`   Successful: ${job.successful_items}`);
  console.log(`   Failed: ${job.failed_items}`);
  console.log(`   Created: ${job.created_at}`);
  console.log(`   Started: ${job.started_at || 'N/A'}`);
  console.log(`   Completed: ${job.completed_at || 'N/A'}`);

  // Get batch items
  const { data: items, error: itemsError } = await supabase
    .from('batch_items')
    .select('id, position, status, conversation_id, error_message')
    .eq('batch_job_id', jobId)
    .order('position');

  if (itemsError) {
    console.error('❌ Error fetching items:', itemsError.message);
    return;
  }

  console.log(`\n📋 Batch Items (${items?.length || 0} total):`);
  items?.forEach(item => {
    const statusIcon = item.status === 'completed' ? '✅' : 
                      item.status === 'failed' ? '❌' : 
                      item.status === 'processing' ? '⏳' : '⏸️';
    console.log(`   ${statusIcon} Item ${item.position}: ${item.status}`);
    if (item.conversation_id) {
      console.log(`      └─ Conversation: ${item.conversation_id}`);
    }
    if (item.error_message) {
      console.log(`      └─ Error: ${item.error_message}`);
    }
  });

  // Summary
  const queuedCount = items?.filter(i => i.status === 'queued').length || 0;
  const processingCount = items?.filter(i => i.status === 'processing').length || 0;
  const completedCount = items?.filter(i => i.status === 'completed').length || 0;
  const failedCount = items?.filter(i => i.status === 'failed').length || 0;

  console.log(`\n📈 Summary:`);
  console.log(`   Queued: ${queuedCount}`);
  console.log(`   Processing: ${processingCount}`);
  console.log(`   Completed: ${completedCount}`);
  console.log(`   Failed: ${failedCount}`);

  // Diagnosis
  console.log(`\n💡 Diagnosis:`);
  if (job.status === 'completed') {
    console.log(`   ✅ Job is marked as COMPLETED in database`);
    console.log(`   ➡️  UI should show completion. If not, this is a frontend issue.`);
  } else if (job.completed_items >= job.total_items) {
    console.log(`   ⚠️  All items are done but job status is still: ${job.status}`);
    console.log(`   ➡️  This is a backend bug - incrementProgress didn't update status`);
  } else if (queuedCount === 0 && processingCount > 0) {
    console.log(`   ⚠️  No queued items but some still processing`);
    console.log(`   ➡️  Items may be stuck in 'processing' state`);
  } else if (queuedCount > 0) {
    console.log(`   ⏳ ${queuedCount} items still queued`);
    console.log(`   ➡️  Processing may have stopped prematurely`);
  }

  console.log();
}

checkBatchStatus().catch(console.error);

