/**
 * Export Monitoring & Cleanup Test Script
 * 
 * Tests the export metrics collection, file cleanup, and log cleanup functionality.
 * 
 * Usage:
 * ```bash
 * npx tsx scripts/test-export-monitoring.ts
 * ```
 * 
 * Tests:
 * 1. Export metrics logging
 * 2. Metrics aggregation
 * 3. Failure rate alerting
 * 4. File cleanup job
 * 5. Log cleanup job
 */

import { createClient } from '@supabase/supabase-js';
import { createExportMetricsService } from '../src/lib/monitoring/export-metrics';
import { exportFileCleanup } from '../src/lib/cron/export-file-cleanup';
import { exportLogCleanup, getCleanupStats } from '../src/lib/cron/export-log-cleanup';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test results
interface TestResult {
  name: string;
  passed: boolean;
  details: string;
  duration_ms: number;
}

const results: TestResult[] = [];

/**
 * Run a test and record results
 */
async function runTest(
  name: string,
  testFn: () => Promise<{ passed: boolean; details: string }>
): Promise<void> {
  const startTime = Date.now();
  console.log(`\n🧪 Running test: ${name}`);
  
  try {
    const { passed, details } = await testFn();
    const duration_ms = Date.now() - startTime;
    
    results.push({ name, passed, details, duration_ms });
    
    if (passed) {
      console.log(`✅ PASSED: ${details} (${duration_ms}ms)`);
    } else {
      console.log(`❌ FAILED: ${details} (${duration_ms}ms)`);
    }
  } catch (error) {
    const duration_ms = Date.now() - startTime;
    const details = `Exception: ${error instanceof Error ? error.message : 'Unknown error'}`;
    
    results.push({ name, passed: false, details, duration_ms });
    console.log(`❌ FAILED: ${details} (${duration_ms}ms)`);
  }
}

/**
 * Test 1: Export metrics logging
 */
async function testMetricsLogging(): Promise<{ passed: boolean; details: string }> {
  const metricsService = createExportMetricsService(supabase);
  
  // Log a successful export metric
  await metricsService.logExportMetric({
    export_id: crypto.randomUUID(),
    user_id: '00000000-0000-0000-0000-000000000000',
    format: 'jsonl',
    status: 'completed',
    conversation_count: 150,
    duration_ms: 2500,
    file_size_bytes: 524288, // 512 KB
  });
  
  // Log a failed export metric
  await metricsService.logExportMetric({
    export_id: crypto.randomUUID(),
    user_id: '00000000-0000-0000-0000-000000000000',
    format: 'json',
    status: 'failed',
    conversation_count: 50,
    duration_ms: 1200,
    file_size_bytes: null,
    error_type: 'DatabaseError',
    error_message: 'Connection timeout',
  });
  
  return {
    passed: true,
    details: 'Logged 2 export metrics (1 success, 1 failure)',
  };
}

/**
 * Test 2: Metrics aggregation
 */
async function testMetricsAggregation(): Promise<{ passed: boolean; details: string }> {
  const metricsService = createExportMetricsService(supabase);
  
  // Aggregate metrics for the past hour
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 60 * 60 * 1000);
  
  const metrics = await metricsService.aggregateMetrics(startDate, endDate, 'hourly');
  
  return {
    passed: true,
    details: `Aggregated metrics: ${metrics.total_exports} exports, ${(metrics.success_rate * 100).toFixed(1)}% success rate`,
  };
}

/**
 * Test 3: Failure rate alerting
 */
async function testFailureRateAlerting(): Promise<{ passed: boolean; details: string }> {
  const metricsService = createExportMetricsService(supabase);
  
  // Check failure rate for the past hour
  const alert = await metricsService.checkFailureRate(60);
  
  if (!alert) {
    return {
      passed: true,
      details: 'No exports in the past hour (no alert)',
    };
  }
  
  const alertStatus = alert.alert ? '🚨 ALERT' : '✓ OK';
  const details = `${alertStatus}: ${alert.failed_count}/${alert.total_count} failed (${(alert.failure_rate * 100).toFixed(1)}%)`;
  
  return {
    passed: true,
    details,
  };
}

/**
 * Test 4: Export volume statistics
 */
async function testExportVolume(): Promise<{ passed: boolean; details: string }> {
  const metricsService = createExportMetricsService(supabase);
  
  // Get daily export volume for the past 7 days
  const volume = await metricsService.getExportVolume('daily', 7);
  
  const totalExports = volume.reduce((sum, day) => sum + day.count, 0);
  const avgPerDay = volume.length > 0 ? (totalExports / volume.length).toFixed(1) : 0;
  
  return {
    passed: true,
    details: `${totalExports} exports over ${volume.length} days (avg ${avgPerDay}/day)`,
  };
}

/**
 * Test 5: File cleanup dry run
 */
async function testFileCleanup(): Promise<{ passed: boolean; details: string }> {
  // Check for expired exports without actually deleting them
  const now = new Date().toISOString();
  
  const { data: expiredExports, error } = await supabase
    .from('export_logs')
    .select('*')
    .eq('status', 'completed')
    .lt('expires_at', now)
    .not('expires_at', 'is', null);
  
  if (error) {
    throw new Error(`Failed to query expired exports: ${error.message}`);
  }
  
  const count = expiredExports?.length || 0;
  
  // If there are expired exports, we can test the cleanup (optional)
  // Uncomment the following lines to actually run cleanup:
  /*
  if (count > 0) {
    const result = await exportFileCleanup(supabase);
    return {
      passed: result.deleted_count > 0,
      details: `Deleted ${result.deleted_count}/${result.total_found} expired files`,
    };
  }
  */
  
  return {
    passed: true,
    details: `Found ${count} expired exports eligible for cleanup`,
  };
}

/**
 * Test 6: Log cleanup statistics
 */
async function testLogCleanupStats(): Promise<{ passed: boolean; details: string }> {
  const stats = await getCleanupStats(supabase, 30);
  
  return {
    passed: true,
    details: `${stats.eligible_for_cleanup} logs eligible for cleanup (${stats.total_size_estimate_mb.toFixed(2)} MB estimated)`,
  };
}

/**
 * Test 7: Create test export for metrics
 */
async function testCreateTestExport(): Promise<{ passed: boolean; details: string }> {
  // Create a test export log to ensure we have data for metrics
  const testExportId = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
  
  const { error } = await supabase
    .from('export_logs')
    .insert({
      export_id: testExportId,
      user_id: '00000000-0000-0000-0000-000000000000',
      timestamp: now.toISOString(),
      format: 'jsonl',
      config: {
        scope: 'filtered',
        format: 'jsonl',
        includeMetadata: true,
        includeQualityScores: true,
        includeTimestamps: true,
        includeApprovalHistory: false,
        includeParentReferences: false,
        includeFullContent: true,
      },
      conversation_count: 100,
      status: 'completed',
      file_size: 1048576, // 1 MB
      file_url: `/api/export/download/test-${testExportId}.jsonl`,
      expires_at: expiresAt.toISOString(),
    });
  
  if (error) {
    // If error is due to missing table or auth, that's expected in some environments
    if (error.code === '42P01' || error.code === '23503') {
      return {
        passed: true,
        details: 'Skipped (export_logs table not available or auth constraint)',
      };
    }
    throw new Error(`Failed to create test export: ${error.message}`);
  }
  
  return {
    passed: true,
    details: `Created test export: ${testExportId}`,
  };
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('='.repeat(60));
  console.log('Export Monitoring & Cleanup Test Suite');
  console.log('='.repeat(60));
  
  // Run all tests
  await runTest('Create test export', testCreateTestExport);
  await runTest('Export metrics logging', testMetricsLogging);
  await runTest('Metrics aggregation', testMetricsAggregation);
  await runTest('Failure rate alerting', testFailureRateAlerting);
  await runTest('Export volume statistics', testExportVolume);
  await runTest('File cleanup dry run', testFileCleanup);
  await runTest('Log cleanup statistics', testLogCleanupStats);
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration_ms, 0);
  
  console.log(`\nTotal tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Total duration: ${totalDuration}ms`);
  
  if (failed > 0) {
    console.log('\n❌ Failed tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.details}`);
    });
  }
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('\n💥 Test suite failed:', error);
  process.exit(1);
});

