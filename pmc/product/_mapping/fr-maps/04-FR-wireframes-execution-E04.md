# Interactive LoRA Conversation Generation - Implementation Execution Instructions (E04)
**Generated**: 2025-01-29  
**Segment**: E04 - Conversation Generation Workflows  
**Total Prompts**: 8  
**Estimated Implementation Time**: 80-100 hours

---

## Executive Summary

This segment implements the core conversation generation workflows for the Interactive LoRA Training Data Generation Platform. This is the critical capability that transforms the platform from a document processing and categorization system into a complete end-to-end training data production pipeline.

**What This Segment Delivers:**
- Complete database schema for conversation generation state management
- Backend services orchestrating Claude API for conversation generation
- Batch generation workflows with progress tracking and error recovery
- Single conversation generation with template-based customization
- Conversation regeneration with version history
- Quality validation and scoring engine
- Frontend UI components for generation workflows
- Real-time progress tracking and cost estimation

**Strategic Importance:**
This segment represents the **highest value feature** of the entire platform - the ability to automatically generate 90-100 high-quality training conversations in hours instead of weeks. Success here means users achieve the core value proposition: 95% time savings while maintaining quality control through human-in-the-loop approval workflows.

---

## Context and Dependencies

### Previous Segment Deliverables

**What Has Been Built (Stages 1 & 2):**
1. **Document Categorization Module (Complete)**
   - Document upload and text extraction
   - Supabase storage integration
   - User authentication system
   - Next.js 14 App Router architecture

2. **Chunk Extraction & Dimension Generation (Complete)**
   - AI-powered semantic chunking from documents
   - 60-dimensional classification system
   - Database: `documents`, `chunks`, `chunk_dimensions`, `chunk_runs`, `prompt_templates`, `api_response_logs`
   - Services: `chunkService`, `chunkDimensionService`, `apiResponseLogService`
   - API endpoints: `/api/chunks/*`
   - Claude API integration with rate limiting and retry logic (existing patterns to leverage)

**What This Segment Builds Upon:**
- Existing Claude API integration patterns (`src/lib/ai-config.ts`, existing API routes)
- Existing database service patterns (`src/lib/database.ts`)
- Existing API response logging infrastructure (`src/lib/api-response-log-service.ts`)
- Wireframe UI components and types (`train-wireframe/src/lib/types.ts`)
- Shadcn/UI component library already integrated

### Current Codebase State

**Existing Infrastructure We'll Leverage:**

1. **Database Service Layer** (`src/lib/database.ts`):
   - Pattern: Supabase client with typed queries
   - CRUD operations: `getAll()`, `getById()`, `create()`, `update()`
   - Error handling: try/catch with error throwing
   - Transaction pattern: multi-step operations with cleanup on failure

2. **AI Configuration** (`src/lib/ai-config.ts`):
   - Model: `claude-sonnet-4-5-20250929`
   - Max tokens: 4096
   - Temperature: 0.7
   - API key management (environment variable)

3. **API Response Logging** (existing service):
   - Logs all Claude API interactions
   - Captures request/response payloads, cost, tokens, duration
   - Already integrated in chunk generation routes

4. **Wireframe Components** (`train-wireframe/src`):
   - Type definitions: Complete data models for conversations, templates, scenarios, batch jobs
   - UI components: `BatchGenerationModal.tsx`, `SingleGenerationForm.tsx`, `ConversationTable.tsx`
   - State management: Zustand store patterns (`useAppStore.ts`)
   - Shadcn/UI library: All necessary UI primitives available

### Cross-Segment Dependencies

**Integration Points:**
1. **Chunks-Alpha Module**: Conversations will link to source chunks via `parentId` field
2. **Document Categorization**: Conversations inherit document categories for filtering
3. **Authentication**: User attribution for all generation and review actions
4. **Storage**: Export functionality will use existing Supabase storage patterns

**External Dependencies:**
- Anthropic Claude API (requires `ANTHROPIC_API_KEY` environment variable)
- Supabase PostgreSQL (existing connection configured)
- Next.js 14 App Router (existing architecture)

---

## Implementation Strategy

### Risk Assessment

**High-Risk Tasks and Mitigation:**

1. **Risk: Claude API Rate Limiting Causing Batch Failures**
   - **Impact**: High - Could prevent batch generation from completing
   - **Probability**: Medium - Will occur with default settings
   - **Mitigation**: 
     - Implement queue-based processing with configurable rate limits (50 req/min default)
     - Exponential backoff retry logic (1s, 2s, 4s, 8s, 16s max)
     - Granular error handling (conversation-level, not batch-level)
     - Pause/resume capability to recover from rate limit exhaustion

2. **Risk: Database Transaction Failures with Partial State**
   - **Impact**: High - Could leave orphaned data or incomplete conversations
   - **Probability**: Low - But critical when it occurs
   - **Mitigation**:
     - Use database transaction pattern (BEGIN/COMMIT/ROLLBACK) for multi-table inserts
     - Save conversation and turns in single transaction
     - Implement cleanup logic to detect and fix orphaned records
     - Comprehensive error logging for debugging

3. **Risk: Real-Time Progress Tracking Performance Issues**
   - **Impact**: Medium - Slow UI updates frustrate users
   - **Probability**: Medium - Polling overhead can accumulate
   - **Mitigation**:
     - Implement efficient polling (2-5 second intervals)
     - Use indexed status fields for fast queries
     - Cache progress state in memory during generation
     - Consider WebSocket upgrade path if needed (future)

4. **Risk: Quality Validation Producing Inconsistent Scores**
   - **Impact**: Medium - Low confidence in quality metrics
   - **Probability**: Medium - Quality scoring is subjective
   - **Mitigation**:
     - Define clear, measurable scoring criteria (turn count, length, structure)
     - Use weighted composite scoring with documented formulas
     - Include manual override capability
     - Track score distribution for calibration

5. **Risk: Template Parameter Injection Failures**
   - **Impact**: Medium - Invalid prompts sent to Claude
   - **Probability**: Low - But prevents generation when it occurs
   - **Mitigation**:
     - Validate all required parameters before API call
     - Provide clear error messages for missing parameters
     - Include parameter preview in single generation form
     - Default values for optional parameters

### Prompt Sequencing Logic

**Why This Sequence Optimizes Implementation:**

1. **Prompt 1: Database Foundation (T-1.1.0)**
   - **Why First**: All other tasks depend on database schema
   - **Dependencies**: None
   - **Enables**: All subsequent backend and frontend work
   - **Risk Level**: Low - Straightforward SQL DDL

2. **Prompt 2: Backend Services - Claude API & Template Engine (T-2.1.0)**
   - **Why Second**: Core business logic needed before API endpoints
   - **Dependencies**: Database schema
   - **Enables**: API endpoint implementation
   - **Risk Level**: High - Complex integration with external API

3. **Prompt 3: Batch Generation Service (T-2.2.0)**
   - **Why Third**: Builds on single generation patterns
   - **Dependencies**: Claude API client, template resolver
   - **Enables**: Batch API endpoints and UI
   - **Risk Level**: High - Complex orchestration logic

4. **Prompt 4: API Endpoints (T-2.3.0)**
   - **Why Fourth**: Exposes backend services to frontend
   - **Dependencies**: Backend services
   - **Enables**: Frontend UI integration
   - **Risk Level**: Medium - Standard REST API patterns

5. **Prompt 5: Frontend - Batch Generation Modal (T-3.1.0)**
   - **Why Fifth**: Most complex UI component
   - **Dependencies**: Batch API endpoints
   - **Enables**: Core user workflow
   - **Risk Level**: Medium - Complex state management

6. **Prompt 6: Frontend - Single Generation Form (T-3.2.0)**
   - **Why Sixth**: Simpler than batch modal
   - **Dependencies**: Single generation API endpoint
   - **Enables**: Single generation workflow
   - **Risk Level**: Low - Straightforward form implementation

7. **Prompt 7: Frontend - Regeneration Workflow (T-3.3.0)**
   - **Why Seventh**: Extends single generation
   - **Dependencies**: Single generation form
   - **Enables**: Quality improvement iteration
   - **Risk Level**: Low - Reuses existing components

8. **Prompt 8: Quality Assurance & Testing (T-4.1.0)**
   - **Why Last**: Validates all previous work
   - **Dependencies**: All previous prompts
   - **Enables**: Production deployment confidence
   - **Risk Level**: Medium - Comprehensive coverage required

**Logical Grouping Rationale:**
- Database → Services → APIs → UI (standard layered architecture)
- Backend complete before frontend starts (reduces integration issues)
- Complex features before simple features (establishes patterns early)
- Testing last to validate end-to-end workflows

### Quality Assurance Approach

**Multi-Level Validation Strategy:**

1. **Database Level**:
   - Schema validation: All tables, indexes, constraints created correctly
   - Data integrity: Foreign keys, unique constraints enforced
   - Performance validation: Queries complete in <100ms for 10K records

2. **Service Level**:
   - Unit tests: All service methods with mocked dependencies (85%+ coverage target)
   - Integration tests: Services with real database (test containers)
   - Error handling tests: All error paths covered

3. **API Level**:
   - Endpoint tests: All routes with valid/invalid requests
   - Authentication tests: Proper user isolation
   - Rate limiting tests: Verify throttling behavior

4. **UI Level**:
   - Component tests: All UI components with React Testing Library (75%+ coverage target)
   - User flow tests: Complete generation workflows end-to-end
   - Accessibility tests: Keyboard navigation, screen reader support

5. **End-to-End Level**:
   - Critical path tests: Generate → Review → Approve → Export
   - Error recovery tests: Network failures, API errors, partial batch failures
   - Performance tests: Response times, concurrent users

---

## Database Setup Instructions

### Required SQL Operations

Execute the following SQL statements in Supabase SQL Editor **before starting implementation prompts**. These create the foundational database schema for conversation generation.

========================

```sql
-- ============================================================================
-- Conversation Generation Module - Database Schema
-- Version: 1.0
-- Date: 2025-01-29
-- Description: Creates tables and indexes for conversation generation workflows
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Conversation status lifecycle
CREATE TYPE conversation_status AS ENUM (
  'draft',              -- Initial state, not yet generated
  'generating',         -- Currently being generated by Claude API
  'generated',          -- Successfully generated, pending review
  'pending_review',     -- Flagged for human review (quality < threshold)
  'approved',           -- Reviewed and approved for training
  'rejected',           -- Reviewed and rejected, not for training
  'needs_revision',     -- Requires regeneration with modifications
  'failed',             -- Generation failed (API error, validation failure)
  'archived'            -- Old version, replaced by regeneration
);

-- Tier classification for three-tier architecture
CREATE TYPE tier_type AS ENUM (
  'template',           -- Tier 1: Emotional arc templates (40 conversations)
  'scenario',           -- Tier 2: Real-world scenarios (35 conversations)
  'edge_case'           -- Tier 3: Boundary conditions (15 conversations)
);

-- Batch job status for orchestration
CREATE TYPE batch_job_status AS ENUM (
  'queued',             -- Job created, waiting to start
  'processing',         -- Job currently running
  'paused',             -- Job paused by user or rate limit
  'completed',          -- Job finished successfully
  'failed',             -- Job failed with unrecoverable error
  'cancelled'           -- Job cancelled by user
);

-- Batch item status for granular tracking
CREATE TYPE batch_item_status AS ENUM (
  'queued',             -- Item waiting to process
  'processing',         -- Item currently being generated
  'completed',          -- Item successfully generated
  'failed'              -- Item failed, may be retried
);

-- ============================================================================
-- MAIN CONVERSATIONS TABLE
-- ============================================================================

CREATE TABLE conversations (
  -- Identity and relationships
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id TEXT UNIQUE NOT NULL,  -- Human-readable ID: fp_[persona]_[###]
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chunk_id UUID REFERENCES chunks(id) ON DELETE SET NULL,
  
  -- Core metadata
  title TEXT NOT NULL,
  persona TEXT NOT NULL,
  emotion TEXT NOT NULL,
  topic TEXT,
  intent TEXT,
  tone TEXT,
  tier tier_type NOT NULL,
  category TEXT[] DEFAULT '{}',  -- Array for multi-category support
  
  -- Status and quality
  status conversation_status NOT NULL DEFAULT 'draft',
  quality_score NUMERIC(3,1) CHECK (quality_score >= 0 AND quality_score <= 10),
  quality_metrics JSONB,  -- Detailed breakdown: relevance, accuracy, naturalness, etc.
  turn_count INTEGER CHECK (turn_count >= 0),
  total_tokens INTEGER CHECK (total_tokens >= 0),
  
  -- Generation tracking
  estimated_cost_usd NUMERIC(10,4),
  actual_cost_usd NUMERIC(10,4),
  generation_duration_ms INTEGER,
  template_id UUID,
  
  -- Review and approval
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  reviewer_notes TEXT,
  review_history JSONB DEFAULT '[]',  -- Array of review actions with timestamps
  
  -- Version control
  parent_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  parent_type TEXT CHECK (parent_type IN ('template', 'scenario', 'conversation')),
  
  -- Flexible storage
  parameters JSONB DEFAULT '{}',  -- Template parameters, custom metadata
  
  -- Error tracking
  error_message TEXT,
  
  -- Audit timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT valid_quality_score CHECK (
    quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 10)
  ),
  CONSTRAINT valid_status_transition CHECK (
    -- Add business logic constraints if needed
    TRUE
  )
);

-- ============================================================================
-- CONVERSATION TURNS TABLE (Normalized)
-- ============================================================================

CREATE TABLE conversation_turns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL CHECK (turn_number >= 1),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  token_count INTEGER CHECK (token_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure sequential turn numbers within a conversation
  UNIQUE (conversation_id, turn_number)
);

-- ============================================================================
-- BATCH JOBS TABLE
-- ============================================================================

CREATE TABLE batch_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status batch_job_status NOT NULL DEFAULT 'queued',
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
  
  -- Progress tracking
  total_items INTEGER NOT NULL CHECK (total_items >= 0),
  completed_items INTEGER NOT NULL DEFAULT 0 CHECK (completed_items >= 0),
  failed_items INTEGER NOT NULL DEFAULT 0 CHECK (failed_items >= 0),
  successful_items INTEGER NOT NULL DEFAULT 0 CHECK (successful_items >= 0),
  
  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_time_remaining INTERVAL,
  
  -- Configuration
  tier tier_type,  -- NULL means all tiers
  shared_parameters JSONB DEFAULT '{}',
  concurrent_processing INTEGER NOT NULL DEFAULT 3 CHECK (concurrent_processing >= 1 AND concurrent_processing <= 10),
  error_handling TEXT NOT NULL DEFAULT 'continue' CHECK (error_handling IN ('continue', 'stop')),
  
  -- Audit
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_item_counts CHECK (
    completed_items + failed_items <= total_items
    AND successful_items <= completed_items
  )
);

-- ============================================================================
-- BATCH ITEMS TABLE (Junction)
-- ============================================================================

CREATE TABLE batch_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_job_id UUID NOT NULL REFERENCES batch_jobs(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  
  position INTEGER NOT NULL CHECK (position >= 1),  -- Order within batch
  topic TEXT NOT NULL,
  tier tier_type NOT NULL,
  parameters JSONB DEFAULT '{}',
  
  status batch_item_status NOT NULL DEFAULT 'queued',
  progress NUMERIC(5,2) CHECK (progress >= 0 AND progress <= 100),  -- Percentage
  estimated_time INTERVAL,
  error_message TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure unique position within batch
  UNIQUE (batch_job_id, position)
);

-- ============================================================================
-- GENERATION LOGS TABLE (API Audit Trail)
-- ============================================================================

CREATE TABLE generation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  run_id UUID,  -- Correlation ID for related API calls
  template_id UUID,
  
  -- API interaction details
  request_payload JSONB NOT NULL,
  response_payload JSONB,
  parameters JSONB DEFAULT '{}',
  
  -- Cost and performance
  cost_usd NUMERIC(10,4),
  input_tokens INTEGER CHECK (input_tokens >= 0),
  output_tokens INTEGER CHECK (output_tokens >= 0),
  duration_ms INTEGER CHECK (duration_ms >= 0),
  
  -- Error tracking
  error_message TEXT,
  error_code TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ============================================================================
-- INDEXES for Query Performance
-- ============================================================================

-- Conversations table indexes
CREATE INDEX idx_conversations_status ON conversations(status) WHERE status != 'archived';
CREATE INDEX idx_conversations_tier ON conversations(tier);
CREATE INDEX idx_conversations_quality_score ON conversations(quality_score) WHERE quality_score IS NOT NULL;
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX idx_conversations_document_id ON conversations(document_id);
CREATE INDEX idx_conversations_chunk_id ON conversations(chunk_id);
CREATE INDEX idx_conversations_parent_id ON conversations(parent_id) WHERE parent_id IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX idx_conversations_status_tier ON conversations(status, tier);
CREATE INDEX idx_conversations_status_quality ON conversations(status, quality_score);
CREATE INDEX idx_conversations_tier_status_created ON conversations(tier, status, created_at DESC);

-- GIN index for JSONB fields
CREATE INDEX idx_conversations_parameters ON conversations USING GIN(parameters);
CREATE INDEX idx_conversations_quality_metrics ON conversations USING GIN(quality_metrics);
CREATE INDEX idx_conversations_category ON conversations USING GIN(category);

-- Partial index for review queue (performance optimization)
CREATE INDEX idx_conversations_pending_review ON conversations(quality_score, created_at) 
  WHERE status = 'pending_review';

-- Conversation turns indexes
CREATE INDEX idx_conversation_turns_conversation_id ON conversation_turns(conversation_id);
CREATE INDEX idx_conversation_turns_turn_number ON conversation_turns(conversation_id, turn_number);

-- Batch jobs indexes
CREATE INDEX idx_batch_jobs_status ON batch_jobs(status) WHERE status IN ('queued', 'processing', 'paused');
CREATE INDEX idx_batch_jobs_created_by ON batch_jobs(created_by);
CREATE INDEX idx_batch_jobs_created_at ON batch_jobs(created_at DESC);
CREATE INDEX idx_batch_jobs_priority_status ON batch_jobs(priority DESC, status);

-- Batch items indexes
CREATE INDEX idx_batch_items_batch_job_id ON batch_items(batch_job_id);
CREATE INDEX idx_batch_items_status ON batch_items(batch_job_id, status);
CREATE INDEX idx_batch_items_position ON batch_items(batch_job_id, position);
CREATE INDEX idx_batch_items_conversation_id ON batch_items(conversation_id) WHERE conversation_id IS NOT NULL;

-- Generation logs indexes
CREATE INDEX idx_generation_logs_conversation_id ON generation_logs(conversation_id);
CREATE INDEX idx_generation_logs_run_id ON generation_logs(run_id) WHERE run_id IS NOT NULL;
CREATE INDEX idx_generation_logs_created_at ON generation_logs(created_at DESC);
CREATE INDEX idx_generation_logs_cost ON generation_logs(cost_usd) WHERE cost_usd IS NOT NULL;

-- ============================================================================
-- TRIGGERS for Automatic Updates
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batch_jobs_updated_at BEFORE UPDATE ON batch_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batch_items_updated_at BEFORE UPDATE ON batch_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;

-- Conversations: Users can only access their own conversations
CREATE POLICY conversations_user_isolation ON conversations
  FOR ALL
  USING (created_by = auth.uid() OR approved_by = auth.uid());

-- Conversation turns: Access follows conversations table policy
CREATE POLICY conversation_turns_user_isolation ON conversation_turns
  FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE created_by = auth.uid() OR approved_by = auth.uid()
    )
  );

-- Batch jobs: Users can only access their own jobs
CREATE POLICY batch_jobs_user_isolation ON batch_jobs
  FOR ALL
  USING (created_by = auth.uid());

-- Batch items: Access follows batch_jobs table policy
CREATE POLICY batch_items_user_isolation ON batch_items
  FOR ALL
  USING (
    batch_job_id IN (
      SELECT id FROM batch_jobs WHERE created_by = auth.uid()
    )
  );

-- Generation logs: Users can access logs for their conversations
CREATE POLICY generation_logs_user_isolation ON generation_logs
  FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE created_by = auth.uid()
    )
    OR created_by = auth.uid()
  );

-- ============================================================================
-- FUNCTIONS for Business Logic
-- ============================================================================

-- Function to calculate batch job progress
CREATE OR REPLACE FUNCTION calculate_batch_progress(job_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  total INTEGER;
  completed INTEGER;
BEGIN
  SELECT total_items, completed_items INTO total, completed
  FROM batch_jobs WHERE id = job_id;
  
  IF total = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((completed::NUMERIC / total::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to estimate batch time remaining
CREATE OR REPLACE FUNCTION estimate_time_remaining(job_id UUID)
RETURNS INTERVAL AS $$
DECLARE
  total INTEGER;
  completed INTEGER;
  elapsed INTERVAL;
  avg_time_per_item INTERVAL;
  items_remaining INTEGER;
BEGIN
  SELECT 
    total_items, 
    completed_items,
    NOW() - started_at
  INTO total, completed, elapsed
  FROM batch_jobs 
  WHERE id = job_id;
  
  IF completed = 0 OR total = 0 THEN
    RETURN INTERVAL '0';
  END IF;
  
  avg_time_per_item := elapsed / completed;
  items_remaining := total - completed;
  
  RETURN avg_time_per_item * items_remaining;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VALIDATION QUERIES (Run After Creation)
-- ============================================================================

-- Verify all tables created
SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
  AND tablename IN ('conversations', 'conversation_turns', 'batch_jobs', 'batch_items', 'generation_logs')
ORDER BY tablename;

-- Verify all indexes created
SELECT indexname FROM pg_indexes WHERE schemaname = 'public'
  AND tablename IN ('conversations', 'conversation_turns', 'batch_jobs', 'batch_items', 'generation_logs')
ORDER BY indexname;

-- Verify RLS enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'
  AND tablename IN ('conversations', 'conversation_turns', 'batch_jobs', 'batch_items', 'generation_logs');

-- Test ENUM types
SELECT enum_range(NULL::conversation_status);
SELECT enum_range(NULL::tier_type);
SELECT enum_range(NULL::batch_job_status);
SELECT enum_range(NULL::batch_item_status);

-- ============================================================================
-- SEED DATA (Optional - for Development/Testing)
-- ============================================================================

-- Insert sample conversation templates for testing
-- (Add seed data as needed for development)

```

++++++++++++++++++

**Post-Execution Validation:**

After running the SQL script, verify:

1. **Tables Created**: 
   - ✓ `conversations` (17 columns)
   - ✓ `conversation_turns` (6 columns)
   - ✓ `batch_jobs` (16 columns)
   - ✓ `batch_items` (11 columns)
   - ✓ `generation_logs` (13 columns)

2. **Indexes Created**: 
   - ✓ At least 25 indexes across all tables
   - ✓ GIN indexes on JSONB fields
   - ✓ Partial indexes for performance

3. **RLS Enabled**: 
   - ✓ All 5 tables have RLS enabled
   - ✓ Policies created for user isolation

4. **Functions Available**:
   - ✓ `calculate_batch_progress(UUID)`
   - ✓ `estimate_time_remaining(UUID)`

**Common Issues & Fixes:**

- **Issue**: `uuid-ossp extension does not exist`
  - **Fix**: Run `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` as superuser

- **Issue**: Foreign key constraint fails (references `auth.users`)
  - **Fix**: Ensure Supabase Auth is properly configured and `auth.users` table exists

- **Issue**: RLS policy prevents access
  - **Fix**: Temporarily disable RLS for testing: `ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;`

---

## Implementation Prompts

### Prompt 1: Database Foundation & Conversation Services

**Scope**: Implement complete database service layer for conversations, batch jobs, and generation logging  
**Dependencies**: Database schema must be created (see SQL script above)  
**Estimated Time**: 12-16 hours  
**Risk Level**: Low

========================

You are a senior backend developer implementing the database service layer for the Interactive LoRA Conversation Generation platform. This is the foundational data access layer that all other services will depend on.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
This platform generates 90-100 high-quality training conversations for LoRA fine-tuning, automating a previously manual weeks-long process into hours. This service layer provides the data access foundation for conversation generation, batch orchestration, and audit logging.

**Functional Requirements Being Implemented:**
- FR1.1.1: Conversations Table Structure with normalized schema
- FR1.1.2: Flexible metadata storage with JSONB
- FR1.2.1: Generation audit logging for compliance
- Database operations must support high-concurrency batch generation
- All queries must complete in <100ms for datasets up to 10K records

**Technical Architecture:**
- **Framework**: Next.js 14 App Router, TypeScript strict mode
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Pattern**: Service layer with typed interfaces, following existing patterns in `src/lib/database.ts`
- **Error Handling**: Try/catch with detailed error messages, throw errors for caller to handle
- **Type Safety**: All operations typed using definitions from `train-wireframe/src/lib/types.ts`

**CURRENT CODEBASE STATE:**

**Existing Patterns to Follow** (`src/lib/database.ts`):
```typescript
// Pattern 1: Service object with methods
export const documentService = {
  async getAll() {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  async create(document: Partial<Document>) {
    const { data, error } = await supabase
      .from('documents')
      .insert(document)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
```

**Type Definitions to Use** (`train-wireframe/src/lib/types.ts`):
```typescript
export type Conversation = {
  id: string;
  title: string;
  persona: string;
  emotion: string;
  tier: TierType;
  category: string[];
  status: ConversationStatus;
  qualityScore: number;
  qualityMetrics?: QualityMetrics;
  turns: ConversationTurn[];
  totalTurns: number;
  totalTokens: number;
  parentId?: string;
  parentType?: 'template' | 'scenario';
  parameters: Record<string, any>;
  reviewHistory: ReviewAction[];
  // ... (full definition in types.ts)
};

export type BatchJob = {
  id: string;
  name: string;
  status: 'queued' | 'processing' | 'paused' | 'completed' | 'failed' | 'cancelled';
  totalItems: number;
  completedItems: number;
  // ... (full definition)
};
```

**IMPLEMENTATION TASKS:**

Create new file: `src/lib/services/conversation-service.ts`

**Task 1: Conversation Service (CRUD Operations)**

Implement `conversationService` with these methods:

1. **`create(conversation: Partial<Conversation>, turns: ConversationTurn[]): Promise<Conversation>`**
   - Insert conversation record in `conversations` table
   - Insert all turns in `conversation_turns` table in single transaction
   - Use database transaction pattern to ensure atomicity
   - Calculate `turn_count` and `total_tokens` from turns array
   - Return complete conversation with embedded turns

2. **`getById(id: string): Promise<Conversation>`**
   - Fetch conversation by id with all related turns
   - Join `conversation_turns` table and sort by `turn_number`
   - Embed turns array in conversation object
   - Throw error if conversation not found

3. **`getAll(filters?: FilterConfig): Promise<Conversation[]>`**
   - Support filtering by: tier, status, quality score range, date range, search query
   - Apply filters using Supabase query builder chaining
   - Include pagination support (limit, offset)
   - Order by `created_at DESC` by default
   - Include turn count but not full turns (performance optimization)

4. **`update(id: string, updates: Partial<Conversation>): Promise<Conversation>`**
   - Update conversation metadata (status, quality_score, reviewer_notes, etc.)
   - Do NOT allow updating turns (separate method for that)
   - Update `updated_at` timestamp automatically (trigger handles this)
   - Return updated conversation

5. **`delete(id: string): Promise<void>`**
   - Delete conversation (cascade will delete turns automatically)
   - Soft delete by setting status to 'archived' (preferred)
   - Hard delete only if explicitly requested

6. **`searchConversations(query: string): Promise<Conversation[]>`**
   - Full-text search across title, persona, emotion, topic fields
   - Use ILIKE for case-insensitive matching
   - Limit results to 50 for performance

7. **`getConversationsByStatus(status: ConversationStatus): Promise<Conversation[]>`**
   - Optimized query using indexed status field
   - Use for review queue (status = 'pending_review')

8. **`updateStatus(id: string, status: ConversationStatus, reviewAction?: ReviewAction): Promise<Conversation>`**
   - Update conversation status
   - If reviewAction provided, append to `review_history` array
   - Update `approved_by` and `approved_at` if status is 'approved'

**Task 2: Batch Job Service**

Implement `batchJobService` with these methods:

1. **`createJob(job: Partial<BatchJob>, items: BatchItem[]): Promise<BatchJob>`**
   - Insert batch job record
   - Insert all batch items
   - Return job with embedded items

2. **`getJobById(id: string): Promise<BatchJob>`**
   - Fetch job with all items
   - Include progress calculations

3. **`updateJobStatus(id: string, status: BatchJobStatus): Promise<BatchJob>`**
   - Update job status
   - Update `started_at` if changing to 'processing'
   - Update `completed_at` if changing to 'completed' or 'failed'

4. **`incrementProgress(jobId: string, itemId: string, status: 'completed' | 'failed'): Promise<void>`**
   - Update batch item status
   - Increment job `completed_items` or `failed_items` counter
   - Calculate and update `estimated_time_remaining`

5. **`getActiveJobs(userId: string): Promise<BatchJob[]>`**
   - Fetch jobs with status 'queued' or 'processing'
   - Filter by created_by = userId
   - Order by priority DESC, created_at ASC

**Task 3: Generation Logging Service**

Implement `generationLogService` with these methods:

1. **`logGeneration(params: GenerationLogParams): Promise<void>`**
   - Insert log entry with full request/response payloads
   - Calculate cost based on token counts
   - Link to conversation_id for traceability

2. **`getLogsByConversation(conversationId: string): Promise<GenerationLog[]>`**
   - Fetch all logs for a conversation
   - Order by created_at DESC

3. **`getLogsByDateRange(from: string, to: string): Promise<GenerationLog[]>`**
   - Fetch logs within date range for cost analysis

4. **`calculateTotalCost(filters?: {dateRange?: [string, string], userId?: string}): Promise<number>`**
   - Sum `cost_usd` across filtered logs
   - Used for cost tracking and budgeting

**ACCEPTANCE CRITERIA:**

1. All service methods handle errors gracefully and throw descriptive error messages
2. Conversation service correctly manages transaction for conversation + turns creation
3. Batch job service efficiently updates progress without race conditions
4. All queries use appropriate indexes (verify with EXPLAIN ANALYZE)
5. Type safety: All methods properly typed with Conversation, BatchJob types
6. Services exported from `src/lib/services/index.ts` for easy importing

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
src/lib/services/
  ├── conversation-service.ts      (conversationService)
  ├── batch-job-service.ts         (batchJobService)
  ├── generation-log-service.ts    (generationLogService)
  └── index.ts                     (export all services)
```

**Import Pattern:**
```typescript
import { supabase } from '../supabase';
import type { Conversation, BatchJob, FilterConfig } from '../../../train-wireframe/src/lib/types';
```

**Transaction Pattern for Conversation Creation:**
```typescript
async create(conversation: Partial<Conversation>, turns: ConversationTurn[]): Promise<Conversation> {
  try {
    // Step 1: Insert conversation
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .insert({
        ...conversation,
        turn_count: turns.length,
        total_tokens: turns.reduce((sum, turn) => sum + turn.tokenCount, 0)
      })
      .select()
      .single();
    
    if (convError) throw convError;
    
    // Step 2: Insert turns
    const turnRecords = turns.map((turn, index) => ({
      conversation_id: convData.id,
      turn_number: index + 1,
      role: turn.role,
      content: turn.content,
      token_count: turn.tokenCount
    }));
    
    const { error: turnsError } = await supabase
      .from('conversation_turns')
      .insert(turnRecords);
    
    if (turnsError) {
      // Rollback: delete conversation if turns insertion fails
      await supabase.from('conversations').delete().eq('id', convData.id);
      throw turnsError;
    }
    
    // Return conversation with turns embedded
    return { ...convData, turns };
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}
```

**Filter Query Pattern:**
```typescript
async getAll(filters?: FilterConfig): Promise<Conversation[]> {
  let query = supabase
    .from('conversations')
    .select('*, conversation_turns(count)');  // Include turn count, not full turns
  
  if (filters?.tier) {
    query = query.in('tier', filters.tier);
  }
  
  if (filters?.status) {
    query = query.in('status', filters.status);
  }
  
  if (filters?.qualityScoreMin !== undefined) {
    query = query.gte('quality_score', filters.qualityScoreMin);
  }
  
  if (filters?.qualityScoreMax !== undefined) {
    query = query.lte('quality_score', filters.qualityScoreMax);
  }
  
  if (filters?.searchQuery) {
    query = query.or(`title.ilike.%${filters.searchQuery}%,persona.ilike.%${filters.searchQuery}%`);
  }
  
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}
```

**VALIDATION REQUIREMENTS:**

1. **Unit Test Creation** (create `src/lib/services/__tests__/conversation-service.test.ts`):
   ```typescript
   describe('conversationService', () => {
     it('should create conversation with turns in transaction', async () => {
       const conversation = { /* test data */ };
       const turns = [/* test turns */];
       const result = await conversationService.create(conversation, turns);
       expect(result.id).toBeDefined();
       expect(result.turns).toHaveLength(turns.length);
     });
     
     it('should rollback conversation if turns insertion fails', async () => {
       // Mock turns insertion failure
       // Verify conversation not created
     });
   });
   ```

2. **Manual Testing Checklist**:
   - [ ] Create conversation with 10 turns - verify all turns saved
   - [ ] Fetch conversation by ID - verify turns properly embedded
   - [ ] Filter conversations by tier and status - verify correct results
   - [ ] Update conversation status - verify review_history appended
   - [ ] Delete conversation - verify cascade deletes turns
   - [ ] Search conversations - verify ILIKE works case-insensitively
   - [ ] Create batch job with 20 items - verify all items inserted
   - [ ] Update batch progress - verify counters increment correctly
   - [ ] Log generation - verify cost calculated correctly

**DELIVERABLES:**

1. `src/lib/services/conversation-service.ts` - Complete CRUD operations
2. `src/lib/services/batch-job-service.ts` - Batch orchestration data access
3. `src/lib/services/generation-log-service.ts` - Audit logging
4. `src/lib/services/index.ts` - Barrel export file
5. `src/lib/services/__tests__/conversation-service.test.ts` - Unit tests (optional but recommended)

Implement this service layer completely, ensuring all operations are properly typed, error-handled, and performant. This is the foundation for all conversation generation workflows.

++++++++++++++++++

---

### Prompt 2: Backend Services - Claude API Client & Template Engine

**Scope**: Implement Claude API integration with rate limiting, retry logic, and template parameter injection  
**Dependencies**: Prompt 1 (database services), existing AI config  
**Estimated Time**: 16-20 hours  
**Risk Level**: High

========================

You are a senior backend developer implementing the core AI generation services for the Interactive LoRA Conversation Generation platform. This is the critical integration layer that orchestrates Claude API calls for conversation generation.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
This platform uses Claude API to generate synthetic training conversations based on templates and parameters. Your services will handle API integration, rate limiting, retry logic, template parameter injection, response parsing, and quality validation.

**Functional Requirements Being Implemented:**
- FR2.1.1: Automatic rate limiting respecting Claude API constraints (50 req/min default)
- FR2.1.2: Retry strategy with exponential backoff (1s, 2s, 4s, 8s, 16s max, 3 attempts)
- FR2.2.1: Template storage with version control and parameter injection
- FR2.2.2: Automatic parameter injection replacing {{placeholders}} with metadata
- FR2.3.1: Automated quality scoring based on structural criteria

**Technical Architecture:**
- **API**: Anthropic Claude API (`claude-sonnet-4-5-20250929`)
- **Rate Limiting**: Sliding window algorithm, configurable limit
- **Error Handling**: Categorized errors (retryable vs non-retryable), granular logging
- **Quality Validation**: Rule-based scoring (turn count, length, structure)

**CURRENT CODEBASE STATE:**

**Existing AI Configuration** (`src/lib/ai-config.ts`):
```typescript
export const AI_CONFIG = {
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  baseUrl: 'https://api.anthropic.com/v1',
  model: 'claude-sonnet-4-5-20250929',
  maxTokens: 4096,
  temperature: 0.7,
};
```

**Existing API Pattern** (`src/app/api/chunks/generate-dimensions/route.ts`):
```typescript
// Pattern for Claude API integration (chunk generation)
const response = await fetch(`${AI_CONFIG.baseUrl}/messages`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': AI_CONFIG.apiKey,
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: AI_CONFIG.model,
    max_tokens: AI_CONFIG.maxTokens,
    temperature: AI_CONFIG.temperature,
    messages: [{ role: 'user', content: prompt }]
  })
});
```

**Type Definitions** (`train-wireframe/src/lib/types.ts`):
```typescript
export type Template = {
  id: string;
  name: string;
  structure: string; // Template text with {{placeholders}}
  variables: TemplateVariable[];
  tier: TierType;
  // ...
};

export type TemplateVariable = {
  name: string;
  type: 'text' | 'number' | 'dropdown';
  defaultValue: string;
  helpText?: string;
  options?: string[];
};

export type QualityMetrics = {
  overall: number;
  relevance: number;
  accuracy: number;
  naturalness: number;
  methodology: number;
  coherence: number;
  confidence: 'high' | 'medium' | 'low';
  uniqueness: number;
  trainingValue: 'high' | 'medium' | 'low';
};
```

**IMPLEMENTATION TASKS:**

**Task 1: Claude API Client with Rate Limiting**

Create file: `src/lib/services/claude-api-client.ts`

Implement `ClaudeAPIClient` class with these methods:

1. **`generateConversation(prompt: string, config?: GenerationConfig): Promise<ConversationResponse>`**
   - Call Claude API with prompt
   - Apply rate limiting using sliding window
   - Implement retry logic with exponential backoff
   - Parse JSON response from Claude
   - Calculate cost based on token usage
   - Log full request/response via `generationLogService`
   - Return structured conversation object

2. **Rate Limiter Implementation** (private method):
   ```typescript
   private rateLimiter = {
     requests: [] as number[],
     maxRequests: 50, // per minute
     windowMs: 60000, // 1 minute
     
     async checkLimit(): Promise<void> {
       const now = Date.now();
       // Remove requests outside time window
       this.requests = this.requests.filter(time => now - time < this.windowMs);
       
       if (this.requests.length >= this.maxRequests) {
         const oldestRequest = this.requests[0];
         const waitTime = this.windowMs - (now - oldestRequest);
         console.log(`Rate limit reached. Waiting ${waitTime}ms...`);
         await this.sleep(waitTime);
       }
       
       this.requests.push(now);
     }
   };
   ```

3. **Retry Logic** (private method):
   ```typescript
   private async retryWithBackoff<T>(
     fn: () => Promise<T>,
     maxAttempts: number = 3
   ): Promise<T> {
     let lastError: Error;
     
     for (let attempt = 1; attempt <= maxAttempts; attempt++) {
       try {
         return await fn();
       } catch (error: any) {
         lastError = error;
         
         // Don't retry non-retryable errors
         if (!this.isRetryableError(error)) {
           throw error;
         }
         
         if (attempt < maxAttempts) {
           const backoffMs = Math.min(
             1000 * Math.pow(2, attempt - 1) + Math.random() * 1000,
             16000
           );
           console.log(`Attempt ${attempt} failed. Retrying in ${backoffMs}ms...`);
           await this.sleep(backoffMs);
         }
       }
     }
     
     throw lastError!;
   }
   
   private isRetryableError(error: any): boolean {
     const retryableStatuses = [429, 500, 502, 503, 504];
     return retryableStatuses.includes(error.status);
   }
   ```

4. **Error Categorization**:
   ```typescript
   export class APIError extends Error {
     constructor(
       message: string,
       public status: number,
       public code: string,
       public retryable: boolean
     ) {
       super(message);
     }
   }
   
   // Usage:
   if (response.status === 429) {
     throw new APIError('Rate limit exceeded', 429, 'rate_limit', true);
   }
   if (response.status === 400) {
     throw new APIError('Invalid request', 400, 'invalid_request', false);
   }
   ```

**Task 2: Template Resolution Engine**

Create file: `src/lib/services/template-resolver.ts`

Implement `TemplateResolver` class:

1. **`resolveTemplate(template: Template, parameters: Record<string, any>): Promise<string>`**
   - Parse template structure for {{placeholders}}
   - Replace placeholders with parameter values
   - Validate all required variables are provided
   - Handle conditional logic: `{{variable ? 'text' : 'alternative'}}`
   - Sanitize user input to prevent injection attacks
   - Return resolved prompt text

2. **Parameter Injection** (private method):
   ```typescript
   private injectParameters(template: string, params: Record<string, any>): string {
     // Regex to find {{placeholder}} patterns
     return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
       if (params[key] !== undefined) {
         return this.sanitize(params[key]);
       }
       throw new Error(`Missing required parameter: ${key}`);
     });
   }
   
   private sanitize(value: any): string {
     // Escape HTML/script tags
     return String(value)
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&#x27;');
   }
   ```

3. **Variable Validation** (private method):
   ```typescript
   private validateVariables(
     template: Template,
     params: Record<string, any>
   ): void {
     const requiredVars = template.variables.filter(v => !v.defaultValue);
     
     for (const variable of requiredVars) {
       if (params[variable.name] === undefined) {
         throw new Error(
           `Missing required parameter: ${variable.name}. ${variable.helpText || ''}`
         );
       }
     }
   }
   ```

4. **Conditional Logic Support**:
   ```typescript
   private resolveConditionals(template: string, params: Record<string, any>): string {
     // Support {{var ? 'text if true' : 'text if false'}}
     return template.replace(
       /\{\{(\w+)\s*\?\s*'([^']+)'\s*:\s*'([^']+)'\}\}/g,
       (match, key, ifTrue, ifFalse) => {
         return params[key] ? ifTrue : ifFalse;
       }
     );
   }
   ```

**Task 3: Quality Validation Engine**

Create file: `src/lib/services/quality-validator.ts`

Implement `QualityValidator` class:

1. **`validateConversation(conversation: any): QualityMetrics`**
   - Calculate turn count score (8-16 turns optimal)
   - Calculate response length score (appropriate for context)
   - Validate JSON structure
   - Calculate composite quality score (0-10)
   - Determine confidence level (high/medium/low)
   - Return detailed quality metrics

2. **Turn Count Validation**:
   ```typescript
   private calculateTurnCountScore(turnCount: number): number {
     if (turnCount >= 8 && turnCount <= 16) {
       return 10; // Optimal
     } else if (turnCount >= 6 && turnCount <= 20) {
       return 7; // Acceptable
     } else if (turnCount >= 4 && turnCount <= 24) {
       return 5; // Below threshold
     } else {
       return 3; // Poor
     }
   }
   ```

3. **Length Validation**:
   ```typescript
   private calculateLengthScore(turns: ConversationTurn[]): number {
     const avgLength = turns.reduce((sum, t) => sum + t.content.length, 0) / turns.length;
     
     // Optimal range: 100-500 characters per turn
     if (avgLength >= 100 && avgLength <= 500) {
       return 10;
     } else if (avgLength >= 50 && avgLength <= 800) {
       return 7;
     } else {
       return 4;
     }
   }
   ```

4. **Structure Validation**:
   ```typescript
   private validateStructure(conversation: any): number {
     try {
       // Verify required fields
       if (!conversation.turns || !Array.isArray(conversation.turns)) {
         return 0;
       }
       
       // Verify alternating roles
       for (let i = 0; i < conversation.turns.length; i++) {
         const expectedRole = i % 2 === 0 ? 'user' : 'assistant';
         if (conversation.turns[i].role !== expectedRole) {
           return 5; // Structure issue
         }
       }
       
       return 10;
     } catch (error) {
       return 0;
     }
   }
   ```

5. **Composite Score Calculation**:
   ```typescript
   private calculateCompositeScore(
     turnCountScore: number,
     lengthScore: number,
     structureScore: number
   ): number {
     const weights = {
       turnCount: 0.4,
       length: 0.3,
       structure: 0.3
     };
     
     const composite = 
       turnCountScore * weights.turnCount +
       lengthScore * weights.length +
       structureScore * weights.structure;
     
     return Math.round(composite * 10) / 10; // Round to 1 decimal
   }
   ```

**Task 4: Conversation Generation Service (Orchestrator)**

Create file: `src/lib/services/conversation-generation-service.ts`

Implement `ConversationGenerationService` class that orchestrates all services:

1. **`generateSingleConversation(params: GenerationParams): Promise<Conversation>`**
   - Fetch template from database
   - Resolve template with parameters using `TemplateResolver`
   - Call `ClaudeAPIClient.generateConversation()` with resolved prompt
   - Parse Claude response into conversation structure
   - Validate quality using `QualityValidator`
   - Save to database using `conversationService`
   - Log generation details using `generationLogService`
   - Return complete conversation with quality metrics

2. **Orchestration Flow**:
   ```typescript
   async generateSingleConversation(params: GenerationParams): Promise<Conversation> {
     try {
       // Step 1: Get template
       const template = await this.getTemplate(params.templateId);
       
       // Step 2: Resolve template
       const prompt = await this.templateResolver.resolveTemplate(
         template,
         params.parameters
       );
       
       // Step 3: Call Claude API
       const response = await this.claudeClient.generateConversation(prompt, {
         conversationId: params.conversationId,
         templateId: params.templateId
       });
       
       // Step 4: Parse response
       const conversation = this.parseResponse(response, params);
       
       // Step 5: Validate quality
       const qualityMetrics = this.qualityValidator.validateConversation(conversation);
       conversation.qualityScore = qualityMetrics.overall;
       conversation.qualityMetrics = qualityMetrics;
       
       // Step 6: Determine status based on quality
       if (qualityMetrics.overall < 6) {
         conversation.status = 'needs_revision';
       } else {
         conversation.status = 'generated';
       }
       
       // Step 7: Save to database
       const savedConversation = await this.conversationService.create(
         conversation,
         conversation.turns
       );
       
       return savedConversation;
     } catch (error) {
       console.error('Error generating conversation:', error);
       throw error;
     }
   }
   ```

3. **Response Parsing**:
   ```typescript
   private parseResponse(response: any, params: GenerationParams): Conversation {
     // Claude returns JSON with conversation structure
     const parsed = JSON.parse(response.content);
     
     return {
       id: '', // Will be assigned by database
       conversation_id: params.conversationId || this.generateConversationId(),
       title: parsed.title || `${params.parameters.persona} - ${params.parameters.topic}`,
       persona: params.parameters.persona,
       emotion: params.parameters.emotion,
       topic: params.parameters.topic,
       tier: params.tier,
       category: params.category || [],
       status: 'generated',
       turns: parsed.turns.map((turn: any, index: number) => ({
         role: turn.role,
         content: turn.content,
         timestamp: new Date().toISOString(),
         tokenCount: this.estimateTokens(turn.content)
       })),
       totalTurns: parsed.turns.length,
       totalTokens: response.usage.input_tokens + response.usage.output_tokens,
       parameters: params.parameters,
       reviewHistory: [],
       actual_cost_usd: response.cost,
       generation_duration_ms: response.durationMs,
       created_by: params.userId,
       // ...
     };
   }
   ```

**ACCEPTANCE CRITERIA:**

1. Claude API client successfully generates conversations with valid prompts
2. Rate limiter prevents exceeding 50 requests/minute
3. Retry logic handles transient API errors (429, 5xx)
4. Template resolver correctly replaces all {{placeholders}}
5. Quality validator produces consistent scores for same input
6. Conversations with quality score < 6 automatically flagged for review
7. All API interactions logged with request/response payloads
8. Cost calculations accurate based on token usage

**TECHNICAL SPECIFICATIONS:**

**Environment Variables Required:**
```env
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-5-20250929
ANTHROPIC_MAX_TOKENS=4096
ANTHROPIC_TEMPERATURE=0.7
RATE_LIMIT_RPM=50
```

**Error Handling Pattern:**
```typescript
try {
  const conversation = await generationService.generateSingleConversation(params);
  return conversation;
} catch (error) {
  if (error instanceof APIError) {
    if (error.retryable) {
      // Retry logic already handled, this is after max attempts
      return { error: 'API temporarily unavailable. Try again later.' };
    } else {
      return { error: error.message };
    }
  }
  throw error;
}
```

**Prompt Template Format**:
```
You are an AI assistant generating a training conversation for LoRA fine-tuning.

CONVERSATION PARAMETERS:
- Persona: {{persona}}
- Emotion: {{emotion}}
- Topic: {{topic}}
- Intent: {{intent}}
- Tone: {{tone}}

INSTRUCTIONS:
Generate a natural, realistic conversation between a user (with the specified persona and emotion) and an AI assistant discussing the topic. The conversation should demonstrate the assistant's ability to understand context, provide accurate information, and adapt to the user's emotional state.

REQUIREMENTS:
- Generate 8-16 turns (alternating user/assistant)
- Each turn should be 100-500 characters
- Maintain consistency with persona and emotion throughout
- Include natural conversation flow (greetings, follow-ups, conclusion)

OUTPUT FORMAT:
Return ONLY valid JSON with this structure:
{
  "title": "Brief descriptive title",
  "turns": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."},
    ...
  ]
}
```

**VALIDATION REQUIREMENTS:**

1. **Unit Tests** (`src/lib/services/__tests__/claude-api-client.test.ts`):
   ```typescript
   describe('ClaudeAPIClient', () => {
     it('should respect rate limits', async () => {
       const client = new ClaudeAPIClient({ maxRequests: 2 });
       const start = Date.now();
       await Promise.all([
         client.generate(prompt),
         client.generate(prompt),
         client.generate(prompt) // Should wait
       ]);
       const elapsed = Date.now() - start;
       expect(elapsed).toBeGreaterThan(1000); // Rate limited
     });
     
     it('should retry on 429 errors', async () => {
       // Mock API returning 429, then 200
       // Verify retry occurred
     });
   });
   ```

2. **Integration Test**:
   ```typescript
   describe('ConversationGenerationService', () => {
     it('should generate conversation end-to-end', async () => {
       const params = {
         templateId: 'test-template',
         parameters: {
           persona: 'Anxious Investor',
           emotion: 'Worried',
           topic: 'Market Volatility',
           intent: 'seek_reassurance',
           tone: 'concerned'
         },
         tier: 'template',
         userId: 'test-user'
       };
       
       const conversation = await service.generateSingleConversation(params);
       
       expect(conversation.id).toBeDefined();
       expect(conversation.turns).toHaveLength(expect.any(Number));
       expect(conversation.qualityScore).toBeGreaterThan(0);
     });
   });
   ```

**DELIVERABLES:**

1. `src/lib/services/claude-api-client.ts` - Claude API integration with rate limiting
2. `src/lib/services/template-resolver.ts` - Template parameter injection
3. `src/lib/services/quality-validator.ts` - Automated quality scoring
4. `src/lib/services/conversation-generation-service.ts` - Orchestration layer
5. Update `src/lib/services/index.ts` to export new services
6. Unit tests for each service (recommended)

Implement these services completely, ensuring robust error handling, accurate cost tracking, and consistent quality validation. These are the core engines powering conversation generation.

++++++++++++++++++

---

### Prompt 3: Batch Generation Service & Orchestration

**Scope**: Implement batch job orchestration with queue processing, progress tracking, and error recovery  
**Dependencies**: Prompt 1 (database services), Prompt 2 (single generation service)  
**Estimated Time**: 14-18 hours  
**Risk Level**: High

========================

You are a senior backend developer implementing the batch generation orchestration system for the Interactive LoRA Conversation Generation platform. This service enables users to generate 90-100 conversations automatically with real-time progress tracking and error recovery.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
Batch generation is the core value proposition - allowing users to generate complete datasets (90-100 conversations) in hours instead of weeks. This service orchestrates parallel processing of multiple conversations while respecting API rate limits, handling failures gracefully, and providing real-time progress updates.

**Functional Requirements Being Implemented:**
- FR4.1.1: Generate All Tiers workflow with progress tracking and cancellation
- FR4.1.2: Tier-specific batch generation with configurable parameters
- T-2.2.0: Batch generation orchestration with concurrency control (default 3 parallel)
- T-2.2.1: Batch job manager with state machine (queued → processing → completed/failed)
- T-2.2.2: Cost and time estimation before starting batch

**Technical Architecture:**
- **Concurrency**: Process 3 conversations in parallel (configurable 1-10)
- **Error Handling**: Continue on individual failures (configurable: continue/stop)
- **Progress Updates**: Update database every conversation completion for real-time tracking
- **Pause/Resume**: Support job cancellation and resume capability
- **Cost Tracking**: Track actual cost vs. estimated cost

**CURRENT CODEBASE STATE:**

**Available Services** (from Prompts 1 & 2):
```typescript
// From Prompt 1
import { conversationService, batchJobService } from './conversation-service';

// From Prompt 2  
import { conversationGenerationService } from './conversation-generation-service';
```

**Type Definitions** (`train-wireframe/src/lib/types.ts`):
```typescript
export type BatchJob = {
  id: string;
  name: string;
  status: 'queued' | 'processing' | 'paused' | 'completed' | 'failed' | 'cancelled';
  totalItems: number;
  completedItems: number;
  failedItems: number;
  successfulItems: number;
  startedAt?: string;
  completedAt?: string;
  estimatedTimeRemaining?: number;
  priority: 'high' | 'normal' | 'low';
  items: BatchItem[];
  configuration: {
    tier: TierType;
    sharedParameters: Record<string, any>;
    concurrentProcessing: number;
    errorHandling: 'continue' | 'stop';
  };
};

export type BatchItem = {
  id: string;
  position: number;
  topic: string;
  tier: TierType;
  parameters: Record<string, any>;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  estimatedTime?: number;
  conversationId?: string;
  error?: string;
};
```

**IMPLEMENTATION TASKS:**

**Task 1: Batch Generation Orchestration Service**

Create file: `src/lib/services/batch-generation-service.ts`

Implement `BatchGenerationService` class with these methods:

1. **`startBatchGeneration(config: BatchGenerationConfig): Promise<BatchJob>`**
   - Create batch job in database with status 'queued'
   - Create batch items for all conversations to generate
   - Start background processing (async, don't await)
   - Return job immediately with job ID for tracking
   
2. **`processBatchJob(jobId: string): Promise<void>`**
   - Fetch job from database
   - Update status to 'processing', set startedAt timestamp
   - Process items in parallel (respect concurrentProcessing config)
   - Update progress after each conversation completes
   - Handle errors based on errorHandling config (continue/stop)
   - Update status to 'completed' or 'failed' when done
   - Set completedAt timestamp

3. **`pauseJob(jobId: string): Promise<BatchJob>`**
   - Set job status to 'paused'
   - Current conversations complete, new ones don't start
   - Return updated job

4. **`resumeJob(jobId: string): Promise<BatchJob>`**
   - Set job status from 'paused' back to 'processing'
   - Continue processing remaining queued items
   - Return updated job

5. **`cancelJob(jobId: string): Promise<BatchJob>`**
   - Set job status to 'cancelled'
   - Stop processing new conversations
   - Return updated job with final counts

6. **`getJobStatus(jobId: string): Promise<BatchJobStatus>`**
   - Fetch current job state from database
   - Calculate progress percentage
   - Estimate time remaining based on completed items
   - Return job status with progress data

**Concurrency Control Pattern**:
```typescript
async processBatchJob(jobId: string): Promise<void> {
  const job = await batchJobService.getJobById(jobId);
  
  // Update to processing
  await batchJobService.updateJobStatus(jobId, 'processing');
  await batchJobService.updateJob(jobId, { started_at: new Date().toISOString() });
  
  // Get queued items
  const queuedItems = job.items.filter(item => item.status === 'queued');
  
  const concurrency = job.configuration.concurrentProcessing;
  const errorHandling = job.configuration.errorHandling;
  
  try {
    // Process in batches of N concurrent items
    for (let i = 0; i < queuedItems.length; i += concurrency) {
      const batch = queuedItems.slice(i, i + concurrency);
      
      // Check if job was paused/cancelled
      const currentJob = await batchJobService.getJobById(jobId);
      if (currentJob.status === 'paused' || currentJob.status === 'cancelled') {
        console.log(`Job ${jobId} ${currentJob.status}. Stopping processing.`);
        return;
      }
      
      // Process batch in parallel
      const results = await Promise.allSettled(
        batch.map(item => this.processItem(jobId, item))
      );
      
      // Handle errors
      const anyFailed = results.some(r => r.status === 'rejected');
      if (anyFailed && errorHandling === 'stop') {
        throw new Error('Batch processing stopped due to error (errorHandling: stop)');
      }
    }
    
    // All items processed
    await batchJobService.updateJobStatus(jobId, 'completed');
    await batchJobService.updateJob(jobId, { 
      completed_at: new Date().toISOString() 
    });
    
  } catch (error) {
    console.error(`Batch job ${jobId} failed:`, error);
    await batchJobService.updateJobStatus(jobId, 'failed');
    throw error;
  }
}

private async processItem(jobId: string, item: BatchItem): Promise<void> {
  try {
    // Update item status
    await batchJobService.updateItemStatus(item.id, 'processing');
    
    // Generate conversation
    const conversation = await conversationGenerationService.generateSingleConversation({
      templateId: item.parameters.templateId,
      parameters: item.parameters,
      tier: item.tier,
      userId: item.parameters.userId,
      conversationId: `${item.tier}_${item.position}`
    });
    
    // Update item as completed
    await batchJobService.updateItemStatus(item.id, 'completed');
    await batchJobService.updateItem(item.id, {
      conversation_id: conversation.id,
      progress: 100
    });
    
    // Increment job progress
    await batchJobService.incrementProgress(jobId, item.id, 'completed');
    
  } catch (error) {
    console.error(`Item ${item.id} failed:`, error);
    
    // Update item as failed
    await batchJobService.updateItemStatus(item.id, 'failed');
    await batchJobService.updateItem(item.id, {
      error: error.message
    });
    
    // Increment job failed count
    await batchJobService.incrementProgress(jobId, item.id, 'failed');
    
    throw error;
  }
}
```

**Task 2: Cost & Time Estimation Service**

Create file: `src/lib/services/batch-estimator.ts`

Implement `BatchEstimator` class:

1. **`estimateBatchCost(conversationCount: number, tier?: TierType): Promise<CostEstimate>`**
   - Calculate based on average token counts per tier
   - Template tier: ~2000 input + ~3000 output tokens = ~$0.25 per conversation
   - Scenario tier: ~2500 input + ~4000 output tokens = ~$0.34 per conversation
   - Edge case tier: ~3000 input + ~5000 output tokens = ~$0.42 per conversation
   - Return total estimated cost

2. **`estimateBatchTime(conversationCount: number, concurrency: number, rateLimit: number): Promise<TimeEstimate>`**
   - Calculate based on: (conversationCount / concurrency) * avgGenerationTime
   - Average generation time: 20 seconds per conversation
   - Factor in rate limiting: max 50 requests/minute = 1.2 second min spacing
   - Return estimated duration in minutes

3. **`getHistoricalAverage(tier?: TierType): Promise<HistoricalStats>`**
   - Query generation_logs table for past generations
   - Calculate average cost, tokens, duration per tier
   - Use for more accurate estimates

**Estimation Logic**:
```typescript
async estimateBatchCost(
  conversationCount: number,
  tier?: TierType
): Promise<CostEstimate> {
  // Token estimates per tier (from historical data or defaults)
  const tokenEstimates = {
    template: { input: 2000, output: 3000 },
    scenario: { input: 2500, output: 4000 },
    edge_case: { input: 3000, output: 5000 }
  };
  
  // Claude pricing: $0.015/1K input, $0.075/1K output
  const inputPricePer1K = 0.015;
  const outputPricePer1K = 0.075;
  
  const estimate = tier 
    ? tokenEstimates[tier]
    : tokenEstimates.scenario; // Default to scenario
  
  const costPerConversation = 
    (estimate.input / 1000 * inputPricePer1K) +
    (estimate.output / 1000 * outputPricePer1K);
  
  const totalCost = costPerConversation * conversationCount;
  
  return {
    conversationCount,
    costPerConversation,
    totalCost,
    inputTokensPerConversation: estimate.input,
    outputTokensPerConversation: estimate.output
  };
}

async estimateBatchTime(
  conversationCount: number,
  concurrency: number,
  rateLimit: number = 50 // requests per minute
): Promise<TimeEstimate> {
  const avgGenerationTimeSeconds = 20;
  
  // Time without rate limiting
  const baseTimeSeconds = 
    (conversationCount / concurrency) * avgGenerationTimeSeconds;
  
  // Add rate limiting overhead
  const requestsPerMinute = rateLimit;
  const maxRequestsPerSecond = requestsPerMinute / 60;
  const actualConcurrency = Math.min(concurrency, maxRequestsPerSecond);
  
  const adjustedTimeSeconds = 
    (conversationCount / actualConcurrency) * avgGenerationTimeSeconds;
  
  return {
    estimatedTimeSeconds: Math.ceil(adjustedTimeSeconds),
    estimatedTimeMinutes: Math.ceil(adjustedTimeSeconds / 60),
    estimatedTimeFormatted: this.formatDuration(adjustedTimeSeconds)
  };
}

private formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `~${hours}h ${minutes}m`;
  } else {
    return `~${minutes} minutes`;
  }
}
```

**Task 3: Progress Tracking & Real-Time Updates**

Add to `BatchGenerationService`:

1. **`calculateProgress(jobId: string): Promise<ProgressData>`**
   - Calculate percentage: (completedItems / totalItems) * 100
   - Calculate items per minute based on elapsed time
   - Estimate time remaining: (remainingItems / itemsPerMinute)
   - Return progress data structure

2. **Progress Update Pattern**:
```typescript
private async updateProgress(jobId: string): Promise<void> {
  const job = await batchJobService.getJobById(jobId);
  
  // Calculate progress percentage
  const progressPct = (job.completedItems / job.totalItems) * 100;
  
  // Calculate elapsed time
  const startTime = new Date(job.startedAt).getTime();
  const now = Date.now();
  const elapsedMs = now - startTime;
  const elapsedMinutes = elapsedMs / (1000 * 60);
  
  // Calculate rate
  const itemsPerMinute = job.completedItems / elapsedMinutes;
  
  // Estimate time remaining
  const remainingItems = job.totalItems - job.completedItems;
  const estimatedMinutesRemaining = remainingItems / itemsPerMinute;
  
  // Update job
  await batchJobService.updateJob(jobId, {
    progress: progressPct,
    estimated_time_remaining: `${Math.ceil(estimatedMinutesRemaining)} minutes`
  });
}
```

**ACCEPTANCE CRITERIA:**

1. Batch job processes conversations in parallel (respecting concurrency config)
2. Progress updates after each conversation completion
3. Job can be paused and resumed without data loss
4. Job can be cancelled, stopping new conversations but completing in-progress ones
5. Error handling respects configuration (continue/stop on failure)
6. Cost estimation accurate within 10% margin
7. Time estimation accurate within 20% margin
8. Failed conversations logged with error messages for debugging

**TECHNICAL SPECIFICATIONS:**

**Batch Generation Configuration**:
```typescript
interface BatchGenerationConfig {
  name: string;
  tier?: TierType; // undefined = all tiers
  conversationIds?: string[]; // specific conversations, or generate all
  templateId?: string; // use specific template
  sharedParameters: Record<string, any>; // applied to all conversations
  concurrentProcessing: number; // 1-10, default 3
  errorHandling: 'continue' | 'stop'; // default 'continue'
  priority: 'high' | 'normal' | 'low'; // default 'normal'
  userId: string;
}
```

**Progress Data Structure**:
```typescript
interface ProgressData {
  jobId: string;
  status: BatchJobStatus;
  progress: number; // percentage
  totalItems: number;
  completedItems: number;
  failedItems: number;
  successfulItems: number;
  currentItem?: string; // item being processed
  elapsedTime: string; // "15 minutes"
  estimatedTimeRemaining: string; // "30 minutes"
  itemsPerMinute: number;
}
```

**VALIDATION REQUIREMENTS:**

1. **Integration Test** (`src/lib/services/__tests__/batch-generation-service.test.ts`):
```typescript
describe('BatchGenerationService', () => {
  it('should process batch with 10 conversations', async () => {
    const config = {
      name: 'Test Batch',
      tier: 'template',
      conversationIds: Array(10).fill(null).map((_, i) => `test_${i}`),
      sharedParameters: { persona: 'Test', emotion: 'Neutral' },
      concurrentProcessing: 3,
      errorHandling: 'continue',
      userId: 'test-user'
    };
    
    const job = await service.startBatchGeneration(config);
    expect(job.id).toBeDefined();
    expect(job.status).toBe('queued');
    
    // Wait for processing to complete
    await service.processBatchJob(job.id);
    
    const finalJob = await batchJobService.getJobById(job.id);
    expect(finalJob.status).toBe('completed');
    expect(finalJob.completedItems).toBe(10);
  });
  
  it('should handle individual conversation failures gracefully', async () => {
    // Mock one conversation to fail
    // Verify batch continues and marks only that item as failed
  });
  
  it('should respect pause and resume', async () => {
    // Start batch, pause after 3 items, verify no new items start
    // Resume, verify processing continues
  });
});
```

2. **Manual Testing Checklist**:
- [ ] Start batch with 20 conversations - verify all complete
- [ ] Monitor progress updates - verify they occur after each conversation
- [ ] Pause job mid-processing - verify it stops starting new conversations
- [ ] Resume job - verify it continues from where it left off
- [ ] Cancel job - verify it stops and marks remaining as cancelled
- [ ] Set concurrency to 1 - verify sequential processing
- [ ] Set error handling to 'stop' - verify batch stops on first error
- [ ] Compare estimated vs actual cost/time - verify accuracy

**DELIVERABLES:**

1. `src/lib/services/batch-generation-service.ts` - Batch orchestration
2. `src/lib/services/batch-estimator.ts` - Cost and time estimation
3. Update `src/lib/services/index.ts` to export new services
4. Integration tests for batch processing

Implement this batch generation system completely, ensuring robust error handling, accurate progress tracking, and the ability to process 90-100 conversations efficiently and reliably. This is the core automation that delivers the platform's primary value proposition.

++++++++++++++++++

---

### Prompt 4: Generation API Endpoints

**Scope**: Implement REST API endpoints for conversation generation operations  
**Dependencies**: Prompts 1-3 (all backend services)  
**Estimated Time**: 10-12 hours  
**Risk Level**: Medium

========================

You are a senior backend developer implementing the REST API endpoints for the Interactive LoRA Conversation Generation platform. These endpoints expose the backend services to the frontend, handling HTTP requests, authentication, validation, and error responses.

**CONTEXT AND REQUIREMENTS:**

Implement Next.js 14 App Router API routes following existing patterns in `src/app/api/chunks/`. Create these endpoints:

**API Endpoints to Implement:**

**1. POST /api/conversations/generate** (Single Generation)
- **Request Body**: `{ templateId, parameters, tier, userId }`
- **Response**: `{ conversation, qualityMetrics, cost }`
- **Implementation**: `src/app/api/conversations/generate/route.ts`
- Call `conversationGenerationService.generateSingleConversation()`
- Validate request with Zod schema
- Return 201 Created with conversation data
- Handle errors with appropriate status codes (400, 500)

**2. POST /api/conversations/generate-batch** (Batch Generation)
- **Request Body**: `{ name, tier?, conversationIds?, sharedParameters, concurrentProcessing, errorHandling }`
- **Response**: `{ jobId, status, estimatedCost, estimatedTime }`
- **Implementation**: `src/app/api/conversations/generate-batch/route.ts`
- Estimate cost/time before starting (show to user)
- Call `batchGenerationService.startBatchGeneration()`
- Start processing in background (don't await)
- Return 202 Accepted with job ID

**3. GET /api/conversations/batch/:id/status** (Progress Polling)
- **Response**: `{ jobId, status, progress, completedItems, failedItems, estimatedTimeRemaining }`
- **Implementation**: `src/app/api/conversations/batch/[id]/status/route.ts`
- Call `batchGenerationService.getJobStatus(jobId)`
- Return current progress state
- Support polling every 2-5 seconds

**4. PATCH /api/conversations/batch/:id** (Control Batch)
- **Request Body**: `{ action: 'pause' | 'resume' | 'cancel' }`
- **Response**: `{ jobId, status }`
- **Implementation**: `src/app/api/conversations/batch/[id]/route.ts`
- Call `pauseJob()`, `resumeJob()`, or `cancelJob()`
- Return updated job status

**5. GET /api/conversations** (List Conversations)
- **Query Params**: `tier, status, qualityScoreMin, qualityScoreMax, limit, offset`
- **Response**: `{ conversations: [], total, page }`
- **Implementation**: `src/app/api/conversations/route.ts`
- Call `conversationService.getAll(filters)`
- Support pagination
- Return conversation list without full turns (performance)

**6. GET /api/conversations/:id** (Get Single Conversation)
- **Response**: `{ conversation with full turns }`
- **Implementation**: `src/app/api/conversations/[id]/route.ts`
- Call `conversationService.getById(id)`
- Return complete conversation with all turns

**7. PATCH /api/conversations/:id** (Update Conversation)
- **Request Body**: `{ status?, qualityScore?, reviewerNotes?, reviewAction? }`
- **Response**: `{ conversation }`
- **Implementation**: `src/app/api/conversations/[id]/route.ts`
- Call `conversationService.update(id, updates)`
- Support status transitions (approve/reject)
- Append review actions to history

**API Pattern Example**:
```typescript
// src/app/api/conversations/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { conversationGenerationService } from '@/lib/services';
import { z } from 'zod';

const GenerateRequestSchema = z.object({
  templateId: z.string(),
  parameters: z.record(z.any()),
  tier: z.enum(['template', 'scenario', 'edge_case']),
  userId: z.string()
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json();
    const validated = GenerateRequestSchema.parse(body);
    
    // Generate conversation
    const conversation = await conversationGenerationService
      .generateSingleConversation(validated);
    
    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        conversation,
        cost: conversation.actual_cost_usd 
      },
      { status: 201 }
    );
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Generation failed' },
      { status: 500 }
    );
  }
}
```

**ACCEPTANCE CRITERIA:**

1. All endpoints implement proper error handling with status codes
2. Request validation using Zod schemas
3. Authentication checks (verify userId from session)
4. CORS headers configured for allowed origins
5. Response formats consistent across all endpoints
6. Batch endpoints return immediately (async processing)
7. Polling endpoint performs efficiently (<100ms query time)

**DELIVERABLES:**

1. `src/app/api/conversations/generate/route.ts`
2. `src/app/api/conversations/generate-batch/route.ts`
3. `src/app/api/conversations/batch/[id]/status/route.ts`
4. `src/app/api/conversations/batch/[id]/route.ts`
5. `src/app/api/conversations/route.ts`
6. `src/app/api/conversations/[id]/route.ts`

Test all endpoints with Postman/curl to verify request/response formats and error handling.

++++++++++++++++++

---

### Prompt 5: Frontend - Batch Generation Modal

**Scope**: Implement batch generation UI with configuration, preview, progress, and summary steps  
**Dependencies**: Prompt 4 (API endpoints)  
**Estimated Time**: 14-18 hours  
**Risk Level**: Medium

========================

You are a senior frontend developer implementing the Batch Generation Modal for the Interactive LoRA Conversation Generation platform. This is the primary UI for users to generate 90-100 conversations automatically.

**CONTEXT AND REQUIREMENTS:**

Implement a multi-step modal wizard based on existing wireframe component `train-wireframe/src/components/generation/BatchGenerationModal.tsx`. Use Shadcn/UI Dialog component and Zustand for state management.

**Component Structure:**

```
<BatchGenerationModal>
  <Step1_Configuration />    // Select tier, configure parameters
  <Step2_Preview />          // Show generation plan, cost/time estimates
  <Step3_Progress />         // Real-time progress with cancel option
  <Step4_Summary />          // Completion statistics, success/failure counts
</BatchGenerationModal>
```

**Implementation Tasks:**

**Task 1: Modal Shell & State Management**
- Create `train-wireframe/src/components/generation/BatchGenerationModal.tsx`
- Use Zustand store to manage modal state: `isOpen`, `currentStep`, `batchConfig`
- Implement step navigation (next, back, close)
- Add confirmation dialog before closing during generation

**Task 2: Step 1 - Configuration**
- Tier selector: All Tiers, Template Only, Scenario Only, Edge Case Only
- Conversation count display (calculated based on tier)
- Error handling mode: Continue on Error / Stop on Error
- Concurrency slider: 1-5 parallel conversations
- Shared parameters section (optional key-value pairs)
- Next button validates configuration

**Task 3: Step 2 - Preview & Estimation**
- Call `/api/conversations/batch/estimate` to get cost/time
- Display: "Generating X conversations across Y tiers"
- Show estimated cost: "$8.50" (with breakdown)
- Show estimated time: "~45 minutes"
- Configuration summary (tier, error handling, concurrency)
- Back button returns to config, Start button begins generation

**Task 4: Step 3 - Progress Tracking**
- Call `/api/conversations/generate-batch` to start job
- Poll `/api/conversations/batch/:id/status` every 3 seconds
- Display progress bar with percentage
- Show current item: "Generating conversation 42 of 100..."
- Show elapsed time: "15 minutes elapsed"
- Show estimated time remaining: "30 minutes remaining"
- Cancel button calls `/api/conversations/batch/:id` with action: 'cancel'

**Task 5: Step 4 - Summary**
- Display completion statistics:
  - Total generated: 100
  - Successful: 95 (green)
  - Failed: 5 (red, with "View Errors" link)
  - Total cost: $9.20 (vs estimated $8.50)
  - Total time: 48 minutes
- Actions: Close Modal, View Conversations, Regenerate Failed
- Success toast notification with key stats

**React Component Pattern**:
```typescript
export function BatchGenerationModal() {
  const { isOpen, currentStep, closeModal } = useBatchGenerationStore();
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  
  // Poll for progress
  useEffect(() => {
    if (!jobId || currentStep !== 3) return;
    
    const interval = setInterval(async () => {
      const response = await fetch(`/api/conversations/batch/${jobId}/status`);
      const data = await response.json();
      setProgress(data);
      
      if (data.status === 'completed' || data.status === 'failed') {
        clearInterval(interval);
        setCurrentStep(4); // Move to summary
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [jobId, currentStep]);
  
  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="max-w-2xl">
        {currentStep === 1 && <ConfigurationStep />}
        {currentStep === 2 && <PreviewStep />}
        {currentStep === 3 && <ProgressStep progress={progress} />}
        {currentStep === 4 && <SummaryStep progress={progress} />}
      </DialogContent>
    </Dialog>
  );
}
```

**ACCEPTANCE CRITERIA:**

1. Modal opens from "Generate All" button in dashboard header
2. Configuration step validates input before allowing next
3. Preview step shows accurate cost/time estimates
4. Progress step updates in real-time every 3 seconds
5. Cancel button stops generation gracefully
6. Summary step shows complete statistics
7. Modal state persists if user closes browser (job continues)
8. Keyboard navigation supported (Tab, Enter, ESC)

**DELIVERABLES:**

1. `train-wireframe/src/components/generation/BatchGenerationModal.tsx`
2. `train-wireframe/src/components/generation/BatchConfigStep.tsx`
3. `train-wireframe/src/components/generation/BatchPreviewStep.tsx`
4. `train-wireframe/src/components/generation/BatchProgressStep.tsx`
5. `train-wireframe/src/components/generation/BatchSummaryStep.tsx`
6. Update Zustand store with batch generation actions

Test complete workflow: Configure → Preview → Start → Monitor Progress → Review Summary

++++++++++++++++++

---

### Prompt 6: Frontend - Single Generation Form & Regeneration

**Scope**: Implement single conversation generation form and regeneration workflow  
**Dependencies**: Prompt 4 (API endpoints)  
**Estimated Time**: 10-12 hours  
**Risk Level**: Low

========================

You are a senior frontend developer implementing the Single Generation Form and Regeneration workflow for the Interactive LoRA Conversation Generation platform.

**Component Requirements:**

**Single Generation Form** (`train-wireframe/src/components/generation/SingleGenerationForm.tsx`):

1. **Form Fields**:
   - Template selector (dropdown, fetch from `/api/templates`)
   - Persona selector (dropdown with predefined personas)
   - Emotion selector (dropdown with emotion options)
   - Topic input (text field)
   - Intent selector (dropdown)
   - Tone selector (dropdown)
   - Custom parameters (dynamic key-value pairs)

2. **Template Preview Pane**:
   - Shows resolved template with parameter substitution
   - Highlight {{placeholders}} before filling
   - Live update as user changes parameters

3. **Generation Execution**:
   - Validate form before submission
   - Call `/api/conversations/generate`
   - Show loading spinner during generation (15-45 seconds)
   - Display conversation preview on success
   - Show error message with retry button on failure

4. **Conversation Preview**:
   - Turn-by-turn display (USER: / ASSISTANT:)
   - Quality score with color coding
   - Save button to persist to database
   - Regenerate button to try again with same parameters

**Regeneration Workflow**:

1. **Trigger**: Add "Regenerate" action to conversation dropdown menu in `ConversationTable.tsx`

2. **Pre-fill Form**: When regenerate clicked:
   - Open single generation form modal
   - Pre-fill all fields with existing conversation metadata
   - Allow user to modify parameters before regenerating

3. **Archival Logic**:
   - Call `/api/conversations/:id/regenerate` endpoint
   - Original conversation status set to 'archived'
   - New conversation created with `parentId` linking to original
   - Version history displayed showing regeneration chain

**React Component Pattern**:
```typescript
export function SingleGenerationForm({ conversationId, onClose }: Props) {
  const [formData, setFormData] = useState<GenerationParams>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<Conversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/conversations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setResult(data.conversation);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };
  
  if (result) {
    return <ConversationPreview conversation={result} onSave={onClose} />;
  }
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Single Conversation</DialogTitle>
        </DialogHeader>
        
        <Form onSubmit={handleGenerate}>
          {/* Form fields */}
          <Select name="template" onChange={(value) => setFormData({...formData, templateId: value})}>
            {/* Template options */}
          </Select>
          
          {/* More fields... */}
          
          <Button type="submit" disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate Conversation'}
          </Button>
          
          {error && <Alert variant="destructive">{error}</Alert>}
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

**ACCEPTANCE CRITERIA:**

1. Form validates all required fields before submission
2. Template preview updates live as user types
3. Generation completes in 15-45 seconds with loading state
4. Success shows conversation preview with save option
5. Error displays with retry button
6. Regenerate action pre-fills form with existing data
7. Version history visible in conversation detail view
8. Toast notification confirms successful regeneration

**DELIVERABLES:**

1. `train-wireframe/src/components/generation/SingleGenerationForm.tsx`
2. `train-wireframe/src/components/generation/TemplatePreview.tsx`
3. `train-wireframe/src/components/generation/ConversationPreview.tsx`
4. Update `train-wireframe/src/components/dashboard/ConversationTable.tsx` with regenerate action

Test single generation workflow end-to-end and regeneration with version linking.

++++++++++++++++++

---

### Prompt 7: Quality Assurance & Testing

**Scope**: Comprehensive testing suite for all conversation generation functionality  
**Dependencies**: All previous prompts  
**Estimated Time**: 12-16 hours  
**Risk Level**: Medium

========================

You are a senior QA engineer implementing comprehensive testing for the Interactive LoRA Conversation Generation platform. Your tests ensure reliability, quality, and performance across the full system.

**Testing Strategy:**

**1. Unit Tests (Jest)**

Create test files for all services:

```typescript
// src/lib/services/__tests__/conversation-service.test.ts
describe('conversationService', () => {
  it('should create conversation with turns in transaction', async () => {
    const conversation = { /* mock data */ };
    const turns = [/* mock turns */];
    
    const result = await conversationService.create(conversation, turns);
    
    expect(result.id).toBeDefined();
    expect(result.turns).toHaveLength(turns.length);
  });
  
  it('should rollback conversation if turns insertion fails', async () => {
    // Mock database to fail on turns insert
    // Verify conversation not created
  });
  
  it('should filter conversations by tier and status', async () => {
    const filters = { tier: ['template'], status: ['approved'] };
    const results = await conversationService.getAll(filters);
    
    expect(results.every(c => c.tier === 'template')).toBe(true);
    expect(results.every(c => c.status === 'approved')).toBe(true);
  });
});
```

**2. Integration Tests (Supertest)**

Test API endpoints with real database:

```typescript
// src/app/api/conversations/__tests__/generate.test.ts
describe('POST /api/conversations/generate', () => {
  it('should generate conversation with valid request', async () => {
    const response = await request(app)
      .post('/api/conversations/generate')
      .send({
        templateId: 'template-1',
        parameters: {
          persona: 'Anxious Investor',
          emotion: 'Worried',
          topic: 'Market Volatility'
        },
        tier: 'template',
        userId: 'test-user'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.conversation).toBeDefined();
    expect(response.body.cost).toBeGreaterThan(0);
  });
  
  it('should return 400 for invalid request', async () => {
    const response = await request(app)
      .post('/api/conversations/generate')
      .send({ /* invalid data */ });
    
    expect(response.status).toBe(400);
  });
});
```

**3. Component Tests (React Testing Library)**

Test React components with user interactions:

```typescript
// train-wireframe/src/components/__tests__/BatchGenerationModal.test.tsx
describe('BatchGenerationModal', () => {
  it('should display configuration step initially', () => {
    render(<BatchGenerationModal />);
    
    expect(screen.getByText('Select Tier')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });
  
  it('should move to preview after configuration', async () => {
    render(<BatchGenerationModal />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText('Tier'), { target: { value: 'template' } });
    fireEvent.click(screen.getByText('Next'));
    
    await waitFor(() => {
      expect(screen.getByText('Generation Plan')).toBeInTheDocument();
    });
  });
  
  it('should start generation and show progress', async () => {
    render(<BatchGenerationModal />);
    
    // Navigate to preview and start
    // ... configuration steps ...
    fireEvent.click(screen.getByText('Start Generation'));
    
    await waitFor(() => {
      expect(screen.getByText(/Generating/)).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });
});
```

**4. End-to-End Tests**

Test critical user workflows:

1. **Complete Batch Generation Workflow**:
   - User clicks "Generate All"
   - Configures batch (tier, concurrency)
   - Reviews preview with estimates
   - Starts generation
   - Monitors progress
   - Views completion summary
   - Verifies conversations created in database

2. **Single Generation Workflow**:
   - User clicks "Generate Single"
   - Fills form with parameters
   - Previews resolved template
   - Generates conversation
   - Reviews result
   - Saves conversation

3. **Regeneration Workflow**:
   - User selects conversation
   - Clicks "Regenerate"
   - Modifies parameters
   - Regenerates
   - Verifies original archived
   - Confirms new conversation linked

**5. Performance Tests**

Benchmark critical operations:

```typescript
describe('Performance Tests', () => {
  it('should complete batch of 100 conversations within 60 minutes', async () => {
    const startTime = Date.now();
    
    const job = await batchGenerationService.startBatchGeneration({
      name: 'Performance Test',
      conversationIds: Array(100).fill(null).map((_, i) => `perf_${i}`),
      // ... config
    });
    
    await batchGenerationService.processBatchJob(job.id);
    
    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThan(60 * 60 * 1000); // 60 minutes
  });
  
  it('should query 10K conversations in <500ms', async () => {
    const start = Date.now();
    await conversationService.getAll({ limit: 100 });
    const elapsed = Date.now() - start;
    
    expect(elapsed).toBeLessThan(500);
  });
});
```

**Test Coverage Targets:**

- Service Layer: 85%+ coverage
- API Endpoints: 80%+ coverage
- React Components: 75%+ coverage
- Critical Paths: 100% coverage (generation workflows)

**ACCEPTANCE CRITERIA:**

1. All unit tests pass
2. All integration tests pass
3. All component tests pass
4. End-to-end workflows validated manually
5. Performance benchmarks met
6. Test coverage targets achieved
7. No linter errors
8. All tests documented

**DELIVERABLES:**

1. Unit test suites for all services
2. Integration test suites for all API endpoints
3. Component test suites for all React components
4. End-to-end test scripts
5. Performance benchmark tests
6. Test documentation and coverage reports

Run full test suite with `npm test` and verify all tests pass before deployment.

++++++++++++++++++

---

## Quality Validation Checklist

### Post-Implementation Verification

After completing all prompts, verify these criteria:

#### Database Layer
- [ ] All tables created with correct schemas
- [ ] All indexes created and being used (verify with EXPLAIN ANALYZE)
- [ ] RLS policies active and isolating user data correctly
- [ ] Triggers updating timestamps automatically
- [ ] Sample data inserted successfully for testing

#### Service Layer
- [ ] All CRUD operations working correctly
- [ ] Transaction logic properly rolls back on errors
- [ ] Rate limiting prevents exceeding API limits
- [ ] Retry logic handles transient errors
- [ ] Quality scoring produces consistent results
- [ ] All services properly exported from index.ts

#### API Layer
- [ ] All endpoints respond with correct status codes
- [ ] Request validation rejects invalid input
- [ ] Authentication checks enforce user isolation
- [ ] CORS headers configured for allowed origins
- [ ] Error responses formatted consistently
- [ ] Polling endpoint performs efficiently (<100ms)

#### Frontend Layer
- [ ] Batch modal navigates through all steps correctly
- [ ] Single generation form validates input
- [ ] Progress updates display in real-time
- [ ] Error states show user-friendly messages
- [ ] Loading states prevent duplicate submissions
- [ ] Toast notifications confirm actions
- [ ] Keyboard navigation works throughout
- [ ] Responsive design works on different screen sizes

#### Integration
- [ ] Frontend successfully calls all API endpoints
- [ ] Database updates reflected in UI immediately
- [ ] Progress polling doesn't cause performance issues
- [ ] Batch generation completes without data loss
- [ ] Regeneration correctly archives old conversations
- [ ] Cost tracking accumulates accurately
- [ ] Export includes only approved conversations

#### Performance
- [ ] Single conversation generates in <30 seconds
- [ ] Batch of 100 conversations completes in <60 minutes
- [ ] Database queries complete in <100ms for 10K records
- [ ] Table filtering responds in <300ms
- [ ] Progress polling doesn't degrade over time
- [ ] No memory leaks during long-running batches

#### Quality
- [ ] Test coverage meets targets (85%+ services, 75%+ UI)
- [ ] All linter errors resolved
- [ ] No console errors in browser
- [ ] All acceptance criteria from prompts met
- [ ] Error handling comprehensive and user-friendly
- [ ] Documentation complete and accurate

### Cross-Prompt Consistency
- [ ] Consistent naming conventions across all files
- [ ] Aligned TypeScript types between frontend/backend
- [ ] Compatible data models match database schema
- [ ] Error handling patterns consistent
- [ ] Logging format standardized
- [ ] API response formats uniform

---

## Next Segment Preparation

**What Has Been Implemented (E04):**
- Complete database schema for conversation generation
- Backend services: Claude API client, template resolver, quality validator, batch orchestration
- API endpoints for all generation operations
- Frontend UI: Batch generation modal, single generation form, regeneration workflow
- Real-time progress tracking and cost estimation
- Comprehensive testing suite

**What Should Be Implemented Next (E05 - if applicable):**
- Review Queue interface for human-in-the-loop approval
- Export functionality with multiple formats (JSONL, JSON, CSV, Markdown)
- Template, Scenario, and Edge Case management interfaces
- Analytics dashboard showing quality trends and coverage gaps
- Settings and configuration management
- Performance optimizations and caching strategies

**Technical Debt to Address:**
- Consider WebSocket implementation for real-time updates (currently using polling)
- Implement background job queue for very large batches (>500 conversations)
- Add comprehensive audit logging for compliance
- Implement data retention policies
- Add database backup and recovery procedures
- Performance profiling and optimization of slow queries

**Integration Points for Future Segments:**
- Chunks-Alpha module integration (linking conversations to source chunks)
- Advanced filtering by chunk dimensions
- Bulk operations (bulk approve, bulk regenerate, bulk delete)
- Advanced analytics and reporting
- Team collaboration features (assignment, comments)

---

## Summary

This execution instruction document provides 8 comprehensive, self-contained prompts that guide Claude-4.5-sonnet through implementing the complete Conversation Generation Workflows module. Each prompt includes:

✓ Complete context and requirements  
✓ Existing codebase patterns to follow  
✓ Detailed implementation tasks  
✓ Code examples and patterns  
✓ Acceptance criteria  
✓ Technical specifications  
✓ Validation requirements  
✓ Deliverables list  

**Total Implementation Time**: 80-100 hours (2-2.5 weeks for 2 backend + 2 frontend engineers)

**Success Criteria**: Users can generate 90-100 high-quality training conversations in hours instead of weeks, with full progress visibility, quality control, and cost transparency.

**Next Steps**: Execute Prompt 1 (Database Foundation) in Supabase SQL Editor, then proceed sequentially through Prompts 2-8, validating each before moving to the next.

---

**Document Complete**  
**Generated**: 2025-01-29  
**Version**: 1.0  
**Ready for Implementation**: Yes

