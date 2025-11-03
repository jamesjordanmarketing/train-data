#!/usr/bin/env node

/**
 * E04 SQL Table Checker - Conversation Generation Module
 * 
 * Checks implementation status of E04 SQL requirements against current database
 * Based on: pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E04.md
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

// E04 Required Tables from SQL script
const E04_TABLES = {
  'conversations': {
    keyColumns: [
      'id', 'conversation_id', 'document_id', 'chunk_id', 'title', 'persona', 
      'emotion', 'topic', 'intent', 'tone', 'tier', 'category', 'status', 
      'quality_score', 'quality_metrics', 'turn_count', 'total_tokens',
      'estimated_cost_usd', 'actual_cost_usd', 'generation_duration_ms',
      'template_id', 'approved_by', 'approved_at', 'reviewer_notes',
      'review_history', 'parent_id', 'parent_type', 'parameters',
      'error_message', 'created_at', 'updated_at', 'created_by'
    ],
    requiredEnums: ['conversation_status', 'tier_type'],
    requiredIndexes: [
      'idx_conversations_status', 'idx_conversations_tier', 
      'idx_conversations_quality_score', 'idx_conversations_created_at',
      'idx_conversations_updated_at', 'idx_conversations_document_id',
      'idx_conversations_chunk_id', 'idx_conversations_parent_id',
      'idx_conversations_status_tier', 'idx_conversations_status_quality',
      'idx_conversations_tier_status_created', 'idx_conversations_parameters',
      'idx_conversations_quality_metrics', 'idx_conversations_category',
      'idx_conversations_pending_review'
    ]
  },
  'conversation_turns': {
    keyColumns: [
      'id', 'conversation_id', 'turn_number', 'role', 'content', 
      'token_count', 'created_at'
    ],
    requiredIndexes: [
      'idx_conversation_turns_conversation_id', 
      'idx_conversation_turns_turn_number'
    ]
  },
  'batch_jobs': {
    keyColumns: [
      'id', 'name', 'status', 'priority', 'total_items', 'completed_items',
      'failed_items', 'successful_items', 'started_at', 'completed_at',
      'estimated_time_remaining', 'tier', 'shared_parameters',
      'concurrent_processing', 'error_handling', 'created_by',
      'created_at', 'updated_at'
    ],
    requiredEnums: ['batch_job_status'],
    requiredIndexes: [
      'idx_batch_jobs_status', 'idx_batch_jobs_created_by',
      'idx_batch_jobs_created_at', 'idx_batch_jobs_priority_status'
    ]
  },
  'batch_items': {
    keyColumns: [
      'id', 'batch_job_id', 'conversation_id', 'position', 'topic',
      'tier', 'parameters', 'status', 'progress', 'estimated_time',
      'error_message', 'created_at', 'updated_at'
    ],
    requiredEnums: ['batch_item_status'],
    requiredIndexes: [
      'idx_batch_items_batch_job_id', 'idx_batch_items_status',
      'idx_batch_items_position', 'idx_batch_items_conversation_id'
    ]
  },
  'generation_logs': {
    keyColumns: [
      'id', 'conversation_id', 'run_id', 'template_id', 'request_payload',
      'response_payload', 'parameters', 'cost_usd', 'input_tokens',
      'output_tokens', 'duration_ms', 'error_message', 'error_code',
      'created_at', 'created_by'
    ],
    requiredIndexes: [
      'idx_generation_logs_conversation_id', 'idx_generation_logs_run_id',
      'idx_generation_logs_created_at', 'idx_generation_logs_cost'
    ]
  }
};

// Required ENUM types
const REQUIRED_ENUMS = [
  'conversation_status',
  'tier_type', 
  'batch_job_status',
  'batch_item_status'
];

// Required functions
const REQUIRED_FUNCTIONS = [
  'calculate_batch_progress',
  'estimate_time_remaining',
  'update_updated_at_column'
];

async function checkTableExists(tableName) {
  try {
    const { data, error } = await client.from(tableName).select('*').limit(0);
    if (error) {
      if (error.message.includes('does not exist')) {
        return { exists: false, error: error.message };
      }
      return { exists: true, accessible: false, error: error.message };
    }
    return { exists: true, accessible: true };
  } catch (err) {
    return { exists: false, error: err.message };
  }
}

async function checkEnumExists(enumName) {
  try {
    // Try to query pg_type for enum existence
    const query = `
      SELECT typname, enumlabel 
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid 
      WHERE typname = $1
      ORDER BY enumsortorder;
    `;
    
    // Since we can't directly query system tables, we'll try an indirect approach
    // by attempting to use the enum in a dummy query
    const testQuery = `SELECT '${enumName === 'conversation_status' ? 'draft' : 
                              enumName === 'tier_type' ? 'template' :
                              enumName === 'batch_job_status' ? 'queued' : 'queued'}'::${enumName}`;
    
    const { data, error } = await client.rpc('exec_sql', { sql: testQuery });
    
    if (error) {
      return { exists: false, error: error.message };
    }
    return { exists: true };
  } catch (err) {
    return { exists: false, error: err.message };
  }
}

async function analyzeTable(tableName, requirements) {
  console.log(`\n🔍 Analyzing: ${tableName}`);
  console.log('─'.repeat(50));
  
  const tableCheck = await checkTableExists(tableName);
  
  if (!tableCheck.exists) {
    return {
      table: tableName,
      exists: false,
      category: 4,
      categoryDescription: "Table doesn't exist at all",
      keyColumns: requirements.keyColumns,
      actualColumns: [],
      missingKeyColumns: requirements.keyColumns,
      recommendation: `Run the E04 SQL script to create the ${tableName} table with all required columns, indexes, and constraints.`,
      details: {
        error: tableCheck.error,
        requiredColumns: requirements.keyColumns.length,
        requiredIndexes: requirements.requiredIndexes?.length || 0,
        requiredEnums: requirements.requiredEnums?.length || 0
      }
    };
  }

  if (!tableCheck.accessible) {
    return {
      table: tableName,
      exists: true,
      category: 2,
      categoryDescription: "Table exists but needs verification of fields/triggers",
      keyColumns: requirements.keyColumns,
      actualColumns: 'Unable to access (RLS policies or permissions)',
      missingKeyColumns: 'Unknown - manual verification needed',
      recommendation: `Manually verify ${tableName} structure in Supabase SQL Editor. Check RLS policies and permissions.`,
      details: {
        error: tableCheck.error,
        accessIssue: true
      }
    };
  }

  // Table exists and is accessible - need manual verification for detailed analysis
  return {
    table: tableName,
    exists: true,
    category: 2,
    categoryDescription: "Table exists but needs verification of fields/triggers",
    keyColumns: requirements.keyColumns,
    actualColumns: 'Requires manual verification',
    missingKeyColumns: 'Unknown - detailed schema check needed',
    recommendation: `Verify ${tableName} has all required columns and indexes:\n` +
      `    SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '${tableName}' ORDER BY ordinal_position;`,
    details: {
      requiredColumns: requirements.keyColumns.length,
      requiredIndexes: requirements.requiredIndexes?.length || 0,
      requiredEnums: requirements.requiredEnums?.length || 0,
      keyColumnsToVerify: requirements.keyColumns.slice(0, 10) // Show first 10
    }
  };
}

async function checkEnums() {
  console.log('\n🔧 Checking ENUM Types');
  console.log('═'.repeat(50));
  
  const enumResults = [];
  
  for (const enumName of REQUIRED_ENUMS) {
    console.log(`Checking enum: ${enumName}...`);
    const result = await checkEnumExists(enumName);
    enumResults.push({
      name: enumName,
      exists: result.exists,
      error: result.error
    });
    
    console.log(`  ${result.exists ? '✅' : '❌'} ${enumName}`);
    if (!result.exists) {
      console.log(`    Error: ${result.error}`);
    }
  }
  
  return enumResults;
}

async function generateSQLVerificationQueries(results) {
  console.log('\n📋 MANUAL VERIFICATION QUERIES');
  console.log('═'.repeat(80));
  console.log('Run these queries in Supabase SQL Editor for detailed verification:\n');
  
  // Table structure queries
  console.log('-- 1. Verify table structures:');
  results.forEach(r => {
    if (r.exists) {
      console.log(`\n-- ${r.table} structure:`);
      console.log(`SELECT column_name, data_type, is_nullable, column_default`);
      console.log(`FROM information_schema.columns`);
      console.log(`WHERE table_name = '${r.table}'`);
      console.log(`ORDER BY ordinal_position;`);
    }
  });
  
  // Index verification
  console.log('\n\n-- 2. Verify indexes:');
  console.log(`SELECT schemaname, tablename, indexname, indexdef`);
  console.log(`FROM pg_indexes`);
  console.log(`WHERE tablename IN (${results.filter(r => r.exists).map(r => `'${r.table}'`).join(', ')})`);
  console.log(`ORDER BY tablename, indexname;`);
  
  // Enum verification
  console.log('\n\n-- 3. Verify ENUM types:');
  REQUIRED_ENUMS.forEach(enumName => {
    console.log(`SELECT enum_range(NULL::${enumName});`);
  });
  
  // Function verification
  console.log('\n\n-- 4. Verify functions:');
  console.log(`SELECT routine_name, routine_type`);
  console.log(`FROM information_schema.routines`);
  console.log(`WHERE routine_name IN (${REQUIRED_FUNCTIONS.map(f => `'${f}'`).join(', ')})`);
  console.log(`AND routine_schema = 'public';`);
  
  // RLS verification
  console.log('\n\n-- 5. Verify Row Level Security:');
  console.log(`SELECT tablename, rowsecurity`);
  console.log(`FROM pg_tables`);
  console.log(`WHERE tablename IN (${results.filter(r => r.exists).map(r => `'${r.table}'`).join(', ')});`);
}

async function main() {
  console.log('🚀 E04 SQL Implementation Check');
  console.log('Interactive LoRA Conversation Generation Module');
  console.log('═'.repeat(80));
  console.log('Checking implementation status against E04 requirements...\n');
  
  const results = [];
  
  // Check each required table
  for (const [tableName, requirements] of Object.entries(E04_TABLES)) {
    const result = await analyzeTable(tableName, requirements);
    results.push(result);
  }
  
  // Check ENUM types
  const enumResults = await checkEnums();
  
  // Generate summary
  console.log('\n\n📊 IMPLEMENTATION SUMMARY');
  console.log('═'.repeat(80));
  
  const existingTables = results.filter(r => r.exists);
  const missingTables = results.filter(r => !r.exists);
  const missingEnums = enumResults.filter(e => !e.exists);
  
  console.log(`📋 Tables Status:`);
  console.log(`   ✅ Existing: ${existingTables.length}/${results.length}`);
  console.log(`   ❌ Missing: ${missingTables.length}/${results.length}`);
  
  console.log(`\n🔧 ENUM Types Status:`);
  console.log(`   ✅ Existing: ${enumResults.length - missingEnums.length}/${enumResults.length}`);
  console.log(`   ❌ Missing: ${missingEnums.length}/${enumResults.length}`);
  
  // Category breakdown
  console.log(`\n📂 Category Breakdown:`);
  const categories = {
    1: results.filter(r => r.category === 1).length,
    2: results.filter(r => r.category === 2).length,
    3: results.filter(r => r.category === 3).length,
    4: results.filter(r => r.category === 4).length
  };
  
  console.log(`   Category 1 (Fully implemented): ${categories[1]}`);
  console.log(`   Category 2 (Needs field/trigger verification): ${categories[2]}`);
  console.log(`   Category 3 (Different purpose, may break components): ${categories[3]}`);
  console.log(`   Category 4 (Doesn't exist): ${categories[4]}`);
  
  // Detailed results
  console.log('\n\n📋 DETAILED ANALYSIS');
  console.log('═'.repeat(80));
  
  results.forEach(result => {
    console.log(`\n${result.table}:`);
    console.log(`  Status: ${result.exists ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  Category: ${result.category} - ${result.categoryDescription}`);
    console.log(`  Required columns: ${result.details?.requiredColumns || 'N/A'}`);
    console.log(`  Required indexes: ${result.details?.requiredIndexes || 'N/A'}`);
    console.log(`  Recommendation: ${result.recommendation}`);
  });
  
  // Generate verification queries
  await generateSQLVerificationQueries(results);
  
  // Final recommendations
  console.log('\n\n🎯 NEXT STEPS');
  console.log('═'.repeat(80));
  
  if (missingTables.length > 0) {
    console.log('❌ CRITICAL: Missing tables detected!');
    console.log('   Run the complete E04 SQL script from the execution file.');
    console.log('   Missing tables:', missingTables.map(t => t.table).join(', '));
  }
  
  if (missingEnums.length > 0) {
    console.log('❌ CRITICAL: Missing ENUM types!');
    console.log('   Missing ENUMs:', missingEnums.map(e => e.name).join(', '));
  }
  
  if (existingTables.length > 0) {
    console.log('✅ Tables exist but need detailed verification.');
    console.log('   Use the SQL queries above to verify column structures and indexes.');
  }
  
  console.log('\n📄 Report will be generated at:');
  console.log('   pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E04-sql-check.md');
  
  return { results, enumResults };
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, E04_TABLES, REQUIRED_ENUMS, REQUIRED_FUNCTIONS };