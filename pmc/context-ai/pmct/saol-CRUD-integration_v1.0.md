# Supabase Agent Ops Library - Advanced CRUD Integration Specification v1.0

**Document Purpose**: Specification for integrating advanced database manipulation functionality from `src/scripts` into the Supabase Agent Ops Library (`supa-agent-ops`)

**Target Audience**: AI Coding Agents implementing database operation extensions

**Document Date**: November 12, 2025

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Architecture Design](#3-architecture-design)
4. [Operation Categories & Specifications](#4-operation-categories--specifications)
5. [Implementation Guidelines](#5-implementation-guidelines)
6. [Integration Patterns](#6-integration-patterns)
7. [Testing Strategy](#7-testing-strategy)
8. [Migration Path](#8-migration-path)

---

## 1. Executive Summary

### 1.1 Objective

Integrate all advanced database manipulation functionality from `src/scripts` into the `supa-agent-ops` library to provide AI agents with a unified, safe, and comprehensive interface for all Supabase database operations.

### 1.2 Current Library Capabilities

The `supa-agent-ops` library (v1.0) currently provides:

- ✅ **Basic CRUD**: Insert, Upsert operations via `agentImportTool()`
- ✅ **Character Safety**: Automatic handling of apostrophes, quotes, emojis, UTF-8
- ✅ **Error Handling**: 14 error codes with recovery steps
- ✅ **Preflight Checks**: Environment and table validation
- ✅ **Batch Processing**: Configurable batch sizes and concurrency
- ✅ **Reporting**: JSON reports with summary, errors, and success details

### 1.3 Missing Advanced Capabilities (from `src/scripts`)

Operations that need to be integrated:

1. **Schema Operations** (⭐⭐⭐⭐⭐)
   - Full schema introspection
   - DDL execution (CREATE, ALTER, DROP)
   - Index management
   - Constraint management
   - RLS policy management

2. **RPC Operations** (⭐⭐⭐⭐)
   - Custom RPC function execution
   - Raw SQL execution via `exec_sql`
   - Multi-statement SQL batches

3. **Read Operations** (⭐⭐⭐)
   - Advanced queries with filtering
   - Aggregations and analytics
   - Cross-table queries
   - System catalog queries

4. **Maintenance Operations** (⭐⭐⭐⭐⭐)
   - VACUUM, ANALYZE, REINDEX
   - Performance monitoring
   - Index usage analysis

5. **Verification Operations** (⭐⭐⭐)
   - Table structure verification
   - Data integrity checks
   - Schema comparison

6. **Export Operations** (⭐⭐)
   - Data export to JSON/NDJSON
   - SQL generation
   - Dollar-quoted SQL

---

## 2. Current State Analysis

### 2.1 Supa-Agent-Ops Library Structure

```
supa-agent-ops/
├── src/
│   ├── core/
│   │   ├── types.ts         - Type definitions
│   │   ├── config.ts        - Configuration management
│   │   └── client.ts        - Supabase & pg client setup
│   ├── operations/
│   │   ├── import.ts        - Insert/upsert operations ✅
│   │   ├── export.ts        - Placeholder ❌
│   │   ├── upsert.ts        - Via import ✅
│   │   └── delete.ts        - Placeholder ❌
│   ├── validation/
│   │   ├── sanitize.ts      - Character safety ✅
│   │   ├── normalize.ts     - Data normalization ✅
│   │   └── schema.ts        - Schema validation ✅
│   ├── errors/
│   │   ├── codes.ts         - Error mappings ✅
│   │   ├── handlers.ts      - Recovery strategies ✅
│   │   └── reports.ts       - Report generation ✅
│   ├── preflight/
│   │   └── checks.ts        - Pre-flight validation ✅
│   └── utils/
│       ├── paths.ts         - Path handling ✅
│       ├── logger.ts        - Logging ✅
│       └── batch.ts         - Batching logic ✅
```

### 2.2 Advanced Operations in `src/scripts`

Analysis of 56 JavaScript files reveals these operation categories:

| Category | Scripts | Key Capabilities |
|----------|---------|------------------|
| **Schema Introspection** | `get-full-schema.js`, `introspect-db-objects_v3.js` | Full schema access, column analysis, constraint detection |
| **RPC Execution** | `test-exec-sql.js`, `verify-e05-with-rpc.js` | Raw SQL execution, custom RPC calls |
| **Direct SQL** | `execute-sql-direct.js`, `execute-sql-files.js` | Transaction-wrapped SQL, file execution |
| **Verification** | `check-e*-sql-detailed.js`, `verify-e05-complete.js` | Table verification, schema validation |
| **Helper Tools** | `cursor-db-helper.js` | Query interface, count operations |
| **Analysis** | `deep-db-analysis.js`, `complete-db-audit.js` | Deep introspection, comprehensive audits |

### 2.3 Key Patterns Identified

From analyzing the scripts, these patterns emerge:

1. **RPC-Based Schema Access**: Use `exec_sql` RPC for system catalog queries
2. **Client-Based Probing**: Use Supabase client to test table existence
3. **Transaction Wrapping**: Use pg client for atomic multi-statement operations
4. **Error Context**: Capture detailed error information including pg error codes
5. **Batch Operations**: Process large datasets in configurable batches
6. **Dry-Run Support**: Validate operations before execution

---

## 3. Architecture Design

### 3.1 Design Principles

1. **Non-Breaking**: Do not modify existing `agentImportTool()` or other v1.0 APIs
2. **Consistent**: Follow existing patterns for types, error handling, and reporting
3. **Safe**: All operations must include preflight checks and dry-run support
4. **Atomic**: Database operations should be transaction-wrapped where applicable
5. **Agent-Friendly**: Clear JSDoc, prescriptive guidance, and `nextActions` on results
6. **Context-Efficient**: Minimize token usage with concise yet complete responses

### 3.2 Proposed Structure Extensions

```
supa-agent-ops/
├── src/
│   ├── operations/
│   │   ├── import.ts        ✅ (existing)
│   │   ├── export.ts        🆕 Data export operations
│   │   ├── query.ts         🆕 Advanced query operations
│   │   ├── schema.ts        🆕 Schema introspection & DDL
│   │   ├── rpc.ts           🆕 RPC & raw SQL execution
│   │   ├── maintenance.ts   🆕 VACUUM, ANALYZE, REINDEX
│   │   └── delete.ts        🆕 Delete operations
│   ├── verification/
│   │   ├── structure.ts     🆕 Table structure verification
│   │   ├── integrity.ts     🆕 Data integrity checks
│   │   └── comparison.ts    🆕 Schema comparison
│   └── preflight/
│       ├── checks.ts        ✅ (extend for new operations)
│       └── permissions.ts   🆕 Permission verification
```

### 3.3 Type System Extensions

```typescript
// New operation modes
export type OperationType = 
  | 'import'      // Existing
  | 'export'      // New
  | 'query'       // New
  | 'schema'      // New
  | 'rpc'         // New
  | 'maintenance' // New
  | 'delete';     // New

// New result type
export interface AgentOperationResult {
  success: boolean;
  summary: string;
  operation: OperationType;
  data?: any;
  totals?: {
    processed: number;
    durationMs: number;
  };
  reportPaths?: {
    summary: string;
    details?: string;
  };
  nextActions: NextAction[];
}
```

---

## 4. Operation Categories & Specifications

### 4.1 Schema Operations Module

**File**: `src/operations/schema.ts`

**Purpose**: Provide comprehensive schema introspection and DDL execution capabilities

#### 4.1.1 Function: `agentIntrospectSchema()`

**Signature**:
```typescript
interface SchemaIntrospectParams {
  table?: string;              // Single table or all tables
  includeColumns?: boolean;    // Default: true
  includeIndexes?: boolean;    // Default: true
  includeConstraints?: boolean; // Default: true
  includePolicies?: boolean;   // Default: true
  includeStats?: boolean;      // Default: false
}

interface SchemaIntrospectResult extends AgentOperationResult {
  tables: TableSchema[];
  totalTables: number;
  reportPaths: {
    summary: string;
    detailed: string;
  };
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

agentIntrospectSchema(params: SchemaIntrospectParams): Promise<SchemaIntrospectResult>
```

**Implementation Pattern** (from `get-full-schema.js` and `verify-e05-with-rpc.js`):

```typescript
// Use RPC to query information_schema and pg_* catalogs
const { data, error } = await supabase.rpc('exec_sql', {
  sql_script: `
    SELECT json_build_object(
      'columns', (SELECT json_agg(...) FROM information_schema.columns ...),
      'indexes', (SELECT json_agg(...) FROM pg_indexes ...),
      'constraints', (SELECT json_agg(...) FROM pg_constraint ...),
      'policies', (SELECT json_agg(...) FROM pg_policies ...)
    );
  `
});
```

**Preflight Checks**:
- ✅ RPC function `exec_sql` exists
- ✅ Service role key is configured
- ✅ Table exists (if specific table requested)

**Error Handling**:
- Map PostgreSQL errors to library error codes
- Provide recovery steps for missing permissions
- Handle non-existent tables gracefully

#### 4.1.2 Function: `agentExecuteDDL()`

**Signature**:
```typescript
interface DDLExecuteParams {
  sql: string;                  // DDL statement(s)
  dryRun?: boolean;             // Default: false
  transaction?: boolean;        // Wrap in transaction (default: true)
  validateOnly?: boolean;       // Parse and validate without executing
}

interface DDLExecuteResult extends AgentOperationResult {
  executed: boolean;
  statements: number;
  affectedObjects: string[];
}

agentExecuteDDL(params: DDLExecuteParams): Promise<DDLExecuteResult>
```

**Implementation Pattern** (from `execute-sql-direct.js`):

```typescript
// Use pg client for transaction support
const client = await getPgClient();
await client.query('BEGIN');
try {
  const result = await client.query(params.sql);
  await client.query('COMMIT');
  return { success: true, ... };
} catch (error) {
  await client.query('ROLLBACK');
  // Map error and provide recovery steps
  throw error;
}
```

**Preflight Checks**:
- ✅ SQL syntax validation (basic)
- ✅ Dangerous operations warning (DROP, TRUNCATE)
- ✅ Database connection available
- ✅ Service role permissions

**Safety Features**:
- Transaction wrapping by default
- Dry-run mode for validation
- Automatic rollback on errors
- Warning for destructive operations

#### 4.1.3 Function: `agentManageIndex()`

**Signature**:
```typescript
interface IndexManageParams {
  table: string;
  action: 'create' | 'drop' | 'list';
  indexName?: string;
  columns?: string[];
  concurrent?: boolean;        // Default: true for CREATE
  dryRun?: boolean;
}

interface IndexManageResult extends AgentOperationResult {
  indexes: IndexInfo[];
  operation: string;
}

agentManageIndex(params: IndexManageParams): Promise<IndexManageResult>
```

**Implementation Pattern**:

```typescript
if (params.action === 'create') {
  const sql = `CREATE INDEX ${params.concurrent ? 'CONCURRENTLY' : ''} 
               ${params.indexName} ON ${params.table} (${params.columns.join(', ')})`;
  return await agentExecuteDDL({ sql, transaction: !params.concurrent });
}
```

---

### 4.2 RPC Operations Module

**File**: `src/operations/rpc.ts`

**Purpose**: Execute custom RPC functions and raw SQL safely

#### 4.2.1 Function: `agentExecuteRPC()`

**Signature**:
```typescript
interface RPCExecuteParams {
  functionName: string;
  params?: Record<string, any>;
  timeout?: number;            // Milliseconds
}

interface RPCExecuteResult extends AgentOperationResult {
  data: any;
  executionTimeMs: number;
}

agentExecuteRPC(params: RPCExecuteParams): Promise<RPCExecuteResult>
```

**Implementation Pattern** (from `test-exec-sql.js`):

```typescript
const { data, error } = await supabase.rpc(params.functionName, params.params);

if (error) {
  return {
    success: false,
    summary: `RPC ${params.functionName} failed: ${error.message}`,
    nextActions: [/* recovery steps */]
  };
}

return {
  success: true,
  data,
  summary: `RPC ${params.functionName} executed successfully`,
  nextActions: []
};
```

**Preflight Checks**:
- ✅ RPC function exists
- ✅ Required permissions granted
- ✅ Parameter types match

#### 4.2.2 Function: `agentExecuteSQL()`

**Signature**:
```typescript
interface SQLExecuteParams {
  sql: string;
  transport?: 'rpc' | 'pg';    // Default: 'rpc'
  transaction?: boolean;        // Default: true for pg
  dryRun?: boolean;
  timeout?: number;
}

interface SQLExecuteResult extends AgentOperationResult {
  rows?: any[];
  rowCount?: number;
  command?: string;
}

agentExecuteSQL(params: SQLExecuteParams): Promise<SQLExecuteResult>
```

**Implementation Pattern** (from `execute-sql-files.js` and `execute-sql-direct.js`):

```typescript
if (params.transport === 'rpc') {
  // Use RPC for multi-statement SQL
  const { data, error } = await supabase.rpc('exec_sql', { 
    sql_script: params.sql 
  });
} else {
  // Use pg client for single queries with transaction
  const client = await getPgClient();
  if (params.transaction) await client.query('BEGIN');
  try {
    const result = await client.query(params.sql);
    if (params.transaction) await client.query('COMMIT');
    return result;
  } catch (error) {
    if (params.transaction) await client.query('ROLLBACK');
    throw error;
  }
}
```

**Safety Features**:
- SQL injection prevention via parameterization guidance
- Transaction wrapping
- Timeout support
- Dry-run validation

---

### 4.3 Query Operations Module

**File**: `src/operations/query.ts`

**Purpose**: Advanced query capabilities beyond basic CRUD

#### 4.3.1 Function: `agentQuery()`

**Signature**:
```typescript
interface QueryParams {
  table: string;
  select?: string[];           // Columns to select (default: all)
  where?: QueryFilter[];       // Filter conditions
  orderBy?: OrderSpec[];
  limit?: number;
  offset?: number;
  count?: boolean;             // Return count with data
  aggregate?: AggregateSpec[]; // SUM, AVG, COUNT, etc.
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

agentQuery(params: QueryParams): Promise<QueryResult>
```

**Implementation Pattern** (from `cursor-db-helper.js`):

```typescript
let query = supabase.from(params.table);

if (params.select) {
  query = query.select(params.select.join(', '));
} else {
  query = query.select('*');
}

for (const filter of params.where || []) {
  switch (filter.operator) {
    case 'eq': query = query.eq(filter.column, filter.value); break;
    case 'like': query = query.ilike(filter.column, filter.value); break;
    // ... other operators
  }
}

if (params.orderBy) {
  for (const order of params.orderBy) {
    query = query.order(order.column, { ascending: order.asc });
  }
}

if (params.limit) query = query.limit(params.limit);
if (params.offset) query = query.range(params.offset, params.offset + params.limit - 1);

const { data, error, count } = await query;
```

#### 4.3.2 Function: `agentCount()`

**Signature**:
```typescript
interface CountParams {
  table: string;
  where?: QueryFilter[];
  distinct?: string;
}

interface CountResult extends AgentOperationResult {
  count: number;
}

agentCount(params: CountParams): Promise<CountResult>
```

**Implementation** (optimized pattern):

```typescript
const { count, error } = await supabase
  .from(params.table)
  .select('*', { count: 'exact', head: true });
```

---

### 4.4 Export Operations Module

**File**: `src/operations/export.ts`

**Purpose**: Export data from Supabase to various formats

#### 4.4.1 Function: `agentExportData()`

**Signature**:
```typescript
interface ExportParams {
  table: string;
  format: 'json' | 'ndjson' | 'sql' | 'csv';
  destination: string;         // File path
  where?: QueryFilter[];
  includeSchema?: boolean;     // For SQL export
  useDollarQuoting?: boolean;  // For SQL export (default: true)
  batchSize?: number;          // For large exports
}

interface ExportResult extends AgentOperationResult {
  recordCount: number;
  fileSize: number;
  filePath: string;
}

agentExportData(params: ExportParams): Promise<ExportResult>
```

**Implementation Pattern** (from `convert-to-dollar-quoting.js`):

```typescript
// Query data in batches
const batches = Math.ceil(totalRecords / params.batchSize);

for (let i = 0; i < batches; i++) {
  const { data } = await supabase
    .from(params.table)
    .select('*')
    .range(i * params.batchSize, (i + 1) * params.batchSize - 1);
  
  if (params.format === 'sql') {
    // Generate dollar-quoted SQL
    for (const record of data) {
      const sql = generateDollarQuotedInsert(params.table, record);
      fs.appendFileSync(params.destination, sql + '\n');
    }
  } else if (params.format === 'ndjson') {
    for (const record of data) {
      fs.appendFileSync(params.destination, JSON.stringify(record) + '\n');
    }
  }
}
```

#### 4.4.2 Function: `generateDollarQuotedInsert()`

**Already exists in library** - Enhance with more options:

```typescript
interface DollarQuoteOptions {
  table: string;
  record: Record<string, any>;
  onConflict?: string | string[];
  includeReturning?: boolean;
}

generateDollarQuotedInsert(options: DollarQuoteOptions): string
```

---

### 4.5 Maintenance Operations Module

**File**: `src/operations/maintenance.ts`

**Purpose**: Database maintenance operations (VACUUM, ANALYZE, REINDEX)

#### 4.5.1 Function: `agentVacuum()`

**Signature**:
```typescript
interface VacuumParams {
  table?: string;              // Specific table or all tables
  full?: boolean;              // VACUUM FULL (locks table)
  analyze?: boolean;           // Run ANALYZE after VACUUM
  dryRun?: boolean;
}

interface VacuumResult extends AgentOperationResult {
  tablesProcessed: string[];
  spaceReclaimed?: number;
}

agentVacuum(params: VacuumParams): Promise<VacuumResult>
```

**Implementation**:

```typescript
const sql = `VACUUM ${params.full ? 'FULL' : ''} ${params.analyze ? 'ANALYZE' : ''} ${params.table || ''}`;

// Execute via RPC or direct SQL
const result = await agentExecuteSQL({ sql, transport: 'pg' });
```

**Safety**:
- Warn if FULL is used (locks table)
- Estimate time for large tables
- Recommend off-peak execution

#### 4.5.2 Function: `agentAnalyze()`

**Signature**:
```typescript
interface AnalyzeParams {
  table?: string;
  columns?: string[];
}

agentAnalyze(params: AnalyzeParams): Promise<AgentOperationResult>
```

#### 4.5.3 Function: `agentReindex()`

**Signature**:
```typescript
interface ReindexParams {
  target: 'table' | 'index' | 'schema';
  name: string;
  concurrent?: boolean;        // CONCURRENTLY (Postgres 12+)
}

agentReindex(params: ReindexParams): Promise<AgentOperationResult>
```

---

### 4.6 Delete Operations Module

**File**: `src/operations/delete.ts`

**Purpose**: Safe delete operations with cascading and verification

#### 4.6.1 Function: `agentDelete()`

**Signature**:
```typescript
interface DeleteParams {
  table: string;
  where: QueryFilter[];        // Required - prevent accidental full delete
  cascade?: boolean;           // Delete related records
  dryRun?: boolean;            // Preview affected records
  confirm?: boolean;           // Require explicit confirmation (default: true)
}

interface DeleteResult extends AgentOperationResult {
  deletedCount: number;
  affectedTables?: string[];
  previewRecords?: any[];      // For dry-run
}

agentDelete(params: DeleteParams): Promise<DeleteResult>
```

**Implementation**:

```typescript
// Build delete query
let query = supabase.from(params.table).delete();

for (const filter of params.where) {
  query = query.eq(filter.column, filter.value);
}

if (params.dryRun) {
  // Preview what would be deleted
  let selectQuery = supabase.from(params.table).select('*');
  for (const filter of params.where) {
    selectQuery = selectQuery.eq(filter.column, filter.value);
  }
  const { data } = await selectQuery;
  
  return {
    success: true,
    summary: `Would delete ${data.length} records (dry-run)`,
    totals: { processed: data.length },
    previewRecords: data,
    nextActions: [{
      action: 'CONFIRM_DELETE',
      description: 'Run with confirm: true to execute deletion',
      priority: 'HIGH'
    }]
  };
}

const { data, error } = await query;
```

**Safety Features**:
- Requires where clause (no full table deletes)
- Dry-run preview
- Confirmation requirement
- Cascade handling
- Rollback on error

---

### 4.7 Verification Module

**File**: `src/verification/structure.ts`

**Purpose**: Verify table structure and integrity

#### 4.7.1 Function: `agentVerifyTable()`

**Signature**:
```typescript
interface TableVerifyParams {
  table: string;
  expectedColumns?: ColumnSpec[];
  expectedIndexes?: string[];
  expectedConstraints?: ConstraintSpec[];
  generateFixSQL?: boolean;    // Generate SQL to fix issues
}

interface TableVerifyResult extends AgentOperationResult {
  exists: boolean;
  issues: VerificationIssue[];
  fixSQL?: string;
  category: 1 | 2 | 3 | 4;     // 1=OK, 2=Warning, 3=Critical, 4=Blocking
  canProceed: boolean;
}

interface VerificationIssue {
  type: 'missing_column' | 'missing_index' | 'missing_constraint' | 'type_mismatch';
  severity: 'warning' | 'error' | 'critical';
  description: string;
  fixSQL?: string;
}

agentVerifyTable(params: TableVerifyParams): Promise<TableVerifyResult>
```

**Implementation Pattern** (from `verify-e05-with-rpc.js`):

```typescript
// Get actual schema
const actualSchema = await agentIntrospectSchema({ table: params.table });

// Compare with expected
const issues: VerificationIssue[] = [];

for (const expectedCol of params.expectedColumns || []) {
  const actualCol = actualSchema.columns.find(c => c.name === expectedCol.name);
  if (!actualCol) {
    issues.push({
      type: 'missing_column',
      severity: expectedCol.required ? 'critical' : 'warning',
      description: `Missing column: ${expectedCol.name}`,
      fixSQL: `ALTER TABLE ${params.table} ADD COLUMN ${expectedCol.name} ${expectedCol.type};`
    });
  }
}

// Determine category
const category = issues.some(i => i.severity === 'critical') ? 4 :
                 issues.some(i => i.severity === 'error') ? 3 :
                 issues.length > 0 ? 2 : 1;
```

---

## 5. Implementation Guidelines

### 5.1 Code Organization

Each new module should follow this structure:

```typescript
/**
 * Module: <Name> Operations
 * Purpose: <Brief description>
 */

import { /* dependencies */ } from '../core/...';

// Types specific to this module
export interface <Module>Params { ... }
export interface <Module>Result extends AgentOperationResult { ... }

// Private helper functions
async function _helperFunction() { ... }

// Public agent functions
/**
 * <Function Description>
 * 
 * @param params - <Param description>
 * @returns Promise with <Result description>
 * 
 * @example
 * ```typescript
 * const result = await agentFunction({
 *   param1: 'value'
 * });
 * ```
 */
export async function agentFunction(params: <Module>Params): Promise<<Module>Result> {
  // 1. Validate params
  // 2. Run preflight checks
  // 3. Execute operation
  // 4. Handle errors
  // 5. Generate reports
  // 6. Return result with nextActions
}
```

### 5.2 Error Handling Pattern

All functions must use consistent error handling:

```typescript
try {
  // Operation
} catch (error: any) {
  const mappedError = mapDatabaseError(error);
  const recoverySteps = generateRecoverySteps([mappedError]);
  
  return {
    success: false,
    summary: `Operation failed: ${mappedError.description}`,
    operation: '<operation-type>',
    nextActions: recoverySteps.map(step => ({
      action: step.action,
      description: step.description,
      example: step.example,
      priority: step.priority
    }))
  };
}
```

### 5.3 Preflight Check Pattern

Every operation should have corresponding preflight checks:

```typescript
// In src/preflight/checks.ts

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

### 5.4 Type Safety

All new types must:
- Extend existing base types where appropriate
- Include JSDoc comments
- Support type inference
- Be exported from `src/core/types.ts`

```typescript
// Add to src/core/types.ts

export type SchemaOperationType = 
  | 'introspect'
  | 'ddl'
  | 'index_create'
  | 'index_drop'
  | 'constraint_add'
  | 'constraint_drop';

export interface SchemaOperationParams {
  operation: SchemaOperationType;
  dryRun?: boolean;
  // ... operation-specific params
}
```

### 5.5 Testing Requirements

Each new function must include:

1. **Unit Tests** (`__tests__/<module>.test.ts`)
   - Happy path
   - Error conditions
   - Edge cases
   - Preflight failures

2. **Integration Tests** (`__tests__/integration/<module>.integration.ts`)
   - Real Supabase connection
   - Full workflow tests
   - Error recovery tests

3. **Fixtures** (`fixtures/<module>.test.json`)
   - Test data
   - Expected results
   - Error scenarios

Example test structure:

```typescript
describe('agentIntrospectSchema', () => {
  it('should introspect a single table', async () => {
    const result = await agentIntrospectSchema({ table: 'test_table' });
    expect(result.success).toBe(true);
    expect(result.tables).toHaveLength(1);
  });
  
  it('should handle non-existent table', async () => {
    const result = await agentIntrospectSchema({ table: 'nonexistent' });
    expect(result.success).toBe(false);
    expect(result.nextActions).toContainEqual(expect.objectContaining({
      action: 'CREATE_TABLE'
    }));
  });
});
```

---

## 6. Integration Patterns

### 6.1 Backward Compatibility

All existing v1.0 functionality must remain unchanged:

```typescript
// ✅ These must continue to work exactly as before
import { agentImportTool, agentPreflight } from 'supa-agent-ops';

const result = await agentImportTool({
  source: './data.ndjson',
  table: 'conversations'
});
```

### 6.2 New Function Naming Convention

All new agent functions follow this pattern:

```
agent<Verb><Noun>()

Examples:
- agentIntrospectSchema()
- agentExecuteSQL()
- agentVerifyTable()
- agentExportData()
- agentManageIndex()
```

### 6.3 Import Pattern

New functions are exported from main index:

```typescript
// src/index.ts

// Existing exports (v1.0)
export { agentImportTool, analyzeImportErrors } from './operations/import';
export { agentPreflight } from './preflight/checks';

// New exports (v1.1)
export { agentIntrospectSchema, agentExecuteDDL, agentManageIndex } from './operations/schema';
export { agentExecuteRPC, agentExecuteSQL } from './operations/rpc';
export { agentQuery, agentCount } from './operations/query';
export { agentExportData } from './operations/export';
export { agentVacuum, agentAnalyze, agentReindex } from './operations/maintenance';
export { agentDelete } from './operations/delete';
export { agentVerifyTable } from './verification/structure';
```

### 6.4 Usage Pattern for AI Agents

Provide clear usage examples in documentation:

```typescript
// Example: Complete workflow for schema verification and data import

// 1. Verify table structure
const verification = await agentVerifyTable({
  table: 'conversations',
  expectedColumns: [
    { name: 'id', type: 'uuid', required: true },
    { name: 'persona', type: 'text', required: true }
  ],
  generateFixSQL: true
});

if (!verification.canProceed) {
  console.log('Issues found:', verification.issues);
  console.log('Fix SQL:', verification.fixSQL);
  
  // 2. Apply fixes
  const ddlResult = await agentExecuteDDL({
    sql: verification.fixSQL,
    dryRun: false
  });
}

// 3. Import data
const importResult = await agentImportTool({
  source: './conversations.ndjson',
  table: 'conversations',
  mode: 'upsert',
  onConflict: 'id'
});

// 4. Verify data
const count = await agentCount({ table: 'conversations' });
console.log(`Imported ${count.count} records`);
```

---

## 7. Testing Strategy

### 7.1 Test Environment Setup

```bash
# Test database setup
export SUPABASE_URL_TEST=https://test-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY_TEST=your-test-key
export DATABASE_URL_TEST=postgresql://...
```

### 7.2 Test Coverage Requirements

- **Unit Tests**: 90%+ coverage
- **Integration Tests**: All critical paths
- **Error Scenarios**: All error codes
- **Edge Cases**: Null values, empty results, large datasets

### 7.3 Test Data

Create fixtures for:
- Valid schema definitions
- Invalid schema definitions
- Sample records
- Error scenarios
- Expected results

---

## 8. Migration Path

### 8.1 Phase 1: Core Extensions (Week 1-2)

**Priority: HIGH**

1. ✅ Implement `agentIntrospectSchema()`
2. ✅ Implement `agentExecuteSQL()`
3. ✅ Implement `agentExecuteRPC()`
4. ✅ Implement `agentQuery()`
5. ✅ Add comprehensive tests

**Deliverables**:
- Working schema introspection
- Raw SQL execution
- Advanced query capabilities
- 90%+ test coverage

### 8.2 Phase 2: DDL & Maintenance (Week 3-4)

**Priority: HIGH**

1. ✅ Implement `agentExecuteDDL()`
2. ✅ Implement `agentManageIndex()`
3. ✅ Implement `agentVacuum()`
4. ✅ Implement `agentAnalyze()`
5. ✅ Implement `agentReindex()`

**Deliverables**:
- Full DDL support
- Index management
- Maintenance operations
- Transaction safety

### 8.3 Phase 3: Export & Delete (Week 5)

**Priority: MEDIUM**

1. ✅ Implement `agentExportData()`
2. ✅ Implement `agentDelete()`
3. ✅ Enhance `generateDollarQuotedInsert()`

**Deliverables**:
- Data export in multiple formats
- Safe delete operations
- Enhanced SQL generation

### 8.4 Phase 4: Verification (Week 6)

**Priority: MEDIUM**

1. ✅ Implement `agentVerifyTable()`
2. ✅ Implement integrity checks
3. ✅ Implement schema comparison

**Deliverables**:
- Comprehensive verification
- Auto-fix SQL generation
- Integrity validation

### 8.5 Phase 5: Documentation & Polish (Week 7-8)

**Priority: HIGH**

1. ✅ Complete API documentation
2. ✅ Create usage examples
3. ✅ Write migration guide
4. ✅ Update README
5. ✅ Create CHANGELOG

**Deliverables**:
- Complete documentation
- Migration guide
- Example projects
- Performance benchmarks

---

## 9. Key Implementation Details

### 9.1 RPC Function Requirements

The library requires this RPC function in Supabase:

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

### 9.2 Permission Model

Operations require different permission levels:

| Operation | Permission Level | Key Required |
|-----------|-----------------|--------------|
| Read (SELECT) | Low | Anon or Service |
| Insert/Update | Medium | Service Role |
| Delete | High | Service Role |
| DDL | Critical | Service Role |
| Maintenance | Critical | Service Role |

### 9.3 Transaction Handling

```typescript
// Pattern for transaction-safe operations
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
  } finally {
    await closePgClient();
  }
}
```

### 9.4 Error Code Extensions

Add new error codes for advanced operations:

```typescript
// In src/errors/codes.ts

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
    automatable: true  // Can auto-generate creation SQL
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
  },
  {
    code: 'ERR_VACUUM_FAILED',
    patterns: ['cannot vacuum'],
    category: 'DB',
    description: 'VACUUM operation failed',
    remediation: 'Check for active transactions or locks',
    automatable: false
  }
];
```

---

## 10. Documentation Requirements

### 10.1 API Reference

Each function must have:

1. **Function Signature** with TypeScript types
2. **Parameter Descriptions** with defaults and constraints
3. **Return Type** with detailed field descriptions
4. **Examples** showing common use cases
5. **Error Scenarios** with recovery steps
6. **Related Functions** and workflows

### 10.2 User Guide Sections

Create these guides:

1. **Schema Operations Guide**
   - Introspecting databases
   - Executing DDL
   - Managing indexes
   - Managing constraints

2. **Advanced Query Guide**
   - Complex filtering
   - Aggregations
   - Joins and relationships
   - Performance optimization

3. **Maintenance Guide**
   - When to run VACUUM
   - ANALYZE best practices
   - Index maintenance
   - Performance monitoring

4. **Export Guide**
   - Export formats
   - Large dataset handling
   - SQL generation
   - Data migration

### 10.3 Migration Guide for Existing Scripts

Provide conversion examples from old patterns:

```typescript
// OLD (from src/scripts)
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);

const { data, error } = await supabase.rpc('exec_sql', {
  sql_script: fs.readFileSync('schema.sql', 'utf8')
});

// NEW (with supa-agent-ops)
import { agentExecuteDDL } from 'supa-agent-ops';
import * as fs from 'fs';

const result = await agentExecuteDDL({
  sql: fs.readFileSync('schema.sql', 'utf8'),
  transaction: true,
  dryRun: false
});

if (!result.success) {
  console.log('Fix steps:', result.nextActions);
}
```

---

## 11. Performance Considerations

### 11.1 Batching Large Operations

For operations on large datasets:

```typescript
interface BatchConfig {
  batchSize: number;
  concurrency: number;
  delayMs: number;
}

// Default configurations by operation type
const BATCH_CONFIGS: Record<OperationType, BatchConfig> = {
  export: { batchSize: 1000, concurrency: 5, delayMs: 100 },
  query: { batchSize: 500, concurrency: 3, delayMs: 50 },
  delete: { batchSize: 100, concurrency: 1, delayMs: 200 }
};
```

### 11.2 Connection Pooling

```typescript
// Reuse connections for multiple operations
let pgClientPool: Pool | null = null;

async function getPgClient(): Promise<PoolClient> {
  if (!pgClientPool) {
    pgClientPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000
    });
  }
  return await pgClientPool.connect();
}
```

### 11.3 Query Optimization

Provide guidance for optimal queries:

```typescript
// Prefer specific columns over SELECT *
const result = await agentQuery({
  table: 'large_table',
  select: ['id', 'name'],  // ✅ Good
  // select: ['*'],          // ❌ Avoid for large tables
  limit: 100
});

// Use indexes effectively
const result = await agentQuery({
  table: 'conversations',
  where: [
    { column: 'status', operator: 'eq', value: 'approved' }  // ✅ Uses index
  ]
});
```

---

## 12. Security Guidelines

### 12.1 SQL Injection Prevention

**Never** construct SQL with string interpolation:

```typescript
// ❌ DANGEROUS - SQL Injection risk
const badSQL = `SELECT * FROM ${table} WHERE id = '${userId}'`;

// ✅ SAFE - Use parameterized queries
const safeResult = await agentQuery({
  table: table,
  where: [{ column: 'id', operator: 'eq', value: userId }]
});

// ✅ SAFE - Use pg parameterized queries
const safeSQL = await client.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);
```

### 12.2 Permission Checks

All DDL operations must verify permissions:

```typescript
async function checkDDLPermissions(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_script: 'SELECT has_schema_privilege(current_user, \'public\', \'CREATE\')'
    });
    return !error && data?.[0]?.has_schema_privilege;
  } catch {
    return false;
  }
}
```

### 12.3 Audit Logging

Log all schema-modifying operations:

```typescript
interface AuditLog {
  timestamp: string;
  operation: OperationType;
  user: string;
  table?: string;
  sql?: string;
  success: boolean;
  error?: string;
}

async function auditLog(entry: AuditLog) {
  await supabase.from('audit_logs').insert(entry);
}
```

---

## 13. Success Criteria

### 13.1 Functional Requirements

✅ All operations from `src/scripts` are available as library functions
✅ No breaking changes to existing v1.0 API
✅ All functions follow consistent patterns
✅ Comprehensive error handling with recovery steps
✅ Transaction support where appropriate
✅ Dry-run capability for all write operations
✅ Preflight checks for all operations

### 13.2 Quality Requirements

✅ 90%+ unit test coverage
✅ 100% integration test coverage for critical paths
✅ All functions have JSDoc documentation
✅ User guides for all operation categories
✅ Migration guide from old patterns
✅ Performance benchmarks documented

### 13.3 Usability Requirements

✅ Clear and consistent function naming
✅ Prescriptive guidance via `nextActions`
✅ No dead-end errors (always suggest next steps)
✅ Context-efficient responses
✅ Examples for all common scenarios

---

## 14. Example Usage Workflows

### 14.1 Complete Database Setup Workflow

```typescript
import {
  agentIntrospectSchema,
  agentExecuteDDL,
  agentImportTool,
  agentVerifyTable,
  agentCount
} from 'supa-agent-ops';

async function setupDatabase() {
  // 1. Check current state
  const schema = await agentIntrospectSchema({ table: 'conversations' });
  
  if (!schema.tables[0]?.exists) {
    // 2. Create table
    const ddl = await agentExecuteDDL({
      sql: `
        CREATE TABLE conversations (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          persona text NOT NULL,
          parameters jsonb,
          created_at timestamptz DEFAULT now()
        );
        
        CREATE INDEX idx_conversations_persona ON conversations(persona);
      `,
      dryRun: false
    });
    
    console.log('Table created:', ddl.summary);
  }
  
  // 3. Verify structure
  const verification = await agentVerifyTable({
    table: 'conversations',
    expectedColumns: [
      { name: 'id', type: 'uuid', required: true },
      { name: 'persona', type: 'text', required: true },
      { name: 'parameters', type: 'jsonb' }
    ]
  });
  
  if (!verification.canProceed) {
    console.error('Verification failed:', verification.issues);
    return;
  }
  
  // 4. Import data
  const importResult = await agentImportTool({
    source: './data/conversations.ndjson',
    table: 'conversations',
    mode: 'upsert',
    onConflict: 'id'
  });
  
  // 5. Verify import
  const count = await agentCount({ table: 'conversations' });
  console.log(`Successfully imported ${count.count} conversations`);
  
  return { success: true, count: count.count };
}
```

### 14.2 Schema Migration Workflow

```typescript
async function migrateSchema() {
  // 1. Export existing data
  const exportResult = await agentExportData({
    table: 'conversations',
    format: 'ndjson',
    destination: './backup/conversations.ndjson'
  });
  
  console.log(`Backed up ${exportResult.recordCount} records`);
  
  // 2. Modify schema
  const ddl = await agentExecuteDDL({
    sql: `
      ALTER TABLE conversations 
      ADD COLUMN quality_score numeric CHECK (quality_score >= 0 AND quality_score <= 100);
      
      ALTER TABLE conversations 
      ADD COLUMN status text DEFAULT 'pending';
      
      CREATE INDEX idx_conversations_status ON conversations(status);
    `,
    transaction: true,
    dryRun: false
  });
  
  if (!ddl.success) {
    console.error('Migration failed:', ddl.summary);
    return;
  }
  
  // 3. Verify new schema
  const verification = await agentVerifyTable({
    table: 'conversations',
    expectedColumns: [
      { name: 'quality_score', type: 'numeric' },
      { name: 'status', type: 'text' }
    ]
  });
  
  console.log('Migration completed:', verification.category === 1 ? 'SUCCESS' : 'ISSUES');
}
```

### 14.3 Database Maintenance Workflow

```typescript
async function performMaintenance() {
  const tables = ['conversations', 'templates', 'scenarios'];
  
  for (const table of tables) {
    // 1. Get table statistics
    const schema = await agentIntrospectSchema({
      table,
      includeStats: true
    });
    
    console.log(`${table}: ${schema.tables[0]?.rowCount} rows`);
    
    // 2. Vacuum and analyze
    await agentVacuum({
      table,
      full: false,
      analyze: true
    });
    
    // 3. Check indexes
    if (schema.tables[0]?.indexes) {
      for (const index of schema.tables[0].indexes) {
        console.log(`Index: ${index.name}`);
      }
    }
  }
  
  console.log('Maintenance completed');
}
```

---

## 15. Versioning Strategy

### 15.1 Version Numbers

- **v1.0.x**: Current version (import/upsert only)
- **v1.1.x**: Phase 1 (schema, RPC, query)
- **v1.2.x**: Phase 2 (DDL, maintenance)
- **v1.3.x**: Phase 3 (export, delete)
- **v1.4.x**: Phase 4 (verification)
- **v2.0.x**: Major refactor if needed

### 15.2 Breaking Changes Policy

- Avoid breaking changes in minor versions
- Deprecate old APIs with warnings
- Provide migration path for breaking changes
- Maintain backward compatibility for 2 major versions

### 15.3 Changelog Format

```markdown
# Changelog

## [1.1.0] - 2025-11-XX

### Added
- `agentIntrospectSchema()` for full schema introspection
- `agentExecuteSQL()` for raw SQL execution
- `agentExecuteRPC()` for custom RPC calls
- `agentQuery()` for advanced queries

### Changed
- Extended error codes with schema operation errors
- Enhanced preflight checks for schema operations

### Fixed
- None

### Deprecated
- None
```

---

## 16. Conclusion

This specification provides a comprehensive blueprint for integrating all advanced database manipulation functionality from `src/scripts` into the `supa-agent-ops` library. The design maintains backward compatibility, follows established patterns, and provides AI agents with a complete, safe, and context-efficient interface for all Supabase database operations.

### Key Principles

1. **Non-Breaking**: All v1.0 functionality remains unchanged
2. **Consistent**: New functions follow established patterns
3. **Safe**: All operations include preflight checks and dry-run support
4. **Atomic**: Transaction wrapping where appropriate
5. **Agent-Friendly**: Clear guidance and prescriptive next actions
6. **Complete**: All operations from scripts are available

### Implementation Priority

1. **Phase 1** (HIGH): Schema introspection, RPC, and query operations
2. **Phase 2** (HIGH): DDL and maintenance operations
3. **Phase 3** (MEDIUM): Export and delete operations
4. **Phase 4** (MEDIUM): Verification operations
5. **Phase 5** (HIGH): Documentation and polish

### Success Metrics

- ✅ 100% coverage of `src/scripts` functionality
- ✅ Zero breaking changes to v1.0 API
- ✅ 90%+ test coverage
- ✅ Complete documentation with examples
- ✅ Performance benchmarks documented
- ✅ Migration guide provided

---

**Document Version**: 1.0  
**Last Updated**: November 12, 2025  
**Status**: Ready for Implementation  
**Approval Required**: Architecture review before Phase 1 implementation

---

## Appendix A: Reference Files

### Source Documentation
- `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\IMPLEMENTATION_SUMMARY.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\EXAMPLES.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\src\scripts\supabase-access-details_v1.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\src\scripts\supabase-CRUD-operations-details_v1.md`

### Reference Scripts
- Schema: `get-full-schema.js`, `introspect-db-objects_v3.js`
- RPC: `test-exec-sql.js`, `verify-e05-with-rpc.js`
- SQL: `execute-sql-direct.js`, `execute-sql-files.js`
- Helper: `cursor-db-helper.js`

### Library Files
- Types: `supa-agent-ops/src/core/types.ts`
- Config: `supa-agent-ops/src/core/config.ts`
- Import: `supa-agent-ops/src/operations/import.ts`
- Preflight: `supa-agent-ops/src/preflight/checks.ts`

---

**End of Specification**

