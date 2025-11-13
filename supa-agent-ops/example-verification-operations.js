/**
 * Example: Verification and Performance Operations (v1.3 - Prompt 3)
 * Demonstrates table verification and index usage analysis
 */

const { 
  agentVerifyTable,
  agentAnalyzeIndexUsage,
  agentAnalyzeTableBloat
} = require('./dist/index');

async function runVerificationExamples() {
  console.log('='.repeat(80));
  console.log('VERIFICATION & PERFORMANCE EXAMPLES');
  console.log('='.repeat(80));
  console.log();

  // ============================================================================
  // Example 1: Table Structure Verification
  // ============================================================================
  console.log('Example 1: Verify Table Structure');
  console.log('-'.repeat(80));
  
  try {
    const result1 = await agentVerifyTable({
      table: 'conversations',
      expectedColumns: [
        { name: 'id', type: 'uuid', required: true },
        { name: 'persona', type: 'text', required: true },
        { name: 'parameters', type: 'jsonb', required: false },
        { name: 'status', type: 'text', required: true },
        { name: 'tier', type: 'text', required: true }
      ],
      expectedIndexes: [
        'idx_conversations_persona',
        'idx_conversations_status'
      ],
      expectedConstraints: [
        {
          name: 'conversations_pkey',
          type: 'PRIMARY KEY',
          columns: ['id']
        }
      ],
      generateFixSQL: true
    });

    console.log('Success:', result1.success);
    console.log('Table Exists:', result1.exists);
    console.log('Summary:', result1.summary);
    console.log('Category:', result1.category, 
      '(1=OK, 2=Warning, 3=Critical, 4=Blocking)');
    console.log('Can Proceed:', result1.canProceed);
    console.log('Execution Time:', result1.executionTimeMs + 'ms');
    
    if (result1.issues.length > 0) {
      console.log('\nIssues Found:');
      result1.issues.forEach((issue, idx) => {
        console.log(`  ${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.description}`);
        if (issue.fixSQL) {
          console.log(`     Fix: ${issue.fixSQL}`);
        }
      });
    }

    if (result1.fixSQL) {
      console.log('\nGenerated Fix SQL:');
      console.log(result1.fixSQL);
    }

    console.log('\nNext Actions:');
    result1.nextActions.forEach(action => {
      console.log(`  - [${action.priority}] ${action.action}: ${action.description}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // ============================================================================
  // Example 2: Verify Non-Existent Table
  // ============================================================================
  console.log('Example 2: Verify Non-Existent Table');
  console.log('-'.repeat(80));
  
  try {
    const result2 = await agentVerifyTable({
      table: 'nonexistent_table',
      expectedColumns: [
        { name: 'id', type: 'uuid', required: true }
      ],
      generateFixSQL: true
    });

    console.log('Success:', result2.success);
    console.log('Table Exists:', result2.exists);
    console.log('Summary:', result2.summary);
    console.log('Category:', result2.category);
    console.log('Can Proceed:', result2.canProceed);
    
    if (result2.fixSQL) {
      console.log('\nGenerated CREATE TABLE SQL:');
      console.log(result2.fixSQL);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // ============================================================================
  // Example 3: Index Usage Analysis
  // ============================================================================
  console.log('Example 3: Index Usage Analysis');
  console.log('-'.repeat(80));
  
  try {
    const result3 = await agentAnalyzeIndexUsage({
      table: 'conversations',
      minScans: 100
    });

    console.log('Success:', result3.success);
    console.log('Summary:', result3.summary);
    console.log('Execution Time:', result3.executionTimeMs + 'ms');
    
    console.log('\nIndexes Found:', result3.indexes.length);
    if (result3.indexes.length > 0) {
      console.log('\nIndex Details:');
      result3.indexes.forEach((idx, i) => {
        console.log(`  ${i + 1}. ${idx.indexName}`);
        console.log(`     Table: ${idx.tableName}`);
        console.log(`     Scans: ${idx.scans}`);
        console.log(`     Size: ${formatBytes(idx.sizeBytes)}`);
        console.log(`     Unused: ${idx.unused ? 'YES ⚠️' : 'No'}`);
        console.log(`     Tuples Read: ${idx.tuplesRead}`);
        console.log(`     Tuples Returned: ${idx.tuplesReturned}`);
      });
    }

    if (result3.recommendations.length > 0) {
      console.log('\nRecommendations:');
      result3.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
    }

    console.log('\nNext Actions:');
    result3.nextActions.forEach(action => {
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
  // Example 4: Analyze All Low-Usage Indexes
  // ============================================================================
  console.log('Example 4: Analyze All Low-Usage Indexes');
  console.log('-'.repeat(80));
  
  try {
    const result4 = await agentAnalyzeIndexUsage({
      minScans: 10  // Very low threshold
    });

    console.log('Success:', result4.success);
    console.log('Summary:', result4.summary);
    console.log('Total Indexes Analyzed:', result4.indexes.length);
    
    const unused = result4.indexes.filter(idx => idx.unused);
    const lowUsage = result4.indexes.filter(idx => !idx.unused && idx.scans < 10);
    
    console.log(`  - Unused: ${unused.length}`);
    console.log(`  - Low Usage: ${lowUsage.length}`);

    if (unused.length > 0) {
      console.log('\nUnused Indexes:');
      unused.slice(0, 5).forEach(idx => {
        console.log(`  - ${idx.indexName} (${idx.tableName}) - Size: ${formatBytes(idx.sizeBytes)}`);
      });
      if (unused.length > 5) {
        console.log(`  ... and ${unused.length - 5} more`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // ============================================================================
  // Example 5: Table Bloat Analysis
  // ============================================================================
  console.log('Example 5: Table Bloat Analysis');
  console.log('-'.repeat(80));
  
  try {
    const result5 = await agentAnalyzeTableBloat('conversations');

    console.log('Success:', result5.success);
    console.log('Summary:', result5.summary);
    console.log('Execution Time:', result5.executionTimeMs + 'ms');
    
    console.log('\nNext Actions:');
    result5.nextActions.forEach(action => {
      console.log(`  - [${action.priority}] ${action.action}: ${action.description}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  console.log('='.repeat(80));
  console.log('VERIFICATION & PERFORMANCE EXAMPLES COMPLETED');
  console.log('='.repeat(80));
}

// Helper function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Run examples
if (require.main === module) {
  runVerificationExamples()
    .then(() => {
      console.log('\n✅ All examples completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error running examples:', error);
      process.exit(1);
    });
}

module.exports = { runVerificationExamples };

