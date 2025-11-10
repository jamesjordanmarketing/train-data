#!/usr/bin/env node

/**
 * Execute SQL Files via exec_sql RPC
 * Reads SQL files and executes them using Supabase exec_sql RPC function
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function executeSqlFile(filePath, description) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📄 ${description}`);
  console.log(`${'='.repeat(70)}`);
  console.log(`File: ${path.basename(filePath)}\n`);

  // Read SQL file
  const sql = fs.readFileSync(filePath, 'utf8');

  // Remove comments and empty lines for cleaner output
  const lines = sql.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith('--');
  });

  console.log(`SQL size: ${lines.length} lines, ${sql.length} bytes\n`);

  try {
    console.log('⏳ Executing SQL...');

    // Execute via exec_sql RPC function
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_script: sql
    });

    if (error) {
      console.error('❌ Error executing SQL:');
      console.error(error);
      return { success: false, error };
    }

    console.log('✅ SQL executed successfully!');
    if (data) {
      console.log('Result:', JSON.stringify(data, null, 2));
    }

    return { success: true, data };

  } catch (error) {
    console.error('❌ Exception:', error.message);
    return { success: false, error };
  }
}

async function main() {
  console.log('='.repeat(70));
  console.log('🚀 EXECUTING SQL FILES VIA exec_sql RPC');
  console.log('='.repeat(70));

  try {
    // Test connection
    console.log('\n📋 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('conversations')
      .select('count')
      .limit(1);

    if (testError && !testError.message.includes('JSON object')) {
      throw new Error(`Database connection failed: ${testError.message}`);
    }

    console.log('   ✅ Connected to Supabase\n');

    // Execute templates SQL
    const templatesResult = await executeSqlFile(
      path.join(__dirname, 'generated-sql/insert-templates.sql'),
      'INSERTING TEMPLATES'
    );

    if (!templatesResult.success) {
      console.error('\n❌ Failed to execute templates SQL');
      console.error('Aborting remaining executions');
      process.exit(1);
    }

    // Execute conversations SQL
    const conversationsResult = await executeSqlFile(
      path.join(__dirname, 'generated-sql/insert-conversations.sql'),
      'INSERTING CONVERSATIONS'
    );

    if (!conversationsResult.success) {
      console.error('\n❌ Failed to execute conversations SQL');
      process.exit(1);
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 EXECUTION SUMMARY');
    console.log('='.repeat(70));
    console.log('✅ Templates: Executed successfully');
    console.log('✅ Conversations: Executed successfully');
    console.log('\n🎉 ALL SQL FILES EXECUTED SUCCESSFULLY!\n');
    console.log('Next step: Run verification');
    console.log('  node src/scripts/verify-data-insertion.js\n');

  } catch (error) {
    console.error('\n❌ Fatal Error:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }

  console.log('='.repeat(70));
}

// Execute
if (require.main === module) {
  main().catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });
}

module.exports = { executeSqlFile };
