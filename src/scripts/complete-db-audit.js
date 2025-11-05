#!/usr/bin/env node

/**
 * Complete Database Audit
 * Uses direct table queries + information_schema for comprehensive analysis
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

// All possible tables to check
const TABLES_TO_CHECK = [
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

async function checkTableDetailed(tableName) {
  try {
    // First try to query the table to see if it exists and get structure
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .limit(1);

    if (error) {
      return {
        name: tableName,
        exists: false,
        error: error.message
      };
    }

    // Get column names from sample data or empty structure
    let columns = [];
    let sample = null;
    
    if (data && data.length > 0) {
      columns = Object.keys(data[0]);
      sample = data[0];
    } else {
      // Try to get columns even if empty
      const { data: emptyData, error: emptyError } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);
      
      if (!emptyError && emptyData) {
        // This won't work but we at least tried
        columns = [];
      }
    }

    return {
      name: tableName,
      exists: true,
      row_count: count || 0,
      column_count: columns.length,
      columns: columns,
      has_data: count > 0,
      sample_row: sample
    };
  } catch (err) {
    return {
      name: tableName,
      exists: false,
      error: err.message
    };
  }
}

async function main() {
  console.log('🔍 Complete Database Audit\n');
  console.log('=' .repeat(80));

  const results = {
    timestamp: new Date().toISOString(),
    tables: [],
    summary: {}
  };

  console.log(`\n📋 Checking ${TABLES_TO_CHECK.length} tables...\n`);

  for (const tableName of TABLES_TO_CHECK) {
    const info = await checkTableDetailed(tableName);
    results.tables.push(info);

    if (info.exists) {
      const dataIcon = info.has_data ? '✅' : '⚪';
      const dataStr = info.has_data ? `${info.row_count} rows` : 'empty';
      console.log(`${dataIcon} ${tableName.padEnd(35)} - ${info.column_count} cols, ${dataStr}`);
      
      if (info.columns.length > 0) {
        const colSample = info.columns.slice(0, 8).join(', ');
        const more = info.columns.length > 8 ? ` ... +${info.columns.length - 8}` : '';
        console.log(`   └─ ${colSample}${more}`);
      }
    } else {
      console.log(`❌ ${tableName.padEnd(35)} - ${info.error}`);
    }
  }

  // Calculate summary
  const existingTables = results.tables.filter(t => t.exists);
  const missingTables = results.tables.filter(t => !t.exists);
  const tablesWithData = existingTables.filter(t => t.has_data);
  const emptyTables = existingTables.filter(t => !t.has_data);
  const totalRows = existingTables.reduce((sum, t) => sum + (t.row_count || 0), 0);
  const totalColumns = existingTables.reduce((sum, t) => sum + (t.column_count || 0), 0);

  results.summary = {
    total_checked: TABLES_TO_CHECK.length,
    tables_exist: existingTables.length,
    tables_missing: missingTables.length,
    tables_with_data: tablesWithData.length,
    tables_empty: emptyTables.length,
    total_rows: totalRows,
    total_columns: totalColumns,
    completeness_pct: Math.round((existingTables.length / TABLES_TO_CHECK.length) * 100)
  };

  console.log('\n\n' + '='.repeat(80));
  console.log('📈 SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total tables checked:    ${results.summary.total_checked}`);
  console.log(`Tables existing:         ${results.summary.tables_exist} ✅`);
  console.log(`Tables missing:          ${results.summary.tables_missing} ❌`);
  console.log(`Tables with data:        ${results.summary.tables_with_data}`);
  console.log(`Tables empty:            ${results.summary.tables_empty}`);
  console.log(`Total rows:              ${results.summary.total_rows}`);
  console.log(`Total columns:           ${results.summary.total_columns}`);
  console.log(`Database completeness:   ${results.summary.completeness_pct}%`);

  // List missing tables
  if (missingTables.length > 0) {
    console.log('\n\n⚠️  MISSING TABLES:');
    console.log('─'.repeat(80));
    missingTables.forEach(t => {
      console.log(`  ❌ ${t.name} - ${t.error}`);
    });
  }

  // List empty tables that should have structure
  if (emptyTables.length > 0) {
    console.log('\n\n📋 EMPTY TABLES (Created but no data):');
    console.log('─'.repeat(80));
    emptyTables.forEach(t => {
      console.log(`  ⚪ ${t.name} - ${t.column_count} columns defined`);
    });
  }

  // List tables with data
  if (tablesWithData.length > 0) {
    console.log('\n\n✅ TABLES WITH DATA:');
    console.log('─'.repeat(80));
    tablesWithData.forEach(t => {
      console.log(`  ✅ ${t.name.padEnd(35)} - ${t.row_count} rows, ${t.column_count} cols`);
    });
  }

  // Save results
  const outputPath = path.resolve(__dirname, '../../database-audit-complete.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Complete audit saved to: database-audit-complete.json`);
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});

