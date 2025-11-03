# Supabase Access Methods - Complete Interface Documentation v1.0

**Purpose**: Comprehensive documentation of all methods for interfacing with Supabase tables, organized from least to most powerful for data auditing and analysis.

**Target Audience**: Analysis agents auditing project data  
**Generated**: January 2025  
**Status**: `exec_sql` function confirmed operational

---

## Table of Contents

1. [Read-Only Query Methods (Least Powerful)](#1-read-only-query-methods-least-powerful)
2. [Basic Data Manipulation Methods](#2-basic-data-manipulation-methods)
3. [Advanced Query & RPC Methods](#3-advanced-query--rpc-methods)
4. [Schema Verification & Analysis Tools](#4-schema-verification--analysis-tools)
5. [Migration & DDL Execution Methods](#5-migration--ddl-execution-methods)
6. [Direct Database Administration (Most Powerful)](#6-direct-database-administration-most-powerful)

---

## 1. Read-Only Query Methods (Least Powerful)

### 1.1 Basic Table Queries

**File**: `src/scripts/cursor-db-helper.js`
- **Method**: `query <table_name> [--limit <number>] [--where <column>=<value>]`
- **Power Level**: ⭐ (Read-only)
- **Description**: Basic SELECT queries with optional filtering
- **Usage**: `node scripts/cursor-db-helper.js query chunks --limit 5`
- **Supabase Operations**: `.select()`, `.limit()`, `.eq()`

**File**: `src/scripts/cursor-db-helper.js`
- **Method**: `count <table_name>`
- **Power Level**: ⭐ (Read-only)
- **Description**: Count records in a table
- **Usage**: `node scripts/cursor-db-helper.js count conversations`
- **Supabase Operations**: `.select('*', { count: 'exact', head: true })`

**File**: `src/scripts/cursor-db-helper.js`
- **Method**: `describe <table_name>`
- **Power Level**: ⭐ (Read-only)
- **Description**: Show table structure and sample data
- **Usage**: `node scripts/cursor-db-helper.js describe templates`
- **Supabase Operations**: `.select().limit(1)`

### 1.2 Service Layer Read Operations

**File**: `src/lib/services/template-service.ts`
- **Methods**: `getAll()`, `getById()`, `search()`, `getByCategory()`
- **Power Level**: ⭐ (Read-only)
- **Description**: Template retrieval with filtering
- **Supabase Operations**: `.select()`, `.eq()`, `.ilike()`, `.order()`

**File**: `src/lib/services/scenario-service.ts`
- **Methods**: `getAll()`, `getById()`, `getByTemplateId()`
- **Power Level**: ⭐ (Read-only)
- **Description**: Scenario retrieval with template relationships
- **Supabase Operations**: `.select()`, `.eq()`, `.order()`

**File**: `src/lib/services/edge-case-service.ts`
- **Methods**: `getAll()`, `getById()`, `getByScenarioId()`, `getByType()`
- **Power Level**: ⭐ (Read-only)
- **Description**: Edge case retrieval with scenario relationships
- **Supabase Operations**: `.select()`, `.eq()`, `.order()`

**File**: `src/lib/services/conversation-service.ts`
- **Methods**: `getAll()`, `getById()`, `getByStatus()`, `getByFilters()`
- **Power Level**: ⭐ (Read-only)
- **Description**: Conversation retrieval with advanced filtering
- **Supabase Operations**: `.select()`, `.eq()`, `.in()`, `.gte()`, `.lte()`

**File**: `src/lib/services/review-queue-service.ts`
- **Methods**: `fetchReviewQueue()`, `getQueueStatistics()`
- **Power Level**: ⭐ (Read-only)
- **Description**: Review queue data retrieval
- **Supabase Operations**: `.select()`, `.eq()`, `.order()`, `.range()`

**File**: `src/lib/services/ai-config-service.ts`
- **Methods**: `getConfiguration()`, `getEffectiveConfiguration()`
- **Power Level**: ⭐ (Read-only)
- **Description**: AI configuration retrieval with fallback chain
- **Supabase Operations**: `.select()`, `.eq()`, `.single()`

---

## 2. Basic Data Manipulation Methods

### 2.1 Service Layer CRUD Operations

**File**: `src/lib/services/template-service.ts`
- **Methods**: `create()`, `update()`, `incrementUsageCount()`, `updateRating()`
- **Power Level**: ⭐⭐ (Write operations)
- **Description**: Template creation and modification
- **Supabase Operations**: `.insert()`, `.update()`, `.select().single()`

**File**: `src/lib/services/scenario-service.ts`
- **Methods**: `create()`, `update()`, `bulkCreate()`, `updateGenerationStatus()`
- **Power Level**: ⭐⭐ (Write operations)
- **Description**: Scenario management with batch operations
- **Supabase Operations**: `.insert()`, `.update()`, `.select().single()`

**File**: `src/lib/services/edge-case-service.ts`
- **Methods**: `create()`, `update()`, `updateTestStatus()`
- **Power Level**: ⭐⭐ (Write operations)
- **Description**: Edge case management with test tracking
- **Supabase Operations**: `.insert()`, `.update()`, `.select().single()`

**File**: `src/lib/services/conversation-service.ts`
- **Methods**: `create()`, `update()`, `createWithTurns()`, `addTurn()`
- **Power Level**: ⭐⭐ (Write operations)
- **Description**: Conversation and turn management with transactions
- **Supabase Operations**: `.insert()`, `.update()`, `.select().single()`

**File**: `src/lib/services/ai-config-service.ts`
- **Methods**: `createConfiguration()`, `updateConfiguration()`, `rotateApiKey()`
- **Power Level**: ⭐⭐ (Write operations)
- **Description**: AI configuration management with key rotation
- **Supabase Operations**: `.insert()`, `.update()`, `.upsert()`

### 2.2 Safe Delete Operations

**File**: `src/lib/services/template-service.ts`
- **Method**: `delete()`
- **Power Level**: ⭐⭐ (Destructive write)
- **Description**: Template deletion with dependency checking
- **Supabase Operations**: `.rpc('safe_delete_template')`, `.delete()`

**File**: `src/lib/services/scenario-service.ts`
- **Method**: `delete()`
- **Power Level**: ⭐⭐ (Destructive write)
- **Description**: Scenario deletion with edge case dependency checking
- **Supabase Operations**: `.rpc('safe_delete_scenario')`, `.delete()`

**File**: `src/lib/services/edge-case-service.ts`
- **Method**: `delete()`
- **Power Level**: ⭐⭐ (Destructive write)
- **Description**: Direct edge case deletion (no dependencies)
- **Supabase Operations**: `.delete()`

---

## 3. Advanced Query & RPC Methods

### 3.1 Custom RPC Functions

**File**: `src/lib/services/database-health-service.ts`
- **Methods**: `getTableHealthMetrics()`, `getIndexHealthMetrics()`, `getQueryPerformanceMetrics()`
- **Power Level**: ⭐⭐⭐ (System queries)
- **Description**: Database health monitoring via custom RPC functions
- **Supabase Operations**: `.rpc('get_table_health')`, `.rpc('get_index_health')`

**File**: `src/lib/services/database-maintenance-service.ts`
- **Methods**: `executeVacuum()`, `executeAnalyze()`, `executeReindex()`
- **Power Level**: ⭐⭐⭐ (Maintenance operations)
- **Description**: Database maintenance operations via RPC
- **Supabase Operations**: `.rpc('execute_vacuum')`, `.rpc('execute_analyze')`, `.rpc('execute_reindex')`

**File**: `src/lib/services/config-rollback-service.ts`
- **Methods**: `getChangeHistory()`, `previewRollback()`, `executeRollback()`
- **Power Level**: ⭐⭐⭐ (Configuration management)
- **Description**: Configuration change management and rollback
- **Supabase Operations**: `.rpc('get_effective_ai_config')`, `.select()`, `.update()`

### 3.2 Performance Monitoring

**File**: `src/lib/services/query-performance-service.ts`
- **Methods**: `logQueryPerformance()`, `getSlowQueries()`, `getPerformanceMetrics()`
- **Power Level**: ⭐⭐⭐ (Performance analysis)
- **Description**: Query performance tracking and analysis
- **Supabase Operations**: `.insert()`, `.select()`, `.gte()`, `.order()`

**File**: `src/lib/services/index-monitoring-service.ts`
- **Methods**: `captureIndexUsageSnapshot()`, `getUnusedIndexes()`, `getIndexRecommendations()`
- **Power Level**: ⭐⭐⭐ (Index analysis)
- **Description**: Database index usage monitoring
- **Supabase Operations**: `.insert()`, `.select()`, custom queries

---

## 4. Schema Verification & Analysis Tools

### 4.1 Table Structure Verification

**File**: `src/scripts/verify-e01-tables.sql`
- **Power Level**: ⭐⭐⭐ (Schema analysis)
- **Description**: SQL script for comprehensive table structure verification
- **Operations**: Direct SQL queries to `information_schema`

**File**: `src/scripts/verify-e05-tables.sql`
- **Power Level**: ⭐⭐⭐ (Schema analysis)
- **Description**: Export logs table structure verification
- **Operations**: Direct SQL queries to `pg_indexes`, `pg_policies`, `pg_constraint`

### 4.2 Automated Schema Checking Scripts

**File**: `src/scripts/check-e01-sql-detailed.js`
- **Power Level**: ⭐⭐⭐ (Schema analysis)
- **Description**: Automated E01 module table verification
- **Supabase Operations**: `.from('information_schema.tables').select()`

**File**: `src/scripts/check-e05-sql-detailed.js`
- **Power Level**: ⭐⭐⭐ (Schema analysis)
- **Description**: Export logs table detailed verification
- **Supabase Operations**: `.from('information_schema.columns').select()`

**File**: `src/scripts/check-e06-sql.js`
- **Power Level**: ⭐⭐⭐ (Schema analysis)
- **Description**: E06 module schema verification
- **Supabase Operations**: `.rpc('exec_sql')` for schema queries

**File**: `src/scripts/check-e07-sql-detailed.js`
- **Power Level**: ⭐⭐⭐ (Schema analysis)
- **Description**: E07 module detailed schema verification
- **Supabase Operations**: Information schema queries

**File**: `src/scripts/check-e08-sql-detailed.js`
- **Power Level**: ⭐⭐⭐ (Schema analysis)
- **Description**: E08 settings module comprehensive verification
- **Supabase Operations**: Complex schema analysis queries

### 4.3 RPC-Based Schema Introspection

**File**: `src/scripts/verify-e05-with-rpc.js`
- **Power Level**: ⭐⭐⭐ (Advanced schema analysis)
- **Description**: Complete schema introspection via custom RPC function
- **Supabase Operations**: `.rpc('get_export_logs_schema')`
- **Features**: Columns, indexes, constraints, RLS policies analysis

**File**: `src/scripts/verify-e05-complete.js`
- **Power Level**: ⭐⭐⭐ (Comprehensive verification)
- **Description**: Complete E05 table verification with detailed reporting
- **Supabase Operations**: `.from('information_schema').select()`, detailed analysis

---

## 5. Migration & DDL Execution Methods

### 5.1 Migration Management Framework

**File**: `src/scripts/migrate.ts`
- **Power Level**: ⭐⭐⭐⭐ (Schema modification)
- **Description**: Complete migration management system
- **Commands**: `status`, `up`, `down`, `create`
- **Supabase Operations**: `.rpc('exec_sql')` for DDL execution
- **Capabilities**: 
  - Execute CREATE TABLE, ALTER TABLE, DROP TABLE
  - Add/remove constraints and indexes
  - Migration history tracking
  - Rollback support

**File**: `src/scripts/test-migration-framework.ts`
- **Power Level**: ⭐⭐⭐⭐ (Migration testing)
- **Description**: Migration framework testing and validation
- **Supabase Operations**: `.rpc('exec_sql')`, `.rpc('table_exists')`

### 5.2 Migration Utilities

**File**: `src/lib/services/migration-utils.ts`
- **Power Level**: ⭐⭐⭐⭐ (DDL generation)
- **Description**: Safe DDL statement generation utilities
- **Functions**: 
  - `addColumnSafely()` - Generate ALTER TABLE ADD COLUMN
  - `addConstraintSafely()` - Generate constraint addition
  - `renameColumnSafely()` - Generate column rename statements
  - `createIndexConcurrently()` - Generate concurrent index creation
  - `dropColumnSafely()` - Generate safe column removal
  - `generateMigrationTemplate()` - Create migration file templates

**File**: `src/lib/services/migration-manager.ts`
- **Power Level**: ⭐⭐⭐⭐ (Migration execution)
- **Description**: Migration execution and validation management
- **Functions**:
  - `isMigrationApplied()` - Check migration status
  - `recordMigration()` - Track applied migrations
  - `removeMigration()` - Remove migration records
  - `validateMigration()` - Validate migration safety

### 5.3 Migration Testing

**File**: `src/lib/services/migration-testing.ts`
- **Power Level**: ⭐⭐⭐⭐ (DDL execution)
- **Description**: Migration testing with SQL execution
- **Methods**: `executeSQL()`, `tableExists()`
- **Supabase Operations**: `.rpc('exec_sql')`, `.rpc('table_exists')`

---

## 6. Direct Database Administration (Most Powerful)

### 6.1 Direct SQL Execution

**File**: `src/scripts/cursor-db-helper.js`
- **Power Level**: ⭐⭐⭐⭐⭐ (Full DDL/DML access)
- **Description**: Direct SQL execution with full database access
- **Method**: `sql "<SQL_STATEMENT>"`
- **Usage**: `node scripts/cursor-db-helper.js sql "CREATE TABLE test (id SERIAL PRIMARY KEY)"`
- **Supabase Operations**: `.rpc('exec_sql')` with arbitrary SQL
- **Capabilities**:
  - CREATE/ALTER/DROP tables
  - CREATE/DROP indexes
  - ADD/DROP constraints
  - INSERT/UPDATE/DELETE data
  - CREATE/DROP functions
  - GRANT/REVOKE permissions

### 6.2 Administrative RPC Functions

**Available via `exec_sql` RPC function**:
- **Power Level**: ⭐⭐⭐⭐⭐ (Superuser operations)
- **Description**: Execute any SQL statement with SECURITY DEFINER privileges
- **Capabilities**:
  - Schema modifications (DDL)
  - Data manipulation (DML)
  - Function creation/modification
  - Permission management
  - System catalog queries
  - Performance tuning operations

### 6.3 Database Maintenance Operations

**File**: `src/lib/services/database-maintenance-service.ts`
- **Power Level**: ⭐⭐⭐⭐⭐ (System maintenance)
- **Description**: Direct database maintenance with superuser privileges
- **Operations**:
  - `VACUUM` and `VACUUM FULL`
  - `ANALYZE` for statistics updates
  - `REINDEX` for index rebuilding
- **Supabase Operations**: `.rpc('execute_vacuum')`, `.rpc('execute_analyze')`, `.rpc('execute_reindex')`

---

## Security & Access Control

### Row Level Security (RLS)
- **All service layer operations** automatically respect RLS policies
- **User context** maintained through Supabase auth
- **Automatic filtering** based on user permissions

### Service Role Access
- **Migration scripts** use service role key for elevated privileges
- **Maintenance operations** use SECURITY DEFINER functions
- **Schema operations** require service role authentication

### Function Security
- **Custom RPC functions** use SECURITY DEFINER for system access
- **Execution permissions** granted to specific roles
- **Input validation** performed within functions

---

## Usage Recommendations by Power Level

### For Data Analysis (⭐ Read-Only)
1. Use service layer methods for structured data access
2. Use `cursor-db-helper.js` for ad-hoc queries
3. Leverage schema verification scripts for structure analysis

### For Data Modification (⭐⭐ Write Operations)
1. Use service layer CRUD methods for safe operations
2. Leverage built-in validation and error handling
3. Use safe delete methods to prevent orphaned data

### For System Analysis (⭐⭐⭐ Advanced Queries)
1. Use RPC-based schema introspection for detailed analysis
2. Leverage performance monitoring services
3. Use verification scripts for comprehensive checks

### For Schema Changes (⭐⭐⭐⭐ DDL Operations)
1. Use migration framework for systematic changes
2. Generate DDL with migration utilities
3. Test changes with migration testing framework

### For Direct Administration (⭐⭐⭐⭐⭐ Full Access)
1. Use `cursor-db-helper.js` with `sql` command for direct execution
2. Execute maintenance operations via service layer
3. Use `exec_sql` RPC function for complex operations

---

## File Reference Summary

### Service Layer Files
- `src/lib/services/template-service.ts` - Template CRUD operations
- `src/lib/services/scenario-service.ts` - Scenario management
- `src/lib/services/edge-case-service.ts` - Edge case operations
- `src/lib/services/conversation-service.ts` - Conversation management
- `src/lib/services/ai-config-service.ts` - AI configuration management
- `src/lib/services/review-queue-service.ts` - Review queue operations
- `src/lib/services/config-rollback-service.ts` - Configuration rollback
- `src/lib/services/database-health-service.ts` - Health monitoring
- `src/lib/services/database-maintenance-service.ts` - Maintenance operations
- `src/lib/services/query-performance-service.ts` - Performance monitoring
- `src/lib/services/index-monitoring-service.ts` - Index analysis

### Migration & DDL Files
- `src/scripts/migrate.ts` - Migration management framework
- `src/scripts/test-migration-framework.ts` - Migration testing
- `src/lib/services/migration-utils.ts` - DDL generation utilities
- `src/lib/services/migration-manager.ts` - Migration execution
- `src/lib/services/migration-testing.ts` - Migration testing service

### Verification & Analysis Scripts
- `src/scripts/cursor-db-helper.js` - Direct database helper
- `src/scripts/verify-e05-with-rpc.js` - RPC-based schema introspection
- `src/scripts/check-e01-sql-detailed.js` - E01 module verification
- `src/scripts/check-e05-sql-detailed.js` - E05 module verification
- `src/scripts/check-e06-sql.js` - E06 module verification
- `src/scripts/check-e07-sql-detailed.js` - E07 module verification
- `src/scripts/check-e08-sql-detailed.js` - E08 module verification
- `src/scripts/verify-e01-tables.sql` - E01 SQL verification
- `src/scripts/verify-e05-tables.sql` - E05 SQL verification
- `src/scripts/verify-e05-complete.js` - Complete E05 verification

### Documentation Files
- `src/scripts/CURSOR_DATABASE_GUIDE.md` - Database helper guide
- `src/lib/services/template-management-README.md` - Service documentation
- `src/lib/services/IMPLEMENTATION-SUMMARY.md` - Implementation overview
- `src/lib/services/VALIDATION-CHECKLIST.md` - Validation guidelines

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Status**: Complete - All interface methods documented and categorized  
**exec_sql Function**: ✅ Confirmed operational