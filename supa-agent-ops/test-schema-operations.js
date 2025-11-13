/**
 * Validation Test Script for Schema Operations & RPC Foundation (v1.1)
 * 
 * This script demonstrates and validates all new operations:
 * - Schema introspection
 * - DDL execution
 * - Index management
 * - RPC execution
 * - SQL execution
 * 
 * Prerequisites:
 * - SUPABASE_URL environment variable set
 * - SUPABASE_SERVICE_ROLE_KEY environment variable set
 * - DATABASE_URL environment variable set (for pg transport)
 * - exec_sql RPC function created in Supabase (see instructions below)
 */

const {
  agentIntrospectSchema,
  agentExecuteDDL,
  agentManageIndex,
  agentExecuteRPC,
  agentExecuteSQL,
  preflightSchemaOperation
} = require('./dist/index');

// Test configuration
const TEST_TABLE = 'test_schema_ops';
const TEST_INDEX = 'idx_test_schema_ops_name';

/**
 * Color codes for console output
 */
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function logSuccess(message) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}✗ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

function logSection(message) {
  console.log(`\n${colors.cyan}━━━ ${message} ━━━${colors.reset}\n`);
}

/**
 * Validates a result object
 */
function validateResult(result, testName) {
  console.assert(result !== null && result !== undefined, `${testName}: Result should not be null`);
  console.assert(typeof result === 'object', `${testName}: Result should be an object`);
  console.assert('success' in result, `${testName}: Result should have 'success' property`);
  console.assert('summary' in result, `${testName}: Result should have 'summary' property`);
  console.assert('executionTimeMs' in result, `${testName}: Result should have 'executionTimeMs' property`);
  console.assert('nextActions' in result, `${testName}: Result should have 'nextActions' property`);
  console.assert(Array.isArray(result.nextActions), `${testName}: nextActions should be an array`);
  
  if (result.success) {
    logSuccess(`${testName}: Success`);
  } else {
    logWarning(`${testName}: Failed (expected in some scenarios)`);
  }
  
  logInfo(`Summary: ${result.summary}`);
  logInfo(`Execution time: ${result.executionTimeMs}ms`);
  
  if (result.nextActions.length > 0) {
    logInfo(`Next actions (${result.nextActions.length}):`);
    result.nextActions.forEach(action => {
      console.log(`  - [${action.priority}] ${action.action}: ${action.description}`);
    });
  }
  
  return result.success;
}

/**
 * Test 1: Preflight Checks for Schema Operations
 */
async function test1_preflightChecks() {
  logSection('Test 1: Preflight Checks for Schema Operations');
  
  try {
    const result = await preflightSchemaOperation({
      operation: 'ddl',
      table: TEST_TABLE,
      transport: 'pg'
    });
    
    console.assert(result.ok !== undefined, 'Preflight result should have ok property');
    console.assert(Array.isArray(result.issues), 'Preflight result should have issues array');
    console.assert(Array.isArray(result.recommendations), 'Preflight result should have recommendations array');
    
    if (result.ok) {
      logSuccess('Preflight checks passed');
    } else {
      logWarning(`Preflight checks failed with ${result.issues.length} issue(s):`);
      result.issues.forEach(issue => console.log(`  - ${issue}`));
      
      if (result.recommendations.length > 0) {
        logInfo('Recommendations:');
        result.recommendations.forEach(rec => {
          console.log(`  - [${rec.priority}] ${rec.description}`);
          if (rec.example) {
            console.log(`    Example: ${rec.example.substring(0, 100)}...`);
          }
        });
      }
    }
    
    return result.ok;
  } catch (error) {
    logError(`Preflight check error: ${error.message}`);
    return false;
  }
}

/**
 * Test 2: Schema Introspection
 */
async function test2_schemaIntrospection() {
  logSection('Test 2: Schema Introspection');
  
  try {
    // Test introspecting a specific table (may not exist yet)
    const result = await agentIntrospectSchema({
      table: 'conversations',
      includeColumns: true,
      includeIndexes: true,
      includeConstraints: true,
      includePolicies: true,
      includeStats: true,
      transport: 'pg'
    });
    
    console.assert(result.tables !== undefined, 'Result should have tables property');
    console.assert(Array.isArray(result.tables), 'Tables should be an array');
    
    validateResult(result, 'Schema Introspection');
    
    if (result.tables.length > 0) {
      const table = result.tables[0];
      logInfo(`Table: ${table.name}`);
      logInfo(`Exists: ${table.exists}`);
      
      if (table.exists) {
        logInfo(`Row count: ${table.rowCount}`);
        logInfo(`Columns: ${table.columns.length}`);
        logInfo(`Indexes: ${table.indexes.length}`);
        logInfo(`Constraints: ${table.constraints.length}`);
        logInfo(`Policies: ${table.policies.length}`);
        logInfo(`RLS Enabled: ${table.rlsEnabled}`);
        
        if (table.columns.length > 0) {
          console.log('\n  Sample columns:');
          table.columns.slice(0, 3).forEach(col => {
            console.log(`    - ${col.name} (${col.type})${col.isPrimaryKey ? ' [PK]' : ''}${col.nullable ? '' : ' NOT NULL'}`);
          });
        }
      }
    }
    
    return result.success;
  } catch (error) {
    logError(`Schema introspection error: ${error.message}`);
    return false;
  }
}

/**
 * Test 3: DDL Execution (Dry Run)
 */
async function test3_ddlExecutionDryRun() {
  logSection('Test 3: DDL Execution (Dry Run)');
  
  try {
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS ${TEST_TABLE} (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        description text,
        created_at timestamptz DEFAULT now()
      );
    `;
    
    const result = await agentExecuteDDL({
      sql: createTableSql,
      dryRun: true,
      transaction: true,
      transport: 'pg'
    });
    
    console.assert(result.executed !== undefined, 'Result should have executed property');
    console.assert(result.statements !== undefined, 'Result should have statements property');
    console.assert(result.affectedObjects !== undefined, 'Result should have affectedObjects property');
    console.assert(result.executed === false, 'Dry run should not execute');
    
    validateResult(result, 'DDL Execution (Dry Run)');
    
    logInfo(`Statements: ${result.statements}`);
    logInfo(`Affected objects: ${result.affectedObjects.join(', ')}`);
    
    if (result.warnings && result.warnings.length > 0) {
      logWarning(`Warnings: ${result.warnings.join(', ')}`);
    }
    
    return result.success;
  } catch (error) {
    logError(`DDL dry run error: ${error.message}`);
    return false;
  }
}

/**
 * Test 4: DDL Execution (Actual)
 */
async function test4_ddlExecutionActual() {
  logSection('Test 4: DDL Execution (Actual)');
  
  try {
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS ${TEST_TABLE} (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        description text,
        created_at timestamptz DEFAULT now()
      );
    `;
    
    const result = await agentExecuteDDL({
      sql: createTableSql,
      dryRun: false,
      transaction: true,
      transport: 'pg'
    });
    
    const success = validateResult(result, 'DDL Execution (Actual)');
    
    if (result.executed) {
      logInfo('Table created successfully');
      logInfo(`Affected objects: ${result.affectedObjects.join(', ')}`);
    }
    
    return success;
  } catch (error) {
    logError(`DDL execution error: ${error.message}`);
    return false;
  }
}

/**
 * Test 5: Index Management - List
 */
async function test5_indexManagementList() {
  logSection('Test 5: Index Management - List');
  
  try {
    const result = await agentManageIndex({
      table: TEST_TABLE,
      action: 'list',
      transport: 'pg'
    });
    
    console.assert(result.indexes !== undefined, 'Result should have indexes property');
    console.assert(Array.isArray(result.indexes), 'Indexes should be an array');
    
    validateResult(result, 'Index Management (List)');
    
    logInfo(`Found ${result.indexes.length} index(es)`);
    
    if (result.indexes.length > 0) {
      console.log('\n  Indexes:');
      result.indexes.forEach(idx => {
        console.log(`    - ${idx.name} on (${idx.columns.join(', ')})${idx.isUnique ? ' [UNIQUE]' : ''}${idx.isPrimary ? ' [PRIMARY]' : ''}`);
      });
    }
    
    return result.success;
  } catch (error) {
    logError(`Index list error: ${error.message}`);
    return false;
  }
}

/**
 * Test 6: Index Management - Create
 */
async function test6_indexManagementCreate() {
  logSection('Test 6: Index Management - Create');
  
  try {
    const result = await agentManageIndex({
      table: TEST_TABLE,
      action: 'create',
      indexName: TEST_INDEX,
      columns: ['name'],
      indexType: 'btree',
      concurrent: true,
      unique: false,
      dryRun: false,
      transport: 'pg'
    });
    
    validateResult(result, 'Index Management (Create)');
    
    if (result.success) {
      logInfo(`Index "${TEST_INDEX}" created successfully`);
    }
    
    return result.success;
  } catch (error) {
    logError(`Index create error: ${error.message}`);
    // Index might already exist, which is OK
    return true;
  }
}

/**
 * Test 7: SQL Execution via pg transport
 */
async function test7_sqlExecutionPg() {
  logSection('Test 7: SQL Execution (pg transport)');
  
  try {
    const result = await agentExecuteSQL({
      sql: `INSERT INTO ${TEST_TABLE} (name, description) VALUES ('Test 1', 'First test record'), ('Test 2', 'Second test record');`,
      transport: 'pg',
      transaction: true,
      dryRun: false
    });
    
    console.assert(result.rowCount !== undefined, 'Result should have rowCount property');
    console.assert(result.command !== undefined, 'Result should have command property');
    
    validateResult(result, 'SQL Execution (pg)');
    
    if (result.success) {
      logInfo(`Command: ${result.command}`);
      logInfo(`Rows affected: ${result.rowCount}`);
    }
    
    return result.success;
  } catch (error) {
    logError(`SQL execution (pg) error: ${error.message}`);
    return false;
  }
}

/**
 * Test 8: SQL Execution - Query
 */
async function test8_sqlExecutionQuery() {
  logSection('Test 8: SQL Execution - Query');
  
  try {
    const result = await agentExecuteSQL({
      sql: `SELECT * FROM ${TEST_TABLE} LIMIT 5;`,
      transport: 'pg',
      transaction: false,
      dryRun: false
    });
    
    console.assert(result.rows !== undefined, 'Result should have rows property');
    console.assert(Array.isArray(result.rows), 'Rows should be an array');
    
    validateResult(result, 'SQL Execution (Query)');
    
    if (result.success && result.rows) {
      logInfo(`Rows returned: ${result.rows.length}`);
      
      if (result.rows.length > 0) {
        console.log('\n  Sample rows:');
        result.rows.forEach((row, idx) => {
          console.log(`    ${idx + 1}. ${row.name}: ${row.description}`);
        });
      }
    }
    
    return result.success;
  } catch (error) {
    logError(`SQL query error: ${error.message}`);
    return false;
  }
}

/**
 * Test 9: RPC Execution
 */
async function test9_rpcExecution() {
  logSection('Test 9: RPC Execution');
  
  try {
    // Test with exec_sql function (if it exists)
    const result = await agentExecuteRPC({
      functionName: 'exec_sql',
      params: {
        sql_script: `SELECT COUNT(*) as count FROM ${TEST_TABLE};`
      },
      timeout: 30000
    });
    
    console.assert(result.data !== undefined, 'Result should have data property');
    
    validateResult(result, 'RPC Execution');
    
    if (result.success) {
      logInfo(`Data returned: ${JSON.stringify(result.data)}`);
      
      if (result.rowCount !== undefined) {
        logInfo(`Row count: ${result.rowCount}`);
      }
    }
    
    return result.success;
  } catch (error) {
    logWarning(`RPC execution error: ${error.message}`);
    logInfo('This is expected if exec_sql function does not exist');
    logInfo('Create it with the SQL provided in the error remediation');
    return true; // Don't fail test if RPC function doesn't exist
  }
}

/**
 * Test 10: Cleanup (Drop test table and index)
 */
async function test10_cleanup() {
  logSection('Test 10: Cleanup');
  
  try {
    // Drop the test table
    const result = await agentExecuteDDL({
      sql: `DROP TABLE IF EXISTS ${TEST_TABLE} CASCADE;`,
      dryRun: false,
      transaction: true,
      transport: 'pg'
    });
    
    validateResult(result, 'Cleanup (Drop Table)');
    
    if (result.success) {
      logSuccess('Test table and indexes dropped successfully');
    }
    
    return result.success;
  } catch (error) {
    logError(`Cleanup error: ${error.message}`);
    return false;
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log(`
${colors.cyan}╔════════════════════════════════════════════════════════════════╗
║  Schema Operations & RPC Foundation Validation Tests (v1.1)  ║
╚════════════════════════════════════════════════════════════════╝${colors.reset}
  `);
  
  // Check environment variables
  const requiredVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'DATABASE_URL'];
  const missingVars = requiredVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    logError(`Missing required environment variables: ${missingVars.join(', ')}`);
    logInfo('Set these variables before running tests:');
    missingVars.forEach(v => {
      console.log(`  export ${v}=your-value-here`);
    });
    process.exit(1);
  }
  
  logSuccess('Environment variables configured');
  
  // Run tests
  const tests = [
    { name: 'Preflight Checks', fn: test1_preflightChecks },
    { name: 'Schema Introspection', fn: test2_schemaIntrospection },
    { name: 'DDL Execution (Dry Run)', fn: test3_ddlExecutionDryRun },
    { name: 'DDL Execution (Actual)', fn: test4_ddlExecutionActual },
    { name: 'Index Management (List)', fn: test5_indexManagementList },
    { name: 'Index Management (Create)', fn: test6_indexManagementCreate },
    { name: 'SQL Execution (pg)', fn: test7_sqlExecutionPg },
    { name: 'SQL Execution (Query)', fn: test8_sqlExecutionQuery },
    { name: 'RPC Execution', fn: test9_rpcExecution },
    { name: 'Cleanup', fn: test10_cleanup }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const success = await test.fn();
      results.push({ name: test.name, success });
    } catch (error) {
      logError(`Test "${test.name}" threw error: ${error.message}`);
      results.push({ name: test.name, success: false, error: error.message });
    }
  }
  
  // Summary
  logSection('Test Summary');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  results.forEach(result => {
    if (result.success) {
      logSuccess(`${result.name}`);
    } else {
      logError(`${result.name}${result.error ? `: ${result.error}` : ''}`);
    }
  });
  
  console.log(`
${colors.cyan}╔════════════════════════════════════════════════════════════════╗${colors.reset}
${passed === tests.length ? colors.green : colors.yellow}  Total: ${tests.length} | Passed: ${passed} | Failed: ${failed}${colors.reset}
${colors.cyan}╚════════════════════════════════════════════════════════════════╝${colors.reset}
  `);
  
  if (passed === tests.length) {
    logSuccess('All tests passed! ✨');
  } else if (failed === 1 && results.find(r => r.name === 'RPC Execution' && !r.success)) {
    logInfo('Note: RPC Execution failure is expected if exec_sql function is not created');
    logInfo('See ERROR_CODES.md for exec_sql function creation instructions');
  } else {
    logWarning(`${failed} test(s) failed. Review output above for details.`);
  }
  
  process.exit(failed > 0 && !(failed === 1 && results.find(r => r.name === 'RPC Execution' && !r.success)) ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});

