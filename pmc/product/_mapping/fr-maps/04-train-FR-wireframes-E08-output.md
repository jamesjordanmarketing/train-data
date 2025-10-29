# Interactive LoRA Training Data Platform - Feature & Function Task Inventory (Generated 2025-10-29)
**Scope:** FR8.1.1, FR8.2.1, FR8.2.2 - Settings & Administration Module
**Product:** Train - Training Data Generation Platform
**Version:** 1.0.0
**Date:** October 29, 2025

---

## Document Overview

**Purpose:** This document provides a comprehensive task inventory for implementing the Settings & Administration module (FR8.X) of the Interactive LoRA Conversation Generation platform.

**Scope Coverage:**
- **FR8.1.1:** Customizable User Settings (User Experience / Personalization)
- **FR8.2.1:** AI Generation Settings (Quality Control / Cost Management)
- **FR8.2.2:** Database Maintenance (System Health / Performance)

**Implementation Context:**
- **Current Wireframe:** `train-wireframe/src/` - Contains basic SettingsView with minimal preferences
- **Main Codebase:** `src/` - Contains AI configuration and database services
- **Target Output:** Production-ready Settings & Administration module with live data integration

**Development Approach:**
- Follow three-tier architecture pattern (Foundation → Core Features → Advanced Features)
- Leverage existing Zustand state management
- Integrate with Supabase backend
- Use Shadcn/UI component library for consistency
- Maintain TypeScript strict mode throughout

---

## 1. Foundation & Infrastructure

### T-1.1.0: User Preferences Data Model & Storage

- **FR Reference**: FR8.1.1
- **Impact Weighting**: System Foundation / User Experience
- **Implementation Location**: `src/lib/types/user-preferences.ts`, `src/lib/database.ts`
- **Pattern**: Database-backed user preferences with local state synchronization
- **Dependencies**: None (Foundation task)
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Establish comprehensive user preferences data model extending existing UserPreferences type, implement database schema for persistent storage, and create service layer for CRUD operations.
- **Testing Tools**: Vitest, Supabase SQL testing
- **Test Coverage Requirements**: 90%+ for service layer, 100% for critical paths
- **Completes Component?**: Yes - Completes foundational user preferences infrastructure

**Functional Requirements Acceptance Criteria**:
- UserPreferences type extended to include all configurable options from FR8.1.1
- Database table `user_preferences` created with proper constraints and indexes
- User preferences stored per user_id with foreign key to auth.users
- Service layer provides type-safe CRUD operations
- Auto-save functionality implemented with debouncing (300ms)
- Migration scripts created for schema deployment
- Default preferences applied on first user access
- Preferences validation ensures data integrity
- Rollback support for failed preference updates
- Audit trail captures preference change history

#### T-1.1.1: Extend UserPreferences Type Definition

- **FR Reference**: FR8.1.1
- **Parent Task**: T-1.1.0
- **Implementation Location**: `train-wireframe/src/lib/types.ts`, new `src/lib/types/user-preferences.ts`
- **Pattern**: TypeScript interface extension with strict typing
- **Dependencies**: None
- **Estimated Human Work Hours**: 2 hours
- **Description**: Extend existing UserPreferences interface to include all configurable options: theme, display preferences, notification settings, default filters, export preferences, keyboard shortcuts, and quality thresholds.

**Components/Elements**:
- [T-1.1.1:ELE-1] **Core Display Preferences**: Theme (light/dark/system), sidebar collapsed state, table density, rows per page, animations enabled
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:216-223`
- [T-1.1.1:ELE-2] **Notification Preferences**: Toast notifications, email notifications, in-app notifications, notification frequency
  - Stubs and Code Location(s): New fields to add to UserPreferences interface
- [T-1.1.1:ELE-3] **Default Filter Preferences**: Default tier filter, default status filter, default quality range, auto-apply filters on load
  - Stubs and Code Location(s): New fields leveraging FilterConfig type `train-wireframe/src/lib/types.ts:159-168`
- [T-1.1.1:ELE-4] **Export Preferences**: Default export format, default metadata inclusion flags, auto-compression threshold
  - Stubs and Code Location(s): New fields based on ExportConfig type `train-wireframe/src/lib/types.ts:205-214`
- [T-1.1.1:ELE-5] **Keyboard Shortcuts Configuration**: Shortcuts enabled flag, custom key bindings map
  - Stubs and Code Location(s): Extends existing field `train-wireframe/src/lib/types.ts:222`
- [T-1.1.1:ELE-6] **Quality Threshold Preferences**: Auto-approval quality threshold, flagging threshold, minimum acceptable quality
  - Stubs and Code Location(s): New fields related to QualityMetrics `train-wireframe/src/lib/types.ts:14-24`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review existing UserPreferences type in wireframe (implements ELE-1)
   - [PREP-2] Identify all preference categories from FR8.1.1 acceptance criteria (implements ELE-2-6)
   - [PREP-3] Document TypeScript interface structure with JSDoc comments
2. Implementation Phase:
   - [IMP-1] Create new file `src/lib/types/user-preferences.ts` with comprehensive interface (implements ELE-1-6)
   - [IMP-2] Define NotificationPreferences sub-interface (implements ELE-2)
   - [IMP-3] Define DefaultFilterPreferences sub-interface using existing FilterConfig (implements ELE-3)
   - [IMP-4] Define ExportPreferences sub-interface based on ExportConfig (implements ELE-4)
   - [IMP-5] Define KeyboardShortcuts sub-interface with key binding map (implements ELE-5)
   - [IMP-6] Define QualityThresholds sub-interface (implements ELE-6)
   - [IMP-7] Add validation helper functions for preference values
   - [IMP-8] Export comprehensive UserPreferences type with all sub-interfaces
3. Validation Phase:
   - [VAL-1] TypeScript compilation succeeds with strict mode (validates ELE-1-6)
   - [VAL-2] All preference fields have appropriate default values defined (validates ELE-1-6)
   - [VAL-3] Validation functions handle edge cases (null, undefined, invalid values) (validates ELE-1-6)
   - [VAL-4] JSDoc documentation complete for all interfaces and fields

#### T-1.1.2: Database Schema for User Preferences

- **FR Reference**: FR8.1.1
- **Parent Task**: T-1.1.0
- **Implementation Location**: `src/supabase/migrations/YYYYMMDDHHMMSS_create_user_preferences.sql`
- **Pattern**: PostgreSQL table with JSONB for flexible preference storage
- **Dependencies**: T-1.1.1 (needs type definition)
- **Estimated Human Work Hours**: 3 hours
- **Description**: Create database table `user_preferences` with proper schema, constraints, indexes, and RLS policies for storing user preferences with audit trail support.

**Components/Elements**:
- [T-1.1.2:ELE-1] **Table Structure**: Primary key (id), foreign key to auth.users (user_id), preferences JSONB field, metadata fields
  - Stubs and Code Location(s): New migration file, reference pattern in `src/lib/database.ts:27-36`
- [T-1.1.2:ELE-2] **Constraints**: NOT NULL on user_id, UNIQUE constraint on user_id (one preferences record per user), CHECK constraint for valid JSONB
  - Stubs and Code Location(s): New migration file
- [T-1.1.2:ELE-3] **Indexes**: Btree index on user_id, GIN index on preferences JSONB for efficient queries
  - Stubs and Code Location(s): New migration file
- [T-1.1.2:ELE-4] **RLS Policies**: Users can only read/update their own preferences, authenticated access required
  - Stubs and Code Location(s): New migration file, reference existing RLS patterns in database
- [T-1.1.2:ELE-5] **Audit Fields**: created_at, updated_at timestamps with automatic triggers
  - Stubs and Code Location(s): New migration file, reference pattern in existing tables
- [T-1.1.2:ELE-6] **Default Values**: Function to insert default preferences on user creation
  - Stubs and Code Location(s): New migration file with trigger function

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review Supabase migration structure and patterns (implements ELE-1)
   - [PREP-2] Define table schema mapping UserPreferences type to JSONB structure (implements ELE-1)
   - [PREP-3] Plan indexing strategy for common query patterns (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Create migration file with CREATE TABLE statement (implements ELE-1)
   - [IMP-2] Add foreign key constraint to auth.users with ON DELETE CASCADE (implements ELE-1,2)
   - [IMP-3] Add UNIQUE constraint on user_id (implements ELE-2)
   - [IMP-4] Create GIN index on preferences JSONB column (implements ELE-3)
   - [IMP-5] Create btree index on user_id and created_at (implements ELE-3)
   - [IMP-6] Define RLS policies: SELECT for own user, UPDATE for own user (implements ELE-4)
   - [IMP-7] Add updated_at trigger for automatic timestamp updates (implements ELE-5)
   - [IMP-8] Create function to initialize default preferences on user signup (implements ELE-6)
   - [IMP-9] Add rollback migration script
3. Validation Phase:
   - [VAL-1] Migration runs successfully in development environment (validates ELE-1-6)
   - [VAL-2] RLS policies tested: users cannot access other users' preferences (validates ELE-4)
   - [VAL-3] Default preferences function creates valid JSONB matching TypeScript type (validates ELE-6)
   - [VAL-4] Indexes improve query performance (test with EXPLAIN ANALYZE) (validates ELE-3)
   - [VAL-5] Rollback migration successfully reverts changes

#### T-1.1.3: User Preferences Service Layer

- **FR Reference**: FR8.1.1
- **Parent Task**: T-1.1.0
- **Implementation Location**: `src/lib/services/user-preferences-service.ts`
- **Pattern**: Service layer with Supabase client integration
- **Dependencies**: T-1.1.1, T-1.1.2
- **Estimated Human Work Hours**: 3 hours
- **Description**: Implement service layer providing type-safe CRUD operations for user preferences with validation, error handling, and auto-save debouncing.

**Components/Elements**:
- [T-1.1.3:ELE-1] **Get Preferences**: Retrieve user preferences with fallback to defaults
  - Stubs and Code Location(s): New service file, reference pattern in `src/lib/database.ts:38-48`
- [T-1.1.3:ELE-2] **Update Preferences**: Partial update with validation and merge with existing preferences
  - Stubs and Code Location(s): New service file, reference pattern in `src/lib/database.ts:377-390`
- [T-1.1.3:ELE-3] **Reset to Defaults**: Restore default preferences for user
  - Stubs and Code Location(s): New service file
- [T-1.1.3:ELE-4] **Validation**: Validate preference values before database write
  - Stubs and Code Location(s): New service file using validators from T-1.1.1
- [T-1.1.3:ELE-5] **Error Handling**: Graceful error handling with user-friendly messages
  - Stubs and Code Location(s): New service file, reference error handling in `src/app/api/chunks/generate-dimensions/route.ts`
- [T-1.1.3:ELE-6] **Auto-save Debouncing**: Debounce preference updates to avoid excessive database writes
  - Stubs and Code Location(s): New service file with lodash.debounce or custom implementation

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review Supabase service patterns in existing codebase (implements ELE-1,2)
   - [PREP-2] Define service interface with all CRUD methods (implements ELE-1-3)
   - [PREP-3] Plan error handling strategy and error types (implements ELE-5)
2. Implementation Phase:
   - [IMP-1] Create userPreferencesService with Supabase client (implements ELE-1-3)
   - [IMP-2] Implement getPreferences() with fallback to defaults (implements ELE-1)
   - [IMP-3] Implement updatePreferences() with partial updates and JSONB merge (implements ELE-2)
   - [IMP-4] Implement resetToDefaults() clearing user preferences (implements ELE-3)
   - [IMP-5] Add validation layer checking all preference values (implements ELE-4)
   - [IMP-6] Implement error handling with try-catch and error transformation (implements ELE-5)
   - [IMP-7] Add debounced update wrapper for auto-save (300ms delay) (implements ELE-6)
   - [IMP-8] Export service with TypeScript types
3. Validation Phase:
   - [VAL-1] Unit tests for all service methods cover happy paths (validates ELE-1-3)
   - [VAL-2] Unit tests cover error scenarios and validation failures (validates ELE-4,5)
   - [VAL-3] Debouncing tested: rapid calls result in single database write (validates ELE-6)
   - [VAL-4] Service integrates correctly with Supabase backend (validates ELE-1-3)
   - [VAL-5] TypeScript types prevent invalid preferences at compile time (validates ELE-4)

---

### T-1.2.0: AI Configuration Data Model & Storage

- **FR Reference**: FR8.2.1
- **Impact Weighting**: System Foundation / Quality Control
- **Implementation Location**: `src/lib/types/ai-config.ts`, `src/lib/database.ts`, `src/lib/ai-config.ts`
- **Pattern**: Environment-based configuration with database overrides
- **Dependencies**: None (Foundation task)
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Establish AI generation configuration system supporting environment variables, database overrides, and runtime configuration changes. Extends existing basic AI_CONFIG to support comprehensive Claude API parameter management.
- **Testing Tools**: Vitest, Postman for API testing
- **Test Coverage Requirements**: 95%+ for configuration logic
- **Completes Component?**: Yes - Completes AI configuration infrastructure

**Functional Requirements Acceptance Criteria**:
- AI configuration type extended to include all Claude API parameters from FR8.2.1
- Database table `ai_configurations` created for per-user or per-organization overrides
- Configuration priority: user DB override → org DB override → environment variables → defaults
- Service layer provides configuration retrieval with proper fallback chain
- Rate limiting configuration integrated with batch job system
- Retry strategy configuration with validation
- Cost budget tracking configuration with alert thresholds
- API key rotation support with versioning
- Configuration change audit trail
- Real-time configuration updates without service restart

#### T-1.2.1: AI Configuration Type Definition

- **FR Reference**: FR8.2.1
- **Parent Task**: T-1.2.0
- **Implementation Location**: `src/lib/types/ai-config.ts`
- **Pattern**: TypeScript interface with comprehensive Claude API parameters
- **Dependencies**: None
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: Define comprehensive AIConfiguration interface covering all Claude API parameters, rate limiting, retry strategies, cost management, and model selection.

**Components/Elements**:
- [T-1.2.1:ELE-1] **Model Configuration**: model name, max tokens, temperature, top_p, streaming options
  - Stubs and Code Location(s): Extends `src/lib/ai-config.ts:2-8`
- [T-1.2.1:ELE-2] **Rate Limiting Configuration**: requests per minute, concurrent requests, burst allowance
  - Stubs and Code Location(s): New fields for rate control
- [T-1.2.1:ELE-3] **Retry Strategy Configuration**: max retries, backoff strategy (exponential/linear/fixed), base delay, max delay
  - Stubs and Code Location(s): New fields for error recovery
- [T-1.2.1:ELE-4] **Cost Budget Configuration**: daily budget, weekly budget, monthly budget, alert thresholds (50%, 75%, 90%)
  - Stubs and Code Location(s): New fields for cost management
- [T-1.2.1:ELE-5] **API Key Management**: primary key, secondary key (for rotation), key version, rotation schedule
  - Stubs and Code Location(s): Extends `src/lib/ai-config.ts:3`
- [T-1.2.1:ELE-6] **Timeout Configuration**: generation timeout, API connection timeout, total request timeout
  - Stubs and Code Location(s): New fields for timeout management
- [T-1.2.1:ELE-7] **Model Selection Options**: available models enum (Sonnet-4, Opus-3, Haiku-3), model capabilities metadata
  - Stubs and Code Location(s): Extends `src/lib/ai-config.ts:5`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review existing AI_CONFIG structure (implements ELE-1)
   - [PREP-2] Research Claude API documentation for all parameters (implements ELE-1-7)
   - [PREP-3] Define configuration validation rules for each parameter (implements ELE-1-7)
2. Implementation Phase:
   - [IMP-1] Create `src/lib/types/ai-config.ts` with AIConfiguration interface (implements ELE-1-7)
   - [IMP-2] Define ModelConfiguration sub-interface with all model parameters (implements ELE-1)
   - [IMP-3] Define RateLimitConfiguration sub-interface (implements ELE-2)
   - [IMP-4] Define RetryStrategyConfiguration sub-interface with backoff options enum (implements ELE-3)
   - [IMP-5] Define CostBudgetConfiguration sub-interface with thresholds (implements ELE-4)
   - [IMP-6] Define APIKeyConfiguration sub-interface with rotation metadata (implements ELE-5)
   - [IMP-7] Define TimeoutConfiguration sub-interface (implements ELE-6)
   - [IMP-8] Define AvailableModels enum and ModelCapabilities interface (implements ELE-7)
   - [IMP-9] Add comprehensive JSDoc documentation for all fields
   - [IMP-10] Create default configuration constant matching interface
3. Validation Phase:
   - [VAL-1] TypeScript compilation succeeds with strict mode (validates ELE-1-7)
   - [VAL-2] Default configuration includes all required fields (validates ELE-1-7)
   - [VAL-3] Validation functions reject invalid parameter combinations (validates ELE-1-7)
   - [VAL-4] Documentation complete and accurate (validates ELE-1-7)

#### T-1.2.2: AI Configuration Database Schema

- **FR Reference**: FR8.2.1
- **Parent Task**: T-1.2.0
- **Implementation Location**: `src/supabase/migrations/YYYYMMDDHHMMSS_create_ai_configurations.sql`
- **Pattern**: PostgreSQL table with JSONB for flexible configuration storage
- **Dependencies**: T-1.2.1
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Create database schema for storing AI configuration overrides at user and organization levels with proper constraints, indexes, and audit trail.

**Components/Elements**:
- [T-1.2.2:ELE-1] **Table Structure**: id, user_id (nullable), organization_id (nullable), config_name, configuration JSONB, is_active, priority
  - Stubs and Code Location(s): New migration file
- [T-1.2.2:ELE-2] **Constraints**: CHECK constraint ensuring either user_id OR organization_id is set, UNIQUE on (user_id, config_name) and (organization_id, config_name)
  - Stubs and Code Location(s): New migration file
- [T-1.2.2:ELE-3] **Indexes**: Btree indexes on user_id, organization_id, is_active; GIN index on configuration JSONB
  - Stubs and Code Location(s): New migration file
- [T-1.2.2:ELE-4] **RLS Policies**: Users can read/update own config, organization admins can manage org config
  - Stubs and Code Location(s): New migration file
- [T-1.2.2:ELE-5] **Audit Trail**: Change log table capturing configuration modifications
  - Stubs and Code Location(s): New migration file with ai_configuration_audit table
- [T-1.2.2:ELE-6] **API Key Security**: Encrypted storage for API keys using Supabase Vault
  - Stubs and Code Location(s): New migration file with vault integration

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Plan multi-level configuration hierarchy (user > org > system) (implements ELE-1,2)
   - [PREP-2] Design audit trail schema for compliance (implements ELE-5)
   - [PREP-3] Research Supabase Vault for API key encryption (implements ELE-6)
2. Implementation Phase:
   - [IMP-1] Create ai_configurations table with all fields (implements ELE-1)
   - [IMP-2] Add CHECK constraint for user_id/organization_id exclusivity (implements ELE-2)
   - [IMP-3] Add UNIQUE constraints for config_name per scope (implements ELE-2)
   - [IMP-4] Create indexes for query performance (implements ELE-3)
   - [IMP-5] Implement RLS policies for access control (implements ELE-4)
   - [IMP-6] Create ai_configuration_audit table for change tracking (implements ELE-5)
   - [IMP-7] Add trigger function to log all configuration changes (implements ELE-5)
   - [IMP-8] Integrate Supabase Vault for API key encryption (implements ELE-6)
   - [IMP-9] Add rollback migration
3. Validation Phase:
   - [VAL-1] Migration runs successfully and creates all objects (validates ELE-1-6)
   - [VAL-2] Constraints properly enforce data integrity (validates ELE-2)
   - [VAL-3] RLS policies tested for different user roles (validates ELE-4)
   - [VAL-4] Audit trail captures all configuration changes (validates ELE-5)
   - [VAL-5] API keys encrypted in database storage (validates ELE-6)

#### T-1.2.3: AI Configuration Service Layer

- **FR Reference**: FR8.2.1
- **Parent Task**: T-1.2.0
- **Implementation Location**: `src/lib/services/ai-config-service.ts`, update `src/lib/ai-config.ts`
- **Pattern**: Configuration service with fallback chain and validation
- **Dependencies**: T-1.2.1, T-1.2.2
- **Estimated Human Work Hours**: 4-5 hours
- **Description**: Implement service layer for AI configuration management with proper fallback chain (user → org → env → defaults), validation, and runtime configuration updates.

**Components/Elements**:
- [T-1.2.3:ELE-1] **Get Configuration**: Retrieve effective configuration for user/org with fallback chain
  - Stubs and Code Location(s): New service file
- [T-1.2.3:ELE-2] **Update Configuration**: Save configuration overrides with validation
  - Stubs and Code Location(s): New service file
- [T-1.2.3:ELE-3] **Delete Configuration**: Remove overrides and revert to defaults/parent config
  - Stubs and Code Location(s): New service file
- [T-1.2.3:ELE-4] **Configuration Validation**: Validate all parameters before saving
  - Stubs and Code Location(s): New service file using validators from T-1.2.1
- [T-1.2.3:ELE-5] **Fallback Chain**: Implement priority resolution: user > org > env > defaults
  - Stubs and Code Location(s): New service file
- [T-1.2.3:ELE-6] **API Key Rotation**: Support rotating API keys with zero downtime
  - Stubs and Code Location(s): New service file with key versioning logic

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design configuration resolution algorithm (implements ELE-5)
   - [PREP-2] Plan validation strategy for all configuration parameters (implements ELE-4)
   - [PREP-3] Design API key rotation workflow (implements ELE-6)
2. Implementation Phase:
   - [IMP-1] Create aiConfigService with Supabase client (implements ELE-1-3)
   - [IMP-2] Implement getConfiguration() with fallback chain logic (implements ELE-1,5)
   - [IMP-3] Implement updateConfiguration() with validation and JSONB merge (implements ELE-2,4)
   - [IMP-4] Implement deleteConfiguration() reverting to parent config (implements ELE-3)
   - [IMP-5] Add comprehensive validation for all config parameters (implements ELE-4)
   - [IMP-6] Implement API key rotation with primary/secondary key support (implements ELE-6)
   - [IMP-7] Add caching layer for frequently accessed configurations
   - [IMP-8] Refactor existing `src/lib/ai-config.ts` to use service layer
3. Validation Phase:
   - [VAL-1] Unit tests verify fallback chain works correctly (validates ELE-5)
   - [VAL-2] Validation rejects invalid configurations (validates ELE-4)
   - [VAL-3] API key rotation works without API call failures (validates ELE-6)
   - [VAL-4] Configuration changes take effect immediately (validates ELE-1,2)
   - [VAL-5] Cache invalidation works correctly (validates caching layer)

---

### T-1.3.0: Database Health Monitoring Infrastructure

- **FR Reference**: FR8.2.2
- **Impact Weighting**: System Foundation / Performance
- **Implementation Location**: `src/lib/services/database-health-service.ts`, `src/lib/types/database-health.ts`
- **Pattern**: Database monitoring with metrics collection and analysis
- **Dependencies**: None (Foundation task)
- **Estimated Human Work Hours**: 10-12 hours
- **Description**: Establish database health monitoring infrastructure providing real-time metrics, query performance analysis, index health, and maintenance operation support.
- **Testing Tools**: Vitest, PostgreSQL testing utilities
- **Test Coverage Requirements**: 85%+ for metrics collection logic
- **Completes Component?**: Yes - Completes database monitoring infrastructure

**Functional Requirements Acceptance Criteria**:
- DatabaseHealthMetrics type defined covering all monitoring aspects from FR8.2.2
- Service layer retrieves table sizes, row counts, index health, query performance
- Connection pool monitoring with active/idle connection tracking
- Slow query identification using pg_stat_statements extension
- Index usage statistics from pg_stat_user_indexes
- Table bloat calculation using pg_stat_user_tables
- Vacuum and analyze operation history tracking
- Performance alert system for threshold violations
- Monthly health report generation
- Manual maintenance operation triggers (VACUUM, ANALYZE, REINDEX)

#### T-1.3.1: Database Health Metrics Type Definition

- **FR Reference**: FR8.2.2
- **Parent Task**: T-1.3.0
- **Implementation Location**: `src/lib/types/database-health.ts`
- **Pattern**: Comprehensive TypeScript interfaces for database metrics
- **Dependencies**: None
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: Define TypeScript interfaces for all database health metrics including table stats, index health, query performance, and connection pool status.

**Components/Elements**:
- [T-1.3.1:ELE-1] **Table Health Metrics**: Table name, size (bytes), row count, last vacuum, last analyze, dead tuples ratio
  - Stubs and Code Location(s): New type file
- [T-1.3.1:ELE-2] **Index Health Metrics**: Index name, size, index scans, sequential scans, bloat percentage, last used
  - Stubs and Code Location(s): New type file
- [T-1.3.1:ELE-3] **Query Performance Metrics**: Query text (sanitized), avg execution time, p95 execution time, calls count, total time
  - Stubs and Code Location(s): New type file
- [T-1.3.1:ELE-4] **Connection Pool Metrics**: Total connections, active connections, idle connections, waiting connections, max connections
  - Stubs and Code Location(s): New type file
- [T-1.3.1:ELE-5] **Database Overview Metrics**: Total database size, cache hit ratio, transaction commit/rollback ratio, conflicts
  - Stubs and Code Location(s): New type file
- [T-1.3.1:ELE-6] **Maintenance Operation History**: Operation type (VACUUM/ANALYZE/REINDEX), table name, started_at, completed_at, duration, status
  - Stubs and Code Location(s): New type file
- [T-1.3.1:ELE-7] **Health Alert Definition**: Alert type, severity (info/warning/critical), message, threshold, current value, recommended action
  - Stubs and Code Location(s): New type file

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Research PostgreSQL system catalog and pg_stat views (implements ELE-1-5)
   - [PREP-2] Define threshold values for health alerts (implements ELE-7)
   - [PREP-3] Plan sanitization strategy for query text (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Create `src/lib/types/database-health.ts` (implements ELE-1-7)
   - [IMP-2] Define TableHealthMetrics interface (implements ELE-1)
   - [IMP-3] Define IndexHealthMetrics interface (implements ELE-2)
   - [IMP-4] Define QueryPerformanceMetrics interface (implements ELE-3)
   - [IMP-5] Define ConnectionPoolMetrics interface (implements ELE-4)
   - [IMP-6] Define DatabaseOverviewMetrics interface (implements ELE-5)
   - [IMP-7] Define MaintenanceOperationRecord interface (implements ELE-6)
   - [IMP-8] Define DatabaseHealthAlert interface (implements ELE-7)
   - [IMP-9] Define aggregate DatabaseHealthReport interface combining all metrics
   - [IMP-10] Add comprehensive JSDoc with PostgreSQL view references
3. Validation Phase:
   - [VAL-1] TypeScript compilation succeeds (validates ELE-1-7)
   - [VAL-2] All interfaces have proper documentation (validates ELE-1-7)
   - [VAL-3] Metric types align with PostgreSQL system catalog data types (validates ELE-1-5)
   - [VAL-4] Alert definitions cover all critical health scenarios (validates ELE-7)

#### T-1.3.2: Database Health Monitoring Queries

- **FR Reference**: FR8.2.2
- **Parent Task**: T-1.3.0
- **Implementation Location**: `src/lib/services/database-health-service.ts`
- **Pattern**: PostgreSQL system catalog queries with Supabase client
- **Dependencies**: T-1.3.1
- **Estimated Human Work Hours**: 5-6 hours
- **Description**: Implement SQL queries to collect database health metrics from PostgreSQL system catalogs and pg_stat views, with proper error handling and result transformation.

**Components/Elements**:
- [T-1.3.2:ELE-1] **Table Statistics Query**: Query pg_stat_user_tables for table sizes, row counts, vacuum/analyze stats
  - Stubs and Code Location(s): New service file, reference `src/lib/database.ts:6-10` for query patterns
- [T-1.3.2:ELE-2] **Index Health Query**: Query pg_stat_user_indexes and pg_indexes for index usage and bloat
  - Stubs and Code Location(s): New service file
- [T-1.3.2:ELE-3] **Slow Query Analysis**: Query pg_stat_statements for slow queries (requires extension)
  - Stubs and Code Location(s): New service file
- [T-1.3.2:ELE-4] **Connection Pool Query**: Query pg_stat_activity for connection statistics
  - Stubs and Code Location(s): New service file
- [T-1.3.2:ELE-5] **Database Overview Query**: Query pg_stat_database for overall database metrics
  - Stubs and Code Location(s): New service file
- [T-1.3.2:ELE-6] **Bloat Calculation**: Calculate table and index bloat percentages
  - Stubs and Code Location(s): New service file with bloat estimation formula

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Research PostgreSQL system catalog structure (implements ELE-1-5)
   - [PREP-2] Test queries in development database (implements ELE-1-6)
   - [PREP-3] Plan result transformation to TypeScript types (implements ELE-1-6)
2. Implementation Phase:
   - [IMP-1] Create databaseHealthService with Supabase client (implements ELE-1-6)
   - [IMP-2] Implement getTableStatistics() querying pg_stat_user_tables (implements ELE-1)
   - [IMP-3] Implement getIndexHealth() querying pg_stat_user_indexes (implements ELE-2)
   - [IMP-4] Implement getSlowQueries() querying pg_stat_statements (implements ELE-3)
   - [IMP-5] Implement getConnectionPoolStats() querying pg_stat_activity (implements ELE-4)
   - [IMP-6] Implement getDatabaseOverview() querying pg_stat_database (implements ELE-5)
   - [IMP-7] Implement calculateBloat() with bloat estimation formula (implements ELE-6)
   - [IMP-8] Add error handling for missing extensions (pg_stat_statements)
   - [IMP-9] Transform raw query results to TypeScript types from T-1.3.1
3. Validation Phase:
   - [VAL-1] Queries return correct data in development environment (validates ELE-1-5)
   - [VAL-2] Bloat calculations match expected values (validates ELE-6)
   - [VAL-3] Error handling gracefully manages missing extensions (validates ELE-3)
   - [VAL-4] Result transformation produces correct TypeScript types (validates all elements)
   - [VAL-5] Query performance acceptable (<500ms per query) (validates all elements)

#### T-1.3.3: Maintenance Operation Executors

- **FR Reference**: FR8.2.2
- **Parent Task**: T-1.3.0
- **Implementation Location**: `src/lib/services/database-maintenance-service.ts`
- **Pattern**: Database maintenance operations with safety checks
- **Dependencies**: T-1.3.1, T-1.3.2
- **Estimated Human Work Hours**: 4-5 hours
- **Description**: Implement service layer for executing database maintenance operations (VACUUM, ANALYZE, REINDEX) with proper validation, safety checks, and operation history tracking.

**Components/Elements**:
- [T-1.3.3:ELE-1] **Vacuum Operation**: Execute VACUUM on specified tables with options (FULL, ANALYZE)
  - Stubs and Code Location(s): New service file
- [T-1.3.3:ELE-2] **Analyze Operation**: Execute ANALYZE on specified tables for statistics update
  - Stubs and Code Location(s): New service file
- [T-1.3.3:ELE-3] **Reindex Operation**: Execute REINDEX on specified indexes or tables
  - Stubs and Code Location(s): New service file
- [T-1.3.3:ELE-4] **Safety Checks**: Validate operations won't lock critical tables during peak usage
  - Stubs and Code Location(s): New service file
- [T-1.3.3:ELE-5] **Operation History**: Log all maintenance operations to database
  - Stubs and Code Location(s): New service file, requires maintenance_operations table
- [T-1.3.3:ELE-6] **Backup Trigger**: Optional backup before destructive operations
  - Stubs and Code Location(s): New service file

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Research PostgreSQL maintenance commands and locking behavior (implements ELE-1-3)
   - [PREP-2] Define safety check criteria (table size, active connections) (implements ELE-4)
   - [PREP-3] Design maintenance operations audit table schema (implements ELE-5)
2. Implementation Phase:
   - [IMP-1] Create databaseMaintenanceService (implements ELE-1-3)
   - [IMP-2] Implement executeVacuum() with VACUUM command (implements ELE-1)
   - [IMP-3] Implement executeAnalyze() with ANALYZE command (implements ELE-2)
   - [IMP-4] Implement executeReindex() with REINDEX command (implements ELE-3)
   - [IMP-5] Add pre-operation safety checks (table locks, connection count) (implements ELE-4)
   - [IMP-6] Create maintenance_operations table and logging (implements ELE-5)
   - [IMP-7] Integrate optional backup trigger before operations (implements ELE-6)
   - [IMP-8] Add operation status tracking (queued, running, completed, failed)
3. Validation Phase:
   - [VAL-1] Vacuum operation completes successfully on test tables (validates ELE-1)
   - [VAL-2] Analyze operation updates table statistics (validates ELE-2)
   - [VAL-3] Reindex operation rebuilds indexes correctly (validates ELE-3)
   - [VAL-4] Safety checks prevent operations during high load (validates ELE-4)
   - [VAL-5] Operation history logged accurately (validates ELE-5)
   - [VAL-6] Backup trigger works before destructive operations (validates ELE-6)

---

## 2. Data Management & Processing

### T-2.1.0: Configuration Change Management

- **FR Reference**: FR8.1.1, FR8.2.1
- **Impact Weighting**: Data Integrity / Audit Compliance
- **Implementation Location**: `src/lib/services/config-change-management.ts`
- **Pattern**: Audit trail with change tracking and rollback support
- **Dependencies**: T-1.1.0, T-1.2.0
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Implement change management system for tracking all configuration changes (user preferences and AI configuration) with audit trail, change validation, and rollback capabilities.
- **Testing Tools**: Vitest, integration tests
- **Test Coverage Requirements**: 95%+ for change tracking logic
- **Completes Component?**: Yes - Completes configuration change management

**Functional Requirements Acceptance Criteria**:
- All configuration changes logged to audit trail with user attribution
- Change history accessible per configuration with timestamp and values
- Rollback functionality to restore previous configuration state
- Change validation ensures configuration remains consistent
- Comparison functionality showing diff between configurations
- Change approval workflow for critical settings (optional)
- Export change history as CSV for compliance reporting
- Real-time change notifications to affected users
- Rate limiting on configuration changes to prevent abuse
- Change impact analysis before applying

#### T-2.1.1: Configuration Audit Trail Schema

- **FR Reference**: FR8.1.1, FR8.2.1
- **Parent Task**: T-2.1.0
- **Implementation Location**: `src/supabase/migrations/YYYYMMDDHHMMSS_create_config_audit.sql`
- **Pattern**: Immutable audit log table
- **Dependencies**: T-1.1.2, T-1.2.2
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: Create database schema for configuration change audit trail capturing all changes to user preferences and AI configurations.

**Components/Elements**:
- [T-2.1.1:ELE-1] **Audit Table Structure**: id, config_type (user_pref/ai_config), config_id, changed_by, changed_at, old_values, new_values, change_reason
  - Stubs and Code Location(s): New migration file
- [T-2.1.1:ELE-2] **JSONB Diff Storage**: Store old and new values as JSONB for flexible querying
  - Stubs and Code Location(s): New migration file
- [T-2.1.1:ELE-3] **Indexes**: Btree indexes on config_type, config_id, changed_at; GIN on JSONB fields
  - Stubs and Code Location(s): New migration file
- [T-2.1.1:ELE-4] **Triggers**: Automatic audit log creation on configuration updates
  - Stubs and Code Location(s): New migration file
- [T-2.1.1:ELE-5] **Retention Policy**: Configurable retention (default 2 years) with archival
  - Stubs and Code Location(s): New migration file with scheduled job
- [T-2.1.1:ELE-6] **Immutability**: Prevent updates/deletes on audit records (append-only)
  - Stubs and Code Location(s): New migration file with RLS policies

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design audit table schema capturing all change metadata (implements ELE-1,2)
   - [PREP-2] Plan indexing strategy for audit queries (implements ELE-3)
   - [PREP-3] Design trigger function for automatic logging (implements ELE-4)
2. Implementation Phase:
   - [IMP-1] Create configuration_audit_log table (implements ELE-1,2)
   - [IMP-2] Add indexes for performance (implements ELE-3)
   - [IMP-3] Create trigger functions on user_preferences and ai_configurations tables (implements ELE-4)
   - [IMP-4] Implement retention policy with scheduled cleanup job (implements ELE-5)
   - [IMP-5] Add RLS policies preventing updates/deletes (implements ELE-6)
   - [IMP-6] Create views for common audit queries
   - [IMP-7] Add rollback migration
3. Validation Phase:
   - [VAL-1] Configuration changes automatically create audit records (validates ELE-4)
   - [VAL-2] Audit records are immutable (validates ELE-6)
   - [VAL-3] JSONB diff accurately captures changes (validates ELE-2)
   - [VAL-4] Retention policy correctly archives old records (validates ELE-5)
   - [VAL-5] Audit queries perform well with indexes (validates ELE-3)

#### T-2.1.2: Configuration Rollback Service

- **FR Reference**: FR8.1.1, FR8.2.1
- **Parent Task**: T-2.1.0
- **Implementation Location**: `src/lib/services/config-rollback-service.ts`
- **Pattern**: State restoration from audit trail
- **Dependencies**: T-2.1.1
- **Estimated Human Work Hours**: 4-5 hours
- **Description**: Implement service enabling rollback of configuration changes to previous states using audit trail data.

**Components/Elements**:
- [T-2.1.2:ELE-1] **Get Change History**: Retrieve configuration change history with pagination
  - Stubs and Code Location(s): New service file
- [T-2.1.2:ELE-2] **Rollback to Version**: Restore configuration to specific audit log entry
  - Stubs and Code Location(s): New service file
- [T-2.1.2:ELE-3] **Rollback Validation**: Validate rollback won't break current system state
  - Stubs and Code Location(s): New service file
- [T-2.1.2:ELE-4] **Preview Rollback**: Show diff of what will change before applying
  - Stubs and Code Location(s): New service file
- [T-2.1.2:ELE-5] **Bulk Rollback**: Rollback multiple configurations atomically
  - Stubs and Code Location(s): New service file
- [T-2.1.2:ELE-6] **Rollback Undo**: Ability to undo a rollback operation
  - Stubs and Code Location(s): New service file

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design rollback algorithm using audit trail (implements ELE-2)
   - [PREP-2] Plan validation rules for safe rollbacks (implements ELE-3)
   - [PREP-3] Design diff preview UI data structure (implements ELE-4)
2. Implementation Phase:
   - [IMP-1] Create configRollbackService (implements ELE-1-6)
   - [IMP-2] Implement getChangeHistory() querying audit log (implements ELE-1)
   - [IMP-3] Implement rollbackToVersion() restoring old values (implements ELE-2)
   - [IMP-4] Add validation checking configuration dependencies (implements ELE-3)
   - [IMP-5] Implement previewRollback() showing before/after diff (implements ELE-4)
   - [IMP-6] Implement bulkRollback() with transaction support (implements ELE-5)
   - [IMP-7] Add undo functionality creating inverse operation (implements ELE-6)
   - [IMP-8] Integrate with existing config services
3. Validation Phase:
   - [VAL-1] Change history retrieval shows accurate timeline (validates ELE-1)
   - [VAL-2] Rollback successfully restores previous configuration (validates ELE-2)
   - [VAL-3] Validation prevents invalid rollbacks (validates ELE-3)
   - [VAL-4] Preview accurately shows rollback impact (validates ELE-4)
   - [VAL-5] Bulk rollback is atomic (all or nothing) (validates ELE-5)
   - [VAL-6] Undo rollback functionality works correctly (validates ELE-6)

---

## 3. User Interface Components

### T-3.1.0: Settings View UI Enhancement

- **FR Reference**: FR8.1.1
- **Impact Weighting**: User Experience / Accessibility
- **Implementation Location**: `train-wireframe/src/components/views/SettingsView.tsx`
- **Pattern**: Form-based settings UI with real-time updates
- **Dependencies**: T-1.1.0, T-2.1.0
- **Estimated Human Work Hours**: 10-12 hours
- **Description**: Enhance existing basic SettingsView component to comprehensive settings interface covering all user preferences with organized sections, form validation, and auto-save functionality.
- **Testing Tools**: Vitest, React Testing Library, Storybook
- **Test Coverage Requirements**: 85%+ component coverage
- **Completes Component?**: Yes - Completes user settings UI

**Functional Requirements Acceptance Criteria**:
- Settings organized into collapsible sections: Display, Notifications, Filters, Export, Shortcuts, Quality
- Each preference has clear label, help text, and appropriate input control
- Theme selector with preview (light/dark/system)
- Auto-save with visual feedback (saving indicator)
- Reset to defaults button per section
- Toast notifications for successful saves and errors
- Form validation prevents invalid preference values
- Keyboard navigation (Tab, Enter, ESC) fully supported
- Responsive design adapting to screen sizes
- Loading states while fetching user preferences

#### T-3.1.1: Display Preferences Section

- **FR Reference**: FR8.1.1
- **Parent Task**: T-3.1.0
- **Implementation Location**: `train-wireframe/src/components/views/SettingsView.tsx`
- **Pattern**: Form section with controlled inputs
- **Dependencies**: T-1.1.0
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Implement Display Preferences section with theme selector, sidebar preferences, table density, rows per page, and animations toggle.

**Components/Elements**:
- [T-3.1.1:ELE-1] **Theme Selector**: Radio group or select for light/dark/system with live preview
  - Stubs and Code Location(s): Extends `train-wireframe/src/components/views/SettingsView.tsx:24-36`
- [T-3.1.1:ELE-2] **Sidebar Preference**: Toggle for default sidebar collapsed state
  - Stubs and Code Location(s): New control based on `train-wireframe/src/lib/types.ts:218`
- [T-3.1.1:ELE-3] **Table Density**: Radio group for compact/comfortable/spacious
  - Stubs and Code Location(s): New control based on `train-wireframe/src/lib/types.ts:219`
- [T-3.1.1:ELE-4] **Rows Per Page**: Select dropdown with options 10/25/50/100
  - Stubs and Code Location(s): New control based on `train-wireframe/src/lib/types.ts:220`
- [T-3.1.1:ELE-5] **Animations Toggle**: Switch for enabling/disabling animations
  - Stubs and Code Location(s): Extends `train-wireframe/src/components/views/SettingsView.tsx:29-35`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design section layout with Shadcn components (implements ELE-1-5)
   - [PREP-2] Plan form state management with React Hook Form or Zustand (implements ELE-1-5)
   - [PREP-3] Design theme preview mechanism (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Wrap existing switches in Card component with section header (implements foundation)
   - [IMP-2] Add theme selector using RadioGroup component (implements ELE-1)
   - [IMP-3] Add theme preview showing UI changes (implements ELE-1)
   - [IMP-4] Add sidebar preference toggle (implements ELE-2)
   - [IMP-5] Add table density radio group (implements ELE-3)
   - [IMP-6] Add rows per page select dropdown (implements ELE-4)
   - [IMP-7] Connect all controls to Zustand preferences store (implements ELE-1-5)
   - [IMP-8] Implement auto-save on change with debouncing (implements ELE-1-5)
3. Validation Phase:
   - [VAL-1] Theme changes apply immediately to UI (validates ELE-1)
   - [VAL-2] All preferences save automatically (validates ELE-1-5)
   - [VAL-3] Preferences persist across browser sessions (validates ELE-1-5)
   - [VAL-4] Form controls match UserPreferences type (validates ELE-1-5)

#### T-3.1.2: Notification Preferences Section

- **FR Reference**: FR8.1.1
- **Parent Task**: T-3.1.0
- **Implementation Location**: `train-wireframe/src/components/views/SettingsView.tsx`
- **Pattern**: Form section with switches and selects
- **Dependencies**: T-1.1.1 (NotificationPreferences type)
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: Implement Notification Preferences section controlling toast, email, and in-app notifications.

**Components/Elements**:
- [T-3.1.2:ELE-1] **Toast Notifications**: Switch to enable/disable toast notifications
  - Stubs and Code Location(s): New section in SettingsView
- [T-3.1.2:ELE-2] **Email Notifications**: Switch with frequency dropdown (immediate/daily digest/weekly)
  - Stubs and Code Location(s): New section in SettingsView
- [T-3.1.2:ELE-3] **In-App Notifications**: Switch to enable/disable in-app notification bell
  - Stubs and Code Location(s): New section in SettingsView
- [T-3.1.2:ELE-4] **Notification Categories**: Checkboxes for generation complete, approval required, errors, system alerts
  - Stubs and Code Location(s): New section in SettingsView

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design notification preferences layout (implements ELE-1-4)
   - [PREP-2] Plan notification types and categories (implements ELE-4)
2. Implementation Phase:
   - [IMP-1] Create notification preferences section with Card (implements foundation)
   - [IMP-2] Add toast notifications toggle switch (implements ELE-1)
   - [IMP-3] Add email notifications toggle with frequency select (implements ELE-2)
   - [IMP-4] Add in-app notifications toggle (implements ELE-3)
   - [IMP-5] Add notification categories checkboxes (implements ELE-4)
   - [IMP-6] Integrate with preferences service for auto-save (implements ELE-1-4)
3. Validation Phase:
   - [VAL-1] Notification preferences save correctly (validates ELE-1-4)
   - [VAL-2] Toast behavior respects user preference (validates ELE-1)
   - [VAL-3] Email frequency options work as expected (validates ELE-2)

---

### T-3.2.0: AI Configuration Settings UI

- **FR Reference**: FR8.2.1
- **Impact Weighting**: Configuration Management / Quality Control
- **Implementation Location**: `train-wireframe/src/components/views/AIConfigView.tsx` (new)
- **Pattern**: Advanced settings form with validation
- **Dependencies**: T-1.2.0, T-2.1.0
- **Estimated Human Work Hours**: 12-14 hours
- **Description**: Create comprehensive AI Configuration Settings interface for managing Claude API parameters, rate limiting, retry strategies, cost budgets, and API key rotation.
- **Testing Tools**: Vitest, React Testing Library, Storybook
- **Test Coverage Requirements**: 90%+ component coverage
- **Completes Component?**: Yes - Completes AI configuration UI

**Functional Requirements Acceptance Criteria**:
- AI configuration organized into tabs: Model, Rate Limiting, Retry Strategy, Cost Management, API Keys
- Model configuration with temperature slider, max tokens input, top_p slider
- Rate limiting configuration with requests/minute input, concurrent requests input
- Retry strategy with backoff type selector (exponential/linear/fixed) and delay inputs
- Cost budget inputs for daily/weekly/monthly with alert threshold sliders
- API key rotation interface with primary/secondary key display (masked)
- Configuration validation before save with clear error messages
- Preview pane showing effective configuration (merged from fallback chain)
- Save button with confirmation dialog for critical changes
- Rollback functionality showing change history

#### T-3.2.1: Model Configuration Tab

- **FR Reference**: FR8.2.1
- **Parent Task**: T-3.2.0
- **Implementation Location**: `train-wireframe/src/components/views/AIConfigView.tsx`
- **Pattern**: Form with sliders and selects
- **Dependencies**: T-1.2.1
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Implement Model Configuration tab with all Claude API model parameters.

**Components/Elements**:
- [T-3.2.1:ELE-1] **Model Selector**: Select dropdown with available models (Sonnet, Opus, Haiku)
  - Stubs and Code Location(s): New component using Select from shadcn
- [T-3.2.1:ELE-2] **Temperature Slider**: Slider (0.0-1.0) with numeric input for precision
  - Stubs and Code Location(s): New component using Slider from shadcn
- [T-3.2.1:ELE-3] **Max Tokens Input**: Numeric input with validation (0-4096)
  - Stubs and Code Location(s): New component using Input from shadcn
- [T-3.2.1:ELE-4] **Top P Slider**: Slider (0.0-1.0) for nucleus sampling
  - Stubs and Code Location(s): New component using Slider from shadcn
- [T-3.2.1:ELE-5] **Streaming Toggle**: Switch for enabling streaming responses
  - Stubs and Code Location(s): New component using Switch from shadcn
- [T-3.2.1:ELE-6] **Model Capabilities Display**: Read-only info showing selected model's capabilities
  - Stubs and Code Location(s): New component using Alert from shadcn

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Research Claude API model parameters and valid ranges (implements ELE-1-5)
   - [PREP-2] Design form layout with help text for each parameter (implements ELE-1-6)
   - [PREP-3] Plan validation rules for each input (implements ELE-1-5)
2. Implementation Phase:
   - [IMP-1] Create AIConfigView component with Tabs (implements foundation)
   - [IMP-2] Create Model Configuration tab panel (implements foundation)
   - [IMP-3] Add model selector with model list from T-1.2.1 (implements ELE-1)
   - [IMP-4] Add temperature slider with live value display (implements ELE-2)
   - [IMP-5] Add max tokens input with min/max validation (implements ELE-3)
   - [IMP-6] Add top_p slider with explanation tooltip (implements ELE-4)
   - [IMP-7] Add streaming toggle with description (implements ELE-5)
   - [IMP-8] Add model capabilities display showing context window, pricing (implements ELE-6)
   - [IMP-9] Connect form to AI config service (implements ELE-1-5)
3. Validation Phase:
   - [VAL-1] Model selector shows all available models (validates ELE-1)
   - [VAL-2] Slider values update correctly and save (validates ELE-2,4)
   - [VAL-3] Max tokens validation prevents invalid values (validates ELE-3)
   - [VAL-4] Model capabilities display updates on model change (validates ELE-6)

#### T-3.2.2: Rate Limiting & Retry Configuration Tab

- **FR Reference**: FR8.2.1
- **Parent Task**: T-3.2.0
- **Implementation Location**: `train-wireframe/src/components/views/AIConfigView.tsx`
- **Pattern**: Form with numeric inputs and selects
- **Dependencies**: T-1.2.1
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Implement Rate Limiting and Retry Strategy configuration tab.

**Components/Elements**:
- [T-3.2.2:ELE-1] **Requests Per Minute**: Numeric input with recommendation for API tier
  - Stubs and Code Location(s): New component
- [T-3.2.2:ELE-2] **Concurrent Requests**: Numeric input for parallel processing limit
  - Stubs and Code Location(s): New component
- [T-3.2.2:ELE-3] **Max Retries**: Numeric input (0-10) for retry attempts
  - Stubs and Code Location(s): New component
- [T-3.2.2:ELE-4] **Backoff Strategy**: Select for exponential/linear/fixed with visualization
  - Stubs and Code Location(s): New component
- [T-3.2.2:ELE-5] **Base Delay**: Numeric input (ms) for initial retry delay
  - Stubs and Code Location(s): New component
- [T-3.2.2:ELE-6] **Max Delay**: Numeric input (ms) for maximum retry delay cap
  - Stubs and Code Location(s): New component

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design rate limiting form with recommendations (implements ELE-1-2)
   - [PREP-2] Design retry strategy form with backoff visualization (implements ELE-3-6)
   - [PREP-3] Create backoff visualization component showing delay timeline (implements ELE-4)
2. Implementation Phase:
   - [IMP-1] Create Rate Limiting section in tab (implements ELE-1-2)
   - [IMP-2] Add requests per minute input with API tier guidance (implements ELE-1)
   - [IMP-3] Add concurrent requests input with warning for high values (implements ELE-2)
   - [IMP-4] Create Retry Strategy section in same tab (implements ELE-3-6)
   - [IMP-5] Add max retries input (implements ELE-3)
   - [IMP-6] Add backoff strategy select with descriptions (implements ELE-4)
   - [IMP-7] Add backoff visualization chart (implements ELE-4)
   - [IMP-8] Add base delay and max delay inputs (implements ELE-5-6)
3. Validation Phase:
   - [VAL-1] Rate limit values validate correctly (validates ELE-1-2)
   - [VAL-2] Backoff visualization updates with configuration changes (validates ELE-4)
   - [VAL-3] Retry configuration saves and applies correctly (validates ELE-3-6)

---

### T-3.3.0: Database Health Dashboard UI

- **FR Reference**: FR8.2.2
- **Impact Weighting**: System Monitoring / Operations
- **Implementation Location**: `train-wireframe/src/components/views/DatabaseHealthView.tsx` (new)
- **Pattern**: Dashboard with metrics visualization
- **Dependencies**: T-1.3.0, database health service
- **Estimated Human Work Hours**: 14-16 hours
- **Description**: Create comprehensive Database Health Dashboard displaying real-time metrics, query performance, index health, and maintenance operation controls.
- **Testing Tools**: Vitest, React Testing Library, Recharts for visualizations
- **Test Coverage Requirements**: 80%+ component coverage
- **Completes Component?**: Yes - Completes database health UI

**Functional Requirements Acceptance Criteria**:
- Dashboard organized into cards: Overview, Tables, Indexes, Queries, Connections, Maintenance
- Overview card shows total database size, cache hit ratio, transaction stats
- Tables card lists all tables with size, row count, last vacuum/analyze, bloat percentage
- Indexes card shows index usage stats, unused indexes flagged in red
- Queries card displays slow queries (>500ms) with execution stats
- Connections card shows active/idle/waiting connections with pool utilization
- Maintenance section with buttons: Vacuum, Analyze, Reindex with table selection
- Confirmation dialogs for all maintenance operations with impact warnings
- Real-time updates every 30 seconds with refresh button
- Alert banner for critical issues (high bloat, unused indexes, slow queries)

#### T-3.3.1: Database Overview Card

- **FR Reference**: FR8.2.2
- **Parent Task**: T-3.3.0
- **Implementation Location**: `train-wireframe/src/components/views/DatabaseHealthView.tsx`
- **Pattern**: Metrics card with charts
- **Dependencies**: T-1.3.2 (database health queries)
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Implement Database Overview card showing key database health metrics.

**Components/Elements**:
- [T-3.3.1:ELE-1] **Total Database Size**: Display with trend indicator (up/down arrow)
  - Stubs and Code Location(s): New component, reference `train-wireframe/src/components/dashboard/DashboardView.tsx:105-117` for card pattern
- [T-3.3.1:ELE-2] **Cache Hit Ratio**: Percentage with gauge visualization (target >99%)
  - Stubs and Code Location(s): New component with progress/gauge component
- [T-3.3.1:ELE-3] **Transaction Stats**: Commits vs rollbacks with ratio
  - Stubs and Code Location(s): New component
- [T-3.3.1:ELE-4] **Database Conflicts**: Count with severity indicator
  - Stubs and Code Location(s): New component
- [T-3.3.1:ELE-5] **Refresh Button**: Manual refresh trigger with loading state
  - Stubs and Code Location(s): New component using Button from shadcn

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design card layout with key metrics (implements ELE-1-4)
   - [PREP-2] Plan data fetching strategy with polling (implements ELE-1-4)
   - [PREP-3] Design gauge/chart components for visualizations (implements ELE-2-3)
2. Implementation Phase:
   - [IMP-1] Create DatabaseHealthView component (implements foundation)
   - [IMP-2] Create Overview Card component (implements foundation)
   - [IMP-3] Fetch database overview metrics from health service (implements ELE-1-4)
   - [IMP-4] Display total database size with formatting (implements ELE-1)
   - [IMP-5] Add cache hit ratio gauge with color coding (implements ELE-2)
   - [IMP-6] Display transaction stats with chart (implements ELE-3)
   - [IMP-7] Display conflicts count with alert if > 0 (implements ELE-4)
   - [IMP-8] Add refresh button with loading state (implements ELE-5)
   - [IMP-9] Implement auto-refresh every 30 seconds
3. Validation Phase:
   - [VAL-1] Metrics display accurately from database (validates ELE-1-4)
   - [VAL-2] Cache hit ratio gauge shows correct percentage (validates ELE-2)
   - [VAL-3] Refresh button updates data correctly (validates ELE-5)
   - [VAL-4] Auto-refresh works without memory leaks (validates polling)

---

## 4. Feature Implementation

### T-4.1.0: User Preferences Integration

- **FR Reference**: FR8.1.1
- **Impact Weighting**: Feature Completion / User Experience
- **Implementation Location**: Multiple locations (services, components, store)
- **Pattern**: Full-stack integration with state management
- **Dependencies**: T-1.1.0, T-3.1.0
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Integrate user preferences throughout application applying settings to affect UI behavior, default filters, keyboard shortcuts, and notification display.
- **Testing Tools**: Vitest, integration tests, E2E tests with Playwright
- **Test Coverage Requirements**: 85%+ for integration logic
- **Completes Component?**: Yes - Completes user preferences feature end-to-end

**Functional Requirements Acceptance Criteria**:
- User preferences load on application initialization
- Theme changes apply immediately to entire UI
- Sidebar collapsed state persists and applies on navigation
- Table density affects all conversation tables
- Rows per page setting applies to all paginated views
- Default filters auto-apply when navigating to dashboard
- Keyboard shortcuts respect user's enabled/disabled setting
- Notification behavior follows user preferences
- Preferences sync across browser tabs (same user)
- Preferences apply before UI renders (no flash of incorrect state)

#### T-4.1.1: Preferences Loading & Initialization

- **FR Reference**: FR8.1.1
- **Parent Task**: T-4.1.0
- **Implementation Location**: `train-wireframe/src/App.tsx`, `train-wireframe/src/stores/useAppStore.ts`
- **Pattern**: App initialization hook
- **Dependencies**: T-1.1.3 (user preferences service)
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Implement preferences loading on app initialization with proper loading states and error handling.

**Components/Elements**:
- [T-4.1.1:ELE-1] **Load Preferences on Mount**: Fetch user preferences on app mount
  - Stubs and Code Location(s): Update `train-wireframe/src/App.tsx`
- [T-4.1.1:ELE-2] **Initialize Zustand Store**: Populate preferences in store after fetch
  - Stubs and Code Location(s): Update `train-wireframe/src/stores/useAppStore.ts:145-152`
- [T-4.1.1:ELE-3] **Loading State**: Show loading spinner while preferences fetch
  - Stubs and Code Location(s): Add to App.tsx
- [T-4.1.1:ELE-4] **Error Handling**: Fallback to defaults if fetch fails
  - Stubs and Code Location(s): Add to App.tsx
- [T-4.1.1:ELE-5] **Cross-Tab Sync**: Listen for preference changes in other tabs
  - Stubs and Code Location(s): Add BroadcastChannel or storage event listener

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design app initialization flow (implements ELE-1-4)
   - [PREP-2] Plan cross-tab synchronization strategy (implements ELE-5)
2. Implementation Phase:
   - [IMP-1] Add useEffect in App.tsx to fetch preferences on mount (implements ELE-1)
   - [IMP-2] Update Zustand store with fetched preferences (implements ELE-2)
   - [IMP-3] Add loading state preventing UI render until preferences loaded (implements ELE-3)
   - [IMP-4] Add error boundary with fallback to default preferences (implements ELE-4)
   - [IMP-5] Implement BroadcastChannel for cross-tab sync (implements ELE-5)
   - [IMP-6] Add storage event listener as fallback for older browsers (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Preferences load correctly on app start (validates ELE-1-2)
   - [VAL-2] Loading state displays before preferences available (validates ELE-3)
   - [VAL-3] App uses defaults if preferences fetch fails (validates ELE-4)
   - [VAL-4] Preference changes sync across tabs (validates ELE-5)

#### T-4.1.2: Theme Application

- **FR Reference**: FR8.1.1
- **Parent Task**: T-4.1.0
- **Implementation Location**: `train-wireframe/src/App.tsx`, global CSS
- **Pattern**: CSS class toggling with theme provider
- **Dependencies**: T-4.1.1
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: Apply user's theme preference (light/dark/system) to entire application with smooth transitions.

**Components/Elements**:
- [T-4.1.2:ELE-1] **Theme Provider**: Wrap app in theme context provider
  - Stubs and Code Location(s): Update `train-wireframe/src/App.tsx`
- [T-4.1.2:ELE-2] **CSS Class Application**: Apply theme class to document root
  - Stubs and Code Location(s): Update App.tsx with effect
- [T-4.1.2:ELE-3] **System Theme Detection**: Detect user's OS theme preference
  - Stubs and Code Location(s): Use matchMedia('(prefers-color-scheme: dark)')
- [T-4.1.2:ELE-4] **Theme Transition**: Smooth transition between themes without jarring flash
  - Stubs and Code Location(s): CSS transitions in `train-wireframe/src/styles/globals.css`
- [T-4.1.2:ELE-5] **Theme Persistence**: Ensure theme persists after page reload
  - Stubs and Code Location(s): Integrated with T-4.1.1

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review existing theme implementation in codebase (implements ELE-1-2)
   - [PREP-2] Test system theme detection across OS (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Create or update ThemeProvider component (implements ELE-1)
   - [IMP-2] Add useEffect to apply theme class to document.documentElement (implements ELE-2)
   - [IMP-3] Implement system theme detection with matchMedia (implements ELE-3)
   - [IMP-4] Add CSS transitions for smooth theme switching (implements ELE-4)
   - [IMP-5] Verify theme loads from preferences on app start (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Theme changes apply to entire UI immediately (validates ELE-1-2)
   - [VAL-2] System theme detection works correctly (validates ELE-3)
   - [VAL-3] Theme transitions are smooth without flash (validates ELE-4)
   - [VAL-4] Theme persists across page reloads (validates ELE-5)

---

## 5. Quality Assurance & Testing

### T-5.1.0: Unit Testing Suite

- **FR Reference**: FR8.1.1, FR8.2.1, FR8.2.2
- **Impact Weighting**: Code Quality / Maintainability
- **Implementation Location**: `src/__tests__/`, `train-wireframe/src/__tests__/`
- **Pattern**: Comprehensive unit tests with Vitest
- **Dependencies**: All implementation tasks (T-1.X.0, T-2.X.0, T-3.X.0, T-4.X.0)
- **Estimated Human Work Hours**: 16-20 hours
- **Description**: Develop comprehensive unit test suite covering all services, utilities, and components with >85% code coverage.
- **Testing Tools**: Vitest, React Testing Library, @testing-library/user-event
- **Test Coverage Requirements**: 85%+ overall, 95%+ for critical services
- **Completes Component?**: Yes - Completes unit testing for Settings module

**Functional Requirements Acceptance Criteria**:
- All service layer methods have unit tests covering happy paths
- Error scenarios and edge cases tested with mocked failures
- Component tests cover user interactions and state changes
- Configuration validation logic tested with invalid inputs
- Database query functions tested with mocked Supabase client
- Auto-save debouncing tested with timing assertions
- Rollback logic tested with audit trail mocks
- Test utilities created for common setup patterns
- CI/CD integration running tests on every commit
- Test coverage reports generated and reviewed

---

## 6. Deployment & Operations

### T-6.1.0: Database Migration Deployment

- **FR Reference**: FR8.1.1, FR8.2.1, FR8.2.2
- **Impact Weighting**: Production Readiness / Data Integrity
- **Implementation Location**: `src/supabase/migrations/`
- **Pattern**: Staged migration deployment with rollback capability
- **Dependencies**: T-1.1.2, T-1.2.2, T-2.1.1
- **Estimated Human Work Hours**: 4-6 hours
- **Description**: Deploy all database migrations to production with proper testing, backup, and rollback procedures.
- **Testing Tools**: Supabase CLI, SQL testing
- **Test Coverage Requirements**: 100% migration success in staging
- **Completes Component?**: Yes - Completes database schema deployment

**Functional Requirements Acceptance Criteria**:
- All migrations tested in development environment
- Migrations validated in staging environment matching production
- Production database backup taken before migration
- Migrations applied in correct order with dependency resolution
- Rollback scripts tested and available
- Migration timing estimated and scheduled during low-traffic window
- Post-migration validation queries confirm data integrity
- Migration documentation updated with applied changes
- Team notified of migration schedule and potential downtime
- Monitoring alerts configured for migration-related issues

---

## Task Summary & Statistics

### Comprehensive Task Inventory

**Total Main Tasks**: 9
- Foundation & Infrastructure: 3 main tasks (T-1.1.0, T-1.2.0, T-1.3.0)
- Data Management & Processing: 1 main task (T-2.1.0)
- User Interface Components: 3 main tasks (T-3.1.0, T-3.2.0, T-3.3.0)
- Feature Implementation: 1 main task (T-4.1.0)
- Quality Assurance & Testing: 1 main task (T-5.1.0)

**Total Sub-Tasks**: 19
- T-1.1.X: 3 sub-tasks (Type definition, Database schema, Service layer)
- T-1.2.X: 3 sub-tasks (Type definition, Database schema, Service layer)
- T-1.3.X: 3 sub-tasks (Type definition, Health queries, Maintenance executors)
- T-2.1.X: 2 sub-tasks (Audit trail schema, Rollback service)
- T-3.1.X: 2 sub-tasks (Display preferences, Notification preferences)
- T-3.2.X: 2 sub-tasks (Model configuration, Rate limiting & retry)
- T-3.3.X: 1 sub-task (Database overview card)
- T-4.1.X: 2 sub-tasks (Preferences initialization, Theme application)

**Total Estimated Work Hours**: 132-162 hours (3-4 weeks for 1 developer, 1.5-2 weeks for 2 developers)

### Work Distribution by Category

| Category | Main Tasks | Sub-Tasks | Est. Hours | Percentage |
|----------|------------|-----------|------------|------------|
| Foundation & Infrastructure | 3 | 9 | 44-52 | 33% |
| Data Management | 1 | 2 | 14-16 | 11% |
| UI Components | 3 | 5 | 39-46 | 31% |
| Feature Implementation | 1 | 2 | 18-22 | 14% |
| QA & Testing | 1 | 0 | 16-20 | 12% |
| Deployment | 0 | 1 | 4-6 | 3% |

### Priority Levels

**High Priority (Weeks 1-2)**:
- T-1.1.0: User Preferences Data Model & Storage
- T-1.2.0: AI Configuration Data Model & Storage
- T-3.1.0: Settings View UI Enhancement

**Medium Priority (Weeks 2-3)**:
- T-1.3.0: Database Health Monitoring Infrastructure
- T-2.1.0: Configuration Change Management
- T-3.2.0: AI Configuration Settings UI
- T-4.1.0: User Preferences Integration

**Lower Priority (Weeks 3-4)**:
- T-3.3.0: Database Health Dashboard UI
- T-5.1.0: Unit Testing Suite
- T-6.1.0: Database Migration Deployment

### Dependencies Graph

```
Foundation Layer (Week 1):
T-1.1.0 (User Prefs Model) ──┐
                              ├──> T-3.1.0 (Settings UI) ──> T-4.1.0 (Integration)
T-1.2.0 (AI Config Model) ───┴──> T-3.2.0 (AI Config UI) ───┘
         │
         └──> T-2.1.0 (Change Management)

T-1.3.0 (DB Health Model) ──> T-3.3.0 (DB Health UI)

Testing & Deployment (Week 4):
All above ──> T-5.1.0 (Testing) ──> T-6.1.0 (Deployment)
```

### Success Criteria

**Functional Completeness**:
- [ ] All FR8.1.1 acceptance criteria met (10/10)
- [ ] All FR8.2.1 acceptance criteria met (7/7)
- [ ] All FR8.2.2 acceptance criteria met (6/6)

**Quality Standards**:
- [ ] >85% unit test coverage achieved
- [ ] All linter errors resolved
- [ ] TypeScript strict mode compliance
- [ ] Accessibility (WCAG 2.1 AA) validated
- [ ] Performance targets met (<500ms query times)

**Production Readiness**:
- [ ] All database migrations deployed successfully
- [ ] Configuration change audit trail functional
- [ ] User preferences persisting correctly
- [ ] AI configuration applying to generation jobs
- [ ] Database health monitoring operational
- [ ] Documentation complete (user guide, API docs, architecture)

---

## Implementation Roadmap

### Week 1: Foundation & Database Schema
**Focus:** Core data models, database tables, service layer foundations

**Days 1-2: User Preferences Foundation**
- T-1.1.1: Extend UserPreferences type definition
- T-1.1.2: Create user_preferences database table
- T-1.1.3: Implement user preferences service layer

**Days 3-4: AI Configuration Foundation**
- T-1.2.1: Define AI configuration types
- T-1.2.2: Create ai_configurations database table
- T-1.2.3: Implement AI configuration service layer

**Day 5: Database Health Foundation**
- T-1.3.1: Define database health metrics types
- Begin T-1.3.2: Database health monitoring queries

### Week 2: Data Management & Core UI
**Focus:** Audit trails, configuration management, primary user interfaces

**Days 1-2: Configuration Management**
- Complete T-1.3.2: Database health queries
- T-1.3.3: Maintenance operation executors
- T-2.1.1: Configuration audit trail schema
- T-2.1.2: Configuration rollback service

**Days 3-5: Settings UI Implementation**
- T-3.1.1: Display preferences section
- T-3.1.2: Notification preferences section
- Begin T-3.2.1: Model configuration tab

### Week 3: Advanced UI & Integration
**Focus:** Complete UI implementation, feature integration

**Days 1-3: AI Configuration UI**
- Complete T-3.2.1: Model configuration tab
- T-3.2.2: Rate limiting & retry configuration tab
- Begin T-3.3.1: Database overview card

**Days 4-5: Feature Integration**
- Complete T-3.3.1: Database overview card
- T-4.1.1: Preferences loading & initialization
- T-4.1.2: Theme application

### Week 4: Testing, Polish & Deployment
**Focus:** Quality assurance, testing, production deployment

**Days 1-3: Testing**
- T-5.1.0: Comprehensive unit testing suite
- Integration testing
- Bug fixes and polish

**Days 4-5: Deployment**
- T-6.1.0: Database migration deployment
- Production deployment
- Post-deployment validation
- Documentation completion

---

## Conclusion

This comprehensive task inventory provides a complete roadmap for implementing the Settings & Administration module (FR8.1.1, FR8.2.1, FR8.2.2) of the Interactive LoRA Training Data Platform. The inventory covers:

- **9 main tasks** across 6 categories
- **19 detailed sub-tasks** with comprehensive implementation processes
- **132-162 estimated work hours** for complete implementation
- **Clear dependencies** enabling optimal development sequencing
- **Specific acceptance criteria** for validation and testing
- **Production-ready scope** including testing, security, and deployment

The task structure follows the recommended pattern with:
- Foundation-first approach establishing data models and infrastructure
- Progressive enhancement from core features to advanced capabilities
- User-centric ordering enabling incremental testing and validation
- Complete code references to existing wireframe and main codebase
- Detailed implementation processes with Preparation, Implementation, and Validation phases

### Next Steps
1. Review and approval from product manager and technical lead
2. Team capacity planning and resource allocation
3. Sprint planning using this task inventory as backlog
4. Begin Week 1 implementation starting with T-1.1.0

**Document Generated**: October 29, 2025
**Document Status**: Complete - Ready for Review & Implementation
**Output Location**: `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\product\_mapping\fr-maps\04-train-FR-wireframes-E08-output.md`

