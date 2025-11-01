#!/usr/bin/env node

/**
 * E01 SQL Table Checker
 * 
 * This script checks which tables from the E01 SQL scripts exist in the database
 * and analyzes their structure to categorize them.
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

// Tables from E01.md SQL script (lines 73-715)
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

// Tables from E01-part-2.md SQL script (lines 77-557)
const E01_MONITORING_TABLES = [
  'query_performance_logs',
  'index_usage_snapshots',
  'table_bloat_snapshots',
  'performance_alerts',
  'schema_migrations'
];

// Expected columns for each table (from the SQL scripts)
const EXPECTED_COLUMNS = {
  'conversations': [
    'id', 'conversation_id', 'document_id', 'chunk_id', 'title', 'persona',
    'emotion', 'topic', 'intent', 'tone', 'tier', 'status', 'category',
    'quality_score', 'quality_metrics', 'confidence_level', 'turn_count',
    'total_tokens', 'estimated_cost_usd', 'actual_cost_usd', 'generation_duration_ms',
    'approved_by', 'approved_at', 'reviewer_notes', 'parent_id', 'parent_type',
    'parameters', 'review_history', 'error_message', 'retry_count',
    'created_at', 'updated_at', 'created_by'
  ],
  'conversation_turns': [
    'id', 'conversation_id', 'turn_number', 'role', 'content',
    'token_count', 'char_count', 'created_at'
  ],
  'generation_logs': [
    'id', 'conversation_id', 'run_id', 'template_id', 'request_payload',
    'response_payload', 'model_used', 'parameters', 'temperature', 'max_tokens',
    'input_tokens', 'output_tokens', 'cost_usd', 'duration_ms', 'status',
    'error_message', 'error_code', 'retry_attempt', 'created_at', 'created_by'
  ],
  'prompt_templates': [
    'id', 'template_name', 'description', 'category', 'tier', 'template_text',
    'structure', 'variables', 'tone', 'complexity_baseline', 'style_notes',
    'example_conversation', 'quality_threshold', 'required_elements',
    'applicable_personas', 'applicable_emotions', 'applicable_topics',
    'usage_count', 'rating', 'success_rate', 'version', 'is_active',
    'created_at', 'updated_at', 'created_by', 'last_modified_by'
  ],
  'scenarios': [
    'id', 'name', 'description', 'parent_template_id', 'context', 'topic',
    'persona', 'emotional_arc', 'complexity', 'emotional_context',
    'parameter_values', 'tags', 'variation_count', 'quality_score',
    'status', 'created_at', 'updated_at', 'created_by'
  ],
  'edge_cases': [
    'id', 'name', 'description', 'category', 'trigger_condition',
    'expected_behavior', 'risk_level', 'priority', 'test_scenario',
    'validation_criteria', 'tested', 'last_tested_at', 'related_scenario_ids',
    'parent_template_id', 'status', 'created_at', 'updated_at', 'created_by'
  ],
  'export_logs': [
    'id', 'export_id', 'user_id', 'scope', 'format', 'filter_state',
    'conversation_ids', 'conversation_count', 'file_name', 'file_size_bytes',
    'file_path', 'compressed', 'metadata', 'quality_stats', 'tier_distribution',
    'status', 'error_message', 'include_metadata', 'include_quality_scores',
    'include_timestamps', 'include_approval_history', 'exported_at',
    'expires_at', 'downloaded_count', 'last_downloaded_at'
  ],
  'batch_jobs': [
    'id', 'job_type', 'name', 'description', 'configuration', 'target_tier',
    'status', 'total_items', 'completed_items', 'failed_items', 'skipped_items',
    'progress_percentage', 'started_at', 'completed_at', 'estimated_completion_at',
    'duration_seconds', 'priority', 'error_message', 'retry_count', 'max_retries',
    'results', 'summary', 'concurrent_processing', 'created_at', 'updated_at',
    'created_by'
  ],
  'query_performance_logs': [
    'id', 'query_text', 'query_hash', 'duration_ms', 'execution_timestamp',
    'user_id', 'endpoint', 'parameters', 'error_message', 'stack_trace', 'is_slow'
  ],
  'index_usage_snapshots': [
    'id', 'snapshot_timestamp', 'schemaname', 'tablename', 'indexname',
    'idx_scan', 'idx_tup_read', 'idx_tup_fetch', 'index_size_bytes', 'table_size_bytes'
  ],
  'table_bloat_snapshots': [
    'id', 'snapshot_timestamp', 'schemaname', 'tablename', 'actual_size_bytes',
    'estimated_size_bytes', 'bloat_bytes', 'bloat_ratio', 'dead_tuples', 'live_tuples'
  ],
  'performance_alerts': [
    'id', 'alert_type', 'severity', 'message', 'details', 'created_at',
    'resolved_at', 'resolved_by', 'resolution_notes'
  ],
  'schema_migrations': [
    'version', 'description', 'applied_at', 'applied_by', 'execution_time_ms', 'checksum'
  ]
};

// Functions that should exist (from E01-part-2.md)
const EXPECTED_FUNCTIONS = [
  'capture_index_usage_snapshot',
  'detect_unused_indexes',
  'capture_table_bloat_snapshot',
  'get_slow_queries',
  'create_performance_alert',
  'check_table_bloat_alerts',
  'vacuum_analyze_table',
  'reindex_if_bloated',
  'weekly_maintenance',
  'update_updated_at_column',
  'calculate_quality_score',
  'auto_flag_low_quality'
];

// Triggers that should exist (from E01.md)
const EXPECTED_TRIGGERS = [
  'update_conversations_updated_at',
  'update_prompt_templates_updated_at',
  'update_scenarios_updated_at',
  'update_edge_cases_updated_at',
  'update_batch_jobs_updated_at',
  'trigger_auto_flag_quality'
];

async function checkTableExists(tableName) {
  try {
    const { data, error } = await client.from(tableName).select('*').limit(0);
    return !error;
  } catch (err) {
    return false;
  }
}

async function getTableColumns(tableName) {
  try {
    const { data, error } = await client.from(tableName).select('*').limit(1);
    if (error || !data || data.length === 0) {
      // Try to get structure even if empty
      const { data: emptyData, error: emptyError } = await client.from(tableName).select('*').limit(0);
      if (emptyError) return null;
      // For empty tables, we can't determine columns this way
      return [];
    }
    return Object.keys(data[0]);
  } catch (err) {
    return null;
  }
}

async function analyzeTable(tableName) {
  const exists = await checkTableExists(tableName);
  
  if (!exists) {
    return {
      table: tableName,
      exists: false,
      category: 4,
      categoryDescription: "Table doesn't exist at all",
      columns: [],
      missingColumns: EXPECTED_COLUMNS[tableName] || [],
      extraColumns: []
    };
  }

  const actualColumns = await getTableColumns(tableName);
  const expectedColumns = EXPECTED_COLUMNS[tableName] || [];
  
  if (actualColumns === null) {
    return {
      table: tableName,
      exists: true,
      category: 3,
      categoryDescription: "Table exists but cannot read structure (permissions issue?)",
      columns: [],
      missingColumns: expectedColumns,
      extraColumns: []
    };
  }

  const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
  const extraColumns = actualColumns.filter(col => !expectedColumns.includes(col));
  
  // Determine category
  let category;
  let categoryDescription;
  
  if (missingColumns.length === 0 && extraColumns.length === 0) {
    category = 1;
    categoryDescription = "Already implemented as described (no changes needed)";
  } else if (missingColumns.length > 0) {
    category = 2;
    categoryDescription = "Table exists but needs fields or triggers that are not implemented yet";
  } else if (extraColumns.length > 0 && missingColumns.length === 0) {
    // Has extra columns but all expected columns exist
    category = 1;
    categoryDescription = "Already implemented with additional columns (likely fine)";
  } else {
    category = 3;
    categoryDescription = "Table exists but appears to be for a different purpose";
  }

  return {
    table: tableName,
    exists: true,
    category,
    categoryDescription,
    columns: actualColumns,
    missingColumns,
    extraColumns
  };
}

async function checkFunction(functionName) {
  // We can't easily check functions via Supabase client, so we'll mark them as unknown
  return {
    function: functionName,
    exists: 'unknown',
    note: 'Function existence check requires database admin privileges'
  };
}

async function main() {
  console.log('🔍 Checking E01 SQL Implementation Status...\n');
  console.log('='.repeat(80));
  
  // Check core tables
  console.log('\n📋 CORE TABLES (from E01.md):');
  console.log('='.repeat(80));
  
  const coreResults = [];
  for (const tableName of E01_CORE_TABLES) {
    console.log(`\nChecking: ${tableName}...`);
    const result = await analyzeTable(tableName);
    coreResults.push(result);
    
    console.log(`  Status: ${result.exists ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  Category: ${result.category} - ${result.categoryDescription}`);
    
    if (result.missingColumns.length > 0) {
      console.log(`  ⚠️  Missing ${result.missingColumns.length} columns: ${result.missingColumns.slice(0, 5).join(', ')}${result.missingColumns.length > 5 ? '...' : ''}`);
    }
    if (result.extraColumns.length > 0) {
      console.log(`  ℹ️  Extra ${result.extraColumns.length} columns: ${result.extraColumns.slice(0, 5).join(', ')}${result.extraColumns.length > 5 ? '...' : ''}`);
    }
  }
  
  // Check monitoring tables
  console.log('\n\n📊 MONITORING TABLES (from E01-part-2.md):');
  console.log('='.repeat(80));
  
  const monitoringResults = [];
  for (const tableName of E01_MONITORING_TABLES) {
    console.log(`\nChecking: ${tableName}...`);
    const result = await analyzeTable(tableName);
    monitoringResults.push(result);
    
    console.log(`  Status: ${result.exists ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  Category: ${result.category} - ${result.categoryDescription}`);
    
    if (result.missingColumns.length > 0) {
      console.log(`  ⚠️  Missing ${result.missingColumns.length} columns: ${result.missingColumns.slice(0, 5).join(', ')}${result.missingColumns.length > 5 ? '...' : ''}`);
    }
    if (result.extraColumns.length > 0) {
      console.log(`  ℹ️  Extra ${result.extraColumns.length} columns: ${result.extraColumns.slice(0, 5).join(', ')}${result.extraColumns.length > 5 ? '...' : ''}`);
    }
  }
  
  // Summary
  console.log('\n\n📊 SUMMARY:');
  console.log('='.repeat(80));
  
  const allResults = [...coreResults, ...monitoringResults];
  const category1 = allResults.filter(r => r.category === 1);
  const category2 = allResults.filter(r => r.category === 2);
  const category3 = allResults.filter(r => r.category === 3);
  const category4 = allResults.filter(r => r.category === 4);
  
  console.log(`\nCategory 1 (Already implemented): ${category1.length} tables`);
  category1.forEach(r => console.log(`  ✅ ${r.table}`));
  
  console.log(`\nCategory 2 (Needs missing fields/triggers): ${category2.length} tables`);
  category2.forEach(r => console.log(`  ⚠️  ${r.table} - missing ${r.missingColumns.length} columns`));
  
  console.log(`\nCategory 3 (Different purpose): ${category3.length} tables`);
  category3.forEach(r => console.log(`  ⚠️  ${r.table}`));
  
  console.log(`\nCategory 4 (Doesn't exist): ${category4.length} tables`);
  category4.forEach(r => console.log(`  ❌ ${r.table}`));
  
  // Save detailed results to JSON for report generation
  const output = {
    timestamp: new Date().toISOString(),
    summary: {
      total: allResults.length,
      category1: category1.length,
      category2: category2.length,
      category3: category3.length,
      category4: category4.length
    },
    tables: allResults,
    functions: EXPECTED_FUNCTIONS.map(checkFunction),
    triggers: EXPECTED_TRIGGERS
  };
  
  const outputPath = path.resolve(__dirname, '../../pmc/product/_mapping/fr-maps/e01-sql-check-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n💾 Detailed results saved to: ${outputPath}`);
}

main().catch(console.error);

