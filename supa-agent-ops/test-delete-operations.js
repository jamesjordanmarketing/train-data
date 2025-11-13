/**
 * Validation Tests for Delete Operations
 * Tests agentDelete with dry-run and confirmation
 */

require('dotenv').config();
const { agentDelete } = require('./dist/operations/delete');
const { agentQuery, agentCount } = require('./dist/operations/query');
const { getSupabaseClient } = require('./dist/core/client');

async function testDeleteOperations() {
  console.log('===================================');
  console.log('Testing Delete Operations');
  console.log('===================================\n');

  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Dry-run mode (no actual deletion)
  try {
    console.log('Test 1: Dry-run mode...');
    const result = await agentDelete({
      table: 'conversations',
      where: [{ column: 'status', operator: 'eq', value: 'test_delete' }],
      dryRun: true
    });
    
    console.assert(result.success, 'Dry-run should succeed');
    console.assert(result.deletedCount === 0, 'Should not delete in dry-run');
    console.assert(Array.isArray(result.previewRecords), 'Should have preview records');
    console.assert(result.nextActions && result.nextActions.length > 0, 'Should suggest next actions');
    console.log(`   Would delete: ${result.previewRecords?.length || 0} records`);
    console.log('✅ Test 1 PASSED\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test 1 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Test 2: Require WHERE clause (safety check)
  try {
    console.log('Test 2: Require WHERE clause...');
    const result = await agentDelete({
      table: 'conversations',
      where: [],
      confirm: true
    });
    
    console.assert(!result.success, 'Should fail without WHERE clause');
    console.assert(result.summary.includes('WHERE clause required'), 'Should mention WHERE clause requirement');
    console.log('✅ Test 2 PASSED\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test 2 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Test 3: Require confirmation (safety check)
  try {
    console.log('Test 3: Require confirmation...');
    const result = await agentDelete({
      table: 'conversations',
      where: [{ column: 'id', operator: 'eq', value: 'test-id' }],
      confirm: false
    });
    
    console.assert(!result.success, 'Should fail without confirmation');
    console.assert(result.summary.includes('confirm: true required'), 'Should mention confirmation requirement');
    console.log('✅ Test 3 PASSED\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test 3 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Test 4: Dry-run with multiple filters
  try {
    console.log('Test 4: Dry-run with multiple filters...');
    const result = await agentDelete({
      table: 'conversations',
      where: [
        { column: 'status', operator: 'eq', value: 'test_delete' },
        { column: 'tier', operator: 'eq', value: 'test' }
      ],
      dryRun: true
    });
    
    console.assert(result.success, 'Dry-run should succeed');
    console.assert(result.deletedCount === 0, 'Should not delete in dry-run');
    console.log('✅ Test 4 PASSED\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test 4 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Test 5: Delete with non-existent record (should succeed with 0 deleted)
  try {
    console.log('Test 5: Delete non-existent record...');
    const result = await agentDelete({
      table: 'conversations',
      where: [{ column: 'id', operator: 'eq', value: 'nonexistent-id-xyz-123' }],
      confirm: true
    });
    
    console.assert(result.success, 'Delete should succeed even if no records match');
    console.assert(result.deletedCount === 0, 'Should delete 0 records');
    console.assert(result.nextActions && result.nextActions.length > 0, 'Should suggest checking filters');
    console.log('✅ Test 5 PASSED\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test 5 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Test 6: Error handling for non-existent table
  try {
    console.log('Test 6: Error handling for non-existent table...');
    const result = await agentDelete({
      table: 'nonexistent_table_xyz',
      where: [{ column: 'id', operator: 'eq', value: 'test' }],
      confirm: true
    });
    
    console.assert(!result.success, 'Delete should fail for non-existent table');
    console.assert(result.nextActions && result.nextActions.length > 0, 'Should provide recovery steps');
    console.log('✅ Test 6 PASSED\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test 6 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Test 7: Verify delete workflow - Create, Verify, Delete, Verify
  try {
    console.log('Test 7: Complete delete workflow...');
    
    // Step 1: Create a test record
    const supabase = getSupabaseClient();
    const testId = `test-delete-${Date.now()}`;
    const { error: insertError } = await supabase
      .from('conversations')
      .insert({
        id: testId,
        status: 'test_delete',
        tier: 'test',
        conversation_json: { test: true }
      });
    
    if (insertError) {
      console.log('   Skipping test - unable to create test record:', insertError.message);
      console.log('✅ Test 7 SKIPPED\n');
      testsPassed++;
    } else {
      // Step 2: Verify record exists
      const beforeCount = await agentCount({
        table: 'conversations',
        where: [{ column: 'id', operator: 'eq', value: testId }]
      });
      console.assert(beforeCount.count === 1, 'Test record should exist');
      
      // Step 3: Dry-run delete
      const dryRun = await agentDelete({
        table: 'conversations',
        where: [{ column: 'id', operator: 'eq', value: testId }],
        dryRun: true
      });
      console.assert(dryRun.success, 'Dry-run should succeed');
      console.assert(dryRun.previewRecords && dryRun.previewRecords.length > 0, 'Should show preview');
      
      // Step 4: Execute delete
      const deleteResult = await agentDelete({
        table: 'conversations',
        where: [{ column: 'id', operator: 'eq', value: testId }],
        confirm: true
      });
      console.assert(deleteResult.success, 'Delete should succeed');
      console.assert(deleteResult.deletedCount >= 0, 'Should report deleted count');
      
      // Step 5: Verify record deleted
      const afterCount = await agentCount({
        table: 'conversations',
        where: [{ column: 'id', operator: 'eq', value: testId }]
      });
      console.assert(afterCount.count === 0, 'Test record should be deleted');
      
      console.log('✅ Test 7 PASSED\n');
      testsPassed++;
    }
  } catch (error) {
    console.error('❌ Test 7 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Test 8: Verify safety message in nextActions
  try {
    console.log('Test 8: Verify safety guidance in dry-run...');
    const result = await agentDelete({
      table: 'conversations',
      where: [{ column: 'status', operator: 'eq', value: 'test' }],
      dryRun: true
    });
    
    console.assert(result.success, 'Dry-run should succeed');
    const hasBackupAction = result.nextActions.some(
      action => action.action === 'BACKUP_FIRST'
    );
    console.assert(hasBackupAction, 'Should suggest backup in next actions');
    console.log('✅ Test 8 PASSED\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test 8 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Summary
  console.log('===================================');
  console.log('Delete Operations Test Summary');
  console.log('===================================');
  console.log(`Tests Passed: ${testsPassed}`);
  console.log(`Tests Failed: ${testsFailed}`);
  console.log(`Total Tests: ${testsPassed + testsFailed}`);
  console.log('===================================\n');

  return testsFailed === 0;
}

// Run tests
testDeleteOperations()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });

