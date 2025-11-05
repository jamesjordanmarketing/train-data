#!/usr/bin/env node

/**
 * Deep Database Analysis Script
 * Comprehensive inspection of all database tables, columns, indexes, constraints
 */

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

// All tables to analyze
const ALL_TABLES = [
  // Core conversation system
  'conversations',
  'conversation_turns',
  
  // Batch generation
  'batch_jobs',
  'batch_items',
  
  // Template system
  'templates',
  'prompt_templates',
  'template_analytics',
  
  // Scenario & edge cases
  'scenarios',
  'edge_cases',
  
  // Chunks (from chunks-alpha)
  'chunks',
  'documents',
  'categories',
  'tags',
  'tag_dimensions',
  'custom_tags',
  'document_categories',
  'document_tags',
  'workflow_sessions',
  
  // Logging & audit
  'generation_logs',
  'export_logs',
  'api_response_logs',
  
  // Configuration
  'ai_configurations',
  'ai_configuration_audit',
  'configuration_audit_log',
  'user_preferences',
  
  // Maintenance
  'maintenance_operations',
  'query_performance_logs',
  'index_usage_snapshots',
  'table_health_snapshots'
];

async function getAllTablesInSchema() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `
    });

    if (error) {
      console.error('Error getting tables:', error);
      return [];
    }

    return data.map(row => row.tablename);
  } catch (err) {
    console.error('Exception getting tables:', err);
    return [];
  }
}

async function getTableSchema(tableName) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          udt_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = '${tableName}'
        ORDER BY ordinal_position;
      `
    });

    if (error) {
      return { exists: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { exists: false, error: 'Table not found' };
    }

    return { exists: true, columns: data };
  } catch (err) {
    return { exists: false, error: err.message };
  }
}

async function getTableIndexes(tableName) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          indexname,
          indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename = '${tableName}'
        ORDER BY indexname;
      `
    });

    if (error) return [];
    return data || [];
  } catch (err) {
    return [];
  }
}

async function getTableConstraints(tableName) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          conname as constraint_name,
          contype as constraint_type,
          pg_get_constraintdef(oid) as definition
        FROM pg_constraint
        WHERE conrelid = 'public.${tableName}'::regclass
        ORDER BY contype, conname;
      `
    });

    if (error) return [];
    return data || [];
  } catch (err) {
    return [];
  }
}

async function getTableRowCount(tableName) {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) return null;
    return count;
  } catch (err) {
    return null;
  }
}

async function getRLSPolicies(tableName) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = '${tableName}'
        ORDER BY policyname;
      `
    });

    if (error) return [];
    return data || [];
  } catch (err) {
    return [];
  }
}

async function main() {
  console.log('🔍 Starting Deep Database Analysis...\n');
  console.log('=' .repeat(80));

  // First, discover all tables in the public schema
  console.log('\n📋 Discovering all tables in public schema...');
  const allTables = await getAllTablesInSchema();
  
  // Filter out kv_store tables as per user request
  const tablesToAnalyze = allTables.filter(t => !t.startsWith('kv_store_'));
  
  console.log(`\n✅ Found ${allTables.length} total tables`);
  console.log(`   • Excluding ${allTables.length - tablesToAnalyze.length} kv_store_* tables`);
  console.log(`   • Analyzing ${tablesToAnalyze.length} tables\n`);

  const results = {
    timestamp: new Date().toISOString(),
    total_tables: tablesToAnalyze.length,
    tables: []
  };

  for (const tableName of tablesToAnalyze) {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`📊 Analyzing: ${tableName}`);
    console.log('─'.repeat(80));

    const tableInfo = {
      name: tableName,
      exists: false,
      columns: [],
      column_count: 0,
      indexes: [],
      index_count: 0,
      constraints: [],
      constraint_count: 0,
      rls_policies: [],
      rls_policy_count: 0,
      row_count: null
    };

    // Get schema
    const schema = await getTableSchema(tableName);
    if (schema.exists) {
      tableInfo.exists = true;
      tableInfo.columns = schema.columns;
      tableInfo.column_count = schema.columns.length;
      console.log(`  ✅ Columns: ${schema.columns.length}`);
    } else {
      console.log(`  ❌ Error: ${schema.error}`);
      results.tables.push(tableInfo);
      continue;
    }

    // Get indexes
    const indexes = await getTableIndexes(tableName);
    tableInfo.indexes = indexes;
    tableInfo.index_count = indexes.length;
    console.log(`  📇 Indexes: ${indexes.length}`);

    // Get constraints
    const constraints = await getTableConstraints(tableName);
    tableInfo.constraints = constraints;
    tableInfo.constraint_count = constraints.length;
    console.log(`  🔒 Constraints: ${constraints.length}`);

    // Get RLS policies
    const policies = await getRLSPolicies(tableName);
    tableInfo.rls_policies = policies;
    tableInfo.rls_policy_count = policies.length;
    console.log(`  🛡️  RLS Policies: ${policies.length}`);

    // Get row count
    const rowCount = await getTableRowCount(tableName);
    tableInfo.row_count = rowCount;
    console.log(`  📊 Row Count: ${rowCount !== null ? rowCount : 'N/A'}`);

    results.tables.push(tableInfo);
  }

  // Summary
  console.log('\n\n' + '='.repeat(80));
  console.log('📈 ANALYSIS SUMMARY');
  console.log('='.repeat(80));

  const existingTables = results.tables.filter(t => t.exists);
  const tablesWithData = results.tables.filter(t => t.row_count && t.row_count > 0);
  const totalColumns = existingTables.reduce((sum, t) => sum + t.column_count, 0);
  const totalIndexes = existingTables.reduce((sum, t) => sum + t.index_count, 0);
  const totalConstraints = existingTables.reduce((sum, t) => sum + t.constraint_count, 0);
  const totalPolicies = existingTables.reduce((sum, t) => sum + t.rls_policy_count, 0);
  const totalRows = results.tables.reduce((sum, t) => sum + (t.row_count || 0), 0);

  console.log(`\n📊 Tables:       ${existingTables.length}`);
  console.log(`📊 With Data:    ${tablesWithData.length}`);
  console.log(`📊 Total Rows:   ${totalRows}`);
  console.log(`📋 Columns:      ${totalColumns}`);
  console.log(`📇 Indexes:      ${totalIndexes}`);
  console.log(`🔒 Constraints:  ${totalConstraints}`);
  console.log(`🛡️  RLS Policies: ${totalPolicies}`);

  // Save to file
  const outputPath = path.resolve(__dirname, '../../database-deep-analysis.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Complete analysis saved to: database-deep-analysis.json`);

  // Print detailed table list
  console.log('\n\n' + '='.repeat(80));
  console.log('📋 DETAILED TABLE INVENTORY');
  console.log('='.repeat(80));

  existingTables.forEach(table => {
    const hasData = table.row_count && table.row_count > 0 ? '✅' : '⚪';
    const dataStr = table.row_count ? `${table.row_count} rows` : 'empty';
    console.log(`\n${hasData} ${table.name}`);
    console.log(`   └─ ${table.column_count} cols | ${table.index_count} indexes | ${table.constraint_count} constraints | ${table.rls_policy_count} policies | ${dataStr}`);
    
    // Show column names
    if (table.columns.length > 0) {
      const colNames = table.columns.map(c => c.column_name).slice(0, 10);
      const more = table.columns.length > 10 ? ` ... +${table.columns.length - 10} more` : '';
      console.log(`   └─ ${colNames.join(', ')}${more}`);
    }
  });

  console.log('\n\n✅ Analysis complete!');
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});

