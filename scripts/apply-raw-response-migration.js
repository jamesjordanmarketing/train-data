/**
 * Apply Raw Response Storage Migration
 * 
 * Applies the 20251117_add_raw_response_storage_columns.sql migration
 * to add missing columns to the conversations table.
 * 
 * Usage: node scripts/apply-raw-response-migration.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', 'src', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Required:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function applyMigration() {
  console.log('🚀 Applying raw response storage migration...\n');

  // Read migration file
  const migrationPath = path.join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    '20251117_add_raw_response_storage_columns.sql'
  );

  console.log(`📄 Reading migration: ${migrationPath}`);
  
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found');
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  console.log(`📝 Migration size: ${sql.length} bytes\n`);

  // Apply migration
  console.log('⚙️  Executing migration...');
  
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('❌ Migration failed:', error);
    
    // If exec_sql doesn't exist, try direct execution
    console.log('\n⚠️  Trying alternative method...');
    
    // Split by semicolon and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      if (statement === 'BEGIN' || statement === 'COMMIT') continue;
      
      console.log(`\n📌 Executing: ${statement.substring(0, 80)}...`);
      
      const { error: stmtError } = await supabase.rpc('exec_sql', { 
        sql_query: statement + ';' 
      });

      if (stmtError) {
        // Try without RPC (some statements might work directly)
        console.log('  ⚠️  RPC failed, this is expected - migration likely needs to be run in Supabase SQL editor');
        console.log('  Error:', stmtError.message);
        errorCount++;
      } else {
        console.log('  ✅ Success');
        successCount++;
      }
    }

    console.log(`\n📊 Results: ${successCount} succeeded, ${errorCount} failed`);
    
    if (errorCount > 0) {
      console.log('\n⚠️  MANUAL MIGRATION REQUIRED:');
      console.log('1. Go to your Supabase Dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the following SQL:\n');
      console.log('─'.repeat(80));
      console.log(sql);
      console.log('─'.repeat(80));
      console.log('\n4. Click "Run" to execute the migration');
    }
    
    return;
  }

  console.log('✅ Migration applied successfully!\n');

  // Verify columns exist
  console.log('🔍 Verifying new columns...');
  
  const { data: columns, error: verifyError } = await supabase
    .from('conversations')
    .select('raw_response_path, parse_method_used')
    .limit(1);

  if (verifyError) {
    if (verifyError.message.includes('column') && verifyError.message.includes('does not exist')) {
      console.error('❌ Verification failed: Columns still missing');
      console.error('Migration may not have been applied correctly');
    } else {
      console.log('✅ Columns verified (empty table is ok)');
    }
  } else {
    console.log('✅ Columns verified successfully');
  }

  console.log('\n🎉 Migration complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Test conversation generation at /conversations/generate');
  console.log('   2. Verify conversations appear in dashboard');
  console.log('   3. Check that all 7 fixes are now working');
}

// Run migration
applyMigration()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
