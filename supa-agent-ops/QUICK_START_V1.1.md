# Quick Start: Schema Operations (v1.1)

Get started with Schema Operations and RPC in 5 minutes.

## Prerequisites

```bash
# Required environment variables
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
export DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

## Installation

```bash
cd supa-agent-ops
npm install
npm run build
npm link

# In your project
cd ../your-project
npm link supa-agent-ops
```

## 1. Schema Introspection (30 seconds)

Query your database structure:

```javascript
const { agentIntrospectSchema } = require('supa-agent-ops');

const result = await agentIntrospectSchema({
  table: 'conversations',
  includeColumns: true,
  includeIndexes: true
});

if (result.success) {
  const table = result.tables[0];
  console.log(`Table: ${table.name}`);
  console.log(`Rows: ${table.rowCount}`);
  console.log(`Columns: ${table.columns.length}`);
  console.log(`Indexes: ${table.indexes.length}`);
}
```

## 2. Execute DDL (1 minute)

Create a table with transaction safety:

```javascript
const { agentExecuteDDL } = require('supa-agent-ops');

// Test with dry-run first
const dryRun = await agentExecuteDDL({
  sql: `CREATE TABLE products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    price numeric(10,2)
  );`,
  dryRun: true
});

console.log(dryRun.summary); // "Dry run completed. SQL validated."

// Execute for real
const result = await agentExecuteDDL({
  sql: `CREATE TABLE products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    price numeric(10,2)
  );`,
  transaction: true
});

if (result.success) {
  console.log('✓ Table created');
}
```

## 3. Manage Indexes (1 minute)

Create and manage indexes:

```javascript
const { agentManageIndex } = require('supa-agent-ops');

// List existing indexes
const list = await agentManageIndex({
  table: 'products',
  action: 'list'
});

console.log(`Found ${list.indexes.length} indexes`);

// Create a new index
const create = await agentManageIndex({
  table: 'products',
  action: 'create',
  indexName: 'idx_products_name',
  columns: ['name'],
  concurrent: true  // Non-blocking
});

if (create.success) {
  console.log('✓ Index created');
}
```

## 4. Execute SQL (1 minute)

Run queries and inserts:

```javascript
const { agentExecuteSQL } = require('supa-agent-ops');

// Insert data
const insert = await agentExecuteSQL({
  sql: `INSERT INTO products (name, price) 
        VALUES ('Widget', 19.99), ('Gadget', 29.99);`,
  transport: 'pg',
  transaction: true
});

console.log(`Inserted ${insert.rowCount} rows`);

// Query data
const query = await agentExecuteSQL({
  sql: 'SELECT * FROM products;',
  transport: 'pg'
});

query.rows?.forEach(row => {
  console.log(`${row.name}: $${row.price}`);
});
```

## 5. Execute RPC (2 minutes)

### Step 1: Create exec_sql function in Supabase SQL Editor

```sql
CREATE OR REPLACE FUNCTION exec_sql(sql_script text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  EXECUTE sql_script INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM, 'code', SQLSTATE);
END;
$$;

GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
```

### Step 2: Call RPC functions

```javascript
const { agentExecuteRPC } = require('supa-agent-ops');

const result = await agentExecuteRPC({
  functionName: 'exec_sql',
  params: {
    sql_script: 'SELECT COUNT(*) FROM products;'
  }
});

console.log(result.data);
```

## Run Tests

```bash
npm run build
node test-schema-operations.js
```

## Run Examples

```bash
npm run build
node example-schema-operations.js
```

## Next Steps

- Read [SCHEMA_OPERATIONS_GUIDE.md](./SCHEMA_OPERATIONS_GUIDE.md) for complete documentation
- Review [example-schema-operations.js](./example-schema-operations.js) for more examples
- Check [ERROR_CODES.md](./ERROR_CODES.md) for error handling
- See [CHANGELOG.md](./CHANGELOG.md) for v1.1 features

## Common Patterns

### Safe DDL Execution

```javascript
// 1. Preflight check
const preflight = await preflightSchemaOperation({
  operation: 'ddl'
});

if (!preflight.ok) {
  console.error('Issues:', preflight.issues);
  return;
}

// 2. Dry run
const dryRun = await agentExecuteDDL({ sql: myDDL, dryRun: true });

if (!dryRun.success) {
  console.error('Validation failed');
  return;
}

// 3. Execute with transaction
const result = await agentExecuteDDL({ 
  sql: myDDL, 
  transaction: true 
});
```

### Index Optimization

```javascript
// List indexes
const current = await agentManageIndex({
  table: 'my_table',
  action: 'list'
});

// Drop unused index
await agentManageIndex({
  table: 'my_table',
  action: 'drop',
  indexName: 'old_index',
  concurrent: true
});

// Create optimized index
await agentManageIndex({
  table: 'my_table',
  action: 'create',
  indexName: 'idx_optimized',
  columns: ['col1', 'col2'],
  concurrent: true
});
```

### Complete Schema Analysis

```javascript
const schema = await agentIntrospectSchema({
  table: 'my_table',
  includeColumns: true,
  includeIndexes: true,
  includeConstraints: true,
  includePolicies: true,
  includeStats: true
});

const table = schema.tables[0];

console.log(`Table: ${table.name}`);
console.log(`Rows: ${table.rowCount.toLocaleString()}`);
console.log(`Size: ${(table.sizeBytes / 1024 / 1024).toFixed(2)} MB`);
console.log(`RLS: ${table.rlsEnabled ? 'Enabled' : 'Disabled'}`);
console.log(`Indexes: ${table.indexes.length}`);
console.log(`Policies: ${table.policies.length}`);
```

## Tips

1. **Always use transactions** for DDL operations
2. **Use CONCURRENTLY** for index operations on production tables
3. **Test with dry-run** before executing destructive operations
4. **Check preflight** before schema operations
5. **Monitor execution time** for performance tracking

## Troubleshooting

### "RPC function not found"
Create the exec_sql function (see Step 5 above)

### "Permission denied"
Use service role key, not anon key:
```bash
export SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### "Transaction failed"
Check SQL syntax - transaction was auto-rolled back

## Support

- [Full Guide](./SCHEMA_OPERATIONS_GUIDE.md)
- [GitHub Issues](https://github.com/your-repo/supa-agent-ops/issues)
- [Examples](./example-schema-operations.js)

---

**You're ready to use v1.1 Schema Operations!** 🚀

