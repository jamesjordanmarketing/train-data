/**
 * Example: Schema Operations & RPC Foundation
 * 
 * This example demonstrates the new v1.1 capabilities:
 * - Schema introspection
 * - DDL execution
 * - Index management
 * - RPC and SQL execution
 */

const {
  agentIntrospectSchema,
  agentExecuteDDL,
  agentManageIndex,
  agentExecuteRPC,
  agentExecuteSQL,
  preflightSchemaOperation
} = require('./dist/index');

async function main() {
  console.log('=== Schema Operations Examples ===\n');

  // ========================================================================
  // Example 1: Introspect Database Schema
  // ========================================================================
  console.log('1. Introspecting "conversations" table...');
  
  const schemaResult = await agentIntrospectSchema({
    table: 'conversations',
    includeColumns: true,
    includeIndexes: true,
    includePolicies: true,
    includeStats: true
  });

  if (schemaResult.success && schemaResult.tables[0]) {
    const table = schemaResult.tables[0];
    console.log(`   Table: ${table.name}`);
    console.log(`   Exists: ${table.exists}`);
    
    if (table.exists) {
      console.log(`   Rows: ${table.rowCount}`);
      console.log(`   Columns: ${table.columns.length}`);
      console.log(`   Indexes: ${table.indexes.length}`);
      console.log(`   RLS Enabled: ${table.rlsEnabled}`);
    }
  }
  console.log();

  // ========================================================================
  // Example 2: Execute DDL with Dry Run
  // ========================================================================
  console.log('2. Testing DDL execution (dry run)...');
  
  const ddlDryRun = await agentExecuteDDL({
    sql: `
      CREATE TABLE IF NOT EXISTS demo_products (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        price numeric(10,2),
        created_at timestamptz DEFAULT now()
      );
    `,
    dryRun: true,
    transaction: true
  });

  console.log(`   ${ddlDryRun.summary}`);
  console.log(`   Statements: ${ddlDryRun.statements}`);
  console.log(`   Would affect: ${ddlDryRun.affectedObjects.join(', ')}`);
  console.log();

  // ========================================================================
  // Example 3: Create Table (actual execution)
  // ========================================================================
  console.log('3. Creating demo table...');
  
  const createResult = await agentExecuteDDL({
    sql: `
      CREATE TABLE IF NOT EXISTS demo_products (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        price numeric(10,2),
        category text,
        created_at timestamptz DEFAULT now()
      );
    `,
    dryRun: false,
    transaction: true
  });

  if (createResult.success) {
    console.log(`   ✓ Table created successfully`);
  }
  console.log();

  // ========================================================================
  // Example 4: List Indexes
  // ========================================================================
  console.log('4. Listing indexes on demo_products...');
  
  const listIndexes = await agentManageIndex({
    table: 'demo_products',
    action: 'list'
  });

  console.log(`   Found ${listIndexes.indexes.length} index(es)`);
  listIndexes.indexes.forEach(idx => {
    console.log(`   - ${idx.name} on (${idx.columns.join(', ')})`);
  });
  console.log();

  // ========================================================================
  // Example 5: Create Index
  // ========================================================================
  console.log('5. Creating index...');
  
  const createIndex = await agentManageIndex({
    table: 'demo_products',
    action: 'create',
    indexName: 'idx_demo_products_category',
    columns: ['category'],
    concurrent: false // Use true in production for non-blocking
  });

  if (createIndex.success) {
    console.log(`   ✓ Index created successfully`);
  }
  console.log();

  // ========================================================================
  // Example 6: Insert Data via SQL
  // ========================================================================
  console.log('6. Inserting sample data...');
  
  const insertResult = await agentExecuteSQL({
    sql: `
      INSERT INTO demo_products (name, price, category)
      VALUES 
        ('Widget A', 19.99, 'electronics'),
        ('Widget B', 29.99, 'electronics'),
        ('Gadget C', 49.99, 'tools')
      ON CONFLICT (id) DO NOTHING;
    `,
    transport: 'pg',
    transaction: true
  });

  if (insertResult.success) {
    console.log(`   ✓ Inserted ${insertResult.rowCount} rows`);
  }
  console.log();

  // ========================================================================
  // Example 7: Query Data
  // ========================================================================
  console.log('7. Querying data...');
  
  const queryResult = await agentExecuteSQL({
    sql: 'SELECT * FROM demo_products ORDER BY price DESC LIMIT 3;',
    transport: 'pg'
  });

  if (queryResult.success && queryResult.rows) {
    console.log(`   Found ${queryResult.rows.length} product(s):`);
    queryResult.rows.forEach(row => {
      console.log(`   - ${row.name}: $${row.price} (${row.category})`);
    });
  }
  console.log();

  // ========================================================================
  // Example 8: Execute via RPC (if exec_sql function exists)
  // ========================================================================
  console.log('8. Executing via RPC...');
  
  try {
    const rpcResult = await agentExecuteRPC({
      functionName: 'exec_sql',
      params: {
        sql_script: 'SELECT COUNT(*) as count FROM demo_products;'
      }
    });

    if (rpcResult.success) {
      console.log(`   ✓ RPC executed successfully`);
      console.log(`   Result:`, rpcResult.data);
    }
  } catch (error) {
    console.log(`   ⚠ RPC function not found (expected if not created)`);
  }
  console.log();

  // ========================================================================
  // Example 9: Analyze Index Performance
  // ========================================================================
  console.log('9. Analyzing indexes...');
  
  const analyzeResult = await agentManageIndex({
    table: 'demo_products',
    action: 'analyze'
  });

  if (analyzeResult.success) {
    console.log(`   Index analysis complete`);
    analyzeResult.indexes.forEach(idx => {
      console.log(`   - ${idx.name}: ${idx.sizeBytes} bytes`);
    });
  }
  console.log();

  // ========================================================================
  // Example 10: Cleanup - Drop Table
  // ========================================================================
  console.log('10. Cleaning up...');
  
  const dropResult = await agentExecuteDDL({
    sql: 'DROP TABLE IF EXISTS demo_products CASCADE;',
    transaction: true
  });

  if (dropResult.success) {
    console.log(`   ✓ Demo table dropped`);
  }
  console.log();

  // ========================================================================
  // Summary
  // ========================================================================
  console.log('=== All Examples Completed ===');
  console.log('\nKey Features Demonstrated:');
  console.log('  ✓ Schema introspection');
  console.log('  ✓ DDL execution with dry-run mode');
  console.log('  ✓ Index management (list, create, analyze)');
  console.log('  ✓ SQL execution with transactions');
  console.log('  ✓ Query result processing');
  console.log('  ✓ RPC function execution');
  console.log('  ✓ Safe cleanup operations');
}

// Run examples
main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});

