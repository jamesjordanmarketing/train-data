/**
 * Supabase Raw SQL Execution Test
 *
 * Tests if Supabase has exec_sql RPC function available
 * for executing raw SQL queries.
 *
 * Usage: node test-supabase-raw-sql.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../.env.local' });

async function testRpcExecSql() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Supabase RPC exec_sql Function Test');
  console.log('═══════════════════════════════════════════════════\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log('📋 Configuration:');
  console.log(`   Supabase URL: ${supabaseUrl}`);
  console.log(`   Service Role: ${'*'.repeat(20)}...${serviceRoleKey.slice(-10)}\n`);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Test 1: Check if exec_sql exists
  console.log('TEST 1: Check if exec_sql RPC function exists');
  console.log('─'.repeat(50));

  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: 'SELECT current_database(), current_user, version();'
    });

    if (error) {
      console.log('❌ exec_sql RPC not available');
      console.log(`   Error: ${error.message}`);
      console.log(`   Code: ${error.code}\n`);

      if (error.message.includes('Could not find the function')) {
        console.log('💡 The exec_sql function does not exist in your database.');
        console.log('   This function needs to be created manually.\n');
        return { available: false, needsCreation: true };
      }

      return { available: false, needsCreation: false, error: error.message };

    } else {
      console.log('✅ exec_sql RPC is available and working!');
      console.log('\n📊 Query Results:');
      console.log(JSON.stringify(data, null, 2));
      console.log('');
      return { available: true, needsCreation: false };
    }

  } catch (err) {
    console.log('❌ Unexpected error:');
    console.log(`   ${err.message}\n`);
    return { available: false, needsCreation: false, error: err.message };
  }
}

async function testAlternativeMethods() {
  console.log('TEST 2: Alternative Query Methods');
  console.log('─'.repeat(50));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Test direct table access
  console.log('\n📊 Testing direct table access (via PostgREST)...');

  try {
    const { count, error } = await supabase
      .from('templates')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log('❌ Direct table access failed:');
      console.log(`   ${error.message}\n`);
      return false;
    }

    console.log('✅ Direct table access working!');
    console.log(`   Templates count: ${count}\n`);
    return true;

  } catch (err) {
    console.log('❌ Unexpected error:');
    console.log(`   ${err.message}\n`);
    return false;
  }
}

async function provideSqlForExecSqlCreation() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  SQL to Create exec_sql Function');
  console.log('═══════════════════════════════════════════════════\n');

  const sql = `
-- Create exec_sql function for executing arbitrary SQL
-- This is a SECURITY DEFINER function that runs with elevated privileges

CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_json json;
  row_data record;
  result_array json[] := '{}';
BEGIN
  -- Execute the query and build JSON array
  FOR row_data IN EXECUTE sql_query LOOP
    result_array := result_array || row_to_json(row_data);
  END LOOP;

  -- Return as JSON array
  RETURN array_to_json(result_array);
END;
$$;

-- Grant execute permission to service_role
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;

-- Grant execute permission to postgres role (for dashboard use)
GRANT EXECUTE ON FUNCTION exec_sql(text) TO postgres;

COMMENT ON FUNCTION exec_sql(text) IS 'Execute arbitrary SQL and return results as JSON. Use with caution - runs with SECURITY DEFINER.';
`;

  console.log('Copy the SQL below and execute it in Supabase Dashboard:');
  console.log('(Dashboard → SQL Editor → New query → Paste → Run)\n');
  console.log('─'.repeat(50));
  console.log(sql);
  console.log('─'.repeat(50));
  console.log('\nAfter creating the function, run this test again to verify.\n');
}

async function main() {
  console.log('\n🔍 SUPABASE RAW SQL EXECUTION TEST\n');

  // Test exec_sql availability
  const execSqlResult = await testRpcExecSql();

  // Test alternative methods
  const directAccessWorks = await testAlternativeMethods();

  // Summary
  console.log('═══════════════════════════════════════════════════');
  console.log('  SUMMARY & RECOMMENDATIONS');
  console.log('═══════════════════════════════════════════════════\n');

  if (execSqlResult.available) {
    console.log('✅ RECOMMENDATION: Use exec_sql RPC');
    console.log('   The exec_sql function is available and working.');
    console.log('   You can execute raw SQL queries via Supabase client.\n');

    console.log('📝 Example Usage:');
    console.log('   const { data, error } = await supabase.rpc("exec_sql", {');
    console.log('     sql_query: "SELECT * FROM templates LIMIT 1"');
    console.log('   });\n');

    console.log('Next Steps:');
    console.log('   1. Update scripts to use exec_sql RPC for raw SQL');
    console.log('   2. This avoids need for direct PostgreSQL connection');
    console.log('   3. Document in connection-issues_v1.md\n');

  } else if (execSqlResult.needsCreation) {
    console.log('⚠️  RECOMMENDATION: Create exec_sql Function');
    console.log('   The exec_sql function does not exist but can be created.\n');

    await provideSqlForExecSqlCreation();

    console.log('Alternative:');
    if (directAccessWorks) {
      console.log('   ✅ Direct table access works via Supabase client');
      console.log('   You can use .from().insert() instead of raw SQL');
      console.log('   This requires parsing SQL files but avoids exec_sql\n');
    }

  } else {
    console.log('❌ ISSUE: Neither exec_sql nor direct connection available\n');

    if (directAccessWorks) {
      console.log('✅ FALLBACK: Direct table access works');
      console.log('   Use Supabase client with .from().insert() methods');
      console.log('   This requires adapting scripts to use Supabase client API\n');

      console.log('Next Steps:');
      console.log('   1. Create script to parse SQL files');
      console.log('   2. Convert INSERT statements to .from().insert() calls');
      console.log('   3. Execute via Supabase client\n');

    } else {
      console.log('❌ HARD BLOCK: No database access methods available');
      console.log('   Neither exec_sql, direct PostgreSQL, nor table access works\n');

      console.log('Diagnostic Steps:');
      console.log('   1. Check Supabase project status');
      console.log('   2. Verify service role key is correct');
      console.log('   3. Check RLS policies on tables');
      console.log('   4. Contact Supabase support\n');
    }
  }

  console.log('═══════════════════════════════════════════════════');
  console.log('Document results in:');
  console.log('  pmc/context-ai/pmct/mock-data-execution-prompt-connection-issues_v1.md');
  console.log('═══════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('\n❌ FATAL ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
});
