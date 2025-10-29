# Interactive LoRA Conversation Generation - Functional Requirements
**Version:** 3.0.0 (Wireframe Integration)
**Date:** 10/28/2025  
**Category:** Training Data Generation Platform
**Product Abbreviation:** train

**Source References:**
- Seed Story: `pmc\product\00-train-seed-story.md`
- Overview Document: `pmc\product\01-train-overview.md`
- User Stories: `pmc\product\02-train-user-stories.md`
- User Journey: `pmc\product\02.5-train-user-journey.md`
- Previous Version: `pmc\product\03-train-functional-requirements-before-wireframe.md`
- Wireframe Codebase: `train-wireframe\src\`
- Main Codebase: `src\`

**Reorganization Notes:**
This document has been enhanced with insights from the implemented wireframe UI and main codebase integration. All functional requirements now include:
- Testable acceptance criteria based on actual implementation
- Direct codebase file path references for validation
- Enhanced UI/UX specifications from wireframe patterns
- Database schema validation from implemented models
- API endpoint specifications from actual routes

All FR numbers preserved from v2.0.0 for traceability. Original User Story (US) references maintained.

---

## Document Enhancement Summary

**Key Enhancements in v3.0.0:**
1. **UI Component Integration**: All UI requirements now reference actual wireframe components
2. **Database Validation**: Acceptance criteria validated against implemented Supabase schemas  
3. **API Specification**: Requirements include actual API endpoint paths and parameters
4. **State Management**: Requirements reference Zustand store implementation patterns
5. **Type Safety**: All data structures validated against TypeScript type definitions
6. **Testable Criteria**: Every acceptance criterion now includes validation approach

**Wireframe Components Integrated:**
- Dashboard with conversation table, filters, pagination (ConversationTable.tsx, FilterBar.tsx)
- Three-tier workflow (TemplatesView.tsx, ScenariosView.tsx, EdgeCasesView.tsx)
- Batch generation interface (BatchGenerationModal.tsx)
- Review queue system (ReviewQueueView.tsx)
- Export functionality (ExportModal.tsx)
- Quality metrics visualization (Dashboard stats cards)

---


## 1. Database Foundation & Core Schema

### 1.1 Normalized Database Structure

- **FR1.1.1:** Conversations Table Structure
  * Description: Implement core conversations table with normalized schema storing conversation metadata and status
  * Impact Weighting: Scalability / System Architecture
  * Priority: High
  * User Stories: US9.1.1
  * Tasks: [T-1.1.1]
  * User Story Acceptance Criteria:
    - Conversations table with columns: id, conversation_id, document_id, chunk_id, persona, emotion, topic, intent, tone, tier, status, quality_score, turn_count, created_at, updated_at
    - Conversation_turns table with columns: id, conversation_id, turn_number, role (user/assistant), content, created_at
    - Foreign key constraints: conversation_id references conversations.id
    - Indexes on frequently queried fields: status, quality_score, persona, emotion, tier, created_at
    - Unique constraint on conversation_id
    - Cascading delete: deleting conversation deletes all turns
    - NOT NULL constraints on required fields
  * Functional Requirements Acceptance Criteria:
    - Primary key (id) must be UUID type with automatic generation
      Code Reference: `src/lib/types.ts:26-46` (Conversation type definition), `train-wireframe/src/lib/types.ts:27`
    - All timestamp fields use timestamptz for timezone-aware storage
      Code Reference: `src/lib/database.ts:1-50` (Database service implementation)
    - Status field must be constrained to enum values: draft, generated, pending_review, approved, rejected, needs_revision, none, failed
      Code Reference: `train-wireframe/src/lib/types.ts:5` (ConversationStatus type)
    - Tier field must be constrained to enum values: template, scenario, edge_case  
      Code Reference: `train-wireframe/src/lib/types.ts:3` (TierType definition)
    - Quality score must be numeric with range 0-10, precision to 1 decimal place
      Code Reference: `train-wireframe/src/lib/types.ts:34` (qualityScore in Conversation type)
    - Turn count must be non-negative integer
      Code Reference: `train-wireframe/src/lib/types.ts:40` (totalTurns in Conversation type)
    - Conversation_id must follow format: fp_[persona]_[###] for uniqueness and readability
    - Database queries must use proper indexing achieving <100ms response for table scans up to 10,000 records
      Code Reference: `src/lib/database.ts:6-10` (Query optimization with order_by)
    - Foreign key on document_id must reference chunks-alpha documents table with CASCADE on delete
    - Conversation turns must maintain sequential turn_number without gaps
      Code Reference: `train-wireframe/src/lib/types.ts:7-12` (ConversationTurn type)
    - Role field in turns table must be constrained to 'user' | 'assistant' only
      Code Reference: `train-wireframe/src/lib/types.ts:8`

- **FR1.1.2:** Flexible Metadata Storage  
  * Description: Implement structured columns for core dimensions with JSONB for extensible metadata
  * Impact Weighting: Data Accessibility / Query Performance  
  * Priority: High  
  * User Stories: US9.2.1  
  * Tasks: [T-1.1.2]  
  * User Story Acceptance Criteria:
    - Structured columns for core dimensions: persona, emotion, topic, intent, tone, tier
    - JSONB column for additional metadata (extensible)
    - Efficient querying with indexed structured fields (< 500ms for filtered views)
    - JSONB querying support for custom metadata keys
    - Metadata validation ensuring consistency (valid persona values, etc.)
    - Metadata update API for post-generation edits
    - Migration support for adding new structured fields
  * Functional Requirements Acceptance Criteria:
    - Parameters field implemented as JSONB column storing flexible key-value pairs
      Code Reference: `train-wireframe/src/lib/types.ts:44` (parameters: Record<string, any>)
    - JSONB field must support GIN indexing for efficient key existence and containment queries
    - Structured dimension fields (persona, emotion, topic, intent, tone) must have individual btree indexes
    - Text search across persona, emotion, and topic fields must support case-insensitive ILIKE patterns
      Code Reference: `train-wireframe/src/components/dashboard/DashboardView.tsx:28-31` (Search filter logic)
    - Metadata validation must occur at application layer before database insertion
      Code Reference: `src/lib/database.ts:27-36` (Create document with validation)
    - Category field must support array of strings for multi-category assignment
      Code Reference: `train-wireframe/src/lib/types.ts:32` (category: string[])
    - Quality metrics object must be stored as nested JSONB with structured schema
      Code Reference: `train-wireframe/src/lib/types.ts:14-24` (QualityMetrics type)
    - Review history must be stored as JSONB array of review action objects
      Code Reference: `train-wireframe/src/lib/types.ts:45,48-55` (reviewHistory and ReviewAction type)
    - Parent references (parentId, parentType) must support linking conversations to templates/scenarios
      Code Reference: `train-wireframe/src/lib/types.ts:42-43`
    - Token count fields must be calculated and stored at generation time
      Code Reference: `train-wireframe/src/lib/types.ts:10,41` (tokenCount fields)
    - Update API endpoint must support partial updates without overwriting entire JSONB objects
      Code Reference: `src/lib/database.ts:38-48` (Update method with partial data)

### 1.2 Audit Trail & Logging Tables

- **FR1.2.1:** Generation Audit Logging
  * Description: Implement comprehensive logging of all API generation requests and responses
  * Impact Weighting: Compliance / Debugging
  * Priority: High
  * User Stories: US9.3.1
  * Tasks: [T-1.2.1]
  * User Story Acceptance Criteria:
    - Generation_logs table with columns: id, conversation_id, run_id, template_id, request_payload, response_payload, parameters, cost_usd, input_tokens, output_tokens, duration_ms, error_message, created_at
    - Log entry created for every API call (success or failure)
    - Logs retained for 90 days (configurable)
    - Query logs by conversation, date range, user, template
    - Export logs as CSV for auditing
    - PII redaction in logs (if applicable)
    - Log compression for long-term storage
  * Functional Requirements Acceptance Criteria:
    - API response logs table must capture full Claude API request/response cycle
      Code Reference: `src/lib/api-response-log-service.ts` (Full API logging service)
    - Log entries must include prompt template used for reproducibility
      Code Reference: `src/app/api/chunks/generate-dimensions/route.ts` (Dimension generation logging)
    - Cost tracking must calculate based on input/output token counts and current API pricing
    - Duration measurement must use high-resolution timestamps (milliseconds precision)
    - Error messages must be sanitized to remove sensitive API keys before storage
    - Batch job logs must link individual conversation logs to parent job_id
      Code Reference: `train-wireframe/src/lib/types.ts:125-144` (BatchJob type)
    - Log query interface must support filtering by status, date range, tier, and template
    - Export functionality must generate CSV with configurable column selection
      Code Reference: `train-wireframe/src/lib/types.ts:205-214` (ExportConfig type)
    - Log retention policy must be enforced via scheduled database cleanup jobs
    - PII detection must scan for common patterns (emails, SSNs, credit cards) and redact
    - Compressed logs must use standard gzip format for S3 archive storage

- **FR1.2.2:** Review Audit Logging
  * Description: Track all approval/rejection actions with reviewer identity and timestamp
  * Impact Weighting: Compliance / Accountability
  * Priority: Medium
  * User Stories: US9.3.2
  * Tasks: [T-1.2.2]
  * User Story Acceptance Criteria:
    - Review_logs table with columns: id, conversation_id, action (approve/reject), reviewer_id, reviewer_notes, timestamp
    - Log entry created for every approval/rejection
    - Audit trail visible per conversation showing all review events
    - Export audit trail for specific conversations or date ranges
    - User activity report showing review activity per user
    - Compliance report: "All conversations reviewed by at least one user"
  * Functional Requirements Acceptance Criteria:
    - Review actions must be stored in reviewHistory array within conversation record
      Code Reference: `train-wireframe/src/lib/types.ts:48-55` (ReviewAction type)
    - Each review action must capture: action type, performer, timestamp, optional comment, optional reasons array
      Code Reference: `train-wireframe/src/lib/types.ts:50-54`
    - Action types must be constrained enum: 'approved' | 'rejected' | 'revision_requested' | 'generated' | 'moved_to_review'
      Code Reference: `train-wireframe/src/lib/types.ts:51`
    - Reviewer identity must link to auth.users table for accountability
    - Review comments must support markdown formatting up to 2000 characters
    - Audit trail query must retrieve full history ordered chronologically
    - Bulk review actions must create individual log entries for each conversation
      Code Reference: `train-wireframe/src/components/dashboard/FilterBar.tsx:315-321` (Bulk action patterns)
    - Review activity reports must aggregate by user, date range, action type
    - Compliance queries must identify conversations without review actions
    - Review timeline visualization must display action sequence with time elapsed
    - Status transitions must be validated (e.g., can't approve from 'draft' without 'generated' state)
      Code Reference: `train-wireframe/src/lib/types.ts:5` (Valid ConversationStatus transitions)

- **FR1.2.3:** Export Audit Logging
  * Description: Maintain complete history of data exports with user attribution and filter state  
  * Impact Weighting: Compliance / Data Governance  
  * Priority: Medium  
  * User Stories: US9.3.3  
  * Tasks: [T-1.2.3]  
  * User Story Acceptance Criteria:
    - Export_logs table with columns: id, export_id, user_id, conversation_count, filter_state, format, exported_at, metadata
    - Log entry for every export action
    - Export history visible showing all exports with details
    - Filter history by user, date range, or conversation count
    - Retention policy: 365 days (configurable)
    - Compliance report: "All exports logged with user attribution"
  * Functional Requirements Acceptance Criteria:
    - Export configuration must capture scope ('selected' | 'filtered' | 'all')
      Code Reference: `train-wireframe/src/lib/types.ts:206`
    - Export format must support: json, jsonl, csv, markdown
      Code Reference: `train-wireframe/src/lib/types.ts:207`
    - Filter state must be serialized as JSON for reproducibility
      Code Reference: `train-wireframe/src/lib/types.ts:159-168` (FilterConfig type)
    - Export metadata must include: conversation IDs, quality statistics, date range, tier distribution
    - Export logs must link to user identity via auth.users table
    - Conversation count must be validated against actual records exported
    - Export format configuration flags must be stored: includeMetadata, includeQualityScores, includeTimestamps, includeApprovalHistory, includeParentReferences, includeFullContent
      Code Reference: `train-wireframe/src/lib/types.ts:208-213`
    - Export history UI must display paginated list with search/filter
    - Re-export functionality must recreate exact filter conditions from stored state
    - Export file naming must include timestamp and description: `training-data-${tier}-${timestamp}.${format}`
    - Large exports (>1000 conversations) must use background job processing
      Code Reference: `train-wireframe/src/lib/types.ts:125-144` (BatchJob for async processing)

### 1.3 Database Performance & Optimization

- **FR1.3.1:** Database Performance Monitoring
  * Description: Implement query performance monitoring and slow query identification
  * Impact Weighting: Performance / Scalability
  * Priority: Low
  * User Stories: US9.1.2
  * Tasks: [T-1.3.1]
  * User Story Acceptance Criteria:
    - Query performance logging showing execution time per query type
    - Slow query identification (> 500ms)
    - Index usage statistics showing which indexes are utilized
    - Table size and row count monitoring
    - Query plan analysis for optimization
    - Alert when query performance degrades
    - Monthly performance report with recommendations
  * Functional Requirements Acceptance Criteria:
    - Supabase query logging must be enabled for all database operations
      Code Reference: `src/lib/supabase.ts` (Supabase client configuration)
    - Query execution time must be measured using database-level timing
    - Slow query threshold must be configurable (default 500ms)
    - Index hit rate must be monitored via pg_stat_user_indexes
    - Table bloat must be calculated periodically via pg_stat_user_tables
    - Query plans must be captured using EXPLAIN ANALYZE for slow queries
    - Performance alerts must trigger when p95 latency exceeds 1000ms
    - Monthly reports must identify: top 10 slowest queries, unused indexes, missing indexes, table scan frequencies
    - Query cache hit rate must be monitored via Supabase metrics
    - Connection pool utilization must be tracked to prevent exhaustion

- **FR1.3.2:** Index Management and Optimization
  * Description: Strategic indexing for optimal query performance with large datasets
  * Impact Weighting: Performance / Scalability
  * Priority: Low  
  * User Stories: US12.2.2  
  * Tasks: [T-1.3.2]  
  * User Story Acceptance Criteria:
    - Indexes on frequently queried fields: status, quality_score, persona, emotion, tier, created_at
    - Composite indexes for common filter combinations (e.g., status + quality_score)
    - Index usage monitoring showing hit rate per index
    - Unused index identification and cleanup
    - Automatic index rebuild when fragmentation detected
    - Query performance alerts when queries exceed 500ms
  * Functional Requirements Acceptance Criteria:
    - Btree indexes must be created on: status, tier, created_at, updated_at, quality_score
      Code Reference: `src/lib/database.ts:9-10` (Order by and filtering patterns)
    - Composite index must exist on (status, quality_score) for filtered dashboard queries
      Code Reference: `train-wireframe/src/components/dashboard/FilterBar.tsx:68-70` (Combined filters)
    - GIN index must be created on category array field for contains operations
      Code Reference: `train-wireframe/src/lib/types.ts:32` (category: string[])
    - Full-text search index must be created on title, persona, emotion fields
      Code Reference: `train-wireframe/src/components/dashboard/DashboardView.tsx:28-31` (Text search)
    - Index on (tier, status, created_at DESC) must support common sorted filtered views
    - Partial index on (status = 'pending_review') must optimize review queue queries
      Code Reference: `train-wireframe/src/components/views/ReviewQueueView.tsx` (Review queue implementation)
    - JSONB field indexes must use GIN with jsonb_path_ops operator class
    - Index bloat must be monitored via pg_stat_user_indexes.idx_scan
    - Unused indexes (idx_scan = 0 for 30 days) must be flagged for review
    - Vacuum and analyze must run weekly to maintain index efficiency
    - Query planner statistics must be kept current via ANALYZE after bulk inserts

- **FR1.3.3:** Metadata Schema Evolution
  * Description: Support backward-compatible schema changes and data migrations
  * Impact Weighting: Flexibility / Future-Proofing
  * Priority: Low
  * User Stories: US9.2.2
  * Tasks: [T-1.3.3]
  * User Story Acceptance Criteria:
    - Add new structured columns via database migrations
    - Migrate data from JSONB to structured columns when needed
    - Backward compatibility: old conversations work with new schema
    - Version tracking for schema changes
    - Rollback support for failed migrations
    - Documentation of schema evolution history
  * Functional Requirements Acceptance Criteria:
    - Migration scripts must use Supabase migrations directory structure
      Code Reference: `src/lib/supabase.ts` (Migration integration)
    - Each migration must include up/down functions for rollback capability
    - Schema version must be tracked in dedicated schema_migrations table
    - JSONB field additions must not require table rewrites (ADD COLUMN with default)
    - Column renames must use database transaction with view compatibility layer
    - Data type changes must use safe coercion with validation
    - New constraints must be added as NOT VALID initially, then validated separately
    - Backward compatibility must be tested against previous application version
    - Migration documentation must include: reason, affected queries, rollback procedure, estimated duration
    - Zero-downtime migrations must use blue-green deployment pattern for breaking changes
    - Column deprecation must follow 3-release cycle: add, migrate, remove

---
