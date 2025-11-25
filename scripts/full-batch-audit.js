/**
 * Full Batch Tables Audit Script
 * 
 * Audits batch_jobs, batch_items, and batch_exports tables
 * to identify all schema mismatches with the codebase.
 */

require('../load-env.js');
const saol = require('../supa-agent-ops/dist/index.js');

const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  transport: 'supabase'
};

async function queryWithSelect(table, columns) {
  const result = await saol.agentQuery({
    ...config,
    table,
    select: columns,
    limit: 1
  });
  return result;
}

async function testInsertValue(table, column, value) {
  // We can't actually test inserts without side effects
  // Instead, we'll query with a WHERE clause to check type compatibility
  try {
    const result = await saol.agentQuery({
      ...config,
      table,
      where: [{ column, operator: 'eq', value }],
      limit: 1
    });
    return { success: result.success, error: result.error };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function auditTable(tableName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`AUDITING TABLE: ${tableName}`);
  console.log('='.repeat(60));

  // Test selecting all columns to discover which exist
  const testResult = await saol.agentQuery({
    ...config,
    table: tableName,
    select: ['*'],
    limit: 1
  });

  if (!testResult.success) {
    console.log(`❌ Table ${tableName} does not exist or is not accessible`);
    console.log(`   Error: ${testResult.error?.message || JSON.stringify(testResult)}`);
    return { exists: false };
  }

  // If we have data, show the columns
  if (testResult.data && testResult.data.length > 0) {
    const columns = Object.keys(testResult.data[0]);
    console.log(`\n✅ Table exists with ${columns.length} columns:`);
    columns.forEach(col => console.log(`   - ${col}`));
    return { exists: true, columns, sampleData: testResult.data[0] };
  } else {
    console.log(`\n⚠️  Table exists but has no data. Cannot determine all columns from select *.`);
    console.log('   Will probe individual columns...');
    return { exists: true, columns: [], sampleData: null };
  }
}

async function testStatusValues(tableName) {
  console.log(`\n--- Testing status values for ${tableName} ---`);
  
  const statusValues = ['queued', 'processing', 'paused', 'completed', 'failed', 'cancelled', 'pending'];
  
  for (const status of statusValues) {
    const result = await testInsertValue(tableName, 'status', status);
    if (!result.success && result.error) {
      const errStr = JSON.stringify(result.error);
      if (errStr.includes('check constraint') || errStr.includes('violates')) {
        console.log(`   ❌ Status '${status}' - NOT ALLOWED (check constraint)`);
      } else {
        console.log(`   ⚠️  Status '${status}' - Error: ${errStr.substring(0, 100)}`);
      }
    } else {
      console.log(`   ✅ Status '${status}' - ALLOWED`);
    }
  }
}

async function testPriorityValues(tableName) {
  console.log(`\n--- Testing priority values for ${tableName} ---`);
  
  const priorityValues = ['low', 'normal', 'high', 'urgent', 'critical'];
  
  for (const priority of priorityValues) {
    const result = await testInsertValue(tableName, 'priority', priority);
    if (!result.success && result.error) {
      const errStr = JSON.stringify(result.error);
      if (errStr.includes('check constraint') || errStr.includes('violates')) {
        console.log(`   ❌ Priority '${priority}' - NOT ALLOWED (check constraint)`);
      } else {
        console.log(`   ⚠️  Priority '${priority}' - Error: ${errStr.substring(0, 100)}`);
      }
    } else {
      console.log(`   ✅ Priority '${priority}' - ALLOWED`);
    }
  }
}

async function testJobTypeValues(tableName) {
  console.log(`\n--- Testing job_type values for ${tableName} ---`);
  
  const jobTypeValues = ['generation', 'export', 'validation', 'cleanup', 'single', 'batch', 'process_all'];
  
  for (const jobType of jobTypeValues) {
    const result = await testInsertValue(tableName, 'job_type', jobType);
    if (!result.success && result.error) {
      const errStr = JSON.stringify(result.error);
      if (errStr.includes('check constraint') || errStr.includes('violates')) {
        console.log(`   ❌ job_type '${jobType}' - NOT ALLOWED (check constraint)`);
      } else {
        console.log(`   ⚠️  job_type '${jobType}' - Error: ${errStr.substring(0, 100)}`);
      }
    } else {
      console.log(`   ✅ job_type '${jobType}' - ALLOWED`);
    }
  }
}

async function probeColumns(tableName, columnList) {
  console.log(`\n--- Probing columns for ${tableName} ---`);
  
  const results = { exists: [], missing: [] };
  
  for (const col of columnList) {
    const result = await saol.agentQuery({
      ...config,
      table: tableName,
      select: [col],
      limit: 1
    });
    
    if (!result.success) {
      const errStr = result.error?.message || JSON.stringify(result);
      if (errStr.includes('Could not find') || errStr.includes('does not exist')) {
        results.missing.push(col);
        console.log(`   ❌ ${col} - MISSING`);
      } else {
        console.log(`   ⚠️  ${col} - Error: ${errStr.substring(0, 80)}`);
      }
    } else {
      results.exists.push(col);
      console.log(`   ✅ ${col} - EXISTS`);
    }
  }
  
  return results;
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        FULL BATCH TABLES AUDIT - November 25, 2025         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  // Expected columns based on codebase review
  const expectedBatchJobsColumns = [
    'id', 'job_type', 'name', 'description', 'configuration', 'target_tier',
    'status', 'priority', 'total_items', 'completed_items', 'failed_items',
    'successful_items', 'progress_percentage', 'estimated_time_remaining',
    'started_at', 'completed_at', 'paused_at', 'created_by', 'created_at',
    'updated_at', 'error_handling', 'shared_parameters', 'tier',
    'concurrent_processing', 'metadata'
  ];
  
  const expectedBatchItemsColumns = [
    'id', 'batch_job_id', 'position', 'topic', 'tier', 'parameters',
    'status', 'progress', 'estimated_time', 'conversation_id',
    'error_message', 'created_at', 'updated_at', 'started_at', 'completed_at'
  ];
  
  const expectedBatchExportsColumns = [
    'id', 'batch_job_id', 'export_format', 'file_path', 'file_size',
    'record_count', 'status', 'error_message', 'created_at', 'completed_at',
    'expires_at', 'download_url'
  ];

  // 1. Audit batch_jobs
  console.log('\n\n' + '█'.repeat(60));
  console.log('█  BATCH_JOBS TABLE AUDIT');
  console.log('█'.repeat(60));
  
  const batchJobsResult = await auditTable('batch_jobs');
  await probeColumns('batch_jobs', expectedBatchJobsColumns);
  await testStatusValues('batch_jobs');
  await testPriorityValues('batch_jobs');
  await testJobTypeValues('batch_jobs');

  // 2. Audit batch_items
  console.log('\n\n' + '█'.repeat(60));
  console.log('█  BATCH_ITEMS TABLE AUDIT');
  console.log('█'.repeat(60));
  
  const batchItemsResult = await auditTable('batch_items');
  await probeColumns('batch_items', expectedBatchItemsColumns);
  await testStatusValues('batch_items');

  // 3. Audit batch_exports
  console.log('\n\n' + '█'.repeat(60));
  console.log('█  BATCH_EXPORTS TABLE AUDIT');
  console.log('█'.repeat(60));
  
  const batchExportsResult = await auditTable('batch_exports');
  await probeColumns('batch_exports', expectedBatchExportsColumns);
  
  console.log('\n\n' + '='.repeat(60));
  console.log('AUDIT COMPLETE');
  console.log('='.repeat(60));
  
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
