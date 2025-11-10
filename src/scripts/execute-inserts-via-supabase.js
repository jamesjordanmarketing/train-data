#!/usr/bin/env node

/**
 * Execute SQL Inserts via Supabase Client
 *
 * This script reads the generated SQL files and executes them using
 * the Supabase JavaScript client by parsing INSERT statements and
 * converting them to client method calls.
 */

const fs = require('fs');
const path = require('path');

// Load environment
const envPath = path.resolve(__dirname, '../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=').replace(/^["']|["']$/g, '');
  if (key && value) envVars[key.trim()] = value.trim();
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================================================
// SQL Parser (Simplified for INSERT statements)
// ============================================================================

function parseInsertStatement(sql) {
  // Extract table name
  const tableMatch = sql.match(/INSERT INTO\s+(\w+)\s*\(/i);
  if (!tableMatch) return null;

  const tableName = tableMatch[1];

  // Extract column names
  const columnsMatch = sql.match(/INSERT INTO\s+\w+\s*\(([\s\S]*?)\)\s*VALUES/i);
  if (!columnsMatch) return null;

  const columns = columnsMatch[1]
    .split(',')
    .map(c => c.trim())
    .filter(c => c.length > 0);

  // Extract values - this is complex due to JSONB and nested structures
  // For now, we'll execute the raw SQL via RPC if available

  return {
    tableName,
    columns,
    rawSql: sql
  };
}

// ============================================================================
// Raw SQL Execution via Supabase
// ============================================================================

async function executeRawSql(sql) {
  // Try to execute via RPC if available
  // Supabase doesn't have a built-in raw SQL RPC by default
  // We would need to create one in the database first

  const { data, error } = await supabase.rpc('exec_sql', {
    query: sql
  });

  return { data, error };
}

// ============================================================================
// Direct Insert via Supabase Client
// ============================================================================

async function insertViaClient(tableName, data) {
  const { data: result, error } = await supabase
    .from(tableName)
    .insert(data);

  return { data: result, error };
}

// ============================================================================
// Execute SQL File
// ============================================================================

async function executeSqlFile(filePath, description) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📄 ${description}`);
  console.log(`${'='.repeat(70)}`);
  console.log(`File: ${path.basename(filePath)}\n`);

  const sql = fs.readFileSync(filePath, 'utf8');

  // Split into individual INSERT statements
  const statements = sql
    .split(/;\s*$/m)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && s.toUpperCase().includes('INSERT'));

  console.log(`Found ${statements.length} INSERT statements\n`);

  let successCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < statements.length; i++) {
    try {
      const stmt = statements[i] + ';';

      // Try RPC execution first
      const { data, error } = await executeRawSql(stmt);

      if (error) {
        // RPC not available or error
        if (error.message && error.message.includes('Could not find the function')) {
          // RPC function doesn't exist - provide alternative
          console.log(`\n⚠️  Raw SQL execution via RPC not available`);
          console.log(`   This requires creating an exec_sql() function in Supabase`);
          console.log(`\n   Please use Manual Execution instead:`);
          console.log(`   1. Open Supabase SQL Editor`);
          console.log(`   2. Copy/paste SQL file contents`);
          console.log(`   3. Execute\n`);
          return { successCount: 0, failCount: statements.length, requiresManual: true };
        }

        throw error;
      }

      successCount++;

      if ((i + 1) % 5 === 0 || i === statements.length - 1) {
        process.stdout.write(`\r   Progress: ${i + 1}/${statements.length}`);
      }

    } catch (error) {
      failCount++;
      errors.push({
        statement: i + 1,
        error: error.message
      });

      // Don't spam errors
      if (failCount === 1) {
        console.error(`\n   ❌ Error: ${error.message}`);
      }
    }
  }

  console.log(`\n\n   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}\n`);

  return { successCount, failCount, errors };
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('='.repeat(70));
  console.log('🚀 DATABASE POPULATION - SUPABASE CLIENT');
  console.log('='.repeat(70));

  try {
    // Test RPC availability first
    console.log('\n📋 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('conversations')
      .select('count')
      .limit(1);

    if (testError) {
      throw new Error(`Database connection failed: ${testError.message}`);
    }

    console.log('   ✅ Connected to Supabase\n');

    // Try to execute a test SQL
    console.log('📋 Testing raw SQL execution capability...');
    const { error: rpcError } = await supabase.rpc('exec_sql', {
      query: 'SELECT 1 as test'
    });

    if (rpcError) {
      if (rpcError.message.includes('Could not find the function')) {
        console.log('   ⚠️  Raw SQL RPC not available\n');
        console.log('   This is expected - Supabase does not provide raw SQL execution by default.\n');

        // Provide manual execution instructions
        console.log('='.repeat(70));
        console.log('📖 MANUAL EXECUTION REQUIRED');
        console.log('='.repeat(70));
        console.log(`
The Supabase JavaScript client doesn't support raw SQL execution for
complex INSERT statements with JSONB fields.

PLEASE EXECUTE MANUALLY:

1. Open Supabase SQL Editor:
   https://supabase.com/dashboard → Your Project → SQL Editor

2. Execute Templates (small file):
   - Copy: ${path.resolve('scripts/generated-sql/insert-templates.sql')}
   - Paste into SQL Editor
   - Click Run (should take <1 second)

3. Execute Conversations (larger file):
   - Copy: ${path.resolve('scripts/generated-sql/insert-conversations.sql')}
   - Paste into SQL Editor
   - Click Run (may take 5-10 seconds)

4. Verify insertion:
   Run: node scripts/verify-data-insertion.js

ESTIMATED TIME: 5 minutes
`);
        console.log('='.repeat(70));

        return;
      }

      throw rpcError;
    }

    console.log('   ✅ Raw SQL execution available!\n');

    // Execute SQL files
    const templatesResult = await executeSqlFile(
      path.join(__dirname, 'generated-sql/insert-templates.sql'),
      'INSERTING TEMPLATES'
    );

    if (templatesResult.requiresManual) {
      return; // Already showed manual instructions
    }

    const conversationsResult = await executeSqlFile(
      path.join(__dirname, 'generated-sql/insert-conversations.sql'),
      'INSERTING CONVERSATIONS'
    );

    if (conversationsResult.requiresManual) {
      return;
    }

    // Summary
    console.log('='.repeat(70));
    console.log('📊 EXECUTION SUMMARY');
    console.log('='.repeat(70));
    console.log(`Templates: ${templatesResult.successCount} inserted`);
    console.log(`Conversations: ${conversationsResult.successCount} inserted`);
    console.log(`\nTotal Success: ${templatesResult.successCount + conversationsResult.successCount}`);
    console.log(`Total Failed: ${templatesResult.failCount + conversationsResult.failCount}`);

    if (templatesResult.failCount + conversationsResult.failCount === 0) {
      console.log(`\n🎉 ALL INSERTS SUCCESSFUL!\n`);
      console.log(`Next step: Run verification`);
      console.log(`  node scripts/verify-data-insertion.js\n`);
    } else {
      console.log(`\n⚠️  SOME INSERTS FAILED\n`);
      console.log(`Please check errors above and retry if needed.`);
      console.log(`Or use manual execution via Supabase SQL Editor.\n`);
    }

  } catch (error) {
    console.error('\n❌ Fatal Error:', error.message);
    console.error('\nPlease use manual execution method:');
    console.error('See: scripts/generated-sql/EXECUTION-INSTRUCTIONS.md\n');
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
