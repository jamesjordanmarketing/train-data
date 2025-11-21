# Supabase Agent Ops Library - CRUD Integration Execution Plan v1.0

**Generated**: 2025-11-12  
**Purpose**: Integrate advanced database operations from `src/scripts` into Supabase Agent Ops Library  
**Total Prompts**: 3  
**Estimated Implementation Time**: 45-60 hours  
**Source Specification**: `saol-CRUD-integration_v1.0.md`

---

## Executive Summary

This execution plan implements the integration of advanced database manipulation functionality from the **Supabase SQL Tools** (`src/scripts`) into the **Supabase Agent Ops Library** (`supa-agent-ops`). The integration provides AI agents with a unified, safe, and comprehensive interface for all Supabase database operations beyond the current basic CRUD capabilities.

### Current State
- **SAOL v1.0** provides: Insert/Upsert operations, character safety, error handling, preflight checks
- **src/scripts** contains: 56+ scripts with schema introspection, RPC execution, maintenance operations, verification tools

### Integration Goals
1. **Extend SAOL** with schema operations, RPC execution, advanced queries
2. **Maintain Backward Compatibility**: No breaking changes to v1.0 API
3. **Follow Established Patterns**: Consistent with existing service layer, error handling, type safety
4. **Agent-Friendly**: Clear JSDoc, prescriptive guidance, nextActions on results

### Key Deliverables
- Schema introspection and DDL execution functions
- RPC and raw SQL execution with transaction support
- Advanced query operations with filtering and aggregation
- Data export in multiple formats (JSONL, JSON, CSV, Markdown)
- Maintenance operations (VACUUM, ANALYZE, REINDEX)
- Table verification and integrity checking

---

## Architecture Overview

### Current SAOL Structure
```
supa-agent-ops/
├── src/
│   ├── core/ (types, config, client)
│   ├── operations/ (import, export, upsert, delete)
│   ├── validation/ (sanitize, normalize, schema)
│   ├── errors/ (codes, handlers, reports)
│   ├── preflight/ (checks)
│   └── utils/ (paths, logger, batch)
```

### Extended Structure (Post-Integration)
```
supa-agent-ops/
├── src/
│   ├── operations/
│   │   ├── import.ts ✅ (existing)
│   │   ├── export.ts 🆕 (data export)
│   │   ├── query.ts 🆕 (advanced queries)
│   │   ├── schema.ts 🆕 (introspection & DDL)
│   │   ├── rpc.ts 🆕 (RPC & raw SQL)
│   │   ├── maintenance.ts 🆕 (VACUUM/ANALYZE/REINDEX)
│   │   └── delete.ts 🆕 (safe delete)
│   ├── verification/
│   │   ├── structure.ts 🆕 (table verification)
│   │   └── integrity.ts 🆕 (data integrity)
```

### Type System Extensions
```typescript
export type OperationType = 
  | 'import'      // Existing
  | 'export'      // New
  | 'query'       // New
  | 'schema'      // New
  | 'rpc'         // New
  | 'maintenance' // New
  | 'delete';     // New

export interface AgentOperationResult {
  success: boolean;
  summary: string;
  operation: OperationType;
  data?: any;
  totals?: { processed: number; durationMs: number };
  reportPaths?: { summary: string; details?: string };
  nextActions: NextAction[];
}
```

---

## Implementation Prompts

### Prompt 1: Schema Operations & RPC Foundation

**Scope**: Implement schema introspection, DDL execution, index management, and RPC operations  
**Dependencies**: Existing SAOL v1.0 patterns, Supabase RPC `exec_sql` function  
**Estimated Time**: 18-22 hours  
**Risk Level**: Medium (RPC function dependency, DDL safety)

========================

You are a senior full-stack developer implementing the Schema Operations and RPC Foundation for the Supabase Agent Ops Library.

**CONTEXT:**

The Supabase Agent Ops Library currently provides basic CRUD operations (insert/upsert). This task extends it with:
1. Schema introspection - Query database structure programmatically
2. DDL execution - CREATE/ALTER/DROP operations with transaction safety
3. Index management - Create, drop, and analyze indexes
4. RPC execution - Call custom database functions and execute raw SQL

**BACKGROUND:**

Existing patterns in `src/scripts`:
- `get-full-schema.js` - Uses RPC to query information_schema
- `verify-e05-with-rpc.js` - Executes RPC functions for verification
- `execute-sql-direct.js` - Transaction-wrapped SQL execution
- `introspect-db-objects_v3.js` - Comprehensive schema analysis

SAOL patterns to follow:
- Service layer pattern from `src/operations/import.ts`
- Error handling from `src/errors/handlers.ts`
- Type safety from `src/core/types.ts`
- Preflight checks from `src/preflight/checks.ts`

**IMPLEMENTATION TASKS:**

**T-1.1: Create Schema Operations Module** (`src/operations/schema.ts`)

Implement these functions:

1. **`agentIntrospectSchema(params)`**
   - Query information_schema and pg_* catalogs via RPC
   - Return TableSchema[] with columns, indexes, constraints, policies, RLS status
   - Support: single table or all tables
   - Use RPC function: `exec_sql` with system catalog queries

```typescript
interface SchemaIntrospectParams {
  table?: string;
  includeColumns?: boolean;
  includeIndexes?: boolean;
  includeConstraints?: boolean;
  includePolicies?: boolean;
  includeStats?: boolean;
}

interface TableSchema {
  name: string;
  exists: boolean;
  rowCount: number;
  columns: ColumnInfo[];
  indexes: IndexInfo[];
  constraints: ConstraintInfo[];
  policies: PolicyInfo[];
  rlsEnabled: boolean;
}
```

2. **`agentExecuteDDL(params)`**
   - Execute DDL statements (CREATE, ALTER, DROP)
   - Transaction wrapping by default
   - Dry-run mode for validation
   - Warning for destructive operations (DROP, TRUNCATE)
   - Use pg client for transaction support

```typescript
interface DDLExecuteParams {
  sql: string;
  dryRun?: boolean;
  transaction?: boolean;
  validateOnly?: boolean;
}

interface DDLExecuteResult extends AgentOperationResult {
  executed: boolean;
  statements: number;
  affectedObjects: string[];
}
```

3. **`agentManageIndex(params)`**
   - Create, drop, or list indexes
   - CONCURRENTLY option for non-blocking creates
   - Index usage analysis

```typescript
interface IndexManageParams {
  table: string;
  action: 'create' | 'drop' | 'list';
  indexName?: string;
  columns?: string[];
  concurrent?: boolean;
  dryRun?: boolean;
}
```

**T-1.2: Create RPC Operations Module** (`src/operations/rpc.ts`)

Implement these functions:

1. **`agentExecuteRPC(params)`**
   - Execute custom RPC functions
   - Parameter validation
   - Timeout support

```typescript
interface RPCExecuteParams {
  functionName: string;
  params?: Record<string, any>;
  timeout?: number;
}

interface RPCExecuteResult extends AgentOperationResult {
  data: any;
  executionTimeMs: number;
}
```

2. **`agentExecuteSQL(params)`**
   - Execute raw SQL via RPC or pg client
   - Support for multi-statement batches
   - Transaction wrapping
   - Choose transport: 'rpc' (via exec_sql) or 'pg' (direct connection)

```typescript
interface SQLExecuteParams {
  sql: string;
  transport?: 'rpc' | 'pg';
  transaction?: boolean;
  dryRun?: boolean;
  timeout?: number;
}

interface SQLExecuteResult extends AgentOperationResult {
  rows?: any[];
  rowCount?: number;
  command?: string;
}
```

**T-1.3: Extend Error Handling**

Add new error codes to `src/errors/codes.ts`:

```typescript
export const NEW_ERROR_MAPPINGS: ErrorMapping[] = [
  {
    code: 'ERR_SCHEMA_ACCESS_DENIED',
    pgCode: '42501',
    patterns: ['permission denied for schema'],
    category: 'AUTH',
    description: 'Insufficient permissions to access schema',
    remediation: 'Use service role key or grant schema permissions',
    automatable: false
  },
  {
    code: 'ERR_RPC_NOT_FOUND',
    patterns: ['Could not find the function'],
    category: 'DB',
    description: 'RPC function does not exist',
    remediation: 'Create the RPC function in Supabase SQL Editor',
    example: 'CREATE OR REPLACE FUNCTION exec_sql(sql_script text) ...',
    automatable: true
  },
  {
    code: 'ERR_DDL_SYNTAX',
    pgCode: '42601',
    patterns: ['syntax error at or near'],
    category: 'VALIDATION',
    description: 'Invalid SQL syntax in DDL statement',
    remediation: 'Review and correct SQL syntax',
    automatable: false
  },
  {
    code: 'ERR_INDEX_EXISTS',
    pgCode: '42P07',
    patterns: ['already exists'],
    category: 'DB',
    description: 'Index already exists',
    remediation: 'Use DROP INDEX first or rename the index',
    automatable: true
  }
];
```

**T-1.4: Extend Preflight Checks**

Add to `src/preflight/checks.ts`:

```typescript
export async function preflightSchemaOperation(params: SchemaOperationParams) {
  const checks = [
    await checkEnvironmentVariables(),
    await checkServiceRoleKey(),
    await checkRPCExists('exec_sql'),
    await checkPermissions('schema_modify')
  ];
  
  const issues = checks.filter(c => !c.passed).map(c => c.recommendation);
  
  return {
    ok: issues.length === 0,
    issues: issues.map(i => i?.description || 'Unknown issue'),
    recommendations: issues
  };
}
```

**T-1.5: Update Type Definitions**

Add to `src/core/types.ts`:

```typescript
// Schema operation types
export type SchemaOperationType = 
  | 'introspect'
  | 'ddl'
  | 'index_create'
  | 'index_drop'
  | 'constraint_add'
  | 'constraint_drop';

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

export interface IndexInfo {
  name: string;
  table: string;
  columns: string[];
  isUnique: boolean;
  isPrimary: boolean;
  indexDef: string;
}

export interface ConstraintInfo {
  name: string;
  type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK';
  definition: string;
}

export interface PolicyInfo {
  name: string;
  command: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  roles: string[];
  definition: string;
}
```

**T-1.6: Update Index Exports**

Modify `src/index.ts`:

```typescript
// New exports (v1.1)
export { 
  agentIntrospectSchema, 
  agentExecuteDDL, 
  agentManageIndex 
} from './operations/schema';

export { 
  agentExecuteRPC, 
  agentExecuteSQL 
} from './operations/rpc';

export * from './core/types'; // Include new types
```

**ACCEPTANCE CRITERIA:**

1. **Schema Module**:
   - ✅ `agentIntrospectSchema()` queries tables, columns, indexes, constraints, policies
   - ✅ `agentExecuteDDL()` executes DDL with transaction wrapping and dry-run support
   - ✅ `agentManageIndex()` creates/drops/lists indexes with CONCURRENTLY option
   - ✅ All functions return `AgentOperationResult` with nextActions
   - ✅ Error handling uses established error mapping patterns
   - ✅ Preflight checks validate RPC function existence and permissions

2. **RPC Module**:
   - ✅ `agentExecuteRPC()` calls custom functions with parameter validation
   - ✅ `agentExecuteSQL()` supports both RPC and pg transport
   - ✅ Transaction wrapping for multi-statement SQL
   - ✅ Timeout support prevents hanging operations
   - ✅ Error handling provides recovery steps

3. **Error Handling**:
   - ✅ New error codes added with PG codes and patterns
   - ✅ Remediation steps specific and actionable
   - ✅ Automatable flag indicates if error can be auto-fixed
   - ✅ Consistent with existing error handling patterns

4. **Type Safety**:
   - ✅ All new types defined in `src/core/types.ts`
   - ✅ TypeScript strict mode passes with no errors
   - ✅ JSDoc comments on all public functions
   - ✅ Interface extends `AgentOperationResult` consistently

5. **Code Quality**:
   - ✅ Follows existing SAOL patterns (service layer, error handling)
   - ✅ Consistent naming conventions (camelCase for methods)
   - ✅ No console.log (only console.error for errors)
   - ✅ DRY principle applied (no duplicated logic)

**VALIDATION REQUIREMENTS:**

1. **Schema Introspection Test**:
```typescript
const result = await agentIntrospectSchema({ table: 'conversations' });
console.assert(result.success, 'Introspection succeeded');
console.assert(result.tables[0]?.exists, 'Table exists');
console.assert(result.tables[0]?.columns.length > 0, 'Columns returned');
```

2. **DDL Execution Test**:
```typescript
const result = await agentExecuteDDL({
  sql: 'CREATE TABLE test_table (id uuid PRIMARY KEY, name text);',
  transaction: true,
  dryRun: false
});
console.assert(result.success, 'DDL executed');
console.assert(result.executed, 'Statement was executed');
```

3. **Index Management Test**:
```typescript
const result = await agentManageIndex({
  table: 'conversations',
  action: 'create',
  indexName: 'idx_conversations_persona',
  columns: ['persona'],
  concurrent: true
});
console.assert(result.success, 'Index created');
```

4. **RPC Execution Test**:
```typescript
const result = await agentExecuteRPC({
  functionName: 'exec_sql',
  params: { sql_script: 'SELECT COUNT(*) FROM conversations;' }
});
console.assert(result.success, 'RPC executed');
console.assert(result.data, 'Data returned');
```

5. **SQL Execution Test**:
```typescript
const result = await agentExecuteSQL({
  sql: 'SELECT * FROM conversations LIMIT 5;',
  transport: 'rpc'
});
console.assert(result.success, 'SQL executed');
console.assert(result.rows, 'Rows returned');
```

**DELIVERABLES:**

1. **Source Files**:
   - ✅ `src/operations/schema.ts` - Schema operations module
   - ✅ `src/operations/rpc.ts` - RPC operations module
   - ✅ Updated `src/errors/codes.ts` - New error codes
   - ✅ Updated `src/preflight/checks.ts` - Schema preflight checks
   - ✅ Updated `src/core/types.ts` - New type definitions
   - ✅ Updated `src/index.ts` - Export new functions

2. **Documentation**:
   - ✅ JSDoc comments on all public methods
   - ✅ Inline comments explaining complex logic
   - ✅ README section documenting new operations (optional)

3. **Testing Evidence**:
   - ✅ Manual test script results
   - ✅ Console output demonstrating all functions work
   - ✅ Error handling test results

**TECHNICAL NOTES:**

**RPC Function Requirement:**
The library requires this RPC function in Supabase (create in SQL Editor):

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

**Transaction Handling Pattern:**
```typescript
async function executeWithTransaction(
  operation: () => Promise<any>,
  useTransaction: boolean = true
) {
  if (!useTransaction) {
    return await operation();
  }
  
  const client = await getPgClient();
  try {
    await client.query('BEGIN');
    const result = await operation();
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
```

Implement these schema and RPC operations completely, ensuring all acceptance criteria are met and the implementation follows established SAOL patterns.

++++++++++++++++++


### Prompt 2: Advanced Query & Export Operations

**Scope**: Implement advanced query operations, data export in multiple formats, and safe delete operations  
**Dependencies**: Prompt 1 (RPC foundation), existing SAOL import patterns  
**Estimated Time**: 16-20 hours  
**Risk Level**: Medium (CSV escaping, large file handling)

========================

You are a senior full-stack developer implementing Advanced Query and Export Operations for the Supabase Agent Ops Library.

**CONTEXT:**

Building upon the schema and RPC foundation from Prompt 1, this task implements:
1. Advanced query operations - Complex filtering, aggregation, pagination
2. Data export - Transform data to JSONL, JSON, CSV, Markdown formats
3. Safe delete operations - With dry-run, confirmation, cascade handling

**BACKGROUND:**

Existing patterns in `src/scripts`:
- `cursor-db-helper.js` - Query interface with filtering
- `convert-to-dollar-quoting.js` - SQL generation with character safety
- Various export scripts generating JSON and SQL formats

SAOL patterns:
- Transformer pattern for format-specific operations
- Character safety from `src/validation/sanitize.ts`
- Error handling and reporting patterns

**IMPLEMENTATION TASKS:**

**T-2.1: Create Query Operations Module** (`src/operations/query.ts`)

Implement these functions:

1. **`agentQuery(params)`**
   - Advanced SELECT queries with filtering and pagination
   - Support for joins, aggregations, ordering
   - Count queries with filters

```typescript
interface QueryParams {
  table: string;
  select?: string[];
  where?: QueryFilter[];
  orderBy?: OrderSpec[];
  limit?: number;
  offset?: number;
  count?: boolean;
  aggregate?: AggregateSpec[];
}

interface QueryFilter {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'is';
  value: any;
}

interface QueryResult extends AgentOperationResult {
  data: any[];
  count?: number;
  aggregates?: Record<string, any>;
}
```

2. **`agentCount(params)`**
   - Optimized count queries
   - Support for distinct counts
   - Filtering support

```typescript
interface CountParams {
  table: string;
  where?: QueryFilter[];
  distinct?: string;
}

interface CountResult extends AgentOperationResult {
  count: number;
}
```

**T-2.2: Create Export Operations Module** (`src/operations/export.ts`)

Implement IExportTransformer interface and format transformers:

1. **Interface Definition**:
```typescript
export interface IExportTransformer {
  transform(
    conversations: any[],
    config: ExportConfig
  ): Promise<string>;
  
  validateOutput(output: string): boolean;
  getFileExtension(): string;
  getMimeType(): string;
}

export interface ExportConfig {
  format: 'json' | 'jsonl' | 'csv' | 'markdown';
  includeMetadata: boolean;
  includeTimestamps: boolean;
  filters?: QueryFilter[];
}
```

2. **JSONL Transformer** - For LoRA training format:
```typescript
export class JSONLTransformer implements IExportTransformer {
  async transform(data: any[], config: ExportConfig): Promise<string> {
    const lines = data.map(record => JSON.stringify(record));
    return lines.join('\n');
  }
  
  validateOutput(output: string): boolean {
    const lines = output.split('\n').filter(l => l.trim());
    return lines.every(line => {
      try {
        JSON.parse(line);
        return true;
      } catch {
        return false;
      }
    });
  }
  
  getFileExtension() { return 'jsonl'; }
  getMimeType() { return 'application/x-ndjson'; }
}
```

3. **JSON Transformer** - Structured export:
```typescript
export class JSONTransformer implements IExportTransformer {
  async transform(data: any[], config: ExportConfig): Promise<string> {
    const exportObj = {
      version: '1.0',
      export_date: new Date().toISOString(),
      count: data.length,
      data: data
    };
    return JSON.stringify(exportObj, null, 2);
  }
  
  validateOutput(output: string): boolean {
    try {
      const parsed = JSON.parse(output);
      return parsed.version && parsed.data && Array.isArray(parsed.data);
    } catch {
      return false;
    }
  }
  
  getFileExtension() { return 'json'; }
  getMimeType() { return 'application/json'; }
}
```

4. **CSV Transformer** - Excel-compatible:
```typescript
export class CSVTransformer implements IExportTransformer {
  async transform(data: any[], config: ExportConfig): Promise<string> {
    const csvStringify = require('csv-stringify/sync').stringify;
    
    // Add UTF-8 BOM for Excel compatibility
    const bom = '\uFEFF';
    const csv = csvStringify(data, {
      header: true,
      quoted: true,
      escape: '"',
      record_delimiter: '\n'
    });
    
    return bom + csv;
  }
  
  validateOutput(output: string): boolean {
    return output.startsWith('\uFEFF') && output.includes('\n');
  }
  
  getFileExtension() { return 'csv'; }
  getMimeType() { return 'text/csv'; }
}
```

5. **Markdown Transformer** - Human-readable:
```typescript
export class MarkdownTransformer implements IExportTransformer {
  async transform(data: any[], config: ExportConfig): Promise<string> {
    let md = `# Data Export\n\n`;
    md += `**Exported**: ${new Date().toISOString()}\n`;
    md += `**Records**: ${data.length}\n\n`;
    md += `---\n\n`;
    
    data.forEach((record, idx) => {
      md += `## Record ${idx + 1}\n\n`;
      md += '```json\n';
      md += JSON.stringify(record, null, 2);
      md += '\n```\n\n';
    });
    
    return md;
  }
  
  validateOutput(output: string): boolean {
    return output.includes('# Data Export') && output.includes('```json');
  }
  
  getFileExtension() { return 'md'; }
  getMimeType() { return 'text/markdown'; }
}
```

6. **Factory Function**:
```typescript
export function getTransformer(format: ExportConfig['format']): IExportTransformer {
  switch (format) {
    case 'jsonl': return new JSONLTransformer();
    case 'json': return new JSONTransformer();
    case 'csv': return new CSVTransformer();
    case 'markdown': return new MarkdownTransformer();
    default: throw new Error(`Unknown export format: ${format}`);
  }
}
```

7. **Main Export Function**:
```typescript
export async function agentExportData(params: ExportParams): Promise<ExportResult> {
  // 1. Query data with filters
  const queryResult = await agentQuery({
    table: params.table,
    where: params.filters,
    select: params.columns
  });
  
  // 2. Get transformer for format
  const transformer = getTransformer(params.config.format);
  
  // 3. Transform data
  const output = await transformer.transform(queryResult.data, params.config);
  
  // 4. Validate output
  const isValid = transformer.validateOutput(output);
  if (!isValid) {
    throw new Error('Export validation failed');
  }
  
  // 5. Write to file
  if (params.destination) {
    await fs.promises.writeFile(params.destination, output, 'utf8');
  }
  
  return {
    success: true,
    summary: `Exported ${queryResult.data.length} records to ${params.config.format}`,
    operation: 'export',
    data: { recordCount: queryResult.data.length, fileSize: output.length },
    nextActions: []
  };
}
```

**T-2.3: Create Delete Operations Module** (`src/operations/delete.ts`)

Implement safe delete with confirmation:

```typescript
interface DeleteParams {
  table: string;
  where: QueryFilter[];
  cascade?: boolean;
  dryRun?: boolean;
  confirm?: boolean;
}

interface DeleteResult extends AgentOperationResult {
  deletedCount: number;
  affectedTables?: string[];
  previewRecords?: any[];
}

export async function agentDelete(params: DeleteParams): Promise<DeleteResult> {
  // 1. Preflight: Require where clause
  if (!params.where || params.where.length === 0) {
    throw new Error('WHERE clause required for delete operations (safety measure)');
  }
  
  // 2. Dry-run: Preview what would be deleted
  if (params.dryRun) {
    const preview = await agentQuery({
      table: params.table,
      where: params.where
    });
    
    return {
      success: true,
      summary: `Would delete ${preview.data.length} records (dry-run)`,
      operation: 'delete',
      deletedCount: 0,
      previewRecords: preview.data,
      nextActions: [{
        action: 'CONFIRM_DELETE',
        description: 'Run with confirm: true to execute deletion',
        priority: 'HIGH'
      }]
    };
  }
  
  // 3. Require confirmation
  if (!params.confirm) {
    throw new Error('confirm: true required to execute delete (safety measure)');
  }
  
  // 4. Execute delete
  let query = supabase.from(params.table).delete();
  for (const filter of params.where) {
    query = query.eq(filter.column, filter.value);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw error;
  }
  
  return {
    success: true,
    summary: `Deleted ${data?.length || 0} records from ${params.table}`,
    operation: 'delete',
    deletedCount: data?.length || 0,
    nextActions: []
  };
}
```

**T-2.4: Update Type Definitions**

Add to `src/core/types.ts`:

```typescript
// Query operation types
export interface OrderSpec {
  column: string;
  asc: boolean;
}

export interface AggregateSpec {
  function: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX';
  column: string;
  alias?: string;
}

// Export operation types
export interface ExportParams {
  table: string;
  destination?: string;
  config: ExportConfig;
  filters?: QueryFilter[];
  columns?: string[];
}

export interface ExportResult extends AgentOperationResult {
  recordCount: number;
  fileSize: number;
  filePath?: string;
}
```

**T-2.5: Update Index Exports**

Modify `src/index.ts`:

```typescript
// New exports for Prompt 2
export { 
  agentQuery, 
  agentCount 
} from './operations/query';

export { 
  agentExportData,
  getTransformer,
  IExportTransformer 
} from './operations/export';

export { 
  agentDelete 
} from './operations/delete';
```

**ACCEPTANCE CRITERIA:**

1. **Query Module**:
   - ✅ `agentQuery()` supports filtering, ordering, pagination
   - ✅ `agentCount()` provides optimized count queries
   - ✅ All operators work correctly (eq, gt, like, in, etc.)
   - ✅ Aggregations return correct results
   - ✅ Error handling provides recovery steps

2. **Export Module**:
   - ✅ All 4 format transformers implemented (JSONL, JSON, CSV, Markdown)
   - ✅ JSONL format compatible with OpenAI/Anthropic training
   - ✅ CSV format imports correctly into Excel with UTF-8 BOM
   - ✅ JSON format pretty-printed with metadata
   - ✅ Markdown format human-readable
   - ✅ Validation catches malformed output
   - ✅ Special characters handled correctly in all formats

3. **Delete Module**:
   - ✅ Requires WHERE clause (safety)
   - ✅ Dry-run shows preview of affected records
   - ✅ Requires explicit confirmation
   - ✅ Error handling prevents accidental deletes
   - ✅ Returns deleted count and summary

4. **Type Safety**:
   - ✅ All types defined consistently
   - ✅ TypeScript strict mode passes
   - ✅ JSDoc comments on all functions

**VALIDATION REQUIREMENTS:**

1. **Query Test**:
```typescript
const result = await agentQuery({
  table: 'conversations',
  where: [{ column: 'status', operator: 'eq', value: 'approved' }],
  orderBy: [{ column: 'created_at', asc: false }],
  limit: 10
});
console.assert(result.success);
console.assert(result.data.length <= 10);
```

2. **Count Test**:
```typescript
const result = await agentCount({
  table: 'conversations',
  where: [{ column: 'tier', operator: 'eq', value: 'template' }]
});
console.assert(result.success);
console.assert(typeof result.count === 'number');
```

3. **Export Tests** - For each format:
```typescript
// JSONL
const jsonlResult = await agentExportData({
  table: 'conversations',
  destination: './test-export.jsonl',
  config: { format: 'jsonl', includeMetadata: true }
});
console.assert(jsonlResult.success);
const jsonlContent = fs.readFileSync('./test-export.jsonl', 'utf8');
console.assert(jsonlContent.split('\n').every(line => {
  try { JSON.parse(line); return true; } catch { return false; }
}));

// CSV - Test Excel compatibility
const csvResult = await agentExportData({
  table: 'conversations',
  destination: './test-export.csv',
  config: { format: 'csv' }
});
const csvContent = fs.readFileSync('./test-export.csv', 'utf8');
console.assert(csvContent.startsWith('\uFEFF')); // UTF-8 BOM
```

4. **Delete Test**:
```typescript
// Dry-run first
const dryRun = await agentDelete({
  table: 'test_table',
  where: [{ column: 'id', operator: 'eq', value: 'test-id' }],
  dryRun: true
});
console.assert(dryRun.previewRecords);
console.assert(dryRun.deletedCount === 0);

// Actual delete with confirmation
const deleteResult = await agentDelete({
  table: 'test_table',
  where: [{ column: 'id', operator: 'eq', value: 'test-id' }],
  confirm: true
});
console.assert(deleteResult.success);
```

5. **Special Characters Test** - CSV escaping:
```typescript
const data = [
  { id: '1', text: "don't worry", note: 'He said "hello"' },
  { id: '2', text: 'Line 1\nLine 2', note: 'Col1,Col2' }
];

const transformer = new CSVTransformer();
const csv = await transformer.transform(data, {});
console.assert(transformer.validateOutput(csv));
// Import into Excel and verify no formatting issues
```

**DELIVERABLES:**

1. **Source Files**:
   - ✅ `src/operations/query.ts`
   - ✅ `src/operations/export.ts` with all transformers
   - ✅ `src/operations/delete.ts`
   - ✅ Updated `src/core/types.ts`
   - ✅ Updated `src/index.ts`

2. **Documentation**:
   - ✅ JSDoc comments on all public methods
   - ✅ Format specifications in comments (OpenAI JSONL format)
   - ✅ CSV escaping documentation

3. **Testing Evidence**:
   - ✅ Sample exports in all 4 formats
   - ✅ Excel screenshot showing CSV import works
   - ✅ Query and delete test results

**TECHNICAL NOTES:**

**CSV Dependency:**
Install csv-stringify:
```bash
npm install csv-stringify
```

**Character Safety:**
Use existing sanitization from `src/validation/sanitize.ts` for all text fields before export.

**Large Dataset Handling:**
For exports >1000 records, consider streaming:
```typescript
// Future enhancement - streaming export
for await (const batch of queryBatches(params)) {
  const transformed = await transformer.transform(batch, config);
  await appendToFile(destination, transformed);
}
```

Implement these query and export operations completely, ensuring all acceptance criteria are met.

++++++++++++++++++


### Prompt 3: Maintenance & Verification Operations

**Scope**: Implement VACUUM/ANALYZE/REINDEX operations and table verification tools  
**Dependencies**: Prompts 1-2 (Schema and query operations), pg client for maintenance  
**Estimated Time**: 11-15 hours  
**Risk Level**: Low (read-heavy operations, well-defined patterns)

========================

You are a senior full-stack developer implementing Maintenance and Verification Operations for the Supabase Agent Ops Library.

**CONTEXT:**

Completing the SAOL integration, this task implements:
1. Maintenance operations - VACUUM, ANALYZE, REINDEX for database health
2. Verification operations - Table structure validation and integrity checks
3. Performance monitoring - Index usage analysis and query optimization

**BACKGROUND:**

Existing patterns in `src/scripts`:
- `complete-db-audit.js` - Comprehensive database analysis
- `deep-db-analysis.js` - Performance metrics and recommendations
- `verify-e05-complete.js` - Table structure verification

**IMPLEMENTATION TASKS:**

**T-3.1: Create Maintenance Operations Module** (`src/operations/maintenance.ts`)

Implement these functions:

1. **`agentVacuum(params)`**
   - VACUUM operations to reclaim space
   - ANALYZE option to update statistics
   - FULL option with locking warning

```typescript
interface VacuumParams {
  table?: string;
  full?: boolean;
  analyze?: boolean;
  dryRun?: boolean;
}

interface VacuumResult extends AgentOperationResult {
  tablesProcessed: string[];
  spaceReclaimed?: number;
}

export async function agentVacuum(params: VacuumParams): Promise<VacuumResult> {
  // Build VACUUM command
  let sql = 'VACUUM';
  if (params.full) {
    sql += ' FULL';
    // Add warning in nextActions about table locking
  }
  if (params.analyze) {
    sql += ' ANALYZE';
  }
  if (params.table) {
    sql += ` ${params.table}`;
  }
  
  if (params.dryRun) {
    return {
      success: true,
      summary: `Would execute: ${sql}`,
      operation: 'maintenance',
      nextActions: params.full ? [{
        action: 'REVIEW_VACUUM_FULL',
        description: 'VACUUM FULL locks the table. Run during low-traffic period.',
        priority: 'HIGH'
      }] : []
    };
  }
  
  // Execute via pg client (VACUUM cannot run in transaction)
  const result = await agentExecuteSQL({ 
    sql, 
    transport: 'pg',
    transaction: false 
  });
  
  return {
    success: result.success,
    summary: `VACUUM completed for ${params.table || 'all tables'}`,
    operation: 'maintenance',
    tablesProcessed: params.table ? [params.table] : ['all'],
    nextActions: []
  };
}
```

2. **`agentAnalyze(params)`**
   - Update statistics for query planner
   - Target specific tables or columns

```typescript
interface AnalyzeParams {
  table?: string;
  columns?: string[];
}

export async function agentAnalyze(params: AnalyzeParams): Promise<AgentOperationResult> {
  let sql = 'ANALYZE';
  if (params.table) {
    sql += ` ${params.table}`;
    if (params.columns && params.columns.length > 0) {
      sql += ` (${params.columns.join(', ')})`;
    }
  }
  
  const result = await agentExecuteSQL({ sql, transport: 'pg' });
  
  return {
    success: result.success,
    summary: `ANALYZE completed for ${params.table || 'all tables'}`,
    operation: 'maintenance',
    nextActions: []
  };
}
```

3. **`agentReindex(params)`**
   - Rebuild indexes
   - CONCURRENTLY option for non-blocking

```typescript
interface ReindexParams {
  target: 'table' | 'index' | 'schema';
  name: string;
  concurrent?: boolean;
}

export async function agentReindex(params: ReindexParams): Promise<AgentOperationResult> {
  let sql = 'REINDEX';
  if (params.concurrent) {
    sql += ' CONCURRENTLY';
  }
  sql += ` ${params.target.toUpperCase()} ${params.name}`;
  
  const result = await agentExecuteSQL({ sql, transport: 'pg' });
  
  return {
    success: result.success,
    summary: `REINDEX completed for ${params.target} ${params.name}`,
    operation: 'maintenance',
    nextActions: []
  };
}
```

**T-3.2: Create Verification Module** (`src/verification/structure.ts`)

Implement table verification:

```typescript
interface TableVerifyParams {
  table: string;
  expectedColumns?: ColumnSpec[];
  expectedIndexes?: string[];
  expectedConstraints?: ConstraintSpec[];
  generateFixSQL?: boolean;
}

interface ColumnSpec {
  name: string;
  type: string;
  required?: boolean;
}

interface ConstraintSpec {
  name: string;
  type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK';
  columns: string[];
}

interface TableVerifyResult extends AgentOperationResult {
  exists: boolean;
  issues: VerificationIssue[];
  fixSQL?: string;
  category: 1 | 2 | 3 | 4; // 1=OK, 2=Warning, 3=Critical, 4=Blocking
  canProceed: boolean;
}

interface VerificationIssue {
  type: 'missing_column' | 'missing_index' | 'missing_constraint' | 'type_mismatch';
  severity: 'warning' | 'error' | 'critical';
  description: string;
  fixSQL?: string;
}

export async function agentVerifyTable(params: TableVerifyParams): Promise<TableVerifyResult> {
  // 1. Get actual schema
  const schemaResult = await agentIntrospectSchema({ table: params.table });
  
  if (!schemaResult.tables[0]?.exists) {
    return {
      success: false,
      summary: `Table ${params.table} does not exist`,
      operation: 'verification',
      exists: false,
      issues: [{
        type: 'missing_table',
        severity: 'critical',
        description: `Table ${params.table} does not exist`,
        fixSQL: params.generateFixSQL ? generateCreateTableSQL(params) : undefined
      }],
      category: 4,
      canProceed: false,
      nextActions: [{
        action: 'CREATE_TABLE',
        description: `Create table ${params.table}`,
        priority: 'HIGH'
      }]
    };
  }
  
  const actualSchema = schemaResult.tables[0];
  const issues: VerificationIssue[] = [];
  
  // 2. Verify columns
  if (params.expectedColumns) {
    for (const expectedCol of params.expectedColumns) {
      const actualCol = actualSchema.columns.find(c => c.name === expectedCol.name);
      
      if (!actualCol) {
        issues.push({
          type: 'missing_column',
          severity: expectedCol.required ? 'critical' : 'warning',
          description: `Missing column: ${expectedCol.name}`,
          fixSQL: `ALTER TABLE ${params.table} ADD COLUMN ${expectedCol.name} ${expectedCol.type};`
        });
      } else if (actualCol.type !== expectedCol.type) {
        issues.push({
          type: 'type_mismatch',
          severity: 'error',
          description: `Column ${expectedCol.name} type mismatch: expected ${expectedCol.type}, got ${actualCol.type}`,
          fixSQL: `ALTER TABLE ${params.table} ALTER COLUMN ${expectedCol.name} TYPE ${expectedCol.type};`
        });
      }
    }
  }
  
  // 3. Verify indexes
  if (params.expectedIndexes) {
    for (const expectedIdx of params.expectedIndexes) {
      const actualIdx = actualSchema.indexes.find(idx => idx.name === expectedIdx);
      
      if (!actualIdx) {
        issues.push({
          type: 'missing_index',
          severity: 'warning',
          description: `Missing index: ${expectedIdx}`,
          fixSQL: `CREATE INDEX ${expectedIdx} ON ${params.table} (...);`
        });
      }
    }
  }
  
  // 4. Determine category
  const hasCritical = issues.some(i => i.severity === 'critical');
  const hasError = issues.some(i => i.severity === 'error');
  const hasWarning = issues.some(i => i.severity === 'warning');
  
  const category = hasCritical ? 4 : hasError ? 3 : hasWarning ? 2 : 1;
  const canProceed = category <= 2;
  
  // 5. Generate fix SQL if requested
  let fixSQL: string | undefined;
  if (params.generateFixSQL && issues.length > 0) {
    fixSQL = issues
      .filter(i => i.fixSQL)
      .map(i => i.fixSQL)
      .join('\n');
  }
  
  return {
    success: issues.length === 0,
    summary: issues.length === 0 
      ? `Table ${params.table} verification passed`
      : `Found ${issues.length} issues in table ${params.table}`,
    operation: 'verification',
    exists: true,
    issues,
    fixSQL,
    category,
    canProceed,
    nextActions: issues.length > 0 ? [{
      action: 'APPLY_FIX_SQL',
      description: 'Apply generated fix SQL to resolve issues',
      priority: category >= 3 ? 'HIGH' : 'MEDIUM',
      example: fixSQL
    }] : []
  };
}
```

**T-3.3: Create Performance Monitoring** (`src/verification/performance.ts`)

```typescript
interface IndexUsageParams {
  table?: string;
  minScans?: number;
}

interface IndexUsageResult extends AgentOperationResult {
  indexes: IndexUsageInfo[];
  recommendations: string[];
}

interface IndexUsageInfo {
  tableName: string;
  indexName: string;
  scans: number;
  tuplesRead: number;
  tuplesReturned: number;
  sizeBytes: number;
  unused: boolean;
}

export async function agentAnalyzeIndexUsage(params: IndexUsageParams): Promise<IndexUsageResult> {
  // Query pg_stat_user_indexes
  const sql = `
    SELECT 
      schemaname,
      tablename,
      indexname,
      idx_scan AS scans,
      idx_tup_read AS tuples_read,
      idx_tup_fetch AS tuples_returned,
      pg_relation_size(indexrelid) AS size_bytes
    FROM pg_stat_user_indexes
    WHERE idx_scan < $1
    ${params.table ? `AND tablename = '${params.table}'` : ''}
    ORDER BY idx_scan ASC, size_bytes DESC;
  `;
  
  const result = await agentExecuteSQL({ 
    sql: sql.replace('$1', String(params.minScans || 100)),
    transport: 'rpc'
  });
  
  const indexes: IndexUsageInfo[] = result.rows?.map(row => ({
    tableName: row.tablename,
    indexName: row.indexname,
    scans: row.scans,
    tuplesRead: row.tuples_read,
    tuplesReturned: row.tuples_returned,
    sizeBytes: row.size_bytes,
    unused: row.scans === 0
  })) || [];
  
  // Generate recommendations
  const recommendations: string[] = [];
  const unusedIndexes = indexes.filter(idx => idx.unused && idx.sizeBytes > 1000000);
  
  if (unusedIndexes.length > 0) {
    recommendations.push(
      `Found ${unusedIndexes.length} unused indexes consuming ${formatBytes(
        unusedIndexes.reduce((sum, idx) => sum + idx.sizeBytes, 0)
      )}. Consider dropping them.`
    );
  }
  
  return {
    success: true,
    summary: `Analyzed ${indexes.length} indexes`,
    operation: 'performance',
    indexes,
    recommendations,
    nextActions: recommendations.map(rec => ({
      action: 'REVIEW_INDEX_USAGE',
      description: rec,
      priority: 'MEDIUM'
    }))
  };
}
```

**T-3.4: Update Type Definitions**

Add to `src/core/types.ts`:

```typescript
// Maintenance operation types
export interface MaintenanceParams {
  operation: 'vacuum' | 'analyze' | 'reindex';
  target?: string;
  options?: Record<string, any>;
}

// Verification types
export interface VerificationIssue {
  type: string;
  severity: 'warning' | 'error' | 'critical';
  description: string;
  fixSQL?: string;
}

// Performance types
export interface IndexUsageInfo {
  tableName: string;
  indexName: string;
  scans: number;
  tuplesRead: number;
  tuplesReturned: number;
  sizeBytes: number;
  unused: boolean;
}
```

**T-3.5: Update Index Exports**

Modify `src/index.ts`:

```typescript
// New exports for Prompt 3
export { 
  agentVacuum, 
  agentAnalyze, 
  agentReindex 
} from './operations/maintenance';

export { 
  agentVerifyTable 
} from './verification/structure';

export { 
  agentAnalyzeIndexUsage 
} from './verification/performance';
```

**T-3.6: Update Documentation**

Create `MAINTENANCE_GUIDE.md`:

```markdown
# Maintenance Operations Guide

## VACUUM

Reclaims storage occupied by dead tuples.

### When to Run
- After large DELETE/UPDATE operations
- Weekly maintenance window
- When bloat is detected

### Usage
```typescript
await agentVacuum({ 
  table: 'conversations',
  analyze: true 
});
```

### VACUUM FULL Warning
VACUUM FULL requires exclusive table lock. Only run during maintenance windows.

## ANALYZE

Updates table statistics for query planner optimization.

### When to Run
- After bulk INSERT/UPDATE
- After significant data changes
- Before complex queries

### Usage
```typescript
await agentAnalyze({ table: 'conversations' });
```

## REINDEX

Rebuilds indexes to reclaim space and fix corruption.

### When to Run
- Suspected index corruption
- Index bloat detected
- Performance degradation

### Usage
```typescript
await agentReindex({
  target: 'table',
  name: 'conversations',
  concurrent: true
});
```
```

**ACCEPTANCE CRITERIA:**

1. **Maintenance Module**:
   - ✅ `agentVacuum()` executes VACUUM with ANALYZE option
   - ✅ Warns about VACUUM FULL locking
   - ✅ `agentAnalyze()` updates statistics for specific tables/columns
   - ✅ `agentReindex()` rebuilds indexes with CONCURRENTLY option
   - ✅ All operations use pg transport (not RPC)
   - ✅ Error handling provides recovery steps

2. **Verification Module**:
   - ✅ `agentVerifyTable()` compares actual vs expected schema
   - ✅ Identifies missing columns, indexes, constraints
   - ✅ Detects type mismatches
   - ✅ Generates fix SQL automatically
   - ✅ Categorizes issues (1=OK, 2=Warning, 3=Critical, 4=Blocking)
   - ✅ Returns canProceed flag for workflow decisions

3. **Performance Module**:
   - ✅ `agentAnalyzeIndexUsage()` queries pg_stat_user_indexes
   - ✅ Identifies unused indexes
   - ✅ Calculates space consumption
   - ✅ Provides actionable recommendations
   - ✅ Supports filtering by table

4. **Documentation**:
   - ✅ MAINTENANCE_GUIDE.md created with best practices
   - ✅ JSDoc comments on all functions
   - ✅ Usage examples for each operation

**VALIDATION REQUIREMENTS:**

1. **VACUUM Test**:
```typescript
const result = await agentVacuum({
  table: 'test_table',
  analyze: true,
  dryRun: false
});
console.assert(result.success);
console.assert(result.tablesProcessed.includes('test_table'));
```

2. **ANALYZE Test**:
```typescript
const result = await agentAnalyze({
  table: 'conversations',
  columns: ['persona', 'status']
});
console.assert(result.success);
```

3. **REINDEX Test**:
```typescript
const result = await agentReindex({
  target: 'table',
  name: 'conversations',
  concurrent: true
});
console.assert(result.success);
```

4. **Verification Test**:
```typescript
const result = await agentVerifyTable({
  table: 'conversations',
  expectedColumns: [
    { name: 'id', type: 'uuid', required: true },
    { name: 'persona', type: 'text', required: true },
    { name: 'parameters', type: 'jsonb' }
  ],
  generateFixSQL: true
});
console.assert(result.exists);
console.assert(result.category <= 2); // OK or Warning
```

5. **Index Usage Test**:
```typescript
const result = await agentAnalyzeIndexUsage({
  table: 'conversations',
  minScans: 10
});
console.assert(result.success);
console.assert(Array.isArray(result.indexes));
console.assert(Array.isArray(result.recommendations));
```

**DELIVERABLES:**

1. **Source Files**:
   - ✅ `src/operations/maintenance.ts`
   - ✅ `src/verification/structure.ts`
   - ✅ `src/verification/performance.ts`
   - ✅ Updated `src/core/types.ts`
   - ✅ Updated `src/index.ts`

2. **Documentation**:
   - ✅ `MAINTENANCE_GUIDE.md`
   - ✅ JSDoc comments on all functions
   - ✅ Updated README.md with new operations

3. **Testing Evidence**:
   - ✅ Manual test results for all operations
   - ✅ Verification test showing issue detection and fix SQL generation
   - ✅ Index usage analysis results

**TECHNICAL NOTES:**

**VACUUM Limitations:**
VACUUM cannot run inside a transaction block. Always use `transaction: false` when calling via agentExecuteSQL.

**Index Usage Query Permissions:**
Querying pg_stat_user_indexes requires SELECT permissions on system catalogs. Ensure service role has necessary grants.

**REINDEX CONCURRENTLY:**
Requires PostgreSQL 12+. Check version before using concurrent option.

Implement these maintenance and verification operations completely, ensuring all acceptance criteria are met and the SAOL integration is production-ready.

++++++++++++++++++


---

## Quality Validation Checklist

### Post-Implementation Verification

After completing all 3 prompts, verify the following:

#### Functional Completeness
- [ ] **Schema Operations**: Introspection, DDL execution, index management implemented
- [ ] **RPC Operations**: Custom function calls and raw SQL execution working
- [ ] **Query Operations**: Advanced filtering, ordering, pagination, aggregation functional
- [ ] **Export Operations**: All 4 formats (JSONL, JSON, CSV, Markdown) generate valid output
- [ ] **Delete Operations**: Safe delete with dry-run and confirmation implemented
- [ ] **Maintenance Operations**: VACUUM, ANALYZE, REINDEX working
- [ ] **Verification Operations**: Table structure verification and integrity checks complete

#### Integration Verification
- [ ] **Backward Compatibility**: All v1.0 functions (agentImportTool, agentPreflight) still work
- [ ] **Type Consistency**: All new types in src/core/types.ts, no conflicts
- [ ] **Error Handling**: New error codes integrated with existing mapDatabaseError
- [ ] **Preflight Checks**: New operations have corresponding preflight validations
- [ ] **Export Module**: All functions exported from src/index.ts

#### Code Quality Standards
- [ ] **TypeScript**: All code type-checks with strict mode enabled
- [ ] **Error Handling**: Try-catch blocks in all async operations
- [ ] **Logging**: Structured logging for debugging (console.error only)
- [ ] **Documentation**: JSDoc comments on all public methods
- [ ] **Testing**: Manual test evidence for all major functions

#### Security Considerations
- [ ] **Service Role**: All operations use SUPABASE_SERVICE_ROLE_KEY
- [ ] **SQL Injection**: Parameterized queries used throughout
- [ ] **Transaction Safety**: DDL operations wrapped in transactions
- [ ] **Delete Safety**: WHERE clause and confirmation required
- [ ] **Permission Checks**: Preflight validates necessary permissions

---

## Testing Strategy

### Manual Test Suite

**Test 1: Schema Introspection**
```bash
node -e "
const { agentIntrospectSchema } = require('supa-agent-ops');
(async () => {
  const result = await agentIntrospectSchema({ table: 'conversations' });
  console.log(JSON.stringify(result, null, 2));
})();
"
```

**Test 2: DDL Execution**
```bash
node -e "
const { agentExecuteDDL } = require('supa-agent-ops');
(async () => {
  const result = await agentExecuteDDL({
    sql: 'CREATE TABLE test_integration (id uuid PRIMARY KEY, name text);',
    dryRun: true
  });
  console.log(result.summary);
})();
"
```

**Test 3: Export to JSONL**
```bash
node -e "
const { agentExportData } = require('supa-agent-ops');
(async () => {
  const result = await agentExportData({
    table: 'conversations',
    destination: './test-export.jsonl',
    config: { format: 'jsonl', includeMetadata: true }
  });
  console.log(result.summary);
})();
"
```

**Test 4: Table Verification**
```bash
node -e "
const { agentVerifyTable } = require('supa-agent-ops');
(async () => {
  const result = await agentVerifyTable({
    table: 'conversations',
    expectedColumns: [
      { name: 'id', type: 'uuid', required: true },
      { name: 'persona', type: 'text', required: true }
    ],
    generateFixSQL: true
  });
  console.log(result.summary);
  console.log('Category:', result.category);
})();
"
```

**Test 5: Complete Workflow**
```bash
node -e "
const saol = require('supa-agent-ops');
(async () => {
  // 1. Introspect schema
  const schema = await saol.agentIntrospectSchema({ table: 'conversations' });
  console.log('Schema:', schema.tables[0]?.columns.length, 'columns');
  
  // 2. Query data
  const query = await saol.agentQuery({
    table: 'conversations',
    limit: 5
  });
  console.log('Query:', query.data.length, 'records');
  
  // 3. Export to JSON
  const exp = await saol.agentExportData({
    table: 'conversations',
    destination: './test-complete.json',
    config: { format: 'json', includeMetadata: true }
  });
  console.log('Export:', exp.recordCount, 'records');
  
  // 4. Maintenance
  const analyze = await saol.agentAnalyze({ table: 'conversations' });
  console.log('Analyze:', analyze.summary);
  
  console.log('✅ Complete workflow successful');
})();
"
```

---

## Migration Path

### Upgrading Existing Scripts

**Before (Old Pattern):**
```javascript
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);

const { data, error } = await supabase.rpc('exec_sql', {
  sql_script: 'SELECT * FROM conversations;'
});
```

**After (New SAOL Pattern):**
```javascript
const { agentExecuteSQL } = require('supa-agent-ops');

const result = await agentExecuteSQL({
  sql: 'SELECT * FROM conversations;',
  transport: 'rpc'
});

if (!result.success) {
  console.log('Recovery steps:', result.nextActions);
}
```

### Script Migration Checklist

For each script in `src/scripts` that will be replaced:

1. [ ] Identify operations used (schema, RPC, query, export)
2. [ ] Map to new SAOL functions
3. [ ] Test equivalent functionality
4. [ ] Update import statements
5. [ ] Verify error handling is equivalent or better
6. [ ] Document migration in CHANGELOG.md

---

## Documentation Requirements

### Required Documentation Files

1. **SCHEMA_OPERATIONS.md**
   - Guide to schema introspection and DDL execution
   - Index management best practices
   - DDL safety guidelines

2. **RPC_GUIDE.md**
   - Using custom RPC functions
   - Raw SQL execution patterns
   - Transaction management

3. **EXPORT_FORMATS.md**
   - Format specifications (JSONL, JSON, CSV, Markdown)
   - Character encoding and escaping
   - Large dataset handling

4. **MAINTENANCE_GUIDE.md** (created in Prompt 3)
   - VACUUM, ANALYZE, REINDEX usage
   - Performance monitoring
   - Best practices for production

5. **VERIFICATION_GUIDE.md**
   - Table structure verification
   - Integrity checking
   - Automated fix SQL generation

6. **Updated CHANGELOG.md**
   - Version 1.1.0 additions
   - Breaking changes (none expected)
   - Migration guide references

---

## Next Steps

### Post-Integration Tasks

1. **Update README.md**
   - Add new operation categories
   - Update feature list
   - Add migration guide link

2. **Create Examples**
   - Add to EXAMPLES.md for each new operation
   - Complete workflow examples
   - Migration examples from old scripts

3. **Version Bump**
   - Update package.json to v1.1.0
   - Update VERSION constant in src/index.ts
   - Tag release in git

4. **Testing**
   - Run full test suite
   - Manual testing of all new operations
   - Integration testing with existing scripts

5. **Deprecation Plan**
   - Identify scripts in `src/scripts` that can be replaced
   - Mark deprecated functions
   - Plan removal timeline

---

## Success Criteria

### Definition of Done

✅ **All 3 prompts completed** with deliverables
✅ **All acceptance criteria met** for each prompt
✅ **Manual tests pass** for all new operations
✅ **No TypeScript errors** in strict mode
✅ **Backward compatibility maintained** - v1.0 functions work unchanged
✅ **Documentation complete** - All guides created and updated
✅ **Error handling comprehensive** - All error codes mapped
✅ **Preflight checks implemented** - All new operations validated

### Key Performance Indicators

- **Code Coverage**: 80%+ for new modules
- **Type Safety**: 100% strict mode compliance
- **Error Recovery**: All errors have nextActions
- **Documentation**: JSDoc on 100% of public functions
- **Testing**: 100% of new operations manually tested

---

**End of SAOL-CRUD Integration Execution Plan v1.0**

**Last Updated**: 2025-11-12  
**Status**: Ready for Implementation  
**Total Estimated Time**: 45-60 hours across 3 prompts

