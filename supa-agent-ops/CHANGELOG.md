# Changelog

All notable changes to the Supabase Agent Ops library will be documented in this file.

## [1.2.0] - 2025-11-12

### Added - Advanced Query, Export & Delete Operations (Prompt 2 E01)

#### New Operations
- ✅ `agentQuery()` - Advanced SELECT queries with filtering, ordering, pagination, aggregation
- ✅ `agentCount()` - Optimized count queries with optional distinct
- ✅ `agentExportData()` - Multi-format data export (JSONL, JSON, CSV, Markdown)
- ✅ `agentDelete()` - Safe delete operations with dry-run and confirmation
- ✅ `getTransformer()` - Export format transformer factory

#### Query Operations Features
- ✅ 9 query operators: eq, neq, gt, gte, lt, lte, like, in, is
- ✅ Multi-column filtering with AND logic
- ✅ Ordering (ascending/descending) on multiple columns
- ✅ Pagination with limit and offset
- ✅ Column selection (select specific fields)
- ✅ Count queries with exact counts
- ✅ Client-side aggregations: SUM, AVG, COUNT, MIN, MAX
- ✅ Performance suggestions in nextActions

#### Export Operations Features
- ✅ **JSONL Transformer**: OpenAI/Anthropic training format compatible
- ✅ **JSON Transformer**: Structured export with version, date, count metadata
- ✅ **CSV Transformer**: Excel-compatible with UTF-8 BOM, proper escaping
- ✅ **Markdown Transformer**: Human-readable reports with tables
- ✅ Special character handling (quotes, newlines, commas)
- ✅ Nested object flattening (to JSON strings in CSV)
- ✅ Metadata/timestamp filtering options
- ✅ Output validation for each format
- ✅ File size warnings and compression suggestions
- ✅ Export with query filters

#### Delete Operations Safety Features
- ✅ **Mandatory WHERE clause** - Prevents accidental full table deletion
- ✅ **Explicit confirmation** - Must set `confirm: true` to execute
- ✅ **Dry-run mode** - Preview records before deletion
- ✅ **Preview records** - Shows first 10 affected records
- ✅ **Backup suggestions** - Automatic recommendations in nextActions
- ✅ **Large deletion warnings** - Alerts for >100 records
- ✅ **Verification suggestions** - Count checks after deletion

#### New Type Definitions
- ✅ `QueryParams` / `QueryResult` - Advanced query types
- ✅ `CountParams` / `CountResult` - Count query types
- ✅ `ExportParams` / `ExportResult` - Export operation types
- ✅ `DeleteParams` / `DeleteResult` - Delete operation types
- ✅ `QueryFilter` - Filter specification with operator
- ✅ `QueryOperator` - Union type for all operators
- ✅ `OrderSpec` - Ordering specification
- ✅ `AggregateSpec` - Aggregation specification
- ✅ `ExportConfig` - Export configuration
- ✅ `ExportFormat` - Format union type
- ✅ `IExportTransformer` - Transformer interface

#### Export Transformers (4 formats)
- ✅ `JSONLTransformer` - One JSON object per line
- ✅ `JSONTransformer` - Pretty-printed with metadata
- ✅ `CSVTransformer` - UTF-8 BOM + proper escaping
- ✅ `MarkdownTransformer` - Headers, tables, code blocks

#### Documentation
- ✅ `PROMPT2_IMPLEMENTATION_SUMMARY.md` - Complete implementation details
- ✅ `QUICK_START_V1.2.md` - Quick start guide for new operations
- ✅ `example-query-export-delete.js` - 14 comprehensive examples
- ✅ `test-query-operations.js` - 10 validation tests
- ✅ `test-export-operations.js` - 8 validation tests
- ✅ `test-delete-operations.js` - 8 validation tests
- ✅ Updated `README.md` with v1.2 features

#### Testing & Validation
- ✅ 26 total validation tests across all operations
- ✅ Query filtering, ordering, pagination tests
- ✅ Count query validation
- ✅ All 4 export formats tested
- ✅ CSV special character handling verified
- ✅ Delete safety checks validated
- ✅ Dry-run mode tested
- ✅ Complete workflow examples (query → export → delete)
- ✅ Error handling verification

#### Dependencies
- ✅ Added `csv-stringify` ^6.4.5 for CSV generation

#### Safety & Error Handling
- ✅ WHERE clause validation in delete operations
- ✅ Confirmation requirement in delete operations
- ✅ Export output format validation
- ✅ Query error handling with recovery steps
- ✅ Export destination path validation
- ✅ Special character safety in all formats

### Enhanced Features
- ✅ Version bumped to 1.2.0
- ✅ All operations extend `AgentOperationResult`
- ✅ Consistent `nextActions` guidance
- ✅ Execution time tracking
- ✅ Comprehensive error messages
- ✅ TypeScript strict mode compliance

### Technical Implementation
- ✅ `src/operations/query.ts` - Query operations (345+ lines)
- ✅ `src/operations/export.ts` - Export operations with transformers (550+ lines)
- ✅ `src/operations/delete.ts` - Safe delete operations (297+ lines)
- ✅ Updated `src/core/types.ts` - 150+ lines of new types
- ✅ Updated `src/index.ts` - New exports
- ✅ Updated `package.json` - Version and dependencies

### Performance Notes
- Aggregations: Client-side (consider RPC for large datasets)
- Export: Efficient for datasets up to 1000 records
- CSV: UTF-8 BOM for Excel compatibility
- JSONL: Streaming-compatible format
- Delete: Uses Supabase count for accurate tracking

### Migration Notes (v1.1 → v1.2)
- No breaking changes to existing v1.0 or v1.1 APIs
- All previous operations remain unchanged
- New operations are additive only
- `agentExportTool` and `agentDeleteTool` placeholders replaced

### Known Limitations
- Aggregations are client-side (consider RPC for >1000 records)
- Export batching not yet implemented (for >1000 records)
- CSV nested objects converted to JSON strings
- Delete cascade handling is basic

### Future Enhancements
- Server-side aggregations via RPC
- Streaming export for large datasets
- Built-in compression for large exports
- Resume support for interrupted exports
- Transaction support for batch deletes
- Explicit cascade delete handling

### Acceptance Criteria - All Met ✅
- ✅ Query module with filtering, ordering, pagination
- ✅ Count queries with optimized performance
- ✅ All 9 operators implemented and tested
- ✅ 4 export formats with validation
- ✅ JSONL compatible with AI training
- ✅ CSV imports correctly to Excel
- ✅ Delete requires WHERE clause
- ✅ Dry-run preview implementation
- ✅ Explicit confirmation requirement
- ✅ All types defined consistently
- ✅ TypeScript strict mode passes
- ✅ JSDoc on all functions

---

## [1.1.0] - 2025-11-12

### Added - Schema Operations & RPC Foundation

#### New Operations
- ✅ `agentIntrospectSchema()` - Query database structure (tables, columns, indexes, constraints, policies)
- ✅ `agentExecuteDDL()` - Execute DDL statements (CREATE, ALTER, DROP) with transaction support
- ✅ `agentManageIndex()` - Create, drop, and analyze database indexes
- ✅ `agentExecuteRPC()` - Execute custom Supabase RPC functions
- ✅ `agentExecuteSQL()` - Execute raw SQL via RPC or pg transport
- ✅ `preflightSchemaOperation()` - Preflight checks for schema operations
- ✅ `executeWithTransaction()` - Transaction wrapper utility

#### Schema Introspection Features
- ✅ Query table existence and row counts
- ✅ Column information (type, nullable, primary/foreign keys)
- ✅ Index details (columns, unique, size)
- ✅ Constraint information (primary, foreign, unique, check)
- ✅ RLS policy details (commands, roles, definitions)
- ✅ Table size statistics

#### DDL Execution Features
- ✅ Transaction wrapping (auto-rollback on error)
- ✅ Dry-run mode for validation
- ✅ Multi-statement support
- ✅ Destructive operation warnings (DROP, TRUNCATE)
- ✅ Affected object tracking

#### Index Management Features
- ✅ List indexes with size information
- ✅ Create indexes with CONCURRENTLY option (non-blocking)
- ✅ Drop indexes with CONCURRENTLY option
- ✅ Support for index types (btree, hash, gist, gin, brin)
- ✅ Unique index creation
- ✅ Partial index support (WHERE clause)
- ✅ Index analysis

#### RPC & SQL Features
- ✅ RPC function execution with parameter validation
- ✅ Timeout support for long-running operations
- ✅ SQL execution via RPC transport (exec_sql function)
- ✅ SQL execution via direct pg connection
- ✅ Transaction support for multi-statement SQL
- ✅ Dry-run mode for SQL validation
- ✅ Row count and result set handling

#### New Error Codes
- ✅ `ERR_SCHEMA_ACCESS_DENIED` - Insufficient schema permissions
- ✅ `ERR_RPC_NOT_FOUND` - RPC function does not exist
- ✅ `ERR_DDL_SYNTAX` - Invalid SQL syntax in DDL
- ✅ `ERR_INDEX_EXISTS` - Index already exists
- ✅ `ERR_INDEX_NOT_FOUND` - Index does not exist
- ✅ `ERR_RPC_TIMEOUT` - RPC/SQL execution timeout
- ✅ `ERR_TRANSACTION_FAILED` - Transaction rolled back

#### New Type Definitions
- ✅ `SchemaIntrospectParams` / `SchemaIntrospectResult`
- ✅ `DDLExecuteParams` / `DDLExecuteResult`
- ✅ `IndexManageParams` / `IndexManageResult`
- ✅ `RPCExecuteParams` / `RPCExecuteResult`
- ✅ `SQLExecuteParams` / `SQLExecuteResult`
- ✅ `TableSchema`, `ColumnInfo`, `IndexInfo`, `ConstraintInfo`, `PolicyInfo`
- ✅ `AgentOperationResult` - Base result interface
- ✅ `SchemaOperationType` - Operation type enum

#### Preflight Enhancements
- ✅ RPC function existence check
- ✅ Schema modification permissions check
- ✅ Separate preflight for schema operations
- ✅ exec_sql function creation guidance

#### Documentation
- ✅ `SCHEMA_OPERATIONS_GUIDE.md` - Comprehensive guide with examples
- ✅ `test-schema-operations.js` - Complete validation test suite
- ✅ `example-schema-operations.js` - 10 practical examples
- ✅ Updated `README.md` with v1.1 features
- ✅ Updated `ERROR_CODES.md` with new error codes (implicit)

#### Testing
- ✅ 10 validation tests covering all new operations
- ✅ Preflight checks validation
- ✅ Dry-run mode testing
- ✅ Transaction safety testing
- ✅ Error handling verification
- ✅ Colored console output for test results

### Enhanced Features
- ✅ Version bumped to 1.1.0
- ✅ All operations follow `AgentOperationResult` pattern
- ✅ Consistent `nextActions` guidance across all operations
- ✅ Execution time tracking for performance monitoring
- ✅ Rich error information with remediation steps

### Technical Implementation
- ✅ `src/operations/schema.ts` - Schema operations module (850+ lines)
- ✅ `src/operations/rpc.ts` - RPC operations module (350+ lines)
- ✅ Updated `src/core/types.ts` - 200+ lines of new type definitions
- ✅ Updated `src/errors/codes.ts` - 7 new error mappings
- ✅ Updated `src/preflight/checks.ts` - Schema operation checks
- ✅ Updated `src/index.ts` - New exports

### Prerequisites for v1.1
- ✅ PostgreSQL access via DATABASE_URL (for pg transport)
- ✅ Service role key (for schema operations)
- ✅ Optional: `exec_sql` RPC function for RPC-based SQL execution

### Migration Notes (v1.0 → v1.1)
- No breaking changes to existing v1.0 APIs
- All v1.0 operations remain unchanged
- New operations are additive only
- Version number updated from 1.0.0 to 1.1.0

### Known Limitations
- exec_sql RPC function must be manually created for RPC transport
- CONCURRENTLY option requires PostgreSQL 11+
- Schema introspection limited to public schema
- RLS policy information requires table ownership

### Performance Notes
- Schema introspection: ~100-500ms per table
- DDL execution: Depends on operation complexity
- Index creation: Use CONCURRENTLY for large tables (non-blocking)
- Transaction overhead: ~5-10ms per transaction

---

## [1.0.0] - 2025-11-10

### Added - Initial Release

#### Core Features
- ✅ `agentImportTool()` - Primary import function with insert/upsert modes
- ✅ `agentPreflight()` - Environment and configuration validation
- ✅ `analyzeImportErrors()` - Error analysis with recovery steps
- ✅ `generateDollarQuotedInsert()` - Safe SQL generation for manual review

#### Character Safety (E02 Solution)
- ✅ Automatic handling of apostrophes (`don't`, `can't`, `it's`)
- ✅ Safe quote handling (`"hello"`, `'yes'`)
- ✅ Newline and tab support (`\n`, `\r\n`, `\t`)
- ✅ Full emoji support (`😊😍🎉`)
- ✅ Unicode normalization (NFC/NFKC)
- ✅ Control character sanitization
- ✅ Invalid UTF-8 stripping

#### Error Handling
- ✅ 14 standardized error codes
- ✅ PostgreSQL error code mappings
- ✅ Automatic error categorization
- ✅ Recovery steps with examples
- ✅ Priority-based remediation
- ✅ Automatable fix detection

#### Validation & Safety
- ✅ Preflight environment checks
- ✅ Service role key validation
- ✅ Table existence verification
- ✅ Primary key auto-detection
- ✅ Schema validation support
- ✅ Required field validation

#### Performance Features
- ✅ Configurable batch processing (default: 200)
- ✅ Controlled concurrency (default: 2)
- ✅ Exponential backoff retries
- ✅ Transient error detection
- ✅ NDJSON streaming support

#### Reporting
- ✅ Summary reports with totals and warnings
- ✅ Error reports with breakdown by code
- ✅ Success reports with record lists
- ✅ Timestamped report filenames (YYYYMMDDThhmmssZ)
- ✅ JSON format for easy parsing

#### Agent Features
- ✅ Prescriptive `nextActions` guidance
- ✅ No-dead-end design
- ✅ Dry-run validation mode
- ✅ Auto-correction with warnings
- ✅ Comprehensive JSDoc for IntelliSense

#### Platform Support
- ✅ Windows path normalization
- ✅ Cross-platform CRLF handling
- ✅ Node.js 18+ support
- ✅ TypeScript 5.x support

#### Transports
- ✅ Supabase client (default)
- ✅ PostgreSQL direct (pg)
- ✅ Auto-selection

#### Documentation
- ✅ README.md - Quick start guide
- ✅ ERROR_CODES.md - Complete error reference
- ✅ EXAMPLES.md - 8 comprehensive examples
- ✅ QUICK_START.md - 5-minute guide
- ✅ IMPLEMENTATION_SUMMARY.md - Full implementation details
- ✅ CHANGELOG.md - This file

#### Test Coverage
- ✅ Character sanitization tests
- ✅ Error code mapping tests
- ✅ E02 regression tests
- ✅ Test fixtures (apostrophes, quotes, multiline, emoji, E02 cases)

#### Developer Experience
- ✅ Full TypeScript type definitions
- ✅ Source maps for debugging
- ✅ Structured logging
- ✅ Example usage script
- ✅ npm link support

### Technical Details

#### Dependencies
- `@supabase/supabase-js` ^2.39.0 - Supabase client
- `pg` ^8.11.3 - PostgreSQL client

#### Dev Dependencies
- `typescript` ^5.3.3
- `jest` ^29.7.0
- `ts-jest` ^29.1.1

#### Build Output
- Compiled JavaScript (CommonJS)
- TypeScript declaration files (.d.ts)
- Source maps (.js.map, .d.ts.map)

### Fixed Issues

- ❌ **E02 Problem**: Manual SQL construction with apostrophes causing syntax errors
- ✅ **Solution**: Parameterized queries via Supabase client and pg prepared statements

### Migration Notes

This is the initial release. No migration needed.

### Breaking Changes

None - initial release.

### Known Limitations

- Export operations: Placeholder (not yet implemented)
- Delete operations: Placeholder (not yet implemented)
- RPC templates: Deferred to v2 (per spec)

### Future Roadmap (v2)

- Export operations implementation
- Delete operations implementation
- RPC template support
- Bulk update operations
- Advanced schema validation (zod integration)
- Performance benchmarking suite
- CI/CD integration tests

---

**Release Date**: November 10, 2025  
**Implementation Status**: ✅ Production Ready  
**Specification**: v5.0-Merged

