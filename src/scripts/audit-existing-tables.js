const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
const envPath = path.resolve(__dirname, '../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Tables known to exist
const existingTables = [
  'conversations',
  'chunks',
  'scenarios',
  'templates',
  'documents',
  'categories',
  'tags',
  'workflow_sessions',
  'document_categories',
  'document_tags',
  'custom_tags',
  'tag_dimensions'
];

// Tables to check existence for
const tablesToCheck = [
  'conversation_turns',
  'batch_jobs',
  'batch_items',
  'generation_logs',
  'export_logs',
  'prompt_templates',
  'template_analytics',
  'edge_cases',
  'user_preferences',
  'ai_configurations',
  'ai_configuration_audit',
  'maintenance_operations',
  'configuration_audit_log'
];

async function getTableInfo(tableName) {
  try {
    // Get a single row to see structure
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .limit(1);

    if (error) {
      return {
        table: tableName,
        exists: false,
        error: error.message
      };
    }

    // Get schema from the first row (if exists) or from the response
    const columns = data && data.length > 0
      ? Object.keys(data[0])
      : [];

    return {
      table: tableName,
      exists: true,
      row_count: count || 0,
      column_count: columns.length,
      columns: columns,
      sample_data: data && data.length > 0 ? data[0] : null
    };
  } catch (err) {
    return {
      table: tableName,
      exists: false,
      error: err.message
    };
  }
}

async function checkTableExists(tableName) {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('id', { count: 'exact', head: true });

    return {
      table: tableName,
      exists: !error,
      error: error ? error.message : null
    };
  } catch (err) {
    return {
      table: tableName,
      exists: false,
      error: err.message
    };
  }
}

async function main() {
  console.log('🔍 Auditing Supabase Database Tables\n');
  console.log('=' .repeat(60));

  const results = {
    timestamp: new Date().toISOString(),
    existing_tables: [],
    missing_tables: [],
    summary: {}
  };

  // Check existing tables for schema
  console.log('\n📊 EXISTING TABLES (detailed audit):\n');
  for (const table of existingTables) {
    const info = await getTableInfo(table);

    if (info.exists) {
      console.log(`✅ ${table.padEnd(30)} - ${info.row_count} rows, ${info.column_count} columns`);
      results.existing_tables.push(info);
    } else {
      console.log(`❌ ${table.padEnd(30)} - ${info.error}`);
      results.missing_tables.push(info);
    }
  }

  // Check for tables mentioned in audits
  console.log('\n\n📋 TABLES FROM AUDIT REPORTS (existence check):\n');
  for (const table of tablesToCheck) {
    const check = await checkTableExists(table);

    if (check.exists) {
      console.log(`✅ ${table.padEnd(30)} - EXISTS (will get details...)`);
      const info = await getTableInfo(table);
      results.existing_tables.push(info);
      console.log(`   └─ ${info.row_count} rows, ${info.column_count} columns`);
    } else {
      console.log(`❌ ${table.padEnd(30)} - MISSING`);
      results.missing_tables.push(check);
    }
  }

  // Summary
  const totalExisting = results.existing_tables.length;
  const totalMissing = results.missing_tables.length;

  results.summary = {
    total_tables_exist: totalExisting,
    total_tables_missing: totalMissing,
    total_tables_checked: totalExisting + totalMissing,
    database_completeness_pct: Math.round((totalExisting / (totalExisting + totalMissing)) * 100)
  };

  console.log('\n\n' + '='.repeat(60));
  console.log('📈 SUMMARY:');
  console.log('='.repeat(60));
  console.log(`Total tables existing:  ${totalExisting}`);
  console.log(`Total tables missing:   ${totalMissing}`);
  console.log(`Database completeness:  ${results.summary.database_completeness_pct}%`);

  // Write to file
  const outputPath = 'database-audit-complete.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Complete audit saved to ${outputPath}`);

  // Print table schemas
  console.log('\n\n' + '='.repeat(60));
  console.log('📋 TABLE SCHEMAS:');
  console.log('='.repeat(60));

  for (const table of results.existing_tables) {
    console.log(`\n${table.table}:`);
    console.log(`  Columns (${table.columns.length}): ${table.columns.join(', ')}`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
