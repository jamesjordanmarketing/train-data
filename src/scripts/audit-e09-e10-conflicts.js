#!/usr/bin/env node

/**
 * E09 and E10 Conflict Audit Script
 *
 * Purpose: Audit database to identify potential conflicts before executing E09 and E10
 * Checks: columns, indexes, views, functions that E09/E10 want to create
 */

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

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

// E09 wants to create these objects
const E09_OBJECTS = {
  columns: [
    { table: 'conversations', column: 'parent_chunk_id' },
    { table: 'conversations', column: 'chunk_context' },
    { table: 'conversations', column: 'dimension_source' }
  ],
  indexes: [
    'idx_conversations_parent_chunk_id',
    'idx_conversations_dimension_source'
  ],
  views: [
    'orphaned_conversations'
  ],
  functions: [
    'get_conversations_by_chunk'
  ]
};

// E10 wants to create/modify these (from Prompt 8 E09 integration section)
const E10_OBJECTS = {
  columns: [
    { table: 'conversations', column: 'parent_chunk_id' },
    { table: 'conversations', column: 'chunk_context' },
    { table: 'conversations', column: 'dimension_source' }
  ],
  indexes: [
    'idx_conversations_parent_chunk_id',
    'idx_conversations_dimension_source'
  ],
  views: [
    'orphaned_conversations'
  ],
  functions: [
    'get_conversations_by_chunk'
  ]
};

async function checkColumnExists(tableName, columnName) {
  try {
    const { data, error } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = '${tableName}'
            AND column_name = '${columnName}';
        `
      });

    if (error) {
      return { exists: false, error: error.message };
    }

    if (data && data.length > 0) {
      return { exists: true, details: data[0] };
    }

    return { exists: false };
  } catch (err) {
    return { exists: false, error: err.message };
  }
}

async function checkIndexExists(indexName) {
  try {
    const { data, error } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT indexname, tablename, indexdef
          FROM pg_indexes
          WHERE schemaname = 'public'
            AND indexname = '${indexName}';
        `
      });

    if (error) {
      return { exists: false, error: error.message };
    }

    if (data && data.length > 0) {
      return { exists: true, details: data[0] };
    }

    return { exists: false };
  } catch (err) {
    return { exists: false, error: err.message };
  }
}

async function checkViewExists(viewName) {
  try {
    const { data, error } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT table_name, view_definition
          FROM information_schema.views
          WHERE table_schema = 'public'
            AND table_name = '${viewName}';
        `
      });

    if (error) {
      return { exists: false, error: error.message };
    }

    if (data && data.length > 0) {
      return { exists: true, details: data[0] };
    }

    return { exists: false };
  } catch (err) {
    return { exists: false, error: err.message };
  }
}

async function checkFunctionExists(functionName) {
  try {
    const { data, error } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT routine_name, routine_type, data_type as return_type
          FROM information_schema.routines
          WHERE routine_schema = 'public'
            AND routine_name = '${functionName}';
        `
      });

    if (error) {
      return { exists: false, error: error.message };
    }

    if (data && data.length > 0) {
      return { exists: true, details: data[0] };
    }

    return { exists: false };
  } catch (err) {
    return { exists: false, error: err.message };
  }
}

async function main() {
  console.log('🔍 E09 AND E10 CONFLICT AUDIT');
  console.log('=' .repeat(80));
  console.log();

  const results = {
    timestamp: new Date().toISOString(),
    conflicts: [],
    safe_to_execute: [],
    warnings: [],
    summary: {}
  };

  // Check E09 columns
  console.log('📋 CHECKING E09 COLUMNS...\n');
  for (const col of E09_OBJECTS.columns) {
    const check = await checkColumnExists(col.table, col.column);

    if (check.exists) {
      console.log(`⚠️  CONFLICT: Column ${col.table}.${col.column} ALREADY EXISTS`);
      console.log(`   Data Type: ${check.details.data_type}`);
      console.log(`   Nullable: ${check.details.is_nullable}`);
      console.log(`   Default: ${check.details.column_default || 'none'}`);

      results.conflicts.push({
        type: 'column',
        object: `${col.table}.${col.column}`,
        status: 'EXISTS',
        details: check.details,
        impact: 'E09 ALTER TABLE will fail with "column already exists" error'
      });
    } else {
      console.log(`✅ SAFE: Column ${col.table}.${col.column} does not exist`);
      results.safe_to_execute.push({
        type: 'column',
        object: `${col.table}.${col.column}`,
        status: 'SAFE TO CREATE'
      });
    }
    console.log();
  }

  // Check E09 indexes
  console.log('📇 CHECKING E09 INDEXES...\n');
  for (const indexName of E09_OBJECTS.indexes) {
    const check = await checkIndexExists(indexName);

    if (check.exists) {
      console.log(`⚠️  CONFLICT: Index ${indexName} ALREADY EXISTS`);
      console.log(`   Table: ${check.details.tablename}`);
      console.log(`   Definition: ${check.details.indexdef}`);

      results.conflicts.push({
        type: 'index',
        object: indexName,
        status: 'EXISTS',
        details: check.details,
        impact: 'E09 CREATE INDEX will fail with "relation already exists" error'
      });
    } else {
      console.log(`✅ SAFE: Index ${indexName} does not exist`);
      results.safe_to_execute.push({
        type: 'index',
        object: indexName,
        status: 'SAFE TO CREATE'
      });
    }
    console.log();
  }

  // Check E09 views
  console.log('👁️  CHECKING E09 VIEWS...\n');
  for (const viewName of E09_OBJECTS.views) {
    const check = await checkViewExists(viewName);

    if (check.exists) {
      console.log(`⚠️  EXISTS: View ${viewName} ALREADY EXISTS`);
      console.log(`   Definition: ${check.details.view_definition.substring(0, 100)}...`);

      results.warnings.push({
        type: 'view',
        object: viewName,
        status: 'EXISTS',
        details: check.details,
        impact: 'E09 uses CREATE OR REPLACE - will OVERWRITE existing view'
      });
    } else {
      console.log(`✅ SAFE: View ${viewName} does not exist`);
      results.safe_to_execute.push({
        type: 'view',
        object: viewName,
        status: 'SAFE TO CREATE'
      });
    }
    console.log();
  }

  // Check E09 functions
  console.log('⚙️  CHECKING E09 FUNCTIONS...\n');
  for (const funcName of E09_OBJECTS.functions) {
    const check = await checkFunctionExists(funcName);

    if (check.exists) {
      console.log(`⚠️  EXISTS: Function ${funcName} ALREADY EXISTS`);
      console.log(`   Type: ${check.details.routine_type}`);
      console.log(`   Returns: ${check.details.return_type}`);

      results.warnings.push({
        type: 'function',
        object: funcName,
        status: 'EXISTS',
        details: check.details,
        impact: 'E09 uses CREATE OR REPLACE - will OVERWRITE existing function'
      });
    } else {
      console.log(`✅ SAFE: Function ${funcName} does not exist`);
      results.safe_to_execute.push({
        type: 'function',
        object: funcName,
        status: 'SAFE TO CREATE'
      });
    }
    console.log();
  }

  // E09 vs E10 overlap analysis
  console.log('🔄 E09 vs E10 OVERLAP ANALYSIS...\n');
  console.log('⚠️  CRITICAL: E09 and E10 Prompt 8 want to create IDENTICAL objects:');
  console.log('   - Columns: parent_chunk_id, chunk_context, dimension_source on conversations');
  console.log('   - Indexes: idx_conversations_parent_chunk_id, idx_conversations_dimension_source');
  console.log('   - View: orphaned_conversations');
  console.log('   - Function: get_conversations_by_chunk');
  console.log();
  console.log('⚠️  IMPACT: If E09 is run first, E10 Prompt 8 will encounter errors when trying');
  console.log('   to create the same objects.');
  console.log();

  // Summary
  results.summary = {
    total_objects_checked: E09_OBJECTS.columns.length +
                          E09_OBJECTS.indexes.length +
                          E09_OBJECTS.views.length +
                          E09_OBJECTS.functions.length,
    conflicts_found: results.conflicts.length,
    warnings_found: results.warnings.length,
    safe_to_create: results.safe_to_execute.length
  };

  console.log('=' .repeat(80));
  console.log('📊 SUMMARY');
  console.log('=' .repeat(80));
  console.log(`Total objects checked:     ${results.summary.total_objects_checked}`);
  console.log(`Conflicts (will error):    ${results.summary.conflicts_found}`);
  console.log(`Warnings (will overwrite): ${results.summary.warnings_found}`);
  console.log(`Safe to create:            ${results.summary.safe_to_create}`);
  console.log();

  // Recommendation
  console.log('=' .repeat(80));
  console.log('💡 RECOMMENDATION');
  console.log('=' .repeat(80));

  if (results.conflicts.length > 0) {
    console.log('❌ DO NOT RUN E09 OR E10 AS-IS');
    console.log('   Conflicts detected that will cause SQL errors.');
    console.log('   Execute the safe SQL script generated in audit results.');
  } else if (results.warnings.length > 0) {
    console.log('⚠️  PROCEED WITH CAUTION');
    console.log('   Views/functions will be overwritten.');
    console.log('   Review existing definitions before proceeding.');
  } else {
    console.log('✅ SAFE TO PROCEED');
    console.log('   No conflicts detected. E09 can be executed safely.');
  }
  console.log();

  // Save results
  const outputPath = path.join(__dirname, '../../e09-e10-conflict-audit-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`✅ Detailed results saved to: ${outputPath}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
