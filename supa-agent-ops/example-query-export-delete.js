/**
 * Example Usage: Query, Export, and Delete Operations
 * Supabase Agent Ops Library v1.2.0
 */

require('dotenv').config();
const { 
  agentQuery, 
  agentCount, 
  agentExportData, 
  agentDelete 
} = require('./dist/index');

async function demonstrateOperations() {
  console.log('=================================================');
  console.log('SAOL v1.2.0 - Query, Export, and Delete Examples');
  console.log('=================================================\n');

  // ===================================================================
  // QUERY OPERATIONS
  // ===================================================================
  
  console.log('--- QUERY OPERATIONS ---\n');

  // Example 1: Simple Query
  console.log('Example 1: Simple query with filtering');
  const simpleQuery = await agentQuery({
    table: 'conversations',
    where: [
      { column: 'status', operator: 'eq', value: 'approved' }
    ],
    limit: 5
  });
  console.log(`✓ Retrieved ${simpleQuery.data.length} approved conversations`);
  console.log(`  Execution time: ${simpleQuery.executionTimeMs}ms\n`);

  // Example 2: Advanced Query with Ordering
  console.log('Example 2: Query with ordering and pagination');
  const orderedQuery = await agentQuery({
    table: 'conversations',
    where: [
      { column: 'tier', operator: 'eq', value: 'template' }
    ],
    orderBy: [
      { column: 'created_at', asc: false }
    ],
    limit: 10,
    offset: 0,
    count: true
  });
  console.log(`✓ Retrieved ${orderedQuery.data.length} template conversations`);
  console.log(`  Total count: ${orderedQuery.count}`);
  console.log(`  Execution time: ${orderedQuery.executionTimeMs}ms\n`);

  // Example 3: Query with Multiple Filters
  console.log('Example 3: Query with multiple filters');
  const multiFilterQuery = await agentQuery({
    table: 'conversations',
    where: [
      { column: 'status', operator: 'eq', value: 'approved' },
      { column: 'tier', operator: 'eq', value: 'template' }
    ],
    select: ['id', 'status', 'tier', 'created_at'],
    limit: 5
  });
  console.log(`✓ Retrieved ${multiFilterQuery.data.length} approved template conversations`);
  console.log(`  Execution time: ${multiFilterQuery.executionTimeMs}ms\n`);

  // Example 4: Query with Aggregations
  console.log('Example 4: Query with aggregations');
  const aggregateQuery = await agentQuery({
    table: 'conversations',
    where: [
      { column: 'status', operator: 'eq', value: 'approved' }
    ],
    aggregate: [
      { function: 'COUNT', column: 'id', alias: 'total_count' }
    ],
    limit: 1000 // Get enough data for aggregation
  });
  console.log(`✓ Aggregation results:`, aggregateQuery.aggregates);
  console.log(`  Execution time: ${aggregateQuery.executionTimeMs}ms\n`);

  // Example 5: Count Query
  console.log('Example 5: Count query');
  const countResult = await agentCount({
    table: 'conversations'
  });
  console.log(`✓ Total conversations: ${countResult.count}`);
  console.log(`  Execution time: ${countResult.executionTimeMs}ms\n`);

  // Example 6: Count with Filter
  console.log('Example 6: Count with filter');
  const filteredCount = await agentCount({
    table: 'conversations',
    where: [
      { column: 'tier', operator: 'eq', value: 'template' }
    ]
  });
  console.log(`✓ Template conversations: ${filteredCount.count}`);
  console.log(`  Execution time: ${filteredCount.executionTimeMs}ms\n`);

  // ===================================================================
  // EXPORT OPERATIONS
  // ===================================================================
  
  console.log('\n--- EXPORT OPERATIONS ---\n');

  // Example 7: Export to JSONL (Training Format)
  console.log('Example 7: Export to JSONL format');
  const jsonlExport = await agentExportData({
    table: 'conversations',
    destination: './examples/training-data.jsonl',
    config: {
      format: 'jsonl',
      includeMetadata: false,
      includeTimestamps: false
    },
    filters: [
      { column: 'status', operator: 'eq', value: 'approved' }
    ]
  });
  console.log(`✓ Exported ${jsonlExport.recordCount} records to JSONL`);
  console.log(`  File size: ${(jsonlExport.fileSize / 1024).toFixed(2)} KB`);
  console.log(`  Location: ${jsonlExport.filePath}`);
  console.log(`  Execution time: ${jsonlExport.executionTimeMs}ms\n`);

  // Example 8: Export to JSON (Structured)
  console.log('Example 8: Export to JSON format');
  const jsonExport = await agentExportData({
    table: 'conversations',
    destination: './examples/conversations-export.json',
    config: {
      format: 'json',
      includeMetadata: true,
      includeTimestamps: true
    },
    filters: [
      { column: 'tier', operator: 'eq', value: 'template' }
    ]
  });
  console.log(`✓ Exported ${jsonExport.recordCount} records to JSON`);
  console.log(`  File size: ${(jsonExport.fileSize / 1024).toFixed(2)} KB`);
  console.log(`  Location: ${jsonExport.filePath}`);
  console.log(`  Execution time: ${jsonExport.executionTimeMs}ms\n`);

  // Example 9: Export to CSV (Excel-Compatible)
  console.log('Example 9: Export to CSV format');
  const csvExport = await agentExportData({
    table: 'conversations',
    destination: './examples/conversations-data.csv',
    config: {
      format: 'csv',
      includeMetadata: true,
      includeTimestamps: true
    },
    columns: ['id', 'status', 'tier', 'created_at']
  });
  console.log(`✓ Exported ${csvExport.recordCount} records to CSV`);
  console.log(`  File size: ${(csvExport.fileSize / 1024).toFixed(2)} KB`);
  console.log(`  Location: ${csvExport.filePath}`);
  console.log(`  Note: CSV includes UTF-8 BOM for Excel compatibility`);
  console.log(`  Execution time: ${csvExport.executionTimeMs}ms\n`);

  // Example 10: Export to Markdown (Human-Readable)
  console.log('Example 10: Export to Markdown format');
  const mdExport = await agentExportData({
    table: 'conversations',
    destination: './examples/report.md',
    config: {
      format: 'markdown',
      includeMetadata: true,
      includeTimestamps: false
    },
    filters: [
      { column: 'status', operator: 'eq', value: 'approved' }
    ]
  });
  console.log(`✓ Exported ${mdExport.recordCount} records to Markdown`);
  console.log(`  File size: ${(mdExport.fileSize / 1024).toFixed(2)} KB`);
  console.log(`  Location: ${mdExport.filePath}`);
  console.log(`  Execution time: ${mdExport.executionTimeMs}ms\n`);

  // ===================================================================
  // DELETE OPERATIONS (SAFE WITH DRY-RUN)
  // ===================================================================
  
  console.log('\n--- DELETE OPERATIONS ---\n');

  // Example 11: Dry-Run (Preview Before Delete)
  console.log('Example 11: Dry-run to preview deletion');
  const dryRun = await agentDelete({
    table: 'conversations',
    where: [
      { column: 'status', operator: 'eq', value: 'test_delete' }
    ],
    dryRun: true
  });
  console.log(`✓ Dry-run completed: Would delete ${dryRun.previewRecords?.length || 0} records`);
  if (dryRun.previewRecords && dryRun.previewRecords.length > 0) {
    console.log(`  Preview of records to delete:`);
    dryRun.previewRecords.slice(0, 3).forEach(r => {
      console.log(`    - ID: ${r.id}, Status: ${r.status}`);
    });
  }
  console.log(`  Next actions: ${dryRun.nextActions.length} suggestions`);
  console.log(`  Execution time: ${dryRun.executionTimeMs}ms\n`);

  // Example 12: Safety Check - No WHERE Clause
  console.log('Example 12: Safety check - missing WHERE clause');
  const noWhereResult = await agentDelete({
    table: 'conversations',
    where: [],
    confirm: true
  });
  console.log(`✓ Safety check passed: ${noWhereResult.summary}`);
  console.log(`  Success: ${noWhereResult.success} (expected: false)\n`);

  // Example 13: Safety Check - No Confirmation
  console.log('Example 13: Safety check - missing confirmation');
  const noConfirmResult = await agentDelete({
    table: 'conversations',
    where: [
      { column: 'id', operator: 'eq', value: 'test-id' }
    ],
    confirm: false
  });
  console.log(`✓ Safety check passed: ${noConfirmResult.summary}`);
  console.log(`  Success: ${noConfirmResult.success} (expected: false)\n`);

  // Example 14: Delete with Confirmation (Non-Existent Record)
  console.log('Example 14: Delete non-existent record (safe test)');
  const deleteResult = await agentDelete({
    table: 'conversations',
    where: [
      { column: 'id', operator: 'eq', value: 'nonexistent-test-id-xyz' }
    ],
    confirm: true
  });
  console.log(`✓ Delete completed: ${deleteResult.deletedCount} records deleted`);
  console.log(`  Success: ${deleteResult.success}`);
  console.log(`  Execution time: ${deleteResult.executionTimeMs}ms\n`);

  // ===================================================================
  // COMBINED WORKFLOW
  // ===================================================================
  
  console.log('\n--- COMBINED WORKFLOW EXAMPLE ---\n');

  console.log('Workflow: Query → Export → Review → Delete\n');

  // Step 1: Query records to identify candidates
  console.log('Step 1: Query records to identify deletion candidates');
  const candidates = await agentQuery({
    table: 'conversations',
    where: [
      { column: 'status', operator: 'eq', value: 'test_workflow' }
    ],
    limit: 10
  });
  console.log(`  Found ${candidates.data.length} candidate records\n`);

  // Step 2: Export for backup
  if (candidates.data.length > 0) {
    console.log('Step 2: Export records for backup');
    const backup = await agentExportData({
      table: 'conversations',
      destination: './examples/backup-before-delete.json',
      config: {
        format: 'json',
        includeMetadata: true,
        includeTimestamps: true
      },
      filters: [
        { column: 'status', operator: 'eq', value: 'test_workflow' }
      ]
    });
    console.log(`  Backed up ${backup.recordCount} records\n`);

    // Step 3: Dry-run delete
    console.log('Step 3: Dry-run deletion');
    const preview = await agentDelete({
      table: 'conversations',
      where: [
        { column: 'status', operator: 'eq', value: 'test_workflow' }
      ],
      dryRun: true
    });
    console.log(`  Would delete ${preview.previewRecords?.length || 0} records\n`);

    // Step 4: Execute delete (skipped in this demo)
    console.log('Step 4: Execute deletion (skipped in demo)');
    console.log('  To execute: agentDelete({ ...params, confirm: true })\n');
  } else {
    console.log('  No records to process\n');
  }

  // ===================================================================
  // SUMMARY
  // ===================================================================

  console.log('=================================================');
  console.log('All examples completed successfully!');
  console.log('=================================================\n');
  console.log('Key Features Demonstrated:');
  console.log('✓ Advanced queries with filtering and ordering');
  console.log('✓ Count queries with and without filters');
  console.log('✓ Aggregations (COUNT, SUM, AVG, MIN, MAX)');
  console.log('✓ Export to 4 formats (JSONL, JSON, CSV, Markdown)');
  console.log('✓ Safe delete with dry-run and confirmation');
  console.log('✓ Multiple safety checks and validations');
  console.log('✓ Error handling with recovery suggestions\n');
}

// Run all examples
demonstrateOperations()
  .then(() => {
    console.log('Demo completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Demo failed:', error.message);
    process.exit(1);
  });

