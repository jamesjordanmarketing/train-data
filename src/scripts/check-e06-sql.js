#!/usr/bin/env node

/**
 * E06 SQL Implementation Checker - Review Queue & Quality Feedback Loop
 * 
 * Checks implementation status of SQL components from E06 execution file:
 * - reviewHistory column on conversations table
 * - Indexes for review queue optimization
 * - Database functions (append_review_action)
 * - Views (review_queue_stats)
 * - Additional columns (approved_by, approved_at, reviewer_notes)
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

// E06 SQL Components to check
const E06_COMPONENTS = {
  // Table modifications
  table_columns: {
    'conversations': [
      'reviewHistory', // JSONB column for review actions
      'approved_by',   // UUID reference to auth.users
      'approved_at',   // TIMESTAMPTZ for approval timestamp
      'reviewer_notes' // TEXT for reviewer comments
    ]
  },
  
  // Indexes
  indexes: [
    'idx_conversations_review_history',    // GIN index on reviewHistory
    'idx_conversations_pending_review',    // Partial index for review queue
    'idx_conversations_approved'           // Partial index for approved conversations
  ],
  
  // Database functions
  functions: [
    'append_review_action'  // Function to safely append review actions
  ],
  
  // Views
  views: [
    'review_queue_stats'    // View for review queue statistics
  ],
  
  // Constraints
  constraints: [
    'check_review_action_types',    // CHECK constraint for reviewHistory
    'conversations_status_check'    // CHECK constraint for status values
  ]
};

// Expected status values for conversations
const EXPECTED_STATUS_VALUES = [
  'draft', 'generated', 'pending_review', 'approved', 'rejected', 'needs_revision', 'failed'
];

async function checkTableColumns(tableName, expectedColumns) {
  console.log(`\n🔍 Checking table: ${tableName}`);
  
  try {
    // Check if table exists and get its columns
    const { data: tableExists } = await client
      .from(tableName)
      .select('*')
      .limit(0);
    
    if (!tableExists && tableExists !== null) {
      return {
        table: tableName,
        exists: false,
        category: 4,
        categoryDescription: "Table doesn't exist at all",
        details: `The ${tableName} table is missing entirely`
      };
    }
    
    // Check each expected column
    const columnResults = [];
    for (const columnName of expectedColumns) {
      try {
        // Try to select the column to see if it exists
        const { error } = await client
          .from(tableName)
          .select(columnName)
          .limit(1);
        
        if (error && error.message.includes('column') && error.message.includes('does not exist')) {
          columnResults.push({
            column: columnName,
            exists: false,
            error: error.message
          });
        } else {
          columnResults.push({
            column: columnName,
            exists: true
          });
        }
      } catch (err) {
        columnResults.push({
          column: columnName,
          exists: false,
          error: err.message
        });
      }
    }
    
    const missingColumns = columnResults.filter(c => !c.exists);
    const existingColumns = columnResults.filter(c => c.exists);
    
    let category, categoryDescription;
    if (missingColumns.length === 0) {
      category = 1;
      categoryDescription = "Already implemented as described (no changes needed)";
    } else if (existingColumns.length > 0) {
      category = 2;
      categoryDescription = "Table exists but needs fields that are not implemented yet";
    } else {
      category = 4;
      categoryDescription = "Table doesn't exist at all";
    }
    
    return {
      table: tableName,
      exists: true,
      category,
      categoryDescription,
      expectedColumns,
      existingColumns: existingColumns.map(c => c.column),
      missingColumns: missingColumns.map(c => c.column),
      details: missingColumns.length > 0 ? 
        `Missing columns: ${missingColumns.map(c => c.column).join(', ')}` :
        'All expected columns are present'
    };
    
  } catch (error) {
    return {
      table: tableName,
      exists: false,
      category: 4,
      categoryDescription: "Table doesn't exist at all",
      error: error.message
    };
  }
}

async function checkIndexes() {
  console.log(`\n🔍 Checking indexes...`);
  const results = [];
  
  for (const indexName of E06_COMPONENTS.indexes) {
    try {
      // Query pg_indexes to check if index exists
      const { data, error } = await client.rpc('exec_sql', {
        query: `SELECT indexname FROM pg_indexes WHERE indexname = '${indexName}';`
      });
      
      if (error) {
        // Try alternative method - check if we can use the index
        results.push({
          name: indexName,
          exists: false,
          category: 4,
          categoryDescription: "Index doesn't exist at all",
          details: `Index ${indexName} is missing`,
          error: error.message
        });
      } else if (data && data.length > 0) {
        results.push({
          name: indexName,
          exists: true,
          category: 1,
          categoryDescription: "Already implemented as described (no changes needed)",
          details: `Index ${indexName} exists`
        });
      } else {
        results.push({
          name: indexName,
          exists: false,
          category: 4,
          categoryDescription: "Index doesn't exist at all",
          details: `Index ${indexName} is missing`
        });
      }
    } catch (err) {
      results.push({
        name: indexName,
        exists: false,
        category: 4,
        categoryDescription: "Index doesn't exist at all",
        details: `Index ${indexName} is missing`,
        error: err.message
      });
    }
  }
  
  return results;
}

async function checkFunctions() {
  console.log(`\n🔍 Checking database functions...`);
  const results = [];
  
  for (const functionName of E06_COMPONENTS.functions) {
    try {
      // Try to call the function with dummy parameters to see if it exists
      const { data, error } = await client.rpc(functionName, {
        p_conversation_id: '00000000-0000-0000-0000-000000000000',
        p_action: 'test',
        p_performed_by: '00000000-0000-0000-0000-000000000000',
        p_comment: 'test',
        p_reasons: ['test']
      });
      
      if (error && error.message.includes('function') && error.message.includes('does not exist')) {
        results.push({
          name: functionName,
          exists: false,
          category: 4,
          categoryDescription: "Function doesn't exist at all",
          details: `Function ${functionName} is missing`
        });
      } else {
        // Function exists (even if it failed due to invalid parameters)
        results.push({
          name: functionName,
          exists: true,
          category: 1,
          categoryDescription: "Already implemented as described (no changes needed)",
          details: `Function ${functionName} exists`
        });
      }
    } catch (err) {
      if (err.message.includes('function') && err.message.includes('does not exist')) {
        results.push({
          name: functionName,
          exists: false,
          category: 4,
          categoryDescription: "Function doesn't exist at all",
          details: `Function ${functionName} is missing`
        });
      } else {
        results.push({
          name: functionName,
          exists: true,
          category: 1,
          categoryDescription: "Already implemented as described (no changes needed)",
          details: `Function ${functionName} exists (test call failed as expected)`
        });
      }
    }
  }
  
  return results;
}

async function checkViews() {
  console.log(`\n🔍 Checking views...`);
  const results = [];
  
  for (const viewName of E06_COMPONENTS.views) {
    try {
      const { data, error } = await client
        .from(viewName)
        .select('*')
        .limit(1);
      
      if (error && error.message.includes('does not exist')) {
        results.push({
          name: viewName,
          exists: false,
          category: 4,
          categoryDescription: "View doesn't exist at all",
          details: `View ${viewName} is missing`
        });
      } else {
        results.push({
          name: viewName,
          exists: true,
          category: 1,
          categoryDescription: "Already implemented as described (no changes needed)",
          details: `View ${viewName} exists`
        });
      }
    } catch (err) {
      results.push({
        name: viewName,
        exists: false,
        category: 4,
        categoryDescription: "View doesn't exist at all",
        details: `View ${viewName} is missing`,
        error: err.message
      });
    }
  }
  
  return results;
}

async function checkStatusConstraint() {
  console.log(`\n🔍 Checking status constraint...`);
  
  try {
    // Try to insert a conversation with an invalid status to test the constraint
    const testId = '00000000-0000-0000-0000-000000000001';
    const { error } = await client
      .from('conversations')
      .insert({
        id: testId,
        conversation_id: 'test',
        title: 'test',
        status: 'invalid_status', // This should fail if constraint exists
        tier: 'template',
        category: ['test'],
        totalTurns: 1,
        totalTokens: 100,
        parameters: {}
      });
    
    if (error && error.message.includes('check constraint')) {
      return {
        name: 'conversations_status_check',
        exists: true,
        category: 1,
        categoryDescription: "Already implemented as described (no changes needed)",
        details: "Status constraint is working - invalid status rejected"
      };
    } else {
      // Clean up the test record if it was inserted
      await client.from('conversations').delete().eq('id', testId);
      
      return {
        name: 'conversations_status_check',
        exists: false,
        category: 2,
        categoryDescription: "Table exists but needs constraints that are not implemented yet",
        details: "Status constraint is missing - invalid status was accepted"
      };
    }
  } catch (err) {
    return {
      name: 'conversations_status_check',
      exists: false,
      category: 4,
      categoryDescription: "Cannot determine constraint status",
      details: `Error checking constraint: ${err.message}`,
      error: err.message
    };
  }
}

async function main() {
  console.log('🔍 E06 SQL Implementation Check - Review Queue & Quality Feedback Loop\n');
  console.log('='.repeat(80));
  console.log('Checking implementation status of E06 SQL components...\n');
  
  const allResults = [];
  
  // Check table columns
  for (const [tableName, columns] of Object.entries(E06_COMPONENTS.table_columns)) {
    const result = await checkTableColumns(tableName, columns);
    allResults.push({ type: 'table', ...result });
  }
  
  // Check indexes
  const indexResults = await checkIndexes();
  allResults.push(...indexResults.map(r => ({ type: 'index', ...r })));
  
  // Check functions
  const functionResults = await checkFunctions();
  allResults.push(...functionResults.map(r => ({ type: 'function', ...r })));
  
  // Check views
  const viewResults = await checkViews();
  allResults.push(...viewResults.map(r => ({ type: 'view', ...r })));
  
  // Check status constraint
  const constraintResult = await checkStatusConstraint();
  allResults.push({ type: 'constraint', ...constraintResult });
  
  // Categorize results
  const category1 = allResults.filter(r => r.category === 1);
  const category2 = allResults.filter(r => r.category === 2);
  const category3 = allResults.filter(r => r.category === 3);
  const category4 = allResults.filter(r => r.category === 4);
  
  // Display results
  console.log('\n\n📊 RESULTS BY CATEGORY:');
  console.log('='.repeat(80));
  
  if (category1.length > 0) {
    console.log('\n✅ CATEGORY 1: Already implemented as described (no changes needed)');
    category1.forEach(r => {
      console.log(`   ${r.type}: ${r.name || r.table} - ${r.details}`);
    });
  }
  
  if (category2.length > 0) {
    console.log('\n⚠️  CATEGORY 2: Exists but needs fields/triggers that are not implemented yet');
    category2.forEach(r => {
      console.log(`   ${r.type}: ${r.name || r.table} - ${r.details}`);
    });
  }
  
  if (category3.length > 0) {
    console.log('\n🚨 CATEGORY 3: Exists but appears to be for different purpose (could break components)');
    category3.forEach(r => {
      console.log(`   ${r.type}: ${r.name || r.table} - ${r.details}`);
    });
  }
  
  if (category4.length > 0) {
    console.log('\n❌ CATEGORY 4: Doesn\'t exist at all');
    category4.forEach(r => {
      console.log(`   ${r.type}: ${r.name || r.table} - ${r.details}`);
    });
  }
  
  // Summary
  console.log('\n\n📋 SUMMARY:');
  console.log('='.repeat(80));
  console.log(`Total components checked: ${allResults.length}`);
  console.log(`Category 1 (Implemented): ${category1.length}`);
  console.log(`Category 2 (Needs changes): ${category2.length}`);
  console.log(`Category 3 (Conflicts): ${category3.length}`);
  console.log(`Category 4 (Missing): ${category4.length}`);
  
  // Recommendations
  if (category4.length > 0 || category2.length > 0) {
    console.log('\n\n🔧 RECOMMENDATIONS:');
    console.log('='.repeat(80));
    console.log('Run the E06 SQL script in Supabase SQL Editor to implement missing components:');
    console.log('1. Add missing columns to conversations table');
    console.log('2. Create missing indexes for performance');
    console.log('3. Create the append_review_action function');
    console.log('4. Create the review_queue_stats view');
    console.log('5. Add status constraint validation');
  }
  
  // Save results
  const outputPath = path.resolve(__dirname, '../../pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E06-sql-check-results.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    segment: 'E06',
    description: 'Review Queue & Quality Feedback Loop',
    results: allResults,
    summary: {
      total: allResults.length,
      category1: category1.length,
      category2: category2.length,
      category3: category3.length,
      category4: category4.length
    }
  }, null, 2));
  
  console.log(`\n💾 Detailed results saved to: ${outputPath}`);
}

main().catch(console.error);