/**
 * Quick test to verify batchJobService returns correct data
 */

require('dotenv').config({ path: './.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Use same logic as createServerSupabaseAdminClient
const supabaseUrl = 'https://dnjnsotemnfrjlotgved.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not found!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  const jobId = '27eaf2df-9619-4baf-ac59-f74989f05d23';
  
  console.log('Testing direct Supabase query for job:', jobId);
  
  const { data: jobData, error: jobError } = await supabase
    .from('batch_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (jobError) {
    console.error('Error:', jobError);
    return;
  }

  console.log('Job from database:', {
    id: jobData.id,
    status: jobData.status,
    total_items: jobData.total_items,
    completed_items: jobData.completed_items,
    successful_items: jobData.successful_items,
    failed_items: jobData.failed_items,
  });
}

main().catch(console.error);
