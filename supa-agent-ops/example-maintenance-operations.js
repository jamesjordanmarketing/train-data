/**
 * Example: Maintenance Operations (v1.3 - Prompt 3)
 * Demonstrates VACUUM, ANALYZE, and REINDEX operations
 */

const { 
  agentVacuum, 
  agentAnalyze, 
  agentReindex 
} = require('./dist/index');

async function runMaintenanceExamples() {
  console.log('='.repeat(80));
  console.log('MAINTENANCE OPERATIONS EXAMPLES');
  console.log('='.repeat(80));
  console.log();

  // ============================================================================
  // Example 1: VACUUM with ANALYZE
  // ============================================================================
  console.log('Example 1: VACUUM with ANALYZE');
  console.log('-'.repeat(80));
  
  try {
    const result1 = await agentVacuum({
      table: 'conversations',
      analyze: true,
      dryRun: false
    });

    console.log('Success:', result1.success);
    console.log('Summary:', result1.summary);
    console.log('Tables Processed:', result1.tablesProcessed);
    console.log('Execution Time:', result1.executionTimeMs + 'ms');
    console.log('Next Actions:');
    result1.nextActions.forEach(action => {
      console.log(`  - [${action.priority}] ${action.action}: ${action.description}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // ============================================================================
  // Example 2: Dry Run VACUUM FULL
  // ============================================================================
  console.log('Example 2: Dry Run VACUUM FULL (Preview Only)');
  console.log('-'.repeat(80));
  
  try {
    const result2 = await agentVacuum({
      table: 'conversations',
      full: true,
      analyze: true,
      dryRun: true  // Preview without executing
    });

    console.log('Success:', result2.success);
    console.log('Summary:', result2.summary);
    console.log('Next Actions:');
    result2.nextActions.forEach(action => {
      console.log(`  - [${action.priority}] ${action.action}: ${action.description}`);
      if (action.example) {
        console.log(`    Example: ${action.example}`);
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // ============================================================================
  // Example 3: ANALYZE Specific Columns
  // ============================================================================
  console.log('Example 3: ANALYZE Specific Columns');
  console.log('-'.repeat(80));
  
  try {
    const result3 = await agentAnalyze({
      table: 'conversations',
      columns: ['persona', 'status', 'tier']
    });

    console.log('Success:', result3.success);
    console.log('Summary:', result3.summary);
    console.log('Execution Time:', result3.executionTimeMs + 'ms');
    console.log('Operation:', result3.operation);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // ============================================================================
  // Example 4: REINDEX with CONCURRENTLY
  // ============================================================================
  console.log('Example 4: REINDEX with CONCURRENTLY (Non-Blocking)');
  console.log('-'.repeat(80));
  
  try {
    const result4 = await agentReindex({
      target: 'table',
      name: 'conversations',
      concurrent: true
    });

    console.log('Success:', result4.success);
    console.log('Summary:', result4.summary);
    console.log('Execution Time:', result4.executionTimeMs + 'ms');
    console.log('Next Actions:');
    result4.nextActions.forEach(action => {
      console.log(`  - [${action.priority}] ${action.action}: ${action.description}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nNote: REINDEX CONCURRENTLY requires PostgreSQL 12+');
    console.log('Try without concurrent option during maintenance window.');
  }
  console.log();

  // ============================================================================
  // Example 5: ANALYZE All Tables
  // ============================================================================
  console.log('Example 5: ANALYZE All Tables');
  console.log('-'.repeat(80));
  
  try {
    const result5 = await agentAnalyze({});

    console.log('Success:', result5.success);
    console.log('Summary:', result5.summary);
    console.log('Execution Time:', result5.executionTimeMs + 'ms');
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  console.log('='.repeat(80));
  console.log('MAINTENANCE EXAMPLES COMPLETED');
  console.log('='.repeat(80));
}

// Run examples
if (require.main === module) {
  runMaintenanceExamples()
    .then(() => {
      console.log('\n✅ All examples completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error running examples:', error);
      process.exit(1);
    });
}

module.exports = { runMaintenanceExamples };

