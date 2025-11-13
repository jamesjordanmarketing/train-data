/**
 * Validation Tests for Query Operations
 * Tests agentQuery and agentCount functions
 */

require('dotenv').config();
const { agentQuery, agentCount } = require('./dist/operations/query');
const { getSupabaseClient } = require('./dist/core/client');

async function testQueryOperations() {
  console.log('===================================');
  console.log('Testing Query Operations');
  console.log('===================================\n');

  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Simple query with filtering
  try {
    console.log('Test 1: Simple query with filtering...');
    const result = await agentQuery({
      table: 'conversations',
      where: [{ column: 'status', operator: 'eq', value: 'approved' }],
      limit: 10
    });
    
    console.assert(result.success, 'Query should succeed');
    console.assert(Array.isArray(result.data), 'Data should be an array');
    console.assert(result.data.length <= 10, 'Should respect limit');
    console.log('✅ Test 1 PASSED\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test 1 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Test 2: Query with ordering
  try {
    console.log('Test 2: Query with ordering...');
    const result = await agentQuery({
      table: 'conversations',
      orderBy: [{ column: 'created_at', asc: false }],
      limit: 5
    });
    
    console.assert(result.success, 'Query should succeed');
    console.assert(result.data.length <= 5, 'Should respect limit');
    console.log('✅ Test 2 PASSED\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test 2 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Test 3: Query with multiple filters
  try {
    console.log('Test 3: Query with multiple filters...');
    const result = await agentQuery({
      table: 'conversations',
      where: [
        { column: 'tier', operator: 'eq', value: 'template' },
        { column: 'status', operator: 'eq', value: 'approved' }
      ],
      limit: 10
    });
    
    console.assert(result.success, 'Query should succeed');
    console.assert(Array.isArray(result.data), 'Data should be an array');
    console.log('✅ Test 3 PASSED\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test 3 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Test 4: Query with count
  try {
    console.log('Test 4: Query with count...');
    const result = await agentQuery({
      table: 'conversations',
      where: [{ column: 'status', operator: 'eq', value: 'approved' }],
      count: true
    });
    
    console.assert(result.success, 'Query should succeed');
    console.assert(typeof result.count === 'number', 'Should return count');
    console.log(`   Count: ${result.count}`);
    console.log('✅ Test 4 PASSED\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test 4 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Test 5: Query with aggregation
  try {
    console.log('Test 5: Query with aggregation...');
    const result = await agentQuery({
      table: 'conversations',
      aggregate: [
        { function: 'COUNT', column: 'id', alias: 'total' }
      ],
      limit: 100
    });
    
    console.assert(result.success, 'Query should succeed');
    console.assert(result.aggregates && typeof result.aggregates.total === 'number', 'Should return aggregates');
    console.log(`   Aggregate total: ${result.aggregates.total}`);
    console.log('✅ Test 5 PASSED\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test 5 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Test 6: Simple count query
  try {
    console.log('Test 6: Simple count query...');
    const result = await agentCount({
      table: 'conversations'
    });
    
    console.assert(result.success, 'Count should succeed');
    console.assert(typeof result.count === 'number', 'Should return count');
    console.log(`   Total count: ${result.count}`);
    console.log('✅ Test 6 PASSED\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test 6 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Test 7: Count with filter
  try {
    console.log('Test 7: Count with filter...');
    const result = await agentCount({
      table: 'conversations',
      where: [{ column: 'tier', operator: 'eq', value: 'template' }]
    });
    
    console.assert(result.success, 'Count should succeed');
    console.assert(typeof result.count === 'number', 'Should return count');
    console.log(`   Filtered count: ${result.count}`);
    console.log('✅ Test 7 PASSED\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test 7 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Test 8: Query with pagination
  try {
    console.log('Test 8: Query with pagination...');
    const result = await agentQuery({
      table: 'conversations',
      limit: 5,
      offset: 0
    });
    
    console.assert(result.success, 'Query should succeed');
    console.assert(result.data.length <= 5, 'Should respect limit');
    console.log('✅ Test 8 PASSED\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test 8 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Test 9: Query with column selection
  try {
    console.log('Test 9: Query with column selection...');
    const result = await agentQuery({
      table: 'conversations',
      select: ['id', 'status'],
      limit: 5
    });
    
    console.assert(result.success, 'Query should succeed');
    console.assert(result.data.length <= 5, 'Should respect limit');
    console.log('✅ Test 9 PASSED\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test 9 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Test 10: Error handling for non-existent table
  try {
    console.log('Test 10: Error handling for non-existent table...');
    const result = await agentQuery({
      table: 'nonexistent_table_xyz',
      limit: 10
    });
    
    console.assert(!result.success, 'Query should fail for non-existent table');
    console.assert(result.nextActions && result.nextActions.length > 0, 'Should provide next actions');
    console.log('✅ Test 10 PASSED\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test 10 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Summary
  console.log('===================================');
  console.log('Query Operations Test Summary');
  console.log('===================================');
  console.log(`Tests Passed: ${testsPassed}`);
  console.log(`Tests Failed: ${testsFailed}`);
  console.log(`Total Tests: ${testsPassed + testsFailed}`);
  console.log('===================================\n');

  return testsFailed === 0;
}

// Run tests
testQueryOperations()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });

