/**
 * Performance Monitoring Services Test Suite
 * 
 * Run with: npx tsx src/lib/services/__tests__/performance-services.test.ts
 */

import { queryPerformanceService } from '../query-performance-service';
import { indexMonitoringService } from '../index-monitoring-service';
import { bloatMonitoringService } from '../bloat-monitoring-service';

async function testQueryPerformanceService() {
  console.log('\n=== Testing Query Performance Service ===\n');
  
  try {
    // Test 1: Log a fast query
    console.log('Test 1: Logging a fast query (50ms)...');
    await queryPerformanceService.logQuery({
      query_text: 'SELECT * FROM conversations WHERE id = ?',
      duration_ms: 50,
      endpoint: '/api/conversations',
      user_id: 'test-user-123',
      parameters: { id: 'conv-123' }
    });
    console.log('✓ Fast query logged successfully\n');
    
    // Test 2: Log a slow query (should trigger alert)
    console.log('Test 2: Logging a slow query (750ms)...');
    await queryPerformanceService.logQuery({
      query_text: 'SELECT * FROM conversations WHERE status = ? AND created_at > ?',
      duration_ms: 750,
      endpoint: '/api/conversations',
      user_id: 'test-user-456',
      parameters: { status: 'pending_review', created_at: '2025-01-01' }
    });
    console.log('✓ Slow query logged (alert should be created)\n');
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 3: Get slow queries
    console.log('Test 3: Retrieving slow queries from last hour...');
    const slowQueries = await queryPerformanceService.getSlowQueries(1, 500);
    console.log(`✓ Found ${slowQueries.length} slow queries`);
    if (slowQueries.length > 0) {
      console.log('Sample slow query:');
      console.log(`  - Query: ${slowQueries[0].query_text}`);
      console.log(`  - Avg Duration: ${slowQueries[0].avg_duration_ms}ms`);
      console.log(`  - Max Duration: ${slowQueries[0].max_duration_ms}ms`);
      console.log(`  - Execution Count: ${slowQueries[0].execution_count}`);
    }
    console.log();
    
    // Test 4: Get query statistics
    console.log('Test 4: Retrieving query statistics...');
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 3600000); // 1 hour ago
    const stats = await queryPerformanceService.getQueryStats(startDate, endDate);
    console.log('✓ Query Statistics:');
    console.log(`  - Total Queries: ${stats.total_queries}`);
    console.log(`  - Slow Queries: ${stats.slow_queries}`);
    console.log(`  - Avg Duration: ${stats.avg_duration_ms.toFixed(2)}ms`);
    console.log(`  - P95 Duration: ${stats.p95_duration_ms.toFixed(2)}ms`);
    console.log();
    
    console.log('✅ Query Performance Service tests completed successfully\n');
  } catch (error) {
    console.error('❌ Query Performance Service test failed:', error);
    throw error;
  }
}

async function testIndexMonitoringService() {
  console.log('\n=== Testing Index Monitoring Service ===\n');
  
  try {
    // Test 1: Capture index snapshot
    console.log('Test 1: Capturing index usage snapshot...');
    const snapshotCount = await indexMonitoringService.captureSnapshot();
    console.log(`✓ Captured ${snapshotCount} index snapshots\n`);
    
    // Test 2: Detect unused indexes
    console.log('Test 2: Detecting unused indexes (30+ days)...');
    const unusedIndexes = await indexMonitoringService.detectUnusedIndexes(30);
    console.log(`✓ Found ${unusedIndexes.length} unused indexes`);
    if (unusedIndexes.length > 0) {
      console.log('Unused indexes:');
      unusedIndexes.forEach(idx => {
        console.log(`  - ${idx.indexname} on ${idx.tablename}`);
        console.log(`    Size: ${idx.index_size}, Unused for ${idx.days_since_last_scan} days`);
      });
    }
    console.log();
    
    // Test 3: Get index trends
    console.log('Test 3: Retrieving index usage trends for conversations table...');
    const trends = await indexMonitoringService.getIndexTrends('conversations', 7);
    console.log(`✓ Got trends for ${trends.length} indexes`);
    if (trends.length > 0) {
      console.log('Sample trend:');
      console.log(`  - Index: ${trends[0].indexname}`);
      console.log(`  - Daily scans: ${trends[0].scans_per_day.join(', ')}`);
    }
    console.log();
    
    console.log('✅ Index Monitoring Service tests completed successfully\n');
  } catch (error) {
    console.error('❌ Index Monitoring Service test failed:', error);
    throw error;
  }
}

async function testBloatMonitoringService() {
  console.log('\n=== Testing Bloat Monitoring Service ===\n');
  
  try {
    // Test 1: Capture bloat snapshot
    console.log('Test 1: Capturing table bloat snapshot...');
    const snapshotCount = await bloatMonitoringService.captureSnapshot();
    console.log(`✓ Captured bloat data for ${snapshotCount} tables\n`);
    
    // Wait for alert processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 2: Get bloat status
    console.log('Test 2: Retrieving bloat status for all tables...');
    const bloatStatus = await bloatMonitoringService.getBloatStatus();
    console.log(`✓ Got bloat status for ${bloatStatus.length} tables`);
    if (bloatStatus.length > 0) {
      console.log('Table bloat summary:');
      bloatStatus.forEach(table => {
        const bloatMB = (table.bloat_bytes / 1024 / 1024).toFixed(2);
        console.log(`  - ${table.tablename}: ${table.bloat_ratio.toFixed(1)}% bloat (${bloatMB} MB wasted)`);
      });
    }
    console.log();
    
    // Test 3: Get high bloat tables
    console.log('Test 3: Identifying tables with >20% bloat...');
    const highBloat = await bloatMonitoringService.getHighBloatTables(20);
    console.log(`✓ Found ${highBloat.length} tables with high bloat`);
    if (highBloat.length > 0) {
      console.log('⚠️  High bloat tables (action recommended):');
      highBloat.forEach(table => {
        console.log(`  - ${table.tablename}: ${table.bloat_ratio.toFixed(1)}% bloat`);
        console.log(`    Dead tuples: ${table.dead_tuples}, Live tuples: ${table.live_tuples}`);
      });
    } else {
      console.log('✅ No tables have bloat >20%');
    }
    console.log();
    
    console.log('✅ Bloat Monitoring Service tests completed successfully\n');
  } catch (error) {
    console.error('❌ Bloat Monitoring Service test failed:', error);
    throw error;
  }
}

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Performance Monitoring Services - Integration Tests     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  try {
    await testQueryPerformanceService();
    await testIndexMonitoringService();
    await testBloatMonitoringService();
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              ✅ All tests passed successfully!             ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n╔════════════════════════════════════════════════════════════╗');
    console.error('║                  ❌ Tests failed!                          ║');
    console.error('╚════════════════════════════════════════════════════════════╝\n');
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

export { testQueryPerformanceService, testIndexMonitoringService, testBloatMonitoringService };

