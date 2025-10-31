/**
 * Export Service Test Script
 * 
 * Manual testing script to validate ExportService CRUD operations.
 * Run this script after database migration to ensure everything works correctly.
 * 
 * Usage:
 *   ts-node scripts/test-export-service.ts
 * 
 * Prerequisites:
 *   - SUPABASE_URL and SUPABASE_ANON_KEY environment variables set
 *   - export_logs table created and RLS policies configured
 *   - Test user authenticated
 */

import { createClient } from '@supabase/supabase-js';
import { createExportService, ExportNotFoundError } from '../src/lib/export-service';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    log(`✗ FAILED: ${message}`, 'red');
    throw new Error(`Assertion failed: ${message}`);
  }
  log(`✓ PASSED: ${message}`, 'green');
}

async function runTests() {
  log('\n=== Export Service Test Suite ===\n', 'cyan');

  // Initialize Supabase client
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log('ERROR: Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables', 'red');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const exportService = createExportService(supabase);

  // Get current user (for RLS testing)
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    log('ERROR: Not authenticated. Please authenticate first.', 'red');
    log('You may need to set up test authentication or use a service role key.', 'yellow');
    process.exit(1);
  }

  log(`Testing with user: ${user.id}\n`, 'blue');

  let createdExportId: string;

  try {
    // Test 1: Create Export Log
    log('Test 1: Create Export Log', 'cyan');
    const createInput = {
      user_id: user.id,
      format: 'jsonl' as const,
      config: {
        scope: 'filtered' as const,
        format: 'jsonl' as const,
        includeMetadata: true,
        includeQualityScores: true,
        includeTimestamps: true,
        includeApprovalHistory: false,
        includeParentReferences: false,
        includeFullContent: true,
      },
      conversation_count: 42,
    };

    const createdLog = await exportService.createExportLog(createInput);
    createdExportId = createdLog.export_id;

    assert(!!createdLog.export_id, 'Export log has export_id');
    assert(createdLog.user_id === user.id, 'User ID matches');
    assert(createdLog.format === 'jsonl', 'Format is jsonl');
    assert(createdLog.conversation_count === 42, 'Conversation count is 42');
    assert(createdLog.status === 'queued', 'Initial status is queued');
    assert(!!createdLog.timestamp, 'Timestamp is set');
    assert(!!createdLog.created_at, 'Created_at is set');
    log(`Created export: ${createdExportId}\n`, 'blue');

    // Test 2: Get Export Log
    log('Test 2: Get Export Log by ID', 'cyan');
    const retrievedLog = await exportService.getExportLog(createdExportId);
    assert(retrievedLog !== null, 'Export log retrieved');
    assert(retrievedLog!.export_id === createdExportId, 'Export ID matches');
    assert(retrievedLog!.conversation_count === 42, 'Conversation count matches');
    log('');

    // Test 3: Get Non-existent Export Log
    log('Test 3: Get Non-existent Export Log', 'cyan');
    const nonExistentLog = await exportService.getExportLog('non-existent-uuid');
    assert(nonExistentLog === null, 'Returns null for non-existent ID');
    log('');

    // Test 4: Update Export Log (Mark as Processing)
    log('Test 4: Update Export Log - Mark as Processing', 'cyan');
    const processingLog = await exportService.updateExportLog(createdExportId, {
      status: 'processing',
    });
    assert(processingLog.status === 'processing', 'Status updated to processing');
    assert(processingLog.export_id === createdExportId, 'Export ID unchanged');
    log('');

    // Test 5: Update Export Log (Mark as Completed)
    log('Test 5: Update Export Log - Mark as Completed', 'cyan');
    const completedLog = await exportService.updateExportLog(createdExportId, {
      status: 'completed',
      file_size: 1024000,
      file_url: 'https://storage.example.com/exports/test.jsonl',
      expires_at: new Date(Date.now() + 86400000).toISOString(), // 24 hours
    });
    assert(completedLog.status === 'completed', 'Status updated to completed');
    assert(completedLog.file_size === 1024000, 'File size updated');
    assert(completedLog.file_url === 'https://storage.example.com/exports/test.jsonl', 'File URL updated');
    assert(!!completedLog.expires_at, 'Expiration timestamp set');
    log('');

    // Test 6: List Export Logs
    log('Test 6: List Export Logs', 'cyan');
    const { logs, total } = await exportService.listExportLogs(user.id, {}, { page: 1, limit: 10 });
    assert(logs.length > 0, 'At least one log returned');
    assert(total >= logs.length, 'Total count is valid');
    assert(logs.some(log => log.export_id === createdExportId), 'Created log is in list');
    log(`Found ${total} total exports, retrieved ${logs.length}\n`, 'blue');

    // Test 7: List Export Logs with Filters
    log('Test 7: List Export Logs with Filters', 'cyan');
    const { logs: filteredLogs } = await exportService.listExportLogs(
      user.id,
      {
        format: 'jsonl',
        status: 'completed',
      },
      { page: 1, limit: 10 }
    );
    assert(
      filteredLogs.every(log => log.format === 'jsonl' && log.status === 'completed'),
      'All logs match filters'
    );
    log(`Filtered to ${filteredLogs.length} logs\n`, 'blue');

    // Test 8: Create Export with Expired Timestamp
    log('Test 8: Create Export with Past Expiration (for cleanup test)', 'cyan');
    const expiredExport = await exportService.createExportLog({
      user_id: user.id,
      format: 'json',
      config: createInput.config,
      conversation_count: 10,
      status: 'completed',
    });
    
    // Update with expired timestamp
    await exportService.updateExportLog(expiredExport.export_id, {
      expires_at: new Date(Date.now() - 1000).toISOString(), // Expired 1 second ago
    });
    log(`Created expired export: ${expiredExport.export_id}\n`, 'blue');

    // Test 9: Mark Expired Exports
    log('Test 9: Mark Expired Exports', 'cyan');
    const markedCount = await exportService.markExpiredExports();
    assert(markedCount >= 1, 'At least one export marked as expired');
    log(`Marked ${markedCount} exports as expired\n`, 'blue');

    // Verify the expired export status changed
    const expiredLog = await exportService.getExportLog(expiredExport.export_id);
    assert(expiredLog?.status === 'expired', 'Export status changed to expired');

    // Test 10: Update Non-existent Export (Error Handling)
    log('Test 10: Update Non-existent Export (Error Handling)', 'cyan');
    try {
      await exportService.updateExportLog('non-existent-uuid', { status: 'completed' });
      assert(false, 'Should throw ExportNotFoundError');
    } catch (error) {
      assert(error instanceof ExportNotFoundError, 'Throws ExportNotFoundError');
      assert(error.message.includes('non-existent-uuid'), 'Error message includes export_id');
    }
    log('');

    // Test 11: Delete Export Log
    log('Test 11: Delete Export Log', 'cyan');
    await exportService.deleteExportLog(expiredExport.export_id);
    const deletedLog = await exportService.getExportLog(expiredExport.export_id);
    assert(deletedLog === null, 'Export log deleted successfully');
    log('');

    log('=== All Tests Passed! ===\n', 'green');
    
    // Cleanup
    log('Cleaning up test data...', 'yellow');
    await exportService.deleteExportLog(createdExportId);
    log('Cleanup complete.\n', 'green');

  } catch (error) {
    log(`\n=== Test Suite Failed ===`, 'red');
    console.error(error);
    
    // Attempt cleanup on error
    if (createdExportId!) {
      try {
        await exportService.deleteExportLog(createdExportId);
        log('Test data cleaned up.', 'yellow');
      } catch (cleanupError) {
        log('Warning: Failed to clean up test data.', 'yellow');
      }
    }
    
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  log('Unexpected error running tests:', 'red');
  console.error(error);
  process.exit(1);
});

