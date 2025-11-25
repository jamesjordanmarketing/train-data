/**
 * Check and fix batch_jobs table schema
 */

const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    process.env[key.trim()] = values.join('=').trim();
  }
});

async function checkAndFixSchema() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('🔍 Checking batch_jobs table...\n');

    // Try to query a batch job to see what columns exist
    const { data: testData, error: testError } = await supabase
      .from('batch_jobs')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('❌ Error querying batch_jobs:', testError.message);
    } else {
      console.log('📋 Sample record structure:');
      if (testData && testData.length > 0) {
        console.log(JSON.stringify(testData[0], null, 2));
      } else {
        console.log('   (No records found)');
      }
    }

    console.log('\n🔧 Adding missing columns...\n');

    // Add error_handling column if it doesn't exist
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE batch_jobs 
        ADD COLUMN IF NOT EXISTS error_handling VARCHAR(20) DEFAULT 'continue';
        
        COMMENT ON COLUMN batch_jobs.error_handling IS 
        'Error handling strategy: stop (halt on first error) or continue (process all items)';
      `
    });

    if (alterError) {
      console.log('⚠️  Could not add column via RPC (may need to use Supabase SQL editor)');
      console.log('   Error:', alterError.message);
      console.log('\n📝 Run this SQL in Supabase SQL Editor:');
      console.log(`
ALTER TABLE batch_jobs 
ADD COLUMN IF NOT EXISTS error_handling VARCHAR(20) DEFAULT 'continue';

COMMENT ON COLUMN batch_jobs.error_handling IS 
'Error handling strategy: stop (halt on first error) or continue (process all items)';
      `);
    } else {
      console.log('✅ Column added successfully');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

checkAndFixSchema().catch(console.error);
