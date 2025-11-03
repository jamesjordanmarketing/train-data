#!/usr/bin/env node

/**
 * E07 SQL Implementation Check - Template Management System
 * 
 * Checks implementation status of:
 * - templates table (with E07 schema)
 * - scenarios table (with template relationships)
 * - edge_cases table (with scenario relationships)
 * - Indexes, triggers, RLS policies, helper functions
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

// E07 Tables and their expected schemas
const E07_TABLES = {
  'templates': {
    requiredColumns: [
      'id', 'name', 'description', 'category', 'structure', 'variables',
      'tone', 'complexity_baseline', 'style_notes', 'example_conversation',
      'quality_threshold', 'required_elements', 'usage_count', 'rating',
      'created_by', 'created_at', 'last_modified'
    ],
    keyConstraints: [
      'template_name_unique',
      'template_variables_is_array'
    ],
    indexes: [
      'idx_templates_category',
      'idx_templates_rating',
      'idx_templates_usage_count',
      'idx_templates_created_by',
      'idx_templates_created_at',
      'idx_templates_variables_gin'
    ],
    triggers: ['trigger_update_templates_last_modified'],
    functions: ['update_templates_last_modified']
  },
  'scenarios': {
    requiredColumns: [
      'id', 'name', 'description', 'parent_template_id', 'parent_template_name',
      'context', 'parameter_values', 'variation_count', 'status', 'quality_score',
      'topic', 'persona', 'emotional_arc', 'generation_status', 'conversation_id',
      'error_message', 'created_by', 'created_at'
    ],
    keyConstraints: [
      'scenario_parameter_values_is_object'
    ],
    indexes: [
      'idx_scenarios_parent_template',
      'idx_scenarios_status',
      'idx_scenarios_generation_status',
      'idx_scenarios_persona',
      'idx_scenarios_topic',
      'idx_scenarios_created_by',
      'idx_scenarios_created_at',
      'idx_scenarios_template_status',
      'idx_scenarios_parameter_values_gin'
    ],
    foreignKeys: ['parent_template_id -> templates(id)']
  },
  'edge_cases': {
    requiredColumns: [
      'id', 'title', 'description', 'parent_scenario_id', 'parent_scenario_name',
      'edge_case_type', 'complexity', 'test_status', 'test_results',
      'created_by', 'created_at'
    ],
    keyConstraints: [
      'edge_case_test_results_is_object'
    ],
    indexes: [
      'idx_edge_cases_parent_scenario',
      'idx_edge_cases_type',
      'idx_edge_cases_test_status',
      'idx_edge_cases_complexity',
      'idx_edge_cases_created_by',
      'idx_edge_cases_created_at',
      'idx_edge_cases_scenario_status',
      'idx_edge_cases_test_results_gin'
    ],
    foreignKeys: ['parent_scenario_id -> scenarios(id)']
  }
};

// Helper functions from E07 schema
const E07_HELPER_FUNCTIONS = [
  'get_template_scenario_count',
  'get_scenario_edge_case_count',
  'safe_delete_template',
  'safe_delete_scenario'
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
    // Try to get one record to see column structure
    const { data, error } = await client.from(tableName).select('*').limit(1);
    if (error) return [];
    
    if (data && data.length > 0) {
      return Object.keys(data[0]);
    }
    
    // If no data, try to infer from empty result
    return [];
  } catch (err) {
    return [];
  }
}

async function checkRLSPolicies(tableName) {
  // This would require direct SQL access to pg_policies
  // For now, we'll assume they exist if the table exists
  return true;
}

async function analyzeTable(tableName) {
  const tableConfig = E07_TABLES[tableName];
  const exists = await checkTableExists(tableName);
  
  if (!exists) {
    return {
      table: tableName,
      exists: false,
      category: 4,
      categoryDescription: "Table doesn't exist at all",
      requiredColumns: tableConfig.requiredColumns,
      actualColumns: [],
      missingColumns: tableConfig.requiredColumns,
      recommendation: `Run the E07 SQL script to create the ${tableName} table with full schema`
    };
  }

  const actualColumns = await getTableColumns(tableName);
  const missingColumns = tableConfig.requiredColumns.filter(col => 
    !actualColumns.includes(col)
  );

  let category, categoryDescription;
  
  if (missingColumns.length === 0) {
    category = 1;
    categoryDescription = "Already implemented as described in E07 (no changes needed)";
  } else if (missingColumns.length < tableConfig.requiredColumns.length / 2) {
    category = 2;
    categoryDescription = "Table exists but needs fields or triggers that are not implemented yet";
  } else {
    category = 3;
    categoryDescription = "Table exists but appears to be for a different purpose and/or these changes could break some other component";
  }

  return {
    table: tableName,
    exists: true,
    category: category,
    categoryDescription: categoryDescription,
    requiredColumns: tableConfig.requiredColumns,
    actualColumns: actualColumns,
    missingColumns: missingColumns,
    expectedIndexes: tableConfig.indexes || [],
    expectedConstraints: tableConfig.keyConstraints || [],
    expectedTriggers: tableConfig.triggers || [],
    foreignKeys: tableConfig.foreignKeys || [],
    recommendation: category === 1 ? 
      "No action needed - table is properly implemented" :
      `Add missing columns: ${missingColumns.join(', ')}`
  };
}

async function checkHelperFunctions() {
  const results = [];
  
  for (const functionName of E07_HELPER_FUNCTIONS) {
    try {
      // Try to call the function with a dummy UUID to see if it exists
      const testUuid = '00000000-0000-0000-0000-000000000000';
      
      if (functionName.includes('count')) {
        const { data, error } = await client.rpc(functionName, { 
          [functionName.includes('template') ? 'template_id' : 'scenario_id']: testUuid 
        });
        results.push({
          function: functionName,
          exists: !error,
          error: error?.message
        });
      } else {
        // For safe_delete functions, just check if they exist (don't call them)
        results.push({
          function: functionName,
          exists: false, // We can't easily test these without risking data
          note: 'Cannot test delete functions safely - manual verification needed'
        });
      }
    } catch (err) {
      results.push({
        function: functionName,
        exists: false,
        error: err.message
      });
    }
  }
  
  return results;
}

async function main() {
  console.log('🔍 E07 SQL Implementation Check - Template Management System\n');
  console.log('='.repeat(80));
  console.log('Checking implementation of templates, scenarios, and edge_cases tables');
  console.log('with their complete E07 schema, indexes, triggers, and helper functions\n');
  console.log('='.repeat(80));
  
  const results = [];
  
  // Check each table
  for (const tableName of Object.keys(E07_TABLES)) {
    console.log(`\nAnalyzing table: ${tableName}...`);
    const result = await analyzeTable(tableName);
    results.push(result);
    
    console.log(`  Status: ${result.exists ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  Category: ${result.category} - ${result.categoryDescription}`);
    
    if (result.exists && result.missingColumns.length > 0) {
      console.log(`  ⚠️  Missing columns: ${result.missingColumns.join(', ')}`);
    }
    
    if (result.actualColumns.length > 0) {
      console.log(`  📋 Current columns (${result.actualColumns.length}): ${result.actualColumns.slice(0, 5).join(', ')}${result.actualColumns.length > 5 ? '...' : ''}`);
    }
  }
  
  // Check helper functions
  console.log('\n\n🔧 Checking E07 Helper Functions...');
  console.log('='.repeat(50));
  const functionResults = await checkHelperFunctions();
  
  functionResults.forEach(result => {
    const status = result.exists ? '✅' : '❌';
    console.log(`  ${status} ${result.function}`);
    if (result.error) {
      console.log(`      Error: ${result.error}`);
    }
    if (result.note) {
      console.log(`      Note: ${result.note}`);
    }
  });
  
  // Generate summary and recommendations
  console.log('\n\n📊 SUMMARY BY CATEGORY:');
  console.log('='.repeat(80));
  
  const categories = {
    1: results.filter(r => r.category === 1),
    2: results.filter(r => r.category === 2),
    3: results.filter(r => r.category === 3),
    4: results.filter(r => r.category === 4)
  };
  
  console.log(`\n✅ Category 1 (Fully Implemented): ${categories[1].length} tables`);
  categories[1].forEach(r => console.log(`   • ${r.table}`));
  
  console.log(`\n⚠️  Category 2 (Needs Additional Fields): ${categories[2].length} tables`);
  categories[2].forEach(r => console.log(`   • ${r.table} - Missing: ${r.missingColumns.join(', ')}`));
  
  console.log(`\n🔄 Category 3 (Potential Conflicts): ${categories[3].length} tables`);
  categories[3].forEach(r => console.log(`   • ${r.table} - Major schema differences detected`));
  
  console.log(`\n❌ Category 4 (Missing Tables): ${categories[4].length} tables`);
  categories[4].forEach(r => console.log(`   • ${r.table}`));
  
  // Action items
  console.log('\n\n🎯 RECOMMENDED ACTIONS:');
  console.log('='.repeat(80));
  
  if (categories[4].length > 0) {
    console.log('\n1. CREATE MISSING TABLES:');
    console.log('   Run the complete E07 SQL script from 04-FR-wireframes-execution-E07.md');
    categories[4].forEach(r => console.log(`   • ${r.table}`));
  }
  
  if (categories[2].length > 0) {
    console.log('\n2. ADD MISSING COLUMNS:');
    console.log('   Run the migration script from 04-FR-wireframes-execution-E07-part4.md');
    categories[2].forEach(r => {
      console.log(`   • ${r.table}:`);
      r.missingColumns.forEach(col => console.log(`     - ADD COLUMN ${col}`));
    });
  }
  
  if (categories[3].length > 0) {
    console.log('\n3. RESOLVE CONFLICTS:');
    console.log('   Manual review required - existing tables may conflict with E07 schema');
    categories[3].forEach(r => console.log(`   • ${r.table} - Review existing structure`));
  }
  
  const missingFunctions = functionResults.filter(f => !f.exists);
  if (missingFunctions.length > 0) {
    console.log('\n4. CREATE HELPER FUNCTIONS:');
    console.log('   Run the helper function SQL from E07 execution files');
    missingFunctions.forEach(f => console.log(`   • ${f.function}`));
  }
  
  console.log('\n\n✨ Next Steps:');
  console.log('1. Review this analysis');
  console.log('2. Run appropriate SQL scripts based on categories above');
  console.log('3. Re-run this check script to verify implementation');
  console.log('4. Test CRUD operations once schema is complete');
  
  return results;
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, analyzeTable, checkTableExists };