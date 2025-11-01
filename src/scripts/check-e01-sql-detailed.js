#!/usr/bin/env node

/**
 * E01 SQL Table Checker - Detailed Schema Analysis
 * 
 * Uses PostgreSQL information_schema to get actual table structures
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
const client = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

// Tables from E01.md SQL script
const E01_CORE_TABLES = [
  'conversations',
  'conversation_turns', 
  'generation_logs',
  'prompt_templates',
  'scenarios',
  'edge_cases',
  'export_logs',
  'batch_jobs'
];

// Tables from E01-part-2.md SQL script
const E01_MONITORING_TABLES = [
  'query_performance_logs',
  'index_usage_snapshots',
  'table_bloat_snapshots',
  'performance_alerts',
  'schema_migrations'
];

// Expected columns for each table (key columns only for verification)
const KEY_COLUMNS = {
  'conversations': ['conversation_id', 'persona', 'emotion', 'tier', 'status', 'quality_score'],
  'conversation_turns': ['conversation_id', 'turn_number', 'role', 'content'],
  'generation_logs': ['conversation_id', 'template_id', 'model_used', 'input_tokens', 'output_tokens'],
  'prompt_templates': ['template_name', 'tier', 'template_text'],
  'scenarios': ['name', 'parent_template_id', 'context'],
  'edge_cases': ['name', 'trigger_condition', 'risk_level'],
  'export_logs': ['export_id', 'scope', 'format', 'conversation_ids'],
  'batch_jobs': ['job_type', 'status', 'total_items'],
  'query_performance_logs': ['query_text', 'duration_ms', 'is_slow'],
  'index_usage_snapshots': ['tablename', 'indexname', 'idx_scan'],
  'table_bloat_snapshots': ['tablename', 'bloat_ratio'],
  'performance_alerts': ['alert_type', 'severity'],
  'schema_migrations': ['version', 'description']
};

async function getTableSchema(tableName) {
  try {
    // Query information_schema to get columns
    const query = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position;
    `;
    
    const { data, error } = await client.rpc('exec_sql_query', {
      sql: query,
      params: [tableName]
    });
    
    if (error) {
      // RPC might not exist, try alternative
      return await getTableSchemaAlternative(tableName);
    }
    
    return data;
  } catch (err) {
    return await getTableSchemaAlternative(tableName);
  }
}

async function getTableSchemaAlternative(tableName) {
  // Try to infer from table metadata
  try {
    const { data, error } = await client.from(tableName).select('*').limit(0);
    if (error) {
      if (error.message.includes('does not exist')) {
        return null;
      }
      return { exists: true, columns: [] };
    }
    // Table exists but we can't get full schema without data
    return { exists: true, columns: [] };
  } catch (err) {
    return null;
  }
}

async function analyzeTable(tableName) {
  const schema = await getTableSchemaAlternative(tableName);
  
  if (schema === null) {
    return {
      table: tableName,
      exists: false,
      category: 4,
      categoryDescription: "Table doesn't exist at all",
      keyColumns: KEY_COLUMNS[tableName] || [],
      actualColumns: [],
      missingKeyColumns: KEY_COLUMNS[tableName] || [],
      recommendation: `Run the SQL script to create the ${tableName} table`
    };
  }

  const keyColumns = KEY_COLUMNS[tableName] || [];
  
  // If we couldn't get schema details, we know it exists but can't analyze
  if (schema.columns && schema.columns.length === 0) {
    return {
      table: tableName,
      exists: true,
      category: 2,
      categoryDescription: "Table exists but needs verification of fields/triggers",
      keyColumns: keyColumns,
      actualColumns: 'Unable to determine (table may be empty or have RLS policies)',
      missingKeyColumns: 'Unknown - manual verification needed',
      recommendation: `Manually verify ${tableName} structure in Supabase SQL Editor:\n` +
        `    SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${tableName}';`
    };
  }

  return {
    table: tableName,
    exists: true,
    category: 2,
    categoryDescription: "Table exists - detailed analysis requires manual verification",
    keyColumns: keyColumns,
    recommendation: `Verify key columns exist: ${keyColumns.join(', ')}`
  };
}

async function main() {
  console.log('🔍 E01 SQL Implementation Check\n');
  console.log('='.repeat(80));
  console.log('NOTE: This script checks table existence. For detailed column analysis,');
  console.log('      use the Supabase SQL Editor to query information_schema.columns\n');
  console.log('='.repeat(80));
  
  const allTables = [...E01_CORE_TABLES, ...E01_MONITORING_TABLES];
  const results = [];
  
  for (const tableName of allTables) {
    console.log(`\nChecking: ${tableName}...`);
    const result = await analyzeTable(tableName);
    results.push(result);
    
    console.log(`  Status: ${result.exists ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  Category: ${result.category}`);
    console.log(`  ${result.categoryDescription}`);
    if (result.keyColumns && result.keyColumns.length > 0) {
      console.log(`  Key columns to verify: ${result.keyColumns.join(', ')}`);
    }
  }
  
  // Generate recommendations
  console.log('\n\n📋 MANUAL VERIFICATION NEEDED:');
  console.log('='.repeat(80));
  console.log('Run these queries in Supabase SQL Editor to verify table structures:\n');
  
  const existingTables = results.filter(r => r.exists);
  const missingTables = results.filter(r => !r.exists);
  
  if (existingTables.length > 0) {
    console.log('-- Check existing table structures:');
    existingTables.forEach(r => {
      console.log(`\nSELECT column_name, data_type, is_nullable`);
      console.log(`FROM information_schema.columns`);
      console.log(`WHERE table_name = '${r.table}'`);
      console.log(`ORDER BY ordinal_position;`);
    });
  }
  
  if (missingTables.length > 0) {
    console.log('\n\n❌ MISSING TABLES - SQL SCRIPTS NEED TO BE RUN:');
    console.log('='.repeat(80));
    missingTables.forEach(r => {
      console.log(`\n${r.table}:`);
      console.log(`  ${r.recommendation}`);
    });
  }
  
  // Summary
  console.log('\n\n📊 SUMMARY:');
  console.log('='.repeat(80));
  console.log(`Total tables checked: ${results.length}`);
  console.log(`Tables that exist: ${existingTables.length}`);
  console.log(`Tables missing: ${missingTables.length}`);
  
  if (existingTables.length > 0) {
    console.log('\n✅ Existing tables:');
    existingTables.forEach(r => console.log(`   - ${r.table}`));
  }
  
  if (missingTables.length > 0) {
    console.log('\n❌ Missing tables (need to run SQL):');
    missingTables.forEach(r => console.log(`   - ${r.table}`));
  }
  
  // Save results
  const outputPath = path.resolve(__dirname, '../../pmc/product/_mapping/fr-maps/e01-sql-check-results.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    results: results,
    summary: {
      total: results.length,
      existing: existingTables.length,
      missing: missingTables.length
    }
  }, null, 2));
  
  console.log(`\n💾 Results saved to: ${outputPath}`);
}

main().catch(console.error);

