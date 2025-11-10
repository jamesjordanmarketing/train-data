/**
 * Database Introspection Script v2
 *
 * Enumerates tables, columns, indexes, constraints, triggers, and functions
 * Focuses on templates and conversations tables for E02 module
 *
 * Usage: node introspect-db-objects_v2.js
 * Output: src/scripts/generated-sql/db-introspection.md
 */

require('dotenv').config({ path: '../../.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client for RPC fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing required Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

let report = [];
let useDirectPg = false;
let pgClient = null;

/**
 * Execute SQL query via direct PostgreSQL connection or Supabase RPC
 */
async function execSql(sql) {
  if (useDirectPg && pgClient) {
    const result = await pgClient.query(sql);
    return result.rows;
  } else {
    // Fallback to Supabase RPC (if available)
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
      throw new Error(`Cannot execute SQL: ${error.message}. DATABASE_URL required for schema introspection.`);
    }
    return data;
  }
}

/**
 * Add section to report
 */
function addSection(title, content) {
  report.push(`\n## ${title}\n`);
  report.push(content);
}

/**
 * Format table data as markdown
 */
function formatTable(headers, rows) {
  if (!rows || rows.length === 0) {
    return '*No data found*\n';
  }

  let table = '| ' + headers.join(' | ') + ' |\n';
  table += '| ' + headers.map(() => '---').join(' | ') + ' |\n';

  rows.forEach(row => {
    const values = headers.map(h => {
      const val = row[h.toLowerCase().replace(/ /g, '_')];
      return val === null ? 'NULL' : String(val);
    });
    table += '| ' + values.join(' | ') + ' |\n';
  });

  return table;
}

/**
 * Get all tables
 */
async function getTables() {
  console.log('📊 Querying tables...');

  const sql = `
    SELECT
      table_schema,
      table_name,
      table_type
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY table_schema, table_name;
  `;

  const result = await execSql(sql);

  addSection('Database Tables', formatTable(
    ['Table Schema', 'Table Name', 'Table Type'],
    result
  ));

  return result;
}

/**
 * Get columns for specific tables
 */
async function getColumns(tableName) {
  console.log(`📋 Querying columns for ${tableName}...`);

  const sql = `
    SELECT
      column_name,
      data_type,
      is_nullable,
      column_default,
      character_maximum_length,
      numeric_precision
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = '${tableName}'
    ORDER BY ordinal_position;
  `;

  const result = await execSql(sql);

  addSection(`Columns: ${tableName}`, formatTable(
    ['Column Name', 'Data Type', 'Is Nullable', 'Column Default', 'Character Maximum Length', 'Numeric Precision'],
    result
  ));

  return result;
}

/**
 * Get indexes for specific table
 */
async function getIndexes(tableName) {
  console.log(`🔍 Querying indexes for ${tableName}...`);

  const sql = `
    SELECT
      indexname as index_name,
      indexdef as index_definition
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = '${tableName}'
    ORDER BY indexname;
  `;

  const result = await execSql(sql);

  addSection(`Indexes: ${tableName}`, formatTable(
    ['Index Name', 'Index Definition'],
    result
  ));

  return result;
}

/**
 * Get constraints for specific table
 */
async function getConstraints(tableName) {
  console.log(`🔒 Querying constraints for ${tableName}...`);

  const sql = `
    SELECT
      tc.constraint_name,
      tc.constraint_type,
      kcu.column_name,
      rc.unique_constraint_name as references_constraint,
      ccu.table_name as references_table,
      ccu.column_name as references_column,
      tc.is_deferrable,
      tc.initially_deferred
    FROM information_schema.table_constraints tc
    LEFT JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    LEFT JOIN information_schema.referential_constraints rc
      ON tc.constraint_name = rc.constraint_name
      AND tc.table_schema = rc.constraint_schema
    LEFT JOIN information_schema.constraint_column_usage ccu
      ON rc.unique_constraint_name = ccu.constraint_name
      AND rc.unique_constraint_schema = ccu.constraint_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name = '${tableName}'
    ORDER BY tc.constraint_type, tc.constraint_name;
  `;

  const result = await execSql(sql);

  addSection(`Constraints: ${tableName}`, formatTable(
    ['Constraint Name', 'Constraint Type', 'Column Name', 'References Constraint', 'References Table', 'References Column', 'Is Deferrable', 'Initially Deferred'],
    result
  ));

  return result;
}

/**
 * Get triggers for specific table
 */
async function getTriggers(tableName) {
  console.log(`⚡ Querying triggers for ${tableName}...`);

  const sql = `
    SELECT
      t.trigger_name,
      t.event_manipulation as event,
      t.action_timing as timing,
      t.action_statement as action
    FROM information_schema.triggers t
    WHERE t.event_object_schema = 'public'
      AND t.event_object_table = '${tableName}'
    ORDER BY t.trigger_name;
  `;

  const result = await execSql(sql);

  addSection(`Triggers: ${tableName}`, formatTable(
    ['Trigger Name', 'Event', 'Timing', 'Action'],
    result
  ));

  return result;
}

/**
 * Get RLS policies for specific table
 */
async function getRlsPolicies(tableName) {
  console.log(`🛡️  Querying RLS policies for ${tableName}...`);

  const sql = `
    SELECT
      schemaname,
      tablename,
      policyname as policy_name,
      permissive,
      roles,
      cmd as command,
      qual as using_expression,
      with_check as with_check_expression
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = '${tableName}'
    ORDER BY policyname;
  `;

  const result = await execSql(sql);

  addSection(`RLS Policies: ${tableName}`, formatTable(
    ['Schema Name', 'Table Name', 'Policy Name', 'Permissive', 'Roles', 'Command', 'Using Expression', 'With Check Expression'],
    result
  ));

  return result;
}

/**
 * Check if RLS is enabled on table
 */
async function checkRlsEnabled(tableName) {
  console.log(`🔐 Checking RLS status for ${tableName}...`);

  const sql = `
    SELECT
      tablename,
      rowsecurity as rls_enabled
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = '${tableName}';
  `;

  const result = await execSql(sql);

  if (result && result.length > 0) {
    const rlsStatus = result[0].rls_enabled ? '✅ ENABLED' : '❌ DISABLED';
    addSection(`RLS Status: ${tableName}`, `**RLS is ${rlsStatus}**\n`);
  }

  return result;
}

/**
 * Get custom functions in public schema
 */
async function getFunctions() {
  console.log('⚙️  Querying custom functions...');

  const sql = `
    SELECT
      p.proname as function_name,
      pg_get_function_identity_arguments(p.oid) as arguments,
      t.typname as return_type,
      CASE
        WHEN p.prosecdef THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
      END as security,
      p.provolatile as volatility
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    JOIN pg_type t ON p.prorettype = t.oid
    WHERE n.nspname = 'public'
      AND p.prokind = 'f'
    ORDER BY p.proname;
  `;

  const result = await execSql(sql);

  addSection('Custom Functions (Public Schema)', formatTable(
    ['Function Name', 'Arguments', 'Return Type', 'Security', 'Volatility'],
    result
  ));

  return result;
}

/**
 * Get table row counts
 */
async function getRowCounts(tableName) {
  console.log(`📊 Counting rows in ${tableName}...`);

  const sql = `SELECT COUNT(*) as row_count FROM public.${tableName};`;

  const result = await execSql(sql);

  if (result && result.length > 0) {
    addSection(`Row Count: ${tableName}`, `**${result[0].row_count} rows**\n`);
  }

  return result;
}

/**
 * Check for blocking policies
 */
async function analyzeInsertBlocks(tableName) {
  console.log(`🔍 Analyzing potential insert blocks for ${tableName}...`);

  let analysis = '### Analysis\n\n';

  // Check RLS status
  const rlsSql = `
    SELECT rowsecurity FROM pg_tables
    WHERE schemaname = 'public' AND tablename = '${tableName}';
  `;
  const rlsResult = await execSqlViaRpc(rlsSql);

  if (rlsResult && rlsResult.length > 0 && rlsResult[0].rowsecurity) {
    analysis += '⚠️  **RLS is ENABLED** - Service role key should bypass RLS\n\n';

    // Get INSERT policies
    const policySql = `
      SELECT policyname, roles, qual, with_check
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = '${tableName}'
        AND cmd = 'INSERT';
    `;
    const policies = await execSqlViaRpc(policySql);

    if (policies && policies.length > 0) {
      analysis += `Found ${policies.length} INSERT policies:\n\n`;
      policies.forEach(p => {
        analysis += `- **${p.policyname}** (roles: ${p.roles})\n`;
      });
    } else {
      analysis += '✅ No INSERT policies found - should allow inserts with service role\n\n';
    }
  } else {
    analysis += '✅ **RLS is DISABLED** - No RLS blocking\n\n';
  }

  // Check for INSERT triggers
  const triggerSql = `
    SELECT trigger_name, action_timing, action_statement
    FROM information_schema.triggers
    WHERE event_object_schema = 'public'
      AND event_object_table = '${tableName}'
      AND event_manipulation = 'INSERT';
  `;
  const triggers = await execSqlViaRpc(triggerSql);

  if (triggers && triggers.length > 0) {
    analysis += `⚠️  Found ${triggers.length} INSERT triggers:\n\n`;
    triggers.forEach(t => {
      analysis += `- **${t.trigger_name}** (${t.action_timing})\n`;
    });
    analysis += '\n*Triggers may modify data but should not block inserts*\n\n';
  } else {
    analysis += '✅ No INSERT triggers found\n\n';
  }

  // Check for NOT NULL constraints
  const notNullSql = `
    SELECT column_name, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = '${tableName}'
      AND is_nullable = 'NO'
      AND column_default IS NULL;
  `;
  const notNullCols = await execSqlViaRpc(notNullSql);

  if (notNullCols && notNullCols.length > 0) {
    analysis += `⚠️  Required columns (NOT NULL without default):\n\n`;
    notNullCols.forEach(c => {
      analysis += `- **${c.column_name}** - must be provided in INSERT\n`;
    });
    analysis += '\n';
  } else {
    analysis += '✅ All NOT NULL columns have defaults\n\n';
  }

  addSection(`Insert Block Analysis: ${tableName}`, analysis);
}

/**
 * Main execution
 */
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Database Introspection Script v2');
  console.log('═══════════════════════════════════════════════════');
  console.log(`Supabase URL: ${supabaseUrl}`);

  // Try to connect via DATABASE_URL if available
  if (databaseUrl) {
    console.log(`DATABASE_URL: ✅ Configured`);
    console.log(`Using: Direct PostgreSQL connection`);
    try {
      pgClient = new Client({ connectionString: databaseUrl });
      await pgClient.connect();
      useDirectPg = true;
      console.log('✅ Connected to PostgreSQL');
    } catch (err) {
      console.error('❌ Failed to connect via DATABASE_URL:', err.message);
      console.log('Falling back to Supabase client (limited)');
      useDirectPg = false;
    }
  } else {
    console.log(`DATABASE_URL: ❌ Not configured`);
    console.log(`\n⚠️  For full schema introspection, add DATABASE_URL to .env.local`);
    console.log(`   Format: DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`);
    console.log(`   Get from: Supabase Dashboard → Settings → Database → Connection String (URI)`);
    console.log(`\nAttempting limited introspection via Supabase client...\n`);
  }

  console.log('═══════════════════════════════════════════════════\n');

  // Initialize report
  report.push('# Database Introspection Report\n');
  report.push(`**Generated**: ${new Date().toISOString()}\n`);
  report.push(`**Method**: ${useDirectPg ? 'Direct PostgreSQL' : 'Supabase Client (limited)'}\n`);
  report.push(`**Database**: ${supabaseUrl}\n`);

  try {
    // Get all tables
    const tables = await getTables();

    // Focus on templates and conversations tables
    const targetTables = ['templates', 'conversations'];

    for (const tableName of targetTables) {
      const tableExists = tables.some(t => t.table_name === tableName);

      if (!tableExists) {
        addSection(tableName.toUpperCase(), `❌ **Table not found in database**\n`);
        continue;
      }

      report.push(`\n---\n`);
      report.push(`\n# ${tableName.toUpperCase()} TABLE\n`);

      // Get detailed info for this table
      await getRowCounts(tableName);
      await checkRlsEnabled(tableName);
      await getColumns(tableName);
      await getConstraints(tableName);
      await getIndexes(tableName);
      await getTriggers(tableName);
      await getRlsPolicies(tableName);
      await analyzeInsertBlocks(tableName);
    }

    // Get functions
    report.push(`\n---\n`);
    await getFunctions();

    // Write report to file
    const outputPath = path.join(__dirname, 'generated-sql', 'db-introspection.md');
    fs.writeFileSync(outputPath, report.join('\n'));

    console.log('\n═══════════════════════════════════════════════════');
    console.log('  ✅ Introspection Complete');
    console.log('═══════════════════════════════════════════════════');
    console.log(`\nReport saved to: ${outputPath}\n`);

    // Print summary
    console.log('SUMMARY:');
    console.log(`- Total tables found: ${tables.length}`);
    console.log(`- Templates table: ${tables.some(t => t.table_name === 'templates') ? '✅ Found' : '❌ Not found'}`);
    console.log(`- Conversations table: ${tables.some(t => t.table_name === 'conversations') ? '✅ Found' : '❌ Not found'}`);

  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    // Cleanup pg client connection
    if (pgClient) {
      await pgClient.end();
      console.log('\n✅ PostgreSQL connection closed');
    }
  }
}

// Run
main().catch(err => {
  console.error('\n❌ FATAL ERROR:', err.message);
  if (pgClient) {
    pgClient.end();
  }
  process.exit(1);
});
