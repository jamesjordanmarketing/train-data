/**
 * Verification Script: Integration Layer
 * 
 * Quick verification that the integration layer is working correctly.
 * This script performs a sanity check on all components.
 */

import { getFailedGenerationService } from '../src/lib/services/failed-generation-service';
import { detectTruncatedContent } from '../src/lib/utils/truncation-detection';
import { TruncatedResponseError, UnexpectedStopReasonError } from '../src/lib/services/conversation-generation-service';

async function verify() {
  console.log('=================================================');
  console.log('VERIFICATION: Integration Layer');
  console.log('=================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Truncation Detection Utility
  console.log('Test 1: Truncation Detection Utility');
  try {
    const result1 = detectTruncatedContent('This ends with backslash \\');
    if (result1.isTruncated && result1.pattern === 'lone_backslash') {
      console.log('  ✅ PASS: Detects lone backslash');
      passed++;
    } else {
      console.log('  ❌ FAIL: Did not detect lone backslash');
      failed++;
    }

    const result2 = detectTruncatedContent('This is complete.');
    if (!result2.isTruncated) {
      console.log('  ✅ PASS: Recognizes complete content');
      passed++;
    } else {
      console.log('  ❌ FAIL: False positive on complete content');
      failed++;
    }

    const result3 = detectTruncatedContent('Ends with comma,');
    if (result3.isTruncated && result3.pattern === 'trailing_comma') {
      console.log('  ✅ PASS: Detects trailing comma');
      passed++;
    } else {
      console.log('  ❌ FAIL: Did not detect trailing comma');
      failed++;
    }
  } catch (error) {
    console.log('  ❌ FAIL: Error in truncation detection:', error);
    failed += 3;
  }
  console.log();

  // Test 2: Custom Error Classes
  console.log('Test 2: Custom Error Classes');
  try {
    const truncError = new TruncatedResponseError(
      'Test message',
      'end_turn',
      'lone_backslash'
    );
    if (truncError.name === 'TruncatedResponseError' && 
        truncError.pattern === 'lone_backslash') {
      console.log('  ✅ PASS: TruncatedResponseError works');
      passed++;
    } else {
      console.log('  ❌ FAIL: TruncatedResponseError properties incorrect');
      failed++;
    }

    const stopError = new UnexpectedStopReasonError(
      'Test message',
      'max_tokens'
    );
    if (stopError.name === 'UnexpectedStopReasonError' && 
        stopError.stopReason === 'max_tokens') {
      console.log('  ✅ PASS: UnexpectedStopReasonError works');
      passed++;
    } else {
      console.log('  ❌ FAIL: UnexpectedStopReasonError properties incorrect');
      failed++;
    }
  } catch (error) {
    console.log('  ❌ FAIL: Error creating custom errors:', error);
    failed += 2;
  }
  console.log();

  // Test 3: Failed Generation Service
  console.log('Test 3: Failed Generation Service');
  try {
    const service = getFailedGenerationService();
    if (service) {
      console.log('  ✅ PASS: Failed generation service singleton works');
      passed++;
    } else {
      console.log('  ❌ FAIL: Could not get failed generation service');
      failed++;
    }

    // Try to query (should not fail even if no records)
    const { failures, total } = await service.listFailedGenerations(
      {},
      { limit: 1 }
    );
    console.log(`  ✅ PASS: Can query failed generations (found ${total} records)`);
    passed++;
  } catch (error) {
    console.log('  ❌ FAIL: Error with failed generation service:', error);
    failed += 2;
  }
  console.log();

  // Test 4: Statistics Query
  console.log('Test 4: Failed Generation Statistics');
  try {
    const service = getFailedGenerationService();
    const stats = await service.getFailureStatistics();
    
    console.log(`  ✅ PASS: Statistics query works`);
    console.log(`     Total failures: ${stats.total}`);
    console.log(`     By type: ${JSON.stringify(stats.by_type)}`);
    console.log(`     By stop_reason: ${JSON.stringify(stats.by_stop_reason)}`);
    console.log(`     By pattern: ${JSON.stringify(stats.by_pattern)}`);
    passed++;
  } catch (error) {
    console.log('  ❌ FAIL: Error getting statistics:', error);
    failed++;
  }
  console.log();

  // Final Summary
  console.log('=================================================');
  if (failed === 0) {
    console.log('✅ ALL VERIFICATIONS PASSED');
  } else {
    console.log(`⚠️  SOME VERIFICATIONS FAILED: ${failed} failures`);
  }
  console.log('=================================================\n');

  console.log(`Results: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

// Run verification
verify().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

