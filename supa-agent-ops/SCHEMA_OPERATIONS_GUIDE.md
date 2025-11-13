# Schema Operations & RPC Foundation Guide (v1.1)

## Overview

Version 1.1 of the Supabase Agent Ops Library introduces powerful schema operations and RPC capabilities:

- **Schema Introspection** - Query database structure programmatically
- **DDL Execution** - CREATE/ALTER/DROP operations with transaction safety
- **Index Management** - Create, drop, and analyze indexes
- **RPC Execution** - Call custom database functions
- **Raw SQL Execution** - Execute SQL via RPC or direct pg connection

## Table of Contents

- [Installation](#installation)
- [Prerequisites](#prerequisites)
- [Schema Operations](#schema-operations)
  - [Schema Introspection](#schema-introspection)
  - [DDL Execution](#ddl-execution)
  - [Index Management](#index-management)
- [RPC Operations](#rpc-operations)
  - [RPC Function Execution](#rpc-function-execution)
  - [SQL Execution](#sql-execution)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [Examples](#examples)

## Installation

```bash
npm install supa-agent-ops
```

## Prerequisites

### Environment Variables

```bash
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
export DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

### Required RPC Function

For RPC-based SQL execution, create this function in your Supabase SQL Editor:

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
  RETURN jsonb_build_object(
    'error', SQLERRM,
    'code', SQLSTATE
  );
END;
$$;

GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
```

## Schema Operations

### Schema Introspection

Query database structure including tables, columns, indexes, constraints, and RLS policies.

#### Basic Usage

```typescript
import { agentIntrospectSchema } from 'supa-agent-ops';

const result = await agentIntrospectSchema({
  table: 'conversations',
  includeColumns: true,
  includeIndexes: true,
  includeConstraints: true,
  includePolicies: true,
  includeStats: true,
  transport: 'pg'
});

if (result.success) {
  const table = result.tables[0];
  console.log(`Table: ${table.name}`);
  console.log(`Exists: ${table.exists}`);
  console.log(`Row Count: ${table.rowCount}`);
  console.log(`RLS Enabled: ${table.rlsEnabled}`);
  
  // Columns
  table.columns.forEach(col => {
    console.log(`  - ${col.name} (${col.type}) ${col.nullable ? 'NULL' : 'NOT NULL'}`);
  });
  
  // Indexes
  table.indexes.forEach(idx => {
    console.log(`  - Index: ${idx.name} on (${idx.columns.join(', ')})`);
  });
}
```

#### Introspect All Tables

```typescript
const result = await agentIntrospectSchema({
  // No table specified = all tables
  includeColumns: true,
  includeIndexes: true
});

console.log(`Found ${result.tables.length} tables`);
```

#### Result Structure

```typescript
interface SchemaIntrospectResult {
  success: boolean;
  summary: string;
  executionTimeMs: number;
  nextActions: NextAction[];
  tables: TableSchema[];
}

interface TableSchema {
  name: string;
  exists: boolean;
  rowCount: number;
  sizeBytes?: number;
  columns: ColumnInfo[];
  indexes: IndexInfo[];
  constraints: ConstraintInfo[];
  policies: PolicyInfo[];
  rlsEnabled: boolean;
}
```

### DDL Execution

Execute DDL statements (CREATE, ALTER, DROP) with transaction support and validation.

#### Create Table

```typescript
import { agentExecuteDDL } from 'supa-agent-ops';

const result = await agentExecuteDDL({
  sql: `
    CREATE TABLE products (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      price numeric(10,2),
      created_at timestamptz DEFAULT now()
    );
  `,
  transaction: true,
  dryRun: false
});

if (result.success) {
  console.log(`Executed: ${result.executed}`);
  console.log(`Affected: ${result.affectedObjects.join(', ')}`);
}
```

#### Dry Run Mode

```typescript
const result = await agentExecuteDDL({
  sql: 'ALTER TABLE products ADD COLUMN description text;',
  dryRun: true  // Validates SQL without executing
});

console.log(result.summary); // "Dry run completed. SQL validated."
```

#### Transaction Safety

```typescript
const result = await agentExecuteDDL({
  sql: `
    ALTER TABLE products ADD COLUMN category text;
    ALTER TABLE products ADD COLUMN status text DEFAULT 'active';
  `,
  transaction: true  // Wraps in BEGIN/COMMIT, rolls back on error
});
```

#### Destructive Operations Warning

The library automatically detects and warns about destructive operations:

```typescript
const result = await agentExecuteDDL({
  sql: 'DROP TABLE products;'
});

if (result.warnings) {
  console.log(result.warnings); // ["Destructive operation detected: DROP"]
}
```

### Index Management

Create, drop, list, and analyze database indexes.

#### List Indexes

```typescript
import { agentManageIndex } from 'supa-agent-ops';

const result = await agentManageIndex({
  table: 'conversations',
  action: 'list'
});

result.indexes.forEach(idx => {
  console.log(`${idx.name}: ${idx.columns.join(', ')}`);
  console.log(`  Unique: ${idx.isUnique}`);
  console.log(`  Size: ${idx.sizeBytes} bytes`);
});
```

#### Create Index

```typescript
const result = await agentManageIndex({
  table: 'conversations',
  action: 'create',
  indexName: 'idx_conversations_persona',
  columns: ['persona'],
  indexType: 'btree',
  concurrent: true,  // Non-blocking index creation
  unique: false
});
```

#### Create Unique Index

```typescript
const result = await agentManageIndex({
  table: 'users',
  action: 'create',
  indexName: 'idx_users_email_unique',
  columns: ['email'],
  unique: true
});
```

#### Create Partial Index

```typescript
const result = await agentManageIndex({
  table: 'orders',
  action: 'create',
  indexName: 'idx_orders_active',
  columns: ['status', 'created_at'],
  where: "status = 'active'"
});
```

#### Drop Index

```typescript
const result = await agentManageIndex({
  table: 'conversations',
  action: 'drop',
  indexName: 'idx_conversations_old',
  concurrent: true  // Non-blocking drop
});
```

## RPC Operations

### RPC Function Execution

Execute custom Supabase RPC functions with parameter validation and timeout support.

#### Basic RPC Call

```typescript
import { agentExecuteRPC } from 'supa-agent-ops';

const result = await agentExecuteRPC({
  functionName: 'get_user_stats',
  params: {
    user_id: 'abc-123'
  },
  timeout: 30000  // 30 seconds
});

if (result.success) {
  console.log(result.data);
}
```

#### Execute SQL via RPC

```typescript
const result = await agentExecuteRPC({
  functionName: 'exec_sql',
  params: {
    sql_script: 'SELECT COUNT(*) FROM conversations;'
  }
});

console.log(result.data);
```

### SQL Execution

Execute raw SQL via RPC or direct PostgreSQL connection.

#### Query Execution (pg transport)

```typescript
import { agentExecuteSQL } from 'supa-agent-ops';

const result = await agentExecuteSQL({
  sql: 'SELECT * FROM conversations WHERE persona = $1 LIMIT 10;',
  transport: 'pg',
  transaction: false
});

if (result.success) {
  console.log(`Rows: ${result.rowCount}`);
  result.rows?.forEach(row => {
    console.log(row);
  });
}
```

#### Insert with Transaction

```typescript
const result = await agentExecuteSQL({
  sql: `
    INSERT INTO conversations (persona, prompt, response)
    VALUES ('assistant', 'Hello', 'Hi there!');
  `,
  transport: 'pg',
  transaction: true  // Auto-rollback on error
});
```

#### RPC Transport

```typescript
const result = await agentExecuteSQL({
  sql: 'SELECT table_name FROM information_schema.tables;',
  transport: 'rpc',  // Uses exec_sql RPC function
  timeout: 60000
});
```

#### Dry Run Mode

```typescript
const result = await agentExecuteSQL({
  sql: 'UPDATE products SET price = price * 1.1;',
  dryRun: true  // Validates without executing
});

console.log(result.summary); // "Dry run completed. SQL validated."
```

## Error Handling

All operations return standardized error information with remediation steps.

### New Error Codes (v1.1)

| Code | Description | Automatable |
|------|-------------|-------------|
| `ERR_SCHEMA_ACCESS_DENIED` | Insufficient schema permissions | No |
| `ERR_RPC_NOT_FOUND` | RPC function does not exist | Yes |
| `ERR_DDL_SYNTAX` | Invalid DDL syntax | No |
| `ERR_INDEX_EXISTS` | Index already exists | Yes |
| `ERR_INDEX_NOT_FOUND` | Index does not exist | No |
| `ERR_RPC_TIMEOUT` | RPC/SQL execution timeout | No |
| `ERR_TRANSACTION_FAILED` | Transaction rolled back | No |

### Error Example

```typescript
const result = await agentExecuteDDL({
  sql: 'CREATE TABLE invalid syntax;'
});

if (!result.success) {
  console.log(result.summary);  // "DDL execution failed: Invalid SQL syntax"
  
  // Next actions provide remediation
  result.nextActions.forEach(action => {
    console.log(`[${action.priority}] ${action.description}`);
    if (action.example) {
      console.log(`Example: ${action.example}`);
    }
  });
}
```

## Best Practices

### 1. Use Preflight Checks

```typescript
import { preflightSchemaOperation } from 'supa-agent-ops';

const preflight = await preflightSchemaOperation({
  operation: 'ddl',
  table: 'products',
  transport: 'pg'
});

if (!preflight.ok) {
  console.log('Issues:', preflight.issues);
  console.log('Recommendations:', preflight.recommendations);
  return;
}

// Proceed with operation
const result = await agentExecuteDDL({ ... });
```

### 2. Always Use Transactions for DDL

```typescript
await agentExecuteDDL({
  sql: multiStatementDDL,
  transaction: true  // Auto-rollback on error
});
```

### 3. Use Concurrent Index Creation

```typescript
// Non-blocking for production tables
await agentManageIndex({
  table: 'large_table',
  action: 'create',
  concurrent: true  // Doesn't lock table
});
```

### 4. Validate Before Executing

```typescript
// Test first
const dryRun = await agentExecuteDDL({
  sql: dangerousDDL,
  dryRun: true
});

if (dryRun.success && dryRun.warnings?.length === 0) {
  // Execute for real
  await agentExecuteDDL({
    sql: dangerousDDL,
    dryRun: false
  });
}
```

### 5. Monitor Execution Time

```typescript
const result = await agentIntrospectSchema({ table: 'large_table' });

if (result.executionTimeMs > 5000) {
  console.warn(`Slow introspection: ${result.executionTimeMs}ms`);
}
```

## Examples

### Complete Schema Analysis

```typescript
import { 
  agentIntrospectSchema, 
  agentManageIndex 
} from 'supa-agent-ops';

async function analyzeTable(tableName: string) {
  // Get full schema info
  const schema = await agentIntrospectSchema({
    table: tableName,
    includeColumns: true,
    includeIndexes: true,
    includeStats: true
  });
  
  if (!schema.success) return;
  
  const table = schema.tables[0];
  
  console.log(`Table: ${table.name}`);
  console.log(`Rows: ${table.rowCount.toLocaleString()}`);
  console.log(`Size: ${(table.sizeBytes! / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Indexes: ${table.indexes.length}`);
  
  // Suggest indexes for large tables
  if (table.rowCount > 10000 && table.indexes.length < 2) {
    console.log('⚠️  Consider adding indexes for performance');
  }
  
  // Check RLS
  if (!table.rlsEnabled) {
    console.log('⚠️  RLS is not enabled');
  }
}
```

### Safe Schema Migration

```typescript
import { 
  agentExecuteDDL, 
  preflightSchemaOperation 
} from 'supa-agent-ops';

async function safeMigration(ddlScript: string) {
  // 1. Preflight check
  const preflight = await preflightSchemaOperation({
    operation: 'ddl',
    transport: 'pg'
  });
  
  if (!preflight.ok) {
    console.error('Preflight failed:', preflight.issues);
    return false;
  }
  
  // 2. Dry run
  const dryRun = await agentExecuteDDL({
    sql: ddlScript,
    dryRun: true
  });
  
  if (!dryRun.success) {
    console.error('Validation failed:', dryRun.summary);
    return false;
  }
  
  // 3. Execute with transaction
  const result = await agentExecuteDDL({
    sql: ddlScript,
    transaction: true
  });
  
  if (result.success) {
    console.log('✓ Migration completed');
    console.log(`Affected: ${result.affectedObjects.join(', ')}`);
  }
  
  return result.success;
}
```

### Index Optimization

```typescript
import { agentManageIndex } from 'supa-agent-ops';

async function optimizeTable(tableName: string) {
  // List current indexes
  const current = await agentManageIndex({
    table: tableName,
    action: 'list'
  });
  
  console.log(`Current indexes: ${current.indexes.length}`);
  
  // Find unused indexes (requires monitoring)
  const unusedIndexes = current.indexes.filter(idx => 
    !idx.isPrimary && idx.sizeBytes! > 1024 * 1024 // > 1MB
  );
  
  // Drop unused indexes
  for (const idx of unusedIndexes) {
    console.log(`Dropping ${idx.name}...`);
    await agentManageIndex({
      table: tableName,
      action: 'drop',
      indexName: idx.name,
      concurrent: true
    });
  }
  
  // Create optimized indexes
  await agentManageIndex({
    table: tableName,
    action: 'create',
    indexName: `idx_${tableName}_optimized`,
    columns: ['status', 'created_at'],
    concurrent: true
  });
}
```

## Testing

Run the validation test suite:

```bash
# Build the library
npm run build

# Run schema operations tests
node test-schema-operations.js
```

The test suite validates:
- ✓ Preflight checks
- ✓ Schema introspection
- ✓ DDL execution (dry run and actual)
- ✓ Index management (list, create, drop)
- ✓ SQL execution (pg and RPC transports)
- ✓ RPC function execution
- ✓ Error handling

## Troubleshooting

### RPC Function Not Found

**Error**: `ERR_RPC_NOT_FOUND`

**Solution**: Create the `exec_sql` function (see [Prerequisites](#prerequisites))

### Permission Denied

**Error**: `ERR_SCHEMA_ACCESS_DENIED`

**Solution**: Use Service Role key, not anon key:
```bash
export SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Transaction Failed

**Error**: `ERR_TRANSACTION_FAILED`

**Solution**: Check SQL syntax and constraints. The transaction was auto-rolled back.

### Index Already Exists

**Error**: `ERR_INDEX_EXISTS`

**Solution**: Drop the existing index first or use `IF NOT EXISTS`:
```typescript
await agentManageIndex({
  table: 'mytable',
  action: 'drop',
  indexName: 'old_index'
});
```

## API Reference

See complete type definitions in `src/core/types.ts`:
- `SchemaIntrospectParams` / `SchemaIntrospectResult`
- `DDLExecuteParams` / `DDLExecuteResult`
- `IndexManageParams` / `IndexManageResult`
- `RPCExecuteParams` / `RPCExecuteResult`
- `SQLExecuteParams` / `SQLExecuteResult`

## Support

- [GitHub Issues](https://github.com/your-repo/supa-agent-ops/issues)
- [Documentation](./README.md)
- [Error Codes](./ERROR_CODES.md)

## Version History

**v1.1.0** - Schema Operations & RPC Foundation
- Added schema introspection
- Added DDL execution with transaction support
- Added index management
- Added RPC function execution
- Added raw SQL execution
- 7 new error codes with remediation

**v1.0.0** - Initial Release
- Import/upsert operations
- Character validation and sanitization
- Batch processing
- Error recovery system

