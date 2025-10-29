# Train Platform - Generation Workflows Task Inventory
**Generated:** 2025-10-28
**Scope:** FR 4.1.1, FR 4.1.2, FR 4.2.1, FR 4.2.2 - Conversation Generation Workflows
**Product:** Interactive LoRA Conversation Generation Module

---

## Executive Summary

This task inventory provides a complete implementation roadmap for transforming the Generation Workflows wireframes into a production-ready system with live data integration. The scope covers batch generation (all tiers and tier-specific), single conversation generation, and conversation regeneration functionality.

**Total Tasks:** 34 main tasks with 89 sub-tasks
**Estimated Duration:** 6-8 weeks (2 backend engineers, 2 frontend engineers)
**Priority Distribution:** 12 High, 15 Medium, 7 Low priority tasks

---

## 1. Foundation & Infrastructure

### T-1.1.0: Database Schema for Generation State
- **FR Reference**: FR4.1.1, FR4.1.2
- **Impact Weighting**: System Architecture / Data Integrity
- **Implementation Location**: Database migrations, `src/lib/database.ts`
- **Pattern**: Normalized relational schema with state tracking
- **Dependencies**: None (foundational)
- **Estimated Human Work Hours**: 12-16 hours
- **Description**: Implement database tables and relationships to track conversation generation state, batch jobs, and generation history
- **Testing Tools**: Supabase Studio, SQL scripts, Jest for service layer tests
- **Test Coverage Requirements**: 90%+ for database services
- **Completes Component?**: Yes - Database foundation for all generation workflows

**Functional Requirements Acceptance Criteria**:
- Conversations table with status tracking (draft, generating, generated, approved, rejected, failed)
- Batch_jobs table with progress tracking (queued, processing, paused, completed, failed, cancelled)
- Generation_logs table capturing all API interactions with Claude
- Foreign key constraints maintaining referential integrity
- Indexes on status, tier, created_at for efficient querying (<100ms for 10K records)
- Timestamp fields using timestamptz for timezone awareness
- JSONB fields for flexible parameter storage with GIN indexes
- Row-level security policies for multi-tenant isolation

#### T-1.1.1: Conversations Table Implementation
- **FR Reference**: FR4.1.1, FR4.2.1, FR4.2.2
- **Parent Task**: T-1.1.0
- **Implementation Location**: `supabase/migrations/001_conversations.sql`
- **Pattern**: Normalized schema with metadata columns
- **Dependencies**: None
- **Estimated Human Work Hours**: 4-6 hours
- **Description**: Create conversations table with comprehensive metadata fields and constraints

**Components/Elements**:
- [T-1.1.1:ELE-1] Core Fields: id (uuid PK), conversation_id (unique text), document_id (FK), chunk_id (FK)
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:26-46` (Conversation type)
- [T-1.1.1:ELE-2] Dimension Fields: persona, emotion, topic, intent, tone, tier (enum)
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:29-31`
- [T-1.1.1:ELE-3] Status and Quality: status (enum), quality_score (numeric 0-10), turn_count (integer)
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:5,33-34`
- [T-1.1.1:ELE-4] Audit Fields: created_at, updated_at, created_by, reviewer_notes (text)
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:36-38`
- [T-1.1.1:ELE-5] Relationship Fields: parent_id, parent_type for version tracking
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:42-43`
- [T-1.1.1:ELE-6] Flexible Storage: parameters (JSONB), review_history (JSONB array)
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:44-45,48-55`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define table schema with all required columns (implements ELE-1 through ELE-6)
   - [PREP-2] Create enum types for status and tier (implements ELE-3)
   - [PREP-3] Plan index strategy for frequently queried fields (supports ELE-3, ELE-4)
2. Implementation Phase:
   - [IMP-1] Write CREATE TABLE migration with constraints (implements ELE-1 through ELE-6)
   - [IMP-2] Add btree indexes on status, tier, quality_score, created_at (implements ELE-3, ELE-4)
   - [IMP-3] Add GIN index on parameters JSONB field (implements ELE-6)
   - [IMP-4] Add FK constraints to documents and chunks tables (implements ELE-1)
   - [IMP-5] Create RLS policies for user isolation (implements security)
3. Validation Phase:
   - [VAL-1] Test CRUD operations with sample data (validates all ELE)
   - [VAL-2] Verify index usage with EXPLAIN ANALYZE (validates performance)
   - [VAL-3] Test RLS policies with different users (validates security)

#### T-1.1.2: Batch Jobs Table Implementation
- **FR Reference**: FR4.1.1, FR4.1.2
- **Parent Task**: T-1.1.0
- **Implementation Location**: `supabase/migrations/002_batch_jobs.sql`
- **Pattern**: Job queue pattern with progress tracking
- **Dependencies**: T-1.1.1
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Create batch_jobs table for tracking multi-conversation generation jobs

**Components/Elements**:
- [T-1.1.2:ELE-1] Job Identity: id (uuid PK), name (text), status (enum), priority
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:125-144` (BatchJob type)
- [T-1.1.2:ELE-2] Progress Tracking: total_items, completed_items, failed_items, successful_items
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:129-132`
- [T-1.1.2:ELE-3] Timing: started_at, completed_at, estimated_time_remaining (interval)
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:133-135`
- [T-1.1.2:ELE-4] Configuration: tier filter, shared_parameters (JSONB), concurrent_processing, error_handling
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:138-143`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define batch_jobs schema with progress fields (implements ELE-1 through ELE-4)
   - [PREP-2] Create status enum (queued, processing, paused, completed, failed, cancelled)
2. Implementation Phase:
   - [IMP-1] Write CREATE TABLE migration (implements all ELE)
   - [IMP-2] Add indexes on status and created_at for job queue queries
   - [IMP-3] Create trigger to update estimated_time_remaining based on progress
3. Validation Phase:
   - [VAL-1] Test job creation and status transitions (validates ELE-1)
   - [VAL-2] Verify progress calculations (validates ELE-2, ELE-3)

#### T-1.1.3: Batch Items Junction Table
- **FR Reference**: FR4.1.1, FR4.1.2
- **Parent Task**: T-1.1.0
- **Implementation Location**: `supabase/migrations/003_batch_items.sql`
- **Pattern**: Many-to-many relationship with status
- **Dependencies**: T-1.1.1, T-1.1.2
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: Link conversations to batch jobs with individual item status tracking

**Components/Elements**:
- [T-1.1.3:ELE-1] Relationships: batch_job_id (FK), conversation_id (FK), position (integer)
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:146-157` (BatchItem type)
- [T-1.1.3:ELE-2] Item Status: status (enum), progress (percentage), estimated_time (interval)
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:152-154`
- [T-1.1.3:ELE-3] Error Handling: error_message (text) for failed items
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:156`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define junction table schema (implements ELE-1 through ELE-3)
2. Implementation Phase:
   - [IMP-1] Create batch_items table with FK constraints (implements ELE-1)
   - [IMP-2] Add composite index on (batch_job_id, position) for ordered retrieval
   - [IMP-3] Add CASCADE delete on batch_job_id (implement ELE-1)
3. Validation Phase:
   - [VAL-1] Test batch job with multiple items (validates all ELE)
   - [VAL-2] Verify deletion cascades correctly (validates ELE-1)

#### T-1.1.4: Generation Logs Table
- **FR Reference**: All FR4.X
- **Parent Task**: T-1.1.0
- **Implementation Location**: `supabase/migrations/004_generation_logs.sql`
- **Pattern**: Audit log pattern with full request/response capture
- **Dependencies**: T-1.1.1
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Comprehensive logging of all Claude API interactions for debugging and cost tracking

**Components/Elements**:
- [T-1.1.4:ELE-1] Log Identity: id (uuid PK), conversation_id (FK), run_id (uuid for correlation)
  - Stubs and Code Location(s): `src/lib/api-response-log-service.ts`
- [T-1.1.4:ELE-2] API Details: request_payload (JSONB), response_payload (JSONB), template_id (FK)
  - Stubs and Code Location(s): `src/app/api/chunks/generate-dimensions/route.ts` (logging pattern)
- [T-1.1.4:ELE-3] Cost Tracking: cost_usd (numeric), input_tokens (integer), output_tokens (integer)
- [T-1.1.4:ELE-4] Performance: duration_ms (integer), error_message (text), created_at (timestamptz)

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define comprehensive logging schema (implements ELE-1 through ELE-4)
2. Implementation Phase:
   - [IMP-1] Create generation_logs table with JSONB fields (implements all ELE)
   - [IMP-2] Add GIN indexes on JSONB fields for troubleshooting queries
   - [IMP-3] Add index on created_at for time-based queries
   - [IMP-4] Add partitioning strategy for 90-day retention
3. Validation Phase:
   - [VAL-1] Test log insertion during generation (validates all ELE)
   - [VAL-2] Verify query performance for debugging scenarios

---

## 2. Backend API Implementation

### T-2.1.0: Conversation Generation Service Layer
- **FR Reference**: FR4.1.1, FR4.2.1
- **Impact Weighting**: Core Business Logic / API Integration
- **Implementation Location**: `src/lib/services/conversation-generation-service.ts`
- **Pattern**: Service layer with dependency injection
- **Dependencies**: T-1.1.0
- **Estimated Human Work Hours**: 20-24 hours
- **Description**: Core service orchestrating Claude API calls, template resolution, and conversation persistence
- **Testing Tools**: Jest, Supertest for API testing
- **Test Coverage Requirements**: 85%+
- **Completes Component?**: Yes - Core generation engine

**Functional Requirements Acceptance Criteria**:
- Service handles single conversation generation with template resolution
- Automatic parameter injection from conversation metadata
- Rate limiting with configurable requests per minute (default 50)
- Exponential backoff retry logic (1s, 2s, 4s, 8s, 16s) with max 3 attempts
- Quality validation post-generation (turn count, length, structure)
- Database persistence with transaction support (rollback on failure)
- Comprehensive error handling with typed error responses
- Cost calculation based on input/output tokens

#### T-2.1.1: Claude API Client Implementation
- **FR Reference**: FR4.1.1, FR4.2.1
- **Parent Task**: T-2.1.0
- **Implementation Location**: `src/lib/services/claude-api-client.ts`
- **Pattern**: API client with rate limiting and retry logic
- **Dependencies**: None (external dependency on Anthropic SDK)
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Wrapper around Anthropic SDK providing rate limiting, retries, and error handling

**Components/Elements**:
- [T-2.1.1:ELE-1] API Configuration: model, temperature, max_tokens, top_p
  - Stubs and Code Location(s): `src/lib/ai-config.ts`
- [T-2.1.1:ELE-2] Rate Limiter: sliding window algorithm, configurable limit
  - Stubs and Code Location(s): Reference rate limiting pattern from chunks generation
- [T-2.1.1:ELE-3] Retry Manager: exponential backoff with jitter, max attempts
  - Stubs and Code Location(s): Similar to `src/app/api/chunks/generate-dimensions/route.ts:75-90`
- [T-2.1.1:ELE-4] Request Builder: prompt formatting, system message injection
- [T-2.1.1:ELE-5] Response Parser: JSON extraction, structure validation
- [T-2.1.1:ELE-6] Cost Calculator: token counting, price calculation ($0.015/$0.075 per 1K)

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review Anthropic SDK documentation (supports ELE-1, ELE-4)
   - [PREP-2] Design rate limiter interface (implements ELE-2)
   - [PREP-3] Define error type hierarchy (supports ELE-3)
2. Implementation Phase:
   - [IMP-1] Implement ClaudeAPIClient class with configuration (implements ELE-1)
   - [IMP-2] Build sliding window rate limiter (implements ELE-2)
   - [IMP-3] Add retry logic with exponential backoff and jitter (implements ELE-3)
   - [IMP-4] Create request formatter with template support (implements ELE-4)
   - [IMP-5] Build response parser with validation (implements ELE-5)
   - [IMP-6] Add cost calculation based on usage (implements ELE-6)
3. Validation Phase:
   - [VAL-1] Unit test rate limiter with mock timers (validates ELE-2)
   - [VAL-2] Test retry logic with simulated failures (validates ELE-3)
   - [VAL-3] Integration test with Claude API sandbox (validates all ELE)

#### T-2.1.2: Template Resolution Engine
- **FR Reference**: FR4.1.1, FR4.2.1
- **Parent Task**: T-2.1.0
- **Implementation Location**: `src/lib/services/template-resolver.ts`
- **Pattern**: Template engine with parameter injection
- **Dependencies**: None
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Resolve template placeholders with conversation parameters

**Components/Elements**:
- [T-2.1.2:ELE-1] Template Parser: identify {{placeholders}} in template text
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:62` (structure field)
- [T-2.1.2:ELE-2] Parameter Injector: replace placeholders with values from metadata
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:44` (parameters Record)
- [T-2.1.2:ELE-3] Variable Validator: ensure required variables present
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:76-82` (TemplateVariable type)
- [T-2.1.2:ELE-4] Conditional Logic: support {{var ? 'text' : 'alternative'}} syntax
- [T-2.1.2:ELE-5] Sanitizer: escape HTML/script tags in parameter values

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Research template engine patterns (Handlebars, Mustache) (supports all ELE)
   - [PREP-2] Define template syntax specification
2. Implementation Phase:
   - [IMP-1] Build regex-based parser for {{placeholders}} (implements ELE-1)
   - [IMP-2] Create parameter injection logic (implements ELE-2)
   - [IMP-3] Add validation for required variables (implements ELE-3)
   - [IMP-4] Implement conditional expression evaluator (implements ELE-4)
   - [IMP-5] Add sanitization for user-provided values (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Unit test with various template patterns (validates ELE-1, ELE-2, ELE-4)
   - [VAL-2] Test missing variable detection (validates ELE-3)
   - [VAL-3] Test XSS prevention (validates ELE-5)

#### T-2.1.3: Quality Validation Engine
- **FR Reference**: FR4.1.1, FR4.2.1, FR4.2.2
- **Parent Task**: T-2.1.0
- **Implementation Location**: `src/lib/services/quality-validator.ts`
- **Pattern**: Rule-based validation with scoring
- **Dependencies**: None
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Automated quality checks on generated conversations

**Components/Elements**:
- [T-2.1.3:ELE-1] Turn Count Validator: check 8-16 turns optimal range
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:40` (totalTurns)
- [T-2.1.3:ELE-2] Length Validator: response length appropriate for context
- [T-2.1.3:ELE-3] Structure Validator: valid JSON, required fields present
- [T-2.1.3:ELE-4] Confidence Scorer: calculate composite score 0-10
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:14-24` (QualityMetrics type)
- [T-2.1.3:ELE-5] Quality Thresholds: flag conversations < 6.0 for review
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:34` (qualityScore)

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define quality criteria based on FR specifications (implements all ELE)
   - [PREP-2] Research NLP quality metrics (supports ELE-2, ELE-4)
2. Implementation Phase:
   - [IMP-1] Create TurnCountValidator class (implements ELE-1)
   - [IMP-2] Build LengthValidator with tier-specific thresholds (implements ELE-2)
   - [IMP-3] Implement StructureValidator with JSON schema validation (implements ELE-3)
   - [IMP-4] Create composite ConfidenceScorer (implements ELE-4)
   - [IMP-5] Add threshold-based flagging logic (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Test validators with edge cases (validates ELE-1, ELE-2, ELE-3)
   - [VAL-2] Verify score calculation accuracy (validates ELE-4)
   - [VAL-3] Test auto-flagging logic (validates ELE-5)

#### T-2.1.4: Conversation Persistence Service
- **FR Reference**: All FR4.X
- **Parent Task**: T-2.1.0
- **Implementation Location**: `src/lib/services/conversation-service.ts`
- **Pattern**: Data access layer with transaction support
- **Dependencies**: T-1.1.0
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Database operations for conversations with CRUD and search

**Components/Elements**:
- [T-2.1.4:ELE-1] Create Operation: insert conversation with turns in transaction
  - Stubs and Code Location(s): `src/lib/database.ts:27-36` (create pattern)
- [T-2.1.4:ELE-2] Read Operations: get by ID, list with filters, pagination
  - Stubs and Code Location(s): `src/lib/database.ts:6-24` (query patterns)
- [T-2.1.4:ELE-3] Update Operation: partial updates, status transitions
  - Stubs and Code Location(s): `src/lib/database.ts:38-48` (update pattern)
- [T-2.1.4:ELE-4] Delete Operation: soft delete or hard delete with cascade
- [T-2.1.4:ELE-5] Search: full-text search on title, persona, emotion fields
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/DashboardView.tsx:27-31`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review Supabase client API (supports all ELE)
   - [PREP-2] Define service interface with TypeScript types
2. Implementation Phase:
   - [IMP-1] Implement createConversation with transaction (implements ELE-1)
   - [IMP-2] Build getConversation, listConversations with filters (implements ELE-2)
   - [IMP-3] Create updateConversation with validation (implements ELE-3)
   - [IMP-4] Add deleteConversation with confirmation (implements ELE-4)
   - [IMP-5] Implement searchConversations with ILIKE (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Test CRUD operations with mock data (validates ELE-1 through ELE-4)
   - [VAL-2] Verify transaction rollback on errors (validates ELE-1)
   - [VAL-3] Test search functionality (validates ELE-5)

### T-2.2.0: Batch Generation Orchestration
- **FR Reference**: FR4.1.1, FR4.1.2
- **Impact Weighting**: Scalability / Workflow Automation
- **Implementation Location**: `src/lib/services/batch-generation-service.ts`
- **Pattern**: Queue processor with progress tracking
- **Dependencies**: T-2.1.0
- **Estimated Human Work Hours**: 16-20 hours
- **Description**: Orchestrate multi-conversation generation with rate limiting and error recovery
- **Testing Tools**: Jest with async testing utilities
- **Test Coverage Requirements**: 80%+
- **Completes Component?**: Yes - Batch generation workflows

**Functional Requirements Acceptance Criteria**:
- Process multiple conversations with configurable concurrency (default 3)
- Progress tracking updated in real-time via database
- Graceful error handling at individual conversation level
- Pause/resume/cancel capability
- Cost estimation before starting batch
- Time estimation based on historical averages
- Completion summary with statistics
- Support tier-specific generation (filter by tier)

#### T-2.2.1: Batch Job Manager
- **FR Reference**: FR4.1.1, FR4.1.2
- **Parent Task**: T-2.2.0
- **Implementation Location**: `src/lib/services/batch-job-manager.ts`
- **Pattern**: Job queue with state machine
- **Dependencies**: T-1.1.2, T-1.1.3
- **Estimated Human Work Hours**: 10-12 hours
- **Description**: Manage batch job lifecycle from creation to completion

**Components/Elements**:
- [T-2.2.1:ELE-1] Job Creator: initialize batch job with configuration
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:125-144` (BatchJob type)
- [T-2.2.1:ELE-2] Queue Processor: iterate through batch items with concurrency control
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:141` (concurrentProcessing)
- [T-2.2.1:ELE-3] Progress Tracker: update completion counts in real-time
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:130-133`
- [T-2.2.1:ELE-4] State Machine: manage status transitions (queued → processing → completed/failed)
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:128` (status field)
- [T-2.2.1:ELE-5] Error Handler: continue processing on individual failures based on config
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:143` (errorHandling)
- [T-2.2.1:ELE-6] Control Operations: pause, resume, cancel batch job

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design state machine diagram (implements ELE-4)
   - [PREP-2] Define job configuration interface (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Create BatchJobManager class with job creation (implements ELE-1)
   - [IMP-2] Build queue processor with async iteration (implements ELE-2)
   - [IMP-3] Add progress tracking with database updates (implements ELE-3)
   - [IMP-4] Implement state transitions with validation (implements ELE-4)
   - [IMP-5] Create error handling strategies (continue/stop) (implements ELE-5)
   - [IMP-6] Add pause, resume, cancel methods (implements ELE-6)
3. Validation Phase:
   - [VAL-1] Test job lifecycle end-to-end (validates all ELE)
   - [VAL-2] Test pause/resume functionality (validates ELE-6)
   - [VAL-3] Verify error handling strategies (validates ELE-5)

#### T-2.2.2: Cost and Time Estimator
- **FR Reference**: FR4.1.1, FR4.1.2
- **Parent Task**: T-2.2.0
- **Implementation Location**: `src/lib/services/batch-estimator.ts`
- **Pattern**: Calculator with historical data
- **Dependencies**: None
- **Estimated Human Work Hours**: 4-6 hours
- **Description**: Estimate cost and duration before starting batch

**Components/Elements**:
- [T-2.2.2:ELE-1] Cost Calculator: estimate based on average tokens per tier
- [T-2.2.2:ELE-2] Time Calculator: estimate based on conversation count and rate limits
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:135` (estimatedTimeRemaining)
- [T-2.2.2:ELE-3] Historical Analyzer: use past generations for accuracy
- [T-2.2.2:ELE-4] Pricing Configuration: Claude API pricing ($0.015/$0.075 per 1K tokens)

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Research average token counts per tier (supports ELE-1)
   - [PREP-2] Define estimation formulas (implements ELE-1, ELE-2)
2. Implementation Phase:
   - [IMP-1] Create cost estimation function (implements ELE-1, ELE-4)
   - [IMP-2] Build time estimation with rate limit consideration (implements ELE-2)
   - [IMP-3] Add historical data analysis (implements ELE-3)
3. Validation Phase:
   - [VAL-1] Test estimates against actual costs/times (validates ELE-1, ELE-2)
   - [VAL-2] Verify pricing accuracy (validates ELE-4)

### T-2.3.0: Generation API Endpoints
- **FR Reference**: All FR4.X
- **Impact Weighting**: API Design / Integration
- **Implementation Location**: `src/app/api/conversations/`
- **Pattern**: RESTful API with Next.js App Router
- **Dependencies**: T-2.1.0, T-2.2.0
- **Estimated Human Work Hours**: 12-16 hours
- **Description**: HTTP endpoints for conversation generation operations
- **Testing Tools**: Supertest, Postman collections
- **Test Coverage Requirements**: 85%+
- **Completes Component?**: Yes - Complete API surface

**Functional Requirements Acceptance Criteria**:
- POST /api/conversations/generate - single conversation generation
- POST /api/conversations/generate-batch - batch generation
- GET /api/conversations/:id/status - check generation progress
- PATCH /api/conversations/:id - update conversation
- DELETE /api/conversations/:id - delete conversation
- Proper HTTP status codes (200, 201, 400, 404, 500)
- Request validation with Zod schemas
- Error responses with structured format
- CORS configuration for allowed origins
- Rate limiting at endpoint level

#### T-2.3.1: Single Generation Endpoint
- **FR Reference**: FR4.2.1
- **Parent Task**: T-2.3.0
- **Implementation Location**: `src/app/api/conversations/generate/route.ts`
- **Pattern**: Next.js API route handler
- **Dependencies**: T-2.1.0
- **Estimated Human Work Hours**: 4-5 hours
- **Description**: API endpoint for generating single conversation

**Components/Elements**:
- [T-2.3.1:ELE-1] Request Handler: POST /api/conversations/generate
- [T-2.3.1:ELE-2] Request Schema: validate template_id, parameters, metadata
- [T-2.3.1:ELE-3] Service Integration: call ConversationGenerationService
- [T-2.3.1:ELE-4] Response Format: return conversation with generation metadata
- [T-2.3.1:ELE-5] Error Handling: structured error responses

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define request/response schemas with Zod (implements ELE-2, ELE-4)
2. Implementation Phase:
   - [IMP-1] Create route.ts with POST handler (implements ELE-1)
   - [IMP-2] Add request validation (implements ELE-2)
   - [IMP-3] Integrate with generation service (implements ELE-3)
   - [IMP-4] Format response with conversation data (implements ELE-4)
   - [IMP-5] Add comprehensive error handling (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Test with valid requests (validates ELE-1 through ELE-4)
   - [VAL-2] Test error scenarios (validates ELE-5)

#### T-2.3.2: Batch Generation Endpoint
- **FR Reference**: FR4.1.1, FR4.1.2
- **Parent Task**: T-2.3.0
- **Implementation Location**: `src/app/api/conversations/generate-batch/route.ts`
- **Pattern**: Next.js API route with async processing
- **Dependencies**: T-2.2.0
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: API endpoint for batch generation with job tracking

**Components/Elements**:
- [T-2.3.2:ELE-1] Request Handler: POST /api/conversations/generate-batch
- [T-2.3.2:ELE-2] Request Schema: validate conversation_ids or tier filter, configuration
- [T-2.3.2:ELE-3] Job Creation: create batch job and return job_id
- [T-2.3.2:ELE-4] Async Processing: start batch processing in background
- [T-2.3.2:ELE-5] Response Format: return job_id and initial status

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design batch request schema (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Create route with POST handler (implements ELE-1)
   - [IMP-2] Validate batch request (implements ELE-2)
   - [IMP-3] Initialize batch job (implements ELE-3)
   - [IMP-4] Start async processing (implements ELE-4)
   - [IMP-5] Return job status (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Test batch creation (validates ELE-1 through ELE-3)
   - [VAL-2] Verify async processing starts correctly (validates ELE-4)

#### T-2.3.3: Status Polling Endpoint
- **FR Reference**: FR4.1.1, FR4.1.2
- **Parent Task**: T-2.3.0
- **Implementation Location**: `src/app/api/conversations/[id]/status/route.ts`
- **Pattern**: Polling endpoint with progress data
- **Dependencies**: T-2.2.0
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: Check generation progress for conversations or batch jobs

**Components/Elements**:
- [T-2.3.3:ELE-1] Request Handler: GET /api/conversations/:id/status
- [T-2.3.3:ELE-2] Status Retrieval: fetch current state from database
- [T-2.3.3:ELE-3] Progress Data: return percentage, current item, time remaining
- [T-2.3.3:ELE-4] Caching Headers: prevent unnecessary database queries

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define status response format (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Create GET route handler (implements ELE-1)
   - [IMP-2] Query database for status (implements ELE-2)
   - [IMP-3] Calculate and format progress data (implements ELE-3)
   - [IMP-4] Add cache headers (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test status retrieval for various states (validates ELE-1 through ELE-3)

---

## 3. Frontend UI Components

### T-3.1.0: Batch Generation Modal
- **FR Reference**: FR4.1.1, FR4.1.2
- **Impact Weighting**: User Experience / Core Workflow
- **Implementation Location**: `train-wireframe/src/components/generation/BatchGenerationModal.tsx`
- **Pattern**: Modal dialog with multi-step wizard
- **Dependencies**: T-2.3.0
- **Estimated Human Work Hours**: 16-20 hours
- **Description**: Modal UI for configuring and initiating batch generation
- **Testing Tools**: Jest, React Testing Library
- **Test Coverage Requirements**: 75%+
- **Completes Component?**: Yes - Complete batch generation UI

**Functional Requirements Acceptance Criteria**:
- Modal triggered from "Generate All" button in dashboard header
- Step 1: Configuration - select tier (all, template, scenario, edge_case), set parameters
- Step 2: Preview - show generation plan with conversation count, estimated cost, estimated time
- Step 3: Confirmation - require explicit confirmation to start
- Step 4: Progress - real-time progress bar, current item display, elapsed time, cancel button
- Step 5: Summary - completion statistics, success/failure counts, total cost
- Responsive design, accessible (keyboard navigation, ARIA labels)
- Error handling with user-friendly messages
- State persistence if user closes modal during generation

#### T-3.1.1: Modal Shell and State Management
- **FR Reference**: FR4.1.1
- **Parent Task**: T-3.1.0
- **Implementation Location**: `train-wireframe/src/components/generation/BatchGenerationModal.tsx`
- **Pattern**: React component with Zustand store
- **Dependencies**: None
- **Estimated Human Work Hours**: 4-5 hours
- **Description**: Modal container with open/close logic and step management

**Components/Elements**:
- [T-3.1.1:ELE-1] Modal Container: Dialog component from Shadcn/UI
  - Stubs and Code Location(s): `train-wireframe/src/components/ui/dialog.tsx`
- [T-3.1.1:ELE-2] State Management: Zustand store for modal state
  - Stubs and Code Location(s): `train-wireframe/src/stores/useAppStore.ts:37-38,92-96` (modal actions)
- [T-3.1.1:ELE-3] Step Navigator: track current step (config, preview, confirm, progress, summary)
- [T-3.1.1:ELE-4] Close Handler: confirm before closing during generation
  - Stubs and Code Location(s): `train-wireframe/src/stores/useAppStore.ts:96-99` (confirmation pattern)

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design step flow diagram (implements ELE-3)
   - [PREP-2] Define modal state interface (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Create BatchGenerationModal component skeleton (implements ELE-1)
   - [IMP-2] Add Zustand store slice for modal state (implements ELE-2)
   - [IMP-3] Build step navigation logic (implements ELE-3)
   - [IMP-4] Implement close confirmation (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test modal open/close (validates ELE-1, ELE-2)
   - [VAL-2] Test step navigation (validates ELE-3)
   - [VAL-3] Test close confirmation during generation (validates ELE-4)

#### T-3.1.2: Configuration Step Component
- **FR Reference**: FR4.1.1, FR4.1.2
- **Parent Task**: T-3.1.0
- **Implementation Location**: `train-wireframe/src/components/generation/BatchConfigStep.tsx`
- **Pattern**: Form component with validation
- **Dependencies**: T-3.1.1
- **Estimated Human Work Hours**: 5-6 hours
- **Description**: Step 1 - Select tier and configure batch parameters

**Components/Elements**:
- [T-3.1.2:ELE-1] Tier Selector: radio group for all, template, scenario, edge_case
  - Stubs and Code Location(s): `train-wireframe/src/components/ui/radio-group.tsx`
- [T-3.1.2:ELE-2] Conversation Count Display: show how many conversations will be generated
- [T-3.1.2:ELE-3] Error Handling Mode: dropdown for continue/stop on error
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:143` (errorHandling field)
- [T-3.1.2:ELE-4] Concurrency Slider: set parallel processing limit (1-5)
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:141,142` (concurrentProcessing)
- [T-3.1.2:ELE-5] Next Button: proceed to preview step

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design form layout (implements all ELE)
2. Implementation Phase:
   - [IMP-1] Create tier selector with radio buttons (implements ELE-1)
   - [IMP-2] Add conversation count calculation (implements ELE-2)
   - [IMP-3] Build error handling dropdown (implements ELE-3)
   - [IMP-4] Add concurrency slider with labels (implements ELE-4)
   - [IMP-5] Implement next button with validation (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Test tier selection updates count (validates ELE-1, ELE-2)
   - [VAL-2] Test form validation (validates ELE-5)

#### T-3.1.3: Preview and Estimation Step
- **FR Reference**: FR4.1.1, FR4.1.2
- **Parent Task**: T-3.1.0
- **Implementation Location**: `train-wireframe/src/components/generation/BatchPreviewStep.tsx`
- **Pattern**: Read-only preview with estimations
- **Dependencies**: T-2.2.2, T-3.1.2
- **Estimated Human Work Hours**: 4-5 hours
- **Description**: Step 2 - Show generation plan with cost/time estimates

**Components/Elements**:
- [T-3.1.3:ELE-1] Generation Plan Summary: tier breakdown, conversation counts
- [T-3.1.3:ELE-2] Cost Estimation: display estimated cost in USD
- [T-3.1.3:ELE-3] Time Estimation: display estimated duration (e.g., "~45 minutes")
- [T-3.1.3:ELE-4] Configuration Review: show selected options (error handling, concurrency)
- [T-3.1.3:ELE-5] Navigation Buttons: back, confirm and start

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design preview layout (implements all ELE)
2. Implementation Phase:
   - [IMP-1] Create summary display component (implements ELE-1, ELE-4)
   - [IMP-2] Integrate with cost estimator API (implements ELE-2)
   - [IMP-3] Integrate with time estimator (implements ELE-3)
   - [IMP-4] Add back and start buttons (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Test estimation accuracy display (validates ELE-2, ELE-3)
   - [VAL-2] Test navigation flow (validates ELE-5)

#### T-3.1.4: Progress Tracking Component
- **FR Reference**: FR4.1.1, FR4.1.2
- **Parent Task**: T-3.1.0
- **Implementation Location**: `train-wireframe/src/components/generation/BatchProgressStep.tsx`
- **Pattern**: Real-time progress display with polling
- **Dependencies**: T-2.3.3, T-3.1.1
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Step 4 - Real-time progress visualization during generation

**Components/Elements**:
- [T-3.1.4:ELE-1] Progress Bar: visual indicator of completion percentage
  - Stubs and Code Location(s): `train-wireframe/src/components/ui/progress.tsx`
- [T-3.1.4:ELE-2] Status Text: "Generating conversation 42 of 100..."
- [T-3.1.4:ELE-3] Current Item Display: show persona/topic being generated
- [T-3.1.4:ELE-4] Elapsed Time: show time since start
- [T-3.1.4:ELE-5] Time Remaining: estimated time to completion
- [T-3.1.4:ELE-6] Cancel Button: stop generation gracefully
  - Stubs and Code Location(s): `train-wireframe/src/stores/useAppStore.ts:96-99` (confirmation)
- [T-3.1.4:ELE-7] Polling Logic: fetch status every 2-5 seconds

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design progress display layout (implements ELE-1 through ELE-6)
   - [PREP-2] Plan polling strategy (implements ELE-7)
2. Implementation Phase:
   - [IMP-1] Create progress bar component (implements ELE-1)
   - [IMP-2] Add status text with dynamic updates (implements ELE-2)
   - [IMP-3] Display current item being processed (implements ELE-3)
   - [IMP-4] Calculate and display elapsed time (implements ELE-4)
   - [IMP-5] Calculate and display time remaining (implements ELE-5)
   - [IMP-6] Add cancel button with confirmation (implements ELE-6)
   - [IMP-7] Implement polling with cleanup (implements ELE-7)
3. Validation Phase:
   - [VAL-1] Test progress updates in real-time (validates ELE-1 through ELE-5, ELE-7)
   - [VAL-2] Test cancel functionality (validates ELE-6)
   - [VAL-3] Verify polling cleanup on unmount (validates ELE-7)

#### T-3.1.5: Completion Summary Component
- **FR Reference**: FR4.1.1, FR4.1.2
- **Parent Task**: T-3.1.0
- **Implementation Location**: `train-wireframe/src/components/generation/BatchSummaryStep.tsx`
- **Pattern**: Summary display with statistics
- **Dependencies**: T-3.1.4
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Step 5 - Show completion statistics and results

**Components/Elements**:
- [T-3.1.5:ELE-1] Success Count: conversations generated successfully
- [T-3.1.5:ELE-2] Failure Count: conversations that failed with link to errors
- [T-3.1.5:ELE-3] Total Cost: actual cost incurred vs. estimate
- [T-3.1.5:ELE-4] Duration: total time taken
- [T-3.1.5:ELE-5] Actions: view conversations, close modal, regenerate failed
- [T-3.1.5:ELE-6] Toast Notification: success message with statistics

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design summary layout (implements all ELE)
2. Implementation Phase:
   - [IMP-1] Create summary statistics display (implements ELE-1 through ELE-4)
   - [IMP-2] Add action buttons (implements ELE-5)
   - [IMP-3] Trigger success toast (implements ELE-6)
3. Validation Phase:
   - [VAL-1] Test summary with various completion scenarios (validates ELE-1 through ELE-4)
   - [VAL-2] Test action buttons (validates ELE-5)

### T-3.2.0: Single Generation Form
- **FR Reference**: FR4.2.1
- **Impact Weighting**: User Experience / Flexibility
- **Implementation Location**: `train-wireframe/src/components/generation/SingleGenerationForm.tsx`
- **Pattern**: Modal form with template preview
- **Dependencies**: T-2.3.1
- **Estimated Human Work Hours**: 10-12 hours
- **Description**: Form for generating single conversation with custom parameters
- **Testing Tools**: Jest, React Testing Library
- **Test Coverage Requirements**: 75%+
- **Completes Component?**: Yes - Single generation UI

**Functional Requirements Acceptance Criteria**:
- Modal triggered from "Generate Single" button
- Template selector dropdown listing active templates
- Persona dropdown with available personas
- Emotion dropdown with emotion options
- Custom parameters section for key-value pairs
- Template preview pane showing resolved prompt
- Generate button to submit
- Loading state during generation
- Success state with conversation preview
- Error state with retry option

#### T-3.2.1: Form Layout and Fields
- **FR Reference**: FR4.2.1
- **Parent Task**: T-3.2.0
- **Implementation Location**: `train-wireframe/src/components/generation/SingleGenerationForm.tsx`
- **Pattern**: Controlled form with React Hook Form
- **Dependencies**: None
- **Estimated Human Work Hours**: 5-6 hours
- **Description**: Form UI with all input fields

**Components/Elements**:
- [T-3.2.1:ELE-1] Modal Container: Dialog from Shadcn/UI
  - Stubs and Code Location(s): `train-wireframe/src/components/ui/dialog.tsx`
- [T-3.2.1:ELE-2] Template Selector: dropdown populated from active templates
  - Stubs and Code Location(s): `train-wireframe/src/components/ui/select.tsx`
- [T-3.2.1:ELE-3] Persona Selector: dropdown with persona options
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:257-265`
- [T-3.2.1:ELE-4] Emotion Selector: dropdown with emotion options
- [T-3.2.1:ELE-5] Custom Parameters: dynamic key-value input fields
- [T-3.2.1:ELE-6] Form Validation: required fields, format checks

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design form layout (implements all ELE)
   - [PREP-2] Set up React Hook Form (supports ELE-6)
2. Implementation Phase:
   - [IMP-1] Create modal container (implements ELE-1)
   - [IMP-2] Build template dropdown with API integration (implements ELE-2)
   - [IMP-3] Add persona dropdown (implements ELE-3)
   - [IMP-4] Add emotion dropdown (implements ELE-4)
   - [IMP-5] Create custom parameters section (implements ELE-5)
   - [IMP-6] Add form validation rules (implements ELE-6)
3. Validation Phase:
   - [VAL-1] Test form fields (validates ELE-2 through ELE-5)
   - [VAL-2] Test validation errors (validates ELE-6)

#### T-3.2.2: Template Preview Pane
- **FR Reference**: FR4.2.1
- **Parent Task**: T-3.2.0
- **Implementation Location**: `train-wireframe/src/components/generation/TemplatePreview.tsx`
- **Pattern**: Live preview with parameter resolution
- **Dependencies**: T-3.2.1
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Show resolved template with user-selected parameters

**Components/Elements**:
- [T-3.2.2:ELE-1] Preview Pane: scrollable text area showing resolved template
- [T-3.2.2:ELE-2] Parameter Resolution: replace {{placeholders}} with form values
- [T-3.2.2:ELE-3] Syntax Highlighting: highlight placeholders in preview
- [T-3.2.2:ELE-4] Update Trigger: refresh preview when form values change

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design preview layout (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Create preview pane component (implements ELE-1)
   - [IMP-2] Integrate template resolver for preview (implements ELE-2)
   - [IMP-3] Add syntax highlighting (implements ELE-3)
   - [IMP-4] Hook up live updates (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test parameter resolution accuracy (validates ELE-2)
   - [VAL-2] Test live preview updates (validates ELE-4)

#### T-3.2.3: Generation Execution and Result Display
- **FR Reference**: FR4.2.1
- **Parent Task**: T-3.2.0
- **Implementation Location**: `train-wireframe/src/components/generation/SingleGenerationResult.tsx`
- **Pattern**: Async state management with result display
- **Dependencies**: T-2.3.1, T-3.2.1
- **Estimated Human Work Hours**: 4-5 hours
- **Description**: Handle generation submission and display results

**Components/Elements**:
- [T-3.2.3:ELE-1] Generate Button: submit form and trigger API call
- [T-3.2.3:ELE-2] Loading State: spinner with "Generating conversation..." message
  - Stubs and Code Location(s): `train-wireframe/src/stores/useAppStore.ts:48-49,101` (loading state)
- [T-3.2.3:ELE-3] Success State: conversation preview with save option
- [T-3.2.3:ELE-4] Error State: error message with retry button
- [T-3.2.3:ELE-5] Save Action: persist conversation to database

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design result display states (implements ELE-2 through ELE-4)
2. Implementation Phase:
   - [IMP-1] Create generate button with submit handler (implements ELE-1)
   - [IMP-2] Add loading state with spinner (implements ELE-2)
   - [IMP-3] Build success display with preview (implements ELE-3)
   - [IMP-4] Add error display with retry (implements ELE-4)
   - [IMP-5] Implement save action (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Test generation flow (validates ELE-1 through ELE-3)
   - [VAL-2] Test error handling and retry (validates ELE-4)
   - [VAL-3] Test save functionality (validates ELE-5)

### T-3.3.0: Regenerate Conversation UI
- **FR Reference**: FR4.2.2
- **Impact Weighting**: Quality Improvement / Iteration
- **Implementation Location**: Inline action in `train-wireframe/src/components/dashboard/ConversationTable.tsx`
- **Pattern**: Dropdown action with pre-filled form
- **Dependencies**: T-3.2.0, T-2.3.1
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Regenerate existing conversation with option to modify parameters
- **Testing Tools**: Jest, React Testing Library
- **Test Coverage Requirements**: 70%+
- **Completes Component?**: Yes - Regeneration workflow

**Functional Requirements Acceptance Criteria**:
- Regenerate action in conversation row dropdown menu
- Modal pre-fills form with existing conversation parameters
- User can modify parameters before regenerating
- Original conversation status set to 'archived'
- New conversation created with parentId linking to original
- Version history displayed in conversation detail
- Toast notification confirming regeneration

#### T-3.3.1: Regenerate Action Integration
- **FR Reference**: FR4.2.2
- **Parent Task**: T-3.3.0
- **Implementation Location**: `train-wireframe/src/components/dashboard/ConversationTable.tsx`
- **Pattern**: Dropdown menu item with action handler
- **Dependencies**: T-3.2.0
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: Add regenerate action to conversation dropdown menu

**Components/Elements**:
- [T-3.3.1:ELE-1] Menu Item: "Regenerate" in actions dropdown
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/ConversationTable.tsx:269-306` (dropdown actions)
- [T-3.3.1:ELE-2] Click Handler: open single generation form with pre-filled data
- [T-3.3.1:ELE-3] Data Fetcher: retrieve conversation details for pre-fill

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Plan regeneration flow (implements all ELE)
2. Implementation Phase:
   - [IMP-1] Add "Regenerate" menu item to dropdown (implements ELE-1)
   - [IMP-2] Create click handler (implements ELE-2)
   - [IMP-3] Fetch conversation data for pre-fill (implements ELE-3)
3. Validation Phase:
   - [VAL-1] Test regenerate action opens form with data (validates all ELE)

#### T-3.3.2: Archival and Version Linking Logic
- **FR Reference**: FR4.2.2
- **Parent Task**: T-3.3.0
- **Implementation Location**: `src/lib/services/conversation-service.ts`
- **Pattern**: Database transaction with status update and creation
- **Dependencies**: T-2.1.4
- **Estimated Human Work Hours**: 4-5 hours
- **Description**: Archive original conversation and link new version

**Components/Elements**:
- [T-3.3.2:ELE-1] Archive Operation: update original conversation status to 'archived'
- [T-3.3.2:ELE-2] Version Linking: set parentId on new conversation
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:42-43` (parentId, parentType)
- [T-3.3.2:ELE-3] Transaction Handling: rollback if either operation fails
- [T-3.3.2:ELE-4] Notification: toast confirmation of successful regeneration

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design transaction flow (implements ELE-1 through ELE-3)
2. Implementation Phase:
   - [IMP-1] Create archiveAndRegenerate method (implements ELE-1, ELE-2)
   - [IMP-2] Wrap operations in database transaction (implements ELE-3)
   - [IMP-3] Add success notification (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test successful regeneration (validates ELE-1 through ELE-4)
   - [VAL-2] Test rollback on failure (validates ELE-3)

#### T-3.3.3: Version History Display
- **FR Reference**: FR4.2.2
- **Parent Task**: T-3.3.0
- **Implementation Location**: `train-wireframe/src/components/conversations/VersionHistory.tsx`
- **Pattern**: Timeline component with version links
- **Dependencies**: T-3.3.2
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Show version history with links to previous versions

**Components/Elements**:
- [T-3.3.3:ELE-1] Version Query: follow parentId chain to build history
- [T-3.3.3:ELE-2] Timeline Display: chronological list of versions
- [T-3.3.3:ELE-3] Version Links: clickable to view previous versions
- [T-3.3.3:ELE-4] Current Indicator: highlight active version

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design version history UI (implements ELE-2 through ELE-4)
2. Implementation Phase:
   - [IMP-1] Create version history query (implements ELE-1)
   - [IMP-2] Build timeline component (implements ELE-2)
   - [IMP-3] Add version links (implements ELE-3)
   - [IMP-4] Highlight current version (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test history display with multiple versions (validates all ELE)

---

## 4. Quality Assurance & Testing

### T-4.1.0: Unit Testing Suite
- **FR Reference**: All FR4.X
- **Impact Weighting**: Code Quality / Maintainability
- **Implementation Location**: `**/*.test.ts` files throughout codebase
- **Pattern**: Jest with React Testing Library
- **Dependencies**: All previous tasks
- **Estimated Human Work Hours**: 16-20 hours
- **Description**: Comprehensive unit tests for all components and services
- **Testing Tools**: Jest, React Testing Library, Mock Service Worker
- **Test Coverage Requirements**: 85%+ overall, 90%+ for critical paths
- **Completes Component?**: Yes - Complete test coverage

**Functional Requirements Acceptance Criteria**:
- Unit tests for all service layer functions
- Component tests for all UI components
- Mock API responses for integration testing
- Edge case coverage for error scenarios
- Performance benchmarks for critical operations
- Accessibility tests for keyboard navigation and screen readers

#### T-4.1.1: Service Layer Unit Tests
- **FR Reference**: FR4.1.1, FR4.2.1
- **Parent Task**: T-4.1.0
- **Implementation Location**: `src/lib/services/*.test.ts`
- **Pattern**: Jest unit tests with mocks
- **Dependencies**: T-2.1.0, T-2.2.0
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Test all service methods with mocked dependencies

**Components/Elements**:
- [T-4.1.1:ELE-1] ClaudeAPIClient Tests: mock API responses, test rate limiting, retry logic
- [T-4.1.1:ELE-2] TemplateResolver Tests: test parameter injection, validation, edge cases
- [T-4.1.1:ELE-3] QualityValidator Tests: test scoring logic with various inputs
- [T-4.1.1:ELE-4] ConversationService Tests: test CRUD operations with mocked database
- [T-4.1.1:ELE-5] BatchJobManager Tests: test job lifecycle, state transitions, error handling

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Set up Jest configuration and test utilities
2. Implementation Phase:
   - [IMP-1] Write ClaudeAPIClient tests (implements ELE-1)
   - [IMP-2] Write TemplateResolver tests (implements ELE-2)
   - [IMP-3] Write QualityValidator tests (implements ELE-3)
   - [IMP-4] Write ConversationService tests (implements ELE-4)
   - [IMP-5] Write BatchJobManager tests (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Achieve 90%+ coverage for services (validates all ELE)

#### T-4.1.2: Component Unit Tests
- **FR Reference**: All FR4.X
- **Parent Task**: T-4.1.0
- **Implementation Location**: `train-wireframe/src/components/**/*.test.tsx`
- **Pattern**: React Testing Library with user event simulation
- **Dependencies**: T-3.1.0, T-3.2.0, T-3.3.0
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Test all React components with user interactions

**Components/Elements**:
- [T-4.1.2:ELE-1] BatchGenerationModal Tests: test all steps, state transitions, user interactions
- [T-4.1.2:ELE-2] SingleGenerationForm Tests: test form validation, submission, error states
- [T-4.1.2:ELE-3] ProgressStep Tests: test progress updates, polling, cancel functionality
- [T-4.1.2:ELE-4] ConversationTable Tests: test sorting, filtering, actions

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Set up React Testing Library utilities
2. Implementation Phase:
   - [IMP-1] Write BatchGenerationModal tests (implements ELE-1)
   - [IMP-2] Write SingleGenerationForm tests (implements ELE-2)
   - [IMP-3] Write ProgressStep tests (implements ELE-3)
   - [IMP-4] Write ConversationTable tests (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Achieve 80%+ coverage for components (validates all ELE)

### T-4.2.0: Integration Testing
- **FR Reference**: All FR4.X
- **Impact Weighting**: System Reliability / End-to-End Validation
- **Implementation Location**: `tests/integration/`
- **Pattern**: Supertest with test database
- **Dependencies**: T-2.3.0, T-4.1.0
- **Estimated Human Work Hours**: 12-16 hours
- **Description**: End-to-end API testing with real database
- **Testing Tools**: Supertest, Test Containers, Mock Claude API
- **Test Coverage Requirements**: 70%+ for critical user flows
- **Completes Component?**: Yes - Integration test suite

**Functional Requirements Acceptance Criteria**:
- Test single generation flow end-to-end
- Test batch generation with multiple conversations
- Test regeneration workflow
- Test error scenarios and recovery
- Test concurrent batch jobs
- Performance benchmarks (<30s for single generation, <60min for 100 conversations)

#### T-4.2.1: API Integration Tests
- **FR Reference**: FR4.1.1, FR4.2.1, FR4.2.2
- **Parent Task**: T-4.2.0
- **Implementation Location**: `tests/integration/api/conversations.test.ts`
- **Pattern**: Supertest with seeded test database
- **Dependencies**: T-2.3.0
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Test all conversation API endpoints

**Components/Elements**:
- [T-4.2.1:ELE-1] Single Generation Tests: test POST /api/conversations/generate
- [T-4.2.1:ELE-2] Batch Generation Tests: test POST /api/conversations/generate-batch
- [T-4.2.1:ELE-3] Status Polling Tests: test GET /api/conversations/:id/status
- [T-4.2.1:ELE-4] Error Scenario Tests: test 400, 404, 500 responses
- [T-4.2.1:ELE-5] Concurrent Request Tests: test rate limiting behavior

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Set up test database with seed data
   - [PREP-2] Configure mock Claude API responses
2. Implementation Phase:
   - [IMP-1] Write single generation integration test (implements ELE-1)
   - [IMP-2] Write batch generation integration test (implements ELE-2)
   - [IMP-3] Write status polling test (implements ELE-3)
   - [IMP-4] Write error scenario tests (implements ELE-4)
   - [IMP-5] Write concurrent request tests (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Run full integration test suite (validates all ELE)

#### T-4.2.2: End-to-End Workflow Tests
- **FR Reference**: FR4.1.1, FR4.2.2
- **Parent Task**: T-4.2.0
- **Implementation Location**: `tests/integration/workflows/generation.test.ts`
- **Pattern**: Full workflow simulation
- **Dependencies**: T-4.2.1
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Test complete user workflows end-to-end

**Components/Elements**:
- [T-4.2.2:ELE-1] Batch Generation Workflow: create job, process, complete, verify results
- [T-4.2.2:ELE-2] Regeneration Workflow: generate, archive, regenerate, verify version link
- [T-4.2.2:ELE-3] Error Recovery Workflow: simulate failures, verify retry and recovery
- [T-4.2.2:ELE-4] Performance Benchmarks: measure generation times

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design workflow test scenarios (implements all ELE)
2. Implementation Phase:
   - [IMP-1] Write batch workflow test (implements ELE-1)
   - [IMP-2] Write regeneration workflow test (implements ELE-2)
   - [IMP-3] Write error recovery test (implements ELE-3)
   - [IMP-4] Add performance measurement (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Run workflow tests and verify results (validates all ELE)

---

## 5. Deployment & Operations

### T-5.1.0: Production Configuration
- **FR Reference**: All FR4.X
- **Impact Weighting**: System Reliability / Security
- **Implementation Location**: Environment files, CI/CD configs
- **Pattern**: Environment-based configuration
- **Dependencies**: All previous tasks
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Configure production environment with proper security and monitoring
- **Testing Tools**: Environment validators, smoke tests
- **Test Coverage Requirements**: 100% configuration validation
- **Completes Component?**: Yes - Production-ready configuration

**Functional Requirements Acceptance Criteria**:
- Environment variables for Claude API key, database URL, rate limits
- Supabase configuration for production database
- CORS configuration for allowed origins
- Rate limiting at application and network level
- Error logging and monitoring (Sentry or equivalent)
- Performance monitoring dashboards
- Backup and disaster recovery procedures
- Security headers and CSP policies

#### T-5.1.1: Environment Configuration
- **FR Reference**: All FR4.X
- **Parent Task**: T-5.1.0
- **Implementation Location**: `.env.production`, `vercel.json`, etc.
- **Pattern**: 12-factor app principles
- **Dependencies**: None
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Set up environment variables and configurations

**Components/Elements**:
- [T-5.1.1:ELE-1] Database Configuration: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY
  - Stubs and Code Location(s): `src/lib/supabase.ts`
- [T-5.1.1:ELE-2] API Keys: ANTHROPIC_API_KEY with proper scoping
  - Stubs and Code Location(s): `src/lib/ai-config.ts`
- [T-5.1.1:ELE-3] Rate Limiting: RATE_LIMIT_RPM, CONCURRENT_REQUESTS
- [T-5.1.1:ELE-4] Monitoring: SENTRY_DSN, LOG_LEVEL
- [T-5.1.1:ELE-5] Security: NEXTAUTH_SECRET, NEXTAUTH_URL, ALLOWED_ORIGINS

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Audit all environment variables used in codebase (supports all ELE)
2. Implementation Phase:
   - [IMP-1] Create .env.production template (implements all ELE)
   - [IMP-2] Document each variable with descriptions
   - [IMP-3] Set up secret management in Vercel/hosting platform
3. Validation Phase:
   - [VAL-1] Validate all required variables present (validates all ELE)
   - [VAL-2] Test configuration in staging environment

#### T-5.1.2: Monitoring and Logging Setup
- **FR Reference**: All FR4.X
- **Parent Task**: T-5.1.0
- **Implementation Location**: `src/lib/monitoring.ts`, Sentry config
- **Pattern**: Structured logging with external service
- **Dependencies**: T-5.1.1
- **Estimated Human Work Hours**: 5-6 hours
- **Description**: Set up error tracking, logging, and performance monitoring

**Components/Elements**:
- [T-5.1.2:ELE-1] Error Tracking: Sentry integration for error capture
- [T-5.1.2:ELE-2] Performance Monitoring: track API response times, database query times
- [T-5.1.2:ELE-3] Custom Metrics: generation success rate, batch completion time, cost per conversation
- [T-5.1.2:ELE-4] Alerting: set up alerts for critical errors and performance degradation
- [T-5.1.2:ELE-5] Dashboards: create monitoring dashboards for operations team

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Choose monitoring platform (Sentry, DataDog, etc.)
2. Implementation Phase:
   - [IMP-1] Integrate Sentry SDK (implements ELE-1)
   - [IMP-2] Add performance instrumentation (implements ELE-2)
   - [IMP-3] Create custom metrics collectors (implements ELE-3)
   - [IMP-4] Configure alerting rules (implements ELE-4)
   - [IMP-5] Build operational dashboards (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Trigger test errors and verify capture (validates ELE-1)
   - [VAL-2] Verify performance metrics collection (validates ELE-2, ELE-3)

### T-5.2.0: Documentation and Runbooks
- **FR Reference**: All FR4.X
- **Impact Weighting**: Maintainability / Operations
- **Implementation Location**: `docs/` directory
- **Pattern**: Markdown documentation
- **Dependencies**: All previous tasks
- **Estimated Human Work Hours**: 12-16 hours
- **Description**: Comprehensive documentation for developers and operators
- **Testing Tools**: Documentation linters, link checkers
- **Test Coverage Requirements**: 100% API endpoints documented
- **Completes Component?**: Yes - Complete documentation

**Functional Requirements Acceptance Criteria**:
- API documentation with request/response examples
- Architecture diagrams showing system components
- Deployment runbook with step-by-step instructions
- Troubleshooting guide for common issues
- Database schema documentation
- Rate limiting and cost management guide
- Disaster recovery procedures

#### T-5.2.1: API Documentation
- **FR Reference**: All FR4.X
- **Parent Task**: T-5.2.0
- **Implementation Location**: `docs/api/conversations.md`
- **Pattern**: OpenAPI/Swagger specification
- **Dependencies**: T-2.3.0
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Complete API reference documentation

**Components/Elements**:
- [T-5.2.1:ELE-1] Endpoint Documentation: all routes with descriptions
- [T-5.2.1:ELE-2] Request Schemas: JSON examples for each endpoint
- [T-5.2.1:ELE-3] Response Schemas: success and error response formats
- [T-5.2.1:ELE-4] Authentication: how to authenticate requests
- [T-5.2.1:ELE-5] Rate Limiting: document rate limit headers and behavior

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Choose documentation format (OpenAPI, Markdown, etc.)
2. Implementation Phase:
   - [IMP-1] Document all endpoints (implements ELE-1)
   - [IMP-2] Add request examples (implements ELE-2)
   - [IMP-3] Add response examples (implements ELE-3)
   - [IMP-4] Document authentication (implements ELE-4)
   - [IMP-5] Document rate limiting (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Review documentation completeness (validates all ELE)

#### T-5.2.2: Operations Runbook
- **FR Reference**: All FR4.X
- **Parent Task**: T-5.2.0
- **Implementation Location**: `docs/operations/runbook.md`
- **Pattern**: Step-by-step procedures
- **Dependencies**: T-5.1.0
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Operational procedures for deployment and maintenance

**Components/Elements**:
- [T-5.2.2:ELE-1] Deployment Procedures: step-by-step deployment instructions
- [T-5.2.2:ELE-2] Monitoring Checklist: what to monitor after deployment
- [T-5.2.2:ELE-3] Troubleshooting Guide: common issues and solutions
- [T-5.2.2:ELE-4] Rollback Procedures: how to rollback failed deployments
- [T-5.2.2:ELE-5] Database Maintenance: backup, restore, migration procedures

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Identify key operational scenarios (supports all ELE)
2. Implementation Phase:
   - [IMP-1] Write deployment procedures (implements ELE-1)
   - [IMP-2] Create monitoring checklist (implements ELE-2)
   - [IMP-3] Document troubleshooting steps (implements ELE-3)
   - [IMP-4] Write rollback procedures (implements ELE-4)
   - [IMP-5] Document database maintenance (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Test procedures in staging (validates all ELE)

---

## 6. Performance Optimization

### T-6.1.0: Database Query Optimization
- **FR Reference**: All FR4.X
- **Impact Weighting**: Performance / Scalability
- **Implementation Location**: Database migrations, query analysis
- **Pattern**: Index optimization and query tuning
- **Dependencies**: T-1.1.0, T-4.2.0
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Optimize database queries for production workloads
- **Testing Tools**: EXPLAIN ANALYZE, pg_stat_statements
- **Test Coverage Requirements**: <100ms for 95th percentile queries
- **Completes Component?**: Yes - Optimized database performance

**Functional Requirements Acceptance Criteria**:
- All frequently queried columns have appropriate indexes
- Composite indexes for common filter combinations
- Query performance <100ms for table scans up to 10,000 records
- No N+1 query problems in API endpoints
- Connection pooling configured appropriately
- Slow query logging enabled for queries >500ms

#### T-6.1.1: Index Analysis and Creation
- **FR Reference**: FR4.1.1, FR4.2.1
- **Parent Task**: T-6.1.0
- **Implementation Location**: Database migrations, performance analysis scripts
- **Pattern**: Index strategy based on query patterns
- **Dependencies**: T-1.1.0, T-4.2.1
- **Estimated Human Work Hours**: 4-5 hours
- **Description**: Analyze query patterns and create optimal indexes

**Components/Elements**:
- [T-6.1.1:ELE-1] Query Analysis: identify slow queries using pg_stat_statements
- [T-6.1.1:ELE-2] Index Creation: btree indexes on status, tier, quality_score, created_at
- [T-6.1.1:ELE-3] Composite Indexes: (status, quality_score), (tier, status, created_at)
- [T-6.1.1:ELE-4] JSONB Indexes: GIN indexes on parameters and quality_metrics
- [T-6.1.1:ELE-5] Partial Indexes: index on (status = 'pending_review') for review queue

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Collect query statistics from integration tests (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Analyze slow queries (implements ELE-1)
   - [IMP-2] Create btree indexes (implements ELE-2)
   - [IMP-3] Add composite indexes (implements ELE-3)
   - [IMP-4] Create JSONB GIN indexes (implements ELE-4)
   - [IMP-5] Add partial indexes (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Measure query performance before/after (validates all ELE)
   - [VAL-2] Verify index usage with EXPLAIN ANALYZE

#### T-6.1.2: Query Optimization
- **FR Reference**: All FR4.X
- **Parent Task**: T-6.1.0
- **Implementation Location**: Service layer query methods
- **Pattern**: Efficient query construction
- **Dependencies**: T-6.1.1
- **Estimated Human Work Hours**: 4-5 hours
- **Description**: Optimize application queries for performance

**Components/Elements**:
- [T-6.1.2:ELE-1] Select Optimization: only fetch needed columns
- [T-6.1.2:ELE-2] Join Optimization: use appropriate join types
- [T-6.1.2:ELE-3] N+1 Prevention: use batch loading for related data
- [T-6.1.2:ELE-4] Pagination: implement cursor-based pagination for large result sets
- [T-6.1.2:ELE-5] Query Caching: cache frequently accessed data

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Audit all database queries in codebase (supports all ELE)
2. Implementation Phase:
   - [IMP-1] Optimize select statements (implements ELE-1)
   - [IMP-2] Optimize joins (implements ELE-2)
   - [IMP-3] Implement batch loading (implements ELE-3)
   - [IMP-4] Add cursor pagination (implements ELE-4)
   - [IMP-5] Implement query caching (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Benchmark query performance (validates all ELE)

### T-6.2.0: Frontend Performance Optimization
- **FR Reference**: FR4.1.1, FR4.2.1
- **Impact Weighting**: User Experience / Perceived Performance
- **Implementation Location**: Frontend components
- **Pattern**: React optimization techniques
- **Dependencies**: T-3.1.0, T-3.2.0
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Optimize frontend rendering and bundle size
- **Testing Tools**: Lighthouse, React DevTools Profiler
- **Test Coverage Requirements**: Lighthouse score >90
- **Completes Component?**: Yes - Optimized frontend performance

**Functional Requirements Acceptance Criteria**:
- Page load <2 seconds on 3G connection
- Time to Interactive <5 seconds
- First Contentful Paint <1.5 seconds
- Bundle size <200KB (gzipped)
- No unnecessary re-renders during progress polling
- Virtualized lists for large datasets

#### T-6.2.1: Component Optimization
- **FR Reference**: All FR4.X
- **Parent Task**: T-6.2.0
- **Implementation Location**: React components
- **Pattern**: Memoization and lazy loading
- **Dependencies**: T-3.1.0, T-3.2.0
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Optimize React component rendering

**Components/Elements**:
- [T-6.2.1:ELE-1] Memoization: use React.memo for expensive components
- [T-6.2.1:ELE-2] Callback Optimization: use useCallback for event handlers
- [T-6.2.1:ELE-3] Effect Optimization: minimize useEffect dependencies
- [T-6.2.1:ELE-4] Lazy Loading: code split large components
- [T-6.2.1:ELE-5] Suspense Boundaries: add loading states for lazy components

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Profile components with React DevTools (identifies optimization targets)
2. Implementation Phase:
   - [IMP-1] Add React.memo to table rows and cards (implements ELE-1)
   - [IMP-2] Wrap callbacks with useCallback (implements ELE-2)
   - [IMP-3] Optimize useEffect dependencies (implements ELE-3)
   - [IMP-4] Implement code splitting (implements ELE-4)
   - [IMP-5] Add Suspense boundaries (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Profile after optimization (validates all ELE)

#### T-6.2.2: Bundle Optimization
- **FR Reference**: All FR4.X
- **Parent Task**: T-6.2.0
- **Implementation Location**: Build configuration
- **Pattern**: Code splitting and tree shaking
- **Dependencies**: None
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Reduce JavaScript bundle size

**Components/Elements**:
- [T-6.2.2:ELE-1] Tree Shaking: ensure proper module exports
- [T-6.2.2:ELE-2] Code Splitting: split by route and feature
- [T-6.2.2:ELE-3] Dynamic Imports: lazy load non-critical components
- [T-6.2.2:ELE-4] Dependency Audit: remove unused dependencies
- [T-6.2.2:ELE-5] Image Optimization: use next/image for optimized images

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Analyze bundle with webpack-bundle-analyzer
2. Implementation Phase:
   - [IMP-1] Configure tree shaking (implements ELE-1)
   - [IMP-2] Implement route-based code splitting (implements ELE-2)
   - [IMP-3] Add dynamic imports (implements ELE-3)
   - [IMP-4] Remove unused dependencies (implements ELE-4)
   - [IMP-5] Optimize images (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Measure bundle size reduction (validates all ELE)

---

## Implementation Timeline

### Phase 1: Foundation (Weeks 1-2)
**Goal:** Database schema, core services, API endpoints

**Week 1:**
- T-1.1.0 through T-1.1.4: Database schema implementation
- T-2.1.1: Claude API client

**Week 2:**
- T-2.1.2 through T-2.1.4: Template resolver, quality validator, persistence service
- T-2.3.1: Single generation endpoint

### Phase 2: Batch Processing (Weeks 3-4)
**Goal:** Batch generation orchestration and API

**Week 3:**
- T-2.2.1: Batch job manager
- T-2.2.2: Cost and time estimator
- T-2.3.2: Batch generation endpoint

**Week 4:**
- T-2.3.3: Status polling endpoint
- T-3.1.1 through T-3.1.2: Batch modal shell and config step

### Phase 3: UI Implementation (Weeks 5-6)
**Goal:** Complete frontend components

**Week 5:**
- T-3.1.3 through T-3.1.5: Batch modal preview, progress, summary
- T-3.2.1 through T-3.2.2: Single generation form and preview

**Week 6:**
- T-3.2.3: Generation execution and results
- T-3.3.0 through T-3.3.3: Regeneration workflow

### Phase 4: Quality & Performance (Weeks 7-8)
**Goal:** Testing, optimization, deployment readiness

**Week 7:**
- T-4.1.1 through T-4.1.2: Unit tests
- T-4.2.1 through T-4.2.2: Integration tests
- T-6.1.1 through T-6.1.2: Database optimization

**Week 8:**
- T-5.1.1 through T-5.1.2: Production configuration and monitoring
- T-5.2.1 through T-5.2.2: Documentation
- T-6.2.1 through T-6.2.2: Frontend optimization
- Final QA and deployment

---

## Resource Requirements

### Engineering Team
- **2 Backend Engineers:** Database, services, API endpoints (80 hours each)
- **2 Frontend Engineers:** React components, state management (80 hours each)
- **1 QA Engineer (Part-time):** Testing, quality assurance (40 hours)
- **1 DevOps Engineer (Part-time):** Deployment, monitoring (20 hours)

**Total Estimated Hours:** 340 hours (~8.5 weeks at 40 hours/week per engineer)

### External Services
- **Anthropic Claude API:** $500-1000 for development and testing
- **Supabase Pro Plan:** $25/month for development, $25-99/month for production
- **Monitoring (Sentry):** Free tier sufficient for development, ~$26/month for production
- **CI/CD (GitHub Actions):** Included with repository

### Infrastructure
- **Development Environment:** Local + Supabase cloud development instance
- **Staging Environment:** Vercel preview + Supabase staging project
- **Production Environment:** Vercel production + Supabase production project

---

## Risk Management

### Technical Risks

**Risk 1: Claude API Rate Limiting**
- **Probability:** Medium
- **Impact:** High
- **Mitigation:** Implement robust rate limiting, queue system, graceful degradation
- **Contingency:** Reduce concurrency, implement request throttling

**Risk 2: Database Performance with Large Datasets**
- **Probability:** Medium
- **Impact:** Medium
- **Mitigation:** Strategic indexing, query optimization, performance testing early
- **Contingency:** Implement caching layer, consider read replicas

**Risk 3: Complex State Management in Batch Progress**
- **Probability:** Low
- **Impact:** Medium
- **Mitigation:** Use proven state management (Zustand), polling strategy
- **Contingency:** Simplify progress tracking, implement WebSockets if polling insufficient

### Schedule Risks

**Risk 4: Integration Delays**
- **Probability:** Medium
- **Impact:** Medium
- **Mitigation:** Clear API contracts, early integration testing
- **Contingency:** Add 1-2 week buffer in timeline

**Risk 5: Scope Creep**
- **Probability:** High
- **Impact:** High
- **Mitigation:** Strict adherence to FR specifications, change control process
- **Contingency:** Defer non-critical features to Phase 2

---

## Acceptance Criteria Summary

### FR4.1.1: Generate All Tiers Workflow
✅ **Completed When:**
- User can click "Generate All" button in dashboard
- Modal displays generation plan with tier breakdown
- Cost and time estimates shown before confirmation
- Batch job creates and processes all conversations sequentially
- Real-time progress updates every 2-5 seconds
- Cancel functionality works without data loss
- Completion summary shows statistics (success/failure/cost)
- All conversations saved to database with correct status

### FR4.1.2: Tier-Specific Batch Generation
✅ **Completed When:**
- User can select specific tier (template, scenario, edge_case)
- Generation processes only selected tier conversations
- Progress tracking shows tier-specific statistics
- Option to regenerate failed conversations works
- Option to fill gaps (missing conversations) works
- Tier completion badge displays accurate counts

### FR4.2.1: Manual Single Generation
✅ **Completed When:**
- "Generate Single" button opens form modal
- Template, persona, emotion dropdowns populated correctly
- Custom parameters section allows key-value input
- Template preview shows resolved prompt with parameters
- Generate button triggers single API call successfully
- Loading state displayed during generation
- Success state shows conversation preview with save option
- Error state displays message with retry button

### FR4.2.2: Regenerate Existing Conversation
✅ **Completed When:**
- Regenerate action available in conversation dropdown
- Modal pre-fills with existing conversation parameters
- User can modify parameters before regenerating
- Original conversation archived with status update
- New conversation created with parentId link
- Version history displayed in conversation detail
- Toast notification confirms successful regeneration

---

## Success Metrics

### Performance Metrics
- **Single Generation Time:** <30 seconds (target: 15-20 seconds)
- **Batch of 100 Conversations:** <60 minutes (target: 40-50 minutes)
- **Database Query Performance:** <100ms for 95th percentile
- **UI Response Time:** <200ms for filtering and sorting

### Quality Metrics
- **Test Coverage:** >85% overall, >90% for critical paths
- **Code Review:** 100% of PRs reviewed by at least one engineer
- **Linter Errors:** Zero errors in production code
- **Accessibility:** WCAG 2.1 AA compliance

### Business Metrics
- **Approval Rate:** >80% of generated conversations approved
- **Generation Success Rate:** >95% (less than 5% failures)
- **User Adoption:** >70% of registered users use generation within 30 days
- **Support Tickets:** <5 tickets per 100 generations

---

## Appendix

### Technology Stack
- **Frontend:** React 18, Next.js 14, TypeScript, Tailwind CSS, Shadcn/UI, Zustand
- **Backend:** Next.js API Routes, Supabase (PostgreSQL), Anthropic Claude API
- **Testing:** Jest, React Testing Library, Supertest
- **Deployment:** Vercel, Supabase Cloud
- **Monitoring:** Sentry, Vercel Analytics

### Key Dependencies
- `@supabase/supabase-js` v2.45.0+
- `@anthropic-ai/sdk` v0.27.0+
- `next` v14.2.0+
- `react` v18.3.0+
- `zustand` v4.5.0+
- `zod` v3.22.0+ (validation)
- `sonner` v1.5.0+ (toast notifications)

### Reference Documents
- Product Overview: `pmc/product/01-train-overview.md`
- Functional Requirements: `pmc/product/03-train-functional-requirements.md`
- User Stories: `pmc/product/02-train-user-stories.md`
- Wireframe Types: `train-wireframe/src/lib/types.ts`
- Database Patterns: `src/lib/database.ts`

---

**Document Version:** 1.0  
**Generated:** 2025-10-28  
**Status:** Ready for Implementation  
**Approval Required:** Product Manager, Engineering Lead, Architecture Review
